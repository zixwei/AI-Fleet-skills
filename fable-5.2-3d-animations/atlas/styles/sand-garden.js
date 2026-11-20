window.STYLES = window.STYLES || {};
STYLES['sand-garden'] = {
  id: 'sand-garden', name: 'Sand Garden',
  family: 'Living and elemental',
  use: 'Explainer',
  look: 'A zen sand tray seen from above at a low angle. The sand is raked in straight lines and in rings around a few stones. A low evening sun throws long shadows and makes every groove stand out.',
  motion: 'A wooden rake travels through the sand and leaves a new pattern behind it. Lines change into a path, the path closes into a loop, and each new pass cuts the groove deeper.',
  shownHere: 'How habits form a loop: a cue starts a craving, the craving starts a response, the response brings a reward, and every turn of the loop cuts the habit deeper.',
  goodFor: 'Calm explanations of cycles, routines, mindfulness and slow change: anything you draw as a path that repeats.',
  fonts: ['Cormorant Garamond:wght@600;700'],
  duration: 11,
  samples: 4,
  // CONTENT: the stones of the loop, in order
  stones: ['Cue', 'Craving', 'Response', 'Reward'],
  beats: [
    { t: 0.0, label: 'A cue starts the loop' },
    { t: 2.7, label: 'A craving, then a response' },
    { t: 5.4, label: 'A reward closes the loop' },
    { t: 8.1, label: 'Each pass cuts it deeper' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Cormorant Garamond';
    scene.background = new T.Color('#2e241c'); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#c8b8a8', '#2a2018', 0.55));
    const sun = new T.DirectionalLight('#ffbf86', 3.2); sun.position.set(-9, 2.6, -3); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 0.5, far: 30 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; scene.add(sun);
    const W = 8.4, D = 6.4, Rp = 1.75, TAU = Math.PI * 2, th0 = Math.PI / 2;
    // the tray: a wooden frame and a dark floor
    const wood = new T.MeshStandardMaterial({ color: '#6a4a30', roughness: 0.7 });
    [[0, D / 2 + 0.2, W + 0.8, 0.4], [0, -D / 2 - 0.2, W + 0.8, 0.4]].forEach(([x, z, w, d]) => { const m = new T.Mesh(new T.BoxGeometry(w, 0.35, d), wood); m.position.set(x, 0.1, z); m.castShadow = m.receiveShadow = true; scene.add(m); });
    [[W / 2 + 0.2, 0], [-W / 2 - 0.2, 0]].forEach(([x, z]) => { const m = new T.Mesh(new T.BoxGeometry(0.4, 0.35, D), wood); m.position.set(x, 0.1, z); m.castShadow = m.receiveShadow = true; scene.add(m); });
    const floor = new T.Mesh(new T.PlaneGeometry(60, 60), new T.MeshStandardMaterial({ color: '#3a2c20', roughness: 0.9 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.08; floor.receiveShadow = true; scene.add(floor);
    // the stones, outside the loop
    const rr = K.rng(5), stonePos = this.stones.map((_, i) => { const a = th0 + i * TAU / 4; return [Math.cos(a) * 2.95, Math.sin(a) * 2.95 * 0.86]; });
    const stoneMat = new T.MeshStandardMaterial({ color: '#4a4846', roughness: 0.85 });
    stonePos.forEach(([x, z], i) => { const g = new T.IcosahedronGeometry(0.42, 3), p = g.attributes.position, ph = rr() * 6; for (let j = 0; j < p.count; j++) { const x = p.getX(j), y = p.getY(j), z = p.getZ(j), f = 1 + 0.1 * Math.sin(x * 7 + ph) * Math.cos(z * 6 - ph) + 0.06 * Math.sin(y * 9 + ph); p.setXYZ(j, x * f * 1.1, y * f * 0.6, z * f * 0.95); } g.computeVertexNormals(); const m = new T.Mesh(g, stoneMat); m.position.set(x, 0.12, z); m.rotation.y = i; m.castShadow = m.receiveShadow = true; scene.add(m); });
    // the sand: a height field; each vertex knows its distance to the path and its place along it
    const NX = 210, NZ = 160, geo = new T.PlaneGeometry(W, D, NX, NZ); geo.rotateX(-Math.PI / 2);
    const P = geo.attributes.position, n = P.count, bg = new Float32Array(n), ps = new Float32Array(n), pd = new Float32Array(n);
    const wave = (u) => Math.cos(TAU * u / 0.28);
    for (let i = 0; i < n; i++) {
      const x = P.getX(i), z = P.getZ(i);
      let h = 0.03 * wave(z), near = 9; stonePos.forEach(([sx, sz]) => { near = Math.min(near, Math.hypot(x - sx, z - sz)); });
      if (near < 1.15) h = K.lerp(0.03 * wave(near - 0.5), h, K.clamp((near - 0.95) / 0.2));
      bg[i] = near < 0.38 ? 0.0 : h;
      const ez = z / 0.86, r = Math.hypot(x, ez), th = Math.atan2(ez, x);
      pd[i] = r - Rp; ps[i] = (((th - th0) % TAU) + TAU) % TAU / TAU;
    }
    const sand = new T.Mesh(geo, new T.MeshStandardMaterial({ color: '#dccaa6', roughness: 1 })); sand.receiveShadow = true; sand.castShadow = true; scene.add(sand);
    // the rake: a bar with tines and a handle
    const rake = new T.Group(); scene.add(rake);
    const bar = new T.Mesh(new T.BoxGeometry(0.1, 0.08, 1.0), wood); bar.position.y = 0.16; rake.add(bar);
    for (let j = -2; j <= 2; j++) { const tn = new T.Mesh(new T.BoxGeometry(0.04, 0.16, 0.04), wood); tn.position.set(0, 0.06, j * 0.22); rake.add(tn); }
    const handle = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 3.0, 8), new T.MeshStandardMaterial({ color: '#9a7a54', roughness: 0.6 })); handle.rotation.z = 1.1; handle.position.set(-1.33, 0.83, 0); rake.add(handle);
    rake.traverse(o => { o.castShadow = true; });
    // stone names and titles
    const names = this.stones.map((s, i) => { const l = K.label(s, { font: F, weight: 700, px: 64, color: '#f6ead6', bg: 'rgba(30,22,16,0.7)', radius: 10, pad: 0.3, height: 0.3 }); l.position.set(stonePos[i][0], 0.7, stonePos[i][1] + 0.7); scene.add(l); return l; });
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 76, color: '#fbf1e0', bg: 'rgba(30,22,16,0.7)', radius: 10, pad: 0.35, height: 0.42 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [0.4, 9.6, 8.6], look: [0, 0, -0.3] },
      { t: 5.4, pos: [-0.8, 10.0, 8.2], look: [0, 0, -0.3] },
      { t: 11, pos: [0.5, 11.0, 7.2], look: [0, 0, -0.3] },
    ], S.camera);
    // how far the rake has gone, in laps
    const laps = t => t < B[1] ? 0 : t < B[2] ? 0.5 * K.prog(t, B[1] + 0.2, B[2] - 0.1, 'inOut') : t < B[3] ? 0.5 + 0.5 * K.prog(t, B[2] + 0.1, B[3] - 0.1, 'inOut') : 1 + K.prog(t, B[3] + 0.1, 10.6, 'inOut');
    return (t, realT) => {
      cam(t);
      const L = laps(t), depth = 1 + 0.9 * K.clamp(L - 1);
      for (let i = 0; i < n; i++) {
        const d = pd[i], band = K.clamp((0.62 - Math.abs(d)) / 0.12);
        let h = bg[i];
        if (band > 0) { const drawn = L >= 1 ? 1 : K.clamp((L - ps[i]) / 0.015); h = K.lerp(h, -0.012 * depth + 0.03 * depth * wave(d + 0.14), band * drawn); }
        P.setY(i, h);
      }
      P.needsUpdate = true; geo.computeVertexNormals();
      // the rake sits on the path at the current lap position, bar across the path
      const s = L >= 2 ? 0 : L % 1, a = th0 + s * TAU;
      rake.position.set(Math.cos(a) * Rp, 0, Math.sin(a) * Rp * 0.86); rake.rotation.y = -a - Math.PI / 2;
      const lift = (t < B[1] + 0.2 || t > 10.6) ? 0.25 : 0; rake.position.y = lift;
      const at = Math.round(s * 4) % 4;
      names.forEach((l, i) => { l.lookAt(S.camera.position); l.material.opacity = (L >= 1 || i <= Math.floor(L * 4 + 0.05)) ? 1 : 0.35; l.scale.setScalar(i === at && t > B[1] ? 1.12 : 1); });
      titles.forEach((l, i) => { const a2 = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a2 > 0.01; l.material.opacity = a2; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.05 });
    k.play('wood', { t: 0.4, gain: 0.3, pitch: 0.8 }); k.play('bell', { t: 0.6, gain: 0.2, pitch: 0.5, music: true });
    k.play('paper', { t: B[1] + 0.25, gain: 0.25, pitch: 0.4, dur: 2.3 }); k.play('bell', { t: B[1] + 1.2, gain: 0.12, pitch: 0.6, music: true }); k.play('bell', { t: B[2] - 0.2, gain: 0.12, pitch: 0.67, music: true });
    k.play('paper', { t: B[2] + 0.15, gain: 0.25, pitch: 0.4, dur: 2.4 }); k.play('bell', { t: B[3] - 0.2, gain: 0.2, pitch: 0.5, music: true });
    k.play('paper', { t: B[3] + 0.15, gain: 0.3, pitch: 0.33, dur: 2.4 }); k.play('wood', { t: 10.6, gain: 0.3, pitch: 0.7 }); k.play('bell', { t: 10.7, gain: 0.25, pitch: 0.5, music: true });
  },
  post: null,
};
