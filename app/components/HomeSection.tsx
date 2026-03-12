"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import AboutSection from "./AboutSection";
import FoundersSection from "./FoundersSection";
import TeamSection from "./TeamSection";
import LogoSection from "./LogoSection";

export default function Home() {
    const textRef = useRef<HTMLDivElement>(null);
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

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
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
                    className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left space-y-6 w-full md:max-w-xl mb-10 md:mb-0 pl-2 md:pl-6 lg:pl-12 pt-24 md:pt-0"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Zhivam Logo Image with Spotlight */}
                    <motion.div
                        ref={textRef}
                        variants={itemVariants}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onMouseMove={handleMouseMove}
                        className="pt-2 md:pt-3 cursor-default"
                        style={{
                            display: "grid",
                            width: "clamp(280px, 38vw, 560px)",
                            height: "clamp(80px, 11vw, 160px)",
                        }}
                    >
                        {/* Base Image — fills the container, respects transparent padding */}
                        <img
                            src="/images/zhivam-white.png"
                            alt="Zhivam"
                            style={{
                                gridArea: "1 / 1",
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                objectPosition: "left center",
                            }}
                            className="select-none"
                            draggable={false}
                        />

                        {/* Spotlight Gradient Overlay — masked to image shape via CSS mask */}
                        <motion.div
                            style={{
                                gridArea: "1 / 1",
                                width: "100%",
                                height: "100%",
                                backgroundImage: background,
                                WebkitMaskImage: "url('/images/zhivam-white.png')",
                                maskImage: "url('/images/zhivam-white.png')",
                                WebkitMaskSize: "contain",
                                maskSize: "contain",
                                WebkitMaskRepeat: "no-repeat",
                                maskRepeat: "no-repeat",
                                WebkitMaskPosition: "left center",
                                maskPosition: "left center",
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" as const }}
                            aria-hidden="true"
                        />
                    </motion.div>

                    {/* CTAs */}
                    <motion.div variants={itemVariants} className="flex items-center gap-4 pt-2" style={{ paddingLeft: "clamp(20px, 3vw, 50px)" }}>
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