/* =====================================================================
   characters.js: PROVISIONAL STUB. The final anime rig from the
   character panel replaces this file. It only honours the API contract
   (functions, anchors and sizes) so scenes can be composed meanwhile.
   ===================================================================== */
var CAST = {
  dario:   { hair: '#3a2a22', skin: '#f6d2bc', top: '#24345e', glasses: true, curly: true },
  daniela: { hair: '#7a3f2a', skin: '#f9dccb', top: '#5b2b52', long: true },
  jared:   { hair: '#2b2220', skin: '#f2cdb3', top: '#3d6b45', beard: true },
  sam:     { hair: '#8a6a4a', skin: '#f6d6c2', top: '#7a7f8c' },
  tom:     { hair: '#141418', skin: '#e9c2a3', top: '#4a6fa5' },
  chris:   { hair: '#6b4a32', skin: '#f6d6c2', top: '#2a8c8c', long: true },
  jack:    { hair: '#5a4030', skin: '#f6d2bc', top: '#3a3d46' },
  ben:     { hair: '#c9a96b', skin: '#f6d6c2', top: '#b8373b' },
  sciA:    { hair: '#1d1b22', skin: '#e8c3a6', top: '#eef2f7', long: false },
  sciB:    { hair: '#2b2622', skin: '#c99272', top: '#eef2f7' }
};
function _spec(who) { return typeof who === 'string' ? (CAST[who] || CAST.sam) : (who || CAST.sam); }
// full body, origin = feet, ~420 px tall at s = 1
function person(who, x, y, s, o) {
  o = o || {}; var c = _spec(who);
  at(x, y, s, 0, function () {
    var walk = o.walk !== undefined && o.walk !== null ? Math.sin(o.walk) * 0.35 : 0;
    ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.strokeStyle = '#2a2a3a';
    ctx.beginPath(); ctx.moveTo(-14, -200); ctx.lineTo(-18 - walk * 60, 0); ctx.moveTo(14, -200); ctx.lineTo(18 + walk * 60, 0); ctx.stroke();
    cel(function () { rrect(-50, -340, 100, 150, 30); }, c.top, { line: 3 });
    ctx.strokeStyle = c.top; ctx.lineWidth = 22;
    var up = o.arms === 'wave' || o.arms === 'raise' || o.arms === 'fist';
    ctx.beginPath(); ctx.moveTo(-44, -320); ctx.lineTo(-62, -210); ctx.moveTo(44, -320); ctx.lineTo(up ? 80 : 62, up ? -430 : -210); ctx.stroke();
    cel(function () { ctx.ellipse(0, -372, 40, 46, 0, 0, Math.PI * 2); }, c.skin, { line: 3 });
    fillWith(function () { ctx.ellipse(0, -392, 46, c.long ? 50 : 34, 0, Math.PI, Math.PI * 2); if (c.long) ctx.rect(-46, -392, 18, 80), ctx.rect(28, -392, 18, 80); }, c.hair);
    fillWith(function () { ctx.arc(-14, -368, 5, 0, Math.PI * 2); ctx.arc(14, -368, 5, 0, Math.PI * 2); }, P.ink);
  }, o.flip);
}
// head and shoulders, origin = bottom centre of shoulders, head ~250 px tall at s = 1
function bust(who, x, y, s, o) {
  o = o || {}; var c = _spec(who);
  at(x, y, s, 0, function () {
    cel(function () { ctx.moveTo(-210, 0); ctx.quadraticCurveTo(-200, -170, -60, -190); ctx.lineTo(60, -190); ctx.quadraticCurveTo(200, -170, 210, 0); ctx.closePath(); }, c.top, { line: 4 });
    cel(function () { rrect(-30, -230, 60, 60, 20); }, c.skin, { line: 3 });
    cel(function () { ctx.ellipse(0, -340, 95, 120, 0, 0, Math.PI * 2); }, c.skin, { line: 4 });
    fillWith(function () { ctx.ellipse(0, -390, 108, c.long ? 110 : 80, 0, Math.PI, Math.PI * 2); if (c.long) ctx.rect(-108, -390, 34, 200), ctx.rect(74, -390, 34, 200); }, c.hair);
    fillWith(function () { ctx.ellipse(-36, -330, 14, 20, 0, 0, Math.PI * 2); ctx.ellipse(36, -330, 14, 20, 0, 0, Math.PI * 2); }, P.ink);
    if (c.glasses) inkWith(function () { rrect(-66, -352, 58, 42, 8); rrect(8, -352, 58, 42, 8); }, 4);
  }, o.flip);
}
// Claude spark spirit, origin = centre, ~160 px across at s = 1
function spirit(x, y, s, o) {
  o = o || {}; var t = o.t || 0;
  bloom(x, y, 120 * s * (1 + (o.glow || 0.5)), 'rgba(255,140,60,0.55)');
  at(x, y + Math.sin(t * 2) * 6 * s, s, 0, function () {
    ctx.fillStyle = P.claude;
    for (var i = 0; i < 10; i++) { at(0, 0, 1, i * Math.PI / 5 + t * 0.3, function () { ctx.beginPath(); ctx.moveTo(-8, -40); ctx.lineTo(0, -80); ctx.lineTo(8, -40); ctx.fill(); }); }
    cel(function () { ctx.arc(0, 0, 46, 0, Math.PI * 2); }, P.claude, { line: 0, light: P.claudeCore, lightBuild: function () { ctx.arc(-8, -10, 30, 0, Math.PI * 2); } });
    fillWith(function () { ctx.ellipse(-14, -2, 6, o.mood === 'sleep' ? 1.5 : 9, 0, 0, Math.PI * 2); ctx.ellipse(14, -2, 6, o.mood === 'sleep' ? 1.5 : 9, 0, 0, Math.PI * 2); }, P.ink);
  });
}
