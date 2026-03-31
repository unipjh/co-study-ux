import { useCallback, useState } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ACCENT } from '../constants/stageConfig'

const DEPTH_LEVELS = [
  { label: '1단계', maxDepth: 0 },
  { label: '2단계', maxDepth: 1 },
  { label: '전체',  maxDepth: Infinity },
]

function computeDepths(rawNodes, rawEdges) {
  // 루트 노드(type === 'input')에서 BFS로 실제 depth 계산
  const adj = {}
  for (const e of rawEdges) {
    if (!adj[e.source]) adj[e.source] = []
    adj[e.source].push(e.target)
  }

  const depthMap = {}
  const queue = []
  for (const n of rawNodes) {
    if (n.type === 'input') {
      depthMap[n.id] = 0
      queue.push(n.id)
    }
  }

  let i = 0
  while (i < queue.length) {
    const id = queue[i++]
    for (const target of (adj[id] || [])) {
      if (depthMap[target] === undefined) {
        depthMap[target] = depthMap[id] + 1
        queue.push(target)
      }
    }
  }

  return depthMap
}

function toRFNodes(rawNodes, rawEdges, maxDepth) {
  const depthMap = computeDepths(rawNodes, rawEdges)

  return rawNodes.map((n) => {
    const nodeDepth = depthMap[n.id] ?? Infinity
    const hidden = nodeDepth > maxDepth

    return {
      ...n,
      hidden,
      style: {
        background: n.type === 'input' ? ACCENT : '#fff',
        color: n.type === 'input' ? '#fff' : '#1a1916',
        border: `1.5px solid ${n.type === 'input' ? ACCENT : 'rgba(0,0,0,0.15)'}`,
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'Noto Sans KR, sans-serif',
        padding: '6px 12px',
        minWidth: '80px',
        textAlign: 'center',
      },
    }
  })
}

function toRFEdges(rawEdges, hiddenIds) {
  return rawEdges.map((e) => ({
    ...e,
    hidden: hiddenIds.has(e.source) || hiddenIds.has(e.target),
    style: { stroke: 'rgba(0,0,0,0.2)', strokeWidth: 1.5 },
    labelStyle: { fontSize: '10px', fill: '#9a9490' },
    labelBgStyle: { fill: '#fff' },
  }))
}

export default function S5Viewer({ result }) {
  const [depthIdx, setDepthIdx] = useState(2)
  const maxDepth = DEPTH_LEVELS[depthIdx].maxDepth

  const rawNodes = result?.nodes || []
  const rawEdges = result?.edges || []

  function buildNodesEdges(depth) {
    const rfNodes = toRFNodes(rawNodes, rawEdges, depth)
    const hiddenIds = new Set(rfNodes.filter((n) => n.hidden).map((n) => n.id))
    const rfEdges = toRFEdges(rawEdges, hiddenIds)
    return { rfNodes, rfEdges }
  }

  const initial = buildNodesEdges(maxDepth)
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.rfNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.rfEdges)
  const onConnect = useCallback((p) => setEdges((eds) => addEdge(p, eds)), [setEdges])

  function changeDepth(idx) {
    setDepthIdx(idx)
    const { rfNodes, rfEdges } = buildNodesEdges(DEPTH_LEVELS[idx].maxDepth)
    setNodes(rfNodes)
    setEdges(rfEdges)
  }

  if (!result) return <Empty />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
      {/* 컨트롤 바 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: '#9a9490' }}>표시 depth:</span>
        {DEPTH_LEVELS.map((d, i) => (
          <button
            key={d.label}
            onClick={() => changeDepth(i)}
            style={{
              padding: '4px 12px',
              borderRadius: '4px',
              border: `1px solid ${depthIdx === i ? ACCENT : 'rgba(0,0,0,0.12)'}`,
              background: depthIdx === i ? `rgba(160,120,64,0.08)` : 'transparent',
              color: depthIdx === i ? ACCENT : '#6b6860',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {d.label}
          </button>
        ))}

        {/* JSON 다운로드 */}
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = 'mindmap.json'
            a.click()
          }}
          style={{
            marginLeft: 'auto',
            padding: '4px 14px',
            borderRadius: '4px',
            border: `1px solid rgba(0,0,0,0.12)`,
            background: 'transparent',
            color: '#6b6860',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          JSON 다운로드
        </button>
      </div>

      {/* React Flow */}
      <div style={{ flex: 1, border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <MiniMap nodeColor={(n) => (n.type === 'input' ? ACCENT : '#e5e2de')} zoomable pannable />
          <Controls />
          <Background gap={16} color="#f0ede8" />
        </ReactFlow>
      </div>
    </div>
  )
}

function Empty() {
  return <div style={{ color: '#9a9490', fontSize: '13px' }}>데이터 없음</div>
}
