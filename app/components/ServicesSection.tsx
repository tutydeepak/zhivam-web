// app/ServicesSection.tsx
"use client";

import { motion } from "framer-motion";
import { Clock, IndianRupee, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const services = [
    { id: 1, title: "Aluminum Extrusion", description: "Cost-effective process for creating custom cross-sectional profiles for linear heat sinks.", cycleTime: "5-7 Days", price: "5,000", imageUrl: "/images/extrusion.png" },
    { id: 2, title: "CNC Machining", description: "High-precision machining for complex geometries and prototypes with tight tolerances.", cycleTime: "3-5 Days", price: "12,000", imageUrl: "/images/cnc.png" },
    { id: 3, title: "Skived Fin Heatsinks", description: "Creates thin, high-density fins from a solid block of metal for superior thermal performance.", cycleTime: "7-10 Days", price: "18,000", imageUrl: "/images/skived.png" },
    { id: 4, title: "Bonded Fin Assembly", description: "Allows for large heatsinks with high aspect ratio fins by bonding individual fins to a base.", cycleTime: "10-12 Days", price: "25,000", imageUrl: "/images/bonded.png" },
    { id: 5, title: "Die Casting", description: "Ideal for high-volume production of complex heatsink shapes with integrated features.", cycleTime: "15-20 Days", price: "50,000", imageUrl: "/images/die-cast.png" },
    { id: 6, title: "Stamped Fin Heatsinks", description: "Low-cost solution for high-volume applications, typically used in consumer electronics.", cycleTime: "7-9 Days", price: "3,000", imageUrl: "/images/stamped.png" },
    { id: 7, title: "Cold Forging", description: "Improves thermal conductivity by shaping metal at room temperature, ideal for pin fin designs.", cycleTime: "8-10 Days", price: "15,000", imageUrl: "/images/forged.png" },
    { id: 8, title: "Liquid Cold Plates", description: "Advanced liquid cooling solution for high-power density electronics and demanding applications.", cycleTime: "12-15 Days", price: "35,000", imageUrl: "/images/liquid-plate.png" },
    { id: 9, title: "Heat Pipe Integration", description: "Integrate heat pipes into your assembly to efficiently transfer heat away from the source.", cycleTime: "5-8 Days", price: "9,000", imageUrl: "/images/heat-pipe.png" },
    { id: 10, title: "Vapor Chamber Assembly", description: "Two-phase heat transfer devices that provide rapid, uniform heat spreading for high heat flux.", cycleTime: "14-18 Days", price: "45,000", imageUrl: "/images/vapor-chamber.png" },
];

interface Service {
    id: number;
    title: string;
    description: string;
    cycleTime: string;
    price: string;
    imageUrl: string;
}

const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            delay: i * 0.06,
            ease: "easeOut" as const,
        },
    }),
};

const ServiceCard = ({ service, index }: { service: Service; index: number }) => (
    <motion.div
        custom={index}
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
    >
        <Link href={`/services/${service.id}`} className="block h-full group" passHref>
            <div className="relative h-full flex flex-col bg-[#0d1520] border border-slate-700/60 rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_32px_rgba(6,182,212,0.08)]">

                {/* Index number — top left corner */}
                <span className="absolute top-4 left-4 z-10 text-xs font-mono text-slate-500 bg-slate-900/80 border border-slate-700/60 rounded-md px-2 py-0.5 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                </span>

                {/* Arrow icon — top right on hover */}
                <span className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                </span>

                {/* Image */}
                <div className="relative w-full h-44 overflow-hidden bg-slate-800/40">
                    <Image
                        src={service.imageUrl}
                        alt={service.title}
                        fill
                        loading="lazy"
                        className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                    {/* Bottom image fade */}
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0d1520] to-transparent" />
                </div>

                {/* Body */}
                <div className="flex flex-col flex-grow p-5 pt-4">
                    <h3 className="text-base font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-200 leading-snug">
                        {service.title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 flex-grow">
                        {service.description}
                    </p>

                    {/* Divider */}
                    <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-slate-500 font-medium">
                                <Clock size={10} /> Lead Time
                            </span>
                            <span className="text-xs font-semibold text-white">{service.cycleTime}</span>
                        </div>
                        <div className="flex flex-col gap-1 items-end text-right">
                            <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-slate-500 font-medium">
                                <IndianRupee size={10} /> From
                            </span>
                            <span className="text-xs font-semibold text-cyan-400">₹{service.price}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    </motion.div>
);

export default function ServicesSection() {
    return (
        <section id="services" className="relative py-24 px-4 md:px-8 bg-[#080c14] overflow-hidden">

            {/* Background grid texture */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(to right, #22d3ee 1px, transparent 1px)`,
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Ambient glow */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-500/5 blur-[100px] rounded-full" />

            <div className="relative container mx-auto max-w-screen-xl">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" as const }}
                    className="mb-14"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-cyan-500" />
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-500">
                            Manufacturing Capabilities
                        </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Our Services
                        </h2>
                        <p className="text-slate-400 text-sm max-w-sm leading-relaxed md:text-right">
                            High-precision heatsink manufacturing capabilities tailored to your thermal management needs.
                        </p>
                    </div>

                    {/* Stats row */}
                    <div className="mt-8 flex flex-wrap gap-6 border-t border-slate-700/50 pt-6">
                        {[
                            { label: "Manufacturing Processes", value: `${services.length}+` },
                            { label: "Min. Lead Time", value: "3 Days" },
                            { label: "Starting From", value: "₹3,000" },
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col gap-0.5">
                                <span className="text-xl font-bold text-white tabular-nums">{stat.value}</span>
                                <span className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {services.map((service, i) => (
                        <ServiceCard key={service.id} service={service} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}