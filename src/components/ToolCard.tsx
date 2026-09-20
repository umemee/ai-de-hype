"use client";

import { Tool } from "@/types/diagnosis";
import { ExternalLink, HardDrive, Clock, AlertTriangle, Info, Shield } from "lucide-react";

// 트랙별 단색 라벨 매핑 (다색 배지 배제)
export const TRACK_LABELS: Record<string, string> = {
  automation: "트랙 A · 1인 빌더",
  study: "트랙 B · 연구·글쓰기",
  office: "트랙 C · 실무 관리자",
};

// 운영상 치명적인 물리/인프라 제약(16GB+ RAM 요구, 상시 백그라운드 프록시 서버, Docker 온프레미스 인프라 구축, GPU 부재 시 레이턴시 급락)이 있는 핵심 도구에만 앰버 경고 박스 적용
export const CRITICAL_CONSTRAINT_TOOLS = new Set([
  "continue",   // 로컬 모델 구동 시 16GB+ RAM 필수 (사양 미달 시 PC 프리징/크래시 위험)
  "litellm",    // 백그라운드 상시 서버 프로세스 유지 필수 (프로세스 종료 시 연결된 모든 API 라우팅 차단)
  "dify",       // 사내 자체 호스팅 시 Docker 환경 및 최소 8GB RAM 필수 (컨테이너 오케스트레이션 관리 난이도)
  "open-webui", // GPU 부재 시 대형 모델 극심한 레이턴시 및 CPU 과부하 병목
]);

// 도구별 1줄 실무 사용 시나리오 (언제 필요한가)
export const TOOL_SCENARIOS: Record<string, string> = {
  "git-github": "AI 코딩 도중 코드가 망가지거나 충돌했을 때, 클릭 한 번으로 직전 정상 버전 즉각 복구",
  "semantic-scholar": "AI가 제시한 출처가 가짜(환각)인지 3초 만에 2억 건 학술 DB로 DOI 실존 여부 교차 검증",
  "google-sheets-apps-script": "유료 솔루션 없이 무료 구글 시트에서 수백 행 텍스트 요약과 결측치 정제 자동화",
  "google-ai-studio": "과금 걱정 없이 프롬프트 제약 조건과 정형화된 JSON 출력 제어를 사전 테스트",
  "obsidian": "AI 요약본을 로컬에 보관하고 지식을 시각적으로 연결해 지식 휘발(Net-zero) 방지",
  "openrefine": "대용량 엑셀 데이터의 오탈자·중복·결측치를 AI 투입 전에 무료로 일괄 정제",
  "continue": "VS Code 내에서 무료 API 및 로컬 모델 기반 인라인 AI 코딩 어시스턴트 활용",
  "litellm": "100개 이상의 LLM 비용 상한선(Hard Limit) 및 호출 속도(Rate Limit) 중앙 제어 프록시",
  "zotero": "공인 서지 관리 및 논문 원문 자동 수집을 통한 AI 가짜 인용 환각 교차 검증",
  "dify": "사내 규정 및 매뉴얼 문서를 결합한 노코드 드래그앤드롭 RAG 워크플로우 구축",
  "open-webui": "사내 기밀 유출 제로의 완전 격리된 로컬 전용 ChatGPT급 사설 챗 인터페이스",
};

// 숫자 및 단위 토큰만 font-mono로 부분 분리 렌더링하는 헬퍼
export function renderMonoSpecs(text: string) {
  const parts = text.split(/(\d+(?:\.\d+)?(?:GB\+?|GB|MB|B|분|초|시간|개|행|건)?)/g);
  return parts.map((part, i) => {
    if (/^\d+(?:\.\d+)?(?:GB\+?|GB|MB|B|분|초|시간|개|행|건)?$/.test(part)) {
      return (
        <span key={i} className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
          {part}
        </span>
      );
    }
    return part;
  });
}

interface ToolCardProps {
  tool: Tool;
  isWide?: boolean;
  variant?: "surface" | "subtle";
  className?: string;
}

