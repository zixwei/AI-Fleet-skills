// Art style 90: Gold-leaf folding screen. Inputs C D (colour, depth).
// A six-panel screen covered with squares of gold leaf (40 px, each with its own tone, a bright and a dark seam where leaves overlap).
// Mineral colour is painted on the leaf: the scene colour is made flat and posterised to a mineral palette (azurite, malachite, cinnabar,
// ochre, shell white, sumi black) and carries a 1.5 px grain through which the gold shows. The empty background is bare gold leaf.
// Gold cloud bands cover 2 depth ranges: log2(depth / uFocus) from 0.32 to 0.52 and from -0.57 to -0.43, so they follow the scene size and
// do not jump between frames. Their edges are scalloped (cusped billows plus a slow noise) and each has a thin dark gold line.
// The panel folds: each of the 5 folds is a soft vertical band (a dark valley or a bright ridge in turn), the panels are shaded in turn,
// and the picture is shifted a few px in a zigzag so it bends at the folds.
window.ARTS = window.ARTS || {};
ARTS['gold-leaf-folding-screen'] = {
  id: 'gold-leaf-folding-screen', name: 'Gold-leaf folding screen', group: 'World traditions', inputs: 'C D',
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
      float zOf(vec2 uv){ return log2(dd(uv) / uFocus); }
      // cloud band: centre c and half width w in log depth units; returns 1 inside. The edge is scalloped.
      float band(float z, vec2 fc, float sc, float c, float w, float seed){
        float billow = 0.045 * abs(sin(fc.x / (46.0 * sc) + 2.5 * fbm(vec2(fc.x / (200.0 * sc), seed)))) + 0.05 * (fbm(fc / (130.0 * sc) + seed) - 0.5);
        return smoothstep(w, w - 0.006, abs(z - c + billow));
      }
      vec4 postFX(vec2 uv){
        vec2 res = uRes, fc = uv * res; float sc = res.y / 720.0;
        float pw = res.x / 6.0, f = fc.x / pw;
        float tri = abs(fract(f * 0.5) * 2.0 - 1.0);                        // 1 at a fold, 0 at the next fold
        float dxs = 0.04 * pw * (tri - 0.5);
        vec2 q = uv + vec2(dxs / res.x, 0.0);                               // the picture bends at the folds
        vec2 fq = q * res;
        // folds: a soft vertical band at each, alternating valley and ridge
        float pi = floor(f), fd = min(fract(f), 1.0 - fract(f)) * pw;       // px from the nearest fold
        float fi = fract(f) < 0.5 ? pi : pi + 1.0;
        float valley = mod(fi, 2.0), band_ = exp(-pow(fd / (9.0 * sc), 2.0));
        float fold = valley > 0.5 ? 1.0 - 0.3 * band_ : 1.0 + 0.1 * band_ - 0.1 * exp(-pow(fd / (1.5 * sc), 2.0));
        float panel = mix(0.93, 1.07, mod(pi, 2.0)) * (1.0 + 0.07 * (fract(f) - 0.5) * (mod(pi, 2.0) * 2.0 - 1.0));
        if (fi < 0.5 || fi > 5.5) fold = 1.0;                              // the edges of the screen are not folds
        // gold leaf squares
        vec2 gp = fq / (40.0 * sc), gi = floor(gp), gf = fract(gp);
        float tone = h21(gi + 2.0), tilt = h21(gi + 8.0);
        float seam = smoothstep(0.035, 0.0, gf.x) * 0.5 + smoothstep(0.035, 0.0, gf.y) * 0.5;       // dark where a leaf starts
        float lift = smoothstep(0.96, 1.0, gf.x) * 0.4 + smoothstep(0.96, 1.0, gf.y) * 0.4;          // bright where the next one overlaps
        vec3 gold = mix(vec3(0.84, 0.58, 0.17), vec3(0.96, 0.74, 0.28), tone);
        gold *= (0.88 + 0.22 * tilt) * (0.9 + 0.2 * fbm(fq * 0.08 / sc)) * (1.0 - 0.28 * seam + 0.18 * lift);
        gold *= 1.0 + 0.12 * (vn(fq * 0.9 / sc) - 0.5);                       // burnish
        // mineral colour: flat, in a palette chosen by hue
        vec3 c = texture2D(tColor, q).rgb;
        vec3 g = pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2));
        float L = lum(g), mx = max(max(g.r, g.g), g.b), mn = min(min(g.r, g.g), g.b), satn = (mx - mn) / max(mx, 0.05), h = hueOf(g);
        vec3 mineral;
        if (satn < 0.2) mineral = L > 0.72 ? vec3(0.93, 0.9, 0.82) : L > 0.38 ? vec3(0.62, 0.5, 0.36) : vec3(0.08, 0.07, 0.07);
        else if (L < 0.14) mineral = vec3(0.08, 0.07, 0.07);
        else if (h < 0.04 || h >= 0.93) mineral = vec3(0.72, 0.2, 0.14);
        else if (h < 0.2) mineral = vec3(0.68, 0.46, 0.18);
        else if (h < 0.46) mineral = vec3(0.14, 0.5, 0.34);
        else if (h < 0.8) mineral = vec3(0.12, 0.3, 0.62);
        else mineral = vec3(0.5, 0.25, 0.5);
        vec2 mg = floor(fc / (1.5 * sc));
        float grain = h21(mg);
        mineral *= 0.82 + 0.34 * grain;
        float d0 = dd(q), z = log2(d0 / uFocus);
        float sky = max(step(0.9999, texture2D(tDepth, q).x), smoothstep(2.0, 2.4, d0 / uFocus));
        // sumi contour on depth and colour edges
        float de = 0.0, ge = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * 1.4 * sc / res;
          de = max(de, abs(dd(q + o) - d0) / d0); ge = max(ge, length(texture2D(tColor, q + o).rgb - c));
        }
        float line = max(smoothstep(0.02, 0.05, de), smoothstep(0.12, 0.3, ge) * 0.8);
        float paint = (1.0 - sky) * mix(0.96, 0.8, step(0.88, grain));       // gold shows through the grain
        vec3 col = mix(gold, mineral, paint);
        col = mix(col, vec3(0.06, 0.045, 0.04), line * (1.0 - sky * 0.5) * 0.85);
        // gold cloud bands over 2 depth ranges: flat gold-on-gold with a sand of bright flecks and a dark gold edge line
        float b1 = band(z, fc, sc, 0.42, 0.1, 3.0), b2 = band(z, fc, sc, -0.5, 0.07, 11.0);
        float bm = max(b1, b2);
        vec3 cloud = gold * vec3(1.06, 1.04, 1.0) * (1.0 + 0.2 * step(0.97, h21(mg + 5.0)));
        // edge line: the 0.5 level of the band mask, 1.5 px wide (measured with the screen derivative of the mask)
        float bm1 = b1, bm2 = b2;
        float bl = max(1.0 - smoothstep(0.0, 1.5, abs(bm1 - 0.5) / max(fwidth(bm1), 1e-4)) , 1.0 - smoothstep(0.0, 1.5, abs(bm2 - 0.5) / max(fwidth(bm2), 1e-4)));
        bl *= step(0.001, max(fwidth(bm1), fwidth(bm2)));
        col = mix(col, cloud, bm);
        col = mix(col, vec3(0.5, 0.3, 0.07), bl * 0.85);
        col *= panel * fold;
        return vec4(lin(col), 1.0);
      }`,
  },
};
