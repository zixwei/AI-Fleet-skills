// Art style 72: Loom weave (version of the first-set style "loom-weave"). Inputs C B (colour, beat times).
// The picture is woven thread in two directions: a grid of 6 px (at 720p) cells where a weft strand lies over the cream warp (horizontal, cylinder
// shaded, dipping under at the cell edge next to a warp-over cell) and a warp strand shows in about one cell of five (vertical, cream with a little of the picture colour).
// Each weft cell takes the picture colour at its centre. At every beat the frame is bare warp (dark loom behind). A beater bar rises from the bottom,
// the shuttle runs across the row that is being woven, and the woven rows fill the picture from the bottom to the top in 1.6 s.
window.ARTS = window.ARTS || {};
ARTS['loom-weave'] = {
  id: 'loom-weave', name: 'Loom weave', group: 'Craft materials', inputs: 'C B',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      const float CW = 6.0;
      // 1 where the warp strand lies over the weft in cell (i, j)
      float warpOver(vec2 ij){ return mod(ij.x + 3.0 * ij.y, 5.0) < 1.0 ? 1.0 : 0.0; }
      float tri(float x){ return abs(fract(x) * 2.0 - 1.0); }
      vec4 postFX(vec2 uv){
        float sc = uRes.y / 720.0;
        vec2 f = uv * uRes / sc, px = 1.0 / uRes;
        vec2 ij = floor(f / CW), q = fract(f / CW);
        // time of the weave: 0 at a beat, 1 after 1.6 s. Before the first beat the picture is complete.
        float k = beatIdx();
        float prog = k < 0.0 ? 1.0 : clamp(beatAge() / 1.6, 0.0, 1.0);
        float edge = prog >= 1.0 ? 2.0 : smoothstep(0.0, 1.0, prog * 0.92 + 0.04 * prog) * 1.04 - 0.02;   // woven below this height (uv.y)
        vec2 cuv = (ij + 0.5) * CW * sc * px;                                       // centre of this cell on the screen
        float woven = step(cuv.y, edge);
        // the picture colour of a weft thread: the colour at the cell centre, with its colour pushed a little
        vec3 pc = texture2D(tColor, cuv).rgb;
        float L = lum(pc);
        pc = max(mix(vec3(L), pc, 1.25), 0.0);
        pc *= 0.92 + 0.16 * h21(ij + 4.0);                                          // each weft cell is a slightly different thread
        vec3 cream = vec3(0.86, 0.72, 0.5);
        vec3 warpC = mix(cream, pc, 0.55) * 0.85 * (0.9 + 0.2 * h21(vec2(ij.x, 9.0)));
        float wo = warpOver(ij);
        float woL = warpOver(ij + vec2(-1.0, 0.0)), woR = warpOver(ij + vec2(1.0, 0.0));
        float woU = warpOver(ij + vec2(0.0, 1.0)), woD = warpOver(ij + vec2(0.0, -1.0));
        vec3 col;
        // weft strand (horizontal): cylinder across the row, dips under next to a warp-over cell, thin gap between rows
        float cylY = sqrt(clamp(1.0 - ((2.0 * q.y - 1.0) * (2.0 * q.y - 1.0)), 0.0, 1.0));
        float dive = 1.0 - 0.45 * (woL * (1.0 - smoothstep(0.0, 0.35, q.x)) + woR * smoothstep(0.65, 1.0, q.x));
        float twist = 0.94 + 0.06 * sin((f.x * 1.1 + f.y * 0.6) * 1.7);
        vec3 weft = pc * (0.55 + 0.6 * cylY) * dive * twist * (1.0 - 0.5 * smoothstep(0.85, 1.0, abs(2.0 * q.y - 1.0)));
        // warp strand (vertical): cylinder across the column, dips under at the top and bottom
        float cylX = sqrt(clamp(1.0 - ((2.0 * q.x - 1.0) * (2.0 * q.x - 1.0)), 0.0, 1.0));
        float diveW = 1.0 - 0.4 * ((1.0 - woU) * smoothstep(0.7, 1.0, q.y) + (1.0 - woD) * (1.0 - smoothstep(0.0, 0.3, q.y)));
        vec3 warp = warpC * (0.55 + 0.6 * cylX) * diveW * (0.95 + 0.05 * sin(f.y * 1.9 + ij.x));
        col = wo > 0.5 ? warp : weft;
        // bare warp (not woven yet): cream threads over the dark loom, each with a faint dye of the picture
        float cylB = sqrt(clamp(1.0 - ((2.0 * q.x - 1.0) * (2.0 * q.x - 1.0)), 0.0, 1.0));
        vec3 bare = mix(vec3(0.03, 0.02, 0.015), mix(cream, pc, 0.45) * 0.17 * (0.5 + 0.55 * cylB) * (0.95 + 0.05 * sin(f.y * 1.9 + ij.x)), 1.0 - smoothstep(0.62, 0.8, abs(2.0 * q.x - 1.0)));
        col = mix(bare, col, woven);
        // light from the left shows every thread
        col *= 0.92 + 0.16 * (1.0 - uv.x) * 0.6 + 0.04 * (vn(f * 0.06) - 0.5);
        // beater bar and shuttle while a beat is being woven
        if (prog > 0.0 && prog < 1.0) {
          float fy = (uv.y - edge) / px.y / sc;                                       // 720p pixels above the woven edge
          vec3 wood = vec3(0.34, 0.19, 0.09) * (0.65 + 0.5 * vn(vec2(f.x * 0.09, f.y * 0.8)));
          float bar = smoothstep(-0.5, 0.5, fy) * (1.0 - smoothstep(9.0, 10.0, fy));
          float barShade = 0.55 + 0.7 * sin(clamp(fy / 10.0, 0.0, 1.0) * 3.14159);
          col = mix(col, wood * barShade * 1.5, bar);
          // the shuttle: a dark wood lozenge with a gold bobbin, runs across the width 9 times in 1.6 s; a gold thread trails behind it
          float run = prog * 9.0, dir = mod(floor(run), 2.0) < 0.5 ? 1.0 : -1.0;
          float sx = (dir > 0.0 ? tri(run * 0.5) * 0.0 + fract(run) : 1.0 - fract(run));
          vec2 sp = vec2(sx * uRes.x / sc, (edge * uRes.y / sc) + 24.0);
          vec2 d = (f - sp) / vec2(46.0, 12.0);
          float lozenge = 1.0 - smoothstep(0.85, 1.0, length(d));
          float bob = 1.0 - smoothstep(0.85, 1.0, length((f - sp - vec2(0.0, 2.0)) / vec2(16.0, 7.0)));
          vec3 sh = vec3(0.3, 0.17, 0.08) * (0.6 + 0.8 * smoothstep(-1.0, 0.8, -d.y));
          sh = mix(sh, vec3(0.95, 0.62, 0.2) * (0.7 + 0.5 * cos(f.x * 1.1)), bob);
          col = mix(col, sh * 1.4, lozenge);
          float trail = (1.0 - smoothstep(0.8, 1.6, abs(f.y - sp.y + 2.0))) * step(dir > 0.0 ? 0.0 : sp.x, f.x) * step(f.x, dir > 0.0 ? sp.x : uRes.x / sc);
          col = mix(col, vec3(0.9, 0.55, 0.16), trail * 0.8 * (1.0 - lozenge));
        }
        return vec4(col * 1.25, 1.0);
      }`,
  },
};
