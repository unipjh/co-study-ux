/**
 * ExperienceInsights
 * Claude Code가 experiences 컬렉션 22개 데이터를 직접 분석한 결과.
 * 분석 기준일: 2026-04-02
 */

const INSIGHTS = [
  {
    field: 'action',
    label: 'Action',
    sublabel: '어떻게 AI를 사용했나',
    color: '#4a7c6f',
    bg: '#f0f7f5',
    border: '#c8e0da',
    keywords: [
      { text: '자료 요약·번역 요청', count: 6, note: '교안·PPT·영어 강의를 요약하거나 번역 — 22건 중 가장 흔한 진입 패턴' },
      { text: '개념 설명 + 연습문제 반복', count: 5, note: 'AI에게 개념 설명받고 예제·연습문제 풀기를 반복 — 이해 확인까지 세트로' },
      { text: '발표·창작·개발 협업', count: 4, note: '발표 시뮬레이션, PPT 생성, 바이브코딩, 경진대회 모델 개발 등 비학습 영역으로 확장' },
      { text: '검토·검증 보조 도구', count: 2, note: '직접 푼 수식이나 로직 방향성을 AI로 점검 — 풀이보다 확인 용도' },
    ],
  },
  {
    field: 'result',
    label: 'Result',
    sublabel: '어떤 결과가 나왔나',
    color: '#6b5a3a',
    bg: '#fdf8f2',
    border: '#e8d9c0',
    keywords: [
      { text: '목표 달성 / 성적 향상', count: 12, note: 'A+ 획득, 논문 완성도, 발표 자신감 등 — 22건 중 12건(55%)이 긍정적 결과' },
      { text: '부분 성공 + 한계 공존', count: 6, note: '결과물은 나왔으나 퀄리티 편차. 반복 시도 끝에 수용하거나 직접 마무리' },
      { text: 'AI 실패·한계 경험', count: 4, note: '시험 미달, 본선 탈락, 수식 오류 — 단순 수용·단순 요약 패턴에서 집중 발생' },
    ],
  },
  {
    field: 'insight',
    label: 'Insight',
    sublabel: '왜 그랬을 것 같나',
    color: '#4a4080',
    bg: '#f4f2fb',
    border: '#cdc8e8',
    keywords: [
      { text: '프롬프트 목적 명확성이 성패 결정', count: 5, note: '"비판적 사고 함양", "서술형으로 정리" 등 의도를 담으면 결과가 달라짐' },
      { text: 'AI는 보조, 결정·창의성은 인간 몫', count: 4, note: '표현 선택, 로직 구상, 창의적 방향은 사람이 우세 — AI는 실행을 가속화' },
      { text: '이해 없이 수용하면 내 것이 안 됨', count: 3, note: 'AI 답을 그냥 받아들이면 시험에서 기억 안 남 — 능동적 재정리 필수' },
      { text: '기존 학습 틀 위에 AI 얹기', count: 3, note: '강의·교안 먼저, AI는 그 안에서 보조할 때 효과적. 베이스 없이 AI만 쓰면 연결이 안 됨' },
      { text: 'AI의 전문 영역 한계 인식', count: 3, note: '복잡한 수식, 이미지 인식, 고도 전문지식에서 오류 발생 — 완전히 신뢰하기 어려운 영역 있음' },
    ],
  },
]

import { useState } from 'react'

export default function ExperienceInsights() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      marginBottom: '32px',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* 섹션 헤더 */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          padding: '14px 20px',
          background: '#f5f4f1',
          borderBottom: open ? '1px solid rgba(0,0,0,0.08)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1916', letterSpacing: '-0.01em' }}>
            패턴 분석 인사이트
          </span>
          <span style={{ fontSize: '12px', color: '#a8a49e', marginLeft: '8px' }}>
            22개 경험 기반 · Claude Code 분석
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#c0bbb4' }}>2026-04-02</span>
          <span style={{
            fontSize: '12px', color: '#a8a49e',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            display: 'inline-block',
          }}>▼</span>
        </div>
      </div>

      {/* 3개 필드 섹션 */}
      {open && <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 0,
      }}>
        {INSIGHTS.map((section, si) => (
          <div
            key={section.field}
            style={{
              padding: '16px 20px',
              borderRight: si < INSIGHTS.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
              background: 'white',
            }}
          >
            {/* 필드 라벨 */}
            <div style={{ marginBottom: '12px' }}>
              <span style={{
                display: 'inline-block',
                fontSize: '10px', fontWeight: 700,
                color: section.color,
                background: section.bg,
                border: `1px solid ${section.border}`,
                borderRadius: '4px',
                padding: '2px 7px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}>
                {section.label}
              </span>
              <div style={{ fontSize: '11px', color: '#a8a49e' }}>{section.sublabel}</div>
            </div>

            {/* 키워드 목록 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {section.keywords.map((kw) => (
                <div key={kw.text} style={{
                  background: section.bg,
                  border: `1px solid ${section.border}`,
                  borderRadius: '8px',
                  padding: '8px 10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1916' }}>
                      {kw.text}
                    </span>
                    {kw.count >= 2 && (
                      <span style={{
                        fontSize: '10px', fontWeight: 600,
                        color: section.color,
                        background: 'white',
                        border: `1px solid ${section.border}`,
                        borderRadius: '10px',
                        padding: '0px 5px',
                      }}>
                        ×{kw.count}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#7a7670', lineHeight: '1.4' }}>
                    {kw.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>}
    </div>
  )
}
