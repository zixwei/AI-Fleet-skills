// Art style 85: Papel picado. Input D (depth).
// 5 rows of tissue-paper flags hang from strings in front of a bright back light (a warm to blue gradient). Each flag has a folded top,
// a pinked bottom edge, a punched border and its own colour. The flags sway in the wind: the lean grows with the distance from the string
// and each flag has its own phase, and a ripple runs down it. The picture is the holes: the depth image sets how many holes are punched
// (a grid of round holes whose size follows nearness times a depth-derived light tone; they never merge, so the paper stays whole) and a cut line
// follows each depth edge. Nearness uses uFocus: parts nearer than about 0.9 times uFocus get the full hole size and parts farther than 1.6 times get none.
// The picture hangs on the flags, so it sways with them.
window.ARTS = window.ARTS || {};
ARTS['papel-picado'] = {
  id: 'papel-picado', name: 'Papel picado', group: 'World traditions', inputs: 'C D',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 4.0); }
      vec3 lin(vec3 g){ return pow(clamp(g, 0.0, 1.0), vec3(2.2)) * mix(0.62, 2.4, smoothstep(0.6, 0.95, lum(g))); }
      // lateral shift of the flag at height v (0 at the string, 1 at the bottom), in flag widths
      float wind(float ix, float r, float v){
        float ph = ix * 0.9 + r * 1.7;
        return (0.1 * sin(uTime * 1.6 + ph) + 0.05 * sin(uTime * 3.1 + ph * 2.3)) * v + 0.025 * sin(v * 7.0 - uTime * 4.5 + ph) * v;
      }
      // is the point in the flag of cell ix? returns 1 inside
      float inFlag(float u, float v){
        float vb = 1.0 - 0.045 * abs(fract(u * 7.0) - 0.5) * 2.0;
        return step(0.0, u) * step(u, 1.0) * step(-0.09, v) * step(v, vb);
      }
      vec4 postFX(vec2 uv){
        vec2 res = uRes; float sc = res.y / 720.0;
        vec2 fc = uv * res;
        float P = res.y / 4.8, fw = 0.92 * P, X = 1.02 * P, fh = 0.8 * P, ly0 = 0.12 * P;
        float yt = res.y - fc.y, r = floor(yt / P), ly = yt - r * P;
        float x = fc.x + mod(r, 2.0) * 0.5 * X, ixb = floor(x / X);
        // back light
        vec3 back = mix(vec3(1.0, 0.82, 0.52), vec3(0.58, 0.78, 1.0), clamp(fc.y / res.y * 1.1, 0.0, 1.0));
        back *= 1.0 - 0.25 * pow(length((uv - 0.5) * vec2(1.3, 1.0)), 2.0);
        vec3 col = back;
        // pick the flag that holds this pixel (own cell first, then its neighbours, whose swing can reach here)
        float found = 0.0, sIx = 0.0, sU = 0.0, sV = 0.0, sSh = 0.0;
        for (int j = 0; j < 3; j++) {
          float k = j == 0 ? 0.0 : j == 1 ? -1.0 : 1.0;
          float ix = ixb + k, lx = x - ix * X, v = (ly - ly0) / fh;
          float sh = wind(ix, r, clamp(v, 0.0, 1.0)) * fw, u = (lx - sh) / fw;
          if (found < 0.5 && inFlag(u, v) > 0.5) { found = 1.0; sIx = ix; sU = u; sV = v; sSh = sh; }
        }
        // the string
        float sag = 0.012 * P * sin(fc.x / (3.0 * P) * 6.2832);
        float stringL = smoothstep(1.6 * sc, 0.6 * sc, abs(ly - ly0 - sag));
        if (found > 0.5) {
          float ci = h21(vec2(sIx + 3.0, r + 7.0)), pk = floor(ci * 6.0);
          vec3 paper = pk < 0.5 ? vec3(0.95, 0.2, 0.5) : pk < 1.5 ? vec3(1.0, 0.5, 0.1) : pk < 2.5 ? vec3(0.1, 0.72, 0.72)
                     : pk < 3.5 ? vec3(1.0, 0.82, 0.15) : pk < 4.5 ? vec3(0.55, 0.25, 0.8) : vec3(0.4, 0.78, 0.25);
          float ph = sIx * 0.9 + r * 1.7;
          // tissue: fibres, a few soft folds that move with the wind, a darker folded top
          paper *= 0.92 + 0.1 * vn(vec2(sU * fw * 0.9, sV * fh * 0.04) / sc) + 0.1 * sin(sU * 9.0 + uTime * 2.0 + ph) * clamp(sV, 0.0, 1.0);
          if (sV < 0.0) paper *= 0.62;
          // the scene as it hangs on the flag: its screen position moves with the flag
          vec2 sp = (fc - vec2(sSh, 0.0)) / res;
          float d0 = dd(sp), near = smoothstep(1.6, 0.9, d0 / uFocus);
          float sky = step(0.9999, texture2D(tDepth, sp).x);
          // a light tone from the slope of the depth image, so surfaces differ from each other
          vec2 pxs = 1.5 * sc / res;
          float gx = (dd(sp + vec2(pxs.x, 0.0)) - dd(sp - vec2(pxs.x, 0.0))) / d0, gy = (dd(sp + vec2(0.0, pxs.y)) - dd(sp - vec2(0.0, pxs.y))) / d0;
          vec3 nr = normalize(vec3(-gx * 3.0, -gy * 3.0, 1.0));
          float tone = 0.5 + 0.5 * dot(nr, normalize(vec3(-0.4, 0.6, 0.7)));
          vec3 gs = pow(clamp(texture2D(tColor, sp).rgb, 0.0, 1.0), vec3(1.0 / 2.2));
          float cov = (1.0 - sky) * near * clamp(pow(tone, 1.2) * 0.5 + (lum(gs) - 0.45) * 1.8 + 0.25, 0.0, 1.0);
          // punched holes in a grid fixed to the flag
          vec2 lc = vec2(sU * fw, sV * fh) / (6.0 * sc);
          lc.x += 0.5 * mod(floor(lc.y), 2.0);
          float hole = smoothstep(0.02, -0.03, length(fract(lc) - 0.5) - 0.47 * sqrt(clamp(cov, 0.0, 1.0)));
          // cut line along each depth edge
          float de = 0.0;
          for (int i = 0; i < 4; i++) {
            vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * 2.6 * sc / res;
            de = max(de, max(abs(dd(sp + o) - d0) / d0, length(texture2D(tColor, sp + o).rgb - texture2D(tColor, sp).rgb) * 0.25));
          }
          hole = max(hole, smoothstep(0.03, 0.07, de) * (1.0 - sky * 0.0) * step(0.0, sV));
          // the punched border: a row of small holes inside the edge
          float bx = min(sU * fw, (1.0 - sU) * fw), by = min(sV * fh, fh - sV * fh), bd = min(bx, by);
          float ring = step(8.0 * sc, bd) * step(bd, 12.0 * sc) * smoothstep(0.55, 0.4, abs(fract((sU * fw + sV * fh) / (7.0 * sc)) - 0.5) * 2.0 + 0.0);
          hole = max(hole, ring * step(0.0, sV));
          // paper next to a hole is a little lighter: the light comes through the thin edge
          col = mix(paper, back, hole);
        }
        col = mix(col, vec3(0.28, 0.18, 0.1), stringL * 0.9);
        return vec4(lin(col), 1.0);
      }`,
  },
};
