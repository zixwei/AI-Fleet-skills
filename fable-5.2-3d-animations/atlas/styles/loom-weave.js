window.STYLES = window.STYLES || {};
STYLES['loom-weave'] = {
  id: 'loom-weave', name: 'Loom Weave',
  family: 'Flat content made physical',
  use: 'Story',
  look: 'A tapestry on a wooden loom, filmed close: cream warp threads under tension, coloured weft threads packed over and under them, a wooden shuttle and a beater bar. Warm light from one side shows every thread.',
  motion: 'The picture appears row by row from the bottom as the shuttle crosses and the beater packs each row down. At the end the woven path lights up.',
  shownHere: 'How the internet routes a message: it splits into packets, routers pass them hop by hop, packets can take different paths, and they meet again at the server.',
  goodFor: 'Stories that build up from the bottom over time: history, growth, networks, family trees. The order of the rows is the order of the story.',
  fonts: ['Lora:wght@600;700'],
  duration: 11,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Your message splits into packets' },
    { t: 2.7, label: 'Routers pass them on, hop by hop' },
    { t: 5.4, label: 'Packets can take different paths' },
    { t: 8.1, label: 'They meet again at the server' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Lora';
    scene.background = new T.Color('#160f0b'); scene.fog = new T.Fog('#160f0b', 14, 30); scene.add(S.camera);
    const L = K.lights(S, 'lamp', { size: 6, target: [0, 2.4, 0] }); L.key.position.set(-7, 6, 5); L.key.intensity = 3.0; L.amb.intensity = 0.5; S.scene.environmentIntensity = 0.4;
    const COLS = 64, ROWS = 40, CW = 0.1, RH = 0.11, W = COLS * CW, H = ROWS * RH, Y0 = 0.4;
    // the picture, at thread resolution
    const c = document.createElement('canvas'); c.width = COLS; c.height = ROWS; const g = c.getContext('2d');
    g.fillStyle = '#3a1f3a'; g.fillRect(0, 0, COLS, ROWS);
    g.fillStyle = '#4a2a48'; for (let y = 0; y < ROWS; y += 4) g.fillRect(0, y, COLS, 1);
    const P = { gold: '#f2b84b', teal: '#4cc2b8', cream: '#f2e6cc', red: '#d9534a', blue: '#5a7fd6' };
    // bottom: a laptop and packets
    g.fillStyle = P.cream; g.fillRect(6, ROWS - 9, 12, 7); g.fillStyle = '#3a1f3a'; g.fillRect(7, ROWS - 8, 10, 5); g.fillStyle = P.cream; g.fillRect(4, ROWS - 2, 16, 1);
    [[22, ROWS - 6, P.gold], [25, ROWS - 7, P.teal], [28, ROWS - 5, P.gold], [31, ROWS - 7, P.teal]].forEach(([x, y, col]) => { g.fillStyle = col; g.fillRect(x, y, 2, 2); });
    // middle: routers and links
    const R = [[12, 24], [30, 26], [48, 23], [20, 15], [40, 14], [56, 16]];
    g.strokeStyle = '#8a6a8a'; g.lineWidth = 1; [[0, 1], [1, 2], [0, 3], [1, 3], [1, 4], [2, 4], [2, 5], [3, 4], [4, 5]].forEach(([a, b]) => { g.beginPath(); g.moveTo(R[a][0] + 0.5, R[a][1] + 0.5); g.lineTo(R[b][0] + 0.5, R[b][1] + 0.5); g.stroke(); });
    // two paths: gold via 0-3-4-5, teal via 1-2-5
    const path = (pts, col) => { g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x + 0.5, y + 0.5) : g.moveTo(x + 0.5, y + 0.5)); g.stroke(); };
    path([[12, 33], R[0], R[3], R[4], R[5], [56, 6]], P.gold); path([[16, 33], R[1], R[2], R[5]], P.teal);
    R.forEach(([x, y]) => { g.fillStyle = P.blue; g.fillRect(x - 1, y - 1, 3, 3); g.fillStyle = P.cream; g.fillRect(x, y, 1, 1); });
    // top: the server
    g.fillStyle = P.cream; g.fillRect(52, 1, 9, 9); g.fillStyle = '#3a1f3a'; [3, 5, 7].forEach(y => g.fillRect(53, y, 7, 1)); g.fillStyle = P.red; g.fillRect(58, 2, 1, 1);
    const img = g.getImageData(0, 0, COLS, ROWS).data;
    const isPath = (x, y) => { const k = (y * COLS + x) * 4; return (Math.abs(img[k] - 0xf2) < 8 && Math.abs(img[k + 1] - 0xb8) < 12) || (Math.abs(img[k] - 0x4c) < 10 && Math.abs(img[k + 1] - 0xc2) < 12); };
    // warp: vertical threads from the bottom beam to the top beam
    const warpH = H + 2.6;
    const warp = new T.InstancedMesh(new T.CylinderGeometry(0.018, 0.018, warpH, 6), new T.MeshStandardMaterial({ color: '#efe3c8', roughness: 0.9 }), COLS); warp.castShadow = true;
    const MX = new T.Matrix4(), Q = new T.Quaternion(), V = new T.Vector3(), SC = new T.Vector3(1, 1, 1), col = new T.Color();
    for (let i = 0; i < COLS; i++) warp.setMatrixAt(i, MX.makeTranslation(-W / 2 + (i + 0.5) * CW, Y0 + warpH / 2 - 0.4, 0)); scene.add(warp);
    // weft: one short thread for each cell, over and under the warp
    const weftGeo = new T.CapsuleGeometry(0.052, CW * 0.62, 4, 8).rotateZ(Math.PI / 2);
    const weft = new T.InstancedMesh(weftGeo, new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.85, emissive: '#ffffff', emissiveIntensity: 0 }), COLS * ROWS); weft.castShadow = weft.receiveShadow = true; weft.frustumCulled = false; scene.add(weft);
    const glowW = new T.InstancedMesh(weftGeo, new T.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false }), COLS * ROWS); glowW.frustumCulled = false; scene.add(glowW);
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { const k = ((ROWS - 1 - y) * COLS + x) * 4; col.setRGB(img[k] / 255, img[k + 1] / 255, img[k + 2] / 255).convertSRGBToLinear(); col.offsetHSL(0, 0, ((x * 7 + y * 13) % 5 - 2) * 0.01); weft.setColorAt(y * COLS + x, col); }
    // the loom: beams, posts, a heddle bar and a beater, all in warm wood
    const wood = new T.MeshStandardMaterial({ color: '#8a5a34', roughness: 0.55, map: K.canvasTex(512, 64, (gg, r, w, h) => { gg.fillStyle = '#8a5a34'; gg.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { gg.strokeStyle = `rgba(40,20,8,${r.range(0.1, 0.3)})`; gg.beginPath(); const y = r() * h; gg.moveTo(0, y); gg.lineTo(w, y + r.range(-4, 4)); gg.stroke(); } }, 3) });
    const beam = (y, d = 0.3) => { const m = new T.Mesh(new T.CylinderGeometry(d, d, W + 1.6, 24), wood); m.rotation.z = Math.PI / 2; m.position.set(0, y, 0); m.castShadow = m.receiveShadow = true; scene.add(m); return m; };
    beam(Y0 - 0.55, 0.32); beam(Y0 + warpH - 0.3, 0.32);
    [-1, 1].forEach(s => { const p = new T.Mesh(new T.BoxGeometry(0.35, warpH + 2.0, 0.35), wood); p.position.set(s * (W / 2 + 0.6), Y0 + warpH / 2 - 0.6, -0.1); p.castShadow = true; scene.add(p); });
    const beater = new T.Mesh(new T.BoxGeometry(W + 0.6, 0.12, 0.18), wood); beater.castShadow = true; scene.add(beater);
    const shuttle = new T.Group(); scene.add(shuttle);
    const sh = new T.Mesh(new T.SphereGeometry(0.3, 20, 12), wood); sh.scale.set(2.4, 0.45, 0.6); shuttle.add(sh);
    const bob = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, 0.5, 12), new T.MeshStandardMaterial({ color: '#f2b84b', roughness: 0.8 })); bob.rotation.z = Math.PI / 2; bob.position.y = 0.08; shuttle.add(bob);
    shuttle.traverse(o => { o.castShadow = true; });
    const tail = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 1, 5), new T.MeshStandardMaterial({ color: '#f2b84b' })); scene.add(tail);
    // yarn balls on the floor of the frame
    [[-2.6, P.gold], [-1.8, P.teal], [-1.1, P.cream], [2.4, P.blue]].forEach(([x, cc], i) => { const m = new T.Mesh(new T.SphereGeometry(0.28, 20, 14), new T.MeshStandardMaterial({ color: cc, roughness: 0.95 })); m.position.set(x, -0.62, 1.1 + (i % 2) * 0.3); m.castShadow = true; scene.add(m); });
    const floor = new T.Mesh(new T.PlaneGeometry(30, 20), new T.MeshStandardMaterial({ color: '#2a1d14', roughness: 0.9 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.9; floor.receiveShadow = true; scene.add(floor);
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 84, color: '#f6e7cc', height: 0.46 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    // rows woven by time: 6 rows at the start, all 40 by 9.6 s
    const rowsAt = t => 6 + 34 * K.clamp(t / 9.6);
    const look = new T.Vector3();
    return (t, realT) => {
      const rw = rowsAt(t), full = Math.floor(rw), frac = rw - full, rowY = r => Y0 + (r + 0.5) * RH;
      const end = K.prog(t, 9.0, 11, 'inOut');
      const cy = K.lerp(Math.max(Y0 + 1.6, rowY(Math.min(full, ROWS - 1))), Y0 + H / 2 + 0.3, end);
      S.camera.position.set(K.lerp(-1.2, 0.5, t / 11), cy + 1.0 + 0.3 * end, K.lerp(7.0, 9.6, end)); look.set(K.lerp(-0.2, 0.1, t / 11), cy - 0.7 * (1 - end), 0); S.camera.lookAt(look); S.camera.userData.look = look;
      const lit = K.prog(t, B[3] + 0.9, B[3] + 1.8);
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
        const n = y * COLS + x, on = y < full ? 1 : y === full ? (x / COLS < (y % 2 ? 1 - frac : frac) === (y % 2 === 0) ? 1 : 0) : 0;
        const z = ((x + y) % 2 ? 0.03 : -0.03);
        weft.setMatrixAt(n, MX.compose(V.set(-W / 2 + (x + 0.5) * CW, rowY(y), z), Q, SC.setScalar(on ? 1 : 0.0001)));
        const gp = on && isPath(x, ROWS - 1 - y) ? lit * (0.6 + 0.4 * Math.sin(realT * 3 + y * 0.3 - x * 0.1)) : 0;
        glowW.setMatrixAt(n, MX.compose(V, Q, SC.setScalar(gp > 0.02 ? 1.25 : 0.0001)));
      }
      weft.instanceMatrix.needsUpdate = glowW.instanceMatrix.needsUpdate = true; glowW.material.opacity = 0.55 * lit;
      // shuttle crosses the current row (direction alternates), beater packs it down at the row end
      const dir = full % 2 ? -1 : 1, sx = (frac - 0.5) * (W + 1.2) * dir;
      shuttle.position.set(sx, rowY(Math.min(full, ROWS - 1)) + 0.05, 0.22); shuttle.rotation.z = 0.04 * Math.sin(realT * 20); shuttle.visible = full < ROWS;
      const tx0 = -W / 2 * dir, len = Math.abs(sx - tx0); tail.visible = shuttle.visible; tail.position.set((sx + tx0) / 2, shuttle.position.y, 0.05); tail.rotation.z = Math.PI / 2; tail.scale.y = Math.max(0.01, len);
      const beat = Math.max(0, 1 - Math.abs(frac - 0.98) * 12);
      beater.position.set(0, rowY(Math.min(full, ROWS - 1)) + 0.35 - 0.25 * beat, 0.25);
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.07 });
    for (let r = 6; r < 40; r++) { const t = (r - 6 + 0.98) / 34 * 9.6; k.play('wood', { t, gain: 0.3, pitch: 0.8 + (r % 3) * 0.08 }); k.play('swish', { t: t - 0.2, gain: 0.08, pitch: 1.3, dur: 0.3, pan: r % 2 ? 0.5 : -0.5 }); }
    k.play('chime', { t: B[3] + 1.0, gain: 0.25, pitch: 1.0, music: true });
    k.play('sparkle', { t: B[3] + 1.2, gain: 0.2 });
  },
  post: null,
};
