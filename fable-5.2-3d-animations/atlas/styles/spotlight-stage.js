window.STYLES = window.STYLES || {};
STYLES['spotlight-stage'] = {
  id: 'spotlight-stage', name: 'Spotlight Stage',
  family: 'Small worlds',
  use: 'Story',
  look: 'A toy theatre on a table at night: a red velvet curtain, a worn timber stage, flat painted card cut-outs standing in layers, footlights and one moving spotlight. A small easel beside the stage carries the caption.',
  motion: 'Scenery slides in on tracks in the stage floor, clouds drop in on strings, and the hero piece travels on a rod. The spotlight follows the action, and the easel card changes at each beat.',
  shownHere: 'The first powered flight: Kitty Hawk on 17 December 1903, a cold strong wind, Orville Wright at the controls, and 12 seconds in the air over 120 feet.',
  goodFor: 'Historical moments, stories with a scene and characters, and simple plots told in acts. The easel card carries the date, the place or the result.',
  fonts: ['Playfair Display:wght@700;900'],
  duration: 10,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Kitty Hawk\n17 December 1903' },
    { t: 2.5, label: 'A cold wind\nacross the sand' },
    { t: 5.0, label: 'Orville Wright\ntakes off' },
    { t: 7.5, label: '12 seconds\n120 feet' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Playfair Display';
    scene.background = new T.Color('#07060a'); scene.add(S.camera);
    const L = K.lights(S, 'lamp', { size: 7, target: [0, 1.5, 0] }); L.key.intensity = 0.7; L.amb.intensity = 0.25; L.fill.intensity = 0.1; S.scene.environmentIntensity = 0.15;
    const std = (c, r = 0.8, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    // table and theatre box
    const tableTex = K.canvasTex(1024, 512, (g, r, w, h) => { g.fillStyle = '#5a3a24'; g.fillRect(0, 0, w, h); for (let i = 0; i < 200; i++) { g.strokeStyle = `rgba(30,15,5,${r.range(0.05, 0.2)})`; g.lineWidth = r.range(1, 4); const y = r() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + r.range(-20, 20), w * 0.6, y + r.range(-20, 20), w, y); g.stroke(); } }, 2);
    const table = new T.Mesh(new T.BoxGeometry(24, 0.4, 12), std('#ffffff', 0.6, { map: tableTex })); table.position.set(0, -0.2, 1); table.receiveShadow = true; scene.add(table);
    const planks = K.canvasTex(1024, 384, (g, r, w, h) => {
      for (let i = 0; i < 6; i++) { g.fillStyle = `hsl(28, 35%, ${r.range(30, 40)}%)`; g.fillRect(0, i * 64, w, 64); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, i * 64, w, 3);
        for (let k = 0; k < 30; k++) { g.fillStyle = `rgba(255,230,190,${r.range(0.02, 0.08)})`; g.fillRect(r() * w, i * 64 + r() * 60, r.range(20, 120), 2); } }
      g.fillStyle = '#16100c'; [100, 200, 300].forEach(y => g.fillRect(40, y, w - 80, 7));
    }, 4);
    const stage = new T.Mesh(new T.BoxGeometry(9.0, 0.6, 3.6), [std('#3a2416'), std('#3a2416'), std('#ffffff', 0.7, { map: planks }), std('#3a2416'), std('#4a2e1c'), std('#3a2416')]);
    stage.position.set(0, 0.3, 0); stage.receiveShadow = true; stage.castShadow = true; scene.add(stage);
    // proscenium: dark red frame with a gold line
    const fr = new T.Shape([new T.Vector2(-5.2, 0), new T.Vector2(5.2, 0), new T.Vector2(5.2, 6.6), new T.Vector2(-5.2, 6.6)]);
    const hole = new T.Path(); hole.moveTo(-4.1, 0.6); hole.lineTo(4.1, 0.6); hole.lineTo(4.1, 4.9); hole.quadraticCurveTo(0, 5.7, -4.1, 4.9); hole.lineTo(-4.1, 0.6); fr.holes.push(hole);
    const frameTex = K.canvasTex(512, 512, (g, r, w, h) => { g.fillStyle = '#6e1420'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(0,0,0,${r.range(0.03, 0.1)})`; g.fillRect(r() * w, r() * h, 3, 3); } }, 9);
    const frame = new T.Mesh(new T.ExtrudeGeometry(fr, { depth: 0.3, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2 }), std('#ffffff', 0.6, { map: frameTex }));
    frame.position.set(0, 0, 1.75); frame.castShadow = true; scene.add(frame);
    const gold = std('#d9a441', 0.3, { metalness: 0.9 });
    const archPts = [new T.Vector3(-4.25, 0.55, 2.13), new T.Vector3(-4.25, 4.95, 2.13), new T.Vector3(0, 5.78, 2.13), new T.Vector3(4.25, 4.95, 2.13), new T.Vector3(4.25, 0.55, 2.13)];
    scene.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(archPts, false, 'catmullrom', 0.2), 80, 0.06, 8), gold));
    const crest = K.label('THEATRE', { font: F, weight: 900, px: 64, color: '#e9c46a', height: 0.32 }); crest.position.set(0, 6.05, 2.14); scene.add(crest);
    // curtains: velvet folds, pulled to the sides
    const velvet = std('#a3121f', 0.75);
    const curtain = side => {
      const geo = new T.PlaneGeometry(2.6, 4.6, 60, 4), p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, 0.12 * Math.sin(x * 9) + 0.04 * Math.sin(x * 23)); p.setX(i, x * (0.55 + 0.45 * ((y + 2.3) / 4.6))); }
      geo.computeVertexNormals();
      const m = new T.Mesh(geo, new T.MeshPhysicalMaterial({ color: '#a3121f', roughness: 0.7, sheen: 1, sheenColor: new T.Color('#ff6b6b'), side: T.DoubleSide })); m.position.set(side * 3.2, 2.9, 1.6); m.castShadow = true; scene.add(m); return m;
    };
    const curtains = [curtain(-1), curtain(1)];
    const valance = new T.Mesh(new T.CylinderGeometry(0.25, 0.25, 8.4, 24, 1, false, 0, Math.PI), velvet); valance.rotation.z = Math.PI / 2; valance.position.set(0, 5.05, 1.62); scene.add(valance);

    // painted card cut-outs: a canvas with alpha, on a thin card with a dark edge
    const card = (w, h, draw, seed) => {
      const tex = K.canvasTex(Math.round(w * 160), Math.round(h * 160), (g, r, cw, ch) => draw(g, r, cw, ch), seed);
      const g = new T.Group();
      const front = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.5, roughness: 0.85, side: T.DoubleSide }));
      const edge = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: tex, color: '#1a120c', transparent: true, alphaTest: 0.5 })); edge.position.set(0.015, -0.015, -0.02);
      front.castShadow = true; front.customDepthMaterial = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, map: tex, alphaTest: 0.5 });
      g.add(edge, front); return g;
    };
    const ink = (g, lw = 6) => { g.lineWidth = lw; g.strokeStyle = '#1d140e'; g.lineJoin = 'round'; };
    // backdrop: dusk sky and a strip of sea
    const sky = card(8.4, 4.6, (g, r, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#26314f'); gr.addColorStop(0.55, '#7a86a8'); gr.addColorStop(0.75, '#d9b48a'); gr.addColorStop(1, '#9fb0b8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 30; i++) { g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 3; g.beginPath(); const y = r() * h * 0.6; g.moveTo(r() * w, y); g.lineTo(r() * w, y + r.range(-4, 4)); g.stroke(); }
      g.fillStyle = '#5c7f8f'; g.fillRect(0, h * 0.8, w, h * 0.2);
    }, 1);
    sky.position.set(0, 2.9, -1.55); scene.add(sky);
    const dune = (w, h, col, seed, hump) => card(w, h, (g, r, cw, ch) => {
      g.fillStyle = col; g.beginPath(); g.moveTo(0, ch); for (let x = 0; x <= cw; x += 8) g.lineTo(x, ch * (0.35 + hump * Math.sin(x / cw * Math.PI * 2 + seed) * 0.2 + 0.12 * Math.sin(x / cw * 9 + seed))); g.lineTo(cw, ch); g.closePath(); g.fill(); ink(g, 8); g.stroke();
      for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(80,60,30,0.35)'; g.lineWidth = 3; const x = r() * cw, y = ch * r.range(0.6, 0.95); g.beginPath(); g.moveTo(x, y); g.lineTo(x + r.range(10, 30), y - r.range(10, 30)); g.stroke(); }
    }, seed);
    const farDune = dune(8.4, 1.6, '#c9b28a', 1, 1); farDune.position.set(0, 1.4, -1.1); scene.add(farDune);
    const camp = card(1.6, 1.3, (g, r, w, h) => { g.fillStyle = '#8a6a4a'; g.beginPath(); g.moveTo(20, h - 10); g.lineTo(20, 70); g.lineTo(w / 2, 20); g.lineTo(w - 20, 70); g.lineTo(w - 20, h - 10); g.closePath(); g.fill(); ink(g); g.stroke(); g.fillStyle = '#2a1c12'; g.fillRect(w / 2 - 22, h - 80, 44, 70); }, 3);
    camp.position.set(-2.8, 1.5, -0.8); scene.add(camp);
    const midDune = dune(8.4, 1.3, '#dcc398', 2, 0.7); midDune.position.set(0, 1.05, -0.55); scene.add(midDune);
    const frontDune = dune(8.6, 1.0, '#e6d0a6', 4, 0.5); frontDune.position.set(0, 0.95, 0.95); scene.add(frontDune);
    // grass tufts on the front dune
    const tufts = card(8.4, 0.5, (g, r, w, h) => { for (let i = 0; i < 70; i++) { const x = r() * w; g.strokeStyle = '#6f7d3a'; g.lineWidth = 5; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x, h); g.quadraticCurveTo(x + r.range(-10, 10), h * 0.5, x + r.range(-25, 25), r.range(0, h * 0.5)); g.stroke(); } } }, 6);
    tufts.position.set(0, 0.85, 1.05); scene.add(tufts);
    // clouds on strings
    const clouds = [[-2.5, 4.0, -1.2], [1.0, 4.3, -1.0], [3.0, 3.8, -0.9]].map(([x, y, z], i) => {
      const c = card(1.8, 0.8, (g, r, w, h) => { const C3 = [[0.25, 0.6, 0.2], [0.45, 0.45, 0.24], [0.68, 0.55, 0.2], [0.5, 0.68, 0.2]]; ink(g, 14); C3.forEach(([u, v, s]) => { g.beginPath(); g.arc(u * w, v * h, s * w, 0, 7); g.stroke(); }); g.fillStyle = '#eef0f5'; C3.forEach(([u, v, s]) => { g.beginPath(); g.arc(u * w, v * h, s * w, 0, 7); g.fill(); }); }, 10 + i);
      const string = new T.Mesh(new T.CylinderGeometry(0.008, 0.008, 2, 4), std('#ddd', 0.5)); string.position.y = 1.3; c.add(string);
      c.position.set(x, y, z); c.userData = { x, y }; scene.add(c); return c;
    });
    // wind swirls
    const gusts = [0, 1, 2].map(i => { const c = card(1.4, 0.5, (g, r, w, h) => { g.strokeStyle = '#ffffff'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(10, h * 0.6); g.bezierCurveTo(w * 0.4, h * 0.2, w * 0.7, h * 0.9, w - 40, h * 0.45); g.arc(w - 60, h * 0.55, 20, -0.5, 3.6); g.stroke(); }, 20 + i); c.position.set(-5, 2.4 + i * 0.5, -0.3 + i * 0.25); scene.add(c); return c; });
    // the flyer: a painted biplane on a rod, and two brothers
    const flyer = card(2.4, 1.0, (g, r, w, h) => {
      ink(g, 5); g.fillStyle = '#efe4c8';
      [[0.1, 0.18], [0.1, 0.62]].forEach(([x, y]) => { g.fillRect(x * w, y * h, w * 0.78, h * 0.09); g.strokeRect(x * w, y * h, w * 0.78, h * 0.09); });
      for (let k = 0; k < 7; k++) { const x = (0.13 + k * 0.12) * w; g.beginPath(); g.moveTo(x, 0.27 * h); g.lineTo(x, 0.62 * h); g.stroke(); }
      g.fillRect(0.88 * w, 0.32 * h, w * 0.1, h * 0.06); g.strokeRect(0.88 * w, 0.32 * h, w * 0.1, h * 0.06); g.beginPath(); g.moveTo(0.88 * w, 0.35 * h); g.lineTo(0.78 * w, 0.4 * h); g.stroke();
      g.fillRect(0.0, 0.32 * h, w * 0.08, h * 0.28); g.strokeRect(0.0, 0.32 * h, w * 0.08, h * 0.28);
      g.fillStyle = '#3a2a1e'; g.beginPath(); g.ellipse(0.45 * w, 0.58 * h, 0.09 * w, 0.05 * h, 0, 0, 7); g.fill();
      g.fillStyle = '#c9a77a'; g.beginPath(); g.arc(0.55 * w, 0.56 * h, 0.035 * w, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#7a5a3a'; g.fillRect(0.2 * w, 0.82 * h, 0.5 * w, 0.06 * h);
    }, 30);
    const props = [-1, 1].map(s => { const p = new T.Mesh(new T.BoxGeometry(0.03, 0.5, 0.05), std('#7a5a3a')); p.position.set(-0.5, 0.0, 0.05); flyer.add(p); return p; });
    const rod = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 1.2, 6), std('#222', 0.4, { metalness: 0.8 })); rod.position.y = -1.0; flyer.add(rod);
    flyer.position.set(-2.4, 1.15, 0.2); flyer.scale.setScalar(1.45); scene.add(flyer);
    const person = (coat, seed) => card(0.45, 1.0, (g, r, w, h) => { ink(g, 5); g.fillStyle = coat; g.beginPath(); g.moveTo(w * 0.2, h); g.lineTo(w * 0.25, h * 0.3); g.lineTo(w * 0.75, h * 0.3); g.lineTo(w * 0.8, h); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#e0bd98'; g.beginPath(); g.arc(w / 2, h * 0.2, w * 0.17, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#2a2420'; g.fillRect(w * 0.28, h * 0.03, w * 0.44, h * 0.06); }, seed);
    const wilbur = person('#3b3a44', 40); wilbur.position.set(-0.6, 1.2, 0.55); scene.add(wilbur);
    const helper = person('#5a4632', 41); helper.position.set(2.9, 1.2, -0.2); helper.scale.setScalar(0.85); scene.add(helper);
    // light: footlights, a spotlight with a visible cone, a warm practical lamp
    const foot = [];
    for (let i = 0; i < 9; i++) { const b = new T.Mesh(new T.SphereGeometry(0.07, 12, 8), new T.MeshStandardMaterial({ color: '#ffe6b0', emissive: '#ffc070', emissiveIntensity: 2 })); b.position.set(-3.6 + i * 0.9, 0.66, 1.55); scene.add(b); foot.push(b); }
    const footLight = new T.SpotLight('#ffcf8a', 14, 12, 1.0, 0.8, 1.2); footLight.position.set(0, 0.75, 1.3); footLight.target.position.set(0, 2.0, -1); scene.add(footLight, footLight.target);
    const spot = new T.SpotLight('#fff3dc', 120, 20, 0.22, 0.45, 1.3); spot.position.set(1.5, 8, 6); spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.001; scene.add(spot, spot.target);
    const coneGeo = new T.ConeGeometry(1.0, 1, 40, 1, true); coneGeo.translate(0, -0.5, 0); coneGeo.rotateX(-Math.PI / 2);
    const cone = new T.Mesh(coneGeo, new T.MeshBasicMaterial({ color: '#fff1d0', transparent: true, opacity: 0.06, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); scene.add(cone);
    // dust in the beam
    const ND = 160, dg = new T.BufferGeometry(), dpos = new Float32Array(ND * 3), dr = K.rng(5), d0 = [];
    for (let i = 0; i < ND; i++) d0.push([dr(), dr.range(-0.6, 0.6), dr.range(-0.6, 0.6), dr() * 6]);
    dg.setAttribute('position', new T.BufferAttribute(dpos, 3));
    scene.add(new T.Points(dg, new T.PointsMaterial({ color: '#fff3dc', size: 0.03, transparent: true, opacity: 0.7, depthWrite: false, blending: T.AdditiveBlending })));
    // the easel with the caption cards
    const easel = new T.Group(); easel.position.set(5.6, 0, 3.6); easel.rotation.y = -0.3; easel.scale.setScalar(1.35); scene.add(easel);
    const wood = std('#8a5a34', 0.6);
    [[-0.5, 0.15], [0.5, -0.15]].forEach(([x, rz]) => { const l = new T.Mesh(new T.BoxGeometry(0.08, 3.4, 0.08), wood); l.position.set(x, 1.6, 0); l.rotation.z = rz; l.castShadow = true; easel.add(l); });
    const back = new T.Mesh(new T.BoxGeometry(0.08, 3.2, 0.08), wood); back.position.set(0, 1.5, -0.5); back.rotation.x = -0.3; easel.add(back);
    const ledge = new T.Mesh(new T.BoxGeometry(1.6, 0.08, 0.2), wood); ledge.position.set(0, 1.25, 0.1); easel.add(ledge);
    const caps = this.beats.map((b, i) => {
      const tex = K.canvasTex(600, 440, (g, r, w, h) => {
        g.fillStyle = '#f2e8d2'; g.fillRect(0, 0, w, h); for (let k = 0; k < 800; k++) { g.fillStyle = `rgba(120,90,50,${r.range(0.02, 0.06)})`; g.fillRect(r() * w, r() * h, 2, 2); }
        g.strokeStyle = '#8a1c24'; g.lineWidth = 8; g.strokeRect(18, 18, w - 36, h - 36);
        g.fillStyle = '#1d140e'; g.textAlign = 'center'; g.textBaseline = 'middle';
        b.label.split('\n').forEach((l, k) => { g.font = `${k ? 700 : 900} ${k ? 66 : 84}px "${F}"`; g.fillText(l, w / 2, h / 2 - 55 + k * 110); });
      }, 50 + i);
      const m = new T.Mesh(new T.PlaneGeometry(1.8, 1.32), new T.MeshStandardMaterial({ map: tex, roughness: 0.9 })); m.position.set(0, 1.95, 0.12 + i * 0.004); m.rotation.x = -0.08; m.castShadow = true; easel.add(m); return m;
    });
    const easelLamp = new T.SpotLight('#ffd9a0', 30, 8, 0.5, 0.6, 1.2); easelLamp.position.set(5.2, 4.5, 4.5); easelLamp.target = caps[0]; scene.add(easelLamp);

    const cam = K.camPath([
      { t: 0, pos: [1.7, 3.6, 17.2], look: [1.4, 2.7, 0.5] },
      { t: 5, pos: [1.5, 3.4, 16.4], look: [1.4, 2.6, 0.5] },
      { t: 10, pos: [1.8, 3.5, 16.6], look: [1.5, 2.6, 0.5] },
    ], S.camera);
    const tgt = new T.Vector3(), dir = new T.Vector3();
    return (t, realT) => {
      cam(t);
      const open = 0.6 + 0.4 * K.prog(t, 0, 1.0, 'inOut');
      curtains.forEach((c, i) => { const s = i ? 1 : -1; c.position.x = s * (2.6 + 1.6 * open); c.scale.x = 1 - 0.35 * open; });
      // wind: clouds slide, gusts cross the stage
      const wind = K.prog(t, B[1], B[1] + 0.8, 'out');
      clouds.forEach((c, i) => { c.position.x = c.userData.x + wind * (0.8 + 0.3 * i) + 0.3 * Math.sin(realT * 0.4 + i); c.position.y = c.userData.y + 1.5 * (1 - K.prog(t, B[1] - 0.2 + i * 0.15, B[1] + 0.5 + i * 0.15, 'bounce')); c.rotation.z = 0.05 * Math.sin(realT * 1.3 + i); });
      gusts.forEach((g, i) => { const u = ((t - B[1] - i * 0.35) / 1.6); g.visible = u > 0 && t < B[3] + 1; g.position.x = -5 + 10 * (((u % 1) + 1) % 1); });
      // flight: run along the rail, lift, land
      const run = K.prog(t, B[2] + 0.1, B[3] + 1.0, 'inOut'), lift = K.prog(t, B[2] + 0.6, B[2] + 1.4, 'inOut') * (1 - K.prog(t, B[3] + 0.6, B[3] + 1.0, 'inOut'));
      flyer.position.set(K.lerp(-2.4, 2.1, run), 1.15 + 0.85 * lift + 0.04 * Math.sin(realT * 5) * lift, 0.2);
      flyer.rotation.z = 0.06 * lift * Math.sin(realT * 2) + 0.05 * (K.prog(t, B[2] + 0.6, B[2] + 1.0) - K.prog(t, B[2] + 1.0, B[2] + 1.6)) * 2;
      props.forEach((p, i) => { p.rotation.z = run > 0 && run < 1 ? realT * 40 + i : 0.5; });
      rod.scale.y = 1 + 0.75 * lift; rod.position.y = -1.0 - 0.45 * lift;
      wilbur.position.x = K.lerp(-0.6, 0.6, K.prog(t, B[2] + 0.1, B[2] + 1.6, 'inOut')); wilbur.position.y = 1.2 + 0.04 * Math.abs(Math.sin(realT * 8)) * (run > 0 && run < 0.4 ? 1 : 0);
      helper.rotation.z = 0.08 * Math.sin(realT * 6) * K.prog(t, B[3] + 0.8, B[3] + 1.0);
      // spotlight follows the action
      const focus = t < B[1] ? new T.Vector3(-1.5, 1.6, 0) : t < B[2] ? new T.Vector3(0.5, 3.4, -0.8) : flyer.position.clone();
      tgt.copy(spot.target.position).lerp(focus, 1); if (t >= B[1] && t < B[1] + 0.6) tgt.lerpVectors(new T.Vector3(-1.5, 1.6, 0), new T.Vector3(0.5, 3.4, -0.8), K.prog(t, B[1], B[1] + 0.6, 'inOut'));
      if (t >= B[2] && t < B[2] + 0.5) tgt.lerpVectors(new T.Vector3(0.5, 3.4, -0.8), flyer.position, K.prog(t, B[2], B[2] + 0.5, 'inOut'));
      spot.target.position.copy(tgt); spot.target.updateMatrixWorld();
      dir.subVectors(tgt, spot.position); const len = dir.length();
      cone.position.copy(spot.position); cone.lookAt(tgt); cone.scale.set(len * Math.tan(0.22), len * Math.tan(0.22), len);
      cone.material.opacity = 0.05 + 0.01 * Math.sin(realT * 3);
      for (let i = 0; i < ND; i++) { const [u, a, b, ph] = d0[i], k = (u + realT * 0.02) % 1; const p = spot.position.clone().lerp(tgt, k); dpos[i * 3] = p.x + a * k * 1.6 + 0.05 * Math.sin(realT + ph); dpos[i * 3 + 1] = p.y + b * k * 1.6; dpos[i * 3 + 2] = p.z + 0.05 * Math.cos(realT + ph); }
      dg.attributes.position.needsUpdate = true;
      foot.forEach((b, i) => { b.material.emissiveIntensity = 1.8 + 0.4 * Math.sin(realT * 7 + i * 1.3); });
      // easel: the current card is on top; the old one drops behind
      caps.forEach((c, i) => { const on = i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.35, 'out'); const off = i < caps.length - 1 ? K.prog(t, B[i + 1], B[i + 1] + 0.35) : 0;
        c.visible = on > 0 && off < 1; c.position.y = 1.95 + (1 - on) * 0.6 - off * 1.4; c.rotation.z = (1 - on) * 0.2; c.material.opacity = 1; });
      easelLamp.target = caps[Math.max(0, B.filter(b => t >= b).length - 1)];
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.06 }); k.bed('crowd', { gain: 0.02 });
    k.play('swish', { t: 0.0, gain: 0.3, pitch: 0.6, dur: 1.2 });
    B.forEach((b, i) => { if (i) k.play('paper', { t: b, gain: 0.35, pitch: 0.9 }); });
    k.play('whoosh', { t: B[1], gain: 0.35, pitch: 0.5, dur: 2.5 });
    for (let i = 0; i < 3; i++) k.play('wood', { t: B[1] + 0.3 + i * 0.15, gain: 0.2, pitch: 1.2 + i * 0.1 });
    k.play('hum', { t: B[2] + 0.1, gain: 0.3, pitch: 1.6, dur: 2.5 });
    k.play('riser', { t: B[2] + 0.5, gain: 0.15, pitch: 0.8, dur: 1.0 });
    k.play('thud', { t: B[3] + 1.0, gain: 0.4, pitch: 1.1 });
    k.play('bell', { t: B[3] + 1.3, gain: 0.2, pitch: 1.0, music: true });
    k.play('sparkle', { t: B[3] + 1.4, gain: 0.2 });
  },
  post: null,
};
