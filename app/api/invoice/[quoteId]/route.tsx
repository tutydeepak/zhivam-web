// app/api/invoice/[quoteId]/route.ts
// GET → streams a freshly-rendered invoice PDF. Nothing is stored on disk;
// the PDF is regenerated from the quote + invoice metadata every time this
// is hit, using @react-pdf/renderer (pure JS, works on serverless).
//
// Accessible to:
//  - The admin, via the "x-admin-pass" header (can request either copy).
//  - The logged-in customer who owns the quote, via their session cookie
//    (always gets the "ORIGINAL FOR RECIPIENT" copy).

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { renderToStream } from "@react-pdf/renderer";
import { adminAuth } from "@/lib/firebase-admin";
import { InvoiceDocument, InvoiceData } from "@/lib/invoice/InvoiceDocument";
import { loadLogoBase64 } from "@/lib/invoice/loadLogo";
import { loadSealBase64 } from "@/lib/invoice/loadSeal";

function sheetsClient() {
    const auth = new google.auth.JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return google.sheets({ version: "v4", auth });
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks);
}

export async function GET(req: NextRequest, context: { params: Promise<{ quoteId: string }> }) {
    try {
        const { quoteId } = await context.params;
        const isAdmin = req.headers.get("x-admin-pass") === process.env.ADMIN_PASSWORD;
        const requestedCopy = req.nextUrl.searchParams.get("copy") === "supplier" && isAdmin
            ? "DUPLICATE FOR SUPPLIER" as const
            : "ORIGINAL FOR RECIPIENT" as const;

        // ── Fetch the row from Sheets ──────────────────────────────────────
        const sheets = sheetsClient();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID!,
            range: "Sheet1!A:AO",
        });
        const rows = res.data.values || [];
        if (rows.length < 2) return NextResponse.json({ error: "Not found" }, { status: 404 });
        const headers = rows[0];
        const rowIndex = rows.findIndex(row => row[0] === quoteId);
        if (rowIndex < 1) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

        const obj: Record<string, string> = {};
        headers.forEach((h, i) => { obj[h as string] = rows[rowIndex][i] || ""; });

        // ── Auth: admin OR the customer who owns this quote ────────────────
        if (!isAdmin) {
            const sessionCookie = req.cookies.get("__session")?.value;
            if (!sessionCookie) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
            const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
            const ownsQuote =
                (obj["User ID"] && obj["User ID"] === decoded.uid) ||
                (!obj["User ID"] && obj["Email"]?.toLowerCase() === (decoded.email || "").toLowerCase());
            if (!ownsQuote) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // ── Require an active invoice ───────────────────────────────────────
        const invoiceNumber = obj["Invoice Number"] || "";
        const invoiceStatus = (obj["Invoice Status"] || "").toLowerCase();
        if (!invoiceNumber || invoiceStatus !== "active") {
            return NextResponse.json({ error: "No invoice available for this quote." }, { status: 404 });
        }

        // Line items were fixed at the moment the admin generated the invoice
        // (stored as JSON). Fall back to a single auto-built item from the
        // quote's own fields only if that's somehow missing — should not
        // normally happen since /generate always requires at least one item.
        let lineItems: InvoiceData["lineItems"];
        try {
            const parsed = JSON.parse(obj["Invoice Line Items"] || "[]");
            lineItems = Array.isArray(parsed) && parsed.length > 0 ? parsed : null as unknown as InvoiceData["lineItems"];
        } catch {
            lineItems = null as unknown as InvoiceData["lineItems"];
        }
        if (!lineItems) {
            lineItems = [{
                description: `Custom machined aluminium heat sink — ${obj["Fin Type"]?.replace(/-/g, " ") || "fin component"}, ${obj["Material"]?.split(" --")[0] || ""}`.trim(),
                hsn: "76169990",
                quantity: Number(obj["Quantity"] || 1) || 1,
                unit: "Nos",
                totalAmount: Number(obj["Payment Amount"] || 0),
            }];
        }

        const invoiceData: InvoiceData = {
            invoiceNumber,
            invoiceDate: obj["Invoice Date"] || new Date().toISOString(),
            copyLabel: requestedCopy,
            quoteId,
            logoBase64: loadLogoBase64(),
            sealBase64: loadSealBase64(),
            customer: {
                name: obj["Name"] || "",
                company: obj["Company"] || "",
                email: obj["Email"] || "",
                phone: obj["Phone"] || "",
                state: obj["Customer State"] || "Andhra Pradesh",
            },
            lineItems,
        };

        const stream = await renderToStream(<InvoiceDocument data={invoiceData} />);
        const buffer = await streamToBuffer(stream as unknown as NodeJS.ReadableStream);

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${invoiceNumber.replace(/\//g, "-")}.pdf"`,
            },
        });
    } catch (err) {
        console.error("Invoice PDF generation error:", err);
        return NextResponse.json({ error: "Failed to generate invoice PDF." }, { status: 500 });
    }
}