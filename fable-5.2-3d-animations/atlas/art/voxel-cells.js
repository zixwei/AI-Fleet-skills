// Art style 23: Voxel cells. Inputs C W N (colour, world position, normals). Version of the first-set style 'voxel' without its topic.
// The world position snaps to a grid of small cubes. Each cell takes one colour (posterised, from the middle of the cell)
// and the shade of its cube face. A dark bevel line runs between cells, with a light inner edge on the top left.
// The grid is in world space, so the cells stay fixed when the camera moves.
window.ARTS = window.ARTS || {};
ARTS['voxel-cells'] = {
  id: 'voxel-cells', name: 'Voxel cells', group: 'The depth is the material', inputs: 'C W N',
  post: {
    normals: true,
    uniforms: { uCell: { value: 0.3 } },   // world units for each cube
    fragment: `
      uniform float uCell;
      float h31(vec3 p){ p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.x + p.y) * p.z); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes;
        float cs = uCell * max(uFocus / 10.0, 0.3);   // the cube size follows the scene size, but never below 0.3 x the base
        if (texture2D(tDepth, uv).x > 0.9999) {
          // empty background: a soft studio backdrop
          float v = length((uv - 0.5) * vec2(1.3, 1.0));
          return vec4(vec3(0.62, 0.8, 0.84) * (1.25 - 0.5 * v * v) * 1.0, 1.0);
        }
        vec3 P = worldPos(uv), N = worldNormal(uv);
        vec3 an = abs(N);
        // dominant axis of the cube face
        vec3 ax = an.x > an.y ? (an.x > an.z ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 0.0, 1.0)) : (an.y > an.z ? vec3(0.0, 1.0, 0.0) : vec3(0.0, 0.0, 1.0));
        vec3 fn = ax * sign(dot(N, ax));            // face normal of the cube
        // push the point into the surface a little so the cell is the one that holds the surface
        vec3 Pin = P - N * cs * 0.3;
        vec3 id = floor(Pin / cs), ctr = (id + 0.5) * cs;
        // colour: the pixel where the centre of the cell would show, if it is on this surface; else this pixel
        vec3 c0 = texture2D(tColor, uv).rgb;
        mat4 proj = inverse(uProjInv), view = inverse(uViewInv);
        // flat colour per cell: look up the pixel where the middle of the cell face (on the surface side) shows, else the cell middle
        vec3 cc = c0; bool got = false;
        for (int k = 0; k < 2; k++) {
          vec3 pt = k == 0 ? ctr + fn * cs * 0.5 : ctr;
          vec4 pc = proj * view * vec4(pt, 1.0);
          vec2 suv = pc.xy / pc.w * 0.5 + 0.5;
          if (!got && pc.w > 0.0 && suv.x > 0.0 && suv.x < 1.0 && suv.y > 0.0 && suv.y < 1.0 && texture2D(tDepth, suv).x < 0.9999 && abs(linDepth(suv) - linDepth(uv)) < cs * 2.5) { cc = texture2D(tColor, suv).rgb; got = true; }
        }
        // short palette: 4 levels per channel in gamma space, plus a small shade difference for each cube
        vec3 g = pow(clamp(cc, 0.0, 1.0), vec3(1.0 / 2.2));
        float lum = dot(g, vec3(0.3, 0.59, 0.11));
        g = mix(vec3(lum), g, 1.15);
        g = floor(g * 4.0 + 0.5) / 4.0;
        g *= 1.0 + (h31(id) - 0.5) * 0.1;
        // face shade of the cube: top bright, one side medium, the other side dark
        float face = fn.y > 0.5 ? 1.08 : (fn.y < -0.5 ? 0.5 : (abs(fn.x) > 0.5 ? 0.86 : 0.72));
        vec3 col = pow(clamp(g, 0.0, 1.0), vec3(2.2)) * face * 1.05;
        // bevel: distance to the edge of the face in the two other axes (in cells)
        vec3 f = fract(Pin / cs);
        vec3 t = abs(f - 0.5);
        float e1 = ax.x > 0.5 ? max(t.y, t.z) : (ax.y > 0.5 ? max(t.x, t.z) : max(t.x, t.y));   // 0.5 at the face edge
        float w = clamp(fwidth(e1) * 1.5, 0.003, 0.1);
        float bevel = smoothstep(0.5 - 0.035 - w, 0.5 - 0.035 + w, e1);   // 1 on the groove
        float rim = smoothstep(0.5 - 0.15 - w, 0.5 - 0.1 + w, e1) * (1.0 - bevel);
        col *= 1.0 + 0.18 * rim;
        col = mix(col, col * 0.5, bevel);
        return vec4(col, 1.0);
      }`,
  },
};
