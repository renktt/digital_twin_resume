/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#F5F5F0',
        accent: '#E6D8C3',
        secondary: '#C2A68C',
        highlight: '#5D866C',
        dark: {
          background: '#1a1a1a',
          accent: '#2a2a2a',
          secondary: '#3a3a3a',
          highlight: '#4a7c59',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'custom': '1rem',
      },
      transitionProperty: {
        'custom': 'all 0.3s ease',
      }
    },
  },
  plugins: [],
}
