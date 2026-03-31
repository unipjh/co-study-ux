import { useState } from 'react'
import { usePipelineSSE } from './hooks/usePipelineSSE'
import PipelineHeader from './PipelineHeader'
import StageProgressBar from './StageProgressBar'
import StagePanel from './StagePanel'
import ResultViewer from './ResultViewer'
import { ACCENT } from './constants/stageConfig'

export default function PipelineDemo() {
  const { state, run } = usePipelineSSE()
  const [selectedStage, setSelectedStage] = useState(null)

  const isRunning = state.status === 'uploading' || state.status === 'streaming'

  // 완료된 Stage 중 가장 최근 것을 자동 선택
  function handleStageSelect(stageId) {
    setSelectedStage(stageId)
  }

  // stage_done 이벤트 시 자동 선택
  const latestDone = Object.entries(state.stages)
    .filter(([, s]) => s.status === 'done')
    .pop()?.[0]

  const displayStage = selectedStage || latestDone || null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)', background: '#fff' }}>

      {/* 헤더: 업로드 + 실행 */}
      <PipelineHeader onRun={run} disabled={isRunning} />

      {/* 진행 바 */}
      <StageProgressBar stages={state.stages} />

      {/* 에러 배너 */}
      {state.status === 'error' && (
        <div style={{
          padding: '10px 32px',
          background: '#fef2f2',
          borderBottom: '1px solid #fecaca',
          fontSize: '13px',
          color: '#ef4444',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          오류: {state.error}
        </div>
      )}

      {/* 완료 배너 */}
      {state.status === 'done' && (
        <div style={{
          padding: '8px 32px',
          background: `rgba(160,120,64,0.06)`,
          borderBottom: `1px solid rgba(160,120,64,0.2)`,
          fontSize: '12px',
          color: ACCENT,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          pipeline_done — 마인드맵 생성 완료
        </div>
      )}

      {/* 메인: 좌측 패널 + 우측 뷰어 */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <StagePanel
          stages={state.stages}
          activeStage={state.activeStage}
          selectedStage={displayStage}
          onSelect={handleStageSelect}
        />
        <ResultViewer
          selectedStage={displayStage}
          stages={state.stages}
        />
      </div>
    </div>
  )
}
