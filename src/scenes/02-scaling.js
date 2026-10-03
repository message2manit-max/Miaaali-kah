/* 02-scaling: 2020, a research room at night. Dario (pointing) and Jared (thinking) in the
   foreground, big, either side of a giant holo board. Line 2: a clean straight line climbs a
   log-log chart, fed by three arrows (BIGGER, MORE DATA, MORE COMPUTE), then surges off the
   board; slam "SCALING LAWS". */

// board and chart geometry (world coordinates)
var S_BX = 290, S_BY = 52, S_BW = 700, S_BH = 440;
var S_OX = 392, S_OY = 392, S_XE = 950, S_YT = 96;
var S_L0 = [404, 378], S_L1 = [934, 118];
function sLine(u) { return [lerp(S_L0[0], S_L1[0], u), lerp(S_L0[1], S_L1[1], u)]; }

// The room: back wall, windows on the night city, ceiling light strips, glossy floor.
function sRoom(t, px) {
  ctx.fillStyle = lin(0, 0, 0, 560, [[0, '#060a22'], [0.6, '#0d1640'], [1, '#14205a']]);
  ctx.fillRect(-200, -100, W + 400, 700);
  // back windows (city at night, out of focus)
  var wins = [[-120, 60, 380, 440], [1010, 60, 400, 440]];
  for (var i = 0; i < wins.length; i++) {
    var w = wins[i];
    ctx.save(); ctx.beginPath(); ctx.rect(w[0] + px * 0.3, w[1], w[2], w[3]); ctx.clip();
    ctx.fillStyle = lin(0, w[1], 0, w[1] + w[3], [[0, '#0a1440'], [1, '#2a3f86']]);
    ctx.fillRect(w[0] - 40, w[1], w[2] + 80, w[3]);
    ctx.translate(px * 0.15, 0);
    ctx.fillStyle = '#16245e';
    for (var b = 0; b < 9; b++) {
      var bx = w[0] + b * 50 + hash(b, i + 3) * 20, bh = 120 + hash(b, i + 9) * 220;
      ctx.fillRect(bx, w[1] + w[3] - bh, 40 + hash(b, i) * 20, bh);
    }
    bokeh(31 + i, 14, t, { area: [w[0], w[1] + 120, w[2], w[3] - 120], size: 20, speed: 2, a: 0.8, colors: ['rgba(255,200,130,0.55)', 'rgba(120,170,255,0.5)', 'rgba(160,240,255,0.45)'] });
    ctx.restore();
    ctx.fillStyle = '#070b20';
    ctx.fillRect(w[0] + px * 0.3, w[1], w[2], 10);
    for (var m = 1; m < 3; m++) ctx.fillRect(w[0] + px * 0.3 + w[2] * m / 3, w[1], 8, w[3]);
  }
  // board glow on the wall
  bloom(640, 270, 620, 'rgba(60,200,255,0.20)', 0.9);
  // ceiling: dark soffit with light strips receding in perspective
  ctx.fillStyle = lin(0, -100, 0, 46, [[0, '#03050f'], [1, '#0a1030']]);
  ctx.fillRect(-200, -100, W + 400, 146);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var s = -4; s <= 4; s++) {
    var x0 = 640 + s * 118, x1 = 640 + s * 400;
    ctx.fillStyle = lin(0, -40, 0, 44, [[0, 'rgba(190,230,255,0.55)'], [1, 'rgba(170,220,255,0.12)']]);
    ctx.beginPath(); ctx.moveTo(x0 - 12, 42); ctx.lineTo(x0 + 12, 42); ctx.lineTo(x1 + 34, -60); ctx.lineTo(x1 - 34, -60); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = 'rgba(125,249,255,0.35)'; ctx.fillRect(-200, 45, W + 400, 1.5);
  ctx.restore();
  // floor
  ctx.fillStyle = lin(0, 540, 0, 720, [[0, '#0b1236'], [1, '#04061a']]);
  ctx.fillRect(-200, 540, W + 400, 300);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.translate(640, 548); ctx.scale(1, 0.32);
  ctx.fillStyle = rad(0, 0, 0, 420, [[0, 'rgba(90,220,255,0.34)'], [1, 'rgba(90,220,255,0)']]);
  ctx.fillRect(-420, -420, 840, 840);
  ctx.restore();
  ctx.fillStyle = 'rgba(125,249,255,0.5)'; ctx.fillRect(-200, 540, W + 400, 2);
  // glossy floor: tile seams receding to the vanishing point, catching the board light
  ctx.strokeStyle = 'rgba(125,249,255,0.10)'; ctx.lineWidth = 1.2; ctx.beginPath();
  for (var f = -9; f <= 9; f++) { ctx.moveTo(640 + f * 46, 542); ctx.lineTo(640 + f * 300, 780); }
  for (var g2 = 1; g2 <= 5; g2++) { var fy = 542 + Math.pow(g2 / 5, 1.8) * 220; ctx.moveTo(-200, fy); ctx.lineTo(W + 200, fy); }
  ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.translate(640, 548); ctx.scale(1.6, 0.5);
  ctx.fillStyle = rad(0, 0, 0, 300, [[0, 'rgba(125,249,255,0.16)'], [1, 'rgba(125,249,255,0)']]);
  ctx.fillRect(-300, 0, 600, 300);
  ctx.restore();
  // lab desk with monitors under the board
  ctx.fillStyle = '#0a0f2c'; ctx.fillRect(300, 500, 680, 46);
  ctx.fillStyle = 'rgba(125,249,255,0.55)'; ctx.fillRect(300, 500, 680, 2);
  for (var k = 0; k < 3; k++) {
    var mx = 360 + k * 220;
    ctx.fillStyle = '#060918'; ctx.fillRect(mx, 452, 130, 50);
    ctx.fillStyle = 'rgba(30,90,140,0.9)'; ctx.fillRect(mx + 5, 457, 120, 38);
    ctx.strokeStyle = 'rgba(160,250,255,0.75)'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (var g = 0; g <= 12; g++) { var gx = mx + 10 + g * 9, gy = 488 - g * 2 - Math.sin(g * 1.3 + t * 2 + k) * 3; if (g) ctx.lineTo(gx, gy); else ctx.moveTo(gx, gy); }
    ctx.stroke();
  }
}

