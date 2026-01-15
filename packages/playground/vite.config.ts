import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 3000,
    hmr: {
      clientPort: Number(process.env.PORT) || 3000,
    },
  },
});
