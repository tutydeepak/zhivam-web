// File: tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                // Create a custom name for your font, e.g., 'chetta'
                chetta: ['ChettaVissto', 'serif'],
            },
        },
    },
    plugins: [require('@tailwindcss/line-clamp')]
}