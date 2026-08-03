// app/api/admin/estimate-proforma/generate/route.ts
// POST → assigns one shared PI number, saves Estimate + Proforma metadata
// together against the quote row (AS-AW). Neither PDF is stored — both are
// rendered on demand by their respective /api/estimate|proforma/[quoteId] routes.

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { buildPINumber, piFinancialYearLabel, addDays, INVOICE_CONFIG } from "@/lib/invoice/config";
import { EstimateProformaLineItem } from "@/lib/invoice/EstimateProformaShared";

function sheetsClient() {
    const auth = new google.auth.JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return google.sheets({ version: "v4", auth });
}

function checkAdmin(req: NextRequest) {
    const pass = req.headers.get("x-admin-pass");
    return !!pass && pass === process.env.ADMIN_PASSWORD;
}

// Sheet layout: AS = PI Number, AT = PI Date, AU = Valid Until (proforma),
// AV = Doc Status, AW = Line Items (JSON), AX = Commercial Notes (JSON).
// Row 1 must have these exact header labels in those columns.
const COL_STATUS = "C"; // Status column
const COL_PI_NUMBER = "AS";
const COL_PI_DATE = "AT";
const COL_VALID_UNTIL = "AU";
const COL_DOC_STATUS = "AV";
const COL_LINE_ITEMS = "AW";
const COL_NOTES = "AX";
const COL_CUSTOMER_RESPONSE = "AY";       // ← ADD
const COL_CUSTOMER_RESPONSE_NOTES = "AZ"; // ← ADD
const COL_CUSTOMER_RESPONSE_AT = "BA";    // ← ADD
const COL_RESPONSE_HISTORY = "BB"; // ← wherever you keep other consts, or inline is fine here since this file doesn't have a const block — see below


interface NotesInput {
    scope?: string; delivery?: string; warranty?: string;
    freightPacking?: string; installation?: string; additionalNotes?: string;
}

// Derives a short customer code for the PI number (e.g. "Anjio MedTech" -> "ANJ").
// Falls back to "GEN" if the company name is too short/empty.
function customerCode(company: string): string {
    const clean = company.replace(/[^a-zA-Z]/g, "").toUpperCase();
    return clean.length >= 3 ? clean.slice(0, 3) : "GEN";
}

function parseRevision(piNumber: string): { base: string; revision: number } {
    const match = piNumber.match(/^(.*) Rev\.(\d+)$/);
    if (match) return { base: match[1], revision: parseInt(match[2], 10) };
    return { base: piNumber, revision: 0 };
}

