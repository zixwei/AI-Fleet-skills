window.STYLES = window.STYLES || {};
STYLES['gravity-well'] = {
  id: 'gravity-well', name: 'Gravity Well',
  family: 'Earth, weather and sky',
  use: 'Explainer',
  look: 'A stretched dark rubber sheet with a white grid, in a dark studio. A heavy glossy sphere dents the sheet; small bright marbles roll along the curves. The grid lines show every change of shape.',
  motion: 'The sheet sags smoothly when the heavy sphere lands and sags deeper when it grows. Marbles roll straight, then curve, then circle the dent. The camera drifts round at a low angle.',
  shownHere: 'How gravity bends space (the rubber-sheet picture of general relativity): flat space lets a marble roll straight; a heavy mass curves the space around it; a passing marble follows the curve; at the right speed it circles in an orbit; more mass makes a deeper dent and a faster orbit.',
  goodFor: 'Fields, attraction and influence: gravity, markets, network effects, "everything bends toward the big thing". Abstract forces made tangible.',
  fonts: ['Space Grotesk:wght@500;700'],
  duration: 12,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Flat space: a marble rolls straight' },
    { t: 2.4, label: 'A heavy mass dents the sheet' },
    { t: 4.8, label: 'A passing marble curves toward it' },
    { t: 7.2, label: 'At the right speed, it orbits' },
    { t: 9.6, label: 'More mass: a deeper dent, a faster orbit' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Space Grotesk', BE = this.beats;
    scene.background = new T.Color('#06070a'); scene.add(S.camera);
    const L = K.lights(S, 'night', { size: 10 }); L.key.intensity = 1.4; L.amb.intensity = 0.5; S.scene.environmentIntensity = 0.6;
    const spot = new T.SpotLight('#ffffff', 300, 40, 0.5, 0.6, 1.2); spot.position.set(-3, 14, 6); spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -0.0008; scene.add(spot);
    // the sheet: a grid texture on a dense plane; heights come from the mass
    const N = 140, SZ = 20, geo = new T.PlaneGeometry(SZ, SZ, N, N); geo.rotateX(-Math.PI / 2);
    const grid = K.canvasTex(1024, 1024, (g, r, w, h) => { g.fillStyle = '#14161c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8eef8'; g.lineWidth = 3; for (let i = 0; i <= 20; i++) { g.beginPath(); g.moveTo(i * w / 20, 0); g.lineTo(i * w / 20, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 20); g.lineTo(w, i * h / 20); g.stroke(); } }, 2);
    grid.anisotropy = 8;
    const sheet = new T.Mesh(geo, new T.MeshStandardMaterial({ map: grid, roughness: 0.6, side: T.DoubleSide })); sheet.receiveShadow = true; scene.add(sheet);
    const P = geo.attributes.position, base = new Float32Array(P.count * 2); for (let i = 0; i < P.count; i++) { base[i * 2] = P.getX(i); base[i * 2 + 1] = P.getZ(i); }
    const frame = new T.Mesh(new T.TorusGeometry(SZ * 0.72, 0.12, 8, 4), new T.MeshStandardMaterial({ color: '#2a2c30', metalness: 0.8, roughness: 0.3 })); frame.rotation.set(Math.PI / 2, 0, Math.PI / 4); scene.add(frame);
    // the mass and the marbles
    const mass = new T.Mesh(new T.SphereGeometry(1, 48, 32), new T.MeshStandardMaterial({ color: '#f2a03a', roughness: 0.2, metalness: 0.4, emissive: '#6a3010', emissiveIntensity: 0.4 })); mass.castShadow = true; scene.add(mass);
    const marble = c => { const m = new T.Mesh(new T.SphereGeometry(0.32, 24, 16), new T.MeshStandardMaterial({ color: c, roughness: 0.1, metalness: 0.2, emissive: c, emissiveIntensity: 0.3 })); m.castShadow = true; scene.add(m); return m; };
    const mA = marble('#7ad8ff'), mB = marble('#ff7ab0');
    const trailA = new T.Line(new T.BufferGeometry().setFromPoints(Array.from({ length: 60 }, () => new T.Vector3())), new T.LineBasicMaterial({ color: '#7ad8ff', transparent: true, opacity: 0.95 })); trailA.frustumCulled = false; scene.add(trailA);
    const trailB = new T.Line(new T.BufferGeometry().setFromPoints(Array.from({ length: 60 }, () => new T.Vector3())), new T.LineBasicMaterial({ color: '#ff7ab0', transparent: true, opacity: 0.95 })); trailB.frustumCulled = false; scene.add(trailB);
    // the dent: depth grows with the mass
    const massAt = t => K.prog(t, B[1] + 0.3, B[1] + 1.1, 'out') * (1 + 0.7 * K.prog(t, B[4] + 0.1, B[4] + 1.0, 'inOut'));
    const hAt = (x, z, M) => -3.0 * M / Math.sqrt(1 + (x * x + z * z) / 2.2);
    // paths: straight across, a curving fly-by, a circle
    const straight = t => new T.Vector3(K.lerp(-9, 9, ((t + 0.0) / 4.6) % 1), 0, 3.4);
    const flyby = u => { const a = new T.Vector3(-9, 0, 3.6), c = new T.Vector3(2.4, 0, 1.2), b = new T.Vector3(-3.5, 0, -9); return a.clone().multiplyScalar((1 - u) ** 2).add(c.clone().multiplyScalar(2 * u * (1 - u))).add(b.clone().multiplyScalar(u * u)); };
    const orbit = t => { const deep = K.prog(t, B[4] + 0.1, B[4] + 1.0, 'inOut'), r = K.lerp(3.2, 2.5, deep); const ph = (t - B[3]) * (Math.PI * 2 / 2.4) + Math.max(0, t - B[4]) * (Math.PI * 2 / 1.5 - Math.PI * 2 / 2.4) * 0.8; return new T.Vector3(Math.cos(ph) * r, 0, Math.sin(ph) * r); };
    const posA = t => t < B[2] ? straight(t) : flyby(K.prog(t, B[2] + 0.1, B[3] + 0.3));
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 66, color: '#eef4ff', bg: 'rgba(6,8,12,0.82)', radius: 10, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const tmp = new T.Vector3();
    const onSheet = (v, M) => v.setY(hAt(v.x, v.z, M) + 0.32);
    return (t, realT) => {
      const ca = 0.5 + t * 0.06; S.camera.position.set(Math.sin(ca) * 14, 6.4 - 0.8 * K.prog(t, B[3], B[4]), Math.cos(ca) * 14); S.camera.lookAt(0, -0.8, 0);
      const M = massAt(t);
      for (let i = 0; i < P.count; i++) { const x = base[i * 2], z = base[i * 2 + 1]; P.setY(i, hAt(x, z, M)); }
      P.needsUpdate = true; geo.computeVertexNormals();
      const drop = K.prog(t, B[1], B[1] + 0.5, 'in'); mass.scale.setScalar(1.0 + 0.3 * K.prog(t, B[4] + 0.1, B[4] + 1.0, 'out')); mass.visible = t >= B[1];
      mass.position.set(0, K.lerp(8, hAt(0, 0, M) + mass.scale.x * 0.9, drop), 0);
      // marble A: straight, then the fly-by; marble B: orbits from beat 3
      onSheet(mA.position.copy(posA(t)), M); mA.visible = t < B[3] + 0.4;
      onSheet(mB.position.copy(orbit(t)), M); mB.visible = t >= B[3];
      [[trailA, posA, t < B[3] + 0.4, 0], [trailB, orbit, t >= B[3], B[3]]].forEach(([tr, f, vis, t0]) => { const p = tr.geometry.attributes.position; for (let i = 0; i < 60; i++) { const tt = Math.max(t0, t - i * 0.02); onSheet(tmp.copy(f(tt)), M); p.setXYZ(i, tmp.x, tmp.y - 0.15, tmp.z); } p.needsUpdate = true; tr.visible = vis; });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('space', { gain: 0.05 });
    k.play('swish', { t: 0.1, gain: 0.12, pitch: 1.2, dur: 2.0 });
    k.play('whoosh', { t: B[1] - 0.1, gain: 0.2, pitch: 0.5, dur: 0.6 }); k.play('thud', { t: B[1] + 0.5, gain: 0.5, pitch: 0.5 }); k.play('rumble', { t: B[1] + 0.5, gain: 0.25, pitch: 0.5, dur: 1.2 });
    k.play('swish', { t: B[2] + 0.2, gain: 0.15, pitch: 1.0, dur: 2.2 }); k.play('pluck', { t: B[2] + 1.0, gain: 0.1, pitch: 1.0, music: true });
    for (let i = 0; i < 4; i++) k.play('blip', { t: B[3] + 0.3 + i * 0.6, gain: 0.1, pitch: 1.5 });
    k.play('hum', { t: B[4] + 0.1, gain: 0.15, pitch: 0.6, dur: 2.0 }); for (let i = 0; i < 4; i++) k.play('blip', { t: B[4] + 0.6 + i * 0.4, gain: 0.1, pitch: 1.8 }); k.play('chime', { t: B[4] + 1.6, gain: 0.12, pitch: 1.0, music: true });
  },
  post: null,
};
