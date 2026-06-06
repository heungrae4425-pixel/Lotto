import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        muted: "#657188",
        surface: "#f7f9fc"
      },
      gridTemplateColumns: {
        15: "repeat(15, minmax(0, 1fr))"
      }
    }
  },
  plugins: []
};

export default config;
