"use client";

import { useState } from "react";
import { Tool } from "@/types/diagnosis";
import { ToolCard } from "@/components/ToolCard";

interface ToolsPreviewProps {
  tools: Tool[];
}

type TabType = "all" | "automation" | "study" | "office";

const TABS: { id: TabType; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "automation", label: "트랙 A. 1인 빌더" },
  { id: "study", label: "트랙 B. 연구·글쓰기" },
  { id: "office", label: "트랙 C. 실무 관리자" },
];

export function ToolsPreview({ tools }: ToolsPreviewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const filteredTools =
    activeTab === "all"
      ? tools
      : tools.filter((tool) => tool.target_track === activeTab);

  const getTabCount = (tabId: TabType) => {
    if (tabId === "all") return tools.length;
    return tools.filter((tool) => tool.target_track === tabId).length;
  };

  return (
    <section
      id="tools-section"
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono text-zinc-600 dark:text-zinc-400">
            <span>오픈소스 실습 도감</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            내 수준에 맞춰 골라 쓰는 실습 도감
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans max-w-xl leading-relaxed">
            SNS 과장 광고와 유료 결제 유도 없이, 공식 문서가 검증된 대표 오픈소스를 사용 시나리오와 함께 탐색하세요.
          </p>
        </div>

        <div className="text-xs text-zinc-500 dark:text-zinc-500 font-mono shrink-0">
          총 <span className="font-bold text-zinc-900 dark:text-zinc-200">{filteredTools.length}</span>개 수록
        </div>
      </div>

      {/* Solid Segment Tab Filter (Flat AGENT_RULES Style) */}
      <div className="flex justify-start">
        <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 rounded-md p-1 flex items-center gap-1 overflow-x-auto max-w-full">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = getTabCount(tab.id);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold border border-zinc-300 dark:border-zinc-700 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
                }`}
              >
                <span>{tab.label}</span>
                <span className="font-mono text-[10px] px-1 py-0.2 rounded-xs bg-zinc-200 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-800">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column Spec Card Showcase (Solid Zinc Surface) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTools.map((tool, idx) => {
          const isLastOdd = idx === filteredTools.length - 1 && filteredTools.length % 2 === 1;
          return (
            <ToolCard
              key={tool.id}
              tool={tool}
              isWide={isLastOdd}
              variant="surface"
            />
          );
        })}
      </div>
    </section>
  );
}

