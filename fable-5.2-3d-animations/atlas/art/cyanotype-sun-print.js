// Art style 4: Cyanotype sun print. Inputs D B W (depth, beat times, world position and normal). It does not read the scene colour.
// The paper changes from yellow-green to deep blue during each beat. Objects stay white, like things laid on the paper. Near objects have sharp edges.
window.ARTS = window.ARTS || {};
ARTS['cyanotype-sun-print'] = {
  id: 'cyanotype-sun-print', name: 'Cyanotype sun print', group: 'The medium changes with time', inputs: 'D B W',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      // depth as a multiple of the distance to the look target; the empty background is 9
      float dr(vec2 uv){ return texture2D(tDepth, uv).x > 0.9999 ? 9.0 : linDepth(uv) / uFocus; }
      // an object is anything nearer than 1.2 times the focus distance (the far wall and the sky are the paper)
      float obj(vec2 uv){ return 1.0 - smoothstep(1.12, 1.28, dr(uv)); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        // exposure goes from 0 to 1 across the beat interval. The last beat has no next beat: it reuses the length of the one before.
        float k = beatIdx(), t0 = 0.0, t1 = 2.5, prevT = 0.0;
        for (int i = 0; i < 8; i++) {
          if (i >= uBeatN) break;
          if (float(i) == k) { t0 = uBeats[i]; t1 = (i + 1 < uBeatN) ? uBeats[i + 1] : uBeats[i] + (i > 0 ? uBeats[i] - prevT : 2.5); }
          prevT = uBeats[i];
        }
        float p = clamp((uCanon - t0) / max(t1 - t0, 0.01), 0.0, 1.0);
        // the paper colour: sensitiser yellow-green, then through blue-grey to deep Prussian blue
        vec3 yg = vec3(0.50, 0.55, 0.10), mid = vec3(0.07, 0.30, 0.34), blue = vec3(0.004, 0.026, 0.12);
        float e1 = smoothstep(0.0, 0.55, p), e2 = smoothstep(0.35, 1.0, p);
        vec3 paperC = mix(mix(yg, mid, e1), blue, e2);
        // brushed coating: streaks, and an uneven rough edge where the coating stops
        float streak = fbm(vec2(fc.x * 0.004, fc.y * 0.07) + 3.0);
        paperC *= 0.88 + 0.24 * streak;
        paperC *= 0.92 + 0.12 * fbm(fc * 0.02);
        // objects: a mask. The paper is the far plane: an object close to it (far from the camera) has a sharp edge, one raised toward the camera has a soft edge.
        float d0 = min(dr(uv), 3.0);
        float R = mix(16.0, 0.8, smoothstep(0.7, 1.25, d0));
        float m = 0.0, edge = 0.0;
        for (int i = 0; i < 12; i++) {
          float a = float(i) * 2.39996 + h21(fc) * 0.4, r = sqrt((float(i) + 0.5) / 12.0) * R;
          m += obj(uv + vec2(cos(a), sin(a)) * r * px);
        }
        m /= 12.0;
        m = smoothstep(0.35, 0.65, m);
        // lifted: something farther lies within 160 px (a depth step of 8 % or more). It only sets how white an object is; it never cuts the mask.
        float far = 0.0;
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 2.39996, r = 30.0 + 130.0 * float(i) / 7.0;
          float ds = dr(uv + vec2(cos(a), sin(a)) * r * px);
          far += step(d0 * 1.08, ds) * step(ds, 3.0);   // empty sky does not count: only another surface farther away
        }
        float lift = smoothstep(0.0, 0.18, far / 8.0 - 0.02);
        // lines where an object overlaps another one: a thin blue line on the white
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * px * 1.6;
          edge = max(edge, abs(min(dr(uv + o), 3.0) - d0) / max(d0, 0.2));
        }
        float inner = smoothstep(0.012, 0.05, edge) * m;
        // white objects: the nearer part is pure white; the part farther from the camera (closer to the paper) takes a pale blue, in 5 steps
        float band = floor(smoothstep(0.8, 1.2, d0) * 4.0 + 0.5) / 4.0;
        vec3 white = mix(vec3(0.92, 0.95, 0.96), vec3(0.20, 0.42, 0.62) * (0.55 + 0.45 * e2) + paperC * 0.5, band * 0.35);
        white = mix(white, vec3(0.04, 0.16, 0.34), inner * 0.95);
        // raised things are white; flat ground that only recedes is left half way to the blue paper. The mask m itself is never cut by lift, so no holes.
        white = mix(mix(white, paperC * 1.15 + 0.08, 0.75), white, mix(0.3, 1.0, lift));
        // ground: up-facing surfaces within 0.06 of the focus distance above the lowest up-facing surface found by 6 fixed taps. It is the exposed paper.
        float gy = 1e3;
        for (int i = 0; i < 6; i++) {
          vec2 tp = vec2(i < 3 ? 0.15 + 0.35 * float(i) : 0.15 + 0.35 * float(i - 3), i < 3 ? 0.12 : 0.35);
          if (texture2D(tDepth, tp).x < 0.9999 && worldNormal(tp).y > 0.92) gy = min(gy, worldPos(tp).y);
        }
        float ground = 0.0;
        if (gy < 1e2 && texture2D(tDepth, uv).x < 0.9999) {
          ground = smoothstep(0.88, 0.94, worldNormal(uv).y) * (1.0 - smoothstep(0.045, 0.075, (worldPos(uv).y - gy) / uFocus));
        }
        white = mix(white, paperC * 1.05, ground);
        vec3 col = mix(paperC, white, m);
        // the dark side of a print is dense: a little tooth over everything
        col *= 0.94 + 0.12 * vn(fc * 0.7);
        // unexposed margin: the coating stops with a rough, white edge
        vec2 ed = min(fc, uRes - fc);
        float rough = (fbm(fc * 0.03) - 0.5) * 28.0;
        float inside = smoothstep(0.0, 6.0, min(ed.x, ed.y) - 26.0 - rough);
        col = mix(vec3(0.82, 0.84, 0.80), col, inside);
        return vec4(col, 1.0);
      }`,
  },
};
