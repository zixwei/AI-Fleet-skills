// Art style 49: Event camera. Input X (the scene rendered at another time, mode 'diff').
// Only change shows. The kit renders the frame at t (tColor) and the frame at t - 0.08 s (tPrev) with the camera fixed at its pose at t, so
// anything that does not move in the world is the same in both and stays black. A pixel whose log brightness went up is blue; one that went
// down is red. A pixel fires when the change passes a threshold, so a weak change gives a sparse scatter of events and a strong one a dense patch.
// Labels are drawn after this shader (kit rule), so they keep their own colours on the black frame.
window.ARTS = window.ARTS || {};
ARTS['event-camera'] = {
  id: 'event-camera', name: 'Event camera', group: 'An instrument sees the scene', inputs: 'X',
  labels: 'halo',
  x: { n: 2, span: 0.08, mode: 'diff', fixCamera: true },
  post: {
    fragment: `
      float h21(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      vec4 postFX(vec2 uv){
        vec2 fc = uv * uRes;
        float sc = uRes.y / 1080.0;
        vec2 cell = floor(fc / (2.0 * sc));                        // an event is a 2 x 2 pixel dot
        vec2 cuv = (cell + 0.5) * 2.0 * sc / uRes;
        float l1 = lum(texture2D(tColor, cuv).rgb), l0 = lum(texture2D(tPrev, cuv).rgb);
        float d = log(l1 + 0.02) - log(l0 + 0.02);                // change in log brightness
        float C = 0.10;                                           // contrast threshold
        float strength = abs(d) / C;                              // 1 = just at the threshold
        // fires when the change passes the threshold; a strong change fires on every pixel, a weak one on some of them
        float fire = step(h21(cell + floor(uTime * 90.0) * 1.7) * 0.9 + 0.1, smoothstep(0.9, 3.0, strength));
        vec3 col = vec3(0.0);
        col += (d > 0.0 ? vec3(0.03, 0.28, 1.0) : vec3(1.0, 0.04, 0.03)) * fire * (0.7 + 0.3 * h21(cell * 1.9));
        // a few noise events: they are never fully gone in a real sensor
        float nz = step(0.9992, h21(cell + 91.0 + floor(uTime * 30.0) * 3.3));
        col += (h21(cell + 5.0) > 0.5 ? vec3(0.03, 0.28, 1.0) : vec3(1.0, 0.04, 0.03)) * nz * 0.6;
        return vec4(col * 1.7, 1.0);
      }`,
  },
};
