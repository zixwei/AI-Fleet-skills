// Art style 29: Autostereogram. Input D (depth).
// A field of random dots that hides the scene. A viewer who relaxes the eyes sees the 3D shapes. Labels cannot be read (owner decision 7).
// Each row is a repeating strip of dots. The strip period depends on the depth: near surfaces use a shorter period.
// A pixel copies the dot one period to its left, and the chain runs to the left edge, where a hash gives the dot.
// The depth is scaled to the near to far range of the scene so the shapes have a full relief. Two guide dots at the top help the eyes find the pair.
window.ARTS = window.ARTS || {};
ARTS['autostereogram'] = {
  id: 'autostereogram', name: 'Autostereogram', group: 'The depth is the material', inputs: 'D',
  post: {
    fragment: `
      float zn(vec2 uv){ return clamp((log2(linDepth(uv) / uFocus) + 0.8) / 1.8, 0.0, 1.0); }
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      // depth for the stereogram: 0 far (the background), 1 near
      float zs(vec2 uv){
        if (texture2D(tDepth, uv).x > 0.9999) return 0.0;
        float t = 1.0 - zn(uv);
        return 0.12 + 0.88 * t;
      }
      // separation of the strip in dots, for depth z (standard formula with mu = 1/3)
      float sepOf(float z, float E){ float mu = 0.33333; return floor(E * (1.0 - mu * z) / (2.0 - mu * z) + 0.5); }
      vec4 postFX(vec2 uv){
        float S = uRes.y / 1080.0, ds = 2.0 * S;                       // dot size in pixels
        float E = floor(300.0 * S / ds + 0.5);                          // eye separation, in dots
        float row = floor(uv.y * uRes.y / ds);
        float x = floor(uv.x * uRes.x / ds);
        // follow the chain to the left until the first strip
        for (int i = 0; i < 40; i++) {
          vec2 q = vec2((x + 0.5) * ds / uRes.x, (row + 0.5) * ds / uRes.y);
          float sep = sepOf(zs(q), E);
          if (x - sep < 0.0) break;
          x -= sep;
        }
        float h = h21(vec2(x, row));
        // dots in four tones, so the field is not binary
        vec3 col = h < 0.36 ? vec3(0.03, 0.04, 0.06) : (h < 0.62 ? vec3(0.78, 0.76, 0.70) : (h < 0.82 ? vec3(0.27, 0.34, 0.42) : vec3(0.97, 0.94, 0.86)));
        col = col * (h < 0.36 ? 1.0 : 1.9);
        // guide dots: a pair at the top, one strip period apart at the background separation
        float sep0 = sepOf(0.0, E) * ds;
        vec2 gc = vec2(0.5 * uRes.x, 0.96 * uRes.y);
        for (int k = 0; k < 2; k++) {
          vec2 c = gc + vec2((float(k) - 0.5) * sep0, 0.0);
          col = mix(col, vec3(1.0, 0.95, 0.7) * 2.0, smoothstep(9.0 * S, 7.0 * S, length(uv * uRes - c)));
        }
        return vec4(col, 1.0);
      }`,
  },
};
