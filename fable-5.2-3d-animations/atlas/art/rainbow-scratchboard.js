// Art style 15: Rainbow scratchboard. Inputs C N (colour, normals).
// A black coated card. Scratches (thin lines along each surface) cut through the coat on lit surfaces and show a rainbow layer below.
// Brighter surfaces get more scratches; shadow stays black. The rainbow is fixed to the card (diagonal bands).
window.ARTS = window.ARTS || {};
ARTS['rainbow-scratchboard'] = {
  id: 'rainbow-scratchboard', name: 'Rainbow scratchboard', group: 'The marks follow the surface', inputs: 'C N',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      const vec2 DEF = vec2(0.94, 0.34);
      vec3 nrm(vec2 uv){ return texture2D(tNormal, uv).rgb * 2.0 - 1.0; }
      vec2 turn(vec3 n, vec2 ref){
        vec2 t = vec2(-n.y, n.x); float m = length(t);
        t = m > 1e-4 ? t / m : ref;
        if (dot(t, ref) < 0.0) t = -t;
        return normalize(mix(ref, t, smoothstep(0.05, 0.35, m)));
      }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      // thin scratch lines: 1 pixel noise averaged along the surface
      float streak(vec2 uv, float reach){
        vec2 px = 1.0 / uRes; float sc = uRes.y / 720.0, cs = 1.5 * sc;
        vec3 n0 = nrm(uv); vec2 d0 = turn(n0, DEF);
        float a = h21(floor(uv / px / cs)), ws = 1.0;
        for (int s = 0; s < 2; s++) {
          vec2 p = uv, d = s == 0 ? d0 : -d0; vec3 np = n0, cp = texture2D(tColor, uv).rgb; float alive = 1.0;
          for (int k = 1; k <= 14; k++) {
            p += d * reach * sc * px;
            vec3 nq = nrm(p), cq = texture2D(tColor, p).rgb;
            alive *= step(0.86, dot(nq, np)) * step(length(cq - cp), 0.12 + 0.25 * length(cp));
            np = nq; cp = cq; d = turn(nq, d);
            float w = alive * (1.0 - float(k) / 15.0);
            a += w * h21(floor(p / px / cs)); ws += w;
          }
        }
        return clamp(0.5 + (a / ws - 0.5) * 3.2, 0.0, 1.0);
      }
      vec4 postFX(vec2 uv){
        vec2 fc = uv * uRes; float sc = uRes.y / 720.0;
        vec3 c0 = texture2D(tColor, uv).rgb, n0 = nrm(uv);
        float surf = step(abs(length(n0) - 1.0), 0.07);         // the backdrop is not a surface: it has no unit normal
        float g = pow(clamp(lum(c0), 0.0, 1.0), 0.4545);
        float lit = pow(smoothstep(0.15, 0.95, g), 1.6) * surf;
        float v = streak(uv, 0.75);
        float thr = 0.94 - lit * 0.42;
        float scr = smoothstep(thr - 0.04, thr + 0.03, v) * step(0.001, lit);
        // card and form borders stay black: no scratch where the normal or the colour jumps
        float ed = 0.0; vec2 pxx = 1.0 / uRes;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * pxx * 2.0 * sc;
          ed = max(ed, max(1.0 - dot(n0, nrm(uv + o)), length(texture2D(tColor, uv + o).rgb - c0) * 1.5));
        }
        scr *= 1.0 - smoothstep(0.12, 0.3, ed);
        // rainbow layer under the coat: diagonal bands, slightly warped
        float hue = fract(dot(fc / (uRes.y), vec2(0.9, 0.55)) * 1.1 + 0.25 * vn(fc / sc * 0.01));
        vec3 rb = 0.55 + 0.5 * cos(6.2832 * (hue + vec3(0.0, 0.3333, 0.6667)));
        rb = pow(clamp(rb, 0.0, 1.0), vec3(1.6)) * 1.7;
        vec3 coat = vec3(0.012, 0.012, 0.016) * (0.8 + 0.4 * vn(fc / sc * 0.7));
        // a few scratch ends are brighter where the blade pressed harder
        scr *= 0.8 + 0.2 * vn(fc / sc * 0.12);
        return vec4(mix(coat, rb, clamp(scr, 0.0, 1.0)), 1.0);
      }`,
  },
};
