window.STYLES = window.STYLES || {};
STYLES['ice-core'] = {
  id: 'ice-core', name: 'Ice Core',
  family: 'Earth, weather and sky',
  use: 'Explainer',
  look: 'A long cylinder of ice on a glowing light table in a cold lab. The ice has layers: fine year lines, trapped bubbles, grey dust bands and one dark ash layer. Small scenes of each era sit frozen inside. A brass caliper marks the layer being read.',
  motion: 'The camera travels slowly along the core. The caliper slides to each layer and closes on it. A line graph draws itself on the light table under the core as the camera passes.',
  shownHere: 'About 400,000 years of climate in one Antarctic ice core: each layer is a year of snow; bubbles keep old air; ash marks an eruption and dust marks cold, dry times; ice ages come back about every 100,000 years; carbon dioxide rose and fell with them, between about 180 and 280 ppm.',
  goodFor: 'Records and timelines read from a physical sample: geology, history, logs, version history, anything where depth is time.',
  fonts: ['IBM Plex Sans:wght@500;700'],
  duration: 12,
  samples: 4,
  // CONTENT: x on the core runs from now (left) to 400,000 years ago (right)
  beats: [
    { t: 0.0, label: 'Each layer of ice is a year of snow' },
    { t: 2.4, label: 'Bubbles keep air from the year they froze' },
    { t: 4.8, label: 'Ash marks an eruption, dust marks a cold, dry time' },
    { t: 7.2, label: 'Ice ages return about every 100,000 years' },
    { t: 9.6, label: 'CO₂ went with them: about 180 to 280 ppm' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'IBM Plex Sans', BE = this.beats;
    scene.background = new T.Color('#0c1218'); scene.add(S.camera);
    const L = K.lights(S, 'night', { size: 10 }); L.key.intensity = 0.8; L.amb.intensity = 0.5;
    const std = (c, r = 0.6, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const X0 = -8, X1 = 8, LEN = X1 - X0, R = 0.5;
    // climate along the core: warm peaks (interglacials) about every 100,000 years
    const yrs = x => (x - X0) / LEN * 400000;
    const warm = x => { const y = yrs(x) / 1000; const peaks = [0, 125, 240, 330, 410]; let w = 0; peaks.forEach(p => { w = Math.max(w, Math.exp(-((y - p) ** 2) / (2 * 9 * 9))); }); return 0.15 + 0.85 * w - 0.12 * Math.sin(y / 23); };
    // the light table and the graph that draws on it
    const table = new T.Mesh(new T.BoxGeometry(18.5, 0.3, 4.6), std('#202830', 0.5)); table.position.set(0, -0.75, 0.6); scene.add(table);
    const gcan = document.createElement('canvas'); gcan.width = 2048; gcan.height = 512; const gg = gcan.getContext('2d');
    const gtex = new T.CanvasTexture(gcan); gtex.colorSpace = T.SRGBColorSpace;
    const glass = new T.Mesh(new T.PlaneGeometry(17, 4.2), new T.MeshBasicMaterial({ map: gtex })); glass.rotation.x = -Math.PI / 2; glass.position.set(0, -0.59, 0.6); scene.add(glass);
    const gx = x => (x - X0 + 0.5) / 17 * 2048;
    const drawGraph = (upto, co2) => { gg.fillStyle = '#dfeaf2'; gg.fillRect(0, 0, 2048, 512); gg.strokeStyle = 'rgba(80,110,140,0.25)'; gg.lineWidth = 2; for (let k = 0; k <= 4; k++) { const x = gx(X0 + k * LEN / 4); gg.beginPath(); gg.moveTo(x, 0); gg.lineTo(x, 512); gg.stroke(); }
      gg.fillStyle = '#3a5a7a'; gg.font = `700 34px "${F}"`; gg.textAlign = 'center'; for (let k = 0; k <= 4; k++) gg.fillText(k === 0 ? 'now' : `${k * 100},000 years ago`, gx(X0 + k * LEN / 4) + (k === 0 ? 40 : k === 4 ? -130 : 0), 492);
      if (upto > X0) { gg.strokeStyle = co2 ? '#d8502a' : '#2a6ad8'; gg.lineWidth = 6; gg.beginPath(); for (let x = X0; x <= upto; x += 0.02) { const y = 400 - warm(x) * 300; x === X0 ? gg.moveTo(gx(x), y) : gg.lineTo(gx(x), y); } gg.stroke();
        gg.fillStyle = co2 ? '#d8502a' : '#2a6ad8'; gg.font = `700 40px "${F}"`; gg.textAlign = 'left'; gg.fillText(co2 ? 'CO₂ in the bubbles: 180–280 ppm' : 'warm  ↑     cold ↓', gx(X0) + 20, 60); } gtex.needsUpdate = true; };
    // the core: translucent ice with a band texture along its length
    const band = K.canvasTex(32, 4096, (g, r, w, h) => { for (let y = 0; y < h; y++) { const x = X0 + (y / h) * LEN, wv = warm(x), dust = K.clamp(0.75 - wv) * 0.9; const c = 215 + 35 * wv - dust * 150; g.fillStyle = `rgb(${c - 10 + dust * 40},${c - dust * 10},${Math.min(255, c + 20 - dust * 40)})`; g.fillRect(0, y, w, 1); if (y % (3 + Math.floor(y / 700)) === 0) { g.fillStyle = 'rgba(40,60,80,0.35)'; g.fillRect(0, y, w, 1); } }
      const ay = Math.floor(((-5.2 - X0) / LEN) * h); g.fillStyle = '#1a1612'; g.fillRect(0, ay, w, 40); }, 3);
    const coreGeo = new T.CylinderGeometry(R, R, LEN, 48, 1, false); coreGeo.rotateZ(Math.PI / 2);
    const core = new T.Mesh(coreGeo, new T.MeshStandardMaterial({ map: band, transparent: true, opacity: 0.7, roughness: 0.15, emissive: '#ffffff', emissiveMap: band, emissiveIntensity: 0.55, depthWrite: false })); core.position.y = 0; scene.add(core);
    const rr = K.rng(68), NB = 900;
    const bub = new T.InstancedMesh(new T.SphereGeometry(1, 8, 6), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.75 }), NB); bub.frustumCulled = false; scene.add(bub);
    const O = new T.Object3D(); for (let i = 0; i < NB; i++) { const x = rr.range(X0 + 0.1, X1 - 0.1), a = rr() * 6.28, rad = Math.sqrt(rr()) * R * 0.85; O.position.set(x, Math.sin(a) * rad, Math.cos(a) * rad); O.scale.setScalar(rr.range(0.008, 0.022) * (1 - (x - X0) / LEN * 0.6)); O.updateMatrix(); bub.setMatrixAt(i, O.matrix); }
    // frozen scenes: a tree in a warm time, a mammoth in a cold time, a volcano by the ash
    const mini = new T.Group(); scene.add(mini);
    const tree = new T.Group(); const tr = new T.Mesh(new T.CylinderGeometry(0.03, 0.04, 0.25, 6), std('#5a3a20')); tr.position.y = -0.15; const cr = new T.Mesh(new T.ConeGeometry(0.16, 0.38, 8), std('#2a6a3a')); cr.position.y = 0.12; tree.add(tr, cr); tree.position.set(X0 + 0.9, -0.12, 0); mini.add(tree);
    const mam = new T.Group(); const mb = new T.Mesh(new T.SphereGeometry(0.2, 12, 8), std('#6a4a30')); mb.scale.set(1.3, 0.9, 0.8); const mh = new T.Mesh(new T.SphereGeometry(0.11, 10, 8), std('#6a4a30')); mh.position.set(0.25, 0.06, 0); const tusk = new T.Mesh(new T.TorusGeometry(0.08, 0.012, 6, 12, Math.PI), std('#f0e8d8')); tusk.position.set(0.32, -0.04, 0); tusk.rotation.z = Math.PI; mam.add(mb, mh, tusk); [-0.12, 0.12].forEach(x => [-0.07, 0.07].forEach(z => { const l = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.18, 6), std('#5a3a20')); l.position.set(x, -0.2, z); mam.add(l); }));
    mam.position.set(X0 + 4.6, -0.04, 0); mini.add(mam);
    const volc = new T.Mesh(new T.ConeGeometry(0.22, 0.3, 10, 1, true), std('#3a3030')); volc.position.set(-5.2 + 0.25, -0.2, 0); mini.add(volc);
    // the caliper: a brass bar with two jaws that close on a layer
    const brass = std('#c9a04a', 0.3, { metalness: 0.9 });
    const cal = new T.Group(); scene.add(cal);
    const bar = new T.Mesh(new T.BoxGeometry(1.4, 0.08, 0.06), brass); bar.position.set(0, 0.95, 0); cal.add(bar);
    const jaws = [-1, 1].map(s => { const j = new T.Mesh(new T.BoxGeometry(0.06, 0.55, 0.06), brass); j.position.set(s * 0.3, 0.68, 0); cal.add(j); return j; });
    const calTag = []; const marks = [{ x: X0 + 0.25, w: 0.06, txt: '1 year' }, { x: X0 + 1.5, w: 0.25, txt: 'bubbles: old air' }, { x: -5.2, w: 0.12, txt: 'ash layer' }, { x: X0 + 4.6, w: 0.8, txt: 'ice age: dust' }, { x: X0 + 6.2, w: 0.6, txt: 'warm time' }];
    marks.forEach(m => { const l = K.label(m.txt, { font: F, weight: 700, px: 48, color: '#1a2a3a', bg: 'rgba(240,246,250,0.9)', radius: 8, pad: 0.18, height: 0.24 }); l.position.set(0, -0.15, 0.85); l.visible = false; cal.add(l); calTag.push(l); });
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 64, color: '#e8f4ff', bg: 'rgba(10,16,22,0.85)', radius: 8, pad: 0.35, height: 0.36 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    // camera and caliper stops per beat
    const stop = [0, 1, 2, 3, 4].map(i => [[X0 + 0.6, 0], [X0 + 1.6, 1], [-5.0, 2], [X0 + 4.6, 3], [X0 + 6.2, 4]][i]);
    const P = new T.Vector3(), Lk = new T.Vector3();
    return (t, realT) => {
      let k = 0; for (let i = 1; i < B.length; i++) if (t >= B[i]) k = i;
      const u = k ? K.prog(t, B[k], B[k] + 1.2, 'inOut') : 1, x = K.lerp(stop[Math.max(0, k - 1)][0], stop[k][0], u);
      const wide = K.prog(t, B[3] + 0.4, B[3] + 1.6, 'inOut');
      P.set(x - 0.5 + wide * (2.2 - x * 0.9), 1.5 + wide * 4.6, 4.6 + wide * 9.5); Lk.set(x + wide * (1.0 - x), 0.25 - wide * 0.5, 0.1 + wide * 0.8); S.camera.position.copy(P); S.camera.lookAt(Lk);
      const m = marks[k]; cal.position.x = K.lerp(marks[Math.max(0, k - 1)].x, m.x, u); const close = K.prog(t, B[k] + 0.9, B[k] + 1.4, 'out'); jaws[0].position.x = -K.lerp(0.55, m.w / 2 + 0.03, close); jaws[1].position.x = K.lerp(0.55, m.w / 2 + 0.03, close);
      calTag.forEach((l, i) => { l.visible = i === k && close > 0.5; });
      const upto = t < B[3] ? X0 : K.lerp(X0, X1, K.prog(t, B[3] + 0.2, B[3] + 2.2, 'inOut'));
      drawGraph(upto, t > B[4] + 0.2);
      mini.children.forEach((c, i) => { c.rotation.y = 0.2 * Math.sin(realT * 0.5 + i); });
      titles.forEach((l, i) => { const a2 = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a2 > 0.01; l.material.opacity = a2; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.04 }); k.bed('machine', { gain: 0.02 });
    k.play('glass', { t: 0.3, gain: 0.15, pitch: 1.4 }); k.play('chime', { t: 0.6, gain: 0.1, pitch: 0.8, music: true });
    B.slice(1).forEach((b, i) => { k.play('swish', { t: b + 0.1, gain: 0.12, pitch: 0.8, dur: 1.0 }); k.play('metal', { t: b + 1.3, gain: 0.25, pitch: 1.6 }); k.play('click', { t: b + 1.35, gain: 0.25, pitch: 1.2 }); });
    k.play('bubble', { t: B[1] + 1.5, gain: 0.2, pitch: 1.4 }); k.play('thud', { t: B[2] + 1.4, gain: 0.2, pitch: 0.6 });
    k.play('paper', { t: B[3] + 0.3, gain: 0.15, pitch: 0.6, dur: 2.0 }); k.play('pluck', { t: B[4] + 0.5, gain: 0.12, pitch: 0.8, music: true }); k.play('bell', { t: B[4] + 1.6, gain: 0.12, pitch: 0.5, music: true });
  },
  post: null,
};
