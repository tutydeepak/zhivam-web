"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
    IndianRupee,
    Clock,
    ArrowLeft,
    Send,
    Heart,
    ShoppingCart,
    CheckCircle,
    X,
    CreditCard,
    Eye,
    UploadCloud,
    Share2,
    Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/app/contexts/CartContext";

const services = [
    {
        id: 1,
        title: "Aluminum Extrusion",
        description: "Cost-effective process for creating custom cross-sectional profiles for linear heat sinks.",
        cycleTime: "5-7 Days",
        price: "5,000",
        imageUrl: "/images/services/extrusion.png",
        availableMaterials: ["Aluminum 6063", "Aluminum 6061"],
        availableColors: ["Silver", "Black Anodized", "Clear Anodized"],
    },
    {
        id: 2,
        title: "CNC Machining",
        description: "High-precision machining for complex geometries and prototypes with tight tolerances.",
        cycleTime: "3-5 Days",
        price: "12,000",
        imageUrl: "/images/services/cnc.png",
        availableMaterials: ["Aluminum 7075", "Brass C360", "Steel 1018", "Titanium Grade 5"],
        availableColors: ["Raw Finish", "Bead Blasted", "Anodized (Custom)"],
    },
    {
        id: 3,
        title: "Skived Fin Heatsinks",
        description: "Creates thin, high-density fins from a solid block of metal for superior thermal performance.",
        cycleTime: "7-10 Days",
        price: "18,000",
        imageUrl: "/images/services/skived.png",
        availableMaterials: ["Copper C110", "Aluminum 6063"],
        availableColors: ["Natural Copper", "Silver (Aluminum)"],
    },
    {
        id: 4,
        title: "Bonded Fin Assembly",
        description: "Allows for large heatsinks with high aspect ratio fins by bonding individual fins to a base.",
        cycleTime: "10-12 Days",
        price: "25,000",
        imageUrl: "/images/bonded.png",
        availableMaterials: ["Aluminum Base, Aluminum Fins", "Copper Base, Aluminum Fins", "Copper Base, Copper Fins"],
        availableColors: ["Grey", "Black"],
    },
];

const inputClass = "w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 transition-colors";
const selectClass = "w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400/60 transition-colors";

