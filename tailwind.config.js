/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0B0B14",
        panel: "#12121E",
        edge: "#1F1F30",
        mist: "#8B8BA7",
        violet: {
          DEFAULT: "#8B5CF6",
          soft: "#A78BFA",
        },
        teal: {
          DEFAULT: "#2DD4BF",
          soft: "#5EEAD4",
        },
      },
      boxShadow: {
        glow: "0 0 60px -10px rgba(139, 92, 246, 0.5)",
        glowTeal: "0 0 60px -10px rgba(45, 212, 191, 0.5)",
      },
    },
  },
  plugins: [],
};
