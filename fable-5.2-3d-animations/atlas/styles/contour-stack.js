window.STYLES = window.STYLES || {};
STYLES['contour-stack'] = {
  id: 'contour-stack', name: 'Contour Stack',
  family: 'Diagrams with depth',
  use: 'Explainer',
  look: 'A landscape built as a topographic model from laser-cut plywood layers: pale birch tops, burnt dark edges on every cut, a blue river in the lowest layer, small brass pins with paper flags.',
  motion: 'Layers drop in from above one by one and settle. As the story moves on, layers are cut away where the river runs, so the valley gets deeper step by step.',
  shownHere: 'How a river carves a canyon: a river crosses a high plateau, water and sand cut down through the rock, each layer took a very long time, and the result is a canyon about 1.8 km deep.',
  goodFor: 'Terrain, elevation, erosion and any data that has levels: maps, depth, altitude, layered totals.',
  fonts: ['Bitter:wght@600;700'],
  duration: 11,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'A river crosses a high plateau' },
    { t: 2.7, label: 'Water and sand cut down into the rock' },
    { t: 5.4, label: 'Each layer took a very long time' },
    { t: 8.1, label: 'Today: a canyon 1.8 km deep' },
  ],
  pins: ['TOP: 270 million years old', 'RIVER: today', '1.8 km'],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Bitter';
    scene.background = new T.Color('#e8e2d6'); scene.fog = new T.Fog('#e8e2d6', 20, 40); scene.add(S.camera);
    const L = K.lights(S, 'sun', { size: 8, target: [0, 0.8, 0] }); L.key.position.set(-7, 9, 4); L.key.intensity = 2.6; L.key.shadow.radius = 3; L.amb.intensity = 0.9;
    const table = new T.Mesh(new T.PlaneGeometry(60, 40), new T.MeshStandardMaterial({ color: '#cfc6b6', roughness: 1 })); table.rotation.x = -Math.PI / 2; table.position.y = -0.02; table.receiveShadow = true; scene.add(table);
    const W = 12, D = 8, NX = 220, NZ = 150, DL = 0.24, NL = 9;
    const riverZ = x => 0.9 * Math.sin(x * 0.55) + 0.35 * Math.sin(x * 1.3 + 1);
    const base = (x, z) => 1.15 + 0.35 * (1 - Math.abs(z) / (D / 2)) + 0.14 * Math.sin(x * 0.7 + z * 0.4) * Math.cos(z * 0.9) + 0.05 * Math.sin(x * 1.7 - z * 1.3);
    const hAt = (x, z, depth) => { const dz = z - riverZ(x), w = 0.55 + 0.35 * depth; return Math.max(0.12, base(x, z) + 0.95 - depth * Math.exp(-(dz * dz) / (w * w)) * 1.0 - 0.3 * depth * Math.exp(-(dz * dz) / (w * w * 4))); };
    const geo = new T.PlaneGeometry(W, D, NX, NZ).rotateX(-Math.PI / 2);
    const P = geo.attributes.position, cols = new Float32Array(P.count * 3); geo.setAttribute('color', new T.BufferAttribute(cols, 3));
    const grain = K.canvasTex(1024, 1024, (g, r, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(150,110,60,${r.range(0.04, 0.12)})`; g.lineWidth = r.range(1, 4); const y = r() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + r.range(-30, 30), w * 0.7, y + r.range(-30, 30), w, y + r.range(-20, 20)); g.stroke(); } }, 3);
    const land = new T.Mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, map: grain, roughness: 0.85 })); land.castShadow = land.receiveShadow = true; scene.add(land);
    // skirt: the layered side of the model, as a box underneath
    const skirt = new T.Mesh(new T.BoxGeometry(W + 0.3, 0.12, D + 0.3), new T.MeshStandardMaterial({ color: '#b08a5a', roughness: 0.9 })); skirt.position.y = -0.065; scene.add(skirt);
    // the river: a ribbon at the bottom of the cut
    const rgeo = new T.PlaneGeometry(W, 1, 160, 1), rp = rgeo.attributes.position;
    const flowTex = K.canvasTex(256, 64, (g, r, w, h) => { g.fillStyle = '#3f8fd0'; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${r.range(0.1, 0.35)})`; g.fillRect(r() * w, r() * h, r.range(10, 40), 2); } });
    flowTex.wrapS = T.RepeatWrapping; flowTex.repeat.set(6, 1);
    const river = new T.Mesh(rgeo, new T.MeshStandardMaterial({ map: flowTex, roughness: 0.2, emissive: '#1f5f9a', emissiveIntensity: 0.35, side: T.DoubleSide })); scene.add(river);
    // brass pins with paper flags
    const brass = new T.MeshStandardMaterial({ color: '#d4a548', metalness: 1, roughness: 0.3 });
    const pin = (txt) => { const g = new T.Group(); const s = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 1.1, 8), brass); s.position.y = 0.55; const hd = new T.Mesh(new T.SphereGeometry(0.06, 12, 8), brass); hd.position.y = 1.1; const fl = K.label(txt, { font: F, weight: 700, px: 56, color: '#2a2018', bg: '#fbf7ee', radius: 6, pad: 0.3, height: 0.26, lit: true }); fl.position.set(fl.userData.w / 2 + 0.03, 0.92, 0); g.add(s, hd, fl); g.traverse(o => { o.castShadow = true; }); scene.add(g); return g; };
    const pins = this.pins.map(pin);
    const pinAt = [[-3.6, 2.6], [1.0, null], [3.4, null]];
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 84, color: '#2a2018', height: 0.46 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [-5.5, 8.5, 10.5], look: [0, 0.6, 0] },
      { t: 5.4, pos: [3.5, 7.0, 10.5], look: [0.5, 0.6, 0] },
      { t: 8.1, pos: [3.0, 6.0, 9.5], look: [0.0, 0.6, 0] },
      { t: 11, pos: [1.5, 7.5, 10.5], look: [0.0, 0.5, 0] },
    ], S.camera);
    const birch = new T.Color('#f0dfbf'), burnt = new T.Color('#3b2416'), ply = new T.Color('#c9a87a'), c = new T.Color();
    const lvl = new Int16Array(P.count), hs = new Float32Array(P.count);
    for (let i = 0; i < P.count; i++) hs[i] = 0;
    return (t, realT) => {
      cam(t);
      const depth = K.lerp(0.25, 1.9, K.prog(t, B[1], B[3] + 1.0, 'inOut'));
      for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i); const h = hAt(x, z, depth); lvl[i] = Math.min(NL, Math.floor(h / DL)); }
      for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) {
        const n = j * (NX + 1) + i, L0 = lvl[n];
        const drop = Math.max(0, (L0 * 0.08 - 0.5) - t) * 4; // layers drop in from above at the start
        P.setY(n, L0 * DL + drop);
        let edge = false; if (i > 0 && lvl[n - 1] < L0) edge = true; if (i < NX && lvl[n + 1] < L0) edge = true; if (j > 0 && lvl[n - NX - 1] < L0) edge = true; if (j < NZ && lvl[n + NX + 1] < L0) edge = true;
        c.copy(edge ? burnt : birch); if (!edge && L0 % 2) c.lerp(ply, 0.25);
        cols[n * 3] = c.r; cols[n * 3 + 1] = c.g; cols[n * 3 + 2] = c.b;
      }
      P.needsUpdate = true; geo.attributes.color.needsUpdate = true; geo.computeVertexNormals();
      // river follows the lowest cut
      for (let i = 0; i < rp.count; i++) { const x = rp.getX(i) || 0, side = i <= 160 ? 1 : -1; const u = (i % 161) / 160, xx = -W / 2 + u * W, z = riverZ(xx) + side * 0.13; rp.setXYZ(i, xx, Math.floor(hAt(xx, riverZ(xx), depth) / DL) * DL + 0.1, z); }
      rp.needsUpdate = true; rgeo.computeVertexNormals(); flowTex.offset.x = -realT * 0.3;
      // pins: the plateau top, the river, and the depth
      const pa = [[-3.6, 2.6], [1.0, riverZ(1.0)], [3.0, riverZ(3.0) + 0.9]];
      pins.forEach((p, i) => { const [x, z] = pa[i]; const y = Math.floor(hAt(x, z, depth) / DL) * DL; const show = K.prog(t, [0.6, B[2] + 0.3, B[3] + 0.4][i], [1.0, B[2] + 0.7, B[3] + 0.8][i], 'back'); p.position.set(x, y + (1 - show) * 2, z); p.visible = show > 0; p.rotation.y = Math.atan2(S.camera.position.x - x, S.camera.position.z - z) - Math.PI / 2 + 1.0; });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('water', { gain: 0.06 });
    for (let i = 0; i < 9; i++) k.play('wood', { t: Math.max(0.02, i * 0.08 - 0.5) + 0.05, gain: 0.25, pitch: 0.8 + i * 0.05 });
    for (let i = 0; i < 8; i++) k.play('wood', { t: B[1] + 0.3 + i * 0.6, gain: 0.15, pitch: 0.6 + (i % 3) * 0.1 });
    k.play('rumble', { t: B[1] + 0.2, gain: 0.2, pitch: 1.4, dur: 2.0 });
    k.play('pop', { t: B[2] + 0.5, gain: 0.3, pitch: 1.2 });
    k.play('pop', { t: B[3] + 0.6, gain: 0.3, pitch: 1.0 });
    k.play('chime', { t: B[3] + 1.4, gain: 0.2, pitch: 0.9, music: true });
  },
  post: null,
};
