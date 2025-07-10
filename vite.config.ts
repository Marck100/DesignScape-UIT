import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // cartella principale
  publicDir: 'public',
  // Rimosso proxy: richieste vengono inviate direttamente a http://localhost:8000/predict
});
