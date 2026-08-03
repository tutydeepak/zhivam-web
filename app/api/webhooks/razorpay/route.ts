// app/api/webhooks/razorpay/route.ts
// Razorpay Payment Link webhook. On a verified "payment_link.paid" event:
//   1. Marks the quote's Payment Status as "paid" (AH)
//   2. Auto-generates the Tax Invoice (AK-AO) using the same numbering logic
//      as the admin's manual "Generate Invoice" button
//
// Setup required in Razorpay Dashboard → Settings → Webhooks:
//   URL: https://zhivam.com/api/webhooks/razorpay
//   Active events: payment_link.paid
//   Secret: must match RAZORPAY_WEBHOOK_SECRET in .env.local

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import crypto from "crypto";
import { buildInvoiceNumber, currentFinancialYearLabel, INVOICE_CONFIG } from "@/lib/invoice/config";

function sheetsClient() {
    const auth = new google.auth.JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return google.sheets({ version: "v4", auth });
}

function verifySignature(rawBody: string, signature: string | null): boolean {
    if (!signature) return false;
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
        .update(rawBody)
        .digest("hex");
    // Constant-time comparison to avoid timing attacks
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
}

// Same sheet columns used by app/api/admin/invoice/generate/route.ts —
// kept in sync manually since this route needs the same numbering logic
// but runs unattended (no admin-supplied line items).
const COL_PAYMENT_STATUS = "AH";
const COL_INVOICE_NUMBER = "AK";
const COL_INVOICE_DATE = "AL";
const COL_INVOICE_STATUS = "AM";
const COL_CUSTOMER_STATE = "AN";
const COL_LINE_ITEMS = "AO";

export async function POST(req: NextRequest) {
    // IMPORTANT: signature verification needs the raw request body text —
    // req.json() would consume/reformat the stream and break the HMAC check.
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!verifySignature(rawBody, signature)) {
        console.error("Razorpay webhook: invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let event;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Only act on payment_link.paid — ignore everything else (created, expired, etc.)
    if (event.event !== "payment_link.paid") {
        return NextResponse.json({ received: true, ignored: event.event });
    }

    try {
        const paymentLinkEntity = event.payload?.payment_link?.entity;
        const paymentLinkId: string | undefined = paymentLinkEntity?.id;
        const quoteIdFromNotes: string | undefined = paymentLinkEntity?.notes?.quote_id;

        if (!paymentLinkId && !quoteIdFromNotes) {
            console.error("Razorpay webhook: no payment link ID or quote_id in payload");
            return NextResponse.json({ error: "Missing identifiers" }, { status: 400 });
        }

        const sheets = sheetsClient();
        const sheetId = process.env.GOOGLE_SHEET_ID!;

        // Find the row — match by Payment Link ID (AJ) first, fall back to Quote ID (A) via notes.
        const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "Sheet1!A:AR" });
        const rows = res.data.values || [];
        const headers = rows[0] || [];
        const ajIndex = headers.indexOf("QR ID"); // Payment Link ID column header, per your existing schema

        let rowIndex = -1;
        if (paymentLinkId && ajIndex !== -1) {
            rowIndex = rows.findIndex((row, i) => i > 0 && row[ajIndex] === paymentLinkId);
        }
        if (rowIndex === -1 && quoteIdFromNotes) {
            rowIndex = rows.findIndex(row => row[0] === quoteIdFromNotes);
        }
        if (rowIndex < 1) {
            console.error("Razorpay webhook: quote not found for", paymentLinkId, quoteIdFromNotes);
            return NextResponse.json({ error: "Quote not found" }, { status: 404 });
        }

        const sheetRow = rowIndex + 1;
        const rowData: Record<string, string> = {};
        headers.forEach((h: string, i: number) => { rowData[h] = rows[rowIndex][i] || ""; });
        const quoteId = rowData["Quote ID"];

        // Idempotency guard — webhooks can fire more than once for the same event.
        if (rowData["Payment Status"] === "paid" && rowData["Invoice Status"] === "active") {
            return NextResponse.json({ received: true, alreadyProcessed: true });
        }

        // 1. Mark payment as paid
        // 1. Mark payment as paid AND move to In Production automatically
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                valueInputOption: "RAW",
                data: [
                    { range: `Sheet1!${COL_PAYMENT_STATUS}${sheetRow}`, values: [["paid"]] },
                    { range: `Sheet1!C${sheetRow}`, values: [["in-production"]] },
                ],
            },
        });

        // 2. Auto-generate Tax Invoice, skipping if one is already active (idempotency).
        if (rowData["Invoice Status"] !== "active") {
            const customerState = rowData["Customer State"] || "Andhra Pradesh";
            const amount = Number(rowData["Payment Amount"]) || 0;
            const lineItems = [{
                description: `Custom machined aluminium heat sink — ${rowData["Fin Type"]?.replace(/-/g, " ") || "fin component"}, ${rowData["Material"]?.split(" --")[0] || ""}`.trim(),
                hsn: INVOICE_CONFIG.hsnCode,
                quantity: Number(rowData["Quantity"]) || 1,
                unit: "Nos",
                totalAmount: amount,
            }];

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
            const invoiceNumber = buildInvoiceNumber(maxSeq + 1);
            const invoiceDate = new Date().toISOString();

            await sheets.spreadsheets.values.batchUpdate({
                spreadsheetId: sheetId,
                requestBody: {
                    valueInputOption: "RAW",
                    data: [
                        { range: `Sheet1!${COL_INVOICE_NUMBER}${sheetRow}`, values: [[invoiceNumber]] },
                        { range: `Sheet1!${COL_INVOICE_DATE}${sheetRow}`, values: [[invoiceDate]] },
                        { range: `Sheet1!${COL_INVOICE_STATUS}${sheetRow}`, values: [["active"]] },
                        { range: `Sheet1!${COL_CUSTOMER_STATE}${sheetRow}`, values: [[customerState]] },
                        { range: `Sheet1!${COL_LINE_ITEMS}${sheetRow}`, values: [[JSON.stringify(lineItems)]] },
                    ],
                },
            });

            console.log(`Razorpay webhook: auto-generated invoice ${invoiceNumber} for quote ${quoteId}`);
        }

        return NextResponse.json({ received: true, quoteId });
    } catch (err) {
        console.error("Razorpay webhook processing error:", err);
        // Return 200 anyway after logging — returning 4xx/5xx makes Razorpay retry
        // aggressively; since we've already verified the signature, a processing
        // error here should be investigated via logs, not hammered with retries.
        return NextResponse.json({ received: true, error: "Processing failed, check logs" });
    }
}