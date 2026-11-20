window.STYLES = window.STYLES || {};
STYLES['frosted-pane'] = {
  id: 'frosted-pane', name: 'Frosted Pane',
  family: 'Earth, weather and sky',
  use: 'Story',
  look: 'A cold window at dawn with soft, blurred city lights behind it. Frost ferns grow across the glass from the corners, and a white mist of condensation covers the rest. Lines wiped through the mist show the lights clearly, and drops run down from them.',
  motion: 'The frost grows in branching fronds. A fingertip moves across the glass and wipes clear lines and small circles; little drops gather at the bottom of each line and run down.',
  shownHere: 'How a family tree branches: start with you; you have two parents; they had four parents between them; eight great-grandparents above that; each step back doubles.',
  goodFor: 'Branching and doubling stories: family trees, decision trees, growth, quiet personal stories told by hand.',
  fonts: ['Caveat:wght@600;700', 'Nunito:wght@800'],
  duration: 12,
  samples: 4,
  // CONTENT: the levels of the tree (label and number of people)
  levels: [['you', 1], ['2 parents', 2], ['4 grandparents', 4], ['8 great-grandparents', 8]],
  beats: [
    { t: 0.0, label: 'Frost branches across the glass' },
    { t: 2.4, label: 'Start with you' },
    { t: 4.8, label: 'You have two parents' },
    { t: 7.2, label: 'They had four between them' },
    { t: 9.6, label: 'Eight above that: each step doubles' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), FH = 'Caveat', FT = 'Nunito', LV = this.levels, BE = this.beats;
    scene.background = new T.Color('#1a1a22'); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#c8d0e0', '#2a2a30', 0.8));
    // behind the glass: a dawn sky with blurred city lights
    const city = K.canvasTex(1024, 640, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a3a6a'); gr.addColorStop(0.55, '#c88a7a'); gr.addColorStop(1, '#3a2a3a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 70; i++) { const x = r() * w, y = h * r.range(0.45, 0.95), s = r.range(14, 46); const c = r() < 0.6 ? '255,200,120' : r() < 0.5 ? '255,240,220' : '140,200,255'; const rg = g.createRadialGradient(x, y, 0, x, y, s); rg.addColorStop(0, `rgba(${c},0.85)`); rg.addColorStop(0.7, `rgba(${c},0.35)`); rg.addColorStop(1, `rgba(${c},0)`); g.fillStyle = rg; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); } }, 3);
    const W = 9.6, H = 6.0;
    const behind = new T.Mesh(new T.PlaneGeometry(W * 1.3, H * 1.3), new T.MeshBasicMaterial({ map: city })); behind.position.z = -3; scene.add(behind);
    // the frame
    const wood = new T.MeshStandardMaterial({ color: '#e8e2d8', roughness: 0.6 });
    [[0, H / 2 + 0.2, W + 0.8, 0.4], [0, -H / 2 - 0.2, W + 0.8, 0.4], [W / 2 + 0.2, 0, 0.4, H], [-W / 2 - 0.2, 0, 0.4, H]].forEach(([x, y, w, h]) => { const m = new T.Mesh(new T.BoxGeometry(w, h, 0.3), wood); m.position.set(x, y, 0.1); scene.add(m); });
    // the mist and frost: one canvas, redrawn every frame from the clock
    const CW = 1024, CH = 640, cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const g = cv.getContext('2d');
    const mistTex = new T.CanvasTexture(cv); mistTex.colorSpace = T.SRGBColorSpace;
    const pane = new T.Mesh(new T.PlaneGeometry(W, H), new T.MeshBasicMaterial({ map: mistTex, transparent: true })); pane.position.z = 0; scene.add(pane);
    // frost fronds: branching segments from the corners, each with a birth time
    const rr = K.rng(74), segs = [];
    const frond = (x, y, a, len, depth, t0) => { const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len; segs.push([x, y, x2, y2, t0, depth]); if (depth <= 0) return;
      const n = 5; for (let k = 1; k <= n; k++) { const f = k / (n + 1), px = x + (x2 - x) * f, py = y + (y2 - y) * f, tb = t0 + 0.25 + f * 0.6; [-1, 1].forEach(s => frond(px, py, a + s * rr.range(0.7, 1.0), len * rr.range(0.28, 0.4), depth - 1, tb)); }
      frond(x2, y2, a + rr.range(-0.3, 0.3), len * 0.55, depth - 1, t0 + 0.8); };
    [[0, 0, 0.6], [CW, 0, Math.PI - 0.6], [0, CH, -0.6], [CW, CH, Math.PI + 0.6]].forEach(([x, y, a], i) => { for (let k = 0; k < 3; k++) frond(x, y, a + (k - 1) * 0.35, rr.range(150, 230), 2, -1.5 + i * 0.3 + k * 0.2); });
    // the tree to wipe: nodes per level, strokes from each child to its parents
    const lvY = [560, 430, 300, 170], nodes = LV.map(([, n], li) => Array.from({ length: n }, (_, j) => [610 + (j - (n - 1) / 2) * (li === 3 ? 80 : li === 2 ? 160 : 280), lvY[li]]));
    const strokes = []; for (let li = 1; li < LV.length; li++) nodes[li].forEach((p, j) => { const c = nodes[li - 1][Math.floor(j / 2)]; strokes.push({ li, a: c, b: p }); });
    const lvT = [B[1] + 0.2, B[2] + 0.2, B[3] + 0.2, B[4] + 0.2];
    // time windows: each level's strokes share the first 1.6 s of its beat
    strokes.forEach(s => { const sib = strokes.filter(q => q.li === s.li), k = sib.indexOf(s), span = 1.6 / sib.length; s.t0 = lvT[s.li] + k * span; s.t1 = s.t0 + span * 0.9; });
    const finger = new T.Mesh(new T.CapsuleGeometry(0.22, 0.8, 8, 16), new T.MeshStandardMaterial({ color: '#d8a888', roughness: 0.6 })); finger.rotation.x = 0.9; scene.add(finger);
    const toWorld = (x, y) => new T.Vector3((x / CW - 0.5) * W, (0.5 - y / CH) * H, 0.25);
    const titles = BE.map(b => { const l = K.label(b.label, { font: FT, weight: 800, px: 66, color: '#ffffff', bg: 'rgba(20,20,30,0.75)', radius: 14, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    S.camera.position.set(0, -0.2, 13.5); S.camera.lookAt(0, -0.3, 0);
    return (t, realT) => {
      // mist
      g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, CW, CH); g.fillStyle = 'rgba(222,228,238,0.9)'; g.fillRect(0, 0, CW, CH);
      for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(255,255,255,0.18)'; const x = (i * 97.13) % CW, y = (i * 53.71) % CH; g.beginPath(); g.arc(x, y, 2 + (i % 3), 0, 7); g.fill(); }
      // frost: segments grow in over 0.6 s from their birth time
      g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineCap = 'round';
      segs.forEach(([x, y, x2, y2, t0, d]) => { const u = K.clamp((t - t0) / 0.6); if (u <= 0) return; g.lineWidth = 1 + d * 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (x2 - x) * u, y + (y2 - y) * u); g.stroke(); });
      // wipes: clear the mist along each stroke up to now, plus circles at the nodes and the level labels
      g.globalCompositeOperation = 'destination-out'; g.strokeStyle = 'rgba(0,0,0,1)'; g.fillStyle = 'rgba(0,0,0,1)';
      let tip = null;
      if (t > lvT[0]) { const u = K.prog(t, lvT[0], lvT[0] + 0.8); const [x, y] = nodes[0][0]; g.beginPath(); g.arc(x, y, 26, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * u); g.lineWidth = 16; g.stroke(); if (u < 1) tip = [x + 26 * Math.cos(-Math.PI / 2 + Math.PI * 2 * u), y + 26 * Math.sin(-Math.PI / 2 + Math.PI * 2 * u)]; }
      strokes.forEach(s => { const u = K.prog(t, s.t0, s.t1); if (u <= 0) return; const x = s.a[0] + (s.b[0] - s.a[0]) * u, y = s.a[1] - 26 + (s.b[1] + 18 - (s.a[1] - 26)) * u; g.lineWidth = 12; g.beginPath(); g.moveTo(s.a[0], s.a[1] - 26); g.lineTo(x, y); g.stroke(); if (u >= 1) { g.beginPath(); g.arc(s.b[0], s.b[1], s.li === 3 ? 13 : 18, 0, 7); g.fill(); } if (u > 0 && u < 1) tip = [x, y]; });
      LV.forEach(([txt], li) => { const u = K.prog(t, lvT[li] + 1.6, lvT[li] + 2.2); if (u <= 0) return; g.save(); g.beginPath(); g.rect(20, lvY[li] - 40, 420 * u, 80); g.clip(); g.font = `700 ${li === 3 ? 34 : 44}px "${FH}"`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(txt, 28, lvY[li]); g.restore(); });
      // drops run down from the wiped lines
      g.globalCompositeOperation = 'destination-out';
      strokes.forEach((s, i) => { const age = t - s.t1 - 0.4; if (age <= 0 || i % 2) return; const x = s.b[0] + 6, y0 = s.b[1] + 20, y = y0 + Math.min(220, age * 60 * (1 + (i % 3) * 0.3)); g.lineWidth = 5; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y); g.stroke(); g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); });
      g.globalCompositeOperation = 'source-over'; mistTex.needsUpdate = true;
      // the fingertip follows the wipe
      finger.visible = !!tip; if (tip) { const p = toWorld(tip[0], tip[1]); finger.position.set(p.x + 0.15, p.y - 0.55, 0.6); }
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.05 }); k.bed('room', { gain: 0.03 });
    for (let i = 0; i < 12; i++) k.play('sparkle', { t: 0.1 + i * 0.18, gain: 0.04 });
    k.play('glass', { t: 0.3, gain: 0.12, pitch: 1.8 });
    [1, 2, 3, 4].forEach((bi, i) => { k.play('swish', { t: B[bi] + 0.2, gain: 0.18, pitch: 1.6 - i * 0.1, dur: 1.6 }); k.play('pluck', { t: B[bi] + 1.8, gain: 0.12, pitch: [1, 1.12, 1.26, 1.5][i], music: true }); });
    k.play('drop', { t: B[2] + 2.2, gain: 0.1, pitch: 1.6 }); k.play('drop', { t: B[3] + 2.4, gain: 0.1, pitch: 1.7 }); k.play('chime', { t: B[4] + 2.0, gain: 0.12, pitch: 1.0, music: true });
  },
  post: null,
};
