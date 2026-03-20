# develop.md — Co-Study UX Archive 개발 맥락

## 프로젝트 개요

디자인씽킹 수업 팀 프로젝트의 리서치/기록 아카이브 웹사이트.  
React + Vite + Firebase 기반. Vercel 배포 중.  
레포: https://github.com/unipjh/co-study-ux  
배포: https://co-study-ux.vercel.app

---

## 현재 상태

- 기존에 UX 분석 아카이빙 기능이 구현되어 있음
- Firebase Firestore에 분석 데이터 저장 중
- 탭 구조가 있으나 리팩토링 필요

---

## 해야 할 작업: 탭 구조 개편

### 변경 전 → 변경 후

기존 UX 분석 탭 → `Empathize: Service UX`로 이름 변경

### 추가할 탭 (순서대로)

```
1. Introduction
2. Empathize: Experience
3. Empathize: Service UX      ← 기존 탭 이름 변경
4. Empathize: User Needs      ← 선택적, 나중에 추가 가능
5. VPC
6. Prototype
```

---

## 각 탭 상세 스펙

### 1. Introduction
- 프로젝트 배경/목표 텍스트 표시 (정적 콘텐츠)
- 팀 소개 카드 (팀원 이름, 전공, 역할)
- 디자인씽킹 단계 흐름 표시 (현재 단계 하이라이트)
- Firebase 연동 불필요, 정적으로 구현

### 2. Empathize: Experience
- 팀원 학습 경험 카드 형태로 아카이빙
- Firebase에 저장/조회
- 카드 항목:
  - 작성자 이름
  - 상황 (어떤 과목/맥락)
  - 행동 (어떻게 공부했나)
  - 결과 (잘 됐나 안 됐나)
  - 인사이트 (왜 그랬을 것 같나)
- 새 경험 추가 폼 포함

### 3. Empathize: Service UX
- 기존 UX 분석 기능 그대로 유지
- 탭 이름만 변경
- Firebase 연동 유지

### 4. VPC (Value Proposition Canvas)
- 두 섹션: Customer Profile / Value Proposition
- Customer Profile: Jobs / Pains / Gains
- Value Proposition: Pain Relievers / Gain Creators / Products & Services
- 각 항목 Firebase에 저장 (팀원 누구나 추가 가능)
- UX 분석 진행될수록 업데이트되는 living document
- 태그 형태로 항목 추가/삭제 가능하면 좋음

### 5. Prototype
- 1단계: Figma 링크 버튼 (외부 링크 이동)
- 2단계: MVP 링크 or 임베드 (나중에 추가)
- 현재는 "준비 중" 상태로 플레이스홀더 표시

---

## 기술 스택

- React + Vite
- Firebase Firestore (데이터 저장)
- Vercel (배포)
- 스타일: 기존 CSS 유지 (디자인 팀원이 나중에 개선 예정)

---

## 주의사항

- 디자인은 지금 신f경 쓰지 않음. 기능 동작 우선.
- 기존 UX 분석 기능(Empathize: Service UX)은 건드리지 않음.
- Firebase config는 기존 코드에서 그대로 사용.
- 탭 간 이동은 URL 변경 없이 상태로 관리해도 됨.