import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import {
  addExperience,
  addInsightNote,
  deleteExperience,
  getExperiences,
} from '../../lib/firestore'
import { isTeamMember } from '../../lib/teamEmails'
import { buildExperienceInsightDraft } from '../../lib/insights'
import ExperienceInsights from './ExperienceInsights'
import InsightNoteModal from '../Insights/InsightNoteModal'

const EMPTY_FORM = {
  author: '',
  situation: '',
  action: '',
  result: '',
  insight: '',
}

const FIELD_LABELS = {
  author: '작성자',
  situation: '상황',
  action: '어떻게 활용했는가',
  result: '결과',
  insight: '인사이트',
}

export default function ExperienceTab() {
  const [user, setUser] = useState(null)
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [insightDraft, setInsightDraft] = useState(null)
  const [savingInsight, setSavingInsight] = useState(false)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  async function load() {
    setLoading(true)
    try {
      const data = await getExperiences()
      setExperiences(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.author.trim() || !form.situation.trim()) return
    setSaving(true)
    try {
      await addExperience(form)
      setForm(EMPTY_FORM)
      setShowForm(false)
      await load()
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('이 경험을 삭제할까요?')) return
    try {
      await deleteExperience(id)
      await load()
    } catch (error) {
      console.error(error)
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

  const canEdit = isTeamMember(user)

  return (
    <div>
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1916', margin: '0 0 6px' }}>
            Our Experience
          </h2>
          <p style={{ fontSize: '14px', color: '#6b6860', margin: 0 }}>
            팀원이 실제로 AI를 학습에 활용했던 경험을 기록하고, 이후 인사이트로 연결합니다.
          </p>
        </div>
        {canEdit && (
          <button onClick={() => setShowForm(true)} style={primaryButtonStyle}>
            + 경험 추가
          </button>
        )}
      </div>

      <ExperienceInsights />

      {loading ? (
        <p style={emptyStyle}>불러오는 중...</p>
      ) : experiences.length === 0 ? (
        <p style={emptyStyle}>아직 기록된 경험이 없습니다.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '12px',
          }}
        >
          {experiences.map((experience) => (
            <article
              key={experience.id}
              style={{
                background: '#fafaf9',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '10px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1916' }}>
                  {experience.author}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {canEdit && experience.insight && (
                    <button
                      onClick={() => setInsightDraft(buildExperienceInsightDraft(experience))}
                      style={linkButtonStyle}
                    >
                      인사이트로 저장
                    </button>
                  )}
                  {canEdit && (
                    <button onClick={() => handleDelete(experience.id)} style={deleteButtonStyle}>
                      삭제
                    </button>
                  )}
                </div>
              </div>

              {['situation', 'action', 'result', 'insight'].map((field) =>
                experience[field] ? (
                  <div key={field} style={{ marginBottom: '10px' }}>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#a07840',
                        marginBottom: '3px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {FIELD_LABELS[field]}
                    </div>
                    <div style={{ fontSize: '13px', color: '#3d3a34', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {experience[field]}
                    </div>
                  </div>
                ) : null,
              )}
            </article>
          ))}
        </div>
      )}

      {showForm && (
        <div
          onClick={(event) => {
            if (event.target === event.currentTarget) setShowForm(false)
          }}
          style={overlayStyle}
        >
          <div style={modalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1916', margin: 0 }}>경험 추가</h2>
              <button onClick={() => setShowForm(false)} style={closeButtonStyle}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(FIELD_LABELS).map(([field, label]) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b6860', marginBottom: '4px' }}>
                    {label}
                    {field === 'author' || field === 'situation' ? ' *' : ''}
                  </label>
                  {field === 'author' ? (
                    <input
                      value={form[field]}
                      onChange={(event) => setForm({ ...form, [field]: event.target.value })}
                      required
                      style={inputStyle}
                    />
                  ) : (
                    <textarea
                      value={form[field]}
                      onChange={(event) => setForm({ ...form, [field]: event.target.value })}
                      required={field === 'situation'}
                      rows={3}
                      style={textareaStyle}
                    />
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowForm(false)} style={secondaryButtonStyle}>
                  취소
                </button>
                <button type="submit" disabled={saving} style={primaryButtonStyle}>
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {insightDraft && (
        <InsightNoteModal
          initialValue={insightDraft}
          onClose={() => setInsightDraft(null)}
          onSave={handleSaveInsight}
          saving={savingInsight}
        />
      )}
    </div>
  )
}

const emptyStyle = {
  color: '#a8a49e',
  fontSize: '14px',
  textAlign: 'center',
  padding: '40px 0',
}

const primaryButtonStyle = {
  flexShrink: 0,
  padding: '7px 16px',
  borderRadius: '8px',
  border: 'none',
  background: '#a07840',
  color: 'white',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
}

const secondaryButtonStyle = {
  padding: '7px 16px',
  borderRadius: '8px',
  border: '1px solid rgba(0,0,0,0.12)',
  background: 'white',
  color: '#6b6860',
  fontSize: '13px',
  cursor: 'pointer',
}

const linkButtonStyle = {
  border: 'none',
  background: 'none',
  color: '#a07840',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  padding: 0,
}

const deleteButtonStyle = {
  border: 'none',
  background: 'none',
  color: '#a8a49e',
  fontSize: '12px',
  cursor: 'pointer',
  padding: 0,
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  padding: '16px',
}

const modalStyle = {
  background: 'white',
  borderRadius: '12px',
  padding: '24px',
  width: '100%',
  maxWidth: '560px',
  maxHeight: '90vh',
  overflowY: 'auto',
}

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '22px',
  color: '#a8a49e',
  cursor: 'pointer',
  lineHeight: 1,
}

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '8px',
  border: '1px solid rgba(0,0,0,0.12)',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
}

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
  fontFamily: 'inherit',
  lineHeight: 1.6,
}
