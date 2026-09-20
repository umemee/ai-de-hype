import rawQuestions from "./questions.json";
import rawTools from "./tools.json";
import type { Question, Tool } from "@/types/diagnosis";

// Compile-time and runtime type assertion / validation
export const questions = rawQuestions as Question[];
export const tools = rawTools as Tool[];

// Schema integrity checker
export function validateDataSchema(): {
  questionsValid: boolean;
  toolsValid: boolean;
  questionCount: number;
  toolCount: number;
} {
  const isQuestion = (q: unknown): q is Question => {
    if (typeof q !== "object" || q === null) return false;
    const item = q as Record<string, unknown>;
    return (
      typeof item.id === "number" &&
      typeof item.category === "string" &&
      ["execution_rollback", "verification_grounding", "critical_thinking", "data_governance"].includes(item.category) &&
      typeof item.tier_level === "number" &&
      typeof item.scenario === "string" &&
      typeof item.question === "string" &&
      Array.isArray(item.options) &&
      item.options.length === 4 &&
      item.options.every((opt) => typeof opt === "string") &&
      typeof item.answer_index === "number" &&
      item.answer_index >= 0 &&
      item.answer_index < 4 &&
      typeof item.explanation === "string" &&
      typeof item.source_reference === "string" &&
      item.source_reference.trim().length > 0
    );
  };

  const isTool = (t: unknown): t is Tool => {
    if (typeof t !== "object" || t === null) return false;
    const item = t as Record<string, unknown>;
    return (
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.category === "string" &&
      typeof item.target_track === "string" &&
      ["office", "study", "automation"].includes(item.target_track) &&
      typeof item.required_specs === "string" &&
      typeof item.setup_time === "string" &&
      typeof item.hype_vs_reality === "string" &&
      typeof item.link === "string" &&
      Array.isArray(item.verified_by) &&
      item.verified_by.length >= 2
    );
  };

  const questionsValid = questions.every(isQuestion);
  const toolsValid = tools.every(isTool);

  return {
    questionsValid,
    toolsValid,
    questionCount: questions.length,
    toolCount: tools.length,
  };
}
