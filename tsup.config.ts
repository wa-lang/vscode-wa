import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/extension.ts'],
  format: ['cjs', 'esm'],
  shims: false,
  dts: false,
  external: ['vscode'],
})
