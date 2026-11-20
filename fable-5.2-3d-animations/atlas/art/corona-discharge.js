// Art style 40: Corona discharge. Input D (depth).
// A black background. Every depth edge (an object against what lies behind it) carries a violet electric fringe on the far side,
// with short thin filaments that flare out, flicker and move. The objects themselves are almost black, with a faint depth tone.
window.ARTS = window.ARTS || {};
ARTS['corona-discharge'] = {
  id: 'corona-discharge', name: 'Corona discharge', group: 'Light makes the picture', inputs: 'D',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float ld(vec2 uv){ return log(min(linDepth(uv), uFocus * 4.0) / uFocus); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float l0 = ld(uv);
        // nearest nearer surface within 30 px: its distance and direction. Only the far side of an edge glows.
        // local log-depth slope per pixel (the smaller side, so an edge does not count): a floor at a grazing angle is not an edge
        float gxl = ld(uv - vec2(2.0 * px.x, 0.0)) - l0, gxr = ld(uv + vec2(2.0 * px.x, 0.0)) - l0, gyu = ld(uv + vec2(0.0, 2.0 * px.y)) - l0, gyd = ld(uv - vec2(0.0, 2.0 * px.y)) - l0;
        vec2 gs = 0.5 * vec2(abs(gxr) < abs(gxl) ? gxr : -gxl, abs(gyu) < abs(gyd) ? gyu : -gyd);
        float best = 99.0; vec2 bdir = vec2(0.0, 1.0); vec2 vsum = vec2(0.0);
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.7854;
          vec2 dir = vec2(cos(a), sin(a));
          float prev = 0.0;
          for (int k = 0; k < 8; k++) {
            float r = 2.2 * pow(1.5, float(k));
            float dl = ld(uv + dir * r * px) - l0 - dot(gs, dir) * r;
            if (dl < -(0.06 + 0.6 * length(gs) * r)) {
              float lo = prev, hi = r;                                     // the edge lies in [prev, r]: halve the interval 3 times
              for (int b = 0; b < 3; b++) { float mid = 0.5 * (lo + hi); if (ld(uv + dir * mid * px) - l0 - dot(gs, dir) * mid < -(0.06 + 0.6 * length(gs) * mid)) hi = mid; else lo = mid; }
              float rr = 0.5 * (lo + hi); if (rr < best) { best = rr; bdir = dir; } vsum += dir * (1.0 - r / 44.0); break; }
            prev = r;
          }
        }
        vec3 col = vec3(0.002, 0.002, 0.005) + vec3(0.008, 0.007, 0.018) * (1.0 - clamp(l0 + 0.4, 0.0, 1.0));
        if (best < 90.0) {
          vec2 nrm = length(vsum) > 0.001 ? normalize(vsum) : bdir;         // toward the object
          float qa = floor(atan(nrm.y, nrm.x) / 0.2618 + 0.5) * 0.2618;     // direction in steps of 15 degrees: a steady coordinate
          vec2 tg = vec2(-sin(qa), cos(qa));
          float s = dot(fc - floor(fc / 128.0) * 128.0, tg);                // position along the edge, measured from a local origin
          float flick = 0.6 + 0.4 * sin(uTime * 17.0 + 40.0 * h21(floor(vec2(s * 0.09, 3.0))));
          // fringe: tight and bright at the edge
          float fringe = exp(-best / 2.6);
          // filaments: each has its own length and flicker, thin across the edge
          float cellId = floor(s / 7.0);
          float seed = h21(vec2(cellId, floor(uTime * 9.0 + cellId * 0.37)));   // a new streamer pattern ~9 times a second
          float len = 7.0 + 34.0 * pow(h21(vec2(cellId, 5.0)) * (0.4 + 0.8 * seed), 1.4);
          float across = abs(fract(s / 7.0) - 0.5 + 0.2 * (vn(vec2(best * 0.15, cellId)) - 0.5));
          float thin = 1.0 - smoothstep(0.0, 0.13, across);
          float fil = thin * (1.0 - smoothstep(0.0, len, best + 3.0 * vn(vec2(s * 0.2, uTime * 6.0))));
          vec3 violet = vec3(0.52, 0.22, 1.0);
          vec3 core = vec3(0.85, 0.75, 1.0);
          float glow = 1.3 * fringe + 3.0 * fil * flick;
          col += mix(violet, core, clamp(fringe * 1.2, 0.0, 1.0)) * glow;
          col += violet * 0.3 * exp(-best / 9.0);
        }
        return vec4(col * 1.6, 1.0);
      }`,
  },
};
