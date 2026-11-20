window.STYLES = window.STYLES || {};
STYLES['light-painting'] = {
  id: 'light-painting', name: 'Light Painting',
  family: 'Living and elemental',
  use: 'Story',
  look: 'A dark room photographed with a long exposure: a moving point of light leaves bright trails that stay in the air, and they light up a real wooden table and chair in passing. Warm, cyan and magenta light on black.',
  motion: 'The point of light moves at hand speed and draws; every stroke stays. Old strokes fade when the drawing moves on, and the next drawing is made over them.',
  shownHere: 'How a signature becomes a logo: a name written by hand, the strongest strokes kept, the shapes simplified, and a mark that fits in a circle.',
  goodFor: 'Design process, handwriting, ideas that take form, and any story where a line drawn by hand becomes a shape.',
  fonts: ['Caveat:wght@700'],
  duration: 11,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'A name, written in light' },
    { t: 2.7, label: 'Keep the strongest strokes' },
    { t: 5.4, label: 'Simplify the shapes' },
    { t: 8.1, label: 'A mark that fits in a circle' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Caveat';
    scene.background = new T.Color('#040405'); scene.add(S.camera);
    const amb = new T.HemisphereLight('#30303a', '#000000', 0.7); scene.add(amb);
    // room: floor, back wall, a table and a chair
    const floor = new T.Mesh(new T.PlaneGeometry(30, 20), new T.MeshStandardMaterial({ color: '#1a1614', roughness: 0.4, metalness: 0.2 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -2.2; floor.receiveShadow = true; scene.add(floor);
    const wall = new T.Mesh(new T.PlaneGeometry(30, 12), new T.MeshStandardMaterial({ color: '#141418', roughness: 0.9 })); wall.position.set(0, 3, -4); scene.add(wall);
    const wood = new T.MeshStandardMaterial({ color: '#6a4a30', roughness: 0.6 });
    const table = new T.Group(); const top = new T.Mesh(new T.BoxGeometry(3.2, 0.12, 1.6), wood); top.position.y = -0.7; table.add(top); [[-1.4, -0.6], [1.4, -0.6], [-1.4, 0.6], [1.4, 0.6]].forEach(([x, z]) => { const l = new T.Mesh(new T.BoxGeometry(0.1, 1.5, 0.1), wood); l.position.set(x, -1.45, z); table.add(l); }); table.position.set(1.0, 0, -1.4); table.traverse(o => { o.castShadow = o.receiveShadow = true; }); scene.add(table);
    const chair = new T.Group(); const seat = new T.Mesh(new T.BoxGeometry(0.9, 0.08, 0.9), wood); seat.position.y = -1.1; chair.add(seat); const back = new T.Mesh(new T.BoxGeometry(0.9, 1.1, 0.08), wood); back.position.set(0, -0.5, -0.42); chair.add(back); [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].forEach(([x, z]) => { const l = new T.Mesh(new T.BoxGeometry(0.07, 1.1, 0.07), wood); l.position.set(x, -1.65, z); chair.add(l); }); chair.position.set(-2.4, 0, -0.9); chair.rotation.y = 0.5; chair.traverse(o => { o.castShadow = o.receiveShadow = true; }); scene.add(chair);
    // the drawings: each a path that the light draws at hand speed
    const P = (arr, z = 0) => arr.map(([x, y]) => new T.Vector3(x, y, z));
    const sig = P([[-3.4, 0.6], [-3.0, 1.9], [-2.6, 0.6], [-2.9, 1.0], [-3.3, 1.0], [-2.6, 0.9], [-2.2, 0.6], [-2.0, 1.3], [-1.8, 0.6], [-1.6, 1.3], [-1.3, 0.7], [-0.9, 1.25], [-1.25, 1.2], [-1.1, 0.6], [-0.6, 0.9], [0.0, 0.8], [0.8, 1.1], [1.5, 0.9]]);
    const strong = P([[-3.4, 0.6], [-3.0, 1.9], [-2.6, 0.6], [-2.9, 1.0], [-3.3, 1.0]], 0.05);
    const simple = P([[-0.9, -0.2], [0.0, 1.8], [0.9, -0.2], [0.0, 0.4], [-0.9, -0.2]], 0.1).map(v => v.add(new T.Vector3(1.0, 0.2, 0)));
    const ring = []; for (let i = 0; i <= 64; i++) { const a = Math.PI / 2 + i / 64 * Math.PI * 2; ring.push(new T.Vector3(1.0 + 1.55 * Math.cos(a), 1.0 + 1.55 * Math.sin(a), 0.15)); }
    const strokes = [
      { pts: sig, tension: 0.5, col: '#ffd09a', t0: -0.9, t1: 2.2, fade: [B[1] + 0.2, B[1] + 1.4] },
      { pts: strong, tension: 0.5, col: '#ffb060', t0: B[1] + 0.2, t1: B[1] + 1.4, fade: [B[2] + 0.4, B[2] + 1.6] },
      { pts: simple, tension: 0.0, col: '#5ff2ff', t0: B[2] + 0.2, t1: B[2] + 1.9, fade: null },
      { pts: ring, tension: 0.5, col: '#ff5ad0', t0: B[3] + 0.1, t1: B[3] + 1.6, fade: null },
    ].map(s => {
      const curve = new T.CatmullRomCurve3(s.pts, false, 'catmullrom', s.tension), segs = 300;
      const core = new T.TubeGeometry(curve, segs, 0.025, 6), glow = new T.TubeGeometry(curve, segs, 0.11, 6);
      const cm = new T.MeshBasicMaterial({ color: new T.Color(s.col).lerp(new T.Color('#ffffff'), 0.6), transparent: true, toneMapped: false }), gm = new T.MeshBasicMaterial({ color: s.col, transparent: true, opacity: 0.35, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false });
      const m1 = new T.Mesh(core, cm), m2 = new T.Mesh(glow, gm); scene.add(m1, m2);
      return Object.assign(s, { curve, core, glow, cm, gm });
    });
    const glowTex = K.canvasTex(64, 64, g => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
    const head = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#ffffff', transparent: true, blending: T.AdditiveBlending, depthWrite: false })); head.scale.setScalar(0.9); scene.add(head);
    const headL = new T.PointLight('#ffe0b0', 6, 7, 1.5); scene.add(headL);
    // faint trails of the light's journey between drawings
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 96, color: '#f2f0ea', height: 0.6 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, -1.72, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [-1.5, 1.2, 8.5], look: [-1.4, 1.0, 0] },
      { t: 5.4, pos: [0.6, 1.0, 8.6], look: [0.4, 0.9, 0] },
      { t: 11, pos: [0.6, 0.6, 10.0], look: [0.6, 0.6, 0] },
    ], S.camera);
    return (t, realT) => {
      cam(t);
      let hp = null, hc = '#ffffff';
      strokes.forEach(s => {
        const p = K.prog(t, s.t0, s.t1, 'inOut'), n = s.core.index.count;
        s.core.setDrawRange(0, Math.floor(p * n / 36) * 36); s.glow.setDrawRange(0, Math.floor(p * s.glow.index.count / 36) * 36);
        const fade = s.fade ? 1 - K.prog(t, s.fade[0], s.fade[1]) * 0.85 : 1;
        s.cm.opacity = fade; s.gm.opacity = 0.35 * fade * (0.9 + 0.1 * Math.sin(realT * 5));
        if (t >= s.t0 && t <= s.t1 + 0.15) { hp = s.curve.getPointAt(p); hc = s.col; }
      });
      head.visible = !!hp; headL.intensity = hp ? 6 : 0;
      if (hp) { head.position.copy(hp); headL.position.copy(hp).add(new T.Vector3(0, 0, 0.4)); headL.color.set(hc); head.material.color.set(hc).lerp(new T.Color('#ffffff'), 0.6); head.scale.setScalar(0.8 + 0.15 * Math.sin(realT * 20)); }
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.05 });
    [[0.0, 2.4], [B[1] + 0.2, 1.2], [B[2] + 0.2, 1.7], [B[3] + 0.1, 1.5]].forEach(([t, d], i) => { k.play('hum', { t, gain: 0.08, pitch: 1.5 + i * 0.25, dur: d }); k.play('swish', { t, gain: 0.15, pitch: 1.8 - i * 0.2, dur: d }); });
    k.play('zap', { t: B[2] + 1.9, gain: 0.1, pitch: 1.5 });
    k.play('chime', { t: B[3] + 1.6, gain: 0.25, pitch: 1.0, music: true });
    k.play('sparkle', { t: B[3] + 1.65, gain: 0.2 });
  },
  post: null,
};
