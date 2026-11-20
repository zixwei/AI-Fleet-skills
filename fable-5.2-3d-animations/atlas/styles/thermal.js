window.STYLES = window.STYLES || {};
STYLES['thermal'] = {
  id: 'thermal', name: 'Thermal Camera',
  family: 'Filters over 3D',
  use: 'Explainer',
  look: 'A heat-camera view: every surface shows its temperature in an iron-bow palette from black and violet through red and orange to white. Sensor noise, a crosshair with a reading, and a temperature scale at the side.',
  motion: 'The camera drifts like a handheld scanner. Heat spreads out of the leaks, the crosshair moves to each hot spot, and at the end the leaks cool down and fade.',
  shownHere: 'Where a house loses heat on a cold night: through the windows, through the roof, and through gaps around the doors; sealed and insulated, the leaks fade.',
  goodFor: 'Energy, heat, activity and hot spots: anything that can be shown as a value on a surface, like usage, risk or attention.',
  fonts: ['Share Tech Mono'],
  duration: 11,
  samples: 1,
  // CONTENT: temperatures in °C on the scale -5 .. 25
  beats: [
    { t: 0.0, label: 'A house on a cold night' },
    { t: 2.7, label: 'Windows leak the most heat' },
    { t: 5.4, label: 'Warm air escapes through the roof' },
    { t: 8.1, label: 'Seal and insulate: the leaks fade' },
  ],
  readings: ['-3 °C', '14 °C', '11 °C', '2 °C'],
  scale: ['25 °C', '-5 °C'],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Share Tech Mono';
    scene.background = new T.Color(0.02, 0.02, 0.02); scene.add(S.camera);
    // every material shows a temperature as grey: 0 = -5 °C, 1 = 25 °C
    const temp = v => new T.MeshBasicMaterial({ color: new T.Color(v, v, v) });
    const M = { ground: temp(0.1), wall: temp(0.2), roof: temp(0.32), win: temp(0.35), door: temp(0.24), frame: temp(0.3), chim: temp(0.75), tree: temp(0.08), car: temp(0.2) };
    const ground = new T.Mesh(new T.PlaneGeometry(60, 40), M.ground); ground.rotation.x = -Math.PI / 2; scene.add(ground);
    const house = new T.Group(); scene.add(house);
    const body = new T.Mesh(new T.BoxGeometry(6, 3.2, 4.4), M.wall); body.position.y = 1.6; house.add(body);
    const roofShape = new T.Shape([new T.Vector2(-3.4, 0), new T.Vector2(3.4, 0), new T.Vector2(0, 2.2)]);
    const roofGeo = new T.ExtrudeGeometry(roofShape, { depth: 4.8, bevelEnabled: false }); roofGeo.translate(0, 0, -2.4);
    // the roof carries a heat map that grows: a canvas of warm patches
    const roofHeat = K.canvasTex(512, 256, (g, r, w, h) => { g.fillStyle = '#4a4a4a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 9; i++) { const gr = g.createRadialGradient(r() * w, r.range(0.2, 0.9) * h, 0, r() * w, r.range(0.2, 0.9) * h, r.range(40, 110)); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(w * 0.48, 0, w * 0.04, h); });
    roofHeat.colorSpace = T.NoColorSpace;
    const roofMat = new T.MeshBasicMaterial({ color: new T.Color(0.4, 0.4, 0.4), map: roofHeat });
    { const uv = roofGeo.attributes.uv, p = roofGeo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getZ(i) + 2.4) / 4.8, p.getY(i) / 2.2); }
    const roof = new T.Mesh(roofGeo, roofMat); roof.position.y = 3.2; house.add(roof);
    const chim = new T.Mesh(new T.BoxGeometry(0.6, 1.6, 0.6), M.chim); chim.position.set(1.6, 4.6, -0.6); house.add(chim);
    // windows with frames, and a door; their temperatures change with the story
    const wins = [[-1.8, 2.2], [1.8, 2.2], [-1.8, 0.9], [1.8, 0.9]].map(([x, y]) => { const m = new T.Mesh(new T.PlaneGeometry(1.1, 0.9), temp(0.35)); m.position.set(x, y, 2.21); house.add(m); const f = new T.Mesh(new T.PlaneGeometry(1.3, 1.1), temp(0.4)); f.position.set(x, y, 2.205); house.add(f); return { m, f }; });
    const door = new T.Mesh(new T.PlaneGeometry(1.0, 2.0), M.door); door.position.set(0, 1.0, 2.21); house.add(door);
    const doorGap = new T.Mesh(new T.PlaneGeometry(1.16, 2.12), temp(0.35)); doorGap.position.set(0, 1.06, 2.205); house.add(doorGap);
    // surroundings: trees, a car, a fence, all cold
    const tr = K.rng(5);
    [[-7, -3], [7.5, -2.5], [-9, 2], [9, 3], [-5, -7], [6, -8]].forEach(([x, z]) => { const t1 = new T.Mesh(new T.ConeGeometry(1.2, 3.5, 8), M.tree); t1.position.set(x, 1.75, z); scene.add(t1); });
    const car = new T.Mesh(new T.BoxGeometry(3.6, 1.2, 1.7), M.car); car.position.set(6.2, 0.6, 4.6); scene.add(car);
    const engine = new T.Mesh(new T.BoxGeometry(1.0, 0.6, 1.5), temp(0.45)); engine.position.set(7.6, 0.75, 4.6); scene.add(engine);
    for (let i = 0; i < 14; i++) { const p = new T.Mesh(new T.BoxGeometry(0.12, 1.0, 0.12), temp(0.15)); p.position.set(-8 + i * 1.2, 0.5, 6.5); scene.add(p); }
    // a person walking past: warm
    const person = new T.Group(); const pb = new T.Mesh(new T.CapsuleGeometry(0.28, 1.1, 4, 8), temp(0.85)); pb.position.y = 0.9; const ph = new T.Mesh(new T.SphereGeometry(0.22, 12, 8), temp(0.95)); ph.position.y = 1.75; person.add(pb, ph); scene.add(person);
    // overlay: reading, scale numbers, title (white = hot colour in the palette; that is fine)
    const reads = this.readings.map(r => { const l = K.label(r, { font: F, weight: 400, px: 72, color: '#ffffff', height: 0.26 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0.0, -0.5, -8); S.camera.add(l); return l; });
    this.scale.forEach((s, i) => { const l = K.label(s, { font: F, weight: 400, px: 56, color: '#ffffff', height: 0.2 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(3.75, i ? -1.5 : 1.5, -8); S.camera.add(l); });
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 400, px: 80, color: '#ffffff', height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(-0.4, 1.8, -8); S.camera.add(l); return l; });
    const aim = [[0, 2.2, 3], [1.8, 2.2, 2.2], [0, 4.4, 0.8], [0, 1.2, 2.2]];
    const look = new T.Vector3(), aimV = new T.Vector3();
    return (t, realT) => {
      // handheld drift; the view centres on the point being measured
      let k = 0; for (let i = 1; i < 4; i++) if (t >= B[i]) k = i;
      const prev = aim[Math.max(0, k - 1)], cur = aim[k], u = K.prog(t, B[k], B[k] + 0.8, 'inOut');
      aimV.set(K.lerp(prev[0], cur[0], u), K.lerp(prev[1], cur[1], u), K.lerp(prev[2], cur[2], u));
      S.camera.position.set(aimV.x * 0.4 + 3.0 + 0.1 * Math.sin(realT * 1.3), 3.4 + 0.08 * Math.sin(realT * 1.7), 14 - 1.5 * K.prog(t, B[1], B[2]) + 1.5 * K.prog(t, B[3], B[3] + 1));
      look.copy(aimV).add(new T.Vector3(0.04 * Math.sin(realT * 2.1), 0.04 * Math.sin(realT * 1.9), 0)); S.camera.lookAt(look); S.camera.userData.look = look.clone();
      const leak = 1 - K.prog(t, B[3] + 0.4, B[3] + 2.0, 'inOut');
      const winT = 0.3 + 0.42 * K.prog(t, B[1] - 0.2, B[1] + 0.8) * leak; wins.forEach(({ m, f }, i) => { m.material.color.setScalar(winT + 0.03 * Math.sin(realT * 2 + i)); f.material.color.setScalar(winT + 0.12 * leak * K.prog(t, B[1], B[1] + 1)); });
      roofMat.color.setScalar(0.45 + 0.55 * K.prog(t, B[2] - 0.2, B[2] + 1.4) * leak);
      doorGap.material.color.setScalar(0.35 + 0.35 * K.prog(t, B[1] + 1.0, B[2]) * leak);
      chim.material.color.setScalar(0.75 + 0.05 * Math.sin(realT * 3));
      person.position.set(-8 + ((realT * 0.9) % 18), 0, 5.2); person.rotation.y = Math.PI / 2;
      reads.forEach((l, i) => { l.visible = i === k; });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.08 }); k.bed('night', { gain: 0.04 });
    k.play('hum', { t: 0.1, gain: 0.06, pitch: 2.5, dur: 10.5 });
    B.forEach((b, i) => { k.play('blip', { t: b + 0.8, gain: 0.25, pitch: 1.2 + i * 0.1 }); k.play('tick', { t: b + 0.82, gain: 0.2, pitch: 1.5 }); });
    k.play('swish', { t: B[2] + 0.2, gain: 0.15, pitch: 0.8, dur: 1.5 });
    k.play('riser', { t: B[3] + 0.4, gain: 0.08, pitch: 0.5, dur: 1.6 });
    k.play('chime', { t: B[3] + 2.0, gain: 0.18, pitch: 0.9, music: true });
  },
  // post pass: grey temperature to iron-bow colours, sensor noise, crosshair and scale
  post: {
    fragment: `
      float h21(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      vec3 iron(float x){ x = clamp(x, 0.0, 1.0);
        vec3 c0 = vec3(0.0, 0.0, 0.02), c1 = vec3(0.18, 0.02, 0.42), c2 = vec3(0.62, 0.05, 0.45), c3 = vec3(0.95, 0.3, 0.05), c4 = vec3(1.0, 0.75, 0.1), c5 = vec3(1.0, 1.0, 0.85);
        if (x < 0.2) return mix(c0, c1, x / 0.2); if (x < 0.4) return mix(c1, c2, (x - 0.2) / 0.2); if (x < 0.6) return mix(c2, c3, (x - 0.4) / 0.2); if (x < 0.8) return mix(c3, c4, (x - 0.6) / 0.2); return mix(c4, c5, (x - 0.8) / 0.2); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes; float v = 0.0;
        for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) v += texture2D(tColor, uv + vec2(float(i), float(j)) * px * 2.0).r;
        v /= 9.0; v += (h21(floor(uv * uRes / 2.0) + fract(uTime * 13.0) * 50.0) - 0.5) * 0.04;
        vec3 c = iron(v);
        vec2 d = (uv - 0.5) * uRes; float cross = (abs(d.x) < 1.5 && abs(d.y) > 12.0 && abs(d.y) < 60.0) || (abs(d.y) < 1.5 && abs(d.x) > 12.0 && abs(d.x) < 60.0) ? 1.0 : 0.0;
        float box = (abs(abs(d.x) - 90.0) < 1.5 && abs(d.y) < 90.0) || (abs(abs(d.y) - 90.0) < 1.5 && abs(d.x) < 90.0) ? 1.0 : 0.0;
        c = mix(c, vec3(1.0), max(cross, box * 0.7));
        if (uv.x > 0.94 && uv.x < 0.96 && uv.y > 0.2 && uv.y < 0.8) c = iron((uv.y - 0.2) / 0.6);
        vec2 vv = uv - 0.5; c *= 1.0 - dot(vv, vv) * 0.8;
        return vec4(c * 1.7, 1.0);
      }`,
  },
};
