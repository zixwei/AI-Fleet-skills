// Art style 42: Sonar fan. Inputs D N (depth, normals).
// A sector-shaped screen: bearing runs across the sector (the screen column of the scene), range runs out from the apex (the depth).
// Each pixel of the sector adds up the echoes of the scene column that lie at its range. A surface that faces the source (the camera) sends
// back more than one that turns away. Echoes are grey speckle; range arcs and bearing lines are drawn on the dark screen.
// Labels are drawn after this shader, so they stay flat over the sector.
window.ARTS = window.ARTS || {};
ARTS['sonar-fan'] = {
  id: 'sonar-fan', name: 'Sonar fan', group: 'An instrument sees the scene', inputs: 'D N',
  labels: 'halo',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      vec4 postFX(vec2 uv){
        vec2 fc = uv * uRes;
        vec2 apex = vec2(0.5 * uRes.x, 0.05 * uRes.y);        // pixels, y up
        float Rpx = 0.9 * uRes.y, hAng = 0.8727;                // sector radius and hAng angle (50 degrees)
        vec2 d = fc - apex;
        float rad = length(d), ang = atan(d.x, d.y);
        float r = rad / Rpx;
        vec3 glass = vec3(0.012, 0.02, 0.026) * (0.8 + 0.4 * h21(fc * 0.5));
        float inside = step(abs(ang), hAng) * step(r, 1.0);
        float aa = 1.5 / Rpx;
        // sector frame and bearing lines, range arcs (every 0.2 of the range)
        float px1 = 1.0 / Rpx;
        float arcs = 0.0;
        for (int i = 1; i <= 5; i++) arcs = max(arcs, 1.0 - smoothstep(0.0, 1.6 * px1, abs(r - float(i) * 0.2)));
        float bear = 0.0;
        for (int i = -3; i <= 3; i++) bear = max(bear, 1.0 - smoothstep(0.0, 1.6 * px1, abs(sin(ang - float(i) * 0.2909)) * r));
        float rim = max(1.0 - smoothstep(0.0, 2.2 * px1, abs(abs(ang) - hAng) * r), 1.0 - smoothstep(0.0, 2.2 * px1, abs(r - 1.0)));
        vec3 col = glass;
        if (inside > 0.5 || (abs(ang) < hAng + 0.02 && r < 1.01)) {
          col += vec3(0.02, 0.035, 0.04) * 1.0;                  // the screen of the sector is a little lighter
          col += vec3(0.16, 0.22, 0.24) * arcs * 0.5 * inside + vec3(0.12, 0.17, 0.19) * bear * 0.45 * inside;
          col += vec3(0.5, 0.62, 0.66) * rim * 0.7;
        }
        if (inside > 0.5) {
          // the scene column for this bearing; the range sets which depth the echo must have
          float u = 0.5 + 0.5 * ang / hAng;
          float zmin = 0.45 * uFocus, zmax = 1.75 * uFocus, zr = mix(zmin, zmax, r);
          float tol = (zmax - zmin) * 3.0 / Rpx;                 // about 3 pixels of range
          float echo = 0.0;
          float jit = h21(floor(fc) + 17.0);
          for (int i = 0; i < 128; i++) {
            float y = (float(i) + jit) / 128.0;
            vec2 q = vec2(u, y);
            float z = linDepth(q);
            float w = exp(-pow((z - zr) / tol, 2.0));
            if (w > 0.02 && texture2D(tDepth, q).x < 0.9999) {
              vec3 n = texture2D(tNormal, q).rgb * 2.0 - 1.0;
              float face = clamp(n.z, 0.0, 1.0);                // view-space normal: z = 1 faces the camera
              echo += w * (0.12 + 0.88 * pow(face, 1.5));
            }
          }
          echo *= 1.0 / 6.0;
          // speckle: each frame of 12 per second has its own pattern; the echo is multiplied by an exponential random value
          float fr = floor(uTime * 12.0);
          float sp = -log(max(h21(floor(fc) * 0.37 + fr * 3.1 + 1.0), 0.02));
          float sp2 = -log(max(h21(floor(fc * 0.5) * 0.61 + fr * 1.7 + 5.0), 0.02));
          float e = echo * (0.35 * sp + 0.65 * sp2);
          float gray = 1.0 - exp(-e * 1.3);                        // saturates softly
          col += vec3(0.9, 0.93, 0.95) * gray * 1.0;
        }
        return vec4(col, 1.0);
      }`,
  },
};
