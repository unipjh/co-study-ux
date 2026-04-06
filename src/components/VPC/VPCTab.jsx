import { useCallback, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import {
  addCoreFeature,
  addInsightNote,
  addVpcItem,
  deleteCoreFeature,
  deleteInsightNote,
  deleteVpcItem,
  getCoreFeatures,
  getInsightNotes,
  getVpcItems,
  getVpcPairNotes,
  updateCoreFeature,
  updateInsightNote,
  upsertVpcPairNote,
} from '../../lib/firestore'
import { isTeamMember } from '../../lib/teamEmails'
import InsightHub from '../Insights/InsightHub'
import InsightNoteModal from '../Insights/InsightNoteModal'

const PAIRS = [
  {
    key: 'jobs-products',
    left: { key: 'jobs', label: 'Jobs', desc: '사용자가 이루고 싶은 목표' },
    right: { key: 'products', label: 'Products & Services', desc: '우리가 제공할 기능과 경험' },
    color: '#4a7c9e',
  },
  {
    key: 'pains-relievers',
    left: { key: 'pains', label: 'Pains', desc: '사용자가 겪는 문제와 막힘' },
    right: { key: 'relievers', label: 'Pain Relievers', desc: '그 문제를 줄이는 방법' },
    color: '#9e4a4a',
  },
  {
    key: 'gains-creators',
    left: { key: 'gains', label: 'Gains', desc: '사용자가 기대하는 긍정적 변화' },
    right: { key: 'creators', label: 'Gain Creators', desc: '그 가치를 더 키우는 방식' },
    color: '#4a9e6a',
  },
]

function SectionCard({ section, color, items, inputMap, setInputMap, onAdd, onDelete, canEdit }) {
  return (
    <div
      style={{
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '10px',
        padding: '14px',
        background: '#fafaf9',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color }}>{section.label}</span>
        <span style={{ fontSize: '11px', color: '#a8a49e' }}>{section.desc}</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: items.length > 0 ? '10px' : 0 }}>
        {items.map((item) => (
          <span
            key={item.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: `${color}14`,
              border: `1px solid ${color}30`,
              color,
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '999px',
            }}
          >
            {item.text}
            {canEdit && (
              <button onClick={() => onDelete(item.id)} style={chipDeleteStyle(color)}>
                ×
              </button>
            )}
          </span>
        ))}
        {items.length === 0 && <span style={emptyChipStyle}>아직 항목이 없습니다</span>}
      </div>

      {canEdit && (
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            value={inputMap[section.key] || ''}
            onChange={(event) => setInputMap((prev) => ({ ...prev, [section.key]: event.target.value }))}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onAdd(section.key)
              }
            }}
            placeholder="항목 추가 후 Enter"
            style={sectionInputStyle}
          />
          <button onClick={() => onAdd(section.key)} style={sectionAddButtonStyle(color)}>
            +
          </button>
        </div>
      )}
    </div>
  )
}

