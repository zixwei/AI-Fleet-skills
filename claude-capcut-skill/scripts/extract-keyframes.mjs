// FFmpeg scene change 기반 키프레임 추출
// 실행: node scripts/extract-keyframes.mjs <input.mp4> [--threshold 0.3] [--out-dir <dir>] [--interval-fallback 5]
// 결과: <out-dir>/frame_<seconds>.jpg + <out-dir>/keyframes.json

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { log } from './logger.mjs';

const args = process.argv.slice(2);
if (args.length === 0 || args[0].startsWith('--')) {
  process.stderr.write('Usage: node scripts/extract-keyframes.mjs <input.mp4> [--threshold 0.3] [--out-dir <dir>] [--interval-fallback 5]\n');
  process.exit(2);
}

function getArg(name, def) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
}

const input = args[0];
const threshold = parseFloat(getArg('--threshold', '0.3'));
const intervalFallback = parseInt(getArg('--interval-fallback', '5'), 10);
const inputBase = basename(input).replace(/\.[^.]+$/, '');
const outDir = getArg('--out-dir', join(dirname(input), `${inputBase}.frames`));

if (!existsSync(input)) {
  process.stderr.write(`[extract-keyframes] 입력 없음: ${input}\n`);
  process.exit(2);
}

mkdirSync(outDir, { recursive: true });

// 1차: scene change 기반 추출
const sceneArgs = [
  '-y',
  '-i', input,
  '-vf', `select='gt(scene,${threshold})',showinfo`,
  '-vsync', 'vfr',
  '-frame_pts', '1',
  join(outDir, 'frame_%06d.jpg'),
];

const start = Date.now();
const r1 = spawnSync('ffmpeg', sceneArgs, { encoding: 'utf8' });

const sceneCount = readdirSync(outDir).filter((f) => f.endsWith('.jpg')).length;

// 너무 적게 잡히면(<3) 등간격 fallback
let frames = [];
if (sceneCount < 3) {
  process.stdout.write(`[extract-keyframes] scene change ${sceneCount}장. 등간격 ${intervalFallback}초로 폴백.\n`);
  // 기존 결과 삭제 (간단히 빈 디렉토리 사용)
  for (const f of readdirSync(outDir)) {
    if (f.endsWith('.jpg')) {
      try { rmSync(join(outDir, f)); } catch {}
    }
  }
  const fbArgs = [
    '-y',
    '-i', input,
    '-vf', `fps=1/${intervalFallback}`,
    join(outDir, 'frame_%06d.jpg'),
  ];
  spawnSync('ffmpeg', fbArgs, { encoding: 'utf8' });
}

// 메타데이터 — showinfo의 pts_time 파싱 (1차 사용 시), 폴백은 인덱스 기반 추정
const files = readdirSync(outDir).filter((f) => f.endsWith('.jpg')).sort();
if (sceneCount >= 3 && r1.stderr) {
  const ptsRegex = /pts_time:(\d+(?:\.\d+)?)/g;
  let m;
  const times = [];
  while ((m = ptsRegex.exec(r1.stderr)) !== null) times.push(parseFloat(m[1]));
  frames = files.map((f, i) => ({ file: f, time: times[i] ?? null }));
} else {
  frames = files.map((f, i) => ({ file: f, time: i * intervalFallback }));
}

writeFileSync(join(outDir, 'keyframes.json'), JSON.stringify({
  input,
  threshold,
  count: frames.length,
  mode: sceneCount >= 3 ? 'scene-change' : 'interval-fallback',
  frames,
}, null, 2));

process.stdout.write(`[extract-keyframes] ${frames.length} frames -> ${outDir}\n`);
log({ level: 'info', action: 'extract-keyframes', duration_ms: Date.now() - start, extra: { count: frames.length, mode: sceneCount >= 3 ? 'scene' : 'fallback' } });
