# Test Fixtures

스킬 워크플로우의 회귀 테스트용 픽스처. 영상 파일은 라이선스 문제로 저장소에 포함하지 않고, 사용자가 자체 준비하거나 아래 명령으로 생성.

---

## 필요 파일

### 1. `sample-30s.mp4` — 짧은 토킹 영상 (워크플로우 01, 02 검증)

권장 콘텐츠:
- 길이: 30초
- 명확한 한국어/영어 대사
- 시작에 "안녕하세요", 끝에 "본격적으로 시작합니다" 같은 키워드 포함

자체 녹화 또는 FFmpeg로 합성 영상 생성:
```bash
# 단색 + TTS 자막을 합성한 더미 영상 (예: macOS)
say -o speech.aiff "Hello. Today we will talk about three key points."
ffmpeg -f lavfi -i color=c=black:s=1280x720:d=30 -i speech.aiff -c:v libx264 -shortest sample-30s.mp4
```

### 2. `sample-with-silence.mp4` — 의도적 침묵 3구간 (워크플로우 03 검증)

권장 콘텐츠:
- 길이: 1분
- 발화 구간 3개 + 침묵 구간 3개 (각 2초 이상)
- 일부 반복 발화 (NG 테이크 시뮬레이션)

생성 예:
```bash
# 발화 mp3 3개 + 침묵을 concat
ffmpeg -i seg1.mp3 -af "apad=pad_dur=3" pad1.mp3
ffmpeg -i seg2.mp3 -af "apad=pad_dur=3" pad2.mp3
ffmpeg -i seg3.mp3 pad3.mp3
ffmpeg -f concat -safe 0 -i list.txt -c copy audio_with_silence.mp3
ffmpeg -f lavfi -i color=c=black:s=1280x720 -i audio_with_silence.mp3 -c:v libx264 -shortest sample-with-silence.mp4
```

### 3. `sample-draft/` — 미니 CapCut 프로젝트 폴더 (워크플로우 06 검증)

이미 저장소에 최소 구조 포함. `sample-draft/draft_content.json` 참고.
실제 영상 자산 없이도 `capcut info`/`capcut tracks` 같은 read-only 명령은 동작해야 함.

---

## 회귀 테스트 실행

전체 픽스처 준비 후:

```bash
# 환경 검증
node ../../scripts/doctor.mjs

# 시나리오 01 — 타임코드 컷 dry-run
capcut cut --from 0:05 --to 0:08 --dry-run --project ./sample-draft

# 시나리오 02 — 자막 생성
node ../../scripts/transcribe.mjs sample-30s.mp4 --model tiny

# 시나리오 03 — 무음 검출
node ../../scripts/detect-silence.mjs sample-with-silence.words.json

# 시나리오 04 — 키프레임 + 점수화
node ../../scripts/extract-keyframes.mjs sample-30s.mp4
node ../../scripts/highlight-score.mjs sample-30s.words.json --keyframes sample-30s.frames/keyframes.json --top 1

# 정리
rm -rf logs/*.jsonl
```

---

## 저장소 정책

- mp4/mov: `.gitignore`로 제외 (라이선스/용량)
- 생성된 frames/.jpg, .json: `.gitignore`로 제외
- `sample-draft/draft_content.json`: 트래킹 (구조 검증용 최소 예시)
