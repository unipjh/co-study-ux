# CLAUDE.md — co-study-ux

## 프로젝트 개요

디자인씽킹 수업 팀 프로젝트의 리서치/기록 아카이브 웹사이트.  
React + Vite + Firebase Firestore + Vercel.  
배포: https://co-study-ux.vercel.app

---

## 핵심 맥락 파일

작업 전 반드시 읽을 것:

- `docs/develop.md` — 탭 구조, 각 탭 상세 스펙, 기술 스택 상세
- `docs/project_goal.md` — 프로젝트 목표, VPC 초안, 팀 구성
- `docs/` — 추가 문서가 있으면 여기 참고

---

## 작업 원칙

### Plan → Execute 절차 필수

**모든 작업은 이 순서로 진행한다:**

1. **Plan** — 작업 시작 전 반드시 계획을 먼저 제시한다
   - 무엇을 바꾸는지
   - 어떤 파일을 건드리는지
   - 예상되는 부작용은 없는지
2. **확인** — 준환이 Plan을 승인하면 Execute
3. **Execute** — 계획대로만 구현. 범위 벗어나지 않음
4. **보고** — 완료 후 변경사항 요약

> Plan 없이 바로 코드 수정하지 않는다.

---

## 코드 작업 규칙

**건드리지 말 것**
- Firebase config (기존 연결 유지)
- 기존 Empathize: Service UX 기능 (데이터 구조, CRUD 로직)
- vercel.json, .npmrc 설정

**디자인 관련**
- 지금은 기능 동작 우선. 스타일 최소화.
- 기존 CSS 클래스명 유지. 새 스타일은 새 클래스로.
- 디자인 팀원이 나중에 Figma 기반으로 전면 개선할 예정.

**컴포넌트 구조**
- 탭별로 컴포넌트 분리 (`/src/components/탭명/`)
- Firebase 쿼리는 컴포넌트 안에서 직접 쓰지 말고 별도 함수로 분리
- 새 Firestore 컬렉션 추가 시 이름 먼저 보고 받고 생성

---

## 현재 탭 구조 (목표)

```
1. Introduction         ← 신규 (정적)
2. Empathize: Experience ← 신규 (Firebase)
3. Empathize: Service UX ← 기존 탭 이름 변경만
4. VPC                  ← 신규 (Firebase, living document)
5. Prototype            ← 신규 (정적 + 외부 링크)
```

---

## Firebase 컬렉션 구조

**기존 (건드리지 말 것)**
- 기존 UX 분석 컬렉션 — 이름 확인 후 유지

**신규 추가 예정**
- `experiences` — Empathize: Experience 카드
- `vpc_items` — VPC 항목 (section 필드로 구분)

---

## 자주 쓰는 커맨드

```bash
npm run dev      # 로컬 개발 서버
npm run build    # 빌드
npm run preview  # 빌드 결과 미리보기
```

---

## 작업 요청 방식 (준환 → Claude Code)

좋은 요청 예시:
> "Empathize: Experience 탭에 카드 추가 폼 만들어줘.  
> 필드: 작성자 / 상황 / 행동 / 결과 / 날것 느낌.  
> Firebase experiences 컬렉션에 저장. 저장 후 목록 새로고침."

나쁜 요청 예시:
> "경험 탭 만들어줘" (범위 불명확)

---

## /clear 후 재시작 시 체크리스트

새 대화 열면 이 순서로:

1. 이 파일(CLAUDE.md) 읽기
2. `develop.md` 읽기
3. 현재 작업 중인 파일 확인 (`src/` 구조 파악)
4. 이전 작업 내용은 git log 또는 준환에게 확인
5. Plan 제시 후 작업 시작