// Art style 8: Sand on a light box. Inputs C B (colour, beat times).
// Dark sand on lit glass. Thick sand is dark; thin sand glows amber. Before each beat a sweep clears the glass, then the picture comes back.
window.ARTS = window.ARTS || {};
ARTS['sand-on-a-light-box'] = {
  id: 'sand-on-a-light-box', name: 'Sand on a light box', group: 'The medium changes with time', inputs: 'C B',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        // time since the last beat, and time to the next one (after the last beat: the same gap as before it)
        float k = beatIdx(), nxt = 1e9, prevT = 0.0, gap = 2.5;
        for (int i = 0; i < 8; i++) {
          if (i >= uBeatN) break;
          if (float(i) == k) { nxt = (i + 1 < uBeatN) ? uBeats[i + 1] : uBeats[i] + (i > 0 ? uBeats[i] - prevT : 2.5); gap = nxt - uBeats[i]; }
          prevT = uBeats[i];
        }
        float age = beatAge(), tau = nxt - uCanon;
        // the sweep: a hand crosses the glass from left to right in the 0.9 s before the next beat. It leaves bare glass behind it.
        float sw = clamp((0.95 - tau) / 0.7, 0.0, 1.0);
        float sx = mix(-0.08, 1.08, sw * sw * (3.0 - 2.0 * sw));
        float wave = (fbm(vec2(uv.y * 5.0, 3.0)) - 0.5) * 0.12 + 0.03 * sin(uv.y * 9.0);   // the front is not straight
        float xs = uv.x - wave;
        float swept = tau < 0.95 ? smoothstep(sx - 0.004, sx + 0.004, xs) : 1.0;   // 1 = not yet swept
        float inBank = tau < 0.95 && tau > 0.2 ? exp(-pow((xs - sx + 0.012) / 0.018, 2.0)) : 0.0; // sand pushed up in front of the hand
        // the picture comes back after the beat: grains settle in, in 0.65 s, each at its own moment
        float q = smoothstep(0.0, 0.65, age);
        float arrive = h21(floor(fc / 2.0) + 4.0) * 0.55 + 0.45 * fbm(fc * 0.01);
                float present = smoothstep(arrive - 0.02, arrive + 0.2, q * 1.25);
        // thickness of the sand: dark parts of the picture are thick
        vec3 c = texture2D(tColor, uv).rgb;
        float g = pow(clamp(lum(c), 0.0, 1.0), 1.0 / 2.2);
        g = clamp((g - 0.42) / 0.5, 0.0, 1.0);
        float thick = 3.6 * pow(1.0 - g, 1.25);
        // grains: each 2 px cell is a little thicker or thinner; and the sand is swept into small ridges
        float grain = 0.8 + 0.4 * h21(floor(fc / 2.0));
        float ridge = 1.0 + 0.25 * (fbm(vec2(fc.x * 0.05, fc.y * 0.012)) - 0.5);
        thick *= grain * ridge;
        thick *= present * swept;
        thick += inBank * 2.4;
        // finger marks in the glass behind the hand
        float marks = tau < 0.95 ? (1.0 - swept) * exp(-(sx - xs) * 6.0) * smoothstep(0.35, 0.65, vn(vec2(uv.y * 160.0, 1.0))) * 0.22 : 0.0;
        thick += marks;
        // light through the sand: blue is absorbed first, so thin sand is amber and thick sand is black
        vec3 trans = vec3(exp(-0.75 * thick), exp(-1.75 * thick), exp(-4.6 * thick));
        // lit glass: bright, slightly warm, brighter in the middle
        vec3 lit = vec3(1.55, 1.42, 1.18) * (0.75 + 0.35 * (1.0 - length((uv - 0.5) * vec2(1.0, 1.1)) * 1.1));
        vec3 col = lit * trans;
        // sand does not absorb everything: a tiny amount of sparkle from the grains
        col += vec3(0.10, 0.05, 0.015) * smoothstep(1.6, 2.6, thick) * h21(floor(fc / 2.0) + 11.0);
        // the box: a dark frame, and the glass edge glowing
        vec2 e = min(fc, uRes - fc);
        float rimd = min(e.x, e.y);
        col *= smoothstep(10.0, 18.0, rimd);
        col += vec3(1.0, 0.7, 0.35) * 0.3 * smoothstep(8.0, 0.0, abs(rimd - 22.0));
        col *= 0.9 + 0.1 * smoothstep(30.0, 60.0, rimd);
        return vec4(col, 1.0);
      }`,
  },
};
