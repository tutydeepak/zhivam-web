"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Quote {
    id: string;
    submittedAt: string;
    status: string;
    contact: { name: string; email: string; company: string; phone: string; qty: string; finish: string; notes: string };
    geometry: { type: string; L_mm: string; W_mm: string; TH_mm: string; BH_mm: string; FH_mm: string; FT_mm: string; PD_mm: string; taper: string; Nfins: string; material: string; k: string };
    thermal: { Q: string; h: string; Ta: string; eta: string; eps: string; Tbase: string; Ttip: string; R: string };
    adminNotes: string;
    payment?: { amount: string; status: string; paymentUrl: string };
    documents?: { piNumber: string; docStatus: string; invoiceNumber: string; invoiceStatus: string };

}

const STEPS = ["New", "In Progress", "Quoted", "Closed"];

const STATUS_STYLES: Record<string, string> = {
    new: "bg-slate-500/10 text-slate-300 border-slate-500/30",
    "in progress": "bg-orange-500/10 text-orange-300 border-orange-500/30",
    quoted: "bg-sky-500/10 text-sky-300 border-sky-500/30",
    closed: "bg-green-500/10 text-green-300 border-green-500/30",
};

function StatusBadge({ status }: { status: string }) {
    const key = status?.toLowerCase().replace(/-/g, " ") || "new";
    const cls = STATUS_STYLES[key] || STATUS_STYLES.new;
    return (
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cls}`}>
            {status?.replace(/-/g, " ") || "New"}
        </span>
    );
}

function StatusStepper({ status }: { status: string }) {
    const normalized = status?.toLowerCase().replace(/-/g, " ") || "new";
    const currentIdx = STEPS.findIndex(s => s.toLowerCase() === normalized);
    const idx = currentIdx === -1 ? 0 : currentIdx;
    return (
        <div className="flex items-center w-full">
            {STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                        <div
                            className={`w-3 h-3 rounded-full border-2 transition-all ${i <= idx ? "bg-cyan-400 border-cyan-400" : "bg-slate-800 border-slate-600"
                                }`}
                        />
                        <span className={`text-[10px] whitespace-nowrap ${i <= idx ? "text-cyan-400 font-medium" : "text-slate-500"}`}>
                            {step}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className={`h-0.5 flex-1 mx-1 mb-4 rounded ${i < idx ? "bg-cyan-400" : "bg-slate-700"}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

function CopyIdButton({ id, className = "" }: { id: string; className?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(id);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Clipboard is unavailable in this browser context.
        }
    };

    return (
        <span
            role="button"
            tabIndex={0}
            onClick={handleCopy}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleCopy(e as unknown as React.MouseEvent); }}
            className={`inline-flex items-center gap-1 text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer ${className}`}
            aria-label="Copy quote ID"
        >
            {copied ? (
                <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-[11px] text-green-400">Copied</span>
                </>
            ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
            )}
        </span>
    );
}

function DetailRow({ label, value }: { label: string; value?: string | number }) {
    if (value === undefined || value === "" || value === null) return null;
    return (
        <div className="flex justify-between py-1.5 border-b border-slate-800/60 last:border-0">
            <span className="text-xs text-slate-500">{label}</span>
            <span className="text-xs font-mono text-slate-200">{value}</span>
        </div>
    );
}

// Payment action card. The saved payment URL opens Razorpay hosted checkout.
function PaymentCard({ quote }: { quote: Quote }) {
    const p = quote.payment;
    if (quote.status?.toLowerCase() !== "quoted" || !p?.paymentUrl) return null;

    const paid = p.status?.toLowerCase() === "paid";

    return (
        <div
            className={`rounded-xl p-4 border ${paid ? "bg-green-500/5 border-green-500/20" : "bg-cyan-500/5 border-cyan-500/20"}`}
            onClick={e => e.stopPropagation()} // keep taps inside this card from opening the detail modal / card button
        >
            <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400">
                    {paid ? "Payment Received" : "Quoted — Pay to Proceed"}
                </div>
                {p.amount && (
                    <span className="text-sm font-bold text-white">₹{p.amount}</span>
                )}
            </div>

            {paid ? (
                <p className="text-xs text-green-400">Thank you — your payment has been received.</p>
            ) : (
                <div className="space-y-3">
                    <p className="text-[11px] text-slate-400">
                        Your quote is ready. Pay the quoted amount securely through Razorpay{p.amount ? ` (₹${p.amount})` : ""}.
                    </p>
                    <a
                        href={p.paymentUrl}
                        className="inline-flex items-center gap-2 w-full justify-center px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm rounded-lg transition-all"
                    >
                        Pay Now
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                    </a>
                </div>
            )}
        </div>
    );
}

