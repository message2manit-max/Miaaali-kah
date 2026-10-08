/* ---- core: device-pixel renderer, smooth camera, cubes, easing, bitmap fonts ---- */
// Layout uses a virtual 960x540 frame; everything is rounded to real device pixels (K = device px per virtual px),
// so positions, zooms and limbs move continuously instead of snapping to the art's big pixels.
const VW = 960, VH = 540;
const canvas = document.getElementById('screen');
let ctx = canvas.getContext('2d', { alpha: false });
let K = 1;
function setK(k) {
  if (k === K && canvas.width === Math.round(VW * k)) return;
  K = k; canvas.width = Math.round(VW * k); canvas.height = Math.round(VH * k);
}
function beginFrame() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// ---------- math ----------
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, u) => a + (b - a) * u;
const ease = {
  lin: u => u,
  in: u => u * u,
  out: u => 1 - (1 - u) * (1 - u),
  io: u => u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u),
  sine: u => 0.5 - Math.cos(u * Math.PI) / 2,
  back: u => { const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); },
  elastic: u => u === 0 || u === 1 ? u : Math.pow(2, -10 * u) * Math.sin((u * 10 - 0.75) * 2.094) + 1,
};
// keyframes: [[t, v, easeName?], ...]
function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (t <= k[0]) {
      const p0 = keys[i - 1];
      const u = (t - p0[0]) / (k[0] - p0[0] || 1);
      return lerp(p0[1], k[1], (ease[k[2] || 'io'])(u));
    }
  }
  return keys[keys.length - 1][1];
}
const win = (t, a, b) => t >= a && t < b;
const prog = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
// 0 -> 1 -> 0 over a window, with soft edges (for poses that blend in and out)
function ramp(t, a, b, r) { r = r || 0.14; return t <= a - r || t >= b + r ? 0 : t < a ? ease.sine((t - a + r) / r) : t > b ? ease.sine((b + r - t) / r) : 1; }
function rnd(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123; return x - Math.floor(x); }
// a parabolic hop, negative = up
function hop(t, t0, dur, h) { const u = (t - t0) / dur; return u > 0 && u < 1 ? -h * 4 * u * (1 - u) : 0; }
function hops(t, list) { let y = 0; for (const [t0, d, h] of list) y += hop(t, t0, d, h); return y; }
// hops with anticipation, stretch in the air and squash on landing: {y, sq:[sx, sy]}
function jump(t, list) {
  let y = 0, sx = 1, sy = 1;
  for (const [t0, d, h] of list) {
    const u = (t - t0) / d, k = Math.min(1, h / 5);
    if (u > 0 && u < 1) { y -= h * 4 * u * (1 - u); const st = 0.14 * Math.abs(1 - 2 * u) * k; sy *= 1 + st; sx *= 1 - st * 0.5; }
    const a = t0 - t; if (a > 0 && a < 0.09) { const q = Math.sin(a / 0.09 * Math.PI) * 0.13 * k; sy *= 1 - q; sx *= 1 + q * 0.8; }
    const l = t - (t0 + d); if (l > 0 && l < 0.16) { const q = Math.sin(l / 0.16 * Math.PI) * 0.18 * k; sy *= 1 - q; sx *= 1 + q * 0.8; }
  }
  return { y, sq: [sx, sy] };
}
// AMB is the real playback clock: blinking, breathing, clouds, fire and flags keep moving during reading pauses
let AMB = 0, NOBLINK = false;
function blinkAmt(seed) {
  if (NOBLINK) return 0;
  const per = 2.6 + rnd(seed) * 1.9, ph = (AMB + rnd(seed + 9) * 3) % per;
  return ph < 0.17 ? Math.sin(ph / 0.17 * Math.PI) : 0;
}
// who is talking right now (filled each frame from the scene's lines)
const TALK = {};

// ---------- colour ----------
const shadeCache = {};
function shade(hex, f) {
  const key = hex + f;
  if (shadeCache[key]) return shadeCache[key];
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (f > 0) { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
  else { r *= 1 + f; g *= 1 + f; b *= 1 + f * 0.85; }
  const h = '#' + [r, g, b].map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  return (shadeCache[key] = h);
}
const lite = c => shade(c, 0.2), dark = c => shade(c, -0.24);
function mixHex(a, b, u) {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = s => Math.round(lerp((A >> s) & 255, (B >> s) & 255, u));
  return '#' + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, '0')).join('');
}

