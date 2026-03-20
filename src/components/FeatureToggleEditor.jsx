import { useState } from 'react'
import ImageUploader from './ImageUploader'

function FeatureEntry({ feature, onChange, onRemove, accent, onUploadingChange }) {
  const [open, setOpen] = useState(true)

  return (
    <div style={{
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: '8px',
      marginBottom: '8px',
      background: 'white',
      overflow: 'hidden',
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 12px',
        background: open ? 'rgba(0,0,0,0.02)' : 'transparent',
      }}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            color: '#a8a49e', fontSize: '11px', lineHeight: 1, minWidth: '14px',
            flexShrink: 0,
          }}
        >
          {open ? '▼' : '▶'}
        </button>
        <input
          type="text"
          value={feature.title}
          onChange={(e) => onChange({ ...feature, title: e.target.value })}
          placeholder="기능 이름 (예: AI 질문 응답)"
          style={{
            flex: 1, border: 'none', background: 'transparent',
            fontSize: '13px', fontWeight: 500, color: '#1a1916',
            outline: 'none', fontFamily: 'inherit',
          }}
        />
        <button
          type="button"
          onClick={onRemove}
          style={{
            background: 'none', border: 'none', color: '#c0392b',
            fontSize: '16px', cursor: 'pointer', padding: '0 2px', lineHeight: 1, flexShrink: 0,
          }}
        >×</button>
      </div>

      {/* 펼친 내용 */}
      {open && (
        <div style={{ padding: '12px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <textarea
            value={feature.description}
            onChange={(e) => onChange({ ...feature, description: e.target.value })}
            placeholder="기능 설명을 입력하세요..."
            rows={3}
            style={{
              width: '100%', padding: '8px 10px',
              background: '#f0ede8', border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '6px', fontSize: '13px', color: '#1a1916',
              resize: 'vertical', fontFamily: 'inherit', outline: 'none',
              lineHeight: 1.6, marginBottom: '10px', boxSizing: 'border-box',
            }}
          />
          <ImageUploader
            images={feature.images || []}
            onChange={(imgs) => onChange({ ...feature, images: imgs })}
            accent={accent}
            onUploadingChange={onUploadingChange}
          />
        </div>
      )}
    </div>
  )
}

export default function FeatureToggleEditor({ features = [], onChange, accent = '#a07840', onUploadingChange }) {
  const addFeature = () => {
    onChange([...features, { title: '', description: '', images: [] }])
  }

  const updateFeature = (i, updated) => {
    onChange(features.map((f, idx) => idx === i ? updated : f))
  }

  const removeFeature = (i) => {
    onChange(features.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      {features.map((feat, i) => (
        <FeatureEntry
          key={i}
          feature={feat}
          onChange={(updated) => updateFeature(i, updated)}
          onRemove={() => removeFeature(i)}
          accent={accent}
          onUploadingChange={onUploadingChange}
        />
      ))}
      <button
        type="button"
        onClick={addFeature}
        style={{
          display: 'block', width: '100%',
          padding: '8px', borderRadius: '6px',
          border: `1px dashed ${accent}`,
          background: 'transparent', color: accent,
          fontSize: '13px', cursor: 'pointer', textAlign: 'center',
        }}
      >
        + 기능 추가
      </button>
    </div>
  )
}
