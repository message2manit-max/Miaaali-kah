/* =====================================================================
   player.js — timeline, narration sync, transitions and controls.
   Scenes are registered by src/scenes/*.js through defineScene().
   ===================================================================== */

var LEAD = 0.35, GAP = 0.22, TAIL = 0.45;
var rateK = 1;
function baseEst(txt) {
  var words = txt.trim().split(/\s+/).length, nums = (txt.match(/\d[\d,.]*/g) || []).length;
  return (words + nums * 0.8) / 2.8 + 0.2;
}
function newState(i) { return { i: i, t: 0, starts: [], ests: [], bases: [], yr: { s: '', since: 0 } }; }
var PL = { playing: false, cur: null, prev: null, fade: 1, line: -1, state: 'pre', st: 0, ended: false, uid: 0, done: false, ttsBad: false, poster: true };

// The object every scene's draw(c) receives.
function mkC(S) {
  var c = {
    t: S.t,
    when: function (i, f) { return S.starts[i] === undefined ? Infinity : S.starts[i] + (f || 0) * S.ests[i]; },
    since: function (i, f) { return S.t - c.when(i, f); },
    lineK: function (i) { return S.starts[i] === undefined ? 0 : clamp((S.t - S.starts[i]) / S.ests[i]); },
    yr: function (s) { if (S.yr.s !== s) { S.yr.since = S.yr.s === '' ? 0 : S.t; S.yr.s = s; } yearBadge(s, seg(S.t - S.yr.since, 0.15, 0.5)); }
  };
  return c;
}

var $ = function (id) { return document.getElementById(id); };
var canvas = $('cv'), stage = $('stage'), subs = $('subs');
var synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
var voices = [], voice = null, keepU = null;

function voiceOn() { return !!synth && $('voiceOn').checked && !PL.ttsBad; }
function setSub(txt) { subs.classList.remove('hint'); subs.textContent = txt; }

function speak(txt) {
  if (!synth) return;
  var id = ++PL.uid;
  var u = new SpeechSynthesisUtterance(txt);
  if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'en-US';
  u.rate = 1; u.pitch = 1.05;
  u.onend = function () { if (id === PL.uid) PL.ended = true; };
  u.onerror = function (e) {
    if (id !== PL.uid) return;
    if (e && (e.error === 'interrupted' || e.error === 'canceled')) return;
    PL.ttsBad = true; setVoiceNote('The voice stopped working in this browser, so the story continues with subtitles only.');
  };
  keepU = u;
  synth.speak(u);
}
function hush() { PL.uid++; if (synth && (synth.speaking || synth.pending)) synth.cancel(); }

function nextLine() {
  var S = PL.cur, sc = SCENES[S.i];
  PL.line++;
  var txt = sc.lines[PL.line], b = baseEst(txt);
  S.starts[PL.line] = S.t; S.bases[PL.line] = b; S.ests[PL.line] = b * rateK;
  PL.state = 'speak'; PL.st = 0; PL.ended = false;
  setSub(txt);
  if (PL.playing && voiceOn()) speak(txt);
  updateChapters();
}
function endLine() {
  var S = PL.cur;
  if (voiceOn() && PL.ended && PL.playing) {
    var raw = PL.st / S.bases[PL.line];
    if (raw < 0.3) { PL.ttsBad = true; setVoiceNote('No working voice was found, so the story plays with subtitles.'); }
    else rateK = clamp(rateK * 0.6 + raw * 0.4, 0.6, 1.8);
  }
  PL.state = 'gap'; PL.st = 0;
}
function update(dt) {
  if (PL.done) return;
  var S = PL.cur, sc = SCENES[S.i];
  S.t += dt; PL.st += dt;
  if (PL.fade < 1) PL.fade = Math.min(1, PL.fade + dt / (sc.fadeIn || 0.6));
  if (PL.state === 'pre') { if (PL.st >= (sc.lead === undefined ? LEAD : sc.lead)) nextLine(); }
  else if (PL.state === 'speak') {
    var e = S.ests[PL.line], speaking = voiceOn() && PL.playing;
    if ((speaking && PL.ended && PL.st > 0.2) || (!speaking && PL.st >= e) || PL.st > e * 2.4 + 3) endLine();
  } else if (PL.state === 'gap') {
    if (PL.st >= GAP) { if (PL.line < sc.lines.length - 1) nextLine(); else { PL.state = 'tail'; PL.st = 0; } }
  } else if (PL.state === 'tail') {
    if (!PL.hold && S.t >= sc.min && PL.st >= (sc.tail === undefined ? TAIL : sc.tail)) goScene(S.i + 1, true);
  }
}
function goScene(i, smooth) {
  if (i >= SCENES.length) { finish(); return; }
  if (smooth && PL.cur) { PL.prev = PL.cur; PL.fade = 0; } else { PL.prev = null; PL.fade = 1; }
  PL.cur = newState(i); PL.line = -1; PL.state = 'pre'; PL.st = 0; PL.ended = false;
  canvas.setAttribute('aria-label', 'Anime scene: ' + SCENES[i].alt);
  updateChapters();
}
function finish() {
  PL.done = true; PL.playing = false; hush();
  $('endcard').hidden = false;
  updateButtons(); updateChapters();
}

