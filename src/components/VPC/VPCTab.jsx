import { useState, useEffect } from 'react'
import { auth } from '../../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { getVpcItems, addVpcItem, deleteVpcItem, getCoreFeatures, addCoreFeature, updateCoreFeature, deleteCoreFeature } from '../../lib/firestore'
import { isTeamMember } from '../../lib/teamEmails'

const PAIRS = [
  {
    left:  { key: 'jobs',      label: 'Jobs',                desc: '해야 할 일' },
    right: { key: 'products',  label: 'Products & Services', desc: '제품/서비스' },
    color: '#4a7c9e',
  },
  {
    left:  { key: 'pains',     label: 'Pains',               desc: '고통' },
    right: { key: 'relievers', label: 'Pain Relievers',      desc: '고통 해소' },
    color: '#9e4a4a',
  },
  {
    left:  { key: 'gains',     label: 'Gains',               desc: '원하는 것' },
    right: { key: 'creators',  label: 'Gain Creators',       desc: '이익 창출' },
    color: '#4a9e6a',
  },
]

function SectionCard({ section, color, items, inputMap, setInputMap, onAdd, onDelete, canEdit }) {
  return (
    <div style={{
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: '8px',
      padding: '14px',
      background: '#fafaf9',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color }}>
          {section.label}
        </span>
        <span style={{ fontSize: '11px', color: '#a8a49e' }}>
          — {section.desc}
        </span>
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '6px',
        marginBottom: items.length > 0 ? '10px' : 0,
      }}>
        {items.map((item) => (
          <span key={item.id} style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: `${color}14`,
            border: `1px solid ${color}30`,
            color,
            fontSize: '12px', padding: '3px 8px', borderRadius: '20px',
          }}>
            {item.text}
            {canEdit && (
              <button
                onClick={() => onDelete(item.id)}
                style={{
                  background: 'none', border: 'none', padding: '0 0 0 2px',
                  cursor: 'pointer', color, fontSize: '13px',
                  lineHeight: 1, opacity: 0.6,
                }}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {items.length === 0 && (
          <span style={{ fontSize: '12px', color: '#c8c4be', fontStyle: 'italic' }}>
            아직 항목 없음
          </span>
        )}
      </div>

      {canEdit && (
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            value={inputMap[section.key] || ''}
            onChange={(e) => setInputMap((prev) => ({ ...prev, [section.key]: e.target.value }))}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd(section.key) } }}
            placeholder="항목 추가 후 Enter"
            style={{
              flex: 1, padding: '5px 8px', borderRadius: '5px',
              border: '1px solid rgba(0,0,0,0.12)', fontSize: '12px',
              outline: 'none', fontFamily: 'inherit',
            }}
          />
          <button
            onClick={() => onAdd(section.key)}
            style={{
              padding: '5px 10px', borderRadius: '5px',
              border: 'none', background: color,
              color: 'white', fontSize: '12px', cursor: 'pointer',
            }}
          >
            +
          </button>
        </div>
      )}
    </div>
  )
}

