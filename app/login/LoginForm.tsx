"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, Eye, EyeOff, AlertTriangle } from "lucide-react";
import Link from "next/link";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [focused, setFocused] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (email !== "test@example.com" || password !== "password123") {
            setError("Invalid email or password. Please try again.");
            return;
        }
        alert("Login successful!");
    };

    const inputClass = (field: string) =>
        `w-full bg-slate-900/50 border rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-200 ${error
            ? "border-red-500/70"
            : focused === field
                ? "border-cyan-400/70 shadow-[0_0_0_3px_rgba(34,211,238,0.08)]"
                : "border-slate-700 hover:border-slate-500"
        }`;

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#080c14]">

            {/* Background grid texture */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03] z-0"
                style={{
                    backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(to right, #22d3ee 1px, transparent 1px)`,
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Video background */}
            <video
                src="/images/videos/bg video.mp4"
                autoPlay
                loop
                muted
                preload="none"
                playsInline
                className="absolute top-0 left-0 min-w-full min-h-full w-auto h-auto object-cover z-0 opacity-20"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-[#080c14]/60 z-10" />

            {/* Ambient glow */}
            <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full z-10" />

            {/* Content */}
            <div className="relative min-h-screen w-full flex items-center justify-center md:justify-end z-20 p-4 sm:p-8 md:p-16 lg:p-24">
                <div className="w-full max-w-md">

                    {/* Card */}
                    <motion.div
                        {...fadeUp(0)}
                        className="bg-[#0d1520] border border-slate-700/60 rounded-2xl p-8 shadow-2xl"
                    >
                        {/* Header */}
                        <motion.div {...fadeUp(0.1)} className="mb-8">
                            <div className="flex items-center gap-3 mb-5">
                                <span className="h-px w-8 bg-cyan-500" />
                                <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-500">
                                    Secure Access
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-white">Welcome back</h1>
                            <p className="text-slate-400 text-sm mt-2">
                                Sign in to access your dashboard.
                            </p>
                        </motion.div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Email */}
                            <motion.div {...fadeUp(0.2)} className="relative">
                                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="email"
                                        placeholder="you@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocused("email")}
                                        onBlur={() => setFocused(null)}
                                        className={inputClass("email")}
                                    />
                                </div>
                            </motion.div>

                            {/* Password */}
                            <motion.div {...fadeUp(0.25)} className="relative">
                                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocused("password")}
                                        onBlur={() => setFocused(null)}
                                        className={`${inputClass("password")} pr-11`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Forgot password */}
                            <motion.div {...fadeUp(0.3)} className="flex justify-end">
                                <Link href="#" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                                    Forgot password?
                                </Link>
                            </motion.div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl"
                                    >
                                        <AlertTriangle size={14} className="shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit */}
                            <motion.div {...fadeUp(0.35)}>
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors duration-200 mt-2"
                                >
                                    <LogIn size={16} />
                                    Sign In
                                </motion.button>
                            </motion.div>
                        </form>

                        {/* Divider */}
                        <motion.div {...fadeUp(0.4)} className="mt-6 pt-6 border-t border-slate-700/50 text-center">
                            <p className="text-sm text-slate-400">
                                Don&apos;t have an account?{" "}
                                <Link href="/signup" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                                    Sign Up
                                </Link>
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}