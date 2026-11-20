// Art style 95: Liquid chrome. Input M (material hook). No post shader (the post below only passes the picture through: tools/test.mjs wants a postFX).
// Every standard material becomes polished chrome: metalness 1, roughness 0.05, a cool white tint (14 % of the original colour stays), no
// emissive. The look is forced inside the shader (K.patchMaterial), because scene update functions write colour and emissive each frame.
// The reflections come from a studio of light panels made once for each stage (PMREM): a big top softbox, two tall side strips, a cool blue
// panel on the left, a warm panel on the right, rim strips behind and a grey floor bounce, in a dark room. A slow, small ripple tilts the
// normal in world space (the 'liquid' part): its time comes from the stage time S.t, set by scene.onBeforeRender.
// Not changed: Basic, Lambert and Phong materials, sprites, label meshes (the kit never offers them).
window.ARTS = window.ARTS || {};
(function () {
  const studios = new WeakMap();   // one studio and one time uniform for each stage S
  function studio(S) {
    let st = studios.get(S);
    if (st) return st;
    const T = S.THREE, env = new T.Scene();
    env.add(new T.Mesh(new T.BoxGeometry(24, 24, 24), new T.MeshBasicMaterial({ color: new T.Color(0.1, 0.11, 0.135), side: T.BackSide, toneMapped: false })));
    // [x, y, z, width, height, r, g, b, intensity]: each panel faces the middle of the room
    const panels = [
      [0, 11.5, 0, 12, 7, 1, 1, 1, 9], [0, 11.5, -8, 10, 3, 1, 1, 1, 6],
      [-11.5, 2, 2, 3, 12, 1, 1, 1, 10], [11.5, 2, -3, 3, 12, 1, 1, 1, 10],
      [-11.5, 3, -7, 6, 4, 0.55, 0.78, 1, 6], [11.5, 4, 6, 6, 4, 1, 0.72, 0.45, 6],
      [0, 3, -11.5, 14, 2, 1, 1, 1, 7], [-6, 6, 11.5, 2, 8, 1, 1, 1, 6], [7, 5, 11.5, 2, 8, 1, 1, 1, 6],
      [0, -11.5, 0, 20, 20, 0.7, 0.7, 0.72, 0.5],
      [0, 0.5, -11.8, 24, 2.2, 1, 1, 1, 1.8], [-11.8, 0.5, 0, 2.2, 24, 1, 1, 1, 1.8], [11.8, 0.5, 0, 2.2, 24, 1, 1, 1, 1.8], [0, 0.5, 11.8, 24, 2.2, 1, 1, 1, 1.8],
    ];
    panels.forEach(([x, y, z, w, h, r, g, b, k]) => {
      const mat = new T.MeshBasicMaterial({ color: new T.Color(r * k, g * k, b * k), side: T.DoubleSide, toneMapped: false });
      const m = new T.Mesh(new T.PlaneGeometry(w, h), mat);
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    });
    const pm = new T.PMREMGenerator(S.renderer), rt = pm.fromScene(env, 0.0);
    pm.dispose(); S.own(rt);
    env.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
    const uT = { value: 0 };
    const prev = S.scene.onBeforeRender;   // the ripple reads the stage time, set before every render pass
    S.scene.onBeforeRender = function (...a) { uT.value = S.t || 0; if (prev) prev.apply(this, a); };
    st = { tex: rt.texture, uT };
    studios.set(S, st);
    return st;
  }
  ARTS['liquid-chrome'] = {
    id: 'liquid-chrome', name: 'Liquid chrome', group: 'The picture is bent', inputs: 'M',
    material(m, mesh, S) {
      if (!m.isMeshStandardMaterial) return;
      const st = studio(S);
      m.envMap = st.tex; m.envMapIntensity = 1.35;
      K.patchMaterial(m, shader => {
        shader.uniforms.uChromeT = st.uT;
        shader.fragmentShader = 'uniform float uChromeT;\n' + shader.fragmentShader
          .replace('#include <color_fragment>', `#include <color_fragment>
            diffuseColor.rgb = mix(vec3(0.90, 0.94, 1.0), diffuseColor.rgb, 0.14);`)
          .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
            roughnessFactor = 0.05;`)
          .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
            metalnessFactor = 1.0;`)
          .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
            totalEmissiveRadiance = vec3(0.0);`)
          .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
            {
              vec3 cwp = (inverse(viewMatrix) * vec4(-vViewPosition, 1.0)).xyz * 1.3;
              vec3 cdn = vec3(sin(cwp.y * 2.1 + cwp.z * 1.3 + uChromeT * 0.9), sin(cwp.z * 1.9 + cwp.x * 1.7 - uChromeT * 0.7), sin(cwp.x * 2.3 + cwp.y * 1.1 + uChromeT * 0.6)) * 0.08;
              normal = normalize(normal + (viewMatrix * vec4(cdn, 0.0)).xyz);
            }`);
      });
    },
    post: { fragment: 'vec4 postFX(vec2 uv){ return texture2D(tColor, uv); }' },
  };
})();
