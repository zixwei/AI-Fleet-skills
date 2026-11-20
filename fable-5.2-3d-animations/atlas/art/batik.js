// Art style 84: Batik. Inputs C D (colour, depth).
// Cloth dyed in 3 colours chosen by the scene tone (indigo, soga brown, pale turmeric yellow; blue surfaces take indigo). The wax-resist line stays
// cloth white where the dye class changes or the depth steps; it is wobbly and broken, and the brown areas carry resist dots. Fine crack veins
// (cell edges of a warped 2-scale Voronoi pattern) cross everything: dark where the cloth is light, light where it is dark.
window.ARTS = window.ARTS || {};
ARTS['batik'] = {
  id: 'batik', name: 'Batik', group: 'World traditions', inputs: 'C D',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      vec2 h22(vec2 p){ return vec2(h21(p), h21(p + 17.3)); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 4.0); }
      // dye class: 0 indigo, 1 soga brown, 2 turmeric
      float cls(vec2 uv, vec2 fc, float sc){
        vec3 g = pow(clamp(texture2D(tColor, uv).rgb, 0.0, 1.0), vec3(1.0 / 2.2));
        float L = lum(g) + (fbm(fc * 0.02 / sc) - 0.5) * 0.14;
        float blue = step(g.r * 1.15, g.b) * step(g.g * 1.0, g.b);
        return blue > 0.5 && L < 0.8 ? 0.0 : (L < 0.5 ? 0.0 : (L < 0.78 ? 1.0 : 2.0));
      }
      // distance between the nearest and the second nearest feature point of a Voronoi pattern: small on a crack
      float crack(vec2 p){
        vec2 i = floor(p), f = fract(p); float d1 = 9.0, d2 = 9.0;
        for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
          vec2 o = vec2(float(x), float(y)), r = o + h22(i + o) - f;
          float d = dot(r, r);
          if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
        }
        return sqrt(d2) - sqrt(d1);
      }
      vec3 lin(vec3 g){ return pow(clamp(g, 0.0, 1.0), vec3(2.2)) * mix(0.62, 2.4, smoothstep(0.6, 0.95, lum(g))); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        // the wax edge wobbles: the lookup is moved by a slow noise
        vec2 wob = (vec2(fbm(fc * 0.03 / sc), fbm(fc * 0.03 / sc + 31.0)) - 0.5) * 6.0 * px * sc;
        vec2 q = uv + wob;
        float k0 = cls(q, fc, sc), d0 = dd(q);
        vec3 indigo = vec3(0.06, 0.1, 0.3), soga = vec3(0.5, 0.28, 0.13), turm = vec3(0.86, 0.66, 0.26);
        vec3 col = k0 < 0.5 ? indigo : k0 < 1.5 ? soga : turm;
        float den = fbm(fc * 0.015 / sc + 5.0);
        col *= 0.8 + 0.4 * den;   // uneven dye
        // wax-resist line: where the dye class changes or the depth steps
        float edge = 0.0;
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.7854;
          vec2 o = vec2(cos(a), sin(a)) * px * 2.6 * sc;
          edge = max(edge, max(abs(cls(q + o, fc, sc) - k0) > 0.5 ? 1.0 : 0.0, smoothstep(0.03, 0.06, abs(dd(q + o) - d0) / d0)));
        }
        float broken = smoothstep(0.12, 0.35, vn(fc * 0.11 / sc));   // the canting leaves gaps and beads
        float wax = edge * mix(0.55, 1.0, broken);
        // resist dots on the brown areas
        vec2 dc = fc / (13.0 * sc); vec2 di = floor(dc);
        float dotm = smoothstep(0.1, 0.05, length(fract(dc) - 0.5 + (h22(di) - 0.5) * 0.55) - 0.1 * h21(di + 4.0)) * step(0.4, h21(di + 9.0)) * step(0.5, k0) * step(k0, 1.5) * (1.0 - edge);
        vec3 cloth = vec3(0.95, 0.91, 0.8);
        col = mix(col, cloth, max(wax, dotm * 0.9));
        // crack veins
        vec2 wp = fc / sc + (vec2(fbm(fc * 0.02 / sc), fbm(fc * 0.02 / sc + 9.0)) - 0.5) * 30.0;
        float v1 = smoothstep(0.1, 0.0, crack(wp / 64.0)), v2 = smoothstep(0.14, 0.0, crack(wp / 26.0 + 3.0)) * 0.5;
        float vein = clamp(max(v1, v2) * (0.5 + 0.5 * h21(floor(wp / 11.0))), 0.0, 1.0);
        float Lc = lum(col);
        vec3 vc = mix(vec3(0.04, 0.05, 0.2), vec3(0.3, 0.38, 0.65), smoothstep(0.35, 0.05, Lc));   // dark vein on light cloth, light vein on dark dye
        col = mix(col, vc, vein * 0.6);
        // woven cloth
        float warp = 0.5 + 0.5 * sin(fc.x * 2.2 / sc), weft = 0.5 + 0.5 * sin(fc.y * 2.2 / sc);
        col *= 0.88 + 0.07 * warp + 0.06 * weft + 0.1 * (vn(vec2(fc.x * 0.6, fc.y * 0.03) / sc) - 0.5);
        return vec4(lin(col), 1.0);
      }`,
  },
};
