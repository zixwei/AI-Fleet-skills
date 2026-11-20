// Art style 100: Long exposure. Input X (the scene rendered at other times).
// The shutter stays open for 1 second: n renders in [t - 1, t], averaged. The camera stays where it is at t (a tripod), so what does not move stays sharp.
window.ARTS = window.ARTS || {};
ARTS['long-exposure'] = {
  id: 'long-exposure', name: 'Long exposure', group: 'The picture is bent', inputs: 'X',
  x: { n: 10, still: 48, span: 1.0, mode: 'avg', fixCamera: true },   // n renders in live play, `still` when samples > 1
  post: {
    fragment: `
      vec4 postFX(vec2 uv){
        vec3 c = texture2D(tColor, uv).rgb;
        c += 0.35 * max(c - 0.7, 0.0);                       // bright trails keep their weight
        float v = length((uv - 0.5) * vec2(1.1, 1.0));
        return vec4(c * (1.04 - 0.35 * v * v) * vec3(1.0, 1.0, 1.04), 1.0);
      }`,
  },
};
