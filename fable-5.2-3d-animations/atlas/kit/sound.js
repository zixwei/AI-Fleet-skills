// SOUND kit for the 3D Style Atlas. Classic script. All sound is synthesised with the Web Audio API.
(function () {
const SOUND = (window.SOUND = window.SOUND || {});
let shared = null;
SOUND.ctx = () => (shared = shared || new AudioContext());

const noiseBufs = new WeakMap();
const noiseBuf = ctx => {
  if (!noiseBufs.has(ctx)) {
    const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0);
    let s = 12345; // fixed seed: the same noise in live play and in the WAV
    for (let i = 0; i < d.length; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = s / 0x3fffffff - 1; }
    noiseBufs.set(ctx, b);
  }
  return noiseBufs.get(ctx);
};

// Building blocks. Each one returns the source so that stop() can reach it.
function env(ctx, when, a, d, peak, dest) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), when + a);
  g.gain.exponentialRampToValueAtTime(0.0001, when + a + d);
  g.connect(dest);
  return g;
}
function tone(c, type, f, when, a, d, peak, f2) {
  const o = c.ctx.createOscillator();
  o.type = type; o.frequency.setValueAtTime(f, when);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, when + a + d);
  o.connect(env(c.ctx, when, a, d, peak, c.out));
  o.start(when); o.stop(when + a + d + 0.05); c.track(o);
}
function noise(c, when, a, d, peak, ftype, f, q = 1, f2) {
  const s = c.ctx.createBufferSource(); s.buffer = noiseBuf(c.ctx); s.loop = true;
  const fl = c.ctx.createBiquadFilter(); fl.type = ftype; fl.frequency.setValueAtTime(f, when); fl.Q.value = q;
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, when + a + d);
  s.connect(fl); fl.connect(env(c.ctx, when, a, d, peak, c.out));
  s.start(when, (f * 0.37) % 1.5); s.stop(when + a + d + 0.05); c.track(s);
}

