import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14263B",
        "ink-soft": "#33475D",
        paper: "#F7F6F1",
        "paper-deep": "#EFEDE4",
        line: "#D8D5CA",
        patina: "#2E6E62",
        "patina-soft": "#E3ECE8",
        rust: "#A8452C",
        "rust-soft": "#F2E4DE",
        slate: "#5B6472",
      },
      fontFamily: {
        serif: ["'Noto Serif SC'", "'Source Han Serif SC'", "'Songti SC'", "Georgia", "serif"],
        sans: ["'Noto Sans SC'", "'PingFang SC'", "'Microsoft YaHei'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
