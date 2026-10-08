/* ---- School V2: two new wings, Sonnet's complex parts (arched windows, a glass dome, the grand staircase),
        scaffolding, and the dollhouse cutaway that opens the front wall to show every room ---- */
const ARCHES = [ // [col, bottomRow, w, h]
  [-10, 2, 2, 2], [-7, 2, 2, 2], [-4, 2, 2, 2], [-10, 5, 2, 2], [-7, 5, 2, 2], [-4, 5, 2, 2],
  [21, 2, 2, 2], [24, 2, 2, 2], [27, 2, 2, 2], [21, 5, 2, 2], [24, 5, 2, 2], [27, 5, 2, 2],
];
const SCHOOL2 = { blocks: [], arches: [], dome: [], all: [], chimneyT: 1e9, scaffold: [1e9, 1e9] };
const isWallRow = r => (r >= 1 && r <= 3) || r === 5 || r === 6;
const isRemovable = b => isWallRow(b.r) && b.c > -12 && b.c < 30;
const DOME = { cx: 328, base: () => by(9) - 4, rows: [34, 30, 25, 19, 11], h: 3 };

function planSchool2(st) {
  const B = [];
  const wing = (c0, c1, side) => {
    for (let r = 0; r <= 9; r++) {
      let a = c0, b = c1;
      if (r === 0 || r === 7) { if (side < 0) a = c0 - 1; else b = c1 + 1; }
      if (r === 9) { a = c0 + 1; b = c1 - 1; }
      for (let c = a; c <= b; c++) {
        if (SCHOOL.at[c + ',' + r]) continue;
        if (isWallRow(r) && ARCHES.some(w => inRect(c, r, w))) continue;
        const tex = r === 0 ? 'stone' : r === 4 ? 'trim' : r === 7 ? 'corn' : r >= 8 ? 'slate' : 'brick';
        B.push({ tex, c, r, x: bx(c), y: by(r), side, kind: 'wing' });
      }
    }
  };
  wing(-12, -1, -1); wing(19, 30, 1);
  B.push({ tex: 'stone', c: -9, r: 10, x: bx(-9), y: by(10), side: -1, kind: 'wing' }, { tex: 'stone', c: -9, r: 11, x: bx(-9), y: by(11), side: -1, kind: 'wing' });
  const order = (a, b) => a.r - b.r || (a.side < 0 ? b.c - a.c : a.c - b.c);
  const Lw = B.filter(b => b.side < 0).sort(order), Rw = B.filter(b => b.side > 0).sort(order);
  const t0 = st.wings + 0.8, dur = 4.6, flight = 0.5;
  Lw.forEach((b, i) => { b.t0 = t0 + i / Lw.length * dur; b.t = b.t0 + flight; b.fx = 18 + (i % 2) * 12; b.fy = G - 20; b.arc = 18 + (9 - b.r) * 1.5; b.who = i % 2; });
  Rw.forEach((b, i) => { b.t0 = t0 + 0.05 + i / Rw.length * dur; b.t = b.t0 + flight; b.fx = 372; b.fy = G - 20; b.arc = 18 + (9 - b.r) * 1.5; b.who = 2; });
  SCHOOL2.blocks = B;
  for (const b of B) SCHOOL.at[b.c + ',' + b.r] = b;
  SCHOOL2.all = SCHOOL.blocks.concat(B).sort((a, b) => a.r - b.r || a.c - b.c);
  SCHOOL2.dome = DOME.rows.map((w, i) => ({ w, t: st.wings + 6.1 + i * 0.62 }));
  SCHOOL2.arches = ARCHES.map((rect, i) => ({ rect, t: st.wings + 9.55 + i * 0.085 }));
  SCHOOL2.chimneyT = st.wings + 10.6;
  SCHOOL2.scaffold = [st.wings + 5.0, st.wings + 10.3];
  SCHOOL2.stairs = st.wings + 9.0;
}

