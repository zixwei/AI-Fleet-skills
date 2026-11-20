window.STYLES = window.STYLES || {};
STYLES['voxel'] = {
  id: 'voxel', name: 'Voxel',
  family: 'Filters over 3D',
  use: 'Explainer',
  look: 'Everything is built from small bevelled cubes in a short palette, each cube a slightly different shade, on a dark display base. Soft studio light, crisp shadows between the cubes.',
  motion: 'Things assemble cube by cube: each cube drops in and clicks into place, in the order the thing grows. The model turns slowly on its base.',
  shownHere: 'How a plant grows from a seed: a seed in the soil, a root that grows down, a shoot that climbs to the light, and leaves that open to make food.',
  goodFor: 'Growth, construction and anything that is built up step by step: games, simple science, building projects, data that adds up.',
  fonts: ['Press Start 2P'],
  duration: 11,
  samples: 6,
  // CONTENT
  beats: [
    { t: 0.0, label: 'A SEED IN THE SOIL' },
    { t: 2.7, label: 'A ROOT GROWS DOWN' },
    { t: 5.4, label: 'A SHOOT CLIMBS UP' },
    { t: 8.1, label: 'LEAVES OPEN TO THE SUN' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Press Start 2P';
    scene.background = new T.Color('#cfe6ea'); scene.fog = new T.Fog('#cfe6ea', 22, 44); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 7, target: [0, 1, 0] }); L.key.position.set(-6, 10, 7); L.key.intensity = 2.4; L.amb.intensity = 1.0;
    const floor = new T.Mesh(new T.PlaneGeometry(80, 80), new T.MeshStandardMaterial({ color: '#c3dde2', roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -3.6; floor.receiveShadow = true; scene.add(floor);
    const base = new T.Mesh(new T.CylinderGeometry(4.2, 4.5, 0.6, 6), new T.MeshStandardMaterial({ color: '#2a2f3a', roughness: 0.5 })); base.position.y = -3.3; base.castShadow = base.receiveShadow = true; scene.add(base);
    // voxels: [x, y, z, colour, appear time]
    const VX = [], P = { soil: ['#7a4e2d', '#6a4226', '#845634'], soil2: ['#5a3a20', '#4e321b'], grass: ['#5fae4a', '#6abf55'], seed: ['#b8863b', '#a8762f'], root: ['#efe0c0', '#e2d0aa'], stem: ['#4f9a3a', '#5aa845'], leaf: ['#4fc04a', '#5ad055', '#45b040'], sun: ['#ffd23a', '#ffc21a'], flower: ['#ff7aa0', '#ff5a8a'] };
    const pick = (arr, i) => arr[i % arr.length];
    let n = 0;
    // soil block, cut away at the front so the inside shows
    for (let x = -4; x <= 4; x++) for (let y = -4; y <= -1; y++) for (let z = -2; z <= 2; z++) { if (z === 2 && x > -3 && y < -1) continue; if (z === 1 && x > -1 && x < 3 && y < -1) continue; VX.push([x, y, z, y === -1 ? pick(P.grass, n++) : y < -2 ? pick(P.soil2, n++) : pick(P.soil, n++), -2 + (x + 4) * 0.02 + (y + 4) * 0.03]); }
    // the seed
    [[0, -2, 0], [1, -2, 0], [0, -2, 1], [1, -2, 1]].forEach(([x, y, z], i) => VX.push([x, y, z, pick(P.seed, i), -1 + i * 0.1]));
    // the root: down and branching
    const root = [[0, -3, 0], [0, -4, 0], [1, -3, 1], [-1, -4, 0], [1, -4, 1], [-1, -4, 1], [2, -4, 1], [0, -4, 1], [-2, -4, 1], [2, -4, 0], [-2, -4, 0]];
    root.forEach(([x, y, z], i) => VX.push([x, y, z, pick(P.root, i), B[1] + 0.2 + i * 0.16]));
    // the shoot: up to y = 6
    const stem = []; for (let y = -1; y <= 6; y++) stem.push([0, y, 0], [1, y, 0]);
    stem.forEach(([x, y, z], i) => VX.push([x, y, z, pick(P.stem, i), B[2] + 0.1 + i * 0.1]));
    // leaves and a flower
    const leaves = []; [[-1, 3, -1], [2, 4, 1]].forEach(([lx, ly, dir]) => { [[0, 0], [1, 0], [2, 0], [1, 1], [2, 1], [3, 1], [3, 2]].forEach(([dx, dy]) => leaves.push([lx + dir * dx, ly + dy, 0])); });
    leaves.forEach(([x, y, z], i) => VX.push([x, y, z, pick(P.leaf, i), B[3] + 0.1 + i * 0.09]));
    [[0, 7, 0], [1, 7, 0], [-1, 7, 0], [2, 7, 0], [0, 8, 0], [1, 8, 0], [0, 6, 1], [1, 6, -1]].forEach(([x, y, z], i) => VX.push([x, y, z, i < 6 ? pick(P.flower, i) : pick(P.leaf, i), B[3] + 1.3 + i * 0.08]));
    // the sun: a small voxel ball in the corner
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) if (Math.abs(x) + Math.abs(y) + Math.abs(z) <= 2) VX.push([x - 6, y + 7, z - 3, pick(P.sun, x + y + z + 3), B[3] - 0.3 + 0.03 * (x + y + z + 3)]);
    // geometry: a bevelled cube
    const S0 = 0.5, rb = (() => { const r = 0.06, w = S0 - 0.03, s = new T.Shape(), x = -w / 2 + r, y = -w / 2 + r, W2 = w - 2 * r; s.moveTo(x, y - r); s.lineTo(x + W2, y - r); s.quadraticCurveTo(x + W2 + r, y - r, x + W2 + r, y); s.lineTo(x + W2 + r, y + W2); s.quadraticCurveTo(x + W2 + r, y + W2 + r, x + W2, y + W2 + r); s.lineTo(x, y + W2 + r); s.quadraticCurveTo(x - r, y + W2 + r, x - r, y + W2); s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r); const g = new T.ExtrudeGeometry(s, { depth: w - 2 * r, bevelEnabled: true, bevelSize: r * 0.6, bevelThickness: r * 0.6, bevelSegments: 2, curveSegments: 2 }); g.translate(0, 0, -(w - 2 * r) / 2); return g; })();
    const mesh = new T.InstancedMesh(rb, new T.MeshStandardMaterial({ roughness: 0.55 }), VX.length); mesh.castShadow = mesh.receiveShadow = true; mesh.frustumCulled = false;
    const col = new T.Color(), jr = K.rng(4);
    VX.forEach((v, i) => { col.set(v[3]).offsetHSL(0, 0, jr.range(-0.04, 0.04)); mesh.setColorAt(i, col); });
    const model = new T.Group(); model.position.y = -0.6; scene.add(model); model.add(mesh);
    // a glow for the sun and sparkles when the leaves work
    const sunL = new T.PointLight('#ffd27a', 0, 14, 1.5); sunL.position.set(-3, 3.3, -1.5); model.add(sunL);
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 400, px: 56, color: '#2a2f3a', height: 0.34 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.76, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [2.4, -1.0, 8.6], look: [0.3, -2.0, 0] },
      { t: 2.7, pos: [2.0, -1.4, 9.0], look: [0.2, -2.2, 0] },
      { t: 5.4, pos: [4.5, 2.5, 11.5], look: [0, 0.6, 0] },
      { t: 11, pos: [6.0, 4.0, 13.0], look: [-0.5, 1.0, 0] },
    ], S.camera);
    const MX = new T.Matrix4(), Q = new T.Quaternion(), V = new T.Vector3(), SC = new T.Vector3(), E = new T.Euler();
    return (t, realT) => {
      cam(t);
      model.rotation.y = -0.35 + 0.15 * Math.sin(t * 0.3);
      VX.forEach(([x, y, z, c, t0], i) => {
        const p = K.prog(t, t0, t0 + 0.3, 'out'), land = K.prog(t, t0 + 0.2, t0 + 0.35);
        V.set(x * S0, y * S0 + (1 - p) * 2.0, z * S0);
        const sc = t < t0 ? 0.0001 : 1 - 0.18 * Math.sin(land * Math.PI);
        E.set(0, (1 - p) * 0.6, 0); Q.setFromEuler(E);
        mesh.setMatrixAt(i, MX.compose(V, Q, SC.set(sc, sc, sc)));
      });
      mesh.instanceMatrix.needsUpdate = true;
      sunL.intensity = 8 * K.prog(t, B[3], B[3] + 0.6) * (0.9 + 0.1 * Math.sin(realT * 3));
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.05 });
    for (let i = 0; i < 4; i++) k.play('click', { t: 0.55 + i * 0.1, gain: 0.25, pitch: 1.0 + i * 0.1 });
    for (let i = 0; i < 11; i++) k.play('click', { t: B[1] + 0.4 + i * 0.16, gain: 0.2, pitch: 0.7 + i * 0.03 });
    for (let i = 0; i < 16; i++) k.play('click', { t: B[2] + 0.3 + i * 0.1, gain: 0.18, pitch: 1.0 + i * 0.04 });
    for (let i = 0; i < 18; i++) k.play('blip', { t: B[3] + 0.3 + i * 0.09, gain: 0.1, pitch: 1.0 + (i % 6) * 0.15, music: true });
    k.play('click', { t: B[3] + 0.3, gain: 0.2, pitch: 1.4 });
    k.play('chime', { t: B[3] + 2.1, gain: 0.25, pitch: 1.0, music: true });
  },
  post: null,
};
