"use client";

import Image from "next/image";
import Link from "next/link";

const blogs = [
    {
        id: "1",
        title: "Thermal Management Strategies for Power Electronics",
        date: "Feb 10, 2026",
        image: "/images/blog1.jpg",
    },
    {
        id: "2",
        title: "Design Optimization of Liquid Cold Plates",
        date: "Feb 05, 2026",
        image: "/images/blog2.jpg",
    },
    {
        id: "3",
        title: "CFD Insights for Electronics Cooling Systems",
        date: "Jan 28, 2026",
        image: "/images/blog3.jpg",
    },
    {
        id: "4",
        title: "Manufacturing Challenges in Microchannel Cooling",
        date: "Jan 20, 2026",
        image: "/images/blog4.jpg",
    },
];

export default function BlogPage() {
    return (
        <section className="min-h-screen px-6 md:px-12 lg:px-24 py-32 text-white">
            {/* Heading */}
            <h1 className="text-4xl font-bold mb-14 text-center">— Blogs —</h1>

            {/* Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                {blogs.map((blog) => (
                    <Link key={blog.id} href={`/blog/${blog.id}`}>
                        <article
                            className="group cursor-pointer rounded-xl border border-white/20 overflow-hidden
                   transition-all duration-300 hover:bg-white/10"
                        >
                            {/* Image */}
                            <div className="relative overflow-hidden">
                                <Image
                                    src={blog.image}
                                    alt={blog.title}
                                    width={800}
                                    height={500}
                                    className="w-full h-[260px] object-cover"
                                />

                                {/* Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80" />
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col">
                                {/* Date */}
                                <p className="text-xs text-slate-400 mb-2">{blog.date}</p>

                                {/* ⭐ Fixed height title */}
                                <h2 className="text-lg font-semibold uppercase tracking-wide transition-colors group-hover:text-cyan-400 min-h-[3rem] leading-snug">
                                    {blog.title}
                                </h2>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>
        </section>
    );
}