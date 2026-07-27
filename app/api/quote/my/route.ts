// app/api/quote/my/route.ts
// Returns quotes belonging to the currently logged-in user (matched by uid, falling back to email)

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { adminAuth } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const sessionCookie = req.cookies.get("__session")?.value;
        if (!sessionCookie) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
        const uid = decoded.uid;
        const email = decoded.email || "";

        const auth = new google.auth.JWT({
            email: process.env.GOOGLE_CLIENT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID!,
            range: "Sheet1!A:AX", // widened to include Payment (AG-AJ), Tax Invoice (AK-AO), and Estimate/Proforma (AS-AX) data
        });

        const rows = res.data.values || [];
        if (rows.length < 2) return NextResponse.json({ quotes: [] });

        const headers = rows[0];
        const uidCol = headers.indexOf("User ID");
        const emailCol = headers.indexOf("Email");

        const myQuotes = rows.slice(1)
            .filter(row => {
                const rowUid = uidCol >= 0 ? row[uidCol] : "";
                const rowEmail = emailCol >= 0 ? row[emailCol] : "";
                if (rowUid && rowUid === uid) return true;
                if (!rowUid && rowEmail && email && rowEmail.toLowerCase() === email.toLowerCase()) return true;
                return false;
            })
            .map(row => {
                const obj: Record<string, string> = {};
                headers.forEach((h, i) => { obj[h as string] = row[i] || ""; });
                return {
                    id: obj["Quote ID"],
                    submittedAt: obj["Submitted At"],
                    status: obj["Status"] || "New",
                    contact: {
                        name: obj["Name"],
                        email: obj["Email"],
                        company: obj["Company"],
                        phone: obj["Phone"],
                        qty: obj["Quantity"],
                        finish: obj["Surface Finish"],
                        notes: obj["Customer Notes"],
                    },
                    geometry: {
                        type: obj["Fin Type"],
                        L_mm: obj["Base L (mm)"],
                        W_mm: obj["Base W (mm)"],
                        TH_mm: obj["Total H (mm)"],
                        BH_mm: obj["Base Thickness (mm)"],
                        FH_mm: obj["Fin Height (mm)"],
                        FT_mm: obj["Fin Thickness (mm)"],
                        PD_mm: obj["Pin Dia (mm)"],
                        taper: obj["Taper"],
                        Nfins: obj["No. of Fins"],
                        material: obj["Material"],
                        k: obj["k (W/m·K)"],
                    },
                    thermal: {
                        Q: obj["Heat Input Q (W)"],
                        h: obj["Conv. Coeff h"],
                        Ta: obj["Ambient T (°C)"],
                        eta: obj["Fin Efficiency η (%)"],
                        eps: obj["Effectiveness ε"],
                        Tbase: obj["T_base (°C)"],
                        Ttip: obj["T_tip (°C)"],
                        R: obj["Rθ (°C/W)"],
                    },
                    adminNotes: obj["Admin Notes"],
                    payment: {
                        amount: obj["Payment Amount"] || "",
                        status: obj["Payment Status"] || "",
                        paymentUrl: obj["QR Image URL"] || obj["Payment Link URL"] || obj["Payment Link"] || "",
                    },
                    documents: {
                        piNumber: obj["PI Number"] || "",
                        docStatus: obj["Doc Status"] || "",
                        invoiceNumber: obj["Invoice Number"] || "",
                        invoiceStatus: obj["Invoice Status"] || "",
                    },
                };
            })
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

        return NextResponse.json({ quotes: myQuotes });
    } catch (err: unknown) {
        console.error("My quotes error:", err);
        return NextResponse.json({ error: "Failed to fetch your quotes." }, { status: 500 });
    }
}