import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['server/main.ts'],
  tsconfig: './tsconfig.server.json',
  format: ['esm'],
  outDir: 'dist-server',
  clean: true,
  splitting: false,
  sourcemap: false, 
});