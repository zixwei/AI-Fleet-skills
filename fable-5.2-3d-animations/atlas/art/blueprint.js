// Art style 69: Blueprint. Inputs D N (depth, normals). Version of the first-set style `blueprint`, without its topic (no title block, no force arrows).
// White lines in two weights on blueprint blue: heavy lines where the depth jumps (silhouettes), thin lines where the surface normal jumps (surface edges).
// The sheet has paper grain, fold creases (a quarter fold, 3 vertical and 1 horizontal) and a drafting grid. The scene colour is not used.
window.ARTS = window.ARTS || {};
ARTS['blueprint'] = {
  id: 'blueprint', name: 'Blueprint', group: 'Print and paper', inputs: 'D N',
  labels: 'halo',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      vec3 nrm(vec2 uv){ return texture2D(tNormal, uv).rgb * 2.0 - 1.0; }
      // a line of width w (px) at the value f = 0, anti-aliased
      float ln(float f, float w){ return clamp(w * 0.5 + 0.5 - abs(f), 0.0, 1.0); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        float z = linDepth(uv), sky = texture2D(tDepth, uv).x > 0.9999 ? 1.0 : 0.0;
        vec3 n0 = nrm(uv);
        // heavy: depth jumps, seen at radius 2.2 px; thin: normal jumps, seen at radius 1 px
        float de = 0.0, ne = 0.0;
        for (int i = 0; i < 8; i++) {
          float an = float(i) * 0.7854;
          vec2 dir = vec2(cos(an), sin(an));
          float zq = linDepth(uv + dir * px * 2.2 * sc);
          de = max(de, abs(zq - z) / min(z, zq));
          ne = max(ne, 1.0 - dot(n0, nrm(uv + dir * px * 1.3 * sc)));
        }
        float heavy = smoothstep(0.025, 0.06, de);
        float thin = smoothstep(0.3, 0.6, ne) * (1.0 - heavy);
        // the sheet: blue with paper grain
        float fib = 0.5 * vn(vec2(fc.x * 0.02, fc.y * 0.7) / sc) + 0.5 * vn(vec2(fc.x * 0.6, fc.y * 0.03) / sc);
        float speck = vn(fc / sc * 0.9);
        vec3 blue = vec3(0.012, 0.075, 0.27) * (0.88 + 0.22 * fib + 0.08 * speck);
        // fold creases: one dark line with a light line beside it, and a soft change of tone between the panels
        vec2 fr = fc / uRes; float crease = 0.0, shade = 0.0;
        for (int i = 1; i <= 3; i++) { float x = float(i) * 0.25; float d = (fr.x - x) * uRes.x;
          crease = max(crease, 0.6 * ln(d, 2.4 * sc));
          shade += (fr.x > x ? 1.0 : 0.0) * (mod(float(i), 2.0) < 0.5 ? -0.09 : 0.09); }
        float dh = (fr.y - 0.5) * uRes.y; crease = max(crease, 0.6 * ln(dh, 2.4 * sc));
        float light = 0.0;
        for (int i = 1; i <= 3; i++) light = max(light, ln((fr.x - float(i) * 0.25) * uRes.x - 3.0 * sc, 1.4 * sc));
        light = max(light, ln((fr.y - 0.5) * uRes.y - 3.0 * sc, 1.4 * sc));
        blue *= 1.0 - crease * 0.9 + shade;
        // the grid: 24 px minor lines, a stronger line every 5th; fainter where the scene stands on the sheet
        vec2 gp = fc / (24.0 * sc);
        vec2 gf = (fract(gp + 0.5) - 0.5) * 24.0 * sc;
        float minor = max(ln(gf.x, 1.0 * sc), ln(gf.y, 1.0 * sc));
        vec2 mp = fc / (120.0 * sc), mf = (fract(mp + 0.5) - 0.5) * 120.0 * sc;
        float major = max(ln(mf.x, 1.6 * sc), ln(mf.y, 1.6 * sc));
        float grid = (0.13 * minor + 0.2 * major) * mix(1.0, 0.55, 1.0 - sky);
        vec3 white = vec3(1.7, 1.78, 1.9);
        vec3 col = mix(blue, white * 0.95, grid);
        col = mix(col, white, 0.16 * light);
        // linework: white chalk of the drafting pen; a little uneven so it reads as ink on paper
        float wob = 0.9 + 0.1 * vn(fc / sc * 0.25);
        col = mix(col, white, clamp(thin * 0.85 * wob, 0.0, 1.0));
        col = mix(col, white, clamp(heavy * wob, 0.0, 1.0));
        return vec4(col, 1.0);
      }`,
  },
};
