import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

const { decks } = JSON.parse(readFileSync('src/data/decks.json', 'utf8'))
const cardsFor = id => readFileSync(`src/data/${id}.txt`, 'utf8').split(/\r?\n/).map(text => text.trim()).filter(Boolean)
const visibleCard = page => page.locator('#deck > .card:not(.reload)[aria-hidden="false"]')

for (const deck of decks) {
  test(`${deck.id}: original stack, every strategy, reload and shuffle`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(deck.link)
    await expect(page.locator('body')).not.toHaveClass(/loading/)
    const source = cardsFor(deck.id)
    await expect(page.locator('#deck > .card:not(.reload)')).toHaveCount(source.length)
    await expect(page.locator('#main-menu li.active a')).toHaveAttribute('href', deck.link)
    await expect(page.locator('#main-menu a')).toHaveCount(5)
    expect(await page.locator('#deck').evaluate(deck => getComputedStyle(deck).transformStyle)).toBe('preserve-3d')
    const seen = await page.evaluate(count => {
      const result = []
      for (let i = 0; i < count; i++) {
        const card = document.querySelector('#deck > .card:not(.reload)[aria-hidden="false"]')
        result.push({ id: card.id, text: card.textContent })
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      }
      return result
    }, source.length)
    expect(seen.map(card => card.text).sort()).toEqual([...source].sort())
    expect(new Set(seen.map(card => card.id)).size).toBe(source.length)
    await expect(page.locator('#deck > .reload')).toHaveAttribute('aria-hidden', 'false')
    expect(await page.locator('#deck').evaluate(deck => deck.lastElementChild.classList.contains('reload'))).toBe(true)
    await page.locator('#shuffle').click({ force: true })
    await expect(visibleCard(page)).toHaveCount(1)
    await expect(page.locator('#deck > .reload')).toHaveAttribute('aria-hidden', 'true')
    await expect(page.locator('body')).not.toHaveClass(/complete/)
    expect(await page.locator('#deck').evaluate(deck => deck.lastElementChild.classList.contains('reload'))).toBe(true)
    expect(errors).toEqual([])
  })

  test(`${deck.id}: hashes, directional tap and longest card fit`, async ({ page }) => {
    // Measure layout in the neutral camera pose. Unsolicited pointer/sensor
    // events can rotate the 3D stack on a runner; camera motion is tested below.
    await page.addInitScript(() => {
      for (const type of ['mousemove', 'deviceorientation', 'devicemotion', 'MozOrientation']) {
        window.addEventListener(type, event => event.stopImmediatePropagation(), true)
      }
    })
    const source = cardsFor(deck.id)
    const longest = source.reduce((best, text, i) => text.length > source[best].length ? i : best, 0)
    await page.goto(`${deck.link}#${deck.id}/card-${longest + 1}`)
    await expect(visibleCard(page)).toHaveText(source[longest])
    await page.evaluate(() => document.fonts.ready)
    // Shuffling and restoring the hash can start transform transitions. Font
    // readiness doesn't mean those have finished, especially on slower runners.
    await expect.poll(() => visibleCard(page).evaluate(card =>
      card.getAnimations().filter(animation => animation.playState === 'running').length
    )).toBe(0)
    expect(await visibleCard(page).evaluate(card => card.scrollHeight <= card.clientHeight && card.scrollWidth <= card.clientWidth)).toBe(true)
    const bounds = await visibleCard(page).boundingBox()
    const size = page.viewportSize()
    const geometry = await visibleCard(page).evaluate(card => ({
      viewportWidth: innerWidth,
      cardWidth: getComputedStyle(card).width,
      transform: getComputedStyle(card).transform,
      deckTransform: getComputedStyle(document.querySelector('#deck')).transform,
      deck: document.querySelector('#deck').getBoundingClientRect().toJSON(),
    }))
    const details = JSON.stringify({ bounds, size, ...geometry })
    expect(bounds.x, details).toBeGreaterThanOrEqual(0)
    expect(bounds.x + bounds.width, details).toBeLessThanOrEqual(size.width)
    const id = await visibleCard(page).getAttribute('id')
    const point = { x: bounds.x + bounds.width * .85, y: bounds.y + bounds.height * .5 }
    if (test.info().project.name === 'mobile') await page.touchscreen.tap(point.x, point.y)
    else await page.mouse.click(point.x, point.y)
    const direction = point.x / size.width >= .65 ? 'right' : point.x / size.width <= .35 ? 'left' : point.y / size.height < .5 ? 'up' : 'down'
    await expect(page.locator(`#${id}`)).toHaveClass(new RegExp(`hide-${direction}`))
    const hash = new URL(page.url()).hash
    await page.reload()
    await expect(visibleCard(page)).toHaveAttribute('id', hash.split('/')[1])
  })
}

