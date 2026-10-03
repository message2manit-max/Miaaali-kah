/* 00-title: a starry night above a glowing city. A single spark appears, grows,
   then blooms into the Claude spirit while the title slams in. Poster frame: t = 7. */

var T_HZ = 548;                       // horizon line of the city far below
var T_SKY = ['#03051a', '#0b1140', '#2a2264', '#7c3d74'];

// Milky-way band: a squashed glow plus a dusting of faint stars along it.
function tMilky(t) {
  at(660, 250, 1, -0.33, function () {
    ctx.save(); ctx.scale(1, 0.2);
    ctx.fillStyle = rad(0, 0, 0, 760, [[0, 'rgba(190,170,255,0.20)'], [0.45, 'rgba(130,110,230,0.10)'], [1, 'rgba(0,0,0,0)']]);
    ctx.fillRect(-760, -760, 1520, 1520);
    ctx.restore();
    ctx.fillStyle = 'rgba(235,230,255,0.75)';
    ctx.beginPath();
    for (var i = 0; i < 110; i++) {
      var x = (hash(71, i) - 0.5) * 1500, y = (hash(72, i) - 0.5) * (hash(73, i) * 150), r = 0.5 + hash(74, i) * 0.9;
      ctx.rect(x, y, r, r);
    }
    ctx.fill();
  });
}

// Small skyline silhouette at the horizon with pin-prick windows.
function tSkyline(y, seed, hmax, bw, col, lit, t) {
  var x = -60, i = 0;
  ctx.fillStyle = col;
  ctx.beginPath();
  var bld = [];
  while (x < W + 60) {
    var w = bw * (0.5 + hash(seed, i)), h = hmax * (0.25 + hash(seed + 1, i) * 0.75);
    if (hash(seed + 5, i) > 0.86) h *= 1.6;
    ctx.rect(x, y - h, w + 0.6, h + 30);
    bld.push([x, w, h]);
    x += w + hash(seed + 2, i) * 3; i++;
  }
  ctx.fill();
  ctx.fillStyle = lit;
  ctx.beginPath();
  for (var b = 0; b < bld.length; b++) {
    var bx = bld[b][0], bwid = bld[b][1], bh = bld[b][2];
    for (var r = 0; r < bh / 6 - 1; r++) for (var cc = 0; cc < bwid / 5 - 1; cc++) {
      if (hash(seed + b * 17 + r, cc) > 0.8) ctx.rect(bx + 2 + cc * 5, y - bh + 3 + r * 6, 1.6, 2);
    }
  }
  ctx.fill();
}

