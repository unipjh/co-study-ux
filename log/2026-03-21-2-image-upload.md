# 2026-03-21 — Service UX 이미지 업로드 + 주요 기능 토글 섹션 추가

## 작업 배경

AI 학습 서비스는 시각적 UI/UX가 중요한 만큼, 텍스트만으로는 관찰 내용을 충분히 기록하기 어려움.
→ 온보딩 섹션에 스크린샷 첨부 기능 추가.
→ 서비스별 주요 기능을 토글 단위로 구조화해서 기록할 수 있는 섹션 추가.

이미지 저장소로 Firebase Storage 검토 → 2024년 11월 이후 Spark 플랜에서 제외됨 확인.
→ 무료(카드 없음, 기간 제한 없음) Cloudinary로 전환.

---

## 변경 파일 목록

### 신규 생성
| 파일 | 설명 |
|------|------|
| `src/lib/cloudinary.js` | Cloudinary unsigned upload 함수 (`uploadImage`) |
| `src/components/ImageUploader.jsx` | 이미지 선택 → Cloudinary 업로드 → 썸네일 미리보기 컴포넌트 |
| `src/components/FeatureToggleEditor.jsx` | 주요 기능 토글 편집기 (기능 추가/삭제, 제목·설명·이미지 입력) |

### 수정
| 파일 | 변경 내용 |
|------|-----------|
| `src/lib/firebase.js` | Storage export 제거 (Cloudinary로 대체됨) |
| `src/components/ObsForm.jsx` | ① 온보딩 섹션에 ImageUploader 추가 ② 주요 기능 섹션(FeatureToggleEditor) 추가 ③ 저장 시 `onboardingImages`, `features` 포함 |
| `src/pages/ObsDetail.jsx` | ① 온보딩 이미지 표시 ② 주요 기능 읽기 전용 토글(FeatureToggleView) 추가 |

---

## 데이터 구조 변경

기존 `observations` 컬렉션 문서에 필드 추가 (기존 문서는 영향 없음):

```js
// 추가된 최상위 필드
{
  onboardingImages: ['https://res.cloudinary.com/...', ...],  // 온보딩 이미지 URL 배열
  features: [
    {
      title: '기능 이름',
      description: '기능 설명',
      images: ['https://res.cloudinary.com/...', ...],
    },
    ...
  ],
}
```

Firestore 구조 변경은 없음. 기존 문서에 `onboardingImages`, `features` 필드가 없으면 빈 배열로 처리됨.

---

## 이미지 저장 방식

```
사용자가 이미지 선택
  ↓
Cloudinary API (unsigned upload)
  ↓
secure_url 반환
  ↓
URL 배열로 React state 저장
  ↓
저장 버튼 → Firestore에 URL 배열 저장
```

이미지 파일 자체는 Cloudinary에, URL 문자열만 Firestore에 저장.

---

## 환경변수 (필수)

```
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...    ← Unsigned preset
```

로컬 `.env.local` 과 Vercel 환경변수 두 곳 모두 등록 필요.

---

## Cloudinary 설정 방법

1. cloudinary.com 가입 (무료, 카드 없음)
2. 대시보드 → Cloud Name 확인
3. Settings → Upload → Upload presets → Add upload preset
   - Signing Mode: **Unsigned**
   - Folder: `obs-images` (선택)
4. Preset name → `VITE_CLOUDINARY_UPLOAD_PRESET`에 등록

---

## 건드리지 않은 것

- Firestore 보안 규칙
- 기존 observations 데이터 구조 및 CRUD 로직
- `s2Fields`, `s3Fields`, `ratings` 등 기존 필드
- FeatureToggleEditor, ObsDetail 이외의 컴포넌트
