/* =====================================================================
   kit.js — the anime rendering kit.
   Everything is drawn into a logical 1280 x 720 stage (W x H).
   Read src/API.md before using it from a scene or character file.

   Alpha rule: never assign ctx.globalAlpha = n. Multiply instead
   (ctx.globalAlpha *= n inside save/restore, or use fade(a, fn)) so the
   renderer's cross-fade between scenes keeps working.
   ===================================================================== */

var W = 1280, H = 720;
var ctx = null;          // current 2D context, set by the renderer before each draw
var NOW = 0;             // wall-clock seconds; keeps idle motion alive while paused
var REDUCED = false;     // prefers-reduced-motion
try { REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

var FONT_D = '"Dela Gothic One", "Arial Black", Impact, sans-serif';
var FONT_R = '"M PLUS Rounded 1c", "Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif';
// Canvas text never triggers font loading by itself, so load the faces up front.
function loadFonts() {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  return Promise.all(['48px "Dela Gothic One"', '500 24px "M PLUS Rounded 1c"', '800 24px "M PLUS Rounded 1c"'].map(function (f) { return document.fonts.load(f); })).catch(function () {});
}

/* ---------- palette ---------- */
var P = {
  ink: '#22182f', inkSoft: '#3d2f55', white: '#ffffff', cream: '#fff6ea',
  skin: '#ffe0cc', skinShade: '#f0b49b', skinDeep: '#cf8f72', blush: 'rgba(255,112,128,0.42)',
  claude: '#ff8a3d', claudeCore: '#ffe3a8', claudeDeep: '#e4572e', claudeGlow: 'rgba(255,138,61,',
  red: '#ff4d5e', orange: '#ff9a3c', yellow: '#ffd23f', green: '#3ddc97', teal: '#2ec4b6',
  blue: '#3a86ff', sky: '#8ecae6', indigo: '#4b3f9e', purple: '#9d4edd', pink: '#ff8fab',
  gray: '#9aa3b5', grayDk: '#5d6579', night: '#141a33',
  holo: '#7df9ff', holoDeep: '#2bb8d6'
};
var SKIES = {
  dawn:   ['#2b2d6e', '#8e5aa8', '#ff9e7a', '#ffd6a5'],
  sunset: ['#1d1b4f', '#6a3d8f', '#ff6f61', '#ffc46b'],
  golden: ['#3d5a99', '#8fb3e0', '#ffd59e', '#ffe8c2'],
  day:    ['#2f7fe0', '#6fb3f2', '#bfe3ff', '#eaf6ff'],
  night:  ['#070b1e', '#121a42', '#27306b', '#4a3f7a'],
  storm:  ['#141523', '#2a2c45', '#4a4766', '#6e5f7c'],
  lab:    ['#0b1028', '#131c45', '#1d2a63', '#2b3a80'],
  space:  ['#03040d', '#0a0f2c', '#1b1450', '#33176b']
};

/* ---------- math ---------- */
function clamp(v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return v > a ? (v < b ? v : b) : a; }
// progress of t through [a, a+d], 0..1; robust to Infinity / NaN (returns 0)
function seg(t, a, d) { var v = (t - a) / (d > 1e-6 ? d : 1e-6); return v > 0 ? (v < 1 ? v : 1) : 0; }
function lerp(a, b, u) { return a + (b - a) * u; }
function eo(x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); }
function ei(x) { x = clamp(x); return x * x * x; }
function eio(x) { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
function back(x) { if (!(x > 0)) return 0; if (x >= 1) return 1; var c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
function elastic(x) { if (!(x > 0)) return 0; if (x >= 1) return 1; return Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI / 3)) + 1; }
function pulse(t, speed) { return 0.5 + 0.5 * Math.sin(t * (speed || 2) * Math.PI); }
function hash(a, b) {
  var x = Math.imul((a | 0) ^ 0x9E3779B9, 0x85EBCA6B) ^ Math.imul((b | 0) + 0x632BE5AB, 0xC2B2AE35);
  x ^= x >>> 15; x = Math.imul(x, 0x2C1B3C6D); x ^= x >>> 12; x = Math.imul(x, 0x297A2D39); x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}
