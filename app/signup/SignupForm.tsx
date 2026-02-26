"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, LogIn, Eye, EyeOff, AlertTriangle } from "lucide-react";
import Link from "next/link";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

export default function SignupForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [focused, setFocused] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!name || !email || !password || !confirmPassword) {
            setError("All fields are required.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        alert("Sign-up successful!");
    };

    const isFieldError = (field: string) => {
        if (!error) return false;
        if (error === "All fields are required.") return true;
        if (error === "Passwords do not match." && (field === "password" || field === "confirmPassword")) return true;
        if (error.toLowerCase().includes("8 characters") && field === "password") return true;
        return false;
    };

    const inputClass = (field: string, extraPr = false) =>
        `w-full bg-slate-900/50 border rounded-xl py-3 pl-11 ${extraPr ? "pr-11" : "pr-4"} text-sm text-white placeholder-slate-500 focus:outline-none transition-all duration-200 ${isFieldError(field)
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
                                    New Account
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-white">Create account</h1>
                            <p className="text-slate-400 text-sm mt-2">
                                Join us and start your journey.
                            </p>
                        </motion.div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Name */}
                            <motion.div {...fadeUp(0.15)}>
                                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onFocus={() => setFocused("name")}
                                        onBlur={() => setFocused(null)}
                                        className={inputClass("name")}
                                    />
                                </div>
                            </motion.div>

                            {/* Email */}
                            <motion.div {...fadeUp(0.2)}>
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
                            <motion.div {...fadeUp(0.25)}>
                                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 8 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocused("password")}
                                        onBlur={() => setFocused(null)}
                                        className={inputClass("password", true)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Confirm Password */}
                            <motion.div {...fadeUp(0.3)}>
                                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Re-enter password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onFocus={() => setFocused("confirmPassword")}
                                        onBlur={() => setFocused(null)}
                                        className={inputClass("confirmPassword", true)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
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
                                    Create Account
                                </motion.button>
                            </motion.div>
                        </form>

                        {/* Divider */}
                        <motion.div {...fadeUp(0.4)} className="mt-6 pt-6 border-t border-slate-700/50 text-center">
                            <p className="text-sm text-slate-400">
                                Already have an account?{" "}
                                <Link href="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}