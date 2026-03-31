import { useState } from 'react'
import { ACCENT } from '../constants/stageConfig'

const LEVEL_COLOR = { 0: ACCENT, 1: '#7c6840', 2: '#b0a898' }
const LEVEL_LABEL = { 0: '대단원', 1: '소단원', 2: '문단' }

export default function S2Viewer({ result }) {
  const chunks = result || []
  const [selected, setSelected] = useState(null)
  if (!chunks.length) return <Empty />

  return (
    <div style={{ display: 'flex', gap: '16px', height: '100%' }}>
      {/* 청크 목록 */}
      <div style={{ width: '260px', flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {chunks.map((chunk) => (
          <div
            key={chunk.chunk_id}
            onClick={() => setSelected(selected?.chunk_id === chunk.chunk_id ? null : chunk)}
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              border: `1px solid ${selected?.chunk_id === chunk.chunk_id ? ACCENT : 'rgba(0,0,0,0.08)'}`,
              cursor: 'pointer',
              background: selected?.chunk_id === chunk.chunk_id ? 'rgba(160,120,64,0.05)' : '#fafaf9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                fontSize: '10px',
                fontFamily: 'JetBrains Mono, monospace',
                color: '#fff',
                background: LEVEL_COLOR[chunk.level],
                borderRadius: '3px',
                padding: '1px 6px',
              }}>
                {LEVEL_LABEL[chunk.level]}
              </span>
              <span style={{ fontSize: '11px', color: '#9a9490', fontFamily: 'JetBrains Mono, monospace' }}>
                {chunk.chunk_id.slice(0, 8)}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#4a4744', lineHeight: '1.4' }}>
              {chunk.text.slice(0, 60)}…
            </div>
            <div style={{ fontSize: '11px', color: '#b0a898', marginTop: '4px' }}>
              {chunk.text.length}자 · p{chunk.page_range?.[0]}
            </div>
          </div>
        ))}
      </div>

      {/* 선택된 청크 텍스트 */}
      <div style={{
        flex: 1,
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '8px',
        padding: '16px',
        overflowY: 'auto',
        fontSize: '13px',
        lineHeight: '1.7',
        color: '#2a2724',
        fontFamily: 'JetBrains Mono, monospace',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
      }}>
        {selected
          ? selected.text
          : <span style={{ color: '#9a9490' }}>← 청크를 클릭하면 전문이 표시됩니다.</span>
        }
      </div>
    </div>
  )
}

function Empty() {
  return <div style={{ color: '#9a9490', fontSize: '13px' }}>데이터 없음</div>
}
