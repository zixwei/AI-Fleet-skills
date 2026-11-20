window.STYLES = window.STYLES || {};
STYLES['glass-liquid'] = {
  id: 'glass-liquid', name: 'Glass and Liquid',
  family: 'Crafted materials',
  use: 'Explainer',
  look: 'Clear lathe-turned glassware on dark polished stone in front of a softly glowing backdrop. Coloured liquids with a visible surface and a curved meniscus, refraction through thick glass, small bright highlights.',
  motion: 'Glasses lift, tilt and pour in a smooth stream; levels rise and fall; what is inside the liquid moves and gathers or stays apart.',
  shownHere: 'How blood types mix: when type A blood meets the plasma of a type B patient, the red cells clump; type O cells carry no A or B marker and stay smooth, so O negative can be given to anyone.',
  goodFor: 'Chemistry, cooking, medicine and any mixing, dilution or reaction: two things are combined and the result is visible inside the glass.',
  fonts: ['Manrope:wght@600;800'],
  duration: 11,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Four blood types: A, B, AB, O' },
    { t: 2.7, label: 'Wrong type: the red cells clump' },
    { t: 5.4, label: 'O cells have no A or B marker' },
    { t: 8.1, label: 'O negative: safe for anyone' },
  ],
  types: ['A', 'B', 'AB', 'O'],
  patient: 'patient: B',

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Manrope';
    scene.background = new T.Color('#07080b'); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 7, target: [0, 1, 0] }); L.key.intensity = 1.6; L.amb.intensity = 0.25; S.scene.environmentIntensity = 0.6;
    const back = new T.Mesh(new T.PlaneGeometry(30, 14), new T.MeshBasicMaterial({ map: K.canvasTex(512, 256, (g, r, w, h) => { const gr = g.createRadialGradient(w / 2, h * 0.55, 10, w / 2, h * 0.55, w * 0.55); gr.addColorStop(0, '#3a6f86'); gr.addColorStop(0.45, '#1c2a3e'); gr.addColorStop(1, '#07080b'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) }));
    back.position.set(0, 4, -6); scene.add(back);
    const stone = new T.Mesh(new T.BoxGeometry(18, 0.5, 9), new T.MeshPhysicalMaterial({ color: '#141518', roughness: 0.6, clearcoat: 0.3, clearcoatRoughness: 0.4, map: K.canvasTex(512, 256, (g, r, w, h) => { g.fillStyle = '#1d1e22'; g.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(255,255,255,${r.range(0.02, 0.06)})`; g.lineWidth = r.range(0.5, 2); g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += r.range(-40, 40); y += r.range(-20, 20); g.lineTo(x, y); } g.stroke(); } }, 2) }));
    stone.position.y = -0.25; stone.receiveShadow = true; scene.add(stone);
    const rim = new T.SpotLight('#9fe3ff', 50, 25, 0.6, 0.8, 1.4); rim.position.set(0, 6, -5); rim.target.position.set(0, 1, 0); scene.add(rim, rim.target);
    const glass = new T.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.04, transmission: 1, thickness: 0.15, ior: 1.5, transparent: true, clearcoat: 1, side: T.DoubleSide, specularIntensity: 1 });
    const flaskGlass = new T.MeshPhysicalMaterial({ color: '#dff4ff', roughness: 0.03, transparent: true, opacity: 0.22, clearcoat: 1, depthWrite: false, side: T.DoubleSide });
    const V2 = (a) => a.map(([x, y]) => new T.Vector2(x, y));
    // a beaker profile (outer and inner wall), and a round flask profile
    const beakerPts = V2([[0, 0], [0.5, 0], [0.55, 0.05], [0.55, 1.4], [0.6, 1.45], [0.56, 1.48], [0.5, 1.42], [0.5, 0.08], [0, 0.08]]);
    const flaskPts = V2([[0, 0], [0.55, 0.02], [0.85, 0.35], [0.88, 0.75], [0.7, 1.1], [0.25, 1.35], [0.22, 2.0], [0.27, 2.05], [0.2, 2.07], [0.17, 2.0], [0.2, 1.35], [0.64, 1.08], [0.82, 0.75], [0.8, 0.37], [0.52, 0.08], [0, 0.07]]);
    // liquid: a solid of revolution with a meniscus that curls up at the wall
    const liquidGeo = (rad, h) => new T.LatheGeometry(V2([[0, 0], [rad, 0], [rad, h], [rad - 0.03, h + 0.025], [rad - 0.09, h - 0.005], [0, h - 0.01]]), 48);
    const blood = c => new T.MeshPhysicalMaterial({ color: c, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0.3, sheenColor: new T.Color('#ff8080') });
    const label = (txt, h = 0.32, col = '#ffffff', bg = 'rgba(10,14,20,0.6)') => K.label(txt, { font: F, weight: 800, px: 64, color: col, bg, radius: 10, pad: 0.3, height: h });
    // four beakers in a row
    const X = [-3.0, -1.0, 1.0, 3.0], tints = ['#9e0f1f', '#a3132b', '#8f0c24', '#b0182a'];
    const beakers = this.types.map((ty, i) => {
      const g = new T.Group(); g.position.set(X[i], 0, -2.3); scene.add(g);
      const piv = new T.Group(); g.add(piv);
      const m = new T.Mesh(new T.LatheGeometry(beakerPts, 64), glass); m.castShadow = true; piv.add(m);
      const liq = new T.Mesh(liquidGeo(0.48, 0.9), blood(tints[i])); liq.position.y = 0.09; piv.add(liq);
      const tag = label(ty, 0.42); tag.position.set(0, 0.6, 0.62); piv.add(tag);
      return { g, piv, liq, tag };
    });
    // two patient flasks in front, each holding plasma from a type B patient (pale yellow)
    const flasks = [-1.6, 1.6].map((x, i) => {
      const g = new T.Group(); g.position.set(x, 0, 1.0); scene.add(g);
      const m = new T.Mesh(new T.LatheGeometry(flaskPts, 64), flaskGlass); m.castShadow = true; m.renderOrder = 3; g.add(m);
      const plasma = new T.Mesh(liquidGeo(0.82, 0.55), Object.assign(blood('#e8c35a'), { transparent: true, opacity: 0.72, depthWrite: false })); plasma.position.y = 0.08; plasma.renderOrder = 2; g.add(plasma);
      const tag = label(this.patient, 0.3); tag.position.set(0, -0.15 + 0.01, 0.95); tag.rotation.x = -0.3; g.add(tag);
      // red cells: small discs that drift; in flask 0 they clump, in flask 1 they stay apart
      const n = 70, cells = new T.InstancedMesh(new T.CylinderGeometry(0.05, 0.05, 0.02, 12), new T.MeshStandardMaterial({ color: '#c3162b', roughness: 0.4 }), n); g.add(cells);
      const cr = K.rng(20 + i), c0 = Array.from({ length: n }, () => { const a = cr() * 6.28, rr = Math.sqrt(cr()) * 0.6; return [Math.cos(a) * rr, 0.15 + cr() * 0.55, Math.sin(a) * rr, cr() * 6, cr.int(0, 4)]; });
      const mark = label(i ? '✓  stays smooth' : '✕  clumps', 0.34, '#ffffff', i ? '#1f8f5a' : '#b3261e'); mark.position.set(0, 2.55, 0); g.add(mark);
      return { g, plasma, cells, c0, mark, n };
    });
    const clumpAt = [[-0.25, 0.3, 0.1], [0.3, 0.35, -0.1], [0.05, 0.55, 0.25], [-0.1, 0.25, -0.3], [0.32, 0.6, 0.2]];
    // a pouring stream
    const streamMat = blood('#a3122a'); 
    const stream = new T.Mesh(new T.CylinderGeometry(0.045, 0.06, 1, 12, 1, true), streamMat); scene.add(stream);
    // glow under the O beaker at the end
    const glow = new T.PointLight('#ff4a5a', 0, 4); scene.add(glow);
    const halo = new T.Sprite(new T.SpriteMaterial({ map: K.canvasTex(64, 64, g => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,90,100,0.9)'); gr.addColorStop(1, 'rgba(255,90,100,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }), transparent: true, blending: T.AdditiveBlending, depthWrite: false })); scene.add(halo);
    const oneg = label('O−  universal donor', 0.4, '#ffffff', '#b3182a'); scene.add(oneg);
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 800, px: 84, color: '#eaf6ff', height: 0.46 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.75, -8); S.camera.add(l); return l; });

    const cam = K.camPath([
      { t: 0, pos: [0, 5.0, 9.8], look: [0, 0.9, -0.6] },
      { t: 2.7, pos: [-1.4, 4.8, 9.2], look: [-1.1, 1.2, -0.2] },
      { t: 5.4, pos: [1.4, 4.8, 9.2], look: [1.1, 1.2, -0.2] },
      { t: 8.1, pos: [0.5, 5.2, 10.4], look: [0.4, 1.1, -0.4] },
      { t: 11, pos: [0, 5.3, 10.8], look: [0, 1.1, -0.4] },
    ], S.camera);
    const MX = new T.Matrix4(), Q = new T.Quaternion(), P = new T.Vector3(), SC = new T.Vector3(1, 1, 1), E = new T.Euler();
    // pour: beaker index b into flask index f, during [t0, t1]
    const pours = [[0, 0, B[1] + 0.1, B[1] + 2.2], [3, 1, B[2] + 0.1, B[2] + 2.2]];
    return (t, realT) => {
      cam(t);
      stream.visible = false;
      beakers.forEach((b, i) => { b.g.position.set(X[i], 0, -2.3); b.piv.rotation.set(0, 0, 0); b.liq.scale.y = 1; });
      pours.forEach(([bi, fi, t0, t1]) => {
        const b = beakers[bi], f = flasks[fi], move = K.prog(t, t0, t0 + 0.6, 'inOut') * (1 - K.prog(t, t1 - 0.3, t1 + 0.3, 'inOut'));
        const tilt = K.prog(t, t0 + 0.5, t0 + 0.9, 'inOut') * (1 - K.prog(t, t1 - 0.5, t1 - 0.2, 'inOut'));
        const target = new T.Vector3(f.g.position.x + (bi === 0 ? -0.95 : 0.95), 2.35, f.g.position.z - 0.1);
        b.g.position.lerpVectors(new T.Vector3(X[bi], 0, -2.3), target, move);
        b.piv.rotation.z = (bi === 0 ? -1 : 1) * 1.75 * tilt;
        const flow = K.prog(t, t0 + 0.8, t1 - 0.4);
        b.liq.scale.y = 1 - 0.55 * flow;
        if (tilt > 0.8 && flow > 0 && flow < 1) {
          const lip = new T.Vector3((bi === 0 ? 1 : -1) * 0.58, 1.45, 0).applyEuler(new T.Euler(0, 0, b.piv.rotation.z)).add(b.g.position);
          const top = f.g.position.y + 0.1 + f.plasma.scale.y * 0.6;
          stream.visible = true; stream.position.set(lip.x, (lip.y + top) / 2, lip.z); stream.scale.set(1, lip.y - top, 1);
          stream.material.color.set(tints[bi]);
        }
        f.plasma.scale.y = 1 + 0.45 * flow;
        f.plasma.material.color.set('#e8c35a').lerp(new T.Color('#8f1022'), K.clamp(flow * 1.6));
      });
      // the cells: in flask 0 they gather into clumps after the pour, in flask 1 they swirl and stay apart
      flasks.forEach((f, fi) => {
        const pour = pours[fi], inside = K.prog(t, pour[2] + 0.9, pour[3] - 0.2), clump = fi === 0 ? K.prog(t, pour[3] - 0.4, pour[3] + 1.2, 'inOut') : 0;
        for (let i = 0; i < f.n; i++) {
          const [x, y, z, ph, c] = f.c0[i], sw = realT * 0.5 + ph;
          P.set(x * Math.cos(sw * 0.3) - z * Math.sin(sw * 0.3), y * (0.4 + 0.6 * inside) + 0.05 * Math.sin(sw), x * Math.sin(sw * 0.3) + z * Math.cos(sw * 0.3));
          const cc = clumpAt[c]; P.lerp(new T.Vector3(cc[0] + 0.07 * Math.cos(ph * 3), cc[1] + 0.07 * Math.sin(ph * 5), cc[2] + 0.07 * Math.sin(ph * 2)), clump);
          E.set(ph + realT * 0.4, ph * 2, realT * 0.3); Q.setFromEuler(E);
          f.cells.setMatrixAt(i, MX.compose(P, Q, SC.setScalar(i / f.n < inside ? 1.0 : 0.0001)));
        }
        f.cells.instanceMatrix.needsUpdate = true;
        f.cells.material.color.set(clump > 0.5 ? '#6e0a16' : '#c3162b');
        const mk = K.prog(t, B[3] + 0.3 + fi * 0.3, B[3] + 0.7 + fi * 0.3, 'back'); f.mark.visible = mk > 0; f.mark.scale.setScalar(Math.max(0.001, mk)); f.mark.lookAt(S.camera.position);
      });
      // O negative: glow and a tag
      const og = K.prog(t, B[3] + 0.8, B[3] + 1.4);
      const ob = beakers[3]; glow.position.copy(ob.g.position).add(new T.Vector3(0, 0.6, 0.6)); glow.intensity = 6 * og * (0.85 + 0.15 * Math.sin(realT * 4));
      halo.position.copy(ob.g.position).add(new T.Vector3(0, 0.7, 0)); halo.scale.setScalar(2.6 * og + 0.001); halo.material.opacity = og;
      oneg.visible = og > 0; oneg.position.copy(ob.g.position).add(new T.Vector3(0.4, 2.9, 0)); oneg.scale.setScalar(Math.max(0.001, K.ease.back(og))); oneg.lookAt(S.camera.position);
      beakers.forEach(b => b.tag.lookAt(S.camera.position));
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.06 });
    [0, 1, 2, 3].forEach(i => k.play('glass', { t: 0.3 + i * 0.25, gain: 0.25, pitch: 1 + i * 0.15 }));
    [B[1], B[2]].forEach(b => { k.play('glass', { t: b + 0.15, gain: 0.3, pitch: 0.9 }); k.play('splash', { t: b + 0.95, gain: 0.25, pitch: 1.6, dur: 1.3 }); for (let i = 0; i < 5; i++) k.play('bubble', { t: b + 1.1 + i * 0.2, gain: 0.15, pitch: 0.8 + i * 0.1 }); k.play('glass', { t: b + 2.4, gain: 0.25, pitch: 1.2 }); });
    k.play('thud', { t: B[2] - 0.2, gain: 0.3, pitch: 0.6 }); k.play('blip', { t: B[2] - 0.15, gain: 0.2, pitch: 0.4 });
    k.play('chime', { t: B[3] + 0.6, gain: 0.25, pitch: 1.2, music: true });
    k.play('sparkle', { t: B[3] + 1.0, gain: 0.25 });
  },
  post: null,
};
