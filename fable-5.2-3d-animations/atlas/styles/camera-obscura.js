window.STYLES = window.STYLES || {};
STYLES['camera-obscura'] = {
  id: 'camera-obscura', name: 'Camera Obscura',
  family: 'Light and optics',
  use: 'Story',
  look: 'A dark room with one small hole in the shutter. The bright world outside appears upside down on the opposite wall, soft and glowing, and a dusty beam of light crosses the room. A hand holds a white card in the beam.',
  motion: 'Outside, the day goes on: a tree sways, a cyclist passes, birds cross. Inside, the picture on the wall moves with it, upside down. A white card slides into the beam and catches a sharper copy of the picture.',
  shownHere: 'How the eye forms an image: light from the scene enters one small opening; the picture lands upside down on the back wall; a lens makes it sharp; in the eye the opening is the pupil and the back wall is the retina; the brain turns the picture the right way up.',
  goodFor: 'Perception and projection: how cameras and eyes work, point of view, "the picture in your head is a copy", reveals of a hidden image.',
  fonts: ['Cormorant Garamond:wght@600;700', 'Inter:wght@600'],
  duration: 12,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Light enters through one small hole' },
    { t: 2.4, label: 'The picture lands upside down' },
    { t: 4.8, label: 'A lens makes it sharp' },
    { t: 7.2, label: 'In the eye: pupil, lens, retina' },
    { t: 9.6, label: 'The brain turns it the right way up' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), FT = 'Cormorant Garamond', FI = 'Inter', BE = this.beats;
    scene.background = new T.Color('#050403'); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#3a3020', '#000000', 0.25));
    const std = (c, r = 0.85, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    // the outside world: its own scene, seen from the hole
    const out = new T.Scene(); out.background = new T.Color('#8cc8f0');
    out.add(new T.HemisphereLight('#ffffff', '#6a8a4a', 1.4)); const osun = new T.DirectionalLight('#fff4dc', 2.5); osun.position.set(-5, 8, -4); out.add(osun);
    const og = new T.Mesh(new T.PlaneGeometry(200, 200), std('#6aa04a', 0.9)); og.rotation.x = -Math.PI / 2; out.add(og);
    const sunDisc = new T.Mesh(new T.CircleGeometry(1.4, 32), new T.MeshBasicMaterial({ color: '#fff6c0' })); sunDisc.position.set(-6, 7, -30); out.add(sunDisc);
    const tree = new T.Group(); { const tr = new T.Mesh(new T.CylinderGeometry(0.3, 0.4, 3, 10), std('#6a4a2a')); tr.position.y = 1.5; const cr = new T.Mesh(new T.SphereGeometry(2.0, 20, 14), std('#2a7a3a')); cr.position.y = 4.2; tree.add(tr, cr); } tree.position.set(-3.5, 0, -14); out.add(tree);
    const house = new T.Group(); { const b = new T.Mesh(new T.BoxGeometry(4, 3, 3), std('#e8d8b8')); b.position.y = 1.5; const r = new T.Mesh(new T.ConeGeometry(3.2, 2, 4), std('#b04030')); r.position.y = 4; r.rotation.y = Math.PI / 4; const d = new T.Mesh(new T.PlaneGeometry(0.8, 1.6), std('#5a3a20')); d.position.set(0, 0.8, 1.51); house.add(b, r, d); } house.position.set(3.5, 0, -16); out.add(house);
    const cyclist = new T.Group(); { const w1 = new T.Mesh(new T.TorusGeometry(0.4, 0.06, 8, 24), std('#222')); w1.position.x = -0.6; const w2 = w1.clone(); w2.position.x = 0.6; const body = new T.Mesh(new T.CapsuleGeometry(0.22, 0.6, 6, 10), std('#d84a3a')); body.position.set(0, 1.2, 0); const head = new T.Mesh(new T.SphereGeometry(0.2, 12, 10), std('#f0c8a0')); head.position.set(0.1, 1.85, 0); cyclist.add(w1, w2, body, head); } cyclist.position.set(-12, 0.4, -9); out.add(cyclist);
    const birds = [0, 1, 2].map(i => { const b = new T.Mesh(new T.ConeGeometry(0.15, 0.6, 3), new T.MeshBasicMaterial({ color: '#222' })); b.rotation.z = -Math.PI / 2; b.position.set(-14, 6 + i * 0.6, -20); out.add(b); return b; });
    const ocam = new T.PerspectiveCamera(50, 16 / 9, 0.1, 200); ocam.position.set(0, 2.2, 0); ocam.lookAt(0, 2.6, -10);
    const rtLow = S.own(new T.WebGLRenderTarget(240, 135)), rtHigh = S.own(new T.WebGLRenderTarget(640, 360));
    // the room: a shutter with a hole at z = 0, the image wall at z = -6
    const RW = 8, RH = 4.5, RD = 6;
    const shutterS = new T.Shape([new T.Vector2(-RW / 2, 0), new T.Vector2(RW / 2, 0), new T.Vector2(RW / 2, RH), new T.Vector2(-RW / 2, RH)]); const hole = new T.Path(); hole.absarc(0, 2.2, 0.06, 0, Math.PI * 2, true); shutterS.holes.push(hole);
    const shutter = new T.Mesh(new T.ShapeGeometry(shutterS), std('#2a2018', 0.9, { side: T.DoubleSide })); shutter.position.z = 0; scene.add(shutter);
    const holeGlow = new T.Mesh(new T.CircleGeometry(0.06, 16), new T.MeshBasicMaterial({ color: '#fff8e0' })); holeGlow.position.set(0, 2.2, -0.01); holeGlow.rotation.y = Math.PI; scene.add(holeGlow);
    const floor = new T.Mesh(new T.PlaneGeometry(RW, RD), std('#1a140e')); floor.rotation.x = -Math.PI / 2; floor.position.z = -RD / 2; scene.add(floor);
    [-1, 1].forEach(s => { const w = new T.Mesh(new T.PlaneGeometry(RD, RH), std('#14100c')); w.rotation.y = -s * Math.PI / 2; w.position.set(s * RW / 2, RH / 2, -RD / 2); scene.add(w); });
    // the image wall: the outside picture, flipped both ways (a pinhole turns the picture upside down)
    const wallGeo = new T.PlaneGeometry(RW - 0.4, (RW - 0.4) * 9 / 16); const uv = wallGeo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, 1 - uv.getX(i), 1 - uv.getY(i));
    const wallImg = new T.Mesh(wallGeo, new T.MeshBasicMaterial({ map: rtLow.texture, color: new T.Color(0.6, 0.57, 0.52) })); wallImg.position.set(0, 2.2, -RD + 0.01); wallImg.rotation.y = 0; scene.add(wallImg);
    const back = new T.Mesh(new T.PlaneGeometry(RW, RH), std('#1a1612')); back.position.set(0, RH / 2, -RD); scene.add(back);
    // the beam with dust
    const coneGeo = new T.ConeGeometry(1, 1, 32, 1, true); coneGeo.translate(0, -0.5, 0); coneGeo.rotateX(-Math.PI / 2);
    const beam = new T.Mesh(coneGeo, new T.MeshBasicMaterial({ color: '#fff0d0', transparent: true, opacity: 0.05, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); beam.position.set(0, 2.2, 0); beam.scale.set(RW * 0.45, RW * 0.26, RD); scene.add(beam);
    const ND = 260, dp = new Float32Array(ND * 3), rr = K.rng(59), dseed = Array.from({ length: ND }, () => [rr(), rr.range(-1, 1), rr.range(-1, 1), rr() * 6]);
    const dust = new T.Points(new T.BufferGeometry().setAttribute('position', new T.BufferAttribute(dp, 3)), new T.PointsMaterial({ color: '#fff4dc', size: 0.025, transparent: true, opacity: 0.7, blending: T.AdditiveBlending, depthWrite: false })); scene.add(dust);
    // the hand and the white card that catches a sharper copy
    const card = new T.Group(); scene.add(card);
    const cardGeo = new T.PlaneGeometry(1.6, 0.9); const cuv = cardGeo.attributes.uv; for (let i = 0; i < cuv.count; i++) cuv.setXY(i, 1 - (0.3 + cuv.getX(i) * 0.4), 1 - (0.3 + cuv.getY(i) * 0.4));
    const cardImg = new T.Mesh(cardGeo, new T.MeshBasicMaterial({ map: rtHigh.texture })); card.add(cardImg);
    const cardBack = new T.Mesh(new T.PlaneGeometry(1.7, 1.0), std('#f4f0e8', 0.9)); cardBack.position.z = -0.005; card.add(cardBack);
    const hand = new T.Mesh(new T.CapsuleGeometry(0.16, 0.5, 6, 12), std('#c89a78', 0.7)); hand.rotation.z = Math.PI / 2; hand.position.set(0.95, -0.35, -0.05); card.add(hand);
    const arm = new T.Mesh(new T.CylinderGeometry(0.14, 0.16, 2, 12), std('#3a4a6a', 0.8)); arm.rotation.z = Math.PI / 2; arm.position.set(2.1, -0.4, -0.08); card.add(arm);
    // eye labels for beat 3
    const tag = (txt, x, y, z) => { const l = K.label(txt, { font: FI, weight: 600, px: 52, color: '#2a1a10', bg: 'rgba(250,240,220,0.92)', radius: 10, pad: 0.18, height: 0.24 }); l.position.set(x, y, z); l.visible = false; scene.add(l); return l; };
    const tags = [tag('pupil', -0.5, 2.6, -0.3), tag('lens', 0.0, 2.95, -3.0), tag('retina', 2.6, 4.0, -RD + 0.1)];
    const titles = BE.map(b => { const l = K.label(b.label, { font: FT, weight: 700, px: 70, color: '#fff2dc', bg: 'rgba(10,8,6,0.82)', radius: 10, pad: 0.35, height: 0.4 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([{ t: 0, pos: [3.4, 3.3, -0.3], look: [-0.6, 2.0, -5.6], fov: 58 }, { t: 4.8, pos: [3.2, 3.0, -0.4], look: [-0.4, 2.0, -4.6], fov: 58 }, { t: 7.2, pos: [3.5, 3.4, -0.25], look: [-0.6, 2.1, -4.0], fov: 60 }, { t: 12, pos: [3.0, 3.0, -0.6], look: [-0.4, 2.1, -5.6], fov: 52 }], S.camera);
    return (t, realT) => {
      cam(t);
      // the outside day goes on
      tree.rotation.z = 0.03 * Math.sin(realT * 1.3); cyclist.position.x = -12 + ((t * 2.4) % 24); cyclist.children[0].rotation.z = cyclist.children[1].rotation.z = -t * 6;
      birds.forEach((b, i) => { b.position.x = -14 + ((t * 3 + i * 1.5) % 28); b.position.y = 6 + i * 0.6 + 0.3 * Math.sin(realT * 4 + i); });
      osun.intensity = 2.5; out.background.setHSL(0.57, 0.6, 0.72 - 0.05 * K.prog(t, 0, 12));
      S.renderer.setRenderTarget(rtLow); S.renderer.render(out, ocam); S.renderer.setRenderTarget(rtHigh); S.renderer.render(out, ocam); S.renderer.setRenderTarget(null);
      // the picture on the wall turns the right way up in the last beat (the brain's job)
      const flip = K.prog(t, B[4] + 0.3, B[4] + 1.6, 'inOut'); wallImg.rotation.z = Math.PI * flip;
      // the card: slides into the beam at beat 2
      const cin = K.prog(t, B[2] + 0.1, B[2] + 1.0, 'out') * (1 - K.prog(t, B[4] + 0.1, B[4] + 0.6)); card.position.set(K.lerp(4.5, 0.0, cin), 2.2, -3.0); card.visible = cin > 0.01;
      for (let i = 0; i < ND; i++) { const [u, a, b, ph] = dseed[i], z = -((u * RD + realT * 0.05) % RD), w = (-z / RD); dp[i * 3] = a * RW * 0.45 * w + 0.05 * Math.sin(realT * 0.5 + ph); dp[i * 3 + 1] = 2.2 + b * RW * 0.26 * w + 0.05 * Math.cos(realT * 0.4 + ph); dp[i * 3 + 2] = z; } dust.geometry.attributes.position.needsUpdate = true;
      tags.forEach(l => { l.visible = t > B[3] + 0.3 && t < B[4] + 0.2; l.lookAt(S.camera.position); });
      const kf = Math.tan(S.camera.fov * Math.PI / 360) / Math.tan(15 * Math.PI / 180); // keep the titles the same size when the lens widens
      titles.forEach((l, i) => { l.position.y = 1.74 * kf; l.scale.setScalar(kf); const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.05 }); k.bed('wind', { gain: 0.03 });
    k.play('wood', { t: 0.2, gain: 0.25, pitch: 0.6 }); k.play('chime', { t: 0.5, gain: 0.1, pitch: 1.0, music: true });
    k.play('pluck', { t: B[1] + 0.4, gain: 0.12, pitch: 0.8, music: true }); k.play('bell', { t: B[1] + 1.4, gain: 0.08, pitch: 2.4 });
    k.play('swish', { t: B[2] + 0.1, gain: 0.2, pitch: 0.9, dur: 0.9 }); k.play('paper', { t: B[2] + 0.9, gain: 0.2, pitch: 1.2 });
    k.play('blip', { t: B[3] + 0.4, gain: 0.12, pitch: 1.2 }); k.play('blip', { t: B[3] + 0.6, gain: 0.12, pitch: 1.35 }); k.play('blip', { t: B[3] + 0.8, gain: 0.12, pitch: 1.5 });
    k.play('whoosh', { t: B[4] + 0.3, gain: 0.15, pitch: 0.6, dur: 1.3 }); k.play('chime', { t: B[4] + 1.6, gain: 0.15, pitch: 1.0, music: true });
  },
  post: null,
};
