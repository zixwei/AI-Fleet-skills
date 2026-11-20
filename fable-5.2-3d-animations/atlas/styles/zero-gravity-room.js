window.STYLES = window.STYLES || {};
STYLES['zero-gravity-room'] = {
  id: 'zero-gravity-room', name: 'Zero-Gravity Room',
  family: 'Strange worlds',
  use: 'Explainer',
  look: 'An ordinary kitchen with no gravity. Cups, fruit and a chair hang in the air and turn slowly. Water floats as shining balls that join and split. Soft daylight from a window.',
  motion: 'Nothing falls; everything drifts and turns at a steady rate. An apple pushed in one beat is still moving in the next. Water balls wobble, pull together into one ball, and are drawn into a pouch through a straw.',
  shownHere: 'How astronauts drink in orbit: nothing falls, so poured water pulls itself into a ball; anything you push keeps moving until something stops it; so astronauts drink from a sealed pouch with a straw and a clip, and sip the water out.',
  goodFor: 'Physics and "what if" worlds: momentum, surface tension, life in space, any idea shown by taking away one rule of daily life.',
  fonts: ['Nunito:wght@700;800'],
  duration: 12,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'In orbit, nothing falls' },
    { t: 2.4, label: 'Poured water pulls itself into a ball' },
    { t: 4.8, label: 'A push keeps it moving' },
    { t: 7.2, label: 'So: a sealed pouch with a straw' },
    { t: 9.6, label: 'Squeeze, sip, close the clip' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Nunito', BE = this.beats;
    scene.background = new T.Color('#e8e4dc'); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 8, target: [0, 1.5, 0] }); L.key.position.set(-4, 8, 6);
    const std = (c, r = 0.6, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    // the kitchen: floor, two walls, a counter and cabinets, a window
    const floor = new T.Mesh(new T.PlaneGeometry(14, 10), std('#c8b8a0', 0.7)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const wallB = new T.Mesh(new T.PlaneGeometry(14, 6), std('#e8eef0', 0.9)); wallB.position.set(0, 3, -4); wallB.receiveShadow = true; scene.add(wallB);
    const wallL = new T.Mesh(new T.PlaneGeometry(10, 6), std('#dfe6ea', 0.9)); wallL.rotation.y = Math.PI / 2; wallL.position.set(-6, 3, 1); scene.add(wallL);
    const counter = new T.Mesh(new T.BoxGeometry(7, 0.9, 1.2), std('#5a7a8a', 0.5)); counter.position.set(-1.5, 0.45, -3.4); counter.castShadow = counter.receiveShadow = true; scene.add(counter);
    const top = new T.Mesh(new T.BoxGeometry(7.1, 0.06, 1.3), std('#f4f0e8', 0.3)); top.position.set(-1.5, 0.93, -3.4); scene.add(top);
    const cab = new T.Mesh(new T.BoxGeometry(7, 1.2, 0.6), std('#5a7a8a', 0.5)); cab.position.set(-1.5, 3.4, -3.7); scene.add(cab);
    const win = new T.Mesh(new T.PlaneGeometry(2.0, 1.4), new T.MeshBasicMaterial({ color: '#cfe8ff' })); win.position.set(3.2, 2.6, -3.98); scene.add(win);
    // floating things: each turns at its own steady rate and drifts slowly
    const float = [];
    const add = (obj, pos, spin, drift) => { obj.position.set(...pos); obj.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(obj); float.push({ obj, p0: new T.Vector3(...pos), spin, drift: new T.Vector3(...drift) }); return obj; };
    const cup = () => { const g = new T.Group(); const c = new T.Mesh(new T.CylinderGeometry(0.22, 0.18, 0.4, 24, 1, true), std('#e05a4a', 0.4, { side: T.DoubleSide })); const b = new T.Mesh(new T.CircleGeometry(0.18, 24), std('#e05a4a', 0.4)); b.rotation.x = Math.PI / 2; b.position.y = -0.2; const h = new T.Mesh(new T.TorusGeometry(0.1, 0.03, 8, 16, Math.PI), std('#e05a4a', 0.4)); h.position.x = 0.24; h.rotation.z = -Math.PI / 2; g.add(c, b, h); return g; };
    add(cup(), [-2.6, 2.2, -1.4], [0.3, 0.5, 0.2], [0.02, 0.01, 0]);
    add(cup(), [2.4, 3.0, -1.8], [-0.4, 0.2, 0.3], [-0.01, -0.01, 0.01]);
    const banana = new T.Mesh(new T.TorusGeometry(0.4, 0.07, 10, 24, 2.2), std('#f2d03a', 0.5)); add(banana, [-1.0, 3.2, -2.2], [0.2, 0.4, 0.1], [0.015, 0, 0.01]);
    const chair = new T.Group(); { const w = std('#8a5a3a', 0.6); const seat = new T.Mesh(new T.BoxGeometry(0.9, 0.08, 0.9), w); const back = new T.Mesh(new T.BoxGeometry(0.9, 0.9, 0.08), w); back.position.set(0, 0.5, -0.41); chair.add(seat, back); [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].forEach(([x, z]) => { const l = new T.Mesh(new T.BoxGeometry(0.07, 0.8, 0.07), w); l.position.set(x, -0.44, z); chair.add(l); }); }
    add(chair, [3.8, 1.5, -1.4], [0.12, 0.2, 0.25], [0.008, 0.006, -0.006]);
    // the apple: drifts, then gets a push and keeps that speed
    const apple = new T.Group(); const ab = new T.Mesh(new T.SphereGeometry(0.25, 24, 18), std('#c8202a', 0.35)); const st = new T.Mesh(new T.CylinderGeometry(0.015, 0.015, 0.12, 6), std('#5a3a1a')); st.position.y = 0.28; apple.add(ab, st); apple.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(apple);
    const arrow = new T.Mesh(new T.ConeGeometry(0.12, 0.35, 12), std('#2a8ae0', 0.4, { emissive: '#2a8ae0', emissiveIntensity: 0.5 })); arrow.rotation.z = -Math.PI / 2; scene.add(arrow);
    const shaft = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 0.6, 8), arrow.material); shaft.rotation.z = Math.PI / 2; scene.add(shaft);
    // water: blobs that wobble, merge into one ball, then go up the straw
    const waterMat = new T.MeshStandardMaterial({ color: '#8ad0f8', roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.75, envMapIntensity: 1.5 });
    const rr = K.rng(98), NBL = 7, blobs = Array.from({ length: NBL }, (_, i) => { const m = new T.Mesh(new T.SphereGeometry(1, 32, 24), waterMat); m.castShadow = true; scene.add(m); return { m, start: new T.Vector3(rr.range(-0.8, 0.6), rr.range(-0.5, 0.4), rr.range(-0.4, 0.4)), r: rr.range(0.08, 0.16), ph: rr() * 6 }; });
    const bottle = new T.Group(); { const b = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.7, 20), std('#cfe8ff', 0.1, { transparent: true, opacity: 0.6 })); const c = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 0.12, 12), std('#2a6ab0', 0.4)); c.position.y = 0.41; bottle.add(b, c); } scene.add(bottle);
    const WC = new T.Vector3(-0.4, 2.2, 0.6);
    // the pouch with a straw and a clip
    const pouch = new T.Group(); { const body = new T.Mesh(new T.BoxGeometry(0.7, 0.9, 0.12), std('#c8ccd4', 0.25, { metalness: 0.7 })); const lab = K.label('H2O', { font: F, weight: 800, px: 60, color: '#2a4a7a', bg: '#ffffff', radius: 8, pad: 0.12, height: 0.16 }); lab.position.z = 0.07; const straw = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 0.6, 10), std('#f4f4f4', 0.3)); straw.position.y = 0.72; const clip = new T.Mesh(new T.BoxGeometry(0.16, 0.06, 0.1), std('#e05a2a', 0.4)); clip.position.y = 0.62; body.add(lab); pouch.add(body, straw, clip); pouch.userData.clip = clip; } pouch.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(pouch);
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 800, px: 68, color: '#2a3a4a', bg: 'rgba(255,255,255,0.9)', radius: 16, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([{ t: 0, pos: [1.6, 2.6, 7.6], look: [0, 2.0, -1] }, { t: 2.4, pos: [0.4, 2.4, 5.6], look: [-0.4, 2.1, 0.2] }, { t: 4.8, pos: [2.2, 2.6, 6.8], look: [0.6, 2.0, -0.4] }, { t: 7.2, pos: [0.6, 2.5, 5.4], look: [0.2, 2.2, 0.4] }, { t: 12, pos: [1.0, 2.6, 6.6], look: [0, 2.1, 0] }], S.camera);
    const P = new T.Vector3(), straw = new T.Vector3();
    return (t, realT) => {
      cam(t);
      float.forEach(f => { f.obj.position.copy(f.p0).addScaledVector(f.drift, t * 10).add(P.set(0, 0.06 * Math.sin(t * 0.8 + f.p0.x), 0)); f.obj.rotation.set(f.spin[0] * t, f.spin[1] * t, f.spin[2] * t); });
      // apple: a slow drift, then a push at a constant new speed (it never slows down)
      const tp = B[2] + 0.4, a0 = new T.Vector3(-3.6, 1.8, 0.4).addScaledVector(new T.Vector3(0.02, 0.01, 0), Math.min(t, tp) * 10);
      apple.position.copy(a0).addScaledVector(new T.Vector3(0.9, 0.12, -0.05), Math.max(0, t - tp)); apple.rotation.set(0.3 * t, 0.5 * t + 1.5 * Math.max(0, t - tp), 0);
      const af = K.clamp(1 - Math.abs(t - tp + 0.15) / 0.3); arrow.visible = shaft.visible = af > 0.01; arrow.position.copy(a0).add(P.set(-0.45, 0, 0)); shaft.position.copy(a0).add(P.set(-0.85, 0, 0)); arrow.scale.setScalar(af); shaft.scale.setScalar(af);
      // water: the bottle lets blobs out at beat 1; they pull together; at beat 4 the ball goes up the straw
      bottle.visible = t > B[1] - 0.3 && t < B[2] + 0.6; bottle.position.copy(WC).add(P.set(-1.0, 0.5, 0)); bottle.rotation.z = -1.2 * K.prog(t, B[1] - 0.2, B[1] + 0.3);
      const out = K.prog(t, B[1] + 0.2, B[1] + 1.0), merge = K.prog(t, B[1] + 1.0, B[2] + 0.8, 'inOut');
      pouch.position.set(1.2, 2.5 + 0.06 * Math.sin(t * 0.9), 0.4); pouch.rotation.set(0, -0.4, 0.15 * Math.sin(t * 0.5)); pouch.visible = t > B[3] - 0.2; pouch.scale.setScalar(K.prog(t, B[3] - 0.2, B[3] + 0.3, 'back'));
      straw.set(0, 0.95, 0).applyEuler(pouch.rotation).add(pouch.position);
      const sip = K.prog(t, B[4] + 0.2, B[4] + 2.0, 'inOut'), total = blobs.reduce((s, b) => s + b.r ** 3, 0), bigR = Math.cbrt(total);
      blobs.forEach((b, i) => { const wob = 1 + 0.08 * Math.sin(realT * 6 + b.ph);
        const spread = b.start.clone().multiplyScalar(1.6), ballPos = WC.clone().lerp(straw, sip * 0.9);
        b.m.position.copy(WC).add(spread.multiplyScalar(1 - merge)).lerp(ballPos, merge); b.m.position.x -= (1 - out) * 1.0;
        const r = i === 0 ? K.lerp(b.r, bigR, merge) : b.r * (1 - merge); b.m.scale.set(r * wob, r / wob, r * wob).multiplyScalar(Math.max(0.001, out) * (i === 0 ? 1 - sip * 0.95 : 1)); b.m.visible = t > B[1] + 0.2 && r * out > 0.005; });
      pouch.userData.clip.position.x = t > B[4] + 2.0 ? 0 : 0.08;
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.05 }); k.bed('machine', { gain: 0.03 });
    k.play('hum', { t: 0.2, gain: 0.08, pitch: 0.7, dur: 2.0 }); k.play('glass', { t: 0.9, gain: 0.1, pitch: 1.4 });
    k.play('bubble', { t: B[1] + 0.3, gain: 0.25, pitch: 0.8 }); k.play('bubble', { t: B[1] + 0.6, gain: 0.2, pitch: 1.0 }); k.play('bubble', { t: B[1] + 1.4, gain: 0.25, pitch: 0.6 });
    k.play('thud', { t: B[2] + 0.4, gain: 0.25, pitch: 1.4 }); k.play('swish', { t: B[2] + 0.45, gain: 0.15, pitch: 1.0, dur: 1.5 });
    k.play('paper', { t: B[3], gain: 0.2, pitch: 1.4 }); k.play('pop', { t: B[3] + 0.3, gain: 0.2, pitch: 1.0 });
    k.play('bubble', { t: B[4] + 0.4, gain: 0.25, pitch: 1.3 }); k.play('bubble', { t: B[4] + 1.0, gain: 0.2, pitch: 1.5 }); k.play('click', { t: B[4] + 2.0, gain: 0.35, pitch: 1.0 }); k.play('chime', { t: B[4] + 2.1, gain: 0.12, pitch: 1.0, music: true });
  },
  post: null,
};
