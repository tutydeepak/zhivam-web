"use client";
import { useState } from "react";

export default function ContactPage() {

    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const [emailError, setEmailError] = useState("");
    const [phoneError, setPhoneError] = useState("");

    // Email validation
    const validateEmail = (value: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(value)) {
            setEmailError("Enter a valid email");
        } else {
            setEmailError("");
        }
    };

    // Phone validation
    const validatePhone = (value: string) => {
        const regex = /^\+?\d{10,12}$/;
        if (!regex.test(value)) {
            setPhoneError("Only + and 10–12 digits allowed");
        } else {
            setPhoneError("");
        }
    };

    const [message, setMessage] = useState("");

    const countWords = (text: string) => {
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    };

    const handleMessageChange = (value: string) => {
        const words = countWords(value);
        if (words <= 1000) {
            setMessage(value);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white flex items-start justify-center px-6 pt-24">

            <div className="w-full max-w-6xl flex flex-col md:flex-row gap-12 items-start">

                {/* LEFT SECTION — vertically centered */}
                <div className="flex-1 flex flex-col justify-center md:min-h-[600px]">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-bold">Contact Us</h1>
                        <p className="text-slate-400 mt-3">
                            Have a project or question? We'd love to hear from you.
                        </p>
                    </div>
                </div>

                {/* FORM */}
                <form className="bg-slate-800/40 backdrop-blur-md border border-slate-700 rounded-xl p-8 space-y-6 flex-1 w-full">

                    {/* Name */}
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">
                            Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Your name"
                            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400"
                        />
                    </div>

                    {/* Email + Phone */}
                    <div className="grid md:grid-cols-2 gap-4">

                        {/* Email */}
                        <div>
                            <label className="block text-sm text-slate-300 mb-2">
                                Email <span className="text-red-400">*</span>
                            </label>
                            <input
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    validateEmail(e.target.value);
                                }}
                                onBlur={(e) => validateEmail(e.target.value)}
                                required
                                type="email"
                                placeholder="you@email.com"
                                className={`w-full bg-slate-900/60 border rounded-lg px-4 py-3 focus:outline-none transition ${emailError
                                        ? "border-red-500"
                                        : "border-slate-700 focus:border-cyan-400"
                                    }`}
                            />
                            {emailError && (
                                <p className="text-red-400 text-xs mt-1">{emailError}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm text-slate-300 mb-2">
                                Phone <span className="text-red-400">*</span>
                            </label>
                            <input
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value);
                                    validatePhone(e.target.value);
                                }}
                                onBlur={(e) => validatePhone(e.target.value)}
                                required
                                type="tel"
                                placeholder="+919876543210"
                                className={`w-full bg-slate-900/60 border rounded-lg px-4 py-3 focus:outline-none transition ${phoneError
                                        ? "border-red-500"
                                        : "border-slate-700 focus:border-cyan-400"
                                    }`}
                            />
                            {phoneError && (
                                <p className="text-red-400 text-xs mt-1">{phoneError}</p>
                            )}
                        </div>

                    </div>

                    {/* Company */}
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">
                            Company Name
                        </label>
                        <input
                            type="text"
                            placeholder="Your company"
                            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">
                            Location <span className="text-red-400">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="City, Country"
                            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400"
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">
                            Message <span className="text-red-400">*</span>
                        </label>

                        <textarea
                            required
                            rows={5}
                            value={message}
                            onChange={(e) => handleMessageChange(e.target.value)}
                            placeholder="Tell us about your project..."
                            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 resize-none"
                        />

                        <div className="flex justify-between mt-1 text-xs">
                            <span className="text-slate-400">
                                {countWords(message)} / 1000 words
                            </span>
                        </div>
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-lg transition"
                    >
                        Send Message
                    </button>

                </form>
            </div>
        </main>
    );
}