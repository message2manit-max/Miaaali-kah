/* ---- the script: ten scenes, each a pure function of its local time ---- */
const SCENES = [];
function scene(o) { SCENES.push(o); }
let ST = {}; // story start time of each scene, by id
const WIDE = [200, 70, 2.85];
const B3 = ['W', 'Y', 'B'];

// the world behind the crew: sky, hills, lawn, trees, the school and the playground
function world(T, o = {}) {
  drawBackdrop();
  walkers();
  const d = SCHOOL.decor;
  drawTree(100, T, d.trees, true);
  drawTree(298, T, d.trees + 0.15, false);
  drawSchool(T, o);
  drawFlowers(T, d.flowers);
  drawSwing(322, T, d.swing);
  drawSlide(352, T, d.slide);
}
// tiny critters strolling along the far hills, and a few blocky birds
function walkers() {
  const ccx = cam.x + VW / (2 * cam.s), ox = (ccx - 200) * 0.45;
  for (let i = 0; i < 3; i++) {
    const x = ((i * 157 + AMB * (3 + i)) % 520) - 140 + ox;
    const h = Math.round((10 + 7 * Math.sin(x * 0.035 + 1) + 4 * Math.sin(x * 0.09 + 3)) / 2) * 2;
    const yy = 116 - h - 2 - Math.abs(Math.sin(AMB * 8 + i)) * 0.5;
    R(x, yy - 3, 4, 3, '#C9785A'); R(x + 0.5, yy, 0.6, 0.8, '#C9785A'); R(x + 2.8, yy, 0.6, 0.8, '#C9785A'); R(x + 1, yy - 2.4, 0.5, 0.8, '#3A2A20'); R(x + 2.6, yy - 2.4, 0.5, 0.8, '#3A2A20');
  }
  for (let i = 0; i < 2; i++) {
    const bxw = ((AMB * (14 + i * 5) + i * 230) % 700) - 200 + (ccx - 200) * 0.7, byw = 6 + i * 16 + Math.sin(AMB * 1.5 + i) * 3;
    const f = Math.sin(AMB * 14 + i * 2) > 0 ? -1.5 : 1;
    R(bxw, byw, 4, 1.5, '#4A5468'); R(bxw + 1, byw + f, 2, 1.5, '#4A5468');
  }
}
function finishLayer(T, t, lines, o = {}) {
  drawFlying(T);
  if (!o.noTint) drawTint();
  drawBubbles(t, lines);
}

// ---------- 1. Meet the crew (the "Meet the 5.5 family" card) ----------
scene({
  id: 'intro', title: 'Meet the crew', dur: 7.0, noTint: true,
  sfx: [[0.62, 'thud'], [1.32, 'thud'], [2.02, 'pop', { f: 300 }], [2.14, 'pop', { f: 340 }], [2.26, 'pop', { f: 380 }],
    [3.0, 'hammer'], [3.25, 'hammer', { n: 1 }], [3.5, 'hammer', { n: 2 }], [3.3, 'twinkle'], [3.62, 'check'], [3.82, 'check'], [4.02, 'check'],
    [4.32, 'swoosh'], [4.72, 'stamp'], [5.15, 'boing'], [5.3, 'boing'], [5.45, 'boing'], [5.75, 'twinkle']],
  draw(t) {
    setCam(0, 0, 5, shakeAt(t, [[4.72, 6, 0.35]]));
    S(0, 0, VW, VH, '#F0EDE6');
    const GY = 80;
    // falling in with gravity, then a squashy landing
    // falling in with gravity, a squashy landing, then a cheer
    const drop = (tl, extra) => {
      if (t < tl - 0.38) return null;
      if (t < tl) { const u = (t - (tl - 0.38)) / 0.38; return { hop: -Math.pow(1 - u, 2) * 110, sq: [0.9, 1.12] }; }
      const a = jump(t, [[tl, 0.26, 3]]), b = jump(t, extra);
      return { hop: a.y + b.y, sq: [a.sq[0] * b.sq[0], a.sq[1] * b.sq[1]] };
    };
    let d;
    if ((d = drop(0.62, [[5.7, 0.3, 3]]))) drawOpus(40, GY, { ...d, glint: prog(t, 3.25, 3.6) || prog(t, 5.7, 6.05), armR: { salute: ramp(t, 5.75, 6.15) } });
    if ((d = drop(1.32, [[5.3, 0.3, 4]]))) drawSonnet(96, GY, { ...d, armL: ramp(t, 5.3, 5.8) });
    const hk = [[142, 2.02, 'W', -1, 0], [162, 2.26, 'B', 1, 2], [152, 2.14, 'Y', 0, 1]];
    for (const [hx, tl, k, lk, idx] of hk) {
      const dd = drop(tl, [[5.15 + idx * 0.15, 0.32, 6]]);
      if (!dd) continue;
      const o = { ...dd, look: t > 4.8 ? 0 : lk, arms: { up: ramp(t, 5.15 + idx * 0.15, 5.7) } };
      if (k === 'W') { o.item = 'clip'; o.checks = t > 4.02 ? 3 : t > 3.82 ? 2 : t > 3.62 ? 1 : 0; }
      if (k === 'B') {
        o.item = 'tape'; o.tapeLen = kf(t, [[2.4, 0], [2.8, 8, 'out'], [3.0, 8], [3.25, 0, 'in']]);
        if (t > 3.0) { o.item = 'hammer'; o.hammerDown = [3.0, 3.25, 3.5].reduce((m, h) => Math.max(m, ramp(t, h - 0.02, h, 0.07)), 0); }
      }
      if (k === 'Y') o.item = 'bucket';
      drawHaiku(k, hx, GY + (k === 'Y' ? 3 : 0), o);
      if (win(t, 5.15, 5.9)) mark(hx - 1, GY - 17 + o.hop, '!', t - 5.15 - idx * 0.1);
    }
    // name labels type in under each critter
    [{ x: 40, tl: 0.62, name: 'OPUS 5.5', sub: 'EVERYDAY INTELLIGENCE' }, { x: 96, tl: 1.32, name: 'SONNET 5.5', sub: 'FOR WELL-SCOPED WORK' }, { x: 152, tl: 2.02, name: 'HAIKU 5.5', sub: 'SPEED AND EFFICIENCY' }].forEach(c => {
      const a = t - c.tl - 0.05;
      if (a < 0) return;
      const cx = sx(c.x), yo = (1 - ease.out(clamp(a / 0.25, 0, 1))) * 10;
      textC(c.name, cx, 428 + yo, 3, '#1F1E1D');
      text(c.sub.slice(0, Math.floor(a * 34)), cx - textW(c.sub, 2) / 2, 466 + yo, 2, '#77726A');
    });
    const titleY = kf(t, [[0, -40], [0.4, 44, 'back'], [4.2, 44], [4.45, -60, 'in']]);
    textC('MEET THE 5.5 FAMILY', 480, titleY, 4, '#1F1E1D');
    if (t > 4.3) {
      const cy = kf(t, [[4.3, -200], [4.72, 64, 'in'], [4.86, 54, 'out'], [5.02, 64, 'in']]);
      const cw = 560, cx = 480 - cw / 2, ch = 132;
      rbox(cx + 7, cy + 7, cw, ch, 'rgba(31,30,29,0.16)');
      rbox(cx, cy, cw, ch, '#1F1E1D'); rbox(cx + 3, cy + 3, cw - 6, ch - 6, '#FFFFFF');
      S(cx + 3, cy + 3, cw - 6, 6, '#D97757');
      text('ISSUE #55', cx + 22, cy + 22, 2, '#8B857B');
      const tag = (s, x, bg) => { rbox(x, cy + 17, textW(s, 2) + 16, 24, bg); text(s, x + 8, cy + 22, 2, '#FFFFFF'); };
      let tx = cx + cw - 22;
      tx -= textW('FEATURE', 2) + 16; tag('FEATURE', tx, '#4569CC');
      tx -= textW('P0', 2) + 16 + 8; tag('P0', tx, '#C8452F');
      textC('BUILD A SCHOOL', 480, cy + 52, 5, '#D97757', '#1F1E1D');
      textC('ASSIGNED: OPUS, SONNET, HAIKU X3', 480, cy + 100, 2, '#5E5850');
    }
  },
});

