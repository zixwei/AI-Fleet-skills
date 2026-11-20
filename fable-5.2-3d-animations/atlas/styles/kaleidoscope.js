window.STYLES = window.STYLES || {};
STYLES['kaleidoscope'] = {
  id: 'kaleidoscope', name: 'Kaleidoscope',
  family: 'Light and optics',
  use: 'Title',
  look: 'Loose pieces of coloured glass and small beads tumble in a backlit chamber. Mirrors fold them into a six-way mandala of jewel colours. The title sits clear and still in the centre cell.',
  motion: 'The tube turns, the pieces slide and tumble, and the mandala breaks and re-forms with every turn. The centre cell stays calm; each new line of the title appears there.',
  shownHere: 'A title card for a festival: its name, what it is, and when it happens.',
  goodFor: 'Titles and openers with colour and joy: festivals, music, art, children\'s events, anything that wants a burst of pattern.',
  fonts: ['Righteous'],
  duration: 9,
  samples: 4,
  // CONTENT: the centre-cell lines, one per beat
  beats: [
    { t: 0.0, label: 'LUMA' },
    { t: 3.0, label: 'FESTIVAL OF LIGHT' },
    { t: 6.0, label: '12–14 JUNE' },
  ],

  build(S) {
    const T = S.THREE, scene = S.scene, B = this.beats.map(b => b.t), F = 'Righteous', BE = this.beats;
    scene.background = new T.Color('#0a0610'); scene.add(S.camera);
    // a backlight panel, then glass pieces and beads in front of it
    const panel = new T.Mesh(new T.CircleGeometry(4.2, 64), new T.MeshBasicMaterial({ color: '#2a1e30' })); panel.position.z = -0.5; scene.add(panel);
    const rr = K.rng(67), cols = ['#ff3a5a', '#ffb020', '#3ac0ff', '#7aff6a', '#c05aff', '#ff7a2a', '#2affd0', '#ffe84a'];
    const pieces = Array.from({ length: 120 }, (_, i) => { const n = 3 + Math.floor(rr() * 3), s = rr.range(0.25, 0.7); const sh = new T.Shape(); for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + rr.range(-0.4, 0.4), r = s * rr.range(0.6, 1.1); k ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
      const m = new T.Mesh(new T.ShapeGeometry(sh), new T.MeshBasicMaterial({ color: cols[i % cols.length], transparent: true, opacity: 0.85, side: T.DoubleSide })); scene.add(m);
      return { m, r0: rr.range(1.3, 3.8), a0: rr() * 6.283, spin: rr.range(-1, 1), z: -0.4 + i * 0.003, fall: rr.range(0.4, 1.0) }; });
    const beads = Array.from({ length: 40 }, (_, i) => { const m = new T.Mesh(new T.CircleGeometry(rr.range(0.08, 0.16), 20), new T.MeshBasicMaterial({ color: cols[(i * 3) % cols.length] })); scene.add(m); return { m, r0: Math.sqrt(rr()) * 3.8, a0: rr() * 6.283, z: -0.1 + i * 0.002 }; });
    // the title in the centre cell, at the middle of the screen
    const titles = BE.map(b => { const l = K.label(b.label, { font: F, weight: 400, px: 96, color: '#fff8ec', bg: 'rgba(10,6,16,0.55)', radius: 40, pad: 0.4, height: b.label.length > 12 ? 0.24 : b.label.length > 6 ? 0.3 : 0.6 }); l.material.depthTest = false; l.renderOrder = 10; l.position.set(0, 0, -8); S.camera.add(l); return l; });
    S.camera.position.set(0, 0, 11); S.camera.lookAt(0, 0, 0);
    return (t, realT) => {
      // the tube turns; pieces slide down under 'gravity' in the turning frame and tumble
      const turn = t * 0.7 + 0.6 * Math.sin(t * 0.9);
      pieces.forEach((p, i) => { const a = p.a0 - turn * p.fall * 0.6, r = Math.min(3.6, p.r0 + 0.4 * Math.sin(t * 1.3 * p.fall + i)); p.m.position.set(Math.cos(a + turn) * r, Math.sin(a + turn) * r, p.z); p.m.rotation.z = p.spin * t * 2 + turn; });
      beads.forEach((b, i) => { const a = b.a0 - turn * 0.9, r = Math.min(3.8, b.r0 + 0.3 * Math.sin(t * 2 + i)); b.m.position.set(Math.cos(a + turn) * r, Math.sin(a + turn) * r, b.z); });
      titles.forEach((l, i) => { const a = (i === 0 ? 1 : K.prog(t, B[i], B[i] + 0.4)) * (i === titles.length - 1 ? 1 : 1 - K.prog(t, B[i + 1] - 0.3, B[i + 1])); l.visible = a > 0.01; l.material.opacity = a; l.scale.setScalar(0.85 + 0.15 * a); });
    };
  },

  sound(k) {
    const B = this.beats.map(b => b.t);
    k.bed('room', { gain: 0.04 });
    for (let i = 0; i < 30; i++) k.play('glass', { t: 0.1 + i * 0.29, gain: 0.05 + 0.03 * ((i * 7) % 3), pitch: 1.5 + ((i * 5) % 7) * 0.12 });
    k.play('chime', { t: 0.3, gain: 0.18, pitch: 1.0, music: true }); k.play('chime', { t: B[1] + 0.3, gain: 0.18, pitch: 1.26, music: true }); k.play('chime', { t: B[2] + 0.3, gain: 0.18, pitch: 1.5, music: true }); k.play('sparkle', { t: B[2] + 0.6, gain: 0.25 });
  },
  // the mirrors: fold the picture into six mirrored wedges; the centre cell is left unfolded
  post: {
    uniforms: { uTurn: { value: 0 } },
    fragment: `
      vec4 postFX(vec2 uv){
        float asp = uRes.x / uRes.y; vec2 p = (uv - 0.5) * vec2(asp, 1.0); float r = length(p), RC = 0.28;
        if (r < RC) return texture2D(tColor, uv);
        float a = atan(p.y, p.x) + uTime * 0.15, sec = 3.14159265 / 3.0; a = mod(a, sec); a = abs(a - sec * 0.5);
        float rr = RC + 0.02 + (r - RC) * 0.62;
        vec2 q = vec2(cos(a), sin(a)) * rr; vec2 suv = 0.5 + q / vec2(asp, 1.0);
        vec3 c = texture2D(tColor, suv).rgb;
        float ring = smoothstep(RC, RC - 0.006, r) + smoothstep(RC, RC + 0.008, r) * smoothstep(RC + 0.016, RC + 0.008, r);
        c = mix(c, vec3(1.6, 1.4, 1.1), ring * 0.8);
        float vig = smoothstep(0.75, 0.35, r); return vec4(c * (0.35 + 0.75 * vig), 1.0);
      }`,
  },
};
