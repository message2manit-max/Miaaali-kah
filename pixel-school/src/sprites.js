/* ---- the crew, built from shaded cubes: Opus (the lead), Sonnet (the chef), three Haikus (the builders),
        baby critters for students, and one bug. Every pose blends continuously. ---- */
const C = {
  ink: '#1F1E1D', white: '#FFFFFF',
  skin: '#D5805F', lens: '#D5805F',
  suit: '#6E5340', suitD: '#4B3829', shirt: '#F6F3EE', tie: '#8E2D26', tieD: '#6B1F1B',
  chef: '#F8F6F1', chefO: '#C4BCAF', chefF: '#E2DDD3', chefSide: '#D9D2C5', kerch: '#C8452F', kerchD: '#9E3320',
  spoon: '#9A6534', spoonD: '#6E4522',
  vest: '#D8E25A', stripe: '#F1F3DA', belt: '#6E4B2C',
  wood: '#A87445', woodD: '#7A5230', steel: '#8E949C', steelD: '#686E76',
  gold: '#F2B632', goldD: '#C98A16', sparkle: '#FFF3A6',
};
const HAT = {
  W: ['#F4F2EC', '#C8C3B8', '#FFFFFF'],
  Y: ['#EDB43A', '#C98E1F', '#FFD873'],
  B: ['#3F63C9', '#2B4799', '#7393E6'],
};
// head-top anchors, refreshed every frame, used to place speech bubbles
const A = {};
function anchor(id, x, y) { A[id] = [x, y]; }

// shared motion: walk cycle, talking bounce, breathing, squash
function critterState(o, id, seed, hz) {
  const walking = o.walk != null;
  const ph = walking ? o.walk * hz * Math.PI * 2 : 0;
  let bob = walking ? -Math.abs(Math.sin(ph)) * (o.bobAmp || 0.9) : 0;
  const talk = TALK[id] || 0;
  if (talk) bob -= Math.abs(Math.sin(AMB * 12.5 + seed)) * 0.55 * talk;
  const breath = Math.sin(AMB * 2.2 + seed * 1.7) * 0.014;
  const sq = o.sq || [1, 1];
  const tsq = talk ? Math.sin(AMB * 25 + seed) * 0.022 * talk : 0;
  return {
    bob, sx: sq[0] * (1 - breath * 0.5 - tsq * 0.5), sy: sq[1] * (1 + breath + tsq),
    leg(i) {
      if (!walking) return { lift: 0, dx: 0 };
      const a = ph + (i & 1) * Math.PI;
      return { lift: Math.max(0, Math.sin(a)) * 1.6, dx: Math.cos(a) * 0.55 };
    },
  };
}
function eyeOpen(o, seed) { return o.blink === true ? 0 : 1 - blinkAmt(seed); }
// arm poses are blended from weights, so a raise or a point eases in instead of popping
function armW(spec, wave) {
  let w;
  if (spec == null || spec === 'side') w = {};
  else if (typeof spec === 'number') w = { up: spec };
  else if (typeof spec === 'string') w = { [spec]: 1 };
  else w = Object.assign({}, spec);
  if (wave) w.up = (w.up || 0) * (0.75 + 0.25 * Math.sin(AMB * 14));
  return w;
}
function blendPose(table, w) {
  const base = table.side, out = {};
  for (const part in base) {
    out[part] = base[part].slice();
    for (const k in w) {
      const v = w[k], P = table[k];
      if (!v || !P) continue;
      for (let i = 0; i < 4; i++) out[part][i] += (P[part][i] - base[part][i]) * v;
    }
  }
  return out;
}
const mirX = (r, side) => side < 0 ? [-r[0] - r[2], r[1], r[2], r[3]] : r;

