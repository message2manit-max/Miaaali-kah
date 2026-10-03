/* 08-constitution: a calm lab at night, lit by cyan holograms, the city glowing through a
   wall of glass behind. Chris writes glowing principles on a floating holographic scroll;
   each finished line peels off as a stream of light into a small warm orb, an AI that is not
   born yet, which brightens with every principle it takes in. On line 2 the title
   CONSTITUTIONAL AI slams in on a slanted band and the orb answers with a burst. */

function pcam(cam, d, fn) { camera(lerp(W / 2, cam.x, d), lerp(H / 2, cam.y, d), 1 + (cam.z - 1) * d, (cam.r || 0) * d, fn); }
function kick(s, d) { return s >= 0 && s < d ? 1 - s / d : 0; }
function settle(s, tau) { return s > 0 ? 1 - Math.exp(-s / tau) : 0; }
function qpt(a, b, c, u) { var v = 1 - u; return [v * v * a[0] + 2 * v * u * b[0] + u * u * c[0], v * v * a[1] + 2 * v * u * b[1] + u * u * c[1]]; }

var K_SC = { x: 386, y: 160, w: 330, h: 384 };   // the scroll sheet (between the rollers)
var K_ORB = [190, 226];                            // the unborn AI
var K_PR = ['Be helpful', 'Be honest', 'Avoid harm', 'Respect people'];
var K_AT = [0.52, 0.63, 0.74, 0.85];                // line-0 fractions where each principle starts
var K_TYPE = 0.62;                                 // seconds to write one principle
function kLineY(i) { return K_SC.y + 136 + i * 60; }
function kStream(i) {
  var y = kLineY(i) - 11;
  return [[K_SC.x + 30, y], [K_SC.x - 150 + i * 6, y - 40 - i * 26], K_ORB];
}

