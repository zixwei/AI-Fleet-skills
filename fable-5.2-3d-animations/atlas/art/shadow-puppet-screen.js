// Art style 35: Shadow-puppet screen (version of the first-set style "shadow-puppets"). Inputs C D (colour, depth).
// The scene is a shadow on a warm cloth screen lit from behind by one flame. Depth sets the shadow: near things are
// dark and sharp (they touch the screen), far things are paler and soft (they are close to the flame). The flame flickers
// and moves the shadows a little. The weave of the cloth shows, also through the shadows.
window.ARTS = window.ARTS || {};
ARTS['shadow-puppet-screen'] = {
  id: 'shadow-puppet-screen', name: 'Shadow-puppet screen', group: 'Light makes the picture', inputs: 'C D',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 5.0); }
      // 0 = nearest (touches the screen), 1 = far
      float zn(float d){ return clamp((d / uFocus - 0.8) / 0.9, 0.0, 1.0); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        // flame flicker: brightness, and a small wobble of the flame position that moves every shadow
        float fl = 0.9 + 0.06 * sin(uTime * 13.1) + 0.04 * sin(uTime * 29.7) + 0.03 * sin(uTime * 7.3);
        vec2 wob = vec2(sin(uTime * 9.3) * 0.6 + sin(uTime * 23.1) * 0.4, sin(uTime * 11.7) * 0.5 + sin(uTime * 17.9) * 0.5) * 2.0;
        // four depth layers. Each layer is blurred with its own radius, then they add up as shadow.
        float shadow = 0.0;
        for (int k = 0; k < 4; k++) {
          float zc = float(k) / 3.0;
          float R = k == 0 ? 1.6 : k == 1 ? 5.0 : k == 2 ? 10.0 : 17.0;
          float dark = mix(1.0, 0.7, zc);
          float acc = 0.0;
          for (int i = 0; i < 16; i++) {
            float a = float(i) * 2.39996 + 1.7 * float(k), r = sqrt((float(i) + 0.5) / 16.0) * R;
            vec2 s = uv + (vec2(cos(a), sin(a)) * r + wob * (0.3 + 1.2 * zc)) * px;
            float present = 1.0 - step(0.9999, texture2D(tDepth, s).x);
            acc += present * max(0.0, 1.0 - abs(zn(dd(s)) - zc) * 3.0);
          }
          shadow += acc / 16.0 * dark;
        }
        shadow = min(shadow * 1.08, 1.0);
        // the cloth: warm, brightest around the flame, with a woven thread pattern
        vec2 d = (uv - vec2(0.5 + 0.004 * wob.x, 0.56 + 0.004 * wob.y)) * vec2(1.7, 1.0);
        float glow = 0.3 + 1.0 * exp(-dot(d, d) * 2.6);
        vec3 cloth = mix(vec3(1.0, 0.45, 0.1), vec3(1.0, 0.72, 0.3), exp(-dot(d, d) * 7.0)) * glow * fl;
        float cx = floor(fc.x / 3.0), cy = floor(fc.y / 3.0), over = mod(cx + cy, 2.0);
        float wa = 0.5 + 0.5 * sin(fc.x * 2.094 + 1.5 * vn(fc * 0.06)), wb = 0.5 + 0.5 * sin(fc.y * 2.094 + 1.5 * vn(fc * 0.06 + 9.0));
        float weave = mix(wa, wb, over) * (0.88 + 0.24 * vn(fc * vec2(0.45, 0.05)));
        cloth *= 0.76 + 0.36 * weave;
        // leather puppets let a little of their own colour through
        vec3 c = texture2D(tColor, uv).rgb;
        vec3 trans = vec3(0.012, 0.006, 0.003) + clamp(c, 0.0, 1.0) * 0.025;
        vec3 col = cloth * mix(vec3(1.0), trans, shadow);
        vec2 v = uv - 0.5; col *= 1.0 - dot(v, v) * 0.9;
        return vec4(col * 1.9, 1.0);
      }`,
  },
};
