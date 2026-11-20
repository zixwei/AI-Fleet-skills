window.STYLES = window.STYLES || {};
STYLES['projection-mapping'] = {
  id: 'projection-mapping', name: 'Projection Mapping',
  family: 'Light and optics',
  use: 'Explainer',
  look: 'A dark room with a blank white cardboard model of a town on a table. A projector on a stand throws a visible beam and paints moving graphics onto the model: lit windows, flow lines along the roads, numbers on the roofs.',
  motion: 'The white model stays still; only the projected light changes. Windows light up as evening comes, flow lines run faster along the roads, numbers count up on the roofs, and a dial on the table shows the grid frequency.',
  shownHere: 'How a power grid balances demand: the town needs power every second; in the evening demand rises; power stations must match it second by second; when supply falls short the frequency drops below 50 Hz; a reserve station starts and the balance comes back.',
  goodFor: 'Live systems on a physical model: cities, factories, networks, buildings, any place where data flows over a real layout.',
  fonts: ['Rajdhani:wght@600;700'],
  duration: 12,
  samples: 4,
  // CONTENT: demand and supply in MW at the end of each beat
  beats: [
    { t: 0.0, label: 'A town needs power every second', demand: 300, supply: 300 },
    { t: 2.4, label: 'Evening: demand rises', demand: 480, supply: 470 },
    { t: 4.8, label: 'Supply must match it, second by second', demand: 480, supply: 480 },
    { t: 7.2, label: 'Supply falls short: the frequency drops', demand: 520, supply: 480 },
    { t: 9.6, label: 'A reserve station starts: balance again', demand: 520, supply: 520 },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Rajdhani', BE = this.beats;
    scene.background = new T.Color('#040506'); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#606878', '#000000', 0.35));
    const std = (c, r = 0.9, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const table = new T.Mesh(new T.BoxGeometry(18, 0.4, 11), std('#141418', 0.8)); table.position.y = -0.2; table.receiveShadow = true; scene.add(table);
    // the ground plate: white card with a projected canvas (roads, flow lines, dial)
    const GW = 14, GD = 8.4, gc = document.createElement('canvas'); gc.width = 1400; gc.height = 840; const gg = gc.getContext('2d');
    const gtex = new T.CanvasTexture(gc); gtex.colorSpace = T.SRGBColorSpace;
    const ground = new T.Mesh(new T.BoxGeometry(GW, 0.08, GD), [std('#e8e8e4'), std('#e8e8e4'), std('#5a5a58', 0.9, { emissive: '#ffffff', emissiveMap: gtex, emissiveIntensity: 1.0 }), std('#e8e8e4'), std('#e8e8e4'), std('#e8e8e4')]); ground.position.y = 0.04; ground.receiveShadow = true; scene.add(ground);
    const gx = x => (x / GW + 0.5) * 1400, gz = z => (z / GD + 0.5) * 840;
    // buildings: white boxes; one atlas canvas holds every facade (windows) and every roof (numbers)
    const ac = document.createElement('canvas'); ac.width = 1024; ac.height = 1024; const ag = ac.getContext('2d');
    const atex = new T.CanvasTexture(ac); atex.colorSpace = T.SRGBColorSpace;
    const bmat = std('#6a6a68', 0.9, { emissive: '#ffffff', emissiveMap: atex, emissiveIntensity: 1.0 });
    const rr = K.rng(66), blds = [];
    const lots = []; for (let ix = -3; ix <= 3; ix++) for (let iz = -2; iz <= 2; iz++) { if (iz === 0 || ix === 0) continue; lots.push([ix * 1.15, iz * 1.2]); }
    const CELL = 128, PER = 8;
    lots.forEach(([x, z], i) => { const w = rr.range(0.7, 0.95), d = rr.range(0.7, 0.95), h = rr.range(0.6, 1.9); const geo = new T.BoxGeometry(w, h, d); const uv = geo.attributes.uv;
      const cf = i * 2, cr = i * 2 + 1, cu = c => [(c % PER) / PER, 1 - (Math.floor(c / PER) + 1) / PER];
      for (let f = 0; f < 6; f++) { const [u0, v0] = cu(f === 2 ? cr : cf); for (let k = 0; k < 4; k++) { const j = f * 4 + k; uv.setXY(j, u0 + uv.getX(j) / PER, v0 + uv.getY(j) / PER); } }
      const m = new T.Mesh(geo, bmat); m.position.set(x, 0.08 + h / 2, z); m.castShadow = m.receiveShadow = true; scene.add(m); blds.push({ m, h, seed: rr(), cf, cr }); });
    // two power stations: A on the left, the reserve B on the right
    const station = (x, name) => { const g = new T.Group(); g.position.set(x, 0.08, 0); scene.add(g); const b = new T.Mesh(new T.BoxGeometry(1.4, 1.0, 1.6), std('#d8d8d4', 0.8)); b.position.y = 0.5; b.castShadow = true; g.add(b);
      [-0.35, 0.35].forEach(dz => { const c = new T.Mesh(new T.CylinderGeometry(0.16, 0.2, 1.6, 16), std('#d8d8d4', 0.8)); c.position.set(0.2, 1.3, dz); c.castShadow = true; g.add(c); });
      const tag = K.label(name, { font: F, weight: 700, px: 56, color: '#9fe8ff', height: 0.32 }); tag.position.set(0, 2.5, 0); g.add(tag); return { g, b, tag }; };
    const stA = station(-5.6, 'Station A'), stB = station(5.6, 'Reserve B');
    // the projector and its beam
    const proj = new T.Group(); proj.position.set(-6.8, 6.4, 5.4); proj.lookAt(0, 0, 0); scene.add(proj);
    const body = new T.Mesh(new T.BoxGeometry(1.0, 0.5, 0.8), std('#1a1a1e', 0.5)); proj.add(body);
    const lensM = new T.Mesh(new T.CylinderGeometry(0.18, 0.18, 0.2, 20), std('#cfe8ff', 0.1, { emissive: '#ffffff', emissiveIntensity: 2 })); lensM.rotation.x = Math.PI / 2; lensM.position.z = -0.45; proj.add(lensM);
    const standP = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 5.4, 8), std('#2a2a2e', 0.4, { metalness: 0.7 })); standP.position.set(0, -2.9, 0.2); proj.add(standP);
    const coneGeo = new T.ConeGeometry(1, 1, 4, 1, true); coneGeo.rotateY(Math.PI / 4); coneGeo.translate(0, -0.5, 0); coneGeo.rotateX(-Math.PI / 2);
    const cone = new T.Mesh(coneGeo, new T.MeshBasicMaterial({ color: '#bfe8ff', transparent: true, opacity: 0.05, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); cone.position.set(-6.5, 6.15, 5.15); cone.lookAt(0, 0, 0); { const len = new T.Vector3(-6.5, 6.15, 5.15).length(); cone.scale.set(GW * 0.55, GD * 0.5, len); } scene.add(cone);
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 70, color: '#e8f8ff', bg: 'rgba(4,6,8,0.8)', radius: 8, pad: 0.35, height: 0.4 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([{ t: 0, pos: [-1.2, 11.0, 12.6], look: [0, 0.2, 0.6] }, { t: 6, pos: [1.0, 10.2, 12.0], look: [0.2, 0.2, 0.6] }, { t: 12, pos: [2.0, 11.4, 12.8], look: [0.4, 0.2, 0.6] }], S.camera);
    const val = (t, key) => { let k = 0; for (let i = 1; i < B.length; i++) if (t >= B[i]) k = i; const u = k ? K.prog(t, B[k], B[k] + 1.6, 'inOut') : 1; return K.lerp(k ? BE[k - 1][key] : BE[0][key], BE[k][key], u); };
    // a road path from each station into town, for the flow lines
    const roadA = [[-5.0, 0], [-3.4, 0], [0, 0], [0, -2.6], [0, 2.6]], roadB = [[5.0, 0], [3.4, 0], [0, 0]];
    const dashes = (pts, phase, col, w) => { gg.strokeStyle = col; gg.lineWidth = w; gg.setLineDash([16, 22]); gg.lineDashOffset = -phase; gg.beginPath(); gg.moveTo(gx(pts[0][0]), gz(pts[0][1])); for (let i = 1; i < 3; i++) gg.lineTo(gx(pts[i][0]), gz(pts[i][1])); gg.stroke(); if (pts.length > 3) { gg.beginPath(); gg.moveTo(gx(0), gz(-2.6)); gg.lineTo(gx(0), gz(2.6)); gg.stroke(); } gg.setLineDash([]); };
    return (t, realT) => {
      cam(t);
      const dem = val(t, 'demand'), sup = val(t, 'supply'), freq = 50 - 0.005 * Math.max(0, dem - sup), short = dem - sup > 5, reserve = t > B[4] + 0.2;
      // ground canvas
      gg.fillStyle = '#1a1c20'; gg.fillRect(0, 0, 1400, 840);
      gg.strokeStyle = '#2a3440'; gg.lineWidth = 40; gg.beginPath(); gg.moveTo(gx(-6.6), gz(0)); gg.lineTo(gx(6.6), gz(0)); gg.moveTo(gx(0), gz(-3.8)); gg.lineTo(gx(0), gz(3.8)); gg.stroke();
      const col = short ? '#ff4a3a' : '#3affb0', ph = realT * (40 + sup * 0.25);
      dashes(roadA, ph, col, 10); if (reserve) dashes(roadB, ph, '#3affb0', 10);
      // the dial: frequency and the two numbers
      const dx = gx(-5.0), dz = gz(2.6); gg.strokeStyle = '#3a4a5a'; gg.lineWidth = 8; gg.beginPath(); gg.arc(dx, dz, 90, Math.PI, 0); gg.stroke();
      const a = Math.PI * 1.5 + (freq - 50) / 0.3 * (Math.PI / 2); gg.strokeStyle = short ? '#ff4a3a' : '#3affb0'; gg.lineWidth = 6; gg.beginPath(); gg.moveTo(dx, dz); gg.lineTo(dx + Math.cos(a) * 80, dz + Math.sin(a) * 80); gg.stroke();
      gg.fillStyle = short ? '#ff6a5a' : '#9fffd8'; gg.font = `700 54px "${F}"`; gg.textAlign = 'center'; gg.fillText(`${freq.toFixed(2)} Hz`, dx, dz + 60);
      gg.fillStyle = '#9fe8ff'; gg.font = `700 46px "${F}"`; gg.textAlign = 'left'; gg.fillText(`Demand ${Math.round(dem)} MW`, gx(2.4), gz(2.9)); gg.fillText(`Supply ${Math.round(sup)} MW`, gx(2.4), gz(3.6));
      gtex.needsUpdate = true;
      // atlas: windows light with demand; roofs show each building's share
      ag.fillStyle = '#24262a'; ag.fillRect(0, 0, 1024, 1024);
      const lit = K.clamp((dem - 250) / 300);
      blds.forEach((b, i) => { const fx = (b.cf % PER) * CELL, fy = Math.floor(b.cf / PER) * CELL;
        for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const on = ((Math.sin((i * 12 + r * 3 + c) * 12.9898) * 43758.5) % 1 + 1) % 1 < lit; ag.fillStyle = on ? (short ? '#ffb070' : '#ffe8a0') : '#101418'; ag.fillRect(fx + 14 + c * 38, fy + 12 + r * 29, 24, 18); }
        const rx = (b.cr % PER) * CELL, ry = Math.floor(b.cr / PER) * CELL; ag.fillStyle = '#1c2a30'; ag.fillRect(rx, ry, CELL, CELL); ag.fillStyle = short ? '#ff8a6a' : '#7fe8ff'; ag.font = `700 46px "${F}"`; ag.textAlign = 'center'; ag.textBaseline = 'middle'; ag.fillText(String(Math.round(dem / blds.length * (0.6 + b.seed * 0.8))), rx + CELL / 2, ry + CELL / 2); });
      atex.needsUpdate = true;
      stA.b.material.emissive = stA.b.material.emissive || new T.Color(); stA.b.material.emissive.set('#3affb0'); stA.b.material.emissiveIntensity = 0.15 + 0.15 * Math.sin(realT * 4);
      stB.b.material.emissive.set(reserve ? '#3affb0' : '#000000'); stB.b.material.emissiveIntensity = reserve ? 0.3 : 0; stB.tag.material.opacity = t > B[3] ? 1 : 0.3;
      cone.material.opacity = 0.045 + 0.008 * Math.sin(realT * 9);
      titles.forEach((l, i) => { const a2 = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a2 > 0.01; l.material.opacity = a2; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('machine', { gain: 0.05 });
    k.play('click', { t: 0.1, gain: 0.3, pitch: 0.8 }); k.play('hum', { t: 0.15, gain: 0.12, pitch: 1.0, dur: 11.5 });
    for (let i = 0; i < 6; i++) k.play('tick', { t: B[1] + 0.2 + i * 0.3, gain: 0.12, pitch: 1.4 + i * 0.05 });
    k.play('chime', { t: B[2] + 0.8, gain: 0.12, pitch: 1.0, music: true });
    k.play('hum', { t: B[3] + 0.2, gain: 0.2, pitch: 0.45, dur: 2.2 }); k.play('blip', { t: B[3] + 0.6, gain: 0.2, pitch: 0.6 }); k.play('blip', { t: B[3] + 1.2, gain: 0.2, pitch: 0.55 });
    k.play('riser', { t: B[4] + 0.1, gain: 0.15, pitch: 1.0, dur: 1.2 }); k.play('thud', { t: B[4] + 0.3, gain: 0.3, pitch: 0.8 }); k.play('chime', { t: B[4] + 1.6, gain: 0.15, pitch: 1.2, music: true });
  },
  post: null,
};
