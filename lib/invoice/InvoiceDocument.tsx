// lib/invoice/InvoiceDocument.tsx
// Renders a Tax Invoice PDF using @react-pdf/renderer (pure JS, no headless
// browser needed — safe on Vercel serverless). Structure mirrors the sample
// reference invoice: header, party details, line item table, tax breakup,
// HSN summary, bank details, declaration, signature block.

import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
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

const styles = StyleSheet.create({
    page: { padding: 28, fontSize: 9, fontFamily: "Helvetica", color: "#111" },
    center: { textAlign: "center" },
    bold: { fontFamily: "Helvetica-Bold" },
    headerBlock: { borderWidth: 1, borderColor: "#000", marginBottom: 6 },
    copyLabelRow: { flexDirection: "row", justifyContent: "space-between", padding: 4, borderBottomWidth: 1, borderColor: "#000" },
    companyBlock: { padding: 8, alignItems: "center", borderBottomWidth: 1, borderColor: "#000" },
    companyName: { fontSize: 14, fontFamily: "Helvetica-Bold" },
    titleRow: { padding: 4, textAlign: "center", fontSize: 12, fontFamily: "Helvetica-Bold", borderBottomWidth: 1, borderColor: "#000" },
    partyRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#000" },
    partyCol: { flex: 1, padding: 6, borderRightWidth: 1, borderColor: "#000" },
    partyColLast: { flex: 1, padding: 6 },
    label: { color: "#444", fontSize: 8 },
    table: { borderWidth: 1, borderColor: "#000", marginTop: 6 },
    tableHeaderRow: { flexDirection: "row", backgroundColor: "#f0f0f0", borderBottomWidth: 1, borderColor: "#000" },
    tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#000" },
    th: { padding: 4, fontFamily: "Helvetica-Bold", fontSize: 8, borderRightWidth: 1, borderColor: "#000" },
    td: { padding: 4, fontSize: 8, borderRightWidth: 1, borderColor: "#000" },
    colSl: { width: "5%" },
    colDesc: { width: "35%" },
    colHsn: { width: "12%" },
    colRate: { width: "10%" },
    colQty: { width: "10%" },
    colUnitRate: { width: "10%" },
    colAmount: { width: "18%", borderRightWidth: 0 },
    totalsBlock: { marginTop: 6, borderWidth: 1, borderColor: "#000" },
    totalsRow: { flexDirection: "row", justifyContent: "flex-end", padding: 3, borderBottomWidth: 1, borderColor: "#000" },
    totalsLabel: { width: 120, fontSize: 8 },
    totalsValue: { width: 90, fontSize: 8, textAlign: "right" },
    bankBlock: { marginTop: 10 },
    sigRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 30 },
    footerNote: { textAlign: "center", fontSize: 8, marginTop: 20, color: "#666" },
});

