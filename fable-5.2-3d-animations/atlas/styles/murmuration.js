window.STYLES = window.STYLES || {};
STYLES['murmuration'] = {
  id: 'murmuration', name: 'Murmuration',
  family: 'Living and elemental',
  use: 'Story',
  look: 'Thousands of small birds against a dusk sky above a marsh: dark silhouettes on gold and violet, a calm water surface that mirrors the sky, reeds and a tree line in the foreground.',
  motion: 'The flock flows as one mass. For a moment it forms the shape of each idea, holds it, then dissolves back into swirling motion.',
  shownHere: 'How a rumour becomes a market move: a rumour starts, it spreads from person to person, everyone acts at the same moment, and the price falls.',
  goodFor: 'Crowd behaviour, emergence, trends and collective action: many small agents that together make one shape.',
  fonts: ['Cormorant Garamond:wght@700'],
  duration: 11,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'A rumour starts' },
    { t: 2.7, label: 'It spreads, person to person' },
    { t: 5.4, label: 'Everyone sells at once' },
    { t: 8.1, label: 'The price falls' },
  ],
  birds: 6000,

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Cormorant Garamond', N = this.birds;
    const skyTex = K.canvasTex(16, 512, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a2a5a'); gr.addColorStop(0.35, '#8a5a8a'); gr.addColorStop(0.6, '#f29a5a'); gr.addColorStop(0.72, '#ffd08a'); gr.addColorStop(1, '#4a3a4a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    scene.background = skyTex; scene.add(S.camera);
    const amb = new T.HemisphereLight('#ffd0a0', '#302030', 1.0); scene.add(amb);
    // water that mirrors the sky, reeds and a tree line
    const water = new T.Mesh(new T.PlaneGeometry(200, 80), new T.MeshBasicMaterial({ map: K.canvasTex(16, 256, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f2b070'); gr.addColorStop(0.5, '#a06a7a'); gr.addColorStop(1, '#2a2440'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) }));
    water.rotation.x = -Math.PI / 2; water.position.set(0, -6, -20); scene.add(water);
    const sil = new T.MeshBasicMaterial({ color: '#1a1220' });
    const trees = new T.Mesh(new T.PlaneGeometry(200, 6), new T.MeshBasicMaterial({ color: '#2a1a2a', transparent: true, map: K.canvasTex(2048, 64, (g, r, w, h) => { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 6) g.lineTo(x, h * (0.35 + 0.25 * Math.sin(x * 0.02) + 0.15 * Math.sin(x * 0.11) + 0.1 * r())); g.lineTo(w, h); g.fill(); }) }));
    trees.position.set(0, -4.2, -60); scene.add(trees);
    const reedR = K.rng(3);
    for (let i = 0; i < 90; i++) { const h = reedR.range(1.0, 3.2), m = new T.Mesh(new T.PlaneGeometry(0.05, h), sil); m.position.set(reedR.range(-12, 12), -4.6 + h / 2, reedR.range(5, 8)); m.rotation.z = reedR.range(-0.15, 0.15); scene.add(m); if (reedR() < 0.4) { const head = new T.Mesh(new T.CapsuleGeometry(0.06, 0.35, 2, 6), sil); head.position.set(m.position.x + Math.sin(-m.rotation.z) * h / 2, -4.6 + h + 0.1, m.position.z); head.rotation.z = m.rotation.z; scene.add(head); } }
    const sunDisc = new T.Mesh(new T.CircleGeometry(3, 40), new T.MeshBasicMaterial({ color: '#ffe0a0', toneMapped: false, transparent: true, opacity: 0.9 })); sunDisc.position.set(9, -3.2, -70); scene.add(sunDisc);
    // shapes: each returns a target point for bird i (in a plane in front of the camera)
    const U = new Float32Array(N * 3), rr = K.rng(5); for (let i = 0; i < N * 3; i++) U[i] = rr();
    const shapes = [
      (i, o) => { const u = U[i * 3], v = U[i * 3 + 1]; if (u < 0.85) { const a = u / 0.85 * 6.283, r = 1 + 0.1 * (v - 0.5); return o.set(4.2 * Math.cos(a) * r, 2.6 * Math.sin(a) * r + 1, 0); } const s = (u - 0.85) / 0.15; return o.set(-1.5 - s * 1.6 + (v - 0.5) * 0.3, -1.3 - s * 1.5, 0); },
      (i, o) => { const u = U[i * 3], v = U[i * 3 + 1], ring = Math.floor(u * 3), a = v * 6.283, r = 1.6 + ring * 1.7 + (U[i * 3 + 2] - 0.5) * 0.25; return o.set(r * Math.cos(a) * 1.3, r * Math.sin(a) * 0.75 + 0.6, 0); },
      (i, o) => { const u = U[i * 3], v = U[i * 3 + 1]; if (u < 0.55) return o.set((v - 0.5) * 2.2, 4.0 - u / 0.55 * 4.2, 0); const s = (u - 0.55) / 0.45, w = (1 - s) * 5.0; return o.set((v - 0.5) * w, -0.2 - s * 3.2, 0); },
      (i, o) => { const u = U[i * 3], v = U[i * 3 + 1]; const pts = [[-6, 3], [-4, 3.4], [-2.5, 2.8], [-1, 3.2], [0.2, 2.6], [1.0, -1.5], [2.5, -1.0], [4.2, -2.4], [6, -2.8]]; if (v < 0.12) return o.set(-6.5, -3.3 + u * 7, 0); if (v < 0.24) return o.set(-6.5 + u * 13, -3.3, 0); const f = u * (pts.length - 1), k = Math.floor(f), w = f - k, a = pts[k], b = pts[Math.min(k + 1, pts.length - 1)]; return o.set(K.lerp(a[0], b[0], w) + (U[i * 3 + 2] - 0.5) * 0.18, K.lerp(a[1], b[1], w) + (v - 0.5) * 0.18, 0); },
    ];
    // a free, swirling flock
    const swirl = (i, t, rt, o) => { const u = U[i * 3], v = U[i * 3 + 1], w = U[i * 3 + 2]; const cx = 2.5 * Math.sin(rt * 0.23), cy = 1.0 + 1.0 * Math.sin(rt * 0.31); const a = u * 6.283 + rt * (0.6 + 0.3 * w), b = v * 6.283 + rt * 0.45; const r = 3.2 + 1.2 * Math.sin(b + u * 3); return o.set(cx + r * Math.cos(a) * 1.4 + 0.8 * Math.sin(b * 2 + rt), cy + r * 0.55 * Math.sin(a) * Math.cos(b * 0.5) + 0.6 * Math.sin(a * 2), (w - 0.5) * 3 + 1.5 * Math.cos(b)); };
    const wing = new T.BufferGeometry(); wing.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0, -0.06, 0.012, -0.02, -0.012, 0, 0.026, 0, 0, 0, 0.06, 0.012, -0.02, 0.012, 0, 0.026], 3));
    const flock = new T.InstancedMesh(wing, new T.MeshBasicMaterial({ color: '#1a1220', side: T.DoubleSide }), N); flock.frustumCulled = false; scene.add(flock);
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 84, color: '#fff2dc', stroke: '#2a1a2a', strokeWidth: 8, height: 0.46 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, -1.72, -8); S.camera.add(l); return l; });
    S.camera.position.set(0, 0.6, 16); S.camera.lookAt(0, 0.6, 0);
    const A = new T.Vector3(), Bv = new T.Vector3(), MX = new T.Matrix4(), Q = new T.Quaternion(), E = new T.Euler(), SC = new T.Vector3();
    const hold = k => { const c = B[k] + 1.3; return K.prog(t0g, c - 1.0, c - 0.1, 'inOut') * (1 - K.prog(t0g, c + 0.9, c + 1.6, 'inOut')); };
    let t0g = 0;
    return (t, realT) => {
      t0g = t;
      S.camera.position.set(0.4 * Math.sin(t * 0.2), 0.6 + 0.2 * Math.sin(t * 0.13), 16); S.camera.lookAt(0, 0.6, 0);
      const w = [0, 1, 2, 3].map(k => k === 3 ? K.prog(t, B[3] + 0.3, B[3] + 1.3, 'inOut') : hold(k));
      const a = flock.instanceMatrix.array;
      for (let i = 0; i < N; i++) {
        swirl(i, t, realT, A);
        let wi = 0, k = -1; for (let j = 0; j < 4; j++) if (w[j] > wi) { wi = w[j]; k = j; }
        const lag = U[i * 3 + 2] * 0.3, ww = K.clamp(wi * 1.3 - lag);
        if (k >= 0 && ww > 0) { shapes[k](i, Bv); Bv.x += 0.05 * Math.sin(realT * 3 + i); Bv.y += 0.05 * Math.cos(realT * 2.7 + i * 1.3); A.lerp(Bv, K.ease.inOut(ww)); }
        const flap = 0.6 + 0.4 * Math.sin(realT * 18 + i * 0.7);
        E.set(0.3 * Math.sin(i), realT * 0.5 + i, 0); Q.setFromEuler(E); MX.compose(A, Q, SC.set(1.4, flap * 1.4, 1.4));
        MX.toArray(a, i * 16);
      }
      flock.instanceMatrix.needsUpdate = true;
      titles.forEach((l, i) => { const a2 = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a2 > 0.01; l.material.opacity = a2; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.1 }); k.bed('water', { gain: 0.04 });
    B.forEach((b, i) => { k.play('whoosh', { t: b + 0.2, gain: 0.25, pitch: 0.8 + i * 0.1, dur: 1.4 }); k.play('swish', { t: b + 1.0, gain: 0.2, pitch: 1.2, dur: 1.0 }); });
    for (let i = 0; i < 12; i++) k.play('tick', { t: 0.3 + i * 0.9, gain: 0.06, pitch: 2.4 + (i % 3) * 0.3 });
    k.play('drop', { t: B[3] + 0.8, gain: 0.3, pitch: 0.5 });
    k.play('bell', { t: B[3] + 1.4, gain: 0.18, pitch: 0.5, music: true });
  },
  post: null,
};
