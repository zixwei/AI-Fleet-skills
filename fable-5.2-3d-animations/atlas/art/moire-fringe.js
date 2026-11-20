// Art style 27: Moire fringe. Input D (depth).
// Two fine line gratings of black ink on paper. The second grating is shifted sideways by the depth, so a fringe is dark where the
// lines of the two gratings interleave and light where they coincide. The fringes are level lines of depth: contour bands on each form.
// The bands move when the depth of a surface changes (camera or object move). Depth is the distance from the camera, in units of the focus distance.
window.ARTS = window.ARTS || {};
ARTS['moire-fringe'] = {
  id: 'moire-fringe', name: 'Moiré fringe', group: 'The depth is the material', inputs: 'D',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      // coverage of an ink line grating: x in grating periods, duty = ink share of a period
      float grating(float x, float duty){
        float fw = clamp(fwidth(x), 0.001, 1.0), d = abs(fract(x) - 0.5);
        float ink = clamp((duty * 0.5 - d) / fw + 0.5, 0.0, 1.0);
        return mix(ink, duty, smoothstep(0.4, 0.9, fw));   // finer than a pixel: grey
      }
      vec4 postFX(vec2 uv){
        vec2 fc = uv * uRes;
        float S = uRes.y / 1080.0;
        float period = 7.0 * S;                              // pixels
        // distance along the view ray (not the depth along the axis), so a flat card facing the camera still has a depth gradient and shows fringes
        vec2 tn = (uv * 2.0 - 1.0) * vec2(uProjInv[0][0], uProjInv[1][1]);
        float d = texture2D(tDepth, uv).x > 0.9999 ? 4.0 : min(linDepth(uv) * (1.0 + 14.0 * (sqrt(1.0 + dot(tn, tn)) - 1.0)) / uFocus, 4.0);
        float bands = 5.0;                                  // fringes for each focus distance of depth
        // grating A is fixed. grating B is shifted by the depth: bands * d periods. A small tilt gives the empty sky slow fringes.
        float xa = fc.x / period;
        float xb = fc.x / period + bands * d + fc.y * 0.0055;
        float ink = 1.0 - (1.0 - grating(xa, 0.42)) * (1.0 - grating(xb, 0.42));
        vec3 paper = vec3(0.95, 0.93, 0.88) * (0.97 + 0.04 * h21(floor(fc / 2.0)));
        vec3 inkCol = vec3(0.012, 0.016, 0.03);
        vec3 col = mix(paper * 2.0, inkCol, clamp(ink, 0.0, 1.0));
        return vec4(col, 1.0);
      }`,
  },
};
