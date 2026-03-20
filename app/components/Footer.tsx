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
            {/* FIX: reduced px on mobile (px-5 instead of px-6) */}
            <div className="max-w-7xl mx-auto px-5 md:px-12 lg:px-20 py-12 md:py-16">

                {/*
                  FIX: On mobile use a 2-col grid instead of stacking all 4 cols vertically.
                  This keeps the footer compact and scannable on phones.
                  divide-y only applies on mobile 1-col fallback; on sm+ we use gap instead.
                */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-0 md:divide-x divide-white/10">

                    {/* PRODUCTS */}
                    {/* FIX: pb only on mobile stacked layout, pr on md+ */}
                    <div className="md:pr-10">
                        <h3 className="text-xs tracking-widest text-slate-500 mb-5 md:mb-6">
                            PRODUCTS
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">Batteries</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Battery Thermal Runaway Protection</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Battery Components</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Lithium-ion Cells</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Safe Storage Solutions</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Thermal Solutions</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Xero Vibe™ Fan</Link></li>
                        </ul>
                    </div>

                    {/* SERVICES */}
                    <div className="md:px-10">
                        <h3 className="text-xs tracking-widest text-slate-500 mb-5 md:mb-6">
                            SERVICES
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">Custom Battery Solutions</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Electrical Testing</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Abuse Testing & Calorimetry</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Simulation & Analysis</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Rotary System Vibration Reduction</Link></li>
                        </ul>
                    </div>

                    {/* COMPANY */}
                    <div className="md:px-10">
                        <h3 className="text-xs tracking-widest text-slate-500 mb-5 md:mb-6">
                            COMPANY
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">Leadership</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">News</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">FAQs</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* INVESTORS */}
                    <div className="md:pl-10">
                        <h3 className="text-xs tracking-widest text-slate-500 mb-5 md:mb-6">
                            INVESTORS
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">Announcements</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Presentations</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">SEC & Stock Information</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Governance Documents</Link></li>
                        </ul>
                    </div>
                </div>

                {/* DIVIDER + ADDRESSES */}
                {/* FIX: stack addresses on mobile, side-by-side on md+ */}
                <div className="border-t border-white/10 mt-12 md:mt-16 pt-10 md:pt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">

                    {/* BRANCH */}
                    <div>
                        <p className="text-xs tracking-widest text-slate-500 mb-4">
                            BRANCH OFFICE
                        </p>
                        <p className="text-sm leading-relaxed">
                            Second Floor<br />
                            Center For Electric Mobility<br />
                            Potheri, SRM Nagar, Kattankulathur 603203<br />
                            Tamil Nadu, India
                        </p>
                    </div>

                    {/* HQ */}
                    <div>
                        <p className="text-xs tracking-widest text-slate-500 mb-4">
                            HEADQUARTERS
                        </p>
                        <p className="text-sm leading-relaxed">
                            9-65-41/A Sykamvari St<br />
                            I Floor, Kothapet, Chittinagar<br />
                            Vijayawada (Urban), Krishna- 520001<br />
                            Andhra Pradhesh, India<br />
                            {/* FIX: make phone number a tappable tel: link on mobile */}
                            Phone:{" "}
                            <a
                                href="tel:+918333850202"
                                className="hover:text-cyan-400 transition-colors"
                            >
                                +91 833 385 0202
                            </a>
                        </p>
                    </div>
                </div>

                {/* COPYRIGHT */}
                {/* FIX: slightly more breathing room above copyright on mobile */}
                <div className="text-center text-xs text-slate-500 mt-10 md:mt-14">
                    © {year} Zhivam Web. All rights reserved.
                </div>
            </div>
        </motion.footer>
    );
}