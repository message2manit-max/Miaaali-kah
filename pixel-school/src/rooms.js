/* ---- the rooms behind the front wall: built from cubes, each with its own furniture.
        Story scenes add the occupants through o.occupants[roomId](room). ---- */
const FLOOR_Y = { 1: [by(3), by(1) + BS], 2: [by(6), by(5) + BS] }; // [ceiling, floor] of each storey's front opening
function mkRoom(id, floor, c0, c1, wall, flr, back, front) {
  const [yT, yB] = FLOOR_Y[floor], x0 = bx(c0), x1 = bx(c1);
  return { id, floor, x0, x1, yT, yB, W: x1 - x0, H: yB - yT, wall, flr, back, front,
    // a point on the floor: u across the room, d into it (0 front, 16 back)
    f(u, d) { return [x0 + u + d / 2, yB - d / 2]; },
    // a point on the back wall: u across, h above the floor
    w(u, h) { return [x0 + 8 + u, yB - 8 - h]; },
    cx() { return (x0 + x1) / 2 + 4; }, cy() { return (yT + yB) / 2 - 2; } };
}
function plate(r, u, h, w, hh, col) { const [x, y] = r.w(u, h + hh); R(x, y, w, hh, col); return [x, y]; }
function floorTiles(r, a, b, size) {
  for (let i = 0; i < 8; i++) {
    const y = r.yB - i - 1;
    for (let u = -size; u < r.W + 8; u += size) {
      const k = (Math.floor(u / size) + Math.floor(i / 2)) & 1;
      R(r.x0 + u + i + 1, y, size, 1, k ? a : b);
    }
  }
}
function floorPlanks(r, col) {
  for (let i = 0; i < 8; i++) {
    const y = r.yB - i - 1, c = i % 2 ? col : shade(col, -0.06);
    R(r.x0 + i + 1, y, r.W + 8, 1, c);
    for (let u = (i * 7) % 13; u < r.W + 8; u += 13) R(r.x0 + i + 1 + u, y, 0.6, 1, shade(col, -0.2));
  }
}
const mini = {
  desk(x, y, w, col) { at(x, y); cube(0, -4, w || 8, 3, 6, col || '#B98552'); p(0.5, -1, 1, 1, '#6E4522'); p((w || 8) - 1.5, -1, 1, 1, '#6E4522'); },
  shelf(x, y, w, h) {
    at(x, y); cube(0, -h, w, h, 6, '#8A5C33', '#A87445', '#6E4522');
    const cols = ['#C8452F', '#3D7DDB', '#3DAA5C', '#F2B632', '#9A5BD0', '#EE6FA8', '#2CB5B0'];
    for (let row = 0; row < Math.floor(h / 4); row++) for (let k = 0; k < w - 2; k += 1.5) {
      const c = cols[(Math.floor(k / 1.5) * 3 + row * 5) % cols.length], hh = 2.2 + rnd(k + row) * 0.8;
      p(1 + k, -h + 1 + row * 4 + (3 - hh), 1.2, hh, c);
    }
  },
  monitor(x, y, t, seed) {
    at(x, y); cube(-4, -6, 8, 5, 2, '#2C2B30', '#45434D', '#1A1A1E'); p(-0.5, -1, 1, 1, '#2C2B30');
    p(-3.2, -5.2, 6.4, 3.6, '#16181D');
    p(-2.8, -4.8, 1, 0.6, '#D97757'); p(-2.2, -4.2, 0.6, 0.6, '#D97757');
    const n = Math.floor((AMB * 3 + seed) % 5);
    for (let i = 0; i < n; i++) p(-1.6 + i * 0.9, -4.5, 0.6, 0.5, i % 2 ? '#8FD0F0' : '#E8E4DC');
    if (Math.sin(AMB * 8 + seed) > 0) p(-1.6 + n * 0.9, -4.6, 0.6, 0.8, '#D97757');
    p(-2.8, -3.2, 3 + Math.sin(seed) * 1.5, 0.5, '#5E9CC0');
  },
  beaker(x, y, col, seed) {
    at(x, y); p(-1.5, -5, 3, 5, '#DDEFF6'); p(-1.2, -3, 2.4, 2.8, col); p(-2, -5.4, 4, 0.6, '#BFDCE8');
    for (let i = 0; i < 2; i++) { const ph = (AMB * 1.4 + i * 0.5 + seed) % 1; ctx.globalAlpha = 1 - ph; disc(x - 0.5 + i, y - 5.5 - ph * 5, 0.5 + ph * 0.6, shade(col, 0.3)); ctx.globalAlpha = 1; }
  },
  note(x, y, age, col) {
    if (age < 0 || age > 1.6) return;
    const u = age / 1.6, nx = x + Math.sin(age * 5) * 2, ny = y - u * 12;
    ctx.globalAlpha = 1 - u * 0.8;
    R(nx, ny, 1.4, 1.2, col); R(nx + 1, ny - 3.5, 0.5, 3.8, col); R(nx + 1, ny - 3.5, 1.5, 0.6, col);
    ctx.globalAlpha = 1;
  },
};

