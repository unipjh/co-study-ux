import { useState } from 'react'
import { ACCENT } from '../constants/stageConfig'

const RELATION_COLOR = {
  포함: '#a07840', 선행: '#6b7280', 대조: '#ef4444', 예시: '#10b981', 연관: '#6366f1',
}

export default function S4MapViewer({ result }) {
  const maps = result || []
  const [selectedIdx, setSelectedIdx] = useState(0)
  if (!maps.length) return <Empty />

  const map = maps[selectedIdx]
  const nodes = map.nodes || []
  const edges = map.edges || []

  // 노드 위치 계산 (레벨별 수평 배치)
  const byLevel = [0, 1, 2].map((l) => nodes.filter((n) => n.level === l))
  const positions = {}
  byLevel.forEach((group, level) => {
    group.forEach((node, i) => {
      const x = (i - (group.length - 1) / 2) * 120 + 200
      const y = level * 90 + 40
      positions[node.id] = { x, y }
    })
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      {/* 드롭다운 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <select
          value={selectedIdx}
          onChange={(e) => setSelectedIdx(Number(e.target.value))}
          style={{
            border: '1px solid rgba(0,0,0,0.15)', borderRadius: '6px',
            padding: '6px 10px', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace',
            outline: 'none', cursor: 'pointer',
          }}
        >
          {maps.map((m, i) => (
            <option key={m.chunk_id} value={i}>
              {m.chunk_id.slice(0, 8)} · 노드 {m.nodes?.length}개
            </option>
          ))}
        </select>
        <span style={{ fontSize: '12px', color: '#9a9490' }}>
          노드 {nodes.length}개 · 엣지 {edges.length}개
        </span>
      </div>

      {/* 미니 그래프 */}
      <div style={{ flex: 1, border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
        <svg width="100%" height="100%" style={{ minHeight: '280px' }}>
          {/* 엣지 */}
          {edges.map((e, i) => {
            const s = positions[e.from_id]
            const t = positions[e.to_id]
            if (!s || !t) return null
            return (
              <g key={i}>
                <line x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                  stroke={RELATION_COLOR[e.relation] || '#ccc'} strokeWidth={1.5} strokeOpacity={0.6} />
                <text x={(s.x + t.x) / 2} y={(s.y + t.y) / 2 - 4}
                  fontSize="9" fill={RELATION_COLOR[e.relation] || '#999'} textAnchor="middle">
                  {e.relation}
                </text>
              </g>
            )
          })}
          {/* 노드 */}
          {nodes.map((n) => {
            const p = positions[n.id]
            if (!p) return null
            return (
              <g key={n.id}>
                <circle cx={p.x} cy={p.y} r={n.level === 0 ? 22 : n.level === 1 ? 18 : 14}
                  fill={n.level === 0 ? ACCENT : '#fff'}
                  stroke={ACCENT} strokeWidth={n.level === 0 ? 0 : 1.5} />
                <text x={p.x} y={p.y + 4} fontSize="10" textAnchor="middle"
                  fill={n.level === 0 ? '#fff' : '#2a2724'} fontFamily="Noto Sans KR, sans-serif">
                  {n.label.length > 6 ? n.label.slice(0, 6) + '…' : n.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* 범례 */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {Object.entries(RELATION_COLOR).map(([rel, color]) => (
          <span key={rel} style={{ fontSize: '11px', color, fontFamily: 'JetBrains Mono, monospace' }}>
            ─ {rel}
          </span>
        ))}
      </div>
    </div>
  )
}

function Empty() {
  return <div style={{ color: '#9a9490', fontSize: '13px' }}>데이터 없음</div>
}
