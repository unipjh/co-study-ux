import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { auth } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { getObservation, deleteObservation } from '../lib/firestore'
import ObsForm from '../components/ObsForm'

const SCENARIO_STYLES = {
  S1: { color: '#a07840', bg: 'rgba(160,120,64,0.08)', border: 'rgba(160,120,64,0.2)', label: '이론 개념 학습' },
  S2: { color: '#3a7e96', bg: 'rgba(58,126,150,0.08)', border: 'rgba(58,126,150,0.2)', label: '실습 코드 분석' },
  S3: { color: '#4a8c4a', bg: 'rgba(74,140,74,0.08)', border: 'rgba(74,140,74,0.2)', label: '논문 리뷰' },
}

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
    <div style={{ marginBottom: '16px' }}>
      <p style={{
        fontSize: '11px',
        fontFamily: 'JetBrains Mono, monospace',
        color: '#a8a49e',
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

const S1_RATINGS = [
  { key: 'conceptExploration', label: '개념 탐색 효율성' },
  { key: 'insightInduction', label: '인사이트 유도력' },
  { key: 'thoughtStimulation', label: '사고 자극' },
  { key: 'reuse', label: '재사용 의향' },
]
const S2_RATINGS = [
  { key: 'codeRecognitionScore', label: '코드 인식 및 처리' },
  { key: 'conceptCodeLink', label: '개념-코드 연결성' },
  { key: 'coreIdentify', label: '핵심 코드 식별' },
]
const S3_RATINGS = [
  { key: 'methodologyFlow', label: '방법론 흐름 이해' },
  { key: 'figuretable', label: '그림·표 처리' },
  { key: 'contextContinuity', label: '맥락 연속성' },
  { key: 'deepExploration', label: '심화 탐구 지원' },
]
const RATINGS_BY_SCENARIO = { S1: S1_RATINGS, S2: S2_RATINGS, S3: S3_RATINGS }

export default function ObsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [obs, setObs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  const s = SCENARIO_STYLES[obs.scenario] || SCENARIO_STYLES.S1
  const isOwner = user && user.uid === obs.uid
  const ratingDefs = RATINGS_BY_SCENARIO[obs.scenario] || []

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
            <span style={{ fontSize: '14px', color: '#6b6860' }}>{s.label}</span>
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
        <p style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#a8a49e', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>공통 관찰</p>
        <FieldRow label="첫 화면 & 온보딩" value={obs.fields?.onboarding} />
        <FieldRow label="AI 개입 방식" value={obs.fields?.aiStyle} />
        <FieldRow label="마찰 지점" value={obs.fields?.friction} />
        <FieldRow label="인상적인 순간" value={obs.fields?.wowMoment} />
        <FieldRow label="핵심 테스트 반응" value={obs.fields?.coreTest} />
        {obs.scenario === 'S1' && <FieldRow label="다 쓰고 나서의 느낌" value={obs.fields?.afterFeeling} />}
      </div>

      {/* S2 추가 필드 */}
      {obs.scenario === 'S2' && obs.s2Fields && (
        <div style={{
          background: 'rgba(58,126,150,0.04)',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid rgba(58,126,150,0.12)',
        }}>
          <p style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#3a7e96', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>S2 — 코드 분석</p>
          <FieldRow label="코드 인식 능력" value={obs.s2Fields.codeRecognition} />
          <FieldRow label="코드 설명 방식" value={obs.s2Fields.codeExplanation} />
          <FieldRow label="핵심 코드 식별" value={obs.s2Fields.coreCodeIdentify} />
          <FieldRow label="개념-코드 연결" value={obs.s2Fields.conceptCodeLink} />
        </div>
      )}

      {/* S3 추가 필드 */}
      {obs.scenario === 'S3' && obs.s3Fields && (
        <div style={{
          background: 'rgba(74,140,74,0.04)',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid rgba(74,140,74,0.12)',
        }}>
          <p style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#4a8c4a', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>S3 — 논문 리뷰</p>
          <FieldRow label="방법론 흐름 이해" value={obs.s3Fields.methodologyFlow} />
          <FieldRow label="그림·표 처리" value={obs.s3Fields.figuretable} />
          <FieldRow label="심화 탐구 능력" value={obs.s3Fields.depthExploration} />
          <FieldRow label="세션 연속성" value={obs.s3Fields.sessionContinuity} />
        </div>
      )}

      {/* 별점 */}
      {ratingDefs.some(({ key }) => obs.ratings?.[key]) && (
        <div style={{
          background: '#f8f7f5',
          borderRadius: '10px',
          padding: '20px',
          border: '1px solid rgba(0,0,0,0.06)',
        }}>
          <p style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#a8a49e', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>별점</p>
          {ratingDefs.map(({ key, label }) => obs.ratings?.[key] ? (
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
