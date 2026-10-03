/* 07-anthropic: the founders, rim-lit silhouettes on a hill at sunset. The name
   ANTHROPIC slams into the sky, the camera tilts up, and the three parts of the
   mission appear as glowing emblems. */

function pcam(cam, d, fn) { camera(lerp(W / 2, cam.x, d), lerp(H / 2, cam.y, d), 1 + (cam.z - 1) * d, (cam.r || 0) * d, fn); }
function kick(s, d) { return s >= 0 && s < d ? 1 - s / d : 0; }
function settle(s, tau) { return s > 0 ? 1 - Math.exp(-s / tau) : 0; }

// Flat-colour silhouettes without an offscreen canvas: the figures are drawn through a
// context proxy that forces every fill and stroke to one colour (gradient glows drawn
// with fillRect are skipped, additive modes become normal). Two passes: a slightly
// dilated, raised pass in the rim colour, then the dark figure on top.
function flatCtx(real, col, dilate) {
  var grad = false;
  return new Proxy(real, {
    get: function (tg, k) {
      if (k === 'fillRect') return function (x, y, w, h) { if (!grad) tg.fillRect(x, y, w, h); };
      var v = tg[k];
      return typeof v === 'function' ? v.bind(tg) : v;
    },
    set: function (tg, k, v) {
      if (k === 'fillStyle') { grad = typeof v !== 'string'; tg.fillStyle = col; }
      else if (k === 'strokeStyle') tg.strokeStyle = col;
      else if (k === 'globalCompositeOperation') tg.globalCompositeOperation = 'source-over';
      else if (k === 'lineWidth') tg.lineWidth = v + dilate;
      else if (k === 'shadowBlur' || k === 'shadowColor') { /* ignore */ }
      else tg[k] = v;
      return true;
    }
  });
}
function silhouette(fn, dark, rim) {
  var main = ctx;
  if (typeof Proxy === 'undefined') { fn(0); return; }
  try {
    main.save(); ctx = flatCtx(main, rim, 6); ctx.fillStyle = rim; ctx.strokeStyle = rim; fn(-3); ctx = main; main.restore();
    main.save(); ctx = flatCtx(main, dark, 0); ctx.fillStyle = dark; ctx.strokeStyle = dark; fn(0); ctx = main; main.restore();
  } finally { ctx = main; }
}

