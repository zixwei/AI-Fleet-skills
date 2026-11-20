window.STYLES = window.STYLES || {};
STYLES['neon-tube'] = {
  id: 'neon-tube', name: 'Neon Tube',
  family: 'Flat content made physical',
  use: 'Explainer',
  look: 'Line drawings bent from glass tube on a painted brick wall at night: a hot bright core, a coloured glow that spills on the bricks, black standoffs that hold each tube off the wall, and script signs.',
  motion: 'Tubes flicker on one after another, in the order of the story; one tube keeps a faint buzz. Colours come on in sequence, like a sign that warms up.',
  shownHere: 'How a rainbow forms: white sunlight enters a raindrop, bends and bounces off its back, splits into colours, and millions of drops make the arc.',
  goodFor: 'Diagrams that can be drawn as lines: optics, circuits, flows, simple maps and logos. The order in which the tubes light is the order of the explanation.',
  fonts: ['Pacifico'],
  duration: 11,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Sunlight looks white' },
    { t: 2.7, label: 'A raindrop bends it and bounces it back' },
    { t: 5.4, label: 'Each colour bends a different amount' },
    { t: 8.1, label: 'Millions of drops: a rainbow' },
  ],
  signs: ['white light', 'bend + bounce', 'rainbow'],
  colours: ['#ff3b3b', '#ff8a2a', '#ffe23a', '#3dff6a', '#2ad4ff', '#4a6bff', '#b04aff'],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Pacifico';
    scene.background = new T.Color('#0a0708'); scene.add(S.camera);
    const amb = new T.HemisphereLight('#3a3040', '#000000', 0.25); scene.add(amb);
    // painted brick wall
    const brick = K.canvasTex(1024, 1024, (g, r, w, h) => {
      g.fillStyle = '#1a1214'; g.fillRect(0, 0, w, h);
      const bh = 48, bw = 128;
      for (let y = 0, row = 0; y < h; y += bh, row++) for (let x = -((row % 2) * bw / 2); x < w; x += bw) {
        g.fillStyle = `hsl(${r.range(5, 18)}, ${r.range(18, 30)}%, ${r.range(17, 25)}%)`; g.fillRect(x + 4, y + 4, bw - 8, bh - 8);
        for (let k = 0; k < 20; k++) { g.fillStyle = `rgba(0,0,0,${r.range(0.05, 0.2)})`; g.fillRect(x + 4 + r() * (bw - 8), y + 4 + r() * (bh - 8), r.range(2, 8), r.range(1, 4)); }
      }
    }, 3);
    brick.wrapS = brick.wrapT = T.RepeatWrapping; brick.repeat.set(3, 2);
    const bump = brick.clone(); bump.colorSpace = T.NoColorSpace;
    const wall = new T.Mesh(new T.PlaneGeometry(22, 12), new T.MeshStandardMaterial({ map: brick, bumpMap: bump, bumpScale: 3, roughness: 0.95 }));
    wall.position.set(0, 1, 0); wall.receiveShadow = true; scene.add(wall);
    const ground = new T.Mesh(new T.PlaneGeometry(22, 6), new T.MeshStandardMaterial({ color: '#141012', roughness: 0.4, metalness: 0.3 })); ground.rotation.x = -Math.PI / 2; ground.position.set(0, -5, 3); scene.add(ground);

    // a neon element: core, two glow layers, standoffs, a light for the wall
    const els = [];
    const standGeo = new T.CylinderGeometry(0.035, 0.035, 0.18, 8).rotateX(Math.PI / 2), standMat = new T.MeshStandardMaterial({ color: '#0b0b0b', roughness: 0.5 });
    const neon = (pts2, color, t0, closed = false, opts = {}) => {
      const curve = new T.CatmullRomCurve3(pts2.map(([x, y]) => new T.Vector3(x, y, 0.2)), closed, 'catmullrom', opts.tension ?? 0.3);
      const g = new T.Group(); scene.add(g);
      const c = new T.Color(color), coreC = c.clone().lerp(new T.Color('#ffffff'), 0.55);
      const core = new T.Mesh(new T.TubeGeometry(curve, opts.seg || 120, 0.04, 8, closed), new T.MeshBasicMaterial({ color: coreC, toneMapped: false }));
      const glow1 = new T.Mesh(new T.TubeGeometry(curve, opts.seg || 120, 0.11, 8, closed), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.35, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false }));
      const glow2 = new T.Mesh(new T.TubeGeometry(curve, opts.seg || 60, 0.32, 8, closed), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.08, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false }));
      const off = new T.Mesh(core.geometry, new T.MeshStandardMaterial({ color: '#2a2a2e', roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.6 }));
      g.add(off, core, glow1, glow2);
      const len = curve.getLength(); for (let s = 0.3; s < len; s += 1.1) { const p = curve.getPointAt(s / len); const st = new T.Mesh(standGeo, standMat); st.position.set(p.x, p.y, 0.1); g.add(st); }
      const el = { g, core, glow1, glow2, off, t0, color: c, buzz: !!opts.buzz };
      els.push(el); return el;
    };
    const lightAt = (x, y, color) => { const l = new T.PointLight(color, 0, 7, 1.6); l.position.set(x, y, 1.2); scene.add(l); return l; };
    // sun: a circle and rays
    const SC = [-5.6, 2.8];
    const circ = (cx, cy, r, n = 40) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos(i / n * 6.283), cy + r * Math.sin(i / n * 6.283)]);
    neon(circ(SC[0], SC[1], 0.85), '#ffc93b', -1, true);
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + 0.2; neon([[SC[0] + 1.15 * Math.cos(a), SC[1] + 1.15 * Math.sin(a)], [SC[0] + 1.7 * Math.cos(a), SC[1] + 1.7 * Math.sin(a)]], '#ffc93b', -1, false, { seg: 8, buzz: i === 5 }); }
    const sunL = lightAt(SC[0], SC[1], '#ffc060');
    // the white beam into the drop
    const D = [0.2, 0.4];
    neon([[SC[0] + 1.3, SC[1] - 0.5], [-2.0, 1.25], [D[0] - 0.95, D[1] + 0.65]], '#e8f0ff', 1.0, false, { tension: 0 });
    // the raindrop and the path inside it
    const drop = [];
    for (let i = 0; i <= 50; i++) { const a = -Math.PI / 2 + i / 50 * 6.283, r = 1.15; const x = D[0] + r * Math.cos(a), y = D[1] + r * Math.sin(a); drop.push([x, y + (Math.sin(a) > 0.6 ? (Math.sin(a) - 0.6) * 2.4 : 0)]); }
    neon(drop, '#4fb3ff', B[1] + 0.1, true, { seg: 160 });
    neon([[D[0] - 0.95, D[1] + 0.65], [D[0] + 1.0, D[1] + 0.3], [D[0] - 0.5, D[1] - 0.95]], '#e8f0ff', B[1] + 0.9, false, { tension: 0 });
    const dropL = lightAt(D[0], D[1], '#4fa0ff');
    // the fan of colours leaving the drop
    const exit = [D[0] - 0.5, D[1] - 0.95];
    const fans = this.colours.map((c, k) => neon([exit, [exit[0] - 3.4 - k * 0.12, exit[1] - 1.7 + k * 0.28]], c, B[2] + 0.2 + k * 0.17, false, { seg: 12, tension: 0 }));
    const fanL = lightAt(exit[0] - 2, exit[1] - 0.8, '#ff9a60');
    // the rainbow arcs, red outside
    const RC = [5.1, -1.6];
    const arcs = this.colours.map((c, k) => { const r = 3.5 - k * 0.24, pts = []; for (let i = 0; i <= 40; i++) { const a = Math.PI * 0.08 + i / 40 * Math.PI * 0.84; pts.push([RC[0] + r * Math.cos(a), RC[1] + r * Math.sin(a)]); } return neon(pts, c, B[3] + 0.15 + k * 0.2, false, { seg: 100 }); });
    const arcL = lightAt(RC[0], RC[1] + 2.4, '#ff6aa0');
    // little raindrops under the arc
    const drops = [];
    for (let i = 0; i < 9; i++) { const x = RC[0] - 2.2 + (i % 5) * 1.1 + (i > 4 ? 0.55 : 0), y = RC[1] + 0.3 + (i > 4 ? 0.8 : 0); drops.push(neon(circ(x, y, 0.12, 12).concat([[x, y + 0.3]]).slice(0, 12), '#4fb3ff', B[3] + 1.2 + i * 0.06, true, { seg: 30 })); }
    // signs in script
    const sign = (txt, x, y, color, t0, rot = -0.08) => {
      const tex = K.canvasTex(1024, 256, (g, r, w, h) => { g.font = `140px "${F}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = color; g.shadowBlur = 40; g.fillStyle = color; g.fillText(txt, w / 2, h / 2); g.shadowBlur = 0; g.fillStyle = '#ffffff'; g.globalAlpha = 0.85; g.lineWidth = 3; g.strokeStyle = '#ffffff'; g.strokeText(txt, w / 2, h / 2); });
      const m = new T.Mesh(new T.PlaneGeometry(3.2, 0.8), new T.MeshBasicMaterial({ map: tex, transparent: true, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false })); m.position.set(x, y, 0.22); m.rotation.z = rot; scene.add(m);
      const el = { g: m, core: m, glow1: m, glow2: m, off: null, t0, color: new T.Color(color), sign: true }; els.push(el); return el;
    };
    sign(this.signs[0], -3.4, 3.95, '#cfe0ff', 1.4);
    sign(this.signs[1], 0.4, 2.85, '#62c1ff', B[1] + 1.4, 0.05);
    sign(this.signs[2], RC[0], RC[1] + 4.1, '#ff6ad5', B[3] + 1.6, -0.04);
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 400, px: 84, color: '#ffffff', stroke: '#ff3fa4', strokeWidth: 6, height: 0.46 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, -1.72, -8); S.camera.add(l); return l; });

    const cam = K.camPath([
      { t: 0, pos: [-3.4, 1.8, 9.0], look: [-3.0, 1.6, 0] },
      { t: 2.7, pos: [-1.0, 1.6, 10.5], look: [-0.8, 1.2, 0] },
      { t: 5.4, pos: [-0.8, 1.0, 11.5], look: [-0.6, 0.6, 0] },
      { t: 8.1, pos: [1.4, 1.4, 13.5], look: [1.2, 1.0, 0] },
      { t: 11, pos: [0.0, 1.2, 16.6], look: [-0.1, 1.0, 0] },
    ], S.camera);
    const flick = (t, t0, seed) => { const u = t - t0; if (u < 0) return 0; if (u > 0.45) return 1; const k = Math.floor(u * 22 + seed * 7); return (k * 7919 + seed * 31) % 5 < 2 ? 0.15 : 1; };
    return (t, realT) => {
      cam(t);
      els.forEach((e, i) => {
        let a = flick(t, e.t0, i);
        if (e.buzz && a === 1) a = 0.75 + 0.25 * (Math.sin(realT * 47) > 0.6 ? 0 : 1) * (0.9 + 0.1 * Math.sin(realT * 120));
        if (e.sign) { e.g.material.opacity = a; e.g.visible = a > 0; return; }
        e.core.visible = e.glow1.visible = e.glow2.visible = a > 0;
        e.glow1.material.opacity = 0.35 * a; e.glow2.material.opacity = 0.08 * a; e.core.material.color.copy(e.color).lerp(new T.Color('#ffffff'), 0.55).multiplyScalar(0.4 + 0.6 * a);
      });
      sunL.intensity = 18 * flick(t, -1, 0); dropL.intensity = 14 * flick(t, B[1] + 0.1, 3); fanL.intensity = 12 * flick(t, B[2] + 0.2, 5); arcL.intensity = 22 * flick(t, B[3] + 0.15, 7);
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('night', { gain: 0.08 });
    k.play('hum', { t: 0.2, gain: 0.12, pitch: 1.0, dur: 10 });
    const ons = [0.2, 1.0, B[1] + 0.1, B[1] + 0.9, ...[0, 1, 2, 3, 4, 5, 6].map(k2 => B[2] + 0.2 + k2 * 0.17), ...[0, 1, 2, 3, 4, 5, 6].map(k2 => B[3] + 0.15 + k2 * 0.2)];
    ons.forEach((t, i) => { k.play('click', { t, gain: 0.25, pitch: 1.4 + (i % 3) * 0.1 }); k.play('zap', { t: t + 0.05, gain: 0.08, pitch: 2.0 + (i % 4) * 0.2 }); });
    k.play('chime', { t: B[3] + 1.7, gain: 0.25, pitch: 1.0, music: true });
  },
  post: null,
};
