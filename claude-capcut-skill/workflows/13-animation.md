# Workflow 13: 애니메이션 (Ken Burns, 이미지/텍스트, 키프레임)

이미지/텍스트에 움직임 부여. 켄 번스 효과, 텍스트 등장/퇴장, 키프레임 보간.

## 입력 예시

- "이 사진에 켄 번스 효과"
- "텍스트 타이핑 애니메이션"
- "이미지 좌우로 흔들기"
- "이 자막 페이드인"

## 매핑

| 자연어 | 명령 |
|--------|------|
| 켄 번스 (정지 이미지에 움직임) | `capcut image-anim --segment <id> --type ken-burns --direction in\|out` |
| 팬 (좌우/상하 이동) | `capcut image-anim --segment <id> --type pan --direction left\|right\|up\|down` |
| 줌 인/아웃 | `capcut image-anim --segment <id> --type zoom --direction in\|out --scale 1.2` |
| 텍스트 타이프라이터 | `capcut text-anim --id <id> --type typewriter --speed 0.05` |
| 텍스트 팝 인 | `capcut text-anim --id <id> --type pop --duration 0.4` |
| 페이드 인/아웃 | `capcut keyframe --id <id> --time <t> --prop opacity --value 0/1` |
| 회전 | `capcut keyframe --id <id> --time <t> --prop rotation --value <deg>` |
| 크기 | `capcut keyframe --id <id> --time <t> --prop scale --value <s>` |

## 처리 단계

1. 사전 검증 게이트
2. 대상 식별
3. 애니메이션 유형 + 옵션 결정
4. dry-run (총 프레임 수, 영향 시간 표시)
5. 승인 -> 실행
6. 검증

## 키프레임 보간

복잡한 모션은 키프레임 다수 + 보간 함수:

```bash
# 시작/끝
capcut keyframe --id <id> --time 0:00 --prop opacity --value 0 --easing ease-in
capcut keyframe --id <id> --time 0:00.5 --prop opacity --value 1 --easing ease-out
```

| Easing | 효과 |
|--------|------|
| `linear` | 일정 속도 |
| `ease-in` | 천천히 시작 |
| `ease-out` | 천천히 끝 |
| `ease-in-out` | 양쪽 부드럽게 |
| `cubic-bezier` | 사용자 정의 곡선 |

## 텍스트 애니메이션 프리셋

| 이름 | 효과 |
|------|------|
| `typewriter` | 글자가 순차로 등장 |
| `pop` | 크기 확대로 등장 |
| `fade-up` | 아래에서 올라오며 페이드인 |
| `slide-in` | 옆에서 슬라이드 |
| `bounce` | 통통 튀기며 등장 |

## 검증 시나리오

1. 정지 이미지 클립에 "켄 번스" -> image-anim 적용 -> 영상에서 줌/팬 확인
2. 자막에 "타이프라이터" -> text-anim 적용 -> 글자 순차 등장 확인
