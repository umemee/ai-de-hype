import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import {
  generateCoachFallback,
  CoachRequest,
  CoachResponse,
  PRIMARY_SOURCES,
} from "@/lib/coachFallback";

const coachResponseSchema = {
  type: Type.OBJECT,
  properties: {
    in_scope: {
      type: Type.BOOLEAN,
      description:
        "True if the query is a practical question about AI tools, automation, prompt engineering, coding, data validation, or workflow. False only for completely unrelated casual chat, recipes, celebrity gossip, etc.",
    },
    answer: {
      type: Type.STRING,
      description:
        "Structured, practical, anti-slop Korean markdown explanation based strictly on the injected tools and 8 official engineering guidelines. Free of AI slop, flattering words, or empty praise.",
    },
    cited_sources: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          url: { type: Type.STRING },
        },
        required: ["id", "title"],
      },
      description: "List of tools or official engineering guideline sources cited in the explanation.",
    },
  },
  required: ["in_scope", "answer", "cited_sources"],
};

export async function POST(request: NextRequest) {
  let body: CoachRequest = { user_query: "" };

  try {
    body = (await request.json()) as CoachRequest;
  } catch {
    return NextResponse.json(generateCoachFallback({ user_query: "" }), { status: 200 });
  }

  const { user_query, user_level, weak_axis } = body;

  if (!user_query || user_query.trim().length === 0) {
    return NextResponse.json(generateCoachFallback(body), { status: 200 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn(
      "[/api/coach] GEMINI_API_KEY is not configured. Serving zero-cost static fallback coaching."
    );
    return NextResponse.json(generateCoachFallback(body), { status: 200 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `
당신은 'AI De-Hype 수석 엔지니어 코치'입니다.
SNS 과장 마케팅과 알맹이 없는 AI 슬롭(AI Slop)을 배제하고 실무적 진실과 1차 출처만을 전달합니다.

[핵심 행동 원칙]
1. 당신은 오직 검증된 1차 소스(엄선된 오픈소스 도구 6종 + 8대 빅테크 공식 엔지니어링 가이드라인)를 바탕으로 객관적이고 현실적인 가이드를 제공합니다.
2. 미사여구, 아첨, 공허한 칭찬(예: "좋은 질문입니다", "놀라운 시도입니다")을 절대 쓰지 마십시오. 바로 핵심 결론과 구체적 절차로 들어가십시오.
3. 서비스 범위(in_scope: true): AI 도구 활용, 업무 자동화, 프롬프트 엔지니어링, 실무 개발/작업 워크플로우에 대한 질문은 유연하게 수용하여 실질적인 해결 절차와 현실적 제약(비용, 롤백, 환각 검증)을 함께 안내하십시오.
4. 서비스 범위 밖(in_scope: false): 완전히 무관한 일상 잡담(연예인 가십, 요리 레시피, 스포츠 경기 등)이나 악의적 질문에 대해서만 in_scope: false로 처리하고 중립 톤으로 안내하십시오.
5. 답변 끝에는 반드시 참고한 소스의 id와 title, url을 cited_sources 배열에 포함하십시오.
6. 사용자의 진단 데이터(user_level: ${user_level ?? "미진단"}, weak_axis: ${weak_axis ?? "없음"})가 주어지면 해당 취약 영역을 보완할 수 있는 실무 팁을 자연스럽게 반영하십시오.

[1차 공식 소스 데이터베이스]
- git-github: Git & GitHub 로컬 롤백 가이드 (https://desktop.github.com) - 코드 충돌 시 직전 정상 시점으로 즉각 복구
- continue: Continue VS Code AI 어시스턴트 (https://continue.dev) - 인라인 코드 생성 및 로컬 LLM 연결 (RAM 16GB+ 필수)
- semantic-scholar: Semantic Scholar & DOI Resolver (https://www.semanticscholar.org) - 2억 건 학술 DB로 AI 가짜 논문/DOI 실존 교차 검증
- obsidian: Obsidian 로컬 지식 내재화 노트 (https://obsidian.md) - AI 요약본의 로컬 지식 구조화로 넷제로 러닝 방지
- google-sheets-apps-script: 구글 스프레드시트 + 무료 API 연동 (https://workspace.google.com/products/sheets/) - 0원으로 수백 행 텍스트 정제 및 요약 자동화
- open-webui: Open WebUI (https://openwebui.com) - 사내 기밀 유출 제로의 완전 격리된 로컬 전용 ChatGPT급 사설 챗 (GPU 부재 시 레이턴시 제약)

[8대 공식 엔지니어링 가이드라인]
- git_rollback: Git 공식 롤백 가이드라인 (Pro Git) - 에러 시 폴더 삭제 대신 diff 확인 및 체크포인트 롤백
- api_hard_limit: OpenAI 플랫폼 가이드 - 무한 루프 과금 방지를 위한 월간 Usage Hard Limit 및 재시도 제한
- academic_citation_check: doi.org 및 학술 DB - 가짜 논문/저자 환각 1차 원문 대조 검증
- tabular_missing_values: OpenRefine & Google Data Quality - 표 병합 셀과 결측치 전처리 및 계산식 원본 셀 역추적
- anti_slop_constraints: Anthropic Claude Prompt Guide - [정량 수치], [예산 상한 테이블], [WBS 일정표] 등 명시적 제약 강제
- net_zero_learning_prevention: The New SDLC With Vibe Coding - AI 산출물을 덮고 자기 언어로 재구성하는 지식 내재화 루틴
- rag_version_metadata: Google Cloud RAG Architecture - 최신성 충돌 방지를 위한 문서 개정일자/버전 메타데이터 필터링
- data_governance_zdr: NIST AI RMF 1.0 & OpenAI Enterprise - 프롬프트 주의문 대신 민감 식별자 마스킹 및 Zero Data Retention(Opt-out) 계약 환경 검증

[사용자 질문]
${user_query}
`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: coachResponseSchema,
        temperature: 0.2,
      },
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini API");
    }

    const parsed = JSON.parse(response.text) as CoachResponse;

    // Validate and enhance cited sources URLs if missing
    const enhancedSources = (parsed.cited_sources || []).map((source) => {
      if (!source.url && PRIMARY_SOURCES[source.id]?.url) {
        return {
          ...source,
          url: PRIMARY_SOURCES[source.id].url,
        };
      }
      return source;
    });

    return NextResponse.json(
      {
        in_scope: Boolean(parsed.in_scope),
        answer: parsed.answer,
        cited_sources: enhancedSources,
        fallback_used: false,
      },
      { status: 200 }
    );
  } catch (apiErr) {
    console.error(
      "[/api/coach] Gemini API call failed or rate limited. Serving robust fallback coaching:",
      apiErr
    );
    return NextResponse.json(generateCoachFallback(body), { status: 200 });
  }
}
