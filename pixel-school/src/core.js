/* ---- core: canvas, camera, pixel primitives, easing, bitmap fonts ---- */
// Everything is drawn into a virtual 960x540 frame (1080p / 2). K multiplies it for sharp output.
const VW = 960, VH = 540;
const canvas = document.getElementById('screen');
let ctx = canvas.getContext('2d', { alpha: false });
let K = 1;
function setK(k) {
  if (k === K && canvas.width === VW * k) return;
  K = k; canvas.width = VW * k; canvas.height = VH * k;
}
function beginFrame() {
  ctx.setTransform(K, 0, 0, K, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 1;
}

// ---------- math ----------
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, u) => a + (b - a) * u;
const ease = {
  lin: u => u,
  in: u => u * u,
  out: u => 1 - (1 - u) * (1 - u),
  io: u => u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u),
  back: u => { const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); },
  step: u => u < 1 ? 0 : 1,
};
// keyframes: [[t, v, easeName?], ...]
function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (t <= k[0]) {
      const p = keys[i - 1];
      const u = (t - p[0]) / (k[0] - p[0] || 1);
      return lerp(p[1], k[1], (ease[k[2] || 'io'])(u));
    }
  }
  return keys[keys.length - 1][1];
}
const win = (t, a, b) => t >= a && t < b;
const prog = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
// a parabolic hop: negative = up
function hop(t, t0, dur, h) { const u = (t - t0) / dur; return u > 0 && u < 1 ? -Math.round(h * 4 * u * (1 - u)) : 0; }
function hops(t, list) { let y = 0; for (const [t0, d, h] of list) y += hop(t, t0, d, h); return y; }
function rnd(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return x - Math.floor(x); }
// AMB is the real playback clock: blinking, clouds, fire and flags keep moving during reading pauses
let AMB = 0, NOBLINK = false;
function blinkAt(t, seed) { if (NOBLINK) return false; const per = 2.4 + rnd(seed) * 1.6; return ((AMB + rnd(seed + 9) * 3) % per) < 0.13; }

// ---------- camera ----------
const cam = { x: 0, y: 0, s: 3, ox: 0, oy: 0 };
let camLock = null; // used to re-frame a scene inside the closing photo
function setCam(x, y, s, shk) {
  if (camLock) { x = camLock.x; y = camLock.y; s = camLock.s; }
  cam.s = s; cam.x = Math.round(x * s) / s; cam.y = Math.round(y * s) / s;
  cam.ox = (camLock ? camLock.ox : 0) + (shk ? shk[0] : 0);
  cam.oy = (camLock ? camLock.oy : 0) + (shk ? shk[1] : 0);
}
// [[t0, magnitude(px), duration], ...]
function shakeAt(t, list) {
  let x = 0, y = 0;
  list.forEach(([t0, m, d], i) => {
    const a = t - t0;
    if (a >= 0 && a < d) {
      const amp = m * (1 - a / d), f = Math.floor(t * 40);
      x += Math.round((rnd(f + i * 13) * 2 - 1) * amp);
      y += Math.round((rnd(f * 3 + i * 7 + 1) * 2 - 1) * amp);
    }
  });
  return [x, y];
}
const sx = x => Math.round((x - cam.x) * cam.s) + cam.ox;
const sy = y => Math.round((y - cam.y) * cam.s) + cam.oy;
// world-space rect
function R(x, y, w, h, c) {
  const X = sx(x), Y = sy(y), W = sx(x + w) - X, H = sy(y + h) - Y;
  if (W <= 0 || H <= 0) return;
  ctx.fillStyle = c; ctx.fillRect(X, Y, W, H);
}
// screen-space rect (virtual px)
function S(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
// draw a 1x canvas into the world, pixel-aligned
function img(cv, x, y, w, h) {
  const X = sx(x), Y = sy(y);
  ctx.drawImage(cv, X, Y, sx(x + (w || cv.width)) - X, sy(y + (h || cv.height)) - Y);
}
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

// ---------- sprite-local drawing (origin at the feet, y up is negative) ----------
let SPX = 0, SPY = 0, SPF = 1;
function at(x, y, flip) { SPX = x; SPY = y; SPF = flip ? -1 : 1; }
function p(x, y, w, h, c) { if (SPF < 0) x = -x - w; R(SPX + x, SPY + y, w, h, c); }
function pline(x0, y0, x1, y1, c, wd) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), stx = x0 < x1 ? 1 : -1, sty = y0 < y1 ? 1 : -1;
  let e = dx + dy, n = 0;
  for (;;) {
    p(x0, y0, wd || 1, wd || 1, c);
    if ((x0 === x1 && y0 === y1) || n++ > 400) break;
    const e2 = 2 * e;
    if (e2 >= dy) { e += dy; x0 += stx; }
    if (e2 <= dx) { e += dx; y0 += sty; }
  }
}
// a filled pixel circle in world space
function disc(cx, cy, r, col) {
  for (let i = -r; i < r; i++) { const v = (i + 0.5) / r, hw = Math.round(r * Math.sqrt(1 - v * v)); if (hw > 0) R(cx - hw, cy + i, hw * 2, 1, col); }
}
const SHADOW = 'rgba(52,38,24,0.17)';
function shadowE(hw) { p(-hw, 0, hw * 2, 1, SHADOW); p(-hw + 2, 1, hw * 2 - 4, 1, SHADOW); }

