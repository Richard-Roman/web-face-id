import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        dashboard: resolve(__dirname, 'index.html'),
        testing: resolve(__dirname, 'testing_masivo.html'),
        auth: resolve(__dirname, 'autenticacion-biometrica.html'),
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://34.41.144.88:8089',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
