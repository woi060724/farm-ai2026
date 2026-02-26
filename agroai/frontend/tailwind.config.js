/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Unbounded', 'sans-serif'],
        body: ['Onest', 'sans-serif'],
      },
      colors: {
        agro: {
          50: '#f1f8e9',
          100: '#dcedc8',
          500: '#4caf50',
          700: '#388e3c',
          900: '#1b5e20',
        }
      }
    },
  },
  plugins: [],
}
