"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import ConditionalFooter from "@/app/components/ConditionalFooter";
import FloatingContactButton from "@/app/components/FloatingContactButton";

export default function SiteShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");

    return (
        <>
            {!isAdmin && <Navbar />}
            <main>{children}</main>
            {!isAdmin && <ConditionalFooter />}
            {!isAdmin && <FloatingContactButton />}
        </>
    );
}