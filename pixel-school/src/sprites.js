/* ---- the crew: Opus (the lead), Sonnet (the chef), three Haikus (the builders), plus kids and a bug ---- */
const C = {
  ink: '#1F1E1D', white: '#FFFFFF',
  skin: '#D5805F', skinD: '#B9664A', lens: '#E8A386',
  suit: '#6E5340', suitD: '#4B3829', shirt: '#F6F3EE', tie: '#8E2D26', tieD: '#6B1F1B',
  chef: '#F8F6F1', chefO: '#C4BCAF', chefF: '#E2DDD3', kerch: '#C8452F', kerchD: '#9E3320',
  spoon: '#9A6534', spoonD: '#6E4522',
  vest: '#D8E25A', vestD: '#B4BE34', stripe: '#F1F3DA',
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

// ---------- OPUS 5.5 (34 wide incl. arms, 21 tall) ----------
function opusArm(side, pose) {
  const L = side < 0, m = (x, w) => L ? -x - w : x; // mirror helper for the left arm
  if (pose === 'up') { p(m(12, 4), -21, 4, 7, C.suit); p(m(13, 2), -24, 2, 3, C.suitD); }
  else if (pose === 'point') { p(m(12, 9), -15, 9, 4, C.suit); p(m(21, 2), -15, 2, 4, C.suitD); }
  else if (pose === 'salute') { p(m(12, 4), -19, 4, 5, C.suit); p(m(9, 6), -21, 6, 2, C.suitD); }
  else if (pose === 'down') { p(m(11, 3), -14, 3, 8, C.suit); p(m(11, 3), -7, 3, 2, C.suitD); }
  else { p(m(12, 5), -15, 5, 5, C.suit); p(m(14, 2), -14, 2, 3, C.suitD); }
}
function drawOpus(x, y, o = {}) {
  const ph = o.walk != null ? Math.floor(o.walk * 7) & 1 : -1;
  const bob = ph === 1 ? -1 : 0;
  at(x, y); if (!o.noShadow) shadowE(15);
  const yy = y + (o.hop || 0);
  at(x, yy);
  const legX = [-11, -7, 5, 9];
  for (let i = 0; i < 4; i++) {
    const lift = ph >= 0 && (i & 1) === ph ? 1 : 0;
    p(legX[i], -5 + bob, 2, 5 - bob - lift, C.skin);
  }
  at(x, yy + bob);
  opusArm(-1, o.armL || 'side');
  opusArm(1, o.armR || 'side');
  // head top, then the suit that wraps everything below the glasses
  p(-12, -21, 24, 4, C.skin);
  p(-12, -16, 24, 11, C.suit);
  p(-8, -16, 16, 5, C.skin);
  // shirt V, lapels, tie
  const V = [[-12, 5], [-11, 4], [-10, 3], [-9, 2], [-8, 2], [-7, 1], [-6, 1]];
  for (const [ry, hw] of V) { p(-hw, ry, hw * 2, 1, C.shirt); p(-hw - 1, ry, 1, 1, C.suitD); p(hw, ry, 1, 1, C.suitD); }
  p(-1, -12, 2, 6, C.tie); p(-1, -12, 2, 1, C.tieD);
  // glasses: band, frames, slit lenses
  const tl = o.tilt ? 1 : 0;
  p(-12, -17, 12, 1, C.ink); p(0, -17 + tl, 12, 1, C.ink);
  p(-9, -18, 6, 6, C.ink); p(3, -18 + tl, 6, 6, C.ink);
  const eyes = o.eyes || (o.blink ? 'closed' : 'normal');
  const lens = eyes === 'wide' ? C.white : C.skin;
  p(-8, -17, 4, 4, lens); p(4, -17 + tl, 4, 4, lens);
  const lk = o.look || 0;
  for (const [ex, ey] of [[-8, -17], [4, -17 + tl]]) {
    if (eyes === 'closed') p(ex, ey + 2, 4, 1, C.ink);
    else if (eyes === 'happy') { p(ex + 1, ey + 1, 2, 1, C.ink); p(ex, ey + 2, 1, 1, C.ink); p(ex + 3, ey + 2, 1, 1, C.ink); }
    else if (eyes === 'wide') p(ex + 1 + lk, ey + 1, 2, 2, C.ink);
    else if (eyes === 'up') p(ex + 1 + lk, ey, 2, 2, C.ink);
    else if (eyes === 'dizzy') { p(ex, ey, 1, 1, C.ink); p(ex + 3, ey, 1, 1, C.ink); p(ex + 1, ey + 1, 2, 2, C.ink); p(ex, ey + 3, 1, 1, C.ink); p(ex + 3, ey + 3, 1, 1, C.ink); }
    else p(ex + 1 + lk, ey, 2, 4, C.ink);
  }
  if (o.glint) { p(-8, -17, 1, 1, C.white); p(4, -17 + tl, 1, 1, C.white); }
  // held items
  if (o.item === 'roll') {
    p(-24, -14, 14, 3, '#3A72B8'); p(-24, -14, 14, 1, '#5C93D3'); p(-24, -14, 1, 3, '#DCE8F5'); p(-25, -13, 1, 1, '#DCE8F5');
  } else if (o.item === 'sheet') {
    p(-28, -20, 11, 9, '#2E6DB4'); p(-28, -20, 11, 1, '#4A86C9'); p(-27, -18, 9, 1, '#BFD8F2'); p(-27, -16, 3, 4, '#BFD8F2'); p(-23, -16, 4, 2, '#BFD8F2');
  }
  if (o.pointTo) {
    at(0, 0); pline(x + 23, yy + bob - 13, o.pointTo[0], o.pointTo[1], '#7A4E2A');
    at(x, yy + bob);
  }
  anchor(o.id || 'opus', x, yy + bob - 21 + (o.armL === 'up' || o.armR === 'up' ? -3 : 0));
}

// ---------- SONNET 5.5 (24 wide incl. sleeves, 23 tall) ----------
function drawSpoon(hx, hy, tx, ty, tipCol) {
  pline(hx, hy, tx, ty, C.spoon);
  p(tx - 1, ty - 1, 3, 3, C.spoon); p(tx - 1, ty + 1, 3, 1, C.spoonD);
  if (tipCol) p(tx - 1, ty - 1, 3, 2, tipCol);
}
function sleeve(L, raised) {
  const m = (x, w) => L ? -x - w : x;
  if (raised) { p(m(8, 4), -19, 4, 9, C.chefO); p(m(9, 2), -18, 2, 8, C.chef); p(m(9, 2), -21, 2, 2, C.skin); }
  else { p(m(8, 4), -11, 4, 4, C.chefO); p(m(8, 3), -10, 3, 2, C.chef); }
}
function drawSonnet(x, y, o = {}) {
  const ph = o.walk != null ? Math.floor(o.walk * 8) & 1 : -1;
  const bob = ph === 1 ? -1 : 0;
  at(x, y); if (!o.noShadow) shadowE(10);
  const yy = y + (o.hop || 0);
  at(x, yy, o.flip);
  const legX = [-7, -4, 3, 6];
  for (let i = 0; i < 4; i++) {
    const lift = ph >= 0 && (i & 1) === ph ? 1 : 0;
    p(legX[i], -3 + bob, 1, 3 - bob - lift, C.skin);
  }
  at(x, yy + bob, o.flip);
  const sp = o.spoon || 'up';
  sleeve(true, o.armL === 'up');
  sleeve(false, sp === 'sprinkle');
  // coat body
  p(-9, -8, 18, 5, C.chefO); p(-8, -8, 16, 4, C.chef);
  p(-3, -7, 1, 1, C.ink); p(2, -7, 1, 1, C.ink); p(-3, -5, 1, 1, C.ink); p(2, -5, 1, 1, C.ink);
  // face + neckerchief
  p(-8, -14, 16, 6, C.skin);
  p(-4, -9, 8, 1, C.kerch); p(-1, -8, 2, 1, C.kerch); p(-1, -9, 2, 1, C.kerchD);
  const eyes = o.eyes || (o.blink ? 'closed' : 'normal');
  const lk = o.look || 0;
  for (const ex of [-5, 4]) {
    if (eyes === 'closed') p(ex - (ex < 0 ? 1 : 0), -11, 2, 1, C.ink);
    else if (eyes === 'happy') { p(ex - 1, -11, 1, 1, C.ink); p(ex, -12, 1, 1, C.ink); p(ex + 1, -11, 1, 1, C.ink); }
    else if (eyes === 'wide') { p(ex - (ex < 0 ? 1 : 0), -12, 2, 2, C.white); p(ex + (lk > 0 ? 1 : 0) - (ex < 0 ? 1 : 0), -12, 1, 1, C.ink); }
    else if (eyes === 'star') { p(ex - 1, -12, 3, 1, C.gold); p(ex, -13, 1, 3, C.gold); }
    else if (eyes === 'dizzy') { p(ex - 1, -13, 1, 1, C.ink); p(ex + 1, -13, 1, 1, C.ink); p(ex, -12, 1, 1, C.ink); p(ex - 1, -11, 1, 1, C.ink); p(ex + 1, -11, 1, 1, C.ink); }
    else p(ex + lk, -12, 1, 2, C.ink);
  }
  // chef hat
  const hy = o.hatPop || 0, hx = o.hatX || 0;
  p(hx - 3, -23 + hy, 6, 2, C.chefO); p(hx - 7, -22 + hy, 14, 6, C.chefO);
  p(hx - 2, -22 + hy, 4, 1, C.chef); p(hx - 6, -21 + hy, 12, 4, C.chef);
  p(hx - 3, -20 + hy, 1, 3, C.chefF); p(hx, -20 + hy, 1, 3, C.chefF); p(hx + 3, -20 + hy, 1, 3, C.chefF);
  p(hx - 6, -17 + hy, 12, 3, C.chefO); p(hx - 5, -16 + hy, 10, 2, C.chef);
  // the spoon hand
  if (sp === 'up') {
    p(11, -10, 2, 2, C.skin);
    p(11, -17, 1, 7, C.spoon); p(10, -21, 3, 4, C.spoon); p(11, -22, 1, 1, C.spoon); p(12, -20, 1, 2, C.spoonD); p(10, -18, 1, 1, C.spoonD);
  } else if (sp === 'kiss') {
    p(3, -10, 6, 2, C.chefO); p(1, -11, 3, 2, C.skin);
  } else if (sp === 'none') {
    p(11, -10, 2, 2, C.skin);
  } else if (Array.isArray(sp)) {
    p(11, -10, 2, 2, C.skin);
    drawSpoon(12, -10, sp[0], sp[1], sp[2]);
  }
  anchor(o.id || 'sonnet', x, yy + bob - 23 + hy);
}

// ---------- HAIKU 5.5 (W = white hat, Y = yellow hat, B = blue hat; 10 wide, 13 tall) ----------
function drawHaiku(k, x, y, o = {}) {
  const ph = o.walk != null ? Math.floor(o.walk * 12) & 1 : -1;
  const bob = ph === 1 ? -1 : 0;
  at(x, y); if (!o.noShadow) shadowE(6);
  const yy = y + (o.hop || 0);
  at(x, yy, o.flip);
  const legX = [-4, -2, 1, 3];
  for (let i = 0; i < 4; i++) {
    const lift = ph >= 0 && (i & 1) === ph ? 1 : 0;
    p(legX[i], -2 + bob, 1, 2 - bob - lift, C.skin);
  }
  at(x, yy + bob, o.flip);
  const [hc, hd, hl] = HAT[k];
  // arms
  if (o.arms === 'up') { p(-7, -10, 2, 4, C.skin); p(5, -10, 2, 4, C.skin); }
  else if (o.arms === 'throw') { p(-7, -6, 2, 2, C.skin); p(5, -11, 2, 5, C.skin); }
  else if (o.arms === 'salute') { p(-7, -6, 2, 2, C.skin); p(5, -9, 2, 3, C.skin); p(3, -10, 3, 1, C.skin); }
  else { p(-7, -6, 2, 2, C.skin); p(5, -6, 2, 2, C.skin); }
  // vest, belt, head
  p(-5, -6, 10, 3, C.vest); p(-5, -4, 10, 1, C.stripe);
  p(-5, -3, 10, 1, '#6E4B2C'); p(-1, -3, 2, 1, '#C9A04A');
  p(-5, -9, 10, 3, C.skin);
  const eyes = o.eyes || (o.blink ? 'closed' : 'normal');
  const lk = o.look || 0;
  for (const ex of [-3, 2]) {
    if (eyes === 'closed') p(ex - (ex < 0 ? 1 : 0), -7, 2, 1, C.ink);
    else if (eyes === 'happy') { p(ex - 1, -7, 1, 1, C.ink); p(ex, -8, 1, 1, C.ink); p(ex + 1, -7, 1, 1, C.ink); }
    else if (eyes === 'dizzy') { p(ex - 1, -8, 1, 1, C.ink); p(ex + 1, -8, 1, 1, C.ink); p(ex, -7, 1, 1, C.ink); }
    else if (eyes === 'wide') { p(ex - (ex < 0 ? 1 : 0), -8, 2, 2, C.white); p(ex + (lk > 0 ? 1 : 0) - (ex < 0 ? 1 : 0), -8, 1, 1, C.ink); }
    else p(ex + lk, -8, 1, 2, C.ink);
  }
  // hard hat
  const hy = o.hatPop || 0;
  p(-6, -10 + hy, 12, 1, hc); p(-4, -12 + hy, 8, 2, hc); p(-3, -13 + hy, 6, 1, hc);
  p(-1, -13 + hy, 1, 3, hd); p(-6, -10 + hy, 12, 1, hd); p(-5, -10 + hy, 10, 1, hc); p(-3, -12 + hy, 1, 1, hl);
  // items
  const it = o.item;
  if (it === 'clip') {
    p(-12, -9, 5, 7, C.wood); p(-11, -8, 3, 5, C.white); p(-11, -10, 3, 1, C.steel);
    for (let i = 0; i < 3; i++) { const ry = -8 + i * 2; p(-11, ry, 1, 1, i < (o.checks || 0) ? '#3DA35D' : '#9AA0A6'); p(-10, ry, 2, 1, '#C9CDD2'); }
  } else if (it === 'hammer') {
    if (o.hammerDown) { p(6, -5, 5, 1, C.woodD); p(10, -7, 2, 4, C.steel); p(11, -7, 1, 4, C.steelD); }
    else { p(6, -10, 1, 6, C.woodD); p(4, -11, 5, 2, C.steel); p(4, -10, 5, 1, C.steelD); }
  } else if (it === 'tape') {
    p(6, -7, 3, 3, '#F2C230'); p(7, -6, 1, 1, '#9A7414');
    const L = o.tapeLen != null ? o.tapeLen : 6;
    if (L > 0) { p(9, -6, L, 1, '#F5DE7A'); for (let i = 1; i < L; i += 2) p(9 + i, -6, 1, 1, '#B89A3A'); p(9 + L, -7, 1, 2, C.steelD); }
  } else if (it === 'bucket') {
    p(6, -7, 4, 4, C.steel); p(6, -7, 4, 1, '#B8B6AE'); p(7, -8, 2, 1, C.steelD); p(9, -6, 1, 3, C.steelD);
  } else if (it === 'block') {
    blockAt(SPX - 4, SPY - 21, 8);
  }
  anchor(o.id || ('h' + k), x, yy + bob - 13 + hy);
}

// ---------- kids (tiny Clawds with backpacks) ----------
const PACKS = ['#E24B4B', '#3D7DDB', '#3DAA5C', '#9A5BD0', '#F2B632', '#EE6FA8'];
function drawKid(x, y, o = {}) {
  const ph = o.walk != null ? Math.floor(o.walk * 10) & 1 : -1;
  at(x, y); shadowE(4);
  const yy = y + (o.hop || 0);
  at(x, yy, o.flip);
  const legX = [-3, -2, 1, 2];
  for (let i = 0; i < 4; i++) { const lift = ph >= 0 && (i & 1) === ph ? 1 : 0; p(legX[i], -2, 1, 2 - lift, C.skin); }
  const pc = PACKS[(o.pack || 0) % PACKS.length];
  p(-6, -7, 2, 5, pc); p(-6, -7, 2, 1, '#00000022');
  p(-4, -7, 8, 5, C.skin);
  p(-4, -5, 1, 1, pc);
  p(4, -5, 1, 1, C.skin);
  const lk = o.look || 0;
  if (o.eyes === 'happy') { p(-2, -5, 1, 1, C.ink); p(1, -5, 1, 1, C.ink); p(-3, -4, 1, 1, C.ink); p(2, -4, 1, 1, C.ink); }
  else { p(-2 + lk, -6, 1, 2, C.ink); p(1 + lk, -6, 1, 2, C.ink); }
  anchor(o.id || 'kid', x, yy - 8);
}

// ---------- the bug ----------
function drawBug(x, y, t, o = {}) {
  at(x, y, o.flip);
  const f = Math.floor(t * 14) & 1;
  for (const lx of [-3, -1, 1]) p(lx - f, -1, 1, 1, '#2C2235');
  p(-4, -5, 7, 4, '#8A55C2'); p(-3, -5, 5, 1, '#B08AE0'); p(-1, -5, 1, 4, '#5B3784');
  p(-3, -3, 1, 1, '#5B3784'); p(1, -3, 1, 1, '#5B3784');
  p(3, -4, 3, 3, '#2C2235'); p(4, -4, 1, 1, '#FFFFFF');
  p(5, -5, 1, 1, '#2C2235'); p(6, -6, 1, 1, '#2C2235');
}
