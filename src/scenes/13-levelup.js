/* 13-levelup: anime power-up transformation. Claude levels up on a floating platform above
   a sea of clouds: Claude 3, 3.5 Sonnet, Claude Code, Claude 4, Claude 5. Dario watches from
   the foreground, hair blown back by each burst. A level gauge on the right fills up. */

var LU_SP = [700, 372];                      // spirit centre
var LU_PL = [700, 604, 360, 70];             // platform centre x, y, rx, ry
// per level: aura colour, sky tint; level 0 = charging (still Claude 2)
var LU_AURA = ['#ffb36b', '#7df9ff', '#4dffc3', '#b18cff', '#ff6fd8', '#ff9a3c'];
var LU_SCALE = [1.08, 1.22, 1.32, 1.42, 1.54, 1.78];
var LU_GAUGE = [0.14, 0.34, 0.48, 0.62, 0.8, 1.0];
var LU_LV = ['2', '3', '3.5', '3.5', '4', '5'];
var LU_TILT = [0, -0.03, 0.022, -0.02, 0.028, -0.01];
var LU_POW = [1.0, 0.7, 0.8, 1.0, 1.35];       // strength of each burst (events 1..5)
var LU_CRACKS = (function () {
  var out = [];
  for (var i = 0; i < 9; i++) {
    var a = i / 9 * Math.PI * 2 + hash(5, i) * 0.4, pts = [[0, 0]], r = 0;
    for (var j = 0; j < 5; j++) { r += 0.14 + hash(6 + j, i) * 0.08; var aa = a + (hash(20 + j, i) - 0.5) * 0.5; pts.push([Math.cos(aa) * r, Math.sin(aa) * r]); }
    out.push(pts);
  }
  return out;
})();

function luMixA(a, b, u) { return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }
function luCss(a, al) { return 'rgba(' + Math.round(a[0]) + ',' + Math.round(a[1]) + ',' + Math.round(a[2]) + ',' + (al === undefined ? 1 : al) + ')'; }
function luHex(a) { var s = '#'; for (var i = 0; i < 3; i++) { var v = Math.round(clamp(a[i], 0, 255)).toString(16); s += v.length < 2 ? '0' + v : v; } return s; }

function luBolt(x0, y0, x1, y1, seed, w, col) {
  var pts = [[x0, y0]], n = 7, dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  for (var i = 1; i < n; i++) { var u = i / n, off = (hash(seed, i) - 0.5) * len * 0.28; pts.push([x0 + dx * u + nx * off, y0 + dy * u + ny * off]); }
  pts.push([x1, y1]);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = col; ctx.lineWidth = w * 4; ctx.globalAlpha *= 0.35; ctx.stroke();
  ctx.globalAlpha /= 0.35; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = w; ctx.stroke();
  ctx.restore();
}

