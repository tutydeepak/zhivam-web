// app/api/admin/invoice/generate/route.ts
// POST → assigns the next sequential invoice number for the current
// financial year, saves invoice metadata (number, date, status, customer
// state) against the quote row. Does NOT store the PDF itself — the PDF is
// generated on demand by /api/invoice/[quoteId] whenever someone downloads it.

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { buildInvoiceNumber, currentFinancialYearLabel } from "@/lib/invoice/config";

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

// Sheet layout: AK = Invoice Number, AL = Invoice Date, AM = Invoice Status,
// AN = Customer State, AO = Invoice Line Items (JSON array).
// Make sure row 1 has these exact header labels in those columns.
const COL_INVOICE_NUMBER = "AK";
const COL_INVOICE_DATE = "AL";
const COL_INVOICE_STATUS = "AM";
const COL_CUSTOMER_STATE = "AN";
const COL_LINE_ITEMS = "AO";

interface LineItemInput {
    description: string;
    hsn: string;
    quantity: number;
    unit: string;
    totalAmount: number;
}

export async function POST(req: NextRequest) {
    try {
        if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id, customerState, lineItems } = await req.json() as {
            id: string; customerState?: string; lineItems?: LineItemInput[];
        };
        if (!id) return NextResponse.json({ error: "Quote ID is required." }, { status: 400 });
        if (!Array.isArray(lineItems) || lineItems.length === 0) {
            return NextResponse.json({ error: "At least one line item is required." }, { status: 400 });
        }
        for (const item of lineItems) {
            if (!item.description?.trim() || !item.hsn?.trim() || !item.quantity || item.quantity <= 0 || !item.totalAmount || item.totalAmount <= 0) {
                return NextResponse.json({ error: "Each line item needs a description, HSN, quantity, and amount." }, { status: 400 });
            }
        }
        const state = (customerState || "Andhra Pradesh").trim();

        const sheets = sheetsClient();
        const sheetId = process.env.GOOGLE_SHEET_ID!;

        // Find the row for this quote.
        const idRes = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "Sheet1!A:A" });
        const rows = idRes.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);
        if (rowIndex < 1) return NextResponse.json({ error: "Quote not found." }, { status: 404 });
        const sheetRow = rowIndex + 1;

        // Scan the entire Invoice Number column to find the highest sequence
        // number used so far in the CURRENT financial year. We count numbers
        // even if their status was later marked "removed" — cancelled invoice
        // numbers must never be reused, per GST norms.
        const fy = currentFinancialYearLabel();
        const invRes = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: `Sheet1!${COL_INVOICE_NUMBER}:${COL_INVOICE_NUMBER}`,
        });
        const invRows = invRes.data.values || [];
        let maxSeq = 0;
        for (const row of invRows) {
            const val = row[0];
            if (typeof val !== "string") continue;
            const match = val.match(/\/(\d{2}-\d{2})\/(\d+)$/);
            if (match && match[1] === fy) {
                const seq = parseInt(match[2], 10);
                if (seq > maxSeq) maxSeq = seq;
            }
        }
        const nextSeq = maxSeq + 1;
        const invoiceNumber = buildInvoiceNumber(nextSeq);
        const invoiceDate = new Date().toISOString();

        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                valueInputOption: "RAW",
                data: [
                    { range: `Sheet1!${COL_INVOICE_NUMBER}${sheetRow}`, values: [[invoiceNumber]] },
                    { range: `Sheet1!${COL_INVOICE_DATE}${sheetRow}`, values: [[invoiceDate]] },
                    { range: `Sheet1!${COL_INVOICE_STATUS}${sheetRow}`, values: [["active"]] },
                    { range: `Sheet1!${COL_CUSTOMER_STATE}${sheetRow}`, values: [[state]] },
                    { range: `Sheet1!${COL_LINE_ITEMS}${sheetRow}`, values: [[JSON.stringify(lineItems)]] },
                ],
            },
        });

        return NextResponse.json({ success: true, invoiceNumber, invoiceDate });
    } catch (err) {
        console.error("Invoice generation error:", err);
        return NextResponse.json({ error: "Failed to generate invoice." }, { status: 500 });
    }
}

// PATCH → admin voids/removes an invoice. The number is kept (not reused),
// only its status flips to "removed" so the download button disappears.
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
            range: `Sheet1!${COL_INVOICE_STATUS}${rowIndex + 1}`,
            valueInputOption: "RAW",
            requestBody: { values: [["removed"]] },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Invoice removal error:", err);
        return NextResponse.json({ error: "Failed to remove invoice." }, { status: 500 });
    }
}