import { useState } from 'react'
import { ACCENT } from '../constants/stageConfig'

export default function S3Viewer({ result, s2Result }) {
  const cleaned = result || []
  const [selected, setSelected] = useState(0)
  if (!cleaned.length) return <Empty />

  const item = cleaned[selected]
  const original = s2Result?.find((c) => c.chunk_id === item.chunk_id)

  return (
    <div style={{ display: 'flex', gap: '16px', height: '100%' }}>
      {/* 청크 선택 목록 */}
      <div style={{ width: '200px', flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {cleaned.map((c, i) => (
          <div
            key={c.chunk_id}
            onClick={() => setSelected(i)}
            style={{
              padding: '8px 10px',
              borderRadius: '6px',
              border: `1px solid ${i === selected ? ACCENT : 'rgba(0,0,0,0.08)'}`,
              cursor: 'pointer',
              background: i === selected ? 'rgba(160,120,64,0.05)' : '#fafaf9',
            }}
          >
            <div style={{ fontSize: '11px', color: i === selected ? ACCENT : '#9a9490', fontFamily: 'JetBrains Mono, monospace' }}>
              {c.chunk_id.slice(0, 8)}
            </div>
            <div style={{ fontSize: '12px', color: '#4a4744', marginTop: '2px', lineHeight: '1.3' }}>
              {c.summary}
            </div>
          </div>
        ))}
      </div>

      {/* 좌우 비교 */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', minHeight: 0 }}>
        <div>
          <div style={{ fontSize: '11px', color: '#9a9490', marginBottom: '6px', fontFamily: 'JetBrains Mono, monospace' }}>ORIGINAL</div>
          <div style={{
            border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', padding: '14px',
            overflowY: 'auto', height: 'calc(100% - 24px)',
            fontSize: '12px', lineHeight: '1.7', color: '#6b6860',
            fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
          }}>
            {original?.text || '—'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: ACCENT, marginBottom: '6px', fontFamily: 'JetBrains Mono, monospace' }}>CLEANED</div>
          <div style={{
            border: `1px solid rgba(160,120,64,0.3)`, borderRadius: '8px', padding: '14px',
            overflowY: 'auto', height: 'calc(100% - 24px)',
            fontSize: '12px', lineHeight: '1.7', color: '#2a2724',
            fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
          }}>
            {item.cleaned_text}
          </div>
        </div>
      </div>
    </div>
  )
}

function Empty() {
  return <div style={{ color: '#9a9490', fontSize: '13px' }}>데이터 없음</div>
}
