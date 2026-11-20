// Art style 61: Woodblock print. Inputs C D N (colour, depth, normals). Version of the first-set style `woodblock`, without its topic.
// Flat colour areas (posterised in gamma space) that darken toward the top of each area (bokashi), black key lines cut from the depth, the normals and
// the colour jumps, paper fibre, and the colour blocks printed 2 px out of register with the key block. Full colour, no gouge marks (Linocut is one ink with gouge streaks).
window.ARTS = window.ARTS || {};
ARTS['woodblock-print'] = {
  id: 'woodblock-print', name: 'Woodblock print', group: 'Print and paper', inputs: 'C D N',
  labels: 'halo',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      vec3 nrm(vec2 uv){ return texture2D(tNormal, uv).rgb * 2.0 - 1.0; }
      // distance (px) from this point up the screen to the top of its colour area; the top of the frame counts as a top
      float topDist(vec2 uv0, float sc){
        vec2 px = 1.0 / uRes;
        vec3 cp = texture2D(tColor, uv0).rgb; float dp = linDepth(uv0);
        float st = 6.0 * sc, res = 90.0 * sc;
        for (int k = 1; k <= 15; k++) {
          vec2 p = uv0 + vec2(0.0, float(k) * st) * px;
          if (p.y > 1.0) { res = float(k) * st; break; }
          vec3 cq = texture2D(tColor, p).rgb; float dq = linDepth(p);
          if (length(cq - cp) > 0.2 + 0.3 * length(cp) || abs(dq - dp) / dp > 0.04) { res = float(k - 1) * st; break; }
          cp = cq; dp = dq;
        }
        return res;
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        vec2 offC = vec2(1.6, -1.4) * sc * px;           // colour block: 2 px out of register with the key block
        vec2 offG = vec2(-1.2, 1.1) * sc * px;           // gradient block: another small error
        // colour block: flat areas, posterised in gamma space
        vec2 uc = uv + offC; vec3 cc = texture2D(tColor, uc).rgb, acc = cc; float ws = 1.0;   // edge-aware blur at 2 radii: texture noise must not flip the posterised level
        for (int i = 0; i < 16; i++) {
          float an = float(i) * 0.7854 + (i < 8 ? 0.0 : 0.39); float rr = i < 8 ? 4.6 : 9.0;
          vec3 cq = texture2D(tColor, uc + vec2(cos(an), sin(an)) * px * rr * sc).rgb;
          float w = exp(-length(cq - cc) * 9.0); acc += cq * w; ws += w;
        }
        vec3 c0 = acc / ws;
        vec3 g = pow(clamp(c0, 0.0, 1.0), vec3(1.0 / 2.2));
        g = floor(g * 5.0 + 0.5) / 5.0;                      // posterise in gamma space first, then saturate the flat colour
        g = clamp(mix(vec3(dot(g, vec3(0.333))), g, 1.4), 0.0, 1.0);
        vec3 fill = pow(g, vec3(2.2));
        // bokashi: the colour darkens toward the top of its area and takes a cool, deep tone
        float td = topDist(uv + offG, sc);
        float bok = 1.0 - smoothstep(0.0, 90.0 * sc, td);
        bok = bok * bok * (3.0 - 2.0 * bok) * (0.8 + 0.4 * vn(vec2(fc.x * 0.012 / sc, 3.0)));   // the brush of ink is uneven along the block
        fill *= mix(vec3(1.0), vec3(0.50, 0.58, 0.78), 0.85 * clamp(bok, 0.0, 1.0));
        // key block: black lines where the depth, the normal or the colour jumps
        vec3 here = texture2D(tColor, uv).rgb, nh = nrm(uv); float zh = linDepth(uv);
        float de = 0.0, ne = 0.0, ce = 0.0;
        for (int i = 0; i < 8; i++) {
          float an = float(i) * 0.7854;
          vec2 o = vec2(cos(an), sin(an)) * px * (i < 4 ? 1.4 : 2.2) * sc;
          de = max(de, abs(linDepth(uv + o) - zh) / zh);
          ne = max(ne, 1.0 - dot(nh, nrm(uv + o)));
          ce = max(ce, length(texture2D(tColor, uv + o).rgb - here));
        }
        float line = max(smoothstep(0.02, 0.05, de), max(smoothstep(0.30, 0.55, ne), smoothstep(0.22, 0.42, ce) * 0.85));
        line *= 0.82 + 0.36 * vn(fc / sc * 0.09);        // the cut of the line is uneven
        // paper: long fibres, short flecks, and ink that does not cover the paper everywhere
        float fib = 0.55 * vn(vec2(fc.x * 0.012, fc.y * 0.55) / sc) + 0.45 * vn(vec2(fc.x * 0.05 + fc.y * 0.2, fc.y * 0.16) / sc);
        float fleck = step(0.992, h21(floor(fc / (2.0 * sc)) + 9.3));
        vec3 paper = vec3(0.965, 0.915, 0.80) * (0.93 + 0.1 * fib);
        float cover = 1.0 - 0.06 * vn(fc / sc * 0.35 + 5.0) - 0.05 * fleck;
        vec3 col = mix(paper * 2.1, fill * mix(vec3(1.0), paper, 0.35) * 1.1, cover);
        col *= 0.97 + 0.05 * fib;
        col = mix(col, vec3(0.045, 0.04, 0.05), clamp(line, 0.0, 1.0) * 0.93);
        return vec4(col, 1.0);
      }`,
  },
};