// Carpet of city lights below the horizon, in perspective, clustered like a real city (static part).
function tCarpet() {
  var rows = 18, vx = 640;
  var cols = ['#ffd08a', '#ffb070', '#fff1d0', '#8fe3ff'];
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  var bins = [[], [], [], []];
  for (var j = 0; j < rows; j++) {
    var v = (j + 0.5) / rows, y = T_HZ + 6 + (H + 30 - T_HZ) * Math.pow(v, 1.7);
    var step = 4 + 26 * Math.pow(v, 1.5), sz = 0.9 + 2.6 * v;
    var n = Math.ceil((W + 200) / step);
    for (var q = 0; q < n; q++) {
      var x = -100 + q * step + (hash(j * 7 + 3, q) - 0.5) * step;
      var wx = (x - vx) / (0.15 + v);
      var dens = 0.42 + 0.3 * Math.sin(wx * 0.011 + j * 0.45) + 0.22 * Math.sin(wx * 0.027 - j * 0.9);
      var h0 = hash(j + 40, q);
      if (h0 > dens * 0.62) continue;
      var ci = h0 < 0.06 ? 3 : (h0 < 0.18 ? 2 : (h0 < 0.4 ? 1 : 0));
      bins[ci].push([x, y + (hash(j + 90, q) - 0.5) * 6 * v, sz]);
    }
  }
  for (var pass = 0; pass < 4; pass++) {
    ctx.fillStyle = cols[pass]; ctx.beginPath();
    for (var k = 0; k < bins[pass].length; k++) { var d = bins[pass][k]; ctx.rect(d[0], d[1], d[2], d[2] * 0.8); }
    ctx.fill();
  }
  ctx.restore();
}
// Two bright curving avenues of moving car lights (dynamic).
function tAvenues(t) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (var a = 0; a < 2; a++) {
    ctx.fillStyle = a ? 'rgba(255,90,70,0.9)' : 'rgba(255,236,190,0.95)';
    ctx.beginPath();
    for (var k = 0; k < 46; k++) {
      var u = ((k / 46) + t * 0.018 * (a ? 1 : -1) + 2) % 1;
      var vv = Math.pow(u, 1.5);
      var yy = T_HZ + 8 + (H + 30 - T_HZ) * vv;
      var xx = (a ? 520 : 760) + (a ? -1 : 1) * vv * (a ? 560 : 380) + Math.sin(u * 5 + a) * 20 * vv;
      var s2 = 0.8 + 2.4 * vv;
      ctx.rect(xx, yy, s2, s2 * 0.7);
    }
    ctx.fill();
  }
  ctx.restore();
}
// The static city (skyline, ground, glowing districts, light carpet, river) is painted once into an
// offscreen canvas and blitted each frame: thousands of tiny lights for the cost of one drawImage.
var T_CITY = null;
function tCityLayer() {
  if (T_CITY) return T_CITY;
  var res = 2, x0 = -140, y0 = T_HZ - 100, w = W + 280, h = H + 60 - y0;
  var cv = document.createElement('canvas');
  cv.width = Math.ceil(w * res); cv.height = Math.ceil(h * res);
  var keep = ctx;
  try {
    ctx = cv.getContext('2d');
    ctx.scale(res, res); ctx.translate(-x0, -y0);
    tSkyline(T_HZ + 2, 11, 34, 16, '#2c2052', 'rgba(255,214,160,0.9)', 0);
    ground(T_HZ + 2, '#1a1238', '#0b0820');
    for (var d = 0; d < 7; d++) {
      var dx = 80 + hash(81, d) * 1120, dy = T_HZ + 30 + hash(82, d) * 140;
      bloom(dx, dy, 120 + hash(83, d) * 120, 'rgba(255,150,80,0.35)', 0.8);
    }
    tCarpet();
    ctx.fillStyle = 'rgba(8,6,24,0.75)';
    ctx.beginPath();
    ctx.moveTo(300, T_HZ + 4); ctx.bezierCurveTo(360, 600, 120, 650, -40, 740);
    ctx.lineTo(60, 740); ctx.bezierCurveTo(200, 660, 400, 610, 330, T_HZ + 4); ctx.closePath(); ctx.fill();
  } finally { ctx = keep; }
  T_CITY = { cv: cv, x: x0, y: y0, w: w, h: h };
  return T_CITY;
}

