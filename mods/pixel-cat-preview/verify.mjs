// Renders the mod's SVGs in Chromium (the desktop app's engine) and checks,
// for every animation, coat and theme:
//   - crisp pixels: every 3x3 block of screen pixels is one flat color
//   - exact frames: frame i, sampled at its own time, matches the sprites
//     pixel for pixel (so no frame is offset or jumps)
//   - steady ground: the lowest drawn row stays put where the cat does not hop
//   - outline contrast against the background, with the real
//     prefers-color-scheme media query (light and dark)
//   - reduced motion: one still frame that never changes, no floaters
// and writes screenshots to ./shots.
//
//   node --import ./ts-loader.mjs verify.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { decodePng, encodePng } from './png.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const lib = path.join(here, '../pixel-cat/hooks/lib')
const { animation, ANIMS, STAGE_W, STAGE_H } = await import(path.join(lib, 'stage.ts'))
const { palette, themed, COATS } = await import(path.join(lib, 'palette.ts'))
const { svgFor, SCALE } = await import(path.join(lib, 'svg.ts'))
const { FRAME_MS } = await import(path.join(lib, 'mood.ts'))
const { chromium } = await import(process.env.PLAYWRIGHT ?? '/opt/node22/lib/node_modules/playwright/index.mjs')

const SKINS = [...COATS, 'golden']
const BG = { light: [255, 255, 255], dark: [31, 30, 29] }
const shots = path.join(here, 'shots')
fs.mkdirSync(shots, { recursive: true })

const lookOf = (skin, isNight) => ({ skin, isNight, variants: isNight ? ['yawn', 'yawn'] : ['yawn', 'lick'] })
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const lum = ([r, g, b]) => {
  const f = c => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

/** One page of iframes, one per skin, each holding one SVG inline. */
function pageFor(id, isNight, theme) {
  const frames = SKINS.map(skin => {
    const svg = svgFor(animation(id, lookOf(skin, isNight)), palette(skin), 1, FRAME_MS)
    const doc = `<!doctype html><html><head><style>html,body{margin:0;background:rgb(${BG[theme].join(',')})}svg{display:block}</style></head><body>${svg}</body></html>`
    return `<iframe data-skin="${skin}" width="${STAGE_W * SCALE}" height="${STAGE_H * SCALE}" srcdoc="${doc.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"></iframe>`
  })
  return `<!doctype html><html><head><style>body{margin:0;padding:0;background:rgb(${BG[theme].join(',')})}iframe{border:0;display:block;margin:0}</style></head><body>${frames.join('')}</body></html>`
}

async function seek(page, t, { hideFloaters }) {
  for (const frame of page.frames().slice(1)) {
    await frame.evaluate(
      ({ t, hideFloaters }) => {
        if (hideFloaters) for (const fx of document.querySelectorAll('.fx')) fx.style.display = 'none'
        for (const a of document.getAnimations()) {
          a.pause()
          a.currentTime = t
        }
      },
      { t, hideFloaters },
    )
  }
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
}

const report = []
let failures = 0

async function checkFrames(browser, theme) {
  const page = await browser.newPage({ viewport: { width: 200, height: 400 }, colorScheme: theme, deviceScaleFactor: 1 })
  for (const id of ANIMS) {
    await page.setContent(pageFor(id, false, theme))
    await page.waitForTimeout(100)
    const looks = Object.fromEntries(SKINS.map(skin => [skin, animation(id, lookOf(skin, false))]))
    const n = looks.tabby.frames.length
    let blocks = 0, blurry = 0, wrong = 0
    const grounds = new Set()
    const minContrast = {}
    for (let i = 0; i < n; i++) {
      await seek(page, (i + 0.5) * FRAME_MS, { hideFloaters: true })
      const shot = decodePng(await page.screenshot({ clip: { x: 0, y: 0, width: STAGE_W * SCALE, height: STAGE_H * SCALE * SKINS.length } }))
      SKINS.forEach((skin, k) => {
        const grid = looks[skin].frames[i]
        const colors = themed(palette(skin), theme === 'dark')
        const outline = hex(colors.o)
        let lowest = -1
        for (let y = 0; y < STAGE_H; y++) {
          for (let x = 0; x < STAGE_W; x++) {
            blocks += 1
            const at = (dx, dy) => {
              const px = x * SCALE + dx, py = k * STAGE_H * SCALE + y * SCALE + dy
              const o = (py * shot.width + px) * 4
              return [shot.rgba[o], shot.rgba[o + 1], shot.rgba[o + 2]]
            }
            const first = at(0, 0)
            let flat = true
            for (let dy = 0; dy < SCALE; dy++) for (let dx = 0; dx < SCALE; dx++) {
              const c = at(dx, dy)
              if (c[0] !== first[0] || c[1] !== first[1] || c[2] !== first[2]) flat = false
            }
            if (!flat) blurry += 1
            const ch = grid[y][x]
            const want = ch === '.' ? BG[theme] : hex(colors[ch])
            if (Math.abs(first[0] - want[0]) > 1 || Math.abs(first[1] - want[1]) > 1 || Math.abs(first[2] - want[2]) > 1) wrong += 1
            if (ch !== '.' && ch !== ' ' && !/[yYzhHgk]/.test(ch)) lowest = Math.max(lowest, y)
          }
        }
        grounds.add(lowest)
        minContrast[skin] = Math.min(minContrast[skin] ?? Infinity, contrast(outline, BG[theme]))
      })
    }
    const line = { theme, id, frames: n, blocks, blurry, wrong, grounds: [...grounds].sort((a, b) => a - b), minContrast }
    report.push(line)
    if (blurry > 0 || wrong > 0) failures += 1
    console.log(
      `${theme.padEnd(5)} ${id.padEnd(8)} ${String(n).padStart(2)} frames × ${SKINS.length} coats: ` +
        `${blurry} blurry blocks, ${wrong} wrong blocks of ${blocks}; ground rows ${line.grounds.join(',')}; ` +
        `outline contrast ${Object.values(minContrast).map(c => c.toFixed(1)).join('/')}`,
    )
  }
  await page.close()
}

async function checkReducedMotion(browser) {
  const page = await browser.newPage({ viewport: { width: 200, height: 400 }, reducedMotion: 'reduce', deviceScaleFactor: 1 })
  for (const id of ANIMS) {
    await page.setContent(pageFor(id, false, 'light'))
    await page.waitForTimeout(100)
    const shots = []
    for (const t of [75, 1234, 2600]) {
      await seek(page, t, { hideFloaters: false })
      shots.push((await page.screenshot({ clip: { x: 0, y: 0, width: STAGE_W * SCALE, height: STAGE_H * SCALE * SKINS.length } })).toString('base64'))
    }
    const still = shots.every(s => s === shots[0])
    // The still frame, with nothing floating over it.
    const decoded = decodePng(Buffer.from(shots[0], 'base64'))
    let wrong = 0
    SKINS.forEach((skin, k) => {
      const anim = animation(id, lookOf(skin, false))
      const grid = anim.frames[anim.still]
      const colors = themed(palette(skin), false)
      for (let y = 0; y < STAGE_H; y++) for (let x = 0; x < STAGE_W; x++) {
        const o = (((k * STAGE_H + y) * SCALE + 1) * decoded.width + x * SCALE + 1) * 4
        const want = grid[y][x] === '.' ? BG.light : hex(colors[grid[y][x]])
        if (Math.abs(decoded.rgba[o] - want[0]) > 1 || Math.abs(decoded.rgba[o + 1] - want[1]) > 1 || Math.abs(decoded.rgba[o + 2] - want[2]) > 1) wrong += 1
      }
    })
    if (!still || wrong > 0) failures += 1
    console.log(`reduced  ${id.padEnd(8)} still across time: ${still ? 'yes' : 'NO'}; still frame mismatches: ${wrong}`)
    report.push({ theme: 'reduced', id, still, wrong })
  }
  await page.close()
}

/** A sheet of every animation (rows) × coat (columns) at one moment, for the eye. */
async function sheet(browser, theme, isNight, t, name) {
  const page = await browser.newPage({ viewport: { width: 200, height: 400 }, colorScheme: theme, deviceScaleFactor: 1 })
  const rows = []
  for (const id of ANIMS) {
    await page.setContent(pageFor(id, isNight, theme))
    await page.waitForTimeout(100)
    await seek(page, t[id] ?? 0, { hideFloaters: false })
    rows.push(decodePng(await page.screenshot({ clip: { x: 0, y: 0, width: STAGE_W * SCALE, height: STAGE_H * SCALE * SKINS.length } })))
  }
  await page.close()
  // Lay the strips side by side: columns are animations, rows are coats.
  const w = STAGE_W * SCALE, h = STAGE_H * SCALE * SKINS.length, gap = 6
  const W = ANIMS.length * (w + gap) + gap, H = h + 2 * gap
  const out = Buffer.alloc(W * H * 4)
  const bg = theme === 'dark' ? [60, 58, 55] : [228, 225, 218]
  for (let i = 0; i < W * H; i++) out.set([...bg, 255], i * 4)
  rows.forEach((img, c) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const s = (y * img.width + x) * 4, d = ((y + gap) * W + gap + c * (w + gap) + x) * 4
      out.set(img.rgba.subarray(s, s + 4), d)
    }
  })
  fs.writeFileSync(path.join(shots, name), encodePng(W, H, out))
}

