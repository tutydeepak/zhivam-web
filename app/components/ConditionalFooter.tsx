"use client";
import { usePathname } from "next/navigation";
import Footer from "@/app/components/Footer";

export default function ConditionalFooter() {
    const pathname = usePathname();
    if (pathname === "/zheat") return null;
    return <Footer />;
}