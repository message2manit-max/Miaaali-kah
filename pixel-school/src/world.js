/* ---- the world: sky, hills, ground, the school site, block textures and props ---- */
const G = 150;            // ground line (world y)
const BS = 8;             // block size
const SX = 124;           // school column 0 (left edge)
const bx = c => SX + c * BS;
const by = r => G - (r + 1) * BS;
const WX0 = -80, WY0 = -60, WW = 600, WH = 250;

// ---------- 8x8 block textures ----------
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
};
function blockAt(x, y, sz, t) { img(TEX[t || 'brick'], x, y, sz || 8, sz || 8); }

// ---------- static background (pre-rendered once at 1 px per world unit) ----------
let BG = null;
function buildBG() {
  const c = mkCanvas(WW, WH), g = c.getContext('2d');
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x - WX0), Math.round(y - WY0), w, h); };
  // sky bands with dithered seams
  const bands = [[WY0, '#86C4EC'], [8, '#96CDEF'], [40, '#A8D6F1'], [72, '#BBDFF2'], [100, '#CDE8F1'], [124, '#DEEFEC']];
  for (let i = 0; i < bands.length; i++) {
    const y0 = bands[i][0], y1 = i + 1 < bands.length ? bands[i + 1][0] : G;
    P(WX0, y0, WW, y1 - y0, bands[i][1]);
    if (i > 0) for (let x = WX0; x < WX0 + WW; x++) { if ((x & 1) === 0) P(x, y0 - 1, 1, 1, bands[i][1]); if ((x & 1) === 1) P(x, y0 - 2, 1, 1, bands[i][1]); if (x % 4 === 0) P(x, y0 - 3, 1, 1, bands[i][1]); }
  }
  // sun
  const sxc = 352, syc = 22;
  for (let y = -14; y <= 14; y++) for (let x = -14; x <= 14; x++) {
    const d = Math.sqrt(x * x + y * y);
    if (d <= 8.5) P(sxc + x, syc + y, 1, 1, d < 5.5 ? '#FFF6C9' : '#FFE47E');
    else if (d <= 12 && ((x + y) & 1) === 0) P(sxc + x, syc + y, 1, 1, '#E9F4F4');
  }
  // far mountains
  for (let x = WX0; x < WX0 + WW; x++) {
    const h = 26 + 9 * Math.sin(x * 0.027) + 6 * Math.sin(x * 0.071 + 1.3) + 3 * Math.sin(x * 0.19);
    const top = Math.round(140 - h);
    P(x, top, 1, G - top, '#A9CDBF');
    if (h > 34) P(x, top, 1, 2, '#C6E0D6');
  }
  // rolling hills
  for (let x = WX0; x < WX0 + WW; x++) {
    const h = 12 + 6 * Math.sin(x * 0.045 + 2) + 3 * Math.sin(x * 0.12);
    const top = Math.round(146 - h);
    P(x, top, 1, G - top, '#8DC383');
    P(x, top, 1, 1, '#A3D195');
  }
  // tiny town and trees on the hills
  const houses = [[-30, '#E8D2B0', '#B65C47'], [10, '#F0E4CC', '#5A7FA8'], [372, '#E8D2B0', '#B65C47'], [400, '#F0E4CC', '#7B5BA0'], [440, '#E8D2B0', '#5A7FA8'], [60, '#F0E4CC', '#B65C47']];
  for (const [hx, wc, rc] of houses) {
    const top = Math.round(146 - (12 + 6 * Math.sin(hx * 0.045 + 2) + 3 * Math.sin(hx * 0.12)));
    P(hx, top - 5, 7, 5, wc); P(hx - 1, top - 7, 9, 2, rc); P(hx + 1, top - 8, 5, 1, rc); P(hx + 3, top - 3, 1, 3, '#8A6A4A'); P(hx + 5, top - 4, 1, 1, '#7FB8DC');
  }
  for (let i = 0; i < 26; i++) {
    const tx = WX0 + 10 + i * 23 + Math.round(rnd(i) * 12);
    const top = Math.round(146 - (12 + 6 * Math.sin(tx * 0.045 + 2) + 3 * Math.sin(tx * 0.12)));
    P(tx - 2, top - 5, 5, 4, '#6FAE69'); P(tx - 1, top - 6, 3, 1, '#6FAE69'); P(tx, top - 1, 1, 2, '#6B5A40'); P(tx - 1, top - 5, 1, 1, '#86C27E');
  }
  // bushes at the back of the lot
  for (let i = 0; i < 40; i++) {
    const x = WX0 + i * 16 + Math.round(rnd(i + 50) * 8), w = 10 + Math.round(rnd(i + 80) * 8);
    P(x, G - 4, w, 4, '#5FA94A'); P(x + 2, G - 6, w - 4, 2, '#5FA94A'); P(x + 3, G - 6, 3, 1, '#78C05B');
  }
  // ground: grass + dirt in 8x8 tiles
  for (let tx = WX0; tx < WX0 + WW; tx += 8) {
    for (let ty = G; ty < WY0 + WH; ty += 8) {
      const n = tx * 7 + ty * 13;
      P(tx, ty, 8, 8, '#8B5D3B');
      for (let k = 0; k < 6; k++) P(tx + Math.floor(rnd(n + k) * 7), ty + Math.floor(rnd(n + k + 20) * 7), 1 + (k & 1), 1, k < 3 ? '#74492D' : '#9E6C48');
      if (rnd(n + 99) < 0.25) P(tx + 2 + Math.floor(rnd(n + 3) * 3), ty + 3 + Math.floor(rnd(n + 4) * 3), 2, 2, '#9C948B');
      if (ty === G) {
        P(tx, ty, 8, 3, '#62B33F');
        for (let k = 0; k < 8; k++) if (rnd(n + k * 3) < 0.45) P(tx + k, ty + 3, 1, 1 + (rnd(n + k) < 0.3 ? 1 : 0), '#62B33F');
        P(tx, ty, 8, 1, '#7FCB4F');
        for (let k = 0; k < 8; k += 2) if (rnd(n + k + 7) < 0.5) P(tx + k, ty - 1, 1, 1, '#7FCB4F');
      }
    }
  }
  BG = c;
}
function drawBG() { img(BG, WX0, WY0, WW, WH); }

