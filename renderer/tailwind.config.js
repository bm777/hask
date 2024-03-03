const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: "class",
  content: [
    './renderer/pages/**/*.{js,ts,jsx,tsx}',
    './renderer/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      'animation': {
        'gradient-x':'gradient-x 15s ease infinite',
        'gradient-y':'gradient-y 15s ease infinite',
        'gradient-xy':'gradient-xy 15s ease infinite',
        'rot-slow': 'rot 45s linear infinite',
        'rot-medium': 'rot 35s linear infinite',
        'rot-fast': 'rot 5s linear infinite',
      },
      animationDelay: {
        '500': '500ms',
        '1000': '1s',
        '1500': '1.5s',
        '2000': '2s',
      },
      'keyframes': {
        'gradient-y': {
          '0%, 100%': {
              'background-size':'400% 400%',
              'background-position': 'center top'
          },
          '50%': {
              'background-size':'200% 200%',
              'background-position': 'center center'
          }
      },
      'gradient-x': {
          '0%, 100%': {
              'background-size':'200% 200%',
              'background-position': 'left center'
          },
          '50%': {
              'background-size':'200% 200%',
              'background-position': 'right center'
          }
      },
      'gradient-xy': {
        '0%, 100%': {
            'background-size':'400% 400%',
            'background-position': 'left center'
        },
        '50%': {
            'background-size':'200% 200%',
            'background-position': 'right center'
        }
      },
      'rot': {
        '0%': { transform: 'rotate(0.0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      }
      }
    },
  },
  plugins: [],
};