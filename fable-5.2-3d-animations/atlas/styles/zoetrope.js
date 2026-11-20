window.STYLES = window.STYLES || {};
STYLES['zoetrope'] = {
  id: 'zoetrope', name: 'Zoetrope',
  family: 'Machines that explain',
  use: 'Explainer',
  look: 'A 3D zoetrope on a dark wooden turntable: a ring of small sculptures on brass pedestals, each one a different phase of the same motion. Warm work light, then a hard white strobe.',
  motion: 'The turntable spins up until it blurs. Then a strobe flashes once for each sculpture, and the ring seems to stand still while the sculptures move in place.',
  shownHere: "The phases of the Moon: twelve small moons, each lit a little more than the last, become one moon that waxes from new to full and wanes again.",
  goodFor: 'Cycles and repeating motions: phases, gaits, heartbeats, seasons. Each step of the cycle is one sculpture.',
  fonts: ['Josefin Sans:wght@600;700'],
  duration: 11,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'Twelve moons, each lit a little more' },
    { t: 2.7, label: 'The table spins up' },
    { t: 5.4, label: 'A strobe flashes once per moon' },
    { t: 8.1, label: 'One Moon waxes and wanes' },
  ],
  phases: ['NEW', 'WAXING CRESCENT', 'FIRST QUARTER', 'WAXING GIBBOUS', 'FULL', 'WANING GIBBOUS', 'LAST QUARTER', 'WANING CRESCENT'],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Josefin Sans', N = 12;
    scene.background = new T.Color('#0c0a0b'); scene.fog = new T.Fog('#0c0a0b', 12, 26); scene.add(S.camera);
    const L = K.lights(S, 'lamp', { size: 5, target: [0, 0.5, 0] }); L.key.position.set(-4, 7, 5); L.key.intensity = 2.4; L.amb.intensity = 0.4;
    const strobe = new T.SpotLight('#eaf2ff', 0, 30, 0.7, 0.4, 1.2); strobe.position.set(2.5, 7, 6); strobe.target.position.set(0, 0.6, 0); scene.add(strobe, strobe.target);
    const bench = new T.Mesh(new T.BoxGeometry(14, 0.4, 8), new T.MeshStandardMaterial({ color: '#2e2018', roughness: 0.6 })); bench.position.y = -0.4; bench.receiveShadow = true; scene.add(bench);
    // turntable
    const table = new T.Group(); scene.add(table);
    const wood = new T.MeshStandardMaterial({ color: '#4a2f1d', roughness: 0.4, map: K.canvasTex(512, 512, (g, r, w, h) => { g.fillStyle = '#4a2f1d'; g.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(20,10,4,${r.range(0.1, 0.25)})`; g.lineWidth = r.range(1, 3); g.beginPath(); g.arc(w / 2, h / 2, r.range(20, 250), 0, 7); g.stroke(); } }, 3) });
    const disc = new T.Mesh(new T.CylinderGeometry(3.0, 3.05, 0.25, 96), wood); disc.receiveShadow = true; disc.castShadow = true; table.add(disc);
    const brass = new T.MeshStandardMaterial({ color: '#d4a548', metalness: 1, roughness: 0.3 });
    const rim = new T.Mesh(new T.TorusGeometry(3.02, 0.04, 8, 96), brass); rim.rotation.x = Math.PI / 2; rim.position.y = 0.13; table.add(rim);
    const hub = new T.Mesh(new T.CylinderGeometry(0.35, 0.45, 0.6, 32), brass); hub.position.y = 0.4; table.add(hub);
    const spindle = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 1.6, 12), brass); spindle.position.y = 1.1; table.add(spindle);
    // moons: vertex-coloured spheres; the lit side turns a little more for each slot
    const R = 2.35, slot = Math.PI * 2 / N;
    const moonGeo = new T.SphereGeometry(0.42, 48, 32);
    for (let i = 0; i < N; i++) {
      const g = moonGeo.clone(), p = g.attributes.position, cols = [], phi = i / N * Math.PI * 2;
      const d = new T.Vector3(Math.sin(phi), 0, -Math.cos(phi)); // local +z faces outward (the viewer); phi 0 = new moon
      const n = new T.Vector3(), c = new T.Color();
      for (let k = 0; k < p.count; k++) { n.fromBufferAttribute(p, k).normalize(); const lit = K.clamp((n.dot(d) + 0.04) * 12); const crater = 0.92 + 0.08 * Math.sin(n.x * 23) * Math.sin(n.y * 19 + n.z * 7); c.setRGB(0.07, 0.07, 0.09).lerp(new T.Color(0.93 * crater, 0.9 * crater, 0.82 * crater), lit); cols.push(c.r, c.g, c.b); }
      g.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
      const holder = new T.Group(); const a = i * slot; holder.position.set(R * Math.sin(a), 0, R * Math.cos(a)); holder.rotation.y = a; table.add(holder);
      const ped = new T.Mesh(new T.CylinderGeometry(0.12, 0.2, 0.55, 16), brass); ped.position.y = 0.4; ped.castShadow = true; holder.add(ped);
      const moon = new T.Mesh(g, new T.MeshBasicMaterial({ vertexColors: true })); moon.position.y = 1.1; moon.castShadow = true; holder.add(moon);
      moon.userData.emis = true;
    }
    // a brass number ring
    const ringTex = K.canvasTex(1024, 1024, (g, r, w, h) => { g.translate(w / 2, h / 2); g.fillStyle = '#e8c372'; g.font = `700 64px "${F}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; for (let i = 0; i < N; i++) { g.save(); g.rotate(i / N * 6.283); g.fillText(String(i + 1), 0, -455); g.restore(); } });
    const numRing = new T.Mesh(new T.CircleGeometry(3.0, 64), new T.MeshBasicMaterial({ map: ringTex, transparent: true })); numRing.rotation.x = -Math.PI / 2; numRing.position.y = 0.13; table.add(numRing);
    // the strobe lamp housing
    const lamp = new T.Group(); lamp.position.set(2.5, 4.2, 4.5); scene.add(lamp);
    const box = new T.Mesh(new T.BoxGeometry(0.8, 0.5, 0.6), new T.MeshStandardMaterial({ color: '#1e1e22', metalness: 0.6, roughness: 0.4 })); lamp.add(box);
    const lens = new T.Mesh(new T.CircleGeometry(0.2, 24), new T.MeshBasicMaterial({ color: '#ffffff', toneMapped: false })); lens.position.set(-0.15, -0.1, 0.31); lens.rotation.y = -0.4; lamp.add(lens);
    const stand = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 4.4, 8), brass); stand.position.set(0, -2.4, 0); lamp.add(stand);
    // phase name and a small arrow at the front
    const names = this.phases.map(nm => { const l = K.label(nm, { font: F, weight: 700, px: 64, color: '#eaf2ff', bg: 'rgba(10,12,20,0.75)', radius: 'pill', pad: 0.35, height: 0.34 }); l.position.set(0, 0.05, R + 1.25); l.rotation.x = -0.6; scene.add(l); l.visible = false; return l; });
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 80, color: '#f5e6c8', height: 0.44 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.76, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [3.6, 4.6, 8.6], look: [0, 0.9, 0] },
      { t: 5.4, pos: [1.0, 3.2, 8.4], look: [0, 1.0, 1.0] },
      { t: 11, pos: [0.0, 2.4, 6.9], look: [0, 1.1, 1.6] },
    ], S.camera);
    // spin: 0 until the spin-up, then up to one turn per 1.5 s
    const REV = 1.5, spinA = t => { const t0 = B[1] + 0.1, t1 = B[1] + 2.0; if (t < t0) return 0; if (t < t1) { const u = t - t0, Tm = t1 - t0; return (Math.PI * 2 / REV) * u * u / (2 * Tm); } return (Math.PI * 2 / REV) * ((t1 - t0) / 2 + (t - t1)); };
    const flashT = slot / (Math.PI * 2 / REV);
    return (t, realT) => {
      cam(t);
      const strobeOn = t >= B[2];
      let a = spinA(t);
      if (strobeOn) { const k = Math.floor((t - B[2]) / flashT); a = (Math.round(spinA(B[2]) / slot) + k) * slot; } // each flash shows the ring exactly one slot on: it seems to stand still
      table.rotation.y = -a;
      const u = strobeOn ? ((t - B[2]) % flashT) / flashT : 0;
      const flash = strobeOn ? 0.35 + 0.65 * Math.exp(-u * 6) : 0;
      strobe.intensity = 160 * flash; lens.material.color.setScalar(strobeOn ? 0.3 + 0.7 * flash : 0.25);
      L.key.intensity = strobeOn ? 0.5 : 2.4; L.amb.intensity = strobeOn ? 0.15 : 0.4;
      // which phase is at the front now (slot whose holder faces +z)
      const frontSlot = ((Math.round(-table.rotation.y / slot) % N) + N) % N;
      const nameIdx = Math.round(frontSlot / N * 8) % 8;
      names.forEach((l, i) => { l.visible = t > B[3] && i === nameIdx; });
      titles.forEach((l, i) => { const a2 = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a2 > 0.01; l.material.opacity = a2; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('machine', { gain: 0.04 });
    for (let i = 0; i < 4; i++) k.play('wood', { t: 0.3 + i * 0.3, gain: 0.25, pitch: 1.0 + i * 0.1 });
    k.play('click', { t: B[1] + 0.05, gain: 0.4, pitch: 0.8 });
    k.play('riser', { t: B[1] + 0.1, gain: 0.2, pitch: 0.6, dur: 1.6 });
    k.play('hum', { t: B[1] + 0.5, gain: 0.2, pitch: 0.9, dur: 7.5 });
    const flashT = (Math.PI * 2 / 12) / (Math.PI * 2 / 1.5);
    for (let t = B[2]; t < 11; t += flashT) k.play('tick', { t, gain: 0.2, pitch: 1.6 });
    k.play('zap', { t: B[2], gain: 0.15, pitch: 2.0 });
    k.play('chime', { t: B[3] + 0.4, gain: 0.2, pitch: 1.0, music: true });
    k.play('chime', { t: B[3] + 1.9, gain: 0.15, pitch: 1.5, music: true });
  },
  post: null,
};
