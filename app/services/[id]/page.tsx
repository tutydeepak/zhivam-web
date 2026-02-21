"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
    Star,
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
    Share2, // Added for the share button
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/app/contexts/CartContext"; // Adjust the import path if needed

const services = [
    {
        id: 1,
        title: "Aluminum Extrusion",
        description:
            "Cost-effective process for creating custom cross-sectional profiles for linear heat sinks.",
        cycleTime: "5-7 Days",
        price: "5,000",
        imageUrl: "/images/services/extrusion.png",
        availableMaterials: ["Aluminum 6063", "Aluminum 6061"],
        availableColors: ["Silver", "Black Anodized", "Clear Anodized"],
    },
    {
        id: 2,
        title: "CNC Machining",
        description:
            "High-precision machining for complex geometries and prototypes with tight tolerances.",
        cycleTime: "3-5 Days",
        price: "12,000",
        imageUrl: "/images/services/cnc.png",
        availableMaterials: [
            "Aluminum 7075",
            "Brass C360",
            "Steel 1018",
            "Titanium Grade 5",
        ],
        availableColors: ["Raw Finish", "Bead Blasted", "Anodized (Custom)"],
    },
    {
        id: 3,
        title: "Skived Fin Heatsinks",
        description:
            "Creates thin, high-density fins from a solid block of metal for superior thermal performance.",
        cycleTime: "7-10 Days",
        price: "18,000",
        imageUrl: "/images/services/skived.png",
        availableMaterials: ["Copper C110", "Aluminum 6063"],
        availableColors: ["Natural Copper", "Silver (Aluminum)"],
    },
    {
        id: 4,
        title: "Bonded Fin Assembly",
        description:
            "Allows for large heatsinks with high aspect ratio fins by bonding individual fins to a base.",
        cycleTime: "10-12 Days",
        price: "25,000",
        imageUrl: "/images/bonded.png",
        availableMaterials: [
            "Aluminum Base, Aluminum Fins",
            "Copper Base, Aluminum Fins",
            "Copper Base, Copper Fins",
        ],
        availableColors: ["Grey", "Black"],
    },
];

