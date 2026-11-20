// Art style 32: Schlieren. Inputs D N (depth, normals).
// The surfaces are grey. Only a change of slope shows (the difference of the surface normal across a few pixels, and
// depth steps), as bright and dark bands. The red, green and blue waves are read at slightly different offsets, so every band
// has a colour edge. Thin heat plumes rise from the tops of objects and drift upward.
window.ARTS = window.ARTS || {};
ARTS['schlieren'] = {
  id: 'schlieren', name: 'Schlieren', group: 'Light makes the picture', inputs: 'D N',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      vec3 nv(vec2 uv){ return texture2D(tNormal, uv).rgb * 2.0 - 1.0; }
      // knife edge reading at offset o (pixels): change of the normal across the offset, and the depth step
      float knife(vec2 uv, float o, vec2 px){
        vec2 a = vec2(o, 0.0) * px, b = vec2(0.0, o) * px;
        vec3 dn = nv(uv + a) - nv(uv - a) + 0.45 * (nv(uv + b) - nv(uv - b));
        float ds = (log(dd(uv + a)) - log(dd(uv - a))) + 0.45 * (log(dd(uv + b)) - log(dd(uv - b)));
        return dot(dn, vec3(1.0, 0.55, 0.0)) * 1.5 + ds * 1.6;
      }
      // rising heat: filaments above a nearer surface, thin, wavering, moving upward
      float plume(vec2 uv, vec2 fc, vec2 px, float dx){
        float d0 = dd(uv);
        float wob = (fbm(vec2(fc.x * 0.006, fc.y * 0.008 - uTime * 0.25)) - 0.5) * 36.0;
        float hit = 0.0;
        for (int k = 1; k <= 12; k++) {
          float dist = (float(k) - 0.5 + h21(floor(fc / 3.0))) * 9.0;      // jittered steps: no contour lines
          vec2 s = uv + vec2(wob * (0.3 + dist * 0.01), -dist) * px;
          if (hit == 0.0 && dd(s) < d0 * 0.72) hit = dist;
        }
        if (hit == 0.0) return 0.0;
        float f0 = max(1.0 - hit / 108.0, 0.0);
        float fade = f0 * sqrt(f0);                                    // pow(0.0, y) gave NaN on this GPU, so no pow here
        float x = fc.x + dx + 28.0 * (fbm(vec2(fc.x * 0.012, fc.y * 0.01 - uTime * 0.5)) - 0.5);
        float fil = sin(x * 0.17 + 6.0 * fbm(vec2(fc.x * 0.02, fc.y * 0.015 - uTime * 0.7)));
        float wd = smoothstep(0.35, 0.8, vn(vec2(fc.x * 0.035 + 11.0, fc.y * 0.006 - uTime * 0.3)));
        return fil * fade * wd * 1.6;
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float near = 1.0 - clamp((dd(uv) / uFocus - 0.5) / 1.8, 0.0, 1.0);
        vec3 s;
        for (int c = 0; c < 3; c++) {
          float o = 1.8 + 2.4 * float(c);
          s[c] = knife(uv, o, px) + plume(uv, fc, px, 1.6 * float(c - 1));
        }
        // grey from a soft curve of the signal, slightly darker for near surfaces
        vec3 g = 0.46 + 0.1 * near + 0.48 * s / (0.55 + abs(s));
        g += (h21(fc) - 0.5) * 0.01;
        vec3 col = pow(clamp(g, 0.0, 1.0), vec3(2.2));
        return vec4(col * 1.35, 1.0);
      }`,
  },
};
