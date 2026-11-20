// Art style 17: Sumi-e ink wash. Inputs D N (depth, normals).
// Few strokes for each object. One full brush stroke runs along the silhouette (depth edge, on the nearer side, width and pressure vary).
// Dry-brush streaks run along the form on the side away from a light at the upper left (bundles of fine lines with gaps). The rest is empty paper.
window.ARTS = window.ARTS || {};
ARTS['sumi-e-ink-wash'] = {
  id: 'sumi-e-ink-wash', name: 'Sumi-e ink wash', group: 'The marks follow the surface', inputs: 'D N',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      const vec2 DEF = vec2(0.94, 0.34);
      vec3 nrm(vec2 uv){ return texture2D(tNormal, uv).rgb * 2.0 - 1.0; }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      vec2 turn(vec3 n, vec2 ref){
        vec2 t = vec2(-n.y, n.x); float m = length(t);
        t = m > 1e-4 ? t / m : ref;
        if (dot(t, ref) < 0.0) t = -t;
        return normalize(mix(ref, t, smoothstep(0.05, 0.35, m)));
      }
      // noise averaged along the surface tangent (stops at depth and normal edges): streaks
      float streak(vec2 uv, float cellPx, float reach, float gain){
        vec2 px = 1.0 / uRes; float sc = uRes.y / 720.0, cs = cellPx * sc;
        vec3 n0 = nrm(uv); vec2 d0 = turn(n0, DEF);
        float a = h21(floor(uv / px / cs)), ws = 1.0;
        for (int s = 0; s < 2; s++) {
          vec2 p = uv, d = s == 0 ? d0 : -d0; vec3 np = n0; float dp = dd(uv), alive = 1.0;
          for (int k = 1; k <= 10; k++) {
            p += d * reach * sc * px;
            vec3 nq = nrm(p); float dq = dd(p);
            alive *= step(0.86, dot(nq, np)) * step(abs(dq - dp) / dp, 0.04);
            np = nq; dp = dq; d = turn(nq, d);
            float w = alive * (1.0 - float(k) / 11.0);
            a += w * h21(floor(p / px / cs)); ws += w;
          }
        }
        return clamp(0.5 + (a / ws - 0.5) * gain, 0.0, 1.0);
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0; vec2 fv = fc / sc;
        float far = step(0.9999, texture2D(tDepth, uv).x);
        float d0 = dd(uv);
        // silhouette stroke: the nearer side of every depth edge, width follows a slow pressure noise
        float width = (3.0 + 5.0 * vn(fv * 0.03 + 11.0)) * sc;
        float rmin = 99.0;
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.7854 + 0.3;
          for (int j = 1; j <= 6; j++) {
            float r = float(j) * 1.35 * sc;
            vec2 q = uv + vec2(cos(a), sin(a)) * r * px; float dq = dd(q);
            if (dq > d0 * (1.02 + 0.002 * r)) rmin = min(rmin, r);
            else if (r < width * 0.6 && dq > d0 * 1.003 && dot(nrm(q), nrm(uv)) < 0.5) rmin = min(rmin, r * 1.6);   // contact edges: a base or a corner
          }
        }
        float sil = (1.0 - smoothstep(width - 1.0, width + 0.7, rmin)) * (1.0 - far);
        // brush hairs: dry gaps, more at the thin end of the pressure
        float hair = vn(fv * vec2(0.9, 0.9)) * 0.6 + vn(fv * 0.31) * 0.4;
        sil *= smoothstep(0.12, 0.38, hair + 0.55 * (width / sc - 3.0) / 5.0);
        sil *= 0.82 + 0.18 * vn(fv * 0.12);
        // dry-brush streaks along the form where the surface faces away from the light
        vec3 n0 = nrm(uv);
        float ndl = dot(n0, normalize(vec3(-0.5, 0.6, 0.62)));
        float shade = smoothstep(0.7, 0.05, ndl) * (1.0 - far);
        float fine = streak(uv, 1.7, 0.9, 3.0);
        float bundle = streak(uv, 12.0, 1.8, 3.0);
        float dry = shade * smoothstep(0.3, 0.75, bundle) * smoothstep(0.5 - 0.35 * shade, 0.75 - 0.35 * shade, fine);
        float ink = max(sil, dry);
        vec3 paper = vec3(0.95, 0.925, 0.86) * (0.95 + 0.07 * vn(fv * vec2(0.4, 1.3)) + 0.03 * vn(fv * 0.9));
        vec3 inkC = vec3(0.007, 0.007, 0.009);
        return vec4(mix(paper * 2.2, inkC, clamp(ink * 1.1, 0.0, 1.0)), 1.0);
      }`,
  },
};
