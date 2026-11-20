window.STYLES = window.STYLES || {};
STYLES['pinball-table'] = {
  id: 'pinball-table', name: 'Pinball Table',
  family: 'Stage and play',
  use: 'Explainer',
  look: 'A pinball table under glass: a painted playfield, a chrome ball, lit round bumpers, a wire ramp and flippers. Each bumper is one stage, with its name on a lit insert. An orange dot-matrix display set into the playfield shows the status.',
  motion: 'The ball follows a fixed path: the plunger launches it, it hits one bumper after another with a flash and a ding, climbs the ramp and drops into the last hole. The display changes at each stage.',
  shownHere: 'How a support ticket moves between teams: a ticket arrives; triage sorts it; first-line support tries to solve it; a hard problem goes up to engineering; when the fix is confirmed, the ticket is closed.',
  goodFor: 'Workflows with hand-offs and bounces: tickets, approvals, order handling, routing, any process that moves between teams and sometimes goes back.',
  fonts: ['Press Start 2P', 'Bungee'],
  duration: 12,
  samples: 4,
  // CONTENT: the display text for each beat
  beats: [
    { t: 0.0, label: 'A ticket arrives: launch!', display: 'TICKET 4821' },
    { t: 2.4, label: 'Triage sorts it', display: 'TRIAGE' },
    { t: 4.8, label: 'First-line support tries to fix it', display: 'SUPPORT L1' },
    { t: 7.2, label: 'Too hard: up the ramp to engineering', display: 'ENGINEERING' },
    { t: 9.6, label: 'Fix confirmed: ticket closed', display: 'CLOSED' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), FD = 'Press Start 2P', FB = 'Bungee', BE = this.beats;
    scene.background = new T.Color('#0a0610'); scene.add(S.camera);
    const L = K.lights(S, 'lamp', { size: 9 }); L.key.intensity = 1.6; L.amb.intensity = 0.5; S.scene.environmentIntensity = 0.6;
    const std = (c, r = 0.5, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const table = new T.Group(); table.rotation.x = -0.12; scene.add(table);
    const W = 10, D = 17;
    // the playfield art
    const art = K.canvasTex(1000, 1700, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1a2a6a'); gr.addColorStop(1, '#4a1a5a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 18; i++) { g.strokeStyle = `rgba(255,${120 + i * 6},80,0.12)`; g.lineWidth = 16; g.beginPath(); g.arc(w / 2, h * 0.92, 120 + i * 60, Math.PI, 0); g.stroke(); }
      g.fillStyle = 'rgba(255,220,120,0.9)'; g.font = `400 64px "${FB}"`; g.textAlign = 'center'; g.fillText('HELP DESK', w / 2, h * 0.47); }, 3);
    const field = new T.Mesh(new T.PlaneGeometry(W, D), std('#ffffff', 0.35, { map: art })); field.rotation.x = -Math.PI / 2; field.receiveShadow = true; table.add(field);
    const wood = std('#3a2010', 0.5);
    [[-W / 2 - 0.2, 0, 0.4, D], [W / 2 + 0.2, 0, 0.4, D], [0, -D / 2 - 0.2, W + 0.8, 0.4], [0, D / 2 + 0.2, W + 0.8, 0.4]].forEach(([x, z, w, d]) => { const m = new T.Mesh(new T.BoxGeometry(w, 0.9, d), wood); m.position.set(x, 0.45, z); m.castShadow = true; table.add(m); });
    const lane = new T.Mesh(new T.BoxGeometry(0.12, 0.5, 11), std('#c8ccd2', 0.2, { metalness: 0.9 })); lane.position.set(3.9, 0.25, 2.0); table.add(lane);
    const glass = new T.Mesh(new T.PlaneGeometry(W + 0.4, D + 0.4), new T.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.06, roughness: 0.02, metalness: 0.5 })); glass.rotation.x = -Math.PI / 2; glass.position.y = 1.0; table.add(glass);
    // bumpers and targets: each a stage with a lit insert
    const insert = (txt, x, z, col) => { const l = K.label(txt, { font: FB, weight: 400, px: 56, color: '#ffffff', bg: col, radius: 20, pad: 0.22, height: 0.4 }); l.rotation.x = -Math.PI / 2; l.position.set(x, 0.02, z); table.add(l); return l; };
    const bumper = (x, z, col, name, iz) => { const g = new T.Group(); g.position.set(x, 0, z); table.add(g); const base = new T.Mesh(new T.CylinderGeometry(0.7, 0.75, 0.3, 32), std('#f4f4f4', 0.3)); base.position.y = 0.15;
      const cap = new T.Mesh(new T.CylinderGeometry(0.62, 0.62, 0.35, 32), std(col, 0.25, { emissive: col, emissiveIntensity: 0.3, transparent: true, opacity: 0.9 })); cap.position.y = 0.48; const ring = new T.Mesh(new T.TorusGeometry(0.72, 0.06, 8, 32), std('#c8ccd2', 0.2, { metalness: 1 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.32;
      g.add(base, cap, ring); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); const ins = insert(name, x, z + iz, col); return { g, cap, ins }; };
    const triage = bumper(0.2, -4.4, '#ff4a7a', 'TRIAGE', 1.3), support = bumper(-2.4, -1.4, '#3ac0ff', 'SUPPORT', 1.3), extra = bumper(2.4, -1.8, '#ffd040', 'FAQ', 1.3);
    // the ramp to engineering: a wire track rising to the top left
    const rampPts = [[-3.6, 0.05, 2.8], [-3.9, 0.6, 0.0], [-3.6, 1.3, -3.6], [-2.4, 1.6, -6.4], [-0.6, 1.2, -7.2]].map(p => new T.Vector3(...p));
    const rampCurve = new T.CatmullRomCurve3(rampPts);
    [-0.25, 0.25].forEach(o => { const pts = rampCurve.getPoints(60).map((p, i, a) => { const n = (a[Math.min(i + 1, a.length - 1)].clone().sub(a[Math.max(i - 1, 0)])).normalize(); return p.clone().add(new T.Vector3(-n.z, 0, n.x).multiplyScalar(o)); }); const m = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 80, 0.03, 6), std('#d8dce2', 0.15, { metalness: 1 })); m.castShadow = true; table.add(m); });
    const engSign = K.label('ENGINEERING', { font: FB, weight: 400, px: 56, color: '#ffffff', bg: '#7a3aff', radius: 16, pad: 0.22, height: 0.38 }); engSign.position.set(-1.8, 2.3, -7.0); table.add(engSign);
    const closedHole = new T.Mesh(new T.CircleGeometry(0.42, 32), new T.MeshBasicMaterial({ color: '#05050a' })); closedHole.rotation.x = -Math.PI / 2; closedHole.position.set(1.4, 0.015, 3.0); table.add(closedHole);
    const closedIns = insert('CLOSED', 1.4, 4.2, '#2ac06a');
    const ticketIns = insert('NEW TICKET', 3.9, 7.6, '#ff8a2a'); ticketIns.scale.setScalar(0.8);
    // flippers
    [[-1.4, 1], [1.4, -1]].forEach(([x, s]) => { const f = new T.Mesh(new T.BoxGeometry(1.8, 0.25, 0.35), std('#f4f4f4', 0.3)); f.geometry.translate(-s * 0.8, 0, 0); f.position.set(x - s * 0.2 + s * 0.8 - s * 0.8, 0.15, 6.4); f.rotation.y = s * 0.45; f.castShadow = true; table.add(f); });
    // the ball and its path through the stages (table coordinates); each beat owns one stretch
    const ball = new T.Mesh(new T.SphereGeometry(0.28, 32, 24), std('#ffffff', 0.05, { metalness: 1 })); ball.castShadow = true; table.add(ball);
    const legs = [
      [[3.9, 0.28, 7.2], [3.9, 0.28, 3.0], [3.9, 0.28, -4.0], [3.4, 0.28, -7.0], [1.8, 0.28, -7.4], [0.9, 0.28, -5.3]],
      [[0.9, 0.28, -5.3], [1.4, 0.28, -4.0], [0.4, 0.28, -2.8], [-1.2, 0.28, -2.0], [-1.6, 0.28, -1.6]],
      [[-1.6, 0.28, -1.6], [-1.0, 0.28, -0.4], [-2.4, 0.28, 0.4], [-3.2, 0.28, 1.6], [-3.6, 0.33, 2.8]],
      rampPts.map(p => [p.x, p.y + 0.28, p.z]).concat([[0.4, 0.8, -6.4], [1.2, 0.28, -4.8]]),
      [[1.2, 0.28, -4.8], [2.4, 0.28, -3.0], [2.0, 0.28, -0.2], [1.6, 0.28, 2.0], [1.4, 0.1, 3.0]],
    ].map(l => new T.CatmullRomCurve3(l.map(p => new T.Vector3(...p))));
    // hits: when the ball touches a bumper
    const hits = [[B[1] + 0.55, triage], [B[2] + 0.75, support], [B[4] + 0.5, extra]];
    // the dot-matrix display: one texture per beat
    const dmd = BE.map((b, i) => K.canvasTex(512, 128, (g, r, w, h) => { g.fillStyle = '#100604'; g.fillRect(0, 0, w, h); const c = document.createElement('canvas'); c.width = 128; c.height = 32; const cg = c.getContext('2d'); cg.fillStyle = '#000'; cg.fillRect(0, 0, 128, 32); cg.fillStyle = '#fff'; cg.font = `400 ${b.display.length > 10 ? 9 : 12}px "${FD}"`; cg.textAlign = 'center'; cg.textBaseline = 'middle'; cg.fillText(b.display, 64, 17);
      const d = cg.getImageData(0, 0, 128, 32).data; for (let y = 0; y < 32; y++) for (let x = 0; x < 128; x++) { const on = d[(y * 128 + x) * 4] > 100; g.fillStyle = on ? '#ff8a1a' : '#2a1206'; g.beginPath(); g.arc(x * 4 + 2, y * 4 + 2, 1.6, 0, 7); g.fill(); } }, 50 + i));
    // the display is set into the playfield, like an inset screen
    const screen = new T.Mesh(new T.PlaneGeometry(4.8, 1.2), new T.MeshBasicMaterial({ map: dmd[0] })); screen.rotation.x = -Math.PI / 2; screen.position.set(-0.4, 0.025, 1.0); table.add(screen);
    const titles = BE.map(b => { const l = K.label(b.label, { font: FB, weight: 400, px: 62, color: '#fff4dc', bg: 'rgba(10,6,16,0.82)', radius: 12, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([{ t: 0, pos: [2.4, 15.5, 12.5], look: [0.4, 0.6, -2.6] }, { t: 6, pos: [-1.2, 15.5, 12.0], look: [-0.4, 0.6, -3.0] }, { t: 12, pos: [1.6, 15.5, 12.8], look: [0.3, 0.6, -2.6] }], S.camera);
    return (t, realT) => {
      cam(t);
      let k = 0; for (let i = 1; i < B.length; i++) if (t >= B[i]) k = i;
      const u = K.prog(t, B[k] + 0.1, (B[k + 1] ?? 12) - 0.3, k === 0 ? 'in' : 'inOut'), launch = k === 0 ? K.prog(t, 0.6, 2.2, 'in') : u;
      ball.position.copy(legs[k].getPoint(K.clamp(launch)));
      if (k === 4 && u >= 1) ball.position.y = -0.2;
      hits.forEach(([th, bmp]) => { const f = K.clamp(1 - Math.abs(t - th) / 0.25); bmp.cap.material.emissiveIntensity = 0.3 + 2.5 * f; bmp.cap.scale.setScalar(1 + 0.12 * f); });
      engSign.material.opacity = 0.5 + 0.5 * K.prog(t, B[3] + 0.8, B[3] + 1.2) * (0.7 + 0.3 * Math.sin(realT * 10));
      closedIns.material.opacity = t > B[4] + 1.6 ? 0.6 + 0.4 * Math.sin(realT * 12) : 0.45; ticketIns.material.opacity = t < 1.5 ? 0.7 + 0.3 * Math.sin(realT * 12) : 0.5;
      [triage, support].forEach((bm, i) => { bm.ins.material.opacity = k === i + 1 ? 1 : 0.5; });
      screen.material.map = dmd[k];
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.05 }); k.bed('crowd', { gain: 0.02 });
    k.play('riser', { t: 0.0, gain: 0.12, pitch: 1.2, dur: 0.6 }); k.play('thud', { t: 0.6, gain: 0.35, pitch: 1.4 }); k.play('swish', { t: 0.7, gain: 0.15, pitch: 1.6, dur: 1.2 });
    k.play('bell', { t: B[1] + 0.55, gain: 0.3, pitch: 1.5, music: true }); k.play('zap', { t: B[1] + 0.55, gain: 0.15, pitch: 1.5 });
    k.play('bell', { t: B[2] + 0.75, gain: 0.3, pitch: 1.2, music: true }); k.play('zap', { t: B[2] + 0.75, gain: 0.15, pitch: 1.2 });
    k.play('swish', { t: B[3] + 0.3, gain: 0.2, pitch: 0.8, dur: 1.4 }); k.play('metal', { t: B[3] + 0.5, gain: 0.15, pitch: 1.8 }); k.play('riser', { t: B[3] + 0.6, gain: 0.12, pitch: 1.0, dur: 1.0 }); k.play('blip', { t: B[3] + 1.1, gain: 0.15, pitch: 1.5 });
    k.play('bell', { t: B[4] + 0.5, gain: 0.25, pitch: 1.8, music: true }); k.play('drop', { t: B[4] + 1.6, gain: 0.3, pitch: 1.0 }); k.play('sparkle', { t: B[4] + 1.7, gain: 0.25 }); k.play('chime', { t: B[4] + 1.8, gain: 0.15, pitch: 1.0, music: true });
  },
  post: null,
};
