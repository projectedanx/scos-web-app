import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '');

    const API_KEY = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || env.API_KEY || env.VITE_API_KEY;

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Expose to process.env for legacy code
        'process.env.GEMINI_API_KEY': JSON.stringify(API_KEY),
        'process.env.API_KEY': JSON.stringify(API_KEY),
        // Expose to import.meta.env for Vite code
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(API_KEY),
        'import.meta.env.VITE_API_KEY': JSON.stringify(API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
