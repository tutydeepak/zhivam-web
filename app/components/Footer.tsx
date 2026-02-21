"use client";

import { motion } from "framer-motion";

export default function Footer() {
    return (
        <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="bg-black/40 text-gray-400 py-6 text-center backdrop-blur-md"
        >
            <p>© {new Date().getFullYear()} Zhivam Web. All rights reserved.</p>
        </motion.footer>
    );
}
