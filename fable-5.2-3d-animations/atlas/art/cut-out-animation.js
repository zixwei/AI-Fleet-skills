// Art style 55: Cut-out animation. Inputs C D S (colour, depth, frame step).
// Flat paper pieces (colour posterised to a few flat tones, paper fibre), a small shadow below each depth layer, a white cut edge on the nearer piece,
// cut edges that are a little uneven, and 12 frames per second (the pieces shift by a hair on each frame).
window.ARTS = window.ARTS || {};
ARTS['cut-out-animation'] = {
  id: 'cut-out-animation', name: 'Cut-out animation', group: 'Hand-made animation', inputs: 'C D S',
  fps: 12,
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      vec3 outc(vec3 g){ return pow(clamp(g, 0.0, 1.0), vec3(2.2)) * 2.3; }
      vec4 postFX(vec2 uv0){
        vec2 px = 1.0 / uRes, fc = uv0 * uRes;
        float fr = floor(uTime * 12.0 + 0.5);
        // uneven cut edges: the lookup is bent by a slow and a fast noise that stay fixed on the screen; each frame the pieces shift by about a pixel
        vec2 jit = (vec2(h21(vec2(fr, 5.0)), h21(vec2(fr, 6.0))) - 0.5) * 2.2 * px;
        vec2 q = uv0 + jit + (vec2(vn(fc * 0.045), vn(fc * 0.045 + 77.0)) - 0.5) * 3.0 * px + (vec2(vn(fc * 0.2), vn(fc * 0.2 + 9.0)) - 0.5) * 1.0 * px;
        vec3 c = texture2D(tColor, q).rgb;
        float d0 = dd(q);
        // flat tones: display-like gamma, then 5 levels per channel (soft steps), so each piece is one colour
        vec3 g = pow(clamp(c / (c + 0.9) * 1.9, 0.0, 1.0), vec3(1.05));
        float mn = min(g.r, min(g.g, g.b));
        g = clamp(mn + (g - mn) * 1.35, 0.0, 1.0);                           // paper is saturated
        float Lg = max(dot(g, vec3(0.2126, 0.7152, 0.0722)), 0.03);
        vec3 ch = floor(g / Lg * 5.0 + 0.5) / 5.0;                           // one hue and chroma for each piece
        float Lq = max(floor(Lg * 3.0 + 0.5) / 3.0, 0.2);                    // three flat lightness levels, hard steps
        g = clamp(ch * Lq, 0.0, 1.0);
        // paper: fibres and a slight mottling, a different sheet for each depth layer
        float layer = floor(clamp(d0 / uFocus, 0.2, 3.0) * 6.0);
        float fib = vn(fc * vec2(1.1, 0.07) + layer * 13.0) * 0.5 + vn(fc * vec2(0.06, 0.9) + layer * 7.0) * 0.5;
        float mot = vn(fc * 0.012 + layer * 3.0);
        g *= 0.9 + 0.15 * fib + 0.06 * mot;
        // the shadow of a nearer piece falls down and to the right: look up and to the left for something nearer
        float sh = 0.0;
        for (int i = 1; i <= 4; i++) {
          vec2 o = vec2(-0.7, 0.8) * px * 4.5 * float(i);
          float nearer = step(0.04, (d0 - dd(q + o)) / d0);
          sh = max(sh, nearer * (1.0 - 0.17 * float(i - 1)));
        }
        g *= 1.0 - 0.45 * sh;
        // cut edge: the white core of the paper shows on the nearer piece, along the depth edge
        float ed = 0.0;
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.7854;
          ed = max(ed, step(0.04, (dd(q + vec2(cos(a), sin(a)) * 2.0 * px) - d0) / d0));
        }
        g = mix(g, vec3(0.97, 0.96, 0.93), ed * 0.85);
        return vec4(outc(g), 1.0);
      }`,
  },
};
