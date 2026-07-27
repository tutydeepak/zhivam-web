// lib/invoice/loadLogo.ts
// Reads the Zhivam logo from disk and returns it as a base64 data URL,
// since @react-pdf/renderer's <Image> can't resolve relative "/images/..."
// paths inside a serverless function the way a browser <img> tag can.
// Result is cached in module memory after the first successful read so
// repeated PDF generations in the same server instance don't hit disk again.

import fs from "fs";
import path from "path";

let cached: string | null = null;

export function loadLogoBase64(): string | undefined {
    if (cached) return cached;

    try {
        const filePath = path.join(process.cwd(), "public", "images", "zhivam-logo-white.png");
        const buffer = fs.readFileSync(filePath);
        cached = `data:image/png;base64,${buffer.toString("base64")}`;
        return cached;
    } catch (err) {
        console.error("Logo load failed, rendering without it:", err);
        return undefined;
    }
}