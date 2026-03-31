import { useState, useEffect } from 'react'
import { STAGES, ACCENT } from './constants/stageConfig'

const STATUS_ICON = {
  pending: <span style={{ color: '#c4bfb8', fontSize: '12px' }}>○</span>,
  running: <span style={{ color: ACCENT, fontSize: '12px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>,
  done:    <span style={{ color: ACCENT, fontSize: '12px' }}>●</span>,
  error:   <span style={{ color: '#ef4444', fontSize: '12px' }}>✕</span>,
}

function ElapsedTimer({ startedAt }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  return <span>{elapsed}s 경과 중…</span>
}

function StageTiming({ s }) {
  if (s.status === 'pending') return <span style={{ color: '#c4bfb8' }}>-</span>
  if (s.status === 'running' && s.startedAt) return (
    <span style={{ color: ACCENT }}><ElapsedTimer startedAt={s.startedAt} /></span>
  )
  if ((s.status === 'done' || s.status === 'error') && s.startedAt && s.doneAt) {
    const sec = ((s.doneAt - s.startedAt) / 1000).toFixed(1)
    return <span style={{ color: '#6b6860' }}>{sec}s</span>
  }
  return null
}

export default function StagePanel({ stages, activeStage, selectedStage, onSelect }) {
  const [showTiming, setShowTiming] = useState(false)

  return (
    <div style={{
      width: '220px',
      flexShrink: 0,
      borderRight: '1px solid rgba(0,0,0,0.07)',
      overflowY: 'auto',
      padding: '12px 0',
    }}>
      {/* 타이밍 토글 */}
      <div style={{ padding: '0 16px 8px', borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: '4px' }}>
        <button
          onClick={() => setShowTiming((v) => !v)}
          style={{
            fontSize: '11px',
            padding: '3px 8px',
            borderRadius: '4px',
            border: `1px solid ${showTiming ? ACCENT : 'rgba(0,0,0,0.12)'}`,
            background: showTiming ? `rgba(160,120,64,0.08)` : 'transparent',
            color: showTiming ? ACCENT : '#9a9490',
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          ⏱ 시간 보기
        </button>
      </div>

      {STAGES.map((stage) => {
        const s = stages[stage.id] || { status: 'pending', summary: null }
        const isSelected = selectedStage === stage.id
        const isClickable = s.status === 'done'

        return (
          <div
            key={stage.id}
            onClick={() => isClickable && onSelect(stage.id)}
            style={{
              padding: '12px 16px',
              cursor: isClickable ? 'pointer' : 'default',
              background: isSelected ? `rgba(160,120,64,0.07)` : 'transparent',
              borderLeft: `3px solid ${isSelected ? ACCENT : 'transparent'}`,
              transition: 'background 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{
                fontSize: '13px',
                fontWeight: isSelected ? 600 : 500,
                color: isSelected ? ACCENT : '#1a1916',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {stage.label}
              </span>
              {STATUS_ICON[s.status] || STATUS_ICON.pending}
            </div>
            <div style={{ fontSize: '11px', color: '#9a9490', lineHeight: '1.4' }}>
              {s.summary || stage.desc}
            </div>
            {showTiming && (
              <div style={{ fontSize: '11px', marginTop: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                <StageTiming s={s} />
              </div>
            )}
          </div>
        )
      })}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
