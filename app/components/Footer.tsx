"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-black text-slate-300 border-t border-white/10"
        >
            {/* TOP GRID */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">

                    {/* PRODUCTS */}
                    <div className="pb-10 md:pb-0 md:pr-10">
                        <h3 className="text-xs tracking-widest text-slate-500 mb-6">
                            PRODUCTS
                        </h3>

                        <ul className="space-y-3 text-sm">
                            <li><Link href="#" className="hover:text-white">Batteries</Link></li>
                            <li><Link href="#" className="hover:text-white">Battery Thermal Runaway Protection</Link></li>
                            <li><Link href="#" className="hover:text-white">Battery Components</Link></li>
                            <li><Link href="#" className="hover:text-white">Lithium-ion Cells</Link></li>
                            <li><Link href="#" className="hover:text-white">Safe Storage Solutions</Link></li>
                            <li><Link href="#" className="hover:text-white">Thermal Solutions</Link></li>
                            <li><Link href="#" className="hover:text-white">Xero Vibe™ Fan</Link></li>
                        </ul>
                    </div>

                    {/* SERVICES */}
                    <div className="py-10 md:py-0 md:px-10">
                        <h3 className="text-xs tracking-widest text-slate-500 mb-6">
                            SERVICES
                        </h3>

                        <ul className="space-y-3 text-sm">
                            <li><Link href="#" className="hover:text-white">Custom Battery Solutions</Link></li>
                            <li><Link href="#" className="hover:text-white">Electrical Testing</Link></li>
                            <li><Link href="#" className="hover:text-white">Abuse Testing & Calorimetry</Link></li>
                            <li><Link href="#" className="hover:text-white">Simulation & Analysis</Link></li>
                            <li><Link href="#" className="hover:text-white">Rotary System Vibration Reduction</Link></li>
                        </ul>
                    </div>

                    {/* COMPANY */}
                    <div className="py-10 md:py-0 md:px-10">
                        <h3 className="text-xs tracking-widest text-slate-500 mb-6">
                            COMPANY
                        </h3>

                        <ul className="space-y-3 text-sm">
                            <li><Link href="#" className="hover:text-white">Leadership</Link></li>
                            <li><Link href="#" className="hover:text-white">Careers</Link></li>
                            <li><Link href="#" className="hover:text-white">News</Link></li>
                            <li><Link href="#" className="hover:text-white">FAQs</Link></li>
                            <li><Link href="#" className="hover:text-white">Terms & Conditions</Link></li>
                            <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
                            <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                        </ul>
                    </div>

                    {/* INVESTORS */}
                    <div className="pt-10 md:pt-0 md:pl-10">
                        <h3 className="text-xs tracking-widest text-slate-500 mb-6">
                            INVESTORS
                        </h3>

                        <ul className="space-y-3 text-sm">
                            <li><Link href="#" className="hover:text-white">Announcements</Link></li>
                            <li><Link href="#" className="hover:text-white">Presentations</Link></li>
                            <li><Link href="#" className="hover:text-white">SEC & Stock Information</Link></li>
                            <li><Link href="#" className="hover:text-white">Governance Documents</Link></li>
                        </ul>
                    </div>
                </div>

                {/* DIVIDER */}
                <div className="border-t border-white/10 mt-16 pt-12 grid grid-cols-1 md:grid-cols-2 gap-10">

                    {/* LOCATION */}
                    <div>
                        <p className="text-xs tracking-widest text-slate-500 mb-4">
                            LOCATION
                        </p>
                        <p className="text-lg text-slate-200">CHENGALPATTU, TN</p>
                    </div>

                    {/* HQ */}
                    <div>
                        <p className="text-xs tracking-widest text-slate-500 mb-4">
                            HEADQUARTERS
                        </p>

                        <p className="text-sm leading-relaxed">
                            Center For Electric Mobility<br />
                            Second Story<br />
                            Chengalpattu, TN<br />
                            Phone: +91 833 385 0202
                        </p>
                    </div>
                </div>

                {/* COPYRIGHT */}
                <div className="text-center text-xs text-slate-500 mt-14">
                    © {year} Zhivam Web. All rights reserved.
                </div>
            </div>
        </motion.footer>
    );
}