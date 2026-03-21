# Co-Study UX — 리서치 아카이브

> AI 시대에 진짜로 작동하는 학습 도우미를 만든다.

디자인씽킹 수업 팀 프로젝트의 리서치·기록 아카이브 웹사이트.
팀이 수집한 공감 데이터, UX 분석, VPC, 프로토타입 결과물을 한 곳에 쌓는다.

**배포:** https://co-study-ux.vercel.app

---

## 왜 이 프로젝트인가

생성형 AI가 널리 쓰이면서 학생들은 AI로 공부하고 과제를 한다.
그런데 결과는 들쑥날쑥하다. 차이는 AI 성능이 아니었다.

> **차이는 내 머릿속에 틀이 있었냐 없었냐였다.**

기존 학습 AI 플랫폼은 정보를 AI → 사용자 방향으로 흘린다.
우리는 방향을 뒤집는다. **사용자가 먼저 설명하고 → AI가 반응하는 구조.**

---

## 디자인씽킹 프로세스

```
Empathize
├── 팀원 개인의 학습 경험 수집
├── 기존 학습 AI 플랫폼 UX 분석
└── 사용자 니즈 수집
        ↓
Define + Ideate (VPC)
├── Customer Profile: Jobs / Pains / Gains
└── Value Proposition: Pain Relievers / Gain Creators / Product
        ↓
Prototype
├── Figma 플로우 다이어그램
└── Claude Code MVP
        ↓
Test
└── 소규모 실제 사용자 테스트
```

이 사이트는 각 단계의 결과물을 팀원 모두가 실시간으로 쌓고 볼 수 있는 아카이브다.

---

## 탭 구조

| 탭 | 내용 | 방식 |
|----|------|------|
| **Introduction** | 프로젝트 배경·목표, 팀 소개, 디자인씽킹 단계 흐름 | 정적 |
| **Empathize: Experience** | 팀원 개인의 학습 경험 카드 (상황·행동·결과·인사이트) | Firebase |
| **Empathize: Service UX** | 경쟁 학습 AI 플랫폼 UX 분석 아카이브 | Firebase |
| **VPC** | Value Proposition Canvas — 리서치가 쌓일수록 업데이트 | Firebase |
| **Prototype** | Figma 링크, 이후 MVP 링크/임베드 | 정적 + 외부 링크 |

---

## 기술 스택

- **React + Vite** — 프론트엔드
- **Firebase Firestore** — 팀원 공동 데이터 저장
- **Vercel** — 배포 및 자동 CI

---

## 로컬 실행

```bash
npm install
npm run dev
```

빌드 확인:

```bash
npm run build
npm run preview
```

---

## 팀

| 이름 | 전공 | 역할 |
|------|------|------|
| 박준환 | AI/DS | PM + 개발 |
| 팀원1 | 경영+BA | 기획 |
| 팀원2 | 경영+BA | UX 분석 |
| 팀원3 | 디자인 | UI/UX 설계 |
| 팀원4 | 일문+BA | UX 분석 |

---

## 레포 구조

```
src/
├── components/        # 탭별 컴포넌트
├── lib/               # Firebase 쿼리 함수
├── pages/             # 페이지 단위 컴포넌트
docs/
├── develop.md         # 개발 스펙 상세
└── project_goal.md    # 프로젝트 목표 및 VPC 초안
```
