// Art style 13: Cross-contour. Inputs D W (depth, world position).
// No shading and no outline. Each form shows only as level lines: the slices of the world by planes of equal height (a plane tilted a little,
// so that flat ground also gets sparse lines), like a contour map drawn on the object. Every fifth line is an index line and is heavier.
// The lines are fixed in the world, so they stay on the object when the camera moves. Lines closer than about 3.5 px fade out instead of turning to grey.
window.ARTS = window.ARTS || {};
ARTS['cross-contour'] = {
  id: 'cross-contour', name: 'Cross-contour', group: 'The marks follow the surface', inputs: 'D W',
  post: {
    uniforms: { uPeriod: { value: 0.1 } },   // world units between two level lines
    fragment: `
      uniform float uPeriod;
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      vec4 postFX(vec2 uv){
        vec2 fc = uv * uRes; float sc = uRes.y / 720.0;
        float far = step(0.9999, texture2D(tDepth, uv).x);
        vec3 P = worldPos(uv);
        float f = dot(P, normalize(vec3(0.03, 1.0, 0.02))) / uPeriod + 0.318;
        float idx = floor(f + 0.5);
        float dl = abs(f - idx);                                  // distance to the nearest line, in line units
        float fw = max(fwidth(f), 0.004);                         // lines per pixel: 1/fw pixels between two lines
        float major = step(mod(idx, 5.0), 0.5);
        float half_ = (0.75 + 0.9 * major) * sc;                  // half width of the pen line, in pixels
        float ink = 1.0 - smoothstep(half_ - 0.6, half_ + 0.6, dl / fw);
        ink *= smoothstep(0.5, 0.26, fw / sc) * (1.0 - far);       // fade where lines are denser than about 3.5 px
        ink *= 0.88 + 0.12 * vn(fc / sc * 0.7);                    // the pen is not perfectly even
        vec3 paper = vec3(0.955, 0.935, 0.885) * (0.96 + 0.05 * vn(fc / sc * 0.6) + 0.03 * h21(floor(fc / sc)));
        vec3 pen = vec3(0.05, 0.045, 0.06);
        return vec4(mix(paper * 2.2, pen, clamp(ink, 0.0, 1.0)), 1.0);
      }`,
  },
};
