window.STYLES = window.STYLES || {};
STYLES['pin-wall'] = {
  id: 'pin-wall', name: 'Pin Wall',
  family: 'Flat content made physical',
  use: 'Explainer',
  look: 'A pin-art toy the size of a wall: thousands of steel pins with round heads push out of a dark perforated plate. One raking light from the side makes every bump cast a shadow, so the relief reads like a sculpture.',
  motion: 'Shapes rise and travel across the wall as the pins slide in and out. One shape morphs into the next without a cut.',
  shownHere: 'How ocean waves reach the shore: wind ruffles the sea, swells travel in long lines, in shallow water they slow down and grow, and they break on the beach.',
  goodFor: 'Fields, waves, terrain and any quantity that varies over a surface: heat maps, population, sound, pressure. The height of the pins is the value.',
  fonts: ['Archivo:wght@600;800'],
  duration: 11,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Wind ruffles the sea' },
    { t: 2.7, label: 'Swells travel in long lines' },
    { t: 5.4, label: 'Near shore they slow and grow' },
    { t: 8.1, label: 'Then they break on the beach' },
  ],
  zones: ['DEEP WATER', 'SHALLOWS', 'BEACH'],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Archivo';
    scene.background = new T.Color('#0e0f11'); scene.add(S.camera);
    const amb = new T.HemisphereLight('#c9d4e0', '#101012', 0.12); scene.add(amb);
    const rake = new T.DirectionalLight('#fff1dc', 4.2); rake.position.set(-14, 1.5, 3.2); rake.target.position.set(0, 0, 0); rake.castShadow = true;
    rake.shadow.mapSize.set(2048, 2048); Object.assign(rake.shadow.camera, { left: -8, right: 8, top: 5, bottom: -5, near: 1, far: 30 }); rake.shadow.camera.updateProjectionMatrix(); rake.shadow.bias = -0.0004; rake.shadow.normalBias = 0.01;
    scene.add(rake, rake.target);
    const fill = new T.DirectionalLight('#8fb0ff', 0.35); fill.position.set(6, -3, 6); scene.add(fill);
    const envS = new T.Scene(); envS.add(new T.Mesh(new T.SphereGeometry(10, 16, 8), new T.MeshBasicMaterial({ color: '#555', side: T.BackSide }))); const pl = new T.Mesh(new T.PlaneGeometry(6, 2), new T.MeshBasicMaterial({ color: '#fff' })); pl.position.set(-6, 2, 3); pl.lookAt(0, 0, 0); envS.add(pl);
    const pm = new T.PMREMGenerator(S.renderer), envRT = pm.fromScene(envS, 0.05); scene.environment = envRT.texture; S.own(envRT); pm.dispose();
    const COLS = 84, ROWS = 46, P = 0.13, W = COLS * P, H = ROWS * P;
    // the plate: dark metal with holes
    const plateTex = K.canvasTex(1024, 560, (g, r, w, h) => { g.fillStyle = '#26282c'; g.fillRect(0, 0, w, h); g.fillStyle = '#08090a'; for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) { g.beginPath(); g.arc((i + 0.5 + (j % 2) * 0.5) / COLS * w, (j + 0.5) / ROWS * h, 3.6, 0, 7); g.fill(); } for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(255,255,255,${r.range(0.01, 0.04)})`; g.fillRect(r() * w, r() * h, r.range(2, 20), 1); } }, 2);
    const plate = new T.Mesh(new T.BoxGeometry(W + 0.4, H + 0.4, 0.2), new T.MeshStandardMaterial({ map: plateTex, metalness: 0.7, roughness: 0.5 })); plate.position.z = -0.1; plate.receiveShadow = true; scene.add(plate);
    const frameM = new T.MeshStandardMaterial({ color: '#3a3328', metalness: 0.3, roughness: 0.55 });
    [[0, H / 2 + 0.35, W + 1.1, 0.5], [0, -H / 2 - 0.35, W + 1.1, 0.5], [-W / 2 - 0.35, 0, 0.5, H + 0.2], [W / 2 + 0.35, 0, 0.5, H + 0.2]].forEach(([x, y, w, h]) => { const m = new T.Mesh(new T.BoxGeometry(w, h, 1.5), frameM); m.position.set(x, y, 0.45); m.castShadow = m.receiveShadow = true; scene.add(m); });
    // pins: a shaft with a domed head, made by a lathe so one instanced geometry serves all
    const pinGeo = new T.LatheGeometry([[0, -1.6], [0.022, -1.6], [0.022, -0.02], [0.05, -0.02], [0.056, 0.0], [0.05, 0.028], [0.03, 0.048], [0, 0.055]].map(([x, y]) => new T.Vector2(x, y)), 10).rotateX(Math.PI / 2);
    const pins = new T.InstancedMesh(pinGeo, new T.MeshStandardMaterial({ color: '#c9ced6', metalness: 0.9, roughness: 0.42, envMapIntensity: 0.35 }), COLS * ROWS);
    pins.castShadow = pins.receiveShadow = true; scene.add(pins);
    const XY = Array.from({ length: COLS * ROWS }, (_, n) => { const i = n % COLS, j = Math.floor(n / COLS); return [(i + 0.5 + (j % 2) * 0.5) * P - W / 2, H / 2 - (j + 0.5) * P]; });
    // the field: ripples, swells, shoaling and breaking, with a beach on the right
    const sm = (a, b, x) => { const u = K.clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
    const shore = y => 3.3 + 0.45 * Math.sin(y * 1.1 + 0.6) + 0.2 * Math.sin(y * 2.7);
    const field = (x, y, t, rT, w) => {
      const sh = shore(y), d = sh - x; // distance to the shoreline
      if (d < 0) return 0.95 + 0.07 * Math.sin(x * 3.1 + y * 2.3) + 0.05 * Math.sin(x * 7 - y * 5) - 0.25 * sm(0, -0.8, d) * 0; // beach and dunes
      const ripple = 0.06 * (Math.sin(x * 9.1 + y * 6.3 + rT * 3.1) * Math.sin(x * 4.7 - y * 8.2 - rT * 2.3) + 0.6 * Math.sin(x * 13 + y * 3 - rT * 4));
      const shallow = sm(3.0, 0.2, d);
      const k = 2.0 * (1 + 1.1 * shallow * w.shoal), amp = 0.33 * w.swell * (1 + 1.4 * shallow * w.shoal);
      const phase = k * x - rT * 2.4 + 0.25 * Math.sin(y * 0.6);
      let s = Math.sin(phase + w.brk * shallow * 0.9 * Math.sin(phase));
      if (w.brk > 0) s = K.lerp(s, Math.pow((Math.sin(phase) + 1) / 2, 3) * 2 - 0.4, w.brk * sm(1.3, 0.2, d));
      const foam = w.brk * sm(0.9, 0.0, d) * 0.25 * Math.abs(Math.sin(x * 37 + y * 23 + rT * 9));
      return 0.32 + ripple * (1 - 0.5 * w.swell) + amp * s + foam + 0.12 * shallow;
    };
    // zone tags and a small boat-shaped marker? no: engraved brass tags on the frame
    const tags = this.zones.map((z, i) => { const l = K.label(z, { font: F, weight: 800, px: 56, color: '#2a2118', bg: '#c9a35a', radius: 6, pad: 0.35, height: 0.3, lit: true }); l.position.set([-3.2, 1.8, 4.4][i], -H / 2 - 0.35, 1.22); scene.add(l); return l; });
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 800, px: 84, color: '#f1ece2', height: 0.46 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [-3.0, 1.6, 15.2], look: [-0.3, 0.45, 0] },
      { t: 5.4, pos: [1.0, 1.0, 14.8], look: [0.4, 0.4, 0] },
      { t: 11, pos: [3.0, 1.4, 15.4], look: [0.6, 0.45, 0] },
    ], S.camera);
    const MX = new T.Matrix4(), Q = new T.Quaternion(), V = new T.Vector3(), SC = new T.Vector3(1, 1, 1);
    return (t, realT) => {
      cam(t);
      const w = { swell: K.prog(t, B[1], B[1] + 1.0, 'inOut'), shoal: K.prog(t, B[2], B[2] + 1.2, 'inOut'), brk: K.prog(t, B[3], B[3] + 1.0, 'inOut') };
      for (let n = 0; n < XY.length; n++) {
        const [x, y] = XY[n], h = field(x, y, t, realT, w);
        pins.setMatrixAt(n, MX.compose(V.set(x, y, K.clamp(h, 0.04, 1.35)), Q, SC));
      }
      pins.instanceMatrix.needsUpdate = true;
      tags.forEach((l, i) => { const p = K.prog(t, B[i + 1] + 0.3, B[i + 1] + 0.7, 'back'); l.visible = p > 0; l.scale.setScalar(Math.max(0.001, p)); });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.08 });
    k.bed('water', { gain: 0.06 });
    for (let i = 0; i < 10; i++) k.play('tick', { t: 0.2 + i * 0.2, gain: 0.12, pitch: 1.2 + (i % 3) * 0.2, pan: -0.5 + i * 0.1 });
    for (let i = 0; i < 3; i++) k.play('whoosh', { t: B[1] + i * 0.9, gain: 0.2, pitch: 0.5, dur: 1.2 });
    for (let i = 0; i < 3; i++) k.play('whoosh', { t: B[2] + i * 0.8, gain: 0.28, pitch: 0.6, dur: 1.1 });
    for (let i = 0; i < 3; i++) { k.play('splash', { t: B[3] + 0.3 + i * 0.85, gain: 0.35, pitch: 0.7, dur: 1.4, pan: 0.5 }); k.play('rumble', { t: B[3] + 0.3 + i * 0.85, gain: 0.2, pitch: 1.2, dur: 1.0 }); }
    k.play('metal', { t: B[1] + 0.3, gain: 0.08, pitch: 2.0 });
  },
  post: null,
};
