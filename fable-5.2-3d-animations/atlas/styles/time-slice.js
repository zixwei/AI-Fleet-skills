window.STYLES = window.STYLES || {};
STYLES['time-slice'] = {
  id: 'time-slice', name: 'Time Slice',
  family: 'Light and optics',
  use: 'Story',
  look: 'One fixed view of a city street, cut into 24 tall strips. Each strip shows the same street at a different hour, so the picture runs from early morning on the left to deep night on the right.',
  motion: 'The view never moves. A wave of time sweeps across the strips: first the whole street is at dawn, then the hours spread out from left to right while cars, people and lights keep moving inside every strip.',
  shownHere: 'One day on a city street: it wakes at 6 a.m.; the hours spread across the picture; at noon the street is busy; in the evening the lights come on; at midnight the whole day sits side by side.',
  goodFor: 'Time and change in one place: a day, a year, before and after, growth over time. Any story where the place stays and the time moves.',
  fonts: ['Space Grotesk:wght@500;700'],
  duration: 12,
  samples: 4,
  // CONTENT
  strips: 24,
  beats: [
    { t: 0.0, label: '6 a.m.: the street wakes up' },
    { t: 2.4, label: 'The day spreads across the picture' },
    { t: 4.8, label: 'Noon: busy, bright, short shadows' },
    { t: 7.2, label: 'Evening: the lights come on' },
    { t: 9.6, label: 'Midnight: one whole day, side by side' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Space Grotesk', BE = this.beats, NS = this.strips;
    scene.background = new T.Color('#000000'); scene.add(S.camera);
    // the street: its own scene and camera, rendered strip by strip
    const st = new T.Scene(); const hemi = new T.HemisphereLight('#ffffff', '#404040', 1.0); st.add(hemi); const sun = new T.DirectionalLight('#ffffff', 2.0); st.add(sun, sun.target);
    const std = (c, r = 0.8, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const road = new T.Mesh(new T.PlaneGeometry(80, 8), std('#3a3a40', 0.9)); road.rotation.x = -Math.PI / 2; st.add(road);
    [-5, 5].forEach(z => { const sw = new T.Mesh(new T.BoxGeometry(80, 0.2, 2), std('#9a9690')); sw.position.set(0, 0.1, z < 0 ? -5 : 5); st.add(sw); });
    for (let x = -30; x < 30; x += 3) { const m = new T.Mesh(new T.PlaneGeometry(1.2, 0.15), std('#e8e0c0')); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.01, 0); st.add(m); }
    const rr = K.rng(61), winPos = [];
    const cols = ['#c8a888', '#a8b4c0', '#d8c8a8', '#b89878', '#9aa8a0'];
    for (let x = -18; x < 18;) { const w = rr.range(3, 5), h = rr.range(6, 14); const b = new T.Mesh(new T.BoxGeometry(w, h, 4), std(cols[Math.floor(rr() * cols.length)], 0.85)); b.position.set(x + w / 2, h / 2, -8); st.add(b);
      for (let fy = 1.5; fy < h - 1; fy += 1.6) for (let fx = -w / 2 + 0.8; fx < w / 2 - 0.5; fx += 1.1) winPos.push([x + w / 2 + fx, fy, -5.98, rr()]); x += w + 0.2; }
    const win = new T.InstancedMesh(new T.PlaneGeometry(0.6, 0.9), new T.MeshBasicMaterial({ color: '#ffffff' }), winPos.length); const O = new T.Object3D(); winPos.forEach(([x, y, z], i) => { O.position.set(x, y, z); O.updateMatrix(); win.setMatrixAt(i, O.matrix); }); st.add(win);
    const lamps = []; for (let x = -16; x <= 16; x += 8) { const p = new T.Mesh(new T.CylinderGeometry(0.08, 0.1, 4.2, 8), std('#2a2a2e')); p.position.set(x, 2.1, -4.2); const bulb = new T.Mesh(new T.SphereGeometry(0.25, 12, 8), new T.MeshBasicMaterial({ color: '#ffffff' })); bulb.position.set(x, 4.3, -4.2); st.add(p, bulb); lamps.push(bulb); }
    const cars = Array.from({ length: 8 }, (_, i) => { const g = new T.Group(); const b = new T.Mesh(new T.BoxGeometry(2.2, 0.7, 1.1), std(['#d83a3a', '#3a6ad8', '#f2c040', '#e8e8e8'][i % 4], 0.4)); b.position.y = 0.55; const c = new T.Mesh(new T.BoxGeometry(1.2, 0.5, 1.0), std('#2a3a4a', 0.2)); c.position.set(-0.1, 1.1, 0); const hl = new T.Mesh(new T.SphereGeometry(0.12, 8, 6), new T.MeshBasicMaterial({ color: '#fff6c0' })); hl.position.set(1.12, 0.55, 0); g.add(b, c, hl); g.userData = { lane: i % 2 ? 1.8 : -1.8, dir: i % 2 ? -1 : 1, ph: rr() * 60, hl }; st.add(g); return g; });
    const people = Array.from({ length: 20 }, (_, i) => { const m = new T.Mesh(new T.CapsuleGeometry(0.2, 0.9, 4, 8), std(`hsl(${rr() * 360}, 50%, 45%)`)); m.userData = { z: rr() < 0.5 ? -5 : 5, dir: rr() < 0.5 ? 1 : -1, ph: rr() * 40, sp: rr.range(0.8, 1.4) }; st.add(m); return m; });
    const scam = new T.PerspectiveCamera(40, 16 / 9, 0.1, 200); scam.position.set(0, 3.2, 16); scam.lookAt(0, 4.0, -4);
    const RTW = 1280, RTH = 720, rt = S.own(new T.WebGLRenderTarget(RTW, RTH, { samples: 4 }));
    // the screen: a full-frame plane in front of the main camera shows the sliced picture
    const D = 10, hh = Math.tan(15 * Math.PI / 180) * D;
    const screen = new T.Mesh(new T.PlaneGeometry(2 * hh * 16 / 9, 2 * hh), new T.MeshBasicMaterial({ map: rt.texture, toneMapped: true })); screen.position.z = -D; S.camera.add(screen);
    const tick = K.canvasTex(64, 1024, (g, r, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(w - 2, 0, 2, h); }, 2);
    // the state of the street at hour h (6 .. 24) and running clock s (seconds, for motion)
    const SKY = [[6, '#f2b080'], [8, '#a8d0f0'], [12, '#7ac0f0'], [17, '#90b8e0'], [19, '#f0905a'], [20.5, '#3a3a6a'], [22, '#10142a'], [24, '#05060e']];
    const skyAt = h => { let i = 0; while (i < SKY.length - 2 && h > SKY[i + 1][0]) i++; const [h0, c0] = SKY[i], [h1, c1] = SKY[i + 1]; return new T.Color(c0).lerp(new T.Color(c1), K.clamp((h - h0) / (h1 - h0))); };
    const C = new T.Color(), WARM = new T.Color('#ffd890'), DARK = new T.Color('#2a3040');
    const setHour = (h, s) => {
      const day = K.clamp(Math.sin((h - 6) / 14 * Math.PI)), dark = K.clamp((h - 18.5) / 2) + K.clamp((6.8 - h) / 0.8);
      st.background = skyAt(h); const a = (h - 6) / 14 * Math.PI; sun.position.set(-Math.cos(a) * 30, Math.max(2, Math.sin(a) * 30), 10); sun.intensity = 2.4 * day; hemi.intensity = 0.25 + 0.9 * day;
      winPos.forEach(([, , , r], i) => { const on = dark > r * 0.9 || (h > 7 && h < 8 && r < 0.2); win.setColorAt(i, on ? WARM : C.copy(DARK).lerp(new T.Color('#8aa8c8'), day * 0.6)); }); win.instanceColor.needsUpdate = true;
      lamps.forEach(l => l.material.color.set(dark > 0.3 ? '#fff0b0' : '#6a6a6a'));
      const busy = K.clamp(Math.sin((h - 6) / 15 * Math.PI) * 1.4);
      cars.forEach((c, i) => { const vis = i < 2 + busy * 6; c.visible = vis; const x = ((c.userData.ph + s * 6 * c.userData.dir) % 60 + 60) % 60 - 30; c.position.set(x, 0, c.userData.lane); c.rotation.y = c.userData.dir > 0 ? 0 : Math.PI; c.userData.hl.material.color.set(dark > 0.3 ? '#fff6c0' : '#8a8a80'); });
      people.forEach((p, i) => { p.visible = i < 3 + busy * 17 && !(h > 23 && i > 2); const x = ((p.userData.ph + s * p.userData.sp * p.userData.dir) % 40 + 40) % 40 - 20; p.position.set(x, 0.75, p.userData.z + (p.userData.z < 0 ? 0.3 : -0.3)); });
    };
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 66, color: '#ffffff', bg: 'rgba(10,10,20,0.75)', radius: 12, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const hourTags = [6, 9, 12, 15, 18, 21, 24].map(h => { const l = K.label(h === 24 ? '0:00' : `${h}:00`, { font: F, weight: 700, px: 52, color: '#ffffff', bg: 'rgba(10,10,20,0.75)', radius: 8, pad: 0.15, height: 0.2 }); l.material.depthTest = false; l.renderOrder = 10; S.camera.add(l); return { l, h }; });
    S.camera.position.set(0, 0, 0); S.camera.lookAt(0, 0, -1);
    return (t, realT) => {
      // the spread: 0 = every strip at dawn, 1 = strips run from 6:00 to 24:00
      const spread = K.prog(t, B[1], B[4] + 0.6, 'inOut');
      const R = S.renderer; R.setRenderTarget(rt); rt.scissorTest = true; // a render target keeps its own scissor box
      for (let i = 0; i < NS; i++) { const f = (i + 0.5) / NS, h = 6 + 0.6 * K.prog(t, 0, B[1]) + 18 * f * spread; setHour(Math.min(23.99, h), realT);
        const x0 = Math.floor(i * RTW / NS), x1 = Math.floor((i + 1) * RTW / NS); rt.scissor.set(x0, 0, x1 - x0, RTH); R.setRenderTarget(rt); R.render(st, scam); }
      rt.scissorTest = false; R.setRenderTarget(null);
      hourTags.forEach(({ l, h }) => { const f = (h - 6) / 18; l.visible = spread > 0.9; l.position.set((f - 0.5) * 2 * hh * 16 / 9 * 0.8 * 0.9, -hh * 0.8 * 0.92, -8); l.material.opacity = K.prog(spread, 0.9, 1); });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('crowd', { gain: 0.04 }); k.bed('wind', { gain: 0.03 }); k.bed('night', { gain: 0.02 });
    k.play('bell', { t: 0.3, gain: 0.12, pitch: 0.6, music: true }); k.play('pluck', { t: 0.8, gain: 0.1, pitch: 1.2, music: true });
    for (let i = 0; i < 12; i++) k.play('tick', { t: B[1] + 0.2 + i * 0.18, gain: 0.1, pitch: 1.2 + i * 0.05 });
    k.play('whoosh', { t: B[2] + 0.4, gain: 0.12, pitch: 1.0, dur: 1.2 }); k.play('blip', { t: B[2] + 1.0, gain: 0.08, pitch: 1.6 });
    k.play('chime', { t: B[3] + 0.5, gain: 0.12, pitch: 0.9, music: true }); k.play('click', { t: B[3] + 0.9, gain: 0.2, pitch: 1.0 });
    k.play('bell', { t: B[4] + 1.0, gain: 0.15, pitch: 0.5, music: true });
  },
  post: null,
};
