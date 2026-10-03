/* 06-pandemic: the first meetings. A laptop video call (3 x 2 tiles plus a
   self-view), then a slanted wipe to the founders around a picnic table in a
   sunny San Francisco park. */

function pcam(cam, d, fn) { camera(lerp(W / 2, cam.x, d), lerp(H / 2, cam.y, d), 1 + (cam.z - 1) * d, (cam.r || 0) * d, fn); }
function settle(s, tau) { return s > 0 ? 1 - Math.exp(-s / tau) : 0; }
function skyline(x0, x1, gy, o) {
  var seed = o.seed, x = x0, i = 0;
  ctx.beginPath();
  while (x < x1) {
    var w = (o.bw || 64) * (0.6 + hash(seed, i) * 0.9), h = o.height * (0.3 + hash(seed + 1, i) * 0.7);
    ctx.rect(x, gy - h, w + 1, h + 300);
    x += w + 2 + hash(seed + 2, i) * 8; i++;
  }
  ctx.fillStyle = o.color; ctx.fill();
}

/* ---------------- the video call ---------------- */
var V_SCREEN = [96, 40, 1088, 604];
var V_TILES = [
  // who, wall top, wall bottom, prop, expression, rim/lamp colour
  ['daniela', '#f0c4c2', '#cf929e', 'frame', 'smile'],
  ['dario', '#33406e', '#1d2448', 'shelf', 'smile'],
  ['jared', '#c4dcb8', '#8fb48a', 'board', 'thinking'],
  ['sam', '#d6ccf2', '#a495d6', 'blinds', 'grin'],
  ['tom', '#bcd8f2', '#86aedb', 'plant', 'smile'],
  ['chris', '#f6d6b4', '#dea880', 'poster', 'calm']
];
function vProp(kind, x, y, w, h, t) {
  ctx.save();
  if (kind === 'shelf') {
    bloom(x + w * 0.85, y + h * 0.3, 170, 'rgba(255,190,110,0.45)');
    ctx.fillStyle = '#151a36'; ctx.fillRect(x + 8, y + 18, 92, h);
    var cols = ['#7a4a5a', '#4a6a8a', '#a8834a', '#5a7a5a'];
    for (var r = 0; r < 3; r++) for (var b = 0; b < 6; b++) { ctx.fillStyle = cols[(r + b) % 4]; ctx.fillRect(x + 14 + b * 14, y + 30 + r * 52 + hash(r, b) * 10, 10, 40 - hash(r, b) * 10); }
  } else if (kind === 'frame') {
    ctx.fillStyle = '#fff3ea'; ctx.fillRect(x + w - 112, y + 30, 78, 58);
    ctx.fillStyle = '#9fc6e8'; ctx.fillRect(x + w - 106, y + 36, 66, 46);
    ctx.fillStyle = '#7fb07a'; ctx.beginPath(); ctx.moveTo(x + w - 106, y + 82); ctx.lineTo(x + w - 84, y + 58); ctx.lineTo(x + w - 64, y + 72); ctx.lineTo(x + w - 40, y + 50); ctx.lineTo(x + w - 40, y + 82); ctx.fill();
  } else if (kind === 'board') {
    ctx.fillStyle = '#f7fbff'; ctx.fillRect(x + 14, y + 24, 110, 76);
    ctx.strokeStyle = '#4a6fa5'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(x + 24, y + 86); ctx.lineTo(x + 50, y + 70); ctx.lineTo(x + 76, y + 56); ctx.lineTo(x + 112, y + 34);
    ctx.moveTo(x + 24, y + 40); ctx.lineTo(x + 60, y + 40); ctx.moveTo(x + 24, y + 50); ctx.lineTo(x + 48, y + 50); ctx.stroke();
  } else if (kind === 'blinds') {
    ctx.fillStyle = '#fff6e0'; ctx.fillRect(x + w - 120, y + 16, 96, 110);
    ctx.fillStyle = 'rgba(150,130,190,0.55)'; for (var s = 0; s < 9; s++) ctx.fillRect(x + w - 120, y + 20 + s * 12, 96, 6);
  } else if (kind === 'plant') {
    ctx.fillStyle = '#c47a52'; ctx.fillRect(x + w - 70, y + h - 70, 40, 50);
    ctx.fillStyle = '#4f9a5a';
    for (var l = 0; l < 6; l++) { ctx.beginPath(); ctx.ellipse(x + w - 50 + Math.cos(l * 1.1) * 22, y + h - 92 - Math.abs(Math.sin(l * 1.7)) * 30, 9, 24, l * 0.5 - 1.2, 0, Math.PI * 2); ctx.fill(); }
  } else if (kind === 'poster') {
    ctx.fillStyle = '#2b2f55'; ctx.fillRect(x + 18, y + 24, 84, 100);
    ctx.strokeStyle = '#7df9ff'; ctx.lineWidth = 1.5; ctx.beginPath();
    var pts = [[36, 50], [60, 40], [84, 58], [44, 84], [76, 96], [60, 70]];
    for (var a = 0; a < pts.length; a++) for (var q = a + 1; q < pts.length; q++) if ((a + q) % 2) { ctx.moveTo(x + pts[a][0], y + pts[a][1]); ctx.lineTo(x + pts[q][0], y + pts[q][1]); }
    ctx.stroke(); ctx.fillStyle = '#ffd23f'; for (var p = 0; p < pts.length; p++) { ctx.beginPath(); ctx.arc(x + pts[p][0], y + pts[p][1], 3.5, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}
function micIcon(x, y, r, muted) {
  ctx.fillStyle = muted ? '#ff4d5e' : 'rgba(20,22,40,0.65)';
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); rrect(x - r * 0.22, y - r * 0.55, r * 0.44, r * 0.72, r * 0.22); ctx.fill();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1.5, r * 0.12); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y - r * 0.05, r * 0.38, 0.15 * Math.PI, 0.85 * Math.PI); ctx.moveTo(x, y + r * 0.33); ctx.lineTo(x, y + r * 0.55); ctx.stroke();
  if (muted) { ctx.beginPath(); ctx.moveTo(x - r * 0.5, y - r * 0.55); ctx.lineTo(x + r * 0.5, y + r * 0.55); ctx.stroke(); }
}
function vTile(i, x, y, w, h, t, speaking) {
  var d = V_TILES[i];
  ctx.save();
  ctx.beginPath(); rrect(x, y, w, h, 12); ctx.clip();
  ctx.fillStyle = lin(0, y, 0, y + h, [[0, d[1]], [1, d[2]]]); ctx.fillRect(x, y, w, h);
  vProp(d[3], x, y, w, h, t);
  var nod = Math.sin(t * 1.7 + i * 2.1) * 2;
  bust(d[0], x + w / 2 + (i % 2 ? 12 : -10), y + h + 10 + nod, 0.46, {
    t: t + i * 0.7, expr: d[4], talk: !!speaking, look: [Math.sin(t * 0.4 + i) * 0.15, 0.05], turn: (i % 3 - 1) * 0.15,
    rim: speaking ? '#ffc070' : '#ffffff', light: speaking ? 0.6 : 0.25
  });
  // name pill
  var nm = d[0].charAt(0).toUpperCase() + d[0].slice(1);
  var nw = txtWidth(nm, 15, { font: 'r' }) + (speaking ? 46 : 22);
  ctx.fillStyle = 'rgba(14,16,32,0.62)'; ctx.beginPath(); rrect(x + 10, y + h - 34, nw, 24, 7); ctx.fill();
  txt(nm, x + 21, y + h - 16, 15, { font: 'r', align: 'left', color: '#ffffff' });
  if (speaking) {
    ctx.fillStyle = '#ffb26b';
    for (var b = 0; b < 3; b++) { var bh = 5 + 9 * pulse(t * 2.3 + b * 0.37, 2.2); ctx.fillRect(x + nw - 17 + b * 6, y + h - 22 - bh / 2, 3.5, bh); }
  }
  if (d[0] === 'tom' || d[0] === 'chris') {
    ctx.fillStyle = 'rgba(14,16,32,0.62)'; ctx.beginPath(); rrect(x + w - 100, y + 13, 70, 22, 11); ctx.fill();
    txt('MUTED', x + w - 70, y + 29, 12, { font: 'r', color: '#ffd0d4', ls: 1.5 });
    micIcon(x + w - 26, y + 24, 14, true);
  }
  ctx.restore();
  if (speaking) {
    ctx.save(); ctx.strokeStyle = '#ff9a4a'; ctx.lineWidth = 4; ctx.beginPath(); rrect(x + 1, y + 1, w - 2, h - 2, 12); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 0.35 + 0.25 * pulse(t, 1.2); ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(255,150,70,0.6)'; ctx.stroke(); ctx.restore();
  }
}
function vCall(t) {
  var sx = V_SCREEN[0], sy = V_SCREEN[1], sw = V_SCREEN[2], sh = V_SCREEN[3];
  // the room behind the laptop: night, a soft lamp and city bokeh
  ctx.fillStyle = lin(0, -200, 0, 900, [[0, '#0d1030'], [1, '#1d1838']]); ctx.fillRect(-400, -300, W + 800, H + 600);
  bokeh(61, 14, t, { colors: ['rgba(255,190,120,0.55)', 'rgba(120,170,255,0.45)'], area: [-200, -120, W + 400, 320], size: 36, speed: 2, a: 0.8 });
  bloom(-40, 120, 420, 'rgba(255,170,90,0.35)');
  // lid, bezel and keyboard deck
  ctx.fillStyle = '#1b1d27'; ctx.beginPath(); rrect(sx - 20, sy - 20, sw + 40, sh + 44, 24); ctx.fill();
  ctx.strokeStyle = 'rgba(190,200,230,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); rrect(sx - 19, sy - 19, sw + 38, sh + 42, 23); ctx.stroke();
  ctx.fillStyle = '#2b2e3a'; ctx.beginPath(); poly([[sx - 60, sy + sh + 26], [sx + sw + 60, sy + sh + 26], [sx + sw + 180, H + 160], [sx - 180, H + 160]]); ctx.fill();
  ctx.fillStyle = 'rgba(200,210,240,0.25)'; ctx.fillRect(sx - 60, sy + sh + 26, sw + 120, 2);
  ctx.fillStyle = '#0c0e14'; ctx.beginPath(); rrect(sx + sw / 2 - 9, sy - 14, 18, 8, 4); ctx.fill();
  // screen
  ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, sw, sh); ctx.clip();
  ctx.fillStyle = '#121527'; ctx.fillRect(sx, sy, sw, sh);
  // top bar
  ctx.fillStyle = '#1b1f36'; ctx.fillRect(sx, sy, sw, 42);
  ctx.fillStyle = '#4a5072'; for (var d = 0; d < 3; d++) { ctx.beginPath(); ctx.arc(sx + 22 + d * 18, sy + 21, 6, 0, Math.PI * 2); ctx.fill(); }
  txt('founders call', sx + sw / 2, sy + 27, 16, { font: 'r', color: '#aab1d6' });
  var secs = 2537 + Math.floor(t), tm = '00:' + ('0' + Math.floor(secs / 60) % 60).slice(-2) + ':' + ('0' + secs % 60).slice(-2);
  fade(0.6 + 0.4 * pulse(t, 1), function () { ctx.fillStyle = '#ff4d5e'; ctx.beginPath(); ctx.arc(sx + sw - 104, sy + 21, 6, 0, Math.PI * 2); ctx.fill(); });
  txt(tm, sx + sw - 92, sy + 27, 16, { font: 'r', align: 'left', color: '#d6daf2' });
  // tiles
  var gx = sx + 16, gy = sy + 54, tw = (sw - 32 - 24) / 3, th = (sh - 54 - 70 - 12) / 2;
  for (var i = 0; i < 6; i++) vTile(i, gx + (i % 3) * (tw + 12), gy + Math.floor(i / 3) * (th + 12), tw, th, t, i === 1);
  // self view (Jack), floating bottom right
  var px = sx + sw - 196, py = gy + 2 * th + 12 - 112;
  ctx.save(); ctx.beginPath(); rrect(px, py, 170, 102, 10); ctx.clip();
  ctx.fillStyle = lin(0, py, 0, py + 102, [[0, '#cfd6e6'], [1, '#9eabc8']]); ctx.fillRect(px, py, 170, 102);
  bust('jack', px + 85, py + 108, 0.25, { t: t + 3, expr: 'smile', look: [0, 0.1] });
  ctx.restore();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); rrect(px, py, 170, 102, 10); ctx.stroke();
  ctx.fillStyle = 'rgba(14,16,32,0.62)'; ctx.beginPath(); rrect(px + 8, py + 74, 44, 20, 6); ctx.fill();
  txt('You', px + 30, py + 89, 13, { font: 'r', color: '#ffffff' });
  // control bar
  var by = sy + sh - 36;
  micIcon(sx + sw / 2 - 120, by, 20, false);
  ctx.fillStyle = 'rgba(60,66,100,0.9)'; ctx.beginPath(); ctx.arc(sx + sw / 2 - 60, by, 20, 0, Math.PI * 2); ctx.arc(sx + sw / 2, by, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); rrect(sx + sw / 2 - 71, by - 7, 16, 14, 3); ctx.moveTo(sx + sw / 2 - 55, by - 2); ctx.lineTo(sx + sw / 2 - 48, by - 7); ctx.lineTo(sx + sw / 2 - 48, by + 7); ctx.lineTo(sx + sw / 2 - 55, by + 2); ctx.fill();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.beginPath(); rrect(sx + sw / 2 - 10, by - 8, 20, 14, 2); ctx.moveTo(sx + sw / 2, by - 2); ctx.lineTo(sx + sw / 2, by - 14); ctx.stroke();
  ctx.fillStyle = '#e5384a'; ctx.beginPath(); rrect(sx + sw / 2 + 44, by - 18, 76, 36, 18); ctx.fill();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(sx + sw / 2 + 66, by + 3); ctx.quadraticCurveTo(sx + sw / 2 + 82, by - 9, sx + sw / 2 + 98, by + 3); ctx.stroke();
  // cursor drifting toward the mic button, with a little click ripple
  var cu = eio(seg(t, 0.6, 3.2));
  var cx = lerp(sx + sw * 0.72, sx + sw / 2 - 112, cu) + Math.sin(t * 0.9) * 6, cy = lerp(sy + sh * 0.55, by + 8, cu) + Math.cos(t * 0.7) * 4;
  var clk = seg(t, 3.4, 0.5);
  if (clk > 0 && clk < 1) { ctx.strokeStyle = 'rgba(255,255,255,' + (0.8 * (1 - clk)) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 8 + 22 * clk, 0, Math.PI * 2); ctx.stroke(); }
  at(cx, cy, 1, 0, function () {
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 26); ctx.lineTo(7, 20); ctx.lineTo(12, 31); ctx.lineTo(17, 29); ctx.lineTo(12, 18); ctx.lineTo(21, 18); ctx.closePath();
    ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = P.ink; ctx.stroke();
  });
  // glass glare
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = lin(sx, sy, sx + 500, sy + 500, [[0, 'rgba(255,255,255,0.07)'], [0.5, 'rgba(255,255,255,0.02)'], [1, 'rgba(255,255,255,0)']]);
  ctx.beginPath(); poly([[sx, sy], [sx + 620, sy], [sx + 120, sy + sh], [sx, sy + sh]]); ctx.fill();
  ctx.restore();
}

