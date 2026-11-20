// Art style 86: Blue-and-white porcelain. Inputs C D (colour, depth).
// The scene tone becomes cobalt brush work under a glossy white glaze. 3 brush layers lie at different angles. Each layer is cut into
// 14 px strokes, and a stroke covers the pixel where the scene is darker than its own threshold, so dark parts carry all 3 layers and the
// blue is darker where strokes overlap (the cobalt densities add). The blue pools a little at a stroke edge and along contour lines
// (depth and colour edges), and a few dark iron specks sit in the densest blue. The glaze is white with pinholes, soft under the
// colour (the pigment is blurred a little by the glaze), and a window reflection and a depth-derived glint lie on top of it.
window.ARTS = window.ARTS || {};
ARTS['blue-and-white-porcelain'] = {
  id: 'blue-and-white-porcelain', name: 'Blue-and-white porcelain', group: 'World traditions', inputs: 'C D',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 4.0); }
      // darkness of the scene at a point, 0 (light) to 1 (dark); colour makes it a little darker
      float darkAt(vec2 uv){
        vec3 g = pow(clamp(texture2D(tColor, uv).rgb, 0.0, 1.0), vec3(1.0 / 2.2));
        float L = lum(g), sat = (max(max(g.r, g.g), g.b) - min(min(g.r, g.g), g.b));
        return clamp((0.84 - L) * 2.2 + 0.3 * sat, 0.0, 1.0);
      }
      // one brush layer: strokes at angle a, 14 px wide, each with its own threshold jitter and ragged ends
      float layer(vec2 p, float a, float thr, float k, float D){
        vec2 dir = vec2(cos(a), sin(a));
        float perp = dot(p, vec2(-dir.y, dir.x)) / 14.0, along = dot(p, dir);
        float band = floor(perp), bf = fract(perp);
        float rag = (fbm(vec2(along / 130.0, band * 1.7 + k * 5.0)) - 0.5) * 0.4 + (h21(vec2(band, k + 1.0)) - 0.5) * 0.14;
        float gap = 1.0 - 0.3 * smoothstep(0.38, 0.5, abs(bf - 0.5));      // a thin lighter seam between two strokes
        return smoothstep(thr + rag - 0.05, thr + rag + 0.05, D) * gap;
      }
      float edgeOf(vec2 uv, float sc, float d0){
        vec3 c0 = texture2D(tColor, uv).rgb; float e = 0.0, g = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * 1.5 * sc / uRes;
          e = max(e, abs(dd(uv + o) - d0) / d0); g = max(g, length(texture2D(tColor, uv + o).rgb - c0));
        }
        return max(smoothstep(0.02, 0.05, e), smoothstep(0.12, 0.3, g) * 0.8);
      }
      float rbox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
      vec3 lin(vec3 g){ return pow(clamp(g, 0.0, 1.0), vec3(2.2)) * mix(0.62, 2.4, smoothstep(0.6, 0.95, lum(g))); }
      vec4 postFX(vec2 uv){
        vec2 res = uRes, fc = uv * res; float sc = res.y / 720.0;
        // the glaze blurs the colour under it a little
        float D = darkAt(uv) * 0.4;
        for (int i = 0; i < 8; i++) { float a = float(i) * 0.7854; D += darkAt(uv + vec2(cos(a), sin(a)) * 2.2 * sc / res) * 0.075; }
        D = clamp(D, 0.0, 1.0);
        vec2 p = fc / sc;
        float dens = 0.0, pool = 0.0;
        float ths[3] = float[3](0.16, 0.4, 0.66), angs[3] = float[3](0.55, 2.0, -0.85);
        for (int k = 0; k < 3; k++) {
          float cv = layer(p, angs[k], ths[k], float(k), D);
          dens += 0.34 * cv;
          // pigment pools at the edge of a stroke
          float cv2 = layer(p + vec2(1.5, 1.0), angs[k], ths[k], float(k), D);
          pool += 0.18 * abs(cv - cv2) * 4.0;
        }
        float d0 = dd(uv);
        float line = edgeOf(uv, sc, d0);
        float sky = step(0.9999, texture2D(tDepth, uv).x);
        dens += (pool + 0.8 * line * (1.0 - 0.7 * sky)) ;
        // cobalt: light blue where thin, deep blue where thick, near black-blue where the strokes pile up
        vec3 cobLight = vec3(0.42, 0.56, 0.9), cob = vec3(0.07, 0.17, 0.62), cobDeep = vec3(0.02, 0.05, 0.3);
        vec3 blue = mix(cobLight, cob, smoothstep(0.2, 0.85, dens));
        blue = mix(blue, cobDeep, smoothstep(0.9, 1.7, dens));
        float cover = 1.0 - exp(-2.6 * dens);
        // iron specks in the thick blue
        float speck = step(0.985, h21(floor(fc / (1.6 * sc)))) * smoothstep(0.8, 1.3, dens);
        blue = mix(blue, vec3(0.02, 0.03, 0.12), speck * 0.8);
        // the glaze: white with a faint blue-grey, pinholes, a slow vase-like shade
        float vase = pow(abs(2.0 * uv.x - 1.0), 2.0);
        vec3 glaze = vec3(0.86, 0.9, 0.95) * (1.0 - 0.14 * vase) * (0.97 + 0.05 * fbm(fc * 0.8 / sc));
        float pin = step(0.9985, h21(floor(fc / (1.5 * sc)) + 4.0));
        glaze *= 1.0 - 0.3 * pin;
        vec3 col = mix(glaze, blue * (0.95 + 0.05 * vn(fc * 0.4 / sc)), cover);
        // glaze highlights: a window reflection (a rounded box with a mullion) and a depth-derived glint
        vec2 hp = (uv - vec2(0.2, 0.55)) * vec2(res.x / res.y, 1.0);
        float win = smoothstep(0.012, -0.012, rbox(hp, vec2(0.05, 0.2), 0.03)) * (1.0 - 0.7 * smoothstep(0.006, 0.0, abs(hp.y - 0.02)));
        float strip = smoothstep(0.006, -0.006, rbox(hp - vec2(0.09, 0.0), vec2(0.008, 0.17), 0.006));
        vec2 pxs = 1.5 * sc / res;
        float gx = (dd(uv + vec2(pxs.x, 0.0)) - dd(uv - vec2(pxs.x, 0.0))) / d0, gy = (dd(uv + vec2(0.0, pxs.y)) - dd(uv - vec2(0.0, pxs.y))) / d0;
        vec3 nr = normalize(vec3(-gx * 3.0, -gy * 3.0, 1.0));
        float glint = pow(max(dot(nr, normalize(vec3(-0.35, 0.5, 0.8))), 0.0), 90.0);
        float hl = clamp(max(win * 0.9, strip * 0.7) + glint * 0.8, 0.0, 1.0);
        col = mix(col, vec3(1.0), hl * mix(0.9, 0.7, cover));
        return vec4(lin(col), 1.0);
      }`,
  },
};
