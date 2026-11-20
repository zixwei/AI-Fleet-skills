// Art-style check tool, no dependencies.
//   node atlas/tools/art.mjs <artId|none> --scenes a,b [--times 0,mid,end,b1+0.2,4.5] [--q] [--full] [--fps]
//                            [--ref save|cmp] [--out dir]
// It starts its own static server (this process) and its own headless Chrome (GPU on), and kills only the Chrome PID it started.
// Writes atlas/art-out/<out>/<art>__<scene>.jpg (contact sheet) and, with --full, one full-size JPEG per time.
// Reports: console errors, determinism (same frame twice), one-frame render time, live frames per second (--fps).
// --crop x,y,w,h cuts the --full frames to a box. --ref save|cmp: save / compare lossless frames (use it with `none` to prove that the kit still renders old styles the same).
// Env ART_EVAL: a JS expression evaluated in the page after the checks (for example `__A.same(1.01, 1.05)`).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ATLAS = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const art = args.find((a, i) => !a.startsWith('--') && !(args[i - 1] || '').startsWith('--')) || 'none';
const scenes = String(opt('scenes', 'tiny-diorama')).split(',');
const timeTokens = String(opt('times', '0,mid,end')).split(',');
const crop = opt('crop', null) ? String(opt('crop')).split(',').map(Number) : null; // --crop x,y,w,h: full frames cut to this box (pixels of 1920x1080)
const quality = !!opt('q', false), full = !!opt('full', false), wantFps = !!opt('fps', false), ref = opt('ref', null);
const outDir = path.join(ATLAS, 'art-out', String(opt('out', 'sheets')));
fs.mkdirSync(outDir, { recursive: true });

