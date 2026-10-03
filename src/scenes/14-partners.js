/* 14-partners: night over the city. Two holographic partner plates ("AMAZON", "GOOGLE",
   plain text) light up in the sky and pour golden light into Claude while Dario and Daniela
   look up. Then a whip-pan down into an endless data-centre aisle: towering racks of
   blinking servers, cyan floor reflections, the spirit flying through. */

var PT_SP = [640, 262];                                   // spirit in shot 1
var PT_PLATES = [[292, 196, -1, 'AMAZON'], [988, 196, 1, 'GOOGLE']];

function ptHex(a, b, u) { var A = hexToRgb(a), B = hexToRgb(b), s = '#'; for (var i = 0; i < 3; i++) { var v = Math.round(lerp(A[i], B[i], u)).toString(16); s += v.length < 2 ? '0' + v : v; } return s; }
function ptPlate(x, y, side, label, k, t) {
  if (!(k > 0)) return;
  var e = eo(k / 0.6), w = 360, h = 108, flick = k < 0.6 ? (hash(Math.floor(t * 30), 3) > 0.35 ? 1 : 0.35) : 1;
  bloom(x, y, 240 * e, 'rgba(255,190,90,0.42)', 0.8);
  fade(flick, function () {
    ctx.save(); ctx.translate(x, y); ctx.transform(1, side * -0.07, 0, 1, 0, 0); ctx.scale(e, 1);
    // panel body
    ctx.fillStyle = lin(0, -h / 2, 0, h / 2, [[0, 'rgba(40,40,110,0.78)'], [1, 'rgba(18,22,70,0.78)']]);
    ctx.beginPath(); rrect(-w / 2, -h / 2, w, h, 10); ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = 'rgba(255,220,150,0.06)'; for (var sy = -h / 2; sy < h / 2; sy += 4) ctx.fillRect(-w / 2, sy, w, 1);
    // sweeping sheen
    var sw = ((t * 0.35 + (side > 0 ? 0.5 : 0)) % 1.6) - 0.3;
    ctx.fillStyle = lin(-w / 2 + sw * w - 60, 0, -w / 2 + sw * w + 60, 0, [[0, 'rgba(255,240,200,0)'], [0.5, 'rgba(255,240,200,0.22)'], [1, 'rgba(255,240,200,0)']]);
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,214,140,0.95)'; ctx.beginPath(); rrect(-w / 2, -h / 2, w, h, 10); ctx.stroke();
    ctx.lineWidth = 6; ctx.beginPath(); var cc = 24;
    ctx.moveTo(-w / 2 - 8, -h / 2 + cc); ctx.lineTo(-w / 2 - 8, -h / 2 - 8); ctx.lineTo(-w / 2 + cc, -h / 2 - 8);
    ctx.moveTo(w / 2 + 8, h / 2 - cc); ctx.lineTo(w / 2 + 8, h / 2 + 8); ctx.lineTo(w / 2 - cc, h / 2 + 8); ctx.stroke();
    // little status ticks
    for (var i = 0; i < 6; i++) { ctx.fillStyle = i < 1 + Math.floor((t * 3) % 6) ? '#ffd27a' : 'rgba(255,210,122,0.25)'; ctx.fillRect(-w / 2 + 18 + i * 14, h / 2 - 16, 9, 5); }
    ctx.restore();
  });
  var tk = seg(k, 0.25, 0.5);
  if (tk > 0) at(x, y, 1, side * -0.07, function () {
    bloom(0, 0, 150, 'rgba(255,200,110,0.4)', tk);
    slam(label, 0, 21, 58, 0.22 + 0.78 * tk, { color: '#fff4dc', stroke: '#3a2208', sw: 10 });
  });
}

