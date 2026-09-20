"use client";

import { ArrowRight, BookOpen, CheckCircle2, RotateCcw } from "lucide-react";

interface IntroSectionProps {
  onStartQuiz: () => void;
  onExploreTools: () => void;
  hasDiagnosisResult?: boolean;
  onGoToResult?: () => void;
}

export function IntroSection({
  onStartQuiz,
  onExploreTools,
  hasDiagnosisResult = false,
  onGoToResult,
}: IntroSectionProps) {
  return (
    <section className="w-full bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pt-16 sm:pb-20 space-y-10">
        {/* Top Eyebrow Badge & Headline */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono text-zinc-600 dark:text-zinc-400">
            <span>3분 실무 AI 역량 진단</span>
          </div>

          <h1 className="tracking-tight break-keep">
            <span className="block font-sans font-medium text-zinc-600 dark:text-zinc-400 text-xl sm:text-2xl md:text-3xl">
              어디서부터 시작할지 막막했던 AI,
            </span>
            <span className="block mt-1 sm:mt-2 font-sans font-extrabold text-zinc-900 dark:text-zinc-100 text-3xl sm:text-5xl md:text-6xl tracking-tight">
              내 수준에 꼭 맞춘 학습 나침반
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-400 font-normal leading-relaxed max-w-xl font-sans pt-1">
            복잡한 이론이나 유료 강의 대신, 3분 자가 진단으로 현재 나의 위치를 확인하세요.
            학생부터 실무자까지 오늘 바로 시작할 수 있는 0원 오픈소스 실습 경로를 안내합니다.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          {hasDiagnosisResult && onGoToResult ? (
            <>
              {/* Primary: View existing result */}
              <button
                type="button"
                onClick={onGoToResult}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-sm font-semibold transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>내 진단 결과 다시 보기</span>
                <ArrowRight className="w-4 h-4 text-white dark:text-zinc-900" />
              </button>

              {/* Retake diagnosis */}
              <button
                type="button"
                onClick={onStartQuiz}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-300 text-sm font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <span>새로 진단하기</span>
              </button>
            </>
          ) : (
            /* Main CTA */
            <button
              type="button"
              onClick={onStartQuiz}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-sm font-semibold transition-colors cursor-pointer"
            >
              <span>내 맞춤 학습 경로 진단하기 (3분)</span>
              <ArrowRight className="w-4 h-4 text-white dark:text-zinc-900" />
            </button>
          )}

          {/* Sub Action: Explore Tools */}
          <button
            type="button"
            onClick={onExploreTools}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-300 text-sm font-medium transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <span>0원 오픈소스 실습 도감 보기</span>
          </button>
        </div>

        {/* 4 Core Diagnosis Domains */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-3.5">
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="font-semibold text-zinc-800 dark:text-zinc-300">4대 핵심 역량 축</span>
            <span className="font-mono text-zinc-500 dark:text-zinc-500">20개 레벨 체계</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
            {/* Pillar 01: Execution & Rollback (Emphasized Foundation Pillar) */}
            <div className="md:col-span-7 p-5 rounded-md bg-white dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-2xl font-black text-zinc-900 dark:text-zinc-100">
                    01
                  </span>
                  <span className="px-2 py-0.5 rounded-sm border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono font-medium text-zinc-800 dark:text-zinc-200">
                    기반 역량 · 필수
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-500">
                  안전벨트
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  실행 및 복구 통제 (Execution & Rollback)
                </h2>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                  코드가 꼬이거나 충돌해도 1초 만에 정상 시점으로 되돌리는 <span className="font-semibold text-zinc-900 dark:text-zinc-100">Git 체크포인트 롤백</span>과, 예기치 않은 무한 루프 호출 과금 폭탄을 원천 차단하는 <span className="font-semibold text-zinc-900 dark:text-zinc-100">API 비용 상한선(Hard Limit) 설정</span>을 다룹니다. 실패의 공포 없이 자유롭게 실습하기 위한 제1 전제 역량입니다.
                </p>
              </div>
            </div>

            {/* Pillar 02: Verification & Grounding */}
            <div className="md:col-span-5 p-5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-bold text-zinc-400 dark:text-zinc-600">
                  02
                </span>
                <span className="px-2 py-0.5 rounded-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                  출처 검증
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  출처 및 수치 검증
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                  AI가 지어낸 가짜 논문명, DOI, 법조문 환각을 <span className="font-medium text-zinc-800 dark:text-zinc-200">공인 1차 학술 DB 및 공식 문서로 교차 대조</span>하고, 대용량 엑셀 결측치로 인한 통계 왜곡을 사전에 차단합니다.
                </p>
              </div>
            </div>

            {/* Pillar 03: Critical Thinking & Anti-Slop */}
            <div className="md:col-span-5 p-5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-bold text-zinc-400 dark:text-zinc-600">
                  03
                </span>
                <span className="px-2 py-0.5 rounded-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                  안티 슬롭
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  비판적 사고 & 안티 슬롭
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                  알맹이 없는 AI 미사여구를 필터링하고 정량적 제약 조건을 강제합니다. 생각을 통째로 외주화하여 <span className="font-medium text-zinc-800 dark:text-zinc-200">남는 지식이 0이 되는 지식 결손(Net-zero)</span>을 방지합니다.
                </p>
              </div>
            </div>

            {/* Pillar 04: Data Governance & Safety */}
            <div className="md:col-span-7 p-5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-bold text-zinc-400 dark:text-zinc-600">
                  04
                </span>
                <span className="px-2 py-0.5 rounded-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                  사내 거버넌스
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  데이터 거버넌스 & 안전
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                  폐기된 구규정과의 충돌을 방지하는 <span className="font-medium text-zinc-800 dark:text-zinc-200">시계열 버전 분리 RAG</span>를 구축하고, 고객 민감 정보 비식별화(Masking)와 외부 AI 학습을 차단하는 <span className="font-medium text-zinc-800 dark:text-zinc-200">ZDR(Zero Data Retention) 보안</span>을 다룹니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reassuring Checklist */}
        <div className="pt-5 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            회원가입 없이 즉시 시작
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            진단 데이터 수집 및 저장 제로
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            100% 무료 오픈소스 실습 가이드
          </span>
        </div>
      </div>
    </section>
  );
}

