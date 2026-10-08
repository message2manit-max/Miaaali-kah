/* ---- sound effects, synthesized with Web Audio (works live and offline for the video) ---- */
const noiseCache = new WeakMap();
function noise(ac) {
  let b = noiseCache.get(ac);
  if (!b) {
    b = ac.createBuffer(1, ac.sampleRate * 1, ac.sampleRate);
    const d = b.getChannelData(0);
    let s = 7;
    for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; }
    noiseCache.set(ac, b);
  }
  return b;
}
function tone(ac, out, when, o) {
  const osc = ac.createOscillator(); osc.type = o.type || 'square';
  osc.frequency.setValueAtTime(o.f, when);
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, when + (o.glide || o.d));
  if (o.vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = o.vib[0]; lg.gain.value = o.vib[1]; l.connect(lg).connect(osc.frequency); l.start(when); l.stop(when + o.d + 0.05); }
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(o.v, when + (o.a || 0.005));
  g.gain.exponentialRampToValueAtTime(0.0001, when + o.d);
  osc.connect(g).connect(out);
  osc.start(when); osc.stop(when + o.d + 0.05);
}
function hiss(ac, out, when, o) {
  const src = ac.createBufferSource(); src.buffer = noise(ac);
  src.playbackRate.value = o.rate || 1;
  const flt = ac.createBiquadFilter(); flt.type = o.ft || 'bandpass'; flt.Q.value = o.q || 1;
  flt.frequency.setValueAtTime(o.f, when);
  if (o.sweep) o.sweep.forEach(([dt, f]) => flt.frequency.exponentialRampToValueAtTime(f, when + dt));
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(o.v, when + (o.a || 0.004));
  g.gain.exponentialRampToValueAtTime(0.0001, when + o.d);
  src.loop = true;
  src.connect(flt).connect(g).connect(out);
  src.start(when, (o.off || 0) % 0.9); src.stop(when + o.d + 0.05);
}
const VOICES = {
  opus: { type: 'square', base: [150, 170, 190, 210, 180], d: 0.07, v: 0.065 },
  sonnet: { type: 'square', base: [300, 340, 380, 420, 360], d: 0.055, v: 0.06 },
  haiku: { type: 'square', base: [620, 700, 780, 860, 740], d: 0.035, v: 0.05 },
  kid: { type: 'triangle', base: [900, 1000, 1100, 1250], d: 0.05, v: 0.2 },
};
function sfx(ac, out, when, name, o = {}) {
  const n = o.n || 0;
  switch (name) {
    case 'blip': {
      const vc = VOICES[o.voice] || VOICES.opus;
      const f = vc.base[n % vc.base.length] * (1 + (rnd(n + 3) - 0.5) * 0.08);
      tone(ac, out, when, { type: vc.type, f, d: vc.d, v: vc.v, a: 0.004 });
      break;
    }
    case 'step': hiss(ac, out, when, { ft: 'lowpass', f: 260, q: 0.7, v: 0.35, d: 0.07, off: n * 0.13 }); break;
    case 'whoosh': hiss(ac, out, when, { f: 400, q: 1.6, v: 0.45, a: 0.08, d: 0.42, sweep: [[0.16, 2600], [0.4, 700]], off: n * 0.21 }); break;
    case 'skid':
      hiss(ac, out, when, { ft: 'highpass', f: 1800, v: 0.18, d: 0.22 });
      tone(ac, out, when, { type: 'sawtooth', f: 420, f2: 150, d: 0.22, v: 0.05 });
      break;
    case 'pop': {
      const f = (o.f || 190) * (1 + (rnd(n + 11) - 0.5) * 0.3);
      tone(ac, out, when, { type: 'sine', f, f2: f * 0.5, d: 0.09, v: o.v || 0.35 });
      hiss(ac, out, when, { ft: 'lowpass', f: 1400, v: (o.v || 0.35) * 0.5, d: 0.05, off: n * 0.07 });
      break;
    }
    case 'place': { // a crisp block snap
      const f = 520 + (n % 5) * 60;
      tone(ac, out, when, { type: 'square', f, f2: f * 0.6, d: 0.05, v: 0.05 });
      hiss(ac, out, when, { ft: 'bandpass', f: 900, q: 2, v: 0.22, d: 0.05, off: n * 0.05 });
      break;
    }
    case 'thud':
      tone(ac, out, when, { type: 'sine', f: 120, f2: 45, d: 0.25, v: 0.6 });
      hiss(ac, out, when, { ft: 'lowpass', f: 500, v: 0.35, d: 0.12 });
      break;
    case 'bonk':
      tone(ac, out, when, { type: 'sine', f: 820, d: 0.09, v: 0.45 });
      tone(ac, out, when + 0.01, { type: 'square', f: 600, f2: 160, d: 0.28, v: 0.08 });
      tone(ac, out, when + 0.05, { type: 'sine', f: 330, d: 0.45, v: 0.25, vib: [18, 40] });
      break;
    case 'clang':
      [523, 1061, 1583, 2391, 3150].forEach((f, i) => tone(ac, out, when, { type: 'sine', f, d: 1.1 - i * 0.15, v: 0.22 / (i + 1) }));
      hiss(ac, out, when, { ft: 'highpass', f: 3000, v: 0.25, d: 0.06 });
      break;
    case 'hammer':
      hiss(ac, out, when, { ft: 'highpass', f: 1500, v: 0.28, d: 0.04, off: n * 0.11 });
      tone(ac, out, when, { type: 'triangle', f: 1350, d: 0.07, v: 0.2 });
      break;
    case 'bubble': tone(ac, out, when, { type: 'sine', f: 170 + (n % 3) * 40, f2: 560, glide: 0.07, d: 0.09, v: 0.22 }); break;
    case 'sprinkle':
      for (let i = 0; i < 9; i++) hiss(ac, out, when + i * 0.045 + rnd(i) * 0.02, { ft: 'highpass', f: 4200, v: 0.12, d: 0.025, off: i * 0.1 });
      break;
    case 'ding':
      tone(ac, out, when, { type: 'sine', f: 1568, d: 1.0, v: 0.28 });
      tone(ac, out, when, { type: 'sine', f: 3136, d: 0.6, v: 0.08 });
      break;
    case 'twinkle':
      [2093, 2637, 3136].forEach((f, i) => tone(ac, out, when + i * 0.06, { type: 'sine', f, d: 0.25, v: 0.09 }));
      break;
    case 'bell': {
      const f = o.f || 660;
      [[1, 0.3], [2.0, 0.14], [2.4, 0.11], [3.0, 0.08], [4.2, 0.05]].forEach(([m, v]) => tone(ac, out, when, { type: 'sine', f: f * m, d: 1.8 / Math.sqrt(m), v }));
      hiss(ac, out, when, { ft: 'highpass', f: 2500, v: 0.08, d: 0.03 });
      break;
    }
    case 'scratch':
      hiss(ac, out, when, { f: 500, q: 3, v: 0.6, a: 0.02, d: 0.55, sweep: [[0.08, 3200], [0.18, 700], [0.3, 2800], [0.5, 300]] });
      tone(ac, out, when, { type: 'sawtooth', f: 300, f2: 90, d: 0.5, v: 0.05 });
      break;
    case 'cricket':
      for (let k = 0; k < 3; k++) tone(ac, out, when + k * 0.075, { type: 'sine', f: 4400, d: 0.05, v: 0.06, vib: [60, 300] });
      break;
    case 'shutter':
      hiss(ac, out, when, { ft: 'highpass', f: 2200, v: 0.4, d: 0.03 });
      hiss(ac, out, when + 0.07, { ft: 'highpass', f: 1600, v: 0.35, d: 0.05, off: 0.3 });
      tone(ac, out, when, { type: 'square', f: 2400, d: 0.02, v: 0.04 });
      break;
    case 'tada':
      [[523, 0], [659, 0.09], [784, 0.18], [1047, 0.27]].forEach(([f, dt], i) => tone(ac, out, when + dt, { type: 'square', f, d: i === 3 ? 0.6 : 0.12, v: 0.06 }));
      [[523, 0.27], [659, 0.27]].forEach(([f, dt]) => tone(ac, out, when + dt, { type: 'triangle', f, d: 0.6, v: 0.12 }));
      break;
    case 'horn': tone(ac, out, when, { type: 'sawtooth', f: 330, f2: 470, glide: 0.25, d: 0.55, v: 0.06, vib: [11, 12] }); break;
    case 'buzz': tone(ac, out, when, { type: 'sawtooth', f: 190, d: o.d || 0.4, v: 0.04, vib: [28, 35] }); break;
    case 'squeak': tone(ac, out, when, { type: 'sine', f: 1700, f2: 2300, d: 0.12, v: 0.08, vib: [30, 120] }); break;
    case 'swoosh': hiss(ac, out, when, { f: 900, q: 1.2, v: 0.3, a: 0.05, d: 0.3, sweep: [[0.25, 2200]] }); break;
    case 'tick': hiss(ac, out, when, { ft: 'highpass', f: 3500, v: 0.18, d: 0.02 }); break;
    case 'throw': hiss(ac, out, when, { f: 700, q: 1.4, v: 0.12, a: 0.03, d: 0.18, sweep: [[0.15, 1800]], off: n * 0.09 }); break;
    case 'toast':
      tone(ac, out, when, { type: 'square', f: 988, d: 0.12, v: 0.05 });
      tone(ac, out, when + 0.1, { type: 'square', f: 1319, d: 0.35, v: 0.05 });
      tone(ac, out, when + 0.1, { type: 'sine', f: 2637, d: 0.4, v: 0.05 });
      break;
    case 'xp': for (let i = 0; i < 7; i++) tone(ac, out, when + i * 0.11 + rnd(i) * 0.03, { type: 'sine', f: 1400 + i * 160 + rnd(i + 4) * 200, d: 0.12, v: 0.06 }); break;
    case 'think': tone(ac, out, when, { type: 'sine', f: n % 2 ? 660 : 880, d: 0.12, v: 0.06 }); break;
    case 'check': tone(ac, out, when, { type: 'square', f: 1320, d: 0.04, v: 0.05 }); tone(ac, out, when + 0.04, { type: 'square', f: 1760, d: 0.05, v: 0.05 }); break;
    case 'clap': hiss(ac, out, when, { f: 1400, q: 1.2, v: 0.5, d: 0.08, off: n * 0.17 }); break;
    case 'boing': tone(ac, out, when, { type: 'sine', f: 200, f2: 560, glide: 0.12, d: 0.2, v: 0.25, vib: [22, 25] }); break;
    case 'fall': tone(ac, out, when, { type: 'sine', f: 1500, f2: 260, glide: 0.5, d: 0.55, v: 0.14 }); break;
    case 'tweet': [0, 0.09].forEach(dt => tone(ac, out, when + dt, { type: 'sine', f: 3200, f2: 3900, glide: 0.05, d: 0.07, v: 0.07 })); break;
    case 'flap': for (let i = 0; i < 4; i++) hiss(ac, out, when + i * 0.06, { f: 700, q: 1, v: 0.12, d: 0.04, off: i * 0.2 }); break;
    case 'clatter': for (let i = 0; i < 6; i++) { if (i % 2) hiss(ac, out, when + i * 0.09, { f: 1200 + i * 200, q: 2, v: 0.25, d: 0.05, off: i * 0.13 }); else tone(ac, out, when + i * 0.09, { type: 'square', f: 300 + rnd(i + n) * 500, f2: 120, d: 0.08, v: 0.06 }); } break;
    case 'stamp':
      tone(ac, out, when, { type: 'sine', f: 140, f2: 50, d: 0.3, v: 0.7 });
      hiss(ac, out, when, { f: 1800, q: 0.8, v: 0.35, d: 0.12 });
      break;
    case 'pageflip': hiss(ac, out, when, { f: 2500, q: 0.7, v: 0.18, a: 0.02, d: 0.16, sweep: [[0.14, 5000]] }); break;
  }
}
// talk blips, block snaps and footsteps derived from the script
function scriptSfx(scene) {
  const ev = [];
  for (const ln of scene.lines || []) {
    const [t0, t1, who, str] = ln;
    if (ln.silent) continue;
    const cps = lineCps(ln);
    const voice = who === 'opus' ? 'opus' : who === 'sonnet' ? 'sonnet' : who[0] === 'k' ? 'kid' : 'haiku';
    const every = voice === 'haiku' ? 2 : 2;
    let k = 0;
    const flat = str.replace(/\s+/g, ' ');
    for (let i = 0; i < flat.length; i++) {
      const tt = t0 + 0.1 + i / cps;
      if (tt >= t1 - 0.1) break;
      if (/[A-Z0-9]/.test(flat[i]) && (i % every === 0)) ev.push([tt, 'blip', { voice, n: k++ + i }]);
    }
  }
  return ev;
}
