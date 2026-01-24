import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  envDir: __dirname,
  server: {
    port: Number(process.env.PORT) || 3000,
    hmr: process.env.VITE_HMR_HOST
      ? {
          host: process.env.VITE_HMR_HOST,
          port: Number(process.env.VITE_HMR_PORT) || 443,
          protocol: process.env.VITE_HMR_PROTOCOL || 'wss',
        }
      : true, // Let Vite auto-detect HMR in development
  },
  resolve: {
    alias: {
      '@project/framework': path.resolve(__dirname, '../framework/src'),
    },
  },
});
