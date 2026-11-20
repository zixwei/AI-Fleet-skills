window.STYLES = window.STYLES || {};
STYLES['bento-box'] = {
  id: 'bento-box', name: 'Bento Box',
  family: 'Kitchen and home',
  use: 'Explainer',
  look: 'A black lacquer lunch box with a red inside, seen from above on a wooden table. Each compartment is one part of the subject, and its size is its share. Food pieces are simple shapes: rice balls, salmon, rolled egg, broccoli, plums.',
  motion: 'Chopsticks carry food pieces one at a time into each compartment and set them down with a small bounce. At the end the lid comes down and closes the box.',
  shownHere: 'How to time-box a 40-hour working week: 16 hours of deep work first, 8 hours of meetings in one block, then 6 hours of admin, 4 hours of learning and 6 hours of buffer. One square of the box is one hour.',
  goodFor: 'Budgets and allocations: time, money, attention, team capacity. Anything that must fit into a fixed box, with a size for each part.',
  fonts: ['M PLUS Rounded 1c:wght@700;800'],
  duration: 12,
  samples: 4,
  // CONTENT: compartments on an 8 x 5 grid (1 cell = 1 hour); x, z, w, d in cells; the food and the number of pieces
  parts: [
    { name: 'Deep work', hours: 16, x: 0, z: 0, w: 4, d: 4, food: 'rice', n: 4, beat: 1 },
    { name: 'Meetings', hours: 8, x: 4, z: 0, w: 4, d: 2, food: 'salmon', n: 2, beat: 2 },
    { name: 'Admin', hours: 6, x: 4, z: 2, w: 4, d: 1.5, food: 'egg', n: 3, beat: 3 },
    { name: 'Buffer', hours: 6, x: 4, z: 3.5, w: 4, d: 1.5, food: 'plum', n: 3, beat: 3 },
    { name: 'Learning', hours: 4, x: 0, z: 4, w: 4, d: 1, food: 'broccoli', n: 2, beat: 3 },
  ],
  beats: [
    { t: 0.0, label: 'A 40-hour week is a box with a fixed size' },
    { t: 2.4, label: 'Deep work goes in first: 16 hours' },
    { t: 4.8, label: 'Meetings: 8 hours, in one block' },
    { t: 7.2, label: 'Then admin 6, buffer 6, learning 4' },
    { t: 9.6, label: 'Close the lid: the week is planned' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'M PLUS Rounded 1c', PT = this.parts, BE = this.beats;
    scene.background = new T.Color('#3a2a1e'); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 7 }); L.key.position.set(-4, 12, 5);
    const std = (c, r = 0.6, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const tableTex = K.canvasTex(1024, 1024, (g, r, w, h) => { g.fillStyle = '#a0784e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(60,36,16,${r.range(0.04, 0.16)})`; g.lineWidth = r.range(1, 4); const y = r() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + r.range(-14, 14), w * 0.7, y + r.range(-14, 14), w, y); g.stroke(); } }, 2);
    const table = new T.Mesh(new T.PlaneGeometry(30, 30), std('#ffffff', 0.7, { map: tableTex })); table.rotation.x = -Math.PI / 2; table.receiveShadow = true; scene.add(table);
    const C = 0.7, IW = 8 * C, ID = 5 * C, HT = 0.6, WT = 0.12;
    const lacquer = std('#111014', 0.18, { metalness: 0.1 }), red = std('#9a1a1a', 0.3);
    // the box: a black outer wall, a red floor, red dividers between compartments
    const box = new T.Group(); scene.add(box);
    const floorM = new T.Mesh(new T.BoxGeometry(IW, 0.08, ID), red); floorM.position.y = 0.04; floorM.receiveShadow = true; box.add(floorM);
    [[0, -ID / 2 - WT / 2, IW + 2 * WT, WT], [0, ID / 2 + WT / 2, IW + 2 * WT, WT]].forEach(([x, z, w, d]) => { const m = new T.Mesh(new T.BoxGeometry(w, HT, d), lacquer); m.position.set(x, HT / 2, z); m.castShadow = m.receiveShadow = true; box.add(m); });
    [[-IW / 2 - WT / 2], [IW / 2 + WT / 2]].forEach(([x]) => { const m = new T.Mesh(new T.BoxGeometry(WT, HT, ID), lacquer); m.position.set(x, HT / 2, 0); m.castShadow = m.receiveShadow = true; box.add(m); });
    const cell = (x, z) => new T.Vector3(-IW / 2 + x * C, 0, -ID / 2 + z * C);
    const div = (x0, z0, x1, z1) => { const a = cell(x0, z0), b = cell(x1, z1), w = Math.max(0.06, Math.abs(b.x - a.x)), d = Math.max(0.06, Math.abs(b.z - a.z)); const m = new T.Mesh(new T.BoxGeometry(w, HT * 0.85, d), red); m.position.set((a.x + b.x) / 2, HT * 0.425, (a.z + b.z) / 2); m.castShadow = m.receiveShadow = true; box.add(m); };
    div(4, 0, 4, 5); div(0, 4, 4, 4); div(4, 2, 8, 2); div(4, 3.5, 8, 3.5);
    // a label in each compartment, flat on the floor, and an hour grid printed faintly
    PT.forEach(p => { const l = K.label(`${p.name}  ${p.hours} h`, { font: F, weight: 800, px: 64, color: '#ffe8d0', bg: 'rgba(60,8,8,0.0)', height: Math.min(0.3, p.d * C * 0.3) }); l.rotation.x = -Math.PI / 2; const c = cell(p.x + p.w / 2, p.z + 0.25 * Math.min(1.2, p.d)); l.position.set(c.x, 0.09, c.z); box.add(l); });
    const grid = K.canvasTex(800, 500, (g, r, w, h) => { g.strokeStyle = 'rgba(255,200,180,0.18)'; g.lineWidth = 3; for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(i * 100, 0); g.lineTo(i * 100, h); g.stroke(); } for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(0, i * 100); g.lineTo(w, i * 100); g.stroke(); } }, 3);
    const gm = new T.Mesh(new T.PlaneGeometry(IW, ID), new T.MeshBasicMaterial({ map: grid, transparent: true })); gm.rotation.x = -Math.PI / 2; gm.position.y = 0.085; box.add(gm);
    // food: simple shapes with painted textures
    const riceTex = K.canvasTex(128, 128, (g, r, w, h) => { g.fillStyle = '#f6f4ee'; g.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { g.fillStyle = 'rgba(200,190,170,0.5)'; g.beginPath(); g.ellipse(r() * w, r() * h, 5, 2.5, r() * 3, 0, 7); g.fill(); } }, 4);
    const salTex = K.canvasTex(128, 128, (g, r, w, h) => { g.fillStyle = '#f08a5a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,240,230,0.8)'; g.lineWidth = 5; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(0, i * 24 + 6); g.quadraticCurveTo(w / 2, i * 24 + 20, w, i * 24); g.stroke(); } }, 5);
    const eggTex = K.canvasTex(128, 128, (g, r, w, h) => { g.fillStyle = '#f6d04a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(200,140,30,0.5)'; g.lineWidth = 4; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(w / 2, h / 2, 12 + i * 14, 0, 7); g.stroke(); } }, 6);
    const make = (food) => {
      const g = new T.Group();
      if (food === 'rice') { const m = new T.Mesh(new T.SphereGeometry(0.6, 24, 16), std('#ffffff', 0.8, { map: riceTex })); m.scale.set(1, 0.42, 0.85); m.position.y = 0.25; g.add(m); const n = new T.Mesh(new T.BoxGeometry(0.5, 0.3, 0.9), std('#1a2a1a', 0.5)); n.position.set(0, 0.16, 0); g.add(n); }
      if (food === 'salmon') { const m = new T.Mesh(new T.BoxGeometry(1.25, 0.32, 0.9), std('#ffffff', 0.45, { map: salTex })); m.position.y = 0.2; g.add(m); }
      if (food === 'egg') { const m = new T.Mesh(new T.BoxGeometry(0.62, 0.42, 0.75), [std('#ffffff', 0.5, { map: eggTex }), std('#ffffff', 0.5, { map: eggTex }), std('#f6d04a', 0.5), std('#f6d04a', 0.5), std('#f6d04a', 0.5), std('#f6d04a', 0.5)]); m.position.y = 0.25; g.add(m); }
      if (food === 'plum') { const m = new T.Mesh(new T.SphereGeometry(0.3, 20, 14), std('#b0283a', 0.35)); m.position.y = 0.32; g.add(m); const lf = new T.Mesh(new T.SphereGeometry(0.28, 16, 8), std('#4a8a3a', 0.6)); lf.scale.set(1.4, 0.15, 0.7); lf.position.set(0.18, 0.12, 0.1); g.add(lf); }
      if (food === 'broccoli') { const st = new T.Mesh(new T.CylinderGeometry(0.08, 0.1, 0.3, 8), std('#8ab05a')); st.rotation.z = Math.PI / 2; st.position.set(-0.25, 0.15, 0); g.add(st); [[0, 0.25, 0, 0.24], [0.15, 0.22, 0.14, 0.18], [0.15, 0.22, -0.14, 0.18], [-0.05, 0.32, 0, 0.18]].forEach(([x, y, z, r]) => { const b = new T.Mesh(new T.IcosahedronGeometry(r, 1), std('#2f7a2a', 0.8, { flatShading: true })); b.position.set(x, y, z); g.add(b); }); }
      g.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }); box.add(g); return g;
    };
    // the pieces: placed evenly in their compartment; each gets a carry time inside its beat
    const pieces = [];
    PT.forEach(p => { const cols = p.food === 'rice' ? 2 : p.n, rows = p.food === 'rice' ? 2 : 1;
      for (let j = 0; j < p.n; j++) { const cx = (j % cols + 0.5) / cols, cz = (Math.floor(j / cols) + 0.5) / rows, target = cell(p.x + p.w * cx, p.z + 0.4 * Math.min(1, p.d) + (p.d - 0.4 * Math.min(1, p.d)) * cz).setY(0.08);
        pieces.push({ g: make(p.food), target, beat: p.beat }); } });
    BE.forEach((b, bi) => { const ps = pieces.filter(p => p.beat === bi); const t0 = b.t + 0.2, t1 = (B[bi + 1] ?? 12) - 0.2, dt = (t1 - t0) / Math.max(1, ps.length); ps.forEach((p, j) => { p.t0 = t0 + j * dt; p.t1 = p.t0 + dt * 0.85; }); });
    const SRC = new T.Vector3(IW / 2 + 2.6, 1.6, 1.4);
    // chopsticks: two tapered sticks that meet at the tips
    const chop = new T.Group(); scene.add(chop);
    [-1, 1].forEach(s => { const c = new T.Mesh(new T.CylinderGeometry(0.035, 0.06, 3.2, 10), std('#c8a070', 0.4)); c.geometry.translate(0, 1.6, 0); c.rotation.set(-0.05 * s, 0, -1.05 + 0.04 * s); c.position.set(0.05, 0.25, 0.06 * s); c.castShadow = true; chop.add(c); });
    // the lid: black lacquer with a gold line, it comes down at the end
    const lidTex = K.canvasTex(800, 500, (g, r, w, h) => { g.fillStyle = '#121014'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9a04a'; g.lineWidth = 6; g.strokeRect(30, 30, w - 60, h - 60); g.beginPath(); g.arc(w * 0.78, h * 0.5, 80, 0, 7); g.stroke(); g.fillStyle = '#c9a04a'; g.font = `800 64px "${F}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('40 h', w * 0.78, h * 0.5); }, 7);
    const lid = new T.Mesh(new T.BoxGeometry(IW + 2 * WT + 0.06, 0.18, ID + 2 * WT + 0.06), [lacquer, lacquer, std('#ffffff', 0.2, { map: lidTex }), lacquer, lacquer, lacquer]); lid.castShadow = true; scene.add(lid);
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 800, px: 68, color: '#fff4e6', bg: 'rgba(30,14,10,0.82)', radius: 16, pad: 0.35, height: 0.4 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([{ t: 0, pos: [0.3, 10.4, 4.6], look: [0.2, 0, -0.2] }, { t: 6, pos: [0.6, 9.8, 4.2], look: [0.3, 0, -0.2] }, { t: 12, pos: [0.2, 10.6, 5.0], look: [0.2, 0, -0.2] }], S.camera);
    const P = new T.Vector3();
    return (t, realT) => {
      cam(t);
      let active = null;
      pieces.forEach(p => {
        const u = K.prog(t, p.t0, p.t1, 'inOut');
        if (t < p.t0) { p.g.visible = false; return; }
        p.g.visible = true;
        P.lerpVectors(SRC, p.target, u); P.y += 1.6 * Math.sin(Math.PI * u) * (1 - u * 0.3);
        const land = K.prog(t, p.t1, p.t1 + 0.25); P.y += u >= 1 ? 0.08 * Math.sin(Math.PI * land) : 0;
        p.g.position.copy(P); p.g.rotation.y = (1 - u) * 0.6;
        if (u < 1) active = P.clone();
      });
      if (active) chop.position.copy(active).add(new T.Vector3(0, 0.25, 0));
      else chop.position.lerp(SRC.clone().add(new T.Vector3(0.6, 1.6, 0)), 0.25);
      chop.visible = t < B[4] + 0.6;
      const c = K.prog(t, B[4] + 0.3, B[4] + 1.5, 'inOut');
      lid.position.set(K.lerp(-IW - 2.5, 0, K.prog(t, B[4] + 0.0, B[4] + 1.0, 'out')), HT + 0.09 + 2.2 * (1 - c), 0); lid.rotation.z = 0.25 * (1 - c); lid.visible = t > B[4];
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t), PT = this.parts, BE = this.beats;
    k.bed('room', { gain: 0.05 });
    k.play('wood', { t: 0.3, gain: 0.3, pitch: 0.9 }); k.play('pluck', { t: 0.5, gain: 0.12, pitch: 1.0, music: true });
    BE.forEach((b, bi) => { const n = PT.filter(p => p.beat === bi).reduce((s, p) => s + p.n, 0); if (!n) return; const t0 = b.t + 0.2, t1 = (B[bi + 1] ?? 12) - 0.2, dt = (t1 - t0) / n;
      for (let j = 0; j < n; j++) { k.play('wood', { t: t0 + j * dt + 0.05, gain: 0.15, pitch: 2.2 }); k.play('pop', { t: t0 + j * dt + dt * 0.85, gain: 0.25, pitch: 0.8 + (j % 3) * 0.12 }); } });
    k.play('swish', { t: B[4] + 0.1, gain: 0.25, pitch: 0.6, dur: 1.0 }); k.play('thud', { t: B[4] + 1.5, gain: 0.4, pitch: 0.9 }); k.play('chime', { t: B[4] + 1.6, gain: 0.15, pitch: 1.0, music: true });
  },
  post: null,
};
