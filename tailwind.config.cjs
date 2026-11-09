module.exports = {
  // App is permanently light-themed; no dark mode support
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        bg: "var(--bg)"
      },
      boxShadow: {
        glow: "0 24px 60px rgba(16, 185, 129, 0.16)",
        panel: "0 24px 60px rgba(26, 31, 58, 0.08)"
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 1px 1px, rgba(26, 31, 58, 0.06) 1px, transparent 0)"
      }
    }
  },
  plugins: []
}
