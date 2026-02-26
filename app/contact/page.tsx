"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

const SocialLinks = () => {
    const socials = [
        {
            name: "Twitter / X",
            href: "https://twitter.com",
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
        },
        {
            name: "Instagram",
            href: "https://instagram.com",
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
            ),
        },
        {
            name: "LinkedIn",
            href: "https://linkedin.com",
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="flex gap-4 mt-8">
            {socials.map((s, i) => (
                <motion.a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    {...fadeUp(0.5 + i * 0.1)}
                    whileHover={{ scale: 1.12, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-11 h-11 rounded-full border border-slate-600 text-slate-400 hover:border-cyan-400 hover:text-cyan-400 transition-colors duration-200"
                >
                    {s.icon}
                </motion.a>
            ))}
        </div>
    );
};

export default function ContactPage() {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [emailError, setEmailError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [message, setMessage] = useState("");
    const [focused, setFocused] = useState<string | null>(null);

    const validateEmail = (value: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailError(!regex.test(value) ? "Enter a valid email" : "");
    };

    const validatePhone = (value: string) => {
        const regex = /^\+?\d{10,12}$/;
        setPhoneError(!regex.test(value) ? "Only + and 10–12 digits allowed" : "");
    };

    const countWords = (text: string) =>
        text.trim() ? text.trim().split(/\s+/).length : 0;

    const handleMessageChange = (value: string) => {
        if (countWords(value) <= 1000) setMessage(value);
    };

    const inputBase =
        "w-full bg-slate-900/50 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-200";

    const inputClass = (field: string, hasError?: boolean) =>
        `${inputBase} ${hasError
            ? "border-red-500/70 focus:border-red-400"
            : focused === field
                ? "border-cyan-400/70 shadow-[0_0_0_3px_rgba(34,211,238,0.08)]"
                : "border-slate-700 hover:border-slate-500"
        }`;

    const stagger = {
        animate: { transition: { staggerChildren: 0.08 } },
    };

    return (
        <main className="min-h-screen bg-[#080c14] text-white flex items-start justify-center px-6 pt-28 pb-20 overflow-hidden">

            {/* Background glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />
            </div>

            <div className="relative w-full max-w-5xl flex flex-col lg:flex-row gap-16 items-start">

                {/* ── LEFT ── */}
                <div className="flex-1 lg:sticky lg:top-28">

                    <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 text-xs font-medium text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-3 py-1 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        Available for projects
                    </motion.div>

                    <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-6xl font-bold tracking-tight leading-none">
                        Let&apos;s <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                            work together
                        </span>
                    </motion.h1>

                    <motion.p {...fadeUp(0.2)} className="text-slate-400 mt-5 text-base leading-relaxed max-w-xs">
                        Have a project or question? Drop us a message and we&apos;ll get back to you within 24 hours.
                    </motion.p>

                    <SocialLinks />

                    <motion.div {...fadeUp(0.8)} className="mt-10 pt-10 border-t border-slate-800 space-y-3">
                        {[
                            { label: "Email", value: "hello@zhivam.com" },
                            { label: "Based in", value: "India" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-3 text-sm">
                                <span className="text-slate-500 w-16">{item.label}</span>
                                <span className="text-slate-300">{item.value}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* ── FORM ── */}
                <motion.form
                    variants={stagger}
                    initial="initial"
                    animate="animate"
                    className="flex-1 w-full space-y-5"
                >
                    {/* Name */}
                    <motion.div variants={fadeUp(0)}>
                        <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                            Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Your full name"
                            onFocus={() => setFocused("name")}
                            onBlur={() => setFocused(null)}
                            className={inputClass("name")}
                        />
                    </motion.div>

                    {/* Email + Phone */}
                    <motion.div variants={fadeUp(0)} className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                                Email <span className="text-red-400">*</span>
                            </label>
                            <input
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }}
                                onBlur={(e) => { validateEmail(e.target.value); setFocused(null); }}
                                onFocus={() => setFocused("email")}
                                required
                                type="email"
                                placeholder="you@email.com"
                                className={inputClass("email", !!emailError)}
                            />
                            {emailError && <p className="text-red-400 text-xs mt-1.5">{emailError}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                                Phone <span className="text-red-400">*</span>
                            </label>
                            <input
                                value={phone}
                                onChange={(e) => { setPhone(e.target.value); validatePhone(e.target.value); }}
                                onBlur={(e) => { validatePhone(e.target.value); setFocused(null); }}
                                onFocus={() => setFocused("phone")}
                                required
                                type="tel"
                                placeholder="+919876543210"
                                className={inputClass("phone", !!phoneError)}
                            />
                            {phoneError && <p className="text-red-400 text-xs mt-1.5">{phoneError}</p>}
                        </div>
                    </motion.div>

                    {/* Company */}
                    <motion.div variants={fadeUp(0)}>
                        <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                            Company
                        </label>
                        <input
                            type="text"
                            placeholder="Your company (optional)"
                            onFocus={() => setFocused("company")}
                            onBlur={() => setFocused(null)}
                            className={inputClass("company")}
                        />
                    </motion.div>

                    {/* Location */}
                    <motion.div variants={fadeUp(0)}>
                        <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                            Location <span className="text-red-400">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="City, Country"
                            onFocus={() => setFocused("location")}
                            onBlur={() => setFocused(null)}
                            className={inputClass("location")}
                        />
                    </motion.div>

                    {/* Message */}
                    <motion.div variants={fadeUp(0)}>
                        <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                            Message <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            required
                            rows={6}
                            value={message}
                            onChange={(e) => handleMessageChange(e.target.value)}
                            onFocus={() => setFocused("message")}
                            onBlur={() => setFocused(null)}
                            placeholder="Tell us about your project..."
                            className={`${inputClass("message")} resize-none`}
                        />
                        <div className="flex justify-end mt-1.5">
                            <span className={`text-xs tabular-nums ${countWords(message) > 900 ? "text-amber-400" : "text-slate-500"}`}>
                                {countWords(message)} / 1000 words
                            </span>
                        </div>
                    </motion.div>

                    {/* Submit */}
                    <motion.div variants={fadeUp(0)}>
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full relative overflow-hidden bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3.5 rounded-xl transition-colors duration-200 text-sm tracking-wide"
                        >
                            Send Message →
                        </motion.button>
                    </motion.div>
                </motion.form>
            </div>
        </main>
    );
}