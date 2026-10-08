/* ---- effects (dust, sparkles, stars, confetti) and the speech-bubble layer ---- */
function dust(x, y, age, seed, n, spread, col) {
  if (age < 0 || age > 0.7) return;
  n = n || 6; spread = spread || 10;
  for (let i = 0; i < n; i++) {
    const dir = rnd(seed + i) * 2 - 1, sp = 0.6 + rnd(seed + i + 40) * 0.8;
    const px = x + dir * spread * sp * Math.min(1, age * 3), py = y - 1 - age * 10 * sp * (0.4 + rnd(seed + i + 9) * 0.6);
    const sz = Math.round(2.4 * (1 - age / 0.7) * (0.6 + rnd(seed + i + 3) * 0.6));
    if (sz > 0) disc(Math.round(px), Math.round(py), sz, col || '#EFE7DA');
  }
}
function sparkle(x, y, age, size, col) {
  if (age < 0 || age > 0.6) return;
  const L = Math.round(Math.sin(age / 0.6 * Math.PI) * (size || 3));
  col = col || C.sparkle;
  R(x, y - L, 1, L * 2 + 1, col); R(x - L, y, L * 2 + 1, 1, col); R(x, y, 1, 1, C.white);
}
function twinkles(x, y, t, t0, n, rad) {
  for (let i = 0; i < (n || 3); i++) sparkle(x + Math.round((rnd(i + t0 * 7) * 2 - 1) * (rad || 8)), y + Math.round((rnd(i + 5 + t0 * 3) * 2 - 1) * (rad || 8) * 0.6), t - t0 - i * 0.12, 3);
}
function speedLines(x, y, dir, t, h) {
  h = h || 12;
  for (let i = 0; i < 4; i++) {
    const len = 10 + Math.round(rnd(i + Math.floor(t * 20)) * 14);
    const yy = y - 2 - Math.round(i * h / 4) - 1;
    R(dir > 0 ? x - 8 - len : x + 8, yy, len, 1, i % 2 ? '#FFFFFF' : '#F5F1E8');
  }
}
function starsAround(x, y, off) {
  for (let i = 0; i < 3; i++) {
    const a = (AMB + (off || 0)) * 6 + i * 2.094;
    const px = x + Math.round(Math.cos(a) * 9), py = y + Math.round(Math.sin(a) * 2.5);
    R(px - 1, py, 3, 1, '#FFD94A'); R(px, py - 1, 1, 3, '#FFD94A'); R(px, py, 1, 1, C.white);
  }
}
function bulb(x, y, age) {
  if (age < 0) return;
  const on = age > 0.05;
  at(x, y);
  p(-3, -9, 6, 6, on ? '#FFE45C' : '#EDE7C9'); p(-2, -10, 4, 1, on ? '#FFE45C' : '#EDE7C9'); p(-2, -3, 4, 1, on ? '#FFE45C' : '#EDE7C9');
  p(-2, -2, 4, 2, '#9AA0A6'); p(-2, -1, 4, 1, '#6E747C'); p(-2, -8, 1, 2, C.white);
  if (on && Math.floor(AMB * 8) % 2 === 0) { p(-7, -7, 2, 1, '#FFE45C'); p(5, -7, 2, 1, '#FFE45C'); p(-6, -12, 1, 2, '#FFE45C'); p(5, -12, 1, 2, '#FFE45C'); p(0, -14, 1, 2, '#FFE45C'); }
}
function mark(x, y, ch, col) { // ! or ? floating above a head
  at(x, y);
  col = col || '#E04B3A';
  if (ch === '!') { p(0, -7, 2, 5, col); p(0, -1, 2, 2, col); }
  else { p(-1, -8, 4, 1, col); p(2, -7, 1, 2, col); p(0, -5, 2, 1, col); p(0, -4, 2, 1, col); p(0, -1, 2, 2, col); }
}
function sweat(x, y) { R(x, y, 2, 3, '#8FD3F4'); R(x + 0.5, y - 1, 1, 1, '#8FD3F4'); R(x, y, 1, 1, C.white); }
function soundArcs(x, y, age) {
  for (let k = 0; k < 3; k++) {
    const r = ((age * 26 + k * 7) % 21) + 6;
    for (let a = -0.9; a <= 0.9; a += 0.16) {
      R(x - Math.round(Math.cos(a) * r) - 1, y + Math.round(Math.sin(a) * r), 1, 1, '#FFFFFF');
      R(x + Math.round(Math.cos(a) * r), y + Math.round(Math.sin(a) * r), 1, 1, '#FFFFFF');
    }
  }
}
function fightCloud(x, y, t) {
  const f = Math.floor(t * 12);
  const puffs = [];
  for (let i = 0; i < 9; i++) puffs.push([Math.round((rnd(f * 9 + i) * 2 - 1) * 11), Math.round((rnd(f * 9 + i + 50) * 2 - 1) * 5), 5 + Math.round(rnd(i + f) * 4)]);
  for (const [ox, oy, r] of puffs) disc(x + ox, y + oy, r + 1, '#B9AD99');
  for (const [ox, oy, r] of puffs) disc(x + ox, y + oy, r, '#F1EADF');
  for (const [ox, oy, r] of puffs) disc(x + ox - 1, y + oy - 1, Math.max(1, r - 3), '#FFFFFF');
  for (let i = 0; i < 4; i++) {
    const ox = Math.round((rnd(f * 5 + i + 7) * 2 - 1) * 15), oy = Math.round((rnd(f * 5 + i + 77) * 2 - 1) * 7);
    if (i < 2) R(x + ox, y + oy, 2, 2, C.skin);
    else { R(x + ox - 1, y + oy, 3, 1, '#FFD94A'); R(x + ox, y + oy - 1, 1, 3, '#FFD94A'); }
  }
  const hats = [HAT.W[0], HAT.Y[0], HAT.B[0]];
  for (let i = 0; i < 3; i++) {
    const ox = Math.round((rnd(f * 3 + i + 300) * 2 - 1) * 12), oy = Math.round((rnd(f * 3 + i + 400) * 2 - 1) * 6) - 4;
    R(x + ox - 3, y + oy, 6, 2, hats[i]);
  }
  // comic-strip cursing
  const sym = ['#@$%!', '%!#@$', '$#!@%'][Math.floor(t * 6) % 3];
  textC(sym, sx(x), sy(y - 18), 2, '#1F1E1D');
}
function breakpoint(x, y, t) { // a debugger-red ring around the bug
  const r = 7 + (Math.floor(AMB * 6) & 1);
  for (let a = 0; a < 6.283; a += 0.22) R(x + Math.round(Math.cos(a) * r) - 0.5, y + Math.round(Math.sin(a) * r * 0.8) - 0.5, 1, 1, '#E04B3A');
}
function confetti(t, n) {
  const cols = ['#D97757', '#F2B632', '#4569CC', '#3DAA5C', '#EE6FA8', '#FFFFFF', '#9A5BD0'];
  for (let i = 0; i < (n || 90); i++) {
    const delay = rnd(i + 900) * 0.8, tt = t - delay;
    if (tt < 0) continue;
    const x = rnd(i) * VW + Math.sin(tt * 3 + i) * 14;
    const y = -20 + tt * (110 + rnd(i + 3) * 90);
    if (y > VH + 10) continue;
    const flip = Math.floor(tt * 8 + i) % 2;
    S(x, y, flip ? 6 : 3, flip ? 4 : 6, cols[i % cols.length]);
  }
}

