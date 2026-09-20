"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { IntroSection } from "@/components/IntroSection";
import { ToolsPreview } from "@/components/ToolsPreview";
import { QuizWizard } from "@/components/QuizWizard";
import { DiagnosisLoading } from "@/components/DiagnosisLoading";
import { questions, tools } from "@/data";
import { calculateDiagnosis, ScoreCalculationResult } from "@/lib/scoring";
import { generateFallbackDiagnosis } from "@/lib/fallbackDiagnosis";
import { DiagnosisResult } from "@/types/diagnosis";
import { DiagnosisResultCard } from "@/components/DiagnosisResultCard";
import { CoachSection } from "@/components/CoachSection";
import { ArrowUp, Compass } from "lucide-react";

type ViewMode = "home" | "quiz" | "loading" | "result" | "tools" | "coach";

export default function Home() {
  const [fontSizeMode, setFontSizeMode] = useState<"normal" | "large">("normal");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [currentView, setCurrentView] = useState<ViewMode>("home");
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [scoreResult, setScoreResult] = useState<ScoreCalculationResult | null>(null);
  const [diagnosisData, setDiagnosisData] = useState<DiagnosisResult | null>(null);

  // Synchronize html[data-font-size] attribute for seamless rem scaling across all devices
  useEffect(() => {
    document.documentElement.setAttribute("data-font-size", fontSizeMode);
  }, [fontSizeMode]);

  // Synchronize theme state with DOM on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  // Synchronize with URL hash on mount & hash change
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "tools") {
        setCurrentView("tools");
      } else if (hash === "coach") {
        setCurrentView("coach");
      } else if (hash === "quiz") {
        setCurrentView("quiz");
      } else if (hash === "result") {
        if (diagnosisData) {
          setCurrentView("result");
        } else {
          setCurrentView("home");
        }
      } else if (hash === "home") {
        setCurrentView("home");
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [diagnosisData]);

  const handleToggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleToggleFontSize = () => {
    setFontSizeMode((prev) => (prev === "normal" ? "large" : "normal"));
  };

  const handleStartQuiz = () => {
    if (diagnosisData) {
      const confirmRestart = window.confirm(
        "새로운 진단을 시작하시겠습니까? 기존 진단 결과는 초기화됩니다."
      );
      if (!confirmRestart) return;
      setUserAnswers({});
      setScoreResult(null);
      setDiagnosisData(null);
    }
    setCurrentView("quiz");
    window.history.replaceState(null, "", "#quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectTab = (tab: "home" | "quiz" | "tools" | "result" | "coach") => {
    if (currentView === "quiz") {
      const confirmLeave = window.confirm(
        "진단을 중단하시겠습니까? 진행 중인 답변이 초기화됩니다."
      );
      if (!confirmLeave) return;
      setUserAnswers({});
    }

    if (tab === "quiz") {
      handleStartQuiz();
      return;
    }

    if (tab === "result") {
      if (diagnosisData) {
        setCurrentView("result");
        window.history.replaceState(null, "", "#result");
      } else {
        handleStartQuiz();
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setCurrentView(tab);
    window.history.replaceState(null, "", `#${tab}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuizComplete = async (answers: Record<number, number>) => {
    setUserAnswers(answers);
    const result = calculateDiagnosis(questions, answers);
    setScoreResult(result);
    setCurrentView("loading");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Parallel execution: minimum 2.5s calm loading transition + Gemini API diagnosis fetch
    const minLoadingPromise = new Promise((resolve) => setTimeout(resolve, 2500));

    const apiPromise = fetch("/api/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers,
        categoryScores: result.categoryScores,
        calculatedLevel: result.calculatedLevel,
        defaultTierTitle: result.defaultTierTitle,
        weakestCategory: result.weakestCategory,
        strongestCategory: result.strongestCategory,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as DiagnosisResult;
      })
      .catch((err) => {
        console.warn("[page] API call failed or offline, using fallback diagnosis:", err);
        return generateFallbackDiagnosis({
          calculatedLevel: result.calculatedLevel,
          defaultTierTitle: result.defaultTierTitle,
          categoryScores: result.categoryScores,
          weakestCategory: result.weakestCategory,
          strongestCategory: result.strongestCategory,
        });
      });

    try {
      const [_, diagnosis] = await Promise.all([minLoadingPromise, apiPromise]);
      setDiagnosisData(diagnosis);
      setCurrentView("result");
      window.history.replaceState(null, "", "#result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error("[page] Unexpected diagnosis error:", e);
      const fallback = generateFallbackDiagnosis({
        calculatedLevel: result.calculatedLevel,
        defaultTierTitle: result.defaultTierTitle,
        categoryScores: result.categoryScores,
        weakestCategory: result.weakestCategory,
        strongestCategory: result.strongestCategory,
      });
      setDiagnosisData(fallback);
      setCurrentView("result");
      window.history.replaceState(null, "", "#result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleRestartQuiz = () => {
    const confirmRestart = window.confirm(
      "진단을 처음부터 다시 시작하시겠습니까? 기존 진단 결과는 초기화됩니다."
    );
    if (!confirmRestart) return;
    setUserAnswers({});
    setScoreResult(null);
    setDiagnosisData(null);
    setCurrentView("quiz");
    window.history.replaceState(null, "", "#quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuizCancel = () => {
    setUserAnswers({});
    setScoreResult(null);
    setDiagnosisData(null);
    setCurrentView("home");
    window.history.replaceState(null, "", "#home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoHome = () => {
    if (currentView === "quiz") {
      const confirmLeave = window.confirm("진단을 중단하고 처음 화면으로 돌아가시겠습니까?");
      if (!confirmLeave) return;
      setUserAnswers({});
    }
    if (currentView === "result") {
      setCurrentView("home");
      window.history.replaceState(null, "", "#home");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    handleQuizCancel();
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isFocusMode = currentView === "quiz" || currentView === "loading";

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-zinc-900 dark:selection:text-white font-sans relative">
      {/* Top Header with accessibility toggle & home navigation */}
      <Header
        fontSizeMode={fontSizeMode}
        onToggleFontSize={handleToggleFontSize}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onGoHome={handleGoHome}
        isFocusMode={isFocusMode}
        activeTab={
          currentView === "result"
            ? "result"
            : currentView === "quiz"
            ? "quiz"
            : currentView === "tools"
            ? "tools"
            : currentView === "coach"
            ? "coach"
            : "home"
        }
        onSelectTab={handleSelectTab}
        hasDiagnosisResult={Boolean(diagnosisData)}
      />

      {/* Main Content Area - Strictly Isolated Views */}
      <main className={`flex-1 ${isFocusMode ? "flex flex-col justify-center" : "pb-16"}`}>
        {currentView === "home" && (
          <IntroSection
            onStartQuiz={handleStartQuiz}
            onExploreTools={() => handleSelectTab("tools")}
            hasDiagnosisResult={Boolean(diagnosisData)}
            onGoToResult={() => handleSelectTab("result")}
          />
        )}

        {currentView === "tools" && (
          <div className="py-2">
            <ToolsPreview tools={tools} />
          </div>
        )}

        {currentView === "coach" && (
          <CoachSection
            userLevel={diagnosisData?.calculated_level}
            weakAxis={scoreResult?.weakestCategory}
            onStartQuiz={handleStartQuiz}
            onExploreTools={() => handleSelectTab("tools")}
          />
        )}

        {currentView === "quiz" && (
          <QuizWizard
            questions={questions}
            onComplete={handleQuizComplete}
            onCancel={handleQuizCancel}
          />
        )}

        {currentView === "loading" && <DiagnosisLoading />}

        {currentView === "result" && diagnosisData && (
          <DiagnosisResultCard
            diagnosis={diagnosisData}
            tools={tools}
            onRestart={handleRestartQuiz}
            weakestCategory={scoreResult?.weakestCategory}
            theme={theme}
            onGoToCoach={() => handleSelectTab("coach")}
          />
        )}
      </main>

      {/* Solid Zinc Edu-tech Footer - Rendered in home, tools, coach, and result views */}
      {(currentView === "home" ||
        currentView === "tools" ||
        currentView === "coach" ||
        currentView === "result") && (
        <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                AI De-Hype
              </span>
              <span className="text-zinc-400 dark:text-zinc-600">·</span>
              <span>모두를 위한 열린 AI 역량 진단 & 학습 로드맵</span>
            </div>

            <div className="flex items-center gap-4">
              <span>회원가입 없음 · 100% 무료 오픈소스</span>
              <button
                type="button"
                onClick={handleScrollToTop}
                className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <span>맨 위로</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

