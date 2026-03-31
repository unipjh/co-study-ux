export const ACCENT = '#a07840'

export const STAGES = [
  { id: 'S1',  label: 'S1 추출',    desc: 'PDF 텍스트 추출' },
  { id: 'S2',  label: 'S2 청킹',    desc: '계층적 텍스트 청킹' },
  { id: 'S3',  label: 'S3 정제',    desc: 'Flash 병렬 정제' },
  { id: 'S4M', label: 'S4 Map',     desc: '로컬 맵 생성 (Flash)' },
  { id: 'S4R', label: 'S4 Reduce',  desc: '글로벌 맵 병합 (Pro)' },
  { id: 'S5',  label: 'S5 포맷',    desc: 'ReactFlow JSON 변환' },
]

export const STAGE_IDS = STAGES.map((s) => s.id)
