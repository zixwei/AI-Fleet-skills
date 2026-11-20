window.STYLES = window.STYLES || {};
STYLES['one-bit'] = {
  id: 'one-bit', name: 'One-Bit Dither',
  family: 'Filters over 3D',
  use: 'Explainer',
  look: 'Two colours only: ink and paper, as on an early desktop computer. Large square pixels, an ordered dither pattern for every shade of grey, and bitmap lettering.',
  motion: 'Motion in steps of 15 frames a second, like an old screen. Dials click round, objects pop in, and a bitmap caption changes at each beat.',
  shownHere: 'The Pomodoro technique: pick one task, work on it for 25 minutes, take a 5-minute break, and after four rounds take a longer break.',
  goodFor: 'Productivity, retro computing and simple step-by-step methods, where a nostalgic, very clean look helps.',
  fonts: ['VT323'],
  duration: 11,
  samples: 1,
  // CONTENT
  beats: [
    { t: 0.0, label: 'PICK ONE TASK' },
    { t: 2.7, label: 'WORK FOR 25 MINUTES' },
    { t: 5.4, label: 'TAKE A 5-MINUTE BREAK' },
    { t: 8.1, label: 'AFTER 4 ROUNDS: A LONG BREAK' },
  ],
  tasks: ['Write report', 'Reply to email', 'Plan week'],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'VT323';
    scene.background = new T.Color('#ffffff'); scene.add(S.camera);
    const key = new T.DirectionalLight('#ffffff', 2.2); key.position.set(-5, 8, 6); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -8, right: 8, top: 6, bottom: -6 }); key.shadow.camera.updateProjectionMatrix(); scene.add(key);
    scene.add(new T.HemisphereLight('#ffffff', '#606060', 0.7));
    const mat = g => new T.MeshLambertMaterial({ color: new T.Color(g, g, g) });
    const desk = new T.Mesh(new T.BoxGeometry(16, 0.4, 8), mat(1.0)); desk.position.y = -0.2; desk.receiveShadow = true; scene.add(desk);
    const wall = new T.Mesh(new T.PlaneGeometry(30, 14), new T.MeshBasicMaterial({ color: '#ffffff' })); wall.position.set(0, 5, -3.5); scene.add(wall);
    // the tomato timer
    const timer = new T.Group(); timer.position.set(0, 1.2, 0); scene.add(timer);
    const body = new T.Mesh(new T.SphereGeometry(1.2, 40, 28), mat(0.5)); body.scale.set(1.15, 0.95, 1.1); body.castShadow = true; timer.add(body);
    const band = new T.Mesh(new T.CylinderGeometry(1.36, 1.36, 0.3, 48, 1, true), mat(0.95)); band.material.side = T.DoubleSide; timer.add(band);
    const ticks = new T.Group(); timer.add(ticks); for (let i = 0; i < 25; i++) { const m = new T.Mesh(new T.BoxGeometry(0.03, i % 5 ? 0.12 : 0.24, 0.03), mat(0.05)); const a = i / 25 * 6.283; m.position.set(Math.sin(a) * 1.37, 0, Math.cos(a) * 1.37); ticks.add(m); }
    const top = new T.Group(); top.position.y = 0.0; timer.add(top);
    const upper = new T.Mesh(new T.SphereGeometry(1.2, 40, 20, 0, 6.283, 0, Math.PI / 2), mat(0.45)); upper.scale.set(1.15, 0.95, 1.1); upper.position.y = 0.16; top.add(upper);
    const pointer = new T.Mesh(new T.ConeGeometry(0.1, 0.25, 3), mat(0.02)); pointer.rotation.x = Math.PI / 2; pointer.position.set(0, 0.3, 1.32); top.add(pointer);
    const leaf = new T.Group(); leaf.position.y = 1.3; timer.add(leaf); for (let i = 0; i < 5; i++) { const l = new T.Mesh(new T.ConeGeometry(0.12, 0.6, 4), mat(0.2)); l.rotation.set(Math.PI / 2 - 0.4, 0, 0); l.position.set(Math.sin(i * 1.256) * 0.25, 0, Math.cos(i * 1.256) * 0.25); l.lookAt(Math.sin(i * 1.256) * 2, 0.6, Math.cos(i * 1.256) * 2); leaf.add(l); }
    const stem = new T.Mesh(new T.CylinderGeometry(0.05, 0.06, 0.3, 8), mat(0.15)); stem.position.y = 0.15; leaf.add(stem);
    // a task card on the left, ticked off
    const card = new T.Mesh(new T.PlaneGeometry(2.8, 3.2), new T.MeshBasicMaterial({ map: K.canvasTex(560, 640, (g, r, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.strokeStyle = '#000'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#000'; g.font = `400 74px "${F}"`; g.fillText('TO DO', 40, 90); g.fillRect(40, 108, w - 80, 6); this.tasks.forEach((tk, i) => { g.strokeRect(40, 170 + i * 120, 56, 56); g.font = `400 58px "${F}"`; g.fillText(tk, 120, 214 + i * 120); }); }) }));
    card.position.set(-3.5, 0.02, 1.0); card.rotation.x = -Math.PI / 2 + 0.55; scene.add(card);
    const tick = new T.Mesh(new T.PlaneGeometry(0.4, 0.4), new T.MeshBasicMaterial({ transparent: true, map: K.canvasTex(64, 64, g => { g.strokeStyle = '#000'; g.lineWidth = 10; g.beginPath(); g.moveTo(8, 34); g.lineTo(26, 54); g.lineTo(58, 8); g.stroke(); }) })); scene.add(tick);
    const arrow = new T.Mesh(new T.ConeGeometry(0.16, 0.4, 3), mat(0.02)); arrow.rotation.z = -Math.PI / 2; scene.add(arrow);
    // a coffee cup on the right, with steam
    const cup = new T.Group(); cup.position.set(3.8, 0, 0.6); scene.add(cup);
    const cb = new T.Mesh(new T.CylinderGeometry(0.55, 0.45, 1.0, 32), mat(0.9)); cb.position.y = 0.5; cb.castShadow = true; cup.add(cb);
    const ch = new T.Mesh(new T.TorusGeometry(0.25, 0.07, 8, 20, Math.PI * 1.2), mat(0.9)); ch.position.set(0.6, 0.55, 0); ch.rotation.z = -Math.PI * 0.6; cup.add(ch);
    const cc = new T.Mesh(new T.CircleGeometry(0.5, 32), mat(0.15)); cc.rotation.x = -Math.PI / 2; cc.position.y = 0.95; cup.add(cc);
    const steam = [0, 1, 2].map(i => { const m = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(Array.from({ length: 6 }, (_, k) => new T.Vector3(0.12 * Math.sin(k + i * 2), k * 0.2, 0))), 20, 0.05, 6), mat(0.95)); m.position.set(-0.2 + i * 0.2, 1.1, 0); cup.add(m); return m; });
    // four tally tomatoes
    const tallies = [0, 1, 2, 3].map(i => { const m = new T.Mesh(new T.SphereGeometry(0.28, 20, 14), mat(0.5)); m.scale.y = 0.85; m.position.set(-1.2 + i * 0.8, 0.25, 2.4); m.castShadow = true; scene.add(m); return m; });
    // a lamp and a plant for depth
    const lampP = new T.Group(); lampP.position.set(6.0, 0, -1.6); scene.add(lampP); const lp = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 2.6, 8), mat(0.1)); lp.position.y = 1.3; lampP.add(lp); const shade = new T.Mesh(new T.ConeGeometry(0.7, 0.8, 24, 1, true), mat(0.2)); shade.material.side = T.DoubleSide; shade.position.y = 2.7; lampP.add(shade);
    const plant = new T.Group(); plant.position.set(-6.3, 0, -1.6); scene.add(plant); const pot = new T.Mesh(new T.CylinderGeometry(0.5, 0.38, 0.8, 16), mat(0.35)); pot.position.y = 0.4; plant.add(pot); for (let i = 0; i < 6; i++) { const lf = new T.Mesh(new T.SphereGeometry(0.4, 10, 8), mat(0.25)); lf.scale.set(0.3, 1.1, 0.1); lf.position.set(Math.cos(i) * 0.25, 1.3, Math.sin(i) * 0.25); lf.rotation.set(0.5 * Math.sin(i), i, 0.5 * Math.cos(i)); plant.add(lf); }
    const titles = this.beats.map(b => { const l = K.label(b.label, { font: F, weight: 400, px: 110, color: '#000000', height: 0.62 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 1.62, -8); S.camera.add(l); return l; });
    const clockTxt = Array.from({ length: 26 }, (_, m) => K.canvasTex(256, 96, g => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 96); g.strokeStyle = '#000'; g.lineWidth = 6; g.strokeRect(3, 3, 250, 90); g.fillStyle = '#000'; g.font = `400 84px "${F}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(m).padStart(2, '0') + ':00', 128, 50); }));
    const clock = new T.Mesh(new T.PlaneGeometry(1.4, 0.52), new T.MeshBasicMaterial({ map: clockTxt[25] })); clock.position.set(2.3, 2.5, 0.4); scene.add(clock);
    const look = new T.Vector3(0, 1.3, 0);
    return (t0, realT0) => {
      const t = Math.floor(t0 * 15) / 15, rt = Math.floor(realT0 * 15) / 15;
      S.camera.position.set(1.0 * Math.sin(t * 0.18), 4.0, 11.6); S.camera.lookAt(look); S.camera.userData.look = look;
      // the dial winds to 25, then runs down; a break of 5, then rounds
      const wind = K.prog(t, B[1], B[1] + 0.6, 'out'), run = K.prog(t, B[1] + 0.6, B[2] - 0.1), brk = K.prog(t, B[2] + 0.4, B[3] - 0.2);
      let min = 25; if (t < B[1]) min = 25; else if (t < B[2]) min = Math.round(25 * (1 - run)); else if (t < B[3]) min = Math.round(5 * (1 - brk)); else min = 15 + Math.round(15 * (1 - K.prog(t, B[3] + 0.4, 11)));
      min = Math.max(0, Math.min(25, min)); clock.material.map = clockTxt[min];
      top.rotation.y = -wind * Math.PI * 2 * (25 / 60) + (t > B[1] + 0.6 && t < B[2] ? run * Math.PI * 2 * (25 / 60) : 0);
      const ring = t > B[2] - 0.15 && t < B[2] + 0.5; timer.position.x = ring ? 0.05 * Math.sin(rt * 90) : 0; timer.rotation.z = ring ? 0.05 * Math.sin(rt * 70) : 0;
      // the task card: an arrow on the first task, then a tick
      arrow.position.set(-5.25, 0.62, 0.35); arrow.visible = t < B[2]; arrow.position.x = -5.25 + 0.08 * Math.sin(rt * 8);
      tick.position.set(-4.45, 0.6, 0.15); tick.rotation.x = -Math.PI / 2 + 0.55; tick.visible = t > B[2] + 0.1;
      steam.forEach((m, i) => { m.visible = t > B[2] && t < B[3] + 0.5; m.position.y = 1.1 + ((rt * 0.5 + i * 0.3) % 0.6); });
      cup.position.y = t > B[2] && t < B[2] + 0.3 ? 0.2 : 0;
      tallies.forEach((m, i) => { const p = K.prog(t, B[3] + 0.2 + i * 0.35, B[3] + 0.5 + i * 0.35, 'back'); m.scale.set(Math.max(0.001, p), 0.85 * Math.max(0.001, p), Math.max(0.001, p)); m.visible = p > 0; });
      titles.forEach((l, i) => { l.visible = t >= B[i] && (i === titles.length - 1 || t < B[i + 1]); });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.04 });
    B.forEach((b, i) => k.play('blip', { t: b + 0.05, gain: 0.3, pitch: 1 + i * 0.25 }));
    for (let i = 0; i < 9; i++) k.play('click', { t: B[1] + i * 0.066, gain: 0.25, pitch: 1.4 });
    for (let i = 0; i < 14; i++) k.play('tick', { t: B[1] + 0.8 + i * 0.13, gain: 0.15, pitch: 1.2 });
    for (let i = 0; i < 6; i++) k.play('bell', { t: B[2] - 0.15 + i * 0.1, gain: 0.15, pitch: 2.0 });
    for (let i = 0; i < 4; i++) k.play('blip', { t: B[3] + 0.4 + i * 0.35, gain: 0.25, pitch: 1.5 + i * 0.2, music: true });
  },
  // post pass: big square pixels and a 4x4 ordered dither into two colours
  post: {
    fragment: `
      float bayer(vec2 p){ int x = int(mod(p.x, 4.0)), y = int(mod(p.y, 4.0)); int i = x + y * 4;
        float m[16]; m[0]=0.;m[1]=8.;m[2]=2.;m[3]=10.;m[4]=12.;m[5]=4.;m[6]=14.;m[7]=6.;m[8]=3.;m[9]=11.;m[10]=1.;m[11]=9.;m[12]=15.;m[13]=7.;m[14]=13.;m[15]=5.;
        float v = 0.0; for (int k = 0; k < 16; k++) if (k == i) v = m[k]; return (v + 0.5) / 16.0; }
      vec4 postFX(vec2 uv){
        float P = 6.0; vec2 cell = floor(uv * uRes / P); vec2 suv = (cell + 0.5) * P / uRes;
        vec3 c = texture2D(tColor, suv).rgb;
        float L = dot(c, vec3(0.299, 0.587, 0.114));
        L = smoothstep(0.1, 0.62, L);
        float on = step(bayer(cell), L);
        vec3 ink = vec3(0.012, 0.012, 0.03), paper = vec3(2.0, 1.95, 1.75); // paper is bright because tone mapping follows
        return vec4(mix(ink, paper, on), 1.0);
      }`,
  },
};
