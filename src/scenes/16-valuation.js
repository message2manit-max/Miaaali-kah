/* 16-valuation: night sky over the city. A giant holographic line chart of Anthropic's
   valuation hangs across the sky; the Claude spirit flies along it as a comet, drawing the
   line, and each point pops when its number is spoken. Dario watches from a rooftop.
   Honest chart: one series, x axis proportional to time, linear y axis $0..$1T. */

var V_LINES = [
  'And what is the whole company worth?',
  'In 2023, reportedly about four billion dollars. Then 61 billion, 183, 380...',
  'And in May 2026, 965 billion. Almost a trillion dollars!'
];

// months after Jan 2023, value in $B, labels, and the narration moment that pops each point
var V_PTS = [
  { m: 4,  v: 4,    lab: '~$4B',   date: 'MAY 2023', line: 1, f: 0.31 },
  { m: 26, v: 61.5, lab: '$61.5B', date: 'MAR 2025', line: 1, f: 0.52 },
  { m: 32, v: 183,  lab: '$183B',  date: 'SEP 2025', line: 1, f: 0.68 },
  { m: 37, v: 380,  lab: '$380B',  date: 'FEB 2026', line: 1, f: 0.86 },
  { m: 40, v: 965,  lab: '$965B',  date: 'MAY 2026', line: 2, f: 0.33 }
];
var VX0 = 150, VMW = 19.5, VMONTHS = 42, VBASE = 450, VTOP = 130;   // $0 at VBASE, $1T at VTOP
var VPX = (VBASE - VTOP) / 1000;                                   // px per $1B, one linear scale
function vX(m) { return VX0 + m * VMW; }
function vY(v) { return VBASE - v * VPX; }
var V_HOME = [890, 330];   // where the spirit waits beside Dario before the flight

function vCam(cam, f, fn) {
  camera(640 + (cam.x - 640) * f + cam.dx * f, 360 + (cam.y - 360) * f + cam.dy * f, 1 + (cam.z - 1) * f, cam.r * f, fn);
}

/* ---------- comet path: waypoints, arrival and departure times ---------- */
function vTimes(c) {
  var A = [], S = [];
  for (var i = 0; i < V_PTS.length; i++) A.push(c.when(V_PTS[i].line, V_PTS[i].f));
  // leg 0: home -> P1; legs 1..4: P(i) -> P(i+1). Depart late enough to arrive on the spoken word.
  S.push(A[0] - 0.75);
  for (var j = 0; j < V_PTS.length - 1; j++) S.push(Math.max(A[j], A[j + 1] - (j === V_PTS.length - 2 ? 0.5 : 0.65)));
  return { A: A, S: S };
}
function vWay(i) { return i === 0 ? V_HOME : [vX(V_PTS[i - 1].m), vY(V_PTS[i - 1].v)]; }
// returns [x, y, leg, u] of the comet at scene time tt
function vPos(T, tt) {
  var leg = -1, u = 0;
  for (var j = 0; j < T.S.length; j++) {
    if (tt >= T.S[j]) { leg = j; u = seg(tt, T.S[j], T.A[j] - T.S[j]); }
  }
  if (leg < 0) return [V_HOME[0], V_HOME[1], -1, 0];
  var a = vWay(leg), b = vWay(leg + 1), e = leg === 0 ? eio(u) : (leg === T.S.length - 1 ? ei(u) * 0.4 + eo(u) * 0.6 : eio(u));
  if (leg === 0) { // arc across the sky on the first flight
    return [lerp(a[0], b[0], e), lerp(a[1], b[1], e) - Math.sin(e * Math.PI) * 170, leg, u];
  }
  return [lerp(a[0], b[0], e), lerp(a[1], b[1], e), leg, u];
}

