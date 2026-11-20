window.STYLES = window.STYLES || {};
STYLES['tarot-table'] = {
  id: 'tarot-table', name: 'Tarot Table',
  family: 'Stage and play',
  use: 'Story',
  look: 'Dark red velvet lit by one candle. Large illustrated cards lie face down in a row. Each card has a gold foil border that catches the flame, and its picture stands up out of the card as layered paper cut-outs.',
  motion: 'The cards turn over one at a time with a small lift. As each card lands, its paper layers fold up from the card like a pop-up book, back layer first. The candle flame moves, and the light moves with it.',
  shownHere: 'The three acts of a hero\'s journey: the call that takes the hero from home, the trial in the dark where the hero is tested, and the return home, changed.',
  goodFor: 'Stories in three or four parts, fortunes and futures, character arcs, "past, present, future" structures, and any reveal one card at a time.',
  fonts: ['Cinzel:wght@600;800'],
  duration: 11,
  samples: 4,
  // CONTENT: one card for each act; a title and three paper layers, back to front
  cards: [
    { name: 'THE CALL', sky: ['#f2b56b', '#f7dca0'], layers: ['hills', 'house', 'road'] },
    { name: 'THE TRIAL', sky: ['#20263f', '#4a3a5c'], layers: ['cave', 'dragon', 'rocks'] },
    { name: 'THE RETURN', sky: ['#7fb0d8', '#f6e6b8'], layers: ['sun', 'town', 'hero'] },
  ],
  beats: [
    { t: 0.0, label: 'The hero\'s journey, in three cards' },
    { t: 2.4, label: 'Act I: the call to leave home' },
    { t: 5.2, label: 'Act II: the trial in the dark' },
    { t: 8.0, label: 'Act III: the return, changed' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Cinzel';
    scene.background = new T.Color('#0b0608'); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#6a4a5a', '#120808', 0.25));
    // velvet: deep red with a soft pile
    const velTex = K.canvasTex(512, 512, (g, r, w, h) => { g.fillStyle = '#5a0f1c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,120,140'},${r.range(0.02, 0.06)})`; g.fillRect(r() * w, r() * h, 2, 2); } }, 3);
    velTex.wrapS = velTex.wrapT = T.RepeatWrapping; velTex.repeat.set(6, 6);
    const velvet = new T.Mesh(new T.PlaneGeometry(40, 30), new T.MeshPhysicalMaterial({ color: '#ffffff', map: velTex, roughness: 0.9, sheen: 1, sheenColor: new T.Color('#ff6070'), sheenRoughness: 0.5 })); velvet.rotation.x = -Math.PI / 2; velvet.receiveShadow = true; scene.add(velvet);
    // the candle: wax, a flame and a warm point light that flickers
    const candle = new T.Group(); candle.position.set(-4.9, 0, 1.2); scene.add(candle);
    const wax = new T.Mesh(new T.CylinderGeometry(0.32, 0.36, 1.8, 24), new T.MeshStandardMaterial({ color: '#efe2c8', roughness: 0.5, emissive: '#ff9a40', emissiveIntensity: 0.12 })); wax.position.y = 0.9; wax.castShadow = true; candle.add(wax);
    const dish = new T.Mesh(new T.CylinderGeometry(0.7, 0.75, 0.08, 32), new T.MeshStandardMaterial({ color: '#b8893a', metalness: 1, roughness: 0.3 })); dish.position.y = 0.04; candle.add(dish);
    const flameGeo = new T.SphereGeometry(0.12, 16, 12); flameGeo.scale(1, 2.4, 1);
    const flame = new T.Mesh(flameGeo, new T.MeshBasicMaterial({ color: '#ffe0a0' })); flame.position.y = 2.05; candle.add(flame);
    const glow = new T.Mesh(new T.SphereGeometry(0.5, 16, 12), new T.MeshBasicMaterial({ color: '#ff9a40', transparent: true, opacity: 0.15, blending: T.AdditiveBlending, depthWrite: false })); glow.position.y = 2.05; candle.add(glow);
    const fire = new T.PointLight('#ffb060', 22, 16, 1.6); fire.position.set(-4.9, 2.3, 1.2); scene.add(fire);
    const key = new T.SpotLight('#ffcf90', 70, 30, 0.55, 0.9, 1.2); key.position.set(-2.5, 7, 7.5); key.target.position.set(0, 0.4, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0008; key.shadow.radius = 4; scene.add(key, key.target);
    const fill = new T.DirectionalLight('#8a7aa8', 0.3); fill.position.set(4, 6, 6); scene.add(fill);
    // card faces: the painted scene, a gold border, the name; card backs: a dark star pattern
    const CW = 2.2, CH = 3.4, gold = new T.MeshStandardMaterial({ color: '#e0b04a', metalness: 1, roughness: 0.22 });
    const backTex = K.canvasTex(440, 680, (g, r, w, h) => { g.fillStyle = '#141a3a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c99a3a'; g.lineWidth = 6; g.strokeRect(24, 24, w - 48, h - 48);
      g.lineWidth = 3; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 + Math.cos(a) * 150, h / 2 + Math.sin(a) * 150); g.stroke(); }
      g.beginPath(); g.arc(w / 2, h / 2, 90, 0, 7); g.stroke(); g.beginPath(); g.arc(w / 2, h / 2, 40, 0, 7); g.stroke();
      for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(230,190,110,0.6)'; g.beginPath(); g.arc(40 + r() * (w - 80), 40 + r() * (h - 80), r.range(1, 3), 0, 7); g.fill(); } }, 7);
    const faceTex = (c, i) => K.canvasTex(440, 680, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, c.sky[0]); gr.addColorStop(1, c.sky[1]); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(80,50,20,${r.range(0.02, 0.06)})`; g.fillRect(r() * w, r() * h, 2, 2); }
      g.fillStyle = '#efe0bf'; g.fillRect(0, h - 110, w, 110); g.fillStyle = '#2a1a10'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `800 46px "${F}"`; g.fillText(c.name, w / 2, h - 55);
      g.font = `800 40px "${F}"`; g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillText(['I', 'II', 'III'][i], w / 2, 50); }, 20 + i);
    // the paper layers: each a canvas with alpha and a dark paper edge
    const ink = '#21140c';
    const draws = {
      hills: (g, w, h) => { g.fillStyle = '#6f8a3a'; g.beginPath(); g.moveTo(0, h); g.bezierCurveTo(w * 0.2, h * 0.2, w * 0.45, h * 0.4, w * 0.6, h * 0.5); g.bezierCurveTo(w * 0.75, h * 0.25, w * 0.9, h * 0.3, w, h * 0.45); g.lineTo(w, h); g.fill(); },
      house: (g, w, h) => { g.fillStyle = '#c8a070'; g.fillRect(w * 0.15, h * 0.45, w * 0.32, h * 0.55); g.fillStyle = '#8a2e22'; g.beginPath(); g.moveTo(w * 0.1, h * 0.47); g.lineTo(w * 0.31, h * 0.1); g.lineTo(w * 0.52, h * 0.47); g.fill(); g.fillStyle = '#ffd56a'; g.fillRect(w * 0.26, h * 0.62, w * 0.1, h * 0.14); g.fillStyle = '#4a6a2a'; g.beginPath(); g.arc(w * 0.75, h * 0.55, w * 0.16, 0, 7); g.fill(); g.fillRect(w * 0.73, h * 0.6, w * 0.04, h * 0.4); },
      road: (g, w, h) => { g.fillStyle = '#d8b880'; g.beginPath(); g.moveTo(w * 0.35, h); g.bezierCurveTo(w * 0.45, h * 0.6, w * 0.7, h * 0.5, w * 0.62, h * 0.2); g.lineTo(w * 0.7, h * 0.2); g.bezierCurveTo(w * 0.85, h * 0.55, w * 0.65, h * 0.7, w * 0.7, h); g.fill(); g.fillStyle = '#2a3a6a'; g.fillRect(w * 0.58, h * 0.0, w * 0.1, h * 0.25); g.fillStyle = '#e8c49a'; g.beginPath(); g.arc(w * 0.63, h * 0.0 + 4, w * 0.05, 0, 7); g.fill(); },
      cave: (g, w, h) => { g.fillStyle = '#3a3048'; g.beginPath(); g.moveTo(0, h); g.lineTo(0, h * 0.1); g.lineTo(w * 0.3, h * 0.0); g.lineTo(w * 0.7, h * 0.05); g.lineTo(w, h * 0.15); g.lineTo(w, h); g.fill(); g.fillStyle = '#120c18'; g.beginPath(); g.ellipse(w * 0.5, h * 0.75, w * 0.32, h * 0.5, 0, Math.PI, 0); g.fill(); },
      dragon: (g, w, h) => { g.fillStyle = '#7a1e2a'; g.beginPath(); g.moveTo(w * 0.1, h); g.bezierCurveTo(w * 0.2, h * 0.4, w * 0.5, h * 0.5, w * 0.55, h * 0.2); g.lineTo(w * 0.75, h * 0.1); g.lineTo(w * 0.68, h * 0.3); g.bezierCurveTo(w * 0.8, h * 0.6, w * 0.6, h * 0.8, w * 0.8, h); g.fill(); g.fillStyle = '#ffcf4a'; g.beginPath(); g.arc(w * 0.66, h * 0.17, w * 0.025, 0, 7); g.fill(); g.fillStyle = '#ff7a2a'; g.beginPath(); g.moveTo(w * 0.75, h * 0.12); g.lineTo(w * 0.98, h * 0.02); g.lineTo(w * 0.96, h * 0.25); g.fill(); },
      rocks: (g, w, h) => { g.fillStyle = '#5a5060'; g.beginPath(); g.moveTo(0, h); g.lineTo(w * 0.05, h * 0.4); g.lineTo(w * 0.25, h * 0.3); g.lineTo(w * 0.35, h); g.fill(); g.beginPath(); g.moveTo(w * 0.6, h); g.lineTo(w * 0.7, h * 0.45); g.lineTo(w * 0.95, h * 0.35); g.lineTo(w, h); g.fill(); g.fillStyle = '#c0c8d8'; g.fillRect(w * 0.44, h * 0.15, w * 0.05, h * 0.6); g.fillStyle = '#2a3a6a'; g.fillRect(w * 0.38, h * 0.45, w * 0.1, h * 0.55); },
      sun: (g, w, h) => { g.fillStyle = '#ffd04a'; g.beginPath(); g.arc(w * 0.5, h * 0.55, w * 0.25, 0, 7); g.fill(); for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; g.beginPath(); g.moveTo(w * 0.5 + Math.cos(a) * w * 0.28, h * 0.55 + Math.sin(a) * w * 0.28); g.lineTo(w * 0.5 + Math.cos(a + 0.12) * w * 0.42, h * 0.55 + Math.sin(a + 0.12) * w * 0.42); g.lineTo(w * 0.5 + Math.cos(a + 0.24) * w * 0.28, h * 0.55 + Math.sin(a + 0.24) * w * 0.28); g.fill(); } },
      town: (g, w, h) => { [[0.05, 0.5, 0.2], [0.27, 0.3, 0.18], [0.47, 0.45, 0.22], [0.72, 0.35, 0.2]].forEach(([x, y, ww], k) => { g.fillStyle = ['#d8b88a', '#c89a6a', '#e0c8a0', '#b88a5a'][k]; g.fillRect(w * x, h * y, w * ww, h * (1 - y)); g.fillStyle = '#7a2a22'; g.beginPath(); g.moveTo(w * (x - 0.02), h * y); g.lineTo(w * (x + ww / 2), h * (y - 0.2)); g.lineTo(w * (x + ww + 0.02), h * y); g.fill(); }); },
      hero: (g, w, h) => { g.fillStyle = '#7a8a3a'; g.beginPath(); g.moveTo(0, h); g.bezierCurveTo(w * 0.3, h * 0.55, w * 0.7, h * 0.55, w, h); g.fill(); g.fillStyle = '#2a3a6a'; g.fillRect(w * 0.46, h * 0.2, w * 0.1, h * 0.45); g.fillStyle = '#e8c49a'; g.beginPath(); g.arc(w * 0.51, h * 0.15, w * 0.05, 0, 7); g.fill(); g.fillStyle = '#ffd04a'; g.beginPath(); g.moveTo(w * 0.46, h * 0.1); g.lineTo(w * 0.48, h * 0.03); g.lineTo(w * 0.51, h * 0.08); g.lineTo(w * 0.54, h * 0.03); g.lineTo(w * 0.56, h * 0.1); g.fill(); g.fillStyle = '#c0c8d8'; g.fillRect(w * 0.58, h * 0.0, w * 0.03, h * 0.4); },
    };
    const layerMesh = (name, w, h, seed) => {
      const tex = K.canvasTex(Math.round(w * 200), Math.round(h * 200), (g, r, cw, ch) => { g.save(); g.translate(2, 6); draws[name](g, cw - 10, ch - 8); g.restore(); g.globalCompositeOperation = 'destination-over'; g.filter = 'brightness(0.12)'; g.drawImage(g.canvas, 4, 3); g.filter = 'none'; g.globalCompositeOperation = 'source-over'; }, seed);
      const geo = new T.PlaneGeometry(w, h); geo.translate(0, h / 2, 0);
      const m = new T.Mesh(geo, new T.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.5, roughness: 0.85, side: T.DoubleSide }));
      m.castShadow = true; m.customDepthMaterial = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, map: tex, alphaTest: 0.5 }); return m;
    };
    const cards = this.cards.map((c, i) => {
      const g = new T.Group(); g.position.set((i - 1) * 2.9, 0.02, 0.3); scene.add(g);
      const blank = new T.MeshStandardMaterial({ color: '#e8dcc0', roughness: 0.7 });
      const body = new T.Mesh(new T.BoxGeometry(CW, 0.03, CH), [blank, blank, new T.MeshStandardMaterial({ map: faceTex(c, i), roughness: 0.75 }), new T.MeshStandardMaterial({ map: backTex, roughness: 0.6 }), blank, blank]);
      body.castShadow = body.receiveShadow = true; g.add(body);
      // gold foil frame on the face side
      [[0, CH / 2 - 0.06, CW, 0.08], [0, -CH / 2 + 0.06, CW, 0.08], [CW / 2 - 0.06, 0, 0.08, CH], [-CW / 2 + 0.06, 0, 0.08, CH]].forEach(([x, z, w, d]) => { const f = new T.Mesh(new T.BoxGeometry(w, 0.012, d), gold); f.position.set(x, 0.02, z); g.add(f); });
      const inner = new T.Mesh(new T.BoxGeometry(CW - 0.36, 0.008, 0.03), gold); inner.position.set(0, 0.02, CH / 2 - 0.62); g.add(inner);
      // three pop-up layers, hinged across the card; they fold up toward the viewer
      const hinge = [-1.2, -0.45, 0.35], hgt = [1.6, 1.2, 0.95];
      const layers = c.layers.map((n, k) => { const m = layerMesh(n, CW - 0.4, hgt[k], 40 + i * 3 + k); m.position.set(0, 0.025, hinge[k]); m.rotation.x = -Math.PI / 2; g.add(m); return m; });
      g.rotation.z = Math.PI; g.position.y = 0.035;
      return { g, layers };
    });
    // deal at the start: the cards slide in from the deck
    const deck = new T.Mesh(new T.BoxGeometry(CW, 0.3, CH), [new T.MeshStandardMaterial({ color: '#d8c8a8' }), new T.MeshStandardMaterial({ color: '#d8c8a8' }), new T.MeshStandardMaterial({ map: backTex, roughness: 0.6 }), new T.MeshStandardMaterial({ color: '#d8c8a8' }), new T.MeshStandardMaterial({ color: '#d8c8a8' }), new T.MeshStandardMaterial({ color: '#d8c8a8' })]);
    deck.position.set(5.6, 0.15, -2.6); deck.rotation.y = 0.3; deck.castShadow = true; scene.add(deck);
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 800, px: 70, color: '#f3dca0', bg: 'rgba(20,8,10,0.75)', radius: 8, pad: 0.35, height: 0.4 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [0, 8.4, 10.0], look: [0, 0.2, -0.2] },
      { t: 2.4, pos: [-1.8, 6.4, 8.4], look: [-2.4, 0.6, -0.2] },
      { t: 5.2, pos: [0, 6.2, 8.2], look: [0, 0.6, -0.2] },
      { t: 8.0, pos: [1.8, 6.4, 8.4], look: [2.4, 0.6, -0.2] },
      { t: 11, pos: [0, 7.6, 10.2], look: [0, 0.6, -0.2] },
    ], S.camera);
    return (t, realT) => {
      cam(t);
      const fl = 1 + 0.12 * Math.sin(realT * 13) + 0.08 * Math.sin(realT * 23 + 1);
      fire.intensity = 22 * fl; key.intensity = 70 * (0.9 + 0.1 * fl); flame.scale.set(1, fl, 1); flame.position.x = 0.03 * Math.sin(realT * 5); glow.scale.setScalar(fl);
      cards.forEach(({ g, layers }, i) => {
        // deal: slide from the deck
        const d = K.prog(t, 0 + i * 0.15 - 0.6, 0.0 + i * 0.15 + 0.4, 'out');
        const x0 = (i - 1) * 2.9;
        const bt = B[i + 1], u = K.prog(t, bt + 0.05, bt + 0.75, 'inOut');
        g.position.x = K.lerp(5.6, x0, d); g.position.z = K.lerp(-2.6, 0.3, d); g.rotation.y = 0.3 * (1 - d);
        g.position.y = 0.035 + 0.9 * Math.sin(Math.PI * u) + 0.3 * (1 - d);
        g.rotation.z = Math.PI * (1 - u);
        layers.forEach((m, k) => { const p = K.prog(t, bt + 0.75 + k * 0.18, bt + 1.35 + k * 0.18, 'back'); m.rotation.x = -Math.PI / 2 * (1 - p); m.visible = u > 0.5; });
      });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.05 });
    [0, 0.15, 0.3].forEach(d => k.play('paper', { t: 0.05 + d, gain: 0.25, pitch: 1.3 }));
    k.play('chime', { t: 0.6, gain: 0.12, pitch: 0.7, music: true });
    B.slice(1).forEach((b, i) => {
      k.play('swish', { t: b + 0.05, gain: 0.3, pitch: 0.9, dur: 0.6 }); k.play('paper', { t: b + 0.75, gain: 0.35, pitch: 0.8 });
      [0, 1, 2].forEach(j => k.play('pop', { t: b + 0.9 + j * 0.18, gain: 0.18, pitch: 0.7 + j * 0.15 }));
      k.play('bell', { t: b + 1.4, gain: 0.15, pitch: [0.6, 0.45, 0.8][i], music: true });
    });
  },
  post: null,
};
