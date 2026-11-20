window.STYLES = window.STYLES || {};
STYLES['paper-popup'] = {
  id: 'paper-popup', name: 'Paper Pop-Up',
  family: 'Crafted materials',
  use: 'Story',
  look: 'A pop-up book open on a wooden table in lamp light. Each scene is flat die-cut card printed in a few flat colours, standing in layers on hinges, with a pale core on every cut edge.',
  motion: 'The pieces of a spread fold down flat, the page turns over the spine, and the pieces of the next spread fold up with a small overshoot. Small parts move on the card: a jug tilts, bubbles rise, a dial turns.',
  shownHere: 'How bread rises: mix flour, water and yeast; the yeast makes gas; the gas lifts the dough; the oven sets the loaf.',
  goodFor: 'A story or a process in 3 to 5 steps: one spread per step, one big subject in the middle, small parts at the sides, and one short line on a paper ribbon. A moving part on the card shows the change in each step.',
  fonts: ['Fraunces:wght@700'],
  duration: 11,
  samples: 8,
  // CONTENT: one spread per beat. The ribbon holds the words.
  beats: [
    { t: 0.0, label: 'Mix flour, water, yeast' },
    { t: 2.7, label: 'Yeast makes gas' },
    { t: 5.4, label: 'Gas lifts the dough' },
    { t: 8.1, label: 'Heat sets the loaf' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), PW = 4.2, PD = 3.2, PY = 0.36, CARD = 0.025;
    const INK = '#2b211c', CORE = '#f4ecdc';
    scene.background = new T.Color('#140d09');
    scene.fog = new T.Fog('#140d09', 14, 26);
    const L = K.lights(S, 'lamp', { size: 6, target: [0, 0.5, 0] });
    L.key.intensity = 0.7; L.amb.intensity = 0.25;
    const lamp = new T.SpotLight('#ffc480', 260, 30, 0.62, 0.75, 1.6); lamp.position.set(-3.5, 9, 4.5); lamp.target.position.set(0, 0, -0.2);
    lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); lamp.shadow.bias = -0.0005; lamp.shadow.normalBias = 0.02;
    scene.add(lamp, lamp.target);

    // --- table: walnut boards drawn in code
    const wood = K.canvasTex(1024, 1024, (g, r, w, h) => {
      g.fillStyle = '#4a2c1a'; g.fillRect(0, 0, w, h);
      for (let b = 0; b < 6; b++) {
        g.fillStyle = `hsl(24, 40%, ${15 + r() * 6}%)`; g.fillRect(0, b * h / 6, w, h / 6 - 3);
        for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(30,15,8,${0.08 + r() * 0.12})`; g.lineWidth = 1 + r() * 2; const y = b * h / 6 + r() * h / 6; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + r() * 14 - 7, w * 0.6, y + r() * 14 - 7, w, y + r() * 10 - 5); g.stroke(); }
      }
    }, 3);
    wood.wrapS = wood.wrapT = T.RepeatWrapping; wood.repeat.set(2, 2);
    const table = new T.Mesh(new T.PlaneGeometry(30, 30).rotateX(-Math.PI / 2), new T.MeshStandardMaterial({ map: wood, roughness: 0.6 }));
    table.receiveShadow = true; scene.add(table);

    // --- book: cloth covers, page blocks, two printed page planes
    const cloth = new T.MeshStandardMaterial({ color: '#7a2c26', roughness: 0.9 }), paperSide = new T.MeshStandardMaterial({ color: '#efe4cc', roughness: 1 });
    for (const s of [-1, 1]) {
      const cover = new T.Mesh(new T.BoxGeometry(PW + 0.15, 0.08, PD + 0.25), cloth); cover.position.set(s * (PW / 2 + 0.04), 0.04, 0);
      const block = new T.Mesh(new T.BoxGeometry(PW - 0.05, PY - 0.09, PD), paperSide); block.position.set(s * PW / 2, 0.08 + (PY - 0.09) / 2, 0);
      cover.receiveShadow = block.receiveShadow = cover.castShadow = block.castShadow = true; scene.add(cover, block);
    }
    const PAGES = [['#f6e7b8', '#e9c46a'], ['#dcebef', '#9cc5d3'], ['#f4dfc8', '#e2a272'], ['#f7d9b5', '#d9824a']];
    const pageTex = (k, side) => K.canvasTex(840, 640, (g, r, w, h) => {
      const [bg, acc] = PAGES[k];
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.fillStyle = acc;
      if (k === 0) for (let x = 0; x < w; x += 40) for (let y = h * 0.62; y < h; y += 40) if (((x + y) / 40) % 2 === 0) g.fillRect(x, y, 40, 40);
      if (k === 1) for (let i = 0; i < 26; i++) { g.globalAlpha = 0.5; g.lineWidth = 6; g.strokeStyle = acc; g.beginPath(); g.arc(r() * w, r() * h, 10 + r() * 40, 0, 7); g.stroke(); }
      if (k === 2) for (let x = 0; x < w; x += 60) { g.globalAlpha = 0.35; g.fillRect(x, 0, 24, h); }
      if (k === 3) for (let x = 0; x < w; x += 70) for (let y = 0; y < h * 0.55; y += 70) { g.globalAlpha = 0.3; g.fillRect(x + 4, y + 4, 62, 62); }
      g.globalAlpha = 1; g.fillStyle = 'rgba(40,25,10,0.06)';
      for (let i = 0; i < 2500; i++) g.fillRect(r() * w, r() * h, 2, 2);
      const grad = g.createLinearGradient(side < 0 ? w : 0, 0, side < 0 ? w - 120 : 120, 0); // gutter shade
      grad.addColorStop(0, 'rgba(60,35,15,0.35)'); grad.addColorStop(1, 'rgba(60,35,15,0)'); g.fillStyle = grad; g.fillRect(0, 0, w, h);
      g.fillStyle = INK; g.font = '700 26px Fraunces'; g.textAlign = 'center'; g.fillText(String(k * 2 + (side < 0 ? 1 : 2)), side < 0 ? 60 : w - 60, h - 30);
    }, 10 + k * 2 + side);
    const TEX = PAGES.map((_, k) => [pageTex(k, -1), pageTex(k, 1)]);
    const pageMat = side => new T.MeshStandardMaterial({ map: TEX[0][side < 0 ? 0 : 1], roughness: 0.95 });
    const leftPage = new T.Mesh(new T.PlaneGeometry(PW, PD).rotateX(-Math.PI / 2).translate(-PW / 2, PY + 0.001, 0), pageMat(-1));
    const rightPage = new T.Mesh(new T.PlaneGeometry(PW, PD).rotateX(-Math.PI / 2).translate(PW / 2, PY + 0.001, 0), pageMat(1));
    leftPage.receiveShadow = rightPage.receiveShadow = true; scene.add(leftPage, rightPage);
    // the turning leaf: front = this spread's right page, back = next spread's left page
    const leaf = new T.Group(); leaf.position.y = PY + 0.004;
    const leafFront = new T.Mesh(new T.PlaneGeometry(PW, PD).rotateX(-Math.PI / 2).translate(PW / 2, 0.002, 0), new T.MeshStandardMaterial({ roughness: 0.95 }));
    const leafBack = new T.Mesh(new T.PlaneGeometry(PW, PD).rotateX(Math.PI / 2).rotateY(Math.PI).translate(PW / 2, -0.002, 0), new T.MeshStandardMaterial({ roughness: 0.95 }));
    leafFront.castShadow = true; leaf.add(leafFront, leafBack); scene.add(leaf);

    // --- die-cut card: polygon in 0..1 units (y up) -> extruded card with a pale core, printed face from the same outline
    const ell = (cx, cy, rx, ry, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
    const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    const card = (pts, w, h, paint, seed = 1, plain = false) => {
      const shape = new T.Shape(pts.map(([x, y]) => new T.Vector2((x - 0.5) * w, y * h)));
      const geo = new T.ExtrudeGeometry(shape, { depth: CARD, bevelEnabled: false });
      const PX = 220, tex = K.canvasTex(Math.round(w * PX), Math.round(h * PX), (g, r, cw, ch) => {
        const path = () => { g.beginPath(); pts.forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x * cw, (1 - y) * ch)); g.closePath(); };
        const P = (x, y) => [x * cw, (1 - y) * ch];
        paint(g, cw, ch, path, P, r);
        if (!plain) { // printed texture: halftone shade toward the base, and an ink outline
          g.save(); path(); g.clip();
          const st = 10;
          for (let y = ch * 0.5; y < ch; y += st) for (let x = ((y / st) % 2) * st / 2; x < cw; x += st) { const a = (y - ch * 0.5) / (ch * 0.5); g.fillStyle = `rgba(70,35,15,${0.22 * a})`; g.beginPath(); g.arc(x, y, 1 + 2.4 * a, 0, 7); g.fill(); }
          g.lineWidth = Math.max(5, Math.min(cw, ch) * 0.025); g.strokeStyle = 'rgba(43,33,28,0.8)'; path(); g.stroke();
          g.restore();
        }
        g.fillStyle = 'rgba(255,250,240,0.05)'; for (let i = 0; i < 400; i++) g.fillRect(r() * cw, r() * ch, 2, 2);
      }, seed);
      tex.repeat.set(1 / w, 1 / h); tex.offset.set(0.5, 0);
      const m = new T.Mesh(geo, [new T.MeshStandardMaterial({ map: tex, roughness: 0.9 }), new T.MeshStandardMaterial({ color: CORE, roughness: 1 })]);
      m.position.z = -CARD / 2; m.castShadow = true; m.receiveShadow = true;
      return m;
    };
    const fill = (g, path, c) => { path(); g.fillStyle = c; g.fill(); };
    const text = (g, s, x, y, px, c = INK) => { g.font = `700 ${px}px Fraunces`; g.fillStyle = c; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, x, y); };
    // a hinged piece: base line at (x, z) on the page; fold 0 = flat on the page, 1 = upright
    const spreads = [[], [], [], []];
    const piece = (k, mesh, x, z, extra = {}) => {
      const hinge = new T.Group(), inner = new T.Group();
      hinge.position.set(x, PY, z); inner.add(mesh); hinge.add(inner); scene.add(hinge);
      if (!extra.ribbon) hinge.scale.setScalar(1.3);
      const p = Object.assign({ hinge, inner, mesh, x, z, delay: extra.ribbon ? 0.35 : spreads[k].length * 0.08 }, extra);
      spreads[k].push(p); return p;
    };
    const ribbon = (k, words) => {
      const pts = [[0, 0.05], [0.06, 0.5], [0, 0.95], [1, 0.95], [0.94, 0.5], [1, 0.05]];
      return piece(k, card(pts, 3.7, 0.62, (g, w, h, path) => { fill(g, path, '#fbf5e8'); g.strokeStyle = '#b5372f'; g.lineWidth = 8; g.strokeRect(w * 0.07, h * 0.13, w * 0.86, h * 0.74); g.font = `700 ${h * 0.5}px Fraunces`; text(g, words, w / 2, h * 0.52, h * 0.5 * Math.min(1, (w * 0.8) / g.measureText(words).width)); }, 99 + k), 0, 1.25, { ribbon: true });
    };

    // spread 0: mix
    const bowlPts = [[0.02, 0.5], [0.13, 0.5], ...ell(0.5, 0.5, 0.36, 0.34, Math.PI, 0), [0.87, 0.5], [0.98, 0.5], ...ell(0.5, 0.5, 0.48, 0.5, 0, -Math.PI).slice(1, -1)];
    const bowlPaint = flour => (g, w, h, path, P) => {
      fill(g, path, '#efe2c6');
      if (flour) { g.fillStyle = '#fffaf0'; g.beginPath(); g.ellipse(w / 2, h * 0.5, w * 0.36, h * 0.34, 0, Math.PI, 0); g.fill(); }
      g.fillStyle = '#3c6ea5'; g.fillRect(0, h * 0.62, w, h * 0.09); g.fillStyle = '#c94f3d'; g.fillRect(0, h * 0.74, w, h * 0.04);
    };
    piece(0, card(bowlPts, 1.9, 1.15, bowlPaint(true), 2), 0, -0.2);
    piece(0, card([[0.1, 0], [0.9, 0], [0.95, 0.75], [0.7, 0.85], [0.62, 1], [0.38, 1], [0.3, 0.85], [0.05, 0.75]], 1.0, 1.5, (g, w, h, path) => {
      fill(g, path, '#d9b98a'); g.fillStyle = '#b8935f'; g.fillRect(w * 0.3, h * 0.1, w * 0.4, h * 0.05); text(g, 'FLOUR', w / 2, h * 0.45, h * 0.13);
    }, 3), -2.0, -0.7);
    const jug = piece(0, card([[0.15, 0], [0.75, 0], [0.75, 0.3], [0.95, 0.4], [0.95, 0.7], [0.75, 0.8], [0.8, 1], [0.05, 1], [0.15, 0.85]], 0.9, 1.4, (g, w, h, path) => {
      fill(g, path, '#5a9fcb'); g.fillStyle = '#d7ecf5'; g.beginPath(); g.ellipse(w * 0.45, h * 0.45, w * 0.13, h * 0.12, 0, 0, 7); g.fill(); text(g, 'WATER', w * 0.45, h * 0.2, h * 0.09, '#fff');
    }, 4), 2.0, -0.6);
    piece(0, card(rect(0, 0, 1, 1), 0.7, 0.5, (g, w, h) => { g.fillStyle = '#f2c14e'; g.fillRect(0, 0, w, h); g.fillStyle = '#c0392b'; g.fillRect(0, h * 0.08, w, h * 0.18); text(g, 'YEAST', w / 2, h * 0.6, h * 0.28); }, 5), 1.05, 0.55);
    ribbon(0, this.beats[0].label);

    // spread 1: yeast eats sugar and makes gas
    const cellPaint = (g, w, h, path) => { fill(g, path, '#e8c98f'); g.fillStyle = '#c99a55'; g.beginPath(); g.ellipse(w * 0.45, h * 0.5, w * 0.16, h * 0.18, 0, 0, 7); g.fill(); g.strokeStyle = '#a0763a'; g.lineWidth = 10; path(); g.stroke(); };
    piece(1, card(ell(0.5, 0.5, 0.5, 0.5, 0, Math.PI * 2, 40), 1.3, 1.3, cellPaint, 6), -0.4, -0.6);
    piece(1, card(ell(0.5, 0.5, 0.5, 0.5, 0, Math.PI * 2, 40), 0.85, 0.85, cellPaint, 7), 0.6, -0.3);
    piece(1, card([...rect(0, 0, 0.48, 0.48), [0.48, 0.48]], 0.9, 0.9, () => {}, 1), 0, 0).hinge.visible = false; // spacer keeps the stagger even
    piece(1, card([[0, 0], [1, 0], [1, 0.48], [0.52, 0.48], [0.52, 1], [0, 1]], 0.9, 0.9, (g, w, h, path) => { fill(g, path, '#ffffff'); g.strokeStyle = '#cfc6b8'; g.lineWidth = 5; path(); g.stroke(); text(g, 'SUGAR', w * 0.5, h * 0.76, h * 0.17, '#9a8c7a'); }, 8), -2.0, -0.4);
    const bubbles = [0, 1, 2, 3, 4].map(i => piece(1, card(ell(0.5, 0.5, 0.5, 0.5, 0, Math.PI * 2, 32), 0.32 + (i % 3) * 0.1, 0.32 + (i % 3) * 0.1, (g, w, h, path) => {
      fill(g, path, 'rgba(220,240,250,1)'); g.strokeStyle = '#4f8fb0'; g.lineWidth = w * 0.08; path(); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(w * 0.35, h * 0.35, w * 0.1, 0, 7); g.fill(); text(g, 'CO₂', w / 2, h * 0.58, h * 0.22, '#3d7090');
    }, 20 + i), -0.6 + i * 0.45, 0.25, { bubble: i }));
    ribbon(1, this.beats[1].label);

    // spread 2: the gas lifts the dough
    const dough = piece(2, card([[0.08, 0], [0.92, 0], ...ell(0.5, 0.0, 0.42, 1.0, 0, Math.PI, 30).slice(1, -1)], 1.6, 1.4, (g, w, h, path, P, r) => {
      fill(g, path, '#f5e6c4'); g.fillStyle = '#e2c99a';
      for (let i = 0; i < 22; i++) { g.beginPath(); g.ellipse(w * (0.2 + r() * 0.6), h * (0.25 + r() * 0.6), 6 + r() * 14, 5 + r() * 10, 0, 0, 7); g.fill(); }
    }, 9), 0, -0.45);
    piece(2, card(bowlPts, 1.9, 1.15, bowlPaint(false), 10), 0, -0.2);
    const clock = piece(2, card(ell(0.5, 0.5, 0.5, 0.5, 0, Math.PI * 2, 40), 1.0, 1.0, (g, w, h, path) => {
      fill(g, path, '#fbf5e8'); g.strokeStyle = INK; g.lineWidth = 10; path(); g.stroke();
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.fillRect(w / 2 + Math.cos(a) * w * 0.38 - 4, h / 2 + Math.sin(a) * h * 0.38 - 4, 8, 8); }
      text(g, '1 hour', w / 2, h * 0.72, h * 0.12);
    }, 11), 2.0, -0.5);
    const hand = new T.Mesh(new T.BoxGeometry(0.04, 0.36, 0.02).translate(0, 0.16, 0), new T.MeshStandardMaterial({ color: '#b5372f' }));
    hand.position.set(0, 0.5, CARD + 0.012); clock.mesh.add(hand);
    ribbon(2, this.beats[2].label);

    // spread 3: the oven sets the loaf
    piece(3, card([[0, 0], [1, 0], [1, 0.88], [0.92, 1], [0.08, 1], [0, 0.88]], 2.2, 1.7, (g, w, h) => {
      g.fillStyle = '#c0533a'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a1d14'; g.fillRect(w * 0.12, h * 0.3, w * 0.76, h * 0.55);
      const gr = g.createRadialGradient(w / 2, h * 0.6, 10, w / 2, h * 0.6, w * 0.4); gr.addColorStop(0, '#ffb347'); gr.addColorStop(1, '#3a1d14');
      g.fillStyle = gr; g.fillRect(w * 0.14, h * 0.33, w * 0.72, h * 0.5);
      for (let i = 0; i < 3; i++) { g.fillStyle = '#2a1712'; g.beginPath(); g.arc(w * (0.3 + i * 0.2), h * 0.15, h * 0.05, 0, 7); g.fill(); }
      text(g, '230°C', w * 0.82, h * 0.15, h * 0.08, '#fbe9d0');
    }, 12), 0, -0.9);
    const loaf = piece(3, card([[0.04, 0], [0.96, 0], [0.98, 0.25], ...ell(0.5, 0.25, 0.48, 0.75, 0, Math.PI, 30).slice(1, -1), [0.02, 0.25]], 1.7, 0.9, (g, w, h, path) => {
      fill(g, path, '#f6e2bd'); g.strokeStyle = '#a8662e'; g.lineWidth = 9; g.lineCap = 'round';
      for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(w * (0.28 + i * 0.18), h * 0.3); g.lineTo(w * (0.36 + i * 0.18), h * 0.7); g.stroke(); }
    }, 13), 0, 0.15);
    const steam = [0, 1, 2].map(i => piece(3, card([...ell(0.5, 0.5, 0.5, 0.5, 0, Math.PI * 2, 24)], 0.35, 0.35, (g, w, h, path) => { fill(g, path, '#ffffff'); }, 30 + i, true), -0.5 + i * 0.5, 0.0, { steam: i }));
    steam.forEach(s => { s.mesh.material.forEach(m => { m.transparent = true; m.depthWrite = false; }); s.mesh.material[0].emissive.set('#fff3e0'); s.mesh.material[0].emissiveIntensity = 0.7; s.mesh.castShadow = false; });
    ribbon(3, this.beats[3].label);

    // ===== more layers: a back row of scenery and a front row of props on each spread =====
    const BACK = { delay: 0 }, FRONT = { delay: 0.3 };
    const windowPaint = withSun => (g, w, h) => {
      g.fillStyle = '#8a5a3c'; g.fillRect(0, 0, w, h);
      const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#7cc3e0'); sky.addColorStop(1, '#fbe9be');
      g.fillStyle = sky; g.fillRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);
      g.fillStyle = '#ffffff'; [[0.3, 0.3, 0.12], [0.62, 0.22, 0.09]].forEach(([x, y, r]) => { g.beginPath(); g.ellipse(w * x, h * y, w * r, h * r * 0.45, 0, 0, 7); g.fill(); });
      if (withSun) { g.fillStyle = '#ffd166'; g.beginPath(); g.arc(w * 0.72, h * 0.32, w * 0.08, 0, 7); g.fill(); }
      g.fillStyle = '#6fa35a'; g.beginPath(); g.ellipse(w * 0.3, h * 0.92, w * 0.35, h * 0.2, 0, 0, 7); g.ellipse(w * 0.78, h * 0.95, w * 0.3, h * 0.18, 0, 0, 7); g.fill();
      g.fillStyle = '#8a5a3c'; g.fillRect(w * 0.48, h * 0.1, w * 0.04, h * 0.8); g.fillRect(w * 0.1, h * 0.48, w * 0.8, h * 0.04);
      g.fillStyle = '#d1495b'; for (const x0 of [0, 0.82]) { g.fillRect(w * x0, 0, w * 0.18, h); g.fillStyle = 'rgba(255,255,255,0.18)'; for (let k = 0; k < 4; k++) g.fillRect(w * (x0 + 0.02 + k * 0.04), 0, w * 0.012, h); g.fillStyle = '#d1495b'; }
      g.fillStyle = '#6b4128'; g.fillRect(0, h * 0.9, w, h * 0.1);
    };
    // spread 0
    piece(0, card(rect(0, 0, 1, 1), 1.6, 1.45, windowPaint(true), 40), -2.0, -1.3, BACK);
    piece(0, card(rect(0, 0, 1, 1), 1.8, 1.3, (g, w, h) => {
      g.fillStyle = '#f3e3c3'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(160,110,60,0.18)';
      for (let x = 0; x < w; x += 44) for (let y = 0; y < h; y += 44) g.fillRect(x + 2, y + 2, 40, 40);
      g.fillStyle = '#8a5a3c'; g.fillRect(0, h * 0.62, w, h * 0.06);
      [['#e9c46a', 'SUGAR', 0.18], ['#ffffff', 'SALT', 0.45], ['#c9d98a', 'OIL', 0.72]].forEach(([c, s, x]) => {
        g.fillStyle = c; g.beginPath(); g.roundRect(w * (x - 0.1), h * 0.22, w * 0.2, h * 0.4, 18); g.fill();
        g.fillStyle = '#8a5a3c'; g.fillRect(w * (x - 0.11), h * 0.17, w * 0.22, h * 0.07);
        text(g, s, w * x, h * 0.45, h * 0.075);
      });
      g.fillStyle = '#5a9fcb'; g.beginPath(); g.arc(w * 0.9, h * 0.52, w * 0.06, 0, 7); g.fill();
    }, 41), 1.9, -1.3, BACK);
    piece(0, card([[0.4, 0], [0.6, 0], [0.62, 0.45], [0.92, 0.82], [0.8, 0.97], [0.6, 0.9], [0.5, 1], [0.4, 0.9], [0.2, 0.97], [0.08, 0.82], [0.38, 0.45]], 0.85, 1.25, (g, w, h, path, P, r) => {
      fill(g, path, '#e2b65a'); g.fillStyle = '#c4912f';
      for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse(w * (0.1 + r() * 0.8), h * (0.05 + r() * 0.4), 9, 16, r() * 2 - 1, 0, 7); g.fill(); }
      g.fillStyle = '#b5372f'; g.fillRect(w * 0.36, h * 0.5, w * 0.28, h * 0.06);
    }, 42), -2.75, 0.55, FRONT);
    piece(0, card([[0.15, 0], [0.85, 0], [0.85, 0.7], [0.7, 0.85], [0.7, 1], [0.3, 1], [0.3, 0.85], [0.15, 0.7]], 0.42, 0.66, (g, w, h, path) => {
      fill(g, path, '#ffffff'); g.fillStyle = '#9aa5ad'; g.fillRect(w * 0.3, 0, w * 0.4, h * 0.16);
      for (let i = 0; i < 3; i++) { g.fillStyle = '#2b211c'; g.beginPath(); g.arc(w * (0.4 + i * 0.1), h * 0.08, 4, 0, 7); g.fill(); }
      text(g, 'SALT', w / 2, h * 0.55, h * 0.13, '#3c6ea5');
    }, 43), -1.35, 0.8, FRONT);
    // spread 1: a lens behind the cells, sugar molecules in front
    const lens = piece(1, card(ell(0.5, 0.5, 0.5, 0.5, 0, Math.PI * 2, 56), 2.0, 2.0, (g, w, h, path) => {
      const gr = g.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.5); gr.addColorStop(0, '#e9f6f8'); gr.addColorStop(0.85, '#bfe0e8'); gr.addColorStop(1, '#3d6f80');
      fill(g, path, gr); g.strokeStyle = '#b08d57'; g.lineWidth = w * 0.06; path(); g.stroke();
      g.strokeStyle = 'rgba(61,111,128,0.25)'; g.lineWidth = 3; for (let x = 0; x < w; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(w, x); g.stroke(); }
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.ellipse(w * 0.32, h * 0.25, w * 0.12, h * 0.05, -0.6, 0, 7); g.fill();
      text(g, 'x 400', w * 0.5, h * 0.9, h * 0.05, '#3d6f80');
    }, 44), 0.1, -1.25, BACK);
    const hexPts = ell(0.5, 0.5, 0.5, 0.5, 0, Math.PI * 2, 6);
    const mols = [0, 1, 2].map(i => piece(1, card(hexPts, 0.42, 0.42, (g, w, h, path) => { fill(g, path, '#fdf3dc'); g.strokeStyle = '#c99a55'; g.lineWidth = 12; path(); g.stroke(); text(g, 'C₆', w / 2, h / 2, h * 0.3, '#a0763a'); }, 45 + i), -2.6 + i * 0.55, 0.65, { delay: 0.3 + i * 0.08, mol: i }));
    // spread 2: a window where the sun moves (time passes), a tea towel, a thermometer
    const win2 = piece(2, card(rect(0, 0, 1, 1), 1.6, 1.45, windowPaint(false), 50), -2.0, -1.3, BACK);
    const sun2 = new T.Mesh(new T.CircleGeometry(0.13, 24), new T.MeshBasicMaterial({ color: '#ffd166', toneMapped: false }));
    sun2.position.z = CARD + 0.004; win2.mesh.add(sun2);
    piece(2, card([[0, 0], [1, 0], [0.95, 0.7], [0.75, 1], [0.25, 1], [0.05, 0.7]], 1.0, 0.85, (g, w, h) => {
      g.fillStyle = '#fbf5e8'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(181,55,47,0.55)';
      for (let x = 0; x < w; x += 36) g.fillRect(x, 0, 18, h); for (let y = 0; y < h; y += 36) g.fillRect(0, y, w, 18);
    }, 52), -2.55, 0.5, FRONT);
    const thermo = piece(2, card([[0.3, 0.2], [0.3, 1], [0.7, 1], [0.7, 0.2], [0.82, 0.12], [0.5, 0], [0.18, 0.12]], 0.36, 1.2, (g, w, h, path) => {
      fill(g, path, '#fbf5e8'); g.fillStyle = '#b5372f'; g.beginPath(); g.arc(w * 0.5, h * 0.9, w * 0.2, 0, 7); g.fill();
      g.fillStyle = INK; for (let i = 0; i < 6; i++) g.fillRect(w * 0.62, h * (0.15 + i * 0.12), w * 0.12, 4);
      text(g, '°C', w * 0.5, h * 0.06, h * 0.05);
    }, 51), 1.3, 0.7, FRONT);
    const mercury = new T.Mesh(new T.BoxGeometry(0.05, 1, 0.01).translate(0, 0.5, 0), new T.MeshBasicMaterial({ color: '#c0392b' }));
    mercury.position.set(0, 0.12, CARD + 0.006); thermo.mesh.add(mercury);
    // spread 3: a brick wall behind the oven, a rack of rolls, bread slices, an oven glove
    piece(3, card(rect(0, 0, 1, 1), 4.6, 1.75, (g, w, h, path, P, r) => {
      g.fillStyle = '#e6d5bd'; g.fillRect(0, 0, w, h);
      const bh = h / 9, bw = bh * 2.2;
      for (let row = 0; row < 9; row++) for (let x = -(row % 2) * bw / 2; x < w; x += bw) { g.fillStyle = `hsl(${12 + r() * 10}, ${45 + r() * 15}%, ${42 + r() * 10}%)`; g.fillRect(x + 4, row * bh + 4, bw - 8, bh - 8); }
      const shade = g.createLinearGradient(0, 0, 0, h); shade.addColorStop(0, 'rgba(20,10,5,0.35)'); shade.addColorStop(1, 'rgba(20,10,5,0)'); g.fillStyle = shade; g.fillRect(0, 0, w, h);
    }, 60), 0, -1.45, BACK);
    piece(3, card([[0, 0], [1, 0], [1, 0.55], ...ell(0.82, 0.55, 0.18, 0.3, 0, Math.PI, 10).slice(1, -1), [0.64, 0.55], ...ell(0.5, 0.55, 0.15, 0.32, 0, Math.PI, 10).slice(1, -1), [0.35, 0.55], ...ell(0.18, 0.55, 0.18, 0.3, 0, Math.PI, 10).slice(1, -1), [0, 0.55]], 1.3, 0.85, (g, w, h) => {
      g.fillStyle = '#b8743c'; for (const [x, rx] of [[0.18, 0.18], [0.5, 0.15], [0.82, 0.18]]) { g.beginPath(); g.ellipse(w * x, h * 0.45, w * rx, h * 0.32, 0, 0, 7); g.fill(); }
      g.strokeStyle = '#6b6f73'; g.lineWidth = 8; for (let x = 0; x <= w; x += w / 8) { g.beginPath(); g.moveTo(x, h * 0.6); g.lineTo(x, h); g.stroke(); }
      g.fillStyle = '#6b6f73'; g.fillRect(0, h * 0.55, w, h * 0.08);
    }, 61), 2.35, 0.45, FRONT);
    piece(3, card([[0.05, 0], [0.95, 0], [0.95, 0.55], ...ell(0.5, 0.55, 0.45, 0.45, 0, Math.PI, 16).slice(1, -1), [0.05, 0.55]], 0.85, 0.85, (g, w, h, path) => {
      fill(g, path, '#a8662e'); g.fillStyle = '#f6e7c8'; g.beginPath(); g.moveTo(w * 0.12, h); g.lineTo(w * 0.12, h * 0.45); g.ellipse(w * 0.5, h * 0.45, w * 0.38, h * 0.37, 0, Math.PI, 0); g.lineTo(w * 0.88, h); g.fill();
      g.fillStyle = 'rgba(168,102,46,0.35)'; for (let i = 0; i < 18; i++) { g.beginPath(); g.arc(w * (0.2 + (i * 37 % 60) / 100), h * (0.3 + (i * 23 % 60) / 100), 6, 0, 7); g.fill(); }
    }, 62), -2.35, 0.5, FRONT);
    piece(3, card([[0.2, 0], [0.85, 0], [0.85, 0.75], ...ell(0.55, 0.75, 0.3, 0.25, 0, Math.PI, 12).slice(1, -1), [0.25, 0.72], [0.02, 0.55], [0.1, 0.45], [0.2, 0.5]], 0.6, 0.8, (g, w, h, path) => {
      fill(g, path, '#3d6fa6'); g.fillStyle = '#f2c14e'; g.fillRect(w * 0.15, h * 0.85, w * 0.75, h * 0.1);
      g.fillStyle = 'rgba(255,255,255,0.25)'; for (let y = 0; y < h; y += 30) g.fillRect(0, y, w, 8);
    }, 63), -1.3, 0.85, FRONT);

    // ===== light: a visible lamp beam with dust, warm bokeh far behind, the oven glow =====
    const glowTex = K.canvasTex(128, 128, (g, r, w, h) => {
      const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    const beamTex = K.canvasTex(16, 256, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const BEAM_H = 11;
    const beam = new T.Mesh(new T.ConeGeometry(3.6, BEAM_H, 40, 1, true).translate(0, -BEAM_H / 2, 0).rotateX(-Math.PI / 2),
      new T.MeshBasicMaterial({ color: '#ffcf8a', map: beamTex, transparent: true, opacity: 0.035, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false }));
    beam.position.copy(lamp.position); beam.lookAt(lamp.target.position); scene.add(beam);
    const ND = 220, dustPos = new Float32Array(ND * 3), dR = K.rng(77), dust0 = [];
    for (let i = 0; i < ND; i++) { const u = dR(); dust0.push([K.lerp(-3.5, 0, u) + dR.range(-1.6, 1.6) * u, dR.range(0.4, 5), K.lerp(4.5, -0.2, u) + dR.range(-1.4, 1.4) * u, dR() * 6]); }
    const dustGeo = new T.BufferGeometry(); dustGeo.setAttribute('position', new T.BufferAttribute(dustPos, 3));
    const dust = new T.Points(dustGeo, new T.PointsMaterial({ color: '#ffe2b0', map: glowTex, size: 0.06, transparent: true, opacity: 0.8, blending: T.AdditiveBlending, depthWrite: false }));
    scene.add(dust);
    const bokehR = K.rng(88), bokeh = Array.from({ length: 18 }, () => {
      const s = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: bokehR.pick(['#ffb35c', '#ffd08a', '#ff8a4c', '#ffe7b8']), transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false }));
      s.position.set(bokehR.range(-11, 11), bokehR.range(1.5, 6), bokehR.range(-14, -8)); s.scale.setScalar(bokehR.range(0.8, 2.2)); s.userData.ph = bokehR() * 6;
      scene.add(s); return s;
    });
    const ovenLight = new T.PointLight('#ff7a2e', 0, 6, 1.5); ovenLight.position.set(0, 1.1, -0.5); scene.add(ovenLight);
    const warmRim = new T.DirectionalLight('#ff9a52', 0.0); warmRim.position.set(3, 3, -6); scene.add(warmRim);

    const cam = K.camPath([
      { t: 0, pos: [-1.7, 5.5, 10.6], look: [0, 0.95, -0.2] },
      { t: 11, pos: [1.7, 5.2, 10.2], look: [0, 0.95, -0.2] },
    ], S.camera);
    const loafPale = new T.Color('#ffffff'), loafBaked = new T.Color('#c98744');

    return (t, realT) => {
      cam(t);
      const n = B.length;
      let cur = 0; for (let k = 1; k < n; k++) if (t >= B[k] + 0.35) cur = k;     // spread on the right page
      let left = 0; for (let k = 1; k < n; k++) if (t >= B[k] + 1.35) left = k;   // spread on the left page
      leftPage.material.map = TEX[left][0]; rightPage.material.map = TEX[cur][1];
      // leaf
      leaf.visible = false;
      for (let k = 1; k < n; k++) {
        const p = K.prog(t, B[k] + 0.35, B[k] + 1.35, 'inOut');
        if (p > 0 && p < 1) {
          leaf.visible = true; leaf.rotation.z = p * Math.PI; leaf.position.y = PY + 0.004 + Math.sin(p * Math.PI) * 0.05;
          leafFront.material.map = TEX[k - 1][1]; leafBack.material.map = TEX[k][0];
        }
      }
      // pieces fold up and down
      spreads.forEach((ps, k) => {
        const up = k === 0 ? 1 : 1, down = k === n - 1 ? 1 : 1 - K.prog(t, B[k + 1], B[k + 1] + 0.4, 'in');
        ps.forEach(p => {
          const u = k === 0 ? 1 : K.prog(t, B[k] + 1.15 + p.delay, B[k] + 1.7 + p.delay, 'back') * up;
          const f = Math.min(u, down) * (t < B[k] + (k ? 1.1 : -1) ? 0 : 1);
          p.hinge.visible = f > 0.01 && !(k === 1 && p === ps[2]);
          p.hinge.rotation.x = -(Math.PI / 2) * (1 - f) + 0.015 * Math.sin(realT * 1.3 + p.x);
        });
      });
      // moving parts
      jug.inner.rotation.z = 0.45 * K.prog(t, 0.5, 1.3, 'inOut') * (1 - K.prog(t, 2.0, 2.5, 'inOut'));
      jug.inner.position.x = -0.25 * K.prog(t, 0.5, 1.3, 'inOut') * (1 - K.prog(t, 2.0, 2.5, 'inOut'));
      bubbles.forEach(b => {
        const age = t - (B[1] + 1.6 + b.bubble * 0.22), u = age > 0 ? (age % 1.5) / 1.5 : 0;
        b.inner.position.y = u * 1.1; b.inner.position.x = 0.12 * Math.sin(age * 4 + b.bubble);
        b.inner.scale.setScalar(0.6 + u * 0.6);
      });
      const rise = K.prog(t, B[2] + 1.6, B[3] - 0.1, 'inOut');
      dough.inner.scale.set(1 + 0.12 * rise, 0.45 + 0.75 * rise, 1);
      hand.rotation.z = -rise * Math.PI * 2;
      loaf.mesh.material[0].color.copy(loafPale).lerp(loafBaked, K.prog(t, B[3] + 1.8, B[3] + 2.6, 'inOut'));
      steam.forEach(s => {
        const u = ((realT * 0.5 + s.steam / 3) % 1);
        s.inner.position.set(0.15 * Math.sin(u * 6 + s.steam), 0.6 + u * 0.8, 0);
        s.inner.scale.setScalar(0.5 + u * 0.9);
        s.mesh.material.forEach(m => { m.opacity = Math.sin(u * Math.PI) * 0.6 * K.prog(t, B[3] + 2.0, B[3] + 2.6); });
      });
      // ===== layers and light =====
      mols.forEach(m => { m.inner.position.y = 0.25 + 0.12 * Math.sin(realT * 1.4 + m.mol * 2); m.inner.rotation.z = 0.3 * Math.sin(realT * 0.9 + m.mol); });
      const day = K.prog(t, B[2] + 1.3, B[3] - 0.1, 'inOut');
      sun2.position.set(K.lerp(-0.55, 0.55, day), 0.85 + 0.35 * Math.sin(day * Math.PI), CARD + 0.004);
      mercury.scale.y = 0.15 + 0.6 * K.prog(t, B[2] + 1.4, B[2] + 2.6, 'out');
      for (let i = 0; i < ND; i++) {
        const [x, y, z, ph] = dust0[i];
        dustPos[i * 3] = x + 0.25 * Math.sin(realT * 0.3 + ph); dustPos[i * 3 + 1] = 0.4 + ((y + realT * 0.06 + ph) % 4.6); dustPos[i * 3 + 2] = z + 0.2 * Math.cos(realT * 0.25 + ph);
      }
      dustGeo.attributes.position.needsUpdate = true;
      bokeh.forEach(s => { s.material.opacity = 0.35 + 0.25 * Math.sin(realT * 0.8 + s.userData.ph); });
      beam.material.opacity = 0.032 + 0.008 * Math.sin(realT * 1.7);
      const oven = K.prog(t, B[3] + 1.3, B[3] + 2.0);
      ovenLight.intensity = oven * (9 + 2.5 * Math.sin(realT * 7.3) + 1.5 * Math.sin(realT * 13.1));
      warmRim.intensity = 0.6 * oven;
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.12 });
    for (let i = 1; i < B.length; i++) {
      k.play('paper', { t: B[i], gain: 0.25, pitch: 1.3 });
      k.play('paper', { t: B[i] + 0.4, gain: 0.5, dur: 2.2 });
      k.play('swish', { t: B[i] + 0.75, gain: 0.3 });
      k.play('wood', { t: B[i] + 1.36, gain: 0.25, pitch: 0.8 });
      for (let j = 0; j < 4; j++) k.play('paper', { t: B[i] + 1.3 + j * 0.12, gain: 0.25, pitch: 1.5 + j * 0.1, pan: (j - 1.5) * 0.3 });
    }
    k.play('splash', { t: 0.9, gain: 0.18, pitch: 1.6, dur: 1.5 });
    for (let j = 0; j < 6; j++) k.play('bubble', { t: B[1] + 1.65 + j * 0.25, gain: 0.25, pitch: 0.9 + (j % 3) * 0.25 });
    for (let j = 0; j < 9; j++) k.play('tick', { t: B[2] + 1.7 + j * 0.25, gain: 0.3 });
    k.play('hum', { t: B[3] + 1.4, gain: 0.25, dur: 2 });
    k.play('bell', { t: B[3] + 2.4, gain: 0.3, pitch: 1.6 });
  },
  post: null,
};
