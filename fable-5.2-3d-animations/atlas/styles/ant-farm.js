window.STYLES = window.STYLES || {};
STYLES['ant-farm'] = {
  id: 'ant-farm', name: 'Ant Farm',
  family: 'Small worlds',
  use: 'Explainer',
  look: 'A thin glass ant farm seen from the side: layers of sand in a wooden frame, dark tunnels that open into warm-lit chambers, and a small model of one step of the work in each chamber.',
  motion: 'Tunnels dig themselves down through the sand and open into chambers. Ants carry each job along the tunnels from chamber to chamber, and the camera follows the work down.',
  shownHere: "How a company's departments pass work: sales wins a job, design plans it, the workshop builds it, and shipping sends it out.",
  goodFor: 'Organisations, workflows and handoffs between teams: who does what, in what order, and how the work travels between them.',
  fonts: ['Gaegu:wght@700'],
  duration: 11,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Sales wins a job' },
    { t: 2.7, label: 'Design plans it' },
    { t: 5.4, label: 'The workshop builds it' },
    { t: 8.1, label: 'Shipping sends it out' },
  ],
  rooms: ['SALES', 'DESIGN', 'WORKSHOP', 'SHIPPING'],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Gaegu';
    scene.background = new T.Color('#f2ead8'); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 6, target: [0, 2.5, 0] }); L.key.position.set(-4, 8, 8); L.key.intensity = 2.0; L.amb.intensity = 1.0;
    const FW = 10, FH = 7;
    // sand with strata
    const sandTex = K.canvasTex(1600, 1120, (g, r, w, h) => {
      const bands = ['#e8c98e', '#d9b277', '#e2c084', '#c99f66', '#d6ae74', '#bf935c'];
      let y = 90; bands.forEach((c, i) => { const bh = r.range(120, 230); g.fillStyle = c; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 40) g.lineTo(x, y + 18 * Math.sin(x * 0.006 + i)); g.lineTo(w, h); g.lineTo(0, h); g.fill(); y += bh; });
      for (let i = 0; i < 30000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? 255 : 90},${r() < 0.5 ? 240 : 60},${r() < 0.5 ? 200 : 30},${r.range(0.05, 0.2)})`; g.fillRect(r() * w, 90 + r() * (h - 90), r.range(1, 3), r.range(1, 3)); }
      g.fillStyle = '#7fb06a'; g.fillRect(0, 70, w, 24); for (let i = 0; i < 200; i++) { g.strokeStyle = '#5f9a4a'; g.lineWidth = 3; const x = r() * w; g.beginPath(); g.moveTo(x, 80); g.lineTo(x + r.range(-8, 8), 80 - r.range(15, 50)); g.stroke(); }
      g.fillStyle = '#f2ead8'; g.fillRect(0, 0, w, 60);
    }, 4);
    const sand = new T.Mesh(new T.PlaneGeometry(FW, FH), new T.MeshStandardMaterial({ map: sandTex, roughness: 1 })); sand.position.set(0, FH / 2, 0); scene.add(sand);
    const wood = new T.MeshStandardMaterial({ color: '#a8743f', roughness: 0.6 });
    [[0, FH + 0.15, FW + 0.6, 0.3], [0, -0.15, FW + 0.6, 0.3], [-FW / 2 - 0.15, FH / 2, 0.3, FH + 0.6], [FW / 2 + 0.15, FH / 2, 0.3, FH + 0.6]].forEach(([x, y, w, h]) => { const m = new T.Mesh(new T.BoxGeometry(w, h, 0.8), wood); m.position.set(x, y, 0.1); m.castShadow = true; scene.add(m); });
    const glass = new T.Mesh(new T.PlaneGeometry(FW, FH), new T.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, transparent: true, opacity: 0.12, clearcoat: 1, depthWrite: false })); glass.position.set(0, FH / 2, 0.45); scene.add(glass);
    const base = new T.Mesh(new T.BoxGeometry(14, 0.4, 3), new T.MeshStandardMaterial({ color: '#7a5a3a', roughness: 0.6 })); base.position.set(0, -0.5, 0.4); base.receiveShadow = true; scene.add(base);
    // chambers and the tunnels between them (in sand coordinates)
    const R = [[-2.8, 5.0], [2.2, 3.9], [-1.9, 2.3], [2.8, 1.0]];
    const tunnelDark = new T.MeshStandardMaterial({ color: '#4a3220', roughness: 1 });
    const tunnels = [
      [[-3.6, 6.7], [-3.3, 6.0], [-2.8, 5.4]],
      [[-2.1, 5.0], [-0.6, 4.7], [0.8, 4.3], [1.6, 4.0]],
      [[1.7, 3.5], [0.9, 3.1], [-0.6, 2.7], [-1.3, 2.4]],
      [[-1.2, 2.1], [0.2, 1.6], [1.4, 1.3], [2.2, 1.1]],
      [[3.5, 1.2], [4.0, 2.4], [4.3, 4.5], [4.4, 6.7]],
    ].map(p => new T.CatmullRomCurve3(p.map(([x, y]) => new T.Vector3(x, y, 0.03))));
    const tunMeshes = tunnels.map(c => { const g = new T.TubeGeometry(c, 60, 0.17, 8); const m = new T.Mesh(g, tunnelDark); m.scale.z = 0.15; scene.add(m); return { g, m }; });
    const chamberGlow = this.rooms.map((name, i) => {
      const [x, y] = R[i], g = new T.Group(); g.position.set(x, y, 0.04); scene.add(g);
      const cav = new T.Mesh(new T.CircleGeometry(1, 40), new T.MeshStandardMaterial({ color: '#3a2616', roughness: 1 })); cav.scale.set(1.15, 0.62, 1); g.add(cav);
      const lamp = new T.PointLight('#ffc070', 0, 2.5, 1.5); lamp.position.set(0, 0.25, 0.5); g.add(lamp);
      const sign = K.label(name, { font: F, weight: 700, px: 64, color: '#3a2616', bg: '#fff4d6', radius: 8, pad: 0.3, height: 0.3, lit: true }); sign.position.set(0, 0.85, 0.08); g.add(sign);
      return { g, cav, lamp, sign };
    });
    // a small model in each chamber
    const mat = c => new T.MeshStandardMaterial({ color: c, roughness: 0.6 });
    const models = [
      () => { const g = new T.Group(); const desk = new T.Mesh(new T.BoxGeometry(0.7, 0.05, 0.3), mat('#8a5a34')); desk.position.y = -0.1; const ph = new T.Mesh(new T.BoxGeometry(0.2, 0.08, 0.14), mat('#d9534a')); ph.position.set(-0.15, -0.03, 0); const handshake = new T.Mesh(new T.TorusGeometry(0.1, 0.03, 8, 16), mat('#f2c14e')); handshake.position.set(0.18, 0.05, 0); g.add(desk, ph, handshake); return g; },
      () => { const g = new T.Group(); const board = new T.Mesh(new T.BoxGeometry(0.6, 0.4, 0.03), mat('#3d6fb5')); board.position.y = 0.05; const ln = new T.Mesh(new T.BoxGeometry(0.4, 0.02, 0.01), mat('#ffffff')); ln.position.set(0, 0.1, 0.02); const pen = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.4, 6), mat('#f2c14e')); pen.rotation.z = 0.8; pen.position.set(0.3, -0.05, 0.05); g.add(board, ln, pen); return g; },
      () => { const g = new T.Group(); const gear = new T.Mesh(new T.TorusGeometry(0.15, 0.06, 6, 12), mat('#9aa3b0')); gear.position.set(-0.15, 0.0, 0); const ham = new T.Mesh(new T.BoxGeometry(0.06, 0.35, 0.06), mat('#8a5a34')); ham.position.set(0.2, -0.02, 0); const head = new T.Mesh(new T.BoxGeometry(0.2, 0.08, 0.08), mat('#5a5f66')); head.position.set(0.2, 0.17, 0); g.add(gear, ham, head); g.userData.gear = gear; return g; },
      () => { const g = new T.Group(); [[-0.2, 0], [0.12, 0], [-0.05, 0.22]].forEach(([x, y]) => { const b = new T.Mesh(new T.BoxGeometry(0.26, 0.2, 0.2), mat('#c9a06a')); b.position.set(x, y - 0.05, 0); g.add(b); const tp = new T.Mesh(new T.BoxGeometry(0.27, 0.03, 0.05), mat('#8a5a34')); tp.position.set(x, y + 0.05, 0.1); g.add(tp); }); return g; },
    ].map((f, i) => { const m = f(); m.position.set(R[i][0], R[i][1] - 0.05, 0.2); m.traverse(o => { o.castShadow = true; }); scene.add(m); return m; });
    // ants: three small beads each
    const antMat = mat('#1a1210');
    const ant = () => { const g = new T.Group(); [[-0.07, 0.05], [0, 0.04], [0.07, 0.035]].forEach(([x, r]) => { const s = new T.Mesh(new T.SphereGeometry(r, 10, 8), antMat); s.position.x = x; g.add(s); }); for (let k = 0; k < 3; k++) [-1, 1].forEach(s => { const l = new T.Mesh(new T.CylinderGeometry(0.006, 0.006, 0.09, 4), antMat); l.position.set(-0.02 + k * 0.03, -0.03 * s, 0); l.rotation.z = s * 0.8; g.add(l); }); const card = new T.Mesh(new T.BoxGeometry(0.1, 0.07, 0.01), mat('#ffffff')); card.position.set(0.08, 0.07, 0.01); card.visible = false; g.add(card); g.userData.card = card; scene.add(g); return g; };
    const ants = Array.from({ length: 14 }, ant);
    const workCard = new T.Mesh(new T.BoxGeometry(0.14, 0.1, 0.02), mat('#ffffff')); scene.add(workCard);
    const parcel = new T.Mesh(new T.BoxGeometry(0.24, 0.18, 0.18), mat('#c9a06a')); parcel.castShadow = true; scene.add(parcel);
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 96, color: '#3a2616', height: 0.52 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.72, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [-2.2, 5.4, 9.6], look: [-2.2, 5.1, 0] },
      { t: 2.7, pos: [0.0, 4.6, 10.2], look: [0.0, 4.4, 0] },
      { t: 5.4, pos: [-0.2, 3.1, 10.2], look: [-0.2, 3.0, 0] },
      { t: 8.1, pos: [1.6, 2.4, 10.2], look: [1.6, 2.3, 0] },
      { t: 11, pos: [0.2, 3.0, 12.8], look: [0.2, 2.9, 0] },
    ], S.camera);
    const digT = [[-1, 0.4], [B[1] - 0.4, B[1] + 0.6], [B[2] - 0.4, B[2] + 0.6], [B[3] - 0.4, B[3] + 0.5], [B[3] + 0.9, B[3] + 1.9]];
    const V = new T.Vector3(), V2 = new T.Vector3();
    return (t, realT) => {
      cam(t);
      tunMeshes.forEach(({ g }, i) => { const p = K.prog(t, digT[i][0], digT[i][1], 'inOut'); g.setDrawRange(0, Math.floor(p * g.index.count / 48) * 48); });
      chamberGlow.forEach((c, i) => { const open = i === 0 ? 1 : K.prog(t, digT[i][1] - 0.1, digT[i][1] + 0.4, 'out'); c.cav.scale.set(1.15 * Math.max(0.001, open), 0.62 * Math.max(0.001, open), 1); c.lamp.intensity = 4 * open; c.sign.visible = open > 0.6; c.sign.scale.setScalar(Math.max(0.001, K.prog(open, 0.6, 1))); });
      models.forEach((m, i) => { const open = i === 0 ? 1 : K.prog(t, digT[i][1] + 0.2, digT[i][1] + 0.6, 'back'); m.scale.setScalar(Math.max(0.001, open)); m.visible = open > 0; if (m.userData.gear) m.userData.gear.rotation.z = realT * 2; });
      // the job travels: a white card from sales to design to workshop, then a parcel out through the last tunnel
      const leg = t < B[1] ? -1 : t < B[2] ? 1 : t < B[3] ? 2 : 3;
      ants.forEach((a, i) => {
        const tun = i % 5, cur = tunnels[tun], speed = 0.18 + (i % 3) * 0.05, open = K.prog(t, digT[tun][0], digT[tun][1]);
        const u = ((realT * speed + i * 0.37) % 1) * open; cur.getPointAt(u, V); cur.getPointAt(Math.min(1, u + 0.01), V2);
        a.position.set(V.x, V.y, 0.12); a.rotation.z = Math.atan2(V2.y - V.y, V2.x - V.x); a.visible = open > 0.1; a.userData.card.visible = false;
      });
      const carrier = ants[0];
      if (leg >= 1 && leg <= 3) { const tun = leg, cur = tunnels[tun], p = K.prog(t, digT[tun][1] - 0.2, digT[tun][1] + 1.6, 'inOut'); cur.getPointAt(p, V); cur.getPointAt(Math.min(1, p + 0.01), V2); carrier.position.set(V.x, V.y, 0.14); carrier.rotation.z = Math.atan2(V2.y - V.y, V2.x - V.x); carrier.visible = true; workCard.visible = leg < 3; workCard.position.set(V.x + 0.05, V.y + 0.1, 0.16); }
      else { workCard.visible = t < B[1]; workCard.position.set(R[0][0] + 0.3, R[0][1] + 0.05, 0.25); }
      const out = K.prog(t, B[3] + 1.0, B[3] + 2.4, 'inOut'); tunnels[4].getPointAt(out, V); parcel.visible = t > B[3]; parcel.position.set(V.x, V.y + 0.12, 0.2); if (out <= 0) parcel.position.set(R[3][0] + 0.4, R[3][1] - 0.05, 0.2);
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.05 });
    for (let i = 0; i < 40; i++) k.play('tick', { t: 0.1 + i * 0.27, gain: 0.06, pitch: 2.0 + (i % 4) * 0.2, pan: ((i * 7) % 9 - 4) * 0.1 });
    [B[1], B[2], B[3]].forEach((b, i) => { k.play('swish', { t: b - 0.4, gain: 0.2, pitch: 0.6, dur: 1.0 }); k.play('paper', { t: b - 0.3, gain: 0.15, pitch: 0.5 }); k.play('pop', { t: b + 0.6, gain: 0.3, pitch: 1 + i * 0.15 }); });
    k.play('bell', { t: 0.4, gain: 0.15, pitch: 1.4, music: true });
    k.play('chime', { t: B[3] + 2.4, gain: 0.22, pitch: 1.0, music: true });
  },
  post: null,
};
