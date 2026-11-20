// Art style 14: Charcoal. Inputs C N (colour, normals).
// Broad strokes lie along each surface (streaks of the surface tangent). Charcoal sits on the peaks of a rough paper tooth.
// A finger smudge drags the dark tone along the surface, away from the light side (upper left on the screen).
window.ARTS = window.ARTS || {};
ARTS['charcoal'] = {
  id: 'charcoal', name: 'Charcoal', group: 'The marks follow the surface', inputs: 'C N',
  post: {
    normals: true,
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      const vec2 DEF = vec2(0.94, 0.34);
      const vec2 TOLIGHT = vec2(-0.6, 0.8);   // on the screen, towards the light (y up in uv)
      vec3 nrm(vec2 uv){ return texture2D(tNormal, uv).rgb * 2.0 - 1.0; }
      vec2 turn(vec3 n, vec2 ref){
        vec2 t = vec2(-n.y, n.x); float m = length(t);
        t = m > 1e-4 ? t / m : ref;
        if (dot(t, ref) < 0.0) t = -t;
        return normalize(mix(ref, t, smoothstep(0.05, 0.35, m)));
      }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float dark(vec3 c){ return clamp((1.0 - pow(clamp(lum(c), 0.0, 1.0), 0.4545)) / 0.9, 0.0, 1.0); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        vec3 c0 = texture2D(tColor, uv).rgb, n0 = nrm(uv);
        float D0 = dark(c0);
        vec2 d0 = turn(n0, DEF);
        // broad strokes: streak noise along the surface, wide cells and a long path
        float ns = h21(floor(fc / (8.0 * sc))), ws = 1.0;
        // finger smudge: dark tone taken from the side of the light along the surface, dragged downstream (away from the light)
        vec2 ds = dot(d0, TOLIGHT) < 0.0 ? -d0 : d0;
        float sm = 0.0, sw = 0.0;
        for (int s = 0; s < 2; s++) {
          vec2 p = uv, d = s == 0 ? d0 : -d0; vec3 np = n0, cp = c0; float alive = 1.0;
          for (int k = 1; k <= 10; k++) {
            p += d * 4.0 * sc * px;
            vec3 nq = nrm(p), cq = texture2D(tColor, p).rgb;
            alive *= step(0.84, dot(nq, np)) * step(length(cq - cp), 0.12 + 0.25 * length(cp));
            np = nq; cp = cq; d = turn(nq, d);
            float w = alive * (1.0 - float(k) / 11.0);
            ns += w * h21(floor(p * uRes / (8.0 * sc))); ws += w;
          }
        }
        ns = clamp(0.5 + (ns / ws - 0.5) * 3.2, 0.0, 1.0);
        {
          vec2 p = uv, d = ds; vec3 np = n0, cp = c0; float alive = 1.0;
          for (int k = 1; k <= 14; k++) {
            p += d * 6.0 * sc * px;
            vec3 nq = nrm(p), cq = texture2D(tColor, p).rgb;
            alive *= step(0.8, dot(nq, np)); np = nq; d = turn(nq, d); if (dot(d, TOLIGHT) < 0.0) d = -d;
            float w = alive * (1.0 - float(k) / 15.0);
            sm += w * dark(cq); sw += w;
          }
        }
        float smear = sw > 0.0 ? sm / sw : D0;
        float Dm = max(D0, smear * 0.9);
        float D = clamp(Dm + (ns - 0.5) * 0.45 * smoothstep(0.05, 0.4, Dm), 0.0, 1.0);
        // rough paper: charcoal stays on the peaks of the tooth
        float tooth = fbm(fc / sc * 0.55) * 0.65 + h21(floor(fc / (1.2 * sc))) * 0.35;
        float ink = smoothstep(tooth - 0.5, tooth + 0.5, D * 1.05) * (0.55 + 0.45 * smoothstep(0.2, 0.8, D));
        float soft = Dm * 1.0 * smoothstep(0.03, 0.4, smear);    // the smudged dust: soft and grainless
        float cover = clamp(ink * 0.85 + soft * 0.6 + 0.12 * Dm * (0.6 + 0.8 * tooth), 0.0, 1.0);
        vec3 paper = vec3(0.93, 0.905, 0.85) * (0.92 + 0.14 * fbm(fc / sc * 0.18 + 5.0) + 0.06 * (tooth - 0.5));
        vec3 coal = vec3(0.02, 0.019, 0.019);
        return vec4(mix(paper, coal, cover) * 2.2, 1.0);
      }`,
  },
};
