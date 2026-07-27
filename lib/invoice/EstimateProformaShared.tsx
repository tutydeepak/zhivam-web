// lib/invoice/EstimateProformaShared.tsx
// Shared types, styles, and layout pieces for Estimate & Proforma Invoice PDFs.
// Both documents render from the exact same data shape — only the title,
// validity period, and presence of the bank details block differ.

import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { INVOICE_CONFIG, isIntraState } from "./config";
import { numberToIndianWords } from "./NumberToWords";

// ── Types ──────────────────────────────────────────────────────────────────
export interface EstimateProformaLineItem {
    description: string;
    hsn: string;
    quantity: number;
    unit: string;
    rate: number;            // per-unit rate BEFORE discount
    discountPercent: number; // e.g. 3 for 3%
}

export interface EstimateProformaData {
    docType: "estimate" | "proforma";
    logoBase64?: string;
    piNumber: string;
    piDate: string;       // ISO
    validUntil: string;   // ISO
    quoteId: string;
    customerRefEnquiry?: string; // e.g. "Email dated Jul 11,2026"
    customer: {
        name: string;
        company: string;
        billingAddress: string;
        state: string;
        gstin?: string;
        phone: string;
        email: string;
    };
    lineItems: EstimateProformaLineItem[];
    notes: {
        scope?: string;
        delivery?: string;
        warranty?: string;
        freightPacking?: string;
        installation?: string;
        additionalNotes?: string;
    };
}

export const fmt = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Computed totals shared by both renderers ──────────────────────────────
export function computeTotals(data: EstimateProformaData) {
    const rate = INVOICE_CONFIG.gstRatePercent / 100;
    const intraState = isIntraState(data.customer.state);

    const rows = data.lineItems.map(item => {
        const gross = item.quantity * item.rate;
        const taxableValue = gross * (1 - item.discountPercent / 100);
        const taxAmount = taxableValue * rate;
        const lineTotal = taxableValue + taxAmount;
        return { ...item, taxableValue, taxAmount, lineTotal };
    });

    const taxableSubtotal = rows.reduce((s, r) => s + r.taxableValue, 0);
    const totalTax = rows.reduce((s, r) => s + r.taxAmount, 0);
    const cgst = intraState ? totalTax / 2 : 0;
    const sgst = intraState ? totalTax / 2 : 0;
    const igst = intraState ? 0 : totalTax;
    const preRoundTotal = taxableSubtotal + totalTax;
    const grandTotal = Math.round(preRoundTotal);
    const roundOff = grandTotal - preRoundTotal;

    return { rows, intraState, taxableSubtotal, cgst, sgst, igst, roundOff, grandTotal };
}

// ── Shared styles ───────────────────────────────────────────────────────
const NAVY = "#1e293b";
const TEAL = "#0d9488";
const BORDER = "#94a3b8";
const CREAM = "#fdf6e3";

