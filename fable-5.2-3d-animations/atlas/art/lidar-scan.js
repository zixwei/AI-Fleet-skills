// Art style 41: Lidar scan. Inputs D W (depth, world position).
// The scene is points only. A fixed scanner sits at a world point in front of and above the scene and sends out rays on a regular grid of angles, so each point
// stays on its surface when the camera moves. The colour of a point is its distance from the scanner (near warm, far cold). Scan rings move out
// from the scanner: a point flashes white when a ring reaches it and fades behind the ring. No colour or lighting from the scene is used.
window.ARTS = window.ARTS || {};
ARTS['lidar-scan'] = {
  id: 'lidar-scan', name: 'Lidar scan', group: 'An instrument sees the scene', inputs: 'D W',
  labels: 'halo',
  post: {
    uniforms: { uStep: { value: 0.0075 } },   // angle between two rays, radians (about 15 pixels at the focus distance)
    fragment: `
      uniform float uStep;
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      vec3 ramp(float t){   // distance colour: orange, yellow, green, cyan, blue, violet
        t = clamp(t, 0.0, 1.0) * 5.0;
        vec3 c0 = vec3(1.0, 0.35, 0.12), c1 = vec3(1.0, 0.85, 0.2), c2 = vec3(0.25, 1.0, 0.4), c3 = vec3(0.1, 0.9, 1.0), c4 = vec3(0.2, 0.4, 1.0), c5 = vec3(0.65, 0.3, 1.0);
        return t < 1.0 ? mix(c0, c1, t) : t < 2.0 ? mix(c1, c2, t - 1.0) : t < 3.0 ? mix(c2, c3, t - 2.0) : t < 4.0 ? mix(c3, c4, t - 3.0) : mix(c4, c5, t - 4.0);
      }
      // cell coordinates of the surface point under uv, for the cell (row, cell) of the centre pixel
      vec2 qAt(vec2 uv, vec3 S, float row, float cell, float uStep){
        vec3 d = normalize(worldPos(uv) - S);
        float el = asin(clamp(d.y, -1.0, 1.0)), az = atan(d.z, d.x), elR = row * uStep, azStep = uStep / max(cos(elR), 0.05);
        return vec2((az - cell * azStep) / azStep, (el - elR) / uStep);
      }
      vec4 postFX(vec2 uv){
        vec2 fc = uv * uRes;
        vec3 col = vec3(0.004, 0.006, 0.012) * (0.6 + 0.8 * h21(fc));
        bool sky = texture2D(tDepth, uv).x > 0.9999;
        vec3 P = worldPos(uv), S = vec3(0.0, 0.45 * uFocus, 0.85 * uFocus);
        vec3 v = P - S; float dist = length(v);
        vec3 d = v / dist;
        // ray grid: rows of equal elevation, and in each row an azimuth step that keeps the spacing equal
        float el = asin(clamp(d.y, -1.0, 1.0)), az = atan(d.z, d.x);
        float row = floor(el / uStep + 0.5);
        float elR = row * uStep, ce = max(cos(elR), 0.05);
        float azStep = uStep / ce;
        float cell = floor(az / azStep + 0.5);
        // position inside the cell, in cell units (q = 0 on the ray). The screen derivatives of q give the size of the cell in pixels,
        // so each point is a round dot of the same size on the screen, also on a surface that the rays meet at a shallow angle.
        vec2 q = vec2((az - cell * azStep) / azStep, (el - elR) / uStep);
        // the screen derivatives of q by finite differences on the world position (dFdx works on 2 x 2 blocks and makes blocky points)
        vec2 pxs = 1.0 / uRes;
        vec2 gx = qAt(uv + vec2(pxs.x, 0.0), S, row, cell, uStep) - qAt(uv - vec2(pxs.x, 0.0), S, row, cell, uStep); gx *= 0.5;
        vec2 gy = qAt(uv + vec2(0.0, pxs.y), S, row, cell, uStep) - qAt(uv - vec2(0.0, pxs.y), S, row, cell, uStep); gy *= 0.5;
        float det = gx.x * gy.y - gx.y * gy.x;
        vec2 pp = vec2(0.0);                                  // offset from the ray in pixels
        if (abs(det) > 1e-7) pp = vec2(gy.y * q.x - gy.x * q.y, -gx.y * q.x + gx.x * q.y) / det;
        bool wrap = max(max(abs(gx.x), abs(gx.y)), max(abs(gy.x), abs(gy.y))) > 0.4;   // a pixel pair across a cell border
        float rr = dot(pp, pp);
        float R = dist / uFocus;
        // scan rings: two rings that start at the scanner and move out. A point flashes white and swells when a ring reaches it, then fades behind the ring.
        float Rmax = 2.2 * uFocus, ph = uTime * 0.45;
        float ringGlow = 0.0, flash = 0.0;
        for (int i = 0; i < 2; i++) {
          float rad = fract(ph + float(i) * 0.5) * Rmax;
          float behind = rad - dist;                         // positive when the ring has passed this point
          float tail = behind > 0.0 ? exp(-behind / (0.25 * uFocus)) : 0.0;
          ringGlow = max(ringGlow, tail);
          flash = max(flash, exp(-pow(behind / (0.05 * uFocus), 2.0)));
        }
        float sz = 1.0 + 1.3 * flash;
        float pt = wrap ? 0.0 : exp(-rr / (2.0 * sz * sz)) * (0.8 + 0.6 * flash);   // a round point about 2.5 pixels wide, larger in the ring
        // no points on a depth step: the cell coordinates are not valid there
        float zc = linDepth(uv);
        float jump = max(max(abs(linDepth(uv + vec2(pxs.x, 0.0)) - zc), abs(linDepth(uv - vec2(pxs.x, 0.0)) - zc)), max(abs(linDepth(uv + vec2(0.0, pxs.y)) - zc), abs(linDepth(uv - vec2(0.0, pxs.y)) - zc))) / zc;
        pt *= 1.0 - smoothstep(0.01, 0.03, jump);
        float cellPx2 = 1.0 / max(abs(det), 1e-7);              // pixels in one cell
        float resolved = smoothstep(25.0, 90.0, cellPx2);
        pt = mix(0.4, pt, resolved);                            // finer than the points can show: an even glow
        float hs = h21(vec2(row * 1.7, cell + 3.1));
        vec3 base = ramp((R - 0.45) / 1.0);
        float I = pt * (0.75 + 0.25 * hs + 1.2 * ringGlow);
        vec3 c = base * I + vec3(1.0) * pt * flash * 1.4;
        if (!sky) col += c * 1.5;
        return vec4(col, 1.0);
      }`,
  },
};
