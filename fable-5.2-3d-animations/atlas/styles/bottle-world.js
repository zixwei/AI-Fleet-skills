window.STYLES = window.STYLES || {};
STYLES['bottle-world'] = {
  id: 'bottle-world', name: 'Bottle World',
  family: 'Small worlds',
  use: 'Story',
  look: 'A small world inside a glass bottle that lies on a sunny windowsill: thick sea-green glass that bends what is inside, a cork, long steel tweezers through the neck, dust floating in the window light.',
  motion: 'The tweezers reach in through the neck and place each new piece; then the pieces grow by themselves. The camera moves slowly along the bottle with a shallow focus.',
  shownHere: 'How a coral reef forms: tiny larvae settle on rock, each polyp builds a small limestone cup, the colonies branch and grow, and over centuries the reef fills with life.',
  goodFor: 'Slow natural processes and small ecosystems: growth, colonisation, building up over time. Each beat adds a new piece through the neck.',
  fonts: ['Lora:wght@600;700'],
  duration: 11,
  samples: 4,
  dof: { aperture: 0.04 },
  // CONTENT
  beats: [
    { t: 0.0, label: 'Tiny larvae settle on bare rock' },
    { t: 2.7, label: 'Each polyp builds a limestone cup' },
    { t: 5.4, label: 'Colonies branch and grow' },
    { t: 8.1, label: 'Over centuries: a reef full of life' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Lora';
    scene.background = K.canvasTex(16, 256, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fff6e0'); gr.addColorStop(0.6, '#f2dfc0'); gr.addColorStop(1, '#c9b090'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    scene.add(S.camera);
    const L = K.lights(S, 'sun', { size: 6, target: [0, 1, 0] }); L.key.position.set(-6, 8, -6); L.key.intensity = 3.0; L.amb.intensity = 0.9; S.scene.environmentIntensity = 1.0;
    // windowsill and window
    const sill = new T.Mesh(new T.BoxGeometry(16, 0.4, 5), new T.MeshStandardMaterial({ color: '#f4f1ea', roughness: 0.5 })); sill.position.set(0, -0.2, 0); sill.receiveShadow = true; scene.add(sill);
    const frame = new T.MeshStandardMaterial({ color: '#efe9de', roughness: 0.6 });
    [[0, 3.0, -2.4, 16, 0.25], [0, 6.2, -2.4, 16, 0.25]].forEach(([x, y, z, w, h]) => { const m = new T.Mesh(new T.BoxGeometry(w, h, 0.2), frame); m.position.set(x, y, z); scene.add(m); });
    [-4, 0, 4].forEach(x => { const m = new T.Mesh(new T.BoxGeometry(0.2, 6.5, 0.2), frame); m.position.set(x, 3, -2.4); scene.add(m); });
    const pot = new T.Mesh(new T.CylinderGeometry(0.6, 0.45, 1.0, 24), new T.MeshStandardMaterial({ color: '#c8664a', roughness: 0.7 })); pot.position.set(5.2, 0.5, -1.0); pot.castShadow = true; scene.add(pot);
    for (let i = 0; i < 7; i++) { const lf = new T.Mesh(new T.SphereGeometry(0.4, 12, 8), new T.MeshStandardMaterial({ color: i % 2 ? '#4f8a4b' : '#6aa35f' })); lf.scale.set(0.3, 1.2, 0.12); const a = i / 7 * 6.28; lf.position.set(5.2 + 0.3 * Math.cos(a), 1.45, -1.0 + 0.3 * Math.sin(a)); lf.rotation.set(0.4 * Math.sin(a), a, 0.4 * Math.cos(a)); lf.castShadow = true; scene.add(lf); }
    // the bottle, lying along x
    const prof = [[0, -2.6], [1.25, -2.6], [1.35, -2.45], [1.35, 1.6], [1.2, 2.0], [0.55, 2.6], [0.42, 3.0], [0.42, 3.55], [0.5, 3.6]].map(([r, y]) => new T.Vector2(r, y));
    const glass = new T.MeshPhysicalMaterial({ color: '#e8fff4', roughness: 0.04, transmission: 1, thickness: 0.25, ior: 1.5, attenuationColor: new T.Color('#9fe0d0'), attenuationDistance: 4, clearcoat: 1, side: T.DoubleSide });
    const bottle = new T.Mesh(new T.LatheGeometry(prof, 96), glass); bottle.rotation.z = -Math.PI / 2; bottle.position.set(-0.4, 1.38, 0); scene.add(bottle);
    const cork = new T.Mesh(new T.CylinderGeometry(0.4, 0.36, 0.7, 24), new T.MeshStandardMaterial({ color: '#b8915e', roughness: 0.9, map: K.canvasTex(128, 128, (g, r, w, h) => { g.fillStyle = '#b8915e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(80,50,20,${r.range(0.1, 0.4)})`; g.fillRect(r() * w, r() * h, 2, 2); } }) }));
    cork.rotation.z = -Math.PI / 2; cork.position.set(3.85, 1.38, 0); cork.castShadow = true; scene.add(cork);
    // the world inside: sand, a rock
    const inside = new T.Group(); inside.position.set(-0.6, 0.18, 0); scene.add(inside);
    const sand = new T.Mesh(new T.BoxGeometry(4.6, 0.25, 1.6), new T.MeshStandardMaterial({ color: '#efe0b8', roughness: 1 })); sand.position.y = 0.1; sand.receiveShadow = true; inside.add(sand);
    const rock = new T.Mesh(new T.DodecahedronGeometry(0.55, 1), new T.MeshStandardMaterial({ color: '#8f8a80', roughness: 0.9, flatShading: true })); rock.scale.set(2.2, 0.6, 1.0); rock.position.set(-0.2, 0.35, 0); rock.castShadow = rock.receiveShadow = true; inside.add(rock);
    // larvae: small dots that drift down and settle
    const NL = 40, larvae = new T.InstancedMesh(new T.SphereGeometry(0.03, 8, 6), new T.MeshStandardMaterial({ color: '#ffb0a0', emissive: '#ff8070', emissiveIntensity: 0.4 }), NL); larvae.frustumCulled = false; inside.add(larvae);
    const lr = K.rng(5), L0 = Array.from({ length: NL }, () => [lr.range(-1.2, 0.9), lr.range(-0.35, 0.35), lr() * 6, lr.range(0, 1.6)]);
    // polyp cups on the rock
    const cups = []; for (let i = 0; i < 16; i++) { const c = new T.Mesh(new T.CylinderGeometry(0.06, 0.04, 0.1, 10, 1, true), new T.MeshStandardMaterial({ color: '#ffc0b0', emissive: '#ff8070', emissiveIntensity: 0.3, roughness: 0.8, side: T.DoubleSide })); c.position.set(L0[i][0], 0.62 - Math.abs(L0[i][0] + 0.2) * 0.15, L0[i][1] * 0.6); inside.add(c); cups.push(c); }
    // branching corals, grown from a seed
    const coral = (x, z, color, seed, levels, spread) => {
      const g = new T.Group(); g.position.set(x, 0.55, z); g.scale.setScalar(1.35); inside.add(g); const rr = K.rng(seed), parts = [], mat = new T.MeshStandardMaterial({ color, roughness: 0.7 });
      const grow = (parent, len, rad, lvl) => { const b = new T.Group(); parent.add(b); const m = new T.Mesh(new T.CylinderGeometry(rad * 0.7, rad, len, 8), mat); m.position.y = len / 2; m.castShadow = true; b.add(m); const tip = new T.Group(); tip.position.y = len; b.add(tip); parts.push({ b, lvl });
        if (lvl < levels) for (let k = 0; k < 2 + (rr() < 0.4 ? 1 : 0); k++) { const c = new T.Group(); tip.add(c); c.rotation.set(rr.range(-spread, spread), rr.range(0, 6.28), rr.range(-spread, spread)); grow(c, len * 0.75, rad * 0.72, lvl + 1); }
        else { const knob = new T.Mesh(new T.SphereGeometry(rad * 1.2, 8, 6), mat); tip.add(knob); } };
      grow(g, 0.32, 0.06, 0); return { g, parts, levels };
    };
    const corals = [coral(-0.9, 0.1, '#ff7a6a', 11, 4, 0.7), coral(0.2, -0.25, '#ffb347', 12, 3, 0.9), coral(0.8, 0.2, '#b07ae8', 13, 4, 0.6), coral(-0.3, 0.35, '#5fd0c0', 14, 3, 0.8)];
    const brain = new T.Mesh(new T.SphereGeometry(0.28, 24, 16, 0, 6.28, 0, 1.6), new T.MeshStandardMaterial({ color: '#d9c86a', roughness: 0.8, map: K.canvasTex(256, 128, (g, r, w, h) => { g.fillStyle = '#d9c86a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#a89040'; g.lineWidth = 3; for (let i = 0; i < 30; i++) { g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += r.range(-20, 20); y += r.range(-10, 10); g.lineTo(x, y); } g.stroke(); } }) }));
    brain.position.set(1.4, 0.22, -0.3); inside.add(brain);
    const fan = new T.Mesh(new T.CircleGeometry(0.4, 24, 0, Math.PI), new T.MeshStandardMaterial({ color: '#e85a8a', side: T.DoubleSide, transparent: true, opacity: 0.9, map: K.canvasTex(128, 64, (g, r, w, h) => { g.fillStyle = '#e85a8a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a1f3a'; for (let i = 0; i < 40; i++) { g.beginPath(); g.moveTo(w / 2, h); g.lineTo(r() * w, 0); g.stroke(); } }) })); fan.position.set(-1.6, 0.25, -0.2); inside.add(fan);
    // fish
    const fishes = [0, 1, 2, 3, 4].map(i => { const g = new T.Group(); const body = new T.Mesh(new T.SphereGeometry(0.08, 12, 8), new T.MeshStandardMaterial({ color: ['#ffb000', '#2fa3ff', '#ff5a5a', '#ffe23a', '#2fd08a'][i], roughness: 0.4 })); body.scale.set(1.8, 1, 0.6); const tail = new T.Mesh(new T.ConeGeometry(0.07, 0.12, 4), body.material); tail.rotation.z = Math.PI / 2; tail.position.x = -0.17; g.add(body, tail); inside.add(g); return g; });
    // tweezers through the neck
    const steel = new T.MeshStandardMaterial({ color: '#cfd5dc', metalness: 1, roughness: 0.25 });
    const tw = new T.Group(); scene.add(tw);
    [-1, 1].forEach(s => { const arm = new T.Mesh(new T.BoxGeometry(5.0, 0.03, 0.06), steel); arm.position.set(2.5, 0, s * 0.03); arm.rotation.y = s * 0.012; tw.add(arm); });
    const held = new T.Mesh(new T.SphereGeometry(0.07, 10, 8), new T.MeshStandardMaterial({ color: '#ff7a6a' })); held.position.set(-0.05, 0, 0); tw.add(held);
    // window light: a dusty beam
    const ND = 220, dg = new T.BufferGeometry(), dp = new Float32Array(ND * 3), dr = K.rng(8), d0 = Array.from({ length: ND }, () => [dr.range(-5, 5), dr.range(0.2, 4.5), dr.range(-2, 2), dr() * 6]); dg.setAttribute('position', new T.BufferAttribute(dp, 3));
    scene.add(new T.Points(dg, new T.PointsMaterial({ color: '#fff3d0', size: 0.03, transparent: true, opacity: 0.8, depthWrite: false, blending: T.AdditiveBlending })));
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 84, color: '#3a2a1a', height: 0.46 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [-1.2, 2.6, 6.2], look: [-0.6, 0.9, 0] },
      { t: 5.4, pos: [0.8, 2.2, 5.8], look: [-0.4, 0.9, 0] },
      { t: 11, pos: [2.4, 3.0, 7.4], look: [0.0, 1.0, 0] },
    ], S.camera);
    const MX = new T.Matrix4(), Q = new T.Quaternion(), V = new T.Vector3(), SC = new T.Vector3();
    const placeT = [0.3, B[1] + 0.2, B[2] + 0.2, B[3] + 0.2];
    return (t, realT) => {
      cam(t);
      L0.forEach(([x, z, ph, d], i) => { const u = K.prog(t, d * 0.8, d * 0.8 + 1.4, 'out'); V.set(x + 0.1 * Math.sin(realT + ph) * (1 - u), K.lerp(1.6, 0.66 - Math.abs(x + 0.2) * 0.15, u), z * 0.6); larvae.setMatrixAt(i, MX.compose(V, Q, SC.setScalar(1 - K.prog(t, B[1] + 0.3, B[1] + 1.2) * (i < 16 ? 1 : 0)))); });
      larvae.instanceMatrix.needsUpdate = true;
      cups.forEach((c, i) => { const p = K.prog(t, B[1] + 0.3 + i * 0.06, B[1] + 0.8 + i * 0.06, 'back'); c.scale.setScalar(Math.max(0.001, p)); c.visible = p > 0; });
      corals.forEach((c, ci) => { const g = K.prog(t, B[2] + ci * 0.25, B[3] + 1.2 + ci * 0.3); c.parts.forEach(({ b, lvl }) => { const s = K.clamp(g * (c.levels + 1) - lvl); b.scale.setScalar(Math.max(0.001, s)); b.visible = s > 0; }); c.g.rotation.y = 0.05 * Math.sin(realT * 0.6 + ci); });
      const life = K.prog(t, B[3] + 0.3, B[3] + 1.2);
      brain.scale.setScalar(Math.max(0.001, life)); fan.scale.setScalar(Math.max(0.001, life)); fan.rotation.z = 0.08 * Math.sin(realT * 1.3);
      fishes.forEach((f, i) => { const a = realT * (0.6 + i * 0.12) + i * 1.3; f.position.set(1.4 * Math.cos(a), 0.9 + 0.25 * Math.sin(a * 1.7 + i), 0.45 * Math.sin(a)); f.rotation.y = -a - Math.PI / 2; f.visible = life > 0.2 + i * 0.12; });
      // tweezers: in through the neck for each beat, out again
      let inn = 0; placeT.forEach(p0 => { inn = Math.max(inn, K.prog(t, p0, p0 + 0.6, 'inOut') * (1 - K.prog(t, p0 + 1.1, p0 + 1.7, 'inOut'))); });
      tw.position.set(K.lerp(4.6, -0.6, inn), 1.25 - 0.35 * inn, 0.0); tw.visible = inn > 0.01; held.visible = inn > 0.2 && (Math.floor(t * 2) % 3 !== 0 || t < B[1]);
      for (let i = 0; i < ND; i++) { const [x, y, z, ph] = d0[i]; dp[i * 3] = x + 0.3 * Math.sin(realT * 0.2 + ph); dp[i * 3 + 1] = y + 0.2 * Math.sin(realT * 0.3 + ph); dp[i * 3 + 2] = z; }
      dg.attributes.position.needsUpdate = true;
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.06 }); k.bed('water', { gain: 0.03 });
    [0.3, B[1] + 0.2, B[2] + 0.2, B[3] + 0.2].forEach((p0, i) => { k.play('glass', { t: p0 + 0.15, gain: 0.15, pitch: 1.3 }); k.play('metal', { t: p0 + 0.6, gain: 0.12, pitch: 2.0 }); k.play('bubble', { t: p0 + 0.65, gain: 0.25, pitch: 0.9 + i * 0.1 }); });
    for (let i = 0; i < 8; i++) k.play('bubble', { t: B[2] + 0.5 + i * 0.3, gain: 0.12, pitch: 1.2 + (i % 3) * 0.2 });
    k.play('chime', { t: B[3] + 1.3, gain: 0.2, pitch: 1.1, music: true });
  },
  post: null,
};