// drifting clouds (world space)
const CLOUDS = [[20, 18, 1], [150, 38, 0.8], [260, 10, 1.2], [380, 44, 0.9], [470, 24, 1]];
function drawClouds(T) {
  CLOUDS.forEach(([x0, y, s], i) => {
    const x = ((x0 + AMB * (2.2 + i * 0.5)) % 600) - 120;
    const w = Math.round(30 * s);
    R(x + 4, y + 4, w, 6, '#DCEBF4');
    R(x, y + 2, w + 8, 6, '#FFFFFF');
    R(x + 6, y - 2, Math.round(w * 0.45), 6, '#FFFFFF');
    R(x + Math.round(w * 0.45), y - 4, Math.round(w * 0.35), 7, '#FFFFFF');
    R(x + 2, y + 7, w + 4, 2, '#E6F0F6');
  });
}

// ---------- the school: block list with land times, built from the schedule ----------
const WINDOWS = [ // [col, bottomRow, w, h]
  [1, 2, 2, 2], [4, 2, 2, 2], [13, 2, 2, 2], [16, 2, 2, 2],
  [1, 5, 2, 2], [4, 5, 2, 2], [8, 5, 3, 2], [13, 5, 2, 2], [16, 5, 2, 2],
];
const DOOR = [8, 1, 3, 3];
function inRect(c, r, [c0, r0, w, h]) { return c >= c0 && c < c0 + w && r >= r0 && r < r0 + h; }
const SCHOOL = { blocks: [], windows: [], door: {}, sign: {}, bell: {}, clock: {}, pole: {}, flag: {}, decor: [] };

