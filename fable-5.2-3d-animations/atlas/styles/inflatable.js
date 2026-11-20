window.STYLES = window.STYLES || {};
STYLES['inflatable'] = {
  id: 'inflatable', name: 'Inflatable',
  family: 'Crafted materials',
  use: 'Explainer',
  look: 'Glossy inflated vinyl in a one-colour studio: fat rounded forms with welded seams and valve caps, a mirror-like clear coat, soft floor shadows. A short palette of candy colours on a pale blue sweep.',
  motion: 'Things inflate from flat with a bounce and a squash, wobble when they land, and deflate to leave. Air moves as small glossy balls.',
  shownHere: 'How lungs move air: the diaphragm pulls down, air rushes in, oxygen swaps for carbon dioxide, and the diaphragm relaxes to push the air out.',
  goodFor: 'Anything that fills, empties or changes pressure: bodies, tyres, budgets that swell and shrink. Friendly, toy-like explainers for a young audience.',
  fonts: ['Nunito:wght@800;900'],
  duration: 10,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'The diaphragm pulls down' },
    { t: 2.5, label: 'Air rushes in' },
    { t: 5.0, label: 'Oxygen in, CO₂ out' },
    { t: 7.5, label: 'It relaxes: air goes out' },
  ],
  tags: { o2: 'O₂', co2: 'CO₂', gauge: 'lung pressure', low: 'low', high: 'high', diaphragm: 'diaphragm', alveoli: 'air sacs', blood: 'blood' },

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Nunito', W = this.tags;
    const BG = '#bfe0ee';
    scene.background = new T.Color(BG); scene.fog = new T.Fog(BG, 18, 34); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 7, target: [0, 1.5, 0] });
    L.key.position.set(3, 10, 8); L.amb.intensity = 1.2; S.scene.environmentIntensity = 1.0;
    const vinyl = c => new T.MeshPhysicalMaterial({ color: c, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 0.3, sheenColor: new T.Color('#ffffff') });
    const M = { lung: vinyl('#ff7d9c'), lung2: vinyl('#ff97b0'), pipe: vinyl('#ffa9bd'), dia: vinyl('#ffb03b'), rib: vinyl('#fbfbf6'), o2: vinyl('#3b82f6'), co2: vinyl('#9097a3'),
      blood: vinyl('#e0414f'), cap: vinyl('#fff2c4'), dial: vinyl('#ffffff'), needle: vinyl('#2d3142'), seam: vinyl('#ff6a8d') };
    const sh = m => { m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return m; };
    const floor = new T.Mesh(new T.PlaneGeometry(80, 80), new T.MeshStandardMaterial({ color: BG, roughness: 0.6 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.6; floor.receiveShadow = true; scene.add(floor);
    const pill = (txt, bg, fg = '#ffffff', h = 0.36) => K.label(txt, { font: F, weight: 900, px: 64, color: fg, bg, radius: 'pill', pad: 0.4, height: h });
    const valve = (r = 0.07) => { const g = new T.Group(), a = new T.Mesh(new T.CylinderGeometry(r, r * 1.1, r * 1.4, 16), M.cap), b = new T.Mesh(new T.SphereGeometry(r * 1.05, 16, 8, 0, 7, 0, 1.6), M.cap); b.position.y = r * 0.7; g.add(a, b); return g; };

    // windpipe with welded rings, and two bronchi
    const pipeCurves = [
      new T.CatmullRomCurve3([[0, 4.4, 0], [0, 3.7, 0], [0, 3.0, 0]].map(p => new T.Vector3(...p))),
      new T.CatmullRomCurve3([[0, 3.0, 0], [-0.5, 2.6, 0.1], [-1.1, 2.15, 0.25]].map(p => new T.Vector3(...p))),
      new T.CatmullRomCurve3([[0, 3.0, 0], [0.5, 2.6, 0.1], [1.1, 2.15, 0.25]].map(p => new T.Vector3(...p))),
    ];
    pipeCurves.forEach((c, i) => {
      scene.add(sh(new T.Mesh(new T.TubeGeometry(c, 40, i ? 0.17 : 0.24, 20), M.pipe)));
      for (let k = 1; k < (i ? 3 : 6); k++) { const p = c.getPointAt(k / (i ? 3 : 6)), tg = c.getTangentAt(k / (i ? 3 : 6)), r = new T.Mesh(new T.TorusGeometry(i ? 0.175 : 0.245, 0.035, 10, 32), M.lung2);
        r.position.copy(p); r.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), tg); scene.add(sh(r)); }
    });
    const mouth = new T.Mesh(new T.TorusGeometry(0.26, 0.07, 12, 32), M.cap); mouth.rotation.x = Math.PI / 2; mouth.position.y = 4.4; scene.add(sh(mouth));

    // lungs: fat rounded lobes with a welded seam and a valve
    const lungGeo = (() => {
      const g = new T.SphereGeometry(1, 48, 32), p = g.attributes.position, v = new T.Vector3();
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        const inner = Math.max(0, v.x) ** 2 * 0.35, lobe = 0.08 * Math.exp(-((v.y + 0.15) ** 2) * 30);
        v.set(v.x * (1 - inner) * 0.95, v.y * 1.45 + 0.12 * v.x, v.z * 0.72 * (1 - lobe)); p.setXYZ(i, v.x, v.y, v.z);
      }
      g.computeVertexNormals(); return g;
    })();
    const lungs = [-1, 1].map(s => {
      const g = new T.Group(), body = new T.Mesh(lungGeo, M.lung); body.scale.x = s; g.add(body);
      const seam = new T.Mesh(new T.TorusGeometry(1, 0.03, 8, 64), M.seam); seam.scale.set(0.95, 1.45, 1); seam.rotation.y = Math.PI / 2 * 0.0; seam.scale.z = 0.72; g.add(seam);
      seam.rotation.x = 0; seam.rotation.y = Math.PI / 2; seam.scale.set(0.72, 1.45, 1);
      const v = valve(0.08); v.position.set(-0.55 * s, 1.0, 0.45); v.rotation.set(0.6, 0, 0.4 * s); g.add(v);
      g.position.set(1.45 * s, 1.55, 0.2); scene.add(sh(g)); return g;
    });

    // ribs: inflatable arcs behind the lungs
    const ribs = [];
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
      const r = new T.Mesh(new T.TorusGeometry(1.2 - i * 0.05, 0.1, 14, 40, Math.PI * 0.75), M.rib);
      r.rotation.set(0.0, s > 0 ? 0 : Math.PI, -0.35); r.position.set(0.15 * s, 2.55 - i * 0.55, -0.55);
      scene.add(sh(r)); ribs.push({ r, s, i });
    }

    // diaphragm: an orange cushion dome under the lungs
    const diaGeo = new T.SphereGeometry(2.6, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    const dia = new T.Mesh(diaGeo, M.dia); dia.scale.set(1, 0.32, 0.55); dia.position.set(0, -0.05, 0.1); scene.add(sh(dia));
    const diaRim = new T.Mesh(new T.TorusGeometry(2.6, 0.13, 14, 64), M.dia); diaRim.rotation.x = Math.PI / 2; diaRim.scale.set(1, 0.55, 1); diaRim.position.set(0, -0.05, 0.1); scene.add(sh(diaRim));
    const diaValve = valve(0.09); diaValve.position.set(1.7, 0.45, 0.9); scene.add(sh(diaValve));
    const diaTag = pill(W.diaphragm, '#e58a12'); diaTag.position.set(-2.3, -0.3, 2.1); scene.add(diaTag);

    // air sacs and blood vessel: a close-up bubble to the right
    const sacs = new T.Group(); sacs.position.set(4.2, 1.6, 0.4); scene.add(sacs);
    const bubble = new T.Mesh(new T.SphereGeometry(1.45, 48, 32), new T.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, transmission: 0, transparent: true, opacity: 0.18, clearcoat: 1, depthWrite: false }));
    sacs.add(bubble);
    const sacR = K.rng(4), sacMeshes = [];
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28, m = new T.Mesh(new T.SphereGeometry(0.34, 24, 16), M.lung); m.position.set(i ? 0.55 * Math.cos(a) : 0, (i ? 0.55 * Math.sin(a) : 0) + 0.2, sacR.range(-0.2, 0.2)); sacs.add(m); sacMeshes.push(m); }
    const vessel = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([[-1.2, -0.75, 0.2], [-0.3, -0.55, 0.45], [0.5, -0.7, 0.3], [1.2, -0.45, 0.1]].map(p => new T.Vector3(...p))), 40, 0.17, 16), M.blood);
    sacs.add(vessel);
    const sacTag = pill(W.alveoli, '#e8577a'); sacTag.position.set(0, 1.25, 0.3); sacs.add(sacTag);
    const bloodTag = pill(W.blood, '#b8202e'); bloodTag.position.set(0.95, -1.15, 0.3); sacs.add(bloodTag);
    const o2Tag = pill(W.o2, '#2f6fe0', '#fff', 0.3), co2Tag = pill(W.co2, '#6c7380', '#fff', 0.3);
    o2Tag.position.set(-1.05, 0.25, 0.6); co2Tag.position.set(1.05, 0.15, 0.6); sacs.add(o2Tag, co2Tag);
    const leader = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(2.35, 1.4, 0.2), new T.Vector3(3.0, 1.6, 0.3)]), 4, 0.03, 8), M.dial); scene.add(leader);

    // pressure gauge on the left
    const gauge = new T.Group(); gauge.position.set(-4.1, 1.5, 0.3); scene.add(gauge);
    const face = new T.Mesh(new T.CylinderGeometry(1.0, 1.0, 0.35, 48), M.dial); face.rotation.x = Math.PI / 2; gauge.add(face);
    const rim = new T.Mesh(new T.TorusGeometry(1.0, 0.14, 14, 48), vinyl('#7ac7c4')); gauge.add(rim);
    const arcTex = K.canvasTex(512, 512, g => {
      const c = 256; g.lineWidth = 50;
      [['#3b82f6', Math.PI * 0.8, Math.PI * 1.25], ['#e5e7eb', Math.PI * 1.25, Math.PI * 1.75], ['#ff6a6a', Math.PI * 1.75, Math.PI * 2.2]].forEach(([col, a, b]) => { g.strokeStyle = col; g.beginPath(); g.arc(c, c, 180, a, b); g.stroke(); });
      g.fillStyle = '#2d3142'; g.font = '900 54px Nunito'; g.textAlign = 'center'; g.fillText(W.low, 120, 430); g.fillText(W.high, 392, 430);
    });
    const arcs = new T.Mesh(new T.CircleGeometry(0.95, 48), new T.MeshStandardMaterial({ map: arcTex, transparent: true, roughness: 0.4 })); arcs.position.z = 0.18; gauge.add(arcs);
    const needle = new T.Mesh(new T.CapsuleGeometry(0.05, 0.62, 6, 12), M.needle); needle.geometry.translate(0, 0.33, 0); needle.position.z = 0.24; gauge.add(needle);
    const hub = new T.Mesh(new T.SphereGeometry(0.11, 16, 12), M.needle); hub.position.z = 0.24; gauge.add(hub);
    const gTag = pill(W.gauge, '#3f9e9a', '#fff', 0.3); gTag.position.set(0, -1.45, 0.2); gauge.add(gTag);
    sh(gauge);

    // air balls: blue = oxygen-rich air in, grey = air out; balls in the sac close-up swap places
    const NB = 36, ballGeo = new T.SphereGeometry(0.11, 16, 12);
    const inBalls = new T.InstancedMesh(ballGeo, M.o2, NB), outBalls = new T.InstancedMesh(ballGeo, M.co2, NB);
    inBalls.castShadow = outBalls.castShadow = true; scene.add(inBalls, outBalls);
    const swapO = new T.InstancedMesh(ballGeo, M.o2, 6), swapC = new T.InstancedMesh(ballGeo, M.co2, 6); sacs.add(swapO, swapC);
    // background: big soft balls drifting behind, out of focus by the fog
    const bgR = K.rng(9), bg = [];
    for (let i = 0; i < 9; i++) { const m = new T.Mesh(new T.SphereGeometry(bgR.range(0.5, 1.1), 32, 20), bgR.pick([M.cap, M.lung2, M.o2, M.dia])); m.userData = { x: bgR.range(-11, 11), y: bgR.range(0.5, 6), z: bgR.range(-14, -8), ph: bgR() * 6 }; scene.add(m); bg.push(m); }

    // title on the camera
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 900, px: 96, color: '#ffffff', stroke: '#2b6f8a', strokeWidth: 12, height: 0.56 });
      l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.62, -8); S.camera.add(l); return l; });

    const cam = K.camPath([
      { t: 0, pos: [-1.0, 2.6, 12.0], look: [-0.6, 2.0, 0] },
      { t: 2.5, pos: [-0.4, 2.7, 11.6], look: [-0.2, 2.1, 0] },
      { t: 5.0, pos: [0.3, 2.5, 12.3], look: [0.3, 1.95, 0] },
      { t: 7.5, pos: [0.2, 2.6, 12.3], look: [0.2, 2.0, 0] },
      { t: 10, pos: [0.0, 2.7, 12.4], look: [0.0, 2.05, 0] },
    ], S.camera);
    const MX = new T.Matrix4(), Q = new T.Quaternion(), V = new T.Vector3(), SC = new T.Vector3();
    const flowPt = (u, side) => u < 0.5 ? pipeCurves[0].getPointAt(u * 2) : pipeCurves[side ? 2 : 1].getPointAt((u - 0.5) * 2);

    return (t, realT) => {
      cam(t);
      // breathing: inhale 0.3-4.6, hold, exhale 7.6-9.2
      const down = K.prog(t, 0.3, 2.3, 'inOut') * (1 - K.prog(t, B[3] + 0.1, B[3] + 1.4, 'inOut'));
      const fill = K.prog(t, B[1], B[1] + 1.8, 'back') * (1 - K.prog(t, B[3] + 0.3, B[3] + 1.7, 'inOut'));
      const wob = 0.025 * Math.sin(t * 9) * Math.exp(-Math.max(0, t - B[1] - 1.8) * 2.5) * (t > B[1] + 1.2 ? 1 : 0);
      lungs.forEach((g, i) => { const s = 0.82 + 0.22 * fill; g.scale.set(s * (1 + wob), s * (1 - wob), s); g.position.y = 1.55 - 0.12 * down; });
      dia.scale.y = 0.32 * (1 - 0.6 * down) + 0.01 * Math.sin(realT * 2); dia.position.y = -0.05 - 0.15 * down;
      diaRim.position.y = dia.position.y; diaValve.position.y = 0.45 - 0.45 * down;
      diaTag.scale.setScalar(K.prog(t, 0.2, 0.6, 'back') + 0.0001);
      ribs.forEach(({ r, s, i }) => { r.rotation.y = (s > 0 ? 0 : Math.PI) + s * 0.12 * fill; r.position.x = 0.15 * s + s * 0.12 * fill; });
      needle.rotation.z = 0.0 + 0.85 * down * (1 - K.prog(t, B[1] + 1.8, B[2], 'inOut')) - 0.85 * K.prog(t, B[3] + 0.1, B[3] + 0.6) * (1 - K.prog(t, B[3] + 1.6, B[3] + 2.3));
      // air in, air out
      const inWin = [B[1] - 0.3, B[1] + 2.1], outWin = [B[3] + 0.3, B[3] + 2.2];
      for (let i = 0; i < NB; i++) {
        const ph = i / NB, side = i % 2;
        const ui = (t - inWin[0]) / (inWin[1] - inWin[0]) * 1.6 - ph * 0.6, uo = (t - outWin[0]) / (outWin[1] - outWin[0]) * 1.6 - ph * 0.6;
        const vi = ui > 0 && ui < 1, vo = uo > 0 && uo < 1;
        V.copy(flowPt(K.clamp(ui), side)); V.x += 0.08 * Math.sin(i * 2.3); V.z += 0.1 + 0.06 * Math.cos(i * 1.7);
        inBalls.setMatrixAt(i, MX.compose(V, Q, SC.setScalar(vi ? Math.min(1, ui * 8, (1 - ui) * 8) : 0.0001)));
        V.copy(flowPt(1 - K.clamp(uo), side)); V.x += 0.08 * Math.sin(i * 1.9); V.z += 0.1;
        outBalls.setMatrixAt(i, MX.compose(V, Q, SC.setScalar(vo ? Math.min(1, uo * 8, (1 - uo) * 8) : 0.0001)));
      }
      inBalls.instanceMatrix.needsUpdate = outBalls.instanceMatrix.needsUpdate = true;
      // the close-up: it inflates in at beat 3, swaps balls, deflates at beat 4
      const pop = K.prog(t, B[2] - 0.2, B[2] + 0.5, 'back') * (1 - K.prog(t, B[3] + 1.2, B[3] + 1.8, 'in'));
      sacs.scale.setScalar(Math.max(pop, 0.0001)); sacs.visible = pop > 0.001; leader.visible = pop > 0.5;
      sacMeshes.forEach((m, i) => m.scale.setScalar(1 + 0.06 * Math.sin(realT * 3 + i)));
      for (let i = 0; i < 6; i++) {
        const u = K.prog(t, B[2] + 0.5 + i * 0.22, B[2] + 1.4 + i * 0.22, 'inOut');
        const a = i / 6 * 6.28, sx = 0.5 * Math.cos(a), sy = 0.5 * Math.sin(a) + 0.2;
        V.set(K.lerp(sx * 0.6, -0.9 + i * 0.35, u), K.lerp(sy * 0.6, -0.62 + 0.04 * Math.sin(i), u), 0.5); swapO.setMatrixAt(i, MX.compose(V, Q, SC.setScalar(1.15)));
        V.set(K.lerp(-0.9 + i * 0.35, sx * 0.6, u), K.lerp(-0.62, sy * 0.6, u), 0.55); swapC.setMatrixAt(i, MX.compose(V, Q, SC.setScalar(1.15)));
      }
      swapO.instanceMatrix.needsUpdate = swapC.instanceMatrix.needsUpdate = true;
      [sacTag, bloodTag, o2Tag, co2Tag, diaTag].forEach(l => l.lookAt(S.camera.position));
      bg.forEach((m, i) => { const u = m.userData; m.position.set(u.x + 0.6 * Math.sin(realT * 0.2 + u.ph), u.y + 0.3 * Math.sin(realT * 0.5 + u.ph), u.z); });
      titles.forEach((l, i) => {
        const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.35, 'back')) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.2, B[i + 1]));
        l.visible = a > 0.01; l.scale.setScalar(Math.max(a, 0.001)); l.material.opacity = Math.min(1, a);
      });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.07 });
    k.play('thud', { t: 0.4, gain: 0.35, pitch: 0.7 });
    k.play('swish', { t: 0.3, gain: 0.2, pitch: 0.6, dur: 2 });
    k.play('whoosh', { t: B[1] - 0.2, gain: 0.45, pitch: 0.7, dur: 2.2 });
    k.play('pop', { t: B[1] + 1.3, gain: 0.35, pitch: 0.6 });
    k.play('pop', { t: B[2] - 0.1, gain: 0.45, pitch: 1.0 });
    for (let i = 0; i < 6; i++) k.play('bubble', { t: B[2] + 0.6 + i * 0.22, gain: 0.3, pitch: 0.8 + i * 0.1, pan: 0.4 });
    k.play('chime', { t: B[2] + 2.0, gain: 0.18, pitch: 1.2, music: true });
    k.play('whoosh', { t: B[3] + 0.2, gain: 0.45, pitch: 0.55, dur: 2.4 });
    k.play('swish', { t: B[3] + 1.2, gain: 0.3, pitch: 0.5, dur: 1.4 });
    k.play('pop', { t: B[3] + 1.75, gain: 0.3, pitch: 0.5 });
  },
  post: null,
};
