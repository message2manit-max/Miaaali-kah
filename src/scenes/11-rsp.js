/* 11-rsp: a dark briefing room. Daniela presents in the left foreground, pointing at a big
   holographic panel. On line 1 the title RESPONSIBLE SCALING POLICY slams in over the panel
   and settles into its header. On line 2 a staircase of four safety levels, ASL-1 to
   ASL-4, lights up step by step: each step's shield grows bigger and brighter while a POWER
   bar and a SAFETY bar climb side by side. Silhouetted colleagues listen in the foreground. */

function pcam(cam, d, fn) { camera(lerp(W / 2, cam.x, d), lerp(H / 2, cam.y, d), 1 + (cam.z - 1) * d, (cam.r || 0) * d, fn); }
function kick(s, d) { return s >= 0 && s < d ? 1 - s / d : 0; }
function settle(s, tau) { return s > 0 ? 1 - Math.exp(-s / tau) : 0; }

var R_PN = { x: 556, y: 142, w: 684, h: 500 };    // the holo panel (world coords)
var R_LV = [0.06, 0.26, 0.46, 0.66];               // line-2 fractions where each level lights
function rStep(i) { return { x: R_PN.x + 40 + i * 74, y: R_PN.y + R_PN.h - 82 - i * 90, w: 254, h: 66 }; }

/* ---------- room ---------- */
function rRoom(t) {
  ctx.fillStyle = lin(0, -80, 0, 600, [[0, '#05071a'], [0.6, '#0e1438'], [1, '#18204e']]);
  ctx.fillRect(-300, -300, W + 600, 900);
  // acoustic slats
  for (var x = -280; x < W + 300; x += 28) {
    ctx.fillStyle = 'rgba(120,150,255,' + (0.035 + 0.03 * hash(x | 0, 3)) + ')';
    ctx.fillRect(x, 70, 14, 520);
  }
  // LED line and ceiling
  ctx.fillStyle = '#04050f'; ctx.fillRect(-300, -300, W + 600, 362);
  ctx.fillStyle = 'rgba(125,249,255,0.8)'; ctx.fillRect(-300, 60, W + 600, 2);
  glow(640, 62, 760, 'rgba(125,249,255,0.07)');
  // ceiling spots with soft cones
  var sp = [140, 470, 820, 1150];
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var i = 0; i < sp.length; i++) {
    ctx.fillStyle = lin(0, 62, 0, 600, [[0, 'rgba(190,210,255,0.13)'], [1, 'rgba(190,210,255,0)']]);
    ctx.beginPath(); ctx.moveTo(sp[i] - 16, 62); ctx.lineTo(sp[i] + 16, 62); ctx.lineTo(sp[i] + 150, 600); ctx.lineTo(sp[i] - 150, 600); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  for (var j = 0; j < sp.length; j++) { ctx.fillStyle = '#e8f0ff'; ctx.fillRect(sp[j] - 14, 58, 28, 5); bloom(sp[j], 62, 46, 'rgba(220,235,255,0.7)'); }
  // floor
  ctx.fillStyle = '#0a0d26'; ctx.fillRect(-300, 590, W + 600, 6);
  ctx.fillStyle = lin(0, 596, 0, 760, [[0, '#121838'], [1, '#04050f']]); ctx.fillRect(-300, 596, W + 600, 500);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = lin(0, 600, 0, 720, [[0, 'rgba(125,249,255,0.10)'], [1, 'rgba(125,249,255,0)']]);
  ctx.fillRect(R_PN.x, 600, R_PN.w, 120);
  ctx.restore();
}

