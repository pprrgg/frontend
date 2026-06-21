import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { copyFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-404',
      closeBundle() {
        // Copia 404.html a la carpeta dist
        try {
          copyFileSync(
            resolve(__dirname, 'public/404.html'),
            resolve(__dirname, 'dist/404.html')
          );
          console.log('✅ 404.html copiado a dist/');
        } catch (e) {
          console.warn('⚠️ No se encontró public/404.html');
        }
      }
    }
  ],
  // Con dominio personalizado, base es '/'
  base: '/',
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
        },
      },
    },
  },
});