// Art style 80: Soft clay (version of the first-set style "soft-clay"). Inputs M S (material hook, frame step).
// Every lit material becomes plasticine: matt (roughness 0.7, no metal, no clear coat, no sheen), saturated (chroma x1.4 in the shader), with thumb dents and fingerprint ridges
// (a normal perturbation from 3D noise in the object's own space, so the marks stay on the surface as it moves), and lumpy: the vertices move along a smooth 3D vector field
// of the object's position (no cracks at hard edges), 0.022 world units of static lopsidedness plus a boil of 0.012 that changes at each step.
// S: time steps on twos, 12 frames per second (art.fps = 12), and the boil phase changes with the step, like stop-motion.
// The post pass does not change the picture (an art style needs one), so the look comes only from the materials.
window.ARTS = window.ARTS || {};
(() => {
  const STEP = { value: 0 };                       // the step number, shared by all clay materials (set in material.onBeforeRender)
  ARTS['soft-clay'] = {
    id: 'soft-clay', name: 'Soft clay', group: 'Craft materials', inputs: 'M S',
    fps: 12,
    material(m, mesh, S) {
      if (!(m.isMeshStandardMaterial || m.isMeshPhongMaterial || m.isMeshLambertMaterial)) return;
      if (m.isMeshStandardMaterial) {
        m.roughness = 0.7; m.metalness = 0; m.roughnessMap = null; m.metalnessMap = null;
        if ('clearcoat' in m) m.clearcoat = 0;
        if ('sheen' in m) m.sheen = 0;
      }
      if (m.isMeshPhongMaterial) { m.shininess = 6; m.specular.setScalar(0.03); }
      const prev = m.onBeforeRender;
      m.onBeforeRender = function () { STEP.value = Math.floor(S.t * 12 + 1e-4); if (prev) prev.apply(this, arguments); };
      K.patchMaterial(m, shader => {
        shader.uniforms.uClayStep = STEP;
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', `#include <common>
            uniform float uClayStep; varying vec3 vClayP; varying float vClayS;`)
          .replace('#include <begin_vertex>', `#include <begin_vertex>
            float clayS = max(length(modelMatrix[0].xyz), 1e-4);
            vClayP = position; vClayS = clayS;
            vec3 cp = position * clayS;
            float ph = uClayStep * 2.17;
            vec3 lump = vec3(sin(cp.y * 4.1 + cp.z * 2.3 + 1.3) * sin(cp.x * 3.3 - 0.7), sin(cp.z * 3.7 + cp.x * 2.9 + 4.1) * sin(cp.y * 2.7 + 2.2), sin(cp.x * 4.3 + cp.y * 3.1) * sin(cp.z * 3.1 + 5.2));
            vec3 boil = vec3(sin(cp.y * 6.1 + ph * 1.1 + cp.z * 3.0), sin(cp.z * 5.3 + ph * 1.7 + cp.x * 2.0), sin(cp.x * 5.9 + ph * 1.3 + cp.y * 2.5));
            transformed += (lump * 0.022 + boil * 0.012) / clayS;`);
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <common>', `#include <common>
            varying vec3 vClayP; varying float vClayS;
            float cH(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
            float cN(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
              return mix(mix(mix(cH(i), cH(i + vec3(1, 0, 0)), f.x), mix(cH(i + vec3(0, 1, 0)), cH(i + vec3(1, 1, 0)), f.x), f.y),
                         mix(mix(cH(i + vec3(0, 0, 1)), cH(i + vec3(1, 0, 1)), f.x), mix(cH(i + vec3(0, 1, 1)), cH(i + vec3(1, 1, 1)), f.x), f.y), f.z); }
            // height of the marks in world units: thumb dents (round, 4 to 8 cm), fingerprint ridges (whorls, 5 mm) in patches, a little grain
            float clayH(vec3 p){
              float d = smoothstep(0.58, 0.8, cN(p * 3.1 + 7.0));
              float whorl = sin(cN(p * 5.5) * 70.0);
              float pat = smoothstep(0.45, 0.65, cN(p * 1.9 + 3.0));
              return -0.03 * d + 0.0035 * whorl * pat + 0.0018 * cN(p * 38.0);
            }`)
          .replace('#include <color_fragment>', `#include <color_fragment>
            { float lc = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)); diffuseColor.rgb = max(mix(vec3(lc), diffuseColor.rgb, 1.4), 0.0); }`)
          .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
            {
              float ch = clayH(vClayP * vClayS);
              vec2 dH = vec2(dFdx(ch), dFdy(ch));
              vec3 sx = dFdx(-vViewPosition), sy = dFdy(-vViewPosition);
              vec3 R1 = cross(sy, normal), R2 = cross(normal, sx);
              float det = dot(sx, R1);
              vec3 grad = sign(det) * (dH.x * R1 + dH.y * R2);
              normal = normalize(abs(det) * normal - grad);
            }`);
      });
    },
    post: { fragment: 'vec4 postFX(vec2 uv){ return texture2D(tColor, uv); }' },
  };
})();
