# Workflow 11: 색보정·컬러 그레이딩 (LUT, 색조/대비/채도)

영상 톤을 일괄 조정 — 시네마틱, 빈티지, 차가운/따뜻한 톤 등.

## 입력 예시

- "시네마틱하게 색보정해"
- "따뜻한 톤으로"
- "흑백으로"
- "이 LUT 적용해줘"
- "콘트라스트 좀 올려"

## 매핑

| 자연어 | 명령 |
|--------|------|
| 시네마틱 | `capcut add-filter --name cinema-teal-orange` |
| 빈티지 | `capcut add-filter --name vintage` |
| 흑백 | `capcut add-filter --name bw` |
| 따뜻한 톤 | `capcut color --segment <id> --temperature +500 --tint +5` |
| 차가운 톤 | `capcut color --segment <id> --temperature -500 --tint -5` |
| 콘트라스트/채도/노출 | `capcut color --contrast +10 --saturation +5 --exposure +0.3` |
| LUT 파일 적용 | `capcut color --lut <file.cube>` (3D LUT) |

> `capcut color` 명령이 cli에 없거나 다르게 노출되면 `add-filter`의 사용자 정의 프리셋 또는 직접 FFmpeg `lut3d` 필터로 폴백.

## 처리 단계

1. 사전 검증 게이트
2. 대상 세그먼트 식별
3. dry-run + 미리보기 (가능하면 첫 프레임을 추출하여 비교 표시)
4. 승인 -> 실행
5. `capcut info` diff

## 톤 프리셋

| 이름 | 설명 |
|------|------|
| `cinema-teal-orange` | 헐리우드 톤 (그림자 청록, 하이라이트 오렌지) |
| `vintage` | 색상 빠지고 노란빛 |
| `bw` | 흑백 |
| `warm` | 따뜻함 (+500K) |
| `cool` | 차가움 (-500K) |
| `vivid` | 채도 + 콘트라스트 강화 |
| `flat` | Log/Flat 톤 (수동 그레이딩용) |

## LUT 워크플로우

```bash
# .cube 파일 적용
capcut color --segment <id> --lut /path/to/preset.cube
```
- `.cube` 또는 `.3dl` 형식
- CapCut Pro의 색 보정 패널에서 사용하는 LUT와 동일 형식
- 일반 무료 LUT 제공처(예: free-luts.com)에서 다운로드 가능

## 검증 시나리오

1. "시네마틱 톤" -> add-filter 적용 -> 결과 영상 첫 프레임 비교
2. 임의 .cube 파일 -> `--lut`로 적용 -> diff 확인
