import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  worker: {
    format: 'es',
    plugins: () => [],
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