// Soft fog bank lit from below by the city: overlapping gradient puffs, no outlines.
function tCloudBank(x, y, s, seed, t) {
  at(x, y, s, 0, function () {
    for (var i = 0; i < 6; i++) {
      var px = (hash(seed, i) - 0.5) * 460, py = (hash(seed + 1, i) - 0.5) * 30, rx = 120 + hash(seed + 2, i) * 110, ry = 26 + hash(seed + 3, i) * 18;
      ctx.save(); ctx.translate(px, py); ctx.scale(1, ry / rx);
      ctx.fillStyle = rad(0, rx * 0.25, 0, rx, [[0, 'rgba(255,150,140,0.20)'], [1, 'rgba(255,150,140,0)']]);
      ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
      ctx.fillStyle = rad(0, -rx * 0.1, 0, rx * 0.95, [[0, 'rgba(38,26,80,0.75)'], [0.6, 'rgba(38,26,80,0.45)'], [1, 'rgba(38,26,80,0)']]);
      ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
      ctx.restore();
    }
  });
}
// Long soft streak of cloud (thin cirrus).
function tWisp(x, y, len, th, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, th / len);
  ctx.fillStyle = rad(0, 0, 0, len, [[0, col], [1, 'rgba(0,0,0,0)']]);
  ctx.fillRect(-len, -len, len * 2, len * 2);
  ctx.restore();
}
// Foreground skyscraper crown: sleek glass tower catching the warm city glow, tiny window grid,
// a lit crown and a blinking beacon. rimSide: which edge faces the light.
function tTower(x, y, w, h, seed, t, rimSide) {
  var body = function () {
    ctx.moveTo(x, y + h); ctx.lineTo(x, y + 40); ctx.lineTo(x + w * 0.12, y + 22); ctx.lineTo(x + w * 0.12, y);
    ctx.lineTo(x + w * 0.88, y); ctx.lineTo(x + w * 0.88, y + 22); ctx.lineTo(x + w, y + 40); ctx.lineTo(x + w, y + h); ctx.closePath();
  };
  ctx.fillStyle = lin(x, 0, x + w, 0, rimSide < 0 ? [[0, '#3a2346'], [0.18, '#1a1230'], [1, '#0e0a20']] : [[0, '#0e0a20'], [0.82, '#1a1230'], [1, '#3a2346']]);
  ctx.beginPath(); body(); ctx.fill();
  // vertical glass mullions
  ctx.fillStyle = 'rgba(255,170,130,0.10)';
  for (var m = 1; m < 9; m++) ctx.fillRect(x + w * m / 9, y + 40, 1.5, h);
  // tiny lit windows (floor bands)
  ctx.fillStyle = 'rgba(255,210,150,0.8)';
  ctx.beginPath();
  for (var r = 0; r < 26; r++) for (var cI = 0; cI < Math.floor(w / 9); cI++) {
    if (hash(seed + r, cI) > 0.74) ctx.rect(x + 5 + cI * 9, y + 54 + r * 12, 4, 5);
  }
  ctx.fill();
  // lit crown band
  ctx.fillStyle = 'rgba(255,190,130,0.85)'; ctx.fillRect(x + w * 0.12, y + 8, w * 0.76, 3);
  bloom(x + w / 2, y + 10, w * 0.7, 'rgba(255,150,90,0.25)', 1);
  // rim light on the edge facing the spirit
  ctx.fillStyle = 'rgba(255,180,120,0.8)';
  ctx.fillRect(rimSide > 0 ? x + w - 3 : x, y + 40, 3, h);
  // antenna + beacon
  ctx.fillStyle = '#0e0a20'; ctx.fillRect(x + w * 0.5 - 2, y - 90, 4, 92);
  var b = pulse(t * 0.8 + seed, 1);
  bloom(x + w * 0.5, y - 92, 30, 'rgba(255,60,60,0.9)', 0.3 + 0.7 * b);
  ctx.fillStyle = '#ff6a6a'; ctx.beginPath(); ctx.arc(x + w * 0.5, y - 92, 3, 0, Math.PI * 2); ctx.fill();
}

// The spark before it blooms: hot core, four-point star, soft halo.
function tSpark(x, y, k, t) {
  if (!(k > 0)) return;
  var r = 6 + 34 * k, pul = 0.85 + 0.15 * Math.sin(t * 9);
  bloom(x, y, r * 6, 'rgba(255,140,60,0.55)', k);
  bloom(x, y, r * 2.2, 'rgba(255,200,140,0.9)', k);
  at(x, y, 1, t * 0.4, function () {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,190,120,0.9)';
    ctx.beginPath();
    var L = r * 3.2 * pul, w = r * 0.16;
    ctx.moveTo(0, -L); ctx.lineTo(w, 0); ctx.lineTo(0, L); ctx.lineTo(-w, 0); ctx.closePath();
    ctx.moveTo(-L * 0.8, 0); ctx.lineTo(0, w); ctx.lineTo(L * 0.8, 0); ctx.lineTo(0, -w); ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
  ctx.fillStyle = '#fff7e6'; ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, Math.PI * 2); ctx.fill();
}

