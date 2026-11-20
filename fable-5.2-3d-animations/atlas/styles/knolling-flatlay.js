window.STYLES = window.STYLES || {};
STYLES['knolling-flatlay'] = {
  id: 'knolling-flatlay', name: 'Knolling Flatlay',
  family: 'Kitchen and home',
  use: 'Explainer',
  look: 'A top-down view of a table. Objects lie in an exact grid, all at right angles, with equal gaps and the hard, soft-edged shadows of a single soft box. A thin white line and a number mark each object.',
  motion: 'Objects slide one at a time from a loose pile into their place in the grid, turn square and settle. As each one lands, its line and number draw in.',
  shownHere: 'What goes in a basic emergency kit: water and food for several days, a battery radio, a flashlight, spare batteries, a first-aid kit, a whistle and a phone charger.',
  goodFor: 'Checklists, kits and inventories: what is in the box, what a product contains, what you need for a trip, parts of a system laid out to count.',
  fonts: ['Inter:wght@600;800'],
  duration: 12,
  samples: 4,
  // CONTENT: the items in order; each beat brings some of them into the grid
  items: ['Water', 'Food', 'Radio', 'Flashlight', 'Batteries', 'First aid', 'Whistle', 'Charger'],
  beats: [
    { t: 0.0, label: 'What goes in an emergency kit', items: [] },
    { t: 2.4, label: 'Water and food for several days', items: [0, 1] },
    { t: 4.8, label: 'A radio, a flashlight, spare batteries', items: [2, 3, 4] },
    { t: 7.2, label: 'A first-aid kit and a whistle', items: [5, 6] },
    { t: 9.6, label: 'A phone charger: the kit is complete', items: [7] },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Inter', BE = this.beats, IT = this.items;
    scene.background = new T.Color('#2f6f6a'); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#ffffff', '#204040', 0.9));
    const box = new T.DirectionalLight('#ffffff', 2.6); box.position.set(-2.5, 14, 3.5); box.castShadow = true; box.shadow.mapSize.set(2048, 2048);
    Object.assign(box.shadow.camera, { left: -9, right: 9, top: 7, bottom: -7, near: 1, far: 30 }); box.shadow.radius = 2; box.shadow.bias = -0.0005; box.shadow.normalBias = 0.02; scene.add(box);
    const std = (c, r = 0.6, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const table = new T.Mesh(new T.PlaneGeometry(40, 30), std('#3a8a82', 0.9)); table.rotation.x = -Math.PI / 2; table.receiveShadow = true; scene.add(table);
    const sh = m => { m.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); return m; };
    const lab = (txt, bg, fg, w = 256, h = 128) => K.canvasTex(w, h, (g, r, cw, ch) => { g.fillStyle = bg; g.fillRect(0, 0, cw, ch); g.fillStyle = fg; g.font = `800 ${ch * 0.32}px "${F}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, cw / 2, ch / 2); }, txt.length);
    // the objects, built from simple shapes, lying flat
    const makers = [
      () => { const g = new T.Group(); const b = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 1.9, 24), std('#7ab8e8', 0.2, { metalness: 0.1 })); b.rotation.z = Math.PI / 2; b.position.y = 0.42; const c = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 0.3, 16), std('#2a5a9a', 0.4)); c.rotation.z = Math.PI / 2; c.position.set(1.1, 0.42, 0); const l = new T.Mesh(new T.CylinderGeometry(0.43, 0.43, 0.7, 24, 1, true), std('#ffffff', 0.5, { map: lab('WATER', '#ffffff', '#2a5a9a') })); l.rotation.z = Math.PI / 2; l.position.y = 0.42; g.add(b, c, l); return g; },
      () => { const g = new T.Group(); [-0.48, 0.48].forEach((x, i) => { const c = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 0.6, 28), [std('#ffffff', 0.4, { map: lab('BEANS', ['#e0902a', '#c0402a'][i], '#ffffff') }), std('#c8ccd2', 0.25, { metalness: 0.9 }), std('#c8ccd2', 0.25, { metalness: 0.9 })]); c.position.set(x, 0.3, 0); g.add(c); }); return g; },
      () => { const g = new T.Group(); const b = new T.Mesh(new T.BoxGeometry(1.6, 0.6, 1.0), std('#3a3a3e', 0.5)); b.position.y = 0.3; const gr = new T.Mesh(new T.PlaneGeometry(0.7, 0.7), std('#ffffff', 0.6, { map: K.canvasTex(128, 128, (c, r, w, h) => { c.fillStyle = '#2a2a2e'; c.fillRect(0, 0, w, h); c.fillStyle = '#888'; for (let y = 8; y < h; y += 14) for (let x = 8; x < w; x += 14) { c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); } }, 3) })); gr.rotation.x = -Math.PI / 2; gr.position.set(-0.35, 0.61, 0); const d = new T.Mesh(new T.CylinderGeometry(0.15, 0.15, 0.08, 16), std('#e0903a', 0.4)); d.position.set(0.45, 0.64, 0.1); const ant = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 1.4, 6), std('#c8ccd2', 0.2, { metalness: 1 })); ant.rotation.z = Math.PI / 2; ant.position.set(0.2, 0.62, -0.42); g.add(b, gr, d, ant); return g; },
      () => { const g = new T.Group(); const b = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 1.4, 20), std('#e8c020', 0.4)); b.rotation.z = Math.PI / 2; b.position.y = 0.2; const h = new T.Mesh(new T.CylinderGeometry(0.34, 0.22, 0.4, 24), std('#2a2a2a', 0.4)); h.rotation.z = Math.PI / 2; h.position.set(0.9, 0.34, 0); const lens = new T.Mesh(new T.CircleGeometry(0.3, 24), std('#fff8d0', 0.1, { emissive: '#fff4c0', emissiveIntensity: 0.4 })); lens.rotation.y = Math.PI / 2; lens.position.set(1.11, 0.34, 0); g.add(b, h, lens); return g; },
      () => { const g = new T.Group(); for (let i = 0; i < 4; i++) { const c = new T.Mesh(new T.CylinderGeometry(0.15, 0.15, 0.9, 16), std(i % 2 ? '#2a2a2a' : '#c8902a', 0.35, { metalness: 0.3 })); c.rotation.z = Math.PI / 2; c.position.set(0, 0.15, -0.48 + i * 0.32); const tip = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.06, 10), std('#c8ccd2', 0.2, { metalness: 1 })); tip.rotation.z = Math.PI / 2; tip.position.set(0.48, 0.15, -0.48 + i * 0.32); g.add(c, tip); } return g; },
      () => { const g = new T.Group(); const b = new T.Mesh(new T.BoxGeometry(1.5, 0.5, 1.1), [std('#d83a3a'), std('#d83a3a'), std('#ffffff', 0.5, { map: K.canvasTex(150, 110, (c, r, w, h) => { c.fillStyle = '#d83a3a'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.fillRect(w / 2 - 12, h / 2 - 36, 24, 72); c.fillRect(w / 2 - 36, h / 2 - 12, 72, 24); }, 5) }), std('#d83a3a'), std('#d83a3a'), std('#d83a3a')]); b.position.y = 0.25; const hd = new T.Mesh(new T.TorusGeometry(0.22, 0.04, 8, 20, Math.PI), std('#2a2a2a', 0.5)); hd.rotation.x = -Math.PI / 2; hd.position.set(0, 0.5, -0.55); g.add(b, hd); return g; },
      () => { const g = new T.Group(); const b = new T.Mesh(new T.CylinderGeometry(0.25, 0.25, 0.7, 20), std('#f07a2a', 0.35)); b.rotation.z = Math.PI / 2; b.position.y = 0.25; const m = new T.Mesh(new T.BoxGeometry(0.4, 0.2, 0.3), std('#f07a2a', 0.35)); m.position.set(-0.5, 0.18, 0); const ring = new T.Mesh(new T.TorusGeometry(0.16, 0.035, 8, 20), std('#c8ccd2', 0.2, { metalness: 1 })); ring.rotation.x = -Math.PI / 2; ring.position.set(0.5, 0.05, 0); g.add(b, m, ring); return g; },
      () => { const g = new T.Group(); const b = new T.Mesh(new T.BoxGeometry(1.2, 0.3, 0.7), std('#f2f2f2', 0.35)); b.position.y = 0.15; const pts = []; for (let i = 0; i <= 30; i++) { const a = i / 30; pts.push(new T.Vector3(0.6 + a * 0.6, 0.06, Math.sin(a * Math.PI * 1.5) * 0.4)); } const cab = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 40, 0.04, 6), std('#f2f2f2', 0.5)); const led = new T.Mesh(new T.BoxGeometry(0.2, 0.02, 0.05), std('#3aaf6a', 0.3, { emissive: '#3aaf6a', emissiveIntensity: 1 })); led.position.set(-0.3, 0.31, 0.2); g.add(b, cab, led); return g; },
    ];
    // the grid: 4 columns x 2 rows; a loose pile on the right
    const cols = [-5.0, -2.6, -0.2, 2.2], rows = [-0.5, 2.6];
    const rr = K.rng(9);
    const objs = IT.map((name, i) => { const g = sh(makers[i]()); scene.add(g);
      const cell = new T.Vector3(cols[i % 4], 0, rows[Math.floor(i / 4)]);
      const pile = new T.Vector3(5.6 + rr.range(-0.8, 0.8), 0.25 * (IT.length - i), 1.1 + rr.range(-1.5, 1.5));
      return { g, cell, pile, rot: rr.range(-2, 2), tilt: rr.range(-0.3, 0.3) }; });
    // when each item moves, from the beats
    BE.forEach(b => b.items.forEach((idx, j) => { objs[idx].t0 = b.t + 0.15 + j * 0.65; }));
    // marks: a thin white line from the object to its number
    const marks = objs.map((o, i) => { const top = false, y = 0.02, z0 = o.cell.z + (top ? -0.75 : 0.75), z1 = o.cell.z + (top ? -1.35 : 1.35);
      const line = new T.Mesh(new T.PlaneGeometry(0.03, Math.abs(z1 - z0)), new T.MeshBasicMaterial({ color: '#ffffff' })); line.rotation.x = -Math.PI / 2; line.position.set(o.cell.x, y, (z0 + z1) / 2); scene.add(line);
      const tag = K.label(`${String(i + 1).padStart(2, '0')}  ${IT[i]}`, { font: F, weight: 800, px: 56, color: '#ffffff', height: 0.3 }); tag.rotation.x = -Math.PI / 2; tag.position.set(o.cell.x, y, z1 + (top ? -0.2 : 0.2)); scene.add(tag);
      return { line, tag, z0, z1 }; });
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 800, px: 66, color: '#ffffff', bg: 'rgba(20,40,40,0.85)', radius: 12, pad: 0.35, height: 0.4 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([{ t: 0, pos: [0.4, 15.5, 2.4], look: [0.4, 0, 1.1] }, { t: 9.6, pos: [0.0, 14.8, 2.3], look: [0.0, 0, 1.1] }, { t: 12, pos: [-0.6, 16.0, 2.4], look: [-0.6, 0, 1.1] }], S.camera);
    const P = new T.Vector3();
    return (t, realT) => {
      cam(t);
      objs.forEach((o, i) => { const u = o.t0 === undefined ? 0 : K.prog(t, o.t0, o.t0 + 0.6, 'inOut'), land = o.t0 === undefined ? 0 : K.prog(t, o.t0 + 0.55, o.t0 + 0.8);
        P.lerpVectors(o.pile, o.cell, u); P.y += 0.6 * Math.sin(Math.PI * u) - 0.03 * Math.sin(Math.PI * land);
        o.g.position.copy(P); o.g.rotation.set(o.tilt * (1 - u), o.rot * (1 - u), 0);
        const m = marks[i], d = o.t0 === undefined ? 0 : K.prog(t, o.t0 + 0.6, o.t0 + 0.95, 'out');
        m.line.scale.y = Math.max(0.001, d); m.line.position.z = m.z0 + (m.z1 - m.z0) * d / 2; m.line.visible = d > 0;
        m.tag.visible = d > 0.6; m.tag.material.opacity = K.prog(d, 0.6, 1); });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const BE = this.beats;
    k.bed('room', { gain: 0.05 });
    k.play('paper', { t: 0.2, gain: 0.15, pitch: 1.0 }); k.play('blip', { t: 0.5, gain: 0.12, pitch: 1.0 });
    BE.forEach(b => b.items.forEach((idx, j) => { const t0 = b.t + 0.15 + j * 0.65; k.play('swish', { t: t0, gain: 0.18, pitch: 1.2, dur: 0.5 }); k.play('wood', { t: t0 + 0.6, gain: 0.3, pitch: 1.0 + idx * 0.05 }); k.play('tick', { t: t0 + 0.8, gain: 0.2, pitch: 1.5 }); }));
    k.play('chime', { t: 11.0, gain: 0.15, pitch: 1.0, music: true });
  },
  post: null,
};
