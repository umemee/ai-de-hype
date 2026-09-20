import { Question, QuestionCategory, CategoryScores } from "@/types/diagnosis";

export interface ScoreCalculationResult {
  categoryScores: CategoryScores;
  totalCorrect: number;
  totalQuestions: number;
  accuracyPercent: number;
  overallScore: number;
  calculatedLevel: number;
  defaultTierTitle: string;
  stageName: string;
  tierDescription: string;
  weakestCategory: QuestionCategory;
  strongestCategory: QuestionCategory;
}

export const CATEGORY_NAMES: Record<QuestionCategory, string> = {
  execution_rollback: "실행 및 복구 통제",
  verification_grounding: "출처 및 수치 검증",
  critical_thinking: "안티 슬롭 & 사고력",
  data_governance: "사내 보안 & 거버넌스",
};

/**
 * Formal tie-break priority order:
 * execution_rollback -> verification_grounding -> critical_thinking -> data_governance
 */
export const CATEGORY_PRIORITY: QuestionCategory[] = [
  "execution_rollback",
  "verification_grounding",
  "critical_thinking",
  "data_governance",
];

export function getTierStageName(level: number): string {
  if (level <= 5) return "블랙박스 의존 단계";
  if (level <= 10) return "실행 및 탐색 단계";
  if (level <= 15) return "실무 통제자 단계";
  return "AI 아키텍트 단계";
}

export function getTierDescription(level: number): string {
  if (level <= 5) return "터미널 에러와 환각 통제 기초 필요";
  if (level <= 10) return "체크포인트 롤백 및 교차검증 루틴 형성 필요";
  if (level <= 15) return "데이터 전처리 및 안티 슬롭 프롬프트 통제";
  return "자율 디버깅 및 사내 거버넌스 주도";
}

/**
 * Maps overall score (0 ~ 100 in steps of 5) to calibrated level (1 ~ 20) and tier title.
 * 4 Tiers:
 * - Lv. 1~5: 블랙박스 의존 단계
 * - Lv. 6~10: 실행 및 탐색 단계
 * - Lv. 11~15: 실무 통제자 단계
 * - Lv. 16~20: AI 아키텍트 단계
 */
export function calculateLevelAndTier(overallScore: number): {
  level: number;
  tierTitle: string;
  stageName: string;
  tierDescription: string;
} {
  const clampedScore = Math.max(0, Math.min(100, Math.round(overallScore)));
  // 0~100 points map to 1~20 levels (5 points per level, capped at Lv. 20)
  const level = Math.min(20, Math.max(1, Math.floor(clampedScore / 5) + 1));
  const stageName = getTierStageName(level);
  const tierDescription = getTierDescription(level);

  return {
    level,
    stageName,
    tierDescription,
    tierTitle: `Lv. ${level} ${stageName}`,
  };
}

export function calculateLevel(score: number): number {
  return calculateLevelAndTier(score).level;
}

export function getTierTitle(level: number): string {
  return `Lv. ${level} ${getTierStageName(level)}`;
}

/**
 * Method B: Arithmetic average of the 4 category scores (0~100 in steps of 5, 21 discrete values).
 */
export function calculateOverallScore(categoryScores: CategoryScores): number {
  const sum =
    categoryScores.execution_rollback +
    categoryScores.verification_grounding +
    categoryScores.critical_thinking +
    categoryScores.data_governance;
  return Math.round(sum / 4);
}

/**
 * Identifies the weakest category with tie-break priority:
 * execution_rollback -> verification_grounding -> critical_thinking -> data_governance
 */
export function identifyWeakestArea(categoryScores: CategoryScores): QuestionCategory {
  let weakest: QuestionCategory = CATEGORY_PRIORITY[0];
  let minScore = categoryScores[weakest];

  for (const cat of CATEGORY_PRIORITY) {
    if (categoryScores[cat] < minScore) {
      minScore = categoryScores[cat];
      weakest = cat;
    }
  }
  return weakest;
}

/**
 * Identifies the strongest category with tie-break priority:
 * execution_rollback -> verification_grounding -> critical_thinking -> data_governance
 */
export function identifyStrongestArea(categoryScores: CategoryScores): QuestionCategory {
  let strongest: QuestionCategory = CATEGORY_PRIORITY[0];
  let maxScore = categoryScores[strongest];

  for (const cat of CATEGORY_PRIORITY) {
    if (categoryScores[cat] > maxScore) {
      maxScore = categoryScores[cat];
      strongest = cat;
    }
  }
  return strongest;
}

/**
 * Pure function: calculates scores across the 4 core diagnosis pillars using Method B.
 * Supports both signatures: (questions, answers) and (answers, questions).
 */
export function calculateCategoryScores(
  questions: Question[],
  answers: Record<number, number>
): ScoreCalculationResult;
export function calculateCategoryScores(
  answers: Record<number, number>,
  questions: Question[]
): ScoreCalculationResult;
export function calculateCategoryScores(
  arg1: Question[] | Record<number, number>,
  arg2: Question[] | Record<number, number>
): ScoreCalculationResult {
  const questions: Question[] = Array.isArray(arg1) ? arg1 : (arg2 as Question[]);
  const answers: Record<number, number> = Array.isArray(arg1)
    ? (arg2 as Record<number, number>)
    : (arg1 as Record<number, number>);

  const categoryStats: Record<QuestionCategory, { correct: number; total: number }> = {
    execution_rollback: { correct: 0, total: 0 },
    verification_grounding: { correct: 0, total: 0 },
    critical_thinking: { correct: 0, total: 0 },
    data_governance: { correct: 0, total: 0 },
  };

  let totalCorrect = 0;
  const totalQuestions = questions.length;

  for (const q of questions) {
    if (categoryStats[q.category]) {
      categoryStats[q.category].total += 1;
      const userAnswer = answers[q.id];
      if (userAnswer !== undefined && userAnswer === q.answer_index) {
        categoryStats[q.category].correct += 1;
        totalCorrect += 1;
      }
    }
  }

  const computePercent = (cat: QuestionCategory): number => {
    const { correct, total } = categoryStats[cat];
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  const categoryScores: CategoryScores = {
    execution_rollback: computePercent("execution_rollback"),
    verification_grounding: computePercent("verification_grounding"),
    critical_thinking: computePercent("critical_thinking"),
    data_governance: computePercent("data_governance"),
  };

  const weakestCategory = identifyWeakestArea(categoryScores);
  const strongestCategory = identifyStrongestArea(categoryScores);
  const overallScore = calculateOverallScore(categoryScores);
  const { level: calculatedLevel, tierTitle: defaultTierTitle, stageName, tierDescription } =
    calculateLevelAndTier(overallScore);

  return {
    categoryScores,
    totalCorrect,
    totalQuestions,
    accuracyPercent: overallScore,
    overallScore,
    calculatedLevel,
    defaultTierTitle,
    stageName,
    tierDescription,
    weakestCategory,
    strongestCategory,
  };
}

// Alias for PRD / Task 5 specification alignment
export const calculateDiagnosis = calculateCategoryScores;

