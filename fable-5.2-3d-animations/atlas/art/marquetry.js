// Art style 76: Marquetry. Inputs C N (colour, normals).
// Wood veneers. The picture colour (softened over 4 px) is matched to the nearest of 10 woods (ebony, walnut, padauk, cherry, satinwood, oak, maple and green, blue and
// purple stained veneer), so every area is one veneer with its own wood colour. The grain direction follows the surface: it runs along the tangent of the surface normal
// (the way the veneer would be bent over the form), and on a face that looks straight at the camera it takes a default angle of that wood.
// The grain is made of growth rings (a warped sine across the grain), fine streaks along it and dark pores. A thin dark saw cut lies where one veneer
// meets another (a jump of colour, depth or normal), the form is shaded from the normal, and a lacquer gloss lies over it.
window.ARTS = window.ARTS || {};
ARTS['marquetry'] = {
  id: 'marquetry', name: 'Marquetry', group: 'Craft materials', inputs: 'C N',
  labels: 'halo',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      vec3 gam(vec3 c){ return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2)); }
      vec3 nrm(vec2 uv){ return texture2D(tNormal, uv).rgb * 2.0 - 1.0; }
      vec3 wood(int i){
        if (i == 0) return vec3(0.10, 0.08, 0.07); if (i == 1) return vec3(0.30, 0.20, 0.13); if (i == 2) return vec3(0.58, 0.22, 0.12);
        if (i == 3) return vec3(0.74, 0.42, 0.30); if (i == 4) return vec3(0.88, 0.70, 0.30); if (i == 5) return vec3(0.72, 0.55, 0.34);
        if (i == 6) return vec3(0.93, 0.86, 0.70); if (i == 7) return vec3(0.42, 0.56, 0.26); if (i == 8) return vec3(0.46, 0.58, 0.70);
        return vec3(0.40, 0.28, 0.46); }
      // index of the wood nearest to the colour c
      int species(vec3 c){
        int bi = 0; float bd = 1e9;
        for (int i = 0; i < 10; i++) { vec3 dc = (c - lum(c)) - (wood(i) - lum(wood(i))); float s = 2.0 * dot(dc, dc) + 0.25 * (lum(c) - lum(wood(i))) * (lum(c) - lum(wood(i))); if (s < bd) { bd = s; bi = i; } }
        return bi;
      }
      vec3 softCol(vec2 uv, vec2 px, float sc){
        vec3 a = gam(texture2D(tColor, uv).rgb);
        for (int k = 0; k < 6; k++) { float t = float(k) * 1.0472; a += gam(texture2D(tColor, uv + vec2(cos(t), sin(t)) * 4.0 * sc * px).rgb); }
        return a / 7.0;
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes; float sc = uRes.y / 720.0;
        vec2 f = uv * uRes / sc;
        vec3 sc0 = softCol(uv, px, sc);
        int sp = species(sc0);
        float fsp = float(sp);
        vec3 n0 = nrm(uv);
        // grain direction: the tangent of the normal on a turned face, a default angle per wood on a flat face
        float defA = 0.4 + h21(vec2(fsp, 7.0)) * 2.6;
        vec2 defD = vec2(cos(defA), sin(defA));
        vec2 tg = vec2(-n0.y, n0.x); float m = length(tg);
        vec2 dir = m > 1e-4 ? tg / m : defD;
        if (dot(dir, defD) < 0.0) dir = -dir;
        dir = normalize(mix(defD, dir, smoothstep(0.06, 0.4, m)));
        float u = dot(f, dir), v = dot(f, vec2(-dir.y, dir.x));
        // grain: growth rings (the warp changes them slowly along the grain), streaks, pores
        float warp = 2.2 * vn(vec2(u * 0.012, v * 0.02) + fsp * 5.0) + 0.6 * vn(vec2(u * 0.05, v * 0.09));
        float rs = 6.0 + 4.0 * h21(vec2(fsp, 2.0));
        float ring = pow(abs(sin(3.14159 * (v / rs + warp))), 5.0);
        float streak = vn(vec2(u * 0.07, v * 1.3 + fsp * 3.0));
        float pore = step(0.9, vn(vec2(u * 0.35, v * 2.6)));
        vec3 base = wood(sp);
        float Lw = lum(base);
        base *= clamp(pow(lum(sc0) / max(Lw, 0.05), 0.5), 0.6, 1.4);     // a lighter area gets a lighter cut of the same wood
        vec3 wc = base * (1.0 - 0.28 * ring * (0.6 + 0.8 * (1.0 - Lw))) * (0.88 + 0.22 * streak) * (1.0 - 0.18 * pore);
        wc = mix(wc, wc * vec3(1.06, 0.98, 0.9), 0.5 * vn(f * 0.02));     // a little tone drift across a veneer
        // the form: light from the upper left, from the normal; the scene luminance adds the cast shadows
        float shade = 0.72 + 0.4 * clamp(dot(n0, normalize(vec3(-0.4, 0.6, 0.7))), 0.0, 1.0);
        float sL = clamp(lum(gam(texture2D(tColor, uv).rgb)) / max(lum(sc0), 0.05), 0.6, 1.3);
        wc *= shade * mix(1.0, sL, 0.6);
        // saw cut where one veneer meets another: jump of species, depth or normal
        float cut = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * 2.0 * sc * px;
          float dn = 1.0 - dot(n0, nrm(uv + o));
          float dz = abs(texture2D(tDepth, uv + o).x - texture2D(tDepth, uv).x);
          bool ds = species(softCol(uv + o, px, sc)) != sp;
          float e = max(max(smoothstep(0.3, 0.6, dn), smoothstep(0.0004, 0.002, dz)), ds ? 1.0 : 0.0);
          cut = max(cut, e);
        }
        vec3 col = mix(wc, vec3(0.06, 0.04, 0.03), cut * 0.7);
        // lacquer
        vec3 H = normalize(normalize(vec3(-0.4, 0.6, 0.7)) + vec3(0.0, 0.0, 1.0));
        col += vec3(1.0, 0.95, 0.85) * pow(max(dot(n0, H), 0.0), 30.0) * 0.12;
        return vec4(pow(clamp(col, 0.0, 1.0), vec3(2.2)) * 1.12, 1.0);
      }`,
  },
};
