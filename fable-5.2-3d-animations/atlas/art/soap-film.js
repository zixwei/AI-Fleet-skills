// Art style 31: Soap film. Inputs C N (colour, normals).
// Each surface is a thin film. The film thickness decides its colour by interference (a red, a green and a blue wave each
// brighten or cancel). The film is thin at the top of each form and thick at the bottom, so the bands drain downward;
// the bands drift down with time and swirl. The surface behind shows through; the film adds a sheen that is brighter at grazing angles.
window.ARTS = window.ARTS || {};
ARTS['soap-film'] = {
  id: 'soap-film', name: 'Soap film', group: 'Light makes the picture', inputs: 'C N',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float bg = step(0.9999, texture2D(tDepth, uv).x);
        vec3 n = normalize(texture2D(tNormal, uv).rgb * 2.0 - 1.0);   // view space: x right, y up, z to the camera
        float cosT = clamp(abs(n.z), 0.0, 1.0);
        // swirl: the film pattern is turned by an angle that changes with place and time
        vec2 p = fc / uRes.y;
        float ang = 2.4 * (fbm(p * 1.3 + vec2(3.0, uTime * 0.04)) - 0.5) + 0.25 * sin(uTime * 0.22);
        vec2 q = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * (p * 2.6);
        float swirl = fbm(q + vec2(0.0, uTime * 0.05)) - 0.5;
        // film thickness in nm: thin at the top of a form (n.y > 0), thick at the bottom, drains downward with time
        float drain = 0.5 - 0.5 * cos(6.2832 * 0.8 * (p.y + uTime * 0.035));   // bounded, and a function of (y + speed * t): the bands move down
        float thick = 190.0 + 330.0 * (0.5 - 0.5 * n.y) + 260.0 * swirl + 400.0 * drain;
        // thin film: reflected light of each wave, with a half-wave loss at the first surface (black film when thickness is 0)
        float ct = sqrt(1.0 - (1.0 - cosT * cosT) / 1.769);            // angle inside the film (index 1.33)
        vec3 lam = vec3(650.0, 540.0, 450.0);
        vec3 film = 0.5 + 0.5 * cos(4.0 * 3.14159 * 1.33 * thick * ct / lam + 3.14159);
        film = pow(max(film, vec3(0.0)), vec3(1.8)) * 1.25;
        // what the film reflects: a bright soft box up and left, a dim sky, and strong reflection at grazing angles
        vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
        float box = pow(max(dot(r, normalize(vec3(-0.5, 0.7, 0.5))), 0.0), 5.0);
        float env = 0.3 + 0.55 * smoothstep(-0.4, 0.9, r.y) + 1.3 * box;
        float fres = 0.12 + 0.88 * pow(1.0 - cosT, 3.0);
        vec3 behind = pow(clamp(texture2D(tColor, uv).rgb, 0.0, 1.0), vec3(1.0, 1.0, 1.0));
        vec3 col = behind * 0.42 + film * env * (0.45 + 1.3 * fres);
        col += vec3(1.0) * box * 0.35 * fres;
        // the dark studio around: a faint gradient
        vec3 dark = vec3(0.012, 0.016, 0.03) * (1.0 + 2.0 * uv.y);
        col = mix(col, dark, bg);
        return vec4(col * 1.25, 1.0);
      }`,
  },
};
