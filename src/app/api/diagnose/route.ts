import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { generateFallbackDiagnosis } from "@/lib/fallbackDiagnosis";
import { QuestionCategory, CategoryScores } from "@/types/diagnosis";
import { CATEGORY_NAMES } from "@/lib/scoring";

const diagnosisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    calculated_level: {
      type: Type.INTEGER,
      description: "User calculated level between 1 and 20",
    },
    tier_title: {
      type: Type.STRING,
      description: "Tier title e.g. 'Lv. 14 실무 통제자 단계'",
    },
    clinical_summary: {
      type: Type.STRING,
      description:
        "Objective, engineering-grounded 2-3 sentence assessment of user's AI competence without any sycophancy, flattering words, or AI slop. Focus on weakest and strongest areas.",
    },
    category_scores: {
      type: Type.OBJECT,
      properties: {
        execution_rollback: { type: Type.INTEGER },
        verification_grounding: { type: Type.INTEGER },
        critical_thinking: { type: Type.INTEGER },
        data_governance: { type: Type.INTEGER },
      },
      required: [
        "execution_rollback",
        "verification_grounding",
        "critical_thinking",
        "data_governance",
      ],
    },
    caution_warning: {
      type: Type.STRING,
      description:
        "A sharp, practical, real-world engineering caution regarding SNS hype vs actual constraints (hidden token costs, loop runaway, API quotas, citation hallucination, ZDR violation).",
    },
    recommended_curriculum: {
      type: Type.OBJECT,
      properties: {
        track: {
          type: Type.STRING,
          description: "Target track: 'automation', 'study', or 'office'",
        },
        title: {
          type: Type.STRING,
          description: "Clear curriculum title for 0-cost practice",
        },
        action_item: {
          type: Type.STRING,
          description: "Concrete first action item to take today",
        },
        guide_url: {
          type: Type.STRING,
          description: "Official guide or cookbook URL",
        },
      },
      required: ["track", "title", "action_item", "guide_url"],
    },
  },
  required: [
    "calculated_level",
    "tier_title",
    "clinical_summary",
    "category_scores",
    "caution_warning",
    "recommended_curriculum",
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      answers = {},
      categoryScores = {
        execution_rollback: 0,
        verification_grounding: 0,
        critical_thinking: 0,
        data_governance: 0,
      } as CategoryScores,
      calculatedLevel = 1,
      defaultTierTitle = "Lv. 1 블랙박스 의존 단계",
      weakestCategory = "execution_rollback" as QuestionCategory,
      strongestCategory = "execution_rollback" as QuestionCategory,
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn(
        "[/api/diagnose] GEMINI_API_KEY is not configured. Serving high-fidelity fallback diagnosis."
      );
      return NextResponse.json(
        generateFallbackDiagnosis({
          calculatedLevel,
          defaultTierTitle,
          categoryScores,
          weakestCategory,
          strongestCategory,
        })
      );
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const weakestName = CATEGORY_NAMES[weakestCategory as QuestionCategory] || weakestCategory;
      const strongestName = CATEGORY_NAMES[strongestCategory as QuestionCategory] || strongestCategory;

      const systemPrompt = `
You are the AI De-Hype Senior Diagnostics Architect.
Your task is to analyze the user's 20-question AI control diagnostic results and generate an objective, engineering-grounded diagnosis report.

CRITICAL RULES:
1. NO AI SLOP, FLドTTERING, OR EMPTY PRAISE (e.g. 절대 "놀라운 역량을 갖추셨습니다", "대단합니다" 같은 미사여구를 쓰지 마십시오).
2. Use precise Korean engineering language rooted in big-tech primary sources (OpenAI Cookbook, Anthropic Prompt Guide, Google Cloud Architecture, OWASP LLM 10).
3. The response must match the exact JSON schema provided.

USER DIAGNOSTIC DATA:
- Calculated Level: Lv. ${calculatedLevel} / 20
- Tier Title: ${defaultTierTitle}
- Category Scores (0~100):
  * 실행 및 복구 통제 (execution_rollback): ${categoryScores.execution_rollback}%
  * 출처 및 수치 검증 (verification_grounding): ${categoryScores.verification_grounding}%
  * 안티 슬롭 & 사고력 (critical_thinking): ${categoryScores.critical_thinking}%
  * 사내 보안 & 거버넌스 (data_governance): ${categoryScores.data_governance}%
- Weakest Pillar: ${weakestName} (${weakestCategory})
- Strongest Pillar: ${strongestName} (${strongestCategory})

REQUIREMENTS:
1. clinical_summary: 2-3 Korean sentences diagnosing their current capabilities, highlighting their strength in [${strongestName}] while pinpointing the exact operational risk in their weakest pillar [${weakestName}].
2. caution_warning: A sharp 1-2 sentence real-world engineering caution addressing SNS marketing hype vs actual constraints (hidden token consumption, loop runaway, API hard limit, citation hallucination, zero data retention SLA).
3. recommended_curriculum: Recommend a 0-cost, hands-on action item matching their level and weakest pillar. Track must be one of: 'automation', 'study', or 'office'.
`.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: diagnosisResponseSchema,
          temperature: 0.2,
        },
      });

      if (!response.text) {
        throw new Error("Empty response returned from Gemini API");
      }

      const result = JSON.parse(response.text);

      // Ensure category_scores and calculated_level reflect accurate calculated inputs
      result.calculated_level = calculatedLevel;
      result.category_scores = categoryScores;

      return NextResponse.json(result);
    } catch (apiErr) {
      console.error(
        "[/api/diagnose] Gemini API call failed. Serving offline fallback diagnosis:",
        apiErr
      );
      return NextResponse.json(
        generateFallbackDiagnosis({
          calculatedLevel,
          defaultTierTitle,
          categoryScores,
          weakestCategory,
          strongestCategory,
        })
      );
    }
  } catch (err) {
    console.error("[/api/diagnose] Unexpected error:", err);
    return NextResponse.json(
      generateFallbackDiagnosis({
        calculatedLevel: 1,
        categoryScores: {
          execution_rollback: 0,
          verification_grounding: 0,
          critical_thinking: 0,
          data_governance: 0,
        },
        weakestCategory: "execution_rollback",
      })
    );
  }
}
