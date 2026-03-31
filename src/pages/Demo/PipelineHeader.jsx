import { useRef, useState } from 'react'
import { ACCENT } from './constants/stageConfig'

export default function PipelineHeader({ onRun, disabled }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  function handleFile(f) {
    if (f && f.type === 'application/pdf') setFile(f)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  function handleSubmit() {
    if (file && title.trim()) onRun(file, title.trim())
  }

  const canRun = file && title.trim() && !disabled

  return (
    <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(0,0,0,0.08)', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>

        {/* 드래그&드롭 업로드 */}
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `1.5px dashed ${dragging ? ACCENT : 'rgba(0,0,0,0.2)'}`,
            borderRadius: '8px',
            padding: '12px 20px',
            cursor: 'pointer',
            minWidth: '220px',
            textAlign: 'center',
            background: dragging ? `rgba(160,120,64,0.04)` : '#fafaf9',
            transition: 'border-color 0.2s, background 0.2s',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {file ? (
            <span style={{ fontSize: '13px', color: ACCENT, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
              {file.name}
            </span>
          ) : (
            <span style={{ fontSize: '13px', color: '#9a9490' }}>
              PDF 드래그 또는 클릭
            </span>
          )}
        </div>

        {/* 문서 제목 */}
        <input
          type="text"
          placeholder="문서 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '14px',
            fontFamily: 'inherit',
            outline: 'none',
            width: '200px',
          }}
          onFocus={(e) => (e.target.style.borderColor = ACCENT)}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(0,0,0,0.15)')}
        />

        {/* 실행 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!canRun}
          style={{
            background: canRun ? ACCENT : '#e5e2de',
            color: canRun ? '#fff' : '#b0a898',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 24px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: canRun ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          {disabled ? '실행 중...' : '파이프라인 실행'}
        </button>
      </div>
    </div>
  )
}
