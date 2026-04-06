import { useEffect, useState } from 'react'
import {
  createEmptyInsightDraft,
  INSIGHT_PRIORITY_OPTIONS,
  INSIGHT_STATUS_OPTIONS,
  VPC_SECTION_OPTIONS,
} from '../../lib/insights'

export default function InsightNoteModal({
  initialValue,
  onClose,
  onSave,
  saving = false,
}) {
  const [form, setForm] = useState(createEmptyInsightDraft(initialValue))

  useEffect(() => {
    setForm(createEmptyInsightDraft(initialValue))
  }, [initialValue])

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleSection(sectionKey) {
    setForm((prev) => {
      const current = prev.linkedVpcSections || []
      return {
        ...prev,
        linkedVpcSections: current.includes(sectionKey)
          ? current.filter((item) => item !== sectionKey)
          : [...current, sectionKey],
      }
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.title.trim()) return
    await onSave({
      ...form,
      title: form.title.trim(),
      summary: form.summary.trim(),
      evidence: form.evidence.trim(),
      prototypeImplication: form.prototypeImplication.trim(),
      sourceLabel: form.sourceLabel?.trim() || '',
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
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
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
              {initialValue?.id ? '인사이트 수정' : '인사이트 추가'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b6860' }}>
              관찰과 경험을 팀 공용 인사이트로 정리합니다.
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
          <Field label="한 줄 인사이트" required>
            <input
              value={form.title}
              onChange={(event) => setField('title', event.target.value)}
              style={inputStyle}
            />
          </Field>

          <Field label="설명">
            <textarea
              rows={4}
              value={form.summary}
              onChange={(event) => setField('summary', event.target.value)}
              style={textareaStyle}
            />
          </Field>

          <Field label="근거 / 메모">
            <textarea
              rows={4}
              value={form.evidence}
              onChange={(event) => setField('evidence', event.target.value)}
              style={textareaStyle}
            />
          </Field>

          <Field label="VPC 연결">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {VPC_SECTION_OPTIONS.map((option) => {
                const active = form.linkedVpcSections?.includes(option.key)
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => toggleSection(option.key)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '999px',
                      border: `1px solid ${active ? '#a07840' : 'rgba(0,0,0,0.12)'}`,
                      background: active ? 'rgba(160,120,64,0.08)' : 'transparent',
                      color: active ? '#a07840' : '#6b6860',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </Field>

          <Field label="프로토타입 시사점">
            <textarea
              rows={3}
              value={form.prototypeImplication}
              onChange={(event) => setField('prototypeImplication', event.target.value)}
              style={textareaStyle}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="우선순위">
              <select
                value={form.priority}
                onChange={(event) => setField('priority', event.target.value)}
                style={inputStyle}
              >
                {INSIGHT_PRIORITY_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="상태">
              <select
                value={form.status}
                onChange={(event) => setField('status', event.target.value)}
                style={inputStyle}
              >
                {INSIGHT_STATUS_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="출처 라벨">
            <input
              value={form.sourceLabel}
              onChange={(event) => setField('sourceLabel', event.target.value)}
              style={inputStyle}
            />
          </Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
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
  background: '#a07840',
  color: '#fff',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
}