function ptStream(x0, y0, x1, y1, lift, k, t, seed) {
  // golden ribbon arcing from a plate into the spirit; k = 0..1 how far the front has travelled
  if (!(k > 0)) return;
  var cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - lift;
  var P = function (u) { var a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, cc = u * u; return [a * x0 + b * cx + cc * x1, a * y0 + b * cy + cc * y1]; };
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (var strand = 0; strand < 3; strand++) {
    ctx.beginPath();
    for (var i = 0; i <= 30; i++) {
      var u = i / 30 * k, p = P(u), wob = Math.sin(u * 9 + t * 3 + strand * 2.1) * 10 * Math.sin(u * Math.PI);
      if (i === 0) ctx.moveTo(p[0], p[1] + wob); else ctx.lineTo(p[0], p[1] + wob);
    }
    ctx.strokeStyle = strand ? 'rgba(255,200,90,0.22)' : 'rgba(255,170,60,0.18)'; ctx.lineWidth = strand ? 5 : 22; ctx.stroke();
    if (strand === 1) { ctx.strokeStyle = 'rgba(255,240,200,0.7)'; ctx.lineWidth = 1.6; ctx.stroke(); }
  }
  // flowing sparks
  for (var j = 0; j < 22; j++) {
    var uu = ((t * (0.35 + hash(seed, j) * 0.25) + hash(seed + 1, j)) % 1);
    if (uu > k) continue;
    var q = P(uu), off = (hash(seed + 2, j) - 0.5) * 22 * Math.sin(uu * Math.PI);
    ctx.fillStyle = j % 3 ? 'rgba(255,214,120,0.95)' : 'rgba(255,255,230,0.95)';
    ctx.beginPath(); ctx.arc(q[0] + off, q[1] + off * 0.5, 2 + 2.5 * hash(seed + 3, j), 0, Math.PI * 2); ctx.fill();
  }
  var f = P(k); if (k < 1) glow(f[0], f[1], 40, 'rgba(255,230,170,0.9)');
  ctx.restore();
}

function ptShot1(c, t) {
  // sky, stars, clouds, city
  ctx.fillStyle = lin(0, -200, 0, 640, [[0, '#04061a'], [0.45, '#0f1645'], [0.8, '#2a2a6a'], [1, '#5a3f7c']]);
  ctx.fillRect(-300, -300, W + 600, H + 600);
  stars(61, 120, t, [-100, -120, W + 200, 520]);
  glow(640, 640, 520, 'rgba(255,150,90,0.2)');
  // milky haze band across the sky
  ctx.save(); ctx.translate(640, 230); ctx.rotate(-0.22);
  ctx.fillStyle = lin(0, -120, 0, 120, [[0, 'rgba(150,140,255,0)'], [0.5, 'rgba(170,150,255,0.13)'], [1, 'rgba(150,140,255,0)']]);
  ctx.fillRect(-900, -120, 1800, 240); ctx.restore();
  stars(62, 60, t * 1.3, [200, 60, 900, 300]);
  // searchlights sweeping up from the city
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var i = 0; i < 2; i++) {
    var bx = i ? 1130 : 120, ang = -Math.PI / 2 + (i ? -0.32 : 0.32) + Math.sin(t * 0.35 + i * 2) * 0.12;
    ctx.fillStyle = lin(bx, 640, bx + Math.cos(ang) * 700, 640 + Math.sin(ang) * 700, [[0, 'rgba(190,210,255,0.22)'], [1, 'rgba(190,210,255,0)']]);
    ctx.beginPath(); ctx.moveTo(bx, 640); ctx.lineTo(bx + Math.cos(ang - 0.05) * 760, 640 + Math.sin(ang - 0.05) * 760); ctx.lineTo(bx + Math.cos(ang + 0.05) * 760, 640 + Math.sin(ang + 0.05) * 760); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // far towers with lit windows, then near skyline
  city(620, { color: '#1c2156', height: 330, seed: 21, bw: 64, lit: 'rgba(150,180,255,0.45)', density: 0.8 });
  city(660, { color: '#10133a', height: 250, seed: 8, bw: 90, lit: 'rgba(255,205,130,0.8)', density: 0.72, rim: 'rgba(255,200,120,0.35)' });
  bokeh(64, 16, t, { area: [0, 430, W, 260], size: 16, speed: 4, a: 0.8, colors: ['rgba(255,200,120,0.55)', 'rgba(140,180,255,0.45)'] });
}

