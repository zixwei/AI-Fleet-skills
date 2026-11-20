window.STYLES = window.STYLES || {};
STYLES['clockwork-orrery'] = {
  id: 'clockwork-orrery', name: 'Clockwork Orrery',
  family: 'Machines that explain',
  use: 'Explainer',
  look: 'A brass orrery under a glass dome on a library desk: polished gears, engraved rings, thin brass arms and glossy enamel spheres. Warm lamp light, books and dust in the air.',
  motion: 'Gears turn the arms that carry the spheres. Each beat engages one more gear train with a click, and a new motion joins the machine.',
  shownHere: "Why we have seasons: Earth circles the Sun with its axis tilted 23.4°, and the axis keeps pointing the same way, so in June the north leans toward the Sun and in December the south does.",
  goodFor: 'Astronomy, cycles and any system of linked motions: one thing turns, and other things turn because of it.',
  fonts: ['Cormorant Garamond:wght@700'],
  duration: 11,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Earth circles the Sun once a year' },
    { t: 2.7, label: 'Its axis is tilted 23.4°' },
    { t: 5.4, label: 'June: the north leans toward the Sun' },
    { t: 8.1, label: 'December: the south gets the direct light' },
  ],
  months: ['MARCH', 'JUNE', 'SEPTEMBER', 'DECEMBER'],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Cormorant Garamond';
    scene.background = new T.Color('#120c08'); scene.fog = new T.Fog('#120c08', 14, 30); scene.add(S.camera);
    const L = K.lights(S, 'lamp', { size: 6, target: [0, 1, 0] }); L.key.position.set(-5, 8, 5); L.key.intensity = 1.6; L.amb.intensity = 0.45; S.scene.environmentIntensity = 0.7;
    const brass = new T.MeshStandardMaterial({ color: '#d4a548', metalness: 1, roughness: 0.28 });
    const darkBrass = new T.MeshStandardMaterial({ color: '#9a7330', metalness: 1, roughness: 0.38 });
    // desk, books
    const desk = new T.Mesh(new T.BoxGeometry(20, 0.5, 10), new T.MeshStandardMaterial({ color: '#3e2616', roughness: 0.5, map: K.canvasTex(1024, 512, (g, r, w, h) => { g.fillStyle = '#3e2616'; g.fillRect(0, 0, w, h); for (let i = 0; i < 200; i++) { g.strokeStyle = `rgba(15,6,2,${r.range(0.05, 0.25)})`; g.lineWidth = r.range(1, 4); const y = r() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + r.range(-20, 20), w * 0.7, y + r.range(-20, 20), w, y); g.stroke(); } }, 2) }));
    desk.position.y = -0.25; desk.receiveShadow = true; scene.add(desk);
    const br = K.rng(5);
    for (let i = 0; i < 5; i++) { const b = new T.Mesh(new T.BoxGeometry(br.range(1.6, 2.2), br.range(0.25, 0.4), br.range(1.2, 1.5)), new T.MeshStandardMaterial({ color: br.pick(['#5a1a1a', '#1f3a2a', '#2a2a4a', '#6a4a20']), roughness: 0.7 })); b.position.set(-5.2 + br.range(-0.1, 0.1), 0.18 + i * 0.36, -1.5); b.rotation.y = br.range(-0.2, 0.2); b.castShadow = true; scene.add(b); }
    // base: a stepped plinth with an engraved month ring
    const ringTex = K.canvasTex(1024, 1024, (g, r, w, h) => { g.fillStyle = '#c9963a'; g.fillRect(0, 0, w, h); g.translate(w / 2, h / 2); g.strokeStyle = '#5a3c10'; g.lineWidth = 6; [460, 380].forEach(rr => { g.beginPath(); g.arc(0, 0, rr, 0, 7); g.stroke(); });
      for (let i = 0; i < 48; i++) { g.save(); g.rotate(i / 48 * 6.283); g.fillStyle = '#5a3c10'; g.fillRect(-2, -460, 4, i % 4 ? 18 : 36); g.restore(); }
      g.fillStyle = '#4a300c'; g.font = `700 54px "${F}"`; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let i = 0; i < 12; i++) { g.save(); g.rotate(i / 12 * 6.283); g.beginPath(); g.arc(0, -420, 10, 0, 7); g.fill(); g.restore(); } });
    const base = new T.Group(); scene.add(base);
    const p1 = new T.Mesh(new T.CylinderGeometry(3.3, 3.5, 0.3, 64), darkBrass); p1.position.y = 0.15; base.add(p1);
    const p2 = new T.Mesh(new T.CylinderGeometry(3.0, 3.1, 0.18, 64), [brass, new T.MeshStandardMaterial({ map: ringTex, metalness: 0.9, roughness: 0.35 }), brass]); p2.position.y = 0.39; base.add(p2);
    base.traverse(o => { o.castShadow = o.receiveShadow = true; });
    // gear helper
    const gear = (r, teeth, th = 0.08, hole = 0.15) => { const s = new T.Shape(); for (let i = 0; i <= teeth * 4; i++) { const a = i / (teeth * 4) * Math.PI * 2, rr = (i % 4 === 1 || i % 4 === 2) ? r : r * 0.88; i ? s.lineTo(rr * Math.cos(a), rr * Math.sin(a)) : s.moveTo(rr * Math.cos(a), rr * Math.sin(a)); }
      const hp = new T.Path(); hp.absarc(0, 0, hole, 0, Math.PI * 2, true); s.holes.push(hp);
      for (let k = 0; k < 5; k++) { const sp = new T.Path(), a0 = k / 5 * 6.283; sp.absarc(Math.cos(a0) * r * 0.55, Math.sin(a0) * r * 0.55, r * 0.17, 0, 6.283, true); if (r > 0.5) s.holes.push(sp); }
      const g = new T.ExtrudeGeometry(s, { depth: th, bevelEnabled: false, curveSegments: 4 }); g.rotateX(-Math.PI / 2); return new T.Mesh(g, brass); };
    // centre column and the sun
    const col = new T.Mesh(new T.CylinderGeometry(0.12, 0.16, 2.6, 24), brass); col.position.y = 1.7; scene.add(col);
    const sunMat = new T.MeshStandardMaterial({ color: '#ffb347', emissive: '#ff9a1a', emissiveIntensity: 1.6, roughness: 0.3 });
    const sun = new T.Mesh(new T.SphereGeometry(0.62, 48, 32), sunMat); sun.position.y = 3.1; scene.add(sun);
    const sunLight = new T.PointLight('#ffd9a0', 30, 16, 1.4); sunLight.position.copy(sun.position); sunLight.castShadow = true; scene.add(sunLight);
    const glowTex = K.canvasTex(128, 128, g => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,200,120,0.9)'); gr.addColorStop(1, 'rgba(255,160,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
    const glow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, transparent: true, blending: T.AdditiveBlending, depthWrite: false })); glow.scale.setScalar(3.0); glow.position.copy(sun.position); scene.add(glow);
    // gear trains: orbit (always), axis keeper (beat 2), day spin (beat 3)
    const trains = [[[0, 0.62, 0], 1.1, 40], [[1.45, 0.62, 0.35], 0.42, 16], [[-1.25, 0.62, -0.6], 0.5, 18], [[0.5, 0.62, -1.35], 0.36, 12]].map(([p, r, n]) => { const g = gear(r, n); g.position.set(...p); g.castShadow = true; scene.add(g); return g; });
    // the orbit arm and Earth
    const arm = new T.Group(); arm.position.y = 0.7; scene.add(arm);
    const R = 2.6;
    const rod = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, R, 10), brass); rod.rotation.z = Math.PI / 2; rod.position.set(R / 2, 0.05, 0); arm.add(rod);
    const post = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 2.2, 10), brass); post.position.set(R, 1.1, 0); arm.add(post);
    const keeper = new T.Group(); keeper.position.set(R, 2.4, 0); arm.add(keeper); // counter-rotates so the axis keeps its direction
    const tilt = new T.Group(); keeper.add(tilt);
    const earthTex = K.canvasTex(1024, 512, (g, r, w, h) => { g.fillStyle = '#1f5fa8'; g.fillRect(0, 0, w, h); g.fillStyle = '#3f9a5a'; for (let i = 0; i < 26; i++) { const x = r() * w, y = h * r.range(0.15, 0.85); g.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * 6.283, rr = r.range(30, 80); g.lineTo(x + Math.cos(a) * rr * 1.4, y + Math.sin(a) * rr); } g.fill(); } g.fillStyle = '#f2f2f2'; g.fillRect(0, 0, w, 34); g.fillRect(0, h - 34, w, 34); });
    const earth = new T.Mesh(new T.SphereGeometry(0.5, 48, 32), new T.MeshStandardMaterial({ map: earthTex, roughness: 0.25, metalness: 0.05 })); earth.castShadow = earth.receiveShadow = true; tilt.add(earth);
    const axis = new T.Mesh(new T.CylinderGeometry(0.015, 0.015, 1.3, 8), new T.MeshStandardMaterial({ color: '#e8e2d0', metalness: 0.5, roughness: 0.3 })); tilt.add(axis);
    const nTag = K.label('N', { font: F, weight: 700, px: 64, color: '#fff3d6', height: 0.24 }); nTag.position.y = 0.78; tilt.add(nTag);
    const moonArm = new T.Group(); tilt.parent.add(moonArm);
    const moon = new T.Mesh(new T.SphereGeometry(0.1, 24, 16), new T.MeshStandardMaterial({ color: '#cfcfcf', roughness: 0.6 })); moon.position.set(0.75, 0, 0); moonArm.add(moon);
    // glass dome
    const dome = new T.Mesh(new T.SphereGeometry(3.4, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.04, transparent: true, opacity: 0.12, clearcoat: 1, side: T.DoubleSide, depthWrite: false }));
    dome.scale.set(1, 1.25, 1); dome.position.y = 0.48; scene.add(dome);
    // a tag for the tilt and for each season
    const tags = ['23.4°', this.months[1], this.months[3]].map(s2 => { const l = K.label(s2, { font: F, weight: 700, px: 64, color: '#2a1a08', bg: '#f0d48a', radius: 8, pad: 0.35, height: 0.42 }); scene.add(l); return l; });
    // dust in the lamp light
    const ND = 160, dg = new T.BufferGeometry(), dp = new Float32Array(ND * 3), dr = K.rng(2), d0 = Array.from({ length: ND }, () => [dr.range(-6, 6), dr.range(0, 6), dr.range(-3, 3), dr() * 6]); dg.setAttribute('position', new T.BufferAttribute(dp, 3));
    scene.add(new T.Points(dg, new T.PointsMaterial({ color: '#ffe2b0', size: 0.03, transparent: true, opacity: 0.6, depthWrite: false, blending: T.AdditiveBlending })));
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 84, color: '#f6e4c0', height: 0.46 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [0, 5.4, 10.0], look: [0, 1.8, 0] },
      { t: 3.2, pos: [4.5, 5.4, 8.0], look: [0.2, 2.2, 0] },
      { t: 6.2, pos: [8.4, 5.6, 1.6], look: [0, 2.6, -0.6] },
      { t: 8.6, pos: [5.6, 5.2, 7.2], look: [0, 2.4, 0.8] },
      { t: 11, pos: [2.2, 5.6, 9.8], look: [0, 2.4, 0.6] },
    ], S.camera);
    const TILT = 23.4 * Math.PI / 180, W = new T.Vector3();
    return (t, realT) => {
      cam(t);
      // orbit angle: March at 0, June near 6 s, December near 10 s
      const keys = [[0, 0], [B[2] + 0.6, Math.PI / 2], [B[3] + 1.2, Math.PI * 1.5], [11, Math.PI * 1.6]]; let ang = 0; for (let i = 0; i < keys.length - 1; i++) if (t >= keys[i][0]) ang = K.lerp(keys[i][1], keys[i + 1][1], K.prog(t, keys[i][0], keys[i + 1][0], 'inOut'));
      arm.rotation.y = ang; trains[0].rotation.y = ang * 0.5;
      keeper.rotation.y = -ang; // the axis keeps its direction in space
      const tiltOn = K.prog(t, B[1] + 0.2, B[1] + 1.0, 'back');
      tilt.rotation.x = TILT * tiltOn;
      trains[1].position.y = 0.62 + 0.3 * (1 - K.prog(t, B[1], B[1] + 0.3)); trains[1].rotation.y = -ang * 2.75 * K.prog(t, B[1] + 0.3, B[1] + 0.4);
      const spinOn = K.prog(t, B[2], B[2] + 0.4); earth.rotation.y = realT * 3 * spinOn;
      trains[2].position.y = 0.62 + 0.3 * (1 - K.prog(t, B[2], B[2] + 0.3)); trains[2].rotation.y = realT * 2 * spinOn;
      const moonOn = K.prog(t, B[3], B[3] + 0.4); moonArm.rotation.y = realT * 1.5 * moonOn; moon.visible = moonOn > 0;
      trains[3].position.y = 0.62 + 0.3 * (1 - moonOn); trains[3].rotation.y = -realT * 3 * moonOn;
      sunMat.emissiveIntensity = 1.5 + 0.2 * Math.sin(realT * 2); glow.material.opacity = 0.75 + 0.1 * Math.sin(realT * 1.7);
      earth.getWorldPosition(W);
      const show = (l, a, b, pos) => { const p = K.prog(t, a, a + 0.4, 'back') * (b ? 1 - K.prog(t, b, b + 0.3) : 1); l.visible = p > 0.01; l.scale.setScalar(Math.max(0.001, p)); l.position.copy(pos); l.lookAt(S.camera.position); };
      show(tags[0], B[1] + 0.8, B[2], W.clone().add(new T.Vector3(0, -0.85, 0)));
      show(tags[1], B[2] + 0.4, B[3], W.clone().add(new T.Vector3(0, -0.75, 0)));
      show(tags[2], B[3] + 0.8, null, W.clone().add(new T.Vector3(0, -0.75, 0)));
      for (let i = 0; i < ND; i++) { const [x, y, z, ph] = d0[i]; dp[i * 3] = x + 0.3 * Math.sin(realT * 0.2 + ph); dp[i * 3 + 1] = y + 0.2 * Math.sin(realT * 0.3 + ph); dp[i * 3 + 2] = z; }
      dg.attributes.position.needsUpdate = true;
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.07 });
    for (let i = 0; i < 44; i++) k.play('tick', { t: 0.1 + i * 0.25, gain: 0.12, pitch: i % 2 ? 1.0 : 1.3 });
    [B[1], B[2], B[3]].forEach((b, i) => { k.play('click', { t: b + 0.3, gain: 0.5, pitch: 0.7 }); k.play('metal', { t: b + 0.32, gain: 0.25, pitch: 0.9 + i * 0.2 }); });
    k.play('hum', { t: 0.2, gain: 0.1, pitch: 1.2, dur: 10 });
    k.play('bell', { t: B[2] + 0.8, gain: 0.2, pitch: 1.0, music: true });
    k.play('bell', { t: B[3] + 1.2, gain: 0.2, pitch: 0.75, music: true });
  },
  post: null,
};
