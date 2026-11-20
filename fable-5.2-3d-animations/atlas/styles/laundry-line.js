window.STYLES = window.STYLES || {};
STYLES['laundry-line'] = {
  id: 'laundry-line', name: 'Laundry Line',
  family: 'Kitchen and home',
  use: 'Story',
  look: 'A clothes line across a sunny back yard, between two wooden posts, with a fence and blue sky. Each item on the line is one event, printed with its own picture and name. Wooden pegs hold them up.',
  motion: 'Items are pegged on one at a time, left to right, with a little bounce. Everything already on the line moves in the wind, the bottoms swinging more than the tops. The camera walks along the line, then steps back to see it all.',
  shownHere: 'The stages of a project timeline: kick-off, plan, build, test and launch, each pegged on in order so the whole line reads as the project.',
  goodFor: 'Timelines and sequences: project phases, a life story, the steps of a recipe, a history in five moments.',
  fonts: ['Patrick Hand', 'Nunito:wght@800'],
  duration: 12,
  samples: 4,
  // CONTENT: the items in order; kind sets the cut, colour the cloth, icon the print
  items: [
    { name: 'Kick-off', kind: 'shirt', color: '#f2c84a', icon: 'bulb' },
    { name: 'Plan', kind: 'towel', color: '#5ab0e8', icon: 'list' },
    { name: 'Build', kind: 'sheet', color: '#f08a5a', icon: 'gear' },
    { name: 'Test', kind: 'shirt', color: '#7ad08a', icon: 'check' },
    { name: 'Launch', kind: 'towel', color: '#c87ae8', icon: 'rocket' },
  ],
  beats: [
    { t: 0.0, label: 'Kick-off: the idea goes up first' },
    { t: 2.4, label: 'Plan: the steps, in order' },
    { t: 4.8, label: 'Build: the longest stretch' },
    { t: 7.2, label: 'Test: check it before it ships' },
    { t: 9.6, label: 'Launch: the whole line, start to finish' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), FP = 'Patrick Hand', FN = 'Nunito', IT = this.items, BE = this.beats;
    scene.background = new T.Color('#8cc8f0'); scene.add(S.camera);
    const L = K.lights(S, 'sun', { size: 10 }); L.key.position.set(5, 11, 7);
    const std = (c, r = 0.8, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const grass = new T.Mesh(new T.PlaneGeometry(60, 40), std('#6aa04a', 0.95)); grass.rotation.x = -Math.PI / 2; grass.receiveShadow = true; scene.add(grass);
    for (let x = -14; x <= 14; x += 0.7) { const p = new T.Mesh(new T.BoxGeometry(0.5, 1.6, 0.08), std('#f4efe6', 0.8)); p.position.set(x, 0.8, -5); p.castShadow = true; scene.add(p); }
    const rail = new T.Mesh(new T.BoxGeometry(30, 0.12, 0.1), std('#f4efe6')); rail.position.set(0, 1.2, -4.95); scene.add(rail);
    // posts and the line: a sagging curve
    const X0 = -7.5, X1 = 7.5, H = 3.6, SAG = 0.45;
    [X0, X1].forEach(x => { const p = new T.Mesh(new T.CylinderGeometry(0.1, 0.12, H + 0.2, 10), std('#8a6a4a')); p.position.set(x, (H + 0.2) / 2, 0); p.castShadow = true; scene.add(p); const c = new T.Mesh(new T.BoxGeometry(0.8, 0.1, 0.1), std('#8a6a4a')); c.position.set(x, H, 0); scene.add(c); });
    const lineY = x => H - SAG * (1 - ((x - (X0 + X1) / 2) / ((X1 - X0) / 2)) ** 2);
    const lp = []; for (let i = 0; i <= 60; i++) { const x = X0 + i / 60 * (X1 - X0); lp.push(new T.Vector3(x, lineY(x), 0)); }
    const line = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(lp), 120, 0.018, 6), std('#f4f4f0', 0.6)); line.castShadow = true; scene.add(line);
    // cloth: a canvas with the cut as alpha and the print as colour; vertices sway each frame
    const icons = {
      bulb: (g, x, y, s) => { g.fillStyle = '#fff8d0'; g.beginPath(); g.arc(x, y - s * 0.15, s * 0.35, 0, 7); g.fill(); g.fillStyle = '#6a6a6a'; g.fillRect(x - s * 0.15, y + s * 0.2, s * 0.3, s * 0.18); },
      list: (g, x, y, s) => { g.fillStyle = '#ffffff'; g.fillRect(x - s * 0.35, y - s * 0.45, s * 0.7, s * 0.9); g.strokeStyle = '#3a6a9a'; g.lineWidth = 6; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x - s * 0.22, y - s * 0.28 + k * s * 0.2); g.lineTo(x + s * 0.24, y - s * 0.28 + k * s * 0.2); g.stroke(); } },
      gear: (g, x, y, s) => { g.fillStyle = '#ffffff'; for (let k = 0; k < 8; k++) { g.save(); g.translate(x, y); g.rotate(k * Math.PI / 4); g.fillRect(-s * 0.07, -s * 0.45, s * 0.14, s * 0.2); g.restore(); } g.beginPath(); g.arc(x, y, s * 0.3, 0, 7); g.fill(); g.fillStyle = '#f08a5a'; g.beginPath(); g.arc(x, y, s * 0.12, 0, 7); g.fill(); },
      check: (g, x, y, s) => { g.strokeStyle = '#ffffff'; g.lineWidth = s * 0.14; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - s * 0.3, y); g.lineTo(x - s * 0.08, y + s * 0.25); g.lineTo(x + s * 0.35, y - s * 0.3); g.stroke(); },
      rocket: (g, x, y, s) => { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x, y - s * 0.5); g.quadraticCurveTo(x + s * 0.22, y - s * 0.2, x + s * 0.16, y + s * 0.25); g.lineTo(x - s * 0.16, y + s * 0.25); g.quadraticCurveTo(x - s * 0.22, y - s * 0.2, x, y - s * 0.5); g.fill(); g.fillStyle = '#ffb040'; g.beginPath(); g.moveTo(x - s * 0.1, y + s * 0.27); g.lineTo(x, y + s * 0.5); g.lineTo(x + s * 0.1, y + s * 0.27); g.fill(); },
    };
    const cut = (g, kind, w, h) => { g.beginPath(); if (kind === 'shirt') { g.moveTo(w * 0.3, 0); g.lineTo(w * 0.42, h * 0.06); g.lineTo(w * 0.58, h * 0.06); g.lineTo(w * 0.7, 0); g.lineTo(w, h * 0.16); g.lineTo(w * 0.88, h * 0.34); g.lineTo(w * 0.78, h * 0.28); g.lineTo(w * 0.8, h); g.lineTo(w * 0.2, h); g.lineTo(w * 0.22, h * 0.28); g.lineTo(w * 0.12, h * 0.34); g.lineTo(0, h * 0.16); g.closePath(); } else g.rect(0, 0, w, h); };
    const SIZES = { shirt: [1.9, 2.0], towel: [1.6, 2.2], sheet: [2.8, 2.4] };
    const slots = []; let x = X0 + 0.6; IT.forEach(it => { const [w] = SIZES[it.kind]; slots.push(x + w / 2); x += w + 0.35; });
    const off = ((X1 - 0.6) - x + 0.35) / 2; for (let i = 0; i < slots.length; i++) slots[i] += off;
    const cloths = IT.map((it, i) => {
      const [w, h] = SIZES[it.kind];
      const tex = K.canvasTex(Math.round(w * 160), Math.round(h * 160), (g, r, cw, ch) => { g.clearRect(0, 0, cw, ch); g.save(); cut(g, it.kind, cw, ch); g.clip(); g.fillStyle = it.color; g.fillRect(0, 0, cw, ch);
        if (it.kind === 'towel') { g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(0, ch * 0.85, cw, ch * 0.05); g.fillRect(0, ch * 0.08, cw, ch * 0.03); }
        for (let k = 0; k < 1200; k++) { g.fillStyle = `rgba(0,0,0,${r.range(0.01, 0.04)})`; g.fillRect(r() * cw, r() * ch, 2, 2); }
        icons[it.icon](g, cw / 2, ch * 0.45, Math.min(cw, ch) * 0.45); g.fillStyle = '#ffffff'; g.font = `400 ${Math.round(ch * 0.12)}px "${FP}"`; g.textAlign = 'center'; g.fillText(`${i + 1}. ${it.name}`, cw / 2, ch * 0.82); g.restore(); }, 10 + i);
      const geo = new T.PlaneGeometry(w, h, 14, 16); geo.translate(0, -h / 2, 0);
      const m = new T.Mesh(geo, new T.MeshStandardMaterial({ map: tex, alphaTest: 0.5, transparent: true, side: T.DoubleSide, roughness: 0.9 }));
      m.castShadow = true; m.customDepthMaterial = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, map: tex, alphaTest: 0.5 }); scene.add(m);
      const pegs = [-w * 0.42, w * 0.42].map(dx => { const p = new T.Mesh(new T.BoxGeometry(0.08, 0.32, 0.12), std('#c8a070', 0.6)); p.castShadow = true; scene.add(p); return { p, dx }; });
      return { m, geo, base: Float32Array.from(geo.attributes.position.array), w, h, x: slots[i], pegs, t0: B[i] + 0.1 };
    });
    const titles = BE.map(b => { const l = K.label(b.label, { font: FN, weight: 800, px: 66, color: '#2a3a4a', bg: 'rgba(255,255,255,0.88)', radius: 16, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const look = new T.Vector3();
    return (t, realT) => {
      // the camera walks along the line, following the newest item, then steps back
      let k = 0; for (let i = 1; i < B.length; i++) if (t >= B[i]) k = i;
      const fx = K.lerp(cloths[Math.max(0, k - 1)].x, cloths[k].x, k ? K.prog(t, B[k], B[k] + 1.0, 'inOut') : 1), back = K.prog(t, B[4] + 0.8, 11.8, 'inOut');
      S.camera.position.set(K.lerp(fx + 1.2, 0.4, back), K.lerp(2.4, 3.0, back), K.lerp(7.0, 15.0, back)); look.set(K.lerp(fx, 0, back), K.lerp(2.4, 2.2, back), 0); S.camera.lookAt(look);
      cloths.forEach((c, i) => {
        const up = K.prog(t, c.t0, c.t0 + 0.6, 'back'), on = t >= c.t0;
        c.m.visible = on; c.pegs.forEach(pg => { pg.p.visible = t > c.t0 + 0.5; });
        if (!on) return;
        const y0 = lineY(c.x), P = c.geo.attributes.position, b = c.base;
        for (let v = 0; v < P.count; v++) { const bx = b[v * 3], by = b[v * 3 + 1], depth = -by / c.h, wind = Math.sin(realT * 2.2 + bx * 1.3 + i) * 0.25 + Math.sin(realT * 3.7 + by * 2 + i * 2) * 0.08;
          P.setXYZ(v, bx, by + 0.03 * depth * Math.sin(realT * 3 + bx), depth * depth * wind * 1.4 + depth * 0.15); }
        P.needsUpdate = true; c.geo.computeVertexNormals();
        c.m.position.set(c.x, y0 + 0.02 - 2.5 * (1 - up), 0.0); c.m.rotation.z = 0.05 * Math.sin(realT * 1.3 + i) * (t > c.t0 + 0.6 ? 1 : 0);
        c.pegs.forEach(pg => { pg.p.position.set(c.x + pg.dx, lineY(c.x + pg.dx) - 0.05, 0.03); });
      });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.06 });
    B.forEach((b, i) => { k.play('swish', { t: b + 0.1, gain: 0.2, pitch: 1.0, dur: 0.6 }); k.play('wood', { t: b + 0.6, gain: 0.3, pitch: 1.6 }); k.play('wood', { t: b + 0.68, gain: 0.25, pitch: 1.7 }); k.play('pluck', { t: b + 0.7, gain: 0.12, pitch: [1, 1.12, 1.26, 1.33, 1.5][i], music: true }); });
    k.play('whoosh', { t: B[4] + 1.0, gain: 0.12, pitch: 0.6, dur: 1.6 }); k.play('chime', { t: B[4] + 1.8, gain: 0.15, pitch: 1.0, music: true });
  },
  post: null,
};
