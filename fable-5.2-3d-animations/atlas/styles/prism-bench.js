window.STYLES = window.STYLES || {};
STYLES['prism-bench'] = {
  id: 'prism-bench', name: 'Prism Bench',
  family: 'Light and optics',
  use: 'Explainer',
  look: 'An optics bench in a dark lab with thin fog. Laser beams pass through a lens, a glass fibre, a combining mirror and a prism, all on brass posts along a steel rail. The beams glow in the fog.',
  motion: 'The beam path is the story. Each part drops onto the rail with a click, and the beam changes at once: it is focused, trapped in the glass, joined by a second colour, then split apart again. Bright pulses travel along the beams.',
  shownHere: 'How fibre optics carry data: data is sent as pulses of light; a lens focuses the light into a glass fibre; the light stays inside by bouncing off the walls (total internal reflection); several colours share one fibre; at the end a prism splits the colours apart again.',
  goodFor: 'Signal paths and pipelines: how a signal is shaped, combined, carried and separated; networks, sensors, any "follow the beam" process.',
  fonts: ['IBM Plex Mono:wght@500;700'],
  duration: 12,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Data leaves as pulses of light' },
    { t: 2.4, label: 'A lens focuses it into a fibre' },
    { t: 4.8, label: 'It bounces off the walls and stays in' },
    { t: 7.2, label: 'A second colour joins the same fibre' },
    { t: 9.6, label: 'At the end, a prism splits the colours' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'IBM Plex Mono', BE = this.beats;
    scene.background = new T.Color('#05070a'); scene.fog = new T.FogExp2('#05070a', 0.035); scene.add(S.camera);
    const L = K.lights(S, 'night', { size: 9 }); L.key.intensity = 0.6; S.scene.environmentIntensity = 0.25;
    const std = (c, r = 0.5, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const table = new T.Mesh(new T.BoxGeometry(22, 0.3, 8), std('#1a1c20', 0.7)); table.position.y = -1.35; table.receiveShadow = true; scene.add(table);
    for (let x = -10; x <= 10; x += 0.8) for (let z = -3.6; z <= 3.6; z += 0.8) { const h = new T.Mesh(new T.CircleGeometry(0.06, 8), std('#050505')); h.rotation.x = -Math.PI / 2; h.position.set(x, -1.19, z); scene.add(h); }
    const rail = new T.Mesh(new T.BoxGeometry(17, 0.18, 0.5), std('#9aa0a8', 0.25, { metalness: 0.9 })); rail.position.set(0, -1.1, 0); scene.add(rail);
    const brass = std('#c9a04a', 0.3, { metalness: 0.9 });
    const post = (h = 1.0) => { const g = new T.Group(); const p = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, h, 12), brass); p.position.y = -h / 2 - 0.0; const base = new T.Mesh(new T.BoxGeometry(0.6, 0.12, 0.6), std('#2a2c30', 0.4, { metalness: 0.6 })); base.position.y = -1.0; g.add(p, base); return g; };
    const tag = (txt, g, y = 0.9) => { const l = K.label(txt, { font: F, weight: 700, px: 52, color: '#cfe8ff', bg: 'rgba(10,16,24,0.8)', radius: 8, pad: 0.2, height: 0.26 }); l.position.y = y; g.add(l); return l; };
    // parts: each is a group that drops onto the rail at its beat
    const part = (x, z, beat, build, name) => { const g = new T.Group(); g.position.set(x, 0, z); scene.add(g); g.add(post()); build(g); const l = name ? tag(name, g) : null; return { g, beat, x, z, l }; };
    const laser = (g, c) => { const b = new T.Mesh(new T.BoxGeometry(1.4, 0.45, 0.45), std('#2a2c34', 0.35, { metalness: 0.5 })); g.add(b); const led = new T.Mesh(new T.SphereGeometry(0.05, 8, 8), new T.MeshBasicMaterial({ color: c })); led.position.set(-0.3, 0.25, 0.2); g.add(led); };
    const parts = [
      part(-7.0, 0, 0, g => laser(g, '#ff3030'), 'Laser 1'),
      part(-2.2, 0, 1, g => { const lens = new T.Mesh(new T.SphereGeometry(0.55, 32, 16), new T.MeshPhysicalMaterial({ color: '#cfe8ff', roughness: 0.05, transparent: true, opacity: 0.35, metalness: 0 })); lens.scale.set(0.25, 1, 1); g.add(lens); const ring = new T.Mesh(new T.TorusGeometry(0.56, 0.05, 8, 32), brass); ring.rotation.y = Math.PI / 2; g.add(ring); }, 'Lens'),
      part(1.6, 0, 2, g => { const rod = new T.Mesh(new T.CylinderGeometry(0.28, 0.28, 3.6, 32, 1, true), new T.MeshPhysicalMaterial({ color: '#bfe0ff', roughness: 0.05, transparent: true, opacity: 0.22, side: T.DoubleSide, depthWrite: false })); rod.rotation.z = Math.PI / 2; g.add(rod); [-1.8, 1.8].forEach(x => { const c = new T.Mesh(new T.TorusGeometry(0.3, 0.04, 8, 24), brass); c.rotation.y = Math.PI / 2; c.position.x = x; g.add(c); }); }, 'Glass fibre'),
      part(-4.6, 0, 3, g => { const m = new T.Mesh(new T.BoxGeometry(0.05, 0.7, 0.7), new T.MeshPhysicalMaterial({ color: '#a0ffd0', roughness: 0.05, transparent: true, opacity: 0.4, metalness: 0.3 })); m.rotation.y = Math.PI / 4; g.add(m); }, 'Combiner'),
      part(-4.6, -2.6, 3, g => { laser(g, '#30ff70'); g.children[1].rotation.y = Math.PI / 2; }, 'Laser 2'),
      part(5.6, 0, 4, g => { const sh = new T.Shape([new T.Vector2(-0.45, -0.3), new T.Vector2(0.45, -0.3), new T.Vector2(0, 0.48)]); const pr = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: false }), new T.MeshPhysicalMaterial({ color: '#e8f4ff', roughness: 0.05, transparent: true, opacity: 0.35 })); pr.geometry.translate(0, 0, -0.3); pr.rotation.x = -Math.PI / 2; g.add(pr); }, 'Prism'),
    ];
    // detectors at the far end
    const dets = [[8.4, 1.0, '#ff3030'], [8.4, -1.0, '#30ff70'], [8.4, 0, '#ffffff']].map(([x, z, c], i) => { const g = new T.Group(); g.position.set(x, 0, z); scene.add(g); g.add(post()); const b = new T.Mesh(new T.BoxGeometry(0.4, 0.6, 0.6), std('#2a2c34', 0.4)); g.add(b); const led = new T.Mesh(new T.SphereGeometry(0.07, 8, 8), new T.MeshBasicMaterial({ color: c })); led.position.set(0, 0.4, 0); g.add(led); return { g, led }; });
    // beams: a bright core with travelling pulses, and a soft glow; endpoints set each frame
    const pulseTex = K.canvasTex(16, 256, (g, r, w, h) => { const bits = '1011001110100110'; for (let i = 0; i < 16; i++) { g.fillStyle = bits[i] === '1' ? '#ffffff' : '#555555'; g.fillRect(0, i * 16, w, 16); } }, 4);
    pulseTex.wrapT = T.RepeatWrapping;
    const beam = c => { const tex = pulseTex.clone(); tex.wrapT = T.RepeatWrapping; tex.needsUpdate = true;
      const core = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, 1, 8, 1, true), new T.MeshBasicMaterial({ color: c, map: tex, blending: T.AdditiveBlending, transparent: true, depthWrite: false, fog: false }));
      const glow = new T.Mesh(new T.CylinderGeometry(0.11, 0.11, 1, 12, 1, true), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.12, blending: T.AdditiveBlending, depthWrite: false }));
      const g = new T.Group(); g.add(core, glow); scene.add(g); return { g, core, glow, tex }; };
    const pool = { r: Array.from({ length: 16 }, () => beam('#ff3a3a')), g: Array.from({ length: 16 }, () => beam('#3aff7a')) };
    const UP = new T.Vector3(0, 1, 0), D = new T.Vector3();
    const setBeam = (bm, a, b, realT, phase) => { D.subVectors(b, a); const len = D.length(); bm.g.visible = len > 0.01; bm.g.position.copy(a).addScaledVector(D, 0.5); bm.g.quaternion.setFromUnitVectors(UP, D.normalize()); bm.g.scale.set(1, len, 1); bm.tex.repeat.set(1, len / 2.4); bm.tex.offset.set(0, (-realT * 1.6 + phase) / 2.4); };
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 64, color: '#e6f2ff', bg: 'rgba(5,8,12,0.85)', radius: 8, pad: 0.35, height: 0.34 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [-5.0, 2.4, 6.4], look: [-5.4, 0, 0] },
      { t: 2.4, pos: [-2.4, 2.2, 5.6], look: [-1.8, 0, 0] },
      { t: 4.8, pos: [1.4, 1.6, 4.4], look: [1.6, 0, 0] },
      { t: 7.2, pos: [-3.6, 3.0, 5.6], look: [-3.4, 0, -0.8] },
      { t: 8.6, pos: [-3.4, 3.0, 5.8], look: [-3.2, 0, -0.8] },
      { t: 10.0, pos: [5.0, 3.2, 6.6], look: [6.0, 0, 0] },
      { t: 12, pos: [2.2, 7.4, 14.6], look: [2.2, -0.2, 0] },
    ], S.camera);
    const V = (x, y, z) => new T.Vector3(x, y, z);
    return (t, realT) => {
      cam(t);
      parts.forEach(p => { const d = p.beat === 0 ? 1 : K.prog(t, B[p.beat] + 0.1, B[p.beat] + 0.6, 'bounce'); p.g.position.y = 3.5 * (1 - d); p.g.visible = p.beat === 0 || t > B[p.beat] + 0.1; });
      const has = k => k === 0 || t > B[k] + 0.6;
      // build the path for each colour as a list of points
      const red = [V(-6.3, 0, 0)], grn = [];
      if (has(1)) { red.push(V(-2.2, 0, 0)); red.push(V(-0.2, 0, 0)); } // the lens focuses onto the fibre end
      const fibre = has(2), prism = has(4);
      const throughFibre = (pts, off) => { pts.push(V(-0.2, off, 0)); for (let k = 1; k <= 8; k++) pts.push(V(-0.2 + k * 0.45, (k % 2 ? 0.2 : -0.2) + off * 0.5, 0)); pts.push(V(3.6, off, 0)); };
      if (fibre) throughFibre(red, 0.0);
      const endR = prism ? [V(5.6, 0, 0), V(8.2, 0, 1.0)] : [V(8.2, 0, 0)];
      red.push(...endR);
      if (has(3)) { grn.push(V(-4.6, 0, -2.0), V(-4.6, 0, 0)); if (has(1)) grn.push(V(-2.2, 0.03, 0), V(-0.2, 0.03, 0)); if (fibre) throughFibre(grn, 0.06); grn.push(...(prism ? [V(5.6, 0.03, 0), V(8.2, 0, -1.0)] : [V(8.2, 0.03, 0)])); }
      let ph = 0; pool.r.forEach((bm, i) => { if (i < red.length - 1) { setBeam(bm, red[i], red[i + 1], realT, ph); ph += red[i].distanceTo(red[i + 1]); } else bm.g.visible = false; });
      ph = 0; pool.g.forEach((bm, i) => { if (i < grn.length - 1) { setBeam(bm, grn[i], grn[i + 1], realT, ph); ph += grn[i].distanceTo(grn[i + 1]); } else bm.g.visible = false; });
      dets.forEach((d, i) => { const live = i === 2 ? !prism : prism && (i === 0 || has(3)); d.led.visible = live && Math.sin(realT * 18 + i) > -0.2; d.g.visible = i === 2 ? !prism : prism; });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('machine', { gain: 0.04 });
    k.play('hum', { t: 0.0, gain: 0.15, pitch: 2.0, dur: 11.5 });
    for (let i = 0; i < 10; i++) k.play('blip', { t: 0.3 + i * 0.18, gain: 0.08, pitch: i % 3 ? 2.0 : 2.6 });
    [1, 2, 3, 4].forEach(i => { k.play('metal', { t: B[i] + 0.6, gain: 0.35, pitch: 1.4 }); k.play('click', { t: B[i] + 0.62, gain: 0.3, pitch: 1.0 }); k.play('zap', { t: B[i] + 0.75, gain: 0.1, pitch: 1.5 }); });
    k.play('hum', { t: B[3] + 0.75, gain: 0.1, pitch: 2.5, dur: 4.0 });
    k.play('sparkle', { t: B[4] + 0.8, gain: 0.2 }); k.play('chime', { t: B[4] + 1.2, gain: 0.12, pitch: 1.0, music: true });
  },
  post: null,
};
