// 환경 검증 6단계
// 실행: node scripts/doctor.mjs
// exit code 0: 필수 PASS, 1: 필수 FAIL

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { log } from './logger.mjs';

function tryCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function parseSemver(s) {
  const m = (s || '').match(/(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null;
  return [+m[1], +m[2], +m[3]];
}

function cmpSemver(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

const REQUIRED_CLI = [0, 9, 0]; // capcut-cli >= 0.9.0

const checks = [];
let failed = 0;

// 1. Node
{
  const v = tryCmd('node -v');
  const ver = parseSemver(v);
  const ok = ver && ver[0] >= 18;
  checks.push(['Node', v || 'MISSING', ok, true]);
  if (!ok) failed++;
}

// 2. capcut-cli
{
  const v = tryCmd('capcut --version') || tryCmd('npx --no-install capcut-cli --version');
  const ver = parseSemver(v);
  const ok = ver && cmpSemver(ver, REQUIRED_CLI) >= 0;
  checks.push(['capcut-cli', v || 'MISSING', ok, true]);
  if (!ok) failed++;
}

// 3. FFmpeg
{
  const v = tryCmd('ffmpeg -version');
  const head = v ? v.split('\n')[0] : null;
  const ok = !!v;
  checks.push(['FFmpeg', head || 'MISSING (선택 — 02/04 워크플로우에 필요)', ok, false]);
}

// 4. Whisper
{
  const v = tryCmd('whisper --help') || tryCmd('whisper-cpp --help');
  const ok = !!v;
  checks.push(['Whisper', ok ? 'detected' : 'MISSING (선택 — 02/04/05 워크플로우에 필요)', ok, false]);
}

// 5. CapCut Desktop / 6. draft 경로 — locate-project.mjs 위임
let draftFound = false;
let draftFirst = null;
try {
  const out = execSync('node ' + new URL('./locate-project.mjs', import.meta.url).pathname, { encoding: 'utf8' });
  const lines = out.trim().split('\n').filter(Boolean);
  if (lines.length > 0) {
    draftFound = true;
    draftFirst = lines[0];
  }
} catch {}
checks.push(['CapCut Desktop', draftFound ? '설치 감지됨' : '미감지 (Web 미지원)', draftFound, true]);
checks.push(['Draft 경로', draftFirst || 'NOT_FOUND', draftFound, true]);
if (!draftFound) failed += 2;

// 출력
const total = checks.length;
checks.forEach((c, i) => {
  const [name, value, ok, required] = c;
  const flag = ok ? 'OK' : required ? 'FAIL' : 'OPT';
  process.stdout.write(`[${i + 1}/${total}] ${name.padEnd(16)} ${value}  [${flag}]\n`);
});

log({ level: failed ? 'error' : 'info', action: 'doctor', extra: { failed, total } });

if (failed > 0) {
  process.stdout.write(`\n필수 ${failed}건 실패. 설치 가이드: README.md "설치" 섹션 참조.\n`);
  process.exit(1);
}
process.stdout.write('\n모든 필수 항목 PASS.\n');
process.exit(0);