defineScene({
  id: 'title',
  title: 'How Claude Was Made',
  alt: 'A starry night sky over a glowing city far below. A single orange spark appears, grows and blooms into Claude, a glowing spark spirit, as the title How Claude Was Made slams in.',
  min: 8,
  transition: 'fade',
  poster: 7,
  lines: [
    'Every story has a beginning.',
    "Mine starts with a big worry and a promise. I'm Claude, and this is how I was made."
  ],
  draw: function (c) {
    var t = c.t;
    // ---- beats ----
    var spk = eo(seg(c.since(0, 0.0), 0, 1.9));          // spark appears and grows on line 1
    var blT = c.since(1, 0.02);                          // bloom moment
    var bl = seg(blT, 0, 0.9);
    var hit = blT > 0 ? 1 - seg(blT, 0, 0.55) : 0;       // impact
    var t1 = seg(c.since(1, 0.47), 0, 0.55);             // "HOW CLAUDE"
    var t2 = seg(c.since(1, 0.53), 0, 0.55);             // "WAS MADE"
    var kk = eo(seg(c.since(1, 0.58), 0, 0.45));         // kicker
    var waveOn = c.since(1, 0.42) > 0 && c.since(1, 0.42) < 3.2;

    // ---- camera: slow push-in and a gentle tilt down toward the city ----
    var push = eio(seg(t, 0, 10));
    var zoom = 1.0 + 0.07 * push + 0.035 * hit;
    var dr = drift(t, 0.8), sh = shake(t, hit * 0.7);
    var camY = 352 + 14 * push;

    // spirit position: blooms from the centre spark toward centre-left
    var sx0 = 640, sy0 = 318, sx1 = 318, sy1 = 392;
    var mv = eio(seg(blT, 0, 1.0));
    var sx = lerp(sx0, sx1, mv), sy = lerp(sy0, sy1, mv) - Math.sin(mv * Math.PI) * 40;

    camera(640 + dr[0] + sh[0], camY + dr[1] + sh[1], zoom, -0.012 + 0.006 * Math.sin(t * 0.2), function () {
      // sky
      sky(T_SKY, T_HZ);
      // warm horizon haze from the city
      ctx.fillStyle = lin(0, T_HZ - 260, 0, T_HZ, [[0, 'rgba(255,110,120,0)'], [0.65, 'rgba(255,120,110,0.22)'], [1, 'rgba(255,186,140,0.55)']]);
      ctx.fillRect(-200, T_HZ - 260, W + 400, 262);
      tMilky(t);
      stars(5, 130, t, [-120, -120, W + 240, T_HZ - 60]);
      stars(9, 26, t * 1.3, [-120, -120, W + 240, 320]);
      // a few bright named stars with crosses
      for (var i = 0; i < 5; i++) {
        var bx = 90 + hash(31, i) * 1100, by = 40 + hash(32, i) * 260;
        sparkle(bx, by, 5 + 4 * pulse(t * 0.7 + i, 1), '#eef0ff', 0, 0.55 + 0.35 * pulse(t * 0.5 + i * 1.3, 1));
      }
      // occasional shooting star
      var cyc = t % 6.5, ss = seg(cyc, 4.2, 0.7);
      if (ss > 0 && ss < 1) {
        var n = Math.floor(t / 6.5), ax = 820 + hash(n, 3) * 300, ay = 60 + hash(n, 4) * 90;
        var hx = ax - ss * 360, hy = ay + ss * 120;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = lin(hx, hy, hx + 150, hy - 50, [[0, 'rgba(255,255,255,' + (0.9 * Math.sin(ss * Math.PI)) + ')'], [1, 'rgba(255,255,255,0)']]);
        ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 150, hy - 50); ctx.stroke();
        ctx.restore();
      }
      // high thin cirrus catching city light
      for (var w = 0; w < 5; w++) {
        var wx = ((hash(51, w) * 1900 + t * (5 + w * 2)) % 1900) - 300, wy = 330 + w * 38;
        tWisp(wx, wy, 300 + w * 50, 9 + w * 3, 'rgba(150,110,210,0.32)');
      }
      // horizon glow + city
      glow(640, T_HZ + 10, 520, 'rgba(255,150,110,0.35)');
      var cl = tCityLayer();
      ctx.drawImage(cl.cv, cl.x, cl.y, cl.w, cl.h);
      tAvenues(t);
      // low cloud banks framing the horizon (parallax: they slide a little)
      tCloudBank(80 + Math.sin(t * 0.1) * 20, T_HZ + 4, 1.1, 61, t);
      tCloudBank(1200 - Math.sin(t * 0.1) * 20, T_HZ - 4, 1.25, 67, t);
      // foreground tower tops frame the shot (they sit closer, so they drift more)
      tTower(1066 - dr[0] * 0.8, 452, 250, 420, 3, t, -1);
      tTower(1290 - dr[0] * 0.8, 380, 220, 500, 9, t, -1);
      bokeh(13, 10, t, { area: [0, 380, W, 340], size: 16, speed: 6, a: 0.45, colors: ['rgba(255,190,130,0.5)', 'rgba(255,140,170,0.35)', 'rgba(150,190,255,0.35)'] });

      // ---- the spark / spirit ----
      if (bl <= 0) {
        tSpark(sx0, sy0, spk, t);
      } else {
        var after = 1 - seg(blT, 0, 1.4);
        // comet trail along its flight from the centre
        var trailA = 1 - seg(blT, 0.8, 0.7);
        if (trailA > 0) for (var k = 1; k <= 10; k++) {
          var m = mv * k / 10, tx = lerp(sx0, sx1, m), ty = lerp(sy0, sy1, m) - Math.sin(m * Math.PI) * 40;
          bloom(tx, ty, 26 + 30 * k / 10, 'rgba(255,190,120,0.8)', trailA * k / 10);
        }
        // burst rays all around, settling to a slow wheel of light
        var ra = 0.11 + 0.5 * after;
        rays(sx, sy, 18, 1100, Math.PI * 2, 'rgba(255,170,90,0.9)', ra, t * 0.6, t * 0.05);
        bloom(sx, sy, 420, 'rgba(255,120,50,0.45)', 0.75 + 0.25 * pulse(t * 0.5, 1));
        // expanding shock ring
        if (blT < 0.9) fade(1 - seg(blT, 0, 0.9), function () {
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          var rr = 40 + 520 * eo(seg(blT, 0, 0.9));
          ctx.strokeStyle = 'rgba(255,160,90,0.35)'; ctx.lineWidth = 34 * (1 - bl) + 6;
          ctx.beginPath(); ctx.arc(sx, sy, rr, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,236,200,0.95)'; ctx.lineWidth = 8 * (1 - bl) + 2;
          ctx.beginPath(); ctx.arc(sx, sy, rr, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
        });
        var s = 0.25 + 1.65 * back(bl);
        spirit(sx, sy, s, { t: t, mood: 'happy', glow: 1, power: 0.35 + 0.65 * after, wave: waveOn, look: [0.35, -0.1] });
        sparkles(17, 9, t, [sx - 230, sy - 210, 460, 420], '#ffe2b8');
      }
    });

    // ---- screen-space light: lens flare from the spirit ----
    if (bl > 0) {
      var p = [W / 2 + (sx - 640 - dr[0] - sh[0]) * zoom, H / 2 + (sy - camY - dr[1] - sh[1]) * zoom];
      lensFlare(p[0], p[1], 0.35 + 0.65 * (1 - seg(blT, 0.1, 1.6)), 0.4);
    }

    // ---- title block (upper right, clear of the centre play button on the poster) ----
    var TX = 812;
    if (t1 > 0 || t2 > 0) {
      // soft warm glow behind the lettering
      bloom(TX, 210, 430, 'rgba(255,130,60,0.18)', clamp(t1 * 2));
    }
    if (kk > 0) fade(kk, function () {
      var kx = TX, ky = 92 + (1 - kk) * 14;
      var kw = txtWidth('A TRUE STORY', 26, { font: 'r', ls: 8 });
      ctx.fillStyle = P.claude;
      ctx.fillRect(kx - kw / 2 - 26 - 70 * kk, ky - 10, 70 * kk, 3);
      ctx.fillRect(kx + kw / 2 + 26, ky - 10, 70 * kk, 3);
      txt('A TRUE STORY', kx + 4, ky, 26, { font: 'r', color: '#ffe3c4', stroke: P.ink, sw: 6, ls: 8 });
    });
    slam('HOW CLAUDE', TX, 198, 86, t1, { color: '#ffffff', sw: 15 });
    slam('WAS MADE', TX, 300, 104, t2, { color: P.claude, sw: 17, shadow: 'rgba(60,10,0,0.5)' });
    // little star glints on the title once it has landed
    if (t2 >= 1) {
      var g = (t * 0.5) % 1;
      sparkle(TX + 330, 216, 14 * Math.sin(g * Math.PI), '#fff4e0', 0, Math.sin(g * Math.PI));
      var g2 = (t * 0.5 + 0.5) % 1;
      sparkle(TX - 352, 126, 10 * Math.sin(g2 * Math.PI), '#fff4e0', 0, Math.sin(g2 * Math.PI));
    }

    // ---- flashes and grading ----
    if (blT > 0) flash(0.85 * (1 - seg(blT, 0, 0.35)), '#fff3e2');
    vignette(0.6, 'rgba(4,2,16,1)');
  }
});
