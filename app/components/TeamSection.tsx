"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const team = [
    {
        name: "Deenathayalan",
        role: "Design Engineer",
        image: "/images/Deena.webp",
        linkedin: "https://www.linkedin.com/in/deenathayalan-p-k/",
        desc: "Designs heat sinks, cold plates, and cooling channels optimized for thermal efficiency, creates detailed 3D CAD models, ensures compatibility with electronic packaging constraints, and prepares manufacturing-ready drawings for production."
    },
    {
        name: "Deepak Mahalingam",
        role: "Design Engineer",
        image: "/images/Deepak.webp",
        linkedin: "https://www.linkedin.com/in/deepak-mahalingam-e/",
        desc: "Develops compact and lightweight thermal management solutions, optimizes fin geometry and coolant pathways, collaborates with simulation teams for validation, and balances performance with manufacturability and cost."
    },
    {
        name: "Mirdul",
        role: "Simulation Engineer",
        image: "/images/Mirdul.webp",
        linkedin: "https://www.linkedin.com/in/mirdul-balamurali-b3016a280/",
        desc: "Performs CFD and thermal simulations to analyze temperature distribution in electronic cooling systems, predicts thermal hotspots in IGBT and power modules, validates airflow and liquid cooling performance, and optimizes designs before physical prototyping."
    },
    {
        name: "Thieru Mahan Arjun",
        role: "Simulation Engineer",
        image: "/images/Arjun.webp",
        linkedin: "https://www.linkedin.com/in/thieru-mahan-arjun-e-090a39294/",
        desc: "Develops numerical models to evaluate heat dissipation and structural effects in cooling assemblies, studies transient and steady-state behavior, supports design refinement through data-driven insights, and ensures system reliability under peak operating conditions."
    },
    {
        name: "Sanjay",
        role: "Thermal Engineer",
        image: "/images/Sanjay.webp",
        linkedin: "https://www.linkedin.com/in/d-s-sanjay-970149284/",
        desc: "Analyzes conduction, convection, and overall thermal resistance in electronic systems, selects appropriate thermal interface materials, designs effective cooling strategies, and ensures safe operating temperatures under dynamic load conditions."
    },
    {
        name: "Venu Prasad",
        role: "Thermal Engineer",
        image: "/images/Venu.webp",
        linkedin: "https://www.linkedin.com/in/venu-prasad-159189361/",
        desc: "Evaluates steady-state and transient heat transfer performance, identifies critical thermal stress points, improves system efficiency through optimized thermal control, and enhances long-term reliability of electronic components."
    },
    {
        name: "Vishruth",
        role: "Manufacturing Engineer",
        image: "/images/Vishruth.webp",
        linkedin: "",
        desc: "Plans and optimizes fabrication processes for cooling assemblies, selects suitable materials such as aluminum or copper alloys, ensures precision machining of micro-channels, and maintains quality control for durable production."
    },
    {
        name: "Rohit",
        role: "Manufacturing Engineer",
        image: "/images/Rohit.webp",
        linkedin: "",
        desc: "Develops scalable manufacturing strategies for thermal systems, bridges the gap between design and fabrication, improves production efficiency through process optimization, and ensures consistent, leak-proof cooling system output."
    }
];


const LinkedInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.784 1.764-1.75 1.764zm13.5 11.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-10h3v1.528c1.396-2.586 7-2.777 7 2.476v5.996z" />
    </svg>
);

export default function TeamSection() {
    const [expanded, setExpanded] = useState<number | null>(null);

    const toggleExpand = (index: number) => {
        setExpanded(expanded === index ? null : index);
    };

    return (
        <section className="relative py-24 px-4 md:px-8 bg-[#080c14] overflow-hidden">

            {/* Background grid texture */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(to right, #22d3ee 1px, transparent 1px)`,
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Ambient glow */}
            <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/4 blur-[120px] rounded-full" />

            <div className="relative max-w-screen-xl mx-auto">

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
                            The Team
                        </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Meet the Engineers
                        </h2>
                        <p className="text-slate-400 text-sm max-w-sm leading-relaxed md:text-right">
                            Specialists in design, simulation, thermal analysis, and manufacturing — building tomorrow's cooling solutions.
                        </p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-6 border-t border-slate-700/50 pt-6">
                        {[
                            { label: "Engineers", value: `${team.length}` },
                            { label: "Specializations", value: "4" },
                            { label: "Focus", value: "Thermal Systems" },
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col gap-0.5">
                                <span className="text-xl font-bold text-white">{stat.value}</span>
                                <span className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Team grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
                    {team.map((member, index) => (
                        <motion.div
                            layout
                            key={index}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            whileHover={{ y: -4 }}
                            transition={{
                                layout: { duration: 0.4, ease: "easeInOut" as const },
                                opacity: { duration: 0.5, delay: (index % 4) * 0.08 },
                                y: { duration: 0.5, delay: (index % 4) * 0.08 },
                            }}
                            className="relative bg-[#0d1520] border border-slate-700/60 rounded-2xl p-6 flex flex-col items-center text-center w-full overflow-hidden hover:border-cyan-500/40 transition-colors duration-300"
                        >
                            {/* Index badge */}
                            <span className="absolute top-4 left-4 text-xs font-mono text-slate-500 bg-slate-900/80 border border-slate-700/60 rounded-md px-2 py-0.5 tabular-nums">
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            {/* LinkedIn badge */}
                            {member.linkedin ? (
                                <a
                                    href={member.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute top-4 right-4 flex items-center justify-center w-7 h-7 rounded-full border border-slate-700 text-slate-500 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200"
                                    aria-label={`${member.name} LinkedIn`}
                                >
                                    <LinkedInIcon />
                                </a>
                            ) : (
                                <span className="absolute top-4 right-4 flex items-center justify-center w-7 h-7 rounded-full border border-slate-800 text-slate-700">
                                    <LinkedInIcon />
                                </span>
                            )}

                            {/* Hexagon image */}
                            <motion.div layout="position" className="mt-4 relative w-28 h-28 group">
                                <div
                                    className="w-full h-full relative overflow-hidden"
                                    style={{
                                        clipPath: "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)"
                                    }}
                                >
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90"
                                    />
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.15), transparent)" }}
                                    />
                                </div>
                            </motion.div>

                            {/* Name + Role */}
                            <motion.div layout="position" className="w-full flex flex-col items-center mt-5">
                                <h3 className="text-base font-semibold text-white leading-snug">
                                    {member.name}
                                </h3>
                                <p className="text-cyan-400 text-xs mt-1.5 leading-snug">
                                    {member.role}
                                </p>
                            </motion.div>

                            {/* Divider */}
                            <div className="w-full border-t border-slate-700/50 mt-4" />

                            {/* Description */}
                            <motion.div layout className="mt-4 w-full relative overflow-hidden">
                                <motion.p
                                    layout="position"
                                    className={`text-slate-400 text-xs leading-relaxed text-left ${expanded === index ? "" : "line-clamp-4"}`}
                                >
                                    {member.desc}
                                </motion.p>
                            </motion.div>

                            {member.desc.length > 120 && (
                                <motion.button
                                    layout
                                    type="button"
                                    onClick={() => toggleExpand(index)}
                                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium mt-3"
                                >
                                    {expanded === index ? "Show less ↑" : "Read more ↓"}
                                </motion.button>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}