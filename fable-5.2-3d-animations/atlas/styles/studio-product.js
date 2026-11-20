window.STYLES = window.STYLES || {};
STYLES['studio-product'] = {
  id: 'studio-product', name: 'Studio Product',
  family: 'Products and screens',
  use: 'Product shot',
  look: 'One product in a near-black studio, cut out of the dark by tall strip lights, standing on a black mirror floor that reflects it. Fine materials: powder coat, brushed steel, clear coat.',
  motion: 'The product turns slowly while a band of light sweeps across it. A cutaway opens to show the inside, then closes. One line of small text changes at each beat.',
  shownHere: 'A reusable steel water bottle: double-wall vacuum insulation keeps drinks cold for 24 hours and hot for 12.',
  goodFor: 'Product launches and feature reveals: one object, one claim per beat, and a cutaway or a close-up for the feature that matters.',
  fonts: ['Inter Tight:wght@400;600'],
  duration: 10,
  samples: 8,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Steel. Made to refill.' },
    { t: 3.3, label: 'Double wall, vacuum between' },
    { t: 6.6, label: '24 h cold  ·  12 h hot' },
  ],
  tag: 'vacuum',

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Inter Tight';
    scene.background = new T.Color('#050506'); scene.add(S.camera);
    S.renderer.localClippingEnabled = true;
    // environment: black box with two tall strips and a soft top, for the reflections
    const env = new T.Scene(); env.background = new T.Color('#000000');
    [[-4, 0, 1, 0.7, 8], [4, 0, 1.5, 0.5, 8], [0, 4.5, 0, 6, 1.2]].forEach(([x, y, z, w, h], i) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: i === 2 ? '#666' : '#ffffff', side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); });
    const pm = new T.PMREMGenerator(S.renderer), envRT = pm.fromScene(env, 0.02); scene.environment = envRT.texture; S.own(envRT); pm.dispose();
    env.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
    const key = new T.SpotLight('#ffffff', 80, 30, 0.35, 0.8, 1.5); key.position.set(-5, 7, 5); key.target.position.set(0, 1.6, 0); key.castShadow = true; scene.add(key, key.target);
    const sweep = new T.DirectionalLight('#ffffff', 0); scene.add(sweep, sweep.target); sweep.target.position.set(0, 1.6, 0);
    const rim = new T.SpotLight('#9fc8ff', 60, 30, 0.4, 0.9, 1.5); rim.position.set(4, 5, -5); rim.target.position.set(0, 1.8, 0); scene.add(rim, rim.target);
    // visible strip lights at the sides
    const stripMat = new T.MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
    const strips = [-1, 1].map(s => { const m = new T.Mesh(new T.BoxGeometry(0.18, 7, 0.18), stripMat); m.position.set(s * 4.6, 3.2, -2.5); scene.add(m); return m; });
    const glowTex = K.canvasTex(64, 256, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    strips.forEach(s => { const g = new T.Mesh(new T.PlaneGeometry(1.4, 7.6), new T.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0.35, blending: T.AdditiveBlending, depthWrite: false })); g.position.copy(s.position).add(new T.Vector3(0, 0, 0.12)); scene.add(g); });

    // the bottle: lathe profiles for the body, an inner wall, a steel ring and a cap
    const prof = (pts) => pts.map(([x, y]) => new T.Vector2(x, y));
    const outerPts = prof([[0, 0], [0.62, 0], [0.7, 0.06], [0.72, 0.2], [0.72, 2.7], [0.68, 3.0], [0.5, 3.3], [0.42, 3.45], [0.42, 3.62]]);
    const innerPts = prof([[0, 0.16], [0.56, 0.16], [0.6, 0.26], [0.6, 2.65], [0.56, 2.95], [0.38, 3.25], [0.33, 3.62]]);
    const clip = new T.Plane(new T.Vector3(0, 0, -1), 10);
    const coat = new T.MeshPhysicalMaterial({ color: '#1f5c5a', roughness: 0.55, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.35, side: T.DoubleSide, clippingPlanes: [clip] });
    const noise = K.canvasTex(256, 256, (g, r, w, h) => { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'; g.fillRect(r() * w, r() * h, 1.5, 1.5); } });
    noise.wrapS = noise.wrapT = T.RepeatWrapping; noise.repeat.set(4, 6); coat.bumpMap = noise; coat.bumpScale = 0.4;
    const steel = new T.MeshPhysicalMaterial({ color: '#d8dde2', metalness: 1, roughness: 0.18, clearcoat: 0.3, side: T.DoubleSide, clippingPlanes: [clip] });
    const brushed = K.canvasTex(512, 64, (g, r, w, h) => { g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 600; i++) { g.fillStyle = `rgba(${r() < 0.5 ? 255 : 0},${r() < 0.5 ? 255 : 0},${r() < 0.5 ? 255 : 0},0.08)`; g.fillRect(r() * w, 0, 1, h); } });
    brushed.wrapS = T.RepeatWrapping; steel.roughnessMap = brushed;
    const bottle = new T.Group(); scene.add(bottle);
    const outer = new T.Mesh(new T.LatheGeometry(outerPts, 96), coat); outer.castShadow = true; bottle.add(outer);
    const inner = new T.Mesh(new T.LatheGeometry(innerPts, 96), steel); bottle.add(inner);
    const gapMat = new T.MeshBasicMaterial({ color: '#58d0ff', transparent: true, opacity: 0, side: T.DoubleSide, clippingPlanes: [clip], depthWrite: false, blending: T.AdditiveBlending });
    const gap = new T.Mesh(new T.LatheGeometry(prof([[0.66, 0.1], [0.66, 2.68], [0.62, 2.98], [0.45, 3.28]]), 96), gapMat); bottle.add(gap);
    const water = new T.Mesh(new T.CylinderGeometry(0.585, 0.585, 2.2, 64), new T.MeshPhysicalMaterial({ color: '#7fd6ff', roughness: 0.05, transparent: true, opacity: 0.55, clippingPlanes: [clip], side: T.DoubleSide })); water.position.y = 1.3; bottle.add(water);
    const ring = new T.Mesh(new T.LatheGeometry(prof([[0.42, 3.45], [0.46, 3.47], [0.46, 3.66], [0.42, 3.68]]), 96), new T.MeshPhysicalMaterial({ color: '#e6e9ec', metalness: 1, roughness: 0.12 })); bottle.add(ring);
    const cap = new T.Group(); cap.position.y = 3.66; bottle.add(cap);
    const capMat = new T.MeshPhysicalMaterial({ color: '#141516', roughness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.2 });
    cap.add(new T.Mesh(new T.LatheGeometry(prof([[0, 0], [0.47, 0], [0.5, 0.05], [0.5, 0.42], [0.46, 0.5], [0, 0.52]]), 64), capMat));
    const loop = new T.Mesh(new T.TorusGeometry(0.26, 0.07, 16, 40, Math.PI), capMat); loop.position.y = 0.5; cap.add(loop);
    // a small emblem: a droplet
    const emblem = new T.Mesh(new T.PlaneGeometry(0.5, 0.5), new T.MeshPhysicalMaterial({ transparent: true, metalness: 1, roughness: 0.2, color: '#e8eaec', map: K.canvasTex(128, 128, g => { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(64, 14); g.bezierCurveTo(100, 64, 104, 82, 104, 88); g.arc(64, 88, 40, 0, Math.PI); g.bezierCurveTo(24, 82, 28, 64, 64, 14); g.fill(); }), alphaTest: 0.5, clippingPlanes: [clip] }));
    emblem.position.set(0, 1.9, 0.725); bottle.add(emblem);
    // condensation drops that slide down in the last beat
    const drops = Array.from({ length: 14 }, (_, i) => { const m = new T.Mesh(new T.SphereGeometry(0.03 + (i % 3) * 0.008, 10, 8), new T.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0, metalness: 0, transparent: true, opacity: 0.7, clearcoat: 1 })); m.scale.y = 1.4; m.userData = { a: i * 2.4, y0: 2.5 - (i % 5) * 0.35, sp: 0.15 + (i % 4) * 0.05 }; bottle.add(m); return m; });

    // black mirror floor: a flipped copy below a dark glossy plane
    const mirror = bottle.clone(true); mirror.scale.y = -1; scene.add(mirror);
    mirror.traverse(o => { if (o.userData.sp) o.visible = false; if (o.material) { o.material = o.material.clone(); o.material.clippingPlanes = [clip, new T.Plane(new T.Vector3(0, -1, 0), 0)]; if ('side' in o.material) o.material.side = T.DoubleSide; } });
    const floorTex = K.canvasTex(512, 512, (g, r, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(5,5,6,0.3)'); gr.addColorStop(0.35, 'rgba(5,5,6,0.75)'); gr.addColorStop(1, 'rgba(5,5,6,1)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const floor = new T.Mesh(new T.PlaneGeometry(30, 30), new T.MeshBasicMaterial({ map: floorTex, transparent: true })); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.001; scene.add(floor);
    const sheen = new T.Mesh(new T.PlaneGeometry(30, 30), new T.MeshPhysicalMaterial({ color: '#000000', roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.25, depthWrite: false })); sheen.rotation.x = -Math.PI / 2; sheen.position.y = 0.002; scene.add(sheen);

    // small text: one line under the product, and a thin callout for the vacuum gap
    const lines = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 400, px: 60, color: '#e8eaee', height: 0.3 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, -1.85, -8); S.camera.add(l); return l; });
    const tag = K.label(this.tag, { font: F, weight: 600, px: 52, color: '#58d0ff', height: 0.24 }); tag.position.set(1.55, 2.2, 0.2); scene.add(tag);
    const lead = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0.68, 2.1, 0.05), new T.Vector3(1.2, 2.2, 0.2)]), new T.LineBasicMaterial({ color: '#58d0ff', transparent: true })); scene.add(lead);

    const cam = K.camPath([
      { t: 0, pos: [0.0, 2.3, 13.0], look: [0, 1.75, 0] },
      { t: 5, pos: [0.9, 2.5, 11.4], look: [0, 1.85, 0] },
      { t: 10, pos: [-0.6, 2.2, 11.8], look: [0, 1.8, 0] },
    ], S.camera);
    return (t, realT) => {
      cam(t);
      const up = 0.45 + 0.55 * K.prog(t, 0, 1.2, 'inOut');
      key.intensity = 80 * up; rim.intensity = 60 * up; stripMat.color.setScalar(0.25 + 0.75 * up);
      const turn = -0.6 + t * 0.22;
      bottle.rotation.y = turn; mirror.rotation.y = turn;
      // light sweep: a hard light that crosses from left to right twice
      const sw = ((t * 0.32) % 1); sweep.position.set(K.lerp(-8, 8, sw), 3, 5); sweep.intensity = 3.0 * Math.sin(sw * Math.PI) ** 2;
      // cutaway: the front quarter opens in beat 2
      const cut = K.prog(t, B[1] + 0.2, B[1] + 1.0, 'inOut') * (1 - K.prog(t, B[2] - 0.6, B[2] + 0.1, 'inOut'));
      bottle.updateMatrixWorld();
      // the clip plane turns with the camera side of the bottle: keep z < -cut offset in bottle space
      const n = new T.Vector3(0, 0, -1).applyAxisAngle(new T.Vector3(0, 1, 0), 0); clip.normal.copy(n); clip.constant = K.lerp(10, 0.0, cut);
      gapMat.opacity = 0.5 * K.prog(t, B[1] + 0.8, B[1] + 1.2) * (1 - K.prog(t, B[2] - 0.6, B[2]));
      tag.visible = lead.visible = gapMat.opacity > 0.05; tag.material.opacity = lead.material.opacity = gapMat.opacity * 2;
      water.visible = cut > 0.05;
      const wet = K.prog(t, B[2] + 0.3, B[2] + 1.2);
      drops.forEach((d, i) => { const u = d.userData, y = u.y0 - ((realT * u.sp + i * 0.13) % 1.2); d.position.set(0.73 * Math.sin(u.a), y, 0.73 * Math.cos(u.a)); d.visible = wet > (i / drops.length); });
      coat.color.set('#1f5c5a').lerp(new T.Color('#2a7774'), 0.25 * wet);
      lines.forEach((l, i) => { const a = (i === 0 ? up : K.prog(t, B[i] + 0.1, B[i] + 0.6)) * (i === lines.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.4, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.05 });
    k.play('riser', { t: 0.0, gain: 0.15, pitch: 0.6, dur: 1.0 });
    k.play('hum', { t: 0.2, gain: 0.15, pitch: 0.8, dur: 2.0 });
    k.play('metal', { t: 1.1, gain: 0.2, pitch: 0.7 });
    k.play('swish', { t: B[1] + 0.2, gain: 0.25, pitch: 0.8, dur: 1.0 });
    k.play('glass', { t: B[1] + 1.0, gain: 0.2, pitch: 0.9 });
    k.play('swish', { t: B[2] - 0.6, gain: 0.2, pitch: 0.7, dur: 0.8 });
    for (let i = 0; i < 4; i++) k.play('drop', { t: B[2] + 0.5 + i * 0.4, gain: 0.12, pitch: 1.4 + i * 0.1 });
    k.play('chime', { t: B[2] + 1.4, gain: 0.18, pitch: 0.9, music: true });
  },
  post: null,
};