// ---------- 2. The empty lot ----------
scene({
  id: 'lot', title: 'The empty lot', dur: 13.4, tod: [0.0, 0.08],
  lines: [
    L(3.0, 5.2, 'opus', "ALRIGHT TEAM! TODAY WE BUILD A SCHOOL."),
    L(5.4, 6.9, 'sonnet', "WHAT'S THE SCOPE?"),
    L(7.1, 8.3, 'opus', 'CLASSROOMS, A BELL TOWER, A PLAY-', { noHold: true }),
    L(8.45, 9.45, 'hY', 'ON IT!!'),
    L(9.95, 10.65, 'opus', '...', { cps: 5, noHold: true }),
    L(11.05, 11.95, 'hW', '...ON WHAT?'),
    L(12.05, 13.4, 'opus', 'THE PLAN. FIRST, THE PLAN.'),
  ],
  sfx: (() => {
    const e = [];
    for (let t = 0.12; t < 2.55; t += 0.227) e.push([t, 'step', { n: e.length }]);
    for (let t = 0.55; t < 2.95; t += 0.19) e.push([t, 'step', { n: e.length }]);
    e.push([1.2, 'tweet'], [4.4, 'tweet'], [8.0, 'whoosh'], [8.12, 'flap'], [8.2, 'tweet'], [8.32, 'skid'], [9.5, 'whoosh', { n: 2 }], [9.68, 'pop', { f: 420 }], [10.15, 'pop', { f: 240 }], [10.7, 'whoosh', { n: 4 }], [10.97, 'skid']);
    return e;
  })(),
  draw(t, T) {
    camKF(t, [[0, 96, 104, 4], [2.6, 168, 104, 4], [3.4, 192, 116, 5, 'sine'], [13.4, 194, 116, 5.15]]);
    world(T);
    drawSign(274, ['FUTURE', 'SCHOOL']);
    // a bird on the sign, scared off by the Haikus
    if (t < 8.1) { const f = Math.sin(AMB * 3) > 0.9 ? -0.7 : 0; at(281, G - 31 + f); cube(-2, -3, 5, 3, 4, '#5A6E8C'); p(2, -4, 2, 2, '#5A6E8C'); p(4, -3, 1, 1, '#F2B632'); p(3, -4, 1, 1, C.white); }
    else if (t < 10) { const u = t - 8.1, f = Math.sin(AMB * 30) > 0 ? -2 : 1.5; at(281 - u * 60, G - 31 - u * 45 - u * u * 10); cube(-2, -3, 5, 3, 4, '#5A6E8C'); p(-1, -3 + f, 3, 2, '#7C90AE'); }
    const ox = kf(t, [[0, 8], [2.6, 168, 'lin']]);
    const sxp = kf(t, [[0.4, -14], [3.0, 128, 'lin']]);
    const tgt = [212, 226, 240];
    const hx = i => {
      if (t < 8.0) return 440;
      if (t < 9.5) return kf(t, [[8.0 + i * 0.03, 440], [8.33 + i * 0.03, tgt[i], 'out']]);
      if (t < 10.7) return kf(t, [[9.5 + i * 0.03, tgt[i]], [9.82 + i * 0.03, -80 - i * 14, 'in']]);
      return kf(t, [[10.7 + i * 0.03, -80], [10.98 + i * 0.03, tgt[i], 'out']]);
    };
    const zooming = win(t, 8.0, 8.4) || win(t, 9.5, 9.95) || win(t, 10.7, 11.05);
    const look = t > 8.3 && t < 9.5 ? 1 : win(t, 9.6, 10.7) ? -1 : t > 11.0 ? 1 : kf(t, [[2.8, 0], [3.0, 0.6]]);
    const hatPop = kf(t, [[9.62, 0], [9.78, -12, 'out'], [10.12, 0, 'in']]);
    drawSonnet(sxp, G, { walk: t < 3.0 ? t : null, look: t > 5.3 && t < 7.0 ? 1 : look, hatPop, hatX: kf(t, [[9.62, 0], [9.8, -4], [10.12, 0]]), eyes: win(t, 9.62, 10.5) ? 'wide' : null, sq: jump(t, [[10.12, 0.01, 0.1]]).sq });
    drawOpus(ox, G, { walk: t < 2.6 ? t : null, item: 'roll', look, eyes: win(t, 9.6, 10.9) ? 'closed' : null, armR: ramp(t, 7.15, 8.2), sq: jump(t, [[9.7, 0.18, 0]]).sq });
    for (let i = 0; i < 3; i++) {
      const x = hx(i), k = B3[i];
      if (x < -70 || x > 420) continue;
      const dir = (t > 9.5 && t < 10.7) ? -1 : 1;
      const j = jump(t, [[8.5 + i * 0.08, 0.28, 4], [11.08 + i * 0.05, 0.22, 3]]);
      const skid = Math.max(ramp(t, 8.33, 8.36, 0.12), ramp(t, 10.98, 11.0, 0.12));
      if (zooming) speedLines(x, G, t > 9.5 && t < 10.7 ? -1 : -1 * -dir, t, 14);
      drawHaiku(k, x, G, { walk: zooming ? t : null, walkHz: 8, hop: j.y, sq: skid ? [1 + skid * 0.18, 1 - skid * 0.16] : j.sq, look: -1, item: k === 'W' ? 'clip' : k === 'B' ? 'hammer' : null, arms: { up: ramp(t, 8.5, 9.35) } });
    }
    dust(212, G, t - 8.33, 11, 8, 14); dust(240, G, t - 8.36, 12, 6, 10);
    for (let k = 0; k < 6; k++) dust(220 - k * 30, G, t - 9.55 - k * 0.04, 20 + k, 4, 8);
    dust(226, G, t - 11.0, 31, 8, 14);
    if (win(t, 10.0, 10.6)) sweat(ox + 13, G - 19);
    finishLayer(T, t, this.lines);
  },
});

