/* 17-today: Earth from orbit at night, laced with glowing connection arcs, with two stat
   plates; then a zoom-flash into golden hour, where the seven founders stand together with
   the Claude spirit above them. */

var T_LINES = [
  'Today, more than 300,000 businesses use me, and Anthropic is getting ready to go public.',
  'From seven friends in a park to one of the biggest AI companies on Earth.'
];

/* ---------- globe ---------- */
var TG = { cx: 760, cy: 905, r: 660, tilt: 0.36 };
// city-light clusters: lat, lon, spread (deg), count
var T_CLUSTERS = [
  [40, -75, 6, 34], [34, -118, 5, 22], [42, -88, 6, 22], [30, -96, 6, 16], [47, -122, 3, 10], [45, -73, 4, 10],
  [51, 0, 6, 30], [48, 10, 7, 32], [41, 13, 5, 16], [40, -4, 5, 14], [55, 37, 5, 12], [60, 18, 5, 8],
  [28, 77, 6, 22], [19, 73, 4, 12], [13, 78, 4, 10], [31, 121, 6, 26], [39, 116, 5, 18], [23, 113, 4, 18],
  [36, 139, 4, 20], [37, 127, 3, 12], [1, 104, 3, 8], [25, 55, 3, 8], [30, 31, 4, 8], [-23, -46, 5, 12],
  [19, -99, 4, 10], [6, 3, 4, 8], [-34, 151, 3, 8], [-26, 28, 4, 6], [64, -20, 2, 3], [53, -113, 5, 6]
];
var T_DOTS = (function () {
  var out = [];
  for (var i = 0; i < T_CLUSTERS.length; i++) {
    var k = T_CLUSTERS[i];
    for (var j = 0; j < k[3]; j++) {
      var a = hash(i * 7 + 1, j) * Math.PI * 2, d = Math.pow(hash(i * 7 + 2, j), 0.7) * k[2];
      out.push([(k[0] + Math.sin(a) * d * 0.7) * Math.PI / 180, (k[1] + Math.cos(a) * d) * Math.PI / 180, 0.6 + hash(i * 7 + 3, j) * 1.4]);
    }
  }
  return out;
})();
// arcs between cluster centres on the side of the planet that faces us
var T_ARCS = (function () {
  var vis = [];
  for (var i = 0; i < T_CLUSTERS.length; i++) if (T_CLUSTERS[i][1] > -25 && T_CLUSTERS[i][1] < 145 && T_CLUSTERS[i][0] > 0) vis.push(i);
  var out = [];
  for (var k = 0; k < 64; k++) {
    var a = vis[Math.floor(hash(91, k) * vis.length)], b = vis[Math.floor(hash(92, k) * vis.length)];
    if (a === b) b = vis[(vis.indexOf(b) + 3) % vis.length];
    out.push([a, b, hash(93, k) * 3, 2.0 + hash(94, k) * 1.8]);
  }
  return out;
})();
function tVec(lat, lon) { return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)]; }
// rotate (spin around the pole, then tilt toward the viewer) and project; returns [X, Y, z]
function tProj(v, rot, lift) {
  var cr = Math.cos(rot), sr = Math.sin(rot);
  var x = v[0] * cr + v[2] * sr, y = v[1], z = -v[0] * sr + v[2] * cr;
  var ct = Math.cos(TG.tilt), st = Math.sin(TG.tilt);
  var y2 = y * ct - z * st, z2 = y * st + z * ct, R = TG.r * (lift || 1);
  return [TG.cx + x * R, TG.cy - y2 * R, z2];
}
function tGlobe(c, rot, linkK) {
  var t = c.t, cx = TG.cx, cy = TG.cy, r = TG.r;
  // atmosphere halo
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rad(cx, cy, r * 0.96, r * 1.16, [[0, 'rgba(90,170,255,0.55)'], [0.35, 'rgba(70,130,255,0.22)'], [1, 'rgba(40,60,200,0)']]);
  ctx.beginPath(); ctx.arc(cx, cy, r * 1.16, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // night-side disc
  ctx.fillStyle = rad(cx - r * 0.2, cy - r * 0.5, r * 0.1, r * 1.05, [[0, '#14244f'], [0.6, '#0a1430'], [1, '#050a1c']]);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  // sunrise crescent on the upper-right limb
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = rad(cx + r * 0.55, cy - r * 0.95, 10, r * 0.7, [[0, 'rgba(255,190,120,0.55)'], [0.5, 'rgba(255,120,90,0.15)'], [1, 'rgba(255,120,90,0)']]);
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  // faint latitude lines (holographic feel)
  ctx.strokeStyle = 'rgba(120,180,255,0.08)'; ctx.lineWidth = 1.2;
  for (var la = -60; la <= 75; la += 15) {
    ctx.beginPath(); var first = true;
    for (var lo = -180; lo <= 180; lo += 12) {
      var p = tProj(tVec(la * Math.PI / 180, lo * Math.PI / 180), rot);
      if (p[2] < 0) { first = true; continue; }
      if (first) { ctx.moveTo(p[0], p[1]); first = false; } else ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();
  }
  ctx.restore();
  // rim line
  ctx.strokeStyle = 'rgba(150,210,255,0.8)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,200,140,0.95)'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 1.55, Math.PI * 1.85); ctx.stroke();
  // city lights
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var i = 0; i < T_DOTS.length; i++) {
    var d = T_DOTS[i], q = tProj(tVec(d[0], d[1]), rot);
    if (q[2] < 0.04 || q[1] > H + 10) continue;
    var tw = 0.65 + 0.35 * Math.sin(t * 2 + i);
    ctx.fillStyle = i % 5 ? 'rgba(255,205,130,' + (0.75 * tw * Math.min(1, q[2] * 3)) + ')' : 'rgba(255,240,210,' + (0.9 * Math.min(1, q[2] * 3)) + ')';
    var s = d[2] * (1.0 + q[2] * 0.9);
    ctx.fillRect(q[0] - s, q[1] - s * 0.6, s * 2, s * 1.2);
  }
  for (var g = 0; g < T_CLUSTERS.length; g++) {
    var cl = T_CLUSTERS[g], cq = tProj(tVec(cl[0] * Math.PI / 180, cl[1] * Math.PI / 180), rot);
    if (cq[2] < 0.05 || cq[1] > H + 40) continue;
    var gr = (16 + cl[3] * 1.6) * (0.5 + cq[2] * 0.6);
    ctx.fillStyle = rad(cq[0], cq[1], 0, gr, [[0, 'rgba(255,180,100,' + (0.35 * cq[2]) + ')'], [1, 'rgba(255,150,80,0)']]);
    ctx.fillRect(cq[0] - gr, cq[1] - gr, gr * 2, gr * 2);
  }
  ctx.restore();
  // connection arcs
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (var a = 0; a < T_ARCS.length; a++) {
    var A = T_ARCS[a], ca = T_CLUSTERS[A[0]], cb = T_CLUSTERS[A[1]];
    var va = tVec(ca[0] * Math.PI / 180, ca[1] * Math.PI / 180), vb = tVec(cb[0] * Math.PI / 180, cb[1] * Math.PI / 180);
    var pts = [], N = 16, dAng = Math.acos(clamp(va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2], -1, 1));
    for (var n = 0; n <= N; n++) {
      var u = n / N, vx = lerp(va[0], vb[0], u), vy = lerp(va[1], vb[1], u), vz = lerp(va[2], vb[2], u), L = Math.hypot(vx, vy, vz) || 1;
      pts.push(tProj([vx / L, vy / L, vz / L], rot, 1 + Math.min(0.26, 0.05 + 0.18 * dAng) * Math.sin(u * Math.PI)));
    }
    var ph = ((t + A[2]) % A[3]) / A[3], col = a % 3 === 0 ? '125,249,255' : '255,160,90';
    tArcPath(pts, 0, N); ctx.strokeStyle = 'rgba(' + col + ',' + (0.2 * linkK) + ')'; ctx.lineWidth = 1.5; ctx.stroke();
    // travelling pulse
    var head = Math.floor(ph * 1.5 * N), tail = Math.max(0, head - 5);
    if (head <= N + 5 && head > 0) {
      tArcPath(pts, tail, Math.min(N, head)); ctx.strokeStyle = 'rgba(' + col + ',' + (0.9 * linkK) + ')'; ctx.lineWidth = 2.6; ctx.stroke();
      if (head <= N && pts[head][2] > 0) { ctx.fillStyle = 'rgba(255,255,255,' + (0.95 * linkK) + ')'; ctx.fillRect(pts[head][0] - 2.5, pts[head][1] - 2.5, 5, 5); }
    }
  }
  ctx.restore();
}
// path through the visible (front-facing) part of an arc only
function tArcPath(pts, i0, i1) {
  ctx.beginPath(); var pen = false;
  for (var i = i0; i <= i1; i++) {
    if (pts[i][2] < 0) { pen = false; continue; }
    if (pen) ctx.lineTo(pts[i][0], pts[i][1]); else { ctx.moveTo(pts[i][0], pts[i][1]); pen = true; }
  }
}
function tSpace(c) {
  sky('space');
  stars(171, 160, c.t, [-100, -100, W + 200, H + 100]);
  glow(260, 140, 420, 'rgba(120,80,220,0.18)');
  glow(1150, 330, 380, 'rgba(255,140,90,0.14)');
}
// stat plate with a slanted orange accent, slides in from the left
function tPlate(x, y, w, h, k, fn) {
  if (!(k > 0)) return;
  var e = eo(k);
  ctx.save(); ctx.translate((1 - e) * -620, 0); ctx.globalAlpha *= clamp(k * 2);
  ctx.fillStyle = 'rgba(7,10,32,0.82)';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - 26, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(125,249,255,0.55)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = P.claude; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 14, y); ctx.lineTo(x + 14, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
  fn();
  ctx.restore();
}

