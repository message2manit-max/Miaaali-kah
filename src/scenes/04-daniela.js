/* 04-daniela: Daniela's close-up and name card in a warm room at dusk, then the
   camera pulls back to a two-shot as Dario steps in beside her. */

// Parallax camera: d = 0 is pinned to the screen (infinitely far), d = 1 is the actor plane.
function pcam(cam, d, fn) { camera(lerp(W / 2, cam.x, d), lerp(H / 2, cam.y, d), 1 + (cam.z - 1) * d, (cam.r || 0) * d, fn); }
function scr(cam, d, x, y) {
  var cx = lerp(W / 2, cam.x, d), cy = lerp(H / 2, cam.y, d), z = 1 + (cam.z - 1) * d;
  return [W / 2 + (x - cx) * z, H / 2 + (y - cy) * z];
}
function kick(s, d) { return s >= 0 && s < d ? 1 - s / d : 0; }
function settle(s, tau) { return s > 0 ? 1 - Math.exp(-s / tau) : 0; }

// Batched skyline over [x0, x1]: one fill for the blocks, one for the windows.
function skyline(x0, x1, gy, o) {
  var seed = o.seed, x = x0, i = 0, b = [];
  ctx.beginPath();
  while (x < x1) {
    var w = (o.bw || 64) * (0.6 + hash(seed, i) * 0.9), h = o.height * (0.3 + hash(seed + 1, i) * 0.7);
    ctx.rect(x, gy - h, w + 1, h + 700);
    if (hash(seed + 7, i) > 0.75) ctx.rect(x + w * 0.45, gy - h - 22, 3, 22);
    b.push([x, w, h]);
    x += w + 2 + hash(seed + 2, i) * 8; i++;
  }
  ctx.fillStyle = o.color; ctx.fill();
  if (o.rim) { ctx.beginPath(); for (var j = 0; j < b.length; j++) ctx.rect(b[j][0], gy - b[j][2], b[j][1] + 1, 2.5); ctx.fillStyle = o.rim; ctx.fill(); }
  if (o.lit) {
    ctx.beginPath();
    for (var k = 0; k < b.length; k++) {
      for (var r = 0; r < b[k][2] / 17 - 1; r++) for (var q = 0; q < b[k][1] / 14 - 1; q++)
        if (hash(seed + k * 31 + r, q) > (o.density || 0.72)) ctx.rect(b[k][0] + 5 + q * 14, gy - b[k][2] + 9 + r * 17, 5, 7);
    }
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

var D_SKY = ['#1b1a46', '#573a7c', '#dc6378', '#ffb371'];
var D_SUN = [650, 468];           // sun, on the depth-0.15 layer
var D_WIN = [130, -300, 1180, 560]; // window opening on the wall layer (depth 0.62)

function dRoom(t) {
  var x0 = D_WIN[0], y0 = D_WIN[1], x1 = D_WIN[2], y1 = D_WIN[3];
  // faint glass sheen streaks
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(255,225,205,0.05)';
  ctx.beginPath(); poly([[x0 + 160, y0], [x0 + 330, y0], [x0 - 10, y1], [x0 - 180, y1]]);
  poly([[x1 - 260, y0], [x1 - 200, y0], [x1 - 520, y1], [x1 - 580, y1]]); ctx.fill();
  ctx.restore();
  // wall with the window cut out
  ctx.beginPath(); ctx.rect(-700, -700, 2800, 1900); ctx.rect(x0, y0, x1 - x0, y1 - y0);
  ctx.fillStyle = lin(-200, 0, 1500, 0, [[0, '#2c1a29'], [0.3, '#47283a'], [0.7, '#4a2a3b'], [1, '#2a1928']]);
  ctx.fill('evenodd');
  // frame, transom and the sun-lit sill
  ctx.fillStyle = '#21141f';
  ctx.fillRect(x0 - 22, y0, 22, y1 - y0 + 30); ctx.fillRect(x1, y0, 22, y1 - y0 + 30);
  ctx.fillRect(x0, 96, x1 - x0, 12);
  ctx.fillStyle = 'rgba(255,170,110,0.75)';
  ctx.fillRect(x0 - 3, y0, 3, y1 - y0); ctx.fillRect(x1, y0, 3, y1 - y0); ctx.fillRect(x0, 108, x1 - x0, 2);
  ctx.fillStyle = lin(0, y1, 0, y1 + 34, [[0, '#9a5a55'], [0.25, '#6a3a45'], [1, '#2a1826']]);
  ctx.fillRect(x0 - 40, y1, x1 - x0 + 80, 34);
  ctx.fillStyle = 'rgba(255,196,140,0.9)'; ctx.fillRect(x0 - 40, y1, x1 - x0 + 80, 3);
  // sheer curtains glowing with backlight, swaying a little
  var sway = Math.sin(t * 0.7) * 8;
  dCurtain(x0 - 30, 210, y0, y1 + 20, sway, 1);
  dCurtain(x1 + 30, 190, y0, y1 + 20, -sway * 0.8, -1);
}
function dCurtain(x, w, y0, y1, sway, dir) {
  ctx.save();
  ctx.fillStyle = lin(x, 0, x + dir * w, 0, [[0, 'rgba(255,224,196,0.55)'], [0.6, 'rgba(255,190,160,0.32)'], [1, 'rgba(255,170,150,0.06)']]);
  ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + dir * w * 0.7, y0);
  ctx.bezierCurveTo(x + dir * w * 0.9, y0 + 300, x + dir * (w + sway), y1 - 260, x + dir * (w * 0.95 + sway), y1);
  ctx.lineTo(x, y1); ctx.closePath(); ctx.fill();
  // folds
  ctx.strokeStyle = 'rgba(150,80,90,0.28)'; ctx.lineWidth = 6;
  ctx.beginPath();
  for (var i = 1; i < 4; i++) { var fx = x + dir * w * i * 0.22; ctx.moveTo(fx, y0); ctx.quadraticCurveTo(fx + dir * 10, (y0 + y1) / 2, fx + dir * (i * 7 + sway * 0.6), y1); }
  ctx.stroke();
  ctx.restore();
}
function dProps(t) {
  // bookshelf on the left, lit from the window side
  ctx.fillStyle = '#24151f'; ctx.fillRect(-260, 40, 360, 800);
  ctx.fillStyle = 'rgba(255,170,110,0.55)'; ctx.fillRect(96, 40, 4, 800);
  var cols = ['#5a3346', '#3d4a6a', '#6e4a3a'];
  for (var ci = 0; ci < 3; ci++) {
    ctx.beginPath();
    for (var sh = 0; sh < 6; sh++) {
      var sy = 70 + sh * 118, bx = -240;
      for (var k = 0; bx < 84; k++) {
        var bw = 12 + hash(sh * 17 + k, 5) * 14, bh = 70 + hash(sh, k * 3) * 30;
        if (Math.floor(hash(k, sh * 7) * 3) === ci) ctx.rect(bx, sy + 96 - bh, bw, bh);
        bx += bw + 2;
      }
    }
    ctx.fillStyle = cols[ci]; ctx.fill();
  }
  ctx.fillStyle = '#1a0f17'; for (var s2 = 0; s2 < 7; s2++) ctx.fillRect(-260, 64 + s2 * 118 + 102, 360, 10);
  // warm floor lamp on the right
  var lx = 1238;
  bloom(lx, 236, 300, 'rgba(255,170,90,0.35)');
  ctx.fillStyle = '#1c1118'; ctx.fillRect(lx - 4, 270, 8, 600);
  ctx.beginPath(); poly([[lx - 52, 190], [lx + 52, 190], [lx + 72, 272], [lx - 72, 272]]);
  ctx.fillStyle = lin(0, 190, 0, 272, [[0, '#ffe2b0'], [1, '#ffb070']]); ctx.fill();
  ctx.fillStyle = 'rgba(255,240,210,0.9)'; ctx.fillRect(lx - 72, 270, 144, 4);
  bloom(lx, 280, 120, 'rgba(255,220,160,0.5)');
}

// Compact anamorphic flare: hot core, short streak, a few ghosts toward the frame centre.
function flare(x, y, k) {
  if (!(k > 0.01)) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= clamp(k);
  glow(x, y, 120, 'rgba(255,214,170,0.5)');
  ctx.fillStyle = lin(x - 260, 0, x + 260, 0, [[0, 'rgba(255,190,140,0)'], [0.5, 'rgba(255,236,210,0.45)'], [1, 'rgba(255,190,140,0)']]);
  ctx.fillRect(x - 260, y - 1.5, 520, 3);
  var g = [[0.35, 22, 'rgba(140,200,255,0.16)'], [0.7, 12, 'rgba(255,180,120,0.22)'], [1.25, 40, 'rgba(170,130,255,0.1)']];
  for (var i = 0; i < g.length; i++) glow(x + (W / 2 - x) * g[i][0] * 2, y + (H / 2 - y) * g[i][0] * 2, g[i][1] * 2, g[i][2]);
  ctx.restore();
}

defineScene({
  id: 'daniela',
  title: 'Daniela',
  alt: 'In a warm room at dusk, a close-up of Daniela Amodei with her name card; the camera pulls back as her brother Dario steps in beside her, and both look ahead, determined, in the sunset light.',
  min: 9,
  lines: [
    'His sister, Daniela Amodei, led safety and policy work at OpenAI.',
    'She shared that worry, and she was ready to act.'
  ],
  draw: function (c) {
    var t = c.t;
    var L1 = c.since(1, 0);                       // line 2 starts: widen
    var wide = eio(seg(L1, 0.05, 1.6));
    var act = c.since(1, 0.66);                   // "ready to act"
    var actK = seg(act, 0, 0.6);
    var dr = drift(t, 1), sk = shake(t, 0.55 * kick(act, 0.45));
    var cu = settle(t, 7), hold = settle(L1 - 1.6, 6);
    var cam = {
      x: lerp(1022 - 16 * cu, 640, wide) + dr[0] + sk[0],
      y: lerp(426 - 6 * cu, 380, wide) + dr[1] + sk[1],
      z: lerp(1.26 + 0.06 * cu, 1.0 + 0.045 * hold, wide),
      r: lerp(-0.016, 0.004, wide)
    };

    // --- outside: dusk sky, sun, clouds, city ---
    pcam(cam, 0.12, function () {
      sky(D_SKY, 560);
      fade(0.45, function () { stars(41, 26, t, [-300, -400, 1900, 520]); });
    });
    pcam(cam, 0.15, function () {
      bloom(D_SUN[0], D_SUN[1], 520, 'rgba(255,120,90,0.28)');
      sun(D_SUN[0], D_SUN[1], 30, '#fff1cf');
    });
    pcam(cam, 0.2, function () {
      var hi = ['#a4588a', '#4a3277', '#ffb48a'], lo = ['#e0788a', '#8a4a86', '#ffd9a6'];
      var cl = [[-140, 120, 640, 70, 3, hi], [760, 70, 760, 76, 11, hi], [1500, 150, 640, 64, 19, hi], [240, 300, 560, 50, 27, lo], [1180, 330, 620, 46, 33, lo]];
      for (var i = 0; i < cl.length; i++) bank(cl[i][0] + t * 5, cl[i][1], cl[i][2], cl[i][3], cl[i][4], cl[i][5]);
      // thin glowing streaks near the horizon
      ctx.fillStyle = 'rgba(255,170,130,0.5)';
      ctx.beginPath(); ctx.ellipse(80, 420, 420, 4, 0, 0, Math.PI * 2); ctx.ellipse(1250, 436, 480, 3.5, 0, 0, Math.PI * 2); ctx.ellipse(500, 452, 300, 3, 0, 0, Math.PI * 2); ctx.fill();
    });
    pcam(cam, 0.3, function () {
      skyline(-500, 1900, 590, { seed: 4, color: '#7d5288', height: 120, bw: 52, rim: 'rgba(255,190,150,0.55)' });
    });
    pcam(cam, 0.42, function () {
      skyline(-600, 2000, 650, { seed: 9, color: '#38264f', height: 160, bw: 74, lit: 'rgba(255,206,140,0.85)', density: 0.76, rim: 'rgba(255,170,120,0.7)' });
    });

    // --- the room ---
    pcam(cam, 0.62, function () { dRoom(t); });
    pcam(cam, 0.8, function () { dProps(t); });

    // window light streaming into the room
    var sp = scr(cam, 0.15, D_SUN[0], D_SUN[1]);
    rays(sp[0], sp[1], 16, 1300, 2.9, 'rgba(255,196,150,0.9)', 0.1 + 0.03 * pulse(t, 0.3), t, Math.PI / 2);

    // --- the siblings ---
    pcam(cam, 1, function () {
      var dlook = L1 < 0 ? [-0.22, 0.04] : [lerp(-0.75, 0.05, actK), lerp(0, -0.06, actK)];
      var dexpr = L1 < 0 ? 'calm' : (act < 0 ? 'worried' : 'determined');
      bust('daniela', 850, 752, 1.16, { t: t, expr: dexpr, look: dlook, turn: L1 < 0 ? -0.2 : lerp(-0.35, -0.1, actK), rim: '#ffc68c', light: 0.9, wind: 0.18 });
      if (L1 > 0.1) {
        var dIn = eo(seg(L1, 0.1, 1.35));
        bust('dario', lerp(120, 440, dIn), lerp(760, 745, dIn), lerp(1.12, 1.22, dIn), {
          t: t, expr: act < 0 ? 'worried' : 'determined', look: [lerp(0.75, 0.1, actK), lerp(0, -0.06, actK)],
          turn: lerp(0.35, 0.12, actK), rim: '#ffc68c', light: 0.9, wind: 0.18
        });
      }
    });

    // --- light wrap, flare, motes ---
    bloom(sp[0], sp[1], 170, 'rgba(255,170,110,0.5)', 0.3);
    // the flare dips while the sun slides behind Daniela during the pull-back
    flare(sp[0], sp[1], (0.42 + 0.3 * wide + 0.08 * pulse(t, 0.4) + 0.4 * kick(act, 1.2)) * (1 - 0.85 * Math.sin(Math.PI * wide)));
    bokeh(7, 12, t, { colors: ['rgba(255,200,140,0.5)', 'rgba(255,150,170,0.35)', 'rgba(255,232,190,0.4)'], size: 24, speed: 6, a: 0.55 });

    // --- resolve: sparkles burst outward, a light sweep ---
    if (act > 0) {
      // sparkles burst upward from just above their heads, then a few keep glinting there
      var hx = scr(cam, 1, 645, 170);
      for (var i = 0; i < 12; i++) {
        var a = -Math.PI * (0.06 + 0.88 * i / 11) + (hash(i, 4) - 0.5) * 0.2, u = eo(seg(act, 0, 0.9));
        var rr = 40 + u * (150 + hash(i, 5) * 170);
        sparkle(hx[0] + Math.cos(a) * rr * 1.7, hx[1] + Math.sin(a) * rr * 0.75, 6 + 12 * hash(i, 6), '#fff4d6', 0, (1 - seg(act, 0.5, 0.8)) * clamp(act / 0.1));
      }
      var sw = seg(act, 0.05, 0.75);
      if (sw > 0 && sw < 1) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(lerp(-400, W + 400, eio(sw)), 0); ctx.rotate(0.35);
        ctx.fillStyle = lin(-90, 0, 90, 0, [[0, 'rgba(255,230,200,0)'], [0.5, 'rgba(255,236,210,0.22)'], [1, 'rgba(255,230,200,0)']]);
        ctx.fillRect(-90, -900, 180, 1800); ctx.restore();
      }
      fade(actK, function () { sparkles(23, 7, t, [220, 30, 840, 110], '#fff1d0'); });
    }

    // out-of-focus foreground glints for depth
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    var fb = [[70, 120, 70, 0.1], [1210, 640, 90, 0.08], [1150, 90, 54, 0.07], [130, 650, 60, 0.06]];
    for (var b = 0; b < fb.length; b++) glow(fb[b][0] + Math.sin(t * 0.3 + b) * 10, fb[b][1] + Math.cos(t * 0.25 + b) * 8, fb[b][2], 'rgba(255,200,150,' + fb[b][3] * 2 + ')');
    ctx.restore();
    vignette(0.5, 'rgba(24,8,26,1)');

    // --- name card (HUD) ---
    var cardK = seg(c.since(0, 0.12), 0, 0.75) * (1 - seg(L1, 0, 0.55));
    nameCard('DANIELA AMODEI', cardK, { role: 'SAFETY & POLICY LEADER', sub: "DARIO'S SISTER", side: 'right', y: 588, size: 52 });
  }
});
