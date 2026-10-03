/* 15-revenue: a dark command room. A giant holo chart of Anthropic's revenue run-rate
   fills the back wall; Dario and Daniela watch from the foreground as each orange energy
   column shoots up the moment its number is spoken. Honest chart: one series, linear
   $0..$70B axis, every bar on the same scale. */

var R_LINES = [
  'Now look how fast it grew.',
  'In early 2024, Anthropic was making about 100 million dollars a year.',
  'Early 2025, one billion. Then five, nine, fourteen, thirty, forty-seven...',
  'And by July 2026, sixty-five billion dollars a year!'
];

// value in $B, label, x-axis date, and the narration moment (line, fraction) that raises it
var R_BARS = [
  { v: 0.1, lab: '$0.1B', m: 'JAN', y: '2024', line: 1, f: 0.62 },
  { v: 1,   lab: '$1B',   m: 'JAN', y: '2025', line: 2, f: 0.25 },
  { v: 5,   lab: '$5B',   m: 'AUG', y: '2025', line: 2, f: 0.46 },
  { v: 9,   lab: '$9B',   m: 'DEC', y: '2025', line: 2, f: 0.54 },
  { v: 14,  lab: '$14B',  m: 'FEB', y: '2026', line: 2, f: 0.62 },
  { v: 30,  lab: '$30B',  m: 'APR', y: '2026', line: 2, f: 0.73 },
  { v: 47,  lab: '$47B',  m: 'MAY', y: '2026', line: 2, f: 0.84 },
  { v: 65,  lab: '$65B',  m: 'JUL', y: '2026', line: 3, f: 0.48 }
];

// chart geometry (world coordinates)
var RX0 = 358, RX1 = 1006, RBASE = 470, RMAX = 70, RPH = 320;
var RPX = RPH / RMAX;                  // pixels per $1B, the same for every bar
var RSLOT = (RX1 - RX0) / R_BARS.length, RBW = 44;
function rBarX(i) { return RX0 + RSLOT * (i + 0.5); }
function rValY(v) { return RBASE - v * RPX; }

// parallax camera: f = how strongly this layer follows the camera (0 = fixed, 1 = world)
function rCam(cam, f, fn) {
  camera(640 + (cam.x - 640) * f + cam.dx * f, 360 + (cam.y - 360) * f + cam.dy * f, 1 + (cam.z - 1) * f, cam.r * f, fn);
}

