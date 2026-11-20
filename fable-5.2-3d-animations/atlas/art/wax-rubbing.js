// Art style 68: Wax rubbing. Inputs D N (depth, normals). The scene colour is not used.
// Cream paper laid over a relief and rubbed with one wax block (burgundy) in ONE direction (the strokes run at about 24 degrees up to the right on the screen).
// Only the raised parts take wax: (1) the edges where the surface normal turns or the depth steps toward the viewer, (2) surfaces that are nearer than their surroundings
// (the depth against its own neighbourhood at 2 radii, so a smooth slope such as a floor takes none). The wax breaks into long streaks along the rubbing direction and
// skips the low points of the paper grain.
window.ARTS = window.ARTS || {};
ARTS['wax-rubbing'] = {
  id: 'wax-rubbing', name: 'Wax rubbing', group: 'Print and paper', inputs: 'D N',
  labels: 'halo',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      vec3 nrm(vec2 uv){ return texture2D(tNormal, uv).rgb * 2.0 - 1.0; }
      float ringMean(vec2 uv, float rad, float sc){
        vec2 px = 1.0 / uRes; float s = 0.0;
        for (int i = 0; i < 12; i++) { float an = float(i) * 0.5236 + rad * 0.01; s += linDepth(uv + vec2(cos(an), sin(an)) * rad * sc * px); }
        return s / 12.0;
      }
      // fraction of a ring of taps (not sky) that lie farther than this point by 6 percent: this point stands above its surroundings, even in the middle of a flat face
      float ringFar(vec2 uv, float rad, float z, float sc){
        vec2 px = 1.0 / uRes; float s = 0.0;
        for (int i = 0; i < 12; i++) {
          float an = float(i) * 0.5236 + rad * 0.013; vec2 q = uv + vec2(cos(an), sin(an)) * rad * sc * px;
          s += (texture2D(tDepth, q).x < 0.9999 && linDepth(q) > z * 1.06) ? 1.0 : 0.0;
        }
        return s / 12.0;
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        float z = linDepth(uv), sky = texture2D(tDepth, uv).x > 0.9999 ? 1.0 : 0.0;
        vec3 n0 = nrm(uv);
        // raised: nearer than the neighbourhood (a ring mean in depth), at 2 radii
        float m1 = ringMean(uv, 11.0, sc), m2 = ringMean(uv, 48.0, sc), m3 = ringMean(uv, 70.0, sc);
        float rLocal = clamp((m1 - z) / z * 18.0, 0.0, 1.0), rLarge = clamp((m2 - z) / z * 12.0, 0.0, 1.0), rHuge = clamp((m3 - z) / z * 8.0, 0.0, 1.0);
        // high surfaces: the share of a wide ring (45, 95 and 140 px, sky taps ignored) that lies clearly farther, so the middle of a flat raised face still takes wax
        float nearF = clamp(ringFar(uv, 45.0, z, sc) * 1.5 + ringFar(uv, 95.0, z, sc) * 1.3 + ringFar(uv, 140.0, z, sc) * 1.1, 0.0, 1.0);
        nearF *= 1.0 - 0.85 * smoothstep(0.5, 0.85, n0.y);      // a ground plane that only lies in front of a far wall is not a raised face
        // edges that stand up: a normal crease, or a depth step where this side is the nearer
        float ne = 0.0, de = 0.0;
        for (int i = 0; i < 8; i++) {
          float an = float(i) * 0.7854; vec2 o = vec2(cos(an), sin(an)) * px * 1.5 * sc;
          ne = max(ne, 1.0 - dot(n0, nrm(uv + o)));
          de = max(de, (linDepth(uv + o) - z) / z);
        }
        float edge = max(smoothstep(0.25, 0.55, ne), smoothstep(0.02, 0.05, de));
        float cov = clamp(0.8 * edge + 0.55 * rLocal + 0.5 * rLarge + 0.15 * rHuge + 0.8 * nearF, 0.0, 1.0) * (1.0 - sky);
        // one rubbing direction: long streaks, and the grain of the paper
        vec2 dir = normalize(vec2(1.0, 0.45)), prp = vec2(-dir.y, dir.x);
        vec2 q = vec2(dot(fc, dir), dot(fc, prp)) / sc;
        float streak = 0.5 * vn(vec2(q.x * 0.02, q.y * 1.0)) + 0.3 * vn(vec2(q.x * 0.06 + 3.0, q.y * 0.4)) + 0.2 * vn(vec2(q.x * 0.2, q.y * 1.8));
        float grain = 0.6 * vn(fc / sc * 1.3) + 0.4 * vn(fc / sc * 0.55 + 4.0);
        float pressure = 0.85 + 0.3 * vn(q * 0.008 + 2.0);
        float density = cov * pressure * (0.15 + 1.25 * streak) - (1.0 - grain) * 0.3;
        float wax = smoothstep(0.15, 0.45, density);
        vec3 paper = vec3(0.955, 0.93, 0.86) * (0.95 + 0.07 * vn(vec2(fc.x * 0.03, fc.y * 0.6) / sc));
        vec3 waxC = vec3(0.20, 0.025, 0.06) * (0.85 + 0.3 * grain);
        vec3 col = mix(paper * 2.0, waxC, wax * 0.94);
        return vec4(col, 1.0);
      }`,
  },
};