function drawOpening(x, y, w, h) {
  R(x, y, w, h, '#4A3E3A'); R(x, y, w, 2, '#3A302C');
}
function drawWindow(wd, T) {
  const [c, r, w, h] = wd.rect;
  const x = bx(c), y = by(r + h - 1), W = w * BS, H = h * BS;
  if (T < wd.t) { if (T >= wd.open) drawOpening(x, y, W, H); return; }
  const a = T - wd.t;
  if (T >= wd.open || a >= 0) drawOpening(x, y, W, H);
  const u = clamp(a / 0.14, 0, 1), sc = a < 0.14 ? ease.back(u) : 1;
  const cw = W * sc, ch = H * sc, ox = x + (W - cw) / 2, oy = y + (H - ch) / 2;
  R(ox, oy, cw, ch, '#F3EEE3');
  R(ox + 1, oy + 1, cw - 2, ch - 2, '#7FC2E6');
  if (sc >= 1) {
    for (let i = 0; i < 5; i++) R(x + 2 + i, y + 2 + 4 - i, 1, 1, '#D2F0FB');
    R(x + 3, y + 2, 1, 1, '#D2F0FB');
    R(x + 1, y + Math.floor(H / 2), W - 2, 1, '#F3EEE3');
    for (let k = 1; k < w; k++) R(x + k * BS, y + 1, 1, H - 2, '#F3EEE3');
    R(x - 1, y + H, W + 2, 1, '#E9E3D5');
    R(x - 1, y + H + 1, W + 2, 1, '#BDB4A1');
  }
}
function drawDoor(T, open) {
  const d = SCHOOL.door, [c, r, w, h] = DOOR;
  const x = bx(c), y = by(r + h - 1), W = w * BS, H = h * BS;
  if (T < d.open) return;
  drawOpening(x, y, W, H);
  if (T < d.t0) return;
  const painted = clamp((T - d.t0) / (d.t1 - d.t0), 0, 1);
  const rows = Math.round(H * painted);
  if (open) {
    R(x, y, 3, H, '#B8432F'); R(x + W - 3, y, 3, H, '#B8432F');
    R(x + 3, y, W - 6, H, '#2E2522');
    return;
  }
  // double door painted top-down
  R(x, y, W, rows, '#C24B34');
  R(x + W / 2 - 0.5, y, 1, rows, '#8E3020');
  if (painted >= 1) {
    for (const px of [x + 2, x + W / 2 + 2]) {
      R(px, y + 3, W / 2 - 5, 7, '#A93E2A'); R(px, y + 13, W / 2 - 5, 8, '#A93E2A');
      R(px + 1, y + 4, W / 2 - 7, 5, '#F2D6A8');
    }
    R(x + W / 2 - 3, y + 12, 1, 2, C.gold); R(x + W / 2 + 2, y + 12, 1, 2, C.gold);
    R(x - 2, y - 2, W + 4, 2, '#E9E3D5');
  }
}
function drawSchool(T, o = {}) {
  const S_ = SCHOOL;
  // window and door openings appear as the wall grows around them
  S_.windows.forEach(wd => drawWindow(wd, T));
  drawDoor(T, o.doorOpen);
  // belfry interior
  if (T >= S_.bell.open) R(bx(8), by(11), 24, 8, '#3E3431');
  for (const b of S_.blocks) {
    if (T >= b.t) {
      const a = T - b.t;
      let yOff = 0;
      if (a < 0.1) yOff = -Math.round((1 - a / 0.1) * 3);
      else if (a < 0.18) yOff = 0;
      blockAt(b.x, b.y + yOff, 8, b.tex);
    } else if (b.t0 != null && T >= b.t0) {
      const u = (T - b.t0) / (b.t - b.t0);
      const hgt = b.arc || 26;
      const x = lerp(b.fx, b.x, u), y = lerp(b.fy, b.y, u) - hgt * 4 * u * (1 - u);
      blockAt(x, y, 8, b.tex);
    }
  }
  // sign letters on the trim band above the door
  const sg = S_.sign;
  if (T >= sg.t0) {
    const str = '5.5 ACADEMY', w = wtextW(str), x0 = Math.round(200 - w / 2);
    let x = x0, n = 0;
    for (const ch of str) {
      if (ch !== ' ') {
        const tt = sg.t0 + n * sg.dt;
        if (T >= tt) { const a = T - tt; const yo = a < 0.08 ? -2 : 0; wtext(ch, x, by(4) + 2 + yo, '#FFE9A8'); }
        n++;
      }
      x += ch === ' ' ? 3 : glyph(F3, ch).w + 1;
    }
  }
  // clock
  const ck = S_.clock;
  if (T >= ck.t) {
    const cx = 200, cy = 70, a = T - ck.t, sc = a < 0.15 ? ease.back(a / 0.15) : 1;
    const rr = 7 * sc;
    for (let yy = -8; yy <= 8; yy++) for (let xx = -8; xx <= 8; xx++) {
      const d = Math.sqrt(xx * xx + yy * yy);
      if (d <= rr + 0.6) R(cx + xx - 0.5, cy + yy - 0.5, 1, 1, d > rr - 0.9 ? '#2F3A4A' : '#F7F3EA');
    }
    if (sc >= 1) {
      for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; R(cx + Math.round(Math.sin(an) * 5) - 0.5, cy - Math.round(Math.cos(an) * 5) - 0.5, 1, 1, i % 3 === 0 ? '#2F3A4A' : '#B9B3A6'); }
      const mA = (T - ck.t) * 0.9, hA = -2.1;
      at(0, 0);
      pline(cx - 0.5, cy - 0.5, cx - 0.5 + Math.sin(mA) * 5, cy - 0.5 - Math.cos(mA) * 5, '#C24B34');
      pline(cx - 0.5, cy - 0.5, cx - 0.5 + Math.sin(hA) * 3, cy - 0.5 - Math.cos(hA) * 3, '#2F3A4A');
    }
  }
  // bell
  const bl = S_.bell;
  if (T >= bl.t) {
    const sw = o.bellSwing || 0, cx = 200 + sw;
    R(199, by(11), 2, 1, '#3E3431');
    R(cx - 3, by(11) + 1, 6, 1, C.goldD); R(cx - 3, by(11) + 2, 6, 3, C.gold); R(cx - 4, by(11) + 5, 8, 1, C.gold); R(cx - 4, by(11) + 6, 8, 1, C.goldD);
    R(cx - 2, by(11) + 2, 1, 3, '#FFE08A'); R(cx - 0.5 + sw * 0.5, by(11) + 7, 1, 1, '#6E5A2A');
  }
  // flagpole + flag
  const pl = S_.pole;
  if (T >= pl.t) {
    const top = by(15) - 22;
    R(199.5, top, 1, by(15) - top, '#C9CDD2'); R(199, top - 2, 2, 2, C.gold);
    const fg = S_.flag;
    if (T >= fg.t0) {
      const u = ease.out(clamp((T - fg.t0) / (fg.t1 - fg.t0), 0, 1));
      const fy = Math.round(lerp(by(15) - 9, top, u));
      for (let i = 0; i < 13; i++) {
        const wv = Math.round(Math.sin(AMB * 7 - i * 0.7) * (i / 13) * 1.6);
        R(200.5 + i, fy + wv, 1, 8, i % 2 ? '#D97757' : '#DD8064');
        if (i >= 4 && i <= 8) {
          const mid = fy + wv + 4;
          if (i === 6) R(200.5 + i, mid - 2, 1, 4, '#FFF6EC');
          if (i === 5 || i === 7) R(200.5 + i, mid - 1, 1, 2, '#FFF6EC');
          if (i === 4 || i === 8) R(200.5 + i, mid - 0, 1, 1, '#FFF6EC');
        }
      }
    }
  }
}

