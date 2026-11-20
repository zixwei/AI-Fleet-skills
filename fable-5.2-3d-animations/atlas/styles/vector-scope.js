window.STYLES = window.STYLES || {};
STYLES['vector-scope'] = {
  id: 'vector-scope', name: 'Vector Scope',
  family: 'Filters over 3D',
  use: 'Explainer',
  look: 'A vector CRT screen: glowing green and amber lines on black, bright dots at every vertex, phosphor trails that fade, a slightly curved glass and a soft bloom.',
  motion: 'Wireframe objects are traced by one moving beam; pulses travel as rings; a radar sweep turns and leaves an afterglow on every echo it paints.',
  shownHere: 'How radar detects an aircraft: a dish sends a radio pulse, the pulse bounces off the aircraft, the echo time gives the distance, and each sweep marks the aircraft on the screen.',
  goodFor: 'Signals, detection, tracking and early computing: anything technical that should feel precise and a little retro.',
  fonts: ['VT323'],
  duration: 11,
  samples: 1,
  // CONTENT
  beats: [
    { t: 0.0, label: 'A DISH SENDS A RADIO PULSE' },
    { t: 2.7, label: 'IT BOUNCES OFF THE AIRCRAFT' },
    { t: 5.4, label: 'ECHO TIME GIVES THE DISTANCE' },
    { t: 8.1, label: 'EACH SWEEP MARKS THE TRACK' },
  ],
  formula: 'DISTANCE = SPEED OF LIGHT x TIME / 2',
  example: '1 MS ECHO = 150 KM',

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'VT323';
    scene.background = new T.Color('#000000'); scene.add(S.camera);
    const G = '#5aff7a', A = '#ffc23a';
    const lm = (c, o = 1) => new T.LineBasicMaterial({ color: c, transparent: true, opacity: o, blending: T.AdditiveBlending, toneMapped: false });
    const dotTex = K.canvasTex(32, 32, g => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
    const wire = (geo, c) => { const g = new T.Group(); const e = new T.LineSegments(new T.EdgesGeometry(geo, 20), lm(c, 0.9)); g.add(e); const pts = new T.Points(geo, new T.PointsMaterial({ map: dotTex, color: c, size: 0.12, transparent: true, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false })); g.add(pts); g.userData.e = e; return g; };
    // the 3D scene: a dish on the ground and an aircraft
    const world = new T.Group(); scene.add(world);
    const grid = new T.LineSegments(new T.EdgesGeometry(new T.PlaneGeometry(30, 12, 15, 6)), lm(G, 0.18)); grid.rotation.x = -Math.PI / 2; world.add(grid);
    { const pts = []; for (let i = -15; i <= 15; i += 2) pts.push(new T.Vector3(i, 0, -6), new T.Vector3(i, 0, 6)); for (let j = -6; j <= 6; j += 2) pts.push(new T.Vector3(-15, 0, j), new T.Vector3(15, 0, j)); world.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(pts), lm(G, 0.15))); }
    const dish = new T.Group(); dish.position.set(-4.6, 0, 0); world.add(dish);
    const bowl = wire(new T.SphereGeometry(1.4, 12, 5, 0, 6.283, 0, 1.0), G); bowl.rotation.z = -1.1; bowl.position.y = 2.2; dish.add(bowl);
    const mast = wire(new T.CylinderGeometry(0.12, 0.2, 2.0, 6), G); mast.position.y = 1.0; dish.add(mast);
    const base = wire(new T.BoxGeometry(1.4, 0.4, 1.4), G); base.position.y = 0.2; dish.add(base);
    // aircraft: a simple wireframe jet
    const jet = new T.Group(); world.add(jet);
    const fus = wire(new T.CylinderGeometry(0.25, 0.12, 3.2, 8), A); fus.rotation.z = Math.PI / 2; jet.add(fus);
    const wingS = new T.Shape([new T.Vector2(-0.3, 0), new T.Vector2(0.5, 0), new T.Vector2(-0.4, 1.8), new T.Vector2(-0.9, 1.8)]);
    [-1, 1].forEach(s => { const w = wire(new T.ExtrudeGeometry(wingS, { depth: 0.04, bevelEnabled: false }), A); w.rotation.x = s * Math.PI / 2; jet.add(w); });
    const tail = wire(new T.ExtrudeGeometry(new T.Shape([new T.Vector2(-1.6, 0), new T.Vector2(-1.1, 0), new T.Vector2(-1.5, 0.9), new T.Vector2(-1.75, 0.9)]), { depth: 0.04, bevelEnabled: false }), A); jet.add(tail);
    // the pulse: an expanding ring from the dish, and the echo returning
    const ringGeo = new T.BufferGeometry().setFromPoints(Array.from({ length: 65 }, (_, i) => new T.Vector3(Math.cos(i / 64 * 6.283), Math.sin(i / 64 * 6.283), 0)));
    const pulses = [0, 1, 2].map(() => { const r = new T.Line(ringGeo, lm(G, 0)); world.add(r); return r; });
    const echoes = [0, 1, 2].map(() => { const r = new T.Line(ringGeo, lm(A, 0)); world.add(r); return r; });
    // the time line for the distance beat
    const tl = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(-6, 5.6, 0), new T.Vector3(-6, 5.6, 0)]), lm(A, 0)); world.add(tl);
    const txt = (s, c, h) => { const l = K.label(s, { font: F, weight: 400, px: 96, color: c, height: h }); l.material.blending = T.AdditiveBlending; scene.add(l); return l; };
    const formula = txt(this.formula, G, 0.55), example = txt(this.example, A, 0.55);
    // the PPI scope for the last beat
    const ppi = new T.Group(); ppi.position.set(0, 3.2, 0); scene.add(ppi);
    for (let r = 1; r <= 4; r++) { const c = new T.Line(ringGeo, lm(G, 0.35)); c.scale.setScalar(r * 0.9); ppi.add(c); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; ppi.add(new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0, 0, 0), new T.Vector3(Math.cos(a) * 3.6, Math.sin(a) * 3.6, 0)]), lm(G, 0.15))); }
    const sweep = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0, 0, 0), new T.Vector3(3.6, 0, 0)]), lm(G, 1)); ppi.add(sweep);
    const glowWedge = Array.from({ length: 24 }, (_, i) => { const l = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0, 0, 0), new T.Vector3(3.6, 0, 0)]), lm(G, 0)); ppi.add(l); return l; });
    const blips = Array.from({ length: 6 }, () => { const s = new T.Sprite(new T.SpriteMaterial({ map: dotTex, color: A, transparent: true, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false })); s.scale.setScalar(0.35); ppi.add(s); return s; });
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 400, px: 100, color: G, height: 0.5 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, -1.7, -8); S.camera.add(l); return l; });
    const look = new T.Vector3();
    const jetPos = t => new T.Vector3(4.6 - t * 0.25, 4.2, -1 + 0.2 * Math.sin(t));
    return (t, realT) => {
      const scope = K.prog(t, B[3] - 0.2, B[3] + 0.6, 'inOut');
      S.camera.position.set(0.8 * Math.sin(t * 0.2), K.lerp(4.4, 3.2, scope), K.lerp(15.5, 9.5, scope)); look.set(0, K.lerp(3.0, 3.2, scope), 0); S.camera.lookAt(look); S.camera.userData.look = look;
      world.visible = scope < 0.95; ppi.visible = scope > 0.05;
      const jp = jetPos(t); jet.position.copy(jp); jet.rotation.z = 0.04 * Math.sin(realT * 2);
      // the beam traces the wireframes: draw range grows at the start
      const draw = K.prog(t, -0.4, 1.2);
      [bowl, mast, base, fus, tail, ...jet.children].forEach(g => { const e = g.userData.e; if (e) e.geometry.setDrawRange(0, Math.floor(draw * e.geometry.attributes.position.count / 2) * 2); });
      bowl.rotation.y = realT * 0.4;
      // pulses out (beats 1-2), echoes back (beat 2)
      const D = jp.distanceTo(new T.Vector3(-4.6, 2.2, 0)), speed = D / 1.0;
      pulses.forEach((r, i) => { const t0 = 0.3 + i * 0.9, u = t - t0; const on = u > 0 && u < D / speed + 0.2 && t < B[3]; r.visible = on; if (on) { r.scale.setScalar(u * speed); r.position.set(-4.6, 2.2, 0); r.lookAt(S.camera.position); r.material.opacity = 0.9 * (1 - u * speed / (D + 1)); } });
      echoes.forEach((r, i) => { const t0 = B[1] + 0.1 + i * 0.7, u = t - t0; const on = u > 0 && u < 1.0 && t < B[3]; r.visible = on; if (on) { r.position.copy(jp); r.scale.setScalar(u * speed); r.lookAt(S.camera.position); r.material.opacity = 0.9 * (1 - u); } });
      const tp = K.prog(t, B[2] + 0.2, B[2] + 1.2); tl.geometry.setFromPoints([new T.Vector3(-4.6, 5.25, 0), new T.Vector3(K.lerp(-4.6, jp.x, tp), 5.25, 0)]); tl.material.opacity = tp * (1 - scope);
      formula.visible = t > B[2] + 0.4 && scope < 0.5; formula.position.set(0, 6.4, 0); formula.lookAt(S.camera.position); formula.material.opacity = K.prog(t, B[2] + 0.4, B[2] + 0.8);
      example.visible = t > B[2] + 1.2 && scope < 0.5; example.position.set(0, 5.75, 0); example.lookAt(S.camera.position); example.material.opacity = K.prog(t, B[2] + 1.2, B[2] + 1.6);
      // radar sweep with afterglow; blips glow when painted, fade after
      const sa = realT * 2.4; sweep.rotation.z = sa;
      glowWedge.forEach((l, i) => { l.rotation.z = sa - i * 0.035; l.material.opacity = 0.5 * (1 - i / 24); });
      blips.forEach((b, i) => { const ang = 0.6 - i * 0.18 - (t - B[3]) * 0.05, rad = 2.6 - i * 0.12; b.position.set(Math.cos(ang) * rad, Math.sin(ang) * rad, 0); const since = ((sa - ang) % 6.283 + 6.283) % 6.283 / 2.4; b.material.opacity = Math.exp(-since * 1.2) * (i === 0 ? 1 : 0.55) * scope; b.scale.setScalar(i === 0 ? 0.45 : 0.3); });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.2)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.1, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('machine', { gain: 0.04 });
    k.play('hum', { t: 0.05, gain: 0.07, pitch: 2.0, dur: 10.8 });
    [0.3, 1.2, 2.1].forEach(t => k.play('blip', { t, gain: 0.3, pitch: 2.0 }));
    [B[1] + 0.1, B[1] + 0.8, B[1] + 1.5].forEach(t => k.play('blip', { t, gain: 0.22, pitch: 1.4 }));
    k.play('tick', { t: B[2] + 0.2, gain: 0.25, pitch: 1.0 }); k.play('tick', { t: B[2] + 1.2, gain: 0.25, pitch: 1.0 });
    for (let i = 0; i < 5; i++) k.play('blip', { t: B[3] + 0.5 + i * 0.52, gain: 0.25, pitch: 1.6 });
    k.play('swish', { t: B[3] - 0.2, gain: 0.15, pitch: 1.0, dur: 0.8 });
  },
  // post pass: curved glass, bloom, phosphor tint, faint scan lines
  post: {
    fragment: `
      vec4 postFX(vec2 uv){
        vec2 cc = uv - 0.5; float r2 = dot(cc, cc); vec2 cuv = 0.5 + cc * (1.0 + 0.12 * r2);
        if (cuv.x < 0.0 || cuv.x > 1.0 || cuv.y < 0.0 || cuv.y > 1.0) return vec4(0.0, 0.0, 0.0, 1.0);
        vec2 px = 1.0 / uRes; vec3 c = texture2D(tColor, cuv).rgb, b = vec3(0.0);
        for (int i = -3; i <= 3; i++) for (int j = -3; j <= 3; j++) b += texture2D(tColor, cuv + vec2(float(i), float(j)) * px * 3.0).rgb;
        b /= 49.0;
        float scan = 0.9 + 0.1 * sin(cuv.y * uRes.y * 1.4);
        vec3 o = (c * 1.2 + b * 2.4) * scan * (1.0 - r2 * 0.9) + vec3(0.0, 0.012, 0.004);
        return vec4(o, 1.0);
      }`,
  },
};
