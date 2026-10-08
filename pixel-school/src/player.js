/* ---- player: playback clock, live sound, controls, and hooks for recording the video ---- */
buildCubes();
buildLayers();
const $ = id => document.getElementById(id);
const ui = {
  big: $('bigplay'), bigLabel: $('bigplay-label'), play: $('play'), restart: $('restart'), scrub: $('scrub'),
  time: $('time'), mute: $('mute'), fs: $('fs'), chapters: $('chapters'), ticks: $('ticks'), frame: $('frame'),
};
let T = 0, playing = false, last = 0, capture = false, dirty = true;
let ac = null, master = null, muted = false, sfxIdx = 0;
const N_SFX = SFX_EVENTS.length;

function ensureAudio() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try {
    ac = new AC();
    const comp = ac.createDynamicsCompressor();
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.9;
    master.connect(comp).connect(ac.destination);
  } catch (e) { ac = null; }
}
function resetSfx() { sfxIdx = 0; while (sfxIdx < N_SFX && SFX_EVENTS[sfxIdx][0] < T) sfxIdx++; }
function pumpSfx() {
  while (sfxIdx < N_SFX && SFX_EVENTS[sfxIdx][0] <= T + 0.06) {
    const e = SFX_EVENTS[sfxIdx++];
    const dt = e[0] - T;
    if (!ac || muted || dt < -0.08) continue;
    try { sfx(ac, master, ac.currentTime + Math.max(0, dt) + 0.01, e[1], e[2]); } catch (err) { /* keep playing silently */ }
  }
}
const fmt = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
function sync() {
  ui.scrub.value = T.toFixed(2);
  ui.scrub.style.setProperty('--pct', (T / DUR * 100).toFixed(2) + '%');
  ui.time.textContent = fmt(T) + ' / ' + fmt(DUR);
  ui.play.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  ui.play.dataset.state = playing ? 'pause' : 'play';
  const cur = SCENES.findIndex((s, i) => T >= s.rstart && (i === SCENES.length - 1 || T < SCENES[i + 1].rstart));
  [...ui.chapters.children].forEach((b, i) => b.setAttribute('aria-current', i === cur ? 'true' : 'false'));
}
function setPlaying(on) {
  if (on && T >= DUR - 0.05) T = 0;
  playing = on;
  if (on) { ensureAudio(); resetSfx(); last = performance.now(); ui.big.hidden = true; }
  dirty = true; sync();
}
function seek(t) { T = clamp(t, 0, DUR); resetSfx(); dirty = true; sync(); }
function fitCanvas() {
  if (capture) return;
  const r = canvas.getBoundingClientRect();
  const k = clamp(Math.ceil(r.width * (window.devicePixelRatio || 1) / VW), 1, 2);
  if (k !== K || canvas.width !== VW * k) { setK(k); dirty = true; }
}
function loop(now) {
  if (capture) return;
  if (playing) {
    T += Math.min(0.1, (now - last) / 1000);
    if (T >= DUR) { T = DUR; playing = false; ui.bigLabel.textContent = 'Watch again'; ui.big.hidden = false; }
    pumpSfx();
    dirty = true;
    sync();
  }
  last = now;
  if (dirty) { renderAt(T); dirty = false; }
  requestAnimationFrame(loop);
}

