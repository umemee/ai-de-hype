"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface DiagnosisLoadingProps {
  onComplete?: () => void;
  durationMs?: number;
}

const STAGES = [
  {
    step: "1/3",
    label: "제출하신 20개 실무 판단 응답을 분석하고 있습니다...",
    detail: "입력된 20개 실무 판단 응답의 일관성 및 위험 지수를 대조하고 있습니다.",
  },
  {
    step: "2/3",
    label: "4대 핵심 역량(실행 복구·출처 검증·안티 슬롭·거버넌스)을 평가하는 중입니다...",
    detail: "카테고리별 정답률과 취약 지점을 분리하여 세부 역량 점수를 집계합니다.",
  },
  {
    step: "3/3",
    label: "회원님의 레벨에 꼭 맞는 0원 실습 경로와 추천 도구를 매칭하고 있습니다...",
    detail: "과장 광고 위험도를 필터링하고 내 수준에 꼭 맞는 0원 실습 커리큘럼을 매칭합니다.",
  },
];

export function DiagnosisLoading({ onComplete, durationMs = 2500 }: DiagnosisLoadingProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    // Exact timing: 0.0~0.8s (Stage 1), 0.8~1.6s (Stage 2), 1.6~2.5s (Stage 3)
    const timerStage2 = setTimeout(() => {
      setCurrentStageIndex(1);
    }, 800);

    const timerStage3 = setTimeout(() => {
      setCurrentStageIndex(2);
    }, 1600);

    const timerComplete = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, durationMs);

    return () => {
      clearTimeout(timerStage2);
      clearTimeout(timerStage3);
      clearTimeout(timerComplete);
    };
  }, [durationMs, onComplete]);

  const currentStage = STAGES[currentStageIndex];

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-6"
    >
      {/* Top Status Announcement Card */}
      <div className="p-5 sm:p-6 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-xs font-mono text-zinc-700 dark:text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>공식 엔지니어링 가이드라인 기준 진단</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
            <span>
              진행 단계 <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{currentStage.step}</span>
            </span>
          </div>
        </div>

        {/* Smooth Opacity Transition without Scale/Bounce */}
        <div
          key={currentStageIndex}
          className="space-y-1.5 pt-1 animate-in fade-in duration-200 transition-opacity ease-in-out"
        >
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug">
            {currentStage.label}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
            {currentStage.detail}
          </p>
        </div>

        {/* Diagnostic Stage Progress Track */}
        <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-none overflow-hidden">
          <div
            className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300 ease-out"
            style={{ width: `${((currentStageIndex + 1) / STAGES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Monotone Skeleton Structure */}
      <div className="p-5 sm:p-6 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6">
        {/* Tier & Header Skeleton */}
        <div className="space-y-3 pb-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="h-5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-sm animate-pulse" />
            <div className="h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-sm animate-pulse" />
          </div>
          <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-sm animate-pulse" />
          <div className="h-4 w-full max-w-lg bg-zinc-200/80 dark:bg-zinc-800/80 rounded-sm animate-pulse" />
        </div>

        {/* 4 Diagnostic Pillars Score Rows Skeleton */}
        <div className="space-y-3.5 pt-1">
          <div className="text-xs font-mono tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">
            4대 핵심 역량 분석 진행 중
          </div>

          <div className="space-y-2.5">
            {[
              "실행 및 복구 통제",
              "출처 및 수치 검증",
              "안티 슬롭 & 사고력",
              "사내 보안 & 거버넌스",
            ].map((pillar, idx) => (
              <div
                key={idx}
                className="p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 sm:w-44 shrink-0">
                  <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                    0{idx + 1}
                  </span>
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {pillar}
                  </span>
                </div>

                <div className="flex-1 w-full flex items-center gap-3">
                  <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-none overflow-hidden">
                    <div
                      className="h-full bg-zinc-400 dark:bg-zinc-700 animate-pulse"
                      style={{ width: `${(idx + 1) * 22}%` }}
                    />
                  </div>
                  <div className="w-10 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded-sm animate-pulse shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Summary & Action Plan Card Skeleton */}
        <div className="p-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-2.5">
          <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded-sm animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-full bg-zinc-200/70 dark:bg-zinc-800/70 rounded-sm animate-pulse" />
            <div className="h-3.5 w-5/6 bg-zinc-200/70 dark:bg-zinc-800/70 rounded-sm animate-pulse" />
            <div className="h-3.5 w-3/4 bg-zinc-200/70 dark:bg-zinc-800/70 rounded-sm animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