// ---------- OPUS 5.5 (34 wide incl. arms, 21 tall) ----------
const OPUS_ARM = {
  side: { a: [12, -15, 5, 5], h: [14, -14, 2, 3] },
  up: { a: [12, -22, 4, 7], h: [13, -25, 2, 3] },
  point: { a: [12, -15, 9, 4], h: [21, -15, 2, 4] },
  salute: { a: [12, -19, 4, 5], h: [7, -21, 8, 2] },
  down: { a: [11, -14, 3, 8], h: [11, -7, 3, 2] },
};
function opusArm(P, side) {
  const a = mirX(P.a, side), h = mirX(P.h, side);
  cube(a[0], a[1], a[2], a[3], 6, C.suit);
  p(h[0], h[1], h[2], h[3], C.suitD);
}
function drawOpus(x, y, o = {}) {
  const id = o.id || 'opus', st = critterState(o, id, 1, 2.2);
  if (!o.noShadow) groundShadow(x + 3, y, 16, o.hop);
  const yy = y + (o.hop || 0);
  at(x, yy, false, st.sx, st.sy);
  const legX = [-11, -7, 5, 9];
  for (let i = 0; i < 4; i++) { const L = st.leg(i); cube(legX[i] + L.dx, -5 + st.bob, 2, 5 - st.bob - L.lift, 4, C.skin); }
  at(x, yy + st.bob, false, st.sx, st.sy);
  const AL = blendPose(OPUS_ARM, armW(o.armL, o.waveL)), AR = blendPose(OPUS_ARM, armW(o.armR, o.waveR));
  opusArm(AL, -1);
  // suit + head as two stacked cubes
  cube(-12, -16, 24, 11, 12, C.suit);
  cube(-12, -21, 24, 5, 12, C.skin);
  wrapRow(-12, 24, -17, 12, C.ink);
  p(-8, -16, 16, 5, C.skin);
  // shirt V, lapels, tie
  for (const [ry, hw] of [[-12, 5], [-11, 4], [-10, 3], [-9, 2], [-8, 2], [-7, 1], [-6, 1]]) { p(-hw, ry, hw * 2, 1, C.shirt); p(-hw - 1, ry, 1, 1, C.suitD); p(hw, ry, 1, 1, C.suitD); }
  p(-1, -12, 2, 6, C.tie); p(-1, -12, 2, 1, C.tieD);
  p(-12, -6, 24, 1, C.suitD);
  // glasses: band, frames, slit lenses
  const tl = o.tilt || 0;
  p(-12, -17, 12, 1, C.ink); p(0, -17 + tl, 12, 1, C.ink);
  p(-9, -18, 6, 6, C.ink); p(3, -18 + tl, 6, 6, C.ink);
  const eyes = o.eyes || 'normal', open = eyeOpen(o, 1);
  const lens = eyes === 'wide' ? C.white : C.skin;
  p(-8, -17, 4, 4, lens); p(4, -17 + tl, 4, 4, lens);
  const lk = clamp(o.look || 0, -1, 1);
  for (const [ex, ey] of [[-8, -17], [4, -17 + tl]]) {
    if (eyes === 'happy') { p(ex + 1, ey + 1, 2, 1, C.ink); p(ex, ey + 2, 1, 1, C.ink); p(ex + 3, ey + 2, 1, 1, C.ink); }
    else if (eyes === 'wide') p(ex + 1 + lk, ey + 1, 2, 2, C.ink);
    else if (eyes === 'dizzy') { p(ex, ey, 1, 1, C.ink); p(ex + 3, ey, 1, 1, C.ink); p(ex + 1, ey + 1, 2, 2, C.ink); p(ex, ey + 3, 1, 1, C.ink); p(ex + 3, ey + 3, 1, 1, C.ink); }
    else if (eyes === 'closed' || open < 0.3) p(ex, ey + 2, 4, 1, C.ink);
    else { const h = (eyes === 'up' ? 2 : 4) * open; p(ex + 1 + lk, ey + (eyes === 'up' ? 0 : (4 - h) / 2), 2, h, C.ink); }
  }
  if (o.glint != null && o.glint > 0 && o.glint < 1) { const gx = o.glint * 5; p(-8 + gx - 1, -17, 1, 2, C.white); p(4 + gx - 1, -17 + tl, 1, 2, C.white); }
  opusArm(AR, 1);
  if (o.item === 'roll') {
    cube(-25, -14, 13, 3, 4, '#3A72B8', '#5C93D3', '#2A5590'); p(-25, -14, 1, 3, '#DCE8F5');
  } else if (o.item === 'sheet') {
    cube(-29, -21, 11, 9, 2, '#2E6DB4', '#4A86C9', '#1F4F86');
    p(-28, -19, 9, 1, '#BFD8F2'); p(-28, -17, 3, 4, '#BFD8F2'); p(-24, -17, 4, 2, '#BFD8F2'); p(-24, -14, 4, 1, '#BFD8F2');
  }
  if (o.pointTo) {
    const hx = x + (AR.h[0] + AR.h[2]) * st.sx, hy = yy + st.bob + (AR.h[1] + 2) * st.sy;
    wline(hx, hy, o.pointTo[0], o.pointTo[1], 0.8, '#7A4E2A');
  }
  const raised = Math.max(AL.a[1] < -18 ? 1 : 0, AR.a[1] < -18 ? 1 : 0);
  anchor(id, x, yy + st.bob - 21 * st.sy - 3 * raised);
}

