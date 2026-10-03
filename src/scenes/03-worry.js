/* 03-worry: a storm over the city at night. Line 1: a colossal abstract AI presence (a towering
   lattice of glowing nodes around one great core) rises behind the skyline. Line 2: cut to Dario on
   a rooftop in the wind, low angle, dutch tilt, rim-lit by the glow; "IS IT SAFE?" trembles. */

var W_SKY = ['#07071a', '#15142f', '#2a2547', '#40365e'];

// Deterministic lightning strike times (scene seconds) after the scripted ones.
function wStrikes(t, list) {
  var k0 = Math.max(0, Math.floor((t - 6) / 3.4) - 1);
  for (var k = k0; k <= k0 + 2; k++) list.push([6 + k * 3.4 + hash(k, 5) * 1.6, k + 100]);
  return list;
}
// Flash level 0..1 for a strike that happened `dt` seconds ago (double flicker).
function wFlick(dt) {
  if (!(dt >= 0) || dt > 0.6) return 0;
  return Math.max(1 - seg(dt, 0, 0.12), 0.75 * (1 - seg(dt, 0.16, 0.4)) * (dt > 0.14 ? 1 : 0));
}
// Jagged lightning bolt with a branch.
function wBolt(x0, y0, len, seed, a) {
  if (!(a > 0)) return;
  var pts = [[x0, y0]], x = x0, y = y0;
  for (var i = 0; i < 11; i++) { x += (hash(seed, i) - 0.5) * 70; y += len / 11; pts.push([x, y]); }
  var br = [pts[4]], bx = pts[4][0], by = pts[4][1];
  for (var j = 0; j < 5; j++) { bx += 18 + hash(seed + 3, j) * 30; by += len / 16; br.push([bx, by]); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= a; ctx.lineJoin = 'miter'; ctx.lineCap = 'round';
  var stroke = function (p, w, col) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (var q = 1; q < p.length; q++) ctx.lineTo(p[q][0], p[q][1]); ctx.stroke(); };
  stroke(pts, 16, 'rgba(170,150,255,0.25)'); stroke(br, 10, 'rgba(170,150,255,0.2)');
  stroke(pts, 4, '#f4f0ff'); stroke(br, 2.4, '#e8e2ff');
  ctx.restore();
}
// Thin rain streaks, batched into one path.
function wRain(t, n, a, ang) {
  var dx = Math.sin(ang), dy = Math.cos(ang);
  ctx.save(); ctx.strokeStyle = 'rgba(190,200,255,' + a + ')'; ctx.lineWidth = 1.4; ctx.beginPath();
  for (var i = 0; i < n; i++) {
    var sp = 900 + hash(i, 1) * 500, L = 26 + hash(i, 2) * 30;
    var y = ((hash(i, 3) * 900 + t * sp) % 900) - 90;
    var x = ((hash(i, 4) * 1600 - (y + 90) * dx / dy) % 1600 + 1600) % 1600 - 160;
    ctx.moveTo(x, y); ctx.lineTo(x - dx * L, y - dy * L);
  }
  ctx.stroke(); ctx.restore();
}
// Night storm skyline with lit windows and a coloured rim on the tops.
function wSkyline(y, seed, hmax, bw, col, lit, rim, rimA) {
  var x = -80, i = 0, bld = [];
  ctx.fillStyle = col; ctx.beginPath();
  while (x < W + 80) {
    var w = bw * (0.55 + hash(seed, i) * 0.9), h = hmax * (0.3 + hash(seed + 1, i) * 0.7);
    if (hash(seed + 6, i) > 0.85) h *= 1.35;
    ctx.rect(x, y - h, w + 1, h + 400);
    if (hash(seed + 7, i) > 0.7) ctx.rect(x + w * 0.5 - 1.5, y - h - 30, 3, 30);
    bld.push([x, w, h]); x += w + 3 + hash(seed + 2, i) * 8; i++;
  }
  ctx.fill();
  ctx.fillStyle = lit; ctx.beginPath();
  for (var b = 0; b < bld.length; b++) for (var r = 0; r < bld[b][2] / 11 - 1; r++) for (var cc = 0; cc < bld[b][1] / 8 - 1; cc++) {
    if (hash(seed + b * 13 + r, cc) > 0.8) ctx.rect(bld[b][0] + 4 + cc * 8, y - bld[b][2] + 8 + r * 11, 3, 5);
  }
  ctx.fill();
  if (rim) { ctx.fillStyle = rim; ctx.beginPath(); for (var e = 0; e < bld.length; e++) ctx.rect(bld[e][0], y - bld[e][2], bld[e][1] + 1, 3); ctx.save(); ctx.globalAlpha *= rimA; ctx.fill(); ctx.restore(); }
}
// Storm ceiling: a dark cloud deck hanging from the top with a lumpy underside. Its belly is
// lit by the glow at (lx, ly); a thin cel rim traces the lit edge.
function wCeiling(y0, seed, t, speed, step, depth, colTop, colBot, lit, litA, lx, ly) {
  var sh = t * speed, i0 = Math.floor((sh - 300) / step), i1 = Math.ceil((sh + W + 300) / step);
  // irregular lobes: each lobe's width and sag vary, and the base line wanders
  var bx = function (i) { return i * step + (hash(seed + 7, i) - 0.5) * step * 0.7 - sh; };
  var by = function (i) { return y0 + (hash(seed + 1, i) - 0.5) * depth * 1.2 + Math.sin(i * 0.7 + seed) * depth * 0.5; };
  var edge = function () {
    ctx.moveTo(bx(i0), by(i0));
    for (var i = i0; i < i1; i++) {
      var xa = bx(i), xb = bx(i + 1), ya = by(i), yb2 = by(i + 1), d = depth * (0.25 + hash(seed, i) * 0.9), sk = (hash(seed + 2, i) - 0.5) * 0.5;
      ctx.bezierCurveTo(lerp(xa, xb, 0.05 + sk * 0.3), ya + d, lerp(xa, xb, 0.75 + sk * 0.3), yb2 + d * 0.9, xb, yb2);
    }
  };
  var shape = function () { ctx.moveTo(bx(i0), -400); edge(); ctx.lineTo(bx(i1), -400); ctx.closePath(); };
  ctx.fillStyle = lin(0, y0 - 220, 0, y0 + depth, [[0, colTop], [1, colBot]]);
  ctx.beginPath(); shape(); ctx.fill();
  if (litA > 0) {
    ctx.save(); ctx.beginPath(); shape(); ctx.clip();
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= litA;
    ctx.fillStyle = rad(lx, ly, 0, 620, [[0, lit], [1, 'rgba(0,0,0,0)']]);
    ctx.fillRect(lx - 620, ly - 620, 1240, 1240);
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= litA * 0.8;
    ctx.strokeStyle = rad(lx, ly, 0, 700, [[0, 'rgba(210,190,255,0.9)'], [1, 'rgba(210,190,255,0)']]);
    ctx.lineWidth = 3; ctx.beginPath(); edge(); ctx.stroke();
    ctx.restore();
  }
}
// Cloud bank with a lumpy top (mid distance), top edge catching the glow.
function wBank(yt, seed, t, speed, step, height, col, colBot, lit, litA, lx, ly) {
  var sh = t * speed, i0 = Math.floor((sh - 300) / step), i1 = Math.ceil((sh + W + 300) / step);
  var bx = function (i) { return i * step + (hash(seed + 7, i) - 0.5) * step * 0.8 - sh; };
  var by = function (i) { return yt + (hash(seed + 1, i) - 0.5) * height * 0.8 + Math.sin(i * 0.9 + seed) * height * 0.3; };
  var top = function () {
    ctx.moveTo(bx(i0), by(i0));
    for (var i = i0; i < i1; i++) {
      var xa = bx(i), xb = bx(i + 1), d = height * (0.2 + hash(seed, i) * 0.9), sk = (hash(seed + 2, i) - 0.5) * 0.5;
      ctx.bezierCurveTo(lerp(xa, xb, 0.02 + sk * 0.3), by(i) - d, lerp(xa, xb, 0.8 + sk * 0.3), by(i + 1) - d * 0.85, xb, by(i + 1));
    }
  };
  var shape = function () { top(); ctx.lineTo(bx(i1), yt + 600); ctx.lineTo(bx(i0), yt + 600); ctx.closePath(); };
  ctx.fillStyle = lin(0, yt - height, 0, yt + 260, [[0, col], [1, colBot]]);
  ctx.beginPath(); shape(); ctx.fill();
  if (litA > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= litA;
    ctx.strokeStyle = rad(lx, ly, 0, 760, [[0, lit], [1, 'rgba(0,0,0,0)']]);
    ctx.lineWidth = 3; ctx.beginPath(); top(); ctx.stroke();
    ctx.restore();
  }
}

