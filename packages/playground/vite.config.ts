import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 3000,
    hmr: {
      clientPort: Number(process.env.PORT) || 3000,
    },
  },
  resolve: {
    alias: {
      '@project/framework': path.resolve(__dirname, '../framework/src'),
    },
  },
});
