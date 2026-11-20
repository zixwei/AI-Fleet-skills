// Art style 78: Tufted rug. Inputs C D (colour, depth).
// Wool pile in staggered rows of round tufts (5.2 px at 720p). Each tuft takes the picture colour at its centre, with its own yarn tone and a lean toward the lower right.
// The pile height comes from the depth: a nearer surface has a longer pile (bigger relief: a darker gap between tufts, a brighter top, a longer shadow of the tuft next to it).
// The pile is carved at each depth edge: where a near object ends, a step wall of 5 px is lit on the upper left rim and dark on the lower right rim, and the lower pile in
// front of the shadow side is shaded. Not felt: the surface is a regular lattice of loops with gaps, not random loose fibres.
window.ARTS = window.ARTS || {};
ARTS['tufted-rug'] = {
  id: 'tufted-rug', name: 'Tufted rug', group: 'Craft materials', inputs: 'C D',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 4.0); }
      vec3 gam(vec3 c){ return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2)); }
      // pile height from depth: 1 for a surface much nearer than the focus, 0 for a far one (log scale, stable over frames)
      float pile(float d){ return clamp(0.5 - 3.0 * log2(d / uFocus), 0.0, 1.0); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        vec2 f = fc / sc;
        const float D = 5.2;
        float RH = D * 0.866;
        float rj = floor(f.y / RH + 0.5);
        float best = 1e9; vec2 bc = vec2(0.0), bid = vec2(0.0);
        for (int j = -1; j <= 1; j++) {
          float r = rj + float(j);
          float offx = mod(r, 2.0) * 0.5 * D;
          float c0 = floor((f.x - offx) / D);
          for (int i = 0; i <= 1; i++) {
            vec2 cp = vec2((c0 + float(i) + 0.5) * D + offx, r * RH);
            float dd2 = dot(f - cp, f - cp);
            if (dd2 < best) { best = dd2; bc = cp; bid = vec2(c0 + float(i), r); }
          }
        }
        float d0 = dd(uv);
        vec2 cuv = bc * sc * px;
        vec3 pc = gam(texture2D(tColor, uv).rgb);
        // the tuft colour is the colour at its centre unless that lies on another surface
        float dc = dd(cuv);
        vec3 tc = abs(dc - d0) < 0.04 * d0 ? gam(texture2D(tColor, cuv).rgb) : pc;
        // local nearness: much nearer than the surface 12 px away means a raised piece
        float dFar = d0;
        for (int k = 0; k < 4; k++) { float a = float(k) * 1.5708 + 0.4; dFar = max(dFar, dd(uv + vec2(cos(a), sin(a)) * 12.0 * sc * px)); }
        float h = max(pile(d0), clamp(0.35 + 10.0 * (dFar - d0) / d0, 0.0, 1.0));
        float hr = h21(bid);
        float L = lum(tc);
        tc = max(mix(vec3(L), tc, 1.25), 0.0) * (0.9 + 0.2 * hr);
        // the tuft: a round loop with a lean toward the lower right; a long pile leans more
        vec2 lp = (f - bc) / (D * 0.5);
        vec2 lean = vec2(0.18, -0.18) * (0.4 + 0.8 * h) * (0.6 + 0.8 * hr);
        float r = length(lp - lean);
        float cover = 1.0 - smoothstep(mix(0.9, 0.66, h), mix(1.2, 0.98, h), r);      // a longer pile closes the gap between tufts
        float dome = sqrt(clamp(1.0 - r * r * 0.8, 0.0, 1.0));
        float lit = clamp(dot(normalize(lp - lean + 1e-3), vec2(-0.6, 0.8)) * 0.5 + 0.5, 0.0, 1.0);
        float relief = 0.25 + 1.0 * h;
        vec3 col = tc * (0.55 + 0.5 * dome + relief * 0.5 * (lit - 0.5));
        vec2 pr = vec2(-lean.y, lean.x) / max(length(lean), 1e-3);
        col *= 0.9 + 0.1 * sin(dot(lp, pr) * 11.0 + hr * 6.0) + 0.1 * vn(f * 1.7 + bid);   // yarn twist across the loop                                // wool texture on the loop
        col += vec3(1.0, 0.95, 0.85) * 0.08 * pow(lit, 3.0) * dome * h;
        // the gap between tufts: dark, deeper for a long pile
        vec3 gap = tc * mix(0.55, 0.1, h);
        col = mix(gap, col, cover);
        // carved steps: look 4 px toward the light (upper left) and away from it
        vec2 Lv = normalize(vec2(-1.0, 1.0));
        float zU = dd(uv + Lv * 4.0 * sc * px), zD = dd(uv - Lv * 5.0 * sc * px);
        float zU2 = dd(uv + Lv * 7.0 * sc * px);
        // this pixel is the high side of a step whose low side lies toward the light: a lit upper rim
        float hiU = clamp((zU - d0) / d0 / 0.015, 0.0, 1.0);
        // this pixel is the high side of a step whose low side lies away from the light: a dark lower rim
        float hiD = clamp((zD - d0) / d0 / 0.015, 0.0, 1.0);
        col *= 1.0 + 0.8 * hiU;
        col *= 1.0 - 0.65 * hiD;
        // shadow on the lower pile: a nearer surface lies toward the light within 7 px
        float sh = clamp((d0 - zU2) / d0 / 0.015, 0.0, 1.0) * (1.0 - hiU);
        col *= 1.0 - 0.38 * sh;
        return vec4(pow(clamp(col, 0.0, 1.4), vec3(2.2)) * 1.15, 1.0);
      }`,
  },
};