// ---------- props ----------
function drawSign(x, T, label) {
  at(x, G);
  p(-13, -12, 2, 12, C.woodD); p(11, -12, 2, 12, C.woodD);
  p(-16, -25, 32, 15, '#B98552'); p(-16, -25, 32, 1, '#D29D68'); p(-16, -11, 32, 1, '#8A5C33'); p(-16, -25, 1, 15, '#8A5C33'); p(15, -25, 1, 15, '#8A5C33');
  const lines = label || ['FUTURE', 'SCHOOL'];
  lines.forEach((ln, i) => wtext(ln, Math.round(x - wtextW(ln) / 2), G - 23 + i * 6 + (lines.length === 1 ? 3 : 0), '#4A2E18'));
}
function drawCauldron(x, t, o = {}) {
  at(x, G);
  // fire
  p(-8, -3, 16, 2, '#7A4B2A'); p(-7, -2, 14, 2, '#5E381E');
  const f = Math.floor(AMB * 9) % 3;
  [[-5, 3], [-1, 4], [3, 3], [-3, 2], [1, 2]].forEach(([fx, fh], i) => { const hh = fh + ((f + i) % 3 === 0 ? 1 : 0); p(fx, -3 - hh, 2, hh, '#F2832E'); p(fx, -3 - Math.max(1, hh - 2), 1, Math.max(1, hh - 2), '#FFD15C'); });
  // pot with a rounded belly
  p(-10, -16, 20, 7, '#2D2B33'); p(-9, -9, 18, 2, '#2D2B33'); p(-7, -7, 14, 1, '#26252B');
  p(-8, -15, 1, 6, '#4A4852'); p(-7, -15, 1, 1, '#5E5C68');
  p(-8, -6, 2, 2, '#2D2B33'); p(6, -6, 2, 2, '#2D2B33');
  p(-11, -18, 22, 2, '#45434D'); p(-11, -18, 22, 1, '#5A5864');
  const col = o.contents || '#A3A19B';
  p(-9, -17, 18, 1, col); p(-8, -17, 4, 1, '#BDBBB4');
  for (let i = 0; i < 3; i++) {
    const ph = (AMB * 1.3 + i * 0.37) % 1;
    const bx_ = -6 + i * 5 + Math.round(rnd(i + Math.floor(AMB * 1.3 + i * 0.37)) * 2);
    if (ph < 0.5) p(bx_, -18 - Math.floor(ph * 6), 2, 1 + (ph < 0.25 ? 1 : 0), '#C9C7C0');
  }
}
function drawPallet(x, n) {
  at(x, G);
  p(-12, -3, 24, 3, '#B07F4A'); p(-12, -3, 24, 1, '#C99662'); p(-10, -1, 3, 1, '#6E4A27'); p(-1, -1, 3, 1, '#6E4A27'); p(8, -1, 3, 1, '#6E4A27');
  const stacks = [[-10, 0], [-2, 0], [-10, 1], [-2, 1], [6, 0], [-6, 2]].slice(0, n == null ? 6 : n);
  stacks.forEach(([cx, cy]) => blockAt(x + cx, G - 3 - (cy + 1) * 8, 8, 'brick'));
}
function drawEasel(x, T, o = {}) {
  at(x, G);
  pline(-24, -18, -30, 0, C.woodD, 2); pline(24, -18, 30, 0, C.woodD, 2); pline(0, -18, 0, 0, C.wood, 1);
  const L = x - 34, Tp = G - 60;
  R(L - 2, Tp - 2, 72, 46, '#8A5C33');
  R(L, Tp, 68, 42, '#2E6DB4');
  for (let i = 0; i < 68; i += 6) R(L + i, Tp, 1, 42, '#3878C0');
  for (let i = 0; i < 42; i += 6) R(L, Tp + i, 68, 1, '#3878C0');
  wtext('PLAN V1', L + 4, Tp + 4, '#FFFFFF');
  R(L + 4, Tp + 10, 30, 1, '#BFD8F2');
  // mini school sketch
  const mx = L + 46, my = Tp + 6;
  R(mx, my + 10, 18, 1, '#DCEBFA'); R(mx, my + 3, 1, 8, '#DCEBFA'); R(mx + 17, my + 3, 1, 8, '#DCEBFA'); R(mx, my + 3, 18, 1, '#DCEBFA');
  R(mx + 7, my - 2, 1, 5, '#DCEBFA'); R(mx + 11, my - 2, 1, 5, '#DCEBFA'); R(mx + 7, my - 2, 5, 1, '#DCEBFA'); R(mx + 9, my - 5, 1, 3, '#DCEBFA');
  R(mx + 8, my + 7, 3, 4, '#DCEBFA'); R(mx + 2, my + 5, 3, 2, '#DCEBFA'); R(mx + 13, my + 5, 3, 2, '#DCEBFA');
  const items = ['FOUNDATION', 'WALLS', 'ROOF+TOWER'];
  items.forEach((s, i) => {
    const yy = Tp + 15 + i * 8;
    const hl = o.hl === i;
    if (hl) R(L + 2, yy - 2, 50, 9, '#D97757');
    R(L + 4, yy, 5, 5, '#FFFFFF'); R(L + 5, yy + 1, 3, 3, hl ? '#D97757' : '#2E6DB4');
    if ((o.checks || 0) > i) { R(L + 5, yy + 2, 1, 1, '#7CE38B'); R(L + 6, yy + 3, 1, 1, '#7CE38B'); R(L + 7, yy + 1, 1, 2, '#7CE38B'); R(L + 8, yy, 1, 1, '#7CE38B'); }
    wtext(s, L + 11, yy, '#FFFFFF');
  });
}
// where a checklist item on the easel sits, for Opus's pointer
function easelItem(x, i) { return [x - 34 + 50, G - 60 + 17 + i * 8]; }
function drawLevel(x, y) {
  R(x - 8, y - 3, 16, 3, '#F2C230'); R(x - 8, y - 3, 16, 1, '#FFD95E'); R(x - 2, y - 3, 4, 2, '#BFF0B0'); R(x - 1, y - 3, 1, 1, '#FFFFFF'); R(x - 8, y - 1, 16, 1, '#C99A18');
}
function drawLid(x, y, t, wob) {
  const w = wob ? Math.round(Math.sin(t * 30) * 1) : 0;
  at(x + w, y);
  p(-8, -2, 16, 2, '#5A5864'); p(-6, -4, 12, 2, '#6B6975'); p(-4, -5, 8, 1, '#7A7884'); p(-1, -7, 2, 2, '#2D2B33'); p(-6, -4, 3, 1, '#9896A0');
}
function drawTree(x, T, t0, big) {
  if (T < t0) return;
  const a = T - t0, sc = a < 0.18 ? ease.back(a / 0.18) : 1;
  const H = Math.round((big ? 48 : 38) * sc), W = Math.round((big ? 30 : 24) * sc);
  if (H < 4) return;
  const Hc = Math.round(H * 0.5), top = G - H;
  R(x - 2, top + Hc - 3, 4, H - Hc + 3, '#7A5232'); R(x - 2, top + Hc - 3, 1, H - Hc + 3, '#94663F'); R(x - 3, G - 2, 6, 2, '#6A4628');
  for (let i = 0; i < Hc; i++) {
    const v = (i + 0.5) / Hc * 2 - 1, hw = Math.max(1, Math.round(W / 2 * Math.sqrt(1 - v * v)));
    R(x - hw, top + i, hw * 2, 1, i < Hc * 0.3 ? '#7BC64F' : i > Hc * 0.72 ? '#3F8030' : '#5DAE43');
    if (i > 1 && i < Hc - 2) { R(x - hw, top + i, 1, 1, '#4C9638'); R(x + hw - 1, top + i, 1, 1, '#4C9638'); }
  }
  if (sc >= 1) for (let k = 0; k < 9; k++) {
    const px = x - W / 2 + 3 + Math.floor(rnd(k + x) * (W - 6)), py = top + 3 + Math.floor(rnd(k + x + 30) * (Hc - 6));
    R(px, py, 2, 1, k % 3 ? '#4C9638' : '#8FD45E');
  }
}
function drawFlowers(T, t0) {
  const cols = ['#F25C6E', '#FFD34E', '#FFFFFF', '#B07BE0', '#FF9A4D'];
  for (let i = 0; i < 18; i++) {
    const tt = t0 + i * 0.03;
    if (T < tt) continue;
    const x = 112 + i * 10 + Math.round(rnd(i + 3) * 4);
    if (x > 190 && x < 212) continue;
    R(x, G - 2, 1, 2, '#3F9A3A'); R(x - 1, G - 4, 3, 1, cols[i % 5]); R(x, G - 5, 1, 3, cols[i % 5]); R(x, G - 4, 1, 1, '#FFE9A0');
  }
}
function drawSwing(x, T, t0) {
  if (T < t0) return;
  const a = T - t0, sc = a < 0.18 ? ease.back(a / 0.18) : 1;
  if (sc < 0.3) return;
  const H = Math.round(26 * sc);
  at(x, G);
  pline(-12, -H, -16, 0, '#C24B34', 2); pline(-12, -H, -8, 0, '#C24B34', 2);
  pline(12, -H, 8, 0, '#C24B34', 2); pline(12, -H, 16, 0, '#C24B34', 2);
  p(-13, -H - 1, 26, 2, '#9C3A28');
  const sw = Math.round(Math.sin(AMB * 2.2) * 2);
  for (const k of [-5, 5]) { pline(k - 2, -H + 1, k - 2 + sw, -7, '#9AA0A6'); pline(k + 2, -H + 1, k + 2 + sw, -7, '#9AA0A6'); p(k - 3 + sw, -7, 7, 2, '#3D7DDB'); }
}
function drawSlide(x, T, t0) {
  if (T < t0) return;
  const a = T - t0, sc = a < 0.18 ? ease.back(a / 0.18) : 1;
  if (sc < 0.3) return;
  at(x, G);
  const H = Math.round(22 * sc);
  p(-12, -H, 2, H, '#9AA0A6'); p(-6, -H, 2, H, '#9AA0A6');
  for (let yy = -H + 3; yy < 0; yy += 4) p(-11, yy, 6, 1, '#C9CDD2');
  p(-12, -H - 2, 8, 2, '#F2B632');
  for (let i = 0; i < 18; i++) p(-4 + i, -H + Math.round(i * (H - 2) / 18), 2, 3, i % 4 < 2 ? '#F2B632' : '#E9A51C');
}

