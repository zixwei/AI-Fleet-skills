window.STYLES = window.STYLES || {};
STYLES['domino-chain'] = {
  id: 'domino-chain', name: 'Domino Chain',
  family: 'Machines that explain',
  use: 'Explainer',
  look: 'Hand-made ivory dominoes on a polished walnut table, each key piece engraved with one step, the last one lacquered red. Low warm lamp light, long shadows, soft reflections in the wood.',
  motion: 'The chain falls in one continuous wave and each piece is bigger than the last. The camera rides beside the wave front and rises at the end to show the whole fallen line.',
  shownHere: 'How one late payment cascades: a late fee, a lower credit score, and then higher rates on every new loan.',
  goodFor: 'Chains of cause and effect, knock-on effects and escalation: one small event that leads, step by step, to a large result.',
  fonts: ['Cormorant Garamond:wght@700', 'Inter:wght@800'],
  duration: 10,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'One payment is late' },
    { t: 2.5, label: 'A late fee is added' },
    { t: 5.0, label: 'Your credit score drops' },
    { t: 7.5, label: 'Every loan costs more' },
  ],
  engraved: ['LATE\nPAYMENT', 'LATE\nFEE', 'SCORE\nDROPS', 'HIGHER\nRATES'],
  note: 'OVERDUE',

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Cormorant Garamond', FI = 'Inter';
    scene.background = new T.Color('#120d0a'); scene.fog = new T.Fog('#120d0a', 14, 34); scene.add(S.camera);
    const L = K.lights(S, 'lamp', { size: 11, target: [0, 0, 0] });
    L.key.position.set(-6, 9, 5); L.key.intensity = 3.4; S.scene.environmentIntensity = 0.5;
    const pool = new T.SpotLight('#ffcf94', 55, 40, 0.75, 0.7, 1.4); pool.position.set(2, 11, 4); pool.target.position.set(1, 0, 0); scene.add(pool, pool.target);

    const walnut = K.canvasTex(1024, 1024, (g, r, w, h) => {
      g.fillStyle = '#3d2417'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 300; i++) { g.strokeStyle = `rgba(${r() < 0.5 ? 20 : 110},${r() < 0.5 ? 10 : 62},${r() < 0.5 ? 5 : 32},${r.range(0.05, 0.2)})`; g.lineWidth = r.range(1, 6);
        const y = r() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + r.range(-40, 40), w * 0.7, y + r.range(-40, 40), w, y + r.range(-25, 25)); g.stroke(); }
    }, 7);
    walnut.wrapS = walnut.wrapT = T.RepeatWrapping; walnut.repeat.set(3, 2);
    const table = new T.Mesh(new T.PlaneGeometry(40, 24), new T.MeshPhysicalMaterial({ map: walnut, roughness: 0.38, clearcoat: 0.4, clearcoatRoughness: 0.25 }));
    table.rotation.x = -Math.PI / 2; table.receiveShadow = true; scene.add(table);

    // chain path and the dominoes on it: keys grow 1.0 -> 2.4; fillers grow between them
    const path = new T.CatmullRomCurve3([[-8.5, 0, 1.2], [-4.5, 0, -0.6], [-0.5, 0, 0.9], [3.5, 0, -0.7], [7.5, 0, 0.4]].map(p => new T.Vector3(...p)));
    const LEN = path.getLength(), KEYH = [1.0, 1.35, 1.8, 2.4], FILL = 6;
    const spec = [];
    KEYH.forEach((h, k) => { spec.push({ h, key: k }); if (k < KEYH.length - 1) for (let f = 1; f <= FILL; f++) spec.push({ h: K.lerp(h, KEYH[k + 1], f / (FILL + 1)) * 0.92, key: -1 }); });
    let s = 0.6; spec.forEach(d => { d.s = s; s += d.h * 0.52; });
    const scale = (LEN - 1.2) / s; spec.forEach(d => { d.s *= scale; });
    // fall times: key k at B[k] + 0.3, fillers evenly between
    const keyIdx = spec.map((d, i) => d.key >= 0 ? i : -1).filter(i => i >= 0);
    keyIdx.forEach((i, k) => { spec[i].t0 = B[k] + 0.3; });
    for (let k = 0; k < keyIdx.length - 1; k++) for (let i = keyIdx[k] + 1; i < keyIdx[k + 1]; i++) spec[i].t0 = K.lerp(spec[keyIdx[k]].t0 + 0.35, B[k + 1] + 0.05, (i - keyIdx[k]) / (keyIdx[k + 1] - keyIdx[k]));

    const rbox = (w, h, d, r) => {
      const sh = new T.Shape(), x = -w / 2 + r, y = -h / 2 + r, W2 = w - 2 * r, H2 = h - 2 * r;
      sh.moveTo(x, y - r); sh.lineTo(x + W2, y - r); sh.quadraticCurveTo(x + W2 + r, y - r, x + W2 + r, y); sh.lineTo(x + W2 + r, y + H2); sh.quadraticCurveTo(x + W2 + r, y + H2 + r, x + W2, y + H2 + r);
      sh.lineTo(x, y + H2 + r); sh.quadraticCurveTo(x - r, y + H2 + r, x - r, y + H2); sh.lineTo(x - r, y); sh.quadraticCurveTo(x - r, y - r, x, y - r);
      const g = new T.ExtrudeGeometry(sh, { depth: d - 2 * r, bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 3, curveSegments: 4 });
      g.translate(0, 0, -(d - 2 * r) / 2); return g;
    };
    const faceTex = (txt, red, pips) => K.canvasTex(256, 512, (g, r, w, h) => {
      g.fillStyle = red ? '#b3161c' : '#efe6d2'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(${red ? '60,0,0' : '120,90,50'},${r.range(0.02, 0.07)})`; g.fillRect(r() * w, r() * h, r.range(1, 3), r.range(1, 6)); }
      const ink = red ? '#2a0606' : '#3a2616';
      if (txt) {
        g.textAlign = 'center'; g.textBaseline = 'middle'; const lines = txt.split('\n');
        g.font = `700 100px "${F}"`; const fs = Math.min(84, 100 * (w - 36) / Math.max(...lines.map(l => g.measureText(l).width)));
        lines.forEach((l, i) => { const y = h / 2 + (i - (lines.length - 1) / 2) * fs * 1.15; g.font = `700 ${fs}px "${F}"`;
          g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillText(l, w / 2 + 2, y + 3); g.fillStyle = ink; g.fillText(l, w / 2, y); });
        g.fillStyle = ink; g.fillRect(40, 70, w - 80, 5); g.fillRect(40, h - 75, w - 80, 5);
      } else {
        g.fillStyle = ink; g.fillRect(30, h / 2 - 4, w - 60, 8);
        const P = { 1: [[0.5, 0.5]], 2: [[0.3, 0.3], [0.7, 0.7]], 3: [[0.3, 0.3], [0.5, 0.5], [0.7, 0.7]], 4: [[0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]], 5: [[0.3, 0.3], [0.7, 0.3], [0.5, 0.5], [0.3, 0.7], [0.7, 0.7]], 6: [[0.3, 0.25], [0.7, 0.25], [0.3, 0.5], [0.7, 0.5], [0.3, 0.75], [0.7, 0.75]] };
        pips.forEach((n, half) => (P[n] || []).forEach(([u, v]) => { g.beginPath(); g.arc(u * w, (half * 0.5 + v * 0.5) * h, 18, 0, 7); g.fill(); }));
      }
    }, 3 + pips[0] * 7 + pips[1]);
    const ivory = new T.MeshPhysicalMaterial({ color: '#efe6d2', roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 });
    const redLac = new T.MeshPhysicalMaterial({ color: '#b3161c', roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 });
    const pr = K.rng(5);
    const doms = spec.map((d, i) => {
      const red = d.key === KEYH.length - 1, w = d.h * 0.5, th = d.h * 0.16;
      const p = path.getPointAt(d.s / LEN), tg = path.getTangentAt(d.s / LEN);
      const outer = new T.Group(); outer.position.copy(p); outer.rotation.y = Math.atan2(-tg.z, tg.x) + pr.range(-0.04, 0.04); scene.add(outer);
      const pivot = new T.Group(); pivot.position.x = th / 2; outer.add(pivot);
      const geo = rbox(th, d.h, w, Math.min(th, w) * 0.18);
      const tex = new T.MeshPhysicalMaterial({ map: faceTex(d.key >= 0 ? this.engraved[d.key] : '', red, [pr.int(1, 6), pr.int(1, 6)]), roughness: 0.35, clearcoat: red ? 1 : 0.6, clearcoatRoughness: 0.15 });
      // uv: put the face picture on the back face (local -x), seen from the start of the chain
      const uv = geo.attributes.uv, pos = geo.attributes.position;
      for (let v = 0; v < uv.count; v++) uv.setXY(v, (pos.getZ(v) / w) + 0.5, (pos.getY(v) / d.h) + 0.5);
      const m = new T.Mesh(geo, tex); m.position.set(-th / 2, d.h / 2, 0); m.castShadow = m.receiveShadow = true; pivot.add(m);
      return Object.assign(d, { outer, pivot, th, red });
    });
    // contact angle: the angle at which the top of a piece meets the next piece
    doms.forEach((d, i) => { const n = doms[i + 1]; d.rest = n ? Math.asin(Math.min(0.97, (n.s - d.s - d.th) / d.h)) : Math.PI / 2; d.dur = 0.22 + 0.16 * d.h; });

    // table cards: the step name in large type beside each key piece
    const cards = doms.filter(d => d.key >= 0).map(d => {
      const l = K.label(this.engraved[d.key].replace(/\n/g, ' '), { font: FI, weight: 800, px: 64, color: d.red ? '#ffffff' : '#2a1a10', bg: d.red ? '#b3161c' : '#f3ead8', radius: 12, pad: 0.35, height: 0.3 + 0.12 * d.h, lit: true });
      l.position.set(d.outer.position.x - 0.2, 0.04 + l.userData.h * 0.5 * Math.sin(0.55), d.outer.position.z + 0.75 + 0.35 * d.h); l.rotation.x = -Math.PI / 2 + 0.55; l.receiveShadow = true; scene.add(l); l.userData.t0 = d.t0; return l;
    });
    // props: an overdue bill, coins, a pen, a desk lamp base
    const bill = new T.Mesh(new T.PlaneGeometry(2.4, 1.6), new T.MeshStandardMaterial({ roughness: 0.9, map: K.canvasTex(512, 340, (g, r, w, h) => {
      g.fillStyle = '#f5f0e4'; g.fillRect(0, 0, w, h); g.fillStyle = '#9a9488'; for (let i = 0; i < 7; i++) g.fillRect(40, 70 + i * 26, r.range(200, 400), 8);
      g.save(); g.translate(330, 200); g.rotate(-0.25); g.strokeStyle = '#c0262b'; g.lineWidth = 8; g.strokeRect(-140, -42, 280, 84); g.fillStyle = '#c0262b'; g.font = `800 58px "${FI}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(this.note, 0, 4); g.restore();
    }) }));
    bill.rotation.set(-Math.PI / 2, 0, 0.25); bill.position.set(-9.6, 0.01, 3.0); bill.receiveShadow = true; scene.add(bill);
    const coinM = new T.MeshStandardMaterial({ color: '#e0b25a', metalness: 0.55, roughness: 0.35 });
    for (let i = 0; i < 7; i++) { const c = new T.Mesh(new T.CylinderGeometry(0.32, 0.32, 0.07, 32), coinM); c.position.set(-7.4 + (i > 4 ? 0.7 : 0), 0.035 + (i > 4 ? i - 5 : i) * 0.072, 3.3 + (i > 4 ? 0.3 : 0)); c.rotation.y = i; c.castShadow = true; scene.add(c); }
    const pen = new T.Group(); const barrel = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 2.4, 16), new T.MeshStandardMaterial({ color: '#1c2a4a', roughness: 0.3, metalness: 0.2 })); barrel.rotation.z = Math.PI / 2; pen.add(barrel);
    const nib = new T.Mesh(new T.ConeGeometry(0.08, 0.3, 16), coinM); nib.rotation.z = -Math.PI / 2; nib.position.x = 1.35; pen.add(nib);
    pen.position.set(-8.6, 0.08, 4.4); pen.rotation.y = -0.4; pen.traverse(o => { o.castShadow = true; }); scene.add(pen);

    const titles = this.beats.map(b => { const l = K.label(b.label, { font: FI, weight: 800, px: 84, color: '#fff3e2', stroke: '#120d0a', strokeWidth: 14, height: 0.48 });
      l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.7, -8); S.camera.add(l); return l; });

    // camera: rides beside the wave front, then rises to show the whole line
    const sAt = t => { let sv = doms[0].s; doms.forEach(d => { if (t >= d.t0) sv = d.s; }); for (let i = 0; i < doms.length - 1; i++) if (t >= doms[i].t0 && t < doms[i + 1].t0) sv = K.lerp(doms[i].s, doms[i + 1].s, (t - doms[i].t0) / (doms[i + 1].t0 - doms[i].t0)); return sv; };
    const look = new T.Vector3(), camP = new T.Vector3();
    return (t, realT) => {
      const front = path.getPointAt(K.clamp(sAt(t) / LEN, 0, 1)), hgt = 1 + 0.6 * K.prog(t, 0, 9);
      const end = K.prog(t, B[3] + 0.8, 10, 'inOut');
      camP.set(front.x - 4.2, 2.6 + hgt, front.z + 6.2).lerp(new T.Vector3(4.0, 7.6, 10.5), end);
      look.set(front.x + 1.6, 0.6 * hgt, front.z).lerp(new T.Vector3(2.4, 0.3, 0), end);
      S.camera.position.copy(camP); S.camera.lookAt(look); S.camera.userData.look = look.clone();
      doms.forEach((d, i) => {
        const n = doms[i + 1];
        let a = d.rest * K.ease.in(K.prog(t, d.t0, d.t0 + d.dur));
        if (n && t > n.t0) a = K.lerp(d.rest, Math.min(Math.PI / 2 - 0.12, d.rest + (Math.PI / 2 - d.rest) * 0.55), K.prog(t, n.t0, n.t0 + n.dur + 0.3, 'out'));
        if (!n && t > d.t0 + d.dur) a = Math.PI / 2 - 0.05 * Math.exp(-(t - d.t0 - d.dur) * 8) * Math.abs(Math.sin((t - d.t0 - d.dur) * 30));
        d.pivot.rotation.z = -a;
      });
      cards.forEach(c => { const p = c.userData.t0 < 0.5 ? 1 : K.prog(t, c.userData.t0 - 0.1, c.userData.t0 + 0.25, 'back'); c.scale.setScalar(Math.max(0.001, p)); c.visible = p > 0; });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
      pool.intensity = 55 + 3 * Math.sin(realT * 1.3);
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t), KEYH = [1.0, 1.35, 1.8, 2.4], FILL = 6;
    k.bed('room', { gain: 0.06 });
    KEYH.forEach((h, kk) => {
      const t0 = B[kk] + 0.3, d = 0.22 + 0.16 * h;
      k.play('wood', { t: t0 + d, gain: 0.45, pitch: 1.3 / h });
      k.play('thud', { t: t0 + d, gain: 0.25 + 0.12 * kk, pitch: 1.2 / h });
      if (kk < KEYH.length - 1) for (let f = 1; f <= FILL; f++) {
        const tf = K.lerp(t0 + 0.35, B[kk + 1] + 0.05, f / (FILL + 1));
        k.play('wood', { t: tf + 0.3, gain: 0.3, pitch: 1.5 / K.lerp(h, KEYH[kk + 1], f / 7), pan: -0.4 + f * 0.1 });
      }
    });
    k.play('rumble', { t: B[3] + 0.75, gain: 0.45, pitch: 0.8, dur: 1.2 });
    k.play('bell', { t: B[3] + 0.9, gain: 0.18, pitch: 0.5, music: true });
  },
  post: null,
};
