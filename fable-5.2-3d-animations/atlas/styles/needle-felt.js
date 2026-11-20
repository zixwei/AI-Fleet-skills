window.STYLES = window.STYLES || {};
STYLES['needle-felt'] = {
  id: 'needle-felt', name: 'Needle Felt',
  family: 'Crafted materials',
  use: 'Story',
  look: 'Wool felt figures on a felt mat: soft rounded forms covered in short fuzzy fibres, matte colours with a gentle sheen, and visible stitches in contrasting thread. Soft daylight from one side.',
  motion: 'Things roll in and settle with a little bounce. Outlines stitch themselves on, one stitch at a time, and pieces grow row by row as if they are knitted.',
  shownHere: "How a sheep's wool becomes a jumper: the fleece is sheared, washed and carded, spun into yarn, and knitted into a jumper.",
  goodFor: 'Handmade processes, origins of everyday things, and gentle stories for children: raw material, steps of making, finished object.',
  fonts: ['Patrick Hand'],
  duration: 11,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: '1  Shear the fleece' },
    { t: 2.7, label: '2  Wash and card it' },
    { t: 5.4, label: '3  Spin it into yarn' },
    { t: 8.1, label: '4  Knit the jumper' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Patrick Hand';
    scene.background = new T.Color('#cfe0c8'); scene.fog = new T.Fog('#cfe0c8', 18, 36); scene.add(S.camera);
    const L = K.lights(S, 'sun', { size: 9, target: [0, 0, 0] }); L.key.position.set(-6, 10, 7); L.key.intensity = 2.2; L.key.shadow.radius = 6; L.amb.intensity = 1.2;
    const fibreTex = K.canvasTex(256, 256, (g, r, w, h) => { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); for (let i = 0; i < 1600; i++) { g.strokeStyle = `rgba(${r() < 0.5 ? 255 : 0},${r() < 0.5 ? 255 : 0},${r() < 0.5 ? 255 : 0},0.18)`; g.lineWidth = 1; const x = r() * w, y = r() * h, a = r() * 6.28, l = r.range(4, 14); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 1) * l, y + Math.sin(a + 1) * l, x + Math.cos(a) * l * 1.6, y + Math.sin(a) * l * 1.6); g.stroke(); } });
    fibreTex.wrapS = fibreTex.wrapT = T.RepeatWrapping;
    const felt = c => new T.MeshPhysicalMaterial({ color: c, roughness: 1, sheen: 1, sheenRoughness: 0.7, sheenColor: new T.Color(c).offsetHSL(0, -0.1, 0.15), bumpMap: fibreTex, bumpScale: 1.5 });
    const M = { mat: felt('#5f8f5a'), wool: felt('#f4efe2'), dirty: felt('#d9cdb2'), face: felt('#3b3634'), wood: felt('#a2714a'), red: felt('#d9534a'), teal: felt('#3f9a9a'), sun: felt('#f2c14e'), blue: felt('#6f9fd8') };
    // fuzz: short fibres standing out of a surface, as one instanced mesh
    const fibreGeo = new T.CylinderGeometry(0.007, 0.003, 1, 3).translate(0, 0.5, 0);
    const fuzz = (mesh, n, len, color, seed) => {
      const geo = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry, p = geo.attributes.position, r = K.rng(seed);
      const im = new T.InstancedMesh(fibreGeo, new T.MeshStandardMaterial({ color, roughness: 1 }), n), M4 = new T.Matrix4(), Q = new T.Quaternion(), up = new T.Vector3(0, 1, 0);
      const a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3(), nrm = new T.Vector3(), pt = new T.Vector3();
      for (let i = 0; i < n; i++) {
        const f = r.int(0, p.count / 3 - 1) * 3; a.fromBufferAttribute(p, f); b.fromBufferAttribute(p, f + 1); c.fromBufferAttribute(p, f + 2);
        let u = r(), v = r(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
        pt.copy(a).addScaledVector(b.clone().sub(a), u).addScaledVector(c.clone().sub(a), v);
        nrm.crossVectors(b.clone().sub(a), c.clone().sub(a)).normalize(); nrm.add(new T.Vector3(r.range(-0.7, 0.7), r.range(-0.7, 0.7), r.range(-0.7, 0.7))).normalize();
        Q.setFromUnitVectors(up, nrm); M4.compose(pt, Q, new T.Vector3(1, len * r.range(0.4, 1.2), 1)); im.setMatrixAt(i, M4);
      }
      mesh.add(im); return im;
    };
    const blob = (geo, m, x, y, z, parent = scene) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
    // felt mat with a stitched border
    const mat = blob(new T.BoxGeometry(22, 0.3, 11), M.mat, 2, -0.15, 0); mat.material = mat.material.clone(); mat.material.bumpScale = 2.5;
    const thread = (pts, color, r = 0.025, dashed = true) => {
      const curve = new T.CatmullRomCurve3(pts), n = Math.max(8, Math.floor(curve.getLength() / 0.22)), g = new T.Group();
      for (let i = 0; i < n; i++) { if (dashed && i % 2) continue; const p0 = curve.getPointAt(i / n), p1 = curve.getPointAt(Math.min(1, (i + 0.8) / n)); const s = new T.Mesh(new T.TubeGeometry(new T.LineCurve3(p0, p1), 1, r, 5), new T.MeshStandardMaterial({ color, roughness: 0.8 })); s.userData.i = i / n; g.add(s); }
      scene.add(g); return g;
    };
    thread([[-8.6, 0.02, -5.1], [12.6, 0.02, -5.1], [12.6, 0.02, 5.1], [-8.6, 0.02, 5.1], [-8.6, 0.02, -5.1]].map(p => new T.Vector3(...p)), '#f2c14e', 0.03);

    // 1 the sheep: fleece body, felt face and legs
    const sheep = new T.Group(); sheep.position.set(-5.4, 0, 0.6); scene.add(sheep);
    const fleece = new T.Group(); sheep.add(fleece);
    const fr = K.rng(3);
    for (let i = 0; i < 9; i++) { const m = blob(new T.SphereGeometry(fr.range(0.55, 0.75), 20, 14), M.wool, fr.range(-0.7, 0.7), 1.2 + fr.range(-0.2, 0.3), fr.range(-0.35, 0.35), fleece); fuzz(m, 320, 0.06, '#fbf6ea', 10 + i); }
    const bodyCore = blob(new T.SphereGeometry(0.75, 20, 14), M.dirty, 0, 1.15, 0, sheep); bodyCore.scale.set(1.25, 0.85, 0.75);
    const head = blob(new T.SphereGeometry(0.38, 20, 14), M.face, 1.25, 1.55, 0, sheep); head.scale.set(1.2, 0.9, 0.9);
    [-1, 1].forEach(s => { const e = blob(new T.SphereGeometry(0.14, 12, 8), M.face, 1.15, 1.8, s * 0.33, sheep); e.scale.set(0.6, 0.4, 1.4); });
    [-1, 1].forEach(s => { const e = blob(new T.SphereGeometry(0.06, 10, 8), felt('#ffffff'), 1.55, 1.62, s * 0.15, sheep); });
    [[-0.6, -0.3], [-0.6, 0.3], [0.6, -0.3], [0.6, 0.3]].forEach(([x, z]) => blob(new T.CylinderGeometry(0.1, 0.09, 0.75, 10), M.face, x, 0.38, z, sheep));
    // shears
    const shears = new T.Group(); scene.add(shears);
    [-1, 1].forEach(s => { const bl = blob(new T.BoxGeometry(0.9, 0.04, 0.12), new T.MeshStandardMaterial({ color: '#c8ccd2', metalness: 0.8, roughness: 0.3 }), 0.45, 0, 0, shears); bl.rotation.y = s * 0.15; });
    blob(new T.TorusGeometry(0.16, 0.05, 8, 16), M.red, -0.15, 0, 0, shears).rotation.x = Math.PI / 2;
    // 2 the fleece cloud travels to a felt tub; clean rolls come out
    const cloud = new T.Group(); scene.add(cloud);
    for (let i = 0; i < 6; i++) { const m = blob(new T.SphereGeometry(fr.range(0.35, 0.5), 18, 12), M.dirty, fr.range(-0.5, 0.5), fr.range(0, 0.3), fr.range(-0.3, 0.3), cloud); fuzz(m, 200, 0.06, '#e6dcc4', 30 + i); }
    const tub = blob(new T.CylinderGeometry(0.95, 0.8, 0.8, 24, 1, true), M.blue, -1.6, 0.4, -0.4); tub.material = M.blue.clone(); tub.material.side = T.DoubleSide;
    blob(new T.TorusGeometry(0.95, 0.07, 8, 32), M.blue, -1.6, 0.8, -0.4).rotation.x = Math.PI / 2;
    const water = blob(new T.CircleGeometry(0.9, 32), new T.MeshStandardMaterial({ color: '#9fd3e6', roughness: 0.2 }), -1.6, 0.62, -0.4); water.rotation.x = -Math.PI / 2;
    const bubbles = Array.from({ length: 8 }, (_, i) => blob(new T.SphereGeometry(0.06 + (i % 3) * 0.03, 10, 8), new T.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.7, roughness: 0.1 }), -1.6, 0.7, -0.4));
    const rolls = [0, 1, 2].map(i => { const m = blob(new T.CapsuleGeometry(0.17, 0.75, 6, 12), M.wool, -0.3, 0.17, 0.6 + i * 0.42); m.rotation.z = Math.PI / 2; fuzz(m, 220, 0.05, '#fffaf0', 50 + i); return m; });
    // 3 a drop spindle and a growing ball of yarn
    const spindle = new T.Group(); spindle.position.set(1.7, 0, 0.2); scene.add(spindle);
    blob(new T.CylinderGeometry(0.04, 0.03, 2.4, 10), M.wood, 0, 1.6, 0, spindle);
    blob(new T.CylinderGeometry(0.4, 0.4, 0.1, 24), M.wood, 0, 0.75, 0, spindle);
    const spun = blob(new T.CylinderGeometry(0.18, 0.12, 0.8, 16), M.teal, 0, 1.25, 0, spindle);
    const strand = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(1.7, 2.8, 0.2), new T.Vector3(1.2, 3.1, 0.4), new T.Vector3(0.2, 2.2, 0.8), new T.Vector3(-0.3, 0.4, 1.0)]), 40, 0.03, 6), M.teal); strand.castShadow = true; scene.add(strand);
    const ball = new T.Group(); ball.position.set(3.0, 0.45, 1.3); scene.add(ball);
    const ballCore = blob(new T.SphereGeometry(0.45, 20, 14), M.teal, 0, 0, 0, ball);
    for (let k = 0; k < 6; k++) { const ring = blob(new T.TorusGeometry(0.46, 0.022, 6, 40), felt('#4fb0b0'), 0, 0, 0, ball); ring.rotation.set(k * 0.6, k * 1.1, 0); }
    // 4 the jumper: a felt shape that knits up from the bottom, with stitched trims
    const jShape = new T.Shape([[-1.0, 0], [1.0, 0], [1.0, 1.7], [1.9, 1.2], [2.25, 1.75], [1.0, 2.6], [0.45, 2.6], [0.3, 2.35], [-0.3, 2.35], [-0.45, 2.6], [-1.0, 2.6], [-2.25, 1.75], [-1.9, 1.2], [-1.0, 1.7]].map(([x, y]) => new T.Vector2(x, y)));
    const knitPlane = new T.Plane(new T.Vector3(0, -1, 0), 0);
    const jMat = felt('#d9534a'); jMat.clippingPlanes = [knitPlane]; S.renderer.localClippingEnabled = true;
    const jumper = new T.Mesh(new T.ExtrudeGeometry(jShape, { depth: 0.18, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 4 }), jMat);
    jumper.castShadow = true; jMat.clipShadows = true; const jg = new T.Group(); jg.position.set(5.6, 0.05, -0.2); jg.rotation.x = -Math.PI / 2 + 0.95; jg.add(jumper); scene.add(jg);
    const stripes = [0.35, 0.7].map(y => { const m = new T.Mesh(new T.BoxGeometry(2.05, 0.12, 0.3), Object.assign(felt('#f4efe2'), { clippingPlanes: [knitPlane] })); m.position.set(0, y, 0.1); jg.add(m); return m; });
    const needles = [-1, 1].map(s => { const m = blob(new T.CylinderGeometry(0.035, 0.035, 2.6, 10), M.wood, 0, 0, 0.35, jg); m.rotation.z = Math.PI / 2 + s * 0.25; const k = blob(new T.SphereGeometry(0.08, 10, 8), M.sun, 1.3, 0, 0, m); k.position.set(0, 1.3, 0); return m; });
    // labels: felt patches with a stitched edge
    const patch = (txt, bg) => { const l = K.label(txt, { font: F, weight: 400, px: 64, color: '#2d2a26', bg, radius: 18, pad: 0.4, height: 0.46, lit: true }); const st = thread([[-l.userData.w / 2 + 0.08, -l.userData.h / 2 + 0.08, 0.02], [l.userData.w / 2 - 0.08, -l.userData.h / 2 + 0.08, 0.02], [l.userData.w / 2 - 0.08, l.userData.h / 2 - 0.08, 0.02], [-l.userData.w / 2 + 0.08, l.userData.h / 2 - 0.08, 0.02], [-l.userData.w / 2 + 0.08, -l.userData.h / 2 + 0.08, 0.02]].map(p => new T.Vector3(...p)), '#ffffff', 0.012); scene.remove(st); l.add(st); l.castShadow = true; return l; };
    const tags = this.beats.map((b, i) => { const l = patch(b.label, ['#f2c14e', '#9fd3e6', '#7fcaca', '#f4a29a'][i]); l.position.set([-4.6, -1.2, 2.1, 5.5][i], 0.32, 3.1); l.rotation.x = -Math.PI / 2 + 0.75; scene.add(l); return l; });
    const sunM = blob(new T.SphereGeometry(0.7, 24, 16), M.sun, 9.5, 5, -6); fuzz(sunM, 300, 0.1, '#f7d070', 90);
    const cr = K.rng(21); const cloudsBg = [0, 1, 2].map(i => { const g = new T.Group(); for (let k = 0; k < 4; k++) blob(new T.SphereGeometry(cr.range(0.4, 0.6), 16, 12), M.wool, k * 0.5, cr.range(0, 0.2), 0, g); g.position.set(-6 + i * 7, 5 + cr.range(-0.5, 0.5), -6); scene.add(g); return g; });
    const cam = K.camPath([
      { t: 0, pos: [-5.0, 5.0, 9.5], look: [-4.6, 1.0, 0.6] },
      { t: 2.7, pos: [-2.6, 5.4, 10.0], look: [-2.4, 0.9, 0.6] },
      { t: 5.4, pos: [1.0, 5.4, 10.0], look: [1.2, 1.0, 0.6] },
      { t: 8.1, pos: [4.2, 5.2, 9.6], look: [4.6, 1.0, 0.6] },
      { t: 11, pos: [0.7, 8.0, 16.0], look: [0.5, 0.6, 0.6] },
    ], S.camera);
    return (t, realT) => {
      cam(t);
      // shear: fleece shrinks, a cloud lifts off and rolls to the tub
      const shear = K.prog(t, 0.6, 2.2, 'inOut');
      fleece.scale.setScalar(1 - 0.45 * shear); fleece.position.y = -0.3 * shear * 0;
      shears.position.set(-5.4 + K.lerp(-0.6, 0.8, shear), 1.9 + 0.1 * Math.sin(realT * 12) * (shear > 0 && shear < 1 ? 1 : 0), 1.3); shears.rotation.set(0, 0.3, 0.2 * Math.sin(realT * 18) * (shear > 0 && shear < 1 ? 1 : 0));
      shears.visible = t < B[1] + 0.2;
      const lift = K.prog(t, 1.0, 2.4, 'out'), roll = K.prog(t, B[1], B[1] + 1.0, 'inOut'), dunk = K.prog(t, B[1] + 1.0, B[1] + 1.4, 'in');
      cloud.position.set(K.lerp(-5.4, -1.6, roll), K.lerp(1.6, 2.4, lift) * (1 - dunk) + 0.7 * dunk + 0.1 * Math.sin(realT * 2), K.lerp(0.6, -0.4, roll));
      cloud.scale.setScalar(Math.max(0.001, K.lerp(0.3, 1, lift) * (1 - K.prog(t, B[1] + 1.4, B[1] + 1.8))));
      bubbles.forEach((b, i) => { const on = K.prog(t, B[1] + 1.2, B[1] + 1.4) * (1 - K.prog(t, B[2] + 0.5, B[2] + 1)); const ph = (realT * 0.6 + i / 8) % 1; b.position.set(-1.6 + 0.6 * Math.cos(i * 2.4), 0.68 + ph * 0.9, -0.4 + 0.5 * Math.sin(i * 2.4)); b.scale.setScalar(on * (1 - ph) + 0.0001); });
      rolls.forEach((r, i) => { const p = K.prog(t, B[1] + 1.7 + i * 0.25, B[1] + 2.2 + i * 0.25, 'bounce'); r.visible = p > 0; r.position.x = K.lerp(-1.6, -0.3, p); r.position.y = 0.17 + (1 - p) * 0.7; r.rotation.x = p * 4; });
      // spin: the spindle turns, the yarn ball grows, the rolls get shorter
      const spin = K.prog(t, B[2], B[3], 'inOut');
      spindle.rotation.y = realT * 9 * (spin > 0 && spin < 1 ? 1 : 0.05); spun.scale.set(0.6 + 0.5 * spin, 1, 0.6 + 0.5 * spin);
      ball.scale.setScalar(0.35 + 0.65 * spin); ball.rotation.y = spin * 6;
      strand.visible = spin > 0.02 && spin < 0.98;
      rolls.forEach((r, i) => { r.scale.y = 1 - 0.8 * K.clamp(spin * 3 - i); });
      // knit: the jumper grows row by row from the bottom; needles click at the top edge
      const knit = K.prog(t, B[3] + 0.1, B[3] + 2.4);
      knitPlane.constant = -0.0 + knit * 2.8;
      jg.updateMatrixWorld();
      const n = new T.Vector3(0, -1, 0).transformDirection(jg.matrixWorld); const top = new T.Vector3(0, knit * 2.8, 0).applyMatrix4(jg.matrixWorld);
      knitPlane.setFromNormalAndCoplanarPoint(n, top);
      needles.forEach((m, i) => { m.position.set(0, knit * 2.8 + 0.05, 0.35); m.rotation.z = Math.PI / 2 + (i ? 1 : -1) * (0.25 + 0.12 * Math.sin(realT * 10)); m.visible = knit > 0 && knit < 1; });
      tags.forEach((l, i) => { const p = K.prog(t, B[i] + 0.15, B[i] + 0.6, 'back'); l.scale.setScalar(Math.max(0.001, p)); l.visible = p > 0; l.children[0].children.forEach(st => { st.visible = st.userData.i < K.prog(t, B[i] + 0.4, B[i] + 1.2); }); });
      cloudsBg.forEach((g, i) => { g.position.x = -6 + i * 7 + 0.4 * Math.sin(realT * 0.2 + i); });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.06 });
    k.play('pop', { t: 0.2, gain: 0.3, pitch: 0.8 });
    for (let i = 0; i < 8; i++) k.play('tick', { t: 0.7 + i * 0.18, gain: 0.25, pitch: 0.7 + (i % 2) * 0.2 });
    k.play('swish', { t: 1.0, gain: 0.25, pitch: 0.6, dur: 1.2 });
    k.play('whoosh', { t: B[1], gain: 0.2, pitch: 0.6, dur: 1.0 });
    k.play('splash', { t: B[1] + 1.3, gain: 0.35, pitch: 1.0 });
    for (let i = 0; i < 5; i++) k.play('bubble', { t: B[1] + 1.5 + i * 0.2, gain: 0.2, pitch: 0.9 + i * 0.1 });
    for (let i = 0; i < 3; i++) k.play('thud', { t: B[1] + 2.0 + i * 0.25, gain: 0.25, pitch: 1.4 });
    k.play('hum', { t: B[2], gain: 0.2, pitch: 2.0, dur: 2.5 });
    k.play('swish', { t: B[2] + 0.3, gain: 0.15, pitch: 1.4, dur: 2.0 });
    for (let i = 0; i < 12; i++) k.play('wood', { t: B[3] + 0.15 + i * 0.19, gain: 0.18, pitch: 1.6 + (i % 2) * 0.2 });
    k.play('chime', { t: B[3] + 2.5, gain: 0.25, pitch: 1.0, music: true });
    B.forEach(b => k.play('paper', { t: b + 0.2, gain: 0.2, pitch: 0.6 }));
  },
  post: null,
};
