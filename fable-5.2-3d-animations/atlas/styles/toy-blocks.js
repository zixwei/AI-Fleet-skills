window.STYLES = window.STYLES || {};
STYLES['toy-blocks'] = {
  id: 'toy-blocks', name: 'Toy Blocks',
  family: 'Crafted materials',
  use: 'Explainer',
  look: 'Solid wooden blocks on a sunlit playroom floor: milk paint in soft colours, worn to bare wood at the corners, hand-painted icons. Window light falls in bright panes across the floor, with dust in the beam.',
  motion: 'Blocks lift, slide and land with a small knock; the last ones topple into place. Bare wood blocks take their paint colour when they arrive.',
  shownHere: 'The 50/30/20 budget rule: $3,000 of take-home pay splits into $1,500 for needs, $900 for wants and $600 for savings.',
  goodFor: 'Splits, shares and allocations: a whole that is divided into parts. Count the blocks to read the numbers.',
  fonts: ['Baloo 2:wght@700;800'],
  duration: 10,
  samples: 6,
  // CONTENT: 10 blocks of $300 = $3,000 take-home pay.
  beats: [
    { t: 0.0, label: 'Take-home pay: $3,000' },
    { t: 2.5, label: '50% for needs' },
    { t: 5.0, label: '30% for wants' },
    { t: 7.5, label: '20% for savings' },
  ],
  groups: [
    { name: 'NEEDS', pct: '50%', amount: '$1,500', n: 5, color: '#4f7cac', icon: 'house' },
    { name: 'WANTS', pct: '30%', amount: '$900', n: 3, color: '#e4775d', icon: 'heart' },
    { name: 'SAVINGS', pct: '20%', amount: '$600', n: 2, color: '#6aa874', icon: 'coin' },
  ],
  blockValue: '$300',

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Baloo 2', G = this.groups;
    scene.background = new T.Color('#f4e6cf'); scene.fog = new T.Fog('#f4e6cf', 22, 40); scene.add(S.camera);
    const L = K.lights(S, 'sun', { size: 8, target: [0, 0, 0] });
    L.key.intensity = 1.1; L.amb.intensity = 0.8;
    // sunlight through a window: a spot light with a window-pane cookie
    const cookie = K.canvasTex(512, 512, (g, r, w, h) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#fff'; for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) g.fillRect(70 + i * 190, 40 + j * 145, 172, 128);
      g.filter = 'blur(3px)'; g.drawImage(g.canvas, 0, 0); g.filter = 'none';
    });
    const sun = new T.SpotLight('#ffe2b0', 5, 0, 0.55, 0.35, 0); sun.map = cookie;
    sun.position.set(-7, 10, -5); sun.target.position.set(0.5, 0, 0.5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005;
    scene.add(sun, sun.target);

    // floor planks and a striped rug
    const planks = K.canvasTex(1024, 1024, (g, r, w, h) => {
      for (let i = 0; i < 8; i++) {
        g.fillStyle = `hsl(32, ${r.range(35, 48)}%, ${r.range(62, 72)}%)`; g.fillRect(0, i * 128, w, 128);
        for (let k = 0; k < 40; k++) { g.strokeStyle = `rgba(120,80,40,${r.range(0.04, 0.12)})`; g.lineWidth = r.range(1, 3); const y = i * 128 + r() * 128; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + r.range(-6, 6)); g.stroke(); }
        g.fillStyle = 'rgba(80,50,25,0.5)'; g.fillRect(0, i * 128, w, 3); g.fillRect(r() * w, i * 128, 3, 128);
      }
    }, 2);
    planks.wrapS = planks.wrapT = T.RepeatWrapping; planks.repeat.set(4, 4);
    const floor = new T.Mesh(new T.PlaneGeometry(60, 60), new T.MeshStandardMaterial({ map: planks, roughness: 0.7 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const rugTex = K.canvasTex(1024, 1024, (g, r, w, h) => {
      const cols = ['#f2d7a6', '#e9b9a0', '#cfe0d0', '#f7ecd9'];
      for (let i = 14; i > 0; i--) { g.fillStyle = cols[i % 4]; g.beginPath(); g.arc(w / 2, h / 2, i * 36, 0, 7); g.fill(); }
      for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? 255 : 90},${r() < 0.5 ? 240 : 70},200,0.08)`; g.fillRect(r() * w, r() * h, 2, 2); }
    }, 4);
    const rug = new T.Mesh(new T.CircleGeometry(6.4, 64), new T.MeshStandardMaterial({ map: rugTex, roughness: 1 }));
    rug.rotation.x = -Math.PI / 2; rug.position.y = 0.01; rug.receiveShadow = true; rug.scale.y = 0.7; scene.add(rug);

    // block textures: bare wood with the value stencil, and milk paint worn at the edges with an icon
    const icon = (g, kind, c, s) => {
      g.fillStyle = c; g.strokeStyle = c; g.lineWidth = s * 0.06;
      if (kind === 'house') { g.beginPath(); g.moveTo(0, -s * 0.4); g.lineTo(s * 0.4, 0); g.lineTo(s * 0.28, 0); g.lineTo(s * 0.28, s * 0.35); g.lineTo(-s * 0.28, s * 0.35); g.lineTo(-s * 0.28, 0); g.lineTo(-s * 0.4, 0); g.closePath(); g.fill(); }
      if (kind === 'heart') { g.beginPath(); g.moveTo(0, s * 0.35); g.bezierCurveTo(-s * 0.55, 0, -s * 0.3, -s * 0.45, 0, -s * 0.15); g.bezierCurveTo(s * 0.3, -s * 0.45, s * 0.55, 0, 0, s * 0.35); g.fill(); }
      if (kind === 'coin') { g.beginPath(); g.arc(0, 0, s * 0.36, 0, 7); g.fill(); g.fillStyle = 'rgba(0,0,0,0.25)'; g.font = `800 ${s * 0.5}px "${F}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 0, s * 0.03); }
    };
    const woodFill = (g, r, w, h) => { g.fillStyle = '#d9b98c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 50; i++) { g.strokeStyle = `rgba(130,85,40,${r.range(0.05, 0.16)})`; g.lineWidth = r.range(1, 4); const y = r() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.4, y + r.range(-15, 15), w * 0.6, y + r.range(-15, 15), w, y); g.stroke(); } };
    const woodTex = K.canvasTex(256, 256, (g, r, w, h) => {
      woodFill(g, r, w, h); g.fillStyle = 'rgba(90,55,25,0.75)'; g.font = `800 78px "${F}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(this.blockValue, w / 2, h / 2 + 6);
    }, 6);
    const paintTex = G.map((gr, gi) => K.canvasTex(256, 256, (g, r, w, h) => {
      woodFill(g, r, w, h);
      g.fillStyle = gr.color; g.beginPath(); g.roundRect(10, 10, w - 20, h - 20, 18); g.fill();
      for (let i = 0; i < 90; i++) { // worn edges: bare wood shows near the border
        const e = r.int(0, 3), u = r() * w, d = r.range(2, 16) ** 1.2 / 4;
        g.fillStyle = `rgba(217,185,140,${r.range(0.5, 1)})`; g.beginPath();
        const [x, y] = [[u, 0], [w, u], [u, h], [0, u]][e]; g.ellipse(x, y, r.range(4, 14), d + 3, 0, 0, 7); g.fill();
      }
      for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,255,255,${r.range(0, 0.06)})`; g.fillRect(r() * w, r() * h, r.range(1, 6), 1); }
      g.save(); g.translate(w / 2, h / 2); icon(g, gr.icon, '#fbf4e6', 150); g.restore();
    }, 20 + gi));

    // 10 blocks: a pyramid (4, 3, 2, 1). They leave from the top down: needs, then wants, then savings.
    const S0 = 0.9, rows = [4, 3, 2, 1], home = [];
    rows.forEach((n, r) => { for (let i = 0; i < n; i++) home.push([(i - (n - 1) / 2) * (S0 + 0.02), S0 / 2 + r * S0, 0]); });
    const order = home.map((p, i) => i).sort((a, b) => home[b][1] - home[a][1] || home[a][0] - home[b][0]);
    const targets = [[-4.5, 0, 0], [-3.6, 0, 0], [-2.7, 0, 0], [-4.05, 1, 0], [-3.15, 1, 0], [-1.05, 0, 0], [-0.15, 0, 0], [-0.6, 1, 0], [2.7, 0, 0], [2.7, 1, 0]]
      .map(([x, r, z]) => [x, S0 / 2 + r * S0, z]);
    const groupOf = k => (k < 5 ? 0 : k < 8 ? 1 : 2), geo = new T.BoxGeometry(S0, S0, S0);
    const jr = K.rng(12);
    const blocks = order.map((hi, k) => {
      const gi = groupOf(k), g = new T.Group();
      const wood = new T.Mesh(geo, new T.MeshStandardMaterial({ map: woodTex, roughness: 0.65 }));
      const paint = new T.Mesh(geo, new T.MeshStandardMaterial({ map: paintTex[gi], roughness: 0.55, transparent: true, opacity: 0 }));
      paint.scale.setScalar(1.004); wood.castShadow = wood.receiveShadow = paint.receiveShadow = true;
      g.add(wood, paint); scene.add(g);
      const beat = 1 + gi, idx = k - [0, 5, 8][gi];
      return { g, paint, from: new T.Vector3(...home[hi]), to: new T.Vector3(...targets[k]), t0: B[beat] + 0.25 + idx * 0.32, topple: gi === 2, rot: jr.range(-0.06, 0.06), gi };
    });

    // plaques (name and percent) and amounts, one for each group
    const plaques = G.map((gr, gi) => {
      const p = K.label(`${gr.name}  ${gr.pct}`, { font: F, weight: 800, px: 64, color: '#fffaf0', bg: gr.color, radius: 16, pad: 0.35, height: 0.42 });
      const x = [-3.6, -0.6, 2.7][gi]; p.position.set(x, 0.32, 1.25); p.rotation.x = -0.9; scene.add(p);
      const a = K.label(gr.amount, { font: F, weight: 800, px: 72, color: '#3b2a1e', bg: '#fffaf0', radius: 'pill', pad: 0.3, height: 0.48 });
      a.position.set(x, S0 * 2 + 0.6, 0); scene.add(a);
      return { p, a, done: B[1 + gi] + 0.25 + (gr.n - 1) * 0.32 + 0.75 };
    });
    const total = K.label('$3,000', { font: F, weight: 800, px: 72, color: '#3b2a1e', bg: '#fffaf0', radius: 'pill', pad: 0.3, height: 0.5 });
    total.position.set(0, 0.32, 1.3); total.rotation.x = -0.9; scene.add(total);
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 800, px: 96, color: '#ffffff', stroke: '#7a5232', strokeWidth: 12, height: 0.6 });
      l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.6, -8); S.camera.add(l); return l; });

    // playroom props
    const pr = K.rng(30), propMat = c => new T.MeshStandardMaterial({ color: c, roughness: 0.5 });
    const ball = new T.Mesh(new T.SphereGeometry(0.6, 32, 20), new T.MeshStandardMaterial({ map: K.canvasTex(256, 128, (g, r, w, h) => { ['#e94f4f', '#f7d046', '#4f86e9', '#fbf6ea'].forEach((c, i) => { g.fillStyle = c; g.fillRect(i * w / 4, 0, w / 4, h); }); }), roughness: 0.35 }));
    ball.position.set(6.1, 0.6, -2.2); ball.castShadow = true; scene.add(ball);
    [['#e94f4f', 3.0], ['#4f86e9', 3.4], ['#f7d046', 3.8]].forEach(([c, x], i) => {
      const cr = new T.Group(), body = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, 1.1, 6), propMat(c)), tip = new T.Mesh(new T.ConeGeometry(0.09, 0.22, 6), propMat(c));
      body.rotation.z = Math.PI / 2; tip.rotation.z = -Math.PI / 2; tip.position.x = 0.66; cr.add(body, tip);
      cr.position.set(x + 0.3, 0.09, 2.9 + i * 0.12); cr.rotation.y = 0.3 + i * 0.25; cr.traverse(o => { o.castShadow = true; }); scene.add(cr);
    });
    const car = new T.Group(), cab = new T.Mesh(new T.BoxGeometry(0.6, 0.3, 0.55), propMat('#f2e6cf')); cab.position.set(-0.1, 0.32, 0); car.add(new T.Mesh(new T.BoxGeometry(1.2, 0.35, 0.6), propMat('#c94f4f')), cab);
    [[-0.38, 0.32], [0.38, 0.32], [-0.38, -0.32], [0.38, -0.32]].forEach(([x, z]) => { const w = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, 0.12, 16), propMat('#3b2a1e')); w.rotation.x = Math.PI / 2; w.position.set(x, -0.15, z); car.add(w); });
    car.position.set(-5.7, 0.33, 2.5); car.rotation.y = 0.5; car.traverse(o => { o.castShadow = true; }); scene.add(car);
    [[5.6, 1.4, 'A'], [-6.4, -2.2, 'B'], [6.6, 0.4, 'C']].forEach(([x, z, ch], i) => {
      const t = K.canvasTex(128, 128, (g, r, w, h) => { woodFill(g, r, w, h); g.fillStyle = ['#e4775d', '#4f7cac', '#6aa874'][i]; g.font = `800 96px "${F}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, w / 2, h / 2 + 8); }, 40 + i);
      const m = new T.Mesh(new T.BoxGeometry(0.7, 0.7, 0.7), new T.MeshStandardMaterial({ map: t, roughness: 0.6 })); m.position.set(x, 0.35, z); m.rotation.y = pr.range(-0.6, 0.6); m.castShadow = true; scene.add(m);
    });
    // dust in the sunbeam
    const ND = 260, dust = new T.BufferGeometry(), d0 = [], dPos = new Float32Array(ND * 3), dr = K.rng(50);
    for (let i = 0; i < ND; i++) { const u = dr(); d0.push([K.lerp(-7, 0.5, u) + dr.range(-1.6, 1.6), K.lerp(10, 0.3, u), K.lerp(-5, 0.5, u) + dr.range(-1.6, 1.6), dr() * 6]); }
    dust.setAttribute('position', new T.BufferAttribute(dPos, 3));
    const dot = K.canvasTex(32, 32, (g, r, w, h) => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
    scene.add(new T.Points(dust, new T.PointsMaterial({ map: dot, color: '#fff1cf', size: 0.09, transparent: true, opacity: 0.8, depthWrite: false, blending: T.AdditiveBlending })));

    const cam = K.camPath([
      { t: 0, pos: [0.8, 5.4, 9.0], look: [0, 1.7, 0] },
      { t: 2.8, pos: [-0.8, 7.2, 11.6], look: [-0.8, 1.0, 0.2] },
      { t: 6, pos: [-0.5, 7.6, 12.0], look: [-0.5, 0.9, 0.2] },
      { t: 10, pos: [-0.1, 7.8, 12.2], look: [-0.4, 0.9, 0.2] },
    ], S.camera);
    const V = new T.Vector3();

    return (t, realT) => {
      cam(t);
      blocks.forEach(b => {
        const p = K.prog(t, b.t0, b.t0 + 0.65, 'inOut');
        V.lerpVectors(b.from, b.to, p);
        if (b.topple) { // savings: slide close, then tip over onto the stack
          const s = K.prog(t, b.t0, b.t0 + 0.45, 'inOut'), tip = K.prog(t, b.t0 + 0.4, b.t0 + 0.75, 'in');
          V.lerpVectors(b.from, b.to.clone().add(new T.Vector3(-S0, 0, 0)), s);
          V.x += tip * S0; V.y = K.lerp(V.y, b.to.y, tip) + Math.sin(tip * Math.PI) * S0 * 0.35;
          b.g.rotation.set(0, b.rot * (tip > 0.99 ? 1 : 0), -tip * Math.PI / 2);
        } else { V.y += Math.sin(p * Math.PI) * 1.2; b.g.rotation.set(0, K.lerp(0, b.rot, p) + Math.sin(p * Math.PI) * 0.4, 0); }
        b.g.position.copy(V);
        b.paint.material.opacity = K.prog(t, b.t0 + 0.5, b.t0 + 0.8);
      });
      plaques.forEach(q => { const s = K.prog(t, q.done - 0.2, q.done + 0.15, 'back'); q.p.scale.setScalar(Math.max(0.001, s)); q.a.scale.setScalar(Math.max(0.001, s)); q.a.visible = q.p.visible = s > 0; q.a.lookAt(S.camera.position); });
      total.visible = t < B[1] + 0.2;
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
      for (let i = 0; i < ND; i++) { const [x, y, z, ph] = d0[i]; dPos[i * 3] = x + 0.3 * Math.sin(realT * 0.3 + ph); dPos[i * 3 + 1] = y + 0.25 * Math.sin(realT * 0.4 + ph * 2); dPos[i * 3 + 2] = z + 0.3 * Math.cos(realT * 0.25 + ph); }
      dust.attributes.position.needsUpdate = true;
      sun.intensity = 5 + 0.25 * Math.sin(realT * 0.7);
      ball.rotation.y = 0.2 * Math.sin(realT * 0.5);
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.08 });
    k.play('wood', { t: 0.15, gain: 0.3, pitch: 1.1 });
    this.groups.forEach((g, gi) => {
      for (let i = 0; i < g.n; i++) {
        const t0 = B[1 + gi] + 0.25 + i * 0.32;
        k.play('swish', { t: t0, gain: 0.12, pitch: 1.2, dur: 0.6 });
        k.play(gi === 2 ? 'thud' : 'wood', { t: t0 + (gi === 2 ? 0.72 : 0.62), gain: gi === 2 ? 0.45 : 0.4, pitch: 0.9 + i * 0.07, pan: [-0.5, 0, 0.5][gi] });
      }
      k.play('pluck', { t: B[1 + gi] + 0.25 + (g.n - 1) * 0.32 + 0.75, gain: 0.25, pitch: 1 + gi * 0.25, music: true });
    });
    k.play('chime', { t: B[3] + 1.6, gain: 0.2, pitch: 1.0, music: true });
  },
  post: null,
};
