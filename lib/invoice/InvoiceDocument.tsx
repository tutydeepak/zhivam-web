// lib/invoice/InvoiceDocument.tsx
// Renders a Tax Invoice PDF using @react-pdf/renderer (pure JS, no headless
// browser needed — safe on Vercel serverless). Visual design matches the
// Estimate/Proforma templates (navy/teal branding, logo) while keeping the
// legally-required Tax Invoice elements: ORIGINAL/DUPLICATE copy label and
// the HSN-wise GST summary table.

import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { INVOICE_CONFIG, isIntraState } from "./config";
import { numberToIndianWords } from "./NumberToWords";

export interface InvoiceLineItem {
    description: string;
    hsn: string;
    quantity: number;
    unit: string; // e.g. "Nos"
    totalAmount: number; // tax-inclusive amount for this line
}

export interface InvoiceData {
    invoiceNumber: string;
    invoiceDate: string; // ISO string
    copyLabel: "ORIGINAL FOR RECIPIENT" | "DUPLICATE FOR SUPPLIER";
    quoteId: string;
    logoBase64?: string;
    sealBase64?: string;
    customer: {
        name: string;
        company: string;
        email: string;
        phone: string;
        state: string;
        gstin?: string; // optional — customer may not be registered
    };
    lineItems: InvoiceLineItem[];
}

const NAVY = "#1e293b";
const TEAL = "#0d9488";
const BORDER = "#94a3b8";
const CREAM = "#fdf6e3";

const styles = StyleSheet.create({
    page: { padding: 0, fontSize: 8, fontFamily: "Helvetica", color: "#1e293b" },
    outerBorder: { margin: 20, borderWidth: 1, borderColor: BORDER },
    bold: { fontFamily: "Helvetica-Bold" },
    sectionLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#475569", marginBottom: 2 },

    // Copy label strip — sits above the main title bar
    copyLabelRow: { flexDirection: "row", justifyContent: "space-between", padding: 5, backgroundColor: "#334155" },
    copyLabelText: { color: "#e2e8f0", fontSize: 7.5 },
    copyLabelBadge: { color: "#ffffff", fontSize: 7.5, fontFamily: "Helvetica-Bold" },

    // Title bar — matches Estimate/Proforma
    titleBar: { flexDirection: "row", height: 44 },
    titleBarLeft: { flex: 1, backgroundColor: NAVY, padding: 10, justifyContent: "center", flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 12 },
    titleBarLeftText: { color: "#ffffff", fontSize: 13, fontFamily: "Helvetica-Bold", flexShrink: 1 },
    titleBarRight: { flex: 1, backgroundColor: TEAL, padding: 10, justifyContent: "center", alignItems: "flex-end" },
    titleBarRightText: { color: "#ffffff", fontSize: 13, fontFamily: "Helvetica-Bold" },

    infoRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: BORDER },
    infoLeft: { width: "50%", padding: 8, borderRightWidth: 1, borderColor: BORDER },
    infoRight: { width: "50%" },
    infoRightRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: BORDER },
    infoRightLabel: { width: "45%", backgroundColor: CREAM, padding: 4, fontSize: 7.5, color: "#475569" },
    infoRightValue: { width: "55%", padding: 4, fontSize: 7.5, textAlign: "right" },

    partyRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: BORDER },
    partyCol: { width: "50%", padding: 8, borderRightWidth: 1, borderColor: BORDER },
    partyColLast: { width: "50%", padding: 8 },
    partyFieldRow: { flexDirection: "row", marginBottom: 2 },
    partyFieldLabel: { width: 70, fontSize: 7, color: "#475569" },
    partyFieldValue: { flex: 1, fontSize: 7.5 },

    table: { borderBottomWidth: 1, borderColor: BORDER },
    tHeadRow: { flexDirection: "row", backgroundColor: NAVY },
    tHeadCell: { padding: 4, fontSize: 7, fontFamily: "Helvetica-Bold", color: "#ffffff", borderRightWidth: 1, borderColor: "#475569" },
    tRow: { flexDirection: "row", borderTopWidth: 1, borderColor: BORDER, minHeight: 30 },
    tCell: { padding: 4, fontSize: 7.5, borderRightWidth: 1, borderColor: BORDER, justifyContent: "center" },
    colSl: { width: "6%" }, colDesc: { width: "36%" }, colHsn: { width: "14%" },
    colQty: { width: "12%" }, colRate: { width: "14%" }, colAmount: { width: "18%", borderRightWidth: 0 },

    hsnHeadCell: { padding: 4, fontSize: 7, fontFamily: "Helvetica-Bold", color: "#ffffff", borderRightWidth: 1, borderColor: "#475569" },
    hsnCell: { padding: 4, fontSize: 7.5, borderRightWidth: 1, borderColor: BORDER },

    totalsBlock: { marginTop: 0 },
    totalsRowLine: { flexDirection: "row", borderBottomWidth: 1, borderColor: BORDER, justifyContent: "space-between", padding: 4 },
    totalsRowFinal: { flexDirection: "row", backgroundColor: TEAL, justifyContent: "space-between", padding: 5 },

    amountWordsRow: { padding: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: BORDER },

    bankDeclRow: { flexDirection: "row" },
    bankCol: { width: "50%", padding: 8, borderRightWidth: 1, borderColor: BORDER },
    declCol: { width: "50%", padding: 8 },
    bankHeadBar: { backgroundColor: NAVY, padding: 4, marginBottom: 6 },
    bankHeadText: { color: "#ffffff", fontSize: 7, fontFamily: "Helvetica-Bold" },

    sigRow: { flexDirection: "row", justifyContent: "space-between", padding: 8, borderTopWidth: 1, borderColor: BORDER, alignItems: "flex-start" },
    sigRightCol: { alignItems: "flex-end" },
    footerBar: { backgroundColor: NAVY, padding: 5, textAlign: "center" },
    footerText: { color: "#94a3b8", fontSize: 6.5, fontStyle: "italic" },
});

