// CapCut/JianYing 프로세스 실행 중 검사
// 실행: node scripts/lock-check.mjs
// exit code 0: 안전 (실행 중 아님), 1: 실행 중 감지, 2: 검사 실패

import { execSync } from 'node:child_process';
import { platform } from 'node:os';
import { log } from './logger.mjs';

const PROCESS_NAMES = ['CapCut', 'capcut', 'JianYing', 'jianying', 'CapCut.exe', 'JianYingPro.exe'];

function detectRunning() {
  const os = platform();
  try {
    if (os === 'win32') {
      const out = execSync('tasklist /FO CSV /NH', { encoding: 'utf8' }).toLowerCase();
      return PROCESS_NAMES.filter((n) => out.includes(n.toLowerCase()));
    }
    // macOS / linux / WSL
    const out = execSync('ps -A -o comm= 2>/dev/null || ps -e', { encoding: 'utf8', shell: '/bin/bash' });
    const lower = out.toLowerCase();
    return PROCESS_NAMES.filter((n) => lower.includes(n.toLowerCase()));
  } catch (e) {
    return null;
  }
}

const found = detectRunning();

if (found === null) {
  process.stderr.write('[lock-check] 프로세스 조회 실패 (안전 가정 X). 수동 확인 후 진행하세요.\n');
  log({ level: 'warn', action: 'lock-check', error: 'enumeration failed' });
  process.exit(2);
}

if (found.length > 0) {
  process.stdout.write(`[lock-check] running: ${found.join(', ')}\n`);
  process.stdout.write('CapCut을 종료해 주세요. 계속 진행하면 변경이 덮어쓰일 수 있습니다.\n');
  log({ level: 'warn', action: 'lock-check', extra: { running: found } });
  process.exit(1);
}

process.stdout.write('[lock-check] ok (no CapCut/JianYing process running)\n');
log({ level: 'info', action: 'lock-check' });
process.exit(0);
