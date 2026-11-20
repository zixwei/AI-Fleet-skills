# Workflow 01: 타임코드 직접 편집

사용자가 시간을 명시한 컷/트림/속도/페이드 명령을 capcut-cli로 변환·실행.

## 입력 예시

- "0:45~1:15 잘라줘"
- "1분 30초부터 2분까지 1.5배속"
- "끝부분 5초 페이드아웃"
- "처음 3초 트림"

## 인텐트 파싱

자연어 -> 다음 구조로 정규화:

```json
{
  "action": "cut|trim|speed|audio-fade|opacity",
  "from": "HH:MM:SS.ss",
  "to": "HH:MM:SS.ss",
  "params": { "speed": 1.5, "fade": "out", "duration_sec": 5 }
}
```

시간 표현 정규화:
- `0:45` -> `00:00:45.00`
- `1분 30초` -> `00:01:30.00`
- `끝부분 5초` -> `from = duration - 5, to = duration`

## 처리 단계

1. **사전 검증 게이트** (SKILL.md §2)
2. **프로젝트 경로 확인** — `node scripts/locate-project.mjs` 결과 사용
3. **dry-run 실행**:
   ```bash
   capcut <action> --from <from> --to <to> [<params>] --dry-run --project <draft-dir>
   ```
4. dry-run 결과를 사용자에게 표시 (변경될 세그먼트, 영향 트랙)
5. **사용자 승인** (명시적 OK 받기 전 실제 실행 금지)
6. **실제 실행**: 위 명령에서 `--dry-run` 제거
7. **검증**: `capcut info --project <draft-dir>` diff 출력
8. **로깅**: `scripts/logger.mjs` -> `{workflow: '01', action, from, to, dry_run, exit_code, duration_ms}`

## capcut-cli 매핑 표

| 자연어 동사 | CLI 명령 | 핵심 옵션 |
|-------------|----------|-----------|
| 잘라 / 삭제 | `capcut cut` | `--from`, `--to` |
| 트림 / 다듬어 | `capcut trim` | `--from`, `--to` |
| 빠르게 / 느리게 | `capcut speed` | `--from`, `--to`, `--rate` |
| 페이드 | `capcut audio-fade` | `--from`, `--to`, `--type in\|out` |
| 투명도 | `capcut opacity` | `--from`, `--to`, `--value` |
| 자리 이동 | `capcut shift` | `--segment <id>`, `--offset` |

## 실패 시 폴백

- `--from > --to` 또는 `--to > duration`: 사용자에게 정정 요청
- 세그먼트 미존재: `capcut segments` 호출하여 가능한 ID 제시
- CLI 비정상 종료: `scripts/logger.mjs` -> error-kb (`cli-version-mismatch` 카테고리 확인)
- 변경 결과가 의도와 다름: `capcut restore --backup latest` 자동 안내

## 검증 (테스트 시나리오)

1. `tests/fixtures/sample-30s.mp4` 기반 픽스처 프로젝트
2. "0:05~0:08 잘라줘" -> dry-run으로 3초 컷 표시 확인
3. 승인 -> `capcut info`로 길이 -3초 확인
4. "되돌려" -> `capcut restore`로 원본 복구
