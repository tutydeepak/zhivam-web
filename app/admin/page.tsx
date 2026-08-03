"use client";
import React, { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type QuoteStatus = "new" | "in-progress" | "awaiting-response" | "quoted" | "in-production" | "closed";

interface SheetQuote {
    "Quote ID": string;
    "Submitted At": string;
    "Status": string;
    "Name": string;
    "Email": string;
    "Company": string;
    "Phone": string;
    "Quantity": string;
    "Surface Finish": string;
    "Fin Type": string;
    "Base L (mm)": string;
    "Base W (mm)": string;
    "Total H (mm)": string;
    "Base Thickness (mm)": string;
    "Fin Height (mm)": string;
    "Fin Thickness (mm)": string;
    "Pin Dia (mm)": string;
    "Taper": string;
    "No. of Fins": string;
    "Material": string;
    "k (W/m·K)": string;
    "Heat Input Q (W)": string;
    "Conv. Coeff h": string;
    "Ambient T (°C)": string;
    "Fin Efficiency η (%)": string;
    "Effectiveness ε": string;
    "T_base (°C)": string;
    "T_tip (°C)": string;
    "Rθ (°C/W)": string;
    "Customer Notes": string;
    "Admin Notes": string;
    "Payment Amount": string;
    "Payment Status": string;
    "QR Image URL": string;
    "QR ID": string;
    "Invoice Number": string;
    "Invoice Date": string;
    "Invoice Status": string;
    "Customer State": string;
    "Invoice Line Items": string;
    "Billing Address": string;
    // "Customer State": string;
    "Customer GSTIN": string;
    "PI Number": string;
    "PI Date": string;
    "Valid Until": string;
    "Doc Status": string;
    "Line Items": string;
    "Commercial Notes": string;
    "Customer Response": string;
    "Customer Response Notes": string;
    "Customer Response At": string;
    "Response History": string; // ← ADD
}

interface InvoiceLineItem {
    description: string;
    hsn: string;
    quantity: number;
    unit: string;
    totalAmount: number;
}

interface EPLineItem {
    description: string;
    hsn: string;
    quantity: number;
    unit: string;
    rate: number;
    discountPercent: number;
}

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry",
];

// ─── Constants ────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = "Zhivam@2026";

