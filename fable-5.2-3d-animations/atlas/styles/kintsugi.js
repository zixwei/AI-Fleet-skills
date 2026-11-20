window.STYLES = window.STYLES || {};
STYLES['kintsugi'] = {
  id: 'kintsugi', name: 'Kintsugi',
  family: 'Crafted materials',
  use: 'Story',
  look: 'A dark speckled ceramic bowl on a linen cloth, seen through a macro lens with shallow focus. Soft window light from one side; a small dish of gold and a fine brush beside it.',
  motion: 'The bowl breaks into shards that drift apart and turn slowly, then fly back into place. Gold seams draw themselves along every crack and the bowl glows where it was broken.',
  shownHere: 'How a team recovers from an outage: everything works, the system breaks, the team puts it back together, and the lessons stay visible as gold seams.',
  goodFor: 'Stories of failure and repair, resilience, change and lessons learned: something whole, a break, a careful repair, and a result that is stronger and visible.',
  fonts: ['EB Garamond:wght@600'],
  duration: 11,
  samples: 8,
  dof: { aperture: 0.05 },
  // CONTENT
  beats: [
    { t: 0.0, label: 'Everything works' },
    { t: 2.7, label: 'An outage: it breaks' },
    { t: 5.4, label: 'The team puts it back together' },
    { t: 8.1, label: 'The cracks become gold: lessons kept' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'EB Garamond';
    scene.background = new T.Color('#1b1714'); scene.fog = new T.Fog('#1b1714', 10, 22); scene.add(S.camera);
    S.camera.fov = 22; S.camera.updateProjectionMatrix();
    const L = K.lights(S, 'lamp', { size: 4, target: [0, 0.6, 0] }); L.key.position.set(-5, 6, 3); L.key.intensity = 3.0; L.key.color.set('#ffe6c4'); L.amb.intensity = 0.6; S.scene.environmentIntensity = 0.6;
    // linen cloth
    const linen = K.canvasTex(1024, 1024, (g, r, w, h) => { g.fillStyle = '#d9cfbd'; g.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 3) { g.fillStyle = `rgba(255,255,255,${r.range(0.03, 0.12)})`; g.fillRect(i, 0, 1.5, h); g.fillStyle = `rgba(90,70,50,${r.range(0.03, 0.12)})`; g.fillRect(0, i, w, 1.5); } for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(90,70,50,0.12)'; g.fillRect(0, r() * h, w, r.range(1, 3)); } }, 3);
    linen.wrapS = linen.wrapT = T.RepeatWrapping; linen.repeat.set(3, 3);
    const cloth = new T.Mesh(new T.PlaneGeometry(14, 10, 60, 40), new T.MeshStandardMaterial({ map: linen, roughness: 0.95 }));
    { const p = cloth.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, 0.04 * Math.sin(p.getX(i) * 1.3 + p.getY(i) * 0.7) + 0.03 * Math.sin(p.getY(i) * 3.1)); cloth.geometry.computeVertexNormals(); }
    cloth.rotation.x = -Math.PI / 2; cloth.receiveShadow = true; scene.add(cloth);

    // the bowl: a thin shell made by a lathe, cut into Voronoi shards
    const prof = [[0.0, 0.0], [0.7, 0.0], [0.78, 0.06], [1.2, 0.35], [1.55, 0.78], [1.72, 1.2], [1.74, 1.28], [1.66, 1.27], [1.62, 1.18], [1.45, 0.8], [1.1, 0.42], [0.72, 0.18], [0.0, 0.14]].map(([x, y]) => new T.Vector2(x, y));
    const P = prof.length, SEG = 96;
    const lathe = new T.LatheGeometry(prof, SEG);
    const idx = lathe.index.array, lp = lathe.attributes.position, ln = lathe.attributes.normal;
    const seeds = []; const sr = K.rng(8);
    for (let i = 0; i < 9; i++) { const a = sr() * 6.283, y = sr.range(-0.6, 0.9); seeds.push(new T.Vector3(Math.cos(a) * Math.sqrt(1 - y * y), y, Math.sin(a) * Math.sqrt(1 - y * y))); }
    const C0 = new T.Vector3(0, 0.55, 0), v = new T.Vector3(), cen = new T.Vector3();
    const triShard = [];
    for (let f = 0; f < idx.length; f += 3) {
      cen.set(0, 0, 0); for (let k = 0; k < 3; k++) cen.add(v.fromBufferAttribute(lp, idx[f + k])); cen.divideScalar(3);
      const d = cen.clone().sub(C0).normalize(); let best = 0, bd = -2;
      seeds.forEach((s, i) => { const dd = d.dot(s) + 0.08 * Math.sin(cen.x * 7 + cen.y * 5 + cen.z * 9); if (dd > bd) { bd = dd; best = i; } });
      triShard.push(best);
    }
    const glaze = new T.MeshPhysicalMaterial({ roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.25, side: T.DoubleSide, map: K.canvasTex(512, 256, (g, r, w, h) => { g.fillStyle = '#23262e'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(70,90,110,0.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${r() < 0.5 ? 220 : 120},${r() < 0.5 ? 200 : 140},${r() < 0.5 ? 170 : 150},${r.range(0.15, 0.5)})`; g.fillRect(r() * w, r() * h, r.range(1, 2.5), r.range(1, 2.5)); } }, 5) });
    const shards = seeds.map((s, si) => {
      const pos = [], nor = [], uv = [], la = lathe.attributes.uv;
      for (let f = 0, t = 0; f < idx.length; f += 3, t++) if (triShard[t] === si) for (let k = 0; k < 3; k++) { const i = idx[f + k]; pos.push(lp.getX(i), lp.getY(i), lp.getZ(i)); nor.push(ln.getX(i), ln.getY(i), ln.getZ(i)); uv.push(la.getX(i), la.getY(i)); }
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
      g.computeBoundingBox(); const c = g.boundingBox.getCenter(new T.Vector3()); g.translate(-c.x, -c.y, -c.z);
      const m = new T.Mesh(g, glaze); m.castShadow = m.receiveShadow = true;
      const grp = new T.Group(); grp.position.copy(c); grp.add(m); scene.add(grp);
      const dir = c.clone().sub(C0).setY(0).normalize().add(new T.Vector3(0, 0.5, 0)).normalize();
      return { grp, home: c.clone(), dir, spin: new T.Vector3(sr.range(-1, 1), sr.range(-1, 1), sr.range(-1, 1)).normalize(), amt: sr.range(0.5, 0.9) };
    });
    // gold seams: every lathe edge shared by two different shards
    const edgeMap = new Map();
    for (let f = 0, t = 0; f < idx.length; f += 3, t++) for (let k = 0; k < 3; k++) {
      let a = idx[f + k], b = idx[f + (k + 1) % 3];
      const key = Math.min(a, b) + ',' + Math.max(a, b);
      if (!edgeMap.has(key)) edgeMap.set(key, []); edgeMap.get(key).push(t);
    }
    const segs = [];
    edgeMap.forEach((tris, key) => { if (tris.length === 2 && triShard[tris[0]] !== triShard[tris[1]]) { const [a, b] = key.split(',').map(Number); const A = new T.Vector3().fromBufferAttribute(lp, a), Bp = new T.Vector3().fromBufferAttribute(lp, b), n = new T.Vector3().fromBufferAttribute(ln, a); segs.push([A.addScaledVector(n, 0.004), Bp.addScaledVector(n, 0.004)]); } });
    const start = new T.Vector3(1.7, 1.25, 0.6);
    segs.sort((p, q) => p[0].distanceTo(start) - q[0].distanceTo(start));
    const goldMat = new T.MeshPhysicalMaterial({ color: '#e2b04a', metalness: 1, roughness: 0.2, emissive: '#7a4a08', emissiveIntensity: 0.4 });
    const gold = new T.InstancedMesh(new T.CylinderGeometry(0.018, 0.018, 1, 6).translate(0, 0.5, 0), goldMat, segs.length); scene.add(gold);
    const MX = new T.Matrix4(), Q = new T.Quaternion(), UP = new T.Vector3(0, 1, 0), SC = new T.Vector3();
    // tools: a lacquer dish of gold and a brush
    const dish = new T.Mesh(new T.CylinderGeometry(0.45, 0.38, 0.12, 40), new T.MeshPhysicalMaterial({ color: '#5a1612', roughness: 0.25, clearcoat: 1 })); dish.position.set(2.6, 0.06, 1.3); dish.castShadow = true; scene.add(dish);
    const powder = new T.Mesh(new T.CircleGeometry(0.36, 32), goldMat); powder.rotation.x = -Math.PI / 2; powder.position.set(2.6, 0.125, 1.3); scene.add(powder);
    const brush = new T.Group(); const handle = new T.Mesh(new T.CylinderGeometry(0.035, 0.03, 1.8, 12), new T.MeshStandardMaterial({ color: '#2a1c14', roughness: 0.4 })); handle.rotation.z = Math.PI / 2; brush.add(handle);
    const tip = new T.Mesh(new T.ConeGeometry(0.05, 0.25, 12), goldMat); tip.rotation.z = Math.PI / 2; tip.position.x = 1.0; brush.add(tip); brush.position.set(2.2, 0.05, 2.1); brush.rotation.y = 0.5; brush.traverse(o => { o.castShadow = true; }); scene.add(brush);
    // dust of the break and sparkles of the gold
    const NS = 60, sparks = new T.InstancedMesh(new T.OctahedronGeometry(0.02, 0), new T.MeshBasicMaterial({ color: '#ffe2a0', toneMapped: false }), NS); scene.add(sparks);
    const spR = K.rng(3), sp0 = Array.from({ length: NS }, () => [spR.int(0, segs.length - 1), spR() * 6]);
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 600, px: 84, color: '#f3e7d3', height: 0.36 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.22, -8); S.camera.add(l); return l; });

    const cam = K.camPath([
      { t: 0, pos: [0.4, 4.6, 10.5], look: [0, 0.65, 0] },
      { t: 2.7, pos: [1.6, 4.4, 10.8], look: [0, 0.8, 0] },
      { t: 5.4, pos: [-0.6, 4.8, 10.6], look: [0, 0.7, 0] },
      { t: 8.1, pos: [0.8, 5.0, 9.6], look: [0, 0.6, 0] },
      { t: 11, pos: [-0.3, 5.4, 9.2], look: [0, 0.55, 0] },
    ], S.camera);
    return (t, realT) => {
      cam(t);
      const burst = K.prog(t, B[1] + 0.1, B[1] + 0.9, 'out'), back = K.prog(t, B[2] + 0.2, B[2] + 1.8, 'inOut');
      const apart = burst * (1 - back);
      shards.forEach((s, i) => {
        s.grp.position.copy(s.home).addScaledVector(s.dir, apart * s.amt * 1.2);
        s.grp.position.y += apart * 0.25 * Math.sin(realT * 1.2 + i) + apart * 0.3;
        s.grp.setRotationFromAxisAngle(s.spin, apart * 0.5 + apart * 0.08 * Math.sin(realT + i));
      });
      // gold draws along the seams once the bowl is whole again
      const draw = K.prog(t, B[3] + 0.1, B[3] + 2.2);
      const nOn = Math.floor(draw * segs.length);
      segs.forEach(([a, b], i) => {
        const on = i < nOn ? 1 : i === nOn ? (draw * segs.length) % 1 : 0;
        const d = b.clone().sub(a), len = d.length() * on; Q.setFromUnitVectors(UP, d.normalize());
        gold.setMatrixAt(i, MX.compose(a, Q, SC.set(on ? 1 : 0.0001, Math.max(0.0001, len), on ? 1 : 0.0001)));
      });
      gold.instanceMatrix.needsUpdate = true;
      goldMat.emissiveIntensity = 0.4 + 0.8 * K.prog(t, B[3] + 1.6, B[3] + 2.6) * (0.85 + 0.15 * Math.sin(realT * 2));
      sp0.forEach(([si, ph], i) => { const s = segs[si], tw = Math.max(0, Math.sin(realT * 3 + ph)) ** 12 * (si < nOn ? 1 : 0); sparks.setMatrixAt(i, MX.compose(s[0].clone().add(new T.Vector3(0, 0.02, 0)), Q.identity(), SC.setScalar(0.0001 + tw * 1.5))); });
      sparks.instanceMatrix.needsUpdate = true;
      brush.position.set(2.2 - 0.3 * K.prog(t, B[3], B[3] + 0.6, 'inOut') * (1 - K.prog(t, B[3] + 2.0, B[3] + 2.6)), 0.05 + 0.3 * K.prog(t, B[3], B[3] + 0.6) * (1 - K.prog(t, B[3] + 2.0, B[3] + 2.6)), 2.1);
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.06 });
    k.play('glass', { t: 0.4, gain: 0.15, pitch: 0.7 });
    k.play('glass', { t: B[1] + 0.1, gain: 0.6, pitch: 0.6 }); k.play('thud', { t: B[1] + 0.1, gain: 0.4, pitch: 0.8 });
    for (let i = 0; i < 6; i++) k.play('glass', { t: B[1] + 0.15 + i * 0.07, gain: 0.25, pitch: 1.0 + i * 0.2, pan: (i % 2 ? 0.4 : -0.4) });
    k.play('whoosh', { t: B[2] + 0.2, gain: 0.25, pitch: 0.7, dur: 1.6 });
    for (let i = 0; i < 4; i++) k.play('click', { t: B[2] + 1.4 + i * 0.1, gain: 0.25, pitch: 0.8 + i * 0.1 });
    k.play('sparkle', { t: B[3] + 0.2, gain: 0.25 });
    k.play('bell', { t: B[3] + 1.8, gain: 0.25, pitch: 0.8, music: true });
    k.play('sparkle', { t: B[3] + 2.4, gain: 0.25, pitch: 1.2 });
  },
  post: null,
};
