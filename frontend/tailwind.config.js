/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Role colors: Admin (purple), Developer (blue), Tester (green)
        role: {
          admin: '#8b5cf6',
          developer: '#3b82f6',
          tester: '#22c55e',
        },
        surface: {
          DEFAULT: '#18181c',
          hover: '#222228',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
