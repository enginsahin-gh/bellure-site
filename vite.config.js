import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'src/index.html',
        boekingen: 'src/boekingen.html',
        privacy: 'src/privacy.html',
        voorwaarden: 'src/voorwaarden.html',
      }
    }
  },
});
