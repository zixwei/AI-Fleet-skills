# Changelog

All notable changes to this skill will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-06-04

### Added — 7개 신규 워크플로우 (08-14)

- `08-mosaic-privacy`: 얼굴/번호판/로고 가림. 정적 영역 + 비전 기반 객체 추적 모자이크
- `09-effects-styling`: bg-blur, chroma(크로마키), mix-mode, add-filter, transition, mask, bubble-text 일괄 매핑
- `10-motion-tracking`: 오브젝트 추적 자막/스티커/효과 부착 (비전 + 키프레임 보간)
- `11-color-grading`: 색보정·LUT 적용 (시네마틱, 빈티지, 흑백, .cube 파일)
- `12-stabilize-denoise`: 영상 안정화(FFmpeg vidstab) + 오디오 잡음 제거(afftdn)
- `13-animation`: 켄 번스, 팬/줌, 타이프라이터, 페이드 등 image-anim/text-anim/키프레임 매핑
- `14-multi-language-captions`: 원본 + 다국어 번역 자막 동시 트랙 (위/아래 배치 + 언어별 폰트·색상 자동)

### Changed

- SKILL.md 인텐트 분류 결정 트리 확장 (7 -> 14 워크플로우)
- `references/intent-keywords.md` 키워드 매핑 표 8-14 추가
- `package.json` version 0.1.0 -> 0.2.0

### Notes

- 모든 신규 워크플로우는 기존 안전 정책 동일 적용 (lock-check, dry-run, 백업, 롤백, 로깅)
- 일부 명령(예: `capcut color --lut`)은 capcut-cli 미지원 시 FFmpeg 폴백 안내 포함
- 화자/얼굴 자동 인식(08, 10)은 Claude vision API 호출 -> token-budget 정책 상속

## [0.1.0] - 2026-06-04

### Added
- 초기 릴리즈
- SKILL.md 인텐트 라우터 (7개 워크플로우 매핑)
- 자동 키워드 감지 + `/capcut` 명시 호출 듀얼 트리거
- Negative pattern 기반 거짓 양성 방지 (캡쳐/쇼츠 단독 차단)
- 다른 스킬 우선순위 라우팅 (`video`, `frontend-design`, `game-dev`)

#### 워크플로우
- `01-timecode-edit`: 타임코드 직접 컷/트림/속도/페이드
- `02-content-search`: 자막+비전 하이브리드 장면 검색
- `03-talking-head`: 무음(>1s) + NG 테이크 자동 제거
- `04-long-to-shorts`: 다중 신호 하이라이트 점수화 + 9:16 변환
- `05-subtitle-styling`: 자막 생성/스타일/번역 + 언어별 폰트 자동
- `06-inspect-maintain`: info/lint/restore/prune + 7일 백업 보존
- `07-template-reuse`: 템플릿 저장/적용

#### 스크립트 (모두 Node `.mjs`, 크로스 OS)
- `doctor.mjs`: 6단계 환경 검증
- `install.mjs`: capcut-cli 자동 설치
- `locate-project.mjs`: OS별 draft 폴더 검색 + Web 흔적 경고
- `lock-check.mjs`: CapCut 프로세스 감지 (덮어쓰기 방지)
- `transcribe.mjs`: Whisper 길이별 모델 자동 선택
- `extract-keyframes.mjs`: FFmpeg scene change 추출
- `grid-frames.mjs`: 키프레임 그리드 합성 (vision 토큰 절감)
- `detect-silence.mjs`: 단어 타임코드 -> 무음/NG 구간 산출
- `highlight-score.mjs`: 자막+오디오+시각 신호 가중합
- `logger.mjs`: 구조화 jsonl 로그 + error-kb 자동 기록

#### 안전성
- 모든 쓰기 동작 `--dry-run` 우선
- CapCut 프로세스 실행 중 쓰기 차단
- capcut-cli 자체 백업 + 추가 7일 보존
- 실패 시 `capcut restore` 자동 안내
- 5개 에러 카테고리(`schema-mismatch`, `pro-only-feature`, `redirected-url`, `process-conflict`, `cli-version-mismatch`) -> error-kb 자동 기록

#### 문서/레퍼런스
- `references/cli-cheatsheet.md`: capcut-cli 전체 명령
- `references/project-paths.md`: Win/macOS/Linux draft 경로
- `references/intent-keywords.md`: 키워드 사전 (positive + negative)
- `references/skill-routing.md`: 다른 스킬 우선순위
- `references/highlight-scoring.md`: 04 알고리즘 가중치
- `references/token-budget.md`: Whisper/Vision 비용 정책
- `references/known-issues.md`: 한계와 워크어라운드

#### 호환성
- Node ≥ 18 (개발: Node v24 확인)
- capcut-cli ≥ 0.9.0
- CapCut Desktop (Web 미지원)
- Windows / macOS / Linux

### Compatibility notes
- CapCut 스키마 변경 시 깨질 수 있음. 동작 확인된 CapCut 버전은 issue로 보고 권장.
- Pro 전용 효과 호출 시 Free 사용자는 폴백 안내.

## v0.2 로드맵
- MCP 백엔드 추가 옵션 (capcut-mcp-server-extended)
- 화자/얼굴 식별 (face_recognition / pyannote)
- 감정 분석 기반 하이라이트 점수
- CapCut Web 공식 API 모니터링
- 일본어/중국어 자막 + 폰트 자동 확장