// Instruments: (c, when, p = pitch multiplier, g = gain, L = length multiplier)
const I = {
  tick: (c, w, p, g) => noise(c, w, 0.001, 0.025, g, 'highpass', 5000 * p, 2),
  click: (c, w, p, g) => { noise(c, w, 0.001, 0.02, g, 'bandpass', 2500 * p, 3); tone(c, 'square', 1800 * p, w, 0.001, 0.015, g * 0.2); },
  pop: (c, w, p, g) => tone(c, 'sine', 600 * p, w, 0.003, 0.09, g, 180 * p),
  thud: (c, w, p, g) => { tone(c, 'sine', 120 * p, w, 0.003, 0.25, g, 45 * p); noise(c, w, 0.002, 0.08, g * 0.4, 'lowpass', 500 * p); },
  whoosh: (c, w, p, g, L) => noise(c, w, 0.25 * L, 0.35 * L, g, 'bandpass', 300 * p, 0.8, 2400 * p),
  swish: (c, w, p, g, L) => noise(c, w, 0.05 * L, 0.18 * L, g, 'bandpass', 2500 * p, 1.2, 900 * p),
  chime: (c, w, p, g, L) => [1, 2.76, 5.4].forEach((h, i) => tone(c, 'sine', 880 * p * h, w, 0.004, 1.6 * L / (i + 1), g / (i + 1.5))),
  bell: (c, w, p, g, L) => [1, 2.0, 2.4, 3.0, 4.2].forEach((h, i) => tone(c, 'sine', 520 * p * h, w, 0.002, 2.2 * L / (i + 1), g / (i + 1.2))),
  pluck: (c, w, p, g, L) => { tone(c, 'triangle', 330 * p, w, 0.002, 0.5 * L, g); tone(c, 'sine', 660 * p, w, 0.002, 0.25 * L, g * 0.4); },
  blip: (c, w, p, g) => tone(c, 'square', 880 * p, w, 0.002, 0.06, g * 0.5, 1320 * p),
  sparkle: (c, w, p, g) => [0, 0.05, 0.11, 0.18].forEach((dt, i) => tone(c, 'sine', 1800 * p * (1 + i * 0.25), w + dt, 0.002, 0.25, g * 0.5)),
  riser: (c, w, p, g, L) => { noise(c, w, 1.2 * L, 0.1, g, 'bandpass', 400 * p, 2, 4000 * p); tone(c, 'sawtooth', 110 * p, w, 1.2 * L, 0.1, g * 0.15, 440 * p); },
  drop: (c, w, p, g) => tone(c, 'sine', 900 * p, w, 0.002, 0.12, g, 300 * p),
  rumble: (c, w, p, g, L) => { noise(c, w, 0.3 * L, 1.6 * L, g, 'lowpass', 160 * p, 1); tone(c, 'sine', 48 * p, w, 0.3 * L, 1.4 * L, g * 0.5); },
  paper: (c, w, p, g, L) => { noise(c, w, 0.01, 0.12 * L, g, 'highpass', 2200 * p, 0.7); noise(c, w + 0.05 * L, 0.01, 0.1 * L, g * 0.6, 'bandpass', 4000 * p, 1); },
  glass: (c, w, p, g) => [1, 2.32, 4.25].forEach((h, i) => tone(c, 'sine', 1400 * p * h, w, 0.001, 0.6 / (i + 1), g / (i + 1.3))),
  wood: (c, w, p, g) => { tone(c, 'triangle', 380 * p, w, 0.001, 0.08, g); noise(c, w, 0.001, 0.04, g * 0.5, 'bandpass', 900 * p, 4); },
  metal: (c, w, p, g) => [1, 1.47, 2.09, 2.56, 3.1].forEach((h, i) => tone(c, 'square', 310 * p * h, w, 0.001, 0.5 / (i + 1), g * 0.12)),
  splash: (c, w, p, g, L) => { noise(c, w, 0.01, 0.5 * L, g, 'lowpass', 3000 * p, 0.7, 400 * p); noise(c, w + 0.03, 0.02, 0.3 * L, g * 0.4, 'highpass', 4000 * p); },
  bubble: (c, w, p, g) => tone(c, 'sine', 400 * p, w, 0.005, 0.08, g, 1100 * p),
  zap: (c, w, p, g) => tone(c, 'sawtooth', 1600 * p, w, 0.002, 0.18, g * 0.4, 90 * p),
  hum: (c, w, p, g, L) => { tone(c, 'sawtooth', 60 * p, w, 0.1, 1.0 * L, g * 0.25); tone(c, 'sine', 120 * p, w, 0.1, 1.0 * L, g * 0.4); },
};
SOUND.instruments = Object.keys(I);

// Beds: looped ambience for the full duration.
const BEDS = {
  room: [['lowpass', 400, 0.7, 1]],
  wind: [['bandpass', 500, 0.6, 1, 0.13, 250]],
  water: [['bandpass', 900, 0.8, 0.8, 0.7, 300], ['highpass', 3000, 0.5, 0.25]],
  night: [['highpass', 4500, 3, 0.3, 4.5, 1500], ['lowpass', 300, 0.7, 0.5]],
  machine: [['lowpass', 220, 4, 1, 1.5, 40], ['bandpass', 1200, 6, 0.15]],
  space: [['lowpass', 120, 2, 1, 0.05, 60], ['bandpass', 2400, 12, 0.08, 0.07, 400]],
  crowd: [['bandpass', 700, 1.2, 1, 0.9, 200], ['bandpass', 1500, 1.5, 0.4, 1.3, 300]],
};
function bed(c, name, gain, when, until) {
  for (const [type, f, q, g, lfoHz, lfoDepth] of BEDS[name] || BEDS.room) {
    const ctx = c.ctx, s = ctx.createBufferSource(); s.buffer = noiseBuf(ctx); s.loop = true;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    const gn = ctx.createGain(); gn.gain.setValueAtTime(0.0001, when); gn.gain.linearRampToValueAtTime(gain * g, when + 0.6);
    if (until) { gn.gain.setValueAtTime(gain * g, Math.max(when + 0.6, until - 0.6)); gn.gain.linearRampToValueAtTime(0.0001, until); }
    s.connect(fl); fl.connect(gn); gn.connect(c.out);
    if (lfoHz) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = lfoHz; lg.gain.value = lfoDepth; l.connect(lg); lg.connect(fl.frequency); l.start(when); if (until) l.stop(until); c.track(l); }
    s.start(when); if (until) s.stop(until); c.track(s);
  }
}

