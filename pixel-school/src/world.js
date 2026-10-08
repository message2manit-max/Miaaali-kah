/* ---- the world: sky through the day, voxel hills, a lawn of grass blocks, the school built from cubes, props ---- */
const G = 150;            // where the crew stands (feet line)
const LF = 157;           // front edge of the lawn: below it, the dirt side of the grass blocks
const LT = 108;           // far edge of the lawn, where the hills begin
const GS = 132;           // the school's front base line (it stands further back than the crew)
const BS = 8;             // block size
const SX = 124;           // school column 0 (left edge)
const bx = c => SX + c * BS;
const by = r => GS - (r + 1) * BS;

// ---------- block textures (8x8 fronts) and their cubes ----------
function tex(draw) { const c = mkCanvas(8, 8); const g = c.getContext('2d'); const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); }; draw(P); return c; }
const TEX = {
  stone: tex(P => {
    P(0, 0, 8, 8, '#8F918E');
    P(0, 0, 3, 3, '#A4A6A2'); P(4, 0, 4, 2, '#9C9E9A'); P(1, 4, 4, 3, '#A4A6A2'); P(6, 3, 2, 3, '#9C9E9A');
    P(3, 0, 1, 4, '#6F716E'); P(0, 3, 4, 1, '#6F716E'); P(5, 2, 3, 1, '#6F716E'); P(5, 2, 1, 6, '#6F716E'); P(0, 7, 5, 1, '#767875');
    P(1, 1, 1, 1, '#B9BBB7'); P(2, 5, 1, 1, '#B9BBB7'); P(6, 4, 1, 1, '#B4B6B2');
  }),
  brick: tex(P => {
    P(0, 0, 8, 8, '#CDB68C');
    P(0, 1, 3, 3, '#EAD6A6'); P(4, 1, 4, 3, '#E6D09E'); P(0, 5, 7, 3, '#E6D09E');
    P(0, 1, 3, 1, '#F5E7C4'); P(4, 1, 4, 1, '#F5E7C4'); P(0, 5, 7, 1, '#F5E7C4');
    P(0, 3, 3, 1, '#D9C08E'); P(4, 3, 4, 1, '#D9C08E'); P(0, 7, 7, 1, '#D9C08E');
  }),
  trim: tex(P => { P(0, 0, 8, 8, '#2F5878'); P(0, 0, 8, 1, '#4775A0'); P(0, 7, 8, 1, '#23445E'); P(3, 3, 1, 1, '#3A6890'); }),
  corn: tex(P => { P(0, 0, 8, 8, '#E9E3D5'); P(0, 0, 8, 1, '#F8F4EA'); P(0, 6, 8, 2, '#BDB4A1'); P(3, 2, 1, 4, '#D6CFBF'); P(7, 2, 1, 4, '#D6CFBF'); }),
  slate: tex(P => {
    P(0, 0, 8, 8, '#4E6884'); P(0, 0, 8, 1, '#6C86A3'); P(0, 3, 8, 1, '#3B526B'); P(0, 7, 8, 1, '#3B526B');
    P(3, 0, 1, 3, '#3B526B'); P(7, 4, 1, 3, '#3B526B'); P(0, 4, 3, 1, '#5F7A97'); P(4, 4, 3, 1, '#5F7A97');
  }),
  plank: tex(P => { P(0, 0, 8, 8, '#B98552'); P(0, 3, 8, 1, '#8A5C33'); P(0, 7, 8, 1, '#8A5C33'); P(3, 0, 1, 3, '#9E6C40'); P(6, 4, 1, 3, '#9E6C40'); P(1, 1, 2, 1, '#D29D68'); }),
  leaves: tex(P => {
    P(0, 0, 8, 8, '#4FA03A');
    [[0, 0], [3, 1], [6, 0], [1, 3], [5, 3], [2, 5], [7, 5], [0, 6], [4, 7]].forEach(([x, y]) => P(x, y, 1, 1, '#3B8430'));
    [[2, 0], [7, 2], [4, 4], [1, 6], [6, 6]].forEach(([x, y]) => P(x, y, 1, 1, '#6EC250'));
  }),
  log: tex(P => { P(0, 0, 8, 8, '#7A5232'); P(1, 0, 1, 8, '#5E3E24'); P(5, 0, 1, 8, '#5E3E24'); P(3, 2, 1, 3, '#94663F'); P(6, 5, 1, 2, '#94663F'); }),
};
// a cube sprite: front face plus a lit top and a shaded side, each n units deep, textures carried around
function makeCube(src, n, topF, sideF) {
  const W = 8 + n, H = 8 + n, c = mkCanvas(W, H), g = c.getContext('2d');
  const sd = src.getContext('2d').getImageData(0, 0, 8, 8).data;
  const out = g.createImageData(W, H), od = out.data;
  const put = (x, y, ux, uy, f) => {
    const si = (uy * 8 + ux) * 4, oi = (y * W + x) * 4;
    let r = sd[si], gg = sd[si + 1], b = sd[si + 2];
    if (f > 1) { const k = f - 1; r += (255 - r) * k; gg += (255 - gg) * k; b += (255 - b) * k; } else { r *= f; gg *= f; b *= f * 1.04; }
    od[oi] = r; od[oi + 1] = gg; od[oi + 2] = Math.min(255, b); od[oi + 3] = 255;
  };
  for (let j = 0; j < n; j++) for (let k = 0; k < 8; k++) put(8 + j, n - j - 1 + k, j % 8, k, sideF || 0.72);
  for (let i = 0; i < n; i++) for (let k = 0; k < 8; k++) put(i + 1 + k, n - 1 - i, k, (7 - i % 8), topF || 1.16);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) put(x, n + y, x, y, 1);
  g.putImageData(out, 0, 0);
  return c;
}
const CUBE = {}, CUBE_S = {};
function buildCubes() {
  for (const k in TEX) { CUBE[k] = makeCube(TEX[k], 8); CUBE_S[k] = makeCube(TEX[k], 4); }
}
// a block whose front face's top-left is (x, y)
function blockAt(x, y, t, small) { const cv = (small ? CUBE_S : CUBE)[t || 'brick'], n = cv.width - 8; img(cv, x, y - n, cv.width, cv.height); }

