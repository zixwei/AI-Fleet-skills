# Skill Routing Reference

CapCut 스킬과 다른 스킬 간의 우선순위 및 충돌 해결 규칙. SKILL.md 라우터의 "다른 스킬 충돌 체크" 단계 근거.

---

## 1. 우선순위 표

| 입력 유형 | 우선 스킬 | 근거 |
|-----------|-----------|------|
| CapCut/JianYing draft 폴더 입력 또는 캡컷 명시 | **capcut** | 본 스킬 영역 |
| 일반 mp4/mov 컷·인코딩 (CapCut 무관) | `video` | FFmpeg/Remotion 기반 일반 영상 처리 |
| Remotion 코드형 영상 생성 | `video` | 프로그래머블 영상 |
| 영상 자막만 (CapCut 무관) | `video` 또는 직접 ffmpeg | CapCut 프로젝트 없으면 굳이 본 스킬 불필요 |
| 화면 디자인/랜딩페이지 UI | `frontend-design` | 영상 X |
| 모션 그래픽 단독 (After Effects 류) | `game-dev` (motion designer) | 본 스킬 영역 아님 |
| 영상 콘텐츠 기획/스토리보드 | `storyboard` | 기획 단계 |
| 영상 마케팅 카피/SNS 콘텐츠 | `sns`, `content-creator` | 콘텐츠 영역 |

---

## 2. 위임 트리거 사례

### 케이스 A: 일반 mp4 변환
- 입력: "이 mp4를 mov로 변환해줘"
- CapCut 컨텍스트 없음 -> 본 스킬 비활성
- 라우팅: `video` 스킬 안내 후 종료
- 안내 메시지 예: "`video` 스킬 또는 ffmpeg 직접 호출이 적합합니다. CapCut 프로젝트 편집이 필요하시면 다시 알려주세요."

### 케이스 B: CapCut 프로젝트 자막 작업
- 입력: "이 캡컷 프로젝트에 자막 만들어"
- CapCut 명시 + 자막 키워드 -> 본 스킬 발화
- 라우팅: 워크플로우 05

### 케이스 C: 일반 영상 자막 (CapCut 무관)
- 입력: "이 mp4에 자막 입혀줘"
- 자막 키워드 O, CapCut 컨텍스트 X -> 본 스킬 비활성
- 라우팅: `video` 스킬

### 케이스 D: 모션 그래픽 단독
- 입력: "타이틀 인트로 모션 만들어줘"
- 영상이지만 CapCut과 무관 -> 본 스킬 비활성
- 라우팅: `game-dev` motion designer 또는 `video` (Remotion)

---

## 3. 모호한 케이스 처리

### 케이스 E: "쇼츠 만들어줘" (CapCut 명시 없음)
- 쇼츠 키워드 O, CapCut 명시 X, 영상 파일도 명시 X
- 처리: 인터뷰 진입 — "CapCut 프로젝트가 있나요, 아니면 신규 영상 파일인가요?"
  - CapCut -> 본 스킬 04
  - 신규 영상 -> `video` 스킬 또는 외부 도구

### 케이스 F: 영상 + 자막 동시
- 자막은 본 스킬 05, 인코딩은 `video` 영역
- 처리: 입력 컨테이너가 CapCut 프로젝트이면 본 스킬 단독. mp4면 `video` 단독.

---

## 4. 라우팅 결정 의사코드

```
function routeSkill(userInput, context):
    if contains_negative_pattern(userInput):
        return null

    if not contains_first_tier_keyword(userInput):
        return null  # 본 스킬 비후보

    if not satisfies_context_condition(userInput, context):
        # 1차 통과했으나 컨텍스트 미충족
        if alternate_skill := detect_alternate(userInput):
            return delegate_message(alternate_skill)
        else:
            return enter_interview_mode()

    intent := classify_intent(userInput)
    return route_workflow(intent)
```

---

## 5. 위임 메시지 템플릿

본 스킬이 발화하지 않고 다른 스킬로 위임할 때, 다음 형식으로 짧게 안내한다:

```
이 요청은 `<skill-name>` 스킬이 적합합니다.
- 이유: <간단한 한 줄>
- 다시 본 스킬을 사용하려면: CapCut/캡컷 프로젝트를 명시하거나 /capcut을 입력해 주세요.
```

스킬 이름 예: `video`, `frontend-design`, `game-dev`, `storyboard`, `sns`.

---

## 6. 변경 시 점검 항목

- 새 스킬 추가 시 위 표 갱신
- 위임 메시지가 사용자에게 명확한지 분기별 1회 점검
- error-kb에 "잘못된 라우팅" 패턴 누적되면 negative pattern 또는 우선순위 조정
