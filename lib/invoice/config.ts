// lib/invoice/config.ts
// ─── EDIT THIS FILE ONLY ─────────────────────────────────────────────────
// Every value below is a placeholder. Update once you have the real details
// from your CA / bank / GST registration. Nothing else in the invoice code
// needs to change when you update these.

export const INVOICE_CONFIG = {
    // ── Company (Supplier) details ──────────────────────────────────────
    companyName: "ZHIVAM PRIVATE LIMITED",           // TODO: confirm exact legal name as per GST cert
    companyAddressLines: [
        "#9-65-41, I-A Sykamvari St, II Portion, I-Floor, Kothapet,",
        "Chittinagar, Vijayawada (Urban), Krishna - 520001,",
        "Andhra Pradesh",
    ],
    companyState: "Andhra Pradesh",                  // used to decide CGST+SGST vs IGST
    companyStateCode: "37",                           // Andhra Pradesh GST state code
    companyGSTIN: "37AACCZ7468E1ZW",                       // 15-char GSTIN, e.g. 37AAAAA0000A1Z5
    companyPAN: "AACCZ7468E",
    companyEmail: "info@zhivam.com",
    companyPhone: "+91-8333850202",
    // ── Estimate / Proforma numbering & validity ─────────────────────────
    // Both docs share the same PI number (generated together). Format:
    // ZPL/PI/{FY}/{customerCode}-{seq}  e.g. ZPL/PI/2026-27/CHS-037
    piPrefix: "ZPL/PI",
    estimateValidityDays: 10,
    proformaValidityDays: 15,

    // ── Bank details (shown on invoice for reference) ───────────────────
    bank: {
        accountHolder: "ZHIVAM PRIVATE LIMITED",
        bankName: "State Bank of India",
        accountNumber: "44993599628",
        ifsc: "SBIN0001008",
        branch: "Governorpet",
        swift: "", // optional, leave blank if not needed
    },

    // ── Product / HSN details ────────────────────────────────────────────
    // Confirm with your CA before relying on this for filing.
    hsnCode: "76169990",
    gstRatePercent: 18, // total GST %, split evenly into CGST+SGST when intra-state

    // ── Invoice numbering ────────────────────────────────────────────────
    // Format: {prefix}/{FY}/{seq, zero-padded}. FY resets Apr 1.
    invoicePrefix: "ZHV",
    invoiceSeqPadding: 4, // ZHV/25-26/0001

    // ── Misc ─────────────────────────────────────────────────────────────
    declarationText:
        "We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.",
    logoUrl: "", // TODO: public URL to logo image, used in PDF header if set
};

// ── Financial year helpers ───────────────────────────────────────────────
// Indian FY: April 1 – March 31. Returns e.g. "25-26" for a date in FY 2025-26.
export function currentFinancialYearLabel(date: Date = new Date()): string {
    const month = date.getMonth(); // 0 = Jan
    const year = date.getFullYear();
    const startYear = month >= 3 ? year : year - 1; // April = index 3
    const endYear = startYear + 1;
    return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
}

export function buildInvoiceNumber(seq: number, date: Date = new Date()): string {
    const fy = currentFinancialYearLabel(date);
    const padded = String(seq).padStart(INVOICE_CONFIG.invoiceSeqPadding, "0");
    return `${INVOICE_CONFIG.invoicePrefix}/${fy}/${padded}`;
}

// ── Indian FY label in "2026-27" format (PI numbers use this, invoices use "26-27") ──
export function piFinancialYearLabel(date: Date = new Date()): string {
    const month = date.getMonth();
    const year = date.getFullYear();
    const startYear = month >= 3 ? year : year - 1;
    return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

export function buildPINumber(customerCode: string, seq: number, date: Date = new Date()): string {
    const fy = piFinancialYearLabel(date);
    const padded = String(seq).padStart(3, "0");
    return `${INVOICE_CONFIG.piPrefix}/${fy}/${customerCode}-${padded}`;
}

export function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

// ── Place of supply helper ───────────────────────────────────────────────
export function isIntraState(customerState: string): boolean {
    return customerState.trim().toLowerCase() === INVOICE_CONFIG.companyState.toLowerCase();
}

// List used for the admin "customer state" dropdown (next phase).
export const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry",
];