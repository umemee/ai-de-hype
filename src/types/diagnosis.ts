export type QuestionCategory =
  | "execution_rollback"
  | "verification_grounding"
  | "critical_thinking"
  | "data_governance";

export interface TermTooltip {
  term: string;
  definition: string;
}

export interface Question {
  id: number;
  category: QuestionCategory;
  tier_level: number;
  scenario: string;
  question: string;
  options: string[];
  answer_index: number; // 0 ~ 3
  explanation: string;
  term_tooltip?: TermTooltip;
  source_reference: string; // 1차 소스 출처 (필수)
}

export type ToolTrack = "office" | "study" | "automation";

export type VerifiedByTag = "personal_use" | "source_transparent" | "citation_checked";

export interface Tool {
  id: string;
  name: string;
  category: string;
  target_track: ToolTrack;
  required_specs: string;
  setup_time: string;
  hype_vs_reality: string;
  link: string;
  verified_by: VerifiedByTag[];
}

export interface CategoryScores {
  execution_rollback: number;
  verification_grounding: number;
  critical_thinking: number;
  data_governance: number;
}

export interface RecommendedCurriculum {
  track: ToolTrack | string;
  title: string;
  action_item: string;
  guide_url: string;
}

export interface DiagnosisResult {
  calculated_level: number;
  tier_title: string;
  clinical_summary: string;
  category_scores: CategoryScores;
  caution_warning: string;
  recommended_curriculum: RecommendedCurriculum;
}
