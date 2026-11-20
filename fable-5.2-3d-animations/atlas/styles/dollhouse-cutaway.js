window.STYLES = window.STYLES || {};
STYLES['dollhouse-cutaway'] = {
  id: 'dollhouse-cutaway', name: 'Dollhouse Cutaway',
  family: 'Stage and play',
  use: 'Explainer',
  look: 'A doll\'s house with its front wall taken away. Each room is a small lit box with simple furniture. Thin coloured lines run through the walls from the meter to each room, and the sky outside the windows changes with the time of day.',
  motion: 'The camera looks straight on and slowly pushes in. Rooms light up one at a time, and light pulses travel along the coloured lines toward the rooms that use power at that hour.',
  shownHere: 'Where a home\'s electricity goes in a day: it comes in at the meter; in the morning the kitchen uses it; in the day the fridge and the washer run; the evening is the peak, with every room on; at night the heater and the chargers use it.',
  goodFor: 'Flows through a building or a system: energy, water, data, people. Any "where does it go, and when" question with a few places to compare.',
  fonts: ['Nunito:wght@700;800'],
  duration: 12,
  samples: 4,
  // CONTENT: rooms (column, floor), the colour of their line, and how much power each uses at each beat (0 to 1)
  rooms: [
    { name: 'Kitchen', col: 0, floor: 0, color: '#ff8a3d', use: [0, 1, 0.4, 1, 0.25] },
    { name: 'Living room', col: 1, floor: 0, color: '#4ab3ff', use: [0, 0.15, 0.15, 1, 0] },
    { name: 'Bedroom', col: 0, floor: 1, color: '#c77dff', use: [0, 0.3, 0, 0.6, 1] },
    { name: 'Laundry', col: 1, floor: 1, color: '#3ddc84', use: [0, 0, 0.8, 0.4, 0.9] },
  ],
  beats: [
    { t: 0.0, label: 'Power comes in at the meter', clock: '06:00', sky: '#3a4a7a' },
    { t: 2.4, label: 'Morning: the kitchen wakes up', clock: '07:30', sky: '#f2b880' },
    { t: 4.8, label: 'Day: the fridge and the washer run', clock: '13:00', sky: '#8cc8f0' },
    { t: 7.2, label: 'Evening: the peak, every room on', clock: '19:00', sky: '#e0705a' },
    { t: 9.6, label: 'Night: the heater and the chargers', clock: '23:30', sky: '#101830' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Nunito', RM = this.rooms, BE = this.beats;
    scene.background = new T.Color('#1a1820'); scene.add(S.camera);
    const amb = new T.HemisphereLight('#c0c8e0', '#302820', 0.5); scene.add(amb);
    const sunL = new T.DirectionalLight('#ffffff', 0.6); sunL.position.set(-4, 8, 10); scene.add(sunL);
    const std = (c, r = 0.8, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const RW = 4, RH = 2.8, RD = 3, WT = 0.18;
    // the outside: a sky panel behind the house, seen through the windows
    const skyMat = new T.MeshBasicMaterial({ color: BE[0].sky }); const sky = new T.Mesh(new T.PlaneGeometry(40, 24), skyMat); sky.position.set(0, 4, -6); scene.add(sky);
    const ground = new T.Mesh(new T.PlaneGeometry(40, 20), std('#4a5a3a')); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.01; scene.add(ground);
    // rooms: back wall with a window, side walls, floor; wallpaper per room
    const papers = ['#f3dfb8', '#d8e6ef', '#e8d6f0', '#d6efe0'];
    const roomLights = [], screens = [];
    RM.forEach((r, i) => {
      const g = new T.Group(); g.position.set((r.col - 0.5) * (RW + WT), r.floor * (RH + WT), 0); scene.add(g);
      const wall = std(papers[i], 0.9), floorM = std(r.floor ? '#a07850' : '#b08a5a', 0.7);
      const back = new T.Shape([new T.Vector2(-RW / 2, 0), new T.Vector2(RW / 2, 0), new T.Vector2(RW / 2, RH), new T.Vector2(-RW / 2, RH)]);
      const win = new T.Path(); win.moveTo(-0.5, 1.2); win.lineTo(0.5, 1.2); win.lineTo(0.5, 2.2); win.lineTo(-0.5, 2.2); win.lineTo(-0.5, 1.2); back.holes.push(win);
      const bw = new T.Mesh(new T.ShapeGeometry(back), wall); bw.position.z = -RD / 2; bw.receiveShadow = true; g.add(bw);
      const fl = new T.Mesh(new T.PlaneGeometry(RW, RD), floorM); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; g.add(fl);
      const ceil = new T.Mesh(new T.PlaneGeometry(RW, RD), std('#f4f0e8')); ceil.rotation.x = Math.PI / 2; ceil.position.y = RH; g.add(ceil);
      [-1, 1].forEach(s => { const sw = new T.Mesh(new T.PlaneGeometry(RD, RH), wall); sw.rotation.y = -s * Math.PI / 2; sw.position.set(s * RW / 2, RH / 2, 0); sw.receiveShadow = true; g.add(sw); });
      const frame = new T.Mesh(new T.BoxGeometry(1.1, 0.08, 0.1), std('#ffffff')); frame.position.set(0, 1.2, -RD / 2 + 0.04); g.add(frame);
      // furniture
      const add = (geo, mat, x, y, z) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); return m; };
      if (i === 0) { add(new T.BoxGeometry(2.4, 0.9, 0.7), std('#6a8aa0'), -0.4, 0.45, -1.1); add(new T.BoxGeometry(0.8, 1.9, 0.7), std('#f4f4f4', 0.4), 1.4, 0.95, -1.1); add(new T.CylinderGeometry(0.13, 0.15, 0.28, 16), std('#d0d0d8', 0.3, { metalness: 0.7 }), -1.0, 1.04, -1.1); }
      if (i === 1) { add(new T.BoxGeometry(2.0, 0.5, 0.8), std('#b04a4a'), 0, 0.25, 0.4); add(new T.BoxGeometry(2.0, 0.5, 0.25), std('#a04040'), 0, 0.6, 0.75); screens.push(add(new T.BoxGeometry(1.4, 0.8, 0.06), std('#111', 0.3, { emissive: '#6ac0ff', emissiveIntensity: 0 }), 0, 1.4, -1.42)); add(new T.BoxGeometry(1.6, 0.4, 0.4), std('#5a4030'), 0, 0.2, -1.25); }
      if (i === 2) { add(new T.BoxGeometry(2.2, 0.45, 1.6), std('#f0e8e0'), -0.4, 0.3, -0.5); add(new T.BoxGeometry(2.2, 0.8, 0.12), std('#6a4a8a'), -0.4, 0.6, -1.35); add(new T.BoxGeometry(0.5, 0.5, 0.5), std('#8a6a4a'), 1.3, 0.25, -1.1); screens.push(add(new T.BoxGeometry(0.16, 0.02, 0.28), std('#111', 0.3, { emissive: '#3ddc84', emissiveIntensity: 0 }), 1.3, 0.51, -1.1)); }
      if (i === 3) { add(new T.BoxGeometry(0.9, 1.0, 0.8), std('#f4f4f4', 0.4), -1.2, 0.5, -1.05); add(new T.CylinderGeometry(0.28, 0.28, 0.05, 24), std('#222', 0.2), -1.2, 0.55, -0.64).rotation.x = Math.PI / 2; screens.push(add(new T.BoxGeometry(1.2, 0.6, 0.15), std('#e8e8e8', 0.5, { emissive: '#ff6a3a', emissiveIntensity: 0 }), 0.9, 0.5, -1.4)); }
      // the ceiling lamp and its light
      const bulb = add(new T.SphereGeometry(0.12, 16, 12), std('#fff', 0.3, { emissive: '#ffd890', emissiveIntensity: 0 }), 0, RH - 0.25, 0);
      const pl = new T.PointLight('#ffd8a0', 0, 7, 1.5); pl.position.set(0, RH - 0.45, 0.2); pl.castShadow = i < 2; pl.shadow.mapSize.set(512, 512); pl.shadow.bias = -0.003; g.add(pl);
      roomLights.push({ pl, bulb, g });
      const tag = K.label(r.name, { font: F, weight: 800, px: 56, color: '#ffffff', bg: 'rgba(20,20,30,0.7)', radius: 12, pad: 0.25, height: 0.3 }); tag.position.set(-RW / 2 + 0.75, RH - 0.3, 0.6); g.add(tag);
    });
    // the cut edges of the walls and floors, the roof
    const cut = std('#e8e0d4', 0.7);
    [[0, -WT / 2, 2 * RW + 3 * WT, WT], [0, RH + WT / 2, 2 * RW + 3 * WT, WT], [0, 2 * RH + 1.5 * WT, 2 * RW + 3 * WT, WT]].forEach(([x, y, w, h]) => { const m = new T.Mesh(new T.BoxGeometry(w, h, RD + 0.1), cut); m.position.set(x, y, 0); m.castShadow = m.receiveShadow = true; scene.add(m); });
    [-(RW + 1.5 * WT), 0, RW + 1.5 * WT].forEach(x => { const m = new T.Mesh(new T.BoxGeometry(WT, 2 * RH + 2 * WT, RD + 0.1), cut); m.position.set(x, RH + WT / 2, 0); m.castShadow = true; scene.add(m); });
    const roofS = new T.Shape([new T.Vector2(-RW - 0.6, 0), new T.Vector2(RW + 0.6, 0), new T.Vector2(0, 2.2)]);
    const roof = new T.Mesh(new T.ExtrudeGeometry(roofS, { depth: RD + 0.4, bevelEnabled: false }), std('#8a3a2a', 0.7)); roof.position.set(0, 2 * RH + 2 * WT, -RD / 2 - 0.2); roof.castShadow = true; scene.add(roof);
    // the meter on the outside wall, and the clock on the roof
    const meter = new T.Mesh(new T.BoxGeometry(0.6, 0.8, 0.3), std('#c8c8d0', 0.4, { metalness: 0.5, emissive: '#ffd040', emissiveIntensity: 0.2 })); meter.position.set(-RW - 0.6, 1.0, 0.6); meter.castShadow = true; scene.add(meter);
    const meterTag = K.label('Meter', { font: F, weight: 800, px: 48, color: '#ffffff', bg: 'rgba(20,20,30,0.7)', radius: 12, pad: 0.2, height: 0.26 }); meterTag.position.set(-RW - 0.9, 1.75, 0.8); scene.add(meterTag);
    const pole = new T.Mesh(new T.CylinderGeometry(0.08, 0.1, 6, 8), std('#5a4030')); pole.position.set(-RW - 2.8, 3, -1.5); scene.add(pole);
    const clocks = BE.map(b => { const l = K.label(b.clock, { font: F, weight: 800, px: 72, color: '#1a1820', bg: '#fff4d6', radius: 16, pad: 0.25, height: 0.42 }); l.position.set(RW + 2.0, 2 * RH - 0.2, 0.6); scene.add(l); return l; });
    // the lines: a tube from the meter through the walls to each room, with pulses that travel along it
    const stripe = K.canvasTex(128, 8, (g, r, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,0.75)'; g.fillRect(0, 0, w * 0.6, h); }, 1);
    const LX = -RW - 0.6, Z = -RD / 2 + 0.06;
    const paths = [
      [[LX, 1.0, 0.6], [LX, 1.0, Z], [LX, 0.7, Z], [-RW - WT, 0.7, Z], [-RW / 2 - 0.4, 0.7, Z], [-RW / 2 - 0.4, 1.0, Z]],
      [[LX, 1.0, 0.6], [LX, 1.0, Z], [LX, 0.45, Z], [-RW - WT, 0.45, Z], [RW / 2 + 0.6, 0.45, Z], [RW / 2 + 0.6, 1.0, Z]],
      [[LX, 1.0, 0.6], [LX, 1.0, Z], [LX, RH + 0.55, Z], [-RW - WT, RH + 0.55, Z], [-RW / 2 + 0.9, RH + 0.55, Z], [-RW / 2 + 0.9, RH + 1.0, Z]],
      [[LX, 1.0, 0.6], [LX, 1.0, Z], [LX, RH + 0.35, Z], [-RW - WT, RH + 0.35, Z], [RW / 2 - 0.2, RH + 0.35, Z], [RW / 2 - 0.2, RH + 1.0, Z]],
    ];
    const lines = RM.map((r, i) => {
      const curve = new T.CurvePath(); const P = paths[i].map(p => new T.Vector3(...p)); for (let k = 0; k < P.length - 1; k++) curve.add(new T.LineCurve3(P[k], P[k + 1]));
      const tex = stripe.clone(); tex.wrapS = T.RepeatWrapping; tex.repeat.set(curve.getLength() * 2.5, 1); tex.needsUpdate = true;
      const m = new T.Mesh(new T.TubeGeometry(curve, 300, 0.07, 8, false), new T.MeshBasicMaterial({ color: r.color, map: tex, transparent: true, opacity: 0.3 })); scene.add(m); return { m, tex };
    });
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 800, px: 72, color: '#ffffff', bg: 'rgba(20,20,30,0.8)', radius: 16, pad: 0.35, height: 0.42 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([{ t: 0, pos: [0, 3.4, 18.5], look: [0, 3.2, 0] }, { t: 12, pos: [0.3, 3.2, 15.5], look: [0.2, 3.0, 0] }], S.camera);
    const c0 = new T.Color(), c1 = new T.Color();
    // how much each room uses at time t: blend between beats
    const useAt = (r, t) => { let k = 0; for (let i = 1; i < B.length; i++) if (t >= B[i]) k = i; const u = k ? K.prog(t, B[k], B[k] + 0.6, 'inOut') : 1; return K.lerp(k ? r.use[k - 1] : 0, r.use[k], u); };
    return (t, realT) => {
      cam(t);
      let k = 0; for (let i = 1; i < B.length; i++) if (t >= B[i]) k = i;
      const u = k ? K.prog(t, B[k], B[k] + 0.8, 'inOut') : 1;
      skyMat.color.copy(c0.set(BE[Math.max(0, k - 1)].sky)).lerp(c1.set(BE[k].sky), u);
      const daylight = [0.4, 0.8, 1.2, 0.6, 0.15][k];
      sunL.intensity = daylight; amb.intensity = 0.08 + 0.35 * daylight;
      RM.forEach((r, i) => {
        const w = useAt(r, t), lit = K.clamp(w * 1.6);
        roomLights[i].pl.intensity = 16 * lit; roomLights[i].bulb.material.emissiveIntensity = 2.5 * lit;
        lines[i].tex.offset.x = -realT * (0.6 + 2.2 * w); lines[i].m.material.opacity = 0.35 + 0.65 * K.clamp(w * 1.4);
      });
      screens[0].material.emissiveIntensity = 1.5 * K.clamp(useAt(RM[1], t) * 1.2 - 0.2); // TV
      screens[1].material.emissiveIntensity = 1.5 * K.clamp(useAt(RM[2], t) * 1.2 - 0.3); // charger
      screens[2].material.emissiveIntensity = 0.8 * K.clamp(useAt(RM[3], t) - 0.3); // heater
      meter.material.emissiveIntensity = 0.2 + 0.6 * Math.abs(Math.sin(realT * (2 + 6 * RM.reduce((s, r) => s + useAt(r, t), 0) / 4)));
      clocks.forEach((l, i) => { l.visible = i === k; });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.05 }); k.bed('night', { gain: 0.02 });
    k.play('hum', { t: 0.2, gain: 0.2, pitch: 1.0, dur: 1.6 }); k.play('click', { t: 0.4, gain: 0.3, pitch: 0.8 });
    k.play('click', { t: B[1] + 0.1, gain: 0.35, pitch: 1.1 }); k.play('bubble', { t: B[1] + 0.6, gain: 0.25, pitch: 1.0 }); k.play('chime', { t: B[1] + 0.3, gain: 0.1, pitch: 1.2, music: true });
    k.play('hum', { t: B[2] + 0.2, gain: 0.2, pitch: 0.7, dur: 2.0 }); k.play('splash', { t: B[2] + 0.8, gain: 0.15, pitch: 1.4, dur: 1.0 });
    [0, 0.2, 0.4, 0.6].forEach((d, i) => k.play('click', { t: B[3] + 0.1 + d, gain: 0.3, pitch: 0.9 + i * 0.1 })); k.play('riser', { t: B[3] + 0.3, gain: 0.12, pitch: 1.0, dur: 1.4 }); k.play('chime', { t: B[3] + 0.4, gain: 0.12, pitch: 1.0, music: true });
    k.play('click', { t: B[4] + 0.1, gain: 0.3, pitch: 0.7 }); k.play('click', { t: B[4] + 0.3, gain: 0.3, pitch: 0.65 }); k.play('blip', { t: B[4] + 0.8, gain: 0.15, pitch: 1.5 }); k.play('hum', { t: B[4] + 0.5, gain: 0.15, pitch: 0.5, dur: 2.0 });
  },
  post: null,
};
