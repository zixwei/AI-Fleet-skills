# Workflow 14: 다국어 동시 자막

원본 + 1개 이상 번역 자막을 동시에 트랙으로 추가. 위/아래/색상 구분.

## 입력 예시

- "한글은 위, 영어는 아래로"
- "한국어/영어/일본어 자막 동시에"
- "원본은 흰색, 번역은 노란색"

## 처리 단계

1. 사전 검증 게이트
2. 자막 소스 결정 (워크플로우 05 참조 — 기존 자막 사용 또는 신규 생성)
3. 번역 대상 언어 결정 (사용자 입력)
4. 각 언어별 자막 트랙 생성:
   ```bash
   # 원본 (예: 한국어)
   capcut caption --language ko --output srt --out _ko.srt --project <draft>

   # 영어 번역
   capcut translate --from _ko.srt --to en --out _en.srt

   # 일본어 번역
   capcut translate --from _ko.srt --to ja --out _ja.srt
   ```
5. 트랙으로 추가 + 언어별 폰트/색상/위치:
   ```bash
   capcut import-srt _ko.srt --position bottom --font "Pretendard Black" --color "#FFFFFF" --y-offset -120 --project <draft>
   capcut import-srt _en.srt --position bottom --font "Geist Black" --color "#FFEB3B" --y-offset -60 --project <draft>
   capcut import-srt _ja.srt --position bottom --font "NotoSansJP Bold" --color "#34D399" --y-offset 0 --project <draft>
   ```
6. dry-run -> 승인 -> 실행

## 위치/색상 자동 매핑

| 언어 위치 | y-offset (px, 화면 하단 기준) | 기본 색상 |
|-----------|------------------------------|-----------|
| 위 (top of stack) | -120 | #FFFFFF |
| 중간 | -60 | #FFEB3B |
| 아래 (bottom) | 0 | #34D399 |

언어별 기본 폰트:
- ko: Pretendard Black
- en: Geist Black
- ja: NotoSansJP Bold
- zh: NotoSansSC Bold

사용자가 명시하지 않으면 위 기본을 적용. "한글 위 영어 아래" 같은 지시 -> 매핑 자동 변경.

## 비용 통제 (워크플로우 05의 정책 상속)

- 각 번역 전 토큰 추정 표시
- 다중 언어 일괄 번역 시 총 합계 표시 후 확인

## 충돌 처리

- 화면 하단이 4단 이상 자막으로 가득 차면 가독성 저하 -> 사용자에게 줄임/이동 권유
- 일부 언어 폰트 미설치: `rules/font-catalog.md` 참조하여 설치 안내, 또는 시스템 폴백

## 검증 시나리오

1. 한국어 픽스처 -> "한/영/일 동시 자막" -> 3개 트랙 + 위/중간/아래 배치 + 폰트 각각 적용 확인
2. "원본 흰색, 번역 노랑" -> 색상 자동 매핑 확인
