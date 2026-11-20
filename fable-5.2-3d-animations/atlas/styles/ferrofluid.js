window.STYLES = window.STYLES || {};
STYLES['ferrofluid'] = {
  id: 'ferrofluid', name: 'Ferrofluid',
  family: 'Living and elemental',
  use: 'Explainer',
  look: 'A shallow white dish of black magnetic liquid on a white table. Where a hidden magnet sits below, the liquid stands up in a field of sharp glossy spikes. One studio light, a macro lens, mirror-black highlights.',
  motion: 'The magnets under the dish move and change, and the spikes follow them: they rise, lean, split into two groups and close into a ring, always in a neat honeycomb.',
  shownHere: 'How a magnetic field has a shape: one magnet makes one hill of spikes, the spikes follow the magnet when it moves, two magnets make two hills, and a ring magnet makes a ring.',
  goodFor: 'Invisible forces and fields made visible: magnetism, attention, influence, any "pull" that has a shape and a strength.',
  fonts: ['Space Grotesk:wght@500;700'],
  duration: 11,
  samples: 4,
  // CONTENT: one field shape per beat
  beats: [
    { t: 0.0, label: 'One magnet: one hill of spikes' },
    { t: 2.7, label: 'Move the magnet, the spikes follow' },
    { t: 5.4, label: 'Two magnets: two hills' },
    { t: 8.1, label: 'A ring magnet: a ring of spikes' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Space Grotesk';
    scene.background = new T.Color('#eeeeec'); scene.add(S.camera);
    K.lights(S, 'studio', { size: 6 });
    const table = new T.Mesh(new T.PlaneGeometry(60, 60), new T.MeshStandardMaterial({ color: '#f4f4f2', roughness: 0.6 })); table.rotation.x = -Math.PI / 2; table.receiveShadow = true; scene.add(table);
    const R = 3.0;
    const dish = new T.Mesh(new T.LatheGeometry([[0, 0], [R + 0.25, 0], [R + 0.45, 0.08], [R + 0.5, 0.5], [R + 0.38, 0.55], [R + 0.3, 0.18], [0, 0.18]].map(([x, y]) => new T.Vector2(x, y)), 96), new T.MeshPhysicalMaterial({ color: '#fbfbfa', roughness: 0.25, clearcoat: 1 })); dish.castShadow = dish.receiveShadow = true; scene.add(dish);
    // the liquid: a dense grid clamped to a disc, heights from the field each frame
    const N = 170, geo = new T.PlaneGeometry(2 * R, 2 * R, N, N); geo.rotateX(-Math.PI / 2);
    const P = geo.attributes.position, base = new Float32Array(P.count * 2);
    for (let i = 0; i < P.count; i++) { let x = P.getX(i), z = P.getZ(i); const r = Math.hypot(x, z); if (r > R) { x *= R / r; z *= R / r; } base[i * 2] = x; base[i * 2 + 1] = z; }
    const fluid = new T.Mesh(geo, new T.MeshPhysicalMaterial({ color: '#030303', roughness: 0.12, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 })); fluid.castShadow = fluid.receiveShadow = true; fluid.position.y = 0.2; scene.add(fluid);
    // field shapes: magnets as soft blobs, the ring as an annulus
    const blob = (x, z, mx, mz, w) => Math.exp(-((x - mx) ** 2 + (z - mz) ** 2) / (w * w));
    const fields = [
      (x, z) => blob(x, z, 0, 0, 1.15),
      (x, z, t) => { const p = K.prog(t, B[1] + 0.2, B[2] - 0.2, 'inOut'), a = p * Math.PI * 1.2; return blob(x, z, 1.3 * Math.sin(a), -1.0 + 1.0 * Math.cos(a), 1.05); },
      (x, z) => Math.max(blob(x, z, -1.45, 0.1, 0.9), blob(x, z, 1.45, 0.1, 0.9)),
      (x, z) => { const r = Math.hypot(x, z); return Math.exp(-((r - 1.75) ** 2) / 0.18); },
    ];
    // the honeycomb: three cosines at 60 degrees; their sum peaks on a hex lattice
    const kk = 2 * Math.PI / 0.3, dirs = [0, 1, 2].map(i => [Math.cos(i * Math.PI / 3), Math.sin(i * Math.PI / 3)]);
    const hex = (x, z) => (dirs.reduce((s, [a, b]) => s + Math.cos(kk * (x * a + z * b)), 0) + 1.5) / 4.5;
    const field = (x, z, t) => {
      let k = 0; for (let i = 1; i < B.length; i++) if (t >= B[i]) k = i;
      const u = k === 0 ? 1 : K.prog(t, B[k], B[k] + 0.9, 'inOut');
      const prev = k === 0 ? 0 : fields[k - 1](x, z, Math.min(t, B[k] - 0.01));
      return K.lerp(prev, fields[k](x, z, t), u);
    };
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 72, color: '#111', bg: 'rgba(255,255,255,0.85)', radius: 10, pad: 0.35, height: 0.4 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const cam = K.camPath([
      { t: 0, pos: [0.0, 5.6, 8.4], look: [0, 0.2, 0.4] },
      { t: 5.4, pos: [1.4, 6.0, 8.0], look: [0, 0.2, 0.2] },
      { t: 11, pos: [0.0, 8.0, 6.4], look: [0, 0.1, 0.2] },
    ], S.camera);
    return (t, realT) => {
      cam(t);
      for (let i = 0; i < P.count; i++) {
        const x = base[i * 2], z = base[i * 2 + 1], f = field(x, z, t), r = Math.hypot(x, z), edge = K.clamp((R - r) / 0.15);
        const sp = Math.pow(hex(x, z), 6) * f;
        P.setXYZ(i, x, edge * (0.02 + f * 0.28 + f * 1.1 * sp + 0.004 * Math.sin(realT * 3 + x * 4)), z);
      }
      P.needsUpdate = true; geo.computeVertexNormals();
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.05 });
    k.play('hum', { t: 0.05, gain: 0.25, pitch: 0.6, dur: 1.4 }); k.play('glass', { t: 0.5, gain: 0.15, pitch: 1.6 });
    k.play('swish', { t: B[1] + 0.2, gain: 0.25, pitch: 0.6, dur: 2.0 }); k.play('hum', { t: B[1] + 0.2, gain: 0.15, pitch: 0.7, dur: 2.2 });
    k.play('metal', { t: B[2] + 0.1, gain: 0.3, pitch: 0.9 }); k.play('metal', { t: B[2] + 0.35, gain: 0.3, pitch: 1.1 }); k.play('hum', { t: B[2] + 0.2, gain: 0.2, pitch: 0.8, dur: 1.6 });
    k.play('metal', { t: B[3] + 0.1, gain: 0.35, pitch: 0.7 }); k.play('hum', { t: B[3] + 0.2, gain: 0.25, pitch: 0.5, dur: 2.4 }); k.play('sparkle', { t: B[3] + 0.9, gain: 0.12, pitch: 0.8 });
  },
  post: null,
};
