window.STYLES = window.STYLES || {};
STYLES['aurora-lines'] = {
  id: 'aurora-lines', name: 'Aurora Lines',
  family: 'Earth, weather and sky',
  use: 'Story',
  look: 'A snow plain at night with a dark line of fir trees and a frozen lake in front. Curtains of green and violet light hang in the sky, bright at the bottom edge and fading upward, and their colours shine back from the ice.',
  motion: 'The ribbons of light move and change shape to tell the story: streams that pour in from one side, arcs that bend down toward the pole, then tall curtains that fold and ripple. The reflection follows below.',
  shownHere: 'How the northern lights form: the sun throws out charged particles; Earth\'s magnetic field guides them down near the poles; they hit the air about 100 to 300 km up; oxygen glows green and nitrogen adds violet; the curtains ripple as the field shifts.',
  goodFor: 'Invisible forces made visible: space weather, energy flows, fields, calm and wonder. Slow, beautiful stories at night.',
  fonts: ['Cormorant Garamond:wght@600;700'],
  duration: 12,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'The sun throws out charged particles' },
    { t: 2.4, label: 'Earth\'s field guides them toward the pole' },
    { t: 4.8, label: 'They hit the air 100 to 300 km up' },
    { t: 7.2, label: 'Oxygen glows green, nitrogen adds violet' },
    { t: 9.6, label: 'The curtains ripple as the field shifts' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Cormorant Garamond', BE = this.beats;
    scene.background = new T.Color('#02040c'); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#3a5a8a', '#0a0a14', 0.5));
    const moon = new T.DirectionalLight('#9ab8ff', 0.6); moon.position.set(-10, 8, 10); scene.add(moon);
    const rr = K.rng(71);
    // stars
    const sp = []; for (let i = 0; i < 1200; i++) { const a = rr() * Math.PI - Math.PI / 2, e = rr.range(0.05, 1.2), r = 120; sp.push(Math.sin(a) * Math.cos(e) * r, Math.sin(e) * r, -Math.cos(a) * Math.cos(e) * r); }
    scene.add(new T.Points(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(sp, 3)), new T.PointsMaterial({ color: '#ffffff', size: 0.35 })));
    // snow, trees, the frozen lake
    // the snow has a lake-shaped hole, so the mirrored sky shows through the ice
    const snowS = new T.Shape([new T.Vector2(-200, -60), new T.Vector2(200, -60), new T.Vector2(200, 140), new T.Vector2(-200, 140)]); const lakeHole = new T.Path(); lakeHole.absellipse(0, 8, 30, 10, 0, Math.PI * 2, true); snowS.holes.push(lakeHole);
    const snow = new T.Mesh(new T.ShapeGeometry(snowS, 48), new T.MeshStandardMaterial({ color: '#c8d8f0', roughness: 0.9 })); snow.rotation.x = -Math.PI / 2; scene.add(snow);
    for (let i = 0; i < 90; i++) { const h = rr.range(1.5, 4), x = rr.range(-60, 60), z = rr.range(-34, -26); const c = new T.Mesh(new T.ConeGeometry(h * 0.3, h, 7), new T.MeshBasicMaterial({ color: '#05080c' })); c.position.set(x, h / 2, z); scene.add(c); }
    const lakeGeo = new T.CircleGeometry(1, 64); lakeGeo.scale(30, 10, 1);
    const ice = new T.Mesh(lakeGeo, new T.MeshStandardMaterial({ color: '#0a1428', roughness: 0.15, metalness: 0.3, transparent: true, opacity: 0.55 })); ice.rotation.x = -Math.PI / 2; ice.position.set(0, 0.02, -8); scene.add(ice);
    // a ribbon: a strip whose bottom edge follows a path; colour fades up from green to violet
    const NR = 6, NP = 90;
    const ribMat = mirror => new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
      uniforms: { uT: { value: 0 }, uViolet: { value: 0 }, uFade: { value: mirror ? 0.7 : 1 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float uT, uViolet, uFade; varying vec2 vUv;
        void main(){ float v = vUv.y; float a = smoothstep(0.0, 0.06, v) * pow(1.0 - v, 1.6);
          float rays = 0.65 + 0.35 * sin(vUv.x * 160.0 + uT * 2.0) * sin(vUv.x * 37.0 - uT * 0.7);
          vec3 green = vec3(0.25, 1.0, 0.55), violet = vec3(0.7, 0.35, 1.0);
          vec3 c = mix(green, violet, smoothstep(0.35, 0.9, v) * uViolet + 0.15 * (1.0 - uViolet) * v);
          c += vec3(0.6, 0.2, 0.9) * smoothstep(0.08, 0.0, v) * uViolet * 0.6;
          gl_FragColor = vec4(c * a * rays * 0.55 * uFade, 1.0); }` });
    const mk = mirror => Array.from({ length: NR }, (_, i) => { const geo = new T.BufferGeometry(); const pos = new Float32Array((NP + 1) * 2 * 3), uv = []; const idx = [];
      for (let k = 0; k <= NP; k++) { uv.push(k / NP, 0, k / NP, 1); if (k < NP) { const a = k * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
      geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
      const m = new T.Mesh(geo, ribMat(mirror)); m.frustumCulled = false; scene.add(m); return { m, geo, pos, i }; });
    const ribs = mk(false), mirr = mk(true);
    // three shapes for a ribbon: a stream from the left, an arc down to the pole, a folded curtain
    const shape = (k, i, s, t) => { const ph = i * 0.9;
      if (k === 0) { const y0 = 40 + i * 4, x = K.lerp(-120, 20, s) + ((t * 25 + i * 30) % 60) - 30; return [x, y0 - s * 18, -70 - i * 3, 3]; }
      if (k === 1) { const a = K.lerp(-0.2, Math.PI + 0.2, s), R = 30 + i * 6; return [Math.cos(a) * R * 1.4, 12 + Math.sin(a) * R * 0.8, -80 + i * 2, 6]; }
      const x = K.lerp(-70, 70, s), fold = 5 * Math.sin(s * 9 + ph + t * 0.8) + 3 * Math.sin(s * 23 - t * 1.3 + ph), y0 = 10 + i * 2.2 + 2 * Math.sin(s * 4 + t * 0.5 + i);
      return [x, y0, -70 - i * 6 + fold, 22 + 6 * Math.sin(s * 5 + i)]; };
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 70, color: '#e8f8ff', bg: 'rgba(2,6,16,0.7)', radius: 10, pad: 0.35, height: 0.4 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([{ t: 0, pos: [0, 3.0, 16], look: [-6, 9, -60] }, { t: 4.8, pos: [0, 2.8, 16], look: [0, 7.5, -60] }, { t: 12, pos: [1.5, 2.6, 15], look: [2, 6.5, -60] }], S.camera);
    const P = [0, 0, 0, 0];
    return (t, realT) => {
      cam(t);
      let k0 = 0, k1 = 0, u = 1;
      if (t < B[1]) { k0 = k1 = 0; } else if (t < B[2]) { k0 = 0; k1 = 1; u = K.prog(t, B[1], B[1] + 1.6, 'inOut'); } else { k0 = 1; k1 = 2; u = K.prog(t, B[2], B[2] + 1.8, 'inOut'); }
      const violet = K.prog(t, B[3], B[3] + 1.2), ripple = 1 + 1.6 * K.prog(t, B[4], B[4] + 1.0);
      [ribs, mirr].forEach((set, mi) => set.forEach(r => { const vis = (k1 === 0 ? r.i < 4 : true); r.m.visible = vis;
        for (let j = 0; j <= NP; j++) { const s = j / NP, a = shape(k0, r.i, s, realT * (k0 === 2 ? ripple : 1)), b = shape(k1, r.i, s, realT * (k1 === 2 ? ripple : 1));
          for (let q = 0; q < 4; q++) P[q] = K.lerp(a[q], b[q], u);
          const y = mi ? -P[1] : P[1], h = mi ? -P[3] : P[3];
          r.pos.set([P[0], y, P[2]], j * 6); r.pos.set([P[0], y + h, P[2]], j * 6 + 3); }
        r.geo.attributes.position.needsUpdate = true; r.m.material.uniforms.uT.value = realT; r.m.material.uniforms.uViolet.value = violet; }));
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.06 }); k.bed('night', { gain: 0.03 });
    k.play('whoosh', { t: 0.2, gain: 0.12, pitch: 0.4, dur: 2.2 }); k.play('sparkle', { t: 0.8, gain: 0.08 });
    k.play('hum', { t: B[1] + 0.1, gain: 0.1, pitch: 0.5, dur: 2.0 }); k.play('chime', { t: B[1] + 1.2, gain: 0.1, pitch: 0.8, music: true });
    k.play('riser', { t: B[2] + 0.1, gain: 0.08, pitch: 0.7, dur: 1.8 }); k.play('bell', { t: B[2] + 1.6, gain: 0.12, pitch: 0.5, music: true });
    k.play('chime', { t: B[3] + 0.4, gain: 0.12, pitch: 1.0, music: true }); k.play('chime', { t: B[3] + 1.0, gain: 0.1, pitch: 1.2, music: true });
    k.play('swish', { t: B[4] + 0.2, gain: 0.12, pitch: 0.4, dur: 2.0 }); k.play('bell', { t: B[4] + 1.4, gain: 0.12, pitch: 0.6, music: true });
  },
  post: null,
};
