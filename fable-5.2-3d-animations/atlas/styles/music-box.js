window.STYLES = window.STYLES || {};
STYLES['music-box'] = {
  id: 'music-box', name: 'Music Box',
  family: 'Stage and play',
  use: 'Explainer',
  look: 'An open wooden music box seen in macro: a brass cylinder covered in small pins turns against a steel comb. Two small enamel dancers turn on the open lid. Warm light, shallow and close.',
  motion: 'The cylinder turns at a steady speed. Each pin that reaches the comb lifts one tooth, the tooth springs back and rings, and you hear the note at that moment. The pins and the music come from one table, so every sound matches a pin.',
  shownHere: 'How a player piano reads music, shown with its small cousin the music box: the tune is stored as marks on a turning roll; the position across the roll picks the note; the position around the roll sets the time; where there is a mark, the note sounds; turn the roll at a steady speed and the tune plays.',
  goodFor: 'Encoding and playback: punch cards, sequencers, programs, schedules, DNA to protein, any "stored pattern turned into action" idea.',
  fonts: ['Playfair Display:wght@700', 'Inter:wght@600'],
  duration: 12,
  samples: 4,
  // CONTENT: the tune, one table for pins and sound: [time in seconds, tooth 0..9]
  tune: [[0.4, 2], [0.85, 4], [1.3, 5], [1.75, 4], [2.2, 2], [2.65, 1], [3.1, 0], [3.55, 2], [4.0, 4], [4.45, 7], [4.9, 6], [5.35, 4], [5.8, 5], [6.25, 3], [6.7, 1], [7.15, 2], [7.6, 4], [8.05, 7], [8.5, 9], [8.95, 8], [9.4, 7], [9.85, 5], [10.3, 4], [10.75, 2], [11.2, 0], [11.2, 4], [11.2, 7]],
  beats: [
    { t: 0.0, label: 'A turning roll stores the tune as marks' },
    { t: 2.4, label: 'Across the roll: which note' },
    { t: 4.8, label: 'Around the roll: when it plays' },
    { t: 7.2, label: 'A mark lifts its tooth, and the note sounds' },
    { t: 9.6, label: 'Turn the roll steadily: the tune plays' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), FT = 'Playfair Display', FI = 'Inter', BE = this.beats, TUNE = this.tune;
    scene.background = new T.Color('#140c08'); scene.add(S.camera);
    const L = K.lights(S, 'lamp', { size: 4, target: [0, 0.6, 0] }); L.key.intensity = 2.4; L.amb.intensity = 0.6; S.scene.environmentIntensity = 0.8;
    const std = (c, r = 0.5, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const woodTex = K.canvasTex(512, 256, (g, r, w, h) => { g.fillStyle = '#7a3a1e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(30,10,4,${r.range(0.05, 0.2)})`; g.lineWidth = r.range(1, 3); const y = r() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + r.range(-8, 8), w * 0.7, y + r.range(-8, 8), w, y); g.stroke(); } }, 2);
    const wood = std('#ffffff', 0.4, { map: woodTex });
    // the box: base, walls and an open lid with two dancers
    const box = new T.Group(); scene.add(box);
    const base = new T.Mesh(new T.BoxGeometry(6.4, 0.3, 4.0), wood); base.position.y = -0.95; base.receiveShadow = true; box.add(base);
    [[0, -0.2, -2.0, 6.4, 1.5, 0.15], [0, -0.6, 2.0, 6.4, 0.7, 0.15], [-3.2, -0.2, 0, 0.15, 1.5, 4.0], [3.2, -0.2, 0, 0.15, 1.5, 4.0]].forEach(([x, y, z, w, h, d]) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), wood); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; box.add(m); });
    const lidPiv = new T.Group(); lidPiv.position.set(0, 0.55, -2.0); lidPiv.rotation.x = -1.95; box.add(lidPiv);
    const lid = new T.Mesh(new T.BoxGeometry(6.4, 0.15, 4.0), wood); lid.position.set(0, 0, 2.0); lid.castShadow = true; lidPiv.add(lid);
    const mirror = new T.Mesh(new T.PlaneGeometry(5.6, 3.4), std('#d8dce4', 0.05, { metalness: 1 })); mirror.rotation.x = Math.PI / 2; mirror.position.set(0, -0.08, 2.0); lidPiv.add(mirror);
    const dancers = [-1.4, 1.4].map((x, i) => { const g = new T.Group(); g.position.set(x, -0.95 + 0.15, 1.3); box.add(g); const skirt = new T.Mesh(new T.ConeGeometry(0.22, 0.4, 16), std(i ? '#e85a8a' : '#5a8ae8', 0.3, { metalness: 0.2 })); skirt.position.y = 0.2; const body = new T.Mesh(new T.CylinderGeometry(0.05, 0.07, 0.3, 10), std('#f4e8e0', 0.3)); body.position.y = 0.52; const head = new T.Mesh(new T.SphereGeometry(0.07, 12, 10), std('#f4e8e0', 0.3)); head.position.y = 0.72; const pl = new T.Mesh(new T.CylinderGeometry(0.15, 0.15, 0.04, 20), std('#c9a04a', 0.2, { metalness: 1 })); g.add(skirt, body, head, pl); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; });
    // the cylinder (the roll) and its pins, placed from the tune table
    const CR = 0.8, CL = 4.0, OMEGA = 0.55, NT = 10, toothX = n => -CL / 2 + 0.25 + n * (CL - 0.5) / (NT - 1);
    const cyl = new T.Group(); cyl.position.set(0, 0.2, 0.4); scene.add(cyl);
    const drum = new T.Mesh(new T.CylinderGeometry(CR, CR, CL, 64), std('#c9a04a', 0.25, { metalness: 0.9 })); drum.rotation.z = Math.PI / 2; drum.castShadow = true; cyl.add(drum);
    const axle = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, CL + 1.6, 12), std('#9aa0a8', 0.2, { metalness: 1 })); axle.rotation.z = Math.PI / 2; cyl.add(axle);
    // a pin at angle a reaches the comb (straight back, -z) when the drum has turned to it
    const COMB_A = Math.PI; // pins point to -z at angle PI around the x axis, measured from +z
    const pins = TUNE.map(([tt, n]) => { const a = COMB_A - OMEGA * tt, m = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, 0.16, 6), std('#e8eaee', 0.2, { metalness: 1 })); const dir = new T.Vector3(0, Math.sin(a), Math.cos(a)); m.position.copy(dir.clone().multiplyScalar(CR + 0.06)).setX(toothX(n)); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir); m.castShadow = true; cyl.add(m); return { m, tt, n }; });
    // the comb: ten steel teeth behind the drum, shorter for higher notes; tips line up at the drum
    const comb = new T.Group(); comb.position.set(0, 0.2, 0.4 - CR - 0.12); scene.add(comb);
    const combBase = new T.Mesh(new T.BoxGeometry(CL + 0.2, 0.25, 0.9), std('#a8aeb6', 0.25, { metalness: 1 })); combBase.position.set(0, -0.16, -1.0); comb.add(combBase);
    const teeth = Array.from({ length: NT }, (_, n) => { const len = 1.3 - n * 0.06, piv = new T.Group(); piv.position.set(toothX(n), 0, 0.02 - len); comb.add(piv); const tm = new T.Mesh(new T.BoxGeometry(0.28, 0.05, len), std('#d8dce4', 0.15, { metalness: 1 })); tm.position.z = len / 2; tm.castShadow = true; piv.add(tm); piv.userData.len = len; return piv; });
    // small tags for 'which note' and 'when'
    const tag = (txt, x, y, z) => { const l = K.label(txt, { font: FI, weight: 600, px: 52, color: '#2a1a10', bg: 'rgba(250,240,220,0.92)', radius: 10, pad: 0.2, height: 0.24 }); l.position.set(x, y, z); l.visible = false; scene.add(l); return l; };
    const tagNote = tag('across = which note', 0, -0.05, 1.75), tagTime = tag('around = when', 1.6, -0.05, 1.75);
    const noteArrow = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, CL - 0.4, 6), std('#ffd890', 0.3, { emissive: '#ffb050', emissiveIntensity: 0.8 })); noteArrow.rotation.z = Math.PI / 2; noteArrow.position.set(0, 1.15, 0.6); noteArrow.visible = false; scene.add(noteArrow);
    const ring = new T.Mesh(new T.TorusGeometry(CR + 0.18, 0.02, 6, 48, Math.PI * 1.4), std('#ffd890', 0.3, { emissive: '#ffb050', emissiveIntensity: 0.8 })); ring.rotation.y = Math.PI / 2; ring.position.set(CL / 2 + 0.15, 0.2, 0.4); ring.visible = false; scene.add(ring);
    const titles = BE.map(b => { const l = K.label(b.label, { font: FT, weight: 700, px: 66, color: '#fff2dc', bg: 'rgba(20,12,8,0.82)', radius: 10, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [3.6, 3.8, 6.4], look: [0, 0.2, -0.2] },
      { t: 2.4, pos: [0.4, 2.6, 4.4], look: [0, 0.6, 0.2] },
      { t: 4.8, pos: [5.6, 2.0, 4.0], look: [1.2, 0.2, 0.4] },
      { t: 6.6, pos: [5.4, 2.2, 4.2], look: [1.0, 0.2, 0.4] },
      { t: 7.2, pos: [-2.2, 2.8, 1.4], look: [-0.6, 0.1, -1.2] },
      { t: 9.6, pos: [3.2, 3.6, 6.0], look: [0, 0.2, -0.4] },
      { t: 12, pos: [4.2, 4.4, 7.6], look: [0, 0.2, -0.4] },
    ], S.camera);
    return (t, realT) => {
      cam(t);
      cyl.rotation.x = -OMEGA * t;
      teeth.forEach((piv, n) => { let lift = 0; TUNE.forEach(([tt, nn]) => { if (nn !== n) return; const d = t - tt; if (d > -0.12 && d < 0) lift = Math.max(lift, (d + 0.12) / 0.12 * 0.18); if (d >= 0 && d < 1.2) lift = Math.max(lift, 0.12 * Math.exp(-d * 4) * Math.cos(d * 60)); }); piv.rotation.x = -lift; });
      pins.forEach(p => { p.m.scale.setScalar(Math.abs(t - p.tt) < 0.15 ? 1.4 : 1); });
      dancers.forEach((d, i) => { d.rotation.y = realT * (i ? -1.6 : 1.6); });
      tagNote.visible = noteArrow.visible = t > B[1] + 0.3 && t < B[2]; tagTime.visible = ring.visible = t > B[2] + 0.3 && t < B[3];
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const R = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2, 9 / 4, 5 / 2, 3, 10 / 3];
    k.bed('room', { gain: 0.04 });
    this.tune.forEach(([tt, n]) => { k.play('pluck', { t: tt, gain: 0.22, pitch: 1.5 * R[n], music: true }); k.play('tick', { t: tt - 0.02, gain: 0.04, pitch: 3.0 }); });
  },
  post: null,
};
