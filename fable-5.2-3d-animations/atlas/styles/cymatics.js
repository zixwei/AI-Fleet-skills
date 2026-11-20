window.STYLES = window.STYLES || {};
STYLES['cymatics'] = {
  id: 'cymatics', name: 'Cymatics Plate',
  family: 'Living and elemental',
  use: 'Explainer',
  look: 'A square black metal plate covered in fine pale sand, on a steel stand in a dark studio, with one hard top light. Every grain catches the light, and the clean lines of sand stand out against the black.',
  motion: 'At each new tone the sand jumps, dances and settles into a new pattern of lines. Higher tones make more lines; the pitch you hear and the pattern you see change together.',
  shownHere: 'How sound has a shape: a vibrating plate has still lines where it does not move; sand collects on those lines, and every tone has its own pattern (Chladni figures).',
  goodFor: 'Waves, vibration, resonance and hidden order: physics, music, signals, anything where a frequency makes a pattern.',
  fonts: ['IBM Plex Mono:wght@500;700'],
  duration: 11,
  samples: 4,
  // CONTENT: plate modes (n, m) and the tone for each, in Hz
  beats: [
    { t: 0.0, label: 'Sand on a still plate', n: 1, m: 2, hz: 0 },
    { t: 2.7, label: 'A low tone: a few lines', n: 1, m: 2, hz: 220 },
    { t: 5.4, label: 'Higher: more lines', n: 2, m: 5, hz: 440 },
    { t: 8.1, label: 'Higher still: a finer pattern', n: 3, m: 7, hz: 880 },
  ],
  grains: 20000,

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'IBM Plex Mono', N = this.grains, BE = this.beats;
    scene.background = new T.Color('#08090b'); scene.add(S.camera);
    const amb = new T.HemisphereLight('#8090a0', '#000000', 0.35); scene.add(amb);
    const top = new T.SpotLight('#fff4e6', 140, 30, 0.5, 0.5, 1.2); top.position.set(-2, 11, 4); top.target.position.set(0, 0, 0); top.castShadow = true; top.shadow.mapSize.set(2048, 2048); top.shadow.bias = -0.0005; scene.add(top, top.target);
    const H = 3.0;
    const plate = new T.Mesh(new T.BoxGeometry(2 * H + 0.1, 0.06, 2 * H + 0.1), new T.MeshStandardMaterial({ color: '#111214', metalness: 0.9, roughness: 0.35 })); plate.position.y = -0.03; plate.receiveShadow = true; scene.add(plate);
    const steel = new T.MeshStandardMaterial({ color: '#8a8f98', metalness: 1, roughness: 0.3 });
    const bolt = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 0.08, 16), steel); bolt.position.y = 0.02; scene.add(bolt);
    const stem = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 2.0, 16), steel); stem.position.y = -1.06; scene.add(stem);
    const driver = new T.Mesh(new T.CylinderGeometry(0.8, 0.9, 0.7, 32), new T.MeshStandardMaterial({ color: '#1a1b1e', roughness: 0.5 })); driver.position.y = -2.4; scene.add(driver);
    const floor = new T.Mesh(new T.PlaneGeometry(40, 40), new T.MeshStandardMaterial({ color: '#0c0d10', roughness: 0.8 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -2.75; floor.receiveShadow = true; scene.add(floor);
    // Chladni: f = cos(n pi x) cos(m pi y) - cos(m pi x) cos(n pi y) on the square [-1, 1]^2
    const f = (n, m, x, y) => Math.cos(n * Math.PI * x) * Math.cos(m * Math.PI * y) - Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y);
    const rr = K.rng(13), start = new Float32Array(N * 2); for (let i = 0; i < N * 2; i++) start[i] = rr.range(-0.98, 0.98);
    const settle = (n, m) => { const out = new Float32Array(N * 2), e = 1e-3; for (let i = 0; i < N; i++) { let x = start[i * 2], y = start[i * 2 + 1]; for (let k = 0; k < 10; k++) { const v = f(n, m, x, y), gx = (f(n, m, x + e, y) - v) / e, gy = (f(n, m, x, y + e) - v) / e, g2 = gx * gx + gy * gy + 1e-6; x = K.clamp(x - v * gx / g2 * 0.8, -0.99, 0.99); y = K.clamp(y - v * gy / g2 * 0.8, -0.99, 0.99); } out[i * 2] = x + rr.range(-0.006, 0.006); out[i * 2 + 1] = y + rr.range(-0.006, 0.006); } return out; };
    const targets = [start, settle(BE[1].n, BE[1].m), settle(BE[2].n, BE[2].m), settle(BE[3].n, BE[3].m)];
    const sand = new T.InstancedMesh(new T.BoxGeometry(0.022, 0.016, 0.022), new T.MeshStandardMaterial({ color: '#efe3c4', roughness: 0.8 }), N); sand.castShadow = true; sand.frustumCulled = false; scene.add(sand);
    { const c = new T.Color(); for (let i = 0; i < N; i++) { c.set('#efe3c4').offsetHSL(0, 0, rr.range(-0.08, 0.06)); sand.setColorAt(i, c); } }
    const jump = new Float32Array(N); for (let i = 0; i < N; i++) jump[i] = rr();
    // a frequency readout and a small oscilloscope trace
    const readouts = BE.map(b => { const l = K.label(b.hz ? b.hz + ' Hz' : 'silent', { font: F, weight: 700, px: 72, color: '#7fe0ff', bg: 'rgba(10,14,20,0.8)', radius: 8, pad: 0.35, height: 0.42 }); l.position.set(H + 1.6, 1.2, 0); scene.add(l); return l; });
    const scope = new T.Line(new T.BufferGeometry().setFromPoints(Array.from({ length: 120 }, () => new T.Vector3())), new T.LineBasicMaterial({ color: '#7fe0ff' })); scene.add(scope);
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 76, color: '#eef6ff', height: 0.42 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.76, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [0.6, 10.5, 10.0], look: [0.9, -0.2, 0.3] },
      { t: 5.4, pos: [1.2, 12.0, 8.0], look: [1.0, 0, 0.2] },
      { t: 11, pos: [0.4, 13.0, 8.5], look: [0.9, 0, 0.2] },
    ], S.camera);
    const MX = new T.Matrix4(), Q = new T.Quaternion(), V = new T.Vector3(), SC = new T.Vector3(1, 1, 1), E = new T.Euler();
    return (t, realT) => {
      cam(t);
      let k = 0; for (let i = 1; i < 4; i++) if (t >= B[i]) k = i;
      const t0 = B[k], u = k === 0 ? 1 : K.prog(t, t0 + 0.15, t0 + 1.6, 'inOut'), shake = k === 0 ? 0 : 1 - K.prog(t, t0 + 0.8, t0 + 2.0);
      const from = targets[Math.max(0, k - 1)], to = targets[k], hz = BE[k].hz;
      const a = sand.instanceMatrix.array;
      for (let i = 0; i < N; i++) {
        const x = K.lerp(from[i * 2], to[i * 2], u), y = K.lerp(from[i * 2 + 1], to[i * 2 + 1], u);
        const amp = Math.abs(f(BE[k].n, BE[k].m, x, y)) * shake;
        const hop = amp * 0.12 * Math.abs(Math.sin(realT * 23 + jump[i] * 40));
        V.set(x * H + amp * 0.03 * Math.sin(realT * 31 + i), 0.012 + hop, y * H + amp * 0.03 * Math.cos(realT * 29 + i));
        E.set(jump[i] * 6, jump[i] * 9, 0); Q.setFromEuler(E); MX.compose(V, Q, SC); MX.toArray(a, i * 16);
      }
      sand.instanceMatrix.needsUpdate = true;
      plate.position.y = -0.03 + (hz ? 0.004 * Math.sin(realT * 60) * shake : 0);
      readouts.forEach((l, i) => { l.visible = i === k; l.lookAt(S.camera.position); });
      const sp = scope.geometry.attributes.position; for (let i = 0; i < 120; i++) { const x = H + 0.6 + i / 120 * 2.0, w = hz ? Math.sin(i / 120 * Math.PI * 2 * (hz / 110) + realT * 8) * 0.25 * (0.3 + 0.7 * shake) : 0; sp.setXYZ(i, x, 0.6 + w, 0.9); } sp.needsUpdate = true;
      titles.forEach((l, i) => { const a2 = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a2 > 0.01; l.material.opacity = a2; });
    };
  },

  sound(k) {
    const BE = this.beats;
    k.bed('room', { gain: 0.05 });
    k.play('tick', { t: 0.3, gain: 0.2, pitch: 1.0 });
    BE.slice(1).forEach(b => {
      k.custom((ctx, dest, when, g) => { const o = ctx.createOscillator(), gn = ctx.createGain(); o.type = 'sine'; o.frequency.value = b.hz; gn.gain.setValueAtTime(0.0001, when); gn.gain.exponentialRampToValueAtTime(g, when + 0.1); gn.gain.setValueAtTime(g, when + 1.9); gn.gain.exponentialRampToValueAtTime(0.0001, when + 2.5); o.connect(gn); gn.connect(dest); o.start(when); o.stop(when + 2.6); }, { t: b.t + 0.1, gain: 0.12 });
      for (let i = 0; i < 6; i++) k.play('tick', { t: b.t + 0.2 + i * 0.12, gain: 0.12, pitch: 2.0 + (i % 3) * 0.3 });
    });
  },
  post: null,
};
