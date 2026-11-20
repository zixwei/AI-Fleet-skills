window.STYLES = window.STYLES || {};
STYLES['split-flap'] = {
  id: 'split-flap', name: 'Split-Flap Board',
  family: 'Flat content made physical',
  use: 'Title',
  look: 'A mechanical departure board in a dark steel frame in a dim station hall. Rows of black flaps with white letters; one row in amber. Warm hall lights glow out of focus behind it.',
  motion: 'The flaps clatter through the alphabet and settle row by row, each letter at its own moment. The settled row holds while the next one starts.',
  shownHere: 'A product launch date: the product name, then the words LAUNCH DATE, then the date in amber, then the time pre-orders open.',
  goodFor: 'Headlines, dates, schedules, scores and countdowns: short words that arrive one row at a time.',
  fonts: ['Roboto Mono:wght@700', 'Oswald:wght@600'],
  duration: 10,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'ARC ONE' },
    { t: 2.4, label: 'LAUNCH DATE' },
    { t: 4.8, label: '14 MAR 2027' },
    { t: 7.2, label: 'PRE-ORDERS 9:00' },
  ],
  amberRow: 2,
  header: 'NEXT LAUNCH',

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), FM = 'Roboto Mono', FO = 'Oswald';
    scene.background = new T.Color('#0b0a0a'); scene.fog = new T.Fog('#0b0a0a', 16, 40); scene.add(S.camera);
    const L = K.lights(S, 'lamp', { size: 8, target: [0, 2, 0] }); L.key.position.set(-3, 9, 8); L.key.intensity = 2.2; L.amb.intensity = 0.4; S.scene.environmentIntensity = 0.4;
    const ORDER = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-:.', NO = ORDER.length, PER = 21, CW = 64, CH = 96;
    const atlas = color => K.canvasTex(PER * CW, Math.ceil(NO / PER) * CH, (g, r, w, h) => {
      g.fillStyle = '#141414'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < NO; i++) { const x = (i % PER) * CW, y = Math.floor(i / PER) * CH; const gr = g.createLinearGradient(0, y, 0, y + CH); gr.addColorStop(0, '#1d1d1f'); gr.addColorStop(0.5, '#141416'); gr.addColorStop(0.5, '#0e0e10'); gr.addColorStop(1, '#19191b'); g.fillStyle = gr; g.fillRect(x + 1, y + 1, CW - 2, CH - 2);
        g.fillStyle = color; g.font = `700 72px "${FM}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ORDER[i], x + CW / 2, y + CH / 2 + 3); }
    });
    const rows = Math.ceil(NO / PER);
    const atlases = [atlas('#f3f1ea'), atlas('#ffb02e')];
    const mats = atlases.map(tx => new T.MeshStandardMaterial({ map: tx, emissive: '#ffffff', emissiveMap: tx, emissiveIntensity: 0.45, roughness: 0.45, side: T.DoubleSide }));
    const setUV = (geo, i, half) => {
      const col = i % PER, row = Math.floor(i / PER), u0 = col / PER + 0.002, u1 = (col + 1) / PER - 0.002;
      const top = 1 - row / rows, mid = 1 - (row + 0.5) / rows, bot = 1 - (row + 1) / rows;
      const [v1, v0] = half === 0 ? [top, mid] : [mid, bot];
      const uv = geo.attributes.uv; uv.setXY(0, u0, v1); uv.setXY(1, u1, v1); uv.setXY(2, u0, v0); uv.setXY(3, u1, v0); uv.needsUpdate = true;
    };
    const COLS = 16, NR = this.beats.length, W = 0.5, H = 0.74, GX = 0.06, GY = 0.16;
    const X0 = -(COLS - 1) * (W + GX) / 2, Y0 = 3.2;
    // steel frame with screws
    const steel = new T.MeshStandardMaterial({ color: '#2a2c30', metalness: 0.85, roughness: 0.4 });
    const fw = COLS * (W + GX) + 0.8, fh = NR * (H + GY) + 1.6;
    const frame = new T.Mesh(new T.BoxGeometry(fw, fh, 0.4), steel); frame.position.set(0, Y0 - (NR - 1) * (H + GY) / 2 + 0.35, -0.25); frame.castShadow = true; scene.add(frame);
    const inner = new T.Mesh(new T.BoxGeometry(fw - 0.3, fh - 1.0, 0.05), new T.MeshStandardMaterial({ color: '#08080a', roughness: 0.8 })); inner.position.set(0, frame.position.y - 0.25, -0.07); scene.add(inner);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const s = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 0.05, 12).rotateX(Math.PI / 2), new T.MeshStandardMaterial({ color: '#8a8d92', metalness: 1, roughness: 0.3 })); s.position.set(sx * (fw / 2 - 0.2), frame.position.y + sy * (fh / 2 - 0.2), 0); scene.add(s); }
    const head = K.label(this.header, { font: FO, weight: 600, px: 64, color: '#ffb02e', height: 0.42 }); head.position.set(X0 + head.userData.w / 2 - 0.1, frame.position.y + fh / 2 - 0.42, 0.01); scene.add(head);
    const clockTex = K.canvasTex(256, 256, (g, r, w, h) => { g.fillStyle = '#f2efe6'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.fillStyle = '#111'; for (let i = 0; i < 12; i++) { g.save(); g.translate(128, 128); g.rotate(i / 12 * 6.283); g.fillRect(-4, -112, 8, 26); g.restore(); } });
    const clock = new T.Mesh(new T.CircleGeometry(0.5, 40), new T.MeshStandardMaterial({ map: clockTex, roughness: 0.6, emissive: '#ffffff', emissiveMap: clockTex, emissiveIntensity: 0.25 })); clock.position.set(fw / 2 - 0.85, frame.position.y + fh / 2 - 0.5, 0.01); scene.add(clock);
    const hands = [0.32, 0.42].map((l, i) => { const m = new T.Mesh(new T.BoxGeometry(0.035, l, 0.01).translate(0, l / 2, 0), new T.MeshBasicMaterial({ color: '#111' })); m.position.copy(clock.position).add(new T.Vector3(0, 0, 0.01 + i * 0.005)); scene.add(m); return m; });
    // cells: top half, bottom half, and a flap (front = current top, back = next bottom)
    const cr = K.rng(4);
    const cells = [];
    this.beats.forEach((b, r) => {
      const text = b.label.padEnd(COLS, ' ').slice(0, COLS), mat = mats[r === this.amberRow ? 1 : 0];
      for (let c = 0; c < COLS; c++) {
        const x = X0 + c * (W + GX), y = Y0 - r * (H + GY);
        const mk = () => new T.PlaneGeometry(W, H / 2);
        const topG = mk(), botG = mk(), fG = mk(), bG = mk();
        const top = new T.Mesh(topG, mat); top.position.set(x, y + H / 4, 0); scene.add(top);
        const bot = new T.Mesh(botG, mat); bot.position.set(x, y - H / 4, 0); scene.add(bot);
        const pivot = new T.Group(); pivot.position.set(x, y, 0.01); scene.add(pivot);
        const front = new T.Mesh(fG, mat); front.position.y = H / 4; pivot.add(front);
        const back = new T.Mesh(bG, mat); back.position.y = H / 4; back.rotation.x = Math.PI; pivot.add(back);
        const target = Math.max(0, ORDER.indexOf(text[c])), flips = cr.int(10, 30), start = ((target - flips) % NO + NO) % NO;
        const t0 = (r === 0 ? 0.35 : B[r] + 0.2) + c * 0.035 + cr.range(0, 0.15);
        cells.push({ topG, botG, fG, bG, pivot, start, flips, t0, last: -1 });
        [top, bot, front, back].forEach(m => { m.castShadow = true; });
      }
    });
    const DUR = 0.05;
    // a thin dark split line on each row
    this.beats.forEach((b, r) => { const m = new T.Mesh(new T.PlaneGeometry(COLS * (W + GX), 0.012), new T.MeshBasicMaterial({ color: '#000' })); m.position.set(0, Y0 - r * (H + GY), 0.02); scene.add(m); });
    // the hall: warm out-of-focus lights and a floor that reflects them
    const bok = K.canvasTex(64, 64, g => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.7, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
    const br = K.rng(9), boke = [];
    for (let i = 0; i < 40; i++) { const s = new T.Sprite(new T.SpriteMaterial({ map: bok, color: br.pick(['#ffb45a', '#ffd9a0', '#9fc7ff', '#ff8a4a']), transparent: true, opacity: br.range(0.15, 0.45), blending: T.AdditiveBlending, depthWrite: false, fog: false })); s.position.set(br.range(-16, 16), br.range(-1, 9), br.range(-18, -8)); s.scale.setScalar(br.range(0.6, 1.8)); s.userData.ph = br() * 6; scene.add(s); boke.push(s); }
    const floor = new T.Mesh(new T.PlaneGeometry(60, 40), new T.MeshStandardMaterial({ color: '#141210', roughness: 0.25, metalness: 0.5 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -1.6; scene.add(floor);
    const glowRow = new T.PointLight('#ffb02e', 0, 6); glowRow.position.set(0, Y0 - this.amberRow * (H + GY), 1.5); scene.add(glowRow);

    const cam = K.camPath([
      { t: 0, pos: [-2.0, 2.4, 11.6], look: [-0.8, 2.0, 0] },
      { t: 5, pos: [0.5, 2.0, 12.8], look: [0, 1.9, 0] },
      { t: 10, pos: [1.3, 1.8, 13.2], look: [0.2, 1.85, 0] },
    ], S.camera);
    return (t, realT) => {
      cam(t);
      cells.forEach(c => {
        const done = Math.floor(K.clamp((t - c.t0) / DUR, 0, c.flips)), frac = done >= c.flips ? 0 : K.clamp((t - c.t0) / DUR - done);
        const cur = (c.start + done) % NO, nxt = (cur + 1) % NO, key = done * 1000 + (frac > 0 ? 1 : 0);
        if (key !== c.last) { setUV(c.topG, frac > 0 ? nxt : cur, 0); setUV(c.botG, cur, 1); setUV(c.fG, cur, 0); setUV(c.bG, nxt, 1); c.last = key; }
        c.pivot.rotation.x = -Math.PI * K.ease.in(frac); c.pivot.visible = frac > 0;
      });
      glowRow.intensity = 5 * K.prog(t, B[this.amberRow] + 1.0, B[this.amberRow] + 1.6) * (0.9 + 0.1 * Math.sin(realT * 3));
      hands[0].rotation.z = -(9 / 12) * 6.283 - realT * 0.01; hands[1].rotation.z = -realT * 0.12;
      boke.forEach(s => { s.material.opacity = 0.25 + 0.15 * Math.sin(realT * 0.6 + s.userData.ph); });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('crowd', { gain: 0.06 });
    B.forEach((b, r) => { const s = r === 0 ? 0.35 : b + 0.2; for (let i = 0; i < 40; i++) k.play('tick', { t: s + i * 0.035 + (i % 3) * 0.008, gain: 0.22 * (1 - i / 50), pitch: 0.7 + ((i * 7) % 5) * 0.08, pan: -0.6 + (i / 40) * 1.2 }); k.play('click', { t: s + 1.6, gain: 0.25, pitch: 0.9 }); });
    k.play('chime', { t: B[2] + 1.6, gain: 0.25, pitch: 1.0, music: true });
    k.play('bell', { t: B[3] + 1.9, gain: 0.2, pitch: 0.8, music: true });
  },
  post: null,
};