// ---------- time of day ----------
// tod: 0 morning, 0.35 noon, 0.65 afternoon, 0.9 golden hour
let TOD = 0.2;
const SKY = [
  [0.0, '#86BDEB', '#F7DCC0', '#FFF4E6'],
  [0.35, '#5EA7EA', '#CFEAF6', '#FFFFFF'],
  [0.65, '#69A6E2', '#F2E5C6', '#FFF3E2'],
  [0.9, '#5B79C4', '#FFB27A', '#FFD9B4'],
  [1.0, '#5470BC', '#FFA36E', '#FFD2A8'],
];
function todColors() {
  let i = 0; while (i < SKY.length - 2 && TOD > SKY[i + 1][0]) i++;
  const a = SKY[i], b = SKY[i + 1], u = clamp((TOD - a[0]) / (b[0] - a[0]), 0, 1);
  return { top: mixHex(a[1], b[1], u), hor: mixHex(a[2], b[2], u), tint: mixHex(a[3], b[3], u) };
}
function drawSky() {
  const c = todColors();
  const gr = ctx.createLinearGradient(0, 0, 0, VH * K);
  gr.addColorStop(0, c.top); gr.addColorStop(0.62, mixHex(c.top, c.hor, 0.55)); gr.addColorStop(1, c.hor);
  ctx.fillStyle = gr; ctx.fillRect(0, 0, VW * K, VH * K);
  // a square Minecraft-style sun travelling across the day
  const sxw = lerp(70, 340, TOD), syw = 54 - Math.sin(TOD * Math.PI) * 62;
  const ccx = cam.x + VW / (2 * cam.s), ccy = cam.y + VH / (2 * cam.s);
  const px = sx(sxw + (ccx - 200) * 0.9), py = sy(syw + (ccy - 80) * 0.9);
  const gr2 = 120 * K * (0.8 + TOD * 0.5);
  const glow = ctx.createRadialGradient(px * K, py * K, 0, px * K, py * K, gr2);
  glow.addColorStop(0, 'rgba(255,240,200,0.55)'); glow.addColorStop(1, 'rgba(255,240,200,0)');
  ctx.fillStyle = glow; ctx.fillRect(px * K - gr2, py * K - gr2, gr2 * 2, gr2 * 2);
  const s = 9 * cam.s, sun = TOD > 0.75 ? '#FFD27A' : '#FFF3B0';
  S(px - s, py - s, s * 2, s * 2, sun); S(px - s * 0.6, py - s * 0.6, s * 1.2, s * 1.2, '#FFFBE6');
}
// golden light over everything (applied after the world, before speech bubbles)
function drawTint(extra) {
  const c = todColors();
  if (c.tint === '#ffffff' && !extra) return;
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = c.tint; ctx.fillRect(0, 0, VW * K, VH * K);
  ctx.globalCompositeOperation = 'source-over';
  // soft vignette
  const v = ctx.createRadialGradient(VW * K / 2, VH * K / 2, VH * K * 0.45, VW * K / 2, VH * K / 2, VW * K * 0.62);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,12,4,0.22)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, VW * K, VH * K);
}