// ---- static server (this process; no extra PID)
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  if (req.url === '/favicon.ico') { res.writeHead(204); return res.end(); }
  const p = path.join(ATLAS, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ATLAS) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(ok => server.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${server.address().port}`;

// ---- Chrome (found by checking the standard install folders; set CHROME to override)
const chromePath = [process.env.CHROME, ...['ProgramFiles', 'ProgramFiles(x86)', 'LOCALAPPDATA'].map(e => process.env[e] && path.join(process.env[e], 'Google/Chrome/Application/chrome.exe'))]
  .filter(Boolean).find(p => fs.existsSync(p));
if (!chromePath) { console.error('Chrome not found. Set the CHROME environment variable.'); process.exit(2); }
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'art-chrome-'));
const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--window-size=1920,1080', '--no-first-run',
  '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
const chromePid = chrome.pid;
const stop = () => { try { process.kill(chromePid); } catch {} server.close(); try { fs.rmSync(profile, { recursive: true, force: true }); } catch {} };
process.on('exit', stop); process.on('SIGINT', () => process.exit(130));

const sleep = ms => new Promise(r => setTimeout(r, ms));
let port = 0;
for (let i = 0; i < 100 && !port; i++) { try { port = +fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]; } catch { await sleep(100); } }
if (!port) { console.error('Chrome did not start.'); process.exit(2); }
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = no; });
let nextId = 1; const waiting = new Map(); let errors = [];
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && waiting.has(m.id)) { const { ok, no } = waiting.get(m.id); waiting.delete(m.id); m.error ? no(new Error(m.error.message)) : ok(m.result); return; }
  if (m.method === 'Runtime.exceptionThrown') errors.push('exception: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 600));
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console.error: ' + m.params.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 600));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push('log: ' + m.params.entry.text.slice(0, 200) + ' ' + (m.params.entry.url || ''));
};
const send = (method, params = {}) => new Promise((ok, no) => { const id = nextId++; waiting.set(id, { ok, no }); ws.send(JSON.stringify({ id, method, params })); });
const ev = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');

const open = async (url, ready) => {
  errors = [];
  await send('Page.navigate', { url });
  for (let i = 0; i < 400; i++) {
    await sleep(150);
    const st = await ev(`JSON.stringify({ ready: ${ready}, err: (document.getElementById('msg') || {}).className === 'err' ? document.getElementById('msg').textContent : '' })`).catch(() => '{}');
    const s = JSON.parse(st || '{}');
    if (s.err) throw new Error('page message: ' + s.err);
    if (s.ready) return;
  }
  throw new Error('timeout waiting for the page');
};
const PAGE_JS = `(() => {
  const c = document.getElementById('c');
  const px = () => { const g = document.createElement('canvas'); g.width = c.width; g.height = c.height; const x = g.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0); return x.getImageData(0, 0, g.width, g.height).data; };
  const diff = (a, b, tol) => { let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) > tol || Math.abs(a[i + 1] - b[i + 1]) > tol || Math.abs(a[i + 2] - b[i + 2]) > tol) n++; return n; };
  const sync = () => { const gl = S.renderer.getContext(), b = new Uint8Array(4); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, b); };
  window.__A = {
    info: () => { const gl = S.renderer.getContext(), e = gl.getExtension('WEBGL_debug_renderer_info'); return { D: S.duration, beats: S.beats.map(b => b.t), gpu: e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'unknown' }; },
    sheet: (ts, labels) => { const cols = Math.min(ts.length, 3), rows = Math.ceil(ts.length / cols), w = 640, h = 360, cap = 22;
      const sh = document.createElement('canvas'); sh.width = cols * w; sh.height = rows * (h + cap); const x = sh.getContext('2d'); x.fillStyle = '#111'; x.fillRect(0, 0, sh.width, sh.height);
      x.font = '16px monospace'; x.fillStyle = '#ddd';
      ts.forEach((t, i) => { seek(t); const cx = (i % cols) * w, cy = Math.floor(i / cols) * (h + cap); x.drawImage(c, cx, cy + cap, w, h); x.fillText(labels[i], cx + 6, cy + 16); });
      return sh.toDataURL('image/jpeg', 0.88); },
    frame: (t, crop) => { seek(t); if (!crop) return c.toDataURL('image/jpeg', 0.92); const g = document.createElement('canvas'); g.width = crop[2]; g.height = crop[3]; g.getContext('2d').drawImage(c, crop[0], crop[1], crop[2], crop[3], 0, 0, crop[2], crop[3]); return g.toDataURL('image/jpeg', 0.92); },
    png: t => { seek(t); return c.toDataURL('image/png'); },
    det: (t, other) => { seek(t); const a = px(); seek(other); seek(t); const b = px(); return { over6: diff(a, b, 6), exact: diff(a, b, 0) }; },
    ms: t => { for (let i = 0; i < 3; i++) { seek(t + i * 0.01); sync(); } const t0 = performance.now(); const N = 10; for (let i = 0; i < N; i++) { seek(t + i * 0.01); sync(); } return (performance.now() - t0) / N; },
    cmp: (t, dataUrl) => new Promise(ok => { const im = new Image(); im.onload = () => { seek(t); const g = document.createElement('canvas'); g.width = c.width; g.height = c.height; const x = g.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0); const A = px(), B = x.getImageData(0, 0, g.width, g.height).data; ok({ exact: diff(A, B, 0), over6: diff(A, B, 6) }); }; im.src = dataUrl; }),
    same: (t1, t2) => { seek(t1); const a = px(); seek(t2); const b = px(); return diff(a, b, 0); },
  };
  return true; })()`;
const qs = (scene, extra) => `${base}/player.html?style=${scene}${art !== 'none' ? '&art=' + art : ''}${extra}`;
const resolve = (tok, info) => {
  const m = /^b(\d+)([+-][\d.]+)?$/.exec(tok);
  if (m) return (info.beats[+m[1]] ?? 0) + (m[2] ? +m[2] : 0);
  if (tok === 'mid') return info.D / 2;
  if (tok === 'end') return info.D - 0.5;
  return +tok;
};
const fmt = x => (Math.round(x * 100) / 100).toString();

let gpuPrinted = false, failed = false;
for (const scene of scenes) {
  const tag = `${art} on ${scene}`;
  try {
    await open(qs(scene, `&t=0&still=1&samples=${quality ? 8 : 1}`), `document.title === 'ready'`);
    await ev(PAGE_JS);
    const info = await ev('__A.info()');
    if (!gpuPrinted) { console.log('GPU renderer:', info.gpu); gpuPrinted = true; }
    const ts = timeTokens.map(tok => resolve(tok, info)).map(t => Math.max(0, Math.min(t, info.D)));
    const labels = ts.map((t, i) => `t=${fmt(t)} (${timeTokens[i]})`);
    const file = path.join(outDir, `${art}__${scene}.jpg`);
    fs.writeFileSync(file, Buffer.from((await ev(`__A.sheet(${JSON.stringify(ts)}, ${JSON.stringify(labels)})`)).split(',')[1], 'base64'));
    console.log(`[${tag}] sheet: ${file}`);
    if (full) for (let i = 0; i < ts.length; i++) {
      const f = path.join(outDir, `${art}__${scene}__t${fmt(ts[i])}.jpg`);
      fs.writeFileSync(f, Buffer.from((await ev(`__A.frame(${ts[i]}, ${JSON.stringify(crop)})`)).split(',')[1], 'base64'));
      console.log(`[${tag}] full frame: ${f}`);
    }
    const mid = info.D / 2;
    const d = await ev(`__A.det(${ts[0]}, ${mid})`);
    console.log(`[${tag}] determinism: ${d.over6} px differ by more than 6 levels, ${d.exact} px not identical (same frame twice, another frame between)`);
    if (d.over6 > 0) failed = true;
    console.log(`[${tag}] one frame: ${(await ev(`__A.ms(${mid})`)).toFixed(1)} ms (samples=${quality ? 8 : 1}, seek + GL finish)`);
    if (ref) {
      const rf = path.join(ATLAS, 'art-out', 'ref'); fs.mkdirSync(rf, { recursive: true });
      for (const t of ts) {
        const f = path.join(rf, `${art}__${scene}__${quality ? 'q' : 's'}__t${fmt(t)}.png`);
        if (ref === 'save') { fs.writeFileSync(f, Buffer.from((await ev(`__A.png(${t})`)).split(',')[1], 'base64')); console.log(`[${tag}] ref saved ${path.basename(f)}`); }
        else { const n = await ev(`__A.cmp(${t}, ${JSON.stringify('data:image/png;base64,' + fs.readFileSync(f).toString('base64'))})`); console.log(`[${tag}] ref compare t=${fmt(t)}: ${n.exact} px not identical, ${n.over6} px differ by more than 6 levels`); if (n.over6) failed = true; }
      }
    }
    if (errors.length) { failed = true; console.log(`[${tag}] ERRORS (${errors.length}):\n  ` + [...new Set(errors)].join('\n  ')); } else console.log(`[${tag}] console errors: 0`);
    if (process.env.ART_EVAL) console.log(`[${tag}] eval:`, await ev(process.env.ART_EVAL));
    if (wantFps) {
      await open(qs(scene, '&t=0'), `typeof window.S !== 'undefined' && !!window.seek`);
      const fps = await ev(`new Promise(r => { document.getElementById('snd').checked = false; document.getElementById('play').click(); let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 4000) requestAnimationFrame(f); else r(n * 1000 / (performance.now() - t0)); }; requestAnimationFrame(f); })`);
      console.log(`[${tag}] live play (player, rAF, 1920x1080, samples=1): ${fps.toFixed(1)} frames per second`);
    }
  } catch (e) { failed = true; console.log(`[${tag}] FAILED: ${e.message}`); }
}
console.log(`chrome PID ${chromePid} stopped by PID only`);
stop();
process.exit(failed ? 1 : 0);
