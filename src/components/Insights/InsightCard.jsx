import {
  getInsightPriorityLabel,
  getInsightStatusLabel,
  getSectionLabel,
} from '../../lib/insights'

const PRIORITY_COLORS = {
  high: { text: '#9e4a4a', bg: 'rgba(158,74,74,0.08)', border: 'rgba(158,74,74,0.22)' },
  medium: { text: '#a07840', bg: 'rgba(160,120,64,0.08)', border: 'rgba(160,120,64,0.22)' },
  low: { text: '#4a7c6f', bg: 'rgba(74,124,111,0.08)', border: 'rgba(74,124,111,0.22)' },
}

function Tag({ children, tone = PRIORITY_COLORS.medium }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 600,
        color: tone.text,
        background: tone.bg,
        border: `1px solid ${tone.border}`,
      }}
    >
      {children}
    </span>
  )
}

export default function InsightCard({
  insight,
  canEdit = false,
  onEdit,
  onDelete,
  compact = false,
}) {
  const priorityTone = PRIORITY_COLORS[insight.priority] || PRIORITY_COLORS.medium

  return (
    <article
      style={{
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '12px',
        padding: compact ? '14px' : '16px',
        background: '#fff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: compact ? '14px' : '15px', color: '#1a1916' }}>
            {insight.title || '제목 없는 인사이트'}
          </h3>
          {insight.sourceLabel && (
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b6860' }}>
              출처: {insight.sourceLabel}
            </p>
          )}
        </div>
        {canEdit && (
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={() => onEdit?.(insight)}
              style={{
                border: 'none',
                background: 'none',
                fontSize: '12px',
                color: '#6b6860',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              수정
            </button>
            <button
              onClick={() => onDelete?.(insight.id)}
              style={{
                border: 'none',
                background: 'none',
                fontSize: '12px',
                color: '#c0392b',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              삭제
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: compact ? '10px' : '12px' }}>
        <Tag tone={priorityTone}>우선순위 {getInsightPriorityLabel(insight.priority)}</Tag>
        <Tag>{getInsightStatusLabel(insight.status)}</Tag>
        {insight.linkedVpcSections?.map((sectionKey) => (
          <Tag key={sectionKey}>{getSectionLabel(sectionKey)}</Tag>
        ))}
      </div>

      {insight.summary && (
        <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.65, color: '#1a1916', whiteSpace: 'pre-wrap' }}>
          {insight.summary}
        </p>
      )}

      {!compact && insight.evidence && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            borderRadius: '8px',
            background: '#fafaf9',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: '#a8a49e',
              fontFamily: 'JetBrains Mono, monospace',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            근거 메모
          </div>
          <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.6, color: '#6b6860', whiteSpace: 'pre-wrap' }}>
            {insight.evidence}
          </p>
        </div>
      )}

      {insight.prototypeImplication && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(74,124,111,0.06)',
            border: '1px solid rgba(74,124,111,0.18)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: '#4a7c6f',
              fontFamily: 'JetBrains Mono, monospace',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            프로토타입 시사점
          </div>
          <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.6, color: '#35574f', whiteSpace: 'pre-wrap' }}>
            {insight.prototypeImplication}
          </p>
        </div>
      )}
    </article>
  )
}
