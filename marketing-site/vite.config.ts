import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  // Load env file from parent directory where .env.local is located
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');

  return {
    plugins: [react()],
    base: '/ART/',
    server: {
      port: 4700,
      fs: {
        // Allow serving files from the parent Docs directory
        allow: ['..'],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: '../Docs',
      emptyOutDir: false,
    },
    // Only use publicDir in dev mode to serve static TypeDoc files
    publicDir: command === 'serve' ? '../Docs' : false,
  };
});

