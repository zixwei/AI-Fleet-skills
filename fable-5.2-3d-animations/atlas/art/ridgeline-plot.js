// Art style 26: Ridgeline plot. Inputs C D (colour, depth).
// The picture is 80 horizontal white lines on black. Each line rises where the scene is near or bright, and hides the lines behind it.
// For each pixel the shader tests the few lines that can reach it, from the front (low on the screen) to the back. The first line
// whose black fill covers the pixel owns it: the pixel is white on the curve and black under it.
window.ARTS = window.ARTS || {};
ARTS['ridgeline-plot'] = {
  id: 'ridgeline-plot', name: 'Ridgeline plot', group: 'The depth is the material', inputs: 'C D',
  labels: 'halo',   // white outline round the dark label text, so it reads on the black field
  post: {
    fragment: `
      // depth position in the scene: 0 near, 1 far, from the log of depth over the focus distance (0.57 to 2.0 times uFocus). Stable from frame to frame. The sky counts as 1.
      float zn(vec2 uv){ return texture2D(tDepth, uv).x > 0.9999 ? 1.0 : clamp((log2(linDepth(uv) / uFocus) + 0.8) / 1.8, 0.0, 1.0); }

      #define NL 80.0
      // height of the curve of line with base y0 at x, in uv.y units. Near and bright raise the line.
      // nearness over a narrow log range around the focus distance (0.71 to 1.41 x uFocus), so a block in front of a floor stands out
      float near0(vec2 q){ return texture2D(tDepth, q).x < 0.9999 ? 1.0 - clamp((log2(linDepth(q) / uFocus) + 0.5) / 1.0, 0.0, 1.0) : 0.0; }
      // line height: nearness only (no colour, so beat changes in the scene do not make it pop), smoothed along the row.
      float ridge(float x, float y0){
        float v = 0.0, ws = 0.0;
        for (int i = -8; i <= 8; i++) {
          float w = 9.0 - abs(float(i));
          vec2 q = vec2(x + float(i) * 3.0 / uRes.x, y0);
          v += near0(q) * w;
          ws += w;
        }
        return v / ws * 5.5 / NL;
      }
      vec4 postFX(vec2 uv){
        float S = uRes.y / 1080.0;
        float sp = 1.0 / NL;
        float r0 = floor(uv.y / sp) - 7.0;   // the window must cover the largest lift (5.5 gaps) plus the line itself
        float val = 0.0;
        for (int j = 0; j < 10; j++) {
          float yb = (r0 + float(j)) * sp + 0.5 * sp;
          if (yb < 0.0 && float(j) < 7.0) { if (yb + 6.0 * sp < uv.y) continue; }
          float yc = clamp(yb, 0.0, 1.0);
          float Y = yb + ridge(uv.x, yc);
          if (Y >= uv.y) {
            // the first line that covers this pixel is the front one. It is white on its curve, black below it.
            float slope = abs(ridge(uv.x + 3.0 / uRes.x, yc) - ridge(uv.x - 3.0 / uRes.x, yc)) * uRes.y / 6.0 * uRes.x / uRes.y;
            float tw = (1.5 * S + min(slope, 3.0) * 0.9 * S) / uRes.y;
            val = smoothstep(tw, tw * 0.25, Y - uv.y);
            break;
          }
        }
        // lines of the topmost row run off the frame: a dark margin keeps the first line clear
        return vec4(vec3(val) * 2.0, 1.0);
      }`,
  },
};