// ---------- camera ----------
const cam = { x: 0, y: 0, s: 3, ox: 0, oy: 0 };
let camLock = null; // re-frames a scene inside the closing photo
function setCam(x, y, s, shk) {
  if (camLock) { x = camLock.x; y = camLock.y; s = camLock.s; }
  cam.s = s; cam.x = x; cam.y = y;
  cam.ox = (camLock ? camLock.ox : 0) + (shk ? shk[0] : 0);
  cam.oy = (camLock ? camLock.oy : 0) + (shk ? shk[1] : 0);
}
// centre-based camera
function camAt(cx, cy, s, shk) { setCam(cx - VW / (2 * s), cy - VH / (2 * s), s, shk); }
// keyframed camera: [[t, cx, cy, s, ease?], ...]
function camKF(t, keys, shk) {
  const pick = i => keys.map(k => [k[0], k[i], k[4]]);
  camAt(kf(t, pick(1)), kf(t, pick(2)), kf(t, pick(3)), shk);
}
function shakeAt(t, list) {
  let x = 0, y = 0;
  list.forEach(([t0, m, d], i) => {
    const a = t - t0;
    if (a >= 0 && a < d) {
      const amp = m * Math.pow(1 - a / d, 2);
      x += Math.sin(a * 71 + i) * amp; y += Math.cos(a * 53 + i * 3) * amp;
    }
  });
  return [x, y];
}
// world -> virtual px
const sx = x => (x - cam.x) * cam.s + cam.ox;
const sy = y => (y - cam.y) * cam.s + cam.oy;
// world-space rect, rounded to device pixels
function R(x, y, w, h, c) {
  const X = Math.round(sx(x) * K), Y = Math.round(sy(y) * K);
  const W = Math.round(sx(x + w) * K) - X, H = Math.round(sy(y + h) * K) - Y;
  if (W <= 0 || H <= 0) return;
  ctx.fillStyle = c; ctx.fillRect(X, Y, W, H);
}
// screen-space rect (virtual px)
function S(x, y, w, h, c) {
  const X = Math.round(x * K), Y = Math.round(y * K);
  const W = Math.round((x + w) * K) - X, H = Math.round((y + h) * K) - Y;
  if (W <= 0 || H <= 0) return;
  ctx.fillStyle = c; ctx.fillRect(X, Y, W, H);
}
// draw a 1px-per-unit canvas into the world
function img(cv, x, y, w, h) {
  const X = Math.round(sx(x) * K), Y = Math.round(sy(y) * K);
  ctx.drawImage(cv, X, Y, Math.round(sx(x + (w || cv.width)) * K) - X, Math.round(sy(y + (h || cv.height)) * K) - Y);
}
// a smooth stroked line in world units
function wline(x0, y0, x1, y1, wd, col) {
  ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, wd * cam.s * K); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(sx(x0) * K, sy(y0) * K); ctx.lineTo(sx(x1) * K, sy(y1) * K); ctx.stroke();
}
// rotate whatever fn draws around a world point
function spin(cx, cy, ang, fn) {
  if (!ang) { fn(); return; }
  const px = sx(cx) * K, py = sy(cy) * K;
  ctx.save(); ctx.translate(px, py); ctx.rotate(ang); ctx.translate(-px, -py);
  ctx.imageSmoothingEnabled = false;
  fn();
  ctx.restore();
}
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

// ---------- sprite-local drawing (origin at the feet, y up is negative) ----------
let SPX = 0, SPY = 0, SPF = 1, SSX = 1, SSY = 1;
function at(x, y, flip, scx, scy) { SPX = x; SPY = y; SPF = flip ? -1 : 1; SSX = scx || 1; SSY = scy || 1; }
function p(x, y, w, h, c) { if (SPF < 0) x = -x - w; R(SPX + x * SSX, SPY + y * SSY, w * SSX, h * SSY, c); }
// A cube seen from the front, a little from above and from the right (Minecraft-style 2.5D).
// (x, y, w, h) is the front face; d is its depth. The top face rises above, the side face runs to the right,
// both in steps of one unit. Faces stay on the right even when the sprite is mirrored.
function cube(x, y, w, h, d, c, top, side) {
  const fx = SPF < 0 ? -x - w : x, n = Math.round(d / 2);
  const T = top || lite(c), Sd = side || dark(c);
  for (let j = 0; j < n; j++) R(SPX + (fx + w + j) * SSX, SPY + (y - j - 1) * SSY, SSX, h * SSY, Sd);
  for (let i = 0; i < n; i++) R(SPX + (fx + i + 1) * SSX, SPY + (y - i - 1) * SSY, w * SSX, SSY, T);
  R(SPX + fx * SSX, SPY + y * SSY, w * SSX, h * SSY, c);
}
// continue a front-face row (a stripe, a belt, a glasses band) around the side face of a cube
function wrapRow(x, w, row, d, c) {
  const fx = SPF < 0 ? -x - w : x, n = Math.round(d / 2);
  for (let j = 0; j < n; j++) R(SPX + (fx + w + j) * SSX, SPY + (row - j - 1) * SSY, SSX, SSY, c);
}
// soft ellipse shadow on the grass under a critter
function groundShadow(x, y, hw, lift) {
  const k = clamp(1 + (lift || 0) / 30, 0.45, 1), w = hw * k;
  ctx.globalAlpha = 0.2 * k;
  for (let i = 0; i < 3; i++) { const f = Math.sqrt(1 - Math.pow((i - 1) / 1.6, 2)); R(x - w * f + 1.5, y - 1 + i, w * 2 * f, 1, '#2A3A1A'); }
  ctx.globalAlpha = 1;
}
// a filled circle in world units
function disc(cx, cy, r, col) {
  for (let i = -r; i < r; i += 1) { const v = (i + 0.5) / r, hw = r * Math.sqrt(Math.max(0, 1 - v * v)); if (hw > 0.2) R(cx - hw, cy + i, hw * 2, 1, col); }
}

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
    const rows = src[ch].split('|'), runs = [];
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
// screen-space text, top-left anchored (virtual px)
function text(str, x, y, sc, col, shadowCol, f) {
  f = f || F5;
  x = Math.round(x); y = Math.round(y);
  if (shadowCol) text(str, x + sc, y + sc, sc, shadowCol, null, f);
  ctx.fillStyle = col;
  for (const ch of str) {
    if (ch === ' ') { x += ((f === F5 ? 3 : 2) + 1) * sc; continue; }
    const g = glyph(f, ch);
    for (const [c, r, n] of g.runs) ctx.fillRect(Math.round((x + c * sc) * K), Math.round((y + r * sc) * K), Math.round(n * sc * K), Math.round(sc * K));
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
// pixel-cornered boxes (screen space)
function rbox(x, y, w, h, c) { S(x + 2, y, w - 4, h, c); S(x, y + 2, w, h - 4, c); S(x + 1, y + 1, w - 2, h - 2, c); }