// ---------- bitmap fonts ----------
// 5x7 for speech and titles; 3x5 for signs drawn inside the world.
const F5SRC = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.', D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '#####|#....|#....|####.|#....|#....|#####', F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.####', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '###|.#.|.#.|.#.|.#.|.#.|###', J: '..###|...#.|...#.|...#.|#..#.|#..#.|.##..',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|##..#|##..#|#.#.#|#..##|#..##|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.', V: '#...#|#...#|#...#|#...#|.#.#.|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '.#.|##.|.#.|.#.|.#.|.#.|###',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####', 3: '####.|....#|....#|.###.|....#|....#|####.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '.###.|#....|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|....#|.###.',
  '.': '.|.|.|.|.|.|#', ',': '..|..|..|..|..|.#|#.', '!': '#|#|#|#|#|.|#',
  '?': '.###.|#...#|....#|...#.|..#..|.....|..#..', "'": '#|#|.|.|.|.|.', '"': '#.#|#.#|...|...|...|...|...',
  ':': '.|.|#|.|.|#|.', '-': '....|....|....|####|....|....|....', '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
  '/': '....#|...#.|...#.|..#..|.#...|.#...|#....', '%': '##..#|##..#|...#.|..#..|.#...|#..##|#..##',
  '(': '.#|#.|#.|#.|#.|#.|.#', ')': '#.|.#|.#|.#|.#|.#|#.', '#': '.#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.',
  '$': '..#..|.####|#.#..|.###.|..#.#|####.|..#..', '@': '.###.|#...#|#.###|#.#.#|#.##.|#....|.###.',
  '*': '.....|#.#.#|.###.|#####|.###.|#.#.#|.....', '&': '.##..|#..#.|#.#..|.#...|#.#.#|#..#.|.##.#',
  '=': '....|....|####|....|####|....|....', '[': '##|#.|#.|#.|#.|#.|##', ']': '##|.#|.#|.#|.#|.#|##',
  '✓': '.....|....#|...##|#.##.|###..|.#...|.....', '·': '.|.|.|#|.|.|.', '♥': '.....|.#.#.|#####|#####|.###.|..#..|.....',
  '_': '.....|.....|.....|.....|.....|.....|#####',
};
const F3SRC = {
  A: '.#.|#.#|###|#.#|#.#', B: '##.|#.#|##.|#.#|##.', C: '.##|#..|#..|#..|.##', D: '##.|#.#|#.#|#.#|##.',
  E: '###|#..|##.|#..|###', F: '###|#..|##.|#..|#..', G: '.##|#..|#.#|#.#|.##', H: '#.#|#.#|###|#.#|#.#',
  I: '###|.#.|.#.|.#.|###', J: '..#|..#|..#|#.#|.#.', K: '#.#|#.#|##.|#.#|#.#', L: '#..|#..|#..|#..|###',
  M: '#.#|###|###|#.#|#.#', N: '##.|#.#|#.#|#.#|#.#', O: '.#.|#.#|#.#|#.#|.#.', P: '##.|#.#|##.|#..|#..',
  Q: '.#.|#.#|#.#|##.|.##', R: '##.|#.#|##.|#.#|#.#', S: '.##|#..|.#.|..#|##.', T: '###|.#.|.#.|.#.|.#.',
  U: '#.#|#.#|#.#|#.#|###', V: '#.#|#.#|#.#|#.#|.#.', W: '#.#|#.#|###|###|#.#', X: '#.#|#.#|.#.|#.#|#.#',
  Y: '#.#|#.#|.#.|.#.|.#.', Z: '###|..#|.#.|#..|###',
  0: '###|#.#|#.#|#.#|###', 1: '.#.|##.|.#.|.#.|###', 2: '##.|..#|.#.|#..|###', 3: '##.|..#|.#.|..#|##.',
  4: '#.#|#.#|###|..#|..#', 5: '###|#..|##.|..#|##.', 6: '.##|#..|###|#.#|###', 7: '###|..#|.#.|.#.|.#.',
  8: '###|#.#|###|#.#|###', 9: '###|#.#|###|..#|##.', '.': '.|.|.|.|#', '+': '...|.#.|###|.#.|...',
  '-': '...|...|###|...|...', '!': '#|#|#|.|#', '?': '##.|..#|.#.|...|.#.', ':': '.|#|.|#|.', "'": '#|#|.|.|.',
};
function compileFont(src) {
  const out = {};
  for (const ch in src) {
    const rows = src[ch].split('|');
    const runs = [];
    rows.forEach((row, r) => {
      let c = 0;
      while (c < row.length) {
        if (row[c] === '#') { let e = c; while (e < row.length && row[e] === '#') e++; runs.push([c, r, e - c]); c = e; } else c++;
      }
    });
    out[ch] = { w: rows[0].length, runs };
  }
  return out;
}
const F5 = compileFont(F5SRC), F3 = compileFont(F3SRC);
function glyph(f, ch) { return f[ch] || f[ch.toUpperCase()] || f['?']; }
function textW(str, sc, f) {
  f = f || F5; let w = 0;
  for (const ch of str) w += (ch === ' ' ? (f === F5 ? 3 : 2) : glyph(f, ch).w) + 1;
  return Math.max(0, w - 1) * sc;
}
// screen-space text, top-left anchored
function text(str, x, y, sc, col, shadowCol, f) {
  f = f || F5;
  x = Math.round(x); y = Math.round(y);
  if (shadowCol) text(str, x + sc, y + sc, sc, shadowCol, null, f);
  ctx.fillStyle = col;
  for (const ch of str) {
    if (ch === ' ') { x += ((f === F5 ? 3 : 2) + 1) * sc; continue; }
    const g = glyph(f, ch);
    for (const [c, r, n] of g.runs) ctx.fillRect(x + c * sc, y + r * sc, n * sc, sc);
    x += (g.w + 1) * sc;
  }
}
function textC(str, cx, y, sc, col, shadowCol, f) { text(str, cx - textW(str, sc, f) / 2, y, sc, col, shadowCol, f); }
// world-space 3x5 text (each glyph pixel = 1 world unit)
function wtext(str, x, y, col) {
  for (const ch of str) {
    if (ch === ' ') { x += 3; continue; }
    const g = glyph(F3, ch);
    for (const [c, r, n] of g.runs) R(x + c, y + r, n, 1, col);
    x += g.w + 1;
  }
}
function wtextW(str) { return textW(str, 1, F3); }

// ---------- pixel-cornered boxes (screen space) ----------
function rbox(x, y, w, h, c) {
  S(x + 2, y, w - 4, h, c); S(x, y + 2, w, h - 4, c); S(x + 1, y + 1, w - 2, h - 2, c);
}
