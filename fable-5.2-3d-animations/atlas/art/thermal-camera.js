// Art style 38: Thermal camera (version of the first-set style "thermal"). Inputs C D (colour, depth).
// Brightness and nearness make a heat value. The value goes through an iron-bow palette (black, violet, red, orange, white).
// Low-resolution sensor blocks, sensor noise, a crosshair with a reading that follows the heat at the centre, and a scale bar at the side.
window.ARTS = window.ARTS || {};
ARTS['thermal-camera'] = {
  id: 'thermal-camera', name: 'Thermal camera', group: 'Light makes the picture', inputs: 'C D',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 4.0); }
      vec3 iron(float x){ x = clamp(x, 0.0, 1.0);
        vec3 c0 = vec3(0.0, 0.0, 0.02), c1 = vec3(0.18, 0.02, 0.42), c2 = vec3(0.62, 0.05, 0.45), c3 = vec3(0.95, 0.3, 0.05), c4 = vec3(1.0, 0.75, 0.1), c5 = vec3(1.0, 1.0, 0.85);
        if (x < 0.2) return mix(c0, c1, x / 0.2); if (x < 0.4) return mix(c1, c2, (x - 0.2) / 0.2); if (x < 0.6) return mix(c2, c3, (x - 0.4) / 0.2); if (x < 0.8) return mix(c3, c4, (x - 0.6) / 0.2); return mix(c4, c5, (x - 0.8) / 0.2); }
      // heat of a point: bright and near is hot, the sky and far ground are cold
      float heat(vec2 uv){
        vec3 c = texture2D(tColor, uv).rgb;
        float L = clamp(lum(c) * 1.1, 0.0, 1.0);
        float bg = step(0.9999, texture2D(tDepth, uv).x);
        float near = pow(1.0 - clamp((dd(uv) / uFocus - 0.5) / 1.5, 0.0, 1.0), 1.0);
        return mix(0.05 + near * (0.03 + 0.62 * pow(L, 1.1)), 0.03, bg);
      }
      // seven-segment digits, cell p in [0,1] x [0,2]; m is the segment mask (a 1, b 2, c 4, d 8, e 16, f 32, g 64)
      float rect(vec2 p, vec2 lo, vec2 hi){ return step(lo.x, p.x) * step(p.x, hi.x) * step(lo.y, p.y) * step(p.y, hi.y); }
      float glyph(vec2 p, int m){
        float s = 0.0;
        if ((m & 1) != 0) s += rect(p, vec2(0.12, 1.8), vec2(0.88, 2.0));
        if ((m & 2) != 0) s += rect(p, vec2(0.8, 1.04), vec2(1.0, 1.9));
        if ((m & 4) != 0) s += rect(p, vec2(0.8, 0.1), vec2(1.0, 0.96));
        if ((m & 8) != 0) s += rect(p, vec2(0.12, 0.0), vec2(0.88, 0.2));
        if ((m & 16) != 0) s += rect(p, vec2(0.0, 0.1), vec2(0.2, 0.96));
        if ((m & 32) != 0) s += rect(p, vec2(0.0, 1.04), vec2(0.2, 1.9));
        if ((m & 64) != 0) s += rect(p, vec2(0.12, 0.9), vec2(0.88, 1.1));
        return min(s, 1.0);
      }
      const int DM[10] = int[10](63, 6, 91, 79, 102, 109, 125, 7, 127, 111);
      // draw the text "dd.d" then a C, with the lower left corner at o (pixels), cell height 32 px
      float number(vec2 fc, vec2 o, float val){
        float v = clamp(floor(val * 10.0 + 0.5), 0.0, 999.0);
        int t = int(floor(v / 100.0)), u = int(mod(floor(v / 10.0), 10.0)), f = int(mod(v, 10.0));
        vec2 p = (fc - o) / 16.0; p.y /= 1.0;               // cell 16 px wide, 32 px high -> p.y in [0,2]
        float s = 0.0;
        vec2 q = vec2(p.x, p.y);
        if (q.x >= 0.0 && q.x < 1.0) s += glyph(q, DM[t]);
        q.x -= 1.5; if (q.x >= 0.0 && q.x < 1.0) s += glyph(q, DM[u]);
        q.x -= 1.5; s += rect(q, vec2(0.0, 0.0), vec2(0.35, 0.3));                      // decimal point
        q.x -= 0.7; if (q.x >= 0.0 && q.x < 1.0) s += glyph(q, DM[f]);
        q.x -= 1.9; if (q.x >= 0.0 && q.x < 1.0) s += glyph(q, 57);                    // C
        return min(s, 1.0);
      }
      float num2(vec2 fc, vec2 o, int a, int b){
        vec2 p = (fc - o) / 16.0; float s = 0.0;
        if (p.x >= 0.0 && p.x < 1.0) s += glyph(p, DM[a]);
        p.x -= 1.5; if (p.x >= 0.0 && p.x < 1.0) s += glyph(p, DM[b]);
        return min(s, 1.0);
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        // sensor: 3 x 3 pixel blocks, a little blur
        vec2 cell = floor(fc / 3.0);
        vec2 q = (cell + 0.5) * 3.0 * px;
        float v = 0.0;
        for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) v += heat(q + vec2(float(i), float(j)) * px * 2.0);
        v /= 9.0;
        // sensor noise: new every frame, plus a slow rolling band
        v += (h21(cell + fract(uTime * 13.0) * 50.0) - 0.5) * 0.05;
        v += 0.012 * sin(fc.y * 0.5 + uTime * 40.0);
        vec3 c = iron(v);
        // crosshair, box and reading at the centre
        vec2 d = fc - 0.5 * uRes;
        float ch = ((abs(d.x) < 1.5 && abs(d.y) > 14.0 && abs(d.y) < 64.0) || (abs(d.y) < 1.5 && abs(d.x) > 14.0 && abs(d.x) < 64.0)) ? 1.0 : 0.0;
        float box = ((abs(abs(d.x) - 96.0) < 1.5 && abs(d.y) < 96.0) || (abs(abs(d.y) - 96.0) < 1.5 && abs(d.x) < 96.0)) ? 1.0 : 0.0;
        float hc = 0.0;
        for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) hc += heat(vec2(0.5) + vec2(float(i), float(j)) * px * 4.0);
        hc /= 25.0;
        float rd = number(fc, 0.5 * uRes + vec2(108.0, -126.0), mix(10.0, 40.0, clamp(hc, 0.0, 1.0)));
        c = mix(c, vec3(1.0), max(max(ch, box * 0.75), rd));
        // scale bar at the right: the palette, ticks and the two end values
        if (uv.x > 0.935 && uv.x < 0.95 && uv.y > 0.2 && uv.y < 0.8) c = iron((uv.y - 0.2) / 0.6);
        float tick = (uv.x > 0.924 && uv.x < 0.935 && abs(fract((uv.y - 0.2) / 0.06) - 0.0) < 0.06 && uv.y > 0.195 && uv.y < 0.805) ? 1.0 : 0.0;
        float bar = (uv.x > 0.932 && uv.x < 0.953 && ((abs(uv.y - 0.2) < 0.0016) || (abs(uv.y - 0.8) < 0.0016))) ? 1.0 : 0.0;
        float sc = max(num2(fc, vec2(0.957 * uRes.x, 0.8 * uRes.y - 16.0), 4, 0), num2(fc, vec2(0.957 * uRes.x, 0.2 * uRes.y - 16.0), 1, 0));
        c = mix(c, vec3(1.0), max(max(tick * 0.8, bar), sc));
        vec2 vv = uv - 0.5; c *= 1.0 - dot(vv, vv) * 0.8;
        return vec4(pow(c, vec3(1.5)) * 1.6, 1.0);
      }`,
  },
};
