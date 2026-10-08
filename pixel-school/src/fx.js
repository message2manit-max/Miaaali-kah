/* ---- effects (dust, sparkles, stars, confetti, toasts) and the speech-bubble layer ---- */
function dust(x, y, age, seed, n, spread, col) {
  if (age < 0 || age > 0.7) return;
  n = n || 6; spread = spread || 10;
  for (let i = 0; i < n; i++) {
    const dir = rnd(seed + i) * 2 - 1, sp = 0.6 + rnd(seed + i + 40) * 0.8, u = age / 0.7;
    const px = x + dir * spread * sp * ease.out(Math.min(1, age * 2.5)), py = y - 1 - age * 10 * sp * (0.4 + rnd(seed + i + 9) * 0.6);
    const sz = 2.6 * (1 - u) * (0.6 + rnd(seed + i + 3) * 0.6);
    if (sz > 0.3) { ctx.globalAlpha = 0.9 * (1 - u * 0.5); disc(px, py, sz, col || '#F1EADF'); ctx.globalAlpha = 1; }
  }
}
// tiny cubes bursting out (blocks landing, lids slamming)
function crumbs(x, y, age, seed, n, col) {
  if (age < 0 || age > 0.55) return;
  for (let i = 0; i < (n || 6); i++) {
    const a = rnd(seed + i) * Math.PI, sp = 8 + rnd(seed + i + 7) * 10, u = age / 0.55;
    const px = x + Math.cos(a) * sp * u * (rnd(seed + i + 3) > 0.5 ? 1 : -1), py = y - Math.sin(a) * sp * u + 30 * u * u;
    const s = 1.8 * (1 - u * 0.6);
    at(px, py); cube(0, 0, s, s, 2, col || '#C9B48A');
  }
}
function sparkle(x, y, age, size, col) {
  if (age < 0 || age > 0.6) return;
  const L = Math.sin(age / 0.6 * Math.PI) * (size || 3);
  col = col || C.sparkle;
  R(x, y - L, 1, L * 2 + 1, col); R(x - L, y, L * 2 + 1, 1, col); R(x, y, 1, 1, C.white);
}
function twinkles(x, y, t, t0, n, rad) {
  for (let i = 0; i < (n || 3); i++) sparkle(x + (rnd(i + t0 * 7) * 2 - 1) * (rad || 8), y + (rnd(i + 5 + t0 * 3) * 2 - 1) * (rad || 8) * 0.6, t - t0 - i * 0.12, 3);
}
function speedLines(x, y, dir, t, h) {
  h = h || 12;
  for (let i = 0; i < 5; i++) {
    const ph = (AMB * 9 + i * 0.37) % 1, len = 8 + rnd(i * 7) * 14;
    const yy = y - 2 - i * h / 5;
    ctx.globalAlpha = 0.85 * (1 - ph);
    R(dir > 0 ? x - 9 - len - ph * 10 : x + 9 + ph * 10, yy, len, 0.8, '#FFFFFF');
    ctx.globalAlpha = 1;
  }
}
function starsAround(x, y, off) {
  for (let i = 0; i < 3; i++) {
    const a = (AMB + (off || 0)) * 6 + i * 2.094;
    const px = x + Math.cos(a) * 10, py = y + Math.sin(a) * 2.8;
    R(px - 1, py, 3, 1, '#FFD94A'); R(px, py - 1, 1, 3, '#FFD94A'); R(px, py, 1, 1, C.white);
  }
}
function bulb(x, y, age) {
  if (age < 0) return;
  const s = age < 0.18 ? ease.back(age / 0.18) : 1, on = age > 0.06;
  at(x, y - (1 - s) * 4, false, s, s);
  const c = on ? '#FFE45C' : '#EDE7C9';
  cube(-3, -9, 6, 6, 4, c, '#FFF3A0', '#E2C43A'); p(-2, -10, 4, 1, c); p(-2, -3, 4, 1, c);
  cube(-2, -2, 4, 2, 4, '#9AA0A6'); p(-2, -8, 1, 2, C.white);
  if (on) {
    const k = 0.6 + 0.4 * Math.sin(AMB * 20);
    ctx.globalAlpha = k;
    p(-8, -7, 3, 1, '#FFE45C'); p(5, -7, 3, 1, '#FFE45C'); p(-6, -13, 1, 3, '#FFE45C'); p(5, -13, 1, 3, '#FFE45C'); p(0, -15, 1, 3, '#FFE45C');
    ctx.globalAlpha = 1;
  }
}
function mark(x, y, ch, age, col) { // ! or ? popping above a head
  const s = age == null ? 1 : age < 0.15 ? ease.back(age / 0.15) : 1;
  at(x, y, false, s, s);
  col = col || '#E04B3A';
  if (ch === '!') { cube(0, -7, 2, 5, 2, col); cube(0, -1, 2, 2, 2, col); }
  else { p(-1, -8, 4, 1, col); p(2, -7, 1, 2, col); p(0, -5, 2, 1, col); p(0, -4, 2, 1, col); p(0, -1, 2, 2, col); }
}
function sweat(x, y, age) { const d = ((age || AMB) * 1.4) % 1; R(x, y + d * 4, 2, 3, '#8FD3F4'); R(x + 0.5, y - 1 + d * 4, 1, 1, '#8FD3F4'); R(x, y + d * 4, 1, 1, C.white); }
function soundArcs(x, y, age) {
  for (let k = 0; k < 3; k++) {
    const r = ((age * 26 + k * 7) % 21) + 6, fade = 1 - (r - 6) / 21;
    ctx.globalAlpha = fade;
    for (let a = -0.9; a <= 0.9; a += 0.12) {
      R(x - Math.cos(a) * r - 1, y + Math.sin(a) * r, 1, 1, '#FFFFFF');
      R(x + Math.cos(a) * r, y + Math.sin(a) * r, 1, 1, '#FFFFFF');
    }
    ctx.globalAlpha = 1;
  }
}
function fightCloud(x, y, t) {
  const puffs = [];
  for (let i = 0; i < 9; i++) {
    const a = AMB * (5 + i) + i * 1.7;
    puffs.push([Math.cos(a) * 10 * (0.6 + rnd(i) * 0.5), Math.sin(a * 1.3) * 5, 5 + rnd(i + 3) * 4 + Math.sin(AMB * 14 + i) * 0.8]);
  }
  for (const [ox, oy, r] of puffs) disc(x + ox, y + oy, r + 1, '#B9AD99');
  for (const [ox, oy, r] of puffs) disc(x + ox, y + oy, r, '#F1EADF');
  for (const [ox, oy, r] of puffs) disc(x + ox - 1, y + oy - 1, Math.max(1, r - 3), '#FFFFFF');
  for (let i = 0; i < 4; i++) {
    const a = AMB * 9 + i * 1.6, ox = Math.cos(a) * 15, oy = Math.sin(a * 1.4) * 7;
    if (i < 2) { at(x + ox, y + oy); cube(0, 0, 2, 2, 2, C.skin); }
    else { R(x + ox - 1, y + oy, 3, 1, '#FFD94A'); R(x + ox, y + oy - 1, 1, 3, '#FFD94A'); }
  }
  const hats = [HAT.W[0], HAT.Y[0], HAT.B[0]];
  for (let i = 0; i < 3; i++) {
    const a = AMB * 7 + i * 2.1, ox = Math.cos(a) * 12, oy = Math.sin(a * 1.2) * 6 - 4;
    at(x + ox, y + oy); cube(-3, 0, 6, 1, 6, hats[i]);
  }
  const sym = ['#@$%!', '%!#@$', '$#!@%'][Math.floor(AMB * 6) % 3];
  textC(sym, sx(x), sy(y - 18), 2, '#1F1E1D');
}
function breakpoint(x, y) { // a debugger-red ring around the bug
  const r = 7 + Math.sin(AMB * 8) * 0.8;
  for (let a = 0; a < 6.283; a += 0.18) R(x + Math.cos(a) * r - 0.5, y + Math.sin(a) * r * 0.8 - 0.5, 1, 1, '#E04B3A');
}
// falling cube confetti (screen space)
function confetti(t, n) {
  const cols = ['#D97757', '#F2B632', '#4569CC', '#3DAA5C', '#EE6FA8', '#FFFFFF', '#9A5BD0'];
  for (let i = 0; i < (n || 90); i++) {
    const delay = rnd(i + 900) * 0.8, tt = t - delay;
    if (tt < 0) continue;
    const x = rnd(i) * VW + Math.sin(tt * 3 + i) * 14;
    const y = -20 + tt * (110 + rnd(i + 3) * 90);
    if (y > VH + 10) continue;
    const w = 6 * Math.abs(Math.cos(tt * 6 + i)), c = cols[i % cols.length];
    S(x, y, Math.max(1.5, w), 5, c);
    if (w > 3) S(x + w, y - 1, 1.5, 5, shade(c, -0.3));
  }
}
// green XP orbs drifting up (screen space around a world point)
function xpOrbs(x, y, age) {
  if (age < 0 || age > 2.2) return;
  for (let i = 0; i < 10; i++) {
    const d = age - i * 0.08;
    if (d < 0) continue;
    const u = d / 2;
    const px = x + Math.sin(d * 5 + i) * (6 + i), py = y - d * 18 - i * 2;
    const s = 1.4 + Math.sin(AMB * 12 + i) * 0.4;
    ctx.globalAlpha = clamp(1 - u, 0, 1);
    disc(px, py, s + 0.8, '#C7F25A'); disc(px, py, s, '#7EDB3A');
    ctx.globalAlpha = 1;
  }
}
// a "milestone" toast sliding in at the top right (screen space)
function toast(title, sub, age, icon) {
  if (age < 0 || age > 3.2) return;
  const inU = ease.out(clamp(age / 0.35, 0, 1)), outU = ease.in(clamp((age - 2.75) / 0.4, 0, 1));
  const w = 300, h = 64, x = VW - w - 16, y = 14 - (1 - inU) * 90 - outU * 90;
  rbox(x + 4, y + 4, w, h, 'rgba(0,0,0,0.25)');
  rbox(x, y, w, h, '#1E1B2E'); rbox(x + 3, y + 3, w - 6, h - 6, '#2C2843');
  S(x + 12, y + 12, 40, 40, '#3B3656');
  if (icon) icon(x + 32, y + 32);
  text(title, x + 64, y + 15, 2, '#FFE45C');
  text(sub, x + 64, y + 37, 2, '#FFFFFF');
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
function lineCps(ln) { return ln.cps || VOICE_CPS[ln[2]] || 34; }
// a bubble: [start, end, speaker, text] plus optional {think, max, cps, dx, dy, noHold, silent}
function L(t0, t1, who, str, o) { return Object.assign([t0, t1, who, str], o || {}); }
function typedEnd(ln) { return ln[0] + 0.1 + ln[3].length / lineCps(ln); }
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
  if (think) w += 22;
  const axv = sx(anc[0]), ayv = sy(anc[1]);
  const float = Math.sin(AMB * 3 + t0) * 1.5;
  let bxv = Math.round(axv - w / 2 + (ln.dx || 0)), byv = Math.round(ayv - 18 - h + (ln.dy || 0) + float);
  bxv = clamp(bxv, 10, VW - 10 - w); byv = clamp(byv, 10, VH - 10 - h);
  const pin = clamp(a / 0.16, 0, 1), pout = clamp(left / 0.12, 0, 1), sc = Math.min(ease.back(pin), ease.out(pout));
  const cw = Math.max(8, w * (0.4 + 0.6 * sc)), ch = Math.max(8, h * (0.4 + 0.6 * sc));
  const cx = bxv + (w - cw) / 2, cy = byv + (h - ch) / 2 + (1 - sc) * 10;
  const line = '#1F1E1D', fill = '#FFFFFF';
  const tx = clamp(axv, bxv + 18, bxv + w - 18);
  if (!think) {
    for (let i = 0; i < 9; i++) {
      const hw = Math.max(1, 9 - i) * sc, lean = (axv - tx) * i / 14;
      S(tx - hw - 2 + lean, cy + ch - 3 + i, hw * 2 + 4, 1, line);
      if (i < 7) S(tx - hw + 1 + lean, cy + ch - 3 + i, Math.max(0, hw * 2 - 2), 1, fill);
    }
  } else {
    rbox(axv - 10, ayv - 18 + float, 9, 8, line); rbox(axv - 8, ayv - 16 + float, 5, 4, fill);
    rbox(axv - 4, ayv - 30 + float, 12, 10, line); rbox(axv - 2, ayv - 28 + float, 8, 6, fill);
  }
  rbox(cx + 4, cy + 4, cw, ch, 'rgba(31,30,29,0.2)');
  rbox(cx, cy, cw, ch, line);
  rbox(cx + 3, cy + 3, cw - 6, ch - 6, fill);
  if (!think) S(tx - 7 + (axv - tx) / 14, cy + ch - 3, 14, 3, fill);
  if (sc < 0.9) return;
  S(cx + 3, cy + 3, 4, ch - 6, VOICE_COL[who] || line);
  let shown = Math.floor(a * lineCps(ln));
  const tx0 = cx + BUB.padX + (think ? 22 : 0) + 2;
  let ty0 = cy + BUB.padY;
  if (think) {
    const f = AMB * 10;
    for (let i = 0; i < 8; i++) {
      const an = i / 8 * Math.PI * 2, d = ((f - i) % 8 + 8) % 8;
      const col = d < 1 ? '#D97757' : d < 2 ? '#E8A386' : '#E9E3D8';
      S(cx + 18 + Math.cos(an) * 6 - 2, cy + ch / 2 + Math.sin(an) * 6 - 2, 4, 4, col);
    }
  }
  for (const l of lines) {
    if (shown <= 0) break;
    text(l.slice(0, shown), tx0, ty0, BUB.sc, '#1F1E1D');
    shown -= l.length + 1;
    ty0 += BUB.lh;
  }
}
function drawBubbles(t, lines) { for (const ln of lines || []) drawBubble(ln, t); }

// ---------- transitions: an iris of tumbling blocks ----------
function blockWipe(u, cover, col) {
  const cs = 48, cols = Math.ceil(VW / cs), rows = Math.ceil(VH / cs);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const th = (c + r) / (cols + rows) * 0.7 + rnd(c * 31 + r * 17) * 0.3;
    const kk = cover ? clamp((u - th) * 6, 0, 1) : clamp(1 - (u - th) * 6, 0, 1);
    if (kk <= 0) continue;
    const s = cs * ease.out(kk), x = c * cs + (cs - s) / 2, y = r * cs + (cs - s) / 2;
    S(x, y, s, s, col || '#2A2420');
    if (s > 10) S(x, y, s, 3, shade(col || '#2A2420', 0.15));
  }
}