const ROOMS = [
  mkRoom('caf', 1, -11, 0, '#F3E1C2', null,
    (r, T) => {
      floorTiles(r, '#ECE6DA', '#C9C2B6', 5);
      const [bx_, by_] = plate(r, 34, 1.5, 48, 13, '#3B3A42');
      wtext('TODAY: SOUP', bx_ + 3, by_ + 2, '#FFE9A8'); wtext('NOT CEMENT!', bx_ + 3, by_ + 8, '#F2A27E');
      const [kx, ky] = r.f(4, 13); at(kx, ky); cube(0, -6, 26, 6, 6, '#C9CDD2', '#E8EBEE', '#9AA0A6');
      at(kx + 12, ky - 6); cube(-5, -5, 10, 5, 6, '#3B3A42', '#56545F', '#28272D');
      for (let i = 1; i < 3; i++) R(kx + 7 + i + 1, ky - 11 - i - 1, 8, 1, '#E0904A');
      for (let i = 0; i < 2; i++) { const ph = (AMB * 0.6 + i / 2) % 1; ctx.globalAlpha = 0.4 * (1 - ph); disc(kx + 12 + i * 3, ky - 14 - ph * 8, 1 + ph * 2, '#FFFFFF'); ctx.globalAlpha = 1; }
    },
    (r, T) => { const [x, y] = r.f(30, 5); at(x, y); cube(0, -3, 50, 3, 8, '#C98E52', '#DDA56A', '#9E6C38'); for (let k = 0; k < 4; k++) { p(4 + k * 12, -4, 6, 1, '#E9E4DA'); p(6 + k * 12, -4.6, 2, 0.6, '#E0904A'); } }),
  mkRoom('office', 1, 0, 7, '#D9C9A8', null,
    (r, T) => {
      floorPlanks(r, '#8A5C33');
      for (let u = 0; u < r.W + 8; u += 6) { const [x, y] = r.w(u, 16); R(x, y, 0.6, 16, '#C9B691'); }
      const [fx, fy] = plate(r, 4, 7, 14, 10, '#FFFFFF'); R(fx + 1, fy + 1, 12, 7, '#8EC8EC'); R(fx + 1, fy + 6, 12, 2, '#6DBE45'); R(fx + 5, fy + 3, 4, 3, '#E6D09E'); R(fx + 6, fy + 2, 2, 1, '#4E6884');
      const [wx, wy] = plate(r, 26, 5, 14, 11, '#F3EEE3'); R(wx + 1, wy + 1, 12, 9, '#9FD3F2'); R(wx + 6.5, wy + 1, 1, 9, '#F3EEE3');
      const [px, py] = r.f(44, 12); at(px, py); cube(-2, -3, 4, 3, 4, '#B65C47'); cube(-3, -9, 6, 6, 6, '#4FA03A', '#6CC04F', '#3B8430');
    },
    (r, T) => {
      const [x, y] = r.f(10, 1.5); at(x, y); cube(0, -7, 30, 7, 6, '#6E4522', '#8A5C33', '#4E3018');
      p(7, -5.5, 17, 5, C.gold); p(7, -5.5, 17, 0.6, '#FFE08A'); wtext('OPUS', x + 8, y - 5, '#4E3018');
      at(x, y); cube(3, -10, 4, 3, 2, '#FFFFFF'); cube(22, -9, 4, 2, 2, '#F6F3EE');
    }),
  mkRoom('lobby', 1, 7, 12, '#EDE3CF', null,
    (r, T) => {
      floorTiles(r, '#D5D7D3', '#B9BCB7', 8);
      const [bx_, by_] = plate(r, 2, 8, 30, 7, '#C24B34'); wtext('WELCOME', bx_ + 2, by_ + 1, '#FFF3D6');
      drawStairs(r.x0 + 4, r.yB - 4, T);
    },
    (r, T) => { const [x, y] = r.f(30, 3); at(x, y); cube(-2, -4, 5, 4, 4, '#E9E3D5'); cube(-1.5, -7, 4, 3, 4, C.gold, '#FFE08A', C.goldD); }),
  mkRoom('class', 1, 12, 19, '#CFE3D3', null,
    (r, T) => {
      floorPlanks(r, '#B98552');
      const [bx_, by_] = plate(r, 12, 5, 32, 11, '#8A5C33'); R(bx_ + 1, by_ + 1, 30, 9, '#2F5D4A');
      const solved = r.solved || 0;
      wtext('1+1=' + (solved ? '2' : '?'), bx_ + 5, by_ + 3, '#F1F6EE');
      if (solved) { R(bx_ + 23, by_ + 3, 1, 1, '#F2B632'); R(bx_ + 24, by_ + 4, 1, 1, '#F2B632'); R(bx_ + 25, by_ + 2, 1, 2, '#F2B632'); }
      R(bx_ + 2, by_ + 9, 6, 0.6, '#FFFFFF');
    },
    (r, T) => { for (const [u, d] of [[18, 3], [34, 3]]) { const [x, y] = r.f(u, d); mini.desk(x, y, 9); } }),
  mkRoom('lab', 1, 19, 30, '#DCE7F0', null,
    (r, T) => {
      floorTiles(r, '#F4F6F8', '#D8DEE4', 6);
      const [sx_, sy_] = plate(r, 6, 10, 36, 7, '#3D7DDB'); wtext('SCIENCE!', sx_ + 2, sy_ + 1, '#FFFFFF');
      for (let k = 0; k < 6; k++) { const [x, y] = r.w(52 + k * 4, 10); R(x, y, 3, 4, ['#E24B4B', '#F2B632', '#3DAA5C', '#9A5BD0', '#2CB5B0', '#EE6FA8'][k]); }
    },
    (r, T) => {
      const [x, y] = r.f(10, 6); at(x, y); cube(0, -6, 64, 6, 8, '#3A3F45', '#555B63', '#2A2E33');
      [['#7EDB3A', 8], ['#B07BE0', 22], ['#F2832E', 40], ['#2CB5B0', 54]].forEach(([c, u], i) => mini.beaker(x + u + 2, y - 6 - 2, c, i));
    }),
  mkRoom('art', 2, -11, 0, '#F6E6F0', null,
    (r, T) => {
      floorPlanks(r, '#D9B17E');
      [['#E24B4B', 6, 4], ['#3D7DDB', 14, 6], ['#F2B632', 60, 3], ['#3DAA5C', 70, 5], ['#9A5BD0', 40, 6]].forEach(([c, u, h]) => { const [x, y] = r.w(u, h); disc(x, y, 1.6, c); });
    },
    (r, T) => {
      for (const [u, d, portrait] of [[22, 7, true], [56, 7, false]]) {
        const [x, y] = r.f(u, d); at(x, y);
        cube(-5, -2, 1, 2, 1, C.woodD); cube(4, -2, 1, 2, 1, C.woodD);
        cube(-6, -11, 12, 9, 2, '#FFFFFF', '#FFFFFF', '#D9D2C5');
        if (portrait) { p(-4, -9, 8, 3, C.skin); p(-4, -6, 8, 3, C.suit); p(-4, -8, 8, 0.8, C.ink); p(-3, -8.6, 2, 2, C.ink); p(1, -8.6, 2, 2, C.ink); p(-0.4, -6, 0.8, 3, C.tie); }
        else { disc(x - 2, y - 7, 2, '#3D7DDB'); disc(x + 2, y - 5, 1.6, '#F2B632'); p(-4, -9, 3, 1, '#E24B4B'); }
      }
    }),
  mkRoom('library', 2, 0, 9, '#E8DCC4', null,
    (r, T) => {
      floorPlanks(r, '#9E3B3B');
      for (const u of [2, 18, 34, 50]) { const [x, y] = r.f(u, 14); mini.shelf(x, y, 14, 9); }
      const [sx_, sy_] = plate(r, 60, 3, 18, 6, '#FFFFFF'); wtext('SHHH', sx_ + 2, sy_ + 0.5, '#C24B34');
    },
    (r, T) => { const [x, y] = r.f(26, 2.5); at(x, y); cube(0, -3, 22, 3, 6, '#8A5C33', '#A87445', '#6E4522'); cube(3, -4, 5, 1, 4, '#3D7DDB'); cube(13, -4, 4, 1.5, 4, '#E24B4B'); }),
  mkRoom('comp', 2, 9, 19, '#E3E6EA', null,
    (r, T) => {
      floorTiles(r, '#C9CDD2', '#B5BAC0', 7);
      const [sx_, sy_] = plate(r, 36, 2, 26, 6, '#2C2B30'); wtext('> CODE', sx_ + 2, sy_ + 0.5, '#D97757');
    },
    (r, T) => { const [x, y] = r.f(6, 2); at(x, y); cube(0, -3, 66, 3, 6, '#9AA0A6', '#C9CDD2', '#6E747C'); for (let k = 0; k < 4; k++) mini.monitor(x + 9 + k * 16, y - 3, T, k * 1.7); }),
  mkRoom('music', 2, 19, 30, '#FFF1C9', null,
    (r, T) => {
      floorPlanks(r, '#C98E52');
      const [x, y] = r.f(6, 12); at(x, y); cube(0, -7, 22, 7, 8, '#1F1E1D', '#3A3836', '#121110');
      for (let k = 0; k < 20; k += 1.5) R(x + 1 + k + 1, y - 7 - 1, 1, 1, '#FFFFFF');
    },
    (r, T) => {
      const [x, y] = r.f(58, 6); at(x, y); cube(-5, -5, 10, 5, 8, '#C24B34', '#E8786A', '#8E3020'); p(-5, -3, 10, 0.8, '#F2D6A8');
      cube(6, -9, 1, 9, 1, C.steel); cube(3, -9.5, 8, 0.8, 6, C.gold, '#FFE08A', C.goldD);
    }),
];
const ROOM = {}; for (const r of ROOMS) ROOM[r.id] = r;
const PARTITIONS = [[1, 0, 'office'], [1, 7, 'lobby'], [1, 12, 'class'], [1, 19, 'lab'], [2, 0, 'library'], [2, 9, 'comp'], [2, 19, 'music']];