/* ---------- world ---------- */
function vSky(c) {
  sky(['#04061a', '#0c1342', '#2a2466', '#6a3f7c'], 610);
  stars(61, 120, c.t, [-120, -60, W + 240, 520]);
  // faint milky band
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.translate(640, 200); ctx.rotate(-0.28);
  ctx.fillStyle = lin(0, -90, 0, 90, [[0, 'rgba(140,120,255,0)'], [0.5, 'rgba(150,130,255,0.09)'], [1, 'rgba(140,120,255,0)']]);
  ctx.fillRect(-900, -90, 1800, 180);
  ctx.restore();
}
function vSearchlights(c) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  var beams = [[260, 0.35, 1.1], [1010, -0.3, 0.8], [640, 0.12, 1.4]];
  for (var i = 0; i < beams.length; i++) {
    var b = beams[i], ang = -Math.PI / 2 + b[1] + Math.sin(c.t * 0.25 * b[2] + i * 2) * 0.22;
    var x = b[0], y = 620, len = 820, w = 0.045;
    ctx.fillStyle = lin(x, y, x + Math.cos(ang) * len, y + Math.sin(ang) * len, [[0, 'rgba(170,210,255,0.16)'], [1, 'rgba(170,210,255,0)']]);
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang - w) * len, y + Math.sin(ang - w) * len);
    ctx.lineTo(x + Math.cos(ang + w) * len, y + Math.sin(ang + w) * len); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function vCity(c) {
  glow(640, 640, 700, 'rgba(255,130,90,0.22)');
  city(612, { color: '#2b2c69', seed: 5, height: 170, bw: 52 });
  ctx.fillStyle = lin(0, 520, 0, 640, [[0, 'rgba(255,140,110,0)'], [1, 'rgba(255,140,110,0.18)']]); ctx.fillRect(-200, 520, W + 400, 120);
  city(650, { color: '#171944', lit: 'rgba(255,206,140,0.6)', seed: 13, height: 140, bw: 74, density: 0.66, rim: 'rgba(160,170,255,0.3)' });
  ctx.fillStyle = '#0b0c26'; ctx.fillRect(-200, 690, W + 400, 200);
}
function vRooftop(c) {
  // parapet and antenna in the near foreground (left)
  ctx.fillStyle = '#080817'; ctx.beginPath(); ctx.moveTo(-200, 668); ctx.lineTo(560, 690); ctx.lineTo(560, 900); ctx.lineTo(-200, 900); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(125,249,255,0.35)'; ctx.beginPath(); ctx.moveTo(-200, 668); ctx.lineTo(560, 690); ctx.lineTo(560, 693); ctx.lineTo(-200, 671); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#080817'; ctx.fillRect(66, 560, 5, 120); ctx.fillRect(60, 640, 17, 40);
  var blink = pulse(c.t, 0.8) > 0.6 ? 1 : 0.25;
  ctx.fillStyle = 'rgba(255,80,90,' + blink + ')'; ctx.beginPath(); ctx.arc(69, 556, 4, 0, Math.PI * 2); ctx.fill();
  bloom(69, 556, 24, 'rgba(255,80,90,0.6)', blink);
}
// small far-off fireworks that keep the hold alive (behind the chart)
function vFireworks(c, on) {
  if (!(on > 0)) return;
  var spots = [[1190, 230, 0], [700, 92, 1.3], [1060, 470, 2.1]];
  for (var s = 0; s < spots.length; s++) {
    var p = ((c.t + spots[s][2]) % 2.9) / 2.9;
    if (p > 0.7) continue;
    var k = p / 0.7, r = 64 * eo(k), a = (1 - k) * 0.6 * on;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= a;
    ctx.fillStyle = s === 1 ? '#ffd27a' : (s === 0 ? '#ff9a5c' : '#9fe8ff');
    for (var i = 0; i < 16; i++) {
      var ang = i / 16 * Math.PI * 2 + s;
      ctx.beginPath(); ctx.arc(spots[s][0] + Math.cos(ang) * r, spots[s][1] + Math.sin(ang) * r + k * 14, 2.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

/* ---------- the chart ---------- */
function vChart(c, T, comet, k1T) {
  var t = c.t, build = clamp(0.3 + c.t / 1.1);
  // soft dark wash behind the plot so the hologram reads against the sky
  ctx.fillStyle = rad(610, 300, 60, 640, [[0, 'rgba(6,10,34,0.62)'], [1, 'rgba(6,10,34,0)']]);
  ctx.fillRect(-100, -60, 1400, 700);
  // corner brackets of the sky hologram
  ctx.strokeStyle = 'rgba(125,249,255,0.6)'; ctx.lineWidth = 3;
  var bx0 = VX0 - 104, bx1 = vX(VMONTHS) + 14, by0 = 30, by1 = VBASE + 62;
  ctx.beginPath();
  ctx.moveTo(bx0, by0 + 24); ctx.lineTo(bx0, by0); ctx.lineTo(bx0 + 24, by0);
  ctx.moveTo(bx1 - 24, by0); ctx.lineTo(bx1, by0); ctx.lineTo(bx1, by0 + 24);
  ctx.moveTo(bx0, by1 - 24); ctx.lineTo(bx0, by1); ctx.lineTo(bx0 + 24, by1);
  ctx.stroke();
  // title
  var ty = clamp(0.2 + c.lineK(0) * 1.5);
  typeOn('VALUATION · US DOLLARS', VX0 - 90, 54, 18, ty, { font: 'r', color: '#bcd0ee', align: 'left', ls: 3 });
  typeOn('COMPANY VALUE', VX0 - 92, 95, 38, ty, { color: '#ffffff', align: 'left', stroke: '#0a1030', sw: 6 });
  // gridlines + labels (left), the $1T line brightens on "almost a trillion"
  var tril = seg(c.since(2, 0.66), 0, 0.6);
  var grid = [0, 250, 500, 750, 1000], names = ['$0', '$250B', '$500B', '$750B', '$1T'];
  for (var g = 0; g < grid.length; g++) {
    var gy = vY(grid[g]), main = g === 0, top = g === grid.length - 1;
    var a = main ? 0.85 : (top ? lerp(0.24, 0.75, tril) : 0.24);
    ctx.fillStyle = 'rgba(200,225,255,' + a + ')';
    ctx.fillRect(VX0 - 6, gy - (main ? 1.5 : 0.75), (vX(VMONTHS) - VX0 + 6) * build, main ? 3 : 1.5);
    txt(names[g], VX0 - 14, gy + 9, 24, { font: 'r', color: top && tril > 0 ? mix('#dfe8ff', '#ffffff', tril) : '#dfe8ff', align: 'right' });
  }
  // year ticks, proportional to time (revealed by the scan sweep)
  var sweepX = VX0 - 6 + (vX(VMONTHS) - VX0 + 6) * build;
  for (var y = 0; y < 4; y++) {
    var yx = vX(y * 12);
    fade(clamp((sweepX - yx) / 60 + 0.05), function () {
      ctx.fillStyle = 'rgba(220,235,255,0.85)'; ctx.fillRect(yx - 1, VBASE, 2, 10);
      txt(String(2023 + y), yx, VBASE + 38, 25, { font: 'r', color: '#ffffff' });
    });
  }
  // bright scan head while the hologram grid is being drawn
  if (build < 1) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = lin(sweepX - 40, 0, sweepX + 4, 0, [[0, 'rgba(125,249,255,0)'], [1, 'rgba(125,249,255,0.55)']]);
    ctx.fillRect(sweepX - 40, VTOP - 20, 44, VBASE - VTOP + 30);
    ctx.fillStyle = 'rgba(220,255,255,0.9)'; ctx.fillRect(sweepX, VTOP - 20, 2, VBASE - VTOP + 30);
    ctx.restore();
  }
  // the drawn line (up to the comet) with a soft area glow under it
  var pts = [];
  if (comet[2] >= 1) {
    for (var i = 0; i < comet[2]; i++) pts.push([vX(V_PTS[i].m), vY(V_PTS[i].v)]);
    pts.push([comet[0], comet[1]]);
  }
  if (pts.length > 1) {
    ctx.save();
    ctx.beginPath(); ctx.moveTo(pts[0][0], VBASE);
    for (var p = 0; p < pts.length; p++) ctx.lineTo(pts[p][0], pts[p][1]);
    ctx.lineTo(pts[pts.length - 1][0], VBASE); ctx.closePath();
    ctx.fillStyle = lin(0, VTOP, 0, VBASE, [[0, 'rgba(255,138,61,0.32)'], [1, 'rgba(255,138,61,0.04)']]); ctx.fill();
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath(); for (var q = 0; q < pts.length; q++) { if (q) ctx.lineTo(pts[q][0], pts[q][1]); else ctx.moveTo(pts[q][0], pts[q][1]); }
    ctx.strokeStyle = 'rgba(255,138,61,0.35)'; ctx.lineWidth = 16; ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = P.claude; ctx.lineWidth = 5; ctx.stroke();
    ctx.strokeStyle = '#ffe3c0'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.restore();
  }
  // once complete, a pulse of light keeps running up the line (living hold)
  if (comet[2] === 4 && comet[3] >= 1) {
    var ph = ((c.t - T.A[4]) % 3.2) / 3.2, segs = V_PTS.length - 1, sp = ph * segs, si = Math.min(segs - 1, Math.floor(sp)), su = sp - si;
    var ax = vX(V_PTS[si].m), ay = vY(V_PTS[si].v), bxx = vX(V_PTS[si + 1].m), byy = vY(V_PTS[si + 1].v);
    bloom(lerp(ax, bxx, su), lerp(ay, byy, su), 26, 'rgba(255,236,200,0.9)', Math.sin(ph * Math.PI));
  }
  // point marks (labels are drawn later, above the burst)
  for (var n = 0; n < V_PTS.length; n++) vPoint(c, T, n);
}
function vLabels(c, T) { for (var n = 0; n < V_PTS.length; n++) vLabel(c, T, n); }
function vPoint(c, T, n) {
  var d = V_PTS[n], since = c.t - T.A[n];
  if (!(since >= 0)) return;
  var x = vX(d.m), y = vY(d.v), k = back(seg(since, 0, 0.35)), last = n === V_PTS.length - 1;
  bloom(x, y, last ? 60 : 34, 'rgba(255,170,100,0.8)', 0.7 + 0.3 * pulse(c.t + n, 0.7));
  at(x, y, k, 0, function () {
    ctx.fillStyle = P.claude; ctx.beginPath(); ctx.arc(0, 0, last ? 12 : 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, last ? 6 : 4.5, 0, Math.PI * 2); ctx.fill();
  });
  var rk = seg(since, 0, 0.6);
  if (rk < 1) fade(1 - rk, function () { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 10 + 40 * rk, 0, Math.PI * 2); ctx.stroke(); });
}
function vLabel(c, T, n) {
  var d = V_PTS[n], since = c.t - T.A[n];
  if (!(since >= 0)) return;
  var x = vX(d.m), y = vY(d.v), last = n === V_PTS.length - 1;
  var lk = seg(since, 0.08, 0.3);
  if (!(lk > 0)) return;
  // value label (white) with a small date line above it
  var size = last ? 50 : 36, lx, ly, al;
  if (n === 0) { lx = x; ly = y - 20; al = 'center'; }
  else { lx = x - (last ? 22 : (n === 1 ? 30 : 16)); ly = y - (last ? -14 : 14); al = 'right'; }
  fade(clamp(lk * 2.5), function () {
    at(lx, ly, lerp(0.7, 1, back(lk)), 0, function () {
      txt(d.lab, 0, 0, size, { font: 'r', color: '#ffffff', stroke: '#120a24', sw: 6, align: al });
      txt(d.date, al === 'right' ? -2 : 0, -size * 0.9, 19, { font: 'r', color: '#c8d4ee', stroke: '#120a24', sw: 5, align: al, ls: 1 });
    });
  });
}
// comet trail behind the spirit while it flies
function vTrail(c, T) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var i = 8; i >= 1; i--) {
    var p = vPos(T, c.t - i * 0.035), q = vPos(T, c.t);
    var dist = Math.hypot(p[0] - q[0], p[1] - q[1]);
    if (dist < 3) continue;
    var a = (1 - i / 9) * 0.55, r = 22 * (1 - i / 10);
    ctx.fillStyle = rad(p[0], p[1], 0, r, [[0, 'rgba(255,220,170,' + a + ')'], [1, 'rgba(255,140,60,0)']]);
    ctx.fillRect(p[0] - r, p[1] - r, r * 2, r * 2);
  }
  ctx.restore();
}

