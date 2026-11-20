// Art style 67: Quilling. Inputs C D (colour, depth).
// Paper strips on edge. The outlines of the objects (depth steps and colour steps) are strips: a band about 4 px wide with a lighter top edge.
// The areas are filled with coils: a hexagonal grid of spirals (a strip rolled up), each coil in the colour of the scene at its centre; the dark gap between turns and between coils is the shadow.
// Each strip throws a short shadow down and to the right.
window.ARTS = window.ARTS || {};
ARTS['quilling'] = {
  id: 'quilling', name: 'Quilling', group: 'Print and paper', inputs: 'C D',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      // outline strip mask at a point: depth steps and colour steps within 2.4 px
      float stripAt(vec2 u, float sc){
        vec2 px = 1.0 / uRes; float z = linDepth(u); vec3 c = texture2D(tColor, u).rgb; float e = 0.0;
        for (int i = 0; i < 8; i++) {
          float an = float(i) * 0.7854; vec2 o = vec2(cos(an), sin(an)) * px * 2.2 * sc;
          e = max(e, max(smoothstep(0.025, 0.06, abs(linDepth(u + o) - z) / z), smoothstep(0.22, 0.42, length(texture2D(tColor, u + o).rgb - c))));
        }
        return e;
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        // hexagonal grid of coils: the nearest centre
        float R = 17.0 * sc; vec2 s = vec2(2.0 * R, 1.7320508 * R);
        vec2 a = mod(fc, s) - 0.5 * s, b = mod(fc - 0.5 * s, s) - 0.5 * s;
        vec2 gv = dot(a, a) < dot(b, b) ? a : b, ctr = fc - gv;
        float r = length(gv), th = atan(gv.y, gv.x);
        vec2 cuv = ctr / uRes;
        vec3 cc = 0.4 * texture2D(tColor, cuv).rgb + 0.15 * (texture2D(tColor, cuv + vec2(3.0, 0.0) * px * sc).rgb + texture2D(tColor, cuv - vec2(3.0, 0.0) * px * sc).rgb
                + texture2D(tColor, cuv + vec2(0.0, 3.0) * px * sc).rgb + texture2D(tColor, cuv - vec2(0.0, 3.0) * px * sc).rgb);
        cc = max(mix(vec3(lum(cc)), cc, 1.5), 0.0);
        // the spiral: s runs along the strip; the strip is 60 percent of the pitch, the rest is gap
        float pitch = 4.8 * sc, sp = fract(r / pitch - th / 6.2831853 + 3.0 * h21(ctr));
        float inStrip = smoothstep(0.0, 0.1, sp) * (1.0 - smoothstep(0.58, 0.68, sp));
        float coil = inStrip * (1.0 - smoothstep(R * 0.9, R * 0.98, r));
        float shade = 1.12 - 0.3 * clamp(sp / 0.62, 0.0, 1.0);                      // each turn is a little darker toward its inner edge
        shade *= 0.94 + 0.1 * h21(ctr + 2.0);                                       // the strips of different coils differ a little
        vec3 gap = cc * 0.16;
        vec3 col = mix(gap, cc * shade, coil);
        // the outline strip: a band along each edge in the colour of the surface, with a light top edge, and its shadow
        float e = stripAt(uv, sc);
        float eS = stripAt(uv + vec2(-2.4, 2.4) * sc * px, sc);
        float eT = stripAt(uv + vec2(0.0, -1.3) * sc * px, sc);                       // a strip below this pixel: this pixel is its top edge
        vec3 sc3 = texture2D(tColor, uv).rgb;
        vec3 stripC = max(mix(vec3(lum(sc3)), sc3, 1.5), 0.0) * 0.82;
        col *= 1.0 - 0.5 * eS * (1.0 - e);
        col = mix(col, stripC * (1.0 + 0.45 * (1.0 - eT)), e);
        float ph = 0.94 + 0.09 * vn(fc / sc * 0.9);
        col *= ph;
        return vec4(col * mix(1.0, 1.9, smoothstep(0.5, 0.9, lum(col))), 1.0);
      }`,
  },
};