function DocumentsCard({ quote }: { quote: Quote }) {
    const d = quote.documents;
    const hasEP = d?.docStatus?.toLowerCase() === "active" && !!d?.piNumber;
    const hasTaxInvoice = d?.invoiceStatus?.toLowerCase() === "active" && !!d?.invoiceNumber;

    const [downloadingType, setDownloadingType] = useState<"estimate" | "proforma" | "invoice" | null>(null);
    const [failedType, setFailedType] = useState<"estimate" | "proforma" | "invoice" | null>(null);

    if (!hasEP && !hasTaxInvoice) return null;

    const download = async (type: "estimate" | "proforma" | "invoice", e: React.MouseEvent) => {
        e.stopPropagation();
        if (downloadingType) return; // prevent double-clicks while one is already in flight
        setFailedType(null);
        setDownloadingType(type);
        try {
            const res = await fetch(`/api/${type}/${quote.id}`, { credentials: "include" });
            if (!res.ok) throw new Error("Download failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${type}-${quote.id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            setFailedType(type);
            setTimeout(() => setFailedType(null), 3000); // auto-clear the error state after a few seconds
        } finally {
            setDownloadingType(null);
        }
    };

    const buttonLabel = (type: "estimate" | "proforma" | "invoice", baseLabel: string) => {
        if (downloadingType === type) return "Downloading...";
        if (failedType === type) return "Failed — Retry";
        return baseLabel;
    };

    const btnBase = "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1.5";

    const Spinner = () => (
        <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin inline-block" />
    );

    return (
        <div className="rounded-xl p-4 border bg-slate-500/5 border-slate-500/20">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-2">Documents</div>
            <div className="flex flex-wrap gap-2">
                {hasEP && (
                    <>
                        <button
                            onClick={(e) => download("estimate", e)}
                            disabled={downloadingType !== null}
                            className={`${btnBase} ${failedType === "estimate" ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20" : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"}`}
                        >
                            {downloadingType === "estimate" && <Spinner />}
                            {buttonLabel("estimate", "Download Estimate")}
                        </button>
                        <button
                            onClick={(e) => download("proforma", e)}
                            disabled={downloadingType !== null}
                            className={`${btnBase} ${failedType === "proforma" ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20" : "bg-teal-500/10 border-teal-500/30 text-teal-400 hover:bg-teal-500/20"}`}
                        >
                            {downloadingType === "proforma" && <Spinner />}
                            {buttonLabel("proforma", "Download Proforma")}
                        </button>
                    </>
                )}
                {hasTaxInvoice && (
                    <button
                        onClick={(e) => download("invoice", e)}
                        disabled={downloadingType !== null}
                        className={`${btnBase} ${failedType === "invoice" ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20" : "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"}`}
                    >
                        {downloadingType === "invoice" && <Spinner />}
                        {buttonLabel("invoice", "Download Tax Invoice")}
                    </button>
                )}
            </div>
        </div>
    );
}

function QuoteDetailModal({ quote, onClose }: { quote: Quote; onClose: () => void }) {
    const g = quote.geometry, t = quote.thermal, c = quote.contact;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-[#0d1520] border border-slate-700/60 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-start justify-between px-6 py-4 border-b border-slate-700/40 sticky top-0 bg-[#0d1520] z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-base font-bold text-white">{quote.id}</h2>
                            <CopyIdButton id={quote.id} />
                            <StatusBadge status={quote.status} />
                        </div>
                        <p className="text-xs text-slate-400">
                            Submitted {new Date(quote.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-3">Progress</div>
                        <StatusStepper status={quote.status} />
                    </div>

                    <PaymentCard quote={quote} />
                    <DocumentsCard quote={quote} />

                    {quote.adminNotes && (
                        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-3">
                            <div className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold mb-1">Note from Zhivam</div>
                            <p className="text-xs text-slate-300 leading-relaxed">{quote.adminNotes}</p>
                        </div>
                    )}

                    <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Fin geometry</div>
                        <div className="bg-[#080c14] border border-slate-700/40 rounded-xl px-4 py-1">
                            <DetailRow label="Type" value={g.type?.replace(/-/g, " ")} />
                            <DetailRow label="Base (L x W)" value={`${g.L_mm} x ${g.W_mm} mm`} />
                            <DetailRow label="Total height" value={g.TH_mm && `${g.TH_mm} mm`} />
                            <DetailRow label="Fin height" value={g.FH_mm && `${g.FH_mm} mm`} />
                            <DetailRow label="Fin thickness / pin dia" value={(g.FT_mm || g.PD_mm) && `${g.FT_mm || g.PD_mm} mm`} />
                            <DetailRow label="Taper ratio" value={g.taper} />
                            <DetailRow label="No. of fins/pins" value={g.Nfins} />
                            <DetailRow label="Material" value={g.material?.split(" --")[0]} />
                        </div>
                    </div>

                    {(t.Q || t.Tbase) && (
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Thermal analysis</div>
                            <div className="bg-[#080c14] border border-slate-700/40 rounded-xl px-4 py-1">
                                <DetailRow label="Heat input Q" value={t.Q && `${t.Q} W`} />
                                <DetailRow label="Ambient temp" value={t.Ta && `${t.Ta} °C`} />
                                <DetailRow label="Fin efficiency η" value={t.eta && `${t.eta}%`} />
                                <DetailRow label="Effectiveness ε" value={t.eps} />
                                <DetailRow label="Base temp" value={t.Tbase && `${t.Tbase} °C`} />
                                <DetailRow label="Tip temp" value={t.Ttip && `${t.Ttip} °C`} />
                                <DetailRow label="Thermal resistance R" value={t.R && `${t.R} °C/W`} />
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Order details</div>
                        <div className="bg-[#080c14] border border-slate-700/40 rounded-xl px-4 py-1">
                            <DetailRow label="Quantity" value={c.qty && `${c.qty} units`} />
                            <DetailRow label="Surface finish" value={c.finish} />
                            <DetailRow label="Company" value={c.company} />
                            <DetailRow label="Phone" value={c.phone} />
                        </div>
                    </div>

                    {c.notes && (
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Your notes</div>
                            <p className="text-xs text-slate-300 bg-[#080c14] border border-slate-700/40 rounded-xl px-4 py-3 leading-relaxed">{c.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MyQuotesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState<Quote | null>(null);

    useEffect(() => {
        if (!loading && !user) router.push("/login?redirect=/dashboard/quotes");
    }, [loading, user, router]);

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const res = await fetch("/api/quote/my", { credentials: "include", cache: "no-store" });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to load quotes");
                setQuotes(data.quotes || []);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Something went wrong");
            } finally {
                setFetching(false);
            }
        })();
    }, [user]);

    useEffect(() => {
        if (!user) return;
        const refetch = () => {
            fetch("/api/quote/my", { credentials: "include", cache: "no-store" })
                .then(res => res.json())
                .then(data => { if (data.quotes) setQuotes(data.quotes); })
                .catch(() => { });
        };
        const handleVisibility = () => {
            if (document.visibilityState === "visible") refetch();
        };
        document.addEventListener("visibilitychange", handleVisibility);
        const refreshInterval = window.setInterval(refetch, 8000);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            window.clearInterval(refreshInterval);
        };
    }, [user]);

    if (loading || fetching) {
        return (
            <div className="min-h-screen bg-[#080c14] flex items-center justify-center pt-24">
                <div className="w-10 h-10 rounded-full border-[3px] border-slate-700 border-t-cyan-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080c14] text-white pt-28 px-4 md:px-8 pb-16">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold">My Quotes</h1>
                </div>
                <p className="text-sm text-slate-400 mb-6 ml-12">Track the status of your manufacturing quote requests.</p>

                {/* Stats strip — only shown once there's data to summarize */}
                {!error && quotes.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                        {[
                            { label: "Total", count: quotes.length, color: "text-white" },
                            { label: "New", count: quotes.filter(q => q.status?.toLowerCase() === "new").length, color: "text-slate-300" },
                            { label: "In Progress", count: quotes.filter(q => q.status?.toLowerCase().replace(/-/g, " ") === "in progress").length, color: "text-orange-400" },
                            { label: "Quoted", count: quotes.filter(q => q.status?.toLowerCase() === "quoted").length, color: "text-sky-400" },
                        ].map(stat => (
                            <div key={stat.label} className="bg-[#0d1520] border border-slate-700/50 rounded-2xl px-4 py-3">
                                <div className={`text-xl font-bold ${stat.color}`}>{stat.count}</div>
                                <div className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-center mb-6">
                        <div className="w-11 h-11 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <p className="text-sm text-red-400 font-medium mb-1">Couldn&apos;t load your quotes</p>
                        <p className="text-xs text-red-400/60">{error}</p>
                    </div>
                )}

                {/* Empty state */}
                {!error && quotes.length === 0 && (
                    <div className="bg-[#0d1520] border border-slate-700/50 rounded-2xl p-12 text-center">
                        <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.5">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                        </div>
                        <p className="text-white text-sm font-medium mb-1.5">No quote requests yet</p>
                        <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                            Run a fin analysis in the Analyzer and request a manufacturing quote to track it here.
                        </p>
                        <Link
                            href="/zheat"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm rounded-xl transition-all"
                        >
                            Request a Quote
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                )}

                <div className="space-y-3">
                    {quotes.map(q => (
                        <div
                            key={q.id}
                            onClick={() => setSelected(q)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelected(q); }}
                            role="button"
                            tabIndex={0}
                            className="w-full text-left bg-[#0d1520] border border-slate-700/50 hover:border-cyan-500/40 rounded-2xl p-5 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-mono text-xs text-slate-500">{q.id}</span>
                                        <CopyIdButton id={q.id} />
                                        <StatusBadge status={q.status} />
                                    </div>
                                    <p className="text-sm font-medium text-white capitalize">
                                        {q.geometry.type?.replace(/-/g, " ") || "Quote"} · Qty {q.contact.qty}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {q.geometry.material?.split(" --")[0]} · {q.geometry.Nfins} fins/pins
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500">
                                        {new Date(q.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                        className="text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-800/60">
                                <StatusStepper status={q.status} />
                            </div>
                            <div className="mt-3">
                                <PaymentCard quote={q} />
                            </div>
                            <div className="mt-3">
                                <DocumentsCard quote={q} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selected && <QuoteDetailModal quote={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}