/* ---------- background: sky and city through the glass wall ---------- */
function kOutside(t) {
  ctx.fillStyle = lin(0, -80, 0, 540, [[0, '#060922'], [0.4, '#141857'], [0.7, '#33286f'], [0.88, '#7a4486'], [1, '#c8708a']]);
  ctx.fillRect(-300, -300, W + 600, 900);
  stars(808, 60, t, [-120, -60, W + 240, 330]);
  // crescent moon
  ctx.save();
  glow(1040, 168, 150, 'rgba(170,190,255,0.22)');
  ctx.fillStyle = '#eef0ff'; ctx.beginPath(); ctx.arc(1040, 168, 30, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#141857'; ctx.beginPath(); ctx.arc(1052, 160, 27, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // long thin dusk clouds on the horizon, lit from below
  var cl = [[180, 400, 380, 9], [760, 380, 520, 8], [1180, 420, 420, 7], [470, 432, 300, 5]];
  for (var i = 0; i < cl.length; i++) {
    var x = cl[i][0] + t * 4, y = cl[i][1], w = cl[i][2], h = cl[i][3];
    ctx.fillStyle = 'rgba(70,40,110,0.75)'; ctx.beginPath(); ctx.ellipse(x, y, w / 2, h, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,170,170,0.55)'; ctx.beginPath(); ctx.ellipse(x + 10, y + h * 0.55, w * 0.44, h * 0.45, 0, 0, Math.PI * 2); ctx.fill();
  }
}
function kCity(t) {
  city(492, { color: '#3b3576', lit: 'rgba(190,200,255,0.45)', seed: 21, height: 190, bw: 58, density: 0.8, rim: 'rgba(255,160,190,0.35)' });
  glow(640, 520, 700, 'rgba(255,140,150,0.18)');
  city(540, { color: '#1c1945', lit: 'rgba(255,200,130,0.85)', seed: 44, height: 280, bw: 86, density: 0.84, rim: 'rgba(130,230,255,0.25)' });
  // a few blinking aircraft lights on the tallest towers
  for (var i = 0; i < 5; i++) {
    var x = 80 + i * 270 + hash(i, 4) * 80, y = 290 + hash(i, 5) * 60, on = pulse(t * 0.6 + i * 0.37, 1) > 0.7;
    if (on) bloom(x, y, 12, 'rgba(255,90,90,0.9)');
  }
}
// interior shell: ceiling, mullions, glass reflections, sill and the floor
function kRoom(t) {
  // glass reflections
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(140,220,255,0.05)';
  ctx.beginPath(); ctx.moveTo(250, 40); ctx.lineTo(380, 40); ctx.lineTo(180, 556); ctx.lineTo(50, 556); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(430, 40); ctx.lineTo(470, 40); ctx.lineTo(270, 556); ctx.lineTo(230, 556); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(880, 40); ctx.lineTo(1010, 40); ctx.lineTo(820, 556); ctx.lineTo(690, 556); ctx.closePath(); ctx.fill();
  ctx.restore();
  // ceiling soffit with an LED line
  ctx.fillStyle = '#0a0c22'; ctx.fillRect(-200, -200, W + 400, 236);
  ctx.fillStyle = lin(0, 28, 0, 44, [[0, '#0a0c22'], [1, '#151a3e']]); ctx.fillRect(-200, 28, W + 400, 16);
  ctx.fillStyle = 'rgba(125,249,255,0.85)'; ctx.fillRect(-200, 42, W + 400, 2);
  glow(640, 44, 700, 'rgba(125,249,255,0.08)');
  // mullions
  var mx = [-6, 300, 640, 980, 1286];
  for (var i = 0; i < mx.length; i++) {
    ctx.fillStyle = '#0c0f2a'; ctx.fillRect(mx[i] - 11, 40, 22, 520);
    ctx.fillStyle = 'rgba(125,249,255,0.35)'; ctx.fillRect(mx[i] + 9, 44, 2, 512);
  }
  ctx.fillStyle = '#0c0f2a'; ctx.fillRect(-200, 300, W + 400, 7);
  // sill with a cyan strip
  ctx.fillStyle = '#10142f'; ctx.fillRect(-200, 548, W + 400, 22);
  ctx.fillStyle = 'rgba(125,249,255,0.7)'; ctx.fillRect(-200, 548, W + 400, 2);
  // glossy floor with a perspective grid
  ctx.fillStyle = lin(0, 570, 0, 760, [[0, '#121838'], [1, '#070918']]); ctx.fillRect(-200, 570, W + 400, 400);
  ctx.save(); ctx.strokeStyle = 'rgba(125,249,255,0.09)'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (var g = -10; g <= 10; g++) { ctx.moveTo(640 + g * 40, 570); ctx.lineTo(640 + g * 260, 900); }
  for (var r = 0; r < 6; r++) { var yy = 570 + Math.pow(r / 5, 1.8) * 300; ctx.moveTo(-200, yy); ctx.lineTo(W + 200, yy); }
  ctx.stroke(); ctx.restore();
}
// lab desk with monitors on the left, a server rack behind the writer on the right
function kProps(t) {
  // desk
  ctx.fillStyle = '#0b0e26'; ctx.fillRect(-60, 486, 340, 70);
  ctx.fillStyle = '#1d2450'; ctx.fillRect(-60, 486, 340, 6);
  var mons = [[-10, 400, 110, 74], [108, 392, 128, 84], [244, 406, 96, 70]];
  for (var i = 0; i < mons.length; i++) {
    var m = mons[i];
    ctx.fillStyle = '#05071a'; ctx.fillRect(m[0] - 5, m[1] - 5, m[2] + 10, m[3] + 10);
    ctx.fillStyle = lin(m[0], m[1], m[0], m[1] + m[3], [[0, '#1d5f86'], [1, '#0f2f55']]); ctx.fillRect(m[0], m[1], m[2], m[3]);
    ctx.fillStyle = 'rgba(160,250,255,0.75)';
    for (var l = 0; l < 6; l++) {
      var lw = (0.25 + hash(i * 7 + l, 3) * 0.6) * (m[2] - 16), sc = ((t * 0.7 + i) % 6);
      if ((l + Math.floor(sc)) % 6 !== 5) ctx.fillRect(m[0] + 8 + (hash(i, l) > 0.6 ? 10 : 0), m[1] + 9 + l * 10, lw, 3);
    }
    ctx.fillStyle = '#05071a'; ctx.fillRect(m[0] + m[2] / 2 - 4, m[1] + m[3] + 5, 8, 486 - m[1] - m[3] - 5);
    glow(m[0] + m[2] / 2, m[1] + m[3] / 2, 110, 'rgba(90,200,255,0.16)');
  }
  // rack
  ctx.fillStyle = '#0b0d24'; ctx.fillRect(1090, 250, 150, 310);
  ctx.fillStyle = '#171c42'; ctx.fillRect(1090, 250, 150, 5);
  for (var r = 0; r < 12; r++) {
    ctx.fillStyle = '#12163a'; ctx.fillRect(1100, 264 + r * 24, 130, 18);
    for (var q = 0; q < 4; q++) {
      var on = hash(r * 5 + q, Math.floor(t * 3 + r + q)) > 0.45;
      ctx.fillStyle = on ? (q === 3 ? 'rgba(255,170,90,0.95)' : 'rgba(125,249,255,0.95)') : 'rgba(60,90,140,0.6)';
      ctx.fillRect(1110 + q * 12, 271 + r * 24, 6, 4);
    }
  }
}

/* ---------- the holographic scroll ---------- */
function kRoller(x, y, w) {
  ctx.fillStyle = lin(0, y - 13, 0, y + 13, [[0, 'rgba(60,170,220,0.9)'], [0.45, 'rgba(220,255,255,0.95)'], [1, 'rgba(30,110,180,0.9)']]);
  ctx.beginPath(); rrect(x - 22, y - 12, w + 44, 24, 12); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(x - 10, y - 6, w + 20, 2);
  ctx.fillStyle = '#bffaff';
  ctx.beginPath(); ctx.arc(x - 26, y, 9, 0, Math.PI * 2); ctx.arc(x + w + 26, y, 9, 0, Math.PI * 2); ctx.fill();
  bloom(x + w / 2, y, w * 0.7, 'rgba(125,249,255,0.25)');
}
function kScroll(c, t) {
  var S = K_SC, L0 = c.since(0, 0);
  // projector puck on the floor and its light cone
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = lin(0, S.y + S.h, 0, 668, [[0, 'rgba(125,249,255,0.0)'], [1, 'rgba(125,249,255,0.22)']]);
  ctx.beginPath(); ctx.moveTo(S.x + 10, S.y + S.h + 14); ctx.lineTo(S.x + S.w - 10, S.y + S.h + 14); ctx.lineTo(S.x + S.w / 2 + 40, 664); ctx.lineTo(S.x + S.w / 2 - 40, 664); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#0c1030'; ctx.beginPath(); ctx.ellipse(S.x + S.w / 2, 668, 70, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(125,249,255,0.9)'; ctx.beginPath(); ctx.ellipse(S.x + S.w / 2, 664, 46, 7, 0, 0, Math.PI * 2); ctx.fill();
  bloom(S.x + S.w / 2, 664, 120, 'rgba(125,249,255,0.35)');
  // floor reflection of the scroll
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = lin(0, 600, 0, 720, [[0, 'rgba(125,249,255,0.12)'], [1, 'rgba(125,249,255,0)']]);
  ctx.fillRect(S.x, 600, S.w, 120);
  ctx.restore();

  var bob = Math.sin(t * 0.9) * 4;
  at(0, bob, 1, 0, function () {
    bloom(S.x + S.w / 2, S.y + S.h / 2, 330, 'rgba(60,200,255,0.22)');
    // sheet
    ctx.fillStyle = 'rgba(6,20,52,0.62)'; ctx.fillRect(S.x, S.y, S.w, S.h);
    ctx.fillStyle = lin(S.x, S.y, S.x + S.w, S.y + S.h, [[0, 'rgba(50,170,230,0.30)'], [0.5, 'rgba(30,110,190,0.16)'], [1, 'rgba(60,190,240,0.26)']]);
    ctx.fillRect(S.x, S.y, S.w, S.h);
    ctx.fillStyle = 'rgba(160,250,255,0.06)';
    for (var sy = S.y + 2; sy < S.y + S.h; sy += 5) ctx.fillRect(S.x, sy, S.w, 1);
    // a slow scan band
    var scan = S.y + ((t * 60) % (S.h + 80)) - 40;
    ctx.save(); ctx.beginPath(); ctx.rect(S.x, S.y, S.w, S.h); ctx.clip();
    ctx.fillStyle = lin(0, scan - 40, 0, scan + 40, [[0, 'rgba(160,250,255,0)'], [0.5, 'rgba(160,250,255,0.10)'], [1, 'rgba(160,250,255,0)']]);
    ctx.fillRect(S.x, scan - 40, S.w, 80);
    ctx.restore();
    ctx.fillStyle = 'rgba(125,249,255,0.7)'; ctx.fillRect(S.x, S.y, 2, S.h); ctx.fillRect(S.x + S.w - 2, S.y, 2, S.h);
    // header (written on "constitution")
    var hk = seg(c.since(0, 0.42), 0, 0.5);
    ctx.fillStyle = 'rgba(125,249,255,0.5)'; ctx.fillRect(S.x + 30, S.y + 80, (S.w - 60) * eo(hk), 2);
    if (hk > 0) fade(eo(hk), function () {
      txt('CONSTITUTION', S.x + S.w / 2, S.y + 64, 26, { color: '#e9feff', stroke: 'rgba(40,190,240,0.55)', sw: 7, ls: 4 });
    });
    // ruled lines, with faint draft glyphs that the written principles replace
    ctx.fillStyle = 'rgba(125,249,255,0.18)';
    for (var r = 0; r < 4; r++) ctx.fillRect(S.x + 30, kLineY(r) + 12, S.w - 60, 1.5);
    for (var g = 0; g < 4; g++) {
      var gone = seg(c.since(0, K_AT[g]), 0, 0.3);
      ctx.fillStyle = 'rgba(160,240,255,' + (0.22 * (1 - gone)) + ')';
      var gx = S.x + 62;
      for (var q = 0; q < 6; q++) {
        var gw = 18 + hash(g * 9 + q, 2) * 42;
        if (gx + gw > S.x + S.w - 34) break;
        ctx.fillRect(gx, kLineY(g) - 18, gw, 10); gx += gw + 9;
      }
    }
    // principles
    for (var i = 0; i < K_PR.length; i++) {
      var k = seg(c.since(0, K_AT[i]), 0, K_TYPE), y = kLineY(i);
      if (!(k > 0)) continue;
      var done = seg(c.since(0, K_AT[i]) - K_TYPE, 0, 0.5);
      // bullet
      at(S.x + 40, y - 11, back(seg(k, 0, 0.4)), Math.PI / 4, function () {
        ctx.fillStyle = mix('#7df9ff', '#ffb070', done); ctx.fillRect(-6, -6, 12, 12);
      });
      typeOn(K_PR[i], S.x + 62, y, 32, k, { font: 'r', align: 'left', color: '#ffffff', stroke: 'rgba(60,210,255,0.45)', sw: 8 });
    }
    // the light-pen spark: idles on the first line, then follows the writing
    var px = S.x + 62, py = kLineY(0) - 10, live = 1;
    for (var j = 0; j < K_PR.length; j++) {
      var s = c.since(0, K_AT[j]);
      if (s > 0) {
        var kk = seg(s, 0, K_TYPE), n = Math.ceil(K_PR[j].length * kk);
        px = S.x + 62 + txtWidth(K_PR[j].slice(0, n), 32, { font: 'r' }); py = kLineY(j) - 10;
        if (j < K_PR.length - 1 && kk >= 1) { var mv = seg(s - K_TYPE, 0, 0.3); if (mv > 0) { px = lerp(px, S.x + 62, eio(mv)); py = lerp(py, kLineY(j + 1) - 10, eio(mv)); } }
      }
    }
    live = 1 - 0.6 * seg(c.since(0, K_AT[3]) - K_TYPE, 0, 0.6);
    sparkle(px + 6, py, 13 + 4 * pulse(t, 3), '#ffffff', t * 2, live);
    bloom(px + 6, py, 46, 'rgba(125,249,255,0.6)', live);
    kRoller(S.x, S.y - 6, S.w);
    kRoller(S.x, S.y + S.h + 6, S.w);
  });
}

/* ---------- streams of light and the orb ---------- */
function kStreams(c, t) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var i = 0; i < K_PR.length; i++) {
    var s = c.since(0, K_AT[i]) - K_TYPE - 0.15;
    if (!(s > 0)) continue;
    var u = eio(seg(s, 0, 0.9)), P3 = kStream(i), N = 22, pts = [];
    for (var j = 0; j <= N; j++) pts.push(qpt(P3[0], P3[1], P3[2], (j / N) * u));
    var g = lin(P3[0][0], P3[0][1], K_ORB[0], K_ORB[1], [[0, 'rgba(125,249,255,1)'], [1, 'rgba(255,170,90,1)']]);
    var widths = [[22, 0.07], [9, 0.18], [4, 0.45], [1.6, 0.95]];
    for (var w = 0; w < widths.length; w++) {
      ctx.save(); ctx.globalAlpha *= widths[w][1]; ctx.strokeStyle = g; ctx.lineWidth = widths[w][0]; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var q = 1; q < pts.length; q++) ctx.lineTo(pts[q][0], pts[q][1]); ctx.stroke();
      ctx.restore();
    }
    // the travelling head while it launches
    if (u < 1) { var hp = pts[pts.length - 1]; glow(hp[0], hp[1], 34, 'rgba(255,240,210,0.9)'); }
    // a steady flow of motes along the finished stream
    if (u >= 1) {
      for (var m = 0; m < 6; m++) {
        var ph = (t * 0.55 + m / 6 + i * 0.13) % 1, p = qpt(P3[0], P3[1], P3[2], ph);
        ctx.fillStyle = ph < 0.6 ? 'rgba(190,252,255,0.9)' : 'rgba(255,214,160,0.9)';
        ctx.beginPath(); ctx.arc(p[0], p[1], 2.4 + Math.sin(ph * Math.PI) * 1.8, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  ctx.restore();
}
function kArrived(c) {
  var n = 0, hit = 0;
  for (var i = 0; i < K_PR.length; i++) {
    var s = c.since(0, K_AT[i]) - K_TYPE - 0.15 - 0.9;
    if (s > 0) { n++; hit = Math.max(hit, kick(s, 0.7)); }
  }
  return [n, hit];
}
function kOrb(c, t, burst) {
  var a = kArrived(c), n = a[0], hit = a[1];
  var x = K_ORB[0], y = K_ORB[1] + Math.sin(t * 1.3) * 5;
  var b = 0.35 + 0.15 * n + 0.25 * hit + 0.3 * burst;
  var r = 30 + n * 2.5 + 8 * hit + 6 * burst;
  bloom(x, y, 120 + 40 * n + 120 * burst, 'rgba(255,150,70,0.55)', clamp(b));
  rays(x, y, 14, 150 + 30 * n + 200 * burst, Math.PI * 2, 'rgba(255,210,150,1)', 0.08 + 0.025 * n + 0.22 * burst, t * 0.6, 0);
  // cradle rings
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var i = 0; i < 2; i++) {
    var rx = r * (2.1 + i * 0.5), ry2 = rx * (0.22 + i * 0.08), tl = -0.32 + i * 0.6, ph = t * (0.9 - i * 0.3) + i * 2;
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(125,249,255,0.28)';
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry2, tl, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(200,252,255,0.7)';
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry2, tl, ph, ph + 1.1); ctx.stroke();
    for (var m = 0; m < 3; m++) {
      var a2 = ph * 1.3 + m * 2.09, ex = Math.cos(a2) * rx, ey = Math.sin(a2) * ry2;
      var mx = x + ex * Math.cos(tl) - ey * Math.sin(tl), my = y + ex * Math.sin(tl) + ey * Math.cos(tl);
      ctx.fillStyle = m === 0 ? 'rgba(255,214,160,0.95)' : 'rgba(190,252,255,0.9)';
      ctx.beginPath(); ctx.arc(mx, my, 2.6, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  // core
  ctx.fillStyle = rad(x - r * 0.25, y - r * 0.3, r * 0.1, r * 1.15, [[0, '#fffaf0'], [0.35, '#ffe0a8'], [0.75, '#ff9a4a'], [1, 'rgba(228,87,46,0)']]);
  ctx.beginPath(); ctx.arc(x, y, r * 1.15, 0, Math.PI * 2); ctx.fill();
  // the faint shape of a spark-to-be inside (a flame drop), stronger as it learns
  fade(0.18 + 0.1 * n, function () {
    ctx.fillStyle = '#ffffff'; ctx.beginPath();
    ctx.moveTo(x, y - r * 0.75); ctx.quadraticCurveTo(x + r * 0.55, y - r * 0.05, x + r * 0.42, y + r * 0.32);
    ctx.quadraticCurveTo(x, y + r * 0.7, x - r * 0.42, y + r * 0.32); ctx.quadraticCurveTo(x - r * 0.55, y - r * 0.05, x, y - r * 0.75); ctx.fill();
  });
  // absorb ripple
  if (hit > 0) fade(hit, function () { ctx.strokeStyle = '#fff1d6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r * (1.2 + (1 - hit) * 1.6), 0, Math.PI * 2); ctx.stroke(); });
  if (burst > 0) fade(burst, function () { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5 * burst; ctx.beginPath(); ctx.arc(x, y, r * (1.3 + (1 - burst) * 2.6), 0, Math.PI * 2); ctx.stroke(); });
}

/* ---------- a small name tag for the writer (not a full name card) ---------- */
function kTag(c, t) {
  var k = seg(c.since(0, 0.08), 0, 0.5) * (1 - seg(c.since(1, 0.2), 0, 0.4));
  if (!(k > 0)) return;
  var e = eo(k), x = 1236 + (1 - e) * 300, y = 640;
  fade(e, function () {
    ctx.fillStyle = P.ink; ctx.beginPath(); ctx.moveTo(x - 250, y - 36); ctx.lineTo(x + 10, y - 36); ctx.lineTo(x, y + 26); ctx.lineTo(x - 260, y + 26); ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.holo; ctx.fillRect(x - 246, y - 32, 6, 54);
    txt('CHRIS OLAH', x - 18, y + 2, 28, { align: 'right', color: '#ffffff' });
    txt('CO-FOUNDER', x - 18, y + 20, 13, { font: 'r', align: 'right', color: P.holo, ls: 3 });
  });
}

/* ---------- the title card ---------- */
function kTitle(c, t) {
  var s = c.since(1, 0.38);
  if (!(s > 0)) return;
  var band = eo(seg(s, 0, 0.35));
  var y = 658, x0 = 56;
  // slanted band
  ctx.save();
  ctx.fillStyle = 'rgba(8,10,34,0.84)';
  ctx.beginPath(); ctx.moveTo(-40, y - 72); ctx.lineTo(lerp(-40, 1010, band), y - 82); ctx.lineTo(lerp(-40, 980, band), y + 44); ctx.lineTo(-40, y + 54); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.holo; ctx.beginPath(); ctx.moveTo(-40, y - 72); ctx.lineTo(lerp(-40, 1010, band), y - 82); ctx.lineTo(lerp(-40, 1010, band), y - 78); ctx.lineTo(-40, y - 68); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.claude; ctx.beginPath(); ctx.moveTo(-40, y + 50); ctx.lineTo(lerp(-40, 980, band), y + 40); ctx.lineTo(lerp(-40, 980, band), y + 46); ctx.lineTo(-40, y + 56); ctx.closePath(); ctx.fill();
  ctx.restore();
  var s1 = 54, w1 = txtWidth('CONSTITUTIONAL', s1);
  var k1 = seg(s, 0.05, 0.5), k2 = seg(s, 0.22, 0.5);
  slam('CONSTITUTIONAL', x0 + w1 / 2, y + 14, s1, k1, { color: '#ffffff', stroke: P.ink, sw: 10 });
  slam('AI', x0 + w1 + 22 + txtWidth('AI', 96) / 2, y + 30, 96, k2, { color: P.claude, stroke: P.ink, sw: 14 });
  if (k1 > 0) fade(eo(seg(s, 0.4, 0.4)), function () { txt('THE METHOD', x0 + 2, y - 46, 18, { font: 'r', color: P.holo, align: 'left', ls: 5 }); });
}

defineScene({
  id: 'constitution',
  title: 'Constitutional AI',
  alt: 'In a quiet lab at night lit by cyan holograms, Chris writes glowing principles on a floating holographic scroll: be helpful, be honest, avoid harm, respect people. Each line flows as a stream of light into a small warm orb, an AI not yet born, and the title Constitutional AI slams in.',
  min: 9,
  lines: [
    'To give AI good values, they wrote it a constitution: a list of principles to learn from.',
    'They called it Constitutional AI.'
  ],
  draw: function (c) {
    var t = c.t;
    var sl = c.since(1, 0.38) - 0.25;   // the title lands
    var burst = kick(sl, 1.1);
    var dr = drift(t, 0.8), sk = shake(t, 0.75 * kick(sl, 0.45));
    var push = settle(t, 7);
    var cam = { x: 640 + dr[0] + sk[0] - 26 * push, y: 360 + dr[1] + sk[1] - 8 * push, z: 1.0 + 0.075 * push + 0.025 * kick(sl, 0.6), r: -0.012 };

    pcam(cam, 0.2, function () { kOutside(t); });
    pcam(cam, 0.32, function () { kCity(t); });
    pcam(cam, 0.6, function () { kRoom(t); });
    pcam(cam, 0.72, function () {
      kProps(t);
      bokeh(81, 10, t, { area: [0, 60, W, 480], size: 9, speed: 6, a: 0.5, colors: ['rgba(125,249,255,0.5)', 'rgba(255,200,140,0.4)'] });
    });
    pcam(cam, 0.9, function () {
      // cool wash around the hologram, warm wash around the orb
      bloom(560, 380, 520, 'rgba(40,140,255,0.12)');
      bloom(K_ORB[0], K_ORB[1], 300, 'rgba(255,130,60,0.10)');
      kScroll(c, t);
      kStreams(c, t);
      kOrb(c, t, burst);
      sparkles(17, 3, t, [K_SC.x - 54, K_SC.y + 20, 40, K_SC.h - 40], 'rgba(200,252,255,0.8)');
      sparkles(29, 3, t, [K_SC.x + K_SC.w + 14, K_SC.y + 20, 40, K_SC.h - 40], 'rgba(200,252,255,0.8)');
    });
    // the writer, big in the right foreground, rim-lit by the scroll
    pcam(cam, 1, function () {
      var after = c.since(1, 0.5);
      person('chris', 1030, 1250, 2.45, { t: t, flip: true, arms: 'point', turn: 0.35, look: [0.7, 0.05], expr: after > 0 ? 'smile' : 'calm', rim: '#9ff8ff', light: 0.95, wind: 0.12 });
    });
    // foreground bokeh (out of focus, closest to the lens)
    pcam(cam, 1.15, function () {
      bokeh(5, 6, t, { area: [-60, -40, W + 120, H + 80], size: 46, speed: 4, a: 0.35, colors: ['rgba(125,249,255,0.35)', 'rgba(255,170,100,0.3)'] });
    });
    vignette(0.55, 'rgba(4,6,22,1)');
    kTag(c, t);
    kTitle(c, t);
    flash(0.35 * kick(sl, 0.3), '#e8fdff');
    c.yr('2022');
  }
});
