window.STYLES = window.STYLES || {};
STYLES['kamishibai'] = {
  id: 'kamishibai', name: 'Kamishibai',
  family: 'Stage and play',
  use: 'Story',
  look: 'A small wooden picture theatre on the back of a bicycle, in a quiet street at dusk. Its doors stand open, and inside is a painted card. Each card has three paper layers, so the scene has a little depth.',
  motion: 'At each change two wooden clappers strike, and the front card slides out sideways to show the next one behind it. The camera drifts a little, and the paper layers move past each other.',
  shownHere: 'The tortoise and the hare: the hare laughs at the slow tortoise, runs far ahead, stops for a nap under a tree, and the tortoise, slow and steady, crosses the line first.',
  goodFor: 'Fables, short stories and case studies told in four or five pictures, with a storyteller\'s rhythm: one scene, a clap, the next scene.',
  fonts: ['Kosugi Maru'],
  duration: 11,
  samples: 4,
  // CONTENT: one card per beat; three layers each: sky, land, characters
  beats: [
    { t: 0.0, label: 'The hare laughs at the slow tortoise', sky: ['#9fd0f0', '#f6f0d8'], scene: 'meet' },
    { t: 2.7, label: 'The race starts: the hare runs far ahead', sky: ['#8cc8f0', '#f6f0d8'], scene: 'race' },
    { t: 5.4, label: 'The hare stops for a nap', sky: ['#f0a070', '#f8e0b0'], scene: 'nap' },
    { t: 8.1, label: 'Slow and steady: the tortoise wins', sky: ['#a0d8f0', '#fff4d0'], scene: 'win' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Kosugi Maru', BE = this.beats;
    scene.background = new T.Color('#2a2030'); scene.add(S.camera);
    const L = K.lights(S, 'lamp', { size: 6, target: [0, 2, 0] }); L.key.intensity *= 0.9;
    const std = (c, r = 0.7, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    // the street: a warm wall and a stone ground
    const ground = new T.Mesh(new T.PlaneGeometry(40, 30), std('#5a5048', 0.9)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    const wallTex = K.canvasTex(1024, 512, (g, r, w, h) => { g.fillStyle = '#7a5a48'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 4, h); g.fillStyle = '#3a2a22'; g.fillRect(0, h * 0.75, w, h * 0.25); g.fillStyle = '#ffcf7a'; [[0.2, 0.3], [0.7, 0.25]].forEach(([u, v]) => g.fillRect(u * w, v * h, 110, 80)); }, 3);
    const wall = new T.Mesh(new T.PlaneGeometry(30, 12), std('#ffffff', 0.9, { map: wallTex })); wall.position.set(0, 6, -6); wall.receiveShadow = true; scene.add(wall);
    const lantern = new T.PointLight('#ffb070', 14, 12, 1.6); lantern.position.set(-5.5, 4.6, -2.0); scene.add(lantern);
    const lamp = new T.Mesh(new T.SphereGeometry(0.22, 16, 12), std('#ff8a4a', 0.5, { emissive: '#ff7a3a', emissiveIntensity: 1.5 })); lamp.scale.y = 1.3; lamp.position.copy(lantern.position); scene.add(lamp);
    const spot = new T.SpotLight('#fff0dc', 45, 20, 0.45, 0.6, 1.2); spot.position.set(1.5, 6, 7); spot.target.position.set(0, 2.95, 0); spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.001; scene.add(spot, spot.target);
    // the bicycle: rear wheel, frame tubes and the rack
    const metal = std('#2a3a4a', 0.4, { metalness: 0.7 });
    const wheel = new T.Mesh(new T.TorusGeometry(0.75, 0.06, 10, 40), std('#1a1a1a', 0.6)); wheel.rotation.y = Math.PI / 2; wheel.position.set(0, 0.8, -0.2); wheel.castShadow = true; scene.add(wheel);
    for (let i = 0; i < 12; i++) { const sp = new T.Mesh(new T.CylinderGeometry(0.008, 0.008, 1.45, 4), std('#bbb', 0.3, { metalness: 1 })); sp.rotation.x = i * Math.PI / 12; sp.position.copy(wheel.position); scene.add(sp); }
    [[[0, 0.8, -0.2], [0, 1.55, -0.2]], [[0, 0.8, -0.2], [0, 1.0, -1.8]], [[0, 1.55, -0.2], [0, 1.6, -1.6]], [[0.0, 1.55, 0.5], [0, 1.55, -0.9]]].forEach(([a, b]) => { const A = new T.Vector3(...a), Bv = new T.Vector3(...b), m = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, A.distanceTo(Bv), 8), metal); m.position.copy(A).lerp(Bv, 0.5); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), Bv.clone().sub(A).normalize()); m.castShadow = true; scene.add(m); });
    const rack = new T.Mesh(new T.BoxGeometry(1.6, 0.06, 1.2), metal); rack.position.set(0, 1.6, -0.2); scene.add(rack);
    // the theatre box: a wooden frame with open doors; the card slot is open on the left side
    const woodTex = K.canvasTex(256, 256, (g, r, w, h) => { g.fillStyle = '#8a5a30'; g.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(40,20,8,${r.range(0.05, 0.2)})`; g.lineWidth = r.range(1, 3); const y = r() * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + r.range(-6, 6)); g.stroke(); } }, 5);
    const wood = std('#ffffff', 0.6, { map: woodTex });
    const box = new T.Group(); box.position.set(0, 2.95, 0); scene.add(box);
    const CW = 3.0, CH = 2.1;
    [[0, CH / 2 + 0.14, CW + 0.6, 0.28], [0, -CH / 2 - 0.14, CW + 0.6, 0.28], [CW / 2 + 0.15, 0, 0.3, CH]].forEach(([x, y, w, h]) => { const m = new T.Mesh(new T.BoxGeometry(w, h, 0.9), wood); m.position.set(x, y, -0.1); m.castShadow = m.receiveShadow = true; box.add(m); });
    const leftPost = new T.Mesh(new T.BoxGeometry(0.3, CH, 0.25), wood); leftPost.position.set(-CW / 2 - 0.15, 0, 0.23); box.add(leftPost);
    const backP = new T.Mesh(new T.BoxGeometry(CW + 0.6, CH + 0.56, 0.06), wood); backP.position.set(0, 0, -0.55); box.add(backP);
    const roofB = new T.Mesh(new T.BoxGeometry(CW + 1.0, 0.12, 1.2), std('#5a3018', 0.6)); roofB.position.set(0, CH / 2 + 0.34, -0.05); roofB.castShadow = true; box.add(roofB);
    const doors = [-1, 1].map(s => { const piv = new T.Group(); piv.position.set(s * (CW / 2 + 0.3), 0, 0.35); box.add(piv); const d = new T.Mesh(new T.BoxGeometry(CW / 2 + 0.15, CH + 0.5, 0.06), wood); d.position.set(-s * (CW / 4 + 0.08), 0, 0); d.castShadow = true; piv.add(d); return piv; });
    // the cards: three painted layers each, a little apart, so they show parallax
    const hare = (g, x, y, s, pose) => { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#b89a7a'; g.strokeStyle = '#3a2a1a'; g.lineWidth = 4;
      if (pose === 'sleep') { g.beginPath(); g.ellipse(0, 0, 70, 34, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.ellipse(-60, -14, 28, 22, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.ellipse(-40, -40, 50, 12, -0.3, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#3a2a1a'; g.font = '700 44px sans-serif'; g.fillText('z z z', -60, -70); }
      else { g.beginPath(); g.ellipse(0, 0, 60, 38, pose === 'run' ? -0.2 : 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.ellipse(52, -38, 26, 22, 0, 0, 7); g.fill(); g.stroke();
        [[40, -70, -0.2], [60, -72, 0.2]].forEach(([ex, ey, a]) => { g.beginPath(); g.ellipse(ex, ey, 10, 34, a, 0, 7); g.fill(); g.stroke(); });
        g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(62, -42, 4, 0, 7); g.fill(); if (pose === 'laugh') { g.beginPath(); g.arc(68, -30, 8, 0, Math.PI); g.stroke(); }
        g.fillStyle = '#b89a7a'; [[-40, 30, pose === 'run' ? 0.8 : 0], [30, 30, pose === 'run' ? -0.8 : 0]].forEach(([lx, ly, a]) => { g.save(); g.translate(lx, ly); g.rotate(a); g.beginPath(); g.ellipse(0, 10, 14, 24, 0, 0, 7); g.fill(); g.stroke(); g.restore(); }); }
      g.restore(); };
    const tortoise = (g, x, y, s) => { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#1a2a10'; g.lineWidth = 4; g.fillStyle = '#9aa860';
      [[-40, 20], [30, 20]].forEach(([lx, ly]) => { g.beginPath(); g.ellipse(lx, ly, 14, 16, 0, 0, 7); g.fill(); g.stroke(); });
      g.beginPath(); g.ellipse(70, -10, 22, 16, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(78, -14, 3, 0, 7); g.fill();
      g.fillStyle = '#4a7a3a'; g.beginPath(); g.ellipse(0, 0, 60, 42, 0, Math.PI, 0); g.lineTo(60, 8); g.lineTo(-60, 8); g.fill(); g.stroke();
      g.strokeStyle = '#2a4a1a'; [[-20, -20], [20, -20], [0, -34]].forEach(([hx, hy]) => { g.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; g[k ? 'lineTo' : 'moveTo'](hx + 14 * Math.cos(a), hy + 12 * Math.sin(a)); } g.closePath(); g.stroke(); }); g.restore(); };
    const layerDraws = (b) => [
      (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, b.sky[0]); gr.addColorStop(1, b.sky[1]); g.fillStyle = gr; g.fillRect(0, 0, w, h);
        if (b.scene === 'nap') { g.fillStyle = '#ffd070'; g.beginPath(); g.arc(w * 0.75, h * 0.45, 60, 0, 7); g.fill(); }
        else { g.fillStyle = '#fff6c0'; g.beginPath(); g.arc(w * 0.85, h * 0.2, 44, 0, 7); g.fill(); g.fillStyle = '#ffffff'; [[0.2, 0.2], [0.5, 0.12]].forEach(([u, v]) => { [0, 40, 80].forEach(d => { g.beginPath(); g.arc(u * w + d, v * h, 36, 0, 7); g.fill(); }); }); }
        for (let k = 0; k < 400; k++) { g.fillStyle = 'rgba(120,90,50,0.05)'; g.fillRect((k * 97) % w, (k * 53) % h, 3, 3); } },
      (g, w, h) => { g.fillStyle = b.scene === 'nap' ? '#7a8a4a' : '#8ab05a'; g.beginPath(); g.moveTo(0, h); g.lineTo(0, h * 0.62); g.bezierCurveTo(w * 0.3, h * 0.45, w * 0.6, h * 0.7, w, h * 0.55); g.lineTo(w, h); g.fill(); g.strokeStyle = '#2a3a1a'; g.lineWidth = 5; g.stroke();
        if (b.scene === 'nap') { g.fillStyle = '#5a3a20'; g.fillRect(w * 0.3, h * 0.3, 30, h * 0.35); g.fillStyle = '#3a6a2a'; g.beginPath(); g.arc(w * 0.3 + 15, h * 0.28, 110, 0, 7); g.fill(); g.stroke(); }
        if (b.scene === 'win') { g.strokeStyle = '#5a3a20'; g.lineWidth = 8; [0.62, 0.9].forEach(u => { g.beginPath(); g.moveTo(w * u, h * 0.75); g.lineTo(w * u, h * 0.3); g.stroke(); }); g.fillStyle = '#e04a3a'; g.fillRect(w * 0.62, h * 0.3, w * 0.28, 50); g.fillStyle = '#fff'; g.font = '700 40px sans-serif'; g.textAlign = 'center'; g.fillText('FINISH', w * 0.76, h * 0.3 + 40); } },
      (g, w, h) => { g.fillStyle = '#c8a870'; g.beginPath(); g.moveTo(0, h); g.lineTo(0, h * 0.82); g.lineTo(w, h * 0.78); g.lineTo(w, h); g.fill(); g.strokeStyle = '#3a2a1a'; g.lineWidth = 5; g.stroke();
        if (b.scene === 'meet') { hare(g, w * 0.32, h * 0.7, 1.4, 'laugh'); tortoise(g, w * 0.66, h * 0.76, 1.3); }
        if (b.scene === 'race') { hare(g, w * 0.78, h * 0.68, 1.1, 'run'); g.fillStyle = 'rgba(200,180,140,0.7)'; [0, 1, 2].forEach(k => { g.beginPath(); g.arc(w * 0.62 - k * 50, h * 0.74 - k * 6, 26 - k * 5, 0, 7); g.fill(); }); tortoise(g, w * 0.18, h * 0.78, 1.0); }
        if (b.scene === 'nap') { hare(g, w * 0.34, h * 0.76, 1.1, 'sleep'); tortoise(g, w * 0.72, h * 0.78, 1.0); }
        if (b.scene === 'win') { tortoise(g, w * 0.74, h * 0.77, 1.15); hare(g, w * 0.2, h * 0.7, 0.9, 'run'); } },
    ];
    const cards = BE.map((b, i) => {
      const grp = new T.Group(); grp.position.set(0, 0, 0.12 - i * 0.16); box.add(grp);
      layerDraws(b).forEach((d, k) => { const tex = K.canvasTex(900, 630, (g, r, w, h) => { d(g, w, h); }, 30 + i * 3 + k);
        const m = new T.Mesh(new T.PlaneGeometry(CW, CH), new T.MeshStandardMaterial({ map: tex, transparent: k > 0, alphaTest: k > 0 ? 0.5 : 0, roughness: 0.85 }));
        m.position.z = k * 0.045; m.castShadow = k > 0; m.receiveShadow = true; grp.add(m); });
      return grp;
    });
    // clappers on a cord beside the box
    const clap = [-1, 1].map(s => { const piv = new T.Group(); piv.position.set(-CW / 2 - 1.6, 4.1, 1.6); scene.add(piv); const c = new T.Mesh(new T.BoxGeometry(0.12, 0.7, 0.12), std('#c8a070', 0.5)); c.position.set(s * 0.1, -0.55, 0); c.castShadow = true; piv.add(c); return { piv, s }; });
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 400, px: 66, color: '#fff4dc', bg: 'rgba(40,24,20,0.8)', radius: 14, pad: 0.35, height: 0.4 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [2.8, 3.6, 10.8], look: [-0.3, 2.5, 0] },
      { t: 5.5, pos: [0.9, 3.4, 9.8], look: [-0.3, 2.7, 0] },
      { t: 11, pos: [-1.4, 3.6, 10.4], look: [-0.4, 2.6, 0] },
    ], S.camera);
    return (t, realT) => {
      cam(t);
      const open = K.prog(t, -0.8, 0.8, 'out'); doors.forEach((p, i) => { p.rotation.y = (i ? 1 : -1) * K.lerp(0.3, 2.6, open); });
      cards.forEach((c, i) => {
        const out = i < cards.length - 1 ? K.prog(t, B[i + 1] - 0.05, B[i + 1] + 0.7, 'inOut') : 0;
        c.position.x = -out * (CW + 1.4); c.visible = out < 1;
        c.children.forEach((m, k) => { m.position.x = -out * k * 0.12; });
      });
      clap.forEach(({ piv, s }) => { let hit = 0; B.forEach(b => { const d = t - (b - 0.25); if (d > 0 && d < 0.35) hit = Math.max(hit, Math.sin(Math.PI * d / 0.35)); }); piv.rotation.z = s * (0.35 - 0.35 * hit) + 0.03 * Math.sin(realT * 1.3); });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('night', { gain: 0.04 });
    k.play('wood', { t: 0.0, gain: 0.3, pitch: 0.7 }); k.play('pluck', { t: 0.6, gain: 0.15, pitch: 1.0, music: true });
    B.slice(1).forEach((b, i) => {
      k.play('wood', { t: b - 0.1, gain: 0.5, pitch: 1.6 }); k.play('wood', { t: b + 0.05, gain: 0.45, pitch: 1.7 });
      k.play('paper', { t: b + 0.1, gain: 0.3, pitch: 0.9, dur: 0.6 });
      k.play('pluck', { t: b + 0.9, gain: 0.14, pitch: [1.12, 0.84, 1.33][i], music: true });
    });
    k.play('chime', { t: B[3] + 1.4, gain: 0.15, pitch: 1.0, music: true });
  },
  post: null,
};
