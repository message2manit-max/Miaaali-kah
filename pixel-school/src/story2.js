/* ---- V2: Principal Opus, Sonnet's complex parts, two new wings, a tour of every room, and a grand opening at dusk ---- */
// before the wings go up the playground and trees stand where they did on day one; the Haikus move them outward
function world2(T, o = {}) {
  drawBackdrop();
  walkers();
  const d = SCHOOL.decor, mv = ST.wings + 0.45;
  drawTree(100, T, d.trees, true, mv); drawTree(298, T, d.trees + 0.15, false, mv);
  drawTree(-6, T, mv + 0.1, true); drawTree(408, T, mv + 0.2, false);
  drawSchool2(T, o);
  drawFlowers(T, d.flowers);
  drawSwing(322, T, d.swing, mv); drawSlide(352, T, d.slide, mv);
  drawSwing(440, T, mv + 0.25); drawSlide(470, T, mv + 0.3);
  drawScaffold(T);
  drawCauldron(64, T, { hide: T > mv });
}
function finish2(T, t, lines, o = {}) {
  drawFlying2(T);
  drawTint();
  if (o.after) o.after();
  drawBubbles(t, lines);
}
// a location title sliding in at the top left
function caption(str, age, dur) {
  dur = dur || 2.2;
  if (age < 0 || age > dur + 0.4) return;
  const u = ease.out(clamp(age / 0.3, 0, 1)), v = ease.in(clamp((age - dur) / 0.35, 0, 1));
  const w = textW(str, 3) + 34, x = 16 - (1 - u) * (w + 20) - v * (w + 20), y = 16;
  rbox(x + 4, y + 4, w, 40, 'rgba(0,0,0,0.25)'); rbox(x, y, w, 40, '#1F1E1D'); S(x + 3, y + 3, 6, 34, '#D97757');
  text(str, x + 20, y + 10, 3, '#FFF6EC');
}
// the issue card that drops in
function ticketCard(age, num, big, line, tags) {
  if (age < 0) return;
  const cy = kf(age, [[0, -200], [0.4, 70, 'in'], [0.54, 60, 'out'], [0.7, 70, 'in'], [1.3, 70], [1.55, -220, 'in']]);
  const cw = 600, cx = 480 - cw / 2, ch = 132;
  rbox(cx + 7, cy + 7, cw, ch, 'rgba(31,30,29,0.2)');
  rbox(cx, cy, cw, ch, '#1F1E1D'); rbox(cx + 3, cy + 3, cw - 6, ch - 6, '#FFFFFF'); S(cx + 3, cy + 3, cw - 6, 6, '#D97757');
  text(num, cx + 22, cy + 22, 2, '#8B857B');
  let tx = cx + cw - 22;
  for (const [s, bg] of tags) { tx -= textW(s, 2) + 16; rbox(tx, cy + 17, textW(s, 2) + 16, 24, bg); text(s, tx + 8, cy + 22, 2, '#FFFFFF'); tx -= 8; }
  textC(big, 480, cy + 52, 5, '#D97757', '#1F1E1D');
  textC(line, 480, cy + 100, 2, '#5E5850');
}
// rockets and bursts at dusk (world space, added light)
function fireworks(t, list) {
  ctx.globalCompositeOperation = 'lighter';
  for (const [t0, x, y, col] of list) {
    const a = t - t0;
    if (a < 0 || a > 2.3) continue;
    if (a < 0.6) {
      const u = ease.out(a / 0.6), ry = lerp(G - 10, y, u);
      for (let k = 0; k < 6; k++) { ctx.globalAlpha = 0.9 - k * 0.14; R(x - 0.7, ry + k * 2.2, 1.4, 2.2, k ? '#FFC870' : '#FFFFFF'); }
    } else {
      const b = a - 0.6, u = b / 1.7, spread = ease.out(Math.min(1, b * 1.5));
      if (b < 0.25) { ctx.globalAlpha = 0.5 * (1 - b / 0.25); disc(x, y, 16, col); ctx.globalAlpha = 0.8 * (1 - b / 0.25); disc(x, y, 6, '#FFFFFF'); }
      for (let i = 0; i < 32; i++) {
        const an = i / 32 * Math.PI * 2, sp = 30 + (i % 4) * 7;
        for (let k = 0; k < 3; k++) {
          const sb = Math.max(0, spread - k * 0.06);
          const px = x + Math.cos(an) * sp * sb, py = y + Math.sin(an) * sp * sb + b * b * 10;
          ctx.globalAlpha = clamp(1 - u, 0, 1) * (1 - k * 0.3);
          R(px - 1.2, py - 1.2, 2.4, 2.4, k ? col : '#FFFFFF');
        }
        if (u > 0.5 && Math.sin(AMB * 30 + i) > 0.6) { ctx.globalAlpha = 1 - u; R(x + Math.cos(an) * sp - 0.5, y + Math.sin(an) * sp + b * b * 10 - 0.5, 1, 1, '#FFFFFF'); }
      }
    }
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}

// ---------- 11. Principal Opus ----------
scene({
  id: 'principal', title: 'Principal Opus', dur: 11.6, tod: [0.02, 0.1],
  lines: [
    L(1.7, 2.9, 'hW', 'FOR YOU, PRINCIPAL!'),
    L(3.1, 4.7, 'opus', 'PRINCIPAL OPUS. I LIKE IT.'),
    L(5.0, 6.3, 'k0', 'WE NEED MORE CLASSROOMS!'),
    L(6.4, 7.2, 'k1', 'A LAB!', { noHold: true, dy: 0 }),
    L(6.75, 7.6, 'k2', 'A LIBRARY!', { noHold: true, dy: -44 }),
    L(7.1, 8.1, 'k3', 'A CAFETERIA!!', { noHold: true, dy: -88 }),
    L(9.9, 11.6, 'sonnet', 'COMPLEX PARTS? LEAVE THEM TO ME.'),
  ],
  sfx: [[0.15, 'bell', { f: 784 }], [0.55, 'boing'], [0.95, 'thud'], [1.35, 'boing'], [1.6, 'pop', { f: 520 }], [1.62, 'twinkle'], [3.2, 'twinkle'], [4.0, 'whoosh'], [8.2, 'swoosh'], [8.6, 'stamp'], [10.3, 'twinkle']],
  draw(t, T) {
    camKF(t, [[0, 200, 70, 2.85], [1.0, 200, 96, 3.6, 'sine'], [4.6, 216, 108, 4.3, 'sine'], [8.2, 226, 108, 4.3], [11.6, 196, 112, 4.6, 'sine']], shakeAt(t, [[8.6, 5, 0.3]]));
    world2(T, { doorOpen: t < 0.7 });
    // Opus steps out of the door and down the step
    const out = prog(t, 0.45, 0.95), ox = 200 - out * 4, oy = t < 0.45 ? by(1) + 8 : lerp(by(1) + 8, G, ease.in(out)) - 10 * 4 * out * (1 - out);
    const sonX = 168;
    drawSonnet(sonX, G, { look: t > 9 ? 0 : 1, spoon: t > 9.8 ? 'trowel' : 'up', armR: ramp(t, 10.0, 11.6), eyes: t > 3.1 && t < 4.7 ? 'happy' : null });
    if (t > 10.0 && t < 10.8) twinkles(sonX + 12, G - 26, t, 10.0, 3, 5);
    const j = jump(t, [[0.95, 0.01, 0]]);
    drawOpus(ox, oy, { badge: prog(t, 1.55, 1.85), glint: prog(t, 3.15, 3.6), look: t > 4.3 && t < 8 ? 1 : 0, armR: { up: ramp(t, 8.1, 9.6) }, eyes: win(t, 3.1, 4.7) ? 'happy' : win(t, 7.6, 8.1) ? 'wide' : null, sq: out > 0.95 && t < 1.15 ? [1.12, 0.88] : j.sq });
    if (win(t, 1.6, 2.2)) twinkles(ox - 9, G - 10, t, 1.6, 3, 4);
    // Haiku W hops up to pin the badge
    const wx = kf(t, [[1.1, 222], [1.35, 206, 'out'], [1.9, 206], [2.1, 222, 'sine']]);
    const wj = jump(t, [[1.3, 0.35, 12], [2.95, 0.25, 4]]);
    drawHaiku('W', wx, G, { hop: wj.y, sq: wj.sq, look: -1, arms: { up: ramp(t, 1.4, 1.7, 0.1) }, eyes: t > 1.7 && t < 3 ? 'happy' : null });
    drawHaiku('Y', 236, G, { look: -1, ...jumpO(t, [[2.95, 0.25, 4]]) });
    drawHaiku('B', 250, G, { look: -1, item: 'hammer', ...jumpO(t, [[3.0, 0.25, 4]]) });
    // kids playing on the playground, then they run over with requests
    for (let i = 0; i < 4; i++) {
      const play = [322 + Math.sin(AMB * 1.3 + i * 1.6) * 22, G - 1 - (i % 2) * 2];
      const tgt = 266 + i * 14, run = prog(t, 3.9 + i * 0.12, 4.7 + i * 0.12);
      const x = lerp(play[0], tgt, ease.io(run)), y = lerp(play[1], G, run);
      const moving = run > 0 && run < 1 || t < 3.9;
      drawKid(x, y, { id: 'k' + i, pack: i, flip: run > 0 || Math.cos(AMB * 1.3 + i * 1.6) < 0, walk: moving ? t : null, look: run >= 1 ? -1 : 0, hop: run >= 1 ? hops(t, [[5.0 + i * 0.55, 0.25, 3]]) : t < 3.9 ? -Math.abs(Math.sin(AMB * 6 + i)) * 1.5 : 0, eyes: t < 3.9 ? 'happy' : null, raise: run >= 1 ? ramp(t, 5.0 + (i ? 1.2 + i * 0.35 : 0), 5.9 + (i ? 1.2 + i * 0.35 : 0.4), 0.1) : 0 });
    }
    finish2(T, t, this.lines, { after: () => ticketCard(t - 8.2, 'ISSUE #56', 'SCHOOL V2', '+ 2 WINGS  + 9 ROOMS  + 1 GLASS DOME', [['V2', '#4569CC'], ['EPIC', '#9A5BD0']]) });
  },
});

// ---------- 12. Blueprint v2 ----------
scene({
  id: 'plan2', title: 'Blueprint v2', dur: 9.2, tod: [0.1, 0.16],
  lines: [
    L(0.15, 1.3, 'opus', 'WAIT. PLAN FIRST.'),
    L(1.5, 3.4, 'opus', 'TWO WINGS. NINE ROOMS. ONE DOME.', { cps: 24 }),
    L(3.6, 5.3, 'sonnet', 'DOME, STAIRS, ARCHES: MINE.'),
    L(5.8, 6.8, 'opus', 'APPROVED.'),
    L(7.0, 7.7, 'hY', 'AND US?'),
    L(7.8, 9.2, 'opus', 'EVERYTHING ELSE. GO!'),
  ],
  sfx: [[0.05, 'whoosh'], [0.3, 'skid'], [1.6, 'tick'], [2.1, 'tick'], [2.55, 'tick'], [3.7, 'twinkle'], [5.62, 'stamp'], [8.95, 'whoosh', { n: 3 }]],
  draw(t, T) {
    camKF(t, [[0, 186, 108, 3.9], [3.5, 206, 106, 4.3, 'sine'], [6.0, 200, 108, 4.4, 'sine'], [9.2, 180, 108, 4.1, 'sine']], shakeAt(t, [[5.62, 5, 0.3]]));
    world2(T);
    const EX = 250, hl = win(t, 1.6, 3.4) ? kf(t, [[2.05, 0], [2.2, 2], [2.5, 2], [2.65, 1]]) : null;
    drawEasel(EX, T, { hl, v2: true, approved: t > 5.62 ? t - 5.62 : 0 });
    const sxp = kf(t, [[3.45, 96], [3.9, 110, 'sine']]);
    drawSonnet(sxp, G, { walk: win(t, 3.45, 3.9) ? t : null, spoon: 'trowel', armR: ramp(t, 3.7, 5.2), look: 1, eyes: t > 5.7 && t < 7 ? 'happy' : null });
    if (win(t, 3.7, 4.4)) twinkles(sxp + 12, G - 26, t, 3.7, 3, 5);
    for (let i = 0; i < 3; i++) {
      const k = B3[i], x0 = 122 + i * 14;
      const dash = t > 8.9 ? (t - 8.9) * 260 : 0, ready = t < 0.35 ? 1 : 0;
      const x = x0 + dash + (t < 0.3 ? t * 30 : 9);
      if (x > 420) continue;
      if (ready || dash) speedLines(x, G, 1, t, 12);
      drawHaiku(k, x, G, { look: t > 6.9 && t < 7.8 ? 1 : 1, walk: dash || t < 0.3 ? t : null, walkHz: 8, sq: t < 0.45 ? [1.14, 0.86] : [1, 1], eyes: t > 0.3 && t < 1.3 ? 'wide' : null, item: k === 'W' ? 'clip' : k === 'B' ? 'hammer' : null, ...jumpO(t, [[7.85 + i * 0.07, 0.25, 4]]) });
    }
    const stamp = ramp(t, 5.3, 5.62, 0.12) * (t < 5.62 ? 1 : 0) + (t >= 5.62 ? clamp(1 - (t - 5.62) / 0.25, 0, 1) * 0.3 : 0);
    drawOpus(196, G, { badge: 1, look: t > 3.5 && t < 5.4 ? -1 : 1, armR: { point: ramp(t, 1.5, 3.4, 0.2), up: stamp }, stampOn: stamp > 0.05 ? 1 : null, pointTo: win(t, 1.6, 3.4) && hl != null ? easelItem(EX, hl) : null, eyes: t < 0.6 ? 'wide' : null, armL: ramp(t, 0.1, 0.9, 0.1) });
    finish2(T, t, this.lines);
  },
});

// ---------- 13. The wings ----------
scene({
  id: 'wings', title: 'The new wings', dur: 12.8, tod: [0.22, 0.5],
  lines: [
    L(6.3, 7.4, 'sonnet', 'PRECISION WORK.'),
    L(10.8, 12.6, 'opus', 'ON TIME. UNDER BUDGET.'),
  ],
  sfx: [[0.25, 'whoosh'], [0.45, 'pop', { f: 260 }], [0.6, 'pop', { f: 320 }], [0.75, 'pop', { f: 380 }], [5.0, 'clatter'], [5.2, 'step'], [5.45, 'boing'], [5.7, 'boing'], [9.1, 'boing'], [9.4, 'thud'], [10.6, 'pop', { f: 300 }], [11.0, 'toast']],
  draw(t, T) {
    camKF(t, [[0, 200, 74, 2.35], [5.3, 200, 74, 2.35], [6.1, 318, 72, 4.0, 'sine'], [9.0, 316, 74, 4.0], [9.9, 200, 72, 2.35, 'sine'], [12.8, 200, 74, 2.42]]);
    world2(T);
    drawPallet(6, 6); drawPallet(394, 6);
    // throwers
    const last = [-9, -9, -9];
    for (const b of SCHOOL2.blocks) if (b.t0 <= T) last[b.who] = Math.max(last[b.who], b.t0);
    [['W', 22], ['Y', 34], ['B', 376]].forEach(([k, x], i) => {
      const thr = clamp(1 - (T - last[i]) / 0.16, 0, 1);
      drawHaiku(k, x, G, { arms: { throw: thr }, hop: -thr * 1.2 + hops(t, [[11.0 + i * 0.07, 0.25, 4]]), look: i < 2 ? 1 : -1, eyes: t > 10.8 ? 'happy' : null });
    });
    if (win(t, 0.2, 0.8)) { speedLines(110, G, 1, t, 12); speedLines(300, G, -1, t, 12); }
    // Opus watches with his clipboard
    drawOpus(200, G, { badge: 1, item: 'clipboard', checks: t > 11 ? 3 : t > 9.6 ? 2 : t > 5.8 ? 1 : 0, look: Math.sin(t * 1.3) * 0.9, eyes: t > 10.8 ? 'happy' : null });
    // Sonnet climbs the scaffold and builds the dome, then the arches
    let sx_ = 150, sy_ = G, sw = null, arm = 0;
    if (t > 4.4) { const u = prog(t, 4.4, 5.0); sx_ = lerp(150, 300, ease.io(u)); sw = u < 1 ? t : null; }
    if (t > 5.0) { const u = prog(t, 5.0, 5.8); sx_ = lerp(300, 316, u); sy_ = lerp(G, by(8) + 2, ease.out(u)) - Math.abs(Math.sin(u * Math.PI * 3)) * 4; }
    if (t > 9.0) { const u = prog(t, 9.0, 9.45); sx_ = lerp(316, 286, u); sy_ = lerp(by(8) + 2, G, ease.in(u)) - 14 * 4 * u * (1 - u); }
    for (const row of SCHOOL2.dome) arm = Math.max(arm, ramp(T, row.t - 0.15, row.t + 0.05, 0.1));
    if (t > 9.5) arm = Math.max(arm, ramp(t, 9.55, 10.6));
    drawSonnet(sx_, sy_, { walk: sw, spoon: 'trowel', armR: arm, look: t > 5.8 && t < 9 ? 1 : 0, noShadow: sy_ < G - 2, eyes: t > 9.5 && t < 11 ? 'happy' : null });
    for (const row of SCHOOL2.dome) if (T > row.t && T < row.t + 0.6) twinkles(DOME.cx, DOME.base() - 6, T, row.t, 3, 12);
    for (const a of SCHOOL2.arches) if (T > a.t && T < a.t + 0.5) { const [x, y, W] = rectOf(a.rect); sparkle(x + W / 2, y + 2, T - a.t, 4); }
    finish2(T, t, this.lines, { after: () => toast('MILESTONE!', 'TWO NEW WINGS', t - 11.0, (x, y) => iconBlock(x, y, '#93D2EE')) });
  },
});

// ---------- 14. The inspection (dollhouse cutaway) ----------
const TOUR_CUT = 1.8;
function opusTour(t) { // Principal Opus walks the ground floor
  const x = kf(t, [[3.0, 200], [3.8, 204], [4.6, 116, 'sine'], [7.0, 116], [7.8, 150, 'sine'], [9.6, 150], [10.4, 212, 'sine'], [12.6, 212], [13.5, 356, 'sine']]);
  const d = kf(t, [[7.0, 3], [7.8, 5], [9.6, 5], [10.0, 3]]);
  const walking = win(t, 3.8, 4.6) || win(t, 7.0, 7.8) || win(t, 9.6, 10.4) || win(t, 12.6, 13.5);
  return { x: x + d / 2, y: FLOOR_Y[1][1] - d / 2, walking, d };
}
scene({
  id: 'tour', title: 'The inspection', dur: 27.0, tod: [0.52, 0.72],
  lines: [
    L(0.2, 1.6, 'opus', 'TIME FOR AN INSPECTION.'),
    L(4.8, 6.0, 'k1', 'IS THIS... CEMENT?'),
    L(6.2, 7.2, 'sonnet', 'SOUP. MOSTLY.'),
    L(7.9, 9.5, 'opus', 'APPROVED. APPROVED. APPROVED.', { max: 20 }),
    L(10.6, 11.2, 'hW', '1 + 1 = ?', { noHold: true }),
    L(11.3, 11.9, 'k2', '2!', { noHold: true }),
    L(12.1, 12.9, 'hW', 'CORRECT!'),
    L(14.4, 15.8, 'hB', 'GOGGLES ON, PLEASE.'),
    L(19.0, 20.8, 'k4', 'IT WORKS ON MY MACHINE!'),
    L(22.4, 23.3, 'k5', 'SHHH!'),
    L(24.0, 25.4, 'k6', 'MASTERPIECE.'),
  ],
  sfx: (() => {
    const e = [[1.8, 'whoosh'], [2.1, 'whoosh', { n: 2 }], [2.4, 'whoosh', { n: 4 }], [2.0, 'clatter'], [2.6, 'clatter', { n: 3 }], [3.2, 'twinkle'], [3.3, 'boing'], [3.8, 'thud'],
      [4.5, 'bubble'], [5.2, 'bubble', { n: 1 }], [8.1, 'stamp'], [8.65, 'stamp'], [9.2, 'stamp'], [10.65, 'chalk'], [11.95, 'ding'], [12.0, 'chalk'], [12.2, 'twinkle'],
      [13.6, 'bubble'], [13.9, 'bubble', { n: 2 }], [14.05, 'poof'], [22.2, 'thud'], [24.4, 'twinkle']];
    for (let k = 0; k < 9; k++) e.push([16.2 + k * 0.25, 'drum', { n: k }]);
    for (let k = 0; k < 10; k++) e.push([18.9 + k * 0.18, 'type', { n: k }]);
    return e;
  })(),
  draw(t, T) {
    camKF(t, [[0, 200, 74, 2.4], [1.8, 200, 74, 2.4], [3.6, 200, 86, 2.7, 'sine'], [4.4, 82, 113, 8.4, 'sine'], [7.2, 88, 113, 8.4], [7.8, 156, 113, 8.4, 'sine'], [9.3, 160, 113, 8.0],
      [9.7, 200, 112, 7.6, 'sine'], [10.5, 248, 113, 8.4, 'sine'], [12.9, 252, 113, 8.4], [13.6, 322, 113, 8.2, 'sine'], [16.0, 326, 113, 8.2], [16.6, 322, 86, 8.4, 'sine'], [18.4, 318, 86, 8.4],
      [19.0, 238, 86, 8.4, 'sine'], [20.9, 234, 86, 8.4], [21.5, 162, 86, 8.4, 'sine'], [23.5, 158, 86, 8.4], [24.1, 82, 86, 8.4, 'sine'], [25.8, 86, 86, 8.4], [27.0, 200, 76, 2.4, 'sine']]);
    const op = opusTour(t), inside = t > 3.8;
    const opusIn = r => { if (!inside) return; if (op.x < r.x0 - 22 || op.x > r.x1 + 22) return; const st = ramp(t, 7.95, 9.4, 0.1); drawOpus(op.x, op.y, { badge: 1, item: t < 7 || t > 9.7 ? 'clipboard' : null, walk: op.walking ? t : null, look: t > 4.6 && t < 7 ? -1 : t > 10.6 && t < 12.6 ? -1 : 0, armR: { up: st * (0.6 + 0.4 * Math.sin(AMB * 11)) }, stampOn: st > 0.05 ? 1 : null, eyes: t > 12.1 && t < 13 ? 'happy' : t > 14 && t < 14.6 ? 'wide' : null }); };
    const kid = (r, i, u, d, o = {}) => { const [x, y] = r.f(u, d); drawKid(x, y, Object.assign({ id: 'k' + i, pack: i, look: 0 }, o)); };
    const occupants = {
      caf: r => {
        const [sx0, sy0] = r.f(14, 2); drawSonnet(sx0, sy0, { spoon: [6 + Math.cos(AMB * 8) * 1.5, -17 + Math.sin(AMB * 8) * 0.8], look: t > 6 ? 1 : 0, eyes: t > 6.2 && t < 7.2 ? 'happy' : null });
        [34, 46, 58, 70].forEach((u, i) => kid(r, [1, 7, 8, 9][i], u, 9, { hop: Math.sin(AMB * 5 + i) > 0.92 ? -0.8 : 0, eyes: i === 0 && t > 4.8 && t < 6.0 ? null : 'happy', look: i === 0 && t > 4.8 && t < 6.2 ? -1 : 0 }));
      },
      office: r => opusIn(r),
      class: r => {
        r.solved = t > 11.95 ? 1 : 0;
        const [wx, wy] = r.f(6, 6); drawHaiku('W', wx, wy, { arms: { throw: ramp(t, 10.5, 11.2) }, look: 1, eyes: t > 12.1 ? 'happy' : null, ...jumpO(t, [[12.15, 0.25, 3]]) });
        [[20, 6, 2], [36, 6, 3], [26, 11, 10], [42, 11, 11]].forEach(([u, d, i]) => kid(r, i, u, d, { raise: i === 2 ? ramp(t, 11.25, 12.0, 0.1) : 0, eyes: t > 12.1 ? 'happy' : null, ...(i === 2 ? jumpO(t, [[11.3, 0.2, 2]]) : {}) }));
      },
      lab: r => {
        const soot = prog(t, 14.05, 14.3);
        [[20, 12, 12], [44, 12, 13]].forEach(([u, d, i]) => kid(r, i, u, d, { goggles: i === 12 || t > 15.4, soot: i === 13 ? soot : 0, eyes: i === 13 && soot > 0 ? (t < 15 ? 'happy' : null) : null }));
        const [bx_, by_] = r.f(2, 4); drawHaiku('B', bx_, by_, { look: 1, arms: { up: ramp(t, 14.4, 15.8) * 0.6 }, eyes: t > 14.05 && t < 14.4 ? 'wide' : null });
      },
      art: r => { kid(r, 6, 36, 4, { look: -1, eyes: t > 24.2 ? 'happy' : null, raise: 0.6 + Math.sin(AMB * 6) * 0.3 }); kid(r, 14, 64, 4, { look: -1 }); },
      library: r => {
        kid(r, 5, 34, 6, { book: '#3D7DDB', eyes: t > 22.2 && t < 23.4 ? 'wide' : 'closed' });
        if (t > 19.5) { const u = prog(t, 21.2, 23.4), [hx, hy] = r.f(lerp(66, 10, u), 9); drawHaiku('B', hx, hy, { walk: u > 0 && u < 1 ? t * 0.45 : null, look: -1, eyes: t > 22.2 && t < 23.6 ? 'wide' : null, hop: u > 0 && u < 1 ? -Math.abs(Math.sin(t * 3)) * 1.5 : 0 }); }
      },
      comp: r => { [[14, 10, 4], [30, 10, 15], [46, 10, 16]].forEach(([u, d, i]) => kid(r, i, u, d, { eyes: i === 4 && t > 20.6 ? 'happy' : null, hop: i === 4 ? hops(t, [[19.1, 0.2, 1.5]]) : 0 })); },
      music: r => {
        const [x, y] = r.f(60, 10); const beat = Math.sin(AMB * 25) > 0;
        drawHaiku('Y', x, y, { arms: beat ? { throw: 1 } : { up: 0.6 }, armsL: beat ? 0.6 : 1, eyes: 'happy', hop: beat ? -0.6 : 0 });
        [[18, 4, 17], [32, 4, 18]].forEach(([u, d, i], k) => kid(r, i, u, d, { eyes: 'happy', hop: -Math.abs(Math.sin(AMB * 7 + k * 1.6)) * 3 }));
      },
    };
    const occupantsFront = {
      office: r => {
        const [x, y] = r.f(10, 1.5);
        [[14, 8.1], [19, 8.65], [24, 9.2]].forEach(([u, tt]) => { at(x, y); cube(u - 2, -7.6, 4, 0.6, 3, '#FFFFFF'); if (t > tt) { const s = t - tt < 0.1 ? 1.4 : 1; ctx.globalAlpha = 0.9; R(x + u - 1.5 * s, y - 7.9, 3 * s, 1.2, '#C8452F'); ctx.globalAlpha = 1; } });
      },
      caf: r => opusIn(r), lobby: r => opusIn(r), class: r => opusIn(r),
      lab: r => {
        opusIn(r);
        const a = t - 14.05;
        if (a > -0.6 && a < 0) { const [x, y] = r.f(53, 6); disc(x, y - 12 + Math.sin(AMB * 40) * 0.5, 1.4, '#F2832E'); }
        if (a > 0 && a < 0.9) { const [x, y] = r.f(53, 8); dust(x, y - 10, a * 0.75, 70, 9, 14, '#8A8580'); dust(x, y - 12, a * 0.6, 71, 6, 10, '#D9D2C5'); }
      },
      library: r => { if (win(t, 22.0, 22.5)) { const u = prog(t, 22.0, 22.25), [x, y] = r.f(lerp(66, 10, prog(t, 21.2, 23.4)), 9); at(x + 4, lerp(y - 12, y, ease.in(u))); cube(-2, -1, 4, 1.4, 3, '#C8452F'); } },
      music: r => { const [px, py] = r.f(16, 12); for (let i = 0; i < 6; i++) mini.note(px + i * 9, py - 10, ((AMB * 0.9 + i * 0.27) % 1.7), ['#C8452F', '#3D7DDB', '#9A5BD0'][i % 3]); },
    };
    world2(T, { cut: { out: ST.tour + TOUR_CUT }, occupants, occupantsFront });
    // before he steps inside, Opus is on the lawn
    if (!inside) {
      const hopIn = prog(t, 3.0, 3.8);
      drawOpus(lerp(200, 204, hopIn), lerp(G, FLOOR_Y[1][1] - 1.5, ease.out(hopIn)) - 14 * 4 * hopIn * (1 - hopIn), { badge: 1, item: 'clipboard', eyes: win(t, 2.0, 3.0) ? 'wide' : null, look: win(t, 2.0, 2.9) ? Math.sin(t * 6) : 0 });
    }
    if (win(t, 11.95, 12.6)) { const r = ROOM.class, [bx_, by_] = r.w(12, 16); twinkles(bx_ + 22, by_ + 4, t, 11.95, 3, 6); }
    finish2(T, t, this.lines, { after: () => {
      caption('CAFETERIA', t - 4.4); caption("PRINCIPAL'S OFFICE", t - 7.6, 1.4); caption('STAIRS BY SONNET', t - 9.35, 0.9); caption('CLASS 1-A', t - 10.7); caption('SCIENCE LAB', t - 13.4);
      caption('MUSIC ROOM', t - 16.4); caption('COMPUTER LAB', t - 18.8); caption('LIBRARY', t - 21.4); caption('ART ROOM', t - 24.0);
    } });
  },
});

// ---------- 15. Grand opening at dusk ----------
const FIREWORKS = [[1.6, 120, 22, '#FF6B6B'], [2.2, 290, 14, '#FFD34E'], [2.9, 200, 8, '#7EE0FF'], [3.6, 60, 30, '#B07BE0'], [4.3, 340, 24, '#7EDB3A'], [5.2, 150, 16, '#FF9A4D'],
  [6.0, 262, 26, '#EE6FA8'], [7.2, 96, 20, '#FF6B6B'], [8.0, 312, 12, '#FFD34E'], [9.4, 200, 6, '#EE6FA8'], [10.2, 136, 24, '#7EE0FF'], [10.8, 270, 18, '#FFD34E'], [11.1, 200, 30, '#FFFFFF']];
scene({
  id: 'grand', title: 'Grand opening', dur: 13.0, tod: [0.88, 1.0],
  lines: [
    L(2.4, 4.0, 'opus', 'SCHOOL V2... SHIPPED!'),
    L(4.2, 5.0, 'hY', 'SHIP IT!!'),
    L(5.2, 6.6, 'sonnet', 'AND THE KITCHEN WORKS.'),
    L(6.9, 8.2, 'k0', 'CAN WE GET A POOL?'),
    L(8.9, 9.9, 'opus', "...THAT'S V3.", { cps: 13 }),
  ],
  sfx: (() => {
    const e = [[0.25, 'whoosh'], [0.6, 'whoosh', { n: 2 }], [0.9, 'clatter'], [1.9, 'toast'], [1.95, 'xp'], [4.3, 'boing'], [4.38, 'boing'], [4.46, 'boing'], [8.4, 'cricket'], [10.05, 'tada'], [10.1, 'boing'], [11.4, 'shutter']];
    for (const f of FIREWORKS) e.push([f[0], 'firework', { n: Math.round(f[1]) }]);
    return e;
  })(),
  draw(t0, T0) {
    const t = Math.min(t0, 11.4), T = T0 - (t0 - t);
    camKF(t, [[0, 200, 72, 2.45], [3.0, 200, 72, 2.55, 'sine'], [6.8, 196, 88, 3.0, 'sine'], [10.2, 196, 86, 2.95], [11.4, 200, 74, 2.5, 'sine']]);
    const lit = prog(t, 0.8, 3.0);
    world2(T, { cut: { out: ST.tour + TOUR_CUT, back: ST.grand + 0.2 }, lit, doorOpen: false });
    const laugh = t > 10.0, pose = t > 10.9;
    const jumpAll = k => jump(t, [[4.3 + k * 0.08, 0.3, 6], [10.1 + k * 0.05, 0.3, 5], [10.9 + k * 0.04, 0.5, 8]]);
    [96, 110, 124, 138, 262, 276, 290, 304].forEach((x, i) => { const j = jumpAll(i % 4); drawKid(x, G - (i % 2) * 2, { id: 'k' + i, pack: i, flip: x > 200, look: t > 8.3 && t < 8.9 ? (x < 200 ? 1 : -1) : 0, eyes: laugh || t < 6.8 ? 'happy' : null, hop: j.y, sq: j.sq, raise: i === 0 ? ramp(t, 6.9, 8.2, 0.1) : pose ? 1 : 0 }); });
    { const j = jumpAll(1); drawSonnet(168, G, { look: t > 8.3 && t < 8.9 ? 1 : 0, eyes: laugh || win(t, 5.2, 6.6) ? 'happy' : null, armL: ramp(t, 10.9, 13), spoon: 'up', hop: j.y, sq: j.sq }); }
    { const j = jumpAll(0); drawOpus(200, G, { badge: 1, look: t > 6.9 && t < 8.3 ? 1 : 0, armL: { up: ramp(t, 2.4, 4.0) * 0.8 + ramp(t, 10.9, 13) }, armR: { up: ramp(t, 10.9, 13) }, eyes: laugh || win(t, 2.4, 4.0) ? 'happy' : null, hop: j.y, sq: j.sq }); }
    ['W', 'Y', 'B'].forEach((k, i) => { const j = jumpAll(i + 2); drawHaiku(k, 232 + i * 13, G, { look: t > 8.3 && t < 8.9 ? -1 : 0, arms: { up: Math.max(ramp(t, 4.2, 5.0), ramp(t, 10.9, 13)) }, eyes: laugh || win(t, 4.2, 5.0) ? 'happy' : null, hop: j.y, sq: j.sq }); });
    finish2(T, t, this.lines, { after: () => {
      fireworks(t, FIREWORKS);
      xpOrbs(200, by(1), t - 1.9);
      toast('ACHIEVEMENT!', 'SCHOOL V2 SHIPPED', t - 1.9, (x, y) => { S(x - 14, y - 4, 28, 14, '#E6D09E'); S(x - 16, y - 8, 32, 4, '#4E6884'); S(x - 4, y - 14, 8, 6, '#93D2EE'); S(x - 2, y + 3, 4, 7, '#C24B34'); });
    } });
    if (t0 >= 11.4) S(0, 0, VW, VH, `rgba(255,255,255,${clamp(1 - (t0 - 11.4) / 0.3, 0, 1)})`);
  },
});

// ---------- 16. The end ----------
scene({
  id: 'end', title: 'The end', dur: 5.0, noWipe: true, noTint: true,
  sfx: [[0.05, 'pageflip'], [1.0, 'tada'], [2.3, 'twinkle']],
  draw(t, T) {
    setCam(0, 0, 3);
    S(0, 0, VW, VH, '#F0EDE6');
    for (let y = 0; y < VH; y += 24) for (let x = (y / 24 % 2) * 12; x < VW; x += 24) S(x, y, 2, 2, '#E4DFD5');
    const oy = kf(t, [[0, 560], [0.6, 0, 'back']]), rot = kf(t, [[0, -0.12], [0.6, 0.02, 'back'], [5, 0.015]]);
    const px = 168, py = 22 + oy, pw = 624, ph = 351;
    ctx.save();
    ctx.translate(480 * K, (py + ph / 2) * K); ctx.rotate(rot); ctx.translate(-480 * K, -(py + ph / 2) * K);
    S(px - 14 + 8, py - 14 + 8, pw + 28, ph + 70, 'rgba(31,30,29,0.18)');
    S(px - 14, py - 14, pw + 28, ph + 70, '#FFFFFF');
    ctx.save();
    ctx.beginPath(); ctx.rect(px * K, py * K, pw * K, ph * K); ctx.clip();
    camLock = { x: 44 - 40, y: -26, s: 1.66, ox: px, oy: py };
    const prevTOD = TOD; TOD = 1.0;
    NOBLINK = true; SCENES.find(s => s.id === 'grand').draw(11.39, ST.grand + 11.39); NOBLINK = false;
    TOD = prevTOD; camLock = null;
    ctx.restore();
    textC('DAY TWO · 5.5 ACADEMY V2', 480, py + ph + 20, 2, '#3C3833');
    ctx.restore();
    if (t > 1.0) { const s = ease.back(clamp((t - 1.0) / 0.3, 0, 1)); textC('THE END', 480, 466 + (1 - s) * 20, 4, '#1F1E1D'); }
    if (t > 2.3) { const s = ease.back(clamp((t - 2.3) / 0.25, 0, 1)); textC('COMING IN V3: THE POOL?', 480, 512 + (1 - s) * 12, 2, '#C4613F'); }
  },
});
