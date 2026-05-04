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
        success: '#28A745',
        warning: '#FFC107',
        error: '#DC3545',
        info: '#17A2B8',
        neutral: {
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#ADB5BD',
          500: '#6C757D',
          600: '#495057',
          700: '#343A40',
          800: '#212529',
          900: '#1A1A1A',
        },
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
