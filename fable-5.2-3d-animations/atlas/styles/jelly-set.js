window.STYLES = window.STYLES || {};
STYLES['jelly-set'] = {
  id: 'jelly-set', name: 'Jelly Set',
  family: 'Kitchen and home',
  use: 'Explainer',
  look: 'A large clear jelly on a white plate, lit from behind so it glows. The parts of the subject hang inside it at different depths, like fruit set in jelly. Glossy highlights run along the moulded ribs.',
  motion: 'A spoon taps the plate and the whole jelly wobbles in a damped bounce; everything inside moves with it but stays in place. At the end the spoon lifts out a wedge to show the centre.',
  shownHere: 'How a cell holds its organelles: the cell is filled with a jelly-like cytoplasm; the nucleus holds the DNA; mitochondria release energy from food; a skeleton of fine fibres keeps each part in place; cut it open and the nucleus sits near the centre.',
  goodFor: 'Containers and their contents: cells, organisations, products, ecosystems. Anything where parts float in a medium and the structure is easier to see with a cut.',
  fonts: ['Baloo 2:wght@600;800'],
  duration: 12,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'A cell is filled with jelly: the cytoplasm' },
    { t: 2.4, label: 'The nucleus holds the DNA' },
    { t: 4.8, label: 'Mitochondria release energy from food' },
    { t: 7.2, label: 'Tap it: fine fibres hold every part in place' },
    { t: 9.6, label: 'Cut it open: the nucleus sits near the centre' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Baloo 2', BE = this.beats;
    scene.background = new T.Color('#f6e2c8'); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 6, target: [0, 1, 0] }); L.rim.intensity = 3.0; L.rim.position.set(0, 4, -8);
    const back = new T.PointLight('#fff0d0', 60, 20, 1.5); back.position.set(0, 2.2, -4); scene.add(back);
    const std = (c, r = 0.5, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const table = new T.Mesh(new T.PlaneGeometry(40, 40), std('#e8d4b8', 0.8)); table.rotation.x = -Math.PI / 2; table.receiveShadow = true; scene.add(table);
    const plate = new T.Mesh(new T.CylinderGeometry(3.4, 3.0, 0.14, 64), std('#fbfbf8', 0.2)); plate.position.y = 0.07; plate.receiveShadow = true; plate.castShadow = true; scene.add(plate);
    // the jelly: a fluted mould shape, clear and tinted; a wedge can be lifted out
    const prof = []; for (let i = 0; i <= 24; i++) { const u = i / 24, y = u * 2.6, r = 2.4 - 0.9 * u ** 1.6 + 0.12 * Math.sin(u * Math.PI * 4); prof.push(new T.Vector2(Math.max(0.05, r), y)); } prof.push(new T.Vector2(0.001, 2.6));
    const flute = g => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), r = Math.hypot(x, z), f = 1 + 0.05 * Math.cos(a * 12); p.setX(i, Math.cos(a) * r * f); p.setZ(i, Math.sin(a) * r * f); } g.computeVertexNormals(); return g; };
    const WEDGE = 0.7;
    const jellyMat = new T.MeshPhysicalMaterial({ color: '#ff9a7a', roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.38, depthWrite: false, side: T.DoubleSide, emissive: '#ff6a40', emissiveIntensity: 0.12 });
    const wob = new T.Group(); wob.position.y = 0.14; scene.add(wob);
    const jelly = new T.Mesh(flute(new T.LatheGeometry(prof, 96, WEDGE / 2, Math.PI * 2 - WEDGE)), jellyMat); jelly.renderOrder = 2; wob.add(jelly);
    const wedge = new T.Group(); wob.add(wedge);
    const wj = new T.Mesh(flute(new T.LatheGeometry(prof, 12, -WEDGE / 2, WEDGE)), jellyMat); wj.renderOrder = 2; wedge.add(wj);
    // organelles inside, at different depths
    const parts = new T.Group(); wob.add(parts);
    const nucleus = new T.Mesh(new T.SphereGeometry(0.62, 40, 30), std('#7a4ac0', 0.35, { emissive: '#3a1a70', emissiveIntensity: 0.3 })); nucleus.position.set(0, 1.05, 0); parts.add(nucleus);
    const nucleolus = new T.Mesh(new T.SphereGeometry(0.22, 24, 18), std('#c03a7a', 0.4)); nucleolus.position.set(0.15, 1.12, 0.45); parts.add(nucleolus);
    const mitoTex = K.canvasTex(256, 64, (g, r, w, h) => { g.fillStyle = '#f08a3a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#a04a10'; g.lineWidth = 6; for (let x = 12; x < w; x += 22) { g.beginPath(); g.moveTo(x, 6); g.quadraticCurveTo(x + 10, h / 2, x, h - 6); g.stroke(); } }, 4);
    const mitos = [[1.25, 0.7, 0.6, 0.6], [-1.3, 0.9, -0.4, -0.5], [0.6, 1.8, -0.8, 1.2], [-0.9, 0.5, 1.0, 0.3]].map(([x, y, z, r]) => { const m = new T.Mesh(new T.CapsuleGeometry(0.16, 0.5, 8, 16), std('#ffffff', 0.4, { map: mitoTex })); m.position.set(x, y, z); m.rotation.set(r, r * 2, 1.3); parts.add(m); return m; });
    const er = new T.Mesh(new T.TorusGeometry(0.95, 0.06, 8, 64, Math.PI * 1.3), std('#4ab0c0', 0.5)); er.position.copy(nucleus.position); er.rotation.set(0.4, 0.3, 0); parts.add(er);
    const golgi = new T.Group(); for (let i = 0; i < 4; i++) { const d = new T.Mesh(new T.TorusGeometry(0.28 - i * 0.03, 0.04, 6, 24, Math.PI), std('#e0c040', 0.5)); d.position.y = i * 0.1; golgi.add(d); } golgi.position.set(-1.1, 1.5, 0.5); golgi.rotation.z = 0.4; parts.add(golgi);
    const rr = K.rng(90), ribo = new T.InstancedMesh(new T.SphereGeometry(0.035, 6, 4), std('#3a3a5a'), 140), O = new T.Object3D();
    for (let i = 0; i < 140; i++) { const a = rr() * 6.28, h = rr.range(0.3, 2.1), rad = rr.range(0.3, 1.0) * (2.2 - 0.8 * (h / 2.6)); O.position.set(Math.cos(a) * rad, h, Math.sin(a) * rad); O.updateMatrix(); ribo.setMatrixAt(i, O.matrix); } parts.add(ribo);
    // fibres: thin lines from each part to the jelly wall
    const fib = []; [nucleus, ...mitos, golgi].forEach(p => { for (let k = 0; k < 3; k++) { const a = rr() * 6.28, h = rr.range(0.4, 2.0), r = 2.1 - 0.8 * (h / 2.6); fib.push(p.position.x, p.position.y, p.position.z, Math.cos(a) * r, h, Math.sin(a) * r); } });
    const fibres = new T.LineSegments(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(fib, 3)), new T.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 })); parts.add(fibres);
    // the spoon
    const spoon = new T.Group(); scene.add(spoon);
    const bowl = new T.Mesh(new T.SphereGeometry(0.35, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), std('#c8ccd4', 0.25, { metalness: 0.6, side: T.DoubleSide })); bowl.scale.set(1, 0.4, 1.4); spoon.add(bowl);
    const handle = new T.Mesh(new T.BoxGeometry(0.08, 0.03, 2.2), std('#c8ccd4', 0.25, { metalness: 0.6 })); handle.position.set(0, 0.12, 1.4); handle.rotation.x = -0.15; spoon.add(handle);
    spoon.traverse(o => { if (o.isMesh) o.castShadow = true; });
    // tags
    const tag = (txt, obj, dx, dy) => { const l = K.label(txt, { font: F, weight: 800, px: 54, color: '#3a1a10', bg: 'rgba(255,250,240,0.92)', radius: 14, pad: 0.2, height: 0.28 }); l.userData = { obj, dx, dy }; l.visible = false; scene.add(l); return l; };
    const tags = [tag('cytoplasm', jelly, 2.2, 2.0), tag('nucleus', nucleus, -1.6, 1.0), tag('mitochondria', mitos[0], 1.3, -0.3), tag('fibres', fibres, -2.2, 1.6), tag('centre', nucleus, 1.4, 1.2)];
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 800, px: 66, color: '#3a1a10', bg: 'rgba(255,248,236,0.9)', radius: 16, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([{ t: 0, pos: [3.8, 3.8, 10.8], look: [0, 1.5, 0] }, { t: 6, pos: [-1.8, 3.2, 10.2], look: [0, 1.5, 0] }, { t: 9.6, pos: [3.2, 3.6, 10.4], look: [0, 1.5, 0.5] }, { t: 12, pos: [3.6, 3.4, 9.8], look: [0, 1.3, 0.8] }], S.camera);
    const W = new T.Vector3();
    return (t, realT) => {
      cam(t);
      // the tap: spoon knocks the plate edge, then a damped wobble
      const tap = B[3] + 0.5, d = t - tap, w = d > 0 ? Math.exp(-d * 2.2) * Math.sin(d * 18) : 0;
      wob.scale.set(1 + 0.08 * w, 1 - 0.1 * w, 1 + 0.08 * w); wob.rotation.z = 0.04 * w;
      fibres.material.opacity = K.prog(t, B[3] + 0.2, B[3] + 0.6) * 0.85;
      // the cut: the spoon lifts the wedge out toward the camera
      const cut = K.prog(t, B[4] + 0.4, B[4] + 1.6, 'inOut');
      wedge.position.set(0, 0.2 * Math.sin(Math.PI * cut) + cut * 0.2, cut * 2.6);
      const sx = t < B[4] ? K.lerp(2.6, 3.0, K.prog(t, B[3], tap)) : 0, sy = t < B[4] ? (d > -0.5 && d < 0 ? 0.3 + (-d) : d >= 0 ? 0.3 + Math.min(1, d) : 1.3) : 0.9 + cut * 0.3;
      if (t < B[4]) { spoon.position.set(sx, sy, 1.6); spoon.rotation.set(0.2, -0.8, 0); } else { spoon.position.set(0, 0.2 + cut * 0.6 + 0.6, 1.6 + cut * 2.6); spoon.rotation.set(0.1, 0, 0); }
      spoon.visible = t > B[3] - 0.2;
      tags.forEach((l, i) => { const on = t > B[i] + 0.3 && (i === 4 ? t > B[4] + 1.4 : true); l.visible = on; const o = l.userData.obj; o.getWorldPosition(W); l.position.set(W.x + l.userData.dx, W.y + l.userData.dy, W.z + 0.6); if (o === jelly) l.position.set(2.2, 2.6, 0.6); if (o === fibres) l.position.set(-2.4, 2.4, 0.4); l.material.opacity = i < BE.length - 1 && t > B[i + 1] + 0.3 ? 0.55 : 1; });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.05 });
    k.play('bubble', { t: 0.4, gain: 0.15, pitch: 0.8 }); k.play('pluck', { t: 0.7, gain: 0.12, pitch: 1.0, music: true });
    k.play('pop', { t: B[1] + 0.4, gain: 0.2, pitch: 0.8 }); k.play('pluck', { t: B[1] + 0.5, gain: 0.1, pitch: 1.2, music: true });
    k.play('pop', { t: B[2] + 0.4, gain: 0.2, pitch: 1.1 }); k.play('hum', { t: B[2] + 0.5, gain: 0.1, pitch: 1.2, dur: 1.2 });
    k.play('glass', { t: B[3] + 0.5, gain: 0.35, pitch: 1.6 }); k.play('bubble', { t: B[3] + 0.55, gain: 0.25, pitch: 0.5 }); k.play('bubble', { t: B[3] + 0.8, gain: 0.15, pitch: 0.45 });
    k.play('splash', { t: B[4] + 0.5, gain: 0.15, pitch: 1.6, dur: 0.8 }); k.play('swish', { t: B[4] + 0.6, gain: 0.15, pitch: 0.8, dur: 1.0 }); k.play('chime', { t: B[4] + 1.6, gain: 0.15, pitch: 1.0, music: true });
  },
  post: null,
};
