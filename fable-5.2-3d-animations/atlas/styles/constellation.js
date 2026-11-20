window.STYLES = window.STYLES || {};
STYLES['constellation'] = {
  id: 'constellation', name: 'Constellation',
  family: 'Living and elemental',
  use: 'Story',
  look: 'A deep night sky above a dark hill line and a calm sea. Stars brighten, thin gold lines join them into figures, and a faint engraved star-atlas drawing appears behind each figure.',
  motion: 'The whole sky turns slowly about the pole star. Lines draw from star to star, the old drawings fade in, and measuring arcs swing up from the horizon.',
  shownHere: "How ancient sailors navigated: the sky turns around one still star; the pointer stars of the Big Dipper lead to it; its height above the horizon gives your latitude; and the point where a star rises gives a bearing.",
  goodFor: 'History, navigation, astronomy and stories about finding the way: patterns that turn familiar points into a map.',
  fonts: ['Cinzel:wght@700', 'IM Fell English'],
  duration: 11,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'At night the whole sky turns' },
    { t: 2.7, label: 'Two stars point to the Pole Star' },
    { t: 5.4, label: 'Its height is your latitude' },
    { t: 8.1, label: 'A rising star gives a bearing' },
  ],
  latitude: 40,
  // [name, RA hours, Dec degrees]
  dipper: [['Dubhe', 11.06, 61.75], ['Merak', 11.03, 56.38], ['Phecda', 11.9, 53.69], ['Megrez', 12.26, 57.03], ['Alioth', 12.9, 55.96], ['Mizar', 13.4, 54.93], ['Alkaid', 13.79, 49.31]],
  cassiopeia: [['Caph', 0.15, 59.15], ['Schedar', 0.68, 56.54], ['Gamma', 0.95, 60.72], ['Ruchbah', 1.43, 60.24], ['Segin', 1.9, 63.67]],
  polaris: [2.53, 89.26],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Cinzel', F2 = 'IM Fell English';
    scene.background = K.canvasTex(16, 256, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#02040c'); gr.addColorStop(0.7, '#0a1430'); gr.addColorStop(1, '#1a2448'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    scene.add(S.camera);
    const R = 100, LAT = this.latitude * Math.PI / 180;
    const eq = (raH, decD) => { const a = raH * 15 * Math.PI / 180, d = decD * Math.PI / 180; return new T.Vector3(Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)).multiplyScalar(R); };
    const pole = new T.Vector3(0, Math.sin(LAT), -Math.cos(LAT));
    const sky = new T.Group(); sky.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), pole); scene.add(sky);
    const spin = new T.Group(); sky.add(spin);
    const glowTex = K.canvasTex(64, 64, g => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
    // background stars
    const NS = 2200, sp = new Float32Array(NS * 3), sc = new Float32Array(NS * 3), rr = K.rng(7);
    for (let i = 0; i < NS; i++) { const z = rr.range(-0.4, 1), a = rr() * 6.283, rxy = Math.sqrt(1 - z * z); sp.set([rxy * Math.cos(a) * R, rxy * Math.sin(a) * R, z * R], i * 3); const b = rr() ** 3 * 0.9 + 0.1, c = new T.Color().setHSL(rr.range(0.55, 0.65), 0.4, 0.75).multiplyScalar(b); sc.set([c.r, c.g, c.b], i * 3); }
    const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(sp, 3)); sg.setAttribute('color', new T.BufferAttribute(sc, 3));
    spin.add(new T.Points(sg, new T.PointsMaterial({ map: glowTex, size: 1.1, vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false })));
    // named stars
    const star = (raH, dec, size, color = '#fff6e0') => { const s = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color, transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false })); s.position.copy(eq(raH, dec)); s.scale.setScalar(size); spin.add(s); return s; };
    const dip = this.dipper.map(([n, ra, de]) => star(ra, de, 4.2)), cas = this.cassiopeia.map(([n, ra, de]) => star(ra, de, 3.6)), pol = star(this.polaris[0], this.polaris[1], 6.5, '#fffbe8');
    const lineMat = c => new T.LineBasicMaterial({ color: c, transparent: true, opacity: 0, blending: T.AdditiveBlending, fog: false });
    const chain = (stars, order, c) => { const g = new T.BufferGeometry().setFromPoints(order.map(i => stars[i].position)); const l = new T.Line(g, lineMat(c)); spin.add(l); return { l, g, n: order.length }; };
    const dipLine = chain(dip, [6, 5, 4, 3, 2, 1, 0, 3], '#e8c372'), casLine = chain(cas, [0, 1, 2, 3, 4], '#e8c372');
    const pointer = chain([dip[1], dip[0], pol], [0, 1, 2], '#9fe0ff');
    // an engraved-atlas bear behind the dipper, as a tangent plane on the sphere
    const bearTex = K.canvasTex(1024, 640, (g, r, w, h) => { g.strokeStyle = 'rgba(232,195,114,0.9)'; g.lineWidth = 4; g.lineJoin = 'round'; g.beginPath(); const P = [[80, 360], [180, 260], [330, 230], [480, 250], [620, 220], [760, 240], [880, 200], [960, 230], [940, 300], [880, 330], [860, 420], [800, 430], [780, 360], [640, 380], [600, 520], [540, 530], [540, 400], [380, 410], [340, 540], [280, 545], [280, 400], [180, 380], [80, 360]]; P.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.lineWidth = 1.5; for (let i = 0; i < 120; i++) { const x = r.range(150, 900), y = r.range(250, 420); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 18, y + 6); g.stroke(); } g.beginPath(); g.arc(905, 245, 8, 0, 7); g.stroke(); });
    const bear = new T.Mesh(new T.PlaneGeometry(46, 29), new T.MeshBasicMaterial({ map: bearTex, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false }));
    const bc = eq(12.3, 55).multiplyScalar(0.98); bear.position.copy(bc); bear.lookAt(0, 0, 0); bear.rotateZ(Math.PI * 0.95); spin.add(bear);
    // hills, sea and a small boat
    const hills = new T.Mesh(new T.PlaneGeometry(600, 30), new T.MeshBasicMaterial({ color: '#04060c', transparent: true, map: K.canvasTex(2048, 128, (g, r, w, h) => { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * (0.25 + 0.2 * Math.sin(x * 0.004 + 1) + 0.12 * Math.sin(x * 0.017))); g.lineTo(w, h); g.fill(); }) })); hills.position.set(0, -8, -95); scene.add(hills);
    const sea = new T.Mesh(new T.PlaneGeometry(400, 200), new T.MeshStandardMaterial({ color: '#050a18', roughness: 0.25, metalness: 0.6 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -14; scene.add(sea);
    const moonL = new T.DirectionalLight('#9fb8ff', 0.6); moonL.position.set(30, 40, -60); scene.add(moonL);
    const boat = new T.Group(); const hull = new T.Mesh(new T.CylinderGeometry(1.2, 0.8, 0.6, 6), new T.MeshStandardMaterial({ color: '#0c0c14' })); hull.scale.set(2.2, 1, 0.8); const mast = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 4, 6), hull.material); mast.position.y = 2.2; const sail = new T.Mesh(new T.ShapeGeometry(new T.Shape([new T.Vector2(0, 0), new T.Vector2(0, 3.2), new T.Vector2(2.2, 0.2)])), new T.MeshStandardMaterial({ color: '#1a2030', side: T.DoubleSide })); sail.position.set(0.1, 0.6, 0); const lantern = new T.PointLight('#ffb050', 3, 6); lantern.position.set(1.5, 1, 0.5); boat.add(hull, mast, sail, lantern); boat.position.set(-6, -13.6, -26); scene.add(boat);
    // the latitude arc and the bearing marks (fixed to the horizon, not the sky)
    const arcPts = []; for (let i = 0; i <= 60; i++) { const a = i / 60 * LAT; arcPts.push(new T.Vector3(0, Math.sin(a), -Math.cos(a)).multiplyScalar(R * 0.97)); }
    const arcGeo = new T.BufferGeometry().setFromPoints(arcPts), arc = new T.Line(arcGeo, lineMat('#9fe0ff')); scene.add(arc);
    const base = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(-40, 0, -R * 0.97), new T.Vector3(40, 0, -R * 0.97)]), lineMat('#9fe0ff')); scene.add(base);
    const tag = (txt, sz = 3.2, font = F) => { const l = K.label(txt, { font, weight: 700, px: 64, color: '#e8f4ff', height: sz }); l.material.fog = false; scene.add(l); return l; };
    const polTag = tag('POLE STAR', 5.5), latTag = tag(this.latitude + '° = your latitude', 6.0, F2), brTag = tag('rises at 060°', 5.5, F2);
    const bearingArrow = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0, 0, 0), new T.Vector3(0, 0, 0)]), lineMat('#ffd27a')); scene.add(bearingArrow);
    const riser = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#ffe8b0', transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false })); riser.scale.setScalar(6); scene.add(riser);
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 80, color: '#e8f4ff', height: 0.44 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, -3.1, -8); S.camera.add(l); return l; });
    S.camera.far = 400; S.camera.fov = 52; S.camera.updateProjectionMatrix();
    const look = new T.Vector3(), W = new T.Vector3();
    return (t, realT) => {
      const pitch = 0.36 + 0.03 * K.prog(t, 0, 8) - 0.12 * K.prog(t, B[3], B[3] + 1.5, 'inOut');
      const turnRight = K.prog(t, B[3] - 0.2, B[3] + 1.2, 'inOut') * 0.48;
      S.camera.position.set(0, 0, 0); look.set(Math.sin(turnRight) * 10, Math.tan(pitch) * 10, -Math.cos(turnRight) * 10); S.camera.lookAt(look); S.camera.userData.look = look.clone();
      spin.rotation.z = -0.9 - t * 0.09;
      const dl = K.prog(t, 0.4, 2.0); dipLine.g.setDrawRange(0, Math.ceil(dl * dipLine.n)); dipLine.l.material.opacity = 0.8 * dl;
      casLine.g.setDrawRange(0, Math.ceil(K.prog(t, 1.0, 2.3) * casLine.n)); casLine.l.material.opacity = 0.7 * K.prog(t, 1.0, 2.3);
      bear.material.opacity = 0.32 * K.prog(t, 1.2, 2.6);
      const pp = K.prog(t, B[1] + 0.2, B[1] + 1.4); pointer.g.setDrawRange(0, Math.ceil(pp * 3)); pointer.l.material.opacity = pp;
      pol.scale.setScalar(6.5 + 3 * K.prog(t, B[1] + 1.0, B[1] + 1.5) * (0.85 + 0.15 * Math.sin(realT * 4)));
      pol.getWorldPosition(W); polTag.position.copy(W).add(new T.Vector3(16, -2, 0)); polTag.lookAt(0, 0, 0); polTag.visible = t > B[1] + 1.0; polTag.material.opacity = K.prog(t, B[1] + 1.0, B[1] + 1.4);
      const la = K.prog(t, B[2] + 0.2, B[2] + 1.4, 'inOut'); arcGeo.setDrawRange(0, Math.ceil(la * 61)); arc.material.opacity = la; base.material.opacity = 0.6 * la;
      latTag.position.copy(new T.Vector3(0, Math.sin(LAT / 2), -Math.cos(LAT / 2)).multiplyScalar(R * 0.9)).add(new T.Vector3(-30, 0, 0)); latTag.lookAt(0, 0, 0); latTag.material.opacity = K.prog(la, 0.5, 1) * (1 - K.prog(t, B[3], B[3] + 0.5)); latTag.visible = latTag.material.opacity > 0.01;
      const rise = K.prog(t, B[3] + 0.6, B[3] + 2.2, 'out'), brg = 60 * Math.PI / 180;
      const hp = new T.Vector3(Math.sin(brg), 0, -Math.cos(brg)).multiplyScalar(R * 0.95);
      riser.position.copy(hp).add(new T.Vector3(0, 8 * rise - 1, 0)); riser.visible = t > B[3] + 0.6;
      bearingArrow.geometry.setFromPoints([hp.clone().add(new T.Vector3(0, -2, 0)), riser.position.clone()]); bearingArrow.material.opacity = rise;
      brTag.position.copy(hp).add(new T.Vector3(-18, 16, 0)); brTag.lookAt(0, 0, 0); brTag.visible = rise > 0.3; brTag.material.opacity = K.prog(rise, 0.3, 0.8);
      boat.position.y = -13.6 + 0.15 * Math.sin(realT * 1.2); boat.rotation.z = 0.04 * Math.sin(realT);
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('night', { gain: 0.08 }); k.bed('water', { gain: 0.03 });
    for (let i = 0; i < 7; i++) k.play('glass', { t: 0.4 + i * 0.22, gain: 0.12, pitch: 1.2 + i * 0.1 });
    k.play('chime', { t: B[1] + 1.2, gain: 0.2, pitch: 1.0, music: true });
    k.play('swish', { t: B[1] + 0.2, gain: 0.15, pitch: 1.2, dur: 1.0 });
    k.play('swish', { t: B[2] + 0.2, gain: 0.15, pitch: 0.9, dur: 1.2 }); k.play('tick', { t: B[2] + 1.4, gain: 0.25, pitch: 1.0 });
    k.play('riser', { t: B[3] + 0.6, gain: 0.12, pitch: 0.6, dur: 1.6 });
    k.play('bell', { t: B[3] + 2.2, gain: 0.18, pitch: 0.8, music: true });
  },
  post: null,
};
