import { defineConfig } from 'tsup';

export default defineConfig([
  // NPM module build (ESM & CJS)
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: true,
    target: 'es2020',
  },
  // CDN Standalone script (IIFE)
  {
    entry: { sdk: 'src/cdn.ts' },
    format: ['iife'],
    clean: false,
    sourcemap: false,
    minify: true,
    target: 'es2020',
    globalName: 'OnboardFlowGlobal',
    outExtension() {
      return {
        js: '.js',
      };
    },
  },
]);
