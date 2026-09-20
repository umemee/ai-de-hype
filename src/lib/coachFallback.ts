import { QuestionCategory } from "@/types/diagnosis";

export interface CoachRequest {
  user_query: string;
  user_level?: number | null;
  weak_axis?: QuestionCategory | null;
}

export interface CitedSource {
  id: string;
  title: string;
  url?: string;
}

export interface CoachResponse {
  in_scope: boolean;
  answer: string;
  cited_sources: CitedSource[];
  fallback_used: boolean;
}

// 1차 공식 소스 마스터 딕셔너리
export const PRIMARY_SOURCES: Record<string, CitedSource> = {
  "git-github": {
    id: "git-github",
    title: "Git & GitHub 로컬 롤백 가이드",
    url: "https://desktop.github.com",
  },
  continue: {
    id: "continue",
    title: "Continue (VS Code AI 어시스턴트)",
    url: "https://continue.dev",
  },
  "semantic-scholar": {
    id: "semantic-scholar",
    title: "Semantic Scholar & DOI Resolver",
    url: "https://www.semanticscholar.org",
  },
  obsidian: {
    id: "obsidian",
    title: "Obsidian (로컬 지식 내재화 노트)",
    url: "https://obsidian.md",
  },
  "google-sheets-apps-script": {
    id: "google-sheets-apps-script",
    title: "구글 스프레드시트 + 무료 API 연동",
    url: "https://workspace.google.com/products/sheets/",
  },
  "open-webui": {
    id: "open-webui",
    title: "Open WebUI (로컬 사설 챗 인터페이스)",
    url: "https://openwebui.com",
  },
  git_rollback: {
    id: "git_rollback",
    title: "Git 공식 문서 (Pro Git: Undoing Things)",
    url: "https://git-scm.com/book/ko/v2",
  },
  api_hard_limit: {
    id: "api_hard_limit",
    title: "OpenAI Platform Usage Limits & Budget Controls",
    url: "https://platform.openai.com/docs/guides/production-best-practices",
  },
  academic_citation_check: {
    id: "academic_citation_check",
    title: "International DOI Foundation & 학술 DB 교차검증",
    url: "https://www.doi.org",
  },
  tabular_missing_values: {
    id: "tabular_missing_values",
    title: "OpenRefine 정형 데이터 정제 및 결측치 세척 가이드",
    url: "https://openrefine.org/docs",
  },
  anti_slop_constraints: {
    id: "anti_slop_constraints",
    title: "Anthropic Claude Prompt Engineering Guide (정량 제약)",
    url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering",
  },
  net_zero_learning_prevention: {
    id: "net_zero_learning_prevention",
    title: "The New SDLC With Vibe Coding (넷제로 러닝 방지 루틴)",
    url: "https://addyosmani.com",
  },
  rag_version_metadata: {
    id: "rag_version_metadata",
    title: "Google Cloud RAG Architecture (버전 메타데이터 필터링)",
    url: "https://cloud.google.com/architecture",
  },
  data_governance_zdr: {
    id: "data_governance_zdr",
    title: "NIST AI Risk Management Framework 1.0 (ZDR 보안 원칙)",
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
  },
};

/**
 * 정적 Fallback 응답 생성기
 * Gemini API 429(Rate Limit), 네트워크 타임아웃, API 키 미설정 시에도
 * 사용자에게 절대로 500 에러를 노출하지 않고 고품질 실무 가이드를 반환합니다.
 */
