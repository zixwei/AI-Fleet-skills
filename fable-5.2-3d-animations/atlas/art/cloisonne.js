// Art style 77: Cloisonné. Inputs C D (colour, depth).
// Gold wire stands on every edge of colour or depth (a bright core with a darker beaded side, a hand-bent wobble) and on every sharp step of tone. The cells between the wire are
// filled with glossy enamel: one saturated deep colour for each cell, the tone posterised in 5 steps, a dome (bright in the middle of a cell, with a meniscus that pools against the
// wire), and a small glint of a fixed light. A soft band of light moves across the enamel: it crosses the frame in 5.5 s (uRealT) and repeats, strongest on the domes.
// Not stained glass: the enamel is opaque and lit from the front, the wire is thin and gold, and there is no lead, no bubble and no back light.
window.ARTS = window.ARTS || {};
ARTS['cloisonne'] = {
  id: 'cloisonne', name: 'Cloisonné', group: 'Craft materials', inputs: 'C D',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float zz(vec2 uv){ return log(min(linDepth(uv), uFocus * 3.0) / uFocus); }
      vec3 gam(vec3 c){ return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2)); }
      float tone(vec3 g){ return floor(lum(g) * 5.0 + 0.5) / 5.0; }
      // does the picture at s differ from the centre (c0, z0, t0) by a colour, depth or tone step?
      bool differs(vec2 s, vec3 c0, float z0, float t0){
        if (abs(zz(s) - z0) > 0.08) return true;
        vec3 g = gam(texture2D(tColor, s).rgb);
        return length(g - c0) > 0.28 || abs(tone(g) - t0) > 0.3;
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        vec2 f = fc / sc;
        // the line is bent a little by hand
        vec2 wob = (vec2(vn(f * 0.05), vn(f * 0.05 + 17.0)) - 0.5) * 2.2 * sc * px;
        vec2 u0 = uv + wob;
        vec3 c0 = gam(texture2D(tColor, u0).rgb); float z0 = zz(u0), t0 = tone(c0);
        // wire: a bright core where an edge lies within 1.5 px, a darker side within 3.1 px
        float core = 0.0, side = 0.0;
        for (int k = 0; k < 8; k++) {
          float a = float(k) * 0.7854 + 0.2; vec2 d = vec2(cos(a), sin(a));
          if (differs(u0 + d * 1.5 * sc * px, c0, z0, t0)) core = 1.0;
          if (differs(u0 + d * 3.1 * sc * px, c0, z0, t0)) side = 1.0;
        }
        // dome: distance to the nearest wire, as the sum over 5 rings of the share of directions that did not hit
        float dist = 0.0, mx = 0.0; vec2 toW = vec2(0.0);
        for (int ri = 0; ri < 5; ri++) {
          float r = 3.0 + float(ri) * 3.4, dr = ri == 0 ? 3.0 : 3.4;
          float hits = 0.0;
          for (int k = 0; k < 8; k++) {
            float a = float(k) * 0.7854 + 0.2; vec2 d = vec2(cos(a), sin(a));
            if (differs(u0 + d * r * sc * px, c0, z0, t0)) { hits += 1.0; if (ri < 2) toW += d; }
          }
          dist += dr * (1.0 - clamp(hits * 0.5, 0.0, 1.0));
        }
        float dome = smoothstep(0.0, 17.0, dist);
        // enamel colour: smoothed over a few pixels (depth aware), saturated, tone in 5 steps
        vec3 acc = c0; float ws = 1.0;
        for (int k = 0; k < 6; k++) {
          float a = float(k) * 1.0472; vec2 s = u0 + vec2(cos(a), sin(a)) * 4.0 * sc * px;
          float w = exp(-abs(zz(s) - z0) * 14.0) * exp(-length(gam(texture2D(tColor, s).rgb) - c0) * 6.0);
          acc += gam(texture2D(tColor, s).rgb) * w; ws += w;
        }
        vec3 e = acc / ws;
        float L = lum(e), Lq = floor(L * 5.0 + 0.5) / 5.0;
        e = max(mix(vec3(L), e, 2.0), 0.0) * (Lq / max(L, 0.02) * 0.6 + 0.4);
        e *= 0.62;                                                              // enamel is deep
        // dome shading and a meniscus lighter along the wire on the side that faces the light
        float men = (1.0 - smoothstep(1.5, 7.0, dist)) * smoothstep(0.0, 1.0, dist);
        vec2 tw = length(toW) > 0.01 ? normalize(toW) : vec2(0.0);
        float facing = dot(tw, normalize(vec2(0.6, -0.8)));                      // the wire lies to the lower right: this side is lit
        vec3 col = e * (0.62 + 0.55 * dome) * (1.0 + 0.35 * men * facing);
        // fixed glint
        float gl = pow(smoothstep(0.35, 1.0, dome), 2.0) * (0.6 + 0.4 * vn(f * 0.03));
        col += vec3(1.0, 0.97, 0.9) * gl * 0.28;
        // the moving light: a diagonal band that crosses the frame every 5.5 s, soft, strongest where the enamel domes
        float s = dot(uv * vec2(uRes.x / uRes.y, 1.0), normalize(vec2(1.0, 0.55))) + 0.12 * (vn(f * 0.02) - 0.5);
        float span = 1.0 * uRes.x / uRes.y + 0.55 + 0.6;
        float pos = fract(uRealT / 5.5) * span - 0.3;
        float band = exp(-(((s - pos) / 0.11) * ((s - pos) / 0.11)));
        col += vec3(1.0, 0.95, 0.82) * band * (0.15 + 0.7 * dome) * (0.35 + 0.65 * smoothstep(0.1, 0.5, L));
        // gold wire
        float wi = 0.5 + 0.5 * vn(f * 0.7);
        vec3 gold = vec3(1.0, 0.76, 0.28) * (0.8 + 0.5 * wi) * (0.95 + 0.1 * sin(dot(f, vec2(0.8, 0.6)) * 2.2));
        vec3 goldSide = vec3(0.6, 0.38, 0.1) * (0.8 + 0.4 * wi);
        col = mix(col, goldSide, side * 0.9);
        col = mix(col, gold, core);
        return vec4(pow(clamp(col, 0.0, 1.5), vec3(2.2)) * 1.25, 1.0);
      }`,
  },
};
