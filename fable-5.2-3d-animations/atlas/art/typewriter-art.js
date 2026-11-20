// Art style 98: Typewriter art. Inputs C B (colour, beats).
// The picture is typed with characters, one 14 x 26.5 px cell for each character (at 1080p). The glyphs come from a canvas atlas that the file
// draws in code (Courier New, then the browser's monospace font): 32 characters picked from a candidate list and sorted by how much ink they carry.
// The cell takes a character from the tone of the scene (dark = heavy character). Dark areas are overtyped: a second and a third character
// strike the same cell with a small offset. Each strike has its own ink strength and position error.
// At each beat the carriage types the picture again: rows run from the top to the bottom, left to right, 1.8 s for the page. Cells that are not
// typed yet show only a pale pre-print (old ink). A red carriage mark stands at the typing position. No state from the frame before is used.
window.ARTS = window.ARTS || {};
(function () {
  const COLS = 8, ROWS = 4, CW = 28, CH = 53;
  let atlas = null;
  // Draw the candidate characters, count their ink, sort by ink and keep 32 spaced evenly through the list.
  function buildAtlas() {
    if (atlas) return atlas;
    const T = window.THREE, cand = Array.from(new Set(".,'`:;-_~=+*^!/\\|()[]{}<>?ixzvcrtosenaumwkbdhpqgyflj0123456789%#&$@WMBNHXKAEDGOQRS8".split('')));
    const font = `bold 46px "Courier New", Courier, monospace`;
    const tmp = document.createElement('canvas'); tmp.width = CW; tmp.height = CH;
    const g = tmp.getContext('2d', { willReadFrequently: true });
    const scored = cand.map(ch => {
      g.clearRect(0, 0, CW, CH); g.font = font; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = '#fff';
      g.fillText(ch, CW / 2, CH * 0.76);
      const d = g.getImageData(0, 0, CW, CH).data; let s = 0;
      for (let i = 3; i < d.length; i += 4) s += d[i];
      return { ch, ink: s };
    }).sort((a, b) => a.ink - b.ink || (a.ch < b.ch ? -1 : 1));
    const n = COLS * ROWS, pick = [];
    for (let i = 0; i < n; i++) pick.push(scored[Math.round(i * (scored.length - 1) / (n - 1))].ch);
    const cv = document.createElement('canvas'); cv.width = COLS * CW; cv.height = ROWS * CH;
    const a = cv.getContext('2d'); a.font = font; a.textAlign = 'center'; a.textBaseline = 'alphabetic'; a.fillStyle = '#fff';
    pick.forEach((ch, i) => a.fillText(ch, (i % COLS) * CW + CW / 2, Math.floor(i / COLS) * CH + CH * 0.76));
    const tex = new T.CanvasTexture(cv); tex.colorSpace = T.NoColorSpace;
    atlas = { tex, n };
    return atlas;
  }
  ARTS['typewriter-art'] = {
    id: 'typewriter-art', name: 'Typewriter art', group: 'The picture is bent', inputs: 'C B',
    labels: 'halo',
    post: {
      // the atlas needs a canvas, so it is made when the kit reads the uniforms
      get uniforms() { const A = buildAtlas(); return { tGlyph: { value: A.tex } }; },
      fragment: `
        uniform sampler2D tGlyph;
        float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        vec3 h23(vec2 p){ return vec3(h21(p), h21(p + 17.3), h21(p + 41.7)); }
        float glyph(float idx, vec2 loc){
          float c = mod(idx, 8.0), r = floor(idx / 8.0);
          vec2 t = vec2((c + clamp(loc.x, 0.0, 1.0)) / 8.0, 1.0 - (r + 1.0) / 4.0 + clamp(loc.y, 0.0, 1.0) / 4.0);
          return texture2D(tGlyph, t).a * step(0.0, loc.x) * step(loc.x, 1.0) * step(0.0, loc.y) * step(loc.y, 1.0);
        }
        vec4 postFX(vec2 uv){
          vec2 fc = uv * uRes;
          float sc = uRes.y / 1080.0;
          vec2 cs = vec2(14.0, 26.5) * sc;
          vec2 g = fc / cs, cell = floor(g), loc = fract(g);
          float nR = ceil(uRes.y / cs.y), nC = ceil(uRes.x / cs.x);
          float rt = nR - 1.0 - cell.y;                                           // row counted from the top
          // tone of the scene in the cell: the middle and four points toward the corners, in gamma space
          vec2 cc = (cell + 0.5) * cs / uRes, dx = vec2(cs.x * 0.3, 0.0) / uRes, dy = vec2(0.0, cs.y * 0.3) / uRes;
          vec3 s = texture2D(tColor, cc).rgb * 2.0 + texture2D(tColor, cc + dx + dy).rgb + texture2D(tColor, cc - dx + dy).rgb
                 + texture2D(tColor, cc + dx - dy).rgb + texture2D(tColor, cc - dx - dy).rgb;
          float lum = dot(pow(clamp(s / 6.0, 0.0, 1.0), vec3(1.0 / 2.2)), vec3(0.2126, 0.7152, 0.0722));
          float d = pow(clamp((0.97 - lum) * 1.75, 0.0, 1.0), 0.85);
          vec3 h = h23(cell + 3.7);
          // strikes: a character for the tone, then overtyped characters in the dark areas; each has a position error in pixels
          vec2 o1 = (h.xy - 0.5) * vec2(1.2, 1.6) * sc / cs;
          vec2 o2 = (h23(cell + 9.1).xy - 0.5) * vec2(3.0, 3.0) * sc / cs;
          vec2 o3 = (h23(cell + 19.4).xy - 0.5) * vec2(3.4, 3.4) * sc / cs;
          float i1 = floor(clamp(d * 1.05, 0.0, 1.0) * 31.99);
          float i2 = floor(6.0 + h.z * 20.0), i3 = floor(14.0 + h23(cell + 5.3).x * 17.0);
          float a1 = glyph(i1, loc - o1) * step(0.07, d);
          float a2 = glyph(i2, loc - o2) * smoothstep(0.42, 0.55, d);
          float a3 = glyph(i3, loc - o3) * smoothstep(0.7, 0.82, d);
          float ink = 1.0 - (1.0 - a1) * (1.0 - a2 * 0.9) * (1.0 - a3 * 0.9);
          ink = pow(clamp(ink, 0.0, 1.0), 0.7) * (0.8 + 0.2 * h.y);                 // uneven strike
          // carriage: this page was typed from the top left when the beat came
          float k = beatIdx(), age = beatAge(), typeDur = 1.8;
          float p = (rt + cell.x / nC) / nR;                                      // 0 at the top left, 1 at the bottom right
          float typed = k < 0.0 ? 1.0 : step(p * typeDur, age);
          ink *= mix(0.5, 1.0, typed);                                            // not typed yet: a pale pre-print
          vec3 paper = vec3(0.89, 0.83, 0.66) * 1.9;
          paper *= 0.96 + 0.07 * h21(floor(fc / 2.0)) + 0.03 * sin(fc.y * 0.9 / sc);
          paper *= 1.05 - 0.28 * dot(uv - 0.5, uv - 0.5);
          vec3 inkC = vec3(0.012, 0.012, 0.02);
          vec3 col = mix(paper, inkC, clamp(ink, 0.0, 1.0));
          // the carriage mark: a thin red bar at the typing position while the page is typed
          if (k >= 0.0 && age < typeDur) {
            float pc = age / typeDur * nR;                                        // row position, counted from the top
            float rowC = floor(pc), xC = fract(pc) * nC;
            float onRow = step(abs(rt - rowC), 0.5);
            float bar = onRow * smoothstep(1.6, 0.4, abs(cell.x + loc.x - xC) * cs.x / sc);
            col = mix(col, vec3(0.75, 0.04, 0.04), bar * 0.9);
          }
          return vec4(col, 1.0);
        }`,
    },
  };
})();
