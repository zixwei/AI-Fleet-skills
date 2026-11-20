# Token & Cost Budget Policy

Whisper, Claude vision, Anthropic translate 호출에 대한 비용 통제 정책. Workflow 02/04/05에서 참조.

---

## 1. Whisper 모델 자동 선택

영상 길이에 따라 정확도와 속도를 자동 트레이드오프.

| 영상 길이 | 선택 모델 | 이유 |
|-----------|-----------|------|
| < 30s | `tiny` | 짧은 영상은 가벼운 모델로 충분 |
| 30s ~ 5min | `base` | 일반 토킹헤드 표준 |
| 5min ~ 30min | `medium` | 정확도 필요 |
| >= 30min | `large-v3` | 최고 정확도, 시간 소요 큼 |

언어가 영어 단독이면 `.en` 변형 사용 (예: `tiny.en` — 약 2배 빠름).

수동 오버라이드: `node scripts/transcribe.mjs <input> --model <name>`

긴 영상 안내 예:
```
이 영상은 12분 길이입니다.
Whisper medium 모델 사용. 예상 소요: 약 2-4분.
진행할까요? (y/n)
```

---

## 2. Claude Vision 호출 최소화

Workflow 02에서 자막 매칭 후 결정.

### 2-1. 자막 신뢰도 분기

| 자막 매칭 신뢰도 | 비전 호출 여부 |
|------------------|----------------|
| >= 0.8 | 스킵 (자막만으로 확정) |
| 0.5 ~ 0.8 | 비전 보강 (후보 ±5초 키프레임만) |
| < 0.5 | 비전 강제 + 사용자 키워드 보완 요청 |

### 2-2. 키프레임 제한

- 후보 구간 ±5초 범위 (보통 10초 윈도우 → 5-15장)
- `scripts/extract-keyframes.mjs --threshold 0.3` (장면 변화 우선)
- scene change <3장이면 등간격 fallback (5초)

### 2-3. 그리드 합성

- `scripts/grid-frames.mjs` 3x3 그리드로 9장 → 1 이미지
- Claude vision 호출 수 = N/9
- 효과: 9장 짜리 영상 분석을 1회 호출로 처리 (토큰 ~85% 절감)

### 2-4. 한도 안내

벗어나면 사용자에게 사전 경고:
```
이 작업은 비전 API를 약 3회 호출합니다 (예상 토큰 ~1500).
진행할까요? (y/n)
```

---

## 3. 번역 비용 (Workflow 05)

`capcut translate --to <lang>` 또는 자체 번역 호출 전:

| 단어 수 | 예상 토큰 | 행동 |
|---------|-----------|------|
| < 500 | < 1500 | 자동 진행 |
| 500 ~ 2000 | 1500 ~ 6000 | 사용자 확인 |
| > 2000 | > 6000 | 사용자 확인 + 청크 분할 안내 |

사전 표시 예:
```
번역 대상: 1240 단어 / 8개 자막 트랙
예상 토큰: 약 3700 (입력) + 4400 (출력)
진행할까요? (y/n)
```

---

## 4. 안전 한도 (기본)

세션당 자동 한도. 초과 시 사용자 명시 승인 필요:

| 항목 | 기본 한도 |
|------|-----------|
| Whisper 호출 총 시간 | 30분 |
| Vision API 호출 횟수 | 20회 |
| Translate 입력 토큰 | 50,000 |

환경변수로 조정: `CAPCUT_WHISPER_MAX_MIN`, `CAPCUT_VISION_MAX_CALLS`, `CAPCUT_TRANSLATE_MAX_TOKENS`.

---

## 5. 로깅

`scripts/logger.mjs`가 각 호출의 `duration_ms`, `extra.model`, `extra.token_estimate` 기록. 운영 중 누적 분석 가능.