function pick(o, k, d) { return o && o[k] !== undefined ? o[k] : d; }
function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; var n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mix(c1, c2, u) {
  var a = hexToRgb(c1), b = hexToRgb(c2);
  return 'rgb(' + Math.round(lerp(a[0], b[0], u)) + ',' + Math.round(lerp(a[1], b[1], u)) + ',' + Math.round(lerp(a[2], b[2], u)) + ')';
}
function rgba(hex, a) { var c = hexToRgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

/* ---------- transforms ---------- */
function at(x, y, s, rot, fn, flip) {
  if (!(s > 0.001)) return;
  ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.scale(flip ? -s : s, s); fn(); ctx.restore();
}
function fade(a, fn) { if (!(a > 0.002)) return; ctx.save(); ctx.globalAlpha *= clamp(a); fn(); ctx.restore(); }
// Camera: frames the logical point (x, y) at screen centre with the given zoom and roll.
function camera(x, y, zoom, rot, fn) {
  ctx.save(); ctx.translate(W / 2, H / 2); if (rot) ctx.rotate(rot); ctx.scale(zoom, zoom); ctx.translate(-x, -y); fn(); ctx.restore();
}
// Smooth hand-held drift / impact shake. Returns [dx, dy].
function shake(t, k) { if (REDUCED || !(k > 0)) return [0, 0]; return [Math.sin(t * 47.3) * 9 * k + Math.sin(t * 13.1) * 4 * k, Math.cos(t * 39.7) * 7 * k + Math.sin(t * 17.9) * 3 * k]; }
function drift(t, amt) { if (REDUCED) return [0, 0]; amt = amt || 1; return [Math.sin(t * 0.35) * 6 * amt, Math.sin(t * 0.27 + 1) * 4 * amt]; }

/* ---------- paths ---------- */
function poly(pts) { ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
// Catmull-Rom spline through points as cubic beziers. closed: loop back to start.
function smooth(pts, closed, tension) {
  var n = pts.length, k = (tension === undefined ? 1 : tension) / 6;
  if (n < 2) return;
  ctx.moveTo(pts[0][0], pts[0][1]);
  var last = closed ? n : n - 1;
  for (var i = 0; i < last; i++) {
    var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    if (!closed) { if (i === 0) p0 = p1; if (i + 2 >= n) p3 = p2; }
    ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k, p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k, p2[0], p2[1]);
  }
  if (closed) ctx.closePath();
}
function rrect(x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

function fillWith(build, style) { ctx.beginPath(); build(); ctx.fillStyle = style; ctx.fill(); }
function inkWith(build, w, color) { ctx.beginPath(); build(); ctx.lineWidth = w; ctx.strokeStyle = color || P.ink; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
// Cel shading: flat base fill, a hard-edged shade shape clipped inside it, optional
// light (highlight) shape, then a clean ink outline.
// o: { shade, shadeBuild, light, lightBuild, line (outline width, 0 = none), ink }
function cel(build, base, o) {
  o = o || {};
  ctx.beginPath(); build(); ctx.fillStyle = base; ctx.fill();
  if ((o.shade && o.shadeBuild) || (o.light && o.lightBuild)) {
    ctx.save(); ctx.beginPath(); build(); ctx.clip();
    if (o.shade && o.shadeBuild) { ctx.beginPath(); o.shadeBuild(); ctx.fillStyle = o.shade; ctx.fill(); }
    if (o.light && o.lightBuild) { ctx.beginPath(); o.lightBuild(); ctx.fillStyle = o.light; ctx.fill(); }
    ctx.restore();
  }
  var lw = pick(o, 'line', 3);
  if (lw > 0) inkWith(build, lw, o.ink);
}

/* ---------- gradients ---------- */
function lin(x0, y0, x1, y1, stops) { var g = ctx.createLinearGradient(x0, y0, x1, y1); for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]); return g; }
function rad(x, y, r0, r1, stops) { var g = ctx.createRadialGradient(x, y, r0, x, y, r1); for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]); return g; }