// ---------- the build schedule, filled once scene start times are known ----------
function planSchool(st) {
  const B = SCHOOL.blocks = [];
  // foundation (scene "foundation", Haikus pour it left to right)
  const f0 = st.foundation + 4.9, fdur = 2.1;
  for (let c = -1; c <= 19; c++) B.push({ tex: 'stone', x: bx(c), y: by(0), t: f0 + (c + 1) / 21 * fdur, kind: 'found' });
  // walls: thrown from the pallet, bottom row first
  const wall = [];
  for (let r = 1; r <= 7; r++) {
    const cs = r === 7 ? [-1, 19] : [0, 18];
    for (let c = cs[0]; c <= cs[1]; c++) {
      if (r <= 6 && (WINDOWS.some(w => inRect(c, r, w)) || inRect(c, r, DOOR))) continue;
      wall.push({ tex: r === 4 ? 'trim' : r === 7 ? 'corn' : 'brick', x: bx(c), y: by(r), r, c });
    }
  }
  const w0 = st.walls + 0.35, wdur = 5.6, flight = 0.5;
  wall.forEach((b, i) => {
    const t0 = w0 + i / wall.length * wdur;
    const thrower = i % 3;
    b.t0 = t0; b.t = t0 + flight; b.fx = 304 + thrower * 12; b.fy = 128; b.arc = 22 + (7 - b.r) * 2; b.kind = 'wall'; b.who = thrower;
    B.push(b);
  });
  // windows: one placed by Sonnet, the rest by the Haikus in a blur
  SCHOOL.windows = WINDOWS.map((rect, i) => {
    const leftOf = wall.find(b => b.r === rect[1] && b.c === rect[0] - 1) || wall[0];
    return { rect, open: leftOf.t, t: i === 0 ? st.walls + 7.5 : st.walls + 11.55 + (i - 1) * 0.11 };
  });
  const doorLeft = wall.find(b => b.r === 1 && b.c === 7);
  SCHOOL.door = { open: doorLeft.t, t0: st.finish + 0.35, t1: st.finish + 1.15 };
  // roof, tower, belfry and spire, thrown up from the Haiku tower
  const roof = [];
  for (let c = 0; c <= 18; c++) if (c < 7 || c > 11) roof.push({ tex: 'slate', c, r: 8 });
  for (let c = 1; c <= 17; c++) if (c < 7 || c > 11) roof.push({ tex: 'slate', c, r: 9 });
  const tower = [];
  for (let r = 8; r <= 10; r++) for (let c = 7; c <= 11; c++) tower.push({ tex: 'brick', c, r });
  tower.push({ tex: 'brick', c: 7, r: 11 }, { tex: 'brick', c: 11, r: 11 });
  const spire = [];
  for (let c = 6; c <= 12; c++) spire.push({ tex: 'slate', c, r: 12 });
  for (let c = 7; c <= 11; c++) spire.push({ tex: 'slate', c, r: 13 });
  for (let c = 8; c <= 10; c++) spire.push({ tex: 'slate', c, r: 14 });
  spire.push({ tex: 'slate', c: 9, r: 15 });
  const r0 = st.roof;
  const sched = (list, a, b) => list.forEach((q, i) => {
    q.t0 = r0 + a + i / list.length * (b - a); q.t = q.t0 + 0.42; q.x = bx(q.c); q.y = by(q.r);
    q.fx = 196; q.fy = 104; q.arc = 18; q.kind = 'roof'; B.push(q);
  });
  sched(roof, 4.3, 5.8);
  sched(tower, 5.8, 6.8);
  sched(spire, 7.05, 7.9);
  SCHOOL.clock = { t: r0 + 6.95 };
  SCHOOL.bell = { open: r0 + 6.6, t: r0 + 7.0 };
  SCHOOL.pole = { t: r0 + 8.35 };
  SCHOOL.flag = { t0: st.finish + 4.4, t1: st.finish + 5.9 };
  SCHOOL.sign = { t0: st.finish + 3.0, dt: 0.11 };
  SCHOOL.decor = { trees: st.finish + 1.6, flowers: st.finish + 1.9, swing: st.finish + 2.3, slide: st.finish + 2.5 };
}