function vMug(x, y, t) {
  at(x, y, 1.2, 0, function () {
    cel(function () { rrect(-62, -150, 124, 150, 18); }, '#f2e6dc', {
      shade: '#c9b6aa', shadeBuild: function () { ctx.rect(14, -160, 70, 170); },
      light: '#ffffff', lightBuild: function () { ctx.rect(-48, -140, 14, 120); }, line: 4
    });
    inkWith(function () { ctx.arc(66, -80, 30, -Math.PI / 2, Math.PI / 2); }, 16, P.ink);
    inkWith(function () { ctx.arc(66, -80, 30, -Math.PI / 2, Math.PI / 2); }, 9, '#d8c8bc');
    cel(function () { ctx.ellipse(0, -150, 62, 12, 0, 0, Math.PI * 2); }, '#5a3626', { line: 3 });
    ctx.fillStyle = 'rgba(255,140,60,0.9)'; ctx.fillRect(-62, -96, 124, 10);
    // steam
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (var i = 0; i < 2; i++) {
      var ph = (t * 0.45 + i * 0.5) % 1, sx = -18 + i * 30;
      ctx.save(); ctx.globalAlpha *= Math.sin(ph * Math.PI);
      ctx.beginPath(); ctx.moveTo(sx, -170 - ph * 40);
      ctx.bezierCurveTo(sx + 18, -200 - ph * 60, sx - 18, -230 - ph * 70, sx + 6, -270 - ph * 80); ctx.stroke(); ctx.restore();
    }
  }, true);
}

