// Art style 52: Rubber-hose cartoon. Inputs C D S (colour, depth, frame step).
// 1930s black and white: thick wobbling outlines, film grain and dust, a frame that weaves a little, an iris at the start and the end, 12 frames per second.
window.ARTS = window.ARTS || {};
ARTS['rubber-hose-cartoon'] = {
  id: 'rubber-hose-cartoon', name: 'Rubber-hose cartoon', group: 'Hand-made animation', inputs: 'C D S',
  fps: 12,
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      // tone of the scene in gamma space, after the tone mapping that this pass skips
      float tone(vec2 uv){ float L = lum(texture2D(tColor, uv).rgb); return pow(clamp(L / (L + 0.9) * 1.9, 0.0, 1.0), 0.8); }
      vec3 outc(vec3 g){ return pow(clamp(g, 0.0, 1.0), vec3(2.2)) * 2.3; }
      vec4 postFX(vec2 uv0){
        vec2 px = 1.0 / uRes, fc = uv0 * uRes;
        float asp = uRes.x / uRes.y;
        float fr = floor(uTime * 12.0 + 0.5);
        // gate weave: the whole frame moves a few pixels from one frame to the next
        vec2 wv = (vec2(h21(vec2(fr, 3.1)), h21(vec2(fr, 7.7))) - 0.5) * vec2(7.0, 6.0) * px;
        // the drawing boils: every frame is traced again, so edges move
        vec2 bo = (vec2(vn(fc * 0.021 + fr * 17.3), vn(fc * 0.021 + 40.0 + fr * 11.1)) - 0.5) * 4.5 * px;
        vec2 uv = uv0 + wv + bo;
        float g = tone(uv);
        g = mix(g, floor(g * 4.0 + 0.5) / 4.0, 0.5);               // four soft tones of grey
        g = smoothstep(0.04, 0.96, g);
        // thick outline: depth edges (silhouettes) and tone edges (inner shapes)
        float R = 3.0 + 1.6 * vn(fc * 0.03 + fr * 5.0);
        float d0 = dd(uv), g0 = tone(uv), de = 0.0, ce = 0.0;
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.7854 + 0.39;
          vec2 o = vec2(cos(a), sin(a)) * R * px;
          de = max(de, abs(dd(uv + o) - d0) / d0);
          ce = max(ce, abs(tone(uv + o) - g0));
        }
        float line = max(smoothstep(0.012, 0.035, de), smoothstep(0.2, 0.4, ce) * 0.9);
        g = mix(g, 0.03, line);
        // film: flicker, grain, dust, a scratch, a soft vignette
        g *= 1.0 + (h21(vec2(fr, 9.0)) - 0.5) * 0.12;
        g += (h21(floor(fc * 0.7) + fr * 13.7) - 0.5) * 0.17 + (vn(fc * 0.5 + fr * 3.0) - 0.5) * 0.08;
        vec2 cell = floor(fc / 70.0);
        float hs = h21(cell + fr * 7.3);
        if (hs > 0.975) { vec2 sp = (cell + vec2(h21(cell + 1.7 + fr), h21(cell + 5.3 + fr))) * 70.0; float r = 1.5 + 5.0 * h21(cell + 9.1 + fr);
          g = mix(g, hs > 0.99 ? 0.95 : 0.05, smoothstep(r, r - 1.5, length(fc - sp)) * 0.8); }
        float sx = h21(vec2(fr, 21.0)) * uRes.x;
        g += step(0.82, h21(vec2(fr, 22.0))) * smoothstep(1.2, 0.2, abs(fc.x - sx)) * 0.22 * step(0.4, vn(vec2(fc.y * 0.01, fr)));
        float rr = length((uv0 - 0.5) * vec2(asp, 1.0));
        g *= 1.0 - 0.45 * smoothstep(0.45, 1.0, rr);
        vec3 col = vec3(g) * vec3(1.0, 0.985, 0.95);
        // iris: opens in the first 0.9 s and closes in the last 0.9 s
        float op = min(clamp(uTime / 0.9, 0.0, 1.0), clamp((uDur - uTime) / 0.9, 0.0, 1.0));
        op = op * op * (3.0 - 2.0 * op);
        float rad = 1.12 * op;
        col *= smoothstep(rad, rad - 0.006, rr);
        return vec4(outc(col), 1.0);
      }`,
  },
};
