// Art style 18: Silk embroidery. Inputs C N (colour, normals).
// Long satin stitches lie along each surface (direction from the surface normal, in 15 degree steps, so each region has its own stitch angle).
// Each stitch is one thread colour (the scene colour at its centre) with a rounded body and a gap of linen between rows.
// The silk shine is a Kajiya-Kay highlight computed from the stitch direction and the surface normal in view space, so it moves over the stitches when the camera turns.
window.ARTS = window.ARTS || {};
ARTS['silk-embroidery'] = {
  id: 'silk-embroidery', name: 'Silk embroidery', group: 'The marks follow the surface', inputs: 'C N',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      const vec2 DEF = vec2(0.94, 0.34);
      vec3 nrm(vec2 uv){ return texture2D(tNormal, uv).rgb * 2.0 - 1.0; }
      vec2 turn(vec3 n, vec2 ref){
        vec2 t = vec2(-n.y, n.x); float m = length(t);
        t = m > 1e-4 ? t / m : ref;
        if (dot(t, ref) < 0.0) t = -t;
        return normalize(mix(ref, t, smoothstep(0.05, 0.35, m)));
      }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      vec4 postFX(vec2 uv){
        float sc = uRes.y / 720.0; vec2 fv = uv * uRes / sc;
        vec3 n0 = nrm(uv);
        vec2 d = turn(n0, DEF);
        float qa = floor(atan(d.y, d.x) / 0.261799 + 0.5) * 0.261799;       // 15 degree steps
        vec2 dq = vec2(cos(qa), sin(qa)), pq = vec2(-dq.y, dq.x);
        const float W = 4.6, LH = 36.0;
        vec2 loc = vec2(dot(fv, dq), dot(fv, pq));
        float row = floor(loc.y / W);
        float off = h21(vec2(row, qa * 7.0 + 3.0)) * LH;
        float col = floor((loc.x + off) / LH);
        vec2 id = vec2(col, row) + qa * 11.0;
        float u = fract((loc.x + off) / LH) - 0.5, v = fract(loc.y / W) - 0.5;
        // thread colour: the scene colour at the stitch centre (the colour at this pixel if the centre lies on another surface)
        vec2 cl = vec2((col + 0.5) * LH - off, (row + 0.5) * W);
        vec2 uvc = (cl.x * dq + cl.y * pq) * sc / uRes;
        vec3 cc = texture2D(tColor, uvc).rgb;
        if (dot(nrm(uvc), n0) < 0.85) cc = texture2D(tColor, uv).rgb;
        float L = lum(cc);
        cc = max(mix(vec3(L), cc, 1.35), 0.0);
        float jit = 0.88 + 0.24 * h21(id + 5.0);
        // stitch body: a capsule; round across the thread (cylinder shading), round at the ends
        float lf = 0.8 + 0.2 * h21(id + 2.0);
        float a = max(abs(u) * LH - (LH * lf * 0.5 - W * 0.5), 0.0);
        float dist = length(vec2(a, v * W)) / (W * 0.5);
        float cover = 1.0 - smoothstep(0.9, 1.0, dist);
        float cyl = sqrt(clamp(1.0 - (v * 2.0) * (v * 2.0), 0.0, 1.0));
        float fibre = 0.9 + 0.1 * vn(vec2(u * LH * 0.25 + h21(id) * 9.0, v * W * 7.0));
        vec3 thread = cc * (0.6 + 0.5 * cyl) * jit * fibre;
        // silk shine (Kajiya-Kay): highlight where the thread is perpendicular to the half vector
        vec3 T = normalize(vec3(dq, -(dq.x * n0.x + dq.y * n0.y) / max(n0.z, 0.3)));
        vec3 H = normalize(normalize(vec3(-0.4, 0.5, 0.75)) + vec3(0.0, 0.0, 1.0));
        float th = dot(T, H);
        float spec = pow(sqrt(max(1.0 - th * th, 0.0)), 70.0) * (0.35 + 0.65 * cyl) * (0.55 + 0.9 * h21(id + 9.0)) * (1.0 - 0.5 * abs(u) * 2.0);
        thread += vec3(1.0, 0.94, 0.85) * spec * (0.3 + 0.9 * L);
        // linen between stitches: a dark weave
        float weave = 0.5 + 0.5 * sin(fv.x * 2.6) * sin(fv.y * 2.6);
        vec3 linen = cc * 0.5 * (0.7 + 0.5 * weave) * smoothstep(0.0, 0.2, dist);
        vec3 outc = mix(linen, thread, cover);
        return vec4(outc, 1.0);
      }`,
  },
};
