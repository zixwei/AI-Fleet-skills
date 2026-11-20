// Art style 51: Cel animation. Inputs C D M S (colour, depth, material hook, frame step).
// Flat colour in two tones, an ink line, 12 frames per second, and a small cel shadow on what lies behind an object.
window.ARTS = window.ARTS || {};
ARTS['cel-animation'] = {
  id: 'cel-animation', name: 'Cel animation', group: 'Hand-made animation', inputs: 'C D M S',
  fps: 12,
  // M: lit surfaces take the light tone and the rest take the dark tone, both flat. The albedo (with its texture) is kept.
  material(m) {
    if (!(m.isMeshStandardMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial)) return;
    K.patchMaterial(m, shader => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>',
        `float celL = dot(outgoingLight, vec3(0.2126, 0.7152, 0.0722)), celD = max(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)), 0.001);
         outgoingLight = diffuseColor.rgb * mix(0.62, 1.12, smoothstep(0.34, 0.37, celL / celD));
         #include <opaque_fragment>`);
    });
  },
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes;
        float fr = floor(uTime * 12.0 + 0.5);
        vec2 jit = (vec2(h21(vec2(fr, 1.0)), h21(vec2(fr, 2.0))) - 0.5) * 1.6 * px;   // the hand-traced line moves a little on each drawing
        vec3 c = texture2D(tColor, uv).rgb;
        float L = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c = max(mix(vec3(L), c, 1.2), 0.0);
        // cel shadow: a nearer thing up and to the left throws a flat shadow on this surface
        float d = dd(uv), sh = 0.0;
        for (int i = 1; i <= 2; i++) sh = max(sh, step(0.045, (d - dd(uv + vec2(-1.0, 1.0) * px * 9.0 * float(i))) / d));
        c *= 1.0 - 0.28 * sh;
        // ink line: wide on silhouettes (depth edges), thin on creases (normal edges)
        vec3 n = texture2D(tNormal, uv + jit).rgb * 2.0 - 1.0;
        float de = 0.0, ne = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * px * 1.3;
          de = max(de, abs(dd(uv + jit + o) - dd(uv + jit)) / dd(uv + jit));
          ne = max(ne, 1.0 - dot(n, texture2D(tNormal, uv + jit + o).rgb * 2.0 - 1.0));
        }
        float line = max(smoothstep(0.012, 0.03, de), smoothstep(0.35, 0.6, ne) * 0.9);
        c = mix(c, vec3(0.025, 0.02, 0.035), line);
        return vec4(c, 1.0);
      }`,
  },
};
