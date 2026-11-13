import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import pug from 'pug'

const { decks } = JSON.parse(readFileSync('src/data/decks.json', 'utf8'))
const pages = ['index', ...decks.map(deck => deck.id), 'flash']
const cardData = page => readFileSync(`src/data/${page}.txt`, 'utf8').split(/\r?\n/).map(card => card.trim()).filter(Boolean)

export default defineConfig({
  root: 'src/html',
  base: './',
  publicDir: '../../static',
  plugins: [{
    name: 'strategy-pug-pages',
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        const page = basename(context.filename, '.html')
        if (!pages.includes(page)) return html
        return pug.renderFile(resolve(`src/html/markup/${page}.pug`), {
          decks,
          cards: cardData(page),
          pretty: true,
        })
      },
    },
    configureServer(server) {
      server.watcher.add(resolve('src/data'))
      server.watcher.add(resolve('src/html/markup'))
      server.watcher.on('change', file => {
        if (/\.(pug|txt|json)$/.test(file)) server.ws.send({ type: 'full-reload' })
      })
    },
  }],
  css: {
    preprocessorOptions: {
      less: { javascriptEnabled: true, math: 'always' },
    },
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(pages.map(page => [page, resolve('src/html', `${page}.html`)])),
    },
  },
})
