
const TEAM = [
  { name: '박준환', major: 'AI/DS', role: '팀장/구현 책임' },
  { name: '팀원1', major: '경영+BA', role: '미정' },
  { name: '팀원2', major: '경영+BA', role: '미정' },
  { name: '팀원3', major: '디자인', role: '디자인 책임' },
  { name: '팀원4', major: '일문+BA', role: '미정' },
]

const PHASES = [
  { key: 'empathize', label: 'Empathize', desc: '팀원 경험 수집 + 서비스 UX 분석' },
  { key: 'vpc', label: 'VPC', desc: '문제 정의 + 가치(아이디어) 제안' },
  { key: 'prototype', label: 'Prototype', desc: 'Figma + Claude Code MVP' },
  { key: 'test', label: 'Test', desc: '실사용자 테스트' },
]

const CURRENT_PHASE = 'empathize'


const CHECKLIST = [
  {
    phase: 'Phase 1 — Empathize',
    items: [
      { key: 'p1_0', label: '팀원 각자 AI 학습 경험 웹사이트에 기록' },
      { key: 'p1_1', label: '경쟁 플랫폼 UX 분석 팀원당 1개 (총 5개)' },
      { key: 'p1_2', label: '공통 Pain 포인트 3개 이상 도출' },
    ],
  },
  {
    phase: 'Phase 2 — VPC',
    items: [
      { key: 'p2_0', label: 'Customer Profile 완성 (Jobs / Pains / Gains)' },
      { key: 'p2_1', label: 'Value Proposition 완성' },
      { key: 'p2_2', label: '핵심 기능 후보 3개 수렴' },
      { key: 'p2_3', label: '팀 전체 VPC 합의' },
    ],
  },
  {
    phase: 'Phase 3 — Prototype',
    items: [
      { key: 'p3_0', label: 'Figma 와이어프레임 완성' },
      { key: 'p3_1', label: '클릭 가능한 프로토타입' },
      { key: 'p3_2', label: 'MVP 구현 (핵심 기능 1~2개)' },
    ],
  },
  {
    phase: 'Phase 4 — Test',
    items: [
      { key: 'p4_0', label: '테스트 참여자 3명 이상' },
      { key: 'p4_1', label: '테스트 실행 + 기록' },
      { key: 'p4_2', label: '개선 반영' },
    ],
  },
]

