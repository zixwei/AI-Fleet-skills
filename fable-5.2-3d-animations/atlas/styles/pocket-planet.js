window.STYLES = window.STYLES || {};
STYLES['pocket-planet'] = {
  id: 'pocket-planet', name: 'Pocket Planet',
  family: 'Earth, weather and sky',
  use: 'Explainer',
  look: 'One very small planet, about twenty steps around, on a field of stars. Houses, trees and a sea sit on its curve. A line between day and night crosses it, and small white arrows fly around it like birds.',
  motion: 'The planet turns slowly while the camera orbits. The day-night line moves across the houses. Arrows rise, fly, sink and return in loops; at the end they bend sideways as the planet spins under them.',
  shownHere: 'How trade winds circle the planet: the sun heats the equator most; hot air rises and flows toward the poles; it sinks again near 30 degrees north and south; at the surface it flows back to the equator; the planet\'s spin bends that flow, so the trade winds blow from the east.',
  goodFor: 'Global cycles on a small, friendly world: weather, ocean currents, day and night, seasons, supply loops, anything that goes round and round a sphere.',
  fonts: ['Fredoka:wght@500;700'],
  duration: 12,
  samples: 4,
  // CONTENT
  beats: [
    { t: 0.0, label: 'The sun heats the equator most' },
    { t: 2.4, label: 'Hot air rises and flows toward the poles' },
    { t: 4.8, label: 'It sinks again near 30° north and south' },
    { t: 7.2, label: 'At the surface, it flows back to the equator' },
    { t: 9.6, label: 'The spin bends it: trade winds from the east' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Fredoka', BE = this.beats;
    scene.background = new T.Color('#05060e'); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#3a4a7a', '#05060e', 0.35));
    const sun = new T.DirectionalLight('#fff4dc', 3.2); sun.position.set(12, 2, 4); scene.add(sun);
    const std = (c, r = 0.7, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const rr = K.rng(73);
    // stars
    const sg = []; for (let i = 0; i < 900; i++) { const v = new T.Vector3(rr.range(-1, 1), rr.range(-1, 1), rr.range(-1, 1)).normalize().multiplyScalar(rr.range(60, 90)); sg.push(v.x, v.y, v.z); }
    scene.add(new T.Points(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(sg, 3)), new T.PointsMaterial({ color: '#ffffff', size: 0.25, sizeAttenuation: true })));
    // the planet: a painted ball; land patches, sea, a warm band at the equator that can glow
    const R = 3.0, planet = new T.Group(); scene.add(planet);
    const land = (lat, lon) => { const n = Math.sin(lon * 3 + 1) * Math.cos(lat * 4) + 0.6 * Math.sin(lon * 5 - lat * 2 + 2); return n > 0.35; };
    const tex = K.canvasTex(1024, 512, (g, r, w, h) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x += 2) { const lat = (0.5 - y / h) * Math.PI, lon = (x / w) * Math.PI * 2; g.fillStyle = land(lat, lon) ? (Math.abs(lat) > 1.2 ? '#f0f4f8' : Math.abs(lat) < 0.35 ? '#5aa04a' : '#8ab05a') : (Math.abs(lat) > 1.3 ? '#e8f0f8' : '#2a7ac0'); g.fillRect(x, y, 2, 1); } }, 5);
    const ball = new T.Mesh(new T.SphereGeometry(R, 96, 64), std('#ffffff', 0.8, { map: tex })); planet.add(ball);
    const heat = new T.Mesh(new T.SphereGeometry(R + 0.02, 96, 32, 0, Math.PI * 2, Math.PI / 2 - 0.2, 0.4), new T.MeshBasicMaterial({ color: '#ff8a3a', transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false })); planet.add(heat);
    const toXYZ = (lat, lon, alt = 0) => { const r = R + alt; return new T.Vector3(r * Math.cos(lat) * Math.cos(lon), r * Math.sin(lat), -r * Math.cos(lat) * Math.sin(lon)); };
    // houses and trees on land
    const place = (m, lat, lon) => { const p = toXYZ(lat, lon); m.position.copy(p); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), p.clone().normalize()); planet.add(m); };
    let n = 0; while (n < 46) { const lat = rr.range(-1.0, 1.0), lon = rr() * Math.PI * 2; if (!land(lat, lon)) continue; n++;
      if (rr() < 0.5) { const h = new T.Group(); const b = new T.Mesh(new T.BoxGeometry(0.16, 0.14, 0.16), std('#f4e8d0')); b.position.y = 0.07; const rf = new T.Mesh(new T.ConeGeometry(0.14, 0.12, 4), std('#c0402a')); rf.position.y = 0.2; rf.rotation.y = Math.PI / 4; h.add(b, rf); place(h, lat, lon); }
      else { const tr = new T.Group(); const c = new T.Mesh(new T.ConeGeometry(0.09, 0.26, 7), std('#2a6a3a')); c.position.y = 0.18; const st = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.08, 5), std('#5a3a20')); st.position.y = 0.04; tr.add(c, st); place(tr, lat, lon); } }
    // latitude rings at 30 N, the equator and 30 S
    const rings = [Math.PI / 6, 0, -Math.PI / 6].map((lat, i) => { const r = R * Math.cos(lat) + 0.02, m = new T.Mesh(new T.TorusGeometry(r, 0.012, 6, 120), new T.MeshBasicMaterial({ color: i === 1 ? '#ffd080' : '#ffffff', transparent: true, opacity: 0.55 })); m.rotation.x = Math.PI / 2; m.position.y = R * Math.sin(lat); planet.add(m); return m; });
    const ringTags = ['30° N', 'Equator', '30° S'].map((s, i) => { const l = K.label(s, { font: F, weight: 700, px: 48, color: '#ffffff', bg: 'rgba(10,14,30,0.7)', radius: 8, pad: 0.15, height: 0.22 }); scene.add(l); return { l, lat: [Math.PI / 6, 0, -Math.PI / 6][i] }; });
    // the wind loop: rise at the equator, fly poleward high up, sink at 30 degrees, return at the surface
    const LAT30 = Math.PI / 6, HI = 0.9, LO = 0.08;
    const loop = (s, hem, lon0, bend) => { s = ((s % 4) + 4) % 4; let lat, alt, lon = lon0;
      if (s < 1) { lat = 0.02; alt = K.lerp(LO, HI, s); } else if (s < 2) { lat = K.lerp(0.02, LAT30, s - 1); alt = HI; } else if (s < 3) { lat = LAT30; alt = K.lerp(HI, LO, s - 2); } else { const u = s - 3; lat = K.lerp(LAT30, 0.02, u); alt = LO; lon = lon0 - bend * 0.9 * u; }
      return toXYZ(hem * lat, lon, alt); };
    const NL = 8, PER = 6, NA = NL * 2 * PER;
    const arrows = new T.InstancedMesh(new T.ConeGeometry(0.09, 0.3, 8).rotateX(Math.PI / 2), new T.MeshBasicMaterial({ color: '#ffffff' }), NA); arrows.frustumCulled = false; planet.add(arrows);
    const segOn = t => [K.prog(t, B[1], B[1] + 0.6), K.prog(t, B[1] + 0.6, B[1] + 1.2), K.prog(t, B[2], B[2] + 0.6), K.prog(t, B[3], B[3] + 0.6)];
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 68, color: '#f4f8ff', bg: 'rgba(8,10,24,0.82)', radius: 14, pad: 0.35, height: 0.38 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const O = new T.Object3D(), P = new T.Vector3(), Q = new T.Vector3(), WARM = new T.Color('#ffb060'), COOL = new T.Color('#a8dcff');
    return (t, realT) => {
      const ca = -0.5 + t * 0.12; S.camera.position.set(Math.sin(ca) * 14.5, 3.0 + 0.6 * Math.sin(t * 0.3), Math.cos(ca) * 14.5); S.camera.lookAt(0, 1.1, 0);
      planet.rotation.y = t * 0.18;
      heat.material.opacity = 0.2 * (0.6 + 0.4 * Math.sin(realT * 2)) * (1 - 0.6 * K.prog(t, B[1], B[2]));
      const on = segOn(t), bend = K.prog(t, B[4], B[4] + 1.4, 'inOut');
      let i = 0;
      for (let L = 0; L < NL; L++) for (const hem of [1, -1]) for (let k = 0; k < PER; k++) {
        const s = (k / PER * 4 + realT * 0.45) % 4, seg = Math.floor(s), lon = L / NL * Math.PI * 2;
        const vis = on[seg] > 0.5;
        P.copy(loop(s, hem, lon, bend)); Q.copy(loop(s + 0.03, hem, lon, bend));
        O.position.copy(P); O.lookAt(Q); O.scale.setScalar(vis ? 1 : 0.0001); O.updateMatrix(); arrows.setColorAt(i, WARM.clone().lerp(COOL, seg < 2 ? 0 : 1)); arrows.setMatrixAt(i++, O.matrix); }
      arrows.instanceColor.needsUpdate = true;
      arrows.instanceMatrix.needsUpdate = true;
      ringTags.forEach(({ l, lat }) => { const wv = S.camera.position.clone().setY(0).normalize(); l.position.set(wv.x * (R * Math.cos(lat) + 0.35), R * Math.sin(lat) + 0.05, wv.z * (R * Math.cos(lat) + 0.35)); l.lookAt(S.camera.position); l.visible = t > B[2] - 0.2 || lat === 0; });
      titles.forEach((l, i2) => { const a = (i2 === 0 ? 1 : K.prog(t, B[i2], B[i2] + 0.3)) * (i2 === titles.length - 1 ? 1 : 1 - K.prog(t, B[i2 + 1] - 0.15, B[i2 + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('space', { gain: 0.05 }); k.bed('wind', { gain: 0.04 });
    k.play('hum', { t: 0.2, gain: 0.12, pitch: 0.8, dur: 2.0 }); k.play('chime', { t: 0.5, gain: 0.1, pitch: 1.0, music: true });
    k.play('riser', { t: B[1] + 0.1, gain: 0.12, pitch: 0.8, dur: 1.4 }); k.play('whoosh', { t: B[1] + 0.8, gain: 0.15, pitch: 0.7, dur: 1.4 });
    k.play('drop', { t: B[2] + 0.2, gain: 0.15, pitch: 0.7 }); k.play('whoosh', { t: B[2] + 0.4, gain: 0.12, pitch: 0.5, dur: 1.4 });
    k.play('swish', { t: B[3] + 0.2, gain: 0.18, pitch: 0.7, dur: 1.6 }); k.play('pluck', { t: B[3] + 1.0, gain: 0.1, pitch: 1.2, music: true });
    k.play('whoosh', { t: B[4] + 0.2, gain: 0.2, pitch: 0.6, dur: 2.0 }); k.play('chime', { t: B[4] + 1.5, gain: 0.15, pitch: 1.33, music: true });
  },
  post: null,
};
