// capcut-cli 자동 설치 헬퍼
// 실행: node scripts/install.mjs
// 옵션: --skip-whisper, --skip-ffmpeg
// 선택 도구는 안내만 출력하고 사용자가 직접 설치하도록 한다 (OS별 매니저 상이).

import { execSync } from 'node:child_process';
import { platform } from 'node:os';
import { log } from './logger.mjs';

const args = new Set(process.argv.slice(2));

function run(cmd) {
  process.stdout.write(`$ ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit' });
}

function detect(cmd) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// 1. capcut-cli (필수)
if (detect('capcut')) {
  process.stdout.write('[1] capcut-cli: 이미 설치됨\n');
} else {
  process.stdout.write('[1] capcut-cli: 설치 중...\n');
  try {
    run('npm install -g capcut-cli');
  } catch (e) {
    process.stderr.write('capcut-cli 설치 실패. 권한 문제일 수 있습니다.\n');
    process.stderr.write('  - macOS/Linux: sudo npm install -g capcut-cli\n');
    process.stderr.write('  - Windows: 관리자 권한으로 다시 실행\n');
    log({ level: 'error', action: 'install', error: e.message });
    process.exit(1);
  }
}

// 2. FFmpeg 안내
if (!args.has('--skip-ffmpeg')) {
  if (detect('ffmpeg')) {
    process.stdout.write('[2] FFmpeg: 이미 설치됨\n');
  } else {
    process.stdout.write('[2] FFmpeg: 선택 의존성. 다음 명령으로 설치하세요.\n');
    const os = platform();
    if (os === 'darwin') process.stdout.write('    brew install ffmpeg\n');
    else if (os === 'win32') process.stdout.write('    winget install Gyan.FFmpeg  또는  choco install ffmpeg\n');
    else process.stdout.write('    sudo apt install ffmpeg  또는  sudo dnf install ffmpeg\n');
  }
}

// 3. Whisper 안내
if (!args.has('--skip-whisper')) {
  if (detect('whisper') || detect('whisper-cpp')) {
    process.stdout.write('[3] Whisper: 이미 설치됨\n');
  } else {
    process.stdout.write('[3] Whisper: 선택 의존성. 다음 중 하나 설치하세요.\n');
    process.stdout.write('    pip install openai-whisper      (Python, GPU 권장)\n');
    process.stdout.write('    또는 whisper.cpp 빌드            (가벼움)\n');
  }
}

// 4. 안내 종료
process.stdout.write('\n검증: node scripts/doctor.mjs\n');
log({ level: 'info', action: 'install', extra: { args: [...args] } });
