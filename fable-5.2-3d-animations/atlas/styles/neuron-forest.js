window.STYLES = window.STYLES || {};
STYLES['neuron-forest'] = {
  id: 'neuron-forest', name: 'Neuron Forest',
  family: 'Strange worlds',
  use: 'Story',
  look: 'A dark forest at night where each tree is a nerve cell: a glowing knot at the base, a tall trunk, a branching crown, and long roots that almost touch the next tree. Thin blue fog hangs between the trunks.',
  motion: 'Sparks of light run up the roots, through the trunk and out along the branches, then jump the small gap to the next tree with a flash. Paths that carry sparks again and again grow thicker and brighter.',
  shownHere: 'How a memory forms: each tree is a nerve cell; a signal runs through the cell; it jumps the small gap to the next cell; when the same path is used again and again, the links grow stronger; a strong path is a memory.',
  goodFor: 'Learning, habits and networks: memory, practice, neural nets, social ties, any "use it and it grows" story.',
  fonts: ['Cormorant Garamond:wght@600;700'],
  duration: 12,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Each tree is a nerve cell' },
    { t: 2.4, label: 'A signal runs through the cell' },
    { t: 4.8, label: 'It jumps the small gap to the next one' },
    { t: 7.2, label: 'Used again and again, the path grows stronger' },
    { t: 9.6, label: 'A strong path is a memory' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Cormorant Garamond', BE = this.beats;
    scene.background = new T.Color('#03050c'); scene.fog = new T.FogExp2('#06102a', 0.06); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#2a3a6a', '#000000', 0.4));
    const ground = new T.Mesh(new T.PlaneGeometry(80, 80), new T.MeshStandardMaterial({ color: '#05080f', roughness: 0.9 })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
    const rr = K.rng(99);
    const glowMat = c => new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.85, blending: T.AdditiveBlending, depthWrite: false });
    // one neuron-tree: roots in, a knot (the cell body), a trunk (the axon), a crown of branches (the endings)
    const tube = (pts, r, mat) => new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), Math.max(8, pts.length * 6), r, 6), mat);
    const neuron = (x, z, h, dim, toward) => {
      const g = new T.Group(); g.position.set(x, 0, z); scene.add(g);
      const col = new T.Color('#5a9aff').multiplyScalar(dim), mat = glowMat(col);
      const knot = new T.Mesh(new T.SphereGeometry(0.35, 20, 14), glowMat(new T.Color('#9ac8ff').multiplyScalar(dim))); knot.position.y = 0.4; g.add(knot);
      const trunk = [new T.Vector3(0, 0.4, 0), new T.Vector3(0.1, h * 0.35, 0.05), new T.Vector3(-0.08, h * 0.7, -0.05), new T.Vector3(0, h, 0)]; g.add(tube(trunk, 0.09, mat));
      const ends = []; // crown branch tips (in world space)
      const branch = (p, d, len, depth) => { const q = p.clone().addScaledVector(d, len); const mid = p.clone().lerp(q, 0.5).add(new T.Vector3(rr.range(-0.2, 0.2), rr.range(-0.1, 0.2), rr.range(-0.2, 0.2))); g.add(tube([p, mid, q], 0.05 * (depth + 1) / 3, mat));
        if (depth > 0) for (let k = 0; k < 2; k++) { const nd = d.clone().add(new T.Vector3(rr.range(-0.7, 0.7), rr.range(-0.1, 0.5), rr.range(-0.7, 0.7))).normalize(); branch(q, nd, len * 0.7, depth - 1); } else ends.push(q.clone().add(g.position)); };
      for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + rr() * 0.6; branch(new T.Vector3(0, h, 0), new T.Vector3(Math.cos(a) * 0.7, 0.8, Math.sin(a) * 0.7).normalize(), h * 0.28, 2); }
      const roots = []; for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + 0.4, p = [new T.Vector3(0, 0.4, 0), new T.Vector3(Math.cos(a) * 0.8, 0.15, Math.sin(a) * 0.8), new T.Vector3(Math.cos(a) * 1.6, 0.05, Math.sin(a) * 1.6)]; g.add(tube(p, 0.05, mat)); roots.push(p); }
      return { g, h, ends, trunk, knot, mat };
    };
    // the main chain A -> B -> C, and background trees
    const A = neuron(-6, 0, 3.8, 1, 1), Bn = neuron(-1, -0.6, 4.2, 1, 1), C = neuron(4, 0.2, 3.9, 1, 1);
    for (let i = 0; i < 16; i++) neuron(rr.range(-16, 16), rr.range(-14, -4), rr.range(3.2, 5.0), rr.range(0.25, 0.5));
    // the path: A's crown branch reaches toward B's root; a small gap; then up B and out to C
    const W = (n, v) => v.clone().add(n.g.position);
    const pathAB = [W(A, new T.Vector3(0, A.h, 0)), W(A, new T.Vector3(1.6, A.h + 0.6, -0.2)), new T.Vector3(-3.4, 1.9, -0.4), new T.Vector3(-1.9, 0.6, -0.6)];
    const pathBC = [W(Bn, new T.Vector3(0, Bn.h, 0)), W(Bn, new T.Vector3(1.6, Bn.h + 0.4, 0.1)), new T.Vector3(1.8, 2.1, 0.2), new T.Vector3(3.1, 0.6, 0.2)];
    const linkMat = glowMat(new T.Color('#c88a20')); linkMat.opacity = 0.0;
    const linkAB = tube(pathAB, 0.07, glowMat(new T.Color('#5a9aff'))), linkBC = tube(pathBC, 0.07, glowMat(new T.Color('#5a9aff'))); scene.add(linkAB, linkBC);
    const strongAB = tube(pathAB, 0.16, linkMat), strongBC = tube(pathBC, 0.16, linkMat); scene.add(strongAB, strongBC);
    // the full route a spark takes: A's roots, up A's trunk, along the link, (gap), up B's trunk, along the link, (gap), C
    const route = [W(A, new T.Vector3(-1.6, 0.05, 0.3)), W(A, new T.Vector3(-0.6, 0.2, 0.1)), ...A.trunk.map(v => W(A, v)), ...pathAB.slice(1), new T.Vector3(-1.2, 0.4, -0.6), ...Bn.trunk.map(v => W(Bn, v)), ...pathBC.slice(1), new T.Vector3(3.8, 0.4, 0.2), ...C.trunk.map(v => W(C, v))];
    const curve = new T.CatmullRomCurve3(route, false, 'catmullrom', 0.2);
    const gapU = [0.47, 0.82]; // where along the route the two gaps sit (approximate)
    const spark = new T.Mesh(new T.SphereGeometry(0.14, 12, 10), new T.MeshBasicMaterial({ color: '#ffffff' })); scene.add(spark);
    const haloTex = K.canvasTex(64, 64, (g, r, w, h) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(0.3, 'rgba(255,200,120,0.5)'); gr.addColorStop(1, 'rgba(255,160,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, 1);
    const halo = new T.Sprite(new T.SpriteMaterial({ map: haloTex, blending: T.AdditiveBlending, depthWrite: false, transparent: true })); halo.scale.setScalar(2.4); scene.add(halo);
    const flashes = gapU.map(() => { const s = new T.Sprite(new T.SpriteMaterial({ map: haloTex, blending: T.AdditiveBlending, depthWrite: false, transparent: true, color: '#cfe8ff' })); s.scale.setScalar(0.01); scene.add(s); return s; });
    const sparkL = new T.PointLight('#ffd890', 0, 6, 1.5); scene.add(sparkL);
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 70, color: '#e8f0ff', bg: 'rgba(4,8,20,0.8)', radius: 10, pad: 0.35, height: 0.4 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    // spark runs: one slow run in beats 1-2, three quick runs in beat 3, a bright steady run at the end
    const runs = [[B[1] + 0.1, B[3] - 0.1], [B[3] + 0.05, B[3] + 0.85], [B[3] + 0.85, B[3] + 1.65], [B[3] + 1.65, B[4] + 0.05], [B[4] + 0.3, B[4] + 1.6]];
    const cam = K.camPath([{ t: 0, pos: [-5.0, 3.6, 14.0], look: [-3.0, 3.0, 0] }, { t: 2.4, pos: [-6.0, 3.0, 12.0], look: [-4.5, 2.8, 0] }, { t: 4.8, pos: [-3.0, 3.0, 12.0], look: [-2.5, 2.4, 0] }, { t: 7.2, pos: [-1.0, 3.8, 16.0], look: [-1.0, 3.0, 0] }, { t: 12, pos: [-0.6, 4.2, 17.0], look: [-1.0, 3.0, 0] }], S.camera);
    return (t, realT) => {
      cam(t);
      let u = -1; runs.forEach(([a, b]) => { if (t >= a && t <= b) u = (t - a) / (b - a); });
      spark.visible = halo.visible = u >= 0; if (u >= 0) { const p = curve.getPointAt(u); spark.position.copy(p); halo.position.copy(p); sparkL.position.copy(p); }
      sparkL.intensity = u >= 0 ? 12 : 0;
      flashes.forEach((f, i) => { let fl = 0; if (u >= 0) fl = K.clamp(1 - Math.abs(u - gapU[i]) / 0.04); f.position.copy(curve.getPointAt(gapU[i])); f.scale.setScalar(0.01 + 2.2 * fl); f.material.opacity = fl; });
      const used = runs.filter(([a, b]) => t > b).length, strength = K.clamp((used - 1) / 3) * (0.6 + 0.4 * K.prog(t, B[4], B[4] + 1.0));
      linkMat.opacity = 0.75 * strength * (0.85 + 0.15 * Math.sin(realT * 4));
      [linkAB, linkBC].forEach(l => { l.material.opacity = 0.5 + 0.3 * strength; });
      [A, Bn, C].forEach(n => { n.knot.scale.setScalar(1 + 0.2 * Math.sin(realT * 3 + n.g.position.x)); });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('night', { gain: 0.06 }); k.bed('space', { gain: 0.03 });
    k.play('chime', { t: 0.5, gain: 0.1, pitch: 0.8, music: true });
    const runs = [[B[1] + 0.1, B[3] - 0.1], [B[3] + 0.05, B[3] + 0.85], [B[3] + 0.85, B[3] + 1.65], [B[3] + 1.65, B[4] + 0.05], [B[4] + 0.3, B[4] + 1.6]];
    runs.forEach(([a, b], i) => { k.play('blip', { t: a, gain: 0.12, pitch: 1.0 + i * 0.1 }); [0.47, 0.82].forEach((g, j) => k.play('zap', { t: a + (b - a) * g, gain: 0.12 + i * 0.03, pitch: 1.4 + j * 0.2 + i * 0.05 })); });
    k.play('hum', { t: B[1] + 0.1, gain: 0.08, pitch: 0.7, dur: 4.6 });
    k.play('riser', { t: B[3] + 0.1, gain: 0.1, pitch: 1.0, dur: 2.2 }); k.play('bell', { t: B[4] + 1.6, gain: 0.15, pitch: 0.75, music: true }); k.play('sparkle', { t: B[4] + 1.7, gain: 0.2 });
  },
  post: null,
};
