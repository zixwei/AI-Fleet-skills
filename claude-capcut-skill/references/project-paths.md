# CapCut Project Paths

OS별 CapCut/JianYing 프로젝트(`draft_content.json`) 위치. `scripts/locate-project.mjs`가 이 표 기준으로 자동 검색.

---

## Windows

```
%LOCALAPPDATA%\CapCut\User Data\Projects\com.lveditor.draft\
%LOCALAPPDATA%\JianyingPro\User Data\Projects\com.lveditor.draft\
```

기본 환경변수: `%LOCALAPPDATA%` = `C:\Users\<user>\AppData\Local`

내부 구조:
```
com.lveditor.draft/
├── <project-id-1>/
│   ├── draft_content.json
│   ├── draft_info.json
│   └── (assets, effects, thumbnails 등)
└── <project-id-2>/
    └── ...
```

## macOS

```
~/Movies/CapCut/User Data/Projects/com.lveditor.draft/
~/Movies/JianYingPro/User Data/Projects/com.lveditor.draft/
```

파일명 차이: macOS는 `draft_info.json`을 메인으로 사용하기도 함. capcut-cli가 양쪽 모두 지원.

## Linux

CapCut Desktop은 Linux 미지원. **WSL 사용 시** Windows 측 경로(`/mnt/c/Users/<user>/AppData/Local/CapCut/...`)를 통해 접근 가능.

`scripts/locate-project.mjs`는 WSL 환경에서 `/mnt/c/Users` 하위를 자동 스캔한다.

---

## 환경변수 오버라이드

```bash
export CAPCUT_DRAFT_ROOT="/custom/path/to/com.lveditor.draft"
```

설정 시 `capcut-cli`와 본 스킬 모두 이 경로를 우선 사용한다.

특수 시나리오:
- 외장 디스크에 프로젝트 보관
- 회사·개인 듀얼 부팅
- 가상머신 공유 볼륨

---

## CapCut Web 비지원

CapCut Web (브라우저 버전)은 프로젝트가 브라우저 IndexedDB에 저장되어 로컬 파일이 없다. 본 스킬은 Desktop 전용.

`scripts/locate-project.mjs`가 Desktop 미설치 + 브라우저 흔적 감지 시:
```
CapCut Web 흔적이 감지되었습니다.
본 스킬은 Desktop 전용입니다. Desktop을 설치한 뒤 재시도해 주세요.
다운로드: https://www.capcut.com/tools/desktop-video-editor
```

---

## draft_content.json 핵심 필드 (참고)

```json
{
  "id": "<project-id>",
  "duration": 180000,
  "fps": 30,
  "canvas_config": { "width": 1920, "height": 1080 },
  "tracks": [
    {
      "id": "<track-id>",
      "type": "video|audio|text|effect",
      "segments": [
        {
          "id": "<segment-id>",
          "material_id": "<material-id>",
          "source_timerange": { "start": 0, "duration": 5000 },
          "target_timerange": { "start": 0, "duration": 5000 }
        }
      ]
    }
  ],
  "materials": { "videos": [...], "audios": [...], "texts": [...], "effects": [...] }
}
```

시간 단위는 마이크로초. capcut-cli가 `HH:MM:SS.ss` <-> 마이크로초 변환을 처리.
