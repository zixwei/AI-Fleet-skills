// Art style 50: Pen plotter. Inputs C D B (colour, depth, beat times).
// One pen draws the frame as hatch lines on cream paper, in the order of a real plotter: it runs along a row, steps over, and runs back
// (serpentine). Rows of 5 px are ink or no ink by the tone of the picture; the darker the tone, the more rows are inked (4 levels).
// Pass 1 (first 70 percent of the time) is the hatch at one angle. Pass 2 (last 30 percent) is a cross hatch at another angle for the darkest
// tones, and the outlines of the objects, found from the depth. The pen head is drawn at its true place. The drawing is complete 0.35 s
// before the next beat; then the head lifts and moves to the corner. The last segment runs to the end of the animation (uDur; with voiceover cues uDur is real time and uBeats are canonical, so it is approximate there).
window.ARTS = window.ARTS || {};
ARTS['pen-plotter'] = {
  id: 'pen-plotter', name: 'Pen plotter', group: 'An instrument sees the scene', inputs: 'C D B',
  post: {
    uniforms: { uHold: { value: 0.35 } },       // seconds between the end of the drawing and the next beat
    fragment: `
      uniform float uHold;
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      // One pass. d: pixel from the centre of the screen. th: hatch angle. sp: row spacing (px). q: progress of this pass, 0 to 1.
      // tone: 0 dark, 1 light. thrScale: how dark a tone must be to get ink. Returns the ink coverage; pen gets the pen position in pixels from the centre.
      float rowsPass(vec2 d, float th, float sp, float q, float tone, float thrScale, float lw, out vec2 pen){
        float c = cos(th), s = sin(th);
        float U = abs(c) * uRes.x * 0.5 + abs(s) * uRes.y * 0.5, V = abs(s) * uRes.x * 0.5 + abs(c) * uRes.y * 0.5;
        vec2 r = vec2(c * d.x + s * d.y, -s * d.x + c * d.y);
        float N = floor(2.0 * V / sp) + 1.0;
        float rowF = q * N, penRow = min(floor(rowF), N - 1.0), f = q >= 1.0 ? 1.0 : fract(rowF);
        float penU = mod(penRow, 2.0) < 0.5 ? -U + 2.0 * U * f : U - 2.0 * U * f, penV = -V + (penRow + 0.5) * sp;
        pen = vec2(c * penU - s * penV, s * penU + c * penV);
        float vv = r.y + 0.35 * sin(r.x * 0.05 + r.y * 0.3);       // the carriage shakes a little
        float rv = (vv + V) / sp, rowP = floor(rv);
        float dist = (fract(rv) - 0.5) * sp;
        float m = mod(rowP, 4.0);
        float thr = (m < 0.5 ? 0.90 : m < 1.5 ? 0.50 : m < 2.5 ? 0.72 : 0.32) * thrScale;
        float on = 1.0 - smoothstep(thr - 0.03, thr + 0.03, tone + 0.05 * (h21(vec2(rowP, 3.1)) - 0.5));
        float cov = clamp(lw * 0.5 + 0.5 - abs(dist), 0.0, 1.0) * on;
        // drawn so far: all earlier rows, and the part of the pen row behind the pen
        bool even = mod(rowP, 2.0) < 0.5;
        float done = rowP < penRow ? 1.0 : rowP > penRow ? 0.0 : (even ? step(r.x, penU) : step(penU, r.x));
        if (q >= 1.0) done = 1.0;
        return cov * done;
      }
      vec4 postFX(vec2 uv){
        vec2 fc = uv * uRes, cen = 0.5 * uRes, d = fc - cen;
        float sc = uRes.y / 1080.0;
        float k = beatIdx(), age = beatAge();
        // length of this segment: the next beat, or the segment before when this is the last beat
        float interval = 2.5;
        if (k >= 0.0) {
          int ik = int(k);
          if (ik + 1 < uBeatN) interval = uBeats[ik + 1] - uBeats[ik];
          else interval = max(uDur - uBeats[ik], 1.0);   // the last segment runs to the end of the animation
        }
        float Td = max(interval - uHold, 0.5);
        float p = clamp(age / Td, 0.0, 1.0);
        float qa = clamp(p / 0.7, 0.0, 1.0), qb = clamp((p - 0.7) / 0.3, 0.0, 1.0);
        // tone of the picture: light and colour, lighter with distance
        vec3 sc3 = texture2D(tColor, uv).rgb;
        float L = pow(clamp(lum(sc3), 0.0, 1.0), 0.45);
        float dep = texture2D(tDepth, uv).x, z = linDepth(uv);
        float tone = dep > 0.9999 ? 1.0 : mix(L, 1.0, 0.35 * clamp(z / (2.0 * uFocus) - 0.2, 0.0, 1.0));
        tone = smoothstep(0.30, 0.98, tone);                        // spread the light tones, so the pastel scenes still get ink
        vec2 penA, penB;
        float a1 = rowsPass(d, 0.2094, 5.0 * sc, qa, tone, 1.0, 2.0 * sc, penA);                // pass 1 at 12 degrees
        // pass 2: a cross hatch for the darkest tones, and the outlines
        float a2 = rowsPass(d, 1.5184, 7.0 * sc, qb, tone, 0.45, 2.0 * sc, penB);                // 87 degrees
        float de = 0.0, px1 = 1.5 * sc;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * px1 / uRes;
          de = max(de, abs(linDepth(uv + o) - z) / z);
        }
        float outline = smoothstep(0.02, 0.06, de) * (dep > 0.9999 ? 0.0 : 1.0);
        // the outline is drawn by the second pass: it shows once the pen row has passed (the same reveal as the cross hatch, with a thick line)
        vec2 dummy; float reveal = rowsPass(d, 1.5184, 7.0 * sc, qb, 0.0, 1.0, 7.0 * sc, dummy);
        float ink = max(a1, max(a2, outline * clamp(reveal * 1.0, 0.0, 1.0)));
        ink *= 0.92 + 0.08 * h21(floor(fc * 0.7));                // the ink is not even
        vec3 paper = vec3(0.965, 0.945, 0.885) * (0.97 + 0.03 * h21(floor(fc / 2.0)));
        vec3 inkCol = vec3(0.02, 0.03, 0.10);
        vec3 col = mix(paper, inkCol, clamp(ink, 0.0, 1.0) * 1.0);
        // the pen head: on the pen row while it draws, then it lifts and goes to the corner (top right)
        vec2 park = vec2(0.5 * uRes.x - 60.0 * sc, 0.5 * uRes.y - 60.0 * sc);
        vec2 pen = p < 0.7 ? penA : penB;
        float away = smoothstep(0.0, 0.3, age - Td);              // 0 while drawing, 1 once parked
        pen = mix(pen, park, away);
        // a row can run past the screen edge (the page is wider than the frame at an angle): keep the head on the frame, so it is always visible
        pen = clamp(pen, -0.5 * uRes + 34.0 * sc, 0.5 * uRes - 34.0 * sc);
        float lift = 1.0 + 0.6 * away;
        // the gantry: a thin bar across the whole frame along the pen row, so the place of the pen is clear also between the rows
        float th = p < 0.7 ? 0.2094 : 1.5184;
        vec2 dirG = vec2(cos(th), sin(th));
        float gdist = abs((d - pen).x * dirG.y - (d - pen).y * dirG.x);
        float gantry = (1.0 - smoothstep(1.5 * sc, 3.0 * sc, gdist)) * (1.0 - away);
        col = mix(col, vec3(0.30, 0.33, 0.40), 0.55 * gantry);
        // shadow on the paper, then the body of the head and its tip
        vec2 e = d - pen;
        float sh = 1.0 - smoothstep(16.0 * sc, 30.0 * sc, length(e - vec2(12.0, -16.0) * sc * lift));
        col *= 1.0 - 0.28 * sh;
        float R = length(e);
        float body = 1.0 - smoothstep(22.0 * sc, 24.0 * sc, R);
        float ring = smoothstep(17.0 * sc, 19.0 * sc, R) * (1.0 - smoothstep(22.0 * sc, 23.5 * sc, R));
        col = mix(col, mix(vec3(0.10, 0.11, 0.14), vec3(0.55, 0.58, 0.64), ring + 0.25 * smoothstep(14.0 * sc, 0.0, length(e - vec2(-7.0, 7.0) * sc))), body);
        float tip = 1.0 - smoothstep(4.5 * sc, 6.0 * sc, R);
        col = mix(col, vec3(0.95, 0.35, 0.10), tip);
        return vec4(col * 2.2, 1.0);
      }`,
  },
};
