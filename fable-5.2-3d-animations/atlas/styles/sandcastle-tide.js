window.STYLES = window.STYLES || {};
STYLES['sandcastle-tide'] = {
  id: 'sandcastle-tide', name: 'Sandcastle Tide',
  family: 'Earth, weather and sky',
  use: 'Story',
  look: 'A beach in low evening sun. Wet-sand castles stand on the shore, made with bucket moulds, with long shadows. Thin sheets of sea water slide up the sand with a line of foam, and foam-white words are written on the sand.',
  motion: 'A red bucket comes down, lifts, and leaves a tower behind. Then a thin sheet of water comes in, the towers soften and slump, and the water slides back leaving dark wet sand. The camera moves along the beach.',
  shownHere: 'Why backups matter: your work stands on the beach; a backup is the same mould used again, higher up the beach; the tide comes in and the original melts away; the backup is still standing, and you rebuild from it.',
  goodFor: 'Risk, loss and recovery stories: backups, insurance, redundancy, impermanence, "what if it is gone tomorrow".',
  fonts: ['Caveat Brush', 'Nunito:wght@800'],
  duration: 12,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Your work: a castle by the sea' },
    { t: 2.4, label: 'A backup: the same mould, higher up the beach' },
    { t: 4.8, label: 'The tide comes in' },
    { t: 7.2, label: 'The original melts away' },
    { t: 9.6, label: 'The backup still stands: rebuild from it' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), FH = 'Caveat Brush', FT = 'Nunito', BE = this.beats;
    scene.background = new T.Color('#f2b888'); scene.fog = new T.Fog('#f2b888', 25, 60); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#ffd8b0', '#8a6a4a', 0.7));
    const sun = new T.DirectionalLight('#ffc890', 3.0); sun.position.set(-12, 3.2, -6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 40 }); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02; scene.add(sun);
    const std = (c, r = 0.95, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const sandTex = K.canvasTex(1024, 1024, (g, r, w, h) => { g.fillStyle = '#d8b480'; g.fillRect(0, 0, w, h); for (let i = 0; i < 30000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(150,110,60,0.25)' : 'rgba(255,240,210,0.25)'; g.fillRect(r() * w, r() * h, 2, 2); } }, 3);
    sandTex.wrapS = sandTex.wrapT = T.RepeatWrapping; sandTex.repeat.set(6, 6);
    const sand = new T.Mesh(new T.PlaneGeometry(60, 40), std('#ffffff', 0.95, { map: sandTex })); sand.rotation.x = -Math.PI / 2; sand.receiveShadow = true; scene.add(sand);
    const sea = new T.Mesh(new T.PlaneGeometry(80, 30), std('#3a7a8a', 0.15, { metalness: 0.3 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.02, -21); scene.add(sea);
    // castles: towers with crenellations and a wall; each tower can slump
    const wet = std('#d0a46a', 0.9);
    const castle = (x, z) => { const g = new T.Group(); g.position.set(x, 0, z); scene.add(g); const towers = [];
      [[-0.9, -0.5, 0.42, 1.3], [0.9, -0.5, 0.42, 1.3], [-0.9, 0.7, 0.36, 1.0], [0.9, 0.7, 0.36, 1.0], [0, 0, 0.55, 1.8]].forEach(([tx, tz, r, h]) => {
        const t = new T.Group(); t.position.set(tx, 0, tz); g.add(t); const body = new T.Mesh(new T.CylinderGeometry(r * 0.88, r, h, 24), wet); body.position.y = h / 2; t.add(body);
        for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2, c = new T.Mesh(new T.BoxGeometry(r * 0.35, r * 0.35, r * 0.35), wet); c.position.set(Math.cos(a) * r * 0.72, h + r * 0.15, Math.sin(a) * r * 0.72); t.add(c); }
        t.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); towers.push({ t, h }); });
      const wall = new T.Mesh(new T.BoxGeometry(1.8, 0.6, 0.25), wet); wall.position.set(0, 0.3, 0.7); wall.castShadow = true; g.add(wall); towers.push({ t: wall, h: 0.6, wall: true });
      return { g, towers, z }; };
    const orig = castle(-1.2, -1.2), back = castle(2.6, 3.4);
    // the bucket mould
    const bucket = new T.Group(); scene.add(bucket);
    const bk = new T.Mesh(new T.CylinderGeometry(0.62, 0.48, 1.9, 28, 1, true), std('#e0302a', 0.4, { side: T.DoubleSide })); bk.position.y = 0.95; const bottom = new T.Mesh(new T.CircleGeometry(0.62, 28), std('#e0302a', 0.4)); bottom.rotation.x = -Math.PI / 2; bottom.position.y = 1.9; bucket.add(bk, bottom); bucket.traverse(o => { if (o.isMesh) o.castShadow = true; });
    const handle = new T.Mesh(new T.TorusGeometry(0.6, 0.03, 6, 24, Math.PI), std('#fff', 0.4)); handle.position.y = 1.4; bucket.add(handle);
    // the water sheet and its foam edge, rebuilt each frame from the front line
    const NX = 120, W = 40, wGeo = new T.PlaneGeometry(W, 1, NX, 1); wGeo.rotateX(-Math.PI / 2);
    const water = new T.Mesh(wGeo, new T.MeshStandardMaterial({ color: '#7ab8c0', roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.55 })); water.position.y = 0.04; scene.add(water);
    const fGeo = new T.PlaneGeometry(W, 1, NX, 1); fGeo.rotateX(-Math.PI / 2);
    const foam = new T.Mesh(fGeo, new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6, transparent: true, opacity: 0.85 })); foam.position.y = 0.05; scene.add(foam);
    const darkGeo = new T.PlaneGeometry(W, 1, NX, 1); darkGeo.rotateX(-Math.PI / 2);
    const damp = new T.Mesh(darkGeo, new T.MeshStandardMaterial({ color: '#6a4a28', roughness: 0.4, transparent: true, opacity: 0.35 })); damp.position.y = 0.015; scene.add(damp);
    const edge = (x, t) => 0.35 * Math.sin(x * 0.7 + t * 1.3) + 0.2 * Math.sin(x * 1.9 - t * 2.1);
    const front = t => -4.2 + 0.4 * Math.sin(t * 1.4) + 6.0 * K.prog(t, B[2] + 0.2, B[2] + 2.0, 'inOut') - 6.4 * K.prog(t, B[3] + 0.6, B[3] + 2.2, 'inOut');
    // foam-white words on the sand, written left to right
    const word = (txt, x, z, w) => { const tex = K.canvasTex(512, 160, (g, r, cw, ch) => { g.clearRect(0, 0, cw, ch); g.fillStyle = '#ffffff'; g.font = `400 120px "${FH}"`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(txt, 16, ch / 2); }, txt.length);
      const geo = new T.PlaneGeometry(w, w * 160 / 512); geo.rotateX(-Math.PI / 2); const m = new T.Mesh(geo, new T.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.6, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.5 })); m.position.set(x, 0.03, z); scene.add(m); return { m, geo, w }; };
    const wOrig = word('original', -1.6, 0.7, 2.6), wBack = word('backup', 2.4, 5.3, 2.4);
    // reveal: show the left part u of the word, anchored at its left edge
    const reveal = (wd, u) => { wd.x0 = wd.x0 ?? wd.m.position.x; wd.m.scale.x = Math.max(0.001, u); wd.m.position.x = wd.x0 - wd.w / 2 * (1 - u); wd.m.material.map.repeat.x = Math.max(0.001, u); };
    const titles = BE.map(b => { const l = K.label(b.label, { font: FT, weight: 800, px: 66, color: '#3a2414', bg: 'rgba(255,240,220,0.85)', radius: 16, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [2.4, 3.4, 8.0], look: [-0.6, 0.6, -1.0] },
      { t: 2.4, pos: [5.6, 3.2, 9.4], look: [2.0, 0.6, 2.6] },
      { t: 4.8, pos: [1.6, 4.6, 9.6], look: [0.4, 0.2, -0.6] },
      { t: 7.2, pos: [-4.2, 3.8, 5.0], look: [-1.2, 0.3, -1.2] },
      { t: 8.9, pos: [-3.6, 3.6, 4.6], look: [-1.2, 0.3, -1.2] },
      { t: 9.6, pos: [5.6, 3.0, 9.8], look: [2.4, 0.7, 3.0] },
      { t: 12, pos: [3.0, 4.8, 12.0], look: [1.0, 0.6, 1.0] },
    ], S.camera);
    return (t, realT) => {
      cam(t);
      const zf = front(t); let zmax = -4.6; for (let tt = 0; tt <= t; tt += 0.1) zmax = Math.max(zmax, front(tt));
      const Pw = wGeo.attributes.position, Pf = fGeo.attributes.position, Pd = darkGeo.attributes.position;
      for (let i = 0; i <= NX; i++) { const x = -W / 2 + i / NX * W, e = zf + edge(x, t), em = zmax + edge(x, 3.0) * 0.6;
        Pw.setXYZ(i, x, 0, -14); Pw.setXYZ(i + NX + 1, x, 0, e);
        Pf.setXYZ(i, x, 0, e - 0.25 - 0.1 * Math.sin(x * 3 + t * 4)); Pf.setXYZ(i + NX + 1, x, 0, e + 0.06);
        Pd.setXYZ(i, x, 0, -14); Pd.setXYZ(i + NX + 1, x, 0, em); }
      Pw.needsUpdate = Pf.needsUpdate = Pd.needsUpdate = true; wGeo.computeBoundingSphere(); fGeo.computeBoundingSphere(); darkGeo.computeBoundingSphere();
      // the original slumps once the water reaches it
      orig.towers.forEach((tw, i) => { const zt = orig.z + tw.t.position.z, tc = B[2] + 0.2 + 1.8 * K.clamp((zt + 4.2 + 1.0) / 6.0), s = K.prog(t, tc, tc + 1.6, 'out');
        const sy = Math.max(0.08, 1 - 0.9 * s); tw.t.scale.set(1 + 0.7 * s, sy, 1 + 0.7 * s); if (tw.wall) tw.t.position.y = 0.3 * sy; });
      // the backup: the bucket comes down, lifts, and the tower is there
      const down = K.prog(t, B[1] + 0.1, B[1] + 0.6, 'in'), up = K.prog(t, B[1] + 1.0, B[1] + 1.6, 'out');
      // the bucket is flipped (open end down); its rim sits on the sand when down = 1
      bucket.scale.set(1, -1, 1); bucket.position.set(2.6, 1.9 + 2.6 * (1 - down) + 2.8 * up, 3.4); bucket.rotation.z = 0.1 * Math.sin(realT * 2) * up; bucket.visible = t > B[1] && t < B[2] + 0.5;
      back.g.visible = t > B[1] + 1.0; back.g.scale.y = 1;
      reveal(wOrig, K.prog(t, 0.2, 1.4) * (1 - K.prog(t, B[2] + 1.0, B[2] + 2.0))); reveal(wBack, K.prog(t, B[1] + 1.4, B[1] + 2.4));
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('water', { gain: 0.08 }); k.bed('wind', { gain: 0.04 });
    k.play('paper', { t: 0.3, gain: 0.15, pitch: 0.5, dur: 1.0 }); k.play('pluck', { t: 0.6, gain: 0.12, pitch: 1.0, music: true });
    k.play('swish', { t: B[1] + 0.2, gain: 0.2, pitch: 0.8, dur: 0.5 }); k.play('thud', { t: B[1] + 0.6, gain: 0.35, pitch: 0.8 }); k.play('wood', { t: B[1] + 0.8, gain: 0.25, pitch: 1.2 }); k.play('wood', { t: B[1] + 0.9, gain: 0.2, pitch: 1.1 }); k.play('swish', { t: B[1] + 1.1, gain: 0.2, pitch: 1.0, dur: 0.5 });
    k.play('splash', { t: B[2] + 0.4, gain: 0.4, pitch: 0.6, dur: 2.2 }); k.play('whoosh', { t: B[2] + 0.3, gain: 0.2, pitch: 0.4, dur: 2.0 });
    k.play('splash', { t: B[3] + 0.7, gain: 0.25, pitch: 0.5, dur: 1.8 }); k.play('drop', { t: B[3] + 0.4, gain: 0.2, pitch: 0.6 });
    k.play('chime', { t: B[4] + 0.6, gain: 0.15, pitch: 1.0, music: true }); k.play('pluck', { t: B[4] + 1.2, gain: 0.12, pitch: 1.5, music: true });
  },
  post: null,
};
