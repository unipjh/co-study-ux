export default function FeatureSpecModal({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 1000,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '40px 16px',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '36px 40px',
          maxWidth: '720px',
          width: '100%',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          position: 'relative',
        }}
      >
        {/* 닫기 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '20px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '20px', color: '#a8a49e', lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* 헤더 */}
        <div style={{ marginBottom: '28px', borderBottom: '1px solid #f0ede8', paddingBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#a07840', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Feature Specification · v0.1
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1916', margin: '0 0 8px' }}>
            Co-Study 학습 도우미
          </h2>
          <p style={{ fontSize: '14px', color: '#6b6860', margin: 0, lineHeight: 1.6 }}>
            PDF·이미지·텍스트 자료를 불러와 하이라이트·메모·AI 인터랙션으로 학습을 돕는 웹 애플리케이션.
            디자인씽킹 팀 프로젝트의 MVP 구현 대상.
          </p>
        </div>

        {/* 2-1 */}
        <Section
          number="2-1"
          title="자료 렌더링"
          subtitle="학습 자료 전체 화면 렌더링"
          items={[
            'PDF, 이미지, 텍스트 기반 자료를 하나의 캔버스로 통합 렌더링',
            '화면 비율 유지 + 확대/축소 (zoom in/out)',
            '페이지 단위 / 스크롤 기반 뷰 전환 지원',
            '빠른 로딩 및 페이지 프리로딩 처리',
            '모바일/웹 반응형 대응',
          ]}
        />

        {/* 2-2 */}
        <Section
          number="2-2"
          title="텍스트 선택"
          subtitle="하이라이팅 · 메모 · Chat 연결"
          items={[
            '드래그 기반 텍스트 선택 후 하이라이트 적용',
            '색상별 하이라이트 구분 (중요 / 이해 필요 / 암기)',
            '하이라이트 영역 저장 및 재렌더링',
            '하이라이트 클릭 시 관련 메모/AI 기능 연결',
            '동일 구간 중복 하이라이트 처리 로직',
            '특정 텍스트/영역에 메모(anchor) 연결',
            '메모 아이콘 또는 말풍선 UI로 표시',
            '메모 수정 / 삭제 / 펼치기',
            '메모 리스트 패널에서 전체 조회 가능',
            '메모와 원문 위치 자동 연결 (scroll sync)',
          ]}
        />

        {/* 2-3 */}
        <Section
          number="2-3"
          title="학습 인터랙션"
          subtitle="AI 기반 학습 인터랙션 연결 · 핵심 차별화"
          highlight
          items={[
            '선택한 텍스트 기반 요약 요청',
            '선택한 텍스트 기반 설명 요청',
            '선택한 텍스트 기반 문제 생성',
            '하이라이트/메모를 학습 데이터로 활용',
            'AI 응답을 메모 형태로 캔버스에 삽입',
            '사용자 행동 기반 추천 (예: "이 부분 다시 볼까요?")',
          ]}
        />

        <div style={{ marginTop: '28px', padding: '14px 16px', background: '#fafaf9', borderRadius: '8px', fontSize: '12px', color: '#a8a49e', lineHeight: 1.6 }}>
          이 문서는 Co-Study UX 팀 내부 공유용입니다. 실제 구현 시 별도 레포지토리에서 진행 예정.
        </div>
      </div>
    </div>
  )
}

function Section({ number, title, subtitle, items, highlight }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
        <span style={{
          fontSize: '11px', fontWeight: 700,
          color: highlight ? '#a07840' : '#a8a49e',
          letterSpacing: '0.04em',
        }}>
          {number}
        </span>
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a1916' }}>{title}</span>
      </div>
      <div style={{ fontSize: '12px', color: '#a8a49e', marginBottom: '12px', marginLeft: '28px' }}>
        {subtitle}
      </div>
      <ul style={{ margin: 0, paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {items.map((item, i) => (
          <li key={i} style={{ fontSize: '13px', color: '#4a4744', lineHeight: 1.6 }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
