# Workflow 05: 자막 생성·스타일·번역

자막을 자동 생성하고, 언어별 폰트 매핑 + 스타일링 + 다국어 번역까지.

## 입력 예시

- "자막 만들어"
- "노란색 큰 글씨로"
- "영어로 번역해서 자막 입혀"
- "Pretendard 폰트로 자막"

## 처리 단계

1. **사전 검증 게이트**
2. **자막 소스 결정**
   - 기존 자막 트랙 있음 (`capcut texts` 확인) -> 스타일링만
   - 없음 -> `capcut caption` 또는 `node scripts/transcribe.mjs`로 생성
3. **언어 자동 감지** — Whisper의 `--language auto` 또는 결과 JSON의 `language` 필드
4. **언어별 폰트 매핑**:

   | 언어 | Display 폰트 | Body 폰트 |
   |------|--------------|-----------|
   | ko | Pretendard Black | Pretendard Medium |
   | en | Geist Black | Geist Regular |
   | ja | NotoSansJP Bold | NotoSansJP Regular |
   | zh | NotoSansSC Bold | NotoSansSC Regular |

5. **자막 생성** (필요 시):
   ```bash
   capcut caption --whisper-model auto --project <draft-dir>
   ```
6. **스타일 적용**:
   ```bash
   capcut text-style --font <auto-font> --size 48 --color "#FFEB3B" --outline "4px #000000" --project <draft-dir>
   ```
7. **번역** (요청 시):
   ```bash
   capcut translate --to en --project <draft-dir>
   ```
   - `ANTHROPIC_API_KEY` 필요
   - 호출 전 길이 표시: "약 320단어, 예상 토큰 ~800. 진행할까요?"
8. **dry-run** -> 승인 -> 실행 -> `capcut texts` diff
9. **로깅**

## 색상·크기 프리셋

| 이름 | 예시 명령 |
|------|-----------|
| `bold-yellow` | `--color "#FFEB3B" --size 56 --weight bold` |
| `white-clean` | `--color "#FFFFFF" --size 48 --weight medium --outline "2px #00000088"` |
| `red-emphasis` | `--color "#EF4444" --size 56 --weight bold` |
| `green-confirm` | `--color "#34D399" --size 44 --weight medium` |

자연어 매핑:
- "노란색 큰 글씨" -> `bold-yellow`
- "깔끔한 흰색" -> `white-clean`
- "강조 빨강" -> `red-emphasis`

## 다국어 흐름

원본 자막 + 번역 자막을 동시에 트랙으로 추가 가능 (위/아래 배치).
사용자 요청 예: "한글은 위, 영어는 아래로"

## 실패 시 폴백

- whisper/번역 키 미설치: 안내 후 사용자에게 수동 자막 입력 옵션 제공 (`--from-srt <file>`)
- 폰트 미설치: 시스템에 폰트 설치 안내 (`rules/font-catalog.md` 참조)
- 번역 실패: 원본 자막 유지하고 에러 카테고리 기록

## 검증 (테스트 시나리오)

1. 한국어 토킹 영상 -> "자막 만들어" -> 한국어 자막 생성 + Pretendard 적용 확인
2. "노란색 큰 글씨로" 추가 요청 -> 색상 변경 확인
3. "영어로 번역해서 추가" -> 영어 자막 트랙 추가 + Geist 폰트 자동 적용 확인