export function ToolCard({
  tool,
  isWide = false,
  variant = "surface",
  className = "",
}: ToolCardProps) {
  const trackLabel = TRACK_LABELS[tool.target_track] || tool.target_track;
  const isCritical = CRITICAL_CONSTRAINT_TOOLS.has(tool.id);

  // Surface: white card on zinc background (ToolsPreview)
  // Subtle: zinc card on white container (DiagnosisResultCard)
  const isSubtle = variant === "subtle";
  const cardBg = isSubtle
    ? "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700";

  const innerBoxBg = isSubtle
    ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
    : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800";

  const badgeBg = isSubtle
    ? "bg-white dark:bg-zinc-900"
    : "bg-zinc-100 dark:bg-zinc-950";

  if (isWide) {
    return (
      <div
        className={`md:col-span-2 p-5 rounded-md border transition-colors ${cardBg} ${className}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Left Column */}
          <div className="md:col-span-6 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-sm border border-zinc-200 dark:border-zinc-800 ${badgeBg} text-[11px] font-mono text-zinc-700 dark:text-zinc-400`}>
                  {trackLabel}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-500 font-mono">{tool.category}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {tool.verified_by && tool.verified_by.length >= 2 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/60 dark:bg-zinc-950 text-[10px] font-mono text-emerald-800 dark:text-emerald-400">
                    <Shield className="w-2.5 h-2.5" />
                    <span>검증 완료</span>
                  </span>
                )}
                {tool.id === "open-webui" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border border-emerald-300 dark:border-emerald-600/40 bg-emerald-50 dark:bg-zinc-950 text-[10px] font-mono text-emerald-800 dark:text-emerald-400">
                    <Shield className="w-3 h-3" />
                    <span>사내 보안 권장</span>
                  </span>
                )}
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {tool.name}
            </h3>

            {/* 1줄 사용 시나리오 */}
            <div className={`p-3 rounded-md border space-y-1 ${innerBoxBg}`}>
              <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500">
                사용 시나리오
              </div>
              <p className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-300 leading-snug">
                {TOOL_SCENARIOS[tool.id] || tool.category}
              </p>
            </div>

            {/* Hardware Specs & Setup Time */}
            <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start gap-2">
                <HardDrive className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  권장 사양: {renderMonoSpecs(tool.required_specs)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                <span>
                  설치 소요: {renderMonoSpecs(tool.setup_time)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-6 flex flex-col justify-between h-full space-y-3.5">
            {isCritical ? (
              <div className="p-4 rounded-r-md border-l-2 border-l-amber-600 bg-amber-50 dark:bg-zinc-950 border border-amber-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-800 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                  <span>실무 현실적 조언</span>
                </div>
                <p className="text-xs text-zinc-800 dark:text-zinc-300 leading-relaxed font-sans">
                  {tool.hype_vs_reality}
                </p>
              </div>
            ) : (
              <div className={`p-4 rounded-md border space-y-1 ${innerBoxBg}`}>
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-zinc-600 dark:text-zinc-400">
                  <Info className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                  <span>실무 활용 팁</span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-400 leading-relaxed font-sans">
                  {tool.hype_vs_reality}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500 dark:text-zinc-500 text-[11px]">무료 오픈소스</span>
              <a
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <span>공식 실습 가이드 열기</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col justify-between p-5 rounded-md border transition-colors space-y-3.5 ${cardBg} ${className}`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-sm border border-zinc-200 dark:border-zinc-800 ${badgeBg} text-[11px] font-mono text-zinc-700 dark:text-zinc-400`}>
              {trackLabel}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-500 font-mono">{tool.category}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {tool.verified_by && tool.verified_by.length >= 2 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/60 dark:bg-zinc-950 text-[10px] font-mono text-emerald-800 dark:text-emerald-400">
                <Shield className="w-2.5 h-2.5" />
                <span>검증 완료</span>
              </span>
            )}
            {tool.id === "open-webui" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border border-emerald-300 dark:border-emerald-600/40 bg-emerald-50 dark:bg-zinc-950 text-[10px] font-mono text-emerald-800 dark:text-emerald-400">
                <Shield className="w-3 h-3" />
                <span>사내 보안 권장</span>
              </span>
            )}
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {tool.name}
        </h3>

        {/* 1줄 사용 시나리오 */}
        <div className={`p-3 rounded-md border space-y-1 ${innerBoxBg}`}>
          <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500">
            사용 시나리오
          </div>
          <p className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-300 leading-snug">
            {TOOL_SCENARIOS[tool.id] || tool.category}
          </p>
        </div>

        {/* Hardware Specs & Setup Time */}
        <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-start gap-2">
            <HardDrive className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              권장 사양: {renderMonoSpecs(tool.required_specs)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <span>
              설치 소요: {renderMonoSpecs(tool.setup_time)}
            </span>
          </div>
        </div>

        {/* Advice Box: Amber for Critical Constraints, Quiet Zinc for Standard Tips */}
        {isCritical ? (
          <div className="p-3.5 rounded-r-md border-l-2 border-l-amber-600 bg-amber-50 dark:bg-zinc-950 border border-amber-200 dark:border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-800 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>실무 현실적 조언</span>
            </div>
            <p className="text-xs text-zinc-800 dark:text-zinc-300 leading-relaxed font-sans">
              {tool.hype_vs_reality}
            </p>
          </div>
        ) : (
          <div className={`p-3.5 rounded-md border space-y-1 ${innerBoxBg}`}>
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-zinc-600 dark:text-zinc-400">
              <Info className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
              <span>실무 활용 팁</span>
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-400 leading-relaxed font-sans">
              {tool.hype_vs_reality}
            </p>
          </div>
        )}
      </div>

      {/* External Link Action */}
      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
        <span className="text-zinc-500 dark:text-zinc-500 text-[11px]">무료 오픈소스</span>
        <a
          href={tool.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <span>공식 실습 가이드 열기</span>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
        </a>
      </div>
    </div>
  );
}
