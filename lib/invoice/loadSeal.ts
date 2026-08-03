// lib/invoice/loadSeal.ts
// Reads the company seal/stamp image from disk and returns it as a base64
// data URL, same reasoning as loadLogo.ts — @react-pdf/renderer can't
// resolve relative "/images/..." paths inside a serverless function.

import fs from "fs";
import path from "path";

let cached: string | null = null;

export function loadSealBase64(): string | undefined {
    if (cached) return cached;
    try {
        const filePath = path.join(process.cwd(), "public", "images", "company-seal.png");
        const buffer = fs.readFileSync(filePath);
        cached = `data:image/png;base64,${buffer.toString("base64")}`;
        return cached;
    } catch (err) {
        console.error("Seal load failed, rendering without it:", err);
        return undefined;
    }
}