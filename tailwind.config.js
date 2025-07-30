/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs',
    './routes/**/*.js',
    './public/**/*.js',
    './public/**/*.html'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e0e0e0',
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