// ---------- speech bubbles (screen space) ----------
const BUB = { sc: 2, adv: 12, lh: 18, padX: 12, padY: 10, maxChars: 24 };
const wrapCache = {};
function wrapText(str, maxChars) {
  const key = str + '|' + maxChars;
  if (wrapCache[key]) return wrapCache[key];
  const words = str.split(' '), lines = [];
  let cur = '';
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return (wrapCache[key] = lines);
}
const VOICE_CPS = { opus: 34, sonnet: 34, hW: 48, hY: 48, hB: 48, kid: 34 };
const VOICE_COL = { opus: '#6E5340', sonnet: '#C8452F', hW: '#8F897C', hY: '#D0921A', hB: '#2F4E9F', kid: '#E24B4B' };
function lineCps(ln) { return ln.cps || VOICE_CPS[ln[2]] || 24; }
// a bubble: [start, end, speaker, text] plus optional {think, max, cps, dx, dy}
function L(t0, t1, who, str, o) { return Object.assign([t0, t1, who, str], o || {}); }
function drawBubble(ln, t) {
  const [t0, t1, who, str] = ln;
  const a = t - t0, left = t1 - t;
  if (a < 0 || left <= 0) return;
  const anc = A[who];
  if (!anc) return;
  const think = ln.think;
  const lines = wrapText(str, ln.max || BUB.maxChars);
  const tw = Math.max(...lines.map(l => textW(l, BUB.sc)));
  let w = tw + BUB.padX * 2, h = lines.length * BUB.lh - 4 + BUB.padY * 2;
  if (think) { w += 22; }
  const axv = sx(anc[0]), ayv = sy(anc[1]);
  let bxv = Math.round(axv - w / 2 + (ln.dx || 0)), byv = Math.round(ayv - 16 - h + (ln.dy || 0));
  bxv = clamp(bxv, 10, VW - 10 - w); byv = clamp(byv, 10, VH - 10 - h);
  // pop in / out
  const pin = clamp(a / 0.1, 0, 1), pout = clamp(left / 0.1, 0, 1), sc = Math.min(ease.back(pin), pout);
  const cw = Math.max(8, Math.round(w * (0.5 + 0.5 * sc))), ch = Math.max(8, Math.round(h * (0.5 + 0.5 * sc)));
  const cx = bxv + Math.round((w - cw) / 2), cy = byv + Math.round((h - ch) / 2);
  const line = '#1F1E1D', fill = '#FFFFFF';
  // tail
  const tx = clamp(axv, bxv + 18, bxv + w - 18);
  if (!think) {
    for (let i = 0; i < 9; i++) {
      const hw = Math.max(1, 9 - i);
      const lean = Math.round((axv - tx) * i / 14);
      S(tx - hw - 2 + lean, cy + ch - 3 + i, hw * 2 + 4, 1, line);
      if (i < 7) S(tx - hw + 1 + lean, cy + ch - 3 + i, Math.max(0, hw * 2 - 2), 1, fill);
    }
  } else {
    rbox(axv - 10, ayv - 18, 9, 8, line); rbox(axv - 8, ayv - 16, 5, 4, fill);
    rbox(axv - 4, ayv - 30, 12, 10, line); rbox(axv - 2, ayv - 28, 8, 6, fill);
  }
  rbox(cx + 4, cy + 4, cw, ch, 'rgba(31,30,29,0.18)');
  rbox(cx, cy, cw, ch, line);
  rbox(cx + 3, cy + 3, cw - 6, ch - 6, fill);
  if (!think) S(tx - 7 + Math.round((axv - tx) / 14), cy + ch - 3, 14, 3, fill);
  if (sc < 1 && a < 0.1) return;
  // colored speaker tick
  S(cx + 3, cy + 3, 4, ch - 6, VOICE_COL[who] || line);
  // typewriter text
  let shown = Math.floor(a * lineCps(ln));
  let tx0 = cx + BUB.padX + (think ? 22 : 0) + 2, ty0 = cy + BUB.padY;
  if (think) {
    const f = Math.floor(t * 10) % 8;
    for (let i = 0; i < 8; i++) {
      const an = i / 8 * Math.PI * 2, r = 6;
      const col = i === f ? '#D97757' : (i === (f + 7) % 8 ? '#E8A386' : '#E9E3D8');
      S(cx + 18 + Math.round(Math.cos(an) * r) - 2, cy + ch / 2 + Math.round(Math.sin(an) * r) - 2, 4, 4, col);
    }
  }
  for (const l of lines) {
    if (shown <= 0) break;
    const part = l.slice(0, shown);
    text(part, tx0, ty0, BUB.sc, '#1F1E1D');
    shown -= l.length + 1;
    ty0 += BUB.lh;
  }
}
function drawBubbles(t, lines) { for (const ln of lines) drawBubble(ln, t); }

// ---------- transitions ----------
function blockWipe(u, cover, col) {
  const cs = 48, cols = Math.ceil(VW / cs), rows = Math.ceil(VH / cs);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const th = (c + r) / (cols + rows) * 0.75 + rnd(c * 31 + r * 17) * 0.25;
    if (cover ? u > th : u < th) S(c * cs, r * cs, cs, cs, col || '#2A2420');
  }
}
