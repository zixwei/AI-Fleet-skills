window.STYLES = window.STYLES || {};
STYLES['soft-clay'] = {
  id: 'soft-clay', name: 'Soft Clay',
  family: 'Crafted materials',
  use: 'Explainer',
  look: 'Plasticine on a small tabletop: lumpy, slightly lopsided forms with thumb dents and fingerprints, in 4 saturated colours. Warm studio light, a soft shadow, a painted backdrop.',
  motion: 'Stop-motion on twos (12 steps a second) with a small boil between steps. New pieces drop in and squash flat, then settle.',
  shownHere: 'How compound interest grows: $100 at 10% a year becomes $673 in 20 years, and most of the growth is interest on interest.',
  goodFor: 'Growth, sums and parts of a whole: things that pile up piece by piece. Use one colour for each part, and let the stacks tell the numbers.',
  fonts: ['Fredoka:wght@600;700'],
  duration: 10,
  samples: 6,
  // CONTENT: $100 at 10% a year, compound. Principal / simple interest / interest on interest, in dollars.
  beats: [
    { t: 0.0, label: 'Start with $100' },
    { t: 2.5, label: '+10% every year' },
    { t: 5.0, label: 'Interest earns interest' },
    { t: 7.5, label: '20 years: $673' },
  ],
  years: [
    { y: 0, total: 100, parts: [100, 0, 0] },
    { y: 5, total: 161, parts: [100, 50, 11] },
    { y: 10, total: 259, parts: [100, 100, 59] },
    { y: 15, total: 418, parts: [100, 150, 168] },
    { y: 20, total: 673, parts: [100, 200, 373] },
  ],
  legend: ['your $100', 'interest', 'interest on interest'],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Fredoka';
    const COL = { yellow: '#ffc93c', coral: '#ff5d5d', blue: '#3b7dd8', green: '#4cbf6b', pink: '#f7a1b8', table: '#f3e2c4', wall: '#7fc8c2' };
    scene.background = new T.Color(COL.wall); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 7, target: [0, 1, 0] });
    L.key.color.set('#fff0dc'); L.key.position.set(4, 9, 7);

    // fingerprints and thumb dents: one bump texture for all clay
    const prints = K.canvasTex(512, 512, (g, r, w, h) => {
      g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
      for (let k = 0; k < 9; k++) {
        const cx = r() * w, cy = r() * h, rot = r() * 3;
        for (let j = 3; j < 26; j++) { g.strokeStyle = `rgba(${j % 2 ? 60 : 200},${j % 2 ? 60 : 200},${j % 2 ? 60 : 200},0.25)`; g.lineWidth = 2.2;
          g.beginPath(); g.ellipse(cx, cy, j * 3.2, j * 2.2, rot, 0.3, 5.2); g.stroke(); }
      }
      for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${r() < 0.5 ? 0 : 255},0,0,0.05)`; g.fillRect(r() * w, r() * h, 2, 2); }
    }, 5);
    prints.wrapS = prints.wrapT = T.RepeatWrapping;
    const clayMat = c => new T.MeshPhysicalMaterial({ color: c, roughness: 0.62, clearcoat: 0.15, clearcoatRoughness: 0.6, bumpMap: prints, bumpScale: 1.2 });
    const M = { yellow: clayMat(COL.yellow), coral: clayMat(COL.coral), blue: clayMat(COL.blue), green: clayMat(COL.green), pink: clayMat(COL.pink), cream: clayMat('#fff4e0'), dark: clayMat('#3a2a2a') };
    // lumpy: push each vertex in or out along its direction from the centre, plus a few thumb dents
    const lump = (geo, seed, amt = 0.035, dents = 2) => {
      const r = K.rng(seed), p = geo.attributes.position, v = new T.Vector3(), n = new T.Vector3();
      const ph = [r() * 6, r() * 6, r() * 6], D = Array.from({ length: dents }, () => new T.Vector3(r.range(-1, 1), r.range(-0.3, 1), r.range(-1, 1)).normalize());
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i); n.copy(v).normalize();
        let d = amt * (Math.sin(v.x * 3.1 + ph[0]) + Math.sin(v.y * 4.7 + ph[1]) + Math.sin(v.z * 3.3 + ph[2])) / 3;
        D.forEach(dd => { d -= 0.05 * Math.exp(-(1 - n.dot(dd)) * 30); });
        v.addScaledVector(n, d); p.setXYZ(i, v.x, v.y, v.z);
      }
      geo.computeVertexNormals(); return geo;
    };
    const blob = (geo, mat, seed, amt, dents) => { const m = new T.Mesh(lump(geo, seed, amt, dents), mat); m.castShadow = m.receiveShadow = true; return m; };

    // table and backdrop sweep
    const wood = K.canvasTex(1024, 512, (g, r, w, h) => {
      g.fillStyle = COL.table; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(150,105,60,${r.range(0.03, 0.09)})`; g.lineWidth = r.range(1, 4); g.beginPath(); const y = r() * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + r.range(-20, 20), w * 0.7, y + r.range(-20, 20), w, y + r.range(-10, 10)); g.stroke(); }
    }, 3);
    const table = new T.Mesh(new T.BoxGeometry(16, 0.4, 8), new T.MeshStandardMaterial({ map: wood, roughness: 0.8 }));
    table.position.y = -0.2; table.receiveShadow = true; scene.add(table);
    const sweep = new T.Mesh(new T.CylinderGeometry(6, 6, 30, 32, 1, true, Math.PI, Math.PI / 2), new T.MeshStandardMaterial({ color: COL.wall, roughness: 1, side: T.BackSide }));
    sweep.rotation.z = Math.PI / 2; sweep.position.set(0, 6, -1.6); sweep.receiveShadow = true; scene.add(sweep);
    // painted clay dots on the backdrop
    const dotR = K.rng(8);
    for (let i = 0; i < 14; i++) {
      const d = blob(new T.SphereGeometry(dotR.range(0.12, 0.3), 16, 10), dotR.pick([M.cream, M.pink, M.yellow]), 100 + i, 0.03, 1);
      d.scale.z = 0.35; d.position.set(dotR.range(-9, 9), dotR.range(3.5, 8.5), -7.45); scene.add(d);
    }

    // five stacks of clay coins: yellow = principal, coral = simple interest, blue = interest on interest
    const PER = 25, H = 0.13, X = [-3.2, -1.6, 0, 1.6, 3.2], coinGeos = [0, 1, 2, 3].map(i => lump(new T.CylinderGeometry(0.52, 0.55, H, 22, 2), 30 + i, 0.03, 1));
    const START = [0, B[1] + 0.2, B[2] + 0.1, B[2] + 1.2, B[3] + 0.1], SPAN = [0.01, 1.8, 1.0, 1.15, 1.6];
    const stacks = this.years.map((yr, c) => {
      const coins = [], mats = [M.yellow, M.coral, M.blue];
      yr.parts.forEach((v, part) => { for (let k = 0; k < Math.round(v / PER); k++) coins.push(mats[part]); });
      const g = new T.Group(); g.position.set(X[c], 0, 0); scene.add(g);
      const r = K.rng(60 + c);
      const meshes = coins.map((mat, k) => {
        const m = new T.Mesh(coinGeos[(k + c) % 4], mat); m.castShadow = m.receiveShadow = true;
        m.userData = { y: H * 0.5 + k * H * 0.96, rot: r() * 6, dx: r.range(-0.05, 0.05), dz: r.range(-0.05, 0.05), tilt: r.range(-0.04, 0.04),
          t0: START[c] + (k / Math.max(1, coins.length)) * SPAN[c] };
        g.add(m); return m;
      });
      // value tag on top and year tag in front
      const top = K.label('$' + yr.total, { font: F, weight: 700, px: 64, color: '#3a2a2a', bg: '#fff4e0', radius: 'pill', pad: 0.35, height: 0.42 });
      top.position.y = coins.length * H * 0.96 + 0.55; g.add(top);
      const yl = K.label(yr.y === 0 ? 'now' : 'year ' + yr.y, { font: F, weight: 600, px: 54, color: '#3a2a2a', height: 0.3 });
      yl.position.set(0, 0.12, 1.0); yl.rotation.x = -Math.PI / 2 + 0.6; g.add(yl);
      return { g, meshes, top, yl, c };
    });

    // a clay arrow that bends up over the stacks in the last beat
    const arrowPts = X.map((x, c) => new T.Vector3(x, this.years[c].parts.reduce((a, b) => a + b, 0) / PER * H * 0.96 + 1.05, 0.2));
    const arrowCurve = new T.CatmullRomCurve3(arrowPts);
    const arrowGeo = lump(new T.TubeGeometry(arrowCurve, 120, 0.09, 10), 77, 0.015, 0);
    const arrow = new T.Mesh(arrowGeo, M.green); arrow.castShadow = true; scene.add(arrow);
    const head = blob(new T.ConeGeometry(0.26, 0.5, 14), M.green, 78, 0.02, 0); scene.add(head);

    // legend chips: little clay coins with words, front left
    const legend = this.legend.map((w, i) => {
      const g = new T.Group(), chip = new T.Mesh(coinGeos[i], [M.yellow, M.coral, M.blue][i]); chip.scale.setScalar(0.45); chip.castShadow = true;
      const l = K.label(w, { font: F, weight: 600, px: 52, color: '#3a2a2a', height: 0.32, align: 'left' });
      l.position.set(0.32 + l.userData.w / 2, 0.12, 0); l.rotation.x = -Math.PI / 2 + 0.6;
      g.add(chip, l); g.position.set([-5.3, -2.5, 0.2][i], 0.03, 2.5); scene.add(g); return g;
    });

    // title: clay-coloured sign on the backdrop, one for each beat
    const titles = this.beats.map(b => {
      const l = K.label(b.label, { font: F, weight: 700, px: 96, color: '#ffffff', stroke: '#2f5f5b', strokeWidth: 10, height: 0.62 });
      l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.55, -8); S.camera.add(l); return l;
    });

    // props: piggy bank, a growing plant, crumbs, a snail that crosses the table as the years pass
    const pig = new T.Group(); scene.add(pig);
    pig.add(blob(new T.SphereGeometry(0.75, 28, 18), M.pink, 200, 0.04, 2));
    const snout = blob(new T.CylinderGeometry(0.22, 0.24, 0.22, 18), M.pink, 201, 0.02, 0); snout.rotation.z = Math.PI / 2; snout.position.set(0.78, 0, 0); pig.add(snout);
    [[-0.3, 0.6], [0.2, 0.62]].forEach(([x, z], i) => { const e = blob(new T.ConeGeometry(0.16, 0.3, 10), M.pink, 202 + i, 0.02, 0); e.position.set(0.35, 0.62, x * 0.9); e.rotation.z = -0.4; pig.add(e); });
    [[0.35, 0.35], [0.35, -0.35], [-0.35, 0.35], [-0.35, -0.35]].forEach(([x, z], i) => { const l = blob(new T.CylinderGeometry(0.13, 0.14, 0.35, 12), M.pink, 210 + i, 0.02, 0); l.position.set(x, -0.62, z); pig.add(l); });
    [0.24, -0.24].forEach(z => { const e = new T.Mesh(new T.SphereGeometry(0.06, 10, 8), M.dark); e.position.set(0.66, 0.25, z); pig.add(e); });
    const slot = new T.Mesh(new T.BoxGeometry(0.4, 0.05, 0.08), M.dark); slot.position.set(-0.05, 0.75, 0); pig.add(slot);
    pig.scale.setScalar(0.9); pig.position.set(-5.0, 0.86, -0.7); pig.rotation.y = -0.5;
    const pot = blob(new T.CylinderGeometry(0.5, 0.36, 0.7, 20), M.coral, 220, 0.03, 1); pot.position.set(5.0, 0.35, -0.6); scene.add(pot);
    const stem = new T.Mesh(new T.CylinderGeometry(0.05, 0.06, 1, 8), M.green); stem.geometry.translate(0, 0.5, 0); stem.position.set(5.0, 0.68, -0.6); scene.add(stem);
    const leaves = Array.from({ length: 6 }, (_, i) => { const l = blob(new T.SphereGeometry(0.28, 14, 10), M.green, 230 + i, 0.02, 0); l.scale.set(1, 0.35, 0.6); scene.add(l); return l; });
    const crR = K.rng(14);
    for (let i = 0; i < 22; i++) { const c = blob(new T.SphereGeometry(crR.range(0.04, 0.09), 8, 6), crR.pick([M.yellow, M.coral, M.blue, M.green, M.pink]), 300 + i, 0.02, 0); c.position.set(crR.range(-7, 7), 0.04, crR.range(0.9, 3.2)); c.scale.y = 0.6; scene.add(c); }
    const snail = new T.Group(); scene.add(snail);
    const shell = new T.Mesh(lump(new T.TorusGeometry(0.22, 0.13, 12, 24), 240, 0.02, 0), M.yellow); shell.position.y = 0.32; shell.castShadow = true;
    const body = blob(new T.CapsuleGeometry(0.11, 0.55, 6, 12), M.green, 241, 0.015, 0); body.rotation.z = Math.PI / 2; body.position.y = 0.1;
    snail.add(shell, body); snail.scale.setScalar(0.9);

    const cam = K.camPath([
      { t: 0, pos: [-2.4, 3.3, 7.8], look: [-2.9, 0.9, 0] },
      { t: 2.5, pos: [-1.5, 4.3, 9.4], look: [-1.8, 1.2, 0] },
      { t: 5, pos: [-0.3, 5.5, 11.2], look: [-0.5, 1.5, 0] },
      { t: 7.5, pos: [0.6, 6.3, 12.4], look: [0, 1.75, 0] },
      { t: 10, pos: [0.9, 6.4, 12.2], look: [0.1, 1.85, 0] },
    ], S.camera);

    return (t0, realT) => {
      const t = Math.floor(t0 * 12) / 12, step = Math.floor(t0 * 12), boil = K.rng(step * 13 + 1);
      cam(t);
      stacks.forEach(s => {
        let n = 0;
        s.meshes.forEach((m, k) => {
          const u = m.userData, p = K.prog(t, u.t0, u.t0 + 0.34);
          m.visible = t >= u.t0 || s.c === 0;
          if (s.c === 0) { m.position.set(u.dx, u.y, u.dz); m.scale.set(1, 1, 1); }
          else {
            const drop = 1 - K.ease.out(K.prog(t, u.t0, u.t0 + 0.2)), sq = K.prog(t, u.t0 + 0.17, u.t0 + 0.34);
            m.position.set(u.dx, u.y + drop * 1.4, u.dz);
            const squash = sq > 0 && sq < 1 ? 1 - 0.35 * Math.sin(sq * Math.PI) : 1;
            m.scale.set(1 + (1 - squash) * 0.5, p > 0 ? squash : 1, 1 + (1 - squash) * 0.5);
          }
          m.rotation.set(u.tilt + boil.range(-0.01, 0.01), u.rot, u.tilt * 0.5);
          if (m.visible) n++;
        });
        // blue coins pulse in beat 3: interest on interest
        const pulse = K.prog(t, B[2], B[2] + 0.4) * (1 - K.prog(t, B[2] + 2.0, B[2] + 2.5));
        M.blue.emissive.set('#3b7dd8'); M.blue.emissiveIntensity = 0.35 * pulse;
        const done = s.c === 0 || t > START[s.c] + SPAN[s.c] + 0.3;
        s.top.visible = done; s.top.scale.setScalar(done ? K.prog(t, START[s.c] + SPAN[s.c] + 0.3, START[s.c] + SPAN[s.c] + 0.6, 'back') + (s.c === 0 ? 1 : 0) : 0.001);
        if (s.c === 0) s.top.scale.setScalar(1);
        s.top.lookAt(S.camera.position);
        s.yl.material.opacity = s.c === 0 ? 1 : K.prog(t, START[s.c] - 0.3, START[s.c]);
      });
      // arrow grows along the tops in beat 4
      const ap = K.prog(t, B[3] + 0.9, B[3] + 1.9, 'inOut');
      arrow.visible = head.visible = ap > 0;
      arrowGeo.setDrawRange(0, Math.floor(ap * arrowGeo.index.count / 6) * 6);
      const hp = arrowCurve.getPointAt(Math.max(ap, 0.001)), ht = arrowCurve.getTangentAt(Math.max(ap, 0.001));
      head.position.copy(hp); head.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), ht);
      legend.forEach((g, i) => { const p = K.prog(t, [0.3, B[1] + 0.3, B[2] + 0.3][i], [0.3, B[1] + 0.3, B[2] + 0.3][i] + 0.35, 'back'); g.scale.setScalar(Math.max(p, 0.001)); g.visible = p > 0; });
      titles.forEach((l, i) => {
        const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1]));
        l.material.opacity = a; l.visible = a > 0.01; l.position.y = 1.55 + (1 - a) * 0.15;
      });
      // props
      pig.position.y = 0.86 + 0 * (K.prog(t, B[0] + 0.1, B[0] + 0.3) * (1 - K.prog(t, B[0] + 0.3, B[0] + 0.5))) * 0.25;
      pig.rotation.z = 0.04 * Math.sin(step * 0.9);
      const grow = 0.35 + 0.65 * K.prog(t, 0, 9.5);
      stem.scale.set(1, grow * 1.5, 1);
      leaves.forEach((l, i) => { const y = 0.68 + grow * 1.5 * (0.35 + i * 0.12), s = K.prog(t, i * 1.4, i * 1.4 + 0.5, 'back');
        l.position.set(5.0 + (i % 2 ? 0.25 : -0.25), y, -0.6); l.rotation.z = i % 2 ? -0.5 : 0.5; l.scale.set(Math.max(s, 0.001), 0.35 * Math.max(s, 0.001), 0.6 * Math.max(s, 0.001)); });
      snail.position.set(K.lerp(-4.6, 4.4, K.prog(t, 0, 10)), 0, 1.45 + 0.05 * Math.sin(step * 0.7));
      body.scale.set(1, 1 + 0.08 * Math.sin(step * 1.7), 1);
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.08 });
    const START = [0, B[1] + 0.2, B[2] + 0.1, B[2] + 1.2, B[3] + 0.1], SPAN = [0.01, 1.8, 1.0, 1.15, 1.6];
    this.years.forEach((yr, c) => {
      if (!c) return;
      const n = Math.round(yr.total / 25);
      for (let i = 0; i < n; i += 2) k.play('pop', { t: START[c] + (i / n) * SPAN[c] + 0.17, gain: 0.25, pitch: 0.55 + (i / n) * 0.5, pan: (c - 2) * 0.25 });
      k.play('pluck', { t: START[c] + SPAN[c] + 0.3, gain: 0.3, pitch: 1 + c * 0.12, music: true });
    });
    k.play('thud', { t: 0.15, gain: 0.4, pitch: 0.9 });
    k.play('pop', { t: 0.35, gain: 0.35, pitch: 1.1 });
    k.play('wood', { t: B[1] + 0.3, gain: 0.3 });
    k.play('chime', { t: B[2] + 0.1, gain: 0.25, pitch: 0.8, music: true });
    k.play('swish', { t: B[3] + 0.9, gain: 0.3, dur: 1.5 });
    k.play('sparkle', { t: B[3] + 1.9, gain: 0.3 });
  },
  post: null,
};
