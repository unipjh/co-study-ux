import { useNavigate } from 'react-router-dom'

const BADGE_STYLE = { color: '#a07840', bg: 'rgba(160,120,64,0.1)' }

export default function ObsCard({ obs }) {
  const navigate = useNavigate()
  const s = BADGE_STYLE
  const preview = obs.fields?.insight?.slice(0, 80) || ''

  return (
    <div
      onClick={() => navigate(`/obs/${obs.id}`)}
      style={{
        background: '#f8f7f5',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '10px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, transform 0.15s',
        fontFamily: 'Noto Sans KR, sans-serif',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* 상단: 배지 + 날짜 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{
            fontSize: '11px',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 600,
            color: s.color,
            background: s.bg,
            padding: '2px 8px',
            borderRadius: '20px',
          }}>
            {obs.service}
          </span>
        </div>
        <span style={{ fontSize: '12px', color: '#a8a49e', fontFamily: 'JetBrains Mono, monospace' }}>{obs.date}</span>
      </div>

      {/* 자료명 */}
      <p style={{ fontSize: '12px', color: '#6b6860', margin: '0 0 8px' }}>{obs.material}</p>

      {/* 인사이트 미리보기 */}
      {preview && (
        <p style={{ fontSize: '13px', color: '#1a1916', margin: '0 0 12px', lineHeight: 1.6 }}>
          {preview}{obs.fields?.insight?.length > 80 ? '…' : ''}
        </p>
      )}

      {/* 상세 보기 */}
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: '12px', color: s.color, fontWeight: 500 }}>상세 보기 →</span>
      </div>
    </div>
  )
}
