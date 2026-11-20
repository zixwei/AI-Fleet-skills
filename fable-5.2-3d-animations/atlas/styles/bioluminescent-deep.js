window.STYLES = window.STYLES || {};
STYLES['bioluminescent-deep'] = {
  id: 'bioluminescent-deep', name: 'Bioluminescent Deep',
  family: 'Living and elemental',
  use: 'Story',
  look: 'Black deep water. Each idea is a glowing creature: jellies with thin translucent bells, comb jellies with rainbow rows, a lure light on a dark fish. Marine snow drifts past, and a depth gauge is the only label.',
  motion: 'The camera sinks slowly. A creature lights up and sends a pulse of light along a thread to its neighbours, which light in turn; the light spreads through the dark in waves.',
  shownHere: 'How information spreads in a network: one node lights up, it signals its neighbours, each passes it on, and soon the whole network is lit.',
  goodFor: 'Networks, contagion, word of mouth, signals in the body or the brain: one starts, many follow.',
  fonts: ['Space Mono:wght@400;700'],
  duration: 11,
  samples: 4,
  // CONTENT: depth markers for each beat (metres)
  beats: [
    { t: 0.0, label: 'One lights up', depth: 200 },
    { t: 2.7, label: 'It signals its neighbours', depth: 400 },
    { t: 5.4, label: 'Each one passes it on', depth: 700 },
    { t: 8.1, label: 'The whole deep is lit', depth: 1000 },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Space Mono';
    scene.background = new T.Color('#010307'); scene.fog = new T.FogExp2('#010409', 0.045); scene.add(S.camera);
    const amb = new T.HemisphereLight('#0a2030', '#000000', 0.4); scene.add(amb);
    const glowTex = K.canvasTex(64, 64, g => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
    const rr = K.rng(11);
    // creatures along the descent
    const kinds = ['jelly', 'comb', 'lure'], cols = ['#5ff2ff', '#7affc0', '#9f7aff', '#ff7ad9', '#ffd27a'];
    const nodes = [];
    for (let i = 0; i < 16; i++) { const y = -i * 1.25 + rr.range(-0.4, 0.4); nodes.push({ p: new T.Vector3(rr.range(-4.2, 4.2), y, rr.range(-3.5, 1.0)), kind: i === 0 ? 'jelly' : rr.pick(kinds), col: new T.Color(i === 0 ? '#5ff2ff' : rr.pick(cols)), ph: rr() * 6 }); }
    // links: each node to its nearest neighbours
    const links = []; nodes.forEach((a, i) => { const near = nodes.map((b, j) => [j, a.p.distanceTo(b.p)]).filter(([j]) => j !== i).sort((x, y) => x[1] - y[1]).slice(0, 2); near.forEach(([j]) => { if (!links.some(l => (l[0] === j && l[1] === i))) links.push([i, j]); }); });
    // spread order: breadth-first from node 0
    const lvl = new Array(nodes.length).fill(99); lvl[0] = 0; for (let k = 0; k < nodes.length; k++) links.forEach(([a, b]) => { if (lvl[a] + 1 < lvl[b]) lvl[b] = lvl[a] + 1; if (lvl[b] + 1 < lvl[a]) lvl[a] = lvl[b] + 1; });
    const depthAt0 = t => { const bs = this.beats; let d = bs[0].depth; for (let i = 0; i < bs.length - 1; i++) if (t >= bs[i].t) d = K.lerp(bs[i].depth, bs[i + 1].depth, K.prog(t, bs[i].t, bs[i + 1].t, 'inOut')); return d; };
    nodes.forEach((n, i) => { if (i === 0) { n.tOn = 0.4; return; } let tt = 0.4; while (tt < 10.6 && -((depthAt0(tt) - 200) / 800) * 17.5 + 0.4 > n.p.y + 1.6) tt += 0.05; n.tOn = Math.max(1.2, tt); });
    // build each creature
    nodes.forEach((n, i) => {
      const g = new T.Group(); g.position.copy(n.p); scene.add(g); n.g = g;
      const add = new T.MeshBasicMaterial({ color: n.col, transparent: true, opacity: 0.12, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });
      n.mats = [add];
      if (n.kind === 'jelly') {
        const bell = new T.Mesh(new T.SphereGeometry(0.55, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), add); g.add(bell);
        const rim = []; for (let k = 0; k < 24; k++) { const a = k / 24 * 6.283; rim.push(new T.Vector3(0.55 * Math.cos(a), 0, 0.55 * Math.sin(a))); }
        const pts = new T.Points(new T.BufferGeometry().setFromPoints(rim), new T.PointsMaterial({ map: glowTex, color: n.col, size: 0.22, transparent: true, blending: T.AdditiveBlending, depthWrite: false })); g.add(pts); n.mats.push(pts.material);
        const tent = []; for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283, line = []; for (let s = 0; s <= 12; s++) line.push(new T.Vector3(0.4 * Math.cos(a), -s * 0.14, 0.4 * Math.sin(a))); const tg = new T.BufferGeometry().setFromPoints(line); const l = new T.Line(tg, new T.LineBasicMaterial({ color: n.col, transparent: true, opacity: 0.3, blending: T.AdditiveBlending })); g.add(l); tent.push({ l, a, base: line.map(v => v.clone()) }); n.mats.push(l.material); }
        n.tent = tent;
      } else if (n.kind === 'comb') {
        const body = new T.Mesh(new T.SphereGeometry(0.4, 24, 16), add); body.scale.set(0.8, 1.2, 0.8); g.add(body);
        const rows = []; for (let r = 0; r < 8; r++) for (let s = 0; s < 10; s++) { const a = r / 8 * 6.283, v = (s / 9 - 0.5) * 2.4; rows.push(new T.Vector3(0.33 * Math.cos(a) * Math.cos(v * 0.5), 0.48 * Math.sin(v * 0.6), 0.33 * Math.sin(a) * Math.cos(v * 0.5))); }
        const geo = new T.BufferGeometry().setFromPoints(rows); const cc = new Float32Array(rows.length * 3); rows.forEach((_, k) => { const c = new T.Color().setHSL((k % 10) / 10, 0.9, 0.6); cc[k * 3] = c.r; cc[k * 3 + 1] = c.g; cc[k * 3 + 2] = c.b; }); geo.setAttribute('color', new T.BufferAttribute(cc, 3));
        const pts = new T.Points(geo, new T.PointsMaterial({ map: glowTex, size: 0.1, vertexColors: true, transparent: true, blending: T.AdditiveBlending, depthWrite: false })); g.add(pts); n.mats.push(pts.material); n.comb = pts;
      } else {
        const body = new T.Mesh(new T.SphereGeometry(0.45, 16, 12), new T.MeshStandardMaterial({ color: '#05080c', roughness: 0.5 })); body.scale.set(1.6, 0.9, 0.7); g.add(body);
        const stalk = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0.4, 0.3, 0), new T.Vector3(0.8, 0.8, 0), new T.Vector3(1.0, 0.7, 0)]), new T.LineBasicMaterial({ color: '#1a2a30' })); g.add(stalk);
        const lure = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: n.col, transparent: true, blending: T.AdditiveBlending, depthWrite: false })); lure.position.set(1.0, 0.7, 0); lure.scale.setScalar(0.5); g.add(lure); n.mats.push(lure.material); n.lure = lure;
      }
      const halo = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: n.col, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(3.0); g.add(halo); n.halo = halo;
      const lamp = new T.PointLight(n.col, 0, 5, 1.5); g.add(lamp); n.lamp = lamp;
    });
    // threads of light between neighbours, and the pulse that runs along them
    const linkObjs = links.map(([a, b]) => { const A = nodes[a], Bn = nodes[b], first = A.tOn <= Bn.tOn ? A : Bn, second = first === A ? Bn : A; const geo = new T.BufferGeometry().setFromPoints([first.p, second.p]); const l = new T.Line(geo, new T.LineBasicMaterial({ color: first.col, transparent: true, opacity: 0, blending: T.AdditiveBlending })); scene.add(l); const pulse = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#ffffff', transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false })); pulse.scale.setScalar(0.5); scene.add(pulse); return { l, pulse, first, second }; });
    // marine snow
    const NS = 700, sg = new T.BufferGeometry(), sp = new Float32Array(NS * 3), s0 = Array.from({ length: NS }, () => [rr.range(-9, 9), rr.range(-26, 6), rr.range(-8, 4), rr() * 6]); sg.setAttribute('position', new T.BufferAttribute(sp, 3));
    scene.add(new T.Points(sg, new T.PointsMaterial({ map: glowTex, color: '#9fb8c8', size: 0.06, transparent: true, opacity: 0.6, depthWrite: false })));
    // the depth gauge: a bar on the left with the beat labels at their depths
    const gauge = new T.Group(); gauge.position.set(-3.75, -0.2, -8); S.camera.add(gauge);
    const barH = 3.4, depthMax = 1100, dToY = d => barH / 2 - (d / depthMax) * barH;
    const bar = new T.Mesh(new T.PlaneGeometry(0.04, barH), new T.MeshBasicMaterial({ color: '#4fdcff', transparent: true, opacity: 0.6, depthTest: false })); bar.renderOrder = 10; gauge.add(bar);
    for (let d = 0; d <= 1000; d += 100) { const tk = new T.Mesh(new T.PlaneGeometry(d % 500 ? 0.12 : 0.25, 0.015), bar.material); tk.position.set(0.06, dToY(d), 0); tk.renderOrder = 10; gauge.add(tk); }
    const marks = this.beats.map(b => { const l = K.label(`${b.depth} m  ${b.label}`, { font: F, weight: 700, px: 52, color: '#bff4ff', height: 0.17, align: 'left' }); l.material.depthTest = false; l.renderOrder = 11; l.position.set(0.32 + l.userData.w / 2, dToY(b.depth), 0); gauge.add(l); return l; });
    const pointer = new T.Mesh(new T.ConeGeometry(0.08, 0.2, 3), new T.MeshBasicMaterial({ color: '#ffffff', depthTest: false })); pointer.rotation.z = -Math.PI / 2; pointer.renderOrder = 12; gauge.add(pointer);
    const depthAt = t => { let d = this.beats[0].depth; for (let i = 0; i < this.beats.length - 1; i++) if (t >= B[i]) d = K.lerp(this.beats[i].depth, this.beats[i + 1].depth, K.prog(t, B[i], B[i + 1], 'inOut')); return d; };
    const look = new T.Vector3();
    return (t, realT) => {
      const d = depthAt(t), cy = -((d - 200) / 800) * 17.5;
      S.camera.position.set(1.5 * Math.sin(t * 0.25), cy + 1.0, 8.5); look.set(0, cy - 0.6, -1); S.camera.lookAt(look); S.camera.userData.look = look;
      pointer.position.set(-0.12, dToY(d), 0);
      marks.forEach((m, i) => { m.material.opacity = t >= B[i] - 0.1 ? 1 : 0.3; });
      nodes.forEach((n, i) => {
        const on = K.prog(t, n.tOn, n.tOn + 0.5, 'out'), fl = 0.85 + 0.15 * Math.sin(realT * 3 + n.ph);
        n.mats.forEach(m => { m.opacity = (0.28 + 0.72 * on) * (m.isPointsMaterial ? 1 : m.isSpriteMaterial ? 1 : 0.35) * fl; });
        n.halo.material.opacity = 0.5 * on * fl; n.lamp.intensity = 4 * on;
        n.g.position.y = n.p.y + 0.15 * Math.sin(realT * 0.7 + n.ph); n.g.rotation.y = realT * 0.1 + n.ph;
        if (n.tent) n.tent.forEach(({ l, a, base }) => { const pa = l.geometry.attributes.position; base.forEach((v, s) => pa.setXYZ(s, v.x + 0.08 * Math.sin(realT * 1.5 + s * 0.5 + a) * s / 12, v.y, v.z + 0.08 * Math.cos(realT * 1.3 + s * 0.5 + a) * s / 12)); pa.needsUpdate = true; });
        if (n.kind === 'jelly') n.g.scale.set(1 + 0.06 * Math.sin(realT * 2 + n.ph), 1 - 0.08 * Math.sin(realT * 2 + n.ph), 1 + 0.06 * Math.sin(realT * 2 + n.ph));
      });
      linkObjs.forEach(o => { const t0 = o.first.tOn + 0.3, t1 = o.second.tOn; const u = K.prog(t, t0, Math.max(t0 + 0.2, t1)); o.l.material.opacity = 0.35 * K.prog(t, t0, t0 + 0.3); o.pulse.material.opacity = u > 0 && u < 1 ? 1 : 0; o.pulse.position.lerpVectors(o.first.g.position, o.second.g.position, u); });
      for (let i = 0; i < NS; i++) { const [x, y, z, ph] = s0[i]; sp[i * 3] = x + 0.3 * Math.sin(realT * 0.2 + ph); sp[i * 3 + 1] = y - ((realT * 0.15 + ph) % 3); sp[i * 3 + 2] = z; }
      sg.attributes.position.needsUpdate = true;
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('space', { gain: 0.12 }); k.bed('water', { gain: 0.03 });
    k.play('glass', { t: 0.4, gain: 0.25, pitch: 0.8 }); k.play('chime', { t: 0.45, gain: 0.15, pitch: 0.7, music: true });
    for (let i = 0; i < 14; i++) { const t = B[1] + 0.2 + (i / 13) * (B[3] + 0.8 - B[1]); k.play('glass', { t, gain: 0.12, pitch: 0.9 + (i % 5) * 0.15, pan: ((i * 7) % 9 - 4) * 0.15 }); k.play('bubble', { t: t + 0.05, gain: 0.08, pitch: 0.6 + (i % 3) * 0.2 }); }
    k.play('riser', { t: B[3], gain: 0.12, pitch: 0.5, dur: 2.0 });
    k.play('chime', { t: B[3] + 1.8, gain: 0.2, pitch: 0.9, music: true });
  },
  post: null,
};
