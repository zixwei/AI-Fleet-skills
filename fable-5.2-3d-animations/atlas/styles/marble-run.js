window.STYLES = window.STYLES || {};
STYLES['marble-run'] = {
  id: 'marble-run', name: 'Marble Run',
  family: 'Machines that explain',
  use: 'Explainer',
  look: 'A wall-mounted wooden marble run filmed like a product: an oiled walnut board, maple rails, brass pins and engraved brass plates, glass marbles with coloured cores, glass jars at the bottom. Warm key light with crisp reflections.',
  motion: 'Marbles wait behind brass stop pins, roll when a pin drops, and gates open trapdoors that drop the wrong ones. Each beat releases the next pin.',
  shownHere: 'How a spam filter sorts email: every message passes a sender check, a word check and a score check, and only the clean ones reach the inbox.',
  goodFor: 'Sorting, filtering and routing: a stream of items, a series of checks, and bins that count the results.',
  fonts: ['Montserrat:wght@700;800'],
  duration: 12,
  samples: 6,
  // CONTENT: 9 emails. Gate 1 drops 2, gate 2 drops 2, gate 3 drops 1, 4 reach the inbox.
  beats: [
    { t: 0.0, label: 'New mail arrives' },
    { t: 2.5, label: 'Check the sender' },
    { t: 5.0, label: 'Check the words' },
    { t: 7.5, label: 'Score it and sort it' },
  ],
  mail: ['ok', 'sender', 'ok', 'words', 'ok', 'sender', 'score', 'words', 'ok'],
  plates: ['1 SENDER', '2 WORDS', '3 SCORE'],
  jars: ['INBOX', 'SPAM'],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Montserrat';
    scene.background = new T.Color('#1b1512'); scene.add(S.camera);
    const L = K.lights(S, 'lamp', { size: 7, target: [0, 0, 0] });
    L.key.position.set(4, 7, 9); L.key.intensity = 3.2; L.amb.intensity = 0.6; S.scene.environmentIntensity = 0.8;
    const spot = new T.SpotLight('#ffe8c8', 60, 30, 0.7, 0.6, 1.2); spot.position.set(-6, 6, 9); spot.target.position.set(0, 0, 0); scene.add(spot, spot.target);

    // board: oiled walnut with a bevelled maple frame
    const walnut = K.canvasTex(1024, 768, (g, r, w, h) => {
      g.fillStyle = '#4a2e1f'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(${r() < 0.5 ? 30 : 120},${r() < 0.5 ? 18 : 70},${r() < 0.5 ? 10 : 40},${r.range(0.05, 0.22)})`; g.lineWidth = r.range(1, 5);
        const y = r() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + r.range(-30, 30), w * 0.7, y + r.range(-30, 30), w, y + r.range(-20, 20)); g.stroke(); }
      for (let i = 0; i < 6; i++) { const x = r() * w, y = r() * h; for (let k = 1; k < 8; k++) { g.strokeStyle = 'rgba(25,14,8,0.18)'; g.beginPath(); g.ellipse(x, y, k * 9, k * 4, 0, 0, 7); g.stroke(); } }
    }, 3);
    const board = new T.Mesh(new T.BoxGeometry(10.8, 8.0, 0.3), new T.MeshStandardMaterial({ map: walnut, roughness: 0.45, metalness: 0.0 }));
    board.position.z = -0.15; board.receiveShadow = true; scene.add(board);
    const maple = new T.MeshStandardMaterial({ color: '#e6c995', roughness: 0.5 });
    [[0, 4.05, 11.2, 0.3], [0, -4.05, 11.2, 0.3], [-5.5, 0, 0.3, 8.4], [5.5, 0, 0.3, 8.4]].forEach(([x, y, w, h]) => { const m = new T.Mesh(new T.BoxGeometry(w, h, 0.5), maple); m.position.set(x, y, 0); m.castShadow = m.receiveShadow = true; scene.add(m); });
    const wall = new T.Mesh(new T.PlaneGeometry(60, 30), new T.MeshStandardMaterial({ color: '#2a201a', roughness: 1 })); wall.position.z = -0.4; wall.receiveShadow = true; scene.add(wall);
    const brass = new T.MeshStandardMaterial({ color: '#d8a84e', metalness: 1, roughness: 0.28 });
    // decorative brass studs
    const studs = new T.InstancedMesh(new T.CylinderGeometry(0.05, 0.05, 0.12, 12).rotateX(Math.PI / 2), brass, 64); let si = 0;
    const MX = new T.Matrix4();
    for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) studs.setMatrixAt(si++, MX.makeTranslation(-4.9 + i * 0.65, [3.65, -3.65, 3.65, -3.65][j] + (j > 1 ? (j === 2 ? -0.25 : 0.25) : 0), 0.06));
    studs.castShadow = true; scene.add(studs);

    // the path: hopper -> ramp 1 (right) -> bend -> ramp 2 (left) -> bend -> ramp 3 (right) -> drop into the inbox jar
    const Z = 0.36, R = 0.18;
    const bend = (cx, cy, r, dir) => Array.from({ length: 9 }, (_, i) => { const a = Math.PI / 2 - (i / 8) * Math.PI; return [cx + dir * r * Math.cos(a), cy + r * Math.sin(a)]; });
    const pts2 = [[-4.7, 3.3], [3.3, 2.85], ...bend(3.3, 2.5, 0.35, 1).slice(1), [-3.3, 1.6], ...bend(-3.3, 1.25, 0.35, -1).slice(1), [3.3, 0.35]];
    const path = new T.CurvePath();
    for (let i = 0; i < pts2.length - 1; i++) path.add(new T.LineCurve3(new T.Vector3(pts2[i][0], pts2[i][1], Z), new T.Vector3(pts2[i + 1][0], pts2[i + 1][1], Z)));
    const LEN = path.getLength(), lens = path.getCurveLengths();
    const sAtX = (seg, x) => { // arc length where straight ramp `seg` (0, 1, 2) reaches x
      const idx = [0, 9, 18][seg], a = pts2[idx], b = pts2[idx + 1], s0 = idx ? lens[idx - 1] : 0;
      return s0 + Math.hypot(b[0] - a[0], b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
    };
    const at = s => path.getPointAt(K.clamp(s / LEN, 0, 1));
    // rails: two maple rods under the marble line, and brass rods on the bends
    const railPts = path.getSpacedPoints(400).map(p => new T.Vector3(p.x, p.y - R - 0.04, 0));
    [0.2, 0.52].forEach(z => { const c = new T.CatmullRomCurve3(railPts.map(p => p.clone().setZ(z)), false, 'catmullrom', 0.1); const m = new T.Mesh(new T.TubeGeometry(c, 600, 0.045, 8), maple); m.castShadow = true; scene.add(m); });
    for (let i = 0; i < 400; i += 25) { const p = railPts[i], post = new T.Mesh(new T.CylinderGeometry(0.03, 0.03, 0.55, 8).rotateX(Math.PI / 2), brass); post.position.set(p.x, p.y - 0.02, 0.25); scene.add(post); }
    // spam trough along the bottom, sloping left to the spam jar
    const trough = [[3.0, -2.0], [-4.0, -2.35]];
    const tc = new T.LineCurve3(new T.Vector3(trough[0][0], trough[0][1] - R - 0.04, 0.2), new T.Vector3(trough[1][0], trough[1][1] - R - 0.04, 0.2));
    [0.2, 0.52].forEach(z => { const m = new T.Mesh(new T.TubeGeometry(new T.LineCurve3(tc.v1.clone().setZ(z), tc.v2.clone().setZ(z)), 20, 0.045, 8), maple); m.castShadow = true; scene.add(m); });
    const troughY = x => K.lerp(trough[0][1], trough[1][1], (trough[0][0] - x) / (trough[0][0] - trough[1][0]));

    // jars: glass cylinders with a paper label that counts
    const glass = new T.MeshPhysicalMaterial({ color: '#e8f4ff', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.22, clearcoat: 1, side: T.DoubleSide, depthWrite: false });
    const jarAt = [[4.1, -2.95], [-4.55, -2.95]];
    const counts = jarAt.map(([x, y], j) => {
      const jar = new T.Mesh(new T.CylinderGeometry(0.62, 0.62, 1.2, 40, 1, true), glass); jar.position.set(x, y, 0.45); scene.add(jar);
      const lip = new T.Mesh(new T.TorusGeometry(0.62, 0.05, 10, 40), glass); lip.rotation.x = Math.PI / 2; lip.position.set(x, y + 0.6, 0.45); scene.add(lip);
      const base = new T.Mesh(new T.CylinderGeometry(0.64, 0.64, 0.08, 40), new T.MeshStandardMaterial({ color: '#cfe6f0', transparent: true, opacity: 0.5, roughness: 0.1 })); base.position.set(x, y - 0.6, 0.45); scene.add(base);
      const n = this.mail.filter(m => (m === 'ok') === (j === 0)).length;
      const tags = Array.from({ length: n + 1 }, (_, c) => { const l = K.label(`${this.jars[j]}  ${c}`, { font: F, weight: 800, px: 56, color: j ? '#8a1c1c' : '#1d5e35', bg: '#f6efe0', radius: 10, pad: 0.3, height: 0.36 }); l.position.set(x, y - 0.05, 1.1); scene.add(l); l.visible = c === 0; return l; });
      return tags;
    });

    // engraved brass plates for the gates and a sign at the hopper
    const plate = (txt, w = 1.6) => {
      const tex = K.canvasTex(512, 128, (g, r, cw, ch) => {
        const gr = g.createLinearGradient(0, 0, cw, ch); gr.addColorStop(0, '#f2cf7d'); gr.addColorStop(0.5, '#c8933a'); gr.addColorStop(1, '#e8bb63');
        g.fillStyle = gr; g.beginPath(); g.roundRect(4, 4, cw - 8, ch - 8, 14); g.fill();
        g.strokeStyle = 'rgba(90,55,15,0.7)'; g.lineWidth = 5; g.beginPath(); g.roundRect(14, 14, cw - 28, ch - 28, 8); g.stroke();
        g.font = `800 64px "${F}"`; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillStyle = 'rgba(255,240,200,0.6)'; g.fillText(txt, cw / 2 + 2, ch / 2 + 6); g.fillStyle = '#4a2c0c'; g.fillText(txt, cw / 2, ch / 2 + 4);
        [[30, 64], [cw - 30, 64]].forEach(([x, y]) => { g.fillStyle = '#7a5520'; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); });
      });
      const m = new T.Mesh(new T.BoxGeometry(w, w / 4, 0.04), [brass, brass, brass, brass, new T.MeshStandardMaterial({ map: tex, metalness: 0.8, roughness: 0.35 }), brass]);
      m.castShadow = true; return m;
    };
    const GATE_X = [0.6, -0.6, 1.4], PIN_X = [-0.6, 2.0, -1.4];
    const gateS = GATE_X.map((x, k) => sAtX(k, x)), pinS = PIN_X.map((x, k) => sAtX(k, x));
    const plates = this.plates.map((txt, k) => { const p = plate(txt); const q = at(gateS[k]); p.position.set(q.x, q.y + 0.62, 0.05); scene.add(p); return p; });
    const sign = plate('NEW MAIL', 1.9); sign.position.set(-3.8, 3.75, 0.08); scene.add(sign);
    // stop pins (they slide back into the board) and trapdoor flaps at the gates
    const pins = pinS.map(s => { const q = at(s + R + 0.06), m = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 0.7, 14).rotateX(Math.PI / 2), brass); m.position.set(q.x, q.y + 0.02, 0.36); m.castShadow = true; scene.add(m); return m; });
    const flaps = gateS.map(s => { const q = at(s), g = new T.Group(), f = new T.Mesh(new T.BoxGeometry(0.5, 0.05, 0.36), brass); f.position.x = 0.25; g.add(f); g.position.set(q.x - 0.25, q.y - R - 0.06, Z); scene.add(g); return g; });
    const lamps = gateS.map(s => { const q = at(s), m = new T.Mesh(new T.SphereGeometry(0.09, 16, 10), new T.MeshStandardMaterial({ color: '#5a1010', emissive: '#ff3030', emissiveIntensity: 0 })); m.position.set(q.x + 0.95, q.y + 0.62, 0.12); scene.add(m); return m; });

    // marbles: clear glass with a core that lights red (caught) or green (delivered)
    const shell = new T.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.02, transparent: true, opacity: 0.35, clearcoat: 1, depthWrite: false });
    const D = 2 * R + 0.02, V0 = 4.6, G = 7;
    const kind = this.mail;
    // timeline: who is still on the run at each segment, and where each one waits
    const seg = [kind.map((_, i) => i)];
    ['sender', 'words', 'score'].forEach((why, k) => seg.push(seg[k].filter(i => kind[i] !== why)));
    const endS = LEN - 0.02;
    const marbles = kind.map((kd, i) => {
      const g = new T.Group(), outer = new T.Mesh(new T.SphereGeometry(R, 24, 16), shell);
      const coreMat = new T.MeshStandardMaterial({ color: '#f4f1ea', emissive: '#000000', roughness: 0.3 });
      const core = new T.Mesh(new T.SphereGeometry(R * 0.55, 16, 10), coreMat);
      const band = new T.Mesh(new T.TorusGeometry(R * 0.6, 0.025, 6, 20), coreMat);
      g.add(outer, core, band); g.castShadow = true; core.castShadow = true; scene.add(g);
      const legs = [];
      for (let k = 0; k < 3; k++) {
        const j = seg[k].indexOf(i); if (j < 0) break;
        const s0 = k === 0 ? pinS[0] - j * D : legs[legs.length - 1].s1;
        const t0 = B[k + 1] + 0.25 + j * 0.12;
        const caught = !seg[k + 1].includes(i);
        const s1 = caught ? gateS[k] : k < 2 ? pinS[k + 1] - seg[k + 1].indexOf(i) * D : endS;
        legs.push({ k, s0, s1, t0, t1: t0 + Math.max(0.35, (s1 - s0) / V0) + 0.2, caught, wait: k === 0 ? null : 1 });
      }
      const last = legs[legs.length - 1];
      const spamOrder = kind.map((_, n) => n).filter(n => kind[n] !== 'ok').sort((a, b) => {
        const la = (m) => { for (let k = 0; k < 3; k++) if (!seg[k + 1].includes(m) && seg[k].includes(m)) return k; }; return la(a) - la(b) || a - b; });
      const slot = kd === 'ok' ? seg[3].indexOf(i) : spamOrder.indexOf(i);
      return { g, coreMat, legs, last, kd, slot };
    });
    const slotPos = (jar, n) => new T.Vector3(jarAt[jar][0] + [-0.25, 0.25, 0, -0.25, 0.25][n % 5] * 0.9, jarAt[jar][1] - 0.42 + Math.floor(n / 2) * 0.3 + (n % 5 === 2 ? 0.15 : 0), 0.45);

    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 800, px: 84, color: '#fff4dc', stroke: '#1b1512', strokeWidth: 14, height: 0.5 });
      l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.75, -8); S.camera.add(l); return l; });

    const cam = K.camPath([
      { t: 0, pos: [-2.0, 3.4, 10.5], look: [-1.9, 2.7, 0] },
      { t: 2.5, pos: [0.5, 3.4, 12.0], look: [0.5, 2.9, 0] },
      { t: 5.0, pos: [-0.4, 2.3, 12.6], look: [-0.4, 1.8, 0] },
      { t: 7.5, pos: [0.5, 0.2, 15.0], look: [0.4, -0.2, 0] },
      { t: 10, pos: [0.0, 0.7, 16.2], look: [0.0, 0.25, 0] },
      { t: 12, pos: [0.0, 0.7, 16.6], look: [0.0, 0.25, 0] },
    ], S.camera);
    const P = new T.Vector3();

    return (t, realT) => {
      cam(t);
      pins.forEach((p, k) => { p.position.z = 0.36 - 0.5 * K.prog(t, B[k + 1] + 0.05, B[k + 1] + 0.25, 'in') * (1 - K.prog(t, B[k + 1] + 1.6, B[k + 1] + 1.9)); });
      const flapOpen = [0, 0, 0], arrived = [0, 0];
      marbles.forEach((m, i) => {
        let s = m.legs[0].s0, fall = null;
        for (const lg of m.legs) {
          if (t < lg.t0) break;
          const p = K.prog(t, lg.t0, lg.t1, lg.caught || lg.k === 2 ? 'in' : 'inOut');
          s = K.lerp(lg.s0, lg.s1, p);
          if (p >= 1 && (lg.caught || lg.k === 2)) fall = { from: at(lg.s1), t: t - lg.t1, k: lg.k };
          if (lg.caught && t > lg.t1 - 0.4 && t < lg.t1 + 0.5) flapOpen[lg.k] = 1;
        }
        let spin = s / R;
        if (!fall) P.copy(at(s));
        else if (m.kd !== 'ok') {
          // drop through the trapdoor, roll down the trough, settle in the spam jar
          const h = fall.from.y - troughY(fall.from.x), tf = Math.sqrt(2 * h / G), tr = Math.abs(fall.from.x - trough[1][0]) / 4.6;
          const target = slotPos(1, m.slot);
          if (fall.t < tf) P.set(fall.from.x, fall.from.y - 0.5 * G * fall.t ** 2, Z + 0.15 * fall.t / tf);
          else if (fall.t < tf + tr) { const x = K.lerp(fall.from.x, trough[1][0], (fall.t - tf) / tr); P.set(x, troughY(x), Z + 0.15); spin += (fall.t - tf) * 12; }
          else { const u = K.prog(fall.t, tf + tr, tf + tr + 0.45, 'bounce'); P.set(K.lerp(trough[1][0], target.x, u), K.lerp(trough[1][1], target.y, u), K.lerp(Z + 0.15, target.z, u)); if (u > 0.5) arrived[1]++; }
        } else {
          const target = slotPos(0, m.slot), u = K.prog(fall.t, 0, 0.6, 'bounce');
          P.set(K.lerp(fall.from.x + 0.3, target.x, u), K.lerp(fall.from.y, target.y, K.ease.in(Math.min(1, fall.t / 0.6))), K.lerp(Z, target.z, u));
          if (fall.t > 0.4) arrived[0]++;
        }
        m.g.position.copy(P); m.g.rotation.set(0, 0.4 * i, -spin);
        // core colour: caught ones light red at their gate, delivered ones light green
        const red = fall && m.kd !== 'ok' ? K.prog(fall.t, -0.1, 0.15) : 0, green = fall && m.kd === 'ok' ? K.prog(fall.t, 0.2, 0.6) : 0;
        m.coreMat.color.set(red ? '#ff4040' : green ? '#38c172' : '#f4f1ea');
        m.coreMat.emissive.set(red ? '#ff2020' : '#20a050'); m.coreMat.emissiveIntensity = Math.max(red, green) * 0.9;
      });
      flaps.forEach((f, k) => { f.rotation.z = -1.2 * flapOpen[k]; lamps[k].material.emissiveIntensity = 3 * flapOpen[k]; });
      plates.forEach((p, k) => { const on = K.prog(t, B[k + 1] - 0.1, B[k + 1] + 0.3); p.material[4].emissive.set('#ffcf6a'); p.material[4].emissiveIntensity = 0.25 * on * (1 - K.prog(t, B[k + 1] + 2.2, B[k + 1] + 2.5)); });
      counts.forEach((tags, j) => tags.forEach((l, c) => { l.visible = c === Math.min(arrived[j], tags.length - 1); }));
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
      spot.intensity = 60 + 3 * Math.sin(realT * 0.9);
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.07 });
    k.play('glass', { t: 0.25, gain: 0.25, pitch: 1.2 });
    k.play('click', { t: 0.6, gain: 0.25 });
    [0, 1, 2].forEach(g => {
      k.play('metal', { t: B[g + 1] + 0.08, gain: 0.3, pitch: 1.3 });
      k.play('whoosh', { t: B[g + 1] + 0.25, gain: 0.2, pitch: 0.35, dur: 2.2 });
      for (let i = 0; i < 4; i++) k.play('glass', { t: B[g + 1] + 0.5 + i * 0.16, gain: 0.12, pitch: 1.4 + i * 0.1, pan: (g % 2 ? -0.3 : 0.3) });
      k.play('click', { t: B[g + 1] + 1.2, gain: 0.35, pitch: 0.7 });
      k.play('blip', { t: B[g + 1] + 1.25, gain: 0.25, pitch: 0.45 });
      k.play('wood', { t: B[g + 1] + 1.75, gain: 0.3, pitch: 0.8, pan: -0.6 });
      k.play('glass', { t: B[g + 1] + 2.2, gain: 0.3, pitch: 0.9, pan: -0.7 });
    });
    for (let i = 0; i < 4; i++) k.play('glass', { t: B[3] + 1.9 + i * 0.16, gain: 0.3, pitch: 1.1 + i * 0.08, pan: 0.6 });
    k.play('chime', { t: B[3] + 2.6, gain: 0.25, pitch: 1.0, music: true });
  },
  post: null,
};
