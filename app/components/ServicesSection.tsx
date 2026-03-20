"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { rdServices, RdService } from "@/lib/servicesData";

// ── Manufacturing Services (commented out for now, may be used later) ──
// export const services = [
//     { id: 1, title: "Aluminum Extrusion", description: "Cost-effective process for creating custom cross-sectional profiles for linear heat sinks.", cycleTime: "5-7 Days", price: "5,000", imageUrl: "/images/extrusion.webp" },
//     { id: 2, title: "CNC Machining", description: "High-precision machining for complex geometries and prototypes with tight tolerances.", cycleTime: "3-5 Days", price: "12,000", imageUrl: "/images/cnc.webp" },
//     { id: 3, title: "Skived Fin Heatsinks", description: "Creates thin, high-density fins from a solid block of metal for superior thermal performance.", cycleTime: "7-10 Days", price: "18,000", imageUrl: "/images/skived.webp" },
//     { id: 4, title: "Bonded Fin Assembly", description: "Allows for large heatsinks with high aspect ratio fins by bonding individual fins to a base.", cycleTime: "10-12 Days", price: "25,000", imageUrl: "/images/bonded.webp" },
//     { id: 5, title: "Die Casting", description: "Ideal for high-volume production of complex heatsink shapes with integrated features.", cycleTime: "15-20 Days", price: "50,000", imageUrl: "/images/die-cast.webp" },
//     { id: 6, title: "Stamped Fin Heatsinks", description: "Low-cost solution for high-volume applications, typically used in consumer electronics.", cycleTime: "7-9 Days", price: "3,000", imageUrl: "/images/stamped.webp" },
//     { id: 7, title: "Cold Forging", description: "Improves thermal conductivity by shaping metal at room temperature, ideal for pin fin designs.", cycleTime: "8-10 Days", price: "15,000", imageUrl: "/images/forged.webp" },
//     { id: 8, title: "Liquid Cold Plates", description: "Advanced liquid cooling solution for high-power density electronics and demanding applications.", cycleTime: "12-15 Days", price: "35,000", imageUrl: "/images/liquid-plate.webp" },
//     { id: 9, title: "Heat Pipe Integration", description: "Integrate heat pipes into your assembly to efficiently transfer heat away from the source.", cycleTime: "5-8 Days", price: "9,000", imageUrl: "/images/heat-pipe.webp" },
//     { id: 10, title: "Vapor Chamber Assembly", description: "Two-phase heat transfer devices that provide rapid, uniform heat spreading for high heat flux.", cycleTime: "14-18 Days", price: "45,000", imageUrl: "/images/vapor-chamber.webp" },
// ];

export const services: any[] = []

const tagColors: Record<string, string> = {
    "Core Service": "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    "Battery": "text-green-400 bg-green-400/10 border-green-400/20",
    "Cooling": "text-blue-400 bg-blue-400/10 border-blue-400/20",
    "PCB": "text-purple-400 bg-purple-400/10 border-purple-400/20",
    "Renewable": "text-amber-400 bg-amber-400/10 border-amber-400/20",
    "Advisory": "text-orange-400 bg-orange-400/10 border-orange-400/20",
    "IP & Licensing": "text-pink-400 bg-pink-400/10 border-pink-400/20",
}

