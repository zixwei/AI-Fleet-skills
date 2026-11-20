window.STYLES = window.STYLES || {};
STYLES['crystal-garden'] = {
  id: 'crystal-garden', name: 'Crystal Garden',
  family: 'Earth, weather and sky',
  use: 'Explainer',
  look: 'A dark geode cut in half, its inside lined with violet crystal points. In the middle, a crystal grows from a seed: faceted six-sided columns with pale translucent tips. Hard sparkles flash on the edges as the light moves.',
  motion: 'Crystals grow from seed points, column by column. A small light circles the geode, so highlights slide across the facets and sparkles flash on the tips.',
  shownHere: 'How a snowflake gets six sides: ice starts as a tiny hexagon; water molecules lock together in a six-sided pattern; the corners reach further into the damp air, so they grow fastest into arms; each arm branches in the same conditions as the others, so all six match.',
  goodFor: 'Growth from simple rules: crystals, networks, organisations, cities, fractals. Anything where structure emerges step by step from a seed.',
  fonts: ['Josefin Sans:wght@600;700'],
  duration: 12,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Ice starts as a tiny hexagon' },
    { t: 2.4, label: 'Water molecules lock in a six-sided pattern' },
    { t: 4.8, label: 'Corners reach more damp air: arms grow there' },
    { t: 7.2, label: 'Each arm branches the same way' },
    { t: 9.6, label: 'Six sides, from one rule' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Josefin Sans', BE = this.beats;
    scene.background = new T.Color('#07050c'); scene.add(S.camera);
    const L = K.lights(S, 'night', { size: 6 }); L.key.intensity = 0.6; S.scene.environmentIntensity = 0.9;
    const std = (c, r = 0.6, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const orbit = new T.PointLight('#d8e8ff', 40, 20, 1.5); scene.add(orbit);
    // the geode: a rough half shell lined with violet points
    const shellGeo = new T.SphereGeometry(5.2, 64, 32, Math.PI, Math.PI); const sp = shellGeo.attributes.position, rr = K.rng(72);
    for (let i = 0; i < sp.count; i++) { const v = new T.Vector3().fromBufferAttribute(sp, i), n = 1 + 0.05 * Math.sin(v.x * 2.1) * Math.cos(v.y * 1.7) + 0.03 * Math.sin(v.z * 3.3); v.multiplyScalar(n); sp.setXYZ(i, v.x, v.y, v.z); }
    shellGeo.computeVertexNormals();
    const shell = new T.Mesh(shellGeo, std('#2a2030', 0.9, { side: T.DoubleSide })); scene.add(shell);
    const rim = new T.Mesh(new T.RingGeometry(4.9, 5.6, 96), std('#8a7a6a', 0.95)); scene.add(rim);
    const NQ = 420, quartz = new T.InstancedMesh(new T.ConeGeometry(0.16, 0.7, 6), new T.MeshStandardMaterial({ color: '#8a5ad0', roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.85, emissive: '#2a1050', emissiveIntensity: 0.4 }), NQ);
    const O = new T.Object3D(), up = new T.Vector3(0, 1, 0);
    for (let i = 0; i < NQ; i++) { const u = rr(), v = rr() * Math.PI * 2, ph = Math.acos(1 - u), dir = new T.Vector3(Math.sin(ph) * Math.cos(v), Math.sin(ph) * Math.sin(v), -Math.cos(ph)); O.position.copy(dir).multiplyScalar(4.75); O.quaternion.setFromUnitVectors(up, dir.clone().negate()); O.scale.setScalar(rr.range(0.6, 1.6)); O.updateMatrix(); quartz.setMatrixAt(i, O.matrix); }
    scene.add(quartz);
    // the ice crystal: a hexagonal plate, six arms from its corners, then side branches
    const ice = new T.MeshStandardMaterial({ color: '#d8f0ff', roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.85, emissive: '#5a90c0', emissiveIntensity: 0.35 });
    const flake = new T.Group(); flake.position.set(0, 0.3, -1.0); scene.add(flake);
    const hexPrism = (r, len) => { const g = new T.CylinderGeometry(r, r, len, 6); g.translate(0, len / 2, 0); return g; };
    const plateGeo = new T.CylinderGeometry(0.5, 0.5, 0.14, 6); plateGeo.rotateX(Math.PI / 2);
    const plate = new T.Mesh(plateGeo, ice); plate.rotation.z = Math.PI / 6; flake.add(plate);
    const arms = [], branches = [];
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3, piv = new T.Group(); piv.rotation.z = a - Math.PI / 2; flake.add(piv);
      const arm = new T.Mesh(hexPrism(0.09, 2.6), ice); arm.position.y = 0.45; piv.add(arm); arms.push(arm);
      [0.9, 1.5, 2.05].forEach((d, j) => [-1, 1].forEach(s => { const bp = new T.Group(); bp.position.y = 0.45 + d; bp.rotation.z = s * Math.PI / 3; piv.add(bp); const br = new T.Mesh(hexPrism(0.06, 0.9 - j * 0.22), ice); bp.add(br); branches.push({ br, j }); })); }
    // the molecule lattice: oxygen atoms on a six-sided grid, with bonds
    const lat = [], bonds = []; const ax = [new T.Vector2(1, 0), new T.Vector2(0.5, Math.sqrt(3) / 2)], A = 0.34;
    for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) { const p = ax[0].clone().multiplyScalar(i * A).add(ax[1].clone().multiplyScalar(j * A)); if (p.length() < 1.45 && (i - j) % 3 !== 0) lat.push(p); }
    lat.forEach((p, i) => lat.forEach((q, j) => { if (j > i && p.distanceTo(q) < A * 0.62) bonds.push(p.x, p.y, 0.12, q.x, q.y, 0.12); }));
    const atoms = new T.InstancedMesh(new T.SphereGeometry(0.055, 10, 8), new T.MeshBasicMaterial({ color: '#ff6a6a', transparent: true }), lat.length); lat.forEach((p, i) => { O.position.set(p.x, p.y, 0.12); O.quaternion.identity(); O.scale.setScalar(1); O.updateMatrix(); atoms.setMatrixAt(i, O.matrix); }); flake.add(atoms);
    const bondL = new T.LineSegments(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(bonds, 3)), new T.LineBasicMaterial({ color: '#ffffff', transparent: true })); flake.add(bondL);
    // sparkles at the tips
    const sparkTex = K.canvasTex(64, 64, (g, r, w, h) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(220,240,255,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(30, 0, 4, 64); g.fillRect(0, 30, 64, 4); }, 1);
    const sparks = Array.from({ length: 12 }, (_, i) => { const s = new T.Sprite(new T.SpriteMaterial({ map: sparkTex, color: '#ffffff', blending: T.AdditiveBlending, transparent: true, depthWrite: false })); s.scale.setScalar(0.5); flake.add(s); return s; });
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 66, color: '#efe8ff', bg: 'rgba(10,6,18,0.8)', radius: 10, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([{ t: 0, pos: [0.4, 0.6, 3.4], look: [0, 0.3, -1] }, { t: 2.4, pos: [0.2, 0.5, 3.2], look: [0, 0.3, -1] }, { t: 6, pos: [-0.8, 0.8, 6.6], look: [0, 0.3, -1] }, { t: 12, pos: [1.2, 0.4, 9.6], look: [0, 0.2, -1.2] }], S.camera);
    const W = new T.Vector3();
    return (t, realT) => {
      cam(t);
      orbit.position.set(Math.cos(realT * 0.9) * 3.2, 1.6 + Math.sin(realT * 0.7) * 1.2, 1.5 + Math.sin(realT * 0.9) * 1.5);
      const seed = K.prog(t, -0.4, 0.8, 'out'); plate.scale.setScalar(Math.max(0.01, seed * (1 + 0.6 * K.prog(t, B[2], B[2] + 1.0))));
      const latOn = K.prog(t, B[1] + 0.1, B[1] + 0.8) * (1 - K.prog(t, B[2] + 0.4, B[2] + 1.2)); atoms.material.opacity = latOn; bondL.material.opacity = latOn * 0.8; atoms.visible = bondL.visible = latOn > 0.01;
      const armG = K.prog(t, B[2] + 0.2, B[3] + 0.2, 'out'); arms.forEach(a => { a.scale.set(1, Math.max(0.001, armG), 1); a.visible = armG > 0.01; });
      branches.forEach(b => { const g = K.prog(t, B[3] + 0.1 + b.j * 0.35, B[3] + 1.3 + b.j * 0.35, 'out'); b.br.scale.set(1, Math.max(0.001, g), 1); b.br.visible = g > 0.01; });
      flake.rotation.y = 0.25 * Math.sin(realT * 0.4); flake.rotation.x = 0.12 * Math.sin(realT * 0.3);
      sparks.forEach((s, i) => { const k = i % 6, a = k * Math.PI / 3, r = i < 6 ? 0.45 + 2.6 * armG : 0.45 + 1.4 * armG; s.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.12); const f = Math.max(0, Math.sin(realT * 3.1 + i * 2.3)) ** 12; s.material.opacity = f * (armG > 0.1 || i < 6 ? 1 : 0) * (t > 0.2 ? 1 : 0); s.scale.setScalar(0.3 + 0.4 * f); });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('space', { gain: 0.05 });
    k.play('glass', { t: 0.1, gain: 0.2, pitch: 2.0 }); k.play('chime', { t: 0.3, gain: 0.12, pitch: 1.5, music: true });
    for (let i = 0; i < 6; i++) k.play('blip', { t: B[1] + 0.2 + i * 0.1, gain: 0.08, pitch: 2.0 + i * 0.1 });
    for (let i = 0; i < 6; i++) k.play('glass', { t: B[2] + 0.3 + i * 0.25, gain: 0.12, pitch: 1.4 + i * 0.12 }); k.play('riser', { t: B[2] + 0.2, gain: 0.08, pitch: 1.2, dur: 2.0 });
    for (let i = 0; i < 9; i++) k.play('sparkle', { t: B[3] + 0.2 + i * 0.22, gain: 0.08 + 0.01 * i });
    k.play('chime', { t: B[4] + 0.4, gain: 0.15, pitch: 1.0, music: true }); k.play('bell', { t: B[4] + 1.0, gain: 0.1, pitch: 2.0, music: true });
  },
  post: null,
};
