import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    target: 'es2020',
  },
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    proxy: {
      '/auth': 'http://localhost:8000',
      '/api': 'http://localhost:8000',
    },
  },
});
