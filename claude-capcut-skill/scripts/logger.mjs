// 구조화 jsonl 로그 + error-kb 자동 기록
// 사용: import { log, recordError } from './logger.mjs'
//      log({ level: 'info', workflow: '03', action: 'silence-cut', ... })
//      recordError('process-conflict', '...상세...')

import { mkdirSync, appendFileSync, existsSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = join(__dirname, '..');
const LOG_DIR = join(SKILL_ROOT, 'logs');
const ERROR_KB_DIR = join(homedir(), '.claude', 'error-kb', 'active');

const KNOWN_CATEGORIES = new Set([
  'schema-mismatch',
  'pro-only-feature',
  'redirected-url',
  'process-conflict',
  'cli-version-mismatch',
]);

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function todayLogFile() {
  ensureDir(LOG_DIR);
  const d = new Date();
  const yyyymmdd = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  return join(LOG_DIR, `${yyyymmdd}.jsonl`);
}

export function log(entry) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level: entry.level || 'info',
    workflow: entry.workflow || null,
    action: entry.action || null,
    intent: entry.intent || null,
    input_summary: entry.input_summary || null,
    dry_run: entry.dry_run ?? null,
    exit_code: entry.exit_code ?? null,
    duration_ms: entry.duration_ms ?? null,
    error: entry.error || null,
    extra: entry.extra || null,
  });
  try {
    appendFileSync(todayLogFile(), line + '\n', 'utf8');
  } catch (e) {
    process.stderr.write(`[logger] write failed: ${e.message}\n`);
  }
}

export function recordError(category, details) {
  if (!KNOWN_CATEGORIES.has(category)) {
    log({ level: 'warn', action: 'recordError', error: `unknown category: ${category}` });
    return;
  }
  ensureDir(ERROR_KB_DIR);
  const file = join(ERROR_KB_DIR, `capcut-${category}.md`);
  const ts = new Date().toISOString();
  const block = `\n## ${ts}\n${details}\n`;
  try {
    if (!existsSync(file)) {
      const header = `# capcut: ${category}\n\nCapCut 스킬에서 자동 기록된 ${category} 패턴.\n`;
      writeFileSync(file, header + block, 'utf8');
    } else {
      appendFileSync(file, block, 'utf8');
    }
    log({ level: 'warn', action: 'recordError', extra: { category, file } });
  } catch (e) {
    log({ level: 'error', action: 'recordError', error: e.message });
  }
}

export function timer() {
  const start = Date.now();
  return () => Date.now() - start;
}