/* ---------- controls ---------- */
function updateButtons() {
  $('playlabel').textContent = PL.playing ? 'Pause' : (PL.done ? 'Replay' : 'Play');
  $('playicon').setAttribute('d', PL.playing ? 'M6 4.5h4.5v15H6zM13.5 4.5H18v15h-4.5z' : 'M7 4.5v15l12.5-7.5z');
}
function unlockSpeech() {
  if (!synth || !$('voiceOn').checked) return;
  try { var u = new SpeechSynthesisUtterance(' '); u.volume = 0; synth.speak(u); } catch (e) {}
}
function play() {
  if (PL.done || PL.poster) { hush(); PL.done = false; PL.poster = false; $('endcard').hidden = true; goScene(0, false); }
  $('bigplay').hidden = true;
  unlockSpeech();
  PL.playing = true;
  if (PL.state === 'speak' && voiceOn()) { speak(SCENES[PL.cur.i].lines[PL.line]); PL.st = 0; PL.ended = false; }
  updateButtons();
}
function pause() { PL.playing = false; hush(); updateButtons(); }
function jump(i) {
  hush(); PL.done = false; PL.poster = false; $('endcard').hidden = true; $('bigplay').hidden = true;
  goScene(i, false); unlockSpeech(); PL.playing = true; updateButtons();
}

var chapWrap = $('chapters'), chapBtns = [];
function buildChapters() {
  chapWrap.style.gridTemplateColumns = 'repeat(' + SCENES.length + ', minmax(0, 1fr))';
  SCENES.forEach(function (sc, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'chap'; b.title = (i + 1) + '. ' + sc.title;
    b.setAttribute('aria-label', 'Chapter ' + (i + 1) + ': ' + sc.title);
    b.appendChild(document.createElement('span'));
    b.addEventListener('click', function () { jump(i); });
    chapWrap.appendChild(b); chapBtns.push(b);
  });
}
function updateChapters() {
  if (!PL.cur) return;
  var cur = PL.cur.i, sc = SCENES[cur];
  chapBtns.forEach(function (b, i) {
    b.classList.toggle('done', i < cur || (PL.done && i === cur));
    b.setAttribute('aria-current', i === cur ? 'step' : 'false');
    b.firstChild.style.width = i === cur && !PL.done ? Math.round(100 * Math.max(0, PL.line + 1) / sc.lines.length) + '%' : '';
  });
  $('chapLabel').innerHTML = 'Chapter <b>' + (cur + 1) + '</b> of ' + SCENES.length + ' · ' + sc.title;
}
function setVoiceNote(s) { $('voiceNote').textContent = s; }

