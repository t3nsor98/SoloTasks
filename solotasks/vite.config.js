import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  theme: {
    extend: {
      colors: {
        "system-purple": {
          100: "#e0d4ff",
          200: "#c2a9ff",
          300: "#a37eff",
          400: "#8553ff",
          500: "#6728ff",
          600: "#5220cc",
          700: "#3d1899",
          800: "#291066",
          900: "#140833",
        },
        "system-black": "#0a0a0a",
        "system-gray": "#2a2a2a",
      },
      fontFamily: {
        system: ["Rajdhani", "sans-serif"],
      },
      boxShadow: {
        system: "0 0 10px rgba(103, 40, 255, 0.5)",
      },
    },
  },
});
