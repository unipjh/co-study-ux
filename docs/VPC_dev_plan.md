# VPC 탭 발전 계획

## 현재 상태 (Option A — 완료)

페어 기반 3열 그리드 레이아웃.
각 페어(Jobs↔Products, Pains↔Relievers, Gains↔Creators)가 같은 행에 배치되어
연결 관계를 공간적으로 표현.

---

## Option C — 인터랙티브 연결 강조 (예정)

### 트리거 조건

Customer Profile 데이터가 어느 정도 쌓인 후 진행.
(각 섹션에 항목이 5개 이상 누적된 시점 기준으로 판단)

### 목표

정적인 레이아웃에서 한 발 더 나아가,
**호버(Hover) 시 페어 관계를 동적으로 강조**.

### 구현 방안

```
사용자가 Jobs 카드에 마우스를 올리면
→ Products & Services 카드 배경이 살짝 밝아짐 (강조)
→ 중간 ↔ 기호 진하게 + 색상 강조
→ 반대쪽은 dimmed 처리 (opacity 낮춤)
```

**기술 선택지**

| 방법 | 특징 |
|------|------|
| React state (`hoveredPair`) | 가장 직관적. 좌우 독립 카드 간 상태 공유 쉬움. 권장 |
| CSS `:hover` + sibling selector | JS 없이 처리 가능하나, 현재 구조상 형제 선택자 적용 어려움 |

**권장 구현**

```jsx
const [hoveredPair, setHoveredPair] = useState(null)

// 각 행에 onMouseEnter/onMouseLeave
// SectionCard에 isPairHovered / isOtherHovered prop 전달
// isOtherHovered 시 opacity: 0.4 적용
```

---

## Option D — SVG 커넥터 (선택적 고려)

중간 열의 `↔` 기호 대신, 양쪽 카드를 실제로 잇는 SVG 선 렌더링.

**조건**: Option C 이후 디자인 팀의 Figma 개선 작업과 함께 검토.
지금은 오버엔지니어링 가능성 있어 보류.

---

## 고려 사항

- 디자인 팀이 Figma 기반으로 전면 스타일 개선 예정 → Option C 구현 전에 디자인 sync 필요
- Option C는 스타일보다 **동작(behavior)** 변경이므로, 디자인 개선과 병렬 진행 가능
- 모바일 뷰에서 3열 그리드 깨질 수 있음 → 반응형 처리(`@media`) 는 디자인 개선 단계에서 함께 적용

---

## 히스토리

| 날짜 | 내용 |
|------|------|
| 2026-03-21 | Option A 완료 — 페어 기반 3열 그리드 레이아웃 |
| (예정) | Option C — 호버 인터랙션 |
