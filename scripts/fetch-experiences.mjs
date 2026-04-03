/**
 * Firestore REST API로 experiences 컬렉션 전체 조회
 * 사용법: node scripts/fetch-experiences.mjs
 */

const PROJECT_ID = 'co-study-ux'
const API_KEY = 'AIzaSyCyXUxBMhJ1jEgeSkQNTEptBIlcLG0m_PA'
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

function parseValue(val) {
  if (!val) return null
  if ('stringValue' in val) return val.stringValue
  if ('integerValue' in val) return Number(val.integerValue)
  if ('booleanValue' in val) return val.booleanValue
  if ('timestampValue' in val) return val.timestampValue
  if ('nullValue' in val) return null
  return null
}

function parseDoc(doc) {
  const id = doc.name.split('/').pop()
  const fields = {}
  for (const [k, v] of Object.entries(doc.fields ?? {})) {
    fields[k] = parseValue(v)
  }
  return { id, ...fields }
}

async function fetchAll(collectionId) {
  const docs = []
  let pageToken = undefined

  while (true) {
    const url = new URL(`${BASE}/${collectionId}`)
    url.searchParams.set('key', API_KEY)
    url.searchParams.set('pageSize', '300')
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    const res = await fetch(url.toString())
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`HTTP ${res.status}: ${text}`)
    }

    const data = await res.json()
    if (data.documents) {
      docs.push(...data.documents.map(parseDoc))
    }
    if (data.nextPageToken) {
      pageToken = data.nextPageToken
    } else {
      break
    }
  }

  return docs
}

const experiences = await fetchAll('experiences')

// createdAt 기준 오래된 순으로 정렬
experiences.sort((a, b) => {
  const ta = a.createdAt ?? ''
  const tb = b.createdAt ?? ''
  return ta < tb ? -1 : ta > tb ? 1 : 0
})

console.log(JSON.stringify(experiences, null, 2))
console.error(`\n총 ${experiences.length}개 문서 조회 완료`)
