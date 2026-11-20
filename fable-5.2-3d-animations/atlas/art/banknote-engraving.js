// Art style 11: Banknote engraving. Inputs C N W (colour, normals, world position).
// Fine parallel lines. The line width gives the shade. The lines are slices of the world, so they stay on each object when the camera moves
// and bend around each form where a slice plane cuts it. The shader picks, for each pixel, the slice family that cuts the surface at the widest angle.
window.ARTS = window.ARTS || {};
ARTS['banknote-engraving'] = {
  id: 'banknote-engraving', name: 'Banknote engraving', group: 'The marks follow the surface', inputs: 'C N W',
  post: {
    normals: true,
    uniforms: { uPeriod: { value: 0.06 } },   // world units between two lines
    fragment: `
      uniform float uPeriod;
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      // ink coverage of parallel lines f = const; half width follows the tone (cov 0 = no ink, 1 = solid)
      float lines(float f, float cov){
        float fw = clamp(fwidth(f), 0.0005, 2.0), d = abs(fract(f) - 0.5), w = 0.5 * cov;
        float ink = clamp((w - d) / fw + 0.5, 0.0, 1.0);
        return mix(ink, cov, smoothstep(0.35, 0.8, fw));   // lines closer than a pixel average to grey
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        vec3 sc = texture2D(tColor, uv).rgb;
        float tone = clamp(pow(clamp(lum(sc), 0.0, 1.0), 0.62), 0.0, 1.0);   // 0 dark, 1 light
        vec3 paper = vec3(0.94, 0.915, 0.82);
        vec3 inkCol = vec3(0.04, 0.13, 0.10);
        float ink;
        if (texture2D(tDepth, uv).x > 0.9999) {
          // background: a guilloche of screen lines (it belongs to no object)
          float f = fc.y / 6.0 + 5.0 * sin(fc.x / 150.0 + fc.y / 400.0) + 2.0 * sin(fc.x / 41.0);
          ink = lines(f, clamp(1.0 - tone * 1.1, 0.06, 0.9) * 0.8);
        } else {
          vec3 P = worldPos(uv), N = worldNormal(uv);
          vec3 d1 = normalize(vec3(1.0, 0.6, 0.3)), d2 = normalize(vec3(-0.3, 1.0, 0.7)), d3 = normalize(vec3(0.6, -0.4, 1.0));
          float a1 = abs(dot(N, d1)), a2 = abs(dot(N, d2)), a3 = abs(dot(N, d3));
          vec3 da = a1 < a2 ? (a1 < a3 ? d1 : d3) : (a2 < a3 ? d2 : d3);
          vec3 db = da == d1 ? d2 : da == d2 ? d3 : d1;
          float cov = clamp(1.12 - tone * 1.2, 0.14, 0.97);
          ink = lines(dot(P, da) / uPeriod, cov);
          ink = max(ink, lines(dot(P, db) / (uPeriod * 1.4), 0.55) * smoothstep(0.3, 0.1, tone));   // cross lines in the darkest tones
        }
        // outline: the engraver cuts the silhouette
        float de = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * px * 1.5;
          de = max(de, abs(linDepth(uv + o) - linDepth(uv)) / linDepth(uv));
        }
        ink = max(ink, smoothstep(0.015, 0.05, de) * 0.9);
        vec3 tint = mix(paper, paper * (0.8 + 0.5 * normalize(sc + 0.05)), 0.12);
        vec3 col = mix(tint * (0.96 + 0.06 * h21(floor(fc / 2.0))) * 2.2, inkCol, ink);
        return vec4(col, 1.0);
      }`,
  },
};
