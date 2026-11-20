// Art style 1: Wet watercolor. Inputs C D B (colour, depth, beat times).
// At each beat the frame is wet: pigment blooms and spreads over the object edges. In about 1 s it dries into the shapes, with a dark rim and paper grain.
window.ARTS = window.ARTS || {};
ARTS['wet-watercolor'] = {
  id: 'wet-watercolor', name: 'Wet watercolor', group: 'The medium changes with time', inputs: 'C D B',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float age = beatAge();
        float wet = 1.0 - smoothstep(0.0, 1.1, age);          // 1 at a beat, 0 after about 1 s
        wet = wet * wet * (3.0 - 2.0 * wet);
        // wobbly edges: a slow noise moves the lookup; more when wet
        vec2 q = uv + (vec2(fbm(fc * 0.011), fbm(fc * 0.011 + 31.7)) - 0.5) * (5.0 + 16.0 * wet) * px;
        float d0 = dd(q);
        // blooms: where the water pools the pigment travels further (uneven spread)
        float pool = fbm(fc * 0.006 + 11.0);
        float R = 3.0 + 18.0 * wet * (0.5 + pool), tol = mix(0.04, 0.55 + 0.6 * pool, wet);
        vec3 acc = vec3(0.0); float ws = 0.0;
        for (int i = 0; i < 28; i++) {
          float a = float(i) * 2.39996 + h21(fc) * 0.6, r = sqrt((float(i) + 0.5) / 28.0) * R;
          vec2 s = q + vec2(cos(a), sin(a)) * r * px;
          float w = exp(-abs(dd(s) - d0) / (d0 * tol));
          acc += texture2D(tColor, s).rgb * w; ws += w;
        }
        vec3 wash = acc / max(ws, 1e-4);
        wash = mix(wash, texture2D(tColor, q).rgb, 0.45 * wet);   // pigment spreads but the shapes stay readable while wet
        // uneven pigment density while wet, and a backrun: a pale bloom with a dark cauliflower edge
        float bl = fbm(fc * 0.013 + 3.0);
        wash *= 1.0 + 0.7 * wet * (bl - 0.5);
        float back = smoothstep(0.035, 0.0, abs(fbm(fc * 0.009 + 40.0) - 0.5));
        float L = lum(wash);
        wash = mix(vec3(L), wash, 1.55);
        wash = mix(wash, floor(wash * 6.0 + 0.5) / 6.0, 0.2); // glazes: soft bands of tone
        // rim: pigment pools along depth and colour edges; kept (a little weaker) while wet
        float e = 0.0, g = 0.0;
        for (int i = 0; i < 8; i++) {
          float an = float(i) * 0.7854;
          vec2 o = vec2(cos(an), sin(an)) * px * (i < 4 ? 2.4 : 4.4);
          e = max(e, abs(dd(q + o) - d0) / d0);
          g = max(g, length(texture2D(tColor, q + o).rgb - texture2D(tColor, q).rgb));
        }
        float rim = max(smoothstep(0.01, 0.05, e), smoothstep(0.06, 0.3, g) * 0.75);
        rim *= (0.7 + 0.3 * fbm(fc * 0.05)) * (1.0 - 0.35 * wet);
        // paper: grain, fibres, and pigment settling into the grain
        float grain = fbm(fc * 0.8) * 0.6 + vn(fc * 0.35) * 0.4;
        vec3 paper = vec3(0.975, 0.955, 0.915) * (0.92 + 0.12 * grain);
        // transmission of the glaze: white objects stay near paper white, and take a cool grey in their shade so they do not vanish on a light wall
        vec3 T = pow(clamp(wash / 0.82, 0.0, 1.0), vec3(1.25));
        T *= mix(vec3(0.84, 0.88, 0.97), vec3(1.0), smoothstep(0.45, 0.95, L));
        T *= 1.0 - 0.18 * wet * back;
        T *= 1.0 - 0.85 * rim * (1.0 - 0.25 * T);
        T *= 1.0 - 0.75 * (grain - 0.5) * (1.0 - L) * (1.0 - 0.4 * wet);
        T *= 1.0 - 0.34 * (grain - 0.5) - 0.10 * (vn(fc * 1.3) - 0.5);   // paper tooth shows in light and saturated areas too
        T *= 1.0 - 0.07 * wet * (1.0 - L);
        vec3 col = paper * T;
        // the kit tone-maps after this: only the light tones need the paper-white gain (about x2.2); dark and mid tones keep the rendered value
        col *= mix(1.0, 2.2, smoothstep(0.55, 0.95, lum(T)));
        return vec4(col, 1.0);
      }`,
  },
};
