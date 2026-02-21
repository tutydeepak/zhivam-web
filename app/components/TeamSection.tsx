"use client";

import { motion } from "framer-motion";

const lorem =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const team = [
    {
        name: "Dr. S. Manikandan",
        role: "Founder & Chief Technical Lead\n\u00A0",
        image: "/images/",
        linkedin: "",
        desc: lorem
    },
    {
        name: "Dr. C. Bharatiraja",
        role: "Co-Founder & Head – Power Electronics & Energy Systems",
        image: "/images/",
        linkedin: "",
        desc: lorem
    },
    {
        name: "Dr. K. Anusuya",
        role: "Co-Founder & Head – Advanced Thermal Systems",
        image: "/images/",
        linkedin: "",
        desc: lorem
    },
    {
        name: "Mr. Pyla Udit Narayan Sai",
        role: "Co-Founder & Lead Engineer – Electronics & Testing",
        image: "/images/",
        linkedin: "",
        desc: lorem
    },
    {
        name: "Mr. Pyla Udit Narayan Sai",
        role: "Co-Founder & Lead Engineer – Electronics & Testing",
        image: "/images/",
        linkedin: "",
        desc: lorem
    },
    {
        name: "Mr. Pyla Udit Narayan Sai",
        role: "Co-Founder & Lead Engineer – Electronics & Testing",
        image: "/images/",
        linkedin: "",
        desc: lorem
    },
    {
        name: "Mr. Pyla Udit Narayan Sai",
        role: "Co-Founder & Lead Engineer – Electronics & Testing",
        image: "/images/",
        linkedin: "",
        desc: lorem
    },
    {
        name: "Mr. Pyla Udit Narayan Sai",
        role: "Co-Founder & Lead Engineer – Electronics & Testing",
        image: "/images/",
        linkedin: "",
        desc: lorem
    }
];

export default function TeamSection() {
    return (
        <section className="py-28 px-6 md:px-12 lg:px-24 text-white flex flex-col items-center">
            <h2 className="text-4xl font-bold mb-16 text-center">- The Team -</h2>

            <div className="max-w-7xl w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 items-start">
                {team.map((member, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ y: -8 }}
                        className="bg-slate-800/40 backdrop-blur-md border border-slate-700 rounded-xl p-8 flex flex-col items-center text-center w-full"
                    >
                        {/* Image holder */}
                        <a
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
                        </a>

                        {/* Name + role */}
                        <div className="w-full flex flex-col justify-start mt-5">
                            <h3 className="text-lg font-semibold leading-snug">
                                {member.name}
                            </h3>
                            <p className="text-cyan-400 text-sm mt-1 whitespace-pre-wrap">
                                {member.role}
                            </p>
                        </div>

                        {/* Description (fixed 4 lines) */}
                        <p className="text-slate-300 text-sm leading-relaxed mt-3 line-clamp-4">
                            {member.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}