export function InvoiceDocument({ data }: { data: InvoiceData }) {
    const { lineItems, customer } = data;
    const rate = INVOICE_CONFIG.gstRatePercent / 100;
    const intraState = isIntraState(customer.state);
    const halfRate = INVOICE_CONFIG.gstRatePercent / 2;

    const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const rows = lineItems.map(item => {
        const taxableValue = item.totalAmount / (1 + rate);
        return { ...item, taxableValue, tax: item.totalAmount - taxableValue };
    });

    const grandTaxable = rows.reduce((sum, r) => sum + r.taxableValue, 0);
    const grandTax = rows.reduce((sum, r) => sum + r.tax, 0);
    const grandTotal = rows.reduce((sum, r) => sum + r.totalAmount, 0);
    const cgst = intraState ? grandTax / 2 : 0;
    const sgst = intraState ? grandTax / 2 : 0;
    const igst = intraState ? 0 : grandTax;

    const hsnGroups = new Map<string, { taxableValue: number; tax: number }>();
    for (const r of rows) {
        const g = hsnGroups.get(r.hsn) || { taxableValue: 0, tax: 0 };
        g.taxableValue += r.taxableValue;
        g.tax += r.tax;
        hsnGroups.set(r.hsn, g);
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.outerBorder}>
                    {/* Copy label strip */}
                    <View style={styles.copyLabelRow}>
                        <Text style={styles.copyLabelText}>Invoice No: {data.invoiceNumber}</Text>
                        <Text style={styles.copyLabelBadge}>{data.copyLabel}</Text>
                        <Text style={styles.copyLabelText}>Date: {new Date(data.invoiceDate).toLocaleDateString("en-IN")}</Text>
                    </View>

                    {/* Title bar */}
                    <View style={styles.titleBar}>
                        <View style={styles.titleBarLeft}>
                            {data.logoBase64 ? (
                                <Image src={data.logoBase64} style={{ width: 32, height: 32, objectFit: "contain", marginVertical: -8 }} />
                            ) : null}
                            <Text style={styles.titleBarLeftText}>{INVOICE_CONFIG.companyName}</Text>
                        </View>
                        <View style={styles.titleBarRight}>
                            <Text style={styles.titleBarRightText}>TAX INVOICE</Text>
                        </View>
                    </View>

                    {/* Seller details / Invoice meta */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoLeft}>
                            <Text style={styles.sectionLabel}>SELLER DETAILS</Text>
                            <Text style={styles.bold}>{INVOICE_CONFIG.companyName}</Text>
                            {INVOICE_CONFIG.companyAddressLines.map((line, i) => <Text key={i}>{line}</Text>)}
                            <Text style={{ marginTop: 3 }}>GSTIN: {INVOICE_CONFIG.companyGSTIN}  |  PAN: {INVOICE_CONFIG.companyPAN}</Text>
                            <Text>Email: {INVOICE_CONFIG.companyEmail}  |  Phone: {INVOICE_CONFIG.companyPhone}</Text>
                            <Text>Website: www.zhivam.com  |  State: {INVOICE_CONFIG.companyState} ({INVOICE_CONFIG.companyStateCode})</Text>
                        </View>
                        <View style={styles.infoRight}>
                            {[
                                ["Invoice Number", data.invoiceNumber],
                                ["Invoice Date", new Date(data.invoiceDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })],
                                ["Quote Ref.", data.quoteId],
                                ["Place of Supply", customer.state],
                                ["Reverse Charge", "No"],
                                ["Tax Type", intraState ? "CGST + SGST" : "IGST"],
                            ].map(([label, val], i) => (
                                <View style={styles.infoRightRow} key={i}>
                                    <Text style={styles.infoRightLabel}>{label}</Text>
                                    <Text style={styles.infoRightValue}>{val}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Bill To */}
                    <View style={styles.partyRow}>
                        <View style={styles.partyCol}>
                            <Text style={styles.sectionLabel}>BILL TO</Text>
                            <View style={styles.partyFieldRow}><Text style={styles.partyFieldLabel}>Name</Text><Text style={[styles.partyFieldValue, styles.bold]}>{customer.company || customer.name}</Text></View>
                            <View style={styles.partyFieldRow}><Text style={styles.partyFieldLabel}>Contact</Text><Text style={styles.partyFieldValue}>{customer.name}</Text></View>
                            <View style={styles.partyFieldRow}><Text style={styles.partyFieldLabel}>Email</Text><Text style={styles.partyFieldValue}>{customer.email}</Text></View>
                            <View style={styles.partyFieldRow}><Text style={styles.partyFieldLabel}>Phone</Text><Text style={styles.partyFieldValue}>{customer.phone}</Text></View>
                            <View style={styles.partyFieldRow}><Text style={styles.partyFieldLabel}>GSTIN</Text><Text style={styles.partyFieldValue}>{customer.gstin || "Not Provided"}</Text></View>
                            <View style={styles.partyFieldRow}><Text style={styles.partyFieldLabel}>State</Text><Text style={styles.partyFieldValue}>{customer.state}</Text></View>
                        </View>
                        <View style={styles.partyColLast}>
                            <Text style={styles.sectionLabel}>REFERENCE</Text>
                            <View style={styles.partyFieldRow}><Text style={styles.partyFieldLabel}>Quote ID</Text><Text style={styles.partyFieldValue}>{data.quoteId}</Text></View>
                            <View style={styles.partyFieldRow}><Text style={styles.partyFieldLabel}>Place of Supply</Text><Text style={styles.partyFieldValue}>{customer.state}</Text></View>
                            <View style={styles.partyFieldRow}><Text style={styles.partyFieldLabel}>Reverse Charge</Text><Text style={styles.partyFieldValue}>No</Text></View>
                        </View>
                    </View>

                    {/* Line item table */}
                    <View style={styles.table}>
                        <View style={styles.tHeadRow}>
                            <Text style={[styles.tHeadCell, styles.colSl]}>Sl</Text>
                            <Text style={[styles.tHeadCell, styles.colDesc]}>Description of Goods</Text>
                            <Text style={[styles.tHeadCell, styles.colHsn]}>HSN/SAC</Text>
                            <Text style={[styles.tHeadCell, styles.colQty]}>Quantity</Text>
                            <Text style={[styles.tHeadCell, styles.colRate]}>Rate (₹)</Text>
                            <Text style={[styles.tHeadCell, styles.colAmount]}>Taxable Value (₹)</Text>
                        </View>
                        {rows.map((r, i) => (
                            <View style={styles.tRow} key={i}>
                                <Text style={[styles.tCell, styles.colSl]}>{i + 1}</Text>
                                <Text style={[styles.tCell, styles.colDesc]}>{r.description}</Text>
                                <Text style={[styles.tCell, styles.colHsn]}>{r.hsn}</Text>
                                <Text style={[styles.tCell, styles.colQty]}>{r.quantity} {r.unit}</Text>
                                <Text style={[styles.tCell, styles.colRate]}>{fmt(r.taxableValue / r.quantity)}</Text>
                                <Text style={[styles.tCell, styles.colAmount]}>{fmt(r.taxableValue)}</Text>
                            </View>
                        ))}
                    </View>

                    {/* HSN-wise GST summary — legally required, kept separate from Estimate/Proforma structure */}
                    <View style={styles.table}>
                        <View style={styles.tHeadRow}>
                            <Text style={[styles.hsnHeadCell, { width: "25%" }]}>HSN/SAC</Text>
                            <Text style={[styles.hsnHeadCell, { width: "25%" }]}>Taxable Value (₹)</Text>
                            <Text style={[styles.hsnHeadCell, { width: intraState ? "25%" : "50%" }]}>{intraState ? "CGST (₹)" : "IGST (₹)"}</Text>
                            {intraState && <Text style={[styles.hsnHeadCell, { width: "25%", borderRightWidth: 0 }]}>SGST (₹)</Text>}
                        </View>
                        {Array.from(hsnGroups.entries()).map(([hsn, g], i) => (
                            <View style={styles.tRow} key={i}>
                                <Text style={[styles.hsnCell, { width: "25%" }]}>{hsn}</Text>
                                <Text style={[styles.hsnCell, { width: "25%" }]}>{fmt(g.taxableValue)}</Text>
                                <Text style={[styles.hsnCell, { width: intraState ? "25%" : "50%" }]}>{fmt(intraState ? g.tax / 2 : g.tax)}</Text>
                                {intraState && <Text style={[styles.hsnCell, { width: "25%", borderRightWidth: 0 }]}>{fmt(g.tax / 2)}</Text>}
                            </View>
                        ))}
                    </View>

                    {/* Totals */}
                    <View style={styles.totalsBlock}>
                        <View style={styles.totalsRowLine}>
                            <Text>Taxable Value</Text><Text>₹ {fmt(grandTaxable)}</Text>
                        </View>
                        {intraState ? (
                            <>
                                <View style={styles.totalsRowLine}><Text>CGST @ {halfRate}%</Text><Text>₹ {fmt(cgst)}</Text></View>
                                <View style={styles.totalsRowLine}><Text>SGST @ {halfRate}%</Text><Text>₹ {fmt(sgst)}</Text></View>
                            </>
                        ) : (
                            <View style={styles.totalsRowLine}><Text>IGST @ {INVOICE_CONFIG.gstRatePercent}%</Text><Text>₹ {fmt(igst)}</Text></View>
                        )}
                        <View style={styles.totalsRowFinal}>
                            <Text style={{ color: "#fff", fontFamily: "Helvetica-Bold" }}>TOTAL</Text>
                            <Text style={{ color: "#fff", fontFamily: "Helvetica-Bold" }}>₹ {fmt(grandTotal)}</Text>
                        </View>
                    </View>

                    {/* Amount in words */}
                    <View style={styles.amountWordsRow}>
                        <Text><Text style={styles.bold}>Amount Chargeable (in words): </Text>{numberToIndianWords(grandTotal)}</Text>
                    </View>

                    {/* Bank details + Declaration */}
                    <View style={styles.bankDeclRow}>
                        <View style={styles.bankCol}>
                            <View style={styles.bankHeadBar}><Text style={styles.bankHeadText}>BANK DETAILS</Text></View>
                            <Text>A/c Holder&apos;s Name: {INVOICE_CONFIG.bank.accountHolder}</Text>
                            <Text>Bank Name: {INVOICE_CONFIG.bank.bankName}</Text>
                            <Text style={{ marginTop: 4 }}>A/c No.: {INVOICE_CONFIG.bank.accountNumber}</Text>
                            <Text style={{ marginTop: 4 }}>IFSC Code: {INVOICE_CONFIG.bank.ifsc}</Text>
                            <Text style={{ marginTop: 4 }}>Branch: {INVOICE_CONFIG.bank.branch}</Text>
                            {INVOICE_CONFIG.bank.swift ? <Text>SWIFT Code: {INVOICE_CONFIG.bank.swift}</Text> : null}
                        </View>
                        <View style={styles.declCol}>
                            <Text style={styles.sectionLabel}>DECLARATION</Text>
                            <Text>{INVOICE_CONFIG.declarationText}</Text>
                        </View>
                    </View>

                    {/* Signature */}
                    <View style={styles.sigRow}>
                        <Text>Customer&apos;s Seal and Signature</Text>
                        <View style={styles.sigRightCol}>
                            <Text style={{ textAlign: "right" }}>for {INVOICE_CONFIG.companyName}</Text>
                            {data.sealBase64 ? (
                                <Image src={data.sealBase64} style={{ width: 70, height: 70, objectFit: "contain", marginTop: 4, marginBottom: 4 }} />
                            ) : (
                                <View style={{ height: 30 }} />
                            )}
                            <Text style={{ textAlign: "right" }}>Authorised Signatory: Dr. K. Anusuya (Director)</Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footerBar}>
                        <Text style={styles.footerText}>This is a computer-generated tax invoice.</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
}