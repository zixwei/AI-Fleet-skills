window.STYLES = window.STYLES || {};
STYLES['infinity-mirror'] = {
  id: 'infinity-mirror', name: 'Infinity Mirror',
  family: 'Strange worlds',
  use: 'Explainer',
  look: 'A dark box with two facing mirrors and a ring of small warm lamps. Everything inside repeats into the depth, each copy a little further, smaller and dimmer, as far as the eye can follow.',
  motion: 'One reflection after another lights up deeper in the tunnel. In each reflection the number of glowing beads doubles, and a small number beside it counts. The camera leans in toward the depth.',
  shownHere: 'How doubling reaches a million in 20 steps: start with one; each step doubles it, 2, 4, 8; after 10 steps there are 1,024; after 20 steps there are 1,048,576; the depth of the tunnel is the number of steps, not the size.',
  goodFor: 'Exponential growth and repetition: compounding, viral spread, recursion, chain reactions. Anything where "one more step" changes everything.',
  fonts: ['Space Grotesk:wght@500;700'],
  duration: 12,
  samples: 4,
  // CONTENT
  steps: 20,
  beats: [
    { t: 0.0, label: 'Start with one' },
    { t: 2.4, label: 'Each step doubles it: 2, 4, 8, 16' },
    { t: 4.8, label: 'Ten steps: 1,024' },
    { t: 7.2, label: 'Twenty steps: 1,048,576' },
    { t: 9.6, label: 'The depth is the number of steps' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Space Grotesk', BE = this.beats, NS = this.steps;
    scene.background = new T.Color('#020204'); scene.fog = new T.FogExp2('#020204', 0.035); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#202030', '#000000', 0.3));
    const std = (c, r = 0.4, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    // the box: a front frame and dark walls running into the depth
    const D = 1.1, RAD = 2.2, LEN = NS * D + 4;
    const frameS = new T.Shape([new T.Vector2(-3.4, -3.4), new T.Vector2(3.4, -3.4), new T.Vector2(3.4, 3.4), new T.Vector2(-3.4, 3.4)]); const hole = new T.Path(); hole.absarc(0, 0, 2.7, 0, Math.PI * 2, true); frameS.holes.push(hole);
    const frame = new T.Mesh(new T.ExtrudeGeometry(frameS, { depth: 0.3, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05 }), std('#1a1a1e', 0.3, { metalness: 0.7 })); frame.position.z = 0.1; scene.add(frame);
    const tunnel = new T.Mesh(new T.CylinderGeometry(2.7, 2.7, LEN, 48, 1, true), std('#0a0a10', 0.15, { metalness: 0.9, side: T.BackSide })); tunnel.rotation.x = Math.PI / 2; tunnel.position.z = -LEN / 2 + 0.1; scene.add(tunnel);
    // one ring of lamps per reflection, each dimmer
    const NL = 28, lampGeo = new T.SphereGeometry(0.07, 10, 8);
    const rings = Array.from({ length: NS + 1 }, (_, k) => { const im = new T.InstancedMesh(lampGeo, new T.MeshBasicMaterial({ color: new T.Color('#ffc070').multiplyScalar(Math.pow(0.86, k)), transparent: true }), NL); const O = new T.Object3D(); for (let i = 0; i < NL; i++) { const a = i / NL * Math.PI * 2; O.position.set(Math.cos(a) * RAD, Math.sin(a) * RAD, -k * D); O.updateMatrix(); im.setMatrixAt(i, O.matrix); } scene.add(im); return im; });
    // beads: 2^k glowing beads in layer k; past 512 a dense glowing disc stands in for them
    const bead = K.canvasTex(64, 64, (g, r, w, h) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(160,220,255,0.8)'); gr.addColorStop(1, 'rgba(60,120,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, 1);
    const dense = K.canvasTex(512, 512, (g, r, w, h) => { g.clearRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { const a = r() * 6.283, rad = Math.sqrt(r()) * 250; g.fillStyle = `rgba(${r.range(150, 230)},${r.range(200, 250)},255,${r.range(0.4, 0.9)})`; g.fillRect(256 + Math.cos(a) * rad, 256 + Math.sin(a) * rad, 2, 2); } }, 2);
    const layers = Array.from({ length: NS + 1 }, (_, k) => { const n = Math.pow(2, k), g = new T.Group(); g.position.z = -k * D - 0.02; scene.add(g);
      if (n <= 512) { const pos = []; const R = 0.15 + 1.6 * Math.min(1, Math.sqrt(n) / 22); for (let i = 0; i < n; i++) { const a = i * 2.39996, r = n === 1 ? 0 : R * Math.sqrt((i + 0.5) / n); pos.push(Math.cos(a) * r, Math.sin(a) * r, 0); }
        g.add(new T.Points(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(pos, 3)), new T.PointsMaterial({ map: bead, size: n === 1 ? 1.3 : Math.max(0.09, 0.45 / Math.sqrt(Math.log2(n) + 1)), transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: new T.Color(1, 1, 1).multiplyScalar(Math.pow(0.93, k)) }))); }
      else { const m = new T.Mesh(new T.CircleGeometry(1.75, 48), new T.MeshBasicMaterial({ map: dense, transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: new T.Color(1, 1, 1).multiplyScalar(Math.pow(0.95, k - 9)) })); g.add(m); }
      g.visible = false; return { g, n }; });
    // counts beside some layers
    const fmt = n => n.toLocaleString('en-US');
    const counts = Array.from({ length: NS + 1 }, (_, k) => { const l = K.label(`step ${k}: ${fmt(Math.pow(2, k))}`, { font: F, weight: 700, px: 60, color: '#cfe8ff', bg: 'rgba(4,6,14,0.85)', radius: 10, pad: 0.25, height: 0.5 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, -1.8, -8); l.scale.setScalar(0.75); l.visible = false; S.camera.add(l); return l; });
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 66, color: '#eef4ff', bg: 'rgba(4,6,14,0.82)', radius: 10, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    // how many layers are lit by time t
    const lit = t => t < B[1] ? 0.6 : t < B[2] ? 1 + 4 * K.prog(t, B[1] + 0.2, B[2] - 0.2) : t < B[3] ? 5 + 5 * K.prog(t, B[2] + 0.1, B[2] + 1.6) : t < B[4] ? 10 + 10 * K.prog(t, B[3] + 0.1, B[3] + 1.8) : 20;
    const cam = K.camPath([{ t: 0, pos: [0.8, 0.4, 12.5], look: [0, -0.4, -2] }, { t: 4.8, pos: [0.6, 0.3, 11.0], look: [0, -0.4, -6] }, { t: 7.2, pos: [0.4, 0.3, 10.0], look: [0, -0.4, -10] }, { t: 9.6, pos: [2.4, 1.0, 11.5], look: [0, -0.4, -8] }, { t: 12, pos: [2.8, 1.2, 12.5], look: [0, -0.4, -7] }], S.camera);
    return (t, realT) => {
      cam(t);
      const L = lit(t);
      layers.forEach((ly, k) => { const on = K.clamp(L - k + 1); ly.g.visible = on > 0.01; ly.g.scale.setScalar(0.6 + 0.4 * on); ly.g.children[0].material.opacity = on; });
      rings.forEach((r, k) => { r.material.opacity = K.clamp(L - k + 1.5) * (0.8 + 0.2 * Math.sin(realT * 5 + k)); r.visible = r.material.opacity > 0.01; });
      const shown = Math.min(NS, Math.floor(L)); counts.forEach((l, k) => { l.visible = k === shown; });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('space', { gain: 0.05 });
    k.play('chime', { t: 0.3, gain: 0.15, pitch: 1.0, music: true });
    for (let i = 1; i <= 4; i++) k.play('blip', { t: B[1] + 0.2 + (i - 1) * (2.0 / 4), gain: 0.15, pitch: 1 + i * 0.12 });
    for (let i = 5; i <= 10; i++) k.play('tick', { t: B[2] + 0.1 + (i - 5) * 0.3, gain: 0.15, pitch: 1.4 + i * 0.05 }); k.play('chime', { t: B[2] + 1.7, gain: 0.15, pitch: 1.5, music: true });
    for (let i = 11; i <= 20; i++) k.play('tick', { t: B[3] + 0.1 + (i - 11) * 0.18, gain: 0.12, pitch: 1.8 + i * 0.04 }); k.play('riser', { t: B[3] + 0.1, gain: 0.12, pitch: 1.0, dur: 1.8 }); k.play('sparkle', { t: B[3] + 2.0, gain: 0.25 });
    k.play('whoosh', { t: B[4] + 0.1, gain: 0.15, pitch: 0.5, dur: 1.6 }); k.play('bell', { t: B[4] + 1.2, gain: 0.15, pitch: 0.5, music: true });
  },
  post: null,
};
