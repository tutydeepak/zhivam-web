import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { CartProvider } from "@/app/contexts/CartContext";
import FloatingContactButton from "@/app/components/FloatingContactButton";

export const metadata: Metadata = {
    title: "Zhivam Web",
    description: "A next-gen service ordering platform",
    icons: {
        icon: "app/zhivam.ico",
    },
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
                    <main>{children}</main>
                    <Footer />
                    <FloatingContactButton />
                </CartProvider>
            </body>
        </html>
    );
}