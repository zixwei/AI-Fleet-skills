// Art style 19: Fixed pointillism. Inputs C W (colour, world position).
// Dots of pure colour on a pale canvas. The dots sit on a jittered 3D lattice in the world: a dot is the part of a small sphere that the surface cuts,
// so it is fixed to a point on the object and does not slide over the picture when the camera moves; its size changes with the cut and with distance.
// Each dot takes one colour, read at the screen position of its centre (the local colour if that point is on another surface).
// A second, finer lattice fills the gaps with smaller dots. The backdrop gets dots on a screen grid.
window.ARTS = window.ARTS || {};
ARTS['fixed-pointillism'] = {
  id: 'fixed-pointillism', name: 'Fixed pointillism', group: 'The marks follow the surface', inputs: 'C W',
  post: {
    uniforms: { uCell: { value: 0.12 } },   // world units between lattice cells (coarse layer)
    fragment: `
      uniform float uCell;
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      vec3 h31(vec3 p){ p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      // nearest dot of a layer: x = distance / radius (below 1 = inside), yzw = the centre
      vec4 dotLayer(vec3 P, float cell, vec3 shift){
        vec3 q = P / cell + shift, b = floor(q); vec4 best = vec4(9.0, 0.0, 0.0, 0.0);
        for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) for (int k = -1; k <= 1; k++) {
          vec3 cI = b + vec3(float(i), float(j), float(k));
          vec3 r = h31(cI + shift * 17.0);
          vec3 ctr = cI + 0.5 + (r - 0.5) * 0.6;
          float rad = 0.46 + 0.2 * fract(r.x * 7.3 + r.y * 3.1);
          float m = length(q - ctr) / rad;
          if (m < best.x) best = vec4(m, (ctr - shift) * cell);
        }
        return best;
      }
      vec3 pure(vec3 c, float j){
        float L = lum(c);
        c = max(mix(vec3(L), c, 2.8), 0.0);                       // push towards the pure hue
        c *= min(1.0, 1.1 / max(max(c.r, max(c.g, c.b)), 1e-3));   // pale scene colours become saturated, not white
        return c * (0.8 + 0.3 * j);
      }
      vec4 postFX(vec2 uv){
        vec2 fc = uv * uRes; float sc = uRes.y / 720.0;
        vec3 canvas = vec3(0.94, 0.91, 0.84) * 2.0;
        float far = step(0.9999, texture2D(tDepth, uv).x);
        vec3 col = canvas; float cover = 0.0;
        if (far > 0.5) {
          // backdrop: dots on a screen grid (the backdrop has no surface)
          float cell = 11.0 * sc; vec2 b = floor(fc / cell); float best = 9.0; vec2 bc = vec2(0.0);
          for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) {
            vec2 cI = b + vec2(float(i), float(j));
            vec2 ctr = (cI + 0.5 + (vec2(h21(cI), h21(cI + 4.7)) - 0.5) * 0.5) * cell;
            float m = length(fc - ctr) / (cell * (0.42 + 0.1 * h21(cI + 9.1)));
            if (m < best) { best = m; bc = ctr; }
          }
          cover = 1.0 - smoothstep(0.88, 1.0, best);
          col = pure(texture2D(tColor, bc / uRes).rgb, h21(floor(bc / cell)));
        } else {
          vec3 P = worldPos(uv);
          float dpx = length(fwidth(P)) / uCell;                  // pixel size in lattice units
          vec4 a = dotLayer(P, uCell, vec3(0.0));
          vec4 f2 = dotLayer(P, uCell * 0.62, vec3(0.31, 0.57, 0.13));
          float ma = a.x, mf = f2.x;
          vec4 pick = ma < 1.0 ? a : f2;
          float m = ma < 1.0 ? ma : mf;
          float aa = clamp(dpx / (ma < 1.0 ? 0.5 : 0.31), 0.02, 0.6);
          cover = 1.0 - smoothstep(1.0 - aa, 1.0, m);
          // colour at the dot centre: project the centre to the screen; keep the local colour if the centre is on another surface
          vec4 cc = inverse(uProjInv) * (inverse(uViewInv) * vec4(pick.yzw, 1.0));
          vec2 quv = cc.xy / cc.w * 0.5 + 0.5;
          vec3 sc0 = texture2D(tColor, uv).rgb, scc = texture2D(tColor, quv).rgb;
          bool onSurf = quv.x > 0.0 && quv.x < 1.0 && quv.y > 0.0 && quv.y < 1.0 && length(worldPos(quv) - pick.yzw) < 0.35 * uCell * 2.0;
          vec3 base = onSurf ? scc : sc0;
          col = pure(base, h21(floor(pick.yz * 97.0) + pick.w));
          // a dot is slightly lighter in the middle (a touch of oil paint)
          col *= 1.0 + 0.12 * (1.0 - m);
          // far away, where a cell is under 3 pixels, the dots cannot be resolved: they blend to the local pure colour
          float tiny = smoothstep(0.25, 0.5, dpx);
          cover = mix(cover, 1.0, tiny); col = mix(col, pure(sc0, 0.5), tiny);
        }
        return vec4(mix(canvas * (0.97 + 0.05 * h21(floor(fc / sc))), col, clamp(cover, 0.0, 1.0)), 1.0);
      }`,
  },
};
