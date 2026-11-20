window.STYLES = window.STYLES || {};
STYLES['cloud-room'] = {
  id: 'cloud-room', name: 'Cloud Room',
  family: 'Earth, weather and sky',
  use: 'Explainer',
  look: 'An ordinary living room with weather inside it: a sofa, a rug, a floor lamp, a window with afternoon sun. A soft white cloud gathers under the ceiling, rain falls on the rug, and a small lightning bolt hits the lamp.',
  motion: 'Warm air shimmers up from the floor. The cloud swells puff by puff and turns grey. Rain streaks fall onto the rug, the cloud flickers, a bolt jumps to the lamp with a flash, and then the cloud thins and the sun comes back through the window.',
  shownHere: 'How a thunderstorm builds: warm, damp air rises; it cools and condenses into a cloud; inside, drops and ice bump together and grow heavy; rain falls; charge builds up and jumps as lightning; the storm rains itself out and the sky clears.',
  goodFor: 'Natural processes made domestic and close: weather, the water cycle, pressure building and release, any "storm in a room" metaphor.',
  fonts: ['Nunito:wght@700;800'],
  duration: 12,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Warm, damp air rises' },
    { t: 2.4, label: 'It cools and becomes a cloud' },
    { t: 4.8, label: 'Drops grow heavy: rain falls' },
    { t: 7.2, label: 'Charge builds, then jumps: lightning' },
    { t: 9.6, label: 'The storm rains out, the sun comes back' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Nunito', BE = this.beats;
    scene.background = new T.Color('#1a1614'); scene.add(S.camera);
    const amb = new T.HemisphereLight('#fff4e6', '#7a6a5a', 1.2); scene.add(amb); const room = new T.PointLight('#ffe8cc', 10, 14, 1.2); room.position.set(1.5, 3.9, 2.5); scene.add(room);
    const sun = new T.DirectionalLight('#ffe0b0', 3.2); sun.position.set(-6, 6, -8); sun.target.position.set(0.5, 0, 0.5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 }); sun.shadow.bias = -0.0005; scene.add(sun, sun.target);
    const std = (c, r = 0.8, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    // the room: floor, two walls with a window, ceiling
    const RW = 9, RH = 4.4, RD = 8;
    const floor = new T.Mesh(new T.PlaneGeometry(RW, RD), std('#8a6040', 0.6)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const ceil = new T.Mesh(new T.PlaneGeometry(RW, RD), std('#f4efe6')); ceil.rotation.x = Math.PI / 2; ceil.position.y = RH; scene.add(ceil);
    const wallS = new T.Shape([new T.Vector2(-RW / 2, 0), new T.Vector2(RW / 2, 0), new T.Vector2(RW / 2, RH), new T.Vector2(-RW / 2, RH)]); const win = new T.Path(); win.moveTo(-2.6, 1.2); win.lineTo(-0.6, 1.2); win.lineTo(-0.6, 3.4); win.lineTo(-2.6, 3.4); win.lineTo(-2.6, 1.2); wallS.holes.push(win);
    const back = new T.Mesh(new T.ShapeGeometry(wallS), std('#d8c8b0', 0.9)); back.position.z = -RD / 2; back.receiveShadow = true; back.castShadow = true; scene.add(back);
    const side = new T.Mesh(new T.PlaneGeometry(RD, RH), std('#cbb8a0', 0.9)); side.rotation.y = Math.PI / 2; side.position.set(-RW / 2, RH / 2, 0); side.receiveShadow = true; scene.add(side);
    const sky = new T.Mesh(new T.PlaneGeometry(6, 4), new T.MeshBasicMaterial({ color: '#9ed0f0' })); sky.position.set(-1.6, 2.3, -RD / 2 - 1.5); scene.add(sky);
    [[-1.6, 1.15, 2.2, 0.1], [-1.6, 3.45, 2.2, 0.1], [-2.65, 2.3, 0.1, 2.3], [-0.55, 2.3, 0.1, 2.3], [-1.6, 2.3, 0.06, 2.2]].forEach(([x, y, w, h]) => { const m = new T.Mesh(new T.BoxGeometry(w, h, 0.12), std('#f4f0e8', 0.5)); m.position.set(x, y, -RD / 2 + 0.05); m.castShadow = true; scene.add(m); });
    // furniture: rug, sofa, coffee table, floor lamp
    const rugTex = K.canvasTex(512, 384, (g, r, w, h) => { g.fillStyle = '#7a2a3a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8c890'; g.lineWidth = 14; g.strokeRect(24, 24, w - 48, h - 48); g.strokeStyle = '#2a4a6a'; g.lineWidth = 8; g.strokeRect(60, 60, w - 120, h - 120); for (let i = 0; i < 6; i++) { g.fillStyle = '#e8c890'; g.beginPath(); g.arc(w / 2, h / 2, 20 + i * 18, 0, 7); g.lineWidth = 4; g.strokeStyle = i % 2 ? '#e8c890' : '#2a4a6a'; g.stroke(); } }, 2);
    const rug = new T.Mesh(new T.PlaneGeometry(4.2, 3.0), std('#ffffff', 0.95, { map: rugTex })); rug.rotation.x = -Math.PI / 2; rug.position.set(0.6, 0.01, 0.4); rug.receiveShadow = true; scene.add(rug);
    const sofa = new T.Group(); sofa.position.set(1.0, 0, -2.9); scene.add(sofa);
    [[0, 0.3, 0, 3.2, 0.6, 1.0], [0, 0.85, -0.4, 3.2, 0.9, 0.25], [-1.5, 0.55, 0, 0.25, 0.6, 1.0], [1.5, 0.55, 0, 0.25, 0.6, 1.0]].forEach(([x, y, z, w, h, d]) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), std('#3a6a7a', 0.9)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; sofa.add(m); });
    const ctab = new T.Mesh(new T.BoxGeometry(1.4, 0.08, 0.8), std('#6a4a2a', 0.5)); ctab.position.set(0.6, 0.45, 0.4); ctab.castShadow = true; scene.add(ctab);
    [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]].forEach(([x, z]) => { const l = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 0.45, 6), std('#4a3018')); l.position.set(0.6 + x, 0.22, 0.4 + z); scene.add(l); });
    const lamp = new T.Group(); lamp.position.set(3.4, 0, -1.8); scene.add(lamp);
    const pole = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 2.2, 8), std('#2a2a2a', 0.3, { metalness: 0.8 })); pole.position.y = 1.1; const base = new T.Mesh(new T.CylinderGeometry(0.3, 0.32, 0.06, 20), std('#2a2a2a', 0.3, { metalness: 0.8 })); base.position.y = 0.03;
    const shade = new T.Mesh(new T.CylinderGeometry(0.28, 0.45, 0.5, 24, 1, true), std('#f0e0c0', 0.8, { side: T.DoubleSide, emissive: '#ffd890', emissiveIntensity: 0.0 })); shade.position.y = 2.3;
    lamp.add(pole, base, shade); lamp.traverse(o => { if (o.isMesh) o.castShadow = true; });
    const flashL = new T.PointLight('#cfe0ff', 0, 14, 1.4); flashL.position.set(2.2, 3.4, -1.0); scene.add(flashL);
    // rising warm air: faint specks drifting up
    const NA = 220, ap = new Float32Array(NA * 3), arr = K.rng(3), aseed = Array.from({ length: NA }, () => [arr.range(-2, 3), arr.range(-1.2, 2), arr()]);
    const air = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(ap, 3)), new T.PointsMaterial({ color: '#ffffff', size: 0.05, transparent: true, opacity: 0.5, depthWrite: false })); scene.add(air);
    // the cloud: instanced soft spheres, each with its own birth time
    const NC = 70, rr = K.rng(7), puffs = [];
    for (let i = 0; i < NC; i++) { const a = rr() * Math.PI * 2, r = Math.sqrt(rr()); puffs.push({ p: new T.Vector3(0.7 + Math.cos(a) * r * 2.4, 3.55 + rr.range(-0.35, 0.25), -0.5 + Math.sin(a) * r * 1.6), s: rr.range(0.45, 0.85), born: B[1] + rr() * 1.8 }); }
    const cloudMat = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 1, emissive: '#000000' });
    const cloud = new T.InstancedMesh(new T.IcosahedronGeometry(1, 2), cloudMat, NC); cloud.castShadow = true; cloud.frustumCulled = false; scene.add(cloud);
    // rain streaks
    const NR = 300, rp = new Float32Array(NR * 6), rseed = Array.from({ length: NR }, () => [rr.range(-1.4, 2.8), rr.range(-1.6, 0.8), rr()]);
    const rain = new T.LineSegments(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(rp, 3)), new T.LineBasicMaterial({ color: '#cfe4ff', transparent: true, opacity: 0.7 })); rain.frustumCulled = false; scene.add(rain);
    // the bolt: a jagged tube from the cloud to the lamp
    const bpts = []; const b0 = new T.Vector3(1.8, 3.1, -1.2), b1 = new T.Vector3(3.4, 2.55, -1.8); for (let i = 0; i <= 8; i++) { const u = i / 8, p = b0.clone().lerp(b1, u); if (i > 0 && i < 8) p.add(new T.Vector3(rr.range(-0.2, 0.2), rr.range(-0.1, 0.1), rr.range(-0.2, 0.2))); bpts.push(p); }
    const bolt = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(bpts, false, 'catmullrom', 0.0), 40, 0.035, 6), new T.MeshBasicMaterial({ color: '#f0f6ff' })); bolt.visible = false; scene.add(bolt);
    const charges = ['+', '+', '−', '−'].map((c, i) => { const l = K.label(c, { font: F, weight: 800, px: 80, color: c === '+' ? '#ffd040' : '#80c0ff', height: 0.32 }); l.position.set(0.0 + i * 0.6, i < 2 ? 3.6 : 2.95, 0.6); l.visible = false; scene.add(l); return l; });
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 800, px: 68, color: '#3a2a1a', bg: 'rgba(255,248,236,0.9)', radius: 16, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([{ t: 0, pos: [3.0, 1.9, 6.4], look: [0.8, 1.7, -1.2] }, { t: 6, pos: [2.6, 1.7, 5.8], look: [1.2, 2.2, -1.0] }, { t: 12, pos: [3.2, 2.0, 6.6], look: [0.8, 1.8, -1.2] }], S.camera);
    const M = new T.Object3D(), C0 = new T.Color('#ffffff'), C1 = new T.Color('#5a6070'), CC = new T.Color();
    return (t, realT) => {
      cam(t);
      // air
      const aOn = 1 - K.prog(t, B[2], B[2] + 1.0);
      for (let i = 0; i < NA; i++) { const [x, z, ph] = aseed[i], y = ((realT * 0.35 + ph * 3.5) % 3.5); ap[i * 3] = x + 0.08 * Math.sin(realT * 2 + i); ap[i * 3 + 1] = y; ap[i * 3 + 2] = z; } air.geometry.attributes.position.needsUpdate = true; air.material.opacity = 0.45 * aOn;
      // cloud growth and darkening; it thins at the end
      const dark = K.prog(t, B[2] - 0.6, B[3], 'inOut') * (1 - K.prog(t, B[4] + 0.5, 11.8, 'inOut')), thin = K.prog(t, B[4] + 0.6, 11.8, 'inOut');
      puffs.forEach((pf, i) => { const g = K.prog(t, pf.born, pf.born + 0.9, 'out') * (1 - thin * (0.4 + 0.6 * (i % 3) / 2)); M.position.copy(pf.p); M.position.y += 0.04 * Math.sin(realT * 0.8 + i); M.scale.setScalar(Math.max(0.001, pf.s * g)); M.updateMatrix(); cloud.setMatrixAt(i, M.matrix); });
      cloud.instanceMatrix.needsUpdate = true; CC.copy(C0).lerp(C1, dark); cloudMat.color.copy(CC);
      // lightning
      const strike = B[3] + 1.3, f = K.clamp(1 - Math.abs(t - strike) / 0.12) + 0.6 * K.clamp(1 - Math.abs(t - strike - 0.25) / 0.08);
      bolt.visible = f > 0.05; flashL.intensity = 60 * f; cloudMat.emissive.setRGB(0.6 * f + 0.15 * dark * Math.max(0, Math.sin(realT * 23)) * K.prog(t, B[3], strike) * (t < strike ? 1 : 0), 0.6 * f, 0.7 * f);
      shade.material.emissiveIntensity = t > strike ? Math.max(0, 1.5 - (t - strike) * 3) : 0;
      charges.forEach((l, i) => { l.visible = t > B[3] + 0.2 + i * 0.1 && t < strike; l.lookAt(S.camera.position); });
      // rain
      const rOn = K.prog(t, B[2] + 0.3, B[2] + 1.0) * (1 - K.prog(t, B[4] + 0.8, B[4] + 1.8));
      for (let i = 0; i < NR; i++) { const [x, z, ph] = rseed[i], top = 3.2, y = top - ((realT * 6 + ph * top) % top), vis = rOn > ph * 0.9 + 0.05 ? 1 : 0; rp[i * 6] = x; rp[i * 6 + 1] = vis ? y : -5; rp[i * 6 + 2] = z; rp[i * 6 + 3] = x; rp[i * 6 + 4] = vis ? y + 0.22 : -5; rp[i * 6 + 5] = z; }
      rain.geometry.attributes.position.needsUpdate = true;
      // sunlight dims under the cloud and returns
      const shade2 = K.prog(t, B[1] + 0.5, B[2] + 0.5) * (1 - K.prog(t, B[4] + 0.4, 11.6));
      sun.intensity = 3.2 * (1 - 0.85 * shade2); amb.intensity = 1.2 - 0.5 * shade2 + 1.0 * f; sky.material.color.set('#9ed0f0').lerp(new T.Color('#3a4a5a'), shade2);
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.05 });
    k.play('whoosh', { t: 0.3, gain: 0.08, pitch: 0.4, dur: 2.0 });
    k.play('whoosh', { t: B[1] + 0.2, gain: 0.12, pitch: 0.3, dur: 2.0 }); k.play('rumble', { t: B[1] + 1.4, gain: 0.12, pitch: 0.6, dur: 1.5 });
    for (let i = 0; i < 18; i++) k.play('tick', { t: B[2] + 0.4 + i * 0.12, gain: 0.06 + 0.002 * i, pitch: 1.8 + (i % 4) * 0.2 }); k.play('splash', { t: B[2] + 0.5, gain: 0.12, pitch: 1.6, dur: 2.0 });
    k.play('rumble', { t: B[3] + 0.3, gain: 0.25, pitch: 0.5, dur: 1.2 }); k.play('zap', { t: B[3] + 1.3, gain: 0.5, pitch: 0.8 }); k.play('thud', { t: B[3] + 1.35, gain: 0.5, pitch: 0.5 }); k.play('rumble', { t: B[3] + 1.5, gain: 0.45, pitch: 0.4, dur: 2.0 }); k.play('glass', { t: B[3] + 1.4, gain: 0.2, pitch: 1.8 });
    k.play('splash', { t: B[4] + 0.2, gain: 0.08, pitch: 1.8, dur: 1.2 }); k.play('chime', { t: B[4] + 1.5, gain: 0.15, pitch: 1.0, music: true }); k.play('bell', { t: B[4] + 1.6, gain: 0.08, pitch: 2.0, music: true });
  },
  post: null,
};