// ---------- background layers (pre-rendered at 1 px per unit, drawn with parallax) ----------
const LAYERS = {};
function layerCanvas(x0, y0, w, h, draw) {
  const c = mkCanvas(w, h), g = c.getContext('2d');
  const P = (x, y, ww, hh, col) => { g.fillStyle = col; g.fillRect(Math.round(x - x0), Math.round(y - y0), ww, hh); };
  draw(P, g);
  return { c, x0, y0 };
}
// a column of terrain: front face, lit top, shaded side, seen in the same 2.5D as the blocks
function terrainColumns(P, xs, w, baseY, heightFn, cols, depth) {
  const n = depth / 2;
  const list = [];
  for (let x = xs[0]; x < xs[1]; x += w) list.push([x, Math.round(heightFn(x) / 2) * 2]);
  for (const [x, h] of list) {
    const top = baseY - h;
    for (let j = 0; j < n; j++) P(x + w + j, top - j - 1, 1, h + 40, cols.side);
    for (let i = 0; i < n; i++) P(x + i + 1, top - i - 1, w, 1, cols.top);
    P(x, top, w, h + 40, cols.front);
    if (cols.cap) P(x, top, w, 2, cols.cap);
  }
}
function buildLayers() {
  // far mountains, hazy blue
  LAYERS.far = layerCanvas(-260, -20, 860, 160, P => {
    terrainColumns(P, [-260, 600], 16, 112, x => 26 + 16 * Math.sin(x * 0.019 + 0.6) + 9 * Math.sin(x * 0.047 + 2) + 5 * Math.sin(x * 0.11), { front: '#A9C6CF', top: '#C7DDE2', side: '#94B3BE', cap: '#E9F2F4' }, 12);
  });
  // rolling hills with little voxel trees and critter cottages
  LAYERS.mid = layerCanvas(-260, 30, 860, 120, (P, g) => {
    terrainColumns(P, [-260, 600], 8, 116, x => 10 + 7 * Math.sin(x * 0.035 + 1) + 4 * Math.sin(x * 0.09 + 3), { front: '#7DB86C', top: '#9ACF83', side: '#679F5B', cap: '#8CC678' }, 8);
    for (let i = 0; i < 30; i++) {
      const tx = -250 + i * 29 + Math.round(rnd(i) * 14);
      const h = Math.round((10 + 7 * Math.sin(tx * 0.035 + 1) + 4 * Math.sin(tx * 0.09 + 3)) / 2) * 2;
      const top = 116 - h - 2;
      if (i % 5 === 2) { // a tiny cottage
        P(tx, top - 6, 8, 6, '#E9D7B6'); P(tx + 8, top - 8, 2, 7, '#C9B593'); P(tx - 1, top - 8, 10, 2, '#B65C47'); P(tx + 1, top - 10, 8, 2, '#C46A54'); P(tx + 3, top - 3, 2, 3, '#7A5A3A'); P(tx + 6, top - 5, 1, 1, '#8FD0F0');
      } else {
        P(tx + 1, top - 3, 2, 3, '#6B4A2E');
        P(tx - 2, top - 9, 8, 6, '#4F9640'); P(tx - 1, top - 10, 8, 1, '#69B055'); P(tx + 6, top - 9, 1, 6, '#3F7C33');
      }
    }
  });
  // the lawn (top faces of grass blocks, seen at an angle) and the dirt front of the front row
  LAYERS.lawn = layerCanvas(-260, LT, 860, 110, (P, g) => {
    const w = 860, h = 110, img_ = g.createImageData(w, h), d = img_.data;
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      const X = xx - 260, Y = yy + LT, oi = (yy * w + xx) * 4;
      let r, gg, b;
      if (Y < LF) {
        const depth = LF - Y, row = Math.floor(depth / 4), col = Math.floor((X - depth) / 8);
        const tile = rnd(row * 131 + col * 17) * 0.07 - 0.035, sp = rnd(X * 13.1 + Y * 7.7);
        const far = clamp((LF - Y) / (LF - LT), 0, 1);
        r = 118; gg = 190; b = 72;
        const f = 1 + tile + (sp < 0.12 ? -0.1 : sp > 0.9 ? 0.08 : 0) - far * 0.06;
        r *= f; gg *= f; b *= f;
        r += far * 18; gg += far * 10; b += far * 30; // a little haze towards the back
        if ((X - depth) % 8 === 0 && depth % 4 !== 0) { r *= 0.96; gg *= 0.96; b *= 0.96; }
      } else {
        const fy = Y - LF, sp = rnd(X * 3.3 + Y * 11.9), tileN = rnd(Math.floor(X / 8) * 7 + Math.floor(fy / 8) * 13);
        const drip = fy < 3 || (fy < 5 && rnd(X * 1.7) < 0.5);
        if (drip) { r = 98; gg = 172; b = 60; if (fy === 0) { r = 128; gg = 200; b = 80; } }
        else { r = 139; gg = 93; b = 59; const f = 1 + (sp < 0.15 ? -0.16 : sp > 0.88 ? 0.12 : 0) + tileN * 0.05; r *= f; gg *= f; b *= f; if (sp > 0.985) { r = 156; gg = 148; b = 139; } }
      }
      d[oi] = r; d[oi + 1] = gg; d[oi + 2] = b; d[oi + 3] = 255;
    }
    g.putImageData(img_, 0, 0);
    // tall grass tufts and tiny flowers
    for (let i = 0; i < 260; i++) {
      const X = -250 + rnd(i * 3.1) * 840, Y = LT + 4 + rnd(i * 7.3) * (LF - LT - 6);
      if (X > 108 && X < 296 && Y < GS + 4) continue;
      const col = i % 9 === 0 ? ['#FFFFFF', '#FFD34E', '#F25C6E', '#B07BE0'][i % 4] : '#5FA83F';
      P(X, Y - 2, 1, 2, '#4E9636'); if (col !== '#5FA83F') P(X, Y - 3, 1, 1, col); else { P(X - 1, Y - 1, 1, 1, '#5FA83F'); P(X + 1, Y - 2, 1, 1, '#6FBA4A'); }
    }
  });
}
function drawLayer(L, f) {
  const ccx = cam.x + VW / (2 * cam.s), ccy = cam.y + VH / (2 * cam.s);
  const ox = (ccx - 200) * (1 - f), oy = (ccy - 80) * (1 - f) * 0.4;
  img(L.c, L.x0 + ox, L.y0 + oy, L.c.width, L.c.height);
}
// flat voxel clouds drifting by
const CLOUDS = [[-40, -6, 44], [90, 14, 30], [210, -14, 56], [330, 10, 36], [450, -2, 48], [560, 18, 28]];
function drawClouds() {
  const ccx = cam.x + VW / (2 * cam.s);
  CLOUDS.forEach(([x0, y, w], i) => {
    const x = ((x0 + AMB * (1.6 + i * 0.35) + 200) % 760) - 260 + (ccx - 200) * 0.75;
    at(x, y);
    const top = TOD > 0.8 ? '#FFE9D6' : '#FFFFFF', front = TOD > 0.8 ? '#F7D2BC' : '#EEF4F8';
    cube(0, 0, w, 4, 14, front, top, TOD > 0.8 ? '#E6B8A2' : '#D3E1EA');
    if (w > 34) cube(8, -3, w * 0.45, 3, 10, front, top, TOD > 0.8 ? '#E6B8A2' : '#D3E1EA');
  });
}
// the full backdrop: sky, sun, clouds, mountains, hills, lawn
function drawBackdrop() {
  drawSky();
  drawClouds();
  drawLayer(LAYERS.far, 0.25);
  drawLayer(LAYERS.mid, 0.55);
  drawLayer(LAYERS.lawn, 1);
}

