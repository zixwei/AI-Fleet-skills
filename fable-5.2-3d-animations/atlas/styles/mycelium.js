window.STYLES = window.STYLES || {};
STYLES['mycelium'] = {
  id: 'mycelium', name: 'Mycelium',
  family: 'Living and elemental',
  use: 'Explainer',
  look: 'A cross-section of forest soil under a sunlit forest floor: dark crumbly earth, brown tree roots, and fine white fungus threads that glow faintly. Above ground, moss, leaves and the trunks of trees.',
  motion: 'White threads grow out from one point, branch and find the roots. Light pulses travel along them from tree to tree. At the end mushrooms push up through the leaves.',
  shownHere: 'How trees share nutrients: fungus threads grow through the soil and link the roots of different trees; sugar moves from big sunlit trees to small shaded ones; mushrooms are the part of the network that shows above ground.',
  goodFor: 'Hidden networks and support systems: the internet backbone, supply chains, communities, nerves, anything that connects things out of sight.',
  fonts: ['Fraunces:wght@600;700'],
  duration: 11,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Under the forest floor' },
    { t: 2.7, label: 'Fungus threads link the roots' },
    { t: 5.4, label: 'Sugar flows to the small trees' },
    { t: 8.1, label: 'Mushrooms show the network above' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Fraunces';
    scene.background = K.canvasTex(16, 256, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#bfe0c8'); gr.addColorStop(0.5, '#e8efd0'); gr.addColorStop(1, '#2a1a10'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    scene.add(S.camera);
    const L = K.lights(S, 'sun', { size: 9, target: [0, 0, 0] }); L.key.position.set(-6, 10, 6); L.key.intensity = 2.2; L.amb.intensity = 0.8;
    // soil block: a cut face in front
    const soilTex = K.canvasTex(1600, 900, (g, r, w, h) => { g.fillStyle = '#3a2416'; g.fillRect(0, 0, w, h); for (let i = 0; i < 40000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? 90 : 20},${r() < 0.5 ? 60 : 12},${r() < 0.5 ? 40 : 6},${r.range(0.2, 0.6)})`; g.beginPath(); g.arc(r() * w, r() * h, r.range(1, 4), 0, 7); g.fill(); } for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(150,140,130,${r.range(0.3, 0.6)})`; g.beginPath(); g.ellipse(r() * w, r() * h, r.range(8, 30), r.range(6, 20), r() * 3, 0, 7); g.fill(); } const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.45)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, 4);
    const SW = 16, SH = 6;
    const soil = new T.Mesh(new T.BoxGeometry(SW, SH, 6), [new T.MeshStandardMaterial({ color: '#2a1a10' }), new T.MeshStandardMaterial({ color: '#2a1a10' }), new T.MeshStandardMaterial({ color: '#4a6a2a', roughness: 1 }), new T.MeshStandardMaterial({ color: '#2a1a10' }), new T.MeshStandardMaterial({ map: soilTex, roughness: 1 }), new T.MeshStandardMaterial({ color: '#2a1a10' })]);
    soil.position.set(0, -SH / 2, -3); soil.receiveShadow = true; scene.add(soil);
    // leaf litter on top
    const lr = K.rng(5), leafM = ['#b8742a', '#d99a3a', '#8a5a20', '#6a8a3a'].map(c => new T.MeshStandardMaterial({ color: c, roughness: 0.9, side: T.DoubleSide }));
    for (let i = 0; i < 160; i++) { const m = new T.Mesh(new T.CircleGeometry(0.14, 6), lr.pick(leafM)); m.scale.set(1, 0.6, 1); m.rotation.set(-Math.PI / 2 + lr.range(-0.3, 0.3), 0, lr() * 6); m.position.set(lr.range(-7.8, 7.8), 0.01 + lr() * 0.03, lr.range(-5.8, -0.1)); scene.add(m); }
    // trees: a big one in the sun, a small one in the shade
    const bark = new T.MeshStandardMaterial({ color: '#5a3a24', roughness: 0.9 }), crownM = new T.MeshStandardMaterial({ color: '#4f8a3a', roughness: 0.8 });
    const tree = (x, h, r, crown) => { const g = new T.Group(); g.position.set(x, 0, -2.0); scene.add(g); const tr = new T.Mesh(new T.CylinderGeometry(r * 0.7, r, h, 12), bark); tr.position.y = h / 2; tr.castShadow = true; g.add(tr); const c = new T.Mesh(new T.IcosahedronGeometry(crown, 1), crownM); c.position.y = h + crown * 0.4; c.castShadow = true; g.add(c); return g; };
    const big = tree(-4.5, 4.5, 0.45, 2.0), mid = tree(1.5, 3.0, 0.3, 1.3), small = tree(5.2, 1.2, 0.12, 0.55);
    // roots (brown tubes) in front of the cut face; their tips are where the threads connect
    const rootM = new T.MeshStandardMaterial({ color: '#7a5030', roughness: 0.8 });
    const tips = [];
    const roots = (x0, n, len, seed) => { const r = K.rng(seed); for (let k = 0; k < n; k++) { const pts = [new T.Vector3(x0, -0.05, 0.05)]; let x = x0, y = -0.05; const ang = -Math.PI / 2 + (k - (n - 1) / 2) * 0.5; for (let s = 1; s <= 6; s++) { x += Math.cos(ang) * len / 6 + r.range(-0.15, 0.15); y += Math.sin(ang) * len / 6 + r.range(-0.1, 0.1); pts.push(new T.Vector3(x, y, 0.05)); } const m = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 30, 0.07 * (len / 2.5), 6), rootM); scene.add(m); tips.push(pts[pts.length - 1].clone()); } };
    roots(-4.5, 4, 2.8, 1); roots(1.5, 3, 2.0, 2); roots(5.2, 2, 1.0, 3);
    // mycelium: paths from a starting point to every root tip, with side branches; each segment appears at its own time
    const origin = new T.Vector3(-1.2, -3.2, 0.1), segs = [], mr = K.rng(9);
    const grow = (from, to, t0, speed) => { let p = from.clone(), d = 0; const steps = Math.ceil(from.distanceTo(to) / 0.18); for (let s = 1; s <= steps; s++) { const q = from.clone().lerp(to, s / steps); q.x += mr.range(-0.12, 0.12) * Math.sin(s / steps * Math.PI); q.y += mr.range(-0.12, 0.12) * Math.sin(s / steps * Math.PI); q.z = 0.1; d += p.distanceTo(q); segs.push([p.clone(), q.clone(), t0 + d / speed]); if (mr() < 0.18) { let bp = q.clone(), bd = d; const ang = mr() * 6.28; for (let k = 0; k < 4; k++) { const nq = bp.clone().add(new T.Vector3(Math.cos(ang + k * 0.3) * 0.16, Math.sin(ang + k * 0.3) * 0.16, 0)); bd += 0.16; segs.push([bp.clone(), nq, t0 + bd / speed]); bp = nq; } } p = q; } };
    tips.forEach(tp => grow(origin, tp, B[1] - 0.3, 2.6));
    for (let i = 0; i < 18; i++) { const a = i / 18 * 6.28; grow(origin, origin.clone().add(new T.Vector3(Math.cos(a) * 2.2, Math.sin(a) * 1.0, 0)), B[1] - 0.3, 2.2); }
    const thread = new T.InstancedMesh(new T.CylinderGeometry(0.014, 0.014, 1, 4).translate(0, 0.5, 0), new T.MeshStandardMaterial({ color: '#f4f0e6', emissive: '#d9f0ff', emissiveIntensity: 0.4, roughness: 0.6 }), segs.length); thread.frustumCulled = false; scene.add(thread);
    const spore = new T.Sprite(new T.SpriteMaterial({ map: K.canvasTex(64, 64, g => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }), color: '#e6fff4', transparent: true, blending: T.AdditiveBlending, depthWrite: false })); spore.position.copy(origin); spore.scale.setScalar(0.7); scene.add(spore);
    // nutrient pulses: from the big tree's roots to the small tree's roots, along a chain of tips
    const pathPts = [tips[1], origin, tips[tips.length - 1]].map(v => v.clone().setZ(0.14));
    const pulseCurve = new T.CatmullRomCurve3([pathPts[0], new T.Vector3(-2.6, -2.6, 0.14), pathPts[1], new T.Vector3(2.6, -2.4, 0.14), pathPts[2]]);
    const glowT = spore.material.map;
    const pulses = Array.from({ length: 10 }, () => { const s = new T.Sprite(new T.SpriteMaterial({ map: glowT, color: '#ffd24a', transparent: true, blending: T.AdditiveBlending, depthWrite: false })); s.scale.setScalar(0.45); scene.add(s); return s; });
    const sunbeam = new T.Mesh(new T.ConeGeometry(2.2, 8, 24, 1, true), new T.MeshBasicMaterial({ color: '#fff2c0', transparent: true, opacity: 0.06, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); sunbeam.position.set(-4.5, 7, -2); sunbeam.rotation.z = 0.2; scene.add(sunbeam);
    // mushrooms
    const capM = new T.MeshStandardMaterial({ color: '#c8643a', roughness: 0.6 }), stemM = new T.MeshStandardMaterial({ color: '#f2e6d0', roughness: 0.7 });
    const shrooms = [[-1.6, -0.6, 0.35], [-0.9, -1.2, 0.25], [0.2, -0.5, 0.3], [3.4, -0.9, 0.22], [4.0, -0.4, 0.18]].map(([x, z, s]) => { const g = new T.Group(); const st = new T.Mesh(new T.CylinderGeometry(s * 0.25, s * 0.32, s * 1.4, 12), stemM); st.position.y = s * 0.7; const cap = new T.Mesh(new T.SphereGeometry(s, 20, 12, 0, 6.28, 0, 1.4), capM); cap.position.y = s * 1.35; g.add(st, cap); for (let k = 0; k < 6; k++) { const d = new T.Mesh(new T.SphereGeometry(s * 0.1, 6, 4), stemM); const a = k * 1.05; d.position.set(Math.cos(a) * s * 0.6, s * 1.35 + s * 0.6, Math.sin(a) * s * 0.6); g.add(d); } g.traverse(o => { o.castShadow = true; }); g.position.set(x, 0, z); scene.add(g); return g; });
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 84, color: '#2a1a10', height: 0.46 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [-1.0, 1.4, 13.5], look: [-0.5, -0.6, 0] },
      { t: 5.4, pos: [0.6, 0.6, 13.0], look: [0.3, -1.2, 0] },
      { t: 8.1, pos: [1.0, 2.6, 14.5], look: [0.4, 0.0, -0.5] },
      { t: 11, pos: [0.0, 3.4, 16.5], look: [0.0, 0.4, -0.5] },
    ], S.camera);
    const MX = new T.Matrix4(), Q = new T.Quaternion(), UP = new T.Vector3(0, 1, 0), SC = new T.Vector3(), V = new T.Vector3();
    return (t, realT) => {
      cam(t);
      segs.forEach(([a, b, t1], i) => { const t0 = t1 - 0.07, p = K.prog(t, t0, t1); const d = b.clone().sub(a), len = d.length(); Q.setFromUnitVectors(UP, d.normalize()); thread.setMatrixAt(i, MX.compose(a, Q, SC.set(p > 0 ? 1 : 0.0001, Math.max(0.0001, len * p), p > 0 ? 1 : 0.0001))); });
      thread.instanceMatrix.needsUpdate = true;
      thread.material.emissiveIntensity = 0.4 + 0.6 * K.prog(t, B[2], B[2] + 0.5) * (0.7 + 0.3 * Math.sin(realT * 4));
      spore.material.opacity = 0.6 + 0.4 * Math.sin(realT * 3); spore.visible = t < B[2];
      pulses.forEach((p, i) => { const u = ((t - B[2] - i * 0.28) / 2.2); p.visible = u > 0 && t < 11 && u < 1; if (p.visible) { pulseCurve.getPointAt(K.clamp(u), V); p.position.copy(V); } });
      small.scale.setScalar(1 + 0.25 * K.prog(t, B[2] + 1.0, B[3] + 1.0, 'inOut'));
      shrooms.forEach((m, i) => { const p = K.prog(t, B[3] + 0.3 + i * 0.25, B[3] + 0.9 + i * 0.25, 'back'); m.scale.setScalar(Math.max(0.001, p)); m.visible = p > 0; });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.06 });
    k.play('sparkle', { t: 0.4, gain: 0.15, pitch: 0.8 });
    k.play('swish', { t: B[1] - 0.2, gain: 0.15, pitch: 1.6, dur: 2.5 });
    for (let i = 0; i < 10; i++) k.play('tick', { t: B[1] + i * 0.25, gain: 0.08, pitch: 1.5 + (i % 3) * 0.2 });
    for (let i = 0; i < 10; i++) k.play('bubble', { t: B[2] + i * 0.28, gain: 0.15, pitch: 0.9 + (i % 4) * 0.1 });
    k.play('hum', { t: B[2], gain: 0.1, pitch: 1.4, dur: 2.5 });
    for (let i = 0; i < 5; i++) k.play('pop', { t: B[3] + 0.6 + i * 0.25, gain: 0.3, pitch: 0.7 + i * 0.1 });
    k.play('chime', { t: B[3] + 2.0, gain: 0.2, pitch: 1.0, music: true });
  },
  post: null,
};
