window.STYLES = window.STYLES || {};
STYLES['iceberg-split'] = {
  id: 'iceberg-split', name: 'Iceberg Split',
  family: 'Strange worlds',
  use: 'Explainer',
  look: 'A view split at the waterline: bright sky and a small white tip above, a very large blue mass of ice below. Light shafts fall through the water, small bubbles rise, and labelled chambers glow inside the ice.',
  motion: 'The camera starts above the water on the tip, then sinks through the surface and down the side of the ice. Each chamber lights up as the camera reaches it.',
  shownHere: 'The hidden costs of a cheap flight: the fare you see is only the tip; below it are fees for bags and seats, the trip to an airport far from the city, early or late flights that can mean a night in a hotel; most of the cost is below the waterline.',
  goodFor: 'Hidden depth: hidden costs, technical debt, the work behind a launch, culture under behaviour, anything where what you see is a small part of the whole.',
  fonts: ['Archivo:wght@600;800'],
  duration: 12,
  samples: 4,
  // CONTENT: one chamber per beat after the first: depth (y) and text
  chambers: [
    { y: 1.3, text: 'The fare: 29' },
    { y: -1.6, text: 'Bag and seat fees' },
    { y: -3.6, text: 'A far-off airport: transfer cost and time' },
    { y: -5.6, text: 'A 6 a.m. flight: a night in a hotel' },
    { y: -7.6, text: 'Most of the cost is below the line' },
  ],
  beats: [
    { t: 0.0, label: 'The price you see is the tip' },
    { t: 2.4, label: 'Under the water: fees for bags and seats' },
    { t: 4.8, label: 'An airport far from the city' },
    { t: 7.2, label: 'Odd hours that cost a hotel night' },
    { t: 9.6, label: 'The real cost is mostly hidden' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Archivo', CH = this.chambers, BE = this.beats;
    const SKY = new T.Color('#9ed4f6'), DEEP = new T.Color('#0a2a4a');
    scene.background = SKY.clone(); scene.fog = new T.FogExp2(DEEP.clone(), 0.0); scene.add(S.camera);
    const hemi = new T.HemisphereLight('#ffffff', '#1a4a7a', 1.0); scene.add(hemi);
    const sun = new T.DirectionalLight('#ffffff', 2.2); sun.position.set(-4, 10, 6); scene.add(sun);
    const std = (c, r = 0.5, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    // the iceberg: a lumpy shape, small above the water and huge below
    const geo = new T.IcosahedronGeometry(1, 5), p = geo.attributes.position, rr = K.rng(97);
    for (let i = 0; i < p.count; i++) { const v = new T.Vector3().fromBufferAttribute(p, i); const n = 1 + 0.12 * Math.sin(v.x * 5 + 1) * Math.cos(v.y * 4) + 0.08 * Math.sin(v.z * 7 - v.y * 3);
      const y = v.y, above = y > 0.72, w = above ? 0.9 * (1 - (y - 0.72) * 2.4) : 0.9 + 2.1 * K.clamp((0.72 - y) / 0.25), yy = above ? (y - 0.72) * 7.5 : (y - 0.72) * 5.2; p.setXYZ(i, v.x * w * n, yy, v.z * w * 0.88 * n); }
    geo.computeVertexNormals();
    const iceMat = new T.MeshStandardMaterial({ color: '#cfeaff', roughness: 0.35, transparent: true, opacity: 0.55, emissive: '#2a6aa0', emissiveIntensity: 0.25, depthWrite: false, side: T.DoubleSide });
    const ice = new T.Mesh(geo, iceMat); ice.renderOrder = 2; scene.add(ice);
    const tipMat = std('#ffffff', 0.6); const tip = new T.Mesh(geo, tipMat); tip.scale.setScalar(0.995); scene.add(tip);
    tipMat.clippingPlanes = [new T.Plane(new T.Vector3(0, 1, 0), 0)]; S.renderer.localClippingEnabled = true;
    // the water: a surface seen from both sides
    const surf = new T.Mesh(new T.PlaneGeometry(200, 200), new T.MeshStandardMaterial({ color: '#3a8ac0', roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.55, side: T.DoubleSide, depthWrite: false })); surf.rotation.x = -Math.PI / 2; scene.add(surf);
    // light shafts and bubbles under water
    const shaftTex = K.canvasTex(64, 256, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, 1);
    const shafts = Array.from({ length: 7 }, (_, i) => { const m = new T.Mesh(new T.PlaneGeometry(rr.range(0.6, 1.4), 14), new T.MeshBasicMaterial({ map: shaftTex, color: '#bfe8ff', transparent: true, opacity: 0.18, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); m.position.set(rr.range(-7, 7), -7, rr.range(-2, 6)); m.rotation.set(0, rr.range(-0.6, 0.6), 0.25); scene.add(m); return m; });
    const NB = 160, bp = new Float32Array(NB * 3), bseed = Array.from({ length: NB }, () => [rr.range(-6, 6), rr.range(-1, 6), rr()]);
    const bubbles = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(bp, 3)), new T.PointsMaterial({ color: '#dff4ff', size: 0.07, transparent: true, opacity: 0.8 })); scene.add(bubbles);
    // chambers: glowing pockets inside the ice, each with a label
    const chambers = CH.map((c, i) => { const g = new T.Group(); g.position.set(i ? (i % 2 ? -0.5 : 0.4) : 0, c.y, 1.0 + (i ? 0.8 : 0)); scene.add(g);
      const glow = new T.Mesh(new T.SphereGeometry(i ? 0.55 : 0.25, 24, 16), new T.MeshBasicMaterial({ color: i ? '#ffb040' : '#ff5a3a', transparent: true, opacity: 0.15 })); g.add(glow);
      const l = K.label(c.text, { font: F, weight: 800, px: 56, color: '#0a1a2a', bg: 'rgba(255,255,255,0.92)', radius: 12, pad: 0.2, height: i === 4 ? 0.4 : 0.26 }); l.renderOrder = 5; l.material.depthTest = false; l.geometry.translate(l.geometry.parameters.width / 2, 0, 0); l.position.set(0.7, 0.2, 1.4); g.add(l); return { g, glow, l }; });
    const line = new T.Mesh(new T.PlaneGeometry(30, 0.03), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6 })); line.position.set(0, 0.01, 4); scene.add(line);
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 800, px: 64, color: '#ffffff', bg: 'rgba(10,30,60,0.82)', radius: 14, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const camY = t => K.lerp(1.6, -7.2, K.prog(t, 1.4, 10.4, 'inOut'));
    const look = new T.Vector3(), C = new T.Color();
    return (t, realT) => {
      const y = camY(t), wide = K.prog(t, B[4] + 0.4, 11.8, 'inOut');
      S.camera.position.set(1.4 + 2 * wide, K.lerp(y + 0.6, -3.2, wide), K.lerp(10.5, 22.0, wide)); look.set(1.4, K.lerp(y - 0.2, -3.3, wide), 0); S.camera.lookAt(look);
      const under = K.clamp(-S.camera.position.y / 1.5);
      scene.background.copy(SKY).lerp(DEEP, under); scene.fog.color.copy(scene.background); scene.fog.density = 0.05 * under;
      hemi.intensity = 1.0 - 0.3 * under;
      chambers.forEach((c, i) => { const on = i === 0 ? 1 : K.prog(t, B[i] + 0.6, B[i] + 1.2); c.glow.material.opacity = 0.15 + 0.6 * on * (0.85 + 0.15 * Math.sin(realT * 3 + i)); c.l.visible = on > 0.05; c.l.material.opacity = on; });
      for (let i = 0; i < NB; i++) { const [x, z, ph] = bseed[i]; bp[i * 3] = x + 0.1 * Math.sin(realT * 2 + i); bp[i * 3 + 1] = -10 + ((realT * 0.8 + ph * 10) % 10); bp[i * 3 + 2] = z; } bubbles.geometry.attributes.position.needsUpdate = true;
      shafts.forEach((s, i) => { s.material.opacity = 0.14 + 0.06 * Math.sin(realT * 0.8 + i * 1.7); });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.05 }); k.bed('water', { gain: 0.06 });
    k.play('chime', { t: 0.4, gain: 0.12, pitch: 1.2, music: true });
    k.play('splash', { t: 1.9, gain: 0.3, pitch: 0.7, dur: 1.2 }); k.play('bubble', { t: 2.3, gain: 0.2, pitch: 0.8 });
    [1, 2, 3].forEach(i => { k.play('bubble', { t: B[i] + 0.4, gain: 0.15, pitch: 0.6 + i * 0.1 }); k.play('pluck', { t: B[i] + 0.7, gain: 0.12, pitch: 0.9 - i * 0.1, music: true }); k.play('hum', { t: B[i] + 0.6, gain: 0.08, pitch: 0.5, dur: 1.4 }); });
    k.play('rumble', { t: B[4] + 0.3, gain: 0.2, pitch: 0.4, dur: 2.2 }); k.play('bell', { t: B[4] + 1.4, gain: 0.15, pitch: 0.45, music: true });
  },
  post: null,
};
