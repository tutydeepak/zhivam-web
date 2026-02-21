"use client";

import { motion } from "framer-motion";

export default function AboutSection() {
    return (
        // Added flex, flex-col, and items-center here to center the grid container
        <section id="about" className="py-28 px-6 md:px-12 text-white flex flex-col items-center">
            <h2 className="text-4xl font-bold mb-8 text-center">
                About Us
            </h2>

            {/* Center container */}
            <div className="max-w-7xl w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">

                {/* Card 1 */}
                <motion.div
                    whileHover={{ y: -8 }}
                    className="bg-slate-800/40 backdrop-blur-md border border-slate-700 rounded-xl overflow-hidden flex flex-col items-center text-center min-h-[520px] max-w-sm mx-auto"
                >
                    <div className="bg-slate-300 text-black w-full py-3 font-medium tracking-widest">
                        Technical Experience
                    </div>

                    <div className="flex flex-col items-center p-10 space-y-8">

                        {/* Image holder */}
                        <div className="h-28 w-28 rounded-3xl bg-slate-700/50 border border-slate-600 flex items-center justify-center">
                            <img src="/images/tech.png" alt="" className="h-12" />
                        </div>

                        <p className="text-slate-300 text-sm leading-relaxed">
                            We bring deep technical expertise in electronic thermal management, covering air cooling, liquid cooling, immersion cooling, and battery thermal systems. Our team works across design, simulation, prototyping, and testing, using advanced multiphysics tools to deliver reliable and application-ready thermal solutions.
                        </p>
                    </div>
                </motion.div>

                {/* Card 2 */}
                <motion.div
                    whileHover={{ y: -8 }}
                    className="bg-slate-800/40 backdrop-blur-md border border-slate-700 rounded-xl overflow-hidden flex flex-col items-center text-center min-h-[520px] max-w-sm mx-auto"
                >
                    <div className="bg-slate-300 text-black w-full py-3 font-medium tracking-widest">
                        High ROI
                    </div>

                    <div className="flex flex-col items-center p-10 space-y-8">

                        <div className="h-28 w-28 rounded-3xl bg-slate-700/50 border border-slate-600 flex items-center justify-center">
                            <img src="/images/roi.png" alt="" className="h-12" />
                        </div>

                        <p className="text-slate-300 text-sm leading-relaxed">
                            Optimized thermal design improves performance, reliability, and product lifetime while reducing redesign cycles and testing costs. Our simulation-driven and validation-backed approach helps customers achieve faster development, lower thermal risk, and higher return on investment for electronics, batteries, and energy systems.
                        </p>
                    </div>
                </motion.div>

                {/* Card 3 */}
                <motion.div
                    whileHover={{ y: -8 }}
                    className="bg-slate-800/40 backdrop-blur-md border border-slate-700 rounded-xl overflow-hidden flex flex-col items-center text-center min-h-[520px] max-w-sm mx-auto"
                >
                    <div className="bg-slate-300 text-black w-full py-3 font-medium tracking-widest">
                        Looking Ahead
                    </div>

                    <div className="flex flex-col items-center p-10 space-y-8">

                        <div className="h-28 w-28 rounded-3xl bg-slate-700/50 border border-slate-600 flex items-center justify-center">
                            <img src="/images/future.png" alt="" className="h-12" />
                        </div>

                        <p className="text-slate-300 text-sm leading-relaxed">
                            As power density and heat flux continue to rise, we focus on next-generation cooling technologies such as liquid-cooled cold plates, phase change materials, thermal capacitors, and immersion cooling. Zhivam partners with industry to future-proof products through scalable, efficient, and sustainable thermal solutions.
                        </p>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}