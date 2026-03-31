import { STAGES, ACCENT } from './constants/stageConfig'
import S1Viewer from './viewers/S1Viewer'
import S2Viewer from './viewers/S2Viewer'
import S3Viewer from './viewers/S3Viewer'
import S4MapViewer from './viewers/S4MapViewer'
import S4ReduceViewer from './viewers/S4ReduceViewer'
import S5Viewer from './viewers/S5Viewer'

export default function ResultViewer({ selectedStage, stages }) {
  if (!selectedStage) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#b0a898', fontSize: '13px',
      }}>
        좌측 Stage 카드를 클릭하면 결과가 표시됩니다.
      </div>
    )
  }

  const stage = STAGES.find((s) => s.id === selectedStage)
  const stageData = stages[selectedStage]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, padding: '20px 24px' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px', flexShrink: 0 }}>
        <span style={{ fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: ACCENT }}>
          {stage?.label}
        </span>
        <span style={{ fontSize: '12px', color: '#9a9490' }}>{stage?.desc}</span>
        {stageData?.summary && (
          <span style={{
            marginLeft: 'auto', fontSize: '11px',
            color: ACCENT, fontFamily: 'JetBrains Mono, monospace',
            background: 'rgba(160,120,64,0.08)', padding: '2px 8px', borderRadius: '4px',
          }}>
            {stageData.summary}
          </span>
        )}
      </div>

      {/* Viewer 분기 */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {selectedStage === 'S1' && <S1Viewer result={stageData?.result} />}
        {selectedStage === 'S2' && <S2Viewer result={stageData?.result} />}
        {selectedStage === 'S3' && (
          <S3Viewer result={stageData?.result} s2Result={stages['S2']?.result} />
        )}
        {selectedStage === 'S4M' && <S4MapViewer result={stageData?.result} />}
        {selectedStage === 'S4R' && <S4ReduceViewer result={stageData?.result} />}
        {selectedStage === 'S5' && <S5Viewer result={stageData?.result} />}
      </div>
    </div>
  )
}
