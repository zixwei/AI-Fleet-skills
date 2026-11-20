window.STYLES = window.STYLES || {};
STYLES['infinite-zoom'] = {
  id: 'infinite-zoom', name: 'Infinite Zoom',
  family: 'Strange worlds',
  use: 'Story',
  look: 'One continuous dive with no cuts. Each scene is a shallow diorama, and the next scene waits inside one small object of it: a lit window in a city, a cup on a table, a grain in the cup, the crystal of the grain, one atom.',
  motion: 'The camera never moves; the world grows around one fixed point at a steady rate. Each scene swells past the edges of the frame while the next one opens out of its small object.',
  shownHere: 'Powers of ten, from a city to an atom: a city about a kilometre across; one window about a metre; a cup about ten centimetres; a sugar grain about a millimetre; its crystal about a nanometre; one atom about a tenth of a nanometre.',
  goodFor: 'Scale and nesting: zooming from the big picture to the detail, systems inside systems, "what is this made of" stories.',
  fonts: ['Space Grotesk:wght@500;700'],
  duration: 12,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'A city: about 1 km across' },
    { t: 2.2, label: 'One window: about 1 m' },
    { t: 4.4, label: 'A cup: about 10 cm' },
    { t: 6.6, label: 'A sugar grain: about 1 mm' },
    { t: 8.8, label: 'Its crystal, then one atom: 0.1 nm' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Space Grotesk', BE = this.beats;
    scene.background = new T.Color('#0a0c14'); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#ffffff', '#404050', 1.2)); const key = new T.DirectionalLight('#ffffff', 1.4); key.position.set(2, 4, 6); scene.add(key);
    const basic = (c, o = {}) => new T.MeshBasicMaterial(Object.assign({ color: c }, o)), std = (c, r = 0.6, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const SCALE = 12; // each scene is 1/12 of the one before it
    const levels = [];
    const level = parent => { const g = new T.Group(); if (parent) { g.scale.setScalar(1 / SCALE); g.position.z = -0.01; parent.add(g); } else scene.add(g); levels.push(g); return g; };
    const plane = (g, w, h, mat, x, y, z) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), mat); m.position.set(x, y, z); g.add(m); return m; };
    const rr = K.rng(92);
    // 0: a city at dusk; the window at the origin is an opening
    const L0 = level(null);
    plane(L0, 40, 30, basic('#2a3a6a'), 0, 0, -3);
    for (let i = 0; i < 26; i++) { const w = rr.range(0.8, 1.8), h = rr.range(1.5, 5), x = rr.range(-9, 9); const m = plane(L0, w, h, basic(`hsl(225, 25%, ${rr.range(14, 22)}%)`), x, -2.5 + h / 2, -2 + rr.range(0, 0.5)); for (let k = 0; k < 10; k++) if (rr() < 0.5) plane(L0, 0.12, 0.12, basic('#ffd890'), x + rr.range(-w / 2 + 0.15, w / 2 - 0.15), -2.5 + rr.range(0.3, h - 0.3), m.position.z + 0.01); }
    const facade = new T.Shape([new T.Vector2(-1.4, -3), new T.Vector2(1.4, -3), new T.Vector2(1.4, 1.6), new T.Vector2(-1.4, 1.6)]); const hole = new T.Path(); hole.moveTo(-0.17, -0.12); hole.lineTo(0.17, -0.12); hole.lineTo(0.17, 0.12); hole.lineTo(-0.17, 0.12); hole.lineTo(-0.17, -0.12); facade.holes.push(hole);
    const fm = new T.Mesh(new T.ShapeGeometry(facade), basic('#3a4058')); fm.position.z = 0.0; L0.add(fm);
    for (let r = 0; r < 9; r++) for (let c = 0; c < 6; c++) { const x = -1.1 + c * 0.44, y = -2.6 + r * 0.44; if (Math.abs(x) < 0.25 && Math.abs(y) < 0.2) continue; plane(L0, 0.28, 0.2, basic(rr() < 0.55 ? '#ffd890' : '#1a1e2a'), x, y, 0.01); }
    // 1: a room behind the window, a cup on the table at the origin
    const L1 = level(L0);
    plane(L1, 6, 4, basic('#d8b890'), 0, 0.6, -0.6); plane(L1, 6, 1.2, basic('#8a5a3a'), 0, -0.35, -0.3);
    plane(L1, 1.2, 1.0, basic('#2a3a6a'), -1.6, 1.3, -0.55); const lamp = plane(L1, 0.5, 0.35, basic('#ffe8b0'), 1.6, 1.4, -0.5);
    const cupS = new T.Shape(); cupS.moveTo(-0.16, 0.12); cupS.lineTo(0.16, 0.12); cupS.lineTo(0.13, -0.16); cupS.lineTo(-0.13, -0.16); cupS.lineTo(-0.16, 0.12);
    const cupHole = new T.Path(); cupHole.moveTo(-0.11, 0.08); cupHole.lineTo(0.11, 0.08); cupHole.lineTo(0.11, -0.08); cupHole.lineTo(-0.11, -0.08); cupHole.lineTo(-0.11, 0.08); cupS.holes.push(cupHole);
    const cup = new T.Mesh(new T.ShapeGeometry(cupS), basic('#f4f4f0')); L1.add(cup); const handle = new T.Mesh(new T.TorusGeometry(0.07, 0.02, 6, 16, Math.PI), basic('#f4f4f0')); handle.rotation.z = -Math.PI / 2; handle.position.set(0.17, 0, 0); L1.add(handle);
    // 2: inside the cup: dark tea with white grains; one grain at the origin
    const L2 = level(L1);
    plane(L2, 6, 4, basic('#6a3a1a'), 0, 0, -0.5);
    for (let i = 0; i < 40; i++) { const s = rr.range(0.15, 0.3), m = plane(L2, s, s, basic('#f8f4ea'), rr.range(-2.8, 2.8), rr.range(-1.8, 1.8), -0.4 + rr() * 0.1); m.rotation.z = rr() * 3; if (Math.abs(m.position.x) < 0.5 && Math.abs(m.position.y) < 0.5) m.visible = false; }
    const grain = plane(L2, 0.3, 0.3, basic('#ffffff', { transparent: true }), 0, 0, 0); grain.rotation.z = 0.3;
    // 3: the grain's crystal: a lattice of atoms; one at the origin
    const L3 = level(L2);
    plane(L3, 6, 4, basic('#14183a'), 0, 0, -0.4);
    for (let i = -7; i <= 7; i++) for (let j = -4; j <= 4; j++) { if (i === 0 && j === 0) continue; const m = new T.Mesh(new T.CircleGeometry((i + j) % 2 ? 0.12 : 0.17, 24), basic((i + j) % 2 ? '#7ab8ff' : '#ff8a6a')); m.position.set(i * 0.38, j * 0.38, -0.2); L3.add(m); }
    for (let i = -7; i <= 7; i++) plane(L3, 0.02, 3.4, basic('#3a4a8a'), i * 0.38, 0, -0.3); for (let j = -4; j <= 4; j++) plane(L3, 5.6, 0.02, basic('#3a4a8a'), 0, j * 0.38, -0.3);
    const atomDot = new T.Mesh(new T.CircleGeometry(0.17, 24), basic('#ff8a6a', { transparent: true })); L3.add(atomDot);
    // 4: one atom: a nucleus and electron orbits
    const L4 = level(L3);
    plane(L4, 6, 4, basic('#06070e'), 0, 0, -0.3);
    const nucleus = new T.Group(); L4.add(nucleus); for (let i = 0; i < 12; i++) { const m = new T.Mesh(new T.CircleGeometry(0.07, 16), basic(i % 2 ? '#ff6a4a' : '#9aa0b0')); m.position.set(rr.range(-0.1, 0.1), rr.range(-0.1, 0.1), i * 0.001); nucleus.add(m); }
    const orbits = [0, 1, 2].map(i => { const m = new T.Mesh(new T.RingGeometry(1.1, 1.13, 96), basic('#7ab8ff', { side: T.DoubleSide, transparent: true, opacity: 0.7 })); m.scale.set(1, 0.38, 1); m.rotation.z = i * Math.PI / 3; L4.add(m); const e = new T.Mesh(new T.CircleGeometry(0.06, 16), basic('#cfe8ff')); L4.add(e); return { m, e, i }; });
    // labels inside each scene, near the top of the frame at its own scale
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 66, color: '#eef4ff', bg: 'rgba(8,10,20,0.82)', radius: 12, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    S.camera.position.set(0, 0, 9); S.camera.lookAt(0, 0, 0);
    const zAt = t => 4.05 * K.clamp(t / 11.2);
    return (t, realT) => {
      const z = zAt(t);
      levels[0].scale.setScalar(Math.pow(SCALE, z));
      // each scene sits a fixed tiny distance (0.02 world units) behind its parent, whatever the zoom, so depth never piles up
      levels.forEach((g, k) => { if (k) g.position.z = -0.02 / Math.pow(SCALE, z - (k - 1)); });
      // hide scenes that are far too big (they would reach the camera) or still too small to matter
      levels.forEach((g, k) => { const s = Math.pow(SCALE, z - k); g.children.forEach(c => { if (!levels.includes(c)) c.visible = s < 40 && s > 0.004; }); });
      // the small object that holds the next scene fades away as that scene opens out of it
      grain.material.opacity = 1 - K.prog(Math.pow(SCALE, z - 3), 0.12, 0.35); atomDot.material.opacity = 1 - K.prog(Math.pow(SCALE, z - 4), 0.12, 0.35);
      lamp.material.color.setHSL(0.12, 1, 0.8 + 0.05 * Math.sin(realT * 3));
      orbits.forEach(o => { const a = realT * (1.5 + o.i * 0.4) + o.i * 2; const p = new T.Vector3(Math.cos(a) * 1.115, Math.sin(a) * 1.115 * 0.38, 0.01).applyAxisAngle(new T.Vector3(0, 0, 1), o.i * Math.PI / 3); o.e.position.copy(p); });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('space', { gain: 0.05 }); k.play('riser', { t: 0.2, gain: 0.08, pitch: 0.6, dur: 11.0 });
    k.play('whoosh', { t: 0.1, gain: 0.12, pitch: 0.4, dur: 2.0 });
    B.slice(1).forEach((b, i) => { k.play('whoosh', { t: b - 0.2, gain: 0.15, pitch: 0.5 + i * 0.15, dur: 1.2 }); k.play('blip', { t: b + 0.1, gain: 0.12, pitch: 1.0 + i * 0.25 }); k.play('pluck', { t: b + 0.2, gain: 0.1, pitch: 1 + i * 0.12, music: true }); });
    k.play('sparkle', { t: B[4] + 1.6, gain: 0.2 }); k.play('chime', { t: B[4] + 2.2, gain: 0.15, pitch: 1.5, music: true });
  },
  post: null,
};
