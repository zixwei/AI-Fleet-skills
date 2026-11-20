window.STYLES = window.STYLES || {};
STYLES['particle-swarm'] = {
  id: 'particle-swarm', name: 'Bead Swarm',
  family: 'Flat content made physical',
  use: 'Explainer',
  look: 'Sixty thousand small glass beads in front of a matte paper wall. Together they form soft rounded models; each bead keeps its own glint and colour. Soft daylight and a pale shadow on the wall.',
  motion: 'The beads pour from one model into the next, each on its own path with a small delay, so every change looks like sand flowing into a mould. Heat makes them jitter; a burst throws them out.',
  shownHere: 'Why popcorn pops: a kernel holds a little water, heat turns the water to steam, pressure builds until the hull bursts, and the starch puffs into foam.',
  goodFor: 'Changes of state and form: before and after, growth, explosions, transformations. One cloud of beads becomes each thing in turn.',
  fonts: ['Space Grotesk:wght@500;700'],
  duration: 11,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'A kernel holds a drop of water' },
    { t: 2.7, label: 'Heat turns the water into steam' },
    { t: 5.4, label: 'Pressure builds until the hull bursts' },
    { t: 8.1, label: 'The starch puffs into foam' },
  ],
  facts: ['about 14% water', '180 °C', '9 atmospheres'],
  count: 60000,

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Space Grotesk', N = this.count;
    scene.background = new T.Color('#e9e4da'); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 6, target: [0, 1.8, 0] }); L.key.position.set(-5, 8, 7); L.key.intensity = 2.4; L.amb.intensity = 1.0; S.scene.environmentIntensity = 1.0;
    const wall = new T.Mesh(new T.PlaneGeometry(40, 24), new T.MeshStandardMaterial({ roughness: 1, map: K.canvasTex(1024, 512, (g, r, w, h) => { g.fillStyle = '#e9e4da'; g.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? 255 : 120},${r() < 0.5 ? 250 : 110},${r() < 0.5 ? 240 : 100},${r.range(0.03, 0.08)})`; g.fillRect(r() * w, r() * h, r.range(1, 4), r.range(1, 4)); } }, 2) }));
    wall.position.set(0, 4, -3); wall.receiveShadow = true; scene.add(wall);
    const floor = new T.Mesh(new T.PlaneGeometry(40, 20), new T.MeshStandardMaterial({ color: '#ddd6ca', roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.6; floor.receiveShadow = true; scene.add(floor);
    // targets for each bead, as closed-form shapes
    const rr = K.rng(7), U = new Float32Array(N * 4); for (let i = 0; i < N * 4; i++) U[i] = rr();
    const C = new T.Vector3(0, 1.9, 0);
    const kernel = (i, out) => { // a teardrop: hull near the surface, starch inside, water in the middle
      const u = U[i * 4], v = U[i * 4 + 1], w = U[i * 4 + 2], role = U[i * 4 + 3];
      const th = u * Math.PI * 2, ph = Math.acos(2 * v - 1), rad = role < 0.35 ? 1 : role < 0.9 ? Math.cbrt(w) * 0.92 : Math.cbrt(w) * 0.32;
      let x = Math.sin(ph) * Math.cos(th), y = Math.cos(ph), z = Math.sin(ph) * Math.sin(th);
      const taper = 1 - 0.45 * Math.max(0, -y); x *= taper; z *= taper;
      if (z > 0.1) z = -z * 0.6; // a cutaway: the front of the kernel is open, so the inside shows
      return out.set(x * rad * 1.15, y * rad * 1.45 - (y < 0 ? 0.15 * y * y : 0), z * rad * 0.9).add(C);
    };
    const roleOf = i => U[i * 4 + 3] < 0.35 ? 0 : U[i * 4 + 3] < 0.9 ? 1 : 2; // 0 hull, 1 starch, 2 water
    const LOBES = [[0, 0.2, 0, 1.15], [0.95, 0.75, 0.2, 0.85], [-0.9, 0.65, -0.1, 0.9], [0.3, 1.25, -0.3, 0.8], [-0.35, -0.55, 0.3, 0.8], [0.8, -0.35, -0.4, 0.7], [-0.7, 1.35, 0.4, 0.62], [0.05, 0.7, 0.85, 0.6]];
    const popcorn = (i, out) => { // white foam lobes; the hull ends as brown flakes at the base
      const u = U[i * 4], v = U[i * 4 + 1], w = U[i * 4 + 2], role = roleOf(i);
      if (role === 0 && U[i * 4 + 3] < 0.06) return out.set(-0.2 + 0.5 * (u - 0.5), -0.75 + 0.1 * v, 0.3 + 0.4 * (w - 0.5)).add(C);
      const lb = LOBES[Math.floor(u * 997) % LOBES.length], th = v * 6.283, ph = Math.acos(2 * w - 1), r = lb[3] * Math.cbrt(0.35 + 0.65 * ((u * 7.3) % 1)) * 1.05;
      return out.set(lb[0] + r * Math.sin(ph) * Math.cos(th), lb[1] + r * Math.cos(ph), lb[2] + r * Math.sin(ph) * Math.sin(th)).multiplyScalar(0.92).add(C).add(new T.Vector3(0, 0.1, 0));
    };
    // beads
    const beads = new T.InstancedMesh(new T.IcosahedronGeometry(0.028, 0), new T.MeshStandardMaterial({ roughness: 0.18, metalness: 0.0, envMapIntensity: 1.2 }), N);
    beads.frustumCulled = false; beads.castShadow = true; scene.add(beads);
    beads.instanceColor = new T.InstancedBufferAttribute(new Float32Array(N * 3), 3);
    const COL = { hull: new T.Color('#c9862e'), starch: new T.Color('#f2e2a8'), water: new T.Color('#4aa8ff'), steam: new T.Color('#e8f4ff'), foam: new T.Color('#fbf6ea'), flake: new T.Color('#8a4f1c') };
    // a heat glow under the kernel, fact tags
    const heat = new T.PointLight('#ff6a2a', 0, 6); heat.position.set(0, 0.0, 0.8); scene.add(heat);
    const coil = new T.Mesh(new T.TorusGeometry(1.1, 0.06, 8, 48), new T.MeshStandardMaterial({ color: '#3a2a22', emissive: '#ff4a1a', emissiveIntensity: 0 })); coil.rotation.x = Math.PI / 2; coil.position.set(0, -0.45, 0); scene.add(coil);
    const tags = this.facts.map((f, i) => { const l = K.label(f, { font: F, weight: 700, px: 60, color: '#ffffff', bg: ['#2f7fd8', '#e0592a', '#7a3fb0'][i], radius: 'pill', pad: 0.35, height: 0.34 }); scene.add(l); return l; });
    const tagAt = [[2.0, 2.2, 0.4], [-2.2, 0.4, 0.4], [-2.0, 3.3, 0.6]];
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 84, color: '#2a2622', height: 0.46 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [1.2, 2.6, 8.0], look: [0, 1.9, 0] },
      { t: 5.4, pos: [-1.0, 2.4, 7.2], look: [0, 1.9, 0] },
      { t: 11, pos: [0.8, 2.9, 9.4], look: [0, 2.1, 0] },
    ], S.camera);
    const A = new T.Vector3(), Bv = new T.Vector3(), c = new T.Color();
    return (t, realT) => {
      cam(t);
      const m = beads.instanceMatrix.array, ca = beads.instanceColor.array;
      const steam = K.prog(t, B[1] + 0.3, B[1] + 1.8), swell = K.prog(t, B[2], B[2] + 1.2, 'in'), burstT = B[2] + 1.3, form = (i) => K.prog(t, B[3] - 0.2 + U[i * 4 + 1] * 0.9, B[3] + 0.9 + U[i * 4 + 1] * 0.9, 'inOut');
      const shake = 0.012 * K.prog(t, B[1], B[1] + 1) + 0.03 * swell;
      for (let i = 0; i < N; i++) {
        const role = roleOf(i), u = U[i * 4], v = U[i * 4 + 1], w = U[i * 4 + 2];
        kernel(i, A);
        // steam: water beads spread through the inside and jitter
        if (role === 2) { const sp = 1 + 1.6 * steam; A.sub(C).multiplyScalar(sp).add(C); }
        // swell before the burst
        A.sub(C).multiplyScalar(1 + 0.18 * swell).add(C);
        const j = shake * Math.sin(realT * 47 + i * 1.7); A.x += j; A.y += shake * Math.sin(realT * 53 + i * 2.3); A.z += j * 0.7;
        if (t > burstT) { // ballistic burst outward, then pour into the popcorn
          const dt = Math.min(t - burstT, 0.9), dir = Bv.copy(A).sub(C).normalize(), sp = 1.0 + 1.0 * w;
          A.addScaledVector(dir, sp * dt); A.y += 1.2 * dt - 2.4 * dt * dt;
          popcorn(i, Bv); A.lerp(Bv, form(i));
        }
        const s = 1;
        const k = i * 16; m[k] = s; m[k + 5] = s; m[k + 10] = s; m[k + 12] = A.x; m[k + 13] = A.y; m[k + 14] = A.z; m[k + 15] = 1;
        // colour
        if (role === 0) c.copy(COL.hull); else if (role === 1) c.copy(COL.starch); else c.copy(COL.water).lerp(COL.steam, steam);
        if (t > burstT) { const f = form(i); if (role === 0 && U[i * 4 + 3] < 0.06) c.lerp(COL.flake, f); else c.lerp(COL.foam, f); }
        c.offsetHSL(0, 0, (u - 0.5) * 0.08);
        ca[i * 3] = c.r; ca[i * 3 + 1] = c.g; ca[i * 3 + 2] = c.b;
      }
      beads.instanceMatrix.needsUpdate = true; beads.instanceColor.needsUpdate = true;
      const hot = K.prog(t, B[1], B[1] + 0.8) * (1 - K.prog(t, B[3], B[3] + 1));
      heat.intensity = 6 * hot * (0.85 + 0.15 * Math.sin(realT * 6)); coil.material.emissiveIntensity = 2.2 * hot;
      tags.forEach((l, i) => { const a = K.prog(t, B[i] + 0.4, B[i] + 0.8, 'back') * (1 - K.prog(t, B[i + 1] - 0.3, B[i + 1])); l.visible = a > 0.01; l.scale.setScalar(Math.max(0.001, a)); l.position.set(...tagAt[i]); l.lookAt(S.camera.position); });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.06 });
    for (let i = 0; i < 8; i++) k.play('glass', { t: 0.2 + i * 0.12, gain: 0.08, pitch: 1.5 + (i % 4) * 0.2 });
    k.play('hum', { t: B[1], gain: 0.25, pitch: 0.9, dur: 3.5 });
    for (let i = 0; i < 10; i++) k.play('bubble', { t: B[1] + 0.4 + i * 0.22, gain: 0.15, pitch: 0.8 + (i % 5) * 0.15 });
    k.play('riser', { t: B[2], gain: 0.25, pitch: 0.7, dur: 1.1 });
    k.play('pop', { t: B[2] + 1.3, gain: 0.8, pitch: 0.55 }); k.play('thud', { t: B[2] + 1.3, gain: 0.5, pitch: 1.0 });
    for (let i = 0; i < 16; i++) k.play('glass', { t: B[2] + 1.35 + i * 0.05, gain: 0.12, pitch: 1.2 + (i % 5) * 0.2, pan: (i % 2 ? 0.5 : -0.5) });
    k.play('swish', { t: B[3] - 0.1, gain: 0.3, pitch: 1.0, dur: 1.6 });
    for (let i = 0; i < 4; i++) k.play('pop', { t: B[3] + 1.4 + i * 0.35, gain: 0.25, pitch: 0.9 + i * 0.15 });
    k.play('chime', { t: B[3] + 1.8, gain: 0.2, pitch: 1.0, music: true });
  },
  post: null,
};
