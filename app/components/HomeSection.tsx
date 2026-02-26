"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
// import ServicesSection from "./ServicesSection";
import AboutSection from "./AboutSection";
import FoundersSection from "./FoundersSection";
import TeamSection from "./TeamSection";
import LogoSection from "./LogoSection";

export default function Home() {
    const textRef = useRef<HTMLHeadingElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const gradientX = useMotionValue(0);
    const gradientY = useMotionValue(0);

    const background = useMotionTemplate`radial-gradient(circle 250px at ${gradientX}px ${gradientY}px, #ff8a00, #e52e71, #6b21a8, #0077b6)`;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.18 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
        visible: {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeInOut" as const,
            },
        },
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLHeadingElement>) => {
        if (textRef.current) {
            const rect = textRef.current.getBoundingClientRect();
            gradientX.set(event.clientX - rect.left);
            gradientY.set(event.clientY - rect.top);
        }
    };

    return (
        <main className="bg-[#080c14] overflow-x-hidden">

            {/* ====== Hero Section ====== */}
            <section
                id="home"
                className="relative min-h-screen flex flex-col md:flex-row items-start md:items-center text-white overflow-hidden"
            >
                {/* Background grid texture */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.03] z-0"
                    style={{
                        backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(to right, #22d3ee 1px, transparent 1px)`,
                        backgroundSize: "48px 48px",
                    }}
                />

                {/* Ambient glow — left side behind text */}
                <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full z-0" />

                {/* Left Side: Text Content */}
                <motion.div
                    className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left space-y-6 w-full md:max-w-xl mb-10 md:mb-0 pl-6 md:pl-12 lg:pl-24 pt-24 md:pt-0"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Eyebrow label */}
                    <motion.div variants={itemVariants} className="flex items-center gap-3">
                        <span className="h-px w-8 bg-cyan-500" />
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-500">
                            Thermal Engineering
                        </span>
                    </motion.div>

                    <motion.h2
                        variants={itemVariants}
                        className="text-3xl md:text-4xl font-normal text-slate-300 -mb-2"
                    >
                        Welcome to
                    </motion.h2>

                    {/* Zhivam Text with Spotlight */}
                    <motion.h1
                        ref={textRef}
                        variants={itemVariants}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onMouseMove={handleMouseMove}
                        className="pt-2 md:pt-3 leading-none cursor-default font-chetta text-7xl md:text-9xl font-medium"
                        style={{ display: "grid" }}
                    >
                        {/* Base Text */}
                        <span style={{ gridArea: "1 / 1" }} className="text-white">
                            Zhivam
                        </span>

                        {/* Spotlight Gradient Overlay — stacked exactly on top via CSS grid */}
                        <motion.span
                            style={{
                                gridArea: "1 / 1",
                                color: "transparent",
                                backgroundImage: background,
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" as const }}
                            aria-hidden="true"
                        >
                            Zhivam
                        </motion.span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-base text-slate-400 max-w-sm leading-relaxed"
                    >
                        Crafting innovative thermal solutions that bridge the gap between imagination and reality.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div variants={itemVariants} className="flex items-center gap-4 pt-2">
                        <Link
                            href="/servicesoffered"
                            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm px-5 py-3 rounded-xl transition-colors duration-200"
                        >
                            Explore Services <ArrowUpRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/contact"
                            className="text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-5 py-3 rounded-xl transition-colors duration-200"
                        >
                            Contact Us
                        </Link>
                    </motion.div>

                    {/* Stats row */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-wrap gap-6 border-t border-slate-700/50 pt-6 mt-2 w-full"
                    >
                        {[
                            { label: "Manufacturing Processes", value: "10+" },
                            { label: "Min. Lead Time", value: "3 Days" },
                            { label: "Starting From", value: "₹3,000" },
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col gap-0.5 text-left">
                                <span className="text-xl font-bold text-white tabular-nums">{stat.value}</span>
                                <span className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* HERO BACKGROUND IMAGE */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <img
                        src="/images/HeroSection Image.webp"
                        alt="Hero"
                        loading="eager"
                        decoding="async"
                        className="absolute right-0 top-1/2 h-[155%] w-auto -translate-y-1/2 object-contain opacity-80"
                    />

                    {/* Cinematic left fade — matches #080c14 background */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: `linear-gradient(
                                to right,
                                #080c14 0%,
                                #080c14 18%,
                                #080c14cc 28%,
                                #080c1499 38%,
                                transparent 50%
                            )`,
                        }}
                    />

                    {/* Bottom fade into next section */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#080c14] to-transparent pointer-events-none" />
                </div>
            </section>

            {/* ====== About Section ====== */}
            <AboutSection />

            {/* ====== Logo Section ====== */}
            <LogoSection />

            {/* ====== Founder Section ====== */}
            <FoundersSection />

            {/* ====== Team Section ====== */}
            <TeamSection />
        </main>
    );
}