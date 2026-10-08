/* ---- the script: ten scenes, each a pure function of its local time ---- */
const SCENES = [];
function scene(o) { SCENES.push(o); }
const WIDE = [40, -4, 3];
let ST = {}; // global start time of each scene, by id

function world(T, o = {}) {
  drawBG();
  drawClouds(T);
  const d = SCHOOL.decor;
  drawTree(104, T, d.trees, true);
  drawTree(294, T, d.trees + 0.15, false);
  drawSchool(T, o);
  drawFlowers(T, d.flowers);
  drawSwing(318, T, d.swing);
  drawSlide(346, T, d.slide);
}
const B3 = ['W', 'Y', 'B'];

// 1 ─ Meet the crew (homage to the "Meet the 5.5 family" card)
scene({
  id: 'intro', title: 'Meet the crew', dur: 7.0,
  sfx: [[0.62, 'thud'], [1.32, 'thud'], [2.02, 'pop', { f: 300 }], [2.14, 'pop', { f: 340 }], [2.26, 'pop', { f: 380 }],
    [3.0, 'hammer'], [3.25, 'hammer', { n: 1 }], [3.5, 'hammer', { n: 2 }], [3.3, 'twinkle'], [3.62, 'check'], [3.82, 'check'], [4.02, 'check'],
    [4.32, 'swoosh'], [4.72, 'stamp'], [5.15, 'boing'], [5.3, 'boing'], [5.45, 'boing'], [5.75, 'twinkle']],
  draw(t) {
    setCam(0, 0, 5, shakeAt(t, [[4.72, 5, 0.3]]));
    S(0, 0, VW, VH, '#F0EDE6');
    const GY = 80;
    // floor shadows like the reference card
    const drop = (tl) => t < tl - 0.35 ? null : t < tl ? -Math.round(Math.pow(1 - (t - (tl - 0.35)) / 0.35, 2) * 110) : hop(t, tl, 0.22, 3);
    const cast = [
      { x: 40, tl: 0.62, name: 'OPUS 5.5', sub: 'EVERYDAY INTELLIGENCE' },
      { x: 96, tl: 1.32, name: 'SONNET 5.5', sub: 'FOR WELL-SCOPED WORK' },
      { x: 152, tl: 2.02, name: 'HAIKU 5.5', sub: 'SPEED AND EFFICIENCY' },
    ];
    const cheer = hops(t, [[5.15, 0.3, 5]]);
    let y;
    if ((y = drop(0.62)) !== null) drawOpus(40, GY, { hop: y, blink: blinkAt(t, 1), glint: win(t, 3.3, 3.6) || win(t, 5.75, 6.0), armR: win(t, 5.6, 6.1) ? 'salute' : 'side' });
    if ((y = drop(1.32)) !== null) drawSonnet(96, GY, { hop: y + hops(t, [[5.3, 0.3, 4]]), blink: blinkAt(t, 2) });
    const hk = [[142, 2.02, 'W', -1], [162, 2.26, 'B', 1], [152, 2.14, 'Y', 0]];
    for (const [hx, tl, k, lk] of hk) {
      const yy = drop(tl);
      if (yy === null) continue;
      const o = { hop: yy + hops(t, [[5.15 + (k === 'Y' ? 0.15 : k === 'B' ? 0.3 : 0), 0.3, 6]]), blink: blinkAt(t, 3 + hx), look: t > 4.8 ? 0 : lk };
      if (k === 'W') { o.item = 'clip'; o.checks = t > 4.02 ? 3 : t > 3.82 ? 2 : t > 3.62 ? 1 : 0; }
      if (k === 'B') { o.item = 'tape'; o.tapeLen = Math.round(kf(t, [[2.4, 0], [2.8, 7, 'out'], [3.0, 7], [3.2, 0, 'in']])); if (t > 2.9) { o.item = 'hammer'; o.hammerDown = [3.0, 3.25, 3.5].some(h => win(t, h - 0.08, h + 0.04)); } }
      if (k === 'Y') o.item = 'bucket';
      drawHaiku(k, hx, GY + (k === 'Y' ? 3 : 0), o);
      if (win(t, 5.15, 5.9)) mark(hx - 1, GY - 16 + o.hop, '!');
    }
    // labels
    cast.forEach(c => {
      const a = t - c.tl - 0.05;
      if (a < 0) return;
      const cx = sx(c.x);
      textC(c.name, cx, 428, 3, '#1F1E1D');
      const n = Math.floor(a * 34);
      const s = c.sub.slice(0, n);
      text(s, cx - textW(c.sub, 2) / 2, 466, 2, '#77726A');
    });
    // header: title, then the ticket
    const titleY = Math.round(kf(t, [[0, -40], [0.35, 44, 'back'], [4.2, 44], [4.45, -60, 'in']]));
    textC('MEET THE 5.5 FAMILY', 480, titleY, 4, '#1F1E1D');
    if (t > 4.3) {
      const cy = Math.round(kf(t, [[4.3, -200], [4.72, 64, 'in'], [4.85, 56, 'out'], [5.0, 64, 'in']]));
      const cw = 560, cx = 480 - cw / 2, ch = 132;
      rbox(cx + 7, cy + 7, cw, ch, 'rgba(31,30,29,0.16)');
      rbox(cx, cy, cw, ch, '#1F1E1D'); rbox(cx + 3, cy + 3, cw - 6, ch - 6, '#FFFFFF');
      S(cx + 3, cy + 3, cw - 6, 6, '#D97757');
      text('ISSUE #55', cx + 22, cy + 22, 2, '#8B857B');
      const tag = (s, x, bg) => { const w = textW(s, 2) + 16; rbox(x, cy + 17, w, 24, bg); text(s, x + 8, cy + 22, 2, '#FFFFFF'); return w; };
      let tx = cx + cw - 22;
      tx -= textW('FEATURE', 2) + 16; tag('FEATURE', tx, '#4569CC');
      tx -= textW('P0', 2) + 16 + 8; tag('P0', tx, '#C8452F');
      textC('BUILD A SCHOOL', 480, cy + 52, 5, '#D97757', '#1F1E1D');
      textC('ASSIGNED: OPUS, SONNET, HAIKU X3', 480, cy + 100, 2, '#5E5850');
    }
  },
});

