// 단어 타임코드 JSON에서 무음/NG 구간 산출
// 실행: node scripts/detect-silence.mjs <words.json> [--gap 1.0] [--similarity 0.85]
// 결과 stdout: { silences: [{start, end, duration}], duplicates: [{keep, drop: [{start, end, text}]}] }

import { readFileSync } from 'node:fs';
import { log } from './logger.mjs';

const args = process.argv.slice(2);
if (args.length === 0 || args[0].startsWith('--')) {
  process.stderr.write('Usage: node scripts/detect-silence.mjs <words.json> [--gap 1.0] [--similarity 0.85]\n');
  process.exit(2);
}

function getArg(name, def) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
}

const file = args[0];
const gapThreshold = parseFloat(getArg('--gap', '1.0'));
const simThreshold = parseFloat(getArg('--similarity', '0.85'));

const data = JSON.parse(readFileSync(file, 'utf8'));
const words = data.words || [];

// 1. 무음 구간 — 인접 단어 간격 > gapThreshold
const silences = [];
for (let i = 1; i < words.length; i++) {
  const prev = words[i - 1];
  const cur = words[i];
  const gap = cur.start - prev.end;
  if (gap > gapThreshold) {
    silences.push({ start: round(prev.end), end: round(cur.start), duration: round(gap) });
  }
}

// 2. 발화 그룹화 — 무음으로 분리된 문장 단위
const segments = [];
let buf = [];
let segStart = null;
for (let i = 0; i < words.length; i++) {
  const w = words[i];
  if (buf.length === 0) segStart = w.start;
  buf.push(w);
  const next = words[i + 1];
  const breakHere = !next || (next.start - w.end) > gapThreshold;
  if (breakHere) {
    segments.push({
      start: round(segStart),
      end: round(w.end),
      text: buf.map((x) => x.text).join(' ').trim(),
    });
    buf = [];
    segStart = null;
  }
}

// 3. NG/중복 테이크 — 유사 문장 반복 시 마지막만 유지
function normalize(s) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
}

function jaccard(a, b) {
  const A = new Set(normalize(a).split(' ').filter(Boolean));
  const B = new Set(normalize(b).split(' ').filter(Boolean));
  if (A.size === 0 && B.size === 0) return 1;
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union === 0 ? 0 : inter / union;
}

const duplicates = [];
const used = new Set();
for (let i = 0; i < segments.length; i++) {
  if (used.has(i)) continue;
  const group = [i];
  for (let j = i + 1; j < segments.length; j++) {
    if (used.has(j)) continue;
    if (jaccard(segments[i].text, segments[j].text) >= simThreshold) {
      group.push(j);
    }
  }
  if (group.length >= 2) {
    const keep = segments[group[group.length - 1]];
    const drop = group.slice(0, -1).map((k) => segments[k]);
    duplicates.push({ keep, drop });
    group.forEach((k) => used.add(k));
  }
}

const out = { silences, duplicates, segments_count: segments.length, gap_threshold: gapThreshold, similarity_threshold: simThreshold };
process.stdout.write(JSON.stringify(out, null, 2) + '\n');
log({ level: 'info', action: 'detect-silence', extra: { silences: silences.length, duplicates: duplicates.length } });

function round(n) { return Math.round(n * 100) / 100; }