/* ---------- the panel content ---------- */
function rShield(r, fill, line) {
  cel(function () {
    ctx.moveTo(0, -r); ctx.lineTo(r * 0.82, -r * 0.62); ctx.quadraticCurveTo(r * 0.84, r * 0.45, 0, r);
    ctx.quadraticCurveTo(-r * 0.84, r * 0.45, -r * 0.82, -r * 0.62); ctx.closePath();
  }, fill, { line: line, shade: 'rgba(160,60,20,0.35)', shadeBuild: function () { ctx.rect(0, -r * 1.2, r * 1.2, r * 2.4); } });
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = line * 0.8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-r * 0.34, 0); ctx.lineTo(-r * 0.06, r * 0.28); ctx.lineTo(r * 0.38, -r * 0.24); ctx.stroke();
}
function rSteps(c, t, dim) {
  for (var i = 0; i < 4; i++) {
    var s = c.since(1, R_LV[i]), on = seg(s, 0, 0.35), st = rStep(i);
    fade(1 - 0.55 * dim, function () {
      // plate
      ctx.save();
      ctx.fillStyle = on > 0 ? lin(st.x, 0, st.x + st.w, 0, [[0, rgba('#1f6fb2', 0.55 + 0.35 * on)], [1, rgba('#2bb8d6', 0.25 + 0.4 * on)]]) : 'rgba(30,50,110,0.35)';
      ctx.beginPath(); ctx.moveTo(st.x + 14, st.y); ctx.lineTo(st.x + st.w, st.y); ctx.lineTo(st.x + st.w - 14, st.y + st.h); ctx.lineTo(st.x, st.y + st.h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = on > 0 ? rgba('#bffaff', 0.5 + 0.5 * on) : 'rgba(125,249,255,0.25)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
      if (on > 0) bloom(st.x + st.w / 2, st.y + st.h / 2, 150, 'rgba(60,200,255,0.25)', on);
      txt('ASL-' + (i + 1), st.x + 26, st.y + 45, 30, { align: 'left', color: on > 0 ? '#ffffff' : 'rgba(170,200,255,0.45)', stroke: on > 0 ? P.ink : null, sw: 6 });
      // shield: bigger and brighter at every level
      var sr = 18 + i * 7, pop = on > 0 ? back(seg(s, 0, 0.5)) : 0.75, sx = st.x + st.w - 46, sy = st.y + st.h / 2;
      if (on > 0) { bloom(sx, sy, sr * (2.6 + i * 0.6), 'rgba(255,160,70,0.6)', on * (0.6 + 0.4 * pulse(t + i * 0.4, 0.8))); }
      at(sx, sy, pop, 0, function () {
        if (on > 0) rShield(sr, mix('#ffb070', '#ffd23f', i / 3), 3.5);
        else { ctx.strokeStyle = 'rgba(160,200,255,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -sr); ctx.lineTo(sr * 0.82, -sr * 0.62); ctx.quadraticCurveTo(sr * 0.84, sr * 0.45, 0, sr); ctx.quadraticCurveTo(-sr * 0.84, sr * 0.45, -sr * 0.82, -sr * 0.62); ctx.closePath(); ctx.stroke(); }
      });
      // light-up ring
      var ring = seg(s, 0, 0.6);
      if (ring > 0 && ring < 1) fade(1 - ring, function () { ctx.strokeStyle = '#fff1d6'; ctx.lineWidth = 4 * (1 - ring) + 1; ctx.beginPath(); ctx.arc(sx, sy, sr * (1.2 + ring * 2.2), 0, Math.PI * 2); ctx.stroke(); });
    });
  }
}
// a broad translucent arrow climbing behind the staircase (drawn before the steps)
function rArrow(c, t, dim, climb) {
  if (!(climb > 0)) return;
  var a = rStep(0), b = rStep(3);
  var x0 = a.x - 10, y0 = a.y + a.h + 10, x1 = lerp(x0, b.x + b.w * 0.55, climb), y1 = lerp(y0, b.y - 26, climb);
  var ang = Math.atan2(y1 - y0, x1 - x0), wdt = 46, hd = 66;
  fade((0.8 + 0.2 * pulse(t, 0.6)) * (1 - 0.55 * dim), function () {
    at(x0, y0, 1, ang, function () {
      var L = Math.hypot(x1 - x0, y1 - y0);
      ctx.fillStyle = lin(0, 0, L, 0, [[0, 'rgba(125,249,255,0)'], [0.6, 'rgba(125,249,255,0.16)'], [1, 'rgba(255,190,120,0.35)']]);
      ctx.beginPath(); ctx.moveTo(0, -wdt / 2); ctx.lineTo(L - hd * 0.8, -wdt / 2); ctx.lineTo(L - hd * 0.8, -hd * 0.75); ctx.lineTo(L, 0); ctx.lineTo(L - hd * 0.8, hd * 0.75); ctx.lineTo(L - hd * 0.8, wdt / 2); ctx.lineTo(0, wdt / 2); ctx.closePath(); ctx.fill();
    });
  });
}
function rBars(c, t, dim) {
  var lv = 0;
  for (var i = 0; i < 4; i++) lv += eo(seg(c.since(1, R_LV[i]), 0.05, 0.6));
  var v = 0.08 + 0.22 * lv;                         // 8% .. 96%
  var bx = R_PN.x + R_PN.w - 150, by = R_PN.y + R_PN.h - 50, bh = 330, bw = 42;
  fade(1 - 0.55 * dim, function () {
    var cols = [['POWER', '#7df9ff', '#3a86ff'], ['SAFETY', '#ffd23f', '#ff8a3d']];
    for (var j = 0; j < 2; j++) {
      var x = bx + j * 72, h = bh * clamp(v + (j === 1 ? 0.012 * Math.sin(t * 2) : 0.012 * Math.sin(t * 2 + 1)));
      ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(x, by - bh, bw, bh);
      ctx.strokeStyle = 'rgba(160,220,255,0.3)'; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.5, by - bh + 0.5, bw - 1, bh - 1);
      ctx.fillStyle = lin(0, by, 0, by - bh, [[0, cols[j][2]], [1, cols[j][1]]]); ctx.fillRect(x, by - h, bw, h);
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(x, by - h, bw, 3);
      bloom(x + bw / 2, by - h, 46, rgba(cols[j][1], 0.7), 0.8);
      // tick marks
      ctx.fillStyle = 'rgba(200,230,255,0.35)';
      for (var q = 1; q < 4; q++) ctx.fillRect(x - 6, by - bh * q / 4, 5, 2);
      txt(cols[j][0], x + bw / 2, by + 26, 15, { font: 'r', color: cols[j][1], ls: 1 });
      // up arrow over each bar
      at(x + bw / 2, by - h - 22 - 3 * Math.sin(t * 3 + j), 1, 0, function () {
        ctx.fillStyle = cols[j][1]; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(9, 2); ctx.lineTo(-9, 2); ctx.closePath(); ctx.fill();
      });
    }
    // the two tops are tied together: a short bright link between them
    var ly = by - bh * v + 1;
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(bx + bw, ly, 72 - bw, 2);
    ctx.beginPath(); ctx.arc(bx + bw + (72 - bw) / 2, ly + 1, 4, 0, Math.PI * 2); ctx.fill();
  });
}
// the title: slams over the panel, then settles into its header
function rTitle(c, t) {
  var s = c.since(0, 0.58);
  if (!(s > 0)) return 0;
  var mv = eio(seg(s, 1.1, 0.7));
  var cx = lerp(R_PN.x + R_PN.w / 2 - 50, R_PN.x + R_PN.w / 2, mv), cy = lerp(R_PN.y + 196, R_PN.y + 44, mv), sc = lerp(1, 0.56, mv);
  at(cx, cy, sc, 0, function () {
    slam('RESPONSIBLE', 0, 0, 52, seg(s, 0, 0.5), { color: '#ffffff', stroke: P.ink, sw: 11 });
    slam('SCALING POLICY', 0, 64, 52, seg(s, 0.15, 0.5), { color: P.claude, stroke: P.ink, sw: 11 });
  });
  if (mv > 0) fade(mv, function () { ctx.fillStyle = 'rgba(125,249,255,0.45)'; ctx.fillRect(R_PN.x + 40, R_PN.y + 98, R_PN.w - 80, 2); });
  return 1 - mv;   // how much the slam dominates the panel (dims the content)
}

/* ---------- foreground listeners ---------- */
function rAudience(t) {
  var heads = [[690, 668, 1.0], [858, 680, 1.1], [1028, 664, 0.95], [1196, 682, 1.12], [540, 692, 0.9]];
  for (var i = 0; i < heads.length; i++) {
    var h = heads[i], x = h[0] + Math.sin(t * 0.5 + i) * 2, y = h[1], s = h[2];
    ctx.fillStyle = '#03040e';
    ctx.beginPath(); ctx.ellipse(x, y + 90 * s, 110 * s, 70 * s, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x, y, 38 * s, 46 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(160,250,255,0.8)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(x, y, 38 * s, 46 * s, 0, Math.PI * 1.05, Math.PI * 1.8); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y + 90 * s, 110 * s, 70 * s, 0, Math.PI * 1.15, Math.PI * 1.6); ctx.stroke();
  }
}

defineScene({
  id: 'rsp',
  title: 'A Promise',
  alt: 'In a dark briefing room, Daniela points at a big holographic panel titled Responsible Scaling Policy. A staircase of four safety levels, ASL-1 to ASL-4, lights up step by step, each shield bigger and brighter, while a power bar and a safety bar rise together.',
  min: 9,
  lines: [
    'They also made a promise: the Responsible Scaling Policy.',
    'The more powerful AI gets, the stronger its safety rules must be.'
  ],
  draw: function (c) {
    var t = c.t;
    var L1 = c.since(1, 0);
    var slamLand = c.since(0, 0.58) - 0.3;
    var top = c.since(1, R_LV[3]);
    var climb = 0; for (var i = 0; i < 4; i++) climb += eio(seg(c.since(1, R_LV[i]), 0, 0.9)) / 4;
    var dr = drift(t, 0.8), sk = shake(t, 0.5 * kick(slamLand, 0.35) + 0.45 * kick(top, 0.4));
    var cam = {
      x: 640 + 26 * climb + dr[0] + sk[0],
      y: 362 - 18 * climb + dr[1] + sk[1],
      z: 1.0 + 0.035 * settle(t, 4) + 0.04 * climb,
      r: -0.012 + 0.008 * climb
    };
    pcam(cam, 0.5, function () { rRoom(t); });
    pcam(cam, 0.6, function () { bokeh(41, 12, t, { area: [0, 60, W, 540], size: 7, speed: 5, a: 0.5, colors: ['rgba(125,249,255,0.5)', 'rgba(255,200,140,0.35)'] }); });
    var dim = 0;
    pcam(cam, 0.9, function () {
      bloom(R_PN.x + R_PN.w / 2, R_PN.y + R_PN.h / 2, 560, 'rgba(40,140,255,0.14)');
      holoPanel(R_PN.x, R_PN.y, R_PN.w, R_PN.h, 1, { fill: 'rgba(8,18,52,0.78)' });
      dim = 0;
      var s = c.since(0, 0.58);
      if (s > 0) dim = 1 - eio(seg(s, 1.1, 0.7));
      rArrow(c, t, dim, climb);
      rSteps(c, t, dim);
      rBars(c, t, dim);
      rTitle(c, t);
    });
    // Daniela presents, big in the left foreground
    pcam(cam, 1, function () {
      person('daniela', 300, 1262, 2.42, { t: t, arms: 'point', turn: 0.35, look: L1 > 0.3 && top < 1 ? [0.6, -0.15] : [0.15, 0], expr: L1 > 0.3 && top < 1 ? 'determined' : 'smile', rim: '#9ff8ff', light: 0.95, wind: 0.08 });
    });
    pcam(cam, 1.2, function () { rAudience(t); });
    vignette(0.55, 'rgba(3,4,16,1)');
    flash(0.25 * kick(slamLand, 0.25) + 0.2 * kick(top, 0.25), '#e8fdff');
    c.yr('2023');
  }
});
