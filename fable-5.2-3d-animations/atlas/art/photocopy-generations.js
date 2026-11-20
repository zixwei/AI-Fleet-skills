// Art style 48: Photocopy generations. Inputs C B (colour, beat times).
// Black toner on white paper with streaks. Each beat is a copy of the copy before it, written as a closed form of the generation number
// gen = beatIdx() + 1 (0 before the first beat). A higher generation has more contrast (the grey tones fall to black and white), a softer picture
// (less detail), more specks, a darker border of the copier and a small shift of the page. The streaks and specks of every earlier generation stay.
window.ARTS = window.ARTS || {};
ARTS['photocopy-generations'] = {
  id: 'photocopy-generations', name: 'Photocopy generations', group: 'An instrument sees the scene', inputs: 'C B',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      vec4 postFX(vec2 uv0){
        vec2 px = 1.0 / uRes;
        float sc = uRes.y / 1080.0;
        float gen = beatIdx() + 1.0;                           // 0 = the original, 1 = the first copy, ...
        float gc = min(gen, 6.0);
        // the page shifts a little in each copy: a turn and a move
        vec2 cc = uv0 - 0.5;
        float ang = 0.0016 * gc * sin(gc * 2.1 + 0.5);
        vec2 uv = 0.5 + vec2(cc.x * cos(ang) - cc.y * sin(ang), cc.x * sin(ang) + cc.y * cos(ang)) + vec2(0.0011 * sin(gc * 1.7), 0.0016 * cos(gc * 2.3)) * gc;
        vec2 fc = uv0 * uRes;
        // softer picture: a blur that grows with the generation (10 taps on a spiral)
        float rb = (0.4 + 0.95 * gc) * sc;
        vec3 acc = texture2D(tColor, uv).rgb; float ws = 1.0;
        for (int i = 0; i < 10; i++) {
          float a = float(i) * 2.39996, r = sqrt((float(i) + 0.5) / 10.0) * rb;
          acc += texture2D(tColor, uv + vec2(cos(a), sin(a)) * r * px).rgb; ws += 1.0;
        }
        float L = lum(acc / ws);
        float g = pow(clamp(L, 0.0, 1.0), 0.4545);              // grey in gamma space
        // contrast: the copier pushes the greys to the ends; the pivot moves up, so mid greys go to toner
        float k = 1.2 + 1.0 * gc;
        float v = (g - (0.56 + 0.015 * gc)) * k + 0.5;
        // toner grain: the grain is coarser and stronger in each copy
        float gs = 1.0 + 0.5 * gc;
        float grain = vn(fc / gs) * 0.6 + h21(floor(fc / gs) * 1.31 + gc) * 0.4 - 0.5;
        v += grain * (0.16 + 0.05 * gc);
        float paperV = smoothstep(0.35, 0.65, v);               // 1 paper, 0 toner
        float toner = 1.0 - paperV;
        // streaks and specks of each generation up to this one: they stay in later copies
        float streak = 0.0, speck = 0.0, drop = 0.0;
        for (int j = 1; j <= 6; j++) {
          if (float(j) > gen) break;
          float fj = float(j);
          // a streak: a thin vertical line (drum dirt) with a start and an end along the page
          float col = floor(fc.x / (2.0 * sc));
          float hs = h21(vec2(col, fj * 7.7));
          if (hs > 0.965) {
            float y0 = h21(vec2(col, fj * 3.3)), len = 0.25 + 0.6 * h21(vec2(col, fj * 5.1));
            float yy = uv0.y;
            float on = smoothstep(y0, y0 + 0.02, yy) * (1.0 - smoothstep(y0 + len - 0.05, y0 + len, yy));
            float w = abs(fract(fc.x / (2.0 * sc)) - 0.5);
            streak = max(streak, on * (1.0 - smoothstep(0.25, 0.5, w)) * (0.55 + 0.45 * h21(vec2(col, fj))));
          }
          // specks: black dots on the paper; each generation adds more
          vec2 cell = floor(fc / (3.0 * sc));
          float hp = h21(cell + fj * 17.3);
          speck = max(speck, step(1.0 - 0.0035 * fj, hp) * (1.0 - smoothstep(0.25, 0.5, length(fract(fc / (3.0 * sc)) - 0.5))));
          // dropouts: white holes in the toner
          float hd = h21(floor(fc / (2.0 * sc)) + fj * 31.7);
          drop = max(drop, step(1.0 - 0.004 * fj, hd));
        }
        toner = max(toner * (1.0 - drop * 0.9), max(streak, speck));
        // the copier edge: a dark band at the border that grows with the generation, with a ragged inner edge
        vec2 ed = min(uv0, 1.0 - uv0) * uRes / sc;              // pixels from the border
        float band = 6.0 * gc * (0.6 + 0.8 * vn(vec2(fc.x, fc.y) * 0.03));
        float edge = 1.0 - smoothstep(band * 0.5, band, min(ed.x, ed.y));
        toner = max(toner, edge * step(0.5, gen));
        // light is uneven over the page
        float lightV = 0.96 + 0.04 * vn(fc * 0.004 + 3.0);
        vec3 paper = vec3(0.97, 0.965, 0.95) * lightV * (1.0 - 0.015 * gc);
        vec3 ink = vec3(0.0);
        vec3 col = mix(paper, ink, toner);
        return vec4(col * 2.2, 1.0);
      }`,
  },
};
