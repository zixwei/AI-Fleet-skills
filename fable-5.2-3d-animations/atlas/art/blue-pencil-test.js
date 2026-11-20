// Art style 53: Blue pencil test. Inputs D N S (depth, normals, frame step).
// An animator's line test: rough blue construction lines (three loose passes), a darker clean line that changes a little on each frame (12 per second), peg holes, no shading.
window.ARTS = window.ARTS || {};
ARTS['blue-pencil-test'] = {
  id: 'blue-pencil-test', name: 'Blue pencil test', group: 'Hand-made animation', inputs: 'D N S',
  fps: 12,
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      vec3 nrm(vec2 uv){ return texture2D(tNormal, uv).rgb * 2.0 - 1.0; }
      vec3 outc(vec3 g){ return pow(clamp(g, 0.0, 1.0), vec3(2.2)) * 2.3; }
      // 0..1: how close this point is to a silhouette (depth jump) or a crease (normal jump), within radius R pixels
      float edgeAt(vec2 uv, float R){
        vec2 px = 1.0 / uRes;
        float d0 = dd(uv), de = 0.0, ne = 0.0; vec3 n0 = nrm(uv);
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.7854 + 0.2;
          vec2 o = vec2(cos(a), sin(a)) * R * px;
          de = max(de, abs(dd(uv + o) - d0) / d0);
          ne = max(ne, 1.0 - dot(n0, nrm(uv + o)));
        }
        return max(smoothstep(0.012, 0.04, de), smoothstep(0.22, 0.5, ne));
      }
      // a rounded box: 1 inside
      float rbox(vec2 p, vec2 c, vec2 h, float r){ vec2 q = abs(p - c) - h + r; return 1.0 - smoothstep(r - 1.0, r + 1.0, length(max(q, 0.0)) + min(max(q.x, q.y), 0.0)); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float fr = floor(uTime * 12.0 + 0.5);
        // paper
        float grain = vn(fc * 0.9) * 0.5 + vn(fc * 0.31 + 5.0) * 0.5;
        vec3 col = vec3(0.965, 0.962, 0.945) * (0.975 + 0.05 * grain);
        col *= 1.0 - 0.07 * smoothstep(0.55, 1.1, length((uv - 0.5) * vec2(1.78, 1.0)));
        // rough blue construction lines: three loose passes, each with its own wobble, offset and breaks, redrawn on every frame
        float rough = 0.0;
        for (int k = 0; k < 3; k++) {
          float s = float(k) * 19.0 + fr * 7.13;
          vec2 off = (vec2(h21(vec2(s, 1.0)), h21(vec2(s, 2.0))) - 0.5) * 18.0 * px;
          vec2 wob = (vec2(vn(fc * 0.012 + s), vn(fc * 0.012 + s + 50.0)) - 0.5) * 14.0 * px;
          float e = edgeAt(uv + off + wob, 0.9 + float(k) * 0.2);
          float brk = smoothstep(0.3, 0.55, vn(fc * 0.035 + s * 3.0));          // the stroke lifts and lands again
          rough = max(rough, e * brk * (0.7 + 0.3 * h21(vec2(s, 4.0))));
        }
        col = mix(col, vec3(0.28, 0.55, 0.96), rough * 0.9);
        // clean line: darker, thinner, shifted by a hair on each frame
        vec2 cj = (vec2(h21(vec2(fr, 11.0)), h21(vec2(fr, 12.0))) - 0.5) * 3.2 * px;
        vec2 cw = (vec2(vn(fc * 0.03 + fr * 3.1), vn(fc * 0.03 + 60.0 + fr * 3.1)) - 0.5) * 2.2 * px;
        float clean = edgeAt(uv + cj + cw, 1.5);
        clean *= 0.78 + 0.22 * vn(fc * 0.08 + fr);                              // pressure
        col = mix(col, vec3(0.10, 0.12, 0.19), clean * 0.92);
        // peg holes: a round one in the middle and a slot on each side, near the bottom edge
        vec2 pc = vec2(uRes.x * 0.5, uRes.y * 0.055);
        float hole = max(rbox(fc, pc, vec2(15.0, 15.0), 15.0), max(rbox(fc, pc + vec2(-150.0, 0.0), vec2(30.0, 15.0), 15.0), rbox(fc, pc + vec2(150.0, 0.0), vec2(30.0, 15.0), 15.0)));
        float ring = max(rbox(fc, pc, vec2(21.0), 21.0), max(rbox(fc, pc + vec2(-150.0, 0.0), vec2(36.0, 21.0), 21.0), rbox(fc, pc + vec2(150.0, 0.0), vec2(36.0, 21.0), 21.0)));
        col *= 1.0 - 0.1 * (ring - hole);                                       // the punched edge is a little darker
        col = mix(col, vec3(0.16, 0.17, 0.20), hole);
        return vec4(outc(col), 1.0);
      }`,
  },
};
