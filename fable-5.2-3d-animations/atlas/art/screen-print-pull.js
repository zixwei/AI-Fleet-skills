// Art style 10: Screen-print pull. Inputs C B (colour, beat times).
// One ink layer for each beat: yellow, red, blue, then the black key line. A squeegee crosses the frame for each layer. The layers are slightly out of register.
window.ARTS = window.ARTS || {};
ARTS['screen-print-pull'] = {
  id: 'screen-print-pull', name: 'Screen-print pull', group: 'The medium changes with time', inputs: 'C B',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      // halftone coverage: flat above 0.75, dots between 0.12 and 0.75, nothing below. ang = screen angle, per = period in px.
      float ht(float amt, vec2 fc, float ang, float per){
        float ca = cos(ang), sa = sin(ang);
        vec2 q = vec2(ca * fc.x + sa * fc.y, -sa * fc.x + ca * fc.y) / per;
        float dist = length(fract(q) - 0.5);                          // 0 at the dot centre
        float dot_ = smoothstep(dist - 0.1, dist + 0.1, sqrt(clamp(amt, 0.0, 1.0)) * 0.62);
        return mix(dot_, 1.0, smoothstep(0.62, 0.8, amt)) * smoothstep(0.1, 0.18, amt);
      }
      vec3 scene(vec2 uv){ return pow(clamp(texture2D(tColor, uv).rgb, 0.0, 1.0), vec3(1.0 / 2.2)); }
      // how much of a layer is printed: 1 after its pass, 0 before, and during the pass only behind the squeegee
      float printed(float pass, float k, float xs, float xx){ return k > pass + 0.5 ? 1.0 : (k > pass - 0.5 ? smoothstep(xs + 0.003, xs - 0.003, xx) : 0.0); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float kRaw = beatIdx(), age = beatAge(), N = float(uBeatN);
        // with 4 or more beats, every group of 4 is one print: the 5th beat clears the sheet and pulls yellow again, and so on
        float k = (N >= 3.5 && kRaw >= 0.0) ? mod(kRaw, 4.0) : kRaw;
        // the squeegee crosses in 0.9 s after each beat
        float sq = clamp(age / 0.9, 0.0, 1.0);
        float xs = sq * sq * (3.0 - 2.0 * sq) * 1.1 - 0.05;
        float sqOn = (age < 1.0 ? 1.0 : 0.0);
        float pY = min(0.0, N - 1.0), pR = min(1.0, N - 1.0), pB = min(2.0, N - 1.0), pK = min(3.0, N - 1.0);
        // each layer is a little out of register: offsets in pixels
        vec2 oY = vec2(0.0, 0.0), oR = vec2(5.0, -3.0), oB = vec2(-4.0, 4.0), oK = vec2(2.0, 2.5);
        vec3 cY = scene(uv - oY * px), cR = scene(uv - oR * px), cB = scene(uv - oB * px), cK = scene(uv - oK * px);
        // separations: yellow where the blue channel is low, red where green is low, blue where red is low
        float aY = clamp((1.0 - cY.b) * 1.25 - 0.05, 0.0, 1.0);
        float aR = clamp((1.0 - cR.g) * 1.25 - 0.1, 0.0, 1.0);
        float aB = clamp((1.0 - cB.r) * 1.15 - 0.15, 0.0, 1.0);
        float covY = ht(aY, fc - oY, 0.26, 6.0), covR = ht(aR, fc - oR, 1.31, 6.0), covB = ht(aB, fc - oB, 0.785, 6.0);
        // black key: lines at colour edges, and the very dark parts
        float g = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * px * 1.8;
          g = max(g, length(scene(uv - oK * px + o) - cK));
        }
        float key = max(smoothstep(0.18, 0.34, g), smoothstep(0.14, 0.06, lum(cK)));
        // the screen mesh and the pressure of the blade: ink does not cover perfectly
        float mesh = 0.92 + 0.08 * h21(floor(fc / 2.0) + 7.0);
        float pk = printed(pK, k, xs, uv.x), py = printed(pY, k, xs, uv.x), pr = printed(pR, k, xs, uv.x), pb = printed(pB, k, xs, uv.x);
        float ink = 1.0;
        // paper, then inks one over another (they multiply, so overlaps mix)
        vec3 paper = vec3(0.95, 0.92, 0.83) * (0.94 + 0.06 * vn(fc * 0.5) + 0.04 * fbm(fc * 0.02));
        vec3 col = paper;
        col *= mix(vec3(1.0), vec3(1.0, 0.86, 0.16), covY * py * mesh);
        col *= mix(vec3(1.0), vec3(0.93, 0.2, 0.22), covR * pr * mesh);
        col *= mix(vec3(1.0), vec3(0.12, 0.30, 0.68), covB * pb * mesh);
        col *= mix(vec3(1.0), vec3(0.04, 0.04, 0.06), key * pk * mesh);
        // wet ink behind the blade: glossy for about 1.5 s
        float wet = (1.0 - smoothstep(0.7, 1.8, age)) * (k > -0.5 ? 1.0 : 0.0);
        float wetMask = max(max(k < pY + 0.5 && k > pY - 0.5 ? py * covY : 0.0, k < pR + 0.5 && k > pR - 0.5 ? pr * covR : 0.0),
                            max(k < pB + 0.5 && k > pB - 0.5 ? pb * covB : 0.0, k < pK + 0.5 && k > pK - 0.5 ? pk * key : 0.0));
        float gloss = smoothstep(0.62, 0.9, fbm(vec2(fc.x * 0.01, fc.y * 0.03) + 3.0));
        col += vec3(1.0, 0.98, 0.92) * 0.16 * wet * wetMask * gloss;
        // the squeegee: a steel blade with a rubber edge, and a ridge of ink in front of it (to its right)
        float blade = sqOn * (1.0 - smoothstep(0.0, 0.002, abs(uv.x - xs) - 0.0095));
        float rubber = sqOn * (1.0 - smoothstep(0.0, 0.001, abs(uv.x - xs + 0.0105) - 0.0022));
        vec3 inkNow = k < 0.5 ? vec3(0.98, 0.85, 0.12) : k < 1.5 ? vec3(0.9, 0.16, 0.2) : k < 2.5 ? vec3(0.12, 0.3, 0.66) : vec3(0.05, 0.05, 0.07);
        float bead = sqOn * smoothstep(0.0, 0.003, uv.x - xs - 0.0095) * (1.0 - smoothstep(0.0, 0.004, uv.x - xs - 0.0095 - 0.012 - 0.01 * (fbm(vec2(uv.y * 40.0, 2.0)) - 0.5) * 2.0));
        col = mix(col, inkNow * 0.9, bead * 0.95);
        col = mix(col, vec3(0.62, 0.65, 0.68) * (0.8 + 0.3 * smoothstep(0.0, 1.0, fract(uv.x * 900.0))), blade);
        col = mix(col, vec3(0.06, 0.06, 0.07), rubber);
        col *= 1.0 - 0.18 * sqOn * blade * 0.0;
        // a shadow of the blade on the paper
        col *= 1.0 - 0.18 * sqOn * smoothstep(0.03, 0.0, xs - uv.x) * smoothstep(0.0, 0.01, xs - uv.x);
        // the frame of the print table
        vec2 e = min(fc, uRes - fc);
        col *= 0.88 + 0.12 * smoothstep(0.0, 40.0, min(e.x, e.y));
        vec3 lin = pow(clamp(col, 0.0, 1.2), vec3(2.2));
        lin *= mix(1.0, 2.1, smoothstep(0.5, 0.9, lum(lin)));
        return vec4(lin, 1.0);
      }`,
  },
};
