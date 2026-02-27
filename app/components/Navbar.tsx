"use client";

import Image from "next/image";
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
    const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null);

    const searchRef = useRef<HTMLInputElement>(null);
    const searchPanelRef = useRef<HTMLDivElement>(null);
    const mobilePanelRef = useRef<HTMLDivElement>(null);
    const navbarRef = useRef<HTMLDivElement>(null);
    const navContainerRef = useRef<HTMLDivElement>(null);
    const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

    const navItems = [
        { name: "Home", href: "/" },
        { name: "Solutions", href: "/servicesoffered" },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "/contact" },
    ];

    const results = services.filter((s) =>
        s.title.toLowerCase().includes(query.toLowerCase())
    );

    /* Update pill position whenever pathname changes */
    useEffect(() => {
        const activeHref = navItems.find(
            (item) =>
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href))
        )?.href;

        if (!activeHref) {
            setPillStyle(null);
            return;
        }

        const activeEl = linkRefs.current[activeHref];
        const container = navContainerRef.current;

        if (activeEl && container) {
            const elRect = activeEl.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            setPillStyle({
                left: elRect.left - containerRect.left,
                width: elRect.width,
            });
        }
    }, [pathname]);

    /* Close on scroll with threshold */
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setShowSearch(false);
                setMobileOpen(false);
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    /* Outside click close */
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
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    /* Keyboard shortcuts */
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
            {/* BLUR OVERLAY */}
            {showSearch && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-[#080c14]/40 backdrop-blur-sm z-30"
                    onClick={() => setShowSearch(false)}
                />
            )}

            {/* NAVBAR */}
            <motion.nav
                ref={navbarRef}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" as const }}
                className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-screen-xl flex items-center justify-between px-6 py-2 bg-[#0d1520]/80 backdrop-blur-xl text-white z-50 border border-slate-700/60 rounded-full shadow-[0_4px_32px_rgba(0,0,0,0.4)]"
            >
                {/* LEFT */}
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                        <Image
                            src="/images/Zhivam logo.png"
                            alt="Zhivam"
                            width={56}
                            height={56}
                            className="object-contain"
                        />
                    </Link>

                    {/* Desktop nav */}
                    <div
                        ref={navContainerRef}
                        className="hidden md:flex relative bg-slate-800/50 border border-slate-700/50 rounded-full px-3 py-2 space-x-1"
                    >
                        {/* Sliding pill */}
                        {pillStyle && (
                            <motion.span
                                className="absolute top-2 bottom-2 rounded-full bg-cyan-500/15 border border-cyan-500/20 pointer-events-none"
                                animate={{
                                    left: pillStyle.left,
                                    width: pillStyle.width,
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                            />
                        )}

                        {navItems.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href !== "/" && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    ref={(el) => { linkRefs.current[item.href] = el; }}
                                    className="relative px-5 py-2 text-sm rounded-full z-10 transition-colors duration-200"
                                >
                                    <span className={isActive ? "text-cyan-400" : "text-slate-400 hover:text-white"}>
                                        {item.name}
                                    </span>
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
                        className="text-slate-400 hover:text-cyan-400 transition-colors"
                        aria-label="Search"
                    >
                        <Search className="w-[18px] h-[18px]" />
                    </button>

                    {/* CART */}
                    <button ref={cartIconRef} className="relative text-slate-400 hover:text-cyan-400 transition-colors" aria-label="Cart">
                        <ShoppingCart className="w-[18px] h-[18px]" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-black">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {/* MOBILE CHEVRON */}
                    <button
                        onClick={() => {
                            setMobileOpen(!mobileOpen);
                            setShowSearch(false);
                        }}
                        className="md:hidden text-slate-400 hover:text-white transition-colors"
                        aria-label="Menu"
                    >
                        <motion.div animate={{ rotate: mobileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="w-5 h-5" />
                        </motion.div>
                    </button>

                    {/* LOGIN */}
                    <Link
                        href="/login"
                        className="hidden md:flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/60 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
                    >
                        Login <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </motion.nav>

            {/* SEARCH PANEL */}
            <motion.div
                ref={searchPanelRef}
                initial={false}
                animate={{
                    height: showSearch ? "auto" : 0,
                    opacity: showSearch ? 1 : 0,
                }}
                transition={{ duration: 0.2, ease: "easeOut" as const }}
                className="fixed top-20 md:top-[76px] left-1/2 -translate-x-1/2 w-[95%] md:w-[60%] lg:w-[46%] max-w-2xl overflow-hidden z-40"
            >
                <div className="bg-[#0d1520] border border-slate-700/60 rounded-2xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] mt-2">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            ref={searchRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search services..."
                            className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 transition-colors"
                        />
                        {query && (
                            <button
                                onClick={() => {
                                    setQuery("");
                                    searchRef.current?.focus();
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {query && results.length > 0 && (
                        <div className="mt-2 border border-slate-700/50 rounded-xl overflow-hidden">
                            {results.slice(0, 5).map((item, i) => (
                                <Link
                                    key={item.id}
                                    href={`/services/${item.id}`}
                                    onClick={() => {
                                        setQuery("");
                                        setShowSearch(false);
                                    }}
                                    className={`flex items-center justify-between px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/40 hover:text-white transition-colors ${i !== 0 ? "border-t border-slate-700/50" : ""
                                        }`}
                                >
                                    <span>{item.title}</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                                </Link>
                            ))}
                        </div>
                    )}

                    {query && results.length === 0 && (
                        <p className="text-xs text-slate-500 text-center py-3">No services found for &ldquo;{query}&rdquo;</p>
                    )}
                </div>
            </motion.div>

            {/* MOBILE MENU */}
            <motion.div
                ref={mobilePanelRef}
                initial={false}
                animate={{
                    height: mobileOpen ? "auto" : 0,
                    opacity: mobileOpen ? 1 : 0,
                }}
                transition={{ duration: 0.2, ease: "easeOut" as const }}
                className="md:hidden fixed top-20 left-1/2 -translate-x-1/2 w-[95%] max-w-screen-xl overflow-hidden bg-[#0d1520] border border-slate-700/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-40 mt-1"
            >
                <div className="flex flex-col divide-y divide-slate-700/50 p-2">
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`px-4 py-3.5 text-sm rounded-xl transition-colors ${isActive
                                        ? "text-cyan-400 bg-cyan-500/10"
                                        : "text-slate-300 hover:bg-slate-700/40 hover:text-white"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                    <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3.5 text-sm text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-colors flex items-center gap-2"
                    >
                        Login <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </motion.div>
        </>
    );
}