/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind v4 does JIT on all your source by default through the Vite plugin,
  // so `content` here is mostly for editor tooling / intellisense. It's safe to keep.
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // OPTIONAL: for some of your custom components like Checkbox/Tabs
        // we'll define these tokens so Tailwind doesn't complain.
        input: "rgb(24 24 24 / 1)",       // dark border-ish
        primary: "rgb(255 255 255 / 1)",  // white as "primary" ring
      },
    },
  },
  plugins: [],
};
