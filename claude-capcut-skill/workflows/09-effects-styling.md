# Workflow 09: 효과·스타일링 (bg-blur, chroma, mix-mode, filter, transition)

배경 블러, 크로마키, 블렌딩, 필터, 트랜지션 같은 비파괴 효과 묶음.

## 입력 예시

- "배경 흐리게 해줘"
- "초록 배경 빼" / "그린스크린 합성"
- "두 트랙 곱하기 모드로 겹쳐"
- "빈티지 필터 적용"
- "장면 사이에 디졸브 효과"

## 매핑

| 자연어 | 명령 |
|--------|------|
| 배경 블러 / 보케 | `capcut bg-blur --segment <id> --amount <0-1>` |
| 크로마키 (그린/블루스크린) | `capcut chroma --segment <id> --color "#00FF00" --tolerance 0.3` |
| 블렌딩 모드 | `capcut mix-mode --segment <id> --mode multiply\|screen\|overlay\|...` |
| 필터 (빈티지/흑백/시네마) | `capcut add-filter --segment <id> --name <preset>` |
| 트랜지션 | `capcut transition --between <id1> <id2> --type fade\|slide\|wipe\|dissolve --duration 0.5` |
| 마스크 (원형/직사각형) | `capcut mask --segment <id> --shape circle\|rect --feather 8` |
| 말풍선 자막 | `capcut bubble-text "<text>" --style comic --at <t>` |

## 처리 단계

1. 사전 검증 게이트
2. 대상 세그먼트 식별 (`capcut segments`로 ID 확보)
3. dry-run 출력 (해당 효과 미리보기 의미 설명)
4. 승인 -> 실행
5. `capcut info` diff

## 효과 프리셋

| 카테고리 | 프리셋 예 |
|----------|----------|
| 필터 | `vintage`, `bw`, `cinema`, `warm`, `cool`, `vivid` |
| 트랜지션 | `fade`, `slide-left`, `slide-right`, `wipe`, `dissolve`, `zoom-in` |
| 블렌딩 | `multiply`, `screen`, `overlay`, `soft-light`, `hard-light`, `lighten`, `darken` |

## 검증 시나리오

1. 픽스처에 "배경 블러" -> dry-run -> 적용 후 미리보기 차이 확인
2. 두 클립 사이 "디졸브 추가" -> transition 확인
