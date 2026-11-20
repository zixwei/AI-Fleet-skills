// Whisper 호출 + 단어별 타임코드 JSON 생성
// 영상 길이별 모델 자동 선택 (token-budget.md 정책)
// 실행: node scripts/transcribe.mjs <input.mp4> [--model <auto|tiny|base|medium|large-v3>] [--language <auto|ko|en|...>] [--out-dir <dir>]
// 출력: <input>.srt + <input>.words.json (단어별 start/end 포함)

import { spawnSync, execSync } from 'node:child_process';
import { existsSync, mkdirSync, renameSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { log } from './logger.mjs';

const args = process.argv.slice(2);
if (args.length === 0 || args[0].startsWith('--')) {
  process.stderr.write('Usage: node scripts/transcribe.mjs <input.mp4> [--model auto] [--language auto] [--out-dir <dir>]\n');
  process.exit(2);
}

const input = args[0];
const modelArg = getArg('--model', 'auto');
const languageArg = getArg('--language', 'auto');
const outDir = getArg('--out-dir', dirname(input));

if (!existsSync(input)) {
  process.stderr.write(`[transcribe] 입력 파일 없음: ${input}\n`);
  process.exit(2);
}

mkdirSync(outDir, { recursive: true });

function getArg(name, def) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
}

// 1. ffprobe로 영상 길이 측정
function getDurationSec(file) {
  try {
    const out = execSync(`ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${file}"`, { encoding: 'utf8' });
    return Math.round(parseFloat(out));
  } catch {
    return null;
  }
}

const duration = getDurationSec(input);
if (duration === null) {
  process.stderr.write('[transcribe] ffprobe 실패. ffmpeg 설치 확인 필요.\n');
  process.exit(3);
}

// 2. 모델 자동 선택
function autoModel(sec) {
  if (sec < 30) return 'tiny';
  if (sec < 300) return 'base';
  if (sec < 1800) return 'medium';
  return 'large-v3';
}

const model = modelArg === 'auto' ? autoModel(duration) : modelArg;
const language = languageArg === 'auto' ? null : languageArg;

process.stdout.write(`[transcribe] duration=${duration}s, model=${model}, language=${language || 'auto'}\n`);

// 3. Whisper 호출 (word_timestamps 필수)
const whisperCmd = process.platform === 'win32' ? 'whisper.exe' : 'whisper';
const whisperArgs = [
  input,
  '--model', model,
  '--output_dir', outDir,
  '--output_format', 'json',
  '--word_timestamps', 'True',
  '--verbose', 'False',
];
if (language) whisperArgs.push('--language', language);

const start = Date.now();
const result = spawnSync(whisperCmd, whisperArgs, { stdio: ['ignore', 'inherit', 'inherit'] });

if (result.status !== 0) {
  process.stderr.write(`[transcribe] whisper 종료 코드 ${result.status}\n`);
  log({ level: 'error', action: 'transcribe', exit_code: result.status });
  process.exit(4);
}

// 4. 결과 정리 — Whisper가 생성한 JSON을 .words.json + .srt로 정규화
const base = basename(input, /\.[^.]+$/.test(input) ? input.match(/\.[^.]+$/)[0] : '');
const whisperJson = join(outDir, base + '.json');
const wordsJson = join(outDir, base + '.words.json');
const whisperSrt = join(outDir, base + '.srt');

if (existsSync(whisperJson)) {
  const data = JSON.parse(readFileSync(whisperJson, 'utf8'));
  const words = [];
  for (const seg of data.segments || []) {
    for (const w of seg.words || []) {
      words.push({ text: (w.word || '').trim(), start: w.start, end: w.end });
    }
  }
  writeFileSync(wordsJson, JSON.stringify({ duration, model, language: data.language || language || 'auto', words }, null, 2));
}

process.stdout.write(`[transcribe] done in ${Date.now() - start}ms\n`);
process.stdout.write(`SRT:   ${whisperSrt}\n`);
process.stdout.write(`Words: ${wordsJson}\n`);
log({ level: 'info', action: 'transcribe', duration_ms: Date.now() - start, extra: { model, duration } });
