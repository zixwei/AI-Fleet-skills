// Art style 73: Patchwork quilt. Inputs C D (colour, depth).
// The picture is cut into fabric patches. A patch is a jittered cell where a seed competes by distance, colour and depth, so seams follow the colour edges and
// the depth edges of the picture (like stained glass, but the patch is cloth). Each patch is one fabric: plain linen, polka dots, stripes, gingham, small crosses or
// diamonds, each with its own small print, angle and scale, in a tone of the patch colour. A running stitch (dashes of cream or dark thread with a pin-hole shadow)
// sits 4 px inside each seam, the surface is padded (dark in the seam valley, a soft light dome in the middle of the patch), and a cloth weave covers everything.
window.ARTS = window.ARTS || {};
ARTS['patchwork-quilt'] = {
  id: 'patchwork-quilt', name: 'Patchwork quilt', group: 'Craft materials', inputs: 'C D',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      vec2 h22(vec2 p){ return vec2(h21(p), h21(p + vec2(31.7, 17.3))); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float zz(vec2 uv){ return log(min(linDepth(uv), uFocus * 3.0) / uFocus); }
      vec3 gam(vec3 c){ return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2)); }
      // one print on a patch. t = print type (0 to 5), p = coordinates in px (already turned and scaled). Returns 1 where the print colour shows.
      float printMask(float t, vec2 p){
        if (t < 1.0) return 0.0;                                                  // plain linen
        if (t < 2.0) { vec2 c = fract(p) - 0.5; return 1.0 - smoothstep(0.2, 0.26, length(c)); }                 // polka dots
        if (t < 3.0) return smoothstep(0.42, 0.48, abs(fract(p.x) - 0.5)) * 0.0 + step(fract(p.x), 0.4);         // stripes
        if (t < 4.0) { float a = step(fract(p.x), 0.5), b = step(fract(p.y), 0.5); return abs(a - b) < 0.5 ? 1.0 : 0.45 * (a * b * 2.0); }   // gingham
        if (t < 5.0) { vec2 c = abs(fract(p) - 0.5); return (1.0 - smoothstep(0.05, 0.09, min(c.x, c.y))) * step(max(c.x, c.y), 0.3); }          // small crosses
        vec2 c = fract(p) - 0.5; return 1.0 - smoothstep(0.3, 0.36, abs(c.x) + abs(c.y));                       // diamonds
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        float CS = 92.0 * sc;
        vec3 c0 = gam(texture2D(tColor, uv).rgb); float z0 = zz(uv);
        float s1 = 1e9, s2 = 1e9; vec2 sp1 = vec2(0.0), sp2 = vec2(0.0); vec2 id1 = vec2(0.0); vec3 col1 = vec3(0.0);
        vec2 cellG = floor(fc / CS);
        for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
          vec2 cc = cellG + vec2(float(i), float(j));
          vec2 sp = (cc + 0.15 + 0.7 * h22(cc)) * CS, suv = sp * px;
          vec3 sc3 = gam((texture2D(tColor, suv).rgb + texture2D(tColor, suv + vec2(4.0, 3.0) * sc * px).rgb + texture2D(tColor, suv + vec2(-4.0, 3.0) * sc * px).rgb) * 0.3333);
          float s = length(fc - sp) / CS + 1.6 * length(c0 - sc3) + 1.2 * abs(z0 - zz(suv));
          if (s < s1) { s2 = s1; sp2 = sp1; s1 = s; sp1 = sp; col1 = sc3; id1 = cc; } else if (s < s2) { s2 = s; sp2 = sp; }
        }
        float gap = s2 - s1;
        // local colour, depth aware (so a small object keeps its own colour)
        vec3 cl = vec3(0.0); float cw = 0.0;
        for (int k = 0; k < 8; k++) {
          float a = float(k) * 0.7854; vec2 o = vec2(cos(a), sin(a)) * 5.0 * sc * px;
          float w = exp(-abs(zz(uv + o) - z0) * 12.0);
          cl += gam(texture2D(tColor, uv + o).rgb) * w; cw += w;
        }
        cl = (cl + c0) / (cw + 1.0);
        // edges of colour or depth inside a patch are seams as well
        float de = 0.0, ce = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * px * 2.2 * sc;
          de = max(de, abs(zz(uv + o) - z0));
          ce = max(ce, length(gam(texture2D(tColor, uv + o).rgb) - c0));
        }
        float edge = max(smoothstep(0.06, 0.14, de), smoothstep(0.22, 0.42, ce));
        // fabric of this patch
        float hp = h21(id1 + 3.0);
        float ptype = floor(hp * 6.0);
        float ang = (h21(id1 + 8.0) < 0.5 ? 0.0 : 0.7854) + (h21(id1 + 1.0) - 0.5) * 0.3;
        vec2 rp = vec2(dot(fc, vec2(cos(ang), sin(ang))), dot(fc, vec2(-sin(ang), cos(ang)))) / sc;
        float ps = 11.0 + 9.0 * h21(id1 + 5.0);
        float pm = printMask(ptype, rp / ps);
        vec3 base = clamp(mix(cl, col1, 0.35), 0.0, 1.0);
        float L = lum(base);
        base = clamp(mix(vec3(L), base, 1.45), 0.0, 1.0);
        vec3 ink = L > 0.5 ? base * 0.55 : mix(base, vec3(1.0, 0.95, 0.85), 0.55);        // the print is a light tone on a dark patch and a dark tone on a light patch
        vec3 g = mix(base, ink, pm * 0.55);
        // cloth: a weave and a few slubs
        g *= 0.93 + 0.07 * sin(fc.x / sc * 2.4) * sin(fc.y / sc * 2.4) + 0.05 * (vn(fc / sc * vec2(0.9, 0.12)) - 0.5);
        // padded: dark in the seam valley, a soft dome in the middle
        float pad = smoothstep(0.0, 0.5, gap);
        g *= 0.7 + 0.5 * pad;
        float valley = 1.0 - smoothstep(0.02, 0.1, gap);
        g *= 1.0 - 0.3 * valley;
        g *= 1.0 - 0.3 * edge;
        // running stitch 4 px inside the seam (not on a colour edge that is no patch seam)
        vec2 tdir = normalize(vec2(-(sp2 - sp1).y, (sp2 - sp1).x) + 1e-4);
        float along = dot(fc, tdir) / sc / 13.0;
        float u = fract(along);
        float dash = smoothstep(0.0, 0.08, u) * (1.0 - smoothstep(0.6, 0.68, u));
        float line = 1.0 - smoothstep(0.012, 0.03, abs(gap - 0.105));
        float stitch = dash * line;
        vec3 thread = L > 0.5 ? vec3(0.22, 0.12, 0.1) : vec3(0.95, 0.88, 0.72);
        float holeShadow = (1.0 - smoothstep(0.02, 0.05, abs(gap - 0.105 - 0.01))) * (1.0 - stitch);
        g *= 1.0 - 0.2 * holeShadow * dash;
        g = mix(g, thread * (0.8 + 0.3 * h21(floor(vec2(along * 4.0, id1.x)))), stitch);
        return vec4(pow(clamp(g, 0.0, 1.0), vec3(2.2)) * 1.05, 1.0);
      }`,
  },
};
