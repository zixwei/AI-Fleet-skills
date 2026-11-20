// Art style 12: Oil impasto. Inputs C N (colour, normals).
// Thick strokes lie along each surface (the stroke direction is the screen tangent of the surface normal, followed step by step and stopped at edges).
// Each stroke has its own height and bristle ridges. A low light from the left lights the height map, so the ridges shine.
window.ARTS = window.ARTS || {};
ARTS['oil-impasto'] = {
  id: 'oil-impasto', name: 'Oil impasto', group: 'The marks follow the surface', inputs: 'C N',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      const vec2 DEF = vec2(0.94, 0.34);
      vec3 nrm(vec2 uv){ return texture2D(tNormal, uv).rgb * 2.0 - 1.0; }
      // screen tangent of a surface normal; ref keeps the sign and carries the direction where the surface faces the camera
      vec2 turn(vec3 n, vec2 ref){
        vec2 t = vec2(-n.y, n.x); float m = length(t);
        t = m > 1e-4 ? t / m : ref;
        if (dot(t, ref) < 0.0) t = -t;
        return normalize(mix(ref, t, smoothstep(0.05, 0.35, m)));
      }
      // Walks along the surface in both directions. brist: bristle noise averaged along the path (streaks).
      // The stroke is the cell with the largest hash on the path: hid its height id, wuv its centre.
      void trace(vec2 uv, float cellW, out float brist, out float hid, out vec2 wuv){
        vec2 px = 1.0 / uRes; float sc = uRes.y / 720.0, cs = 2.0 * sc, cw = cellW * sc, stp = 2.0 * sc;
        vec3 n0 = nrm(uv); vec2 d0 = turn(n0, DEF);
        brist = h21(floor(uv / px / cs)); float ws = 1.0;
        vec2 c0 = floor(uv / px / cw); float best = h21(c0 + 7.3); wuv = (c0 + 0.5) * cw * px;
        for (int s = 0; s < 2; s++) {
          vec2 p = uv, d = s == 0 ? d0 : -d0; vec3 np = n0, cp = texture2D(tColor, uv).rgb; float alive = 1.0;
          for (int k = 1; k <= 9; k++) {
            p += d * stp * px;
            vec3 nq = nrm(p), cq = texture2D(tColor, p).rgb;
            alive *= step(0.86, dot(nq, np)) * step(length(cq - cp), 0.1 + 0.25 * length(cp));
            np = nq; cp = cq; d = turn(nq, d);
            float w = alive * (1.0 - float(k) / 10.0);
            brist += w * h21(floor(p / px / cs)); ws += w;
            vec2 c = floor(p / px / cw); float hh = h21(c + 7.3);
            if (alive > 0.5 && hh > best) { best = hh; wuv = (c + 0.5) * cw * px; }
          }
        }
        brist /= ws; hid = fract(best * 37.1);
      }
      float height(float b, float hid){ return 1.0 * hid + 2.0 * (b - 0.5); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes; float sc = uRes.y / 720.0;
        float b0, h0, b1, h1, b2, h2; vec2 w0, w1, w2;
        float o = 1.4 * sc;
        trace(uv, 10.0, b0, h0, w0);
        trace(uv + vec2(o, 0.0) * px, 10.0, b1, h1, w1);
        trace(uv + vec2(0.0, o) * px, 10.0, b2, h2, w2);
        float H0 = height(b0, h0);
        vec2 g = vec2(height(b1, h1) - H0, height(b2, h2) - H0);
        // paint colour: each stroke carries the colour at its centre; a little of the local colour keeps the form
        vec3 base = mix(texture2D(tColor, uv).rgb, texture2D(tColor, w0).rgb, 0.65);
        float L = dot(base, vec3(0.2126, 0.7152, 0.0722));
        base = max(mix(vec3(L), base, 1.25), 0.0) * (0.9 + 0.2 * h0);
        // low light from the left: bump normal from the height gradient
        vec3 bn = normalize(vec3(-g * 2.4, 1.0));
        vec3 Ld = normalize(vec3(-0.85, 0.35, 0.28));
        float diff = clamp(dot(bn, Ld), 0.0, 1.0);
        float lit0 = clamp(Ld.z, 0.0, 1.0);
        float spec = pow(clamp(dot(bn, normalize(Ld + vec3(0.0, 0.0, 1.0))), 0.0, 1.0), 28.0);
        vec3 col = base * (0.55 + 0.9 * (diff - lit0) + 0.45) + vec3(1.0, 0.96, 0.88) * spec * 0.9 * (0.4 + L);
        return vec4(max(col, 0.0), 1.0);
      }`,
  },
};
