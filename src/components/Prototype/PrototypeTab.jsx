import { useCallback, useEffect, useMemo, useState } from 'react'
import FeatureSpecModal from './FeatureSpecModal'
import DecisionLogModal from './DecisionLogModal'
import InsightCard from '../Insights/InsightCard'
import {
  addPrototypeDecision,
  deletePrototypeDecision,
  getCoreFeatures,
  getInsightNotes,
  getPrototypeDecisions,
  updatePrototypeDecision,
} from '../../lib/firestore'
import { auth } from '../../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { isTeamMember } from '../../lib/teamEmails'

const FIGMA_URL = ''
const MVP_URL = ''

const STATUS_META = {
  todo: { label: 'To do', color: '#a07840', bg: 'rgba(160,120,64,0.08)' },
  doing: { label: 'Doing', color: '#4a7c9e', bg: 'rgba(74,124,158,0.08)' },
  done: { label: 'Done', color: '#4a7c6f', bg: 'rgba(74,124,111,0.08)' },
}

export default function PrototypeTab() {
  const [user, setUser] = useState(null)
  const [showSpec, setShowSpec] = useState(false)
  const [insights, setInsights] = useState([])
  const [decisions, setDecisions] = useState([])
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [decisionDraft, setDecisionDraft] = useState(null)
  const [savingDecision, setSavingDecision] = useState(false)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  const canEdit = isTeamMember(user)

  async function safeRead(loader, fallback) {
    try {
      return await loader()
    } catch (error) {
      console.error(error)
      return fallback
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [insightData, decisionData, featureData] = await Promise.all([
        safeRead(getInsightNotes, []),
        safeRead(getPrototypeDecisions, []),
        safeRead(getCoreFeatures, []),
      ])
      setInsights(insightData)
      setDecisions(decisionData)
      setFeatures(featureData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleSaveDecision(payload) {
    setSavingDecision(true)
    try {
      if (decisionDraft?.id) {
        await updatePrototypeDecision(decisionDraft.id, payload)
      } else {
        await addPrototypeDecision(payload)
      }
      setDecisionDraft(null)
      await load()
    } catch (error) {
      console.error(error)
    } finally {
      setSavingDecision(false)
    }
  }

  async function handleDeleteDecision(id) {
    if (!window.confirm('이 decision을 삭제할까요?')) return
    try {
      await deletePrototypeDecision(id)
      await load()
    } catch (error) {
      console.error(error)
    }
  }

  const prototypeRelevantInsights = useMemo(
    () =>
      insights
        .filter((item) => item.prototypeImplication?.trim() || item.status === 'selected')
        .sort((a, b) => {
          const priorityRank = { high: 0, medium: 1, low: 2 }
          return (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9)
        }),
    [insights],
  )

  const insightMap = useMemo(
    () => Object.fromEntries(insights.map((item) => [item.id, item])),
    [insights],
  )
  const featureMap = useMemo(
    () => Object.fromEntries(features.map((item) => [item.id, item])),
    [features],
  )

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1916', margin: '0 0 6px' }}>
          Prototype
        </h2>
        <p style={{ fontSize: '14px', color: '#6b6860', margin: 0 }}>
          Figma와 MVP 링크만 모아두는 탭이 아니라, 무엇을 왜 만들기로 했는지까지 함께 남깁니다.
        </p>
      </div>

      <section style={panelStyle('#4a7c6f')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <div style={panelEyebrowStyle('#4a7c6f')}>Why This Prototype</div>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#1a1916' }}>반영 후보 인사이트</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b6860' }}>
              `selected` 상태이거나 prototype implication이 적힌 인사이트를 우선 노출합니다.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={countPillStyle}>{prototypeRelevantInsights.length} insights</span>
            <span style={countPillStyle}>{decisions.length} decisions</span>
          </div>
        </div>

        {loading ? (
          <p style={emptyStyle}>불러오는 중...</p>
        ) : prototypeRelevantInsights.length === 0 ? (
          <p style={emptyStyle}>Prototype 방향성과 연결된 인사이트가 아직 없습니다.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginTop: '16px' }}>
            {prototypeRelevantInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} compact />
            ))}
          </div>
        )}
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        <div style={panelStyle('#a07840')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={panelEyebrowStyle('#a07840')}>Specification</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1916', marginBottom: '4px' }}>
                기능 명세서
              </div>
              <div style={{ fontSize: '13px', color: '#6b6860' }}>
                자료 로딩, 텍스트 선택, AI 학습 인터랙션까지 현재 MVP 범위를 정리해둔 문서입니다.
              </div>
            </div>
            <button onClick={() => setShowSpec(true)} style={primaryButtonStyle('#a07840')}>
              보기
            </button>
          </div>
        </div>

        {showSpec && <FeatureSpecModal onClose={() => setShowSpec(false)} />}

        <div style={panelStyle('#1a1916')}>
          <PrototypeLinkCard title="Figma 링크" description="UI/UX 프로토타입과 화면 흐름 문서" url={FIGMA_URL} />
        </div>

        <div style={panelStyle('#a07840')}>
          <PrototypeLinkCard title="MVP 링크" description="실제로 동작하는 최소 기능 웹 프로토타입" url={MVP_URL} />
        </div>
      </div>

      <section style={{ ...panelStyle('#4a7c9e'), marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <div>
            <div style={panelEyebrowStyle('#4a7c9e')}>Decision Log</div>
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#1a1916' }}>왜 이 기능을 먼저 만들었는가</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b6860' }}>
              인사이트와 Core Feature를 연결해 프로토타입 의사결정을 기록합니다.
            </p>
          </div>
          {canEdit && (
            <button onClick={() => setDecisionDraft({})} style={primaryButtonStyle('#4a7c9e')}>
              + Decision 추가
            </button>
          )}
        </div>

        {loading ? (
          <p style={emptyStyle}>불러오는 중...</p>
        ) : decisions.length === 0 ? (
          <p style={emptyStyle}>아직 기록된 prototype decision이 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {decisions.map((decision) => {
              const statusMeta = STATUS_META[decision.status] || STATUS_META.todo
              const linkedInsights = (decision.linkedInsightIds || [])
                .map((id) => insightMap[id])
                .filter(Boolean)
              const linkedFeatures = (decision.linkedFeatureIds || [])
                .map((id) => featureMap[id])
                .filter(Boolean)

              return (
                <article
                  key={decision.id}
                  style={{
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '12px',
                    padding: '16px',
                    background: 'white',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <div>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 8px',
                          borderRadius: '999px',
                          background: statusMeta.bg,
                          color: statusMeta.color,
                          fontSize: '11px',
                          fontWeight: 700,
                          marginBottom: '8px',
                        }}
                      >
                        {statusMeta.label}
                      </div>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#1a1916' }}>
                        {decision.title}
                      </h4>
                    </div>
                    {canEdit && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setDecisionDraft(decision)} style={inlineButtonStyle}>
                          수정
                        </button>
                        <button onClick={() => handleDeleteDecision(decision.id)} style={{ ...inlineButtonStyle, color: '#c0392b' }}>
                          삭제
                        </button>
                      </div>
                    )}
                  </div>

                  {decision.decision && (
                    <Block title="Decision">
                      <p style={blockTextStyle}>{decision.decision}</p>
                    </Block>
                  )}

                  {decision.reason && (
                    <Block title="Reason">
                      <p style={blockTextStyle}>{decision.reason}</p>
                    </Block>
                  )}

                  {(linkedInsights.length > 0 || linkedFeatures.length > 0) && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginTop: '10px' }}>
                      <Block title="Linked Insights">
                        {linkedInsights.length === 0 ? (
                          <p style={subtleTextStyle}>연결 없음</p>
                        ) : (
                          linkedInsights.map((insight) => (
                            <div key={insight.id} style={miniChipStyle}>
                              {insight.title}
                            </div>
                          ))
                        )}
                      </Block>
                      <Block title="Linked Features">
                        {linkedFeatures.length === 0 ? (
                          <p style={subtleTextStyle}>연결 없음</p>
                        ) : (
                          linkedFeatures.map((feature) => (
                            <div key={feature.id} style={miniChipStyle}>
                              {feature.title}
                            </div>
                          ))
                        )}
                      </Block>
                    </div>
                  )}

                  {decision.nextAction && (
                    <Block title="Next Action">
                      <p style={blockTextStyle}>{decision.nextAction}</p>
                    </Block>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>

      <p style={{ fontSize: '12px', color: '#c8c4be', marginTop: '24px' }}>
        링크가 생기면 이 파일의 `FIGMA_URL`과 `MVP_URL`을 채워주세요.
      </p>

      {decisionDraft !== null && (
        <DecisionLogModal
          initialValue={decisionDraft}
          insights={insights}
          features={features}
          onClose={() => setDecisionDraft(null)}
          onSave={handleSaveDecision}
          saving={savingDecision}
        />
      )}
    </div>
  )
}

function PrototypeLinkCard({ title, description, url }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1916', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '13px', color: '#6b6860' }}>{description}</div>
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" style={linkButtonStyle}>
          열기
        </a>
      ) : (
        <span style={countPillStyle}>준비 중</span>
      )}
    </div>
  )
}

function Block({ title, children }) {
  return (
    <div
      style={{
        marginTop: '10px',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid rgba(0,0,0,0.06)',
        background: '#fafaf9',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#a8a49e',
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function panelEyebrowStyle(color) {
  return {
    fontSize: '11px',
    fontWeight: 700,
    color,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '6px',
  }
}

function panelStyle(color) {
  return {
    border: `1px solid ${color}33`,
    borderRadius: '12px',
    padding: '18px',
    background: `${color}08`,
  }
}

function primaryButtonStyle(color) {
  return {
    padding: '7px 16px',
    borderRadius: '8px',
    border: 'none',
    background: color,
    color: 'white',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  }
}

const linkButtonStyle = {
  padding: '7px 16px',
  borderRadius: '8px',
  border: 'none',
  background: '#1a1916',
  color: 'white',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block',
}

const countPillStyle = {
  fontSize: '12px',
  color: '#a8a49e',
  background: '#f0ede8',
  padding: '5px 12px',
  borderRadius: '20px',
}

const emptyStyle = {
  margin: 0,
  padding: '24px 0',
  color: '#a8a49e',
  textAlign: 'center',
  fontSize: '13px',
}

const inlineButtonStyle = {
  border: 'none',
  background: 'none',
  color: '#6b6860',
  fontSize: '12px',
  cursor: 'pointer',
  padding: 0,
}

const blockTextStyle = {
  margin: 0,
  fontSize: '13px',
  lineHeight: 1.65,
  color: '#1a1916',
  whiteSpace: 'pre-wrap',
}

const subtleTextStyle = {
  margin: 0,
  fontSize: '12px',
  color: '#a8a49e',
}

const miniChipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 8px',
  borderRadius: '999px',
  fontSize: '11px',
  color: '#4a5568',
  background: 'white',
  border: '1px solid rgba(0,0,0,0.08)',
  marginRight: '6px',
  marginBottom: '6px',
}
