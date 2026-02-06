import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  envDir: __dirname,
  server: {
    port: Number(process.env.PORT) || 3100,
  },
  resolve: {
    alias: {
      '@project/framework': path.resolve(__dirname, '../framework/src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../../dist/demo'),
    emptyOutDir: false,
  },
});
