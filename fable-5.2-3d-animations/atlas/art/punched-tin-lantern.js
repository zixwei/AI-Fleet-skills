// Art style 79: Punched-tin lantern. Inputs C D (colour, depth).
// A dark tin sheet (hammered dimples, a faint trace of the picture tone, a bright burr ring at each hole) with small holes punched in two lattices:
// a fine one (4.3 px at 720p, holes of 1.2 px radius) only where an edge of colour or depth lies at the lattice point, so a dotted line runs along every edge,
// and a coarse one (7.4 px) with holes only in the bright areas (the hole grows with the brightness, from 0.8 to 2.5 px).
// A candle behind the sheet shows warm light through every hole, with a glow of about 5 px around it (summed over the 9 nearest lattice points of both lattices).
window.ARTS = window.ARTS || {};
ARTS['punched-tin-lantern'] = {
  id: 'punched-tin-lantern', name: 'Punched-tin lantern', group: 'Craft materials', inputs: 'C D',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float zz(vec2 uv){ return log(min(linDepth(uv), uFocus * 3.0) / uFocus); }
      vec3 gam(vec3 c){ return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2)); }
      // is there an edge of colour or depth within 2.2 px of s?
      float edgeAt(vec2 s, vec2 px, float sc){
        vec3 c0 = gam(texture2D(tColor, s).rgb); float z0 = zz(s); float e = 0.0;
        for (int k = 0; k < 4; k++) {
          vec2 o = (k == 0 ? vec2(1.0, 0.0) : k == 1 ? vec2(-1.0, 0.0) : k == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * 2.2 * sc * px;
          if (abs(zz(s + o) - z0) > 0.08 || length(gam(texture2D(tColor, s + o).rgb) - c0) > 0.26) e = 1.0;
        }
        return e;
      }
      // light through the holes of one lattice (pitch P px): x = hole coverage, y = glow, z = burr ring. mode 0: edge lattice, 1: bright lattice
      vec3 lattice(vec2 f, float P, float mode, vec2 px, float sc){
        vec2 c = floor(f / P);
        float hole = 0.0, glow = 0.0, ring = 0.0;
        for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
          vec2 cell = c + vec2(float(i), float(j));
          vec2 cp = (cell + 0.5 + (vec2(h21(cell + mode * 9.0), h21(cell + 5.0 + mode * 9.0)) - 0.5) * 0.18) * P;
          vec2 cuv = cp * sc * px;
          float r = 0.0;
          if (mode < 0.5) { r = edgeAt(cuv, px, sc) * 1.25; }
          else { float L = lum(gam(texture2D(tColor, cuv).rgb)); r = L > 0.76 ? mix(0.7, 1.9, smoothstep(0.76, 1.0, L)) : 0.0; }
          if (r <= 0.0) continue;
          float d = length(f - cp);
          hole = max(hole, 1.0 - smoothstep(r - 0.5, r + 0.5, d));
          glow += exp(-d * d / (r * r * 4.0 + 4.0)) * (0.35 + 0.15 * r);
          ring = max(ring, (1.0 - smoothstep(0.0, 0.9, abs(d - r - 0.9))) * 0.9);
        }
        return vec3(hole, glow, ring);
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        vec2 f = fc / sc;
        vec3 a = lattice(f, 4.3, 0.0, px, sc), b = lattice(f, 7.4, 1.0, px, sc);
        float hole = max(a.x, b.x), glow = a.y + b.y, ring = max(a.z, b.z);
        vec3 c0 = gam(texture2D(tColor, uv).rgb);
        // tin: dark, hammered, with the picture tone showing very faintly
        float ham = vn(f * 0.45) * 0.6 + vn(f * 1.3) * 0.4;
        vec3 tin = vec3(0.04, 0.038, 0.04) * (0.7 + 0.8 * ham) + 0.2 * c0 * c0;
        // bright burr ring around a hole, brighter on the upper left side
        tin += vec3(0.5, 0.42, 0.36) * ring * (0.3 + 0.3 * ham) * (1.0 - hole);
        // the warm light: through the hole itself, and a glow on the sheet around it
        vec3 warm = vec3(1.0, 0.58, 0.2);
        vec3 col = tin + warm * 0.4 * clamp(glow, 0.0, 1.2) * (1.0 - hole) * (0.5 + 0.5 * ham);
        col = mix(col, vec3(1.0, 0.78, 0.4) * 1.5, hole);
        return vec4(pow(clamp(col, 0.0, 2.0), vec3(2.2)), 1.0);
      }`,
  },
};
