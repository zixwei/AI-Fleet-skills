// Art style 25: Mist-layer ink landscape. Input D (depth).
// The depth is cut into ink washes: near is dark, far is pale, and mist fills the gaps between the layers.
// 6 layers from the near to the far end of the scene. Each layer is one wash with a dry-brush edge. The far side of each layer
// dissolves into mist, so the white gap before the next layer shows. Rice paper, soft ink bleed and a thin dark line on the nearest edges.
window.ARTS = window.ARTS || {};
ARTS['mist-layer-ink-landscape'] = {
  id: 'mist-layer-ink-landscape', name: 'Mist-layer ink landscape', group: 'The depth is the material', inputs: 'D',
  post: {
    fragment: `
      // depth position in the scene: 0 near, 1 far, from the log of depth over the focus distance (0.57 to 2.0 times uFocus). Stable from frame to frame. The sky counts as 1.
      float zn(vec2 uv){ return texture2D(tDepth, uv).x > 0.9999 ? 1.0 : clamp((log2(linDepth(uv) / uFocus) + 0.8) / 1.8, 0.0, 1.0); }

      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ return 0.5 * vn(p) + 0.25 * vn(p * 2.03 + 7.0) + 0.125 * vn(p * 4.1 + 3.0) + 0.0625 * vn(p * 8.3 + 11.0); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float S = uRes.y / 1080.0;
        // paper
        vec3 paper = vec3(0.93, 0.9, 0.8) * (0.93 + 0.1 * fbm(fc / (40.0 * S)) + 0.03 * h21(floor(fc / 1.5)));
        float sky = texture2D(tDepth, uv).x > 0.9999 ? 1.0 : 0.0;
        float z = zn(uv);                                  // 0 near, 1 far
        // the brush wobbles the layer boundaries a little
        float wob = (fbm(fc / (60.0 * S) + 5.0) - 0.5) * 0.05;
        float zl = clamp(z + wob, 0.0, 1.0) * 6.0;
        float k = min(floor(zl), 5.0), fr = zl - k;      // layer k, position inside it (0 near side, 1 far side)
        float f = (k + 0.5) / 6.0;
        // wash: darker for near layers, with blotchy ink
        float ink = mix(0.9, 0.0, pow(1.0 - f, 0.55));
        ink *= 0.8 + 0.4 * fbm(fc / (22.0 * S) + k * 13.0);
        // dry-brush streaks across the wash
        ink *= 0.88 + 0.24 * vn(vec2(fc.x / (90.0 * S), fc.y / (3.0 * S)) + k);
        // mist: the far side of each layer fades into the paper, and the gap before the next layer is empty
        float mist = smoothstep(0.7, 1.0, fr) * (k < 5.0 ? mix(0.55, 0.95, f) : 0.4);
        mist += 0.12 * smoothstep(0.55, 0.0, fbm(fc / (130.0 * S) + k * 3.0)) * smoothstep(0.3, 0.7, fr);   // loose cloud in the gaps
        mist = clamp(mist, 0.0, 1.0);
        float cover = mix(1.0, 0.0, mist);
        float wash = ink * cover;
        // outline: a thin dark line on the near edges of a layer
        float de = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * px * 2.0 * S;
          de = max(de, abs(linDepth(uv + o) - linDepth(uv)) / linDepth(uv));
        }
        float line = smoothstep(0.02, 0.07, de) * (1.0 - 0.6 * z) * (0.6 + 0.4 * vn(fc / (6.0 * S)));
        float dark = clamp(1.0 - wash * 0.0 - (1.0 - ink) * cover, 0.0, 1.0);   // 0 = no ink, 1 = full ink
        float amount = clamp((1.0 - ink) * cover * (1.0 - sky) + 0.45 * line, 0.0, 1.0);
        // far, empty sky holds a pale wash at the horizon
        amount += sky * 0.07 * smoothstep(0.7, 0.2, uv.y) + sky * 0.05 * fbm(fc / (50.0 * S));
        vec3 inkCol = vec3(0.010, 0.013, 0.018);   // linear: tone mapping lifts dark values
        vec3 col = mix(paper * 2.0, inkCol + paper * 0.04, pow(clamp(amount, 0.0, 0.97), 1.2));
        return vec4(col, 1.0);
      }`,
  },
};
