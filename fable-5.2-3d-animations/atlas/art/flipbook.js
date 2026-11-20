// Art style 58: Flipbook. Inputs C S (colour, frame step).
// Pencil frames on a pad at 8 frames per second: graphite outlines and hatching drawn again on each frame, a binding at the left, paper that shows faint lines of the page below.
// A page curl crosses the frame, moving smoothly from the right to the left (uRealT, the unstepped time), one crossing every 0.5 s.
window.ARTS = window.ARTS || {};
ARTS['flipbook'] = {
  id: 'flipbook', name: 'Flipbook', group: 'Hand-made animation', inputs: 'C S',
  fps: 8,
  labels: 'halo',   // K.label text stays readable over the strokes
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float tone(vec2 uv){ float L = lum(texture2D(tColor, uv).rgb); return pow(clamp(L / (L + 0.9) * 1.9, 0.0, 1.0), 0.8); }
      vec3 nc(vec2 uv){ vec3 c = texture2D(tColor, uv).rgb; return c / (lum(c) + 0.08); }
      vec3 outc(vec3 g){ return pow(clamp(g, 0.0, 1.0), vec3(2.2)) * 2.3; }
      // graphite on one page: 0 = bare paper, 1 = dark pencil. seed changes the hand from page to page.
      float pencil(vec2 uv, float seed){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        vec2 q = uv + (vec2(vn(fc * 0.02 + seed * 9.1), vn(fc * 0.02 + 40.0 + seed * 9.1)) - 0.5) * 4.0 * px;
        float g = tone(q); vec3 n0 = nc(q);
        float e = 0.0;
        for (int i = 0; i < 4; i++) {
          float a = float(i) * 1.5708 + 0.4;
          vec2 o = vec2(cos(a), sin(a)) * 1.8 * px;
          e = max(e, abs(tone(q + o) - g) + 0.5 * length(nc(q + o) - n0));
        }
        float line = smoothstep(0.07, 0.2, e) * (0.7 + 0.3 * vn(fc * 0.15 + seed));
        // hatching: diagonal strokes where it is dark, crossing strokes where it is darker
        float w = fc.x + fc.y + 4.0 * vn(fc * 0.05 + seed * 3.0);
        float s1 = abs(fract(w / 5.0) - 0.5) * 2.0;
        float h1 = step(s1, smoothstep(0.62, 0.2, g) * 0.75);
        float w2 = fc.x - fc.y + 4.0 * vn(fc * 0.05 + 20.0 + seed * 3.0);
        float s2 = abs(fract(w2 / 5.0) - 0.5) * 2.0;
        float h2 = step(s2, smoothstep(0.3, 0.1, g) * 0.8);
        float hatch = max(h1 * 0.55, h2 * 0.5);
        float grain = 0.75 + 0.25 * vn(fc * 1.1 + seed * 5.0);
        return clamp(max(line * 0.95, hatch) * grain, 0.0, 1.0);
      }
      vec4 postFX(vec2 uv0){
        vec2 px = 1.0 / uRes, fc = uv0 * uRes;
        float fi = floor(uTime * 8.0 + 0.5);
        vec2 hand = (vec2(h21(vec2(fi, 2.0)), h21(vec2(fi, 3.0))) - 0.5) * 5.0 * px;   // each drawing sits a little differently on the pad
        vec3 paper = vec3(0.955, 0.945, 0.905) * (0.95 + 0.07 * vn(fc * 0.9) + 0.03 * vn(fc * 0.02));
        vec3 graphite = vec3(0.17, 0.17, 0.19);
        // current page
        vec3 pg = mix(paper, graphite, pencil(uv0 + hand, fi) * 1.0);
        // faint lines of the page below: a copy of a drawing, offset, soft and light
        float below = 0.0;
        for (int k = 0; k < 3; k++) below += pencil(uv0 + hand + vec2(float(k) - 1.0, 1.0 - float(k)) * 1.5 * px + vec2(22.0, -14.0) * px, fi + 1.0);
        pg = mix(pg, vec3(0.45, 0.47, 0.55), clamp(below / 3.0 * 0.16, 0.0, 0.16));
        // page curl: fold line at u = fp, slanted; fp moves from the right to the left, 4 frames for one crossing
        float fp = 1.12 - 1.2 * fract(uRealT * 2.0);                         // unstepped time: the curl moves smoothly, one crossing every 0.5 s
        float u = uv0.x + 0.2 * (uv0.y - 0.5);
        float cw = 0.05;
        vec3 col = pg;
        if (u > fp) {
          vec3 nextPage = mix(paper, graphite, pencil(uv0 + hand * 0.4 + vec2(9.0, -5.0) * px, fi + 1.0) * 0.88) * 0.985;
          float roll = clamp((u - fp) / cw, 0.0, 1.0);
          // the lifted flap: the back of the page, shaded like a cylinder; faint lines of the drawing show through
          float cyl = 0.72 + 0.34 * sin(roll * 3.1416) + 0.1 * (1.0 - roll);
          vec3 flap = paper * cyl;
          flap = mix(flap, vec3(0.5, 0.5, 0.55), 0.12 * pencil(vec2(1.0 - uv0.x, uv0.y) + hand, fi) * smoothstep(0.0, 0.6, roll));
          float inFlap = 1.0 - smoothstep(0.88, 1.0, roll);
          col = mix(nextPage, flap, inFlap);
          // the flap shadows the next page just beyond its edge
          col *= 1.0 - 0.3 * smoothstep(0.5, 0.0, (u - fp - cw) / 0.07) * step(cw, u - fp);
        } else {
          col *= 1.0 - 0.22 * smoothstep(0.07, 0.0, fp - u);              // the page bends and darkens just before the fold
        }
        // pad: binding strip at the left with two staples, page edges at the right and bottom
        float bind = step(fc.x, 16.0);
        vec3 bc = vec3(0.28, 0.27, 0.3) * (0.8 + 0.4 * smoothstep(0.0, 16.0, fc.x));
        float staple = step(abs(fc.x - 8.0), 5.0) * (step(abs(fc.y - uRes.y * 0.28), 14.0) + step(abs(fc.y - uRes.y * 0.72), 14.0));
        col = mix(col, mix(bc, vec3(0.72, 0.73, 0.75), staple), bind);
        float edgeR = step(uRes.x - 7.0, fc.x), edgeB = step(fc.y, 7.0);
        float lines = 0.55 + 0.45 * step(0.5, fract((fc.x * edgeB + fc.y * edgeR) / 2.0));
        col = mix(col, paper * 0.82 * lines, max(edgeR, edgeB));
        return vec4(outc(col), 1.0);
      }`,
  },
};
