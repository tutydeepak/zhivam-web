"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    User,
    Shield,
    Bell,
    LogOut,
    Trash2,
    Save,
} from "lucide-react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "security", label: "Security", icon: Shield },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "danger", label: "Danger Zone", icon: Trash2 },
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-white px-6 py-28">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">

                {/* Sidebar */}
                <div className="md:w-1/4 bg-slate-800/50 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === tab.id
                                    ? "bg-cyan-500/20 text-cyan-400"
                                    : "hover:bg-white/5"
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 bg-slate-800/50 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                    {activeTab === "profile" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h2 className="text-2xl font-semibold mb-6">Profile Settings</h2>

                            <div className="space-y-5">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />

                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />

                                <button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-5 py-3 rounded-lg font-semibold transition">
                                    <Save size={16} />
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "security" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h2 className="text-2xl font-semibold mb-6">Security</h2>

                            <div className="space-y-5">
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                                <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-5 py-3 rounded-lg font-semibold transition">
                                    Update Password
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "notifications" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h2 className="text-2xl font-semibold mb-6">Notifications</h2>

                            <div className="space-y-4">
                                <label className="flex items-center justify-between bg-slate-700 p-4 rounded-lg">
                                    Email Updates
                                    <input type="checkbox" className="accent-cyan-500" />
                                </label>

                                <label className="flex items-center justify-between bg-slate-700 p-4 rounded-lg">
                                    Order Alerts
                                    <input type="checkbox" className="accent-cyan-500" />
                                </label>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "danger" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h2 className="text-2xl font-semibold text-red-400 mb-6">
                                Danger Zone
                            </h2>

                            <div className="space-y-4">
                                <button className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 px-5 py-3 rounded-lg font-semibold transition">
                                    <LogOut size={16} />
                                    Logout
                                </button>

                                <button className="w-full flex items-center justify-center gap-2 bg-red-800 hover:bg-red-700 px-5 py-3 rounded-lg font-semibold transition">
                                    <Trash2 size={16} />
                                    Delete Account
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}