// Art style 7: Patina plate. Inputs C D B (colour, depth, beat times).
// A polished copper plate. During each beat, green patina grows inward from the edges of each object.
window.ARTS = window.ARTS || {};
ARTS['patina-plate'] = {
  id: 'patina-plate', name: 'Patina plate', group: 'The medium changes with time', inputs: 'C D B',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        // growth: 0 to 1 across the beat interval (the last beat reuses the length of the one before)
        float k = beatIdx(), t0 = 0.0, t1 = 2.5, prevT = 0.0;
        for (int i = 0; i < 8; i++) {
          if (i >= uBeatN) break;
          if (float(i) == k) { t0 = uBeats[i]; t1 = (i + 1 < uBeatN) ? uBeats[i + 1] : uBeats[i] + (i > 0 ? uBeats[i] - prevT : 2.5); }
          prevT = uBeats[i];
        }
        float p = clamp((uCanon - t0) / max(t1 - t0, 0.01), 0.0, 1.0);
        float d0 = dd(uv), edge = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * px * 1.5;
          edge = max(edge, abs(dd(uv + o) - d0) / d0);
        }
        // Walk 6 directions in 10 px steps (up to 100 px). A hit is a depth step of 7 % or more between two steps that goes away from the camera,
        // so a floor that recedes smoothly is not an edge. hr = distance of the first hit in each direction (200 if none).
        float hr[6];
        float rot = h21(fc) * 0.5;
        for (int d = 0; d < 6; d++) {
          float an = float(d) * 1.0472 + rot;
          vec2 dv = vec2(cos(an), sin(an));
          float prev = d0, h = 200.0;
          for (int i = 1; i <= 10; i++) {
            float ds = dd(uv + dv * float(i) * 10.0 * px);
            if (h > 199.0 && ds > prev * 1.07) h = float(i) * 10.0;
            prev = ds;
          }
          hr[d] = h;
        }
        float prox = min(min(min(hr[0], hr[1]), min(hr[2], hr[3])), min(hr[4], hr[5]));
        // local width of the thing: the narrowest chord through the pixel (two opposite directions)
        float width = min(min(hr[0] + hr[3], hr[1] + hr[4]), hr[2] + hr[5]);
        // ---- polished copper: warm, with a tone from the picture, soft brushed streaks, and a broad reflection
        vec3 c = texture2D(tColor, uv).rgb;
        float Lg = pow(clamp(lum(c), 0.0, 1.0), 1.0 / 2.2);
        vec3 cu = vec3(0.93, 0.50, 0.31) * (0.38 + 0.8 * Lg);
        cu = mix(cu, cu * (0.6 + 0.9 * pow(clamp(c, 0.0, 1.0), vec3(0.45))), 0.25);
        float brush = vn(vec2(fc.x * 0.012, fc.y * 0.9));
        cu *= 0.94 + 0.1 * brush;
        float sweep = pow(max(0.0, 1.0 - abs(uv.x * 0.8 + uv.y * 0.6 - 0.62) * 3.2), 2.0);
        cu = cu * (0.9 + 0.35 * sweep) + vec3(1.0, 0.72, 0.55) * 0.22 * sweep;
        // engraved line where objects end
        
        // ---- patina: grows from the edge inward. Its front moves 0 to about 90 px; the front is uneven.
        float reach = min(p * 92.0, 0.36 * width) * (0.55 + 0.9 * fbm(fc * 0.012 + floor(uCanon / 2.5) * 5.0));
        float inside = 1.0 - smoothstep(reach * 0.7, reach, prox);
        // a dark tarnish just ahead of the green, and verdigris crust behind
        float tarn = (1.0 - smoothstep(reach, reach * 1.35 + 6.0, prox)) * step(0.5, p + 0.01);
        float crust = fbm(fc * 0.09) * 0.6 + vn(fc * 0.35) * 0.4;
        vec3 green = mix(vec3(0.20, 0.54, 0.40), vec3(0.58, 0.82, 0.62), smoothstep(0.35, 0.8, crust));
        green = mix(green, vec3(0.12, 0.28, 0.24), smoothstep(0.55, 0.15, crust) * 0.6);
        green *= 0.88 + 0.24 * vn(fc * 0.3);
        float front = smoothstep(reach * 0.55, reach, prox) * inside;            // pale blue-green crystals at the front
        green = mix(green, vec3(0.62, 0.88, 0.80), front * 0.6);
        vec3 col = mix(cu, cu * vec3(0.55, 0.38, 0.30), tarn * 0.8);
        float cover = inside * smoothstep(0.25, 0.55, crust + 0.35 * (1.0 - p) * 0.0 + 0.35);
        col = mix(col, green, clamp(cover, 0.0, 1.0));
        col = mix(col, vec3(0.20, 0.08, 0.04), smoothstep(0.02, 0.06, edge) * 0.75);   // the engraved edge line stays over the green
        // plate: vignette, and a bevelled rim
        vec2 e = min(fc, uRes - fc);
        float rimd = min(e.x, e.y);
        col *= 1.0 - 0.32 * smoothstep(0.3, 1.0, length((uv - 0.5) * vec2(1.1, 1.0)) * 1.5);
        col = mix(col, vec3(1.0, 0.7, 0.5) * 0.9, 0.5 * smoothstep(3.0, 0.0, abs(rimd - 14.0)) * 0.5);
        col *= 1.0 - 0.5 * smoothstep(12.0, 0.0, rimd);
        vec3 lin = pow(clamp(col, 0.0, 1.5), vec3(2.2));
        lin *= mix(1.0, 1.7, smoothstep(0.5, 0.9, lum(lin)));
        return vec4(lin, 1.0);
      }`,
  },
};
