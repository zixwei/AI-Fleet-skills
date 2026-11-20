# capcut-cli Cheatsheet

`capcut-cli` (>= 0.9.0) 전체 명령 그룹별 정리. 본 스킬에서 자연어를 CLI 명령으로 변환할 때 참조.

> 권위 있는 레퍼런스는 `capcut --help` 및 [공식 저장소](https://github.com/renezander030/capcut-cli). 본 문서는 사용 빈도순 요약.

---

## 1. 검사 (Read-only, dry-run 불필요)

| 명령 | 설명 |
|------|------|
| `capcut info [--project <dir>]` | 프로젝트 메타 (길이, 해상도, 트랙 수) |
| `capcut tracks` | 트랙 목록 |
| `capcut materials` | 사용된 미디어 자산 |
| `capcut segments` | 세그먼트 목록 (ID 포함) |
| `capcut texts` | 자막/텍스트 트랙 |
| `capcut export-srt --out <file>` | 자막 SRT 내보내기 |
| `capcut doctor` | 환경 자체 검증 |

## 2. 생성

| 명령 | 설명 |
|------|------|
| `capcut init --name <name>` | 빈 드래프트 생성 |
| `capcut add-video <file> [--at <time>]` | 비디오 클립 추가 |
| `capcut add-audio <file> [--at <time>]` | 오디오 추가 |
| `capcut add-text "<text>" --at <time> [--style ...]` | 텍스트 추가 |
| `capcut add-sticker <file> --at <time>` | 스티커 추가 |
| `capcut add-effect <name> --from <t> --to <t>` | 이펙트 추가 |

## 3. 편집 (모든 쓰기는 `--dry-run` 우선)

| 명령 | 설명 |
|------|------|
| `capcut cut --from <t> --to <t>` | 구간 잘라내기 |
| `capcut trim --from <t> --to <t>` | 시작/끝 다듬기 |
| `capcut speed --from <t> --to <t> --rate <x>` | 구간 속도 조절 |
| `capcut volume --from <t> --to <t> --level <db>` | 음량 조절 |
| `capcut opacity --from <t> --to <t> --value <0-1>` | 투명도 |
| `capcut shift --segment <id> --offset <sec>` | 세그먼트 이동 |
| `capcut set-text --id <id> --text "<new>"` | 텍스트 변경 |
| `capcut batch --operations <ops.json>` | 다수 동작 일괄 적용 |

## 4. 데코레이터

| 명령 | 설명 |
|------|------|
| `capcut keyframe --segment <id> --time <t> --prop <prop> --value <v>` | 키프레임 |
| `capcut transition --between <id1> <id2> --type <fade\|slide\|...>` | 전환 |
| `capcut mask --segment <id> --shape <circle\|rect\|...>` | 마스크 |
| `capcut bg-blur --segment <id> --amount <0-1>` | 배경 블러 |
| `capcut text-style --id <id> --font <name> --size <pt> --color <#hex>` | 텍스트 스타일 |
| `capcut text-anim --id <id> --type <typewriter\|pop\|...>` | 텍스트 애니메이션 |
| `capcut image-anim --segment <id> --type <pan\|zoom\|...>` | 이미지 애니메이션 |
| `capcut mix-mode --segment <id> --mode <multiply\|screen\|...>` | 블렌딩 |
| `capcut audio-fade --from <t> --to <t> --type <in\|out>` | 오디오 페이드 |
| `capcut add-filter --segment <id> --name <name>` | 필터 |
| `capcut bubble-text "<text>" --style <name>` | 말풍선 텍스트 |
| `capcut chroma --segment <id> --color <#hex>` | 크로마키 |

## 5. 자막

| 명령 | 설명 |
|------|------|
| `capcut caption [--whisper-model <auto\|tiny\|...>] [--language <auto\|ko\|en\|...>]` | Whisper로 자막 생성 |
| `capcut import-srt <file>` | SRT 임포트 |
| `capcut import-ass <file>` | ASS 임포트 |
| `capcut translate --to <lang>` | 자막 번역 (Anthropic API) |

## 6. 템플릿

| 명령 | 설명 |
|------|------|
| `capcut save-template --name <name> [--scope <auto\|text-style\|intro\|layout>]` | 템플릿 저장 |
| `capcut apply-template <name> [--target <file>]` | 템플릿 적용 |
| `capcut list-templates` | 템플릿 목록 |

## 7. 롱폼 -> 쇼츠

| 명령 | 설명 |
|------|------|
| `capcut cut --from <t> --to <t> --output <file>` | 구간을 별도 파일로 추출 |
| `capcut apply-template shorts-9x16 --target <file>` | 9:16 레이아웃 적용 |

## 8. 유지보수

| 명령 | 설명 |
|------|------|
| `capcut prune [--dry-run]` | 미사용 자산 정리 |
| `capcut relink [--auto]` | 깨진 미디어 링크 복구 |
| `capcut concat <a.mp4> <b.mp4> --output <out>` | 영상 연결 |
| `capcut diff <backup-id>` | 변경 비교 |
| `capcut lint` | 프로젝트 정합성 검사 |
| `capcut restore --backup <id\|latest>` | 백업 복구 |

## 9. 공통 옵션

| 옵션 | 설명 |
|------|------|
| `--project <dir>` | 대상 draft 폴더 (생략 시 자동 검색) |
| `--dry-run` | 실제 변경 없이 미리보기 |
| `-H, --human` | 사람 읽기 좋게 출력 |
| `-q, --quiet` | 종료 코드만 |
| `--json` | JSON 출력 (기본) |
| `--no-backup` | 자동 백업 비활성 (권장 X) |

## 10. 환경 변수

| 변수 | 용도 |
|------|------|
| `ANTHROPIC_API_KEY` | `capcut translate`에 필요 |
| `OPENAI_API_KEY` | (선택) 일부 캡션 옵션 |
| `CAPCUT_DRAFT_ROOT` | draft 폴더 경로 오버라이드 |
