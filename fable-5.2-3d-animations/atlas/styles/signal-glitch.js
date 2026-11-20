window.STYLES = window.STYLES || {};
STYLES['signal-glitch'] = {
  id: 'signal-glitch', name: 'Signal Glitch',
  family: 'Strange worlds',
  use: 'Explainer',
  look: 'A clean, simple picture of a house on a hill under a bright sky, shown as a grid of blocks. When it breaks, scan lines slide sideways, the colour channels pull apart and blocks repeat. Repaired blocks carry a small green check mark.',
  motion: 'The picture breaks all at once on a beat, then mends itself one block at a time; each repaired block flashes a check mark. The damage is the subject, so it is shown clearly and then removed.',
  shownHere: 'How error correction repairs a file: the file is sent as blocks; noise flips some bits and breaks some blocks; each block carries a check value, so the broken ones are found; extra repair data rebuilds them one by one; the file is whole again.',
  goodFor: 'Errors and recovery: data integrity, resilience, debugging, healing, quality control. Any "it broke, then it got fixed" explanation.',
  fonts: ['JetBrains Mono:wght@500;700'],
  duration: 12,
  samples: 1,
  // CONTENT
  beats: [
    { t: 0.0, label: 'A file is sent as blocks of data' },
    { t: 2.4, label: 'Noise flips bits: some blocks break' },
    { t: 4.8, label: 'Check values find the broken blocks' },
    { t: 7.2, label: 'Repair data rebuilds them one by one' },
    { t: 9.6, label: 'The file is whole again' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'JetBrains Mono', BE = this.beats;
    scene.background = new T.Color('#8cc8f0'); scene.add(S.camera);
    K.lights(S, 'sun', { size: 10 });
    const std = (c, r = 0.8, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r, flatShading: true }, o));
    // the clean picture: hills, a house, a tree, a sun and clouds
    const hill = (x, z, s, c) => { const m = new T.Mesh(new T.SphereGeometry(s, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), std(c)); m.position.set(x, -0.5, z); m.scale.y = 0.45; m.receiveShadow = true; scene.add(m); };
    hill(-4, -6, 7, '#6aaa4a'); hill(5, -9, 9, '#5a9a3a'); hill(0, -2, 6, '#7ab85a');
    const ground = new T.Mesh(new T.PlaneGeometry(60, 30), std('#7ab85a')); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.5; ground.receiveShadow = true; scene.add(ground);
    const house = new T.Group(); { const b = new T.Mesh(new T.BoxGeometry(2.2, 1.6, 1.8), std('#f4e8d0')); b.position.y = 0.8; const r = new T.Mesh(new T.ConeGeometry(1.8, 1.2, 4), std('#d84a3a')); r.position.y = 2.2; r.rotation.y = Math.PI / 4; const d = new T.Mesh(new T.BoxGeometry(0.5, 0.9, 0.05), std('#6a3a20')); d.position.set(0, 0.45, 0.92); const w = new T.Mesh(new T.BoxGeometry(0.5, 0.5, 0.05), std('#8ad0ff')); w.position.set(-0.6, 1.0, 0.92); const w2 = w.clone(); w2.position.x = 0.6; house.add(b, r, d, w, w2); } house.position.set(0.4, 2.0, -1.0); house.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(house);
    const tree = new T.Group(); { const tr = new T.Mesh(new T.CylinderGeometry(0.15, 0.2, 1.2, 8), std('#6a4a2a')); tr.position.y = 0.6; const c = new T.Mesh(new T.IcosahedronGeometry(0.9, 0), std('#2a7a3a')); c.position.y = 1.7; tree.add(tr, c); } tree.position.set(-2.4, 1.6, -0.5); tree.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(tree);
    const sunD = new T.Mesh(new T.CircleGeometry(1.0, 32), new T.MeshBasicMaterial({ color: '#fff0a0' })); sunD.position.set(5, 6.5, -12); scene.add(sunD);
    [[-5, 5.5, -10], [1.5, 6.2, -12], [-1, 4.8, -9]].forEach(([x, y, z]) => { const g = new T.Group(); [[0, 0, 0.7], [0.7, 0.1, 0.55], [-0.7, 0.05, 0.5]].forEach(([dx, dy, r]) => { const m = new T.Mesh(new T.SphereGeometry(r, 12, 8), std('#ffffff', 1)); m.position.set(dx, dy, 0); g.add(m); }); g.position.set(x, y, z); scene.add(g); });
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 58, color: '#ffffff', bg: 'rgba(10,14,24,0.85)', radius: 8, pad: 0.35, height: 0.34 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([{ t: 0, pos: [0.4, 3.0, 11.0], look: [0, 2.4, -2] }, { t: 12, pos: [0.8, 3.1, 10.4], look: [0.1, 2.4, -2] }], S.camera);
    const post = this.post;
    return (t, realT) => {
      cam(t);
      const u = post.uniforms;
      u.uGlitch.value = K.prog(t, B[1], B[1] + 0.15) * (1 - 0.3 * K.prog(t, B[2], B[3]));
      u.uRepair.value = K.prog(t, B[3] + 0.1, B[4] + 0.3);
      u.uMarks.value = K.prog(t, B[2] + 0.2, B[2] + 0.6) * (1 - K.prog(t, B[4] + 1.0, B[4] + 1.8));
      u.uGrid.value = (1 - K.prog(t, B[4] + 0.6, B[4] + 1.6)) * (0.35 + 0.65 * K.prog(t, 0, 0.6));
      u.uTick.value = Math.floor(realT * 12);
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('machine', { gain: 0.03 });
    k.play('blip', { t: 0.3, gain: 0.12, pitch: 1.2 }); k.play('blip', { t: 0.5, gain: 0.12, pitch: 1.5 });
    k.play('zap', { t: B[1], gain: 0.4, pitch: 0.7 }); for (let i = 0; i < 10; i++) k.play('tick', { t: B[1] + 0.05 + i * 0.07, gain: 0.15, pitch: 2.5 + (i % 3) * 0.4 }); k.play('rumble', { t: B[1] + 0.1, gain: 0.15, pitch: 1.2, dur: 1.2 });
    for (let i = 0; i < 6; i++) k.play('blip', { t: B[2] + 0.3 + i * 0.12, gain: 0.12, pitch: 0.8 });
    for (let i = 0; i < 16; i++) k.play('click', { t: B[3] + 0.2 + i * 0.16, gain: 0.15, pitch: 1.4 + (i % 4) * 0.08 });
    k.play('chime', { t: B[4] + 0.4, gain: 0.18, pitch: 1.0, music: true }); k.play('sparkle', { t: B[4] + 0.5, gain: 0.2 });
  },
  // the damage and the repair, block by block; the title band at the top stays clean
  post: {
    uniforms: { uGlitch: { value: 0 }, uRepair: { value: 0 }, uMarks: { value: 0 }, uGrid: { value: 0 }, uTick: { value: 0 } },
    fragment: `
      uniform float uGlitch, uRepair, uMarks, uGrid, uTick;
      float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float seg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float hh = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * hh); }
      vec4 postFX(vec2 uv){
        if (uv.y > 0.86) return texture2D(tColor, uv);
        vec2 G = vec2(12.0, 7.0), id = floor(uv * G), f = fract(uv * G);
        float broken = step(h1(id + 3.1), 0.42), rank = h1(id + 7.7), repaired = step(rank * 0.95 + 0.02, uRepair);
        float bad = broken * (1.0 - repaired) * uGlitch;
        vec2 q = uv;
        if (bad > 0.0) {
          float row = floor(uv.y * 160.0); q.x += (h1(vec2(row, uTick)) - 0.5) * 0.06 * bad;
          if (h1(id + vec2(uTick * 0.0, 9.3)) < 0.35) q.x -= 1.0 / G.x;
        }
        vec3 c; float sp = 0.008 * bad;
        c.r = texture2D(tColor, q + vec2(sp, 0.0)).r; c.g = texture2D(tColor, q).g; c.b = texture2D(tColor, q - vec2(sp, 0.0)).b;
        if (bad > 0.0) { c = mix(c, vec3(h1(uv * 900.0 + uTick)), 0.12 * bad); c *= 0.85 + 0.3 * step(0.5, h1(vec2(floor(uv.y * 160.0), uTick + 2.0))); }
        // grid lines between blocks
        float gl = max(smoothstep(0.985, 1.0, f.x) + smoothstep(0.015, 0.0, f.x), smoothstep(0.98, 1.0, f.y) + smoothstep(0.02, 0.0, f.y));
        c = mix(c, vec3(1.0), gl * 0.35 * uGrid);
        // marks: a red cross on each broken block, a green check when it is rebuilt (shown for a short time)
        vec2 m = f - vec2(0.8, 0.78);
        if (broken > 0.5 && uMarks > 0.0) {
          if (repaired < 0.5) { float d = min(seg(m, vec2(-0.08, -0.08), vec2(0.08, 0.08)), seg(m, vec2(-0.08, 0.08), vec2(0.08, -0.08))); c = mix(c, vec3(2.2, 0.2, 0.2), smoothstep(0.03, 0.015, d) * uMarks); }
          else { float age = uRepair - (rank * 0.95 + 0.02); float vis = smoothstep(0.0, 0.02, age) * (1.0 - smoothstep(0.25, 0.4, age)); float d = min(seg(m, vec2(-0.09, 0.0), vec2(-0.02, -0.08)), seg(m, vec2(-0.02, -0.08), vec2(0.1, 0.1)));
            c = mix(c, vec3(0.2, 2.0, 0.6), smoothstep(0.035, 0.018, d) * vis * uMarks); c = mix(c, c * 1.25, vis * 0.4); }
        }
        return vec4(c, 1.0);
      }`,
  },
};
