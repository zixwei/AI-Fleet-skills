window.STYLES = window.STYLES || {};
STYLES['pencil-sketch'] = {
  id: 'pencil-sketch', name: 'Pencil Sketch',
  family: 'Filters over 3D',
  use: 'Explainer',
  look: 'A graphite drawing in a sketchbook: soft grey outlines that run a little past the corners, hatching that follows the light, the tooth of the paper, and thin construction lines that stay on the page.',
  motion: 'Each new part is drawn as a bare outline first; its shading is hatched in a moment later. The view turns slowly as if the artist walks around the subject.',
  shownHere: 'How a house frame goes up: a concrete foundation, wall frames raised on it, roof trusses set on the walls, and sheathing that closes the shape.',
  goodFor: 'Construction, design and planning stories, and anything that should feel like a first draft or an idea on paper.',
  fonts: ['Nanum Pen Script'],
  duration: 11,
  samples: 1,
  // CONTENT
  beats: [
    { t: 0.0, label: 'pour the foundation' },
    { t: 2.7, label: 'raise the wall frames' },
    { t: 5.4, label: 'set the roof trusses' },
    { t: 8.1, label: 'close it in: a house' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Nanum Pen Script';
    scene.background = new T.Color('#ffffff'); scene.add(S.camera);
    const key = new T.DirectionalLight('#ffffff', 2.2); key.position.set(-6, 9, 5); scene.add(key);
    scene.add(new T.HemisphereLight('#ffffff', '#404040', 0.5));
    const parts = []; // [mesh, appear time]
    const lumber = (w, h, d, x, y, z, t0, ry = 0) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), new T.MeshLambertMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 1 })); m.position.set(x, y, z); m.rotation.y = ry; scene.add(m); parts.push([m, t0, y]); return m; };
    // ground line and construction lines that stay
    const helper = (a, b) => { const g = new T.BufferGeometry().setFromPoints([new T.Vector3(...a), new T.Vector3(...b)]); const l = new T.Line(g, new T.LineBasicMaterial({ color: '#9a9a9a' })); scene.add(l); return l; };
    helper([-7, 0, 2.6], [7, 0, 2.6]); helper([-4.2, 0, -6], [-4.2, 0, 5]); helper([4.2, 0, -6], [4.2, 0, 5]); helper([-6, 4.6, -2.4], [6, 4.6, -2.4]); helper([0, 0, -2.4], [0, 6.5, -2.4]);
    // 1 foundation slab
    lumber(8.2, 0.4, 5.2, 0, 0.2, 0, 0.0);
    // 2 wall frames: plates and studs on four sides
    const W = 8.0, D = 5.0, H = 2.8, base = 0.4;
    const wall = (len, along, cx, cz, t0) => { const ry = along === 'x' ? 0 : Math.PI / 2; const ca = Math.cos(ry), sa = Math.sin(ry);
      lumber(len, 0.12, 0.15, cx, base + 0.06, cz, t0, ry); lumber(len, 0.12, 0.15, cx, base + H, cz, t0 + 0.6, ry);
      const n = Math.round(len / 0.6); for (let i = 0; i <= n; i++) { const o = -len / 2 + i * len / n; lumber(0.1, H - 0.12, 0.15, cx + o * ca, base + H / 2, cz - o * sa, t0 + 0.1 + i * 0.04); } };
    wall(W, 'x', 0, D / 2, B[1] + 0.1); wall(W, 'x', 0, -D / 2, B[1] + 0.4); wall(D, 'z', -W / 2, 0, B[1] + 0.7); wall(D, 'z', W / 2, 0, B[1] + 0.9);
    // 3 roof trusses: triangles along the length
    const ridge = 1.9;
    for (let i = 0; i <= 6; i++) { const x = -W / 2 + i * W / 6, t0 = B[2] + 0.1 + i * 0.22, y0 = base + H + 0.08;
      const rafter = (s) => { const a = new T.Vector3(x, y0, s * (D / 2 + 0.3)), b = new T.Vector3(x, y0 + ridge, 0), m = lumber(0.1, a.distanceTo(b), 0.12, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, t0); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.clone().sub(a).normalize()); };
      rafter(1); rafter(-1); lumber(0.1, 0.12, D + 0.2, x, y0, 0, t0 + 0.05); if (i % 2 === 0) lumber(0.08, ridge - 0.1, 0.08, x, y0 + ridge / 2, 0, t0 + 0.1); }
    lumber(W + 0.2, 0.15, 0.1, 0, base + H + ridge + 0.05, 0, B[2] + 1.6);
    // 4 sheathing panels on the walls and the roof, and a door and windows
    const panel = (w, h, x, y, z, ry, t0, rx = 0) => { const m = lumber(w, h, 0.05, x, y, z, t0, ry); m.rotation.x = rx; return m; };
    panel(W, H, 0, base + H / 2, D / 2 + 0.1, 0, B[3] + 0.1); panel(D, H, W / 2 + 0.1, base + H / 2, 0, Math.PI / 2, B[3] + 0.4);
    const roofLen = Math.hypot(D / 2 + 0.3, ridge), rp = lumber(W + 0.4, 0.06, roofLen, 0, base + H + 0.08 + ridge / 2 + 0.06, (D / 2 + 0.3) / 2, B[3] + 0.7); rp.rotation.x = Math.atan2(ridge, D / 2 + 0.3);
    const door = lumber(0.9, 1.9, 0.06, -1.6, base + 0.95, D / 2 + 0.15, B[3] + 1.0); door.material.color.set('#7a7a7a');
    [[0.8, 1.7], [2.6, 1.7]].forEach(([x, y]) => { const w = lumber(0.9, 0.8, 0.06, x, base + y, D / 2 + 0.15, B[3] + 1.1); w.material.color.set('#5a5a5a'); });
    // a crane-like sketch note: handwritten labels
    const notes = this.beats.map((b, i) => { const l = K.label(b.label, { font: F, weight: 400, px: 110, color: '#000000', height: 0.7 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(-1.9 + l.userData.w / 2 * 0, 1.74, -8); S.camera.add(l); return l; });
    notes.forEach(l => { l.position.x = -3.6 + l.userData.w / 2; });
    const look = new T.Vector3(0, 1.6, 0);
    return (t, realT) => {
      const a = -0.75 + t * 0.055, r = 15.5 + 2.5 * K.prog(t, 5, 11, 'inOut');
      S.camera.position.set(Math.sin(a) * r, 7.0 - 0.1 * t, Math.cos(a) * r); S.camera.lookAt(look); S.camera.userData.look = look;
      parts.forEach(([m, t0, y]) => { const p = K.prog(t, t0, t0 + 0.25, 'out'); m.visible = t >= t0; m.position.y = y + (1 - p) * 0.4; m.material.emissiveIntensity = 1 - K.prog(t, t0 + 0.35, t0 + 1.1); });
      notes.forEach((l, i) => { const o = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.4)) * (i === notes.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = o > 0.01; l.material.opacity = o; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.05 });
    for (let i = 0; i < 44; i++) k.play('paper', { t: 0.1 + i * 0.24, gain: 0.07, pitch: 2.2 + (i % 5) * 0.15, dur: 0.4 });
    [0.1, B[1] + 0.1, B[2] + 0.1, B[3] + 0.1].forEach((b, i) => k.play('wood', { t: b + 0.25, gain: 0.25, pitch: 0.8 + i * 0.1 }));
    for (let i = 0; i < 7; i++) k.play('wood', { t: B[2] + 0.35 + i * 0.22, gain: 0.12, pitch: 1.2 });
    k.play('chime', { t: B[3] + 1.5, gain: 0.18, pitch: 1.0, music: true });
  },
  // post pass: paper, pencil outlines from depth and normal edges, hatching by brightness
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
      float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
      float edgeAt(vec2 uv, vec2 px){
        float d = linDepth(uv); vec3 n = texture2D(tNormal, uv).rgb * 2.0 - 1.0; float e = 0.0;
        for (int i = 0; i < 4; i++) { vec2 o = i == 0 ? vec2(px.x, 0.0) : i == 1 ? vec2(-px.x, 0.0) : i == 2 ? vec2(0.0, px.y) : vec2(0.0, -px.y);
          e = max(e, max(smoothstep(0.015, 0.04, abs(linDepth(uv + o) - d) / d), smoothstep(0.15, 0.4, 1.0 - dot(n, texture2D(tNormal, uv + o).rgb * 2.0 - 1.0)))); }
        return e;
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.3 / uRes, fc = uv * uRes;
        vec3 paper = vec3(0.965, 0.95, 0.915) * (0.95 + 0.05 * h21(floor(fc / 2.0)));
        vec3 sc = texture2D(tColor, uv).rgb; float L = lum(sc);
        float wob = sin(fc.y * 0.03) * 1.5;
        float h1 = smoothstep(0.85, 0.6, L) * step(fract((fc.x + fc.y + wob) / 9.0), 0.22);
        float h2 = smoothstep(0.5, 0.32, L) * step(fract((fc.x - fc.y - wob) / 8.0), 0.2);
        float h3 = smoothstep(0.28, 0.15, L) * step(fract((fc.y + wob * 0.5) / 6.0), 0.25);
        float e = max(edgeAt(uv, px * 1.4), 0.7 * edgeAt(uv + vec2(px.x * 3.0, 0.0), px));
        float g = clamp(max(max(h1 * 0.55, h2 * 0.7), h3 * 0.8) + e * 0.85, 0.0, 1.0) * (0.85 + 0.15 * h21(floor(fc / 1.5)));
        g = max(g, smoothstep(0.06, 0.01, L) * 0.95);
        vec3 c = mix(paper * 2.2, vec3(0.04, 0.04, 0.05), g); // the kit tone-maps after this: paper must be bright to stay white
        return vec4(c, 1.0);
      }`,
  },
};
