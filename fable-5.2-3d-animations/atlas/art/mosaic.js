// Art style 74: Mosaic. Inputs C D (colour, depth). The gold flash also reads uViewInv (camera pose, an input of type W): see the report.
// Small stone and glass tiles (9 px at 720p) set in rows that follow the edges of each form: for every pixel the nearest edge (a jump of colour or depth) is found
// with a ray search in 12 directions plus a bisection, the rows are the lines of equal distance to that edge, and the tiles are cut across the row along the edge direction.
// Each tile takes the picture colour at its centre, has a random facet (brightness and a bevel lit from the upper left) and a dark grout joint.
// Stone is matt with a speckle, glass is more saturated with a small glint, and about 1 tile in 6 is gold. A gold tile has its own facet normal: it flashes when the camera
// direction brings the facet to the mirror angle for a fixed light, so the flashes change when the camera moves.
window.ARTS = window.ARTS || {};
ARTS['mosaic'] = {
  id: 'mosaic', name: 'Mosaic', group: 'Craft materials', inputs: 'C D W',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float zz(vec2 uv){ return log(min(linDepth(uv), uFocus * 3.0) / uFocus); }
      vec3 gam(vec3 c){ return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2)); }
      // does the picture at s differ from the picture at the centre (c0, z0) by a colour or depth edge?
      bool differs(vec2 s, vec3 c0, float z0){
        if (abs(zz(s) - z0) > 0.1) return true;
        return length(gam(texture2D(tColor, s).rgb) - c0) > 0.4;
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        vec2 f = fc / sc;
        vec3 c0 = gam(texture2D(tColor, uv).rgb); float z0 = zz(uv);
        // nearest edge: rings at 3, 3.9, 6.6, 11, 17 px (farther pixels get plain rows), 12 directions, the first ring with a hit wins
        float found = 0.0, hitR = 0.0, prevR = 0.0, lastR = 0.0, hk = 0.0; vec2 hdir = vec2(0.0, -1.0);
        for (int ri = 0; ri < 5; ri++) {
          if (found > 0.5) break;
          float r = 3.0 + float(ri * ri) * 0.9;
          for (int k = 0; k < 12; k++) {
            float a = float(k) * 0.5236 + 0.26;
            vec2 dir = vec2(cos(a), sin(a));
            if (found < 0.5 && differs(uv + dir * r * sc * px, c0, z0)) { found = 1.0; hitR = r; hdir = dir; hk = float(k); }
          }
          if (found < 0.5) prevR = r;
        }
        float d = 60.0;
        if (found > 0.5) {
          // snap the row direction to 8 directions, so that neighbours share one grid
          float sa = floor(atan(hdir.y, hdir.x) / 0.7854 + 0.5) * 0.7854;
          hk = mod(floor(atan(hdir.y, hdir.x) / 0.7854 + 0.5), 8.0);
          vec2 hd0 = hdir; hdir = vec2(cos(sa), sin(sa));
          float lo = prevR, hi = hitR;
          for (int b = 0; b < 4; b++) { float m = 0.5 * (lo + hi); if (differs(uv + hd0 * m * sc * px, c0, z0)) hi = m; else lo = m; }
          d = hi * max(dot(hd0, hdir), 0.8);
        } else { hdir = vec2(0.0, -1.0); d = 60.0 + f.y; hk = 5.0; }   // far from any edge: plain rows
        vec2 e = hdir, t = vec2(-e.y, e.x);
        const float T = 9.0, TL = 10.2;
        float rowF = d / T, rowI = floor(rowF), rr = fract(rowF);
        float vv = dot(f, t);
        float off = h21(vec2(rowI, hk + 3.0)) * TL;
        float colF = (vv + off) / TL, colI = floor(colF), cc = fract(colF);
        vec2 id = vec2(rowI * 7.0 + hk * 31.0, colI);
        // tile centre on the screen (same side of the edge as this pixel); its colour is the tile colour
        vec2 pc = f + e * (d - (rowI + 0.5) * T) + t * ((colI + 0.5) * TL - off - vv);
        vec2 cuv = pc * sc * px;
        vec3 tc = gam(texture2D(tColor, cuv).rgb);
        if (abs(zz(cuv) - z0) > 0.09) tc = c0;
        float hm = h21(id + 2.0);
        // tile shape: a rounded rectangle with a grout joint
        float hx = T * 0.5 - 0.75 - 0.5 * h21(id + 4.0), hy = TL * 0.5 - 0.75 - 0.7 * h21(id + 5.0);
        vec2 q0 = vec2((cc - 0.5) * TL, (rr - 0.5) * T);
        vec2 qq = abs(q0) - vec2(hy, hx) + 1.5;
        float sd = length(max(qq, 0.0)) + min(max(qq.x, qq.y), 0.0) - 1.5;
        float cover = 1.0 - smoothstep(-0.4, 0.5, sd);
        // facet of the tile: brightness, and a bevel lit from the upper left
        vec2 n2 = normalize(q0 / vec2(hy, hx) + 1e-3);
        vec2 nS = n2.x * t + n2.y * (-e);
        float bev = dot(nS, normalize(vec2(-0.6, 0.8))) * smoothstep(-2.6, -0.2, sd);
        float L = lum(tc);
        vec3 col;
        if (hm < 0.16) {
          // gold tile: gold leaf under glass. A facet normal fixed to the tile; the camera direction moves the mirror angle.
          vec3 nf = normalize(vec3(h21(id + 6.0) - 0.5, h21(id + 7.0) - 0.35, h21(id + 8.0) * 0.8 + 0.2));
          vec3 fwd = -vec3(uViewInv[2][0], uViewInv[2][1], uViewInv[2][2]);
          vec3 H = normalize(normalize(vec3(-0.4, 0.7, 0.6)) - fwd);
          float fl = pow(max(dot(nf, H), 0.0), 12.0);
          vec3 gold = vec3(0.92, 0.7, 0.26) * (0.5 + 0.55 * L + 0.2 * bev);
          col = gold + vec3(1.0, 0.92, 0.6) * fl * 3.5;
        } else if (hm < 0.38) {
          // glass tile: saturated, smooth, with a small glint in the corner
          vec3 g = max(mix(vec3(L), tc, 1.45), 0.0);
          col = g * (0.82 + 0.3 * (h21(id + 9.0) - 0.5) + 0.4 * bev);
          vec2 gp = (q0 - vec2(-hy * 0.45, hx * 0.4));
          col += vec3(1.0, 0.98, 0.92) * (1.0 - smoothstep(0.4, 1.8, length(gp))) * 0.55;
        } else {
          // stone tile: matt, a little muted, speckled
          vec3 g = mix(vec3(L), tc, 1.05);
          float sp = vn(f * 1.15 + id * 3.1);
          col = g * (0.84 + 0.3 * (h21(id + 9.0) - 0.5) + 0.3 * bev) * (0.88 + 0.24 * sp);
        }
        vec3 grout = vec3(0.075, 0.066, 0.058) + 0.07 * c0;
        col = mix(grout, col, cover);
        return vec4(pow(clamp(col, 0.0, 1.5), vec3(2.2)) * 1.1, 1.0);
      }`,
  },
};
