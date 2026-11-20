window.STYLES = window.STYLES || {};
STYLES['shadow-puppets'] = {
  id: 'shadow-puppets', name: 'Shadow Puppets',
  family: 'Living and elemental',
  use: 'Story',
  look: 'A cloth screen in a carved wooden frame, lit from behind by one flame. Flat puppets on rods cast soft-edged shadows on the warm cloth, and the weave of the cloth shows through. Dark room, heads of the audience in the foreground.',
  motion: 'Puppets slide across on their rods; joints swing and wheels turn. A puppet that moves toward the flame casts a bigger shadow. The flame flickers, and the captions are cut-out letters that drop in on rods.',
  shownHere: 'How the Trojan horse trick worked: the Greeks leave a wooden horse, Troy pulls it inside the walls, soldiers climb out at night, and they open the gates to the army.',
  goodFor: 'Myths, legends, history and fables: stories with characters and a turn. The shadow size can show threat, power or distance.',
  fonts: ['Cinzel:wght@900'],
  duration: 11,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'A GIFT HORSE' },
    { t: 2.7, label: 'TROY PULLS IT IN' },
    { t: 5.4, label: 'NIGHT: THEY CLIMB OUT' },
    { t: 8.1, label: 'THE GATES OPEN' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Cinzel';
    scene.background = new T.Color('#050403'); scene.add(S.camera);
    const SW = 9.0, SH = 5.0, SY = 1.2, LZ = -6.5, LY = SY + SH * 0.42;
    // ---- the shadow side: puppets rendered black from the flame, into a target that the screen samples
    const shadowScene = new T.Scene();
    const lightCam = new T.PerspectiveCamera(2 * Math.atan(SH / 2 / -LZ) * 180 / Math.PI, SW / SH, 0.05, 20);
    const RW = 1024, RH = Math.round(RW * SH / SW), rt = S.own(new T.WebGLRenderTarget(RW, RH));
    const ink = S.own(new T.MeshBasicMaterial({ color: '#000000', side: T.DoubleSide }));
    const shp = pts => new T.ShapeGeometry(new T.Shape(pts.map(([x, y]) => new T.Vector2(x, y))));
    const mesh = (geo, parent) => { const m = new T.Mesh(geo, ink); parent.add(m); return m; };
    const rod = (parent, x, y, len = 4) => { const r = mesh(new T.PlaneGeometry(0.035, len), parent); r.position.set(x, y - len / 2, 0); return r; };
    const circle = (r, holes = 0) => { const s = new T.Shape(); s.absarc(0, 0, r, 0, Math.PI * 2); if (holes) for (let i = 0; i < holes; i++) { const h = new T.Path(), a = i / holes * 6.283; h.absarc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.22, 0, 6.283, true); s.holes.push(h); } return new T.ShapeGeometry(s, 24); };
    // the horse on a wheeled platform, with a hatch in its belly
    const horse = new T.Group(); shadowScene.add(horse);
    mesh(shp([[-1.2, 0.6], [0.95, 0.6], [1.08, 0.8], [1.1, 1.2], [1.2, 1.6], [1.38, 2.0], [1.86, 1.82], [1.98, 1.95], [1.8, 2.24], [1.55, 2.36], [1.5, 2.6], [1.4, 2.4], [1.26, 2.32], [1.18, 2.12], [1.05, 2.05], [1.08, 1.92], [0.92, 1.8], [0.95, 1.66], [0.78, 1.55], [0.7, 1.42], [-1.0, 1.42], [-1.25, 1.32], [-1.35, 1.15], [-1.72, 0.7], [-1.58, 0.66], [-1.32, 0.95], [-1.25, 0.8]]), horse);
    [[-1.0, 0.3], [-0.6, 0.3], [0.65, 0.3], [1.0, 0.3]].forEach(([x]) => mesh(shp([[x - 0.09, 0.0], [x + 0.09, 0.0], [x + 0.07, 0.62], [x - 0.07, 0.62]]), horse));
    mesh(shp([[-1.6, -0.1], [1.5, -0.1], [1.5, 0.05], [-1.6, 0.05]]), horse);
    const wheels = [-1.2, 1.1].map(x => { const w = mesh(circle(0.28, 5), horse); w.position.set(x, -0.25, 0); return w; });
    const hatch = new T.Group(); hatch.position.set(-0.1, 0.62, 0); horse.add(hatch);
    const hatchM = mesh(shp([[0, 0], [0.6, 0], [0.6, -0.05], [0, -0.05]]), hatch);
    const hole = mesh(shp([[-0.1, 0.62], [0.5, 0.62], [0.5, 0.64], [-0.1, 0.64]]), horse);
    rod(horse, 0.2, -0.3, 4); rod(horse, -1.0, -0.3, 4);
    // the walls of Troy with a tower and two gate doors
    const walls = new T.Group(); shadowScene.add(walls);
    const wallPts = [[0, 0], [0, 2.6]]; for (let i = 0; i < 9; i++) wallPts.push([i * 0.32, 2.6], [i * 0.32, 2.85], [i * 0.32 + 0.16, 2.85], [i * 0.32 + 0.16, 2.6]);
    wallPts.push([2.9, 2.6], [2.9, 0], [2.35, 0], [2.35, 1.7], [0.55, 1.7], [0.55, 0]);
    mesh(shp(wallPts), walls);
    mesh(shp([[2.7, 0], [2.7, 3.6], [2.6, 3.6], [2.6, 3.85], [2.75, 3.85], [2.75, 3.6], [2.95, 3.6], [2.95, 3.85], [3.1, 3.85], [3.1, 3.6], [3.3, 3.6], [3.3, 3.85], [3.45, 3.85], [3.45, 3.6], [3.35, 3.6], [3.35, 0]]), walls);
    const doors = [0, 1].map(i => { const g = new T.Group(); g.position.set(i ? 2.35 : 0.55, 0, 0); walls.add(g); const d = mesh(shp([[0, 0], [0.9, 0], [0.9, 1.65], [0, 1.65]]), g); d.scale.x = i ? -1 : 1; return g; });
    rod(walls, 1.5, 0, 3);
    // people: Trojans who pull, Greek soldiers with spear and shield
    const figure = (spear) => {
      const g = new T.Group();
      mesh(shp([[-0.12, 0.45], [0.12, 0.45], [0.14, 1.0], [-0.14, 1.0]]), g);
      const head = mesh(circle(0.13), g); head.position.y = 1.15;
      if (spear) { mesh(shp([[-0.15, 1.27], [0.15, 1.27], [0.05, 1.48], [-0.08, 1.42]]), g); const sp = mesh(new T.PlaneGeometry(0.04, 1.8), g); sp.position.set(0.25, 0.9, 0); mesh(shp([[0.2, 1.8], [0.3, 1.8], [0.25, 2.0]]), g); const sh = mesh(circle(0.26), g); sh.position.set(-0.12, 0.75, 0); }
      const legs = [-1, 1].map(s => { const p = new T.Group(); p.position.y = 0.5; g.add(p); mesh(shp([[-0.05, 0], [0.05, 0], [0.06, -0.5], [-0.06, -0.5]]), p); return p; });
      rod(g, 0, 0.0, 3.5);
      g.userData.legs = legs; shadowScene.add(g); return g;
    };
    const pullers = [0, 1, 2].map(() => figure(false));
    const rope = mesh(new T.PlaneGeometry(1, 0.03), shadowScene);
    const climbers = [0, 1, 2].map(() => figure(true));
    const army = [0, 1, 2, 3, 4].map(() => figure(true));
    // a palm and a few stars of scenery
    const palm = new T.Group(); shadowScene.add(palm);
    mesh(shp([[-0.06, 0], [0.06, 0], [0.12, 2.0], [0.0, 2.05]]), palm);
    for (let i = 0; i < 6; i++) { const f = new T.Group(); f.position.set(0.06, 2.0, 0); f.rotation.z = -1.2 + i * 0.5; palm.add(f); mesh(shp([[0, -0.04], [0.9, -0.15], [0.95, -0.1], [0, 0.04]]), f); }
    rod(palm, 0, 0, 3);
    // inside the city: a row of houses
    const houses = new T.Group(); shadowScene.add(houses);
    [[-4.2, 1.1, 0.9], [-3.1, 0.8, 1.3], [-2.0, 1.0, 1.0], [2.6, 0.9, 1.2], [3.6, 1.2, 0.8]].forEach(([x, w, h]) => mesh(shp([[x, 0], [x + w, 0], [x + w, h], [x + w / 2, h + 0.45], [x, h]]), houses));
    const moon = new T.Mesh(circle(0.4), ink); moon.position.set(3.2, 3.6, 0); houses.add(moon);
    rod(houses, -3.0, 0, 3); rod(houses, 3.0, 0, 3);
    // captions: cut-out letters on rods
    const caps = this.beats.map(b => { const g = new T.Group(); const m = new T.Mesh(K.textBlocks(b.label, { font: F, weight: 900, res: 96, size: 0.5, depth: 0.02 }), ink); g.add(m); rod(g, -1.2, -0.15, 2); rod(g, 1.2, -0.15, 2); shadowScene.add(g); return g; });

    // ---- the audience side: the frame, the glowing cloth, heads in the foreground
    const weave = K.canvasTex(256, 256, (g, r, w, h) => { g.fillStyle = '#808080'; g.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 4) { g.fillStyle = `rgba(255,255,255,${r.range(0.05, 0.16)})`; g.fillRect(i, 0, 2, h); g.fillStyle = `rgba(0,0,0,${r.range(0.05, 0.16)})`; g.fillRect(0, i, w, 2); } for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(r() * w, 0, 1, h); } }, 3);
    weave.wrapS = weave.wrapT = T.RepeatWrapping; weave.colorSpace = T.NoColorSpace;
    const screenMat = new T.ShaderMaterial({
      uniforms: { rt: { value: rt.texture }, weave: { value: weave }, flick: { value: 1 }, warm: { value: new T.Color('#ffb15a') }, hot: { value: new T.Color('#fff0c8') }, center: { value: new T.Vector2(0.5, (LY - SY) / SH) }, px: { value: new T.Vector2(1.6 / RW, 1.6 / RH) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform sampler2D rt, weave; uniform float flick; uniform vec3 warm, hot; uniform vec2 center, px; varying vec2 vUv;
        void main(){
          vec2 suv = vec2(1.0 - vUv.x, vUv.y); float s = 0.0;
          for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) s += texture2D(rt, suv + vec2(float(i), float(j)) * px).r;
          s /= 9.0;
          vec2 d = (vUv - center) * vec2(1.8, 1.0); float glow = 0.35 + 0.9 * exp(-dot(d, d) * 3.0);
          vec3 c = mix(warm, hot, exp(-dot(d, d) * 6.0)) * glow * flick;
          float w = texture2D(weave, vUv * vec2(9.0, 5.0)).r;
          c *= 0.85 + 0.3 * w;
          c *= mix(0.06, 1.0, s);
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` });
    const screen = new T.Mesh(new T.PlaneGeometry(SW, SH), screenMat); screen.position.set(0, SY + SH / 2, 0); scene.add(screen);
    const carved = K.canvasTex(512, 64, (g, r, w, h) => { g.fillStyle = '#4a2a18'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a160c'; g.lineWidth = 4; for (let x = 0; x < w; x += 32) { g.beginPath(); g.arc(x + 16, h / 2, 12, 0, 7); g.stroke(); } for (let i = 0; i < 200; i++) { g.fillStyle = `rgba(0,0,0,${r.range(0.05, 0.2)})`; g.fillRect(r() * w, r() * h, 2, 2); } }, 5);
    carved.wrapS = T.RepeatWrapping; carved.repeat.set(4, 1);
    const wood = new T.MeshStandardMaterial({ map: carved, roughness: 0.7 });
    [[0, SY - 0.2, SW + 0.8, 0.4], [0, SY + SH + 0.2, SW + 0.8, 0.4]].forEach(([x, y, w, h]) => { const m = new T.Mesh(new T.BoxGeometry(w, h, 0.3), wood); m.position.set(x, y, 0.1); scene.add(m); });
    [-1, 1].forEach(s => { const m = new T.Mesh(new T.BoxGeometry(0.4, SH + 1.6, 0.3), wood); m.position.set(s * (SW / 2 + 0.2), SY + SH / 2 - 0.2, 0.1); scene.add(m); });
    const crown = new T.Mesh(new T.CylinderGeometry(1.4, 1.4, 0.3, 32, 1, false, 0, Math.PI), wood); crown.rotation.set(Math.PI / 2, 0, Math.PI / 2); crown.position.set(0, SY + SH + 0.4, 0.1); crown.scale.set(1, 1, 0.5); scene.add(crown);
    const base = new T.Mesh(new T.BoxGeometry(SW + 2, SY, 1.2), new T.MeshStandardMaterial({ color: '#2a1810', roughness: 0.9 })); base.position.set(0, SY / 2 - 0.4, 0.3); scene.add(base);
    const spill = new T.PointLight('#ff9a40', 6, 9, 1.5); spill.position.set(0, SY + SH / 2, 2.0); scene.add(spill);
    const amb = new T.HemisphereLight('#3a2a20', '#000000', 0.3); scene.add(amb);
    const headMat = new T.MeshBasicMaterial({ color: '#050302' });
    const heads = [[-3.2, 0.9, 4.2, 0.55], [-1.2, 0.7, 4.8, 0.62], [1.1, 0.85, 4.5, 0.58], [3.0, 0.65, 4.9, 0.66], [4.6, 0.95, 4.0, 0.5], [-4.8, 0.75, 4.6, 0.6]].map(([x, y, z, r]) => [x, y + 0.75, z, r]).map(([x, y, z, r]) => {
      const g = new T.Group(); const h = new T.Mesh(new T.SphereGeometry(r, 20, 14), headMat); h.scale.set(0.85, 1, 0.85); const sh = new T.Mesh(new T.SphereGeometry(r * 1.9, 20, 10, 0, 7, 0, 1.4), headMat); sh.position.y = -r * 1.35; g.add(h, sh); g.position.set(x, y, z); scene.add(g); return g; });

    shadowScene.traverse(o => { if (o.geometry) S.own(o.geometry); });
    const cam = K.camPath([
      { t: 0, pos: [0.4, 3.2, 12.5], look: [0, 3.3, 0] },
      { t: 11, pos: [-0.4, 3.1, 11.6], look: [0, 3.35, 0] },
    ], S.camera);
    return (t, realT) => {
      cam(t);
      const night = K.prog(t, B[2] - 0.2, B[2] + 0.6) * (1 - K.prog(t, B[3] + 0.4, B[3] + 1.2));
      const flick = 0.9 + 0.06 * Math.sin(realT * 13.1) + 0.04 * Math.sin(realT * 29.7) + 0.03 * Math.sin(realT * 7.3);
      screenMat.uniforms.flick.value = flick * (1 - 0.35 * night);
      screenMat.uniforms.warm.value.set('#ffb15a').lerp(new T.Color('#c9884a'), night);
      spill.intensity = 6 * flick * (1 - 0.3 * night);
      // flame position wobble moves the shadows a little
      lightCam.position.set(0.04 * Math.sin(realT * 9.3), LY + 0.03 * Math.sin(realT * 11.7), LZ); lightCam.lookAt(0, SY + SH / 2, 0);
      // horse: rolls in from the left, then toward the gate, then stands inside
      const roll = K.lerp(-3.6, -1.6, K.prog(t, 0, 2.2, 'out')), pullIn = K.prog(t, B[1] + 0.2, B[1] + 2.2, 'inOut');
      const hx = K.lerp(roll, 1.0, pullIn);
      horse.position.set(hx, SY + 0.35 + 0.02 * Math.abs(Math.sin(realT * 6)) * (pullIn > 0 && pullIn < 1 ? 1 : 0), -0.6);
      wheels.forEach(w => { w.rotation.z = -hx / 0.28; });
      // walls slide in at beat 2; the gate opens at beat 4
      const wx = t < B[2] - 0.5 ? K.lerp(5.5, 0.6, K.prog(t, B[1] - 0.2, B[1] + 0.8, 'out')) : t < B[3] - 0.4 ? K.lerp(0.6, 8.5, K.prog(t, B[2] - 0.5, B[2], 'in')) : K.lerp(-9.5, -4.6, K.prog(t, B[3] - 0.4, B[3] + 0.2, 'out'));
      walls.position.set(wx, SY - 0.05, -0.35);
      houses.position.set(K.lerp(-9, 0, K.prog(t, B[2] - 0.3, B[2] + 0.4, 'out')), SY - 0.05 - 3.5 * K.prog(t, B[3] - 0.5, B[3] - 0.1, 'in'), -0.3);
      const open = K.prog(t, B[3] + 0.2, B[3] + 0.9, 'inOut') + (K.prog(t, B[1] + 0.2, B[1] + 0.6) - K.prog(t, B[1] + 1.8, B[1] + 2.2));
      doors.forEach((d, i) => { d.scale.x = 1 - 0.85 * K.clamp(open); });
      // pullers drag the rope during beat 2
      pullers.forEach((p, i) => { const x = hx + 2.6 + i * 0.55; p.position.set(x, SY + 0.0, -0.25); p.rotation.z = -0.25; p.visible = t > B[1] && t < B[2] + 0.3; p.userData.legs.forEach((l, k) => { l.rotation.z = 0.5 * Math.sin(realT * 8 + i + k * Math.PI); }); });
      rope.visible = pullers[0].visible; rope.position.set(hx + 2.2 + 0.4, SY + 1.0, -0.3); rope.scale.x = 2.4; rope.rotation.z = -0.15;
      // night: the hatch opens and soldiers climb down a rope
      hatch.rotation.z = -1.6 * K.prog(t, B[2] + 0.2, B[2] + 0.6, 'out');
      climbers.forEach((c, i) => { const u = K.prog(t, B[2] + 0.6 + i * 0.5, B[2] + 1.6 + i * 0.5, 'inOut'); c.visible = u > 0; c.position.set(hx + 0.2 + i * 0.5 * u, SY + K.lerp(0.95, 0.0, u), -0.5); c.scale.setScalar(0.6); c.userData.legs.forEach((l, k) => { l.rotation.z = 0.3 * Math.sin(realT * 6 + k * 3); }); });
      // the army rushes in through the gate toward the flame: their shadows grow
      army.forEach((a, i) => { const u = K.prog(t, B[3] + 0.5 + i * 0.15, B[3] + 1.9 + i * 0.15, 'inOut'); a.visible = u > 0; a.position.set(K.lerp(-6.2 + i * 0.3, -1.6 + i * 0.55, u), SY + K.lerp(0, 1.15 + i * 0.03, u), K.lerp(-0.4, -3.4 - i * 0.2, u)); a.userData.legs.forEach((l, k) => { l.rotation.z = 0.6 * Math.sin(realT * 10 + i + k * 3); }); });
      palm.position.set(K.lerp(-3.9, -4.6, K.prog(t, B[1], B[2])) - 6 * K.prog(t, B[2] - 0.5, B[2], 'in'), SY, -0.3);
      // captions drop in from the top on their rods
      caps.forEach((c, i) => { const on = K.prog(t, B[i] + (i ? 0.05 : -1), B[i] + 0.45, 'bounce'), off = i < caps.length - 1 ? K.prog(t, B[i + 1] - 0.3, B[i + 1], 'in') : 0;
        c.visible = on > 0 && off < 1; c.position.set(0, SY + SH - 0.55 + (1 - on) * 1.5 + off * 1.5, -0.2); });
      heads.forEach((h, i) => { h.position.x += 0; h.rotation.z = 0.03 * Math.sin(realT * 0.6 + i); });
      // render the shadows from the flame
      const r = S.renderer, prev = r.getRenderTarget(), cc = r.getClearColor(new T.Color()), ca = r.getClearAlpha(), tm = r.toneMapping;
      r.setRenderTarget(rt); r.setClearColor('#ffffff', 1); r.clear(); r.render(shadowScene, lightCam); r.setRenderTarget(prev); r.setClearColor(cc, ca);
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.08 }); k.bed('wind', { gain: 0.04 });
    B.forEach((b, i) => k.play('wood', { t: b + 0.4, gain: 0.35, pitch: 0.8 + i * 0.1 }));
    k.play('rumble', { t: 0.0, gain: 0.25, pitch: 1.5, dur: 2.0 });
    k.play('rumble', { t: B[1] + 0.2, gain: 0.3, pitch: 1.3, dur: 2.2 });
    k.play('wood', { t: B[1] + 0.35, gain: 0.3, pitch: 0.5 });
    k.play('paper', { t: B[2] + 0.3, gain: 0.3, pitch: 0.7 });
    for (let i = 0; i < 3; i++) k.play('swish', { t: B[2] + 0.7 + i * 0.5, gain: 0.15, pitch: 1.2, dur: 0.5 });
    k.play('wood', { t: B[3] + 0.3, gain: 0.45, pitch: 0.45 });
    k.play('whoosh', { t: B[3] + 0.6, gain: 0.35, pitch: 0.6, dur: 2.0 });
    for (let i = 0; i < 8; i++) k.play('thud', { t: B[3] + 0.8 + i * 0.22, gain: 0.25, pitch: 0.8 + (i % 3) * 0.1 });
    k.play('bell', { t: B[3] + 2.4, gain: 0.2, pitch: 0.6, music: true });
  },
  post: null,
};
