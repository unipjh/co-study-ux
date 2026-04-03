import { useState } from 'react'

function renderInline(text) {
  const parts = text.split('**')
  return parts.map((part, i) => (i % 2 === 0 ? part : <strong key={i}>{part}</strong>))
}

function MarkdownView({ text }) {
  return (
    <div style={{ fontFamily: 'Noto Sans KR, sans-serif', lineHeight: 1.8, color: '#1a1916' }}>
      {text.split('\n').map((line, i) => {
        if (line.startsWith('## '))
          return (
            <h3
              key={i}
              style={{ fontSize: '15px', fontWeight: 700, color: '#1a1916', margin: '24px 0 8px' }}
            >
              {line.slice(3)}
            </h3>
          )
        if (line.startsWith('### '))
          return (
            <h4
              key={i}
              style={{ fontSize: '13px', fontWeight: 600, color: '#6b6860', margin: '16px 0 4px' }}
            >
              {line.slice(4)}
            </h4>
          )
        if (line.startsWith('---'))
          return (
            <hr
              key={i}
              style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.08)', margin: '16px 0' }}
            />
          )
        if (line === '') return <div key={i} style={{ height: '6px' }} />
        if (line.startsWith('- ') || line.startsWith('* '))
          return (
            <div
              key={i}
              style={{ display: 'flex', gap: '8px', marginBottom: '4px', paddingLeft: '4px' }}
            >
              <span style={{ color: '#a07840', flexShrink: 0, fontSize: '14px' }}>•</span>
              <span style={{ fontSize: '14px' }}>{renderInline(line.slice(2))}</span>
            </div>
          )
        return (
          <p key={i} style={{ fontSize: '14px', margin: '0 0 4px' }}>
            {renderInline(line)}
          </p>
        )
      })}
    </div>
  )
}

export default function ServiceAnalysisModal({ observations, onClose }) {
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [report, setReport] = useState('')
  const [errMsg, setErrMsg] = useState('')

  const run = async () => {
    setStatus('loading')
    setReport('')
    setErrMsg('')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observations }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'API 오류')
      setReport(data.report)
      setStatus('done')
    } catch (e) {
      setErrMsg(e.message)
      setStatus('error')
    }
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '16px',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '14px',
          padding: '28px',
          width: '100%',
          maxWidth: '760px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1916', margin: '0 0 4px' }}>
              Service UX 분석 리포트
            </h2>
            <p
              style={{
                fontSize: '12px',
                color: '#a8a49e',
                margin: 0,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              Gemini 2.0 Flash · 관찰 {observations.length}건 ·{' '}
              {observations.reduce(
                (n, o) =>
                  n +
                  (o.onboardingImages?.length || 0) +
                  (o.features || []).reduce((m, f) => m + (f.images?.length || 0), 0),
                0,
              )}
              장 이미지 포함
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '22px',
              color: '#a8a49e',
              cursor: 'pointer',
              lineHeight: 1,
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* 본문 */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {status === 'idle' && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ fontSize: '14px', color: '#6b6860', marginBottom: '8px' }}>
                관찰 데이터 <strong>{observations.length}건</strong>과 스크린샷을 함께 분석합니다.
              </p>
              <p style={{ fontSize: '12px', color: '#a8a49e', marginBottom: '24px' }}>
                분석에 30~60초 정도 소요될 수 있습니다.
              </p>
              <button
                onClick={run}
                style={{
                  padding: '10px 32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#a07840',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                분석 시작
              </button>
            </div>
          )}

          {status === 'loading' && (
            <div
              style={{ textAlign: 'center', padding: '60px 0', color: '#a8a49e', fontSize: '14px' }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #f0ede8',
                  borderTop: '3px solid #a07840',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  animation: 'spin 1s linear infinite',
                }}
              />
              Gemini가 분석 중입니다…
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}

          {status === 'error' && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ color: '#c0392b', fontSize: '14px', marginBottom: '16px' }}>
                분석 실패: {errMsg}
              </p>
              <button
                onClick={run}
                style={{
                  fontSize: '13px',
                  color: '#a07840',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                다시 시도
              </button>
            </div>
          )}

          {status === 'done' && <MarkdownView text={report} />}
        </div>

        {/* 하단 재분석 버튼 */}
        {status === 'done' && (
          <div
            style={{
              borderTop: '1px solid rgba(0,0,0,0.08)',
              paddingTop: '12px',
              textAlign: 'right',
            }}
          >
            <button
              onClick={run}
              style={{
                fontSize: '12px',
                color: '#a07840',
                background: 'none',
                border: '1px solid rgba(160,120,64,0.3)',
                borderRadius: '6px',
                padding: '5px 14px',
                cursor: 'pointer',
              }}
            >
              재분석
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