test('mouse rotation, wheel zoom, tilt and idle fade retain their effects', async ({ page }) => {
  await page.clock.install()
  await page.goto('1.html')
  await page.mouse.move(130, 160)
  await expect.poll(() => page.locator('#deck').evaluate(deck => deck.style.transform)).toContain('rotateX(')
  await page.waitForTimeout(200)
  const before = await page.locator('#deck').evaluate(deck => deck.style.transform)
  await page.mouse.wheel(0, 120)
  await page.waitForTimeout(200)
  expect(await page.locator('#deck').evaluate(deck => deck.style.transform)).not.toBe(before)
  const zoomed = await page.locator('#deck').evaluate(deck => deck.style.transform)
  await page.evaluate(() => window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { beta: 8, gamma: 12 })))
  await page.waitForTimeout(200)
  expect(await page.locator('#deck').evaluate(deck => deck.style.transform)).not.toBe(zoomed)
  await page.clock.runFor(7000)
  await expect(page.locator('body')).toHaveClass(/inactive/)
  await page.mouse.move(140, 170)
  await expect(page.locator('body')).not.toHaveClass(/inactive/)
})

test('landing deck chooser, navigation and invalid hashes', async ({ page }) => {
  await page.goto('index.html')
  await expect(page.locator('#deck .reload .more a')).toHaveCount(5)
  await expect(page.locator('#deck .reload')).toHaveAttribute('aria-hidden', 'false')
  await expect(page.locator('#shuffle')).toBeHidden()
  await page.locator('#main-menu a[href="11.html"]').click()
  await expect(visibleCard(page)).toHaveCount(1)
  await expect(page.locator('#main-menu li.active a')).toHaveAttribute('href', '11.html')
  await page.goto('4.html#4/nonexistent')
  await expect(visibleCard(page)).toHaveCount(1)
  await page.goto('4.html#4/%invalid')
  await expect(visibleCard(page)).toHaveCount(1)
  await page.goto('flash.html')
  await expect(page.locator('#deck .reload .more a')).toHaveCount(5)
})

test('Hammer drag dismisses one card in the swipe direction', async ({ page }) => {
  await page.goto('2.html')
  const id = await visibleCard(page).getAttribute('id')
  const bounds = await visibleCard(page).boundingBox()
  const x = bounds.x + bounds.width / 2
  const y = bounds.y + bounds.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x - 60, y, { steps: 5 })
  await page.mouse.up()
  await expect(page.locator(`#${id}`)).toHaveClass(/hide-left/)
  await expect(page.locator('#deck > .card[class*="hide-"]')).toHaveCount(1)
  await expect(visibleCard(page)).toHaveCount(1)
})

