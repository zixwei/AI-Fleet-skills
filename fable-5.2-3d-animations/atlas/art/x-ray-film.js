// Art style 34: X-ray film (version of the first-set style "xray"). Input M (materials).
// Every material becomes glowing film: additive, both faces drawn, brighter where the view runs along a surface
// and where many layers add up. Dark scanner background. The post pass only adds film bloom, grain and a cold tint.
window.ARTS = window.ARTS || {};
ARTS['x-ray-film'] = {
  id: 'x-ray-film', name: 'X-ray film', group: 'Light makes the picture', inputs: 'M',
  labels: 'halo',
  // M: the hook also makes the scene background dark (the scene sky would add to the film). Labels keep their own pass.
  material(m, mesh, S) {
    const T = S.THREE;
    S.scene.background = new T.Color('#02060a'); S.scene.fog = null;
    // Labels are drawn on top of the dark scanner bed. A label whose opaque pixels are mostly dark (dark text with no pill)
    // would vanish, so its colour is inverted once. Light labels (pills, white titles) are left alone.
    const mostlyDark = lm => {
      try {
        const cv = lm.map.image, d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
        let n = 0, sum = 0;
        for (let i = 0; i < d.length; i += 16) if (d[i + 3] > 128) { n++; sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; }
        return n > 0 && sum / n / 255 < 0.4;
      } catch (e) { return false; }
    };
    S.scene.traverse(o => {
      if (!(o.isMesh && o.userData.isLabel)) return;
      for (const lm of [].concat(o.material)) {
        if (!lm || lm.userData.xrayLabel) continue;
        lm.userData.xrayLabel = true;
        if (!mostlyDark(lm)) continue;
        K.patchMaterial(lm, shader => {
          shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>',
            'outgoingLight = (vec3(1.0) - clamp(outgoingLight, 0.0, 1.0)) * vec3(0.78, 0.92, 1.0); #include <opaque_fragment>'.replace('; #include', ';\n#include'));
        });
      }
    });
    m.transparent = true; m.blending = T.AdditiveBlending; m.depthWrite = false; m.side = T.DoubleSide;
    if (m.isShaderMaterial) return;
    K.patchMaterial(m, shader => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', 'varying vec3 xN; varying vec3 xV;\n#include <common>')
        .replace('#include <project_vertex>', `#include <project_vertex>
          vec3 xn0 = normal;
          #ifdef USE_INSTANCING
            xn0 = mat3(instanceMatrix) * xn0;
          #endif
          xN = normalMatrix * xn0; xV = -mvPosition.xyz;`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', 'varying vec3 xN; varying vec3 xV;\n#include <common>')
        .replace('#include <opaque_fragment>', `float xa = diffuseColor.a;
          float xf = 1.0 - abs(dot(normalize(xN), normalize(xV)));
          outgoingLight = vec3(0.62, 0.83, 1.0) * (0.03 + pow(xf, 2.2)) * 0.5 * xa;
          diffuseColor.a = 1.0;
          #include <opaque_fragment>`);
    });
  },
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        vec3 c = texture2D(tColor, uv).rgb, b = vec3(0.0);
        for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) b += texture2D(tColor, uv + vec2(float(i), float(j)) * px * 5.0).rgb;
        b /= 25.0;
        float g = h21(fc + fract(uTime * 7.0) * 100.0) - 0.5;      // film grain, new every frame
        vec2 v = uv - 0.5; float vig = clamp(1.0 - dot(v, v) * 1.3, 0.0, 1.0);
        // a wide local mean: a large flat floor is one tone, so it drops to the black point and only edges and overlaps glow
        vec3 b2 = vec3(0.0);
        for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) b2 += texture2D(tColor, uv + vec2(float(i), float(j)) * px * 26.0).rgb;
        b2 /= 25.0;
        vec3 o = max(c + b - 2.0 * min(b2, c), 0.0) * 1.8 * vig;
        o *= 1.0 + 0.25 * g;
        o += 0.004 * (g + 0.5);
        return vec4(max(o, 0.0) * vec3(0.92, 1.0, 1.12), 1.0);
      }`,
  },
};
