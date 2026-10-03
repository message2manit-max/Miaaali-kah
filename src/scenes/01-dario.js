/* 01-dario: night office, big window on a blue city. Dario in a dramatic close-up, warm monitor
   light on his face. Name card on line 1; on line 2 holographic screens bloom behind him:
   physics, then neural networks, then two glowing panels, GPT-2 and GPT-3. */

var D_SKY = ['#050920', '#0d1a4a', '#1c3272', '#3b5596'];

// Serif italic for equations (Greek falls back to the system font).
function dEq(str, x, y, size, col, a) {
  fade(a, function () {
    ctx.save();
    ctx.font = 'italic ' + size + 'px "Times New Roman", Georgia, serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = col; ctx.fillText(str, x, y);
    ctx.restore();
  });
}
function dLabel(str, x, y, size, col, al, a) {
  fade(a === undefined ? 1 : a, function () { txt(str, x, y, size, { font: 'r', color: col, align: al || 'left', ls: 2 }); });
}
// Holo screen with an additive glow and clipped content. k = 0..1 opens it.
function dScreen(x, y, w, h, k, col, fn, glowA) {
  if (!(k > 0)) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  glow(x + w / 2, y + h / 2, Math.max(w, h) * 0.8, rgba(col, 0.16 * (glowA === undefined ? 1 : glowA)), eo(k));
  ctx.restore();
  holoPanel(x, y, w, h, k, { color: col, fill: 'rgba(10,30,70,0.55)' });
  if (k >= 0.6 && fn) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    fade(seg(k, 0.6, 0.4), fn);
    ctx.restore();
  }
}
// A scan-line sweep (bright bar moving down) over a rect, u = 0..1
function dScan(x, y, w, h, u) {
  if (!(u > 0 && u < 1)) return;
  var yy = y + h * u;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = lin(0, yy - 30, 0, yy + 4, [[0, 'rgba(125,249,255,0)'], [1, 'rgba(180,252,255,0.55)']]);
  ctx.fillRect(x, yy - 30, w, 34);
  ctx.restore();
}
// Neural network diagram inside a box; sig drives signals moving through.
function dNet(x, y, w, h, layers, t, col, a) {
  var pts = [];
  for (var L = 0; L < layers.length; L++) {
    var col_ = [];
    for (var i = 0; i < layers[L]; i++) col_.push([x + (L + 0.5) / layers.length * w, y + (i + 0.5) / layers[L] * h]);
    pts.push(col_);
  }
  fade(a, function () {
    ctx.strokeStyle = rgba(col, 0.28); ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (var L = 0; L < pts.length - 1; L++) for (var i = 0; i < pts[L].length; i++) for (var j = 0; j < pts[L + 1].length; j++) {
      ctx.moveTo(pts[L][i][0], pts[L][i][1]); ctx.lineTo(pts[L + 1][j][0], pts[L + 1][j][1]);
    }
    ctx.stroke();
    // travelling signals
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#ffffff';
    for (var s = 0; s < 14; s++) {
      var L2 = Math.floor(hash(s, 1) * (pts.length - 1)), i2 = Math.floor(hash(s, 2) * pts[L2].length), j2 = Math.floor(hash(s, 3) * pts[L2 + 1].length);
      var u = (t * (0.7 + hash(s, 4)) + hash(s, 5)) % 1;
      var a0 = pts[L2][i2], a1 = pts[L2 + 1][j2];
      var px = lerp(a0[0], a1[0], u), py = lerp(a0[1], a1[1], u);
      ctx.beginPath(); ctx.arc(px, py, 2.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    for (var L3 = 0; L3 < pts.length; L3++) for (var i3 = 0; i3 < pts[L3].length; i3++) {
      var p = pts[L3][i3], on = pulse(t * 1.3 + L3 * 0.6 + i3 * 0.9, 1);
      ctx.fillStyle = rgba(col, 0.25 + 0.35 * on);
      ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = mix('#7df9ff', '#ffffff', on);
      ctx.beginPath(); ctx.arc(p[0], p[1], 4.5, 0, Math.PI * 2); ctx.fill();
    }
  });
}
// A glowing ball of connected nodes; n controls how big and dense the model looks.
function dModelBall(x, y, r, n, t, col) {
  var pts = [];
  for (var i = 0; i < n; i++) {
    var a = i * 2.39996 + t * 0.25, rr = r * Math.sqrt((i + 0.5) / n);
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.86]);
  }
  bloom(x, y, r * 1.6, rgba(col, 0.35), 0.8 + 0.2 * pulse(t, 0.8));
  ctx.strokeStyle = rgba(col, 0.35); ctx.lineWidth = 1;
  ctx.beginPath();
  for (var j = 0; j < n; j++) {
    var q = pts[(j * 7 + 3) % n], q2 = pts[(j + 1) % n];
    ctx.moveTo(pts[j][0], pts[j][1]); ctx.lineTo(q[0], q[1]);
    ctx.moveTo(pts[j][0], pts[j][1]); ctx.lineTo(q2[0], q2[1]);
  }
  ctx.stroke();
  ctx.fillStyle = '#fff3e0';
  ctx.beginPath();
  for (var k = 0; k < n; k++) { ctx.moveTo(pts[k][0] + 2.6, pts[k][1]); ctx.arc(pts[k][0], pts[k][1], 2.6, 0, Math.PI * 2); }
  ctx.fill();
  ctx.strokeStyle = rgba(col, 0.6); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x, y, r * 1.08, r * 0.95, 0, 0, Math.PI * 2); ctx.stroke();
}
// Night skyline with fine window grids (reads as distant, not toy-like). Batched paths.
function dCity(y, seed, hmax, bw, col, lit, dens, rim) {
  var x = -120, i = 0, bld = [];
  ctx.fillStyle = col; ctx.beginPath();
  while (x < W + 120) {
    var w = bw * (0.55 + hash(seed, i) * 0.9), h = hmax * (0.35 + hash(seed + 1, i) * 0.65);
    if (hash(seed + 6, i) > 0.85) h *= 1.3;
    ctx.rect(x, y - h, w + 1, h + 300);
    if (hash(seed + 7, i) > 0.72) ctx.rect(x + w * 0.5 - 1.5, y - h - 34, 3, 34);
    bld.push([x, w, h]); x += w + 4 + hash(seed + 2, i) * 10; i++;
  }
  ctx.fill();
  ctx.fillStyle = lit; ctx.beginPath();
  for (var b = 0; b < bld.length; b++) {
    var cols = Math.floor((bld[b][1] - 8) / 7), rows = Math.floor((bld[b][2] - 12) / 9);
    for (var r = 0; r < rows; r++) for (var cc = 0; cc < cols; cc++) if (hash(seed + b * 17 + r, cc) > dens) ctx.rect(bld[b][0] + 5 + cc * 7, y - bld[b][2] + 10 + r * 9, 3, 4);
  }
  ctx.fill();
  if (rim) { ctx.fillStyle = rim; ctx.beginPath(); for (var e = 0; e < bld.length; e++) ctx.rect(bld[e][0], y - bld[e][2], bld[e][1] + 1, 2); ctx.fill(); }
}
// The two skyline layers are static, so each is painted once into an offscreen canvas at 1x
// (a touch soft on hi-dpi screens, which suits an out-of-focus background) and blitted per frame.
var D_LAYERS = null;
function dLayer(y0, y1, fn) {
  var x0 = -160, w = W + 320, h = y1 - y0;
  var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  var keep = ctx;
  try { ctx = cv.getContext('2d'); ctx.translate(-x0, -y0); fn(); } finally { ctx = keep; }
  return { cv: cv, x: x0, y: y0, w: w, h: h };
}
function dLayers() {
  if (!D_LAYERS) D_LAYERS = [
    dLayer(120, 740, function () { dCity(560, 4, 300, 70, '#1f3070', 'rgba(150,200,255,0.55)', 0.72, 'rgba(150,190,255,0.35)'); }),
    dLayer(270, 740, function () { dCity(650, 8, 250, 96, '#131d4c', 'rgba(255,214,150,0.7)', 0.7, 'rgba(120,170,255,0.4)'); })
  ];
  return D_LAYERS;
}
function dBlit(L, dx) { ctx.drawImage(L.cv, L.x + dx, L.y, L.w, L.h); }
// The window wall: night city out of focus, mullions, glass reflections.
function dWindow(t, px) {
  sky(D_SKY, 560);
  stars(41, 40, t, [0, 0, W, 260]);
  glow(300, 560, 600, 'rgba(90,140,255,0.22)');
  // distant skyline, layered, shifted for parallax
  var L = dLayers();
  dBlit(L[0], px * 0.3);
  ctx.fillStyle = 'rgba(50,80,160,0.25)'; ctx.fillRect(-100, 200, W + 200, 520);
  dBlit(L[1], px * 0.5);
  // haze over the city, then bokeh (the city is out of focus behind Dario)
  ctx.fillStyle = lin(0, 300, 0, 720, [[0, 'rgba(40,70,150,0)'], [1, 'rgba(40,70,150,0.45)']]);
  ctx.fillRect(-100, 300, W + 200, 420);
  bokeh(23, 26, t, { area: [-60, 220, W + 120, 500], size: 30, speed: 3, a: 0.75, colors: ['rgba(255,200,130,0.55)', 'rgba(120,180,255,0.5)', 'rgba(255,130,160,0.35)', 'rgba(150,240,255,0.4)'] });
  // glass reflections
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(160,200,255,0.05)';
  ctx.beginPath(); ctx.moveTo(180, -20); ctx.lineTo(330, -20); ctx.lineTo(80, 740); ctx.lineTo(-70, 740); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(380, -20); ctx.lineTo(420, -20); ctx.lineTo(170, 740); ctx.lineTo(130, 740); ctx.closePath(); ctx.fill();
  ctx.restore();
  // a warm desk lamp behind the camera, reflected in the glass as a soft out-of-focus disc
  bloom(700 + px * 0.9, 520, 170, 'rgba(255,170,100,0.24)', 0.9);
  // mullions (closer than the city)
  ctx.fillStyle = '#0a0f26';
  ctx.fillRect(-100, 96, W + 200, 16);
  ctx.fillRect(560 + px * 0.8, -20, 20, 760);
  ctx.fillRect(1190 + px * 0.8, -20, 22, 760);
  ctx.fillStyle = 'rgba(140,200,255,0.45)';
  ctx.fillRect(-100, 111, W + 200, 2);
  ctx.fillRect(578 + px * 0.8, -20, 2, 760);
  ctx.fillRect(1210 + px * 0.8, -20, 2, 760);
  // ceiling shadow
  ctx.fillStyle = lin(0, -20, 0, 120, [[0, 'rgba(4,6,18,0.9)'], [1, 'rgba(4,6,18,0)']]);
  ctx.fillRect(-100, -20, W + 200, 140);
}

