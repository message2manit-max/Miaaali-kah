/* 12-mind: interpretability (2024). The camera dives into Claude's glowing core and
   through it into a galaxy of tiny connected "ideas"; clusters light up, and one node
   blooms into the Golden Gate Bridge over sea fog while Chris watches, amazed. */

var MD_COLS = ['#ffb347', '#ff6fb5', '#7df9ff', '#b49bff', '#5dffb0', '#ffd23f', '#6fb6ff', '#ff8a5c'];
var MD_NODE = [842, 424];          // the Golden Gate feature node (shot-2 world coords)

// ---------- the mind: a few hundred nodes in 3D, built once ----------
var MD = (function () {
  var NC = 8, cl = [], nodes = [], links = [];
  var CU = [[-0.56, -0.46], [-0.06, -0.58], [0.46, -0.52], [-0.74, 0.12], [0.64, 0.02], [-0.36, 0.5], [0.24, 0.5], [0.08, -0.06]];
  for (var k = 0; k < NC; k++) cl.push({ u: CU[k][0], v: CU[k][1], z: 1.6 + hash(73, k) * 1.4, col: MD_COLS[k] });
  for (var i = 0; i < 380; i++) {
    var g = i % 10, n, z;
    if (g < NC) {
      var C = cl[g];
      var gu = (hash(81, i) + hash(82, i) + hash(83, i) - 1.5) * 0.22;
      var gv = (hash(84, i) + hash(85, i) + hash(86, i) - 1.5) * 0.19;
      z = C.z + (hash(87, i) - 0.5) * 0.6;
      n = { x: (C.u + gu) * 1.55 * z, y: (C.v + gv) * 0.88 * z, z: z, k: g, r: Math.min(1, Math.hypot(gu, gv) * 3) };
    } else {
      z = 0.7 + hash(88, i) * 3.6;
      n = { x: (hash(89, i) - 0.5) * 2.5 * 1.55 * z, y: (hash(90, i) - 0.5) * 2.5 * 0.88 * z, z: z, k: -1, r: hash(93, i) };
    }
    n.tw = hash(91, i) * 6.28; n.sz = 0.7 + hash(92, i) * 0.9;
    nodes.push(n);
  }
  // links: each node to its nearest neighbours in the same group
  for (var a = 0; a < nodes.length; a++) {
    var best = [[1e9, -1], [1e9, -1]], A = nodes[a];
    for (var b = 0; b < nodes.length; b++) {
      if (b === a || nodes[b].k !== A.k) continue;
      var B = nodes[b], dd = (A.x - B.x) * (A.x - B.x) + (A.y - B.y) * (A.y - B.y) + (A.z - B.z) * (A.z - B.z) * 2;
      if (dd < best[0][0]) { best[1] = best[0]; best[0] = [dd, b]; } else if (dd < best[1][0]) best[1] = [dd, b];
    }
    for (var q = 0; q < (A.k < 0 ? 1 : 2); q++) if (best[q][1] > a || (best[q][1] >= 0 && q === 1)) links.push([a, best[q][1], A.k]);
  }
  return { cl: cl, nodes: nodes, links: links, px: new Float32Array(380), py: new Float32Array(380), pd: new Float32Array(380) };
})();

function mdHex(a, b, u) { var A = hexToRgb(a), B = hexToRgb(b), s = '#'; for (var i = 0; i < 3; i++) { var v = Math.round(lerp(A[i], B[i], u)).toString(16); s += v.length < 2 ? '0' + v : v; } return s; }
function mdMixA(a, b, u, al) { var A = hexToRgb(a), B = hexToRgb(b); return 'rgba(' + Math.round(lerp(A[0], B[0], u)) + ',' + Math.round(lerp(A[1], B[1], u)) + ',' + Math.round(lerp(A[2], B[2], u)) + ',' + al + ')'; }

