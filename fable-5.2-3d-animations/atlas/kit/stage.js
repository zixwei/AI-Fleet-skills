// STAGE kit for the 3D Style Atlas. Classic script. Needs window.THREE only when K.run or a helper is called.
(function () {
const K = (window.K = window.K || {});
K.THREE_VERSION = '0.187.0';

// ---------- numbers ----------
K.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
K.lerp = (a, b, p) => a + (b - a) * p;
K.ease = {
  linear: p => p,
  inOut: p => p * p * (3 - 2 * p),
  out: p => 1 - (1 - p) ** 3,
  in: p => p ** 3,
  back: p => { const c = 1.70158; return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2; },
  elastic: p => p <= 0 ? 0 : p >= 1 ? 1 : 2 ** (-10 * p) * Math.sin((p * 10 - 0.75) * 2.0944) + 1,
  bounce: p => {
    const n = 7.5625, d = 2.75;
    if (p < 1 / d) return n * p * p;
    if (p < 2 / d) return n * (p -= 1.5 / d) * p + 0.75;
    if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + 0.9375;
    return n * (p -= 2.625 / d) * p + 0.984375;
  },
};
// Clamped progress of t between t0 and t1, with an optional ease (function or name).
K.prog = (t, t0, t1, ease) => {
  const p = K.clamp((t - t0) / (t1 - t0));
  const e = typeof ease === 'string' ? K.ease[ease] : ease;
  return e ? e(p) : p;
};
K.mix3 = (a, b, p) => a.clone().lerp(b, p);

// mulberry32
K.rng = seed => {
  let s = seed >>> 0;
  const r = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = Math.imul(s ^ (s >>> 15), 1 | s);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  r.range = (a, b) => a + (b - a) * r();
  r.int = (a, b) => Math.floor(a + (b - a + 1) * r());
  r.pick = arr => arr[Math.floor(r() * arr.length)];
  return r;
};

// ---------- voiceover time warp ----------
// Anchors (real = cue start, canonical = beat t). Piecewise-linear, clamped, strictly increasing.
K.makeWarp = (beatTimes, canonDur, cues) => {
  if (!cues || !cues.length) return { toCanonical: x => x, toReal: x => x, duration: canonDur };
  const B = beatTimes.length, C = cues.length;
  const R = [], Cn = [];
  for (let i = 0; i < B; i++) {
    let r = i === 0 ? 0 : cues[Math.floor(i * C / B)].start;
    if (R.length && r <= R[R.length - 1]) r = R[R.length - 1] + 0.05;
    R.push(r); Cn.push(beatTimes[i]);
  }
  const duration = cues[C - 1].end + 1.0;
  let last = duration;
  if (last <= R[R.length - 1]) last = R[R.length - 1] + 0.05;
  R.push(last); Cn.push(canonDur);
  const interp = (xs, ys, x) => {
    if (x <= xs[0]) return ys[0];
    for (let i = 1; i < xs.length; i++) if (x <= xs[i]) return ys[i - 1] + (ys[i] - ys[i - 1]) * (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
    return ys[ys.length - 1];
  };
  return { toCanonical: x => interp(R, Cn, x), toReal: x => interp(Cn, R, x), duration: last };
};

// ---------- fonts ----------
// spec: 'Oswald:wght@500;700' -> loads the Google Fonts CSS, then each weight.
K.loadFonts = async (specs = []) => {
  if (!specs.length || typeof document === 'undefined') return;
  const href = 'https://fonts.googleapis.com/css2?' + specs.map(s => 'family=' + s.replace(/ /g, '+')).join('&') + '&display=block';
  if (!document.querySelector(`link[href="${href}"]`)) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href;
    await new Promise(ok => { l.onload = ok; l.onerror = ok; document.head.append(l); });
  }
  const loads = [];
  for (const s of specs) {
    const [fam, axes = ''] = s.split(':');
    const m = axes.match(/@(.+)$/);
    const weights = m ? m[1].split(';').map(w => w.split(',').pop().split('..')[0]) : ['400'];
    for (const w of weights) loads.push(document.fonts.load(`${w} 64px "${fam}"`));
  }
  await Promise.all(loads);
};
const fontCss = (o, px) => {
  const fam = /,|^(serif|sans-serif|monospace|cursive)$/.test(o.font) ? o.font : `"${o.font}"`;
  return `${o.italic ? 'italic ' : ''}${o.weight} ${px}px ${fam}`;
};

// ---------- textures ----------
K.canvasTex = (w, h, draw, seed = 1) => {
  const T = window.THREE, c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), K.rng(seed), w, h);
  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

// A text plane. opts.height = world height of one text line.
K.label = (text, opts = {}) => {
  const T = window.THREE;
  const o = Object.assign({ font: 'sans-serif', weight: 700, px: 72, color: '#ffffff', bg: null, radius: 0,
    pad: 0.3, height: 0.5, lineHeight: 1.15, align: 'center', stroke: null, strokeWidth: 0, lit: false, italic: false }, opts);
  const lines = String(text).split('\n');
  const px = o.px * 2, lh = px * o.lineHeight, pad = px * o.pad;
  const meas = document.createElement('canvas').getContext('2d');
  meas.font = fontCss(o, px);
  const tw = Math.max(...lines.map(l => meas.measureText(l).width));
  const w = Math.ceil(tw + pad * 2), h = Math.ceil(lh * lines.length + pad * 2);
  const tex = K.canvasTex(w, h, ctx => {
    if (o.bg) {
      ctx.fillStyle = o.bg;
      ctx.beginPath(); ctx.roundRect(0, 0, w, h, o.radius === 'pill' ? h / 2 : o.radius * 2); ctx.fill();
    }
    ctx.font = fontCss(o, px); ctx.textBaseline = 'middle'; ctx.textAlign = o.align;
    const x = o.align === 'center' ? w / 2 : o.align === 'left' ? pad : w - pad;
    lines.forEach((l, i) => {
      const y = pad + lh * (i + 0.5) + px * 0.04;
      if (o.stroke) { ctx.lineWidth = o.strokeWidth * 2; ctx.strokeStyle = o.stroke; ctx.lineJoin = 'round'; ctx.strokeText(l, x, y); }
      ctx.fillStyle = o.color; ctx.fillText(l, x, y);
    });
  });
  const k = o.height / lh;
  const mat = o.lit
    ? new T.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.9, alphaTest: 0.02 })
    : new T.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false });
  const mesh = new T.Mesh(new T.PlaneGeometry(w * k, h * k), mat);
  mesh.userData.w = w * k; mesh.userData.h = h * k;
  mesh.userData.isLabel = true; // an art style draws labels in a separate pass, after its post shader
  return mesh;
};

