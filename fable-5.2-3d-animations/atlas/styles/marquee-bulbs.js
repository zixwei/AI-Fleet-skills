window.STYLES = window.STYLES || {};
STYLES['marquee-bulbs'] = {
  id: 'marquee-bulbs', name: 'Marquee Bulbs',
  family: 'Stage and play',
  use: 'Title',
  look: 'A theatre marquee at night: red letters on a white lit panel, framed by a border of warm bulbs. One bulb is dead. The wet street below reflects it all, broken up by ripples.',
  motion: 'The panel flickers on, then the letters snap on one at a time with a click. The border bulbs chase round in a steady pattern. A last line slides in underneath, and the camera rises slowly from the street.',
  shownHere: 'A title card for an opening night: the headline, then the time.',
  goodFor: 'Titles, announcements, launches, premieres, event openers: anything that wants showbiz warmth and a big headline.',
  fonts: ['Bebas Neue', 'Oswald:wght@500;700'],
  duration: 9,
  samples: 4,
  // CONTENT: the two panel lines and when they appear
  line1: 'OPENING NIGHT',
  line2: 'TONIGHT 8 PM',
  beats: [
    { t: 0.0, label: 'The marquee warms up' },
    { t: 2.0, label: 'OPENING NIGHT' },
    { t: 5.0, label: 'TONIGHT 8 PM' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), FB = 'Bebas Neue', L1 = this.line1, L2 = this.line2;
    scene.background = new T.Color('#05060a'); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#3a4060', '#0a0a10', 0.5)); const glowL = new T.PointLight('#ffb870', 60, 18, 1.4); glowL.position.set(0, 1.6, 2.6); scene.add(glowL);
    const std = (c, r = 0.8, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const brick = K.canvasTex(512, 512, (g, r, w, h) => { g.fillStyle = '#2a1410'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? -32 : 0; x < w; x += 64) { g.fillStyle = `hsl(10, 40%, ${r.range(14, 22)}%)`; g.fillRect(x + 2, y + 2, 60, 28); } }, 2);
    brick.wrapS = brick.wrapT = T.RepeatWrapping; brick.repeat.set(4, 3);
    // the marquee is built twice: once for real, once mirrored under the wet street
    const MW = 9.6, MH = 3.2, NB = 64;
    const halo = K.canvasTex(64, 64, (g, r, w, h) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,220,150,1)'); gr.addColorStop(0.3, 'rgba(255,170,80,0.4)'); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, 1);
    const glyph = ch => K.canvasTex(128, 192, (g, r, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#d81a1a'; g.font = `400 190px "${FB}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, w / 2, h / 2 + 10); }, ch.charCodeAt(0) || 1);
    const glyphs = {}; (L1 + L2).split('').forEach(c => { if (c !== ' ' && !glyphs[c]) glyphs[c] = glyph(c); });
    const bulbPos = []; const per = 2 * (MW + MH); for (let i = 0; i < NB; i++) { let d = i / NB * per; let x, y; if (d < MW) { x = -MW / 2 + d; y = MH / 2; } else if ((d -= MW) < MH) { x = MW / 2; y = MH / 2 - d; } else if ((d -= MH) < MW) { x = MW / 2 - d; y = -MH / 2; } else { d -= MW; x = -MW / 2; y = -MH / 2 + d; } bulbPos.push([x, y]); }
    const makeMarquee = mirror => {
      const g = new T.Group(); scene.add(g);
      const box = new T.Mesh(new T.BoxGeometry(MW + 0.8, MH + 0.8, 1.2), std('#1a1a22', 0.4, { metalness: 0.6 })); box.position.z = -0.4; g.add(box);
      const panel = new T.Mesh(new T.PlaneGeometry(MW - 0.4, MH - 0.5), new T.MeshBasicMaterial({ color: '#fff6e8', side: T.DoubleSide })); panel.position.z = 0.21; g.add(panel);
      const letters = []; [[L1, 0.55, 0.95], [L2, -0.75, 0.62]].forEach(([line, y, sz], li) => { const n = line.length; line.split('').forEach((c, i) => { if (c === ' ') return; const m = new T.Mesh(new T.PlaneGeometry(sz * 0.62, sz), new T.MeshBasicMaterial({ map: glyphs[c], transparent: true, alphaTest: 0.4, side: T.DoubleSide })); m.position.set((i - (n - 1) / 2) * sz * 0.62, y, 0.23); g.add(m); letters.push({ m, li, i, n }); }); });
      const bulbs = new T.InstancedMesh(new T.SphereGeometry(0.12, 12, 8), new T.MeshBasicMaterial({ color: '#ffffff' }), NB); const O = new T.Object3D(); bulbPos.forEach(([x, y], i) => { O.position.set(x, y, 0.3); O.updateMatrix(); bulbs.setMatrixAt(i, O.matrix); bulbs.setColorAt(i, new T.Color('#ffd890')); }); g.add(bulbs);
      const hp = new Float32Array(NB * 3), hc = new Float32Array(NB * 3); bulbPos.forEach(([x, y], i) => { hp.set([x, y, 0.35], i * 3); });
      const hg = new T.BufferGeometry(); hg.setAttribute('position', new T.BufferAttribute(hp, 3)); hg.setAttribute('color', new T.BufferAttribute(hc, 3));
      const halos = new T.Points(hg, new T.PointsMaterial({ map: halo, size: 1.5, vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); g.add(halos);
      g.position.set(0, 3.2, 0); if (mirror) { g.scale.y = -1; g.position.y = -3.2; }
      return { g, panel, letters, bulbs, hc, hg };
    };
    const real = makeMarquee(false), refl = makeMarquee(true);
    const wall = new T.Mesh(new T.PlaneGeometry(30, 14), std('#ffffff', 0.9, { map: brick })); wall.position.set(0, 7, -1.2); scene.add(wall);
    // the wet street: dark, partly see-through over the mirrored copy, with ripples
    const rip = K.canvasTex(512, 512, (g, r, w, h) => { g.fillStyle = 'rgba(8,10,16,0.8)'; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(0,0,0,${r.range(0.2, 0.5)})`; g.lineWidth = r.range(1, 4); const y = r() * h; g.beginPath(); g.moveTo(r() * w, y); g.lineTo(r() * w, y + r.range(-2, 2)); g.stroke(); } }, 5);
    rip.wrapS = rip.wrapT = T.RepeatWrapping; rip.repeat.set(3, 3);
    const street = new T.Mesh(new T.PlaneGeometry(40, 30), new T.MeshStandardMaterial({ color: '#ffffff', map: rip, transparent: true, opacity: 0.6, roughness: 0.2, metalness: 0.4 })); street.rotation.x = -Math.PI / 2; scene.add(street);
    const cam = K.camPath([{ t: 0, pos: [-1.6, 1.4, 16.5], look: [0, 1.4, 0] }, { t: 9, pos: [1.0, 1.9, 14.0], look: [0, 1.7, 0] }], S.camera);
    const ON = new T.Color('#ffe0a0'), OFF = new T.Color('#3a2a18'), C = new T.Color(), DEAD = 23;
    return (t, realT) => {
      cam(t);
      const warm = K.prog(t, 0.1, 1.4), flick = t < 1.4 ? (Math.sin(t * 47) > -0.3 ? 1 : 0.3) : 1;
      [real, refl].forEach((M, mi) => {
        const dim = mi ? 0.5 : 1;
        M.panel.material.color.set('#fff6e8').multiplyScalar((0.15 + 0.85 * warm * flick) * dim);
        M.letters.forEach(L => { const t0 = L.li === 0 ? B[1] + 0.1 + L.i * 0.12 : B[2] + 0.1 + L.i * 0.1; L.m.visible = t > t0; L.m.material.color.setScalar(dim); L.m.position.z = 0.23 + (t > t0 && t < t0 + 0.08 ? 0.05 : 0); });
        const step = Math.floor(realT * 7);
        for (let i = 0; i < NB; i++) { let on = t > 1.0 + i * 0.012 ? ((i + step) % 4 !== 0 ? 1 : 0.15) : 0; if (i === DEAD) on = 0; C.copy(OFF).lerp(ON, on).multiplyScalar(dim); M.bulbs.setColorAt(i, C); M.hc[i * 3] = on * dim; M.hc[i * 3 + 1] = on * 0.8 * dim; M.hc[i * 3 + 2] = on * 0.5 * dim; }
        M.bulbs.instanceColor.needsUpdate = true; M.hg.attributes.color.needsUpdate = true; });
      rip.offset.set(0.02 * Math.sin(realT * 0.7), realT * 0.03);
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t), L1 = this.line1, L2 = this.line2;
    k.bed('night', { gain: 0.05 }); k.bed('crowd', { gain: 0.03 }); k.bed('water', { gain: 0.03 });
    k.play('hum', { t: 0.1, gain: 0.12, pitch: 1.0, dur: 8.6 }); [0.2, 0.45, 0.6, 1.1].forEach(d => k.play('click', { t: d, gain: 0.2, pitch: 0.8 }));
    L1.split('').forEach((c, i) => { if (c !== ' ') k.play('click', { t: B[1] + 0.1 + i * 0.12, gain: 0.22, pitch: 1.2 + (i % 3) * 0.1 }); }); k.play('chime', { t: B[1] + 0.1 + L1.length * 0.12, gain: 0.2, pitch: 1.0, music: true });
    L2.split('').forEach((c, i) => { if (c !== ' ') k.play('click', { t: B[2] + 0.1 + i * 0.1, gain: 0.18, pitch: 1.4 }); }); k.play('bell', { t: B[2] + 1.6, gain: 0.2, pitch: 1.0, music: true }); k.play('sparkle', { t: B[2] + 1.7, gain: 0.2 });
  },
  post: null,
};
