window.STYLES = window.STYLES || {};
STYLES['stained-glass'] = {
  id: 'stained-glass', name: 'Stained Glass',
  family: 'Flat content made physical',
  use: 'Story',
  look: 'A tall arched church window in a dark stone wall: coloured glass panes held by black lead lines. Shafts of light with drifting dust carry the colours across the room and lay them on the stone floor.',
  motion: 'The sun moves outside. One panel after another lights up, its beam sweeps in, and its picture appears on the floor. The last panel lights the whole window.',
  shownHere: 'The life cycle of a butterfly: an egg on a leaf, a caterpillar that eats and grows, a chrysalis, and a butterfly.',
  goodFor: 'Life cycles, stages and sequences told as a set of pictures: history, seasons, steps of a process, chapters of a story.',
  fonts: ['Cormorant SC:wght@700'],
  duration: 11,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'An egg on a leaf' },
    { t: 2.7, label: 'A caterpillar eats and grows' },
    { t: 5.4, label: 'It makes a chrysalis' },
    { t: 8.1, label: 'A butterfly comes out' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Cormorant SC';
    scene.background = new T.Color('#07070a'); scene.add(S.camera);
    const amb = new T.HemisphereLight('#3a3a4a', '#1a120a', 0.7); scene.add(amb); S.camera.fov = 36; S.camera.updateProjectionMatrix();
    const fillF = new T.DirectionalLight('#ffd9a0', 0.35); fillF.position.set(2, 6, 14); scene.add(fillF);
    // stone wall and floor
    const stone = (seed, tone) => K.canvasTex(1024, 1024, (g, r, w, h) => { g.fillStyle = tone; g.fillRect(0, 0, w, h); for (let y = 0, row = 0; y < h; y += 96, row++) for (let x = -(row % 2) * 90; x < w; x += 180) { g.fillStyle = `hsl(30, 8%, ${r.range(16, 26)}%)`; g.fillRect(x + 3, y + 3, 174, 90); for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(0,0,0,${r.range(0.05, 0.2)})`; g.fillRect(x + r() * 174, y + r() * 90, r.range(2, 10), r.range(1, 4)); } } }, seed);
    const wallTex = stone(3, '#0c0b0a'); wallTex.wrapS = wallTex.wrapT = T.RepeatWrapping; wallTex.repeat.set(3, 2.4);
    const wall = new T.Mesh(new T.PlaneGeometry(24, 18), new T.MeshStandardMaterial({ map: wallTex, roughness: 0.95 })); wall.position.set(0, 7, 0); wall.receiveShadow = true; scene.add(wall);
    const floorTex = stone(7, '#0c0b0a'); floorTex.wrapS = floorTex.wrapT = T.RepeatWrapping; floorTex.repeat.set(3, 2.4);
    const floor = new T.Mesh(new T.PlaneGeometry(24, 20), new T.MeshStandardMaterial({ map: floorTex, roughness: 0.85 })); floor.rotation.x = -Math.PI / 2; floor.position.z = 9; floor.receiveShadow = true; scene.add(floor);
    // the window panels: glass pieces with lead lines, drawn on canvases
    const lead = (g, lw = 9) => { g.strokeStyle = '#0b0a09'; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); };
    const poly = (g, pts, fill) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = fill; g.fill(); lead(g); };
    const ellipse = (g, x, y, rx, ry, rot, fill) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fillStyle = fill; g.fill(); lead(g); };
    const backdrop = (g, r, w, h, hues) => { const n = 5, m = 6, P = []; for (let j = 0; j <= m; j++) for (let i = 0; i <= n; i++) P.push([i / n * w + (i % n ? r.range(-25, 25) : 0), j / m * h + (j % m ? r.range(-25, 25) : 0)]);
      for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) { const a = P[j * (n + 1) + i], b = P[j * (n + 1) + i + 1], c = P[(j + 1) * (n + 1) + i + 1], d = P[(j + 1) * (n + 1) + i]; poly(g, [a, b, c, d], `hsl(${r.pick(hues)}, ${r.range(45, 70)}%, ${r.range(30, 48)}%)`); } };
    const leaf = (g, x, y, s, rot) => { g.save(); g.translate(x, y); g.rotate(rot); poly(g, [[0, -s], [s * 0.45, -s * 0.3], [s * 0.4, s * 0.5], [0, s], [-s * 0.4, s * 0.5], [-s * 0.45, -s * 0.3]], '#3f8f3a'); g.beginPath(); g.moveTo(0, -s); g.lineTo(0, s); lead(g, 6); g.restore(); };
    const W = 512, H = 640;
    const panels = [
      (g, r) => { backdrop(g, r, W, H, [200, 210, 195]); leaf(g, 250, 340, 220, 0.5); ellipse(g, 280, 320, 34, 44, 0.3, '#f4edd2'); ellipse(g, 230, 360, 28, 36, 0.3, '#f4edd2'); },
      (g, r) => { backdrop(g, r, W, H, [190, 205, 215]); leaf(g, 230, 360, 230, -0.6); for (let i = 0; i < 7; i++) ellipse(g, 120 + i * 45, 300 + Math.sin(i * 0.9) * 30, 30, 34, 0, i % 2 ? '#c6d84a' : '#e7e2c8'); ellipse(g, 120, 300, 32, 36, 0, '#2a2a2a'); },
      (g, r) => { backdrop(g, r, W, H, [205, 220, 200]); poly(g, [[60, 120], [450, 90], [455, 130], [65, 160]], '#7a4a2a'); poly(g, [[256, 130], [320, 220], [330, 380], [290, 500], [256, 540], [222, 500], [182, 380], [192, 220]], '#3fae8a'); for (let i = 0; i < 4; i++) ellipse(g, 220 + i * 24, 260, 8, 8, 0, '#e8c23a'); },
      (g, r) => { backdrop(g, r, W, H, [200, 215, 45]); const wing = (s) => { poly(g, [[256, 320], [256 + s * 60, 160], [256 + s * 210, 120], [256 + s * 230, 260], [256 + s * 120, 330]], '#ef7d1a'); poly(g, [[256, 330], [256 + s * 120, 340], [256 + s * 190, 470], [256 + s * 80, 520]], '#f29a2e'); [[150, 180], [200, 220], [120, 420]].forEach(([dx, dy]) => ellipse(g, 256 + s * (dx - 30), dy, 12, 12, 0, '#f4edd2')); };
        wing(-1); wing(1); ellipse(g, 256, 340, 18, 120, 0, '#1d1a18'); g.beginPath(); g.moveTo(250, 230); g.lineTo(210, 150); g.moveTo(262, 230); g.lineTo(302, 150); lead(g, 6); },
    ];
    const PW = 1.7, PH = PW * H / W, GX = 0.22, top = 5.3;
    const pos = [[-PW / 2 - GX / 2, top - PH / 2], [PW / 2 + GX / 2, top - PH / 2], [-PW / 2 - GX / 2, top - PH * 1.5 - GX], [PW / 2 + GX / 2, top - PH * 1.5 - GX]];
    const texs = panels.map((draw, i) => K.canvasTex(W, H, (g, r) => draw(g, r), 20 + i));
    const glass = texs.map((tx, i) => { const m = new T.Mesh(new T.PlaneGeometry(PW, PH), new T.MeshBasicMaterial({ map: tx, toneMapped: false, color: '#222' })); m.position.set(pos[i][0], pos[i][1], 0.02); scene.add(m); return m; });
    // the arch with a rose: a half disc of pieces above the panels
    const roseTex = K.canvasTex(1024, 512, (g, r, w, h) => { g.fillStyle = '#0b0a09'; g.fillRect(0, 0, w, h); for (let i = 0; i < 12; i++) { const a0 = Math.PI + i / 12 * Math.PI, a1 = a0 + Math.PI / 12; g.beginPath(); g.moveTo(w / 2, h); g.arc(w / 2, h, h * 0.95, a0, a1); g.closePath(); g.fillStyle = `hsl(${i % 2 ? 45 : 200}, 70%, ${i % 2 ? 55 : 40}%)`; g.fill(); lead(g, 10); } g.beginPath(); g.arc(w / 2, h, h * 0.3, Math.PI, 0); g.fillStyle = '#f2c94c'; g.fill(); lead(g, 10); });
    const rose = new T.Mesh(new T.CircleGeometry(PW + GX / 2, 48, 0, Math.PI), new T.MeshBasicMaterial({ map: roseTex, toneMapped: false, color: '#222' })); rose.position.set(0, top + 0.05, 0.02); scene.add(rose);
    // stone frame: mullion and jambs
    const fm = new T.MeshStandardMaterial({ color: '#2a2622', roughness: 0.9 });
    [[0, top - PH - GX / 2, GX, PH * 2 + GX], [-PW - GX * 1.2, top - PH - GX / 2, GX * 1.4, PH * 2 + GX + 0.4], [PW + GX * 1.2, top - PH - GX / 2, GX * 1.4, PH * 2 + GX + 0.4], [0, top - PH, PW * 2 + GX, GX * 0.8], [0, top - PH * 2 - GX * 1.1, PW * 2 + GX * 3, GX * 1.4]].forEach(([x, y, w, h]) => { const b = new T.Mesh(new T.BoxGeometry(w, h, 0.5), fm); b.position.set(x, y, 0.15); b.castShadow = b.receiveShadow = true; scene.add(b); });
    const arch = new T.Mesh(new T.TorusGeometry(PW + GX * 0.9, GX * 0.7, 8, 40, Math.PI), fm); arch.position.set(0, top, 0.15); scene.add(arch);
    // light: beams from each panel to the floor, coloured pools on the floor, dust
    const sunDir = t => new T.Vector3(K.lerp(-0.5, 0.4, t / 11), -1.9, 1).normalize();
    const hitFloor = (p, d) => p.clone().addScaledVector(d, -p.y / d.y);
    const beams = texs.map((tx, i) => {
      const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(new Float32Array(8 * 3), 3));
      geo.setAttribute('uv', new T.BufferAttribute(new Float32Array([0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0]), 2));
      geo.setIndex([0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7]);
      const beamTex = K.canvasTex(64, 256, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0.05)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
      const avg = new T.Color(['#c9e8a0', '#d8e890', '#9fe0c0', '#ffb060'][i]);
      const m = new T.Mesh(geo, new T.MeshBasicMaterial({ map: beamTex, color: avg, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, toneMapped: false })); scene.add(m);
      const pool = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: tx, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false })); pool.rotation.x = -Math.PI / 2; scene.add(pool);
      return { m, geo, pool };
    });
    const ND = 300, dg = new T.BufferGeometry(), dpos = new Float32Array(ND * 3), dr = K.rng(4), d0 = Array.from({ length: ND }, () => [dr.range(-3, 3), dr.range(0.5, 10), dr.range(0.5, 9), dr() * 6]);
    dg.setAttribute('position', new T.BufferAttribute(dpos, 3));
    const dust = new T.Points(dg, new T.PointsMaterial({ color: '#ffe9c0', size: 0.035, transparent: true, opacity: 0.0, depthWrite: false, blending: T.AdditiveBlending })); scene.add(dust);
    const pew = new T.Group(); [[-5, 6], [5, 6], [-5, 9.5], [5, 9.5]].forEach(([x, z]) => { const p = new T.Mesh(new T.BoxGeometry(5, 0.9, 0.6), new T.MeshStandardMaterial({ color: '#2a1a10', roughness: 0.6 })); p.position.set(x, 0.9, z); p.castShadow = true; pew.add(p); const s = new T.Mesh(new T.BoxGeometry(5, 0.12, 1.2), p.material); s.position.set(x, 0.5, z + 0.5); pew.add(s); }); scene.add(pew);
    const candle = new T.PointLight('#ffb050', 4, 8, 1.6); candle.position.set(-3.2, 1.6, 2.2); scene.add(candle);
    const cstick = new T.Mesh(new T.CylinderGeometry(0.08, 0.1, 1.2, 12), new T.MeshStandardMaterial({ color: '#efe6d0', roughness: 0.6 })); cstick.position.set(-3.2, 0.6, 2.2); scene.add(cstick);
    const flame = new T.Mesh(new T.SphereGeometry(0.06, 10, 8), new T.MeshBasicMaterial({ color: '#ffd080', toneMapped: false })); flame.scale.y = 2; flame.position.set(-3.2, 1.3, 2.2); scene.add(flame);
    const two = s => { const w = s.split(' '), h = Math.ceil(w.length / 2); return w.slice(0, h).join(' ') + String.fromCharCode(10) + w.slice(h).join(' '); };
    const titles = this.beats.map(b => { const l = K.label(two(b.label), { font: F, weight: 700, px: 84, color: '#f5e7c6', height: 0.42, align: 'left' }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(1.7 + l.userData.w / 2, 0.2, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [-1.6, 4.1, 12.0], look: [-0.2, 3.2, 1.0] },
      { t: 5.4, pos: [0.5, 4.0, 12.6], look: [0, 3.1, 1.2] },
      { t: 11, pos: [1.6, 4.3, 13.0], look: [0.2, 3.0, 1.3] },
    ], S.camera);
    return (t, realT) => {
      cam(t);
      const d = sunDir(t);
      const on = [0, 1, 2, 3].map(i => K.prog(t, (i === 0 ? -0.5 : B[i]) + 0.1, (i === 0 ? 0.3 : B[i]) + 0.9, 'inOut'));
      const all = K.prog(t, B[3] + 1.2, B[3] + 2.0);
      glass.forEach((g, i) => { const b = 0.18 + 1.1 * on[i] + 0.05 * Math.sin(realT * 1.3 + i); g.material.color.setScalar(b); });
      rose.material.color.setScalar(0.18 + 1.0 * all);
      beams.forEach((bm, i) => {
        const [cx, cy] = pos[i], hw = PW / 2, hh = PH / 2, corners = [[cx - hw, cy + hh], [cx + hw, cy + hh], [cx + hw, cy - hh], [cx - hw, cy - hh]].map(([x, y]) => new T.Vector3(x, y, 0.05));
        const fl = corners.map(c => hitFloor(c, d).setY(0.02));
        const a = bm.geo.attributes.position; corners.concat(fl).forEach((p, k) => a.setXYZ(k, p.x, p.y, p.z)); a.needsUpdate = true; bm.geo.computeBoundingSphere();
        bm.m.material.opacity = 0.08 * on[i] * (0.85 + 0.15 * Math.sin(realT * 0.7 + i));
        const c = fl.reduce((s, p) => s.add(p), new T.Vector3()).multiplyScalar(0.25);
        bm.pool.position.set(c.x, 0.03, c.z); bm.pool.scale.set(Math.abs(fl[1].x - fl[0].x), Math.abs(fl[3].z - fl[0].z), 1); bm.pool.material.opacity = 0.75 * on[i];
      });
      const any = Math.max(...on);
      for (let i = 0; i < ND; i++) { const [x, y, z, ph] = d0[i]; dpos[i * 3] = x + 0.3 * Math.sin(realT * 0.2 + ph) + (y - 5) * d.x * 0.3; dpos[i * 3 + 1] = y + 0.2 * Math.sin(realT * 0.3 + ph * 2); dpos[i * 3 + 2] = z; }
      dg.attributes.position.needsUpdate = true; dust.material.opacity = 0.75 * any;
      candle.intensity = 4 + 0.6 * Math.sin(realT * 11) + 0.4 * Math.sin(realT * 23); flame.scale.y = 2 + 0.2 * Math.sin(realT * 17);
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.08 }); k.bed('wind', { gain: 0.03 });
    B.forEach((b, i) => { k.play('bell', { t: b + 0.3, gain: 0.18, pitch: [1, 1.26, 1.5, 2][i], music: true }); k.play('glass', { t: b + 0.25, gain: 0.15, pitch: 1.2 + i * 0.1 }); k.play('swish', { t: b + 0.2, gain: 0.1, pitch: 0.6, dur: 1.5 }); });
    k.play('chime', { t: B[3] + 1.3, gain: 0.25, pitch: 1.0, music: true });
    k.play('sparkle', { t: B[3] + 1.4, gain: 0.2 });
  },
  post: null,
};
