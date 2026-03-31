import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ACCENT } from '../constants/stageConfig'

export default function S1Viewer({ result }) {
  const pages = result || []
  const [selectedPage, setSelectedPage] = useState(0)
  if (!pages.length) return <Empty />

  const page = pages[selectedPage]
  const fontData = page.font_sizes
    .reduce((acc, size) => {
      const key = Math.round(size)
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  const chartData = Object.entries(fontData)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([size, count]) => ({ size: `${size}pt`, count }))

  const highlighted = page.text
    .replace(/\[수식\]/g, '<mark style="background:rgba(160,120,64,0.15);padding:0 2px;border-radius:2px">[수식]</mark>')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      {/* 페이지 탭 */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {pages.map((p, i) => (
          <button
            key={i}
            onClick={() => setSelectedPage(i)}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: `1px solid ${selectedPage === i ? ACCENT : 'rgba(0,0,0,0.12)'}`,
              background: selectedPage === i ? `rgba(160,120,64,0.08)` : 'transparent',
              color: selectedPage === i ? ACCENT : '#6b6860',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            p{p.page_num}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* 텍스트 원문 */}
        <div style={{
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '8px',
          padding: '16px',
          overflowY: 'auto',
          fontSize: '13px',
          lineHeight: '1.7',
          color: '#2a2724',
          fontFamily: 'JetBrains Mono, monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />

        {/* 폰트 분포 */}
        <div>
          <div style={{ fontSize: '11px', color: '#9a9490', marginBottom: '8px' }}>폰트 크기 분포</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="size" type="category" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} width={32} />
              <Tooltip contentStyle={{ fontSize: '12px' }} />
              <Bar dataKey="count" fill={ACCENT} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: '11px', color: '#9a9490', marginTop: '12px' }}>
            max: {page.max_font_size}pt<br />
            텍스트: {page.text.length}자
          </div>
        </div>
      </div>
    </div>
  )
}

function Empty() {
  return <div style={{ color: '#9a9490', fontSize: '13px' }}>데이터 없음</div>
}
