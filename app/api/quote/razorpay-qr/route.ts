import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { razorpay } from "@/lib/razorpay";

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

// POST → create a Razorpay hosted Payment Link, set status to "quoted", and save its URL.
export async function POST(req: NextRequest) {
    try {
        if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id, amount, notes, customer } = await req.json();
        const amt = Number(amount);
        if (!id || !amt || amt <= 0) {
            return NextResponse.json({ error: "Quote ID and a valid amount are required." }, { status: 400 });
        }

        const contact = typeof customer?.phone === "string" ? customer.phone.replace(/\D/g, "") : "";

        const paymentLink = await razorpay.paymentLink.create({
            amount: Math.round(amt * 100),
            currency: "INR",
            accept_partial: false,
            reference_id: `${id.slice(0, 26)}-${Date.now()}`.slice(0, 40),
            description: (notes?.trim() || `ZHeat Quote ${id}`).slice(0, 120),
            customer: {
                name: customer?.name?.trim() || "Zhivam Customer",
                ...(customer?.email?.trim() ? { email: customer.email.trim() } : {}),
                ...(contact ? { contact } : {}),
            },
            notify: { email: false, sms: false },
            reminder_enable: false,
            notes: { quote_id: id },
        });

        const sheets = sheetsClient();
        const sheetId = process.env.GOOGLE_SHEET_ID!;
        const idRes = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "Sheet1!A:A" });
        const rows = idRes.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);
        if (rowIndex < 1) return NextResponse.json({ error: "Quote not found." }, { status: 404 });
        const sheetRow = rowIndex + 1;

        // C=Status, AG=Payment Amount, AH=Payment Status, AI=Payment Link URL, AJ=Payment Link ID
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                valueInputOption: "RAW",
                data: [
                    { range: `Sheet1!C${sheetRow}`, values: [["quoted"]] },
                    { range: `Sheet1!AG${sheetRow}`, values: [[amt]] },
                    { range: `Sheet1!AH${sheetRow}`, values: [["pending"]] },
                    { range: `Sheet1!AI${sheetRow}`, values: [[paymentLink.short_url]] },
                    { range: `Sheet1!AJ${sheetRow}`, values: [[paymentLink.id]] },
                ],
            },
        });

        return NextResponse.json({ success: true, paymentUrl: paymentLink.short_url, paymentLinkId: paymentLink.id, amount: amt });
    } catch (err) {
        console.error("Razorpay payment link error:", err);
        return NextResponse.json({ error: "Failed to create payment link." }, { status: 500 });
    }
}

// PATCH → admin manually marks payment as paid/pending.
export async function PATCH(req: NextRequest) {
    try {
        if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { id, paymentStatus } = await req.json();
        if (!id || !paymentStatus) return NextResponse.json({ error: "Missing fields." }, { status: 400 });

        const sheets = sheetsClient();
        const sheetId = process.env.GOOGLE_SHEET_ID!;
        const idRes = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "Sheet1!A:A" });
        const rows = idRes.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === id);
        if (rowIndex < 1) return NextResponse.json({ error: "Quote not found." }, { status: 404 });
        const sheetRow = rowIndex + 1;

        const updates = [
            { range: `Sheet1!AH${sheetRow}`, values: [[paymentStatus]] },
        ];
        // Marking paid automatically moves the quote into production — this
        // is the ONLY path that should trigger production start, tying it
        // directly to confirmed payment rather than a separate manual click.
        if (paymentStatus === "paid") {
            updates.push({ range: `Sheet1!C${sheetRow}`, values: [["in-production"]] });
        }

        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: { valueInputOption: "RAW", data: updates },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Payment status update error:", err);
        return NextResponse.json({ error: "Failed to update payment status." }, { status: 500 });
    }
}