// Art style 59: Scratch on film. Inputs D S (depth, frame step).
// Black film. The picture is scratched into the emulsion as white lines (outlines at depth edges, short slanted scratches that are more dense on what is near), 12 frames per second:
// the lines jump on each frame. Dye spots (red, cyan, yellow, violet) tint the scratches and glow on the black. Sprocket holes run along both sides and step by one pitch on each frame.
window.ARTS = window.ARTS || {};
ARTS['scratch-on-film'] = {
  id: 'scratch-on-film', name: 'Scratch on film', group: 'Hand-made animation', inputs: 'D S',
  fps: 12,
  labels: 'halo',   // K.label text stays readable over the strokes
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      vec3 outc(vec3 g){ return pow(clamp(g, 0.0, 1.0), vec3(2.2)) * 2.3; }
      float rbox(vec2 p, vec2 c, vec2 h, float r){ vec2 q = abs(p - c) - h + r; return 1.0 - smoothstep(r - 1.0, r + 1.0, length(max(q, 0.0)) + min(max(q.x, q.y), 0.0)); }
      vec4 postFX(vec2 uv0){
        vec2 px = 1.0 / uRes, fc = uv0 * uRes;
        float fr = floor(uTime * 12.0 + 0.5);
        // the scratched drawing jumps on each frame
        vec2 jump = (vec2(h21(vec2(fr, 1.0)), h21(vec2(fr, 2.0))) - 0.5) * 9.0 * px;
        vec2 q = uv0 + jump + (vec2(vn(fc * 0.03 + fr * 4.0), vn(fc * 0.03 + 50.0 + fr * 4.0)) - 0.5) * 5.0 * px;
        float d0 = dd(q), ratio = d0 / uFocus;
        // outline scratch at depth edges, broken where the point lifted
        float de = 0.0, R = 1.8 + 0.8 * vn(fc * 0.05 + fr);
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.7854 + 0.3;
          de = max(de, abs(dd(q + vec2(cos(a), sin(a)) * R * px) - d0) / d0);
        }
        float edge = smoothstep(0.012, 0.035, de) * smoothstep(0.15, 0.3, vn(fc * 0.07 + fr * 11.0));
        // slanted short scratches, more dense on what is near the camera
        float nearN = 1.0 - smoothstep(0.7, 1.3, ratio);
        vec2 p = vec2(fc.x * 0.94 + fc.y * 0.34, -fc.x * 0.34 + fc.y * 0.94);
        float s = abs(fract(p.x / 4.6 + 0.8 * vn(vec2(p.x * 0.15, fr * 1.7))) - 0.5) * 2.0;
        float seg = vn(vec2(p.x * 0.31 + fr * 5.0, p.y * 0.035 + fr * 3.0));
        float hatch = step(s, nearN * 0.22) * smoothstep(0.62 - 0.45 * nearN, 0.7 - 0.45 * nearN, seg);
        float sc = max(edge, hatch * 0.8);
        sc *= 0.7 + 0.3 * vn(fc * 0.8 + fr * 9.0);
        // dye spots: one at most in each 150 px cell (and the 8 cells around it), new places on each frame
        vec3 dye = vec3(0.0); float dm = 0.0;
        vec2 cell = floor(fc / 150.0);
        for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) {
          vec2 cc = cell + vec2(float(i), float(j));
          float hh = h21(cc + fr * 3.7);
          if (hh > 0.62) {
            vec2 ctr = (cc + vec2(h21(cc + 7.1 + fr), h21(cc + 13.3 + fr))) * 150.0;
            float rad = 18.0 + 40.0 * h21(cc + 3.3 + fr);
            float m = smoothstep(rad, rad * 0.35, length(fc - ctr) + 6.0 * vn(fc * 0.08 + cc));
            float k = h21(cc + 29.0 + fr);
            vec3 dc = k < 0.25 ? vec3(1.0, 0.2, 0.3) : k < 0.5 ? vec3(0.15, 0.8, 1.0) : k < 0.75 ? vec3(1.0, 0.8, 0.1) : vec3(0.6, 0.3, 1.0);
            dye = mix(dye, dc, m); dm = max(dm, m);
          }
        }
        // film: black base with a little grain; the scratches let light through, tinted by the dye
        vec3 col = vec3(0.018) + 0.012 * vn(fc * 0.9 + fr * 7.0);
        col += dye * dm * 0.33;
        col = mix(col, mix(vec3(0.97, 0.96, 0.93), dye * 1.3 + 0.25, dm * 0.75), sc);
        col += step(0.9985, h21(floor(fc * 0.5) + fr * 5.0)) * 0.5;        // dust
        // sprocket strips: a dark band with holes that let the light through, one pitch per frame
        float Wf = 96.0;
        float strip = max(step(fc.x, Wf), step(uRes.x - Wf, fc.x));
        float sx = fc.x < uRes.x * 0.5 ? Wf * 0.5 : uRes.x - Wf * 0.5;
        float pitch = 76.0, off = mod(fr * 38.0, pitch);
        float yy = mod(fc.y + off, pitch) - pitch * 0.5;
        float hole = rbox(vec2(fc.x, yy), vec2(sx, 0.0), vec2(17.0, 22.0), 6.0);
        vec3 sc2 = vec3(0.03) + 0.015 * vn(fc * 0.4);
        sc2 = mix(sc2, vec3(0.97, 0.95, 0.9), hole);
        col = mix(col, sc2, strip);
        col += strip * (1.0 - hole) * 0.04 * smoothstep(3.0, 0.0, abs(min(fc.x, uRes.x - fc.x) - Wf));   // the edge of the strip
        return vec4(outc(col), 1.0);
      }`,
  },
};
