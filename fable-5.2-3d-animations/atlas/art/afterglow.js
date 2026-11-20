// Art style 37: Afterglow. Inputs C B (colour, beat times).
// Glow-in-the-dark paint. At each beat the room light flashes on for a moment and goes off. The picture then stays as a
// green phosphor glow: bright paint glows most, the glow spreads and softens, and it fades until the next beat.
window.ARTS = window.ARTS || {};
ARTS['afterglow'] = {
  id: 'afterglow', name: 'Afterglow', group: 'Light makes the picture', inputs: 'C B',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float age = beatAge();
        float lit = 1.0 - smoothstep(0.0, 0.16, age);                      // room light: on at the beat, off a moment later
        // the glow spreads as it fades: blur radius grows with age
        float R = 1.2 + 9.0 * smoothstep(0.0, 2.4, age);
        vec3 acc = vec3(0.0); float ws = 0.0;
        for (int i = 0; i < 20; i++) {
          float a = float(i) * 2.39996 + 6.28 * h21(floor(fc / 2.0)) * 0.5, r = sqrt((float(i) + 0.5) / 20.0) * R;
          vec3 s = texture2D(tColor, uv + vec2(cos(a), sin(a)) * r * px).rgb;
          float w = 1.0 - 0.5 * r / R;
          acc += s * w; ws += w;
        }
        vec3 blur = acc / ws;
        vec3 sharp = texture2D(tColor, uv).rgb;
        vec3 pc = mix(sharp, blur, smoothstep(0.0, 0.6, age));
        float sat = max(pc.r, max(pc.g, pc.b)) - min(pc.r, min(pc.g, pc.b));
        float charge = pow(clamp(lum(pc) * 1.25, 0.0, 1.0), 1.4) * (0.35 + 1.4 * sat);   // bright, coloured paint stored more light
        float decay = 1.0 / (1.0 + 2.6 * age);                                // phosphor fades fast, then slowly
        decay *= 1.0 - 0.45 * smoothstep(1.6, 2.6, age);
        float speck = 0.8 + 0.4 * h21(fc * 0.9);                              // the crystals in the paint
        vec3 glow = vec3(0.22, 1.0, 0.42) * charge * decay * speck * 1.5;
        glow += vec3(0.0, 0.05, 0.03) * charge * decay;
        vec3 room = vec3(0.003, 0.004, 0.007);
        vec3 col = room + sharp * lit * 1.0 + glow * (1.0 - 0.5 * lit);
        return vec4(col, 1.0);
      }`,
  },
};
