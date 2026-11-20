window.STYLES = window.STYLES || {};
STYLES['circuit-city'] = {
  id: 'circuit-city', name: 'Circuit City',
  family: 'Small worlds',
  use: 'Explainer',
  look: 'A circuit board filmed as a city at night: black chips are buildings with lit windows, capacitors are towers, gold traces are streets, and white silkscreen text names the districts. Low camera, deep shadows, glowing pulses.',
  motion: 'Pulses of light travel along the traces from district to district. Each district lights up when the work reaches it; the camera glides low between the buildings.',
  shownHere: 'How a prompt becomes an answer: the text comes in, it is split into tokens and turned into numbers, layers of attention weigh every token against the others, and the answer streams out one token at a time.',
  goodFor: 'Computing, data pipelines and systems with stages: anything where signals travel between parts that each do one job.',
  fonts: ['Share Tech Mono'],
  duration: 11,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Your prompt comes in' },
    { t: 2.7, label: 'Split into tokens and numbers' },
    { t: 5.4, label: 'Attention weighs every token' },
    { t: 8.1, label: 'The answer streams out' },
  ],
  districts: ['PROMPT IN', 'TOKENIZER', 'EMBEDDINGS', 'ATTENTION LAYERS', 'OUTPUT', 'ANSWER OUT'],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Share Tech Mono';
    scene.background = new T.Color('#03070a'); scene.fog = new T.Fog('#03070a', 9, 26); scene.add(S.camera);
    const amb = new T.HemisphereLight('#5a7a9a', '#0a1014', 1.1); scene.add(amb);
    const moon = new T.DirectionalLight('#9fc0ff', 1.8); moon.position.set(-6, 8, 4); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -10, right: 10, top: 7, bottom: -7 }); moon.shadow.camera.updateProjectionMatrix(); moon.shadow.bias = -0.0005; scene.add(moon);
    // the board: solder mask with silkscreen
    const BW = 17, BD = 11, D = this.districts;
    const boardTex = K.canvasTex(2048, 1324, (g, r, w, h) => {
      g.fillStyle = '#16402a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(0,0,0,${r.range(0.05, 0.15)})`; g.fillRect(r() * w, r() * h, 2, 2); }
      g.strokeStyle = 'rgba(220,240,230,0.55)'; g.fillStyle = 'rgba(220,240,230,0.75)'; g.lineWidth = 3; g.font = `400 34px "${F}"`;
      for (let i = 0; i < 40; i++) { const x = r() * w, y = r() * h; g.fillText(['R', 'C', 'U', 'Q', 'D'][i % 5] + r.int(1, 99), x, y); }
      g.strokeRect(20, 20, w - 40, h - 40);
    }, 7);
    const board = new T.Mesh(new T.BoxGeometry(BW, 0.2, BD), new T.MeshStandardMaterial({ map: boardTex, roughness: 0.55 })); board.position.y = -0.1; board.receiveShadow = true; scene.add(board);
    const X = x => x, Z = z => z;
    const gold = new T.MeshStandardMaterial({ color: '#d9a945', metalness: 1, roughness: 0.3, emissive: '#8a5a10', emissiveIntensity: 0.9 });
    // traces: Manhattan paths as flat gold strips
    const PATHS = [
      [[-8.2, 0], [-5.6, 0], [-5.6, -2.2], [-4.6, -2.2]],
      [[-3.8, -1.3], [-3.8, 0.4], [-3.8, 1.5]],
      [[-3.0, 2.3], [-1.6, 2.3], [-1.6, 0.9], [-0.6, 0.9]],
      [[0.9, 1.6], [0.9, 2.9]], [[2.9, 1.6], [2.9, 2.9]], [[0.9, -1.6], [0.9, -2.9]], [[2.9, -1.6], [2.9, -2.9]],
      [[2.6, -0.2], [4.3, -0.2], [4.3, -1.6], [4.9, -1.6]],
      [[6.1, -1.6], [6.8, -1.6], [6.8, 1.2], [8.2, 1.2]],
    ];
    const curves = PATHS.map(p => { const cp = new T.CurvePath(); for (let i = 0; i < p.length - 1; i++) cp.add(new T.LineCurve3(new T.Vector3(p[i][0], 0.03, p[i][1]), new T.Vector3(p[i + 1][0], 0.03, p[i + 1][1]))); return cp; });
    PATHS.forEach(p => { for (let k = -1; k <= 1; k++) for (let i = 0; i < p.length - 1; i++) { const [x0, z0] = p[i], [x1, z1] = p[i + 1], len = Math.hypot(x1 - x0, z1 - z0) + 0.06, horiz = Math.abs(z1 - z0) < 1e-6; const m = new T.Mesh(new T.BoxGeometry(horiz ? len : 0.05, 0.02, horiz ? 0.05 : len), gold); m.position.set((x0 + x1) / 2 + (horiz ? 0 : k * 0.14), 0.01, (z0 + z1) / 2 + (horiz ? k * 0.14 : 0)); m.receiveShadow = true; scene.add(m); } });
    // extra city texture: many short traces and vias
    const rr = K.rng(3);
    for (let i = 0; i < 70; i++) { const x = rr.range(-8, 8), z = rr.range(-5, 5), len = rr.range(0.4, 1.6), h = rr() < 0.5; const m = new T.Mesh(new T.BoxGeometry(h ? len : 0.04, 0.015, h ? 0.04 : len), gold); m.position.set(x, 0.01, z); scene.add(m); }
    const vias = new T.InstancedMesh(new T.CylinderGeometry(0.05, 0.05, 0.03, 10), gold, 140); for (let i = 0; i < 140; i++) vias.setMatrixAt(i, new T.Matrix4().makeTranslation(rr.range(-8, 8), 0.015, rr.range(-5, 5))); scene.add(vias);
    // chips as buildings with lit windows; capacitors as towers
    const chipMat = new T.MeshStandardMaterial({ color: '#141518', roughness: 0.45, metalness: 0.2 });
    const winGeo = new T.PlaneGeometry(0.06, 0.04), winMats = [new T.MeshBasicMaterial({ color: '#ffcf7a', toneMapped: false }), new T.MeshBasicMaterial({ color: '#7fe0ff', toneMapped: false })];
    const chips = [];
    const chip = (x, z, w, d, h, name, labelSize = 0.34) => {
      const g = new T.Group(); g.position.set(x, 0, z); scene.add(g);
      const body = new T.Mesh(new T.BoxGeometry(w, h, d), chipMat); body.position.y = h / 2 + 0.04; body.castShadow = body.receiveShadow = true; g.add(body);
      const pins = new T.InstancedMesh(new T.BoxGeometry(0.06, 0.05, 0.16), gold, Math.floor(w / 0.2) * 2 + Math.floor(d / 0.2) * 2); let n = 0, M4 = new T.Matrix4();
      for (let i = 0; i < Math.floor(w / 0.2); i++) [-1, 1].forEach(s => pins.setMatrixAt(n++, M4.makeTranslation(-w / 2 + 0.1 + i * 0.2, 0.05, s * (d / 2 + 0.06))));
      for (let i = 0; i < Math.floor(d / 0.2); i++) [-1, 1].forEach(s => pins.setMatrixAt(n++, M4.compose(new T.Vector3(s * (w / 2 + 0.06), 0.05, -d / 2 + 0.1 + i * 0.2), new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), Math.PI / 2), new T.Vector3(1, 1, 1))));
      g.add(pins);
      const wins = []; const wr = K.rng(Math.round(x * 13 + z * 7 + 99));
      for (let i = 0; i < Math.floor(w * 6); i++) for (let j = 0; j < Math.floor(h * 8); j++) { if (wr() < 0.55) continue; const m = new T.Mesh(winGeo, winMats[wr() < 0.8 ? 0 : 1]); m.position.set(-w / 2 + 0.1 + i / 6, 0.12 + j / 8, d / 2 + 0.002); g.add(m); wins.push(m); }
      const lab = K.label(name, { font: F, weight: 400, px: 64, color: '#e8f4ec', height: labelSize }); lab.rotation.x = -Math.PI / 2; lab.position.set(0, h + 0.05, 0); g.add(lab);
      const glow = new T.PointLight('#7fe0ff', 0, 4, 1.6); glow.position.set(0, h + 0.6, 0); g.add(glow);
      const c = { g, wins, glow, lab, h }; chips.push(c); return c;
    };
    const cIn = chip(-8.0, 0, 0.6, 1.4, 0.5, '', 0.2);
    const cTok = chip(-3.8, -2.2, 1.6, 1.6, 0.9, D[1], 0.26);
    const cEmb = chip(-3.8, 2.3, 1.5, 1.4, 1.2, D[2], 0.24);
    const cAtt = chip(1.9, 0, 3.0, 3.0, 1.6, D[3], 0.28);
    const cLay = [[0.9, 3.5], [2.9, 3.5], [0.9, -3.5], [2.9, -3.5]].map(([x, z]) => chip(x, z, 1.1, 1.1, 1.0 + rr() * 0.6, 'L' + rr.int(1, 96), 0.22));
    const cOut = chip(5.5, -1.6, 1.3, 1.3, 1.0, D[4], 0.26);
    const cAns = chip(8.0, 1.2, 0.6, 1.4, 0.5, '', 0.2);
    // connector labels on the board edge
    [[D[0], -7.2, 1.3], [D[5], 6.9, 2.4]].forEach(([s, x, z]) => { const l = K.label(s, { font: F, weight: 400, px: 64, color: '#e8f4ec', height: 0.3 }); l.rotation.x = -Math.PI / 2; l.position.set(x, 0.03, z); scene.add(l); });
    const capMat = new T.MeshStandardMaterial({ color: '#2a3a6a', metalness: 0.4, roughness: 0.35 });
    for (let i = 0; i < 18; i++) { const x = rr.range(-7.5, 7.5), z = rr.range(-4.6, 4.6); if (chips.some(c => Math.hypot(c.g.position.x - x, c.g.position.z - z) < 1.6)) continue; const h = rr.range(0.6, 1.6); const cap = new T.Mesh(new T.CylinderGeometry(0.18, 0.18, h, 20), capMat); cap.position.set(x, h / 2, z); cap.castShadow = true; scene.add(cap); const top = new T.Mesh(new T.CylinderGeometry(0.18, 0.18, 0.02, 20), new T.MeshStandardMaterial({ color: '#9aa3b0', metalness: 1, roughness: 0.3 })); top.position.set(x, h + 0.01, z); scene.add(top); const red = new T.Mesh(new T.SphereGeometry(0.035, 8, 6), new T.MeshBasicMaterial({ color: '#ff3030', toneMapped: false })); red.position.set(x, h + 0.06, z); scene.add(red); }
    // pulses: glowing sprites on the traces
    const dot = K.canvasTex(64, 64, g => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(160,240,255,0.8)'); gr.addColorStop(1, 'rgba(0,200,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
    const NP = 120, pulses = Array.from({ length: NP }, () => { const s = new T.Sprite(new T.SpriteMaterial({ map: dot, transparent: true, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false })); s.scale.setScalar(0.7); scene.add(s); return s; });
    // schedule: [path, start, count, spacing, duration]
    const sched = [[0, 0.0, 6, 0.3, 1.2], [1, B[1] + 0.2, 12, 0.14, 0.7], [2, B[2] - 0.3, 10, 0.2, 0.9], [3, B[2] + 0.5, 6, 0.4, 0.5], [4, B[2] + 0.7, 6, 0.4, 0.5], [5, B[2] + 0.6, 6, 0.4, 0.5], [6, B[2] + 0.8, 6, 0.4, 0.5], [7, B[3] + 0.0, 12, 0.22, 0.8], [8, B[3] + 0.6, 12, 0.22, 0.8]];
    const lights = [[cIn, -1, 2], [cTok, B[1] + 0.3, 9], [cEmb, B[1] + 1.4, 9], [cAtt, B[2] + 0.2, 99], ...cLay.map(c => [c, B[2] + 0.7, 99]), [cOut, B[3] + 0.6, 99], [cAns, B[3] + 1.2, 99]];
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 400, px: 84, color: '#bff4ff', height: 0.46 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [-9.0, 4.0, 6.5], look: [-5.2, 0.2, -0.5] },
      { t: 2.7, pos: [-6.0, 4.2, 7.0], look: [-3.8, 0.3, 0] },
      { t: 5.4, pos: [-1.0, 4.8, 8.0], look: [1.6, 0.4, 0] },
      { t: 8.1, pos: [3.5, 4.4, 7.0], look: [5.2, 0.3, -0.2] },
      { t: 11, pos: [1.0, 7.5, 9.5], look: [0.5, 0, 0] },
    ], S.camera);
    return (t, realT) => {
      cam(t);
      let used = 0;
      sched.forEach(([pi, t0, n, sp, dur]) => { for (let k = 0; k < n; k++) { const u = (t - t0 - k * sp) / dur; if (u <= 0 || u >= 1 || used >= NP) continue; const p = curves[pi].getPointAt(u); const s = pulses[used++]; s.position.set(p.x, 0.12, p.z); s.material.opacity = Math.min(1, u * 6, (1 - u) * 6); s.visible = true; } });
      for (let i = used; i < NP; i++) pulses[i].visible = false;
      lights.forEach(([c, t0, t1]) => { const on = K.prog(t, t0, t0 + 0.3) * (1 - K.prog(t, t1, t1 + 0.5)) + 0.25; c.glow.intensity = 3 * Math.max(0, on - 0.25) * (0.85 + 0.15 * Math.sin(realT * 7)); c.wins.forEach((w, i) => { w.visible = ((i * 7 + Math.floor(realT * 0.5 + i)) % 5 !== 0) && (on > 0.5 || i % 3 === 0); }); c.lab.material.color.setScalar(0.6 + 0.4 * Math.min(1, on)); });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('machine', { gain: 0.04 }); k.bed('night', { gain: 0.04 });
    for (let i = 0; i < 6; i++) k.play('blip', { t: 0.2 + i * 0.3, gain: 0.15, pitch: 1.0 });
    for (let i = 0; i < 12; i++) k.play('tick', { t: B[1] + 0.2 + i * 0.14, gain: 0.18, pitch: 1.5 + (i % 3) * 0.2 });
    k.play('hum', { t: B[2] + 0.2, gain: 0.2, pitch: 1.6, dur: 2.5 });
    for (let i = 0; i < 8; i++) k.play('blip', { t: B[2] + 0.5 + i * 0.25, gain: 0.12, pitch: 0.8 + (i % 4) * 0.25 });
    for (let i = 0; i < 12; i++) k.play('blip', { t: B[3] + 0.8 + i * 0.22, gain: 0.18, pitch: 1.2 + (i % 5) * 0.1 });
    k.play('chime', { t: B[3] + 2.4, gain: 0.2, pitch: 1.0, music: true });
  },
  post: null,
};
