// Art style 94: Signal glitch. Inputs C B (colour, beats). Version of the first-set style 'signal-glitch' without its topic
// (no red crosses, no green check marks, no grid of the file, no error-correction story).
// The frame is a grid of 16 x 9 blocks. At each beat 42 % of the blocks break at once: their scan lines shift sideways, the colour channels
// pull apart, some blocks repeat their left or right neighbour and some turn into coarse pixels. Across the rest of the beat interval the
// blocks repair one by one (each block has its own repair time) and all are whole before the next beat. A few full-width scan-line bands
// tear at the start of a break. The jitter changes 12 times for each second of real time.
window.ARTS = window.ARTS || {};
ARTS['signal-glitch'] = {
  id: 'signal-glitch', name: 'Signal glitch', group: 'The picture is bent', inputs: 'C B',
  post: {
    fragment: `
      float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      vec4 postFX(vec2 uv){
        // beat window: from this beat to the next one (the last beat uses the length of the one before it)
        float k = beatIdx(), age = beatAge();
        float span = 2.5;
        if (k >= 0.0) {
          int ki = int(k);
          if (ki + 1 < uBeatN) span = uBeats[ki + 1] - uBeats[ki];
          else if (ki > 0) span = uBeats[ki] - uBeats[ki - 1];
        }
        float G = k < 0.0 ? 0.0 : smoothstep(0.0, 0.1, age);                                  // the break is sudden
        float R = smoothstep(0.28 * span, 0.9 * span, age);                                  // repair progress, 1 before the next beat
        float tick = floor(uRealT * 12.0), bk = max(k, 0.0);
        vec2 GR = vec2(16.0, 9.0), id = floor(uv * GR);
        float broken = step(h1(id + 3.1 + bk * 11.3), 0.42), rank = h1(id + 7.7 + bk * 5.9);
        float tr = rank * 0.9 + 0.04;                                                         // the repair time of this block
        float repaired = step(tr, R);
        float bad = broken * (1.0 - repaired) * G;
        vec2 q = uv;
        // tears: a few full-width bands slide sideways while the damage is fresh
        float rowT = floor(uv.y * 40.0), tear = G * (1.0 - smoothstep(0.0, 0.7, R));
        float band = step(0.9, h1(vec2(rowT, bk * 3.7 + floor(uRealT * 6.0))));
        q.x += band * (h1(vec2(rowT, bk + 2.0)) - 0.5) * 0.12 * tear;
        if (bad > 0.0) {
          float row = floor(uv.y * 180.0);
          q.x += (h1(vec2(row, tick)) - 0.5) * 0.08 * bad;                                    // scan lines shift
          float pick = h1(id + vec2(bk * 1.7, 9.3));
          if (pick < 0.3) q.x -= 1.0 / GR.x;                                                  // the block repeats its left neighbour
          else if (pick < 0.5) q.x += 1.0 / GR.x;                                             // or its right neighbour
          else if (pick < 0.65) q = (floor(q * vec2(160.0, 90.0)) + 0.5) / vec2(160.0, 90.0); // or turns into coarse pixels
        }
        q = clamp(q, 0.001, 0.999);
        float sp = 0.012 * bad + 0.004 * tear * band;
        vec3 c;
        c.r = texture2D(tColor, q + vec2(sp, 0.0)).r; c.g = texture2D(tColor, q).g; c.b = texture2D(tColor, q - vec2(sp, 0.0)).b;
        if (bad > 0.0) {
          c = mix(c, vec3(h1(uv * 900.0 + tick)), 0.14 * bad);
          c *= 0.82 + 0.36 * step(0.5, h1(vec2(floor(uv.y * 180.0), tick + 2.0)));            // flicker line by line
          c.g *= 1.0 - 0.25 * step(0.8, h1(id + 41.0 + tick));                                // some blocks lose a channel in places
        }
        // a block that was just repaired flashes once
        float age2 = R - tr;
        c *= 1.0 + 0.35 * broken * repaired * G * (1.0 - smoothstep(0.0, 0.08, age2)) * step(0.0, age2);
        return vec4(c, 1.0);
      }`,
  },
};