export const epStyles = StyleSheet.create({
    page: { padding: 0, fontSize: 8, fontFamily: "Helvetica", color: "#1e293b" },
    outerBorder: { margin: 20, borderWidth: 1, borderColor: BORDER },

    titleBar: { flexDirection: "row", height: 44, borderBottomWidth: 1, borderColor: BORDER },
    titleBarLeft: { flex: 1, backgroundColor: NAVY, padding: 10, justifyContent: "center" },
    titleBarLeftText: { color: "#ffffff", fontSize: 13, fontFamily: "Helvetica-Bold" },
    titleBarRight: { flex: 1, backgroundColor: TEAL, padding: 10, justifyContent: "center", alignItems: "flex-end" },
    titleBarRightText: { color: "#ffffff", fontSize: 13, fontFamily: "Helvetica-Bold" },

    infoRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: BORDER },
    infoLeft: { width: "50%", padding: 8, borderRightWidth: 1, borderColor: BORDER },
    infoRight: { width: "50%" },
    infoRightRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: BORDER },
    infoRightLabel: { width: "45%", backgroundColor: CREAM, padding: 4, fontSize: 7.5, color: "#475569" },
    infoRightValue: { width: "55%", padding: 4, fontSize: 7.5, textAlign: "right" },

    sectionLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#475569", marginBottom: 2 },
    bold: { fontFamily: "Helvetica-Bold" },

    partyRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: BORDER },
    partyBillTo: { width: "50%", padding: 8, borderRightWidth: 1, borderColor: BORDER },
    partyShipTo: { width: "50%", padding: 8 },
    partyFieldRow: { flexDirection: "row", marginBottom: 2 },
    partyFieldLabel: { width: 70, fontSize: 7, color: "#475569" },
    partyFieldValue: { flex: 1, fontSize: 7.5 },

    table: { borderBottomWidth: 1, borderColor: BORDER },
    tHeadRow: { flexDirection: "row", backgroundColor: NAVY },
    tHeadCell: { padding: 4, fontSize: 7, fontFamily: "Helvetica-Bold", color: "#ffffff", borderRightWidth: 1, borderColor: "#475569" },
    tRow: { flexDirection: "row", borderTopWidth: 1, borderColor: BORDER, minHeight: 40 },
    tCell: { padding: 4, fontSize: 7.5, borderRightWidth: 1, borderColor: BORDER, justifyContent: "center" },

    colSl: { width: "5%" }, colDesc: { width: "27%" }, colHsn: { width: "10%" },
    colQty: { width: "7%" }, colUnit: { width: "7%" }, colRate: { width: "10%" },
    colDisc: { width: "7%" }, colTaxable: { width: "10%" }, colGst: { width: "6%" },
    colTax: { width: "11%", borderRightWidth: 0 },

    notesTotalsRow: { flexDirection: "row" },
    notesCol: { width: "58%", padding: 8, borderRightWidth: 1, borderColor: BORDER },
    totalsCol: { width: "42%" },
    totalsRowLine: { flexDirection: "row", borderBottomWidth: 1, borderColor: BORDER, justifyContent: "space-between", padding: 4 },
    totalsRowFinal: { flexDirection: "row", backgroundColor: TEAL, justifyContent: "space-between", padding: 5 },

    amountWordsRow: { padding: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: BORDER },

    termsBankRow: { flexDirection: "row" },
    termsCol: { width: "60%", padding: 8, borderRightWidth: 1, borderColor: BORDER },
    bankCol: { width: "40%", padding: 8 },
    bankHeadBar: { backgroundColor: NAVY, padding: 4, marginBottom: 6 },
    bankHeadText: { color: "#ffffff", fontSize: 7, fontFamily: "Helvetica-Bold" },

    declarationRow: { padding: 8, borderTopWidth: 1, borderColor: BORDER },
    footerBar: { backgroundColor: NAVY, padding: 5, textAlign: "center" },
    footerText: { color: "#94a3b8", fontSize: 6.5, fontStyle: "italic" },
});

export { NAVY, TEAL, BORDER, CREAM };

