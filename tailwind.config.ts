import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mkf: {
          navy: "#101828",
          dark: "#0b111e",
          blue: "#3B82F6",
          blueHover: "#2563EB",
          lightBg: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
          success: "#16A34A",
          warning: "#F59E0B",
          urgent: "#DC2626",
          purple: "#7C3AED",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        "pulse-subtle": "pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slight": "bounce 1.5s infinite",
      },
    },
  },
  plugins: [],
};
export default config;