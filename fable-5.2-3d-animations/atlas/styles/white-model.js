window.STYLES = window.STYLES || {};
STYLES['white-model'] = {
  id: 'white-model', name: 'White Model',
  family: 'Diagrams with depth',
  use: 'Explainer',
  look: "An architect's presentation model: everything is matte white card on a white board, with white trees, scale figures and furniture. One saturated accent colour marks only the thing that is explained. Soft sky light and gentle shadows.",
  motion: 'The camera orbits slowly around the model. The accent colour flows through it: dots gather, a pipe fills, lines rise. Parts of the model lift away to show the inside.',
  shownHere: 'How a heat pump heats a house: it pulls heat from cold outside air, a compressor makes it hotter, and the heat warms the rooms. About 3 units of heat come from 1 unit of electricity.',
  goodFor: 'Buildings, sites and systems in a place: where something flows and what it does there. Keep everything white and colour only the subject.',
  fonts: ['Space Grotesk:wght@500;700'],
  duration: 10,
  samples: 8,
  // CONTENT
  beats: [
    { t: 0.0, label: 'A heat pump stands outside' },
    { t: 2.5, label: 'It pulls heat from the cold air' },
    { t: 5.0, label: 'A compressor makes it hotter' },
    { t: 7.5, label: 'The heat warms every room' },
  ],
  tags: { unit: 'outdoor unit', comp: 'compressor', room: 'warm rooms', ratio: '1 kWh in → about 3 kWh of heat', outside: '2 °C outside', inside: '21 °C inside' },

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Space Grotesk', W = this.tags;
    const ACC = '#ff5a1f', BG = '#f3f3f1';
    scene.background = new T.Color(BG); scene.fog = new T.Fog(BG, 28, 55); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 9, target: [0, 1, 0] });
    L.key.position.set(-5, 13, 7); L.key.intensity = 2.5; L.key.shadow.radius = 6; L.amb.intensity = 1.1; S.scene.environmentIntensity = 0.7;
    const white = new T.MeshStandardMaterial({ color: '#f7f7f4', roughness: 0.95 }), white2 = new T.MeshStandardMaterial({ color: '#eceae5', roughness: 0.95 });
    const acc = new T.MeshStandardMaterial({ color: ACC, roughness: 0.6, emissive: ACC, emissiveIntensity: 0.15 });
    const box = (w, h, d, x, y, z, m = white, parent = scene) => { const o = new T.Mesh(new T.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
    const floor = new T.Mesh(new T.PlaneGeometry(120, 120), new T.MeshStandardMaterial({ color: BG, roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.31; floor.receiveShadow = true; scene.add(floor);
    box(15, 0.3, 10, 0.5, -0.15, 0, white);
    // the house: a cutaway (no front wall), two rooms, furniture, a lifted roof slab
    const H = new T.Group(); H.position.set(-1.8, 0, -0.6); scene.add(H);
    box(6.2, 0.15, 4.4, 0, 0.075, 0, white2, H);
    const wallH = 2.2;
    // back wall with two windows
    [[-3.0, 0.8], [-1.0, 1.4], [1.0, 1.4], [2.9, 0.6]].forEach(([x, w]) => box(w, wallH, 0.15, x + (x < 0 ? 0 : 0), wallH / 2 + 0.15, -2.12, white, H));
    [-1.9, 2.0].forEach(x => { box(0.6, 0.7, 0.15, x, 0.5, -2.12, white, H); box(0.6, 0.45, 0.15, x, wallH - 0.08, -2.12, white, H); });
    [-3.05, 3.05].forEach(x => box(0.15, wallH, 4.4, x, wallH / 2 + 0.15, 0, white, H));
    box(0.12, wallH, 3.0, 0.2, wallH / 2 + 0.15, -0.6, white, H);
    const roof = box(6.6, 0.18, 4.8, 0, wallH + 1.0, -0.1, white, H);
    // furniture
    box(1.6, 0.4, 0.6, -1.6, 0.35, -1.3, white2, H); box(1.6, 0.4, 0.2, -1.6, 0.6, -1.6, white2, H);
    box(1.0, 0.45, 1.0, -1.5, 0.37, 0.2, white2, H);
    box(1.4, 0.35, 1.9, 1.7, 0.33, -0.9, white2, H); box(1.4, 0.5, 0.12, 1.7, 0.55, -1.86, white2, H);
    box(0.6, 0.5, 0.4, 2.6, 0.4, 0.8, white2, H);
    // indoor heaters on the back wall (they glow at the end)
    const heaters = [[-1.0, -1.95], [1.0, -1.95]].map(([x, z]) => box(1.0, 0.55, 0.14, x, 0.6, z, white, H));
    const heatMat = heaters.map(h => { h.material = white.clone(); return h.material; });

    // outdoor unit with a fan and a cutaway side that shows the compressor
    const U = new T.Group(); U.position.set(3.6, 0, 0.9); U.rotation.y = -0.35; scene.add(U);
    box(1.8, 1.5, 0.8, 0, 0.75, 0, white, U);
    const ring = new T.Mesh(new T.TorusGeometry(0.5, 0.06, 10, 40), white); ring.position.set(-0.25, 0.8, 0.42); U.add(ring);
    const fan = new T.Group(); fan.position.set(-0.25, 0.8, 0.44); U.add(fan);
    for (let i = 0; i < 3; i++) { const b = new T.Mesh(new T.BoxGeometry(0.16, 0.42, 0.03), white2); b.position.y = 0.2; const p = new T.Group(); p.rotation.z = i * 2.094; p.add(b); fan.add(p); }
    const comp = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 0.7, 24), acc.clone()); comp.position.set(0.6, 0.55, 0.15); comp.castShadow = true; U.add(comp);
    box(0.08, 1.2, 0.6, 0.35, 0.75, 0, white2, U);

    // the refrigerant loop: an accent pipe from the unit into the house, and a white return pipe
    const pipePts = [[3.0, 0.25, 1.2], [1.6, 0.2, 1.6], [0.0, 0.2, 1.6], [-0.4, 0.2, 0.6], [-0.4, 0.6, -2.3], [-2.8, 0.6, -2.3]].map(p => new T.Vector3(...p));
    const pipeCurve = new T.CatmullRomCurve3(pipePts, false, 'catmullrom', 0.1);
    const hotGeo = new T.TubeGeometry(pipeCurve, 200, 0.07, 10), hot = new T.Mesh(hotGeo, acc); hot.castShadow = true; scene.add(hot);
    const retCurve = new T.CatmullRomCurve3(pipePts.map(p => p.clone().add(new T.Vector3(0.2, 0, 0.18))), false, 'catmullrom', 0.1);
    const ret = new T.Mesh(new T.TubeGeometry(retCurve, 200, 0.06, 10), white); ret.castShadow = true; scene.add(ret);

    // heat dots in the outside air that gather into the fan
    const ND = 160, dots = new T.InstancedMesh(new T.SphereGeometry(0.05, 8, 6), new T.MeshBasicMaterial({ color: ACC }), ND); scene.add(dots);
    const dr = K.rng(9), dp = [];
    for (let i = 0; i < ND; i++) { const a = dr.range(-1.4, 2.4), r = dr.range(1.6, 4.5); dp.push([3.6 + r * Math.cos(a), dr.range(0.4, 3.5), 0.9 + r * Math.sin(a), dr()]); }
    // rising warm lines in the rooms
    const waves = [];
    [[-1.0, -1.7], [1.0, -1.7]].forEach(([x, z]) => { for (let k = 0; k < 3; k++) {
      const pts = Array.from({ length: 20 }, (_, i) => new T.Vector3(x - 0.3 + k * 0.3 + 0.08 * Math.sin(i * 0.9 + k), 0.9 + i * 0.07, z + i * 0.03));
      const m = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 40, 0.025, 6), new T.MeshBasicMaterial({ color: ACC, transparent: true, opacity: 0 })); m.position.copy(H.position); scene.add(m); waves.push(m);
    } });

    // white scale figures, lollipop trees, a fence, a car
    const fig = (x, z, r) => { const g = new T.Group(); box(0.14, 0.42, 0.1, 0, 0.36, 0, white, g); const hd = new T.Mesh(new T.SphereGeometry(0.075, 12, 8), white); hd.position.y = 0.66; hd.castShadow = true; g.add(hd); g.position.set(x, 0, z); g.rotation.y = r; scene.add(g); };
    fig(1.6, 2.6, 0.3); fig(2.0, 2.9, -0.5); fig(-4.7, 2.7, 1.0); fig(5.4, -2.6, 2.5);
    const tr = K.rng(4);
    [[-6.0, -3.6], [-6.2, 1.6], [6.3, -3.5], [6.6, 2.8], [5.0, -3.9], [-5.4, -1.0], [4.4, 3.6]].forEach(([x, z]) => {
      const s = tr.range(0.8, 1.2), trunk = new T.Mesh(new T.CylinderGeometry(0.04, 0.05, 1.2 * s, 8), white); trunk.position.set(x, 0.6 * s, z); trunk.castShadow = true; scene.add(trunk);
      const crown = new T.Mesh(new T.IcosahedronGeometry(0.6 * s, 1), white); crown.position.set(x, 1.4 * s, z); crown.castShadow = true; scene.add(crown);
    });
    for (let i = 0; i < 18; i++) box(0.06, 0.4, 0.06, -6.6 + i * 0.75, 0.2, 4.4, white);
    box(13.2, 0.05, 0.04, -0.2, 0.33, 4.4, white);
    const car = new T.Group(); box(1.6, 0.4, 0.75, 0, 0.35, 0, white, car); box(0.9, 0.32, 0.7, -0.1, 0.7, 0, white, car); car.position.set(-5.6, 0, 3.2); car.rotation.y = 0.1; scene.add(car);

    // labels: small black type on white cards, and a big result card at the end
    const tag = (txt, color = '#1c1c1c', bg = '#ffffff', h = 0.44) => { const l = K.label(txt, { font: F, weight: 700, px: 56, color, bg, radius: 8, pad: 0.35, height: h }); scene.add(l); return l; };
    const tUnit = tag(W.unit), tComp = tag(W.comp, '#ffffff', ACC), tRoom = tag(W.room, '#ffffff', ACC), tRatio = tag(W.ratio, '#ffffff', ACC, 0.6);
    const tOut = tag(W.outside, '#1c1c1c', '#ffffff', 0.38), tIn = tag(W.inside, '#1c1c1c', '#ffffff', 0.38);
    tUnit.position.set(3.7, 2.1, 1.2); tComp.position.set(4.6, 1.6, 1.6); tRoom.position.set(-1.8, 2.75, 1.9); tRatio.position.set(0.0, 1.0, 4.4);
    tOut.position.set(5.0, 2.7, -1.2); tIn.position.set(-4.3, 2.9, -0.4);
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 84, color: '#1c1c1c', height: 0.46 });
      l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.78, -8); S.camera.add(l); return l; });

    const MX = new T.Matrix4(), Q = new T.Quaternion(), V = new T.Vector3(), SC = new T.Vector3(), center = new T.Vector3(0.3, 1.0, 0);
    return (t, realT) => {
      const ang = K.lerp(-0.45, 0.25, t / 10), rad = 19.5 - 1.5 * K.prog(t, 0, 4, 'inOut') + 1.0 * K.prog(t, 7, 10, 'inOut');
      S.camera.position.set(center.x + rad * Math.sin(ang), 10.0 - 1.0 * K.prog(t, 0, 10), center.z + rad * Math.cos(ang));
      S.camera.lookAt(center); S.camera.userData.look = center;
      const pull = K.prog(t, B[1] + 0.2, B[2] + 0.4), spinRate = 2 + 10 * K.prog(t, B[1], B[1] + 0.8);
      fan.rotation.z = -(realT * spinRate);
      for (let i = 0; i < ND; i++) {
        const [x, y, z, ph] = dp[i], u = K.clamp((pull * 1.6 - ph * 0.6) * 1.0);
        V.set(x + 0.15 * Math.sin(realT * 0.7 + ph * 9), y + 0.12 * Math.sin(realT * 0.9 + ph * 7), z);
        V.lerp(new T.Vector3(3.48, 0.8, 1.35), K.ease.in(u));
        const vis = K.prog(t, B[1] - 0.2, B[1] + 0.4) * (u < 0.98 ? 1 : 0);
        dots.setMatrixAt(i, MX.compose(V, Q, SC.setScalar(Math.max(0.0001, vis * (1 - 0.5 * u)))));
      }
      dots.instanceMatrix.needsUpdate = true;
      const squeeze = K.prog(t, B[2], B[2] + 0.6);
      comp.material.emissiveIntensity = 0.15 + 1.4 * squeeze * (0.8 + 0.2 * Math.sin(realT * 10)); comp.scale.set(1 + 0.05 * squeeze * Math.sin(realT * 18), 1, 1);
      const fillP = K.prog(t, B[2] + 0.3, B[3] + 0.3, 'inOut');
      hotGeo.setDrawRange(0, Math.floor(fillP * hotGeo.index.count / 60) * 60); hot.visible = fillP > 0.01;
      acc.emissiveIntensity = 0.15 + 0.35 * fillP;
      const warm = K.prog(t, B[3] + 0.2, B[3] + 1.0);
      heatMat.forEach(m => { m.color.set('#f7f7f4').lerp(new T.Color(ACC), warm); m.emissive.set(ACC); m.emissiveIntensity = 0.3 * warm; });
      waves.forEach((w, i) => { w.material.opacity = warm * (0.55 + 0.45 * Math.sin(realT * 2 + i)); w.position.y = 0.15 * ((realT * 0.4 + i * 0.3) % 1); });
      roof.position.y = wallH + 1.0 + 0.6 * K.prog(t, B[3], B[3] + 0.8, 'inOut');
      const show = (l, a, b) => { const p = K.prog(t, a, a + 0.35, 'back') * (b ? 1 - K.prog(t, b, b + 0.3) : 1); l.visible = p > 0.01; l.scale.setScalar(Math.max(0.001, p)); l.lookAt(S.camera.position); };
      show(tUnit, 0.3, B[2]); show(tOut, B[1] + 0.3); show(tComp, B[2] + 0.4); show(tIn, B[3] + 0.3); show(tRoom, B[3] + 0.6); show(tRatio, B[3] + 1.2);
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.07 });
    k.play('paper', { t: 0.35, gain: 0.3 });
    k.play('hum', { t: B[1], gain: 0.25, pitch: 1.8, dur: 2.4 });
    k.play('whoosh', { t: B[1] + 0.3, gain: 0.3, pitch: 0.8, dur: 2.0 });
    k.play('hum', { t: B[2], gain: 0.35, pitch: 1.0, dur: 2.4 });
    k.play('riser', { t: B[2] + 0.3, gain: 0.18, pitch: 0.8, dur: 1.4 });
    k.play('swish', { t: B[3], gain: 0.25, pitch: 0.7, dur: 1.2 });
    k.play('chime', { t: B[3] + 1.2, gain: 0.22, pitch: 1.0, music: true });
    k.play('pop', { t: B[3] + 1.25, gain: 0.3, pitch: 1.2 });
  },
  post: null,
};
