# 2026-03-21 — 탭 이동 시 빈 화면 버그 수정

## 문제

탭을 여러 번 이동하다 보면 갑자기 빈 화면이 뜨는 현상.
새로고침하면 복구됨.

## 원인

두 가지 에러가 동시에 존재했음.

### 1. FIRESTORE INTERNAL ASSERTION FAILED

`IntroductionTab`이 마운트/언마운트될 때마다 `subscribeChecklist`(= `onSnapshot`)가 반복 생성/해제됨.
탭을 빠르게 여러 번 이동하면 Firebase 내부 watch stream 상태 머신이 꼬이며 crash.
이 에러는 React의 ErrorBoundary 바깥(Firebase 비동기 큐)에서 터지기 때문에 앱 전체가 blank가 됨.

### 2. Missing or insufficient permissions

Firestore 보안 규칙에 `checklist` 컬렉션 read 권한이 없어서
`subscribeChecklist` 호출 시 permission 에러 발생.
(blank screen의 직접 원인은 아니지만, 체크리스트가 로드되지 않는 문제)

## 수정 내용

### `src/App.jsx`
- `subscribeChecklist` 구독을 앱 최상위로 이동
- `checked` state와 `handleToggle` 함수를 App에서 관리
- 구독이 앱 수명 동안 딱 한 번만 생성/해제됨 → INTERNAL ASSERTION 버그 해소
- `ErrorBoundary` 컴포넌트 추가 → 향후 렌더 에러 시 blank 대신 "문제가 생겼습니다" 메시지 표시

### `src/pages/Home.jsx`
- `checked`, `onToggle` props를 받아 `IntroductionTab`에 전달

### `src/components/Introduction/IntroductionTab.jsx`
- 자체 `onSnapshot` 구독 제거
- `checked`, `onToggle`을 props로 받아 사용

### `src/lib/firestore.js`
- `subscribeChecklist`에 `onError` 핸들러 추가 → 구독 실패 시 콘솔 로그로 처리

### Firestore Rules (Firebase Console에서 직접 수정)
- `checklist` 컬렉션 추가: `read: if true`, `write: if request.auth != null`
