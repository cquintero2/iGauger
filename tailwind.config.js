module.exports = {
  content: ['./*.html', './Public/*.js'], // Scans HTML and JS for classes to include in output
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: '#013c85',     // Your primary blue color for the footer and other elements
        secondary: '#f8f9fb',   // The background color of the website
        orangeGradientStart: '#f59201',
        orangeGradientEnd: '#f7b500',
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],  // Adding the "Open Sans" font
      },
      borderRadius: {
        default: '16px',       // The consistent corner radius for buttons and elements
      },
    },
  },
  
  variants: {
    extend: {
      margin: ['responsive'],
      borderRadius: ['responsive'],
      fontSize: ['responsive'],
      boxShadow: ['responsive'],
    },
  },
  plugins: [],
}
