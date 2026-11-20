window.STYLES = window.STYLES || {};
STYLES['string-art'] = {
  id: 'string-art', name: 'String Art',
  family: 'Flat content made physical',
  use: 'Explainer',
  look: 'Brass nails in a dark oiled wooden board, and one coloured thread wound from nail to nail. Straight lines of thread add up to a smooth curve. Warm lamp light picks out the nail heads.',
  motion: 'The thread head travels from nail to nail and lays each line; it starts slowly so the rule is clear, then speeds up until the curve appears.',
  shownHere: 'How a cardioid appears: join each nail n on a circle to nail 2n with straight thread, and a heart-shaped curve forms; a similar bright curve shines in a cup of coffee.',
  goodFor: 'Geometry, patterns and rules that build something larger: many simple steps that add up to a shape.',
  fonts: ['Fraunces:wght@600;800'],
  duration: 11,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: '72 nails on a circle' },
    { t: 2.7, label: 'Join nail n to nail 2n' },
    { t: 5.4, label: 'Straight lines make a curve' },
    { t: 8.1, label: 'Light draws a cousin in your cup' },
  ],
  nails: 72,

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Fraunces', N = this.nails, R = 3.0;
    scene.background = new T.Color('#120d0a'); scene.fog = new T.Fog('#120d0a', 16, 34); scene.add(S.camera);
    const L = K.lights(S, 'lamp', { size: 7, target: [1.5, 0, 0] }); L.key.position.set(-4, 9, 5); L.key.intensity = 3.0; L.amb.intensity = 0.5; S.scene.environmentIntensity = 0.5;
    const wood = (c1, seed) => K.canvasTex(1024, 1024, (g, r, w, h) => { g.fillStyle = c1; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(${r() < 0.5 ? 10 : 90},${r() < 0.5 ? 5 : 50},${r() < 0.5 ? 2 : 25},${r.range(0.06, 0.2)})`; g.lineWidth = r.range(1, 5); const y = r() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + r.range(-30, 30), w * 0.7, y + r.range(-30, 30), w, y + r.range(-15, 15)); g.stroke(); } }, seed);
    const table = new T.Mesh(new T.PlaneGeometry(40, 24), new T.MeshStandardMaterial({ map: wood('#4a3324', 2), roughness: 0.6 })); table.rotation.x = -Math.PI / 2; table.position.y = -0.31; table.receiveShadow = true; scene.add(table);
    const board = new T.Mesh(new T.BoxGeometry(7.6, 0.3, 7.6), new T.MeshStandardMaterial({ map: wood('#21140d', 5), roughness: 0.45 })); board.position.y = -0.15; board.receiveShadow = true; board.castShadow = true; scene.add(board);
    // nails: lathe shafts with flat heads
    const nailGeo = new T.LatheGeometry([[0, 0], [0.025, 0], [0.025, 0.32], [0.06, 0.32], [0.06, 0.35], [0, 0.36]].map(([x, y]) => new T.Vector2(x, y)), 12);
    const brass = new T.MeshStandardMaterial({ color: '#d8a64a', metalness: 1, roughness: 0.3 });
    const nails = new T.InstancedMesh(nailGeo, brass, N); nails.castShadow = true; scene.add(nails);
    const nailP = i => { const a = Math.PI / 2 + (i / N) * Math.PI * 2; return new T.Vector3(R * Math.cos(a), 0.22, -R * Math.sin(a)); };
    const MX = new T.Matrix4();
    for (let i = 0; i < N; i++) nails.setMatrixAt(i, MX.makeTranslation(nailP(i).x, 0, nailP(i).z));
    // number tags for the first nails and their doubles
    const tags = [[1, '1'], [2, '2'], [3, '3'], [6, '6'], [0, '0']].map(([i, s]) => { const l = K.label(s, { font: F, weight: 800, px: 64, color: '#f3e2c2', height: 0.26 }); const p = nailP(i); l.position.set(p.x * 1.12, 0.05, p.z * 1.12); l.rotation.x = -Math.PI / 2; scene.add(l); return l; });
    // the thread: one chord for each nail, n -> 2n, coloured along the way
    const chordGeo = new T.CylinderGeometry(0.011, 0.011, 1, 5).translate(0, 0.5, 0);
    const chords = new T.InstancedMesh(chordGeo, new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6, emissive: '#ff6a3a', emissiveIntensity: 0.25 }), N); chords.frustumCulled = false; scene.add(chords);
    const col = new T.Color();
    for (let i = 0; i < N; i++) { col.setHSL(0.97 + (i / N) * 0.12, 0.85, 0.6); chords.setColorAt(i, col); }
    // order and timing: 3 slow chords, then faster and faster
    const tStart = i => i < 3 ? B[1] + 0.2 + i * 0.75 : B[2] - 0.2 + Math.pow((i - 3) / (N - 3), 0.8) * (B[3] - B[2] + 0.2);
    const tDur = i => i < 3 ? 0.6 : 0.06;
    const head = new T.Group(); scene.add(head);
    const spool = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.22, 20), new T.MeshStandardMaterial({ color: '#ff7a4a', roughness: 0.5 })); spool.position.y = 0.32; head.add(spool);
    const needle = new T.Mesh(new T.ConeGeometry(0.03, 0.4, 8), brass); needle.rotation.x = Math.PI; needle.position.y = 0.0; head.add(needle);
    const hl = new T.PointLight('#ff8a5a', 0, 2.5); hl.position.y = 0.4; head.add(hl);
    // the coffee cup: a lathe cup with a bright caustic curve on the coffee
    const cup = new T.Group(); cup.position.set(6.6, -0.3, 0.6); scene.add(cup);
    const cupGeo = new T.LatheGeometry([[0, 0], [0.9, 0], [1.0, 0.08], [1.25, 1.3], [1.32, 1.36], [1.26, 1.38], [1.18, 1.32], [0.95, 0.15], [0, 0.12]].map(([x, y]) => new T.Vector2(x, y)), 64);
    const porcelain = new T.MeshPhysicalMaterial({ color: '#f5f1ea', roughness: 0.25, clearcoat: 1, side: T.DoubleSide });
    const c1 = new T.Mesh(cupGeo, porcelain); c1.castShadow = true; cup.add(c1);
    const handle = new T.Mesh(new T.TorusGeometry(0.4, 0.08, 12, 30, Math.PI * 1.2), porcelain); handle.position.set(1.35, 0.75, 0); handle.rotation.z = -Math.PI * 0.6; cup.add(handle);
    const saucer = new T.Mesh(new T.CylinderGeometry(1.9, 1.6, 0.08, 64), porcelain); saucer.position.y = -0.02; saucer.receiveShadow = true; cup.add(saucer);
    const coffee = new T.Mesh(new T.CircleGeometry(1.17, 64), new T.MeshPhysicalMaterial({ color: '#2a170d', roughness: 0.15, clearcoat: 1 })); coffee.rotation.x = -Math.PI / 2; coffee.position.y = 1.12; cup.add(coffee);
    const caus = []; for (let i = 0; i <= 120; i++) { const tt = (i / 120) * Math.PI - Math.PI / 2, rr = 1.1; caus.push(new T.Vector3(rr * (3 * Math.cos(tt) - Math.cos(3 * tt)) / 4 * 0.98, 0, rr * (3 * Math.sin(tt) - Math.sin(3 * tt)) / 4 * 0.98)); }
    const causMat = new T.MeshBasicMaterial({ color: '#ffe9b8', transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false });
    const causMesh = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(caus), 160, 0.025, 6), causMat); causMesh.position.y = 1.125; causMesh.rotation.y = Math.PI; cup.add(causMesh);
    const causGlow = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(caus), 120, 0.09, 6), causMat.clone()); causGlow.position.copy(causMesh.position); causGlow.rotation.y = Math.PI; cup.add(causGlow);
    const steam = [0, 1, 2].map(i => { const m = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(Array.from({ length: 8 }, (_, k) => new T.Vector3(0.12 * Math.sin(k * 0.9 + i * 2), k * 0.18, 0))), 30, 0.03, 6), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.25 })); m.position.set(-0.3 + i * 0.3, 1.3, 0); cup.add(m); return m; });
    const window_ = new T.SpotLight('#fff3dc', 40, 30, 0.35, 0.6, 1.4); window_.position.set(9, 8, 4); window_.target.position.copy(cup.position); scene.add(window_, window_.target);
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 800, px: 84, color: '#f3e2c2', height: 0.48 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [0, 9.5, 6.5], look: [0, 0, -0.2] },
      { t: 2.7, pos: [0.4, 10.0, 5.5], look: [0.2, 0, -0.3] },
      { t: 7.6, pos: [0.0, 10.5, 6.0], look: [0, 0, -0.2] },
      { t: 9.2, pos: [5.0, 7.5, 6.5], look: [5.0, 0.3, 0.1] },
      { t: 11, pos: [5.6, 7.0, 6.2], look: [5.6, 0.4, 0.3] },
    ], S.camera);
    const UP = new T.Vector3(0, 1, 0), Q = new T.Quaternion(), V = new T.Vector3(), SC = new T.Vector3();
    return (t, realT) => {
      cam(t);
      let hp = nailP(1).clone(), drawing = false;
      for (let i = 0; i < N; i++) {
        const a = nailP(i), b = nailP((2 * i) % N), s0 = tStart(i), d = tDur(i), p = K.prog(t, s0, s0 + d, i < 3 ? 'inOut' : null);
        const dir = b.clone().sub(a), len = dir.length();
        if (len < 1e-6 || p <= 0) { chords.setMatrixAt(i, MX.makeScale(0, 0, 0)); continue; }
        Q.setFromUnitVectors(UP, dir.normalize());
        chords.setMatrixAt(i, MX.compose(V.copy(a).setY(0.18 + (i % 3) * 0.004), Q, SC.set(1, len * p, 1)));
        if (t >= s0) { hp = a.clone().lerp(b, p); drawing = p < 1; }
      }
      chords.instanceMatrix.needsUpdate = true;
      head.position.set(hp.x, 0.2 + 0.05 * Math.sin(realT * 6), hp.z); spool.rotation.y = realT * 8; hl.intensity = drawing ? 2.5 : 1.0;
      head.visible = t > B[1] && t < B[3] + 0.4;
      tags.forEach((l, i) => { l.material.opacity = (i === 4 ? 1 : K.prog(t, B[1] + 0.1, B[1] + 0.5)) * (1 - K.prog(t, B[2] + 0.5, B[2] + 1)); l.visible = l.material.opacity > 0.01; });
      const glow = K.prog(t, B[3] + 0.9, B[3] + 1.6);
      causMat.opacity = 0.9 * glow; causGlow.material.opacity = 0.25 * glow * (0.85 + 0.15 * Math.sin(realT * 2));
      steam.forEach((m, i) => { m.position.y = 1.3 + ((realT * 0.25 + i * 0.3) % 0.6); m.material.opacity = 0.22 * (1 - ((realT * 0.25 + i * 0.3) % 0.6) / 0.6); });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t), N = this.nails;
    k.bed('room', { gain: 0.06 });
    for (let i = 0; i < 6; i++) k.play('metal', { t: 0.3 + i * 0.12, gain: 0.08, pitch: 1.6 + i * 0.05 });
    for (let i = 0; i < 3; i++) { k.play('swish', { t: B[1] + 0.2 + i * 0.75, gain: 0.2, pitch: 1.4, dur: 0.6 }); k.play('pluck', { t: B[1] + 0.8 + i * 0.75, gain: 0.3, pitch: 1 + i * 0.25, music: true }); }
    for (let i = 3; i < N; i += 3) { const s = B[2] - 0.2 + Math.pow((i - 3) / (N - 3), 0.8) * (B[3] - B[2] + 0.2); k.play('pluck', { t: s + 0.06, gain: 0.12, pitch: 1 + (i / N), music: true }); k.play('tick', { t: s + 0.06, gain: 0.12, pitch: 1.3 }); }
    k.play('sparkle', { t: B[3] + 1.0, gain: 0.25 });
    k.play('chime', { t: B[3] + 1.3, gain: 0.2, pitch: 1.0, music: true });
  },
  post: null,
};
