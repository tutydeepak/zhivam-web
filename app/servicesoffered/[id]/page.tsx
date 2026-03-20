import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Mail } from "lucide-react";
import { rdServices, RdService } from "@/lib/servicesData";

const tagColors: Record<string, string> = {
    "Core Service": "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    "Battery": "text-green-400 bg-green-400/10 border-green-400/20",
    "Cooling": "text-blue-400 bg-blue-400/10 border-blue-400/20",
    "PCB": "text-purple-400 bg-purple-400/10 border-purple-400/20",
    "Renewable": "text-amber-400 bg-amber-400/10 border-amber-400/20",
    "Advisory": "text-orange-400 bg-orange-400/10 border-orange-400/20",
    "IP & Licensing": "text-pink-400 bg-pink-400/10 border-pink-400/20",
};

const caseStudies: Record<string, { title: string; outcome: string }[]> = {
    "rd-1": [
        { title: "Data Center Cooling Optimization", outcome: "Reduced thermal resistance by 34% using hybrid liquid-air architecture." },
        { title: "EV Power Module Thermal Design", outcome: "Achieved junction temperature reduction of 18°C under peak load." },
    ],
    "rd-2": [
        { title: "CFD-Driven Heat Sink Redesign", outcome: "Simulation-led redesign cut prototyping cycles from 6 to 2 iterations." },
        { title: "Multiphysics Battery Pack Validation", outcome: "Validated thermal model within 3% of experimental results." },
    ],
    "rd-3": [
        { title: "EV Battery Cold Plate Development", outcome: "Designed cold plate achieving uniform temperature distribution ±1.5°C." },
        { title: "PCM-Based Thermal Buffer System", outcome: "Delivered 40% improvement in transient thermal performance." },
    ],
    "rd-4": [
        { title: "Single-Phase Immersion for Server Racks", outcome: "Achieved PUE of 1.03 in prototype immersion cooling setup." },
        { title: "Dielectric Fluid Compatibility Study", outcome: "Evaluated 5 fluids for a battery OEM, recommending optimal selection." },
    ],
    "rd-5": [
        { title: "BIS Test Board Design", outcome: "Designed and fabricated compliant test boards for 3 product lines." },
        { title: "Thermal Characterization of SMD Components", outcome: "Mapped thermal resistance across 200+ component variants." },
    ],
    "rd-6": [
        { title: "Agrivoltaic Feasibility Study", outcome: "Completed techno-economic analysis for 2MW agrivoltaic project in Tamil Nadu." },
        { title: "Bifacial PV System Modeling", outcome: "Modeled bifacial gain of 8-12% for rooftop installation." },
    ],
    "rd-7": [
        { title: "Thermal Architecture Review", outcome: "Advised startup on cooling strategy, reducing BOM cost by 22%." },
        { title: "IEC Standards Compliance Advisory", outcome: "Guided product team through IEC 62133 certification process." },
    ],
    "rd-8": [
        { title: "Patent Licensing Partnership", outcome: "Facilitated licensing of 2 thermal patents to a European OEM." },
        { title: "Technology Transfer Program", outcome: "Transferred PCM-based cooling technology to manufacturing partner." },
    ],
};

export function generateStaticParams() {
    return rdServices.map((s: RdService) => ({ id: s.id }));
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const service = rdServices.find((s: RdService) => s.id === id);
    if (!service) notFound();

    const studies = caseStudies[service.id] || [];
    const related = rdServices.filter((s: RdService) => s.id !== service.id).slice(0, 3);

    return (
        <div className="relative min-h-screen bg-[#080c14] text-white overflow-hidden">

            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(to right, #22d3ee 1px, transparent 1px)`,
                    backgroundSize: "48px 48px",
                }}
            />
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-cyan-500/5 blur-[100px] rounded-full" />

            <div className="relative pt-28 pb-16 px-4 md:px-8">
                <div className="max-w-screen-xl mx-auto">

                    <Link href="/servicesoffered" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm mb-10 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        All Services
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className={`inline-block text-[10px] font-mono uppercase tracking-widest border rounded-full px-3 py-1 mb-6 ${tagColors[service.tag] || tagColors["Core Service"]}`}>
                                {service.tag}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                                {service.title}
                            </h1>
                            <p className="text-slate-400 text-base leading-relaxed mb-8">
                                {service.description}
                            </p>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm px-6 py-3 rounded-full transition-all duration-200 hover:shadow-[0_0_24px_rgba(6,182,212,0.4)]"
                            >
                                <Mail className="w-4 h-4" />
                                Get in Touch
                            </Link>
                        </div>

                        <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden border border-slate-700/60">
                            <img
                                src={service.imageUrl}
                                alt={service.title}
                                className="w-full h-full object-cover opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#080c14]/80 to-transparent" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-8 py-16 border-t border-slate-800">
                <div className="max-w-screen-xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="h-px w-8 bg-cyan-500" />
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-500">
                            {service.sectionLabel}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {service.capabilities.map((cap: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 bg-[#0d1520] border border-slate-700/60 rounded-xl p-5 hover:border-cyan-500/30 transition-colors">
                                <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                                <span className="text-slate-300 text-sm leading-relaxed">{cap}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {studies.length > 0 && (
                <div className="px-4 md:px-8 py-16 border-t border-slate-800">
                    <div className="max-w-screen-xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="h-px w-8 bg-cyan-500" />
                            <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-500">
                                Case Studies
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {studies.map((study, i) => (
                                <div key={i} className="bg-[#0d1520] border border-slate-700/60 rounded-2xl p-7 hover:border-cyan-500/30 transition-colors">
                                    <h3 className="text-white font-semibold text-lg mb-3">{study.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{study.outcome}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="px-4 md:px-8 py-16 border-t border-slate-800">
                <div className="max-w-screen-xl mx-auto">
                    <div className="bg-[#0d1520] border border-cyan-500/20 rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-cyan-500/40 transition-colors">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Ready to get started?</h2>
                            <p className="text-slate-400 text-sm">Tell us about your project and we will get back to you within 24 hours.</p>
                        </div>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm px-8 py-3.5 rounded-full transition-all duration-200 hover:shadow-[0_0_24px_rgba(6,182,212,0.4)] whitespace-nowrap"
                        >
                            Contact Us
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-8 py-16 border-t border-slate-800">
                <div className="max-w-screen-xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="h-px w-8 bg-cyan-500" />
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-500">
                            Related Services
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {related.map((s: RdService) => (
                            <Link key={s.id} href={`/servicesoffered/${s.id}`} className="group block">
                                <div className="relative flex flex-col min-h-[200px] bg-[#0d1520] border border-slate-700/60 rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_32px_rgba(6,182,212,0.08)] p-6">
                                    <div className="absolute inset-0">
                                        <img
                                            src={s.imageUrl}
                                            alt={s.title}
                                            className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-all duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1520] via-[#0d1520]/70 to-[#0d1520]/20" />
                                    </div>
                                    <div className="flex items-start justify-between mb-4 relative z-10">
                                        <span className={`text-[10px] font-mono uppercase tracking-widest border rounded-full px-2.5 py-1 ${tagColors[s.tag] || tagColors["Core Service"]}`}>
                                            {s.tag}
                                        </span>
                                        <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                                    </div>
                                    <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-cyan-400 transition-colors mt-auto relative z-10">
                                        {s.title}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}