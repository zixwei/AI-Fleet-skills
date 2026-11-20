// Self-check, no dependencies:  node atlas/tools/test.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const { parseSRT, buildPrompt } = createRequire(import.meta.url)(path.join(ROOT, 'kit/prompt.js'));
let pass = 0, fail = 0;
const ok = (cond, name, extra = '') => { if (cond) pass++; else { fail++; console.log('FAIL', name, extra); } };
const throws = fn => { try { fn(); return false; } catch (e) { return e; } };
const near = (a, b, e = 1e-6) => Math.abs(a - b) < e;
const load = (file, ctx) => { vm.runInContext(read(file), ctx, { filename: file }); return ctx; };
const sandbox = () => { const c = vm.createContext({ console }); c.window = c; return c; };

// ---- parseSRT
const srt = '1\n00:00:00,000 --> 00:00:02,500\nHello there\n\n2\n00:00:02,500 --> 00:00:05,120\nSecond line\ntwo rows\n\n\n';
let c = parseSRT(srt);
ok(c.length === 2 && c[1].start === 2.5 && near(c[1].end, 5.12) && c[1].text === 'Second line two rows', 'srt normal', JSON.stringify(c));
c = parseSRT(srt.replace(/,/g, '.'));
ok(c.length === 2 && near(c[1].end, 5.12), 'srt dot ms');
c = parseSRT(srt.replace(/\n/g, '\r\n'));
ok(c.length === 2 && c[0].text === 'Hello there', 'srt CRLF');
c = parseSRT('00:00:01,000 --> 00:00:02,000\nA\n\n00:00:03,000 --> 00:00:04,000\nB\n');
ok(c.length === 2 && c[1].start === 3, 'srt no index');
const e = throws(() => parseSRT('1\n00:00:01,000 --> 00:00:02,000\nA\n\n2\n00:0x:03 --> 00:00:04,000\nB\n'));
ok(e && /line 6/.test(e.message), 'srt bad timestamp throws with line number', e && e.message);

// ---- makeWarp (lives in kit/stage.js as K.makeWarp, so the pasted prompt has it)
const { K } = load('kit/stage.js', sandbox());
ok(K.THREE_VERSION === '0.187.0', 'three version');
let w = K.makeWarp([0, 2.5, 5, 7.5], 10, null);
ok(w.toCanonical(3.3) === 3.3 && w.toReal(3.3) === 3.3 && w.duration === 10, 'warp identity');
const beats = [0, 2.5, 5, 7.5];
const cues = [{ start: 0.2, end: 3 }, { start: 3.4, end: 8 }, { start: 8.2, end: 9 }, { start: 11, end: 14 }];
w = K.makeWarp(beats, 10, cues);
ok(w.toCanonical(0) === 0, 'warp beat 0 at real 0');
for (let i = 1; i < 4; i++) ok(near(w.toCanonical(cues[i].start), beats[i]), `warp cue ${i} -> beat ${i}`);
ok(w.duration === 15, 'warp duration');
let mono = true, inv = true, prev = -1;
for (let k = 0; k <= 50; k++) {
  const x = (k / 50) * w.duration, y = w.toCanonical(x);
  if (k && y <= prev) mono = false; prev = y;
  if (!near(w.toReal(y), x, 1e-9)) inv = false;
}
ok(mono, 'warp strictly increasing'); ok(inv, 'warp toReal(toCanonical(x)) = x');
w = K.makeWarp([0, 2, 4, 6, 8], 10, [{ start: 0, end: 3 }, { start: 4, end: 9 }]); // 5 beats, 2 cues: equal real anchors
prev = -1; mono = true;
for (let k = 0; k <= 50; k++) { const y = w.toCanonical((k / 50) * w.duration); if (k && y <= prev) mono = false; prev = y; }
ok(mono, 'warp strictly increasing with shared cues');

// ---- manifest and style files
const man = load('styles/manifest.js', sandbox()).STYLE_LIST;
ok(man.length === 100, 'manifest has 100 entries', man.length);
ok(new Set(man.map(s => s.id)).size === 100, 'manifest ids unique');
const want = { 'Crafted materials': 8, 'Flat content made physical': 9, 'Machines that explain': 6, 'Diagrams with depth': 7, 'Small worlds': 7,
  'Filters over 3D': 9, 'Products and screens': 3, 'Living and elemental': 9, 'Light and optics': 9, 'Earth, weather and sky': 8,
  'Stage and play': 8, 'Kitchen and home': 7, 'Strange worlds': 10 };
