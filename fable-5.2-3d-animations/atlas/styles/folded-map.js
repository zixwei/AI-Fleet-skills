window.STYLES = window.STYLES || {};
STYLES['folded-map'] = {
  id: 'folded-map', name: 'Folded Map',
  family: 'Small worlds',
  use: 'Explainer',
  look: 'A paper road map on a wooden table: printed parchment colours, fold creases that stay visible, terrain that rises out of the paper in relief, a red route line and pins with paper flags.',
  motion: 'The map unfolds panel by panel. Mountains rise out of the paper along the folds, the route draws itself across the map, and pins drop in at each stop.',
  shownHere: "The route of the Silk Road: caravan roads that linked Chang'an in China with the Mediterranean over about 6,400 km, through deserts and over mountain passes.",
  goodFor: 'Routes, journeys, trade, migrations and history across a region: places, distances and the land between them.',
  fonts: ['IM Fell English SC', 'IM Fell English'],
  duration: 11,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'A map of old trade roads' },
    { t: 2.7, label: 'Mountains and deserts rise' },
    { t: 5.4, label: "From Chang'an to the Mediterranean" },
    { t: 8.1, label: 'About 6,400 km of roads' },
  ],
  cities: [["Chang'an", 5.2, 0.5], ['Dunhuang', 3.7, -0.8], ['Kashgar', 1.5, -0.4], ['Samarkand', 0.0, -0.2], ['Baghdad', -3.0, 1.0], ['Constantinople', -4.8, -0.9]],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'IM Fell English SC', F2 = 'IM Fell English';
    scene.background = new T.Color('#2a1d14'); scene.fog = new T.Fog('#2a1d14', 16, 32); scene.add(S.camera);
    const L = K.lights(S, 'lamp', { size: 8, target: [0, 0, 0] }); L.key.position.set(-6, 9, 5); L.key.intensity = 3.2; L.amb.intensity = 0.7; S.scene.environmentIntensity = 0.5;
    const table = new T.Mesh(new T.PlaneGeometry(40, 30), new T.MeshStandardMaterial({ color: '#5a3a24', roughness: 0.6, map: K.canvasTex(1024, 512, (g, r, w, h) => { g.fillStyle = '#5a3a24'; g.fillRect(0, 0, w, h); for (let i = 0; i < 200; i++) { g.strokeStyle = `rgba(20,10,4,${r.range(0.05, 0.25)})`; g.lineWidth = r.range(1, 4); const y = r() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + r.range(-20, 20), w * 0.7, y + r.range(-20, 20), w, y); g.stroke(); } }, 2) }));
    table.rotation.x = -Math.PI / 2; table.position.y = -0.01; table.receiveShadow = true; scene.add(table);
    const MW = 12, MD = 7, NP = 4, PW = MW / NP;
    // the printed map
    const water = [[-5.2, 1.4, 1.4, 0.8], [-4.2, 0.6, 1.0, 0.4], [-3.8, -1.7, 0.8, 0.4], [-1.5, -1.3, 0.45, 0.8], [-2.1, 2.3, 0.7, 0.35], [-0.6, 3.1, 2.2, 0.6], [5.8, 2.8, 0.8, 0.9]];
    const mountains = [[1.8, -0.3, 0.9, 1.6, 1.0], [2.9, 1.9, 2.4, 0.6, 1.2], [3.2, -1.7, 1.6, 0.4, 0.7], [-1.0, 0.9, 1.6, 0.8, 0.5], [-3.6, 2.0, 1.0, 0.5, 0.35]];
    const toPx = (x, z, w, h) => [(x / MW + 0.5) * w, (z / MD + 0.5) * h];
    const mapTex = K.canvasTex(2048, 1194, (g, r, w, h) => {
      g.fillStyle = '#ead9b0'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(120,80,40,${r.range(0.01, 0.05)})`; g.fillRect(r() * w, r() * h, r.range(1, 4), r.range(1, 4)); }
      g.fillStyle = '#e2c88c'; [[2.9, -0.3, 1.0, 0.6], [-1.6, 1.8, 1.4, 0.7], [-3.4, 2.4, 1.2, 0.5]].forEach(([x, z, rx, rz]) => { const [px, pz] = toPx(x, z, w, h); g.beginPath(); g.ellipse(px, pz, rx / MW * w, rz / MD * h, 0, 0, 7); g.fill(); });
      water.forEach(([x, z, rx, rz]) => { const [px, pz] = toPx(x, z, w, h); g.fillStyle = '#9fc2c4'; g.beginPath(); g.ellipse(px, pz, rx / MW * w, rz / MD * h, 0.2, 0, 7); g.fill(); g.strokeStyle = '#5a7a80'; g.lineWidth = 3; g.stroke(); for (let k = 1; k < 4; k++) { g.strokeStyle = 'rgba(90,122,128,0.35)'; g.beginPath(); g.ellipse(px, pz, rx / MW * w + k * 10, rz / MD * h + k * 10, 0.2, 0, 7); g.stroke(); } });
      mountains.forEach(([x, z, rx, rz]) => { for (let k = 0; k < 40; k++) { const [px, pz] = toPx(x + r.range(-rx, rx) * 0.8, z + r.range(-rz, rz) * 0.8, w, h); g.strokeStyle = 'rgba(110,70,40,0.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(px - 10, pz + 6); g.lineTo(px, pz - 8); g.lineTo(px + 10, pz + 6); g.stroke(); } });
      g.strokeStyle = 'rgba(110,80,40,0.25)'; g.lineWidth = 1; for (let i = 1; i < 12; i++) { g.beginPath(); g.moveTo(i * w / 12, 0); g.lineTo(i * w / 12, h); g.stroke(); } for (let i = 1; i < 7; i++) { g.beginPath(); g.moveTo(0, i * h / 7); g.lineTo(w, i * h / 7); g.stroke(); }
      g.strokeStyle = '#6a4a2a'; g.lineWidth = 10; g.strokeRect(20, 20, w - 40, h - 40);
      g.fillStyle = '#5a3a1a'; g.font = `400 64px "${F}"`; g.fillText('THE SILK ROAD', 70, 110);
      g.save(); g.translate(w - 160, h - 160); g.strokeStyle = '#6a4a2a'; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 80, 0, 7); g.stroke(); g.fillStyle = '#8a1c1c'; g.beginPath(); g.moveTo(0, -100); g.lineTo(18, 0); g.lineTo(0, 100); g.lineTo(-18, 0); g.fill(); g.fillStyle = '#5a3a1a'; g.font = `400 40px "${F}"`; g.textAlign = 'center'; g.fillText('N', 0, -112); g.restore();
      g.strokeStyle = 'rgba(70,45,20,0.45)'; g.lineWidth = 5; for (let i = 1; i < NP; i++) { g.beginPath(); g.moveTo(i * w / NP, 0); g.lineTo(i * w / NP, h); g.stroke(); } g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
    }, 9);
    // height of the land at map point (x, z)
    const hAt = (x, z) => { let hh = 0; mountains.forEach(([mx, mz, rx, rz, amp]) => { const d = ((x - mx) / rx) ** 2 + ((z - mz) / rz) ** 2; hh += amp * Math.exp(-d * 2.2) * (0.85 + 0.15 * Math.sin(x * 9 + z * 7)); }); water.forEach(([wx, wz, rx, rz]) => { const d = ((x - wx) / rx) ** 2 + ((z - wz) / rz) ** 2; if (d < 1) hh *= d; }); return hh; };
    // panels: each a strip of the map, hinged to the last (accordion)
    const mapMat = new T.MeshStandardMaterial({ map: mapTex, roughness: 0.9, side: T.DoubleSide });
    const panels = [], root = new T.Group(); root.position.set(-MW / 2, 0.02, 0); scene.add(root);
    let parent = root;
    for (let i = 0; i < NP; i++) {
      const hinge = new T.Group(); if (i) hinge.position.x = PW; parent.add(hinge);
      const geo = new T.PlaneGeometry(PW, MD, 40, 80).rotateX(-Math.PI / 2); geo.translate(PW / 2, 0, 0);
      const uv = geo.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setX(k, (i + uv.getX(k)) / NP);
      const mesh = new T.Mesh(geo, mapMat); mesh.castShadow = mesh.receiveShadow = true; hinge.add(mesh);
      panels.push({ hinge, mesh, geo, base: geo.attributes.position.array.slice(), i }); parent = hinge;
    }
    // route, pins and caravans
    const C = this.cities, routeCurve = new T.CatmullRomCurve3(C.map(([n, x, z]) => new T.Vector3(x, 0, z)), false, 'catmullrom', 0.4);
    const rPts = routeCurve.getPoints(200);
    const routeGeo = new T.TubeGeometry(new T.CatmullRomCurve3(rPts.map(p => new T.Vector3(p.x, hAt(p.x, p.z) + 0.06, p.z))), 300, 0.045, 6);
    const route = new T.Mesh(routeGeo, new T.MeshStandardMaterial({ color: '#b3261e', roughness: 0.5, emissive: '#5a0a08', emissiveIntensity: 0.3 })); route.castShadow = true; scene.add(route);
    const pins = C.map(([n, x, z], i) => { const g = new T.Group(); const s = new T.Mesh(new T.CylinderGeometry(0.015, 0.015, 0.8, 6), new T.MeshStandardMaterial({ color: '#c9ced6', metalness: 1, roughness: 0.3 })); s.position.y = 0.4; const hd = new T.Mesh(new T.SphereGeometry(0.08, 12, 8), new T.MeshStandardMaterial({ color: i === 0 || i === C.length - 1 ? '#b3261e' : '#2f5f8a', roughness: 0.4 })); hd.position.y = 0.8; const fl = K.label(n, { font: F2, weight: 400, px: 60, color: '#2a1a0a', bg: '#f6ecd2', radius: 4, pad: 0.3, height: 0.3, lit: true }); fl.position.set(fl.userData.w / 2 + 0.05, 0.62, 0); g.add(s, hd, fl); g.traverse(o => { o.castShadow = true; }); g.position.set(x, hAt(x, z), z); scene.add(g); return g; });
    const camels = [0, 1, 2].map(() => { const g = new T.Group(); const m = new T.MeshStandardMaterial({ color: '#5a3a1a', roughness: 0.8 }); const body = new T.Mesh(new T.SphereGeometry(0.1, 10, 8), m); body.scale.set(1.6, 1, 0.8); body.position.y = 0.2; const hump = new T.Mesh(new T.SphereGeometry(0.06, 8, 6), m); hump.position.set(0, 0.3, 0); const neck = new T.Mesh(new T.CylinderGeometry(0.025, 0.03, 0.18, 6), m); neck.position.set(0.17, 0.3, 0); neck.rotation.z = -0.5; const head = new T.Mesh(new T.SphereGeometry(0.04, 8, 6), m); head.position.set(0.23, 0.39, 0); g.add(body, hump, neck, head); for (let k = 0; k < 4; k++) { const l = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 0.16, 4), m); l.position.set(k < 2 ? 0.1 : -0.1, 0.08, k % 2 ? 0.04 : -0.04); g.add(l); } g.traverse(o => { o.castShadow = true; }); scene.add(g); return g; });
    const distTag = K.label('about 6,400 km', { font: F, weight: 400, px: 70, color: '#f6ecd2', bg: '#8a1c1c', radius: 6, pad: 0.35, height: 0.42 }); scene.add(distTag);
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 400, px: 84, color: '#f6ecd2', height: 0.44 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.76, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [-6.5, 6.0, 7.5], look: [-4.0, 0.2, 0] },
      { t: 2.7, pos: [0.0, 9.5, 8.5], look: [0.0, 0.0, 0.2] },
      { t: 5.4, pos: [5.5, 6.5, 8.0], look: [2.5, 0.4, 0] },
      { t: 8.1, pos: [-1.0, 8.0, 9.5], look: [-1.0, 0.3, 0.2] },
      { t: 11, pos: [0.0, 10.5, 9.8], look: [0.0, 0.0, 0.3] },
    ], S.camera);
    const V = new T.Vector3();
    return (t, realT) => {
      cam(t);
      const unfold = K.prog(t, -0.6, 2.0, 'inOut'), rise = K.prog(t, B[1] + 0.1, B[1] + 1.6, 'out');
      panels.forEach((p, i) => {
        if (i) p.hinge.rotation.z = (i % 2 ? 1 : -1) * Math.PI * (1 - K.clamp(unfold * 1.4 - (NP - 1 - i) * 0.13)) * 0.98;
        const a = p.geo.attributes.position.array;
        for (let k = 0; k < a.length; k += 3) { const x = p.base[k] + i * PW - MW / 2, z = p.base[k + 2]; a[k + 1] = hAt(x, z) * rise + 0.004 * Math.sin(z * 2) ; }
        p.geo.attributes.position.needsUpdate = true; p.geo.computeVertexNormals();
      });
      root.position.y = 0.02 + 0.3 * (1 - unfold);
      const draw = K.prog(t, B[2] + 0.1, B[3] + 0.2, 'inOut');
      routeGeo.setDrawRange(0, Math.floor(draw * routeGeo.index.count / 36) * 36); route.visible = draw > 0 && rise > 0.99;
      // pins drop as the line passes their city (east to west)
      pins.forEach((p, i) => { const at = Math.min(0.9, i / (C.length - 1)), d = K.prog(draw, at - 0.02, at + 0.08, 'bounce'); const [n, x, z] = C[i]; p.position.set(x, hAt(x, z) * rise + (1 - d) * 2.5, z); p.visible = draw >= at - 0.02; p.rotation.y = Math.atan2(S.camera.position.x - x, S.camera.position.z - z) - Math.PI / 2 + 1.1; });
      camels.forEach((c, i) => { const u = K.clamp(((realT * 0.04 + i * 0.03) % 1) * 1.0); routeCurve.getPointAt(u, V); c.position.set(V.x, hAt(V.x, V.z) * rise, V.z + 0.15); const V2 = routeCurve.getPointAt(Math.min(1, u + 0.01)); c.rotation.y = Math.atan2(-(V2.z - V.z), V2.x - V.x); c.visible = t > B[3] + 0.3; });
      const dt = K.prog(t, B[3] + 0.8, B[3] + 1.2, 'back'); distTag.visible = dt > 0; distTag.scale.setScalar(Math.max(0.001, dt)); distTag.position.set(0.3, 1.6, 2.4); distTag.lookAt(S.camera.position);
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.05 });
    for (let i = 0; i < 3; i++) k.play('paper', { t: 0.1 + i * 0.45, gain: 0.4, pitch: 0.7 + i * 0.1, dur: 1.4 });
    k.play('rumble', { t: B[1] + 0.1, gain: 0.25, pitch: 1.3, dur: 1.6 });
    for (let i = 0; i < 6; i++) k.play('pop', { t: B[2] + 0.1 + (i / 5) * 2.8 + 0.1, gain: 0.25, pitch: 1.2 - i * 0.06 });
    k.play('swish', { t: B[2] + 0.1, gain: 0.15, pitch: 0.9, dur: 2.6 });
    k.play('bell', { t: B[3] + 0.9, gain: 0.2, pitch: 0.9, music: true });
    for (let i = 0; i < 6; i++) k.play('wood', { t: B[3] + 1.2 + i * 0.3, gain: 0.08, pitch: 1.4 });
  },
  post: null,
};
