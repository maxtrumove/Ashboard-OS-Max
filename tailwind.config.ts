import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0f1117",
        panel: "#171a23",
        panelborder: "#262b38",
        accent: "#6d5efc",
      },
    },
  },
  plugins: [],
};

export default config;
