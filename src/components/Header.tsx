"use client";

import { Compass, Shield, Type, Sun, Moon } from "lucide-react";

interface HeaderProps {
  fontSizeMode: "normal" | "large";
  onToggleFontSize: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onGoHome?: () => void;
  isFocusMode?: boolean;
  activeTab?: "home" | "quiz" | "tools" | "result" | "coach";
  onSelectTab?: (tab: "home" | "quiz" | "tools" | "result" | "coach") => void;
  hasDiagnosisResult?: boolean;
}

export function Header({
  fontSizeMode,
  onToggleFontSize,
  theme,
  onToggleTheme,
  onGoHome,
  isFocusMode = false,
  activeTab = "home",
  onSelectTab,
  hasDiagnosisResult = false,
}: HeaderProps) {
  return (
    <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left cursor-pointer group transition-opacity hover:opacity-90"
          title="처음 화면으로 이동"
        >
          <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors">
            <Compass className="w-4 h-4 text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-white">
                AI De-Hype
              </span>
              <span className="px-2 py-0.5 rounded-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-[10px] font-mono tracking-wider text-zinc-600 dark:text-zinc-400 uppercase">
                0원 실습 로드맵
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans hidden sm:block">
              나에게 꼭 맞는 AI 역량 진단 & 학습 로드맵
            </p>
          </div>
        </button>

        {/* Right Controls: Safe Badge & Toggles */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {isFocusMode ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-[11px] font-mono text-zinc-700 dark:text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>진단 집중 모드</span>
            </div>
          ) : (
            <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
              <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>회원가입 없음 · 100% 무료</span>
            </div>
          )}

          {/* Theme Toggle Button (Light/Dark) */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center justify-center p-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300 cursor-pointer"
            aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
            title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5 text-zinc-300 hover:text-zinc-100" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-zinc-700 hover:text-zinc-900" />
            )}
          </button>

          {/* Font Size Toggle Button */}
          <button
            type="button"
            onClick={onToggleFontSize}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer"
            aria-label="글자 크기 변경"
            title="4050 세대 및 모바일 가독성을 위한 글자 크기 전환"
          >
            <Type className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span className="text-zinc-500 font-mono">글자:</span>
            <span
              className={
                fontSizeMode === "normal"
                  ? "font-bold text-zinc-900 dark:text-white"
                  : "text-zinc-500"
              }
            >
              보통
            </span>
            <span className="text-zinc-400 dark:text-zinc-600">/</span>
            <span
              className={
                fontSizeMode === "large"
                  ? "font-bold text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-500"
              }
            >
              크게
            </span>
          </button>
        </div>
      </div>

      {/* Global Tab Navigation Bar (Suppressed during focus mode) */}
      {!isFocusMode && onSelectTab && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80">
          <nav className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center gap-1.5 py-1.5 overflow-x-auto" aria-label="메인 네비게이션">
            {/* Tab 1: Home */}
            <button
              type="button"
              onClick={() => onSelectTab("home")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0 border ${
                activeTab === "home"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold border-zinc-300 dark:border-zinc-700"
                  : "bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-900"
              }`}
            >
              홈
            </button>

            {/* Tab 2: Diagnosis / Diagnosis Result */}
            <button
              type="button"
              onClick={() => onSelectTab(hasDiagnosisResult ? "result" : "quiz")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                activeTab === "quiz" || activeTab === "result"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold border-zinc-300 dark:border-zinc-700"
                  : "bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-900"
              }`}
            >
              {hasDiagnosisResult && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              )}
              <span>{hasDiagnosisResult ? "진단 결과" : "진단하기"}</span>
              {hasDiagnosisResult && (
                <span className="text-[10px] font-mono px-1 py-0.2 rounded-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  완료
                </span>
              )}
            </button>

            {/* Tab 3: Open Source Tools Library */}
            <button
              type="button"
              onClick={() => onSelectTab("tools")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                activeTab === "tools"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold border-zinc-300 dark:border-zinc-700"
                  : "bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-900"
              }`}
            >
              <span>오픈소스 도감</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-zinc-200 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-800">
                11종
              </span>
            </button>

            {/* Tab 4: AI Coach */}
            <button
              type="button"
              onClick={() => onSelectTab("coach")}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                activeTab === "coach"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold border-zinc-300 dark:border-zinc-700"
                  : "bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-900"
              }`}
            >
              <span>AI 코치</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
