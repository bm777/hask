import React from 'react';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
      <Component {...pageProps} />
    );
}