// Art style 46: Weather radar. Inputs C D (colour, depth).
// The whole frame is cut into coarse polar cells (rings of 24 px, sectors of 2.5 degrees) round the centre of the screen. Each cell takes one
// echo value from the scene inside it (light and colour, weaker with range from the camera; sky returns nothing) and shows it as a step of the
// radar scale: dark green, green, light green, yellow, orange, red, dark red. A sweep line turns once in 4 seconds.
// Limit: the kit gives no earlier frame (that is input X), so a cell cannot keep an old picture. The cell always shows the scene of this frame;
// the sweep only sets how bright the cell is: full at the line, fading to a dim level as the line moves on.
window.ARTS = window.ARTS || {};
ARTS['weather-radar'] = {
  id: 'weather-radar', name: 'Weather radar', group: 'An instrument sees the scene', inputs: 'C D',
  post: {
    uniforms: { uRing: { value: 24.0 }, uSector: { value: 0.0436 } },   // cell depth in pixels; cell width in radians (2.5 degrees)
    fragment: `
      uniform float uRing, uSector;
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      vec3 scale(float e){       // the radar scale in steps; black below the lowest step
        if (e < 0.16) return vec3(0.0);
        if (e < 0.30) return vec3(0.02, 0.42, 0.12);
        if (e < 0.44) return vec3(0.03, 0.72, 0.10);
        if (e < 0.56) return vec3(0.40, 0.90, 0.08);
        if (e < 0.68) return vec3(1.0, 0.80, 0.0);
        if (e < 0.80) return vec3(1.0, 0.50, 0.02);
        if (e < 0.92) return vec3(0.95, 0.08, 0.04);
        return vec3(0.55, 0.0, 0.18);
      }
      vec4 postFX(vec2 uv){
        vec2 fc = uv * uRes, cen = 0.5 * uRes, d = fc - cen;
        float sc = uRes.y / 1080.0, ring = uRing * sc;
        float r = length(d), a = atan(d.x, d.y);                // a: 0 up, positive clockwise
        float ri = floor(r / ring), rc = (ri + 0.5) * ring;
        // near the centre the cells would be thinner than the ring is deep: the sector doubles there, so the cells stay near-square
        float sec = uSector * exp2(max(0.0, ceil(log2(ring * 0.9 / (rc * uSector)))));
        float ai = floor((a + 3.14159265) / sec), ac = (ai + 0.5) * sec - 3.14159265;
        vec2 cc = cen + rc * vec2(sin(ac), cos(ac));            // centre of this cell, pixels
        // echo of the cell: 5 taps in the cell (colour and depth)
        float echo = 0.0, wsum = 0.0, sat = 0.0;
        for (int i = 0; i < 5; i++) {
          vec2 o = i == 0 ? vec2(0.0) : i == 1 ? vec2(0.3, 0.0) : i == 2 ? vec2(-0.3, 0.0) : i == 3 ? vec2(0.0, 0.3) : vec2(0.0, -0.3);
          vec2 p = cc + o.x * rc * sec * vec2(cos(ac), -sin(ac)) + o.y * ring * vec2(sin(ac), cos(ac));
          vec2 q = p / uRes;
          if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) continue;
          float dep = texture2D(tDepth, q).x;
          if (dep > 0.9999) { wsum += 1.0; continue; }          // sky: no echo
          vec3 c = texture2D(tColor, q).rgb;
          float L = lum(c), mx = max(c.r, max(c.g, c.b)), mn = min(c.r, min(c.g, c.b));
          float z = linDepth(q);
          float refl = 0.55 * pow(clamp(L, 0.0, 1.0), 0.45) + 0.55 * (mx - mn) / max(mx, 0.05) * 0.5 + 0.35 * clamp(1.0 - 0.6 * z / uFocus, 0.0, 1.0) - 0.12;
          echo += refl; wsum += 1.0;
        }
        echo = (echo / max(wsum, 1.0) - 0.28) * 2.1;
        // sweep: one turn in 4 seconds. age = angle since the line passed this cell.
        float sw = mod(uTime * 1.5708, 6.2831853);
        float age = mod(sw - (a + 3.14159265), 6.2831853);
        float ageC = mod(sw - (ac + 3.14159265), 6.2831853);
        float fresh = exp(-ageC / 2.2);
        float bright = 0.32 + 0.68 * fresh;
        // the sweep repaints the cell with a little noise in the echo
        echo += (h21(vec2(ri, ai) + floor(uTime * 4.0)) - 0.5) * 0.06;
        vec3 col = scale(echo) * bright;
        // gaps between the cells
        float gr = abs(fract(r / ring) - 0.5), ga = abs(fract((a + 3.14159265) / sec) - 0.5);
        float gap = smoothstep(0.42, 0.5, gr) + smoothstep(0.42, 0.5, ga) * step(0.0, 1.0);
        col *= 1.0 - 0.7 * clamp(gap, 0.0, 1.0);
        // the scope: dark green glass, range rings every 120 px, spokes every 30 degrees
        float rg = abs(fract(r / (120.0 * sc)) - 0.5) * 120.0 * sc;
        float rings = 1.0 - smoothstep(0.0, 1.6 * sc, 0.5 * 120.0 * sc - rg);
        float spokes = 1.0 - smoothstep(0.0, 1.6 * sc, abs(sin(a * 6.0)) * r / 6.0);
        vec3 bg = vec3(0.004, 0.018, 0.012) + vec3(0.02, 0.18, 0.08) * (rings * 0.55 + spokes * 0.4) * (0.5 + 0.5 * bright);
        col = col + bg * (1.0 - 0.7 * step(0.01, length(col)));
        // sweep line and its edge
        float line = exp(-pow(age / 0.012, 2.0)) * 1.0;
        col += vec3(0.2, 1.0, 0.35) * line * 0.9 + vec3(0.1, 0.5, 0.2) * exp(-age / 0.25) * 0.1;
        return vec4(col * 0.9, 1.0);
      }`,
  },
};
