import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { renderToStream } from "@react-pdf/renderer";
import { adminAuth } from "@/lib/firebase-admin";
import { ProformaDocument } from "@/lib/invoice/ProformaDocument";
import { EstimateProformaData } from "@/lib/invoice/EstimateProformaShared";
import { loadLogoBase64 } from "@/lib/invoice/loadLogo";

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

        const sheets = sheetsClient();
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID!,
            range: "Sheet1!A:AX",
        });
        const rows = res.data.values || [];
        if (rows.length < 2) return NextResponse.json({ error: "Not found" }, { status: 404 });
        const headers = rows[0];
        const rowIndex = rows.findIndex(row => row[0] === quoteId);
        if (rowIndex < 1) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

        const obj: Record<string, string> = {};
        headers.forEach((h, i) => { obj[h as string] = rows[rowIndex][i] || ""; });

        if (!isAdmin) {
            const sessionCookie = req.cookies.get("__session")?.value;
            if (!sessionCookie) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
            const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
            const ownsQuote =
                (obj["User ID"] && obj["User ID"] === decoded.uid) ||
                (!obj["User ID"] && obj["Email"]?.toLowerCase() === (decoded.email || "").toLowerCase());
            if (!ownsQuote) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const piNumber = obj["PI Number"] || "";
        const docStatus = (obj["Doc Status"] || "").toLowerCase();
        if (!piNumber || docStatus !== "active") {
            return NextResponse.json({ error: "No proforma available for this quote." }, { status: 404 });
        }

        let lineItems: EstimateProformaData["lineItems"] = [];
        try { lineItems = JSON.parse(obj["Line Items"] || "[]"); } catch { /* empty */ }

        let notes: EstimateProformaData["notes"] & { customerRefEnquiry?: string } = {};
        try { notes = JSON.parse(obj["Commercial Notes"] || "{}"); } catch { /* empty */ }

        const logoBase64 = loadLogoBase64();

        const data: EstimateProformaData = {
            docType: "proforma",
            logoBase64,
            piNumber,
            piDate: obj["PI Date"] || new Date().toISOString(),
            validUntil: obj["Valid Until"] || new Date().toISOString(),
            quoteId,
            customerRefEnquiry: notes.customerRefEnquiry,
            customer: {
                name: obj["Name"] || "",
                company: obj["Company"] || "",
                billingAddress: obj["Billing Address"] || "",
                state: obj["Customer State"] || "Andhra Pradesh",
                gstin: obj["Customer GSTIN"] || undefined,
                phone: obj["Phone"] || "",
                email: obj["Email"] || "",
            },
            lineItems,
            notes,
        };

        const stream = await renderToStream(<ProformaDocument data={data} />);
        const buffer = await streamToBuffer(stream as unknown as NodeJS.ReadableStream);

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="Proforma-${piNumber.replace(/\//g, "-")}.pdf"`,
            },
        });
    } catch (err) {
        console.error("Proforma PDF generation error:", err);
        return NextResponse.json({ error: "Failed to generate proforma PDF." }, { status: 500 });
    }
}