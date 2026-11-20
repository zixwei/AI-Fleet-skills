# claude-capcut-skill

> Claude Code Skill for automating CapCut / JianYing video projects via `capcut-cli`.
> Natural-language driven cutting, content search, talking-head silence removal, long-to-shorts, subtitle styling, project inspection — all with dry-run, automatic backup, and rollback.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A518-339933)](https://nodejs.org)
[![capcut-cli](https://img.shields.io/badge/capcut--cli-%E2%89%A50.9.0-blue)](https://github.com/renezander030/capcut-cli)

---

## TL;DR

```
사용자: "이 캡컷 프로젝트에서 무음 다 자르고 영어 자막 입혀줘"
Claude Code: → SKILL 자동 감지
            → workflows/03 (silence cut) + workflows/05 (subtitle+translate)
            → dry-run 미리보기 표시
            → 승인 후 capcut-cli 실행
            → capcut info diff + 백업 안내
```

지원 시나리오: 타임코드 컷 / 내용 기반 장면 찾기 / 토킹헤드 자동 정리 / 롱폼→쇼츠 / 자막 스타일·번역 / 프로젝트 검사·롤백.

---

## 한국어 가이드

### 1. 설치

```bash
# 1) 저장소 클론
git clone https://github.com/mane23-ai/claude-capcut-skill.git
cd claude-capcut-skill

# 2) Claude Code 스킬 디렉토리로 symlink
#    (macOS/Linux/WSL)
ln -s "$(pwd)" ~/.claude/skills/capcut

# 3) capcut-cli 자동 설치
node scripts/install.mjs

# 4) 환경 검증
node scripts/doctor.mjs
```

doctor.mjs가 6/6 PASS면 사용 준비 완료. capcut-cli만 부족하면 `npm install -g capcut-cli`로 직접 설치.

### 2. 필수·선택 의존성

| 구분 | 도구 | 용도 |
|------|------|------|
| 필수 | Node ≥ 18 | 스킬 런타임 |
| 필수 | capcut-cli ≥ 0.9.0 | CapCut 프로젝트 편집 |
| 필수 | CapCut / JianYing Desktop | 프로젝트 생성·미리보기 (Web 미지원) |
| 선택 | FFmpeg | 키프레임·오디오 분석 (워크플로우 02/04) |
| 선택 | Whisper | 자막 생성 (워크플로우 02/03/04/05) |
| 선택 | ANTHROPIC_API_KEY | 자막 번역 (워크플로우 05) |

### 3. 사용

자연어 또는 `/capcut` 명시 호출 둘 다 지원.

```
"이 캡컷 프로젝트 트랙 보여줘"      → workflow 06
"0:45부터 1:15까지 잘라"            → workflow 01
"강아지 점프하는 장면 찾아서 잘라"  → workflow 02
"무음 다 잘라"                       → workflow 03
"30초 쇼츠 3개 뽑아"                 → workflow 04
"자막 만들고 영어로 번역해"           → workflow 05
"되돌려"                             → workflow 06 (restore)

/capcut help    → 인터뷰 모드 (3-5문 분기)
/capcut doctor  → 환경 검증
```

### 4. 7개 워크플로우

| # | 이름 | 요약 |
|---|------|------|
| 01 | [Timecode Edit](workflows/01-timecode-edit.md) | 시간 지정 컷/트림/속도/페이드 |
| 02 | [Content Search](workflows/02-content-search.md) | 자막+비전 하이브리드 장면 검색 |
| 03 | [Talking Head](workflows/03-talking-head.md) | 무음/NG 자동 제거 |
| 04 | [Long to Shorts](workflows/04-long-to-shorts.md) | 다중 신호 하이라이트 + 9:16 |
| 05 | [Subtitle Styling](workflows/05-subtitle-styling.md) | 자막 생성/스타일/번역 |
| 06 | [Inspect & Maintain](workflows/06-inspect-maintain.md) | 검사/롤백/백업 정책 |
| 07 | [Template Reuse](workflows/07-template-reuse.md) | 스타일/레이아웃 템플릿 |

### 5. 안전 정책

- **모든 쓰기 동작 `--dry-run` 우선** + 사용자 명시 승인 필요
- **CapCut 실행 중 감지 시 경고** (`scripts/lock-check.mjs`)
- **capcut-cli 자체 백업 + 추가 7일 보존**
- **실패 시 `capcut restore` 자동 안내**
- 모든 동작 `logs/YYYY-MM-DD.jsonl` 구조화 기록
- 5종 에러 카테고리(`schema-mismatch`, `pro-only-feature`, `redirected-url`, `process-conflict`, `cli-version-mismatch`) → `~/.claude/error-kb/active/`에 자동 기록

### 6. 한계

- CapCut 공식 API 부재로 비공식 도구(`capcut-cli`) 의존 — CapCut 스키마 변경 시 깨질 수 있음
- CapCut **Web 미지원** (Desktop 전용)
- 일부 Pro 전용 효과는 호출 시 안내만 출력
- 시각 콘텐츠 직접 인식은 비전 API 호출 필요 (비용 통제는 [references/token-budget.md](references/token-budget.md))

상세: [references/known-issues.md](references/known-issues.md)

---

## English Guide

### Install

```bash
git clone https://github.com/mane23-ai/claude-capcut-skill.git
cd claude-capcut-skill
ln -s "$(pwd)" ~/.claude/skills/capcut   # macOS / Linux / WSL
node scripts/install.mjs                 # installs capcut-cli
node scripts/doctor.mjs                  # 6-step environment check
```

### What it does

Natural-language editing of CapCut / JianYing Desktop projects from Claude Code:

- **Timecode edits**: cut / trim / speed / fade / opacity / shift
- **Content-based scene search**: Whisper transcript + (optional) Claude vision on keyframe grids
- **Talking-head auto-cut**: silence > 1s removal + duplicate take detection
- **Long-form → Shorts**: multi-signal highlight scoring (transcript + audio RMS + scene-change density), 9:16 reformat, big captions
- **Subtitle generation/styling/translation** with per-language font auto-mapping (KO Pretendard, EN Geist, JA NotoSansJP, ZH NotoSansSC)
- **Project inspection & rollback**: info / tracks / lint / restore / 7-day extra backup
- **Templates**: save and reuse styles/layouts

### Triggers

Auto-detects keywords (`캡컷`, `capcut`, `subtitle`, `shorts`, ...) and explicit `/capcut`. Negative patterns (e.g., "screenshot capture") prevent false positives. See [references/intent-keywords.md](references/intent-keywords.md).

### Cost control

- Whisper model auto-selected by video length
- Vision API skipped when subtitle match confidence ≥ 0.8
- Keyframes composited into 3×3 grids → ~85% token reduction
- Translation pre-flighted with token estimate

Details: [references/token-budget.md](references/token-budget.md)

### Limitations

- Unofficial `capcut-cli` backend (CapCut has no public rendering API as of 2026)
- CapCut **Desktop only** (Web/IndexedDB unsupported)
- Schema may change with CapCut updates — issue reports welcome

---

## 디렉토리 구조

```
claude-capcut-skill/
├── SKILL.md                   # 진입점 + 인텐트 라우터
├── package.json
├── scripts/                   # Node .mjs (zero-dep, cross-OS)
├── workflows/                 # 7 워크플로우 문서
├── references/                # 정책·레퍼런스
├── templates/                 # 9:16 쇼츠 / 유튜브 인트로
├── tests/fixtures/            # 검증용 픽스처 (mp4는 자체 준비)
├── CHANGELOG.md
├── LICENSE
└── README.md
```

---

## Contributing

이슈와 PR 환영. 특히:
- CapCut 신규 버전 호환성 보고
- 신규 워크플로우 제안 (감정 기반 하이라이트 등 v0.2 로드맵)
- 한국어/영어 외 언어 자막 폰트 매핑 확장

PR 전 `node --check scripts/*.mjs`로 syntax 검증, 그리고 `node scripts/doctor.mjs` 통과 확인.

---

## License

MIT © 2026 mane23-ai. See [LICENSE](LICENSE).

---

## Acknowledgements

- [capcut-cli](https://github.com/renezander030/capcut-cli) by renezander030
- [openai-whisper](https://github.com/openai/whisper)
- CapCut / JianYing (ByteDance) — 본 프로젝트는 ByteDance와 무관한 비공식 도구입니다.
