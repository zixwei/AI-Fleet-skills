// 자막+오디오+시각 신호 가중합 -> 하이라이트 상위 K구간 추출
// 실행: node scripts/highlight-score.mjs <words.json> [--audio-rms <audio.json>] [--keyframes <keyframes.json>] [--window 30] [--top 3]
// 결과 stdout: { highlights: [{start, end, score, signals}] }

import { readFileSync, existsSync } from 'node:fs';
import { log } from './logger.mjs';

const args = process.argv.slice(2);
if (args.length === 0 || args[0].startsWith('--')) {
  process.stderr.write('Usage: node scripts/highlight-score.mjs <words.json> [--audio-rms <audio.json>] [--keyframes <keyframes.json>] [--window 30] [--top 3]\n');
  process.exit(2);
}

function getArg(name, def) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
}

const wordsFile = args[0];
const audioFile = getArg('--audio-rms', null);
const kfFile = getArg('--keyframes', null);
const windowSec = parseFloat(getArg('--window', '30'));
const topK = parseInt(getArg('--top', '3'), 10);

const data = JSON.parse(readFileSync(wordsFile, 'utf8'));
const words = data.words || [];
const duration = data.duration || (words.length ? words[words.length - 1].end : 0);

// 가중치 정책 (references/highlight-scoring.md와 동기화)
const WEIGHTS = {
  EMPHASIS_KO: ['결국', '핵심', '진짜', '제일', '가장', '드디어', '특히'],
  EMPHASIS_EN: ['actually', 'finally', 'key', 'crucial', 'really', 'most', 'especially'],
  W_EMPHASIS: 2,
  W_QUESTION: 1,
  W_NUMBER: 1,
  W_AUDIO_PEAK: 2,
  W_SCENE_DENSE: 1,
};

const audio = audioFile && existsSync(audioFile) ? JSON.parse(readFileSync(audioFile, 'utf8')) : null;
const kf = kfFile && existsSync(kfFile) ? JSON.parse(readFileSync(kfFile, 'utf8')) : null;

function scoreAtSecond(sec) {
  const winStart = sec;
  const winEnd = sec + windowSec;
  let score = 0;
  const signals = { emphasis: 0, question: 0, number: 0, audio_peak: 0, scene_dense: 0 };

  for (const w of words) {
    if (w.end < winStart || w.start > winEnd) continue;
    const t = (w.text || '').toLowerCase();
    if (WEIGHTS.EMPHASIS_KO.some((k) => t.includes(k)) || WEIGHTS.EMPHASIS_EN.includes(t)) {
      score += WEIGHTS.W_EMPHASIS; signals.emphasis++;
    }
    if (t.includes('?') || t.endsWith('까') || t.endsWith('나요')) {
      score += WEIGHTS.W_QUESTION; signals.question++;
    }
    if (/\d/.test(t)) {
      score += WEIGHTS.W_NUMBER; signals.number++;
    }
  }

  if (audio && audio.peaks) {
    const peaksInWindow = audio.peaks.filter((p) => p >= winStart && p <= winEnd).length;
    if (peaksInWindow > 0) {
      score += WEIGHTS.W_AUDIO_PEAK * peaksInWindow;
      signals.audio_peak = peaksInWindow;
    }
  }

  if (kf && kf.frames) {
    const framesInWindow = kf.frames.filter((f) => f.time != null && f.time >= winStart && f.time <= winEnd).length;
    if (framesInWindow >= 2) {
      score += WEIGHTS.W_SCENE_DENSE * Math.floor(framesInWindow / 2);
      signals.scene_dense = framesInWindow;
    }
  }

  return { start: round(winStart), end: round(Math.min(winEnd, duration)), score, signals };
}

// sliding window — 1초 step
const candidates = [];
for (let s = 0; s + 5 < duration; s++) {
  candidates.push(scoreAtSecond(s));
}

// 중복 제거 — 인접 후보가 겹치면 점수 높은 것만
candidates.sort((a, b) => b.score - a.score);
const picked = [];
for (const c of candidates) {
  if (picked.some((p) => Math.max(p.start, c.start) < Math.min(p.end, c.end))) continue;
  picked.push(c);
  if (picked.length >= topK) break;
}

picked.sort((a, b) => a.start - b.start);

process.stdout.write(JSON.stringify({ duration, window: windowSec, top: topK, highlights: picked }, null, 2) + '\n');
log({ level: 'info', action: 'highlight-score', extra: { top: topK, picked: picked.length } });

function round(n) { return Math.round(n * 100) / 100; }
