"use client";

import { useState, useRef } from "react";
import { Question, QuestionCategory } from "@/types/diagnosis";
import { ArrowLeft, HelpCircle, Check, RotateCcw } from "lucide-react";

interface QuizWizardProps {
  questions: Question[];
  onComplete: (answers: Record<number, number>) => void;
  onCancel: () => void;
}

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  execution_rollback: "실행 및 복구 통제",
  verification_grounding: "출처 및 수치 검증",
  critical_thinking: "안티 슬롭 & 사고력",
  data_governance: "사내 보안 & 거버넌스",
};

const TIER_LABELS: Record<number, string> = {
  1: "기초 입문",
  2: "실무 응용",
  3: "심화 이해",
};

export function QuizWizard({ questions, onComplete, onCancel }: QuizWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleSelectOption = (optionIndex: number) => {
    if (isTransitioning) return;

    setSelectedOption(optionIndex);
    setIsTransitioning(true);

    const updatedAnswers = {
      ...userAnswers,
      [currentQuestion.id]: optionIndex,
    };
    setUserAnswers(updatedAnswers);

    // 0.3초 (300ms) 딜레이 후 다음 문항 이동 또는 완료 콜백
    timerRef.current = setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((prev) => prev + 1);
        const nextQuestionId = questions[currentIndex + 1].id;
        setSelectedOption(
          updatedAnswers[nextQuestionId] !== undefined
            ? updatedAnswers[nextQuestionId]
            : null
        );
        setShowTooltip(false);
        setIsTransitioning(false);
      } else {
        setIsTransitioning(false);
        onComplete(updatedAnswers);
      }
    }, 300);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      const prevQuestionId = questions[prevIndex].id;
      setSelectedOption(
        userAnswers[prevQuestionId] !== undefined ? userAnswers[prevQuestionId] : null
      );
      setShowTooltip(false);
      setIsTransitioning(false);
    } else {
      onCancel();
    }
  };

  // 어휘 툴팁 렌더링 헬퍼
  const renderTextWithTooltip = (text: string, tooltip?: { term: string; definition: string }) => {
    if (!tooltip || !text.includes(tooltip.term)) {
      return <span>{text}</span>;
    }

    const parts = text.split(tooltip.term);
    return (
      <span>
        {parts[0]}
        <span className="relative inline-block">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip((prev) => !prev);
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="underline decoration-dotted decoration-emerald-600 dark:decoration-emerald-400 underline-offset-4 cursor-help font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            aria-label={`${tooltip.term} 설명 보기`}
          >
            {tooltip.term}
          </button>
        </span>
        {parts.slice(1).join(tooltip.term)}
      </span>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Unified Worksheet Container (Solid Surface) */}
      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-md overflow-hidden">
        {/* Top Progress Track */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 text-xs mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                {CATEGORY_LABELS[currentQuestion.category] || currentQuestion.category}
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-zinc-600 dark:text-zinc-300">
                문항 <span className="font-bold text-zinc-900 dark:text-zinc-100">{currentIndex + 1}</span> / <span className="text-zinc-500 dark:text-zinc-400">{totalQuestions}</span>
              </span>
              <span className="text-zinc-500 dark:text-zinc-500">({progressPercent}%)</span>
            </div>
          </div>

          {/* Solid Emerald Progress Bar */}
          <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-none overflow-hidden">
            <div
              className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Worksheet Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Situation Context Area (Functional Accent Line) */}
          <div className="relative pl-4 border-l-2 border-emerald-600 dark:border-emerald-500 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-r-md p-4 space-y-2">
            <div className="text-xs font-mono tracking-widest text-zinc-600 dark:text-zinc-400 uppercase">
              실무 사례 및 상황
            </div>
            <p className="text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed font-sans">
              {renderTextWithTooltip(currentQuestion.scenario, currentQuestion.term_tooltip)}
            </p>

            {/* Popover Tooltip Box */}
            {currentQuestion.term_tooltip && showTooltip && (
              <div className="mt-3 p-3.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs shadow-sm">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                  <HelpCircle className="w-4 h-4" />
                  <span>비전공자 어휘 안전망: {currentQuestion.term_tooltip.term}</span>
                </div>
                <p className="leading-relaxed text-zinc-700 dark:text-zinc-300 font-sans">
                  {currentQuestion.term_tooltip.definition}
                </p>
              </div>
            )}

            {/* Touch-friendly accessibility button */}
            {currentQuestion.term_tooltip && !showTooltip && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowTooltip(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>어휘 팁: &apos;{currentQuestion.term_tooltip.term}&apos; 터치하여 쉬운 설명 보기</span>
                </button>
              </div>
            )}
          </div>

          {/* Question Headline */}
          <div className="pt-0.5">
            <div className="text-xs font-mono tracking-widest text-zinc-500 dark:text-zinc-400 mb-1.5">
              생각해볼 질문
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug">
              {renderTextWithTooltip(currentQuestion.question, currentQuestion.term_tooltip)}
            </h2>
          </div>

          {/* 4 Options Grid */}
          <div className="space-y-2.5 pt-0.5">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isTransitioning}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 sm:p-4.5 rounded-md border transition-all duration-150 cursor-pointer flex items-start justify-between gap-3 group ${
                    isSelected
                      ? "border-emerald-600 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-zinc-900 dark:text-zinc-100 font-medium"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <span
                      className={`font-mono text-xs px-2 py-0.5 rounded-sm border shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-600 text-white dark:text-zinc-950 font-bold"
                          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-sm leading-relaxed font-sans text-zinc-800 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-100">
                      {option}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="shrink-0 mt-1 p-1 rounded-sm bg-emerald-600 text-white dark:text-zinc-950">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Worksheet Bottom Actions */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isTransitioning}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{currentIndex === 0 ? "처음 화면으로" : "이전 문항으로"}</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={isTransitioning}
              className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>진단 종료</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
