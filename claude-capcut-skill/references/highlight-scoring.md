# Highlight Scoring Algorithm (Workflow 04)

`scripts/highlight-score.mjs`가 사용하는 다중 신호 결합 알고리즘. 롱폼 영상에서 쇼츠로 추출할 후보 구간을 자동 식별.

---

## 개요

영상 전체를 1초 step의 sliding window(기본 30초)로 훑으며, 각 윈도우에 세 종류 신호 점수를 합산. 상위 K개 구간 선정.

---

## 신호별 가중치

### 1. 자막 신호 (Whisper words.json)

| 패턴 | 가중치 |
|------|--------|
| 강조어 (KO: 결국/핵심/진짜/제일/가장/드디어/특히 / EN: actually/finally/key/crucial/really/most/especially) | +2 |
| 질문 (`?`, `~까`, `~나요`) | +1 |
| 숫자/통계 (단어에 숫자 포함) | +1 |

확장 가능: 도메인 특화 강조어 사전을 사용자 설정으로 추가 (예: 기술 분야 "성능/속도/메모리").

### 2. 오디오 신호 (FFmpeg loudnorm 또는 RMS 분석)

| 패턴 | 가중치 |
|------|--------|
| RMS 피크 (정규화 평균 대비 +6dB 이상) | +2 (피크당) |

피크 추출:
```bash
ffmpeg -i <input> -af "astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level" -f null - 2>&1 | awk '/RMS_level/ { ... }'
```
결과를 `audio.json` `{peaks: [sec, sec, ...]}` 형태로 저장 후 `highlight-score.mjs --audio-rms`로 전달.

### 3. 시각 신호 (FFmpeg scene change)

| 패턴 | 가중치 |
|------|--------|
| 1초 내 scene change >= 2회 | +1 (역동성) |

`extract-keyframes.mjs`의 `keyframes.json`에서 `frames[].time`을 읽어 윈도우 내 빈도 집계.

---

## 가중합 공식

```
score(window) =
    Σ (자막 신호 가중치)
  + Σ (오디오 피크 가중치 × 윈도우 내 피크 수)
  + Σ (시각 신호 가중치 × ⌊윈도우 내 프레임 수 / 2⌋)
```

가중치는 `scripts/highlight-score.mjs`의 `WEIGHTS` 상수에 정의. 운영 중 튜닝 가능.

---

## 후보 선정

1. 모든 window 점수 정렬 (desc)
2. 상위에서 차례로 선택, 단 **이미 선택된 구간과 겹치는 후보는 스킵** (중복 제거)
3. 최대 `--top K` (기본 3)개까지

겹침 판정: `max(p.start, c.start) < min(p.end, c.end)`이면 겹침.

---

## 출력 예시

```json
{
  "duration": 312,
  "window": 30,
  "top": 3,
  "highlights": [
    {
      "start": 83,
      "end": 113,
      "score": 8,
      "signals": { "emphasis": 2, "question": 0, "number": 1, "audio_peak": 2, "scene_dense": 0 }
    },
    ...
  ]
}
```

---

## 신호 우선순위 정책

세 신호 모두 사용 가능하면 균등 가중. 일부 누락 시:

| 사용 가능 신호 | 가중치 자동 조정 |
|----------------|------------------|
| 자막만 | 자막 점수 그대로, 임계값 하향 |
| 자막+오디오 (비전 없음) | 자막 0.7, 오디오 0.3 |
| 자막+비전 (오디오 없음) | 자막 0.6, 비전 0.4 |
| 전부 (기본) | 자막 0.5, 오디오 0.3, 비전 0.2 |

---

## 한계

- 강조어 사전이 한/영 기본만 — 일/중은 v0.2에서 확장
- 화자 감정/톤은 미반영 (v0.2 로드맵)
- 시각 신호는 scene change 빈도만 — 얼굴 표정/액션 인식은 미지원
