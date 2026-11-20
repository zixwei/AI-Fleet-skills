// Art style 99: Art Deco poster. Inputs C D (colour, depth).
// Flat shapes with airbrush gradients: each pixel takes the hue family of the scene colour (navy, teal, burgundy, gold, or ivory for grey)
// and its tone runs smoothly along a 3-colour ramp of that family, with a fine spray grain. The empty background is a sunburst behind the
// scene centre: 32 rays in two tones, a gold sun disc with an airbrush glow and thin gold concentric arcs. Thin gold lines follow the
// silhouettes (depth steps). The poster has a navy mat with a double gold border line.
window.ARTS = window.ARTS || {};
ARTS['art-deco-poster'] = {
  id: 'art-deco-poster', name: 'Art Deco poster', group: 'The picture is bent', inputs: 'C D',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float hue(vec3 g){
        float mx = max(g.r, max(g.g, g.b)), mn = min(g.r, min(g.g, g.b)), d = max(mx - mn, 1e-4);
        float h = mx == g.r ? mod((g.g - g.b) / d, 6.0) : mx == g.g ? (g.b - g.r) / d + 2.0 : (g.r - g.g) / d + 4.0;
        return fract(h / 6.0);
      }
      float hat(float h, float c, float w){ float d = abs(h - c); d = min(d, 1.0 - d); return clamp(1.0 - d / w, 0.0, 1.0); }
      vec3 ramp(vec3 a, vec3 b, vec3 c, float L){ return mix(mix(a, b, smoothstep(0.0, 0.5, L)), c, smoothstep(0.4, 1.0, L)); }
      vec3 deco(vec3 sc, vec2 fc){
        vec3 g = pow(clamp(sc, 0.0, 1.0), vec3(1.0 / 2.2));
        float L = dot(g, vec3(0.3, 0.59, 0.11)), sat = (max(g.r, max(g.g, g.b)) - min(g.r, min(g.g, g.b))) / max(max(g.r, max(g.g, g.b)), 1e-3);
        L = mix(L, smoothstep(0.05, 0.95, L), 0.6);                               // firmer contrast between the flat shapes
        float h = hue(g);
        float wR = max(hat(h, 0.0, 0.1), hat(h, 0.9, 0.1)), wY = hat(h, 0.125, 0.09), wG = hat(h, 0.36, 0.17), wB = hat(h, 0.62, 0.14);
        float wN = 1.0 - smoothstep(0.12, 0.32, sat);
        float wc = (wR + wY + wG + wB + 1e-3);
        float ws = 1.0 - wN;
        vec3 navy = ramp(vec3(0.03, 0.06, 0.17), vec3(0.10, 0.22, 0.42), vec3(0.50, 0.66, 0.84), L);
        vec3 teal = ramp(vec3(0.02, 0.20, 0.22), vec3(0.06, 0.48, 0.46), vec3(0.55, 0.84, 0.72), L);
        vec3 burg = ramp(vec3(0.25, 0.03, 0.08), vec3(0.62, 0.12, 0.18), vec3(0.93, 0.55, 0.42), L);
        vec3 gold = ramp(vec3(0.35, 0.20, 0.04), vec3(0.85, 0.60, 0.15), vec3(1.0, 0.92, 0.62), L);
        vec3 ivory = ramp(vec3(0.05, 0.08, 0.19), vec3(0.45, 0.50, 0.55), vec3(0.97, 0.93, 0.80), L);
        vec3 col = (burg * wR + gold * wY + teal * wG + navy * wB) / wc * ws + ivory * wN;
        col *= 0.97 + 0.06 * h21(floor(fc * 0.7));                          // spray grain
        return pow(clamp(col, 0.0, 1.0), vec3(2.2));
      }
      vec3 sunburst(vec2 uv, float sc, float asp){
        vec2 p = (uv - vec2(0.5, 0.5)) * vec2(asp, 1.0);
        float r = length(p), a = atan(p.y, p.x);
        float ray = step(0.5, fract(a / 6.2832 * 16.0));                      // 32 rays: 16 light, 16 dark
        vec3 dark = vec3(0.04, 0.17, 0.22), light = vec3(0.10, 0.42, 0.45);
        vec3 col = mix(dark, light, ray) * (1.15 - 0.9 * smoothstep(0.1, 1.0, r));   // airbrush: lighter toward the sun
        col = mix(col, vec3(0.96, 0.82, 0.45), ray * 0.5 * smoothstep(0.7, 0.1, r)); // the light rays warm toward the centre
        // sun disc with a glow
        col += vec3(1.0, 0.72, 0.25) * 0.5 * exp(-r * 5.0);
        col = mix(col, mix(vec3(1.0, 0.8, 0.35), vec3(0.95, 0.5, 0.2), smoothstep(-0.2, 0.2, p.y)), smoothstep(0.215, 0.205, r));
        // thin gold arcs
        float arc = 0.0;
        for (int i = 0; i < 4; i++) { float ri = 0.26 + 0.12 * float(i) + 0.0 * a; arc = max(arc, smoothstep(1.2 * sc / 1080.0, 0.0, abs(r - ri) - 0.0015)); }
        col = mix(col, vec3(0.95, 0.72, 0.28), arc * 0.9);
        return pow(clamp(col, 0.0, 1.0), vec3(2.2));
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float sc = uRes.y / 1080.0, asp = uRes.x / uRes.y;
        float d0 = texture2D(tDepth, uv).x, dl = linDepth(uv);
        vec3 col;
        if (d0 > 0.9999) col = sunburst(uv, sc, asp);
        else {
          col = deco(texture2D(tColor, uv).rgb, fc);
          // a surface far behind the focus plane (a back wall, the far floor) is part of the backdrop: the sunburst shows through it
          float far = smoothstep(1.15, 1.45, dl / uFocus);
          col = mix(col, sunburst(uv, sc, asp), 0.9 * far);
        }
        // gold line along silhouettes
        float de = 0.0;
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.7854;
          vec2 o = vec2(cos(a), sin(a)) * px * 2.0 * sc;
          float dq = texture2D(tDepth, uv + o).x > 0.9999 ? dl * 3.0 : linDepth(uv + o);
          de = max(de, abs(dq - dl) / dl);
        }
        col = mix(col, vec3(0.9, 0.45, 0.07), smoothstep(0.015, 0.04, de) * (d0 > 0.9999 ? 0.0 : 0.95) * (1.0 - 0.0));
        // poster mat and double gold border (distance to the nearest frame edge, in pixels at 1080p)
        float m = min(min(fc.x, fc.y), min(uRes.x - fc.x, uRes.y - fc.y)) / sc;
        col = m < 24.0 ? vec3(0.002, 0.007, 0.022) : col;
        float gl = max(smoothstep(1.6, 0.6, abs(m - 24.0)), smoothstep(1.2, 0.4, abs(m - 31.0)));
        col = mix(col, vec3(0.9, 0.45, 0.07), gl * 0.95);
        // corner notches
        vec2 cc = min(fc, uRes - fc) / sc;
        float notch = smoothstep(1.4, 0.4, abs(max(cc.x, cc.y) - 62.0)) * step(min(cc.x, cc.y), 62.0) * step(24.0, min(cc.x, cc.y));
        col = mix(col, vec3(0.9, 0.45, 0.07), notch * 0.9);
        return vec4(col * 1.25, 1.0);
      }`,
  },
};
