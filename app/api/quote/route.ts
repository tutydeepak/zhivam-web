// app/api/quote/route.ts
// Receives quote submissions → saves to Google Sheet + sends email notification

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { google } from "googleapis";

// ─── Google Sheets helper ─────────────────────────────────────────────────────
async function appendToSheet(quote: QuotePayload) {
    const auth = new google.auth.JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const sheetId = process.env.GOOGLE_SHEET_ID!;

    // Add header row if sheet is empty
    const meta = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "Sheet1!A1",
    });

    if (!meta.data.values || meta.data.values.length === 0) {
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: "Sheet1!A1",
            valueInputOption: "RAW",
            requestBody: {
                values: [[
                    "Quote ID", "Submitted At", "Status",
                    "Name", "Email", "Company", "Phone", "Quantity", "Surface Finish",
                    "Fin Type", "Base L (mm)", "Base W (mm)", "Total H (mm)", "Base Thickness (mm)",
                    "Fin Height (mm)", "Fin Thickness (mm)", "Pin Dia (mm)", "Taper",
                    "No. of Fins", "Material", "k (W/m·K)",
                    "Heat Input Q (W)", "Conv. Coeff h", "Ambient T (°C)",
                    "Fin Efficiency η (%)", "Effectiveness ε", "T_base (°C)", "T_tip (°C)", "Rθ (°C/W)",
                    "Customer Notes", "Admin Notes"
                ]]
            }
        });
    }

    // Append the quote row
    await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: "Sheet1!A:AE",
        valueInputOption: "RAW",
        requestBody: {
            values: [[
                quote.id,
                quote.submittedAt,
                "new",
                quote.contact.name,
                quote.contact.email,
                quote.contact.company || "",
                quote.contact.phone || "",
                quote.contact.qty,
                quote.contact.finish,
                quote.geometry?.type || "",
                quote.geometry?.L_mm || "",
                quote.geometry?.W_mm || "",
                quote.geometry?.TH_mm || "",
                quote.geometry?.BH_mm || "",
                quote.geometry?.FH_mm || "",
                quote.geometry?.FT_mm || "",
                quote.geometry?.PD_mm || "",
                quote.geometry?.taper || "",
                quote.geometry?.Nfins || "",
                quote.geometry?.material || "",
                quote.geometry?.k || "",
                quote.thermal?.Q || "",
                quote.thermal?.h || "",
                quote.thermal?.Ta || "",
                quote.thermal?.eta?.toFixed(2) || "",
                quote.thermal?.eps?.toFixed(3) || "",
                quote.thermal?.Tbase?.toFixed(2) || "",
                quote.thermal?.Ttip?.toFixed(2) || "",
                quote.thermal?.R?.toFixed(5) || "",
                quote.contact.notes || "",
                "", // Admin Notes — filled from dashboard
            ]]
        }
    });
}

