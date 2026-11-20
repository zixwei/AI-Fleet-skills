// Art style 2: Ink in water. Inputs C D B (colour, depth, beat times).
// The frame is a tank of clear water. At each beat the picture loosens into ink clouds that curl, then settle back into the shapes.
window.ARTS = window.ARTS || {};
ARTS['ink-in-water'] = {
  id: 'ink-in-water', name: 'Ink in water', group: 'The medium changes with time', inputs: 'C D B',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      // curl of a noise field: a flow with no sources, so the ink swirls and does not just spread
      vec2 curl(vec2 p){ float e = 0.6;
        return vec2(fbm(p + vec2(0.0, e)) - fbm(p - vec2(0.0, e)), fbm(p - vec2(e, 0.0)) - fbm(p + vec2(e, 0.0))); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float age = beatAge();
        // loose: 0 settled, 1 fully loosened. It rises over 0.9 s after the beat and the ink settles back by 2.4 s.
        float loose = smoothstep(0.0, 0.9, age) * (1.0 - smoothstep(1.1, 2.4, age));
        float d0 = min(linDepth(uv), uFocus * 3.0) / uFocus;
        float near = 0.55 + 0.9 * smoothstep(1.5, 0.6, d0);   // near ink travels further
        float A = loose * 115.0 * near;
        // three turns of the flow: each one works on the result of the one before (clouds that curl)
        vec2 p = fc;
        float tt = age * 0.22 + 3.0 * floor(uCanon / 2.5);   // each beat has its own cloud pattern
        for (int k = 0; k < 3; k++) p += curl(p * (0.0045 + 0.0055 * float(k)) + tt + float(k) * 9.3) * A * (1.0 - 0.28 * float(k));
        // soft ink edge: a small feather, wider while loose
        float R = 3.2 + 22.0 * loose;
        vec3 acc = vec3(0.0);
        for (int i = 0; i < 18; i++) {
          float a = float(i) * 2.39996 + h21(fc) * 0.8, r = sqrt((float(i) + 0.5) / 18.0) * R;
          acc += texture2D(tColor, (p + vec2(cos(a), sin(a)) * r) * px).rgb;
        }
        vec3 c = acc / 18.0;
        float L = lum(c);
        c = mix(vec3(L), c, 1.45);
        // ink density: uneven in the clouds, pooled darker along the settled shapes
        float dens = 1.22 + (0.18 + 0.55 * loose) * (fbm(p * 0.012 + 5.0) - 0.5);
        vec3 T = pow(clamp(c / 0.85, 0.0, 1.0), vec3(1.15 * dens));
        // thin ink tints the water: pale tones fade to clear water
        T = mix(T, vec3(1.0), smoothstep(0.7, 1.0, L) * 0.85);
        // ink is a dye: a blue-green cast, and it pools darker along the edges of a shape
        T *= mix(vec3(1.0), vec3(0.86, 0.96, 1.0), 0.6);
        float pl = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * 3.0;
          pl = max(pl, length(texture2D(tColor, (p + o) * px).rgb - texture2D(tColor, p * px).rgb));
        }
        T *= 1.0 - 0.35 * smoothstep(0.08, 0.4, pl) * (1.0 - 0.5 * loose);
        // the tank: clear water, deeper blue-green toward the bottom, drifting light
        float y = uv.y;
        vec3 water = mix(vec3(0.50, 0.76, 0.84), vec3(0.18, 0.44, 0.58), pow(1.0 - y, 1.5) * 0.9);
        float cau = pow(1.0 - abs(fbm(fc * 0.012 + vec2(uTime * 0.12, 0.0)) - 0.5) * 2.0, 7.0);
        water += 0.08 * cau * y;
        vec3 col = water * min(T * 1.45, vec3(1.35));
        // the glass: a green edge, a bright inner line, and a bright water line 5 % below the top
        vec2 e = min(fc, uRes - fc);
        float edge = min(e.x, e.y);
        col *= 1.0 - 0.7 * smoothstep(46.0, 0.0, edge);
        col += vec3(0.6, 1.0, 0.95) * 0.5 * smoothstep(4.0, 0.0, abs(edge - 40.0));
        float sy = (1.0 - y) * uRes.y - 0.05 * uRes.y;                  // pixels below the surface line
        float wob = (fbm(vec2(fc.x * 0.02, uTime * 0.3)) - 0.5) * 3.0;
        col = sy < wob ? mix(col, vec3(0.78, 0.84, 0.86), 0.6) : col;
        col += vec3(1.0) * 0.9 * smoothstep(4.0, 0.0, abs(sy - wob)) + vec3(0.3, 0.5, 0.55) * smoothstep(40.0, 0.0, sy - wob) * step(wob, sy) * 0.3;
        return vec4(col, 1.0);
      }`,
  },
};
