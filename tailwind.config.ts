import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: "#eff8ff",
          100: "#dbeefe",
          500: "#2877b8",
          600: "#1f5f94",
          900: "#18344c"
        },
        graphite: {
          50: "#f7f8f8",
          100: "#ecefee",
          500: "#64706d",
          700: "#394340",
          900: "#17201d"
        },
        gold: {
          100: "#f7ecd0",
          500: "#bd8738"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 32, 29, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