// Little icons for the three input chips.
function sIcon(kind, x, y, col) {
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.4;
  ctx.beginPath();
  if (kind === 0) { // bigger: nested squares
    ctx.rect(x - 9, y - 9, 18, 18); ctx.rect(x - 4, y - 4, 8, 8);
    ctx.stroke();
  } else if (kind === 1) { // data: cylinder
    ctx.ellipse(x, y - 7, 9, 4, 0, 0, Math.PI * 2);
    ctx.moveTo(x - 9, y - 7); ctx.lineTo(x - 9, y + 7); ctx.ellipse(x, y + 7, 9, 4, 0, Math.PI, 0, true); ctx.lineTo(x + 9, y - 7);
    ctx.moveTo(x - 9, y); ctx.ellipse(x, y, 9, 4, 0, Math.PI, 0, true);
    ctx.stroke();
  } else { // compute: chip
    ctx.rect(x - 8, y - 8, 16, 16);
    for (var i = -1; i <= 1; i++) { ctx.moveTo(x + i * 5, y - 8); ctx.lineTo(x + i * 5, y - 12); ctx.moveTo(x + i * 5, y + 8); ctx.lineTo(x + i * 5, y + 12); ctx.moveTo(x - 8, y + i * 5); ctx.lineTo(x - 12, y + i * 5); ctx.moveTo(x + 8, y + i * 5); ctx.lineTo(x + 12, y + i * 5); }
    ctx.stroke();
  }
}