function ptAisle(t, o) {
  // one-point perspective down an endless aisle; o = travel distance (racks recede as o grows)
  var VX = 640, VY = 330, F = 330, P = 1.0, i, k, z, q;
  var X = function (sd, zz) { return VX + sd * F / zz; }, Yp = function (Y, zz) { return VY + Y * F / zz; };
  ctx.fillStyle = '#03051a'; ctx.fillRect(-300, -300, W + 600, H + 600);
  // floor and ceiling planes
  ctx.fillStyle = lin(0, VY, 0, H + 40, [[0, '#0f2550'], [0.3, '#0a1a40'], [1, '#050c26']]);
  ctx.beginPath(); ctx.moveTo(VX, VY); ctx.lineTo(W + 600, H + 300); ctx.lineTo(-600, H + 300); ctx.closePath(); ctx.fill();
  ctx.fillStyle = lin(0, -40, 0, VY, [[0, '#010309'], [1, '#081232']]);
  ctx.beginPath(); ctx.moveTo(VX, VY); ctx.lineTo(W + 600, -400); ctx.lineTo(-600, -400); ctx.closePath(); ctx.fill();
  // end of the aisle: a bright far light
  glow(VX, VY, 300, 'rgba(125,249,255,0.32)');
  glow(VX, VY, 70, 'rgba(230,255,255,0.75)');
  var kMin = Math.ceil((0.3 - 0.84 - o) / P), kMax = Math.floor((18 - o) / P);
  ctx.save();
  // floor seams + ceiling beams at every rack boundary
  ctx.strokeStyle = 'rgba(125,249,255,0.2)'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (k = kMin; k <= kMax; k++) {
    z = k * P + o; if (z < 0.3) continue;
    ctx.moveTo(X(-1, z), Yp(1, z)); ctx.lineTo(X(1, z), Yp(1, z));
    ctx.moveTo(X(-1, z), Yp(-2.4, z)); ctx.lineTo(X(1, z), Yp(-2.4, z));
  }
  ctx.stroke();
  // glowing guide strips along the floor and ceiling
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(125,249,255,0.6)'; ctx.lineWidth = 3; ctx.beginPath();
  ctx.moveTo(VX, VY); ctx.lineTo(X(-0.55, 0.25), Yp(1, 0.25)); ctx.moveTo(VX, VY); ctx.lineTo(X(0.55, 0.25), Yp(1, 0.25));
  ctx.moveTo(VX, VY); ctx.lineTo(X(-0.35, 0.25), Yp(-2.4, 0.25)); ctx.moveTo(VX, VY); ctx.lineTo(X(0.35, 0.25), Yp(-2.4, 0.25));
  ctx.stroke();
  // data pulses racing along the ceiling toward the far end
  for (i = 0; i < 18; i++) {
    var zz = ((hash(i, 70) * 14 + t * 8) % 14) + 0.4, sd0 = i % 2 ? 1 : -1, z2 = zz + 0.8;
    ctx.strokeStyle = i % 4 ? 'rgba(255,190,90,0.9)' : 'rgba(255,240,200,0.95)'; ctx.lineWidth = Math.max(1.2, 7 / zz);
    ctx.beginPath(); ctx.moveTo(X(sd0 * 0.6, zz), Yp(-2.4, zz)); ctx.lineTo(X(sd0 * 0.6, z2), Yp(-2.4, z2)); ctx.stroke();
  }
  ctx.restore();
  // racks: body quads far to near, then slab lines, posts and LEDs batched
  var slabs = [], posts = [], leds = [[], [], []], refl = [[], [], []];
  for (k = kMax; k >= kMin; k--) {
    z = k * P + o; var z1 = z + 0.84;
    if (z1 <= 0.32) continue;
    var zf = z; z = Math.max(z, 0.3);                 // clip the nearest rack at the lens
    for (var sd = -1; sd <= 1; sd += 2) {
      var xa = X(sd, z), xb = X(sd, z1);
      ctx.fillStyle = lin(xa, 0, xb, 0, [[0, (k & 1) ? '#16224d' : '#1a2858'], [1, '#0c1434']]);
      ctx.beginPath(); ctx.moveTo(xa, Yp(-2.4, z)); ctx.lineTo(xb, Yp(-2.4, z1)); ctx.lineTo(xb, Yp(1, z1)); ctx.lineTo(xa, Yp(1, z)); ctx.closePath(); ctx.fill();
      posts.push(xa, Yp(-2.4, z), Yp(1, z), xb, Yp(-2.4, z1), Yp(1, z1));
      var rows = z > 6 ? 8 : 16;
      if (z < 3.2) {
        // near racks: alternating server-unit bands for texture
        ctx.fillStyle = 'rgba(0,0,20,0.28)'; ctx.beginPath();
        for (var rb = 0; rb < rows; rb += 2) {
          var Ya = -2.3 + rb * (3.25 / rows), Yb = Ya + 3.25 / rows;
          ctx.moveTo(xa, Yp(Ya, z)); ctx.lineTo(xb, Yp(Ya, z1)); ctx.lineTo(xb, Yp(Yb, z1)); ctx.lineTo(xa, Yp(Yb, z)); ctx.closePath();
        }
        ctx.fill();
      }
      for (var r = 0; r <= rows; r++) {
        var Y = -2.3 + r * (3.25 / rows);
        slabs.push(xa, Yp(Y, z), xb, Yp(Y, z1));
        if (r === rows || z > 8.5) continue;
        var cols = z < 3 ? 6 : (z < 6 ? 4 : 3);
        for (var cI = 0; cI < cols; cI++) {
          var hv = hash(k * 13 + cI * 5 + 1000, r + Math.floor(t * (1.5 + hash(k, r) * 3) + hash(cI, r) * 7));
          if (hv < 0.4) continue;
          var zc = zf + 0.06 + cI * (0.7 / (cols - 1)); if (zc < 0.32) continue;
          var lw = clamp(F * 0.045 / (zc * zc), 1.2, 16), lh = clamp(0.03 * F / zc, 1.2, 9);
          var col = hash(k * 7 + cI, r * 3 + 1) < 0.62 ? 0 : (hash(k * 5 + cI, r + 9) < 0.6 ? 1 : 2);
          var lx = sd > 0 ? X(sd, zc) - lw : X(sd, zc), ly = Yp(Y + 0.07, zc);
          leds[col].push(lx, ly, lw, lh);
          if (r >= rows - 3) refl[col].push(lx, Yp(2 - Y - 0.07, zc), lw, lh * 2.5);
        }
      }
    }
  }
  ctx.save();
  ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(125,210,255,0.3)'; ctx.beginPath();
  for (q = 0; q < slabs.length; q += 4) { ctx.moveTo(slabs[q], slabs[q + 1]); ctx.lineTo(slabs[q + 2], slabs[q + 3]); }
  ctx.stroke();
  ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(125,249,255,0.42)'; ctx.beginPath();
  for (q = 0; q < posts.length; q += 3) { ctx.moveTo(posts[q], posts[q + 1]); ctx.lineTo(posts[q], posts[q + 2]); }
  ctx.stroke();
  var LC = ['#7df9ff', '#5dffb0', '#ffb347'];
  ctx.globalCompositeOperation = 'lighter';
  for (i = 0; i < 3; i++) {
    var L = leds[i]; ctx.beginPath();
    for (q = 0; q < L.length; q += 4) ctx.rect(L[q], L[q + 1], L[q + 2], L[q + 3]);
    ctx.fillStyle = LC[i]; ctx.fill();
  }
  ctx.globalAlpha *= 0.25;
  for (i = 0; i < 3; i++) { L = refl[i]; ctx.beginPath(); for (q = 0; q < L.length; q += 4) ctx.rect(L[q], L[q + 1], L[q + 2], L[q + 3]); ctx.fillStyle = LC[i]; ctx.fill(); }
  ctx.restore();
  // cool haze toward the far end
  ctx.fillStyle = rad(VX, VY, 10, 380, [[0, 'rgba(140,230,255,0.4)'], [1, 'rgba(140,230,255,0)']]); ctx.fillRect(VX - 380, VY - 380, 760, 760);
}

