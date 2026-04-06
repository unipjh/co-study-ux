import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'
import {
  addInsightNote,
  deleteObservation,
  getObservation,
} from '../lib/firestore'
import { isTeamMember } from '../lib/teamEmails'
import { buildObservationInsightDraft } from '../lib/insights'
import ObsForm from '../components/ObsForm'
import InsightNoteModal from '../components/Insights/InsightNoteModal'

function FeatureToggleView({ features = [], onImageClick }) {
  const [openIndex, setOpenIndex] = useState(null)
  if (!features.length) return null

  return (
    <section style={cardSectionStyle}>
      <SectionLabel>주요 기능</SectionLabel>
      {features.map((feature, index) => (
        <div
          key={`${feature.title || 'feature'}-${index}`}
          style={{
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '8px',
            marginBottom: '8px',
            background: 'white',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: '11px', color: '#a8a49e', minWidth: '14px' }}>
              {openIndex === index ? '−' : '+'}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#1a1916', flex: 1 }}>
              {feature.title || '(제목 없음)'}
            </span>
            {feature.images?.length > 0 && (
              <span style={{ fontSize: '11px', color: '#a8a49e' }}>이미지 {feature.images.length}</span>
            )}
          </button>

          {openIndex === index && (
            <div style={{ padding: '0 14px 14px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              {feature.description && (
                <p style={{ fontSize: '14px', color: '#1a1916', margin: '12px 0', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {feature.description}
                </p>
              )}
              {feature.images?.length > 0 && (
                <div style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
                  {feature.images.map((url, imageIndex) => (
                    <img
                      key={`${url}-${imageIndex}`}
                      src={url}
                      alt=""
                      onClick={() => onImageClick(url)}
                      style={detailImageStyle}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </section>
  )
}

function FieldRow({ label, value }) {
  if (!value) return null
  return (
    <div style={fieldRowStyle}>
      <p style={fieldLabelStyle}>{label}</p>
      <p style={{ fontSize: '14px', color: '#1a1916', margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
        {value}
      </p>
    </div>
  )
}

function StarDisplay({ value }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((score) => (
        <span key={score} style={{ color: score <= value ? '#a07840' : '#d4cfc8', fontSize: '16px' }}>
          ★
        </span>
      ))}
    </span>
  )
}

const RATINGS = [
  { key: 'conceptExploration', label: '개념 탐색 효용성' },
  { key: 'insightInduction', label: '인사이트 유도성' },
  { key: 'thoughtStimulation', label: '사고 자극' },
  { key: 'reuse', label: '재사용 의향' },
]

const BADGE_STYLE = {
  color: '#a07840',
  bg: 'rgba(160,120,64,0.08)',
  border: 'rgba(160,120,64,0.2)',
}

export default function ObsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [observation, setObservation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState(null)
  const [insightDraft, setInsightDraft] = useState(null)
  const [savingInsight, setSavingInsight] = useState(false)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  const loadObservation = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getObservation(id)
      setObservation(data)
    } catch (error) {
      console.error(error)
      setObservation(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadObservation()
  }, [loadObservation])

  async function handleDelete() {
    if (!window.confirm('이 관찰 기록을 삭제할까요?')) return
    setDeleting(true)
    try {
      await deleteObservation(id)
      navigate('/')
    } catch (error) {
      alert(`삭제 실패: ${error.message}`)
      setDeleting(false)
    }
  }

  async function handleSaveInsight(payload) {
    setSavingInsight(true)
    try {
      await addInsightNote(payload)
      setInsightDraft(null)
    } catch (error) {
      console.error(error)
    } finally {
      setSavingInsight(false)
    }
  }

  if (loading) {
    return <LoadingState text="불러오는 중..." />
  }

  if (!observation) {
    return (
      <LoadingState text="관찰을 찾을 수 없습니다.">
        <button onClick={() => navigate('/')} style={plainLinkButtonStyle}>
          목록으로 돌아가기
        </button>
      </LoadingState>
    )
  }

  const isOwner = user && user.uid === observation.uid
  const canCreateInsight = isTeamMember(user)

  if (editing) {
    return (
      <main style={pageStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1916', margin: 0 }}>관찰 수정</h2>
          <button onClick={() => setEditing(false)} style={closeButtonStyle}>
            ×
          </button>
        </div>
        <ObsForm
          initialData={observation}
          onSaved={() => {
            setEditing(false)
            loadObservation()
          }}
          onCancel={() => setEditing(false)}
          editId={id}
        />
      </main>
    )
  }

  return (
    <main style={pageStyle}>
      {lightboxUrl && (
        <div onClick={() => setLightboxUrl(null)} style={lightboxBackdropStyle}>
          <button onClick={() => setLightboxUrl(null)} style={lightboxCloseStyle}>
            ×
          </button>
          <img
            src={lightboxUrl}
            alt=""
            onClick={(event) => event.stopPropagation()}
            style={lightboxImageStyle}
          />
        </div>
      )}

      <button onClick={() => navigate('/')} style={plainLinkButtonStyle}>
        ← 목록으로 돌아가기
      </button>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 600,
                color: BADGE_STYLE.color,
                background: BADGE_STYLE.bg,
                padding: '3px 10px',
                borderRadius: '20px',
              }}
            >
              {observation.scenario}
            </span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#1a1916', margin: '0 0 4px' }}>
            {observation.service}
          </h1>
          <p style={{ fontSize: '13px', color: '#6b6860', margin: 0 }}>
            {observation.material} · <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{observation.date}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {canCreateInsight && observation.fields?.insight && (
            <button
              onClick={() => setInsightDraft(buildObservationInsightDraft(observation))}
              style={accentOutlineButtonStyle}
            >
              인사이트로 저장
            </button>
          )}
          {isOwner && (
            <>
              <button onClick={() => setEditing(true)} style={secondaryButtonStyle}>
                수정
              </button>
              <button onClick={handleDelete} disabled={deleting} style={dangerButtonStyle}>
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </>
          )}
        </div>
      </div>

      {observation.fields?.insight && (
        <section
          style={{
            background: BADGE_STYLE.bg,
            border: `1px solid ${BADGE_STYLE.border}`,
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '24px',
          }}
        >
          <SectionLabel tone={BADGE_STYLE.color}>Core Insight</SectionLabel>
          <p style={{ fontSize: '15px', color: '#1a1916', margin: 0, lineHeight: 1.7, fontWeight: 500 }}>
            {observation.fields.insight}
          </p>
        </section>
      )}

      <section style={cardSectionStyle}>
        <SectionLabel>공통 관찰</SectionLabel>
        <FieldRow label="첫 화면 & 온보딩" value={observation.fields?.onboarding} />
        {observation.onboardingImages?.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: observation.onboardingImages.length === 1 ? '1fr' : 'repeat(2, 1fr)',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            {observation.onboardingImages.map((url, index) => (
              <img key={`${url}-${index}`} src={url} alt="" onClick={() => setLightboxUrl(url)} style={detailImageStyle} />
            ))}
          </div>
        )}
        <FieldRow label="AI 개입 방식" value={observation.fields?.aiStyle} />
        <FieldRow label="마찰 지점" value={observation.fields?.friction} />
        <FieldRow label="인상적인 순간" value={observation.fields?.wowMoment} />
        <FieldRow label="핵심 기능 반응" value={observation.fields?.coreTest} />
        <FieldRow label="사용 후 느낌" value={observation.fields?.afterFeeling} />
      </section>

      <FeatureToggleView features={observation.features} onImageClick={setLightboxUrl} />

      {RATINGS.some(({ key }) => observation.ratings?.[key]) && (
        <section style={cardSectionStyle}>
          <SectionLabel>평점</SectionLabel>
          {RATINGS.map(({ key, label }) =>
            observation.ratings?.[key] ? (
              <div
                key={key}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}
              >
                <span style={{ fontSize: '13px', color: '#6b6860' }}>{label}</span>
                <StarDisplay value={observation.ratings[key]} />
              </div>
            ) : null,
          )}
        </section>
      )}

      {insightDraft && (
        <InsightNoteModal
          initialValue={insightDraft}
          onClose={() => setInsightDraft(null)}
          onSave={handleSaveInsight}
          saving={savingInsight}
        />
      )}
    </main>
  )
}

function LoadingState({ text, children }) {
  return (
    <main style={{ maxWidth: '720px', margin: '80px auto', padding: '0 16px', textAlign: 'center', color: '#a8a49e' }}>
      <p>{text}</p>
      {children}
    </main>
  )
}

function SectionLabel({ children, tone = '#6b6860' }) {
  return (
    <p
      style={{
        fontSize: '12px',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 600,
        color: tone,
        margin: '0 0 16px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {children}
    </p>
  )
}

const pageStyle = {
  maxWidth: '720px',
  margin: '0 auto',
  padding: '32px 16px',
  fontFamily: 'Noto Sans KR, sans-serif',
}

const cardSectionStyle = {
  background: '#f8f7f5',
  borderRadius: '10px',
  padding: '20px',
  marginBottom: '16px',
  border: '1px solid rgba(0,0,0,0.06)',
}

const fieldRowStyle = {
  marginBottom: '10px',
  background: '#f0ede8',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '6px',
  padding: '10px 12px',
}

const fieldLabelStyle = {
  fontSize: '12px',
  fontFamily: 'JetBrains Mono, monospace',
  fontWeight: 600,
  color: '#a07840',
  margin: '0 0 4px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

const detailImageStyle = {
  width: '100%',
  height: 'auto',
  borderRadius: '6px',
  border: '1px solid rgba(0,0,0,0.1)',
  display: 'block',
  cursor: 'zoom-in',
}

const plainLinkButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#6b6860',
  fontSize: '13px',
  cursor: 'pointer',
  padding: 0,
  marginBottom: '20px',
}

const accentOutlineButtonStyle = {
  padding: '6px 14px',
  borderRadius: '8px',
  border: '1px solid rgba(160,120,64,0.35)',
  background: 'rgba(160,120,64,0.05)',
  fontSize: '13px',
  color: '#a07840',
  cursor: 'pointer',
}

const secondaryButtonStyle = {
  padding: '6px 14px',
  borderRadius: '8px',
  border: '1px solid rgba(0,0,0,0.1)',
  background: 'transparent',
  fontSize: '13px',
  color: '#6b6860',
  cursor: 'pointer',
}

const dangerButtonStyle = {
  padding: '6px 14px',
  borderRadius: '8px',
  border: '1px solid rgba(192,57,43,0.2)',
  background: 'rgba(192,57,43,0.05)',
  fontSize: '13px',
  color: '#c0392b',
  cursor: 'pointer',
}

const closeButtonStyle = {
  color: '#a8a49e',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '22px',
  lineHeight: 1,
}

const lightboxBackdropStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  background: 'rgba(0,0,0,0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
}

const lightboxCloseStyle = {
  position: 'absolute',
  top: '16px',
  right: '20px',
  background: 'none',
  border: 'none',
  color: 'white',
  fontSize: '28px',
  cursor: 'pointer',
  lineHeight: 1,
}

const lightboxImageStyle = {
  maxWidth: '100%',
  maxHeight: '90vh',
  borderRadius: '8px',
  objectFit: 'contain',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
}
