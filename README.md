# Oblique Strategies

Web version of Brian Eno and Peter Schmidt's Oblique Strategies, with four editions and a Jodorowsky deck.

[Instant Inspiration](https://designerzen.github.io/Oblique-Strategies/)

## Development

Requires Node.js 22.12 or newer (Node 24 LTS recommended).

```sh
npm ci
npm run dev
```

Vite compiles the existing Pug templates and Less styles and bundles the original JavaScript with Hammer. The original 3D card stack, directional card dismissals, mouse rotation, wheel zoom, device tilt and five-second idle fade remain in use. Tap or swipe to dismiss a card. At the end, use Shuffle Deck or choose another deck. Arrow keys, Space and Enter also dismiss cards when a control is not focused.

The landing page is the original deck chooser. Numbered deck URLs (`1.html`, `2.html`, `3.html`, `4.html`, `11.html`) are preserved. The historical `flash.html` remains a deck chooser; the historical ActionScript sources remain in the repository.

## Build and test

```sh
npm run build
npx playwright install chromium
npm test
npm run preview
```

The static output is in `dist/`, with bundled scripts, styles and fonts. Relative URLs support root hosting and GitHub Pages project subdirectories. Playwright tests run against the production build under `/Oblique-Strategies/` on desktop and mobile Chromium, covering all five decks, every strategy, shuffling, the reload panel, directional taps, card links, mouse rotation, zoom, simulated device tilt, idle fading and narrow-screen layout.

The existing per-deck Pug templates in `src/html/markup` are the source of the HTML. Vite generates the ignored `.html` entry placeholders automatically, including on clean checkouts; edit the Pug templates to change markup. Card text lives in `src/data/*.txt` and the menu metadata is in `src/data/decks.json`. Source card IDs such as `4.html#4/card-12` remain stable through shuffling. Invalid card hashes are ignored safely.

## GitHub Actions

Pull requests and pushes to `main` install dependencies using `npm ci`, build, and run the browser tests. Successful builds on `main` deploy to GitHub Pages; pull requests cannot deploy. A manual workflow trigger is also available.

In repository **Settings → Pages**, choose **GitHub Actions** as the source.