function drawRooms(T, o) {
  for (const r of ROOMS) {
    ctx.save();
    const X = Math.round(sx(r.x0) * K), Y = Math.round(sy(r.yT) * K);
    ctx.beginPath(); ctx.rect(X, Y, Math.round(sx(r.x1) * K) - X, Math.round(sy(r.yB) * K) - Y); ctx.clip();
    R(r.x0, r.yT - 8, r.W + 8, r.H + 8, r.wall);
    const [bx0, by0] = r.w(0, 0); R(bx0, by0 - 1, r.W, 1.2, shade(r.wall, -0.18));
    r.back(r, T);
    if (o.occupants && o.occupants[r.id]) o.occupants[r.id](r, T);
    r.front(r, T);
    if (o.occupantsFront && o.occupantsFront[r.id]) o.occupantsFront[r.id](r, T);
    ctx.globalAlpha = 0.16; R(r.x0, r.yT, r.W + 8, 3, '#000000'); ctx.globalAlpha = 1;
    if (o.lit) { ctx.globalAlpha = 0.18 * o.lit; R(r.x0, r.yT, r.W, r.H, '#FFC870'); ctx.globalAlpha = 1; }
    ctx.restore();
  }
  for (const [fl, c, right] of PARTITIONS) {
    const [yT, yB] = FLOOR_Y[fl];
    ctx.save();
    const X = Math.round(sx(bx(-12)) * K), Y = Math.round(sy(yT) * K);
    ctx.beginPath(); ctx.rect(X, Y, Math.round(sx(bx(31)) * K) - X, Math.round(sy(yB) * K) - Y); ctx.clip();
    at(0, 0); cube(bx(c) - 1, yT, 2, yB - yT, 16, '#E6D09E', '#F0E2BF', shade(ROOM[right].wall, -0.16));
    ctx.restore();
  }
}
