import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        fanx: {
          primary: "#FF0050", // TikTok Red/Pink
          secondary: "#00F2EA", // TikTok Cyan
          accent: "#FFFFFF",
          dark: "#121212",
          card: "#1E1E1E",
        },
      },
      animation: {
        'gift-float': 'gift-float 3s ease-in-out infinite',
        'pulse-vibrant': 'pulse-vibrant 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'gift-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-vibrant': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