// ---------- the school ----------
const WINDOWS = [ // [col, bottomRow, w, h]
  [1, 2, 2, 2], [4, 2, 2, 2], [13, 2, 2, 2], [16, 2, 2, 2],
  [1, 5, 2, 2], [4, 5, 2, 2], [8, 5, 3, 2], [13, 5, 2, 2], [16, 5, 2, 2],
];
const DOOR = [8, 1, 3, 3];
function inRect(c, r, [c0, r0, w, h]) { return c >= c0 && c < c0 + w && r >= r0 && r < r0 + h; }
const SCHOOL = { blocks: [], windows: [], door: {}, sign: {}, bell: {}, clock: {}, pole: {}, flag: {}, decor: {} };
function rectOf([c, r, w, h]) { return [bx(c), by(r + h - 1), w * BS, h * BS]; }
function drawPane(wd, T, lit) {
  const [x0, y, W0, H0] = rectOf(wd.rect), a = T - wd.t;
  if (a < 0) return;
  const x = x0 + 1, W = W0 - 1, H = H0 - 1; // leave a one-unit reveal on the left and below
  const sc = a < 0.16 ? ease.back(a / 0.16) : 1;
  const cw = W * sc, ch = H * sc, ox = x + (W - cw) / 2, oy = y + (H - ch) / 2;
  R(ox, oy, cw, ch, '#F3EEE3');
  R(ox + 1, oy + 1, cw - 2, ch - 2, lit ? mixHex('#7FC2E6', '#FFD98A', lit) : '#7FC2E6');
  if (sc < 1) return;
  if (lit) { ctx.globalAlpha = 0.35 * lit; R(x - 3, y - 3, W + 6, H + 6, '#FFD98A'); ctx.globalAlpha = 1; }
  R(x + 1, y + 1, 1, H - 2, '#5E9CC0'); R(x + 1, y + H - 2, W - 2, 1, '#A9DCF2');
  for (let i = 0; i < 5; i++) R(x + 3 + i, y + 2 + 4 - i, 1, 1, '#D8F3FC');
  const shine = ((AMB * 0.25 + wd.rect[0] * 0.07) % 1.6) - 0.3;
  if (shine > 0 && shine < 1) { const sx_ = x + 2 + shine * (W - 4); R(sx_, y + 2, 1, H - 4, 'rgba(255,255,255,0.55)'); }
  R(x + 1, y + Math.floor(H / 2), W - 2, 1, '#F3EEE3');
  for (let k = 1; k < wd.rect[2]; k++) R(x + k * BS, y + 1, 1, H - 2, '#F3EEE3');
  R(x - 1, y + H, W + 2, 1, '#F8F4EA'); R(x - 1, y + H + 1, W + 2, 1, '#BDB4A1');
}
function drawDoorPanel(T, open) {
  const d = SCHOOL.door;
  if (T < d.t0) return;
  const [x, y, W, H] = rectOf(DOOR);
  if (open) {
    R(x + 1, y, W - 1, H, '#2E2522');
    R(x + 1, y, 3, H, '#B8432F'); R(x + W - 3, y, 3, H, '#A23A28');
    return;
  }
  const painted = clamp((T - d.t0) / (d.t1 - d.t0), 0, 1), rows = H * painted;
  R(x + 1, y, W - 1, rows, '#C24B34');
  R(x + W / 2, y, 1, rows, '#8E3020');
  if (painted >= 1) {
    for (const px of [x + 3, x + W / 2 + 2]) { R(px, y + 3, W / 2 - 5, 7, '#A93E2A'); R(px, y + 13, W / 2 - 5, 8, '#A93E2A'); R(px + 1, y + 4, W / 2 - 7, 5, '#F2D6A8'); }
    R(x + W / 2 - 3, y + 12, 1, 2, C.gold); R(x + W / 2 + 2, y + 12, 1, 2, C.gold);
    R(x - 2, y - 2, W + 4, 2, '#E9E3D5');
  }
}
function drawSchool(T, o = {}) {
  schoolShadow(T, 21);
  for (const b of SCHOOL.blocks) placedBlock(b, T);
  schoolOpenings(T, o);
  schoolDetails(T, o);
}
function schoolShadow(T, cols, x0) {
  if (T < SCHOOL.blocks[0].t) return;
  ctx.globalAlpha = 0.18; R(x0 != null ? x0 : bx(-1), GS, cols * BS + 8, 3, '#1E3010'); ctx.globalAlpha = 1;
}
// a placed block drops the last few units into place
function placedBlock(b, T, frontOnly) {
  if (T < b.t) return;
  const a = T - b.t;
  const yOff = a < 0.12 ? -(1 - ease.out(a / 0.12)) * 5 : a < 0.24 ? Math.sin((a - 0.12) / 0.12 * Math.PI) * -0.8 : 0;
  if (frontOnly) img(TEX[b.tex], b.x, b.y + yOff, 8, 8); else blockAt(b.x, b.y + yOff, b.tex);
}
// recessed openings, panes and the door
function schoolOpenings(T, o, skip) {
  const S_ = SCHOOL;
  for (const wd of S_.windows) if (T < wd.t + 0.16 && !(skip && skip(wd.rect))) hole(wd.rect, T);
  if (!(skip && skip(DOOR))) hole(DOOR, T, '#2E2522');
  hole([8, 11, 3, 1], T);
  for (const wd of S_.windows) if (!(skip && skip(wd.rect))) drawPane(wd, T, o.lit);
  if (!(skip && skip(DOOR))) drawDoorPanel(T, o.doorOpen);
}
// the sign, the clock, the bell, the flag and the front step
function schoolDetails(T, o) {
  const S_ = SCHOOL;
  const sg = S_.sign;
  if (T >= sg.t0) {
    const str = '5.5 ACADEMY', x0 = Math.round(200 - wtextW(str) / 2);
    let x = x0, n = 0;
    for (const ch of str) {
      if (ch !== ' ') {
        const tt = sg.t0 + n * sg.dt;
        if (T >= tt) { const a = T - tt; const yo = a < 0.12 ? -3 * (1 - ease.out(a / 0.12)) : 0; wtext(ch, x, by(4) + 2 + yo, '#FFE9A8'); }
        n++;
      }
      x += ch === ' ' ? 3 : glyph(F3, ch).w + 1;
    }
  }
  const ck = S_.clock;
  if (T >= ck.t) {
    const cx = 200, cy = by(10) + 8, a = T - ck.t, sc = a < 0.18 ? ease.back(a / 0.18) : 1, rr = 7 * sc;
    disc(cx, cy, rr + 1, '#2F3A4A'); disc(cx, cy, rr, '#F7F3EA');
    if (sc >= 1) {
      for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; R(cx + Math.sin(an) * 5.2 - 0.5, cy - Math.cos(an) * 5.2 - 0.5, 1, 1, i % 3 === 0 ? '#2F3A4A' : '#B9B3A6'); }
      const mA = (T - ck.t) * 0.9, hA = -2.1 + (T - ck.t) * 0.075;
      wline(cx, cy, cx + Math.sin(mA) * 5, cy - Math.cos(mA) * 5, 0.8, '#C24B34');
      wline(cx, cy, cx + Math.sin(hA) * 3.2, cy - Math.cos(hA) * 3.2, 1, '#2F3A4A');
      R(cx - 0.5, cy - 0.5, 1, 1, '#2F3A4A');
    }
  }
  const bl = S_.bell;
  if (T >= bl.t) {
    const ang = o.bellSwing || 0, cx = 200, top = by(11) + 1;
    R(cx - 0.5, top - 1, 1, 2, '#2A2220');
    spin(cx, top, ang, () => {
      at(cx, top + 7);
      cube(-3, -6, 6, 4, 4, C.gold, '#FFE08A', C.goldD); cube(-4, -2, 8, 2, 4, C.gold, '#FFE08A', C.goldD);
      p(-2, -5, 1, 3, '#FFE9A8'); p(-0.5, 0, 1, 1, '#6E5A2A');
    });
  }
  const pl = S_.pole;
  if (T >= pl.t) {
    const base = by(15), top = base - 22;
    R(199.5, top, 1, base - top, '#D5D9DE'); R(200.5, top, 0.5, base - top, '#A9AEB5'); R(199, top - 2, 2, 2, C.gold);
    const fg = S_.flag;
    if (T >= fg.t0) {
      const u = ease.out(clamp((T - fg.t0) / (fg.t1 - fg.t0), 0, 1));
      const fy = lerp(base - 9, top, u), amp = 0.4 + 1.4 * u;
      for (let i = 0; i < 13; i++) {
        const wv = Math.sin(AMB * 7 - i * 0.7) * (i / 13) * amp;
        const shadeF = 0.92 + 0.08 * Math.cos(AMB * 7 - i * 0.7);
        R(200.5 + i, fy + wv, 1, 8, shade('#D97757', Math.round((shadeF - 1) * 50) / 50));
        const mid = fy + wv + 4;
        if (i === 6) R(200.5 + i, mid - 2, 1, 4, '#FFF6EC');
        if (i === 5 || i === 7) R(200.5 + i, mid - 1, 1, 2, '#FFF6EC');
        if (i === 4 || i === 8) R(200.5 + i, mid, 1, 1, '#FFF6EC');
      }
    }
  }
  // front step, once the foundation is down
  if (T >= S_.blocks[0].t + 2.2) { at(0, 0); cube(186, GS - 2, 28, 4, 10, '#A4A6A2', '#BEC0BC', '#7F817E'); R(186, GS - 2, 28, 1, '#C9CBC7'); }
}
function hole([c, r0, w, h], T, col) {
  for (let r = r0; r < r0 + h; r++) {
    const left = SCHOOL.at[(c - 1) + ',' + r];
    if (!left || T < left.t) continue;
    const x = bx(c), y = by(r), W = w * BS, top = r === r0 + h - 1;
    R(x, y, W, BS, col || '#3A302C');
    R(x, y, 2, BS, '#8C7A58');
    if (top) R(x + 2, y, W - 2, 2, '#241D1A');
    if (r === r0) R(x + 2, y + BS - 2, W - 2, 2, '#EFE0BA');
  }
}
// in-flight blocks are drawn after everything else so they sail over the crew
function drawFlying(T) {
  for (const b of SCHOOL.blocks) {
    if (b.t0 == null || T < b.t0 || T >= b.t) continue;
    const u = (T - b.t0) / (b.t - b.t0), hgt = b.arc || 26;
    const x = lerp(b.fx, b.x, u), y = lerp(b.fy, b.y, u) - hgt * 4 * u * (1 - u);
    spin(x + 4, y + 4, Math.sin(u * Math.PI) * 0.6 * (b.who === 1 ? -1 : 1), () => blockAt(x, y, b.tex));
  }
  // little cube crumbs where blocks land
  for (const b of SCHOOL.blocks) {
    const a = T - b.t;
    if (a < 0 || a > 0.45 || b.kind === 'found' && b.c % 2) continue;
    for (let i = 0; i < 4; i++) {
      const dir = (i - 1.5) / 1.5, px = b.x + 4 + dir * 6 * a / 0.45 * 1.6, py = b.y + 7 - 6 * Math.sin(Math.min(1, a / 0.45) * Math.PI) - i % 2;
      const s = 1.6 * (1 - a / 0.45);
      if (s > 0.2) R(px, py, s, s, i % 2 ? '#F1E3BE' : '#C9B48A');
    }
  }
}

