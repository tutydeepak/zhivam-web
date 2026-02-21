"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const FloatingContactButton = () => {
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();

    // This function handles the visibility logic
    const toggleVisibility = () => {
        // If it's the homepage, show button only after scrolling 300px
        if (pathname === '/') {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        } else {
            // For all other pages, always show the button
            setIsVisible(true);
        }
    };

    // Set up the event listener when the component mounts
    useEffect(() => {
        // Run the check once on page load
        toggleVisibility();

        window.addEventListener('scroll', toggleVisibility);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, [pathname]); // Rerun the effect if the page path changes

    return (
        <AnimatePresence>
            {isVisible && (
                <Link href="/contact" passHref>
                    <motion.div
                        className="fixed bottom-8 right-8 z-50 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-cyan-500 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Contact Us"
                    >
                        <Phone size={28} className="text-white" />
                    </motion.div>
                </Link>
            )}
        </AnimatePresence>
    );
};

export default FloatingContactButton;