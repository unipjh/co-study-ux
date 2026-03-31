/**
 * ExperienceInsights
 * Claude Code가 experiences 컬렉션 6개 데이터를 직접 분석한 결과.
 * 분석 기준일: 2026-03-26
 */

const INSIGHTS = [
  {
    field: 'action',
    label: 'Action',
    sublabel: '어떻게 공부했나',
    color: '#4a7c6f',
    bg: '#f0f7f5',
    border: '#c8e0da',
    keywords: [
      { text: '요약·번역 요청', count: 4, note: '6명 중 4명 — 가장 흔한 사용 패턴' },
      { text: '맥락·목적 명시 프롬프트', count: 2, note: '"비판적 사고 함양하도록" 등 목적을 프롬프트에 담음' },
      { text: '반복 시도·개선', count: 1, note: '원하는 결과까지 프롬프트를 계속 수정' },
      { text: 'AI로 AI 배우기', count: 1, note: '다른 AI에게 프롬프트 작성법을 물어봄 (메타 학습)' },
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
      { text: '목적 명시 → 성적 향상', count: 2, note: 'B+ → A+, 영어 수업 고득점' },
      { text: '단순 요약 → 핵심 파악 미흡', count: 2, note: '시험에서 요구하는 추상화 수준에 못 미침' },
      { text: '부분 성공·어색함 공존', count: 2, note: '결과물이 나오긴 하나 퀄리티 편차 있음' },
      { text: '언어 장벽 극복에 효과적', count: 1, note: '영어 교안을 한국어로 재구성 → 이해도·효율 동시 향상' },
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
      { text: '프롬프트 목적 명확성이 성패 결정', count: 3, note: '같은 "요약" 요청도 목적이 있으면 결과가 다름' },
      { text: '학습의 틀 먼저, AI는 그 안에서', count: 2, note: '영상·교안 등 기존 틀에 AI를 맞춰 활용할 때 효과적' },
      { text: 'AI는 선택지, 결정은 인간', count: 2, note: '표현 다양성 제시 → 최종 선택은 사용자 몫' },
      { text: '단순 요약의 함정', count: 2, note: '핵심 개념 추상화 없이 이해한 것처럼 착각하게 만듦' },
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
            6개 경험 기반 · Claude Code 분석
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#c0bbb4' }}>2026-03-26</span>
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