// ---------- SONNET 5.5 (24 wide incl. sleeves, 23 tall) ----------
const SON_SLEEVE = { side: { s: [8, -11, 4, 4], h: [12, -10, 2, 2] }, up: { s: [8, -19, 4, 9], h: [9, -21, 2, 2] } };
function sonSleeve(P, side, hand) {
  const s = mirX(P.s, side);
  cube(s[0], s[1], s[2], s[3], 6, C.chef, C.white, C.chefSide);
  p(s[0], s[1] + s[3] - 1, s[2], 1, C.chefO);
  if (hand) { const h = mirX(P.h, side); p(h[0], h[1], h[2], h[3], C.skin); }
}
function drawSonnet(x, y, o = {}) {
  const id = o.id || 'sonnet', st = critterState(o, id, 2, 2.6);
  if (!o.noShadow) groundShadow(x + 2, y, 11, o.hop);
  const yy = y + (o.hop || 0);
  at(x, yy, o.flip, st.sx, st.sy);
  const legX = [-7, -4, 3, 6];
  for (let i = 0; i < 4; i++) { const L = st.leg(i); cube(legX[i] + L.dx, -3 + st.bob, 1, 3 - st.bob - L.lift, 3, C.skin); }
  at(x, yy + st.bob, o.flip, st.sx, st.sy);
  const sp = o.spoon || 'up';
  const upL = typeof o.armL === 'number' ? o.armL : o.armL === 'up' ? 1 : 0;
  const upR = sp === 'sprinkle' ? 1 : typeof o.armR === 'number' ? o.armR : 0;
  const SL = blendPose(SON_SLEEVE, { up: upL }), SR = blendPose(SON_SLEEVE, { up: upR });
  const mirrored = SPF < 0; // when mirrored, the spoon arm sits on the left, so it is drawn first
  if (mirrored) sonSleeve(SR, 1, sp !== 'kiss'); else sonSleeve(SL, -1, upL > 0.5);
  // coat
  cube(-9, -8, 18, 5, 10, C.chef, C.white, C.chefSide);
  p(-9, -8, 1, 5, C.chefO); p(8, -8, 1, 5, C.chefO); p(-9, -4, 18, 1, C.chefO);
  p(-3, -7, 1, 1, C.ink); p(2, -7, 1, 1, C.ink); p(-3, -5, 1, 1, C.ink); p(2, -5, 1, 1, C.ink);
  // face + neckerchief
  cube(-8, -14, 16, 6, 10, C.skin);
  p(-4, -9, 8, 1, C.kerch); p(-1, -8, 2, 1, C.kerch); p(-1, -9, 2, 1, C.kerchD);
  const eyes = o.eyes || 'normal', open = eyeOpen(o, 2), lk = clamp(o.look || 0, -1, 1);
  for (const ex of [-5, 4]) {
    if (eyes === 'happy') { p(ex - 1, -11, 1, 1, C.ink); p(ex, -12, 1, 1, C.ink); p(ex + 1, -11, 1, 1, C.ink); }
    else if (eyes === 'wide') { p(ex - (ex < 0 ? 1 : 0), -12, 2, 2, C.white); p(ex + (lk > 0 ? 1 : 0) - (ex < 0 ? 1 : 0), -12, 1, 1, C.ink); }
    else if (eyes === 'star') { const tw = 1 + Math.sin(AMB * 18) * 0.3; p(ex + 0.5 - 1.5 * tw, -11.5, 3 * tw, 1, C.gold); p(ex, -12.5 - tw, 1, 1 + 2 * tw, C.gold); }
    else if (eyes === 'dizzy') { p(ex - 1, -13, 1, 1, C.ink); p(ex + 1, -13, 1, 1, C.ink); p(ex, -12, 1, 1, C.ink); p(ex - 1, -11, 1, 1, C.ink); p(ex + 1, -11, 1, 1, C.ink); }
    else if (eyes === 'closed' || open < 0.3) p(ex - (ex < 0 ? 1 : 0), -11, 2, 1, C.ink);
    else { const h = 2 * open; p(ex + lk, -12 + (2 - h) / 2, 1, h, C.ink); }
  }
  // chef hat
  const hy = o.hatPop || 0, hx = o.hatX || 0;
  cube(hx - 6, -17 + hy, 12, 3, 10, C.chef, C.white, C.chefSide);
  p(hx - 6, -17 + hy, 1, 3, C.chefO); p(hx + 5, -17 + hy, 1, 3, C.chefO);
  cube(hx - 7, -23 + hy, 14, 6, 12, C.chef, C.white, C.chefSide);
  cube(hx - 3, -24 + hy, 6, 1, 8, C.chef, C.white, C.chefSide);
  p(hx - 7, -23 + hy, 1, 6, C.chefO); p(hx + 6, -23 + hy, 1, 6, C.chefO); p(hx - 7, -18 + hy, 14, 1, C.chefO);
  p(hx - 3, -21 + hy, 1, 3, C.chefF); p(hx, -22 + hy, 1, 4, C.chefF); p(hx + 3, -21 + hy, 1, 3, C.chefF);
  // the spoon arm
  if (!mirrored) sonSleeve(SR, 1, sp !== 'kiss'); else sonSleeve(SL, -1, upL > 0.5);
  if (sp === 'up') {
    p(11, -17, 1, 7, C.spoon); p(10, -21, 3, 4, C.spoon); p(11, -22, 1, 1, C.spoon); p(12, -20, 1, 2, C.spoonD); p(10, -18, 1, 1, C.spoonD);
  } else if (sp === 'kiss') {
    cube(3, -10, 6, 2, 4, C.chef, C.white, C.chefSide); p(1, -11, 3, 2, C.skin);
  } else if (Array.isArray(sp)) {
    const hx0 = x + SPF * 13 * st.sx, hy0 = yy + st.bob - 9 * st.sy;
    const tx = x + SPF * sp[0] * st.sx, ty = yy + st.bob + sp[1] * st.sy;
    wline(hx0, hy0, tx, ty, 1, C.spoon);
    disc(tx, ty, 1.6, sp[2] || C.spoon);
  }
  anchor(id, x, yy + st.bob - 24 * st.sy + hy);
}