// ---------- 3. The plan ----------
scene({
  id: 'plan', title: 'The plan', dur: 11.8, tod: [0.08, 0.15],
  lines: [
    L(0.3, 3.5, 'opus', 'STEP 1: FOUNDATION. STEP 2: WALLS. STEP 3: ROOF + TOWER.', { max: 21, cps: 24 }),
    L(3.6, 5.0, 'hW', 'CHECK. CHECK. CHECK.'),
    L(5.2, 6.6, 'sonnet', "I'LL COOK THE CEMENT."),
    L(6.8, 7.7, 'opus', '...COOK?', { cps: 14 }),
    L(7.9, 9.0, 'sonnet', 'TRUST THE RECIPE.'),
    L(9.1, 10.3, 'hB', "THIS MEETING COULD'VE BEEN AN EMAIL."),
    L(10.4, 11.8, 'opus', "NOTED. LET'S BUILD!"),
  ],
  sfx: [[0.35, 'tick'], [1.2, 'tick'], [1.85, 'tick'], [3.75, 'check'], [3.95, 'check'], [4.15, 'check'], [8.1, 'twinkle'], [9.7, 'pop', { f: 160 }], [11.05, 'boing'], [11.15, 'boing'], [11.25, 'boing']],
  draw(t, T) {
    camKF(t, [[0, 186, 108, 3.9], [3.5, 206, 106, 4.3, 'sine'], [6.6, 170, 112, 4.5, 'sine'], [9.0, 150, 114, 4.7, 'sine'], [10.4, 180, 108, 4.1, 'sine']]);
    world(T);
    const EX = 250;
    const hl = t >= 0.35 && t < 3.5 ? kf(t, [[1.2, 0], [1.35, 1], [1.85, 1], [2.0, 2]]) : null;
    const checks = t > 4.15 ? 3 : t > 3.95 ? 2 : t > 3.75 ? 1 : 0;
    drawEasel(EX, T, { hl, checks });
    const allLook = win(t, 9.6, 10.4);
    drawSonnet(96, G, { look: 1, ...jumpO(t, [[11.15, 0.32, 5]]), eyes: win(t, 7.9, 9.0) ? 'happy' : null, armL: ramp(t, 11.05, 11.8) });
    if (win(t, 8.0, 8.7)) twinkles(107, G - 22, t, 8.0, 3, 5);
    const hxs = [122, 136, 150];
    for (let i = 0; i < 3; i++) {
      const k = B3[i];
      const o = { look: allLook && k !== 'B' ? 1 : (allLook && k === 'B' ? -1 : 1), ...jumpO(t, [[11.05 + i * 0.1, 0.3, 6]]), arms: { up: ramp(t, 11.05, 11.8) } };
      if (k === 'W') { o.item = 'clip'; o.checks = checks; if (win(t, 3.6, 4.4)) Object.assign(o, jumpO(t, [[3.7, 0.15, 2], [3.9, 0.15, 2], [4.1, 0.15, 2]])); }
      if (k === 'B') { o.item = 'hammer'; if (win(t, 9.1, 10.3)) o.eyes = 'closed'; }
      if (k === 'Y' && win(t, 5.0, 9.0)) o.look = -1;
      drawHaiku(k, hxs[i], G, o);
    }
    const point = ramp(t, 0.3, 3.4, 0.2);
    drawOpus(196, G, { look: kf(t, [[4.1, 1], [4.3, -1], [5.0, -1], [5.2, 1], [6.6, 1], [6.8, -1], [9.1, -1], [9.6, -1], [10.4, -1], [10.6, 1]]), armR: { point }, armL: ramp(t, 11.05, 11.8), ...jumpO(t, [[11.05, 0.32, 5]]), pointTo: point > 0.6 && hl != null ? easelItem(EX, hl) : null, eyes: win(t, 6.8, 7.7) ? 'wide' : null });
    if (win(t, 4.3, 5.0)) sweat(209, G - 19);
    finishLayer(T, t, this.lines);
  },
});
function jumpO(t, list) { const j = jump(t, list); return { hop: j.y, sq: j.sq }; }

// ---------- 4. Foundation ----------
scene({
  id: 'foundation', title: 'Foundation', dur: 9.6, tod: [0.17, 0.3],
  lines: [
    L(1.7, 3.3, 'sonnet', 'HMM... NEEDS MORE GRAVEL.'),
    L(4.1, 4.95, 'sonnet', 'PERFECT.'),
    L(8.0, 9.6, 'opus', 'LEVEL: 100%. NICE!'),
  ],
  sfx: [[0.3, 'bubble'], [0.75, 'bubble', { n: 1 }], [1.2, 'bubble', { n: 2 }], [1.62, 'pop', { f: 500, v: 0.15 }], [3.45, 'sprinkle'], [4.15, 'twinkle'],
    [4.55, 'whoosh'], [4.85, 'whoosh', { n: 3 }], [7.0, 'skid'], [7.2, 'step'], [7.45, 'step', { n: 1 }], [7.7, 'step', { n: 2 }], [7.98, 'place'], [8.6, 'clap'], [8.75, 'clap', { n: 1 }], [7.15, 'toast']],
  draw(t, T) {
    camKF(t, [[0, 120, 110, 4.6], [3.6, 120, 112, 4.6], [4.6, 168, 108, 4.0, 'sine'], [7.0, 218, 108, 4.0, 'sine'], [8.2, 206, 116, 4.8, 'sine']]);
    world(T);
    drawCauldron(64, T);
    const stir = [14 + Math.cos(AMB * 9) * 2, -17 + Math.sin(AMB * 9)];
    const taste = [3, -13];
    let sp = t < 1.55 ? stir : t < 3.3 ? taste : t < 4.1 ? 'sprinkle' : stir;
    if (t > 1.45 && t < 1.65) { const u = (t - 1.45) / 0.2; sp = [lerp(stir[0], taste[0], u), lerp(stir[1], taste[1], u)]; }
    drawSonnet(86, G, { flip: true, spoon: sp, eyes: win(t, 1.6, 2.4) ? 'closed' : win(t, 4.1, 5.0) ? 'happy' : null, ...jumpO(t, [[4.15, 0.25, 3]]) });
    if (win(t, 3.4, 4.2)) for (let i = 0; i < 9; i++) { const a = t - 3.45 - i * 0.06; if (a > 0 && a < 0.45) { at(77 + (i % 3) - 1 + Math.sin(i) * 1.5, G - 24 + a * 40 + a * a * 30); cube(0, 0, 1.2, 1.2, 2, i % 2 ? '#8F918E' : '#6F716E'); } }
    if (win(t, 4.1, 4.8)) twinkles(70, G - 26, t, 4.1, 3, 6);
    // Haikus: dash to the pot, then pour the foundation left to right
    const f0 = 4.9, fd = 2.1;
    for (let i = 0; i < 3; i++) {
      const k = ['Y', 'W', 'B'][i], lag = i * 13;
      let x, y = G, zoom = false, dir = 1;
      if (t < 4.55) x = 214 + i * 14;
      else if (t < 4.85) { x = kf(t, [[4.55, 214 + i * 14], [4.85, 104 + i * 6, 'in']]); zoom = true; dir = -1; }
      else if (t < f0) x = 104 + i * 6;
      else if (t < f0 + fd + 0.1) { x = 120 + (t - f0) / fd * 168 - lag; zoom = true; y = G - 6; }
      else x = Math.min(270 - lag, kf(t, [[f0 + fd + 0.1, 262 - lag], [f0 + fd + 0.3, 270 - lag, 'out']]));
      if (t > f0 + fd + 0.1) y = kf(t, [[f0 + fd + 0.1, G - 6], [f0 + fd + 0.5, G]]);
      if (zoom) speedLines(x, y, dir, t, 14);
      const j = jump(t, [[8.55, 0.3, 6]]);
      drawHaiku(k, x, y, { walk: zoom ? t : null, walkHz: 8, item: 'bucket', look: t < 4.5 ? -1 : 0, hop: j.y, sq: j.sq, arms: { up: ramp(t, 8.5, 9.0) }, eyes: t > 8.5 ? 'happy' : null });
    }
    for (let c = 0; c < 21; c += 2) { dust(118 + c * 8, GS, T - (ST.foundation + f0 + c / 21 * fd), 40 + c, 3, 6); }
    // Opus walks up to the new slab and checks it with a level
    const ox = kf(t, [[7.1, 150], [7.95, 200, 'sine']]), oy = kf(t, [[7.1, G], [7.95, GS + 5, 'sine']]);
    if (t > 7.95 && t < 9.6) drawLevel(224, by(0));
    drawOpus(ox, oy, { walk: win(t, 7.1, 7.95) ? t : null, item: t < 7.1 ? 'sheet' : null, look: t < 4.5 ? -1 : 1, armR: { point: ramp(t, 7.8, 8.3) * 0.6 }, eyes: t > 8.6 ? 'happy' : null, ...jumpO(t, [[8.65, 0.25, 2]]) });
    if (win(t, 8.0, 8.6)) twinkles(224, by(0) - 3, t, 8.0, 2, 4);
    finishLayer(T, t, this.lines);
    toast('MILESTONE!', 'FOUNDATION LAID', t - 7.15, (x, y) => iconBlock(x, y, '#8F918E'));
  },
});
function iconBlock(x, y, col) { S(x - 12, y - 6, 18, 18, col); S(x - 12, y - 6, 18, 3, shade(col, 0.25)); S(x - 9, y - 12, 18, 6, shade(col, 0.2)); S(x + 6, y - 9, 6, 18, shade(col, -0.25)); }