/* ---------- background: night window wall, ceiling lights, glossy floor ---------- */
function rRoom(c) {
  ctx.fillStyle = lin(0, -200, 0, 920, [[0, '#04060f'], [0.45, '#0a1130'], [1, '#03050c']]);
  ctx.fillRect(-500, -400, W + 1000, H + 900);
}
function rWindowCity(c) {
  ctx.save();
  ctx.beginPath(); ctx.rect(-300, 64, W + 600, 392); ctx.clip();
  sky(['#060a24', '#101a4a', '#2a2f72', '#5a3f82'], 456);
  stars(41, 70, c.t, [-100, 70, W + 200, 230]);
  glow(860, 440, 520, 'rgba(255,140,90,0.22)');
  city(456, { color: '#2c3170', seed: 21, height: 210, bw: 64 });
  city(456, { color: '#1a1f4c', lit: 'rgba(255,214,150,0.55)', seed: 8, height: 150, bw: 82, density: 0.7, rim: 'rgba(125,249,255,0.25)' });
  // low haze over the street glow
  ctx.fillStyle = lin(0, 380, 0, 456, [[0, 'rgba(255,150,100,0)'], [1, 'rgba(255,150,100,0.25)']]);
  ctx.fillRect(-300, 380, W + 600, 80);
  ctx.restore();
}
function rFrame(c) {
  // glass sheen
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(160,200,255,0.05)';
  ctx.beginPath(); ctx.moveTo(-60, 64); ctx.lineTo(120, 64); ctx.lineTo(-60, 300); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(1180, 64); ctx.lineTo(1260, 64); ctx.lineTo(1080, 456); ctx.lineTo(1000, 456); ctx.closePath(); ctx.fill();
  ctx.restore();
  // mullions (slightly wider at the bottom: low camera)
  var ms = [-110, 190, 1090, 1390];
  for (var i = 0; i < ms.length; i++) {
    ctx.fillStyle = '#070a1b';
    ctx.beginPath(); ctx.moveTo(ms[i] - 9, 64); ctx.lineTo(ms[i] + 9, 64); ctx.lineTo(ms[i] + 13, 456); ctx.lineTo(ms[i] - 13, 456); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(125,249,255,0.22)'; ctx.fillRect(ms[i] + 8, 64, 2, 392);
  }
  // ceiling soffit with converging light strips
  ctx.fillStyle = lin(0, -200, 0, 64, [[0, '#02030a'], [1, '#0b1028']]);
  ctx.fillRect(-300, -200, W + 600, 264);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var k = 0; k < 7; k++) {
    var x0 = -200 + k * 280, x1 = 640 + (x0 - 640) * 0.55;
    ctx.fillStyle = lin(0, -40, 0, 60, [[0, 'rgba(125,249,255,0)'], [1, 'rgba(125,249,255,0.5)']]);
    ctx.beginPath(); ctx.moveTo(x0 - 3, -40); ctx.lineTo(x0 + 3, -40); ctx.lineTo(x1 + 2, 58); ctx.lineTo(x1 - 2, 58); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = '#0e1534'; ctx.fillRect(-300, 58, W + 600, 8);
  ctx.fillStyle = 'rgba(125,249,255,0.55)'; ctx.fillRect(-300, 64, W + 600, 2);
  // window sill with a glowing strip
  ctx.fillStyle = '#0a0f26'; ctx.fillRect(-300, 456, W + 600, 22);
  ctx.fillStyle = 'rgba(125,249,255,0.6)'; ctx.fillRect(-300, 456, W + 600, 2);
  // glossy floor
  ctx.fillStyle = lin(0, 478, 0, 900, [[0, '#0d1436'], [0.5, '#060a1c'], [1, '#020308']]);
  ctx.fillRect(-300, 478, W + 600, 600);
}
function rFloorGlow(c, heat) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  // reflection of the chart in the polished floor
  ctx.fillStyle = lin(0, 478, 0, 760, [[0, 'rgba(255,138,61,' + (0.16 + 0.22 * heat) + ')'], [1, 'rgba(255,138,61,0)']]);
  ctx.fillRect(RX0 - 20, 478, RX1 - RX0 + 40, 300);
  ctx.fillStyle = 'rgba(125,249,255,0.07)';
  for (var i = 0; i < 6; i++) ctx.fillRect(260, 500 + i * 26 + i * i * 3, 760, 2);
  // holo projector cone from the floor emitter up to the panel
  ctx.fillStyle = lin(0, 720, 0, 560, [[0, 'rgba(125,249,255,0.16)'], [1, 'rgba(125,249,255,0)']]);
  ctx.beginPath(); ctx.moveTo(560, 760); ctx.lineTo(720, 760); ctx.lineTo(1010, 570); ctx.lineTo(270, 570); ctx.closePath(); ctx.fill();
  ctx.restore();
  // emitter disc
  ctx.save(); ctx.fillStyle = '#0a1a33'; ctx.beginPath(); ctx.ellipse(640, 742, 150, 26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(125,249,255,0.75)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(640, 742, 150, 26, 0, Math.PI, Math.PI * 2); ctx.stroke();
  ctx.restore();
  bloom(640, 735, 140, 'rgba(125,249,255,0.35)');
}
// small decorative side screens floating behind the main panel (no text)
function rSideScreens(c) {
  var defs = [[40, 120, 190, 120, 3], [1050, 150, 200, 130, 9]];
  for (var i = 0; i < defs.length; i++) {
    var d = defs[i];
    fade(0.75, function () {
      holoPanel(d[0], d[1], d[2], d[3], 1, { color: P.holoDeep, fill: 'rgba(10,24,60,0.55)' });
      ctx.fillStyle = 'rgba(125,249,255,0.55)';
      for (var b = 0; b < 9; b++) {
        var hgt = 14 + 60 * hash(d[4], b) * (0.7 + 0.3 * Math.sin(c.t * 1.3 + b));
        ctx.fillRect(d[0] + 18 + b * 18, d[1] + d[3] - 14 - hgt, 10, hgt);
      }
      ctx.strokeStyle = 'rgba(255,170,110,0.7)'; ctx.lineWidth = 2; ctx.beginPath();
      for (var p = 0; p < 10; p++) { var px = d[0] + 14 + p * (d[2] - 28) / 9, py = d[1] + 26 + 22 * Math.sin(p * 0.9 + c.t * 0.8 + d[4]); if (p) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
      ctx.stroke();
    });
  }
}

/* ---------- the chart ---------- */
function rBarK(c, i) { var b = R_BARS[i]; return eo(seg(c.since(b.line, b.f), 0, 0.5)); }
function rChart(c) {
  var t = c.t;
  holoPanel(276, 26, 756, 548, 1, { color: P.holo, fill: 'rgba(8,16,44,0.78)' });
  // the room heats up as the columns rise: warm light pooling behind the tall bars
  var heat = 0; for (var h = 0; h < R_BARS.length; h++) heat += rBarK(c, h) * R_BARS[h].v; heat = clamp(heat / 65);
  ctx.save(); ctx.beginPath(); ctx.rect(276, 26, 756, 548); ctx.clip();
  bloom(860, 330, 460, 'rgba(255,110,40,0.32)', heat);
  bloom(520, 470, 300, 'rgba(255,140,60,0.18)', 0.4 + 0.6 * heat);
  var hs = c.since(3, 0.48);
  if (hs > 0) rays(rBarX(7), rValY(65), 12, 560, 2.4, 'rgba(255,205,150,0.7)', 0.32 * (1 - seg(hs, 0.2, 1.6)) + 0.1, c.t, -Math.PI / 2);
  ctx.restore();
  // title (white/neutral text), typed on as the camera tilts up to it
  var ty = clamp(0.25 + c.lineK(0) * 1.4);
  typeOn('RUN-RATE · US DOLLARS', 310, 66, 18, ty, { font: 'r', color: '#bcd0ee', align: 'left', ls: 3 });
  typeOn('REVENUE PER YEAR', 308, 112, 40, ty, { color: '#ffffff', align: 'left', stroke: '#0a1030', sw: 6 });
  // gridlines at round values, labels outside the plot on the left
  var grid = [0, 20, 40, 60];
  var draw = clamp(0.35 + c.t / 0.9);
  for (var g = 0; g < grid.length; g++) {
    var gy = rValY(grid[g]);
    ctx.fillStyle = grid[g] === 0 ? 'rgba(220,235,255,0.85)' : 'rgba(170,205,255,0.22)';
    ctx.fillRect(RX0 - 6, gy - (grid[g] === 0 ? 1.5 : 0.75), (RX1 - RX0 + 12) * draw, grid[g] === 0 ? 3 : 1.5);
    txt(grid[g] === 0 ? '$0' : '$' + grid[g] + 'B', RX0 - 14, gy + 9, 25, { font: 'r', color: '#dfe8ff', align: 'right' });
  }
  if (draw < 1) { // scan head while the grid is drawn in
    var sx = RX0 - 6 + (RX1 - RX0 + 12) * draw;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = lin(sx - 40, 0, sx + 4, 0, [[0, 'rgba(125,249,255,0)'], [1, 'rgba(125,249,255,0.5)']]);
    ctx.fillRect(sx - 40, rValY(70), 44, RPH + 16);
    ctx.fillStyle = 'rgba(220,255,255,0.9)'; ctx.fillRect(sx, rValY(70), 2, RPH + 16);
    ctx.restore();
  }
  // bars
  for (var i = 0; i < R_BARS.length; i++) rBar(c, i);
  // date labels on the x axis
  for (var j = 0; j < R_BARS.length; j++) {
    var x = rBarX(j), lit = rBarK(c, j) > 0 ? 1 : 0.55;
    fade(lit, function () {
      txt(R_BARS[j].m, x, RBASE + 33, 24, { font: 'r', color: '#ffffff' });
      txt(R_BARS[j].y, x, RBASE + 57, 19, { font: 'r', weight: 500, color: '#b4c2de' });
    });
  }
  // "TINY!" callout over the first bar
  var tk = seg(c.since(R_BARS[0].line, R_BARS[0].f), 0.55, 0.45);
  if (tk > 0) {
    var bx = rBarX(0), bob = Math.sin(t * 3) * 2;
    fade(clamp(tk * 2), function () {
      at(bx + 6, RBASE - 102 + bob, back(tk), -0.06, function () {
        txt('TINY!', 0, 0, 30, { color: '#ffffff', stroke: P.ink, sw: 7 });
      });
    });
  }
}
function rBar(c, i) {
  var b = R_BARS[i], k = rBarK(c, i);
  if (!(k > 0)) return;
  var x = rBarX(i), h = Math.max(1, b.v * RPX * k), top = RBASE - h, t = c.t;
  var rising = k < 1, last = i === R_BARS.length - 1;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  // outer glow column
  ctx.fillStyle = lin(x - RBW, 0, x + RBW, 0, [[0, 'rgba(255,120,40,0)'], [0.5, 'rgba(255,138,61,0.32)'], [1, 'rgba(255,120,40,0)']]);
  ctx.fillRect(x - RBW, top - 10, RBW * 2, h + 10);
  ctx.restore();
  // core column
  ctx.fillStyle = lin(0, RBASE, 0, top, [[0, P.claudeDeep], [0.6, P.claude], [1, '#ffc27a']]);
  ctx.fillRect(x - RBW / 2, top, RBW, h);
  // energy streaks flowing up inside
  if (h > 12) {
    ctx.save(); ctx.beginPath(); ctx.rect(x - RBW / 2, top, RBW, h); ctx.clip();
    ctx.fillStyle = 'rgba(255,240,210,0.35)';
    for (var s = 0; s < 4; s++) {
      var sy = RBASE - ((t * 90 + hash(i, s) * 400) % 400);
      ctx.fillRect(x - RBW / 2 + 6 + s * 9, sy, 3, 26);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(x - RBW / 2 + 4, top, 5, h);
    ctx.restore();
  }
  // hot cap
  ctx.fillStyle = '#fff2da'; ctx.fillRect(x - RBW / 2, top - 1, RBW, 3);
  bloom(x, top, rising ? 70 : 34, 'rgba(255,190,120,0.7)', rising ? 1 : 0.6);
  if (rising) {
    ctx.save(); ctx.beginPath(); ctx.rect(x - 40, top - 200, 80, RBASE - top + 198); ctx.clip();
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,220,170,0.6)';
    for (var m = 0; m < 5; m++) ctx.fillRect(x - 24 + m * 12, top - 30 - hash(i, m) * 60, 2, 30 + hash(i + 3, m) * 40);
    ctx.restore();
  }
  // base ring burst
  var rk = seg(c.since(b.line, b.f), 0, 0.6);
  if (rk > 0 && rk < 1) fade(1 - rk, function () { ctx.strokeStyle = '#ffd9a8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, RBASE, 18 + 34 * rk, 3 + 5 * rk, 0, Math.PI, Math.PI * 2); ctx.stroke(); });
  if (i === 0) bloom(x, RBASE, 26, 'rgba(255,200,140,0.9)');
  // value label, white, above the bar
  var lk = seg(c.since(b.line, b.f), 0.28, 0.3);
  if (lk > 0) {
    var size = last ? 46 : (i === 0 ? 28 : 34);
    // the first bar is a hairline, so its label sits a little higher with an arrow down to it
    var ly = i === 0 ? RBASE - 48 : top - 13;
    at(x, ly, lerp(0.6, 1, back(lk)), 0, function () {
      fade(clamp(lk * 3), function () { txt(b.lab, 0, 0, size, { font: 'r', color: '#ffffff', stroke: '#140c22', sw: 6 }); });
    });
    if (i === 0) fade(clamp(lk * 3), function () {
      var y0 = RBASE - 40, y1 = RBASE - 9;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = '#140c22'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.moveTo(x - 8, y1 - 9); ctx.lineTo(x, y1); ctx.lineTo(x + 8, y1 - 9); ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.moveTo(x - 8, y1 - 9); ctx.lineTo(x, y1); ctx.lineTo(x + 8, y1 - 9); ctx.stroke();
    });
  }
}

/* ---------- people ---------- */
function rPeople(c, heat, hit) {
  var t = c.t, after = c.since(3, 0.5) > 0.2;
  var jump = hit > 0 ? Math.sin(hit * Math.PI) * 14 : 0;
  bloom(160, 520, 260, 'rgba(255,140,70,0.28)', 0.5 + 0.5 * heat);
  bloom(1140, 530, 260, 'rgba(125,200,255,0.22)', 1);
  bust('dario', 156, 800 - jump, 1.0, { t: t, expr: 'surprised', look: [0.55, -0.6], turn: 0.3, rim: '#ffb070', light: 0.45 + 0.55 * heat, wind: 0.1 });
  bust('daniela', 1140, 812 - jump * 0.6, 0.96, { t: t, expr: after ? 'grin' : 'smile', look: [0.55, -0.55], turn: 0.3, flip: true, rim: '#ffb070', light: 0.45 + 0.55 * heat, wind: 0.1 });
}

defineScene({
  id: 'revenue',
  title: 'Growing Fast',
  alt: 'In a dark command room Dario and Daniela look up at a giant glowing chart of Anthropic\'s yearly revenue run-rate; orange bars shoot up from 0.1 billion dollars in January 2024 to 65 billion dollars in July 2026.',
  min: 15,
  transition: 'fade',
  lines: R_LINES,
  draw: function (c) {
    var t = c.t;
    // how many bars are up: drives the orange heat of the room
    var heat = 0; for (var i = 0; i < R_BARS.length; i++) heat += rBarK(c, i) * R_BARS[i].v; heat = clamp(heat / 65);
    var hitS = c.since(3, 0.48), hit = seg(hitS, 0, 0.55), hitOn = hitS > 0 && hitS < 0.55;
    // camera: start low on the faces, tilt up and pull back on line 1, then a slow push toward the newest bar
    var open = eio(seg(c.t, 0.15, 0.3) * 0.25 + c.lineK(0) * 0.75);
    var later = eio(seg(c.t, c.when(1, 0), 14));
    var punch = hitS > 0 ? Math.sin(seg(hitS, 0, 0.7) * Math.PI) * 0.035 : 0;
    var sh = shake(t, hitS > 0 ? (1 - seg(hitS, 0, 0.8)) * 1.2 : 0), dr = drift(t, 0.8);
    var cam = { x: lerp(640, 652, later), y: lerp(474, lerp(348, 336, later), open), z: lerp(1.1, lerp(1.0, 1.03, later), open) + punch, r: lerp(-0.012, 0, open), dx: dr[0] + sh[0], dy: dr[1] + sh[1] };

    rCam(cam, 0.0, function () { rRoom(c); });
    rCam(cam, 0.35, function () { rWindowCity(c); });
    rCam(cam, 0.55, function () { rFrame(c); rFloorGlow(c, heat); });
    rCam(cam, 0.7, function () { rSideScreens(c); });
    rCam(cam, 1, function () {
      rChart(c);
      if (hitS > 0 && hitS < 1.3) speedLines(rBarX(7), rValY(65), t, { n: 56, inner: 190, color: '#ffe2c0', a: 0.42 * (1 - seg(hitS, 0.3, 1.0)) });
    });
    // atmosphere between the chart and the people
    bokeh(15, 14, t, { colors: ['rgba(255,170,90,0.5)', 'rgba(125,249,255,0.4)'], size: 16, speed: 8, a: 0.7 });
    rCam(cam, 1.25, function () { rPeople(c, heat, hit); });
    // out-of-focus foreground motes
    bokeh(77, 5, t, { colors: ['rgba(255,150,80,0.35)', 'rgba(125,249,255,0.25)'], size: 46, speed: 5, area: [0, 380, W, 340] });
    vignette(0.5);
    if (hitOn || hitS > 0) flash(0.55 * (1 - seg(hitS, 0.03, 0.4)) * (hitS > 0 ? 1 : 0), '#fff1dc');
  }
});
