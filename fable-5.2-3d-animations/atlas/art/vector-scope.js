// Art style 45: Vector scope (new version of the first-set style vector-scope). Inputs D N (depth, normals).
// Only the edges show, as glowing green lines on black glass (the green and the glass tint of the first-set poster). An edge is a depth step or a
// normal crease. A bright round point sits where three different surfaces meet (a box corner, or a corner on the silhouette): the shader looks at a
// ring of 10 samples (8 px) round each pixel and asks for three groups of surfaces (normal and depth), so a straight edge never gives a point.
// Smooth bloom, a curved glass (0.12) with dark corners, faint scan lines. No phosphor trails: they need the frame before (input X).
// Labels are drawn after this shader, so they stay flat and in their own colours.
window.ARTS = window.ARTS || {};
ARTS['vector-scope'] = {
  id: 'vector-scope', name: 'Vector scope', group: 'An instrument sees the scene', inputs: 'D N',
  labels: 'halo',
  post: {
    normals: true,
    fragment: `
      float zAt(vec2 uv){ return linDepth(uv); }
      // edge strength at uv, 0 to 1 (4 depth taps and 4 normal taps)
      float edgeAt(vec2 uv, vec2 px){
        float z = zAt(uv);
        float zr = zAt(uv + vec2(px.x, 0.0)), zl = zAt(uv - vec2(px.x, 0.0));
        float zu = zAt(uv + vec2(0.0, px.y)), zd = zAt(uv - vec2(0.0, px.y));
        float dz = max(abs(zr - zl), abs(zu - zd)) / z;
        // the second difference removes the slope of a flat floor seen at a grazing angle
        float cz = max(abs(zr + zl - 2.0 * z), abs(zu + zd - 2.0 * z)) / z;
        float de = max(smoothstep(0.02, 0.06, dz), smoothstep(0.010, 0.025, cz));
        vec3 nr = texture2D(tNormal, uv + vec2(px.x, 0.0)).rgb, nl = texture2D(tNormal, uv - vec2(px.x, 0.0)).rgb;
        vec3 nu = texture2D(tNormal, uv + vec2(0.0, px.y)).rgb, nd = texture2D(tNormal, uv - vec2(0.0, px.y)).rgb;
        float ne = smoothstep(0.35, 0.8, max(length(nr - nl), length(nu - nd)) * 2.0);
        float bg = step(0.9999, texture2D(tDepth, uv).x);
        return max(de, ne * (1.0 - bg));
      }
      // a cheaper edge for the bloom: one-sided differences (2 depth taps, 2 normal taps)
      float edgeFast(vec2 uv, vec2 px){
        px *= 3.0;   // wide differences: the line is about 6 px wide, so the fixed spiral of the bloom leaves no ghost copies
        float z = zAt(uv), zr = zAt(uv + vec2(px.x, 0.0)), zu = zAt(uv + vec2(0.0, px.y));
        float de = smoothstep(0.015, 0.05, max(abs(zr - z), abs(zu - z)) / z);
        vec3 n = texture2D(tNormal, uv).rgb;
        float ne = smoothstep(0.2, 0.5, max(length(texture2D(tNormal, uv + vec2(px.x, 0.0)).rgb - n), length(texture2D(tNormal, uv + vec2(0.0, px.y)).rgb - n)) * 2.0);
        return max(de, ne * (1.0 - step(0.9999, texture2D(tDepth, uv).x)));
      }
      // what surface is here: the normal and the log depth, so a depth step and a crease both separate two groups
      vec4 surf(vec2 uv){
        vec3 n = texture2D(tNormal, uv).rgb * 2.0 - 1.0;
        float far = step(0.9999, texture2D(tDepth, uv).x);
        return vec4(n * (1.0 - far), 3.0 * log(zAt(uv) / uFocus) + 3.0 * far);
      }
      vec4 postFX(vec2 uv0){
        // curved glass: pull the lookup toward the middle
        vec2 cc = uv0 - 0.5; float r2 = dot(cc, cc);
        vec2 uv = 0.5 + cc * (1.0 + 0.12 * r2);
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0, 0.004, 0.001, 1.0);
        float sc = uRes.y / 1080.0;
        vec2 px = 1.0 / uRes;
        float e0 = edgeAt(uv, px);
        // bloom: edge strength on a spiral of 32 taps turned per pixel, weights fall as a Gaussian of 6 px; a fine hash noise replaces the ghost rings of a fixed pattern
        float turn = fract(sin(dot(floor(uv * uRes), vec2(12.9898, 78.233))) * 43758.5453) * 1.2;   // a turn of the pattern from a hash of the pixel: no ghost rings
        float bl = 0.0, bw = 0.0;
        for (int i = 0; i < 32; i++) {
          float r = 20.0 * sc * sqrt((float(i) + 0.5) / 32.0), a = float(i) * 2.39996 + turn;
          float w = exp(-r * r / (2.0 * 36.0 * sc * sc));
          bl += w * edgeFast(uv + vec2(cos(a), sin(a)) * r * px, px); bw += w;
        }
        bl /= bw;
        // corner point: only near an edge. Three groups among the centre and a ring of 10 samples (8 px).
        float corner = 0.0;
        if (bl > 0.02) {
          vec4 f[10];
          vec4 A = surf(uv);
          for (int i = 0; i < 10; i++) {
            float a = float(i) * 0.6283185;
            f[i] = surf(uv + vec2(cos(a), sin(a)) * px * 8.0 * sc);
          }
          float best = 0.0;
          for (int i = 0; i < 10; i++) {
            float dA = length(f[i] - A);
            for (int j = i + 1; j < 10; j++) {
              best = max(best, min(min(dA, length(f[j] - A)), length(f[i] - f[j])));
            }
          }
          corner = smoothstep(0.55, 1.0, best);
        }
        float glow = e0 + bl * 2.0;
        vec3 green = vec3(0.10, 1.0, 0.20);                      // about #5aff7a, as in the first-set style
        vec3 col = green * glow * 0.9 + vec3(0.25, 0.6, 0.3) * pow(e0, 3.0) * 0.3;
        col += vec3(0.45, 1.0, 0.55) * corner * (1.6 + 2.0 * clamp(bl * 3.0, 0.0, 1.0));   // the point: a round bright spot
        // glass: dark green base, scan lines, and dark rounded corners
        float scan = 0.9 + 0.1 * sin(uv0.y * uRes.y * 1.5707963 / max(sc, 0.25));
        col = (col * scan + vec3(0.0, 0.012, 0.004)) * (1.0 - 1.4 * r2);
        return vec4(col, 1.0);
      }`,
  },
};