// THE PRESENCE: a towering lattice of glowing nodes and lines around one great core.
// (x, y) = core centre. k = 0..1 how awake it is.
function wPresence(x, y, s, t, k) {
  if (!(k > 0)) return;
  var rot = t * 0.12, rings = 13, per = 14;
  at(x, y, s, 0, function () {
    // aura
    bloom(0, 0, 640, 'rgba(120,80,255,0.32)', k);
    bloom(0, 40, 380, 'rgba(60,220,255,0.30)', k);
    // vertical light pillar
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 0.5 * k;
    ctx.fillStyle = lin(-90, 0, 90, 0, [[0, 'rgba(120,200,255,0)'], [0.5, 'rgba(150,220,255,0.55)'], [1, 'rgba(120,200,255,0)']]);
    ctx.fillRect(-90, -900, 180, 1600);
    ctx.restore();
    // lattice nodes in 3D, projected
    var P3 = [];
    for (var j = 0; j < rings; j++) {
      var yy = -700 + j * 112;
      var u = (yy - 60) / 760, r = Math.max(22, 235 * (1 - u * u));
      var row = [];
      for (var i = 0; i < per; i++) {
        var a = (i / per) * Math.PI * 2 + rot * (j % 2 ? 1 : -0.6) + j * 0.2;
        row.push([Math.cos(a) * r, yy + Math.sin(a) * r * 0.2, Math.sin(a)]);
      }
      P3.push(row);
    }
    var edges = function (front) {
      ctx.beginPath();
      for (var j = 0; j < rings; j++) for (var i = 0; i < per; i++) {
        var p = P3[j][i], q = P3[j][(i + 1) % per];
        if ((p[2] + q[2] > 0) === front) { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }
        if (j < rings - 1) {
          var d = P3[j + 1][i], e = P3[j + 1][(i + 1) % per];
          if ((p[2] + d[2] > 0) === front) { ctx.moveTo(p[0], p[1]); ctx.lineTo(d[0], d[1]); }
          if ((p[2] + e[2] > 0) === front && (i + j) % 2 === 0) { ctx.moveTo(p[0], p[1]); ctx.lineTo(e[0], e[1]); }
        }
      }
    };
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= k;
    ctx.strokeStyle = 'rgba(150,110,255,0.32)'; ctx.lineWidth = 1.6; edges(false); ctx.stroke();
    ctx.strokeStyle = 'rgba(120,235,255,0.62)'; ctx.lineWidth = 2.2; edges(true); ctx.stroke();
    // nodes
    ctx.fillStyle = '#d9fbff'; ctx.beginPath();
    for (var j2 = 0; j2 < rings; j2++) for (var i2 = 0; i2 < per; i2++) {
      var n = P3[j2][i2], rr = n[2] > 0 ? 3.6 + 1.6 * n[2] : 2;
      ctx.moveTo(n[0] + rr, n[1]); ctx.arc(n[0], n[1], rr, 0, Math.PI * 2);
    }
    ctx.fill();
    // data pulses climbing the lattice
    for (var z = 0; z < 10; z++) {
      var col = Math.floor(hash(z, 9) * per), uu = (t * (0.18 + hash(z, 8) * 0.2) + hash(z, 7)) % 1;
      var jf = (1 - uu) * (rings - 1), j0 = Math.floor(jf), fr = jf - j0, A = P3[j0][col], B = P3[Math.min(rings - 1, j0 + 1)][col];
      if (A[2] < -0.2) continue;
      glow(lerp(A[0], B[0], fr), lerp(A[1], B[1], fr), 22, 'rgba(200,250,255,0.9)', 1);
    }
    ctx.restore();
    // orbit halos around the core
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= k;
    for (var h = 0; h < 2; h++) {
      ctx.strokeStyle = h ? 'rgba(190,140,255,0.55)' : 'rgba(110,240,255,0.6)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, 0, 230 + h * 90, 46 + h * 22, h ? 0.18 : -0.12, 0, Math.PI * 2); ctx.stroke();
      var oa = t * (h ? -0.7 : 0.9);
      glow(Math.cos(oa) * (230 + h * 90) * Math.cos(h ? 0.18 : -0.12) - Math.sin(oa) * (46 + h * 22) * Math.sin(h ? 0.18 : -0.12), Math.cos(oa) * (230 + h * 90) * Math.sin(h ? 0.18 : -0.12) + Math.sin(oa) * (46 + h * 22) * Math.cos(h ? 0.18 : -0.12), 30, 'rgba(230,250,255,0.9)', 1);
    }
    ctx.restore();
    // THE CORE: an iris of light (aperture blades, rings, white-hot centre)
    var op = 0.85 + 0.15 * Math.sin(t * 1.7);
    ctx.save(); ctx.globalAlpha *= k;
    ctx.fillStyle = rad(0, 0, 10, 120, [[0, '#ffffff'], [0.25, '#bff8ff'], [0.55, 'rgba(90,170,255,0.85)'], [1, 'rgba(90,60,200,0)']]);
    ctx.beginPath(); ctx.arc(0, 0, 120, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(230,250,255,0.9)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 86, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(160,230,255,0.75)';
    ctx.beginPath();
    for (var b = 0; b < 24; b++) { var ba = b / 24 * Math.PI * 2 + t * 0.2; ctx.moveTo(Math.cos(ba) * 44, Math.sin(ba) * 44); ctx.lineTo(Math.cos(ba + 0.25) * 82, Math.sin(ba + 0.25) * 82); }
    ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 30 * op, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    bloom(0, 0, 200, 'rgba(200,250,255,0.75)', k * op);
  });
}

defineScene({
  id: 'worry',
  title: 'The worry',
  alt: 'A storm over the city at night. A colossal abstract AI presence, a towering lattice of glowing nodes around one great glowing core, rises behind the skyline. Then Dario stands on a rooftop in the wind, worried, lit by its glow, as the words Is it safe tremble beside him.',
  min: 11,
  lines: [
    'That meant AI could become incredibly powerful, very fast.',
    "And Dario had a worry he couldn't shake: what if it gets that powerful before we know how to make it safe?"
  ],
  draw: function (c) {
    var t = c.t;
    var cutT = c.since(1, 0.0);
    var shotB = cutT > 0;
    var rise = eio(seg(c.since(0, 0.05), 0, 2.6));
    var wake = 0.25 + 0.75 * eo(seg(c.since(0, 0.45), 0, 1.0));
    // lightning schedule
    var strikes = [[c.when(0, 0.55), 1], [c.when(0, 0.88), 2], [c.when(1, 0.0) - 0.05, 3], [c.when(1, 0.5), 4]];
    wStrikes(t, strikes);
    var fl = 0, last = null;
    for (var s = 0; s < strikes.length; s++) { var f = wFlick(t - strikes[s][0]); if (f > fl) { fl = f; last = strikes[s]; } }
    var dr = drift(t, 1);

    if (!shotB) {
      // ================= SHOT A: the presence rises over the storm city =================
      var hitA = Math.max(0, 1 - seg(c.since(0, 0.88), 0, 0.5)) * (c.since(0, 0.88) > 0 ? 1 : 0);
      var sh = shake(t, hitA * 0.6 + fl * 0.15);
      var zoom = 1.0 + 0.05 * eio(seg(t, 0, 4.5));
      var coreY = 300 + 640 * (1 - rise), lit = wake * (0.3 + 0.7 * rise);
      camera(640 + dr[0] + sh[0], 372 - 30 * rise + dr[1] + sh[1], zoom, 0, function () {
        sky(W_SKY, 580);
        tint('#b8a6ff', fl * 0.2);
        // glow from below the horizon before it rises, then its full aura
        bloom(640, 640, 560, 'rgba(110,90,255,0.4)', 0.45 + 0.55 * rise);
        // far cloud bank behind it, edges lit by its glow
        wBank(470, 7, t, 5, 150, 90, '#2c2648', '#1a1530', 'rgba(190,170,255,0.9)', lit, 640, coreY);
        wPresence(640, coreY, 1.0, t, lit);
        // the storm ceiling swallows the top of the spire
        wCeiling(150, 3, t, 9, 170, 70, '#0a0918', '#2a2446', 'rgba(140,110,255,0.75)', 0.25 + 0.75 * lit, 640, coreY);
        wCeiling(60, 5, t, 15, 210, 50, '#07060f', '#1c1834', 'rgba(140,110,255,0.6)', 0.2 + 0.6 * lit, 640, coreY);
        if (last && fl > 0) wBolt(160 + hash(last[1], 1) * 960, 60, 470 + hash(last[1], 2) * 60, last[1] * 7, fl);
        // skyline: far, haze, near (tops rim-lit by the presence)
        wSkyline(600, 5, 170, 54, '#1a1530', 'rgba(255,200,140,0.5)', 'rgba(140,220,255,1)', 0.55 * rise);
        ctx.fillStyle = lin(0, 470, 0, 640, [[0, 'rgba(80,60,150,0)'], [1, 'rgba(80,60,150,0.5)']]);
        ctx.fillRect(-200, 470, W + 400, 170);
        wSkyline(668, 9, 190, 84, '#0c0a1c', 'rgba(255,210,150,0.7)', 'rgba(160,230,255,1)', 0.85 * rise);
        ground(668, '#08060f', '#040308');
        wRain(t, 110, 0.3, 0.22);
      });
      flash(fl * 0.35, '#e6e0ff');
      letterbox(0.6);
    } else {
      // ================= SHOT B: Dario on the rooftop, low angle, dutch tilt =================
      var tremble = 0.25 + 0.2 * pulse(t * 0.7, 1);
      var shB = shake(t, 0.12 + fl * 0.25 + (1 - seg(cutT, 0, 0.5)) * 0.4);
      var zB = 1.04 + 0.05 * eio(seg(cutT, 0, 9));
      var rotB = -0.095 + 0.01 * Math.sin(t * 0.5);
      camera(640 + dr[0] + shB[0], 360 + dr[1] + shB[1], zB, rotB, function () {
        sky(W_SKY, 640);
        tint('#b8a6ff', fl * 0.22);
        wBank(520, 23, t, 7, 160, 110, '#2c2648', '#1a1530', 'rgba(190,170,255,0.9)', 0.35, 980, 240);
        wPresence(990, 240, 1.08, t, 0.92);
        wCeiling(70, 29, t, 14, 190, 70, '#0a0918', '#2a2446', 'rgba(140,110,255,0.8)', 1, 980, 240);
        if (last && fl > 0) wBolt(80 + hash(last[1], 1) * 500, -40, 380, last[1] * 7, fl);
        // the city far below (low horizon), then the rooftop rail behind him
        wSkyline(650, 13, 120, 46, '#151129', 'rgba(255,200,140,0.6)', 'rgba(140,220,255,1)', 0.6);
        ctx.fillStyle = lin(0, 560, 0, 740, [[0, 'rgba(60,40,120,0)'], [1, 'rgba(60,40,120,0.5)']]);
        ctx.fillRect(-300, 560, W + 600, 200);
        ctx.fillStyle = '#06050d'; ctx.fillRect(-300, 668, W + 600, 200);
        ctx.fillStyle = 'rgba(150,230,255,0.75)'; ctx.fillRect(-300, 668, W + 600, 2);
        for (var p = 0; p < 16; p++) { ctx.fillStyle = '#06050d'; ctx.fillRect(-260 + p * 120, 630, 7, 50); }
        ctx.fillStyle = '#06050d'; ctx.fillRect(-300, 628, W + 600, 6);
        // light from the presence spilling across the frame
        rays(980, 220, 9, 1300, 1.0, 'rgba(150,200,255,0.8)', 0.12, t, Math.PI * 0.82);
        // Dario: big, low-angle waist-up, wind in his hair, rim-lit by the glow
        bloom(520, 300, 300, 'rgba(140,120,255,0.25)', 1);
        person('dario', 520, 1235, 2.5, {
          t: t, expr: 'worried', arms: 'down', look: [0.55, -0.45], turn: 0.3,
          wind: 1, rim: '#9fe9ff', light: 1
        });
        // cool glow wash from the right
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = lin(1000, 0, 300, 0, [[0, 'rgba(120,150,255,0.18)'], [1, 'rgba(120,150,255,0)']]);
        ctx.fillRect(-300, -200, W + 600, H + 400);
        ctx.restore();
        petals(41, 16, t, { color: 'rgba(200,205,255,0.7)', wind: 260 });
        wRain(t, 120, 0.36, 0.3);
      });
      // the question, small and shaky
      var qk = seg(c.since(1, 0.62), 0, 0.5);
      if (qk > 0) {
        var jx = Math.sin(t * 41) * 2.2 + Math.sin(t * 23) * 1.4, jy = Math.cos(t * 37) * 1.8;
        at(186 + jx, 300 + jy, 0.8 + 0.2 * back(qk), -0.09, function () {
          fade(clamp(qk * 2) * 0.35, function () { txt('IS IT SAFE?', 4, 3, 35, { color: '#a58cff' }); });
          fade(clamp(qk * 2), function () { txt('IS IT SAFE?', 0, 0, 35, { color: '#ffffff', stroke: '#1a1033', sw: 7 }); });
        });
      }
      flash(Math.max(fl * 0.35, 0.9 * (1 - seg(cutT, 0, 0.3))), '#ece6ff');
      letterbox(0.6 + 0.0 * tremble);
    }
    vignette(0.62, 'rgba(3,2,12,1)');
  }
});
