"use client";

import { motion } from "framer-motion";

export default function LogoSection() {
    const logos = [
        "/images/logos/msme.png",
        "/images/logos/iitd.png",
        "/images/logos/ihfc.png",
        "/images/logos/cem.png",
        "/images/logos/nvidia.png",
    ];

    return (
        <section className="relative py-16 sm:py-20 md:py-24 px-4 md:px-8 bg-[#080c14] overflow-hidden">

            {/* Background grid texture */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(to right, #22d3ee 1px, transparent 1px)`,
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Ambient glow */}
            <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-cyan-500/5 blur-[100px] rounded-full" />

            <div className="relative max-w-screen-xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" as const }}
                    className="mb-10 md:mb-14 text-center"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-cyan-500" />
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-500">
                            Partners & Collaborators
                        </span>
                    </div>
                    <div className="flex flex-col items-start gap-3">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                            Trusted & Collaborated With
                        </h2>

                        <p className="text-slate-400 text-sm max-w-xl leading-relaxed text-left">
                            Organizations and institutions we proudly work with.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="mt-8 border-t border-slate-700/50" />
                </motion.div>

                {/* Logo grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                    {logos.map((logo, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.08,
                                ease: "easeOut" as const,
                            }}
                            className={`group relative bg-[#0d1520] hover:bg-cyan-500/10 border border-slate-700/60 rounded-2xl p-3 sm:p-4 flex items-center justify-center hover:border-cyan-500/60 transition-all duration-300 h-24 sm:h-28 ${index === 4
                                ? "md:col-span-4 md:w-[25%] md:justify-self-center"
                                : ""
                                }`}
                        >
                            <img
                                src={logo}
                                alt={`Partner ${index + 1}`}
                                loading="lazy"
                                decoding="async"
                                className="max-h-20 w-full object-contain opacity-60 brightness-0 invert transition-all duration-300 group-hover:opacity-100 group-hover:brightness-100 group-hover:invert-0"
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
