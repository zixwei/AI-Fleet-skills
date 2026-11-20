// Art style 28: Anaglyph 3D. Inputs C D (colour, depth).
// Red and cyan images, shifted by the depth. The left eye image goes to the red channel and the right eye image to green and blue.
// Each eye image is the picture moved sideways by a disparity that follows the depth: zero at the focus distance, crossed in front of it,
// uncrossed behind it. Each eye pixel searches along its row for the nearest surface that lands on it. Without glasses it shows coloured edges.
window.ARTS = window.ARTS || {};
ARTS['anaglyph-3d'] = {
  id: 'anaglyph-3d', name: 'Anaglyph 3D', group: 'The depth is the material', inputs: 'C D',
  post: {
    fragment: `
      // disparity in pixels for a depth d (view space distance), zero at the focus plane
      float disp(float d, float S){
        float inv = 1.0 / max(d, 0.01) - 1.0 / uFocus;
        return clamp(inv * uFocus * 100.0 * S, -90.0 * S, 140.0 * S);
      }
      // colour seen by one eye (s = +1 left eye, -1 right eye) at pixel uv
      vec3 eye(vec2 uv, float s){
        float S = uRes.y / 1080.0;
        float best = 1e9, bestErr = 1e9; vec3 bc = texture2D(tColor, uv).rgb, ec = bc; bool hit = false;
        for (int i = -44; i <= 44; i++) {
          vec2 q = uv + vec2(float(i) * 2.0 * S, 0.0) / uRes;
          if (q.x < 0.0 || q.x > 1.0) continue;
          float d = texture2D(tDepth, q).x > 0.9999 ? uFar * 0.2 : linDepth(q);
          // the source pixel q lands at q.x + s * disp / 2 (half of the disparity for each eye)
          float land = q.x * uRes.x + s * 0.5 * disp(d, S);
          float err = abs(land - uv.x * uRes.x);
          if (err < 1.6 * S + 0.3 && d < best) { best = d; bc = texture2D(tColor, q).rgb; hit = true; }
          if (err < bestErr) { bestErr = err; ec = texture2D(tColor, q).rgb; }
        }
        return hit ? bc : ec;   // a hole takes the closest landing instead of a speckle
      }
      vec4 postFX(vec2 uv){
        vec3 L = eye(uv, 1.0), R = eye(uv, -1.0);
        // the red image keeps a little colour so that red things do not vanish in the left eye
        float lL = dot(L, vec3(0.2126, 0.7152, 0.0722));
        vec3 gl = mix(vec3(lL), L, 0.45);
        return vec4(gl.r * 1.05, R.g, R.b, 1.0);
      }`,
  },
};
