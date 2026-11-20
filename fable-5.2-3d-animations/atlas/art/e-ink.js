// Art style 47: E-ink. Inputs C B (colour, beat times).
// 16 grey levels (4 bits, quantised in gamma space) on a paper-like screen: warm grey paper, dark grey ink, a fine particle grain.
// At each beat the screen refreshes the way an e-paper does: the picture inverts, goes black, goes white, then the new picture settles in.
// A faint ghost stays after the refresh and fades in about 3 seconds.
// The ghost is the real picture of the beat before: input X (mode 'diff') gives tPrev, the scene 2.5 s earlier, which is the length of one beat in
// the test scenes. Limit: the step is fixed, so on a scene with another beat spacing tPrev is a little before or after the earlier beat. The first
// beat has no earlier picture, so it has no refresh and no ghost. Times before 2.5 s use the frame at 0.
window.ARTS = window.ARTS || {};
ARTS['e-ink'] = {
  id: 'e-ink', name: 'E-ink', group: 'An instrument sees the scene', inputs: 'C B',
  x: { n: 2, span: 2.5, mode: 'diff' },
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      // grey in gamma space, 0 black to 1 white, with a contrast curve
      float grey(vec2 uv){
        float L = lum(texture2D(tColor, uv).rgb);
        float g = pow(clamp(L, 0.0, 1.0), 0.4545);
        return smoothstep(0.06, 1.0, pow(g, 2.0));
      }
      float greyP(vec2 uv){
        float L = lum(texture2D(tPrev, uv).rgb);
        return smoothstep(0.06, 1.0, pow(pow(clamp(L, 0.0, 1.0), 0.4545), 2.0));
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        // a little sharpening, so thin shapes survive the 16 levels
        float g0 = grey(uv);
        float gb = 0.25 * (grey(uv + vec2(px.x, 0.0) * 1.5) + grey(uv - vec2(px.x, 0.0) * 1.5) + grey(uv + vec2(0.0, px.y) * 1.5) + grey(uv - vec2(0.0, px.y) * 1.5));
        float g = clamp(g0 + 1.0 * (g0 - gb), 0.0, 1.0);
        float q = floor(g * 15.0 + 0.5) / 15.0;                // 16 levels
        // refresh at each beat: inverted (0 to 0.12 s), black (to 0.24), white (to 0.36), then the picture
        float k = beatIdx(), age = beatAge();   // k = 0 is the first beat: no earlier picture, so no refresh and no ghost
        float level = q, ghost = 0.0;
        if (k >= 1.0) {
          if (age < 0.12) level = 1.0 - q;
          else if (age < 0.24) level = 0.0;
          else if (age < 0.36) level = 1.0;
          else ghost = exp(-(age - 0.36) / 1.6);
        }
        // ghost: the picture of the beat before, 16 levels, stays faint and fades in about 2.5 s after the refresh
        float gp = floor(greyP(uv) * 15.0 + 0.5) / 15.0;
        level = mix(level, level * (0.55 + 0.45 * gp), 0.55 * ghost);
        // ink and paper: the two ends are not pure black and white
        float lin = pow(level, 1.7);   // lighter than 2.2: the tone mapping that follows darkens the mid greys
        float grain = 0.97 + 0.05 * h21(floor(fc * 0.5)) + 0.02 * h21(fc);
        vec3 paper = vec3(0.80, 0.795, 0.74), ink = vec3(0.012, 0.0125, 0.012);
        vec3 col = mix(ink, paper, lin) * grain;
        return vec4(col * 2.2, 1.0);
      }`,
  },
};