export function generateCoachFallback(req: CoachRequest): CoachResponse {
  const query = (req.user_query || "").toLowerCase().trim();
  const level = req.user_level ?? null;
  const weakAxis = req.weak_axis ?? null;

  // 1. 명백한 범위 밖 질의 감지 (요리, 가십, 스포츠 등)
  const outOfScopeKeywords = [
    "요리",
    "레시피",
    "맛집",
    "아이돌",
    "연예인",
    "열애",
    "축구",
    "야구",
    "날씨",
    "운세",
    "로또",
  ];
  if (outOfScopeKeywords.some((k) => query.includes(k))) {
    return {
      in_scope: false,
      answer:
        "본 서비스는 AI 실무 활용, 업무 자동화, 프롬프트 엔지니어링, 데이터 검증 질문에 집중합니다. 도구 활용법이나 검증 방식에 대해 질문해 주세요.",
      cited_sources: [],
      fallback_used: true,
    };
  }

  // 2. 키워드별 맞춤 고품질 실무 가이드라인

  // A. 기획서 / 슬롭 / 프롬프트 제약
  if (
    query.includes("슬롭") ||
    query.includes("기획서") ||
    query.includes("미사여구") ||
    query.includes("프롬프트") ||
    query.includes("작성")
  ) {
    return {
      in_scope: true,
      answer: `### 🎯 기획서 AI 슬롭(공허한 미사여구) 제거를 위한 3대 원칙

1. **추상적 형용사 전면 금지 (Negative Constraint)**
   - 프롬프트 상단에 \`"다각적 시너지", "유기적 연계", "혁신적 가치" 등 비즈니스 미사여구 작성 금지\`를 명시하십시오.
   
2. **필수 정량 테이블 규격 강제**
   - 글자 수가 아닌 **[타깃 고객 3개 군]**, **[월간 예산 상한선 표]**, **[4주 단위 WBS 실행 일정표]**와 같이 채워야 할 수치 칸을 지정하십시오.

3. **작성 후 넷제로 러닝(Net-zero) 방지 루틴**
   - AI 생성물을 복사하기 전 창을 닫고, 핵심 주장 3가지와 근거를 본인의 언어로 1줄 요약해 메모하십시오.`,
      cited_sources: [
        PRIMARY_SOURCES["anti_slop_constraints"],
        PRIMARY_SOURCES["obsidian"],
        PRIMARY_SOURCES["net_zero_learning_prevention"],
      ],
      fallback_used: true,
    };
  }

  // B. 대용량 엑셀 / 데이터 세척 / 환각
  if (
    query.includes("엑셀") ||
    query.includes("데이터") ||
    query.includes("결측치") ||
    query.includes("환각") ||
    query.includes("시트")
  ) {
    return {
      in_scope: true,
      answer: `### 📊 대용량 데이터 AI 투입 전 무결성 확보 절차

1. **병합 셀 해제 및 결측치(빈 셀) 사전 세척**
   - AI에 엑셀(.xlsx)을 바로 넣으면 결측치를 임의로 0 또는 평균값으로 가정하여 발주/계산 왜곡이 일어납니다.
   - 투입 전 결측치 필터링 및 병합 셀을 반드시 해제하십시오.

2. **0원 자동화 파이프라인 (Google Sheets + 무료 API)**
   - 수십만 원짜리 유료 툴 없이도 구글 시트의 Apps Script를 이용하면 수백 행 텍스트 정제와 분류를 무료로 자동화할 수 있습니다.

3. **산출식 원본 셀 좌표 역추적**
   - AI가 요약 수치를 내놓으면 반드시 \`"이 수치가 도출된 원본 행 번호와 계산식을 제시하라"\`고 역추적을 요구하십시오.`,
      cited_sources: [
        PRIMARY_SOURCES["tabular_missing_values"],
        PRIMARY_SOURCES["google-sheets-apps-script"],
      ],
      fallback_used: true,
    };
  }

  // C. 로컬 LLM / 사내 보안 / 격리 환경
  if (
    query.includes("로컬") ||
    query.includes("llm") ||
    query.includes("보안") ||
    query.includes("open-webui") ||
    query.includes("기밀") ||
    query.includes("nda")
  ) {
    return {
      in_scope: true,
      answer: `### 🛡️ 사내 기밀 유출 제로 로컬 사설 환경 구축 가이드

1. **하드웨어 최소 사양 확인 (현실적 제약)**
   - 로컬 모델 구동 시 최소 **RAM 16GB 이상**이 필요합니다. 사양 미달 시 PC 프리징이나 크래시가 발생할 수 있습니다.
   - 전용 외장 GPU가 없는 환경에서는 CPU 모드를 지원하는 가벼운 7B/8B 모델 위주로 운영하십시오.

2. **Open WebUI를 통한 로컬 전용 챗 인터페이스**
   - Docker 또는 Python 환경에서 Open WebUI를 구동하면 외부 서버로 데이터가 1바이트도 전송되지 않는 격리된 사설 챗을 구성할 수 있습니다.

3. **ZDR(Zero Data Retention) 검증**
   - 상용 API를 부득이 연동할 때는 프롬프트의 주의 문구에 기대지 말고, 개발자 계약 상의 데이터 보존 제외(Opt-out / ZDR) 설정을 반드시 점검하십시오.`,
      cited_sources: [
        PRIMARY_SOURCES["open-webui"],
        PRIMARY_SOURCES["continue"],
        PRIMARY_SOURCES["data_governance_zdr"],
      ],
      fallback_used: true,
    };
  }

  // D. Git / 복구 / 롤백 / 에러
  if (
    query.includes("git") ||
    query.includes("깃") ||
    query.includes("코드") ||
    query.includes("망했") ||
    query.includes("복구") ||
    query.includes("롤백") ||
    query.includes("터미널")
  ) {
    return {
      in_scope: true,
      answer: `### ⏪ AI 코딩 도중 코드 꼬임 발생 시 즉각 복구 4단계

1. **절대 프로젝트 폴더를 삭제하지 마십시오**
   - AI에게 "처음부터 다시 짜줘"라고 반복 지시하면 기존 파일 트리와 의존성이 더 깊게 엉킵니다.

2. **Git diff로 AI 변경 지점 분리**
   - 정상 동작하던 직전 체크포인트와 비교하여 AI가 수정한 3~4개 파일의 변경분(diff)만 먼저 확인하십시오.

3. **GUI 기반 원클릭 롤백 (GitHub Desktop)**
   - 복잡한 터미널 명령어가 익숙지 않다면 무료 GUI 툴인 GitHub Desktop에서 \`Discard Changes\`를 눌러 즉각 이전 커밋 상태로 복구하십시오.

4. **비용 및 API 폭주 방지**
   - 무한 루프 에러로 인한 과금 방지를 위해 API 플랫폼 Billing 설정에서 **Hard Limit**을 필수 지정하십시오.`,
      cited_sources: [
        PRIMARY_SOURCES["git-github"],
        PRIMARY_SOURCES["git_rollback"],
        PRIMARY_SOURCES["api_hard_limit"],
      ],
      fallback_used: true,
    };
  }

  // E. 기본 실무 안내 (취약 축 연동 개인화)
  const weakAxisAdvice =
    weakAxis === "verification_grounding"
      ? "회원님의 현재 취약 영역인 **출처 및 수치 검증력**을 위해, AI가 제시한 숫자와 서지 정보는 반드시 원본 DB(doi.org 등)에서 1차 대조를 거치십시오."
      : weakAxis === "data_governance"
      ? "회원님의 현재 취약 영역인 **사내 보안 & 거버넌스**를 위해, 기밀 정보는 프롬프트 첫머리 주의문 대신 식별자 마스킹 및 사내 규정 개정일자 버전 관리를 우선하십시오."
      : weakAxis === "critical_thinking"
      ? "회원님의 현재 취약 영역인 **비판적 사고**를 위해, AI가 작성한 결과물에서 수식어를 지우고 정량 지표와 표 형식 제약 조건을 강제하십시오."
      : "회원님의 현재 취약 영역인 **실행 및 복구 통제**를 위해, 코드나 자동화 도구 테스트 전 직전 정상 상태로 돌아가는 Git 체크포인트 롤백을 확보하십시오.";

  return {
    in_scope: true,
    answer: `### 🧭 AI De-Hype 실무 엔지니어링 가이드라인

${level ? `**[Lv.${level} 맞춤 조언]**\n` : ""}${weakAxisAdvice}

#### 권장 실행 3단계:
1. **1차 원문 확인**: SNS 인플루언서의 2차 요약 대신 공식 개발자 문서(OpenAI Cookbook, Anthropic Guide)의 제약 사항을 먼저 확인하십시오.
2. **하드웨어 및 비용 한도 사전 설정**: 로컬 도구 구동 시 16GB+ RAM 요구 사항을 점검하고, API 연동 시 Billing Hard Limit을 반드시 활성화하십시오.
3. **지식 내재화(Anti Net-zero)**: AI가 대신 처리한 결과물은 Obsidian 등 로컬 노트에 본인의 언어로 재구성하여 지식 휘발을 방지하십시오.`,
    cited_sources: [
      PRIMARY_SOURCES["git-github"],
      PRIMARY_SOURCES["obsidian"],
      PRIMARY_SOURCES["anti_slop_constraints"],
    ],
    fallback_used: true,
  };
}
