// Prompt builder and SRT parser. Classic script in the browser, CommonJS module in Node.
(function () {
// SRT -> [{start, end, text}] in seconds.
function parseSRT(text) {
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  const TS = /^\s*(?:(\d+):)?(\d{1,2}):(\d{2})[,.](\d{1,3})\s*-->\s*(?:(\d+):)?(\d{1,2}):(\d{2})[,.](\d{1,3})/;
  const sec = (h, m, s, ms) => (+h || 0) * 3600 + +m * 60 + +s + +(ms + '00').slice(0, 3) / 1000;
  const cues = [];
  let i = 0;
  while (i < lines.length) {
    if (!lines[i].trim()) { i++; continue; }
    if (/^\s*\d+\s*$/.test(lines[i]) && i + 1 < lines.length && lines[i + 1].includes('-->')) i++;
    const m = lines[i].match(TS);
    if (!m) throw new Error(`SRT line ${i + 1}: bad timestamp "${lines[i].trim()}"`);
    const cue = { start: sec(m[1], m[2], m[3], m[4]), end: sec(m[5], m[6], m[7], m[8]), text: '' };
    const body = [];
    for (i++; i < lines.length && lines[i].trim(); i++) body.push(lines[i].trim());
    cue.text = body.join(' ');
    cues.push(cue);
  }
  return cues;
}

// style: the style object. opts: {topic, voiceover, srt, storyboard, art}. sources: {stage, sound, style, art} file texts.
// opts.art (an ARTS entry from atlas/art/<id>.js, plus look) makes an art-style prompt: the scene style is the carrier, the art style is the look.
function buildPrompt(style, opts, sources) {
  const o = opts || {}, vo = !!o.voiceover, art = o.art || null;
  const ver = (String(sources.stage).match(/THREE_VERSION\s*=\s*'([^']+)'/) || [])[1] || '0.187.0';
  const fonts = (style.fonts || []).length ? style.fonts.join(', ') + ' (Google Fonts, one <link> tag)' : 'none';
  const P = [];
  P.push(art
    ? `I want a short 3D motion graphic made with three.js and drawn in the "${art.name}" art style. Look: ${art.look} Below is the full source of the art style (a post shader that redraws every frame), a reference animation that it was shown on ("${style.name}"), and the small rendering kit and sound kit that they run on. Build a new animation for my content and draw it with this art style.`
    : `I want a short 3D motion graphic made with three.js in the "${style.name}" style. Below is the full source of a reference animation in this style, and the small rendering kit and sound kit that it runs on. Use them as the style guide. Rebuild the animation for my content.`);
  P.push(`MY CONTENT\n${(o.topic || '').trim() || '[Type your topic here]'}`);
  if (vo) P.push(`MY VOICEOVER TIMING\n${(o.srt || '').trim() || 'Ask me for the SRT or word timestamps before you build.'}`);
  P.push(`WHAT TO BUILD
One self-contained HTML file (an artifact if possible):
- three.js ${ver}, core only, as an ES module from a CDN: https://cdn.jsdelivr.net/npm/three@${ver}/build/three.module.js (an import map or a dynamic import). Set window.THREE = THREE before the kit and the style code run.
- A 1920x1080 canvas scaled to the window. A control bar: play/pause, scrub slider, time, sound toggle, loop (on by default).${vo ? ' Add "Load voiceover" (an audio file; the audio element is the clock, and each frame reads audio.currentTime).' : ''}
- A new style object made the same way as the reference: content block first, then build(S) that returns update(t, realT). 7 to 12 seconds unless the content needs more.${vo ? '\n- The duration is the last cue end plus 1 second. One beat starts on each cue start. Give the cues to K.run as { cues } (each {start, end, text} in seconds); the kit then warps the canonical time to the voice.' : ''}
${art ? `- Load the ART STYLE file below unchanged as a classic script. It registers ARTS['${art.id}']. The new style object must have post: null. Text that must stay legible must be made with K.label (the kit draws labels over the art style).\n` : ''}- Run it with const S = await K.run(canvas, style, { samples${art ? `, art: ARTS['${art.id}']` : ''} }). 1 sample for live play, the style's count for frame renders. Expose window.seek = t => S.seek(t) and window.DURATION = S.duration.
- Play style.sound through SOUND.live(k => style.sound(k), t, { map: S.toReal${vo ? ', voiceover: true' : ''} }) in sync with the player. Stop it on pause, on seek and when the sound toggle is off. Create the AudioContext only in the Play click.
- Include the STAGE kit and the SOUND kit below, unchanged.
- Load these Google Fonts before you build: ${fonts}. K.run loads the fonts in style.fonts for you.`);
  P.push(`HOW TO STAY IN THE STYLE
- The reference shows the look, not the story. Its objects, layout and beats belong to its topic. First decide what my content must show. Then build those things in this look.
- Tell my content as an explainer: 3 to 5 beats, each one follows from the last. The picture tells it. Words are short labels. End on the result, not on a slogan.
- Keep the reference's materials, light, camera language, colour grade and manner of motion.
- update(t) sets the full scene for time t. Nothing accumulates between calls. No Math.random, no Date, no timers. Use K.rng(seed).
- Use t for story motion and realT only for endless ambient motion (water, drift, flicker).
- Everything is built in code. No models, images, HDRIs or texture files.
- Simple forms with good light are better than complex forms that look wrong. Check each fact and number.
- The video is often seen on a phone. Text is large and stays long enough to read. The subject fills most of the frame through the full camera move. Frame 0 is a good picture. The last second holds.`);
  if (art) P.push(`ART STYLE (the look comes from here)
- The reference animation is only a carrier. Keep its kit usage and its manner of motion; take the look from the art style.
- Simple forms, clear depth and strong value contrast give the art style the most to work with.${/B/.test(art.inputs) ? '\n- This art style changes at each beat. Put the beats where the picture should change.' : ''}`);
  P.push(`FLOW BETWEEN BEATS
- A new beat is not automatically a new scene. If the next idea continues the last one, stay in the same world and move the camera to where it happens.
- For a real change of place or time, change the scene in the manner of this look (a page turn, a set turn, an object that wipes the frame, a change of light). No hard cuts.
- Fit the number of beats to my content, not to the reference.`);
  P.push(vo
    ? `SOUND (voiceover: effects below the voice, no music)
- Each sound starts on the frame of its event. Picture and sound use the same schedule.
- Give a sound to each event that lands. Use sounds that this material makes.
- On-screen text is key words only. Do not repeat the narration as text.`
    : `SOUND (no voiceover: full mix)
- Each sound starts on the frame of its event. Picture and sound use the same schedule.
- Give a sound to each event that lands. Use sounds that this material makes.
- A quiet ambience bed is good. Music only if it fits the style.`);
  if (o.storyboard) P.push(`STORYBOARD FIRST\nBefore the animation, render one still for each beat in this style, show them, and wait for my OK.`);
  P.push(`IF YOU HAVE A SHELL (Claude Code)
Render an MP4 in headless Chrome with the GPU on: load the page, call window.seek(i / 30) for each frame, capture the canvas, pipe the frames to ffmpeg. Render the sound with SOUND.renderOffline and SOUND.toWav and mux it at approximately -15 LUFS. Examine some frames and correct framing, light and legibility before you report done.`);
  P.push(`STYLE CARD
Name: ${style.name}
Family: ${style.family}
Use: ${style.use}
Look: ${style.look}
Motion: ${style.motion}
Good for: ${style.goodFor}`);
  P.push(`STAGE KIT (kit/stage.js)\n\`\`\`js\n${sources.stage}\n\`\`\``);
  P.push(`SOUND KIT (kit/sound.js)\n\`\`\`js\n${sources.sound}\n\`\`\``);
  P.push(`REFERENCE STYLE (${style.id}.js)\n\`\`\`js\n${sources.style}\n\`\`\``);
  if (art) P.push(`ART STYLE (art/${art.id}.js)\n\`\`\`js\n${sources.art}\n\`\`\``);
  return P.join('\n\n');
}

const api = { parseSRT, buildPrompt };
if (typeof window !== 'undefined') Object.assign(window, api);
if (typeof module !== 'undefined') module.exports = api;
})();
