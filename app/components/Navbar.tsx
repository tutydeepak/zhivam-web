"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    Search,
    ArrowRight,
    ShoppingCart,
    ChevronDown,
    X,
} from "lucide-react";
import { useCart } from "@/app/contexts/CartContext";
import { useState, useRef, useEffect } from "react";
import { services } from "@/app/components/ServicesSection";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const { cartCount, cartIconRef } = useCart();
    const pathname = usePathname();

    const [showSearch, setShowSearch] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [query, setQuery] = useState("");

    const searchRef = useRef<HTMLInputElement>(null);
    const searchPanelRef = useRef<HTMLDivElement>(null);
    const mobilePanelRef = useRef<HTMLDivElement>(null);
    const navbarRef = useRef<HTMLDivElement>(null);

    const results = services.filter((s) =>
        s.title.toLowerCase().includes(query.toLowerCase())
    );

    const navItems = [
        { name: "Home", href: "/" },
        { name: "Services", href: "/servicesoffered" },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "/contact" },
    ];

    /* ⭐ Close on scroll */
    useEffect(() => {
        const handleScroll = () => {
            setShowSearch(false);
            setMobileOpen(false);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    /* ⭐ Outside click close */
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            if (
                mobilePanelRef.current &&
                !mobilePanelRef.current.contains(target) &&
                navbarRef.current &&
                !navbarRef.current.contains(target)
            ) {
                setMobileOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () =>
            document.removeEventListener("click", handleClickOutside);
    }, []);

    /* ⭐ Keyboard shortcuts */
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "/" && !showSearch) {
                e.preventDefault();
                setShowSearch(true);
                setTimeout(() => searchRef.current?.focus(), 150);
            }

            if (e.key === "Escape") {
                setShowSearch(false);
                setMobileOpen(false);
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [showSearch]);

    return (
        <>
            {/* ⭐ BLUR OVERLAY */}
            {showSearch && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
                    onClick={() => setShowSearch(false)}
                />
            )}

            {/* ⭐ NAVBAR */}
            <motion.nav ref={navbarRef}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-screen-xl flex items-center justify-between px-6 py-2 backdrop-blur-xl text-white z-50 border border-white/10 rounded-full shadow-lg"
            >
                {/* LEFT */}
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-cyan-400">Z</h1>

                    {/* Desktop nav */}
                    <div className="hidden md:flex bg-white/5 border border-white/10 rounded-full px-3 py-2 space-x-1">
                        {navItems.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href !== "/" &&
                                    pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-5 py-2 text-sm rounded-full ${isActive
                                        ? "bg-cyan-500/20 text-cyan-400"
                                        : "hover:text-cyan-400"
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-3">
                    {/* SEARCH */}
                    <button
                        onClick={() => {
                            setShowSearch(!showSearch);
                            setMobileOpen(false);
                            setTimeout(() => searchRef.current?.focus(), 200);
                        }}
                        className="hover:text-cyan-400"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* CART */}
                    <button
                        ref={cartIconRef}
                        className="relative hover:text-cyan-400"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-white">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {/* MOBILE ARROW */}
                    <button
                        onClick={() => {
                            setMobileOpen(!mobileOpen);
                            setShowSearch(false);
                        }}
                        className="md:hidden"
                    >
                        <motion.div
                            animate={{ rotate: mobileOpen ? 180 : 0 }}
                        >
                            <ChevronDown />
                        </motion.div>
                    </button>

                    {/* LOGIN */}
                    <Link
                        href="/login"
                        className="hidden md:flex items-center gap-2 border border-cyan-400 text-cyan-400 rounded-full px-4 py-2 hover:bg-cyan-400/10 text-sm"
                    >
                        Login <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </motion.nav>

            {/* ⭐ SEARCH PANEL */}
            <motion.div
                ref={searchPanelRef}
                initial={false}
                animate={{
                    height: showSearch ? "auto" : 0,
                    opacity: showSearch ? 1 : 0,
                }}
                className="fixed top-20 md:top-[110px] left-1/2 -translate-x-1/2 w-[95%] md:w-[70%] lg:w-[55%] max-w-screen-xl overflow-hidden z-40"
            >
                <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl p-3">
                    <div className="relative">
                        <input
                            ref={searchRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search services..."
                            className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:border-cyan-400"
                        />

                        {query && (
                            <button
                                onClick={() => {
                                    setQuery("");
                                    searchRef.current?.focus();
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-cyan-400"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {query && results.length > 0 && (
                        <div className="mt-2 bg-slate-900 border border-white/10 rounded-lg overflow-hidden">
                            {results.slice(0, 5).map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/services/${item.id}`}
                                    onClick={() => {
                                        setQuery("");
                                        setShowSearch(false);
                                    }}
                                    className="block px-3 py-2 text-sm hover:bg-white/10"
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ⭐ MOBILE MENU */}
            <motion.div
                ref={mobilePanelRef}
                initial={false}
                animate={{
                    height: mobileOpen ? "auto" : 0,
                    opacity: mobileOpen ? 1 : 0,
                }}
                className="md:hidden fixed top-20 left-1/2 -translate-x-1/2 w-[95%] max-w-screen-xl overflow-hidden backdrop-blur-xl border border-white/10 rounded-2xl bg-black/40 z-40"
            >
                <div className="flex flex-col divide-y divide-white/10">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="px-6 py-4 hover:bg-white/5"
                        >
                            {item.name}
                        </Link>
                    ))}

                    <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="px-6 py-4 text-cyan-400"
                    >
                        Login
                    </Link>
                </div>
            </motion.div>
        </>
    );
}