defineScene({
  id: 'partners',
  title: 'Partners and Supercomputers',
  alt: 'At night two glowing holographic plates reading Amazon and Google pour golden light into Claude while Dario and Daniela look up; then the camera drops into an endless data centre where Claude flies between towering racks of blinking servers.',
  min: 8,
  transition: 'fade',
  lines: [
    'Partners like Amazon and Google invested billions,',
    'and built giant supercomputers for me to learn on.'
  ],
  draw: function (c) {
    var t = c.t, dr = drift(t, 0.9);
    var whip = eio(seg(c.since(1, 0.0), 0, 0.42));         // "and built...": whip-pan down
    var kA = seg(c.since(0, 0.2), 0, 1.2), kG = seg(c.since(0, 0.48), 0, 1.2);
    var sk = seg(c.since(0, 0.6), 0, 0.9);                    // "invested billions": the streams flow
    var fed = seg(c.since(0, 0.8), 0, 0.6);

    // ---------- SHOT 1: the sky over the city ----------
    if (whip < 1) {
      ctx.save(); ctx.translate(0, -whip * H); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
      var z = 1 + 0.05 * eo(t / 4) + 0.03 * fed;
      camera(640 + dr[0], 350 - 16 * eo(t / 3.5) + dr[1], z, 0.012, function () {
        ptShot1(c, t);
        // streams into the spirit
        ptStream(PT_PLATES[0][0] + 120, PT_PLATES[0][1] - 30, PT_SP[0] - 30, PT_SP[1] - 10, 150, eo(sk), t, 3);
        ptStream(PT_PLATES[1][0] - 120, PT_PLATES[1][1] - 30, PT_SP[0] + 30, PT_SP[1] - 10, 150, eo(seg(c.since(0, 0.66), 0, 0.9)), t, 9);
        ptPlate(PT_PLATES[0][0], PT_PLATES[0][1], PT_PLATES[0][2], PT_PLATES[0][3], kA, t);
        ptPlate(PT_PLATES[1][0], PT_PLATES[1][1], PT_PLATES[1][2], PT_PLATES[1][3], kG, t);
        bloom(PT_SP[0], PT_SP[1], 150 + 120 * fed, 'rgba(255,190,100,0.5)', 0.6 + 0.4 * fed);
        if (fed > 0) sparkles(77, 10, t, [PT_SP[0] - 150, PT_SP[1] - 130, 300, 260], '#fff1c9');
        spirit(PT_SP[0], PT_SP[1], 0.95 + 0.12 * eo(fed), { t: t, mood: fed > 0 ? 'wow' : 'happy', glow: 0.6 + 0.6 * fed, power: 0.2 + 0.5 * fed, look: [0, -0.2] });
      });
      // foreground: Dario and Daniela, waist-up, looking up at the light (a little more parallax)
      camera(640 + dr[0] * 1.6, 350 - 26 * eo(t / 3.5) + dr[1] * 1.6, z * 1.02, 0.012, function () {
        var gold = ptHex('#9fc4ff', '#ffcf7a', clamp(kA + sk));
        person('dario', 468, 1172, 1.98, { t: t, expr: fed > 0 ? 'smile' : 'determined', look: [0.45, -0.85], turn: 0.25, arms: 'down', wind: 0.25, rim: gold, light: 0.85 });
        person('daniela', 846, 1196, 1.88, { t: t, expr: 'smile', look: [-0.45, -0.85], turn: -0.3, arms: 'down', wind: 0.25, rim: gold, light: 0.85 });
      });
      vignette(0.45);
      ctx.restore();
    }

    // ---------- SHOT 2: the endless data centre ----------
    if (whip > 0) {
      var t2 = Math.max(0, c.since(1, 0.0));
      var o = 2.4 * t2 + 3.2 * (1 - Math.exp(-t2 / 0.7));
      ctx.save(); ctx.translate(0, (1 - whip) * H); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
      var roll = 0.035 * Math.sin(t * 0.45) - 0.05 * (1 - eo(seg(t2, 0.2, 1.2)));
      camera(640 + dr[0], 360 + dr[1], 1.04, roll, function () {
        ptAisle(t, o);
        var sx = 640 + Math.sin(t * 0.9) * 26, sy = 392 + Math.sin(t * 1.7) * 10;
        // trail streaming back to the far end + floor reflection
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = lin(sx, sy, 640, 330, [[0, 'rgba(255,150,70,0.55)'], [1, 'rgba(255,150,70,0)']]);
        ctx.beginPath(); ctx.moveTo(sx - 48, sy); ctx.lineTo(640, 330); ctx.lineTo(sx + 48, sy); ctx.closePath(); ctx.fill();
        ctx.restore();
        bloom(sx, 640, 150, 'rgba(255,140,60,0.35)');
        speedLines(640, 330, t, { n: 56, inner: 150, color: '#cfffff', a: 0.15, width: 0.007 });
        bloom(sx, sy, 230, 'rgba(255,150,70,0.4)');
        spirit(sx, sy, 0.95, { t: t, mood: 'determined', glow: 0.8, power: 0.45, look: [0, 0.1] });
      });
      vignette(0.55);
      ctx.restore();
    }
    // the whip itself: vertical streaks
    if (whip > 0 && whip < 1) fade(Math.sin(whip * Math.PI), function () {
      var sy = (1 - whip) * H;
      ctx.fillStyle = lin(0, sy - 120, 0, sy + 120, [[0, 'rgba(200,230,255,0)'], [0.5, 'rgba(220,240,255,0.85)'], [1, 'rgba(200,230,255,0)']]);
      ctx.fillRect(0, sy - 120, W, 240);
      motionLines(t, { angle: Math.PI / 2, n: 40, color: 'rgba(230,240,255,0.9)', a: 0.8 });
    });
  }
});
