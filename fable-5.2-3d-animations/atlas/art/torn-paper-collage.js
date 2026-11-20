// Art style 64: Torn-paper collage. Inputs C D (colour, depth).
// Each flat colour area (the scene colour posterised in gamma space, split also at each depth step) is a piece of paper. A slow noise bends the area edges, so they are torn,
// not cut. The piece on top (nearer, or by the hash of its colour when the depth is the same) has a white ragged fibre band on its edge, and throws a small soft shadow on the piece below.
// Each piece has its own paper tone and grain.
window.ARTS = window.ARTS || {};
ARTS['torn-paper-collage'] = {
  id: 'torn-paper-collage', name: 'Torn-paper collage', group: 'Print and paper', inputs: 'C D',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 3; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      // a piece at u: rgb = the colour in 5 gamma levels, a = depth
      vec4 pcAt(vec2 u){
        vec2 px = 1.0 / uRes;
        vec3 c = 0.2 * (texture2D(tColor, u).rgb + texture2D(tColor, u + vec2(2.5, 0.0) * px).rgb + texture2D(tColor, u - vec2(2.5, 0.0) * px).rgb + texture2D(tColor, u + vec2(0.0, 2.5) * px).rgb + texture2D(tColor, u - vec2(0.0, 2.5) * px).rgb);
        c = mix(vec3(lum(c)), c, 1.4);
        vec3 g = floor(pow(clamp(c * 1.1, 0.0, 1.0), vec3(0.4545)) * 5.0 + 0.5) / 5.0;
        return vec4(g, linDepth(u));
      }
      float hsh(vec4 a){ return fract(sin(dot(a.rgb, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
      bool differ(vec4 a, vec4 b){ return length(a.rgb - b.rgb) > 0.05 || abs(a.a - b.a) / min(a.a, b.a) > 0.06; }
      // a lies over b: the nearer piece, or by the hash of the colour when the depth is the same
      bool above(vec4 a, vec4 b){ float rd = (b.a - a.a) / min(a.a, b.a); if (abs(rd) > 0.06) return rd > 0.0; return hsh(a) > hsh(b); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        // torn edges: a slow noise bends the lookup; a fine one makes the edge ragged
        vec2 w = (vec2(fbm(fc / sc * 0.045), fbm(fc / sc * 0.045 + 31.7)) - 0.5) * 9.0 * sc
               + (vec2(vn(fc / sc * 0.5), vn(fc / sc * 0.5 + 17.0)) - 0.5) * 3.0 * sc;
        vec2 u = uv + w * px;
        vec4 me = pcAt(u);
        // fibre band: the top piece is white at its edge where a piece below lies within a ragged distance
        float Rf = (2.4 + 3.0 * vn(fc / sc * 0.13 + 3.0)) * sc, fibre = 0.0;
        for (int i = 0; i < 8; i++) {
          float an = float(i) * 0.7854 + 0.2;
          vec2 d = vec2(cos(an), sin(an));
          for (int k = 0; k < 2; k++) {
            float rr = k == 0 ? 0.5 : 1.0;
            vec4 nb = pcAt(u + d * Rf * rr * px);
            if (differ(me, nb) && above(me, nb)) fibre = max(fibre, k == 0 ? 1.0 : 0.7);
          }
        }
        // shadow: a piece above this one, up and to the left, throws a soft shadow down and to the right
        float sh = 0.0;
        for (int k = 1; k <= 2; k++) {
          vec4 nb = pcAt(u + vec2(-2.6, 2.6) * float(k) * sc * px);
          if (differ(me, nb) && above(nb, me)) sh += 0.5 * (k == 1 ? 1.0 : 0.6);
        }
        // paper: its own tone for each piece, fibre grain, and a slightly lighter rough edge
        float tone = 0.94 + 0.1 * (hsh(me) - 0.5);
        float grain = 0.5 * vn(fc / sc * 0.7) + 0.5 * vn(vec2(fc.x * 0.07 + fc.y * 0.3, fc.y * 0.05 - fc.x * 0.2) / sc);
        vec3 col = pow(me.rgb, vec3(2.2)) * tone * (0.9 + 0.2 * grain);
        vec3 white = vec3(0.93, 0.91, 0.85) * (0.9 + 0.16 * vn(fc / sc * 0.9 + 21.0));
        float fib = clamp(fibre * (0.72 + 0.5 * vn(fc / sc * 1.1 + 5.0)), 0.0, 1.0);
        col = mix(col, white * 1.5, fib);
        col *= 1.0 - 0.38 * clamp(sh, 0.0, 1.0) * (1.0 - fib);
        return vec4(col * mix(1.0, 1.9, smoothstep(0.45, 0.9, lum(col))), 1.0);
      }`,
  },
};
