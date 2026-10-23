import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        villaDeepCleaning: resolve(__dirname, 'villa-deep-cleaning.html'),
        moveInCleaning: resolve(__dirname, 'move-in-move-out-cleaning.html'),
        commercialAcDuctCleaning: resolve(__dirname, 'commercial-ac-duct-cleaning.html'),
        thankYou: resolve(__dirname, 'thank-you.html')
      }
    }
  }
});
