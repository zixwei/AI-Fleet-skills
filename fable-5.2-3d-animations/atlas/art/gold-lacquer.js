// Art style 87: Gold lacquer (maki-e). Inputs C N W (colour, normals, world position).
// Black lacquer with a deep gloss. The picture is gold powder: the scene tone sets how many 1.6 px grains lie on each spot (a dust of up to 60 percent of the grains
// in the mid and light tones, a solid gold fill only in the lightest tones), and the contour lines (colour and normal edges) are solid gold lines.
// Grains are fixed in the world (a cell hash of the world position) and each has a random facet normal. A grain glints when its
// facet faces the half vector between a fixed light and the direction to the camera, so glints turn on and off point by point as the camera moves.
window.ARTS = window.ARTS || {};
ARTS['gold-lacquer'] = {
  id: 'gold-lacquer', name: 'Gold lacquer', group: 'World traditions', inputs: 'C N W',
  labels: 'light',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      vec2 h22(vec2 p){ return vec2(h21(p), h21(p + 17.3)); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      vec3 nrm(vec2 uv){ return normalize(texture2D(tNormal, uv).rgb * 2.0 - 1.0); }
      vec4 postFX(vec2 uv){
        vec2 res = uRes, px = 1.0 / res, fc = uv * res; float sc = res.y / 720.0;
        vec3 c = texture2D(tColor, uv).rgb;
        vec3 g = pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2));
        float L = lum(g);
        vec3 n0 = nrm(uv);
        // contour lines: colour edges and normal creases
        float ge = 0.0, ne = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * px * 1.5 * sc;
          ge = max(ge, length(texture2D(tColor, uv + o).rgb - c));
          ne = max(ne, 1.0 - dot(n0, nrm(uv + o)));
        }
        float line = max(smoothstep(0.1, 0.25, ge), smoothstep(0.3, 0.55, ne));
        float depthEdge = 1.0 - step(0.9999, texture2D(tDepth, uv).x);
        // powder density from the tone
        // the tone sets a dust of 0 to 60 percent of the grains; only the lightest tones (over 0.9) fill solid, and the lines are solid
        float dens = smoothstep(0.42, 0.98, L) * 0.6 + smoothstep(0.9, 1.0, L) * 0.4;
        dens = max(min(dens, 0.2) * (0.45 + 0.55 * depthEdge), line * 1.1);
        // grains fixed in the world: a cell of world size gs (about 2.5 px at the focus distance), each with its own random facet normal
        vec3 P = worldPos(uv), Nw = worldNormal(uv);
        float gs = uFocus * 0.0026;
        if (depthEdge < 0.5) P = vec3(fc / (2.5 * sc) * gs, 0.0);   // the empty background has no world position: its grains stay on the screen
        vec3 gi = floor(P / gs);
        vec2 hh = h22(gi.xy + gi.z * 17.0 + 5.0);
        float present = step(hh.x, dens * 1.15);
        vec3 rnd = vec3(h22(gi.xy * 1.3 + gi.z * 7.0 + 31.0), h21(gi.yz + gi.x * 3.0 + 13.0)) - 0.5;
        vec3 ng = normalize(Nw * 0.35 + rnd * 4.0);   // the facet is mostly random, so a flat face does not glint as a whole
        vec3 V = normalize(uViewInv[3].xyz - P), Lg = normalize(vec3(-0.45, 0.7, 0.55));
        vec3 H = normalize(Lg + V);
        float spec = pow(max(dot(ng, H), 0.0), 40.0) * 0.55;
        vec3 gold = vec3(1.0, 0.6, 0.15) * (0.3 + 0.32 * h21(gi.xy + gi.z * 5.0 + 13.0));
        gold = mix(gold, vec3(1.0, 0.9, 0.62) * 1.8, clamp(spec * 4.0, 0.0, 1.0));
        float round_ = 1.0;
        float solid = smoothstep(0.75, 1.0, dens);
        vec3 fill = vec3(0.95, 0.6, 0.16) * (0.42 + 0.2 * vn(fc * 0.6 / sc)) * (0.7 + 0.8 * pow(max(dot(nrm(uv), vec3(0.0, 0.0, 1.0)), 0.0), 8.0));
        vec3 goldCol = mix(gold, fill, solid * 0.7);
        float gcov = mix(present * round_, 1.0, solid * 0.8) * step(0.02, dens);
        // black lacquer: deep, with a soft reflection of the room on its normals
        vec3 lac = vec3(0.012, 0.011, 0.014);
        lac += vec3(0.035, 0.03, 0.04) * pow(max(dot(n0, normalize(vec3(-0.3, 0.6, 0.75))), 0.0), 6.0);
        lac += vec3(0.04, 0.03, 0.025) * pow(max(dot(Nw, H), 0.0), 4.0) * 0.1;
        vec3 col = mix(lac, goldCol, gcov);
        return vec4(col * 1.1, 1.0);
      }`,
  },
};
