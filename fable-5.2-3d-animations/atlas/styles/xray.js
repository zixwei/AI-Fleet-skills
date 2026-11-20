window.STYLES = window.STYLES || {};
STYLES['xray'] = {
  id: 'xray', name: 'X-Ray',
  family: 'Filters over 3D',
  use: 'Explainer',
  look: 'A radiograph you can walk around: the object glows like film on a dark scanner bed, brightest where the view passes through the most material. Cold blue-white, film grain, and one warm accent for the part in focus.',
  motion: 'The camera circles the object slowly as if the scanner turns. Parts in focus warm up; small particles show what moves inside.',
  shownHere: 'Why a vacuum flask keeps drinks hot: it has two walls, the space between them is a vacuum that stops conduction and convection, shiny walls reflect heat back, and the cap closes the last way out.',
  goodFor: 'What is inside things: products, bodies, buildings, machines. Show the hidden structure, then light the part that matters.',
  fonts: ['Space Mono:wght@400;700'],
  duration: 11,
  samples: 1,
  // CONTENT
  beats: [
    { t: 0.0, label: 'A flask has two walls' },
    { t: 2.7, label: 'Between them: a vacuum' },
    { t: 5.4, label: 'Shiny walls reflect heat back' },
    { t: 8.1, label: 'The cap closes the last way out' },
  ],
  tags: ['no air: no conduction, no convection', 'radiation reflected', 'still hot after 12 h'],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Space Mono';
    scene.background = new T.Color('#02060a'); scene.add(S.camera);
    // x-ray material: brighter at grazing angles, additive, both sides
    const xmat = (col, k = 0.4) => new T.ShaderMaterial({ uniforms: { c: { value: new T.Color(col) }, k: { value: k } }, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
      vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 c; uniform float k; varying vec3 vN; varying vec3 vV; void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(c * (0.035 + pow(f, 2.2)) * k, 1.0); }' });
    const BLUE = '#9fd4ff', AMB = '#ffb050';
    const V2 = a => a.map(([x, y]) => new T.Vector2(x, y));
    const flask = new T.Group(); flask.position.y = 0.3; scene.add(flask);
    const outerM = xmat(BLUE, 0.55), innerM = xmat(BLUE, 0.55), gapM = xmat(AMB, 0.0), capM = xmat(BLUE, 0.6), liqM = xmat('#7fb0ff', 0.35);
    const outer = new T.Mesh(new T.LatheGeometry(V2([[0, 0], [1.1, 0], [1.15, 0.08], [1.15, 4.2], [0.95, 4.6], [0.75, 4.8], [0.75, 5.0]]), 64), outerM); flask.add(outer);
    const inner = new T.Mesh(new T.LatheGeometry(V2([[0, 0.25], [0.9, 0.25], [0.95, 0.35], [0.95, 4.1], [0.78, 4.45], [0.6, 4.62], [0.6, 4.95]]), 64), innerM); flask.add(inner);
    const gap = new T.Mesh(new T.LatheGeometry(V2([[1.05, 0.12], [1.05, 4.15], [0.87, 4.5], [0.68, 4.7]]), 64), gapM); flask.add(gap);
    const liquid = new T.Mesh(new T.CylinderGeometry(0.9, 0.9, 3.2, 48), liqM); liquid.position.y = 1.9; flask.add(liquid);
    const cap = new T.Group(); cap.position.y = 4.95; flask.add(cap);
    cap.add(new T.Mesh(new T.CylinderGeometry(0.78, 0.8, 0.8, 48), capM)); const plug = new T.Mesh(new T.CylinderGeometry(0.58, 0.55, 0.6, 32), xmat(BLUE, 0.4)); plug.position.y = -0.4; cap.add(plug);
    const thread = new T.Mesh(new T.TorusGeometry(0.62, 0.03, 6, 48), xmat(BLUE, 0.8)); thread.rotation.x = Math.PI / 2; thread.position.y = -0.2; cap.add(thread);
    // heat particles in the liquid that bounce back from the inner wall
    const NP = 90, heat = new T.InstancedMesh(new T.SphereGeometry(0.05, 8, 6), new T.MeshBasicMaterial({ color: '#ff8a3a', transparent: true, blending: T.AdditiveBlending, depthWrite: false }), NP); heat.frustumCulled = false; flask.add(heat);
    const hr = K.rng(4), hp = Array.from({ length: NP }, () => [hr() * 6.283, hr.range(0.5, 3.4), hr() * 6, hr.range(0.6, 1.3)]);
    // reflected-heat arcs
    const arcs = [0, 1, 2, 3, 4, 5].map(i => { const a = i / 6 * 6.283, pts = []; for (let k = 0; k <= 20; k++) { const u = k / 20, r = 0.55 + 0.38 * Math.sin(u * Math.PI); pts.push(new T.Vector3(Math.cos(a) * r, 1.0 + i * 0.45 + u * 0.4, Math.sin(a) * r)); } const m = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 30, 0.02, 5), new T.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false })); flask.add(m); return m; });
    // the scanner bed and frame
    const bed = new T.Mesh(new T.PlaneGeometry(14, 10), new T.MeshBasicMaterial({ map: K.canvasTex(1024, 720, (g, r, w, h) => { g.fillStyle = '#04080e'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,180,255,0.12)'; g.lineWidth = 1; for (let x = 0; x < w; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.strokeStyle = 'rgba(160,210,255,0.5)'; g.lineWidth = 4; g.strokeRect(30, 30, w - 60, h - 60); g.fillStyle = 'rgba(160,210,255,0.6)'; g.font = `400 28px "${F}"`; g.fillText('SCAN 004  ·  85 kV', 50, 70); g.fillText('L', w - 70, h - 50); }) }));
    bed.rotation.x = -Math.PI / 2; bed.position.y = 0; scene.add(bed);
    // tags
    const tag = (txt, col) => { const l = K.label(txt, { font: F, weight: 700, px: 52, color: col, bg: 'rgba(2,6,10,0.8)', radius: 6, pad: 0.3, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 5; scene.add(l); return l; };
    const tags = this.tags.map((s, i) => tag(s, i === 2 ? '#ffd27a' : '#ffb050'));
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 72, color: '#d8ecff', height: 0.42 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const look = new T.Vector3(0, 3.0, 0);
    const MX = new T.Matrix4(), Q = new T.Quaternion(), V = new T.Vector3(), SC = new T.Vector3();
    return (t, realT) => {
      const a = 0.3 + t * 0.22, r = 14.0 + 0.8 * Math.sin(t * 0.3);
      S.camera.position.set(Math.sin(a) * r, 4.2 + 0.6 * Math.sin(t * 0.25), Math.cos(a) * r); S.camera.lookAt(look); S.camera.userData.look = look;
      const gapOn = K.prog(t, B[1] + 0.2, B[1] + 0.8), refl = K.prog(t, B[2] + 0.2, B[2] + 0.8), capOn = K.prog(t, B[3] + 0.2, B[3] + 0.8);
      gapM.uniforms.k.value = 1.6 * gapOn * (0.85 + 0.15 * Math.sin(realT * 3)); outerM.uniforms.k.value = 0.55 * (1 - 0.4 * gapOn * (1 - refl));
      innerM.uniforms.c.value.set(BLUE).lerp(new T.Color('#ffe2a0'), refl); innerM.uniforms.k.value = 0.55 + 0.5 * refl;
      capM.uniforms.c.value.set(BLUE).lerp(new T.Color(AMB), capOn); capM.uniforms.k.value = 0.6 + 0.8 * capOn;
      hp.forEach(([ang, y, ph, sp], i) => { const u = (realT * 0.25 * sp + ph) % 1, rr = 0.85 * Math.abs(Math.sin(u * Math.PI)); V.set(Math.cos(ang + realT * 0.1) * rr, y + 0.1 * Math.sin(realT + ph), Math.sin(ang + realT * 0.1) * rr); heat.setMatrixAt(i, MX.compose(V, Q, SC.setScalar(1))); });
      heat.instanceMatrix.needsUpdate = true;
      arcs.forEach((m, i) => { m.material.opacity = refl * (0.5 + 0.5 * Math.sin(realT * 4 + i)); });
      const show = (l, a2, pos) => { const p = K.prog(t, a2, a2 + 0.4) * 1; l.visible = p > 0.01; l.material.opacity = p; l.position.copy(pos); l.lookAt(S.camera.position); };
      show(tags[0], B[1] + 0.8, new T.Vector3(0, 0.9, 0).add(new T.Vector3(-Math.cos(a) * 1.9, 0, Math.sin(a) * 1.9)));
      show(tags[1], B[2] + 0.8, new T.Vector3(0, 2.0, 0).add(new T.Vector3(Math.cos(a) * 2.3, 0, -Math.sin(a) * 2.3)));
      show(tags[2], B[3] + 0.9, new T.Vector3(0, 0.5, 0).add(new T.Vector3(Math.cos(a) * 2.2, 0, -Math.sin(a) * 2.2)));
      tags[0].visible = tags[0].visible && t < B[2] + 0.3; tags[1].visible = tags[1].visible && t < B[3] + 0.3;
      titles.forEach((l, i) => { const a3 = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a3 > 0.01; l.material.opacity = a3; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('machine', { gain: 0.05 });
    k.play('hum', { t: 0.1, gain: 0.1, pitch: 3.0, dur: 10.5 });
    k.play('zap', { t: 0.3, gain: 0.15, pitch: 2.5 });
    k.play('riser', { t: B[1] + 0.1, gain: 0.12, pitch: 0.8, dur: 0.8 }); k.play('blip', { t: B[1] + 0.8, gain: 0.2, pitch: 1.3 });
    for (let i = 0; i < 6; i++) k.play('glass', { t: B[2] + 0.3 + i * 0.2, gain: 0.1, pitch: 1.6 + i * 0.1 });
    k.play('click', { t: B[3] + 0.3, gain: 0.3, pitch: 0.9 }); k.play('chime', { t: B[3] + 1.0, gain: 0.2, pitch: 1.1, music: true });
  },
  // post pass: film grain, slight bloom and a cold tint
  post: {
    fragment: `
      float h21(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes; vec3 c = texture2D(tColor, uv).rgb, b = vec3(0.0);
        for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) b += texture2D(tColor, uv + vec2(float(i), float(j)) * px * 4.0).rgb;
        b /= 25.0;
        float g = h21(uv * uRes + fract(uTime * 7.0) * 100.0) - 0.5;
        vec2 v = uv - 0.5; float vig = 1.0 - dot(v, v) * 1.2;
        vec3 o = (c + b * 0.8) * vig + g * 0.04;
        return vec4(o * vec3(0.92, 1.0, 1.12), 1.0);
      }`,
  },
};
