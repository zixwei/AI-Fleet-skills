// Art style 57: Manga impact. Inputs C D B (colour, depth, beat times).
// Black ink on white paper: screentone dots for the grey tones (45 degree grid), black solid shadows, ink outlines.
// At each beat: one inverted frame (the first 0.06 s), and speed lines from the centre of the frame (about 0.5 s, redrawn 12 times per second).
window.ARTS = window.ARTS || {};
ARTS['manga-impact'] = {
  id: 'manga-impact', name: 'Manga impact', group: 'Hand-made animation', inputs: 'C D B',
  labels: 'halo',   // K.label text stays readable over the strokes
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float tone(vec2 uv){ float L = lum(texture2D(tColor, uv).rgb); return pow(clamp(L / (L + 0.9) * 1.9, 0.0, 1.0), 0.6); }
      vec3 outc(vec3 g){ return pow(clamp(g, 0.0, 1.0), vec3(2.2)) * 2.3; }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float asp = uRes.x / uRes.y;
        float g = tone(uv), d0 = dd(uv);
        // screentone: dots on a 45 degree grid, 7 px apart; the darker the tone, the bigger the dot, and they merge in the darkest tone
        vec2 p = vec2(fc.x + fc.y, fc.x - fc.y) * 0.7071 / 7.0;
        float rd = length(fract(p) - 0.5);
        float ink = clamp((0.9 - g) / 0.8, 0.0, 1.0);
        float dots = smoothstep(rd - 0.07, rd + 0.07, 0.58 * sqrt(ink));
        dots = max(dots, smoothstep(0.82, 0.92, ink));
        float paper = 1.0, black = 0.05;
        float col = mix(paper, black, dots * 0.96);
        // ink outline: depth edges and strong tone edges
        float de = 0.0, ce = 0.0, R = 1.7 + 0.8 * vn(fc * 0.04);
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.7854 + 0.2;
          vec2 o = vec2(cos(a), sin(a)) * R * px;
          de = max(de, abs(dd(uv + o) - d0) / d0);
          ce = max(ce, abs(tone(uv + o) - g));
        }
        float line = max(smoothstep(0.012, 0.035, de), smoothstep(0.2, 0.4, ce) * 0.85);
        col = mix(col, black, line);
        // beat: speed lines from the centre, drawn again 12 times per second, black on the picture
        float bi = beatIdx(), age = beatAge();
        if (bi >= 0.0) {
          vec2 q = (uv - 0.5) * vec2(asp, 1.0);
          float r = length(q), a = atan(q.y, q.x);
          float s = 1.0 - smoothstep(0.3, 0.55, age);
          float N = 120.0, ab = a / 6.2832 * N + 0.5 * h21(vec2(floor(a * 7.0), bi));
          float id = floor(ab), f = fract(ab);
          float fl = floor(age * 12.0) + bi * 5.0;
          float h1 = h21(vec2(id, fl)), h2 = h21(vec2(id + 91.7, bi));
          float w = 0.25 + 0.6 * h1, r0 = 0.24 + 0.26 * h2;
          float tw = w * smoothstep(r0, r0 + 0.5, r);                    // thin at the inner end, wide at the outside
          float m = step(abs(f - 0.5), 0.5 * tw) * step(r0, r) * step(0.3, h1 + 0.3 * h2 + 0.25);
          col = mix(col, black, m * s);
        }
        // one inverted frame at the beat
        if (bi >= 0.0 && age < 0.06) col = 1.0 - col * 0.96;
        return vec4(outc(vec3(col)), 1.0);
      }`,
  },
};
