// lib/invoice/numberToWords.ts
// Converts a rupee amount into words using the Indian numbering system
// (Lakh / Crore), e.g. 3417 -> "Three Thousand Four Hundred Seventeen"

const ONES = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n: number): string {
    if (n < 20) return ONES[n];
    const t = Math.floor(n / 10), o = n % 10;
    return TENS[t] + (o ? " " + ONES[o] : "");
}

function threeDigits(n: number): string {
    const h = Math.floor(n / 100), rest = n % 100;
    return (h ? ONES[h] + " Hundred" + (rest ? " " : "") : "") + (rest ? twoDigits(rest) : "");
}

export function numberToIndianWords(amount: number): string {
    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    if (rupees === 0 && paise === 0) return "Zero Rupees Only";

    let n = rupees;
    const crore = Math.floor(n / 1e7); n %= 1e7;
    const lakh = Math.floor(n / 1e5); n %= 1e5;
    const thousand = Math.floor(n / 1e3); n %= 1e3;
    const hundred = n;

    const parts: string[] = [];
    if (crore) parts.push(threeDigits(crore) + " Crore");
    if (lakh) parts.push(threeDigits(lakh) + " Lakh");
    if (thousand) parts.push(threeDigits(thousand) + " Thousand");
    if (hundred) parts.push(threeDigits(hundred));

    let words = parts.join(" ") + " Rupees";
    if (paise > 0) words += " and " + twoDigits(paise) + " Paise";
    return words + " Only";
}