export default function ServiceDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const service = services.find((s) => s.id === Number(id));
    const { addToCart, cartIconRef } = useCart();

    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [dimensions, setDimensions] = useState({ length: "", breadth: "", thickness: "", baseHeight: "" });
    const [notes, setNotes] = useState("");
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLinkCopied, setIsLinkCopied] = useState(false);
    const [showMagnifier, setShowMagnifier] = useState(false);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [flyingImage, setFlyingImage] = useState<{ src: string; key: number } | null>(null);
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

    const imageContainerRef = useRef<HTMLDivElement>(null);
    const MAGNIFIER_SIZE = 150;
    const ZOOM_LEVEL = 2;

    useEffect(() => {
        if (service) {
            setSelectedMaterial(service.availableMaterials[0]);
            setSelectedColor(service.availableColors[0]);
        }
    }, [service]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (imageContainerRef.current) {
            const rect = imageContainerRef.current.getBoundingClientRect();
            setCursorPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
    };

    const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (value !== "" && parseFloat(value) < 0) return;
        setDimensions(prev => ({ ...prev, [name]: value }));
    };

    const handleShare = async () => {
        if (!service) return;
        const shareData = { title: service.title, text: service.description, url: window.location.href };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                setIsLinkCopied(true);
                setTimeout(() => setIsLinkCopied(false), 2500);
            }
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    if (!service) {
        return (
            <div className="min-h-screen bg-[#080c14] flex items-center justify-center text-white text-xl">
                Service not found.
            </div>
        );
    }

    const otherServices = services.filter((s) => s.id !== service.id);

    const handleAddToCart = () => {
        addToCart();
        if (service) setFlyingImage({ src: service.imageUrl, key: Date.now() });
    };

    const getImageRect = () => {
        const rect = imageContainerRef.current?.getBoundingClientRect();
        return rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : {};
    };

    const getCartRect = () => {
        const rect = cartIconRef.current?.getBoundingClientRect();
        return rect ? { top: rect.top + rect.height / 2, left: rect.left + rect.width / 2, width: 0, height: 0 } : {};
    };

    const imageContainerSize = imageContainerRef.current ? imageContainerRef.current.offsetWidth : 0;

    return (
        <div className="min-h-screen bg-[#080c14] text-white">

            {/* Background grid texture */}
            <div
                className="pointer-events-none fixed inset-0 opacity-[0.03] z-0"
                style={{
                    backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(to right, #22d3ee 1px, transparent 1px)`,
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Flying image animation */}
            <AnimatePresence>
                {flyingImage && (
                    <motion.div
                        key={flyingImage.key}
                        initial={getImageRect()}
                        animate={getCartRect()}
                        transition={{ duration: 0.6, ease: "easeInOut" as const }}
                        onAnimationComplete={() => setFlyingImage(null)}
                        className="fixed z-[100] rounded-xl overflow-hidden shadow-2xl"
                    >
                        <Image src={flyingImage.src} alt="flying item" fill className="object-cover" />
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="relative z-10 pt-24 pb-12 px-4 md:px-8 max-w-screen-xl mx-auto">

                {/* Back button */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-10 transition-colors text-sm"
                >
                    <ArrowLeft size={16} /> Back to Services
                </motion.button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

                    {/* ── LEFT: Image & CAD ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col gap-5"
                    >
                        {/* Image */}
                        <div
                            ref={imageContainerRef}
                            className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-700/60 cursor-pointer group bg-[#0d1520]"
                            onMouseEnter={() => setShowMagnifier(true)}
                            onMouseLeave={() => setShowMagnifier(false)}
                            onMouseMove={handleMouseMove}
                            onClick={() => setIsImageViewerOpen(true)}
                        >
                            <Image
                                src={service.imageUrl}
                                alt={service.title}
                                fill
                                className="object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Eye size={40} className="text-white/80" />
                            </div>
                            <AnimatePresence>
                                {showMagnifier && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute rounded-full border-2 border-cyan-400/50 bg-no-repeat pointer-events-none shadow-lg"
                                        style={{
                                            height: `${MAGNIFIER_SIZE}px`,
                                            width: `${MAGNIFIER_SIZE}px`,
                                            top: `${cursorPosition.y - MAGNIFIER_SIZE / 2}px`,
                                            left: `${cursorPosition.x - MAGNIFIER_SIZE / 2}px`,
                                            backgroundImage: `url(${service.imageUrl})`,
                                            backgroundSize: `${imageContainerSize * ZOOM_LEVEL}px ${imageContainerSize * ZOOM_LEVEL}px`,
                                            backgroundPosition: `-${cursorPosition.x * ZOOM_LEVEL - MAGNIFIER_SIZE / 2}px -${cursorPosition.y * ZOOM_LEVEL - MAGNIFIER_SIZE / 2}px`,
                                        }}
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        {/* CAD Upload */}
                        <div className="w-full bg-[#0d1520] border border-slate-700/60 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="h-px w-6 bg-cyan-500" />
                                <span className="text-xs font-mono uppercase tracking-[0.15em] text-cyan-500">CAD Model Upload</span>
                            </div>
                            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 hover:border-cyan-500/50 hover:bg-slate-800/20 transition-colors text-center">
                                <UploadCloud className="mx-auto h-10 w-10 text-slate-500 mb-3" />
                                <label htmlFor="file-upload" className="relative cursor-pointer block">
                                    <span className="text-cyan-400 font-medium text-sm">Upload a file</span>
                                    <p className="text-xs text-slate-500 mt-1">or drag and drop</p>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".step,.stp,.stl,.iges,.igs,.sldprt" />
                                </label>
                            </div>
                            <p className="text-xs text-slate-600 mt-3 text-center">Supported: STEP, STL, IGES, SLDPRT</p>
                        </div>
                    </motion.div>

                    {/* ── RIGHT: Details ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="relative"
                    >
                        {/* Action buttons */}
                        <div className="absolute top-0 right-0 flex items-center gap-1">
                            <div className="relative">
                                <button onClick={handleShare} className="p-2 rounded-full text-slate-500 hover:text-cyan-400 hover:bg-slate-800/50 transition-colors" aria-label="Share">
                                    <Share2 size={18} />
                                </button>
                                <AnimatePresence>
                                    {isLinkCopied && (
                                        <motion.span
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute top-10 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-lg whitespace-nowrap"
                                        >
                                            Link Copied!
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                            <button onClick={() => setIsFavorited(!isFavorited)} className="p-2 rounded-full hover:bg-slate-800/50 transition-colors" aria-label="Favourite">
                                <Heart size={18} className={`transition-all ${isFavorited ? "text-red-500 fill-current" : "text-slate-500"}`} />
                            </button>
                        </div>

                        {/* Title + eyebrow */}
                        <div className="mb-6 pr-16">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="h-px w-6 bg-cyan-500" />
                                <span className="text-xs font-mono uppercase tracking-[0.15em] text-cyan-500">Service Details</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">{service.title}</h1>
                            <p className="text-slate-400 text-sm mt-3 leading-relaxed">{service.description}</p>
                        </div>

                        {/* Specs */}
                        <div className="bg-[#0d1520] border border-slate-700/60 rounded-2xl overflow-hidden mb-5">
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/50">
                                <span className="flex items-center gap-2 text-sm text-slate-400"><Clock size={14} /> Cycle Time</span>
                                <span className="text-sm font-semibold text-white">{service.cycleTime}</span>
                            </div>
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/50">
                                <span className="flex items-center gap-2 text-sm text-slate-400"><IndianRupee size={14} /> Base Price</span>
                                <span className="text-sm font-semibold text-cyan-400">₹{service.price}</span>
                            </div>
                            <div className="flex items-center justify-between px-5 py-3.5">
                                <span className="flex items-center gap-2 text-sm text-slate-400"><Star size={14} className="text-yellow-400" /> Rating</span>
                                <span className="text-sm font-semibold text-white">4.6 / 5</span>
                            </div>
                        </div>

                        {/* Customization */}
                        <div className="bg-[#0d1520] border border-slate-700/60 rounded-2xl p-5 mb-5 space-y-4">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="h-px w-6 bg-cyan-500" />
                                <span className="text-xs font-mono uppercase tracking-[0.15em] text-cyan-500">Customize</span>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Material</label>
                                <select value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)} className={selectClass}>
                                    {service.availableMaterials.map((mat) => (<option key={mat} value={mat}>{mat}</option>))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Color / Finish</label>
                                <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className={selectClass}>
                                    {service.availableColors.map((col) => (<option key={col} value={col}>{col}</option>))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Dimensions (mm)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { name: "length", placeholder: "Length" },
                                        { name: "breadth", placeholder: "Breadth" },
                                        { name: "thickness", placeholder: "Thickness" },
                                        { name: "baseHeight", placeholder: "Base Height" },
                                    ].map((field) => (
                                        <input
                                            key={field.name}
                                            type="number"
                                            name={field.name}
                                            min="0"
                                            placeholder={field.placeholder}
                                            value={dimensions[field.name as keyof typeof dimensions]}
                                            onChange={handleDimensionChange}
                                            className={`${inputClass} text-center`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Special Notes</label>
                                <textarea
                                    className={`${inputClass} resize-none`}
                                    placeholder="Specific tolerances, finish requirements, etc."
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 italic mb-5">
                            * Base price shown. Final price depends on material, size, and additional requirements.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAddToCart}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
                            >
                                <ShoppingCart size={16} /> Add to Cart
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsPopupVisible(true)}
                                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
                            >
                                <Send size={16} /> Place Order
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                {/* Other Services */}
                <div className="mt-24 pt-12 border-t border-slate-700/50">
                    <div className="flex items-center gap-3 mb-10">
                        <span className="h-px w-8 bg-cyan-500" />
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-500">More Services</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {otherServices.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" as const }}
                                whileHover={{ y: -4 }}
                                className="group bg-[#0d1520] border border-slate-700/60 rounded-2xl overflow-hidden hover:border-cyan-500/40 transition-all duration-300"
                            >
                                <Link href={`/services/${item.id}`}>
                                    <div className="relative w-full h-44 overflow-hidden bg-slate-800/40">
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0d1520] to-transparent" />
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">{item.description}</p>
                                        <div className="flex justify-between items-center text-xs border-t border-slate-700/50 pt-3">
                                            <span className="text-slate-500 flex items-center gap-1"><Clock size={11} /> {item.cycleTime}</span>
                                            <span className="text-cyan-400 font-semibold">₹{item.price}</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Order Popup */}
            <AnimatePresence>
                {isPopupVisible && (
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsPopupVisible(false)}
                    >
                        <motion.div
                            className="bg-[#0d1520] border border-slate-700/60 rounded-2xl p-8 shadow-2xl text-center relative w-full max-w-md"
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setIsPopupVisible(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors" aria-label="Close">
                                <X size={20} />
                            </button>
                            <div className="mx-auto w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-5">
                                <CheckCircle size={32} className="text-green-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Order Placed!</h2>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed">Your service request has been submitted. We'll notify you with updates shortly.</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button className="flex-1 border border-slate-700 hover:border-slate-500 text-white font-medium py-3 px-5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                                    <Eye size={15} /> View Order
                                </button>
                                <button className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 px-5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                                    <CreditCard size={15} /> Pay Now
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Viewer */}
            <AnimatePresence>
                {isImageViewerOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsImageViewerOpen(false)}
                    >
                        <motion.div
                            className="relative w-full h-full max-w-4xl max-h-[80vh]"
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image src={service.imageUrl} alt={service.title} fill className="object-contain rounded-xl" />
                        </motion.div>
                        <button onClick={() => setIsImageViewerOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors" aria-label="Close">
                            <X size={28} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}