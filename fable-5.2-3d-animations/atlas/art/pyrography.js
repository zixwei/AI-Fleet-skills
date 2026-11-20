// Art style 6: Pyrography. Inputs C D N B (colour, depth, normals, beat times).
// The picture is burnt into a wood panel. At each beat the lines glow orange, then cool to a brown burn. The wood grain shows through.
window.ARTS = window.ARTS || {};
ARTS['pyrography'] = {
  id: 'pyrography', name: 'Pyrography', group: 'The medium changes with time', inputs: 'C D N B',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float age = beatAge();
        float hot = exp(-age * 1.5) * (1.0 - smoothstep(2.2, 2.5, age) * 0.0);   // heat: 1 at the beat, about 0.2 after 1 s, cold by 2.5 s
        hot = hot * smoothstep(0.0, 0.06, age + 0.06);
        // ---- wood: long grain along x, growth rings that wander, pores
        float wob = fbm(vec2(fc.x * 0.0018, fc.y * 0.003)) * 38.0 + fbm(vec2(fc.x * 0.012, fc.y * 0.02)) * 6.0;
        float ring = fract((fc.y + wob) * 0.045 + fbm(vec2(fc.x * 0.0009, fc.y * 0.0012)) * 2.0);
        float late = smoothstep(0.55, 0.95, ring) * (1.0 - smoothstep(0.95, 1.0, ring));   // dark late-wood band
        float pores = vn(vec2(fc.x * 0.045, fc.y * 0.9));
        float fibre = vn(vec2(fc.x * 0.01, fc.y * 0.6));
        vec3 wood = mix(vec3(0.80, 0.62, 0.40), vec3(0.60, 0.40, 0.22), late * 0.8);
        wood *= 0.9 + 0.1 * fibre;
        wood *= 1.0 - 0.14 * smoothstep(0.62, 0.9, pores) * (0.4 + late);
        // ---- what is burnt: outlines, and tone as hatching
        vec3 n0 = texture2D(tNormal, uv).rgb * 2.0 - 1.0;
        float d0 = dd(uv), de = 0.0, ne = 0.0;
        for (int i = 0; i < 8; i++) {
          float a = float(i) * 0.7854;
          vec2 o = vec2(cos(a), sin(a)) * px * (i < 4 ? 1.3 : 2.2);
          de = max(de, abs(dd(uv + o) - d0) / d0);
          ne = max(ne, 1.0 - dot(n0, texture2D(tNormal, uv + o).rgb * 2.0 - 1.0));
        }
        float outline = max(smoothstep(0.012, 0.035, de), smoothstep(0.3, 0.6, ne) * 0.85);
        vec3 c = texture2D(tColor, uv).rgb;
        float tone = 1.0 - pow(clamp(lum(c), 0.0, 1.0), 1.0 / 2.2);
        tone = clamp((tone - 0.06) * 1.5, 0.0, 1.0);
        // hatching across the grain: the line gets wider where the picture is darker
        float stripe = 0.5 + 0.5 * cos(6.2832 * (fc.x * 0.6 + fc.y * 0.8) / 7.0 + 1.5 * fbm(fc * 0.03));
        float hatch = smoothstep(1.0 - tone * 1.15, 1.0 - tone * 1.15 + 0.22, stripe) * step(0.07, tone);
        // a second layer of hatching in the darkest parts
        float stripe2 = 0.5 + 0.5 * cos(6.2832 * (fc.x * 0.6 - fc.y * 0.8) / 7.0);
        hatch = max(hatch, smoothstep(0.6, 0.85, tone) * smoothstep(1.0 - (tone - 0.6) * 2.5, 1.2 - (tone - 0.6) * 2.5, stripe2));
        float burn = max(outline, hatch * 0.9);
        // the burn follows the grain: the pen goes deeper into the dark late-wood and pores, lighter on the early wood
        burn *= 0.78 + 0.35 * late + 0.22 * (1.0 - fibre) - 0.2 * smoothstep(0.7, 0.95, pores);
        burn = clamp(burn, 0.0, 1.0);
        vec3 burnt = mix(vec3(0.28, 0.14, 0.06), vec3(0.09, 0.04, 0.02), burn);
        burnt *= 0.85 + 0.3 * fibre;                           // the grain shows through the char
        vec3 col = mix(wood, burnt, smoothstep(0.0, 0.7, burn) * (0.88 + 0.1 * burn));
        // scorched halo around every burnt line
        col *= 1.0 - 0.08 * smoothstep(0.0, 0.5, burn) * (1.0 - burn);
        // ---- heat: the lines glow orange, hottest at the beat, then cool to brown
        float glow = max(outline * 0.9, hatch * 0.45) * burn * hot;
        vec3 ember = mix(vec3(1.0, 0.28, 0.03), vec3(1.0, 0.72, 0.2), smoothstep(0.55, 1.0, glow));
        vec3 lin = pow(col, vec3(2.2));
        lin *= mix(1.0, 1.9, smoothstep(0.35, 0.7, lum(lin)));
        lin += ember * glow * glow * 4.0 + vec3(1.0, 0.25, 0.04) * glow * 0.5;
        // a faint warm light on the wood near hot lines
        lin += vec3(0.25, 0.08, 0.01) * hot * smoothstep(0.0, 0.5, burn) * 0.4;
        // panel: darker toward the corners
        lin *= 1.0 - 0.38 * smoothstep(0.35, 1.0, length((uv - 0.5) * vec2(1.1, 1.0)) * 1.5);
        return vec4(lin, 1.0);
      }`,
  },
};
