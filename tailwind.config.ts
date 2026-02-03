const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  safelist: [
    "bg-[var(--bg-main)]",
    "bg-[var(--bg-panel)]",
    "bg-[var(--bg-card)]",
    "text-[var(--text-main)]",
    "text-[var(--text-muted)]",
    "border-[var(--border-soft)]",
    "bg-[var(--accent)]",
  ],
  plugins: [],
};

export default config;
