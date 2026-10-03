/* 09-notyet: summer 2022. In a sealed lab bay a glass capsule glows; inside it the early
   Claude spirit floats asleep while two scientists check holographic readouts, which turn
   READY. On line 2 Dario steps into the foreground and holds out a calm, protective arm in
   front of the capsule; a red NOT YET stamp lands and a SAFETY TESTS panel starts running.
   Careful and responsible, not angry. */

function pcam(cam, d, fn) { camera(lerp(W / 2, cam.x, d), lerp(H / 2, cam.y, d), 1 + (cam.z - 1) * d, (cam.r || 0) * d, fn); }
function kick(s, d) { return s >= 0 && s < d ? 1 - s / d : 0; }
function settle(s, tau) { return s > 0 ? 1 - Math.exp(-s / tau) : 0; }

var N_CAP = { x: 700, top: 176, bot: 560, r: 122 };  // the capsule (world coords)

/* ---------- the bay ---------- */
function nHexes(x0, y0, w, h, r) {
  var dx = r * 1.732, dy = r * 1.5;
  for (var row = 0; row * dy < h + r; row++) {
    for (var col = 0; col * dx < w + dx; col++) {
      var cx = x0 + col * dx + (row % 2 ? dx / 2 : 0), cy = y0 + row * dy;
      ctx.moveTo(cx + r * 0.866, cy - r * 0.5);
      for (var k = 1; k <= 6; k++) { var a = -Math.PI / 6 + k * Math.PI / 3; ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    }
  }
}
function nWall(t, alarm) {
  ctx.fillStyle = lin(0, -100, 0, 580, [[0, '#070a20'], [0.55, '#101849'], [1, '#1b2766']]);
  ctx.fillRect(-300, -300, W + 600, 900);
  // big honeycomb panels, a few cells lit
  ctx.save(); ctx.strokeStyle = 'rgba(125,249,255,0.08)'; ctx.lineWidth = 2;
  ctx.beginPath(); nHexes(-120, 10, W + 240, 540, 46); ctx.stroke();
  ctx.restore();
  for (var i = 0; i < 9; i++) {
    var hx = -120 + (2 + Math.floor(hash(i, 1) * 15)) * 79.7, hy = 10 + Math.floor(hash(i, 2) * 7) * 69;
    var on = 0.25 + 0.5 * pulse(t * 0.3 + i * 0.7, 1);
    fade(on * 0.35, function () { ctx.fillStyle = i % 4 === 0 ? 'rgba(255,170,90,0.5)' : 'rgba(125,249,255,0.45)'; ctx.beginPath(); nHexes(hx, hy, 1, 1, 42); ctx.fill(); });
  }
  // vertical light columns
  var cols = [70, 330, 1070, 1230];
  for (var j = 0; j < cols.length; j++) {
    ctx.fillStyle = lin(cols[j] - 30, 0, cols[j] + 30, 0, [[0, 'rgba(125,249,255,0)'], [0.5, 'rgba(125,249,255,0.16)'], [1, 'rgba(125,249,255,0)']]);
    ctx.fillRect(cols[j] - 30, -40, 60, 600);
    ctx.fillStyle = 'rgba(190,252,255,0.75)'; ctx.fillRect(cols[j] - 1.5, -40, 3, 600);
  }
  // amber warning strip along the base of the wall (glows red-amber once the hold is on)
  ctx.fillStyle = '#0a0d26'; ctx.fillRect(-300, 520, W + 600, 44);
  ctx.fillStyle = mix('#2bb8d6', '#ff9a3c', alarm); ctx.fillRect(-300, 526, W + 600, 3);
  ctx.save(); ctx.beginPath(); ctx.rect(-300, 534, W + 600, 22); ctx.clip();
  ctx.fillStyle = rgba('#ffb347', 0.12 + 0.18 * alarm);
  for (var s = -320; s < W + 320; s += 34) { ctx.beginPath(); ctx.moveTo(s, 556); ctx.lineTo(s + 16, 534); ctx.lineTo(s + 28, 534); ctx.lineTo(s + 12, 556); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function nFloor(t, glowK) {
  ctx.fillStyle = lin(0, 556, 0, 760, [[0, '#141b45'], [1, '#05071a']]); ctx.fillRect(-300, 556, W + 600, 500);
  // reflection of the capsule glow
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = lin(0, 560, 0, 740, [[0, 'rgba(255,160,80,' + (0.18 + 0.12 * glowK) + ')'], [1, 'rgba(255,160,80,0)']]);
  ctx.fillRect(N_CAP.x - 120, 570, 240, 180);
  ctx.restore();
  // platform rings
  ctx.save(); ctx.lineWidth = 2;
  for (var i = 0; i < 4; i++) {
    var rr = 170 + i * 90 + ((t * 30) % 90);
    ctx.strokeStyle = 'rgba(125,249,255,' + (0.28 * (1 - (rr - 170) / 360)) + ')';
    ctx.beginPath(); ctx.ellipse(N_CAP.x, 588, rr, rr * 0.16, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}
// ceiling clamp and cables over the capsule
function nRig(t) {
  ctx.save();
  ctx.strokeStyle = '#05071a'; ctx.lineCap = 'round';
  var cab = [[-60, 14], [-26, 10], [30, 12], [70, 16]];
  for (var i = 0; i < cab.length; i++) {
    ctx.lineWidth = cab[i][1];
    ctx.beginPath(); ctx.moveTo(N_CAP.x + cab[i][0], N_CAP.top - 34); ctx.bezierCurveTo(N_CAP.x + cab[i][0] * 2.4, N_CAP.top - 90, N_CAP.x + cab[i][0] * 5, -40, N_CAP.x + cab[i][0] * 7, -120); ctx.stroke();
  }
  ctx.restore();
  cel(function () { ctx.ellipse(N_CAP.x, N_CAP.top - 30, N_CAP.r + 34, 30, 0, 0, Math.PI * 2); }, '#1a2050', { line: 3, ink: '#05071a', shade: '#10153a', shadeBuild: function () { ctx.rect(N_CAP.x - 300, N_CAP.top - 30, 600, 60); } });
  ctx.fillStyle = 'rgba(125,249,255,0.85)';
  for (var k = 0; k < 7; k++) { var a = Math.PI * (0.12 + k * 0.127); ctx.fillRect(N_CAP.x + Math.cos(a) * (N_CAP.r + 22) - 3, N_CAP.top - 24 + Math.sin(a) * 18, 6, 4); }
}
// the glass capsule; glowK 0..1 brightness, hold 0..1 amber status
function nCapsule(c, t, glowK, hold, ready) {
  var x = N_CAP.x, r = N_CAP.r, top = N_CAP.top, bot = N_CAP.bot;
  bloom(x, (top + bot) / 2, 380, 'rgba(255,140,60,' + (0.24 + 0.16 * glowK) + ')');
  // a soft shaft of light from the clamp down through the glass to the floor
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = lin(0, top - 30, 0, bot + 120, [[0, 'rgba(190,240,255,0.16)'], [1, 'rgba(190,240,255,0)']]);
  ctx.beginPath(); ctx.moveTo(x - r * 0.7, top - 30); ctx.lineTo(x + r * 0.7, top - 30); ctx.lineTo(x + r * 1.9, bot + 120); ctx.lineTo(x - r * 1.9, bot + 120); ctx.closePath(); ctx.fill();
  ctx.restore();
  // pedestal
  cel(function () { ctx.moveTo(x - r - 50, bot + 6); ctx.lineTo(x + r + 50, bot + 6); ctx.lineTo(x + r + 70, bot + 62); ctx.lineTo(x - r - 70, bot + 62); ctx.closePath(); }, '#1b2152', { line: 3, ink: '#05071a', shade: '#121639', shadeBuild: function () { ctx.rect(x - 400, bot + 34, 800, 40); } });
  ctx.fillStyle = mix('#7df9ff', '#ffb347', hold); ctx.fillRect(x - r - 46, bot + 10, (r + 46) * 2, 3);
  // status display on the pedestal
  ctx.fillStyle = '#060819'; ctx.beginPath(); rrect(x - 74, bot + 22, 148, 30, 6); ctx.fill();
  var stCol = hold > 0.5 ? '#ffb347' : (ready > 0.5 ? '#3ddc97' : '#7df9ff');
  var stTxt = hold > 0.5 ? 'ON HOLD' : (ready > 0.5 ? 'READY' : 'SLEEPING');
  ctx.fillStyle = stCol; ctx.beginPath(); ctx.arc(x - 54, bot + 37, 5 * (0.7 + 0.3 * pulse(t, 1.2)), 0, Math.PI * 2); ctx.fill();
  txt(stTxt, x + 8, bot + 43, 16, { font: 'r', color: stCol, ls: 2 });
  // back of the glass and the warm fluid
  ctx.fillStyle = lin(x - r, 0, x + r, 0, [[0, 'rgba(60,140,200,0.35)'], [0.5, 'rgba(255,170,90,' + (0.28 + 0.18 * glowK) + ')'], [1, 'rgba(60,140,200,0.35)']]);
  ctx.fillRect(x - r, top, r * 2, bot - top);
  ctx.fillStyle = rad(x, (top + bot) / 2, 10, r * 1.6, [[0, 'rgba(255,230,180,' + (0.35 + 0.3 * glowK) + ')'], [1, 'rgba(255,150,70,0)']]);
  ctx.fillRect(x - r, top, r * 2, bot - top);
  // bubbles
  ctx.save(); ctx.beginPath(); ctx.rect(x - r, top, r * 2, bot - top); ctx.clip();
  ctx.strokeStyle = 'rgba(255,240,215,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (var b = 0; b < 16; b++) {
    var bx = x - r + 16 + hash(b, 31) * (r * 2 - 32) + Math.sin(t * 2 + b) * 5;
    var by = bot - (((t * (30 + hash(b, 32) * 40)) + hash(b, 33) * 400) % (bot - top));
    var br = 2 + hash(b, 34) * 4; ctx.moveTo(bx + br, by); ctx.arc(bx, by, br, 0, Math.PI * 2);
  }
  ctx.stroke(); ctx.restore();
  // the sleeping spirit
  spirit(x, (top + bot) / 2 - 6, 0.98, { t: c.t, mood: 'sleep', glow: 0.45 + 0.35 * glowK });
  // front glass: rim ellipses, highlights
  ctx.save();
  ctx.strokeStyle = 'rgba(200,250,255,0.75)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(x, top, r, 16, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x, bot, r, 16, 0, 0, Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - r, top); ctx.lineTo(x - r, bot); ctx.moveTo(x + r, top); ctx.lineTo(x + r, bot); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(x - r + 14, top + 12, 12, bot - top - 24);
  ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(x - r + 32, top + 12, 5, bot - top - 24);
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x + r - 30, top + 12, 8, bot - top - 24);
  ctx.restore();
  // metal bands
  cel(function () { rrect(x - r - 10, top - 10, r * 2 + 20, 22, 8); }, '#2a3270', { line: 3, ink: '#05071a' });
  cel(function () { rrect(x - r - 10, bot - 12, r * 2 + 20, 22, 8); }, '#2a3270', { line: 3, ink: '#05071a' });
  ctx.fillStyle = mix('#7df9ff', '#ffb347', hold);
  for (var k = 0; k < 5; k++) ctx.fillRect(x - 60 + k * 30, top - 3, 14, 4);
}
// a floating holo readout (mode 0: waveform, 1: ring gauge)
function nReadout(x, y, w, h, t, mode, ready, label) {
  holoPanel(x, y, w, h, 1, { fill: 'rgba(10,30,70,0.55)' });
  txt(label, x + 14, y + 24, 14, { font: 'r', color: '#bffaff', align: 'left', ls: 2 });
  var col = ready > 0.5 ? '#3ddc97' : '#7df9ff';
  if (mode === 0) {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath();
    for (var i = 0; i <= 40; i++) {
      var u = i / 40, px = x + 14 + u * (w - 28), ph = u * 9 - t * 2.4;
      var py = y + h * 0.62 + Math.sin(ph) * 10 + Math.sin(ph * 2.7) * 4 + (Math.abs(((ph % 6.28) + 6.28) % 6.28 - 3) < 0.25 ? -18 : 0);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke(); ctx.restore();
  } else {
    var cx = x + 50, cy = y + h * 0.6, rr = 28, v = 0.62 + 0.36 * ready;
    ctx.save(); ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(125,249,255,0.18)'; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(cx, cy, rr, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * v); ctx.stroke(); ctx.restore();
    txt(Math.round(v * 100) + '%', cx, cy + 6, 15, { font: 'r', color: '#ffffff' });
    for (var j = 0; j < 3; j++) { ctx.fillStyle = 'rgba(125,249,255,0.5)'; ctx.fillRect(x + 96, y + h * 0.42 + j * 14, (w - 112) * (0.4 + 0.5 * hash(j, Math.floor(t * 2))), 5); }
  }
  if (ready > 0) {
    var k = back(ready);
    at(x + w - 44, y + 20, k, 0, function () {
      ctx.fillStyle = '#3ddc97'; ctx.beginPath(); rrect(-34, -12, 68, 24, 12); ctx.fill();
      txt('READY', 0, 6, 13, { font: 'r', color: '#062a1c', ls: 1 });
    });
  }
}

/* ---------- HUD: the stamp and the test panel ---------- */
function nStamp(k, t) {
  if (!(k > 0)) return;
  var s = k < 1 ? lerp(1.7, 1, eo(k / 0.55)) : 1, a = clamp(k / 0.2);
  var land = seg(k, 0.5, 0.5);
  at(948, 214, s, -0.1, function () {
    fade(a, function () {
      var wd = 400, hd = 108, red = '#ff4d5e';
      ctx.fillStyle = 'rgba(60,8,20,0.55)'; ctx.beginPath(); rrect(-wd / 2, -hd / 2, wd, hd, 10); ctx.fill();
      ctx.strokeStyle = red; ctx.lineWidth = 7; ctx.beginPath(); rrect(-wd / 2, -hd / 2, wd, hd, 10); ctx.stroke();
      ctx.lineWidth = 2.5; ctx.beginPath(); rrect(-wd / 2 + 10, -hd / 2 + 10, wd - 20, hd - 20, 6); ctx.stroke();
      txt('NOT YET', 0, 25, 66, { color: '#ff6b78', stroke: '#2a0610', sw: 9 });
      // worn stamp texture: little gaps in the ink
      ctx.fillStyle = 'rgba(60,8,20,0.55)';
      for (var i = 0; i < 18; i++) ctx.fillRect(-wd / 2 + hash(i, 61) * wd, -hd / 2 + hash(i, 62) * hd, 3 + hash(i, 63) * 10, 2);
    });
  });
  if (land > 0 && land < 1) fade(1 - land, function () { ctx.strokeStyle = '#ff8a95'; ctx.lineWidth = 6 * (1 - land); ctx.beginPath(); ctx.ellipse(948, 214, 260 * (0.8 + land), 90 * (0.8 + land), -0.1, 0, Math.PI * 2); ctx.stroke(); });
}
var N_TESTS = [['RED-TEAMING', 0.74], ['EVALUATIONS', 0.58], ['ALIGNMENT CHECKS', 0.41]];
function nTests(s, t) {
  var k = seg(s, 0, 0.5);
  if (!(k > 0)) return;
  var x = 836, y = 420, w = 400, h = 214;
  ctx.save(); ctx.translate((1 - eo(k)) * 260, 0);
  fade(eo(k), function () {
    holoPanel(x, y, w, h, k, { fill: 'rgba(12,16,44,0.82)', color: '#ffb347' });
    txt('SAFETY TESTS:', x + 22, y + 42, 21, { align: 'left', color: '#ffffff', stroke: P.ink, sw: 5 });
    var on = pulse(t, 1.4) > 0.35, hx = x + 22 + txtWidth('SAFETY TESTS:', 21) + 14;
    ctx.fillStyle = '#ffb347'; if (on) { ctx.beginPath(); ctx.arc(hx + 6, y + 35, 5.5, 0, Math.PI * 2); ctx.fill(); }
    txt('RUNNING', hx + 18, y + 42, 19, { font: 'r', align: 'left', color: '#ffb347', ls: 2 });
    for (var i = 0; i < N_TESTS.length; i++) {
      var by = y + 76 + i * 46, bk = seg(s, 0.3 + i * 0.25, 1.4);
      var v = N_TESTS[i][1] * eo(bk) + (0.96 - N_TESTS[i][1]) * settle(s - 2 - i * 0.25, 18);
      txt(N_TESTS[i][0], x + 22, by, 14, { font: 'r', align: 'left', color: '#d8e6ff', ls: 2 });
      txt(Math.floor(v * 100) + '%', x + w - 22, by, 14, { font: 'r', align: 'right', color: '#ffffff' });
      ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(x + 22, by + 8, w - 44, 14);
      ctx.fillStyle = lin(x + 22, 0, x + w - 22, 0, [[0, '#ff9a3c'], [1, '#ffd23f']]); ctx.fillRect(x + 22, by + 8, (w - 44) * v, 14);
      // moving shimmer on the bar: the test is alive
      var sh = x + 22 + ((t * 160 + i * 90) % ((w - 44) * Math.max(v, 0.05)));
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(sh, by + 8, 10, 14);
    }
  });
  ctx.restore();
}

defineScene({
  id: 'notyet',
  title: 'Not Yet',
  alt: 'In a lab, a small sleeping Claude spirit floats inside a glowing glass capsule while two scientists check holographic readouts that turn ready. Then Dario steps in front and calmly holds out his arm before the capsule; a red NOT YET stamp appears and a panel shows safety tests running.',
  min: 9,
  lines: [
    'By summer 2022, an early version of me was ready.',
    'But they held me back for more safety testing, to avoid starting a dangerous race.'
  ],
  draw: function (c) {
    var t = c.t;
    var ready = seg(c.since(0, 0.78), 0, 0.5);
    var L1 = c.since(1, 0);
    var enter = eo(seg(L1, 0, 0.85));            // Dario steps in
    var stampS = c.since(1, 0.17);              // "held me back"
    var hold = seg(stampS, 0, 0.4);
    var land = stampS - 0.28;
    var testS = c.since(1, 0.3);                 // "more safety testing"
    var raceS = c.since(1, 0.62);                // "a dangerous race"
    var glowK = 0.3 + 0.5 * ready + 0.2 * pulse(t, 0.4);
    // camera: slow push on the capsule, then reframe for Dario, then a slow push toward his face
    var dr = drift(t, 0.8), sk = shake(t, 0.55 * kick(land, 0.35));
    var re = eio(seg(L1, 0, 1.2)), late = settle(raceS, 3);
    var dolly = settle(t, 4);
    var cam = {
      x: lerp(676 - 40 * dolly, 600, re) - 10 * late + dr[0] + sk[0],
      y: lerp(372, 354, re) - 8 * late + dr[1] + sk[1],
      z: lerp(1.0 + 0.04 * dolly, 1.06, re) + 0.03 * late,
      r: lerp(0, -0.02, re)
    };

    pcam(cam, 0.45, function () { nWall(t, hold); });
    pcam(cam, 0.8, function () { nFloor(t, glowK); bokeh(91, 12, t, { area: [0, 0, W, 560], size: 8, speed: 7, a: 0.5, colors: ['rgba(125,249,255,0.5)', 'rgba(255,190,120,0.45)'] }); });
    pcam(cam, 0.85, function () {
      nRig(t);
      nCapsule(c, t, glowK, hold, ready);
      fade(1 - 0.7 * hold, function () {
        nReadout(370, 206, 186, 112, t, 0, ready, 'VITALS');
        nReadout(846, 196, 196, 112, t, 1, ready, 'CORE');
      });
    });
    // the scientists, waist-up at the sides of the bay
    pcam(cam, 0.9, function () {
      var lookD = seg(L1, 0.5, 0.6);
      person('sciA', 220, 960, 1.68, { t: t, arms: 'hold', turn: 0.4, look: [lerp(0.7, -0.4, lookD), lerp(-0.15, 0, lookD)], expr: ready > 0.5 ? 'smile' : 'thinking', rim: '#ffc27a', light: 0.7 });
      person('sciB', 1090, 966, 1.68, { t: t + 1.3, flip: true, arms: 'type', turn: 0.4, look: [lerp(0.6, 1, lookD), lerp(-0.2, 0, lookD)], expr: L1 > 0.8 ? 'calm' : (ready > 0.5 ? 'smile' : 'thinking'), rim: '#ffc27a', light: 0.7 });
    });
    // depth: the bay recedes once Dario is in front
    if (enter > 0) fade(0.35 * enter, function () { ctx.fillStyle = lin(0, 0, W * 0.6, 0, [[0, 'rgba(6,8,26,1)'], [1, 'rgba(6,8,26,0)']]); ctx.fillRect(0, 0, W, H); });
    // Dario steps into the foreground and holds out a protective arm toward the capsule
    if (L1 > 0) {
      pcam(cam, 1, function () {
        var x = lerp(-320, 360, enter), moving = enter < 0.98;
        person('dario', x, 1270, 2.42, {
          t: t, walk: moving ? t * 8 : null, arms: L1 > 0.75 ? 'point' : 'down', turn: 0.3, look: [-0.25, -0.05],
          expr: 'calm', rim: '#ffc58a', light: 1, wind: 0.15
        });
      });
    }
    // out-of-focus console edge in the near foreground (bottom right)
    pcam(cam, 1.25, function () {
      ctx.fillStyle = '#04051a'; ctx.beginPath(); ctx.moveTo(1020, 760); ctx.lineTo(1080, 664); ctx.quadraticCurveTo(1090, 652, 1110, 652); ctx.lineTo(1400, 640); ctx.lineTo(1400, 760); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(125,249,255,0.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(1080, 664); ctx.quadraticCurveTo(1090, 652, 1110, 652); ctx.lineTo(1400, 640); ctx.stroke();
      for (var q = 0; q < 5; q++) { ctx.fillStyle = q === 2 ? 'rgba(255,179,71,0.9)' : 'rgba(125,249,255,0.8)'; ctx.fillRect(1140 + q * 26, 672, 12, 4); }
    });
    vignette(0.5 + 0.15 * late, 'rgba(4,5,20,1)');
    // amber hold light washes the edges (a status light, not an alarm)
    if (hold > 0) fade(hold * (0.10 + 0.05 * pulse(t, 0.8)), function () { ctx.fillStyle = rad(W / 2, H / 2, H * 0.4, W * 0.75, [[0, 'rgba(255,120,60,0)'], [1, 'rgba(255,120,60,1)']]); ctx.fillRect(0, 0, W, H); });
    nTests(testS, t);
    nStamp(seg(stampS, 0, 0.55), t);
    c.yr('2022');
  }
});
