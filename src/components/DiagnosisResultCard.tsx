"use client";

import { useState, useEffect } from "react";
import { DiagnosisResult, Tool, QuestionCategory } from "@/types/diagnosis";
import { CATEGORY_NAMES } from "@/lib/scoring";
import {
  RotateCcw,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Award,
  ShieldCheck,
  BookmarkCheck,
  ArrowRight,
} from "lucide-react";
import { ToolCard } from "@/components/ToolCard";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface DiagnosisResultCardProps {
  diagnosis: DiagnosisResult;
  tools: Tool[];
  onRestart: () => void;
  weakestCategory?: QuestionCategory;
  theme?: "light" | "dark";
  onGoToCoach?: () => void;
}

type TrackType = "automation" | "study" | "office";

const TRACK_TABS: { id: TrackType; label: string; subLabel: string }[] = [
  { id: "automation", label: "트랙 A: 1인 빌더", subLabel: "비전공자 자동화" },
  { id: "study", label: "트랙 B: 연구·글쓰기", subLabel: "팩트체크 및 지식 내재화" },
  { id: "office", label: "트랙 C: 실무 관리자", subLabel: "데이터 세척 및 거버넌스" },
];

export function DiagnosisResultCard({
  diagnosis,
  tools,
  onRestart,
  weakestCategory = "execution_rollback",
  theme: propTheme,
  onGoToCoach,
}: DiagnosisResultCardProps) {
  // Determine initial active track from recommended curriculum if valid, else default to automation
  const initialTrack: TrackType =
    diagnosis.recommended_curriculum.track === "study" ||
    diagnosis.recommended_curriculum.track === "office" ||
    diagnosis.recommended_curriculum.track === "automation"
      ? (diagnosis.recommended_curriculum.track as TrackType)
      : "automation";

  const [activeTrack, setActiveTrack] = useState<TrackType>(initialTrack);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [displayedLevel, setDisplayedLevel] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(propTheme || "dark");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time theme synchronization (prop-driven + MutationObserver fallback on html.dark)
  useEffect(() => {
    if (propTheme) {
      setCurrentTheme(propTheme);
      return;
    }
    const checkTheme = () => {
      setCurrentTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [propTheme]);

  // Level count-up micro-animation (0.65s duration, within 0.5~0.8s, MOTION_INTENSITY: 2)
  useEffect(() => {
    const target = diagnosis.calculated_level;
    const duration = 650;
    const startTime = performance.now();

    const updateLevel = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Quad ease-out: 1 - (1 - progress)^2
      const eased = 1 - Math.pow(1 - progress, 2);
      setDisplayedLevel(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(updateLevel);
      }
    };

    const animId = requestAnimationFrame(updateLevel);
    return () => cancelAnimationFrame(animId);
  }, [diagnosis.calculated_level]);

  // Filter tools matching current track
  const filteredTools = tools.filter((tool) => tool.target_track === activeTrack);

  // Overall score: arithmetic average of 4 categories
  const scores = diagnosis.category_scores;
  const overallScore = Math.round(
    (scores.execution_rollback +
      scores.verification_grounding +
      scores.critical_thinking +
      scores.data_governance) /
      4
  );

  const radarData = [
    {
      subject: "01. 실행·복구",
      score: scores.execution_rollback,
      fullMark: 100,
    },
    {
      subject: "02. 출처·검증",
      score: scores.verification_grounding,
      fullMark: 100,
    },
    {
      subject: "03. 안티슬롭",
      score: scores.critical_thinking,
      fullMark: 100,
    },
    {
      subject: "04. 거버넌스",
      score: scores.data_governance,
      fullMark: 100,
    },
  ];

  const handleCopyText = async () => {
    const summaryText = `[AI De-Hype 실무 통제 진단서]
- 진단 레벨: ${diagnosis.tier_title}
- 종합 점수: ${overallScore}점 / 100점
- 4대 핵심 역량 스탯:
  * 실행 및 복구 통제: ${scores.execution_rollback}%
  * 출처 및 수치 검증: ${scores.verification_grounding}%
  * 안티 슬롭 & 사고력: ${scores.critical_thinking}%
  * 사내 보안 & 거버넌스: ${scores.data_governance}%
- AI 아키텍트 심층 소견:
  ${diagnosis.clinical_summary}
- 현실적 주의사항 (과장 광고 대비):
  ${diagnosis.caution_warning}
- 추천 0원 실습 경로:
  [${diagnosis.recommended_curriculum.title}] ${diagnosis.recommended_curriculum.action_item}
  (${diagnosis.recommended_curriculum.guide_url})`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = summaryText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statPillars: {
    key: QuestionCategory;
    title: string;
    index: string;
    score: number;
  }[] = [
    {
      key: "execution_rollback",
      title: "실행 및 복구 통제",
      index: "01",
      score: scores.execution_rollback,
    },
    {
      key: "verification_grounding",
      title: "출처 및 수치 검증",
      index: "02",
      score: scores.verification_grounding,
    },
    {
      key: "critical_thinking",
      title: "안티 슬롭 & 사고력",
      index: "03",
      score: scores.critical_thinking,
    },
    {
      key: "data_governance",
      title: "사내 보안 & 거버넌스",
      index: "04",
      score: scores.data_governance,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6 animate-in fade-in duration-300">
      {/* 1. Top Tier Header Card */}
      <div className="p-6 sm:p-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm border border-emerald-300 dark:border-emerald-600/30 bg-emerald-50 dark:bg-zinc-950 text-xs font-mono text-emerald-800 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>공식 문서 기준 맞춤 진단서</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-mono tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">종합 점수</span>
            <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              {overallScore}
            </span>
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-500">/ 100점</span>
          </div>
        </div>

        {/* Level & Tier Display */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/80 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
              <Award className="w-4 h-4 text-zinc-800 dark:text-zinc-200 shrink-0" />
              <span>LEVEL {displayedLevel}</span>
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-500 font-mono">/ 20</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            {diagnosis.tier_title}
          </h1>
          <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans pt-1">
            {diagnosis.clinical_summary}
          </p>
        </div>

        {/* Realistic Advice Box (Amber Accent Line) */}
        <div className="p-4 sm:p-5 rounded-r-md border border-amber-200 dark:border-zinc-800 border-l-2 border-l-amber-600 bg-amber-50 dark:bg-zinc-950 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-800 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
            <span>실무 현실적 조언</span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed font-sans">
            {diagnosis.caution_warning}
          </p>
        </div>
      </div>

      {/* 2. Visual Stat Matrix (4-Axis Radar Chart + Growth Pillars) */}
      <div className="p-6 sm:p-7 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              4대 핵심 역량 매트릭스
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              4축 다이아몬드 스탯으로 균형도를 확인하고, 취약 축을 보완해 레벨업하세요
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-500 self-start sm:self-auto">
            4축 100점 척도
          </span>
        </div>

        {/* 2-Column: 4-Axis Polygon Radar Chart + Detailed Score Bars */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: 4-Axis Polygon Radar Chart */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-3 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <div className="w-full h-64 sm:h-72">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    key={currentTheme}
                    cx="50%"
                    cy="50%"
                    outerRadius="65%"
                    data={radarData}
                  >
                    <PolarGrid
                      gridType="polygon"
                      stroke={currentTheme === "dark" ? "#27272a" : "#e4e4e7"}
                    />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{
                        fill: currentTheme === "dark" ? "#a1a1aa" : "#52525b",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                    <PolarRadiusAxis
                      angle={45}
                      domain={[0, 100]}
                      tick={false}
                      axisLine={false}
                    />
                    <Radar
                      name="역량 스탯"
                      dataKey="score"
                      stroke={currentTheme === "dark" ? "#10b981" : "#059669"}
                      fill={currentTheme === "dark" ? "#10b981" : "#059669"}
                      fillOpacity={0.25}
                      strokeWidth={1.5}
                      dot={{
                        r: 3,
                        fill: currentTheme === "dark" ? "#09090b" : "#ffffff",
                        stroke: currentTheme === "dark" ? "#10b981" : "#059669",
                        strokeWidth: 1.5,
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400 font-mono">
                  차트 렌더링 중...
                </div>
              )}
            </div>
            <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-500 pt-1">
              <span>스탯 다이아몬드 면적이 넓을수록 실무 자립도 상승</span>
            </div>
          </div>

          {/* Right: 4 Detailed Stat Bars with Next-Level Target */}
          <div className="md:col-span-7 space-y-3">
            {statPillars.map((pillar) => {
              const isWeakest = pillar.key === weakestCategory;
              return (
                <div
                  key={pillar.key}
                  className={`p-3.5 rounded-md border transition-colors ${
                    isWeakest
                      ? "border-amber-300 dark:border-amber-600/40 border-l-2 border-l-amber-600 bg-amber-50/60 dark:bg-zinc-950"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-400 dark:text-zinc-500">
                        {pillar.index}
                      </span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {pillar.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isWeakest && (
                        <span className="px-1.5 py-0.5 rounded-sm border border-amber-300 dark:border-amber-600/40 bg-amber-100 dark:bg-zinc-900 text-amber-800 dark:text-amber-400 text-[11px] font-mono font-medium">
                          집중 보완 필요
                        </span>
                      )}
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {pillar.score}%
                      </span>
                    </div>
                  </div>

                  {/* Flat progress bar */}
                  <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-none overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ease-out ${
                        isWeakest
                          ? "bg-amber-600 dark:bg-amber-500"
                          : "bg-emerald-600 dark:bg-emerald-500"
                      }`}
                      style={{ width: `${pillar.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Recommended 0-Cost Action Item */}
      {diagnosis.recommended_curriculum && (
        <div className="p-6 rounded-r-md border border-emerald-200 dark:border-zinc-800 border-l-2 border-l-emerald-600 bg-emerald-50 dark:bg-zinc-950 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400">
            <BookmarkCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>오늘 바로 시작하는 0원 맞춤 액션 아이템</span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {diagnosis.recommended_curriculum.title}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-300 mt-1 font-sans">
              {diagnosis.recommended_curriculum.action_item}
            </p>
          </div>
          {diagnosis.recommended_curriculum.guide_url && (
            <div className="pt-1">
              <a
                href={diagnosis.recommended_curriculum.guide_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline cursor-pointer"
              >
                <span>공식 가이드 및 실습 쿡북 열기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* 4. Multi-Track Tabs & Reference Library */}
      <div className="p-6 sm:p-7 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              실습 도구 레퍼런스
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            상시 열람 가능한 개인화된 오픈소스 도구와 현실적 사용 시나리오입니다.
          </p>
        </div>

        {/* 3-Track Tab Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          {TRACK_TABS.map((tab) => {
            const isActive = activeTrack === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTrack(tab.id)}
                className={`p-3 rounded-md text-left transition-all border cursor-pointer ${
                  isActive
                    ? "border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium shadow-xs"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <div className="text-xs font-bold">{tab.label}</div>
                <div
                  className={`text-[11px] mt-0.5 ${
                    isActive ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-500 dark:text-zinc-500"
                  }`}
                >
                  {tab.subLabel}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tools List for Active Track */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              variant="subtle"
            />
          ))}
        </div>
      </div>

      {/* 5. Bottom Action Bar */}
      <div className="p-4 sm:p-5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {onGoToCoach && (
            <button
              type="button"
              onClick={onGoToCoach}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>AI 코치에게 맞춤 질문하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyText}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
              copied
                ? "border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400"
                : "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>진단 결과 복사 완료</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>진단 결과 텍스트 복사</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          <span>다시 진단하기</span>
        </button>
      </div>
    </div>
  );
}
