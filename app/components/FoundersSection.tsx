"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const team = [
    {
        name: "Dr. S. Manikandan",
        role: "Founder & Chief Technical Lead\n\u00A0",
        image: "/images/DrSManikandan.jpg",
        linkedin: "https://www.linkedin.com/in/maniiitd/",
        desc: "Dr. S. Manikandan is a thermal engineering expert with extensive experience in electronic thermal management, liquid cooling, phase change materials, immersion cooling, and battery thermal systems. He has led multiple industry- and government-funded R&D projects, holds granted patents, and actively collaborates with academia and industry on next-generation cooling technologies. His expertise spans design, multiphysics simulation, prototyping, testing, and technology commercialization, forming the technical backbone of Zhivam."
    },
    {
        name: "Dr. C. Bharatiraja",
        role: "Co-Founder & Head – Power Electronics & Energy Systems",
        image: "/images/DrBharatiraja.jpg",
        linkedin: "https://www.linkedin.com/in/dr-bharatiraja-chokkalingam-44a08b16/",
        desc: "Dr. C. Bharathiraja brings deep expertise in power electronics, energy conversion systems, and system-level integration. His background supports Zhivam’s work in cooling of power converters, inverters, battery systems, and renewable energy applications, ensuring thermal solutions are seamlessly aligned with electrical system performance and reliability."
    },
    {
        name: "Dr. K. Anusuya",
        role: "Co-Founder & Head – Advanced Thermal Systems",
        image: "/images/DrKAnusuya.jpg",
        linkedin: "https://www.linkedin.com/in/dr-anusuya-kathirvel-9044a1268/",
        desc: "Dr. K. Anusuya specializes in electronic cooling, battery thermal management, radiative cooling, and energy systems. With strong expertise in CFD and multiphysics modeling, she contributes to the design and optimization of heat sinks, cold plates, and hybrid cooling solutions. Her research-driven approach ensures that Zhivam’s solutions are reliable, energy-efficient, and aligned with emerging industry needs."
    },
    {
        name: "Mr. Pyla Udit Narayan Sai",
        role: "Co-Founder & Lead Engineer – Electronics & Testing",
        image: "/images/Udit.jpg",
        linkedin: "https://www.linkedin.com/in/pylauditnarayan7/",
        desc: "Mr. Pyla Udit Narayan Sai focuses on electronics design, PCB development, testing, and experimental validation. His expertise includes PCB prototyping and assembly, thermal test boards, component testing, and battery characterization (EIS, charge-discharge testing). He plays a key role in translating designs and simulations into validated hardware and test-ready systems."
    }
];

export default function TeamSection() {
    const [expanded, setExpanded] = useState<number | null>(null);

    const handleToggle = (index: number, e: React.MouseEvent) => {
        e.preventDefault();
        const isExpanding = expanded !== index;
        setExpanded(isExpanding ? index : null);

        // If we are expanding the card, smoothly scroll it into view
        if (isExpanding) {
            const cardElement = (e.currentTarget as HTMLElement).closest(".team-card");
            if (cardElement) {
                // Slight delay to allow the Framer Motion layout animation to run first
                setTimeout(() => {
                    cardElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }, 300);
            }
        }
    };

    return (
        <section className="py-28 px-6 md:px-12 lg:px-24 text-white flex flex-col items-center">
            <h2 className="text-4xl font-bold mb-16 text-center">Our Team</h2>

            <div className="max-w-7xl w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 items-start">
                {team.map((member, index) => (
                    <motion.div
                        layout
                        key={index}
                        whileHover={expanded !== index ? { y: -8 } : {}}
                        transition={{ layout: { duration: 0.4, ease: "easeInOut" } }}
                        // Added the "team-card" class here for the scroll targeting
                        className="team-card bg-slate-800/40 backdrop-blur-md border border-slate-700 rounded-xl p-8 flex flex-col items-center text-center w-full"
                    >
                        {/* Image holder */}
                        <motion.a
                            layout
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative w-40 h-40 group block"
                        >
                            <div className="w-full h-full">
                                <div
                                    className="w-full h-full relative overflow-hidden"
                                    style={{
                                        clipPath: "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)"
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
                            </div>
                        </motion.a>

                        {/* Name + role */}
                        <motion.div layout className="w-full flex flex-col justify-start mt-5">
                            <h3 className="text-lg font-semibold leading-snug">
                                {member.name}
                            </h3>
                            <p className="text-cyan-400 text-sm mt-1 whitespace-pre-wrap">{member.role}</p>
                        </motion.div>

                        {/* Description */}
                        <motion.div layout className="w-full relative mt-2 overflow-hidden">
                            <motion.p
                                layout="position"
                                className={`text-slate-300 text-sm leading-relaxed ${expanded === index ? "" : "line-clamp-4"
                                    }`}
                            >
                                {member.desc}
                            </motion.p>
                        </motion.div>

                        {/* Expand button */}
                        <motion.button
                            layout
                            type="button"
                            onClick={(e) => handleToggle(index, e)}
                            className="text-cyan-400 text-sm hover:underline mt-4"
                        >
                            {expanded === index ? "Show less" : "...more"}
                        </motion.button>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}