// 2 ─ The empty lot
scene({
  id: 'lot', title: 'The empty lot', dur: 13.4,
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
    for (let t = 0.12; t < 2.55; t += 0.29) e.push([t, 'step', { n: e.length }]);
    for (let t = 0.55; t < 2.95; t += 0.25) e.push([t, 'step', { n: e.length }]);
    e.push([1.2, 'tweet'], [8.0, 'whoosh'], [8.12, 'flap'], [8.2, 'tweet'], [8.32, 'skid'], [9.5, 'whoosh', { n: 2 }], [9.68, 'pop', { f: 420 }], [10.15, 'pop', { f: 240 }], [10.7, 'whoosh', { n: 4 }], [10.97, 'skid']);
    return e;
  })(),
  draw(t, T) {
    if (t < 2.9) setCam(kf(t, [[0, 18], [2.9, 84]]), 34, 4); else setCam(98, 57, 5);
    world(T);
    drawSign(274, T, ['FUTURE', 'SCHOOL']);
    // bird on the sign, scared off by the Haikus
    if (t < 8.1) { const f = Math.floor(t * 2) % 5 === 0 ? 1 : 0; R(278, G - 28 - f, 5, 3, '#5A6E8C'); R(282, G - 29 - f, 2, 2, '#5A6E8C'); R(284, G - 28 - f, 1, 1, '#F2B632'); R(283, G - 29 - f, 1, 1, C.white); }
    else if (t < 10) { const u = t - 8.1; const bx_ = 278 - u * 60, by_ = G - 28 - u * 45; const f = Math.floor(t * 12) & 1; R(bx_, by_, 5, 3, '#5A6E8C'); R(bx_ + 1, by_ - (f ? 2 : -2), 3, 2, '#7C90AE'); }
    const ox = kf(t, [[0, 8], [2.6, 168, 'lin']]);
    const sx_ = kf(t, [[0.4, -14], [3.0, 128, 'lin']]);
    // Haikus: zoom in, zoom out, zoom back
    const tgt = [212, 226, 240];
    const hx = i => {
      if (t < 8.0) return 420;
      if (t < 9.5) return kf(t, [[8.0 + i * 0.03, 420], [8.33 + i * 0.03, tgt[i], 'out']]);
      if (t < 10.7) return kf(t, [[9.5 + i * 0.03, tgt[i]], [9.82 + i * 0.03, -70 - i * 14, 'in']]);
      return kf(t, [[10.7 + i * 0.03, -70], [10.98 + i * 0.03, tgt[i], 'out']]);
    };
    const zooming = win(t, 8.0, 8.4) || win(t, 9.5, 9.9) || win(t, 10.7, 11.05);
    const look = t > 8.3 && t < 9.5 ? 1 : win(t, 9.6, 10.7) ? -1 : t > 11.0 ? 1 : 0;
    drawSonnet(sx_, G, { walk: t < 3.0 ? t : null, blink: blinkAt(t, 2), look: t > 5.3 && t < 7.0 ? 1 : look, hatPop: Math.round(kf(t, [[9.62, 0], [9.78, -12, 'out'], [10.1, 0, 'in']])), hatX: Math.round(kf(t, [[9.62, 0], [9.8, -4], [10.1, 0]])), eyes: win(t, 9.62, 10.5) ? 'wide' : null });
    drawOpus(ox, G, { walk: t < 2.6 ? t : null, item: 'roll', blink: blinkAt(t, 1), look, eyes: win(t, 9.6, 10.9) ? 'closed' : null, armR: win(t, 7.1, 8.2) ? 'up' : 'side' });
    for (let i = 0; i < 3; i++) {
      const x = hx(i), k = B3[i];
      if (x < -60 || x > 400) continue;
      const dir = (t > 9.5 && t < 10.7) ? -1 : 1;
      if (zooming) speedLines(x, G, dir > 0 && t < 9 ? -1 : dir, t, 14);
      drawHaiku(k, x, G, { walk: zooming ? t * 2 : null, blink: blinkAt(t, 5 + i), look: -1, hop: win(t, 8.45, 9.45) ? hops(t, [[8.5 + i * 0.08, 0.28, 4]]) : 0, item: k === 'W' ? 'clip' : k === 'B' ? 'hammer' : null, arms: win(t, 8.45, 9.4) ? 'up' : null });
    }
    dust(212, G, t - 8.33, 11, 8, 14);
    dust(240, G, t - 8.36, 12, 6, 10);
    for (let k = 0; k < 6; k++) dust(220 - k * 30, G, t - 9.55 - k * 0.04, 20 + k, 4, 8);
    dust(226, G, t - 11.0, 31, 8, 14);
    if (win(t, 10.0, 10.6)) { sweat(ox + 13, G - 19); }
    drawBubbles(t, this.lines);
  },
});