function luPlatform(t, aura, power, n) {
  var cx = LU_PL[0], cy = LU_PL[1], rx = LU_PL[2], ry = LU_PL[3];
  // under-glow and the platform's thickness
  bloom(cx, cy + 40, 330, luCss(aura, 0.4), 0.6 + 0.4 * power);
  ctx.fillStyle = '#0b0c22'; ctx.beginPath(); ctx.ellipse(cx, cy + 34, rx, ry, 0, 0, Math.PI); ctx.lineTo(cx - rx, cy); ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = luCss(aura, 0.7); ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, cy + 34, rx, ry, 0, 0.1, Math.PI - 0.1); ctx.stroke();
  // band of lights on the rim
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var i = 0; i < 24; i++) {
    var a = (i / 24) * Math.PI + 0.06, x = cx + Math.cos(a) * rx * 0.99, y = cy + 17 + Math.sin(a) * ry;
    ctx.fillStyle = luCss(aura, 0.35 + 0.5 * pulse(t * 1.5 - i * 0.25, 1)); ctx.fillRect(x - 5, y - 2, 10, 4);
  }
  ctx.restore();
  // top surface
  ctx.fillStyle = rad(cx, cy, 10, rx, [[0, luCss(luMixA([40, 40, 90], aura, 0.45))], [0.6, '#15163a'], [1, '#1d1f4a']]);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(1, ry / rx);
  ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill();
  // engraved rings and spokes
  ctx.lineWidth = 3; ctx.strokeStyle = luCss(aura, 0.55);
  ctx.beginPath(); ctx.arc(0, 0, rx * 0.96, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([26, 14]); ctx.lineDashOffset = -t * 40;
  ctx.beginPath(); ctx.arc(0, 0, rx * 0.78, 0, Math.PI * 2); ctx.stroke();
  ctx.lineDashOffset = t * 60; ctx.setLineDash([8, 10]);
  ctx.beginPath(); ctx.arc(0, 0, rx * 0.5, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineWidth = 2; ctx.strokeStyle = luCss(aura, 0.25); ctx.beginPath();
  for (i = 0; i < 12; i++) { var aa = i / 12 * Math.PI * 2 + t * 0.1; ctx.moveTo(Math.cos(aa) * rx * 0.5, Math.sin(aa) * rx * 0.5); ctx.lineTo(Math.cos(aa) * rx * 0.94, Math.sin(aa) * rx * 0.94); }
  ctx.stroke();
  // glowing cracks: more of them light up as the power rises
  ctx.globalCompositeOperation = 'lighter'; ctx.lineJoin = 'round';
  for (i = 0; i < LU_CRACKS.length; i++) {
    var on = clamp(n * 2 - i * 0.9); if (!(on > 0)) continue;
    var P0 = LU_CRACKS[i]; ctx.beginPath(); ctx.moveTo(P0[0][0] * rx, P0[0][1] * rx);
    for (var j = 1; j < P0.length; j++) ctx.lineTo(P0[j][0] * rx, P0[j][1] * rx);
    ctx.strokeStyle = luCss(aura, 0.3 * on); ctx.lineWidth = 12; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.75 * on) + ')'; ctx.lineWidth = 2.5; ctx.stroke();
  }
  ctx.restore();
  // reflection of the spirit
  bloom(cx, cy, 200, luCss(aura, 0.45), 0.5 + 0.5 * power);
}

function luAura(x, y, s, t, aura, power, burst) {
  // anime aura: a crown of flame tongues around the spirit, flickering upward
  var R = 70 * s, n = 18;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (var layer = 0; layer < 2; layer++) {
    var k = layer ? 0.62 : 1, hgt = (70 + 120 * power + 120 * burst) * s * k;
    ctx.beginPath();
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + (i / n - 0.5) * Math.PI * 2;
      var up = 0.5 + 0.5 * Math.cos(a + Math.PI / 2);             // tongues on top are tallest
      var fl = 0.65 + 0.35 * Math.sin(t * (7 + hash(i, 2) * 5) + i * 2.1);
      var L = R * k + hgt * (0.25 + 0.75 * up) * fl;
      var bx = x + Math.cos(a) * R * k * 0.9, by = y + Math.sin(a) * R * k * 0.9;
      var tipx = x + Math.cos(a) * L * 0.55 + Math.sin(t * 3 + i) * 6 * s, tipy = y + Math.sin(a) * L * 0.6 - L * 0.55 * up - 10 * s;
      var w = 0.22;
      ctx.moveTo(x + Math.cos(a - w) * R * k * 0.8, y + Math.sin(a - w) * R * k * 0.8);
      ctx.quadraticCurveTo(bx + (tipx - bx) * 0.3 - 8 * s, by + (tipy - by) * 0.5, tipx, tipy);
      ctx.quadraticCurveTo(bx + (tipx - bx) * 0.3 + 8 * s, by + (tipy - by) * 0.5, x + Math.cos(a + w) * R * k * 0.8, y + Math.sin(a + w) * R * k * 0.8);
      ctx.closePath();
    }
    ctx.fillStyle = layer ? 'rgba(255,255,240,0.32)' : rad(x, y - 40 * s, 10, R + hgt, [[0, luCss(aura, 0.7)], [0.6, luCss(aura, 0.35)], [1, luCss(aura, 0)]]);
    ctx.fill();
  }
  ctx.restore();
}

