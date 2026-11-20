# Workflow 08: 모자이크·프라이버시 가림

얼굴/번호판/로고 등 민감 영역을 모자이크/블러로 가린다. 정적 영역 + 움직이는 객체 추적 둘 다 지원.

## 입력 예시

- "얼굴 자동으로 모자이크 처리해"
- "번호판 흐리게"
- "이 사람 얼굴만 가려"
- "오른쪽 위 로고 가려"

## 처리 단계

### A. 정적 모자이크 (영역 고정)
1. 사전 검증 게이트
2. 영역 결정:
   - 사용자가 좌표 지정: `"x=200,y=100,w=160,h=160"`
   - 사용자가 위치만 지정 ("오른쪽 위"): 해상도에서 자동 계산
3. dry-run:
   ```bash
   capcut add-effect mosaic --from <t> --to <t> --region "x=..,y=..,w=..,h=.." --strength 0.7 --dry-run
   ```
4. 승인 -> 실행 -> 검증

### B. 모션 트래킹 모자이크 (자동 얼굴 추적)
1. 자막 워크플로우의 비전 파이프라인 재사용:
   - `node scripts/extract-keyframes.mjs <input>` (1초 간격 또는 scene change)
   - Claude vision으로 각 프레임의 얼굴 좌표 추출 (`{frame, faces: [{x,y,w,h}]}`)
2. 좌표를 키프레임 보간:
   ```bash
   # 시작
   capcut add-effect mosaic --from 0:00 --to 0:30 --region <초기 좌표> --strength 0.7
   # 각 시점에 키프레임으로 위치/크기 보정
   capcut keyframe --effect <id> --time 0:01 --prop x --value <x1>
   capcut keyframe --effect <id> --time 0:01 --prop y --value <y1>
   # ... 반복
   ```
3. dry-run 미리보기 (그리드 합성된 프레임에 모자이크 영역 표시)
4. 승인 -> 일괄 적용

## 강도/모드

| 옵션 | 값 | 효과 |
|------|-----|------|
| `--strength` | 0.0 ~ 1.0 | 모자이크 픽셀 크기 |
| `--type` | mosaic / blur / pixelate | 효과 종류 |
| `--shape` | rect / circle / freeform | 영역 모양 |
| `--follow` | true / false | 키프레임 따라 위치 보간 |

## 비전 호출 비용

- 짧은 영상(30초 이하): 키프레임 5-10장 -> 1회 그리드 호출
- 1분 영상: 키프레임 12-20장 -> 2-3회 호출
- `references/token-budget.md`의 vision 한도 정책 적용

## 실패 시 폴백

- 얼굴 감지 0개: 사용자에게 영역 수동 지정 요청
- 얼굴 다수: 후보 표시 -> 사용자 선택 ("두 번째 사람만")
- 객체 추적 점프(빠른 움직임): scene change 임계값 낮춰 재추출 권유

## 검증 시나리오

1. `tests/fixtures/sample-30s.mp4`에 "얼굴 가려" -> 키프레임 자동 생성 -> dry-run 확인
2. "오른쪽 위 로고 가려" -> 정적 영역 자동 계산 -> 컷 후 결과 비교