const STATUS_CONFIG: Record<QuoteStatus, { label: string; bg: string; text: string; dot: string }> = {
    "new": { label: "New", bg: "bg-cyan-500/10", text: "text-cyan-400", dot: "bg-cyan-400" },
    "in-progress": { label: "In Progress", bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
    "awaiting-response": { label: "Awaiting Response", bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-400" },
    "quoted": { label: "Quoted", bg: "bg-sky-500/10", text: "text-sky-400", dot: "bg-sky-400" },
    "in-production": { label: "In Production", bg: "bg-orange-600/10", text: "text-orange-500", dot: "bg-orange-500" },
    "closed": { label: "Closed", bg: "bg-green-500/10", text: "text-green-400", dot: "bg-green-500" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(iso: string) {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
            + " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
}

function epTotalFromQuote(q: SheetQuote): string {
    try {
        const items = JSON.parse((q as unknown as Record<string, string>)["Line Items"] || "[]");
        if (!Array.isArray(items) || items.length === 0) return "";
        const total = items.reduce((sum: number, item: { quantity?: number; rate?: number; discountPercent?: number }) => {
            const taxable = (item.quantity || 0) * (item.rate || 0) * (1 - (item.discountPercent || 0) / 100);
            return sum + taxable * 1.18;
        }, 0);
        return total > 0 ? String(Math.round(total)) : "";
    } catch { return ""; }
}

function renderHistory(raw: string) {
    try {
        const parsed = JSON.parse(raw || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
}

function timeAgo(iso: string) {
    try {
        const diff = (Date.now() - new Date(iso).getTime()) / 1000;
        if (diff < 60) return "just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    } catch { return ""; }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminPage() {
    const [authed, setAuthed] = useState(false);
    const [pwInput, setPwInput] = useState("");
    const [pwError, setPwError] = useState(false);
    const [quotes, setQuotes] = useState<SheetQuote[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<SheetQuote | null>(null);
    const [filterStatus, setFilterStatus] = useState<QuoteStatus | "all">("all");
    const [search, setSearch] = useState("");
    const [adminNote, setAdminNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [toast, setToast] = useState("");
    const [error, setError] = useState("");
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [priceAmount, setPriceAmount] = useState("");
    const [priceNotes, setPriceNotes] = useState("");
    const [generatingQR, setGeneratingQR] = useState(false);

    // ── Invoice generation state ────────────────────────────────────────────
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceItems, setInvoiceItems] = useState<InvoiceLineItem[]>([]);
    const [invoiceCustomerState, setInvoiceCustomerState] = useState("Andhra Pradesh");
    const [generatingInvoice, setGeneratingInvoice] = useState(false);
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);
    const [removingInvoice, setRemovingInvoice] = useState(false);
    const [showEPModal, setShowEPModal] = useState(false);
    const [epItems, setEpItems] = useState<EPLineItem[]>([]);
    const [epCustomerRef, setEpCustomerRef] = useState("");
    const [epNotes, setEpNotes] = useState({
        scope: "", delivery: "", warranty: "", freightPacking: "", installation: "", additionalNotes: "",
    });
    const [epIsRevision, setEpIsRevision] = useState(false);
    const [generatingEP, setGeneratingEP] = useState(false);
    const [downloadingEP, setDownloadingEP] = useState(false);
    const [removingEP, setRemovingEP] = useState(false);

    // ── Load quotes ────────────────────────────────────────────────────────────
    const loadQuotes = useCallback(async (): Promise<SheetQuote[]> => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/quote");
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            const sorted = [...(data.quotes || [])].sort((a, b) =>
                new Date(b["Submitted At"]).getTime() - new Date(a["Submitted At"]).getTime()
            );
            setQuotes(sorted);
            return sorted;
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to load quotes.");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { if (authed) loadQuotes(); }, [authed, loadQuotes]);

    const showToast = (msg: string) => {
        setToast(msg); setTimeout(() => setToast(""), 2800);
    };

    // ── Update status or notes ─────────────────────────────────────────────────
    const updateQuote = async (id: string, patch: { status?: string; adminNotes?: string }) => {
        const applyPatch = (quote: SheetQuote) => ({
            ...quote,
            ...(patch.status ? { "Status": patch.status } : {}),
            ...(patch.adminNotes !== undefined ? { "Admin Notes": patch.adminNotes } : {}),
        });
        const previousQuote = quotes.find(quote => quote["Quote ID"] === id);

        // Reflect the change immediately instead of waiting for a Sheets read-back.
        setQuotes(previous => previous.map(quote => quote["Quote ID"] === id ? applyPatch(quote) : quote));
        setSelected(previous => previous?.["Quote ID"] === id ? applyPatch(previous) : previous);
        setSaving(true);
        try {
            const res = await fetch("/api/quote", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...patch }),
            });
            const data = await res.json();
            if (!data.success) throw new Error("Update failed");
            showToast(patch.status ? "Status updated ✓" : "Note saved ✓");
        } catch {
            // Roll back only when the save did not reach the server.
            if (previousQuote) {
                setQuotes(previous => previous.map(quote => quote["Quote ID"] === id ? previousQuote : quote));
                setSelected(previous => previous?.["Quote ID"] === id ? previousQuote : previous);
            }
            showToast("❌ Update failed — check your connection");
        } finally {
            setSaving(false);
        }
    };

    // ── Intercept "Quoted" click to collect amount first ──────────────────────
    const handleStatusClick = (q: SheetQuote, s: QuoteStatus) => {
        if (s === "quoted") {
            setPriceAmount(q["Payment Amount"] || "");
            setPriceNotes("");
            setShowPriceModal(true);
            return;
        }
        updateQuote(q["Quote ID"], { status: s });
    };

    // ── Generate Razorpay payment link + set status to quoted ─────────────────
    const generateQR = async () => {
        if (!selected) return;
        const amt = Number(priceAmount);
        if (!amt || amt <= 0) { showToast("Enter a valid amount"); return; }
        setGeneratingQR(true);
        try {
            const res = await fetch("/api/quote/razorpay-qr", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-admin-pass": ADMIN_PASSWORD },
                body: JSON.stringify({ id: selected["Quote ID"], amount: amt, notes: priceNotes, customer: { name: selected["Name"], email: selected["Email"], phone: selected["Phone"] } }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || "Failed");
            setShowPriceModal(false);

            setSelected(prev => prev?.["Quote ID"] === selected["Quote ID"]
                ? { ...prev, "Status": "quoted", "Payment Amount": String(amt), "Payment Status": "pending", "QR Image URL": data.paymentUrl, "QR ID": data.paymentLinkId }
                : prev
            );
            setQuotes(prev => prev.map(quote => quote["Quote ID"] === selected["Quote ID"]
                ? { ...quote, "Status": "quoted", "Payment Amount": String(amt), "Payment Status": "pending", "QR Image URL": data.paymentUrl, "QR ID": data.paymentLinkId }
                : quote
            ));
            showToast("Payment link created & status set to Quoted ✓");
        } catch {
            showToast("❌ Failed to create payment link");
        } finally {
            setGeneratingQR(false);
        }
    };

    // ── Mark payment paid/pending ──────────────────────────────────────────────
    const markPaid = async (paid: boolean) => {
        if (!selected) return;
        try {
            await fetch("/api/quote/razorpay-qr", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "x-admin-pass": ADMIN_PASSWORD },
                body: JSON.stringify({ id: selected["Quote ID"], paymentStatus: paid ? "paid" : "pending" }),
            });

            const patch = {
                "Payment Status": paid ? "paid" : "pending",
                ...(paid ? { "Status": "in-production" } : {}),
            };
            setSelected(prev => prev?.["Quote ID"] === selected["Quote ID"] ? { ...prev, ...patch } : prev);
            setQuotes(prev => prev.map(q => q["Quote ID"] === selected["Quote ID"] ? { ...q, ...patch } : q));
            showToast(paid ? "Marked as paid — moved to In Production ✓" : "Marked as pending");
        } catch {
            showToast("❌ Update failed");
        }
    };

    // ── Copy payment link ───────────────────────────────────────────────────────
    const copyPaymentLink = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            showToast("Payment link copied ✓");
        } catch {
            showToast("❌ Couldn't copy link");
        }
    };

    // ── Invoice: open modal pre-filled from the quote's own data ──────────────
    const openInvoiceModal = (q: SheetQuote) => {
        const qty = Number(q["Quantity"]) || 1;
        const amount = Number(q["Payment Amount"]) || 0;
        setInvoiceItems([{
            description: `Custom machined aluminium heat sink — ${q["Fin Type"]?.replace(/-/g, " ") || "fin component"}, ${q["Material"]?.split(" --")[0] || ""}`.trim(),
            hsn: "76169990",
            quantity: qty,
            unit: "Nos",
            totalAmount: amount,
        }]);
        setInvoiceCustomerState(q["Customer State"] || "Andhra Pradesh");
        setShowInvoiceModal(true);
    };

    const openEPModal = (q: SheetQuote) => {
        const qty = Number(q["Quantity"]) || 1;
        const rate = Number(q["Payment Amount"]) || 0;
        setEpItems([{
            description: `Custom-Manufactured Aluminium Heat Sink – ${qty} No., manufactured according to the customer-approved drawing, dimensions and specifications.`,
            hsn: "84195090",
            quantity: qty,
            unit: "Nos",
            rate,
            discountPercent: 0,
        }]);
        setEpCustomerRef("");
        setEpNotes({ scope: "", delivery: "", warranty: "", freightPacking: "", installation: "", additionalNotes: "" });
        setEpIsRevision(false); // ← ADD
        setShowEPModal(true);
    };

    const openEPModalForRevision = (q: SheetQuote) => {
        try {
            const items = JSON.parse((q as unknown as Record<string, string>)["Line Items"] || "[]");
            const savedNotes = JSON.parse((q as unknown as Record<string, string>)["Commercial Notes"] || "{}");
            setEpItems(Array.isArray(items) && items.length > 0 ? items : [
                { description: "", hsn: "84195090", quantity: 1, unit: "Nos", rate: 0, discountPercent: 0 },
            ]);
            setEpCustomerRef(savedNotes.customerRefEnquiry || "");
            setEpNotes({
                scope: savedNotes.scope || "", delivery: savedNotes.delivery || "",
                warranty: savedNotes.warranty || "", freightPacking: savedNotes.freightPacking || "",
                installation: savedNotes.installation || "", additionalNotes: savedNotes.additionalNotes || "",
            });
        } catch {
            // Fall back to a blank item if the stored JSON is malformed.
            setEpItems([{ description: "", hsn: "84195090", quantity: 1, unit: "Nos", rate: 0, discountPercent: 0 }]);
            setEpCustomerRef("");
            setEpNotes({ scope: "", delivery: "", warranty: "", freightPacking: "", installation: "", additionalNotes: "" });
        }
        setEpIsRevision(true);
        setShowEPModal(true);
    };

    const updateEpItem = (index: number, patch: Partial<EPLineItem>) => {
        setEpItems(prev => prev.map((item, i) => i === index ? { ...item, ...patch } : item));
    };
    const addEpItem = () => {
        setEpItems(prev => [...prev, { description: "", hsn: "84195090", quantity: 1, unit: "Nos", rate: 0, discountPercent: 0 }]);
    };
    const removeEpItem = (index: number) => {
        setEpItems(prev => prev.filter((_, i) => i !== index));
    };

    const epGrandTotalPreview = epItems.reduce((sum, item) => {
        const taxable = item.quantity * item.rate * (1 - item.discountPercent / 100);
        return sum + taxable * 1.18;
    }, 0);

    const generateEP = async () => {
        if (!selected) return;
        if (epItems.length === 0) { showToast("Add at least one line item"); return; }
        for (const item of epItems) {
            if (!item.description.trim() || !item.hsn.trim() || !item.quantity || item.quantity <= 0 || !item.rate || item.rate <= 0) {
                showToast("Every line item needs a description, HSN, quantity, and rate");
                return;
            }
        }
        setGeneratingEP(true);
        try {
            const res = await fetch("/api/admin/estimate-proforma/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-admin-pass": ADMIN_PASSWORD },
                body: JSON.stringify({
                    id: selected["Quote ID"], lineItems: epItems, notes: epNotes,
                    customerRefEnquiry: epCustomerRef, isRevision: epIsRevision, // ← ADD isRevision
                }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || "Failed");
            setShowEPModal(false);
            showToast(epIsRevision ? `Revised ${data.piNumber} ✓` : `Estimate & Proforma ${data.piNumber} generated ✓`);

            // Re-fetch from Sheets instead of patching locally — the server
            // just wrote Response History JSON we don't have on the client,
            // so pulling the real row avoids the panel showing stale data
            // until a manual refresh.
            const refreshed = await loadQuotes();
            const updated = refreshed.find(qq => qq["Quote ID"] === selected["Quote ID"]);
            if (updated) setSelected(updated);
            // Local patch above can't include the freshly-written Response
            // History JSON (the backend doesn't return it), so pull the
            // real row from Sheets to pick that up correctly.
            loadQuotes();
        } catch {
            showToast(epIsRevision ? "❌ Failed to revise quote" : "❌ Failed to generate Estimate/Proforma");
        } finally {
            setGeneratingEP(false);
        }
    };

    const removeEP = async () => {
        if (!selected) return;
        if (!window.confirm(`Void PI ${selected["PI Number"]}? The number will not be reused.`)) return;
        setRemovingEP(true);
        try {
            const res = await fetch("/api/admin/estimate-proforma/generate", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "x-admin-pass": ADMIN_PASSWORD },
                body: JSON.stringify({ id: selected["Quote ID"] }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || "Failed");
            setSelected(prev => prev?.["Quote ID"] === selected["Quote ID"] ? { ...prev, "Doc Status": "removed" } : prev);
            setQuotes(prev => prev.map(q => q["Quote ID"] === selected["Quote ID"] ? { ...q, "Doc Status": "removed" } : q));
            showToast("Estimate/Proforma voided");
        } catch {
            showToast("❌ Failed to void documents");
        } finally {
            setRemovingEP(false);
        }
    };

    const downloadEP = async (q: SheetQuote, type: "estimate" | "proforma") => {
        setDownloadingEP(true);
        try {
            const res = await fetch(`/api/${type}/${q["Quote ID"]}`, { headers: { "x-admin-pass": ADMIN_PASSWORD } });
            if (!res.ok) throw new Error("Failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${type === "estimate" ? "Estimate" : "Proforma"}-${q["PI Number"]?.replace(/\//g, "-") || q["Quote ID"]}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            showToast(`❌ Failed to download ${type}`);
        } finally {
            setDownloadingEP(false);
        }
    };

    const updateInvoiceItem = (index: number, patch: Partial<InvoiceLineItem>) => {
        setInvoiceItems(prev => prev.map((item, i) => i === index ? { ...item, ...patch } : item));
    };

    const addInvoiceItem = () => {
        setInvoiceItems(prev => [...prev, { description: "", hsn: "76169990", quantity: 1, unit: "Nos", totalAmount: 0 }]);
    };

    const removeInvoiceItem = (index: number) => {
        setInvoiceItems(prev => prev.filter((_, i) => i !== index));
    };

    const invoiceItemsTotal = invoiceItems.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);

    const generateInvoice = async () => {
        if (!selected) return;
        if (invoiceItems.length === 0) { showToast("Add at least one line item"); return; }
        for (const item of invoiceItems) {
            if (!item.description.trim() || !item.hsn.trim() || !item.quantity || item.quantity <= 0 || !item.totalAmount || item.totalAmount <= 0) {
                showToast("Every line item needs a description, HSN, quantity, and amount");
                return;
            }
        }
        setGeneratingInvoice(true);
        try {
            const res = await fetch("/api/admin/invoice/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-admin-pass": ADMIN_PASSWORD },
                body: JSON.stringify({ id: selected["Quote ID"], customerState: invoiceCustomerState, lineItems: invoiceItems }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || "Failed");
            setShowInvoiceModal(false);

            const patch = { "Invoice Number": data.invoiceNumber, "Invoice Date": data.invoiceDate, "Invoice Status": "active", "Customer State": invoiceCustomerState };
            setSelected(prev => prev?.["Quote ID"] === selected["Quote ID"] ? { ...prev, ...patch } : prev);
            setQuotes(prev => prev.map(q => q["Quote ID"] === selected["Quote ID"] ? { ...q, ...patch } : q));
            showToast(`Invoice ${data.invoiceNumber} generated ✓`);
        } catch {
            showToast("❌ Failed to generate invoice");
        } finally {
            setGeneratingInvoice(false);
        }
    };

    const removeInvoice = async () => {
        if (!selected) return;
        if (!window.confirm(`Void invoice ${selected["Invoice Number"]}? The invoice number will not be reused.`)) return;
        setRemovingInvoice(true);
        try {
            const res = await fetch("/api/admin/invoice/generate", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "x-admin-pass": ADMIN_PASSWORD },
                body: JSON.stringify({ id: selected["Quote ID"] }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || "Failed");
            setSelected(prev => prev?.["Quote ID"] === selected["Quote ID"] ? { ...prev, "Invoice Status": "removed" } : prev);
            setQuotes(prev => prev.map(q => q["Quote ID"] === selected["Quote ID"] ? { ...q, "Invoice Status": "removed" } : q));
            showToast("Invoice voided");
        } catch {
            showToast("❌ Failed to void invoice");
        } finally {
            setRemovingInvoice(false);
        }
    };

    // Downloads via fetch (not a plain <a href>) because the PDF route is
    // gated by the x-admin-pass HEADER, which anchor tags can't send.
    const downloadInvoice = async (q: SheetQuote, copy: "recipient" | "supplier" = "recipient") => {
        setDownloadingInvoice(true);
        try {
            const res = await fetch(`/api/invoice/${q["Quote ID"]}?copy=${copy}`, {
                headers: { "x-admin-pass": ADMIN_PASSWORD },
            });
            if (!res.ok) throw new Error("Failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${q["Invoice Number"]?.replace(/\//g, "-") || q["Quote ID"]}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            showToast("❌ Failed to download invoice");
        } finally {
            setDownloadingInvoice(false);
        }
    };

    // ── Export CSV ─────────────────────────────────────────────────────────────
    const exportCSV = () => {
        if (quotes.length === 0) return;
        const headers = Object.keys(quotes[0]);
        const rows = [headers, ...quotes.map(q => headers.map(h => `"${(q as unknown as Record<string, string>)[h]?.replace(/"/g, "'") || ""}"`))]
            .map(r => r.join(",")).join("\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([rows], { type: "text/csv" }));
        a.download = `ZHeat_Quotes_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        showToast("CSV exported ✓");
    };

    // ── Auth screen ────────────────────────────────────────────────────────────
    if (!authed) {
        return (
            <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4"
                style={{ backgroundImage: "linear-gradient(rgba(6,182,212,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.03) 1px,transparent 1px)", backgroundSize: "48px 48px" }}>
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.8">
                                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-white">ZHeat Admin</h1>
                        <p className="text-slate-400 text-sm mt-1">Quote Management Dashboard</p>
                    </div>
                    <div className="bg-[#0d1520] border border-slate-700/60 rounded-2xl p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2">Admin Password</label>
                            <input type="password" value={pwInput}
                                onChange={e => { setPwInput(e.target.value); setPwError(false); }}
                                onKeyDown={e => { if (e.key === "Enter") { if (pwInput === ADMIN_PASSWORD) setAuthed(true); else setPwError(true); } }}
                                placeholder="Enter password" autoFocus
                                className={`w-full bg-slate-900/60 border ${pwError ? "border-red-500/60" : "border-slate-700/60"} text-cyan-100 font-mono text-sm px-4 py-3 rounded-xl outline-none focus:border-cyan-500/60 transition-all placeholder-slate-600`} />
                            {pwError && <p className="text-xs text-red-400 mt-1.5">Incorrect password. Try again.</p>}
                        </div>
                        <button onClick={() => { if (pwInput === ADMIN_PASSWORD) setAuthed(true); else setPwError(true); }}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm py-3 rounded-xl transition-all shadow-[0_4px_20px_rgba(6,182,212,0.3)]">
                            Sign In →
                        </button>
                    </div>
                    <p className="text-center text-xs text-slate-600 mt-4">Restricted access — Zhivam internal only</p>
                </div>
            </div>
        );
    }

    // ── Filtered list ──────────────────────────────────────────────────────────
    const filtered = quotes.filter(q => {
        const matchStatus = filterStatus === "all" || q["Status"] === filterStatus;
        const s = search.toLowerCase();
        const matchSearch = !s
            || q["Name"].toLowerCase().includes(s)
            || q["Email"].toLowerCase().includes(s)
            || q["Company"].toLowerCase().includes(s)
            || q["Quote ID"].toLowerCase().includes(s)
            || q["Fin Type"].toLowerCase().includes(s);
        return matchStatus && matchSearch;
    });

    const counts: Record<string, number> = { all: quotes.length };
    quotes.forEach(q => { const st = q["Status"]; counts[st] = (counts[st] || 0) + 1; });

    // ── Dashboard ──────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#080c14] text-white font-sans"
            style={{ backgroundImage: "linear-gradient(rgba(6,182,212,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.03) 1px,transparent 1px)", backgroundSize: "48px 48px" }}>

            <style dangerouslySetInnerHTML={{
                __html: `
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(6,182,212,0.2); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(6,182,212,0.4); }
      `}} />

            {/* Price / payment link generation modal */}
            {showPriceModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
                    <div className="bg-[#0d1520] border border-slate-700/60 rounded-2xl w-full max-w-sm p-6">
                        <h3 className="text-white font-bold text-sm mb-4">Set Quote Amount</h3>
                        <label className="block text-xs text-slate-400 mb-1.5">Amount (₹) <span className="text-red-400">*</span></label>
                        <input type="number" min="1" value={priceAmount} onChange={e => setPriceAmount(e.target.value)}
                            className="w-full bg-slate-900/60 border border-slate-700/60 text-cyan-100 font-mono text-sm px-3 py-2 rounded-lg outline-none focus:border-cyan-500/60 mb-3" />
                        <label className="block text-xs text-slate-400 mb-1.5">Notes <span className="text-slate-600">(optional, shown on payment page)</span></label>
                        <input type="text" value={priceNotes} onChange={e => setPriceNotes(e.target.value)}
                            placeholder={`ZHeat Quote ${selected?.["Quote ID"] || ""}`}
                            className="w-full bg-slate-900/60 border border-slate-700/60 text-cyan-100 font-mono text-sm px-3 py-2 rounded-lg outline-none focus:border-cyan-500/60 mb-4" />
                        <div className="flex gap-2">
                            <button onClick={() => setShowPriceModal(false)} className="flex-1 py-2 rounded-lg border border-slate-700/60 text-slate-400 text-xs font-semibold">Cancel</button>
                            <button onClick={generateQR} disabled={generatingQR} className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold disabled:opacity-50">
                                {generatingQR ? "Creating..." : "Create Payment Link"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice generation modal */}
            {showInvoiceModal && selected && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
                    <div className="bg-[#0d1520] border border-slate-700/60 rounded-2xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto">
                        <h3 className="text-white font-bold text-sm mb-1">Generate Invoice — {selected["Quote ID"]}</h3>
                        <p className="text-xs text-slate-500 mb-4">Review the pre-filled line item, or add more. This becomes the fixed record on the tax invoice.</p>

                        <label className="block text-xs text-slate-400 mb-1.5">Customer State (place of supply)</label>
                        <select value={invoiceCustomerState} onChange={e => setInvoiceCustomerState(e.target.value)}
                            className="w-full bg-slate-900/60 border border-slate-700/60 text-cyan-100 text-sm px-3 py-2 rounded-lg outline-none focus:border-cyan-500/60 mb-4">
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <div className="space-y-3">
                            {invoiceItems.map((item, i) => (
                                <div key={i} className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Item {i + 1}</span>
                                        {invoiceItems.length > 1 && (
                                            <button onClick={() => removeInvoiceItem(i)} className="text-[10px] text-red-400 hover:text-red-300">Remove</button>
                                        )}
                                    </div>
                                    <textarea value={item.description} onChange={e => updateInvoiceItem(i, { description: e.target.value })} rows={2}
                                        placeholder="Description of goods"
                                        className="w-full bg-slate-950/60 border border-slate-700/60 text-slate-200 text-xs px-2.5 py-2 rounded-lg outline-none focus:border-cyan-500/60 resize-none" />
                                    <div className="grid grid-cols-4 gap-2">
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-1">HSN/SAC</label>
                                            <input value={item.hsn} onChange={e => updateInvoiceItem(i, { hsn: e.target.value })}
                                                className="w-full bg-slate-950/60 border border-slate-700/60 text-cyan-100 font-mono text-xs px-2 py-1.5 rounded-lg outline-none focus:border-cyan-500/60" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-1">Quantity</label>
                                            <input type="number" min="1" value={item.quantity} onChange={e => updateInvoiceItem(i, { quantity: Number(e.target.value) })}
                                                className="w-full bg-slate-950/60 border border-slate-700/60 text-cyan-100 font-mono text-xs px-2 py-1.5 rounded-lg outline-none focus:border-cyan-500/60" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-1">Unit</label>
                                            <input value={item.unit} onChange={e => updateInvoiceItem(i, { unit: e.target.value })}
                                                className="w-full bg-slate-950/60 border border-slate-700/60 text-cyan-100 font-mono text-xs px-2 py-1.5 rounded-lg outline-none focus:border-cyan-500/60" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-1">Amount (₹, incl. GST)</label>
                                            <input type="number" min="0" value={item.totalAmount} onChange={e => updateInvoiceItem(i, { totalAmount: Number(e.target.value) })}
                                                className="w-full bg-slate-950/60 border border-slate-700/60 text-cyan-100 font-mono text-xs px-2 py-1.5 rounded-lg outline-none focus:border-cyan-500/60" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button onClick={addInvoiceItem} className="mt-3 text-xs font-semibold text-cyan-400 hover:text-cyan-300">+ Add another item</button>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/60">
                            <span className="text-xs text-slate-400">Total: <span className="text-white font-bold">₹{invoiceItemsTotal.toLocaleString("en-IN")}</span></span>
                            <div className="flex gap-2">
                                <button onClick={() => setShowInvoiceModal(false)} className="px-4 py-2 rounded-lg border border-slate-700/60 text-slate-400 text-xs font-semibold">Cancel</button>
                                <button onClick={generateInvoice} disabled={generatingInvoice} className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold disabled:opacity-50">
                                    {generatingInvoice ? "Generating..." : "Generate Invoice"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEPModal && selected && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
                    <div className="bg-[#0d1520] border border-slate-700/60 rounded-2xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto">
                        <h3 className="text-white font-bold text-sm mb-1">
                            {epIsRevision ? `Revise Quote — ${selected["Quote ID"]}` : `Generate Estimate & Proforma — ${selected["Quote ID"]}`}
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">Both documents share the same PI number and are generated together.</p>

                        <label className="block text-xs text-slate-400 mb-1.5">Customer Ref. / Enquiry <span className="text-slate-600">(optional, e.g. &quot;Email dated Jul 11,2026&quot;)</span></label>
                        <input value={epCustomerRef} onChange={e => setEpCustomerRef(e.target.value)}
                            className="w-full bg-slate-900/60 border border-slate-700/60 text-cyan-100 text-sm px-3 py-2 rounded-lg outline-none focus:border-cyan-500/60 mb-4" />

                        <div className="space-y-3">
                            {epItems.map((item, i) => (
                                <div key={i} className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Item {i + 1}</span>
                                        {epItems.length > 1 && (
                                            <button onClick={() => removeEpItem(i)} className="text-[10px] text-red-400 hover:text-red-300">Remove</button>
                                        )}
                                    </div>
                                    <textarea value={item.description} onChange={e => updateEpItem(i, { description: e.target.value })} rows={2}
                                        placeholder="Description of goods"
                                        className="w-full bg-slate-950/60 border border-slate-700/60 text-slate-200 text-xs px-2.5 py-2 rounded-lg outline-none focus:border-cyan-500/60 resize-none" />
                                    <div className="grid grid-cols-5 gap-2">
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-1">HSN/SAC</label>
                                            <input value={item.hsn} onChange={e => updateEpItem(i, { hsn: e.target.value })}
                                                className="w-full bg-slate-950/60 border border-slate-700/60 text-cyan-100 font-mono text-xs px-2 py-1.5 rounded-lg outline-none focus:border-cyan-500/60" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-1">Qty</label>
                                            <input type="number" min="1" value={item.quantity} onChange={e => updateEpItem(i, { quantity: Number(e.target.value) })}
                                                className="w-full bg-slate-950/60 border border-slate-700/60 text-cyan-100 font-mono text-xs px-2 py-1.5 rounded-lg outline-none focus:border-cyan-500/60" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-1">Unit</label>
                                            <input value={item.unit} onChange={e => updateEpItem(i, { unit: e.target.value })}
                                                className="w-full bg-slate-950/60 border border-slate-700/60 text-cyan-100 font-mono text-xs px-2 py-1.5 rounded-lg outline-none focus:border-cyan-500/60" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-1">Rate (₹/unit)</label>
                                            <input type="number" min="0" value={item.rate} onChange={e => updateEpItem(i, { rate: Number(e.target.value) })}
                                                className="w-full bg-slate-950/60 border border-slate-700/60 text-cyan-100 font-mono text-xs px-2 py-1.5 rounded-lg outline-none focus:border-cyan-500/60" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 mb-1">Disc. %</label>
                                            <input type="number" min="0" max="100" value={item.discountPercent} onChange={e => updateEpItem(i, { discountPercent: Number(e.target.value) })}
                                                className="w-full bg-slate-950/60 border border-slate-700/60 text-cyan-100 font-mono text-xs px-2 py-1.5 rounded-lg outline-none focus:border-cyan-500/60" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={addEpItem} className="mt-3 text-xs font-semibold text-cyan-400 hover:text-cyan-300">+ Add another item</button>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {([
                                ["scope", "Project / Scope"], ["delivery", "Delivery Lead Time"],
                                ["warranty", "Warranty"], ["freightPacking", "Freight / Packing"],
                                ["installation", "Installation / Commissioning"], ["additionalNotes", "Additional Notes"],
                            ] as const).map(([key, label]) => (
                                <div key={key}>
                                    <label className="block text-[10px] text-slate-500 mb-1">{label} <span className="text-slate-600">(optional)</span></label>
                                    <input value={epNotes[key]} onChange={e => setEpNotes(prev => ({ ...prev, [key]: e.target.value }))}
                                        className="w-full bg-slate-950/60 border border-slate-700/60 text-slate-200 text-xs px-2.5 py-2 rounded-lg outline-none focus:border-cyan-500/60" />
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/60">
                            <span className="text-xs text-slate-400">Est. Total (incl. GST): <span className="text-white font-bold">₹{epGrandTotalPreview.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span></span>
                            <div className="flex gap-2">
                                <button onClick={() => setShowEPModal(false)} className="px-4 py-2 rounded-lg border border-slate-700/60 text-slate-400 text-xs font-semibold">Cancel</button>
                                <button onClick={generateEP} disabled={generatingEP} className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold disabled:opacity-50">
                                    {generatingEP ? "Generating..." : "Generate Both"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed top-5 right-5 z-[9999] bg-cyan-500 text-black text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl">
                    {toast}
                </div>
            )}

            {/* Top bar */}
            <header className="sticky top-0 z-50 bg-[#080c14]/90 backdrop-blur border-b border-slate-700/40 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                    </div>
                    <div>
                        <span className="font-bold text-white text-sm">ZHeat</span>
                        <span className="text-slate-500 text-sm"> / Admin</span>
                    </div>
                    <span className="hidden md:inline font-mono text-[9px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded tracking-wider">QUOTE DASHBOARD</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={loadQuotes} disabled={loading}
                        className="flex items-center gap-1.5 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-500 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? "animate-spin" : ""}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>
                        Refresh
                    </button>
                    <button onClick={exportCSV} className="flex items-center gap-1.5 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                        Export CSV
                    </button>
                    <button onClick={() => setAuthed(false)} className="flex items-center gap-1.5 border border-slate-700/50 text-slate-400 hover:text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-all">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                        Sign Out
                    </button>
                </div>
            </header>

            <div className="flex" style={{ height: "calc(100vh - 57px)" }}>

                {/* ── LEFT: Quote list ─────────────────────────────────────────────── */}
                <div className="w-full md:w-[380px] flex-shrink-0 border-r border-slate-700/40 flex flex-col">

                    {/* Status filter tabs */}
                    <div className="grid grid-cols-6 border-b border-slate-700/40 flex-shrink-0">
                        {(["all", "new", "in-progress", "awaiting-response", "quoted", "in-production"] as const).map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                className={`flex flex-col items-center py-3 border-b-2 transition-all ${filterStatus === s ? "border-cyan-500 bg-cyan-500/5" : "border-transparent hover:bg-slate-800/30"}`}>
                                <span className={`font-bold text-lg leading-none ${filterStatus === s ? "text-white" : "text-slate-400"}`}>{counts[s] || 0}</span>
                                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 mt-0.5">{s === "all" ? "Total" : s === "in-progress" ? "Active" : s}</span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="p-3 border-b border-slate-700/40 flex-shrink-0">
                        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search name, email, fin type..."
                                className="flex-1 bg-transparent text-xs text-slate-300 outline-none placeholder-slate-600 font-mono" />
                            {search && <button onClick={() => setSearch("")} className="text-slate-600 hover:text-slate-400 text-xs">✕</button>}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-40 gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-cyan-400 animate-spin" />
                                <span className="text-xs text-slate-500 font-mono">Loading from Google Sheets...</span>
                            </div>
                        ) : error ? (
                            <div className="p-4 m-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 text-center">
                                <p className="font-semibold mb-1">Failed to load quotes</p>
                                <p className="text-red-500/70">{error}</p>
                                <button onClick={loadQuotes} className="mt-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all">Retry</button>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-600 text-xs gap-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                {search || filterStatus !== "all" ? "No quotes match your filter" : "No quotes yet"}
                            </div>
                        ) : filtered.map(q => {
                            const st = (q["Status"] || "new") as QuoteStatus;
                            const cfg = STATUS_CONFIG[st] || STATUS_CONFIG["new"];
                            const isSelected = selected?.["Quote ID"] === q["Quote ID"];
                            return (
                                <button key={q["Quote ID"]} onClick={() => { setSelected(q); setAdminNote(q["Admin Notes"] || ""); }}
                                    className={`w-full text-left px-4 py-3.5 border-b border-slate-800/60 transition-all hover:bg-slate-800/30 ${isSelected ? "bg-cyan-500/5 border-l-2 border-l-cyan-500" : ""}`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-semibold text-sm text-white truncate">{q["Name"]}</span>
                                                {st === "new" && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 animate-pulse" />}
                                            </div>
                                            <div className="text-xs text-slate-400 truncate">{q["Company"] || q["Email"]}</div>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                                                <span className="text-[10px] text-slate-600 font-mono truncate">{q["Fin Type"]?.replace(/-/g, " ") || "—"}</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-[10px] text-slate-500 font-mono">{timeAgo(q["Submitted At"])}</div>
                                            <div className="text-[10px] text-slate-600 font-mono mt-0.5">×{q["Quantity"]}</div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── RIGHT: Detail panel ──────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto">
                    {!selected ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600 text-center">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                            <p className="text-sm">Select a quote to view details</p>
                        </div>
                    ) : (() => {
                        const q = selected;
                        const st = (q["Status"] || "new") as QuoteStatus;
                        const cfg = STATUS_CONFIG[st] || STATUS_CONFIG["new"];

                        const hasGeometry = q["Fin Type"] || q["Base L (mm)"];
                        const hasThermal = q["Heat Input Q (W)"] || q["Fin Efficiency η (%)"];
                        const paymentUrl = q["QR Image URL"] || (q as unknown as Record<string, string>)["Payment Link URL"] || (q as unknown as Record<string, string>)["Payment Link"] || "";

                        return (
                            <div className="p-6 flex gap-5 items-start">
                                <div className="space-y-5 max-w-3xl flex-1 min-w-0">

                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h2 className="text-lg font-bold text-white">{q["Name"]}</h2>
                                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border border-current/20 ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono">{q["Quote ID"]} · {fmt(q["Submitted At"])}</div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-4">
                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Update Status</div>
                                        <div className="flex gap-2 flex-wrap">
                                            {(["new", "in-progress", "awaiting-response", "quoted", "in-production", "closed"] as QuoteStatus[]).map(s => {
                                                const c = STATUS_CONFIG[s];
                                                return (
                                                    <button key={s} disabled={saving} onClick={() => handleStatusClick(q, s)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 ${st === s ? `${c.bg} ${c.text} border-current/30` : "bg-transparent border-slate-700/50 text-slate-500 hover:border-slate-500 hover:text-slate-300"}`}>
                                                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${c.dot} mr-1.5`} />
                                                        {c.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Estimate & Proforma */}
                                    <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-4">
                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Estimate & Proforma Invoice</div>
                                        {q["Doc Status"] === "active" && q["PI Number"] ? (
                                            <div className="space-y-2">
                                                <div className="text-xs"><span className="text-slate-500">PI Number:</span> <span className="text-cyan-300 font-mono">{q["PI Number"]}</span></div>
                                                <div className="text-xs"><span className="text-slate-500">PI Date:</span> <span className="text-slate-300">{q["PI Date"] ? new Date(q["PI Date"]).toLocaleDateString("en-IN") : "—"}</span></div>
                                                <div className="flex gap-2 flex-wrap mt-2">
                                                    <button onClick={() => downloadEP(q, "estimate")} disabled={downloadingEP}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50">
                                                        {downloadingEP ? "Downloading..." : "Download Estimate"}
                                                    </button>
                                                    <button onClick={() => downloadEP(q, "proforma")} disabled={downloadingEP}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 disabled:opacity-50">
                                                        {downloadingEP ? "Downloading..." : "Download Proforma"}
                                                    </button>
                                                    <button onClick={() => openEPModalForRevision(q)}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20">
                                                        Edit / Revise
                                                    </button>
                                                    <button onClick={removeEP} disabled={removingEP}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 disabled:opacity-50">
                                                        {removingEP ? "Voiding..." : "Void"}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : q["Doc Status"] === "removed" ? (
                                            <div className="space-y-2">
                                                <p className="text-xs text-red-400/80">PI {q["PI Number"]} was voided and cannot be reused.</p>
                                                <button onClick={() => openEPModal(q)} className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs font-semibold hover:bg-cyan-500/20">Generate New</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => openEPModal(q)} className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs font-semibold hover:bg-cyan-500/20">Generate Estimate + Proforma</button>
                                        )}
                                    </div>

                                    {/* Payment */}
                                    {(q["Payment Amount"] || paymentUrl || (st === "quoted" && q["Customer Response"] !== "accepted")) && (
                                        <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-4">
                                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Payment</div>
                                            {paymentUrl ? (
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2">
                                                        <span className="flex-1 text-xs font-mono text-cyan-300 truncate">{paymentUrl}</span>
                                                        <button
                                                            onClick={() => copyPaymentLink(paymentUrl)}
                                                            className="shrink-0 px-2.5 py-1 rounded-md text-[10px] font-semibold border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
                                                        >
                                                            Copy
                                                        </button>
                                                        <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all">Open</a>
                                                    </div>
                                                    <div className="text-xs space-y-1.5">
                                                        <div><span className="text-slate-500">Amount:</span> <span className="text-cyan-300 font-mono">₹{q["Payment Amount"]}</span></div>
                                                        <div>
                                                            <span className="text-slate-500">Status:</span>{" "}
                                                            <span className={q["Payment Status"] === "paid" ? "text-green-400" : "text-amber-400"}>
                                                                {q["Payment Status"] === "paid" ? "Paid ✓" : "Pending"}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-2 mt-2">
                                                            {q["Payment Status"] !== "paid" ? (
                                                                <button onClick={() => markPaid(true)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20">Mark Paid</button>
                                                            ) : (
                                                                <button onClick={() => markPaid(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20">Mark Pending</button>
                                                            )}
                                                            <button onClick={() => { setPriceAmount(q["Payment Amount"] || ""); setPriceNotes(""); setShowPriceModal(true); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700/50 text-slate-400 hover:text-white">Regenerate Payment Link</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={() => { setPriceAmount(""); setPriceNotes(""); setShowPriceModal(true); }} className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs font-semibold hover:bg-cyan-500/20">Create Payment Link</button>
                                            )}
                                        </div>
                                    )}

                                    {/* Invoice */}
                                    {q["Payment Status"] === "paid" && (
                                        <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-4">
                                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Invoice</div>
                                            {q["Invoice Status"] === "active" && q["Invoice Number"] ? (
                                                <div className="space-y-2">
                                                    <div className="text-xs"><span className="text-slate-500">Number:</span> <span className="text-cyan-300 font-mono">{q["Invoice Number"]}</span></div>
                                                    <div className="text-xs"><span className="text-slate-500">Date:</span> <span className="text-slate-300">{q["Invoice Date"] ? new Date(q["Invoice Date"]).toLocaleDateString("en-IN") : "—"}</span></div>
                                                    <div className="flex gap-2 flex-wrap mt-2">
                                                        <button onClick={() => downloadInvoice(q, "recipient")} disabled={downloadingInvoice}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50">
                                                            {downloadingInvoice ? "Downloading..." : "Download (Customer Copy)"}
                                                        </button>
                                                        <button onClick={() => downloadInvoice(q, "supplier")} disabled={downloadingInvoice}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700/50 text-slate-400 hover:text-white disabled:opacity-50">
                                                            Download (Office Copy)
                                                        </button>
                                                        <button onClick={removeInvoice} disabled={removingInvoice}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 disabled:opacity-50">
                                                            {removingInvoice ? "Voiding..." : "Void Invoice"}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : q["Invoice Status"] === "removed" ? (
                                                <div className="space-y-2">
                                                    <p className="text-xs text-red-400/80">Invoice {q["Invoice Number"]} was voided and cannot be reused. Generate a new one if needed.</p>
                                                    <button onClick={() => openInvoiceModal(q)} className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs font-semibold hover:bg-cyan-500/20">Generate New Invoice</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => openInvoiceModal(q)} className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs font-semibold hover:bg-cyan-500/20">Generate Invoice</button>
                                            )}
                                        </div>
                                    )}

                                    {/* Contact */}
                                    <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-4">
                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Contact Details</div>
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
                                            {[
                                                ["Name", q["Name"]], ["Email", q["Email"]],
                                                ["Company", q["Company"] || "—"], ["Phone", q["Phone"] || "—"],
                                                ["Quantity", `× ${q["Quantity"]} units`], ["Surface Finish", q["Surface Finish"]],
                                            ].map(([label, val]) => (
                                                <div key={label}>
                                                    <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">{label}</div>
                                                    <div className="text-slate-200 font-mono break-all">{val}</div>
                                                </div>
                                            ))}
                                            {q["Customer Notes"] && (
                                                <div className="col-span-2">
                                                    <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Customer Notes</div>
                                                    <div className="text-slate-300 bg-slate-900/40 rounded-lg px-3 py-2 leading-relaxed">{q["Customer Notes"]}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Geometry */}
                                    {hasGeometry && (
                                        <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-4">
                                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Fin Geometry</div>
                                            <div className="grid grid-cols-3 gap-x-4 gap-y-3 text-xs">
                                                {[
                                                    ["Fin Type", q["Fin Type"]?.replace(/-/g, " ")],
                                                    ["Base (L × W)", `${q["Base L (mm)"]} × ${q["Base W (mm)"]} mm`],
                                                    ["Total Height", `${q["Total H (mm)"]} mm`],
                                                    ["Base Thickness", `${q["Base Thickness (mm)"]} mm`],
                                                    ["Fin Height", `${q["Fin Height (mm)"]} mm`],
                                                    ["Fin Thick / ⌀", `${q["Fin Thickness (mm)"]} / ${q["Pin Dia (mm)"]} mm`],
                                                    ["Taper Ratio", q["Taper"]],
                                                    ["No. of Fins/Pins", q["No. of Fins"]],
                                                    ["Material", q["Material"]?.split(" --")[0]],
                                                    ["k (W/m·K)", q["k (W/m·K)"]],
                                                ].map(([label, val]) => (
                                                    <div key={label}>
                                                        <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">{label}</div>
                                                        <div className="text-cyan-300 font-mono">{val || "—"}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Thermal */}
                                    {hasThermal && (
                                        <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-4">
                                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Thermal Analysis</div>
                                            <div className="grid grid-cols-4 gap-3 mb-3">
                                                {[
                                                    { label: "Fin Eff. η", val: `${q["Fin Efficiency η (%)"] || "—"}%`, color: "text-cyan-400" },
                                                    { label: "Effectiveness ε", val: q["Effectiveness ε"] || "—", color: parseFloat(q["Effectiveness ε"]) >= 2 ? "text-green-400" : "text-red-400" },
                                                    { label: "T_base", val: `${q["T_base (°C)"] || "—"}°C`, color: parseFloat(q["T_base (°C)"]) > 85 ? "text-red-400" : parseFloat(q["T_base (°C)"]) > 70 ? "text-amber-400" : "text-green-400" },
                                                    { label: "Rθ (°C/W)", val: q["Rθ (°C/W)"] || "—", color: "text-orange-400" },
                                                ].map(kpi => (
                                                    <div key={kpi.label} className="bg-slate-900/40 rounded-xl p-3 text-center">
                                                        <div className={`font-mono font-bold text-base ${kpi.color}`}>{kpi.val}</div>
                                                        <div className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider">{kpi.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs">
                                                {[
                                                    ["Heat Input Q", `${q["Heat Input Q (W)"]} W`],
                                                    ["Conv. Coeff. h", `${q["Conv. Coeff h"]} W/m²·K`],
                                                    ["Ambient T∞", `${q["Ambient T (°C)"]} °C`],
                                                    ["T_tip", `${q["T_tip (°C)"]} °C`],
                                                    ["ΔT base–tip", `${(parseFloat(q["T_base (°C)"]) - parseFloat(q["T_tip (°C)"])).toFixed(1)} °C`],
                                                    ["ΔT base–amb", `${(parseFloat(q["T_base (°C)"]) - parseFloat(q["Ambient T (°C)"])).toFixed(1)} °C`],
                                                ].map(([label, val]) => (
                                                    <div key={label}>
                                                        <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">{label}</div>
                                                        <div className="text-slate-300 font-mono">{isNaN(parseFloat(val as string)) ? val : val}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Admin notes */}
                                    <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-4">
                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Internal Admin Notes</div>
                                        <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={4}
                                            placeholder="Pricing, machinist instructions, follow-up actions..."
                                            className="w-full bg-slate-900/60 border border-slate-700/60 text-slate-200 font-mono text-xs px-3 py-2.5 rounded-xl outline-none focus:border-cyan-500/60 transition-all resize-none placeholder-slate-600" />
                                        <button onClick={() => updateQuote(q["Quote ID"], { adminNotes: adminNote })} disabled={saving}
                                            className="mt-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold rounded-lg transition-all disabled:opacity-50">
                                            {saving ? "Saving..." : "Save Note"}
                                        </button>
                                    </div>

                                </div>

                                {/* Right column — sticky, shows accept action / negotiate action / history */}
                                {(q["Customer Response"] === "negotiating" || q["Customer Response"] === "accepted" || renderHistory(q["Response History"]).length > 0) && (
                                    <div className="w-80 flex-shrink-0 sticky top-6 hidden lg:block space-y-4">

                                        {q["Customer Response"] === "accepted" && (
                                            <div className="bg-green-500/5 border-2 border-green-500/40 rounded-2xl p-5">
                                                <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">✓ Customer Accepted</div>
                                                <p className="text-[10px] text-slate-500 mb-3">{q["Customer Response At"] ? fmt(q["Customer Response At"]) : ""}</p>
                                                {!paymentUrl ? (
                                                    <button
                                                        onClick={() => { setPriceAmount(q["Payment Amount"] || epTotalFromQuote(q)); setPriceNotes(""); setShowPriceModal(true); }}
                                                        className="w-full px-4 py-2 bg-green-500 hover:bg-green-400 text-black rounded-lg text-xs font-bold transition-all"
                                                    >
                                                        Set Price & Create Payment Link →
                                                    </button>
                                                ) : (
                                                    <p className="text-xs text-slate-400">Payment link already created — see Payment section below.</p>
                                                )}
                                            </div>
                                        )}

                                        {q["Customer Response"] === "negotiating" && (
                                            <div className="bg-amber-500/5 border-2 border-amber-500/40 rounded-2xl p-5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                                                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                                    </svg>
                                                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Customer Requested Changes</span>
                                                </div>
                                                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                                                    {q["Customer Response Notes"] || "No details provided."}
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-4">{q["Customer Response At"] ? fmt(q["Customer Response At"]) : ""}</p>
                                                <button onClick={() => openEPModalForRevision(q)}
                                                    className="mt-4 w-full px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-bold transition-all">
                                                    Edit Estimate & Proforma →
                                                </button>
                                            </div>
                                        )}

                                        {renderHistory(q["Response History"]).length > 0 && (
                                            <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-4">
                                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Response History</div>
                                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                                    {[...renderHistory(q["Response History"])].reverse().map((entry, i) => {
                                                        const isAccept = entry.response === "accepted";
                                                        const isRevise = entry.response === "revised";
                                                        const color = isAccept ? "text-green-400" : isRevise ? "text-cyan-400" : "text-amber-400";
                                                        const label = isAccept ? "Customer accepted" : isRevise ? "Admin revised quote" : "Customer requested changes";
                                                        return (
                                                            <div key={i} className="border-l-2 border-slate-700/60 pl-3">
                                                                <div className={`text-xs font-semibold ${color}`}>{label}</div>
                                                                {entry.piNumber && <div className="text-[10px] text-slate-600 font-mono">{entry.piNumber}</div>}
                                                                {entry.notes && (
                                                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{entry.notes}</p>
                                                                )}
                                                                <div className="text-[10px] text-slate-600 mt-1">{entry.at ? fmt(entry.at) : ""}</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}