// ---------- 5. Walls ----------
const STRAY = { t0: 2.45, t: 3.0 };
scene({
  id: 'walls', title: 'Walls', dur: 13.2, tod: [0.32, 0.44],
  lines: [
    L(0.5, 1.9, 'hY', 'BRICK! BRICK! BRICK!'),
    L(3.4, 4.9, 'opus', "...I'M FINE.", { cps: 13 }),
    L(7.8, 9.2, 'sonnet', 'ONE WINDOW. AS SCOPED.'),
    L(9.3, 10.3, 'opus', 'WE NEED NINE.'),
    L(10.4, 11.5, 'sonnet', "THAT'S A NEW TICKET."),
    L(12.45, 13.2, 'hW', 'DONE.'),
  ],
  sfx: [[3.0, 'bonk'], [3.35, 'thud'], [5.2, 'twinkle'], [6.3, 'step'], [6.6, 'step', { n: 1 }], [6.9, 'step', { n: 2 }], [7.5, 'place'], [7.55, 'twinkle'], [11.45, 'whoosh'], [12.4, 'skid'], [12.55, 'toast']],
  draw(t, T) {
    const shk = shakeAt(t, [[3.0, 5, 0.35]]);
    if (t < 3.0) camKF(t, [[0, 214, 74, 2.85], [3.0, 196, 82, 3.05]], shk);
    else if (t < 5.4) camKF(t, [[3.0, 118, 122, 5.4], [5.4, 118, 120, 5.6]], shk);
    else if (t < 11.4) camKF(t, [[5.4, 150, 104, 4.0], [7.5, 150, 106, 4.15, 'sine'], [11.4, 140, 104, 4.3]], shk);
    else camKF(t, [[11.4, 150, 100, 3.6], [12.2, 196, 88, 3.25, 'sine']], shk);
    world(T);
    drawCauldron(64, T);
    drawPallet(316, 6);
    const T0 = ST.walls;
    const lastThrow = [-9, -9, -9];
    for (const b of SCHOOL.blocks) if (b.kind === 'wall' && b.t0 <= T && b.t0 > T0 - 1) lastThrow[b.who] = Math.max(lastThrow[b.who], b.t0);
    const blur = win(t, 11.45, 12.4);
    const hxs = [300, 312, 324], hk = ['Y', 'W', 'B'];
    if (!blur) {
      for (let i = 0; i < 3; i++) {
        const since = T - lastThrow[i], thr = i === 2 && win(t, 2.4, 2.65) ? 1 : clamp(1 - since / 0.18, 0, 1);
        const x = t < 12.4 ? hxs[i] : [172, 186, 200][i];
        const j = jump(t, [[12.4 + i * 0.05, 0.25, 4]]);
        drawHaiku(hk[i], x, G, { arms: { throw: thr, up: t > 12.4 ? ramp(t, 12.5, 13.2) : 0 }, hop: -thr * 1.2 + j.y, sq: thr ? [1 - thr * 0.08, 1 + thr * 0.1] : j.sq, look: -1, eyes: t > 12.4 ? 'happy' : null, item: i === 1 && t > 12.4 ? 'clip' : null });
        if (t > 12.4) dust(x, G, t - 12.4, 60 + i, 5, 8);
      }
    }
    SCHOOL.windows.forEach((wd, i) => {
      if (i === 0) return;
      const a = T - wd.t;
      if (a > -0.08 && a < 0.12) {
        const [x, y, W, H] = rectOf(wd.rect);
        drawHaiku(hk[i % 3], x + W / 2, y + H + 2, { noShadow: true, arms: 'up' });
        speedLines(x + W / 2, y + H, i % 2 ? 1 : -1, t, 12);
      }
    });
    // Sonnet walks a window up to the wall
    const sxp = kf(t, [[6.2, 84], [7.2, 140, 'sine']]), syp = kf(t, [[6.2, G], [7.2, GS + 6, 'sine']]);
    const sO = { walk: win(t, 6.2, 7.2) ? t : null, look: t > 9.2 ? -1 : 0, eyes: win(t, 7.6, 9.2) ? 'happy' : null };
    if (t < 6.2) { sO.flip = true; sO.spoon = [14 + Math.cos(AMB * 9) * 2, -17 + Math.sin(AMB * 9)]; }
    else sO.spoon = 'none';
    sO.armL = ramp(t, 6.25, 7.4, 0.12);
    drawSonnet(sxp, syp, sO);
    if (win(t, 6.2, 7.5)) { const yy = syp - 38 - Math.abs(Math.sin(AMB * 12)) * 0.6; at(sxp - 4, yy + 10); cube(-5, -10, 10, 10, 2, '#F3EEE3'); p(-4, -9, 8, 8, '#7FC2E6'); p(-3, -8, 2, 1, '#D2F0FB'); }
    if (win(t, 7.5, 8.3)) twinkles(140, by(3) + 8, t, 7.5, 4, 10);
    // Opus supervises, then gets bonked
    const tilt = kf(t, [[2.99, 0], [3.0, 1], [5.1, 1], [5.3, 0]]);
    const wob = t > 3.0 && t < 4.2 ? Math.sin((t - 3) * 18) * 0.1 * (1 - (t - 3) / 1.2) : 0;
    spin(112, G, wob, () => drawOpus(112, G, { item: 'sheet', tilt, eyes: win(t, 3.0, 3.6) ? 'dizzy' : win(t, 3.6, 5.2) ? 'closed' : null, look: 1, glint: prog(t, 5.15, 5.6), sq: t > 3.0 && t < 3.25 ? [1.1, 0.86] : [1, 1] }));
    if (win(t, 3.0, 4.9)) starsAround(112, G - 25, 0);
    // the stray block, then it lies there bobbing like a dropped item
    if (win(t, STRAY.t0, STRAY.t)) {
      const u = (t - STRAY.t0) / (STRAY.t - STRAY.t0), x = lerp(324, 108, u), y = lerp(G - 22, G - 30, u) - 40 * 4 * u * (1 - u);
      spin(x + 4, y + 4, u * 5, () => blockAt(x, y, 'brick', true));
    } else if (t >= STRAY.t) {
      const u = clamp((t - STRAY.t) / 0.4, 0, 1);
      const x = lerp(108, 86, u), y = lerp(G - 30, G - 6, u) - 12 * 4 * u * (1 - u) + (u >= 1 ? Math.sin(AMB * 3) * 1 - 1 : 0);
      spin(x + 2, y + 2, u < 1 ? u * 4 : AMB * 1.2, () => blockAt(x, y, 'brick', true));
      if (u >= 1) dust(90, G, t - 3.4, 77, 5, 8);
    }
    if (blur) for (let i = 0; i < 3; i++) speedLines(240 + i * 30, G - 2 - i * 10, i % 2 ? 1 : -1, t, 10);
    finishLayer(T, t, this.lines);
    toast('MILESTONE!', 'WALLS + 9 WINDOWS', t - 12.55, (x, y) => iconBlock(x, y, '#E6D09E'));
  },
});

