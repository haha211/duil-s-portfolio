# 21's Portfolio · ver2.0

기획과 개발을 잇는 직무를 목표로 한 포트폴리오 시안입니다.

## 이번 버전의 범위

- 한글 Pretendard Variable·영문 Geist Sans로 서체를 통일하고 제목·본문·보조 정보의 크기와 굵기, 행간 재정리
- 개인용 AI Agent를 첫 번째 대표 사례로 배치하고, 앤드와이즈 웹 기획 경력은 텍스트로 정리
- Agent 실행 화면·Figma 산출물 이미지 1개 자리를 자동화 흐름 아래에 배치
- 요구사항 정의·IA 작성·화면설계서 초안·Figma 화면설계서 작성 자동화 범위를 소개와 이력서에 반영
- 최근 경력의 배경·서체·여백·상세 패널을 기존 프로젝트에 맞추고 모바일 세로 배치 적용
- 프로젝트 5개의 첫 화면에 역할과 산출물을 노출하고 상세 패널로 부가 설명 제공
- 데스크톱 프로젝트의 이미지·설명을 두 열로 분리하고 모바일 Agent 화면은 요약 → 비주얼 → 상세 순서로 배치
- 초광폭 화면의 프로젝트 콘텐츠를 최대 1,280px로 제한하고, 높이 760px 미만에서는 문서 스크롤로 전환
- 첫 화면에 AI Agent 썸네일을 추가하고 다섯 사례의 미리보기·바로가기 연결
- 데스크톱에서 가려진 프로젝트의 포커스를 차단하고 화면 전환 시 상세 패널·영상 상태 정리
- About Awards·LG DX 프로젝트·이력서에 수상 증빙 Figma 링크 연결
- 긴 프로젝트 소개를 문제·역할·산출물 중심으로 정리
- 프로젝트 상세 버튼의 키보드 상태 표시 개선
- 첫 화면에 서비스 기획자 포지셔닝, 기획부터 구현까지의 역할, 프로젝트 이동 버튼 추가
- Contact에 이메일 작성 버튼과 독립 이력서 페이지 연결, 상단의 생년월일·전화번호 제거
- 모바일에서 프로젝트 섹션을 세로로 탐색하고 첫 화면 썸네일로 각 프로젝트에 바로 이동
- 프로젝트 영상·Archive 카드·상세 패널을 터치와 키보드로 조작 가능하게 변경하고 포커스 표시 복원
- 대표 이미지 8장을 WebP로 교체하고, 사용 시점에 불러오는 영상 미리보기를 경량 MP4로 분리
- 화면 내용을 `src/sections/`로 분리하고, CSS를 구역별 파일로 정리
- 쓰지 않는 jQuery·Slick·Scrolla·Momentum Slider·GSAP 로드와 관련 코드를 제거
- Intro와 Contact SVG의 중복 ID를 분리해 그라데이션·마스크 참조 충돌 가능성 제거
- 기존 화면 연출과 나머지 섹션은 유지

`index.html`을 열거나 이 폴더에서 정적 서버를 실행해 확인할 수 있습니다. 이력서는 `resume.html`에서 볼 수 있습니다.

확인되지 않은 성과 수치는 추가하지 않았습니다. 실제 사용자 문제, 본인 기여 범위, 배포 후 성과가 확인되면 사례 설명을 더 강화할 수 있습니다.

원본 PNG와 전체 길이 MP4는 폴더에 보관했습니다. 현재 페이지가 참조하는 대표 이미지 8장의 합계는 약 34.5MB에서 1.4MB로, 영상 미리보기 4개의 합계는 약 128.6MB에서 8.4MB로 줄었습니다. 영상은 재생을 시작할 때만 요청합니다.

## 파일 구조와 수정 방법

- `src/sections/`: Intro, About, Work, Archive, Contact의 HTML 원본. `andwise.html`은 Work 내부에 삽입하는 AI Agent 사례와 앤드와이즈 경력의 원본입니다.
- `src/site/`: 문서 시작과 스크립트 태그
- `css/`: fonts → base → intro → about → work → archive → contact → responsive → planning → typography 순서로 로드. 서체 정의와 토큰은 `fonts.css`, 공통 타이포그래피는 `typography.css`에서 관리합니다.
- `js/site.js`, `js/interactions.js`, `js/hero-about.js`, `js/work.js`: 스크롤·탐색, 상호작용, 첫 화면 전환, 프로젝트 동작
- `index.html`: 위 HTML 조각에서 생성하는 정적 배포 파일. 내용 수정은 `src/`에서 합니다.
- `.vscode/settings.json`: Live Server 포트 설정

HTML·CSS·JavaScript를 수정한 뒤 `python3 scripts/build.py`를 실행하세요. `python3 scripts/build.py --check`로 생성 파일이 최신인지 확인할 수 있습니다. 빌드 시 CSS·JavaScript 주소에 파일 내용 기반 버전을 붙여 이전 스타일 캐시가 섞이지 않게 합니다. 별도의 패키지 설치는 필요하지 않습니다. 페이지를 확인할 때는 이 폴더에서 `python3 -m http.server 5502`를 실행하고 `http://localhost:5502`를 여세요. 스크롤 연출은 외부 Lenis 스크립트를 사용하며, 로드되지 않아도 기본 브라우저 스크롤은 동작합니다.

## GitHub Pages 배포

배포 저장소: https://github.com/haha211/duil-s-portfolio

이 사이트는 정적 HTML/CSS/JavaScript로 구성되어 있습니다. 저장소의 `main` 브랜치 루트에 `index.html`, `resume.html`, `css/`, `js/`, `font/`, `img/`, `video/`와 `.nojekyll`을 올린 뒤, GitHub 저장소의 **Settings → Pages → Build and deployment**에서 **Deploy from a branch**, **main**, **/(root)**를 선택하면 됩니다. 예상 주소는 https://haha211.github.io/duil-s-portfolio/ 입니다.

커밋 전에 `python3 scripts/build.py --check`를 실행하세요. `.gitignore`는 현재 화면에서 사용하지 않는 원본 PNG·전체 길이 영상·로컬 미리보기 캡처를 제외합니다. `video/between_universe.mp4`는 프로젝트 결과물 링크에서 사용하므로 포함됩니다.
