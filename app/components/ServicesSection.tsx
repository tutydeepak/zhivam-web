// app/ServicesSection.tsx
"use client";

import { motion } from "framer-motion";
import { Clock, IndianRupee, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const services = [
    { id: 1, title: "Aluminum Extrusion", description: "Cost-effective process for creating custom cross-sectional profiles for linear heat sinks.", cycleTime: "5-7 Days", price: "5,000", imageUrl: "/images/extrusion.webp" },
    { id: 2, title: "CNC Machining", description: "High-precision machining for complex geometries and prototypes with tight tolerances.", cycleTime: "3-5 Days", price: "12,000", imageUrl: "/images/cnc.webp" },
    { id: 3, title: "Skived Fin Heatsinks", description: "Creates thin, high-density fins from a solid block of metal for superior thermal performance.", cycleTime: "7-10 Days", price: "18,000", imageUrl: "/images/skived.webp" },
    { id: 4, title: "Bonded Fin Assembly", description: "Allows for large heatsinks with high aspect ratio fins by bonding individual fins to a base.", cycleTime: "10-12 Days", price: "25,000", imageUrl: "/images/bonded.webp" },
    { id: 5, title: "Die Casting", description: "Ideal for high-volume production of complex heatsink shapes with integrated features.", cycleTime: "15-20 Days", price: "50,000", imageUrl: "/images/die-cast.webp" },
    { id: 6, title: "Stamped Fin Heatsinks", description: "Low-cost solution for high-volume applications, typically used in consumer electronics.", cycleTime: "7-9 Days", price: "3,000", imageUrl: "/images/stamped.webp" },
    { id: 7, title: "Cold Forging", description: "Improves thermal conductivity by shaping metal at room temperature, ideal for pin fin designs.", cycleTime: "8-10 Days", price: "15,000", imageUrl: "/images/forged.webp" },
    { id: 8, title: "Liquid Cold Plates", description: "Advanced liquid cooling solution for high-power density electronics and demanding applications.", cycleTime: "12-15 Days", price: "35,000", imageUrl: "/images/liquid-plate.webp" },
    { id: 9, title: "Heat Pipe Integration", description: "Integrate heat pipes into your assembly to efficiently transfer heat away from the source.", cycleTime: "5-8 Days", price: "9,000", imageUrl: "/images/heat-pipe.webp" },
    { id: 10, title: "Vapor Chamber Assembly", description: "Two-phase heat transfer devices that provide rapid, uniform heat spreading for high heat flux.", cycleTime: "14-18 Days", price: "45,000", imageUrl: "/images/vapor-chamber.webp" },
];

export const rdServices = [
    {
        id: "rd-1",
        title: "Electronic Thermal Management",
        subtitle: "R&D & Engineering",
        description: "Zhivam provides advanced electronic thermal management services covering air cooling, liquid cooling, PCM-based systems, immersion cooling, and hybrid thermal architectures for high-power electronics and energy systems.",
        sectionLabel: "Key Services",
        capabilities: [
            "Air-cooled heat sink design and optimization",
            "Liquid-cooled cold plates (electronics & data centers)",
            "PCM-based thermal buffering",
            "Thermal capacitors for transient loads",
            "Peltier (thermoelectric) cooling systems",
        ],
        imageUrl: "/images/rd/electronic-thermal.webp",
    },
    {
        id: "rd-2",
        title: "Design, Simulation, Prototyping & Testing",
        subtitle: "",
        description: "We offer end-to-end thermal engineering services, including multiphysics simulation, design optimization, rapid prototyping, and experimental thermal validation.",
        sectionLabel: "Key Services",
        capabilities: [
            "CFD & multiphysics simulation",
            "Thermal optimization and benchmarking",
            "Prototype development",
            "Experimental testing and validation",
        ],
        imageUrl: "/images/rd/simulation.webp",
    },
    {
        id: "rd-3",
        title: "Battery Thermal Management & Testing",
        subtitle: "",
        description: "Comprehensive battery thermal management and testing services, including cold plates, PCM systems, immersion cooling, EIS, and charge-discharge testing.",
        sectionLabel: "Capabilities",
        capabilities: [
            "Battery cold plate design",
            "PCM & immersion-based battery cooling",
            "Battery EIS testing",
            "Charging-discharging & thermal characterization",
        ],
        imageUrl: "/images/rd/battery.webp",
    },
    {
        id: "rd-4",
        title: "Immersion Cooling Solutions",
        subtitle: "",
        description: "Design and evaluation of single-phase immersion cooling systems for electronics and batteries, including dielectric fluid selection and system optimization.",
        sectionLabel: "Capabilities",
        capabilities: [
            "Single-phase immersion cooling system design for electronics and batteries",
            "Dielectric fluid selection and material compatibility assessment",
            "Thermal and flow performance analysis of immersed systems",
            "Heat extraction and system-level thermal optimization",
            "Reliability and safety evaluation of immersion-cooled electronics",
            "Testing and validation of immersion cooling performance",
        ],
        imageUrl: "/images/rd/immersion.webp",
    },
    {
        id: "rd-5",
        title: "PCB Design, Prototyping & Thermal Testing",
        subtitle: "",
        description: "Zhivam delivers PCB design, fabrication, assembly, and thermal analysis services, including PCB test boards for BIS, IEC, and IS standards.",
        sectionLabel: "Capabilities",
        capabilities: [
            "Single- and double-layer PCB design",
            "PCB prototyping & assembly",
            "Thermal test boards for standards",
            "SMD resistor and component thermal testing",
        ],
        imageUrl: "/images/rd/pcb.webp",
    },
    {
        id: "rd-6",
        title: "Renewable Energy & Sustainability Solutions",
        subtitle: "",
        description: "Zhivam provides engineering and consultancy services in agrivoltaics, bifacial PV systems, and end-of-life management of solar PV modules.",
        sectionLabel: "Capabilities",
        capabilities: [
            "Agrivoltaic system design and performance assessment",
            "Bifacial photovoltaic (PV) system modeling and optimization",
            "Techno-economic analysis of solar energy systems",
            "End-of-life (EoL) management and recycling strategies for PV modules",
            "Sustainability and lifecycle assessment of PV technologies",
            "Advisory services for policy, deployment, and scalability",
        ],
        imageUrl: "/images/rd/renewable.webp",
    },
    {
        id: "rd-7",
        title: "Consultancy & Technical Advisory",
        subtitle: "",
        description: "Expert consultancy services in thermal management, product reliability, standards compliance, and cooling system selection.",
        sectionLabel: "Capabilities",
        capabilities: [
            "Thermal architecture selection and feasibility studies",
            "Cooling technology evaluation and benchmarking",
            "Thermal reliability and failure analysis of electronic systems",
            "Standards advisory (BIS, IEC, IS) for thermal and electronic testing",
            "Design review and optimization recommendations",
            "R&D and product development consultancy for startups and industries",
        ],
        imageUrl: "/images/rd/consultancy.webp",
    },
    {
        id: "rd-8",
        title: "IP Licensing & Industry Collaboration",
        subtitle: "",
        description: "We license patented thermal and energy technologies and support industry collaboration, technology transfer, and commercialization.",
        sectionLabel: "Capabilities",
        capabilities: [
            "Licensing of granted patents in thermal and energy technologies",
            "Technology transfer and commercialization support",
            "Joint R&D and co-development with industry partners",
            "Prototype-to-product transition assistance",
            "Technical documentation and know-how transfer",
            "Strategic collaboration with startups, OEMs, and research organizations",
        ],
        imageUrl: "/images/rd/ip-licensing.webp",
    },
];

interface Service {
    id: number;
    title: string;
    description: string;
    cycleTime: string;
    price: string;
    imageUrl: string;
}

interface RdService {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    sectionLabel: string;
    capabilities: string[];
    imageUrl: string;
}

const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: i * 0.06, ease: "easeOut" as const },
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
                <span className="absolute top-4 left-4 z-10 text-xs font-mono text-slate-500 bg-slate-900/80 border border-slate-700/60 rounded-md px-2 py-0.5 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                </span>
                <span className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                </span>
                <div className="relative w-full h-44 overflow-hidden bg-slate-800/40">
                    <Image src={service.imageUrl} alt={service.title} fill loading="lazy"
                        className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0d1520] to-transparent" />
                </div>
                <div className="flex flex-col flex-grow p-5 pt-4">
                    <h3 className="text-base font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-200 leading-snug">
                        {service.title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 flex-grow">{service.description}</p>
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

const RdServiceCard = ({ service, index }: { service: RdService; index: number }) => {
    const isEven = index % 2 === 0;
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: (index % 2) * 0.1, ease: "easeOut" as const }}
            className="group bg-[#0d1520] border border-slate-700/60 rounded-2xl overflow-hidden hover:border-cyan-500/40 transition-all duration-300"
        >
            <div className="flex flex-col md:flex-row md:items-stretch">
                {/* Image */}
                <div className={`relative w-full md:w-60 shrink-0 h-56 md:h-auto overflow-hidden bg-slate-800/40 ${!isEven ? "md:order-2" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={service.imageUrl}
                        alt={service.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-center opacity-75 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
                    />
                    {/* fade toward content */}
                    <div className={`absolute inset-0 hidden md:block ${isEven
                        ? "bg-gradient-to-r from-transparent to-[#0d1520]"
                        : "bg-gradient-to-l from-transparent to-[#0d1520]"}`}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0d1520] to-transparent md:hidden" />
                </div>

                {/* Content */}
                <div className={`flex flex-col justify-center p-6 flex-grow min-h-[200px] ${!isEven ? "md:order-1" : ""}`}>
                    {/* Index + rule */}
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] font-mono text-slate-600 tabular-nums">
                            {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="h-px flex-1 bg-slate-700/50" />
                    </div>

                    <h3 className="text-lg font-bold text-white leading-snug mb-1 group-hover:text-cyan-400 transition-colors duration-200">
                        {service.title}
                    </h3>
                    {service.subtitle && (
                        <p className="text-xs text-cyan-500 font-mono uppercase tracking-wider mb-3">{service.subtitle}</p>
                    )}
                    <p className="text-slate-400 text-xs leading-relaxed mb-4">{service.description}</p>

                    {/* Capabilities */}
                    <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-cyan-500 mb-2 block">
                            {service.sectionLabel}
                        </span>
                        <ul className="space-y-1.5">
                            {service.capabilities.map((cap, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-cyan-500/60 shrink-0" />
                                    {cap}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

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
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-500/5 blur-[100px] rounded-full" />

            <div className="relative container mx-auto max-w-screen-xl">

                {/* ── R&D SERVICES ── */}
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
                            R&D & Engineering
                        </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Research & Advisory
                        </h2>
                        <p className="text-slate-400 text-sm max-w-sm leading-relaxed md:text-right">
                            End-to-end R&D, simulation, testing, and consultancy services for thermal and energy systems.
                        </p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-6 border-t border-slate-700/50 pt-6">
                        {[
                            // { label: "Service Areas", value: `${rdServices.length}` },
                            { label: "Domains", value: "Thermal, Energy, PCB" },
                            { label: "Engagement", value: "R&D to Production" },
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col gap-0.5">
                                <span className="text-xl font-bold text-white">{stat.value}</span>
                                <span className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {rdServices.map((service, i) => (
                        <RdServiceCard key={service.id} service={service} index={i} />
                    ))}
                </div>

            </div>
        </section>
    );
}