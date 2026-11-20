window.STYLES = window.STYLES || {};
STYLES['fridge-magnets'] = {
  id: 'fridge-magnets', name: 'Fridge Magnets',
  family: 'Kitchen and home',
  use: 'Explainer',
  look: 'A white fridge door in a bright kitchen. Thick coloured plastic letters and small picture magnets sit on the door. A paper note held by a round magnet carries the caption.',
  motion: 'Letters slide across the door and snap into a row, then into groups. Picture magnets slide in under the groups and click into place. The caption note is swapped for a new one at each step.',
  shownHere: 'How DNA letters spell a protein: DNA is a string of four letters; the cell reads it three letters at a time; each three-letter codon picks one amino acid; a stop codon ends the chain, and the chain folds into a protein.',
  goodFor: 'Codes, alphabets and grouping: how words are built, how data is encoded, how parts combine into a whole. Friendly, homely explanations.',
  fonts: ['Baloo 2:wght@700;800', 'Patrick Hand'],
  duration: 12,
  samples: 4,
  // CONTENT: the DNA string (coding strand), read in codons; the amino acid for each codon ('' = stop)
  dna: 'ATGGCATTCTAA',
  amino: ['Met', 'Ala', 'Phe', ''],
  beats: [
    { t: 0.0, label: 'DNA is a string of four letters:\nA, T, G and C' },
    { t: 3.0, label: 'The cell reads three letters\nat a time: a codon' },
    { t: 6.0, label: 'Each codon picks\none amino acid' },
    { t: 9.0, label: 'A stop codon ends the chain.\nThe chain folds: a protein' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), FL = 'Baloo 2', FN = 'Patrick Hand', BE = this.beats, DNA = this.dna, AM = this.amino;
    scene.background = new T.Color('#e8e2d8'); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 8 }); L.key.position.set(-4, 7, 10);
    const std = (c, r = 0.5, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    // the fridge door: white, a little glossy, with a handle
    const door = new T.Mesh(new T.BoxGeometry(13, 9.5, 0.4), std('#f6f6f4', 0.28)); door.position.set(0, 0.6, -0.2); door.receiveShadow = true; scene.add(door);
    const handle = new T.Mesh(new T.BoxGeometry(0.25, 4.5, 0.35), std('#c8ccd2', 0.2, { metalness: 0.8 })); handle.position.set(6.1, 0.8, 0.25); handle.castShadow = true; scene.add(handle);
    const wall = new T.Mesh(new T.PlaneGeometry(40, 20), std('#e8dcc8', 0.9)); wall.position.set(0, 2, -1); scene.add(wall);
    // a plastic letter: the glyph as an alpha map on stacked layers, so it has thickness
    const col = { A: '#3aaf4a', T: '#e0403a', G: '#f2c02a', C: '#3a7ae0' };
    const glyph = ch => K.canvasTex(256, 256, (g, r, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = `800 250px "${FL}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, w / 2, h / 2 + 24); }, ch.charCodeAt(0));
    const masks = {}; 'ATGC'.split('').forEach(c => { masks[c] = glyph(c); });
    const letter = ch => { const g = new T.Group(); const c = new T.Color(col[ch]);
      for (let k = 0; k < 6; k++) { const m = new T.Mesh(new T.PlaneGeometry(1.0, 1.0), std(k === 5 ? c : c.clone().multiplyScalar(0.7), 0.35, { alphaMap: masks[ch], alphaTest: 0.5 })); m.position.z = k * 0.025; m.castShadow = k === 5; m.customDepthMaterial = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, alphaMap: masks[ch], alphaTest: 0.5 }); g.add(m); }
      scene.add(g); return g; };
    // positions: scattered, then a row, then codon groups
    const rr = K.rng(21), n = DNA.length, X0 = -4.6;
    const letters = DNA.split('').map((ch, i) => ({ g: letter(ch), scat: new T.Vector3(rr.range(-5.5, 5.5), rr.range(-3.2, 1.4), 0.1), rot: rr.range(-0.7, 0.7), row: new T.Vector3(X0 + i * 0.84, 0.4, 0.1), grp: new T.Vector3(X0 - 0.45 + i * 0.84 + Math.floor(i / 3) * 0.3, 0.4, 0.1) }));
    // picture magnets: round badges for amino acids, a red octagon for stop
    const badge = (name, i) => { const tex = K.canvasTex(256, 256, (g, r, w, h) => { g.clearRect(0, 0, w, h);
        if (!name) { g.fillStyle = '#d8282a'; g.beginPath(); for (let k = 0; k < 8; k++) { const a = Math.PI / 8 + k * Math.PI / 4; g.lineTo(w / 2 + Math.cos(a) * 120, h / 2 + Math.sin(a) * 120); } g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 10; g.stroke(); g.fillStyle = '#fff'; g.font = `800 64px "${FL}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('STOP', w / 2, h / 2 + 8); return; }
        g.fillStyle = ['#8a4ad0', '#e07a2a', '#2ab0a0'][i]; g.beginPath(); g.arc(w / 2, h / 2, 118, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 10; g.stroke();
        g.fillStyle = '#fff'; g.font = `800 84px "${FL}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(name, w / 2, h / 2 + 10); }, 60 + i);
      const g = new T.Group(); const m = new T.Mesh(new T.PlaneGeometry(1.5, 1.5), std('#ffffff', 0.35, { map: tex, transparent: true, alphaTest: 0.5 })); m.position.z = 0.06; m.castShadow = true; m.customDepthMaterial = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, map: tex, alphaTest: 0.5 }); g.add(m);
      const back = new T.Mesh(new T.CylinderGeometry(0.66, 0.66, 0.06, 32), std('#444', 0.6)); back.rotation.x = Math.PI / 2; back.position.z = 0.02; g.add(back); scene.add(g); return g; };
    const codonX = c => (letters[c * 3].grp.x + letters[c * 3 + 2].grp.x) / 2;
    const badges = AM.map((a, i) => ({ g: badge(a, i), under: new T.Vector3(codonX(i), -1.0, 0.1), start: new T.Vector3(codonX(i) + rr.range(-2, 2), -4.6, 0.1), chain: new T.Vector3(-2.0 + i * 1.6, -2.45 + 0.35 * Math.abs(i - 1), 0.1) }));
    // the chain's links
    const links = [0, 1].map(() => { const m = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 1, 8), std('#555', 0.4)); m.rotation.z = Math.PI / 2; m.visible = false; scene.add(m); return m; });
    // the caption: a paper note under a round magnet; a new note for each beat
    const notes = BE.map((b, i) => { const tex = K.canvasTex(900, 330, (g, r, w, h) => { g.fillStyle = '#fff8c8'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,160,220,0.5)'; g.lineWidth = 3; for (let y = 70; y < h; y += 56) { g.beginPath(); g.moveTo(20, y); g.lineTo(w - 20, y); g.stroke(); }
        g.fillStyle = '#1e2a4a'; g.font = `400 76px "${FN}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; b.label.split('\n').forEach((l, k, arr) => g.fillText(l, w / 2, h / 2 + (k - (arr.length - 1) / 2) * 92)); }, 80 + i);
      const m = new T.Mesh(new T.PlaneGeometry(6.0, 2.2), std('#ffffff', 0.9, { map: tex, side: T.DoubleSide })); m.castShadow = true; scene.add(m); return m; });
    const pin = new T.Mesh(new T.CylinderGeometry(0.3, 0.3, 0.2, 32), std('#e0507a', 0.3)); pin.rotation.x = Math.PI / 2; pin.position.set(0, 3.68, 0.2); pin.castShadow = true; scene.add(pin);
    const cam = K.camPath([{ t: 0, pos: [0.6, 0.4, 15.6], look: [0, 0.2, 0] }, { t: 12, pos: [-0.4, 0.3, 14.4], look: [0, 0.1, 0] }], S.camera);
    const snap = (t, t0, d = 0.5) => K.prog(t, t0, t0 + d, 'back');
    return (t, realT) => {
      cam(t);
      letters.forEach((L2, i) => { const a = snap(t, 0.25 + i * 0.12, 0.55), b = snap(t, B[1] + 0.2 + Math.floor(i / 3) * 0.15, 0.5);
        L2.g.position.copy(L2.scat).lerp(L2.row, a).lerp(L2.grp, b); L2.g.rotation.z = L2.rot * (1 - K.clamp(a)); });
      badges.forEach((bd, i) => { const isStop = !AM[i], tin = isStop ? B[3] + 0.1 : B[2] + 0.2 + i * 0.35, a = snap(t, tin, 0.55), c = isStop ? 0 : snap(t, B[3] + 0.8, 0.8);
        bd.g.position.copy(bd.start).lerp(bd.under, a).lerp(bd.chain, c); bd.g.visible = t > tin - 0.05;
        if (!isStop && c > 0) bd.g.position.y += 0.25 * Math.sin(i * 1.7 + realT * 1.5) * c; });
      const c = K.prog(t, B[3] + 1.4, B[3] + 1.8);
      links.forEach((l, i) => { const a = badges[i].g.position, b = badges[i + 1].g.position; l.visible = c > 0; l.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, 0.08); l.scale.y = Math.max(0.01, a.distanceTo(b) * c); l.rotation.z = Math.atan2(b.y - a.y, b.x - a.x) + Math.PI / 2; });
      notes.forEach((m, i) => { const on = i === 0 ? 1 : K.prog(t, B[i] - 0.1, B[i] + 0.3, 'out'), off = i < notes.length - 1 ? K.prog(t, B[i + 1] - 0.1, B[i + 1] + 0.25, 'in') : 0;
        m.visible = on > 0 && off < 1; m.position.set(0, 2.75 + 0.05 * Math.sin(realT * 2 + i) - off * 0.4, 0.12 + i * 0.002); m.rotation.set(0, 0, 0.03 * Math.sin(realT * 1.3) + off * 0.6 - (1 - on) * 0.4); m.scale.setScalar(0.85 + 0.15 * on); });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t), n = this.dna.length;
    k.bed('room', { gain: 0.05 }); k.bed('machine', { gain: 0.015 });
    for (let i = 0; i < n; i++) k.play('click', { t: 0.25 + i * 0.12 + 0.45, gain: 0.25, pitch: 1.4 + (i % 4) * 0.1 });
    k.play('paper', { t: 0.05, gain: 0.2, pitch: 1.0 });
    for (let c = 0; c < 4; c++) k.play('click', { t: B[1] + 0.6 + c * 0.15, gain: 0.3, pitch: 1.0 }); k.play('paper', { t: B[1] - 0.1, gain: 0.25, pitch: 1.0 });
    for (let c = 0; c < 3; c++) { k.play('pop', { t: B[2] + 0.65 + c * 0.35, gain: 0.3, pitch: 0.9 + c * 0.15 }); k.play('pluck', { t: B[2] + 0.7 + c * 0.35, gain: 0.12, pitch: [1, 1.26, 1.5][c], music: true }); } k.play('paper', { t: B[2] - 0.1, gain: 0.25, pitch: 1.0 });
    k.play('thud', { t: B[3] + 0.55, gain: 0.35, pitch: 0.9 }); k.play('paper', { t: B[3] - 0.1, gain: 0.25, pitch: 1.0 }); k.play('swish', { t: B[3] + 0.9, gain: 0.2, pitch: 1.0, dur: 0.8 }); k.play('chime', { t: B[3] + 1.8, gain: 0.15, pitch: 1.0, music: true });
  },
  post: null,
};
