// Art style 91: Faceted multi-view. Inputs C D (colour, depth).
// The frame is cut into flat facets (a fixed jittered Voronoi pattern in screen space, about 130 px across at 1080p).
// Each facet has its own view offset. The scene is seen from that view point by moving each pixel by the offset times a parallax factor
// (2.4 * log2(uFocus / depth)) read from the depth image: the focus plane stays put, near things shift one way and far things the other.
// The shift is found with 3 fixed-point steps so a pixel follows the surface that it lands on. Sky counts as far.
window.ARTS = window.ARTS || {};
ARTS['faceted-multi-view'] = {
  id: 'faceted-multi-view', name: 'Faceted multi-view', group: 'The picture is bent', inputs: 'C D',
  post: {
    fragment: `
      vec2 h22(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(vec2(p.x * p.y, p.x + p.y * 1.7)); }
      float dz(vec2 q){ return texture2D(tDepth, q).x > 0.9999 ? uFocus * 4.0 : linDepth(q); }
      float par(vec2 q){ return clamp(2.4 * log2(uFocus / dz(q)), -1.2, 1.6); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes;
        float sc = uRes.y / 1080.0;
        vec2 g = uv * uRes / (130.0 * sc);
        vec2 id = floor(g), f = fract(g);
        // nearest and second nearest feature point of the jittered grid
        float d1 = 9.0, d2 = 9.0; vec2 cid = id;
        for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
          vec2 nid = id + vec2(float(i), float(j));
          vec2 p = vec2(float(i), float(j)) + 0.5 + (h22(nid) - 0.5) * 0.85;
          float d = length(p - f);
          if (d < d1) { d2 = d1; d1 = d; cid = nid; } else if (d < d2) d2 = d;
        }
        vec2 hh = h22(cid + 17.3), h3 = h22(cid + 5.1);
        // one view offset for each facet, in screen heights; it drifts a little with the real time
        float a = hh.x * 6.2832 + 0.5 * sin(uRealT * 0.6 + hh.y * 6.0);
        float r = (0.55 + 0.45 * hh.y) * (0.8 + 0.2 * sin(uRealT * 0.9 + h3.x * 6.2832));
        vec2 o = vec2(cos(a), sin(a)) * r * 0.07 * vec2(uRes.y / uRes.x, 1.0);
        vec2 q = uv;
        for (int i = 0; i < 3; i++) q = clamp(uv + o * par(q), px * 1.5, 1.0 - px * 1.5);
        vec3 c = texture2D(tColor, q).rgb;
        c *= 1.0 + (h3.y - 0.5) * 0.16;                     // each facet catches the light a little differently
        // a thin dark line on the facet edge and a light line just inside it
        float e = (d2 - d1) * 130.0 * sc;                    // distance to the edge in pixels
        c = mix(c, c * 0.25, 1.0 - smoothstep(0.6, 1.8, e));
        c *= 1.0 + 0.1 * (1.0 - smoothstep(1.8, 4.5, e));
        return vec4(c, 1.0);
      }`,
  },
};
