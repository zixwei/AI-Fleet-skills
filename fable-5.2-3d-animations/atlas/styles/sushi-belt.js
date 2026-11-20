window.STYLES = window.STYLES || {};
STYLES['sushi-belt'] = {
  id: 'sushi-belt', name: 'Sushi Belt',
  family: 'Kitchen and home',
  use: 'Explainer',
  look: 'A conveyor belt in a small sushi restaurant, seen from the counter. Coloured plates with sushi travel round the loop. At each seat a hand takes a plate, and a stack of empty plates grows beside it.',
  motion: 'The belt never stops. The kitchen puts plates on at one end; each seat takes one plate, eats, then takes the next. When the kitchen is faster than the seats, plates pile up on the belt; when a new seat opens, the pile goes down.',
  shownHere: 'How a message queue works: a producer adds messages, the queue keeps them in order, consumers take one at a time, a backlog grows when producers are faster than consumers, and adding a consumer makes it shrink.',
  goodFor: 'Queues and flow: message brokers, support tickets, checkout lines, manufacturing, anything with arrivals, waiting and service.',
  fonts: ['M PLUS Rounded 1c:wght@700;800'],
  duration: 12,
  samples: 4,
  // CONTENT: the producer's interval in seconds per beat; consumers (seat x) and when they open; time to eat one plate
  beats: [
    { t: 0.0, label: 'The kitchen puts messages on the belt', every: 1.0 },
    { t: 2.4, label: 'The belt keeps them in order: a queue', every: 1.0 },
    { t: 4.8, label: 'Each seat takes one plate at a time', every: 1.0 },
    { t: 7.2, label: 'Kitchen too fast? The backlog grows', every: 0.2 },
    { t: 9.6, label: 'A third seat opens: the backlog shrinks', every: 0.6 },
  ],
  seats: [{ x: 1.6, opens: 4.8 }, { x: 0.0, opens: 4.8 }, { x: -1.6, opens: 9.6 }],
  eat: 0.9,
  speed: 2.5,

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'M PLUS Rounded 1c', BE = this.beats, SE = this.seats, EAT = this.eat, V = this.speed;
    scene.background = new T.Color('#2a2420'); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 8 }); L.key.position.set(-3, 10, 6); L.key.color.set('#fff0dc');
    const std = (c, r = 0.6, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    // the belt path: a stadium loop; s runs from the kitchen (back left) to the right, round, then along the front
    const SL = 5, RR = 1.2, Lp = 2 * SL + 2 * Math.PI * RR;
    const pathPos = (s, out = new T.Vector3()) => { s = ((s % Lp) + Lp) % Lp;
      if (s < SL) return out.set(-SL / 2 + s, 0, -RR); s -= SL;
      if (s < Math.PI * RR) { const a = s / RR; return out.set(SL / 2 + Math.sin(a) * RR, 0, -Math.cos(a) * RR); } s -= Math.PI * RR;
      if (s < SL) return out.set(SL / 2 - s, 0, RR); s -= SL;
      const a = s / RR; return out.set(-SL / 2 - Math.sin(a) * RR, 0, Math.cos(a) * RR); };
    const sOfSeat = x => SL + Math.PI * RR + (SL / 2 - x);
    // counter, belt ribbon with moving slats
    const wood = std('#c8945a', 0.5);
    const counter = new T.Mesh(new T.BoxGeometry(SL + 2 * RR + 3.2, 0.9, 2 * RR + 3.6), wood); counter.position.set(0, -0.45, 0.3); counter.receiveShadow = true; scene.add(counter);
    const floor = new T.Mesh(new T.PlaneGeometry(60, 60), std('#3a302a', 0.9)); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.9; scene.add(floor);
    const N = 240, pos = [], uv = [], idx = [], W = 0.95, P0 = new T.Vector3(), P1 = new T.Vector3();
    for (let i = 0; i <= N; i++) { const s = i / N * Lp; pathPos(s, P0); pathPos(s + 0.01, P1); const d = P1.sub(P0).normalize(), n = new T.Vector3(-d.z, 0, d.x);
      pos.push(P0.x + n.x * W / 2, 0.02, P0.z + n.z * W / 2, P0.x - n.x * W / 2, 0.02, P0.z - n.z * W / 2); uv.push(s / 0.5, 0, s / 0.5, 1);
      if (i < N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
    const bg = new T.BufferGeometry(); bg.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); bg.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); bg.setIndex(idx); bg.computeVertexNormals();
    const slat = K.canvasTex(64, 64, (g, r, w, h) => { g.fillStyle = '#c8ccd2'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a808a'; g.fillRect(0, 0, 5, h); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(8, 0, 3, h); }, 1);
    slat.wrapS = T.RepeatWrapping;
    const belt = new T.Mesh(bg, std('#ffffff', 0.35, { map: slat, metalness: 0.4, side: T.DoubleSide })); belt.receiveShadow = true; scene.add(belt);
    // rails on both sides of the belt
    [W / 2 + 0.06, -W / 2 - 0.06].forEach(off => { const pts = []; for (let i = 0; i <= 120; i++) { const s = i / 120 * Lp; pathPos(s, P0); pathPos(s + 0.01, P1); const d = P1.sub(P0).normalize(); pts.push(new T.Vector3(P0.x - d.z * off, 0.08, P0.z + d.x * off)); }
      scene.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts, true), 240, 0.05, 6, true), std('#9aa0a8', 0.25, { metalness: 0.9 }))); });
    // the kitchen pass at the start of the belt
    const pass = new T.Mesh(new T.BoxGeometry(1.6, 1.2, 1.0), std('#3a2a20', 0.6)); pass.position.set(SL / 2 + RR + 1.2, 0.6, -0.4); pass.rotation.y = Math.PI / 2; pass.castShadow = true; scene.add(pass);
    const noren = new T.Mesh(new T.PlaneGeometry(1.6, 0.6), std('#2a4a8a', 0.8, { side: T.DoubleSide })); noren.position.set(SL / 2 + RR + 0.68, 1.5, -0.4); noren.rotation.y = Math.PI / 2; scene.add(noren);
    const tag = (txt, x, y, z, h = 0.3, bg2 = 'rgba(30,24,20,0.85)') => { const l = K.label(txt, { font: F, weight: 800, px: 56, color: '#fff4e6', bg: bg2, radius: 12, pad: 0.22, height: h }); l.position.set(x, y, z); scene.add(l); return l; };
    tag('Kitchen = producer', SL / 2 + RR + 0.9, 1.45, 1.1); tag('Seats = consumers', 0, 0.35, RR + 3.0, 0.34);
    const seatTags = SE.map((c, i) => tag(`Seat ${i + 1}`, c.x, 0.35, RR + 2.1, 0.34));
    // queue size readout: one label per number, only one visible
    const counts = Array.from({ length: 41 }, (_, n) => { const l = tag(`On the belt: ${n}`, 0, 0.4, 0, 0.5, 'rgba(160,30,30,0.9)'); l.visible = false; return l; });
    // plates and sushi: a pool
    const plateCols = ['#3a7acf', '#cf3a3a', '#e8c040', '#3aaf6a'], fish = ['#f08a5a', '#e04a5a', '#f6d04a', '#f4f0e8'];
    const pool = Array.from({ length: 48 }, (_, i) => {
      const g = new T.Group(); g.visible = false; scene.add(g);
      const pl = new T.Mesh(new T.CylinderGeometry(0.29, 0.22, 0.06, 28), std(plateCols[i % 4], 0.3)); pl.position.y = 0.03; pl.castShadow = pl.receiveShadow = true; g.add(pl);
      const sushi = new T.Group(); g.add(sushi);
      [-0.1, 0.1].forEach(dx => { const rice = new T.Mesh(new T.BoxGeometry(0.16, 0.1, 0.3), std('#f6f4ee', 0.8)); rice.position.set(dx, 0.11, 0); const top = new T.Mesh(new T.BoxGeometry(0.19, 0.04, 0.34), std(fish[(i * 3) % 4], 0.4)); top.position.set(dx, 0.18, 0); rice.castShadow = top.castShadow = true; sushi.add(rice, top); });
      g.userData.sushi = sushi; return g;
    });
    // hands that reach out from each seat
    const hands = SE.map(c => { const h = new T.Group(); scene.add(h); const arm = new T.Mesh(new T.CylinderGeometry(0.1, 0.12, 1.4, 10), std('#4a5a8a', 0.7)); arm.rotation.x = Math.PI / 2; arm.position.z = 0.7; h.add(arm); const hand = new T.Mesh(new T.SphereGeometry(0.14, 12, 10), std('#e8b890', 0.6)); h.add(hand); h.visible = false; return h; });
    // the simulation: fixed steps from t = 0, so any time gives the same picture
    const DT = 1 / 120, PRE = 4, S0 = SL + Math.PI * RR * 0.5, every = t => { let k = 0; for (let i = 1; i < B.length; i++) if (t >= B[i]) k = i; return BE[k].every; };
    let st;
    const reset = () => { st = { n: 0, t: 0, plates: [], next: 0.0, id: 0, seats: SE.map(c => ({ s: sOfSeat(c.x), busy: 0, stack: 0, opens: c.opens })) }; };
    const step = () => { st.n++; st.t = st.n * DT - PRE; const t = st.t;
      st.plates.forEach(p => { if (p.state === 'belt') p.s += V * DT; });
      if (t >= st.next && st.id < pool.length) { const clear = st.plates.every(p => p.state !== 'belt' || Math.min((((p.s - S0) % Lp) + Lp) % Lp, Lp - (((p.s - S0) % Lp) + Lp) % Lp) > 0.6);
        if (clear) { st.plates.push({ id: st.id++, s: S0, state: 'belt' }); st.next = t + every(t); } else st.next = t + 0.05; }
      st.seats.forEach((c, ci) => { if (t < c.opens || t < c.busy) return;
        const p = st.plates.find(p => p.state === 'belt' && (((p.s - c.s) % Lp) + Lp) % Lp < V * DT * 1.01);
        if (p) { p.state = 'taken'; p.seat = ci; p.tt = t; p.from = pathPos(p.s).clone(); p.si = c.stack++; c.busy = t + EAT; } }); };
    reset();
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 800, px: 68, color: '#fff4e6', bg: 'rgba(30,24,20,0.85)', radius: 16, pad: 0.35, height: 0.4 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([{ t: 0, pos: [1.0, 9.6, 8.8], look: [0.9, 0, 1.0] }, { t: 6, pos: [1.3, 9.1, 8.4], look: [0.8, 0, 1.1] }, { t: 12, pos: [0.8, 9.8, 9.0], look: [0.7, 0, 1.0] }], S.camera);
    const tmp = new T.Vector3();
    return (t, realT) => {
      cam(t);
      const target = Math.floor((t + PRE) / DT); if (target < st.n) reset(); while (st.n < target) step();
      slat.offset.x = -(V * t) / 0.5;
      pool.forEach(g => { g.visible = false; });
      let onBelt = 0;
      st.plates.forEach(p => { const g = pool[p.id]; g.visible = true;
        if (p.state === 'belt') { onBelt++; pathPos(p.s, tmp); g.position.set(tmp.x, 0.04, tmp.z); g.userData.sushi.visible = true; g.userData.sushi.scale.setScalar(1); g.rotation.y = p.id; return; }
        const c = SE[p.seat], u = K.prog(t, p.tt, p.tt + 0.35, 'inOut'), dest = tmp.set(c.x + 0.55, 0.04 + p.si * 0.075, RR + 1.25);
        g.position.lerpVectors(p.from, dest, u); g.position.y += 0.5 * Math.sin(Math.PI * u);
        g.userData.sushi.visible = t < p.tt + EAT * 0.8; g.userData.sushi.scale.setScalar(1 - K.prog(t, p.tt + 0.4, p.tt + EAT * 0.8)); });
      hands.forEach((h, i) => { const c = SE[i], last = st.plates.filter(p => p.state === 'taken' && p.seat === i).pop(); const reach = last ? Math.sin(Math.PI * K.prog(t, last.tt - 0.15, last.tt + 0.45)) : 0;
        h.visible = t >= c.opens; h.position.set(c.x, 0.3, RR + 1.9 - 1.3 * reach); });
      seatTags.forEach((l, i) => { l.material.opacity = t >= SE[i].opens ? 1 : 0.35; });
      counts.forEach((l, n) => { l.visible = n === Math.min(40, onBelt); });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t), BE = this.beats;
    k.bed('machine', { gain: 0.05 }); k.bed('crowd', { gain: 0.03 });
    // plates going on: one tick per plate, at the producer's interval (approximate; the picture is exact)
    let t = 0; while (t < 12) { let kb = 0; for (let i = 1; i < B.length; i++) if (t >= B[i]) kb = i; k.play('glass', { t, gain: 0.08, pitch: 2.0 }); t += BE[kb].every; }
    k.play('chime', { t: 0.4, gain: 0.12, pitch: 1.0, music: true });
    k.play('pluck', { t: B[1] + 0.3, gain: 0.14, pitch: 1.12, music: true });
    k.play('blip', { t: B[2] + 0.2, gain: 0.15, pitch: 1.2 }); for (let i = 0; i < 7; i++) k.play('click', { t: B[2] + 0.6 + i * 1.0, gain: 0.15, pitch: 1.4 });
    k.play('riser', { t: B[3] + 0.2, gain: 0.12, pitch: 1.0, dur: 2.0 }); k.play('blip', { t: B[3] + 0.1, gain: 0.15, pitch: 0.8 });
    k.play('blip', { t: B[4] + 0.2, gain: 0.18, pitch: 1.5 }); k.play('chime', { t: B[4] + 1.6, gain: 0.15, pitch: 1.2, music: true });
  },
  post: null,
};