function collect(scoreFn) {
  const ev = [], beds = [];
  scoreFn({
    play: (name, o = {}) => ev.push(Object.assign({ name }, o)),
    bed: (name, o = {}) => beds.push(Object.assign({ name }, o)),
    custom: (fn, o = {}) => ev.push(Object.assign({ fn }, o)),
  });
  return { ev, beds };
}

// One graph builder for live and offline. from = real time at ctx time t0.
function build(ctx, dest, scoreFn, o) {
  const { ev, beds } = collect(scoreFn);
  const map = o.map || (x => x), vo = !!o.voiceover, sources = [];
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -6; comp.knee.value = 3; comp.ratio.value = 20; comp.attack.value = 0.003; comp.release.value = 0.2;
  const master = ctx.createGain(); master.gain.value = 0.35;
  master.connect(comp); comp.connect(dest);
  if (o.tap) comp.connect(o.tap);
  const c = { ctx, out: master, track: n => sources.push(n) };
  const at = real => o.t0 + (real - o.from);
  for (const b of beds) bed(c, b.name, (b.gain ?? 0.15) * (vo ? 0.25 : 1), o.t0, o.until);
  for (const e of ev) {
    if (vo && e.music) continue; // music-like events are muted under a voiceover
    const real = map(e.t ?? 0);
    if (real < o.from - 0.001) continue;
    const when = at(real), g = (e.gain ?? 0.5) * (vo ? 0.5 : 1);
    let out = master;
    if (e.pan) { const p = ctx.createStereoPanner(); p.pan.value = e.pan; p.connect(master); out = p; }
    const cc = Object.assign({}, c, { out });
    if (e.fn) e.fn(ctx, out, when, g);
    else if (I[e.name]) I[e.name](cc, when, e.pitch ?? 1, g, e.dur ?? 1);
  }
  return { master, comp, sources };
}

// Live play from real time startT. Returns stop().
SOUND.live = (scoreFn, startT = 0, opts = {}) => {
  const ctx = SOUND.ctx();
  if (ctx.state !== 'running') ctx.resume();
  const g = build(ctx, ctx.destination, scoreFn, Object.assign({}, opts, { from: startT, t0: ctx.currentTime + 0.03 }));
  return () => {
    g.master.disconnect(); g.comp.disconnect();
    g.sources.forEach(s => { try { s.stop(); } catch (e) { /* not started */ } });
  };
};

SOUND.renderOffline = (scoreFn, duration, sampleRate = 48000, opts = {}) => {
  const ctx = new OfflineAudioContext(2, Math.ceil(duration * sampleRate), sampleRate);
  build(ctx, ctx.destination, scoreFn, Object.assign({}, opts, { from: 0, t0: 0, until: duration }));
  return ctx.startRendering();
};

SOUND.toWav = buf => {
  const ch = buf.numberOfChannels, n = buf.length, sr = buf.sampleRate, out = new DataView(new ArrayBuffer(44 + n * ch * 2));
  const str = (o, s) => [...s].forEach((x, i) => out.setUint8(o + i, x.charCodeAt(0)));
  str(0, 'RIFF'); out.setUint32(4, 36 + n * ch * 2, true); str(8, 'WAVEfmt ');
  out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true); out.setUint32(24, sr, true);
  out.setUint32(28, sr * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true);
  str(36, 'data'); out.setUint32(40, n * ch * 2, true);
  const data = [...Array(ch)].map((_, c) => buf.getChannelData(c));
  for (let i = 0, o = 44; i < n; i++) for (let c = 0; c < ch; c++, o += 2) out.setInt16(o, Math.max(-1, Math.min(1, data[c][i])) * 0x7fff, true);
  return new Blob([out], { type: 'audio/wav' });
};
})();
