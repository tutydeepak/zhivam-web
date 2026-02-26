"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const blogs = [
    {
        id: "1",
        title: "Thermal Management Strategies for Power Electronics",
        date: "Feb 10, 2026",
        category: "Thermal Design",
        image: "/images/blog1.jpg",
    },
    {
        id: "2",
        title: "Design Optimization of Liquid Cold Plates",
        date: "Feb 05, 2026",
        category: "Liquid Cooling",
        image: "/images/blog2.jpg",
    },
    {
        id: "3",
        title: "CFD Insights for Electronics Cooling Systems",
        date: "Jan 28, 2026",
        category: "Simulation",
        image: "/images/blog3.jpg",
    },
    {
        id: "4",
        title: "Manufacturing Challenges in Microchannel Cooling",
        date: "Jan 20, 2026",
        category: "Manufacturing",
        image: "/images/blog4.jpg",
    },
];

const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            delay: i * 0.08,
            ease: "easeOut" as const,
        },
    }),
};

export default function BlogPage() {
    const [featured, ...rest] = blogs;

    return (
        <section className="relative min-h-screen bg-[#080c14] text-white py-28 px-4 md:px-8 overflow-hidden">

            {/* Background grid texture */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(to right, #22d3ee 1px, transparent 1px)`,
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Ambient glow */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[280px] bg-cyan-500/5 blur-[100px] rounded-full" />

            <div className="relative max-w-screen-xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" as const }}
                    className="mb-14"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-cyan-500" />
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-500">
                            Insights & Research
                        </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Latest Articles
                        </h1>
                        <p className="text-slate-400 text-sm max-w-sm leading-relaxed md:text-right">
                            Engineering insights, manufacturing deep-dives, and thermal research from the Zhivam team.
                        </p>
                    </div>

                    {/* Stats row */}
                    <div className="mt-8 flex flex-wrap gap-6 border-t border-slate-700/50 pt-6">
                        {[
                            { label: "Articles Published", value: `${blogs.length}` },
                            { label: "Latest", value: blogs[0].date },
                            { label: "Topics Covered", value: "4+" },
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col gap-0.5">
                                <span className="text-xl font-bold text-white tabular-nums">{stat.value}</span>
                                <span className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Featured post — full width */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" as const }}
                    className="mb-6"
                >
                    <Link href={`/blog/${featured.id}`} className="group block">
                        <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.08)]">

                            {/* Image */}
                            <div className="relative h-[380px] md:h-[460px] w-full overflow-hidden bg-slate-800/40">
                                <Image
                                    src={featured.image}
                                    alt={featured.title}
                                    fill
                                    priority
                                    className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-70 group-hover:opacity-90"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/40 to-transparent" />
                            </div>

                            {/* Overlay content */}
                            <div className="absolute bottom-0 left-0 right-0 p-7 flex items-end justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-3 py-1">
                                            {featured.category}
                                        </span>
                                        <span className="text-xs text-slate-400 font-mono">{featured.date}</span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white max-w-2xl leading-snug group-hover:text-cyan-400 transition-colors duration-200">
                                        {featured.title}
                                    </h2>
                                </div>
                                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-slate-600 group-hover:border-cyan-400 group-hover:text-cyan-400 transition-all duration-200 shrink-0 ml-6">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Index badge */}
                            <span className="absolute top-5 left-5 text-xs font-mono text-slate-500 bg-slate-900/80 border border-slate-700/60 rounded-md px-2 py-0.5">
                                01
                            </span>
                        </div>
                    </Link>
                </motion.div>

                {/* Remaining posts grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {rest.map((blog, i) => (
                        <motion.div
                            key={blog.id}
                            custom={i}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-60px" }}
                        >
                            <Link href={`/blog/${blog.id}`} className="group block h-full">
                                <div className="relative h-full flex flex-col bg-[#0d1520] border border-slate-700/60 rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_32px_rgba(6,182,212,0.08)]">

                                    {/* Index badge */}
                                    <span className="absolute top-4 left-4 z-10 text-xs font-mono text-slate-500 bg-slate-900/80 border border-slate-700/60 rounded-md px-2 py-0.5">
                                        {String(i + 2).padStart(2, "0")}
                                    </span>

                                    {/* Arrow */}
                                    <span className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                                    </span>

                                    {/* Image */}
                                    <div className="relative w-full h-44 overflow-hidden bg-slate-800/40">
                                        <Image
                                            src={blog.image}
                                            alt={blog.title}
                                            fill
                                            loading="lazy"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-75 group-hover:opacity-100"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0d1520] to-transparent" />
                                    </div>

                                    {/* Body */}
                                    <div className="flex flex-col flex-grow p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-2.5 py-0.5">
                                                {blog.category}
                                            </span>
                                        </div>
                                        <h2 className="text-sm font-semibold text-white leading-snug group-hover:text-cyan-400 transition-colors duration-200 flex-grow">
                                            {blog.title}
                                        </h2>
                                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                                            <span className="text-xs font-mono text-slate-500">{blog.date}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}