// ---------- HAIKU 5.5 (W = white hat, Y = yellow hat, B = blue hat; 10 wide, 13 tall) ----------
const HK_ARM = {
  side: { a: [5, -6, 2, 2] }, up: { a: [5, -11, 2, 5] }, throw: { a: [5, -12, 2, 6] }, salute: { a: [3, -11, 4, 2] },
};
function drawHaiku(k, x, y, o = {}) {
  const id = o.id || ('h' + k), seed = k === 'W' ? 3 : k === 'Y' ? 4 : 5;
  const st = critterState(o, id, seed, o.walkHz || 4.4);
  if (!o.noShadow) groundShadow(x + 2, y, 7, o.hop);
  const yy = y + (o.hop || 0);
  at(x, yy, o.flip, st.sx, st.sy);
  const legX = [-4, -2, 1, 3];
  for (let i = 0; i < 4; i++) { const L = st.leg(i); cube(legX[i] + L.dx * 0.6, -2 + st.bob, 1, 2 - st.bob - L.lift * 0.7, 2, C.skin); }
  at(x, yy + st.bob, o.flip, st.sx, st.sy);
  const [hc, hd, hl] = HAT[k];
  const spec = typeof o.arms === 'string' ? { [o.arms]: 1 } : (o.arms || {});
  const Lw = o.armsL != null ? (typeof o.armsL === 'number' ? { up: o.armsL } : o.armsL) : (spec.up ? { up: spec.up } : {});
  const L = blendPose(HK_ARM, Lw), Rr = blendPose(HK_ARM, spec);
  const la = mirX(L.a, -1); cube(la[0], la[1], la[2], la[3], 4, C.skin);
  // vest, stripe, belt, head
  cube(-5, -6, 10, 4, 8, C.vest);
  p(-5, -4, 10, 1, C.stripe); wrapRow(-5, 10, -4, 8, shade(C.stripe, -0.2));
  p(-5, -3, 10, 1, C.belt); wrapRow(-5, 10, -3, 8, shade(C.belt, -0.25)); p(-1, -3, 2, 1, '#C9A04A');
  cube(-5, -9, 10, 3, 8, C.skin);
  const eyes = o.eyes || 'normal', open = eyeOpen(o, seed), lk = clamp(o.look || 0, -1, 1);
  for (const ex of [-3, 2]) {
    if (eyes === 'happy') { p(ex - 1, -7, 1, 1, C.ink); p(ex, -8, 1, 1, C.ink); p(ex + 1, -7, 1, 1, C.ink); }
    else if (eyes === 'dizzy') { p(ex - 1, -8, 1, 1, C.ink); p(ex + 1, -8, 1, 1, C.ink); p(ex, -7, 1, 1, C.ink); }
    else if (eyes === 'wide') { p(ex - (ex < 0 ? 1 : 0), -8, 2, 2, C.white); p(ex + (lk > 0 ? 1 : 0) - (ex < 0 ? 1 : 0), -8, 1, 1, C.ink); }
    else if (eyes === 'closed' || open < 0.3) p(ex - (ex < 0 ? 1 : 0), -7, 2, 1, C.ink);
    else { const h = 2 * open; p(ex + lk, -8 + (2 - h) / 2, 1, h, C.ink); }
  }
  // hard hat
  const hy = o.hatPop || 0;
  cube(-6, -10 + hy, 12, 1, 12, hc, lite(hc), hd);
  cube(-4, -12 + hy, 8, 2, 8, hc, lite(hc), hd);
  cube(-3, -13 + hy, 6, 1, 6, hc, lite(hc), hd);
  p(-1, -13 + hy, 1, 3, hd); p(-3, -12 + hy, 1, 1, hl);
  const ra = Rr.a; cube(ra[0], ra[1], ra[2], ra[3], 4, C.skin);
  // items
  const it = o.item;
  if (it === 'clip') {
    cube(-12, -9, 5, 7, 2, C.wood); p(-11, -8, 3, 5, C.white); p(-11, -10, 3, 1, C.steel);
    for (let i = 0; i < 3; i++) { const ry = -8 + i * 2; p(-11, ry, 1, 1, i < (o.checks || 0) ? '#3DA35D' : '#9AA0A6'); p(-10, ry, 2, 1, '#C9CDD2'); }
  } else if (it === 'hammer') {
    const a = o.hammerDown || 0;
    spin(x + SPF * 6.5 * st.sx, yy + st.bob - 5 * st.sy, a * 1.4 * SPF, () => { p(6, -10, 1, 6, C.woodD); cube(4, -12, 5, 2, 4, C.steel); });
  } else if (it === 'tape') {
    cube(6, -7, 3, 3, 4, '#F2C230'); p(7, -6, 1, 1, '#9A7414');
    const Lt = o.tapeLen != null ? o.tapeLen : 6;
    if (Lt > 0.3) { p(9, -6, Lt, 1, '#F5DE7A'); for (let i = 1; i < Lt; i += 2) p(9 + i, -6, 1, 1, '#B89A3A'); p(9 + Lt, -7, 1, 2, C.steelD); }
  } else if (it === 'bucket') {
    cube(6, -7, 4, 4, 4, C.steel); p(6, -7, 4, 1, '#C4C2BC'); p(7, -8, 2, 1, C.steelD);
  }
  anchor(id, x, yy + st.bob - 13 * st.sy + hy);
}

