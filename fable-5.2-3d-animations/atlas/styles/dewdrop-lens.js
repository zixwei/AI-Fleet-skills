window.STYLES = window.STYLES || {};
STYLES['dewdrop-lens'] = {
  id: 'dewdrop-lens', name: 'Dewdrop Lens',
  family: 'Strange worlds',
  use: 'Story',
  look: 'The camera is at the height of an insect, in wet grass at sunrise. Drops of dew hang on a curved blade of grass, and each drop holds a small, upside-down picture of one part of the story. The background melts into warm blur.',
  motion: 'The focus moves from drop to drop along the blade. Inside each drop a tiny scene plays: water creeping into roots, rising through tubes, leaving a leaf, pulling the next water up.',
  shownHere: 'How a plant drinks, from root to leaf: roots take water from the soil; it climbs through thin tubes in the stem; leaves let water vapour out through tiny pores; that loss pulls the water column up behind it, all the way from the root.',
  goodFor: 'Small worlds and close looks: biology, nature, details inside details, quiet morning stories.',
  fonts: ['Cormorant Garamond:wght@600;700'],
  duration: 12,
  samples: 6,
  dof: { aperture: 0.06 },
  // CONTENT
  beats: [
    { t: 0.0, label: 'Roots take water from the soil' },
    { t: 2.4, label: 'It climbs through thin tubes in the stem' },
    { t: 4.8, label: 'Leaves let vapour out through tiny pores' },
    { t: 7.2, label: 'That loss pulls the water up behind it' },
    { t: 9.6, label: 'From root to leaf, one long pull' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Cormorant Garamond', BE = this.beats;
    scene.background = new T.Color('#f0c890'); scene.fog = new T.Fog('#f0c890', 6, 22); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#ffe8c8', '#4a6a2a', 1.0)); const sun = new T.DirectionalLight('#ffd8a0', 2.2); sun.position.set(-6, 3, -8); scene.add(sun);
    const rr = K.rng(95);
    // four tiny scenes, each rendered into its own picture
    const mini = (bg) => { const sc = new T.Scene(); sc.background = new T.Color(bg); const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 10); cam.position.z = 5; const rt = S.own(new T.WebGLRenderTarget(256, 256)); return { sc, cam, rt }; };
    const flat = c => new T.MeshBasicMaterial({ color: c });
    const disc = (r, c) => new T.Mesh(new T.CircleGeometry(r, 16), flat(c));
    const M = [mini('#5a3a20'), mini('#3a7a3a'), mini('#4aa04a'), mini('#cfe8f8')];
    // A: roots in soil with water dots moving in
    const rootPts = [[0, 1.0], [0, 0.3], [-0.3, -0.2], [-0.6, -0.8]].map(([x, y]) => new T.Vector3(x, y, 0)); const r2 = [[0, 0.3], [0.35, -0.3], [0.5, -0.9]].map(([x, y]) => new T.Vector3(x, y, 0));
    [rootPts, r2].forEach(p => M[0].sc.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(p), 20, 0.06, 6), flat('#e8d8b0'))));
    const dotsA = Array.from({ length: 14 }, () => { const d = disc(0.04, '#5ac0ff'); M[0].sc.add(d); return { d, a: rr() * 6.28, ph: rr() }; });
    // B: stem tubes with water rising
    for (let i = -3; i <= 3; i++) { const t = new T.Mesh(new T.PlaneGeometry(0.16, 2.2), flat('#2a5a2a')); t.position.x = i * 0.26; M[1].sc.add(t); }
    const dotsB = Array.from({ length: 28 }, (_, i) => { const d = disc(0.045, '#5ac0ff'); M[1].sc.add(d); return { d, x: (i % 7 - 3) * 0.26, ph: rr() }; });
    // C: a leaf surface with pores; vapour puffs leave them
    const pores = [[-0.5, 0.3], [0.2, 0.5], [0.5, -0.2], [-0.2, -0.4], [0, 0]].map(([x, y]) => { const p = new T.Mesh(new T.CircleGeometry(0.1, 16), flat('#1a4a1a')); p.scale.y = 0.55; p.position.set(x, y, 0); M[2].sc.add(p); return [x, y]; });
    const puffs = Array.from({ length: 15 }, (_, i) => { const d = disc(0.07, '#e8f4ff'); d.material.transparent = true; M[2].sc.add(d); return { d, p: pores[i % 5], ph: rr() }; });
    // D: a chain of water molecules pulled upward
    const chain = Array.from({ length: 9 }, (_, i) => { const g = new T.Group(); const o = disc(0.12, '#e04a3a'); const h1 = disc(0.06, '#ffffff'); h1.position.set(0.11, 0.08, 0.01); const h2 = disc(0.06, '#ffffff'); h2.position.set(-0.11, 0.08, 0.01); g.add(o, h1, h2); M[3].sc.add(g); return g; });
    // the grass blade and its drops
    const bladePts = [[-2.4, -1.4, 0], [-1.6, -0.6, -0.1], [-0.5, 0.2, -0.2], [0.8, 0.7, -0.1], [2.2, 0.8, 0.1], [3.2, 0.5, 0.3]].map(p => new T.Vector3(...p));
    const blade = new T.CatmullRomCurve3(bladePts); const bladeMesh = new T.Mesh(new T.TubeGeometry(blade, 80, 0.07, 8), new T.MeshStandardMaterial({ color: '#5a9a3a', roughness: 0.5 })); bladeMesh.scale.set(1, 1, 1); scene.add(bladeMesh);
    for (let i = 0; i < 40; i++) { const pts = []; const x = rr.range(-8, 8), z = rr.range(-12, -2), h = rr.range(1.5, 4); for (let k = 0; k < 5; k++) pts.push(new T.Vector3(x + k * 0.15 * Math.sin(i), -2 + k / 4 * h, z + k * 0.1)); scene.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 10, 0.05, 5), new T.MeshStandardMaterial({ color: '#4a8a3a', roughness: 0.6 }))); }
    const dropMat = rt => new T.ShaderMaterial({ uniforms: { tMap: { value: rt.texture } },
      vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader: `uniform sampler2D tMap; varying vec3 vN; varying vec3 vV;
        void main(){ vec2 uv = 0.5 - vN.xy * 0.42; vec3 img = texture2D(tMap, uv).rgb; float fr = pow(1.0 - max(dot(vN, vV), 0.0), 2.5);
          vec3 c = mix(img * 1.1, vec3(1.0, 0.95, 0.85), fr * 0.7); float spec = pow(max(dot(reflect(-normalize(vec3(-0.5, 0.6, 0.6)), vN), vV), 0.0), 60.0); c += spec * 1.5; gl_FragColor = vec4(c, 1.0); }` });
    const us = [0.18, 0.4, 0.62, 0.84];
    const drops = M.map((m, i) => { const p = blade.getPointAt(us[i]); const d = new T.Mesh(new T.SphereGeometry(0.34, 48, 32), dropMat(m.rt)); d.position.copy(p).add(new T.Vector3(0, -0.36, 0.04)); d.scale.set(1, 1.1, 1); scene.add(d); return d; });
    for (let i = 0; i < 10; i++) { const p = blade.getPointAt(rr()); const d = new T.Mesh(new T.SphereGeometry(rr.range(0.05, 0.12), 16, 12), new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.6 })); d.position.copy(p).add(new T.Vector3(0, -0.08, 0.05)); scene.add(d); }
    const sunDisc = new T.Mesh(new T.CircleGeometry(1.4, 32), new T.MeshBasicMaterial({ color: '#fff4d0', fog: false })); sunDisc.position.set(-8, 2.5, -20); scene.add(sunDisc);
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 70, color: '#3a2410', bg: 'rgba(255,244,224,0.88)', radius: 12, pad: 0.35, height: 0.4 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const look = new T.Vector3(), P = new T.Vector3();
    return (t, realT) => {
      // focus moves from drop to drop; at the end, step back to see the blade
      let k = 0; for (let i = 1; i < B.length; i++) if (t >= B[i]) k = i;
      const u = k ? K.prog(t, B[k], B[k] + 1.0, 'inOut') : 1, a = drops[Math.min(3, Math.max(0, k - 1))].position, b = drops[Math.min(3, k)].position;
      look.lerpVectors(a, b, u); const back = K.prog(t, B[4], B[4] + 1.8, 'inOut');
      P.copy(look).add(new T.Vector3(0.3, 0.15, 2.2)); P.lerp(new T.Vector3(0.6, 0.6, 7.5), back); look.lerp(new T.Vector3(0.4, -0.1, 0), back);
      S.camera.position.copy(P); S.camera.lookAt(look); S.camera.userData.look = look.clone();
      // the tiny scenes
      dotsA.forEach((d, i) => { const f = (realT * 0.25 + d.ph) % 1, src = new T.Vector2(Math.cos(d.a) * 0.9, Math.sin(d.a) * 0.9 - 0.2); d.d.position.set(K.lerp(src.x, 0, f), K.lerp(src.y, 0.2, f), 0.02); });
      dotsB.forEach(d => { d.d.position.set(d.x, -1.1 + ((realT * 0.4 + d.ph * 2.2) % 2.2), 0.02); });
      puffs.forEach(p => { const f = (realT * 0.35 + p.ph) % 1; p.d.position.set(p.p[0] + 0.1 * Math.sin(f * 6), p.p[1] + f * 0.6, 0.02); p.d.scale.setScalar(0.6 + f); p.d.material.opacity = 1 - f; });
      chain.forEach((g, i) => { g.position.set(0.15 * Math.sin(i * 0.9 + realT), -1.0 + i * 0.26 + ((realT * 0.3) % 0.26), 0.02); g.rotation.z = Math.sin(i + realT) * 0.4; });
      M.forEach(m => { S.renderer.setRenderTarget(m.rt); S.renderer.render(m.sc, m.cam); }); S.renderer.setRenderTarget(null);
      drops.forEach((d, i) => { d.scale.set(1 + 0.02 * Math.sin(realT * 2 + i), 1.1 - 0.02 * Math.sin(realT * 2 + i), 1); });
      titles.forEach((l, i) => { const a2 = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a2 > 0.01; l.material.opacity = a2; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.04 }); k.bed('night', { gain: 0.02 });
    k.play('drop', { t: 0.4, gain: 0.15, pitch: 1.2 }); k.play('pluck', { t: 0.6, gain: 0.1, pitch: 1.0, music: true });
    [1, 2, 3].forEach((bi, i) => { k.play('swish', { t: B[bi] + 0.1, gain: 0.1, pitch: 1.4, dur: 0.9 }); k.play('drop', { t: B[bi] + 1.0, gain: 0.15, pitch: 1.3 + i * 0.15 }); k.play('pluck', { t: B[bi] + 1.1, gain: 0.1, pitch: [1.12, 1.26, 1.5][i], music: true }); });
    k.play('bubble', { t: B[2] + 1.6, gain: 0.1, pitch: 1.6 });
    k.play('whoosh', { t: B[4] + 0.1, gain: 0.12, pitch: 0.6, dur: 1.6 }); k.play('chime', { t: B[4] + 1.6, gain: 0.12, pitch: 1.0, music: true });
  },
  post: null,
};