/* ---------- golden-hour group shot ---------- */
var T_GROUP = [ // who, x, feet y, scale, arms, expr
  ['chris', 172, 676, 1.06, 'down', 'smile'], ['jack', 1108, 676, 1.06, 'down', 'smile'],
  ['sam', 322, 690, 1.12, 'hips', 'smile'], ['tom', 958, 690, 1.12, 'crossed', 'calm'],
  ['daniela', 477, 704, 1.22, 'crossed', 'determined'], ['jared', 803, 704, 1.22, 'down', 'smile'],
  ['dario', 640, 716, 1.3, 'hips', 'determined']
];
function tGolden(c, k2) {
  var t = c.t;
  sky(['#3b4f8f', '#c98aa0', '#ffc27e', '#ffe6b8'], 560);
  sun(640, 470, 46);
  rays(640, 470, 18, 900, Math.PI * 2, 'rgba(255,230,180,0.7)', 0.14 + 0.12 * k2, t, -Math.PI / 2);
  cloudRow(150, 12, t, 'golden', 0.9, 3);
  // far hazy city (the company grew up here)
  city(560, { color: '#c69a9e', seed: 33, height: 150, bw: 46 });
  ctx.fillStyle = 'rgba(255,214,170,0.35)'; ctx.fillRect(-200, 470, W + 400, 100);
  city(578, { color: '#8f6e86', seed: 34, height: 110, bw: 60, lit: 'rgba(255,236,190,0.6)', density: 0.75 });
  // park hill
  ctx.fillStyle = lin(0, 560, 0, 760, [[0, '#7da35a'], [0.35, '#4e7a45'], [1, '#2c4a35']]);
  ctx.beginPath(); ctx.moveTo(-200, 600); ctx.quadraticCurveTo(640, 548, 1480, 600); ctx.lineTo(1480, 900); ctx.lineTo(-200, 900); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,226,160,0.55)'; ctx.beginPath(); ctx.moveTo(-200, 600); ctx.quadraticCurveTo(640, 548, 1480, 600); ctx.lineTo(1480, 606); ctx.quadraticCurveTo(640, 554, -200, 606); ctx.closePath(); ctx.fill();
  // framing trees (cel-shaded canopies)
  tTree(-30, 600, 1.25, t, 1); tTree(1320, 610, 1.35, t, 2);
}
function tTree(x, y, s, t, seed) {
  at(x, y, s, 0, function () {
    var sw = Math.sin(t * 0.8 + seed) * 4;
    ctx.fillStyle = '#2a2230'; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.quadraticCurveTo(-6, -150, -14, -300); ctx.lineTo(10, -300); ctx.quadraticCurveTo(4, -150, 18, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#2a2230'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-4, -200); ctx.quadraticCurveTo(60, -250, 120 + sw, -300); ctx.moveTo(-6, -240); ctx.quadraticCurveTo(-60, -290, -110 + sw, -330); ctx.stroke();
    // leaf clumps: many small lobes so the edge reads as foliage, not balloons
    var clumps = [[0, -330, 1.25], [-100, -300, 0.95], [110, -290, 1.0], [-40, -430, 0.95], [70, -420, 0.9], [150, -360, 0.7], [-150, -380, 0.7], [10, -240, 0.8]];
    function leaves(dx, dy, kk) {
      for (var i = 0; i < clumps.length; i++) {
        var cx0 = clumps[i][0] + sw * (1 + i * 0.1) + dx, cy0 = clumps[i][1] + dy, cs = clumps[i][2] * kk;
        for (var j = 0; j < 9; j++) {
          var a = j / 9 * Math.PI * 2 + i, rr = 58 * cs, lr = (26 + 10 * hash(seed + i, j)) * cs;
          ctx.moveTo(cx0 + Math.cos(a) * rr + lr, cy0 + Math.sin(a) * rr * 0.8);
          ctx.arc(cx0 + Math.cos(a) * rr, cy0 + Math.sin(a) * rr * 0.8, lr, 0, Math.PI * 2);
        }
        ctx.moveTo(cx0 + 60 * cs, cy0); ctx.arc(cx0, cy0, 60 * cs, 0, Math.PI * 2);
      }
    }
    ctx.fillStyle = '#ffd59a'; ctx.beginPath(); leaves(8, -6, 1); ctx.fill();          // warm rim (sun side)
    ctx.fillStyle = '#2d4a3c'; ctx.beginPath(); leaves(0, 0, 1); ctx.fill();           // backlit body
    ctx.fillStyle = '#3e6a48'; ctx.beginPath(); leaves(10, -16, 0.62); ctx.fill();     // lit inner layer
  }, seed === 2);
}
function tFounders(c, k2) {
  var t = c.t;
  for (var i = 0; i < T_GROUP.length; i++) {
    var g = T_GROUP[i];
    fillWith(function () { ctx.ellipse(g[1], g[2] + 2, 70 * g[3], 12 * g[3], 0, 0, Math.PI * 2); }, 'rgba(30,50,30,0.35)');
    person(g[0], g[1], g[2], g[3], { t: t + i * 0.7, arms: g[4], expr: g[5], look: [0, -0.05], turn: g[1] === 640 ? 0 : 0.18, wind: 0.35, rim: '#ffe0a8', light: 0.9, flip: g[1] > 640 });
  }
}

defineScene({
  id: 'today',
  title: 'Today',
  alt: 'Earth seen from orbit at night, laced with glowing connection lines, with the stats 300,000+ businesses and getting ready to go public; then the seven founders stand together in golden light with the Claude spirit above them.',
  min: 9,
  transition: 'fade',
  lines: T_LINES,
  draw: function (c) {
    var t = c.t;
    var s2 = c.since(1, 0), cut = s2 >= 0.42;          // the zoom-flash cut into golden hour
    var dive = s2 > 0 ? ei(seg(s2, 0, 0.42)) : 0;
    if (!cut) {
      // ---- orbit shot ----
      var push = eio(seg(t, 0, 7)), dr = drift(t, 0.6);
      var z = lerp(1.0, 1.06, push) + dive * 1.6;
      camera(lerp(760, 800, push) + dr[0] + dive * 60, lerp(392, 380, push) + dr[1] + dive * -110, 1, 0, function () { tSpace(c); });
      camera(lerp(760, 800, push) + dr[0] + dive * 60, lerp(392, 380, push) + dr[1] + dive * -110, z, lerp(-0.03, -0.01, push), function () {
        tGlobe(c, -0.8 + t * 0.02, clamp(0.55 + t / 2));
        var sp = [790, 168];
        // the spirit hovers above the limb with light threads to the cities below
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (var i = 0; i < 6; i++) {
          var d = T_DOTS[(i * 61 + 7) % T_DOTS.length], q = tProj(tVec(d[0], d[1]), -0.8 + t * 0.02);
          if (q[2] < 0.1) continue;
          ctx.strokeStyle = 'rgba(255,170,100,' + (0.18 + 0.12 * Math.sin(t * 2 + i)) + ')'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(sp[0], sp[1]); ctx.quadraticCurveTo((sp[0] + q[0]) / 2, sp[1] + 10, q[0], q[1]); ctx.stroke();
        }
        ctx.restore();
        spirit(sp[0], sp[1], 0.5, { t: t, mood: 'happy', glow: 0.8 });
      });
      if (s2 > 0) speedLines(W / 2, H / 2, t, { n: 70, inner: 140, color: '#ffffff', a: 0.6 * dive });
      // stat plates (HUD)
      var out = 1 - dive;
      fade(out, function () {
        var k1 = seg(c.since(0, 0.16), 0, 0.55), cnt = eo(seg(c.since(0, 0.16), 0.1, 1.0));
        tPlate(60, 128, 520, 156, k1, function () {
          var n = Math.round(300000 * cnt / 1000) * 1000;
          var s = n >= 1000 ? Math.floor(n / 1000) + ',' + ('00' + (n % 1000)).slice(-3) : String(n);
          txt(s + (cnt >= 1 ? '+' : ''), 98, 214, 74, { color: '#ffffff', align: 'left', stroke: P.ink, sw: 8 });
          txt('BUSINESSES', 100, 262, 28, { font: 'r', color: '#dfe8ff', align: 'left', ls: 6 });
        });
        var k2 = seg(c.since(0, 0.7), 0, 0.55);
        tPlate(60, 306, 560, 122, k2, function () {
          txt('GETTING READY', 98, 358, 38, { color: '#ffffff', align: 'left', stroke: P.ink, sw: 6 });
          txt('TO GO PUBLIC', 98, 406, 38, { color: '#ffffff', align: 'left', stroke: P.ink, sw: 6 });
          // small rising-arrow icon
          ctx.strokeStyle = P.claude; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(470, 404); ctx.lineTo(498, 374); ctx.lineTo(516, 388); ctx.lineTo(548, 350); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(528, 349); ctx.lineTo(550, 348); ctx.lineTo(549, 370); ctx.stroke();
        });
      });
      vignette(0.55);
    } else {
      // ---- golden-hour group shot ----
      var u = s2 - 0.42, k2 = seg(c.since(1, 0.55), 0, 1.2);
      var pz = eio(seg(u, 0, 8)), dr2 = drift(t, 0.7), land = 1 - eo(seg(u, 0, 0.9));
      var cx = 640 + dr2[0], cy = lerp(392, 372, pz) + dr2[1];
      camera(cx, cy, lerp(1.0, 1.05, pz) + land * 0.12, -0.012 * land, function () { tGolden(c, k2); lensFlare(640, 470, 0.35 + 0.35 * k2, 0.5); });
      camera(cx, cy, lerp(1.0, 1.065, pz) + land * 0.16, -0.012 * land, function () {
        tFounders(c, k2);
      });
      // the spirit above them (screen space so it never crowds the year badge)
      spirit(640, lerp(130, 88, eo(seg(u, 0, 1.2))), 0.5, { t: t, mood: k2 > 0 ? 'proud' : 'happy', glow: 0.6 + 0.4 * k2, power: 0.35 * k2 });
      petals(52, 18, t, { color: 'rgba(255,214,150,0.85)', wind: 50 });
      sparkles(9, 8, t, [100, 120, W - 200, 260], '#fff2d0');
      bokeh(31, 10, t, { colors: ['rgba(255,220,160,0.55)', 'rgba(255,190,120,0.45)'], size: 22, speed: 6, a: 0.8 });
      vignette(0.35, 'rgba(60,30,20,1)');
    }
    c.yr('2026');
    // flash bridging the cut
    if (s2 > 0) flash(seg(s2, 0.18, 0.24) * (1 - seg(s2, 0.42, 0.55)), '#fff4dc');
  }
});
