/* 05-leap: golden hour. The seven co-founders walk toward the camera in a V
   while the camera dollies back down a long plaza, then stop in a heroic pose. */

function pcam(cam, d, fn) { camera(lerp(W / 2, cam.x, d), lerp(H / 2, cam.y, d), 1 + (cam.z - 1) * d, (cam.r || 0) * d, fn); }
function kick(s, d) { return s >= 0 && s < d ? 1 - s / d : 0; }
function settle(s, tau) { return s > 0 ? 1 - Math.exp(-s / tau) : 0; }
function skyline(x0, x1, gy, o) {
  var seed = o.seed, x = x0, i = 0, b = [];
  ctx.beginPath();
  while (x < x1) {
    var w = (o.bw || 64) * (0.6 + hash(seed, i) * 0.9), h = o.height * (0.3 + hash(seed + 1, i) * 0.7);
    ctx.rect(x, gy - h, w + 1, h + 400);
    if (hash(seed + 7, i) > 0.75) ctx.rect(x + w * 0.45, gy - h - 16, 2, 16);
    b.push([x, w, h]);
    x += w + 2 + hash(seed + 2, i) * 8; i++;
  }
  ctx.fillStyle = o.color; ctx.fill();
  if (o.rim) { ctx.beginPath(); for (var j = 0; j < b.length; j++) ctx.rect(b[j][0], gy - b[j][2], b[j][1] + 1, 2); ctx.fillStyle = o.rim; ctx.fill(); }
  if (o.lit) {
    ctx.beginPath();
    for (var k = 0; k < b.length; k++) for (var r = 0; r < b[k][2] / 14 - 1; r++) for (var q = 0; q < b[k][1] / 11 - 1; q++)
      if (hash(seed + k * 31 + r, q) > (o.density || 0.75)) ctx.rect(b[k][0] + 4 + q * 11, gy - b[k][2] + 7 + r * 14, 4, 5);
    ctx.fillStyle = o.lit; ctx.fill();
  }
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

// Plaza perspective: vanishing point at the low sun.
var L_VX = 668, L_HZ = 400, L_F = 520;
function lp(X, Y, z) { var k = L_F / z; return [L_VX + X * k, L_HZ + (1.6 - Y) * k]; }

function lPlaza(t, camZ) {
  // ground with the sun's reflection running down the middle
  ctx.fillStyle = lin(0, L_HZ, 0, H + 60, [[0, '#ffcf93'], [0.06, '#e3a083'], [0.3, '#8a566e'], [0.7, '#3d2440'], [1, '#26162b']]);
  ctx.fillRect(-300, L_HZ, W + 600, H);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.translate(L_VX, L_HZ); ctx.scale(0.55, 1.9);
  ctx.fillStyle = rad(0, 0, 0, 260, [[0, 'rgba(255,214,150,0.55)'], [0.5, 'rgba(255,170,110,0.18)'], [1, 'rgba(255,150,100,0)']]);
  ctx.fillRect(-260, 0, 520, 260);
  ctx.restore();
  // paving seams: lines to the vanishing point, and cross seams that slide away as the camera retreats
  ctx.strokeStyle = 'rgba(58,28,58,0.2)'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (var X = -40; X <= 40; X += 8) { var a = lp(X, 0, 1.2); ctx.moveTo(a[0], a[1]); ctx.lineTo(L_VX + X * 0.4, L_HZ + 0.6); }
  ctx.stroke();
  // wide paving bands (alternate tones) whose seams slide away as the camera retreats
  var off = camZ % 6;
  ctx.fillStyle = 'rgba(70,32,64,0.13)'; ctx.beginPath();
  for (var i = 0; i < 24; i++) {
    var z0 = 6 * i + off - 3, z1 = z0 + 3; if (z1 < 0.8) continue; z0 = Math.max(0.8, z0);
    var y0 = lp(0, 0, z0)[1], y1 = lp(0, 0, z1)[1]; ctx.rect(-300, y1, W + 600, y0 - y1);
  }
  ctx.fill();
  ctx.strokeStyle = 'rgba(58,28,58,0.22)'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (var q = 1; q < 46; q++) { var z = 3 * q - 2 + (camZ % 3), y = lp(0, 0, z)[1]; if (y < L_HZ + 2) break; ctx.moveTo(-300, y); ctx.lineTo(W + 300, y); }
  ctx.stroke();
  // a golden glint on the seams near the horizon
  ctx.strokeStyle = 'rgba(255,220,160,0.35)'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (var j = 4; j < 46; j++) { var z2 = 3 * j - 2 + off, y2 = lp(0, 0, z2)[1]; ctx.moveTo(L_VX - 260 * 12 / z2 - 40, y2 - 1); ctx.lineTo(L_VX + 260 * 12 / z2 + 40, y2 - 1); }
  ctx.stroke();
}
// Lamp posts along both sides of the plaza, drawn far to near.
function lLamps(t, camZ) {
  var span = 16, list = [];
  for (var i = 9; i >= 0; i--) list.push(4 + i * span + (camZ % span));
  for (var n = 0; n < list.length; n++) {
    var zz = list[n];
    if (zz < 2.2) continue;
    for (var sd = -1; sd <= 1; sd += 2) {
      var g = lp(sd * 13, 0, zz), tp = lp(sd * 13, 5.2, zz), k = L_F / zz, w = Math.max(1.2, 0.16 * k);
      ctx.fillStyle = '#2a1830'; ctx.fillRect(g[0] - w / 2, tp[1], w, g[1] - tp[1]);
      ctx.fillStyle = 'rgba(255,196,130,0.8)'; ctx.fillRect(g[0] - sd * w / 2 - (sd > 0 ? 0 : 1), tp[1], 1.2, g[1] - tp[1]);
      // lamp head and its first warm glow of the evening
      var hw = 0.5 * k, hh = 0.32 * k;
      ctx.fillStyle = '#2a1830'; ctx.fillRect(tp[0] - hw / 2 - sd * hw * 0.3, tp[1] - hh, hw, hh);
      glow(tp[0] - sd * hw * 0.3, tp[1] - hh * 0.2, hw * 1.6, 'rgba(255,210,140,0.55)');
    }
  }
}

var L_CREW = [
  // who, x, ground y, scale, final arms, final expression, walk phase offset
  ['tom', 112, 616, 0.85, 'fist', 'determined', 1.3],
  ['chris', 1150, 690, 1.05, 'hips', 'smile', 2.1],
  ['jack', 226, 690, 1.06, 'crossed', 'smile', 0.4],
  ['sam', 1014, 768, 1.3, 'hips', 'smile', 2.9],
  ['jared', 330, 768, 1.33, 'crossed', 'calm', 1.8],
  ['daniela', 850, 872, 1.72, 'hips', 'determined', 0.9],
  ['dario', 500, 882, 1.8, 'fist', 'determined', 0]
];

defineScene({
  id: 'leap',
  title: 'The Leap',
  alt: 'At golden hour the seven co-founders walk toward the camera in a V, Dario and Daniela in front, the low sun blazing behind them; they stop in a heroic pose as the words SAFETY FIRST slam in.',
  min: 10,
  transition: 'flash',
  lines: [
    'So in 2021, Dario, Daniela and five colleagues made a bold choice.',
    'They left OpenAI to build a new kind of AI company, with safety first.'
  ],
  draw: function (c) {
    var t = c.t;
    var tStop = c.when(1, 0.22), stopS = c.since(1, 0.22);
    var walking = !(stopS >= 0);
    var walkT = Math.min(t, tStop);
    var camZ = 1.25 * walkT + 0.9 * settle(stopS, 0.5);
    var dr = drift(t, 0.8), sk = shake(t, 0.75 * kick(stopS, 0.5));
    var punch = 0.035 * eo(seg(stopS, 0, 0.35)) - 0.012 * seg(stopS, 0.35, 1.2);
    var bg = { x: 640 + dr[0] * 0.6 + sk[0], y: 360 + dr[1] * 0.6 + sk[1], z: 1.07 - 0.07 * eio(seg(walkT, 0, 6)) + punch, r: 0 };
    var fg = { x: 640 + dr[0] + sk[0], y: 360 + dr[1] + sk[1], z: 1 + punch * 1.3, r: 0 };
    var sun = [L_VX, L_HZ - 34];

    // --- sky, sun and far city ---
    pcam(bg, 0.1, function () {
      sky(['#2c3b82', '#9a72aa', '#ffa56a', '#ffdc9a'], L_HZ);
      var hi = ['#c98aa6', '#6a5494', '#ffd7a8'], lo = ['#f4b08e', '#b0729a', '#fff0c4'];
      var cl = [[100, 70, 700, 70, 5, hi], [1150, 40, 760, 66, 9, hi], [640, 150, 520, 44, 14, hi], [-40, 250, 560, 48, 21, lo], [1290, 270, 600, 46, 31, lo], [700, 300, 360, 22, 37, lo]];
      for (var i = 0; i < cl.length; i++) bank(cl[i][0] + t * 6, cl[i][1], cl[i][2], cl[i][3], cl[i][4], cl[i][5]);
    });
    pcam(bg, 0.15, function () {
      bloom(sun[0], sun[1], 560, 'rgba(255,150,90,0.26)');
      sunDisc(sun[0], sun[1]);
    });
    rays(sun[0], sun[1], 26, 1300, Math.PI * 2, 'rgba(255,214,150,1)', 0.12 + 0.03 * pulse(t, 0.25), t * 0.6, -Math.PI / 2 + t * 0.01);
    pcam(bg, 0.2, function () {
      skyline(-300, 1600, L_HZ + 4, { seed: 5, color: 'rgba(214,150,150,0.85)', height: 64, bw: 40 });
      skyline(-300, 1600, L_HZ + 8, { seed: 12, color: '#8d5878', height: 42, bw: 54, lit: 'rgba(255,224,170,0.8)', rim: 'rgba(255,214,160,0.9)' });
    });

    // --- plaza and lamp posts (true perspective: they recede as the camera retreats) ---
    pcam(bg, 0.6, function () { lPlaza(t, camZ); lLamps(t, camZ); });

    // --- the crew: long shadows toward us, then the people back to front ---
    pcam(fg, 1, function () {
      var i, p;
      ctx.fillStyle = 'rgba(40,18,44,0.38)';
      ctx.beginPath();
      for (i = 0; i < L_CREW.length; i++) {
        p = L_CREW[i];
        var spread = (p[1] - L_VX) * 0.9;
        ctx.moveTo(p[1] - 26 * p[3], p[2] - 4); ctx.lineTo(p[1] + 26 * p[3], p[2] - 4);
        ctx.lineTo(p[1] + spread + 90 * p[3], H + 120); ctx.lineTo(p[1] + spread - 70 * p[3], H + 120); ctx.closePath();
      }
      ctx.fill();
      for (i = 0; i < L_CREW.length; i++) {
        p = L_CREW[i];
        var ph = t * 5.2 + p[6] * 2;
        var bob = walking ? -Math.abs(Math.sin(ph)) * 7 * p[3] : 0;
        var land = walking ? 0 : -10 * p[3] * kick(stopS, 0.35);
        person(p[0], p[1], p[2] + bob + land, p[3], {
          t: t, walk: walking ? ph : null, arms: walking ? 'down' : p[4], expr: walking ? 'determined' : p[5],
          wind: 0.7, look: [0, walking ? 0 : -0.05], rim: '#ffe0a0', light: 1
        });
      }
    });

    // --- light wrap, flare, drifting leaves ---
    bloom(sun[0], sun[1] + 10, 260, 'rgba(255,190,120,0.45)', 0.45);
    rays(sun[0], sun[1], 10, 900, 1.6, 'rgba(255,230,180,1)', 0.06, t, -Math.PI / 2);
    flare(sun[0], sun[1], 0.8 + 0.15 * pulse(t, 0.3));
    petals(17, 16, t, { color: '#ffc46b', wind: -70 });
    at(W / 2, H / 2, 1.7, 0, function () { ctx.translate(-W / 2, -H / 2); petals(29, 7, t * 1.3, { color: '#ff9f5a', wind: -90 }); });

    // --- the stop: speed lines, flash ---
    if (stopS > 0) {
      speedLines(640, 330, t, { n: 64, inner: 420, color: '#fff3d6', a: 0.6 * kick(stopS, 1.4) });
      flash(0.45 * kick(stopS, 0.3), '#fff4dc');
    }
    // backlit grade: the lower frame falls into warm shadow
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = lin(0, 300, 0, H, [[0, 'rgba(255,255,255,0)'], [1, 'rgba(150,100,140,0.55)']]); ctx.fillRect(0, 300, W, H - 300);
    ctx.restore();
    vignette(0.42, 'rgba(30,10,30,1)');

    // --- SAFETY FIRST kicker ---
    var kk = seg(c.since(1, 0.8), 0, 0.5);
    if (kk > 0) {
      var pk = eo(seg(kk, 0, 0.6));
      at(640, 652, 1, -0.03, function () {
        fade(pk, function () {
          ctx.fillStyle = P.ink; ctx.beginPath(); poly([[-262 * pk, -40], [272 * pk, -40], [252 * pk, 32], [-282 * pk, 32]]); ctx.fill();
          ctx.fillStyle = P.claude; ctx.beginPath(); poly([[-254 * pk, -34], [264 * pk, -34], [246 * pk, 25], [-272 * pk, 25]]); ctx.fill();
        });
      });
      slam('SAFETY FIRST', 640, 668, 46, kk, { rot: -0.03 });
    }
    c.yr('2021');
  }
});

// Compact anamorphic flare: hot core, short streak, a few ghosts toward the frame centre.
function flare(x, y, k) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= clamp(k);
  glow(x, y, 160, 'rgba(255,226,180,0.5)');
  ctx.fillStyle = lin(x - 230, 0, x + 230, 0, [[0, 'rgba(255,190,140,0)'], [0.5, 'rgba(255,236,210,0.45)'], [1, 'rgba(255,190,140,0)']]);
  ctx.fillRect(x - 230, y - 1.5, 460, 3);
  var g = [[0.35, 26, 'rgba(140,200,255,0.16)'], [0.7, 12, 'rgba(255,180,120,0.22)'], [1.25, 44, 'rgba(170,130,255,0.1)']];
  for (var i = 0; i < g.length; i++) glow(x + (W / 2 - x) * g[i][0] * 2, y + (H * 0.62 - y) * g[i][0] * 2, g[i][1] * 2, g[i][2]);
  ctx.restore();
}
function sunDisc(x, y) {
  bloom(x, y, 170, 'rgba(255,190,120,0.45)');
  ctx.fillStyle = '#fff2cf'; ctx.beginPath(); ctx.arc(x, y, 44, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 36, 0, Math.PI * 2); ctx.fill();
  bloom(x, y, 74, 'rgba(255,248,225,0.6)');
}
