window.STYLES = window.STYLES || {};
STYLES['layer-stack'] = {
  id: 'layer-stack', name: 'Layer Stack',
  family: 'Diagrams with depth',
  use: 'Explainer',
  look: 'A system drawn as a stack of thin glass sheets above a dark machined plinth. Each sheet carries its own white line diagram, and its edges glow aqua. Dark room, cool rim light, soft reflections.',
  motion: 'The sheets lift apart like the pages of a model. One sheet lights at a time while a bright signal drops through the stack, then the answer climbs back up.',
  shownHere: 'The layers of a web request: the browser, DNS, a secure TLS connection, the HTTP request, and the server that answers.',
  goodFor: 'Layered systems and stacks: network layers, software architecture, organisation levels, anything where a request passes down and a result comes back up.',
  fonts: ['JetBrains Mono:wght@500;700', 'Sora:wght@600;700'],
  duration: 11,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'You type an address' },
    { t: 2.2, label: 'DNS finds the server' },
    { t: 4.4, label: 'TLS opens a secure line' },
    { t: 6.6, label: 'HTTP asks for the page' },
    { t: 8.8, label: 'The server answers' },
  ],
  layers: [
    { name: 'BROWSER', note: 'example.com' },
    { name: 'DNS', note: 'example.com → 93.184.215.14' },
    { name: 'TLS', note: 'handshake · keys · encrypted' },
    { name: 'HTTP', note: 'GET /  →  200 OK' },
    { name: 'SERVER', note: 'app + database' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), FM = 'JetBrains Mono', F = 'Sora';
    const AQ = '#38f2e0';
    scene.background = K.canvasTex(16, 256, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0b1418'); gr.addColorStop(1, '#03070a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    scene.fog = new T.Fog('#05090c', 18, 40); scene.add(S.camera);
    const Lt = K.lights(S, 'night', { size: 7, target: [0, 2, 0] }); Lt.key.intensity = 1.6; S.scene.environmentIntensity = 0.6;
    const rim = new T.DirectionalLight('#7ff5ff', 1.4); rim.position.set(-6, 6, -6); scene.add(rim);
    // plinth: dark machined steel with grooves and an aqua ring
    const steelTex = K.canvasTex(512, 512, (g, r, w, h) => { g.fillStyle = '#20262b'; g.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { g.strokeStyle = `rgba(255,255,255,${r.range(0.01, 0.05)})`; g.beginPath(); const y = r() * h; g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }, 2);
    const steel = new T.MeshStandardMaterial({ map: steelTex, metalness: 0.85, roughness: 0.35 });
    const plinth = new T.Mesh(new T.CylinderGeometry(4.6, 4.9, 1.0, 6), steel); plinth.position.y = -0.5; plinth.receiveShadow = true; scene.add(plinth);
    for (let i = 0; i < 3; i++) { const g = new T.Mesh(new T.TorusGeometry(4.65 + i * 0.01, 0.02, 4, 6), new T.MeshStandardMaterial({ color: '#0c0f12', metalness: 1, roughness: 0.5 })); g.rotation.x = Math.PI / 2; g.rotation.z = Math.PI / 6 * 0; g.position.y = -0.2 - i * 0.25; scene.add(g); }
    const ring = new T.Mesh(new T.TorusGeometry(4.0, 0.03, 6, 6), new T.MeshBasicMaterial({ color: AQ, toneMapped: false })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.01; scene.add(ring);
    const floor = new T.Mesh(new T.PlaneGeometry(80, 80), new T.MeshStandardMaterial({ color: '#06090b', metalness: 0.6, roughness: 0.5 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -1.0; scene.add(floor);

    // white line diagrams, one per sheet
    const SW = 6.0, SD = 4.0;
    const draw = (g, i, w, h, layer) => {
      g.strokeStyle = '#ffffff'; g.fillStyle = '#ffffff'; g.lineWidth = 6; g.lineCap = g.lineJoin = 'round';
      g.font = `700 64px "${FM}"`; g.textBaseline = 'middle';
      g.globalAlpha = 0.25; g.strokeRect(20, 20, w - 40, h - 40); g.globalAlpha = 1;
      const cx = w / 2, cy = h / 2 + 30;
      if (i === 0) { g.strokeRect(cx - 330, cy - 190, 660, 400); g.beginPath(); g.moveTo(cx - 330, cy - 110); g.lineTo(cx + 330, cy - 110); g.stroke();
        g.strokeRect(cx - 230, cy - 170, 460, 46); g.font = `500 34px "${FM}"`; g.fillText(layer.note, cx - 215, cy - 146); [0, 1, 2].forEach(k => { g.beginPath(); g.arc(cx - 300 + k * 28, cy - 148, 8, 0, 7); g.stroke(); });
        for (let k = 0; k < 4; k++) g.fillRect(cx - 280, cy - 60 + k * 50, 240 + (k % 2) * 160, 14); }
      if (i === 1) { g.font = `500 40px "${FM}"`; ['example.com', 'atlas.org', 'news.net'].forEach((n, k) => { g.globalAlpha = k ? 0.45 : 1; g.fillText(n, cx - 360, cy - 120 + k * 90); g.fillText(['93.184.215.14', '104.21.3.7', '151.101.1.67'][k], cx + 60, cy - 120 + k * 90); g.beginPath(); g.moveTo(cx - 60, cy - 120 + k * 90); g.lineTo(cx + 30, cy - 120 + k * 90); g.stroke(); g.beginPath(); g.moveTo(cx + 15, cy - 135 + k * 90); g.lineTo(cx + 35, cy - 120 + k * 90); g.lineTo(cx + 15, cy - 105 + k * 90); g.stroke(); }); g.globalAlpha = 1; }
      if (i === 2) { g.strokeRect(cx - 70, cy - 40, 140, 120); g.beginPath(); g.arc(cx, cy - 40, 50, Math.PI, 0); g.stroke(); g.beginPath(); g.arc(cx, cy + 15, 14, 0, 7); g.fill();
        [-1, 1].forEach(s => { g.strokeRect(cx + s * 330 - 70, cy - 70, 140, 140); for (let k = 0; k < 3; k++) { const y = cy - 90 + k * 70; g.beginPath(); g.moveTo(cx + s * 250, y); g.lineTo(cx + s * 110, y + 20); g.stroke(); } }); }
      if (i === 3) { g.font = `700 54px "${FM}"`; g.fillText('GET /', cx - 360, cy - 90); g.fillText('200 OK', cx + 120, cy + 90);
        g.beginPath(); g.moveTo(cx - 120, cy - 90); g.lineTo(cx + 300, cy - 90); g.lineTo(cx + 270, cy - 110); g.moveTo(cx + 300, cy - 90); g.lineTo(cx + 270, cy - 70); g.stroke();
        g.beginPath(); g.moveTo(cx + 80, cy + 90); g.lineTo(cx - 340, cy + 90); g.lineTo(cx - 310, cy + 70); g.moveTo(cx - 340, cy + 90); g.lineTo(cx - 310, cy + 110); g.stroke(); }
      if (i === 4) { for (let k = 0; k < 4; k++) { g.strokeRect(cx - 360, cy - 170 + k * 80, 300, 64); g.beginPath(); g.arc(cx - 100, cy - 138 + k * 80, 9, 0, 7); g.fill(); }
        g.beginPath(); g.ellipse(cx + 220, cy - 140, 130, 40, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(cx + 90, cy - 140); g.lineTo(cx + 90, cy + 140); g.moveTo(cx + 350, cy - 140); g.lineTo(cx + 350, cy + 140); g.stroke(); g.beginPath(); g.ellipse(cx + 220, cy + 140, 130, 40, 0, 0, Math.PI); g.stroke(); g.beginPath(); g.ellipse(cx + 220, cy, 130, 40, 0, 0, Math.PI); g.stroke(); }
      g.font = `700 60px "${F}"`; g.fillText(`${i + 1}  ${layer.name}`, 50, 80);
      if (i !== 0) { g.font = `500 34px "${FM}"`; g.globalAlpha = 0.8; g.fillText(layer.note, 50, h - 70); g.globalAlpha = 1; }
    };
    const glassMat = () => new T.MeshPhysicalMaterial({ color: '#9fe9ef', roughness: 0.08, metalness: 0, transparent: true, opacity: 0.16, clearcoat: 1, depthWrite: false, side: T.DoubleSide });
    const sheets = this.layers.map((layer, i) => {
      const g = new T.Group(); scene.add(g);
      const slab = new T.Mesh(new T.BoxGeometry(SW, 0.07, SD), glassMat()); g.add(slab);
      const tex = K.canvasTex(1200, 800, (c, r, w, h) => draw(c, i, w, h, layer));
      const diag = new T.Mesh(new T.PlaneGeometry(SW * 0.98, SD * 0.98), new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.35, toneMapped: false, depthWrite: false, blending: T.AdditiveBlending }));
      diag.rotation.x = -Math.PI / 2; diag.position.y = 0.04; g.add(diag);
      const edges = new T.LineSegments(new T.EdgesGeometry(slab.geometry), new T.LineBasicMaterial({ color: AQ, transparent: true, opacity: 0.5, toneMapped: false })); g.add(edges);
      const halo = new T.Mesh(new T.BoxGeometry(SW + 0.12, 0.1, SD + 0.12), new T.MeshBasicMaterial({ color: AQ, transparent: true, opacity: 0.0, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false })); g.add(halo);
      const lamp = new T.PointLight(AQ, 0, 6); lamp.position.y = 0.6; g.add(lamp);
      const tag = K.label(`${i + 1}  ${layer.name}`, { font: F, weight: 700, px: 64, color: '#e9fffd', bg: 'rgba(8,30,34,0.85)', radius: 10, pad: 0.3, height: 0.42 });
      tag.position.set(-SW / 2 - 0.2, 0.25, SD / 2 - 0.2); g.add(tag);
      return { g, slab, diag, edges, halo, lamp, tag };
    });
    // the signal: a bright core and a trail of fading spheres
    const sigMat = new T.MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
    const sig = new T.Mesh(new T.SphereGeometry(0.13, 20, 14), sigMat); scene.add(sig);
    const sigLight = new T.PointLight('#bffcff', 3, 5); sig.add(sigLight);
    const glowTex = K.canvasTex(64, 64, g => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
    const halo = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: AQ, transparent: true, blending: T.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(1.1); sig.add(halo);
    const NT = 18, trail = Array.from({ length: NT }, (_, i) => { const s = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: AQ, transparent: true, opacity: 0.5 * (1 - i / NT), blending: T.AdditiveBlending, depthWrite: false })); s.scale.setScalar(0.5 * (1 - i / NT) + 0.1); scene.add(s); return s; });
    // the beam column the signal travels in
    const column = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 1, 8, 1, true), new T.MeshBasicMaterial({ color: AQ, transparent: true, opacity: 0.18, blending: T.AdditiveBlending, depthWrite: false })); scene.add(column);
    // floating specks of light around the stack
    const NP = 220, pg = new T.BufferGeometry(), pp = new Float32Array(NP * 3), pr = K.rng(3), p0 = [];
    for (let i = 0; i < NP; i++) p0.push([pr.range(-7, 7), pr.range(0, 8), pr.range(-6, 4), pr() * 6]);
    pg.setAttribute('position', new T.BufferAttribute(pp, 3));
    scene.add(new T.Points(pg, new T.PointsMaterial({ map: glowTex, color: AQ, size: 0.08, transparent: true, opacity: 0.6, depthWrite: false, blending: T.AdditiveBlending })));

    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 84, color: '#e9fffd', height: 0.48 });
      l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.75, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [6.0, 5.0, 10.5], look: [0, 0.9, 0] },
      { t: 2.2, pos: [8.5, 9.4, 14.0], look: [-0.3, 3.1, 0] },
      { t: 6.6, pos: [7.5, 8.8, 15.0], look: [-0.3, 3.1, 0] },
      { t: 11, pos: [6.0, 9.2, 15.5], look: [-0.3, 3.2, 0] },
    ], S.camera);
    const N = sheets.length, sx = 1.2, sz = 0.4;
    const layerY = (i, sep) => 0.35 + (N - 1 - i) * K.lerp(0.22, 1.3, sep);

    return (t, realT) => {
      cam(t);
      const sep = K.prog(t, 0.3, B[1] + 0.4, 'inOut');
      // where the signal is: down one layer per beat, back up in the last beat
      let sy, lit = 0;
      const down = i => layerY(i, sep) + 0.3;
      if (t < B[N - 1]) {
        let k = 0; for (let i = 0; i < N - 1; i++) if (t >= B[i]) k = i;
        const p = K.prog(t, B[k], B[k] + 0.6, 'inOut');
        sy = k === 0 ? K.lerp(down(0) + 1.6, down(0), K.prog(t, 0.2, 0.9, 'inOut')) : K.lerp(down(k - 1), down(k), p);
        lit = k;
      } else {
        const q1 = K.prog(t, B[N - 1], B[N - 1] + 0.4, 'inOut'), q2 = K.prog(t, B[N - 1] + 0.6, B[N - 1] + 1.6, 'inOut');
        sy = K.lerp(K.lerp(down(N - 2), down(N - 1), q1), down(0) + 0.9, q2); lit = q2 > 0 ? -1 : N - 1;
      }
      const back = t >= B[N - 1] + 0.6;
      sig.position.set(sx, sy, sz); sigMat.color.set(back ? '#fff3c4' : '#ffffff'); halo.material.color.set(back ? '#ffd27a' : AQ);
      trail.forEach((s, i) => { s.position.set(sx, sy + (back ? -1 : 1) * i * 0.07, sz); s.material.color.copy(halo.material.color); });
      column.position.set(sx, (layerY(0, sep) + 1 + layerY(N - 1, sep)) / 2, sz); column.scale.y = layerY(0, sep) + 1 - layerY(N - 1, sep);
      sheets.forEach((sh, i) => {
        sh.g.position.y = layerY(i, sep) + 0.03 * Math.sin(realT * 0.8 + i);
        sh.g.rotation.y = 0.04 * Math.sin(realT * 0.3 + i * 0.7);
        const on = lit === i || (lit === -1) ? 1 : 0;
        const done = back ? K.prog(t, B[N - 1] + 0.6 + (N - 1 - i) * 0.2, B[N - 1] + 0.9 + (N - 1 - i) * 0.2) : 0;
        const a = Math.max(on && !back ? 1 : 0, done);
        sh.diag.material.opacity = 0.28 + 0.72 * a; sh.edges.material.opacity = 0.35 + 0.65 * a;
        sh.halo.material.opacity = 0.18 * a * (0.8 + 0.2 * Math.sin(realT * 6)); sh.lamp.intensity = 2.5 * a;
        if (back) { sh.halo.material.color.set('#ffd27a'); sh.lamp.color.set('#ffd27a'); }
        sh.tag.lookAt(S.camera.position); sh.tag.material.opacity = (0.55 + 0.45 * a) * (i === 0 ? 1 : K.prog(sep, 0.6, 0.95)); sh.tag.visible = sh.tag.material.opacity > 0.01; sh.tag.scale.setScalar(1 + 0.15 * a);
      });
      for (let i = 0; i < NP; i++) { const [x, y, z, ph] = p0[i]; pp[i * 3] = x + 0.2 * Math.sin(realT * 0.3 + ph); pp[i * 3 + 1] = (y + realT * 0.15) % 8; pp[i * 3 + 2] = z; }
      pg.attributes.position.needsUpdate = true;
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('space', { gain: 0.1 });
    k.play('riser', { t: 0.2, gain: 0.15, pitch: 1.2, dur: 0.6 });
    k.play('glass', { t: 0.9, gain: 0.3, pitch: 1.3 });
    B.slice(1, 4).forEach((b, i) => { k.play('swish', { t: b, gain: 0.25, pitch: 1.5 - i * 0.15, dur: 0.6 }); k.play('blip', { t: b + 0.6, gain: 0.3, pitch: 1.0 - i * 0.1 }); k.play('glass', { t: b + 0.62, gain: 0.2, pitch: 1.1 - i * 0.1 }); });
    k.play('blip', { t: B[4] + 0.4, gain: 0.3, pitch: 0.6 });
    k.play('riser', { t: B[4] + 0.6, gain: 0.2, pitch: 1.0, dur: 0.9 });
    k.play('chime', { t: B[4] + 1.7, gain: 0.25, pitch: 1.2, music: true });
  },
  post: null,
};
