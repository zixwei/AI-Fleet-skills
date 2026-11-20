// Art style 20: Flow-field strokes. Inputs C D N (colour, depth, normals).
// Short curved strokes. On objects the flow follows the surface (the screen tangent of the normal). In the background the flow is a swirl:
// a curl of noise plus a circulation around the objects (taken from where depth shows nearby objects), so the strokes flow around them.
// A stroke is a stretch of one streamline; it takes the colour at its centre, and each stroke has its own tone.
window.ARTS = window.ARTS || {};
ARTS['flow-field-strokes'] = {
  id: 'flow-field-strokes', name: 'Flow-field strokes', group: 'The marks follow the surface', inputs: 'C D N',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      const vec2 DEF = vec2(0.94, 0.34);
      vec3 nrm(vec2 uv){ return texture2D(tNormal, uv).rgb * 2.0 - 1.0; }
      float isObj(vec2 uv){ return 1.0 - step(0.9999, texture2D(tDepth, uv).x); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      vec2 turn(vec3 n, vec2 ref){
        vec2 t = vec2(-n.y, n.x); float m = length(t);
        t = m > 1e-4 ? t / m : ref;
        if (dot(t, ref) < 0.0) t = -t;
        return normalize(mix(ref, t, smoothstep(0.05, 0.35, m)));
      }
      // background field: curl of a noise potential, in virtual pixels
      vec2 curl(vec2 fv){
        vec2 q = fv * 0.012; float e = 0.05;
        float dx = vn(q + vec2(e, 0.0)) - vn(q - vec2(e, 0.0)), dy = vn(q + vec2(0.0, e)) - vn(q - vec2(0.0, e));
        return vec2(dy, -dx) / (2.0 * e);
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        // circulation around objects: g points from this pixel to the nearby objects (two rings), perpendicular to it is the way around
        vec2 g = vec2(0.0);
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.7854;
          vec2 e = vec2(cos(a), sin(a));
          g += e * (isObj(uv + e * 30.0 * sc * px) + 0.8 * isObj(uv + e * 75.0 * sc * px));
        }
        float gm = length(g);
        vec2 around = gm > 0.2 ? vec2(-g.y, g.x) / gm : vec2(0.0);
        float aw = smoothstep(0.2, 2.0, gm);
        float obj0 = isObj(uv);
        vec3 n0 = nrm(uv); float d00 = dd(uv);
        vec2 dir0 = obj0 > 0.5 ? turn(n0, DEF) : normalize(curl(fc / sc) * 0.8 + around * aw * 1.6 + 0.001);
        float cw = 8.0 * sc, stp = 1.7 * sc;
        vec2 c0 = floor(fc / cw); float best = h21(c0 + 7.3); vec2 wuv = (c0 + 0.5) * cw * px;
        float acc = h21(floor(fc / (1.8 * sc))), ws = 1.0;
        for (int s = 0; s < 2; s++) {
          vec2 p = uv, d = s == 0 ? dir0 : -dir0; vec3 np = n0; float dp = d00, alive = 1.0;
          for (int k = 1; k <= 9; k++) {
            p += d * stp * px;
            float o = isObj(p); vec3 nq = nrm(p); float dq = dd(p);
            // a stroke stays on one kind of surface: it stops at depth edges and at a change of normal
            alive *= step(abs(o - obj0), 0.5) * step(abs(dq - dp) / dp, 0.05) * (obj0 > 0.5 ? step(0.88, dot(nq, np)) : 1.0);
            np = nq; dp = dq;
            vec2 nd = obj0 > 0.5 ? turn(nq, d) : normalize(curl(p * uRes / sc) * 0.8 + around * aw * 1.6 + 0.001);
            d = dot(nd, d) < 0.0 ? -nd : nd;
            float w = alive * (1.0 - float(k) / 10.0);
            acc += w * h21(floor(p * uRes / (1.8 * sc))); ws += w;
            vec2 c = floor(p * uRes / cw); float hh = h21(c + 7.3);
            if (alive > 0.5 && hh > best) { best = hh; wuv = (c + 0.5) * cw * px; }
          }
        }
        float hid = fract(best * 37.1);
        vec3 base = mix(texture2D(tColor, uv).rgb, texture2D(tColor, wuv).rgb, 0.75);
        float L = dot(base, vec3(0.2126, 0.7152, 0.0722));
        base = max(mix(vec3(L), base, 1.3), 0.0);
        float bristle = clamp(0.5 + (acc / ws - 0.5) * 3.0, 0.0, 1.0);
        // each stroke: its own tone, and a thin darker seam where one stroke gives way to the next (the winner cell changes)
        float tone = 0.78 + 0.4 * hid;
        vec3 col = base * tone * (0.88 + 0.24 * bristle);
        return vec4(col, 1.0);
      }`,
  },
};
