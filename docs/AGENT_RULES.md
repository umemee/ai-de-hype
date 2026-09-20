# AGENT RULES & CONSTRAINTS

## 1. 프론트엔드 디자인 원칙 (taste-skill Anti-Slop Framework 준수)
- 본 프로젝트는 'taste-skill' (design-taste-frontend v2) 디자인 가이드라인을 최우선 규칙으로 강제한다.
- 뻔한 AI 래퍼(AI Slop) 스타일을 엄격히 배제하고, 엔지니어링 신뢰도 높은 프로덕트 UI를 구현한다.

### taste-skill 다이얼 설정 (Settings)
- DESIGN_VARIANCE: 4 (과도한 비대칭을 지양하고 단정하며 구조적인 레이아웃 유지)
- MOTION_INTENSITY: 2 (불필요한 플로팅/바운스 애니메이션 금지, 즉각적인 반응 중심의 절제된 트랜지션)
- VISUAL_DENSITY: 7 (엔지니어링 진단서 및 기술 스펙 도감에 적합한 밀도 높은 정보 구조)

### 금지 사항 (Anti-AI Clichés)
- [금지] 보라색/청록색 그라디언트, 네온 발광 효과(Glow), 블러 유리 효과(Glassmorphism).
- [금지] 둥글넓적한 pill 형태 버튼(rounded-full), 인위적인 반짝이(✨, 🤖) 아이콘.
- [금지] 긴 문장형 부연 설명 및 장식용 플레이스홀더.

### 타이포그래피 & 스타일링
- [배경] 차분한 zinc 단색 계열 (Light: zinc-50 / zinc-100, Dark: zinc-900 / zinc-950).
- [테두리] 1px 솔리드 라인 (border-zinc-200 / border-zinc-800) 및 단정한 모서리 (rounded-md 또는 rounded-sm).
- [폰트] 본문은 가독성 높은 고품질 산세리프(Geist, Pretendard), 점수/티어/수치/하드웨어 사양/코드에는 고정폭 폰트(font-mono) 필수 적용.
- [포인트 컬러] 절제된 터미널 엠버(amber-600) 또는 에메랄드(emerald-600) 단 1종만 기능적 강조(경고/합격) 목적으로 사용.

## 2. 개발 및 아키텍처 제약 조건
- DB(데이터베이스) 및 사용자 인증(로그인) 라이브러리를 절대 설치하거나 사용하지 않는다.
- 모든 상태 관리는 React 기본 훅(useState, useEffect)으로만 처리한다.
- 문제는 src/data/questions.json, 도감은 src/data/tools.json의 정적 데이터를 읽어서 렌더링한다.
- API 호출은 두 개의 서버 라우트로 분리한다.
  1) /api/diagnose : 결과 화면 진입 시 1회만 호출 (기존 규칙 유지)
  2) /api/coach : AI 활용법 코치 화면에서 사용자 질문마다 호출 (세션당 다회 허용)
  둘 다 Gemini 무료 티어 rate limit(분당 약 15회, 일 약 1,500회)을 넘으면
  정적 폴백 응답으로 자동 전환해야 하며, 이 폴백 로직 없이는 배포하지 않는다.
- 외부 의존성을 최소화하고 Vercel 단일 배포 환경에서 빌드 에러가 없도록 유지한다.