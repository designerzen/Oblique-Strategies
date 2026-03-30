import { defineConfig } from 'vite'
import pug from 'vite-plugin-pug'
import fs from 'fs'
import path from 'path'
import pugCompile from 'pug'

// Load data
const decksData = JSON.parse(fs.readFileSync(path.join('src/data', 'decks.json'), 'utf-8'))

// Load cards data based on file name
const loadCardData = (fileName) => {
  try {
    const cardDataPath = path.join('src/data', `${fileName}.txt`)
    const data = fs.readFileSync(cardDataPath, 'utf-8')
    const cards = data.split(/\r?\n/).filter(line => line.trim())
    return { cards }
  } catch (e) {
    return { cards: [] }
  }
}

export default defineConfig({
  base: '/',
  root: 'src/html',
  publicDir: 'static',
  plugins: [
    {
      name: 'pug-dev-server',
      apply: 'serve',
      enforce: 'pre',
      configureServer(server) {
        return () => {
          server.middlewares.use((req, res, next) => {
            const pugFiles = ['index', '1', '2', '3', '4', '11', 'flash']
            const url = req.url.split('?')[0] // Remove query params
            let matched = false

            // Remove base path from URL
            let cleanUrl = url.replace(/^\/Oblique-Strategies/, '')
            if (!cleanUrl) cleanUrl = '/'

            // Match root or /index.html to index.pug
            if (cleanUrl === '/' || cleanUrl === '/index.html') {
              matched = true
              const pugPath = path.join(process.cwd(), 'src/html/markup/index.pug')
              const cardData = loadCardData('index')
              const locals = Object.assign({}, cardData, decksData)

              const html = pugCompile.renderFile(pugPath, {
                basedir: path.join(process.cwd(), 'src/html/markup'),
                ...locals
              })

              res.setHeader('Content-Type', 'text/html')
              res.end(html)
            } else {
              // Match other pug files like /1.html, /2.html, etc
              pugFiles.forEach(fileName => {
                if (cleanUrl === `/${fileName}.html` || cleanUrl === `/${fileName}`) {
                  matched = true
                  const pugPath = path.join(process.cwd(), 'src/html/markup', `${fileName}.pug`)
                  if (fs.existsSync(pugPath)) {
                    const cardData = loadCardData(fileName)
                    const locals = Object.assign({}, cardData, decksData)

                    const html = pugCompile.renderFile(pugPath, {
                      basedir: path.join(process.cwd(), 'src/html/markup'),
                      ...locals
                    })

                    res.setHeader('Content-Type', 'text/html')
                    res.end(html)
                  }
                }
              })
            }

            if (!matched) {
              next()
            }
          })
        }
      }
    },
    {
      name: 'pug-multiple',
      apply: 'build',
      enforce: 'post',
      generateBundle() {
        // Generate HTML files from all Pug templates
        const pugFiles = ['index', '1', '2', '3', '4', '11', 'flash']

        pugFiles.forEach(fileName => {
          const pugPath = path.join(process.cwd(), 'src/html/markup', `${fileName}.pug`)
          if (fs.existsSync(pugPath)) {
            const cardData = loadCardData(fileName)
            const locals = Object.assign({}, cardData, decksData)

            const html = pugCompile.renderFile(pugPath, {
              basedir: path.join(process.cwd(), 'src/html/markup'),
              ...locals
            })

            this.emitFile({
              type: 'asset',
              fileName: `${fileName}.html`,
              source: html
            })
          }
        })
      }
    },
    pug({
      pugOptions: {
        basedir: path.join(process.cwd(), 'src/html/markup')
      },
      locals: (filename) => {
        const baseName = path.basename(filename, '.pug')
        const cardData = loadCardData(baseName)
        return Object.assign({}, cardData, decksData)
      }
    })
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  build: {
    outDir: '../../dist',
    minify: false
  },
  server: {
    port: 8080,
    open: true
  }
})
