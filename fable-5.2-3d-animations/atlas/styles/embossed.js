window.STYLES = window.STYLES || {};
STYLES['embossed'] = {
  id: 'embossed', name: 'Embossed Paper',
  family: 'Flat content made physical',
  use: 'Title',
  look: 'Words pressed deep into thick cotton paper, seen through a macro lens with shallow focus. A low raking light catches the walls of every letter and leaves soft shadows inside them.',
  motion: 'A heavy steel press comes down on each word and lifts away; the word is left in the paper. The camera glides along the line, and the light sweeps across it at the end.',
  shownHere: 'A three-word company value, BUILD WITH CARE, pressed one word at a time.',
  goodFor: 'Values, mottos, names and short headlines that should feel permanent and made by hand.',
  fonts: ['DM Serif Display'],
  duration: 9,
  samples: 8,
  dof: { aperture: 0.03 },
  // CONTENT
  beats: [
    { t: 0.0, label: 'BUILD' },
    { t: 2.1, label: 'WITH' },
    { t: 4.2, label: 'CARE' },
    { t: 6.3, label: 'BUILD WITH CARE' },
  ],
  words: ['BUILD', 'WITH', 'CARE'],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'DM Serif Display';
    scene.background = new T.Color('#1a1714'); scene.add(S.camera);
    S.camera.fov = 24; S.camera.updateProjectionMatrix();
    const amb = new T.HemisphereLight('#fff6ea', '#3a3028', 0.9); scene.add(amb);
    const rake = new T.DirectionalLight('#fff0dc', 3.2); rake.castShadow = true; rake.shadow.mapSize.set(4096, 4096);
    Object.assign(rake.shadow.camera, { left: -7, right: 7, top: 4, bottom: -4, near: 0.5, far: 40 }); rake.shadow.camera.updateProjectionMatrix(); rake.shadow.bias = -0.0002; rake.shadow.normalBias = 0.0;
    scene.add(rake, rake.target);
    // mask: each word in its own colour channel, blurred so the walls slope
    const MW = 2048, MH = 768, PW = 13, PH = PW * MH / MW;
    const xs = [0.2, 0.5, 0.79];
    const mask = K.canvasTex(MW, MH, (g, r, w, h) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'lighter'; g.filter = 'blur(3px)';
      g.font = `400 210px "${F}"`; g.textAlign = 'center'; g.textBaseline = 'middle';
      this.words.forEach((wd, i) => { g.fillStyle = ['#ff0000', '#00ff00', '#0000ff'][i]; g.fillText(wd, xs[i] * w, h / 2 + 10); });
    });
    mask.colorSpace = T.NoColorSpace; mask.anisotropy = 1;
    const paperTex = K.canvasTex(1024, 512, (g, r, w, h) => { g.fillStyle = '#f1ebdf'; g.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? 120 : 255},${r() < 0.5 ? 100 : 250},${r() < 0.5 ? 80 : 240},${r.range(0.03, 0.09)})`; const x = r() * w, y = r() * h, a = r() * 6.28, l = r.range(2, 9); g.fillRect(x, y, Math.cos(a) * l + 1, Math.sin(a) * l + 1); } }, 4);
    const U = { uP: { value: new T.Vector3() }, uDepth: { value: 0.07 }, uTexel: { value: new T.Vector2(1.5 / MW, 1.5 / MH) }, uWorld: { value: new T.Vector2(1.5 * PW / MW, 1.5 * PH / MH) } };
    const head = 'uniform vec3 uP; uniform float uDepth; uniform vec2 uTexel, uWorld;\nfloat hgt(vec2 uv){ return -dot(texture2D(displacementMap, uv).rgb, uP) * uDepth; }\n';
    const patch = (sh, normals) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace('#include <displacementmap_pars_vertex>', '#include <displacementmap_pars_vertex>' + String.fromCharCode(10) + head);
      if (normals) sh.vertexShader = sh.vertexShader.replace('#include <beginnormal_vertex>', 'float h0 = hgt(vDisplacementMapUv), hx = hgt(vDisplacementMapUv + vec2(uTexel.x, 0.0)), hy = hgt(vDisplacementMapUv + vec2(0.0, uTexel.y));\nvec3 objectNormal = normalize(vec3(-(hx - h0) / uWorld.x, -(hy - h0) / uWorld.y, 1.0));');
      sh.vertexShader = sh.vertexShader.replace('#include <displacementmap_vertex>', 'transformed.z += hgt(vDisplacementMapUv);');
    };
    const paperMat = new T.MeshStandardMaterial({ map: paperTex, roughness: 0.92, displacementMap: mask, displacementScale: 0 });
    paperMat.onBeforeCompile = sh => patch(sh, true);
    const depthMat = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, displacementMap: mask, displacementScale: 0 }); depthMat.onBeforeCompile = sh => patch(sh, false);
    const paper = new T.Mesh(new T.PlaneGeometry(PW, PH, 640, 240), paperMat); paper.customDepthMaterial = depthMat;
    paper.rotation.x = -Math.PI / 2; paper.position.y = 0.12; paper.receiveShadow = true; paper.castShadow = true; scene.add(paper);
    // the sheet sits on a dark wood table with a deckle edge shadow
    const table = new T.Mesh(new T.PlaneGeometry(60, 40), new T.MeshStandardMaterial({ color: '#2a211a', roughness: 0.7 })); table.rotation.x = -Math.PI / 2; table.position.y = -0.02; table.receiveShadow = true; scene.add(table);
    // the press: a heavy steel block over each word
    const steel = new T.MeshStandardMaterial({ color: '#4a4d52', metalness: 0.9, roughness: 0.35 });
    const presses = xs.map((x, i) => { const g = new T.Group(); const blk = new T.Mesh(new T.BoxGeometry(PW * (i === 1 ? 0.22 : 0.27), 0.8, PH * 0.55), steel); blk.position.y = 0.4; blk.castShadow = true; g.add(blk);
      const rod = new T.Mesh(new T.CylinderGeometry(0.18, 0.18, 6, 16), steel); rod.position.y = 3.8; g.add(rod); g.position.set((x - 0.5) * PW, 4, 0); scene.add(g); return g; });
    // a pencil and a few cuttings for scale
    const pencil = new T.Group(); const pb = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, 4, 6), new T.MeshStandardMaterial({ color: '#2e5a3f', roughness: 0.5 })); pb.rotation.z = Math.PI / 2; pencil.add(pb);
    const tip = new T.Mesh(new T.ConeGeometry(0.09, 0.4, 6), new T.MeshStandardMaterial({ color: '#d9b58a' })); tip.rotation.z = -Math.PI / 2; tip.position.x = 2.2; pencil.add(tip); pencil.position.set(1.5, 0.09, 3.3); pencil.rotation.y = 0.15; pencil.traverse(o => { o.castShadow = true; }); scene.add(pencil);
    const pressT = i => (i === 0 ? 0.4 : B[i] + 0.25);
    const look = new T.Vector3();
    return (t, realT) => {
      // camera: low, sliding along the word that is being pressed, then pulling back over the whole line
      const idx = t < B[1] ? 0 : t < B[2] ? 1 : 2, endP = K.prog(t, B[3], B[3] + 1.6, 'inOut');
      const fx = K.lerp((xs[idx] - 0.5) * PW, 0, endP), slide = 0.25 * Math.sin(t * 0.4);
      S.camera.position.set(fx - 1.6 * (1 - endP) + slide * (1 - endP), K.lerp(3.6, 7.6, endP), K.lerp(7.4, 13.6, endP));
      look.set(fx + (0.3 + slide) * (1 - endP), 0.3, 0); S.camera.lookAt(look); S.camera.userData.look = look;
      // presses: down hard, hold, lift
      const p = [0, 1, 2].map(i => { const t0 = pressT(i); const down = K.prog(t, t0, t0 + 0.28, 'in'), up = K.prog(t, t0 + 0.55, t0 + 1.25, 'inOut'); presses[i].position.y = 0.02 + 1.6 * (1 - down) + 5 * up; presses[i].visible = up < 1; return down >= 1 ? 1 : 0; });
      U.uP.value.set(p[0], p[1], p[2]);
      // raking light: low from the left, sweeps at the end
      const sw = K.prog(t, B[3] + 0.3, 9, 'inOut');
      rake.position.set(K.lerp(-9, -7, sw), K.lerp(5.0, 2.6, sw), K.lerp(3.0, -2.5, sw)); rake.target.position.set(fx * 0.5, 0, 0); rake.target.updateMatrixWorld();
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.06 });
    [0.4, B[1] + 0.25, B[2] + 0.25].forEach((t0, i) => { k.play('whoosh', { t: t0 - 0.15, gain: 0.15, pitch: 0.6, dur: 0.4 }); k.play('thud', { t: t0 + 0.28, gain: 0.7, pitch: 0.7 + i * 0.05 }); k.play('paper', { t: t0 + 0.3, gain: 0.3, pitch: 0.5 }); k.play('metal', { t: t0 + 0.3, gain: 0.1, pitch: 0.5 }); });
    k.play('swish', { t: B[3] + 0.3, gain: 0.2, pitch: 0.7, dur: 2.0 });
    k.play('chime', { t: B[3] + 0.6, gain: 0.2, pitch: 0.9, music: true });
  },
  post: null,
};
