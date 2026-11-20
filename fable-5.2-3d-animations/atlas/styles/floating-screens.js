window.STYLES = window.STYLES || {};
STYLES['floating-screens'] = {
  id: 'floating-screens', name: 'Floating Screens',
  family: 'Products and screens',
  use: 'Explainer',
  look: 'White app screens drawn as clean interface cards, each standing in a block of clear glass, in a line along an oak table in a bright, warm room. Soft window light, gentle reflections, a plant and a pastry for scale.',
  motion: 'The camera glides from card to card. The active card slides forward and turns to the camera, a tap ripple marks the action, and the next card takes over.',
  shownHere: 'How to order from a bakery app: pick a shop, add a croissant and a sourdough, pay $8.70, and collect the order at 8:15.',
  goodFor: 'App flows, onboarding, checkout steps and any user journey through screens. One screen for each step, in order.',
  fonts: ['DM Sans:wght@500;700'],
  duration: 10,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Pick a bakery' },
    { t: 2.5, label: 'Add what you want' },
    { t: 5.0, label: 'Pay in one tap' },
    { t: 7.5, label: 'Collect it warm' },
  ],
  shop: 'Rise & Crumb',
  items: [['Croissant', '$3.20'], ['Sourdough', '$5.50'], ['Cinnamon bun', '$3.80'], ['Baguette', '$2.90']],
  total: '$8.70', pickup: '8:15 am', ticket: 'A23',

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'DM Sans', ACC = '#e8743b';
    scene.background = new T.Color('#f4e9dc'); scene.fog = new T.Fog('#f4e9dc', 16, 34); scene.add(S.camera);
    const L = K.lights(S, 'sun', { size: 10, target: [4, 1, 0] }); L.key.position.set(-6, 10, 8); L.key.intensity = 2.2; L.amb.intensity = 1.2; S.scene.environmentIntensity = 0.9;
    const std = (c, r = 0.6, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    // room: oak table, cream wall with a window glow
    const oak = K.canvasTex(1024, 256, (g, r, w, h) => { g.fillStyle = '#d9b58a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 140; i++) { g.strokeStyle = `rgba(140,95,50,${r.range(0.04, 0.14)})`; g.lineWidth = r.range(1, 3); const y = r() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + r.range(-10, 10), w * 0.7, y + r.range(-10, 10), w, y); g.stroke(); } }, 3);
    oak.wrapS = T.RepeatWrapping; oak.repeat.set(2, 1);
    const table = new T.Mesh(new T.BoxGeometry(30, 0.3, 5), std('#ffffff', 0.45, { map: oak })); table.position.set(6, -0.15, 0); table.receiveShadow = true; scene.add(table);
    const wall = new T.Mesh(new T.PlaneGeometry(80, 30), std('#efe2d0', 0.95)); wall.position.set(6, 6, -4); wall.receiveShadow = true; scene.add(wall);
    const windowGlow = new T.Mesh(new T.PlaneGeometry(6, 5), new T.MeshBasicMaterial({ color: '#fff6e6', toneMapped: false, map: K.canvasTex(256, 220, (g, r, w, h) => { g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h); g.fillStyle = '#e6d6c0'; g.fillRect(w / 2 - 4, 0, 8, h); g.fillRect(0, h / 2 - 4, w, 8); g.strokeStyle = '#d8c6ae'; g.lineWidth = 14; g.strokeRect(0, 0, w, h); }) }));
    windowGlow.position.set(-2.5, 4.4, -3.95); scene.add(windowGlow);
    const sun = new T.SpotLight('#fff0d6', 60, 40, 0.6, 0.8, 1.2); sun.position.set(-4, 9, 6); sun.target.position.set(4, 0, 0); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); scene.add(sun, sun.target);

    // the app screens
    const W = 600, H = 1120, pill = (g, x, y, w, h, c) => { g.fillStyle = c; g.beginPath(); g.roundRect(x, y, w, h, h / 2); g.fill(); };
    const txt = (g, s, x, y, px, c = '#1e1b18', wgt = 700, al = 'left') => { g.fillStyle = c; g.font = `${wgt} ${px}px "${F}"`; g.textAlign = al; g.textBaseline = 'middle'; g.fillText(s, x, y); };
    const food = (g, kind, x, y, s) => {
      g.save(); g.translate(x, y);
      if (kind === 0) { g.fillStyle = '#e0a458'; for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(i * s * 0.17, -Math.abs(i) * s * 0.04, s * 0.12, s * 0.2 - Math.abs(i) * s * 0.03, i * 0.4, 0, 7); g.fill(); } }
      if (kind === 1) { g.fillStyle = '#c98a4b'; g.beginPath(); g.ellipse(0, 0, s * 0.42, s * 0.3, 0, 0, 7); g.fill(); g.strokeStyle = '#f2d8b0'; g.lineWidth = 5; [-1, 0, 1].forEach(k => { g.beginPath(); g.moveTo(k * s * 0.15 - s * 0.08, -s * 0.2); g.lineTo(k * s * 0.15 + s * 0.08, s * 0.2); g.stroke(); }); }
      if (kind === 2) { g.strokeStyle = '#b8743a'; g.lineWidth = s * 0.12; g.beginPath(); for (let a = 0; a < 14; a += 0.2) { const rr = a * s * 0.025; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.stroke(); }
      if (kind === 3) { g.rotate(-0.5); g.fillStyle = '#d9a05a'; g.beginPath(); g.roundRect(-s * 0.45, -s * 0.1, s * 0.9, s * 0.2, s * 0.1); g.fill(); g.strokeStyle = '#f2d8b0'; g.lineWidth = 4; [-0.25, 0, 0.25].forEach(k => { g.beginPath(); g.moveTo(k * s - 8, -s * 0.06); g.lineTo(k * s + 8, s * 0.06); g.stroke(); }); }
      g.restore();
    };
    const head = (g, title) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); txt(g, '9:41', 40, 40, 26, '#1e1b18', 700); g.fillStyle = '#1e1b18'; g.fillRect(W - 90, 30, 50, 20); txt(g, title, 40, 130, 46); };
    const screens = [
      g => { head(g, 'Bakeries near you');
        g.fillStyle = '#eaf1e6'; g.beginPath(); g.roundRect(40, 190, W - 80, 320, 30); g.fill(); g.strokeStyle = '#ffffff'; g.lineWidth = 16; g.beginPath(); g.moveTo(40, 380); g.bezierCurveTo(200, 300, 360, 470, W - 40, 330); g.stroke(); g.beginPath(); g.moveTo(260, 190); g.lineTo(330, 510); g.stroke();
        [[180, 290, ACC], [420, 400, '#9a8c7d'], [470, 250, '#9a8c7d']].forEach(([x, y, c]) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, 22, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 8, 0, 7); g.fill(); });
        [[this.shop, '0.4 km  ·  ★ 4.8', true], ['Golden Loaf', '0.9 km  ·  ★ 4.6'], ['The Flour Room', '1.2 km  ·  ★ 4.5']].forEach(([n, d, on], i) => { const y = 560 + i * 170;
          g.fillStyle = on ? '#fff3ea' : '#f6f4f1'; g.beginPath(); g.roundRect(40, y, W - 80, 140, 26); g.fill(); if (on) { g.strokeStyle = ACC; g.lineWidth = 5; g.stroke(); }
          g.fillStyle = on ? ACC : '#d8d2cb'; g.beginPath(); g.roundRect(64, y + 24, 92, 92, 20); g.fill(); txt(g, n, 180, y + 50, 34); txt(g, d, 180, y + 95, 26, '#8a8178', 500); }); },
      g => { head(g, this.shop); txt(g, 'Fresh this morning', 40, 190, 28, '#8a8178', 500);
        this.items.forEach(([n, p], i) => { const x = 40 + (i % 2) * 270, y = 240 + Math.floor(i / 2) * 400, on = i < 2;
          g.fillStyle = '#f7f2ec'; g.beginPath(); g.roundRect(x, y, 250, 370, 28); g.fill(); food(g, i, x + 125, y + 120, 170);
          txt(g, n, x + 22, y + 250, 30); txt(g, p, x + 22, y + 300, 28, '#8a8178', 500);
          pill(g, x + 150, y + 280, 80, 50, on ? ACC : '#1e1b18'); txt(g, on ? '✓' : '+', x + 190, y + 306, 32, '#fff', 700, 'center'); });
        pill(g, 40, H - 150, W - 80, 96, '#1e1b18'); txt(g, 'View order  ·  2 items', W / 2, H - 102, 32, '#fff', 700, 'center'); },
      g => { head(g, 'Your order');
        this.items.slice(0, 2).forEach(([n, p], i) => { const y = 220 + i * 140; g.fillStyle = '#f7f2ec'; g.beginPath(); g.roundRect(40, y, 110, 110, 22); g.fill(); food(g, i, 95, y + 55, 90); txt(g, n, 180, y + 40, 34); txt(g, '1 ×', 180, y + 80, 26, '#8a8178', 500); txt(g, p, W - 40, y + 55, 34, '#1e1b18', 700, 'right'); });
        g.fillStyle = '#ece6df'; g.fillRect(40, 530, W - 80, 3); txt(g, 'Total', 40, 590, 38); txt(g, this.total, W - 40, 590, 38, '#1e1b18', 700, 'right');
        txt(g, 'Pick up at ' + this.pickup, 40, 670, 30, '#8a8178', 500);
        g.fillStyle = '#f6f4f1'; g.beginPath(); g.roundRect(40, 730, W - 80, 120, 24); g.fill(); g.fillStyle = '#1e1b18'; g.beginPath(); g.roundRect(70, 760, 90, 60, 10); g.fill(); txt(g, '•••• 4242', 190, 790, 30, '#1e1b18', 500);
        pill(g, 40, H - 170, W - 80, 110, ACC); txt(g, 'Pay ' + this.total, W / 2, H - 115, 40, '#fff', 700, 'center'); },
      g => { head(g, 'Order confirmed');
        g.fillStyle = '#e9f6ec'; g.beginPath(); g.arc(W / 2, 360, 140, 0, 7); g.fill(); g.strokeStyle = '#2f9e5b'; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(W / 2 - 60, 365); g.lineTo(W / 2 - 15, 410); g.lineTo(W / 2 + 70, 310); g.stroke();
        txt(g, 'Ready at ' + this.pickup, W / 2, 590, 50, '#1e1b18', 700, 'center'); txt(g, this.shop + '  ·  0.4 km', W / 2, 650, 30, '#8a8178', 500, 'center');
        g.fillStyle = '#f7f2ec'; g.beginPath(); g.roundRect(90, 720, W - 180, 300, 30); g.fill(); txt(g, 'Ticket ' + this.ticket, W / 2, 780, 36, '#1e1b18', 700, 'center');
        const qr = K.rng(9); for (let i = 0; i < 12; i++) for (let j = 0; j < 8; j++) if (qr() < 0.5 || (i < 2 && j < 2)) { g.fillStyle = '#1e1b18'; g.fillRect(W / 2 - 96 + i * 16, 830 + j * 18, 15, 17); } },
    ];
    const glass = new T.MeshPhysicalMaterial({ color: '#eaf6f6', roughness: 0.05, transparent: true, opacity: 0.32, clearcoat: 1, clearcoatRoughness: 0.03, depthWrite: false });
    const CW = 2.4, CH = CW * H / W, GAP = 3.6;
    const cards = screens.map((draw, i) => {
      const g = new T.Group(); g.position.set(i * GAP, 0, 0); scene.add(g);
      const block = new T.Mesh(new T.BoxGeometry(CW * 0.9, 0.7, 1.0), glass); block.position.y = 0.35; g.add(block);
      const edge = new T.LineSegments(new T.EdgesGeometry(block.geometry), new T.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6 })); edge.position.y = 0.35; g.add(edge);
      const pivot = new T.Group(); pivot.position.y = 0.55; g.add(pivot);
      const tex = K.canvasTex(W, H, (c) => draw(c), 70 + i);
      const shape = new T.Shape(); const r = 0.22, w = CW, h = CH; shape.moveTo(-w / 2 + r, 0); shape.lineTo(w / 2 - r, 0); shape.quadraticCurveTo(w / 2, 0, w / 2, r); shape.lineTo(w / 2, h - r); shape.quadraticCurveTo(w / 2, h, w / 2 - r, h); shape.lineTo(-w / 2 + r, h); shape.quadraticCurveTo(-w / 2, h, -w / 2, h - r); shape.lineTo(-w / 2, r); shape.quadraticCurveTo(-w / 2, 0, -w / 2 + r, 0);
      const sg = new T.ShapeGeometry(shape, 8), uv = sg.attributes.uv, ps = sg.attributes.position; for (let k = 0; k < uv.count; k++) uv.setXY(k, ps.getX(k) / w + 0.5, ps.getY(k) / h);
      const screen = new T.Mesh(sg, new T.MeshStandardMaterial({ map: tex, roughness: 0.35, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.35 })); screen.castShadow = true; pivot.add(screen);
      const backing = new T.Mesh(new T.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 }), std('#f2f2f2', 0.3)); backing.position.z = -0.085; backing.castShadow = true; pivot.add(backing);
      const ring = new T.Mesh(new T.RingGeometry(0.12, 0.17, 40), new T.MeshBasicMaterial({ color: ACC, transparent: true, opacity: 0, toneMapped: false })); ring.position.z = 0.02; pivot.add(ring);
      const step = K.label(String(i + 1), { font: F, weight: 700, px: 64, color: '#ffffff', bg: ACC, radius: 'pill', pad: 0.35, height: 0.3 }); step.position.set(-CW / 2 + 0.1, CH + 0.3, 0.05); pivot.add(step);
      return { g, pivot, ring, screen };
    });
    // where each tap lands (card-local, in metres from the bottom-left of the card)
    const TAPS = [[0.5, 0.48], [0.82, 0.62], [0.5, 0.1], null].map(p => p && [(p[0] - 0.5) * CW, p[1] * CH]);
    // props: a croissant on a plate, a coffee cup, a plant
    const plate = new T.Mesh(new T.CylinderGeometry(0.75, 0.6, 0.06, 40), std('#fbfbf8', 0.3)); plate.position.set(GAP * 3 + 2.4, 0.03, 1.3); plate.receiveShadow = true; scene.add(plate);
    const crois = new T.Group(); crois.position.set(GAP * 3 + 2.4, 0.2, 1.3); scene.add(crois);
    for (let i = -2; i <= 2; i++) { const s = new T.Mesh(new T.SphereGeometry(0.2 - Math.abs(i) * 0.03, 20, 14), std('#d08f45', 0.5)); s.scale.set(0.8, 0.75, 1.1); s.position.set(i * 0.2, -Math.abs(i) * 0.03, -Math.abs(i) * i * 0.02); s.rotation.y = i * 0.35; s.castShadow = true; crois.add(s); }
    crois.rotation.y = 0.4;
    const cup = new T.Group(); cup.position.set(-2.0, 0, 1.6); scene.add(cup);
    const cb = new T.Mesh(new T.CylinderGeometry(0.42, 0.34, 0.75, 32, 1, true), std('#2f4f5f', 0.4, { side: T.DoubleSide })); cb.position.y = 0.38; cup.add(cb);
    const cf = new T.Mesh(new T.CircleGeometry(0.4, 32), std('#5b3a22', 0.2)); cf.rotation.x = -Math.PI / 2; cf.position.y = 0.66; cup.add(cf);
    const hd = new T.Mesh(new T.TorusGeometry(0.18, 0.05, 10, 24, Math.PI), std('#2f4f5f', 0.4)); hd.rotation.z = -Math.PI / 2; hd.position.set(0.42, 0.4, 0); cup.add(hd); cup.traverse(o => { o.castShadow = true; });
    const pot = new T.Mesh(new T.CylinderGeometry(0.55, 0.42, 0.9, 28), std('#c8664a', 0.7)); pot.position.set(GAP * 3 + 4.2, 0.45, -1.4); pot.castShadow = true; scene.add(pot);
    const lr = K.rng(4); const leaves = [];
    for (let i = 0; i < 9; i++) { const l = new T.Mesh(new T.SphereGeometry(0.45, 16, 10), std(lr() < 0.5 ? '#4f8a4b' : '#6aa35f', 0.6)); l.scale.set(0.35, 1.2, 0.12); const a = i / 9 * 6.28; l.position.set(GAP * 3 + 4.2 + 0.35 * Math.cos(a), 1.6 + lr.range(-0.2, 0.4), -1.4 + 0.35 * Math.sin(a)); l.rotation.set(0.5 * Math.sin(a), a, 0.5 * Math.cos(a)); l.castShadow = true; scene.add(l); leaves.push(l); }
    // steam from the cup and dust in the light
    const steam = Array.from({ length: 3 }, (_, i) => { const m = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(Array.from({ length: 8 }, (_, k) => new T.Vector3(0.08 * Math.sin(k + i * 2), k * 0.12, 0))), 30, 0.025, 6), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35 })); m.position.set(-2.0 - 0.12 + i * 0.12, 0.75, 1.6); scene.add(m); return m; });

    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 84, color: '#2a2420', height: 0.5 });
      l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.72, -8); S.camera.add(l); return l; });
    const active = t => { let a = 0; B.forEach((b, i) => { if (t >= b) a = i; }); return a; };
    const look = new T.Vector3();
    return (t, realT) => {
      // the camera glides along the line and rests on the active card
      let cx = 0; for (let i = 1; i < B.length; i++) cx = K.lerp(cx, i * GAP, K.prog(t, B[i] - 0.1, B[i] + 0.8, 'inOut'));
      const end = K.prog(t, B[3] + 1.2, 10, 'inOut');
      S.camera.position.set(cx + 1.8 + end * 0.3, 3.9 + end * 0.4, 12.2 + end * 1.4);
      look.set(cx - 0.1, 3.3, 0.6); S.camera.lookAt(look); S.camera.userData.look = look;
      cards.forEach((c, i) => {
        const on = K.prog(t, B[i] - 0.1, B[i] + 0.6, 'out') * (i < B.length - 1 ? 1 - K.prog(t, B[i + 1] - 0.1, B[i + 1] + 0.5, 'inOut') : 1);
        const f = i === 0 ? (t < B[1] ? 1 : on) : on;
        c.pivot.position.z = 0.9 * f; c.pivot.position.y = 0.55 + 0.25 * f + 0.02 * Math.sin(realT * 1.4 + i);
        c.pivot.rotation.y = -0.35 * (1 - f) + 0.05 * f; c.pivot.rotation.x = -0.04 * f;
        c.screen.material.emissiveIntensity = 0.12 + 0.18 * f;
        const tap = TAPS[i], tt = (t - (B[i] + 1.3));
        if (tap) { c.ring.position.set(tap[0], tap[1], 0.02); c.ring.scale.setScalar(1 + 3 * Math.max(0, tt)); c.ring.material.opacity = tt > 0 && tt < 0.5 ? 1 - tt * 2 : 0; }
      });
      steam.forEach((m, i) => { m.position.y = 0.75 + ((realT * 0.25 + i * 0.3) % 0.5); m.material.opacity = 0.3 * (1 - ((realT * 0.25 + i * 0.3) % 0.5) * 2); });
      leaves.forEach((l, i) => { l.rotation.z = 0.5 * Math.cos(i / 9 * 6.28) + 0.04 * Math.sin(realT + i); });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.08 });
    k.play('glass', { t: 0.3, gain: 0.2, pitch: 1.4 });
    B.forEach((b, i) => { if (i) k.play('swish', { t: b - 0.05, gain: 0.25, pitch: 1.3, dur: 0.8 }); if (i < 3) k.play('click', { t: b + 1.3, gain: 0.35, pitch: 1.4 }); k.play('blip', { t: b + 1.32, gain: 0.15, pitch: 1.6 + i * 0.1 }); });
    k.play('pop', { t: B[1] + 1.35, gain: 0.25, pitch: 1.3 });
    k.play('chime', { t: B[3] + 0.6, gain: 0.25, pitch: 1.2, music: true });
    k.play('sparkle', { t: B[3] + 0.65, gain: 0.2 });
  },
  post: null,
};
