window.STYLES = window.STYLES || {};
STYLES['tiny-diorama'] = {
  id: 'tiny-diorama', name: 'Tiny Diorama',
  family: 'Small worlds',
  use: 'Explainer',
  look: 'A small town on one floating square tile with a cut-earth edge: chunky rounded buildings, peg people, lollipop trees and cotton clouds, all in matte paint colours. Soft studio light from above and a pale sky backdrop.',
  motion: 'A vehicle drives the route from stop to stop; numbered flags pop up at each stop. People bob, trees sway, and the camera floats around the tile.',
  shownHere: 'How a letter is delivered: it is posted in a box, collected by a van, sorted by postcode at the sorting office, and delivered to the door.',
  goodFor: 'Journeys and routes through a place: deliveries, supply chains, a customer path. One vehicle or token travels, and each stop gets a numbered flag.',
  fonts: ['Quicksand:wght@700'],
  duration: 10,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Post the letter' },
    { t: 2.5, label: 'A van collects it' },
    { t: 5.0, label: 'Sorted by postcode' },
    { t: 7.5, label: 'Delivered to the door' },
  ],
  stops: ['POST', 'COLLECT', 'SORT', 'DELIVER'],
  office: 'POST',

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Quicksand';
    scene.background = K.canvasTex(16, 256, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#bfe3f2'); gr.addColorStop(1, '#f6ecdf'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 9, target: [0, 0, 0] }); L.key.position.set(-5, 12, 6); L.key.intensity = 2.4; L.amb.intensity = 1.1;
    const paint = c => new T.MeshStandardMaterial({ color: c, roughness: 0.9 });
    const P = { grass: paint('#9fcf7a'), grass2: paint('#8cc06a'), road: paint('#d8d3cb'), red: paint('#e2524a'), cream: paint('#f6ead2'), mint: paint('#a8dcc6'), butter: paint('#f6d77a'), blue: paint('#7aa7e0'),
      roof: paint('#d9715a'), roof2: paint('#7f6aa8'), roof3: paint('#4f8f7c'), dark: paint('#3a3a40'), white: paint('#fbf8f2'), trunk: paint('#a0704f'), leaf: paint('#5fae5a'), leaf2: paint('#86c46a'), pink: paint('#f29fb0') };
    const rbox = (w, h, d, r = 0.12) => {
      const s = new T.Shape(), x = -w / 2 + r, y = -h / 2 + r, W2 = w - 2 * r, H2 = h - 2 * r;
      s.moveTo(x, y - r); s.lineTo(x + W2, y - r); s.quadraticCurveTo(x + W2 + r, y - r, x + W2 + r, y); s.lineTo(x + W2 + r, y + H2); s.quadraticCurveTo(x + W2 + r, y + H2 + r, x + W2, y + H2 + r);
      s.lineTo(x, y + H2 + r); s.quadraticCurveTo(x - r, y + H2 + r, x - r, y + H2); s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
      const g = new T.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 4, curveSegments: 6 });
      g.translate(0, 0, -(d - 2 * r) / 2); return g;
    };
    const put = (geo, m, x, y, z, parent = scene) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };

    // the tile: grass top, cut earth sides in layers
    const earth = K.canvasTex(512, 128, (g, r, w, h) => {
      [['#8a5a3c', 0, 30], ['#a06a46', 30, 64], ['#7a4c34', 64, 92], ['#5e3b2a', 92, 128]].forEach(([c, a, b]) => { g.fillStyle = c; g.fillRect(0, a, w, b - a); });
      for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(${r() < 0.5 ? 40 : 200},${r() < 0.5 ? 25 : 160},${r() < 0.5 ? 15 : 120},0.35)`; g.beginPath(); g.ellipse(r() * w, 20 + r() * 108, r.range(2, 8), r.range(1.5, 5), 0, 0, 7); g.fill(); }
    }, 6);
    earth.wrapS = T.RepeatWrapping; earth.repeat.set(3, 1);
    const TW = 12, TD = 9;
    const soil = put(new T.BoxGeometry(TW, 1.6, TD), [paint('#8a5a3c'), paint('#8a5a3c'), P.grass, paint('#5e3b2a'), paint('#8a5a3c'), paint('#8a5a3c')].map((m, i) => (i === 2 || i === 3) ? m : new T.MeshStandardMaterial({ map: earth, roughness: 1 })), 0, -0.8, 0);
    put(rbox(TW + 0.1, 0.3, TD + 0.1, 0.1), P.grass, 0, 0.0, 0);
    // roads with a dashed line
    const roadTex = K.canvasTex(256, 64, (g, r, w, h) => { g.fillStyle = '#d8d3cb'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; for (let x = 10; x < w; x += 64) g.fillRect(x, h / 2 - 3, 34, 6); });
    roadTex.wrapS = T.RepeatWrapping;
    const road = (x0, z0, x1, z1) => { const len = Math.hypot(x1 - x0, z1 - z0), tex = roadTex.clone(); tex.repeat.set(len / 2, 1); tex.needsUpdate = true;
      const m = put(new T.BoxGeometry(len + 0.9, 0.04, 0.9), new T.MeshStandardMaterial({ map: tex, roughness: 0.95 }), (x0 + x1) / 2, 0.265, (z0 + z1) / 2); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); };
    road(-5.5, 1.4, 5.5, 1.4); road(0, 1.4, 0, -2.0);

    // buildings: chunky houses with pyramid roofs, a sorting office, a shop
    const house = (x, z, w, d, h, body, roof, ry = 0) => {
      const g = new T.Group(); g.position.set(x, 0.15, z); g.rotation.y = ry; scene.add(g);
      put(rbox(w, h, d, 0.12), body, 0, h / 2, 0, g);
      const rf = put(new T.ConeGeometry(Math.max(w, d) * 0.78, h * 0.7, 4), roof, 0, h + h * 0.33, 0, g); rf.rotation.y = Math.PI / 4; rf.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d));
      put(rbox(0.32, 0.5, 0.08, 0.04), P.dark, 0, 0.25, d / 2 + 0.02, g);
      [-1, 1].forEach(s => put(rbox(0.3, 0.3, 0.06, 0.04), P.blue, s * w * 0.28, h * 0.62, d / 2 + 0.02, g));
      return g;
    };
    const houseA = house(-3.6, -0.1, 1.6, 1.4, 1.2, P.cream, P.roof);
    const houseB = house(3.7, -0.1, 1.7, 1.4, 1.3, P.mint, P.roof3);
    house(-5.0, -2.6, 1.4, 1.3, 1.1, P.butter, P.roof2, 0.2); house(4.8, -2.8, 1.5, 1.4, 1.5, P.pink, P.roof, -0.2); house(-1.8, -1.2, 1.2, 1.1, 1.0, P.white, P.roof3);
    house(1.9, -1.3, 1.2, 1.0, 0.95, P.butter, P.roof2);
    const office = new T.Group(); office.position.set(0, 0.15, -3.0); scene.add(office);
    put(rbox(3.4, 1.7, 1.9, 0.15), P.cream, 0, 0.85, 0, office); put(rbox(3.6, 0.28, 2.1, 0.1), P.red, 0, 1.8, 0, office);
    put(rbox(0.8, 0.95, 0.1, 0.06), P.dark, 0, 0.48, 0.98, office);
    const sign = K.label(this.office, { font: F, weight: 700, px: 80, color: '#ffffff', bg: '#e2524a', radius: 14, pad: 0.3, height: 0.42 }); sign.position.set(0, 2.2, 0.5); office.add(sign);
    // sorting rack: pigeonholes on the office wall that light in turn
    const holes = [];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) holes.push(put(rbox(0.32, 0.28, 0.06, 0.04), paint('#f6ead2').clone(), -1.3 + i * 0.36 + (i > 1 ? 1.6 : 0), 0.65 + j * 0.34, 0.98, office));
    // post box
    const pbox = new T.Group(); pbox.position.set(-2.6, 0.15, 0.75); scene.add(pbox);
    put(new T.CylinderGeometry(0.22, 0.22, 0.7, 20), P.red, 0, 0.35, 0, pbox); put(new T.SphereGeometry(0.22, 20, 10, 0, 7, 0, 1.6), P.red, 0, 0.7, 0, pbox);
    put(new T.BoxGeometry(0.22, 0.04, 0.05), P.dark, 0, 0.55, 0.21, pbox);
    // lollipop trees and peg people
    const tr = K.rng(8), trees = [];
    for (let i = 0, n = 0; i < 200 && n < 16; i++) {
      const x = tr.range(-5.6, 5.6), z = tr.range(-4.1, 4.1);
      if (Math.abs(z - 1.4) < 1.0 || (Math.abs(x) < 0.7 && z < 1.4) || (Math.abs(x) < 2.2 && z < -1.8) || [[-3.6, -0.1], [3.7, -0.1], [-5, -2.6], [4.8, -2.8], [-1.8, -1.2], [1.9, -1.3], [-2.6, 0.75]].some(([hx, hz]) => Math.hypot(hx - x, hz - z) < 1.3)) continue;
      const g = new T.Group(), s = tr.range(0.7, 1.1); g.position.set(x, 0.15, z); scene.add(g);
      put(new T.CylinderGeometry(0.05, 0.06, 0.7 * s, 8), P.trunk, 0, 0.35 * s, 0, g); put(new T.SphereGeometry(0.38 * s, 20, 14), tr() < 0.5 ? P.leaf : P.leaf2, 0, 0.85 * s, 0, g);
      g.userData.ph = tr() * 6; trees.push(g); n++;
    }
    const peg = (x, z, c) => { const g = new T.Group(); g.position.set(x, 0.15, z); scene.add(g); put(new T.CylinderGeometry(0.1, 0.12, 0.38, 14), paint(c), 0, 0.19, 0, g); put(new T.SphereGeometry(0.1, 14, 10), paint('#f2c9a0'), 0, 0.47, 0, g); return g; };
    const sender = peg(-2.95, 0.75, '#7aa7e0'), receiver = peg(4.1, 0.95, '#e2524a');
    const walkers = [peg(-0.8, 2.4, '#f6d77a'), peg(1.0, 0.3, '#a8dcc6'), peg(-4.6, 2.5, '#f29fb0'), peg(2.6, 2.6, '#7f6aa8'), peg(-1.0, -2.2, '#e2524a')];
    // the van and the letter
    const van = new T.Group(); scene.add(van);
    put(rbox(0.95, 0.5, 0.55, 0.1), P.red, -0.05, 0.38, 0, van); put(rbox(0.38, 0.36, 0.52, 0.08), P.red, 0.48, 0.32, 0, van);
    put(new T.BoxGeometry(0.04, 0.2, 0.44), P.blue, 0.68, 0.38, 0, van);
    [[-0.3, 0.27], [0.4, 0.27], [-0.3, -0.27], [0.4, -0.27]].forEach(([x, z]) => { const w = put(new T.CylinderGeometry(0.12, 0.12, 0.08, 16), P.dark, x, 0.12, z, van); w.rotation.x = Math.PI / 2; });
    const letterTex = K.canvasTex(128, 80, (g, r, w, h) => { g.fillStyle = '#fffdf6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9b89a'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(w / 2, h * 0.55); g.lineTo(w, 0); g.stroke(); g.fillStyle = '#e2524a'; g.fillRect(w - 28, 8, 20, 22); });
    const letter = put(new T.BoxGeometry(0.42, 0.02, 0.28), [paint('#fffdf6'), paint('#fffdf6'), new T.MeshStandardMaterial({ map: letterTex, roughness: 0.8 }), paint('#fffdf6'), paint('#fffdf6'), paint('#fffdf6')], 0, 0, 0);
    // route for the van: depot -> post box -> office -> house B
    const pts = [[-5.4, 1.4], [-2.6, 1.4], [-0.4, 1.4], [0, 1.0], [0, -1.7], [0, 1.0], [0.4, 1.4], [3.7, 1.4]];
    const route = new T.CurvePath(); for (let i = 0; i < pts.length - 1; i++) route.add(new T.LineCurve3(new T.Vector3(pts[i][0], 0.28, pts[i][1]), new T.Vector3(pts[i + 1][0], 0.28, pts[i + 1][1])));
    const RL = route.getLength(), cum = route.getCurveLengths();
    const sAt = i => (i ? cum[i - 1] : 0);
    const stopS = [sAt(1), sAt(4), RL];
    const legs = [[B[1] + 0.0, B[1] + 1.1, 0, stopS[0]], [B[2] + 0.0, B[2] + 1.3, stopS[0], stopS[1]], [B[3] + 0.0, B[3] + 1.5, stopS[1], stopS[2]]];
    const vanS = t => { let s = 0; for (const [a, b, s0, s1] of legs) if (t >= a) s = K.lerp(s0, s1, K.prog(t, a, b, 'inOut')); return s; };

    // flags: number badge and word on a pole
    const flagAt = [[-2.0, 0.6], [-1.6, 2.4], [1.3, -1.95], [4.7, 0.9]];
    const flags = this.stops.map((w, i) => {
      const g = new T.Group(); g.position.set(flagAt[i][0], 0.15, flagAt[i][1]); scene.add(g);
      put(new T.CylinderGeometry(0.03, 0.03, 1.6, 8), P.dark, 0, 0.8, 0, g);
      const l = K.label(`${i + 1}  ${w}`, { font: F, weight: 700, px: 64, color: '#3a3a40', bg: '#fbf8f2', radius: 'pill', pad: 0.3, height: 0.36, lit: true });
      l.position.set(l.userData.w / 2 + 0.03, 1.4, 0); l.castShadow = true; g.add(l);
      const dot = put(new T.SphereGeometry(0.07, 12, 8), P.red, 0, 1.62, 0, g);
      return g;
    });
    // cotton clouds around the tile
    const cr = K.rng(12), clouds = [];
    for (let i = 0; i < 6; i++) { const g = new T.Group(); for (let k = 0; k < 4; k++) put(new T.SphereGeometry(cr.range(0.35, 0.6), 16, 12), P.white, k * 0.45 - 0.7, cr.range(-0.1, 0.15), cr.range(-0.2, 0.2), g); g.position.set(cr.range(-8, 8), cr.range(3.2, 5), cr.range(-6, 2)); g.userData = { x: g.position.x, ph: cr() * 6 }; scene.add(g); clouds.push(g); }

    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 92, color: '#ffffff', stroke: '#4a6f86', strokeWidth: 12, height: 0.52 });
      l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.7, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [-6.0, 8.0, 12.0], look: [-1.6, 0.2, 0.4] },
      { t: 3.5, pos: [-3.0, 10.5, 15.0], look: [-0.6, -0.2, 0.0] },
      { t: 7.0, pos: [2.0, 11.0, 15.5], look: [0.4, -0.2, -0.2] },
      { t: 10, pos: [5.0, 10.5, 15.0], look: [0.8, -0.1, 0.0] },
    ], S.camera);
    const V = new T.Vector3();

    return (t, realT) => {
      cam(t);
      const s = vanS(t), p = route.getPointAt(Math.min(1, s / RL)), q0 = route.getPointAt(Math.max(0, (s - 0.08) / RL)), q = p.clone().add(p.clone().sub(q0));
      van.position.copy(p); van.position.y = 0.28 + (legs.some(([a, b]) => t > a && t < b) ? 0.02 * Math.abs(Math.sin(realT * 18)) : 0);
      const tg = route.getTangentAt(Math.min(1, s / RL)); van.rotation.y = -Math.atan2(tg.z, tg.x); // set every call, so seek order does not matter
      // the letter: in the hand, into the box, into the van, into the office, out to the door
      const toBox = K.prog(t, 0.5, 1.2, 'inOut'), toVan = K.prog(t, B[1] + 1.2, B[1] + 1.7, 'inOut'), toOffice = K.prog(t, B[2] + 1.35, B[2] + 1.8, 'inOut');
      const sorted = K.prog(t, B[2] + 1.9, B[2] + 2.3), back = K.prog(t, B[3] - 0.2, B[3] + 0.0), toDoor = K.prog(t, B[3] + 1.55, B[3] + 2.0, 'inOut');
      if (t < B[1] + 1.2) { V.set(-2.8, 0.75, 0.85).lerp(new T.Vector3(-2.6, 0.75, 0.96), toBox); V.y += Math.sin(toBox * Math.PI) * 0.4; letter.visible = toBox < 0.98 || t > B[1] + 1.1; if (toBox >= 0.98) V.set(-2.6, 0.62, 0.75); }
      else if (t < B[2] + 1.35) { V.set(-2.6, 0.7, 0.75).lerp(new T.Vector3().copy(van.position).add(new T.Vector3(0, 0.66, 0)), toVan); V.y += Math.sin(toVan * Math.PI) * 0.6; if (toVan >= 1) V.copy(van.position).add(new T.Vector3(0, 0.66, 0)); letter.visible = true; }
      else if (t < B[3] - 0.2) { V.copy(van.position).add(new T.Vector3(0, 0.66, 0)).lerp(new T.Vector3(0.95, 1.0, -1.95), toOffice); V.y += Math.sin(toOffice * Math.PI) * 0.5; letter.visible = true; }
      else if (t < B[3] + 1.55) { V.copy(van.position).add(new T.Vector3(0, 0.66, 0)); letter.visible = true; }
      else { V.copy(van.position).add(new T.Vector3(0, 0.66, 0)).lerp(new T.Vector3(3.7, 0.45, 0.66), toDoor); V.y += Math.sin(toDoor * Math.PI) * 0.6; }
      letter.position.copy(V); letter.rotation.set(0, realT * 0.5 * (letter.position.y > 0.9 ? 1 : 0), 0);
      holes.forEach((h, i) => { const on = t > B[2] + 1.8 + i * 0.07 && t < B[3] + 1.0 && i === 5 ? 1 : 0; h.material.color.set(on || (t > B[2] + 1.8 + i * 0.07 && t < B[2] + 2.3 + i * 0.07) ? '#f6d77a' : '#f6ead2'); });
      flags.forEach((f, i) => { const p = K.prog(t, B[i] + 0.25 + (i === 0 ? 0 : [0, 1.1, 1.3, 1.5][i]), B[i] + 0.65 + (i === 0 ? 0 : [0, 1.1, 1.3, 1.5][i]), 'back'); f.scale.set(1, Math.max(0.001, p), 1); f.visible = p > 0; f.rotation.y = Math.atan2(S.camera.position.x - f.position.x, S.camera.position.z - f.position.z); });
      sender.position.y = 0.15 + 0.06 * Math.abs(Math.sin(realT * 4)) * (t < 1.4 ? 1 : 0.3);
      receiver.position.y = 0.15 + 0.12 * Math.abs(Math.sin(realT * 6)) * K.prog(t, B[3] + 2.0, B[3] + 2.1);
      walkers.forEach((w, i) => { const a = realT * 0.25 + i * 1.7; w.position.x += 0; w.position.y = 0.15 + 0.04 * Math.abs(Math.sin(realT * 5 + i)); w.rotation.y = a; });
      trees.forEach(g => { g.rotation.z = 0.03 * Math.sin(realT * 1.2 + g.userData.ph); });
      clouds.forEach(g => { g.position.x = g.userData.x + 0.5 * Math.sin(realT * 0.15 + g.userData.ph); });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.06 });
    k.play('paper', { t: 0.6, gain: 0.35 }); k.play('wood', { t: 1.2, gain: 0.3, pitch: 1.4 }); k.play('pop', { t: 0.4, gain: 0.3, pitch: 1.2 });
    [1, 2, 3].forEach(i => { k.play('hum', { t: B[i], gain: 0.15, pitch: 2.2, dur: 1.3 }); k.play('pop', { t: B[i] + [0, 1.35, 1.55, 1.75][i], gain: 0.35, pitch: 1 + i * 0.12 }); });
    k.play('swish', { t: B[1] + 1.2, gain: 0.25, pitch: 1.6, dur: 0.5 });
    k.play('swish', { t: B[2] + 1.35, gain: 0.25, pitch: 1.5, dur: 0.5 });
    for (let i = 0; i < 6; i++) k.play('tick', { t: B[2] + 1.8 + i * 0.07, gain: 0.25, pitch: 1 + i * 0.1 });
    k.play('swish', { t: B[3] + 1.55, gain: 0.25, pitch: 1.4, dur: 0.5 });
    k.play('bell', { t: B[3] + 2.0, gain: 0.25, pitch: 1.4, music: true });
  },
  post: null,
};
