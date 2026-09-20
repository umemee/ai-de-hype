import { QuestionCategory, CategoryScores, DiagnosisResult } from "@/types/diagnosis";
import { CATEGORY_NAMES, getTierStageName } from "@/lib/scoring";

export interface FallbackParams {
  calculatedLevel: number;
  defaultTierTitle?: string;
  categoryScores: CategoryScores;
  weakestCategory: QuestionCategory;
  strongestCategory?: QuestionCategory;
}

export function generateFallbackDiagnosis({
  calculatedLevel,
  defaultTierTitle,
  categoryScores,
  weakestCategory,
  strongestCategory = "execution_rollback",
}: FallbackParams): DiagnosisResult {
  const level = Math.max(1, Math.min(20, calculatedLevel));
  const stageName = getTierStageName(level);
  const tierTitle = defaultTierTitle || `Lv. ${level} ${stageName}`;
  const weakestName = CATEGORY_NAMES[weakestCategory] || "실무 통제";
  const strongestName = CATEGORY_NAMES[strongestCategory] || "실행 역량";

  // 1. Level-specific clinical summaries
  let clinical_summary = "";
  if (level <= 5) {
    clinical_summary = `현재 AI 도구의 내부 작동 원리나 에러 로그를 직접 확인하지 않고 결과물에 전적으로 의존하는 상태입니다. 특히 가장 보완이 시급한 [${weakestName}] 역량에서 터미널 에러 대응 및 1차 교차 검증 습관이 정착되지 않아, 예기치 않은 오류나 환각 발생 시 작업이 중단될 위험이 높습니다.`;
  } else if (level <= 10) {
    clinical_summary = `AI 도구의 기본적인 프롬프트와 인터페이스 활용은 능숙하지만, 복구 및 검증 체계가 일부 미흡합니다. 특히 [${weakestName}] 축에서 Git 체크포인트 활용이나 정량적 제약 조건 통제가 보완된다면, AI를 단순한 질의응답 툴을 넘어 실무 프로세스의 든든한 보조 도구로 격상시킬 수 있습니다.`;
  } else if (level <= 15) {
    clinical_summary = `전반적인 AI 제어력과 출력물 검증 능력이 준수하며, 실무 프로세스에 AI를 안전하게 결합할 수 있는 실무 통제 단계입니다. 강점인 [${strongestName}]을 적극 활용하고, [${weakestName}] 영역에서 발생할 수 있는 잠재적 위험(비용 누수, 대용량 데이터 왜곡 등)에 대한 선제적 안전망을 완성하면 최고 수준의 아키텍트로 도약할 수 있습니다.`;
  } else {
    clinical_summary = `4대 핵심 역량 전반에 걸쳐 빅테크 공식 엔지니어링 가이드라인을 깊이 이해하고 통제하는 최고 수준의 AI 아키텍트입니다. 강점인 [${strongestName}]을 바탕으로 팀 내 AI 도입 가이드라인 및 ZDR 거버넌스를 주도할 수 있으며, [${weakestName}] 분야의 미세한 엣지 케이스만 점검하면 완벽한 AI 파이프라인을 구축할 수 있습니다.`;
  }

  // 2. Category-specific caution warnings
  const cautionWarnings: Record<QuestionCategory, string> = {
    execution_rollback:
      "SNS에서 '코드 한 줄 몰라도 완전 자동화'라고 홍보하는 툴일수록 로컬 파일 시스템을 임의 수정할 위험이 큽니다. 반드시 Git 체크포인트 롤백을 선행 설정하고, 개발자 대시보드에서 일간/월간 과금 상한선(Hard Limit)을 설정하여 예기치 않은 루프 폭주를 차단하십시오.",
    verification_grounding:
      "AI가 그럴듯한 서지 정보나 통계 수치를 인용하더라도, 최소 1건 이상의 공인 학술 DB(Semantic Scholar, PubMed 등)나 원본 데이터셋에서 직접 검색 대조(Grounding)를 거치지 않은 수치는 보고서나 발표 자료에 절대 그대로 반영하지 마십시오.",
    critical_thinking:
      "AI가 생성한 장황한 문장(AI Slop)은 검토자의 인지 피로도를 높이고 핵심 정보를 은폐합니다. 프롬프트에 '형용사와 수식어를 배제하고 핵심 결론 3줄 및 불릿 포인트 5개 이내로 요약'과 같은 정량적 제약 조건을 강제하여 정보의 밀도를 극대화하십시오.",
    data_governance:
      "무료 웹 챗봇에 사내 비공개 문서나 고객 개인정보를 입력하는 행위는 데이터 유출 사고로 직결될 수 있습니다. 상용 AI 서비스 이용 전 반드시 데이터 재학습 제외(Opt-out) 및 ZDR(Zero Data Retention) SLA 체결 여부를 확인하고, 민감 정보는 사전 비식별화(Masking) 후 투입하십시오.",
  };

  const caution_warning =
    cautionWarnings[weakestCategory] ||
    "AI 도구 도입 시 SNS의 과장된 홍보 문구에 의존하지 마시고, 빅테크 공식 문서(프롬프트 가이드, 쿡북)에 기재된 제약 사항과 비용 모델을 1차로 교차 확인하십시오.";

  // 3. Recommended curriculum matched to weakest category & track
  type CurriculumMap = Record<
    QuestionCategory,
    { track: "automation" | "study" | "office"; title: string; action_item: string; guide_url: string }
  >;

  const curriculums: CurriculumMap = {
    execution_rollback: {
      track: "automation",
      title: "Git Desktop 0원 로컬 안전망 & API Hard Limit 제어",
      action_item: "GUI 기반 Git 롤백 환경을 구성하고 AI Studio에서 $0 결제 상한선 설정하기",
      guide_url: "https://desktop.github.com",
    },
    verification_grounding: {
      track: "study",
      title: "Semantic Scholar & DOI 기반 3초 팩트체크 파이프라인",
      action_item: "AI가 제시한 핵심 논문 DOI를 공인 학술 DB에서 교차 검증하기",
      guide_url: "https://www.semanticscholar.org",
    },
    critical_thinking: {
      track: "study",
      title: "Net-zero 방지: Obsidian 로컬 지식 내재화 루틴",
      action_item: "AI 요약본을 자기 언어로 재정의하고 로컬 마크다운에 영구 아카이빙하기",
      guide_url: "https://obsidian.md",
    },
    data_governance: {
      track: "office",
      title: "OpenRefine 기반 대용량 데이터 세척 & 비식별화",
      action_item: "AI 투입 전 엑셀 결측치를 정제하고 민감 개인정보 정규식 마스킹하기",
      guide_url: "https://openrefine.org",
    },
  };

  const recommended_curriculum = curriculums[weakestCategory];

  return {
    calculated_level: level,
    tier_title: tierTitle,
    clinical_summary,
    category_scores: categoryScores,
    caution_warning,
    recommended_curriculum,
  };
}
