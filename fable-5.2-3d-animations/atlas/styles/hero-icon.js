window.STYLES = window.STYLES || {};
STYLES['hero-icon'] = {
  id: 'hero-icon', name: 'Hero Icon',
  family: 'Products and screens',
  use: 'Title',
  look: 'One large, thick app-icon tile in a bright one-colour studio. The symbol on it is built from raised, rounded pieces with a soft gloss, and the tile casts a soft shadow on a floor of the same colour.',
  motion: 'The tile drops in, squashes on landing and springs back. Its pieces pop up one by one, the tile turns once, and the name rises below it.',
  shownHere: 'An app icon for mail: an envelope with a folding flap and a notification badge, then the name.',
  goodFor: 'App launches, logo reveals, feature names and section titles: one symbol, one word.',
  fonts: ['Baloo 2:wght@800'],
  duration: 9,
  samples: 8,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Drop in' },
    { t: 1.8, label: 'Pieces pop up' },
    { t: 4.0, label: 'One turn' },
    { t: 6.0, label: 'Name' },
  ],
  name: 'Mail',
  badge: '3',

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Baloo 2';
    const BG = '#ffcf5c';
    scene.background = new T.Color(BG); scene.fog = new T.Fog(BG, 18, 40); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 5, target: [0, 1.5, 0] }); L.key.position.set(-3, 9, 7); L.key.intensity = 2.6; L.key.shadow.radius = 8; L.amb.intensity = 1.0; S.scene.environmentIntensity = 0.9;
    const floor = new T.Mesh(new T.PlaneGeometry(80, 80), new T.MeshStandardMaterial({ color: BG, roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const rounded = (w, h, r, depth, bev) => {
      const s = new T.Shape(), x = -w / 2, y = -h / 2;
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
      return new T.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: bev, bevelThickness: bev, bevelSegments: 6, curveSegments: 16 });
    };
    // the tile: deep blue with a soft gradient face
    const grad = K.canvasTex(256, 256, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, w * 0.4, h); gr.addColorStop(0, '#4f8dff'); gr.addColorStop(1, '#1d4fd8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const tileGeo = rounded(3.2, 3.2, 0.85, 0.5, 0.18); tileGeo.translate(0, 0, -0.25);
    { const uv = tileGeo.attributes.uv, p = tileGeo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / 3.6 + 0.5, p.getY(i) / 3.6 + 0.5); }
    const tileMat = new T.MeshPhysicalMaterial({ map: grad, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2 });
    const root = new T.Group(); scene.add(root);
    const hop = new T.Group(); root.add(hop);
    const squash = new T.Group(); hop.add(squash);
    const tile = new T.Mesh(tileGeo, tileMat); tile.position.y = 1.85; tile.castShadow = true; squash.add(tile);
    // raised pieces: envelope body, a flap on a hinge, two side folds, a badge
    const white = new T.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.15, emissive: '#ffffff', emissiveIntensity: 0.3 });
    const pale = new T.MeshPhysicalMaterial({ color: '#dfe8ff', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.15 });
    const red = new T.MeshPhysicalMaterial({ color: '#ff4d5e', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 });
    const body = new T.Mesh(rounded(2.0, 1.4, 0.22, 0.12, 0.07), white); body.position.set(0, 1.75, 0.35); squash.add(body);
    const tri = (w, h, r) => { const s = new T.Shape(); s.moveTo(-w / 2 + r, 0); s.lineTo(w / 2 - r, 0); s.quadraticCurveTo(w / 2, 0, w / 2 - r * 0.7, -r * 0.7); s.lineTo(r * 0.6, -h + r * 0.6); s.quadraticCurveTo(0, -h, -r * 0.6, -h + r * 0.6); s.lineTo(-w / 2 + r * 0.7, -r * 0.7); s.quadraticCurveTo(-w / 2, 0, -w / 2 + r, 0);
      return new T.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 4, curveSegments: 10 }); };
    const hinge = new T.Group(); hinge.position.set(0, 2.42, 0.56); squash.add(hinge);
    const flap = new T.Mesh(tri(1.95, 0.85, 0.14), pale); hinge.add(flap);
    const badge = new T.Group(); badge.position.set(1.0, 2.5, 0.62); squash.add(badge);
    const disc = new T.Mesh(new T.CylinderGeometry(0.36, 0.36, 0.2, 40), red); disc.rotation.x = Math.PI / 2; badge.add(disc);
    const num = K.label(this.badge, { font: F, weight: 800, px: 80, color: '#ffffff', height: 0.5 }); num.position.z = 0.11; badge.add(num);
    [body, flap, disc, tile].forEach(m => { m.castShadow = true; m.receiveShadow = true; });
    // the name
    const nameL = K.label(this.name, { font: F, weight: 800, px: 140, color: '#1d2a5a', height: 1.1, lit: true }); nameL.position.set(0, 0.0, 1.6); nameL.castShadow = true; scene.add(nameL);
    // soft shapes floating in the studio for depth
    const fr = K.rng(5), floaters = [];
    for (let i = 0; i < 10; i++) {
      const m = new T.Mesh(i % 3 ? new T.SphereGeometry(fr.range(0.2, 0.45), 32, 20) : new T.CapsuleGeometry(0.18, 0.5, 8, 16), new T.MeshPhysicalMaterial({ color: fr.pick(['#ffe39a', '#ffb547', '#ffffff', '#ff9a5c']), roughness: 0.35, clearcoat: 0.8 }));
      m.userData = { x: fr.range(-7, 7), y: fr.range(0.6, 5.5), z: fr.range(-7, -2), ph: fr() * 6 }; m.castShadow = true; scene.add(m); floaters.push(m);
    }
    const cam = K.camPath([
      { t: 0, pos: [0, 3.0, 11.8], look: [0, 2.3, 0] },
      { t: 4, pos: [1.2, 3.0, 11.0], look: [0, 2.1, 0] },
      { t: 9, pos: [-0.6, 3.0, 12.6], look: [0, 2.2, 0] },
    ], S.camera);
    return (t, realT) => {
      cam(t);
      // drop: from above, land at 0.55 s, squash and spring back
      const fall = K.prog(t, 0, 0.45, 'in'); hop.position.y = 1.1 * (1 - fall);
      const land = t - 0.45, sq = land > 0 ? Math.exp(-land * 5) * Math.cos(land * 16) : 0;
      squash.scale.set(1 + 0.18 * sq, 1 - 0.24 * sq, 1 + 0.18 * sq);
      // pieces pop up in turn
      const pop = (t0) => { const u = t - t0; return u <= 0 ? 0.001 : 1 + Math.exp(-u * 7) * Math.sin(u * 18) * 0.35 * Math.min(1, u * 8) - (u < 0.12 ? 1 - u / 0.12 : 0); };
      body.scale.setScalar(Math.max(0.001, Math.min(pop(B[1]), 1.4))); body.position.z = 0.35;
      const fl = K.prog(t, B[1] + 0.35, B[1] + 0.9, 'back'); hinge.rotation.x = K.lerp(-Math.PI * 0.95, 0, fl); flap.visible = t > B[1] + 0.3;
      badge.scale.setScalar(Math.max(0.001, Math.min(pop(B[1] + 1.1), 1.4)));
      // one turn with a small hop
      const tu = K.prog(t, B[2], B[2] + 1.4, 'inOut'); root.rotation.y = tu * Math.PI * 2;
      root.position.y = 0.6 * Math.sin(tu * Math.PI);
      // the name rises
      const nm = K.prog(t, B[3], B[3] + 0.6, 'back'); nameL.visible = nm > 0; nameL.scale.setScalar(Math.max(0.001, nm)); nameL.position.y = K.lerp(-0.4, 0.62, nm);
      root.position.y += K.lerp(0, 1.05, K.prog(t, B[3], B[3] + 0.6, 'inOut'));
      floaters.forEach(m => { const u = m.userData; m.position.set(u.x + 0.4 * Math.sin(realT * 0.3 + u.ph), u.y + 0.3 * Math.sin(realT * 0.6 + u.ph), u.z); m.rotation.set(realT * 0.2 + u.ph, realT * 0.3, 0); });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.05 });
    k.play('whoosh', { t: 0.0, gain: 0.3, pitch: 1.4, dur: 0.6 });
    k.play('thud', { t: 0.45, gain: 0.6, pitch: 0.9 });
    k.play('pop', { t: B[1], gain: 0.45, pitch: 0.9 });
    k.play('paper', { t: B[1] + 0.4, gain: 0.35, pitch: 1.2 });
    k.play('pop', { t: B[1] + 1.1, gain: 0.45, pitch: 1.5 });
    k.play('blip', { t: B[1] + 1.15, gain: 0.2, pitch: 1.5 });
    k.play('swish', { t: B[2], gain: 0.35, pitch: 1.0, dur: 1.4 });
    k.play('thud', { t: B[2] + 1.4, gain: 0.3, pitch: 1.3 });
    k.play('chime', { t: B[3] + 0.1, gain: 0.3, pitch: 1.0, music: true });
    k.play('pop', { t: B[3] + 0.15, gain: 0.35, pitch: 1.2 });
  },
  post: null,
};
