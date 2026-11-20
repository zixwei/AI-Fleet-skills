// Art style 24: Lithophane. Input D (depth).
// A thin porcelain panel lit from the back. Near parts are thick and dark; far parts are thin and bright. The picture exists only as thickness.
// Thickness is the scene depth mapped from the near end of the scene to the far end. Light that passes follows Beer's law,
// so the picture is the transmitted light and has no colour of its own. A thicker porcelain frame holds the panel.
window.ARTS = window.ARTS || {};
ARTS['lithophane'] = {
  id: 'lithophane', name: 'Lithophane', group: 'The depth is the material', inputs: 'D',
  post: {
    fragment: `
      // depth position in the scene: 0 near, 1 far, from the log of depth over the focus distance (0.57 to 2.0 times uFocus). Stable from frame to frame. The sky counts as 1.
      float zn(vec2 uv){ return texture2D(tDepth, uv).x > 0.9999 ? 1.0 : clamp((log2(linDepth(uv) / uFocus) + 0.8) / 1.8, 0.0, 1.0); }
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float th0(vec2 uv){ return texture2D(tDepth, uv).x > 0.9999 ? 0.05 : 0.1 + 0.9 * (1.0 - zn(uv)); }
      // thickness: the depth, plus the local difference to a wide blur, so a block on a floor stays readable
      float th(vec2 uv){
        float m = 0.0, c = th0(uv);
        for (int i = 0; i < 8; i++) { float a = float(i) * 0.7854; m += th0(uv + vec2(cos(a), sin(a)) * vec2(0.035, 0.035 * uRes.x / uRes.y)); }
        return clamp(c + 1.6 * (c - m / 8.0), 0.02, 1.2);
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float S = uRes.y / 1080.0;
        // frame: 3.5 percent of the height, thick porcelain
        vec2 m = min(uv, 1.0 - uv) * uRes / (0.035 * uRes.y);
        float fr = min(m.x, m.y);
        float t = th(uv);
        // the porcelain is a little rough: the thickness has fine grain
        t += (h21(floor(fc / (1.5 * S))) - 0.5) * 0.02;
        float trans = exp(-2.9 * t);                       // transmitted light, Beer's law
        // a front light shows the relief of the surface: slope of the thickness
        float e = 1.2 * px.x;
        float sx = th(uv + vec2(e, 0.0)) - th(uv - vec2(e, 0.0));
        float sy = th(uv + vec2(0.0, e * uRes.x / uRes.y)) - th(uv - vec2(0.0, e * uRes.x / uRes.y));
        float rel = clamp(0.5 - 10.0 * (sx * 0.8 + sy * 0.6), 0.0, 1.0);
        vec3 tint = mix(vec3(1.0, 0.9, 0.74), vec3(1.0, 0.99, 0.95), trans);   // thin parts are white, thick parts warm
        float glow = pow(trans, 2.5);   // the lamp behind the panel: thin parts glow
        vec3 col = tint * (0.04 + 1.25 * trans + 0.7 * glow) + vec3(1.0, 0.96, 0.9) * 0.1 * (rel - 0.5);
        // the frame is thick: dim, with a bevel
        if (fr < 1.0) {
          float b = smoothstep(0.0, 1.0, fr);
          float bev = fr < 0.12 ? 0.5 : (fr < 0.2 ? 1.2 : 0.8);
          col = mix(col, vec3(0.64, 0.5, 0.36) * bev * (0.9 + 0.1 * h21(floor(fc / 2.0))), 1.0 - smoothstep(0.92, 1.0, fr) * 0.0);
        }
        // a dark room outside the panel
        float out0 = min(min(uv.x, 1.0 - uv.x) * uRes.x, min(uv.y, 1.0 - uv.y) * uRes.y);
        col *= smoothstep(0.0, 6.0 * S, out0) * 0.9 + 0.1;
        return vec4(col * 1.7, 1.0);
      }`,
  },
};