// The chart: log-log grid, the climbing line, the feeding arrows, the surge.
function sChart(t, kGrid, uLine, chips, surge, glowK) {
  // log grid (decades with log subdivisions: the spacing itself says "log scale")
  fade(kGrid, function () {
    ctx.lineWidth = 1;
    var dx = (S_XE - S_OX) / 5, dy = (S_OY - S_YT) / 4;
    ctx.strokeStyle = 'rgba(125,249,255,0.10)'; ctx.beginPath();
    for (var d = 0; d < 5; d++) for (var m = 2; m < 10; m++) { var gx = S_OX + (d + Math.log(m) / Math.LN10) * dx; ctx.moveTo(gx, S_YT); ctx.lineTo(gx, S_OY); }
    for (var e = 0; e < 4; e++) for (var n = 2; n < 10; n++) { var gy = S_OY - (e + Math.log(n) / Math.LN10) * dy; ctx.moveTo(S_OX, gy); ctx.lineTo(S_XE, gy); }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(125,249,255,0.30)'; ctx.beginPath();
    for (var d2 = 1; d2 <= 5; d2++) { ctx.moveTo(S_OX + d2 * dx, S_YT); ctx.lineTo(S_OX + d2 * dx, S_OY); }
    for (var e2 = 1; e2 <= 4; e2++) { ctx.moveTo(S_OX, S_OY - e2 * dy); ctx.lineTo(S_XE, S_OY - e2 * dy); }
    ctx.stroke();
    // axes
    ctx.strokeStyle = '#bffcff'; ctx.lineWidth = 3; ctx.beginPath();
    ctx.moveTo(S_OX, S_YT - 10); ctx.lineTo(S_OX, S_OY); ctx.lineTo(S_XE + 10, S_OY); ctx.stroke();
    ctx.fillStyle = '#bffcff'; ctx.beginPath();
    ctx.moveTo(S_OX - 7, S_YT - 6); ctx.lineTo(S_OX, S_YT - 20); ctx.lineTo(S_OX + 7, S_YT - 6); ctx.closePath();
    ctx.moveTo(S_XE + 6, S_OY - 7); ctx.lineTo(S_XE + 20, S_OY); ctx.lineTo(S_XE + 6, S_OY + 7); ctx.closePath(); ctx.fill();
    at(S_OX - 22, (S_YT + S_OY) / 2, 1, -Math.PI / 2, function () { txt('SMARTER', 0, 0, 17, { font: 'r', color: '#bffcff', ls: 4, base: 'middle' }); });
  });
  // the three feeding arrows (from labelled chips under the axis up into the line)
  var labels = ['BIGGER', 'MORE DATA', 'MORE COMPUTE'], us = [0.14, 0.46, 0.82];
  for (var i = 0; i < 3; i++) {
    var k = chips[i]; if (!(k > 0)) continue;
    var p = sLine(us[i]), cxp = p[0], top = p[1] + 14, bot = S_OY + 22;
    var tw = txtWidth(labels[i], 16, { font: 'r', ls: 0.5 }) + 48;
    // arrow shaft grows upward
    var e = eo(seg(k, 0.2, 0.6)), yHead = lerp(bot, top, e);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = lin(0, bot, 0, yHead, [[0, 'rgba(255,170,90,0.1)'], [1, 'rgba(255,190,120,0.95)']]);
    ctx.fillRect(cxp - 3, yHead, 6, bot - yHead);
    // energy pulses climbing the shaft
    if (e >= 1) for (var q = 0; q < 2; q++) { var uu = (t * 1.2 + q * 0.5 + i * 0.3) % 1; bloom(cxp, lerp(bot, top, uu), 12, 'rgba(255,220,170,0.9)', Math.sin(uu * Math.PI)); }
    ctx.restore();
    if (e > 0.05) { ctx.fillStyle = '#ffd4a3'; ctx.beginPath(); ctx.moveTo(cxp - 11, yHead + 12); ctx.lineTo(cxp, yHead - 4); ctx.lineTo(cxp + 11, yHead + 12); ctx.closePath(); ctx.fill(); }
    // chip
    var s = back(seg(k, 0, 0.45));
    at(cxp, S_OY + 40, s, 0, function () {
      ctx.fillStyle = 'rgba(40,20,10,0.85)'; ctx.beginPath(); rrect(-tw / 2, -17, tw, 34, 17); ctx.fill();
      ctx.strokeStyle = P.claude; ctx.lineWidth = 2.5; ctx.beginPath(); rrect(-tw / 2, -17, tw, 34, 17); ctx.stroke();
      sIcon(i, -tw / 2 + 21, 0, '#ffc58f');
      txt(labels[i], -tw / 2 + 38, 6, 16, { font: 'r', color: '#ffffff', align: 'left', ls: 0.5 });
    });
  }
  // measurements: scattered at first, they snap onto the line as it is found
  for (var j = 0; j < 9; j++) {
    var uj = (j + 0.5) / 9, kj = eio(seg(uLine, uj - 0.12, 0.12));
    var pj = sLine(uj), sxj = S_OX + 60 + hash(j, 71) * (S_XE - S_OX - 120), syj = S_YT + 50 + hash(j, 72) * (S_OY - S_YT - 100);
    var xj = lerp(sxj + Math.sin(t * 0.8 + j) * 6, pj[0], kj), yj = lerp(syj + Math.cos(t * 0.7 + j) * 6, pj[1] + (hash(j, 77) - 0.5) * 8, kj);
    ctx.fillStyle = kj > 0.99 ? '#ffffff' : 'rgba(191,252,255,' + (0.45 + 0.4 * kj) + ')';
    ctx.beginPath(); ctx.arc(xj, yj, 3.5 + 1.5 * kj, 0, Math.PI * 2); ctx.fill();
    if (kj > 0.99) { ctx.strokeStyle = P.claude; ctx.lineWidth = 2; ctx.stroke(); }
  }
  // the line itself
  if (uLine > 0) {
    var pe = sLine(uLine);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(255,150,70,0.35)'; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(S_L0[0], S_L0[1]); ctx.lineTo(pe[0], pe[1]); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = '#ffe6c8'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(S_L0[0], S_L0[1]); ctx.lineTo(pe[0], pe[1]); ctx.stroke();

    bloom(pe[0], pe[1], 40 + 30 * glowK, 'rgba(255,200,140,0.9)', 0.8);
  }
  // surge: the line keeps climbing straight off the board
  if (surge > 0) {
    // quadratic path bending upward, off the top of the board
    var A = S_L1, Cp = [972, 64], B = [978, -120], e = eo(surge), pts = [];
    for (var q = 0; q <= 16; q++) {
      var u = e * q / 16, iu = 1 - u;
      pts.push([iu * iu * A[0] + 2 * iu * u * Cp[0] + u * u * B[0], iu * iu * A[1] + 2 * iu * u * Cp[1] + u * u * B[1]]);
    }
    var head = pts[pts.length - 1];
    var path = function () { ctx.moveTo(pts[0][0], pts[0][1]); for (var r = 1; r < pts.length; r++) ctx.lineTo(pts[r][0], pts[r][1]); };
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255,160,80,0.5)'; ctx.lineWidth = 28; ctx.beginPath(); path(); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = '#fff6e8'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); path(); ctx.stroke();
    if (head[1] > -60) { bloom(head[0], head[1], 120, 'rgba(255,190,120,0.95)', 1); sparkle(head[0], head[1], 26 + 6 * Math.sin(t * 8), '#ffffff', t, 1); }
    // energy pulses racing up the surge
    for (var z = 0; z < 3; z++) { var uz = (t * 0.9 + z / 3) % 1, pz = pts[Math.floor(uz * (pts.length - 1))]; bloom(pz[0], pz[1], 30, 'rgba(255,235,200,0.9)', Math.sin(uz * Math.PI)); }
  }
}