// 3 ─ The plan
scene({
  id: 'plan', title: 'The plan', dur: 11.8,
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
    setCam(72, 32, 4);
    world(T);
    const EX = 250;
    const hl = win(t, 0.35, 1.2) ? 0 : win(t, 1.2, 1.85) ? 1 : win(t, 1.85, 3.5) ? 2 : -1;
    const checks = t > 4.15 ? 3 : t > 3.95 ? 2 : t > 3.75 ? 1 : 0;
    drawEasel(EX, T, { hl, checks });
    const allLook = win(t, 9.6, 10.4);
    const cheer = hops(t, [[11.05, 0.32, 5]]);
    const olook = win(t, 4.2, 5.0) || win(t, 6.6, 9.1) || allLook ? -1 : 1;
    drawSonnet(96, G, { blink: blinkAt(t, 2), look: allLook ? 1 : 1, hop: hops(t, [[11.15, 0.32, 5]]), eyes: win(t, 7.9, 9.0) ? 'happy' : null, armL: t > 11.0 ? 'up' : 'side' });
    if (win(t, 8.0, 8.7)) twinkles(96 + 9, G - 24, t, 8.0, 3, 5);
    const hxs = [122, 136, 150];
    for (let i = 0; i < 3; i++) {
      const k = B3[i];
      const o = { blink: blinkAt(t, 5 + i), look: allLook && k !== 'B' ? 1 : (allLook && k === 'B' ? -1 : 1), hop: hops(t, [[11.05 + i * 0.1, 0.3, 6]]), arms: t > 11.0 ? 'up' : null };
      if (k === 'W') { o.item = 'clip'; o.checks = checks; if (win(t, 3.6, 4.3)) o.hop = hops(t, [[3.7, 0.15, 2], [3.9, 0.15, 2], [4.1, 0.15, 2]]); }
      if (k === 'B') { o.item = 'hammer'; if (win(t, 9.1, 10.3)) o.eyes = 'closed'; }
      if (k === 'Y' && win(t, 5.0, 9.0)) o.look = -1;
      drawHaiku(k, hxs[i], G, o);
    }
    const pointing = t < 3.5;
    drawOpus(196, G, { blink: blinkAt(t, 1), look: olook, armR: pointing ? 'point' : 'side', armL: t > 11.0 ? 'up' : 'side', hop: cheer, pointTo: pointing && hl >= 0 ? easelItem(EX, hl) : null, eyes: win(t, 6.8, 7.7) ? 'wide' : null });
    if (win(t, 4.3, 5.0)) sweat(209, G - 19);
    drawBubbles(t, this.lines);
  },
});

// 4 ─ Foundation
scene({
  id: 'foundation', title: 'Foundation', dur: 9.6,
  lines: [
    L(1.7, 3.3, 'sonnet', 'HMM... NEEDS MORE GRAVEL.'),
    L(4.1, 4.95, 'sonnet', 'PERFECT.'),
    L(8.0, 9.6, 'opus', 'LEVEL: 100%. NICE!'),
  ],
  sfx: [[0.3, 'bubble'], [0.75, 'bubble', { n: 1 }], [1.2, 'bubble', { n: 2 }], [1.62, 'pop', { f: 500, v: 0.15 }], [3.45, 'sprinkle'], [4.15, 'twinkle'],
    [4.55, 'whoosh'], [4.85, 'whoosh', { n: 3 }], [7.0, 'skid'], [7.2, 'step'], [7.5, 'step', { n: 1 }], [7.8, 'step', { n: 2 }], [7.98, 'place'], [8.6, 'clap'], [8.75, 'clap', { n: 1 }]],
  draw(t, T) {
    setCam(44, 34, 4);
    world(T);
    drawCauldron(64, T);
    // Sonnet: stir, taste, sprinkle
    let sp;
    if (t < 1.6) sp = [14 + Math.round(Math.cos(AMB * 9) * 2), -17 + Math.round(Math.sin(AMB * 9))];
    else if (t < 3.3) sp = [3, -13];
    else if (t < 4.1) sp = 'sprinkle';
    else sp = [14 + Math.round(Math.cos(AMB * 9) * 2), -17 + Math.round(Math.sin(AMB * 9))];
    drawSonnet(86, G, { flip: true, spoon: sp, blink: blinkAt(t, 2), eyes: win(t, 1.6, 2.4) ? 'closed' : win(t, 4.1, 5.0) ? 'happy' : null });
    if (win(t, 3.4, 4.2)) for (let i = 0; i < 7; i++) { const a = t - 3.45 - i * 0.07; if (a > 0 && a < 0.45) R(78 + (i % 3) - 1, G - 22 + a * 50, 1, 1, i % 2 ? '#8F918E' : '#6F716E'); }
    if (win(t, 4.1, 4.8)) twinkles(70, G - 22, t, 4.1, 3, 6);
    // Haikus: dash to the pot, then pour the foundation left to right
    const f0 = 4.9, fd = 2.1;
    for (let i = 0; i < 3; i++) {
      const k = ['Y', 'W', 'B'][i];
      const lag = i * 13;
      let x, zoom = false, dir = 1;
      if (t < 4.55) x = 214 + i * 14;
      else if (t < 4.85) { x = kf(t, [[4.55, 214 + i * 14], [4.85, 104 + i * 6, 'in']]); zoom = true; dir = -1; }
      else if (t < f0) x = 104 + i * 6;
      else if (t < f0 + fd + 0.1) { x = 120 + (t - f0) / fd * 168 - lag; zoom = true; }
      else x = Math.min(270 - lag, kf(t, [[f0 + fd + 0.1, 262 - lag], [f0 + fd + 0.3, 270 - lag, 'out']]));
      if (zoom) speedLines(x, G, dir, t, 14);
      drawHaiku(k, x, G, { walk: zoom ? t * 2 : null, item: 'bucket', blink: blinkAt(t, 6 + i), look: t < 4.5 ? -1 : 0, hop: hops(t, [[8.55, 0.3, 6]]), arms: win(t, 8.5, 9.0) ? 'up' : null, eyes: t > 8.5 ? 'happy' : null });
    }
    for (let c = 0; c < 21; c += 2) dust(118 + c * 8, G, T - (ST.foundation + f0 + c / 21 * fd), 40 + c, 3, 6);
    // Opus checks the level
    const ox = kf(t, [[7.1, 150], [7.95, 196, 'lin']]);
    const placed = t > 7.95;
    if (placed && t < 9.6) drawLevel(222, by(0));
    drawOpus(ox, G, { walk: win(t, 7.1, 7.95) ? t : null, item: t < 7.1 ? 'sheet' : null, blink: blinkAt(t, 1), look: t < 4.5 ? -1 : 1, armR: win(t, 7.85, 8.3) ? 'point' : 'side', eyes: t > 8.6 ? 'happy' : null });
    if (win(t, 8.0, 8.6)) twinkles(222, by(0) - 3, t, 8.0, 2, 4);
    drawBubbles(t, this.lines);
  },
});

