window.STYLES = window.STYLES || {};
STYLES['flip-disc'] = {
  id: 'flip-disc', name: 'Flip-Disc Wall',
  family: 'Flat content made physical',
  use: 'Story',
  look: 'A wall of round discs, black on one side and fluorescent yellow on the other, like an old bus sign, in a black steel case. Each disc is one pixel; the yellow faces catch a soft light.',
  motion: 'Pictures form as waves of discs flip over, each with a click. A new picture sweeps in over the old one from one side.',
  shownHere: 'The history of the pixel: the first scanned digital photo in 1957, chunky sprites of early games, bitmap letters on the first home screens, and millions of pixels on a phone today.',
  goodFor: 'Anything about images, screens, data and resolution, and any story that can be told in simple icons and short words.',
  fonts: ['Silkscreen:wght@400;700'],
  duration: 11,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: '1957: the first digital photo' },
    { t: 2.7, label: '1970s: game sprites' },
    { t: 5.4, label: '1980s: bitmap letters' },
    { t: 8.1, label: 'Today: millions on one phone' },
  ],
  word: 'HELLO', last: 'PIXEL',

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Silkscreen';
    scene.background = new T.Color('#121315'); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 8, target: [0, 0, 0] }); L.key.position.set(-4, 6, 9); L.key.intensity = 2.0; L.amb.intensity = 0.4; S.scene.environmentIntensity = 0.5;
    const COLS = 48, ROWS = 27, P = 0.2, R = 0.086;
    // pictures, drawn at disc resolution
    const G = { H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'], E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'], L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'], O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'], P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'], I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'], X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'] };
    const pic = draw => { const c = document.createElement('canvas'); c.width = COLS; c.height = ROWS; const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, COLS, ROWS); g.fillStyle = '#fff'; draw(g); const d = g.getImageData(0, 0, COLS, ROWS).data; return Array.from({ length: COLS * ROWS }, (_, i) => d[i * 4] > 110 ? 1 : 0); };
    const text = (g, s, x, y) => { [...s].forEach((ch, k) => G[ch].forEach((row, j) => [...row].forEach((b, i) => { if (b === '1') g.fillRect(x + k * 6 + i, y + j, 1, 1); }))); };
    const pics = [
      pic(g => { // a baby's face, as in the first scanned photo
        g.beginPath(); g.arc(24, 14, 10.5, 0, 7); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.arc(24, 14, 9.2, 0, 7); g.fill(); g.fillStyle = '#fff';
        g.fillRect(19, 11, 3, 2); g.fillRect(27, 11, 3, 2); g.fillRect(23, 15, 2, 2); g.fillRect(20, 19, 2, 1); g.fillRect(22, 20, 4, 1); g.fillRect(26, 19, 2, 1);
        g.fillRect(14, 4, 3, 2); g.fillRect(31, 4, 3, 2); g.fillRect(20, 2, 8, 2);
        for (let i = 0; i < 26; i++) { const x = (i * 17) % 48, y = (i * 11) % 27; if (Math.hypot(x - 24, y - 14) > 12) g.fillRect(x, y, 1, 1); } }),
      pic(g => { // a rocket sprite among stars
        g.fillRect(22, 4, 4, 2); g.fillRect(21, 6, 6, 12); g.fillRect(18, 14, 3, 6); g.fillRect(27, 14, 3, 6); g.fillRect(22, 18, 4, 3); g.fillStyle = '#000'; g.fillRect(23, 9, 2, 2); g.fillStyle = '#fff'; g.fillRect(23, 22, 2, 3);
        [[5, 5], [10, 18], [38, 6], [42, 20], [33, 2], [14, 9], [36, 14], [7, 24], [44, 11]].forEach(([x, y]) => { g.fillRect(x, y, 1, 1); g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); }); }),
      pic(g => { text(g, this.word, 10, 10); g.fillRect(9, 19, 31, 1); g.fillRect(40, 10, 1, 7); }),
      pic(g => { // a phone with a grid of tiny pixels, and the word
        g.fillRect(4, 3, 12, 21); g.fillStyle = '#000'; g.fillRect(5, 4, 10, 17); g.fillStyle = '#fff'; for (let y = 5; y < 20; y += 2) for (let x = 6 + (y % 4 ? 1 : 0); x < 14; x += 2) g.fillRect(x, y, 1, 1); g.fillRect(9, 22, 2, 1);
        text(g, this.last, 19, 10); }),
    ];
    // the case
    const cw = COLS * P + 0.8, ch = ROWS * P + 0.8;
    const box = new T.Mesh(new T.BoxGeometry(cw, ch, 0.5), new T.MeshStandardMaterial({ color: '#1b1c1f', metalness: 0.6, roughness: 0.5 })); box.position.z = -0.3; box.castShadow = true; scene.add(box);
    const back = new T.Mesh(new T.PlaneGeometry(COLS * P + 0.1, ROWS * P + 0.1), new T.MeshStandardMaterial({ color: '#050506', roughness: 0.9 })); back.position.z = -0.04; scene.add(back);
    const plate = K.label('LINE 7  ·  CITY CENTRE', { font: F, weight: 700, px: 56, color: '#ffd400', bg: '#0d0d0f', radius: 6, pad: 0.4, height: 0.32 }); plate.position.set(-cw / 2 + plate.userData.w / 2 + 0.2, ch / 2 + 0.28, -0.04); scene.add(plate);
    // the discs: yellow face toward the camera when on
    const geo = new T.CylinderGeometry(R, R, 0.02, 20).rotateX(Math.PI / 2);
    const yel = new T.MeshStandardMaterial({ color: '#ffd400', roughness: 0.35, emissive: '#ffb000', emissiveIntensity: 0.25 }), blk = new T.MeshStandardMaterial({ color: '#0c0c0d', roughness: 0.6 });
    const discs = new T.InstancedMesh(geo, [blk, yel, blk], COLS * ROWS); scene.add(discs);
    // CylinderGeometry groups: 0 side, 1 top cap (+y, after the turn +z = yellow), 2 bottom cap
    const axles = new T.InstancedMesh(new T.CylinderGeometry(0.008, 0.008, P * 0.95, 4).rotateZ(Math.PI / 2), new T.MeshStandardMaterial({ color: '#2a2a2e' }), COLS * ROWS); scene.add(axles);
    const pos = (i) => [(i % COLS - (COLS - 1) / 2) * P, ((ROWS - 1) / 2 - Math.floor(i / COLS)) * P];
    const MX = new T.Matrix4(), Q = new T.Quaternion(), E = new T.Euler(), V = new T.Vector3(), SC = new T.Vector3(1, 1, 1);
    for (let i = 0; i < COLS * ROWS; i++) { const [x, y] = pos(i); axles.setMatrixAt(i, MX.makeTranslation(x, y, 0.0)); }
    // flip timing: a wave sweeps across the wall at each beat
    const jr = K.rng(5), jit = Array.from({ length: COLS * ROWS }, () => jr.range(0, 0.08));
    const waveOrigin = [[0, 0], [-1, 0], [0, 1], [1, 0]];
    const flipT = (k, i) => { const [x, y] = pos(i), [ox, oy] = waveOrigin[k]; const d = ox ? (ox < 0 ? x + 5 : 5 - x) / 10 : oy ? (oy > 0 ? 3 - y : y + 3) / 6 : Math.hypot(x, y) / 5.5; return (k === 0 ? 0.2 : B[k] + 0.15) + d * 1.3 + jit[i]; };
    const FD = 0.12;
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 72, color: '#ffd400', bg: 'rgba(0,0,0,0.85)', radius: 8, pad: 0.35, height: 0.32 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, -1.72, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [-1.6, 0.2, 12.6], look: [0, -0.55, 0] },
      { t: 5.5, pos: [1.2, -0.1, 12.2], look: [0, -0.6, 0] },
      { t: 11, pos: [0.3, -0.2, 13.0], look: [0, -0.6, 0] },
    ], S.camera);
    const state0 = new Uint8Array(COLS * ROWS);
    return (t, realT) => {
      cam(t);
      for (let i = 0; i < COLS * ROWS; i++) {
        let on = 0, ang = 0;
        for (let k = 0; k < pics.length; k++) {
          const nxt = pics[k][i], prev = k === 0 ? nxt : pics[k - 1][i];
          if (prev === nxt) { if (t >= (k === 0 ? 0 : B[k])) on = nxt; continue; }
          const ft = flipT(k, i);
          if (t >= ft + FD) on = nxt; else if (t >= ft) { on = prev; ang = K.ease.inOut((t - ft) / FD) * Math.PI; }
          else if (t >= (k === 0 ? 0 : B[k])) on = prev;
        }
        const [x, y] = pos(i);
        E.set((on ? 0 : Math.PI) + ang, 0, 0); Q.setFromEuler(E);
        discs.setMatrixAt(i, MX.compose(V.set(x, y, 0.03), Q, SC));
      }
      discs.instanceMatrix.needsUpdate = true;
      yel.emissiveIntensity = 0.22 + 0.04 * Math.sin(realT * 2);
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.05 });
    B.forEach((b, i) => { const s = i === 0 ? 0.2 : b + 0.15; for (let j = 0; j < 30; j++) k.play('click', { t: s + j * 0.045 + (j % 4) * 0.01, gain: 0.18, pitch: 0.8 + ((j * 5) % 7) * 0.06, pan: i % 2 ? 0.6 - j / 30 * 1.2 : -0.6 + j / 30 * 1.2 }); });
    k.play('blip', { t: B[1] + 1.6, gain: 0.25, pitch: 1.0, music: true });
    k.play('blip', { t: B[1] + 1.75, gain: 0.25, pitch: 1.5, music: true });
    k.play('chime', { t: B[3] + 1.8, gain: 0.2, pitch: 1.0, music: true });
  },
  post: null,
};
