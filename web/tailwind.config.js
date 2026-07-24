/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C41E3A',
          light: '#E63946',
          dark: '#8B0000',
        },
        secondary: {
          DEFAULT: '#2D5F3F',
          light: '#3A7D4F',
          dark: '#1B3A28',
        },
        accent: {
          DEFAULT: '#D4AF37',
          light: '#F4D03F',
          dark: '#B8941E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