defineScene({
  id: 'valuation',
  title: 'Almost a Trillion',
  alt: 'A giant glowing line chart across the night sky: Anthropic\'s value climbs from about 4 billion dollars in May 2023 to 965 billion dollars in May 2026, drawn by the Claude spirit flying like a comet while Dario watches from a rooftop.',
  min: 12,
  transition: 'fade',
  lines: V_LINES,
  draw: function (c) {
    var t = c.t, T = vTimes(c), comet = vPos(T, t);
    var burstS = t - T.A[4], burst = burstS >= 0;
    var slamK = seg(c.since(2, 0.66), 0, 0.5);
    // camera: start low on Dario looking up, tilt up to the sky chart, follow the comet, punch at the burst
    var open = eio(seg(t, 0.1, 0.4) * 0.2 + c.lineK(0) * 0.8);
    var follow = eio(seg(t, c.when(1, 0), 6));
    var punch = burst ? Math.sin(seg(burstS, 0, 0.8) * Math.PI) * 0.04 : 0;
    var sh = shake(t, burst ? (1 - seg(burstS, 0, 0.9)) * 1.3 : 0), sh2 = shake(t + 3, slamK > 0 && slamK < 1 ? (1 - slamK) * 0.6 : 0), dr = drift(t, 0.9);
    var cam = {
      x: lerp(900, lerp(612, 636, follow), open), y: lerp(470, 330, open),
      z: lerp(1.16, lerp(1.0, 1.02, follow), open) + punch, r: lerp(0.03, 0, open),
      dx: dr[0] + sh[0] + sh2[0], dy: dr[1] + sh[1] + sh2[1]
    };
    vCam(cam, 0.25, function () { vSky(c); });
    vCam(cam, 0.45, function () { vSearchlights(c); vFireworks(c, burst ? clamp(burstS / 1.5) : 0); });
    vCam(cam, 0.6, function () { vCity(c); });
    vCam(cam, 1, function () {
      vChart(c, T, comet);
      if (comet[2] === 4 && comet[3] > 0 && comet[3] < 1) speedLines(vX(40), vY(965), t, { n: 50, inner: 170, color: '#ffe2c0', a: 0.28 });
      // the big burst at $965B
      if (burst && burstS < 1.6) {
        var bk = burstS / 1.6, bx = vX(40), by = vY(965);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (var i = 0; i < 30; i++) {
          var ang = i / 30 * Math.PI * 2 + hash(4, i) * 0.2, sp = 150 + hash(5, i) * 140, r = sp * eo(bk);
          ctx.save(); ctx.globalAlpha *= (1 - bk);
          ctx.strokeStyle = i % 3 ? '#ffc27a' : '#ffffff'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(bx + Math.cos(ang) * r * 0.7, by + Math.sin(ang) * r * 0.7 + bk * 20);
          ctx.lineTo(bx + Math.cos(ang) * r, by + Math.sin(ang) * r + bk * 26); ctx.stroke(); ctx.restore();
        }
        ctx.restore();
        bloom(bx, by, 260 * (1 - bk * 0.5), 'rgba(255,200,140,0.8)', 1 - bk);
      }
      vLabels(c, T);
      // the comet's hot pen tip draws the line; the spirit rides just below-right of it so labels stay clear
      if (comet[2] >= 1 && !burst) { bloom(comet[0], comet[1], 30, 'rgba(255,230,190,0.9)'); ctx.fillStyle = '#fff6e6'; ctx.beginPath(); ctx.arc(comet[0], comet[1], 4, 0, Math.PI * 2); ctx.fill(); }
      vTrail(c, T);
      var ride = comet[2] >= 0 ? eio(clamp(comet[2] + comet[3])) : 0;
      var sx = comet[0] + 30 * ride, sy = comet[1] + 30 * ride;
      if (burst) { var off = eio(seg(burstS, 0.3, 0.9)); sx += 34 * off; sy -= 54 * off; }
      var mood = burst ? (burstS < 2.2 ? 'wow' : 'proud') : (comet[2] >= 0 && comet[3] < 1 ? 'determined' : 'happy');
      spirit(sx, sy, burst ? 0.5 : 0.42, { t: t, mood: mood, glow: burst ? 1 : 0.7, power: burst ? 0.6 * (1 - seg(burstS, 1, 2)) + 0.25 : 0, look: [0.3, -0.2] });
    });
    vCam(cam, 1.2, function () {
      vRooftop(c);
      var heat = burst ? 1 : 0.5;
      bloom(1115, 440, 300, 'rgba(255,150,80,0.3)', heat);
      bust('dario', 1115, 836, 1.12, {
        t: t, flip: true, look: [0.45, -0.8], turn: 0.35, wind: 0.5,
        expr: burst ? (burstS < 2 ? 'surprised' : 'smile') : (c.since(1, 0.5) > 0 ? 'surprised' : 'calm'),
        rim: '#ffb070', light: 0.5 + 0.5 * heat
      });
    });
    // the slam lives in the empty upper-left sky (HUD, outside the camera)
    if (slamK > 0) {
      bloom(440, 260, 320, 'rgba(255,138,61,0.35)', clamp(slamK * 2));
      slam('ALMOST', 432, 212, 38, slamK, { color: '#ffffff', ls: 6 });
      slam('$1 TRILLION', 440, 286, 66, seg(c.since(2, 0.7), 0, 0.5), { color: '#ffffff', sw: 11 });
    }
    bokeh(26, 12, t, { colors: ['rgba(255,170,100,0.45)', 'rgba(150,200,255,0.35)'], size: 14, speed: 10, a: 0.8 });
    vignette(0.5);
    if (burst) flash(0.5 * (1 - seg(burstS, 0.02, 0.4)), '#fff1dc');
  }
});