// 5 ─ Walls
const STRAY = { t0: 2.45, t: 3.0 };
scene({
  id: 'walls', title: 'Walls', dur: 13.2,
  lines: [
    L(0.5, 1.9, 'hY', 'BRICK! BRICK! BRICK!'),
    L(3.4, 4.9, 'opus', "...I'M FINE.", { cps: 13 }),
    L(7.8, 9.2, 'sonnet', 'ONE WINDOW. AS SCOPED.'),
    L(9.3, 10.3, 'opus', 'WE NEED NINE.'),
    L(10.4, 11.5, 'sonnet', "THAT'S A NEW TICKET."),
    L(12.45, 13.2, 'hW', 'DONE.'),
  ],
  sfx: [[3.0, 'bonk'], [3.35, 'thud'], [5.2, 'twinkle'], [6.3, 'step'], [6.6, 'step', { n: 1 }], [6.9, 'step', { n: 2 }], [7.5, 'place'], [7.55, 'twinkle'], [11.45, 'whoosh'], [12.4, 'skid']],
  draw(t, T) {
    const shk = shakeAt(t, [[3.0, 4, 0.3]]);
    if (t < 3.0) setCam(...WIDE, shk); else if (t < 5.4) setCam(16, 57, 5, shk); else setCam(40, 34, 4, shk);
    world(T);
    drawCauldron(64, T);
    drawPallet(316, 6);
    const T0 = ST.walls;
    // throwers
    const lastThrow = [-9, -9, -9];
    for (const b of SCHOOL.blocks) if (b.kind === 'wall' && b.t0 <= T && b.t0 > T0 - 1) lastThrow[b.who] = Math.max(lastThrow[b.who], b.t0);
    const blur = win(t, 11.45, 12.4);
    const hxs = [304, 316, 328], hk = ['Y', 'W', 'B'];
    if (!blur) {
      for (let i = 0; i < 3; i++) {
        const thr = T - lastThrow[i] < 0.14 || (i === 2 && win(t, 2.45, 2.6));
        const x = t < 12.4 ? hxs[i] : [172, 186, 200][i];
        drawHaiku(hk[i], x, G, { arms: thr ? 'throw' : null, hop: thr ? -1 : 0, blink: blinkAt(t, 7 + i), look: -1, eyes: t > 12.4 ? 'happy' : null, item: i === 1 && t > 12.4 ? 'clip' : null });
        if (t > 12.4) dust(x, G, t - 12.4, 60 + i, 5, 8);
      }
    }
    // windows done in a blur
    SCHOOL.windows.forEach((wd, i) => {
      if (i === 0) return;
      const a = T - wd.t;
      if (a > -0.06 && a < 0.1) {
        const [c, r, w, h] = wd.rect;
        const x = bx(c) + w * 4, y = by(r) + 8;
        drawHaiku(hk[i % 3], x, y, { noShadow: true, arms: 'up' });
        speedLines(x, y, i % 2 ? 1 : -1, t, 12);
      }
    });
    // Sonnet carries one window in
    const sxp = kf(t, [[6.2, 84], [7.2, 140, 'lin']]);
    const sOpts = { blink: blinkAt(t, 2), walk: win(t, 6.2, 7.2) ? t : null, look: t > 9.2 ? -1 : 0, eyes: win(t, 7.6, 9.2) ? 'happy' : null };
    if (t < 6.2) { sOpts.flip = true; sOpts.spoon = [14 + Math.round(Math.cos(AMB * 9) * 2), -17 + Math.round(Math.sin(AMB * 9))]; }
    else sOpts.spoon = 'none';
    sOpts.armL = win(t, 6.2, 7.5) ? 'up' : 'side';
    drawSonnet(sxp, G, sOpts);
    if (win(t, 6.2, 7.5)) { const yy = G - 36 + (Math.floor(t * 8) & 1); R(sxp - 9, yy, 10, 10, '#F3EEE3'); R(sxp - 8, yy + 1, 8, 8, '#7FC2E6'); R(sxp - 7, yy + 2, 2, 1, '#D2F0FB'); }
    if (win(t, 7.5, 8.3)) twinkles(140, by(3) + 8, t, 7.5, 4, 10);
    // Opus supervises, then gets bonked
    const tilt = win(t, 3.0, 5.2);
    drawOpus(112, G, { item: 'sheet', blink: blinkAt(t, 1), tilt, eyes: win(t, 3.0, 3.6) ? 'dizzy' : win(t, 3.6, 5.2) ? 'closed' : null, look: t > 7.0 ? 1 : 1, glint: win(t, 5.2, 5.5), hop: hop(t, 3.0, 0.2, -2) });
    if (win(t, 3.0, 4.9)) starsAround(112, G - 24, 0);
    // the stray block
    if (win(t, STRAY.t0, STRAY.t)) {
      const u = (t - STRAY.t0) / (STRAY.t - STRAY.t0);
      blockAt(lerp(328, 108, u), lerp(126, G - 29, u) - 40 * 4 * u * (1 - u), 8, 'brick');
    } else if (t >= STRAY.t) {
      const u = clamp((t - STRAY.t) / 0.35, 0, 1);
      const x = lerp(108, 88, u), y = lerp(G - 29, G - 8, u) - 10 * 4 * u * (1 - u);
      blockAt(x, y, 8, 'brick');
      if (u >= 1) dust(92, G, t - 3.35, 77, 5, 8);
    }
    if (blur) for (let i = 0; i < 3; i++) speedLines(240 + i * 30, G - 2 - i * 10, i % 2 ? 1 : -1, t, 10);
    drawBubbles(t, this.lines);
  },
});