// ---------- shot 1: the scanning lab ----------
function mdLab(c, t) {
  // back wall
  ctx.fillStyle = lin(0, -260, 0, 600, [[0, '#050822'], [0.55, '#0c1747'], [1, '#13205a']]);
  ctx.fillRect(-500, -400, W + 1000, 1000);
  glow(800, 330, 500, 'rgba(70,120,255,0.34)');
  // wall panels with cyan edge lights
  for (var i = -4; i < 17; i++) {
    var x = i * 104 - 30, hh = 520;
    ctx.fillStyle = i % 2 ? '#0b1440' : '#0e1a4d'; ctx.fillRect(x, 560 - hh, 98, hh);
    ctx.fillStyle = 'rgba(125,249,255,' + (0.18 + 0.2 * hash(i, 4)) + ')';
    ctx.fillRect(x, 560 - hh * (0.3 + 0.6 * hash(i, 5)), 98, 2);
    ctx.fillRect(x + 96, 40, 2, 520);
    if (hash(i, 6) > 0.4) { ctx.fillStyle = pulse(t + i, 0.7) > 0.5 ? '#7df9ff' : '#2bb8d6'; ctx.fillRect(x + 12, 520 - hash(i, 7) * 300, 6, 6); }
  }
  // chamber portal ring on the wall
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(125,249,255,0.35)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(800, 330, 300, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(80,150,255,0.18)';
  ctx.beginPath(); ctx.arc(800, 330, 262, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(125,249,255,0.5)';
  for (var k = 0; k < 48; k++) { var a = k / 48 * Math.PI * 2 + t * 0.05, r0 = k % 4 ? 306 : 300; ctx.beginPath(); ctx.moveTo(800 + Math.cos(a) * r0, 330 + Math.sin(a) * r0); ctx.lineTo(800 + Math.cos(a) * 322, 330 + Math.sin(a) * 322); ctx.stroke(); }
  ctx.restore();
  // floor with perspective grid and reflections
  ctx.fillStyle = lin(0, 560, 0, 900, [[0, '#101c55'], [0.4, '#081236'], [1, '#03061a']]);
  ctx.fillRect(-500, 560, W + 1000, 600);
  ctx.save(); ctx.strokeStyle = 'rgba(125,249,255,0.16)'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (var g = -14; g <= 14; g++) { ctx.moveTo(800 + g * 40, 560); ctx.lineTo(800 + g * 260, 1000); }
  for (var r = 0; r < 8; r++) { var yy = 560 + Math.pow(r / 7, 2) * 420 + 6; ctx.moveTo(-500, yy); ctx.lineTo(W + 500, yy); }
  ctx.stroke(); ctx.restore();
  ctx.fillStyle = 'rgba(125,249,255,0.5)'; ctx.fillRect(-500, 558, W + 1000, 2);
  bloom(800, 600, 260, 'rgba(255,138,61,0.35)');
  // ceiling beam onto the spirit
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = lin(0, -200, 0, 600, [[0, 'rgba(125,249,255,0.3)'], [0.7, 'rgba(125,249,255,0.08)'], [1, 'rgba(125,249,255,0)']]);
  ctx.beginPath(); ctx.moveTo(740, -200); ctx.lineTo(860, -200); ctx.lineTo(1010, 600); ctx.lineTo(590, 600); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function mdGyro(cx, cy, t, front) {
  // two tilted scan rings around the spirit; back halves first, front halves after the spirit
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var i = 0; i < 2; i++) {
    var rx = 225 + i * 40, ry = 58 + i * 16, rot = (i ? -0.38 : 0.3) + Math.sin(t * 0.6 + i) * 0.08;
    var a0 = front ? 0 : Math.PI, a1 = front ? Math.PI : Math.PI * 2;
    ctx.strokeStyle = i ? 'rgba(255,170,90,0.75)' : 'rgba(125,249,255,0.85)'; ctx.lineWidth = front ? 4 : 2.5;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, rot, a0, a1); ctx.stroke();
    ctx.lineWidth = 12; ctx.strokeStyle = i ? 'rgba(255,140,60,0.12)' : 'rgba(125,249,255,0.12)';
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, rot, a0, a1); ctx.stroke();
    // runner lights travelling along the ring
    for (var j = 0; j < 3; j++) {
      var ang = t * (1.1 + i * 0.4) + j * 2.09, s = Math.sin(ang);
      if ((s > 0) !== !!front) continue;
      var px = Math.cos(ang) * rx, py = s * ry, cr = Math.cos(rot), sr = Math.sin(rot);
      glow(cx + px * cr - py * sr, cy + px * sr + py * cr, 16, i ? 'rgba(255,200,140,0.9)' : 'rgba(200,255,255,0.9)');
    }
  }
  ctx.restore();
}
function mdConsole(t) {
  // local frame: (0, 0) = screen centre. A dark console edge in the bottom-right foreground.
  ctx.fillStyle = '#060a1e'; ctx.beginPath(); ctx.moveTo(150, 400); ctx.quadraticCurveTo(330, 268, 700, 250); ctx.lineTo(700, 400); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(125,249,255,0.75)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(170, 392); ctx.quadraticCurveTo(340, 272, 700, 254); ctx.stroke();
  for (var i = 0; i < 9; i++) {
    var u = 0.2 + i * 0.09, x = lerp(250, 660, u), y = lerp(330, 272, u) + 22;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(255,170,90,' + (0.5 + 0.5 * pulse(t + i, 0.8)) + ')' : 'rgba(125,249,255,' + (0.35 + 0.4 * pulse(t * 1.3 + i, 0.6)) + ')';
    ctx.fillRect(x, y, 26, 6);
  }
  bloom(420, 300, 160, 'rgba(125,249,255,0.18)');
}
function mdGraphPanel(x, y, w, h, t) {
  holoPanel(x, y, w, h, 1, { fill: 'rgba(10,30,80,0.55)' });
  var pts = [];
  for (var i = 0; i < 9; i++) pts.push([x + 18 + hash(41, i) * (w - 36), y + 16 + hash(42, i) * (h - 32)]);
  ctx.save(); ctx.strokeStyle = 'rgba(125,249,255,0.45)'; ctx.lineWidth = 1.2; ctx.beginPath();
  for (i = 1; i < 9; i++) { var j = Math.floor(hash(43, i) * i); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[j][0], pts[j][1]); }
  ctx.stroke();
  for (i = 0; i < 9; i++) { ctx.fillStyle = i === Math.floor(t * 1.5) % 9 ? '#ffb070' : '#7df9ff'; ctx.beginPath(); ctx.arc(pts[i][0], pts[i][1], 3.5, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
function mdHudPanel(x, y, w, h, t, seed) {
  holoPanel(x, y, w, h, 1, { fill: 'rgba(10,30,80,0.55)' });
  ctx.save(); ctx.fillStyle = 'rgba(125,249,255,0.75)';
  for (var i = 0; i < 7; i++) { var v = 0.25 + 0.7 * pulse(t * (0.6 + hash(seed, i)) + i, 0.6); ctx.fillRect(x + 16 + i * ((w - 32) / 7), y + h - 14 - v * (h - 36), (w - 32) / 7 - 6, v * (h - 36)); }
  ctx.restore();
}

// ---------- shot 2: the galaxy of ideas ----------
function mdGalaxy(c, t, cz, rot, clK, dim) {
  // deep space with coloured nebulae
  ctx.fillStyle = rad(640, 360, 0, 820, [[0, '#1d1660'], [0.45, '#0b0d36'], [1, '#03040f']]);
  ctx.fillRect(-300, -300, W + 600, H + 600);
  glow(330, 210, 340, 'rgba(120,70,255,0.28)');
  glow(1020, 560, 360, 'rgba(40,140,255,0.25)');
  glow(640, 360, 260, 'rgba(255,170,110,0.24)');
  stars(12, 140, t, [-100, -100, W + 200, H + 200]);
  var N = MD.nodes, px = MD.px, py = MD.py, pd = MD.pd, cs = Math.cos(rot), sn = Math.sin(rot), i, n;
  for (i = 0; i < N.length; i++) {
    n = N[i]; var d = n.z - cz;
    if (d < 0.16) { pd[i] = -1; continue; }
    var x = n.x * cs - n.y * sn, y = n.x * sn + n.y * cs;
    px[i] = 640 + x / d * 413; py[i] = 360 + y / d * 413; pd[i] = d;
  }
  var a0 = ctx.globalAlpha;
  // cluster nebula glows once lit
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var k = 0; k < MD.cl.length; k++) {
    if (!(clK[k] > 0)) continue;
    var C = MD.cl[k], dz = C.z - cz, X = C.u * 1.55 * C.z, Y = C.v * 0.88 * C.z;
    var gx = 640 + (X * cs - Y * sn) / dz * 413, gy = 360 + (X * sn + Y * cs) / dz * 413;
    glow(gx, gy, 150 / dz * 1.8, rgba(C.col, 0.32), clamp(clK[k]) * (0.85 + 0.15 * pulse(t + k, 0.5)));
  }
  ctx.restore();
  // links, one stroke per group
  ctx.save(); ctx.lineCap = 'round';
  for (var gr = -1; gr < MD.cl.length; gr++) {
    var lit = gr >= 0 ? clamp(clK[gr]) : 0;
    ctx.beginPath();
    for (var L = 0; L < MD.links.length; L++) {
      var lk = MD.links[L]; if (lk[2] !== gr) continue;
      if (pd[lk[0]] < 0 || pd[lk[1]] < 0) continue;
      ctx.moveTo(px[lk[0]], py[lk[0]]); ctx.lineTo(px[lk[1]], py[lk[1]]);
    }
    ctx.lineWidth = 1 + lit * 0.8;
    ctx.strokeStyle = lit > 0 ? mdMixA('#8296ff', MD.cl[gr].col, lit, 0.16 + 0.26 * lit) : 'rgba(130,150,255,0.16)';
    ctx.globalAlpha = a0 * dim; ctx.stroke();
  }
  ctx.restore();
  // signals travelling along the links (the mind at work)
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var S = 0; S < MD.links.length; S += 5) {
    var sl = MD.links[S]; if (pd[sl[0]] < 0 || pd[sl[1]] < 0) continue;
    var su = (t * (0.35 + hash(S, 3) * 0.5) + hash(S, 4)) % 1, sx = lerp(px[sl[0]], px[sl[1]], su), sy = lerp(py[sl[0]], py[sl[1]], su);
    var sLit = sl[2] >= 0 ? clamp(clK[sl[2]]) : 0, sr = 1.6 + 1.6 / pd[sl[0]];
    ctx.globalAlpha = a0 * dim * (0.35 + 0.55 * sLit) * Math.sin(su * Math.PI);
    ctx.fillStyle = sLit > 0.05 ? MD.cl[sl[2]].col : '#cfe0ff'; ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
  }
  ctx.restore();
  // nodes
  for (i = 0; i < N.length; i++) {
    if (pd[i] < 0) continue;
    n = N[i];
    var dd = pd[i], depthA = clamp((4.2 - dd) / 2.2) * clamp((dd - 0.16) / 0.3);
    var lt = n.k >= 0 ? clamp((clK[n.k] - n.r * 0.5) * 2.2) : 0;
    var fl = n.k >= 0 ? clamp(1 - Math.abs(clK[n.k] - n.r * 0.5 - 0.5) * 2.5) : 0;
    var r = n.sz * (1.1 + 2.2 / dd) * (1 + lt * 0.5 + fl * 0.8);
    var tw = 0.65 + 0.35 * Math.sin(t * 1.7 + n.tw);
    ctx.globalAlpha = a0 * dim * depthA * (0.45 + 0.55 * Math.max(lt, 0.25)) * tw;
    ctx.fillStyle = lt > 0.05 ? MD.cl[n.k].col : (n.k < 0 ? '#9fb0ff' : '#b8c6ff');
    if (r < 2.2) ctx.fillRect(px[i] - r, py[i] - r, r * 2, r * 2);
    else { ctx.beginPath(); ctx.arc(px[i], py[i], r, 0, Math.PI * 2); ctx.fill(); }
    if (lt > 0.05 || fl > 0) { ctx.globalAlpha = a0 * dim * depthA * (0.25 * lt + 0.6 * fl); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(px[i], py[i], r * 0.45, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.globalAlpha = a0;
}

// ---------- the Golden Gate Bridge feature ----------
function mdBP(u, h) { // u along the bridge (0 = near tower, 1 = far tower), h = height above deck (1 = tower top)
  var wz = 1 + 0.5 * u, s = 1 / wz;
  return [640 + (-80 + 665 * u) * s, 350 + (120 - 300 * h) * s, s];
}
function mdCable(u) {
  if (u >= 0 && u <= 1) return 0.07 + 0.93 * (2 * u - 1) * (2 * u - 1);
  var v = u < 0 ? u / -0.45 : (u - 1) / 0.45;
  return (1 - v) * (1 - 0.32 * v);
}
function mdTower(u, glowK) {
  var b = mdBP(u, 0), top = mdBP(u, 1.08), s = b[2], gap = 44 * s, lw = 15 * s, base = b[1] + 420 * s;
  var legs = function () {
    for (var j = -1; j <= 1; j += 2) {
      var x = b[0] + j * gap / 2;
      ctx.moveTo(x - lw / 2, base); ctx.lineTo(x - lw * 0.38, top[1]); ctx.lineTo(x + lw * 0.38, top[1]); ctx.lineTo(x + lw / 2, base); ctx.closePath();
    }
    var hs = [0.32, 0.56, 0.76, 0.93];
    for (var q = 0; q < hs.length; q++) { var yy = mdBP(u, hs[q])[1]; ctx.rect(b[0] - gap / 2, yy - 7 * s, gap, (q === 3 ? 16 : 10) * s); }
    ctx.rect(b[0] - gap / 2 - lw * 0.2, top[1] - 6 * s, gap + lw * 0.4, 9 * s);
  };
  cel(legs, '#e4532f', { line: 1.6 * s, ink: '#7a1f1c', shade: '#a8321f', shadeBuild: function () { ctx.rect(b[0] - 2, top[1] - 20, gap + lw, base - top[1] + 40); }, light: '#ffb27a', lightBuild: function () { ctx.rect(b[0] - gap / 2 - lw / 2, top[1] - 20, lw * 0.32, base - top[1] + 40); } });
  // aviation lights on top
  glow(b[0] - gap / 2, top[1] - 4, 16 * s * (1 + glowK), 'rgba(255,60,60,0.9)');
  glow(b[0] + gap / 2, top[1] - 4, 16 * s * (1 + glowK), 'rgba(255,60,60,0.9)');
}
function mdBridge(t, k) {
  var u, p, q, i;
  // warm haze behind (the "memory" light)
  ctx.save(); ctx.translate(780, 330); ctx.scale(1, 0.62); bloom(0, 0, 460, 'rgba(255,125,75,0.5)', k); ctx.restore();
  // distant hills of the far shore
  ctx.fillStyle = 'rgba(70,40,90,0.55)';
  ctx.beginPath(); ctx.moveTo(880, 470); ctx.quadraticCurveTo(1030, 380, 1170, 420); ctx.quadraticCurveTo(1260, 400, 1340, 440); ctx.lineTo(1340, 520); ctx.lineTo(880, 520); ctx.closePath(); ctx.fill();
  // back fog bank
  mdFog(t, 470, 0.55, 3);
  // far tower, then the near tower
  mdTower(1, 0.3 * pulse(t, 0.8)); mdTower(0, 0.3 * pulse(t + 0.5, 0.8));
  // deck
  ctx.beginPath();
  for (u = -0.45; u <= 1.451; u += 0.05) { p = mdBP(u, 0); if (u < -0.44) ctx.moveTo(p[0], p[1] - 4 * p[2]); else ctx.lineTo(p[0], p[1] - 4 * p[2]); }
  for (u = 1.45; u >= -0.451; u -= 0.05) { p = mdBP(u, 0); ctx.lineTo(p[0], p[1] + 16 * p[2]); }
  ctx.closePath(); ctx.fillStyle = '#c4402a'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#7a1f1c'; ctx.stroke();
  ctx.beginPath(); for (u = -0.45; u <= 1.451; u += 0.05) { p = mdBP(u, 0); if (u < -0.44) ctx.moveTo(p[0], p[1] - 3 * p[2]); else ctx.lineTo(p[0], p[1] - 3 * p[2]); }
  ctx.lineWidth = 2; ctx.strokeStyle = '#ffb27a'; ctx.stroke();
  // truss ticks under the deck
  ctx.beginPath(); for (u = -0.44; u <= 1.44; u += 0.03) { p = mdBP(u, 0); ctx.moveTo(p[0], p[1] + 1); ctx.lineTo(p[0] + 4 * p[2], p[1] + 14 * p[2]); }
  ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(120,30,25,0.8)'; ctx.stroke();
  // suspenders
  ctx.beginPath();
  for (u = -0.42; u <= 1.42; u += 0.028) {
    if (Math.abs(u) < 0.02 || Math.abs(u - 1) < 0.02) continue;
    p = mdBP(u, mdCable(u)); q = mdBP(u, 0); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]);
  }
  ctx.lineWidth = 1.1; ctx.strokeStyle = 'rgba(255,140,100,0.85)'; ctx.stroke();
  // main cable: glow pass + crisp pass
  var cable = function () { for (var uu = -0.45; uu <= 1.451; uu += 0.025) { var pp = mdBP(uu, mdCable(uu)); if (uu < -0.44) ctx.moveTo(pp[0], pp[1]); else ctx.lineTo(pp[0], pp[1]); } };
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.beginPath(); cable(); ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(255,110,60,0.25)'; ctx.stroke();
  ctx.restore();
  ctx.beginPath(); cable(); ctx.lineWidth = 3.2; ctx.strokeStyle = '#ff7a45'; ctx.stroke();
  ctx.beginPath(); cable(); ctx.lineWidth = 1.2; ctx.strokeStyle = '#ffd2a6'; ctx.stroke();
  // deck lamps
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (i = 0; i < 26; i++) { u = -0.4 + i * 0.072; p = mdBP(u, 0); ctx.fillStyle = 'rgba(255,230,170,' + (0.5 + 0.4 * pulse(t * 0.8 + i * 0.3, 0.5)) + ')'; ctx.fillRect(p[0] - 1.5, p[1] - 9 * p[2], 3, 3); }
  ctx.restore();
  // the fog sea swallowing the tower feet, and fog rolling under the deck
  ctx.fillStyle = lin(0, 470, 0, 760, [[0, 'rgba(215,200,245,0)'], [0.25, 'rgba(205,190,240,0.55)'], [0.6, 'rgba(120,100,180,0.75)'], [1, 'rgba(40,30,90,0.85)']]);
  ctx.beginPath(); ctx.moveTo(-200, 760);
  for (var fx = -200; fx <= 1500; fx += 60) ctx.lineTo(fx, 492 + Math.sin(fx * 0.011 + t * 0.4) * 10 + Math.sin(fx * 0.027 - t * 0.3) * 6);
  ctx.lineTo(1500, 760); ctx.closePath(); ctx.fill();
  mdFog(t, 500, 0.9, 7);
}
function mdFog(t, y, a, seed) {
  ctx.save();
  for (var i = 0; i < 9; i++) {
    var sp = 8 + hash(seed, i) * 10, span = 1700;
    var x = ((hash(seed + 1, i) * span + t * sp) % span) - 260, yy = y + (hash(seed + 2, i) - 0.5) * 50;
    var rx = 170 + hash(seed + 3, i) * 150, ry = 34 + hash(seed + 4, i) * 22;
    ctx.save(); ctx.translate(x, yy); ctx.scale(1, ry / rx);
    ctx.fillStyle = rad(0, 0, 0, rx, [[0, 'rgba(235,225,255,' + (0.42 * a) + ')'], [0.55, 'rgba(210,190,240,' + (0.22 * a) + ')'], [1, 'rgba(200,180,240,0)']]);
    ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
    ctx.restore();
  }
  ctx.restore();
}

defineScene({
  id: 'mind',
  title: 'Inside My Mind',
  alt: 'Scientists scan Claude, and the camera dives through its glowing core into a galaxy of tiny connected ideas; clusters light up and one bright node blooms into the Golden Gate Bridge over sea fog while Chris Olah watches, amazed.',
  min: 10,
  transition: 'fade',
  lines: [
    'And they learned to look inside my mind.',
    'In 2024 they found millions of ideas in there, even one for the Golden Gate Bridge!'
  ],
  draw: function (c) {
    var t = c.t;
    var dive = eio(clamp((c.lineK(0) - 0.45) / 0.33));       // "look inside my mind"
    var ts = c.when(0, 0.78), inside = t >= ts;
    var dr = drift(t, 0.8);

    if (!inside) {
      // ---------- SHOT 1: the lab, push into the core ----------
      var z0 = 1 + 0.08 * eo(t / 2.4), zoom = z0 * Math.pow(18, ei(dive));
      var tx = lerp(720, 800, eo(t / 2.4) * 0.6 + dive * 0.4) + dr[0] * (1 - dive), ty = lerp(352, 330, eo(t / 2.4) * 0.5 + dive * 0.5) + dr[1] * (1 - dive);
      camera(tx, ty, zoom, -0.02 * (1 - dive), function () {
        mdLab(c, t);
        mdHudPanel(1010, 168, 170, 96, t, 3);
        mdGraphPanel(1040, 410, 160, 100, t);
        mdGyro(800, 330, t, false);
        spirit(800, 330, 1.45, { t: t, mood: 'happy', glow: 0.8 + dive, power: 0.3, look: [-0.5, 0.2] });
        mdGyro(800, 330, t, true);
        // scan sweep
        var sy = 330 + Math.sin(t * 2.2) * 95;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(125,249,255,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(800, sy, 150, 20, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(125,249,255,0.1)'; ctx.fill();
        ctx.restore();
        // target brackets
        at(800, 330, 1 + 0.04 * Math.sin(t * 3), t * 0.15, function () {
          ctx.strokeStyle = 'rgba(125,249,255,0.9)'; ctx.lineWidth = 3; ctx.beginPath();
          for (var q = 0; q < 4; q++) { var sx = q % 2 ? 1 : -1, sy2 = q < 2 ? -1 : 1; ctx.moveTo(sx * 165, sy2 * 125); ctx.lineTo(sx * 165, sy2 * 165); ctx.lineTo(sx * 125, sy2 * 165); }
          ctx.stroke();
        });
        bloom(800, 330, 90 + 1400 * ei(dive), 'rgba(255,236,200,0.95)', 0.35 + 0.65 * dive);
      });
      // foreground console (right) and Chris (left), closer to the lens: they fly out first during the dive
      var push0 = eo(t / 2.4), fly = ei(dive);
      at(640 + 900 * fly, 360 + 500 * fly, 1 + 0.03 * push0 + 1.2 * fly, 0, function () { mdConsole(t); });
      bust('chris', 300 - 20 * push0 - 1100 * fly + dr[0] * 1.5, 800 + 300 * fly, 1.08 * (1 + 0.04 * push0 + 1.4 * fly), { t: t, expr: 'determined', look: [0.75, -0.35], turn: 0.35, rim: P.holo, light: 0.9, visor: true });
      bokeh(21, 10, t, { area: [0, 0, W, H], size: 26, speed: 10, a: 0.5, colors: ['rgba(125,249,255,0.35)', 'rgba(255,170,100,0.3)'] });
      if (dive > 0) {
        var csx = 640 + (800 - tx) * zoom, csy = 360 + (330 - ty) * zoom, cr = 70 + 1500 * ei(dive);
        fade(seg(dive, 0.1, 0.3), function () {
          ctx.fillStyle = rad(csx, csy, 0, cr, [[0, '#fffaf0'], [0.42, 'rgba(255,236,200,0.98)'], [0.75, 'rgba(255,170,90,0.6)'], [1, 'rgba(255,138,61,0)']]);
          ctx.fillRect(csx - cr, csy - cr, cr * 2, cr * 2);
        });
        speedLines(csx, csy, t, { n: 80, inner: 120 + 200 * dive, color: '#fff2dd', a: 0.6 * dive });
        flash(ei(dive) * 0.9, '#fff1d8');
      }
      vignette(0.5);
      return;
    }

    // ---------- SHOT 2: the galaxy of ideas ----------
    var tg = t - ts;
    var cz = 0.34 * (1 - Math.exp(-tg / 1.4)) + 0.004 * tg;
    var rot = -0.35 * Math.exp(-tg / 1.8) + 0.012 * tg;
    var clK = [];
    for (var k = 0; k < 8; k++) clK.push(seg(c.since(1, 0.27 + k * 0.032), 0, 0.9));
    var nodeOn = seg(c.since(1, 0.56), 0, 0.5);                // "even one"
    var bk = seg(c.since(1, 0.72), 0, 1.1), be = eo(bk);       // "Golden Gate Bridge"
    var push = eio(seg(c.since(1, 0.54), 0, 2.2));
    var bump = shake(t, 0.5 * (1 - seg(c.since(1, 0.72), 0, 0.45)) * (bk > 0 ? 1 : 0));
    var camX = 640 + 70 * push + dr[0] + bump[0], camY = 360 + 22 * push + dr[1] + bump[1], camZ = 1 + 0.06 * push + 0.01 * Math.sin(t * 0.3);
    var nsx = 640 + (MD_NODE[0] - camX) * camZ, nsy = 360 + (MD_NODE[1] - camY) * camZ;
    camera(camX, camY, camZ, -0.012 * push, function () {
      mdGalaxy(c, t, cz, rot, clK, 1 - 0.45 * be);
      // the feature node
      var nx = MD_NODE[0], ny = MD_NODE[1];
      if (nodeOn > 0 && bk < 1) {
        var pr = 1 - be;
        bloom(nx, ny, 70 + 60 * pulse(t, 2), 'rgba(255,90,50,0.8)', nodeOn * pr);
        fade(nodeOn * pr, function () {
          ctx.fillStyle = '#ff6a3d'; ctx.beginPath(); ctx.arc(nx, ny, 7 + 3 * pulse(t, 2.5), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff1dc'; ctx.beginPath(); ctx.arc(nx, ny, 3.5, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = 'rgba(255,170,120,0.9)'; ctx.lineWidth = 2;
          var rr = 26 + 30 * (1 - eo(nodeOn));
          ctx.beginPath(); ctx.arc(nx, ny, rr, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(nx - rr - 14, ny); ctx.lineTo(nx - rr + 6, ny); ctx.moveTo(nx + rr - 6, ny); ctx.lineTo(nx + rr + 14, ny); ctx.moveTo(nx, ny - rr - 14); ctx.lineTo(nx, ny - rr + 6); ctx.moveTo(nx, ny + rr - 6); ctx.lineTo(nx, ny + rr + 14); ctx.stroke();
        });
      }
      if (bk > 0) {
        // the node blooms: the bridge grows out of it inside an expanding circle
        var R = 30 + 1150 * be;
        ctx.save();
        ctx.beginPath(); ctx.arc(nx, ny, R, 0, Math.PI * 2); ctx.clip();
        fade(clamp(bk * 2.5), function () { mdBridge(t, 1); });
        ctx.restore();
        if (bk < 1) fade(1 - bk, function () {
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = 'rgba(255,200,150,0.9)'; ctx.lineWidth = 10 * (1 - bk) + 2;
          ctx.beginPath(); ctx.arc(nx, ny, R, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        });
        bloom(nx, ny, 260 * (1 - be) + 40, 'rgba(255,240,220,0.9)', 1 - be);
      }
    });
    // foreground bokeh nodes (out of focus, closer than the galaxy)
    bokeh(31, 7, t, { area: [-40, -40, W + 80, H + 80], size: 38, speed: 7, a: 0.45, colors: ['rgba(140,170,255,0.3)', 'rgba(255,140,200,0.25)', 'rgba(255,190,120,0.25)'] });
    // Chris joins the dive (foreground, big), amazed when the bridge blooms
    var ck = eo(seg(tg, 0.3, 0.9));
    if (ck > 0) {
      var amazed = c.since(1, 0.74) >= 0, after = c.since(1, 0.74) > 2.4;
      var rimC = mdHex('#7df9ff', '#ffb070', be);
      var cx = lerp(-160, 238, ck) + dr[0] * 1.6, cy = 800 + dr[1] * 1.2;
      fade(ck, function () {
        bust('chris', cx, cy, 1.06, { t: t, expr: after ? 'smile' : (amazed ? 'surprised' : 'thinking'), look: [0.8, -0.2], turn: 0.4, rim: rimC, light: 0.9 + 0.1 * be, visor: true });
      });
      // name tag
      var nk = eo(seg(tg, 1.0, 0.6));
      if (nk > 0) fade(nk, function () {
        at(48 - 40 * (1 - nk), 640, 1, 0, function () {
          ctx.fillStyle = 'rgba(8,12,40,0.82)'; ctx.beginPath(); ctx.moveTo(0, -36); ctx.lineTo(268, -36); ctx.lineTo(256, 22); ctx.lineTo(-12, 22); ctx.closePath(); ctx.fill();
          ctx.fillStyle = P.holo; ctx.fillRect(0, -36, 5, 58);
          txt('CHRIS OLAH', 18, -6, 26, { align: 'left', color: '#ffffff' });
          txt('CO-FOUNDER · INTERPRETABILITY', 18, 14, 13, { font: 'r', align: 'left', color: P.holo, ls: 1.5 });
        });
      });
    }
    // feature label
    var lk = seg(c.since(1, 0.8), 0, 0.6);
    if (lk > 0) {
      var lx = 842, ly = 612;
      fade(eo(lk), function () {
        ctx.save(); ctx.strokeStyle = 'rgba(255,200,160,0.8)'; ctx.lineWidth = 2; ctx.setLineDash([5, 6]);
        ctx.beginPath(); ctx.moveTo(nsx, nsy + 10); ctx.lineTo(nsx, ly - 84); ctx.lineTo(lx - 60, ly - 84); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#ffd2a6'; ctx.beginPath(); ctx.arc(nsx, nsy, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        var w = txtWidth('GOLDEN GATE BRIDGE', 46) + 70, e = eo(lk);
        ctx.save(); ctx.beginPath(); ctx.rect(lx - w / 2 * e, ly - 70, w * e, 100); ctx.clip();
        ctx.fillStyle = 'rgba(30,10,30,0.72)'; ctx.beginPath(); ctx.moveTo(lx - w / 2 + 14, ly - 46); ctx.lineTo(lx + w / 2, ly - 46); ctx.lineTo(lx + w / 2 - 14, ly + 20); ctx.lineTo(lx - w / 2, ly + 20); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,150,100,0.85)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();
        txt('FEATURE', lx, ly - 56, 20, { font: 'r', color: '#ffd2a6', ls: 6, stroke: 'rgba(20,6,20,0.9)', sw: 5 });
      });
      slam('GOLDEN GATE BRIDGE', lx, ly + 2, 46, seg(c.since(1, 0.8), 0.05, 0.55), { color: '#ffffff', stroke: '#7a1f1c', sw: 8 });
    }
    // white-gold flash as we burst through the core
    var fl = 1 - seg(tg, 0, 0.6); flash(fl * fl, '#fff1d8');
    vignette(0.5);
    yearBadge('2024', seg(c.since(1, 0), 0, 0.5));
  }
});
