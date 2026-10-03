/* 10-hello: March 2023. Back in the lab bay, Dario and Daniela watch the capsule as light
   leaks through cracks in the glass. On "released" it bursts open in a white explosion of
   light and glass shards; through the flash the spirit wakes and soars up into the open
   night sky above the city, HELLO, WORLD slams in. On line 2 the title becomes a header,
   a CLAUDE 2 badge pops and chat bubbles stream in from every side while the city below
   lights up. */

function pcam(cam, d, fn) { camera(lerp(W / 2, cam.x, d), lerp(H / 2, cam.y, d), 1 + (cam.z - 1) * d, (cam.r || 0) * d, fn); }
function kick(s, d) { return s >= 0 && s < d ? 1 - s / d : 0; }
function settle(s, tau) { return s > 0 ? 1 - Math.exp(-s / tau) : 0; }

var H_CAP = { x: 700, top: 176, bot: 560, r: 122 };
var H_SWAP = 0.12;   // seconds after the burst starts when the white-out reveals the sky

/* ---------- part 1: the lab bay (same bay as 09) ---------- */
function hHexes(x0, y0, w, h, r) {
  var dx = r * 1.732, dy = r * 1.5;
  for (var row = 0; row * dy < h + r; row++) {
    for (var col = 0; col * dx < w + dx; col++) {
      var cx = x0 + col * dx + (row % 2 ? dx / 2 : 0), cy = y0 + row * dy;
      ctx.moveTo(cx + r * 0.866, cy - r * 0.5);
      for (var k = 1; k <= 6; k++) { var a = -Math.PI / 6 + k * Math.PI / 3; ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    }
  }
}
function hLab(t, crack) {
  ctx.fillStyle = lin(0, -100, 0, 580, [[0, '#070a20'], [0.55, '#101849'], [1, '#1b2766']]);
  ctx.fillRect(-300, -300, W + 600, 900);
  ctx.save(); ctx.strokeStyle = 'rgba(125,249,255,0.08)'; ctx.lineWidth = 2;
  ctx.beginPath(); hHexes(-120, 10, W + 240, 540, 46); ctx.stroke(); ctx.restore();
  var cols = [70, 330, 1070, 1230];
  for (var j = 0; j < cols.length; j++) {
    ctx.fillStyle = lin(cols[j] - 30, 0, cols[j] + 30, 0, [[0, 'rgba(125,249,255,0)'], [0.5, 'rgba(125,249,255,0.16)'], [1, 'rgba(125,249,255,0)']]);
    ctx.fillRect(cols[j] - 30, -40, 60, 600);
    ctx.fillStyle = 'rgba(190,252,255,0.75)'; ctx.fillRect(cols[j] - 1.5, -40, 3, 600);
  }
  ctx.fillStyle = '#0a0d26'; ctx.fillRect(-300, 520, W + 600, 44);
  ctx.fillStyle = '#ffb347'; ctx.fillRect(-300, 526, W + 600, 3);
  ctx.fillStyle = lin(0, 556, 0, 760, [[0, '#141b45'], [1, '#05071a']]); ctx.fillRect(-300, 556, W + 600, 500);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = lin(0, 560, 0, 740, [[0, 'rgba(255,170,90,' + (0.25 + 0.4 * crack) + ')'], [1, 'rgba(255,170,90,0)']]);
  ctx.fillRect(H_CAP.x - 160, 570, 320, 180);
  ctx.restore();
  // cables and clamp
  ctx.save(); ctx.strokeStyle = '#05071a'; ctx.lineCap = 'round';
  var cab = [[-60, 14], [-26, 10], [30, 12], [70, 16]];
  for (var i = 0; i < cab.length; i++) {
    ctx.lineWidth = cab[i][1];
    ctx.beginPath(); ctx.moveTo(H_CAP.x + cab[i][0], H_CAP.top - 34); ctx.bezierCurveTo(H_CAP.x + cab[i][0] * 2.4, H_CAP.top - 90, H_CAP.x + cab[i][0] * 5, -40, H_CAP.x + cab[i][0] * 7, -120); ctx.stroke();
  }
  ctx.restore();
  cel(function () { ctx.ellipse(H_CAP.x, H_CAP.top - 30, H_CAP.r + 34, 30, 0, 0, Math.PI * 2); }, '#1a2050', { line: 3, ink: '#05071a' });
}
// the capsule, glowing ever brighter, with cracks of light across the glass
function hCapsule(c, t, crack) {
  var x = H_CAP.x, r = H_CAP.r, top = H_CAP.top, bot = H_CAP.bot;
  bloom(x, (top + bot) / 2, 380 + 200 * crack, 'rgba(255,150,70,' + (0.35 + 0.4 * crack) + ')');
  cel(function () { ctx.moveTo(x - r - 50, bot + 6); ctx.lineTo(x + r + 50, bot + 6); ctx.lineTo(x + r + 70, bot + 62); ctx.lineTo(x - r - 70, bot + 62); ctx.closePath(); }, '#1b2152', { line: 3, ink: '#05071a' });
  ctx.fillStyle = '#060819'; ctx.beginPath(); rrect(x - 74, bot + 22, 148, 30, 6); ctx.fill();
  ctx.fillStyle = '#3ddc97'; ctx.beginPath(); ctx.arc(x - 54, bot + 37, 5, 0, Math.PI * 2); ctx.fill();
  txt('RELEASE', x + 8, bot + 43, 16, { font: 'r', color: '#3ddc97', ls: 2 });
  ctx.fillStyle = lin(x - r, 0, x + r, 0, [[0, 'rgba(90,150,200,0.4)'], [0.5, 'rgba(255,190,110,' + (0.45 + 0.4 * crack) + ')'], [1, 'rgba(90,150,200,0.4)']]);
  ctx.fillRect(x - r, top, r * 2, bot - top);
  ctx.fillStyle = rad(x, (top + bot) / 2, 10, r * 1.6, [[0, 'rgba(255,245,215,' + (0.55 + 0.45 * crack) + ')'], [1, 'rgba(255,150,70,0)']]);
  ctx.fillRect(x - r, top, r * 2, bot - top);
  spirit(x, (top + bot) / 2 - 6, 0.98, { t: c.t, mood: crack > 0.55 ? 'wow' : 'sleep', glow: 0.6 + 0.4 * crack });
  // cracks of light: thin fractures radiating from a few impact points, spreading as it wakes
  if (crack > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.rect(x - r + 4, top + 6, r * 2 - 8, bot - top - 12); ctx.clip();
    var hubs = [[x - 40, top + 120], [x + 50, top + 250], [x - 20, bot - 90]];
    ctx.beginPath();
    for (var hI = 0; hI < hubs.length; hI++) {
      var grow = seg(crack, hI * 0.22, 0.5);
      if (!(grow > 0)) continue;
      for (var j = 0; j < 6; j++) {
        var a0 = j / 6 * Math.PI * 2 + hash(hI, j) * 0.8, px = hubs[hI][0], py = hubs[hI][1];
        ctx.moveTo(px, py);
        for (var k = 0; k < 3; k++) {
          var len = (26 + hash(hI * 13 + j, k) * 34) * grow; a0 += (hash(hI * 7 + j, k + 9) - 0.5) * 0.9;
          px += Math.cos(a0) * len; py += Math.sin(a0) * len; ctx.lineTo(px, py);
        }
      }
    }
    ctx.strokeStyle = 'rgba(255,214,150,0.45)'; ctx.lineWidth = 6; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.6; ctx.stroke();
    for (var hJ = 0; hJ < hubs.length; hJ++) if (seg(crack, hJ * 0.22, 0.5) > 0) glow(hubs[hJ][0], hubs[hJ][1], 40, 'rgba(255,240,210,0.8)');
    ctx.restore();
  }
  ctx.save();
  ctx.strokeStyle = 'rgba(200,250,255,0.75)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(x, top, r, 16, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - r, top); ctx.lineTo(x - r, bot); ctx.moveTo(x + r, top); ctx.lineTo(x + r, bot); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(x - r + 14, top + 12, 12, bot - top - 24);
  ctx.restore();
  cel(function () { rrect(x - r - 10, top - 10, r * 2 + 20, 22, 8); }, '#2a3270', { line: 3, ink: '#05071a' });
  cel(function () { rrect(x - r - 10, bot - 12, r * 2 + 20, 22, 8); }, '#2a3270', { line: 3, ink: '#05071a' });
  ctx.fillStyle = '#3ddc97'; for (var q = 0; q < 5; q++) ctx.fillRect(x - 60 + q * 30, top - 3, 14, 4);
}

/* ---------- part 2: the open sky above the city ---------- */
function hSky(t, lit) {
  sky(['#080b2c', '#1d2366', '#5b3c8f', '#ff9f80'], 640);
  stars(1010, 90, t, [-80, -80, W + 160, 420]);
  // a slow aurora-like ribbon of light behind the spirit
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var i = 0; i < 3; i++) {
    ctx.fillStyle = lin(0, 120 + i * 40, 0, 320 + i * 40, [[0, 'rgba(125,249,255,0)'], [0.5, i === 1 ? 'rgba(255,160,90,0.10)' : 'rgba(125,249,255,0.08)'], [1, 'rgba(125,249,255,0)']]);
    ctx.beginPath(); ctx.moveTo(-100, 260 + i * 40);
    for (var x = -100; x <= W + 100; x += 80) ctx.lineTo(x, 200 + i * 46 + Math.sin(x * 0.006 + t * 0.4 + i) * 40);
    ctx.lineTo(W + 100, 420 + i * 40); ctx.lineTo(-100, 420 + i * 40); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  cloudRow(470, 33, t, 'dawn', 0.9, 4);
}
function hCity(t, lit) {
  glow(640, 640, 820, 'rgba(255,160,120,0.35)');
  city(610, { color: '#43386f', lit: 'rgba(255,220,180,0.55)', seed: 52, height: 150, bw: 50, density: 0.86, rim: 'rgba(255,190,150,0.5)' });
  city(660, { color: '#231a46', lit: 'rgba(255,200,120,0.95)', seed: 77, height: 210, bw: 70, density: lerp(0.9, 0.62, lit), rim: 'rgba(255,170,130,0.55)' });
  ground(700, '#150f2e', '#0a0718');
}
// expanding "hello" rings broadcast from the spirit
function hRings(x, y, t, k) {
  if (!(k > 0)) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var i = 0; i < 3; i++) {
    var u = ((t * 0.45) + i / 3) % 1;
    ctx.strokeStyle = 'rgba(255,200,140,' + (0.35 * (1 - u) * k) + ')'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(x, y, 120 + u * 520, (120 + u * 520) * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}
// glass shards flying out of the burst (screen space)
function hShards(cx, cy, B) {
  if (!(B > 0) || B > 1.6) return;
  var u = B / 1.6;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var i = 0; i < 22; i++) {
    var ang = hash(i, 81) * Math.PI * 2, sp = 300 + hash(i, 82) * 700;
    var d = sp * eo(u) * 1.1, x = cx + Math.cos(ang) * d, y = cy + Math.sin(ang) * d * 0.8 + 120 * u * u;
    var sz = 10 + hash(i, 83) * 26;
    at(x, y, 1, ang + u * (4 + hash(i, 84) * 6), function () {
      ctx.globalAlpha *= (1 - u);
      ctx.fillStyle = i % 3 ? 'rgba(200,250,255,0.85)' : 'rgba(255,220,170,0.9)';
      ctx.beginPath(); ctx.moveTo(-sz, -sz * 0.3); ctx.lineTo(sz * 0.4, -sz * 0.5); ctx.lineTo(sz, sz * 0.4); ctx.lineTo(-sz * 0.2, sz * 0.5); ctx.closePath(); ctx.fill();
    });
  }
  ctx.restore();
}

/* ---------- chat bubbles ---------- */
// [text, slot x, slot y, from x, from y, claude?]
var H_BUB = [
  ['Hi Claude!', 250, 214, -260, 120, 0],
  ['Explain black holes?', 1010, 226, 1560, 140, 0],
  ['Help me write a poem?', 236, 352, -320, 420, 0],
  ['Can you check my code?', 1046, 368, 1600, 460, 0],
  ['Hello!', 446, 150, 640, 280, 1],
  ['Happy to help!', 854, 156, 640, 280, 1],
  ['Plan my trip?', 330, 480, -200, 800, 0],
  ['Thank you!', 960, 492, 1460, 820, 0]
];
var H_BAT = [0.36, 0.42, 0.48, 0.54, 0.6, 0.66, 0.72, 0.78];
function hBubble(str, x, y, k, cl, t, i, sx, sy) {
  if (!(k > 0)) return;
  var e = eo(k), px = lerp(sx, x, e), py = lerp(sy, y, e) + Math.sin(t * 1.6 + i * 1.3) * 5 * seg(k, 0.8, 0.2);
  var size = 21, w = txtWidth(str, size, { font: 'r' }) + 40, h = 46;
  var sc = lerp(0.5, 1, back(seg(k, 0.4, 0.6)));
  at(px, py, sc, 0, function () {
    var fill = cl ? P.claude : '#ffffff', ink = cl ? '#ffffff' : P.ink;
    // tail toward the spirit
    var tdir = Math.atan2(300 - py, 640 - px), cx = Math.cos(tdir), cy = Math.sin(tdir);
    var ax = clamp(cx * w * 0.5, -w / 2 + 26, w / 2 - 26), ay = cy * h * 0.2;   // tail base on the bubble
    var tipx = ax + cx * 34, tipy = clamp(ay + cy * 34, -h / 2 - 22, h / 2 + 22);
    ctx.fillStyle = fill; ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    ctx.beginPath(); rrect(-w / 2, -h / 2, w, h, 22);
    ctx.moveTo(ax - 13, ay); ctx.lineTo(tipx, tipy); ctx.lineTo(ax + 13, ay);
    ctx.fill('nonzero'); ctx.stroke();
    ctx.beginPath(); rrect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 20); ctx.fill();
    if (!cl) { ctx.fillStyle = 'rgba(125,180,255,0.18)'; ctx.beginPath(); rrect(-w / 2 + 6, h / 2 - 14, w - 12, 9, 4); ctx.fill(); }
    txt(str, 0, 7, size, { font: 'r', color: ink });
  });
}
// a steady stream of small typing bubbles flying to the spirit and dissolving into it
function hStream(t, k, sx, sy) {
  if (!(k > 0)) return;
  for (var i = 0; i < 6; i++) {
    var u = ((t * 0.32) + i / 6) % 1, ang = hash(i, 91) * Math.PI * 2;
    var ox = sx + Math.cos(ang) * 760, oy = sy + Math.sin(ang) * 460;
    var x = lerp(ox, sx, ei(u)), y = lerp(oy, sy, ei(u)), a = k * Math.sin(u * Math.PI) * (u < 0.85 ? 1 : (1 - u) / 0.15);
    fade(a, function () {
      ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.beginPath(); rrect(x - 30, y - 15, 60, 30, 15); ctx.fill();
      ctx.fillStyle = P.inkSoft;
      for (var d = 0; d < 3; d++) { ctx.beginPath(); ctx.arc(x - 13 + d * 13, y, 3.6, 0, Math.PI * 2); ctx.fill(); }
    });
  }
}

