/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#1B5E20",
          dark: "#0F3D12",
          light: "#E8F2E9",
        },
        moss: "#97BC62",
        risk: {
          alta: "#B3261E",
          media: "#C77700",
          baixa: "#2E7D32",
        },
      },
    },
  },
  plugins: [],
};