defineScene({
  id: 'dario',
  title: 'Meet Dario',
  alt: 'Night office with a big window on a blue city. Dario Amodei in close-up, lit by his monitor. Holographic screens bloom behind him: physics equations, neural network diagrams, then two glowing panels labelled GPT-2 and GPT-3.',
  min: 10,
  lines: [
    'Meet Dario Amodei.',
    'A physicist who became a top AI researcher, and helped lead the teams at OpenAI that built GPT-2 and GPT-3.'
  ],
  draw: function (c) {
    var t = c.t;
    // ---- beats ----
    var nIn = seg(c.since(0, 0.05), 0, 0.7);                // name card in
    var nOut = eio(seg(c.since(1, 0.3), 0, 0.5));           // ...and out
    var kEq = seg(c.since(1, 0.0), 0, 0.7);                 // physics screens
    var kNN = seg(c.since(1, 0.3), 0, 0.7);                 // neural networks
    var kG2 = seg(c.since(1, 0.78), 0, 0.5);                // GPT-2
    var kG3 = seg(c.since(1, 0.9), 0, 0.55);                // GPT-3
    var eqDim = (1 - 0.55 * seg(c.since(1, 0.3), 0, 0.6)) * (1 - 0.7 * seg(c.since(1, 0.74), 0, 0.5));
    var nnDim = 1 - 0.75 * seg(c.since(1, 0.74), 0, 0.5);
    var g3hit = c.since(1, 0.9) > 0 ? 1 - seg(c.since(1, 0.9), 0, 0.45) : 0;

    // ---- camera: slow dramatic push-in on his face ----
    // push-in centred on his face (930, 330): the face holds its place while the frame tightens
    var push = eio(seg(t, 0, 11));
    var zoom = 1.0 + 0.08 * push + 0.015 * g3hit;
    var dr = drift(t, 0.7), sh = shake(t, g3hit * 0.35);
    var cx = 930 - 290 / zoom + dr[0] + sh[0], cy = 330 + 30 / zoom + dr[1] + sh[1];
    var px = -(cx - 640);                                  // parallax shift for far layers

    camera(cx, cy, zoom, 0.012, function () {
      dWindow(t, px);

      // ---- holographic screens behind him (mid layer, parallax) ----
      at(px * 0.25, 0, 1, 0, function () {
        // physics
        var e1 = eo(seg(kEq, 0, 1)), e2 = eo(seg(kEq, 0.2, 0.8)), e3 = eo(seg(kEq, 0.35, 0.65));
        fade(eqDim, function () {
          dScreen(130, 120, 330, 150, e1, P.holo, function () {
            dEq('E = mc²', 156, 180, 40, '#d8fdff', 1);
            dEq('iħ ∂ψ/∂t = Ĥψ', 156, 236, 30, '#9eeef8', 1);
            dLabel('PHYSICS', 440, 146, 14, '#7df9ff', 'right', 0.8);
          });
          dScreen(1000, 46, 240, 124, e2, P.holo, function () {
            dEq('S = k ln W', 1020, 96, 30, '#d8fdff', 1);
            ctx.strokeStyle = 'rgba(125,249,255,0.8)'; ctx.lineWidth = 2; ctx.beginPath();
            for (var i = 0; i <= 34; i++) { var xx = 1020 + i * 6, yy = 136 + Math.sin(i * 0.5 + t * 3) * 12 * Math.exp(-i * 0.03); if (i) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); }
            ctx.stroke();
          });
          dScreen(170, 300, 250, 150, e3, P.holo, function () {
            // atom sketch
            ctx.strokeStyle = 'rgba(125,249,255,0.75)'; ctx.lineWidth = 1.6;
            for (var o = 0; o < 3; o++) { ctx.beginPath(); ctx.ellipse(295, 375, 84, 26, o * Math.PI / 3 + t * 0.3, 0, Math.PI * 2); ctx.stroke(); }
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(295, 375, 7, 0, Math.PI * 2); ctx.fill();
            for (var q = 0; q < 3; q++) { var an = t * 2 + q * 2.1, rot = q * Math.PI / 3 + t * 0.3; var ex = Math.cos(an) * 84, ey = Math.sin(an) * 26; ctx.beginPath(); ctx.arc(295 + ex * Math.cos(rot) - ey * Math.sin(rot), 375 + ex * Math.sin(rot) + ey * Math.cos(rot), 4, 0, Math.PI * 2); ctx.fill(); }
          });
        });
        dScan(130, 120, 330, 150, seg(kEq, 0.1, 0.8));
        // neural networks (bigger, in front of the physics screens)
        var n1 = eo(kNN), n2 = eo(seg(kNN, 0.3, 0.7));
        fade(nnDim, function () {
          dScreen(330, 170, 380, 250, n1, '#9d8bff', function () {
            dNet(356, 186, 330, 200, [3, 5, 5, 4, 2], t, '#b9a8ff', 1);
            dLabel('NEURAL NETWORK', 350, 408, 15, '#cfc4ff', 'left', 0.9);
          }, 1.4);
          dScreen(1060, 290, 190, 150, n2, '#9d8bff', function () {
            dNet(1070, 302, 170, 126, [4, 6, 3], t + 1, '#b9a8ff', 1);
          });
        });
        dScan(330, 170, 380, 250, seg(kNN, 0.1, 0.8));
      });

      // ---- GPT-2 and GPT-3: big glowing panels, slam in (nearer layer) ----
      at(px * 0.4, 0, 1, 0, function () {
        if (kG2 > 0) {
          var s2 = back(kG2);
          at(250, 360, s2, 0, function () {
            dScreen(-140, -125, 280, 250, 1, '#ffb36b', function () {
              dModelBall(0, -34, 46, 24, t, '#ffb36b');
              txt('GPT-2', 0, 72, 48, { color: '#ffffff', stroke: '#3a1a08', sw: 8 });
              dLabel('1.5B PARAMETERS', 0, 104, 15, '#ffd9b0', 'center', 0.95);
            }, 1.4);
          });
        }
        if (kG3 > 0) {
          var s3 = back(kG3);
          at(602, 300, s3, 0, function () {
            dScreen(-180, -175, 360, 350, 1, P.claude, function () {
              dModelBall(0, -40, 96, 90, t * 0.8, '#ff9a4d');
              txt('GPT-3', 0, 112, 64, { color: '#ffffff', stroke: '#3a1a08', sw: 10 });
              dLabel('175B PARAMETERS', 0, 150, 17, '#ffd9b0', 'center', 0.95);
            }, 1.8);
          });
          // growth chevrons between the two
          fade(seg(kG3, 0.4, 0.6), function () {
            for (var ch = 0; ch < 3; ch++) {
              var on = pulse(t * 1.6 - ch * 0.35, 1);
              ctx.strokeStyle = rgba('#ffd2a0', 0.3 + 0.7 * on); ctx.lineWidth = 4;
              var chx = 394 + ch * 9;
              ctx.beginPath(); ctx.moveTo(chx, 340 - 12); ctx.lineTo(chx + 9, 340); ctx.lineTo(chx, 340 + 12);
              ctx.stroke();
            }
          });
          if (g3hit > 0) fade(g3hit, function () { speedLines(602, 300, t, { n: 48, inner: 230, color: '#ffe0bf', a: 0.5 }); });
        }
      });

      // ---- Dario: big, off-centre right, close-up ----
      var bx = 930, by = 790;
      // warm monitor spill from the lower left (behind him: light on the window frame)
      bloom(bx - 60, by - 120, 420, 'rgba(255,150,80,0.22)', 0.9);
      bust('dario', bx, by, 1.32, {
        t: t, expr: 'determined', talk: false, look: [-0.3, -0.05], turn: -0.18,
        rim: '#ffb877', light: 0.9, wind: 0.05
      });
      // monitor light washing over him (warm, from below-front)
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = lin(bx - 260, 760, bx + 120, 380, [[0, 'rgba(255,150,70,0.20)'], [1, 'rgba(255,150,70,0)']]);
      ctx.fillRect(bx - 320, 300, 560, 460);
      ctx.restore();
      // cool holo rim once the screens are up
      bloom(bx - 250, 300, 260, 'rgba(125,200,255,0.18)', kNN);

      // foreground: warm spill from the unseen monitor, bottom left
      bloom(240 - px * 0.5, 760, 420, 'rgba(255,150,80,0.35)', 0.85 + 0.15 * pulse(t * 0.6, 1));
      bokeh(29, 8, t, { area: [0, 0, W, H], size: 22, speed: 5, a: 0.5, colors: ['rgba(255,200,140,0.5)', 'rgba(140,200,255,0.4)'] });
    });

    // ---- HUD: name card (slides in on line 1, out as the screens take over) ----
    if (nIn > 0 && nOut < 1) {
      ctx.save(); ctx.translate(-nOut * 900, 0);
      nameCard('DARIO AMODEI', nIn, { role: 'PHYSICIST · AI RESEARCHER', sub: 'THE HERO', side: 'left', y: 582, size: 60 });
      ctx.restore();
    }
    vignette(0.55, 'rgba(3,4,16,1)');
  }
});
