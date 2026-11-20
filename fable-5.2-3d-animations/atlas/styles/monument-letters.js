window.STYLES = window.STYLES || {};
STYLES['monument-letters'] = {
  id: 'monument-letters', name: 'Monument Letters',
  family: 'Small worlds',
  use: 'Title',
  look: 'Very large letters of weathered steel stand on a pale plain at sunrise, with small people and birds for scale. A low sun lays long shadows across the ground, and the sky goes from violet to gold.',
  motion: 'A low camera slides past the letters at walking height. The sun rises a little, the shadows shorten, birds cross the sky, and the camera pulls back to read the whole word.',
  shownHere: 'A one-word headline, HORIZON, as a land-art monument at sunrise.',
  goodFor: 'Single-word titles, names and openers that need weight and calm: brands, events, chapter titles.',
  fonts: ['Archivo Black'],
  duration: 10,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Dawn on the plain' },
    { t: 3.0, label: 'Walking past the letters' },
    { t: 6.5, label: 'The whole word' },
  ],
  word: 'HORIZON',

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Archivo Black';
    const sky = K.canvasTex(16, 256, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a3f78'); gr.addColorStop(0.45, '#c87fa0'); gr.addColorStop(0.7, '#ffbf7a'); gr.addColorStop(1, '#ffe2b0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    scene.background = sky; scene.fog = new T.Fog('#f2c9a0', 30, 120); scene.add(S.camera);
    const amb = new T.HemisphereLight('#c9b8e0', '#a08060', 1.0); scene.add(amb);
    const sun = new T.DirectionalLight('#ffc98a', 3.2); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
    Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 20, bottom: -20, near: 1, far: 140 }); sun.shadow.camera.updateProjectionMatrix(); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.05;
    scene.add(sun, sun.target);
    // the plain
    const groundTex = K.canvasTex(1024, 1024, (g, r, w, h) => { g.fillStyle = '#e8d8bc'; g.fillRect(0, 0, w, h); for (let i = 0; i < 20000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? 255 : 150},${r() < 0.5 ? 245 : 120},${r() < 0.5 ? 230 : 90},${r.range(0.03, 0.1)})`; g.fillRect(r() * w, r() * h, r.range(1, 4), r.range(1, 3)); } for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(150,120,90,0.15)'; g.lineWidth = 2; g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += r.range(-40, 40); y += r.range(-40, 40); g.lineTo(x, y); } g.stroke(); } }, 3);
    groundTex.wrapS = groundTex.wrapT = T.RepeatWrapping; groundTex.repeat.set(16, 16);
    const ground = new T.Mesh(new T.PlaneGeometry(400, 400), new T.MeshStandardMaterial({ map: groundTex, roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    // far hills on the horizon
    const hills = new T.Mesh(new T.CylinderGeometry(120, 120, 6, 64, 1, true), new T.MeshBasicMaterial({ color: '#a77f8f', side: T.BackSide, fog: false, transparent: true, opacity: 0.5, map: K.canvasTex(1024, 64, (g, r, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * (0.45 + 0.3 * Math.sin(x * 0.01) * Math.sin(x * 0.037))); g.lineTo(w, h); g.fill(); }) }));
    hills.position.y = 3; scene.add(hills);
    // weathered steel letters
    const rust = K.canvasTex(1024, 1024, (g, r, w, h) => { g.fillStyle = '#8a4a26'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? 160 : 60},${r() < 0.5 ? 80 : 30},${r() < 0.5 ? 40 : 15},${r.range(0.1, 0.4)})`; g.beginPath(); g.arc(r() * w, r() * h, r.range(1, 8), 0, 7); g.fill(); } for (let i = 0; i < 80; i++) { g.strokeStyle = 'rgba(50,25,12,0.3)'; g.lineWidth = r.range(2, 6); const x = r() * w; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + r.range(-20, 20), h); g.stroke(); } }, 6);
    rust.wrapS = rust.wrapT = T.RepeatWrapping;
    const steel = new T.MeshStandardMaterial({ map: rust, roughness: 0.8, metalness: 0.35 });
    const geo = K.textBlocks(this.word, { font: F, weight: 400, res: 220, size: 6.5, depth: 1.2 });
    { const p = geo.attributes.position, uv = new Float32Array(p.count * 2); for (let i = 0; i < p.count; i++) { uv[i * 2] = (p.getX(i) + p.getZ(i)) * 0.15; uv[i * 2 + 1] = p.getY(i) * 0.15; } geo.setAttribute('uv', new T.BufferAttribute(uv, 2)); geo.computeBoundingBox(); }
    const bb = geo.boundingBox, wordW = bb.max.x - bb.min.x;
    const letters = new T.Mesh(geo, steel); letters.position.set(0, -bb.min.y, 0); letters.castShadow = letters.receiveShadow = true; scene.add(letters);
    // people and birds for scale
    const pm = new T.MeshStandardMaterial({ color: '#2a2220', roughness: 0.8 });
    const people = [[-9, 3.5, 0.6], [-2.5, 4.2, -0.4], [4.5, 3.0, 0.5], [11, 3.8, -0.6], [0.5, -3.2, 0.3]].map(([x, z, sp]) => { const g = new T.Group(); const b = new T.Mesh(new T.CapsuleGeometry(0.16, 0.9, 4, 8), pm); b.position.y = 0.8; const h = new T.Mesh(new T.SphereGeometry(0.13, 10, 8), pm); h.position.y = 1.55; g.add(b, h); g.traverse(o => { o.castShadow = true; }); g.position.set(x, 0, z); g.userData = { x, sp }; scene.add(g); return g; });
    const wingGeo = new T.BufferGeometry(); wingGeo.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0, -0.5, 0.1, -0.15, -0.1, 0, 0.2, 0, 0, 0, 0.5, 0.1, -0.15, 0.1, 0, 0.2], 3));
    const birds = Array.from({ length: 11 }, (_, i) => { const m = new T.Mesh(wingGeo, new T.MeshBasicMaterial({ color: '#3a2a30', side: T.DoubleSide })); scene.add(m); return m; });
    // a low sun disc
    const sunDisc = new T.Mesh(new T.CircleGeometry(4, 40), new T.MeshBasicMaterial({ color: '#fff0c0', fog: false, toneMapped: false })); scene.add(sunDisc);
    const glow = new T.Sprite(new T.SpriteMaterial({ map: K.canvasTex(128, 128, g => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,220,150,0.9)'); gr.addColorStop(1, 'rgba(255,180,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }), transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false })); scene.add(glow);
    const cam = K.camPath([
      { t: 0, pos: [-wordW / 2 - 6, 1.6, 12.0], look: [-wordW / 2 + 2, 2.6, 0] },
      { t: 3.0, pos: [-wordW / 4, 1.5, 10.5], look: [-wordW / 8, 3.0, 0] },
      { t: 6.0, pos: [wordW / 4, 1.7, 11.0], look: [wordW / 8 + 2, 3.0, 0] },
      { t: 10, pos: [2.0, 5.0, wordW * 0.95 + 4], look: [0, 3.4, 0] },
    ], S.camera);
    return (t, realT) => {
      cam(t);
      const rise = K.prog(t, 0, 10);
      const el = K.lerp(0.07, 0.18, rise);
      const dir = new T.Vector3(-0.8 * Math.cos(el), Math.sin(el), 0.6 * Math.cos(el)).normalize();
      sun.position.copy(dir.clone().multiplyScalar(80)); sun.target.position.set(0, 0, 0); sun.target.updateMatrixWorld();
      sun.color.set('#ff9a5a').lerp(new T.Color('#ffe2b0'), rise); sun.intensity = 2.6 + 1.2 * rise;
      sunDisc.position.copy(dir.clone().multiplyScalar(110)); sunDisc.lookAt(0, 0, 0); glow.position.copy(sunDisc.position).multiplyScalar(0.98); glow.scale.setScalar(40);
      people.forEach((p, i) => { const u = p.userData; p.position.x = u.x + u.sp * realT; p.children[0].position.y = 0.8 + 0.03 * Math.abs(Math.sin(realT * 5 + i)); p.rotation.y = u.sp > 0 ? Math.PI / 2 : -Math.PI / 2; });
      birds.forEach((m, i) => { const a = realT * 0.35 + i * 0.25; m.position.set(-30 + ((realT * 3 + i * 4) % 60), 12 + 2 * Math.sin(a + i) + (i % 3), -12 - (i % 4) * 3); m.rotation.set(0, Math.PI / 2, 0.4 * Math.sin(realT * 8 + i)); });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.1 });
    k.play('riser', { t: 0.0, gain: 0.08, pitch: 0.5, dur: 2.0 });
    k.play('bell', { t: 0.4, gain: 0.15, pitch: 0.5, music: true });
    for (let i = 0; i < 6; i++) k.play('swish', { t: B[1] + 0.3 + i * 0.5, gain: 0.06, pitch: 1.8, dur: 0.3 });
    k.play('whoosh', { t: B[2], gain: 0.2, pitch: 0.5, dur: 2.5 });
    k.play('chime', { t: B[2] + 1.6, gain: 0.25, pitch: 0.8, music: true });
    k.play('bell', { t: B[2] + 2.8, gain: 0.18, pitch: 0.6, music: true });
  },
  post: null,
};