// 6 ─ The bug
scene({
  id: 'bug', title: 'The bug', dur: 8.6,
  lines: [
    L(1.0, 2.35, 'opus', "WAIT. THERE'S A BUG."),
    L(2.55, 3.4, 'hY', 'GET IT!!'),
    L(5.75, 6.9, 'sonnet', 'BUG FIXED.'),
    L(7.0, 8.6, 'opus', 'SHIP IT... AFTER THE ROOF.'),
  ],
  sfx: [[0.2, 'buzz', { d: 0.7 }], [1.0, 'pop', { f: 600, v: 0.2 }], [2.4, 'buzz', { d: 1.0 }], [2.6, 'whoosh'], [3.0, 'whoosh', { n: 1 }], [3.55, 'clatter'], [3.95, 'clatter', { n: 3 }], [4.35, 'clatter', { n: 5 }], [4.6, 'boing'], [4.75, 'whoosh', { n: 2 }], [5.45, 'clang'], [5.0, 'tweet'], [6.0, 'tweet']],
  draw(t, T) {
    setCam(64, 30, 4, shakeAt(t, [[5.45, 5, 0.35]]));
    world(T);
    drawCauldron(64, T);
    // bug path
    let bxp, byp, bflip = false, bvis = true;
    if (t < 1.0) { bxp = 196; byp = kf(t, [[0, 126], [1.0, G, 'lin']]); }
    else if (t < 2.4) { bxp = 196; byp = G; }
    else if (t < 2.95) { bxp = kf(t, [[2.4, 196], [2.95, 234, 'lin']]); byp = G; }
    else if (t < 3.5) { bxp = kf(t, [[2.95, 234], [3.5, 208, 'lin']]); byp = G; bflip = true; }
    else if (t < 5.0) { bxp = kf(t, [[3.5, 208], [5.0, 112, 'out']]); byp = G; bflip = true; }
    else { bxp = 112; byp = G; bflip = Math.floor(t * 3) & 1; bvis = t < 5.45; }
    if (bvis) drawBug(bxp, byp, t, { flip: bflip });
    if (win(t, 1.0, 2.4)) breakpoint(bxp, byp - 3, t);
    // Opus
    drawOpus(150, G, { blink: blinkAt(t, 1), look: t < 3.5 ? 1 : -1, armR: win(t, 1.0, 2.4) ? 'point' : 'side', eyes: win(t, 1.0, 1.6) ? 'wide' : null, hop: hops(t, [[4.15, 0.35, 8]]) });
    if (win(t, 0.95, 1.6)) mark(149, G - 24, '!');
    // Haikus: chase, crash, dizzy
    const hk = ['Y', 'W', 'B'];
    const pos = [[[2.5, 252], [2.95, 236, 'in'], [3.55, 214, 'lin']], [[2.6, 266], [3.0, 248, 'in'], [3.55, 218, 'lin']], [[2.7, 280], [3.1, 262, 'in'], [3.55, 222, 'lin']]];
    if (t < 3.55 || t >= 4.75) {
      for (let i = 0; i < 3; i++) {
        if (t < 3.55) {
          const x = kf(t, pos[i]);
          const run = t > 2.5;
          if (run) speedLines(x, G, -1, t, 12);
          drawHaiku(hk[i], x, G, { walk: run ? t * 2 : null, blink: blinkAt(t, 9 + i), look: -1, eyes: win(t, 1.2, 2.5) ? 'wide' : null, item: hk[i] === 'B' ? 'hammer' : null });
          if (win(t, 1.3, 2.5)) mark(x - 1, G - 16, '!');
        } else {
          const x = [204, 218, 232][i];
          drawHaiku(hk[i], x, G, { eyes: 'dizzy', hop: hop(t, 4.75, 0.3, 6), hatPop: i === 1 ? 0 : 0 });
          starsAround(x, G - 16, i);
        }
      }
    }
    if (win(t, 3.55, 4.8)) fightCloud(218, G - 10, t);
    // Sonnet and the lid
    const sxp = kf(t, [[4.6, 76], [5.1, 94, 'out']]);
    const lidUp = win(t, 4.7, 5.45);
    drawSonnet(sxp, G, { blink: blinkAt(t, 2), walk: win(t, 4.6, 5.1) ? t : null, spoon: lidUp ? 'sprinkle' : 'up', armL: lidUp ? 'up' : 'side', look: 1, eyes: win(t, 5.75, 6.9) ? 'happy' : null });
    if (lidUp) { const ly = kf(t, [[4.7, G - 30], [5.3, G - 34], [5.45, G, 'in']]); const lx = kf(t, [[5.1, sxp], [5.45, 112, 'in']]); drawLid(lx, ly, t, false); }
    else if (t >= 5.45) { drawLid(112, G, t, win(t, 5.45, 5.9)); dust(112, G, t - 5.45, 90, 8, 14); }
    if (win(t, 5.8, 6.6)) twinkles(112, G - 8, t, 5.8, 3, 6);
    drawBubbles(t, this.lines);
  },
});