/* ---------- skies and atmosphere ---------- */
// sky('sunset') or sky(['#top', '#upper', '#lower', '#horizon']); horizon: y where the last colour lands
function sky(name, horizon) {
  var c = typeof name === 'string' ? SKIES[name] : name, hz = horizon || H;
  ctx.fillStyle = lin(0, 0, 0, hz, [[0, c[0]], [0.4, c[1]], [0.78, c[2]], [1, c[3]]]);
  ctx.fillRect(-W, -H, W * 3, H * 3);
  if (hz < H) { ctx.fillStyle = c[3]; ctx.fillRect(-W, hz, W * 3, H * 2); }
}
// Blend between two named skies (u = 0..1)
function skyBlend(a, b, u, horizon) { var A = SKIES[a], B = SKIES[b]; sky([mix(A[0], B[0], u), mix(A[1], B[1], u), mix(A[2], B[2], u), mix(A[3], B[3], u)], horizon); }
function stars(seed, n, t, area) {
  area = area || [0, 0, W, H * 0.65];
  ctx.save(); ctx.fillStyle = '#ffffff';
  for (var i = 0; i < n; i++) {
    var x = area[0] + hash(seed, i) * area[2], y = area[1] + hash(seed + 1, i) * area[3];
    var tw = 0.35 + 0.65 * pulse(t * (0.6 + hash(seed + 2, i)) + i, 1);
    var r = 0.6 + hash(seed + 3, i) * 1.6;
    ctx.globalAlpha *= 1; ctx.save(); ctx.globalAlpha *= tw;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    if (r > 1.8) { ctx.globalAlpha *= 0.5; ctx.fillRect(x - r * 3, y - 0.5, r * 6, 1); ctx.fillRect(x - 0.5, y - r * 3, 1, r * 6); }
    ctx.restore();
  }
  ctx.restore();
}
function glow(x, y, r, color, a) {
  fade(a === undefined ? 1 : a, function () {
    ctx.fillStyle = rad(x, y, 0, r, [[0, color], [1, 'rgba(0,0,0,0)']]);
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  });
}
// Additive-looking glow using 'lighter' compositing.
function bloom(x, y, r, color, a) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y, r, color, a); ctx.restore();
}
function sun(x, y, r, color, a) {
  color = color || '#ffe7b0';
  bloom(x, y, r * 5, rgba('#ffb36b', 0.35), a);
  fade(a === undefined ? 1 : a, function () {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  });
  bloom(x, y, r * 1.8, 'rgba(255,240,200,0.6)', a);
}
function moon(x, y, r) {
  glow(x, y, r * 4, 'rgba(180,200,255,0.25)');
  ctx.fillStyle = '#f4f1ff'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(160,160,210,0.35)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.2, r * 0.22, 0, Math.PI * 2); ctx.arc(x + r * 0.25, y + r * 0.3, r * 0.15, 0, Math.PI * 2); ctx.fill();
}
// Anime cumulus: union of puffs, flat base, hard shade underneath, bright rim on top.
// o: { base, shade, rim, seed, puffs }
function cloud(x, y, s, o) {
  o = o || {};
  var seed = pick(o, 'seed', 7), n = pick(o, 'puffs', 7);
  var puffs = [];
  for (var i = 0; i < n; i++) {
    var u = n === 1 ? 0.5 : i / (n - 1);
    var px = (u - 0.5) * 260 + (hash(seed, i) - 0.5) * 30;
    var pr = 38 + Math.sin(u * Math.PI) * 46 + hash(seed + 1, i) * 18;
    var py = -Math.sin(u * Math.PI) * 30 - hash(seed + 2, i) * 16;
    puffs.push([px, py, pr]);
  }
  at(x, y, s, 0, function () {
    var build = function (dx, dy) { dx = dx || 0; dy = dy || 0; for (var i = 0; i < puffs.length; i++) { ctx.moveTo(puffs[i][0] + dx + puffs[i][2], puffs[i][1] + dy); ctx.arc(puffs[i][0] + dx, puffs[i][1] + dy, puffs[i][2], 0, Math.PI * 2); } ctx.rect(-150 + dx, -10 + dy, 300, 40); };
    ctx.save(); ctx.beginPath(); build(); ctx.clip();
    // rim light: paint the whole cloud in the rim colour, then cover it with the body shifted down-right
    ctx.fillStyle = o.rim === false ? (o.base || '#fff3f0') : (o.rim || 'rgba(255,255,255,0.95)'); ctx.fillRect(-320, -220, 640, 320);
    ctx.beginPath(); build(5, 7); ctx.fillStyle = o.base || '#fff3f0'; ctx.fill();
    ctx.beginPath(); for (var j = 0; j < puffs.length; j++) { ctx.moveTo(puffs[j][0] + 10 + puffs[j][2] * 0.92, puffs[j][1] + puffs[j][2] * 0.62); ctx.arc(puffs[j][0] + 10, puffs[j][1] + puffs[j][2] * 0.62, puffs[j][2] * 0.92, 0, Math.PI * 2); }
    ctx.fillStyle = o.shade || '#e7b8c8'; ctx.fill();
    ctx.fillStyle = o.shade2 || 'rgba(140,110,170,0.35)'; ctx.fillRect(-320, 16, 640, 40);
    ctx.restore();
  });
}
// Drifting row of clouds. tone: 'sunset' | 'day' | 'night' | 'golden' | 'storm'
var CLOUD_TONES = {
  sunset: { base: '#ffd1c1', shade: '#c97a9a', shade2: 'rgba(90,60,130,0.35)', rim: 'rgba(255,236,200,0.9)' },
  day: { base: '#ffffff', shade: '#cfe2f7', shade2: 'rgba(120,150,200,0.25)', rim: 'rgba(255,255,255,0.95)' },
  golden: { base: '#fff1d6', shade: '#f2b880', shade2: 'rgba(170,110,90,0.3)', rim: 'rgba(255,250,230,0.95)' },
  night: { base: '#3c3f78', shade: '#262a57', shade2: 'rgba(10,10,40,0.35)', rim: 'rgba(170,180,255,0.5)' },
  storm: { base: '#5b5873', shade: '#36344a', shade2: 'rgba(10,10,20,0.4)', rim: 'rgba(200,190,255,0.35)' },
  dawn: { base: '#ffd9cf', shade: '#b98fbf', shade2: 'rgba(80,60,140,0.3)', rim: 'rgba(255,240,215,0.9)' }
};
function cloudRow(y, seed, t, tone, scale, count) {
  var o = CLOUD_TONES[tone || 'day'], n = count || 4;
  for (var i = 0; i < n; i++) {
    var sp = 6 + hash(seed, i) * 10, s = (scale || 1) * (0.6 + hash(seed + 5, i) * 0.6);
    var span = W + 600, x = ((hash(seed + 9, i) * span + t * sp) % span) - 300;
    cloud(x, y + (hash(seed + 3, i) - 0.5) * 70, s, { base: o.base, shade: o.shade, shade2: o.shade2, rim: o.rim, seed: seed + i * 13 });
  }
}
// City skyline. o: { color, lit (window colour), seed, height, density, glow }
function city(y, o) {
  o = o || {};
  var seed = pick(o, 'seed', 3), col = o.color || '#2a2350', hmax = pick(o, 'height', 220), bw = pick(o, 'bw', 70);
  var x = -40, i = 0;
  while (x < W + 40) {
    var w = bw * (0.6 + hash(seed, i) * 0.9), h = hmax * (0.35 + hash(seed + 1, i) * 0.65);
    ctx.fillStyle = col; ctx.fillRect(x, y - h, w + 1, h + H);
    if (hash(seed + 7, i) > 0.7) { ctx.fillRect(x + w * 0.45, y - h - 26, 3, 26); }
    if (o.lit) {
      ctx.fillStyle = o.lit;
      for (var r = 0; r < h / 18 - 1; r++) for (var c = 0; c < w / 14 - 1; c++) {
        if (hash(seed + i * 31 + r, c) > (o.density || 0.62)) ctx.fillRect(x + 6 + c * 14, y - h + 10 + r * 18, 6, 8);
      }
    }
    if (o.rim) { ctx.fillStyle = o.rim; ctx.fillRect(x, y - h, w + 1, 3); }
    x += w + 2 + hash(seed + 2, i) * 10; i++;
  }
}
function ground(y, top, bottom) { ctx.fillStyle = lin(0, y, 0, H, [[0, top], [1, bottom || top]]); ctx.fillRect(-W, y, W * 3, H * 2); }
// God rays fanning out from (x, y).
function rays(x, y, n, len, spread, color, a, t, dir) {
  dir = dir === undefined ? Math.PI / 2 : dir;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= (a === undefined ? 0.25 : a);
  for (var i = 0; i < n; i++) {
    var ang = dir + (i / Math.max(1, n - 1) - 0.5) * spread + Math.sin((t || 0) * 0.5 + i * 1.7) * 0.02;
    var wdt = 0.025 + hash(11, i) * 0.04;
    ctx.fillStyle = lin(x, y, x + Math.cos(ang) * len, y + Math.sin(ang) * len, [[0, color], [1, 'rgba(0,0,0,0)']]);
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang - wdt) * len, y + Math.sin(ang - wdt) * len);
    ctx.lineTo(x + Math.cos(ang + wdt) * len, y + Math.sin(ang + wdt) * len);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
