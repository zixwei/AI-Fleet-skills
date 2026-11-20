// Art style 44: Structured light. Input D (depth).
// A projector beside the camera puts fine vertical stripes on a dark scene. The stripe index of a point is its screen x plus a shift that is
// proportional to 1 / depth (the projector baseline), so the stripes bend over each form and jump at each depth step. Brightness follows the
// angle of the surface to the beam (from the depth slope) and falls with distance.
window.ARTS = window.ARTS || {};
ARTS['structured-light'] = {
  id: 'structured-light', name: 'Structured light', group: 'An instrument sees the scene', inputs: 'D',
  labels: 'halo',
  post: {
    uniforms: { uPeriod: { value: 14.0 }, uBase: { value: 190.0 } },   // stripe period in pixels; shift in pixels at the focus distance
    fragment: `
      uniform float uPeriod, uBase;
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float raw = texture2D(tDepth, uv).x;
        vec3 bg = vec3(0.006, 0.008, 0.014) * (1.0 + 0.5 * h21(fc));
        if (raw > 0.9999) return vec4(bg, 1.0);
        float z = linDepth(uv);
        // surface slope from the depth of the neighbours (a unit step in x or y, in units of the depth)
        float zx = 0.5 * (linDepth(uv + vec2(px.x, 0.0)) - linDepth(uv - vec2(px.x, 0.0)));
        float zy = 0.5 * (linDepth(uv + vec2(0.0, px.y)) - linDepth(uv - vec2(0.0, px.y)));
        float k = z * 0.0005;                      // world size of one pixel at this depth (fov 30 degrees, 1080 rows)
        vec2 g = vec2(zx, zy) / max(k * 2.0, 1e-5);
        float facing = 1.0 / sqrt(1.0 + dot(g, g));
        // stripe index: screen x plus the projector shift. Near points shift more.
        float s = (fc.x + uBase * uFocus / z) / uPeriod;
        float fw = clamp(fwidth(s), 0.001, 1.0);
        float d = abs(fract(s) - 0.5);
        float line = clamp((0.13 - d) / fw + 0.5, 0.0, 1.0);          // bright for 26 percent of the period
        line = mix(line, 0.26, smoothstep(0.35, 0.9, fw));             // finer than a pixel: an average
        // a depth jump: the stripe index changes by more than half a period between neighbours, so the stripe is cut there
        float jump = 0.0;
        for (int i = 0; i < 2; i++) {
          float sg = i == 0 ? 1.0 : -1.0;
          float z2 = linDepth(uv + vec2(sg * 2.0 * px.x, 0.0));
          jump = max(jump, abs(uBase * uFocus * (1.0 / z - 1.0 / z2)) / uPeriod);
        }
        float r = z / uFocus;
        float lit = facing * facing / (0.25 + 0.75 * r * r * r);
        float beamFall = smoothstep(1.15, 0.25, length((uv - vec2(0.5, 0.55)) * vec2(1.15, 1.0)));   // the beam spreads from the projector
        float spec = pow(clamp(facing, 0.0, 1.0), 6.0) * 0.35;
        float I = line * (lit + spec);
        I *= 1.0 - 0.5 * smoothstep(0.4, 1.2, jump);                     // the stripe is dimmer at the cut
        vec3 beam = vec3(0.78, 0.9, 1.0);
        float amb = 0.012 * facing;                                      // a faint trace of the surface between the stripes
        vec3 col = beam * (I * 0.8 * beamFall + amb) + bg;
        return vec4(col, 1.0);
      }`,
  },
};
