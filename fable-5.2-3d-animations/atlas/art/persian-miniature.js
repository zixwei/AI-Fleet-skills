// Art style 81: Persian miniature. Inputs C D (colour, depth).
// Flat gouache colour with the shading taken out, a fine dark brush line, a gold sky, a small repeat pattern on each surface
// (the motif is chosen by the surface colour), and a painted border of lapis, red and gold bands with rosettes.
// The sky is the empty background and the far part of the scene (more than about 2.2 times uFocus), so it adapts to the scene size.
window.ARTS = window.ARTS || {};
ARTS['persian-miniature'] = {
  id: 'persian-miniature', name: 'Persian miniature', group: 'World traditions', inputs: 'C D',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 4.0); }
      // small motifs in a cell p (0..1): dot, diamond ring, five-petal flower, cross
      float motif(vec2 p, float k){
        vec2 c = p - 0.5; float r = length(c), m = abs(c.x) + abs(c.y);
        if (k < 0.5) return smoothstep(0.24, 0.18, r);
        if (k < 1.5) return smoothstep(0.36, 0.30, m) - smoothstep(0.17, 0.11, m);
        if (k < 2.5) return smoothstep(0.02, -0.02, r - (0.1 + 0.26 * (0.5 + 0.5 * cos(5.0 * atan(c.y, c.x)))));
        return max(smoothstep(0.1, 0.05, abs(c.x)) * step(abs(c.y), 0.3), smoothstep(0.1, 0.05, abs(c.y)) * step(abs(c.x), 0.3));
      }
      vec3 lin(vec3 g){ return pow(clamp(g, 0.0, 1.0), vec3(2.2)) * mix(0.62, 2.4, smoothstep(0.6, 0.95, lum(g))); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        vec3 c = texture2D(tColor, uv).rgb;
        float d0 = dd(uv);
        float sky = max(step(0.9999, texture2D(tDepth, uv).x), smoothstep(2.0, 2.4, d0 / uFocus));
        // gouache: the shading is mostly removed, the chroma is kept and made stronger, then posterised in gamma space
        vec3 g = pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2));
        float L = max(lum(g), 0.04);
        vec3 chroma = g / L;
        float satn = (max(max(g.r, g.g), g.b) - min(min(g.r, g.g), g.b)) / max(max(max(g.r, g.g), g.b), 0.05);
        float val = mix(0.6, L, 0.25 + 0.65 * (1.0 - smoothstep(0.05, 0.3, satn)));
        vec3 f = mix(vec3(1.0), chroma, 1.7) * val;
        f = mix(f, f * vec3(1.0, 0.93, 0.78), 1.0 - smoothstep(0.05, 0.3, satn));   // grey becomes ivory
        f = floor(clamp(f, 0.0, 1.0) * 5.0 + 0.5) / 5.0;
        f = clamp(f * 1.06, 0.0, 1.0);
        // small repeat pattern: the motif follows the surface colour; light motifs on dark ground and dark motifs on light ground
        float key = dot(floor(f * 3.0), vec3(1.0, 3.0, 9.0));
        float kind = floor(h21(vec2(key, 3.7)) * 4.0);
        float cell = 24.0 * sc;
        vec2 cp = fc / cell; cp.x += 0.5 * mod(floor(cp.y), 2.0);
        float pat = motif(fract(cp), kind);
        vec3 pc = lum(f) > 0.55 ? f * vec3(0.62, 0.58, 0.55) : mix(f, vec3(1.0, 0.9, 0.6), 0.6);
        vec3 col = f;
        // edges of depth and colour: the fine brush line, and no pattern next to it
        float de = 0.0, ge = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * px * 1.4 * sc;
          de = max(de, abs(dd(uv + o) - d0) / d0);
          ge = max(ge, length(texture2D(tColor, uv + o).rgb - c));
        }
        float line = max(smoothstep(0.02, 0.05, de), smoothstep(0.1, 0.25, ge) * 0.8);
        col = mix(col, pc, pat * 0.85 * (1.0 - line));
        col = mix(col, vec3(0.1, 0.05, 0.04), line * 0.92);
        // gold sky: burnished gold with a few fine painted cloud curls
        if (sky > 0.5) {
          float gn = fbm(fc * 0.004 / sc);
          vec3 gold = mix(vec3(0.9, 0.64, 0.17), vec3(1.0, 0.82, 0.38), gn) * (0.93 + 0.1 * h21(floor(fc / (2.0 * sc))));
          float cf = fbm(fc * 0.0035 / sc + 9.0) * 14.0;
          float curl = smoothstep(0.06, 0.02, abs(fract(cf) - 0.5) / 0.5 * 0.5) * smoothstep(0.5, 0.62, fbm(fc * 0.0025 / sc + 20.0));
          col = mix(gold, vec3(0.62, 0.36, 0.08), curl * 0.7);
          // the brush line also holds where an object meets the sky
          col = mix(col, vec3(0.1, 0.05, 0.04), line * 0.92);
        }
        // painted border: gold, cream, lapis with gold rosettes, cream, red, gold (from the frame edge inward)
        float bw = 0.055 * uRes.y;
        vec2 ed = min(fc, uRes - fc);
        float e = min(ed.x, ed.y);
        if (e < bw) {
          float t = e / bw;
          float along = ed.x < ed.y ? fc.y : fc.x;
          vec3 gold = vec3(0.92, 0.7, 0.2), cream = vec3(0.95, 0.9, 0.75), lapis = vec3(0.1, 0.16, 0.5), red = vec3(0.72, 0.13, 0.1);
          vec3 b = gold;
          if (t > 0.08) b = cream;
          if (t > 0.14) {
            b = lapis * (0.9 + 0.2 * h21(floor(fc / (2.0 * sc))));
            float bh = 0.66 * bw;                       // band height: rosette and dot cells are square
            float a = mod(along, 2.0 * bh) / bh, qy = (t - 0.14) / 0.66;
            if (a < 1.0) b = mix(b, gold, motif(vec2(a, qy), 2.0));
            else b = mix(b, cream, motif(vec2((a - 1.0) * 1.6 - 0.3, (qy - 0.5) * 1.6 + 0.5), 0.0));
          }
          if (t > 0.8) b = cream;
          if (t > 0.86) b = red;
          if (t > 0.93) b = gold;
          col = b;
        }
        return vec4(lin(col), 1.0);
      }`,
  },
};
