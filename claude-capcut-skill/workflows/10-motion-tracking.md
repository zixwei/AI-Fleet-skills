# Workflow 10: 모션 트래킹 (오브젝트 추적)

움직이는 오브젝트를 따라 자막/스티커/효과를 부착. 비전 + 키프레임 보간으로 구현.

## 입력 예시

- "이 사람 머리 위에 자막 따라다니게"
- "축구공 따라가는 화살표"
- "차량에 라벨 붙여 따라가"

## 처리 단계

1. 사전 검증 게이트
2. **오브젝트 식별** — 사용자 설명 + Claude vision으로 첫 프레임에서 좌표 확정
3. **추적 데이터 생성**
   - `node scripts/extract-keyframes.mjs <input> --threshold 0.2` (촘촘하게)
   - 각 프레임에서 오브젝트 좌표 추출 (Claude vision)
   - `tracking.json`: `[{time, x, y, w, h}]`
4. **타깃 요소 결정**
   - 자막: `capcut add-text "<text>" --at <start>`
   - 스티커: `capcut add-sticker <file> --at <start>`
   - 효과: 워크플로우 09의 요소
5. **위치 키프레임 일괄 적용**:
   ```bash
   for each frame in tracking.json:
     capcut keyframe --id <id> --time <t> --prop x --value <x>
     capcut keyframe --id <id> --time <t> --prop y --value <y>
   ```
   `capcut batch`로 일괄 실행 권장
6. dry-run -> 승인 -> 실행

## 비전 비용 통제

- 추적 간격: 빠른 움직임 0.5초, 보통 1초, 느림 2초
- 30초 영상에 빠른 움직임 -> 60장 -> 6-7회 비전 호출
- 사전 예상 표시: "약 N회 vision 호출 예상. 진행할까요?"

## 한계

- 가려짐 (occlusion): 일시적 사라짐은 마지막 좌표 유지 또는 사용자에게 수동 지정
- 다중 오브젝트: 사용자에게 "추적 대상 1개만" 요구 (v0.2 단일 추적)
- 회전/스케일: 위치만 따라가고 크기 변화는 미반영 (v0.3 후보)

## 검증 시나리오

1. 픽스처에 "얼굴 위에 자막 따라다니게" -> tracking.json 생성 -> dry-run으로 키프레임 수 확인