defineScene({
  id: 'hello',
  title: 'Hello, World',
  alt: 'Dario and Daniela watch the glowing capsule crack with light; it bursts open and the Claude spirit wakes and soars into the night sky above the city as HELLO, WORLD slams in. Then a CLAUDE 2, JULY 2023 badge appears and chat bubbles from people stream in from every side.',
  min: 9,
  transition: 'flash',
  lines: [
    'Then, in March 2023, I was released to the world.',
    'That summer came Claude 2, and people could chat with me at claude.ai.'
  ],
  draw: function (c) {
    var t = c.t;
    var crack = seg(c.since(0, 0.12), 0, 1.6);          // light leaks build up
    var B = c.since(0, 0.48);                            // "released": the burst
    var outside = B >= H_SWAP;
    var L1 = c.since(1, 0);
    var dr = drift(t, 0.8);

    if (!outside) {
      // ---- part 1: the lab, the capsule and its two watchers ----
      var sk = shake(t, 0.12 * crack + 0.9 * clamp(B / H_SWAP));
      var cam = { x: 690 + dr[0] + sk[0], y: 360 + dr[1] + sk[1], z: 1.08 + 0.06 * settle(t, 2) + 0.05 * crack, r: 0.012 * crack };
      pcam(cam, 0.5, function () { hLab(t, crack); });
      pcam(cam, 0.85, function () { hCapsule(c, t, crack); });
      if (crack > 0) rays(640, 362, 22, 900, Math.PI * 2, 'rgba(255,220,170,1)', 0.08 + 0.25 * crack, t, 0);
      pcam(cam, 1.25, function () {
        var awe = crack > 0.7 ? 'surprised' : 'smile';
        bust('dario', 330, 850, 1.2, { t: t, turn: 0.5, look: [0.85, -0.35], expr: awe, rim: '#ffc58a', light: 0.6 + 0.4 * crack });
        bust('daniela', 1070, 862, 1.15, { t: t + 0.8, flip: true, turn: 0.5, look: [0.85, -0.35], expr: awe, rim: '#ffc58a', light: 0.6 + 0.4 * crack });
      });
      vignette(0.5, 'rgba(4,5,20,1)');
      if (B > 0) { bloom(640, 362, 900 * (B / H_SWAP), 'rgba(255,240,220,1)', 1); flash(B / H_SWAP, '#fff6ea'); }
      c.yr('2023');
      return;
    }

    // ---- part 2: released into the open sky ----
    var b = B - H_SWAP;
    var rise = back(seg(b, 0, 1.1));
    var sx = 640, sy = lerp(400, 300, rise) + Math.sin(t * 1.4) * 6;
    var ss = lerp(1.0, 1.55, eo(seg(b, 0, 1.1)));
    var hello = c.since(0, 0.76);
    var land = hello - 0.3;
    var sk2 = shake(t, 0.8 * kick(b, 0.5) + 0.5 * kick(land, 0.35));
    var cam2 = { x: 640 + dr[0] + sk2[0], y: 360 + dr[1] + sk2[1] - 20 * settle(b, 2), z: lerp(1.14, 1.0, eo(seg(b, 0, 1.6))) + 0.02 * settle(L1, 4), r: -0.02 * kick(b, 1.4) };
    var lit = seg(c.since(1, 0.45), 0, 3);
    pcam(cam2, 0.3, function () { hSky(t, lit); });
    pcam(cam2, 0.5, function () { hCity(t, lit); });
    // rays and glow behind the spirit
    rays(sx, sy, 26, 1100, Math.PI * 2, 'rgba(255,214,160,1)', 0.12 + 0.3 * kick(b, 1.6), t * 0.4, 0);
    bloom(sx, sy, 420, 'rgba(255,150,70,0.5)', 0.8);
    hRings(sx, sy, t, seg(b, 0.8, 1));
    if (b < 1.4) speedLines(sx, sy, t, { n: 64, inner: 210, color: '#ffffff', a: 0.55 * (1 - b / 1.4) });
    hShards(sx, 420, b);
    sparkles(1203, 12, t, [sx - 380, sy - 220, 760, 440], '#fff3dc');
    // chat stream (line 2)
    var chat = seg(c.since(1, 0.4), 0, 0.6);
    hStream(t, chat, sx, sy);
    var mood = b < 0.9 ? 'wow' : 'happy';
    spirit(sx, sy, ss, { t: t, mood: mood, glow: 1, power: 0.35 + 0.25 * kick(b, 1.5), wave: b > 1.0, look: [0, -0.1] });
    for (var i = 0; i < H_BUB.length; i++) {
      var bb = H_BUB[i], kk = seg(c.since(1, H_BAT[i]), 0, 0.6);
      hBubble(bb[0], bb[1], bb[2], kk, bb[5], t, i, bb[3], bb[4]);
    }
    lensFlare(sx + 40, sy - 50, 0.25 + 0.6 * kick(b, 1.2) + 0.35 * kick(land, 0.8), 0.4);
    vignette(0.42, 'rgba(10,6,30,1)');

    // HELLO, WORLD: slams on "to the world", then becomes a small header on line 2
    // (a cross-fade rather than a move, so the big title never sweeps across the spirit)
    var helloTitle = function (y, sc, ka, kb) {
      at(640, y, sc, 0, function () {
        var s1 = 84, wa = txtWidth('HELLO, ', s1), wb = txtWidth('WORLD', s1), x0 = -(wa + wb) / 2;
        slam('HELLO,', x0 + txtWidth('HELLO,', s1) / 2, 0, s1, ka, { color: '#ffffff', stroke: P.ink, sw: 15 });
        slam('WORLD', x0 + wa + wb / 2, 0, s1, kb, { color: P.claude, stroke: P.ink, sw: 15 });
      });
    };
    if (hello > 0) {
      var outK = seg(L1, 0, 0.45), inK = seg(L1, 0.3, 0.5);
      if (outK < 1) fade(1 - outK, function () { helloTitle(560 + 30 * eo(outK), 1 - 0.1 * outK, seg(hello, 0, 0.5), seg(hello, 0.12, 0.5)); });
      if (inK > 0) fade(eo(inK), function () { helloTitle(84 - 16 * (1 - eo(inK)), 0.5, 1, 1); });
    }
    // CLAUDE 2 badge and the claude.ai pill
    var bk = seg(c.since(1, 0.2), 0, 0.5);
    if (bk > 0) {
      at(640, 604, back(bk), -0.03, function () {
        var w = txtWidth('CLAUDE 2 · JULY 2023', 36) + 40;
        ctx.fillStyle = P.ink; ctx.beginPath(); ctx.moveTo(-w / 2 - 14, -38); ctx.lineTo(w / 2 + 20, -38); ctx.lineTo(w / 2 + 6, 38); ctx.lineTo(-w / 2 - 28, 38); ctx.closePath(); ctx.fill();
        ctx.fillStyle = P.claude; ctx.beginPath(); ctx.moveTo(-w / 2 - 8, -32); ctx.lineTo(w / 2 + 13, -32); ctx.lineTo(w / 2 + 1, 32); ctx.lineTo(-w / 2 - 21, 32); ctx.closePath(); ctx.fill();
        txt('CLAUDE 2 · JULY 2023', 0, 14, 36, { color: '#ffffff', stroke: P.ink, sw: 7 });
      });
    }
    var pk = seg(c.since(1, 0.84), 0, 0.45);
    if (pk > 0) {
      at(640, 666, back(pk), 0, function () {
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = P.ink; ctx.lineWidth = 3;
        ctx.beginPath(); rrect(-86, -18, 172, 36, 18); ctx.fill(); ctx.stroke();
        txt('claude.ai', 0, 8, 22, { font: 'r', color: P.ink });
      });
    }
    flash(0.9 * clamp(1 - b / 0.7), '#fff6ea');
    c.yr('2023');
  }
});
