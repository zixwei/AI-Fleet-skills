window.STYLES = window.STYLES || {};
STYLES['endless-library'] = {
  id: 'endless-library', name: 'Endless Library',
  family: 'Strange worlds',
  use: 'Explainer',
  look: 'Six-sided rooms lined with bookshelves repeat in every direction into a warm haze. Brass reading lamps with green shades glow on the tables. Doorways open from each room into the next.',
  motion: 'The camera glides from room to room. An index card hangs in the air with an address. One book slides off its shelf, flies to the camera and opens; its pages fan out and stand up in a ranked row.',
  shownHere: 'How a search index finds one page: the web is billions of pages on endless shelves; an index lists every word and where it appears; the search jumps straight to the right shelf; the book opens at the page; the most useful pages are ranked first.',
  goodFor: 'Search, retrieval and knowledge: indexes, databases, archives, memory, "finding the one thing among millions".',
  fonts: ['Cormorant Garamond:wght@600;700', 'IBM Plex Mono:wght@500'],
  duration: 12,
  samples: 4,
  // CONTENT
  word: 'lighthouse',
  address: 'room 2 · shelf 3 · book 41 · page 88',
  beats: [
    { t: 0.0, label: 'Billions of pages on endless shelves' },
    { t: 2.4, label: 'An index lists every word, and where it is' },
    { t: 4.8, label: 'The search jumps straight to that shelf' },
    { t: 7.2, label: 'The book opens at the page' },
    { t: 9.6, label: 'The most useful pages are ranked first' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), FS = 'Cormorant Garamond', FM = 'IBM Plex Mono', BE = this.beats;
    scene.background = new T.Color('#3a2a1a'); scene.fog = new T.Fog('#4a3420', 8, 34); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#ffe0b0', '#2a1a10', 0.9));
    const std = (c, r = 0.7, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const spines = K.canvasTex(512, 512, (g, r, w, h) => { g.fillStyle = '#2a1a10'; g.fillRect(0, 0, w, h); for (let row = 0; row < 5; row++) { let x = 0; const y0 = row * h / 5; while (x < w) { const bw = r.range(8, 20); g.fillStyle = `hsl(${r() < 0.5 ? r.range(0, 40) : r.range(180, 240)}, ${r.range(30, 60)}%, ${r.range(20, 40)}%)`; g.fillRect(x, y0 + r.range(8, 20), bw - 1, h / 5 - 24); g.fillStyle = 'rgba(230,200,120,0.5)'; g.fillRect(x + 2, y0 + 40, bw - 5, 3); x += bw; } g.fillStyle = '#5a3a20'; g.fillRect(0, y0 + h / 5 - 8, w, 8); } }, 3);
    spines.wrapS = T.RepeatWrapping;
    const shelfMat = std('#ffffff', 0.8, { map: spines }), woodM = std('#5a3a20', 0.6), floorM = std('#6a4a2a', 0.8);
    // one hexagonal room: shelves on six walls, doorways in three of them, a table with a lamp
    const AP = 4.0, SIDE = 2 * AP / Math.sqrt(3), WH = 4.2;
    const room = (cx, cz) => { const g = new T.Group(); g.position.set(cx, 0, cz); scene.add(g);
      const fl = new T.Mesh(new T.CircleGeometry(SIDE, 6), floorM); fl.rotation.x = -Math.PI / 2; fl.rotation.z = Math.PI / 6; g.add(fl);
      for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3, wg = new T.Group(); wg.rotation.y = -a; g.add(wg); const door = true;
        const seg = (w, x) => { const m = new T.Mesh(new T.BoxGeometry(w, WH, 0.4), [woodM, woodM, woodM, woodM, shelfMat, woodM]); m.position.set(x, WH / 2, AP - 0.2); m.rotation.y = Math.PI; wg.add(m); };
        if (door) { seg(SIDE * 0.3, -SIDE * 0.35); seg(SIDE * 0.3, SIDE * 0.35); const lin = new T.Mesh(new T.BoxGeometry(SIDE * 0.4, 1.0, 0.4), woodM); lin.position.set(0, WH - 0.5, AP - 0.2); wg.add(lin); } else seg(SIDE, 0); }
      const tbl = new T.Mesh(new T.CylinderGeometry(0.9, 0.9, 0.08, 24), woodM); tbl.position.set(-1.9, 0.9, -1.0); const leg = new T.Mesh(new T.CylinderGeometry(0.1, 0.14, 0.9, 10), woodM); leg.position.set(-1.9, 0.45, -1.0); g.add(tbl, leg);
      const shade = new T.Mesh(new T.SphereGeometry(0.28, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), std('#1a6a3a', 0.4, { emissive: '#2a8a4a', emissiveIntensity: 0.5, side: T.DoubleSide })); shade.position.set(-1.6, 1.5, -1.0); const bulb = new T.Mesh(new T.SphereGeometry(0.1, 10, 8), std('#fff', 0.3, { emissive: '#ffe0a0', emissiveIntensity: 2 })); bulb.position.set(-1.6, 1.45, -1.0); const stem = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.6, 6), std('#c9a04a', 0.3, { metalness: 1 })); stem.position.set(-1.6, 1.2, -1.0); g.add(shade, bulb, stem);
      return g; };
    // a patch of the hex grid: every wall has a doorway, so you see from room to room
    const centres = [];
    const dir = k => [Math.sin(k * Math.PI / 3), Math.cos(k * Math.PI / 3)];
    const seen = new Set(), queue = [[0, 0, 0]]; while (queue.length && centres.length < 19) { const [x, z, d] = queue.shift(), key = `${Math.round(x)}:${Math.round(z)}`; if (seen.has(key)) continue; seen.add(key); centres.push([x, z]); if (d < 2) for (let k = 0; k < 6; k++) { const [dx, dz] = dir(k); queue.push([x + dx * 2 * AP, z + dz * 2 * AP, d + 1]); } }
    centres.forEach(([x, z]) => room(x, z));
    const lampL = new T.PointLight('#ffd8a0', 30, 14, 1.4); lampL.position.set(-1.6, 2.0, -1.0); scene.add(lampL);
    // the target room is the neighbour through the doorway straight ahead (+z); its book sits on a shelf
    const R2 = new T.Vector3(0, 0, 2 * AP);
    const book = new T.Group(); scene.add(book);
    const coverMat = std('#8a1a2a', 0.5, { emissive: '#ff6a3a', emissiveIntensity: 0 });
    const halves = [-1, 1].map(s => { const piv = new T.Group(); book.add(piv); const c = new T.Mesh(new T.BoxGeometry(0.45, 0.62, 0.03), coverMat); c.position.set(s * 0.225, 0, 0); piv.add(c); const pg = new T.Mesh(new T.BoxGeometry(0.42, 0.58, 0.06), std('#f4ecd8', 0.9)); pg.position.set(s * 0.215, 0, 0.04); piv.add(pg); return { piv, s }; });
    const shelfSpot = R2.clone().add(new T.Vector3(0.8, 2.1, AP - 0.62)); // on the far wall of the next room, seen through two doorways
    // ranked pages that stand up out of the open book
    const pageTex = (n, title) => K.canvasTex(256, 340, (g, r, w, h) => { g.fillStyle = '#f8f2e2'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a1a10'; g.font = `700 70px "${FS}"`; g.textAlign = 'center'; g.fillText(`#${n}`, w / 2, 80); g.font = `600 30px "${FS}"`; g.fillText(title, w / 2, 130); g.fillStyle = 'rgba(60,40,20,0.35)'; for (let k = 0; k < 8; k++) g.fillRect(30, 170 + k * 20, r.range(120, 196), 6); }, 70 + n);
    const ranked = [[1, 'lighthouse', 0, 0.36], [2, 'lighthouse keeper', -0.55, 0.22], [3, 'lighthouse lens', 0.55, 0.14]].map(([n, title, x, h]) => { const m = new T.Mesh(new T.PlaneGeometry(0.42, 0.56), std('#ffffff', 0.9, { map: pageTex(n, title), side: T.DoubleSide })); m.userData = { x, h }; m.visible = false; scene.add(m); return m; });
    const card1 = K.label(`index: "${this.word}"`, { font: FM, weight: 500, px: 52, color: '#2a1a10', bg: 'rgba(250,240,215,0.95)', radius: 6, pad: 0.22, height: 0.16 }), card2 = K.label(this.address, { font: FM, weight: 500, px: 46, color: '#6a2a10', bg: 'rgba(250,240,215,0.95)', radius: 6, pad: 0.22, height: 0.13 });
    [card1, card2].forEach(c => { c.visible = false; scene.add(c); });
    const titles = BE.map(b => { const l = K.label(b.label, { font: FS, weight: 700, px: 70, color: '#fff2dc', bg: 'rgba(30,18,10,0.82)', radius: 10, pad: 0.35, height: 0.4 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [1.3, 2.0, -2.6], look: [0.2, 1.9, 6.0] },
      { t: 2.4, pos: [1.0, 1.9, -1.6], look: [0.2, 1.9, 6.0] },
      { t: 4.8, pos: [0.6, 1.9, -0.8], look: [0.5, 2.0, 11.0] },
      { t: 6.9, pos: [0.4, 2.0, 7.0], look: [0.8, 2.1, 11.6] },
      { t: 9.6, pos: [0.5, 2.0, 7.4], look: [0.8, 2.0, 11.6] },
      { t: 12, pos: [0.5, 2.1, 7.0], look: [0.8, 2.0, 11.6] },
    ], S.camera);
    const P = new T.Vector3(), front = new T.Vector3();
    return (t, realT) => {
      cam(t);
      lampL.intensity = 30 * (0.95 + 0.05 * Math.sin(realT * 7));
      // the index card hangs in front of the camera during beat 1 and 2
      const cOn = K.prog(t, B[1] + 0.2, B[1] + 0.6) * (1 - K.prog(t, B[3] - 0.2, B[3] + 0.2));
      front.set(0, 0.1, -3.0).applyQuaternion(S.camera.quaternion).add(S.camera.position);
      card1.visible = card2.visible = cOn > 0.01; card1.position.copy(front).add(new T.Vector3(0, 0.05, 0)); card2.position.copy(front).add(new T.Vector3(0, -0.2, 0)); [card1, card2].forEach(c => { c.quaternion.copy(S.camera.quaternion); c.material.opacity = cOn; });
      // the book: glows on its shelf, slides out, flies to the camera, opens
      const glow = K.prog(t, B[2] + 0.6, B[2] + 1.2) * (1 - K.prog(t, B[3] + 1.0, B[3] + 1.4)); coverMat.emissiveIntensity = 0.8 * glow * (0.7 + 0.3 * Math.sin(realT * 8));
      const fly = K.prog(t, B[3] + 0.0, B[3] + 1.2, 'inOut'), open = K.prog(t, B[3] + 1.1, B[3] + 1.8, 'out');
      front.set(0, -0.42, -2.6).applyQuaternion(S.camera.quaternion).add(S.camera.position);
      P.lerpVectors(shelfSpot, front, fly); P.y += 0.4 * Math.sin(Math.PI * fly); book.position.copy(P);
      book.quaternion.copy(S.camera.quaternion); book.rotateY(Math.PI / 2 * (1 - fly)); book.rotateX(-0.5 * open);
      halves.forEach(h => { h.piv.rotation.y = -h.s * (Math.PI / 2 - 0.05) * (1 - open); });
      ranked.forEach((m, i) => { const u = K.prog(t, B[4] + 0.2 + i * 0.25, B[4] + 0.9 + i * 0.25, 'back'); m.visible = u > 0.01; const { x, h } = m.userData; m.position.copy(book.position).add(new T.Vector3(x, 0.15 + h * u, 0).applyQuaternion(S.camera.quaternion)); m.quaternion.copy(S.camera.quaternion); m.scale.setScalar(Math.max(0.01, u)); });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.06 }); k.bed('wind', { gain: 0.02 });
    k.play('paper', { t: 0.4, gain: 0.12, pitch: 0.8 }); k.play('bell', { t: 0.6, gain: 0.1, pitch: 0.5, music: true });
    k.play('paper', { t: B[1] + 0.3, gain: 0.2, pitch: 1.4 }); k.play('tick', { t: B[1] + 0.8, gain: 0.15, pitch: 1.6 }); k.play('tick', { t: B[1] + 1.0, gain: 0.15, pitch: 1.7 });
    k.play('whoosh', { t: B[2] + 0.1, gain: 0.15, pitch: 0.6, dur: 1.8 }); k.play('chime', { t: B[2] + 0.9, gain: 0.12, pitch: 1.2, music: true });
    k.play('wood', { t: B[3] + 0.05, gain: 0.25, pitch: 1.0 }); k.play('swish', { t: B[3] + 0.2, gain: 0.2, pitch: 0.8, dur: 1.0 }); k.play('paper', { t: B[3] + 1.2, gain: 0.3, pitch: 0.9, dur: 0.8 });
    [0, 1, 2].forEach(i => k.play('paper', { t: B[4] + 0.4 + i * 0.25, gain: 0.2, pitch: 1.3 + i * 0.1 })); k.play('chime', { t: B[4] + 1.4, gain: 0.15, pitch: 1.0, music: true });
  },
  post: null,
};