// ---------- baby critters (students) ----------
const PACKS = ['#E24B4B', '#3D7DDB', '#3DAA5C', '#9A5BD0', '#F2B632', '#EE6FA8', '#2CB5B0', '#F07A2E'];
function drawKid(x, y, o = {}) {
  const id = o.id || 'kid', st = critterState(o, id, 7 + (o.pack || 0), 4);
  if (!o.noShadow) groundShadow(x + 1.5, y, 5, o.hop);
  const yy = y + (o.hop || 0);
  at(x, yy, o.flip, st.sx, st.sy);
  const legX = [-3, -2, 1, 2];
  for (let i = 0; i < 4; i++) { const L = st.leg(i); cube(legX[i] + L.dx * 0.5, -2 + st.bob, 1, 2 - st.bob - L.lift * 0.6, 2, C.skin); }
  at(x, yy + st.bob, o.flip, st.sx, st.sy);
  const pc = PACKS[(o.pack || 0) % PACKS.length];
  const packFirst = SPF > 0; // the backpack sits behind the critter's back
  if (packFirst) cube(-6, -7, 2, 5, 4, pc);
  cube(-4, -7, 8, 5, 6, C.skin);
  p(-4, -5, 1, 1, pc);
  const lk = clamp(o.look || 0, -1, 1), open = eyeOpen(o, 7 + (o.pack || 0));
  if (o.eyes === 'happy') { p(-2, -5, 1, 1, C.ink); p(1, -5, 1, 1, C.ink); p(-3, -4, 1, 1, C.ink); p(2, -4, 1, 1, C.ink); }
  else if (open < 0.3) { p(-2, -5, 1, 1, C.ink); p(1, -5, 1, 1, C.ink); }
  else { p(-2 + lk, -6, 1, 2 * open, C.ink); p(1 + lk, -6, 1, 2 * open, C.ink); }
  cube(4, -5, 1, 1, 2, C.skin);
  if (!packFirst) cube(-6, -7, 2, 5, 4, pc);
  anchor(id, x, yy + st.bob - 9);
}

// ---------- the bug ----------
function drawBug(x, y, t, o = {}) {
  at(x, y, o.flip);
  const f = Math.sin(AMB * 40) > 0 ? 1 : 0;
  for (const lx of [-3, -1, 1]) p(lx - f, -1, 1, 1, '#2C2235');
  cube(-4, -5, 7, 4, 6, '#8A55C2', '#B08AE0', '#5E3A8A');
  p(-1, -5, 1, 4, '#5B3784'); p(-3, -3, 1, 1, '#5B3784'); p(1, -3, 1, 1, '#5B3784');
  cube(3, -4, 3, 3, 4, '#2C2235', '#453852', '#1A1420'); p(4, -4, 1, 1, '#FFFFFF');
  p(5, -5, 1, 1, '#2C2235'); p(6, -6 + f * 0.5, 1, 1, '#2C2235');
}