export default function IntroductionTab({ checked, onToggle }) {

  return (
    <div style={{ maxWidth: '720px' }}>
      {/* 목표 */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1916', margin: '0 0 12px' }}>
          한 줄 목표
        </h2>
        <p style={{
          fontSize: '16px', color: '#1a1916', fontStyle: 'italic',
          background: '#f8f7f5', borderLeft: '3px solid #a07840',
          padding: '12px 16px', borderRadius: '0 6px 6px 0', margin: 0,
        }}>
          AI 시대에 진짜로 작동하는 학습 도우미를 만든다.
        </p>
      </section>

      {/* 배경 */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1916', margin: '0 0 12px' }}>
          왜 이 문제인가
        </h2>
        <div style={{ fontSize: '14px', color: '#3d3a34', lineHeight: '1.8' }}>
          <p style={{ margin: '0 0 10px' }}>
            생성형 AI가 널리 쓰이면서 학생들은 AI로 공부하고 과제를 한다. 그런데 결과가 들쑥날쑥하다.
          </p>
          <p style={{ margin: '0 0 10px' }}>
            같은 AI를 써도 어떤 경우엔 A+, 어떤 경우엔 B+. 차이는 AI의 성능이 아니었다.
          </p>
          <p style={{
            fontWeight: 600, color: '#1a1916',
            background: '#f0ede8', padding: '10px 14px', borderRadius: '6px', margin: '0 0 10px',
          }}>
            차이는 내 머릿속에 틀이 있었냐 없었냐였다.
          </p>
          <p style={{ margin: 0 }}>
            기존 학습 AI 플랫폼 대부분은 정보를 AI → 사용자 방향으로 흘린다.
            우리는 그 방향을 뒤집는다. 사용자가 먼저 설명하고 → AI가 반응하는 구조.
          </p>
        </div>
      </section>

      {/* 진행 단계 */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1916', margin: '0 0 16px' }}>
          진행 단계
        </h2>
        <div style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
          {PHASES.map((phase, i) => {
            const isCurrent = phase.key === CURRENT_PHASE
            const isPast = PHASES.findIndex((p) => p.key === CURRENT_PHASE) > i
            return (
              <div key={phase.key} style={{ display: 'flex', alignItems: 'stretch', flex: 1 }}>
                <div style={{
                  flex: 1,
                  padding: '14px 12px',
                  background: isCurrent ? '#a07840' : isPast ? '#f0ede8' : '#fafaf9',
                  border: `1px solid ${isCurrent ? '#a07840' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: i === 0 ? '8px 0 0 8px' : i === PHASES.length - 1 ? '0 8px 8px 0' : '0',
                  borderLeft: i > 0 ? 'none' : undefined,
                }}>
                  <div style={{
                    fontSize: '12px', fontWeight: 700,
                    color: isCurrent ? 'white' : isPast ? '#a07840' : '#a8a49e',
                    marginBottom: '4px',
                  }}>
                    {phase.label}
                    {isCurrent && <span style={{ marginLeft: '6px', fontSize: '10px', fontWeight: 400 }}>← 현재</span>}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: isCurrent ? 'rgba(255,255,255,0.85)' : '#6b6860',
                    lineHeight: '1.4',
                  }}>
                    {phase.desc}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>


      {/* 체크리스트 */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1916', margin: '0 0 16px' }}>
          체크리스트
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {CHECKLIST.map((group) => {
            const doneCount = group.items.filter((it) => checked[it.key]).length
            return (
              <div key={group.phase} style={{
                border: '1px solid rgba(0,0,0,0.08)', borderRadius: '8px', overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#f0ede8', padding: '10px 16px',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1916' }}>
                    {group.phase}
                  </span>
                  <span style={{ fontSize: '11px', color: '#a07840', fontWeight: 600 }}>
                    {doneCount} / {group.items.length}
                  </span>
                </div>
                <div style={{ padding: '8px 0' }}>
                  {group.items.map((item) => {
                    const isChecked = !!checked[item.key]
                    return (
                      <label key={item.key} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '8px 16px', cursor: 'pointer',
                        background: isChecked ? '#fafaf9' : 'white',
                      }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggle(item.key, isChecked)}
                          style={{ accentColor: '#a07840', width: '15px', height: '15px', flexShrink: 0 }}
                        />
                        <span style={{
                          fontSize: '13px',
                          color: isChecked ? '#a8a49e' : '#3d3a34',
                          textDecoration: isChecked ? 'line-through' : 'none',
                        }}>
                          {item.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 팀 구성 */}
      <section>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1916', margin: '0 0 12px' }}>
          팀 구성
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8f7f5' }}>
              {['이름', '전공', '역할'].map((h) => (
                <th key={h} style={{
                  padding: '8px 12px', textAlign: 'left',
                  fontWeight: 600, color: '#6b6860',
                  border: '1px solid rgba(0,0,0,0.08)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TEAM.map((m, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#fafaf9' }}>
                <td style={{ padding: '8px 12px', border: '1px solid rgba(0,0,0,0.08)', fontWeight: m.name === '박준환' ? 600 : 400 }}>{m.name}</td>
                <td style={{ padding: '8px 12px', border: '1px solid rgba(0,0,0,0.08)', color: '#6b6860' }}>{m.major}</td>
                <td style={{ padding: '8px 12px', border: '1px solid rgba(0,0,0,0.08)', color: '#6b6860' }}>{m.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
