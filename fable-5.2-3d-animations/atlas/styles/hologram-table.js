window.STYLES = window.STYLES || {};
STYLES['hologram-table'] = {
  id: 'hologram-table', name: 'Hologram Table',
  family: 'Diagrams with depth',
  use: 'Explainer',
  look: 'A dark briefing room. A round table projects a cyan volumetric model made of scan lines and points, with a visible cone of light, a slight flicker and a soft glow. The part that matters lights up in amber.',
  motion: 'The model turns slowly above the table. Signals run along thin lines, spheres grow from their sources, and sections switch to amber when the story reaches them.',
  shownHere: 'How GPS finds your position: satellites circle the Earth, each sends the time and its position, the travel time gives the distance to each one, and the point where four distances agree is you.',
  goodFor: 'Technical briefings: space, defence, networks, data and any system shown as a model in the middle of a room.',
  fonts: ['Orbitron:wght@600;800'],
  duration: 11,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Satellites circle the Earth' },
    { t: 2.7, label: 'Each one sends the time and its place' },
    { t: 5.4, label: 'Travel time gives the distance' },
    { t: 8.1, label: 'Four distances meet at one point: you' },
  ],
  you: 'YOU',

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Orbitron';
    scene.background = new T.Color('#020509'); scene.add(S.camera);
    const amb = new T.HemisphereLight('#0a2030', '#000000', 0.5); scene.add(amb);
    const CY = '#3ff2ff', AM = '#ffb43a';
    // the room and the table
    const floor = new T.Mesh(new T.PlaneGeometry(40, 40), new T.MeshStandardMaterial({ color: '#05080c', roughness: 0.3, metalness: 0.6 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -1.6; scene.add(floor);
    const table = new T.Mesh(new T.CylinderGeometry(3.2, 3.0, 0.4, 64), new T.MeshStandardMaterial({ color: '#0e141a', metalness: 0.7, roughness: 0.35 })); table.position.y = -0.2; scene.add(table);
    const stand = new T.Mesh(new T.CylinderGeometry(0.8, 1.2, 1.2, 32), table.material); stand.position.y = -1.0; scene.add(stand);
    const emitter = new T.Mesh(new T.RingGeometry(0.4, 1.4, 64), new T.MeshBasicMaterial({ color: CY, transparent: true, opacity: 0.8, toneMapped: false, side: T.DoubleSide })); emitter.rotation.x = -Math.PI / 2; emitter.position.y = 0.01; scene.add(emitter);
    const rimL = new T.PointLight(CY, 6, 8, 1.4); rimL.position.set(0, 1.5, 0); scene.add(rimL);
    const chairM = new T.MeshStandardMaterial({ color: '#0a0e14', roughness: 0.6 });
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + 0.3, c = new T.Group(); const seat = new T.Mesh(new T.BoxGeometry(0.9, 0.1, 0.9), chairM); seat.position.y = -0.9; const back = new T.Mesh(new T.BoxGeometry(0.9, 1.2, 0.1), chairM); back.position.set(0, -0.3, -0.45); c.add(seat, back); c.position.set(Math.cos(a) * 4.6, 0, Math.sin(a) * 4.6); c.lookAt(0, 0, 0); scene.add(c); }
    // the projection cone
    const cone = new T.Mesh(new T.ConeGeometry(2.6, 3.6, 64, 1, true), new T.MeshBasicMaterial({ color: CY, transparent: true, opacity: 0.018, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, toneMapped: false })); cone.rotation.x = Math.PI; cone.position.y = 1.8; scene.add(cone);
    // the hologram
    const holo = new T.Group(); holo.position.y = 2.2; scene.add(holo);
    const add = (c, o = 0.6) => new T.LineBasicMaterial({ color: c, transparent: true, opacity: o, blending: T.AdditiveBlending, toneMapped: false });
    const R = 1.0;
    const globe = new T.LineSegments(new T.WireframeGeometry(new T.SphereGeometry(R, 24, 16)), add(CY, 0.35)); holo.add(globe);
    const glowTex = K.canvasTex(32, 32, g => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
    // continents as points on the globe
    const cp = [], cr = K.rng(4); for (let i = 0; i < 2600; i++) { const u = cr(), v = cr(), th = u * 6.283, ph = Math.acos(2 * v - 1), x = Math.sin(ph) * Math.cos(th), y = Math.cos(ph), z = Math.sin(ph) * Math.sin(th); const land = Math.sin(th * 2.0 + 0.5) * Math.sin(ph * 3.0) + 0.6 * Math.sin(th * 5 + ph * 2); if (land > 0.35) cp.push(x * R * 1.01, y * R * 1.01, z * R * 1.01); }
    const cg = new T.BufferGeometry(); cg.setAttribute('position', new T.Float32BufferAttribute(cp, 3)); holo.add(new T.Points(cg, new T.PointsMaterial({ map: glowTex, color: CY, size: 0.05, transparent: true, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false })));
    // orbits and satellites
    const sats = [];
    for (let i = 0; i < 8; i++) { const ring = new T.Group(); ring.rotation.set(0.96, i * Math.PI / 4, 0); holo.add(ring); const op = []; for (let k = 0; k <= 96; k++) { const a = k / 96 * 6.283; op.push(new T.Vector3(Math.cos(a) * 2.0, 0, Math.sin(a) * 2.0)); } ring.add(new T.Line(new T.BufferGeometry().setFromPoints(op), add(CY, 0.15))); const s = new T.Group(); const body = new T.Mesh(new T.BoxGeometry(0.08, 0.08, 0.08), new T.MeshBasicMaterial({ color: CY, toneMapped: false })); const panel = new T.Mesh(new T.BoxGeometry(0.3, 0.01, 0.06), new T.MeshBasicMaterial({ color: CY, transparent: true, opacity: 0.6, toneMapped: false })); s.add(body, panel); ring.add(s); sats.push({ s, ring, ph: i * 0.8 }); }
    // the receiver on the globe surface, its marker and label
    const recvLocal = new T.Vector3(0.35, 0.62, 0.7).normalize().multiplyScalar(R);
    const recv = new T.Mesh(new T.SphereGeometry(0.05, 12, 8), new T.MeshBasicMaterial({ color: AM, toneMapped: false })); recv.position.copy(recvLocal); holo.add(recv);
    const youTag = K.label(this.you, { font: F, weight: 800, px: 64, color: '#1a0e00', bg: AM, radius: 'pill', pad: 0.35, height: 0.22 }); scene.add(youTag);
    // signals and distance spheres from four chosen satellites
    const chosen = [0, 2, 4, 6];
    const sigLines = chosen.map(() => { const l = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(), new T.Vector3()]), add(AM, 0)); scene.add(l); const p = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: AM, transparent: true, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false })); p.scale.setScalar(0.18); scene.add(p); return { l, p }; });
    const spheres = chosen.map(() => { const m = new T.LineSegments(new T.WireframeGeometry(new T.SphereGeometry(1, 20, 12)), add(AM, 0)); scene.add(m); return m; });
    const flash = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: AM, transparent: true, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false })); scene.add(flash);
    // data readout panel floating at the side
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 600, px: 64, color: '#bff8ff', height: 0.36 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.78, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [0.0, 4.6, 10.0], look: [0, 1.8, 0] },
      { t: 5.4, pos: [4.2, 4.0, 8.6], look: [0, 2.0, 0] },
      { t: 11, pos: [-1.4, 3.8, 9.0], look: [0, 2.1, 0] },
    ], S.camera);
    const W = new T.Vector3(), Rw = new T.Vector3();
    return (t, realT) => {
      cam(t);
      holo.rotation.y = 0.15 * t;
      sats.forEach((s, i) => { const a = realT * 0.25 + s.ph; s.s.position.set(Math.cos(a) * 2.0, 0, Math.sin(a) * 2.0); s.s.rotation.y = -a; });
      holo.updateMatrixWorld(); recv.getWorldPosition(Rw);
      const send = K.prog(t, B[1] + 0.2, B[1] + 1.0), grow = K.prog(t, B[2] + 0.2, B[2] + 2.0, 'inOut'), hit = K.prog(t, B[3] + 0.3, B[3] + 0.9);
      chosen.forEach((ci, k) => {
        sats[ci].s.getWorldPosition(W);
        const sl = sigLines[k], sp = spheres[k]; sl.l.geometry.setFromPoints([W, Rw]); sl.l.material.opacity = 0.7 * send * (1 - 0.6 * hit);
        const u = ((realT * 0.7 + k * 0.25) % 1); sl.p.position.lerpVectors(W, Rw, u); sl.p.visible = send > 0.5 && t < B[3] + 1.5;
        const d = W.distanceTo(Rw); sp.position.copy(W); sp.scale.setScalar(Math.max(0.001, d * grow)); sp.material.opacity = 0.1 * grow * (1 - 0.5 * hit);
        sats[ci].s.children[0].material.color.set(send > 0 ? AM : CY);
      });
      recv.material.color.set(hit > 0 ? AM : CY);
      flash.position.copy(Rw); flash.scale.setScalar(0.8 * hit + 0.25 * hit * Math.sin(realT * 6)); flash.visible = hit > 0;
      youTag.position.copy(Rw).add(new T.Vector3(0, 0.38, 0)); youTag.visible = hit > 0.5; youTag.lookAt(S.camera.position);
      cone.material.opacity = 0.018 + 0.006 * Math.sin(realT * 13);
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('machine', { gain: 0.04 }); k.bed('space', { gain: 0.06 });
    k.play('hum', { t: 0.1, gain: 0.12, pitch: 2.0, dur: 10 });
    k.play('blip', { t: 0.4, gain: 0.2, pitch: 1.2 });
    for (let i = 0; i < 4; i++) k.play('blip', { t: B[1] + 0.2 + i * 0.2, gain: 0.2, pitch: 1.5 + i * 0.1 });
    k.play('riser', { t: B[2] + 0.2, gain: 0.15, pitch: 1.0, dur: 1.8 });
    k.play('zap', { t: B[3] + 0.3, gain: 0.2, pitch: 1.2 }); k.play('chime', { t: B[3] + 0.4, gain: 0.22, pitch: 1.2, music: true });
  },
  // post pass: scan lines, a soft glow, slight colour split and flicker
  post: {
    fragment: `
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes;
        vec3 c = texture2D(tColor, uv).rgb;
        vec3 glow = vec3(0.0);
        for (int i = -3; i <= 3; i++) for (int j = -3; j <= 3; j++) glow += texture2D(tColor, uv + vec2(float(i), float(j)) * px * 3.0).rgb;
        glow /= 49.0;
        float split = 1.5 * px.x;
        c.r = mix(c.r, texture2D(tColor, uv + vec2(split, 0.0)).r, 0.6);
        c.b = mix(c.b, texture2D(tColor, uv - vec2(split, 0.0)).b, 0.6);
        float scan = 0.88 + 0.12 * sin(uv.y * uRes.y * 1.6);
        float flick = 0.97 + 0.03 * sin(uTime * 37.0);
        vec2 v = uv - 0.5; float vig = 1.0 - dot(v, v) * 0.9;
        return vec4((c * scan + glow * 0.7) * flick * vig, 1.0);
      }`,
  },
};
