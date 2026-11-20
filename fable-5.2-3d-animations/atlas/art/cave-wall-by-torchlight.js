// Art style 89: Cave wall by torchlight. Inputs C D (colour, depth).
// The wall is rough rock: a height field of 3 noise scales plus a little of the scene depth as shallow relief. Pigment lies on it:
// charcoal on dark tones and on the contour lines (colour and depth edges), red or yellow ochre on the coloured tones (warm hues take red
// ochre), and the bare rock where the scene is light and grey. The pigment breaks up in the pits and on the peaks of the rock.
// One flame lights the wall. It drifts along a slow path (uTime) and flickers (a noise of at most 2.5 changes per second moves it by about 0.6 percent of the frame height
// and changes its strength), and the light is a point light 0.18 frame heights in front of the wall. The rock normal comes from the height
// gradient, so the bumps change shading each time the flame moves; the pigment is lit the same way. The flame is drawn as a small glow.
window.ARTS = window.ARTS || {};
ARTS['cave-wall-by-torchlight'] = {
  id: 'cave-wall-by-torchlight', name: 'Cave wall by torchlight', group: 'World traditions', inputs: 'C D',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      float rock(vec2 p, vec2 uv){
        float h = 0.55 * fbm(p * 0.012) + 0.3 * fbm(p * 0.05 + 4.0) + 0.15 * vn(p * 0.2 + 9.0);
        return h + 0.12 * (1.0 - clamp(dd(uv) / uFocus, 0.0, 2.0) * 0.5);     // nearer things stand a little proud
      }
      vec4 postFX(vec2 uv){
        vec2 res = uRes, fc = uv * res; float sc = res.y / 720.0;
        vec2 p = fc / sc;
        // flame: slow drift plus fast flicker
        float T = uTime;
        vec2 fl = vec2(vn(vec2(T * 2.5, 1.0)) - 0.5, vn(vec2(T * 2.0, 5.0)) - 0.5);
        vec2 fp = res * vec2(0.5 + 0.28 * sin(T * 0.45), 0.55 + 0.12 * sin(T * 0.7 + 1.0)) + fl * res.y * 0.006;
        float flick = 0.92 + 0.1 * vn(vec2(T * 2.5, 3.0));   // at most 2.5 changes per second, a few percent per frame
        // rock normal from the height gradient
        vec2 e = vec2(1.5, 0.0);
        float h0 = rock(p, uv), hx = rock(p + e.xy, uv + e.xy * sc / res), hy = rock(p + e.yx, uv + e.yx * sc / res);
        vec3 n = normalize(vec3(-(hx - h0) * 9.0, -(hy - h0) * 9.0, 1.0));
        // pigment from the scene
        vec3 c = texture2D(tColor, uv).rgb;
        vec3 g = pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2));
        float L = lum(g), mx = max(max(g.r, g.g), g.b), mn = min(min(g.r, g.g), g.b), sat = (mx - mn) / max(mx, 0.05);
        float d0 = dd(uv), de = 0.0, ge = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * 1.6 * sc / res;
          de = max(de, abs(dd(uv + o) - d0) / d0); ge = max(ge, length(texture2D(tColor, uv + o).rgb - c));
        }
        float line = max(smoothstep(0.02, 0.05, de), smoothstep(0.12, 0.3, ge) * 0.8);
        float charM = max(smoothstep(0.42, 0.22, L), line);
        float ochM = smoothstep(0.2, 0.42, sat) * (1.0 - charM);
        float warm = smoothstep(-0.05, 0.25, g.r - g.b);
        vec3 ochre = mix(vec3(0.7, 0.5, 0.18), vec3(0.62, 0.2, 0.09), warm);
        // pigment sits on the rock: it breaks up where the surface is high or low
        float tooth = 0.5 + (vn(p * 0.45) - 0.5) * 1.1 + (0.5 - h0) * 0.5;
        float cov = max(charM * smoothstep(0.18, 0.5, tooth), ochM * smoothstep(0.1, 0.4, tooth) * 0.92);
        vec3 alb = mix(vec3(0.5, 0.42, 0.33) * (0.7 + 0.6 * fbm(p * 0.02 + 20.0)), mix(ochre, vec3(0.045, 0.04, 0.04), charM), cov);
        // the flame lights the wall
        vec3 Lv = vec3(fp - fc, 0.18 * res.y);
        float dist = length(Lv), dif = max(dot(n, Lv / dist), 0.0);
        float att = flick / (1.0 + pow(dist / (0.5 * res.y), 2.0));
        vec3 flame = vec3(1.0, 0.6, 0.24);
        vec3 col = alb * flame * (0.05 + 2.3 * dif * att);
        // the flame itself
        float fd = length(fc - fp - vec2(0.0, 0.01 * res.y)) / res.y;
        float core = smoothstep(0.016 * flick, 0.0, length((fc - fp) * vec2(1.6, 0.9)) / res.y);
        col += vec3(1.0, 0.82, 0.4) * core * 1.4 + flame * 0.06 * flick / (1.0 + 90.0 * fd * fd);
        return vec4(col, 1.0);
      }`,
  },
};
