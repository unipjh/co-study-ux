import { useState } from 'react'
import { auth } from '../lib/firebase'
import { addObservation, updateObservation } from '../lib/firestore.js'
import StarRating from './StarRating'

const SERVICES = ['유니브AI', 'Lilys AI', 'NotebookLM', 'ChatGPT', 'Claude', '기타']

const SCENARIO_COLORS = {
  S1: { accent: '#a07840', bg: 'rgba(160,120,64,0.06)', border: 'rgba(160,120,64,0.2)' },
  S2: { accent: '#3a7e96', bg: 'rgba(58,126,150,0.06)', border: 'rgba(58,126,150,0.2)' },
  S3: { accent: '#4a8c4a', bg: 'rgba(74,140,74,0.06)', border: 'rgba(74,140,74,0.2)' },
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

const today = () => new Date().toISOString().slice(0, 10)

function FieldBlock({ label, hint, value, onChange, accent }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{
        display: 'block',
        fontSize: '12px',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 500,
        color: accent || '#6b6860',
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
  const [scenario, setScenario] = useState(initialData?.scenario || 'S1')
  const [service, setService] = useState(initialData?.service || '')
  const [material, setMaterial] = useState(initialData?.material || '')
  const [date, setDate] = useState(initialData?.date || today())
  const [fields, setFields] = useState(initialData?.fields || {
    onboarding: '', aiStyle: '', friction: '', wowMoment: '',
    coreTest: '', insight: '', afterFeeling: '',
  })
  const [s2Fields, setS2Fields] = useState(initialData?.s2Fields || {
    codeRecognition: '', codeExplanation: '', coreCodeIdentify: '', conceptCodeLink: '',
  })
  const [s3Fields, setS3Fields] = useState(initialData?.s3Fields || {
    methodologyFlow: '', figuretable: '', depthExploration: '', sessionContinuity: '',
  })
  const [ratings, setRatings] = useState(initialData?.ratings || {})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const col = SCENARIO_COLORS[scenario]
  const user = auth.currentUser

  const setField = (key) => (val) => setFields((f) => ({ ...f, [key]: val }))
  const setS2 = (key) => (val) => setS2Fields((f) => ({ ...f, [key]: val }))
  const setS3 = (key) => (val) => setS3Fields((f) => ({ ...f, [key]: val }))
  const setRating = (key) => (val) => setRatings((r) => ({ ...r, [key]: val }))

  const handleSave = async () => {
    if (!user) { setError('로그인이 필요합니다.'); return }
    if (!service) { setError('서비스명을 선택해주세요.'); return }
    if (!material.trim()) { setError('자료명을 입력해주세요.'); return }

    setSaving(true)
    setError('')
    try {
      if (editId) {
        await updateObservation(editId, { scenario, service, material, date, fields, s2Fields, s3Fields, ratings })
      } else {
        await addObservation(
          { scenario, service, material, date, fields, s2Fields, s3Fields, ratings },
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
        {/* 시나리오 탭 */}
        <div>
          <label style={{ fontSize: '12px', color: '#6b6860', display: 'block', marginBottom: '6px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>시나리오</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['S1', 'S2', 'S3'].map((s) => {
              const c = SCENARIO_COLORS[s]
              const active = scenario === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScenario(s)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '20px',
                    border: `1px solid ${active ? c.accent : 'rgba(0,0,0,0.1)'}`,
                    background: active ? c.bg : 'transparent',
                    color: active ? c.accent : '#6b6860',
                    fontSize: '13px',
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        {/* 서비스 선택 */}
        <div>
          <label style={{ fontSize: '12px', color: '#6b6860', display: 'block', marginBottom: '6px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>서비스</label>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              background: '#f0ede8',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '6px',
              fontSize: '13px',
              color: service ? '#1a1916' : '#a8a49e',
              outline: 'none',
            }}
          >
            <option value="">선택하세요</option>
            {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
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
        <FieldBlock label="AI 개입 방식" hint="언제, 어떻게 AI가 개입하는가?" value={fields.aiStyle} onChange={setField('aiStyle')} />
        <FieldBlock label="마찰 지점" hint="불편하거나 막힌 순간이 있었나?" value={fields.friction} onChange={setField('friction')} />
        <FieldBlock label="인상적인 순간" hint="'오, 이건 좋다' 싶었던 순간" value={fields.wowMoment} onChange={setField('wowMoment')} />
        <FieldBlock label="핵심 테스트 반응" hint={scenario === 'S1' ? '"이 개념이 왜 중요해?"라고 물었을 때' : scenario === 'S2' ? '"이 코드에서 가장 중요한 부분이 뭐야?"라고 물었을 때' : '"이 논문의 가장 새로운 아이디어가 뭐야?"라고 물었을 때'} value={fields.coreTest} onChange={setField('coreTest')} />
        {scenario === 'S1' && (
          <FieldBlock label="다 쓰고 나서의 느낌" hint="세션 후 어떤 감정이 남았나?" value={fields.afterFeeling} onChange={setField('afterFeeling')} />
        )}
      </div>

      {/* 시나리오별 추가 필드 */}
      {scenario === 'S2' && (
        <div style={{
          background: 'rgba(58,126,150,0.04)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          border: '1px solid rgba(58,126,150,0.12)',
        }}>
          <p style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#3a7e96', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>S2 — 코드 분석</p>
          <FieldBlock label="코드 인식 능력" hint="코드를 얼마나 잘 이해했나?" value={s2Fields.codeRecognition} onChange={setS2('codeRecognition')} accent="#3a7e96" />
          <FieldBlock label="코드 설명 방식" hint="어떻게 설명해줬나?" value={s2Fields.codeExplanation} onChange={setS2('codeExplanation')} accent="#3a7e96" />
          <FieldBlock label="핵심 코드 식별" hint="핵심 부분을 제대로 짚었나?" value={s2Fields.coreCodeIdentify} onChange={setS2('coreCodeIdentify')} accent="#3a7e96" />
          <FieldBlock label="개념-코드 연결" hint="개념과 코드를 연결해줬나?" value={s2Fields.conceptCodeLink} onChange={setS2('conceptCodeLink')} accent="#3a7e96" />
        </div>
      )}

      {scenario === 'S3' && (
        <div style={{
          background: 'rgba(74,140,74,0.04)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          border: '1px solid rgba(74,140,74,0.12)',
        }}>
          <p style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#4a8c4a', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>S3 — 논문 리뷰</p>
          <FieldBlock label="방법론 흐름 이해" hint="연구 방법론을 잘 파악했나?" value={s3Fields.methodologyFlow} onChange={setS3('methodologyFlow')} accent="#4a8c4a" />
          <FieldBlock label="그림·표 처리" hint="그림과 표를 잘 해석했나?" value={s3Fields.figuretable} onChange={setS3('figuretable')} accent="#4a8c4a" />
          <FieldBlock label="심화 탐구 능력" hint="맥락 기반으로 깊게 파고들었나?" value={s3Fields.depthExploration} onChange={setS3('depthExploration')} accent="#4a8c4a" />
          <FieldBlock label="세션 연속성" hint="이전 질문을 기억했나?" value={s3Fields.sessionContinuity} onChange={setS3('sessionContinuity')} accent="#4a8c4a" />
        </div>
      )}

      {/* 인사이트 (강조 블록) */}
      <div style={{
        background: col.bg,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        border: `1px solid ${col.border}`,
      }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 600,
          color: col.accent,
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
            border: `1px solid ${col.border}`,
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
        {RATINGS_BY_SCENARIO[scenario].map(({ key, label }) => (
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
            background: col.accent,
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
