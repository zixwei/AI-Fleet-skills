window.STYLES = window.STYLES || {};
STYLES['data-skyline'] = {
  id: 'data-skyline', name: 'Data Skyline',
  family: 'Diagrams with depth',
  use: 'Explainer',
  look: "A bar chart built as an architect's model: towers of stacked pale stone blocks on a printed plinth, one tower in vermilion, with small trees and scale figures. Soft sky light and long gentle shadows.",
  motion: 'Towers grow block by block, each block dropping into place with a small settle. The camera moves low between the towers like an architectural photographer.',
  shownHere: 'Coffee consumption by country, in kilograms per person per year (approximate): the United States 4.4, Germany 5.5, Italy 5.9, the Netherlands 8.4, Norway 9.9 and Finland 12.',
  goodFor: 'Comparisons of amounts: rankings, budgets, populations, sales by region. One block is one unit, so the numbers can be counted.',
  fonts: ['Manrope:wght@600;800'],
  duration: 11,
  samples: 6,
  // CONTENT: kg of coffee per person per year (approximate)
  beats: [
    { t: 0.0, label: 'Coffee per person, per year' },
    { t: 2.7, label: 'Many countries: 4 to 6 kg' },
    { t: 5.4, label: 'The north drinks more' },
    { t: 8.1, label: 'Finland: about 12 kg' },
  ],
  data: [['USA', 4.4, 1], ['GERMANY', 5.5, 1], ['ITALY', 5.9, 1], ['NETHERLANDS', 8.4, 2], ['NORWAY', 9.9, 2], ['FINLAND', 12.0, 3]],
  unit: 'kg',

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Manrope', D = this.data;
    scene.background = new T.Color('#e9edf0'); scene.fog = new T.Fog('#e9edf0', 22, 45); scene.add(S.camera);
    const L = K.lights(S, 'sun', { size: 8, target: [0, 1, 0] }); L.key.position.set(-8, 9, 6); L.key.intensity = 2.6; L.key.shadow.radius = 4; L.amb.intensity = 1.0;
    const ground = new T.Mesh(new T.PlaneGeometry(80, 80), new T.MeshStandardMaterial({ color: '#dfe3e6', roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.41; ground.receiveShadow = true; scene.add(ground);
    // printed plinth: names and a scale
    const GAP = 1.55, X0 = -(D.length - 1) * GAP / 2;
    const plTex = K.canvasTex(2048, 820, (g, r, w, h) => {
      g.fillStyle = '#f7f5f0'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#c9c4ba'; g.lineWidth = 2; for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      g.fillStyle = '#2a2a2a'; g.font = `800 38px "${F}"`; g.textAlign = 'center';
      D.forEach(([n], i) => g.fillText(n, (0.5 + (i - (D.length - 1) / 2) * GAP / 11) * w, h * 0.86));
      g.font = `600 40px "${F}"`; g.textAlign = 'left'; g.fillStyle = '#6a655c'; g.fillText('1 block = 1 kg of coffee per person per year (approx.)', 60, 70);
    });
    const plinth = new T.Mesh(new T.BoxGeometry(11, 0.4, 4.4), [new T.MeshStandardMaterial({ color: '#e6e1d6' }), new T.MeshStandardMaterial({ color: '#e6e1d6' }), new T.MeshStandardMaterial({ map: plTex, roughness: 0.9 }), new T.MeshStandardMaterial({ color: '#e6e1d6' }), new T.MeshStandardMaterial({ color: '#d8d2c5' }), new T.MeshStandardMaterial({ color: '#e6e1d6' })]);
    plinth.position.y = -0.2; plinth.receiveShadow = true; plinth.castShadow = true; scene.add(plinth);
    // stone blocks: bevelled, each a little different
    const rb = (w, h, d, r) => { const s = new T.Shape(), x = -w / 2 + r, y = -h / 2 + r, W2 = w - 2 * r, H2 = h - 2 * r; s.moveTo(x, y - r); s.lineTo(x + W2, y - r); s.quadraticCurveTo(x + W2 + r, y - r, x + W2 + r, y); s.lineTo(x + W2 + r, y + H2); s.quadraticCurveTo(x + W2 + r, y + H2 + r, x + W2, y + H2 + r); s.lineTo(x, y + H2 + r); s.quadraticCurveTo(x - r, y + H2 + r, x - r, y + H2); s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r); const g = new T.ExtrudeGeometry(s, { depth: d - 2 * r, bevelEnabled: true, bevelSize: r * 0.5, bevelThickness: r * 0.5, bevelSegments: 2, curveSegments: 3 }); g.translate(0, 0, -(d - 2 * r) / 2); return g; };
    const BH = 0.42, blockGeo = rb(0.95, BH - 0.04, 0.95, 0.06);
    const stoneTex = K.canvasTex(256, 256, (g, r, w, h) => { g.fillStyle = '#ece6da'; g.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(160,140,110,${r.range(0.05, 0.18)})`; g.lineWidth = r.range(1, 3); const y = r() * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + r.range(-6, 6)); g.stroke(); } for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(120,100,80,${r.range(0.05, 0.2)})`; g.fillRect(r() * w, r() * h, r.range(1, 3), r.range(1, 2)); } }, 4);
    const stone = new T.MeshStandardMaterial({ map: stoneTex, roughness: 0.85 }), verm = new T.MeshStandardMaterial({ color: '#e24a2b', roughness: 0.6 });
    const towers = D.map(([name, v, grp], i) => {
      const n = Math.ceil(v), blocks = [], hl = name === 'FINLAND';
      for (let k = 0; k < n; k++) { const m = new T.Mesh(blockGeo, hl ? verm : stone); m.castShadow = m.receiveShadow = true; const frac = k === n - 1 ? v - (n - 1) : 1; m.userData = { k, frac, rot: ((i * 7 + k * 3) % 5 - 2) * 0.02 }; scene.add(m); blocks.push(m); }
      const start = [-0.8, B[1] + 0.1, B[1] + 0.3, B[2] + 0.1, B[2] + 0.4, B[3] + 0.1][i];
      const tag = K.label(`${name}` + String.fromCharCode(10) + `${v} ${this.unit}`, { font: F, weight: 800, px: 56, color: hl ? '#ffffff' : '#2a2a2a', bg: hl ? '#e24a2b' : '#ffffff', radius: 18, pad: 0.3, height: 0.3, lineHeight: 1.1 }); scene.add(tag);
      return { x: X0 + i * GAP, blocks, start, v, tag, dur: n * 0.11 };
    });
    // scale: trees and figures
    const treeM = new T.MeshStandardMaterial({ color: '#9fbf8a', roughness: 0.9 }), figM = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.7 });
    [[-5.0, 1.6], [-4.4, -1.6], [4.9, 1.7], [5.0, -1.5], [-0.8, 1.7], [2.0, -1.8]].forEach(([x, z], i) => { const tr = new T.Mesh(new T.CylinderGeometry(0.02, 0.03, 0.5, 6), new T.MeshStandardMaterial({ color: '#7a6a5a' })); tr.position.set(x, 0.25, z); scene.add(tr); const c = new T.Mesh(new T.IcosahedronGeometry(0.28 + (i % 3) * 0.05, 1), treeM); c.position.set(x, 0.62, z); c.castShadow = true; scene.add(c); });
    [[-3.2, 1.4], [-2.9, 1.5], [1.1, 1.5], [3.3, -1.4], [0.4, -1.6]].forEach(([x, z]) => { const g = new T.Group(); const b = new T.Mesh(new T.CylinderGeometry(0.04, 0.05, 0.22, 8), figM); b.position.y = 0.11; const h = new T.Mesh(new T.SphereGeometry(0.04, 8, 6), figM); h.position.y = 0.26; g.add(b, h); g.position.set(x, 0, z); g.traverse(o => { o.castShadow = true; }); scene.add(g); });
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 800, px: 84, color: '#1f2328', height: 0.46 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [-6.5, 3.2, 9.5], look: [-1.5, 1.4, 0] },
      { t: 4, pos: [-3.0, 3.6, 11.0], look: [-0.5, 1.8, 0] },
      { t: 8, pos: [2.5, 4.2, 13.0], look: [0.8, 2.7, 0] },
      { t: 11, pos: [6.0, 5.2, 14.2], look: [0.6, 3.0, 0] },
    ], S.camera);
    return (t, realT) => {
      cam(t);
      towers.forEach(tw => {
        let topY = 0;
        tw.blocks.forEach(m => {
          const { k, frac, rot } = m.userData, t0 = tw.start + k * 0.11, p = K.prog(t, t0, t0 + 0.28, 'bounce');
          const h = BH * frac, y = k * BH + h / 2;
          m.scale.set(1, frac, 1);
          m.position.set(tw.x, K.lerp(y + 2.2, y, p), 0); m.rotation.y = rot;
          m.visible = t >= t0;
          if (t >= t0 + 0.2) topY = k * BH + h;
        });
        const show = K.prog(t, tw.start + tw.dur, tw.start + tw.dur + 0.4, 'back');
        tw.tag.visible = show > 0; tw.tag.scale.setScalar(Math.max(0.001, show)); tw.tag.position.set(tw.x, topY + 0.6, 0); tw.tag.lookAt(S.camera.position);
      });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.04 });
    k.play('paper', { t: 0.2, gain: 0.3, pitch: 0.8 }); k.play('pop', { t: 0.25, gain: 0.25, pitch: 1.2 });
    const starts = [-0.8, B[1] + 0.1, B[1] + 0.3, B[2] + 0.1, B[2] + 0.4, B[3] + 0.1], vals = this.data.map(d => Math.ceil(d[1]));
    starts.forEach((s, i) => { for (let k2 = 0; k2 < vals[i]; k2++) k.play('wood', { t: s + k2 * 0.11 + 0.2, gain: 0.18, pitch: 0.7 + k2 * 0.04, pan: (i - 2.5) * 0.15 }); k.play('pop', { t: s + vals[i] * 0.11 + 0.15, gain: 0.25, pitch: 1.2 }); });
    k.play('chime', { t: B[3] + 1.8, gain: 0.25, pitch: 1.0, music: true });
  },
  post: null,
};
