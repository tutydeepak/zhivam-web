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
const COL_PI_NUMBER = "AS";
const COL_PI_DATE = "AT";
const COL_VALID_UNTIL = "AU";
const COL_DOC_STATUS = "AV";
const COL_LINE_ITEMS = "AW";
const COL_NOTES = "AX";

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

export async function POST(req: NextRequest) {
    try {
        if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id, lineItems, notes, customerRefEnquiry } = await req.json() as {
            id: string; lineItems?: EstimateProformaLineItem[]; notes?: NotesInput; customerRefEnquiry?: string;
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

        // Find the row for this quote.
        const idRes = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "Sheet1!A:A" });
        const rows = idRes.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);
        if (rowIndex < 1) return NextResponse.json({ error: "Quote not found." }, { status: 404 });
        const sheetRow = rowIndex + 1;

        // Get company name for the customer code (column F = "Company").
        const rowRes = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `Sheet1!F${sheetRow}` });
        const company = rowRes.data.values?.[0]?.[0] || "";
        const code = customerCode(company);

        // Scan the PI Number column to find the highest sequence used so far,
        // for this customer code + current FY, so numbers never collide.
        const fy = piFinancialYearLabel();
        const piRes = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: `Sheet1!${COL_PI_NUMBER}:${COL_PI_NUMBER}`,
        });
        const piRows = piRes.data.values || [];
        let maxSeq = 0;
        for (const row of piRows) {
            const val = row[0];
            if (typeof val !== "string") continue;
            // e.g. ZPL/PI/2026-27/ANJ-007
            const match = val.match(new RegExp(`/${fy}/${code}-(\\d{3})$`));
            if (match) {
                const seq = parseInt(match[1], 10);
                if (seq > maxSeq) maxSeq = seq;
            }
        }
        const nextSeq = maxSeq + 1;
        const piNumber = buildPINumber(code, nextSeq);
        const piDate = new Date();
        // Proforma has the longer validity window; we store the Proforma's
        // Valid Until here since it's the binding document. The Estimate
        // renderer computes its own (shorter) window from piDate at render time.
        const validUntil = addDays(piDate, INVOICE_CONFIG.proformaValidityDays);

        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                valueInputOption: "RAW",
                data: [
                    { range: `Sheet1!${COL_PI_NUMBER}${sheetRow}`, values: [[piNumber]] },
                    { range: `Sheet1!${COL_PI_DATE}${sheetRow}`, values: [[piDate.toISOString()]] },
                    { range: `Sheet1!${COL_VALID_UNTIL}${sheetRow}`, values: [[validUntil.toISOString()]] },
                    { range: `Sheet1!${COL_DOC_STATUS}${sheetRow}`, values: [["active"]] },
                    { range: `Sheet1!${COL_LINE_ITEMS}${sheetRow}`, values: [[JSON.stringify(lineItems)]] },
                    { range: `Sheet1!${COL_NOTES}${sheetRow}`, values: [[JSON.stringify({ ...notes, customerRefEnquiry: customerRefEnquiry || "" })]] },
                ],
            },
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

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `Sheet1!${COL_DOC_STATUS}${rowIndex + 1}`,
            valueInputOption: "RAW",
            requestBody: { values: [["removed"]] },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Estimate/Proforma void error:", err);
        return NextResponse.json({ error: "Failed to void documents." }, { status: 500 });
    }
}