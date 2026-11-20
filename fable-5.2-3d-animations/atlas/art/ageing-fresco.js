// Art style 5: Ageing fresco. Inputs C D B (colour, depth, beat times).
// Matte pigment on plaster. Across the timeline, cracks grow from the object edges and small flakes fall off. The last beat is the oldest.
window.ARTS = window.ARTS || {};
ARTS['ageing-fresco'] = {
  id: 'ageing-fresco', name: 'Ageing fresco', group: 'The medium changes with time', inputs: 'C D B',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      vec2 h22(vec2 p){ return vec2(h21(p), h21(p + 17.31)); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      float dd(vec2 uv){ return min(linDepth(uv), uFocus * 3.0); }
      // cell noise: x = distance to the nearest point, y = distance to the second nearest. y - x is small on a crack line.
      float cellId = 0.0;   // set by cells(): a number for the nearest Voronoi cell (not a square of the grid)
      vec2 cells(vec2 p){
        vec2 ip = floor(p), fp = fract(p); float f1 = 9.0, f2 = 9.0;
        for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
          vec2 g = vec2(float(i), float(j));
          float d = length(g + h22(ip + g) - fp);
          if (d < f1) { f2 = f1; f1 = d; cellId = h21(ip + g + 3.7); } else if (d < f2) f2 = d;
        }
        return vec2(f1, f2);
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes;
        // age: 0 to 1, only grows. The last beat is at about 0.8 and the end of the timeline is at 1.
        float lastB = uBeats[0];
        for (int i = 0; i < 8; i++) if (i < uBeatN) lastB = max(lastB, uBeats[i]);
        float A = clamp(uCanon / (lastB + 1.5), 0.0, 1.0);
        A = A * A * (3.0 - 2.0 * A) * 0.5 + A * 0.5;
        // plaster: fine grain, trowel mottling, grime that runs down from above
        float grain = vn(fc * 0.8) * 0.5 + vn(fc * 0.27) * 0.5;
        float mott = fbm(fc * 0.0045);
        vec3 plaster = vec3(0.84, 0.77, 0.64) * (0.9 + 0.1 * grain) * (0.93 + 0.14 * mott);
        // matte pigment: gamma space, chalky (lifted and desaturated), flat bands, faded by age
        vec3 c = pow(clamp(texture2D(tColor, uv).rgb, 0.0, 1.0), vec3(1.0 / 2.2));
        float L = lum(c);
        c = mix(vec3(L), c, 0.72);
        c = floor(c * 7.0 + 0.5) / 7.0;
        c = mix(c * 0.92, plaster, 0.22 + 0.4 * A);
        c *= 0.95 + 0.1 * grain;
        // sinopia: a thin red-brown line on depth edges
        float d0 = dd(uv), edge = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * px * 1.5;
          edge = max(edge, abs(dd(uv + o) - d0) / d0);
        }
        c = mix(c, vec3(0.30, 0.15, 0.10), smoothstep(0.02, 0.07, edge) * 0.55);
        // distance to the nearest object edge, in a ring search (up to 48 px)
        float prox = 1e3;
        // 6 directions, 10 px steps up to 80 px. A hit is a depth step of 6 % between two steps, so a floor that recedes smoothly is not an edge.
        for (int d = 0; d < 6; d++) {
          float an = float(d) * 1.0472 + h21(fc) * 0.5;
          vec2 dv = vec2(cos(an), sin(an));
          float prev = d0;
          for (int i = 1; i <= 8; i++) {
            float ds = dd(uv + dv * float(i) * 10.0 * px);
            if (abs(ds - prev) / prev > 0.06) prox = min(prox, float(i) * 10.0);
            prev = ds;
          }
        }
        if (edge > 0.04) prox = 0.0;
        // cracks: a cell network, visible within a reach from the edges that grows with age. Each cell has its own start.
        vec2 cp = fc / 58.0 + vec2(fbm(fc * 0.02), fbm(fc * 0.02 + 9.0)) * 0.5;
        vec2 cf = cells(cp);
        float line = 1.0 - smoothstep(0.0, 0.09 + 0.06 * A, cf.y - cf.x);
        float reach = 8.0 + 70.0 * A;
        float cellStart = cellId;
        float alive = smoothstep(reach, reach * 0.35, prox) * step(cellStart, A * 1.5 + 0.02);
        float crack = line * alive;
        // fine hairline cracks in the open plaster on old walls
        vec2 hf = cells(fc / 21.0 + 31.0);
        crack = max(crack, (1.0 - smoothstep(0.0, 0.03, hf.y - hf.x)) * smoothstep(0.55, 0.95, A) * step(h21(floor(fc / 21.0)), 0.3) * 0.7);
        // flakes: round chips on a grid. A chip is lost at its own time (later for cells far from edges); the substrate shows where it was.
        float lost = 0.0, chip = 0.0, rimL = 0.0;
        vec2 gp = fc / 34.0, gi = floor(gp);
        for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
          vec2 g = gi + vec2(float(i), float(j));
          vec2 ctr = (g + 0.2 + 0.6 * h22(g + 5.0)) * 34.0;
          float rad = 9.0 + 12.0 * h21(g + 9.0);
          float tf = 0.12 + 0.8 * h21(g + 2.0);
          // eligibility: the chip centre is near an edge (4 taps), or by luck
          float jump = 0.0;
          for (int k = 0; k < 4; k++) {
            vec2 o = (k == 0 ? vec2(1.0, 0.0) : k == 1 ? vec2(-1.0, 0.0) : k == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * 26.0;
            jump = max(jump, abs(dd((ctr + o) * px) - dd(ctr * px)) / dd(ctr * px));
          }
          float ok = (jump > 0.04 ? 1.0 : 0.0) * step(h21(g + 6.0), 0.55) + step(0.93, h21(g + 8.0)) * step(0.5, A);
          if (ok < 0.5) continue;
          float dist = length(fc - ctr) / rad + 1.1 * (fbm(fc * 0.11 + g) - 0.5);     // ragged, angular outline
          float born = step(tf, A);
          if (dist < 1.0) { lost = max(lost, born); rimL = max(rimL, born * smoothstep(0.7, 1.0, dist)); }
          // the chip falls: 0.05 of age after its loss it drops 30 px and turns to dust
          float fa = (A - tf) / 0.05;
          if (fa > 0.0 && fa < 1.0) {
            vec2 cc = ctr + vec2(5.0 * sin(float(i) + 3.0 * fa), 30.0 * fa * fa);
            if (length(fc - cc) < rad * 0.55 * (1.0 - 0.4 * fa)) chip = 1.0 - fa;
          }
        }
        // compose
        vec3 col = c;
        // grime: streaks run down from the top, more with age
        float streak = fbm(vec2(fc.x * 0.03, fc.y * 0.002 + 4.0));
        col *= 1.0 - A * 0.17 * smoothstep(0.4, 0.8, streak) * (0.4 + 0.6 * uv.y);
        col *= 1.0 - 0.3 * A * smoothstep(0.55, 0.85, fbm(fc * 0.012 + 12.0)); // damp stains
        vec3 sub = vec3(0.80, 0.70, 0.55) * (0.72 + 0.4 * vn(fc * 0.3)) * (0.85 + 0.15 * grain);
        col = mix(col, sub, lost);
        col = mix(col, vec3(0.96, 0.92, 0.82), rimL * 0.9);           // the broken edge of the plaster shows its lighter layer
        col *= 1.0 - 0.45 * (lost * (1.0 - rimL)) * smoothstep(0.0, 1.0, vn(fc * 0.2 + 1.0)) * 0.5;
        col = mix(col, vec3(0.22, 0.16, 0.11), crack * 0.8);
        col = mix(col, vec3(0.9, 0.85, 0.72), chip * 0.95);
        vec3 lin = pow(col, vec3(2.2));
        lin *= mix(1.0, 2.2, smoothstep(0.5, 0.9, lum(lin)));
        return vec4(lin, 1.0);
      }`,
  },
};
