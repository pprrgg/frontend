import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  // base: '/frontend/', // <- nombre de tu repo comentado para ponerle un custom domain 
});