export default function VPCTab() {
  const [user, setUser] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [inputMap, setInputMap] = useState({})
  const [vpcOpen, setVpcOpen] = useState(false)
  const [cfOpen, setCfOpen] = useState(false)
  const [features, setFeatures] = useState([])
  const [cfLoading, setCfLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', description: '' })
  const [newForm, setNewForm] = useState({ title: '', description: '' })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, setUser)
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await getVpcItems()
      setItems(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleAdd = async (sectionKey) => {
    const text = (inputMap[sectionKey] || '').trim()
    if (!text) return
    try {
      await addVpcItem(sectionKey, text)
      setInputMap((prev) => ({ ...prev, [sectionKey]: '' }))
      await load()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteVpcItem(id)
      await load()
    } catch (e) {
      console.error(e)
    }
  }

  const loadFeatures = async () => {
    setCfLoading(true)
    try {
      const data = await getCoreFeatures()
      setFeatures(data)
    } catch (e) {
      console.error(e)
    } finally {
      setCfLoading(false)
    }
  }

  const handleCfOpen = () => {
    setCfOpen(true)
    loadFeatures()
  }

  const handleCfDelete = async (id) => {
    try {
      await deleteCoreFeature(id)
      await loadFeatures()
    } catch (e) {
      console.error(e)
    }
  }

  const handleEditStart = (feature) => {
    setEditingId(feature.id)
    setEditForm({ title: feature.title, description: feature.description })
  }

  const handleEditSave = async () => {
    if (!editForm.title.trim()) return
    try {
      await updateCoreFeature(editingId, { title: editForm.title.trim(), description: editForm.description.trim() })
      setEditingId(null)
      await loadFeatures()
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddFeature = async () => {
    if (!newForm.title.trim()) return
    try {
      await addCoreFeature(newForm.title.trim(), newForm.description.trim(), features.length + 1)
      setNewForm({ title: '', description: '' })
      setAdding(false)
      await loadFeatures()
    } catch (e) {
      console.error(e)
    }
  }

  const getItemsBySection = (key) => items.filter((i) => i.section === key)
  const canEdit = isTeamMember(user)

  if (loading) {
    return <p style={{ color: '#a8a49e', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>불러오는 중...</p>
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1916', margin: '0 0 6px' }}>
          Value Proposition Canvas
        </h2>
        <p style={{ fontSize: '14px', color: '#6b6860', margin: 0 }}>
          UX 분석이 진행되면서 계속 업데이트되는 문서입니다.
          {canEdit && ' 항목을 추가하거나 삭제할 수 있습니다.'}
        </p>
      </div>

      {/* 버튼 행 */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setVpcOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '6px', padding: '7px 12px',
            cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            color: '#4a5568', fontFamily: 'inherit',
          }}
        >
          ✅ VPC란?
        </button>
        <button
          onClick={handleCfOpen}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '6px', padding: '7px 12px',
            cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            color: '#4a5568', fontFamily: 'inherit',
          }}
        >
          🛠 핵심 기능
        </button>
      </div>

      {/* 핵심 기능 모달 */}
      {cfOpen && (
        <div
          onClick={() => { setCfOpen(false); setEditingId(null); setAdding(false) }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px 28px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              fontSize: '13px',
              lineHeight: '1.7',
              color: '#3d3b38',
              position: 'relative',
            }}
          >
            {/* 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1a1916' }}>🛠 핵심 기능</h3>
              <button
                onClick={() => { setCfOpen(false); setEditingId(null); setAdding(false) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#a8a49e', lineHeight: 1, padding: '0 4px' }}
              >×</button>
            </div>

            {/* 기능 카드 목록 */}
            {cfLoading ? (
              <p style={{ color: '#a8a49e', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>불러오는 중...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {features.map((f, idx) => (
                  <div key={f.id} style={{
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    background: '#fafaf9',
                  }}>
                    {editingId === f.id ? (
                      /* 편집 모드 */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          value={editForm.title}
                          onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                          placeholder="기능 제목"
                          style={{ padding: '6px 8px', borderRadius: '5px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '13px', fontFamily: 'inherit', fontWeight: 600 }}
                        />
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                          placeholder="세부 내용"
                          rows={3}
                          style={{ padding: '6px 8px', borderRadius: '5px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '12px', fontFamily: 'inherit', resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={handleEditSave} style={{ padding: '5px 12px', borderRadius: '5px', border: 'none', background: '#4a7c9e', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>저장</button>
                          <button onClick={() => setEditingId(null)} style={{ padding: '5px 12px', borderRadius: '5px', border: '1px solid rgba(0,0,0,0.1)', background: 'none', fontSize: '12px', cursor: 'pointer' }}>취소</button>
                        </div>
                      </div>
                    ) : (
                      /* 보기 모드 */
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontSize: '11px', color: '#a8a49e', marginBottom: '2px' }}>기능 {idx + 1}</div>
                          {canEdit && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => handleEditStart(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#a8a49e', padding: '0' }}>편집</button>
                              <button onClick={() => handleCfDelete(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#c0392b', padding: '0' }}>삭제</button>
                            </div>
                          )}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1a1916', marginBottom: '4px' }}>{f.title}</div>
                        <div style={{ fontSize: '12px', color: '#6b6860', whiteSpace: 'pre-wrap' }}>{f.description || '세부 내용 없음'}</div>
                      </div>
                    )}
                  </div>
                ))}

                {features.length === 0 && !cfLoading && (
                  <p style={{ color: '#c8c4be', fontSize: '13px', textAlign: 'center', fontStyle: 'italic', padding: '12px 0' }}>
                    아직 등록된 핵심 기능이 없습니다.
                  </p>
                )}
              </div>
            )}

            {/* 기능 추가 */}
            {canEdit && (
              adding ? (
                <div style={{ border: '1px dashed rgba(0,0,0,0.15)', borderRadius: '8px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    value={newForm.title}
                    onChange={(e) => setNewForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="기능 제목"
                    autoFocus
                    style={{ padding: '6px 8px', borderRadius: '5px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '13px', fontFamily: 'inherit', fontWeight: 600 }}
                  />
                  <textarea
                    value={newForm.description}
                    onChange={(e) => setNewForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="세부 내용"
                    rows={3}
                    style={{ padding: '6px 8px', borderRadius: '5px', border: '1px solid rgba(0,0,0,0.15)', fontSize: '12px', fontFamily: 'inherit', resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={handleAddFeature} style={{ padding: '5px 12px', borderRadius: '5px', border: 'none', background: '#4a7c9e', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>추가</button>
                    <button onClick={() => { setAdding(false); setNewForm({ title: '', description: '' }) }} style={{ padding: '5px 12px', borderRadius: '5px', border: '1px solid rgba(0,0,0,0.1)', background: 'none', fontSize: '12px', cursor: 'pointer' }}>취소</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '8px',
                    border: '1px dashed rgba(0,0,0,0.15)', background: 'none',
                    fontSize: '13px', color: '#a8a49e', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  + 기능 추가
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* VPC란? 모달 */}
      {vpcOpen && (
        <div
          onClick={() => setVpcOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px 28px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              fontSize: '13px',
              lineHeight: '1.7',
              color: '#3d3b38',
              position: 'relative',
            }}
          >
            {/* 모달 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1a1916' }}>VPC란?</h3>
              <button
                onClick={() => setVpcOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '20px', color: '#a8a49e', lineHeight: 1, padding: '0 4px',
                }}
              >
                ×
              </button>
            </div>

            {/* 한 줄 정의 */}
            <p style={{ margin: '0 0 14px', fontWeight: 600, fontSize: '14px', color: '#1a1916' }}>
              "우리가 만드는 것이 사용자가 진짜 원하는 것인가?"를 확인하는 도구입니다.
            </p>
            <p style={{ margin: '0 0 16px', color: '#6b6860' }}>
              VPC(Value Proposition Canvas)는 제품·서비스를 만들기 전에 <strong>사용자의 상황</strong>과 <strong>우리가 제공하는 것</strong>이 서로 맞는지 시각적으로 정리하는 프레임워크입니다.
              왼쪽(Customer Profile)은 사용자를 이해하는 칸, 오른쪽(Value Proposition)은 우리 솔루션을 기술하는 칸입니다.
              두 쪽이 잘 대응될수록 좋은 제품에 가깝다고 봅니다.
            </p>

            {/* 구조 설명 */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#1a1916' }}>각 항목 설명</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { label: 'Jobs', side: 'Customer Profile', desc: '사용자가 이루려는 목표나 해결하려는 문제', color: '#4a7c9e' },
                  { label: 'Products & Services', side: 'Value Proposition', desc: '우리가 제공하는 기능·서비스 목록', color: '#4a7c9e' },
                  { label: 'Pains', side: 'Customer Profile', desc: '목표를 달성하는 과정에서 겪는 불편·장애물', color: '#9e4a4a' },
                  { label: 'Pain Relievers', side: 'Value Proposition', desc: '그 불편을 줄여주는 방법', color: '#9e4a4a' },
                  { label: 'Gains', side: 'Customer Profile', desc: '사용자가 기대하는 긍정적인 결과나 혜택', color: '#4a9e6a' },
                  { label: 'Gain Creators', side: 'Value Proposition', desc: '그 기대를 충족시켜주는 방법', color: '#4a9e6a' },
                ].map(({ label, side, desc, color }) => (
                  <div key={label} style={{
                    padding: '16px 18px', borderRadius: '6px',
                    background: `${color}0d`, border: `1px solid ${color}25`,
                  }}>
                    <div style={{ fontSize: '11px', color: '#a8a49e', marginBottom: '2px' }}>{side}</div>
                    <div style={{ fontWeight: 700, color, marginBottom: '3px', fontSize: '13px' }}>{label}</div>
                    <div style={{ fontSize: '12px', color: '#6b6860' }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 사용법 */}
            <div style={{ marginBottom: '18px', padding: '18px', background: '#f9f8f7', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#1a1916' }}>어떻게 쓰나요?</p>
              <ol style={{ margin: 0, paddingLeft: '18px', color: '#6b6860', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>인터뷰·관찰 등 리서치에서 발굴한 내용을 <strong>Jobs / Pains / Gains</strong>에 추가합니다.</li>
                <li>우리 아이디어나 기능을 <strong>Products & Services / Pain Relievers / Gain Creators</strong>에 작성합니다.</li>
                <li>왼쪽의 Pains ↔ Pain Relievers, Gains ↔ Gain Creators가 잘 대응되는지 확인합니다.</li>
                <li>대응이 잘 될수록 사용자에게 실제로 가치 있는 제품입니다. 맞지 않는 항목은 방향을 수정합니다.</li>
              </ol>
            </div>

            {/* 예시 */}
            <div style={{ padding: '18px', background: '#f9f8f7', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#1a1916' }}>이 프로젝트 예시</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
                {[
                  { label: 'Jobs 예시', items: ['시험 기간 집중력 유지하기', '과제 마감 지키기'], color: '#4a7c9e' },
                  { label: 'Products & Services 예시', items: ['코스터디 매칭 앱', '실시간 공부 현황 공유'], color: '#4a7c9e' },
                  { label: 'Pains 예시', items: ['혼자 하면 의지가 약해짐', '공부 파트너 찾기 어려움'], color: '#9e4a4a' },
                  { label: 'Pain Relievers 예시', items: ['같은 목표를 가진 파트너 매칭', '스터디 일정 알림'], color: '#9e4a4a' },
                  { label: 'Gains 예시', items: ['끝냈을 때 성취감', '비슷한 목표를 가진 사람과의 연결감'], color: '#4a9e6a' },
                  { label: 'Gain Creators 예시', items: ['공부 인증·진도 공유', '완료 시 팀원에게 알림'], color: '#4a9e6a' },
                ].map(({ label, items: exItems, color }) => (
                  <div key={label} style={{
                    padding: '14px 16px', borderRadius: '6px',
                    background: `${color}08`, border: `1px solid ${color}20`,
                  }}>
                    <div style={{ fontWeight: 600, color, marginBottom: '4px', fontSize: '11px' }}>{label}</div>
                    {exItems.map((t) => (
                      <div key={t} style={{ color: '#6b6860', marginBottom: '2px' }}>· {t}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 행 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 48px 1fr',
        gap: '12px',
        marginBottom: '8px',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#a8a49e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Customer Profile
        </div>
        <div />
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#a8a49e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Value Proposition
        </div>
      </div>

      {/* 페어 행들 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {PAIRS.map((pair) => (
          <div
            key={pair.left.key}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 48px 1fr',
              gap: '12px',
              alignItems: 'start',
            }}
          >
            <SectionCard
              section={pair.left}
              color={pair.color}
              items={getItemsBySection(pair.left.key)}
              inputMap={inputMap}
              setInputMap={setInputMap}
              onAdd={handleAdd}
              onDelete={handleDelete}
              canEdit={canEdit}
            />

            {/* 연결 표시 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '14px',
              fontSize: '16px',
              color: `${pair.color}80`,
              userSelect: 'none',
            }}>
              ↔
            </div>

            <SectionCard
              section={pair.right}
              color={pair.color}
              items={getItemsBySection(pair.right.key)}
              inputMap={inputMap}
              setInputMap={setInputMap}
              onAdd={handleAdd}
              onDelete={handleDelete}
              canEdit={canEdit}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
