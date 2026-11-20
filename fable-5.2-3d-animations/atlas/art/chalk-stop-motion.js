// Art style 54: Chalk stop-motion. Inputs C D S (colour, depth, frame step).
// Chalk on a blackboard, drawn again for every frame (8 per second, so the strokes boil). A grey smear stays around each form where the chalk was erased (the smear is fixed on the board).
window.ARTS = window.ARTS || {};
ARTS['chalk-stop-motion'] = {
  id: 'chalk-stop-motion', name: 'Chalk stop-motion', group: 'Hand-made animation', inputs: 'C D S',
  fps: 8,
  labels: 'halo',   // K.label text stays readable over the strokes
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float tone(vec2 uv){ float L = lum(texture2D(tColor, uv).rgb); return pow(clamp(L / (L + 0.9) * 1.9, 0.0, 1.0), 0.8); }
      vec3 outc(vec3 g){ return pow(clamp(g, 0.0, 1.0), vec3(2.2)) * 2.3; }
      // how much chalk the scene asks for here (smooth): coloured things and shaded parts get chalk, bright neutral flats (walls, paper, floor) stay bare board
      float want(vec2 uv){
        vec3 c = texture2D(tColor, uv).rgb;
        float L = lum(c), g = pow(clamp(L / (L + 0.9) * 1.9, 0.0, 1.0), 0.8);
        float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b));
        float sat = (mx - mn) / max(mx, 1e-3);
        float w = max(smoothstep(0.18, 0.5, sat) * 0.9, 1.0 - smoothstep(0.15, 0.5, g));
        return w * smoothstep(0.05, 0.2, g);
      }
      vec4 postFX(vec2 uv0){
        vec2 px = 1.0 / uRes, fc = uv0 * uRes;
        float fr = floor(uTime * 8.0 + 0.5);
        // every frame is drawn again: the hand is not at the same place twice
        vec2 uv = uv0 + (vec2(vn(fc * 0.02 + fr * 9.1), vn(fc * 0.02 + 33.0 + fr * 9.1)) - 0.5) * 6.0 * px;
        vec3 c = texture2D(tColor, uv).rgb;
        float g = tone(uv), W = want(uv);
        float mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b));
        float sat = clamp((mx - mn) / max(mx, 1e-3), 0.0, 1.0);
        vec3 hue = c / max(mx, 1e-3);
        vec3 chalk = mix(vec3(0.97, 0.96, 0.92), hue, clamp(sat * 1.1, 0.0, 0.8));
        chalk *= 0.82 + 0.18 * g;
        // blackboard: dark green-grey with a faint old haze that is the same in every frame
        float haze = vn(fc * vec2(0.004, 0.012) + 3.0) * 0.6 + vn(fc * 0.002 + 9.0) * 0.4;
        vec3 board = vec3(0.075, 0.1, 0.09) * (0.8 + 0.5 * haze) + 0.02 * vn(fc * 0.6);
        // erased smear: the wiped chalk is a smoothed copy of where chalk was wanted, pulled along a wiping direction that changes slowly over the board
        float sm = 0.0;
        float wa = (vn(fc * 0.0035 + 21.0) - 0.5) * 1.6 - 0.35;
        mat2 wr = mat2(cos(wa), sin(wa), -sin(wa), cos(wa));
        for (int i = 0; i < 12; i++) {
          float r = 6.0 + 7.0 * float(i);
          vec2 o = wr * vec2(cos(float(i) * 2.4), sin(float(i) * 2.4) * 0.45) * r * px;
          sm += want(uv0 + o);
        }
        sm /= 12.0;
        float streak = 0.65 + 0.35 * vn((wr * fc) * vec2(0.01, 0.12));
        float smear = clamp(sm * 1.5, 0.0, 1.0) * (1.0 - W) * streak;
        vec3 col = mix(board, vec3(0.42, 0.45, 0.43), smear * 0.62);
        // chalk fill: dusty diagonal strokes; the less light, the fewer strokes
        vec2 p = vec2(fc.x * 0.8 + fc.y * 0.6, -fc.x * 0.6 + fc.y * 0.8);
        float stripes = 0.5 + 0.5 * sin(p.x * 0.8 + 6.0 * vn(p * 0.03 + fr * 3.7) + fr * 2.1);
        float dust = vn(fc * 0.9 + fr * 17.0) * 0.55 + vn(fc * 0.37 + fr * 5.0) * 0.45;
        float val = 0.68 * stripes + 0.14 * dust + 0.3 * (vn(vec2(p.x * 0.1, p.y * 0.028) + fr * 4.3) - 0.5) + 0.1;
        float thr = 1.0 - 0.46 * W;
        float cov = smoothstep(thr, thr + 0.12, val);
        col = mix(col, chalk, 0.24 * W * (0.4 + dust));          // a soft rubbed layer under the strokes
        col = mix(col, chalk, cov * (0.55 + 0.45 * dust));
        // chalk outline: white, ragged, a little thicker on silhouettes
        float d0 = dd(uv), de = 0.0, ce = 0.0, R = 2.0 + 1.0 * vn(fc * 0.05 + fr);
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.7854 + 0.3;
          vec2 o = vec2(cos(a), sin(a)) * R * px;
          de = max(de, abs(dd(uv + o) - d0) / d0);
          ce = max(ce, abs(tone(uv + o) - g));
        }
        float line = max(smoothstep(0.015, 0.04, de), smoothstep(0.16, 0.34, ce) * 0.8);
        float rag = smoothstep(0.28, 0.5, vn(fc * 0.55 + fr * 23.0) * 0.6 + vn(fc * 0.11 + fr * 7.0) * 0.4);
        col = mix(col, vec3(0.97, 0.97, 0.94) * (0.88 + 0.12 * dust), line * rag);
        return vec4(outc(col), 1.0);
      }`,
  },
};