defineScene({
  id: 'scaling',
  title: 'Scaling laws',
  alt: 'A research room at night in 2020. Dario points at a giant glowing board while Jared Kaplan thinks, arms folded. A straight line climbs a log-scale chart, fed by three arrows labelled bigger, more data and more compute, then surges off the board as the words Scaling Laws slam in.',
  min: 11,
  lines: [
    'In 2020, Dario and teammates like Jared Kaplan found something huge.',
    'Make AI bigger, feed it more data and computing power, and it keeps getting smarter. They called it scaling laws.'
  ],
  draw: function (c) {
    var t = c.t;
    // ---- beats ----
    var kBoard = seg(t, 0, 0.01) > 0 ? 1 : 1;                         // board is already on
    var kGrid = 1;                                                     // the board is live from the first frame
    var tag = eo(seg(c.since(0, 0.55), 0, 0.5)) * (1 - seg(c.since(1, 0.8), 0, 0.4)); // Jared's tag (clears for the slam)
    var chips = [seg(c.since(1, 0.07), 0, 0.8), seg(c.since(1, 0.26), 0, 0.8), seg(c.since(1, 0.41), 0, 0.8)];
    var uLine = 0.06 * eo(seg(c.since(0, 0.8), 0, 0.8))
      + 0.14 * eo(seg(c.since(1, 0.08), 0, 0.7))
      + 0.3 * eo(seg(c.since(1, 0.27), 0, 0.8))
      + 0.32 * eo(seg(c.since(1, 0.42), 0, 0.8))
      + 0.18 * eo(seg(c.since(1, 0.56), 0, 0.5));
    var surgeT = c.since(1, 0.64), surge = seg(surgeT, 0, 0.55);
    var hit = surgeT > 0 ? 1 - seg(surgeT, 0, 0.6) : 0;
    var slamT = c.since(1, 0.86), slamK = seg(slamT, 0, 0.55);
    var hit2 = slamT > 0 ? 1 - seg(slamT, 0.25, 0.4) : 0;
    var excited = surgeT > 0.2;

    // ---- camera ----
    var push = eio(seg(t, 0, 12));
    var follow = eio(seg(c.since(1, 0.0), 0, 6));
    var zoom = 1.0 + 0.06 * push + 0.04 * hit + 0.02 * hit2;
    var dr = drift(t, 0.8), sh = shake(t, Math.max(hit * 0.8, hit2 * 0.5));
    var cx = 640 + 26 * follow + dr[0] + sh[0], cy = 372 - 16 * follow + dr[1] + sh[1];
    var px = -(cx - 640);

    camera(cx, cy, zoom, 0, function () {
      sRoom(t, px);
      // the board
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      glow(640, 270, 520, 'rgba(90,230,255,0.16)', 1);
      ctx.restore();
      holoPanel(S_BX, S_BY, S_BW, S_BH, kBoard, { color: P.holo, fill: 'rgba(8,30,66,0.78)' });
      for (var r = 0; r < 3; r++) { ctx.fillStyle = r === 0 ? P.claude : 'rgba(125,249,255,0.5)'; ctx.beginPath(); ctx.arc(S_BX + S_BW - 30 - r * 18, S_BY + 26, 5, 0, Math.PI * 2); ctx.fill(); }
      sChart(t, kGrid, uLine, chips, surge, hit);
      if (hit > 0) fade(hit, function () { speedLines(S_L1[0], S_L1[1], t, { n: 60, inner: 160, color: '#ffffff', a: 0.55 }); });

      // ---- the two scientists, waist-up and big ----
      var rimC = '#8ff3ff';
      bloom(1110, 330, 260, 'rgba(110,230,255,0.28)', 1);
      bloom(190, 320, 280, 'rgba(110,230,255,0.30)', 1);
      person('jared', 1118, 1160, 2.22, {
        t: t, flip: true, turn: 0.35, arms: excited ? 'crossed' : 'chin', expr: excited ? 'smile' : 'thinking',
        look: [0.55, -0.45], rim: rimC, light: 0.9
      });
      person('dario', 192, 1190, 2.36, {
        t: t, turn: 0.35, arms: 'point', expr: excited ? 'grin' : 'determined',
        look: [0.6, -0.5], rim: rimC, light: 1
      });
      // cool board light washing the near faces
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = rad(640, 300, 200, 760, [[0, 'rgba(90,220,255,0.10)'], [1, 'rgba(90,220,255,0)']]);
      ctx.fillRect(-100, -100, W + 200, H + 200);
      ctx.restore();
      bokeh(37, 12, t, { area: [0, 0, W, H], size: 9, speed: 8, a: 0.6, colors: ['rgba(140,240,255,0.6)', 'rgba(255,200,140,0.45)'] });
    });

    // ---- HUD ----
    // Jared's small name tag
    if (tag > 0) fade(tag, function () {
      var x = 1240 - 14 * (1 - tag), y = 648;
      var w1 = txtWidth('JARED KAPLAN', 24) + 40;
      ctx.fillStyle = P.ink; ctx.beginPath(); ctx.moveTo(x - w1 - 8, y - 30); ctx.lineTo(x, y - 30); ctx.lineTo(x - 10, y + 12); ctx.lineTo(x - w1 - 18, y + 12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = P.holoDeep; ctx.fillRect(x - w1 - 8, y + 12, w1 - 10, 4);
      txt('JARED KAPLAN', x - 24, y + 1, 24, { color: '#ffffff', align: 'right' });
    });
    // surge flash and the slam
    if (surgeT > 0) flash(0.7 * (1 - seg(surgeT, 0, 0.3)), '#eaffff');
    if (slamK > 0) {
      var bk = eo(seg(slamK, 0.3, 0.5));
      ctx.save(); ctx.globalAlpha *= 0.85;
      ctx.fillStyle = P.ink; ctx.beginPath();
      ctx.moveTo(640 - 560 * bk, 572); ctx.lineTo(640 + 600 * bk, 572); ctx.lineTo(640 + 560 * bk, 664); ctx.lineTo(640 - 600 * bk, 664); ctx.closePath(); ctx.fill();
      ctx.fillStyle = P.claude; ctx.fillRect(640 - 560 * bk, 572, 1160 * bk, 5);
      ctx.restore();
    }
    slam('SCALING LAWS', 640, 646, 86, slamK, { color: '#ffffff', sw: 14 });
    if (slamK >= 1) {
      var g = (t * 0.6) % 1;
      sparkle(640 + 420, 580, 16 * Math.sin(g * Math.PI), '#fff0d8', 0, Math.sin(g * Math.PI));
    }
    vignette(0.5, 'rgba(2,4,18,1)');
    c.yr('2020');
  }
});
