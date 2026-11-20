// Art style 16: Linocut. Inputs C N (colour, normals).
// One ink colour on cream paper. Dark areas are left uncut (solid ink). Light areas are cut away with gouge marks that follow each surface
// (streaks along the surface tangent); the cut grows with the light. In the cut areas a few ridges stay and print as small flecks.
window.ARTS = window.ARTS || {};
ARTS['linocut'] = {
  id: 'linocut', name: 'Linocut', group: 'The marks follow the surface', inputs: 'C N',
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
      // gouge streaks: noise averaged along the surface (both ways), mapped to 0..1
      float streak(vec2 uv, float cellPx, float reach){
        vec2 px = 1.0 / uRes; float sc = uRes.y / 720.0, cs = cellPx * sc;
        vec3 n0 = nrm(uv); vec2 d0 = turn(n0, DEF);
        float a = h21(floor(uv / px / cs)), ws = 1.0;
        for (int s = 0; s < 2; s++) {
          vec2 p = uv, d = s == 0 ? d0 : -d0; vec3 np = n0, cp = texture2D(tColor, uv).rgb; float alive = 1.0;
          for (int k = 1; k <= 10; k++) {
            p += d * reach * sc * px;
            vec3 nq = nrm(p), cq = texture2D(tColor, p).rgb;
            alive *= step(0.86, dot(nq, np)) * step(length(cq - cp), 0.12 + 0.25 * length(cp));
            np = nq; cp = cq; d = turn(nq, d);
            float w = alive * (1.0 - float(k) / 11.0);
            a += w * h21(floor(p / px / cs)); ws += w;
          }
        }
        return clamp(0.5 + (a / ws - 0.5) * 2.8, 0.0, 1.0);
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        vec3 c0 = texture2D(tColor, uv).rgb, n0 = nrm(uv);
        float g = pow(clamp(lum(c0), 0.0, 1.0), 0.4545);
        float light = smoothstep(0.36, 0.5, g) * 0.5 + smoothstep(0.56, 0.74, g) * 0.5;                 // 0 dark (uncut), 1 light (cut away)
        float v = streak(uv, 3.2, 1.7);
        // gouge marks: a pixel is cut where its streak value is above a threshold that falls as the light grows
        float thr = 1.12 - light * 1.4;
        float cut = smoothstep(thr - 0.05, thr + 0.05, v);
        // flecks: ridges that stay in the cut area (low streak value there)
        float fleck = (1.0 - smoothstep(0.03, 0.07, v)) * smoothstep(0.6, 0.95, light) * step(0.7, h21(floor(fc / (5.0 * sc))));
        float ink = max(1.0 - cut, fleck);
        // carved outline where the normal or the colour jumps
        float e = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * px * 1.6 * sc;
          e = max(e, max(1.0 - dot(n0, nrm(uv + o)), length(texture2D(tColor, uv + o).rgb - c0) * 1.8));
        }
        ink = max(ink, smoothstep(0.3, 0.55, e));
        // ink is a little uneven on the block, and the paper has a grain
        ink *= 0.93 + 0.07 * vn(fc / sc * 0.6);
        ink *= 1.0 - 0.2 * step(0.985, h21(floor(fc / sc) + 3.1));
        vec3 paper = vec3(0.94, 0.9, 0.8) * (0.95 + 0.07 * vn(fc / sc * 0.5));
        vec3 inkC = vec3(0.004, 0.012, 0.045);
        return vec4(mix(paper * 2.2, inkC, clamp(ink, 0.0, 1.0)), 1.0);
      }`,
  },
};
