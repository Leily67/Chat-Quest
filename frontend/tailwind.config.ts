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
        primary: "#A78295",
        secondary: "#3F2E3E",
      },
      backgroundImage: {
        gradient:
          "linear-gradient(90deg, #020024 0%, #791309 20%, #0600ff 100%)",
      },
      animation: {
        popup: "popup ease-in-out forwards 3s",
      },
      keyframes: {
        popup: {
          "0%": {
            opacity: '1',
          },
          "50%": {
            opacity: '1',
          },
          "100%": {
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