// ─── Email helper ─────────────────────────────────────────────────────────────
async function sendNotificationEmail(quote: QuotePayload) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });

    const g = quote.geometry;
    const t = quote.thermal;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }
    .card { background: #ffffff; border-radius: 12px; max-width: 620px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: #0f172a; padding: 24px 28px; }
    .header h1 { color: #06b6d4; margin: 0; font-size: 20px; }
    .header p { color: #94a3b8; margin: 4px 0 0; font-size: 13px; }
    .badge { display: inline-block; background: #06b6d4; color: #000; font-size: 11px; font-weight: bold; padding: 3px 10px; border-radius: 20px; margin-top: 8px; }
    .section { padding: 20px 28px; border-bottom: 1px solid #e2e8f0; }
    .section h2 { color: #0f172a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 12px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .field label { display: block; color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 2px; }
    .field span { color: #1e293b; font-size: 13px; font-weight: 600; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .kpi { background: #f8fafc; border-radius: 8px; padding: 10px; text-align: center; }
    .kpi .val { font-size: 16px; font-weight: bold; color: #0891b2; }
    .kpi .lbl { font-size: 10px; color: #94a3b8; margin-top: 2px; }
    .notes { background: #f8fafc; border-radius: 8px; padding: 12px 16px; color: #475569; font-size: 13px; line-height: 1.6; }
    .footer { padding: 16px 28px; background: #f8fafc; text-align: center; color: #94a3b8; font-size: 11px; }
    .cta { display: inline-block; margin-top: 10px; background: #06b6d4; color: #000 !important; font-weight: bold; font-size: 13px; padding: 10px 24px; border-radius: 8px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>⚡ ZHeat — New Quote Request</h1>
      <p>Subject: Quote Request from ZHeat</p>
      <span class="badge">NEW · ${quote.id}</span>
    </div>

    <div class="section">
      <h2>Contact Details</h2>
      <div class="grid">
        <div class="field"><label>Name</label><span>${quote.contact.name}</span></div>
        <div class="field"><label>Email</label><span>${quote.contact.email}</span></div>
        <div class="field"><label>Company</label><span>${quote.contact.company || "—"}</span></div>
        <div class="field"><label>Phone</label><span>${quote.contact.phone || "—"}</span></div>
        <div class="field"><label>Quantity</label><span>× ${quote.contact.qty} units</span></div>
        <div class="field"><label>Surface Finish</label><span>${quote.contact.finish}</span></div>
      </div>
      ${quote.contact.notes ? `<div style="margin-top:12px"><div class="field"><label>Customer Notes</label></div><div class="notes">${quote.contact.notes}</div></div>` : ""}
    </div>

    ${g ? `
    <div class="section">
      <h2>Fin Geometry</h2>
      <div class="grid">
        <div class="field"><label>Fin Type</label><span>${g.type.replace(/-/g, " ")}</span></div>
        <div class="field"><label>Base (L × W)</label><span>${g.L_mm} × ${g.W_mm} mm</span></div>
        <div class="field"><label>Total Height</label><span>${g.TH_mm} mm</span></div>
        <div class="field"><label>Fin Height</label><span>${g.FH_mm} mm</span></div>
        <div class="field"><label>Fin Thickness / ⌀</label><span>${g.FT_mm} / ${g.PD_mm} mm</span></div>
        <div class="field"><label>Taper Ratio</label><span>${Number(g.taper).toFixed(2)}</span></div>
        <div class="field"><label>No. of Fins/Pins</label><span>${g.Nfins}</span></div>
        <div class="field"><label>Material</label><span>${g.material.split(" --")[0]}</span></div>
      </div>
    </div>` : ""}

    ${t ? `
    <div class="section">
      <h2>Thermal Analysis</h2>
      <div class="kpi-grid">
        <div class="kpi"><div class="val">${Number(t.eta).toFixed(1)}%</div><div class="lbl">Fin Eff. η</div></div>
        <div class="kpi"><div class="val">${Number(t.eps).toFixed(2)}</div><div class="lbl">Effectiveness ε</div></div>
        <div class="kpi"><div class="val">${Number(t.Tbase).toFixed(1)}°C</div><div class="lbl">T_base</div></div>
        <div class="kpi"><div class="val">${Number(t.R).toFixed(3)}</div><div class="lbl">Rθ °C/W</div></div>
      </div>
    </div>` : ""}

    <div class="section" style="border:none; text-align:center">
      <p style="color:#475569; font-size:13px; margin:0 0 12px">View and manage this quote in the admin dashboard</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin" class="cta">Open Admin Dashboard →</a>
    </div>

    <div class="footer">
      ZHeat · Zhivam Pvt. Ltd. · www.zhivam.com<br/>
      Submitted: ${new Date(quote.submittedAt).toLocaleString("en-IN")}
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
        from: `"ZHeat Notifications" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_NOTIFY_TO,
        subject: `Quote Request from ZHeat — ${quote.contact.name} (${quote.id})`,
        html,
    });
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuotePayload {
    id: string;
    submittedAt: string;
    contact: {
        name: string; email: string; company?: string; phone?: string;
        qty: string; finish: string; notes?: string;
    };
    geometry?: {
        type: string; L_mm: number; W_mm: number; TH_mm: number; BH_mm: number;
        FH_mm: number; FT_mm: number; PD_mm: number; taper: number;
        Nfins: number; material: string; k: number;
    } | null;
    thermal?: {
        Q: number; h: number; Ta: number;
        eta: number; eps: number; Tbase: number; Ttip: number; R: number;
    } | null;
}

// ─── POST /api/quote ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const quote: QuotePayload = await req.json();

        // Validate required fields
        if (!quote.contact?.name?.trim() || !quote.contact?.email?.trim()) {
            return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
        }

        // Assign ID and timestamp if not provided
        if (!quote.id) quote.id = `Q-${Date.now()}`;
        if (!quote.submittedAt) quote.submittedAt = new Date().toISOString();

        // Run Sheets + Email in parallel
        const results = await Promise.allSettled([
            appendToSheet(quote),
            sendNotificationEmail(quote),
        ]);

        const sheetOk = results[0].status === "fulfilled";
        const emailOk = results[1].status === "fulfilled";

        if (!sheetOk) console.error("Sheet error:", (results[0] as PromiseRejectedResult).reason);
        if (!emailOk) console.error("Email error:", (results[1] as PromiseRejectedResult).reason);

        if (!sheetOk && !emailOk) {
            return NextResponse.json({ error: "Failed to save quote. Please try again." }, { status: 500 });
        }

        return NextResponse.json({ success: true, id: quote.id, sheetOk, emailOk });

    } catch (err: unknown) {
        console.error("Quote API error:", err);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}

// ─── GET /api/quote — fetch all quotes from Sheet ─────────────────────────────
export async function GET() {
    try {
        const auth = new google.auth.JWT({
            email: process.env.GOOGLE_CLIENT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID!,
            range: "Sheet1!A:AE",
        });

        const rows = res.data.values || [];
        if (rows.length < 2) return NextResponse.json({ quotes: [] });

        const headers = rows[0];
        const quotes = rows.slice(1).map(row => {
            const obj: Record<string, string> = {};
            headers.forEach((h, i) => { obj[h as string] = row[i] || ""; });
            return obj;
        });

        return NextResponse.json({ quotes });
    } catch (err: unknown) {
        console.error("Fetch quotes error:", err);
        return NextResponse.json({ error: "Failed to fetch quotes." }, { status: 500 });
    }
}

// ─── PATCH /api/quote — update status or admin notes ─────────────────────────
export async function PATCH(req: NextRequest) {
    try {
        const { id, status, adminNotes } = await req.json();

        const auth = new google.auth.JWT({
            email: process.env.GOOGLE_CLIENT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });
        const sheetId = process.env.GOOGLE_SHEET_ID!;

        // Find the row with matching Quote ID
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: "Sheet1!A:A",
        });

        const rows = res.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === id);
        if (rowIndex < 1) return NextResponse.json({ error: "Quote not found." }, { status: 404 });

        const sheetRow = rowIndex + 1; // 1-indexed, row 1 is header

        // Update Status (column C = index 3) and Admin Notes (column AE = index 31)
        if (status !== undefined) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: sheetId,
                range: `Sheet1!C${sheetRow}`,
                valueInputOption: "RAW",
                requestBody: { values: [[status]] },
            });
        }

        if (adminNotes !== undefined) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: sheetId,
                range: `Sheet1!AE${sheetRow}`,
                valueInputOption: "RAW",
                requestBody: { values: [[adminNotes]] },
            });
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error("Patch quote error:", err);
        return NextResponse.json({ error: "Failed to update quote." }, { status: 500 });
    }
}