// 7 ─ Roof and tower (the Haiku tower)
scene({
  id: 'roof', title: 'Roof and tower', dur: 10.2,
  lines: [
    L(0.2, 2.0, 'opus', 'PONDERING...', { think: true, cps: 12, silent: true }),
    L(2.25, 3.3, 'opus', 'IDEA: HAIKU TOWER!'),
    L(9.1, 10.2, 'hY', 'WE MEANT TO DO THAT.'),
  ],
  sfx: [[0.3, 'think'], [0.75, 'think', { n: 1 }], [1.2, 'think'], [1.65, 'think', { n: 1 }], [2.0, 'ding'], [3.3, 'boing'], [3.6, 'boing'], [3.9, 'boing'], [6.95, 'pop', { f: 500 }], [7.0, 'bell', { f: 880 }], [7.15, 'tick'], [7.45, 'tick'], [7.75, 'tick'], [8.35, 'place', { n: 4 }], [8.5, 'fall'], [9.0, 'thud'], [9.06, 'thud'], [9.2, 'tada']],
  draw(t, T) {
    if (t < 3.3) setCam(60, 34, 4); else setCam(...WIDE);
    world(T);
    drawCauldron(64, T);
    drawSonnet(86, G, { flip: true, blink: blinkAt(t, 2), spoon: [14 + Math.round(Math.cos(AMB * 9) * 2), -17 + Math.round(Math.sin(AMB * 9))], eyes: t > 9.0 ? 'happy' : null });
    drawOpus(150, G, { blink: blinkAt(t, 1), eyes: t < 2.0 ? 'up' : t > 8.5 && t < 9.0 ? 'wide' : null, armR: win(t, 2.0, 3.3) ? 'up' : 'side', look: t > 3.3 ? 1 : 0 });
    if (win(t, 2.0, 3.1)) bulb(150, G - 26, t - 2.0);
    // the stack
    const pre = [222, 234, 246];
    const swing = Math.sin(t * 5);
    const lastThrow = (() => { let m = -9; for (const b of SCHOOL.blocks) if (b.kind === 'roof' && b.t0 <= T) m = Math.max(m, b.t0); return m; })();
    const hk = ['W', 'Y', 'B'];
    for (let i = 2; i >= 0; i--) {
      const k = hk[i];
      const level = 2 - i; // B bottom (0), Y middle (1), W top (2)
      const hopT = 3.3 + level * 0.3;
      let x, y = G, o = { blink: blinkAt(t, 11 + i), look: -1 };
      if (t < hopT) { x = pre[i]; o.hop = t < 3.3 ? hops(t, [[0.4 + i * 0.25, 0.2, 2], [1.0 + i * 0.25, 0.2, 2], [1.6 + i * 0.25, 0.2, 2]]) : 0; }
      else if (t < hopT + 0.3) { const u = (t - hopT) / 0.3; x = lerp(pre[i], 200, u); y = G - level * 14 * u - 18 * 4 * u * (1 - u); }
      else if (t < 8.5) { x = 200 + Math.round(swing * level * 0.7); y = G - level * 14; }
      else {
        const u = clamp((t - 8.5) / 0.5, 0, 1);
        const tx = [170, 232, 200][i];
        x = lerp(200, tx, u); y = lerp(G - level * 14, G, u) - (level ? 16 : 0) * 4 * u * (1 - u);
        o.eyes = u < 1 ? 'wide' : null;
        if (t > 9.0) { o.arms = 'up'; o.eyes = 'happy'; }
      }
      if (level === 2 && t > 4.3 && t < 8.5) { o.arms = T - lastThrow < 0.12 ? 'throw' : 'up'; o.look = 0; }
      o.noShadow = y < G - 2;
      drawHaiku(k, x, y, o);
      if (t > 9.0 && t < 9.5) dust(x, G, t - 9.0, 120 + i, 5, 8);
    }
    drawBubbles(t, this.lines);
  },
});

