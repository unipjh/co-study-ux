export const VPC_SECTION_OPTIONS = [
  { key: 'jobs', label: 'Jobs' },
  { key: 'pains', label: 'Pains' },
  { key: 'gains', label: 'Gains' },
  { key: 'products', label: 'Products & Services' },
  { key: 'relievers', label: 'Pain Relievers' },
  { key: 'creators', label: 'Gain Creators' },
]

export const INSIGHT_PRIORITY_OPTIONS = [
  { key: 'high', label: '높음' },
  { key: 'medium', label: '중간' },
  { key: 'low', label: '낮음' },
]

export const INSIGHT_STATUS_OPTIONS = [
  { key: 'open', label: '열림' },
  { key: 'selected', label: '선정됨' },
  { key: 'archived', label: '보관' },
]

export function createEmptyInsightDraft(overrides = {}) {
  return {
    title: '',
    summary: '',
    evidence: '',
    linkedVpcSections: [],
    prototypeImplication: '',
    priority: 'medium',
    status: 'open',
    sourceType: 'manual',
    sourceIds: [],
    sourceLabel: '',
    ...overrides,
  }
}

export function buildObservationInsightDraft(observation) {
  const insight = observation?.fields?.insight?.trim() || ''
  const summary = [
    observation?.fields?.wowMoment?.trim(),
    observation?.fields?.friction?.trim(),
  ]
    .filter(Boolean)
    .join('\n\n')

  return createEmptyInsightDraft({
    title: insight || `${observation?.service || '관찰'}에서 얻은 인사이트`,
    summary: insight,
    evidence: summary,
    prototypeImplication: '',
    sourceType: 'observation',
    sourceIds: observation?.id ? [observation.id] : [],
    sourceLabel: observation?.service || '',
  })
}

export function buildExperienceInsightDraft(experience) {
  return createEmptyInsightDraft({
    title: experience?.insight?.trim() || `${experience?.author || '팀원'} 경험 인사이트`,
    summary: experience?.insight?.trim() || '',
    evidence: [
      experience?.situation?.trim(),
      experience?.action?.trim(),
      experience?.result?.trim(),
    ]
      .filter(Boolean)
      .join('\n\n'),
    prototypeImplication: '',
    sourceType: 'experience',
    sourceIds: experience?.id ? [experience.id] : [],
    sourceLabel: experience?.author || '',
  })
}

export function getInsightPriorityLabel(priority) {
  return INSIGHT_PRIORITY_OPTIONS.find((item) => item.key === priority)?.label || '중간'
}

export function getInsightStatusLabel(status) {
  return INSIGHT_STATUS_OPTIONS.find((item) => item.key === status)?.label || '열림'
}

export function getSectionLabel(sectionKey) {
  return VPC_SECTION_OPTIONS.find((item) => item.key === sectionKey)?.label || sectionKey
}
