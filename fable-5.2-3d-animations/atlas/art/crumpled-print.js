// Art style 70: Crumpled print. Inputs C B (colour, beat times).
// The picture is printed on paper. Before each beat (from about 1.1 s ahead, with the peak 0.25 s before it) the paper crumples: the picture shrinks a little, bends, and breaks into flat
// facets (a Voronoi cell grid of random scale for each beat) that are lit differently, with dark crease lines and a pale scuff beside each. From the beat the paper opens over 1 s and keeps
// the crease lines of every crumple so far (faint, but they stay). The beat index seeds each crumple, so a state holds no memory. A beat at time 0 or earlier has no crumple before it.
// Limit: labels are drawn after the post shader, so they do not crumple.
window.ARTS = window.ARTS || {};
ARTS['crumpled-print'] = {
  id: 'crumpled-print', name: 'Crumpled print', group: 'Print and paper', inputs: 'C B',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 3; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        float act = 0.0, crease = 0.0, scuff = 0.0, shade = 0.0;
        for (int i = 0; i < 8; i++) {
          if (i >= uBeatN) break;
          float bk = uBeats[i];
          if (bk < 0.05) continue;
          float u = uCanon - bk;
          float amt = smoothstep(-1.1, -0.25, u) * (1.0 - smoothstep(0.0, 1.0, u));      // crumple state of this event
          float vis = max(amt, 0.42 * smoothstep(-0.4, 0.0, u));                             // the creases stay after the paper opens
          if (vis < 0.01) continue;
          float fi = float(i) + 1.0;
          // facets: Voronoi grids at two scales (large facets lit differently, a finer net of creases); scale and offset depend on the event
          float big = 0.0, fine = 0.0; vec2 tilt = vec2(0.0);
          for (int oc = 0; oc < 2; oc++) {
            float cell = oc == 0 ? 120.0 : 58.0;
            vec2 p = fc / (cell * sc * (0.85 + 0.2 * h21(vec2(fi, 3.3 + float(oc))))) + fi * 13.7 + float(oc) * 5.3;
            p += (vec2(fbm(p * 1.3 + 2.0), fbm(p * 1.3 + 19.0)) - 0.5) * 0.7;      // wavy creases, not a regular net
            vec2 ip = floor(p), fp = fract(p); float f1 = 8.0, f2 = 8.0; vec2 cid = ip;
            for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
              vec2 g = vec2(float(x), float(y)); vec2 o = vec2(h21(ip + g + fi + float(oc) * 3.7), h21(ip + g + fi + 57.3 + float(oc) * 3.7));
              vec2 rv = g + o - fp; float d = dot(rv, rv);
              if (d < f1) { f2 = f1; f1 = d; cid = ip + g; } else if (d < f2) f2 = d;
            }
            float edge = sqrt(f2) - sqrt(f1);
            float w = oc == 0 ? 1.0 : 0.55;
            crease = max(crease, (1.0 - smoothstep(0.0, 0.035, edge)) * vis * w);
            scuff = max(scuff, smoothstep(0.035, 0.07, edge) * (1.0 - smoothstep(0.07, 0.12, edge)) * vis * w);
            if (oc == 0) tilt = vec2(h21(cid + fi + 3.1), h21(cid + fi + 9.7)) - 0.5;
          }
          shade += dot(tilt, vec2(-0.6, 0.8)) * 0.7 * amt;
          act = max(act, amt);
        }
        // the paper bends and shrinks while crumpled
        vec2 wv = (vec2(fbm(fc / sc * 0.012), fbm(fc / sc * 0.012 + 40.0)) - 0.5) * 60.0 * sc * act;
        vec2 u = (uv - 0.5) * (1.0 - 0.06 * act) + 0.5 + wv * px;
        vec3 c0 = texture2D(tColor, u).rgb;
        c0 = max(mix(vec3(lum(c0)), c0, 1.1), 0.0);
        float grain = 0.55 * vn(fc / sc * 0.8) + 0.45 * vn(vec2(fc.x * 0.05 + fc.y * 0.3, fc.y * 0.04 - fc.x * 0.25) / sc);
        vec3 paper = vec3(0.965, 0.94, 0.88) * (0.95 + 0.07 * grain);
        // printed ink on paper: the picture, a little lighter than the scene
        vec3 col = mix(c0 * paper, paper * 0.8, 0.05);
        col *= 1.0 + shade;
        col *= 1.0 - 0.1 * act;
        // crease: the ink cracks along it (paper shows), with a thin dark core and a pale scuff beside it
        col = mix(col, paper * mix(1.0, 1.7, smoothstep(0.4, 0.9, lum(col))), 0.3 * scuff);
        col = mix(col, col * 0.32, 0.8 * crease * (0.6 + 0.4 * vn(fc / sc * 0.5)));
        return vec4(col * mix(1.0, 2.0, smoothstep(0.5, 0.9, lum(col))), 1.0);
      }`,
  },
};
