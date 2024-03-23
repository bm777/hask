module.exports = {
  plugins: {
    tailwindcss: {
      config: './renderer/tailwind.config.js',
    },
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
  },
};