// ── Shared body layout ─────────────────────────────────────────────────
export function EstimateProformaBody({ data }: { data: EstimateProformaData }) {
    const { rows, intraState, taxableSubtotal, cgst, sgst, igst, roundOff, grandTotal } = computeTotals(data);
    const isProforma = data.docType === "proforma";
    const titleText = isProforma ? "PROFORMA INVOICE" : "ESTIMATE INVOICE";

    return (
        <View style={epStyles.outerBorder}>
            {/* Title bar */}
            <View style={epStyles.titleBar}>
                <View style={[epStyles.titleBarLeft, { flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 12 }]}>
                    {data.logoBase64 ? (
                        <Image src={data.logoBase64} style={{ width: 45, height: 45, objectFit: "contain" }} />
                    ) : null}
                    <Text style={[epStyles.titleBarLeftText, { flexShrink: 1 }]}>ZHIVAM PRIVATE LIMITED</Text>
                </View>
                <View style={epStyles.titleBarRight}>
                    <Text style={epStyles.titleBarRightText}>{titleText}</Text>
                </View>
            </View>

            {/* Seller details / PI meta */}
            <View style={epStyles.infoRow}>
                <View style={epStyles.infoLeft}>
                    <Text style={epStyles.sectionLabel}>SELLER DETAILS</Text>
                    <Text style={epStyles.bold}>{INVOICE_CONFIG.companyName}</Text>
                    {INVOICE_CONFIG.companyAddressLines.map((l, i) => <Text key={i}>{l}</Text>)}
                    <Text style={{ marginTop: 3 }}>GSTIN: {INVOICE_CONFIG.companyGSTIN}  |  PAN: {INVOICE_CONFIG.companyPAN}</Text>
                    <Text>Email: {INVOICE_CONFIG.companyEmail}  |  Phone: {INVOICE_CONFIG.companyPhone}</Text>
                    <Text>Website: www.zhivam.com  |  State: {INVOICE_CONFIG.companyState} ({INVOICE_CONFIG.companyStateCode})</Text>
                </View>
                <View style={epStyles.infoRight}>
                    {[
                        ["PI Number", data.piNumber],
                        ["PI Date", new Date(data.piDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })],
                        ["Valid Until", new Date(data.validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })],
                        ["Place of Supply", data.customer.state],
                        ["Customer Ref. / Enquiry", data.customerRefEnquiry || "—"],
                        ["Reverse Charge", "No"],
                        ["Tax Type", intraState ? "CGST + SGST" : "IGST"],
                    ].map(([label, val], i) => (
                        <View style={epStyles.infoRightRow} key={i}>
                            <Text style={epStyles.infoRightLabel}>{label}</Text>
                            <Text style={epStyles.infoRightValue}>{val}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Bill To / Ship To */}
            {/* Bill To / Ship To */}
            <View style={epStyles.partyRow}>
                <View style={epStyles.partyBillTo}>
                    <Text style={epStyles.sectionLabel}>BILL TO</Text>
                    <View style={epStyles.partyFieldRow}>
                        <Text style={epStyles.partyFieldLabel}>Customer Name</Text>
                        <Text style={[epStyles.partyFieldValue, epStyles.bold]}>{data.customer.name}</Text>
                    </View>
                    <View style={epStyles.partyFieldRow}>
                        <Text style={epStyles.partyFieldLabel}>Address</Text>
                        <Text style={epStyles.partyFieldValue}>{data.customer.billingAddress}</Text>
                    </View>
                    <View style={epStyles.partyFieldRow}>
                        <Text style={epStyles.partyFieldLabel}>GSTIN</Text>
                        <Text style={epStyles.partyFieldValue}>{data.customer.gstin || "Not Provided"}</Text>
                    </View>
                    <View style={epStyles.partyFieldRow}>
                        <Text style={epStyles.partyFieldLabel}>State / Code</Text>
                        <Text style={epStyles.partyFieldValue}>{data.customer.state}</Text>
                    </View>
                    <View style={epStyles.partyFieldRow}>
                        <Text style={epStyles.partyFieldLabel}>Contact</Text>
                        <Text style={epStyles.partyFieldValue}>{data.customer.phone}</Text>
                    </View>
                    <View style={epStyles.partyFieldRow}>
                        <Text style={epStyles.partyFieldLabel}>Email</Text>
                        <Text style={epStyles.partyFieldValue}>{data.customer.email}</Text>
                    </View>
                </View>
                <View style={epStyles.partyShipTo}>
                    <Text style={epStyles.sectionLabel}>SHIP TO</Text>
                    <View style={epStyles.partyFieldRow}>
                        <Text style={epStyles.partyFieldLabel}>Recipient Name</Text>
                        <Text style={[epStyles.partyFieldValue, epStyles.bold]}>{data.customer.name}</Text>
                    </View>
                    <View style={epStyles.partyFieldRow}>
                        <Text style={epStyles.partyFieldLabel}>Address</Text>
                        <Text style={epStyles.partyFieldValue}>{data.customer.billingAddress}</Text>
                    </View>
                    <View style={epStyles.partyFieldRow}>
                        <Text style={epStyles.partyFieldLabel}>GSTIN</Text>
                        <Text style={epStyles.partyFieldValue}>{data.customer.gstin || "Not Provided"}</Text>
                    </View>
                    <View style={epStyles.partyFieldRow}>
                        <Text style={epStyles.partyFieldLabel}>State / Code</Text>
                        <Text style={epStyles.partyFieldValue}>{data.customer.state}</Text>
                    </View>
                    <View style={epStyles.partyFieldRow}>
                        <Text style={epStyles.partyFieldLabel}>Contact</Text>
                        <Text style={epStyles.partyFieldValue}>{data.customer.phone}</Text>
                    </View>
                    <View style={epStyles.partyFieldRow}>
                        <Text style={epStyles.partyFieldLabel}>Email</Text>
                        <Text style={epStyles.partyFieldValue}>{data.customer.email}</Text>
                    </View>
                </View>
            </View>

            {/* Line items */}
            <View style={epStyles.table}>
                <View style={epStyles.tHeadRow}>
                    <Text style={[epStyles.tHeadCell, epStyles.colSl]}>S.No.</Text>
                    <Text style={[epStyles.tHeadCell, epStyles.colDesc]}>Description of Goods / Services</Text>
                    <Text style={[epStyles.tHeadCell, epStyles.colHsn]}>HSN/SAC</Text>
                    <Text style={[epStyles.tHeadCell, epStyles.colQty]}>Qty</Text>
                    <Text style={[epStyles.tHeadCell, epStyles.colUnit]}>Unit</Text>
                    <Text style={[epStyles.tHeadCell, epStyles.colRate]}>Rate (₹)</Text>
                    <Text style={[epStyles.tHeadCell, epStyles.colDisc]}>Disc. %</Text>
                    <Text style={[epStyles.tHeadCell, epStyles.colTaxable]}>Taxable Value (₹)</Text>
                    <Text style={[epStyles.tHeadCell, epStyles.colGst]}>GST %</Text>
                    <Text style={[epStyles.tHeadCell, epStyles.colTax]}>Line Total (₹)</Text>
                </View>
                {rows.map((r, i) => (
                    <View style={epStyles.tRow} key={i}>
                        <Text style={[epStyles.tCell, epStyles.colSl]}>{i + 1}</Text>
                        <Text style={[epStyles.tCell, epStyles.colDesc]}>{r.description}</Text>
                        <Text style={[epStyles.tCell, epStyles.colHsn]}>{r.hsn}</Text>
                        <Text style={[epStyles.tCell, epStyles.colQty]}>{r.quantity.toFixed(2)}</Text>
                        <Text style={[epStyles.tCell, epStyles.colUnit]}>{r.unit}</Text>
                        <Text style={[epStyles.tCell, epStyles.colRate]}>{fmt(r.rate)}</Text>
                        <Text style={[epStyles.tCell, epStyles.colDisc]}>{r.discountPercent}%</Text>
                        <Text style={[epStyles.tCell, epStyles.colTaxable]}>{fmt(r.taxableValue)}</Text>
                        <Text style={[epStyles.tCell, epStyles.colGst]}>{INVOICE_CONFIG.gstRatePercent}%</Text>
                        <Text style={[epStyles.tCell, epStyles.colTax]}>{fmt(r.lineTotal)}</Text>
                    </View>
                ))}
            </View>

            {/* Notes + Totals */}
            <View style={epStyles.notesTotalsRow}>
                <View style={epStyles.notesCol}>
                    <Text style={epStyles.sectionLabel}>NOTES / COMMERCIAL DETAILS</Text>
                    {data.notes.scope ? <Text>Project / Scope: {data.notes.scope}</Text> : null}
                    <Text>Payment Terms: 100% advance against confirmed purchase order. Production will commence after receipt of advance payment and written approval of the final drawing.</Text>
                    {data.notes.delivery ? <Text>Delivery: {data.notes.delivery}</Text> : null}
                    {data.notes.warranty ? <Text>Warranty: {data.notes.warranty}</Text> : null}
                    {data.notes.freightPacking ? <Text>Freight / Packing: {data.notes.freightPacking}</Text> : <Text>Packing and Freight: Included in the quoted price.</Text>}
                    {data.notes.installation ? <Text>Installation / Commissioning: {data.notes.installation}</Text> : null}
                    {data.notes.additionalNotes ? <Text>Additional Notes: {data.notes.additionalNotes}</Text> : null}
                    <Text>Drawing Approval: Manufacturing will commence only after written approval of the final drawing and specifications by the customer.</Text>
                </View>
                <View style={epStyles.totalsCol}>
                    {[
                        ["Taxable Subtotal", fmt(taxableSubtotal)],
                        ...(intraState ? [["CGST", fmt(cgst)], ["SGST", fmt(sgst)]] : [["IGST", fmt(igst)]]),
                        ["Freight / Other Charges", "0.00"],
                        ["Round-off", (roundOff >= 0 ? "" : "-") + "₹" + fmt(Math.abs(roundOff))],
                    ].map(([label, val], i) => (
                        <View style={epStyles.totalsRowLine} key={i}>
                            <Text>{label}</Text><Text>₹ {val}</Text>
                        </View>
                    ))}
                    <View style={epStyles.totalsRowFinal}>
                        <Text style={{ color: "#fff", fontFamily: "Helvetica-Bold" }}>GRAND TOTAL</Text>
                        <Text style={{ color: "#fff", fontFamily: "Helvetica-Bold" }}>₹ {fmt(grandTotal)}</Text>
                    </View>
                    <View style={epStyles.totalsRowLine}>
                        <Text style={epStyles.bold}>{isProforma ? "Advance Required" : "100% Advance Payable"}</Text>
                        <Text style={epStyles.bold}>₹ {fmt(grandTotal)}</Text>
                    </View>
                </View>
            </View>

            {/* Amount in words */}
            <View style={epStyles.amountWordsRow}>
                <Text><Text style={epStyles.bold}>Amount in Words: </Text>{numberToIndianWords(grandTotal)}</Text>
            </View>

            {/* Terms + (Proforma only) Bank Details */}
            <View style={epStyles.termsBankRow}>
                <View style={isProforma ? epStyles.termsCol : { ...epStyles.termsCol, width: "100%", borderRightWidth: 0 }}>
                    <Text style={epStyles.sectionLabel}>TERMS & CONDITIONS</Text>
                    <Text>This {isProforma ? "proforma" : "estimate"} invoice is not a tax invoice.</Text>
                    <Text style={{ marginTop: 4 }}>Payment Terms: 100% advance against confirmed purchase order. Production will commence after receipt of advance payment and written approval of the final drawing.</Text>
                    <Text style={{ marginTop: 4 }}>Delivery Schedule: Dispatch within 5 working days and expected delivery within 7–8 working days from receipt of the confirmed purchase order, advance payment and final drawing approval, subject to courier transit conditions.</Text>
                    <Text style={{ marginTop: 4 }}>Order Cancellation and Refund Terms: Once material procurement or manufacturing has commenced, the order shall be considered non-cancellable. All amounts incurred toward raw materials, manpower, machine usage, tooling, programming, subcontracting, transportation, and other production-related activities shall be non-refundable. Any balance amount, if applicable, will be refunded only after deducting all costs and commitments already incurred against the order.</Text>
                </View>
                {isProforma && (
                    <View style={epStyles.bankCol}>
                        <View style={epStyles.bankHeadBar}><Text style={epStyles.bankHeadText}>BANK DETAILS</Text></View>
                        <Text>Bank Name: {INVOICE_CONFIG.bank.bankName}</Text>
                        <Text>Account Name: {INVOICE_CONFIG.bank.accountHolder}</Text>
                        <Text style={{ marginTop: 4 }}>Account Number: {INVOICE_CONFIG.bank.accountNumber}</Text>
                        <Text style={{ marginTop: 4 }}>IFSC Code: {INVOICE_CONFIG.bank.ifsc}</Text>
                        <Text style={{ marginTop: 4 }}>Branch: {INVOICE_CONFIG.bank.branch}</Text>
                        <Text>UPI ID: NA</Text>
                    </View>
                )}
            </View>

            {/* Declaration + signature */}
            <View style={epStyles.declarationRow}>
                <Text style={epStyles.sectionLabel}>Declaration:</Text>
                <Text>We declare that the information given in this {isProforma ? "proforma" : "estimate"} invoice is true to the best of our knowledge. This document is issued for price, scope and payment confirmation only and does not constitute a tax invoice.</Text>
                <Text style={{ marginTop: 14, textAlign: "right" }}>For ZHIVAM PRIVATE LIMITED</Text>
                <Text style={{ marginTop: 10, textAlign: "right" }}>Authorised Signatory: Dr. K. Anusuya (Director)</Text>
            </View>

            {/* Footer */}
            <View style={epStyles.footerBar}>
                <Text style={epStyles.footerText}>
                    This is a computer-generated {isProforma ? "proforma" : "estimate"} invoice{isProforma ? ". Please verify all commercial and statutory details before issue." : "."}
                </Text>
            </View>
        </View>
    );
}