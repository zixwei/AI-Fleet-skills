// Art style 97: Low-poly facets. Input M (material hook). No post shader (the post below only passes the picture through: tools/test.mjs wants a postFX).
// Version of the first-set style 'low-poly' without its topic. Every standard material becomes flat-shaded facets:
//  - Facets: the object-space position is cut by a Kuhn triangulation (cubes split into 6 simplices) of a slightly warped lattice, so the
//    surface breaks into straight-edged triangles and quads of irregular size. The lattice is in object space, so facets move with the object.
//    The cell size grows with the size of the mesh (0.5 x radius^0.55), so a house and a floor both read as low-poly.
//  - Shading: the world normal snaps to the nearest of 38 directions (cube axes, icosahedron vertices, dodecahedron vertices), which turns a
//    sphere into flat patches, then each facet tilts it by its own hash (0.45), so every facet gets one flat tone under the scene lights.
//  - Colour: the albedo goes to the nearest of 5 palette colours (sand, coral, cream, teal, sage) by hue and brightness, keeps its tone, and each
//    facet shifts by a small random amount (about 6 % in tone and a little in hue).
// This differs from Voxel cells (row 23): triangles and polygons with lit, flat shading instead of cubes with a bevel and an axis-face shade.
// Not changed: Basic, Lambert and Phong materials, sprites and label meshes.
window.ARTS = window.ARTS || {};
(function () {
  // a vertex attribute with the lattice scale (1 / cell) for a geometry, from its bounding sphere
  function addScale(g) {
    if (g.attributes.aLpC) return;
    g.computeBoundingSphere();
    const r = Math.max(g.boundingSphere ? g.boundingSphere.radius : 1, 0.05), cell = Math.min(Math.max(0.5 * Math.pow(r, 0.55), 0.08), 4);
    const n = g.attributes.position.count, a = new Float32Array(n).fill(1 / cell);
    g.setAttribute('aLpC', new window.THREE.BufferAttribute(a, 1));
  }
  const HELP = `
    varying vec3 vLpP;
    vec3 lpH = vec3(0.5);
    vec3 lpHash(vec3 p){ p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }
    vec3 lpSnap(vec3 n){
      vec3 best = vec3(0.0, 1.0, 0.0); float bd = -2.0;
      const float PH = 1.6180339;
      for (int k = 0; k < 38; k++) {
        vec3 d;
        if (k < 6) d = k == 0 ? vec3(1.0, 0.0, 0.0) : k == 1 ? vec3(-1.0, 0.0, 0.0) : k == 2 ? vec3(0.0, 1.0, 0.0) : k == 3 ? vec3(0.0, -1.0, 0.0) : k == 4 ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 0.0, -1.0);
        else if (k < 18) { int j = k - 6; float s1 = (j / 2 - (j / 4) * 2) == 0 ? 1.0 : -1.0, s2 = (j - (j / 2) * 2) == 0 ? 1.0 : -1.0; int ax = j / 4; d = ax == 0 ? vec3(0.0, s1, s2 * PH) : ax == 1 ? vec3(s1, s2 * PH, 0.0) : vec3(s2 * PH, 0.0, s1); }
        else if (k < 26) { int j = k - 18; d = vec3((j - (j / 2) * 2) == 0 ? 1.0 : -1.0, ((j / 2) - (j / 4) * 2) == 0 ? 1.0 : -1.0, (j / 4) == 0 ? 1.0 : -1.0); }
        else { int j = k - 26; float s1 = (j / 2 - (j / 4) * 2) == 0 ? 1.0 : -1.0, s2 = (j - (j / 2) * 2) == 0 ? 1.0 : -1.0; int ax = j / 4; d = ax == 0 ? vec3(0.0, s1 / PH, s2 * PH) : ax == 1 ? vec3(s1 / PH, s2 * PH, 0.0) : vec3(s2 * PH, 0.0, s1 / PH); }
        d = normalize(d);
        float s = dot(d, n);
        if (s > bd) { bd = s; best = d; }
      }
      return best;
    }
    float lpHue(vec3 g){
      float mx = max(g.r, max(g.g, g.b)), mn = min(g.r, min(g.g, g.b)), d = max(mx - mn, 1e-4);
      float h = mx == g.r ? mod((g.g - g.b) / d, 6.0) : mx == g.g ? (g.b - g.r) / d + 2.0 : (g.r - g.g) / d + 4.0;
      return fract(h / 6.0);
    }
    // nearest palette colour by hue and brightness, in gamma space; the tone of the original is kept
    vec3 lpPalette(vec3 g){
      const vec3 SAND = vec3(0.91, 0.83, 0.63), CORAL = vec3(0.88, 0.48, 0.37), CREAM = vec3(0.98, 0.97, 0.945), TEAL = vec3(0.25, 0.65, 0.64), SAGE = vec3(0.56, 0.70, 0.49);
      float mx = max(g.r, max(g.g, g.b)), mn = min(g.r, min(g.g, g.b)), sat = (mx - mn) / max(mx, 1e-3), L = dot(g, vec3(0.3, 0.59, 0.11)), h = lpHue(g);
      vec3 hueC = (h < 0.07 || h > 0.92) ? CORAL : h < 0.19 ? SAND : h < 0.45 ? SAGE : h < 0.72 ? TEAL : CORAL;
      vec3 neutral = L > 0.72 ? CREAM : L > 0.42 ? SAND : TEAL;
      vec3 p = mix(neutral, hueC, smoothstep(0.1, 0.28, sat));
      float Lp = dot(p, vec3(0.3, 0.59, 0.11));
      return p * mix(1.0, clamp(L / Lp, 0.3, 1.2), 0.8);
    }`;
  ARTS['low-poly-facets'] = {
    id: 'low-poly-facets', name: 'Low-poly facets', group: 'The picture is bent', inputs: 'M',
    material(m, mesh, S) {
      if (!m.isMeshStandardMaterial) return;
      // every mesh that uses this material needs the lattice scale on its geometry (the hook is called once for each material)
      S.scene.traverse(o => { if (o.isMesh && !o.userData.isLabel && [].concat(o.material).includes(m)) addScale(o.geometry); });
      K.patchMaterial(m, shader => {
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nattribute float aLpC;\nvarying vec3 vLpP;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLpP = position * aLpC;');
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <common>', '#include <common>\n' + HELP)
          .replace('#include <color_fragment>', `#include <color_fragment>
            {
              vec3 lp = vLpP;
              lp += 0.3 * vec3(sin(lp.y * 1.3 + lp.z * 0.9), sin(lp.z * 1.1 + lp.x * 1.4), sin(lp.x * 1.2 + lp.y * 0.8));   // irregular lattice
              vec3 lc = floor(lp), lf = fract(lp);
              float lperm = step(lf.y, lf.x) + 2.0 * step(lf.z, lf.y) + 4.0 * step(lf.x, lf.z);                           // which of the 6 simplices
              lpH = lpHash(lc + lperm * 3.7);
              vec3 lg = lpPalette(pow(clamp(diffuseColor.rgb, 0.0, 1.0), vec3(1.0 / 2.2)));
              lg *= 1.0 + (lpH.x - 0.5) * 0.17;
              lg += (lpH.yzx - 0.5) * 0.035;
              diffuseColor.rgb = pow(clamp(lg, 0.0, 1.0), vec3(2.2));
            }`)
          .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = 0.92;')
          .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = 0.0;')
          .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
            {
              vec3 lnw = (vec4(normal, 0.0) * viewMatrix).xyz;
              vec3 lnf = normalize(lpSnap(normalize(lnw)) + 0.45 * (lpH * 2.0 - 1.0));
              normal = normalize((viewMatrix * vec4(lnf, 0.0)).xyz);
            }`);
      });
    },
    post: { fragment: 'vec4 postFX(vec2 uv){ return texture2D(tColor, uv); }' },
  };
})();
