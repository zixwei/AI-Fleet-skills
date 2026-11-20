window.STYLES = window.STYLES || {};
STYLES['board-game'] = {
  id: 'board-game', name: 'Board Game',
  family: 'Stage and play',
  use: 'Explainer',
  look: 'A printed game board with a winding path of squares, a wooden pawn, a die and a card deck, seen from above at a tilt. Tilt-shift blur makes the near and far edges soft, so the board looks like a small model.',
  motion: 'Each step of the process is one turn: the die tumbles and lands, the pawn hops square by square, and a card turns over with the rule for the square it lands on.',
  shownHere: 'How a bill becomes a law in the United States: a draft goes to a committee, then to a vote in the House, then to a vote in the Senate, and the president signs it into law.',
  goodFor: 'Step-by-step processes with stages and rules: approvals, onboarding, a customer journey, any path where you move forward one stage at a time.',
  fonts: ['Fredoka:wght@500;700'],
  duration: 12,
  samples: 4,
  // CONTENT: the squares of the path; named squares are the stages; rolls move the pawn from stage to stage
  squares: [[-4.0, 2.0], [-2.6, 2.0], [-1.2, 2.0], [0.2, 2.0], [1.6, 2.0], [3.0, 1.7], [3.4, 0.4], [2.2, -0.3], [0.8, -0.3], [-0.6, -0.3], [-2.0, -0.6], [-2.6, -1.9], [-1.2, -2.4], [0.4, -2.4]],
  stages: { 0: 'DRAFT', 3: 'COMMITTEE', 7: 'HOUSE', 10: 'SENATE', 13: 'LAW' },
  beats: [
    { t: 0.0, label: 'A bill starts as a draft', roll: 0, card: '' },
    { t: 2.4, label: 'Committee: study and amend', roll: 3, card: 'COMMITTEE\nExperts study the bill\nand change it' },
    { t: 4.8, label: 'The House votes', roll: 4, card: 'HOUSE\nA majority must\nvote yes' },
    { t: 7.2, label: 'The Senate votes', roll: 3, card: 'SENATE\nA majority must\nvote yes again' },
    { t: 9.6, label: 'The president signs: it is law', roll: 3, card: 'LAW\nThe president signs.\nThe bill is law.' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Fredoka', SQ = this.squares, ST = this.stages, BE = this.beats;
    scene.background = new T.Color('#3a2e26'); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 8 }); L.key.position.set(-5, 12, 6);
    const std = (c, r = 0.7, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const table = new T.Mesh(new T.PlaneGeometry(60, 60), std('#6a4a34', 0.8)); table.rotation.x = -Math.PI / 2; table.receiveShadow = true; scene.add(table);
    // the board: printed path, squares, stage names
    const BW = 10, BD = 7, PX = 160, cx = x => (x + BW / 2) * PX, cz = z => (z + BD / 2) * PX;
    const cols = ['#f6c84a', '#6ec3e6', '#f08aa0', '#8ad28a'];
    const boardTex = K.canvasTex(BW * PX, BD * PX, (g, r, w, h) => {
      g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a4a7a'; g.lineWidth = 18; g.strokeRect(30, 30, w - 60, h - 60);
      g.strokeStyle = '#d8c8a0'; g.lineWidth = 60; g.lineJoin = 'round'; g.beginPath(); SQ.forEach(([x, z], i) => i ? g.lineTo(cx(x), cz(z)) : g.moveTo(cx(x), cz(z))); g.stroke();
      SQ.forEach(([x, z], i) => { const s = 0.58 * PX, st = ST[i]; g.fillStyle = st ? '#2a4a7a' : cols[i % 4]; g.fillRect(cx(x) - s, cz(z) - s, 2 * s, 2 * s); g.strokeStyle = '#1e2a3a'; g.lineWidth = 6; g.strokeRect(cx(x) - s, cz(z) - s, 2 * s, 2 * s);
        if (st) { g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `700 ${st.length > 7 ? 26 : 34}px "${F}"`; g.fillText(st, cx(x), cz(z)); }
        else { g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.arc(cx(x), cz(z), 14, 0, 7); g.fill(); } });
      g.fillStyle = '#2a4a7a'; g.font = `700 70px "${F}"`; g.textAlign = 'left'; g.fillText('THE ROAD TO LAW', 80, h - 90);
    }, 3);
    const board = new T.Mesh(new T.BoxGeometry(BW, 0.12, BD), [std('#2a4a7a'), std('#2a4a7a'), std('#ffffff', 0.55, { map: boardTex }), std('#2a4a7a'), std('#2a4a7a'), std('#2a4a7a')]);
    board.position.y = 0.06; board.receiveShadow = true; board.castShadow = true; scene.add(board);
    const top = 0.12;
    // the pawn: a turned wooden piece
    const pawn = new T.Mesh(new T.LatheGeometry([[0, 0], [0.32, 0], [0.32, 0.08], [0.2, 0.14], [0.12, 0.45], [0.2, 0.55], [0.08, 0.62], [0.17, 0.72], [0.17, 0.86], [0.08, 0.93], [0, 0.95]].map(([a, b]) => new T.Vector2(a, b)), 32), std('#c0392b', 0.45));
    pawn.castShadow = true; scene.add(pawn);
    // the die: pips drawn on each face; faces in BoxGeometry order +x,-x,+y,-y,+z,-z hold 3,4,1,6,2,5
    const pip = n => K.canvasTex(128, 128, (g, r, w, h) => { g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a';
      const P = { 1: [[0.5, 0.5]], 2: [[0.28, 0.28], [0.72, 0.72]], 3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]], 4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]], 5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]], 6: [[0.28, 0.22], [0.72, 0.22], [0.28, 0.5], [0.72, 0.5], [0.28, 0.78], [0.72, 0.78]] }[n];
      P.forEach(([u, v]) => { g.beginPath(); g.arc(u * w, v * h, 11, 0, 7); g.fill(); }); }, n);
    const die = new T.Mesh(new T.BoxGeometry(0.6, 0.6, 0.6), [3, 4, 1, 6, 2, 5].map(n => std('#ffffff', 0.35, { map: pip(n) }))); die.castShadow = true; scene.add(die);
    const faceUp = { 1: [0, 0, 0], 3: [0, 0, Math.PI / 2], 4: [0, 0, -Math.PI / 2], 2: [-Math.PI / 2, 0, 0], 5: [Math.PI / 2, 0, 0], 6: [Math.PI, 0, 0] };
    // the deck and one rule card per stage
    const deck = new T.Mesh(new T.BoxGeometry(1.6, 0.3, 2.2), std('#2a4a7a', 0.5)); deck.position.set(6.3, 0.15, -1.6); deck.castShadow = true; scene.add(deck);
    const cardBack = K.canvasTex(320, 440, (g, r, w, h) => { g.fillStyle = '#2a4a7a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#f6c84a'; g.lineWidth = 10; g.strokeRect(20, 20, w - 40, h - 40); g.fillStyle = '#f6c84a'; g.font = `700 120px "${F}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', w / 2, h / 2); }, 9);
    const cards = BE.map((b, i) => {
      if (!b.card) return null;
      const lines = b.card.split('\n');
      const face = K.canvasTex(320, 440, (g, r, w, h) => { g.fillStyle = '#fbf6e8'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a4a7a'; g.fillRect(0, 0, w, 110); g.fillStyle = '#ffffff'; g.font = `700 ${lines[0].length > 8 ? 40 : 52}px "${F}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(lines[0], w / 2, 58);
        g.fillStyle = '#1e2a3a'; g.font = `500 32px "${F}"`; lines.slice(1).forEach((l, k) => g.fillText(l, w / 2, 190 + k * 52)); }, 30 + i);
      const m = new T.Mesh(new T.BoxGeometry(1.6, 0.02, 2.2), [std('#eee'), std('#eee'), std('#ffffff', 0.6, { map: face }), std('#ffffff', 0.6, { map: cardBack }), std('#eee'), std('#eee')]);
      m.castShadow = true; m.visible = false; scene.add(m); return m;
    });
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 72, color: '#ffffff', bg: 'rgba(30,42,58,0.85)', radius: 16, pad: 0.35, height: 0.42 }); l.material.depthTest = false; l.material.depthWrite = true; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [0.2, 12.2, 8.0], look: [0.6, 0, -0.1] },
      { t: 6, pos: [1.2, 11.8, 7.6], look: [1.0, 0, -0.3] },
      { t: 12, pos: [1.4, 12.4, 7.8], look: [1.0, 0, -0.4] },
    ], S.camera);
    // where the pawn stands at each beat
    const at = []; let s = 0; BE.forEach(b => { s += b.roll; at.push(s); });
    const sqPos = i => new T.Vector3(SQ[i][0], top, SQ[i][1]);
    return (t, realT) => {
      cam(t);
      let k = 0; for (let i = 1; i < B.length; i++) if (t >= B[i]) k = i;
      const b0 = B[k], roll = BE[k].roll;
      // die: thrown from the right, tumbles, bounces, rests with the roll on top
      if (k > 0) {
        const u = K.prog(t, b0, b0 + 0.9), e = K.ease.out(u), f = faceUp[roll];
        die.position.set(K.lerp(5.8, 4.1, e), top + 0.3 + 1.6 * Math.abs(Math.sin(u * Math.PI * 2.5)) * (1 - u) ** 1.5, K.lerp(1.2, 2.75, e));
        die.rotation.set(f[0] + (1 - e) * 9, f[1] + (1 - e) * 5 + k, f[2] + (1 - e) * 7);
      } else { die.position.set(4.1, top + 0.3, 2.75); die.rotation.set(0, 0.4, 0); }
      // pawn: hops from square to square after the die lands
      const from = k ? at[k - 1] : 0, hopT = 0.32, start = b0 + 1.0;
      let idx = from, frac = 0;
      if (k > 0) { const h = K.clamp((t - start) / hopT, 0, roll); idx = from + Math.floor(h); frac = h - Math.floor(h); if (idx >= at[k]) { idx = at[k]; frac = 0; } }
      const p0 = sqPos(idx), p1 = sqPos(Math.min(idx + 1, SQ.length - 1)), e2 = K.ease.inOut(frac);
      pawn.position.lerpVectors(p0, p1, e2); pawn.position.y = top + 0.55 * Math.sin(Math.PI * frac);
      pawn.scale.set(1 + 0.12 * (frac > 0.9 ? 1 - (1 - frac) * 10 : 0), 1, 1);
      // cards: lift off the deck and turn over beside it
      cards.forEach((c, i) => { if (!c) return; const u = K.prog(t, B[i] + 1.0 + roll * 0, B[i] + 1.7, 'inOut'); c.visible = t >= B[i] + 0.9 && (i === k || i === k - 1 && t < B[k] + 1.0);
        c.position.set(6.3, 0.32 + 0.9 * Math.sin(Math.PI * u) + 0.02 * i, -1.6 + 2.5 * u);
        c.rotation.set(0, 0, Math.PI * (1 - u)); });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t), BE = this.beats;
    k.bed('room', { gain: 0.05 });
    k.play('wood', { t: 0.3, gain: 0.3, pitch: 1.4 }); k.play('chime', { t: 0.5, gain: 0.12, pitch: 1.0, music: true });
    BE.forEach((b, i) => { if (!i) return;
      [0.15, 0.35, 0.5, 0.62, 0.72].forEach((d, j) => k.play('wood', { t: b.t + d, gain: 0.35 - j * 0.05, pitch: 1.8 + (j % 2) * 0.3 }));
      for (let h = 0; h < b.roll; h++) k.play('click', { t: b.t + 1.0 + (h + 1) * 0.32, gain: 0.3, pitch: 0.9 + h * 0.1 });
      k.play('paper', { t: b.t + 1.0, gain: 0.3, pitch: 1.1 });
      k.play(i === BE.length - 1 ? 'bell' : 'blip', { t: b.t + 1.1 + b.roll * 0.32, gain: 0.2, pitch: 1 + i * 0.12, music: true });
    });
    k.play('sparkle', { t: B[4] + 2.2, gain: 0.25 });
  },
  // tilt-shift: blur grows with distance from the focus plane; the title band at the top stays sharp
  post: {
    uniforms: { uFocus: { value: 14.4 } },
    fragment: `
      uniform float uFocus;
      vec4 postFX(vec2 uv){
        float d = linDepth(uv), b = clamp(abs(d - uFocus) / 2.2 - 0.1, 0.0, 1.0) * (1.0 - smoothstep(0.84, 0.86, uv.y));
        vec3 c = vec3(0.0); float ws = 0.0;
        for (int i = 0; i < 24; i++) { float fi = float(i), r = sqrt((fi + 0.5) / 24.0) * b * 9.0, a = fi * 2.39996;
          vec2 o = vec2(cos(a), sin(a)) * r / uRes; float w = 1.0;
          c += texture2D(tColor, uv + o).rgb * w; ws += w; }
        c = ws > 0.0 ? c / ws : texture2D(tColor, uv).rgb;
        float l = dot(c, vec3(0.299, 0.587, 0.114)); c = mix(vec3(l), c, 1.25);
        return vec4(c, 1.0);
      }`,
  },
};
