// Art style 30: Bokeh mosaic. Inputs C D (colour, depth).
// All of the scene is out of focus. Each bright point is a soft disc of light. The disc size comes from the distance to the focus plane:
// 1/d - 1/focus (the focus plane is placed in front of the scene so all of it is out of focus).
// Two layers. (1) A gather blur whose radius is 0 at the focus plane, so near-focus text does not ghost.
// (2) Light sources that the shader makes itself: one candidate point in each 14 px cell of a jittered lattice. A point is a source when its luminance
// is above the mean of two neighbours (a local excess, no scene highlight needed). Each source is scattered as a hard-edged disc with a bright rim,
// radius = circle of confusion of its own depth , added on top of the blur.
window.ARTS = window.ARTS || {};
ARTS['bokeh-mosaic'] = {
  id: 'bokeh-mosaic', name: 'Bokeh mosaic', group: 'The depth is the material', inputs: 'C D',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float lumA(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      // circle of confusion radius in pixels (1080p): 0 on the focus plane
      float coc(vec2 uv){
        float d = texture2D(tDepth, uv).x > 0.9999 ? uFocus * 6.0 : linDepth(uv);
        // the focus plane lies in front of the scene (0.3 x uFocus): nothing in the scene is sharp
        return clamp(abs(1.0 / d - 1.0 / (0.3 * uFocus)) * uFocus * 15.0, 14.0, 52.0);
      }
      vec4 postFX(vec2 uv){
        float S = uRes.y / 1080.0;
        vec2 fc = uv * uRes;
        // layer 1: gather blur, radius = coc of the pixel itself (text on the focus plane stays sharp)
        float cp = coc(uv) * S;
        vec3 acc = texture2D(tColor, uv).rgb; float ws = 1.0;
        for (int i = 0; i < 40; i++) {
          float fi = float(i) + 0.5;
          float r = sqrt(fi / 40.0) * cp, a = fi * 2.39996;
          vec2 q = uv + vec2(cos(a), sin(a)) * r / uRes;
          if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) continue;
          // a tap that is nearer than this pixel and sharper must not bleed over it: weight by its own radius
          float w = smoothstep(0.0, 6.0, coc(q) * S + 6.0 - cp * 0.0) * (coc(q) * S + 1.0 >= r * 0.6 ? 1.0 : 0.15);
          acc += texture2D(tColor, q).rgb * w; ws += w;
        }
        vec3 base = acc / ws * 0.8;
        // layer 2: discs of light from the lattice sources
        float cell = 20.0 * S;
        vec2 c0 = floor(fc / cell);
        vec3 add = vec3(0.0);
        for (int j = -3; j <= 3; j++) for (int i = -3; i <= 3; i++) {
          vec2 id = c0 + vec2(float(i), float(j));
          vec2 sp = (id + 0.1 + 0.8 * vec2(h21(id), h21(id + 7.3))) * cell;   // source position in pixels
          vec2 su = sp / uRes;
          if (su.x < 0.0 || su.x > 1.0 || su.y < 0.0 || su.y > 1.0) continue;
          float rad = coc(su) * S;
          float dist = length(fc - sp);
          if (dist > rad + 1.5) continue;
          vec3 c = texture2D(tColor, su).rgb;
          float L = lumA(c);
          float Lm = 0.5 * (lumA(texture2D(tColor, su + vec2(12.0 * S, 0.0) / uRes).rgb) + lumA(texture2D(tColor, su - vec2(0.0, 12.0 * S) / uRes).rgb));
          float ex = clamp((L - Lm) * 6.0 + (L - 0.55) * 0.6, 0.0, 1.0);   // local excess, plus a little for bright points
          if (ex <= 0.0) continue;
          float cover = smoothstep(rad + 1.2, rad - 1.2, dist);                // hard edge
          float rim = 0.55 + 0.9 * smoothstep(0.7, 1.0, dist / rad);          // brighter rim
          add += c * cover * rim * ex * 0.5 * (0.6 + 0.4 * h21(id + 3.1));
        }
        vec3 col = base + add;
        return vec4(col * 1.1, 1.0);
      }`,
  },
};
