window.STYLES = window.STYLES || {};
STYLES['ink-toon'] = {
  id: 'ink-toon', name: 'Ink and Toon',
  family: 'Filters over 3D',
  use: 'Explainer',
  look: 'Like an inked animation cel: flat colour in two tones, a black brush outline on every edge, and halftone dots where light turns to shadow. Bold, saturated colours and comic caption boxes.',
  motion: 'Bold bounce motion: things drop in, squash and spring back; impact stars burst when something lands. Pours and steam are big, simple shapes.',
  shownHere: 'How to brew pour-over coffee: rinse the paper filter, add 15 g of ground coffee, pour 250 g of hot water in slow circles, wait about three minutes, and drink.',
  goodFor: 'Recipes, how-tos and product demos with personality: everyday steps told with energy and humour.',
  fonts: ['Bangers', 'Comic Neue:wght@700'],
  duration: 11,
  samples: 1,
  // CONTENT
  beats: [
    { t: 0.0, label: '1. Rinse the filter' },
    { t: 2.7, label: '2. Add 15 g of ground coffee' },
    { t: 5.4, label: '3. Pour 250 g of water in circles' },
    { t: 8.1, label: '4. Wait 3 minutes. Enjoy!' },
  ],
  readouts: ['0 g', '15 g', '265 g', '3:00'],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Bangers', F2 = 'Comic Neue';
    scene.background = new T.Color('#ffe9a8'); scene.add(S.camera);
    const ramp = new T.DataTexture(new Uint8Array([90, 90, 90, 255, 255, 255, 255, 255]), 2, 1); ramp.minFilter = ramp.magFilter = T.NearestFilter; ramp.needsUpdate = true; S.own(ramp);
    const toon = c => new T.MeshToonMaterial({ color: c, gradientMap: ramp });
    const key = new T.DirectionalLight('#ffffff', 2.6); key.position.set(-4, 7, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); key.shadow.camera.updateProjectionMatrix(); scene.add(key);
    scene.add(new T.AmbientLight('#ffffff', 0.9));
    // counter and backdrop
    const counter = new T.Mesh(new T.BoxGeometry(16, 0.6, 7), toon('#3fb6a8')); counter.position.y = -0.3; counter.receiveShadow = true; scene.add(counter);
    const wall = new T.Mesh(new T.PlaneGeometry(30, 14), toon('#ffcf5a')); wall.position.set(0, 5, -3.6); scene.add(wall);
    // mug, dripper, filter, scale, kettle
    const scale = new T.Mesh(new T.BoxGeometry(2.6, 0.25, 2.4), toon('#2a2a33')); scale.position.set(0, 0.12, 0.3); scale.castShadow = true; scene.add(scale);
    const readTex = this.readouts.map(r => K.canvasTex(256, 96, g => { g.fillStyle = '#b9f2c8'; g.fillRect(0, 0, 256, 96); g.fillStyle = '#123'; g.font = `700 64px "${F2}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(r, 128, 52); }));
    const display = new T.Mesh(new T.PlaneGeometry(1.0, 0.36), new T.MeshBasicMaterial({ map: readTex[0] })); display.rotation.x = -Math.PI / 2 + 0.5; display.position.set(0, 0.3, 1.38); scene.add(display);
    const mug = new T.Group(); mug.position.set(0, 0.25, 0.3); scene.add(mug);
    const mugBody = new T.Mesh(new T.CylinderGeometry(0.8, 0.7, 1.4, 32, 1, true), toon('#ff5a4a')); mugBody.material.side = T.DoubleSide; mugBody.position.y = 0.7; mug.add(mugBody);
    const mugBase = new T.Mesh(new T.CylinderGeometry(0.7, 0.7, 0.08, 32), toon('#ff5a4a')); mugBase.position.y = 0.04; mug.add(mugBase);
    const handle = new T.Mesh(new T.TorusGeometry(0.35, 0.1, 10, 24, Math.PI * 1.3), toon('#ff5a4a')); handle.position.set(0.85, 0.7, 0); handle.rotation.z = -Math.PI * 0.65; mug.add(handle);
    const brew = new T.Mesh(new T.CylinderGeometry(0.74, 0.74, 1, 32), toon('#6a3a1a')); brew.position.y = 0.1; brew.scale.y = 0.01; mug.add(brew);
    const dripper = new T.Group(); dripper.position.set(0, 1.65, 0.3); scene.add(dripper);
    const cone = new T.Mesh(new T.CylinderGeometry(1.05, 0.35, 1.1, 32, 1, true), toon('#f4f0e8')); cone.material.side = T.DoubleSide; cone.position.y = 0.55; dripper.add(cone);
    const flange = new T.Mesh(new T.CylinderGeometry(0.95, 0.95, 0.08, 32), toon('#f4f0e8')); dripper.add(flange);
    const filter = new T.Mesh(new T.CylinderGeometry(0.98, 0.32, 1.0, 16, 1, true), toon('#fff8e8')); filter.material.side = T.DoubleSide; filter.position.y = 0.6; dripper.add(filter);
    const grounds = new T.Mesh(new T.CylinderGeometry(0.75, 0.38, 0.5, 24), toon('#5a3018')); grounds.position.y = 0.3; dripper.add(grounds);
    const bloom = Array.from({ length: 12 }, (_, i) => { const b = new T.Mesh(new T.SphereGeometry(0.08, 10, 8), toon('#c8935a')); b.position.set(0.45 * Math.cos(i * 0.52), 0.6, 0.45 * Math.sin(i * 0.52)); dripper.add(b); return b; });
    const kettle = new T.Group(); scene.add(kettle);
    const kb = new T.Mesh(new T.CylinderGeometry(0.75, 0.95, 1.3, 32), toon('#2a2a33')); kb.position.y = 0.65; kettle.add(kb);
    const lid = new T.Mesh(new T.SphereGeometry(0.75, 24, 12, 0, 6.28, 0, 1.2), toon('#2a2a33')); lid.position.y = 1.3; kettle.add(lid);
    const knob = new T.Mesh(new T.SphereGeometry(0.12, 12, 8), toon('#ffb43a')); knob.position.y = 2.0; kettle.add(knob);
    const spout = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(-0.8, 0.3, 0), new T.Vector3(-1.4, 0.6, 0), new T.Vector3(-1.6, 1.5, 0), new T.Vector3(-2.1, 1.7, 0)]), 30, 0.08, 8), toon('#2a2a33')); kettle.add(spout);
    const kh = new T.Mesh(new T.TorusGeometry(0.5, 0.1, 10, 24, Math.PI), toon('#ffb43a')); kh.position.set(0.85, 0.8, 0); kh.rotation.z = -Math.PI / 2; kettle.add(kh);
    kettle.traverse(o => { o.castShadow = true; });
    const stream = new T.Mesh(new T.CylinderGeometry(0.06, 0.08, 1, 10), toon('#9fe0ff')); scene.add(stream);
    const drip = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 0.9, 8), toon('#8a4a1a')); drip.position.set(0, 1.4, 0.3); scene.add(drip);
    // a bag of coffee and a scoop
    const bag = new T.Mesh(new T.BoxGeometry(1.1, 1.8, 0.7), toon('#8a5a3a')); bag.position.set(-3.6, 0.9, -0.6); bag.rotation.y = 0.3; bag.castShadow = true; scene.add(bag);
    const bagLabel = K.label('BEANS', { font: F, weight: 400, px: 80, color: '#fff3d6', height: 0.32 }); bagLabel.position.set(-3.44, 1.1, -0.27); bagLabel.rotation.y = 0.3; scene.add(bagLabel);
    const scoop = new T.Group(); const sc1 = new T.Mesh(new T.SphereGeometry(0.3, 16, 8, 0, 6.28, 0, 1.6), toon('#ffb43a')); sc1.material.side = T.DoubleSide; sc1.rotation.x = Math.PI; const sc2 = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 1, 8), toon('#ffb43a')); sc2.rotation.z = Math.PI / 2; sc2.position.x = 0.7; scoop.add(sc1, sc2); scene.add(scoop);
    const scoopFill = new T.Mesh(new T.SphereGeometry(0.26, 12, 8, 0, 6.28, 0, 1.4), toon('#5a3018')); scoopFill.position.y = 0.05; scoop.add(scoopFill);
    // impact stars and steam
    const starShape = new T.Shape(); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, r = i % 2 ? 0.25 : 0.6; i ? starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : starShape.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    const stars = [0, 1, 2].map(i => { const m = new T.Mesh(new T.ShapeGeometry(starShape), new T.MeshBasicMaterial({ color: ['#ffffff', '#ffe23a', '#ff8a3a'][i] })); scene.add(m); return m; });
    const steam = [0, 1, 2].map(i => { const m = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(Array.from({ length: 7 }, (_, k) => new T.Vector3(0.18 * Math.sin(k + i * 2), k * 0.22, 0))), 30, 0.07, 8), toon('#ffffff')); m.position.set(-0.3 + i * 0.3, 1.5, 0.3); scene.add(m); return m; });
    // caption boxes
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 400, px: 96, color: '#1a1a1a', bg: '#fff3a0', radius: 4, pad: 0.35, height: 0.42 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(-2.6 + l.userData.w / 2 * 0, 1.7, -8); S.camera.add(l); return l; });
    titles.forEach(l => { l.position.x = -3.6 + l.userData.w / 2; });
    const cam = K.camPath([
      { t: 0, pos: [1.6, 3.6, 9.8], look: [0.4, 1.7, 0] },
      { t: 5.4, pos: [-1.0, 4.0, 9.6], look: [0.2, 1.8, 0] },
      { t: 11, pos: [1.0, 3.2, 8.8], look: [0.2, 1.5, 0.2] },
    ], S.camera);
    return (t, realT) => {
      cam(t);
      // kettle: pours in beats 1 and 3
      const pour1 = K.prog(t, 0.2, 0.6, 'out') * (1 - K.prog(t, 1.9, 2.3)), pour3 = K.prog(t, B[2], B[2] + 0.4, 'out') * (1 - K.prog(t, B[3] - 0.4, B[3]));
      const pour = Math.max(pour1, pour3), circle = pour3 > 0.5 ? 0.35 : 0;
      kettle.position.set(2.5 + circle * Math.cos(realT * 4), 1.7 + 0.5 * pour, 0.3 + circle * Math.sin(realT * 4)); kettle.rotation.z = 0.55 * pour;
      kettle.updateMatrixWorld(); const tipW = new T.Vector3(-2.1, 1.7, 0).applyMatrix4(kettle.matrixWorld);
      stream.visible = pour > 0.6; const sy = (tipW.y + 2.4) / 2; stream.position.set(tipW.x, sy, tipW.z); stream.scale.y = Math.max(0.01, tipW.y - 2.3);
      drip.visible = pour1 > 0.5 || (t > B[2] + 0.5 && t < B[3] + 1.5); drip.scale.y = 0.9 + 0.1 * Math.sin(realT * 20);
      brew.scale.y = Math.max(0.01, 0.08 * K.prog(t, 0.6, 2.0) + 1.0 * K.prog(t, B[2] + 0.6, B[3] + 1.0)); brew.position.y = 0.1 + brew.scale.y / 2;
      // grounds: the scoop drops them in with a bounce
      const sc = K.prog(t, B[1] + 0.1, B[1] + 0.8, 'inOut') * (1 - K.prog(t, B[1] + 1.3, B[1] + 1.9, 'inOut'));
      scoop.position.set(K.lerp(-3.0, -0.6, sc), K.lerp(1.0, 3.2, sc), 0.3); scoop.rotation.z = K.lerp(0, 2.2, K.prog(t, B[1] + 0.8, B[1] + 1.1)); scoopFill.visible = t < B[1] + 1.0; scoop.visible = t > B[1] && t < B[1] + 2.0;
      const g = K.prog(t, B[1] + 0.95, B[1] + 1.35, 'bounce'); grounds.scale.set(1, Math.max(0.01, g), 1); grounds.visible = g > 0;
      bloom.forEach((b, i) => { const bl = K.prog(t, B[2] + 0.3 + i * 0.05, B[2] + 0.8 + i * 0.05, 'back') * (1 - K.prog(t, B[3], B[3] + 0.6)); b.scale.setScalar(Math.max(0.001, bl * (1 + 0.2 * Math.sin(realT * 8 + i)))); b.visible = bl > 0; });
      const rd = t < B[1] + 1.0 ? 0 : t < B[2] + 0.4 ? 1 : t < B[3] ? 2 : 3; display.material.map = readTex[rd];
      // impact stars when the grounds land and when it is ready
      const hits = [B[1] + 1.2, B[3] + 1.6];
      stars.forEach((s, i) => { let a = 0; hits.forEach(h => { a = Math.max(a, K.prog(t, h, h + 0.15) * (1 - K.prog(t, h + 0.45, h + 0.7))); }); s.visible = a > 0; s.scale.setScalar(0.6 + a * (0.6 + i * 0.25)); s.position.set([-1.6, 1.5, 0.2][i], 2.6 + i * 0.5, 1.2); s.rotation.z = realT * (i % 2 ? 2 : -2); s.lookAt(S.camera.position); });
      steam.forEach((m, i) => { m.visible = t > B[3] + 0.8; m.position.y = 1.5 + ((realT * 0.4 + i * 0.3) % 0.6); });
      dripper.position.y = 1.65 + 3 * K.prog(t, B[3] + 0.3, B[3] + 0.9, 'inOut'); dripper.position.x = -2.5 * K.prog(t, B[3] + 0.3, B[3] + 0.9, 'inOut'); drip.visible = drip.visible && t < B[3] + 0.3;
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.2, 'back')) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.1, B[i + 1])); l.visible = a > 0.01; l.scale.setScalar(Math.max(0.001, Math.min(1.1, a))); });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.05 });
    k.play('splash', { t: 0.6, gain: 0.25, pitch: 1.4, dur: 1.4 });
    k.play('swish', { t: B[1] + 0.2, gain: 0.25, pitch: 1.2, dur: 0.6 });
    k.play('thud', { t: B[1] + 1.2, gain: 0.5, pitch: 1.2 }); k.play('pop', { t: B[1] + 1.22, gain: 0.4, pitch: 1.5 });
    k.play('splash', { t: B[2] + 0.4, gain: 0.3, pitch: 1.2, dur: 2.0 });
    for (let i = 0; i < 8; i++) k.play('bubble', { t: B[2] + 0.4 + i * 0.25, gain: 0.15, pitch: 0.8 + (i % 4) * 0.15 });
    k.play('bell', { t: B[3] + 1.6, gain: 0.3, pitch: 1.5, music: true }); k.play('pop', { t: B[3] + 1.6, gain: 0.3, pitch: 1.8 });
    k.play('whoosh', { t: B[3] + 0.3, gain: 0.2, pitch: 1.6, dur: 0.6 });
  },
  // post pass: ink outlines from depth and normal edges, halftone dots in the shadow side
  post: {
    normals: true,
    fragment: `
      float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.6 / uRes;
        vec3 c = texture2D(tColor, uv).rgb;
        float d = linDepth(uv);
        vec3 n = texture2D(tNormal, uv).rgb;
        float e = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = i == 0 ? vec2(px.x, 0.0) : i == 1 ? vec2(-px.x, 0.0) : i == 2 ? vec2(0.0, px.y) : vec2(0.0, -px.y);
          float dd = abs(linDepth(uv + o) - d) / d;
          float nn = 1.0 - dot(n * 2.0 - 1.0, texture2D(tNormal, uv + o).rgb * 2.0 - 1.0);
          e = max(e, max(smoothstep(0.02, 0.05, dd), smoothstep(0.2, 0.5, nn)));
        }
        float L = lum(c);
        vec2 p = uv * uRes / 7.0; p = vec2(p.x + p.y, p.x - p.y) * 0.7071;
        float r = length(fract(p) - 0.5);
        float dots = (L < 0.45 && L > 0.08) ? smoothstep(0.32, 0.28, r) * 0.45 : 0.0;
        c *= 1.0 - dots;
        c = mix(c, vec3(0.05, 0.04, 0.06), e);
        return vec4(c, 1.0);
      }`,
  },
};
