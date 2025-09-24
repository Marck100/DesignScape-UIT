// Vite configuration for DesignScope project
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // Main project folder
  publicDir: 'public',
  // Removed proxy: requests are sent directly to http://localhost:8000/predict
});
