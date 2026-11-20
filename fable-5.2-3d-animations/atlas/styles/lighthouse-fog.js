window.STYLES = window.STYLES || {};
STYLES['lighthouse-fog'] = {
  id: 'lighthouse-fog', name: 'Lighthouse Fog',
  family: 'Light and optics',
  use: 'Story',
  look: 'Night and thick fog over a dark sea, seen from beside a lighthouse lamp. One rotating beam cuts through the fog. Things out in the dark exist only while the beam is on them, and fade slowly after it moves on.',
  motion: 'The beam turns once per beat. Each sweep lights up a little more of the world, then leaves it dark again with an afterglow. The camera stays next to the lamp and turns only a little.',
  shownHere: 'How a search engine crawls the web: it starts from a few known pages, follows each link to new pages, copies every page it finds into an index, comes back later to see what changed, and answers searches from that index.',
  goodFor: 'Discovery and exploration: crawling, scanning, searching, mapping the unknown, attention and memory. Anything where seeing is temporary and coverage grows.',
  fonts: ['IBM Plex Sans:wght@500;700'],
  duration: 12,
  samples: 4,
  // CONTENT: pages (bearing in degrees, distance, height), when they are found, and the page they were found from
  pages: [
    { name: 'home', a: -8, d: 15, y: 1.0, found: 0, from: -1 },
    { name: 'blog', a: -32, d: 19, y: 2.2, found: 1, from: 0 },
    { name: 'shop', a: 18, d: 18, y: 0.4, found: 1, from: 0 },
    { name: 'post 1', a: -48, d: 25, y: 3.2, found: 2, from: 1 },
    { name: 'help', a: 36, d: 25, y: 2.4, found: 2, from: 2 },
    { name: 'post 2', a: -20, d: 29, y: 4.2, found: 2, from: 1 },
  ],
  beats: [
    { t: 0.0, label: 'The crawler starts from a known page' },
    { t: 2.4, label: 'It follows each link to new pages' },
    { t: 4.8, label: 'Every page it finds is copied to an index' },
    { t: 7.2, label: 'It comes back later to see what changed' },
    { t: 9.6, label: 'Searches are answered from the index' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'IBM Plex Sans', PG = this.pages, BE = this.beats;
    scene.background = new T.Color('#06080c'); scene.fog = new T.FogExp2('#0a0e14', 0.03); scene.add(S.camera);
    scene.add(new T.HemisphereLight('#203048', '#000000', 0.12));
    const std = (c, r = 0.6, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
    // the beam turns once per beat; it points along -z (into the view) 0.3 s before each beat starts
    const W = Math.PI * 2 / 2.4, ang = t => W * (t + 0.3);
    const sea = new T.Mesh(new T.PlaneGeometry(200, 200), std('#05080c', 0.25, { metalness: 0.3 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -5; scene.add(sea);
    const spot = new T.SpotLight('#fff2d0', 900, 60, 0.12, 0.4, 1.2); spot.position.set(0, 0, 0); scene.add(spot, spot.target);
    // the lamp: a lens drum and a brass rail in the foreground
    const lamp = new T.Group(); scene.add(lamp);
    const lens = new T.Mesh(new T.CylinderGeometry(0.7, 0.7, 1.4, 24, 1, true), std('#fff4d8', 0.1, { emissive: '#ffd890', emissiveIntensity: 1.2, transparent: true, opacity: 0.85 })); lamp.add(lens);
    const rail = new T.Mesh(new T.TorusGeometry(2.0, 0.05, 8, 64), std('#a08040', 0.3, { metalness: 0.9 })); rail.rotation.x = Math.PI / 2; rail.position.y = -0.9; rail.scale.setScalar(1.35); scene.add(rail);
    const floor = new T.Mesh(new T.CircleGeometry(3.0, 48), std('#2a2a2e', 0.7)); floor.rotation.x = -Math.PI / 2; floor.position.y = -1.0; scene.add(floor);
    // the beam: a long cone with a texture that fades with distance
    const fade = K.canvasTex(8, 256, (g, r, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(0.9, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0.9)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, 1);
    const coneGeo = new T.ConeGeometry(4.5, 45, 32, 1, true); coneGeo.translate(0, -22.5, 0); coneGeo.rotateX(-Math.PI / 2);
    const beam = new T.Mesh(coneGeo, new T.MeshBasicMaterial({ color: '#fff0c8', map: fade, transparent: true, opacity: 0.32, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false })); scene.add(beam);
    const beam2 = beam.clone(); scene.add(beam2);
    // pages: web pages on posts in the fog; dark until the beam finds them
    const pageTex = (p, i, changed) => K.canvasTex(320, 240, (g, r, w, h) => { g.fillStyle = changed ? '#fff0c0' : '#e8eef8'; g.fillRect(0, 0, w, h); g.fillStyle = changed ? '#e07a2a' : '#3a6ad0'; g.fillRect(0, 0, w, 44); g.fillStyle = '#fff'; g.font = `700 28px "${F}"`; g.fillText(p.name, 14, 31);
      g.fillStyle = '#8a94a8'; for (let k = 0; k < 6; k++) g.fillRect(16, 64 + k * 26, r.range(120, w - 32), 10); g.fillStyle = '#3a6ad0'; g.fillRect(16, 64 + 6 * 26, 70, 12); if (changed) { g.fillStyle = '#e07a2a'; g.font = `700 26px "${F}"`; g.fillText('updated', w - 120, h - 14); } }, 20 + i + (changed ? 50 : 0));
    const pos = PG.map(p => { const a = p.a * Math.PI / 180; return new T.Vector3(Math.sin(a) * p.d, p.y, -Math.cos(a) * p.d); });
    const pages = PG.map((p, i) => { const g = new T.Group(); g.position.copy(pos[i]); scene.add(g); g.lookAt(0, pos[i].y, 0);
      const tex = pageTex(p, i, false), tex2 = pageTex(p, i, true);
      const m = new T.Mesh(new T.PlaneGeometry(3.2, 2.4), new T.MeshStandardMaterial({ color: '#000000', emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0 })); g.add(m);
      const pole = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 8, 6), std('#000', 0.9, { emissive: '#ffffff', emissiveIntensity: 0 })); pole.position.y = -5.2; g.add(pole);
      return { g, m, pole, tex, tex2, bearing: p.a * Math.PI / 180 }; });
    // links: lines between pages, lit with the pages
    const links = PG.map((p, i) => { if (p.from < 0) return null; const geo = new T.BufferGeometry().setFromPoints([pos[p.from], pos[i]]); const l = new T.Line(geo, new T.LineBasicMaterial({ color: '#7ab8ff', transparent: true, opacity: 0 })); scene.add(l); return l; });
    // the index: a stack of cards on the lamp floor that grows
    const index = []; for (let i = 0; i < PG.length; i++) { const c = new T.Mesh(new T.BoxGeometry(0.5, 0.04, 0.36), std('#e8eef8', 0.5, { emissive: '#3a6ad0', emissiveIntensity: 0.3 })); c.position.set(2.4, 0.18 + i * 0.05, -4.2); c.rotation.y = 0.1 * i; c.visible = false; scene.add(c); index.push(c); }
    const idxTag = K.label('Index', { font: F, weight: 700, px: 52, color: '#cfe0ff', bg: 'rgba(10,14,20,0.7)', radius: 8, pad: 0.2, height: 0.22 }); idxTag.position.set(2.4, 0.75, -4.2); const stand = new T.Mesh(new T.BoxGeometry(0.9, 1.1, 0.7), std('#3a3030', 0.6)); stand.position.set(2.4, -0.4, -4.2); scene.add(stand); scene.add(idxTag);
    const flyers = PG.map(() => { const c = new T.Mesh(new T.PlaneGeometry(0.5, 0.36), new T.MeshBasicMaterial({ color: '#cfe0ff', transparent: true, opacity: 0.8, depthWrite: false })); c.visible = false; scene.add(c); return c; });
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 700, px: 64, color: '#e6eefc', bg: 'rgba(6,8,12,0.75)', radius: 8, pad: 0.35, height: 0.36 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.74, -8); S.camera.add(l); return l; });
    const look = new T.Vector3();
    // when the beam last passed a bearing (seconds ago)
    const since = (t, b) => { const d = ((ang(t) - b) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2); return d / W; };
    const glowAt = (t, b, found) => { if (t < B[found] - 0.05) return 0; const s = since(t, b), tp = t - s; if (tp < B[found] - 1.25) return 0; return Math.exp(-s / 0.9) * (s < 0.08 ? 1.6 : 1); };
    return (t, realT) => {
      const yaw = -0.08 * Math.sin(t * 0.4);
      S.camera.position.set(1.7, 1.1, 0.9); look.set(Math.sin(yaw) * 10, 0.9, -10); S.camera.lookAt(look); S.camera.userData.look = look;
      const a = ang(t), dir = new T.Vector3(Math.sin(a), 0, -Math.cos(a));
      beam.lookAt(dir); beam2.lookAt(dir.clone().negate()); spot.target.position.copy(dir).multiplyScalar(20); spot.target.updateMatrixWorld();
      lens.material.emissiveIntensity = 1.0 + 0.3 * Math.sin(realT * 3);
      let indexed = 0;
      pages.forEach((p, i) => { const pr = PG[i], gl = glowAt(t, p.bearing, pr.found), changed = t > B[3] + 1.2 && i === 0;
        p.g.visible = gl > 0.02; p.m.material.emissiveMap = changed ? p.tex2 : p.tex; p.m.material.emissiveIntensity = 1.4 * gl; p.pole.material.emissiveIntensity = 0.15 * gl;
        const firstHit = B[pr.found] - 1.25 + ((p.bearing - ang(B[pr.found] - 1.25)) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) / W;
        const fu = K.prog(t, firstHit + 0.1, firstHit + 0.9, 'inOut'), f = flyers[i];
        f.visible = t > B[2] - 0.2 && fu > 0 && fu < 1; if (f.visible) { f.position.lerpVectors(pos[i], new T.Vector3(2.4, 0.3, -4.2), fu); f.lookAt(S.camera.position); f.material.opacity = 0.8 * (1 - fu * 0.5); }
        if (t > firstHit + 0.9 && t > B[2]) indexed++;
        if (links[i]) links[i].material.opacity = 0.9 * Math.min(gl, glowAt(t, pages[pr.from].bearing, PG[pr.from].found) + 0.3) * (t > B[1] ? 1 : 0); });
      index.forEach((c, i) => { c.visible = i < indexed; c.material.emissiveIntensity = t > B[4] ? 0.6 + 0.6 * Math.sin(realT * 6 + i) : 0.3; });
      idxTag.visible = t > B[2];
      titles.forEach((l, i) => { const a2 = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.3)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.15, B[i + 1])); l.visible = a2 > 0.01; l.material.opacity = a2; });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('water', { gain: 0.06 }); k.bed('wind', { gain: 0.05 });
    for (let i = 0; i < 5; i++) k.play('whoosh', { t: B[i] + 0.7, gain: 0.12, pitch: 0.4, dur: 1.2 });
    k.play('bell', { t: 0.4, gain: 0.15, pitch: 0.4, music: true });
    k.play('blip', { t: 1.2, gain: 0.15, pitch: 1.0 });
    k.play('blip', { t: B[1] + 1.0, gain: 0.15, pitch: 1.2 }); k.play('blip', { t: B[1] + 1.5, gain: 0.15, pitch: 1.3 });
    k.play('paper', { t: B[2] + 0.8, gain: 0.2, pitch: 1.4 }); k.play('paper', { t: B[2] + 1.4, gain: 0.2, pitch: 1.5 }); k.play('blip', { t: B[2] + 1.0, gain: 0.12, pitch: 1.5 });
    k.play('chime', { t: B[3] + 1.3, gain: 0.12, pitch: 1.2, music: true });
    k.play('sparkle', { t: B[4] + 0.4, gain: 0.2 }); k.play('bell', { t: B[4] + 1.2, gain: 0.15, pitch: 0.5, music: true });
  },
  post: null,
};
