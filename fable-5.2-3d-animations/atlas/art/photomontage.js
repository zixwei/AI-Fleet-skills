// Art style 65: Photomontage. Inputs C D (colour, depth).
// Each depth layer is cut from a different source. The layers are set from the depth divided by uFocus (the distance to the look target), so they hold when the camera moves:
// near (below 0.96) = a halftone photo (black dots at 45 degrees on warm paper), middle (0.96 to 1.12) = flat coloured paper (the scene colour in 4 levels),
// far (above 1.12, and the sky) = newsprint (aged paper with rows of small type, denser in the dark parts). The edges of a layer are cut with scissors (straight segments with corners),
// with a thin white paper border on the nearer layer and a small shadow on the layer below.
window.ARTS = window.ARTS || {};
ARTS['photomontage'] = {
  id: 'photomontage', name: 'Photomontage', group: 'Print and paper', inputs: 'C D',
  labels: 'halo',
  post: {
    uniforms: { uNearCut: { value: 0.96 }, uFarCut: { value: 1.12 } },     // depth / uFocus where the layers change
    fragment: `
      uniform float uNearCut, uFarCut;
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float tri(float x){ return abs(fract(x) - 0.5) * 2.0; }
      // layer index at u: 0 near, 1 middle, 2 far (the sky is far)
      float layerAt(vec2 u){
        if (texture2D(tDepth, u).x > 0.9999) return 2.0;
        float r = linDepth(u) / uFocus;
        return r < uNearCut ? 0.0 : r < uFarCut ? 1.0 : 2.0;
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        // scissor cuts: the lookup moves in straight runs with corners (triangle waves), about 4 px
        vec2 zig = vec2(tri(fc.y / (23.0 * sc) + 0.17 * floor(fc.x / (90.0 * sc))), tri(fc.x / (29.0 * sc) + 0.23 * floor(fc.y / (80.0 * sc)))) * 4.5 * sc - 2.2 * sc;
        vec2 u = uv + zig * px;
        float L = layerAt(u);
        // border and shadow
        float edge = 0.0, sh = 0.0;
        for (int i = 0; i < 8; i++) {
          float an = float(i) * 0.7854; vec2 d = vec2(cos(an), sin(an));
          if (layerAt(u + d * 2.6 * sc * px) > L + 0.5) edge = 1.0;
        }
        for (int k = 1; k <= 2; k++) if (layerAt(u + vec2(-3.2, 3.2) * float(k) * sc * px) < L - 0.5) sh += 0.5 * (k == 1 ? 1.0 : 0.6);
        vec3 sc3 = texture2D(tColor, uv).rgb;
        vec3 col;
        if (L < 0.5) {
          // halftone photo: black dots at 45 degrees; the dot size follows the tone read at the dot centre
          float cs = 5.5 * sc;
          vec2 r = vec2(0.7071 * (fc.x + fc.y), 0.7071 * (fc.y - fc.x)) / cs;
          vec2 cell = floor(r) + 0.5, rc = cell * cs;
          vec2 cc = vec2(0.7071 * (rc.x - rc.y), 0.7071 * (rc.x + rc.y));       // the dot centre in screen px
          float tone = pow(clamp(lum(texture2D(tColor, cc / uRes).rgb) * 1.1, 0.0, 1.0), 0.4545);
          float rad = sqrt(clamp(1.0 - tone, 0.0, 1.0)) * 0.72, dd = length(fract(r) - 0.5);
          float ink = 1.0 - smoothstep(rad - 0.07, rad + 0.07, dd);
          vec3 paper = vec3(0.95, 0.93, 0.87), inkC = vec3(0.07, 0.065, 0.075);
          col = mix(paper * 2.0, inkC, ink);
        } else if (L < 1.5) {
          // flat coloured paper: the scene colour in 4 levels, matte, with a paper grain
          vec3 c = mix(vec3(lum(sc3)), sc3, 1.45);
          vec3 g = floor(pow(clamp(c * 1.1, 0.0, 1.0), vec3(0.4545)) * 4.0 + 0.5) / 4.0;
          float grain = 0.5 * vn(fc / sc * 0.8) + 0.5 * vn(vec2(fc.x * 0.05 + fc.y * 0.2, fc.y * 0.04) / sc);
          col = pow(g, vec3(2.2)) * (0.9 + 0.2 * grain);
          col *= mix(1.0, 1.9, smoothstep(0.45, 0.9, lum(col)));
        } else {
          // newsprint: aged paper, rows of small type that get denser where the picture is dark
          float tone = texture2D(tDepth, uv).x > 0.9999 ? 0.9 : pow(clamp(lum(sc3) * 1.1, 0.0, 1.0), 0.4545);
          float rowH = 7.5 * sc, chW = 3.6 * sc;
          vec2 cell = vec2(floor(fc.x / chW), floor(fc.y / rowH));
          vec2 f = vec2(fract(fc.x / chW), fract(fc.y / rowH));
          float dens = mix(0.82, 0.22, tone), rowOn = step(0.1, h21(vec2(cell.y, 1.3)));
          float word = step(0.14, h21(vec2(floor(cell.x / 5.0), cell.y + 9.0)));
          float glyph = step(h21(cell + 7.0), dens) * word * rowOn * step(0.18, f.y) * step(f.y, 0.78) * step(0.15, f.x) * step(f.x, 0.8);
          float yellow = 0.9 + 0.1 * vn(fc / sc * 0.04 + 2.0);
          vec3 paper = vec3(0.80, 0.76, 0.63) * yellow * (0.94 + 0.08 * vn(fc / sc * 0.9));
          col = mix(paper * 1.9, vec3(0.10, 0.09, 0.09), 0.78 * glyph) * (0.8 + 0.2 * tone);
        }
        // cut edge (white paper) and the shadow of the layer above
        col = mix(col, vec3(0.97, 0.95, 0.9) * 1.8, edge * 0.92);
        col *= 1.0 - 0.34 * clamp(sh, 0.0, 1.0) * (1.0 - edge);
        return vec4(col, 1.0);
      }`,
  },
};