// ---------- Sonnet's parts ----------
function drawArch(a, T, lit) {
  const [x0, y, W0, H0] = rectOf(a.rect), at_ = T - a.t;
  if (at_ < 0) return;
  const s = at_ < 0.18 ? ease.back(at_ / 0.18) : 1, x = x0 + 1, W = W0 - 1, H = H0 - 1, r = W / 2;
  const glass = lit ? mixHex('#86C8EA', '#FFD98A', lit) : '#86C8EA';
  for (let yy = 0; yy < H; yy++) {
    const dy = r - yy, hw = yy < r ? Math.sqrt(Math.max(0, r * r - dy * dy)) : r;
    const cy = y + (H - (H - yy) * s);
    R(x + r - (hw + 0.6) * s, cy, (hw + 0.6) * 2 * s, 1, '#F7F2E8');
    if (hw > 1.2) R(x + r - (hw - 0.8) * s, cy, (hw - 0.8) * 2 * s, 1, glass);
  }
  if (s < 1) return;
  R(x + r - 0.5, y + 1, 1, H - 1, '#F7F2E8'); R(x + 1, y + H * 0.62, W - 2, 1, '#F7F2E8');
  for (let i = 0; i < 4; i++) R(x + 3 + i, y + H - 4 - i, 1, 1, '#DDF4FC');
  R(x - 1, y + H, W + 2, 1, '#F8F4EA'); R(x - 1, y + H + 1, W + 2, 1, '#BDB4A1');
  if (lit) { ctx.globalAlpha = 0.3 * lit; R(x - 3, y - 2, W + 6, H + 5, '#FFD98A'); ctx.globalAlpha = 1; }
}
function drawDome(T) {
  const base = DOME.base();
  SCHOOL2.dome.forEach((row, i) => {
    const a = T - row.t;
    if (a < 0) return;
    const s = a < 0.2 ? ease.back(a / 0.2) : 1, w = row.w * s, y = base - DOME.h * (i + 1);
    at(DOME.cx, y + DOME.h);
    cube(-w / 2, -DOME.h, w, DOME.h, 14 - i * 2, '#93D2EE', '#D2F0FB', '#5FA6CC');
    for (let k = -w / 2 + 3; k < w / 2 - 1; k += 4) p(k, -DOME.h, 1, DOME.h, '#F2FAFE');
    p(-w / 2, -1, w, 1, '#E8F6FC');
  });
  const top = SCHOOL2.dome[SCHOOL2.dome.length - 1];
  if (T >= top.t + 0.2) {
    const y = base - DOME.h * DOME.rows.length;
    at(DOME.cx, y); cube(-1.5, -3, 3, 3, 3, C.gold, '#FFE08A', C.goldD);
    const sh = ((AMB * 0.4) % 2) - 0.5;
    if (sh > 0 && sh < 1) { ctx.globalAlpha = 0.5; for (let i = 0; i < 5; i++) R(DOME.cx - 16 + sh * 30 + i * 0.5, base - 3 - i * 3, 1.5, 3, '#FFFFFF'); ctx.globalAlpha = 1; }
  }
}
function drawChimneySmoke(T) {
  if (T < SCHOOL2.chimneyT) return;
  const x = bx(-9) + 6, y = by(11) - 6;
  for (let i = 0; i < 5; i++) {
    const ph = (AMB * 0.45 + i / 5) % 1;
    ctx.globalAlpha = 0.5 * (1 - ph) * clamp((T - SCHOOL2.chimneyT) / 0.5, 0, 1);
    disc(x + Math.sin(AMB + i) * 2 + ph * 10, y - ph * 26, 2 + ph * 4, '#F4F0EA');
    ctx.globalAlpha = 1;
  }
}
function drawScaffold(T) {
  const [a, b] = SCHOOL2.scaffold;
  if (T < a - 0.3 || T > b + 0.4) return;
  const s = T < a ? ease.back(clamp((T - a + 0.3) / 0.3, 0, 1)) : T > b ? 1 - clamp((T - b) / 0.4, 0, 1) : 1;
  if (s <= 0) return;
  const top = by(8) + 2, x0 = 298, x1 = 356, h = (G - 2 - top) * s;
  at(0, 0);
  for (const x of [x0, (x0 + x1) / 2, x1]) cube(x, G - 2 - h, 2, h, 2, '#C9A35E', '#DDBB78', '#9E7E44');
  for (let yy = G - 2 - 12; yy > G - 2 - h; yy -= 14) { cube(x0, yy, x1 - x0 + 2, 1.5, 6, '#B38A48'); wline(x0 + 1, yy, (x0 + x1) / 2 + 1, yy - 12, 0.6, '#9E7E44'); }
  if (s >= 1) cube(x0 - 2, top, x1 - x0 + 6, 2, 10, '#B98552', '#D29D68', '#8A5C33');
}
// the grand staircase (seen through the lobby once the front wall is open)
function drawStairs(x0, yB, T) {
  const a = T - SCHOOL2.stairs;
  if (a < 0) return;
  for (let k = 0; k < 7; k++) {
    const s = clamp((a - k * 0.06) / 0.18, 0, 1);
    if (s <= 0) continue;
    at(x0 + 6 + k * 4, yB - 3 - k * 0.5, false, 1, s);
    cube(0, -3 - k * 3, 6, 3 + k * 3, 6, '#B98552', '#D9A774', '#8A5C33');
    p(0, -3 - k * 3, 6, 1, '#E8BC88');
  }
  at(0, 0); wline(x0 + 6, yB - 8, x0 + 34, yB - 30, 0.7, C.gold);
}