const BentoCard = ({ service, index, variant = "default" }: {
    service: RdService;
    index: number;
    variant?: "default" | "featured" | "horizontal"
}) => {
    const isFeatured = variant === "featured"
    const isHorizontal = variant === "horizontal"

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, delay: index * 0.06, ease: "easeOut" as const }}
            className="h-full"
        >
            <Link href={`/servicesoffered/${service.id}`} className="group block h-full">
                <div className={`relative flex bg-[#0d1520] border border-slate-700/60 rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_40px_rgba(6,182,212,0.08)] ${isHorizontal ? "flex-row min-h-[220px]" : "flex-col min-h-[320px]"}`}>

                    {/* Background image */}
                    {isHorizontal ? (
                        <div className="relative w-48 shrink-0 overflow-hidden">
                            <img
                                src={service.imageUrl}
                                alt={service.title}
                                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-35 group-hover:scale-105 transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0d1520]" />
                        </div>
                    ) : (
                        <div className="absolute inset-0">
                            <img
                                src={service.imageUrl}
                                alt={service.title}
                                className="w-full h-full object-cover opacity-10 group-hover:opacity-20 group-hover:scale-105 transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1520] via-[#0d1520]/70 to-[#0d1520]/20" />
                        </div>
                    )}

                    {/* Content */}
                    <div className="relative z-10 flex flex-col flex-1 p-6">
                        {/* Top */}
                        <div className="flex items-start justify-between mb-4">
                            <span className={`text-[10px] font-mono uppercase tracking-widest border rounded-full px-2.5 py-1 ${tagColors[service.tag] || tagColors["Core Service"]}`}>
                                {service.tag}
                            </span>
                            {/* <span className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-500 group-hover:border-cyan-500/50 group-hover:text-cyan-400 group-hover:bg-cyan-500/5 transition-all duration-300 shrink-0">
                                <ArrowUpRight className="w-4 h-4" />
                            </span> */}
                        </div>

                        {/* Bottom */}
                        <div className="mt-auto">
                            <h3 className="font-bold text-white leading-snug text-2xl group-hover:text-cyan-400 transition-colors duration-200 mb-3">
                                {service.title}
                            </h3>
                            <div className="inline-flex items-center gap-2 border border-slate-700/60 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/5 rounded-full px-4 py-2 transition-all duration-300">
                                <span className="text-xs text-slate-400 group-hover:text-cyan-400 font-mono uppercase tracking-widest transition-colors duration-200">
                                    Read More
                                </span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors duration-200" />
                            </div>
                        </div>
                    </div>

                    {/* Bottom accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
            </Link>
        </motion.div>
    )
}

export default function ServicesSection() {
    return (
        <section id="services" className="relative pt-32 pb-24 px-4 md:px-8 bg-[#080c14] overflow-hidden">

            {/* Background grid texture */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(to right, #22d3ee 1px, transparent 1px)`,
                    backgroundSize: "48px 48px",
                }}
            />
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-500/5 blur-[100px] rounded-full" />

            <div className="relative container mx-auto max-w-screen-xl">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" as const }}
                    className="mb-14"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-cyan-500" />
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-500">
                            R&D & Engineering
                        </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Research & Advisory
                        </h2>
                        <p className="text-slate-400 text-sm max-w-sm leading-relaxed md:text-right">
                            End-to-end R&D, simulation, testing, and consultancy services for thermal and energy systems.
                        </p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-6 border-t border-slate-700/50 pt-6">
                        {[
                            { label: "Services", value: "8+" },
                            { label: "Domains", value: "Thermal, Energy, PCB" },
                            { label: "Engagement", value: "R&D to Production" },
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col gap-0.5">
                                <span className="text-xl font-bold text-white">{stat.value}</span>
                                <span className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Bento Grid */}
                <div className="flex flex-col gap-6">

                    {/* Row 1: featured + small */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <BentoCard service={rdServices[0]} index={0} variant="featured" />
                        </div>
                        <div className="md:col-span-1">
                            <BentoCard service={rdServices[2]} index={2} />
                        </div>
                    </div>

                    {/* Row 2: 3 equal */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <BentoCard service={rdServices[3]} index={3} />
                        <BentoCard service={rdServices[4]} index={4} />
                        <BentoCard service={rdServices[5]} index={5} />
                    </div>

                    {/* Row 3: small + featured */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <BentoCard service={rdServices[6]} index={6} />
                        </div>
                        <div className="md:col-span-2">
                            <BentoCard service={rdServices[7]} index={7} variant="featured" />
                        </div>
                    </div>

                    {/* Row 4: horizontal full width */}
                    <BentoCard service={rdServices[1]} index={8} variant="horizontal" />

                </div>
            </div>
        </section>
    )
}