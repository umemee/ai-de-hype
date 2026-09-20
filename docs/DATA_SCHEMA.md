# DATA SCHEMA SPECIFICATION

## 1. questions.json 규격
총 6~8문항 체제 (4대 핵심 역량 축당 1~2문항, 공식 소스로 검증된 문항만 수록.
이론:실무 시나리오 비율은 축소된 문항 수에 맞춰 축별로 유동적으로 배분)

```json
[
  {
    "id": 1,
    "category": "execution_rollback", // execution_rollback | verification_grounding | critical_thinking | data_governance
    "tier_level": 1, // 1 ~ 3
    "scenario": "상황 설명 문장 (실무 시나리오 또는 이론적 맥락)",
    "question": "핵심 질문 문장",
    "options": [
      "선택지 1",
      "선택지 2",
      "선택지 3",
      "선택지 4"
    ],
    "answer_index": 2, // 0 ~ 3 정수
    "explanation": "정답 해설 및 현실적 실무 조언",
    "term_tooltip": { // 비전공자/4050용 어휘 안전망 (선택 사항)
      "term": "Opt-out",
      "definition": "내 데이터를 AI 학습에 쓰지 말라고 명시적으로 거부하는 설정"
    },
    "source_reference": "OpenAI Official Prompt Engineering Guide (Cookbook)" // 1차 소스 출처 (필수, 값 없는 문항 발행 금지)
  }
]
```

## 2. tools.json 규격
운영자 엄선 대표 오픈소스 5~6종 수록 (진단 없이도 상시 열람 가능한 오픈소스 참고서)

```json
[
  {
    "id": "ollama",
    "name": "Ollama",
    "category": "로컬 LLM",
    "target_track": "automation", // office | study | automation
    "required_specs": "RAM 16GB 이상, 외장 GPU 권장",
    "setup_time": "약 15분",
    "hype_vs_reality": "클라우드 비용 없이 안전하게 로컬 모델을 구동할 수 있으나, 고사양 외장 GPU가 없으면 복잡한 연산 속도가 현저히 저하됩니다.", // 이 도구의 핵심 장점과 실사용 시 알아야 할 현실적 제약(토큰/연동/설정)을 균형 있게 다루는 실무 팁
    "link": "https://ollama.com",
    "verified_by": ["personal_use", "source_transparent", "citation_checked"] // 3개 중 최소 2개 이상 해당해야 발행 가능. 미달 항목은 tools.json에 포함 금지.
  }
]
```

## 3. Gemini API 응답 규격 (/api/diagnose 반환 JSON)
4대 역량 균등 평균 채점 및 20레벨 게이미피케이션 매핑 기준

```json
{
  "calculated_level": 14, // 1 ~ 20 (Lv. 1 ~ Lv. 20)
  "tier_title": "Lv. 14 실무 통제자 단계", // 4구간: 0~39점(블랙박스 의존) | 40~69점(실행 및 탐색) | 70~89점(실무 통제자) | 90~100점(AI 아키텍트)
  "clinical_summary": "실행 및 복구 통제력은 안정적이나, 외부 API 연동 시 비용 상한선 설정 및 데이터 거버넌스 검증 지식이 보완이 필요합니다.",
  "category_scores": { // 4대 핵심 역량 축 (각 0 ~ 100점)
    "execution_rollback": 80,
    "verification_grounding": 60,
    "critical_thinking": 80,
    "data_governance": 40
  },
  "caution_warning": "멀티 AI 라우팅 도구 활용 시 단일 API 대비 토큰 소모량이 1.5배 증가할 수 있으므로 개발자 대시보드에서 월간 예산 상한선(Hard Limit)을 반드시 설정하십시오.", // 실사용 시 꼭 알아둘 현실적 제약 및 실무 조언
  "recommended_curriculum": {
    "track": "office", // office | study | automation
    "title": "LiteLLM + 구글 스프레드시트 0원 업무 자동화",
    "action_item": "API 키 발급 후 시트에서 일괄 요약 파이프라인 구축하기",
    "guide_url": "https://github.com/..."
  }
}
```

## 4. /api/coach 요청/응답 규격

### 요청
```json
{
  "user_query": "지금 하고 싶은 작업을 자유 텍스트로 입력",
  "user_level": 8,           // 진단 완료 시 결과 레벨, 없으면 null
  "weak_axis": "critical_thinking" // 진단 완료 시 최약 축, 없으면 null
}
```

### 응답
```json
{
  "in_scope": true,          // false면 answer 대신 범위 밖 안내 문구 반환
  "answer": "tools.json(6종 도구) 및 8대 빅테크 1차 공식 엔지니어링 가이드라인 소스 안에서만 구성된 실무 설명",
  "cited_sources": [
    { "id": "git-github", "title": "Git & GitHub 로컬 롤백 가이드", "url": "https://desktop.github.com" }
  ],
  "fallback_used": false     // Gemini 호출 실패/rate limit 시 true, 이때 answer는 정적 안내문
}
```

### 구현 시 반드시 지킬 제약
- 답변 컨텍스트는 `tools.json`(6종 도구 메타데이터)뿐만 아니라, `questions.json` 출제 근거인 '8대 빅테크 1차 공식 엔지니어링 가이드라인(Git 롤백, API Hard Limit, 학술 DB 교차검증, 결측치 정제, 정량 제약/WBS, 넷제로 러닝 방지, RAG 버전 분리, NIST ZDR/보안)'까지 유기적으로 포함한다.
- 서비스 범위(`in_scope: true`)의 기준은 AI 도구 활용, 업무 자동화, 프롬프트 엔지니어링, 실무 개발/작업 워크플로우에 대한 실무적 질문으로 유연하게 적용하며, 완전히 무관한 일상 잡담(연예인, 요리 레시피 등)이나 악의적 질문에 대해서만 `in_scope: false`로 응답한다.
- 시스템 프롬프트에 주입된 소스 및 엔지니어링 원칙 밖의 미검증 정보나 과장된 마케팅 조언은 추측하지 않고 실무적 제약(비용, 롤백, 환각 검증)을 함께 설명한다.
- Gemini 429(Rate limit), 타임아웃 등 호출 실패 시 반드시 `fallback_used: true` + 정적 안내 문구와 추천 도구 목록으로 응답할 것. 에러를 사용자에게 그대로 노출하지 말 것.