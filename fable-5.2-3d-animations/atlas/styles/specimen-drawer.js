window.STYLES = window.STYLES || {};
STYLES['specimen-drawer'] = {
  id: 'specimen-drawer', name: 'Specimen Drawer',
  family: 'Stage and play',
  use: 'Explainer',
  look: 'A wooden museum cabinet. A shallow drawer lined with cream paper holds ideas pinned like insects in neat rows, each with a small handwritten label and a number. A brass magnifier glides over one specimen at a time and shows it larger.',
  motion: 'The drawer slides open toward the camera. The magnifier moves from specimen to specimen and stops over each one; inside the lens the specimen is twice as large. At the end the magnifier lifts away and the camera pulls back.',
  shownHere: 'Six cognitive biases as a collection: confirmation bias, anchoring, sunk cost, availability, the bandwagon effect and hindsight bias; three of them are looked at closely.',
  goodFor: 'Taxonomies and collections: types, species, patterns, mistakes, archetypes. Anything you want to show as a set and then study one item at a time.',
  fonts: ['Caveat:wght@600;700', 'Libre Baskerville:wght@700'],
  duration: 12,
  samples: 4,
  // CONTENT: the specimens, in drawer order; each has a wing colour and a mark drawn on the wings
  specimens: [
    { name: 'Confirmation bias', color: '#3a7abf', mark: 'eye' },
    { name: 'Anchoring', color: '#bf6a3a', mark: 'anchor' },
    { name: 'Sunk cost', color: '#c9a43a', mark: 'coin' },
    { name: 'Availability', color: '#7a3abf', mark: 'bolt' },
    { name: 'Bandwagon', color: '#3abf7a', mark: 'stripes' },
    { name: 'Hindsight', color: '#bf3a5a', mark: 'clock' },
  ],
  beats: [
    { t: 0.0, label: 'A drawer of six common biases', look: -1 },
    { t: 2.4, label: 'Confirmation: we see what we believe', look: 0 },
    { t: 4.8, label: 'Anchoring: the first number sticks', look: 1 },
    { t: 7.2, label: 'Sunk cost: we stay because we paid', look: 2 },
    { t: 9.6, label: 'Six specimens, one human mind', look: -1 },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), FH = 'Caveat', FT = 'Libre Baskerville', SP = this.specimens, BE = this.beats;
    scene.background = new T.Color('#1a1410'); scene.add(S.camera);
    const L = K.lights(S, 'lamp', { size: 6 }); L.key.position.set(-3, 9, 4); L.key.intensity *= 1.1;
    const std = (c, r = 0.7, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const woodTex = K.canvasTex(512, 512, (g, r, w, h) => { g.fillStyle = '#5a3a22'; g.fillRect(0, 0, w, h); for (let i = 0; i < 140; i++) { g.strokeStyle = `rgba(20,10,4,${r.range(0.05, 0.2)})`; g.lineWidth = r.range(1, 3); const y = r() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + r.range(-12, 12), w * 0.7, y + r.range(-12, 12), w, y); g.stroke(); } }, 2);
    const wood = std('#ffffff', 0.55, { map: woodTex });
    // the cabinet: a block of drawers; the top drawer slides out toward the camera
    const cab = new T.Mesh(new T.BoxGeometry(7.6, 4.2, 5.4), wood); cab.position.set(0, -2.15, -2.8); cab.receiveShadow = true; scene.add(cab);
    for (let r = 0; r < 3; r++) { const f = new T.Mesh(new T.BoxGeometry(7.0, 1.1, 0.1), wood); f.position.set(0, -1.0 - r * 1.3, -0.05); scene.add(f); const k = new T.Mesh(new T.BoxGeometry(0.9, 0.18, 0.12), std('#c99a4a', 0.3, { metalness: 0.9 })); k.position.set(0, -1.0 - r * 1.3, 0.05); scene.add(k); }
    const floor = new T.Mesh(new T.PlaneGeometry(60, 60), std('#2a2018', 0.9)); floor.rotation.x = -Math.PI / 2; floor.position.y = -4.25; floor.receiveShadow = true; scene.add(floor);
    const drawer = new T.Group(); scene.add(drawer);
    const DW = 7.0, DD = 4.8;
    const paperTex = K.canvasTex(1024, 704, (g, r, w, h) => { g.fillStyle = '#efe4c8'; g.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(120,90,50,${r.range(0.02, 0.06)})`; g.fillRect(r() * w, r() * h, 2, 2); } g.strokeStyle = 'rgba(120,90,50,0.25)'; g.lineWidth = 2; for (let k = 1; k < 3; k++) { g.beginPath(); g.moveTo(k * w / 3, 20); g.lineTo(k * w / 3, h - 20); g.stroke(); } g.beginPath(); g.moveTo(20, h / 2); g.lineTo(w - 20, h / 2); g.stroke(); }, 4);
    const base = new T.Mesh(new T.BoxGeometry(DW, 0.12, DD), [wood, wood, std('#ffffff', 0.9, { map: paperTex }), wood, wood, wood]); base.receiveShadow = true; drawer.add(base);
    [[0, DD / 2, DW + 0.24, 0.12], [0, -DD / 2, DW + 0.24, 0.12]].forEach(([x, z, w, d]) => { const m = new T.Mesh(new T.BoxGeometry(w, 0.5, d), wood); m.position.set(x, 0.2, z); m.castShadow = m.receiveShadow = true; drawer.add(m); });
    [DW / 2, -DW / 2].forEach(x => { const m = new T.Mesh(new T.BoxGeometry(0.12, 0.5, DD), wood); m.position.set(x, 0.2, 0); m.castShadow = m.receiveShadow = true; drawer.add(m); });
    const pull = new T.Mesh(new T.BoxGeometry(0.9, 0.16, 0.12), std('#c99a4a', 0.3, { metalness: 0.9 })); pull.position.set(0, 0.2, DD / 2 + 0.1); drawer.add(pull);
    // a specimen: body, four wings with a mark, antennae; drawn once with a clear background and once on paper for the lens
    const marks = {
      eye: (g, x, y, s) => { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x, y, s, s * 0.6, 0, 0, 7); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(x, y, s * 0.35, 0, 7); g.fill(); },
      anchor: (g, x, y, s) => { g.strokeStyle = '#fff'; g.lineWidth = s * 0.18; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x, y + s * 0.8); g.moveTo(x - s * 0.5, y - s * 0.5); g.lineTo(x + s * 0.5, y - s * 0.5); g.moveTo(x - s * 0.8, y + s * 0.2); g.quadraticCurveTo(x, y + s * 1.4, x + s * 0.8, y + s * 0.2); g.stroke(); },
      coin: (g, x, y, s) => { g.fillStyle = '#ffe9a0'; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); g.fillStyle = '#7a5a10'; g.font = `700 ${s * 1.4}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', x, y + s * 0.08); },
      bolt: (g, x, y, s) => { g.fillStyle = '#fff3a0'; g.beginPath(); g.moveTo(x + s * 0.2, y - s); g.lineTo(x - s * 0.5, y + s * 0.15); g.lineTo(x, y + s * 0.15); g.lineTo(x - s * 0.2, y + s); g.lineTo(x + s * 0.5, y - s * 0.15); g.lineTo(x, y - s * 0.15); g.fill(); },
      stripes: (g, x, y, s) => { g.fillStyle = '#fff'; for (let k = -2; k <= 2; k++) { g.beginPath(); g.arc(x + k * s * 0.4, y + (k % 2) * s * 0.3, s * 0.16, 0, 7); g.fill(); } },
      clock: (g, x, y, s) => { g.strokeStyle = '#fff'; g.lineWidth = s * 0.15; g.beginPath(); g.arc(x, y, s, 0, 7); g.moveTo(x, y); g.lineTo(x, y - s * 0.7); g.moveTo(x, y); g.lineTo(x - s * 0.5, y + s * 0.2); g.stroke(); },
    };
    const drawBug = (sp, paper) => (g, r, w, h) => {
      if (paper) { g.fillStyle = '#efe4c8'; g.fillRect(0, 0, w, h); }
      const cx = w / 2, cy = h / 2; g.lineJoin = 'round';
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { const big = sy < 0; g.save(); g.translate(cx, cy + (big ? -10 : 30)); g.scale(sx, 1); g.rotate(big ? -0.35 : 0.45);
        g.fillStyle = sp.color; g.strokeStyle = '#1e140c'; g.lineWidth = 5; g.beginPath(); g.ellipse(big ? 105 : 80, 0, big ? 100 : 70, big ? 62 : 46, 0, 0, 7); g.fill(); g.stroke();
        g.strokeStyle = 'rgba(30,20,12,0.4)'; g.lineWidth = 2; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(14, 0); g.lineTo(big ? 190 : 140, (k - 1.5) * 22); g.stroke(); }
        g.save(); g.scale(sx, 1); marks[sp.mark](g, sx * (big ? 115 : 85), 0, big ? 30 : 20); g.restore(); g.restore(); });
      g.fillStyle = '#2a1c12'; g.beginPath(); g.ellipse(cx, cy + 20, 18, 92, 0, 0, 7); g.fill(); g.beginPath(); g.arc(cx, cy - 82, 20, 0, 7); g.fill();
      g.strokeStyle = '#2a1c12'; g.lineWidth = 4; [-1, 1].forEach(s => { g.beginPath(); g.moveTo(cx + s * 8, cy - 98); g.quadraticCurveTo(cx + s * 40, cy - 170, cx + s * 70, cy - 180); g.stroke(); });
    };
    const SS = 1.6, slots = SP.map((_, i) => [(i % 3 - 1) * 2.3, -0.9 + Math.floor(i / 3) * 2.1 - 0.1]);
    const lensTex = [];
    SP.forEach((sp, i) => {
      const tex = K.canvasTex(512, 512, drawBug(sp, false), 10 + i);
      const m = new T.Mesh(new T.PlaneGeometry(SS, SS), new T.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.5, roughness: 0.6 }));
      m.rotation.x = -Math.PI / 2; m.position.set(slots[i][0], 0.2, slots[i][1] - 0.15); m.castShadow = true; m.customDepthMaterial = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, map: tex, alphaTest: 0.5 }); drawer.add(m);
      const pinM = std('#d8d8e0', 0.3, { metalness: 1 }); const pin = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 0.4, 6), pinM); pin.position.set(slots[i][0], 0.25, slots[i][1] - 0.15 + 0.06); drawer.add(pin);
      const head = new T.Mesh(new T.SphereGeometry(0.05, 12, 8), std('#1a1a1a', 0.3)); head.position.set(slots[i][0], 0.45, slots[i][1] - 0.09); head.castShadow = true; drawer.add(head);
      const lab = K.canvasTex(400, 120, (g, r, w, h) => { g.fillStyle = '#fbf6e8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a6a4a'; g.lineWidth = 3; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = '#2a1c12'; g.font = `700 52px "${FH}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`${i + 1}. ${sp.name}`, w / 2, h / 2 + 4); }, 20 + i);
      const card = new T.Mesh(new T.PlaneGeometry(1.7, 0.51), std('#ffffff', 0.9, { map: lab })); card.rotation.x = -Math.PI / 2; card.position.set(slots[i][0], 0.075, slots[i][1] + 0.85); card.receiveShadow = true; drawer.add(card);
      const lt = K.canvasTex(512, 512, drawBug(sp, true), 10 + i); lensTex.push(lt);
    });
    // the magnifier: brass ring, handle and a lens that shows the specimen below at twice the size
    const mag = new T.Group(); scene.add(mag);
    const brass = std('#c99a4a', 0.25, { metalness: 1 });
    const LR = 0.85, ring = new T.Mesh(new T.TorusGeometry(LR, 0.07, 12, 48), brass); ring.rotation.x = Math.PI / 2; ring.castShadow = true; mag.add(ring);
    const handle = new T.Mesh(new T.CylinderGeometry(0.08, 0.1, 1.8, 12), std('#2a1a10', 0.5)); handle.rotation.z = Math.PI / 2; handle.position.set(LR + 0.95, 0, 0); handle.castShadow = true; mag.add(handle);
    const lensMat = new T.MeshBasicMaterial({ map: lensTex[0], transparent: true, opacity: 0 });
    const lens = new T.Mesh(new T.CircleGeometry(LR, 48), lensMat); lens.rotation.x = -Math.PI / 2; mag.add(lens);
    const glint = new T.Mesh(new T.RingGeometry(LR * 0.55, LR * 0.75, 32, 1, 2.2, 0.9), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.25, side: T.DoubleSide })); glint.rotation.x = -Math.PI / 2; glint.position.y = 0.01; mag.add(glint);
    const ZOOM = 2.0;
    lensTex.forEach(tx => { const span = (2 * LR / ZOOM) / SS; tx.repeat.set(span, span); tx.offset.set((1 - span) / 2, (1 - span) / 2); });
    const titles = BE.map(b => { const l = K.label(b.label, { font: FT, weight: 700, px: 64, color: '#f6ead2', bg: 'rgba(26,20,16,0.85)', radius: 10, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [0, 8.4, 9.4], look: [0, -0.4, 1.4] },
      { t: 2.4, pos: [0, 7.6, 8.2], look: [0, -0.2, 1.6] },
      { t: 9.6, pos: [0.3, 7.6, 8.2], look: [0.2, -0.2, 1.6] },
      { t: 12, pos: [0, 9.0, 10.0], look: [0, -0.4, 1.4] },
    ], S.camera);
    const slotWorld = i => new T.Vector3(slots[i][0], 0, slots[i][1] - 0.15 + drawer.position.z);
    const park = new T.Vector3(4.6, 1.4, 3.6);
    return (t, realT) => {
      cam(t);
      drawer.position.set(0, -0.2, K.lerp(-0.4, 2.6, K.prog(t, -0.6, 1.6, 'out')));
      let k = 0; for (let i = 1; i < B.length; i++) if (t >= B[i]) k = i;
      const look = BE[k].look, prevLook = k ? BE[k - 1].look : -1, u = k ? K.prog(t, B[k], B[k] + 0.8, 'inOut') : 1;
      const from = prevLook < 0 ? park : slotWorld(prevLook).setY(0.8), to = look < 0 ? park : slotWorld(look).setY(0.8);
      mag.position.lerpVectors(from, to, u); mag.position.y += 0.4 * Math.sin(Math.PI * u) + 0.02 * Math.sin(realT * 2);
      mag.rotation.y = -0.5 + 0.08 * Math.sin(realT * 0.7);
      if (look >= 0) lensMat.map = lensTex[look];
      lensMat.opacity = look >= 0 ? K.prog(t, B[k] + 0.7, B[k] + 1.0) : 0;
      lens.rotation.z = -mag.rotation.y; // keep the zoomed image aligned with the drawer
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.06 });
    k.play('wood', { t: 0.05, gain: 0.35, pitch: 0.6 }); k.play('swish', { t: 0.1, gain: 0.25, pitch: 0.4, dur: 1.2 }); k.play('wood', { t: 1.4, gain: 0.3, pitch: 0.8 });
    [1, 2, 3].forEach(i => { k.play('swish', { t: B[i] + 0.05, gain: 0.18, pitch: 1.3, dur: 0.7 }); k.play('glass', { t: B[i] + 0.8, gain: 0.2, pitch: 1.4 + i * 0.1 }); k.play('pluck', { t: B[i] + 0.9, gain: 0.12, pitch: 0.8 + i * 0.12, music: true }); });
    k.play('swish', { t: B[4] + 0.05, gain: 0.2, pitch: 1.0, dur: 0.8 }); k.play('chime', { t: B[4] + 0.6, gain: 0.15, pitch: 0.8, music: true });
  },
  post: null,
};
