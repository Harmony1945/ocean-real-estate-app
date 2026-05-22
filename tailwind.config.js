/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: "#eff9ff",
          100: "#dff2ff",
          500: "#177daa",
          600: "#116a91",
          900: "#102f42"
        },
        ink: {
          50: "#f7f8f8",
          100: "#ecf0f1",
          300: "#c5cfd3",
          600: "#52636c",
          800: "#25323a",
          950: "#0d171d"
        },
        coral: {
          100: "#ffe3dc",
          500: "#e7664f"
        },
        gold: {
          100: "#f7ead0",
          500: "#b88933"
        },
        sage: {
          100: "#dfeee7",
          500: "#478365"
        }
      },
      boxShadow: {
        panel: "0 18px 50px rgba(13, 23, 29, 0.08)"
      }
    }
  },
  plugins: []
};
