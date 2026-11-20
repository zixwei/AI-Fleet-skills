window.STYLES = window.STYLES || {};
STYLES['anamorphic'] = {
  id: 'anamorphic', name: 'Anamorphic',
  family: 'Light and optics',
  use: 'Explainer',
  look: 'Hundreds of small painted fragments hang on thin threads in a white room, at many depths, with no visible order. Seen from one exact point, they line up into one clear flat picture.',
  motion: 'The camera moves slowly through the room. At one exact point the fragments snap into a picture; a step further and the picture breaks apart again. Then the camera finds the next point and the next picture.',
  shownHere: 'How scattered data points become an insight: from most angles the points are noise; from the right angle they show a trend; from another angle they show the cause; the insight depends on where you stand.',
  goodFor: 'Perspective and framing: data stories, "it depends how you look at it", hidden patterns, reveals. Anything where the right point of view makes order appear.',
  fonts: ['Space Grotesk:wght@500;700'],
  duration: 12,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Hundreds of data points, no order' },
    { t: 2.4, label: 'From the right angle: a rising trend' },
    { t: 4.8, label: 'One step aside, it is noise again' },
    { t: 7.2, label: 'Another angle: the cause comes into view' },
    { t: 9.6, label: 'Insight depends on where you stand' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Space Grotesk', BE = this.beats;
    scene.background = new T.Color('#f2f1ee'); scene.add(S.camera);
    K.lights(S, 'studio', { size: 10 });
    const std = (c, r = 0.9, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const floor = new T.Mesh(new T.PlaneGeometry(40, 40), std('#e8e6e2')); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const back = new T.Mesh(new T.PlaneGeometry(40, 14), std('#f4f3f0')); back.position.set(0, 7, -12); scene.add(back);
    // the two pictures, drawn at low resolution; each coloured cell becomes one fragment
    const GW = 44, GH = 26;
    const picture = draw => { const c = document.createElement('canvas'); c.width = GW; c.height = GH; const g = c.getContext('2d'); g.clearRect(0, 0, GW, GH); draw(g); const d = g.getImageData(0, 0, GW, GH).data, cells = [];
      for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) { const i = (y * GW + x) * 4; if (d[i + 3] > 128) cells.push({ x, y, c: new T.Color(`rgb(${d[i]},${d[i + 1]},${d[i + 2]})`) }); } return cells; };
    const trend = picture(g => { g.fillStyle = '#222'; g.fillRect(4, 3, 1, 20); g.fillRect(4, 22, 37, 1); const pts = [[8, 19], [11, 18], [13, 19], [16, 16], [19, 16], [21, 13], [24, 14], [27, 11], [30, 10], [33, 8], [36, 7], [38, 5]]; g.fillStyle = '#2a6ad8'; pts.forEach(([x, y]) => g.fillRect(x - 1, y - 1, 2, 2)); g.strokeStyle = '#e8402a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(7, 20); g.lineTo(39, 4); g.stroke(); });
    const bulb = picture(g => { g.fillStyle = '#f2b81a'; g.beginPath(); g.arc(22, 10, 7.5, 0, 7); g.fill(); g.fillStyle = '#fff3c0'; g.beginPath(); g.arc(20, 8, 3, 0, 7); g.fill(); g.fillStyle = '#777'; g.fillRect(18, 17, 8, 2); g.fillRect(19, 19.5, 6, 1.5); g.fillRect(20, 21.5, 4, 1.5); g.strokeStyle = '#f2b81a'; g.lineWidth = 1.2; [[-1, -1], [1, -1], [-1.3, 0.2], [1.3, 0.2], [0, -1.4]].forEach(([dx, dy]) => { g.beginPath(); g.moveTo(22 + dx * 9.5, 10 + dy * 7); g.lineTo(22 + dx * 12.5, 10 + dy * 9.5); g.stroke(); }); });
    // viewpoints: the camera must stand exactly here for each picture
    const views = [{ pos: new T.Vector3(-5.5, 1.7, 7.5), look: new T.Vector3(0.5, 2.3, -2), cells: trend }, { pos: new T.Vector3(6.0, 2.6, 6.5), look: new T.Vector3(-0.8, 2.4, -2.5), cells: bulb }];
    const vcam = new T.PerspectiveCamera(S.camera.fov, S.camera.aspect, 0.1, 100);
    const rr = K.rng(64), items = [];
    views.forEach(v => { vcam.position.copy(v.pos); vcam.lookAt(v.look); vcam.updateMatrixWorld(); vcam.updateProjectionMatrix();
      const th = Math.tan(vcam.fov * Math.PI / 360), sx = 1.25 / GW, sy = 1.0 / GH;
      v.cells.forEach(cl => { const nx = -0.62 + (cl.x + 0.5) * sx * 1.0, ny = 0.42 - (cl.y + 0.5) * sy * 1.0; const dir = new T.Vector3(nx, ny, 0.5).unproject(vcam).sub(v.pos).normalize();
        const fwd = new T.Vector3(); vcam.getWorldDirection(fwd); const d = rr.range(5.5, 12.5), dist = d / dir.dot(fwd) * 1, p = v.pos.clone().addScaledVector(dir, dist);
        items.push({ p, sx: dist * th * sx * vcam.aspect * 1.1, sy: dist * th * sy * 1.1, c: cl.c, face: v.pos }); }); });
    for (let i = 0; i < 180; i++) { const p = new T.Vector3(rr.range(-6, 6), rr.range(0.6, 4.6), rr.range(-7, 2)); const s0 = rr.range(0.08, 0.2); items.push({ p, sx: s0, sy: s0, c: new T.Color().setHSL(rr(), 0.35, 0.62), face: new T.Vector3(rr.range(-10, 10), 2, 10) }); }
    // fragments: one instanced mesh; threads: one line set to the ceiling
    const frag = new T.InstancedMesh(new T.PlaneGeometry(1, 1), new T.MeshStandardMaterial({ roughness: 0.7, side: T.DoubleSide }), items.length); frag.castShadow = true; frag.frustumCulled = false; scene.add(frag);
    const M = new T.Matrix4(), Q = new T.Quaternion(), O = new T.Object3D();
    items.forEach((it, i) => { O.position.copy(it.p); O.lookAt(it.face); O.scale.set(it.sx, it.sy, 1); O.updateMatrix(); frag.setMatrixAt(i, O.matrix); frag.setColorAt(i, it.c); it.q = O.quaternion.clone(); });
    const tp = []; items.forEach(it => { tp.push(it.p.x, it.p.y + it.sy / 2, it.p.z, it.p.x, 7.5, it.p.z); });
    const tg = new T.BufferGeometry(); tg.setAttribute('position', new T.Float32BufferAttribute(tp, 3)); scene.add(new T.LineSegments(tg, new T.LineBasicMaterial({ color: '#b8b6b0', transparent: true, opacity: 0.35 })));
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 68, color: '#1a1a1a', bg: 'rgba(255,255,255,0.88)', radius: 12, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    // the path: wide, to view 1, hold, step aside, to view 2, hold, pull back
    const W0 = { pos: new T.Vector3(0.5, 3.4, 13.5), look: new T.Vector3(0, 2.2, -2) }, MID = { pos: new T.Vector3(1.0, 2.2, 8.5), look: new T.Vector3(0, 2.2, -2) }, END = { pos: new T.Vector3(9.5, 3.2, 10.5), look: new T.Vector3(-0.5, 2.3, -2.5) };
    const keys = [[0, W0], [B[1] + 0.9, views[0]], [B[2] - 0.1, views[0]], [B[2] + 1.2, MID], [B[3] + 0.9, views[1]], [B[4] - 0.1, views[1]], [12, END]];
    const P = new T.Vector3(), Lk = new T.Vector3();
    return (t, realT) => {
      let k = 0; while (k < keys.length - 2 && t >= keys[k + 1][0]) k++;
      const [t0, a] = keys[k], [t1, b] = keys[k + 1], u = K.ease.inOut(K.clamp((t - t0) / (t1 - t0)));
      P.lerpVectors(a.pos, b.pos, u); Lk.lerpVectors(a.look, b.look, u); S.camera.position.copy(P); S.camera.lookAt(Lk);
      // a slow sway on the threads (turning only, so the pictures still line up)
      items.forEach((it, i) => { O.position.copy(it.p); O.quaternion.copy(it.q); O.rotateZ(0.1 * Math.sin(realT * 0.8 + i)); O.scale.set(it.sx, it.sy, 1); O.updateMatrix(); frag.setMatrixAt(i, O.matrix); });
      frag.instanceMatrix.needsUpdate = true;
      titles.forEach((l, i) => { const a2 = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a2 > 0.01; l.material.opacity = a2; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.06 });
    for (let i = 0; i < 8; i++) k.play('glass', { t: 0.2 + i * 0.27, gain: 0.05, pitch: 1.5 + (i % 4) * 0.2 });
    k.play('swish', { t: B[1] + 0.1, gain: 0.15, pitch: 0.6, dur: 0.9 }); k.play('chime', { t: B[1] + 0.9, gain: 0.2, pitch: 1.0, music: true }); k.play('sparkle', { t: B[1] + 0.95, gain: 0.15 });
    k.play('swish', { t: B[2] + 0.1, gain: 0.15, pitch: 0.7, dur: 1.0 }); k.play('glass', { t: B[2] + 0.4, gain: 0.08, pitch: 1.2 });
    k.play('swish', { t: B[3] + 0.1, gain: 0.15, pitch: 0.6, dur: 0.9 }); k.play('chime', { t: B[3] + 0.9, gain: 0.2, pitch: 1.33, music: true }); k.play('sparkle', { t: B[3] + 0.95, gain: 0.15 });
    k.play('swish', { t: B[4] + 0.1, gain: 0.15, pitch: 0.5, dur: 1.5 }); k.play('bell', { t: B[4] + 1.2, gain: 0.12, pitch: 0.5, music: true });
  },
  post: null,
};
