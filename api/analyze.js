export const config = { maxDuration: 60 }

function collectImages(observations) {
  const images = []
  for (const obs of observations) {
    const label = `${obs.service}(${obs.scenario})`
    if (obs.onboardingImages?.[0]) {
      images.push({ url: obs.onboardingImages[0], label: `${label} 온보딩` })
    }
    let featCount = 0
    for (const feat of obs.features || []) {
      if (featCount >= 2) break
      if (feat.images?.[0]) {
        images.push({ url: feat.images[0], label: `${label} - ${feat.title}` })
        featCount++
      }
    }
    if (images.length >= 15) break
  }
  return images.slice(0, 15)
}

function buildPrompt(observations) {
  const summary = observations
    .map((obs) => {
      const f = obs.fields || {}
      const r = obs.ratings || {}
      const feats = (obs.features || [])
        .map((ft) => `  - ${ft.title}: ${ft.description || ''}`)
        .join('\n')
      return `### ${obs.service} (분석: ${obs.scenario}, ${obs.date})
자료: ${obs.material}
온보딩: ${f.onboarding || '-'}
AI 개입 방식: ${f.aiStyle || '-'}
마찰 지점: ${f.friction || '-'}
인상적인 순간: ${f.wowMoment || '-'}
핵심 테스트 반응: ${f.coreTest || '-'}
다 쓰고 나서 느낌: ${f.afterFeeling || '-'}
인사이트: ${f.insight || '-'}
주요 기능:
${feats || '  (없음)'}
별점 — 개념탐색: ${r.conceptExploration || '-'}/5, 인사이트유도: ${r.insightInduction || '-'}/5, 사고자극: ${r.thoughtStimulation || '-'}/5, 재사용의향: ${r.reuse || '-'}/5`
    })
    .join('\n\n---\n\n')

  return `당신은 UX 리서치 전문가입니다. 디자인씽킹 수업 팀이 AI 학습 서비스들을 직접 사용해보며 기록한 관찰 데이터입니다. 첨부된 스크린샷도 함께 참고해 분석해주세요.

# 관찰 데이터 (${observations.length}건)

${summary}

---
위 데이터와 스크린샷을 바탕으로 아래 구조로 분석 리포트를 한국어로 작성하세요:

## 📊 서비스별 요약 비교
각 서비스의 핵심 특성 1-2줄 + 별점 비교

## 🔍 공통 UX 패턴
여러 서비스에서 반복되는 UX 패턴 정리

## ⚡ 주요 마찰 지점
공통적으로 나타난 불편함, 개선 필요 지점

## ✨ 인상적인 UX 사례
각 서비스의 잘 된 UX 요소 (이미지와 연결해서 구체적으로)

## 💡 핵심 인사이트
디자인씽킹 관점에서 반영해야 할 핵심 인사이트 3-5가지

## 🎯 설계 방향 제언
새로운 AI 학습 서비스를 만든다면 어떤 방향으로 설계해야 할지`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { observations } = req.body
  if (!observations?.length) {
    return res.status(400).json({ error: 'No observations provided' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })
  }

  // 이미지 URL 수집 (최대 15장)
  const imageRefs = collectImages(observations)

  // 이미지를 병렬로 fetch → base64 변환
  const fetchedImages = await Promise.all(
    imageRefs.map(async ({ url, label }) => {
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(5000) })
        if (!r.ok) return null
        const buf = await r.arrayBuffer()
        const base64 = Buffer.from(buf).toString('base64')
        const mimeType = r.headers.get('content-type')?.split(';')[0] || 'image/jpeg'
        return { base64, mimeType, label }
      } catch {
        return null
      }
    }),
  )

  // Gemini parts 구성: 프롬프트 텍스트 + 이미지 인터리빙
  const parts = [{ text: buildPrompt(observations) }]
  for (const img of fetchedImages.filter(Boolean)) {
    parts.push({ text: `\n[스크린샷: ${img.label}]` })
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } })
  }

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    },
  )

  if (!geminiRes.ok) {
    const err = await geminiRes.text()
    console.error('Gemini API error:', err)
    return res.status(500).json({ error: 'Gemini API 호출 실패' })
  }

  const data = await geminiRes.json()
  const report = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return res.json({ report })
}
