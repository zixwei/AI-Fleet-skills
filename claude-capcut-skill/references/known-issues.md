# Known Issues & Workarounds

본 스킬과 capcut-cli 사용 시 발생할 수 있는 알려진 한계와 대응 방법.

---

## 1. CapCut Web 미지원

| 상황 | 대응 |
|------|------|
| 사용자가 브라우저 CapCut Web으로 작업 중 | 본 스킬 발화 X. Desktop 설치 안내 |
| Desktop과 Web 병행 사용 | Web 작업은 Desktop 동기화 후 본 스킬 사용 |

---

## 2. CapCut 스키마 변경 (`draft_content.json`)

CapCut 자체 업데이트로 JSON 스키마가 바뀔 수 있음.

| 증상 | 대응 |
|------|------|
| capcut-cli가 `unknown field` 에러 | error-kb `capcut-schema-mismatch` 카테고리에 자동 기록 |
| 일부 필드 누락으로 trim/cut 실패 | capcut-cli 최신 버전 업데이트 (`npm update -g capcut-cli`) |
| 신규 CapCut 버전 호환 미확인 | 본 스킬 issue tracker에 버전 정보 + 증상 제보 |

확인된 호환 버전: CapCut Desktop 6.x ~ 7.x (2026년 1월 기준). 사용자 환경에서 깨지면 doctor.mjs로 진단 후 보고.

---

## 3. Pro 전용 기능

다음 기능은 CapCut Pro 구독 필요. Free 사용자가 호출 시 capcut-cli가 거부.

| 기능 | 대응 |
|------|------|
| 고급 transition (zoom/cinematic 등) | `references/cli-cheatsheet.md` 기본 transition으로 폴백 안내 |
| 일부 폰트 (특히 영어 산세리프 프리미엄) | 시스템 폰트 또는 무료 대체(`rules/font-catalog.md`) 사용 |
| 자동 색보정 일부 | 수동 색상 조정으로 폴백 |
| 워터마크 제거 | 사용자에게 Pro 필요 안내 |

error-kb 카테고리: `capcut-pro-only-feature`.

---

## 4. 미디어 URL 리다이렉트

원격 미디어 URL이 리다이렉트되면 capcut-cli가 처리 불가.

| 증상 | 대응 |
|------|------|
| `add-video <url>` 실패 | URL을 최종 직접 링크로 변환 (curl -L 등) 후 재시도 |
| CDN 인증 토큰 만료 | 미리 다운로드 후 로컬 파일로 사용 |

error-kb 카테고리: `capcut-redirected-url`.

---

## 5. CapCut 프로세스와 동시 편집

CapCut Desktop이 실행 중일 때 본 스킬이 `draft_content.json`을 쓰면 CapCut이 변경을 덮어쓸 수 있음.

대응:
- `scripts/lock-check.mjs`가 모든 쓰기 전 검사
- 발견 시 사용자에게 CapCut 종료 권유
- 강제 진행 시 경고만 표시하고 진행 (사용자 책임)

error-kb 카테고리: `capcut-process-conflict`.

---

## 6. capcut-cli 버전 불일치

| 증상 | 대응 |
|------|------|
| 본 스킬 `compatible_cli` 범위를 벗어남 | doctor.mjs가 경고 |
| 신규 명령이 동작하지 않음 | `npm install -g capcut-cli@latest` |
| 본 스킬 보다 신규 버전 (호환 불확실) | issue tracker에 동작 보고 |

error-kb 카테고리: `capcut-cli-version-mismatch`.

---

## 7. Whisper 모델 다운로드

처음 사용 시 모델 가중치(수십~수GB) 다운로드 필요. 인터넷 환경에 따라 시간 소요.

대응:
- 사전 다운로드: `whisper --model base --language en <짧은 영상>`로 강제 다운로드
- whisper.cpp 사용 시 GGML 모델 별도 다운로드

---

## 8. 한국어 자막 폰트 누락

| 증상 | 대응 |
|------|------|
| Pretendard 미설치로 자막 깨짐 | `rules/font-catalog.md` 참조하여 설치 (`~/.local/share/fonts/`) |
| Windows에서 자막 박스 형식 깨짐 | CapCut Desktop 재시작 |

---

## 9. 대량 컷 후 타임라인 갭

03(무음/NG 제거)으로 다수 컷 후, 트랙에 빈 구간이 남을 수 있음.

대응:
- `capcut lint`로 갭 감지
- `capcut prune --dry-run`으로 빈 세그먼트 후보 표시
- 또는 `capcut shift`로 후속 세그먼트 자동 당김 (v0.2 자동화 검토)

---

## 10. WSL 환경 특이사항

- Windows 측 CapCut 사용자는 WSL에서 `/mnt/c/Users/...` 경로로 접근
- 권한 이슈: 파일 쓰기가 실패하면 `chmod` 또는 Windows 측에서 직접 실행
- symlink: `~/.claude/skills/capcut` -> `/mnt/c/Projects/active/claude-capcut-skill`은 WSL 내에서 정상 동작. Windows PowerShell에서는 별도 처리 필요.
