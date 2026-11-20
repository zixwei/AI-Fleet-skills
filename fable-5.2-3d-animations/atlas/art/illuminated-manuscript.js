// Art style 82: Illuminated manuscript. Inputs C D B (colour, depth, beat times).
// Flat colour (a medieval palette chosen by hue, no shading) and a black line on vellum. Gold leaf (the sky, and the yellow surfaces)
// flashes: each 36 px leaf square glints on its own phase, and all of them flash at each beat. A vine border runs round the page:
// the vine is cut into one part for each beat, and the part for beat k grows from the end of the part before it in about 0.9 s.
window.ARTS = window.ARTS || {};
ARTS['illuminated-manuscript'] = {
  id: 'illuminated-manuscript', name: 'Illuminated manuscript', group: 'World traditions', inputs: 'C D B',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 4.0); }
      float hueOf(vec3 g){ return fract(atan(1.7320508 * (g.g - g.b), 2.0 * g.r - g.g - g.b) / 6.2831853); }
      vec3 lin(vec3 g){ return pow(clamp(g, 0.0, 1.0), vec3(2.2)) * mix(0.62, 2.4, smoothstep(0.6, 0.95, lum(g))); }
      // beat k: its part of the vine is complete when its growth is 1
      float growth(){ float k = beatIdx(); return k < 0.0 ? 0.0 : k + (1.0 - pow(1.0 - clamp(beatAge() / 0.9, 0.0, 1.0), 2.0)); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        // ---- picture ----
        vec3 c = texture2D(tColor, uv).rgb;
        vec3 g = pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2));
        float L = lum(g), mx = max(max(g.r, g.g), g.b), mn = min(min(g.r, g.g), g.b), satn = (mx - mn) / max(mx, 0.05), h = hueOf(g);
        float d0 = dd(uv);
        float sky = max(step(0.9999, texture2D(tDepth, uv).x), smoothstep(2.0, 2.4, d0 / uFocus));
        float goldArea = sky;
        vec3 col;
        if (satn < 0.2) col = L > 0.72 ? vec3(0.95, 0.92, 0.82) : L > 0.38 ? vec3(0.78, 0.69, 0.5) : vec3(0.2, 0.14, 0.1);
        else if (L < 0.14) col = vec3(0.12, 0.08, 0.07);
        else {
          if (h < 0.04 || h >= 0.96) col = vec3(0.78, 0.16, 0.1);
          else if (h < 0.12) col = vec3(0.8, 0.42, 0.12);
          else if (h < 0.2) { col = vec3(0.8, 0.6, 0.2); goldArea = max(goldArea, step(0.55, L) * step(0.45, satn)); }
          else if (h < 0.45) col = vec3(0.17, 0.45, 0.25);
          else if (h < 0.7) col = vec3(0.1, 0.2, 0.58);
          else if (h < 0.85) col = vec3(0.38, 0.18, 0.48);
          else col = vec3(0.8, 0.38, 0.5);
          col *= L < 0.3 ? 0.78 : 1.0;
        }
        // vellum shows through thin paint: a little grain in the colour
        col *= 0.95 + 0.1 * fbm(fc * 0.3 / sc);
        // black line on depth and colour edges
        float de = 0.0, ge = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * px * 1.4 * sc;
          de = max(de, abs(dd(uv + o) - d0) / d0);
          ge = max(ge, length(texture2D(tColor, uv + o).rgb - c));
        }
        float line = max(smoothstep(0.02, 0.05, de), smoothstep(0.12, 0.3, ge) * 0.85);
        // gold leaf: square leaves with a hair seam, each one glinting on its own phase; all flash on the beat
        if (goldArea > 0.5) {
          vec2 gc = fc / (36.0 * sc), gi = floor(gc), gf = fract(gc);
          float ph = h21(gi + 3.0) * 6.2831, tone = h21(gi + 11.0);
          float seam = max(smoothstep(0.04, 0.0, gf.x), smoothstep(0.04, 0.0, gf.y));
          float glint = pow(0.5 + 0.5 * sin(uTime * 2.4 + ph), 5.0) * (0.3 + 0.7 * h21(gi + 7.0));
          float beatFlash = beatIdx() < 0.0 ? 0.0 : exp(-beatAge() * 3.5) * (0.5 + 0.5 * h21(gi + 17.0));
          float fl = clamp(glint + beatFlash * 1.1, 0.0, 1.0);
          vec3 gold = mix(vec3(0.82, 0.56, 0.16), vec3(0.96, 0.74, 0.28), tone) * (0.9 + 0.2 * fbm(fc * 0.05 / sc));
          gold = mix(gold, vec3(1.0, 0.95, 0.72), fl * 0.85);
          gold *= 1.0 - 0.25 * seam;
          col = gold * mix(1.0, 1.15, fl);
        }
        col = mix(col, vec3(0.06, 0.04, 0.04), line * 0.95);
        // ---- page border with the vine ----
        float bw = 0.075 * uRes.y;
        vec2 ed = min(fc, uRes - fc);
        float e = min(ed.x, ed.y);
        vec3 vellum = vec3(0.93, 0.84, 0.64) * (0.9 + 0.2 * fbm(fc * 0.02 / sc) + 0.06 * (vn(fc * 0.9 / sc) - 0.5));
        vellum *= 1.0 - 0.16 * smoothstep(bw * 1.1, 0.0, e) * (0.5 + 0.5 * fbm(fc * 0.01 / sc + 4.0));   // darker toward the edge of the skin
        if (e < bw) {
          vec3 b = vellum;
          vec2 hh = 0.5 * uRes - 0.5 * bw, q = fc - 0.5 * uRes, u = abs(q) - hh;
          float t = max(u.x, u.y);                                   // distance from the vine centre line, outward positive
          float s = u.x > u.y ? (q.x < 0.0 ? q.y + hh.y : 2.0 * hh.y + 2.0 * hh.x + (hh.y - q.y))
                              : (q.y > 0.0 ? 2.0 * hh.y + (q.x + hh.x) : 4.0 * hh.y + 2.0 * hh.x + (hh.x - q.x));
          float Lp = 4.0 * (hh.x + hh.y), P = max(float(uBeatN), 1.0);
          float sg = Lp / P * growth();
          float cl = 1.2 * bw, lam = 2.0 * cl;
          float tw = 0.22 * bw * sin(s / lam * 6.2832);
          float stem = smoothstep(0.075 * bw, 0.045 * bw, abs(t - tw)) * smoothstep(sg, sg - 3.0 * sc, s);
          float ci = floor(s / cl), lx = fract(s / cl), side = mod(ci, 2.0) * 2.0 - 1.0;
          float sc0 = (ci + 0.5) * cl;
          float rev = smoothstep(0.0, 0.9 * cl, sg - sc0);          // a leaf opens after the stem passes it
          vec2 lp = vec2((lx - 0.5) * cl, t - 0.22 * bw * sin((ci + 0.5) * 3.14159) - side * 0.2 * bw);
          float lr = length(lp / (vec2(0.5 * cl * 0.95, 0.24 * bw) * max(rev, 0.001)));
          float leaf = (1.0 - smoothstep(0.88, 1.0, lr)) * step(0.001, rev);
          float ring = smoothstep(0.72, 0.8, lr) * leaf;
          float kind = mod(ci, 3.0);
          vec3 lc = kind < 0.5 ? vec3(0.1, 0.2, 0.58) : kind < 1.5 ? vec3(0.78, 0.16, 0.1) : vec3(0.17, 0.45, 0.25);
          float berry = smoothstep(0.08 * bw, 0.05 * bw, length(vec2(lx < 0.5 ? lx : lx - 1.0, 0.0) * cl + vec2(0.0, t - tw))) * step(sc0 - cl, sg);
          b = mix(b, vec3(0.1, 0.07, 0.05), stem * 0.95);
          b = mix(b, lc, leaf);
          b = mix(b, vec3(0.1, 0.07, 0.05), ring * 0.8);
          b = mix(b, vec3(0.92, 0.7, 0.2), berry);
          col = b;
          // the gold rule and the black rule round the picture
          float rule = smoothstep(bw - 7.0 * sc, bw - 6.0 * sc, e);
          col = mix(col, vec3(0.9, 0.68, 0.2), rule);
          col = mix(col, vec3(0.06, 0.04, 0.04), smoothstep(bw - 2.0 * sc, bw - 1.0 * sc, e));
        }
        return vec4(lin(col), 1.0);
      }`,
  },
};