$('bigplay').addEventListener('click', play);
$('play').addEventListener('click', function () { if (PL.playing) pause(); else play(); });
$('restart').addEventListener('click', function () { jump(0); });
$('again').addEventListener('click', function () { jump(0); });
$('voiceOn').addEventListener('change', function () {
  if (!$('voiceOn').checked) { hush(); setVoiceNote('Voice off: subtitles only.'); }
  else { PL.ttsBad = false; describeVoice(); }
});
$('voiceSel').addEventListener('change', function () {
  var v = voices[+$('voiceSel').value];
  if (v) { voice = v; PL.ttsBad = false; try { localStorage.setItem('claudeAnimeVoice', v.name); } catch (e) {} describeVoice(); }
});
$('fs').addEventListener('click', function () {
  var pl = $('player');
  try {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (pl.requestFullscreen) { var r = pl.requestFullscreen(); if (r && r.catch) r.catch(function () {}); }
  } catch (e) {}
});
document.addEventListener('keydown', function (e) {
  if (e.key !== ' ' && e.key !== 'k') return;
  var tg = e.target && e.target.tagName;
  if (tg === 'BUTTON' || tg === 'SELECT' || tg === 'INPUT' || tg === 'A' || tg === 'TEXTAREA') return;
  e.preventDefault(); if (PL.playing) pause(); else play();
});
document.addEventListener('visibilitychange', function () { if (document.hidden && PL.playing) pause(); });

function describeVoice() {
  if (!synth) { setVoiceNote('This browser has no speech voice, so the story plays with subtitles.'); return; }
  if (!voices.length) { setVoiceNote($('voiceOn').checked ? 'Using the browser\'s default voice.' : 'Voice off: subtitles only.'); return; }
  setVoiceNote($('voiceOn').checked ? 'Voice: ' + (voice ? voice.name : 'browser default') : 'Voice off: subtitles only.');
}
function loadVoices() {
  if (!synth) { $('voiceSel').hidden = true; $('voiceOn').disabled = true; describeVoice(); return; }
  var all = synth.getVoices() || [];
  voices = all.filter(function (v) { return /^en(-|_|$)/i.test(v.lang); });
  if (!voices.length) voices = all.slice();
  var saved = null; try { saved = localStorage.getItem('claudeAnimeVoice'); } catch (e) {}
  var prefs = [/Natural/i, /\b(Aria|Jenny|Ava|Emma|Michelle)\b/i, /Samantha/i, /Google US English/i, /Google UK English Female/i, /\b(Karen|Moira|Tessa|Serena|Allison|Zira)\b/i];
  voice = null;
  if (saved) voice = voices.find(function (v) { return v.name === saved; }) || null;
  for (var i = 0; !voice && i < prefs.length; i++) voice = voices.find(function (v) { return prefs[i].test(v.name) && /^en/i.test(v.lang); }) || null;
  if (!voice) voice = voices.find(function (v) { return /en-US/i.test(v.lang); }) || voices[0] || null;
  var sel = $('voiceSel'); sel.innerHTML = '';
  voices.forEach(function (v, i) {
    var o = document.createElement('option'); o.value = String(i); o.textContent = v.name + ' (' + v.lang + ')';
    if (v === voice) o.selected = true; sel.appendChild(o);
  });
  sel.hidden = voices.length < 2;
  describeVoice();
}

/* ---------- rendering ---------- */
var mainCtx = canvas.getContext('2d'), grainPat = null;
function makeGrain() {
  var S = 128, cv = document.createElement('canvas'); cv.width = cv.height = S;
  var g = cv.getContext('2d'), img = g.createImageData(S, S);
  for (var i = 0; i < S * S; i++) { var v = Math.random() * 255; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
  g.putImageData(img, 0, 0);
  return mainCtx.createPattern(cv, 'repeat');
}
function resize() {
  var dpr = Math.min(window.devicePixelRatio || 1, 2), cw = stage.clientWidth || 640;
  var w = Math.max(320, Math.round(cw * dpr)), h = Math.round(w * 9 / 16);
  if (canvas.width === w && canvas.height === h) return;
  canvas.width = w; canvas.height = h;
  draw(performance.now());
}
function drawState(S) {
  ctx.save();
  try { SCENES[S.i].draw(mkC(S)); } catch (err) { if (!drawState.warned) { drawState.warned = true; console.error(err); } }
  ctx.restore();
}
function draw(now) {
  NOW = now / 1000;
  var w = canvas.width, h = canvas.height, k = w / W;
  ctx = mainCtx;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#05030b'; ctx.fillRect(0, 0, w, h);
  ctx.setTransform(k, 0, 0, k, 0, 0);
  if (!PL.cur) return;
  var mid = PL.prev && PL.fade < 1;
  if (mid) drawState(PL.prev);
  ctx.save();
  if (mid) {
    var sc = SCENES[PL.cur.i];
    if (sc.transition === 'flash') { ctx.globalAlpha = eo(PL.fade); drawState(PL.cur); ctx.restore(); flash(1 - Math.abs(PL.fade * 2 - 1), '#ffffff'); ctx.save(); }
    else if (sc.transition === 'wipe') {
      var x = lerp(-200, W + 300, eio(PL.fade));
      ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(x + 150, -10); ctx.lineTo(x - 150, H + 10); ctx.lineTo(-10, H + 10); ctx.closePath(); ctx.clip();
      drawState(PL.cur);
    } else { ctx.globalAlpha = eo(PL.fade); drawState(PL.cur); }
  } else drawState(PL.cur);
  ctx.restore();
  // light film grain for a broadcast look
  if (grainPat) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.save(); ctx.globalAlpha = 0.035; ctx.globalCompositeOperation = 'overlay';
    var ox = (Math.floor(now / 50) * 37) % 128, oy = (Math.floor(now / 50) * 61) % 128;
    ctx.translate(-ox, -oy); ctx.fillStyle = grainPat; ctx.fillRect(0, 0, w + 128, h + 128);
    ctx.restore();
  }
}
var last = performance.now(), lastDraw = 0;
function frame(now) {
  requestAnimationFrame(frame);
  if (now - lastDraw < 30) return;
  var dt = Math.min(0.1, (now - last) / 1000); last = now; lastDraw = now;
  if (PL.playing) update(dt);
  draw(now);
}