/* ---------------- the park ---------------- */
function pTree(x, y, s, seed, t) {
  var puffs = [];
  for (var i = 0; i < 9; i++) puffs.push([(hash(seed, i) - 0.5) * 360, -hash(seed + 1, i) * 260, 70 + hash(seed + 2, i) * 60]);
  var sway = Math.sin(t * 0.8 + seed) * 4;
  at(x, y, s, 0, function () {
    ctx.fillStyle = '#3b2a26'; ctx.beginPath(); poly([[-22, 0], [22, 0], [12, -300], [-8, -300]]); ctx.fill();
    ctx.strokeStyle = '#3b2a26'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -200); ctx.lineTo(-70, -300); ctx.moveTo(4, -230); ctx.lineTo(80, -330); ctx.stroke();
    ctx.fillStyle = 'rgba(255,220,150,0.6)'; ctx.fillRect(14, -300, 6, 300);
    var build = function (dx, dy, k) { for (var j = 0; j < puffs.length; j++) { var p = puffs[j]; ctx.moveTo(p[0] + dx + sway + p[2] * k, p[1] - 300 + dy); ctx.arc(p[0] + dx + sway, p[1] - 300 + dy, p[2] * k, 0, Math.PI * 2); } };
    ctx.save(); ctx.beginPath(); build(0, 0, 1); ctx.clip();
    ctx.fillStyle = '#eef7a0'; ctx.fillRect(-500, -800, 1000, 800);              // rim (sun upper right)
    ctx.fillStyle = '#5fae5a'; ctx.beginPath(); build(-8, 8, 1); ctx.fill();     // body
    ctx.fillStyle = '#3d8a4c'; ctx.beginPath(); build(-26, 34, 0.86); ctx.fill(); // cel shade
    ctx.fillStyle = '#2a6a42'; ctx.beginPath(); build(-40, 60, 0.7); ctx.fill();
    ctx.restore();
  });
}
function pCup(x, y, s, col) {
  at(x, y, s, 0, function () {
    cel(function () { poly([[-12, -34], [12, -34], [9, 0], [-9, 0]]); }, '#fff8ee', { shade: '#e6d6c6', shadeBuild: function () { ctx.rect(-14, -34, 9, 40); }, line: 2 });
    cel(function () { poly([[-11, -24], [11, -24], [10, -12], [-10, -12]]); }, col, { line: 0 });
    cel(function () { rrect(-14, -40, 28, 7, 3); }, '#ffffff', { line: 2 });
  });
}
function pLaptop(x, y, s, flip, t) {
  // seen from behind at an angle: the silver back of the lid and a sliver of the base
  at(x, y, s, 0, function () {
    glow(-40, -34, 60, 'rgba(170,225,255,0.35)');
    cel(function () { poly([[-44, 0], [30, 0], [42, -10], [-32, -10]]); }, '#9ca3b4', { line: 2 });
    cel(function () { ctx.moveTo(-30, -10); ctx.lineTo(40, -10); ctx.lineTo(30, -72); ctx.quadraticCurveTo(29, -76, 24, -76); ctx.lineTo(-38, -76); ctx.quadraticCurveTo(-42, -76, -42, -71); ctx.closePath(); },
      '#dfe3ec', { shade: '#b9bfcd', shadeBuild: function () { poly([[10, -10], [40, -10], [30, -76], [2, -76]]); }, line: 2.5 });
    ctx.fillStyle = 'rgba(160,220,255,0.9)'; ctx.fillRect(-41, -70, 2.5, 58);
  }, flip);
}
var P_HZ = 344;
function park(t, cam) {
  pcam(cam, 0.08, function () {
    sky(['#3a7bd2', '#7fbcf0', '#ffe2ae', '#fff1d4'], P_HZ + 10);
    bloom(1150, 30, 560, 'rgba(255,214,140,0.45)');
    var cl = { base: '#ffffff', shade: '#d7e6f7', shade2: 'rgba(120,150,200,0.2)', rim: 'rgba(255,246,220,1)' };
    cloud(520 + t * 6, 96, 0.5, { base: cl.base, shade: cl.shade, shade2: cl.shade2, rim: cl.rim, seed: 4 });
    cloud(780 + t * 5, 170, 0.34, { base: cl.base, shade: cl.shade, shade2: cl.shade2, rim: cl.rim, seed: 9 });
  });
  pcam(cam, 0.2, function () {
    ctx.fillStyle = '#a9bfe0'; ctx.beginPath(); ctx.moveTo(-300, P_HZ + 20);
    var hp = [[-300, 300], [60, 270], [380, 296], [700, 262], [1040, 288], [1600, 270]];
    for (var i = 0; i < hp.length; i++) ctx.lineTo(hp[i][0], hp[i][1]);
    ctx.lineTo(1600, P_HZ + 40); ctx.lineTo(-300, P_HZ + 40); ctx.fill();
    skyline(260, 1180, P_HZ + 4, { seed: 21, color: '#8fa5cd', height: 92, bw: 42 });
    // a slim pyramid tower marks the city
    ctx.fillStyle = '#8fa5cd'; ctx.beginPath(); poly([[876, P_HZ + 4], [906, P_HZ - 196], [936, P_HZ + 4]]); ctx.fill(); ctx.fillRect(904.5, P_HZ - 222, 3, 28);
    ctx.fillStyle = 'rgba(255,250,232,0.85)'; ctx.beginPath(); poly([[906, P_HZ - 196], [936, P_HZ + 4], [929, P_HZ + 4]]); ctx.fill();
  });
  pcam(cam, 0.35, function () {
    ctx.fillStyle = '#5e9a6a'; ctx.beginPath();
    for (var i = 0; i < 26; i++) { var bx = -260 + i * 72, r = 26 + hash(i, 3) * 22; ctx.moveTo(bx + r, P_HZ + 14); ctx.arc(bx, P_HZ + 14, r, 0, Math.PI * 2); }
    ctx.fill();
    ctx.fillStyle = 'rgba(255,250,200,0.5)'; ctx.fillRect(-300, P_HZ + 2, W + 600, 2);
  });
  pcam(cam, 0.5, function () {
    ctx.fillStyle = lin(0, P_HZ, 0, 760, [[0, '#acd66e'], [0.3, '#80bd58'], [1, '#3f7f3e']]); ctx.fillRect(-400, P_HZ + 18, W + 800, 600);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,240,170,0.15)';
    ctx.beginPath(); for (var j = 0; j < 10; j++) { ctx.moveTo(-100 + j * 160 + 90, 420 + hash(j, 9) * 220); ctx.ellipse(-100 + j * 160 + hash(j, 8) * 60, 420 + hash(j, 9) * 220, 60 + hash(j, 7) * 50, 10 + hash(j, 6) * 10, 0, 0, Math.PI * 2); } ctx.fill(); ctx.restore();
    ctx.fillStyle = 'rgba(30,70,40,0.28)'; ctx.beginPath(); ctx.ellipse(110, 560, 300, 46, 0, 0, Math.PI * 2); ctx.ellipse(1230, 540, 280, 40, 0, 0, Math.PI * 2); ctx.fill();
  });
  pcam(cam, 0.62, function () { pTree(40, 560, 1.15, 3, t); pTree(1260, 540, 1.1, 8, t); });
  rays(1180, -60, 9, 1300, 0.95, 'rgba(255,240,190,1)', 0.13 + 0.03 * pulse(t, 0.3), t, 2.15);
}

