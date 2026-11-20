window.STYLES = window.STYLES || {};
STYLES['layer-cake'] = {
  id: 'layer-cake', name: 'Layer Cake',
  family: 'Kitchen and home',
  use: 'Explainer',
  look: 'A tall layer cake on a white cake stand in a bright kitchen. A slice slides out and shows the layers: sponge, jam, crumb and a thin crisp top. A small flag with piped-icing writing stands in each layer.',
  motion: 'The slice slides out toward the camera. The camera moves down the cut face one layer at a time, and the flag for that layer pops up as the camera arrives.',
  shownHere: 'The layers of the Earth, from the top down: a thin crust, the thick mantle, the liquid outer core and the solid inner core, with the thickness of each. (Heights are close to scale, except the crust, which is drawn thicker.)',
  goodFor: 'Anything with levels or strata: a tech stack, an org chart, the layers of the atmosphere or of a network, a "what is under the surface" story.',
  fonts: ['Pacifico', 'Nunito:wght@800'],
  duration: 12,
  samples: 4,
  // CONTENT: layers from the top down, with height in the cake (scaled thickness) and colour
  layers: [
    { name: 'Crust', note: '5 to 70 km', h: 0.18, color: '#5a3a22', crumb: '#3a2414' },
    { name: 'Mantle', note: 'about 2,900 km', h: 1.36, color: '#b0483a', crumb: '#7a2a20' },
    { name: 'Outer core', note: 'about 2,200 km', h: 1.03, color: '#e8903a', crumb: '#b0601a' },
    { name: 'Inner core', note: 'about 1,220 km', h: 0.6, color: '#f6d36a', crumb: '#d0a840' },
  ],
  beats: [
    { t: 0.0, label: 'Cut the Earth like a cake', focus: -1 },
    { t: 2.4, label: 'The crust: a thin crisp top', focus: 0 },
    { t: 4.8, label: 'The mantle: thick, hot, slowly moving rock', focus: 1 },
    { t: 7.2, label: 'The outer core: liquid metal', focus: 2 },
    { t: 9.6, label: 'The inner core: solid metal', focus: 3 },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), FI = 'Pacifico', FT = 'Nunito', LY = this.layers, BE = this.beats;
    scene.background = new T.Color('#f2e6d8'); scene.add(S.camera);
    K.lights(S, 'studio', { size: 6, target: [0, 2, 0] });
    const std = (c, r = 0.7, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    const table = new T.Mesh(new T.PlaneGeometry(40, 40), std('#e8dcc8', 0.6)); table.rotation.x = -Math.PI / 2; table.receiveShadow = true; scene.add(table);
    const wall = new T.Mesh(new T.PlaneGeometry(40, 20), std('#f6efe4', 0.9)); wall.position.set(0, 8, -8); scene.add(wall);
    // the cake stand
    const porcelain = std('#fbfbf8', 0.25);
    const stand = new T.Group(); scene.add(stand);
    const foot = new T.Mesh(new T.CylinderGeometry(1.0, 1.2, 0.15, 48), porcelain); foot.position.y = 0.075;
    const stem = new T.Mesh(new T.CylinderGeometry(0.25, 0.35, 1.0, 32), porcelain); stem.position.y = 0.65;
    const plate = new T.Mesh(new T.CylinderGeometry(2.6, 2.4, 0.12, 64), porcelain); plate.position.y = 1.2;
    [foot, stem, plate].forEach(m => { m.castShadow = m.receiveShadow = true; stand.add(m); });
    // the cake: one cylinder per layer, a notch where the slice was; cut faces show crumb
    const R = 2.0, W = 0.36, Y0 = 1.26;
    const crumbTex = (l, i) => K.canvasTex(256, 256, (g, r, w, h) => { g.fillStyle = l.color; g.fillRect(0, 0, w, h); for (let k = 0; k < 500; k++) { g.fillStyle = r() < 0.6 ? l.crumb : 'rgba(255,255,255,0.25)'; g.beginPath(); g.arc(r() * w, r() * h, r.range(1, 4), 0, 7); g.fill(); } }, 10 + i);
    const faceMats = LY.map((l, i) => std('#ffffff', 0.9, { map: crumbTex(l, i), side: T.DoubleSide }));
    const icing = std('#fff6f0', 0.4);
    const cutFace = (th, h, mat) => { const g = new T.PlaneGeometry(R, h); g.translate(R / 2, 0, 0); const m = new T.Mesh(g, mat); m.rotation.y = th - Math.PI / 2; m.receiveShadow = true; return m; };
    const cake = new T.Group(), slice = new T.Group(); scene.add(cake, slice);
    const total = LY.reduce((s, l) => s + l.h, 0);
    let y = Y0 + total; const mids = [];
    LY.forEach((l, i) => {
      y -= l.h; const yc = y + l.h / 2; mids.push(yc);
      const outer = i === 0 ? icing : std(l.color, 0.8);
      const body = new T.Mesh(new T.CylinderGeometry(R, R, l.h, 72, 1, false, W, Math.PI * 2 - 2 * W), outer); body.position.y = yc; body.castShadow = body.receiveShadow = true; cake.add(body);
      const sl = new T.Mesh(new T.CylinderGeometry(R, R, l.h, 12, 1, false, -W, 2 * W), outer); sl.position.y = yc; sl.castShadow = sl.receiveShadow = true; slice.add(sl);
      [W, -W].forEach(th => { const a = cutFace(th, l.h, faceMats[i]); a.position.y = yc; cake.add(a); const b = cutFace(th, l.h, faceMats[i]); b.position.y = yc; slice.add(b); });
    });
    // white icing on top and a ring of piped dots
    const topY = Y0 + total;
    const capB = new T.Mesh(new T.CylinderGeometry(R + 0.04, R + 0.04, 0.12, 72, 1, false, W, Math.PI * 2 - 2 * W), icing); capB.position.y = topY + 0.04; cake.add(capB);
    const capS = new T.Mesh(new T.CylinderGeometry(R + 0.04, R + 0.04, 0.12, 12, 1, false, -W, 2 * W), icing); capS.position.y = topY + 0.04; slice.add(capS);
    for (let k = 0; k < 36; k++) { const a = k / 36 * Math.PI * 2; const d = new T.Mesh(new T.SphereGeometry(0.11, 12, 8), std('#ff9ab0', 0.4)); d.position.set(Math.sin(a) * (R - 0.15), topY + 0.14, Math.cos(a) * (R - 0.15)); d.castShadow = true; (Math.abs(((a + Math.PI) % (Math.PI * 2)) - Math.PI) < W ? slice : cake).add(d); }
    // flags: a toothpick out of the slice's cut face and a small flag with icing writing
    const nrm = new T.Vector3(Math.cos(W), 0, -Math.sin(W)), rad = new T.Vector3(Math.sin(W), 0, Math.cos(W));
    const flags = LY.map((l, i) => {
      const g = new T.Group(); slice.add(g);
      const base = rad.clone().multiplyScalar(R * 0.62).setY(mids[i]);
      g.position.copy(base);
      const pick = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.9, 6), std('#e8d0a0', 0.6)); pick.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), nrm.clone().add(new T.Vector3(0, 0.6, 0)).normalize()); pick.position.copy(nrm.clone().add(new T.Vector3(0, 0.6, 0)).normalize().multiplyScalar(0.45)); g.add(pick);
      const tag = K.label(`${l.name}\n${l.note}`, { font: FI, weight: 400, px: 56, color: '#e0507a', bg: '#ffffff', radius: 10, pad: 0.25, height: 0.26 });
      tag.position.copy(nrm.clone().add(new T.Vector3(0, 0.6, 0)).normalize().multiplyScalar(0.95)).add(nrm.clone().multiplyScalar(0.55)); g.add(tag);
      g.userData.tag = tag; return g;
    });
    const titles = BE.map(b => { const l = K.label(b.label, { font: FT, weight: 800, px: 70, color: '#4a2a1a', bg: 'rgba(255,250,242,0.9)', radius: 16, pad: 0.35, height: 0.4 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    // camera stops: overview, then down the cut face layer by layer
    const out = rad.clone().multiplyScalar(1.6);
    const stops = BE.map(b => b.focus < 0 ? { pos: new T.Vector3(5.0, 5.6, 10.2), look: new T.Vector3(0.4, 2.6, 0.6) } : { pos: new T.Vector3(6.4, mids[b.focus] + 1.3, 6.6), look: out.clone().add(rad.clone().multiplyScalar(R * 0.5)).setY(mids[b.focus] + 0.2) });
    const P = new T.Vector3(), Lk = new T.Vector3();
    return (t, realT) => {
      let k = 0; for (let i = 1; i < B.length; i++) if (t >= B[i]) k = i;
      const u = k ? K.prog(t, B[k], B[k] + 1.0, 'inOut') : 1, a = stops[Math.max(0, k - 1)], b = stops[k];
      P.lerpVectors(a.pos, b.pos, u); Lk.lerpVectors(a.look, b.look, u); P.x += 0.15 * Math.sin(realT * 0.3);
      S.camera.position.copy(P); S.camera.lookAt(Lk);
      slice.position.copy(rad).multiplyScalar(1.6 * K.prog(t, -0.4, 1.8, 'inOut'));
      flags.forEach((f, i) => { const p = K.prog(t, B[i + 1] + 0.4, B[i + 1] + 0.9, 'back') * (1 - 0.35 * K.prog(t, (B[i + 2] ?? 99), (B[i + 2] ?? 99) + 0.5)); f.scale.setScalar(Math.max(0.001, p)); f.userData.tag.lookAt(S.camera.position); });
      titles.forEach((l, i) => { const a2 = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a2 > 0.01; l.material.opacity = a2; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.05 });
    k.play('swish', { t: 0.0, gain: 0.25, pitch: 0.5, dur: 1.8 }); k.play('paper', { t: 0.3, gain: 0.15, pitch: 0.5, dur: 1.2 });
    B.slice(1).forEach((b, i) => { k.play('whoosh', { t: b + 0.05, gain: 0.15, pitch: 1.2 - i * 0.15, dur: 0.8 }); k.play('pop', { t: b + 0.5, gain: 0.3, pitch: 1.3 - i * 0.15 }); k.play('pluck', { t: b + 0.55, gain: 0.14, pitch: 1.2 - i * 0.12, music: true }); });
    k.play('chime', { t: B[4] + 1.6, gain: 0.15, pitch: 0.8, music: true });
  },
  post: null,
};