// Thick 3D letters without a font file: raster rows -> merged boxes -> one BufferGeometry.
K.textBlocks = (text, opts = {}) => {
  const T = window.THREE;
  const o = Object.assign({ font: 'sans-serif', weight: 900, res: 96, size: 1, depth: 0.2, italic: false }, opts);
  const c = document.createElement('canvas'), ctx = c.getContext('2d');
  ctx.font = fontCss(o, o.res);
  const tw = Math.ceil(ctx.measureText(text).width) + 4, th = Math.ceil(o.res * 1.3);
  c.width = tw; c.height = th;
  ctx.font = fontCss(o, o.res); ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
  ctx.fillText(text, 2, th / 2);
  const d = ctx.getImageData(0, 0, tw, th).data, on = (x, y) => d[(y * tw + x) * 4 + 3] > 127;
  const boxes = [], open = new Map(); // key x0,x1 -> box being extended down
  for (let y = 0; y < th; y++) {
    const seen = new Set();
    for (let x = 0; x < tw; x++) {
      if (!on(x, y)) continue;
      let x1 = x; while (x1 + 1 < tw && on(x1 + 1, y)) x1++;
      const key = x + ',' + x1, b = open.get(key);
      if (b && b.y1 === y - 1) b.y1 = y; else { const nb = { x0: x, x1, y0: y, y1: y }; boxes.push(nb); open.set(key, nb); }
      seen.add(key); x = x1;
    }
    for (const k of [...open.keys()]) if (!seen.has(k)) open.delete(k);
  }
  const s = o.size / o.res, pos = [], nor = [], idx = [];
  const face = (n, a, b, c2, e) => { const i = pos.length / 3; pos.push(...a, ...b, ...c2, ...e); for (let j = 0; j < 4; j++) nor.push(...n); idx.push(i, i + 1, i + 2, i, i + 2, i + 3); };
  for (const b of boxes) {
    const X0 = (b.x0 - tw / 2) * s, X1 = (b.x1 + 1 - tw / 2) * s, Y0 = (th / 2 - b.y1 - 1) * s, Y1 = (th / 2 - b.y0) * s, Z0 = 0, Z1 = o.depth;
    face([0, 0, 1], [X0, Y0, Z1], [X1, Y0, Z1], [X1, Y1, Z1], [X0, Y1, Z1]);
    face([0, 0, -1], [X1, Y0, Z0], [X0, Y0, Z0], [X0, Y1, Z0], [X1, Y1, Z0]);
    face([1, 0, 0], [X1, Y0, Z1], [X1, Y0, Z0], [X1, Y1, Z0], [X1, Y1, Z1]);
    face([-1, 0, 0], [X0, Y0, Z0], [X0, Y0, Z1], [X0, Y1, Z1], [X0, Y1, Z0]);
    face([0, 1, 0], [X0, Y1, Z1], [X1, Y1, Z1], [X1, Y1, Z0], [X0, Y1, Z0]);
    face([0, -1, 0], [X0, Y0, Z0], [X1, Y0, Z0], [X1, Y0, Z1], [X0, Y0, Z1]);
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new T.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  g.translate(0, 0, -o.depth / 2);
  return g;
};

// ---------- camera ----------
// keys = [{t, pos:[x,y,z], look:[x,y,z], fov?}] -> fn(t) sets the camera.
K.camPath = (keys, camera) => {
  const T = window.THREE, V = a => new T.Vector3(...a);
  const P = keys.map(k => V(k.pos)), L = keys.map(k => V(k.look));
  const cr = (p0, p1, p2, p3, u) => {
    const u2 = u * u, u3 = u2 * u;
    return p1.clone().multiplyScalar(2).add(p2.clone().sub(p0).multiplyScalar(u))
      .add(p0.clone().multiplyScalar(2).sub(p1.clone().multiplyScalar(5)).add(p2.clone().multiplyScalar(4)).sub(p3).multiplyScalar(u2))
      .add(p1.clone().multiplyScalar(3).sub(p0).sub(p2.clone().multiplyScalar(3)).add(p3).multiplyScalar(u3)).multiplyScalar(0.5);
  };
  return t => {
    const n = keys.length;
    let i = 0; while (i < n - 2 && t >= keys[i + 1].t) i++;
    const u = n < 2 ? 0 : K.prog(t, keys[i].t, keys[i + 1].t);
    const j = Math.min(i + 1, n - 1);
    const pos = n < 2 ? P[0].clone() : cr(P[Math.max(i - 1, 0)], P[i], P[j], P[Math.min(i + 2, n - 1)], u);
    const look = L[i].clone().lerp(L[j], K.ease.inOut(u));
    camera.position.copy(pos); camera.lookAt(look);
    const f0 = keys[i].fov ?? camera.fov, f1 = keys[j].fov ?? f0;
    const fov = K.lerp(f0, f1, K.ease.inOut(u));
    if (fov !== camera.fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
    camera.userData.look = look;
  };
};

// ---------- lights ----------
const PRESETS = {
  studio: { sky: 0xffffff, ground: 0x8a8580, amb: 0.9, key: [0xffffff, 2.6, [5, 9, 5]], fill: [0xdfe8ff, 0.6, [-7, 3, 3]], rim: [0xffffff, 1.2, [-2, 5, -7]], env: 0.6 },
  sun: { sky: 0xcfe6ff, ground: 0xb59a6a, amb: 1.0, key: [0xfff1d6, 3.2, [7, 11, 4]], fill: [0xbcd4ff, 0.45, [-7, 4, 3]], rim: [0xffd9a0, 0.8, [-3, 5, -8]], env: 0.5 },
  lamp: { sky: 0x3a3550, ground: 0x1a1410, amb: 0.35, key: [0xffc27a, 3.6, [3, 8, 3]], fill: [0x6070a0, 0.25, [-7, 3, 3]], rim: [0xffb070, 1.0, [-3, 4, -7]], env: 0.2 },
  night: { sky: 0x203050, ground: 0x05070c, amb: 0.3, key: [0x9fb8ff, 1.2, [-4, 9, 5]], fill: [0x304060, 0.2, [7, 3, 3]], rim: [0x80a0ff, 0.8, [3, 5, -7]], env: 0.12 },
};
// opts: {size: shadow half-width, target: [x,y,z], env: bool}
K.lights = (S, preset = 'studio', opts = {}) => {
  const T = S.THREE, p = PRESETS[preset], size = opts.size ?? 8, tgt = new T.Vector3(...(opts.target || [0, 0, 0]));
  const amb = new T.HemisphereLight(p.sky, p.ground, p.amb);
  const dir = ([c, i, pos], shadow) => {
    const l = new T.DirectionalLight(c, i);
    l.position.copy(tgt).add(new T.Vector3(...pos));
    l.target.position.copy(tgt);
    S.scene.add(l, l.target);
    if (shadow) {
      l.castShadow = true;
      l.shadow.mapSize.set(2048, 2048);
      Object.assign(l.shadow.camera, { left: -size, right: size, top: size, bottom: -size, near: 0.5, far: size * 6 });
      l.shadow.camera.updateProjectionMatrix();
      l.shadow.bias = -0.0005; l.shadow.normalBias = 0.02; l.shadow.radius = 3;
    }
    return l;
  };
  S.scene.add(amb);
  const out = { amb, key: dir(p.key, true), fill: dir(p.fill), rim: dir(p.rim) };
  if (opts.env !== false) {
    // A small studio box with bright panels, prefiltered for reflections.
    const env = new T.Scene(), box = new T.Mesh(new T.BoxGeometry(10, 10, 10), new T.MeshBasicMaterial({ color: 0x4a4a4a, side: T.BackSide }));
    env.add(box);
    [[0, 4.9, 0, -Math.PI / 2, 0, 6, 3], [-4.9, 1, 0, 0, Math.PI / 2, 4, 2], [4.9, 1, 1, 0, -Math.PI / 2, 2, 4], [0, 1, -4.9, 0, 0, 5, 1.2]].forEach(([x, y, z, rx, ry, w, h]) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: 0xffffff }));
      m.position.set(x, y, z); m.rotation.set(rx, ry, 0); env.add(m);
    });
    const pm = new T.PMREMGenerator(S.renderer), rt = pm.fromScene(env, 0.04);
    S.scene.environment = rt.texture; S.scene.environmentIntensity = p.env;
    S.own(rt); pm.dispose();
    env.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
    out.envTarget = rt;
  }
  return out;
};

