window.STYLES = window.STYLES || {};
STYLES['low-poly'] = {
  id: 'low-poly', name: 'Low-Poly',
  family: 'Filters over 3D',
  use: 'Explainer',
  look: 'A small world of flat facets on a hexagonal tile: every triangle has one tone, and neighbours differ a little, in a short palette of sand, coral, cream, teal and sage. Warm sun from one side, soft shadows, a pale sky.',
  motion: 'Things pop up from the ground or gather facet by facet with a small overshoot. Paper flags on poles spring up to name each step, and the camera drifts slowly around the tile.',
  shownHere: 'The water cycle: vapour rises from the sea, gathers into clouds over the mountain, falls as rain, and runs back to the sea in a river.',
  goodFor: 'A cycle or a process that happens in one place: one landscape, one numbered flag for each step, and a moving thing (vapour, a vehicle, a signal) that links the steps.',
  fonts: ['Oswald:wght@600'],
  duration: 10,
  samples: 8,
  // CONTENT: words, numbers and beat times.
  beats: [
    { t: 0.0, label: 'EVAPORATION' },
    { t: 2.5, label: 'CONDENSATION' },
    { t: 5.0, label: 'PRECIPITATION' },
    { t: 7.5, label: 'COLLECTION' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, rng = K.rng(7), B = this.beats.map(b => b.t);
    const C = { sand: '#e8d3a0', sage: '#8fb37c', sage2: '#6f9a68', rock: '#b08a70', snow: '#f6f1e3', coral: '#e07a5f',
      soil: '#a86b4e', soil2: '#7d4e3a', teal: '#3fa7a3', sky: '#f3e9d6', cloud: '#fbf8f1', rain: '#7fc4d6' };
    scene.background = K.canvasTex(16, 256, (g, r, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#9fd3cf'); gr.addColorStop(0.55, '#f1e6cf'); gr.addColorStop(1, '#f6dcc0');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    scene.fog = new T.Fog(C.sky, 28, 80);
    const L = K.lights(S, 'sun', { size: 9, target: [0, 1, 0] });
    L.key.position.set(-9, 12, 6);

    // --- terrain: a height field clamped to a hexagon (vertex on +z, like CylinderGeometry with 6 sides)
    const R = 6, APO = R * Math.cos(Math.PI / 6);
    const clampHex = (x, z) => {
      let d = 0;
      for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; d = Math.max(d, x * Math.sin(a) + z * Math.cos(a)); }
      return d > APO ? [x * APO / d, z * APO / d] : [x, z];
    };
    const gauss = (x, z, cx, cz, s) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (s * s));
    const RIVER = [[-2.3, -2.0], [-1.4, -0.9], [-0.3, -0.5], [0.6, 0.4], [1.4, 1.4], [2.4, 2.3]];
    const segDist = (x, z) => {
      let best = 1e9;
      for (let i = 0; i < RIVER.length - 1; i++) {
        const [ax, az] = RIVER[i], [bx, bz] = RIVER[i + 1], dx = bx - ax, dz = bz - az;
        const u = K.clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz));
        best = Math.min(best, Math.hypot(x - ax - u * dx, z - az - u * dz));
      }
      return best;
    };
    const land = (x, z) => K.ease.inOut(K.clamp((-(x + z) * 0.55 + 1.6) / 2.2));
    const height = (x, z) => {
      let h = -0.75 + 1.25 * land(x, z) + 3.6 * gauss(x, z, -2.7, -2.5, 1.7) + 1.7 * gauss(x, z, -0.4, -3.5, 1.2) + 1.3 * gauss(x, z, -3.7, 0.3, 1.3);
      h -= 0.55 * Math.exp(-(segDist(x, z) ** 2) / 0.12) * land(x, z);
      return Math.max(h, -0.75);
    };
    const SEG = 44, geo = new T.PlaneGeometry(2 * R, 2 * R, SEG, SEG).rotateX(-Math.PI / 2);
    const pa = geo.attributes.position, jit = K.rng(3);
    for (let i = 0; i < pa.count; i++) {
      const [x, z] = clampHex(pa.getX(i) + jit.range(-0.08, 0.08), pa.getZ(i) + jit.range(-0.08, 0.08));
      const h = height(x, z);
      pa.setXYZ(i, x, h + (h > 0.05 ? jit.range(-0.07, 0.07) : 0), z);
    }
    const terr = geo.toNonIndexed(); terr.computeVertexNormals();
    const tp = terr.attributes.position, cols = [], col = new T.Color(), fr = K.rng(11);
    for (let f = 0; f < tp.count; f += 3) {
      const y = (tp.getY(f) + tp.getY(f + 1) + tp.getY(f + 2)) / 3;
      const x = (tp.getX(f) + tp.getX(f + 1) + tp.getX(f + 2)) / 3, z = (tp.getZ(f) + tp.getZ(f + 1) + tp.getZ(f + 2)) / 3;
      const riverbed = segDist(x, z) < 0.3 && y > -0.4;
      col.set(riverbed ? C.sand : y < 0.12 ? C.sand : y < 1.2 ? (fr() < 0.5 ? C.sage : C.sage2) : y < 2.7 ? C.rock : C.snow);
      col.offsetHSL(fr.range(-0.012, 0.012), 0, fr.range(-0.045, 0.045));
      for (let k = 0; k < 3; k++) cols.push(col.r, col.g, col.b);
    }
    terr.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
    const ground = new T.Mesh(terr, new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }));
    ground.castShadow = ground.receiveShadow = true; scene.add(ground);

    // --- tile walls: soil layers cut at the hex edge
    const BOT = -1.9, wall = [], wcol = [], N = 26;
    const hexV = k => [R * Math.sin(k * Math.PI / 3), R * Math.cos(k * Math.PI / 3)];
    for (let k = 0; k < 6; k++) {
      const [ax, az] = hexV(k), [bx, bz] = hexV(k + 1);
      for (let i = 0; i < N; i++) {
        const p = (u) => [K.lerp(ax, bx, u), K.lerp(az, bz, u)];
        const [x0, z0] = p(i / N), [x1, z1] = p((i + 1) / N);
        const y0 = height(x0, z0), y1 = height(x1, z1);
        const bands = [[BOT, -1.2, C.soil2], [-1.2, Math.min(y0, y1) - 0.35, C.soil], [Math.min(y0, y1) - 0.35, null, C.coral]];
        for (const [lo, hi, c] of bands) {
          const top0 = hi === null ? y0 : Math.max(lo, hi), top1 = hi === null ? y1 : Math.max(lo, hi);
          if (top0 <= lo && top1 <= lo) continue;
          wall.push(x0, lo, z0, x1, lo, z1, x1, top1, z1, x0, lo, z0, x1, top1, z1, x0, top0, z0);
          col.set(c).offsetHSL(0, 0, ((i * 7 + k * 3) % 5 - 2) * 0.012);
          for (let v = 0; v < 6; v++) wcol.push(col.r, col.g, col.b);
        }
      }
    }
    const wg = new T.BufferGeometry();
    wg.setAttribute('position', new T.Float32BufferAttribute(wall, 3));
    wg.setAttribute('color', new T.Float32BufferAttribute(wcol, 3));
    wg.computeVertexNormals();
    const walls = new T.Mesh(wg, new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1, side: T.DoubleSide }));
    walls.castShadow = walls.receiveShadow = true; scene.add(walls);
    const base = new T.Mesh(new T.CylinderGeometry(R * 1.0, R * 0.96, 0.25, 6), new T.MeshStandardMaterial({ color: C.soil2, flatShading: true }));
    base.position.y = BOT - 0.12; base.receiveShadow = true; scene.add(base);

    // --- sea: faceted surface with slow low waves (realT), and a glass-like side wall
    const seaGeo = new T.PlaneGeometry(2 * R, 2 * R, 26, 26).rotateX(-Math.PI / 2);
    const sp = seaGeo.attributes.position;
    for (let i = 0; i < sp.count; i++) { const [x, z] = clampHex(sp.getX(i) * 0.995, sp.getZ(i) * 0.995); sp.setXYZ(i, x, 0, z); }
    const sea = seaGeo.toNonIndexed(), seaBase = sea.attributes.position.array.slice();
    const seaMat = new T.MeshStandardMaterial({ color: C.teal, flatShading: true, roughness: 0.35, metalness: 0.05, transparent: true, opacity: 0.88 });
    const seaMesh = new T.Mesh(sea, seaMat); seaMesh.receiveShadow = true; scene.add(seaMesh);
    const seaWall = new T.Mesh(new T.CylinderGeometry(R * 0.998, R * 0.998, 0.75, 6, 1, true), new T.MeshStandardMaterial({ color: '#2f8f95', transparent: true, opacity: 0.55, roughness: 0.2 }));
    seaWall.position.y = -0.375; scene.add(seaWall);

    // --- sun
    const sun = new T.Mesh(new T.IcosahedronGeometry(0.9, 0), new T.MeshStandardMaterial({ color: '#ffd27a', emissive: '#ffb347', emissiveIntensity: 1.2, flatShading: true }));
    sun.position.set(-4.2, 5.0, 2.6); scene.add(sun);

    // --- trees: cone + trunk, popped in at frame 0
    const treeMat = new T.MeshStandardMaterial({ color: C.sage2, flatShading: true }), trunkMat = new T.MeshStandardMaterial({ color: C.soil, flatShading: true });
    const treeCone = new T.ConeGeometry(0.28, 0.75, 5), trunkGeo = new T.CylinderGeometry(0.05, 0.06, 0.25, 5);
    for (let i = 0, made = 0; i < 300 && made < 34; i++) {
      const x = rng.range(-5, 3), z = rng.range(-5, 3), [cx, cz] = clampHex(x, z);
      const h = height(cx, cz);
      if (cx !== x || h < 0.3 || h > 1.9 || segDist(x, z) < 0.55) continue;
      const tr = new T.Group(), c = new T.Mesh(treeCone, treeMat), s = new T.Mesh(trunkGeo, trunkMat);
      c.position.y = 0.55; s.position.y = 0.12; c.castShadow = s.castShadow = true;
      tr.add(c, s); tr.position.set(x, h - 0.05, z); tr.scale.setScalar(rng.range(0.7, 1.25)); tr.rotation.y = rng.range(0, 6);
      scene.add(tr); made++;
    }

    // --- paper flags: badge number + word, on a pole; they turn to face the camera
    const flagTex = (n, word) => {
      const c = document.createElement('canvas').getContext('2d');
      c.font = '600 120px Oswald'; const tw = c.measureText(word).width;
      return { tex: K.canvasTex(Math.ceil(tw + 250), 180, (g, r, w, h) => {
        g.fillStyle = '#fbf3e4'; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w - 26, h / 2); g.lineTo(w, h); g.lineTo(0, h); g.fill();
        g.fillStyle = C.coral; g.beginPath(); g.arc(80, h / 2, 54, 0, 7); g.fill();
        g.fillStyle = '#fbf3e4'; g.font = '600 92px Oswald'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(n, 80, h / 2 + 5);
        g.fillStyle = '#2d2a26'; g.font = '600 120px Oswald'; g.textAlign = 'left'; g.fillText(word, 156, h / 2 + 7);
      }), aspect: (tw + 250) / 180 };
    };
    const FLAG_AT = [[3.2, 2.2], [-0.2, -2.3], [-3.9, 1.3], [-0.5, 1.1]];
    const flags = this.beats.map((b, i) => {
      const { tex, aspect } = flagTex(String(i + 1), b.label), h = 0.62;
      const g = new T.Group(), pole = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 2.2, 6), new T.MeshStandardMaterial({ color: '#4a3b30' }));
      pole.position.y = 1.1; pole.castShadow = true;
      const flag = new T.Mesh(new T.PlaneGeometry(h * aspect, h), new T.MeshStandardMaterial({ map: tex, roughness: 0.9, side: T.DoubleSide, transparent: true, alphaTest: 0.05 }));
      flag.position.set(h * aspect / 2 + 0.03, 1.85, 0); flag.castShadow = true;
      g.add(pole, flag);
      const [x, z] = FLAG_AT[i]; g.position.set(x, Math.max(height(x, z), 0.02) - 0.02, z);
      scene.add(g); return g;
    });

    // --- vapour: small octahedra rise from the sea, then gather into the clouds
    const NV = 140, vap = new T.InstancedMesh(new T.OctahedronGeometry(0.08, 0), new T.MeshStandardMaterial({ color: '#ffffff', emissive: '#cfe9ef', emissiveIntensity: 0.35, flatShading: true }), NV);
    scene.add(vap);
    const CLOUDS = [new T.Vector3(-2.4, 4.6, -2.2), new T.Vector3(-0.6, 5.0, -3.1), new T.Vector3(-3.5, 4.3, -0.4)];
    const vr = K.rng(21), vp = [];
    for (let i = 0; i < NV; i++) {
      let x, z; do { x = vr.range(-1, 5.5); z = vr.range(-1, 5.5); } while (land(x, z) > 0.15 || clampHex(x, z)[0] !== x);
      vp.push({ x, z, s: vr.range(-1.6, 2.0), rise: vr.range(0.8, 1.3), ph: vr.range(0, 6), cl: i % 3, off: new T.Vector3(vr.range(-1.2, 1.2), vr.range(-0.3, 0.4), vr.range(-0.6, 0.6)) });
    }

    // --- clouds: clusters of faceted spheres that grow, then darken and rain
    const cloudMat = new T.MeshStandardMaterial({ color: C.cloud, flatShading: true, roughness: 1 });
    const clouds = CLOUDS.map((c, ci) => {
      const g = new T.Group(), cr = K.rng(40 + ci);
      for (let k = 0; k < 6; k++) {
        const m = new T.Mesh(new T.IcosahedronGeometry(cr.range(0.45, 0.8), 0), cloudMat);
        m.position.set(cr.range(-1.0, 1.0), cr.range(-0.1, 0.35), cr.range(-0.4, 0.4)); m.rotation.set(cr() * 6, cr() * 6, 0);
        m.castShadow = true; g.add(m);
      }
      g.position.copy(c); scene.add(g); return g;
    });

    // --- rain: thin streaks that fall in a loop (realT), density follows the beat (t)
    const NR = 260, rain = new T.InstancedMesh(new T.BoxGeometry(0.025, 0.32, 0.025), new T.MeshBasicMaterial({ color: C.rain, transparent: true, opacity: 0.85 }), NR);
    scene.add(rain);
    const rr = K.rng(5), rp = [];
    for (let i = 0; i < NR; i++) { const c = CLOUDS[i % 3]; const x = c.x + rr.range(-1.3, 1.3), z = c.z + rr.range(-0.7, 0.7); rp.push({ x, z, top: c.y - 0.4, bot: Math.max(height(x, z), 0), ph: rr(), sp: rr.range(1.4, 1.8), on: rr() }); }

    // --- river: a ribbon that runs from the mountain to the sea; its draw range grows with t
    const pts = new T.CatmullRomCurve3(RIVER.map(([x, z]) => new T.Vector3(x, 0, z))).getPoints(80);
    const rv = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], d = b.clone().sub(a).normalize(), n = new T.Vector3(-d.z, 0, d.x), w0 = 0.13 + i * 0.0018, w1 = w0 + 0.0018;
      const P = (p, s, w) => { const q = p.clone().addScaledVector(n, s * w); q.y = Math.max(height(q.x, q.z), height(p.x, p.z), -0.02) + 0.06; return [q.x, q.y, q.z]; };
      rv.push(...P(a, -1, w0), ...P(b, -1, w1), ...P(b, 1, w1), ...P(a, -1, w0), ...P(b, 1, w1), ...P(a, 1, w0));
    }
    const rg = new T.BufferGeometry(); rg.setAttribute('position', new T.Float32BufferAttribute(rv, 3)); rg.computeVertexNormals();
    const river = new T.Mesh(rg, new T.MeshStandardMaterial({ color: '#4fb8c0', roughness: 0.3, flatShading: true, emissive: '#1f6f78', emissiveIntensity: 0.25, side: T.DoubleSide }));
    scene.add(river);
    const NF = 18, flow = new T.InstancedMesh(new T.OctahedronGeometry(0.06, 0), new T.MeshBasicMaterial({ color: '#e9fbff' }), NF); scene.add(flow);

    // ===== more of the world: village, boats, rocks, birds, far islets (parallax), light effects =====
    const flat = c => new T.MeshStandardMaterial({ color: c, flatShading: true, roughness: 0.85 });
    const glowTex = K.canvasTex(128, 128, (g, r, w, h) => {
      const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    const ok = (x, z, minH, maxH) => { const [cx, cz] = clampHex(x, z), h = height(cx, cz); return cx === x && h > minH && h < maxH && segDist(x, z) > 0.55 && FLAG_AT.every(([fx, fz]) => Math.hypot(fx - x, fz - z) > 0.6); };

    // village: cottages with windows that light up when the storm comes
    const winMat = new T.MeshStandardMaterial({ color: '#5a4636', emissive: '#ffb547', emissiveIntensity: 0 });
    const wallM = flat('#f4ead6'), chimM = flat('#9a6b52'), doorM = flat('#7d4e3a'), roofs = ['#d9634a', '#c8553d', '#e8a23a', '#7f6a9e', '#d9634a'].map(flat);
    const houseR = K.rng(17), houses = [];
    for (let i = 0; i < 400 && houses.length < 7; i++) {
      const x = houseR.range(-2.4, 2.2), z = houseR.range(-2.6, 1.8);
      if (!ok(x, z, 0.15, 1.0) || houses.some(hh => Math.hypot(hh.x - x, hh.z - z) < 0.75)) continue;
      const g = new T.Group(), s = houseR.range(0.85, 1.2);
      const body = new T.Mesh(new T.BoxGeometry(0.46, 0.34, 0.4), wallM); body.position.y = 0.17;
      const roof = new T.Mesh(new T.ConeGeometry(0.38, 0.3, 4), roofs[houses.length % 5]); roof.position.y = 0.49; roof.rotation.y = Math.PI / 4;
      const chim = new T.Mesh(new T.BoxGeometry(0.07, 0.18, 0.07), chimM); chim.position.set(0.12, 0.6, 0.05);
      g.add(body, roof, chim);
      for (const [wx, wz, ry] of [[0.1, 0.201, 0], [-0.1, 0.201, 0], [0.231, 0, Math.PI / 2]]) { const w = new T.Mesh(new T.PlaneGeometry(0.08, 0.1), winMat); w.position.set(wx, 0.19, wz); w.rotation.y = ry; g.add(w); }
      const door = new T.Mesh(new T.PlaneGeometry(0.09, 0.16), doorM); door.position.set(0, 0.08, 0.202); g.add(door);
      g.traverse(o => { o.castShadow = o.receiveShadow = true; });
      g.position.set(x, height(x, z) - 0.03, z); g.scale.setScalar(s); g.rotation.y = 0.75 + houseR.range(-0.3, 0.3);
      scene.add(g); houses.push({ x, z });
    }
    // rocks on the shore and bushes on the slopes
    const rockR = K.rng(23), rockM = flat('#9c8f84'), bushM = flat('#7aa86a');
    for (let i = 0, n = 0; i < 600 && n < 34; i++) {
      const x = rockR.range(-5, 4.5), z = rockR.range(-5, 4.5), shore = n < 16;
      if (!ok(x, z, shore ? -0.15 : 0.3, shore ? 0.25 : 1.6)) continue;
      const m = new T.Mesh(shore ? new T.DodecahedronGeometry(rockR.range(0.1, 0.24), 0) : new T.IcosahedronGeometry(rockR.range(0.12, 0.2), 0), shore ? rockM : bushM);
      m.position.set(x, height(x, z) + 0.04, z); m.rotation.set(rockR() * 6, rockR() * 6, 0); m.scale.y = shore ? 0.7 : 0.85;
      m.castShadow = m.receiveShadow = true; scene.add(m); n++;
    }
    // pier and boats
    const woodM = flat('#a0714f');
    const pier = new T.Mesh(new T.BoxGeometry(1.3, 0.06, 0.26), woodM); pier.position.set(1.95, 0.12, -0.35); pier.rotation.y = -0.75; pier.castShadow = true; scene.add(pier);
    const sail = new T.Shape([new T.Vector2(0, 0), new T.Vector2(0, 0.55), new T.Vector2(0.38, 0.02)]);
    const sailM = new T.MeshStandardMaterial({ color: '#fbf3e4', side: T.DoubleSide, flatShading: true }), mastM = flat('#5a4636');
    const boats = [[3.0, 0.6, '#e07a5f'], [1.2, 3.6, '#3d6fa6'], [4.0, 2.6, '#f2c14e']].map(([x, z, c]) => {
      const g = new T.Group(), hull = new T.Mesh(new T.CylinderGeometry(0.26, 0.16, 0.14, 6, 1), flat(c));
      hull.scale.set(1.6, 1, 0.75); hull.position.y = 0.04;
      const mast = new T.Mesh(new T.CylinderGeometry(0.015, 0.015, 0.62, 5), mastM); mast.position.y = 0.4;
      const s = new T.Mesh(new T.ShapeGeometry(sail), sailM); s.position.set(0.02, 0.12, 0);
      g.add(hull, mast, s); g.traverse(o => { o.castShadow = true; }); g.userData = { x, z }; scene.add(g); return g;
    });
    // birds: a V of two wings, circling the mountain
    const wing = new T.BufferGeometry(); wing.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0, -0.22, 0.04, -0.07, -0.05, 0, 0.09, 0, 0, 0, 0.22, 0.04, -0.07, 0.05, 0, 0.09], 3));
    const birdM = new T.MeshBasicMaterial({ color: '#4a4440', side: T.DoubleSide });
    const birds = Array.from({ length: 9 }, () => { const m = new T.Mesh(wing, birdM); scene.add(m); return m; });
    // far floating islets at three depths: they move against the tile when the camera moves (parallax)
    const fwd = new T.Vector3(-12.6, -8.8, -14.6).normalize(), right = new T.Vector3().crossVectors(fwd, new T.Vector3(0, 1, 0)).normalize(), up = new T.Vector3().crossVectors(right, fwd);
    const isR = K.rng(31), islets = [], treeM = flat('#6f9a68'), isBody = flat('#a86b4e'), isTops = ['#8fb37c', '#a3c48a', '#e8d3a0'].map(flat);
    [[-12, 3.5, 11, 1.3], [12, 2.5, 14, 1.1], [-16, -5, 22, 1.8], [16, -4, 26, 1.6], [-6, 6.5, 30, 1.4], [6, -7.5, 34, 2.2], [-22, 1, 40, 2.4], [22, 4, 44, 2.0]].forEach(([s, u, d, r]) => {
      const g = new T.Group(), top = new T.Mesh(new T.CylinderGeometry(r, r, 0.25, 6), isR.pick(isTops)), body = new T.Mesh(new T.ConeGeometry(r, r * 1.3, 6), isBody);
      body.rotation.x = Math.PI; body.position.y = -0.125 - r * 0.65; g.add(top, body);
      for (let k = 0; k < 3; k++) { const tr = new T.Mesh(new T.ConeGeometry(0.28 * r, 0.8 * r, 5), treeM); tr.position.set(isR.range(-0.5, 0.5) * r, 0.5 * r, isR.range(-0.5, 0.5) * r); g.add(tr); }
      g.position.set(-0.4, 1, -0.4).addScaledVector(fwd, d).addScaledVector(right, s).addScaledVector(up, u);
      g.rotation.y = isR() * 6; g.userData = { y: g.position.y, ph: isR() * 6 }; scene.add(g); islets.push(g);
    });
    // a far cloud bank that drifts
    const farCloudM = new T.MeshStandardMaterial({ color: '#fffaf2', flatShading: true });
    const farClouds = Array.from({ length: 7 }, (_, i) => {
      const m = new T.Mesh(new T.IcosahedronGeometry(isR.range(1.2, 2.2), 0), farCloudM);
      m.position.set(0, 0, 0).addScaledVector(fwd, 46).addScaledVector(right, -28 + i * 9).addScaledVector(up, isR.range(-6, 2));
      m.scale.y = 0.55; m.userData.x = m.position.x; scene.add(m); return m;
    });
    // sun glow and rays
    const sunGlow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#ffe2a0', transparent: true, blending: T.AdditiveBlending, depthWrite: false, fog: false }));
    sunGlow.scale.setScalar(4.2); sunGlow.position.copy(sun.position); scene.add(sunGlow);
    const rayTex = K.canvasTex(64, 256, (g, r, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,0.9)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const gx = g.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.5, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)');
      g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, w, h);
    });
    const rays = new T.Group(); rays.position.copy(sun.position); scene.add(rays);
    const rayMats = [];
    for (let i = 0; i < 6; i++) {
      const m = new T.MeshBasicMaterial({ color: '#ffe9b8', map: rayTex, transparent: true, opacity: 0.12, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false });
      const geo = new T.PlaneGeometry(0.9 + i * 0.15, 11).rotateX(-Math.PI / 2).rotateZ(Math.PI / 2 * (i % 2)).translate(0, 0, 5.5);
      const ray = new T.Mesh(geo, m); ray.rotation.set((i - 2.5) * 0.06, (i % 3 - 1) * 0.09, 0); rays.add(ray); rayMats.push(m);
    }
    rays.lookAt(0.5, 0, 0.5);
    // glints on the sea
    const NG = 70, glint = new T.InstancedMesh(new T.OctahedronGeometry(0.06, 0), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, blending: T.AdditiveBlending, depthWrite: false }), NG); scene.add(glint);
    const gR = K.rng(9), gp = [];
    while (gp.length < NG) { const x = gR.range(-1, 5.5), z = gR.range(-1, 5.5); if (land(x, z) < 0.1 && clampHex(x, z)[0] === x) gp.push([x, z, gR() * 6, gR.range(1.5, 3)]); }
    // lightning: a zigzag tube under the first cloud, and a flash of the whole sky
    const boltPts = [], bR = K.rng(13);
    for (let i = 0; i <= 7; i++) boltPts.push(new T.Vector3(K.lerp(-2.3, -2.0, i / 7) + (i % 7 ? bR.range(-0.35, 0.35) : 0), K.lerp(4.1, 1.9, i / 7), K.lerp(-2.0, -1.4, i / 7)));
    const bolt = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(boltPts, false, 'catmullrom', 0), 40, 0.05, 5), new T.MeshBasicMaterial({ color: '#fffbe8', toneMapped: false }));
    const boltGlow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: '#cfe4ff', transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
    boltGlow.position.set(-2.2, 3.1, -1.7); boltGlow.scale.setScalar(4);
    scene.add(bolt, boltGlow);
    const STRIKES = [B[2] + 0.55, B[2] + 1.45];
    // rainbow after the rain: six thin additive arcs that face the camera
    const rainbow = new T.Group(); rainbow.position.set(0.4, -0.4, -1.8); scene.add(rainbow);
    const rbMats = ['#ff5b5b', '#ffa64d', '#ffe066', '#7dd87a', '#5fb6ff', '#a47bff'].map((c, i) => {
      const m = new T.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false, fog: false });
      rainbow.add(new T.Mesh(new T.TorusGeometry(4.9 - i * 0.13, 0.065, 6, 80, Math.PI), m)); return m;
    });

    const cam = K.camPath([
      { t: 0, pos: [15.0, 9.4, 11.4], look: [-0.4, 0.9, -0.4] },
      { t: 5, pos: [11.4, 10.6, 15.1], look: [-0.5, 1.2, -0.5] },
      { t: 10, pos: [10.4, 9.8, 17.2], look: [-0.4, 0.9, -0.4] },
    ], S.camera);

    const M = new T.Matrix4(), Q = new T.Quaternion(), V = new T.Vector3(), SC = new T.Vector3(), E = new T.Euler();
    return (t, realT) => {
      cam(t);
      // sea waves
      const a = sea.attributes.position.array;
      for (let i = 0; i < a.length; i += 3) a[i + 1] = 0.05 * Math.sin(seaBase[i] * 1.3 + realT * 1.4) * Math.cos(seaBase[i + 2] * 1.1 + realT * 1.1);
      sea.attributes.position.needsUpdate = true; sea.computeVertexNormals();
      sun.rotation.y = realT * 0.2;
      L.key.intensity = 3.2 + 0.6 * K.prog(t, 0, 1.5, 'inOut') - 0.9 * K.prog(t, 4.8, 5.6) + 0.9 * K.prog(t, 7.4, 8.4);

      // flags pop up, each one at its beat
      flags.forEach((f, i) => {
        const p = K.prog(t, B[i] + 0.15, B[i] + 0.75, 'back');
        f.scale.set(1, Math.max(p, 0.001), 1);
        f.visible = p > 0;
        f.rotation.y = Math.atan2(S.camera.position.x - f.position.x, S.camera.position.z - f.position.z) - 0.2;
      });

      // vapour
      vp.forEach((v, i) => {
        const age = Math.max(0, t - v.s), up = 0.15 + age * v.rise * 0.9;
        V.set(v.x + 0.15 * Math.sin(v.ph + age * 2), up, v.z + 0.15 * Math.cos(v.ph + age * 1.7));
        const gather = K.prog(t, B[1] + (i % 10) * 0.07, B[1] + 1.6 + (i % 10) * 0.07, 'inOut');
        V.lerp(CLOUDS[v.cl].clone().add(v.off), gather);
        const born = K.prog(t, v.s, v.s + 0.3, 'back') * (1 - K.prog(t, B[1] + 1.5, B[1] + 2.2));
        SC.setScalar(Math.max(born, 0.0001) * (t < v.s ? 0 : 1) + 0.0001);
        E.set(age * 2 + v.ph, age * 1.5, 0); Q.setFromEuler(E);
        vap.setMatrixAt(i, M.compose(V, Q, SC));
      });
      vap.instanceMatrix.needsUpdate = true;

      // clouds grow from small, then darken for the rain
      const grow = 0.25 + 0.75 * K.prog(t, B[1] + 0.2, B[1] + 2.0, 'back');
      const dark = K.prog(t, B[2] - 0.2, B[2] + 0.6, 'inOut') * (1 - K.prog(t, B[3] + 0.6, B[3] + 1.8, 'inOut'));
      cloudMat.color.set(C.cloud).lerp(new T.Color('#8f9aa6'), dark);
      clouds.forEach((g, i) => { g.scale.setScalar(grow * (i === 2 ? 0.8 : 1)); g.position.x = CLOUDS[i].x + 0.15 * Math.sin(realT * 0.3 + i); });

      // rain
      const wet = K.prog(t, B[2] + 0.2, B[2] + 0.8) * (1 - K.prog(t, B[3] + 0.4, B[3] + 1.4));
      rp.forEach((r, i) => {
        const fall = r.top - r.bot, y = r.top - ((realT * r.sp * 3 + r.ph * fall) % fall);
        SC.setScalar(r.on < wet ? 1 : 0.0001);
        rain.setMatrixAt(i, M.compose(V.set(r.x + 0.15 * Math.sin(i), y, r.z), Q.identity(), SC));
      });
      rain.instanceMatrix.needsUpdate = true;

      // river fills from the mountain to the sea, with bright specks that flow down it
      const fill = K.prog(t, B[2] + 1.0, B[3] + 1.4, 'inOut');
      rg.setDrawRange(0, Math.floor(fill * (rv.length / 9)) * 3);
      for (let i = 0; i < NF; i++) {
        const u = ((realT * 0.12 + i / NF) % 1) * fill, p = pts[Math.floor(u * (pts.length - 1))];
        SC.setScalar(fill > 0.05 ? 1 : 0.0001);
        flow.setMatrixAt(i, M.compose(V.set(p.x, Math.max(height(p.x, p.z), -0.02) + 0.12, p.z), Q.identity(), SC));
      }
      flow.instanceMatrix.needsUpdate = true;
      // ===== ambient life and light effects =====
      const strike = Math.max(...STRIKES.map(s => Math.max(0, 1 - Math.abs(t - s) / 0.09)));
      L.amb.intensity = 1.0 + 2.4 * strike;
      bolt.visible = boltGlow.visible = strike > 0.15;
      boltGlow.material.opacity = strike;
      cloudMat.emissive.set('#9fb8ff'); cloudMat.emissiveIntensity = strike * 0.8;
      winMat.emissiveIntensity = 1.8 * dark;
      const clear = 1 - 0.8 * dark;
      sunGlow.material.opacity = (0.45 + 0.08 * Math.sin(realT * 2.1)) * clear;
      rayMats.forEach((m, i) => { m.opacity = (0.08 + 0.04 * Math.sin(realT * (0.7 + i * 0.23) + i)) * clear; });
      rays.rotation.z = 0.03 * Math.sin(realT * 0.4);
      const rb = K.prog(t, B[3] + 0.6, B[3] + 1.8, 'inOut');
      rbMats.forEach(m => { m.opacity = 0.5 * rb; });
      rainbow.visible = rb > 0;
      rainbow.lookAt(S.camera.position.x, rainbow.position.y, S.camera.position.z);
      boats.forEach((b, i) => {
        const a = realT * 0.07 + i * 2.1;
        b.position.set(b.userData.x + 0.35 * Math.cos(a), 0.03 + 0.035 * Math.sin(realT * 1.7 + i), b.userData.z + 0.35 * Math.sin(a));
        b.rotation.set(0.07 * Math.sin(realT * 1.3 + i), -a, 0.06 * Math.cos(realT * 1.1 + i));
      });
      birds.forEach((m, i) => {
        const a = realT * (0.32 + (i % 3) * 0.03) + i * 0.7, r = 2.6 + (i % 4) * 0.35;
        m.position.set(-1.6 + r * Math.cos(a), 5.4 + 0.35 * Math.sin(realT * 0.8 + i), -1.4 + r * Math.sin(a));
        m.rotation.set(0, -a, 0.35 * Math.sin(realT * 9 + i * 1.7));
      });
      islets.forEach(g => { g.position.y = g.userData.y + 0.3 * Math.sin(realT * 0.5 + g.userData.ph); });
      farClouds.forEach((m, i) => { m.position.x = m.userData.x + 1.5 * Math.sin(realT * 0.05 + i); });
      gp.forEach(([x, z, ph, sp], i) => {
        const tw = Math.max(0, Math.sin(realT * sp + ph)) ** 8 * clear;
        glint.setMatrixAt(i, M.compose(V.set(x, 0.09, z), Q.identity(), SC.setScalar(0.0001 + tw)));
      });
      glint.instanceMatrix.needsUpdate = true;
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('wind', { gain: 0.1 });
    k.bed('water', { gain: 0.08 });
    B.forEach((b, i) => { k.play('pop', { t: b + 0.3, gain: 0.5, pitch: 1 + i * 0.12 }); k.play('paper', { t: b + 0.32, gain: 0.35 }); });
    k.play('whoosh', { t: 0.2, gain: 0.25, pitch: 0.8, dur: 2 });
    for (let i = 0; i < 7; i++) k.play('bubble', { t: 0.3 + i * 0.3, gain: 0.2, pitch: 0.9 + (i % 3) * 0.2, pan: (i % 2 ? 0.3 : -0.2) });
    k.play('swish', { t: B[1] + 0.2, gain: 0.35, dur: 3 });
    for (let i = 0; i < 4; i++) k.play('pop', { t: B[1] + 0.6 + i * 0.35, gain: 0.3, pitch: 0.55 + i * 0.05 });
    k.play('rumble', { t: B[2] - 0.1, gain: 0.45 });
    for (let i = 0; i < 14; i++) k.play('drop', { t: B[2] + 0.3 + i * 0.16, gain: 0.12, pitch: 0.8 + ((i * 7) % 5) * 0.12, pan: ((i * 3) % 5 - 2) * 0.2 });
    k.play('splash', { t: B[3] + 0.3, gain: 0.35 });
    k.play('chime', { t: B[3] + 1.5, gain: 0.25, pitch: 1.0, music: true });
    k.play('sparkle', { t: B[3] + 0.8, gain: 0.25 });
    [B[2] + 0.55, B[2] + 1.45].forEach((s, i) => { k.play('zap', { t: s, gain: 0.3, pitch: 0.6 + i * 0.2 }); k.play('rumble', { t: s + 0.25, gain: 0.5, dur: 1.4 }); });
  },
  post: null,
};
