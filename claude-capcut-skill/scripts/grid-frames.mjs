// 키프레임 N장을 그리드 1장으로 합성 (vision 토큰 절감)
// 실행: node scripts/grid-frames.mjs <frames-dir> [--cols 3] [--rows 3] [--out <out.jpg>]
// 기본 3x3. 9장보다 적으면 빈 셀로 패딩. 9장보다 많으면 여러 grid 생성.

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { log } from './logger.mjs';

const args = process.argv.slice(2);
if (args.length === 0 || args[0].startsWith('--')) {
  process.stderr.write('Usage: node scripts/grid-frames.mjs <frames-dir> [--cols 3] [--rows 3] [--out <out.jpg>]\n');
  process.exit(2);
}

function getArg(name, def) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
}

const dir = args[0];
const cols = parseInt(getArg('--cols', '3'), 10);
const rows = parseInt(getArg('--rows', '3'), 10);
const perGrid = cols * rows;
const outBase = getArg('--out', join(dir, 'grid'));

if (!existsSync(dir)) {
  process.stderr.write(`[grid-frames] 디렉토리 없음: ${dir}\n`);
  process.exit(2);
}

const files = readdirSync(dir).filter((f) => f.endsWith('.jpg') && !f.startsWith('grid')).sort();
if (files.length === 0) {
  process.stderr.write('[grid-frames] jpg 파일 없음\n');
  process.exit(2);
}

function makeGrid(batch, outPath) {
  // ffmpeg tile 필터 사용 — 입력 N개를 NxM 격자로 합성
  const inputs = [];
  for (const f of batch) {
    inputs.push('-i', join(dir, f));
  }
  // hstack/vstack 직접 작성보다 xstack가 간단
  const layout = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx >= batch.length) break;
      const x = c === 0 ? '0' : Array.from({ length: c }, (_, i) => `w${i}`).join('+');
      const y = r === 0 ? '0' : Array.from({ length: r }, (_, i) => `h${i * cols}`).join('+');
      layout.push(`${x}_${y}`);
    }
  }
  // 단순화를 위해 ffmpeg tile filter 사용 (모든 입력 동일 크기일 때 동작)
  const args = [
    '-y',
    ...inputs,
    '-filter_complex', `tile=${cols}x${rows}`,
    outPath,
  ];
  // 입력이 perGrid보다 적으면 tile 마지막 셀은 검정으로 자동 패딩
  const r = spawnSync('ffmpeg', args, { encoding: 'utf8' });
  return r.status === 0;
}

const grids = [];
const start = Date.now();

for (let i = 0; i < files.length; i += perGrid) {
  const batch = files.slice(i, i + perGrid);
  const outPath = `${outBase}_${String(i / perGrid).padStart(2, '0')}.jpg`;
  if (makeGrid(batch, outPath)) {
    grids.push({ file: outPath, frames: batch });
    process.stdout.write(`[grid-frames] ${outPath} (${batch.length}/${perGrid} cells)\n`);
  } else {
    process.stderr.write(`[grid-frames] 합성 실패: ${batch.join(',')}\n`);
  }
}

const manifest = join(dir, 'grids.json');
writeFileSync(manifest, JSON.stringify({ cols, rows, perGrid, grids }, null, 2));
process.stdout.write(`[grid-frames] manifest: ${manifest}\n`);
log({ level: 'info', action: 'grid-frames', duration_ms: Date.now() - start, extra: { grids: grids.length, total_frames: files.length } });
