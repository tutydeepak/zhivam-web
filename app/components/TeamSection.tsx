"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { useState } from "react";

const team = [
    {
        name: "Deenathayalan",
        role: "Design Engineer",
        image: "/images/Deena.jpeg",
        linkedin: "https://www.linkedin.com/in/deenathayalan-p-k/",
        desc: "Designs heat sinks, cold plates, and cooling channels optimized for thermal efficiency, creates detailed 3D CAD models, ensures compatibility with electronic packaging constraints, and prepares manufacturing-ready drawings for production."
    },
    {
        name: "Deepak Mahalingam",
        role: "Design Engineer",
        image: "/images/Deepak.png",
        linkedin: "https://www.linkedin.com/in/deepak-mahalingam-e/",
        desc: "Develops compact and lightweight thermal management solutions, optimizes fin geometry and coolant pathways, collaborates with simulation teams for validation, and balances performance with manufacturability and cost."
    },
    {
        name: "Mirdul",
        role: "Simulation Engineer",
        image: "/images/Mirdul.jpeg",
        linkedin: "https://www.linkedin.com/in/mirdul-balamurali-b3016a280/",
        desc: "Performs CFD and thermal simulations to analyze temperature distribution in electronic cooling systems, predicts thermal hotspots in IGBT and power modules, validates airflow and liquid cooling performance, and optimizes designs before physical prototyping."
    },
    {
        name: "Thieru Mahan Arjun",
        role: "Simulation Engineer",
        image: "/images/Arjun.jpeg",
        linkedin: "https://www.linkedin.com/in/thieru-mahan-arjun-e-090a39294/",
        desc: "Develops numerical models to evaluate heat dissipation and structural effects in cooling assemblies, studies transient and steady-state behavior, supports design refinement through data-driven insights, and ensures system reliability under peak operating conditions."
    },
    {
        name: "Sanjay",
        role: "Thermal Engineer",
        image: "/images/Sanjay.jpeg",
        linkedin: "https://www.linkedin.com/in/d-s-sanjay-970149284/",
        desc: "Analyzes conduction, convection, and overall thermal resistance in electronic systems, selects appropriate thermal interface materials, designs effective cooling strategies, and ensures safe operating temperatures under dynamic load conditions."
    },
    {
        name: "Venu Prasad",
        role: "Thermal Engineer",
        image: "/images/Venu.jpeg",
        linkedin: "https://www.linkedin.com/in/venu-prasad-159189361/",
        desc: "Evaluates steady-state and transient heat transfer performance, identifies critical thermal stress points, improves system efficiency through optimized thermal control, and enhances long-term reliability of electronic components."
    },
    {
        name: "Vishruth",
        role: "Manufacturing Engineer",
        image: "/images/Vishruth.jpeg",
        linkedin: "",
        desc: "Plans and optimizes fabrication processes for cooling assemblies, selects suitable materials such as aluminum or copper alloys, ensures precision machining of micro-channels, and maintains quality control for durable production."
    },
    {
        name: "Rohit",
        role: "Manufacturing Engineer",
        image: "/images/Rohit.jpeg",
        linkedin: "",
        desc: "Develops scalable manufacturing strategies for thermal systems, bridges the gap between design and fabrication, improves production efficiency through process optimization, and ensures consistent, leak-proof cooling system output."
    }
];

// Explicitly type animations to satisfy TypeScript
const containerVariants: Variants = {
    hidden: {
        transition: {
            staggerChildren: 0.008, // Slightly faster when collapsing
            staggerDirection: -1    // Reverses the stagger order (bottom to top)
        }
    },
    visible: {
        transition: {
            staggerChildren: 0.015  // Slower, elegant drop in (top to bottom)
        }
    }
};

const wordVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 5,
        transition: { duration: 0.2 }
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: "easeOut" }
    }
};

export default function TeamSection() {
    const [expanded, setExpanded] = useState<number | null>(null);

    const toggleExpand = (index: number) => {
        setExpanded(expanded === index ? null : index);
    };

    return (
        <section className="py-28 px-6 md:px-12 lg:px-24 text-white flex flex-col items-center">
            <h2 className="text-4xl font-bold mb-16 text-center">- The Team -</h2>

            <div className="max-w-7xl w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 items-start">
                {team.map((member, index) => (
                    <motion.div
                        layout
                        key={index}
                        whileHover={{ y: -8 }}
                        className="bg-slate-800/40 backdrop-blur-md border border-slate-700 rounded-xl p-8 flex flex-col items-center text-center w-full overflow-hidden"
                    >
                        {/* Image */}
                        <motion.a
                            layout="position"
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative w-40 h-40 group block"
                        >
                            <div
                                className="w-full h-full relative overflow-hidden"
                                style={{
                                    clipPath:
                                        "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)"
                                }}
                            >
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300 flex items-end justify-center pb-8">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-8 h-8 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.784 1.764-1.75 1.764zm13.5 11.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-10h3v1.528c1.396-2.586 7-2.777 7 2.476v5.996z" />
                                    </svg>
                                </div>
                            </div>
                        </motion.a>

                        {/* Name + Role */}
                        <motion.div layout="position" className="w-full flex flex-col justify-start mt-5">
                            <h3 className="text-lg font-semibold leading-snug">
                                {member.name}
                            </h3>
                            <p className="text-cyan-400 text-sm mt-1 whitespace-pre-wrap">
                                {member.role}
                            </p>
                        </motion.div>

                        {/* Description Logic */}
                        <motion.div layout className="mt-3 flex flex-col items-center w-full min-h-[5rem]">
                            {/* AnimatePresence handles swapping of states with exit animations */}
                            <AnimatePresence mode="wait" initial={false}>
                                {expanded === index ? (
                                    <motion.p
                                        key="expanded"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        className="text-slate-300 text-sm leading-relaxed"
                                    >
                                        {member.desc.split(" ").map((word, wIndex) => (
                                            <motion.span
                                                key={wIndex}
                                                variants={wordVariants}
                                                className="inline-block mr-[0.25em]"
                                            >
                                                {word}
                                            </motion.span>
                                        ))}
                                    </motion.p>
                                ) : (
                                    <motion.p
                                        key="collapsed"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-slate-300 text-sm leading-relaxed line-clamp-4"
                                    >
                                        {member.desc}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            {member.desc.length > 120 && (
                                <motion.button
                                    layout="position"
                                    onClick={() => toggleExpand(index)}
                                    className="text-cyan-400 text-xs mt-2 hover:underline focus:outline-none"
                                >
                                    {expanded === index ? "Show less" : "Show more"}
                                </motion.button>
                            )}
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}