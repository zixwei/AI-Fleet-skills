window.STYLES = window.STYLES || {};
STYLES['exploded-view'] = {
  id: 'exploded-view', name: 'Exploded View',
  family: 'Diagrams with depth',
  use: 'Explainer',
  look: 'One object floats above a pale seamless floor in soft, even studio light. Its parts separate along one axis, and each part gets a numbered callout with a thin leader line, like a technical manual.',
  motion: 'The object turns slowly, then pulls apart along its axis with a small settle. Callouts draw their lines out and their names type on. A moving part then shows how it works in place.',
  shownHere: 'What is inside a mechanical keyboard switch: keycap, top housing, stem, spring, contact leaves and bottom housing, and how 2 mm of travel closes the circuit.',
  goodFor: 'What is inside a product, a machine or a device: the names of the parts, their order, and how one part acts on the next.',
  fonts: ['IBM Plex Sans:wght@600;700', 'IBM Plex Mono:wght@600'],
  duration: 10,
  samples: 8,
  // CONTENT
  beats: [
    { t: 0.0, label: 'One key switch' },
    { t: 2.5, label: 'Six parts inside' },
    { t: 5.0, label: 'Press: the stem drives the spring down' },
    { t: 7.5, label: 'At 2 mm the leaves touch: key sent' },
  ],
  parts: ['Keycap', 'Top housing', 'Stem', 'Spring', 'Contact leaves', 'Bottom housing'],
  legend: 'A',
  travel: '4 mm travel  ·  2 mm to actuate',

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'IBM Plex Sans', FM = 'IBM Plex Mono';
    const BG = '#eeeeeb';
    scene.background = new T.Color(BG); scene.fog = new T.Fog(BG, 22, 45); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 5, target: [0, 2, 0] }); L.key.position.set(3, 12, 6); L.key.intensity = 2.2; L.amb.intensity = 1.3;
    const floor = new T.Mesh(new T.PlaneGeometry(80, 80), new T.MeshStandardMaterial({ color: BG, roughness: 1 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -1.2; floor.receiveShadow = true; scene.add(floor);
    const mat = (c, r, m = 0, o = {}) => new T.MeshPhysicalMaterial(Object.assign({ color: c, roughness: r, metalness: m }, o));
    const M = { cap: mat('#ecebe6', 0.7), housing: mat('#2b2d31', 0.45), top: mat('#3a3d44', 0.25, 0, { transparent: true, opacity: 0.82, clearcoat: 0.6 }), stem: mat('#e0322f', 0.4),
      spring: mat('#c9ced6', 0.22, 1), gold: mat('#f0c060', 0.3, 0.6), hi: mat('#2fa3ff', 0.4) };
    const add = (parent, geo, m, x = 0, y = 0, z = 0) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
    const plate = (w, d, hole, depth) => { // a square plate with a square hole, extruded upward
      const s = new T.Shape([new T.Vector2(-w / 2, -d / 2), new T.Vector2(w / 2, -d / 2), new T.Vector2(w / 2, d / 2), new T.Vector2(-w / 2, d / 2)]);
      if (hole) s.holes.push(new T.Path([new T.Vector2(-hole / 2, -hole / 2), new T.Vector2(-hole / 2, hole / 2), new T.Vector2(hole / 2, hole / 2), new T.Vector2(hole / 2, -hole / 2)]));
      return new T.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }).rotateX(-Math.PI / 2);
    };

    // parts, each in its own group; y0 = assembled height, y1 = exploded height
    const G = {}, mk = (name, y0, y1) => { const g = new T.Group(); g.userData = { y0, y1 }; scene.add(g); G[name] = g; return g; };
    // 1 keycap: a square frustum with a legend
    const cap = mk('Keycap', 1.55, 4.55);
    const capGeo = new T.CylinderGeometry(0.95, 1.25, 0.85, 4, 1).rotateY(Math.PI / 4); add(cap, capGeo, M.cap, 0, 0.42, 0);
    const legend = new T.Mesh(new T.PlaneGeometry(0.9, 0.9), new T.MeshBasicMaterial({ transparent: true, map: K.canvasTex(128, 128, g => { g.fillStyle = '#5b5e66'; g.font = `700 92px "${F}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(this.legend, 64, 70); }) }));
    legend.rotation.x = -Math.PI / 2; legend.position.y = 0.851; cap.add(legend);
    add(cap, new T.BoxGeometry(0.42, 0.5, 0.42), M.cap, 0, -0.15, 0);
    // 2 top housing: plate with a window, and a skirt
    const top = mk('Top housing', 0.62, 3.45);
    add(top, plate(1.55, 1.55, 0.62, 0.2), M.top, 0, 0.3, 0);
    [[0, 0.72], [0, -0.72], [0.72, 0], [-0.72, 0]].forEach(([x, z]) => add(top, new T.BoxGeometry(x ? 0.1 : 1.5, 0.42, x ? 1.5 : 0.1), M.top, x, 0.1, z));
    // 3 stem: a cross on a block with rails
    const stem = mk('Stem', 0.75, 2.45);
    add(stem, new T.BoxGeometry(0.5, 0.55, 0.5), M.stem, 0, 0.1, 0);
    add(stem, new T.BoxGeometry(0.42, 0.55, 0.12), M.stem, 0, 0.62, 0); add(stem, new T.BoxGeometry(0.12, 0.55, 0.42), M.stem, 0, 0.62, 0);
    [-1, 1].forEach(s => add(stem, new T.BoxGeometry(0.08, 0.5, 0.2), M.stem, s * 0.3, 0.05, 0));
    add(stem, new T.CylinderGeometry(0.12, 0.12, 0.4, 16), M.stem, 0, -0.35, 0);
    const leg = add(stem, new T.BoxGeometry(0.1, 0.45, 0.1), M.stem, -0.32, -0.35, 0.18);
    // 4 spring: a steel helix
    const spring = mk('Spring', 0.15, 1.3);
    const helix = new (class extends T.Curve { getPoint(u, out = new T.Vector3()) { return out.set(0.24 * Math.cos(u * 14 * Math.PI), u * 1.0, 0.24 * Math.sin(u * 14 * Math.PI)); } })();
    const springMesh = add(spring, new T.TubeGeometry(helix, 400, 0.028, 8), M.spring, 0, -0.1, 0);
    // 5 contact leaves: two gold strips, one bent
    const leaves = mk('Contact leaves', 0.1, 0.55);
    const leafA = add(leaves, new T.BoxGeometry(0.04, 0.75, 0.3), M.gold, -0.48, 0.2, 0.25);
    const leafBp = new T.Group(); leafBp.position.set(-0.36, -0.15, 0.25); leaves.add(leafBp);
    const leafB = add(leafBp, new T.BoxGeometry(0.04, 0.75, 0.3), M.gold, 0, 0.37, 0); leafBp.rotation.z = -0.22;
    // 6 bottom housing: a box with a centre post, pins and an LED slot
    const bot = mk('Bottom housing', 0, 0);
    add(bot, plate(1.55, 1.55, 0, 0.12), M.housing, 0, -0.42, 0);
    [[0, 0.72], [0, -0.72], [0.72, 0], [-0.72, 0]].forEach(([x, z]) => add(bot, new T.BoxGeometry(x ? 0.1 : 1.5, 0.55, x ? 1.5 : 0.1), M.housing, x, -0.05, z));
    add(bot, new T.CylinderGeometry(0.14, 0.14, 0.5, 16), M.housing, 0, -0.05, 0);
    [[-0.38, 0.3], [0.25, 0.42]].forEach(([x, z]) => add(bot, new T.CylinderGeometry(0.03, 0.03, 0.55, 8), M.gold, x, -0.72, z));
    add(bot, new T.CylinderGeometry(0.16, 0.16, 0.45, 20), M.housing, 0, -0.72, 0);
    add(bot, new T.BoxGeometry(0.3, 0.06, 0.14), mat('#111', 0.3), 0, 0.235, -0.55);
    const spark = new T.PointLight('#6fd0ff', 0, 3); spark.position.set(-0.4, 0.45, 0.6); leaves.add(spark);
    const glow = new T.Sprite(new T.SpriteMaterial({ color: '#8fe0ff', transparent: true, blending: T.AdditiveBlending, depthWrite: false, map: K.canvasTex(64, 64, g => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }) }));
    glow.position.set(-0.42, 0.5, 0.25); glow.scale.setScalar(0.9); leaves.add(glow);
    // the switch sits in a plate on a small stand: shadows on the floor give the float
    const stand = new T.Group(); stand.position.y = 0; scene.add(stand);

    // callouts: number badge, name, a leader line from the part to a column on the right
    const names = this.parts, order = ['Keycap', 'Top housing', 'Stem', 'Spring', 'Contact leaves', 'Bottom housing'];
    const callouts = order.map((name, i) => {
      const g = new T.Group(); scene.add(g);
      const badge = K.label(String(i + 1), { font: FM, weight: 600, px: 56, color: '#ffffff', bg: '#1f6feb', radius: 'pill', pad: 0.3, height: 0.3 });
      const txt = K.label(names[i], { font: F, weight: 700, px: 60, color: '#1b1d22', height: 0.34, align: 'left' });
      badge.position.x = 0.0; txt.position.x = 0.3 + txt.userData.w / 2; g.add(badge, txt);
      const lineGeo = new T.BufferGeometry().setFromPoints([new T.Vector3(), new T.Vector3()]);
      const line = new T.Line(lineGeo, new T.LineBasicMaterial({ color: '#1b1d22' })); scene.add(line);
      const dot = new T.Mesh(new T.SphereGeometry(0.045, 10, 8), new T.MeshBasicMaterial({ color: '#1b1d22' })); scene.add(dot);
      return { g, line, dot, name, i, badge, txt };
    });
    const travel = K.label(this.travel, { font: FM, weight: 600, px: 52, color: '#1f6feb', bg: '#ffffff', radius: 10, pad: 0.35, height: 0.3 }); scene.add(travel);
    const keyOut = K.label(this.legend, { font: F, weight: 700, px: 120, color: '#1f6feb', bg: '#ffffff', radius: 16, pad: 0.4, height: 0.9 }); scene.add(keyOut);
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 84, color: '#1b1d22', height: 0.46 });
      l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.78, -8); S.camera.add(l); return l; });

    const cam = K.camPath([
      { t: 0, pos: [4.2, 4.4, 7.2], look: [0, 0.8, 0] },
      { t: 2.5, pos: [5.4, 5.6, 11.5], look: [0.6, 1.9, 0] },
      { t: 5.0, pos: [6.0, 6.0, 14.0], look: [0.9, 2.35, 0] },
      { t: 10, pos: [4.8, 6.2, 14.8], look: [1.0, 2.4, 0] },
    ], S.camera);
    const V = new T.Vector3();

    return (t, realT) => {
      cam(t);
      const ex = K.prog(t, B[1], B[1] + 1.3, 'back');
      const spin = 0.5 * Math.sin(realT * 0.35) * 0.3 + K.lerp(0.0, -0.45, K.prog(t, 0, 3, 'inOut'));
      Object.values(G).forEach(g => { g.position.y = K.lerp(g.userData.y0, g.userData.y1, ex) + 0.04 * Math.sin(realT * 1.2 + g.userData.y1); g.rotation.y = spin; });
      G['Contact leaves'].position.x = -0.9 * ex; G['Contact leaves'].position.z = 0.6 * ex;
      // beat 3: the stem slides down 0.8 and squeezes the spring
      const press = K.prog(t, B[2] + 0.4, B[2] + 1.2, 'inOut') * (1 - K.prog(t, B[3] + 1.6, B[3] + 2.2, 'inOut'));
      G.Stem.position.y -= 0.8 * press;
      springMesh.scale.y = 1 - 0.38 * press; M.stem.emissive.set('#ff3b30'); M.stem.emissiveIntensity = 0.25 * press;
      // beat 4: the leaves close, a spark, the key appears
      const touch = K.prog(t, B[3] + 0.3, B[3] + 0.6, 'out') * (1 - K.prog(t, B[3] + 1.6, B[3] + 2.2));
      leafBp.rotation.z = K.lerp(-0.22, 0.14, touch);
      const flash = touch > 0.9 ? 1 : 0;
      spark.intensity = 4 * flash; glow.visible = flash > 0; glow.material.opacity = flash * (0.7 + 0.3 * Math.sin(realT * 20));
      M.gold.emissive.set('#ffb000'); M.gold.emissiveIntensity = 0.5 * flash;
      // callouts
      callouts.forEach(c => {
        const g = G[c.name], p = K.prog(t, B[1] + 0.9 + c.i * 0.18, B[1] + 1.4 + c.i * 0.18, 'out');
        g.updateMatrixWorld(); g.getWorldPosition(V);
        const from = V.clone().add(new T.Vector3(c.name === 'Contact leaves' ? -0.4 : 0.8, c.name === 'Keycap' ? 0.4 : 0.1, 0.2));
        const to = new T.Vector3(3.0, 4.7 - c.i * 0.9, 0.4);
        c.line.geometry.attributes.position.setXYZ(0, from.x, from.y, from.z);
        const end = from.clone().lerp(to, p); c.line.geometry.attributes.position.setXYZ(1, end.x, end.y, end.z); c.line.geometry.attributes.position.needsUpdate = true;
        c.line.visible = c.dot.visible = p > 0; c.dot.position.copy(from);
        c.g.position.copy(to).add(new T.Vector3(0.25, 0, 0)); c.g.visible = p > 0.95; c.g.lookAt(S.camera.position.x, c.g.position.y, S.camera.position.z);
        const hot = (c.name === 'Stem' || c.name === 'Spring') ? K.prog(t, B[2], B[2] + 0.3) * (1 - K.prog(t, B[3], B[3] + 0.3)) : c.name === 'Contact leaves' ? K.prog(t, B[3], B[3] + 0.3) : 0;
        c.badge.scale.setScalar(1 + 0.35 * hot);
        c.txt.scale.setScalar(1 + 0.12 * hot);
      });
      travel.visible = t > B[2] + 0.4; travel.position.set(-2.9, 2.9, 0.4); travel.lookAt(S.camera.position);
      travel.scale.setScalar(K.prog(t, B[2] + 0.4, B[2] + 0.7, 'back') + 0.001);
      const ko = K.prog(t, B[3] + 0.6, B[3] + 1.0, 'back'); keyOut.visible = ko > 0; keyOut.scale.setScalar(ko + 0.001); keyOut.position.set(-2.4, 0.6, 1.2); keyOut.lookAt(S.camera.position);
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.06 });
    k.play('click', { t: 0.4, gain: 0.35, pitch: 1.0 });
    k.play('whoosh', { t: B[1], gain: 0.3, pitch: 1.4, dur: 1.2 });
    for (let i = 0; i < 6; i++) { k.play('tick', { t: B[1] + 0.9 + i * 0.18, gain: 0.3, pitch: 1 + i * 0.05 }); k.play('blip', { t: B[1] + 1.4 + i * 0.18, gain: 0.12, pitch: 1.2 + i * 0.08 }); }
    k.play('swish', { t: B[2] + 0.4, gain: 0.25, pitch: 1.5, dur: 0.8 });
    k.play('metal', { t: B[2] + 1.15, gain: 0.2, pitch: 1.6 });
    k.play('click', { t: B[3] + 0.6, gain: 0.55, pitch: 1.1 });
    k.play('zap', { t: B[3] + 0.6, gain: 0.15, pitch: 2.5 });
    k.play('chime', { t: B[3] + 0.9, gain: 0.2, pitch: 1.4, music: true });
  },
  post: null,
};
