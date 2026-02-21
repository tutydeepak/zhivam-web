"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useMotionTemplate, cubicBezier } from "framer-motion";
// import ServicesSection from "./ServicesSection"; // Adjust path if needed
import AboutSection from "./AboutSection";
import FoundersSection from "./FoundersSection";
import TeamSection from "./TeamSection";

export default function Home() {
    // --- 1. State and Refs for Spotlight Effect ---
    // All hooks must remain at the very top of the component
    const textRef = useRef<HTMLHeadingElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const gradientX = useMotionValue(0);
    const gradientY = useMotionValue(0);

    // This creates a smooth, performant gradient string that updates on mouse move
    const background = useMotionTemplate`radial-gradient(circle 250px at ${gradientX}px ${gradientY}px, #ff8a00, #e52e71, #6b21a8, #0077b6)`;

    // --- 2. Framer Motion Animation Variants ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 },
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
                ease: cubicBezier(0.42, 0, 0.58, 1),
            },
        },
    };

    // --- 3. Mouse Move Handler for Spotlight ---
    const handleMouseMove = (event: React.MouseEvent<HTMLHeadingElement>) => {
        if (textRef.current) {
            const rect = textRef.current.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            gradientX.set(x);
            gradientY.set(y);
        }
    };

    // --- 4. Render ---
    return (
        <main className="bg-gradient-to-br from-slate-900 to-black overflow-x-hidden">
            {/* ====== Hero Section ====== */}
            <section
                id="home"
                className="min-h-screen flex flex-col md:flex-row items-start md:items-center text-white font-chetta"
            >
                {/* Left Side: Text Content */}
                <motion.div
                    className="flex flex-col items-center md:items-start text-center md:text-left space-y-6 w-full md:w-1/4 mb-10 md:mb-0 pl-6 md:pl-12 lg:pl-24 pt-20"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h2
                        variants={itemVariants}
                        className="text-3xl md:text-5xl font-normal"
                    >
                        Welcome to
                    </motion.h2>

                    {/* Zhivam Text with Layered Hover Fade-In */}
                    <motion.h1
                        ref={textRef}
                        variants={itemVariants}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onMouseMove={handleMouseMove}
                        className="relative text-7xl md:text-9xl font-medium -mt-4 md:-mt-8 leading-none cursor-default"
                    >
                        {/* Base Text (Always visible) */}
                        <span className="text-white">Zhivam</span>

                        {/* Spotlight Gradient Overlay (Fades in smoothly on hover) */}
                        <motion.span
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                            style={{
                                color: "transparent",
                                backgroundImage: background, // Tied directly to the 60fps motion template
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            aria-hidden="true" // Hides from screen readers so "Zhivam" isn't read twice
                        >
                            Zhivam
                        </motion.span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-lg text-slate-300 max-w-md"
                    >
                        Crafting innovative solutions that bridge the gap between imagination and reality.
                    </motion.p>
                </motion.div>

                {/* Right Side: Image Holder */}
                <div
                    className="w-full md:flex-1 h-screen rounded-2xl [mask-image:linear-gradient(to_right,transparent,black_20%)] bg-cover bg-center"
                    style={{ backgroundImage: "url('/images/HeroSection Image.png')" }}
                ></div>
            </section>

            {/* ====== About Section ====== */}
            <AboutSection />

            {/* ====== Founder Section ====== */}
            <FoundersSection />

            {/* ====== Team Section ====== */}
            <TeamSection />
        </main>
    );
}