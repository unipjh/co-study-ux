import { useState } from 'react'
import { auth } from '../lib/firebase'
import { addObservation, updateObservation } from '../lib/firestore.js'
import { isTeamMember } from '../lib/teamEmails'
import StarRating from './StarRating'
import ImageUploader from './ImageUploader'
import FeatureToggleEditor from './FeatureToggleEditor'

const AUTHORS = ['박준환(AIDS)', '김정민(디이노)', '우현준(경영BM-Figma)', '김윤서(경영BM-Data)', '이예린(일문BM)']

const COL = { accent: '#a07840', bg: 'rgba(160,120,64,0.06)', border: 'rgba(160,120,64,0.2)' }

const RATINGS = [
  { key: 'conceptExploration', label: '개념 탐색 효율성' },
  { key: 'insightInduction', label: '인사이트 유도력' },
  { key: 'thoughtStimulation', label: '사고 자극' },
  { key: 'reuse', label: '재사용 의향' },
]

const today = () => new Date().toISOString().slice(0, 10)

function FieldBlock({ label, hint, value, onChange }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{
        display: 'block',
        fontSize: '12px',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 500,
        color: COL.accent,
        marginBottom: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}>
        {label}
      </label>
      {hint && (
        <p style={{ fontSize: '11px', color: '#a8a49e', margin: '0 0 4px' }}>{hint}</p>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        style={{
          width: '100%',
          padding: '8px 10px',
          background: '#f0ede8',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#1a1916',
          resize: 'vertical',
          fontFamily: 'inherit',
          outline: 'none',
          lineHeight: 1.6,
        }}
      />
    </div>
  )
}

export default function ObsForm({ onSaved, onCancel, initialData, editId }) {
  const [scenario, setScenario] = useState(initialData?.scenario || '박준환(AIDS)')
  const [service, setService] = useState(initialData?.service || '')
  const [material, setMaterial] = useState(initialData?.material || '')
  const [date, setDate] = useState(initialData?.date || today())
  const [fields, setFields] = useState(initialData?.fields || {
    onboarding: '', aiStyle: '', friction: '', wowMoment: '',
    coreTest: '', insight: '', afterFeeling: '',
  })
  const [ratings, setRatings] = useState(initialData?.ratings || {})
  const [onboardingImages, setOnboardingImages] = useState(initialData?.onboardingImages || [])
  const [features, setFeatures] = useState(initialData?.features || [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const user = auth.currentUser

  const setField = (key) => (val) => setFields((f) => ({ ...f, [key]: val }))
  const setRating = (key) => (val) => setRatings((r) => ({ ...r, [key]: val }))

  const handleSave = async () => {
    if (!isTeamMember(user)) { setError('팀원 계정으로 로그인이 필요합니다.'); return }
    if (!service.trim()) { setError('서비스명을 입력해주세요.'); return }
    if (!material.trim()) { setError('자료명을 입력해주세요.'); return }
    if (uploading) { setError('이미지 업로드가 완료될 때까지 기다려주세요.'); return }

    setSaving(true)
    setError('')
    try {
      if (editId) {
        await updateObservation(editId, { scenario, service, material, date, fields, ratings, onboardingImages, features })
      } else {
        await addObservation(
          { scenario, service, material, date, fields, ratings, onboardingImages, features },
          user.uid
        )
      }
      onSaved?.()
    } catch (e) {
      setError('저장에 실패했습니다: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ fontFamily: 'Noto Sans KR, sans-serif' }}>
      {/* 메타 입력 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '20px',
      }}>
        {/* 작성자 탭 */}
        <div>
          <label style={{ fontSize: '12px', color: '#6b6860', display: 'block', marginBottom: '6px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>작성자</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {AUTHORS.map((t) => {
              const active = scenario === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setScenario(t)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '20px',
                    border: `1px solid ${active ? COL.accent : 'rgba(0,0,0,0.1)'}`,
                    background: active ? COL.bg : 'transparent',
                    color: active ? COL.accent : '#6b6860',
                    fontSize: '13px',
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </div>

        {/* 서비스 자유 입력 */}
        <div>
          <label style={{ fontSize: '12px', color: '#6b6860', display: 'block', marginBottom: '6px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>서비스</label>
          <input
            type="text"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="예: ChatGPT, Notion AI..."
            style={{
              width: '100%',
              padding: '6px 10px',
              background: '#f0ede8',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#1a1916',
              outline: 'none',
            }}
          />
        </div>

        {/* 자료명 */}
        <div>
          <label style={{ fontSize: '12px', color: '#6b6860', display: 'block', marginBottom: '6px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>자료명</label>
          <input
            type="text"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="예: 딥러닝 3강 PDF"
            style={{
              width: '100%',
              padding: '6px 10px',
              background: '#f0ede8',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#1a1916',
              outline: 'none',
            }}
          />
        </div>

        {/* 날짜 */}
        <div>
          <label style={{ fontSize: '12px', color: '#6b6860', display: 'block', marginBottom: '6px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              background: '#f0ede8',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#1a1916',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* 공통 관찰 필드 */}
      <div style={{
        background: '#f8f7f5',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        border: '1px solid rgba(0,0,0,0.06)',
      }}>
        <p style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#a8a49e', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>공통 관찰</p>
        <FieldBlock label="첫 화면 & 온보딩" hint="처음 켰을 때 어떤 인상이었나?" value={fields.onboarding} onChange={setField('onboarding')} />
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', color: '#a8a49e', margin: '0 0 6px' }}>온보딩 관련 스크린샷을 첨부하세요.</p>
          <ImageUploader
            images={onboardingImages}
            onChange={setOnboardingImages}
            accent={COL.accent}
            onUploadingChange={setUploading}
          />
        </div>
        <FieldBlock label="AI 개입 방식" hint="언제, 어떻게 AI가 개입하는가?" value={fields.aiStyle} onChange={setField('aiStyle')} />
        <FieldBlock label="마찰 지점" hint="불편하거나 막힌 순간이 있었나?" value={fields.friction} onChange={setField('friction')} />
        <FieldBlock label="인상적인 순간" hint="'오, 이건 좋다' 싶었던 순간" value={fields.wowMoment} onChange={setField('wowMoment')} />
        <FieldBlock label="핵심 테스트 반응" hint="핵심 기능을 테스트했을 때의 반응" value={fields.coreTest} onChange={setField('coreTest')} />
        <FieldBlock label="다 쓰고 나서의 느낌" hint="세션 후 어떤 감정이 남았나?" value={fields.afterFeeling} onChange={setField('afterFeeling')} />
      </div>

      {/* 주요 기능 섹션 */}
      <div style={{
        background: '#f8f7f5',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        border: '1px solid rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <p style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#a8a49e', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>주요 기능</p>
          <p style={{ fontSize: '11px', color: '#a8a49e', margin: 0 }}>기능별로 토글을 추가해 이미지와 설명을 기록하세요.</p>
        </div>
        <FeatureToggleEditor
          features={features}
          onChange={setFeatures}
          accent={COL.accent}
          onUploadingChange={setUploading}
        />
      </div>

      {/* 인사이트 (강조 블록) */}
      <div style={{
        background: COL.bg,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        border: `1px solid ${COL.border}`,
      }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 600,
          color: COL.accent,
          marginBottom: '4px',
        }}>
          → 인사이트
        </label>
        <p style={{ fontSize: '11px', color: '#a8a49e', margin: '0 0 6px' }}>이 서비스를 쓰고 난 후 Co-Study에 반영하고 싶은 핵심 인사이트</p>
        <textarea
          value={fields.insight}
          onChange={(e) => setFields((f) => ({ ...f, insight: e.target.value }))}
          rows={4}
          placeholder="가장 중요한 한 가지를 적어주세요."
          style={{
            width: '100%',
            padding: '8px 10px',
            background: 'white',
            border: `1px solid ${COL.border}`,
            borderRadius: '6px',
            fontSize: '13px',
            color: '#1a1916',
            resize: 'vertical',
            fontFamily: 'inherit',
            outline: 'none',
            lineHeight: 1.6,
          }}
        />
      </div>

      {/* 별점 */}
      <div style={{
        background: '#f8f7f5',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px',
        border: '1px solid rgba(0,0,0,0.06)',
      }}>
        <p style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#a8a49e', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>별점</p>
        {RATINGS.map(({ key, label }) => (
          <StarRating
            key={key}
            label={label}
            value={ratings[key] || 0}
            onChange={setRating(key)}
          />
        ))}
      </div>

      {error && (
        <p style={{ color: '#c0392b', fontSize: '13px', marginBottom: '12px' }}>{error}</p>
      )}

      {/* 버튼 */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: '1px solid rgba(0,0,0,0.1)',
            background: 'transparent',
            fontSize: '13px',
            color: '#6b6860',
            cursor: 'pointer',
          }}
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            background: COL.accent,
            color: 'white',
            fontSize: '13px',
            fontWeight: 500,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