function PairMemoCard({
  pair,
  draft,
  setDraft,
  onSave,
  saving,
  canEdit,
  relatedInsights,
  isOpen,
  onToggle,
}) {
  const hasContent = Boolean(
    draft.whyThisMatters?.trim() || draft.designDirection?.trim() || draft.openQuestion?.trim(),
  )

  return (
    <div
      style={{
        gridColumn: '1 / -1',
        border: `1px solid ${pair.color}22`,
        borderRadius: '10px',
        background: `${pair.color}08`,
        padding: '14px',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: pair.color }}>
              Synthesis Memo
            </div>
            {hasContent && <span style={memoStateStyle(pair.color)}>작성됨</span>}
            <span style={memoCountStyle}>인사이트 {relatedInsights.length}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#6b6860', marginTop: '4px' }}>
            {pair.left.label}와 {pair.right.label} 사이의 해석과 방향성을 정리합니다.
          </div>
        </div>
        <span
          style={{
            flexShrink: 0,
            fontSize: '16px',
            lineHeight: 1,
            color: pair.color,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.18s ease',
            marginTop: '2px',
          }}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px', marginBottom: '12px' }}>
            {relatedInsights.length === 0 ? (
              <span style={memoTagStyle}>연결된 인사이트 없음</span>
            ) : (
              relatedInsights.map((insight) => (
                <span key={insight.id} style={memoTagStyle}>
                  {insight.title}
                </span>
              ))
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            <MemoField
              label="왜 중요한가"
              value={draft.whyThisMatters}
              onChange={(value) => setDraft((prev) => ({ ...prev, whyThisMatters: value }))}
              disabled={!canEdit}
            />
            <MemoField
              label="현재 방향성"
              value={draft.designDirection}
              onChange={(value) => setDraft((prev) => ({ ...prev, designDirection: value }))}
              disabled={!canEdit}
            />
            <MemoField
              label="남은 질문"
              value={draft.openQuestion}
              onChange={(value) => setDraft((prev) => ({ ...prev, openQuestion: value }))}
              disabled={!canEdit}
            />
          </div>

          {canEdit && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button onClick={onSave} style={sectionAddButtonStyle(pair.color)} disabled={saving}>
                {saving ? '저장 중...' : '메모 저장'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function MemoField({ label, value, onChange, disabled }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#6b6860' }}>{label}</div>
      <textarea
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: '8px',
          border: '1px solid rgba(0,0,0,0.12)',
          fontSize: '13px',
          fontFamily: 'inherit',
          lineHeight: 1.6,
          resize: 'vertical',
          outline: 'none',
          background: disabled ? 'rgba(255,255,255,0.6)' : 'white',
          boxSizing: 'border-box',
        }}
      />
    </label>
  )
}

export default function VPCTab() {
  const [user, setUser] = useState(null)
  const [items, setItems] = useState([])
  const [insights, setInsights] = useState([])
  const [pairDrafts, setPairDrafts] = useState({})
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
  const [insightDraft, setInsightDraft] = useState(null)
  const [savingInsight, setSavingInsight] = useState(false)
  const [savingPairKey, setSavingPairKey] = useState('')
  const [openPairKeys, setOpenPairKeys] = useState({})

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  const canEdit = isTeamMember(user)

  const safeRead = useCallback(async (loader, fallback) => {
    try {
      return await loader()
    } catch (error) {
      console.error(error)
      return fallback
    }
  }, [])

  const loadVpcData = useCallback(async () => {
    setLoading(true)
    try {
      const vpcItems = await getVpcItems()
      const [insightNotes, pairNoteDocs] = await Promise.all([
        safeRead(getInsightNotes, []),
        safeRead(getVpcPairNotes, []),
      ])

      const pairNoteMap = Object.fromEntries(pairNoteDocs.map((note) => [note.pairKey, note]))

      setItems(vpcItems)
      setInsights(insightNotes)
      setPairDrafts(
        Object.fromEntries(
          PAIRS.map((pair) => [
            pair.key,
            {
              whyThisMatters: pairNoteMap[pair.key]?.whyThisMatters || '',
              designDirection: pairNoteMap[pair.key]?.designDirection || '',
              openQuestion: pairNoteMap[pair.key]?.openQuestion || '',
            },
          ]),
        ),
      )
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [safeRead])

  useEffect(() => {
    loadVpcData()
  }, [loadVpcData])

  async function loadFeatures() {
    setCfLoading(true)
    try {
      const data = await safeRead(getCoreFeatures, [])
      setFeatures(data)
    } finally {
      setCfLoading(false)
    }
  }

  async function handleAdd(sectionKey) {
    const text = (inputMap[sectionKey] || '').trim()
    if (!text) return
    try {
      await addVpcItem(sectionKey, text)
      setInputMap((prev) => ({ ...prev, [sectionKey]: '' }))
      await loadVpcData()
    } catch (error) {
      console.error(error)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteVpcItem(id)
      await loadVpcData()
    } catch (error) {
      console.error(error)
    }
  }

  function handleCfOpen() {
    setCfOpen(true)
    loadFeatures()
  }

  async function handleCfDelete(id) {
    try {
      await deleteCoreFeature(id)
      await loadFeatures()
    } catch (error) {
      console.error(error)
    }
  }

  function handleEditStart(feature) {
    setEditingId(feature.id)
    setEditForm({ title: feature.title, description: feature.description })
  }

  async function handleEditSave() {
    if (!editForm.title.trim()) return
    try {
      await updateCoreFeature(editingId, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
      })
      setEditingId(null)
      await loadFeatures()
    } catch (error) {
      console.error(error)
    }
  }

  async function handleAddFeature() {
    if (!newForm.title.trim()) return
    try {
      await addCoreFeature(newForm.title.trim(), newForm.description.trim(), features.length + 1)
      setNewForm({ title: '', description: '' })
      setAdding(false)
      await loadFeatures()
    } catch (error) {
      console.error(error)
    }
  }

  async function handleSaveInsight(payload) {
    setSavingInsight(true)
    try {
      if (insightDraft?.id) {
        await updateInsightNote(insightDraft.id, payload)
      } else {
        await addInsightNote(payload)
      }
      setInsightDraft(null)
      await loadVpcData()
    } catch (error) {
      console.error(error)
    } finally {
      setSavingInsight(false)
    }
  }

  async function handleDeleteInsight(id) {
    if (!window.confirm('Delete this insight?')) return
    try {
      await deleteInsightNote(id)
      await loadVpcData()
    } catch (error) {
      console.error(error)
    }
  }

  async function handleSavePairNote(pairKey) {
    setSavingPairKey(pairKey)
    try {
      await upsertVpcPairNote(pairKey, pairDrafts[pairKey] || {})
    } catch (error) {
      console.error(error)
    } finally {
      setSavingPairKey('')
    }
  }

  const getItemsBySection = (sectionKey) => items.filter((item) => item.section === sectionKey)

  const sectionCounts = useMemo(() => {
    const counts = {
      jobs: 0,
      pains: 0,
      gains: 0,
      products: 0,
      relievers: 0,
      creators: 0,
    }

    items.forEach((item) => {
      if (counts[item.section] !== undefined) counts[item.section] += 1
    })

    return counts
  }, [items])

  if (loading) {
    return <p style={loadingTextStyle}>불러오는 중...</p>
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1916', margin: '0 0 6px' }}>
          Value Proposition Canvas
        </h2>
        <p style={{ fontSize: '14px', color: '#6b6860', margin: 0 }}>
          기존 VPC 항목은 그대로 보이게 두고, 해석과 결론은 Synthesis Memo에 따로 정리합니다.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <span style={summaryPillStyle}>Jobs {sectionCounts.jobs}</span>
        <span style={summaryPillStyle}>Pains {sectionCounts.pains}</span>
        <span style={summaryPillStyle}>Gains {sectionCounts.gains}</span>
        <span style={summaryPillStyle}>Products {sectionCounts.products}</span>
        <span style={summaryPillStyle}>Relievers {sectionCounts.relievers}</span>
        <span style={summaryPillStyle}>Creators {sectionCounts.creators}</span>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => setVpcOpen(true)} style={outlineButtonStyle}>
          VPC 가이드
        </button>
        <button onClick={handleCfOpen} style={outlineButtonStyle}>
          코어 기능 관리
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <InsightHub
          insights={insights}
          canEdit={canEdit}
          onCreate={() => setInsightDraft({})}
          onEdit={(insight) => setInsightDraft(insight)}
          onDelete={handleDeleteInsight}
          title="인사이트 허브"
          subtitle="Empathize에서 나온 결론을 모아두고, VPC와 Prototype 방향과 연결합니다."
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 48px 1fr',
          gap: '12px',
          marginBottom: '8px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div style={headerLabelStyle}>Customer Profile</div>
        <div />
        <div style={headerLabelStyle}>Value Proposition</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {PAIRS.map((pair) => {
          const relatedInsights = insights.filter((insight) =>
            insight.linkedVpcSections?.some(
              (section) => section === pair.left.key || section === pair.right.key,
            ),
          )

          const pairDraft = pairDrafts[pair.key] || {
            whyThisMatters: '',
            designDirection: '',
            openQuestion: '',
          }

          return (
            <div
              key={pair.key}
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

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: '14px',
                  fontSize: '16px',
                  color: `${pair.color}80`,
                  userSelect: 'none',
                }}
              >
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

              <PairMemoCard
                pair={pair}
                draft={pairDraft}
                setDraft={(updater) =>
                  setPairDrafts((prev) => ({
                    ...prev,
                    [pair.key]: typeof updater === 'function' ? updater(prev[pair.key] || pairDraft) : updater,
                  }))
                }
                onSave={() => handleSavePairNote(pair.key)}
                saving={savingPairKey === pair.key}
                canEdit={canEdit}
                relatedInsights={relatedInsights}
                isOpen={Boolean(openPairKeys[pair.key])}
                onToggle={() =>
                  setOpenPairKeys((prev) => ({
                    ...prev,
                    [pair.key]: !prev[pair.key],
                  }))
                }
              />
            </div>
          )
        })}
      </div>

      {cfOpen && (
        <div
          onClick={() => {
            setCfOpen(false)
            setEditingId(null)
            setAdding(false)
          }}
          style={modalOverlayStyle}
        >
          <div onClick={(event) => event.stopPropagation()} style={cfModalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1a1916' }}>코어 기능</h3>
              <button
                onClick={() => {
                  setCfOpen(false)
                  setEditingId(null)
                  setAdding(false)
                }}
                style={closeButtonStyle}
              >
                ×
              </button>
            </div>

            {cfLoading ? (
              <p style={loadingTextStyle}>불러오는 중...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {features.map((feature, index) => (
                  <div key={feature.id} style={featureCardStyle}>
                    {editingId === feature.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          value={editForm.title}
                          onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                          placeholder="기능 제목"
                          style={sectionInputStyle}
                        />
                        <textarea
                          value={editForm.description}
                          onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                          placeholder="기능 설명"
                          rows={3}
                          style={{ ...sectionInputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                        />
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={handleEditSave} style={sectionAddButtonStyle('#4a7c9e')}>
                            저장
                          </button>
                          <button onClick={() => setEditingId(null)} style={outlineButtonStyle}>
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontSize: '11px', color: '#a8a49e', marginBottom: '2px' }}>Feature {index + 1}</div>
                          {canEdit && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => handleEditStart(feature)} style={inlineLinkStyle}>
                                수정
                              </button>
                              <button onClick={() => handleCfDelete(feature.id)} style={{ ...inlineLinkStyle, color: '#c0392b' }}>
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1a1916', marginBottom: '4px' }}>
                          {feature.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b6860', whiteSpace: 'pre-wrap' }}>
                          {feature.description || '설명 없음'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {features.length === 0 && <p style={loadingTextStyle}>아직 등록된 코어 기능이 없습니다.</p>}
              </div>
            )}

            {canEdit && (
              adding ? (
                <div style={newFeatureBoxStyle}>
                  <input
                    value={newForm.title}
                    onChange={(event) => setNewForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="기능 제목"
                    autoFocus
                    style={sectionInputStyle}
                  />
                  <textarea
                    value={newForm.description}
                    onChange={(event) => setNewForm((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="기능 설명"
                    rows={3}
                    style={{ ...sectionInputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={handleAddFeature} style={sectionAddButtonStyle('#4a7c9e')}>
                      추가
                    </button>
                    <button
                      onClick={() => {
                        setAdding(false)
                        setNewForm({ title: '', description: '' })
                      }}
                      style={outlineButtonStyle}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAdding(true)} style={dashedButtonStyle}>
                  + 기능 추가
                </button>
              )
            )}
          </div>
        </div>
      )}

      {vpcOpen && (
        <div onClick={() => setVpcOpen(false)} style={modalOverlayStyle}>
          <div onClick={(event) => event.stopPropagation()} style={guideModalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1a1916' }}>VPC 가이드</h3>
              <button onClick={() => setVpcOpen(false)} style={closeButtonStyle}>
                ×
              </button>
            </div>

            <p style={guideLeadStyle}>
              VPC 항목에는 핵심 포인트를 적고, Synthesis Memo에는 해석과 방향성을 정리합니다.
            </p>
            <p style={guideBodyStyle}>
              메모를 토글 형태로 접고 펼칠 수 있게 해서, 캔버스 자체는 깔끔하게 보면서도 pair별 판단 근거는 유지할 수 있습니다.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <p style={guideSectionTitleStyle}>추천 사용 흐름</p>
              <ol style={guideListStyle}>
                <li>리서치 내용을 Jobs, Pains, Gains로 압축합니다.</li>
                <li>해결 방향은 Products, Relievers, Creators에 적습니다.</li>
                <li>근거를 자세히 적고 싶을 때만 Synthesis Memo를 펼쳐 정리합니다.</li>
                <li>Insight Hub를 통해 근거 인사이트를 VPC와 계속 연결해둡니다.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {insightDraft !== null && (
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

const loadingTextStyle = {
  color: '#a8a49e',
  fontSize: '14px',
  textAlign: 'center',
  padding: '24px 0',
}

const headerLabelStyle = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#a8a49e',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
}

const summaryPillStyle = {
  fontSize: '12px',
  fontFamily: 'JetBrains Mono, monospace',
  background: '#f0ede8',
  color: '#6b6860',
  padding: '3px 10px',
  borderRadius: '20px',
}

const outlineButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: 'none',
  border: '1px solid rgba(0,0,0,0.1)',
  borderRadius: '8px',
  padding: '7px 12px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600,
  color: '#4a5568',
  fontFamily: 'inherit',
}

const sectionInputStyle = {
  flex: 1,
  padding: '7px 9px',
  borderRadius: '7px',
  border: '1px solid rgba(0,0,0,0.12)',
  fontSize: '12px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

function sectionAddButtonStyle(color) {
  return {
    padding: '6px 11px',
    borderRadius: '7px',
    border: 'none',
    background: color,
    color: 'white',
    fontSize: '12px',
    cursor: 'pointer',
  }
}

function chipDeleteStyle(color) {
  return {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    color,
    fontSize: '13px',
    lineHeight: 1,
    opacity: 0.7,
  }
}

function memoStateStyle(color) {
  return {
    fontSize: '11px',
    color,
    background: 'rgba(255,255,255,0.72)',
    border: `1px solid ${color}22`,
    borderRadius: '999px',
    padding: '3px 8px',
  }
}

const memoCountStyle = {
  fontSize: '11px',
  color: '#6b6860',
  background: 'rgba(255,255,255,0.72)',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '999px',
  padding: '3px 8px',
}

const emptyChipStyle = {
  fontSize: '12px',
  color: '#c8c4be',
  fontStyle: 'italic',
}

const memoTagStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '3px 8px',
  borderRadius: '999px',
  fontSize: '11px',
  color: '#6b6860',
  background: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(0,0,0,0.08)',
}

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
}

const cfModalStyle = {
  background: '#fff',
  borderRadius: '12px',
  padding: '24px 28px',
  maxWidth: '560px',
  width: '100%',
  maxHeight: '80vh',
  overflowY: 'auto',
  fontSize: '13px',
  lineHeight: 1.7,
  color: '#3d3b38',
  position: 'relative',
}

const guideModalStyle = {
  ...cfModalStyle,
  maxWidth: '680px',
}

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '22px',
  color: '#a8a49e',
  lineHeight: 1,
  padding: '0 4px',
}

const featureCardStyle = {
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '8px',
  padding: '14px 16px',
  background: '#fafaf9',
}

const newFeatureBoxStyle = {
  border: '1px dashed rgba(0,0,0,0.15)',
  borderRadius: '8px',
  padding: '14px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

const dashedButtonStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '8px',
  border: '1px dashed rgba(0,0,0,0.15)',
  background: 'none',
  fontSize: '13px',
  color: '#a8a49e',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const inlineLinkStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '12px',
  color: '#a8a49e',
  padding: 0,
}

const guideLeadStyle = {
  margin: '0 0 14px',
  fontWeight: 600,
  fontSize: '14px',
  color: '#1a1916',
}

const guideBodyStyle = {
  margin: '0 0 16px',
  color: '#6b6860',
}

const guideSectionTitleStyle = {
  margin: '0 0 8px',
  fontWeight: 600,
  color: '#1a1916',
}

const guideListStyle = {
  margin: 0,
  paddingLeft: '18px',
  color: '#6b6860',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}