export async function POST(req: NextRequest) {
    try {
        if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id, lineItems, notes, customerRefEnquiry, isRevision } = await req.json() as {
            id: string; lineItems?: EstimateProformaLineItem[]; notes?: NotesInput;
            customerRefEnquiry?: string; isRevision?: boolean;
        };
        if (!id) return NextResponse.json({ error: "Quote ID is required." }, { status: 400 });
        if (!Array.isArray(lineItems) || lineItems.length === 0) {
            return NextResponse.json({ error: "At least one line item is required." }, { status: 400 });
        }
        for (const item of lineItems) {
            if (!item.description?.trim() || !item.hsn?.trim() || !item.quantity || item.quantity <= 0 || !item.rate || item.rate <= 0) {
                return NextResponse.json({ error: "Each line item needs a description, HSN, quantity, and rate." }, { status: 400 });
            }
        }

        const sheets = sheetsClient();
        const sheetId = process.env.GOOGLE_SHEET_ID!;

        const idRes = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "Sheet1!A:A" });
        const rows = idRes.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);
        if (rowIndex < 1) return NextResponse.json({ error: "Quote not found." }, { status: 404 });
        const sheetRow = rowIndex + 1;

        const rowRes = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `Sheet1!F${sheetRow}` });
        const company = rowRes.data.values?.[0]?.[0] || "";
        const code = customerCode(company);

        const piDate = new Date();
        const validUntil = addDays(piDate, INVOICE_CONFIG.proformaValidityDays);
        let piNumber: string;

        if (isRevision) {
            // Revise in place: same PI number, bump the revision suffix.
            const existingRes = await sheets.spreadsheets.values.get({
                spreadsheetId: sheetId, range: `Sheet1!${COL_PI_NUMBER}${sheetRow}`,
            });
            const existingPI = existingRes.data.values?.[0]?.[0] || "";
            if (!existingPI) {
                return NextResponse.json({ error: "No existing PI number found to revise." }, { status: 400 });
            }
            const { base, revision } = parseRevision(existingPI);
            piNumber = `${base} Rev.${revision + 1}`;
        } else {
            // Fresh PI: scan for the highest sequence used this FY for this customer code.
            const fy = piFinancialYearLabel();
            const piRes = await sheets.spreadsheets.values.get({
                spreadsheetId: sheetId, range: `Sheet1!${COL_PI_NUMBER}:${COL_PI_NUMBER}`,
            });
            const piRows = piRes.data.values || [];
            let maxSeq = 0;
            for (const row of piRows) {
                const val = row[0];
                if (typeof val !== "string") continue;
                const match = val.match(new RegExp(`/${fy}/${code}-(\\d{3})$`));
                if (match) {
                    const seq = parseInt(match[1], 10);
                    if (seq > maxSeq) maxSeq = seq;
                }
            }
            piNumber = buildPINumber(code, maxSeq + 1);
        }

        const updateData: { range: string; values: string[][] }[] = [
            { range: `Sheet1!${COL_STATUS}${sheetRow}`, values: [["awaiting-response"]] },
            { range: `Sheet1!${COL_PI_NUMBER}${sheetRow}`, values: [[piNumber]] },
            { range: `Sheet1!${COL_PI_DATE}${sheetRow}`, values: [[piDate.toISOString()]] },
            { range: `Sheet1!${COL_VALID_UNTIL}${sheetRow}`, values: [[validUntil.toISOString()]] },
            { range: `Sheet1!${COL_DOC_STATUS}${sheetRow}`, values: [["active"]] },
            { range: `Sheet1!${COL_LINE_ITEMS}${sheetRow}`, values: [[JSON.stringify(lineItems)]] },
            {
                range: `Sheet1!${COL_NOTES}${sheetRow}`,
                values: [[JSON.stringify({ ...notes, customerRefEnquiry: customerRefEnquiry || "" })]],
            },
        ];

        // A revision clears the old negotiate flag/notes — the customer is
        // being handed a fresh version to respond to, not the stale request.
        // A revision clears the old negotiate flag/notes — the customer is
        // being handed a fresh version to respond to, not the stale request.
        // Before clearing, log this as a "revised" event in the history so
        // the admin panel timeline shows the full back-and-forth.
        if (isRevision) {
            const historyRes = await sheets.spreadsheets.values.get({
                spreadsheetId: sheetId, range: `Sheet1!${COL_RESPONSE_HISTORY}${sheetRow}`,
            });
            let history: { response: string; notes: string; at: string; piNumber: string }[] = [];
            try {
                history = JSON.parse(historyRes.data.values?.[0]?.[0] || "[]");
                if (!Array.isArray(history)) history = [];
            } catch { history = []; }
            history.push({ response: "revised", notes: "", at: piDate.toISOString(), piNumber });

            updateData.push(
                { range: `Sheet1!${COL_RESPONSE_HISTORY}${sheetRow}`, values: [[JSON.stringify(history)]] },
                { range: `Sheet1!${COL_CUSTOMER_RESPONSE}${sheetRow}`, values: [[""]] },
                { range: `Sheet1!${COL_CUSTOMER_RESPONSE_NOTES}${sheetRow}`, values: [[""]] },
                { range: `Sheet1!${COL_CUSTOMER_RESPONSE_AT}${sheetRow}`, values: [[""]] },
            );
        }

        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: { valueInputOption: "RAW", data: updateData },
        });

        return NextResponse.json({ success: true, piNumber, piDate: piDate.toISOString(), validUntil: validUntil.toISOString() });
    } catch (err) {
        console.error("Estimate/Proforma generation error:", err);
        return NextResponse.json({ error: "Failed to generate documents." }, { status: 500 });
    }
}

// PATCH → admin voids the PI documents. Number kept, not reused.
export async function PATCH(req: NextRequest) {
    try {
        if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: "Quote ID is required." }, { status: 400 });

        const sheets = sheetsClient();
        const sheetId = process.env.GOOGLE_SHEET_ID!;
        const idRes = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "Sheet1!A:A" });
        const rows = idRes.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);
        if (rowIndex < 1) return NextResponse.json({ error: "Quote not found." }, { status: 404 });

        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                valueInputOption: "RAW",
                data: [
                    {
                        range: `Sheet1!${COL_DOC_STATUS}${rowIndex + 1}`,
                        values: [["removed"]],
                    },
                    {
                        range: `Sheet1!${COL_STATUS}${rowIndex + 1}`,
                        values: [["in-progress"]],
                    },
                ],
            },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Estimate/Proforma void error:", err);
        return NextResponse.json({ error: "Failed to void documents." }, { status: 500 });
    }
}