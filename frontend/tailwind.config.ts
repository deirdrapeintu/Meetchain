import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6C4FF7",
        techblue: "#3A98F7",
      },
      backgroundImage: {
        'gradient-web3': 'linear-gradient(135deg, #6C4FF7 0%, #3A98F7 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;