// Floating bokeh / dust motes. o: { colors, area, size, speed, a }
function bokeh(seed, n, t, o) {
  o = o || {};
  var area = o.area || [0, 0, W, H], cols = o.colors || ['rgba(255,220,170,0.5)', 'rgba(255,160,200,0.4)', 'rgba(170,200,255,0.4)'];
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var i = 0; i < n; i++) {
    var sp = (o.speed || 12) * (0.5 + hash(seed, i));
    var x = area[0] + ((hash(seed + 1, i) * area[2] + Math.sin(t * 0.3 + i) * 20) % area[2]);
    var y = area[1] + (((hash(seed + 2, i) * area[3] - t * sp) % area[3]) + area[3]) % area[3];
    var r = (o.size || 10) * (0.4 + hash(seed + 3, i) * 1.2);
    ctx.save(); ctx.globalAlpha *= (o.a || 1) * (0.4 + 0.6 * pulse(t * 0.5 + i, 1));
    ctx.fillStyle = rad(x, y, 0, r, [[0, cols[i % cols.length]], [1, 'rgba(0,0,0,0)']]);
    ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
  }
  ctx.restore();
}
// Drifting petals/leaves. o: { color, wind, area }
function petals(seed, n, t, o) {
  o = o || {};
  var col = o.color || '#ffc2d4', wind = pick(o, 'wind', 60);
  for (var i = 0; i < n; i++) {
    var span = W + 200, fall = 30 + hash(seed, i) * 40;
    var x = (((hash(seed + 1, i) * span + t * wind) % span) + span) % span - 100;
    var y = (((hash(seed + 2, i) * (H + 100) + t * fall) % (H + 100)) + H + 100) % (H + 100) - 50;
    var r = t * (1 + hash(seed + 3, i) * 2) + i;
    at(x + Math.sin(t + i) * 15, y, 1, r, function () {
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    });
  }
}
// Manga focus lines converging on (cx, cy). o: { n, inner, color, a, width }
function speedLines(cx, cy, t, o) {
  o = o || {};
  var n = o.n || 70, inner = o.inner || 230, outer = Math.hypot(W, H);
  ctx.save(); ctx.globalAlpha *= pick(o, 'a', 0.6); ctx.fillStyle = o.color || '#ffffff';
  var frame = REDUCED ? 0 : Math.floor(t * 12);
  for (var i = 0; i < n; i++) {
    var ang = (i / n) * Math.PI * 2 + (hash(frame, i) - 0.5) * 0.06;
    var r0 = inner * (0.8 + hash(frame + 1, i) * 0.6), wd = (o.width || 0.012) * (0.4 + hash(frame + 2, i));
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
    ctx.lineTo(cx + Math.cos(ang - wd) * outer, cy + Math.sin(ang - wd) * outer);
    ctx.lineTo(cx + Math.cos(ang + wd) * outer, cy + Math.sin(ang + wd) * outer);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
// Parallel motion streaks (horizontal by default) for fast movement.
function motionLines(t, o) {
  o = o || {};
  var ang = pick(o, 'angle', 0), n = o.n || 26, col = o.color || 'rgba(255,255,255,0.7)';
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(ang); ctx.fillStyle = col; ctx.globalAlpha *= pick(o, 'a', 0.5);
  for (var i = 0; i < n; i++) {
    var y = (hash(5, i) - 0.5) * H * 1.4, len = 200 + hash(6, i) * 500, sp = 1400 + hash(7, i) * 900;
    var x = (((hash(8, i) * 2400 - t * sp) % 2400) + 2400) % 2400 - 1200;
    ctx.fillRect(x, y, len, 2 + hash(9, i) * 3);
  }
  ctx.restore();
}
function sparkle(x, y, r, color, rot, a) {
  fade(a === undefined ? 1 : a, function () {
    at(x, y, 1, rot || 0, function () {
      ctx.fillStyle = color || '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -r); ctx.quadraticCurveTo(r * 0.12, -r * 0.12, r, 0); ctx.quadraticCurveTo(r * 0.12, r * 0.12, 0, r);
      ctx.quadraticCurveTo(-r * 0.12, r * 0.12, -r, 0); ctx.quadraticCurveTo(-r * 0.12, -r * 0.12, 0, -r); ctx.fill();
    });
  });
  bloom(x, y, r * 1.6, 'rgba(255,255,255,0.35)', a);
}
function sparkles(seed, n, t, area, color) {
  area = area || [0, 0, W, H];
  for (var i = 0; i < n; i++) {
    var ph = (t * (0.5 + hash(seed, i)) + hash(seed + 1, i)) % 1;
    var k = Math.sin(ph * Math.PI);
    sparkle(area[0] + hash(seed + 2, i) * area[2], area[1] + hash(seed + 3, i) * area[3], 4 + 10 * k * hash(seed + 4, i) + 3, color, 0, k);
  }
}
function lensFlare(x, y, k, angle) {
  if (!(k > 0)) return;
  angle = angle === undefined ? 0.5 : angle;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= clamp(k);
  glow(x, y, 220, 'rgba(255,220,170,0.55)');
  ctx.fillStyle = lin(x - 500, y, x + 500, y, [[0, 'rgba(255,200,150,0)'], [0.5, 'rgba(255,230,200,0.6)'], [1, 'rgba(255,200,150,0)']]);
  ctx.fillRect(x - 500, y - 1.5, 1000, 3);
  var cx = W / 2, cy = H / 2, dx = cx - x, dy = cy - y;
  var rings = [[0.5, 30, 'rgba(120,200,255,0.18)'], [0.9, 16, 'rgba(255,170,120,0.25)'], [1.3, 60, 'rgba(160,120,255,0.12)'], [1.7, 24, 'rgba(120,255,200,0.15)']];
  for (var i = 0; i < rings.length; i++) { var r = rings[i]; glow(x + dx * r[0] * 2, y + dy * r[0] * 2, r[1] * 2, r[2]); }
  ctx.restore();
}
function vignette(k, color) {
  ctx.save(); ctx.globalAlpha *= (k === undefined ? 0.55 : k);
  ctx.fillStyle = rad(W / 2, H / 2, H * 0.35, W * 0.75, [[0, 'rgba(0,0,0,0)'], [1, color || 'rgba(8,4,20,1)']]);
  ctx.fillRect(0, 0, W, H); ctx.restore();
}
function letterbox(k) { if (!(k > 0)) return; var h = 64 * clamp(k); ctx.fillStyle = '#05030b'; ctx.fillRect(0, 0, W, h); ctx.fillRect(0, H - h, W, h); }
function flash(k, color) { if (!(k > 0)) return; ctx.save(); ctx.globalAlpha *= clamp(k); ctx.fillStyle = color || '#ffffff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
// Tint the whole frame (e.g. sepia flashback, freeze-frame wash).
function tint(color, a) { ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = color; ctx.fillRect(-W, -H, W * 3, H * 3); ctx.restore(); }

/* ---------- text ---------- */
// o: { font: 'd' (display) | 'r' (rounded), weight, color, stroke, sw (stroke width), align, base, ls (letter spacing px), shadow, glowColor }
function txt(str, x, y, size, o) {
  o = o || {};
  var family = o.font === 'r' ? FONT_R : FONT_D, weight = o.weight || (o.font === 'r' ? 800 : 400);
  ctx.save();
  ctx.font = weight + ' ' + size + 'px ' + family;
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'alphabetic';
  if (o.ls) { try { ctx.letterSpacing = o.ls + 'px'; } catch (e) {} }
  if (o.glowColor) { ctx.shadowColor = o.glowColor; ctx.shadowBlur = size * 0.5; }
  if (o.shadow) { ctx.save(); ctx.fillStyle = o.shadow; ctx.shadowBlur = 0; ctx.fillText(str, x + size * 0.06, y + size * 0.07); ctx.restore(); }
  if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.sw || size * 0.16; ctx.strokeStyle = o.stroke; ctx.strokeText(str, x, y); }
  ctx.fillStyle = o.color || '#ffffff'; ctx.fillText(str, x, y);
  ctx.restore();
}
function txtWidth(str, size, o) {
  o = o || {};
  ctx.save(); ctx.font = (o.weight || (o.font === 'r' ? 800 : 400)) + ' ' + size + 'px ' + (o.font === 'r' ? FONT_R : FONT_D);
  if (o.ls) { try { ctx.letterSpacing = o.ls + 'px'; } catch (e) {} }
  var w = ctx.measureText(str).width; ctx.restore(); return w;
}
// Typewriter reveal: k = 0..1
function typeOn(str, x, y, size, k, o) { var n = Math.ceil(str.length * clamp(k) - 1e-6); if (n <= 0) return; txt(str.slice(0, n), x, y, size, o); }
// Impact title: scales down from big, lands with a white flash ring. k = 0..1 (use ~0.5 s)
function slam(str, x, y, size, k, o) {
  if (!(k > 0)) return;
  o = o || {};
  var s = k < 1 ? lerp(2.4, 1, eo(k / 0.6)) : 1, a = clamp(k / 0.25);
  var land = seg(k, 0.55, 0.45);
  at(x, y, s, (o.rot || 0) * (1 - eo(k)), function () {
    fade(a, function () {
      txt(str, 0, 0, size, { font: o.font || 'd', color: o.color || '#ffffff', stroke: o.stroke || P.ink, sw: o.sw || size * 0.18, shadow: o.shadow || 'rgba(0,0,0,0.35)', align: 'center', ls: o.ls, glowColor: o.glowColor });
    });
  });
  if (land > 0 && land < 1) fade(1 - land, function () { ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6 * (1 - land); ctx.beginPath(); ctx.ellipse(x, y - size * 0.35, size * 2 * (0.6 + land * 1.4), size * 0.8 * (0.6 + land * 1.4), 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); });
}
// Anime character-intro card. k = 0..1 entrance (keep it on screen by holding k at 1).
// o: { role, side: 'left'|'right', y, color, sub (small kicker text) }
function nameCard(name, k, o) {
  if (!(k > 0)) return;
  o = o || {};
  var left = o.side !== 'right', y = pick(o, 'y', 520), col = o.color || P.claude;
  var e = eo(k), slide = (1 - e) * (left ? -700 : 700);
  ctx.save();
  ctx.translate(slide, 0);
  // slanted colour band
  var bx = left ? -40 : W - 760;
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(bx, y - 66); ctx.lineTo(bx + 800, y - 66); ctx.lineTo(bx + 760, y + 40); ctx.lineTo(bx - 40, y + 40); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.ink; ctx.beginPath();
  ctx.moveTo(bx, y + 40); ctx.lineTo(bx + 760, y + 40); ctx.lineTo(bx + 746, y + 80); ctx.lineTo(bx - 14, y + 80); ctx.closePath(); ctx.fill();
  var tx = left ? 70 : W - 70, al = left ? 'left' : 'right';
  var ns = o.size || 64;
  txt(name, tx, y + 18, ns, { color: '#ffffff', stroke: P.ink, sw: ns * 0.14, align: al, shadow: 'rgba(0,0,0,0.3)' });
  if (o.role) txt(o.role, tx, y + 68, 21, { font: 'r', color: '#ffffff', align: al, ls: 2 });
  if (o.sub) txt(o.sub, tx, y - 78, 22, { font: 'r', color: col, stroke: P.ink, sw: 6, align: al, ls: 3 });
  ctx.restore();
}
// Time-skip badge in the top-right corner: big year on a slanted plate.
function yearBadge(str, k) {
  if (!(k > 0)) return;
  var e = back(k);
  at(W - 150, 66, e, -0.05, function () {
    ctx.fillStyle = P.ink; ctx.beginPath(); ctx.moveTo(-118, -40); ctx.lineTo(126, -40); ctx.lineTo(112, 42); ctx.lineTo(-132, 42); ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.claude; ctx.beginPath(); ctx.moveTo(-112, -34); ctx.lineTo(120, -34); ctx.lineTo(107, 36); ctx.lineTo(-126, 36); ctx.closePath(); ctx.fill();
    txt(str, 0, 18, 46, { color: '#ffffff', stroke: P.ink, sw: 8 });
  });
}
// Speech/caption bubble with a tail toward (tx, ty).
function speech(x, y, w, h, tx, ty, str, size, k, o) {
  if (!(k > 0)) return;
  o = o || {};
  var s = back(k);
  at(x, y, s, 0, function () {
    ctx.beginPath(); ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    var a = Math.atan2(ty - y, tx - x);
    ctx.moveTo(Math.cos(a - 0.25) * w / 2 * 0.9, Math.sin(a - 0.25) * h / 2 * 0.9);
    ctx.lineTo((tx - x) / s, (ty - y) / s);
    ctx.lineTo(Math.cos(a + 0.25) * w / 2 * 0.9, Math.sin(a + 0.25) * h / 2 * 0.9);
    ctx.fillStyle = o.fill || '#ffffff'; ctx.fill('nonzero');
    ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2); ctx.fillStyle = o.fill || '#ffffff'; ctx.fill();
    txt(str, 0, size * 0.36, size, { font: 'r', color: o.color || P.ink });
  });
}
// Futuristic translucent panel with corner brackets and scanlines (charts, data, holograms).
function holoPanel(x, y, w, h, k, o) {
  if (!(k > 0)) return;
  o = o || {};
  var col = o.color || P.holo, e = eo(k), hh = h * e;
  ctx.save();
  ctx.translate(0, (h - hh) / 2);
  ctx.fillStyle = o.fill || 'rgba(14,26,60,0.72)'; ctx.fillRect(x, y, w, hh);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, hh); ctx.clip();
  ctx.fillStyle = 'rgba(125,249,255,0.05)'; for (var sy = y; sy < y + hh; sy += 4) ctx.fillRect(x, sy, w, 1);
  ctx.restore();
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.globalAlpha *= 0.65; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, hh - 1); ctx.globalAlpha /= 0.65;
  ctx.lineWidth = 5; ctx.beginPath(); var c = 26;
  ctx.moveTo(x, y + c); ctx.lineTo(x, y); ctx.lineTo(x + c, y);
  ctx.moveTo(x + w - c, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + c);
  ctx.moveTo(x + w, y + hh - c); ctx.lineTo(x + w, y + hh); ctx.lineTo(x + w - c, y + hh);
  ctx.moveTo(x + c, y + hh); ctx.lineTo(x, y + hh); ctx.lineTo(x, y + hh - c);
  ctx.stroke();
  ctx.restore();
}

/* ---------- scene registry ---------- */
var SCENES = [];
// Each file in src/scenes/ calls defineScene({ id, title, alt, min, lines, draw(c) [, transition, poster, lead, tail, fadeIn] }).
function defineScene(s) { SCENES.push(s); }
