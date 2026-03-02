// app/blog/[id]/page.tsx
"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Share2, Twitter, Linkedin, Copy } from "lucide-react";
import { notFound } from "next/navigation";

// Dummy data (In production, fetch this based on the ID)
const blogs = [
    {
        id: "1",
        title: "Thermal Management Strategies for Power Electronics",
        date: "Feb 10, 2026",
        category: "Thermal Design",
        readTime: "5 min read",
        author: { name: "Dr. Arvind Kumar", role: "Lead Thermal Engineer" },
        image: "/images/blog1.jpg",
        content: [
            { type: "h2", text: "The Heat Problem in Modern Electronics" },
            { type: "p", text: "Power electronics have revolutionized energy conversion, but their compact size and high power density pose significant thermal challenges. As components shrink, the heat flux increases dramatically, threatening reliability and lifespan." },
            { type: "quote", text: "Effective thermal management is no longer an afterthought; it is a fundamental pillar of electronic system design." },
            { type: "h2", text: "Advanced Heat Sink Geometries" },
            { type: "p", text: "Traditional extruded heat sinks are reaching their limits. We are now looking at skived fins, bonded fins, and vapor chambers to spread heat rapidly. Skived fins, for instance, allow for extremely high fin density without the thermal resistance introduced by bonding agents." },
            { type: "p", text: "By integrating phase-change materials (PCMs) with these advanced geometries, systems can absorb transient thermal spikes, ensuring steady-state operation even under heavy, fluctuating loads." }
        ]
    },
    // ... add other blogs here to match your main array
];

export default function BlogViewPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap the params Promise using React.use()
    const resolvedParams = use(params);

    // Now you can safely access the ID!
    const post = blogs.find((blog) => blog.id === resolvedParams.id);

    if (!post) {
        return notFound();
    }

    return (
        <article className="relative min-h-screen bg-[#080c14] text-white pt-32 pb-24 px-4 md:px-8 overflow-hidden">

            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full" />
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(to right, #22d3ee 1px, transparent 1px)`,
                    backgroundSize: "64px 64px",
                }}
            />

            <div className="relative max-w-screen-md mx-auto z-10">

                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link
                        href="/blog"
                        className="group inline-flex items-center gap-2 text-sm font-mono text-slate-400 hover:text-cyan-400 mb-10 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to all articles
                    </Link>
                </motion.div>

                {/* Header Section */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-12"
                >
                    <div className="flex flex-wrap items-center gap-4 mb-6 text-xs font-mono text-slate-400">
                        <span className="uppercase tracking-widest text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-3 py-1">
                            {post.category}
                        </span>
                        <span>•</span>
                        <span>{post.date}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-white leading-[1.15] mb-8">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-between border-t border-slate-700/50 pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 font-bold border border-slate-700">
                                {post.author.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{post.author.name}</p>
                                <p className="text-xs text-slate-500">{post.author.role}</p>
                            </div>
                        </div>

                        {/* Share actions */}
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-full transition-all" title="Share on Twitter">
                                <Twitter className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-full transition-all" title="Share on LinkedIn">
                                <Linkedin className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-full transition-all" title="Copy Link">
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.header>

                {/* Hero Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="relative w-full h-[300px] md:h-[450px] rounded-2xl overflow-hidden bg-slate-800/40 border border-slate-700/60 mb-14"
                >
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        priority
                        className="object-cover"
                    />
                </motion.div>

                {/* Article Body */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="prose prose-invert prose-cyan max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-lg prose-headings:text-white prose-a:text-cyan-400"
                >
                    {/* Render content based on our dummy array structure */}
                    {post.content.map((block, index) => {
                        if (block.type === "p") {
                            return <p key={index} className="mb-6">{block.text}</p>;
                        }
                        if (block.type === "h2") {
                            return <h2 key={index} className="text-2xl font-bold mt-12 mb-6">{block.text}</h2>;
                        }
                        if (block.type === "quote") {
                            return (
                                <blockquote key={index} className="border-l-4 border-cyan-500 pl-6 py-2 my-10 text-xl italic text-slate-200 bg-cyan-500/5 rounded-r-xl">
                                    "{block.text}"
                                </blockquote>
                            );
                        }
                        return null;
                    })}
                </motion.div>

                {/* Bottom Divider & Next Action */}
                <div className="mt-16 pt-8 border-t border-slate-700/50 text-center">
                    <p className="text-slate-400 mb-4">Enjoyed this article?</p>
                    <Link
                        href="/blog"
                        className="inline-flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full px-6 py-3 text-sm font-semibold transition-all"
                    >
                        Explore More Research
                    </Link>
                </div>

            </div>
        </article>
    );
}