// ---------- 6. The bug ----------
scene({
  id: 'bug', title: 'The bug', dur: 8.6, tod: [0.46, 0.52],
  lines: [
    L(1.0, 2.35, 'opus', "WAIT. THERE'S A BUG."),
    L(2.55, 3.4, 'hY', 'GET IT!!'),
    L(5.75, 6.9, 'sonnet', 'BUG FIXED.'),
    L(7.0, 8.6, 'opus', 'SHIP IT... AFTER THE ROOF.'),
  ],
  sfx: [[0.2, 'buzz', { d: 0.7 }], [1.0, 'pop', { f: 600, v: 0.2 }], [2.4, 'buzz', { d: 1.0 }], [2.6, 'whoosh'], [3.0, 'whoosh', { n: 1 }], [3.55, 'clatter'], [3.95, 'clatter', { n: 3 }], [4.35, 'clatter', { n: 5 }], [4.15, 'boing'], [4.75, 'whoosh', { n: 2 }], [5.45, 'clang'], [5.0, 'tweet'], [6.0, 'tweet'], [5.9, 'toast']],
  draw(t, T) {
    camKF(t, [[0, 192, 116, 5.6], [1.0, 186, 116, 5.2, 'sine'], [2.4, 186, 112, 4.3, 'sine'], [4.6, 160, 114, 4.4, 'sine'], [5.6, 150, 114, 4.6, 'sine'], [8.6, 160, 112, 4.5]], shakeAt(t, [[5.45, 6, 0.4]]));
    world(T);
    drawCauldron(64, T);
    let bxp, byp, bflip = false, bvis = true;
    if (t < 1.0) { bxp = 196; byp = kf(t, [[0, 112], [1.0, GS, 'lin']]); }
    else if (t < 2.4) { bxp = 196 + Math.sin(t * 6) * 1.5; byp = kf(t, [[1.0, GS], [2.3, G - 2, 'sine']]); }
    else if (t < 2.95) { bxp = kf(t, [[2.4, 196], [2.95, 234, 'lin']]); byp = G; }
    else if (t < 3.5) { bxp = kf(t, [[2.95, 234], [3.5, 208, 'lin']]); byp = G; bflip = true; }
    else if (t < 5.0) { bxp = kf(t, [[3.5, 208], [5.0, 112, 'out']]); byp = G; bflip = true; }
    else { bxp = 112; byp = G; bflip = Math.sin(AMB * 6) > 0; bvis = t < 5.45; }
    if (bvis) drawBug(bxp, byp, t, { flip: bflip });
    if (win(t, 1.0, 2.4)) breakpoint(bxp, byp - 3);
    drawOpus(150, G, { look: t < 3.5 ? 1 : -1, armR: { point: ramp(t, 1.0, 2.3) }, eyes: win(t, 1.0, 1.6) ? 'wide' : null, ...jumpO(t, [[4.15, 0.35, 8]]) });
    if (win(t, 0.95, 1.6)) mark(149, G - 25, '!', t - 0.95);
    const hk = ['Y', 'W', 'B'];
    const pos = [[[2.5, 252], [2.95, 236, 'in'], [3.55, 214, 'lin']], [[2.6, 266], [3.0, 248, 'in'], [3.55, 218, 'lin']], [[2.7, 280], [3.1, 262, 'in'], [3.55, 222, 'lin']]];
    if (t < 3.55 || t >= 4.75) {
      for (let i = 0; i < 3; i++) {
        if (t < 3.55) {
          const x = kf(t, pos[i]), run = t > 2.5;
          if (run) speedLines(x, G, -1, t, 12);
          drawHaiku(hk[i], x, G, { walk: run ? t : null, walkHz: 7, look: -1, eyes: win(t, 1.2, 2.5) ? 'wide' : null, item: hk[i] === 'B' ? 'hammer' : null, ...jumpO(t, [[1.25 + i * 0.06, 0.2, 3]]) });
          if (win(t, 1.3, 2.5)) mark(x - 1, G - 17, '!', t - 1.3 - i * 0.06);
        } else {
          const x = [204, 218, 232][i], j = jump(t, [[4.75, 0.3, 6]]);
          spin(x, G - 4, (i - 1) * 0.25 * clamp((t - 4.75) / 0.3, 0, 1), () => drawHaiku(hk[i], x, G, { eyes: 'dizzy', hop: j.y, sq: j.sq }));
          starsAround(x, G - 16, i);
        }
      }
    }
    if (win(t, 3.55, 4.8)) fightCloud(218, G - 10, t);
    const sxp = kf(t, [[4.6, 76], [5.1, 94, 'out']]);
    const lidUp = ramp(t, 4.75, 5.4, 0.1);
    drawSonnet(sxp, G, { walk: win(t, 4.6, 5.1) ? t : null, spoon: lidUp > 0.5 ? 'sprinkle' : 'up', armL: lidUp, look: 1, eyes: win(t, 5.75, 6.9) ? 'happy' : null });
    if (win(t, 4.7, 5.45)) { const ly = kf(t, [[4.7, G - 30], [5.3, G - 36], [5.45, G, 'in']]), lx = kf(t, [[5.1, sxp], [5.45, 112, 'in']]); drawLid(lx, ly, t, 0); }
    else if (t >= 5.45) { drawLid(112, G, t, clamp(1 - (t - 5.45) / 0.5, 0, 1)); dust(112, G, t - 5.45, 90, 8, 14); crumbs(112, G - 2, t - 5.45, 91, 6, '#9896A0'); }
    if (win(t, 5.8, 6.6)) twinkles(112, G - 8, t, 5.8, 3, 6);
    finishLayer(T, t, this.lines);
    toast('MILESTONE!', 'BUG SQUASHED', t - 5.9, (x, y) => { S(x - 9, y - 6, 15, 10, '#8A55C2'); S(x - 9, y - 6, 15, 3, '#B08AE0'); S(x + 6, y - 4, 6, 6, '#2C2235'); S(x - 2, y - 6, 2, 10, '#5B3784'); });
  },
});

