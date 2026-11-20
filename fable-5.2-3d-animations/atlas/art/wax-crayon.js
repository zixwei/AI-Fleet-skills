// Art style 60: Wax crayon. Inputs C D S (colour, depth, frame step).
// Two passes of wax strokes (about 5 px wide, 46 px long, tapered ends) at 12 frames per second. Each stroke takes its colour from a point up to 17 px away, so wax goes outside the lines.
// Pressure changes along each stroke and the paper tooth (white) shows through where the pressure is low. Near-white areas stay bare paper. A dark wax line follows the depth edges.
window.ARTS = window.ARTS || {};
ARTS['wax-crayon'] = {
  id: 'wax-crayon', name: 'Wax crayon', group: 'Hand-made animation', inputs: 'C D S',
  fps: 12,
  labels: 'halo',   // K.label text stays readable over the strokes
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      vec3 outc(vec3 g){ return pow(clamp(g, 0.0, 1.0), vec3(2.2)) * 2.3; }
      vec3 disp(vec3 c){ return pow(clamp(c / (c + 0.9) * 1.9, 0.0, 1.0), vec3(0.85)); }
      vec4 postFX(vec2 uv0){
        vec2 px = 1.0 / uRes, fc = uv0 * uRes;
        float fr = floor(uTime * 12.0 + 0.5);
        // paper with tooth
        float tooth = vn(fc * 0.95) * 0.55 + vn(fc * 0.31 + 4.0) * 0.3 + vn(fc * 2.1) * 0.15;
        vec3 col = vec3(0.975, 0.962, 0.925) * (0.95 + 0.06 * vn(fc * 0.02));
        for (int k = 0; k < 2; k++) {
          float fk = float(k);
          float ang = 0.62 + fk * 0.62;                                  // one direction for each pass, so the stroke lattice does not warp into whorls
          mat2 R = mat2(cos(ang), sin(ang), -sin(ang), cos(ang));    // R * v rotates v by +ang; its transpose maps stroke space back to the screen
          vec2 pr = R * fc;
          float W = 5.0 + fk, Ls = 46.0;
          float kk = floor(pr.x / W), fx = fract(pr.x / W);
          float off = h21(vec2(kk, 3.0 + fk)) * Ls;
          float sidx = floor((pr.y + off) / Ls), fy = fract((pr.y + off) / Ls);
          vec2 id = vec2(kk + 211.0 * fk, sidx);
          float hid = h21(id), hf = h21(id * 1.7 + fr * 3.1);
          // the point the stroke takes its colour from: its own centre, plus a random leak that is new on each frame
          vec2 cen = vec2((kk + 0.5) * W, (sidx + 0.5) * Ls - off);
          vec2 sp = vec2(dot(cen, vec2(cos(ang), sin(ang))), dot(cen, vec2(-sin(ang), cos(ang))));
          sp += (vec2(h21(id + 3.3 + fr * 0.37), h21(id + 7.7 + fr * 0.53)) - 0.5) * 34.0;
          vec3 c = texture2D(tColor, clamp(sp * px, 0.0, 1.0)).rgb;
          vec3 g = disp(c);
          float gl = dot(g, vec3(0.2126, 0.7152, 0.0722));
          g = clamp(gl + (g - gl) * 1.45, 0.0, 1.0) * 0.96;
          // stroke body: rounded across, tapered at both ends, ragged
          float across = smoothstep(0.0, 0.2 + 0.1 * hf, fx) * smoothstep(1.0, 0.8 - 0.1 * hf, fx);
          float along = smoothstep(0.0, 0.14, fy) * smoothstep(1.0, 0.86, fy);
          float body = across * along;
          float press = 0.35 + 0.65 * vn(vec2(kk * 3.1 + fk * 7.0, (pr.y + off) * 0.022) + hid * 20.0);
          float wax = body * smoothstep(0.7 - 0.5 * press, 0.86 - 0.5 * press, tooth);
          float bare = smoothstep(0.995, 0.9, gl);                           // light areas leave paper
          col = mix(col, g, wax * bare * (k == 0 ? 0.95 : 0.6));
        }
        // dark wax line at the depth edges, ragged and wobbly
        vec2 q = uv0 + (vec2(vn(fc * 0.03 + fr * 6.0), vn(fc * 0.03 + 30.0 + fr * 6.0)) - 0.5) * 6.0 * px;
        float d0 = dd(q), de = 0.0;
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.7854 + 0.3;
          de = max(de, abs(dd(q + vec2(cos(a), sin(a)) * 2.6 * px) - d0) / d0);
        }
        float line = smoothstep(0.015, 0.04, de) * smoothstep(0.52, 0.62, tooth + 0.3 * vn(fc * 0.08 + fr));
        col = mix(col, vec3(0.2, 0.13, 0.12), line * 0.85);
        return vec4(outc(col), 1.0);
      }`,
  },
};