const got = {}; man.forEach(s => (got[s.family] = (got[s.family] || 0) + 1));
for (const f in want) ok(got[f] === want[f], `family count ${f}`, `${got[f]} != ${want[f]}`);
ok(Object.keys(got).length === 13, '13 families');
const REQ = ['id', 'name', 'family', 'use', 'look', 'motion', 'shownHere', 'goodFor', 'fonts', 'duration', 'samples', 'beats', 'build', 'sound'];
const built = [];
for (const m of man) {
  if (!fs.existsSync(path.join(ROOT, 'styles', m.file))) continue;
  built.push(m.id);
  const src = read('styles/' + m.file);
  ok(src.includes(`STYLES['${m.id}']`), `${m.id}: has STYLES['${m.id}']`);
  ok(!/Math\.random|Date\.|setTimeout|setInterval/.test(src), `${m.id}: no Math.random, Date or timers`);
  ok(!src.includes('</script'), `${m.id}: no literal </script>`);
  const st = load('styles/' + m.file, sandbox()).STYLES[m.id];
  for (const k of REQ) ok(st && st[k] !== undefined, `${m.id}: field ${k}`);
  for (const k of ['name', 'family', 'use', 'look']) ok(st[k] === m[k], `${m.id}: manifest ${k} agrees`, `\n  style:    ${st[k]}\n  manifest: ${m[k]}`);
  ok(st.beats.length >= 3 && st.beats.length <= 5, `${m.id}: 3 to 5 beats`);
  ok(st.duration >= 8 && st.duration <= 12, `${m.id}: 8 to 12 s`);
  ok(st.beats.every((b, i) => i === 0 || b.t > st.beats[i - 1].t) && st.beats[st.beats.length - 1].t < st.duration, `${m.id}: beats increase`);
}
ok(!read('kit/stage.js').includes('</script') && !read('kit/sound.js').includes('</script'), 'kits: no literal </script>');

// ---- art styles (atlas/art): manifest, and the files that exist
const artList = load('art/manifest.js', sandbox()).ART_LIST;
ok(artList.length === 100 && new Set(artList.map(a => a.id)).size === 100, 'art manifest: 100 unique ids', artList.length);
let artBuilt = 0;
for (const m of artList) {
  if (!fs.existsSync(path.join(ROOT, 'art', m.id + '.js'))) continue;
  artBuilt++;
  const src = read('art/' + m.id + '.js');
  ok(!/Math\.random|Date\.|setTimeout|setInterval/.test(src), `art ${m.id}: no Math.random, Date or timers`);
  ok(!src.includes('</script') && !/^\s*(import|export)\b/m.test(src), `art ${m.id}: classic script`);
  const a = load('art/' + m.id + '.js', sandbox()).ARTS?.[m.id];
  ok(a && a.id === m.id && a.name === m.name && a.group === m.group && a.inputs === m.inputs, `art ${m.id}: id, name, group, inputs agree with the manifest`);
  ok(a && a.post && typeof a.post.fragment === 'string' && a.post.fragment.includes('postFX'), `art ${m.id}: post.fragment defines postFX`);
}

// ---- buildPrompt
const style = load('styles/' + man.find(m => built.includes(m.id)).file, sandbox()).STYLES[built[0]];
const sources = { stage: read('kit/stage.js'), sound: read('kit/sound.js'), style: read('styles/' + style.id + '.js') };
const p0 = buildPrompt(style, { topic: 'How tides work' }, sources);
ok(p0.includes('How tides work') && p0.includes(sources.stage) && p0.includes(sources.sound) && p0.includes(sources.style), 'prompt has topic and 3 sources');
ok(!p0.includes('MY VOICEOVER TIMING') && !p0.includes('STORYBOARD FIRST'), 'prompt: no voiceover or storyboard sections by default');
ok(buildPrompt(style, {}, sources).includes('[Type your topic here]'), 'prompt: empty topic placeholder');
const p1 = buildPrompt(style, { topic: 'x', voiceover: true, srt: '1\n00:00:00,000 --> 00:00:01,000\nHi', storyboard: true }, sources);
ok(p1.includes('MY VOICEOVER TIMING') && p1.includes('00:00:01,000') && p1.includes('STORYBOARD FIRST') && p1.includes('voiceover: true'), 'prompt: voiceover and storyboard sections when set');
ok(buildPrompt(style, { voiceover: true }, sources).includes('Ask me for the SRT'), 'prompt: voiceover without SRT asks');
let maxLen = 0, maxId = '';
for (const id of built) {
  const st = load('styles/' + id + '.js', sandbox()).STYLES[id];
  const len = buildPrompt(st, { topic: 'x', voiceover: true, srt: '', storyboard: true }, { ...sources, style: read('styles/' + id + '.js') }).length;
  if (len > maxLen) { maxLen = len; maxId = id; }
}
ok(maxLen < 120000, 'largest prompt below 120,000 characters', maxLen);

console.log(`\n${pass} passed, ${fail} failed`);
console.log(`art style files built: ${artBuilt} of ${artList.length}`);
console.log(`style files built: ${built.length} of ${man.length} (${built.join(', ')})`);
console.log(`largest prompt: ${maxLen} characters (${maxId}), about ${Math.round(maxLen / 4)} tokens`);
console.log(`kit lines: stage.js ${read('kit/stage.js').split('\n').length}, sound.js ${read('kit/sound.js').split('\n').length}`);
process.exit(fail ? 1 : 0);
