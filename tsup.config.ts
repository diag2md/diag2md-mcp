import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  shims: true,
});
