/* 18-end: a rooftop at dawn above the waking city. The founders watch the sunrise, Dario at
   the centre with the Claude spirit beside him; on the last line they turn to the camera and
   smile, Dario waves, and the classic TO BE CONTINUED arrow slides in. */

var E_LINES = [
  'But the story isn\'t over.',
  'We\'re still learning, and still working to make AI safe and good for everyone.',
  'Thanks for watching. See you next episode!'
];

// who, x, feet y, scale, arms (watching the sunrise), row (0 back, 1 front)
var E_BACK = [
  ['jack', 96, 724, 1.1, 'down'], ['chris', 222, 730, 1.12, 'down'],
  ['sam', 1034, 736, 1.14, 'hips'], ['jared', 914, 740, 1.16, 'crossed'], ['tom', 800, 744, 1.16, 'down']
];

function eCam(cam, f, fn) {
  camera(640 + (cam.x - 640) * f + cam.dx * f, 360 + (cam.y - 360) * f + cam.dy * f, 1 + (cam.z - 1) * f, cam.r * f, fn);
}

function eSky(c, sunY, rise) {
  sky(['#28306e', '#7d5aa0', '#ff9e7a', '#ffd9a8'], 540);
  glow(1150, sunY, 560, 'rgba(255,200,140,0.45)');
  stars(19, 40, c.t, [-100, -80, 900, 240]);
  // fading stars as the dawn grows
  fade(0.5 * (1 - rise), function () { stars(23, 30, c.t, [-100, -80, 1400, 200]); });
  cloudRow(120, 44, c.t, 'dawn', 0.8, 4);
  cloudRow(300, 45, c.t * 0.6, 'dawn', 0.55, 3);
}
function eSun(c, sunY, rise) {
  rays(1150, sunY, 22, 1400, Math.PI * 2, 'rgba(255,225,180,0.85)', 0.12 + 0.1 * rise, c.t, -Math.PI / 2);
  sun(1150, sunY, 42, '#fff1cf');
  lensFlare(1150, sunY, 0.45 + 0.3 * rise, 0.4);
}
// a few birds crossing the dawn sky
function eBirds(c) {
  ctx.strokeStyle = '#2a2140'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (var i = 0; i < 6; i++) {
    var x = ((c.t * (26 + i * 3) + hash(81, i) * 1400) % 1500) - 120, y = 170 + hash(82, i) * 140 + Math.sin(c.t * 0.7 + i) * 8;
    var f = Math.sin(c.t * 7 + i * 1.7) * 5, sz = 7 + hash(83, i) * 5;
    ctx.beginPath(); ctx.moveTo(x - sz, y - f); ctx.quadraticCurveTo(x - sz * 0.4, y - 3, x, y); ctx.quadraticCurveTo(x + sz * 0.4, y - 3, x + sz, y - f); ctx.stroke();
  }
}
function eCity(c, sunY, rise) {
  // far haze skyline
  city(512, { color: '#9a7aa6', seed: 71, height: 120, bw: 48 });
  ctx.fillStyle = 'rgba(255,200,170,0.28)'; ctx.fillRect(-300, 430, W + 600, 90);
  // bay with the sun's reflection
  ctx.fillStyle = lin(0, 512, 0, 560, [[0, '#d99a96'], [1, '#8a6a92']]); ctx.fillRect(-300, 512, W + 600, 50);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var i = 0; i < 9; i++) {
    var w = 90 - i * 7 + Math.sin(c.t * 2 + i) * 10, y = 516 + i * 5;
    ctx.fillStyle = 'rgba(255,230,180,' + (0.55 - i * 0.05) + ')'; ctx.fillRect(1150 - w / 2 + Math.sin(c.t * 1.3 + i * 2) * 6, y, w, 2);
  }
  ctx.restore();
  // mid skyline: windows still lit, going out as the day arrives
  city(574, { color: '#5b4677', seed: 72, height: 150, bw: 70, lit: 'rgba(255,214,150,' + (0.65 - 0.35 * rise) + ')', density: 0.7, rim: 'rgba(255,190,140,0.55)' });
  city(606, { color: '#3d2f58', seed: 73, height: 90, bw: 96, rim: 'rgba(255,170,120,0.6)' });
}
function eRoof(c) {
  // railing at the roof edge, rim-lit by the sunrise
  ctx.fillStyle = '#2a2140'; ctx.fillRect(-300, 596, W + 600, 30);
  ctx.fillStyle = '#ffb27a'; ctx.fillRect(-300, 596, W + 600, 3);
  ctx.fillStyle = '#2a2140';
  for (var x = -280; x < W + 300; x += 96) ctx.fillRect(x, 548, 8, 50);
  ctx.fillRect(-300, 544, W + 600, 8);
  ctx.fillStyle = 'rgba(255,190,130,0.9)'; ctx.fillRect(-300, 544, W + 600, 2);
  // roof deck
  ctx.fillStyle = lin(0, 626, 0, 900, [[0, '#4a3a5e'], [1, '#1c1428']]); ctx.fillRect(-300, 626, W + 600, 400);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = lin(1150, 626, 300, 760, [[0, 'rgba(255,170,110,0.35)'], [1, 'rgba(255,170,110,0)']]); ctx.fillRect(-300, 626, W + 600, 200);
  ctx.restore();
  // water tank silhouette (left)
  at(-20, 600, 1, 0, function () {
    ctx.fillStyle = '#2a2140';
    ctx.fillRect(-60, -240, 150, 170); ctx.beginPath(); ctx.moveTo(-70, -240); ctx.lineTo(15, -300); ctx.lineTo(100, -240); ctx.closePath(); ctx.fill();
    ctx.fillRect(-50, -70, 10, 70); ctx.fillRect(70, -70, 10, 70);
    ctx.fillStyle = 'rgba(255,180,120,0.8)'; ctx.fillRect(86, -240, 4, 170);
  });
}
// the classic anime "to be continued" arrow card (points left)
function eTBC(k, t) {
  if (!(k > 0)) return;
  var e = eo(k), x = lerp(W + 40, 790, e), y = 612;
  ctx.save();
  ctx.translate(x, y);
  var w = 446, h = 60;
  ctx.fillStyle = P.ink;
  ctx.beginPath(); ctx.moveTo(-34, h / 2); ctx.lineTo(16, -10); ctx.lineTo(16, 4); ctx.lineTo(w, 4); ctx.lineTo(w - 14, h - 4); ctx.lineTo(16, h - 4); ctx.lineTo(16, h + 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f3e3c2';
  ctx.beginPath(); ctx.moveTo(-22, h / 2); ctx.lineTo(10, 4); ctx.lineTo(10, 10); ctx.lineTo(w - 10, 10); ctx.lineTo(w - 20, h - 10); ctx.lineTo(10, h - 10); ctx.lineTo(10, h - 4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.claude; ctx.fillRect(22, h - 16, w - 50, 4);
  txt('TO BE CONTINUED', w / 2 + 6, 44, 30, { color: P.ink, ls: 1 });
  ctx.restore();
  fade(seg(k, 0.5, 0.5), function () {
    txt('HELPFUL · HONEST · HARMLESS', 1236, 596, 19, { font: 'r', color: '#ffffff', align: 'right', ls: 3, stroke: 'rgba(34,24,47,0.85)', sw: 5 });
  });
}

defineScene({
  id: 'end',
  title: 'To Be Continued',
  alt: 'On a city rooftop at dawn the founders watch the sunrise with the Claude spirit beside Dario, then turn to the camera and smile while Dario waves; a TO BE CONTINUED arrow appears.',
  min: 11,
  transition: 'fade',
  lines: E_LINES,
  draw: function (c) {
    var t = c.t;
    var rise = clamp(t / 12), sunY = lerp(452, 372, eo(rise));
    var turnK = eio(seg(c.since(2, 0), 0, 0.7)), waveOn = c.since(2, 0.05) > 0;
    var tbcK = seg(c.since(2, 0.45), 0, 0.7);
    // camera: open on Dario's profile in the dawn light, pull back to the whole group, small settle on the turn
    var open = eio(clamp(seg(t, 0.1, 0.5) * 0.15 + c.lineK(0) * 0.45 + c.lineK(1) * 0.4));
    var dr = drift(t, 0.8), bump = Math.sin(turnK * Math.PI) * 0.012;
    var cam = { x: lerp(600, 652, open), y: lerp(300, 372, open), z: lerp(1.32, 1.0, open) + 0.02 * eio(seg(t, 8, 10)) + bump, r: lerp(0.025, 0, open), dx: dr[0], dy: dr[1] };

    eCam(cam, 0.2, function () { eSky(c, sunY, rise); });
    eCam(cam, 0.3, function () { eSun(c, sunY, rise); eBirds(c); });
    eCam(cam, 0.5, function () { eCity(c, sunY, rise); });
    eCam(cam, 0.8, function () { eRoof(c); });
    var look = [lerp(0.8, 0, turnK), lerp(-0.25, 0, turnK)], turn = lerp(0.55, 0, turnK);
    eCam(cam, 0.95, function () {
      for (var i = 0; i < E_BACK.length; i++) {
        var b = E_BACK[i];
        person(b[0], b[1], b[2], b[3], { t: t + i * 0.9, arms: turnK > 0.5 && i === 0 ? 'wave' : b[4], expr: turnK > 0.5 ? 'smile' : 'calm', look: look, turn: turn, wind: 0.45, rim: '#ffc890', light: 0.95 });
      }
    });
    // dawn haze between the rows pushes the back row into depth
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = lin(0, 120, 0, 720, [[0, 'rgba(255,170,150,0.1)'], [0.6, 'rgba(255,170,150,0.06)'], [1, 'rgba(255,170,150,0)']]); ctx.fillRect(0, 0, W, H);
    ctx.restore();
    eCam(cam, 1.0, function () {
      var bob = Math.sin(t * 1.6) * 6;
      spirit(498, 100 + bob, 0.48, { t: t, mood: turnK > 0.5 ? 'happy' : (c.since(1, 0.3) > 0 ? 'determined' : 'calm'), glow: 0.8, wave: waveOn, look: [lerp(0.8, 0, turnK), 0] });
    });
    eCam(cam, 1.1, function () {
      person('daniela', 398, 904, 1.62, { t: t + 0.4, arms: 'down', expr: turnK > 0.5 ? 'smile' : 'calm', look: look, turn: turn, wind: 0.55, rim: '#ffc890', light: 1 });
      person('dario', 612, 912, 1.76, { t: t, arms: waveOn ? 'wave' : 'down', expr: turnK > 0.5 ? 'grin' : (c.since(1, 0) > 0 ? 'determined' : 'calm'), look: look, turn: turn, wind: 0.6, rim: '#ffc890', light: 1 });
    });
    // atmosphere: warm sunrise light washing over the group from the right
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = lin(1280, 0, 300, 200, [[0, 'rgba(255,170,100,0.15)'], [1, 'rgba(255,170,100,0)']]); ctx.fillRect(0, 0, W, H);
    ctx.restore();
    petals(18, 12, t, { color: 'rgba(255,214,190,0.8)', wind: 40 });
    bokeh(5, 8, t, { colors: ['rgba(255,220,170,0.5)', 'rgba(255,170,190,0.4)'], size: 24, speed: 6, a: 0.7 });
    vignette(0.35, 'rgba(50,20,40,1)');
    // end card: warm "freeze-frame" wash, then the arrow and the promise
    if (tbcK > 0) tint('#ffcf8a', 0.12 * tbcK);
    eTBC(tbcK, t);
  }
});
