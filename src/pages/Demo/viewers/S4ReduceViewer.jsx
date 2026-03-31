import { ACCENT } from '../constants/stageConfig'

export default function S4ReduceViewer({ result }) {
  if (!result) return <Empty />

  const { root_id, nodes = [], edges = [] } = result
  const maxDepth = Math.max(...nodes.map((n) => n.level ?? 0), 0)
  const levelCounts = [0, 1, 2].map((l) => nodes.filter((n) => n.level === l).length)

  return (
    <div style={{ display: 'flex', gap: '16px', height: '100%' }}>
      {/* 통계 사이드 */}
      <div style={{ width: '160px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Stat label="총 노드" value={nodes.length} accent={nodes.length >= 15 && nodes.length <= 30} />
        <Stat label="총 엣지" value={edges.length} />
        <Stat label="최대 depth" value={maxDepth} />
        <Stat label="루트 노드" value={nodes.find((n) => n.id === root_id)?.label || root_id} small />
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: '12px' }}>
          {[0, 1, 2].map((l) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#9a9490' }}>level {l}</span>
              <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#2a2724' }}>
                {levelCounts[l]}개
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* GlobalMap JSON */}
      <div style={{
        flex: 1, border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', padding: '14px',
        overflowY: 'auto', fontSize: '12px', lineHeight: '1.6',
        fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        color: '#2a2724',
      }}>
        {JSON.stringify(result, null, 2)}
      </div>
    </div>
  )
}

function Stat({ label, value, accent, small }) {
  return (
    <div style={{ padding: '10px 12px', background: '#fafaf9', borderRadius: '6px', border: `1px solid ${accent ? `rgba(160,120,64,0.3)` : 'rgba(0,0,0,0.07)'}` }}>
      <div style={{ fontSize: '10px', color: '#9a9490', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: small ? '12px' : '20px', fontWeight: 700, color: accent ? ACCENT : '#1a1916', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.2 }}>
        {value}
      </div>
    </div>
  )
}

function Empty() {
  return <div style={{ color: '#9a9490', fontSize: '13px' }}>데이터 없음</div>
}
