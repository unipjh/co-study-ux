import { useEffect, useState } from 'react'

const STATUS_OPTIONS = [
  { key: 'todo', label: 'To do' },
  { key: 'doing', label: 'Doing' },
  { key: 'done', label: 'Done' },
]

function createEmptyDecision(initialValue) {
  return {
    title: '',
    decision: '',
    reason: '',
    linkedInsightIds: [],
    linkedFeatureIds: [],
    nextAction: '',
    status: 'todo',
    ...initialValue,
  }
}

export default function DecisionLogModal({
  initialValue,
  insights = [],
  features = [],
  onClose,
  onSave,
  saving = false,
}) {
  const [form, setForm] = useState(createEmptyDecision(initialValue))

  useEffect(() => {
    setForm(createEmptyDecision(initialValue))
  }, [initialValue])

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleListValue(key, value) {
    setForm((prev) => {
      const current = prev[key] || []
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      }
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.title.trim()) return
    await onSave({
      ...form,
      title: form.title.trim(),
      decision: form.decision.trim(),
      reason: form.reason.trim(),
      nextAction: form.nextAction.trim(),
    })
  }

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '760px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#fff',
          borderRadius: '14px',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '17px', color: '#1a1916' }}>
              {initialValue?.id ? 'Decision 수정' : 'Decision 추가'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b6860' }}>
              어떤 인사이트를 어떤 기능 결정으로 바꿨는지 남깁니다.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'none', fontSize: '22px', color: '#a8a49e', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="결정 제목" required>
            <input
              value={form.title}
              onChange={(event) => setField('title', event.target.value)}
              style={inputStyle}
            />
          </Field>

          <Field label="이번 버전에서 하기로 한 것">
            <textarea
              rows={3}
              value={form.decision}
              onChange={(event) => setField('decision', event.target.value)}
              style={textareaStyle}
            />
          </Field>

          <Field label="왜 이렇게 정했는가">
            <textarea
              rows={4}
              value={form.reason}
              onChange={(event) => setField('reason', event.target.value)}
              style={textareaStyle}
            />
          </Field>

          <Field label="연결할 인사이트">
            <div style={listBoxStyle}>
              {insights.length === 0 ? (
                <span style={emptyStyle}>연결할 인사이트가 없습니다.</span>
              ) : (
                insights.map((insight) => {
                  const active = form.linkedInsightIds?.includes(insight.id)
                  return (
                    <button
                      key={insight.id}
                      type="button"
                      onClick={() => toggleListValue('linkedInsightIds', insight.id)}
                      style={chipStyle(active)}
                    >
                      {insight.title}
                    </button>
                  )
                })
              )}
            </div>
          </Field>

          <Field label="연결할 기능">
            <div style={listBoxStyle}>
              {features.length === 0 ? (
                <span style={emptyStyle}>연결할 Core Feature가 없습니다.</span>
              ) : (
                features.map((feature) => {
                  const active = form.linkedFeatureIds?.includes(feature.id)
                  return (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => toggleListValue('linkedFeatureIds', feature.id)}
                      style={chipStyle(active)}
                    >
                      {feature.title}
                    </button>
                  )
                })
              )}
            </div>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="다음 액션">
              <textarea
                rows={3}
                value={form.nextAction}
                onChange={(event) => setField('nextAction', event.target.value)}
                style={textareaStyle}
              />
            </Field>
            <Field label="상태">
              <select
                value={form.status}
                onChange={(event) => setField('status', event.target.value)}
                style={inputStyle}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={onClose} style={ghostButtonStyle}>
              취소
            </button>
            <button type="submit" disabled={saving} style={primaryButtonStyle}>
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, required = false, children }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#6b6860' }}>
        {label}
        {required ? ' *' : ''}
      </div>
      {children}
    </label>
  )
}

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '8px',
  border: '1px solid rgba(0,0,0,0.12)',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
  lineHeight: 1.6,
}

const listBoxStyle = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  minHeight: '44px',
}

function chipStyle(active) {
  return {
    padding: '6px 12px',
    borderRadius: '999px',
    border: `1px solid ${active ? '#4a7c9e' : 'rgba(0,0,0,0.12)'}`,
    background: active ? 'rgba(74,124,158,0.08)' : 'transparent',
    color: active ? '#4a7c9e' : '#6b6860',
    fontSize: '12px',
    cursor: 'pointer',
  }
}

const emptyStyle = {
  fontSize: '12px',
  color: '#a8a49e',
}

const ghostButtonStyle = {
  padding: '8px 16px',
  borderRadius: '8px',
  border: '1px solid rgba(0,0,0,0.12)',
  background: 'white',
  color: '#6b6860',
  fontSize: '13px',
  cursor: 'pointer',
}

const primaryButtonStyle = {
  padding: '8px 16px',
  borderRadius: '8px',
  border: 'none',
  background: '#4a7c9e',
  color: '#fff',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
}
