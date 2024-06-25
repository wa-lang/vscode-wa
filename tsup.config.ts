import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'extension': 'src/extension.ts',
    'web-extension': 'src/web/extension.ts',
  },
  format: ['cjs', 'esm'],
  shims: false,
  dts: false,
  external: ['vscode'],
})