// 8 ─ Finishing touches
scene({
  id: 'finish', title: 'Finishing touches', dur: 6.6,
  lines: [L(0.1, 1.5, 'sonnet', 'A PINCH OF PAINT...', { noHold: true })],
  sfx: [[0.35, 'swoosh'], [0.65, 'swoosh'], [0.95, 'swoosh'], [1.5, 'whoosh'], [1.6, 'pop', { f: 260 }], [1.75, 'pop', { f: 300 }], [2.3, 'pop', { f: 340 }], [2.5, 'pop', { f: 380 }], [4.5, 'squeak'], [4.9, 'squeak'], [5.3, 'squeak'], [5.7, 'squeak'], [5.95, 'twinkle']],
  draw(t, T) {
    setCam(...WIDE);
    world(T);
    drawCauldron(64, T);
    const stroke = Math.round(Math.sin(t * 14) * 4);
    drawSonnet(176, G, { blink: blinkAt(t, 2), spoon: t < 1.2 ? [12, -14 + stroke, '#C24B34'] : 'up', eyes: t > 1.2 ? 'happy' : null });
    if (win(t, 1.1, 1.8)) twinkles(200, by(2), t, 1.1, 4, 10);
    drawOpus(140, G, { blink: blinkAt(t, 1), eyes: t > 3.0 && t < 4.3 ? 'up' : null, armR: t > 4.4 ? 'salute' : 'side', look: 1 });
    // Haikus blur around placing trees, flowers and the playground
    const d = SCHOOL.decor;
    const spots = [[104, d.trees], [294, d.trees + 0.15], [150, d.flowers + 0.2], [318, d.swing], [346, d.slide]];
    spots.forEach(([x, tt], i) => { const a = T - tt; if (a > -0.08 && a < 0.1) { drawHaiku(B3[i % 3], x, G, { arms: 'up' }); speedLines(x, G, i % 2 ? 1 : -1, t, 12); } });
    if (t > 2.8) {
      [230, 244, 258].forEach((x, i) => drawHaiku(B3[i], x, G, { blink: blinkAt(t, 13 + i), arms: t > 4.4 ? 'salute' : null, eyes: t > 5.9 ? 'happy' : null, hop: hops(t, [[2.8 + i * 0.05, 0.25, 4]]) }));
      for (let i = 0; i < 3; i++) dust(230 + i * 14, G, t - 2.8, 140 + i, 4, 6);
    }
    if (win(t, 5.9, 6.6)) twinkles(207, 4, t, 5.9, 3, 6);
    drawBubbles(t, this.lines);
  },
});

