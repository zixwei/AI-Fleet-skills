window.STYLES = window.STYLES || {};
STYLES['origami-fold'] = {
  id: 'origami-fold', name: 'Origami Fold',
  family: 'Crafted materials',
  use: 'Explainer',
  look: 'One sheet of two-colour paper on a dark desk: red on the front, cream on the back, with crease lines pressed into it. Folded forms have sharp flat facets and soft shadows under a warm desk lamp.',
  motion: 'The sheet folds itself into each object along its creases, the object acts, then the sheet opens flat and folds into the next object. A small seed rides along with every carrier.',
  shownHere: 'How a seed disperses: a flower lets a seed go, a bird carries it, the wind spins it on a wing, and water floats it to a new shore.',
  goodFor: 'One idea that takes several forms, or one thing carried through several stages. Each form is a new fold of the same sheet.',
  fonts: ['Shippori Mincho:wght@700'],
  duration: 11,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'A seed must leave its plant' },
    { t: 2.7, label: 'A bird can carry it' },
    { t: 5.4, label: 'The wind can spin it away' },
    { t: 8.1, label: 'Water can float it far' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Shippori Mincho';
    scene.background = new T.Color('#121014'); scene.add(S.camera);
    const L = K.lights(S, 'lamp', { size: 8, target: [0, 0, 0] }); L.key.position.set(-4, 9, 4); L.key.intensity = 3.2; L.key.shadow.radius = 5; L.amb.intensity = 0.55; S.scene.environmentIntensity = 0.35;
    const lamp = new T.SpotLight('#ffd9a8', 70, 30, 0.7, 0.7, 1.4); lamp.position.set(3, 9, 3); lamp.target.position.set(0, 0, 0); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -0.0008; scene.add(lamp, lamp.target);
    const desk = new T.Mesh(new T.PlaneGeometry(40, 30), new T.MeshStandardMaterial({ color: '#2a2224', roughness: 0.6, map: K.canvasTex(512, 512, (g, r, w, h) => { g.fillStyle = '#2a2224'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2000; i++) { g.fillStyle = `rgba(255,255,255,${r.range(0.01, 0.03)})`; g.fillRect(r() * w, r() * h, r.range(1, 30), 1); } }, 2) }));
    desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);

    // the sheet: a grid over the square (u, v in -1..1), split along diagonals so the facets fold sharply
    const N = 16, S0 = 1.25, uvs = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const u0 = -1 + 2 * i / N, u1 = -1 + 2 * (i + 1) / N, v0 = -1 + 2 * j / N, v1 = -1 + 2 * (j + 1) / N;
      const diag = (i < N / 2) === (j < N / 2);
      if (diag) uvs.push([u0, v0], [u1, v0], [u1, v1], [u0, v0], [u1, v1], [u0, v1]); else uvs.push([u0, v0], [u1, v0], [u0, v1], [u1, v0], [u1, v1], [u0, v1]);
    }
    const geo = new T.BufferGeometry(), pos = new Float32Array(uvs.length * 3), tuv = new Float32Array(uvs.length * 2);
    uvs.forEach(([u, v], k) => { tuv[k * 2] = (u + 1) / 2; tuv[k * 2 + 1] = (v + 1) / 2; });
    geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.BufferAttribute(tuv, 2));
    const creases = (col, bg) => K.canvasTex(1024, 1024, (g, r, w, h) => {
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(0,0,0,${r.range(0.01, 0.04)})`; g.fillRect(r() * w, r() * h, 2, 2); }
      g.strokeStyle = col; g.lineWidth = 3; g.setLineDash([18, 10]);
      [[0, 0, w, h], [w, 0, 0, h], [w / 2, 0, w / 2, h], [0, h / 2, w, h / 2], [w / 4, 0, w / 4, h], [w * 0.75, 0, w * 0.75, h], [0, h / 4, w, h / 4], [0, h * 0.75, w, h * 0.75]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); });
    }, 4);
    const front = new T.MeshStandardMaterial({ map: creases('rgba(80,0,0,0.45)', '#d8343f'), roughness: 0.75, side: T.BackSide, flatShading: true });
    const back = new T.MeshStandardMaterial({ map: creases('rgba(120,90,60,0.45)', '#f3ead8'), roughness: 0.8, side: T.FrontSide, flatShading: true });
    const sheet = new T.Group(); scene.add(sheet);
    [front, back].forEach(m => { const mesh = new T.Mesh(geo, m); mesh.castShadow = true; mesh.receiveShadow = true; sheet.add(mesh); });
    // shapes: each maps the square to a folded form
    const sm = (a, b, x) => K.clamp((x - a) / (b - a)) ** 2 * (3 - 2 * K.clamp((x - a) / (b - a)));
    const shapes = {
      flat: (u, v) => [u * S0, 0.01, v * S0],
      flower: (u, v) => { const r = Math.max(Math.abs(u), Math.abs(v)), th = Math.atan2(v, u), corner = Math.abs(Math.abs(u) - Math.abs(v)) < 0.25 ? 1 - Math.abs(Math.abs(u) - Math.abs(v)) * 4 : 0;
        const rho = 0.15 + 0.55 * r + 0.15 * corner * r, y = 0.15 + 1.2 * r + 0.35 * corner * r * r; return [Math.cos(th) * rho, y, Math.sin(th) * rho]; },
      bird: (u, v) => { const r = Math.max(Math.abs(u), Math.abs(v)), th = Math.atan2(v, u), c = Math.abs(Math.cos(th)), s = Math.abs(Math.sin(th));
        const ww = sm(0.6, 0.9, c), wn = sm(0.6, 0.9, s), wb = Math.max(0, 1 - ww - wn);
        const wing = [u * 1.7, 0.6 + Math.abs(u) * 0.35, v * 0.35], neck = [u * 0.18, 0.6 + r * (v > 0 ? 0.95 : 0.5), v * 1.0 + (v > 0 ? r * r * 0.25 : 0)], body = [u * 0.45, 0.6 - (1 - r) * 0.3 + 0.25 * r, v * 0.55];
        return [0, 1, 2].map(k => wing[k] * ww + neck[k] * wn + body[k] * wb); },
      samara: (u, v) => { const x = u * 1.5, width = 0.42 * (1 - 0.55 * Math.abs(u + 0.4)), pod = Math.exp(-((u + 0.85) ** 2) * 18) * Math.exp(-(v * v) * 4);
        return [x, 0.05 + 0.25 * pod + 0.12 * u * v, v * width + 0.08 * Math.sin(u * 3)]; },
      boat: (u, v) => { const av = Math.abs(v), sail = sm(0.5, 0.15, av) * Math.max(0, 1 - Math.abs(u) * 1.35);
        return [u * 1.3 * (1 - 0.3 * av), 0.05 + av * 0.55 + sail * 0.9 + (1 - av) * 0.05, v * 0.42 * (1 - 0.5 * sail)]; },
    };
    // timeline of folds: [from shape, to shape, t0, t1]
    const F1 = [['flat', 'flower', 0.15, 1.6], ['flower', 'flat', B[1] - 0.15, B[1] + 0.45], ['flat', 'bird', B[1] + 0.45, B[1] + 1.4], ['bird', 'flat', B[2] - 0.15, B[2] + 0.4], ['flat', 'samara', B[2] + 0.4, B[2] + 1.2], ['samara', 'flat', B[3] - 0.15, B[3] + 0.35], ['flat', 'boat', B[3] + 0.35, B[3] + 1.3]];
    const state = t => { let cur = ['flat', 'flat', 0, 1]; for (const f of F1) if (t >= f[2]) cur = f; return cur; };
    // a small seed that rides along
    const seed = new T.Mesh(new T.OctahedronGeometry(0.18, 0), new T.MeshStandardMaterial({ color: '#5a3a22', roughness: 0.6, flatShading: true })); seed.scale.set(2.4, 1.5, 1.5); seed.castShadow = true; scene.add(seed);
    // folded blue paper waves for the water beat
    const waves = new T.Group(); scene.add(waves);
    const waveMat = new T.MeshStandardMaterial({ color: '#3d6fb5', roughness: 0.7, flatShading: true, side: T.DoubleSide }), waveMat2 = new T.MeshStandardMaterial({ color: '#6f9fd8', roughness: 0.7, flatShading: true, side: T.DoubleSide });
    for (let k = 0; k < 4; k++) { const g = new T.PlaneGeometry(16, 0.65, 64, 1), p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, (i % 2 ? 0.12 : 0.0) + (Math.floor(i / 1) % 2 ? 0 : 0)); for (let i = 0; i < p.count; i++) p.setZ(i, 0.12 * Math.abs(Math.sin(p.getX(i) * 2.2 + k))); g.computeVertexNormals(); const m = new T.Mesh(g, k % 2 ? waveMat : waveMat2); m.rotation.x = -Math.PI / 2; m.position.set(1, 0.01 + k * 0.004, 0.8 + k * 0.6); m.receiveShadow = true; waves.add(m); }
    const shore = new T.Mesh(new T.ConeGeometry(1.4, 1.1, 5), new T.MeshStandardMaterial({ color: '#b48a4f', flatShading: true })); shore.position.set(6.5, 0.4, -0.5); shore.castShadow = true; scene.add(shore);
    // a flat paper cloud and wind lines for the wind beat
    const windLines = [0, 1, 2].map(i => { const c = new T.CatmullRomCurve3([new T.Vector3(-4, 2.2 + i * 0.5, -0.5), new T.Vector3(-1, 2.6 + i * 0.5, -0.5), new T.Vector3(1.5, 2.1 + i * 0.5, -0.5), new T.Vector3(3, 2.5 + i * 0.4, -0.5)]); const m = new T.Mesh(new T.TubeGeometry(c, 60, 0.03, 5), new T.MeshBasicMaterial({ color: '#f3ead8', transparent: true, opacity: 0 })); scene.add(m); return m; });
    // folding tools on the desk: a bone folder and a cup of pencils
    const folder = new T.Mesh(new T.CapsuleGeometry(0.1, 2.0, 6, 12), new T.MeshStandardMaterial({ color: '#efe4cf', roughness: 0.4 })); folder.rotation.set(Math.PI / 2, 0, 0.6); folder.position.set(-4.5, 0.1, 2.4); folder.castShadow = true; scene.add(folder);
    const extra = new T.Mesh(new T.PlaneGeometry(1.2, 1.2), new T.MeshStandardMaterial({ map: creases('rgba(0,40,60,0.4)', '#2f8f9a'), roughness: 0.8 })); extra.rotation.set(-Math.PI / 2, 0, 0.3); extra.position.set(-4.6, 0.012, -1.4); extra.receiveShadow = true; scene.add(extra);
    const extra2 = extra.clone(); extra2.material = new T.MeshStandardMaterial({ map: creases('rgba(80,60,0,0.4)', '#e7b53b'), roughness: 0.8 }); extra2.position.set(-4.2, 0.02, -1.0); extra2.rotation.z = -0.2; scene.add(extra2);
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 84, color: '#f3ead8', height: 0.5 });
      l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.72, -8); S.camera.add(l); return l; });

    const cam = K.camPath([
      { t: 0, pos: [0.0, 5.6, 7.4], look: [0.0, 0.6, 0.0] },
      { t: 5, pos: [0.8, 5.4, 9.5], look: [0.6, 1.2, 0.0] },
      { t: 11, pos: [1.6, 5.8, 9.8], look: [1.6, 0.6, 0.3] },
    ], S.camera);
    const A = new Float32Array(3), Bv = new Float32Array(3);
    return (t, realT) => {
      cam(t);
      const [s0, s1, a, b] = state(t), p = K.prog(t, a, b, 'inOut');
      for (let k = 0; k < uvs.length; k++) {
        const [u, v] = uvs[k], r = Math.max(Math.abs(u), Math.abs(v));
        const q = K.ease.inOut(K.clamp(p * 1.6 - (s1 === 'flat' ? 1 - r : r) * 0.6));
        const P0 = shapes[s0](u, v), P1 = shapes[s1](u, v);
        pos[k * 3] = K.lerp(P0[0], P1[0], q); pos[k * 3 + 1] = K.lerp(P0[1], P1[1], q); pos[k * 3 + 2] = K.lerp(P0[2], P1[2], q);
      }
      geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere();
      // where the sheet is in the world, and what it does
      const fly = K.prog(t, B[1] + 1.4, B[2] - 0.2, 'inOut'), fall = K.prog(t, B[2] + 1.2, B[3] - 0.2, 'inOut'), float = K.prog(t, B[3] + 1.3, 11, 'inOut');
      let x = 0, y = 0, z = 0, ry = 0, rz = 0;
      if (t < B[2] - 0.15) { x = K.lerp(-0.5, 2.6, fly); y = Math.sin(fly * Math.PI) * 1.6; ry = 0.4; rz = 0.12 * Math.sin(realT * 8) * (fly > 0 && fly < 1 ? 1 : 0); if (t < B[1] - 0.15) { x = -0.5; ry = 0; } }
      else if (t < B[3] - 0.15) { x = K.lerp(2.6, 0.2, fall); y = K.lerp(1.9, 0.25, fall) * (t > B[2] + 0.4 ? 1 : K.prog(t, B[2] - 0.15, B[2] + 0.4)); ry = (t - B[2]) * 9 * (fall < 1 ? 1 : 0); }
      else { x = K.lerp(0.2, 0.6, K.prog(t, B[3] - 0.15, B[3] + 0.35)) + K.lerp(0, 4.0, float); y = 0.05 + 0.06 * Math.sin(realT * 2) * K.prog(t, B[3] + 0.4, B[3] + 0.9); z = K.lerp(0, 2.0, K.prog(t, B[3] - 0.15, B[3] + 0.6)); rz = 0.05 * Math.sin(realT * 1.7); }
      sheet.position.set(x, y, z); sheet.rotation.set(0, ry, rz);
      // wing flap for the bird
      if (s1 === 'bird' && p >= 1) sheet.rotation.x = 0.0;
      // the seed: in the flower, then on the bird, on the wing, in the boat
      const sv = new T.Vector3();
      if (t < B[1] - 0.15) { const pop = K.prog(t, 1.6, 2.4, 'out'); sv.set(-0.5 + 0.9 * pop, 1.1 + Math.sin(pop * Math.PI) * 0.8 - pop * 0.95, 0.4 * pop); }
      else if (t < B[2] - 0.15) sv.set(x + 0.1, y + 0.75, z);
      else if (t < B[3] - 0.15) sv.set(x - 1.2 * Math.cos(ry), y + 0.2, z + 1.2 * Math.sin(ry));
      else sv.set(x, y + 0.35, z);
      seed.position.copy(sv); seed.rotation.y = realT;
      windLines.forEach((m, i) => { m.material.opacity = 0.7 * K.prog(t, B[2] + 0.2, B[2] + 0.6) * (1 - K.prog(t, B[3] - 0.4, B[3])); m.position.x = ((realT * 1.5 + i) % 3) - 1; });
      const wv = K.prog(t, B[3] - 0.4, B[3] + 0.4, 'out'); waves.visible = wv > 0; waves.scale.set(1, Math.max(0.001, wv), 1);
      waves.children.forEach((m, i) => { m.position.x = 1 + 0.3 * Math.sin(realT * 1.2 + i); });
      shore.scale.setScalar(Math.max(0.001, K.prog(t, B[3] + 0.6, B[3] + 1.2, 'back')));
      titles.forEach((l, i) => { const a2 = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a2 > 0.01; l.material.opacity = a2; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.06 });
    [[0.15, 1.6], [B[1] + 0.45, B[1] + 1.4], [B[2] + 0.4, B[2] + 1.2], [B[3] + 0.35, B[3] + 1.3]].forEach(([a, b]) => { for (let i = 0; i < 4; i++) k.play('paper', { t: a + (b - a) * i / 4, gain: 0.3, pitch: 0.8 + i * 0.15 }); });
    [B[1] - 0.15, B[2] - 0.15, B[3] - 0.15].forEach(a => k.play('swish', { t: a, gain: 0.2, pitch: 1.2, dur: 0.5 }));
    k.play('pop', { t: 1.7, gain: 0.3, pitch: 1.1 });
    for (let i = 0; i < 4; i++) k.play('swish', { t: B[1] + 1.5 + i * 0.25, gain: 0.15, pitch: 1.6, dur: 0.2 });
    k.play('whoosh', { t: B[2] + 0.3, gain: 0.3, pitch: 0.7, dur: 2.2 });
    k.play('splash', { t: B[3] + 0.2, gain: 0.25, pitch: 1.2 });
    k.play('chime', { t: B[3] + 2.2, gain: 0.2, pitch: 1.1, music: true });
  },
  post: null,
};
