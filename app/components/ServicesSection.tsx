// app/ServicesSection.tsx

"use client";

import { motion } from "framer-motion";
import { Eye, Clock, IndianRupee } from 'lucide-react'; // Changed ShoppingCart to Eye for clarity
import Link from "next/link";
import Image from "next/image"; // Imported the Next.js Image component

// Sample data for the service cards
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
    { id: 10, title: "Vapor Chamber Assembly", description: "Two-phase heat transfer devices that provide rapid, uniform heat spreading for high heat flux.", cycleTime: "14-18 Days", price: "45,000", imageUrl: "/images/vapor-chamber.png" }
];

// Reusable Service Card Component
interface Service {
    id: number;
    title: string;
    description: string;
    cycleTime: string;
    price: string;
    imageUrl: string;
}

const ServiceCard = ({ service }: { service: Service }) => (
    <Link href={`/services/${service.id}`} className="block h-full group" passHref>
        <motion.div
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden flex flex-col h-full cursor-pointer"
            whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0, 255, 255, 0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <div className="relative w-full h-48 overflow-hidden">
                <Image
                    src={service.imageUrl}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-cyan-400 mb-2">{service.title}</h3>
                <p className="text-gray-300 text-sm mb-4 flex-grow line-clamp-3">{service.description}</p>
                <div className="mt-auto space-y-3 border-t border-slate-700 pt-4">
                    <div className="flex justify-between items-center text-gray-400 text-sm">
                        <span className="flex items-center gap-2"><Clock size={16} /> Cycle Time</span>
                        <span className="font-semibold text-white">{service.cycleTime}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400 text-sm">
                        <span className="flex items-center gap-2"><IndianRupee size={16} /> Starting Price</span>
                        <span className="font-semibold text-white">₹{service.price}</span>
                    </div>
                </div>
                {/* This is now a styled div instead of a button, as the whole card is a link */}
                <div className="mt-5 w-full bg-cyan-500 text-slate-900 font-bold py-2.5 px-4 rounded-lg group-hover:bg-cyan-400 transition-colors duration-300 flex items-center justify-center gap-2">
                    <Eye size={18} /> View Details
                </div>
            </div>
        </motion.div>
    </Link>
);

export default function ServicesSection() {
    return (
        <section id="services" className="py-20 px-4 md:px-8">
            <div className="container mx-auto">
                <h2 className="text-4xl font-extrabold text-center text-white mb-4">
                    Our Manufacturing Services
                </h2>
                <p className="text-center text-gray-400 max-w-2xl mx-auto mb-12">
                    Explore our wide range of high-precision heatsink manufacturing capabilities tailored to your thermal management needs.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {services.map(service => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            </div>
        </section>
    );
}