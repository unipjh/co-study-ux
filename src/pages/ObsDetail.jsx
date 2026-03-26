import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { auth } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { getObservation, deleteObservation } from '../lib/firestore'
import ObsForm from '../components/ObsForm'

function FeatureToggleView({ features = [], onImageClick }) {
  const [openIdx, setOpenIdx] = useState(null)
  if (!features.length) return null
  return (
    <div style={{
      background: '#f8f7f5',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '16px',
      border: '1px solid rgba(0,0,0,0.06)',
    }}>
      <p style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#6b6860', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>주요 기능</p>
      {features.map((feat, i) => (
        <div key={i} style={{
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '8px',
          marginBottom: '8px',
          background: 'white',
          overflow: 'hidden',
        }}>
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', background: 'none', border: 'none',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <span style={{ fontSize: '11px', color: '#a8a49e', minWidth: '14px' }}>
              {openIdx === i ? '▼' : '▶'}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#1a1916', flex: 1 }}>
              {feat.title || '(제목 없음)'}
            </span>
            {feat.images?.length > 0 && (
              <span style={{ fontSize: '11px', color: '#a8a49e' }}>
                이미지 {feat.images.length}
              </span>
            )}
          </button>
          {openIdx === i && (
            <div style={{ padding: '0 14px 14px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              {feat.description && (
                <p style={{
                  fontSize: '14px', color: '#1a1916', margin: '12px 0',
                  lineHeight: 1.7, whiteSpace: 'pre-wrap',
                }}>
                  {feat.description}
                </p>
              )}
              {feat.images?.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '8px',
                  marginTop: '10px',
                }}>
                  {feat.images.map((url, j) => (
                    <img
                      key={j}
                      src={url}
                      alt=""
                      onClick={() => onImageClick(url)}
                      style={{
                        width: '100%', height: 'auto',
                        borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)',
                        display: 'block', cursor: 'zoom-in',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const BADGE_STYLE = { color: '#a07840', bg: 'rgba(160,120,64,0.08)', border: 'rgba(160,120,64,0.2)' }

function StarDisplay({ value }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= value ? '#a07840' : '#d4cfc8', fontSize: '16px' }}>★</span>
      ))}
    </span>
  )
}

function FieldRow({ label, value }) {
  if (!value) return null
  return (
    <div style={{
      marginBottom: '10px',
      background: '#f0ede8',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: '6px',
      padding: '10px 12px',
    }}>
      <p style={{
        fontSize: '12px',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 600,
        color: '#a07840',
        margin: '0 0 4px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}>
        {label}
      </p>
      <p style={{ fontSize: '14px', color: '#1a1916', margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{value}</p>
    </div>
  )
}

const RATINGS = [
  { key: 'conceptExploration', label: '개념 탐색 효율성' },
  { key: 'insightInduction', label: '인사이트 유도력' },
  { key: 'thoughtStimulation', label: '사고 자극' },
  { key: 'reuse', label: '재사용 의향' },
]

export default function ObsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [obs, setObs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState(null)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  useEffect(() => {
    getObservation(id).then((data) => {
      setObs(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('이 관찰을 삭제하시겠습니까?')) return
    setDeleting(true)
    try {
      await deleteObservation(id)
      navigate('/')
    } catch (e) {
      alert('삭제 실패: ' + e.message)
      setDeleting(false)
    }
  }

  if (loading) return (
    <main style={{ maxWidth: '720px', margin: '80px auto', padding: '0 16px', textAlign: 'center', color: '#a8a49e' }}>
      불러오는 중...
    </main>
  )

  if (!obs) return (
    <main style={{ maxWidth: '720px', margin: '80px auto', padding: '0 16px', textAlign: 'center', color: '#a8a49e' }}>
      관찰을 찾을 수 없습니다.
      <br />
      <button onClick={() => navigate('/')} style={{ marginTop: '16px', color: '#a07840', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
        ← 목록으로
      </button>
    </main>
  )

  const s = BADGE_STYLE
  const isOwner = user && user.uid === obs.uid

  if (editing) return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 16px', fontFamily: 'Noto Sans KR, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1916', margin: 0 }}>관찰 수정</h2>
        <button onClick={() => setEditing(false)} style={{ color: '#a8a49e', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>×</button>
      </div>
      <ObsForm
        initialData={obs}
        onSaved={() => {
          setEditing(false)
          getObservation(id).then(setObs)
        }}
        onCancel={() => setEditing(false)}
        editId={id}
      />
    </main>
  )

  return (
    <main style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 16px', fontFamily: 'Noto Sans KR, sans-serif' }}>
      {/* 라이트박스 */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            style={{
              position: 'absolute', top: '16px', right: '20px',
              background: 'none', border: 'none', color: 'white',
              fontSize: '28px', cursor: 'pointer', lineHeight: 1,
            }}
          >
            ×
          </button>
          <img
            src={lightboxUrl}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '100%', maxHeight: '90vh',
              borderRadius: '8px', objectFit: 'contain',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          />
        </div>
      )}

      {/* 뒤로가기 */}
      <button
        onClick={() => navigate('/')}
        style={{ background: 'none', border: 'none', color: '#6b6860', fontSize: '13px', cursor: 'pointer', padding: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        ← 목록으로
      </button>

      {/* 메타 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{
              fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
              color: s.color, background: s.bg,
              padding: '3px 10px', borderRadius: '20px',
            }}>
              {obs.scenario}
            </span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#1a1916', margin: '0 0 4px' }}>{obs.service}</h1>
          <p style={{ fontSize: '13px', color: '#6b6860', margin: 0 }}>
            {obs.material} &middot; <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{obs.date}</span>
          </p>
        </div>
        {isOwner && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: '6px 14px', borderRadius: '6px',
                border: '1px solid rgba(0,0,0,0.1)',
                background: 'transparent', fontSize: '13px', color: '#6b6860', cursor: 'pointer',
              }}
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                padding: '6px 14px', borderRadius: '6px',
                border: '1px solid rgba(192,57,43,0.2)',
                background: 'rgba(192,57,43,0.05)', fontSize: '13px', color: '#c0392b', cursor: 'pointer',
              }}
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        )}
      </div>

      {/* 인사이트 강조 블록 */}
      {obs.fields?.insight && (
        <div style={{
          background: s.bg,
          border: `1px solid ${s.border}`,
          borderRadius: '10px',
          padding: '16px 20px',
          marginBottom: '24px',
        }}>
          <p style={{
            fontSize: '12px', fontFamily: 'JetBrains Mono, monospace',
            color: s.color, margin: '0 0 8px', fontWeight: 600,
          }}>
            → 인사이트
          </p>
          <p style={{ fontSize: '15px', color: '#1a1916', margin: 0, lineHeight: 1.7, fontWeight: 500 }}>
            {obs.fields.insight}
          </p>
        </div>
      )}

      {/* 공통 관찰 필드 */}
      <div style={{
        background: '#f8f7f5',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid rgba(0,0,0,0.06)',
      }}>
        <p style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#6b6860', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>공통 관찰</p>
        <FieldRow label="첫 화면 & 온보딩" value={obs.fields?.onboarding} />
        {obs.onboardingImages?.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: obs.onboardingImages.length === 1 ? '1fr' : 'repeat(2, 1fr)',
            gap: '8px',
            marginBottom: '16px',
          }}>
            {obs.onboardingImages.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                onClick={() => setLightboxUrl(url)}
                style={{
                  width: '100%', height: 'auto',
                  borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)',
                  display: 'block', cursor: 'zoom-in',
                }}
              />
            ))}
          </div>
        )}
        <FieldRow label="AI 개입 방식" value={obs.fields?.aiStyle} />
        <FieldRow label="마찰 지점" value={obs.fields?.friction} />
        <FieldRow label="인상적인 순간" value={obs.fields?.wowMoment} />
        <FieldRow label="핵심 테스트 반응" value={obs.fields?.coreTest} />
        <FieldRow label="다 쓰고 나서의 느낌" value={obs.fields?.afterFeeling} />
      </div>

      {/* 주요 기능 */}
      <FeatureToggleView features={obs.features} onImageClick={setLightboxUrl} />

      {/* 별점 */}
      {RATINGS.some(({ key }) => obs.ratings?.[key]) && (
        <div style={{
          background: '#f8f7f5',
          borderRadius: '10px',
          padding: '20px',
          border: '1px solid rgba(0,0,0,0.06)',
        }}>
          <p style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#6b6860', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>별점</p>
          {RATINGS.map(({ key, label }) => obs.ratings?.[key] ? (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#6b6860' }}>{label}</span>
              <StarDisplay value={obs.ratings[key]} />
            </div>
          ) : null)}
        </div>
      )}
    </main>
  )
}
