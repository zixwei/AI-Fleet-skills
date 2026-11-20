// Art style 62: One-bit dither. Inputs C D S (colour, depth, frame step). Version of the first-set style `one-bit`, without its topic.
// Two colours only (ink and paper), large square pixels (6 px at 720p, scaled with the height), an 8x8 ordered dither for each shade, 15 frames per second.
// Option: uniform uPal = 1 gives a 16-colour palette (ordered dither to the nearest colour) and a 1-pixel dark outline of the large pixels at each depth step.
// The default is 0 (two colours). The depth is used to lift far shades toward paper (aerial perspective), and for the outline of the 16-colour option.
window.ARTS = window.ARTS || {};
ARTS['one-bit-dither'] = {
  id: 'one-bit-dither', name: 'One-bit dither', group: 'Print and paper', inputs: 'C D S',
  fps: 15,
  labels: 'halo',
  post: {
    uniforms: { uPal: { value: 0 } },      // 0: two colours; 1: 16 colours with a dark outline
    fragment: `
      uniform float uPal;
      float b2(vec2 p){ p = mod(p, 2.0); return p.x < 1.0 ? (p.y < 1.0 ? 0.0 : 3.0) : (p.y < 1.0 ? 2.0 : 1.0); }
      float bayer8(vec2 p){ p = floor(p); return (b2(p) * 16.0 + b2(floor(p / 2.0)) * 4.0 + b2(floor(p / 4.0)) + 0.5) / 64.0; }
      float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
      // a cell of large pixels: its centre in uv, averaged over 5 taps so a thin line does not flicker in and out
      vec3 cellCol(vec2 cell, float P){
        vec2 px = 1.0 / uRes, c = (cell + 0.5) * P * px, o = vec2(P * 0.28) * px;
        return 0.4 * texture2D(tColor, c).rgb + 0.15 * (texture2D(tColor, c + vec2(o.x, o.y)).rgb + texture2D(tColor, c + vec2(-o.x, o.y)).rgb
          + texture2D(tColor, c + vec2(o.x, -o.y)).rgb + texture2D(tColor, c + vec2(-o.x, -o.y)).rgb);
      }
      float cellZ(vec2 cell, float P){ return linDepth((cell + 0.5) * P / uRes); }
      vec3 palette(int i){
        vec3 p[16];
        p[0] = vec3(0.102, 0.110, 0.173); p[1] = vec3(0.365, 0.153, 0.365); p[2] = vec3(0.694, 0.243, 0.325); p[3] = vec3(0.937, 0.490, 0.341);
        p[4] = vec3(1.000, 0.804, 0.459); p[5] = vec3(0.655, 0.941, 0.439); p[6] = vec3(0.220, 0.718, 0.392); p[7] = vec3(0.145, 0.443, 0.475);
        p[8] = vec3(0.161, 0.212, 0.435); p[9] = vec3(0.231, 0.365, 0.788); p[10] = vec3(0.255, 0.651, 0.965); p[11] = vec3(0.451, 0.937, 0.969);
        p[12] = vec3(0.957, 0.957, 0.957); p[13] = vec3(0.580, 0.690, 0.761); p[14] = vec3(0.337, 0.424, 0.525); p[15] = vec3(0.200, 0.235, 0.341);
        vec3 r = p[0]; for (int k = 0; k < 16; k++) if (k == i) r = p[k]; return r;
      }
      vec4 postFX(vec2 uv){
        float sc = uRes.y / 720.0, P = floor(6.0 * sc + 0.5);
        vec2 fc = uv * uRes, cell = floor(fc / P);
        vec3 c = cellCol(cell, P);
        float zc = cellZ(cell, P), sky = texture2D(tDepth, (cell + 0.5) * P / uRes).x > 0.9999 ? 1.0 : 0.0;
        float dith = bayer8(cell);
        if (uPal < 0.5) {
          float g = max(lum(c), 0.0);   // linear luminance: lit pastel scenes sit high, so the ramp is in linear light (as the first-set style)
          float far = sky > 0.5 ? 0.0 : clamp(zc / (2.0 * uFocus) - 0.45, 0.0, 1.0);
          float tone = smoothstep(0.1, 0.62, g) + 0.06 * far;      // the ramp of the first-set style
          float on = step(dith, tone);
          vec3 ink = vec3(0.012, 0.012, 0.03), paper = vec3(2.0, 1.95, 1.75);   // paper is bright because tone mapping follows
          return vec4(mix(ink, paper, on), 1.0);
        }
        // 16 colours: ordered dither in gamma space, nearest palette colour
        vec3 g3 = pow(clamp(c * 1.15, 0.0, 1.0), vec3(0.4545)) + (dith - 0.5) * 0.22;
        float best = 1e9; int bi = 0;
        for (int i = 0; i < 16; i++) { vec3 d = g3 - palette(i); float e = dot(d, d); if (e < best) { best = e; bi = i; } }
        vec3 col = palette(bi);
        // 1-pixel outline (one large pixel) on the farther cell where a neighbour cell is nearer
        float edge = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0);
          float zn = cellZ(cell + o, P);
          edge = max(edge, step(0.035, (zc - zn) / zc));
        }
        col = mix(col, palette(0), edge);
        vec3 lin = pow(col, vec3(2.2));
        return vec4(lin * mix(1.0, 2.2, smoothstep(0.45, 0.9, lum(lin))), 1.0);
      }`,
  },
};