// ---------- props ----------
function drawSign(x, label) {
  at(x, G - 6);
  cube(-13, -12, 2, 12, 2, C.woodD); cube(11, -12, 2, 12, 2, C.woodD);
  cube(-16, -25, 32, 14, 3, '#B98552', '#D29D68', '#8A5C33');
  p(-16, -12, 32, 1, '#8A5C33');
  const lines = label || ['FUTURE', 'SCHOOL'];
  lines.forEach((ln, i) => wtext(ln, Math.round(x - wtextW(ln) / 2), G - 6 - 22 + i * 6, '#4A2E18'));
}
function drawCauldron(x, t, o = {}) {
  if (o.hide) return;
  at(x, G);
  // campfire
  cube(-9, -2, 18, 2, 6, '#7A4B2A', '#94663F', '#5E381E');
  const fl = [[-5, 3, 0], [-1, 5, 1], [3, 3, 2], [-3, 2, 3], [1, 3, 4]];
  for (const [fx, fh, i] of fl) {
    const h = fh * (0.75 + 0.35 * Math.sin(AMB * 17 + i * 2.1)), sway = Math.sin(AMB * 9 + i) * 0.5;
    p(fx + sway, -2 - h, 2, h, '#F2832E'); p(fx + sway + 0.5, -2 - h * 0.6, 1, h * 0.6, '#FFD15C');
  }
  // iron pot on feet, with a tapered belly and a thick rim, open on top
  cube(-9, -6, 3, 4, 3, '#2D2B33'); cube(6, -6, 3, 4, 3, '#2D2B33');
  cube(-9, -9, 18, 4, 12, '#33323A', '#45434D', '#25242A');
  cube(-11, -17, 22, 8, 14, '#3B3A42', '#56545F', '#28272D');
  p(-9, -16, 1, 6, '#4C4A55'); p(-8, -16, 1, 2, '#5E5C68');
  cube(-12, -19, 24, 2, 16, '#4A4952', '#64626E', '#33323A');
  p(-12, -19, 24, 1, '#6E6C78');
  const col = o.contents || '#A3A19B';
  for (let i = 1; i < 7; i++) R(x - 12 + i + 2, G - 19 - i - 1, 19, 1, i < 2 ? shade(col, -0.2) : col);
  for (let i = 0; i < 3; i++) {
    const ph = (AMB * 1.3 + i * 0.37) % 1, bx_ = x - 5 + i * 5 + rnd(i + Math.floor(AMB * 1.3 + i * 0.37)) * 3;
    const r = ph < 0.6 ? 0.6 + ph * 1.6 : 0;
    if (r) disc(bx_ + 3, G - 23 - ph * 2, r, '#C9C7C0');
  }
  if (o.steam !== false) for (let i = 0; i < 3; i++) {
    const ph = (AMB * 0.5 + i / 3) % 1;
    ctx.globalAlpha = 0.35 * (1 - ph);
    disc(x - 2 + i * 4 + Math.sin(AMB * 2 + i) * 2, G - 27 - ph * 16, 1.5 + ph * 2.5, '#FFFFFF');
    ctx.globalAlpha = 1;
  }
}
function drawPallet(x, n) {
  at(x, G);
  cube(-13, -3, 26, 3, 12, '#B07F4A', '#C99662', '#8A5F33');
  p(-11, -1, 3, 1, '#6E4A27'); p(-1, -1, 3, 1, '#6E4A27'); p(9, -1, 3, 1, '#6E4A27');
  const stacks = [[-10, 0], [-2, 0], [6, 0], [-10, 1], [-2, 1], [-6, 2]].slice(0, n == null ? 6 : n);
  for (const [cx, cy] of stacks) blockAt(x + cx, G - 3 - (cy + 1) * 8, 'brick', true);
}
function drawEasel(x, T, o = {}) {
  at(x, G);
  cube(-31, -18, 2, 18, 2, C.woodD); cube(29, -18, 2, 18, 2, C.woodD); cube(-1, -18, 2, 16, 2, C.wood);
  const L = x - 34, Tp = G - 60;
  at(0, 0); cube(L - 2, Tp - 2, 72, 46, 3, '#8A5C33', '#A87445', '#6E4522');
  R(L, Tp, 68, 42, '#2E6DB4');
  for (let i = 0; i < 68; i += 6) R(L + i, Tp, 1, 42, '#3878C0');
  for (let i = 0; i < 42; i += 6) R(L, Tp + i, 68, 1, '#3878C0');
  wtext(o.v2 ? 'PLAN V2' : 'PLAN V1', L + 4, Tp + 4, '#FFFFFF');
  R(L + 4, Tp + 10, 30, 1, '#BFD8F2');
  const mx = L + 46, my = Tp + 6;
  if (o.v2) {
    R(mx - 4, my + 10, 26, 1, '#DCEBFA'); R(mx - 4, my + 5, 1, 6, '#DCEBFA'); R(mx + 21, my + 5, 1, 6, '#DCEBFA'); R(mx - 4, my + 5, 6, 1, '#DCEBFA'); R(mx + 16, my + 5, 6, 1, '#DCEBFA');
    R(mx + 1, my + 3, 15, 1, '#DCEBFA'); R(mx + 1, my + 3, 1, 8, '#DCEBFA'); R(mx + 15, my + 3, 1, 8, '#DCEBFA');
    for (let k = 0; k < 4; k++) R(mx + 17 + k, my + 4 - Math.round(Math.sqrt(4 - (k - 1.5) * (k - 1.5))), 1, 1, '#FFE45C');
    R(mx + 7, my - 2, 1, 5, '#DCEBFA'); R(mx + 10, my - 2, 1, 5, '#DCEBFA'); R(mx + 7, my - 2, 4, 1, '#DCEBFA'); R(mx - 2, my + 7, 2, 2, '#DCEBFA'); R(mx + 18, my + 7, 2, 2, '#DCEBFA');
  } else {
    R(mx, my + 10, 18, 1, '#DCEBFA'); R(mx, my + 3, 1, 8, '#DCEBFA'); R(mx + 17, my + 3, 1, 8, '#DCEBFA'); R(mx, my + 3, 18, 1, '#DCEBFA');
    R(mx + 7, my - 2, 1, 5, '#DCEBFA'); R(mx + 11, my - 2, 1, 5, '#DCEBFA'); R(mx + 7, my - 2, 5, 1, '#DCEBFA'); R(mx + 9, my - 5, 1, 3, '#DCEBFA');
    R(mx + 8, my + 7, 3, 4, '#DCEBFA'); R(mx + 2, my + 5, 3, 2, '#DCEBFA'); R(mx + 13, my + 5, 3, 2, '#DCEBFA');
  }
  (o.v2 ? ['2 WINGS', 'DOME+STAIRS', '9 ROOMS'] : ['FOUNDATION', 'WALLS', 'ROOF+TOWER']).forEach((s, i) => {
    const yy = Tp + 15 + i * 8, hl = o.hl != null ? clamp(1 - Math.abs(o.hl - i) * 1.4, 0, 1) : 0;
    if (hl > 0) { ctx.globalAlpha = hl; R(L + 2, yy - 2, 52, 9, '#D97757'); ctx.globalAlpha = 1; }
    R(L + 4, yy, 5, 5, '#FFFFFF'); R(L + 5, yy + 1, 3, 3, '#2E6DB4');
    if ((o.checks || 0) > i) { R(L + 5, yy + 2, 1, 1, '#7CE38B'); R(L + 6, yy + 3, 1, 1, '#7CE38B'); R(L + 7, yy + 1, 1, 2, '#7CE38B'); R(L + 8, yy, 1, 1, '#7CE38B'); }
    wtext(s, L + 11, yy, '#FFFFFF');
  });
  if (o.approved) {
    const s = o.approved < 0.12 ? 1.6 - ease.out(o.approved / 0.12) * 0.6 : 1;
    const cx = L + 50, cy = Tp + 31, w = 36 * s, h = 9 * s;
    ctx.globalAlpha = 0.92;
    R(cx - w / 2, cy - h / 2, w, h, '#C8452F'); R(cx - w / 2 + 1, cy - h / 2 + 1, w - 2, h - 2, '#E9E3D5'); R(cx - w / 2 + 1.6, cy - h / 2 + 1.6, w - 3.2, h - 3.2, '#C8452F');
    if (s <= 1.01) wtext('APPROVED', cx - 15.5, cy - 2.5, '#FFF3D6');
    ctx.globalAlpha = 1;
  }
}
function easelItem(x, i) { return [x - 34 + 52, G - 60 + 17 + i * 8]; }
function drawLevel(x, y) { at(x, y); cube(-8, -3, 16, 3, 4, '#F2C230', '#FFD95E', '#C99A18'); p(-2, -3, 4, 2, '#BFF0B0'); p(-1 + Math.sin(AMB * 3) * 0.6, -3, 1, 1, '#FFFFFF'); }
function drawLid(x, y, t, wob) {
  const w = wob ? Math.sin(AMB * 40) * 0.8 * wob : 0;
  at(x + w, y);
  cube(-8, -2, 16, 2, 10, '#5A5864', '#7A7884', '#45434D'); cube(-1, -4, 2, 2, 2, '#2D2B33');
}
// a Minecraft oak: log trunk and a leaf cube
function drawTree(x, T, t0, big, outT) {
  if (T < t0 || (outT != null && T > outT + 0.22)) return;
  const a = T - t0, sc = outT != null && T > outT ? 1 - ease.in((T - outT) / 0.22) : a < 0.25 ? ease.back(a / 0.25) : 1;
  if (sc <= 0.02) return;
  const sway = Math.sin(AMB * 1.3 + x) * 0.4;
  at(x, G - 4, false, sc, sc);
  const H = big ? 22 : 16, Wd = big ? 30 : 24;
  cube(-2, -H, 4, H, 4, '#7A5232', '#94663F', '#5E3E24');
  p(-1, -H + 3, 1, 4, '#5E3E24'); p(1, -H + 9, 1, 3, '#94663F');
  at(x + sway, G - 4, false, sc, sc);
  cube(-Wd / 2, -H - 14, Wd, 14, 16, '#4FA03A', '#6CC04F', '#3B8430');
  cube(-Wd / 2 + 5, -H - 20, Wd - 10, 6, 12, '#4FA03A', '#6CC04F', '#3B8430');
  if (sc >= 1) for (let k = 0; k < 14; k++) {
    const px = -Wd / 2 + 1 + Math.floor(rnd(k + x) * (Wd - 2)), py = -H - 13 + Math.floor(rnd(k + x + 30) * 12);
    p(px, py, 1, 1, k % 3 ? '#3B8430' : '#73C858');
  }
}
function drawFlowers(T, t0) {
  const cols = ['#F25C6E', '#FFD34E', '#FFFFFF', '#B07BE0', '#FF9A4D'];
  for (let i = 0; i < 18; i++) {
    const tt = t0 + i * 0.03;
    if (T < tt) continue;
    const a = T - tt, s = a < 0.15 ? ease.back(a / 0.15) : 1;
    const x = 112 + i * 10 + rnd(i + 3) * 4;
    if (x > 182 && x < 218) continue;
    const y = GS + 4 + rnd(i + 9) * 3, sw = Math.sin(AMB * 2 + i) * 0.3;
    R(x, y - 2 * s, 1, 2 * s, '#3F9A3A'); R(x - 1 + sw, y - 4 * s, 3, 1, cols[i % 5]); R(x + sw, y - 5 * s, 1, 3 * s, cols[i % 5]); R(x + sw, y - 4 * s, 1, 1, '#FFE9A0');
  }
}
function drawSwing(x, T, t0, outT) {
  if (T < t0 || (outT != null && T > outT + 0.22)) return;
  const a = T - t0, sc = outT != null && T > outT ? 1 - ease.in((T - outT) / 0.22) : a < 0.22 ? ease.back(a / 0.22) : 1;
  if (sc <= 0.02) return;
  at(x, G - 6, false, sc, sc);
  const H = 26;
  cube(-14, -H, 2, H, 2, '#C24B34'); cube(12, -H, 2, H, 2, '#C24B34');
  cube(-14, -H - 2, 28, 2, 8, '#9C3A28', '#B8432F', '#7E2E20');
  const sw = Math.sin(AMB * 2.2) * 0.25;
  for (const k of [-6, 5]) {
    spin(x + k * sc, G - 6 - (H - 1) * sc, sw * (k < 0 ? 1 : -1.2), () => {
      at(x, G - 6, false, sc, sc);
      p(k - 2, -H + 1, 0.6, H - 8, '#9AA0A6'); p(k + 2, -H + 1, 0.6, H - 8, '#9AA0A6'); cube(k - 3, -7, 6, 1, 4, '#3D7DDB');
    });
  }
}
function drawSlide(x, T, t0, outT) {
  if (T < t0 || (outT != null && T > outT + 0.22)) return;
  const a = T - t0, sc = outT != null && T > outT ? 1 - ease.in((T - outT) / 0.22) : a < 0.22 ? ease.back(a / 0.22) : 1;
  if (sc <= 0.02) return;
  at(x, G - 6, false, sc, sc);
  const H = 22;
  cube(-13, -H, 2, H, 2, '#9AA0A6'); cube(-7, -H, 2, H, 2, '#9AA0A6');
  for (let yy = -H + 3; yy < 0; yy += 4) p(-12, yy, 6, 1, '#C9CDD2');
  cube(-13, -H - 2, 8, 2, 8, '#F2B632');
  for (let i = 0; i < 18; i++) cube(-5 + i, -H + i * (H - 2) / 18, 1.2, 2, 8, i % 4 < 2 ? '#F2B632' : '#E9A51C');
}