// Change a material in place (art styles, hook M): fn(shader) edits the compiled shader; earlier onBeforeCompile hooks still run.
K.patchMaterial = (m, fn) => {
  const prev = m.onBeforeCompile;
  const key = (m.customProgramCacheKey ? m.customProgramCacheKey() : prev ? prev.toString() : '') + fn.toString(); // programs are cached by this key
  m.onBeforeCompile = (shader, r) => { if (prev) prev.call(m, shader, r); fn(shader, m); };
  m.customProgramCacheKey = () => key;
  m.needsUpdate = true;
};

// ---------- run ----------
const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const tri = T => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)); g.setAttribute('uv', new T.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2)); return g; };

K.run = async (canvas, style, opts = {}) => {
  const T = window.THREE, art = opts.art || null; // art: an art style from atlas/art/<id>.js, drawn over a scene whose post is null
  if (art && style.post) throw new Error(`Art style "${art.id}" needs a scene with post: null. "${style.id}" has its own post shader.`);
  await K.loadFonts(style.fonts || []);
  const W = 1920, H = 1080, scale = opts.scale || 1;
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.state.reset(); // the canvas can carry a GL context from an earlier renderer (shared hover canvas)
  renderer.setPixelRatio(1);
  renderer.setSize(W * scale, H * scale, false);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFShadowMap;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(30, W / H, 0.1, 500);
  const owned = [];
  const S = {
    THREE: T, scene, camera, renderer, W, H, canvas, style,
    beats: style.beats || [], rng: K.rng(1), samples: opts.samples || 1,
    own: x => (owned.push(x), x),
  };
  const update = style.build(S);
  if (art && art.material) { // M: the art style changes materials in place, once each; label meshes are never offered
    const seen = new Set();
    scene.traverse(o => { if (o.isMesh && !o.userData.isLabel) for (const m of [].concat(o.material)) if (m && !seen.has(m)) { seen.add(m); art.material(m, o, S); } });
  }
  let warp;
  S.setCues = cues => { warp = K.makeWarp(S.beats.map(b => b.t), style.duration, cues); S.duration = warp.duration; S.cues = cues || null; };
  S.toReal = c => warp.toReal(c);
  S.toCanonical = r => warp.toCanonical(r);
  S.setCues(opts.cues);

  // Render path: direct to screen, or through targets for the post pass and for sub-frame samples.
  const post = art ? art.post : style.post, sz = [W * scale, H * scale], xs = art && art.x; // xs = {n, still?, span, mode: 'avg'|'max'|'diff'|'echo'}
  let rtScene, rtAcc, rtLive, depthMat, echoMat, rtNorm, quad, quadScene, ortho, copyMat, finalMat, normMat;
  const ensureTargets = () => {
    if (rtScene) return;
    rtScene = S.own(new T.WebGLRenderTarget(...sz, { type: T.HalfFloatType, samples: 4, depthTexture: new T.DepthTexture(...sz) }));
    S.own(rtScene.depthTexture);
    rtAcc = S.own(new T.WebGLRenderTarget(...sz, { type: T.HalfFloatType }));
    if (post && post.normals) { rtNorm = S.own(new T.WebGLRenderTarget(...sz, { samples: 4 })); normMat = S.own(new T.MeshNormalMaterial()); }
    ortho = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    quad = new T.Mesh(tri(T)); quad.frustumCulled = false;
    quadScene = new T.Scene(); quadScene.add(quad);
    copyMat = S.own(new T.ShaderMaterial({ vertexShader: VERT, transparent: true, blending: T.AdditiveBlending, depthTest: false, depthWrite: false, toneMapped: false,
      uniforms: { tex: { value: null }, w: { value: 1 } },
      fragmentShader: 'uniform sampler2D tex; uniform float w; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tex, vUv).rgb, w); }' }));
    if (xs && xs.mode === 'echo') { // earlier renders, kept only where they are nearer than the live render: tColor = (sum of their colours, count)
      rtLive = S.own(new T.WebGLRenderTarget(...sz, { type: T.HalfFloatType }));
      const lin = 'float z = texture2D(tD, vUv).x * 2.0 - 1.0, d = 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear));';
      const mk = (frag, uni, extra) => S.own(new T.ShaderMaterial(Object.assign({ vertexShader: VERT, depthTest: false, depthWrite: false, toneMapped: false, fragmentShader: 'uniform sampler2D tD, tex, tL; uniform float uNear, uFar; varying vec2 vUv; void main(){ ' + lin + frag + ' }',
        uniforms: Object.assign({ tD: { value: null }, tex: { value: null }, tL: { value: null }, uNear: { value: 0.1 }, uFar: { value: 500 } }, uni) }, extra)));
      depthMat = mk('gl_FragColor = vec4(d, 0.0, 0.0, 1.0);', {}, {});
      echoMat = mk('gl_FragColor = vec4(texture2D(tex, vUv).rgb, step(d, texture2D(tL, vUv).x * 0.993));', {}, { transparent: true, blending: T.AdditiveBlending });
    }
    if (xs && xs.mode === 'max') Object.assign(copyMat, { blending: T.CustomBlending, blendEquation: T.MaxEquation, blendSrc: T.OneFactor, blendDst: T.OneFactor });
    // Extra inputs for art styles only: W world position, B beat times and canonical time, tPrev for X 'diff', uFocus = distance to the look target.
    const artHead = art ? 'uniform sampler2D tPrev, tCur; uniform float uXn; uniform mat4 uProjInv, uViewInv; uniform float uCanon, uFocus, uDur, uRealT, uBeats[8]; uniform int uBeatN;\n' +
      'vec3 worldPos(vec2 uv){ vec4 c = uProjInv * vec4(uv * 2.0 - 1.0, texture2D(tDepth, uv).x * 2.0 - 1.0, 1.0); return (uViewInv * vec4(c.xyz / c.w, 1.0)).xyz; }\n' +
      'vec3 worldNormal(vec2 uv){ return normalize(mat3(uViewInv) * (texture2D(tNormal, uv).rgb * 2.0 - 1.0)); }\n' +
      'float beatIdx(){ float k = -1.0; for (int i = 0; i < 8; i++) if (i < uBeatN && uCanon >= uBeats[i]) k = float(i); return k; }\n' +
      'float beatAge(){ float k = beatIdx(); return k < 0.0 ? uCanon : uCanon - uBeats[int(k)]; }\n' : '';
    const head = 'uniform sampler2D tColor, tDepth, tNormal; uniform vec2 uRes; uniform float uTime, uNear, uFar; varying vec2 vUv;\n' +
      'float linDepth(vec2 uv){ float z = texture2D(tDepth, uv).x * 2.0 - 1.0; return 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear)); }\n' + artHead;
    finalMat = S.own(new T.ShaderMaterial({ vertexShader: VERT, depthTest: false, depthWrite: false,
      uniforms: Object.assign({ tColor: { value: null }, tDepth: { value: null }, tNormal: { value: null }, uRes: { value: new T.Vector2(...sz) },
        uTime: { value: 0 }, uNear: { value: 0.1 }, uFar: { value: 500 } },
        art ? { tPrev: { value: null }, tCur: { value: null }, uXn: { value: 1 }, uProjInv: { value: new T.Matrix4() }, uViewInv: { value: new T.Matrix4() }, uCanon: { value: 0 }, uFocus: { value: 1 }, uDur: { value: 1 }, uRealT: { value: 0 },
          uBeats: { value: S.beats.map(b => b.t).concat(Array(8).fill(1e9)).slice(0, 8) }, uBeatN: { value: Math.min(8, S.beats.length) } } : {}, post ? post.uniforms || {} : {}),
      // post.fragment defines vec4 postFX(vec2 uv) and returns linear colour; tone mapping and sRGB happen once, here.
      fragmentShader: head + (post ? post.fragment : 'vec4 postFX(vec2 uv){ return texture2D(tColor, uv); }') +
        '\nvoid main(){ gl_FragColor = postFX(vUv);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}' }));
  };
  const jitterDof = i => {
    const d = style.dof; if (!d) return;
    const look = camera.userData.look || new T.Vector3(0, 0, 0).applyMatrix4(camera.matrixWorld);
    const fwd = new T.Vector3(); camera.getWorldDirection(fwd);
    const focus = camera.position.clone().addScaledVector(fwd, d.focus ?? camera.position.distanceTo(look));
    const a = i * 2.39996, r = Math.sqrt((i + 0.5) / S.samples) * (d.aperture ?? 0.05);
    camera.updateMatrixWorld();
    const right = new T.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), up = new T.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    camera.position.addScaledVector(right, Math.cos(a) * r).addScaledVector(up, Math.sin(a) * r);
    camera.lookAt(focus);
  };
  // art.labels = 'halo' | 'light' | 'dark': an outline around the glyphs, in the opposite tone of the text ('halo') or a fixed tone. Default: none.
  const haloLabel = o => {
    const m = o.material, dark = art.labels === 'dark' ? 1 : art.labels === 'light' ? 0 : -1;
    o.userData.halo = true; m.transparent = true; m.alphaTest = 0;
    K.patchMaterial(m, sh => {
      sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', `
        vec2 hpx = 4.0 / vec2(textureSize(map, 0)); float hA = 0.0; vec3 hC = vec3(0.0);
        for (int i = 0; i < 12; i++) { float ha = float(i) * 0.5236; vec4 hT = texture2D(map, vMapUv + vec2(cos(ha), sin(ha)) * hpx); if (hT.a > hA) { hA = hT.a; hC = hT.rgb; } }
        float hDark = ${dark < 0 ? 'step(0.5, dot(hC, vec3(0.333)))' : dark.toFixed(1)};
        outgoingLight = mix(vec3(mix(0.96, 0.03, hDark)), outgoingLight, diffuseColor.a);
        diffuseColor.a = max(diffuseColor.a, hA * 0.92);
        #include <opaque_fragment>`);
    });
  };
  const apply = (real) => {
    update(warp.toCanonical(real), real);
    if (art) scene.traverse(o => { // labels live on layer 1: drawn only by the label pass
      if (o.userData.isLabel) { o.layers.set(1); if (art.labels && !o.userData.halo) haloLabel(o); } else if (o.isLight) o.layers.enable(1);
    });
  };
  // Labels: drawn after the post shader, on top of the art, without occlusion. Shadow maps from the main pass stay valid for lit labels.
  const labelPass = () => {
    const { background, fog } = scene, ac = renderer.autoClear, su = renderer.shadowMap.autoUpdate;
    scene.background = null; scene.fog = null; camera.layers.set(1); renderer.autoClear = false; renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(null); renderer.clearDepth(); renderer.render(scene, camera);
    scene.background = background; scene.fog = fog; camera.layers.set(0); renderer.autoClear = ac; renderer.shadowMap.autoUpdate = su;
  };
  S.seek = t => {
    S.t = t;
    const tf = art && art.fps ? Math.floor(t * art.fps + 1e-4) / art.fps : t; // S: frame step
    const mode = xs ? xs.mode || 'avg' : 'avg';
    const n = xs ? (mode === 'diff' ? 2 : S.samples > 1 ? xs.still || xs.n : xs.n) : S.samples;
    if (n <= 1 && !post && !art) { apply(t); renderer.setRenderTarget(null); renderer.render(scene, camera); return; }
    ensureTargets();
    const shutter = 0.5 / 30;
    // sub-frame times: X = n times in the window [tf - span, tf], and the last one is tf, so depth, normals and camera belong to the frame itself
    const timeAt = i => xs ? Math.max(0, tf - (mode === 'diff' ? (1 - i) * xs.span : xs.span * (n - 1 - i) / n)) : tf + (n > 1 ? (i / n) * shutter : 0);
    let pose = null; // X with fixCamera: the camera keeps its pose at tf in every render (a tripod)
    if (xs && xs.fixCamera) { apply(tf); pose = [camera.position.clone(), camera.quaternion.clone(), camera.fov]; }
    // echo: the live render first (its depth is kept), then the earlier ones, then the live render again so depth, normals and tCur are the live frame
    const seq = mode === 'echo' ? [n - 1, ...Array.from({ length: n - 1 }, (_, i) => i), n - 1] : Array.from({ length: Math.max(1, n) }, (_, i) => i);
    const pass = (mat, tgt) => { quad.material = mat; renderer.setRenderTarget(tgt); const ac = renderer.autoClear; renderer.autoClear = tgt === rtLive; renderer.render(quadScene, ortho); renderer.autoClear = ac; };
    for (let q = 0; q < seq.length; q++) {
      const i = seq[q];
      apply(timeAt(i));
      if (pose) { camera.position.copy(pose[0]); camera.quaternion.copy(pose[1]); if (camera.fov !== pose[2]) { camera.fov = pose[2]; camera.updateProjectionMatrix(); } }
      if (n > 1 && !xs) jitterDof(i);
      renderer.setRenderTarget(rtScene); renderer.render(scene, camera);
      if (mode === 'echo' && q < seq.length - 1) {
        for (const m of [depthMat, echoMat]) { m.uniforms.tD.value = rtScene.depthTexture; m.uniforms.tex.value = rtScene.texture; m.uniforms.tL.value = rtLive.texture; m.uniforms.uNear.value = camera.near; m.uniforms.uFar.value = camera.far; }
        if (q === 0) {
          pass(depthMat, rtLive);
          const cc = renderer.getClearColor(new T.Color()), ca = renderer.getClearAlpha();
          renderer.setRenderTarget(rtAcc); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.setClearColor(cc, ca);
        } else pass(echoMat, rtAcc);
      } else if (mode !== 'echo' && n > 1 && (mode !== 'diff' || i === 0)) {
        copyMat.uniforms.tex.value = rtScene.texture; copyMat.uniforms.w.value = mode === 'avg' ? 1 / n : 1;
        quad.material = copyMat; renderer.setRenderTarget(rtAcc);
        if (i === 0) { // the scene background sets the clear colour; the sum must start from black
          const cc = renderer.getClearColor(new T.Color()), ca = renderer.getClearAlpha();
          renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.setClearColor(cc, ca);
        }
        const ac = renderer.autoClear; renderer.autoClear = false; renderer.render(quadScene, ortho); renderer.autoClear = ac;
      }
    }
    if (rtNorm) { scene.overrideMaterial = normMat; renderer.setRenderTarget(rtNorm); renderer.render(scene, camera); scene.overrideMaterial = null; }
    const u = finalMat.uniforms;
    u.tColor.value = n > 1 && mode !== 'diff' ? rtAcc.texture : rtScene.texture; u.tDepth.value = rtScene.depthTexture;
    u.tNormal.value = rtNorm ? rtNorm.texture : null; u.uTime.value = tf; u.uNear.value = camera.near; u.uFar.value = camera.far;
    if (art) {
      const look = camera.userData.look || new T.Vector3();
      u.tCur.value = rtScene.texture; u.uXn.value = n; u.tPrev.value = mode === 'diff' ? rtAcc.texture : null; u.uCanon.value = warp.toCanonical(tf); u.uDur.value = S.duration; u.uRealT.value = t; u.uFocus.value = camera.position.distanceTo(look);
      u.uProjInv.value.copy(camera.projectionMatrixInverse); u.uViewInv.value.copy(camera.matrixWorld);
    }
    quad.material = finalMat; renderer.setRenderTarget(null); renderer.render(quadScene, ortho);
    if (art) labelPass();
  };
  S.dispose = () => {
    const texs = new Set();
    const drop = m => { if (!m) return; for (const v of Object.values(m)) if (v && v.isTexture) texs.add(v); if (m.uniforms) for (const u of Object.values(m.uniforms)) if (u.value && u.value.isTexture) texs.add(u.value); m.dispose(); };
    scene.traverse(o => { o.geometry?.dispose(); [].concat(o.material || []).forEach(drop); if (o.isInstancedMesh) o.dispose(); });
    [scene.background, scene.environment].forEach(x => x && x.isTexture && texs.add(x));
    texs.forEach(t => t.dispose());
    owned.forEach(x => (x.isMaterial ? drop(x) : x.dispose()));
    quad?.geometry.dispose();
    renderer.dispose();
  };
  return S;
};
})();