// chapters + timeline ticks
SCENES.forEach((s, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'chap';
  b.innerHTML = `<span class="chap-n">${i + 1}</span><span class="chap-t">${s.title}</span><span class="chap-time">${fmt(s.rstart)}</span>`;
  b.addEventListener('click', () => { seek(s.rstart + (i ? 0.31 : 0)); if (!playing) setPlaying(true); });
  ui.chapters.appendChild(b);
  if (i > 0) { const tk = document.createElement('i'); tk.style.left = (s.rstart / DUR * 100) + '%'; ui.ticks.appendChild(tk); }
});
ui.scrub.max = DUR.toFixed(2);
{ const rt = document.getElementById('runtime'); if (rt) rt.textContent = fmt(DUR); }
ui.scrub.addEventListener('input', () => seek(+ui.scrub.value));
ui.play.addEventListener('click', () => setPlaying(!playing));
ui.big.addEventListener('click', () => setPlaying(true));
ui.restart.addEventListener('click', () => { seek(0); setPlaying(true); });
ui.mute.addEventListener('click', () => {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.9;
  ui.mute.dataset.state = muted ? 'off' : 'on';
  ui.mute.setAttribute('aria-label', muted ? 'Turn sound on' : 'Mute');
});
ui.fs.addEventListener('click', () => {
  const el = ui.frame;
  try {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  } catch (e) { /* fullscreen not available here */ }
});
canvas.addEventListener('click', () => setPlaying(!playing));
document.addEventListener('keydown', e => {
  if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName) && e.key !== ' ') return;
  if (e.key === ' ' || e.key === 'k') { e.preventDefault(); setPlaying(!playing); }
  else if (e.key === 'ArrowRight') { seek(T + 5); }
  else if (e.key === 'ArrowLeft') { seek(T - 5); }
  else if (e.key === 'm') ui.mute.click();
  else if (e.key === 'f') ui.fs.click();
});
window.addEventListener('resize', fitCanvas);
if (window.ResizeObserver) new ResizeObserver(fitCanvas).observe(canvas);
fitCanvas();
// small portraits for the cast cards, drawn with the same sprite code
function portrait(id, draw) {
  const cv = $(id);
  if (!cv) return;
  const saved = ctx, savedCam = Object.assign({}, cam), savedK = K;
  ctx = cv.getContext('2d'); K = 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#F0EDE6'; ctx.fillRect(0, 0, cv.width, cv.height);
  draw();
  ctx = saved; K = savedK; Object.assign(cam, savedCam);
}
portrait('pc-opus', () => { setCam(-17.7, -32.2, 2.5); drawOpus(0, 0, {}); });
portrait('pc-sonnet', () => { setCam(-14.6, -31.1, 2.8); drawSonnet(0, 0, {}); });
portrait('pc-haiku', () => { setCam(-16.5, -27, 2.6); drawHaiku('W', -10, 0, { item: 'clip' }); drawHaiku('B', 10, 0, { item: 'hammer' }); drawHaiku('Y', 0, 2, {}); });
// poster: the "BUILD A SCHOOL" ticket
T = 5.8; renderAt(T); T = 0; sync();
dirty = false;
requestAnimationFrame(t => { last = t; requestAnimationFrame(loop); });

// ---- hooks used by tools/record.mjs ----
function wavBase64(data, sr) {
  const n = data.length, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true);
  v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, clamp(data[i], -1, 1) * 32767, true);
  const bytes = new Uint8Array(buf); let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
window.STORY = {
  duration: DUR,
  scenes: SCENES.map(s => ({ id: s.id, title: s.title, start: s.rstart, dur: s.rdur, story: s.start, holds: s.holds, lines: (s.lines || []).map(l => [l[0], l[1], l[2], l[3], lineCps(l)]) })),
  capture(k) { capture = true; playing = false; setK(k || 1); },
  frame(t) { renderAt(t); return canvas.toDataURL('image/png'); },
  renderOnly(t) { renderAt(t); },
  sheet(scale, poses) { // close-up model sheet for checking the sprites
    beginFrame(); setCam(0, 0, scale || 8);
    S(0, 0, VW, VH, '#F0EDE6');
    const P = poses || {};
    drawOpus(20, 30, P.opus || {}); drawSonnet(56, 30, P.sonnet || {});
    drawHaiku('W', 76, 30, P.W || { item: 'clip', checks: 1 }); drawHaiku('B', 98, 30, P.B || { item: 'tape' }); drawHaiku('Y', 87, 33, P.Y || {});
    drawKid(20, 62, {}); drawKid(32, 62, { pack: 1, eyes: 'happy' }); drawBug(48, 62, 0);
    return canvas.toDataURL('image/png');
  },
  async audio(sr) {
    sr = sr || 48000;
    const oc = new OfflineAudioContext(1, Math.ceil((DUR + 1.5) * sr), sr);
    const comp = oc.createDynamicsCompressor(), g = oc.createGain();
    g.gain.value = 0.9; g.connect(comp).connect(oc.destination);
    for (const e of SFX_EVENTS) sfx(oc, g, e[0], e[1], e[2]);
    const buf = await oc.startRendering();
    return wavBase64(buf.getChannelData(0), sr);
  },
};