// ---------- the build schedule, filled once scene start times are known ----------
function planSchool(st) {
  const B = SCHOOL.blocks = [];
  const f0 = st.foundation + 4.9, fdur = 2.1;
  for (let c = -1; c <= 19; c++) B.push({ tex: 'stone', x: bx(c), y: by(0), c, r: 0, t: f0 + (c + 1) / 21 * fdur, kind: 'found' });
  const wall = [];
  for (let r = 1; r <= 7; r++) {
    const cs = r === 7 ? [-1, 19] : [0, 18];
    for (let c = cs[0]; c <= cs[1]; c++) {
      if (r <= 6 && (WINDOWS.some(w => inRect(c, r, w)) || inRect(c, r, DOOR))) continue;
      wall.push({ tex: r === 4 ? 'trim' : r === 7 ? 'corn' : 'brick', x: bx(c), y: by(r), r, c });
    }
  }
  const w0 = st.walls + 0.35, wdur = 5.6, flight = 0.55;
  wall.forEach((b, i) => {
    const t0 = w0 + i / wall.length * wdur, thrower = i % 3;
    b.t0 = t0; b.t = t0 + flight; b.fx = 300 + thrower * 12; b.fy = G - 20; b.arc = 24 + (7 - b.r) * 2; b.kind = 'wall'; b.who = thrower;
    B.push(b);
  });
  SCHOOL.windows = WINDOWS.map((rect, i) => {
    const leftOf = wall.find(b => b.r === rect[1] && b.c === rect[0] - 1) || wall[0];
    return { rect, open: leftOf.t, t: i === 0 ? st.walls + 7.5 : st.walls + 11.55 + (i - 1) * 0.11 };
  });
  const doorLeft = wall.find(b => b.r === 1 && b.c === 7);
  SCHOOL.door = { open: doorLeft.t, t0: st.finish + 0.35, t1: st.finish + 1.15 };
  const roof = [], tower = [], spire = [];
  for (let c = 0; c <= 18; c++) if (c < 7 || c > 11) roof.push({ tex: 'slate', c, r: 8 });
  for (let c = 1; c <= 17; c++) if (c < 7 || c > 11) roof.push({ tex: 'slate', c, r: 9 });
  for (let r = 8; r <= 10; r++) for (let c = 7; c <= 11; c++) tower.push({ tex: 'brick', c, r });
  tower.push({ tex: 'brick', c: 7, r: 11 }, { tex: 'brick', c: 11, r: 11 });
  for (let c = 6; c <= 12; c++) spire.push({ tex: 'slate', c, r: 12 });
  for (let c = 7; c <= 11; c++) spire.push({ tex: 'slate', c, r: 13 });
  for (let c = 8; c <= 10; c++) spire.push({ tex: 'slate', c, r: 14 });
  spire.push({ tex: 'slate', c: 9, r: 15 });
  const r0 = st.roof;
  const sched = (list, a, b) => list.forEach((q, i) => {
    q.t0 = r0 + a + i / list.length * (b - a); q.t = q.t0 + 0.45; q.x = bx(q.c); q.y = by(q.r);
    q.fx = 196; q.fy = G - 44; q.arc = 16; q.kind = 'roof'; B.push(q);
  });
  sched(roof, 4.3, 5.8);
  sched(tower, 5.8, 6.8);
  sched(spire, 7.05, 7.9);
  // draw order: bottom row first, then left to right
  B.sort((a, b) => a.r - b.r || a.c - b.c);
  SCHOOL.at = {};
  for (const b of B) SCHOOL.at[b.c + ',' + b.r] = b;
  SCHOOL.clock = { t: r0 + 6.95 };
  SCHOOL.bell = { open: r0 + 6.6, t: r0 + 7.0 };
  SCHOOL.pole = { t: r0 + 8.35 };
  SCHOOL.flag = { t0: st.finish + 4.4, t1: st.finish + 5.9 };
  SCHOOL.sign = { t0: st.finish + 3.0, dt: 0.11 };
  SCHOOL.decor = { trees: st.finish + 1.6, flowers: st.finish + 1.9, swing: st.finish + 2.3, slide: st.finish + 2.5 };
}