// 9 ─ Opening day
scene({
  id: 'opening', title: 'Opening day', dur: 13.0,
  lines: [
    L(1.3, 2.0, 'k0', 'YAY!', { noHold: true }),
    L(2.0, 3.4, 'opus', 'GREAT WORK, TEAM.'),
    L(3.5, 4.4, 'hY', 'SHIP IT!'),
    L(4.5, 5.7, 'sonnet', "CHEF'S KISS."),
    L(5.9, 7.3, 'k5', "WHERE'S THE CAFETERIA?"),
    L(9.1, 10.3, 'opus', "...THAT'S V2.", { cps: 13 }),
    L(10.4, 11.8, 'sonnet', 'DID SOMEONE SAY KITCHEN?!'),
  ],
  sfx: [[0.1, 'bell', { f: 784 }], [0.55, 'bell', { f: 622 }], [1.0, 'bell', { f: 784 }], [1.45, 'bell', { f: 622 }], [5.0, 'twinkle'],
    [7.4, 'scratch'], [7.85, 'cricket'], [8.35, 'cricket'], [8.85, 'cricket'], [10.5, 'boing'], [10.9, 'boing'], [11.0, 'twinkle'],
    [11.95, 'horn'], [12.2, 'boing'], [12.7, 'shutter']],
  draw(t0, T0) {
    // the photo freezes everything at 12.7
    const t = Math.min(t0, 12.7), T = T0 - (t0 - t);
    if (t > 5.8 && t < 11.9) setCam(36, 34, 4); else setCam(...WIDE);
    world(T, { bellSwing: t < 2.1 ? Math.round(Math.sin(t * 9) * 2) : 0, doorOpen: win(t, 1.6, 4.9) || win(t, 11.9, 12.5) });
    drawCauldron(64, T);
    if (t < 2.1) soundArcs(200, 58, t);
    const freeze = win(t, 7.4, 9.1);
    const darts = freeze ? (Math.floor((t - 8.2) / 0.3) & 1 ? 1 : -1) : 0;
    const look = t > 8.2 && freeze ? darts : 0;
    const pose = t > 12.15;
    const ph = hops(t, [[12.45, 0.5, 7]]);
    // kids
    for (let i = 0; i < 6; i++) {
      const last = i === 5;
      const s0 = last ? 4.2 : 0.6 + i * 0.5;
      let x;
      if (!last) { x = 390 - (t - s0) * 120; if (t < s0 || x < 200) continue; }
      else {
        if (t < s0) continue;
        x = t < 5.6 ? kf(t, [[s0, 390], [5.6, 184, 'out']]) : t < 11.9 ? 184 : kf(t, [[11.9, 184], [12.25, 200, 'in']]);
        if (t > 12.25) continue;
      }
      drawKid(x, G, { walk: (!last || t < 5.6 || t > 11.9) ? t : null, pack: i, flip: true, look: 1, eyes: !last && i % 2 ? 'happy' : null, id: 'k' + i, hop: last && win(t, 5.6, 12) ? 0 : hops(t, [[s0 + 0.3, 0.25, 3], [s0 + 0.9, 0.25, 3]]) });
    }
    // the team
    drawSonnet(70, G, { blink: blinkAt(t, 2), look: look || 1, eyes: freeze ? 'wide' : win(t, 10.4, 11.9) ? 'star' : win(t, 4.5, 5.8) ? 'happy' : null, spoon: win(t, 4.6, 5.4) ? 'kiss' : 'up', hop: hops(t, [[10.5, 0.3, 6], [10.9, 0.3, 6]]) + ph, armL: pose ? 'up' : 'side' });
    if (win(t, 5.0, 5.7)) { R(70 - 2, G - 13, 2, 2, '#EE6FA8'); twinkles(66, G - 16, t, 5.0, 3, 6); }
    if (win(t, 11.0, 11.8)) twinkles(70, G - 14, t, 11.0, 3, 8);
    drawOpus(106, G, { blink: blinkAt(t, 1) && !freeze, look: look || 1, eyes: freeze ? 'wide' : win(t, 2.0, 3.4) ? 'happy' : pose ? 'happy' : null, armL: pose ? 'up' : 'side', armR: pose ? 'up' : 'side', hop: ph });
    [138, 151, 164].forEach((x, i) => drawHaiku(B3[i], x, G, { blink: blinkAt(t, 15 + i) && !freeze, look: look || 1, eyes: freeze ? 'wide' : pose ? 'happy' : null, arms: pose || (B3[i] === 'Y' && win(t, 3.5, 4.4)) ? 'up' : null, hop: hops(t, [[12.43 + i * 0.03, 0.5, 9]]) + (B3[i] === 'Y' ? hops(t, [[3.6, 0.25, 4]]) : 0) }));
    if (freeze && t > 7.6) { sweat(119, G - 20); sweat(79, G - 14); sweat(170, G - 10); }
    if (t > 11.9) confetti(t - 11.9, 90);
    drawBubbles(t, this.lines);
    if (t0 >= 12.7) S(0, 0, VW, VH, `rgba(255,255,255,${clamp(1 - (t0 - 12.7) / 0.3, 0, 1)})`);
  },
});

// 10 ─ The photo
scene({
  id: 'end', title: 'The end', dur: 4.4, noWipe: true,
  sfx: [[0.05, 'pageflip'], [1.0, 'tada'], [2.3, 'twinkle']],
  draw(t, T) {
    setCam(0, 0, 3);
    S(0, 0, VW, VH, '#F0EDE6');
    for (let y = 0; y < VH; y += 24) for (let x = (y / 24 % 2) * 12; x < VW; x += 24) S(x, y, 2, 2, '#E4DFD5');
    const oy = Math.round(kf(t, [[0, 560], [0.55, 0, 'back']]));
    const px = 168, py = 22 + oy, pw = 624, ph = 351;
    S(px - 14 + 8, py - 14 + 8, pw + 28, ph + 70, 'rgba(31,30,29,0.18)');
    S(px - 14, py - 14, pw + 28, ph + 70, '#FFFFFF');
    S(px - 14, py - 14, pw + 28, 2, '#E9E5DD');
    // the frozen frame from opening day, re-drawn at 2x
    ctx.save();
    ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip();
    camLock = { x: 44, y: -4, s: 2, ox: px, oy: py };
    const op = SCENES.find(s => s.id === 'opening');
    NOBLINK = true; op.draw(12.69, ST.opening + 12.69); NOBLINK = false;
    camLock = null;
    ctx.restore();
    textC('DAY ONE · 5.5 ACADEMY', 480, py + ph + 20, 2, '#3C3833');
    if (t > 1.0) textC('THE END', 480, 466, 4, '#1F1E1D');
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
  SCHOOL.windows.forEach((w, i) => { if (i > 0) ev.push([storyToReal(w.t), 'pop', { f: 420 + i * 30, n: i }]); });
  for (let i = 0; i < 10; i++) ev.push([storyToReal(SCHOOL.sign.t0 + i * SCHOOL.sign.dt), 'pop', { f: 520 + i * 25, v: 0.25, n: i }]);
  return ev.sort((a, b) => a[0] - b[0]);
})();

function renderAt(R) {
  R = clamp(R, 0, DUR - 1e-4);
  AMB = R;
  beginFrame();
  let i = SCENES.length - 1;
  while (i > 0 && R < SCENES[i].rstart) i--;
  const s = SCENES[i];
  for (const k in A) delete A[k];
  const t = warp(s, R - s.rstart);
  s.draw(t, s.start + t);
  // block wipes between scenes
  const W = 0.3, next = SCENES[i + 1];
  if (next && !next.noWipe && R > next.rstart - W) blockWipe((R - (next.rstart - W)) / W, true, i === 0 ? '#D97757' : null);
  if (i > 0 && !s.noWipe && R < s.rstart + W) blockWipe((R - s.rstart) / W, false, i === 1 ? '#D97757' : null);
}
