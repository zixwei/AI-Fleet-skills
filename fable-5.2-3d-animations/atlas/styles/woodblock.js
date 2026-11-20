window.STYLES = window.STYLES || {};
STYLES['woodblock'] = {
  id: 'woodblock', name: 'Woodblock Print',
  family: 'Filters over 3D',
  use: 'Story',
  look: 'A Japanese-style woodblock print: flat areas of colour that darken toward the top (bokashi), black key lines, the fibre of the paper, and colour blocks printed a little out of register. Waves and clouds are repeated curls.',
  motion: 'Layers slide past each other at different speeds as the view pans. The sea rises and travels as one big shape, and curls of foam ride on its crest.',
  shownHere: 'How a tsunami forms: an earthquake lifts the sea floor, the water above rises and spreads, near the coast the wave slows down and grows tall, and it floods far inland.',
  goodFor: 'Natural events, history and folk stories told with a strong graphic style: big shapes, few colours, clear layers.',
  fonts: ['Shippori Mincho:wght@800'],
  duration: 11,
  samples: 1,
  // CONTENT
  beats: [
    { t: 0.0, label: 'An earthquake lifts the sea floor' },
    { t: 2.7, label: 'The water above rises and spreads' },
    { t: 5.4, label: 'Near the coast it slows and grows' },
    { t: 8.1, label: 'It floods far inland' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Shippori Mincho';
    scene.background = new T.Color('#efe2c4'); scene.add(S.camera);
    scene.add(new T.AmbientLight('#ffffff', 1.0));
    const flat = (c) => new T.MeshBasicMaterial({ color: c });
    // bokashi: a vertical gradient on a flat shape, darker at the top
    const grad = (top, bot) => new T.MeshBasicMaterial({ map: K.canvasTex(8, 256, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(0.45, bot); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) });
    const layer = (shapePts, mat, z) => { const s = new T.Shape(shapePts.map(([x, y]) => new T.Vector2(x, y))); const m = new T.Mesh(new T.ShapeGeometry(s, 24), mat); m.position.z = z; const uv = m.geometry.attributes.uv, p = m.geometry.attributes.position; m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox; for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) - bb.min.x) / (bb.max.x - bb.min.x), (p.getY(i) - bb.min.y) / (bb.max.y - bb.min.y)); scene.add(m); return m; };
    // sky with a band, far mountains, a sun disc
    layer([[-30, -2], [40, -2], [40, 14], [-30, 14]], grad('#7f9fb8', '#efe2c4'), -12);
    const sun = new T.Mesh(new T.CircleGeometry(1.4, 40), flat('#e05a3a')); sun.position.set(14, 5.6, -11); scene.add(sun);
    const mts = []; for (let x = -26; x < 40; x += 3.5) mts.push([x, 0.6 + 2.6 * Math.abs(Math.sin(x * 0.5)) * (0.6 + 0.4 * Math.sin(x * 0.17))]);
    layer([[-30, -1], ...mts, [40, -1]], grad('#55708a', '#a7b8c0'), -9);
    // clouds as repeated curls, on their own layer
    const curl = (r, n) => { const pts = []; for (let i = 0; i <= n * 16; i++) { const a = Math.PI * (i / 16), k = Math.floor(i / 16); pts.push([k * r * 1.6 + Math.cos(Math.PI - a) * r * 0.8 - n * r * 0.8, Math.abs(Math.sin(a)) * r * 0.9]); } pts.push([n * r * 0.8, 0]); return pts; };
    const clouds = [[-14, 4.6, 1.0, 4], [-2, 5.4, 0.8, 5], [9, 4.2, 0.9, 3], [22, 5.2, 1.0, 4], [32, 4.6, 0.8, 3]].map(([x, y, r, n]) => { const m = layer(curl(r, n), flat('#fbf4e2'), -7); m.position.set(x, y, -7); return m; });
    // the sea floor: two plates in cross-section
    const floorMat = grad('#6a4a2a', '#7a5a38');
    // the floor sits in front of the water so the cut-away shows it
    const plateA = layer([[-30, -9], [-3, -9], [-3, -3.8], [-30, -3.5]], floorMat, -0.2);
    const plateB = layer([[-3, -9], [40, -9], [40, -0.3], [11, -0.5], [9, -1.6], [6, -3.2], [-3, -3.6]], floorMat, -0.2);
    const edge = layer([[-3.4, -9], [-2.6, -9], [-2.6, -3.6], [-3.4, -3.8]], flat('#3a2210'), -0.15);
    // the coast: land, pines and a village
    const land = layer([[7, -2], [10, 0.2], [14, 0.6], [40, 0.9], [40, -9], [7, -9]], grad('#5f7a3a', '#9fae6a'), -1.0);
    const pine = (x, y, s) => { const m = layer([[-0.12, 0], [0.12, 0], [0.12, 0.4], [1.0, 0.4], [0.35, 1.3], [0.8, 1.3], [0.2, 2.2], [0.55, 2.2], [0, 3.1], [-0.55, 2.2], [-0.2, 2.2], [-0.8, 1.3], [-0.35, 1.3], [-1.0, 0.4], [-0.12, 0.4]].map(([a, b]) => [a * s, b * s]), grad('#1f3a2a', '#3f6a4a'), -0.9); m.position.set(x, y, -0.9); return m; };
    [[11, 0.4, 0.7], [16.5, 0.6, 0.9], [22, 0.75, 0.8], [27, 0.8, 0.7]].forEach(([x, y, s]) => pine(x, y, s));
    const houses = [[13, 0.5], [14.6, 0.55], [18.4, 0.65], [20, 0.7], [24.5, 0.78]].map(([x, y]) => { const g = new T.Group(); g.position.set(x, y, -0.8); scene.add(g); const w = new T.Mesh(new T.PlaneGeometry(1.2, 0.8), flat('#efe2c4')); w.position.y = 0.4; const r = new T.Mesh(new T.ShapeGeometry(new T.Shape([new T.Vector2(-0.85, 0.8), new T.Vector2(0.85, 0.8), new T.Vector2(0, 1.5)])), flat('#3a3a4a')); const d = new T.Mesh(new T.PlaneGeometry(0.3, 0.5), flat('#6a2a1a')); d.position.set(0, 0.25, 0.01); g.add(w, r, d); return g; });
    // the sea: a strip whose top edge is the surface; dark at the top (bokashi), lighter below
    const NX = 260, X0 = -30, X1 = 40;
    const seaGeo = new T.PlaneGeometry(X1 - X0, 1, NX, 1); const seaP = seaGeo.attributes.position;
    const sea = new T.Mesh(seaGeo, grad('#1f3f7a', '#6f9fc0')); sea.position.z = -0.5; scene.add(sea);
    const foamGeo = new T.BufferGeometry(); const foam = new T.Points(foamGeo, new T.PointsMaterial({ color: '#fbf4e2', size: 0.22 })); scene.add(foam);
    const crestCurls = Array.from({ length: 7 }, () => { const m = new T.Mesh(new T.RingGeometry(0.25, 0.42, 20, 1, 0, Math.PI * 1.3), flat('#fbf4e2')); m.position.z = -0.3; scene.add(m); return m; });
    const surf = (x, t) => {
      const lift = K.prog(t, 0.3, 1.4, 'out'), c = K.lerp(-3, 12, K.prog(t, B[1] + 0.2, B[3] + 1.4, 'inOut')) + (t > B[3] + 1.4 ? (t - B[3] - 1.4) * 2 : 0);
      const shore = K.clamp((x - 2) / 8), amp = lift * (1.1 + 1.9 * shore * shore * K.prog(t, B[2] - 0.5, B[2] + 1.0)), w = 3.2 - 2.0 * shore;
      let y = 0.08 * Math.sin(x * 1.3 + t * 2) + amp * Math.exp(-((x - c) ** 2) / (w * w));
      if (t > B[3] + 0.6) y += 1.3 * K.prog(t, B[3] + 0.6, B[3] + 2.2) * K.clamp((x - 8) / 3) * K.clamp((c + 3 - x) / 6 + 1);
      return y;
    };
    // labels in the style of a print cartouche
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 800, px: 72, color: '#1a1a1a', bg: '#efe2c4', radius: 2, pad: 0.35, height: 0.4 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const quake = new T.Group(); scene.add(quake);
    const look = new T.Vector3();
    return (t, realT) => {
      const cx = K.lerp(-2, 9, K.prog(t, B[1], B[3] + 1.0, 'inOut'));
      S.camera.position.set(cx, 1.0, 20); look.set(cx, 0.4, 0); S.camera.lookAt(look); S.camera.userData.look = look;
      // parallax: back layers move less with the camera
      clouds.forEach((c, i) => { c.position.x += 0; c.userData.x = c.userData.x ?? c.position.x; c.position.x = c.userData.x + cx * 0.55 + 0.3 * Math.sin(realT * 0.2 + i); });
      sun.position.x = 14 + cx * 0.8;
      // the quake: the plate edge jumps up
      const q = K.prog(t, 0.2, 0.45, 'out'), shake = (t > 0.2 && t < 1.2) ? 0.08 * Math.sin(t * 80) * (1.2 - t) : 0;
      plateB.position.y = 0.8 * q + shake; edge.position.y = 0.8 * q + shake; plateA.position.y = -0.2 * q - shake;
      // sea surface
      for (let i = 0; i <= NX; i++) { const x = X0 + i / NX * (X1 - X0); seaP.setXYZ(i, x, surf(x, t), 0); seaP.setXYZ(i + NX + 1, x, -9, 0); }
      seaP.needsUpdate = true; seaGeo.computeBoundingSphere();
      // foam dots along the crest and curls where it is highest
      const fp = []; for (let i = 0; i <= NX; i += 2) { const x = X0 + i / NX * (X1 - X0), y = surf(x, t); if (y > 0.5) fp.push(x + 0.05 * Math.sin(i * 7), y + 0.12 + 0.08 * Math.sin(i * 3 + realT * 4), -0.4); }
      foamGeo.setAttribute('position', new T.Float32BufferAttribute(fp.length ? fp : [0, -20, 0], 3));
      let best = X0, by = -9; for (let i = 0; i <= NX; i++) { const x = X0 + i / NX * (X1 - X0), y = surf(x, t); if (y > by) { by = y; best = x; } }
      crestCurls.forEach((m, i) => { m.visible = by > 1.0; m.position.set(best - 0.6 + i * 0.32, by + 0.1 - Math.abs(i - 3) * 0.12, -0.3); m.rotation.z = Math.PI * 0.4 + i * 0.1; m.scale.setScalar(0.6 + 0.12 * (3 - Math.abs(i - 3))); });
      houses.forEach((h, i) => { const under = surf(h.position.x, t) > h.position.y + 0.4; h.rotation.z = under ? -0.25 : 0; });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('water', { gain: 0.08 });
    k.play('rumble', { t: 0.2, gain: 0.7, pitch: 0.6, dur: 1.5 }); k.play('thud', { t: 0.25, gain: 0.6, pitch: 0.5 });
    k.play('whoosh', { t: B[1] + 0.2, gain: 0.25, pitch: 0.5, dur: 2.4 });
    k.play('rumble', { t: B[2] + 0.3, gain: 0.35, pitch: 0.9, dur: 2.2 }); k.play('riser', { t: B[2] + 0.6, gain: 0.15, pitch: 0.5, dur: 1.8 });
    k.play('splash', { t: B[3] + 0.6, gain: 0.6, pitch: 0.6, dur: 2.5 }); k.play('wood', { t: B[3] + 1.0, gain: 0.3, pitch: 0.6 }); k.play('wood', { t: B[3] + 1.3, gain: 0.25, pitch: 0.5 });
    k.play('wood', { t: B[3] + 2.2, gain: 0.3, pitch: 0.7, music: true });
  },
  // post pass: flat colours, black key lines, paper fibre, slight misregistration
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, off = vec2(2.5, -2.0) * px;
        vec3 fill = texture2D(tColor, uv + off).rgb;
        fill = pow(floor(pow(fill, vec3(1.0 / 2.2)) * 10.0 + 0.5) / 10.0, vec3(2.2));
        vec3 here = texture2D(tColor, uv).rgb; float e = 0.0;
        for (int i = 0; i < 4; i++) { vec2 o = (i == 0 ? vec2(1.6, 0.0) : i == 1 ? vec2(-1.6, 0.0) : i == 2 ? vec2(0.0, 1.6) : vec2(0.0, -1.6)) * px;
          vec3 q = texture2D(tColor, uv + o).rgb; e = max(e, smoothstep(0.08, 0.2, length(q - here))); }
        vec2 fc = uv * uRes; float fib = 0.5 + 0.5 * sin(fc.x * 0.05 + sin(fc.y * 0.3) * 2.0);
        vec3 paper = vec3(0.94, 0.89, 0.77);
        vec3 c = fill * (0.94 + 0.06 * fib) * (0.96 + 0.04 * h21(floor(fc / 2.0)));
        c = mix(c, vec3(0.08, 0.07, 0.08), e * 0.9);
        return vec4(c * 2.0, 1.0);
      }`,
  },
};