// ---------- the whole V2 building ----------
// o.cut = { out, back }: story times when the front wall flies off, and when it flies back
function cutState(b, T, cut) {
  if (!cut || !isRemovable(b)) return 0;
  const w = (b.x - 20) / 360 * 1.2 + rnd(b.c * 7 + b.r) * 0.08;
  const tout = cut.out + w, tback = cut.back != null ? cut.back + w : 1e9;
  if (T < tout) return 0;
  if (T < tout + 0.5) return (T - tout) / 0.5;
  if (T < tback - 0.4) return 1;
  if (T < tback) return 1 - (T - (tback - 0.4)) / 0.4 * 0.999;
  return 0;
}
function rectCut(rect, T, cut) {
  if (!cut) return false;
  const st = cutState({ c: rect[0], r: rect[1], x: bx(rect[0]) }, T, cut);
  return st > 0;
}
function drawSchool2(T, o = {}) {
  const cut = o.cut && T >= o.cut.out - 0.01 ? o.cut : null;
  schoolShadow(T, 45, bx(-13));
  const flying = [];
  // structure first; with the front open, the wall pieces still standing are drawn after the rooms
  for (const b of SCHOOL2.all) {
    if (T < b.t) continue;
    if (cut && isRemovable(b)) continue;
    placedBlock(b, T);
  }
  if (cut) {
    drawRooms(T, o);
    for (const b of SCHOOL2.all) {
      if (T < b.t || !isRemovable(b)) continue;
      const st = cutState(b, T, cut);
      if (st === 0) placedBlock(b, T, true);
      else if (st < 1) flying.push([b, st]);
    }
  }
  const skip = cut ? rect => rectCut(rect, T, cut) : null;
  schoolOpenings(T, o, skip);
  for (const a of SCHOOL2.arches) {
    if (skip && skip(a.rect)) continue;
    if (T < a.t + 0.16) hole(a.rect, T);
    drawArch(a, T, o.lit);
  }
  schoolDetails(T, o);
  drawDome(T);
  drawChimneySmoke(T);
  for (const [b, st] of flying) {
    const u = ease.in(st), x = b.x - u * 6 * (b.c % 3 - 1), y = b.y + u * u * 40 - Math.sin(u * Math.PI) * 6;
    ctx.globalAlpha = clamp(1.4 - u, 0, 1);
    spin(x + 4, y + 4, u * (b.c % 2 ? 3 : -3), () => blockAt(x, y, b.tex));
    ctx.globalAlpha = 1;
  }
}
// thrown wing blocks in the air
function drawFlying2(T) {
  for (const b of SCHOOL2.blocks) {
    if (b.t0 == null || T < b.t0 || T >= b.t) continue;
    const u = (T - b.t0) / (b.t - b.t0);
    const x = lerp(b.fx, b.x, u), y = lerp(b.fy, b.y, u) - b.arc * 4 * u * (1 - u);
    spin(x + 4, y + 4, Math.sin(u * Math.PI) * 0.6 * (b.side < 0 ? 1 : -1), () => blockAt(x, y, b.tex));
  }
}