// Drive only JavaScript animation frames so scheduling and refresh-rate behavior
// can be checked deterministically without depending on the runner's display.
async function installAnimationClock(page) {
  await page.addInitScript(() => {
    let now = 0
    let nextId = 0
    let hidden = false
    const callbacks = new Map()
    Object.defineProperty(performance, 'now', { value: () => now })
    Object.defineProperty(document, 'hidden', { get: () => hidden })
    window.requestAnimationFrame = callback => {
      const id = ++nextId
      callbacks.set(id, callback)
      return id
    }
    window.cancelAnimationFrame = id => callbacks.delete(id)
    window.animationClock = {
      get pending() { return callbacks.size },
      flush(timestamp) {
        now = timestamp
        const frame = [...callbacks.values()]
        callbacks.clear()
        frame.forEach(callback => callback(timestamp))
      },
      setHidden(value) {
        hidden = value
        document.dispatchEvent(new Event('visibilitychange'))
      },
    }
  })
}

test('input bursts render once per frame and the loop stops after settling', async ({ page }) => {
  await installAnimationClock(page)
  await page.goto('1.html')
  const result = await page.evaluate(() => {
    const deck = document.querySelector('#deck')
    const before = deck.style.transform
    for (let i = 0; i < 100; i++) {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: innerWidth / 4, clientY: innerHeight / 4 }))
    }
    const immediate = deck.style.transform
    const pending = animationClock.pending
    animationClock.flush(1000 / 60)
    const firstFrame = deck.style.transform
    for (let i = 2; i <= 200; i++) animationClock.flush(i * 1000 / 60)
    const settledPending = animationClock.pending
    const settled = deck.style.transform
    window.dispatchEvent(new WheelEvent('wheel', { deltaY: 80 }))
    const beforeNextFrame = deck.style.transform
    const restartedPending = animationClock.pending
    animationClock.flush(201 * 1000 / 60)
    return { before, immediate, pending, firstFrame, settledPending, settled, beforeNextFrame, restartedPending, afterNextFrame: deck.style.transform }
  })
  expect(result.immediate).toBe(result.before)
  expect(result.pending).toBe(1)
  expect(result.firstFrame).not.toBe(result.before)
  expect(result.settledPending).toBe(0)
  expect(result.beforeNextFrame).toBe(result.settled)
  expect(result.restartedPending).toBe(1)
  expect(result.afterNextFrame).not.toBe(result.settled)
})

test('rotation smoothing follows elapsed time at 60 and 144 Hz', async ({ page }) => {
  await installAnimationClock(page)
  const samples = []
  for (const hz of [60, 144]) {
    await page.goto('1.html')
    samples.push(await page.evaluate(hz => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: innerWidth / 4, clientY: innerHeight / 4 }))
      for (let frame = 1; frame <= hz / 2; frame++) animationClock.flush(frame * 1000 / hz)
      return [...new DOMMatrix(document.querySelector('#deck').style.transform).toFloat64Array()]
    }, hz))
  }
  expect(samples[0][6]).not.toBe(0)
  samples[0].forEach((value, index) => expect(value).toBeCloseTo(samples[1][index], 6))
})

test('hidden tabs pause the loop and resume without counting hidden time', async ({ page }) => {
  await installAnimationClock(page)
  await page.goto('1.html')
  const result = await page.evaluate(() => {
    const deck = document.querySelector('#deck')
    window.dispatchEvent(new WheelEvent('wheel', { deltaY: 800 }))
    animationClock.flush(1000 / 60)
    const before = new DOMMatrix(deck.style.transform).m43
    animationClock.setHidden(true)
    const hiddenPending = animationClock.pending
    animationClock.flush(10000)
    const hidden = new DOMMatrix(deck.style.transform).m43
    animationClock.setHidden(false)
    const resumedPending = animationClock.pending
    animationClock.flush(10000 + 1000 / 60)
    return { before, hidden, hiddenPending, resumedPending, resumed: new DOMMatrix(deck.style.transform).m43 }
  })
  expect(result.hiddenPending).toBe(0)
  expect(result.hidden).toBe(result.before)
  expect(result.resumedPending).toBe(1)
  expect(result.resumed).toBeGreaterThan(result.before)
  expect(result.resumed).toBeLessThan(50)
})
