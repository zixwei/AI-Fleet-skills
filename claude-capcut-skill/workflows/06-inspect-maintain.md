# Workflow 06: 검사·유지보수·백업 정책

CapCut 프로젝트 상태 조회, 깨진 링크 복구, 변경 롤백, 백업 관리.

## 입력 예시

- "이 프로젝트 트랙 보여줘"
- "깨진 미디어 링크 고쳐"
- "방금 변경 되돌려"
- "백업 정리해"
- "프로젝트 lint 돌려봐"

## 조회 명령 매핑

| 자연어 | CLI 명령 |
|--------|----------|
| "정보 보여줘" | `capcut info` |
| "트랙 목록" | `capcut tracks` |
| "사용된 미디어" | `capcut materials` |
| "세그먼트 목록" | `capcut segments` |
| "자막 목록" | `capcut texts` |
| "자막 SRT 내보내기" | `capcut export-srt` |
| "프로젝트 lint" | `capcut lint` |

이 명령들은 모두 읽기 전용 -> dry-run 생략, 즉시 출력.

## 수정 명령

### 깨진 링크 자동 복구
```bash
capcut relink --auto --project <draft-dir>
```
- 동작: 원본 미디어 파일이 이동/이름 변경된 경우, 인접 폴더에서 동일 이름 검색 -> 자동 relink
- 실패 시 사용자에게 수동 매핑 요청

### 미사용 자산 정리
```bash
capcut prune --dry-run --project <draft-dir>
```
- 트랙에서 참조되지 않는 미디어 자산 제거 후보 표시
- 승인 시 실제 제거 (백업은 자동)

## 롤백·백업 정책

### capcut-cli 자체 백업
- 모든 쓰기 명령 전 `<draft-dir>/.capcut-cli-backups/<ts>/draft_content.json.bak` 자동 생성

### 스킬 추가 백업
- 위치: `~/.claude/skills/capcut/backups/<project-name>/<ts>/`
- 보존: 7일 (그 이전은 `capcut backup prune` 옵션으로 정리)
- 트리거: 03/04 같은 대량 변경 시 자동

### 롤백 명령
```bash
capcut restore --backup latest --project <draft-dir>
# 또는 특정 시점
capcut restore --backup 20260604-153201 --project <draft-dir>
```

자연어 매핑:
- "되돌려" -> `capcut restore --backup latest`
- "어제 변경 되돌려" -> `capcut restore` + 사용자에게 백업 ID 선택 요청

## 처리 단계 (수정 계열)

1. **사전 검증 게이트**
2. **명령 매핑 + 옵션 파싱**
3. **dry-run 우선** (수정 계열에 한함)
4. **사용자 승인** 후 실제 실행
5. **검증**: 변경된 항목을 `capcut info` 또는 해당 조회 명령으로 재확인
6. **로깅**

## 실패 시 폴백

- 백업 없음: "이 프로젝트는 아직 변경 이력이 없습니다. 롤백 불가" 안내
- relink 실패: 후보 매핑을 표로 제시 -> 사용자 선택
- lint 경고 다수: 우선순위(에러 > 경고)로 정렬하여 표시

## 검증 (테스트 시나리오)

1. `tests/fixtures/sample-draft/`에 "트랙 보여줘" -> `capcut tracks` 출력
2. 변경 후 "되돌려" -> 원본 복구 + diff 0 확인
3. "백업 정리" -> 7일 이상 된 백업 prune 후보 표시
