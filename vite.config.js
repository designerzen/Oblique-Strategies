import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  root: 'src/html',
  base: './',
  publicDir: '../../static',
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(['index', '1', '2', '3', '4', '11', 'flash'].map(
        page => [page, resolve('src/html', `${page}.html`)]
      )),
    },
  },
})
