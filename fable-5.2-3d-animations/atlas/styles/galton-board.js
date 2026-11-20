window.STYLES = window.STYLES || {};
STYLES['galton-board'] = {
  id: 'galton-board', name: 'Galton Board',
  family: 'Machines that explain',
  use: 'Explainer',
  look: 'A tall walnut board with rows of brass pegs behind glass, a funnel at the top and narrow bins at the bottom. Polished steel balls, engraved brass plates, warm museum light with reflections on the glass.',
  motion: 'Balls stream from the funnel and bounce left or right at every peg, each on its own fixed path. The bins fill one ball at a time, and the shape of the pile appears.',
  shownHere: 'Why averages form a bell curve: at each of 12 pegs a ball goes left or right by chance; most balls mix lefts and rights, very few go all one way, and the pile takes the shape of a bell.',
  goodFor: 'Probability, randomness, distributions and any result that is the sum of many small chances.',
  fonts: ['Cinzel:wght@700'],
  duration: 11,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'At each peg: left or right, by chance' },
    { t: 2.7, label: 'Most paths mix lefts and rights' },
    { t: 5.4, label: 'Very few go all one way' },
    { t: 8.1, label: 'The pile is a bell curve' },
  ],
  plates: ['ALL LEFT', 'HALF AND HALF', 'ALL RIGHT'],
  rows: 12, balls: 420,

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Cinzel', RN = this.rows, NB = this.balls;
    scene.background = new T.Color('#140e0a'); scene.add(S.camera);
    const L = K.lights(S, 'lamp', { size: 7, target: [0, 4, 0] }); L.key.position.set(-4, 10, 8); L.key.intensity = 3.4; L.amb.intensity = 0.85; S.scene.environmentIntensity = 0.9;
    const front = new T.SpotLight('#ffe2b8', 60, 30, 0.6, 0.6, 1.3); front.position.set(2, 6, 9); front.target.position.set(0, 3.5, 0); scene.add(front, front.target);
    const DX = 0.42, DY = 0.36, TOP = 7.0, BIN_B = 0.35, BIN_H = 2.4, R = 0.046;
    const walnut = new T.MeshStandardMaterial({ color: '#4a2e1c', roughness: 0.45, map: K.canvasTex(512, 1024, (g, r, w, h) => { g.fillStyle = '#4a2e1c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(20,10,4,${r.range(0.05, 0.25)})`; g.lineWidth = r.range(1, 4); const x = r() * w; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + r.range(-30, 30), h * 0.3, x + r.range(-30, 30), h * 0.7, x, h); g.stroke(); } }, 2) });
    const W = (RN + 2) * DX;
    const back = new T.Mesh(new T.BoxGeometry(W + 0.6, TOP + 2.2, 0.3), walnut); back.position.set(0, (TOP + 2.2) / 2 - 0.2, -0.3); back.receiveShadow = true; scene.add(back);
    [-1, 1].forEach(s => { const side = new T.Mesh(new T.BoxGeometry(0.3, TOP + 2.2, 0.7), walnut); side.position.set(s * (W / 2 + 0.3), (TOP + 2.2) / 2 - 0.2, -0.05); side.castShadow = true; scene.add(side); });
    const topBar = new T.Mesh(new T.BoxGeometry(W + 1.2, 0.4, 0.7), walnut); topBar.position.set(0, TOP + 2.0, -0.05); scene.add(topBar);
    const foot = new T.Mesh(new T.BoxGeometry(W + 1.6, 0.4, 1.4), walnut); foot.position.set(0, 0.0, 0.1); foot.receiveShadow = true; scene.add(foot);
    const brass = new T.MeshStandardMaterial({ color: '#d6a74a', metalness: 1, roughness: 0.25 });
    // pegs
    const pegs = new T.InstancedMesh(new T.CylinderGeometry(0.05, 0.05, 0.3, 12).rotateX(Math.PI / 2), brass, RN * (RN + 1) / 2); pegs.castShadow = true;
    const MX = new T.Matrix4(); let pi = 0;
    for (let k = 0; k < RN; k++) for (let j = 0; j <= k; j++) pegs.setMatrixAt(pi++, MX.makeTranslation((j - k / 2) * DX, TOP - k * DY, -0.02));
    scene.add(pegs);
    // funnel and bins
    const funnel = new T.Shape([[-1.6, 0.9], [-0.12, 0.05], [0.12, 0.05], [1.6, 0.9], [1.7, 0.9], [0.18, -0.02], [-0.18, -0.02], [-1.7, 0.9]].map(([x, y]) => new T.Vector2(x, y)));
    const fm = new T.Mesh(new T.ExtrudeGeometry(funnel, { depth: 0.28, bevelEnabled: false }), brass); fm.position.set(0, TOP + 0.35, -0.16); scene.add(fm);
    const nBins = RN + 1, binX = b => (b - RN / 2) * DX;
    for (let b = 0; b <= nBins; b++) { const d = new T.Mesh(new T.BoxGeometry(0.03, BIN_H, 0.3), brass); d.position.set(binX(b) - DX / 2, BIN_B + BIN_H / 2, -0.02); scene.add(d); }
    // the glass front
    const glass = new T.Mesh(new T.PlaneGeometry(W + 0.4, TOP + 2.0), new T.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, transparent: true, opacity: 0.1, clearcoat: 1, depthWrite: false })); glass.position.set(0, (TOP + 2) / 2, 0.22); scene.add(glass);
    // precomputed paths
    const rr = K.rng(42), balls = [], counts = new Array(nBins).fill(0);
    for (let i = 0; i < NB; i++) { const bits = []; let r = 0; for (let k = 0; k < RN; k++) { const right = rr() < 0.5 ? 1 : 0; bits.push(r); r += right; } bits.push(r); const t0 = 0.25 + Math.pow(i / NB, 0.9) * 8.6; balls.push({ bits, t0, bin: r, slot: counts[r]++ }); }
    const ROW_T = 0.075, FALL_T = 0.35;
    const steel = new T.MeshStandardMaterial({ color: '#d9dde2', metalness: 1, roughness: 0.15 });
    const mesh = new T.InstancedMesh(new T.SphereGeometry(R, 12, 8), steel, NB); mesh.castShadow = true; mesh.frustumCulled = false; scene.add(mesh);
    const posAt = (b, t, out) => {
      const u = t - b.t0;
      if (u < 0) { const q = (b.t0 - t); out.set(0.6 * Math.sin(b.t0 * 13), TOP + 0.75 + Math.min(0.12, q * 0.05) + (b.slot % 3) * 0.04, 0); return out.set(out.x * Math.min(1, q), out.y, 0); }
      const k = Math.floor(u / ROW_T);
      if (k < RN) { const f = (u / ROW_T) % 1, x0 = (b.bits[k] - k / 2) * DX, x1 = (b.bits[k + 1] - (k + 1) / 2) * DX, y0 = TOP - k * DY + 0.1, y1 = TOP - (k + 1) * DY + 0.1; return out.set(K.lerp(x0, x1, f), K.lerp(y0, y1, f * f) + 0.1 * Math.sin(f * Math.PI), 0); }
      const fu = K.clamp((u - RN * ROW_T) / FALL_T), x0 = (b.bits[RN] - RN / 2) * DX;
      const layer = Math.floor(b.slot / 4), slot = b.slot % 4, tx = binX(b.bin) + (slot - 1.5) * 0.093 + (layer % 2 ? 0.045 : 0) * (slot < 3 ? 1 : 0), ty = BIN_B + R + layer * 0.083;
      return out.set(K.lerp(x0, tx, fu), K.lerp(TOP - RN * DY + 0.1, ty, fu * fu), 0);
    };
    // plates and the curve
    const plate = (txt, x, y, w = 1.6) => { const tex = K.canvasTex(512, 128, (g, r, cw, ch) => { const gr = g.createLinearGradient(0, 0, cw, ch); gr.addColorStop(0, '#f2cf7d'); gr.addColorStop(0.5, '#c8933a'); gr.addColorStop(1, '#e8bb63'); g.fillStyle = gr; g.fillRect(0, 0, cw, ch); g.strokeStyle = '#5a3c10'; g.lineWidth = 6; g.strokeRect(10, 10, cw - 20, ch - 20); g.fillStyle = '#3a2408'; g.font = `700 ${txt.length > 10 ? 50 : 60}px "${F}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, cw / 2, ch / 2 + 4); });
      const m = new T.Mesh(new T.BoxGeometry(w, w / 4, 0.04), [brass, brass, brass, brass, new T.MeshStandardMaterial({ map: tex, metalness: 0.7, roughness: 0.35 }), brass]); m.position.set(x, y, 0.36); scene.add(m); return m; };
    plate(this.plates[0], binX(0) + 0.3, 0.0, 1.6); plate(this.plates[1], 0, 0.0, 2.2); plate(this.plates[2], binX(RN) - 0.3, 0.0, 1.6);
    const topPlate = plate('LEFT  OR  RIGHT', 0, TOP + 2.0, 2.6);
    const curvePts = []; for (let i = 0; i <= 120; i++) { const b = i / 120 * RN, p = Math.exp(-((b - RN / 2) ** 2) / (2 * RN / 4)) / Math.sqrt(2 * Math.PI * RN / 4); curvePts.push(new T.Vector3(binX(0) + (b / RN) * (binX(RN) - binX(0)), BIN_B + (p * NB / 4) * 0.083 + 0.1, 0.25)); }
    const curveGeo = new T.TubeGeometry(new T.CatmullRomCurve3(curvePts), 200, 0.03, 6);
    const curve = new T.Mesh(curveGeo, new T.MeshBasicMaterial({ color: '#ffcf6a', toneMapped: false })); scene.add(curve);
    // a highlighted path for one ball at the start
    const lead = balls[3], trail = []; for (let k = 0; k <= RN; k++) trail.push(new T.Vector3((lead.bits[k] - k / 2) * DX, TOP - k * DY + 0.1, 0.12));
    const trailGeo = new T.TubeGeometry(new T.CatmullRomCurve3(trail, false, 'catmullrom', 0), 120, 0.025, 6);
    const trailM = new T.Mesh(trailGeo, new T.MeshBasicMaterial({ color: '#7fd0ff', transparent: true, opacity: 0.9, toneMapped: false })); scene.add(trailM);
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 76, color: '#f6e2b8', height: 0.42 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.76, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [0.8, 6.4, 11.5], look: [0, 5.6, 0] },
      { t: 3.0, pos: [-1.2, 4.4, 12.5], look: [0, 3.8, 0] },
      { t: 6.0, pos: [1.6, 3.4, 12.0], look: [0, 3.0, 0] },
      { t: 11, pos: [0.0, 4.2, 17.2], look: [0, 3.9, 0] },
    ], S.camera);
    const V = new T.Vector3(), Q = new T.Quaternion(), SC = new T.Vector3(1, 1, 1);
    return (t, realT) => {
      cam(t);
      balls.forEach((b, i) => { posAt(b, t, V); mesh.setMatrixAt(i, MX.compose(V, Q, SC)); });
      mesh.instanceMatrix.needsUpdate = true;
      const tr = K.prog(t, 0.3, 1.4); trailGeo.setDrawRange(0, Math.floor(tr * trailGeo.index.count / 18) * 18); trailM.material.opacity = 0.9 * (1 - K.prog(t, B[1] + 0.5, B[1] + 1.2)); trailM.visible = trailM.material.opacity > 0.01;
      const cv = K.prog(t, B[3] + 0.6, B[3] + 1.8, 'inOut'); curveGeo.setDrawRange(0, Math.floor(cv * curveGeo.index.count / 18) * 18); curve.visible = cv > 0;
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t), NB = this.balls;
    k.bed('room', { gain: 0.06 });
    for (let i = 0; i < NB; i += 3) { const t0 = 0.25 + Math.pow(i / NB, 0.9) * 8.6; k.play('tick', { t: t0 + 0.2, gain: 0.08, pitch: 1.4 + ((i * 7) % 5) * 0.1, pan: ((i * 13) % 9 - 4) * 0.1 }); if (i % 9 === 0) k.play('glass', { t: t0 + 1.25, gain: 0.06, pitch: 1.6 }); }
    k.play('metal', { t: 0.2, gain: 0.2, pitch: 1.2 });
    k.play('swish', { t: B[3] + 0.6, gain: 0.2, pitch: 1.0, dur: 1.2 });
    k.play('chime', { t: B[3] + 1.8, gain: 0.25, pitch: 1.0, music: true });
  },
  post: null,
};
