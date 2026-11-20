// Art style 92: Motion echoes. Input X (the scene rendered at other times).
// Mode 'echo' of the kit: it renders the live frame at t (tCur), then 6 earlier renders in [t - span, t] (camera fixed at its pose at t). From each earlier
// render it keeps only the pixels that are nearer to the camera than the live render at that pixel: those are the earlier positions of moving objects.
// tColor = (sum of the colours of those pixels in rgb, their count in a), so the echo keeps the own colour of the object. The live object stays solid;
// the copies are drawn over the live frame at up to 50 % strength, stronger where more of the 6 earlier renders agree.
window.ARTS = window.ARTS || {};
ARTS['motion-echoes'] = {
  id: 'motion-echoes', name: 'Motion echoes', group: 'The picture is bent', inputs: 'X',
  x: { n: 7, still: 7, span: 2.0, mode: 'echo', fixCamera: true },   // still = 7: a still has the same renders as live play
  post: {
    fragment: `
      vec4 postFX(vec2 uv){
        vec4 A = texture2D(tColor, uv);
        vec3 C = texture2D(tCur, uv).rgb;
        float k = A.a / (uXn - 1.0);                              // share of the earlier renders that have an object here
        vec3 Ec = A.rgb / max(A.a, 1e-3);                         // its mean colour
        return vec4(mix(C, Ec, 0.5 * smoothstep(0.0, 0.35, k)), 1.0);
      }`,
  },
};
