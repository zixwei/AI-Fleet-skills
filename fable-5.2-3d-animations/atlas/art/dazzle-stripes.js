// Art style 93: Dazzle stripes. Inputs D N (depth, normals), and W (world position) to fix the stripes to the surface.
// Bold black and white stripes cover every surface. The world normal snaps to the nearest of 26 directions (cube axes and diagonals);
// the stripes of a patch run across the in-surface direction S = normalize(cross(N snapped, A)), so a flat face has one direction
// and a curved form breaks into patches with different directions. The stripes are slices of the world (dot(P, S)), so they stay on
// the object when the camera orbits. The width of the black part follows the light on the patch. The stripe period scales with uFocus.
window.ARTS = window.ARTS || {};
ARTS['dazzle-stripes'] = {
  id: 'dazzle-stripes', name: 'Dazzle stripes', group: 'The picture is bent', inputs: 'D N',
  labels: 'halo',
  post: {
    normals: true,
    fragment: `
      float h31(vec3 p){ p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.x + p.y) * p.z); }
      vec3 snapN(vec3 n){
        vec3 best = vec3(0.0, 1.0, 0.0); float bd = -2.0;
        for (int k = 0; k < 27; k++) {
          float kf = float(k); vec3 d = vec3(mod(kf, 3.0) - 1.0, mod(floor(kf / 3.0), 3.0) - 1.0, floor(kf / 9.0) - 1.0);
          if (dot(d, d) < 0.5) continue;
          d = normalize(d);
          float s = dot(d, n);
          if (s > bd) { bd = s; best = d; }
        }
        return best;
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float sc = uRes.y / 1080.0;
        if (texture2D(tDepth, uv).x > 0.9999) return vec4(vec3(2.2), 1.0);          // the empty background is blank paper
        vec3 P = worldPos(uv), N = worldNormal(uv);
        vec3 Nq = snapN(N);
        vec3 A = normalize(vec3(0.31, 0.83, 0.47));
        vec3 S = normalize(cross(Nq, A));
        // parallel planes at other distances (a card in front of a wall) turn the stripes by a fixed step, so they do not merge
        float pl = floor(dot(P, Nq) / (uFocus * 0.1));
        float ph = 0.7 * floor(h31(vec3(pl, Nq.x * 5.0 + Nq.y * 9.0 + Nq.z * 13.0, 3.0)) * 3.0);
        S = S * cos(ph) + cross(Nq, S) * sin(ph);
        float period = uFocus * 0.034;
        float f = dot(P, S) / period + 7.0 * h31(Nq * 3.7);
        float light = dot(Nq, normalize(vec3(0.4, 0.8, 0.5)));
        float duty = clamp(0.5 - 0.2 * light, 0.25, 0.75);                          // share of the period that is black
        float fw = clamp(fwidth(f) * 1.2, 0.001, 1.0);
        float t = fract(f);
        float black = clamp((duty * 0.5 - abs(t - 0.5)) / fw + 0.5, 0.0, 1.0);
        black = mix(black, duty, smoothstep(0.4, 0.9, fw));                          // stripes finer than a pixel average out
        // outline: a depth step, or a crease where the normal turns
        float de = 0.0, ne = 0.0, d0 = linDepth(uv);
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * px * 2.5 * sc;
          float dq = texture2D(tDepth, uv + o).x > 0.9999 ? d0 * 3.0 : linDepth(uv + o);
          de = max(de, abs(dq - d0) / d0);
          ne = max(ne, 1.0 - dot(N, worldNormal(uv + o)));
        }
        float line = max(smoothstep(0.015, 0.04, de), smoothstep(0.3, 0.6, ne));
        float ink = max(black, line);
        return vec4(vec3(mix(2.2, 0.0, ink)), 1.0);
      }`,
  },
};
