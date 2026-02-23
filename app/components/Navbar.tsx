"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, ArrowRight, ShoppingCart, MapPin } from "lucide-react";
import { useCart } from "@/app/contexts/CartContext";
import { useState, useRef, useEffect } from "react";
import { services } from "@/app/components/ServicesSection";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const { cartCount, cartIconRef } = useCart();
    const pathname = usePathname();

    const userName = "Alex";
    const userLocation = "Chennai";

    const [showSearch, setShowSearch] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");

    // ⭐ Hydration-safe mount guard
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const results = services.filter((s) =>
        s.title.toLowerCase().includes(query.toLowerCase())
    );

    const navItems = [
        { name: "Home", href: "/" },
        { name: "Services", href: "/servicesoffered" },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <motion.nav
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-screen-xl flex items-center justify-between px-6 py-2 backdrop-blur-xl text-white z-50 border border-white/10 rounded-full shadow-lg"
        >
            {/* LEFT */}
            <div className="flex items-center gap-6">
                <h1 className="text-2xl font-bold text-cyan-400 drop-shadow-md">
                    Z
                </h1>

                {/* ⭐ Animated nav */}
                <div className="hidden md:flex relative bg-white/5 border border-white/10 rounded-full px-3 py-2 items-center space-x-1">
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/" &&
                                pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative px-5 py-2 text-sm font-medium"
                            >
                                {/* ⭐ sliding pill */}
                                {isActive && (
                                    <motion.span
                                        layoutId="nav-pill"
                                        transition={{
                                            type: "spring",
                                            stiffness: 350,
                                            damping: 30,
                                        }}
                                        className="absolute inset-0 bg-cyan-500/20 rounded-full pointer-events-none"
                                    />
                                )}

                                <span
                                    className={`relative z-10 transition-colors ${isActive
                                            ? "text-cyan-400"
                                            : "hover:text-cyan-400"
                                        }`}
                                >
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">
                {/* Location */}
                <div className="hidden lg:flex items-center gap-2 text-sm cursor-pointer hover:text-cyan-400 transition-colors">
                    <MapPin size={18} />
                    <span>{userLocation}</span>
                </div>

                <span className="hidden lg:block text-sm">Hello, {userName}</span>

                <div className="hidden lg:block w-px h-6 bg-white/20"></div>

                {/* ⭐ SEARCH */}
                <div className="relative flex items-center">
                    <button
                        onClick={() => {
                            setShowSearch(!showSearch);
                            setTimeout(() => searchRef.current?.focus(), 200);
                        }}
                        className="hover:text-cyan-400 transition-colors mr-2"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* ⭐ Masked animation */}
                    {mounted && (
                        <div className="overflow-hidden">
                            <motion.div
                                initial={false}
                                animate={{
                                    width: showSearch ? 220 : 0,
                                    opacity: showSearch ? 1 : 0,
                                }}
                                transition={{
                                    duration: 0.35,
                                    ease: "easeInOut",
                                }}
                                className="flex"
                            >
                                <input
                                    ref={searchRef}
                                    value={query}
                                    onChange={(e) =>
                                        setQuery(e.target.value)
                                    }
                                    placeholder="Search services..."
                                    className="w-[220px] bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-cyan-400"
                                />

                                {/* Dropdown */}
                                {query && results.length > 0 && (
                                    <div className="absolute top-10 left-0 w-[220px] bg-slate-900 border border-white/10 rounded-lg shadow-xl overflow-hidden">
                                        {results.slice(0, 5).map((item) => (
                                            <Link
                                                key={item.id}
                                                href={`/services/${item.id}`}
                                                onClick={() => {
                                                    setQuery("");
                                                    setShowSearch(false);
                                                }}
                                                className="block px-3 py-2 text-sm hover:bg-white/10 transition"
                                            >
                                                {item.title}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* CART */}
                <button
                    ref={cartIconRef}
                    className="relative hover:text-cyan-400 transition-colors"
                >
                    <ShoppingCart className="w-6 h-6" />
                    {cartCount > 0 && (
                        <motion.span
                            key={cartCount}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                            }}
                            className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-white"
                        >
                            {cartCount}
                        </motion.span>
                    )}
                </button>

                {/* LOGIN */}
                <Link
                    href="/login"
                    className="flex items-center gap-2 border border-cyan-400 text-cyan-400 rounded-full px-4 py-2 hover:bg-cyan-400/10 transition-all duration-300 text-sm"
                >
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </motion.nav>
    );
}