// Long sunset cloud bank: hard shade band on top, body, a bright rim underneath (sun below).
// col = [body, top shade, under rim]
function bank(x, y, w, h, seed, col) {
  var e = [], n = 9;
  for (var i = 0; i < n; i++) {
    var u = i / (n - 1), ry = h * (0.4 + hash(seed + 3, i) * 0.6) * (0.5 + 0.5 * Math.sin(u * Math.PI));
    e.push([x + (u - 0.5) * w * 0.84 + (hash(seed, i) - 0.5) * w * 0.06, y - ry * 0.45 + (hash(seed + 1, i) - 0.5) * h * 0.18, w * (0.08 + hash(seed + 2, i) * 0.08), ry]);
  }
  var build = function (dy) {
    for (var j = 0; j < n; j++) { ctx.moveTo(e[j][0] + e[j][2], e[j][1] + dy); ctx.ellipse(e[j][0], e[j][1] + dy, e[j][2], e[j][3], 0, 0, Math.PI * 2); }
    ctx.moveTo(x + w * 0.44, y + dy); ctx.ellipse(x, y + dy, w * 0.44, h * 0.26, 0, 0, Math.PI * 2);
  };
  ctx.save(); ctx.beginPath(); build(0); ctx.clip();
  ctx.fillStyle = col[2]; ctx.fillRect(x - w, y - h * 3, w * 2, h * 5);
  ctx.beginPath(); build(-h * 0.2); ctx.clip();
  ctx.fillStyle = col[1]; ctx.fillRect(x - w, y - h * 3, w * 2, h * 5);
  ctx.beginPath(); build(h * 0.42); ctx.fillStyle = col[0]; ctx.fill();
  ctx.restore();
}
function hillPath(y0, amp, seed, x0, x1) {
  ctx.moveTo(x0, y0 + 400);
  var pts = [];
  for (var x = x0; x <= x1; x += 80) pts.push([x, y0 + Math.sin(x * 0.004 + seed) * amp + Math.sin(x * 0.011 + seed * 2) * amp * 0.35]);
  ctx.lineTo(pts[0][0], pts[0][1]);
  for (var i = 1; i < pts.length; i++) { var p = pts[i - 1], q = pts[i]; ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
  ctx.lineTo(x1, y0 + 400); ctx.closePath();
}

// Emblem icons, drawn around (0, 0) at radius ~r.
function iconHeart(r) { ctx.moveTo(0, r * 0.62); ctx.bezierCurveTo(-r * 1.15, -r * 0.1, -r * 0.62, -r * 0.95, 0, -r * 0.42); ctx.bezierCurveTo(r * 0.62, -r * 0.95, r * 1.15, -r * 0.1, 0, r * 0.62); ctx.closePath(); }
function iconShield(r) { ctx.moveTo(0, -r * 0.78); ctx.lineTo(r * 0.66, -r * 0.5); ctx.quadraticCurveTo(r * 0.68, r * 0.38, 0, r * 0.82); ctx.quadraticCurveTo(-r * 0.68, r * 0.38, -r * 0.66, -r * 0.5); ctx.closePath(); }
function emblem(kind, x, y, k, t, label, i) {
  if (!(k > 0)) return;
  var pop = back(seg(k, 0, 0.5)), r = 56, bob = Math.sin(t * 1.4 + i * 1.9) * 4 * seg(k, 0.5, 0.5);
  // shock ring
  var ring = seg(k, 0.05, 0.55);
  if (ring > 0 && ring < 1) fade(1 - ring, function () { ctx.strokeStyle = '#fff1d6'; ctx.lineWidth = 6 * (1 - ring) + 1; ctx.beginPath(); ctx.arc(x, y, r * (1 + ring * 1.6), 0, Math.PI * 2); ctx.stroke(); });
  bloom(x, y + bob, r * 2.3, 'rgba(255,150,70,0.55)', clamp(k * 2) * (0.75 + 0.25 * pulse(t + i, 0.6)));
  at(x, y + bob, pop, 0, function () {
    cel(function () { ctx.arc(0, 0, r, 0, Math.PI * 2); }, '#ff8a3d', {
      shade: '#e4572e', shadeBuild: function () { ctx.arc(r * 0.35, r * 0.4, r * 0.95, 0, Math.PI * 2); },
      light: '#ffc27a', lightBuild: function () { ctx.arc(-r * 0.3, -r * 0.35, r * 0.55, 0, Math.PI * 2); }, line: 5
    });
    inkWith(function () { ctx.arc(0, 0, r - 9, 0, Math.PI * 2); }, 3, 'rgba(255,240,220,0.85)');
    if (kind === 'heart') cel(function () { iconHeart(r * 0.62); }, '#ffffff', { line: 4 });
    else if (kind === 'shield') {
      cel(function () { iconShield(r * 0.68); }, '#ffffff', { line: 4 });
      cel(function () { iconShield(r * 0.4); }, '#ffd9b8', { line: 0 });
    } else {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = P.ink; ctx.lineWidth = 19; ctx.beginPath(); ctx.moveTo(-r * 0.42, r * 0.02); ctx.lineTo(-r * 0.1, r * 0.34); ctx.lineTo(r * 0.46, -r * 0.34); ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 11; ctx.stroke();
    }
  });
  var lk = eo(seg(k, 0.25, 0.5));
  if (lk > 0) fade(lk, function () { txt(label, x, y + 96 + bob + (1 - lk) * 14, 28, { color: '#ffffff', stroke: P.ink, sw: 7, ls: 1 }); });
}

var A_CREW = [
  // who, x, scale, arms, flip (ground follows the hill crest)
  ['jack', 196, 0.9, 'crossed', false],
  ['chris', 1084, 0.9, 'down', true],
  ['tom', 322, 0.93, 'hips', false],
  ['sam', 952, 0.94, 'crossed', true],
  ['jared', 470, 0.97, 'down', false],
  ['daniela', 806, 1.0, 'hips', true],
  ['dario', 636, 1.07, 'hips', false]
];
function crestY(x) { return 652 + Math.pow((x - 640) / 900, 2) * 108; }

defineScene({
  id: 'anthropic',
  title: 'Anthropic',
  alt: 'At sunset the founders stand as rim-lit silhouettes on a hilltop; the word ANTHROPIC slams into the sky in a burst of light, then three glowing emblems appear: a heart for helpful, a check mark for honest, and a shield for harmless.',
  min: 7,
  lines: [
    'They named it Anthropic.',
    'Its mission: build AI that is helpful, honest, and harmless.'
  ],
  draw: function (c) {
    var t = c.t;
    var nm = c.since(0, 0.6);                    // "Anthropic"
    var L1 = c.since(1, 0);
    var tilt = eio(seg(L1, 0, 1.3));
    var dr = drift(t, 0.8), sk = shake(t, 0.8 * kick(nm, 0.5));
    var cam = { x: 640 + dr[0] + sk[0], y: 360 + dr[1] + sk[1] - 196 * tilt - 8 * settle(L1 - 1.3, 5), z: 1.0 + 0.03 * settle(t, 6), r: -0.008 };
    var sunP = [722, 606];

    // --- sky (it extends upward so the camera can tilt into it) ---
    pcam(cam, 0.35, function () {
      ctx.fillStyle = lin(0, -380, 0, 640, [[0, '#120f3a'], [0.32, '#3a2a78'], [0.58, '#9a4a8e'], [0.8, '#ff7a5e'], [1, '#ffc46b']]);
      ctx.fillRect(-500, -700, W + 1000, 1500);
      fade(0.7, function () { stars(73, 40, t, [-300, -420, W + 600, 300]); });
    });
    pcam(cam, 0.4, function () {
      bloom(sunP[0], sunP[1], 640, 'rgba(255,120,80,0.3)');
      var col = ['#d77890', '#6e3a80', '#ffd29a'], col2 = ['#ef9a8a', '#a0507e', '#fff0c0'];
      var cl = [[60, 390, 620, 56, 2, col2], [1180, 420, 700, 50, 6, col2], [300, 250, 520, 54, 12, col], [1000, 230, 640, 62, 18, col], [640, 80, 900, 56, 25, col], [-120, 120, 560, 56, 31, col]];
      for (var i = 0; i < cl.length; i++) bank(cl[i][0] + t * 5, cl[i][1], cl[i][2], cl[i][3], cl[i][4], cl[i][5]);
      ctx.fillStyle = 'rgba(255,190,140,0.55)'; ctx.beginPath(); ctx.ellipse(200, 500, 420, 4, 0, 0, Math.PI * 2); ctx.ellipse(1050, 520, 460, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    });
    pcam(cam, 0.45, function () {
      ctx.fillStyle = '#fff1c8'; ctx.beginPath(); ctx.arc(sunP[0], sunP[1], 70, 0, Math.PI * 2); ctx.fill();
      bloom(sunP[0], sunP[1], 220, 'rgba(255,220,160,0.75)');
    });
    var sun = [W / 2 + (sunP[0] - lerp(W / 2, cam.x, 0.45)) * (1 + (cam.z - 1) * 0.45), H / 2 + (sunP[1] - lerp(H / 2, cam.y, 0.45)) * (1 + (cam.z - 1) * 0.45)];
    rays(sun[0], sun[1], 30, 1500, Math.PI * 2, 'rgba(255,200,150,1)', 0.13 + 0.12 * kick(nm, 1.5), t * 0.5, -Math.PI / 2);

    // --- far hills and the valley haze ---
    pcam(cam, 0.55, function () {
      ctx.fillStyle = '#8a4a7a'; ctx.beginPath(); hillPath(560, 26, 1.3, -500, W + 500); ctx.fill();
      ctx.fillStyle = 'rgba(255,170,130,0.25)'; ctx.fillRect(-500, 556, W + 1000, 6);
      ctx.fillStyle = '#5a2c5e'; ctx.beginPath(); hillPath(600, 34, 4.1, -500, W + 500); ctx.fill();
    });
    // --- the hilltop with the founders ---
    pcam(cam, 1, function () {
      ctx.fillStyle = '#26132e'; ctx.beginPath();
      ctx.moveTo(-500, 1200); ctx.lineTo(-500, 760); ctx.quadraticCurveTo(200, 650, 640, 652); ctx.quadraticCurveTo(1080, 650, W + 500, 760); ctx.lineTo(W + 500, 1200); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,170,110,0.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-500, 760); ctx.quadraticCurveTo(200, 650, 640, 652); ctx.quadraticCurveTo(1080, 650, W + 500, 760); ctx.stroke();
      // grass tufts along the crest
      ctx.fillStyle = '#26132e'; ctx.beginPath();
      for (var g = 0; g < 70; g++) {
        var gx = -200 + g * 24 + hash(g, 1) * 12, gy = crestY(gx);
        var gh = 8 + hash(g, 2) * 16, sw = Math.sin(t * 2 + g) * 3;
        ctx.moveTo(gx - 3, gy + 2); ctx.lineTo(gx + sw, gy - gh); ctx.lineTo(gx + 3, gy + 2);
      }
      ctx.fill();
    });
    petals(83, 10, t, { color: 'rgba(255,196,150,0.75)', wind: 40 });
    // the founders as rim-lit silhouettes
    var wind = 0.45 + 0.5 * kick(nm, 1.2);
    silhouette(function (lift) {
      pcam(cam, 1, function () {
        ctx.translate(0, lift);
        for (var i = 0; i < A_CREW.length; i++) {
          var p = A_CREW[i];
          person(p[0], p[1], crestY(p[1]) + 4, p[2], { t: t + i * 0.37, arms: p[3], flip: p[4], wind: wind, expr: 'determined', look: [0, -0.2] });
        }
      });
    }, '#1c0f26', '#ffc98a');

    // --- the name ---
    var sk2 = seg(nm, 0, 0.55);
    if (nm > 0) {
      var bs = seg(nm, 0, 1.2);
      bloom(640, 150, 520 * eo(bs) + 80, 'rgba(255,190,130,0.55)', 1 - bs * 0.6);
      rays(640, 140, 24, 900, Math.PI * 2, 'rgba(255,240,210,1)', 0.25 * (1 - bs) + 0.05, t, 0);
    }
    var ty = lerp(168, 118, tilt), ts = lerp(1, 0.78, tilt);
    if (sk2 > 0) {
      at(640, ty, ts, 0, function () {
        slam('ANTHROPIC', 0, 0, 132, sk2, { color: '#ffffff', stroke: P.ink, sw: 20 });
      });
    }
    flash(0.55 * kick(nm, 0.3), '#fff3e0');

    // --- the mission: three emblems on the words ---
    var mk = seg(L1, 0.1, 0.6);
    if (mk > 0) fade(mk, function () { txt('THE MISSION', 640, 202, 22, { font: 'r', color: '#ffe6cc', stroke: P.ink, sw: 6, ls: 6 }); });
    var em = [['heart', 'HELPFUL', 0.52], ['check', 'HONEST', 0.66], ['shield', 'HARMLESS', 0.84]];
    for (var e = 0; e < 3; e++) emblem(em[e][0], 340 + e * 300, 284, seg(c.since(1, em[e][2]), 0, 0.9), t, em[e][1], e);

    vignette(0.45, 'rgba(16,6,26,1)');
  }
});
