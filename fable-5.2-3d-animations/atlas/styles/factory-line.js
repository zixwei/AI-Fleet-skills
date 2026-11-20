window.STYLES = window.STYLES || {};
STYLES['factory-line'] = {
  id: 'factory-line', name: 'Factory Line',
  family: 'Machines that explain',
  use: 'Explainer',
  look: 'A toy-grade production line on a pale studio floor: rounded cobalt machine housings with large white labels, orange moving parts, a black rubber belt. Soft even studio light and short shadows.',
  motion: 'One item rides the belt from station to station. At each station a machine acts on it (a press, a scanner, an arm), and the item changes before it moves on.',
  shownHere: 'How a pull request ships: it is opened, reviewed, tested, merged into main and deployed live.',
  goodFor: 'Pipelines and workflows where one thing passes through a fixed series of steps and changes at each step: builds, orders, applications, manufacturing.',
  fonts: ['Rubik:wght@700;800'],
  duration: 12,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Open a pull request' },
    { t: 2.2, label: 'A teammate reviews it' },
    { t: 4.6, label: 'The tests run' },
    { t: 7.0, label: 'Merge into main' },
    { t: 9.4, label: 'Deploy: it is live' },
  ],
  item: 'PR #42',
  stations: ['REVIEW', 'TESTS', 'MERGE', 'DEPLOY'],
  sign: 'LIVE',

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Rubik';
    const C = { cobalt: '#2347c5', orange: '#ff7a1a', belt: '#24262b', floor: '#ebe8e3', white: '#ffffff', green: '#2fd27a' };
    scene.background = new T.Color('#dfe4ea'); scene.fog = new T.Fog('#dfe4ea', 26, 50); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 12, target: [0, 1, 0] }); L.key.position.set(-4, 12, 8);
    const mat = (c, r = 0.45, m = 0) => new T.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
    const M = { cobalt: mat(C.cobalt, 0.35), orange: mat(C.orange, 0.4), belt: mat(C.belt, 0.9), grey: mat('#9aa1ab', 0.5, 0.3), white: mat('#f6f6f2', 0.5) };
    const rbox = (w, h, d, r = 0.12) => {
      const s = new T.Shape(), x = -w / 2 + r, y = -h / 2 + r, W2 = w - 2 * r, H2 = h - 2 * r;
      s.moveTo(x, y - r); s.lineTo(x + W2, y - r); s.quadraticCurveTo(x + W2 + r, y - r, x + W2 + r, y); s.lineTo(x + W2 + r, y + H2); s.quadraticCurveTo(x + W2 + r, y + H2 + r, x + W2, y + H2 + r);
      s.lineTo(x, y + H2 + r); s.quadraticCurveTo(x - r, y + H2 + r, x - r, y + H2); s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
      const g = new T.ExtrudeGeometry(s, { depth: d - 2 * r, bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 4, curveSegments: 6 });
      g.translate(0, 0, -(d - 2 * r) / 2); return g;
    };
    const part = (geo, m, x, y, z, parent = scene) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; };
    const sign = (txt, h = 0.55, color = '#ffffff') => K.label(txt, { font: F, weight: 800, px: 96, color, height: h });

    // floor with painted lane lines
    const floorTex = K.canvasTex(1024, 1024, (g, r, w, h) => {
      g.fillStyle = C.floor; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(0,0,0,${r.range(0.01, 0.04)})`; g.fillRect(r() * w, r() * h, 3, 3); }
      g.fillStyle = '#f2c230'; g.fillRect(0, 380, w, 14); g.fillRect(0, 630, w, 14);
      for (let x = 0; x < w; x += 64) { g.fillStyle = '#2b2b2b'; g.beginPath(); g.moveTo(x, 380); g.lineTo(x + 20, 380); g.lineTo(x + 34, 394); g.lineTo(x + 14, 394); g.fill(); g.beginPath(); g.moveTo(x, 630); g.lineTo(x + 20, 630); g.lineTo(x + 34, 644); g.lineTo(x + 14, 644); g.fill(); }
    }, 2);
    floorTex.wrapS = T.RepeatWrapping; floorTex.repeat.set(4, 1);
    const floor = new T.Mesh(new T.PlaneGeometry(60, 16), new T.MeshStandardMaterial({ map: floorTex, roughness: 0.8 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const far = new T.Mesh(new T.PlaneGeometry(200, 200), mat('#e4e2dd', 0.9)); far.rotation.x = -Math.PI / 2; far.position.y = -0.01; far.receiveShadow = true; scene.add(far);

    // belt: rubber with moving ridges, on cobalt legs, with orange end rollers
    const beltTex = K.canvasTex(256, 64, (g, r, w, h) => { g.fillStyle = C.belt; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { g.fillStyle = '#3a3d44'; g.fillRect(x, 0, 5, h); } });
    beltTex.wrapS = T.RepeatWrapping; beltTex.repeat.set(24, 1);
    const X0 = -9.6, X1 = 8.2, BY = 1.0;
    part(new T.BoxGeometry(X1 - X0, 0.16, 1.7), new T.MeshStandardMaterial({ map: beltTex, roughness: 0.85 }), (X0 + X1) / 2, BY - 0.08, 0);
    part(rbox(X1 - X0 + 0.3, 0.32, 2.0, 0.08), M.cobalt, (X0 + X1) / 2, BY - 0.33, 0);
    for (let x = X0 + 0.6; x < X1; x += 2.2) [-0.8, 0.8].forEach(z => part(new T.CylinderGeometry(0.09, 0.09, 0.7, 12), M.grey, x, 0.33, z));
    [X0 - 0.05, X1 + 0.05].forEach(x => { const r = part(new T.CylinderGeometry(0.2, 0.2, 1.9, 24), M.orange, x, BY - 0.2, 0); r.rotation.x = Math.PI / 2; });

    // the item: a crate with its name, then a stamp, test lights and a cobalt wrap
    const crateTex = K.canvasTex(256, 256, (g, r, w, h) => {
      g.fillStyle = '#d7b98a'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#cfae7c' : '#dcc093'; g.fillRect(0, i * 64, w, 60); }
      g.strokeStyle = '#9a7a4c'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
      g.fillStyle = '#3b2c1b'; g.font = `800 58px "${F}"`; g.textAlign = 'center'; g.fillText('</>', w / 2, 112); g.font = `800 46px "${F}"`; g.fillText(this.item, w / 2, 178);
    }, 4);
    const item = new T.Group(); scene.add(item);
    const crate = part(rbox(1.0, 1.0, 1.0, 0.06), new T.MeshStandardMaterial({ map: crateTex, roughness: 0.7 }), 0, 0, 0, item);
    crate.geometry.computeBoundingBox();
    { const uv = crate.geometry.attributes.uv, p = crate.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) + 0.5, p.getY(i) + 0.5); }
    const stamp = new T.Mesh(new T.CircleGeometry(0.3, 32), new T.MeshBasicMaterial({ map: K.canvasTex(128, 128, (g, r, w, h) => {
      g.strokeStyle = '#1f9a55'; g.lineWidth = 9; g.beginPath(); g.arc(64, 64, 56, 0, 7); g.stroke(); g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(34, 66); g.lineTo(56, 88); g.lineTo(96, 40); g.stroke(); }), transparent: true }));
    stamp.rotation.x = -Math.PI / 2; stamp.position.y = 0.505; item.add(stamp);
    const leds = Array.from({ length: 5 }, (_, i) => part(new T.SphereGeometry(0.05, 12, 8), new T.MeshStandardMaterial({ color: '#555', emissive: C.green, emissiveIntensity: 0 }), -0.3 + i * 0.15, -0.36, 0.51, item));
    const wrap = part(rbox(1.08, 1.08, 1.08, 0.08), M.cobalt, 0, 0, 0, item);
    const ribbon = [part(new T.BoxGeometry(1.1, 1.1, 0.14), M.orange, 0, 0, 0, item), part(new T.BoxGeometry(0.14, 1.1, 1.1), M.orange, 0, 0, 0, item)];
    const bow = part(new T.TorusKnotGeometry(0.12, 0.04, 40, 8, 2, 3), M.orange, 0, 0.6, 0, item);

    // stations
    const SX = [-5.2, -1.2, 2.8, 6.9];
    const lamps = [];
    const stationSign = (i, x, y, z) => { const l = sign(this.stations[i], 0.5); l.position.set(x, y, z); scene.add(l); };
    // 1 review press
    [-1.0, 1.0].forEach(dx => part(rbox(0.5, 3.2, 0.6, 0.1), M.cobalt, SX[0] + dx, 1.6, -0.9));
    part(rbox(2.6, 0.9, 1.4, 0.15), M.cobalt, SX[0], 3.6, -0.3);
    stationSign(0, SX[0], 3.6, 0.42);
    const piston = part(new T.CylinderGeometry(0.16, 0.16, 1.2, 20), M.grey, SX[0], 2.6, 0);
    const pressPlate = part(rbox(0.8, 0.18, 0.8, 0.05), M.orange, SX[0], 2.05, 0);
    // 2 test arch with lamps and a scan bar
    [-1.0, 1.0].forEach(dx => part(rbox(0.45, 3.4, 0.45, 0.1), M.cobalt, SX[1] + dx, 1.7, -1.0));
    part(rbox(2.6, 0.75, 2.2, 0.15), M.cobalt, SX[1], 3.4, -0.1);
    stationSign(1, SX[1], 3.45, 1.02);
    const archLamps = Array.from({ length: 5 }, (_, i) => part(new T.SphereGeometry(0.1, 16, 10), new T.MeshStandardMaterial({ color: '#444', emissive: C.green, emissiveIntensity: 0 }), SX[1] - 0.9 + i * 0.45, 3.0, 0.98));
    const scan = part(new T.BoxGeometry(0.06, 1.3, 1.8), new T.MeshBasicMaterial({ color: C.orange, transparent: true, opacity: 0.55, depthWrite: false }), SX[1], 1.6, 0);
    // 3 merge arm next to a stack of blue "main" blocks
    const base = part(rbox(1.3, 1.0, 1.3, 0.15), M.cobalt, SX[2], 0.5, -1.9);
    stationSign(2, SX[2], 0.55, -1.22);
    const arm = new T.Group(); arm.position.set(SX[2], 1.0, -1.9); scene.add(arm);
    const upper = new T.Group(); arm.add(upper); part(new T.CylinderGeometry(0.3, 0.3, 0.3, 20), M.orange, 0, 0.15, 0, arm);
    part(rbox(0.32, 2.2, 0.32, 0.1), M.orange, 0, 1.1, 0, upper);
    const fore = new T.Group(); fore.position.y = 2.2; upper.add(fore);
    part(new T.SphereGeometry(0.24, 16, 12), M.grey, 0, 0, 0, fore); part(rbox(0.28, 1.6, 0.28, 0.1), M.orange, 0, 0.8, 0, fore);
    const claw = part(rbox(0.7, 0.14, 0.4, 0.05), M.grey, 0, 1.65, 0, fore);
    const mainStack = new T.Group(); mainStack.position.set(SX[2] + 2.0, 0, -2.1); scene.add(mainStack);
    for (let i = 0; i < 4; i++) part(rbox(1.0, 0.5, 1.0, 0.08), [M.cobalt, mat('#3a63e0', 0.35)][i % 2], 0, 0.25 + i * 0.52, 0, mainStack);
    const mainTag = sign('main', 0.42, '#2347c5'); mainTag.position.set(0, 2.55, 0.0); mainStack.add(mainTag);
    // 4 deploy: a truck under a LIVE sign
    const truck = new T.Group(); scene.add(truck);
    part(rbox(1.2, 1.1, 1.5, 0.15), M.cobalt, 1.2, 0.85, 0, truck); part(rbox(2.0, 0.3, 1.6, 0.08), M.orange, -0.4, 0.45, 0, truck);
    part(new T.BoxGeometry(0.06, 0.4, 1.4), mat('#a8d8ff', 0.1, 0.2), 1.83, 1.05, 0, truck);
    [[-0.9, 0.75], [-0.9, -0.75], [1.1, 0.75], [1.1, -0.75]].forEach(([x, z]) => { const w = part(new T.CylinderGeometry(0.3, 0.3, 0.22, 20), M.belt, x, 0.3, z, truck); w.rotation.x = Math.PI / 2; });
    const tSign = sign(this.stations[3], 0.32); tSign.position.set(1.2, 0.95, 0.77); truck.add(tSign);
    const liveFrame = part(rbox(3.4, 1.5, 0.4, 0.15), M.cobalt, 10.3, 3.4, -1.0);
    const liveTex = sign(this.sign, 1.0, '#ffffff'); liveTex.position.set(10.3, 3.4, -0.78); scene.add(liveTex);
    const liveGlow = new T.PointLight('#7dffb0', 0, 8); liveGlow.position.set(10.3, 3.8, 0.6); scene.add(liveGlow);
    [9.0, 11.6].forEach(x => part(new T.CylinderGeometry(0.1, 0.1, 2.8, 12), M.grey, x, 1.4, -1.0));
    [[SX[0] + 0.9, 4.15, -0.3], [SX[1] + 0.9, 3.87, -0.1], [SX[2] + 0.4, 1.1, -1.6], [10.3, 4.25, -1.0]].forEach(p => lamps.push(part(new T.SphereGeometry(0.14, 16, 10), new T.MeshStandardMaterial({ color: '#555', emissive: C.green, emissiveIntensity: 0 }), ...p)));
    // queue of other pull requests, cones and a pallet
    for (let i = 0; i < 3; i++) { const c = part(rbox(0.8, 0.8, 0.8, 0.05), new T.MeshStandardMaterial({ map: crateTex, roughness: 0.7 }), -11.4 + (i % 2) * 0.9, 0.55 + Math.floor(i / 2) * 0.82, -1.0); c.rotation.y = 0.1 * i; }
    part(new T.BoxGeometry(2.0, 0.15, 1.4), mat('#b08955', 0.8), -11.0, 0.08, -1.0);
    [[-7.6, 1.6], [0.8, 1.7], [4.9, 1.6], [8.6, 1.7]].forEach(([x, z]) => { part(new T.ConeGeometry(0.22, 0.6, 16), M.orange, x, 0.3, z); part(new T.BoxGeometry(0.5, 0.05, 0.5), M.orange, x, 0.025, z); });

    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 800, px: 92, color: '#ffffff', stroke: '#1b2d7a', strokeWidth: 12, height: 0.52 });
      l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.68, -8); S.camera.add(l); return l; });

    // item timeline (x on the belt)
    const legs = [[B[1] + 0.1, B[1] + 0.8, -8.4, SX[0]], [B[2] + 0.1, B[2] + 0.8, SX[0], SX[1]], [B[3] + 0.1, B[3] + 0.7, SX[1], SX[2]], [B[4] + 0.05, B[4] + 0.6, SX[2], X1 - 0.3]];
    const itemX = t => { let x = legs[0][2]; for (const [a, b, x0, x1] of legs) if (t >= a) x = K.lerp(x0, x1, K.prog(t, a, b, 'inOut')); return x; };
    const truckX = t => K.lerp(X1 + 1.2, 10.8, K.prog(t, B[4] + 1.15, B[4] + 2.0, 'inOut'));
    const cam = t => {
      const focus = t < B[4] + 1.0 ? itemX(t) : K.lerp(itemX(t), truckX(t), K.prog(t, B[4] + 1.0, B[4] + 1.6, 'inOut'));
      const wide = 1 - K.prog(t, 0.5, B[1] + 0.3, 'inOut'), endW = K.prog(t, B[4] + 1.2, 12, 'inOut');
      const fx = K.lerp(focus + 1.2, -3.2, wide) + endW * 0.2;
      S.camera.position.set(fx + 0.6, K.lerp(4.4, 5.6, wide) + endW * 0.5, K.lerp(10.0, 14.0, wide) + endW * 2.2);
      const look = new T.Vector3(K.lerp(focus + 0.8, -2.8, wide) + endW * 0.2, K.lerp(1.9, 1.6, wide) + endW * 0.2, 0);
      S.camera.lookAt(look); S.camera.userData.look = look;
    };

    return (t, realT) => {
      cam(t);
      const x = itemX(t), moving = legs.some(([a, b]) => t > a && t < b);
      beltTex.offset.x = -(x - legs[0][2]) / (X1 - X0) * 24;
      // review press
      const press = K.prog(t, B[1] + 0.9, B[1] + 1.15, 'in') * (1 - K.prog(t, B[1] + 1.35, B[1] + 1.8, 'inOut'));
      pressPlate.position.y = 3.05 - 1.0 * press; piston.scale.y = 1; piston.position.y = 3.05 - 0.5 * press + 0.05;
      stamp.visible = t > B[1] + 1.15; stamp.scale.setScalar(stamp.visible ? 1 : 0.001);
      // tests
      const sc = K.prog(t, B[2] + 0.9, B[2] + 2.0);
      scan.visible = sc > 0 && sc < 1; scan.position.x = SX[1] - 0.6 + 1.2 * ((sc * 3) % 1);
      leds.forEach((l, i) => { l.material.emissiveIntensity = t > B[2] + 1.0 + i * 0.2 ? 2 : 0; });
      archLamps.forEach((l, i) => { l.material.emissiveIntensity = t > B[2] + 1.0 + i * 0.2 ? 2.5 : 0; });
      // merge: the arm lifts the item, wraps it and puts it back
      const reach = K.prog(t, B[3] + 0.8, B[3] + 1.1, 'inOut') * (1 - K.prog(t, B[3] + 1.9, B[3] + 2.2, 'inOut'));
      const lift = K.prog(t, B[3] + 1.1, B[3] + 1.4, 'inOut') * (1 - K.prog(t, B[3] + 1.7, B[3] + 1.95, 'inOut'));
      arm.rotation.y = 0.0; upper.rotation.x = K.lerp(-0.15, 0.62, reach) - 0.12 * lift; fore.rotation.x = K.lerp(0.3, 1.05, reach) - 0.25 * lift;
      const wrapP = K.prog(t, B[3] + 1.35, B[3] + 1.7, 'back');
      wrap.visible = wrapP > 0; wrap.scale.setScalar(Math.max(0.001, wrapP));
      ribbon.forEach(r => { r.visible = wrapP > 0.6; }); bow.visible = wrapP > 0.8; bow.rotation.y = realT;
      mainStack.children.forEach((c, i) => { if (c.material && c.material.emissive) { c.material.emissive.set('#4f7dff'); c.material.emissiveIntensity = 0.0; } });
      // deploy: off the belt end into the truck, which drives under the LIVE sign
      let ix = x, iy = BY + 0.5 + lift * 1.3, iz = 0, rot = lift * Math.PI;
      const drop = K.prog(t, B[4] + 0.55, B[4] + 0.95, 'bounce');
      truck.position.set(truckX(t), 0, 0);
      if (t > B[4] + 0.55) { ix = K.lerp(X1 - 0.3, truck.position.x - 0.4, drop); iy = K.lerp(BY + 0.5, 1.12, drop); }
      if (t > B[4] + 0.95) ix = truck.position.x - 0.4;
      item.position.set(ix, iy, iz); item.rotation.set(0, rot, moving ? 0.02 * Math.sin(realT * 30) : 0);
      const live = K.prog(t, B[4] + 1.8, B[4] + 2.1);
      liveTex.material.color.set(live > 0.5 ? '#7dffb0' : '#ffffff'); liveGlow.intensity = 6 * live * (0.9 + 0.1 * Math.sin(realT * 8));
      lamps.forEach((l, i) => { l.material.emissiveIntensity = t > [B[1] + 1.3, B[2] + 2.0, B[3] + 1.9, B[4] + 1.8][i] ? 2.5 : 0; });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('machine', { gain: 0.08 });
    k.play('blip', { t: 0.3, gain: 0.3, pitch: 1.2 });
    [B[1], B[2], B[3], B[4]].forEach((b, i) => k.play('hum', { t: b + 0.1, gain: 0.25, pitch: 1.2, dur: 0.7 }));
    k.play('thud', { t: B[1] + 1.15, gain: 0.6, pitch: 0.9 }); k.play('metal', { t: B[1] + 1.16, gain: 0.25, pitch: 0.8 });
    for (let i = 0; i < 5; i++) k.play('blip', { t: B[2] + 1.0 + i * 0.2, gain: 0.25, pitch: 1 + i * 0.12 });
    k.play('zap', { t: B[2] + 0.9, gain: 0.12, pitch: 2.0 });
    k.play('whoosh', { t: B[3] + 0.8, gain: 0.25, pitch: 1.2, dur: 0.8 });
    k.play('paper', { t: B[3] + 1.4, gain: 0.4 }); k.play('pop', { t: B[3] + 1.65, gain: 0.35, pitch: 1.3 });
    k.play('thud', { t: B[4] + 0.75, gain: 0.45, pitch: 1.2 });
    k.play('rumble', { t: B[4] + 1.1, gain: 0.25, pitch: 1.6, dur: 0.9 });
    k.play('chime', { t: B[4] + 1.85, gain: 0.3, pitch: 1.0, music: true });
    k.play('sparkle', { t: B[4] + 1.9, gain: 0.25 });
  },
  post: null,
};
