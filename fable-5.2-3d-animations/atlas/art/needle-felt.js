// Art style 71: Needle felt (version of the first-set style "needle-felt"). Inputs C D N (colour, depth, normals).
// Every area is wool felt: the colour is softened, short fibres stand out of each silhouette and break its edge (a fibre takes the colour of the nearer
// surface it grows from), a soft speckle of lighter and darker fibres covers every surface, highlights are squashed (matt), and a faint sheen
// lightens the rims that turn away from the camera. A felt pad shades the ground next to a raised piece.
// The fibres are short strokes at random angles in a 3 level cell grid, so there is no regular pattern (a rug has rows; felt has none).
window.ARTS = window.ARTS || {};
ARTS['needle-felt'] = {
  id: 'needle-felt', name: 'Needle felt', group: 'Craft materials', inputs: 'C D N',
  labels: 'halo',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      vec2 h22(vec2 p){ return vec2(h21(p), h21(p + vec2(31.7, 17.3))); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 4.0); }
      // one fibre layer: cell size cs (px at 720p), fibre length ln. Returns coverage (x), tone (y); the root colour and depth go to rc, rz.
      vec2 fibre(vec2 f, float cs, float ln, float seed, out vec2 rootUv, out vec2 rootUv2){
        vec2 cell = floor(f / cs);
        vec2 hh = h22(cell + seed);
        float a = hh.x * 6.2832;
        vec2 dir = vec2(cos(a), sin(a));
        vec2 ctr = (cell + 0.5 + (h22(cell + seed + 7.0) - 0.5) * 0.4) * cs;
        float L = ln * (0.6 + 0.4 * hh.y);
        vec2 r = f - ctr;
        float u = dot(r, dir), v = dot(r, vec2(-dir.y, dir.x));
        float t = clamp(u / L + 0.5, 0.0, 1.0);              // 0 at the root end, 1 at the tip
        float w = mix(0.62, 0.22, t) * cs / 5.0;             // the fibre tapers
        float cov = (1.0 - smoothstep(w * 0.6, w * 1.3, abs(v))) * step(abs(u), L * 0.5);
        rootUv = (ctr - dir * L * 0.5);
        rootUv2 = (ctr + dir * L * 0.5);
        return vec2(cov, h21(cell + seed + 3.0));
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes; float sc = uRes.y / 720.0;
        vec2 fc = uv * uRes, f = fc / sc;
        float d0 = dd(uv);
        // soft base: a depth-aware blur of about 2 px (felt is a soft surface)
        vec3 acc = texture2D(tColor, uv).rgb; float ws = 1.0;
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.7854; vec2 s = uv + vec2(cos(a), sin(a)) * 2.3 * sc * px;
          float w = exp(-abs(dd(s) - d0) / (d0 * 0.03));
          acc += texture2D(tColor, s).rgb * w; ws += w;
        }
        vec3 c = acc / ws;
        vec3 n0 = texture2D(tNormal, uv).rgb * 2.0 - 1.0;
        // fibres: layer A is fine and covers the surface, layers B and C are longer and reach out of the silhouettes
        vec2 r1, r2;
        float tone = 1.0; vec3 outc = c;
        for (int k = 0; k < 3; k++) {
          float cs = k == 0 ? 4.0 : k == 1 ? 7.0 : 11.0, ln = k == 0 ? 6.0 : k == 1 ? 10.0 : 15.0;
          vec2 cv = fibre(f, cs, ln, 13.0 * float(k + 1), r1, r2);
          vec2 ru1 = r1 * sc * px, ru2 = r2 * sc * px;
          // the root is the end that lies on the nearer surface
          float z1 = dd(ru1), z2 = dd(ru2);
          vec2 ru = z1 < z2 ? ru1 : ru2; float zr = min(z1, z2);
          float tn = 0.78 + 0.5 * cv.y;
          if (cv.x > 0.0) {
            if (zr < d0 * 0.97) {
              // a fibre that grows from a nearer surface and lies over a farther one: it shows the colour of its root
              vec3 rc = texture2D(tColor, ru).rgb;
              outc = mix(outc, rc * (0.88 + 0.3 * cv.y), cv.x * 0.95);
            } else if (abs(zr - d0) < d0 * 0.03) {
              tone *= mix(1.0, tn, cv.x * (k == 0 ? 0.85 : 0.5));
            }
          }
        }
        c = outc * tone;
        // felt pad: the ground next to a raised piece sinks a little into shade
        float occ = 0.0;
        for (int i = 0; i < 6; i++) {
          float a = float(i) * 1.0472 + 0.5; vec2 s = uv + vec2(cos(a), sin(a)) * 7.0 * sc * px;
          occ += clamp((d0 - dd(s)) / d0 * 10.0, 0.0, 1.0);
        }
        c *= 1.0 - 0.2 * occ / 6.0;
        // matt: squash highlights, keep the colours a little muted
        float L = lum(c);
        c = mix(vec3(L), c, 0.94);
        c = c / (1.0 + 0.32 * max(c - 0.45, 0.0));
        // wool sheen on the rims
        float rim = pow(clamp(1.0 - n0.z, 0.0, 1.0), 2.2);
        c += vec3(0.9, 0.85, 0.75) * rim * 0.1 * (0.4 + L);
        // fine felt speckle over everything
        c *= 0.94 + 0.12 * vn(f * 0.9);
        return vec4(c * 1.02, 1.0);
      }`,
  },
};
