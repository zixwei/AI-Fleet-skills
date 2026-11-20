// Art style 66: Paper marbling. Inputs C B (colour, beat times).
// Colours float on water. At each beat a comb drags through them: the picture is pulled along the comb direction in fine tines, the tines of a second pass pull the other way
// (feather patterns), and a slow swirl bends it. The pull is strongest 0.25 s after the beat, then in about 1.7 s the colours settle back into the picture.
// The picture itself is the scene colour in 6 gamma levels, with thin pale veins between the colour bands (the gaps between drops), faint marbling veins, and cream paper.
// The comb direction, the tine spacing and the strength change with the beat index (a hash of it), so each beat gives a new pattern.
window.ARTS = window.ARTS || {};
ARTS['paper-marbling'] = {
  id: 'paper-marbling', name: 'Paper marbling', group: 'Print and paper', inputs: 'C B',
  labels: 'halo',
  post: {
    fragment: `
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
      float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      vec3 lev(vec3 c){ c = mix(vec3(lum(c)), c, 1.35); return floor(pow(clamp(c * 1.1, 0.0, 1.0), vec3(0.4545)) * 6.0 + 0.5) / 6.0; }
      // the displaced lookup in px: comb pulls (two passes) and a swirl, for a comb state amp in 0..1
      vec2 comb(vec2 fc, float amp, float k, float sc){
        float hs = h21(vec2(k, 2.3)), ha = h21(vec2(k, 7.1)), ht = h21(vec2(k, 4.9));
        float th = floor(hs * 4.0) * 0.7854 + 0.35 * (ha - 0.5);                 // comb direction
        float S = (46.0 + 40.0 * ht) * sc, A = S * (0.15 + 0.05 * ha);   // A/S below 0.2 keeps the lines from folding into a sawtooth
        vec2 d = fc - 0.5 * uRes; float c = cos(th), s = sin(th);
        vec2 p = vec2(c * d.x + s * d.y, -s * d.x + c * d.y);                    // p.y: the way the comb is dragged
        // smooth tines: a sine across the comb, bent along the drag so the lines curve into feathers (chevrons)
        float bend = 1.8 * sin(p.y / (95.0 * sc) + 6.0 * ha);
        float pull = sin(6.2831853 * p.x / S + bend) + 0.5 * sin(12.566 * p.x / S - bend * 1.5);
        float dy = A * amp * pull;
        vec2 swirl = (vec2(fbm(fc / sc * 0.012 + k), fbm(fc / sc * 0.012 + 40.0 + k)) - 0.5) * 14.0 * sc * amp;
        return vec2(-s * dy, c * dy) + swirl;
      }
      vec4 postFX(vec2 uv){
        vec2 px = 1.0 / uRes, fc = uv * uRes; float sc = uRes.y / 720.0;
        float k = beatIdx(), age = beatAge();
        float amp = smoothstep(0.0, 0.25, age) * (1.0 - smoothstep(0.3, 1.1, age));
        amp = amp * amp * (3.0 - 2.0 * amp);
        vec2 off = comb(fc, amp, k, sc);
        // the settled picture is not perfectly still: the drops of colour have soft wavy edges
        off += (vec2(fbm(fc / sc * 0.03), fbm(fc / sc * 0.03 + 9.0)) - 0.5) * 5.0 * sc;
        vec2 u = uv + off * px;
        vec3 c0 = texture2D(tColor, u).rgb;
        vec3 g = lev(c0);
        // veins: a pale line where a neighbour lies in another colour level
        float vein = 0.0;
        for (int i = 0; i < 4; i++) {
          vec2 o = (i == 0 ? vec2(1.0, 0.0) : i == 1 ? vec2(-1.0, 0.0) : i == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0)) * px * 1.6 * sc;
          vein = max(vein, step(0.01, length(lev(texture2D(tColor, u + o).rgb) - g)));
        }
        vec3 col = pow(g, vec3(2.2));
        // the comb also thins the colour: it lightens where the pull is strong
        float thin = amp * smoothstep(0.1, 0.9, length(off) / (20.0 * sc)) * 0.25;
        // marbling veins: fine, long, wavy lines of a darker and a paler tone
        float wv = fbm(fc / sc * 0.02 + 3.0) * 12.0 + (fc.x * 0.3 + fc.y * 0.9) / (sc * 22.0);
        float fine = smoothstep(0.42, 0.5, abs(fract(wv) - 0.5)) * 0.5 + 0.5;
        col *= 0.93 + 0.1 * fine;
        vec3 paper = vec3(0.96, 0.93, 0.85) * (0.95 + 0.07 * vn(fc / sc * 0.8));
        col = mix(col, paper, thin);
        col = mix(col, paper * 0.98, vein * 0.55);
        return vec4(col * mix(1.0, 2.0, smoothstep(0.5, 0.9, lum(col))), 1.0);
      }`,
  },
};
