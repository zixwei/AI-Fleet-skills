// Art style 56: Ink and toon. Inputs C D N (colour, depth, normals). A new version of the first-set style Ink and Toon (atlas/styles/ink-toon.js), without its topic.
// Two-tone flat colour in bold saturated hues, a black brush outline whose width follows the depth (thick near, thin far) and the kind of edge (silhouette thick, crease thin),
// and halftone dots on the border between the light tone and the shadow tone.
window.ARTS = window.ARTS || {};
ARTS['ink-and-toon'] = {
  id: 'ink-and-toon', name: 'Ink and toon', group: 'Hand-made animation', inputs: 'C D N',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      vec3 nrm(vec2 uv){ return texture2D(tNormal, uv).rgb * 2.0 - 1.0; }
      vec3 outc(vec3 g){ return pow(clamp(g, 0.0, 1.0), vec3(2.2)) * 2.3; }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        vec3 c = texture2D(tColor, uv).rgb;
        float L = max(lum(c), 1e-3), d0 = dd(uv);
        vec3 n0 = nrm(uv), chroma = c / L;
        // the lit tone of this surface: the brightest tone among its neighbours that share depth, normal and hue (found with a ring of taps)
        float Lref = L;
        for (int i = 0; i < 12; i++) {
          float a = float(i) * 2.39996, r = (8.0 + 4.0 * float(i)) * px.x;
          vec2 s = uv + vec2(cos(a), sin(a) * (uRes.x / uRes.y)) * r;
          vec3 cs = texture2D(tColor, s).rgb; float Ls = max(lum(cs), 1e-3);
          float same = step(abs(dd(s) - d0) / d0, 0.035) * step(0.86, dot(n0, nrm(s))) * step(length(cs / Ls - chroma), 0.28);
          Lref = max(Lref, Ls * same);
        }
        Lref = exp2(floor(log2(Lref) * 3.0 + 0.5) / 3.0);              // steps of a third of an octave keep each patch flat
        float r = L / Lref;
        // halftone dots on the border: below 0.9 the dots start, below 0.62 the whole patch is the shadow tone
        vec2 p = vec2(fc.x + fc.y, fc.x - fc.y) * 0.7071 / 7.0;
        float rd = length(fract(p) - 0.5);
        float t = clamp((0.9 - r) / 0.28, 0.0, 1.0);                      // 0 light .. 1 shadow
        float dots = t >= 0.999 ? 1.0 : smoothstep(rd - 0.04, rd + 0.04, 0.6 * sqrt(t));
        dots = max(dots, step(0.999, t));
        vec3 base = chroma * Lref;
        vec3 lit = base, sh = base * vec3(0.55, 0.52, 0.68);              // the shadow tone is cooler
        vec3 col = mix(lit, sh, dots);
        // bold saturated colour in gamma space
        vec3 g = pow(clamp(col / (col + 0.9) * 1.9, 0.0, 1.0), vec3(0.9));
        float gl = dot(g, vec3(0.2126, 0.7152, 0.0722));
        g = clamp(gl + (g - gl) * 1.4, 0.0, 1.0);
        // brush outline: wider near the camera, wider on silhouettes than on creases, with a swelling and thinning stroke
        float near = clamp(uFocus / d0, 0.55, 1.7);
        float brush = 0.65 + 0.7 * vn(fc * 0.03 + 5.0);
        float Rs = clamp(2.6 * near * brush, 1.4, 6.0), Rc = clamp(1.3 * near * brush, 0.8, 3.0);
        float de = 0.0, ne = 0.0;
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.7854 + 0.2;
          vec2 o = vec2(cos(a), sin(a)) * px;
          de = max(de, abs(dd(uv + o * Rs) - d0) / d0);
          ne = max(ne, 1.0 - dot(n0, nrm(uv + o * Rc)));
        }
        float line = max(smoothstep(0.014, 0.035, de), smoothstep(0.22, 0.5, ne));
        g = mix(g, vec3(0.04, 0.035, 0.05), line);
        return vec4(outc(g), 1.0);
      }`,
  },
};
