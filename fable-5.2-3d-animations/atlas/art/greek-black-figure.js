// Art style 83: Greek black-figure. Inputs D N (depth, normals).
// Orange fired clay with black figures. A surface is a figure when it is nearer than about 1.2 to 1.5 times uFocus and is not a horizontal
// ground (world up normal over about 0.8); the ground, the far part and the empty background show the clay. Inside a figure, colour edges, depth
// steps and normal creases are scratched lines through the black slip: they show the clay. Fine scratched hatching marks the folds
// turned away from the light. The clay is darker toward the left and right edges, like a vase.
window.ARTS = window.ARTS || {};
ARTS['greek-black-figure'] = {
  id: 'greek-black-figure', name: 'Greek black-figure', group: 'World traditions', inputs: 'C D N',
  labels: 'halo',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 4.0); }
      float fig(vec2 uv){
        if (texture2D(tDepth, uv).x > 0.9999) return 0.0;
        float d = linDepth(uv) / uFocus, up = worldNormal(uv).y;
        return (1.0 - smoothstep(1.2, 1.5, d)) * (1.0 - step(0.93, up));
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        float f0 = fig(uv), d0 = dd(uv);
        vec3 n0 = worldNormal(uv);
        // scratched lines: the line is wide on a depth step and thin on a crease; it only exists inside the figure
        float de = 0.0, ne = 0.0, fin = 1.0;
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.7854;
          vec2 o = vec2(cos(a), sin(a)) * px * (i < 4 ? 1.3 : 2.0) * sc;
          fin = min(fin, step(0.5, fig(uv + o)));
          de = max(de, abs(dd(uv + o) - d0) / d0);
          ne = max(ne, 1.0 - dot(n0, worldNormal(uv + o)));
        }
        // a scratched contour a little inside the silhouette: the outer ring of taps leaves the figure, the inner ring does not
        float f4 = 1.0, f6 = 1.0;
        for (int i = 0; i < 8; i++) {
          vec2 dir = vec2(cos(float(i) * 0.7854), sin(float(i) * 0.7854));
          f4 = min(f4, step(0.5, fig(uv + dir * px * 4.5 * sc)));
          f6 = min(f6, step(0.5, fig(uv + dir * px * 6.5 * sc)));
        }
        float contour = f4 * (1.0 - f6) * step(0.5, f0);
        // colour edges inside a figure (card outlines, icons, text) are scratched too; the colour is read only for this line
        float cg = 0.0; vec3 c0 = texture2D(tColor, uv).rgb;
        for (int i = 0; i < 4; i++) { vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * px * 1.3 * sc; cg = max(cg, length(texture2D(tColor, uv + o).rgb - c0)); }
        contour = max(contour, smoothstep(0.1, 0.25, cg) * fin * step(0.5, f0));
        float inc = max(contour, max(smoothstep(0.03, 0.06, de), smoothstep(0.3, 0.5, ne) * 0.9) * fin * step(0.5, f0));
        // hatching on folds turned away from the light (fine parallel scratches, broken up by noise)
        float nl = dot(n0, normalize(vec3(0.5, 0.7, 0.5)));
        float hv = (fc.x + fc.y) / (5.0 * sc);
        float hatch = smoothstep(0.2, 0.0, abs(fract(hv) - 0.5) - 0.34) * smoothstep(0.25, -0.1, nl) * smoothstep(0.4, 0.6, fbm(fc * 0.04 / sc)) * step(0.5, f0) * fin;
        // clay: orange, mottled, darker toward the vertical edges
        float vase = pow(abs(2.0 * uv.x - 1.0), 3.0);
        vec3 clay = mix(vec3(0.88, 0.47, 0.22), vec3(0.8, 0.38, 0.16), fbm(fc * 0.012 / sc));
        clay *= (0.93 + 0.1 * fbm(fc * 0.5 / sc)) * (1.0 - 0.25 * vase);
        // black slip: a deep black with a faint brown fired sheen on the lit side
        vec3 slip = vec3(0.035, 0.03, 0.03) + vec3(0.07, 0.05, 0.04) * smoothstep(0.55, 0.95, nl) * (0.6 + 0.4 * fbm(fc * 0.2 / sc));
        vec3 col = mix(clay, slip, f0);
        col = mix(col, clay * 1.05, max(inc, hatch * 0.9));
        return vec4(pow(col, vec3(2.2)) * 0.9, 1.0);
      }`,
  },
};
