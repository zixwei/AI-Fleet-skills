# Workflow 12: 안정화·잡음 제거

손떨림 보정(stabilize), 영상/오디오 잡음 제거(denoise). FFmpeg 외부 처리 후 capcut에 재임포트.

## 입력 예시

- "손떨림 보정"
- "영상 안정화"
- "오디오 잡음 제거"
- "에어컨 소음 빼"

## 처리 단계 (영상 안정화)

capcut-cli에 직접 명령이 없으면 FFmpeg 우회:

1. 사전 검증 게이트
2. 원본 클립 추출:
   ```bash
   capcut cut --from <t> --to <t> --output _temp.mp4 --project <draft>
   ```
3. FFmpeg vidstab 2-pass:
   ```bash
   ffmpeg -i _temp.mp4 -vf vidstabdetect=shakiness=5 -f null -
   ffmpeg -i _temp.mp4 -vf vidstabtransform=zoom=5,unsharp=5:5:0.8 _stabilized.mp4
   ```
4. 결과 클립을 다시 추가:
   ```bash
   capcut add-video _stabilized.mp4 --at <t>
   ```
5. 원본 세그먼트 제거 또는 비활성 (사용자 확인)
6. 검증

## 처리 단계 (오디오 잡음 제거)

1. 오디오 트랙 추출:
   ```bash
   ffmpeg -i <input> -vn -acodec pcm_s16le _audio.wav
   ```
2. 잡음 제거 (RNNoise 또는 FFmpeg `afftdn`):
   ```bash
   ffmpeg -i _audio.wav -af "afftdn=nf=-25" _clean.wav
   ```
3. 깨끗한 오디오 재임포트:
   ```bash
   capcut add-audio _clean.wav --at <t> --replace <원래 오디오 세그먼트 id>
   ```

## 옵션

| 옵션 | 효과 |
|------|------|
| 안정화 강도 `shakiness=1~10` | 1=거의 없음, 10=과보정 |
| 잡음 강도 `nf=-N` (dB) | -10=약, -25=중, -40=강 |
| 보조 필터 `unsharp` | 안정화 후 약간의 샤프닝 권장 |

## 한계

- 매우 심한 떨림: 보정 후 가장자리 자동 크롭됨 (zoom)
- 음성 잡음과 BGM 분리: 단순 noise reduction은 음성도 영향. 필요 시 외부 도구 (Adobe Enhance, Krisp 등) 안내

## 검증 시나리오

1. 떨리는 픽스처 -> 안정화 적용 -> 흔들림 감소 확인
2. 백색잡음 픽스처 -> denoise 후 SNR 비교
