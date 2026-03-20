import { useState, useEffect } from 'react'
import { auth } from '../../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { getObservations } from '../../lib/firestore'
import { isTeamMember } from '../../lib/teamEmails'
import ObsCard from '../ObsCard'
import ObsForm from '../ObsForm'

const SCENARIOS = ['전체', '준환(AIDS)', 'T2', 'T3', 'T4', 'T5']

export default function ServiceUXTab() {
  const [user, setUser] = useState(null)
  const [observations, setObservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterScenario, setFilterScenario] = useState('전체')
  const [filterService, setFilterService] = useState('전체')

  useEffect(() => {
    return onAuthStateChanged(auth, setUser)
  }, [])

  const loadObs = async () => {
    setLoading(true)
    try {
      const data = await getObservations()
      setObservations(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadObs()
  }, [])

  const filtered = observations.filter((o) => {
    if (filterScenario !== '전체' && o.scenario !== filterScenario) return false
    if (filterService !== '전체' && o.service !== filterService) return false
    return true
  })

  const uniqueServices = [...new Set(observations.map((o) => o.service).filter(Boolean))]
  const serviceCount = uniqueServices.length

  return (
    <div>
      {/* 헤더 영역 */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1916', margin: '0 0 6px' }}>
          AI 학습 서비스 UX 분석
        </h2>
        <p style={{ fontSize: '14px', color: '#6b6860', margin: '0 0 12px' }}>
          AI 학습 서비스의 UX를 직접 사용해보며 관찰한 내용을 기록합니다.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{
            fontSize: '12px', fontFamily: 'JetBrains Mono, monospace',
            background: '#f0ede8', color: '#6b6860',
            padding: '3px 10px', borderRadius: '20px',
          }}>
            관찰 {observations.length}건
          </span>
          <span style={{
            fontSize: '12px', fontFamily: 'JetBrains Mono, monospace',
            background: '#f0ede8', color: '#6b6860',
            padding: '3px 10px', borderRadius: '20px',
          }}>
            서비스 {serviceCount}개
          </span>
        </div>
      </div>

      {/* 필터 + 작성 버튼 */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '8px',
        alignItems: 'center', marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {SCENARIOS.map((s) => (
            <button
              key={s}
              onClick={() => setFilterScenario(s)}
              style={{
                padding: '4px 12px', borderRadius: '20px',
                border: `1px solid ${filterScenario === s ? '#a07840' : 'rgba(0,0,0,0.1)'}`,
                background: filterScenario === s ? 'rgba(160,120,64,0.08)' : 'transparent',
                color: filterScenario === s ? '#a07840' : '#6b6860',
                fontSize: '12px', cursor: 'pointer',
                fontWeight: filterScenario === s ? 600 : 400,
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <select
          value={filterService}
          onChange={(e) => setFilterService(e.target.value)}
          style={{
            padding: '4px 10px', borderRadius: '6px',
            border: '1px solid rgba(0,0,0,0.1)',
            background: '#f8f7f5', fontSize: '12px',
            color: '#6b6860', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="전체">전체 서비스</option>
          {uniqueServices.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        {isTeamMember(user) && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              marginLeft: 'auto', padding: '6px 16px', borderRadius: '6px',
              border: 'none', background: '#a07840', color: 'white',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            }}
          >
            + 새 관찰 작성
          </button>
        )}
      </div>

      {/* 카드 목록 */}
      {loading ? (
        <p style={{ color: '#a8a49e', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>불러오는 중...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#a8a49e', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>
          {observations.length === 0 ? '아직 관찰 기록이 없습니다.' : '해당 조건의 관찰이 없습니다.'}
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px',
        }}>
          {filtered.map((obs) => <ObsCard key={obs.id} obs={obs} />)}
        </div>
      )}

      {/* 작성 모달 */}
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
            width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1916', margin: 0 }}>새 관찰 작성</h2>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#a8a49e', cursor: 'pointer', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <ObsForm
              onSaved={() => { setShowForm(false); loadObs() }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
