// Art style 9: Paint on glass. Inputs C D S (colour, depth, frame step). fps = 8.
// Wet oil paint on a lit glass sheet at 8 frames per second. The edges of each form drag in the brush direction, different on each frame.
window.ARTS = window.ARTS || {};
ARTS['paint-on-glass'] = {
  id: 'paint-on-glass', name: 'Paint on glass', group: 'The medium changes with time', inputs: 'C D S',
  fps: 8,
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      // The drawing of this frame: uTime is a multiple of 1/8 s, so this is the same for the whole 1/8 s
      float frameNo(){ return floor(uTime * 8.0 + 0.5); }
      // the paint of one frame: colour dragged along the brush direction. The nearest thing along the stroke wins, so objects smear into what is behind them.
      vec3 drag(vec2 uv, vec2 dir, float len){
        vec2 px = 1.0 / uRes;
        float best = 1e9; vec3 bc = texture2D(tColor, uv).rgb; vec3 acc = vec3(0.0); float ws = 0.0;
        for (int i = 0; i < 14; i++) {
          float s = float(i) / 13.0;
          vec2 q = uv - dir * len * s * px;
          float d = dd(q);
          // closer things and shorter drags weigh more: a soft winner
          float w = exp(-(d / dd(uv) - 1.0) * 10.0 * 0.0) * exp(-s * 0.6);
          if (d < best) { best = d; bc = texture2D(tColor, q).rgb; }
          acc += texture2D(tColor, q).rgb * w; ws += w;
        }
        return mix(acc / ws, bc, 0.9);
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float f = frameNo();
        // brush direction: new on every frame. Mostly sideways and diagonal, like a loaded brush pulled across the glass.
        float th = (h21(vec2(f, 3.1)) - 0.5) * 3.6 + 0.35 + 3.1416 * step(0.5, h21(vec2(f, 8.7)));
        vec2 dir = vec2(cos(th), sin(th));
        vec2 perp = vec2(-dir.y, dir.x);
        // bristle lines across the stroke: each line has its own drag length
        float across = dot(fc, perp);
        float bristle = vn(vec2(across * 0.09, f * 7.3)) * 0.7 + vn(vec2(across * 0.3, f * 3.1 + 5.0)) * 0.3;
        // where the edges are (depth steps), up to 40 px away along the stroke
        float d0 = dd(uv), edge = 0.0;
        for (int i = 0; i < 6; i++) {
          float a = float(i) * 1.0472 + th;
          float e = abs(dd(uv + vec2(cos(a), sin(a)) * px * 26.0) - d0) / d0;
          edge = max(edge, e);
        }
        float near = smoothstep(0.02, 0.1, edge);
        float len = (8.0 + 64.0 * bristle) * (0.3 + 0.7 * near);
        vec3 c = drag(uv, dir, len);
        // a little wobble of the paint in each frame
        c = mix(c, texture2D(tColor, uv + (vec2(vn(fc * 0.02 + f), vn(fc * 0.02 + f + 9.0)) - 0.5) * 3.0 * px).rgb, 0.2);
        // paint: more saturated, glazed
        float L = lum(c);
        c = max(mix(vec3(L), c, 1.45), 0.0);
        // relief of the brush strokes: ridges along the stroke direction. The light comes from above left.
        float rel = fbm(vec2(dot(fc, dir) * 0.01, across * 0.12) + f * 2.0) + 0.5 * vn(vec2(across * 0.22, dot(fc, dir) * 0.02));
        float rx = fbm(vec2(dot(fc + vec2(2.0, 0.0), dir) * 0.01, dot(fc + vec2(2.0, 0.0), perp) * 0.12) + f * 2.0) + 0.5 * vn(vec2(dot(fc + vec2(2.0, 0.0), perp) * 0.22, dot(fc + vec2(2.0, 0.0), dir) * 0.02));
        float ry = fbm(vec2(dot(fc + vec2(0.0, 2.0), dir) * 0.01, dot(fc + vec2(0.0, 2.0), perp) * 0.12) + f * 2.0) + 0.5 * vn(vec2(dot(fc + vec2(0.0, 2.0), perp) * 0.22, dot(fc + vec2(0.0, 2.0), dir) * 0.02));
        vec2 gr = vec2(rx - rel, ry - rel) * 9.0;
        float spec = pow(clamp(dot(normalize(vec3(-gr, 1.0)), normalize(vec3(-0.4, 0.55, 0.75))), 0.0, 1.0), 22.0);
        // light through the paint: thin paint (light colour) is bright; the glass is lit from behind
        vec3 lin = c * (0.86 + 0.28 * (rel - 0.6)) ;
        lin += c * 0.25 * smoothstep(0.35, 0.9, L);                     // glow of the thin parts
        lin += vec3(1.0, 0.97, 0.9) * spec * 0.4;                      // wet gloss
        // the glass sheet: a bright lamp behind it, a dark frame, and one soft reflection
        float lamp = 1.0 - 0.35 * length((uv - vec2(0.5, 0.45)) * vec2(1.0, 1.1));
        lin *= lamp * 1.25;
        vec2 e = min(fc, uRes - fc);
        float rimd = min(e.x, e.y);
        lin *= smoothstep(8.0, 20.0, rimd);
        lin += vec3(0.9, 0.95, 1.0) * 0.12 * smoothstep(5.0, 0.0, abs(rimd - 26.0));
        float refl = smoothstep(0.03, 0.0, abs(uv.x * 0.9 + uv.y * 0.5 - 0.55)) + smoothstep(0.012, 0.0, abs(uv.x * 0.9 + uv.y * 0.5 - 0.66)) * 0.6;
        lin += vec3(0.9, 0.95, 1.0) * 0.07 * refl;
        return vec4(lin, 1.0);
      }`,
  },
};
