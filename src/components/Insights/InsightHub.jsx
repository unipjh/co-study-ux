import { useMemo, useState } from 'react'
import InsightCard from './InsightCard'
import { getSectionLabel } from '../../lib/insights'

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'pains', label: 'Pains' },
  { key: 'gains', label: 'Gains' },
  { key: 'prototype', label: '프로토타입' },
]

export default function InsightHub({
  title = '인사이트 허브',
  subtitle = '관찰과 경험에서 나온 결론을 VPC와 Prototype으로 연결합니다.',
  insights = [],
  loading = false,
  canEdit = false,
  onCreate,
  onEdit,
  onDelete,
  emptyText = '아직 정리된 인사이트가 없습니다.',
  compact = false,
  initialFilter = 'all',
}) {
  const [activeFilter, setActiveFilter] = useState(initialFilter)

  const filteredInsights = useMemo(() => {
    if (activeFilter === 'all') return insights
    if (activeFilter === 'prototype') {
      return insights.filter((item) => item.prototypeImplication?.trim())
    }
    return insights.filter((item) => item.linkedVpcSections?.includes(activeFilter))
  }, [activeFilter, insights])

  return (
    <section
      style={{
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '14px',
        padding: '18px',
        background: '#fcfbf8',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '14px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '16px', color: '#1a1916' }}>{title}</h2>
          <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#6b6860' }}>{subtitle}</p>
        </div>
        {canEdit && (
          <button onClick={onCreate} style={addButtonStyle}>
            + 인사이트 추가
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {FILTERS.map((filterItem) => {
          const active = activeFilter === filterItem.key
          const count = getCount(insights, filterItem.key)
          return (
            <button
              key={filterItem.key}
              onClick={() => setActiveFilter(filterItem.key)}
              style={{
                padding: '5px 12px',
                borderRadius: '999px',
                border: `1px solid ${active ? '#a07840' : 'rgba(0,0,0,0.1)'}`,
                background: active ? 'rgba(160,120,64,0.08)' : 'white',
                color: active ? '#a07840' : '#6b6860',
                fontSize: '12px',
                fontWeight: active ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {getFilterLabel(filterItem.key)} {count}
            </button>
          )
        })}
      </div>

      {loading ? (
        <p style={emptyStyle}>불러오는 중...</p>
      ) : filteredInsights.length === 0 ? (
        <p style={emptyStyle}>{emptyText}</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px',
          }}
        >
          {filteredInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              canEdit={canEdit}
              onEdit={onEdit}
              onDelete={onDelete}
              compact={compact}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function getFilterLabel(key) {
  if (key === 'all') return '전체'
  if (key === 'prototype') return '프로토타입'
  return getSectionLabel(key)
}

function getCount(insights, filterKey) {
  if (filterKey === 'all') return insights.length
  if (filterKey === 'prototype') {
    return insights.filter((item) => item.prototypeImplication?.trim()).length
  }
  return insights.filter((item) => item.linkedVpcSections?.includes(filterKey)).length
}

const addButtonStyle = {
  padding: '7px 14px',
  borderRadius: '8px',
  border: 'none',
  background: '#a07840',
  color: '#fff',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
}

const emptyStyle = {
  margin: 0,
  padding: '28px 0',
  textAlign: 'center',
  fontSize: '13px',
  color: '#a8a49e',
}
