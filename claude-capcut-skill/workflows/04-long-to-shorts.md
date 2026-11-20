# Workflow 04: 롱폼 -> 쇼츠 변환

긴 영상에서 다중 신호로 하이라이트를 점수화 -> 9:16 쇼츠 N개 추출 + 자막 입힘.

## 입력 예시

- "30초 쇼츠 3개 뽑아"
- "이 영상 하이라이트만 추출해서 세로 영상으로"
- "유튜브 쇼츠용으로 자르고 자막 큰 글씨로"

## 처리 단계

1. **사전 검증 게이트**
2. **자막 생성** — `node scripts/transcribe.mjs`
3. **키프레임 추출** — `node scripts/extract-keyframes.mjs`
4. **오디오 RMS 분석** (옵션, FFmpeg loudnorm):
   ```bash
   ffmpeg -i <input> -af loudnorm=print_format=json -f null - 2>&1 | grep input_i
   ```
   피크 타임코드 수집 -> `audio.json` (`{peaks: [sec, sec, ...]}`)
5. **하이라이트 점수화** — `node scripts/highlight-score.mjs <words.json> --keyframes <keyframes.json> --audio-rms <audio.json> --window 30 --top 3`
   - 가중치 표: [references/highlight-scoring.md](../references/highlight-scoring.md)
6. **후보 미리보기**:
   ```
   추천 하이라이트 3개:
   1) 1:23-1:53 (점수 8) — 키워드 "결국", 오디오 피크 2회
   2) 4:10-4:40 (점수 6) — 키워드 "핵심", scene change 3회
   3) 7:55-8:25 (점수 5) — 숫자 "3가지", 오디오 피크 1회
   ```
7. **사용자 확정** -> 각 구간 별도 드래프트로 추출:
   ```bash
   capcut cut --from 1:23 --to 1:53 --output shorts-1.mp4 --project <draft-dir>
   ```
8. **9:16 템플릿 적용**:
   ```bash
   capcut apply-template templates/shorts-9x16.json --target shorts-1.mp4
   ```
9. **자막 입힘**:
   ```bash
   capcut caption --whisper-model auto --style bold-yellow --size 56 --target shorts-1.mp4
   ```
10. **검증** + 로깅

## 9:16 변환 정책 (`templates/shorts-9x16.json`)

- 캔버스: 1080x1920
- 원본 16:9 비율 영상: 상하 패딩 또는 중앙 크롭 (사용자 선택)
- 화자가 화면 중앙에 가깝지 않은 경우 자동 크롭 대상이 잘릴 수 있으므로 사용자에게 확인 권장

## 자막 스타일 기본값 (쇼츠용)

| 속성 | 값 |
|------|-----|
| 폰트 | Pretendard Black (한국어), Geist (영어) |
| 크기 | 56-72pt |
| 색상 | #FFEB3B (노랑) 또는 #FFFFFF (흰색) |
| 외곽선 | 4px #000000 |
| 위치 | 화면 하단 1/3 |

## 실패 시 폴백

- 영상 < 1분: "쇼츠 추출 의미 없음. 01(타임코드 직접 컷)로 분기"
- 오디오 분석 실패: 자막+시각 신호만으로 점수화 (가중치 자동 조정)
- 후보 점수 모두 낮음: "하이라이트로 추천할 만한 구간이 없습니다" + 수동 시간 입력 요청

## 검증 (테스트 시나리오)

1. 5분짜리 토킹 영상 픽스처
2. "30초 쇼츠 1개" -> 후보 1개 표시 -> 승인 -> 9:16 영상 + 자막 입힘 완료
3. 결과물 영상 재생하여 자막 가독성 확인
