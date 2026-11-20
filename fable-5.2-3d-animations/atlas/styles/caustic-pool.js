window.STYLES = window.STYLES || {};
STYLES['caustic-pool'] = {
  id: 'caustic-pool', name: 'Caustic Pool',
  family: 'Light and optics',
  use: 'Explainer',
  look: 'The tiled floor of a swimming pool seen from under the water. Bright caustic lines move across the tiles. Words are laid in the floor as tile mosaics. Shafts of light and small bubbles hang in the blue.',
  motion: 'Ripples spread from a point and their light lines sweep the floor. Objects sink slowly and land. A second set of ripples starts; where it meets the first one peak to trough, the light lines fade out and the floor goes calm.',
  shownHere: 'How noise-cancelling headphones cancel a wave: sound is a wave like a ripple; the headphones listen to the noise; they make the opposite wave; where a peak meets a trough the two cancel; near your ear it goes quiet.',
  goodFor: 'Waves and interference: sound, signals, light, opposing forces that cancel, any "add the opposite to get zero" idea.',
  fonts: ['Rubik:wght@600;800'],
  duration: 12,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Sound is a wave, like a ripple' },
    { t: 2.4, label: 'Headphones listen to the noise' },
    { t: 4.8, label: 'They make the opposite wave' },
    { t: 7.2, label: 'Peak meets trough: they cancel' },
    { t: 9.6, label: 'Near your ear, it goes quiet' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Rubik', BE = this.beats;
    scene.background = new T.Color('#0a4a6a'); scene.fog = new T.FogExp2('#0a4a6a', 0.06); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#bfe8ff', '#0a3a5a', 1.1)); const sunL = new T.DirectionalLight('#ffffff', 1.2); sunL.position.set(2, 10, 3); scene.add(sunL);
    // the floor: tiles with grout, and mosaic words made of tiles
    const TW = 20, TD = 14, tiles = K.canvasTex(2000, 1400, (g, r, w, h) => { const s = 50; for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) { g.fillStyle = `hsl(195, ${r.range(45, 60)}%, ${r.range(78, 86)}%)`; g.fillRect(x + 2, y + 2, s - 4, s - 4); g.fillStyle = '#d8e8ec'; g.fillRect(x, y, s, 2); g.fillRect(x, y, 2, s); }
      const mosaic = (txt, cx, cy, col) => { const CW = 90, CH = 14, P = 12, c = document.createElement('canvas'); c.width = CW; c.height = CH; const cg = c.getContext('2d'); cg.fillStyle = '#000'; cg.fillRect(0, 0, CW, CH); cg.fillStyle = '#fff'; cg.font = `800 12px "${F}"`; cg.textAlign = 'center'; cg.textBaseline = 'middle'; cg.fillText(txt, CW / 2, CH / 2 + 1); const d = cg.getImageData(0, 0, CW, CH).data;
        for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) if (d[(y * CW + x) * 4] > 110) { g.fillStyle = col; g.fillRect(cx - CW / 2 * P + x * P, cy - CH / 2 * P + y * P, P - 1, P - 1); } };
      mosaic('NOISE', w * 0.25, h * 0.7, '#1a3a8a'); mosaic('ANTI-NOISE', w * 0.74, h * 0.72, '#a02a3a'); mosaic('QUIET', w * 0.72, h * 0.32, '#1a7a4a'); }, 4);
    const floor = new T.Mesh(new T.PlaneGeometry(TW, TD), new T.MeshStandardMaterial({ map: tiles, roughness: 0.6 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
    // caustics: an additive layer; brightness from how the wave surface focuses light (its curvature)
    const SRC = new T.Vector2(-4.6, 1.2), EAR = new T.Vector2(4.4, 1.2);
    const caus = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      uniforms: { uT: { value: 0 }, uA1: { value: 1 }, uA2: { value: 0 }, uPhi: { value: 1.6 }, uSrc: { value: SRC }, uEar: { value: EAR }, uR: { value: 3.4 } },
      vertexShader: 'varying vec2 vP; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vP = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `uniform float uT, uA1, uA2, uPhi, uR; uniform vec2 uSrc, uEar; varying vec2 vP;
        float wave(vec2 p, float ph){ float r = length(p - uSrc); return sin(r * 3.2 - uT * 4.0 + ph) / sqrt(r + 0.6); }
        float h(vec2 p){ float n = uA1 * wave(p, 0.0); float m = smoothstep(uR, uR * 0.7, length(p - uEar)); return n - uA2 * m * wave(p, uPhi); }
        float pool(vec2 p){ return 0.06 * (sin(p.x * 4.1 + uT * 1.3) + sin(p.y * 3.7 - uT * 1.1) + sin((p.x + p.y) * 2.9 + uT * 0.9)); }
        void main(){ float e = 0.06; vec2 p = vP; float c = h(p) + pool(p);
          float lap = (h(p + vec2(e, 0.0)) + h(p - vec2(e, 0.0)) + h(p + vec2(0.0, e)) + h(p - vec2(0.0, e)) - 4.0 * h(p)) / (e * e);
          float b = clamp(-lap * 0.08, 0.0, 1.2) + 0.12 * clamp(-(pool(p + vec2(e,0.)) + pool(p - vec2(e,0.)) + pool(p + vec2(0.,e)) + pool(p - vec2(0.,e)) - 4.0 * pool(p)) / (e * e) * 0.5, 0.0, 1.0);
          gl_FragColor = vec4(vec3(0.85, 0.95, 1.0) * b * 0.7, 1.0); }` });
    const causPlane = new T.Mesh(new T.PlaneGeometry(TW, TD, 1, 1), caus); causPlane.rotation.x = -Math.PI / 2; causPlane.position.y = 0.01; scene.add(causPlane);
    // things that sink and land: a speaker at the noise source, headphones at the ear
    const std = (c, r = 0.5, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const speaker = new T.Group(); { const b = new T.Mesh(new T.BoxGeometry(0.9, 1.1, 0.8), std('#2a2a30')); b.position.y = 0.55; const c = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 0.05, 24), std('#5a5a66', 0.3, { metalness: 0.6 })); c.rotation.x = Math.PI / 2; c.position.set(0, 0.6, 0.41); speaker.add(b, c); } scene.add(speaker);
    const phones = new T.Group(); { const band = new T.Mesh(new T.TorusGeometry(0.6, 0.07, 10, 32, Math.PI), std('#e8e8ee', 0.4)); band.position.y = 0.6; [-1, 1].forEach(s => { const cup = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 0.25, 24), std('#a02a3a', 0.4)); cup.rotation.z = Math.PI / 2; cup.position.set(s * 0.6, 0.3, 0); phones.add(cup); }); phones.add(band); } scene.add(phones);
    // bubbles and light shafts
    const rr = K.rng(62), NB = 120, bp = new Float32Array(NB * 3), bs = Array.from({ length: NB }, () => [rr.range(-8, 8), rr.range(-5, 5), rr()]);
    const bub = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(bp, 3)), new T.PointsMaterial({ color: '#e8f8ff', size: 0.06, transparent: true, opacity: 0.8 })); scene.add(bub);
    const shaftTex = K.canvasTex(32, 256, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, 1);
    for (let i = 0; i < 6; i++) { const m = new T.Mesh(new T.PlaneGeometry(rr.range(0.5, 1.2), 8), new T.MeshBasicMaterial({ map: shaftTex, transparent: true, opacity: 0.12, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); m.position.set(rr.range(-7, 7), 4, rr.range(-4, 3)); m.rotation.set(0, rr.range(-1, 1), 0.3); scene.add(m); }
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 800, px: 66, color: '#ffffff', bg: 'rgba(6,40,60,0.82)', radius: 14, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([{ t: 0, pos: [-1.2, 7.0, 9.0], look: [-1.4, 0, 0.4] }, { t: 4.8, pos: [0.6, 7.4, 9.4], look: [0.4, 0, 0.4] }, { t: 9.6, pos: [3.0, 6.0, 7.4], look: [3.0, 0, 0.0] }, { t: 12, pos: [2.0, 7.6, 9.6], look: [1.0, 0, 0.2] }], S.camera);
    return (t, realT) => {
      cam(t);
      const u = caus.uniforms; u.uT.value = realT;
      u.uA1.value = 1.0; u.uA2.value = K.prog(t, B[2] + 0.2, B[2] + 1.2); u.uPhi.value = K.lerp(1.8, 0.0, K.prog(t, B[3] + 0.1, B[3] + 1.6, 'inOut'));
      const sink = (obj, t0, x, z) => { const s = K.prog(t, t0, t0 + 1.8, 'out'); obj.position.set(x, K.lerp(6.5, 0.0, s), z); obj.rotation.set(0.3 * (1 - s), 0.6 * (1 - s) + 0.2, 0.2 * (1 - s)); obj.visible = t > t0; };
      sink(speaker, -1.6, SRC.x, SRC.y); sink(phones, B[1] + 0.1, EAR.x, EAR.y);
      for (let i = 0; i < NB; i++) { const [x, z, ph] = bs[i]; bp[i * 3] = x + 0.1 * Math.sin(realT + i); bp[i * 3 + 1] = (realT * 0.6 + ph * 6) % 6; bp[i * 3 + 2] = z; } bub.geometry.attributes.position.needsUpdate = true;
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('water', { gain: 0.08 });
    // the noise: a low tone that fades out when the opposite wave lines up
    k.custom((ctx, dest, when, g) => { const o = ctx.createOscillator(), gn = ctx.createGain(); o.type = 'sine'; o.frequency.value = 110; gn.gain.setValueAtTime(0.0001, when); gn.gain.exponentialRampToValueAtTime(g, when + 0.5); gn.gain.setValueAtTime(g, when + 7.5); gn.gain.exponentialRampToValueAtTime(g * 0.4, when + 8.6); gn.gain.exponentialRampToValueAtTime(0.0001, when + 10.4); o.connect(gn); gn.connect(dest); o.start(when); o.stop(when + 10.6); }, { t: 0.0, gain: 0.08 });
    k.play('bubble', { t: 0.1, gain: 0.2, pitch: 0.6 }); k.play('thud', { t: 0.2, gain: 0.2, pitch: 0.6 });
    k.play('bubble', { t: B[1] + 0.2, gain: 0.25, pitch: 0.8 }); k.play('thud', { t: B[1] + 1.9, gain: 0.25, pitch: 0.8 });
    k.play('blip', { t: B[2] + 0.3, gain: 0.12, pitch: 1.2 }); k.play('hum', { t: B[2] + 0.3, gain: 0.06, pitch: 0.55, dur: 2.0 });
    k.play('swish', { t: B[3] + 0.2, gain: 0.12, pitch: 0.6, dur: 1.4 }); k.play('chime', { t: B[3] + 1.6, gain: 0.12, pitch: 1.0, music: true });
    k.play('bell', { t: B[4] + 0.8, gain: 0.12, pitch: 0.5, music: true });
  },
  post: null,
};
