// Art style 75: Flip sequins. Inputs C B (colour, beat times).
// The picture is a field of two-colour sequins (discs of 9 px at 720p, in hex packing, on a dark backing, each with a dished shading, a glint and a centre hole).
// One face shows the picture colour at the centre of the disc (colour face), the other face shows the same picture as a silver tone with a cool sheen (reverse face).
// At every beat a wave crosses the frame in a direction that changes from beat to beat (each disc has its own small delay): the disc turns about a vertical axis
// in 0.32 s (its width is |cos| of the turn angle, it catches the light edge-on), and after the half turn it shows the other face. Beat 0 shows the colour face; every later beat flips every disc once.
window.ARTS = window.ARTS || {};
ARTS['flip-sequins'] = {
  id: 'flip-sequins', name: 'Flip sequins', group: 'Craft materials', inputs: 'C B',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      const float D = 9.0;
      vec4 postFX(vec2 uv){
        float sc = uRes.y / 720.0; vec2 px = 1.0 / uRes;
        vec2 f = uv * uRes / sc;
        float RH = D * 0.866;
        float rj = floor(f.y / RH + 0.5);
        // nearest disc centre among the rows rj-1 to rj+1 and the two nearest columns
        float best = 1e9; vec2 bc = vec2(0.0), bid = vec2(0.0);
        for (int j = -1; j <= 1; j++) {
          float r = rj + float(j);
          float offx = mod(r, 2.0) * 0.5 * D;
          float c0 = floor((f.x - offx) / D);
          for (int i = 0; i <= 1; i++) {
            vec2 cp = vec2((c0 + float(i) + 0.5) * D + offx, r * RH);
            float dd = dot(f - cp, f - cp);
            if (dd < best) { best = dd; bc = cp; bid = vec2(c0 + float(i), r); }
          }
        }
        vec2 cuv = bc * sc * px;
        float k = beatIdx(), age = beatAge();
        // wave: direction from the beat number, position of the disc along it (0 to 1 over the frame)
        float ang = h21(vec2(max(k, 0.0), 3.0)) * 6.2832;
        vec2 wd = vec2(cos(ang), sin(ang));
        float asp = uRes.x / uRes.y;
        vec2 pp = cuv * vec2(asp, 1.0);
        float smin = min(0.0, asp * wd.x) + min(0.0, wd.y), smax = max(0.0, asp * wd.x) + max(0.0, wd.y);
        float s = (dot(pp, wd) - smin) / (smax - smin);
        float tau = k < 0.0 ? 1.0 : clamp((age - s * 1.1 - 0.06 * h21(bid)) / 0.32, 0.0, 1.0);
        tau = tau * tau * (3.0 - 2.0 * tau);
        float th = 3.14159 * tau;
        float newFace = mod(max(k, 0.0), 2.0), oldFace = k < 0.5 ? newFace : 1.0 - newFace;   // beat 0 only shows the colour face
        float face = (th < 1.5708) ? oldFace : newFace;
        float cw = max(abs(cos(th)), 0.22);                                  // apparent width of the disc
        // disc coordinates: x is squeezed by the turn
        vec2 lp = (f - bc) / (D * 0.5 * 0.94);
        vec2 ep = vec2(lp.x / cw, lp.y);
        float rad = length(ep);
        float cover = 1.0 - smoothstep(0.92, 1.0, rad);
        vec3 t5 = texture2D(tColor, cuv).rgb * 2.0;                          // the disc colour: 6 taps, so that one noisy texel does not recolour a disc
        for (int q = 0; q < 4; q++) { float a = float(q) * 1.5708 + 0.785; t5 += texture2D(tColor, cuv + vec2(cos(a), sin(a)) * 2.5 * sc * px).rgb; }
        vec3 tc = pow(clamp(t5 / 6.0, 0.0, 1.0), vec3(1.0 / 2.2));
        float L = lum(tc);
        vec3 colFace = max(mix(vec3(L), tc, 1.4), 0.0);
        vec3 metFace = vec3(clamp((L - 0.65) * 2.6 + 0.62, 0.0, 1.0)) * vec3(0.82, 0.9, 1.0) * 1.05 + (tc - L) * 0.35 + vec3(0.85, 0.9, 1.0) * 0.1;     // the reverse: a silver rendering of the picture
        vec3 fcol = face < 0.5 ? colFace : metFace;
        // dished shading: darker toward the rim at the lower right, a glint at the upper left
        vec2 g = ep - vec2(-0.35, 0.35);
        float dish = 1.0 - 0.35 * smoothstep(0.3, 1.0, rad) * (0.5 - 0.5 * dot(normalize(ep + 1e-4), vec2(-0.6, 0.8)));
        float glint = (1.0 - smoothstep(0.0, 0.42, length(g))) * (face < 0.5 ? 0.45 : 0.9);
        float edgeOn = (sin(th) * sin(th));
        fcol = fcol * dish * (0.9 + 0.2 * h21(bid + 1.0)) + vec3(1.0, 0.97, 0.9) * (glint * cw + 0.85 * edgeOn * (1.0 - 0.4 * rad));
        fcol *= 1.0 - 0.8 * (1.0 - smoothstep(0.08, 0.17, rad));            // centre hole
        vec3 pc0 = pow(clamp(texture2D(tColor, uv).rgb, 0.0, 1.0), vec3(1.0 / 2.2));     // the backing takes the colour of its own pixel, not of a disc: a pixel on the line between two discs is the same whichever disc wins
        vec3 back = mix(vec3(0.07, 0.06, 0.09) + 0.1 * pc0, 0.3 + 0.5 * pc0, edgeOn * 0.0);     // edge-on discs between the turning ones catch the light
        vec3 col = mix(back, fcol, cover);
        return vec4(pow(clamp(col, 0.0, 1.6), vec3(2.2)) * 1.1, 1.0);
      }`,
  },
};
