// Art style 43: Electron micrograph. Input N (normals); the depth texture is read only for the sky test (the manifest row says N).
// Grey only. A secondary-electron image: a surface that turns away from the view, and an edge, sends out more electrons, so it is bright; a surface
// that faces the view is dark grey. A detector on one side adds a lighter side and a darker side. Every depth is in focus (the depth texture is read only to find the sky, which is dark).
// Fine scan noise: shot noise at each pixel, a brightness and a small shift for each scan line, and a slow drift of the beam.
window.ARTS = window.ARTS || {};
ARTS['electron-micrograph'] = {
  id: 'electron-micrograph', name: 'Electron micrograph', group: 'An instrument sees the scene', inputs: 'D N',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      vec3 nrm(vec2 uv){ return normalize(texture2D(tNormal, uv).rgb * 2.0 - 1.0); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float fr = floor(uTime * 24.0);                     // the scan repeats 24 times a second, each with its own noise
        float row = floor(fc.y);
        // each scan line starts a little early or late
        float shift = (h21(vec2(row, fr + 3.0)) - 0.5) * 2.2 * px.x + 0.8 * px.x * sin(row * 0.021 + fr * 0.7);
        vec2 q = vec2(uv.x + shift, uv.y);
        // the sky is found from the depth texture (the normal pass cannot tell the background from a surface); it becomes the dark vacuum.
        // Note for the lead: this reads tDepth, so the row's inputs should read 'D N'; the manifest row still says 'N'.
        float bgN = step(0.9999, texture2D(tDepth, q).x);
        vec3 rawN = texture2D(tNormal, q).rgb * 2.0 - 1.0;
        vec3 n = normalize(rawN);
        float cosv = clamp(abs(n.z), 0.0, 1.0);
        // yield rises as the surface turns from the beam: about 1 / cos, soft at the top
        float yield = 1.0 - pow(cosv, 1.1);
        yield = pow(yield, 0.75);
        // edge effect: where the normal changes within 2 pixels, the electrons leave from two sides
        vec3 nr = nrm(q + vec2(2.0 * px.x, 0.0)), nl = nrm(q - vec2(2.0 * px.x, 0.0)), nu = nrm(q + vec2(0.0, 2.0 * px.y)), nd = nrm(q - vec2(0.0, 2.0 * px.y));
        float ed = clamp(max(length(nr - nl), length(nu - nd)) * 0.9, 0.0, 1.0);
        // detector at the upper right: a lighter side and a darker side
        float side = 0.5 + 0.5 * clamp(dot(n, normalize(vec3(0.7, 0.55, 0.45))), -1.0, 1.0);
        float s = 0.10 + 0.42 * yield * (0.7 + 0.5 * side) + 0.62 * ed;
        s = mix(s, 0.06 + 0.05 * side, bgN);
        // beam tone: a slow charge drift and a vignette of the detector
        float v = length((uv - 0.5) * vec2(1.0, 0.9));
        s *= 1.05 - 0.25 * v * v + 0.06 * sin(uv.y * 5.0 + uTime * 0.3);
        // shot noise (it falls as the signal rises) and scan-line brightness
        float nz = h21(fc + vec2(fr * 7.13, fr * 3.71)) + h21(fc * 1.37 + vec2(fr * 2.9, 11.0)) - 1.0;   // about -1 to 1, peaked at 0
        s += nz * (0.20 - 0.08 * s) + (h21(vec2(row, fr + 9.0)) - 0.5) * 0.07;
        s = clamp(s, 0.0, 1.0);
        float g = pow(s, 1.08);
        return vec4(vec3(g) * 1.25, 1.0);                   // tone mapping runs after this shader; the 1.25 keeps the mid greys
      }`,
  },
};
