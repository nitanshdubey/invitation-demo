/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
      extend: {
        colors: {
          ivory: "#FDFBF7",
          gold: {
            DEFAULT: "#D4AF37",
            light: "#E6C964",
            dark: "#B8942A",
          },
          taupe: "#E8E3D9",
          obsidian: "#0F0F0F",
        },
        fontFamily: {
          display: ['"Cormorant Garamond"', "Georgia", "serif"],
          body: ["Montserrat", "Inter", "system-ui", "sans-serif"],
        },
        letterSpacing: {
          luxe: "0.3em",
        },
        boxShadow: {
          gold: "0 10px 40px -10px rgba(212, 175, 55, 0.45)",
          soft: "0 20px 60px -20px rgba(15, 15, 15, 0.18)",
        },
        backgroundImage: {
          "gold-gradient":
            "linear-gradient(135deg, #B8942A 0%, #E6C964 45%, #D4AF37 70%, #B8942A 100%)",
        },
        keyframes: {
          shimmer: {
            "0%": { backgroundPosition: "-200% 0" },
            "100%": { backgroundPosition: "200% 0" },
          },
          wave: {
            "0%, 100%": { transform: "scaleY(0.35)" },
            "50%": { transform: "scaleY(1)" },
          },
        },
        animation: {
          shimmer: "shimmer 4s linear infinite",
          wave: "wave 1s ease-in-out infinite",
        },
      },
    },
    plugins: [],
  };