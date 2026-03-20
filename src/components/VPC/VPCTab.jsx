import { useState, useEffect } from 'react'
import { auth } from '../../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { getVpcItems, addVpcItem, deleteVpcItem } from '../../lib/firestore'
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