/** The preview page itself, as a person sees it. */
async function previewShots(browser) {
  for (const [scheme, file] of [['light', 'preview-page.png'], ['dark', 'preview-page-os-dark.png']]) {
    const page = await browser.newPage({ viewport: { width: 940, height: 1000 }, colorScheme: scheme })
    await page.goto('file://' + path.join(here, 'preview.html'))
    await page.waitForSelector('body[data-ready=yes]', { timeout: 120000 })
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(shots, file), fullPage: true })
    if (scheme === 'light') {
      await page.locator('#terminal').screenshot({ path: path.join(shots, 'terminal.png') })
      await page.locator('#sit table').screenshot({ path: path.join(shots, 'sit-table.png') })
    }
    await page.close()
  }
}

const browser = await chromium.launch()
await checkFrames(browser, 'light')
await checkFrames(browser, 'dark')
await checkReducedMotion(browser)
const moments = { sit: 1950, chase: 1275, sleep: 1300, typing: 75, stretch: 1300, startle: 375 }
await sheet(browser, 'light', false, moments, 'all-light.png')
await sheet(browser, 'dark', false, moments, 'all-dark.png')
await sheet(browser, 'light', true, moments, 'all-nightcap.png')
if (fs.existsSync(path.join(here, 'preview.html'))) await previewShots(browser)
await browser.close()
fs.writeFileSync(path.join(shots, 'report.json'), JSON.stringify(report, null, 2))
console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECKS FAILED`)
process.exit(failures === 0 ? 0 : 1)