// Jump to a moment without sound (poster frame and frame checks).
function simulate(i, t) {
  hush(); goScene(i, false);
  var playing = PL.playing; PL.playing = false;
  for (var x = 0; x < t && PL.cur.i === i && !PL.done; x += 1 / 30) update(1 / 30);
  PL.playing = playing;
}
window.storyFrame = function (i, t) { PL.poster = false; simulate(i, t); PL.fade = 1; PL.prev = null; draw(performance.now()); };
// Hold test: stay on scene i past its end, with the voice-speed factor `rate` (1.8 = a slow voice).
window.storyHold = function (i, t, rate) { var r0 = rateK; rateK = rate || 1; PL.hold = true; PL.poster = false; simulate(i, t); PL.hold = false; rateK = r0; PL.fade = 1; PL.prev = null; draw(performance.now()); };
window.storyFade = function (i, f) { simulate(i, 0.01); PL.prev = newState(Math.max(0, i - 1)); PL.prev.t = 30; PL.fade = f; draw(performance.now()); };
window.storySceneLengths = function () {
  var out = [], pl = PL.playing; PL.playing = false;
  for (var i = 0; i < SCENES.length; i++) {
    goScene(i, false);
    var x = 0;
    while (PL.cur.i === i && !PL.done && x < 200) { update(1 / 30); x += 1 / 30; }
    out.push(Math.round(x * 10) / 10); PL.done = false;
  }
  PL.playing = pl; $('endcard').hidden = true; showPoster();
  return out;
};
window.storyLength = function () {
  var total = 0, pl = PL.playing; PL.playing = false; goScene(0, false);
  while (!PL.done && total < 900) { update(1 / 30); total += 1 / 30; }
  PL.done = false; $('endcard').hidden = true; PL.playing = pl; showPoster();
  return Math.round(total);
};
window.storyScenes = function () { return SCENES.map(function (s) { return { id: s.id, title: s.title, lines: s.lines, min: s.min }; }); };
function showPoster() {
  var pi = 0, pt = 7;
  for (var i = 0; i < SCENES.length; i++) if (SCENES[i].poster !== undefined) { pi = i; pt = SCENES[i].poster; break; }
  simulate(pi, pt); PL.poster = true; PL.fade = 1; PL.prev = null;
  subs.classList.add('hint'); subs.textContent = 'Press play and Claude will tell you the story. The words show up here too.';
  updateChapters(); updateButtons();
}

function boot() {
  buildChapters();
  if (synth) {
    loadVoices();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', loadVoices); else synth.onvoiceschanged = loadVoices;
    setTimeout(function () { if (!voices.length) loadVoices(); }, 1500);
  } else loadVoices();
  grainPat = makeGrain();
  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);
  showPoster();
  resize();
  requestAnimationFrame(frame);
  window.storyFontsReady = loadFonts().then(function () { draw(performance.now()); });
}
boot();