function parkCrew(t, talk) {
  // the table runs away from us: far end near the middle of the frame, near end below it
  var far = 482, near = 790, fl = 552, fr = 728, nl = 236, nr = 1044;
  var shadow = 'rgba(30,60,30,0.3)';
  ctx.fillStyle = shadow; ctx.beginPath(); poly([[fl - 30, far + 40], [fr + 30, far + 40], [nr + 60, near + 60], [nl - 60, near + 60]]); ctx.fill();
  // far end and far sides first, the table, then the middle sitters, then Dario and Daniela up front
  bust('jack', 640, 516, 0.5, { t: t + 1, expr: 'smile', look: [0, 0.1], rim: '#fff0b0', light: 0.5 });
  bust('tom', 470, 572, 0.56, { t: t + 2, expr: 'grin', turn: 0.5, look: [0.6, 0], rim: '#fff0b0', light: 0.5 });
  bust('chris', 812, 574, 0.56, { t: t + 4, expr: 'smile', turn: 0.5, look: [-0.6, 0], flip: true, rim: '#fff0b0', light: 0.5 });
  // tabletop with a hard cel shade on the shadow side and a sunlit right edge
  cel(function () { poly([[fl, far], [fr, far], [nr, near], [nl, near]]); }, '#b98252', {
    shade: '#946240', shadeBuild: function () { poly([[fl, far], [fl + 40, far], [nl + 150, near], [nl, near]]); }, line: 3
  });
  ctx.fillStyle = '#7a4c32'; ctx.beginPath(); poly([[fl, far], [fr, far], [fr, far + 10], [fl, far + 10]]); ctx.fill();
  ctx.strokeStyle = 'rgba(100,58,34,0.45)'; ctx.lineWidth = 2; ctx.beginPath();
  for (var k = 1; k < 5; k++) { ctx.moveTo(lerp(fl, fr, k / 5), far); ctx.lineTo(lerp(nl, nr, k / 5), near); }
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,236,190,0.7)'; ctx.beginPath(); poly([[fr, far], [fr + 5, far], [nr + 8, near], [nr, near]]); ctx.fill();
  // things on the table
  pLaptop(586, 560, 0.85, false, t); pLaptop(694, 560, 0.85, true, t);
  pCup(632, 526, 0.62, '#c07a4a'); pCup(744, 600, 0.8, '#4a8ac0');
  ctx.fillStyle = '#fffaf0'; ctx.beginPath(); poly([[520, 640], [600, 628], [612, 668], [530, 682]]); ctx.fill();
  ctx.strokeStyle = 'rgba(80,90,140,0.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(536, 646); ctx.lineTo(590, 638); ctx.moveTo(538, 656); ctx.lineTo(580, 650); ctx.moveTo(540, 666); ctx.lineTo(596, 657); ctx.stroke();
  bust('jared', 372, 684, 0.74, { t: t + 5, expr: 'smile', turn: 0.5, look: [0.6, 0], rim: '#fff0b0', light: 0.6 });
  bust('sam', 908, 688, 0.74, { t: t + 6, expr: 'grin', turn: 0.5, look: [-0.6, 0], flip: true, rim: '#fff0b0', light: 0.6 });
  pLaptop(470, 700, 1.15, false, t); pCup(812, 690, 1.0, '#c07a4a');
  bust('dario', 196, 846, 1.16, { t: t, expr: 'smile', talk: talk, turn: 0.45, look: [0.5, -0.05], rim: '#ffe6a0', light: 0.8, wind: 0.25 });
  bust('daniela', 1088, 852, 1.1, { t: t + 0.5, expr: 'grin', turn: 0.45, look: [-0.5, -0.05], flip: true, rim: '#ffe6a0', light: 0.8, wind: 0.25 });
}