export default function ServiceDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const service = services.find((s) => s.id === Number(id));

    const { addToCart, cartIconRef } = useCart();

    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [dimensions, setDimensions] = useState({
        length: "",
        breadth: "",
        thickness: "",
        baseHeight: "", // Added base height
    });
    const [notes, setNotes] = useState("");
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLinkCopied, setIsLinkCopied] = useState(false);
    const [showMagnifier, setShowMagnifier] = useState(false);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [flyingImage, setFlyingImage] = useState<{
        src: string;
        key: number;
    } | null>(null);
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
        // Prevent negative values by returning early if input is invalid
        if (value !== "" && parseFloat(value) < 0) {
            return;
        }
        setDimensions(prev => ({ ...prev, [name]: value }));
    };

    const handleShare = async () => {
        if (!service) return;

        const shareData = {
            title: service.title,
            text: service.description,
            url: window.location.href,
        };
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


    const handleMouseEnter = () => setShowMagnifier(true);
    const handleMouseLeave = () => setShowMagnifier(false);

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white text-xl">
                Service not found.
            </div>
        );
    }

    const otherServices = services.filter((s) => s.id !== service.id);

    const handleAddToCart = () => {
        addToCart();
        if (service) {
            setFlyingImage({ src: service.imageUrl, key: Date.now() });
        }
    };

    const handlePlaceOrder = () => setIsPopupVisible(true);

    const getImageRect = () => {
        const rect = imageContainerRef.current?.getBoundingClientRect();
        return rect
            ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
            : {};
    };

    const getCartRect = () => {
        const rect = cartIconRef.current?.getBoundingClientRect();
        return rect
            ? {
                top: rect.top + rect.height / 2,
                left: rect.left + rect.width / 2,
                width: 0,
                height: 0,
            }
            : {};
    };

    const imageContainerSize = imageContainerRef.current
        ? imageContainerRef.current.offsetWidth
        : 0;

    return (
        <div className="min-h-screen bg-slate-900 text-white pt-0">
            <AnimatePresence>
                {flyingImage && (
                    <motion.div
                        key={flyingImage.key}
                        initial={getImageRect()}
                        animate={getCartRect()}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        onAnimationComplete={() => setFlyingImage(null)}
                        className="fixed z-[100] rounded-lg overflow-hidden shadow-2xl"
                    >
                        <Image
                            src={flyingImage.src}
                            alt="flying item"
                            fill
                            className="object-cover"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="py-12 px-6 md:px-16">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 transition-colors"
                >
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Image & CAD Section */}
                    <div className="flex flex-col items-center gap-8">
                        {/* Image Holder */}
                        <div
                            ref={imageContainerRef}
                            className="relative w-full max-w-[550px] aspect-square rounded-xl overflow-hidden shadow-lg border border-slate-700 cursor-pointer group"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onMouseMove={handleMouseMove}
                            onClick={() => setIsImageViewerOpen(true)}
                        >
                            <Image
                                src={service.imageUrl}
                                alt={service.title}
                                fill
                                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Eye size={48} className="text-white/80" />
                            </div>
                            <AnimatePresence>
                                {showMagnifier && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute rounded-full border-2 border-slate-500 bg-no-repeat pointer-events-none shadow-lg"
                                        style={{
                                            height: `${MAGNIFIER_SIZE}px`,
                                            width: `${MAGNIFIER_SIZE}px`,
                                            top: `${cursorPosition.y - MAGNIFIER_SIZE / 2}px`,
                                            left: `${cursorPosition.x - MAGNIFIER_SIZE / 2}px`,
                                            backgroundImage: `url(${service.imageUrl})`,
                                            backgroundSize: `${imageContainerSize * ZOOM_LEVEL}px ${imageContainerSize * ZOOM_LEVEL
                                                }px`,
                                            backgroundPosition: `-${cursorPosition.x * ZOOM_LEVEL - MAGNIFIER_SIZE / 2
                                                }px -${cursorPosition.y * ZOOM_LEVEL - MAGNIFIER_SIZE / 2
                                                }px`,
                                        }}
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Import CAD Model Section */}
                        <div className="w-full max-w-[550px] bg-slate-800/50 p-6 rounded-lg border border-slate-700 text-center">
                            <h3 className="text-xl font-semibold text-cyan-300 mb-4">Have a CAD Model?</h3>
                            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 hover:border-cyan-500 hover:bg-slate-800 transition-colors">
                                <UploadCloud className="mx-auto h-12 w-12 text-slate-500" />
                                <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer mt-2 block"
                                >
                                    <span className="text-cyan-400 font-semibold">Upload a file</span>
                                    <p className="text-xs text-slate-400 mt-1">or drag and drop</p>
                                    <input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        className="sr-only"
                                        accept=".step, .stp, .stl, .iges, .igs, .sldprt"
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-slate-500 mt-4">Supported formats: STEP, STL, IGES, SLDPRT</p>
                        </div>
                    </div>

                    {/* Details & Customization Section */}
                    <div className="relative">
                        <div className="absolute top-1 right-1 flex items-center gap-1">
                            <button onClick={handleShare} className="p-2 rounded-full text-slate-500 hover:bg-slate-700/50 hover:text-white transition-colors" aria-label="Share Service">
                                <Share2 size={22} />
                            </button>
                            <button onClick={() => setIsFavorited(!isFavorited)} className="p-2 rounded-full hover:bg-slate-700/50 transition-colors" aria-label="Toggle Favorite">
                                <Heart size={22} className={`transition-all ${isFavorited ? 'text-red-500 fill-current' : 'text-slate-500'}`} />
                            </button>
                        </div>
                        {isLinkCopied && (
                            <div className="absolute top-12 right-1 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-md">
                                Link Copied!
                            </div>
                        )}
                        <h1 className="text-4xl font-bold text-cyan-400 mb-4 pr-24">{service.title}</h1>
                        <p className="text-gray-300 mb-6">{service.description}</p>
                        <div className="space-y-3 mb-6 text-gray-300">
                            <div className="flex justify-between border-b border-slate-700 py-2"><span className="flex items-center gap-2"><Clock size={16} /> Cycle Time</span><span className="font-semibold text-white">{service.cycleTime}</span></div>
                            <div className="flex justify-between border-b border-slate-700 py-2"><span className="flex items-center gap-2"><IndianRupee size={16} /> Base Price</span><span className="font-semibold text-white">₹{service.price}</span></div>
                        </div>
                        <div className="space-y-4 mb-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-cyan-300 mb-3">Customize Your Component</h3>
                            <div><label htmlFor="material" className="block text-sm font-medium text-gray-300 mb-1">Material</label><select id="material" value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">{service.availableMaterials.map((mat) => (<option key={mat} value={mat}>{mat}</option>))}</select></div>
                            <div><label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-1">Color</label><select id="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">{service.availableColors.map((col) => (<option key={col} value={col}>{col}</option>))}</select></div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Dimensions (mm)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="number" name="length" min="0" placeholder="Length" value={dimensions.length} onChange={handleDimensionChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center" />
                                    <input type="number" name="breadth" min="0" placeholder="Breadth" value={dimensions.breadth} onChange={handleDimensionChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center" />
                                    <input type="number" name="thickness" min="0" placeholder="Thickness" value={dimensions.thickness} onChange={handleDimensionChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center" />
                                    <input type="number" name="baseHeight" min="0" placeholder="Base Height" value={dimensions.baseHeight} onChange={handleDimensionChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center" />
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 italic mb-6">*Base price shown. Final price depends on the selected material, size, and any additional requirements.</p>
                        <div className="flex items-center gap-2 text-white font-semibold mb-6"><span>Service Rating: 4.6/5</span><Star size={20} className="text-yellow-400" fill="currentColor" /></div>
                        <textarea className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 mb-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Add special notes (e.g., specific tolerances, finish requirements)" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
                        <div className="mt-0 flex flex-col sm:flex-row items-center gap-4">
                            <button onClick={handleAddToCart} className="w-full sm:w-auto flex-1 bg-slate-700 hover:bg-slate-600 transition-colors text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2">
                                <ShoppingCart size={18} /> Add to Cart
                            </button>
                            <button onClick={handlePlaceOrder} className="w-full sm:w-auto flex-1 bg-cyan-500 hover:bg-cyan-400 transition-colors text-slate-900 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2">
                                <Send size={18} /> Place Order
                            </button>
                        </div>
                    </div>
                </div>

                {/* Other Services Section */}
                <section className="mt-24 border-t border-slate-800 pt-12">
                    <h2 className="text-3xl font-bold text-cyan-400 mb-8">Other Services</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {otherServices.map((item) => (
                            <motion.div key={item.id} whileHover={{ y: -8 }} transition={{ duration: 0.3 }} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
                                <Link href={`/services/${item.id}`}><div className="relative w-full h-48 overflow-hidden"><Image src={item.imageUrl} alt={item.title} fill className="object-cover hover:scale-110 transition-transform duration-500" /></div><div className="p-4"><h3 className="text-lg font-bold text-cyan-300 mb-2">{item.title}</h3><p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p><div className="flex justify-between items-center text-sm text-gray-300 mt-4"><span>{item.cycleTime}</span><span className="font-bold text-white">₹{item.price}</span></div></div></Link>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Order Placed Popup */}
            <AnimatePresence>
                {isPopupVisible && (
                    <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPopupVisible(false)}>
                        <motion.div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700 text-center relative w-full max-w-md" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }} exit={{ scale: 0.8, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setIsPopupVisible(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors" aria-label="Close popup"><X size={24} /></button>
                            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-5"><CheckCircle size={40} className="text-green-400" /></div>
                            <h2 className="text-2xl font-bold text-white mb-2">Order Placed Successfully!</h2><p className="text-slate-400 mb-8">Your service request has been submitted. We will notify you with updates.</p>
                            <div className="flex flex-col sm:flex-row gap-4"><button className="w-full flex-1 border-2 border-slate-600 hover:border-slate-500 transition-colors text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2"><Eye size={18} /> View Order</button><button className="w-full flex-1 bg-cyan-500 hover:bg-cyan-400 transition-colors text-slate-900 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2"><CreditCard size={18} /> Pay Now</button></div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Viewer Popup */}
            <AnimatePresence>
                {isImageViewerOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsImageViewerOpen(false)}
                    >
                        <motion.div
                            className="relative w-full h-full max-w-4xl max-h-[80vh]"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={service.imageUrl}
                                alt={service.title}
                                layout="fill"
                                objectFit="contain"
                                className="rounded-lg"
                            />
                        </motion.div>
                        <button
                            onClick={() => setIsImageViewerOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
                            aria-label="Close image viewer"
                        >
                            <X size={32} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}