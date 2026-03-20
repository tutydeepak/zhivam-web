"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    ArrowRight,
    ChevronDown,
    X,
    FileText,
    Wrench,
} from "lucide-react";
import { useCart } from "@/app/contexts/CartContext";
import { useState, useRef, useEffect } from "react";
import { services } from "@/app/components/ServicesSection";
import { rdServices } from "@/lib/servicesData";
import { usePathname } from "next/navigation";
import { client } from "@/lib/sanity";

type BlogResult = {
    title: string;
    slug: string;
    category: string;
}

type SearchResult = {
    id: string | number;
    title: string;
    href: string;
    type: "blog" | "service";
    category?: string;
}

export default function Navbar() {
    const { cartCount, cartIconRef } = useCart();
    const pathname = usePathname();
    if (pathname.startsWith('/studio')) return null;

    const [showSearch, setShowSearch] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null);
    const [blogPosts, setBlogPosts] = useState<BlogResult[]>([]);

    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(null);

    const searchRef = useRef<HTMLInputElement>(null);
    const searchPanelRef = useRef<HTMLDivElement>(null);
    const mobilePanelRef = useRef<HTMLDivElement>(null);
    const navbarRef = useRef<HTMLDivElement>(null);
    const navContainerRef = useRef<HTMLDivElement>(null);
    const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

    const navItems = [
        { name: "Home", href: "/" },
        { name: "Solutions", href: "/servicesoffered" },
        {
            name: "Analyzer",
            href: "/zheat",
            dropdown: [
                { name: "Heatsink", href: "/zheat" },
                { name: "Coldplate", href: "/coming-soon" }
            ]
        },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "/contact" },
    ];

    // Fetch blog posts from Sanity on mount
    useEffect(() => {
        client.fetch(`
            *[_type == "post"] | order(publishedAt desc) {
                title,
                "slug": slug.current,
                "category": categories[0]->title
            }
        `).then((posts: BlogResult[]) => {
            setBlogPosts(posts)
        })
    }, [])

    // Combine blog + service results
    const allResults: SearchResult[] = [
        ...blogPosts.map((post) => ({
            id: post.slug,
            title: post.title,
            href: `/blog/${post.slug}`,
            type: "blog" as const,
            category: post.category,
        })),
        ...rdServices.map((s) => ({
            id: s.id,
            title: s.title,
            href: `/servicesoffered/${s.id}`,
            type: "service" as const,
            category: s.subtitle || "R&D & Engineering",
        })),
    ]

    const results = query
        ? allResults.filter((r) =>
            r.title.toLowerCase().includes(query.toLowerCase())
        )
        : []

    /* Update pill position */
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

    /* Close on scroll */
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setShowSearch(false);
                setMobileOpen(false);
                setDropdownOpen(null);
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
                setDropdownOpen(null);
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [showSearch]);

    let dropdownTimeout: NodeJS.Timeout;

    const handleMouseEnter = (name: string) => {
        clearTimeout(dropdownTimeout);
        setDropdownOpen(name);
    };

    const handleMouseLeave = () => {
        dropdownTimeout = setTimeout(() => {
            setDropdownOpen(null);
        }, 150);
    };

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
                // FIX: reduced px on mobile (px-3 → px-6 on md+), tighter py on mobile
                className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-screen-xl flex items-center justify-between px-3 md:px-6 py-1.5 md:py-2 bg-[#0d1520]/80 backdrop-blur-xl text-white z-50 border border-slate-700/60 rounded-full shadow-[0_4px_32px_rgba(0,0,0,0.4)]"
            >
                {/* LEFT */}
                <div className="flex items-center gap-2 md:gap-4">
                    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                        <Image
                            src="/images/favicon (1).png"
                            alt="Zhivam"
                            // FIX: smaller logo on mobile (40px → 56px on md+)
                            width={56}
                            height={56}
                            className="object-contain w-9 h-9 md:w-14 md:h-14"
                        />
                    </Link>

                    <div
                        ref={navContainerRef}
                        className="hidden md:flex relative bg-slate-800/50 border border-slate-700/50 rounded-full px-3 py-2 space-x-1"
                    >
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
                                <div
                                    key={item.name}
                                    className="relative group"
                                    onMouseEnter={() => item.dropdown && handleMouseEnter(item.name)}
                                    onMouseLeave={() => item.dropdown && handleMouseLeave()}
                                >
                                    <Link
                                        href={item.dropdown ? "#" : item.href}
                                        ref={(el) => { linkRefs.current[item.href] = el; }}
                                        className="relative px-5 py-2 text-sm rounded-full z-10 transition-colors duration-200 flex items-center justify-center"
                                    >
                                        <span className={isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-white transition-colors"}>
                                            {item.name}
                                        </span>
                                        {item.dropdown && (
                                            <ChevronDown
                                                className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-all duration-200 ${dropdownOpen === item.name
                                                    ? "rotate-180 text-cyan-400 opacity-100"
                                                    : "opacity-0 group-hover:opacity-100 text-slate-400"
                                                    }`}
                                            />
                                        )}
                                    </Link>

                                    <AnimatePresence>
                                        {item.dropdown && dropdownOpen === item.name && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                                transition={{ duration: 0.15, ease: "easeOut" }}
                                                className="absolute top-full left-1/2 -translate-x-1/2 pt-6 z-50"
                                            >
                                                <div className="w-48 bg-[#0d1520] border border-slate-700/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden py-2">
                                                    {item.dropdown.map((subItem) => (
                                                        <Link
                                                            key={subItem.name}
                                                            href={subItem.href}
                                                            onClick={() => setDropdownOpen(null)}
                                                            className="block px-5 py-2.5 text-sm text-slate-400 hover:bg-slate-800/60 hover:text-cyan-400 transition-colors"
                                                        >
                                                            {subItem.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT */}
                {/* FIX: tighter gap on mobile */}
                <div className="flex items-center gap-2 md:gap-3">
                    <button
                        onClick={() => {
                            setShowSearch(!showSearch);
                            setMobileOpen(false);
                            setTimeout(() => searchRef.current?.focus(), 200);
                        }}
                        // FIX: larger tap target on mobile with p-1
                        className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                        aria-label="Search"
                    >
                        <Search className="w-[18px] h-[18px]" />
                    </button>

                    <button
                        onClick={() => {
                            setMobileOpen(!mobileOpen);
                            setShowSearch(false);
                        }}
                        // FIX: larger tap target on mobile
                        className="md:hidden p-1 text-slate-400 hover:text-white transition-colors"
                        aria-label="Menu"
                    >
                        <motion.div animate={{ rotate: mobileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="w-5 h-5" />
                        </motion.div>
                    </button>

                    <Link
                        href="/login"
                        className="hidden md:flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/60 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 pointer-events-none opacity-50"
                    >
                        Login <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </motion.nav>

            {/* SEARCH PANEL */}
            {/* FIX: full-width on mobile with proper top offset matching smaller navbar height */}
            <motion.div
                ref={searchPanelRef}
                initial={false}
                animate={{
                    height: showSearch ? "auto" : 0,
                    opacity: showSearch ? 1 : 0,
                }}
                transition={{ duration: 0.2, ease: "easeOut" as const }}
                className="fixed top-[72px] md:top-[88px] left-1/2 -translate-x-1/2 w-[95%] md:w-[60%] lg:w-[46%] max-w-2xl overflow-hidden z-40"
            >
                <div className="bg-[#0d1520] border border-slate-700/60 rounded-2xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] mt-2">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            ref={searchRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search blogs, services..."
                            // FIX: text-base prevents iOS auto-zoom on focus (font-size >= 16px)
                            className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl pl-10 pr-10 py-2.5 text-base md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 transition-colors"
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

                    {/* Results */}
                    {query && results.length > 0 && (
                        <div className="mt-2 border border-slate-700/50 rounded-xl overflow-hidden">
                            {results.slice(0, 6).map((item, i) => (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={() => {
                                        setQuery("");
                                        setShowSearch(false);
                                    }}
                                    // FIX: taller tap targets on mobile (py-3 instead of py-2.5)
                                    className={`flex items-center justify-between px-4 py-3 md:py-2.5 text-sm text-slate-300 hover:bg-slate-700/40 hover:text-white transition-colors ${i !== 0 ? "border-t border-slate-700/50" : ""}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.type === "blog" ? (
                                            <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                        ) : (
                                            <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                        )}
                                        <div>
                                            <p className="text-sm text-white">{item.title}</p>
                                            <p className="text-xs text-slate-500">
                                                {item.type === "blog"
                                                    ? `Blog · ${item.category ?? ""}`
                                                    : `Service · ${item.category ?? "R&D & Engineering"}`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                </Link>
                            ))}
                        </div>
                    )}

                    {query && results.length === 0 && (
                        <p className="text-xs text-slate-500 text-center py-3">
                            No results found for &ldquo;{query}&rdquo;
                        </p>
                    )}
                </div>
            </motion.div>

            {/* MOBILE MENU */}
            {/* FIX: top offset adjusted to match smaller mobile navbar height */}
            <motion.div
                ref={mobilePanelRef}
                initial={false}
                animate={{
                    height: mobileOpen ? "auto" : 0,
                    opacity: mobileOpen ? 1 : 0,
                }}
                transition={{ duration: 0.2, ease: "easeOut" as const }}
                className="md:hidden fixed top-[72px] left-1/2 -translate-x-1/2 w-[95%] max-w-screen-xl overflow-hidden bg-[#0d1520] border border-slate-700/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-40 mt-1"
            >
                <div className="flex flex-col divide-y divide-slate-700/50 p-2">
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href ||
                            (item.href !== "/" && pathname.startsWith(item.href));

                        return (
                            <div key={item.name} className="flex flex-col">
                                {item.dropdown ? (
                                    <>
                                        <button
                                            onClick={() => setMobileDropdownOpen(mobileDropdownOpen === item.name ? null : item.name)}
                                            // FIX: min-h-[48px] ensures accessible tap target size
                                            className={`flex items-center justify-between px-4 py-3.5 min-h-[48px] text-sm rounded-xl transition-colors ${isActive
                                                ? "text-cyan-400 bg-cyan-500/10"
                                                : "text-slate-300 hover:bg-slate-700/40 hover:text-white"
                                                }`}
                                        >
                                            <span>{item.name}</span>
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileDropdownOpen === item.name ? "rotate-180" : ""}`} />
                                        </button>

                                        <AnimatePresence>
                                            {mobileDropdownOpen === item.name && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="flex flex-col ml-4 mt-1 space-y-1 overflow-hidden border-l border-slate-700/50 pl-2 mb-2"
                                                >
                                                    {item.dropdown.map((subItem) => (
                                                        <Link
                                                            key={subItem.name}
                                                            href={subItem.href}
                                                            onClick={() => setMobileOpen(false)}
                                                            // FIX: min-h-[44px] for sub-items too
                                                            className="flex items-center px-4 py-2.5 min-h-[44px] text-sm text-slate-400 hover:text-cyan-400 rounded-lg transition-colors"
                                                        >
                                                            {subItem.name}
                                                        </Link>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <Link
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        // FIX: min-h-[48px] for accessible tap targets
                                        className={`flex items-center px-4 py-3.5 min-h-[48px] text-sm rounded-xl transition-colors ${isActive
                                            ? "text-cyan-400 bg-cyan-500/10"
                                            : "text-slate-300 hover:bg-slate-700/40 hover:text-white"
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                    <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center px-4 py-3.5 min-h-[48px] text-sm text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-colors gap-2"
                    >
                        Login <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </motion.div>
        </>
    );
}