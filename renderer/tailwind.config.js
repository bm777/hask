import colors from 'tailwindcss/colors'

import { haskColors } from './styles/custom'


module.exports = {
  darkMode: "class",
  important: true,
  content: [
    './renderer/pages/**/*.{js,ts,jsx,tsx}',
    './renderer/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      ...colors,
    ...haskColors,
    },
    extend: {
      'animation': {
        'gradient-x':'gradient-x 15s ease infinite',
        'gradient-y':'gradient-y 15s ease infinite',
        'gradient-xy':'gradient-xy 15s ease infinite',
        'rot-slow': 'rot 45s linear infinite',
        'rot-medium': 'rot 35s linear infinite',
        'rot-fast': 'rot 5s linear infinite',
      },

    },
  },
  plugins: [],
};