// ---------- 7. Roof and tower (the Haiku tower) ----------
scene({
  id: 'roof', title: 'Roof and tower', dur: 10.2, tod: [0.54, 0.66],
  lines: [
    L(0.2, 2.0, 'opus', 'PONDERING...', { think: true, cps: 12, silent: true }),
    L(2.25, 3.3, 'opus', 'IDEA: HAIKU TOWER!'),
    L(9.1, 10.2, 'hY', 'WE MEANT TO DO THAT.'),
  ],
  sfx: [[0.3, 'think'], [0.75, 'think', { n: 1 }], [1.2, 'think'], [1.65, 'think', { n: 1 }], [2.0, 'ding'], [3.3, 'boing'], [3.6, 'boing'], [3.9, 'boing'], [6.95, 'pop', { f: 500 }], [7.0, 'bell', { f: 880 }], [7.15, 'tick'], [7.45, 'tick'], [7.75, 'tick'], [8.35, 'place', { n: 4 }], [8.5, 'fall'], [9.0, 'thud'], [9.06, 'thud'], [9.2, 'tada']],
  draw(t, T) {
    camKF(t, [[0, 172, 112, 4.6], [2.2, 168, 110, 4.8, 'sine'], [3.3, 176, 104, 4.0, 'sine'], [4.6, 200, 72, 2.85, 'sine'], [8.4, 200, 70, 2.9], [9.2, 200, 96, 3.6, 'sine']]);
    world(T);
    drawCauldron(64, T);
    drawSonnet(86, G, { flip: true, spoon: [14 + Math.cos(AMB * 9) * 2, -17 + Math.sin(AMB * 9)], eyes: t > 9.0 ? 'happy' : null, look: t > 4 ? -1 : 0 });
    drawOpus(150, G, { eyes: t < 2.0 ? 'up' : t > 8.5 && t < 9.0 ? 'wide' : null, armR: ramp(t, 2.05, 3.2), look: t > 3.3 ? 1 : 0, ...jumpO(t, [[2.0, 0.25, 3]]) });
    if (win(t, 2.0, 3.1)) bulb(150, G - 27, t - 2.0);
    const pre = [222, 234, 246];
    const lastThrow = (() => { let m = -9; for (const b of SCHOOL.blocks) if (b.kind === 'roof' && b.t0 <= T) m = Math.max(m, b.t0); return m; })();
    const hk = ['W', 'Y', 'B'];
    for (let i = 2; i >= 0; i--) {
      const k = hk[i], level = 2 - i, hopT = 3.3 + level * 0.3;
      let x, y = G, o = { look: -1 }, ang = 0;
      if (t < hopT) { x = pre[i]; Object.assign(o, t < 3.3 ? jumpO(t, [[0.4 + i * 0.25, 0.2, 2], [1.0 + i * 0.25, 0.2, 2], [1.6 + i * 0.25, 0.2, 2], [2.2 + i * 0.25, 0.2, 2]]) : {}); }
      else if (t < hopT + 0.32) { const u = (t - hopT) / 0.32; x = lerp(pre[i], 200, u); y = G - level * 13 * ease.out(u) - 18 * 4 * u * (1 - u); o.sq = [0.92, 1.1]; }
      else if (t < 8.5) {
        const sway = Math.sin(AMB * 4.5) * level * 0.8 + Math.sin(AMB * 7.3) * level * 0.3;
        x = 200 + sway; y = G - level * 13; ang = sway * 0.03;
        const land = t - (hopT + 0.32);
        if (land < 0.18) o.sq = [1 + Math.sin(land / 0.18 * Math.PI) * 0.15, 1 - Math.sin(land / 0.18 * Math.PI) * 0.15];
      } else {
        const u = clamp((t - 8.5) / 0.5, 0, 1), tx = [168, 234, 200][i];
        x = lerp(200, tx, ease.out(u)); y = lerp(G - level * 13, G, u) - (level ? 18 : 0) * 4 * u * (1 - u);
        ang = level ? (i === 0 ? -1 : 1) * u * Math.PI * 2 : 0;
        o.eyes = u < 1 ? 'wide' : null;
        if (t > 9.0) { o.arms = { up: ramp(t, 9.05, 10.2) }; o.eyes = 'happy'; if (t < 9.18) o.sq = [1.15, 0.85]; }
      }
      if (level === 2 && t > 4.3 && t < 8.5) { const th = clamp(1 - (T - lastThrow) / 0.16, 0, 1); o.arms = { throw: th, up: 1 - th }; o.look = 0; }
      o.noShadow = y < G - 2;
      spin(x, y - 6, ang, () => drawHaiku(k, x, y, o));
      if (t > 9.0 && t < 9.5) dust(x, G, t - 9.0, 120 + i, 5, 8);
    }
    finishLayer(T, t, this.lines);
  },
});

// ---------- 8. Finishing touches ----------
scene({
  id: 'finish', title: 'Finishing touches', dur: 6.6, tod: [0.68, 0.78],
  lines: [L(0.1, 1.5, 'sonnet', 'A PINCH OF PAINT...', { noHold: true })],
  sfx: [[0.35, 'swoosh'], [0.65, 'swoosh'], [0.95, 'swoosh'], [1.5, 'whoosh'], [1.6, 'pop', { f: 260 }], [1.75, 'pop', { f: 300 }], [2.3, 'pop', { f: 340 }], [2.5, 'pop', { f: 380 }], [4.5, 'squeak'], [4.9, 'squeak'], [5.3, 'squeak'], [5.7, 'squeak'], [5.95, 'twinkle'], [6.0, 'toast'], [6.05, 'xp']],
  draw(t, T) {
    camKF(t, [[0, 196, 104, 4.2], [1.4, 200, 92, 3.4, 'sine'], [3.0, 200, 76, 2.95, 'sine'], [6.6, 200, 70, 2.85]]);
    world(T);
    drawCauldron(64, T);
    const stroke = Math.sin(AMB * 14) * 4;
    drawSonnet(178, GS + 4, { spoon: t < 1.2 ? [12, -16 + stroke, '#C24B34'] : 'up', eyes: t > 1.2 ? 'happy' : null, armR: 0 });
    if (win(t, 1.1, 1.8)) twinkles(200, by(2), t, 1.1, 4, 10);
    drawOpus(140, G, { eyes: t > 3.0 && t < 4.3 ? 'up' : null, armR: { salute: ramp(t, 4.4, 6.6) }, look: 1 });
    const d = SCHOOL.decor;
    [[100, d.trees], [298, d.trees + 0.15], [150, d.flowers + 0.2], [322, d.swing], [352, d.slide]].forEach(([x, tt], i) => {
      const a = T - tt;
      if (a > -0.1 && a < 0.12) { drawHaiku(B3[i % 3], x, G, { arms: 'up', walk: t, walkHz: 9 }); speedLines(x, G, i % 2 ? 1 : -1, t, 12); }
    });
    if (t > 2.8) {
      [230, 244, 258].forEach((x, i) => drawHaiku(B3[i], x, G, { arms: { salute: ramp(t, 4.4 + i * 0.06, 6.6) }, eyes: t > 5.9 ? 'happy' : null, ...jumpO(t, [[2.8 + i * 0.05, 0.25, 4], [5.95 + i * 0.07, 0.3, 5]]) }));
      for (let i = 0; i < 3; i++) dust(230 + i * 14, G, t - 2.8, 140 + i, 4, 6);
    }
    if (win(t, 5.9, 6.6)) twinkles(207, by(15) - 20, t, 5.9, 3, 6);
    xpOrbs(206, by(15) - 18, t - 6.0);
    finishLayer(T, t, this.lines);
    toast('SCHOOL COMPLETE!', '5.5 ACADEMY', t - 6.0, (x, y) => { S(x - 12, y - 4, 24, 14, '#E6D09E'); S(x - 14, y - 8, 28, 4, '#4E6884'); S(x - 3, y - 14, 6, 6, '#E6D09E'); S(x - 2, y + 3, 4, 7, '#C24B34'); });
  },
});

