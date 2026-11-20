// OS별 CapCut/JianYing draft 폴더 검색 + Web 흔적 감지
// 실행: node scripts/locate-project.mjs
// 결과: 발견된 draft 폴더 경로를 stdout으로, 미발견 + Web 흔적 시 stderr 경고

import { existsSync, readdirSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';
import { log } from './logger.mjs';

function candidatePaths() {
  const home = homedir();
  const os = platform();
  const paths = [];

  if (os === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || join(home, 'AppData', 'Local');
    paths.push(join(localAppData, 'CapCut', 'User Data', 'Projects', 'com.lveditor.draft'));
    paths.push(join(localAppData, 'JianyingPro', 'User Data', 'Projects', 'com.lveditor.draft'));
  } else if (os === 'darwin') {
    paths.push(join(home, 'Movies', 'CapCut', 'User Data', 'Projects', 'com.lveditor.draft'));
    paths.push(join(home, 'Movies', 'JianYingPro', 'User Data', 'Projects', 'com.lveditor.draft'));
  } else {
    // Linux / WSL — CapCut Desktop 미지원. WSL에서 /mnt/c 경로로 Windows 측 접근 시도.
    const winLocalAppData = '/mnt/c/Users';
    if (existsSync(winLocalAppData)) {
      for (const user of safeRead(winLocalAppData)) {
        paths.push(join(winLocalAppData, user, 'AppData', 'Local', 'CapCut', 'User Data', 'Projects', 'com.lveditor.draft'));
        paths.push(join(winLocalAppData, user, 'AppData', 'Local', 'JianyingPro', 'User Data', 'Projects', 'com.lveditor.draft'));
      }
    }
  }
  return paths;
}

function safeRead(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return [];
  }
}

function detectWebOnly() {
  // 매우 약한 신호. 브라우저 북마크나 다운로드 폴더에 CapCut Web 관련 파일이 있는지 정도만 본다.
  const home = homedir();
  const candidates = [
    join(home, 'Downloads'),
  ];
  for (const dir of candidates) {
    if (!existsSync(dir)) continue;
    for (const f of safeRead(dir).concat([])) {
      if (f.toLowerCase().includes('capcut') && !f.toLowerCase().includes('.dmg')) return true;
    }
  }
  return false;
}

const found = candidatePaths().filter((p) => existsSync(p));

if (found.length === 0) {
  process.stderr.write('[locate-project] CapCut/JianYing Desktop draft 폴더 미발견.\n');
  if (detectWebOnly()) {
    process.stderr.write('CapCut Web 흔적이 감지되었습니다. 본 스킬은 Desktop 전용입니다. Desktop을 설치한 뒤 재시도해 주세요.\n');
  } else {
    process.stderr.write('CapCut 또는 JianYing Desktop을 설치하고 최소 1개 프로젝트를 만든 뒤 다시 실행하세요.\n');
  }
  log({ level: 'warn', action: 'locate-project', error: 'not-found' });
  process.exit(1);
}

for (const p of found) process.stdout.write(p + '\n');
log({ level: 'info', action: 'locate-project', extra: { count: found.length, first: found[0] } });
process.exit(0);
