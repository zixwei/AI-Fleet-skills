// Art style 22: Stone bas-relief. Inputs D N (depth, normals).
// The scene is a shallow carving on a stone wall. The depth is compressed to a thin layer and a low light from the left shows it.
// The height is the compressed depth. The surface slope comes from the height and from the scene normals. The light marches
// over the height to cast the shadows. Stone grain and fine block joints sit on top.
window.ARTS = window.ARTS || {};
ARTS['stone-bas-relief'] = {
  id: 'stone-bas-relief', name: 'Stone bas-relief', group: 'The depth is the material', inputs: 'D N',
  post: {
    normals: true,
    fragment: `
      // depth position in the scene: 0 near, 1 far, from the log of depth over the focus distance (0.57 to 2.0 times uFocus). Stable from frame to frame. The sky counts as 1.
      float zn(vec2 uv){ return texture2D(tDepth, uv).x > 0.9999 ? 1.0 : clamp((log2(linDepth(uv) / uFocus) + 0.8) / 1.8, 0.0, 1.0); }
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      // relief height 0 (wall) to 1 (highest): near is high. A square root keeps the far parts visible and the near parts thin.
      float H(vec2 uv){ return pow(1.0 - zn(uv), 0.8) * (texture2D(tDepth, uv).x > 0.9999 ? 0.0 : 1.0); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float S = uRes.y / 1080.0;
        float h = H(uv);
        // slope of the relief (height is in layer units; 40 px of height scale)
        float e = 1.5 * px.x;
        float hx = (H(uv + vec2(e, 0.0)) - H(uv - vec2(e, 0.0))) / (2.0 * 1.5), hy = (H(uv + vec2(0.0, e * uRes.x / uRes.y)) - H(uv - vec2(0.0, e * uRes.x / uRes.y))) / (2.0 * 1.5);
        vec3 nv = normalize(texture2D(tNormal, uv).rgb * 2.0 - 1.0);   // view-space scene normal: carves the inside of a shape
        vec3 nr = normalize(vec3(-hx * 9.0 - nv.x * 0.7, -hy * 9.0 - nv.y * 0.7, 1.0));
        // stone grain
        float grain = 0.5 * vn(fc / (3.0 * S)) + 0.3 * vn(fc / (9.0 * S)) + 0.2 * vn(fc / (1.2 * S));
        nr = normalize(nr + vec3(grain - 0.5, vn(fc / (3.0 * S) + 17.0) - 0.5, 0.0) * 0.28);
        // low light from the left and above
        vec3 L = normalize(vec3(-0.9, 0.3, 0.3));
        float lit = max(dot(nr, L), 0.0);
        // cast shadow: march toward the light over the height
        float sh = 0.0;
        for (int i = 1; i <= 12; i++) {
          float s = float(i) * 2.2 * S;
          vec2 q = uv + vec2(-0.85, 0.35 * uRes.x / uRes.y) * px * s;
          sh = max(sh, clamp((H(q) - h - float(i) * 0.012) * 9.0, 0.0, 1.0));
        }
        lit *= 1.0 - 0.8 * sh;
        // block joints of the wall (a light groove)
        vec2 bp = fc / (360.0 * S); float row = floor(bp.y * 2.0); bp.x += 0.5 * mod(row, 2.0);
        vec2 bf = fract(vec2(bp.x, bp.y * 2.0));
        float joint = 1.0 - smoothstep(0.0, 0.012, min(min(bf.x, 1.0 - bf.x), min(bf.y, 1.0 - bf.y)) * (1.0 + 0.0 * h));
        vec3 stone = mix(vec3(0.66, 0.58, 0.46), vec3(0.84, 0.76, 0.62), grain) * (0.9 + 0.2 * h21(vec2(row, floor(bp.x))));
        vec3 col = stone * (0.07 + 1.25 * pow(lit, 1.3));
        col *= 1.0 - 0.45 * joint * (1.0 - 0.7 * smoothstep(0.1, 0.4, h));
        col *= 0.94 + 0.12 * h21(floor(fc / 1.5));   // pits
        return vec4(col * 1.7, 1.0);
      }`,
  },
};