defineScene({
  id: 'pandemic',
  title: 'First Meetings',
  alt: 'A laptop video call with six founders in tiles and a seventh in the self-view; then a slanted wipe to the seven founders laughing and talking around a picnic table in a sunny San Francisco park.',
  min: 8,
  lines: [
    'It was the pandemic, so the first meetings happened on video calls,',
    'and outdoors, in San Francisco parks.'
  ],
  draw: function (c) {
    var t = c.t;
    var L1 = c.since(1, 0);
    var wipe = eio(seg(L1, 0, 0.6));
    var dr = drift(t, 0.7);
    if (wipe < 1) {
      var pu = eio(seg(t, 0.2, 5.2));
      var cam = { x: lerp(640, 640, pu) + dr[0], y: lerp(352, 300, pu) + dr[1], z: lerp(1.0, 1.14, pu) + 0.04 * seg(L1, 0, 0.6), r: lerp(-0.02, -0.008, pu) };
      pcam(cam, 1, function () { vCall(t); });
      // a mug of coffee in the foreground, nearer than the laptop
      pcam(cam, 1.35, function () { vMug(132, 772, t); });
      vignette(0.5, 'rgba(4,4,16,1)');
    }
    if (wipe > 0) {
      var x = lerp(-260, W + 300, wipe);
      ctx.save();
      ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(x + 160, -10); ctx.lineTo(x - 160, H + 10); ctx.lineTo(-10, H + 10); ctx.closePath(); ctx.clip();
      var ps = settle(L1, 4);
      var pc = { x: 610 + 50 * ps + dr[0], y: 356 + dr[1], z: 1.0 + 0.05 * ps, r: 0 };
      park(t, pc);
      pcam(pc, 1, function () { parkCrew(t, true); });
      petals(43, 12, t, { color: '#9fd36a', wind: 50 });
      petals(47, 8, t * 0.9, { color: '#ffd36b', wind: 40 });
      bokeh(9, 10, t, { colors: ['rgba(255,240,180,0.5)', 'rgba(220,255,200,0.4)'], size: 26, speed: 5, a: 0.6 });
      vignette(0.3, 'rgba(30,40,20,1)');
      // location caption
      var lk = eo(seg(L1, 0.7, 0.6));
      if (lk > 0) {
        fade(lk, function () {
          at(60 - 30 * (1 - lk), 64, 1, 0, function () {
            ctx.fillStyle = P.ink; ctx.beginPath(); poly([[0, -26], [258, -26], [248, 14], [-10, 14]]); ctx.fill();
            ctx.fillStyle = P.claude; ctx.fillRect(0, -26, 8, 40);
            txt('SAN FRANCISCO', 22, 3, 22, { font: 'r', align: 'left', color: '#ffffff', ls: 3 });
          });
        });
      }
      ctx.restore();
      if (wipe < 1) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(255,236,190,0.95)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x + 160, -10); ctx.lineTo(x - 160, H + 10); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,170,90,0.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 190, -10); ctx.lineTo(x - 130, H + 10); ctx.stroke();
        ctx.restore();
      }
    }
  }
});