// ---------- 9. Opening day ----------
const KIDS = 8;
function kidPos(i, t) {
  const last = i === KIDS - 1;
  const s0 = last ? 4.2 : 0.55 + i * 0.42, speed = 125;
  if (t < s0) return null;
  if (!last) {
    const xr = 400 - (t - s0) * speed;
    if (xr > 190) return { x: xr, y: G, walk: t, hop: 0 };
    const tIn = s0 + (400 - 190) / speed, u = (t - tIn) / 0.38;
    if (u > 1) return null;
    return { x: lerp(190, 200, u), y: lerp(G, by(1) + 8, ease.out(u)), walk: t, hop: -10 * 4 * u * (1 - u) };
  }
  if (t < 5.6) return { x: kf(t, [[s0, 400], [5.6, 184, 'out']]), y: G, walk: t, hop: 0 };
  if (t < 11.9) return { x: 184, y: G, walk: null, hop: 0 };
  const u = (t - 11.9) / 0.45;
  if (u > 1) return null;
  return { x: lerp(184, 200, u), y: lerp(G, by(1) + 8, ease.out(u)), walk: t, hop: -10 * 4 * u * (1 - u) };
}
scene({
  id: 'opening', title: 'Opening day', dur: 13.0, tod: [0.84, 0.93],
  lines: [
    L(1.3, 2.0, 'k0', 'YAY!', { noHold: true }),
    L(2.0, 3.4, 'opus', 'GREAT WORK, TEAM.'),
    L(3.5, 4.4, 'hY', 'SHIP IT!'),
    L(4.5, 5.7, 'sonnet', "CHEF'S KISS."),
    L(5.9, 7.3, 'k7', "WHERE'S THE CAFETERIA?"),
    L(9.1, 10.3, 'opus', "...THAT'S V2.", { cps: 13 }),
    L(10.4, 11.8, 'sonnet', 'DID SOMEONE SAY KITCHEN?!'),
  ],
  sfx: [[0.1, 'bell', { f: 784 }], [0.55, 'bell', { f: 622 }], [1.0, 'bell', { f: 784 }], [1.45, 'bell', { f: 622 }], [5.0, 'twinkle'],
    [7.4, 'scratch'], [7.85, 'cricket'], [8.35, 'cricket'], [8.85, 'cricket'], [10.5, 'boing'], [10.9, 'boing'], [11.0, 'twinkle'],
    [11.95, 'horn'], [12.45, 'boing'], [12.7, 'shutter']],
  draw(t0, T0) {
    const t = Math.min(t0, 12.7), T = T0 - (t0 - t);
    if (t < 5.8) camKF(t, [[0, 200, 66, 2.85], [2.0, 196, 78, 3.1, 'sine'], [5.8, 170, 92, 3.5]]);
    else if (t < 11.9) camKF(t, [[5.8, 140, 112, 4.3], [7.4, 146, 114, 4.5, 'sine'], [7.45, 146, 118, 5.0, 'out'], [9.1, 140, 116, 5.1], [11.9, 130, 112, 4.6, 'sine']]);
    else camKF(t, [[11.9, 186, 82, 3.2], [12.7, 196, 74, 2.95, 'out']]);
    const freeze = win(t, 7.4, 9.1);
    const bellSwing = t < 2.1 ? Math.sin(t * 9) * 0.5 * (1 - t / 2.1) : 0;
    const doorOpen = KIDS && [...Array(KIDS)].some((_, i) => { const k = kidPos(i, t); return k && k.y < G - 2; }) || win(t, 1.4, 5.0);
    world(T, { bellSwing, doorOpen });
    drawCauldron(64, T);
    if (t < 2.1) soundArcs(200, by(11) + 4, t);
    const darts = freeze ? Math.sin((t - 8.2) * 10) : 0;
    const look = t > 8.2 && freeze ? darts : 0;
    const pose = t > 12.15;
    const ph = jump(t, [[12.45, 0.5, 7]]);
    for (let i = 0; i < KIDS; i++) {
      const k = kidPos(i, t);
      if (!k) continue;
      const last = i === KIDS - 1;
      drawKid(k.x, k.y, { walk: k.walk, pack: i, flip: true, look: 1, eyes: !last && i % 2 ? 'happy' : null, id: 'k' + i, hop: k.hop || hops(t, [[0.85 + i * 0.42, 0.22, 3]]) });
    }
    drawSonnet(70, G, { look: look || 1, eyes: freeze ? 'wide' : win(t, 10.4, 11.9) ? 'star' : win(t, 4.5, 5.8) ? 'happy' : null, spoon: win(t, 4.6, 5.4) ? 'kiss' : 'up', hop: hops(t, [[10.5, 0.3, 6], [10.9, 0.3, 6]]) + ph.y, sq: pose ? ph.sq : jump(t, [[10.5, 0.3, 6], [10.9, 0.3, 6]]).sq, armL: ramp(t, 12.15, 13, 0.12) });
    if (win(t, 5.0, 5.7)) { const u = (t - 5.0) / 0.7; R(78 + u * 6, G - 14 - u * 8, 2, 2, '#EE6FA8'); twinkles(80, G - 20, t, 5.0, 3, 6); }
    if (win(t, 11.0, 11.8)) twinkles(70, G - 14, t, 11.0, 3, 8);
    drawOpus(106, G, { look: look || 1, eyes: freeze ? 'wide' : win(t, 2.0, 3.4) ? 'happy' : pose ? 'happy' : null, armL: ramp(t, 12.15, 13, 0.12), armR: ramp(t, 12.15, 13, 0.12), hop: ph.y, sq: freeze && t < 7.6 ? [1.06, 0.94] : ph.sq });
    [138, 151, 164].forEach((x, i) => {
      const j = jump(t, [[12.43 + i * 0.03, 0.5, 9], ...(B3[i] === 'Y' ? [[3.6, 0.25, 4]] : [])]);
      drawHaiku(B3[i], x, G, { look: look || 1, eyes: freeze ? 'wide' : pose ? 'happy' : null, arms: { up: Math.max(ramp(t, 12.15, 13, 0.12), B3[i] === 'Y' ? ramp(t, 3.5, 4.4) : 0) }, hop: j.y, sq: j.sq });
    });
    if (freeze && t > 7.6) { sweat(119, G - 20); sweat(79, G - 14, AMB + 0.3); sweat(170, G - 10, AMB + 0.6); }
    if (t > 11.9) confetti(t - 11.9, 110);
    finishLayer(T, t, this.lines);
    if (t0 >= 12.7) S(0, 0, VW, VH, `rgba(255,255,255,${clamp(1 - (t0 - 12.7) / 0.3, 0, 1)})`);
  },
});

