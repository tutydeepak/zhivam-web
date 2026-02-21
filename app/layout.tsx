import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { CartProvider } from "@/app/contexts/CartContext";
import FloatingContactButton from "@/app/components/FloatingContactButton"; // 1. Import the new component

export const metadata: Metadata = {
    title: "Zhivam Web",
    description: "A next-gen service ordering platform",
};

const geist = Geist({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${geist.className} bg-black text-white`}>
                <CartProvider>
                    <Navbar />
                    <main>{children}</main> {/* It's good practice to wrap children in a main tag */}
                    <Footer />
                    
                    {/* 2. Place the button here, inside the provider */}
                    <FloatingContactButton />
                </CartProvider>
            </body>
        </html>
    );
}