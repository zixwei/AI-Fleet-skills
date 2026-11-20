// Art style 3: Darkroom print. Inputs C B (colour, beat times).
// White photo paper in a tray under red light. At each beat the picture develops: the dark areas appear first, then the mid tones.
window.ARTS = window.ARTS || {};
ARTS['darkroom-print'] = {
  id: 'darkroom-print', name: 'Darkroom print', group: 'The medium changes with time', inputs: 'C B',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        float age = beatAge();
        float prog = clamp(age / 1.9, 0.0, 1.0);                 // development: 1.9 s from the beat, then the print rests
        // the paper sits in a tray of developer: its picture is seen through a rippling liquid surface
        vec2 rip = vec2(fbm(fc * 0.012 + vec2(uTime * 0.5, 0.0)), fbm(fc * 0.012 + vec2(7.0, uTime * 0.45))) - 0.5;
        float agit = 1.0 - smoothstep(0.0, 1.6, age);            // the tray is rocked at the beat
        vec2 suv = uv + rip * (3.0 + 14.0 * agit) * px;
        // paper rectangle: 6 % margin, with a white border of 22 px
        vec2 lo = vec2(0.06, 0.07), hi = vec2(0.94, 0.93);
        vec2 inP = step(lo, suv) * step(suv, hi);
        float onPaper = inP.x * inP.y;
        vec2 pe = min(suv - lo, hi - suv) * uRes;
        float border = onPaper * (1.0 - smoothstep(20.0, 23.0, min(pe.x, pe.y)));
        // the image: a black and white print of the scene, in gamma space with some contrast
        vec3 c = texture2D(tColor, uv).rgb;
        float g = pow(clamp(lum(c), 0.0, 1.0), 1.0 / 2.2);
        g = smoothstep(0.0, 1.0, clamp((g - 0.38) / 0.58, 0.0, 1.0));  // stretch: the scenes are bright, a print needs a full range
        float dens = 1.0 - g;                                    // 1 = black silver
        // development: the darkest tones start first, the mid tones follow. Uneven chemistry shifts the start by place.
        float te = (1.0 - dens) * 0.62 + (fbm(fc * 0.006 + 2.0) - 0.5) * 0.14;
        float shown = smoothstep(te, te + 0.3, prog * 1.0 + 0.001);
        shown *= smoothstep(0.0, 0.12, prog);                    // before the first moment the paper is blank
        float silver = dens * shown;
        silver += 0.025 * (vn(fc * 0.9) - 0.5) * shown;          // grain
        float paper = (1.0 - clamp(silver, 0.0, 1.0));
        paper = mix(paper, 0.94 - 0.02 * fbm(fc * 0.03), border);
        // red safelight: everything is red. Paper is the lightest thing; black silver is deep maroon.
        vec3 red = vec3(0.4, 0.005, 0.002);
        vec3 col = red * (0.03 + 1.05 * paper);
        // the tray: near-black plastic with a wet red gloss, a raised rim, and the lamp reflected in the liquid
        float ti = 1.0 - onPaper;
        vec2 e = min(fc, uRes - fc);
        float rimd = min(e.x, e.y);
        vec3 tray = vec3(0.05, 0.008, 0.006) * (0.7 + 0.6 * fbm(fc * 0.02));
        tray += red * 0.1 * smoothstep(0.7, 0.0, length((uv - vec2(0.82, 0.18)) * vec2(1.4, 1.0)));   // lamp glint
        tray += red * 0.06 * smoothstep(0.35, 0.65, fbm(fc * 0.004 + vec2(uTime * 0.1, 2.0)));   // ripple highlights
        tray *= 0.8 + 0.5 * smoothstep(44.0, 0.0, rimd);
        tray += red * 0.25 * smoothstep(3.0, 0.0, abs(rimd - 14.0)) + red * 0.12 * smoothstep(3.0, 0.0, abs(rimd - 24.0));   // straight raised rim of the tray
        col = mix(col, tray, ti);
        // the liquid film over the paper: dark where the paper meets the tray, a soft lamp glint on the surface
        col *= 1.0 - 0.45 * onPaper * smoothstep(0.0, 40.0, 40.0 - min(pe.x, pe.y)) * 0.0;
        col += red * 0.1 * onPaper * pow(max(0.0, 1.0 - length((uv - vec2(0.82, 0.18)) * vec2(1.3, 1.0)) * 1.4), 2.0);
        col += red * 0.05 * onPaper * smoothstep(0.4, 0.7, fbm(fc * 0.006 + vec2(uTime * 0.2, 2.0)));
        return vec4(col, 1.0);
      }`,
  },
};
