// Art style 63: Spray stencil. Inputs C D (colour, depth).
// Three stencil layers sprayed on a rough concrete wall, in order: a pale layer (every shade except the lightest), a colour layer (the mid and dark shades,
// in the colour of the scene, saturated) and a black key layer (the darkest shades and the silhouettes from the depth). Each layer is a little out of register,
// has soft overspray at its edges (a blurred mask cut by speckle) and the black layer lets paint run down in thin drips below its dark areas.
window.ARTS = window.ARTS || {};
ARTS['spray-stencil'] = {
  id: 'spray-stencil', name: 'Spray stencil', group: 'Print and paper', inputs: 'C D',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float hs(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      // tone 0 dark .. 1 light of the scene at a point (gamma space), 1 for the sky
      float toneAt(vec2 p){ return texture2D(tDepth, p).x > 0.9999 ? 1.2 : pow(clamp(lum(texture2D(tColor, p).rgb) * 1.15, 0.0, 1.0), 0.4545); }
      // blurred coverage of "tone < thr" (the stencil is cut where it is true), soft by r px
      float mask(vec2 uv, float thr, float r, float sc){
        vec2 px = 1.0 / uRes; float s = step(toneAt(uv), thr);
        for (int i = 0; i < 12; i++) {
          float an = float(i) * 2.39996, rr = sqrt((float(i) + 0.5) / 12.0) * r * sc;
          s += step(toneAt(uv + vec2(cos(an), sin(an)) * rr * px), thr);
        }
        return s / 13.0;
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        float z = linDepth(uv), sky = texture2D(tDepth, uv).x > 0.9999 ? 1.0 : 0.0;
        // the wall: rough concrete, pale grey with pits and a slow stain
        float rough = fbm(fc / sc * 0.05) * 0.6 + fbm(fc / sc * 0.35) * 0.4;
        float pit = step(0.93, vn(fc / sc * 1.4 + 11.0)) * 0.5 + step(0.975, h21(floor(fc / sc * 0.8) + 4.0)) * 0.5;
        vec3 wall = vec3(0.30, 0.285, 0.265) * (0.62 + 0.55 * rough) * (1.0 - 0.3 * pit);
        // the scene colour as paint: saturated
        vec3 sc3 = texture2D(tColor, uv).rgb; float L = lum(sc3);
        vec3 paint = max(mix(vec3(L), sc3, 1.9), 0.0);
        paint = pow(floor(pow(clamp(paint, 0.0, 1.0), vec3(0.4545)) * 3.0 + 0.5) / 3.0, vec3(2.2));    // the sprayed colour is flat
        float spk = hs(floor(fc / sc));                         // speckle: the overspray is a cloud of drops
        // layer 1: pale paint where the tone is below the highest light
        vec2 o1 = vec2(2.0, -1.5) * sc * px, o2 = vec2(-2.5, 1.5) * sc * px, o3 = vec2(0.0);
        float m1 = mask(uv + o1, 1.1, 4.0, sc), m2 = mask(uv + o2, 0.86, 6.0, sc), m3 = mask(uv + o3, 0.60, 3.0, sc);
        // the black key layer also cuts the silhouettes found from the depth
        float de = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * px * 1.6 * sc;
          de = max(de, abs(linDepth(uv + o) - z) / z);
        }
        m3 = max(m3, smoothstep(0.03, 0.07, de) * (1.0 - sky * 0.0));
        // overspray: the soft mask is cut by speckle, so the edge is grit, not a smooth blur
        float c1 = smoothstep(0.45, 0.62, m1 + (spk - 0.5) * 0.55 + 0.1);
        float c2 = smoothstep(0.45, 0.62, m2 + (hs(floor(fc / sc) + 17.0) - 0.5) * 0.55);
        float c3 = smoothstep(0.45, 0.62, m3 + (hs(floor(fc / sc) + 31.0) - 0.5) * 0.45);
        // paint runs: below the black layer, a few columns let the paint run down in a thin line that ends in a bead
        float run = 0.0;
        float colI = floor(fc.x / (3.0 * sc));
        float gate = step(0.92, h21(vec2(colI, 5.7))), len = (20.0 + 70.0 * h21(vec2(colI, 8.3))) * sc;
        float inCol = 1.0 - smoothstep(0.8 * sc, 1.3 * sc, abs(fract(fc.x / (3.0 * sc)) - 0.5) * 3.0 * sc);
        if (gate > 0.5 && c3 < 0.5) {
          for (int k = 1; k <= 22; k++) {
            float dist = float(k) * 3.0 * sc;
            if (dist > len) break;
            vec2 q = uv + vec2(0.0, dist) * px;                       // up the screen: the dark area above this pixel
            if (step(toneAt(q), 0.60) > 0.5) { run = inCol * (1.0 - smoothstep(len * 0.8, len, dist)); break; }
          }
        }
        // compose: wall, then the three layers in order
        vec3 pale = mix(vec3(0.84, 0.78, 0.64), paint + vec3(0.12), 0.35) * (0.92 + 0.12 * hs(floor(fc / sc * 0.9)));
        vec3 col = wall;
        col = mix(col, pale * 1.05, c1 * 0.93);
        col = mix(col, paint * 0.9 * (0.9 + 0.1 * spk), c2 * 0.95);
        col = mix(col, vec3(0.02, 0.02, 0.03) * (0.9 + 0.2 * rough), max(c3, run) * 0.96);
        // the wall texture shows through the paint a little
        col *= 0.9 + 0.2 * rough;
        return vec4(col * mix(1.0, 1.8, smoothstep(0.5, 0.9, lum(col))), 1.0);
      }`,
  },
};
