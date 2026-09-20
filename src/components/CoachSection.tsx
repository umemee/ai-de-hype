"use client";

import { useState } from "react";
import { QuestionCategory } from "@/types/diagnosis";
import { CATEGORY_NAMES } from "@/lib/scoring";
import { CoachResponse, CitedSource } from "@/lib/coachFallback";
import {
  Send,
  ExternalLink,
  Info,
  Shield,
  RotateCcw,
  Sparkle,
  Compass,
  FileCode,
  ArrowRight,
} from "lucide-react";

interface CoachSectionProps {
  userLevel?: number | null;
  weakAxis?: QuestionCategory | null;
  onExploreTools?: () => void;
  onStartQuiz?: () => void;
}

const QUICK_PROMPTS = [
  "기획서 작성 시 AI 슬롭(미사여구) 줄이는 법",
  "대용량 엑셀/데이터 환각 없이 검증하기",
  "무료 로컬 LLM 환경 안전하게 구축하기",
  "Git 없이 코드 작업하다 망했을 때 복구 루틴",
];

function renderInlineFormat(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="font-mono text-xs px-1.5 py-0.5 rounded-sm bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function renderMarkdownContent(content: string) {
  const lines = content.split("\n");
  return lines.map((line, idx) => {
    if (line.startsWith("### ")) {
      return (
        <h3
          key={idx}
          className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-4 mb-2 pb-1 border-b border-zinc-200 dark:border-zinc-800"
        >
          {line.replace("### ", "")}
        </h3>
      );
    }
    if (line.startsWith("#### ")) {
      return (
        <h4
          key={idx}
          className="text-sm sm:text-base font-semibold text-zinc-800 dark:text-zinc-200 mt-3 mb-1"
        >
          {line.replace("#### ", "")}
        </h4>
      );
    }
    if (/^\s*(\d+\.|\-|\*)\s+/.test(line)) {
      const formatted = line.replace(/^\s*(\d+\.|\-|\*)\s+/, "");
      return (
        <div
          key={idx}
          className="flex items-start gap-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 ml-2 my-1 leading-relaxed"
        >
          <span className="font-mono text-zinc-400 dark:text-zinc-500 mt-0.5 select-none">•</span>
          <div className="flex-1">{renderInlineFormat(formatted)}</div>
        </div>
      );
    }
    if (!line.trim()) {
      return <div key={idx} className="h-2" />;
    }
    return (
      <p
        key={idx}
        className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed my-1 font-sans"
      >
        {renderInlineFormat(line)}
      </p>
    );
  });
}

export function CoachSection({
  userLevel = null,
  weakAxis = null,
  onExploreTools,
  onStartQuiz,
}: CoachSectionProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CoachResponse | null>(null);

  const weakAxisLabel = weakAxis ? CATEGORY_NAMES[weakAxis] : null;

  const handleAsk = async (userPrompt: string) => {
    const trimmed = userPrompt.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setQuery(trimmed);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_query: trimmed,
          user_level: userLevel,
          weak_axis: weakAxis,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = (await res.json()) as CoachResponse;
      setResponse(data);
    } catch (err) {
      console.error("[CoachSection] Request failed:", err);
      // Fallback response for offline / edge cases
      setResponse({
        in_scope: true,
        answer:
          "네트워크 연결 문제로 실시간 분석이 일시 지연되었습니다. 상단 추천 칩을 클릭하시거나 잠시 후 다시 시도해 주십시오.",
        cited_sources: [],
        fallback_used: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setQuery(promptText);
    handleAsk(promptText);
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
      {/* 1. Header Section */}
      <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono text-zinc-600 dark:text-zinc-400">
          <Compass className="w-3.5 h-3.5 text-zinc-500" />
          <span>실시간 1차 소스 코칭</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          AI 실무 활용법 & 엔지니어링 코치
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans max-w-2xl leading-relaxed">
          과장 마케팅과 알맹이 없는 AI 슬롭을 걷어내고, 빅테크 1차 공식 문서와 검증된 오픈소스를 기준으로 지금 바로 적용할 수 있는 현실적 가이드를 드립니다.
        </p>

        {/* Level / Weakness Personalization Banner */}
        {userLevel && weakAxisLabel ? (
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/70 text-xs font-mono text-zinc-800 dark:text-zinc-200">
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                [Lv.{userLevel} 기준 맞춤 코칭]
              </span>
              <span className="text-zinc-400">·</span>
              <span>취약 축: {weakAxisLabel}</span>
            </div>
          </div>
        ) : onStartQuiz ? (
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span>진단 없이도 코칭을 이용할 수 있습니다.</span>
              <button
                type="button"
                onClick={onStartQuiz}
                className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline font-mono font-medium cursor-pointer"
              >
                <span>3분 맞춤 진단 먼저 받기</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* 2. Quick Prompt Chips (Zero Empty State) */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
          실무 다빈도 질문 예시 (클릭 시 즉시 답변)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {QUICK_PROMPTS.map((promptText, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleQuickPrompt(promptText)}
              className="p-3 rounded-md text-left text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-between gap-2 cursor-pointer shadow-xs"
            >
              <span className="line-clamp-1">{promptText}</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* 3. Input Query Box */}
      <div className="p-4 sm:p-5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
        <label
          htmlFor="coach-query-input"
          className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 block"
        >
          해결하고 싶은 실무 상황이나 질문을 입력하세요
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="coach-query-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAsk(query);
              }
            }}
            placeholder="예: 엑셀 결측치 때문에 AI 연산이 자꾸 왜곡되는데 어떻게 전처리하나요?"
            className="flex-1 px-3.5 py-2.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 font-sans"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => handleAsk(query)}
            disabled={loading || !query.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 font-mono"
          >
            {loading ? (
              <span>분석 중...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>질문하기</span>
              </>
            )}
          </button>
        </div>
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-2">
          <span>* 엄선된 6종 오픈소스 및 8대 공식 엔지니어링 가이드라인을 근거로 답변합니다.</span>
        </div>
      </div>

      {/* 4. Loading State Skeleton */}
      {loading && (
        <div className="p-6 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 animate-pulse">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
            <Compass className="w-4 h-4 animate-spin text-zinc-400" />
            <span>1차 소스 및 공식 엔지니어링 가이드라인 대조 중...</span>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-sm w-3/4" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-sm w-full" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-sm w-5/6" />
          </div>
        </div>
      )}

      {/* 5. Response Output Area */}
      {!loading && response && (
        <div className="p-6 sm:p-7 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-5 animate-in fade-in duration-300">
          {/* Status Banners */}
          {response.fallback_used && (
            <div className="p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>실시간 분석 지연으로 인해 검증된 기본 가이드라인을 표시합니다.</span>
            </div>
          )}

          {/* Out of Scope Notice */}
          {!response.in_scope ? (
            <div className="p-5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                <Info className="w-4 h-4 text-zinc-500" />
                <span>서비스 범위 외 질문 안내</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                {response.answer}
              </p>
            </div>
          ) : (
            <>
              {/* Answer Content */}
              <div className="space-y-2">
                {renderMarkdownContent(response.answer)}
              </div>

              {/* Cited Sources Tag Chips */}
              {response.cited_sources && response.cited_sources.length > 0 && (
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
                  <div className="text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>참고한 1차 공식 소스 및 도구 레퍼런스</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {response.cited_sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url || "#"}
                        target={source.url ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-xs font-mono text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors cursor-pointer"
                      >
                        <span>{source.title}</span>
                        {source.url && (
                          <ExternalLink className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
