# Workflow 07: 템플릿 저장·재사용

자주 쓰는 스타일/레이아웃을 템플릿으로 저장하고 다른 프로젝트에 일괄 적용.

## 입력 예시

- "이 자막 스타일 템플릿으로 저장"
- "지난번 인트로 적용해줘"
- "쇼츠 템플릿 적용"
- "내 템플릿 목록 보여줘"

## 처리 단계

### 저장 (save)

1. **사전 검증 게이트**
2. **저장 대상 식별** — 사용자 자연어에서 대상 추출:
   - "자막 스타일" -> text-style 추출
   - "인트로" -> 시작 N초의 트랙 구성 추출
   - "쇼츠 레이아웃" -> 캔버스 + 자막 위치 추출
3. **저장 실행**:
   ```bash
   capcut save-template --name <name> --scope text-style|intro|layout --project <draft-dir>
   ```
4. **저장 위치**: `~/.claude/skills/capcut/templates/<name>.json`
5. **확인 출력**: 템플릿 미리보기 (JSON 핵심 필드)

### 적용 (apply)

1. **템플릿 선택** — 사용자가 이름 명시 or 목록에서 선택
2. **dry-run**:
   ```bash
   capcut apply-template <name> --dry-run --project <draft-dir>
   ```
3. **충돌 검사**: 기존 스타일/트랙과 충돌 시 사용자 확인
4. **승인** -> 실제 적용 -> 변경된 항목 출력
5. **로깅**

## 자연어 매핑

| 자연어 | 동작 |
|--------|------|
| "템플릿으로 저장" | `save-template --scope auto` |
| "자막 스타일만 저장" | `save-template --scope text-style` |
| "인트로 저장" | `save-template --scope intro` |
| "<name> 적용" | `apply-template <name>` |
| "템플릿 목록" | `ls templates/` 또는 `capcut list-templates` |
| "<name> 삭제" | 파일 삭제 + 백업 폴더 이동 |

## 기본 제공 템플릿

| 이름 | 용도 |
|------|------|
| `shorts-9x16` | 9:16 쇼츠 캔버스 + 자막 슬롯 |
| `youtube-intro` | 유튜브용 인트로 자막 스타일 |

사용자 정의 템플릿은 위와 같은 경로에 추가된다.

## 실패 시 폴백

- 템플릿 이름 충돌: 사용자에게 덮어쓰기 / 새 이름 / 취소 선택지 제시
- 적용 시 호환 안 되는 트랙 구조: 부분 적용 + 미적용 항목 보고
- 적용 후 결과 이상: `capcut restore` 안내

## 검증 (테스트 시나리오)

1. 자막 스타일 적용된 프로젝트에서 "이 스타일 my-style로 저장" -> `templates/my-style.json` 생성 확인
2. 빈 프로젝트에서 "my-style 적용" -> 자막 트랙 추가/스타일 적용 확인
3. "템플릿 목록" -> 내장 2개 + 사용자 1개 표시
