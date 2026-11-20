// Art style 36: Stained glass (version of the first-set style "stained-glass"). Inputs C D N (colour, depth, normals).
// The picture is cut into glass panes: a jittered Voronoi grid (about 140 px) from a deterministic hash. A pane is one flat colour
// taken at its seed point (saturation boosted). Where the surface at a pixel is not the surface at the seed (another depth), the pane
// takes the local colour of that surface instead, so an object keeps its own colour inside the pane. Lead lines = Voronoi borders
// plus depth, normal and colour edges, so each object is cut from the floor. Per-pane tint noise, bubbles, transmitted glow.
// The lead is dark and matt (transmitted light, not an opaque enamel with gold wire).
window.ARTS = window.ARTS || {};
ARTS['stained-glass'] = {
  id: 'stained-glass', name: 'Stained glass', group: 'Light makes the picture', inputs: 'C D N',
  labels: 'halo',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      vec2 h22(vec2 p){ return vec2(h21(p), h21(p + vec2(31.7, 17.3))); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float zz(vec2 uv){ return log(min(linDepth(uv), uFocus * 3.0) / uFocus); }
      vec3 nv(vec2 uv){ return texture2D(tNormal, uv).rgb * 2.0 - 1.0; }
      vec3 gam(vec3 c){ return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2)); }
      // glass colours: ruby, amber, emerald, cobalt, violet, turquoise, gold, lime
      vec3 glassCol(int i){
        if (i == 0) return vec3(0.82, 0.07, 0.10); if (i == 1) return vec3(0.95, 0.52, 0.06); if (i == 2) return vec3(0.06, 0.58, 0.22);
        if (i == 3) return vec3(0.08, 0.22, 0.86); if (i == 4) return vec3(0.48, 0.12, 0.70); if (i == 5) return vec3(0.06, 0.66, 0.72);
        if (i == 6) return vec3(0.96, 0.82, 0.16); return vec3(0.52, 0.82, 0.16); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        const float CS = 140.0;
        vec2 cell = floor(fc / CS);
        vec3 c0 = gam(texture2D(tColor, uv).rgb); float z0 = zz(uv); vec3 n0 = nv(uv);
        // jittered Voronoi: nearest and second nearest seed
        float d1 = 1e9, d2 = 1e9; vec2 sp1 = vec2(0.0), id1 = vec2(0.0);
        for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
          vec2 cc = cell + vec2(float(i), float(j));
          vec2 sp = (cc + 0.12 + 0.76 * h22(cc)) * CS;
          float d = length(fc - sp);
          if (d < d1) { d2 = d1; d1 = d; sp1 = sp; id1 = cc; } else if (d < d2) d2 = d;
        }
        float border = 0.5 * (d2 - d1);                                    // about the distance to the nearest pane border, in px
        // the seed's own colour and depth (four taps within 4 px)
        vec2 suv = sp1 * px;
        vec3 sc = gam((texture2D(tColor, suv).rgb + texture2D(tColor, suv + vec2(4.0, 0.0) * px).rgb + texture2D(tColor, suv + vec2(-4.0, 0.0) * px).rgb + texture2D(tColor, suv + vec2(0.0, 4.0) * px).rgb) * 0.25);
        float sz = zz(suv);
        // local flat colour of this surface: depth-aware and colour-aware average
        vec3 cl = c0; float cw = 1.0;
        for (int k = 0; k < 8; k++) {
          float a = float(k) * 0.7854; vec2 o = vec2(cos(a), sin(a)) * 7.0 * px;
          vec3 sk = gam(texture2D(tColor, uv + o).rgb);
          float w = exp(-abs(zz(uv + o) - z0) * 14.0) * exp(-length(sk - c0) * 5.0);
          cl += sk * w; cw += w;
        }
        cl /= cw;
        float same = 1.0 - smoothstep(0.08, 0.2, abs(z0 - sz));            // 1 when this pixel lies on the surface of the seed
        vec3 base = mix(cl, sc, same);
        // lead: pane borders, depth edges, normal creases, colour edges
        float de = 0.0, ne = 0.0, ce = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * px * 4.0;
          de = max(de, abs(zz(uv + o) - z0));
          ne = max(ne, 1.0 - dot(n0, nv(uv + o)));
          ce = max(ce, length(gam(texture2D(tColor, uv + o).rgb) - c0));
        }
        float lead = 1.0 - smoothstep(3.0, 7.0, border);
        lead = max(lead, max(smoothstep(0.04, 0.1, de), max(smoothstep(0.35, 0.65, ne), smoothstep(0.3, 0.5, ce))));
        // glass colour: saturated; grey or pale surfaces take a glass colour from the pane id (a warm or a cool family)
        float L = lum(base);
        float sat = max(base.r, max(base.g, base.b)) - min(base.r, min(base.g, base.b));
        vec3 g = clamp(mix(vec3(L), base, 2.2), 0.0, 1.0);
        float best = 1e9; vec3 pal = g;
        for (int k = 0; k < 8; k++) { vec3 p = glassCol(k); float dk = length(normalize(p) - normalize(g + 0.001)); if (dk < best) { best = dk; pal = p; } }
        float hp = h21(id1 + 11.0);
        float warm = base.r - base.b;
        vec3 lightGlass = warm > 0.02 ? mix(vec3(0.95, 0.52, 0.06), vec3(0.96, 0.80, 0.16), hp) : mix(vec3(0.10, 0.30, 0.92), vec3(0.04, 0.60, 0.66), hp);
        pal = mix(pal, lightGlass, 1.0 - smoothstep(0.1, 0.3, sat));
        g = mix(g, pal, 0.75) * (0.55 + 0.45 * L);
        // the scene's own shading shows through a little, so forms inside a pane stay readable
        g *= mix(1.0, clamp(lum(c0) / max(lum(base), 0.05), 0.55, 1.5), 0.5);
        // uneven tint: a per-pane brightness, a drift across the pane, a cloudy patch
        float ph = h21(id1 + 5.0) * 6.283;
        g *= 0.85 + 0.3 * h21(id1 + 3.0);
        g *= 1.0 + 0.25 * dot((fc - sp1) / CS, vec2(cos(ph), sin(ph)));
        g *= 0.85 + 0.3 * vn(fc * 0.03 + id1 * 3.7);
        g *= 0.65 + 0.7 * smoothstep(3.0, 40.0, border);                  // darker toward the lead, bright in the middle
        // small bubbles
        float bs = 15.0; vec2 bc = floor(fc / bs);
        vec2 hb = h22(bc + id1 * 0.13 + 3.0);
        float has = step(hb.x, 0.2);
        vec2 ctr = (bc + 0.25 + 0.5 * h22(bc + 7.0)) * bs;
        float rr = 1.6 + 2.6 * hb.y, dd2 = length(fc - ctr);
        float ring = smoothstep(rr - 1.2, rr - 0.2, dd2) * (1.0 - smoothstep(rr - 0.2, rr + 0.8, dd2));
        float inside = 1.0 - smoothstep(rr - 0.4, rr + 0.4, dd2);
        float hi = inside * smoothstep(0.0, 1.0, dot(normalize(fc - ctr + 0.001), vec2(-0.6, 0.8)));
        g = g * (1.0 - 0.28 * inside * has) + (0.55 * ring + 0.35 * hi) * has * vec3(1.0, 0.97, 0.88);
        vec3 leadCol = vec3(0.045, 0.047, 0.055) + 0.05 * g;
        vec3 col = mix(g, leadCol, clamp(lead, 0.0, 1.0));
        return vec4(pow(col, vec3(2.4)) * 1.35, 1.0);
      }`,
  },
};
