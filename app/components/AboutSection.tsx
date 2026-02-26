"use client";

import { motion } from "framer-motion";

const cards = [
    {
        index: "01",
        title: "Technical Experience",
        image: "/images/tech.png",
        desc: "We bring deep technical expertise in electronic thermal management, covering air cooling, liquid cooling, immersion cooling, and battery thermal systems. Our team works across design, simulation, prototyping, and testing, using advanced multiphysics tools to deliver reliable and application-ready thermal solutions."
    },
    {
        index: "02",
        title: "High ROI",
        image: "/images/roi.png",
        desc: "Optimized thermal design improves performance, reliability, and product lifetime while reducing redesign cycles and testing costs. Our simulation-driven and validation-backed approach helps customers achieve faster development, lower thermal risk, and higher return on investment for electronics, batteries, and energy systems."
    },
    {
        index: "03",
        title: "Looking Ahead",
        image: "/images/future.png",
        desc: "As power density and heat flux continue to rise, we focus on next-generation cooling technologies such as liquid-cooled cold plates, phase change materials, thermal capacitors, and immersion cooling. Zhivam partners with industry to future-proof products through scalable, efficient, and sustainable thermal solutions."
    },
];

export default function AboutSection() {
    return (
        <section id="about" className="relative py-24 px-4 md:px-8 bg-[#080c14] overflow-hidden">

            {/* Background grid texture */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(to right, #22d3ee 1px, transparent 1px)`,
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Ambient glow */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-cyan-500/5 blur-[100px] rounded-full" />

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
                            Who We Are
                        </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            About Us
                        </h2>
                        <p className="text-slate-400 text-sm max-w-sm leading-relaxed md:text-right">
                            A research-driven company building next-generation thermal management solutions for electronics and energy systems.
                        </p>
                    </div>
                </motion.div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {cards.map((card, i) => (
                        <motion.div
                            key={card.index}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            whileHover={{ y: -4 }}
                            transition={{
                                opacity: { duration: 0.5, delay: i * 0.1 },
                                y: { duration: 0.5, delay: i * 0.1 },
                            }}
                            className="relative bg-[#0d1520] border border-slate-700/60 rounded-2xl overflow-hidden flex flex-col hover:border-cyan-500/40 transition-colors duration-300"
                        >
                            {/* Top bar with title */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
                                <span className="text-xs font-mono text-slate-500 tabular-nums">{card.index}</span>
                                <span className="text-xs font-mono uppercase tracking-[0.15em] text-cyan-400">
                                    {card.title}
                                </span>
                                <span className="w-8" /> {/* spacer for symmetry */}
                            </div>

                            {/* Icon */}
                            <div className="flex justify-center pt-10 pb-6">
                                <div className="h-20 w-20 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center">
                                    <img src={card.image} alt={card.title} className="h-10 w-10 object-contain opacity-90" />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="px-7 pb-8">
                                <p className="text-slate-400 text-sm leading-relaxed text-center">
                                    {card.desc}
                                </p>
                            </div>

                            {/* Bottom cyan accent line on hover */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}