function luSlamBand(x, y, w, k, aura) {
  // slanted energy band behind a title, swiping in from the left
  if (!(k > 0)) return;
  var e = eo(k / 0.5), x0 = x - w / 2 - 30, x1 = x0 + (w + 60) * e;
  ctx.save();
  ctx.fillStyle = luCss(aura, 0.85); ctx.beginPath(); ctx.moveTo(x0 + 22, y - 56); ctx.lineTo(x1 + 22, y - 56); ctx.lineTo(x1, y + 12); ctx.lineTo(x0, y + 12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.ink; ctx.beginPath(); ctx.moveTo(x0, y + 12); ctx.lineTo(x1, y + 12); ctx.lineTo(x1 - 4, y + 22); ctx.lineTo(x0 - 4, y + 22); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function luGauge(g, lv, lvPop, aura, t, full) {
  var x = 1186, y0 = 196, y1 = 556, w = 34, h = y1 - y0;
  txt('LV', x, y0 - 18, 28, { color: '#ffffff', stroke: P.ink, sw: 6 });
  ctx.save();
  ctx.fillStyle = 'rgba(6,8,24,0.8)'; ctx.beginPath(); rrect(x - w / 2 - 6, y0 - 6, w + 12, h + 12, 16); ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.stroke();
  var fh = h * g;
  ctx.beginPath(); rrect(x - w / 2, y1 - fh, w, fh, 10); ctx.save(); ctx.clip();
  ctx.fillStyle = lin(0, y1, 0, y0, [[0, luCss(aura, 0.95)], [1, '#ffffff']]); ctx.fillRect(x - w / 2, y0, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x - w / 2 + 5, y0, 6, h);
  // energy bubbles rising inside
  for (var i = 0; i < 6; i++) { var by = y1 - ((t * 60 + i * 61) % fh); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(x - 8 + hash(i, 3) * 14, by, 4, 4); }
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  for (i = 1; i < 10; i++) ctx.fillRect(x + w / 2 - 9, y0 + h * i / 10, 9, 2);
  ctx.restore();
  bloom(x, y1 - fh, 40 + 30 * full, luCss(aura, 0.7), 0.6 + 0.4 * pulse(t, 2));
  // readout
  var s = 1 + 0.5 * (1 - eo(lvPop)) * (lvPop > 0 ? 1 : 0);
  at(x - 4, 618, s, -0.06, function () { txt(lv, 0, 0, 46, { color: '#ffffff', stroke: P.ink, sw: 9 }); });
}

defineScene({
  id: 'levelup',
  title: 'Leveling Up',
  alt: 'Claude powers up on a glowing platform above the clouds while Dario watches: bursts of light announce Claude 3 and 3.5 Sonnet in 2024, Claude Code and Claude 4 in 2025, and the Claude 5 family in 2026, as a level gauge fills to the top.',
  min: 12,
  transition: 'fade',
  lines: [
    'Then I kept leveling up.',
    'Claude 3 and 3.5 Sonnet in 2024.',
    'Claude Code and Claude 4 in 2025.',
    'And in 2026, the Claude 5 family!'
  ],
  draw: function (c) {
    var t = c.t, i;
    // the five level-ups, each on the spoken name
    var E = [c.since(1, 0.02), c.since(1, 0.37), c.since(2, 0.02), c.since(2, 0.33), c.since(3, 0.5)];
    var n = 0, burst = 0, flashK = 0, shk = 0;
    for (i = 0; i < 5; i++) {
      if (E[i] >= 0) n = i + 1;
      var bu = (E[i] >= 0 ? 1 : 0) * (1 - seg(E[i], 0, 0.9));
      burst = Math.max(burst, bu * LU_POW[i]);
      flashK = Math.max(flashK, (E[i] >= 0 ? 1 : 0) * (1 - seg(E[i], 0, 0.28)) * (i === 4 ? 1 : 0.75));
      shk = Math.max(shk, (E[i] >= 0 ? 1 : 0) * (1 - seg(E[i], 0, 0.55)) * LU_POW[i]);
    }
    // eased level values, blended event by event
    var aura = hexToRgb(LU_AURA[0]), sc = LU_SCALE[0], gauge = LU_GAUGE[0], tilt = LU_TILT[0];
    for (i = 0; i < 5; i++) {
      var u = seg(E[i], 0, 0.5);
      aura = luMixA(aura, hexToRgb(LU_AURA[i + 1]), eo(u));
      sc += (LU_SCALE[i + 1] - LU_SCALE[i]) * back(u);
      gauge += (LU_GAUGE[i + 1] - LU_GAUGE[i]) * eo(seg(E[i], 0.1, 0.7));
      tilt += (LU_TILT[i + 1] - LU_TILT[i]) * eo(seg(E[i], 0, 0.35));
    }
    var power = 0.2 + 0.16 * n;
    var charge = clamp(0.35 + 0.65 * seg(c.since(0, 0), 0, 1.6)) * (1 - 0.6 * seg(E[0], 0, 0.4)) + (n >= 5 ? 0.3 : 0.9 * seg(c.since(3, 0.1), 0, 0.6));
    var dr = drift(t, 1), sk = shake(t, 0.9 * shk);
    var zoom = 1 + 0.03 * eo(t / 6) + 0.05 * burst + 0.015 * n;
    var sx = LU_SP[0], sy = LU_SP[1];

    camera(690 + dr[0] + sk[0], 370 + dr[1] + sk[1], zoom, tilt, function () {
      // sky tinted by the current aura
      var mid = luMixA([24, 20, 80], aura, 0.24), hor = luMixA([70, 30, 110], aura, 0.6);
      ctx.fillStyle = lin(0, -80, 0, 680, [[0, '#04051a'], [0.45, luCss(mid)], [0.85, luCss(hor)], [1, luCss(luMixA(hor, [255, 255, 255], 0.2))]]);
      ctx.fillRect(-300, -300, W + 600, H + 600);
      stars(44, 110, t, [-100, -100, W + 200, 520]);
      // vortex: big rotating halos behind the spirit
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (i = 0; i < 3; i++) {
        var R = 230 + i * 120 + 40 * n, rot = t * (0.25 - i * 0.12) + i;
        ctx.strokeStyle = luCss(aura, 0.22 + 0.08 * (2 - i)); ctx.lineWidth = 3 + (2 - i) * 2;
        ctx.setLineDash([R * 0.5, R * 0.18, R * 0.12, R * 0.18]); ctx.lineDashOffset = rot * R;
        ctx.beginPath(); ctx.ellipse(sx, sy, R, R * 0.92, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.setLineDash([]);
      // tick ring (a tech "magic circle")
      ctx.strokeStyle = luCss(aura, 0.35); ctx.lineWidth = 2; ctx.beginPath();
      var R2 = 200 + 30 * n;
      for (i = 0; i < 72; i++) { var a = i / 72 * Math.PI * 2 - t * 0.2, l = i % 6 ? 8 : 20; ctx.moveTo(sx + Math.cos(a) * R2, sy + Math.sin(a) * R2); ctx.lineTo(sx + Math.cos(a) * (R2 + l), sy + Math.sin(a) * (R2 + l)); }
      ctx.stroke();
      ctx.restore();
      // light pillar
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      var pw = 70 + 26 * n + 120 * burst;
      ctx.fillStyle = lin(sx - pw, 0, sx + pw, 0, [[0, luCss(aura, 0)], [0.5, luCss(aura, 0.28 + 0.3 * burst)], [1, luCss(aura, 0)]]);
      ctx.fillRect(sx - pw, -300, pw * 2, LU_PL[1] + 300);
      ctx.fillStyle = lin(sx - pw * 0.25, 0, sx + pw * 0.25, 0, [[0, 'rgba(255,255,255,0)'], [0.5, 'rgba(255,255,255,' + (0.14 + 0.35 * burst) + ')'], [1, 'rgba(255,255,255,0)']]);
      ctx.fillRect(sx - pw * 0.25, -300, pw * 0.5, LU_PL[1] + 300);
      ctx.restore();
      // sea of clouds far below, rim-lit by the aura
      var ct = { base: luCss(luMixA([60, 58, 120], aura, 0.15)), shade: '#262a57', shade2: 'rgba(10,10,40,0.35)', rim: luCss(luMixA([200, 200, 255], aura, 0.5), 0.85) };
      for (i = 0; i < 6; i++) {
        var cxp = ((i * 260 + t * 8) % 1560) - 140;
        cloud(cxp, 660 + (i % 2) * 26, 0.9 + hash(i, 9) * 0.5, { base: ct.base, shade: ct.shade, shade2: ct.shade2, rim: ct.rim, seed: 40 + i });
      }
      ctx.fillStyle = lin(0, 680, 0, 900, [[0, luCss(luMixA([40, 40, 100], aura, 0.15))], [1, '#0a0a24']]); ctx.fillRect(-300, 690, W + 600, 400);
      // platform, shock rings on its surface
      luPlatform(t, aura, power, n);
      for (i = 0; i < 5; i++) {
        if (!(E[i] >= 0)) continue;
        var ur = seg(E[i], 0, 0.9); if (ur >= 1) continue;
        var rr = 80 + 900 * eo(ur) * (0.8 + 0.2 * LU_POW[i]);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 1 - ur;
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 10 * (1 - ur) + 2; ctx.beginPath(); ctx.ellipse(LU_PL[0], LU_PL[1], rr, rr * 0.19, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = luCss(aura, 0.9); ctx.lineWidth = 24 * (1 - ur); ctx.beginPath(); ctx.arc(sx, sy, 60 + 620 * eo(ur), 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      // rising debris and sparks
      for (i = 0; i < 12; i++) {
        var ph = (t * (0.08 + 0.05 * power + hash(i, 1) * 0.05) + hash(i, 2)) % 1;
        var dx = sx + (hash(i, 3) - 0.5) * 720, dy = LU_PL[1] - 10 - ph * 520, ds = 5 + hash(i, 4) * 11;
        fade(Math.sin(ph * Math.PI), function () {
          at(dx, dy, ds, t * (0.6 + hash(i, 5)) + i, function () {
            ctx.fillStyle = '#1b1a36'; ctx.beginPath(); poly([[-1, -0.6], [0.2, -1], [1, -0.2], [0.6, 0.8], [-0.7, 0.7]]); ctx.fill();
            ctx.fillStyle = luCss(aura, 0.9); ctx.beginPath(); poly([[-1, -0.6], [0.2, -1], [0.1, -0.7], [-0.75, -0.35]]); ctx.fill();
          });
        });
      }
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (i = 0; i < 46; i++) {
        var ph2 = (t * (0.25 + hash(i, 11) * 0.35) * (1 + power) + hash(i, 12)) % 1;
        var px = sx + (hash(i, 13) - 0.5) * 820 * (0.4 + 0.6 * hash(i, 14)), py = LU_PL[1] - ph2 * 600;
        ctx.fillStyle = luCss(i % 3 ? aura : [255, 255, 255], 0.8 * Math.sin(ph2 * Math.PI)); ctx.fillRect(px, py, 2.5, 10 + 14 * power);
      }
      // charge: energy streaks converging into the spirit
      for (i = 0; i < 28; i++) {
        var ph3 = (t * 0.9 + hash(i, 21)) % 1, ang = hash(i, 22) * Math.PI * 2, r0 = 520 * (1 - ph3), r1 = r0 + 70;
        ctx.strokeStyle = luCss(aura, 0.7 * charge * Math.sin(ph3 * Math.PI)); ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(sx + Math.cos(ang) * r0, sy + Math.sin(ang) * r0 * 0.8); ctx.lineTo(sx + Math.cos(ang) * r1, sy + Math.sin(ang) * r1 * 0.8); ctx.stroke();
      }
      ctx.restore();
      // the spirit with its aura
      var bob = Math.sin(t * 2) * 6 * sc;
      bloom(sx, sy, 190 * sc, luCss(aura, 0.5), 0.7 + 0.3 * burst);
      luAura(sx, sy + bob, sc, t, aura, power, burst);
      var mood = n >= 5 && E[4] > 1 ? 'proud' : (burst > 0.3 ? 'wow' : 'determined');
      spirit(sx, sy, sc, { t: t, mood: mood, glow: 0.6 + 0.08 * n + 0.6 * burst, power: clamp(power + 0.3 * burst), look: [-0.25, 0.1] });
      // lightning arcs crackling around the spirit on each burst (and quietly at full power)
      var idle = burst <= 0.05, arcs = idle ? (n >= 5 ? 2 : 0) : 5, fr = Math.floor(t * 14);
      for (i = 0; i < arcs; i++) {
        var a0 = idle ? -Math.PI * (0.15 + 0.7 * hash(fr, i)) : hash(fr, i) * Math.PI * 2, r0b = 66 * sc, r1b = (idle ? 105 + 45 * hash(fr + 1, i) : 150 + 120 * hash(fr + 1, i)) * sc;
        luBolt(sx + Math.cos(a0) * r0b, sy + Math.sin(a0) * r0b, sx + Math.cos(a0 + 0.4) * r1b, sy + Math.sin(a0 + 0.4) * r1b, fr * 7 + i, 2.2, luCss(aura, 1));
      }
      if (burst > 0.05) speedLines(sx, sy, t, { n: 90, inner: 170 * sc, color: '#ffffff', a: 0.5 * clamp(burst) });
    });

    // ---------- foreground: Dario watches, lit by the aura ----------
    var auraHex = luHex(aura);
    var fsk = shake(t + 3, 1.2 * shk);
    var expr = 'determined';
    if (n >= 4) expr = 'grin';
    if (n >= 5) expr = E[4] < 1.2 ? 'surprised' : 'smile';
    if (n >= 1 && E[0] < 1.0) expr = 'surprised';
    bust('dario', 196 + dr[0] * 1.8 + fsk[0], 806 + dr[1] * 1.4 + fsk[1], 1.02 * (1 + 0.02 * burst), { t: t, expr: expr, look: [0.75, -0.55], turn: 0.4, wind: clamp(0.3 + 0.12 * n + 0.6 * burst), rim: auraHex, light: 0.8 + 0.2 * burst });
    bloom(330, 470, 260, luCss(aura, 0.18), 0.6 + 0.4 * burst);

    // ---------- titles ----------
    var outA = eo(seg(c.since(2, 0.0), -0.12, 0.3)), outB = eo(seg(c.since(3, 0.24), 0, 0.35));
    var TX = 630;
    var drawPair = function (strA, strB, eA, eB, out, colA, colB) {
      if (out >= 1) return;
      ctx.save(); ctx.translate(-260 * ei(out), 0); ctx.globalAlpha *= 1 - out;
      var kA = seg(eA, 0, 0.5), kB = seg(eB, 0, 0.5);
      if (kA > 0) { luSlamBand(TX, 156, txtWidth(strA, 62), kA, hexToRgb(colA)); slam(strA, TX, 156, 62, kA, { color: '#ffffff', stroke: P.ink, sw: 12 }); }
      if (kB > 0) { luSlamBand(TX, 240, txtWidth(strB, 62), kB, hexToRgb(colB)); slam(strB, TX, 240, 62, kB, { color: '#ffffff', stroke: P.ink, sw: 12 }); }
      ctx.restore();
    };
    drawPair('CLAUDE 3', '3.5 SONNET', E[0], E[1], outA, LU_AURA[1], LU_AURA[2]);
    drawPair('CLAUDE CODE', 'CLAUDE 4', E[2], E[3], outB, LU_AURA[3], LU_AURA[4]);
    var k5 = seg(E[4], 0, 0.55);
    if (k5 > 0) {
      luSlamBand(TX, 190, txtWidth('CLAUDE 5', 94) - 10, k5, hexToRgb(LU_AURA[5]));
      slam('CLAUDE 5', TX, 192, 94, k5, { color: '#ffffff', stroke: P.ink, sw: 15 });
      var kf = eo(seg(c.since(3, 0.8), 0, 0.4));
      if (kf > 0) at(TX + 4, 244, back(kf), -0.04, function () {
        ctx.fillStyle = P.ink; ctx.beginPath(); rrect(-96, -26, 192, 46, 23); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); rrect(-90, -20, 180, 34, 17); ctx.fill();
        txt('FAMILY', 0, 9, 26, { color: P.ink, ls: 6 });
      });
    }

    // ---------- HUD gauge ----------
    var lvPop = 1;
    for (i = 0; i < 5; i++) if (E[i] >= 0 && LU_LV[i + 1] !== LU_LV[i]) lvPop = seg(E[i], 0, 0.45);
    luGauge(gauge, LU_LV[n], lvPop, aura, t, n >= 5 ? 1 : 0);

    flash(flashK * 0.85, '#ffffff');
    vignette(0.45);
    c.yr(c.since(3, 0) >= 0 ? '2026' : (c.since(2, 0) >= 0 ? '2025' : '2024'));
  }
});
