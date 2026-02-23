"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, Eye, EyeOff, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(""); // State to hold error messages

    // --- This function handles the login logic ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Prevent the form from reloading the page
        setError(""); // Reset error on new submission

        // **Simple validation logic (replace with your actual auth logic)**
        if (email !== "test@example.com" || password !== "password123") {
            setError("Invalid email or password. Please try again.");
            return; // Stop the function here
        }

        // If login is successful
        alert("Login successful!");
        // Here you would typically redirect the user: router.push('/dashboard')
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    } as const;

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
            },
        },
    } as const;

    const buttonVariants = {
        hover: {
            scale: 1.05,
            textShadow: "0px 0px 8px rgb(34, 211, 238)",
            boxShadow: "0px 0px 8px rgb(34, 211, 238)",
            transition: {
                duration: 0.3,
                repeat: Infinity,
                repeatType: "reverse",
            },
        },
        tap: { scale: 0.95 },
    } as const;

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-slate-900">
            <video
                src="/images/videos/bg video.mp4"
                autoPlay
                loop
                muted
                className="absolute top-0 left-0 min-w-full min-h-full w-auto h-auto object-cover z-0"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-slate-900/70 z-10" />

            <div className="relative min-h-screen w-full flex items-center justify-center md:justify-end z-20 p-4 sm:p-8 md:p-16 lg:p-24">
                <motion.div
                    className="w-full max-w-md p-8 space-y-6 bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants} className="text-center">
                        <h1 className="text-4xl font-bold text-cyan-400 mb-2">Welcome Back</h1>
                        <p className="text-slate-300">Login to access your dashboard.</p>
                    </motion.div>

                    {/* Add the onSubmit handler to the form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div variants={itemVariants} className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                // ✅ Conditional styling for red border
                                className={`w-full bg-slate-700/50 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none transition-all ${error
                                        ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                        : 'border-slate-600 focus:ring-2 focus:ring-cyan-500'
                                    }`}
                            />
                        </motion.div>
                        <motion.div variants={itemVariants} className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                // ✅ Conditional styling for red border
                                className={`w-full bg-slate-700/50 rounded-lg py-3 pl-10 pr-10 text-white placeholder-slate-400 focus:outline-none transition-all ${error
                                        ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                                        : 'border-slate-600 focus:ring-2 focus:ring-cyan-500'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </motion.div>
                        <motion.div variants={itemVariants} className="flex justify-end items-center">
                            <Link href="#" className="text-sm text-cyan-400 hover:underline">
                                Forgot Password?
                            </Link>
                        </motion.div>
                        <motion.button
                            type="submit"
                            className="w-full bg-cyan-500 hover:bg-cyan-400 transition-colors text-slate-900 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
                            // variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <LogIn size={18} />
                            Login
                        </motion.button>
                    </form>

                    {/* ✅ Animated Error Message Display */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg"
                            >
                                <AlertTriangle size={18} />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.p variants={itemVariants} className="text-center text-sm text-slate-400 !mt-8">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="font-semibold text-cyan-400 hover:underline">
                            Sign Up
                        </Link>
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}   