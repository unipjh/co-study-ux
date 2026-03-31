import { STAGES, ACCENT } from './constants/stageConfig'

const STATUS_COLOR = {
  pending: '#e5e2de',
  running: ACCENT,
  done: ACCENT,
  error: '#ef4444',
}

export default function StageProgressBar({ stages }) {
  return (
    <div style={{ padding: '16px 32px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: '#fafaf9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {STAGES.map((stage, i) => {
          const s = stages[stage.id] || { status: 'pending' }
          const isRunning = s.status === 'running'
          const isDone = s.status === 'done'
          const color = STATUS_COLOR[s.status] || STATUS_COLOR.pending

          return (
            <div key={stage.id} style={{ display: 'flex', alignItems: 'center', flex: i < STAGES.length - 1 ? 1 : 'none' }}>
              {/* 스텝 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isDone ? ACCENT : 'transparent',
                    border: `2px solid ${color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s',
                    animation: isRunning ? 'pulse 1.2s infinite' : 'none',
                    flexShrink: 0,
                  }}
                >
                  {isDone ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: isRunning ? ACCENT : '#d4cfc9',
                    }} />
                  )}
                </div>
                <span style={{
                  fontSize: '10px',
                  color: isDone || isRunning ? ACCENT : '#9a9490',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: isDone || isRunning ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}>
                  {stage.label}
                </span>
              </div>

              {/* 연결선 */}
              {i < STAGES.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  background: isDone ? ACCENT : '#e5e2de',
                  margin: '0 4px',
                  marginBottom: '18px',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(160,120,64,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(160,120,64,0); }
        }
      `}</style>
    </div>
  )
}
