// Art style 33: Prism split. Inputs C D (colour, depth).
// Each depth edge separates into a spectrum on its far side. For every pixel the shader finds the nearest pixel that is nearer to the camera
// (16 directions, 16 radii up to 24 px). The band width W grows with the depth step (4 to 24 px). A pixel closer to the edge than W gets the
// colour of a spectrum, red at the edge to violet at W, mixed with the picture so that detail stays. Elsewhere the picture is unchanged.
window.ARTS = window.ARTS || {};
ARTS['prism-split'] = {
  id: 'prism-split', name: 'Prism split', group: 'Light makes the picture', inputs: 'C D',
  post: {
    fragment: `
      float ld(vec2 uv){ return log(min(linDepth(uv), uFocus * 4.0) / uFocus); }
      vec3 hue(float h){ return clamp(abs(fract(h + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0) - 1.0, 0.0, 1.0); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes;
        vec3 c0 = texture2D(tColor, uv).rgb;
        float l0 = ld(uv), best = 2.0;
        for (int i = 0; i < 16; i++) {
          float a = float(i) * 0.3927;
          vec2 dir = vec2(cos(a), sin(a)) * px;
          for (int k = 1; k <= 16; k++) {
            float r = float(k) * 1.5, dl = l0 - ld(uv + dir * r);           // dl > 0: that point is nearer
            float w = clamp(dl * 100.0, 4.0, 24.0);
            if (dl > 0.06 && r < w) { best = min(best, r / w); break; }
          }
        }
        if (best > 1.0) return vec4(c0, 1.0);
        float L = dot(c0, vec3(0.2126, 0.7152, 0.0722));
        vec3 band = hue(best * 0.76) * (0.55 + 0.9 * L);                    // red at the edge, violet at the outer border
        float m = smoothstep(1.0, 0.85, best) * 0.8;
        return vec4(mix(c0, band, m), 1.0);
      }`,
  },
};
