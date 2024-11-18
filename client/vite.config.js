


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
  },
  server: {
    // If using proxy
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
