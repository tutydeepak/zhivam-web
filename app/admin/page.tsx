"use client";
import React, { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type QuoteStatus = "new" | "in-progress" | "quoted" | "closed";

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
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = "Zhivam@2026";

const STATUS_CONFIG: Record<QuoteStatus, { label: string; bg: string; text: string; dot: string }> = {
    "new": { label: "New", bg: "bg-cyan-500/10", text: "text-cyan-400", dot: "bg-cyan-400" },
    "in-progress": { label: "In Progress", bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
    "quoted": { label: "Quoted", bg: "bg-green-500/10", text: "text-green-400", dot: "bg-green-400" },
    "closed": { label: "Closed", bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-500" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(iso: string) {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
            + " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
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

    // ── Load quotes ────────────────────────────────────────────────────────────
    const loadQuotes = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/quote");
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            // Sort newest first
            const sorted = [...(data.quotes || [])].sort((a, b) =>
                new Date(b["Submitted At"]).getTime() - new Date(a["Submitted At"]).getTime()
            );
            setQuotes(sorted);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to load quotes.");
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
        setSaving(true);
        try {
            const res = await fetch("/api/quote", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...patch }),
            });
            const data = await res.json();
            if (!data.success) throw new Error("Update failed");
            // Refresh
            await loadQuotes();
            // Re-select updated quote
            setSelected(prev => prev?.["Quote ID"] === id
                ? { ...prev, ...(patch.status ? { "Status": patch.status } : {}), ...(patch.adminNotes !== undefined ? { "Admin Notes": patch.adminNotes } : {}) }
                : prev
            );
            showToast(patch.status ? "Status updated ✓" : "Note saved ✓");
        } catch {
            showToast("❌ Update failed — check your connection");
        } finally {
            setSaving(false);
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
                    <div className="grid grid-cols-4 border-b border-slate-700/40 flex-shrink-0">
                        {(["all", "new", "in-progress", "quoted"] as const).map(s => (
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

                        return (
                            <div className="p-6 space-y-5 max-w-3xl">

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
                                        {(["new", "in-progress", "quoted", "closed"] as QuoteStatus[]).map(s => {
                                            const c = STATUS_CONFIG[s];
                                            return (
                                                <button key={s} disabled={saving} onClick={() => updateQuote(q["Quote ID"], { status: s })}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 ${st === s ? `${c.bg} ${c.text} border-current/30` : "bg-transparent border-slate-700/50 text-slate-500 hover:border-slate-500 hover:text-slate-300"}`}>
                                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${c.dot} mr-1.5`} />
                                                    {c.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

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
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}