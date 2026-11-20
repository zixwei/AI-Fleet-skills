// Art style 39: Coloured shadows. Input D (depth only).
// A white wall and three lamps: red, green and blue, 120 degrees apart on the screen. Every surface is white and is lit by the
// three lamps (its normal comes from the depth). A screen-space ray from each pixel toward each lamp finds a nearer object,
// and then that lamp is blocked: the shadow of the red lamp is cyan, of the green lamp magenta, of the blue lamp yellow.
// Where all three are blocked the shadow is black; where two are blocked it takes the colour of the third lamp.
window.ARTS = window.ARTS || {};
ARTS['coloured-shadows'] = {
  id: 'coloured-shadows', name: 'Coloured shadows', group: 'Light makes the picture', inputs: 'D',
  post: {
    fragment: `
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes;
        float d0 = dd(uv);
        float wpx = d0 * 2.0 * uProjInv[1][1] / uRes.y;                // world size of one pixel at this depth (uProjInv[1][1] = tan(fov / 2))
        float dl = dd(uv - vec2(2.0 * px.x, 0.0)), dr = dd(uv + vec2(2.0 * px.x, 0.0)), du = dd(uv + vec2(0.0, 2.0 * px.y)), dn = dd(uv - vec2(0.0, 2.0 * px.y));
        float gx = 0.5 * (abs(dr - d0) < abs(d0 - dl) ? dr - d0 : d0 - dl);   // the smaller side, so an edge does not tilt both sides
        float gy = 0.5 * (abs(du - d0) < abs(d0 - dn) ? du - d0 : d0 - dn);
        vec3 n = normalize(vec3(gx / wpx, gy / wpx, 1.0));           // view space normal from the depth slope
        vec3 lit = vec3(0.0);
        for (int k = 0; k < 3; k++) {
          float a = 1.5708 + float(k) * 2.0944;                         // lamps at 90, 210 and 330 degrees
          vec2 dir = vec2(cos(a), sin(a));
          vec3 L = normalize(vec3(dir * 0.6, 0.8));
          float lam = mix(1.0, clamp(dot(n, L) / L.z, 0.0, 1.3), 0.4);
          // ray toward the lamp: blocked when the picture there is nearer than the local plane lifted by the ray
          float occ = 0.0;
          float g = gx * dir.x + gy * dir.y;
          for (int i = 1; i <= 16; i++) {
            float t = float(i) / 16.0, dist = (4.0 + 70.0 * t * t) * (d0 > uFocus * 2.5 ? 0.6 : 1.0);
            float dp = d0 + g * dist, rise = 0.55 * dist * wpx;
            float dz = dp - dd(uv + dir * dist * px) - rise - 0.008 * d0;
            occ = max(occ, smoothstep(0.0, 0.012 * d0 + 0.02, dz));
          }
          lit[k] = lam * (1.0 - occ);
        }
        vec3 col = lit * 0.96 + 0.015;
        return vec4(col * 2.0, 1.0);
      }`,
  },
};
