import { useState, useEffect } from 'react'
import { auth } from '../../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { getExperiences, addExperience, deleteExperience } from '../../lib/firestore'
import { isTeamMember } from '../../lib/teamEmails'
import ExperienceInsights from './ExperienceInsights'

const EMPTY_FORM = { author: '', situation: '', action: '', result: '', insight: '' }

const FIELD_LABELS = {
  author: '작성자',
  situation: '상황 (어떤 과목/맥락)',
  action: '행동 (어떻게 공부했나)',
  result: '결과 (잘 됐나 안 됐나)',
  insight: '인사이트 (왜 그랬을 것 같나)',
}

export default function ExperienceTab() {
  const [user, setUser] = useState(null)
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, setUser)
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await getExperiences()
      setExperiences(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.author || !form.situation) return
    setSaving(true)
    try {
      await addExperience(form)
      setForm(EMPTY_FORM)
      setShowForm(false)
      await load()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('삭제할까요?')) return
    try {
      await deleteExperience(id)
      await load()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      {/* 헤더 */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1916', margin: '0 0 6px' }}>
            팀원 학습 경험
          </h2>
          <p style={{ fontSize: '14px', color: '#6b6860', margin: 0 }}>
            AI와 함께 공부했던 경험을 기록합니다. 잘 됐든 안 됐든.
          </p>
        </div>
        {isTeamMember(user) && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              flexShrink: 0, padding: '6px 16px', borderRadius: '6px',
              border: 'none', background: '#a07840', color: 'white',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            }}
          >
            + 경험 추가
          </button>
        )}
      </div>

      {/* 패턴 분석 인사이트 */}
      <ExperienceInsights />

      {/* 카드 목록 */}
      {loading ? (
        <p style={{ color: '#a8a49e', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>불러오는 중...</p>
      ) : experiences.length === 0 ? (
        <p style={{ color: '#a8a49e', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>
          아직 기록된 경험이 없습니다. 첫 번째로 기록해보세요.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '12px',
        }}>
          {experiences.map((exp) => (
            <div key={exp.id} style={{
              background: '#fafaf9', border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '10px', padding: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{
                  fontSize: '13px', fontWeight: 600, color: '#1a1916',
                }}>
                  {exp.author}
                </span>
                {isTeamMember(user) && (
                  <button
                    onClick={() => handleDelete(exp.id)}
                    style={{
                      background: 'none', border: 'none', fontSize: '12px',
                      color: '#a8a49e', cursor: 'pointer', padding: '2px 6px',
                    }}
                  >
                    삭제
                  </button>
                )}
              </div>
              {['situation', 'action', 'result', 'insight'].map((field) => (
                exp[field] ? (
                  <div key={field} style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#a07840', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {FIELD_LABELS[field]}
                    </div>
                    <div style={{ fontSize: '13px', color: '#3d3a34', lineHeight: '1.5' }}>
                      {exp[field]}
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 추가 모달 */}
      {showForm && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, padding: '16px',
          }}
        >
          <div style={{
            background: 'white', borderRadius: '12px', padding: '24px',
            width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1916', margin: 0 }}>경험 추가</h2>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#a8a49e', cursor: 'pointer', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(FIELD_LABELS).map(([field, label]) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b6860', marginBottom: '4px' }}>
                    {label}{field === 'author' || field === 'situation' ? ' *' : ''}
                  </label>
                  {field === 'author' ? (
                    <input
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      required
                      style={{
                        width: '100%', padding: '8px 10px', borderRadius: '6px',
                        border: '1px solid rgba(0,0,0,0.12)', fontSize: '13px',
                        outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  ) : (
                    <textarea
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      required={field === 'situation'}
                      rows={2}
                      style={{
                        width: '100%', padding: '8px 10px', borderRadius: '6px',
                        border: '1px solid rgba(0,0,0,0.12)', fontSize: '13px',
                        outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                        fontFamily: 'inherit',
                      }}
                    />
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '7px 16px', borderRadius: '6px',
                    border: '1px solid rgba(0,0,0,0.12)', background: 'white',
                    fontSize: '13px', color: '#6b6860', cursor: 'pointer',
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '7px 16px', borderRadius: '6px',
                    border: 'none', background: '#a07840', color: 'white',
                    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
