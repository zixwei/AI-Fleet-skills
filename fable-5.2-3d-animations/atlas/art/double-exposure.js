// Art style 96: Double exposure. Inputs D N (depth, normals).
// Every object (everything that has depth) is a window onto a second picture: a night sky with stars. The sky is fixed to the screen
// (it is the second exposure), so it stays still while the objects move across it. The empty background is pale paper.
// The sky is a vertical gradient with a milky-way band and a soft nebula, small stars (a 1.8 px core), large stars with spikes (3.5 px core)
// and a slow twinkle from the real time. The normal dims the sky on the sides of a form that face away from a key light, so the forms still read.
// A thin bright line runs along silhouettes (depth steps) and creases (normal steps).
window.ARTS = window.ARTS || {};
ARTS['double-exposure'] = {
  id: 'double-exposure', name: 'Double exposure', group: 'The picture is bent', inputs: 'D N',
  labels: 'halo',
  post: {
    normals: true,
    fragment: `
      vec2 h22(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(vec2(p.x * p.y, p.x + p.y * 1.7)); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h22(i).x, h22(i + vec2(1.0, 0.0)).x, f.x), mix(h22(i + vec2(0.0, 1.0)).x, h22(i + vec2(1.0, 1.0)).x, f.x), f.y); }
      float fbm(vec2 p){ return 0.5 * vn(p) + 0.25 * vn(p * 2.03 + 7.1) + 0.125 * vn(p * 4.1 + 3.7); }
      // stars on a jittered grid of cells of size cs pixels; core = radius in pixels of the full-bright disc
      vec3 stars(vec2 fc, float cs, float dens, float core, float spike, float seed){
        vec2 g = fc / cs, id = floor(g);
        vec2 h = h22(id + seed), h2 = h22(id * 1.7 + seed + 9.0);
        if (h.x > dens) return vec3(0.0);
        vec2 p = (fract(g) - (0.3 + 0.4 * h)) * cs;
        float r = length(p);
        float tw = 0.75 + 0.25 * sin(uRealT * (1.2 + 2.0 * h2.x) + h2.y * 40.0);
        float b = (0.55 + 0.45 * h2.x) * tw;
        float s = smoothstep(core + 1.0, core - 0.3, r) + 0.35 * exp(-r / (core * 1.4));
        if (spike > 0.0) s += spike * (smoothstep(core * 3.6, 0.0, abs(p.x)) * smoothstep(1.1, 0.0, abs(p.y)) + smoothstep(core * 3.6, 0.0, abs(p.y)) * smoothstep(1.1, 0.0, abs(p.x)));
        vec3 col = mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.9, 0.7), step(0.7, h2.y));
        return col * s * b * 2.2;
      }
      vec3 sky(vec2 uv, vec2 fc, float sc){
        // gradient: deep blue at the top, violet and teal toward the bottom
        vec3 c = mix(vec3(0.015, 0.03, 0.10), vec3(0.05, 0.04, 0.17), smoothstep(1.0, 0.0, uv.y));
        c = mix(c, vec3(0.03, 0.14, 0.22), smoothstep(0.35, 0.0, uv.y) * 0.8);
        // a milky-way band across the frame
        float dband = abs((uv.y - 0.5) * 1.0 - (uv.x - 0.5) * 0.45 - 0.05 * sin(uv.x * 6.0));
        float neb = fbm(uv * vec2(5.0, 3.5) + 2.0), neb2 = fbm(uv * vec2(9.0, 6.0) + 11.0);
        float band = smoothstep(0.30, 0.0, dband) * (0.35 + 0.9 * neb);
        c += vec3(0.30, 0.22, 0.55) * band * 0.55 + vec3(0.10, 0.35, 0.42) * smoothstep(0.55, 0.9, neb2) * 0.3;
        c += stars(fc, 26.0 * sc, 0.45, 1.8 * sc, 0.0, 1.0) + stars(fc, 26.0 * sc, 0.2, 1.1 * sc, 0.0, 5.0) * 0.8;
        c += stars(fc, 80.0 * sc, 0.5, 3.5 * sc, 1.0, 31.0);
        return c;
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float sc = uRes.y / 1080.0;
        float d0 = texture2D(tDepth, uv).x;
        // pale paper outside the objects
        vec3 paper = vec3(0.93, 0.915, 0.87) * 2.0 * (1.04 - 0.22 * dot((uv - 0.5), (uv - 0.5)) * 2.0);
        paper *= 0.975 + 0.05 * h22(floor(fc / 2.0)).x;
        if (d0 > 0.9999) return vec4(paper, 1.0);
        float far = smoothstep(1.15, 1.45, linDepth(uv) / uFocus);   // a back wall or far floor is backdrop: paper, not a window
        vec3 N = texture2D(tNormal, uv).rgb * 2.0 - 1.0;
        float lit = clamp(dot(N, normalize(vec3(-0.45, 0.65, 0.6))), 0.0, 1.0);
        vec3 col = sky(uv, fc, sc) * (0.5 + 0.75 * lit);
        // thin bright edge line
        float de = 0.0, ne = 0.0, dl = linDepth(uv);
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.7854;
          vec2 o = vec2(cos(a), sin(a)) * px * 1.6 * sc;
          float dq = texture2D(tDepth, uv + o).x > 0.9999 ? dl * 3.0 : linDepth(uv + o);
          de = max(de, abs(dq - dl) / dl);
          ne = max(ne, 1.0 - dot(N, texture2D(tNormal, uv + o).rgb * 2.0 - 1.0));
        }
        float line = max(smoothstep(0.015, 0.04, de), smoothstep(0.35, 0.65, ne) * 0.8);
        col = mix(col, vec3(0.7, 0.92, 1.0) * 2.6, line);
        return vec4(mix(col, paper, far), 1.0);
      }`,
  },
};
