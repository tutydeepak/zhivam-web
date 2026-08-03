// app/api/quote/respond/route.ts
// Customer-facing endpoint: accept the quote (Estimate/Proforma) or request
// changes. Requires the logged-in customer to own the quote. Notifies admin
// by email either way.

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import nodemailer from "nodemailer";
import { adminAuth } from "@/lib/firebase-admin";

function sheetsClient() {
    const auth = new google.auth.JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return google.sheets({ version: "v4", auth });
}

function columnLetter(index: number): string {
    let letter = "";
    let n = index;
    while (n >= 0) {
        letter = String.fromCharCode((n % 26) + 65) + letter;
        n = Math.floor(n / 26) - 1;
    }
    return letter;
}

const COL_CUSTOMER_RESPONSE = "AY";
const COL_CUSTOMER_RESPONSE_NOTES = "AZ";
const COL_CUSTOMER_RESPONSE_AT = "BA";
const COL_RESPONSE_HISTORY = "BB";

async function notifyAdmin(quoteId: string, name: string, response: "accepted" | "negotiating", notes: string) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });

    const subject = response === "accepted"
        ? `✅ Quote Accepted — ${name} (${quoteId})`
        : `💬 Customer Requested Changes — ${name} (${quoteId})`;

    const html = `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:20px">
  <h2 style="color:${response === "accepted" ? "#16a34a" : "#d97706"}">
    ${response === "accepted" ? "Quote Accepted ✅" : "Customer Requested Changes 💬"}
  </h2>
  <p><strong>${name}</strong> has ${response === "accepted" ? "accepted the Estimate/Proforma" : "requested changes to the quote"} for <strong>${quoteId}</strong>.</p>
  ${notes ? `<div style="background:#f8fafc;border-radius:8px;padding:12px 16px;margin-top:12px"><strong>Message:</strong><p style="margin:6px 0 0">${notes}</p></div>` : ""}
  <p style="margin-top:20px"><a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin" style="background:#06b6d4;color:#000;font-weight:bold;padding:10px 20px;border-radius:8px;text-decoration:none">Open Admin Dashboard →</a></p>
</div>`;

    await transporter.sendMail({
        from: `"ZHeat Notifications" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_NOTIFY_TO,
        subject,
        html,
    });
}

export async function POST(req: NextRequest) {
    try {
        const sessionCookie = req.cookies.get("__session")?.value;
        if (!sessionCookie) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);

        const { id, response, notes } = await req.json() as {
            id: string; response: "accepted" | "negotiating"; notes?: string;
        };
        if (!id || !response) return NextResponse.json({ error: "Missing fields." }, { status: 400 });
        if (response === "negotiating" && !notes?.trim()) {
            return NextResponse.json({ error: "Please describe what you'd like changed." }, { status: 400 });
        }

        const sheets = sheetsClient();
        const sheetId = process.env.GOOGLE_SHEET_ID!;
        const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "Sheet1!A:BB" });
        const rows = res.data.values || [];
        const headers = rows[0] || [];
        const rowIndex = rows.findIndex(row => row[0] === id);
        if (rowIndex < 1) return NextResponse.json({ error: "Quote not found." }, { status: 404 });

        const obj: Record<string, string> = {};
        headers.forEach((h: string, i: number) => { obj[h] = rows[rowIndex][i] || ""; });
        const ownsQuote =
            (obj["User ID"] && obj["User ID"] === decoded.uid) ||
            (!obj["User ID"] && obj["Email"]?.toLowerCase() === (decoded.email || "").toLowerCase());
        if (!ownsQuote) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const sheetRow = rowIndex + 1;
        const respondedAt = new Date().toISOString();

        const statusColIndex = headers.indexOf("Status");

        // Append this event to the running history log rather than overwriting
        // it, so multiple negotiation rounds before an eventual accept are
        // all visible to the admin.
        let history: { response: string; notes: string; at: string; piNumber: string }[] = [];
        try {
            history = JSON.parse(obj["Response History"] || "[]");
            if (!Array.isArray(history)) history = [];
        } catch {
            history = [];
        }
        history.push({ response, notes: notes || "", at: respondedAt, piNumber: obj["PI Number"] || "" });

        const updates = [
            { range: `Sheet1!${COL_CUSTOMER_RESPONSE}${sheetRow}`, values: [[response]] },
            { range: `Sheet1!${COL_CUSTOMER_RESPONSE_NOTES}${sheetRow}`, values: [[notes || ""]] },
            { range: `Sheet1!${COL_CUSTOMER_RESPONSE_AT}${sheetRow}`, values: [[respondedAt]] },
            { range: `Sheet1!${COL_RESPONSE_HISTORY}${sheetRow}`, values: [[JSON.stringify(history)]] },
        ];

        // Auto-advance status on acceptance — admin still has to set the price
        // and generate the payment link separately; this just moves it out of
        // "awaiting-response" so it surfaces correctly in the dashboard.
        if (response === "accepted" && statusColIndex !== -1) {
            const statusCol = columnLetter(statusColIndex);
            updates.push({ range: `Sheet1!${statusCol}${sheetRow}`, values: [["quoted"]] });
        }

        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: { valueInputOption: "RAW", data: updates },
        });

        // Fire the notification email without blocking the response — if Gmail
        // SMTP is slow or hangs, the customer shouldn't be stuck waiting on it.
        notifyAdmin(id, obj["Name"] || "Customer", response, notes || "").catch(err =>
            console.error("Response notification email failed:", err)
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Quote response error:", err);
        return NextResponse.json({ error: "Failed to submit response." }, { status: 500 });
    }
}