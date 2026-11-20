window.STYLES = window.STYLES || {};
STYLES['blueprint'] = {
  id: 'blueprint', name: 'Blueprint Build',
  family: 'Diagrams with depth',
  use: 'Explainer',
  look: 'A drafting sheet in blueprint blue with paper grain, fold creases, a grid and a title block. White linework in two weights; hidden edges are dashed; forces are drawn in pale yellow pencil.',
  motion: 'Lines draw themselves on the sheet, stroke by stroke. Force arrows follow the load through the structure, and at the end the drawing rises off the sheet and stands up as a wireframe.',
  shownHere: 'How a suspension bridge carries load: the deck hangs from vertical hangers, the hangers pull on the main cables, the cables carry the load over the towers, and anchors hold the cable ends.',
  goodFor: 'Engineering, architecture and how-it-works diagrams: structure first, then the forces or flows that act on it.',
  fonts: ['Architects Daughter', 'Roboto Mono:wght@500'],
  duration: 11,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'The deck hangs from the cables' },
    { t: 2.7, label: 'Load pulls the hangers down' },
    { t: 5.4, label: 'Cables carry it over the towers' },
    { t: 8.1, label: 'Anchors hold the cable ends' },
  ],
  sheet: { title: 'SUSPENSION BRIDGE', sub: 'ELEVATION  ·  SCALE 1:2000', no: 'SHEET 1 / 1' },

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Architects Daughter', FM = 'Roboto Mono';
    scene.background = new T.Color('#0d1a2c'); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 9, target: [0, 0, 0] }); L.key.position.set(-6, 10, 6); L.key.intensity = 1.4; L.amb.intensity = 0.8;
    // the sheet
    const SW = 16, SH = 10;
    const sheetTex = K.canvasTex(2048, 1280, (g, r, w, h) => {
      g.fillStyle = '#1d4f91'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 20000; i++) { g.fillStyle = `rgba(255,255,255,${r.range(0.01, 0.04)})`; g.fillRect(r() * w, r() * h, r.range(1, 3), 1); }
      g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 1; for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 6; g.strokeRect(40, 40, w - 80, h - 80);
      const tb = [w - 640, h - 250, 600, 210]; g.lineWidth = 4; g.strokeRect(...tb); g.beginPath(); g.moveTo(tb[0], tb[1] + 90); g.lineTo(tb[0] + tb[2], tb[1] + 90); g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.9)'; g.font = `700 54px "${FM}"`; g.fillText(this.sheet.title, tb[0] + 24, tb[1] + 62); g.font = `500 34px "${FM}"`; g.fillText(this.sheet.sub, tb[0] + 24, tb[1] + 140); g.fillText(this.sheet.no, tb[0] + 24, tb[1] + 186);
      g.strokeStyle = 'rgba(0,0,0,0.22)'; g.lineWidth = 5; [w / 2, w / 4, w * 0.75].forEach(x => { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }); g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.1)'; [w / 2 + 3, w / 4 + 3, w * 0.75 + 3].forEach(x => { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); });
    }, 5);
    const sheet = new T.Mesh(new T.PlaneGeometry(SW, SH, 32, 20), new T.MeshStandardMaterial({ map: sheetTex, roughness: 0.95 }));
    { const p = sheet.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, 0.04 * Math.abs(Math.sin(x / SW * Math.PI * 2)) + 0.03 * Math.abs(Math.sin(y / SH * Math.PI))); } sheet.geometry.computeVertexNormals(); }
    sheet.rotation.x = -Math.PI / 2; sheet.receiveShadow = true; scene.add(sheet);
    const desk = new T.Mesh(new T.PlaneGeometry(60, 40), new T.MeshStandardMaterial({ color: '#3a2a1c', roughness: 0.7 })); desk.rotation.x = -Math.PI / 2; desk.position.y = -0.02; scene.add(desk);
    // drawing tools
    const pencil = new T.Group(); const pb = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 3.2, 6), new T.MeshStandardMaterial({ color: '#e8b832' })); pb.rotation.z = Math.PI / 2; pencil.add(pb); const tip = new T.Mesh(new T.ConeGeometry(0.08, 0.35, 6), new T.MeshStandardMaterial({ color: '#d9b58a' })); tip.rotation.z = -Math.PI / 2; tip.position.x = 1.77; pencil.add(tip); pencil.traverse(o => { o.castShadow = true; }); scene.add(pencil);
    const square = new T.Mesh(new T.ExtrudeGeometry(new T.Shape([new T.Vector2(0, 0), new T.Vector2(3, 0), new T.Vector2(0, 3)].concat([])), { depth: 0.04, bevelEnabled: false }), new T.MeshPhysicalMaterial({ color: '#d8f0ff', transparent: true, opacity: 0.35, roughness: 0.1 })); square.rotation.x = -Math.PI / 2; square.position.set(5.2, 0.06, 3.8); scene.add(square);
    // the drawing: elevation in (u, v); it lives in a group hinged at v = 0
    const draw = new T.Group(); draw.position.set(0, 0.06, 1.2); scene.add(draw);
    const white = (op = 1) => new T.MeshBasicMaterial({ color: '#f4f8ff', transparent: true, opacity: op, toneMapped: false });
    const yellow = new T.MeshBasicMaterial({ color: '#ffe27a', toneMapped: false });
    const strokes = [];
    const stroke = (pts, w, t0, t1, mat = white(), parent = draw) => { const c = new T.CatmullRomCurve3(pts.map(([u, v]) => new T.Vector3(u, v, 0)), false, 'catmullrom', 0); const g = new T.TubeGeometry(c, Math.max(8, pts.length * 12), w, 5); const m = new T.Mesh(g, mat); parent.add(m); strokes.push({ g, t0, t1 }); return m; };
    const dashed = (pts, t0, t1) => { const g = new T.BufferGeometry().setFromPoints(pts.map(([u, v]) => new T.Vector3(u, v, 0))); const l = new T.Line(g, new T.LineDashedMaterial({ color: '#cfe1ff', dashSize: 0.15, gapSize: 0.1, transparent: true, opacity: 0.8 })); l.computeLineDistances(); draw.add(l); strokes.push({ g, t0, t1, line: true, n: pts.length }); return l; };
    const TW = 3.0, TOPV = 3.2, DECK = 0.9, SAG = 1.25;
    const cableV = u => { const a = Math.abs(u); if (a <= TW) return SAG + (TOPV - SAG) * (u / TW) ** 2; return TOPV - (TOPV - 0.55) * (a - TW) / (6.3 - TW); };
    // structure
    stroke([[-6.6, DECK], [6.6, DECK]], 0.06, 0.1, 1.0);
    [-TW, TW].forEach((x, i) => { stroke([[x - 0.15, 0], [x - 0.12, TOPV + 0.1]], 0.06, 0.3 + i * 0.2, 1.1 + i * 0.2); stroke([[x + 0.15, 0], [x + 0.12, TOPV + 0.1]], 0.06, 0.35 + i * 0.2, 1.15 + i * 0.2); stroke([[x - 0.15, TOPV - 0.3], [x + 0.15, TOPV - 0.3]], 0.03, 1.0, 1.2); stroke([[x - 0.15, DECK + 0.6], [x + 0.15, DECK + 0.6]], 0.03, 1.0, 1.2); });
    const cablePts = []; for (let i = 0; i <= 80; i++) { const u = -6.3 + i / 80 * 12.6; cablePts.push([u, cableV(u)]); }
    const cable = stroke(cablePts, 0.055, 0.8, 2.2);
    const hangers = []; for (let u = -5.75; u <= 5.76; u += 0.5) { if (Math.abs(Math.abs(u) - TW) < 0.2) continue; hangers.push(stroke([[u, DECK], [u, cableV(u)]], 0.02, 1.4 + (u + 6) * 0.05, 1.7 + (u + 6) * 0.05)); }
    [-1, 1].forEach(s => { stroke([[s * 6.3, 0.55], [s * 6.9, 0.55], [s * 6.9, -0.2], [s * 6.0, -0.2], [s * 6.0, 0.55]], 0.045, 1.6, 2.4); });
    // hidden edges: foundations under the water line, dashed
    dashed([[-7.4, 0.0], [7.4, 0.0]], 1.8, 2.4);
    [-TW, TW].forEach(x => dashed([[x - 0.4, 0], [x - 0.4, -0.8], [x + 0.4, -0.8], [x + 0.4, 0]], 2.0, 2.5));
    // forces: load arrows on the deck, tension up the hangers, along the cable, into the anchors
    const arrow = (u, v, du, dv, t0) => { const g = new T.Group(); const len = Math.hypot(du, dv); const sh = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, len, 6), yellow); sh.position.y = len / 2; g.add(sh); const hd = new T.Mesh(new T.ConeGeometry(0.12, 0.28, 10), yellow); hd.position.y = len; g.add(hd); g.position.set(u, v, 0.03); g.rotation.z = Math.atan2(-du, dv); draw.add(g); g.userData.t0 = t0; return g; };
    const loads = [-4.5, -1.5, 1.5, 4.5].map((u, i) => arrow(u, DECK + 0.9, 0, -0.8, B[1] + 0.2 + i * 0.12));
    const tens = [-4.75, -2.25, -0.25, 1.75, 4.25].map((u, i) => arrow(u, DECK + 0.1, 0, Math.max(0.4, cableV(u) - DECK - 0.35), B[1] + 0.8 + i * 0.1));
    const along = [-1.6, 1.6].map((u, i) => { const s = Math.sign(u), du = s * 1.0, dv = cableV(u + du) - cableV(u); return arrow(u, cableV(u) + 0.08, du, dv, B[2] + 0.2 + i * 0.1); });
    const down = [-TW, TW].map((x, i) => arrow(x, TOPV + 1.0, 0, -0.85, B[2] + 0.7 + i * 0.1));
    const anch = [-1, 1].map((s, i) => arrow(s * 4.7, 1.9, s * 1.2, -1.1, B[3] + 0.2 + i * 0.1));
    const forceArrows = [...loads, ...tens, ...along, ...down, ...anch];
    // load: a small truck drawn in pencil on the deck
    const truck = new T.Group(); draw.add(truck);
    stroke([[0, 0], [0.9, 0], [0.9, 0.4], [0.7, 0.55], [0.35, 0.55], [0.35, 0.4], [0, 0.4], [0, 0]], 0.025, B[1], B[1] + 0.3, yellow, truck);
    truck.position.set(-1.0, DECK + 0.06, 0.02);
    // labels: handwritten notes
    const note = (txt, u, v, t0, size = 0.36) => { const l = K.label(txt, { font: F, weight: 400, px: 64, color: '#fff2b8', height: size }); l.position.set(u, v, 0.05); draw.add(l); l.userData.t0 = t0; return l; };
    const notes = [note('DECK', -5.4, DECK - 0.35, 0.9), note('MAIN CABLE', -1.3, SAG + 0.45, 2.0), note('HANGERS', 2.3, 1.7, B[1] + 0.9), note('TOWER', TW + 0.75, TOPV - 0.2, B[2] + 0.8), note('ANCHOR', 5.9, -0.55, B[3] + 0.4)];
    // the 3D copy: the far cable plane and cross beams, shown when the drawing stands up
    const far = new T.Group(); draw.add(far);
    const farMat = white(0.6);
    stroke(cablePts, 0.04, 99, 99.1, farMat, far); stroke([[-6.6, DECK], [6.6, DECK]], 0.04, 99, 99.1, farMat, far);
    [-TW, TW].forEach(x => { stroke([[x, 0], [x, TOPV + 0.1]], 0.05, 99, 99.1, farMat, far); });
    far.position.z = -1.6;
    const beams = []; for (let u = -6; u <= 6.01; u += 1) { const m = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 1.6, 5), farMat); m.rotation.x = Math.PI / 2; m.position.set(u, DECK, -0.8); draw.add(m); beams.push(m); }
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 400, px: 88, color: '#ffffff', height: 0.5 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.72, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [0, 13.5, 6.5], look: [0, 0, 0.2] },
      { t: 5.4, pos: [0.5, 12.5, 7.5], look: [0, 0, 0.0] },
      { t: 8.1, pos: [1.0, 10.0, 11.5], look: [0, 0.8, 0] },
      { t: 11, pos: [4.0, 5.0, 13.5], look: [0, 1.8, 0] },
    ], S.camera);
    return (t, realT) => {
      cam(t);
      strokes.forEach(s => { const p = K.prog(s.t0 < B[1] ? t + 1.0 : t, s.t0, s.t1, 'inOut'); if (s.line) s.g.setDrawRange(0, Math.ceil(p * s.n)); else s.g.setDrawRange(0, Math.floor(p * s.g.index.count / 15) * 15); });
      forceArrows.forEach(a => { const p = K.prog(t, a.userData.t0, a.userData.t0 + 0.35, 'back'); a.visible = p > 0; a.scale.setScalar(Math.max(0.001, p)); });
      notes.forEach(l => { l.material.opacity = K.prog(l.userData.t0 < B[1] ? t + 1.0 : t, l.userData.t0, l.userData.t0 + 0.4); l.visible = l.material.opacity > 0; });
      truck.position.x = K.lerp(-5.5, -1.0, K.prog(t, B[1], B[1] + 1.4, 'inOut'));
      truck.visible = t > B[1];
      yellow.color.set('#ffe27a').multiplyScalar(0.85 + 0.15 * Math.sin(realT * 5));
      // the drawing lies flat on the sheet, then stands up at the end
      const rise = K.prog(t, B[3] + 0.9, B[3] + 2.3, 'inOut');
      draw.rotation.x = -Math.PI / 2 + rise * Math.PI / 2; draw.position.y = 0.06 + rise * 0.2;
      far.visible = rise > 0.3; beams.forEach(b => { b.visible = rise > 0.5; });
      pencil.position.set(K.lerp(-6, 6, (t * 0.11) % 1), 0.6 + 0.1 * Math.sin(realT * 3), K.lerp(-1.5, 1.5, (t * 0.07) % 1)); pencil.rotation.set(0.4, 0.6, 0.35); pencil.visible = t < B[3];
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.06 });
    for (let i = 0; i < 14; i++) k.play('paper', { t: 0.1 + i * 0.17, gain: 0.12, pitch: 1.6 + (i % 3) * 0.2, dur: 0.6 });
    for (let i = 0; i < 4; i++) k.play('tick', { t: B[1] + 0.2 + i * 0.12, gain: 0.25, pitch: 0.9 });
    k.play('hum', { t: B[1] + 0.2, gain: 0.12, pitch: 1.4, dur: 1.4 });
    k.play('swish', { t: B[2] + 0.2, gain: 0.25, pitch: 1.0, dur: 1.0 });
    k.play('thud', { t: B[2] + 0.75, gain: 0.3, pitch: 0.9 });
    k.play('thud', { t: B[3] + 0.25, gain: 0.35, pitch: 0.7 });
    k.play('riser', { t: B[3] + 0.9, gain: 0.2, pitch: 0.8, dur: 1.3 });
    k.play('chime', { t: B[3] + 2.3, gain: 0.22, pitch: 1.0, music: true });
  },
  post: null,
};
