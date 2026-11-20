window.STYLES = window.STYLES || {};
STYLES['impossible-stairs'] = {
  id: 'impossible-stairs', name: 'Impossible Stairs',
  family: 'Strange worlds',
  use: 'Explainer',
  look: 'Pale stone stairs in a flat, map-like view with no perspective, built so that the stairs join into a loop that cannot exist. Small figures walk the loop and always go up. Soft shadows, a pale sky.',
  motion: 'The figures climb and climb and never arrive. Then the stairs turn a quarter turn, and the trick is plain: the top step does not meet the bottom one. At the end the steps settle to one level, and the loop becomes a real, flat path.',
  shownHere: 'How technical debt becomes a loop: each quick fix is one step up; every fix needs another fix; the team climbs but never arrives; seen from the side, the loop never closed; paying the debt down makes the path level and real.',
  goodFor: 'Paradoxes, vicious circles and hidden contradictions: debt, procrastination, bureaucracy, "busy but not moving". Calm, clever and a little uncanny.',
  fonts: ['Josefin Sans:wght@600;700'],
  duration: 12,
  samples: 4,
  // CONTENT: words written on the steps
  words: ['quick fix', 'patch', 'workaround', 'hotfix', 'one more patch'],
  beats: [
    { t: 0.0, label: 'A quick fix: one step up' },
    { t: 2.4, label: 'Every fix needs another fix' },
    { t: 4.8, label: 'They climb, but never arrive' },
    { t: 7.2, label: 'Turn it: the loop never closed' },
    { t: 9.6, label: 'Pay the debt down: the path is level' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Josefin Sans', BE = this.beats, WD = this.words;
    scene.background = new T.Color('#e8eef2'); scene.add(S.camera);
    const L = K.lights(S, 'studio', { size: 10 }); L.key.position.set(-6, 14, 4);
    const std = (c, r = 0.85, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    // the path: 7 steps +x, 7 steps +z, 3 steps -x, 3 steps -z; each rises 0.2, so the end sits 4 units up and 4 along x and z:
    // exactly along the view direction (1,1,1), so in this flat view the last step lands on the first
    const R = 0.2, legs = [[1, 0, 7], [0, 1, 7], [-1, 0, 3], [0, -1, 3]], steps = [];
    let x = 0, z = 0; legs.forEach(([dx, dz, n]) => { for (let i = 0; i < n; i++) { steps.push({ x: x + dx * 0.5, z: z + dz * 0.5, dx, dz }); x += dx; z += dz; } });
    const N = steps.length, H = N * R, CX = 2, CZ = 2;
    const world = new T.Group(); world.position.set(-CX, 0, -CZ); const spin = new T.Group(); spin.add(world); scene.add(spin);
    const stone = std('#efe8dc', 0.9), stoneDark = std('#d8cfc0', 0.9);
    const blocks = steps.map((s, i) => { const m = new T.Mesh(new T.BoxGeometry(s.dx ? 1.0 : 1.3, 0.7, s.dx ? 1.3 : 1.0), i % 2 ? stone : stoneDark); m.castShadow = m.receiveShadow = true; world.add(m); return m; });
    const stepY = (i, flat) => K.lerp(i * R, H / 2, flat);
    const words = WD.map((w, j) => { const l = K.label(w, { font: F, weight: 700, px: 52, color: '#4a3a2a', bg: 'rgba(255,255,255,0.85)', radius: 10, pad: 0.18, height: 0.5 }); scene.add(l); return { l, i: [1, 5, 9, 13, 17][j] }; });
    // the walkers
    const walkers = [0, 1, 2].map(k => { const g = new T.Group(); const body = new T.Mesh(new T.CapsuleGeometry(0.13, 0.3, 6, 12), std(['#d8503a', '#3a7ad8', '#3aa05a'][k], 0.6)); body.position.y = 0.3; const head = new T.Mesh(new T.SphereGeometry(0.11, 16, 12), std('#f0d0b0', 0.6)); head.position.y = 0.62; g.add(body, head); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); world.add(g); return g; });
    const ground = new T.Mesh(new T.PlaneGeometry(80, 80), std('#dfe6ea', 1)); ground.rotation.x = -Math.PI / 2; ground.position.y = -3.0; ground.receiveShadow = true; scene.add(ground);
    // a near-orthographic camera: far away along (1,1,1) with a narrow lens; titles scaled to match
    const FOV = 3, DIST = 190, KS = Math.tan(FOV * Math.PI / 360) / Math.tan(15 * Math.PI / 180);
    S.camera.fov = FOV; S.camera.updateProjectionMatrix(); S.camera.far = 600; S.camera.updateProjectionMatrix();
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 66, color: '#2a2a3a', bg: 'rgba(255,255,255,0.9)', radius: 12, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74 * KS, -8); l.scale.setScalar(KS); S.camera.add(l); return l; });
    const V = new T.Vector3(1, 1, 1).normalize(), C = new T.Vector3(1.2, H / 2 - 0.2, 1.2);
    const P = new T.Vector3();
    return (t, realT) => {
      S.camera.position.copy(C).addScaledVector(V, DIST); S.camera.lookAt(C);
      const turn = K.prog(t, B[3] + 0.1, B[3] + 1.6, 'inOut'), flat = K.prog(t, B[4] + 0.2, B[4] + 1.6, 'inOut');
      spin.rotation.y = -Math.PI / 2 * turn;
      blocks.forEach((m, i) => { const s = steps[i]; m.position.set(s.x, stepY(i, flat) - 0.35, s.z); });
      // walkers: always climbing; past the last step they reappear on the first (which looks like the next step up)
      const nOn = t < B[1] ? 1 : 3;
      walkers.forEach((w, k) => { w.visible = k < nOn; const s = ((realT * 1.6 + k * N / 3) % N + N) % N, i = Math.floor(s), f = s - i, a = steps[i];
        const nx = i + 1 < N ? steps[i + 1] : { x: a.x + a.dx, z: a.z + a.dz }; // past the last step: the virtual step N, drawn on top of step 0
        P.set(K.lerp(a.x, nx.x, f), K.lerp(stepY(i, flat), stepY(i + 1, flat), K.ease.inOut(K.clamp(f * 2 - 0.6))) + 0.03 * Math.abs(Math.sin(realT * 9 + k)), K.lerp(a.z, nx.z, f));
        w.position.copy(P); w.rotation.y = Math.atan2(a.dx, a.dz); });
      words.forEach(({ l, i }, j) => { const s = steps[i]; P.set(s.x - CX, stepY(i, flat) + 0.75, s.z - CZ).applyAxisAngle(new T.Vector3(0, 1, 0), spin.rotation.y); l.position.copy(P); l.quaternion.copy(S.camera.quaternion); l.visible = t > 0.2 + j * 0.45 && t < B[4] + 0.4; });
      titles.forEach((l, i) => { const a2 = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a2 > 0.01; l.material.opacity = a2; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.04 });
    for (let i = 0; i < 28; i++) k.play('tick', { t: 0.2 + i * 0.31, gain: 0.08, pitch: 1.0 + (i % 7) * 0.08 });
    k.play('pluck', { t: 0.4, gain: 0.12, pitch: 1.0, music: true }); k.play('pluck', { t: B[1] + 0.3, gain: 0.12, pitch: 1.12, music: true }); k.play('pluck', { t: B[2] + 0.3, gain: 0.12, pitch: 1.26, music: true });
    k.play('riser', { t: B[2] + 0.4, gain: 0.08, pitch: 1.0, dur: 2.0 });
    k.play('whoosh', { t: B[3] + 0.1, gain: 0.2, pitch: 0.5, dur: 1.6 }); k.play('drop', { t: B[3] + 1.6, gain: 0.2, pitch: 0.7 });
    k.play('wood', { t: B[4] + 0.4, gain: 0.25, pitch: 0.8 }); k.play('thud', { t: B[4] + 1.6, gain: 0.3, pitch: 0.7 }); k.play('chime', { t: B[4] + 1.8, gain: 0.15, pitch: 1.0, music: true });
  },
  post: null,
};