export function InvoiceDocument({ data }: { data: InvoiceData }) {
    const { lineItems, customer } = data;
    const rate = INVOICE_CONFIG.gstRatePercent / 100;
    const intraState = isIntraState(customer.state);
    const halfRate = INVOICE_CONFIG.gstRatePercent / 2;

    const fmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Each line's amount is tax-inclusive; derive taxable value per line.
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

    // Group by HSN for the summary table beneath the main table.
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
                <View style={styles.headerBlock}>
                    <View style={styles.copyLabelRow}>
                        <Text>Invoice No: {data.invoiceNumber}</Text>
                        <Text style={styles.bold}>{data.copyLabel}</Text>
                        <Text>Date: {new Date(data.invoiceDate).toLocaleDateString("en-IN")}</Text>
                    </View>

                    <View style={styles.companyBlock}>
                        <Text style={styles.companyName}>{INVOICE_CONFIG.companyName}</Text>
                        {INVOICE_CONFIG.companyAddressLines.map((line, i) => (
                            <Text key={i}>{line}</Text>
                        ))}
                        <Text>GSTIN/UIN: {INVOICE_CONFIG.companyGSTIN} · State: {INVOICE_CONFIG.companyState}, Code: {INVOICE_CONFIG.companyStateCode}</Text>
                        <Text>Email: {INVOICE_CONFIG.companyEmail} {INVOICE_CONFIG.companyPhone ? `· Phone: ${INVOICE_CONFIG.companyPhone}` : ""}</Text>
                    </View>

                    <Text style={styles.titleRow}>TAX INVOICE</Text>

                    <View style={styles.partyRow}>
                        <View style={styles.partyCol}>
                            <Text style={styles.label}>Bill To</Text>
                            <Text style={styles.bold}>{customer.company || customer.name}</Text>
                            <Text>{customer.name}</Text>
                            <Text>{customer.email}</Text>
                            <Text>{customer.phone}</Text>
                            {customer.gstin ? <Text>GSTIN/UIN: {customer.gstin}</Text> : null}
                            <Text>State: {customer.state}</Text>
                        </View>
                        <View style={styles.partyColLast}>
                            <Text style={styles.label}>Reference</Text>
                            <Text>Quote ID: {data.quoteId}</Text>
                            <Text>Place of Supply: {customer.state}</Text>
                            <Text>Reverse Charge: No</Text>
                        </View>
                    </View>
                </View>

                {/* Line item table */}
                <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                        <Text style={[styles.th, styles.colSl]}>Sl</Text>
                        <Text style={[styles.th, styles.colDesc]}>Description of Goods</Text>
                        <Text style={[styles.th, styles.colHsn]}>HSN/SAC</Text>
                        <Text style={[styles.th, styles.colQty]}>Quantity</Text>
                        <Text style={[styles.th, styles.colUnitRate]}>Rate</Text>
                        <Text style={[styles.th, styles.colAmount]}>Taxable Value</Text>
                    </View>
                    {rows.map((r, i) => (
                        <View style={styles.tableRow} key={i}>
                            <Text style={[styles.td, styles.colSl]}>{i + 1}</Text>
                            <Text style={[styles.td, styles.colDesc]}>{r.description}</Text>
                            <Text style={[styles.td, styles.colHsn]}>{r.hsn}</Text>
                            <Text style={[styles.td, styles.colQty]}>{r.quantity} {r.unit}</Text>
                            <Text style={[styles.td, styles.colUnitRate]}>{fmt(r.taxableValue / r.quantity)}</Text>
                            <Text style={[styles.td, styles.colAmount]}>{fmt(r.taxableValue)}</Text>
                        </View>
                    ))}
                </View>

                {/* HSN-wise summary */}
                <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                        <Text style={[styles.th, { width: "20%" }]}>HSN/SAC</Text>
                        <Text style={[styles.th, { width: "25%" }]}>Taxable Value</Text>
                        <Text style={[styles.th, { width: intraState ? "27.5%" : "55%" }]}>{intraState ? "CGST" : "IGST"}</Text>
                        {intraState && <Text style={[styles.th, { width: "27.5%" }]}>SGST</Text>}
                    </View>
                    {Array.from(hsnGroups.entries()).map(([hsn, g], i) => (
                        <View style={styles.tableRow} key={i}>
                            <Text style={[styles.td, { width: "20%" }]}>{hsn}</Text>
                            <Text style={[styles.td, { width: "25%" }]}>{fmt(g.taxableValue)}</Text>
                            <Text style={[styles.td, { width: intraState ? "27.5%" : "55%" }]}>{fmt(intraState ? g.tax / 2 : g.tax)}</Text>
                            {intraState && <Text style={[styles.td, { width: "27.5%" }]}>{fmt(g.tax / 2)}</Text>}
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totalsBlock}>
                    <View style={styles.totalsRow}>
                        <Text style={styles.totalsLabel}>Taxable Value</Text>
                        <Text style={styles.totalsValue}>{fmt(grandTaxable)}</Text>
                    </View>
                    {intraState ? (
                        <>
                            <View style={styles.totalsRow}>
                                <Text style={styles.totalsLabel}>CGST @ {halfRate}%</Text>
                                <Text style={styles.totalsValue}>{fmt(cgst)}</Text>
                            </View>
                            <View style={styles.totalsRow}>
                                <Text style={styles.totalsLabel}>SGST @ {halfRate}%</Text>
                                <Text style={styles.totalsValue}>{fmt(sgst)}</Text>
                            </View>
                        </>
                    ) : (
                        <View style={styles.totalsRow}>
                            <Text style={styles.totalsLabel}>IGST @ {INVOICE_CONFIG.gstRatePercent}%</Text>
                            <Text style={styles.totalsValue}>{fmt(igst)}</Text>
                        </View>
                    )}
                    <View style={[styles.totalsRow, { borderBottomWidth: 0 }]}>
                        <Text style={[styles.totalsLabel, styles.bold]}>Total</Text>
                        <Text style={[styles.totalsValue, styles.bold]}>Rs. {fmt(grandTotal)}</Text>
                    </View>
                </View>

                <Text style={{ marginTop: 6 }}>Amount Chargeable (in words): {numberToIndianWords(grandTotal)}</Text>

                {/* Bank details */}
                <View style={styles.bankBlock}>
                    <Text style={styles.bold}>Company&apos;s Bank Details</Text>
                    <Text>A/c Holder&apos;s Name: {INVOICE_CONFIG.bank.accountHolder}</Text>
                    <Text>Bank Name: {INVOICE_CONFIG.bank.bankName}</Text>
                    <Text>A/c No.: {INVOICE_CONFIG.bank.accountNumber}</Text>
                    <Text>IFSC Code: {INVOICE_CONFIG.bank.ifsc} {INVOICE_CONFIG.bank.branch ? `· Branch: ${INVOICE_CONFIG.bank.branch}` : ""}</Text>
                    {INVOICE_CONFIG.bank.swift ? <Text>SWIFT Code: {INVOICE_CONFIG.bank.swift}</Text> : null}
                </View>

                <Text style={{ marginTop: 10 }}>Declaration: {INVOICE_CONFIG.declarationText}</Text>

                <View style={styles.sigRow}>
                    <Text>Customer&apos;s Seal and Signature</Text>
                    <Text>for {INVOICE_CONFIG.companyName}{"\n"}{"\n"}Authorised Signatory</Text>
                </View>

                <Text style={styles.footerNote}>This is a computer generated invoice.</Text>
            </Page>
        </Document>
    );
}