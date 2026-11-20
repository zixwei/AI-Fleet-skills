// Art style 88: Sand mandala. Inputs C B (colour, beat times).
// The picture is made of coloured sand poured in fine concentric lines (4.5 px pitch, each line has its own width and a wobble). The colour of a
// line is the scene colour on the line, made vivid and posterised to 4 levels, so each line is one pour of one colour. The frame is cut into
// as many rings as there are beats (equal steps of the radius up to the corner of the frame). Before the first beat nothing is poured and
// only the chalk guide lines show (the ring circles and 8 spokes). Beat k pours ring k, and the ring before it stays: the pour turns round
// the centre once in 1.4 s and a bright fall of grains marks the pour head. Rings are edged with white sand and 8 white spokes cut them.
window.ARTS = window.ARTS || {};
ARTS['sand-mandala'] = {
  id: 'sand-mandala', name: 'Sand mandala', group: 'World traditions', inputs: 'C B',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      vec3 lin(vec3 g){ return pow(clamp(g, 0.0, 1.0), vec3(2.2)) * mix(0.62, 2.4, smoothstep(0.6, 0.95, lum(g))); }
      vec4 postFX(vec2 uv){
        vec2 res = uRes, fc = uv * res, ctr = 0.5 * res; float sc = res.y / 720.0;
        vec2 d = fc - ctr; float rpx = length(d), R = 0.5 * length(res);
        float ang = atan(d.y, d.x), turn = fract(ang / 6.2831853 + 0.25);   // 0 at the top, growing clockwise
        float P = max(float(uBeatN), 1.0), kb = beatIdx(), age = beatAge();
        float rn = rpx / R * P, ri = floor(rn), rf = fract(rn);
        // the table: dark wood with grain
        vec3 col = vec3(0.24, 0.185, 0.14) * (0.8 + 0.4 * fbm(vec2(fc.x * 0.02, fc.y * 0.2) / sc));
        // chalk guide lines: ring circles and 8 spokes
        float chalk = max(smoothstep(1.4 * sc, 0.4 * sc, abs(rf - 0.0) * R / P), smoothstep(1.4 * sc, 0.4 * sc, (1.0 - rf) * R / P));
        float sp8 = abs(fract(turn * 8.0 + 0.5) - 0.5) * 2.0 * rpx * 6.2831853 / 8.0;
        chalk = max(chalk, smoothstep(1.4 * sc, 0.4 * sc, sp8 * 0.5));
        chalk *= 0.5 + 0.5 * vn(fc * 0.7 / sc);
        col = mix(col, vec3(0.75, 0.73, 0.68), chalk * 0.55);
        // which part of the ring is poured
        float pour = clamp(age / 1.4, 0.0, 1.0);
        float done = ri < kb ? 1.0 : (ri == kb ? step(turn, pour) : 0.0);
        if (kb < -0.5) done = 0.0;
        if (done > 0.5) {
          float lp = 4.5 * sc;
          float li = floor(rpx / lp), lf = fract(rpx / lp);
          float w = 0.55 + 0.3 * h21(vec2(li, 3.0));
          float wob = (vn(vec2(turn * 90.0, li * 0.37)) - 0.5) * 0.2;
          float lineCov = smoothstep(0.1, 0.0, abs(lf - 0.5) - 0.5 * w - wob);
          // the colour of this pour: the scene on the line centre
          vec2 pc = ctr + normalize(d + 1e-4) * (li + 0.5) * lp;
          vec3 g = pow(clamp(texture2D(tColor, pc / res).rgb, 0.0, 1.0), vec3(1.0 / 2.2));
          float Lg = lum(g);
          g = mix(vec3(Lg), g, 1.5);
          g = floor(clamp(g, 0.0, 1.0) * 4.0 + 0.5) / 4.0;
          g = clamp(g, 0.04, 0.97);
          // grains
          vec2 gi = floor(fc / (1.3 * sc));
          float gh = h21(gi), grain = 0.78 + 0.45 * gh;
          vec3 sand = g * grain;
          sand = mix(sand, vec3(1.0), step(0.985, h21(gi + 7.0)) * 0.6);   // a few bright grains
          float cov = lineCov * step(0.08, h21(gi + 3.0) + lineCov * 0.35 + 0.1);
          // white sand: the ring edge and 16 spokes
          float edge = max(smoothstep(2.6 * sc, 1.2 * sc, rf * R / P), smoothstep(2.6 * sc, 1.2 * sc, (1.0 - rf) * R / P));
          float spoke = smoothstep(1.6 * sc, 0.6 * sc, abs(fract(turn * 8.0 + 0.5) - 0.5) * rpx * 6.2831853 / 8.0);
          vec3 white = vec3(0.95, 0.94, 0.9) * (0.8 + 0.3 * gh);
          col = mix(col, sand, cov);
          col = mix(col, white, max(edge, spoke) * step(0.12, h21(gi + 11.0) + 0.5));
          // the pour head: a bright fall of grains at the front of the sweep
          if (ri == kb && pour < 1.0) {
            float dh = (pour - turn) * 6.2831853 * rpx;           // distance behind the head along the circle, in px
            float head = smoothstep(14.0 * sc, 0.0, dh) * step(0.0, dh) * step(0.0, rf);
            col += vec3(1.0, 0.92, 0.7) * head * step(0.55, h21(gi + 23.0)) * 0.8;
          }
        }
        return vec4(lin(col), 1.0);
      }`,
  },
};
