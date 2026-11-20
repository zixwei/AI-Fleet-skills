# Workflow 03: 토킹헤드 자동 (무음·NG 제거)

토킹헤드 영상에서 무음 구간과 반복(NG) 테이크를 자동으로 잘라내 매끄럽게 만든다.

## 입력 예시

- "무음 다 잘라"
- "NG 테이크 정리해"
- "스마트 컷"
- "이 영상 깔끔하게 다듬어"

## 처리 단계

1. **사전 검증 게이트**
2. **백업 확인** — capcut-cli 자체 백업 외에도 스킬이 `~/.claude/skills/capcut/backups/`에 추가 백업 권장. 대량 변경이므로 사용자에게 명시.
3. **자막 생성** — `node scripts/transcribe.mjs <input.mp4>` (단어 타임코드 필수)
4. **무음/NG 산출** — `node scripts/detect-silence.mjs <words.json> --gap 1.0 --similarity 0.85`
   - 결과: `{silences: [{start,end,duration}], duplicates: [{keep, drop}]}`
5. **미리보기 표시**:
   ```
   분석 결과:
   - 무음 구간 18개, 총 23.4초
   - NG 후보 3건 (반복 발화)
   - 총 잘라낼 길이: 31.2초 (원본 6:12 -> 5:41)
   ```
6. **사용자 옵션**:
   - "전부 적용" -> batch 실행
   - "NG만 적용" / "무음만 적용" -> 부분 실행
   - "임계값 조정" -> `--gap`, `--similarity` 재실행
7. **batch 적용** — 모든 컷 구간을 한 번에:
   ```bash
   capcut batch --operations <ops.json> --dry-run --project <draft-dir>
   ```
   `ops.json` 예:
   ```json
   [
     {"action":"cut","from":"00:00:12.3","to":"00:00:13.5"},
     {"action":"cut","from":"00:00:45.0","to":"00:00:47.2"}
   ]
   ```
8. **승인** -> 실제 실행 -> `capcut info` diff
9. **롤백 안내**: 결과가 의도와 다르면 `capcut restore --backup latest`

## 임계값 가이드

| 옵션 | 기본 | 의미 |
|------|------|------|
| `--gap` | 1.0초 | 이 값보다 큰 단어 간격을 무음으로 간주 |
| `--similarity` | 0.85 | Jaccard 유사도 이상이면 NG로 간주 |

상황별 조정:
- 강의/설명 영상: `--gap 1.5` (의도된 일시정지 보존)
- 인터뷰: `--gap 0.8` (자연 호흡까지 컷)
- 자유 토크: `--similarity 0.75` (느슨하게)

## 실패 시 폴백

- whisper 미설치: 03 워크플로우 불가 -> 사용자에게 설치 안내 + 01(타임코드 수동)로 분기 제안
- 무음/NG 0개: "잘라낼 구간이 없습니다. 영상이 이미 깔끔합니다" 안내
- 컷 적용 후 부자연스러움: `capcut restore`로 즉시 복구

## 검증 (테스트 시나리오)

1. `tests/fixtures/sample-with-silence.mp4` (의도적 침묵 3구간) 사용
2. "무음 제거" -> 3구간 모두 감지 -> dry-run 표시 -> 승인 -> 길이 단축 확인
3. NG 발화 픽스처에서 "스마트 컷" -> 마지막 테이크만 유지 확인
