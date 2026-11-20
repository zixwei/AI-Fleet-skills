window.STYLES = window.STYLES || {};
STYLES['evidence-board'] = {
  id: 'evidence-board', name: 'Evidence Board',
  family: 'Strange worlds',
  use: 'Explainer',
  look: 'A cork board in a dim office, lit by one desk lamp. Photos, sticky notes, printouts and a map piece are pinned up with red push pins. Red string runs from pin to pin, and a red marker circles the last item.',
  motion: 'Each new item is pinned to the board with a small push. The red string runs out from the last pin to the new one. At the end the marker draws a circle round the root cause, and the camera moves in.',
  shownHere: 'How a data breach is traced, working backwards: customer data turns up for sale; the logs show a database copied at night; the copy came from an admin account logged in by VPN; that password was stolen by a phishing email.',
  goodFor: 'Root-cause analysis and investigations: incidents, outages, fraud, history mysteries, any chain of cause and effect told one clue at a time.',
  fonts: ['Special Elite', 'Permanent Marker'],
  duration: 12,
  samples: 4,
  // CONTENT: the clues in the order they are pinned (from the effect back to the cause); kind sets the look
  clues: [
    { kind: 'photo', title: 'DATA FOR SALE', lines: ['2.1M customer records', 'posted on a forum'], x: 3.4, y: 1.0, rot: 0.06 },
    { kind: 'printout', title: 'DB LOG', lines: ['03:12 export users', '03:12 rows 2,104,377', '03:14 transfer out'], x: 0.6, y: -0.9, rot: -0.04 },
    { kind: 'note', title: 'admin account', lines: ['VPN login 02:58', 'new device'], x: -1.9, y: 1.1, rot: 0.08 },
    { kind: 'photo', title: 'PHISHING EMAIL', lines: ['"Reset your password"', 'sent to admin, 3 days before'], x: -4.3, y: -0.6, rot: -0.07 },
  ],
  beats: [
    { t: 0.0, label: 'Start with the leak: data for sale' },
    { t: 2.4, label: 'The logs: a database copy at 03:12' },
    { t: 4.8, label: 'From an admin account, by VPN' },
    { t: 7.2, label: 'Its password: stolen by phishing' },
    { t: 9.6, label: 'Root cause: one phishing email' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), FT = 'Special Elite', FM = 'Permanent Marker', CL = this.clues, BE = this.beats;
    scene.background = new T.Color('#0e0c0c'); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#6a7088', '#100c08', 0.25));
    const lamp = new T.SpotLight('#ffd8a0', 160, 30, 0.62, 0.55, 1.4); lamp.position.set(-1.5, 5.5, 6.5); lamp.target.position.set(-0.2, 0.1, 0); lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); lamp.shadow.bias = -0.0006; scene.add(lamp, lamp.target);
    const std = (c, r = 0.8, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    // the board: cork in a wooden frame, on a dark wall
    const cork = K.canvasTex(1024, 640, (g, r, w, h) => { g.fillStyle = '#b8875a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { g.fillStyle = r() < 0.5 ? `rgba(90,55,25,${r.range(0.1, 0.35)})` : `rgba(230,190,140,${r.range(0.1, 0.3)})`; g.fillRect(r() * w, r() * h, r.range(1, 3), r.range(1, 3)); }
      for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(60,35,15,0.5)'; g.beginPath(); g.arc(r() * w, r() * h, 1.6, 0, 7); g.fill(); } }, 3);
    const board = new T.Mesh(new T.BoxGeometry(11.5, 6.6, 0.15), [std('#3a2414'), std('#3a2414'), std('#3a2414'), std('#3a2414'), std('#ffffff', 0.95, { map: cork }), std('#3a2414')]); board.receiveShadow = true; scene.add(board);
    [[0, 3.42, 12.1, 0.3], [0, -3.42, 12.1, 0.3], [6.0, 0, 0.3, 7.1], [-6.0, 0, 0.3, 7.1]].forEach(([x, y, w, h]) => { const f = new T.Mesh(new T.BoxGeometry(w, h, 0.3), std('#4a2e18', 0.6)); f.position.set(x, y, 0.05); f.castShadow = true; scene.add(f); });
    const wall = new T.Mesh(new T.PlaneGeometry(40, 20), std('#2a2a30', 0.95)); wall.position.z = -0.3; wall.receiveShadow = true; scene.add(wall);
    // older clutter already on the board: notes and a map piece, faded
    const rr = K.rng(17);
    const card = (w, h, draw, seed, x, y, rot) => { const tex = K.canvasTex(Math.round(w * 220), Math.round(h * 220), draw, seed); const m = new T.Mesh(new T.PlaneGeometry(w, h), std('#ffffff', 0.85, { map: tex })); m.position.set(x, y, 0.09); m.rotation.z = rot; m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; };
    card(1.6, 1.2, (g, r, w, h) => { g.fillStyle = '#d8d0b0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a9a6a'; g.lineWidth = 6; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(0, r() * h); g.bezierCurveTo(w * 0.3, r() * h, w * 0.6, r() * h, w, r() * h); g.stroke(); } g.strokeStyle = '#4a6aa0'; g.lineWidth = 10; g.beginPath(); g.moveTo(0, h * 0.7); g.quadraticCurveTo(w * 0.5, h * 0.4, w, h * 0.8); g.stroke(); }, 40, -4.6, 2.2, 0.1);
    card(0.9, 0.9, (g, r, w, h) => { g.fillStyle = '#f0e070'; g.fillRect(0, 0, w, h); g.fillStyle = '#333'; g.font = `400 26px "${FT}"`; g.fillText('who has', 14, 50); g.fillText('VPN keys?', 14, 90); }, 41, 4.9, -2.3, -0.1);
    card(1.1, 0.8, (g, r, w, h) => { g.fillStyle = '#e8e8e0'; g.fillRect(0, 0, w, h); g.fillStyle = '#555'; for (let i = 0; i < 7; i++) g.fillRect(14, 16 + i * 22, r.range(80, w - 28), 8); }, 42, 1.8, 2.4, 0.04);
    // the clues
    const drawers = {
      photo: c => (g, r, w, h) => { g.fillStyle = '#f6f4ee'; g.fillRect(0, 0, w, h); g.fillStyle = '#20242c'; g.fillRect(18, 18, w - 36, h * 0.62); const ih = h * 0.62;
        if (c.title.startsWith('DATA')) { g.fillStyle = '#3a404a'; for (let i = 0; i < 8; i++) g.fillRect(34, 34 + i * (ih - 40) / 8, w - 120, 10); g.fillStyle = '#e04040'; g.font = `400 34px "${FT}"`; g.fillText('$ 0.5 BTC', w - 220, ih - 10); }
        else { g.fillStyle = '#e8ecf4'; g.fillRect(34, 34, w - 68, ih - 32); g.fillStyle = '#3a6ad0'; g.fillRect(34, 34, w - 68, 30); g.fillStyle = '#333'; g.font = `400 26px "${FT}"`; g.fillText('Reset your password', 48, 100); g.fillStyle = '#3a6ad0'; g.fillRect(48, 120, 160, 34); g.fillStyle = '#fff'; g.fillText('Reset', 90, 145); }
        g.fillStyle = '#222'; g.font = `400 34px "${FT}"`; g.textAlign = 'center'; g.fillText(c.title, w / 2, ih + 66); g.font = `400 24px "${FT}"`; c.lines.forEach((l, k) => g.fillText(l, w / 2, ih + 100 + k * 28)); },
      printout: c => (g, r, w, h) => { g.fillStyle = '#f2f2ea'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(120,160,120,0.18)'; for (let y = 0; y < h; y += 44) g.fillRect(0, y, w, 22); g.fillStyle = '#222'; g.font = `400 34px "${FT}"`; g.fillText(c.title, 22, 48); g.font = `400 26px "${FT}"`; c.lines.forEach((l, k) => { g.fillStyle = k === 0 ? '#b02020' : '#222'; g.fillText(l, 22, 100 + k * 40); }); },
      note: c => (g, r, w, h) => { g.fillStyle = '#f2e060'; g.fillRect(0, 0, w, h); g.fillStyle = '#222'; g.font = `400 34px "${FM}"`; g.fillText(c.title, 20, 54); g.font = `400 28px "${FM}"`; c.lines.forEach((l, k) => g.fillText(l, 20, 104 + k * 40)); },
    };
    const sizes = { photo: [1.9, 2.1], printout: [2.0, 1.25], note: [1.5, 1.3] };
    const clues = CL.map((c, i) => { const [w, h] = sizes[c.kind]; const m = card(w, h, drawers[c.kind](c), 50 + i, c.x, c.y, c.rot); m.position.z = 0.13 + i * 0.004;
      const pin = new T.Group(); const head = new T.Mesh(new T.SphereGeometry(0.11, 16, 12), std('#d82020', 0.3)); head.position.z = 0.16; const neck = new T.Mesh(new T.CylinderGeometry(0.05, 0.08, 0.12, 12), std('#d82020', 0.3)); neck.rotation.x = Math.PI / 2; neck.position.z = 0.07; head.castShadow = neck.castShadow = true; pin.add(head, neck); scene.add(pin);
      const top = new T.Vector3(c.x + Math.sin(-c.rot) * (h / 2 - 0.18), c.y + Math.cos(c.rot) * (h / 2 - 0.18), 0.15); pin.position.copy(top);
      return { m, pin, top, base: m.position.clone() }; });
    // red string between consecutive pins, with a little sag; drawn out over time
    const strings = clues.slice(1).map((c, i) => { const a = clues[i].top.clone().setZ(0.3), b = c.top.clone().setZ(0.3), mid = a.clone().lerp(b, 0.5); mid.y -= 0.25;
      const geo = new T.TubeGeometry(new T.QuadraticBezierCurve3(a, mid, b), 60, 0.022, 6, false); const m = new T.Mesh(geo, std('#c81818', 0.6)); m.castShadow = true; scene.add(m); return { m, n: geo.index.count }; });
    // the marker circle round the last clue
    const last = clues[clues.length - 1].base, ring = []; for (let i = 0; i <= 80; i++) { const a = i / 80 * Math.PI * 2.15 + 0.6; ring.push(new T.Vector3(last.x + Math.cos(a) * (1.35 + 0.06 * Math.sin(a * 3)), last.y + Math.sin(a) * (1.45 + 0.05 * Math.cos(a * 2)), 0.2)); }
    const circGeo = new T.TubeGeometry(new T.CatmullRomCurve3(ring), 160, 0.05, 6, false); const circ = new T.Mesh(circGeo, std('#e01818', 0.5, { emissive: '#600000', emissiveIntensity: 0.4 })); scene.add(circ);
    const titles = BE.map(b => { const l = K.label(b.label, { font: FT, weight: 400, px: 64, color: '#f2ead8', bg: 'rgba(14,12,12,0.85)', radius: 6, pad: 0.35, height: 0.36 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [2.2, 0.4, 12.4], look: [1.0, 0.3, 0] },
      { t: 7.2, pos: [-0.4, 0.2, 12.8], look: [-0.2, 0.3, 0] },
      { t: 9.6, pos: [-1.4, 0.1, 12.0], look: [-1.2, 0.3, 0] },
      { t: 12, pos: [-3.2, -0.1, 8.6], look: [-3.4, -0.1, 0] },
    ], S.camera);
    const pinT = i => i === 0 ? -0.5 : B[i] + 0.15;
    return (t, realT) => {
      cam(t);
      clues.forEach((c, i) => { const u = K.prog(t, pinT(i), pinT(i) + 0.45, 'out'), push = K.prog(t, pinT(i) + 0.45, pinT(i) + 0.6);
        c.m.visible = c.pin.visible = u > 0; c.m.position.copy(c.base); c.m.position.z = c.base.z + (1 - u) * 2.5 - 0.012 * Math.sin(Math.PI * push); c.m.position.x = c.base.x + (1 - u) * 1.5;
        c.pin.position.copy(c.top); c.pin.position.z = c.top.z + (1 - u) * 2.5 + 0.25 * (1 - K.prog(t, pinT(i) + 0.4, pinT(i) + 0.6)); c.pin.position.x = c.top.x + (1 - u) * 1.5; });
      strings.forEach((s, i) => { const d = K.prog(t, B[i + 1] + 0.6, B[i + 1] + 1.3, 'inOut'); s.m.visible = d > 0; s.m.geometry.setDrawRange(0, Math.floor(s.n * d / 36) * 36); });
      const dc = K.prog(t, B[4] + 0.3, B[4] + 1.4, 'inOut'); circ.visible = dc > 0; circGeo.setDrawRange(0, Math.floor(circGeo.index.count * dc / 36) * 36);
      lamp.intensity = 160 * (1 + 0.02 * Math.sin(realT * 50) * (Math.sin(realT * 0.7) > 0.97 ? 1 : 0));
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.06 }); k.bed('night', { gain: 0.02 });
    k.play('thud', { t: 0.0, gain: 0.3, pitch: 1.6 }); k.play('click', { t: 0.05, gain: 0.3, pitch: 0.7 });
    [1, 2, 3].forEach(i => { k.play('paper', { t: B[i] + 0.15, gain: 0.25, pitch: 1.0 }); k.play('thud', { t: B[i] + 0.6, gain: 0.3, pitch: 1.7 }); k.play('click', { t: B[i] + 0.6, gain: 0.3, pitch: 0.7 }); k.play('swish', { t: B[i] + 0.6, gain: 0.15, pitch: 1.6, dur: 0.7 }); });
    k.play('paper', { t: B[4] + 0.3, gain: 0.35, pitch: 0.6, dur: 1.1 }); k.play('drop', { t: B[4] + 1.4, gain: 0.25, pitch: 0.8 }); k.play('bell', { t: B[4] + 1.5, gain: 0.15, pitch: 0.5, music: true });
  },
  post: null,
};
