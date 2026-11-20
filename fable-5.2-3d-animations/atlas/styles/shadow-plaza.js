window.STYLES = window.STYLES || {};
STYLES['shadow-plaza'] = {
  id: 'shadow-plaza', name: 'Shadow Plaza',
  family: 'Light and optics',
  use: 'Explainer',
  look: 'A white stone plaza seen from high above, with a ring of 24 hour marks cut into the stone. Thin dark plates stand on small plinths; from above they are only lines, but their long shadows are the real words and pictures.',
  motion: 'The low sun moves round the plaza. Shadows sweep across the stone, and at each stop one plate\'s shadow reads clearly. The camera turns above the plaza so the new shadow reads the right way up.',
  shownHere: 'How time zones work: Earth turns 360 degrees in 24 hours, so the sun moves 15 degrees each hour; each 15-degree band keeps one clock time; going one zone east puts clocks forward an hour, and going west puts them back.',
  goodFor: 'Reveals that depend on an angle or a moment: perspective, timing, seasons, "the same thing seen from a new side". Quiet, architectural explanations.',
  fonts: ['Cormorant Garamond:wght@600;700', 'Inter:wght@600'],
  duration: 12,
  samples: 4,
  // CONTENT: one shadow text per beat; the sun stands at az degrees for that beat
  beats: [
    { t: 0.0, label: 'Earth turns once a day', shadow: '360° in 24 h', az: 0 },
    { t: 2.4, label: 'So the sun moves 15° every hour', shadow: '15° = 1 hour', az: 72 },
    { t: 4.8, label: 'Each 15° band keeps one clock time', shadow: 'one zone', az: 144 },
    { t: 7.2, label: 'One zone east: clocks go forward', shadow: 'east +1 h', az: 216 },
    { t: 9.6, label: 'One zone west: clocks go back', shadow: 'west −1 h', az: 288 },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), FS = 'Cormorant Garamond', FI = 'Inter', BE = this.beats;
    scene.background = new T.Color('#d8d2c6'); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#e8eef8', '#a09080', 0.3));
    const EL = 22 * Math.PI / 180;
    const sun = new T.DirectionalLight('#fff2dc', 3.6); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
    Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 70 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 1.5; scene.add(sun, sun.target);
    const std = (c, r = 0.85, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    // the plaza: stone tiles, a ring of 24 hour marks, a compass in the middle
    const stone = K.canvasTex(2048, 2048, (g, r, w, h) => { g.fillStyle = '#f2efe8'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(160,150,135,0.35)'; g.lineWidth = 3; for (let i = 0; i <= 16; i++) { g.beginPath(); g.moveTo(i * w / 16, 0); g.lineTo(i * w / 16, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 16); g.lineTo(w, i * h / 16); g.stroke(); }
      for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(120,110,95,${r.range(0.02, 0.06)})`; g.fillRect(r() * w, r() * h, 3, 3); }
      const cx = w / 2, cy = h / 2, R = w * 0.43; g.strokeStyle = 'rgba(90,80,70,0.55)'; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke(); g.beginPath(); g.arc(cx, cy, R * 0.93, 0, 7); g.stroke();
      g.fillStyle = 'rgba(70,60,50,0.75)'; g.font = `700 54px "${FS}"`; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; g.beginPath(); g.moveTo(cx + Math.sin(a) * R * 0.93, cy - Math.cos(a) * R * 0.93); g.lineTo(cx + Math.sin(a) * R, cy - Math.cos(a) * R); g.stroke(); g.fillText(String(k), cx + Math.sin(a) * R * 1.08, cy - Math.cos(a) * R * 1.08); }
      g.beginPath(); g.arc(cx, cy, 40, 0, 7); g.stroke(); g.font = `700 60px "${FS}"`; g.fillText('N', cx, cy - 90); }, 4);
    const plaza = new T.Mesh(new T.PlaneGeometry(30, 30), std('#ffffff', 0.9, { map: stone })); plaza.rotation.x = -Math.PI / 2; plaza.receiveShadow = true; scene.add(plaza);
    // the plates: each one faces its sun; its text is squashed by tan(elevation) so the shadow reads true
    const plates = BE.map((b, i) => {
      const az = b.az * Math.PI / 180, s = new T.Vector3(Math.sin(az), 0, -Math.cos(az)), base = s.clone().multiplyScalar(-5.6);
      const W = 6.2, L = 2.6, H = L * Math.tan(EL);
      const tex = K.canvasTex(1024, 350, (g, r, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#000'; g.font = `700 ${b.shadow.length > 10 ? 170 : 210}px "${FS}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(b.shadow, w / 2, h / 2 + 20); }, 30 + i);
      const geo = new T.PlaneGeometry(W, H); geo.translate(0, H / 2, 0);
      const m = new T.Mesh(geo, new T.MeshStandardMaterial({ color: '#2a2622', map: tex, alphaTest: 0.5, transparent: true, side: T.DoubleSide, roughness: 0.5 }));
      m.customDepthMaterial = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, map: tex, alphaTest: 0.5 }); m.castShadow = true;
      m.position.copy(base); m.lookAt(base.clone().add(s)); scene.add(m);
      const plinth = new T.Mesh(new T.BoxGeometry(W * 0.9, 0.12, 0.3), std('#8a8070', 0.7)); plinth.position.copy(base).setY(0.06); plinth.lookAt(base.clone().add(s).setY(0.06)); plinth.castShadow = plinth.receiveShadow = true; scene.add(plinth);
      return { s, base, L };
    });
    const titles = BE.map(b => { const l = K.label(b.label, { font: FI, weight: 600, px: 62, color: '#2a2622', bg: 'rgba(250,247,240,0.9)', radius: 10, pad: 0.35, height: 0.36 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    // sun azimuth and camera heading follow the beats; the camera looks down on the shadow that reads now
    const azAt = t => { let k = 0; for (let i = 1; i < B.length; i++) if (t >= B[i]) k = i; const a0 = BE[Math.max(0, k - 1)].az, a1 = BE[k].az, u = k ? K.prog(t, B[k] - 0.1, B[k] + 1.0, 'inOut') : 1; return { az: K.lerp(a0, a1, u) * Math.PI / 180, k, u }; };
    const C = new T.Vector3(), up = new T.Vector3(), look = new T.Vector3();
    return (t, realT) => {
      const { az, k, u } = azAt(t);
      const s = new T.Vector3(Math.sin(az), 0, -Math.cos(az));
      sun.position.copy(s).multiplyScalar(30 * Math.cos(EL)).setY(30 * Math.sin(EL)); sun.target.position.set(0, 0, 0); sun.target.updateMatrixWorld();
      // the shadow runs from the plate away from the sun; centre the camera on it, screen-up along the shadow
      const P0 = plates[Math.max(0, k - 1)], P1 = plates[k];
      const c0 = P0.base.clone().addScaledVector(P0.s, -P0.L / 2 - 0.2), c1 = P1.base.clone().addScaledVector(P1.s, -P1.L / 2 - 0.2);
      C.lerpVectors(c0, c1, u);
      up.copy(s).negate();
      S.camera.up.copy(up); S.camera.position.copy(C).addScaledVector(up, -3.0).setY(13.5 + 2.5 * Math.sin(Math.PI * u)); look.copy(C).addScaledVector(up, 0.4); S.camera.lookAt(look);
      titles.forEach((l, i) => { const a2 = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a2 > 0.01; l.material.opacity = a2; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.05 }); k.bed('crowd', { gain: 0.015 });
    k.play('bell', { t: 0.3, gain: 0.15, pitch: 0.5, music: true });
    B.slice(1).forEach((b, i) => { k.play('whoosh', { t: b, gain: 0.12, pitch: 0.5, dur: 1.1 }); k.play('bell', { t: b + 1.05, gain: 0.14, pitch: [0.56, 0.63, 0.75, 0.5][i], music: true }); });
    k.play('chime', { t: 11.0, gain: 0.1, pitch: 1.0, music: true });
  },
  post: null,
};
