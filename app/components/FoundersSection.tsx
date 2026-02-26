"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const team = [
    {
        name: "Dr. S. Manikandan",
        role: "Founder & Chief Technical Lead\n\u00A0",
        image: "/images/DrSManikandan.webp",
        linkedin: "https://www.linkedin.com/in/maniiitd/",
        desc: "Dr. S. Manikandan is a thermal engineering expert with extensive experience in electronic thermal management, liquid cooling, phase change materials, immersion cooling, and battery thermal systems. He has led multiple industry- and government-funded R&D projects, holds granted patents, and actively collaborates with academia and industry on next-generation cooling technologies. His expertise spans design, multiphysics simulation, prototyping, testing, and technology commercialization, forming the technical backbone of Zhivam."
    },
    {
        name: "Dr. C. Bharatiraja",
        role: "Co-Founder & Head – Power Electronics & Energy Systems",
        image: "/images/DrBharatiraja.webp",
        linkedin: "https://www.linkedin.com/in/dr-bharatiraja-chokkalingam-44a08b16/",
        desc: "Dr. C. Bharathiraja brings deep expertise in power electronics, energy conversion systems, and system-level integration. His background supports Zhivam's work in cooling of power converters, inverters, battery systems, and renewable energy applications, ensuring thermal solutions are seamlessly aligned with electrical system performance and reliability."
    },
    {
        name: "Dr. K. Anusuya",
        role: "Co-Founder & Head – Advanced Thermal Systems",
        image: "/images/DrKAnusuya.webp",
        linkedin: "https://www.linkedin.com/in/dr-anusuya-kathirvel-9044a1268/",
        desc: "Dr. K. Anusuya specializes in electronic cooling, battery thermal management, radiative cooling, and energy systems. With strong expertise in CFD and multiphysics modeling, she contributes to the design and optimization of heat sinks, cold plates, and hybrid cooling solutions. Her research-driven approach ensures that Zhivam's solutions are reliable, energy-efficient, and aligned with emerging industry needs."
    },
    {
        name: "Mr. Pyla Udit Narayan Sai",
        role: "Co-Founder & Lead Engineer – Electronics & Testing",
        image: "/images/Udit.webp",
        linkedin: "https://www.linkedin.com/in/pylauditnarayan7/",
        desc: "Mr. Pyla Udit Narayan Sai focuses on electronics design, PCB development, testing, and experimental validation. His expertise includes PCB prototyping and assembly, thermal test boards, component testing, and battery characterization (EIS, charge-discharge testing). He plays a key role in translating designs and simulations into validated hardware and test-ready systems."
    }
];

const LinkedInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.784 1.764-1.75 1.764zm13.5 11.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-10h3v1.528c1.396-2.586 7-2.777 7 2.476v5.996z" />
    </svg>
);

export default function TeamSection() {
    const [expanded, setExpanded] = useState<number | null>(null);

    const handleToggle = (index: number, e: React.MouseEvent) => {
        e.preventDefault();
        const isExpanding = expanded !== index;
        setExpanded(isExpanding ? index : null);

        if (isExpanding) {
            const cardElement = (e.currentTarget as HTMLElement).closest(".team-card");
            if (cardElement) {
                setTimeout(() => {
                    cardElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }, 300);
            }
        }
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
            <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-500/4 blur-[120px] rounded-full" />

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
                            The People Behind It
                        </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Our Team
                        </h2>
                        <p className="text-slate-400 text-sm max-w-sm leading-relaxed md:text-right">
                            A multidisciplinary team of researchers, engineers, and innovators driving thermal excellence.
                        </p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-6 border-t border-slate-700/50 pt-6">
                        {[
                            { label: "Team Members", value: `${team.length}` },
                            { label: "Domains", value: "4+" },
                            { label: "Patents Held", value: "Multiple" },
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
                            whileHover={expanded !== index ? { y: -4 } : {}}
                            transition={{
                                layout: { duration: 0.4, ease: "easeInOut" as const },
                                opacity: { duration: 0.5, delay: index * 0.08 },
                                y: { duration: 0.5, delay: index * 0.08 },
                            }}
                            className="team-card relative bg-[#0d1520] border border-slate-700/60 rounded-2xl p-6 flex flex-col items-center text-center w-full hover:border-cyan-500/40 transition-colors duration-300"
                        >
                            {/* Index badge */}
                            <span className="absolute top-4 left-4 text-xs font-mono text-slate-500 bg-slate-900/80 border border-slate-700/60 rounded-md px-2 py-0.5 tabular-nums">
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            {/* LinkedIn badge */}
                            <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute top-4 right-4 flex items-center justify-center w-7 h-7 rounded-full border border-slate-700 text-slate-500 hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200"
                                aria-label={`${member.name} LinkedIn`}
                            >
                                <LinkedInIcon />
                            </a>

                            {/* Hexagon image */}
                            <motion.div layout className="mt-4 relative w-32 h-32 group">
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
                                    {/* Cyan hex border overlay */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(34,211,238,0.15), transparent)"
                                        }}
                                    />
                                </div>
                            </motion.div>

                            {/* Name + role */}
                            <motion.div layout className="w-full flex flex-col items-center mt-5">
                                <h3 className="text-base font-semibold text-white leading-snug">
                                    {member.name}
                                </h3>
                                <p className="text-cyan-400 text-xs mt-1.5 leading-snug whitespace-pre-wrap">{member.role}</p>
                            </motion.div>

                            {/* Divider */}
                            <div className="w-full border-t border-slate-700/50 mt-4" />

                            {/* Description */}
                            <motion.div layout className="w-full mt-4 overflow-hidden">
                                <motion.p
                                    layout="position"
                                    className={`text-slate-400 text-xs leading-relaxed text-left ${expanded === index ? "" : "line-clamp-4"}`}
                                >
                                    {member.desc}
                                </motion.p>
                            </motion.div>

                            {/* Expand button */}
                            <motion.button
                                layout
                                type="button"
                                onClick={(e) => handleToggle(index, e)}
                                className="mt-4 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                            >
                                {expanded === index ? "Show less ↑" : "Read more ↓"}
                            </motion.button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}