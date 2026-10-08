/* ---- timeline: reading pauses, scene start times, the school plans, every sound, and the frame renderer ---- */
// Reading pauses: once a bubble has finished typing, the story holds until it can be read.
// Story time (what the scenes are written in) pauses; real time (AMB) keeps the world alive.
SCENES.forEach(s => {
  s.holds = [];
  for (const ln of s.lines || []) {
    if (ln.noHold || ln.think) continue;
    const typed = 0.1 + ln[3].length / lineCps(ln);
    const need = Math.max(0.75, ln[3].length * 0.025) - ((ln[1] - ln[0]) - typed);
    if (need > 0.04) s.holds.push([ln[0] + typed, Math.round(need * 20) / 20]);
  }
  s.holds.sort((a, b) => a[0] - b[0]);
  s.rdur = s.dur + s.holds.reduce((a, h) => a + h[1], 0);
});
let DUR = 0, SDUR = 0;
SCENES.forEach(s => { s.start = SDUR; ST[s.id] = SDUR; SDUR += s.dur; s.rstart = DUR; DUR += s.rdur; });
function warp(s, r) { let t = r; for (const [ht, ex] of s.holds) { if (t <= ht) break; if (t < ht + ex) return ht; t -= ex; } return t; }
function unwarp(s, t) { let r = t; for (const [ht, ex] of s.holds) if (ht < t) r += ex; return r; }
function storyToReal(Ts) { let i = SCENES.length - 1; while (i > 0 && Ts < SCENES[i].start) i--; const s = SCENES[i]; return s.rstart + unwarp(s, Ts - s.start); }
planSchool(ST);
planSchool2(ST);
const SFX_EVENTS = (() => {
  const ev = [];
  for (const s of SCENES) {
    for (const e of (s.sfx || [])) ev.push([s.rstart + unwarp(s, e[0]), e[1], e[2] || {}]);
    for (const e of scriptSfx(s)) ev.push([s.rstart + unwarp(s, e[0]), e[1], e[2] || {}]);
    if (!s.noWipe && s.rstart > 0) ev.push([s.rstart - 0.28, 'swoosh', {}]);
  }
  SCHOOL.blocks.forEach((b, i) => ev.push([storyToReal(b.t), 'place', { n: i }]));
  SCHOOL.blocks.forEach((b, i) => { if (b.t0 != null && i % 3 === 0) ev.push([storyToReal(b.t0), 'throw', { n: i }]); });
  SCHOOL.windows.forEach((w, i) => { if (i > 0) ev.push([storyToReal(w.t), 'pop', { f: 420 + i * 30, n: i }]); });
  for (let i = 0; i < 10; i++) ev.push([storyToReal(SCHOOL.sign.t0 + i * SCHOOL.sign.dt), 'pop', { f: 520 + i * 25, v: 0.25, n: i }]);
  SCHOOL2.blocks.forEach((b, i) => { ev.push([storyToReal(b.t), 'place', { n: i }]); if (i % 3 === 0) ev.push([storyToReal(b.t0), 'throw', { n: i }]); });
  SCHOOL2.dome.forEach((d, i) => { ev.push([storyToReal(d.t), 'place', { n: i }]); ev.push([storyToReal(d.t) + 0.02, 'twinkle', {}]); });
  SCHOOL2.arches.forEach((a, i) => ev.push([storyToReal(a.t), 'pop', { f: 600 + i * 25, v: 0.22, n: i }]));
  return ev.sort((a, b) => a[0] - b[0]);
})();

function renderAt(R_) {
  R_ = clamp(R_, 0, DUR - 1e-4);
  AMB = R_;
  beginFrame();
  let i = SCENES.length - 1;
  while (i > 0 && R_ < SCENES[i].rstart) i--;
  const s = SCENES[i];
  for (const k in A) delete A[k];
  for (const k in TALK) delete TALK[k];
  const t = warp(s, R_ - s.rstart);
  for (const ln of s.lines || []) {
    if (ln.think || ln.silent) continue;
    const a = t - ln[0], e = typedEnd(ln) - t;
    if (a > 0 && e > -0.05) TALK[ln[2]] = clamp(Math.min(a / 0.1, (e + 0.05) / 0.12), 0, 1);
  }
  if (s.tod) TOD = lerp(s.tod[0], s.tod[1], clamp(t / s.dur, 0, 1));
  s.draw(t, s.start + t);
  const W = 0.32, next = SCENES[i + 1];
  if (next && !next.noWipe && R_ > next.rstart - W) blockWipe((R_ - (next.rstart - W)) / W, true, i === 0 ? '#D97757' : null);
  if (i > 0 && !s.noWipe && R_ < s.rstart + W) blockWipe((R_ - s.rstart) / W, false, i === 1 ? '#D97757' : null);
}