// ---------- 10. The photo ----------
scene({
  id: 'end', title: 'The end', dur: 4.4, noWipe: true, noTint: true,
  sfx: [[0.05, 'pageflip'], [1.0, 'tada'], [2.3, 'twinkle']],
  draw(t, T) {
    setCam(0, 0, 3);
    S(0, 0, VW, VH, '#F0EDE6');
    for (let y = 0; y < VH; y += 24) for (let x = (y / 24 % 2) * 12; x < VW; x += 24) S(x, y, 2, 2, '#E4DFD5');
    const oy = kf(t, [[0, 560], [0.6, 0, 'back']]), rot = kf(t, [[0, 0.12], [0.6, -0.02, 'back'], [4.4, -0.015]]);
    const px = 168, py = 22 + oy, pw = 624, ph = 351;
    ctx.save();
    ctx.translate(480 * K, (py + ph / 2) * K); ctx.rotate(rot); ctx.translate(-480 * K, -(py + ph / 2) * K);
    S(px - 14 + 8, py - 14 + 8, pw + 28, ph + 70, 'rgba(31,30,29,0.18)');
    S(px - 14, py - 14, pw + 28, ph + 70, '#FFFFFF');
    ctx.save();
    ctx.beginPath(); ctx.rect(px * K, py * K, pw * K, ph * K); ctx.clip();
    camLock = { x: 44, y: -18, s: 2, ox: px, oy: py };
    const op = SCENES.find(s => s.id === 'opening');
    const prevTOD = TOD; TOD = 0.93;
    NOBLINK = true; op.draw(12.69, ST.opening + 12.69); NOBLINK = false;
    TOD = prevTOD;
    camLock = null;
    ctx.restore();
    textC('DAY ONE · 5.5 ACADEMY', 480, py + ph + 20, 2, '#3C3833');
    ctx.restore();
    if (t > 1.0) { const s = ease.back(clamp((t - 1.0) / 0.3, 0, 1)); textC('THE END', 480, 466 + (1 - s) * 20, 4, '#1F1E1D'); }
    if (t > 2.3) textC('COMING IN V2: THE CAFETERIA', 480, 510, 2, '#C4613F');
  },
});

// Reading pauses: once a bubble has finished typing, the story holds until it can be read.
// Story time (what the scenes are written in) pauses; real time (AMB) keeps the world alive.
SCENES.forEach(s => {
  s.holds = [];
  for (const ln of s.lines || []) {
    if (ln.noHold || ln.think) continue;
    const typed = 0.1 + ln[3].length / lineCps(ln);
    const need = Math.max(0.75, ln[3].length * 0.025) - ((ln[1] - ln[0]) - typed);
    if (need > 0.04) s.holds.push([ln[0] + typed, Math.round(need * 20) / 20]);
  }
  s.holds.sort((a, b) => a[0] - b[0]);
  s.rdur = s.dur + s.holds.reduce((a, h) => a + h[1], 0);
});
let DUR = 0, SDUR = 0;
SCENES.forEach(s => { s.start = SDUR; ST[s.id] = SDUR; SDUR += s.dur; s.rstart = DUR; DUR += s.rdur; });
function warp(s, r) { let t = r; for (const [ht, ex] of s.holds) { if (t <= ht) break; if (t < ht + ex) return ht; t -= ex; } return t; }
function unwarp(s, t) { let r = t; for (const [ht, ex] of s.holds) if (ht < t) r += ex; return r; }
function storyToReal(Ts) { let i = SCENES.length - 1; while (i > 0 && Ts < SCENES[i].start) i--; const s = SCENES[i]; return s.rstart + unwarp(s, Ts - s.start); }
planSchool(ST);
const SFX_EVENTS = (() => {
  const ev = [];
  for (const s of SCENES) {
    for (const e of (s.sfx || [])) ev.push([s.rstart + unwarp(s, e[0]), e[1], e[2] || {}]);
    for (const e of scriptSfx(s)) ev.push([s.rstart + unwarp(s, e[0]), e[1], e[2] || {}]);
    if (!s.noWipe && s.rstart > 0) ev.push([s.rstart - 0.28, 'swoosh', {}]);
  }
  SCHOOL.blocks.forEach((b, i) => ev.push([storyToReal(b.t), 'place', { n: i }]));
  SCHOOL.blocks.forEach((b, i) => { if (b.t0 != null && i % 3 === 0) ev.push([storyToReal(b.t0), 'throw', { n: i }]); });
  SCHOOL.windows.forEach((w, i) => { if (i > 0) ev.push([storyToReal(w.t), 'pop', { f: 420 + i * 30, n: i }]); });
  for (let i = 0; i < 10; i++) ev.push([storyToReal(SCHOOL.sign.t0 + i * SCHOOL.sign.dt), 'pop', { f: 520 + i * 25, v: 0.25, n: i }]);
  return ev.sort((a, b) => a[0] - b[0]);
})();

function renderAt(R_) {
  R_ = clamp(R_, 0, DUR - 1e-4);
  AMB = R_;
  beginFrame();
  let i = SCENES.length - 1;
  while (i > 0 && R_ < SCENES[i].rstart) i--;
  const s = SCENES[i];
  for (const k in A) delete A[k];
  for (const k in TALK) delete TALK[k];
  const t = warp(s, R_ - s.rstart);
  for (const ln of s.lines || []) {
    if (ln.think || ln.silent) continue;
    const a = t - ln[0], e = typedEnd(ln) - t;
    if (a > 0 && e > -0.05) TALK[ln[2]] = clamp(Math.min(a / 0.1, (e + 0.05) / 0.12), 0, 1);
  }
  if (s.tod) TOD = lerp(s.tod[0], s.tod[1], clamp(t / s.dur, 0, 1));
  s.draw(t, s.start + t);
  const W = 0.32, next = SCENES[i + 1];
  if (next && !next.noWipe && R_ > next.rstart - W) blockWipe((R_ - (next.rstart - W)) / W, true, i === 0 ? '#D97757' : null);
  if (i > 0 && !s.noWipe && R_ < s.rstart + W) blockWipe((R_ - s.rstart) / W, false, i === 1 ? '#D97757' : null);
}
