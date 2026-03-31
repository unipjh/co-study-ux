import { useReducer, useRef, useCallback } from 'react'
import { STAGE_IDS } from '../constants/stageConfig'

const API = 'http://127.0.0.1:8000'

const initialState = {
  status: 'idle',      // idle | uploading | streaming | done | error
  docId: null,
  stages: Object.fromEntries(
    STAGE_IDS.map((id) => [id, { status: 'pending', result: null, summary: null }])
  ),
  activeStage: null,
  finalResult: null,
  error: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'UPLOAD_START':
      return { ...initialState, status: 'uploading' }

    case 'UPLOAD_DONE':
      return { ...state, status: 'streaming', docId: action.docId }

    case 'STAGE_START':
      return {
        ...state,
        activeStage: action.stage,
        stages: {
          ...state.stages,
          [action.stage]: { ...state.stages[action.stage], status: 'running', startedAt: Date.now(), doneAt: null },
        },
      }

    case 'STAGE_DONE':
      return {
        ...state,
        stages: {
          ...state.stages,
          [action.stage]: { status: 'done', result: action.result, summary: action.summary, startedAt: state.stages[action.stage].startedAt, doneAt: Date.now() },
        },
      }

    case 'PIPELINE_DONE':
      return { ...state, status: 'done', finalResult: action.result }

    case 'ERROR':
      return { ...state, status: 'error', error: action.error }

    default:
      return state
  }
}

export function usePipelineSSE() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const esRef = useRef(null)

  const run = useCallback(async (file, docTitle) => {
    dispatch({ type: 'UPLOAD_START' })

    // 1. POST /pipeline/run
    const form = new FormData()
    form.append('file', file)
    form.append('doc_title', docTitle)

    let docId
    try {
      const res = await fetch(`${API}/pipeline/run`, { method: 'POST', body: form })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || '업로드 실패')
      }
      const json = await res.json()
      docId = json.doc_id
    } catch (e) {
      dispatch({ type: 'ERROR', error: e.message })
      return
    }

    dispatch({ type: 'UPLOAD_DONE', docId })

    // 2. SSE 연결
    const es = new EventSource(`${API}/pipeline/stream/${docId}`)
    esRef.current = es

    es.addEventListener('stage_start', (e) => {
      const data = JSON.parse(e.data)
      dispatch({ type: 'STAGE_START', stage: data.stage })
    })

    es.addEventListener('stage_done', (e) => {
      const data = JSON.parse(e.data)
      dispatch({ type: 'STAGE_DONE', stage: data.stage, result: data.result, summary: data.summary })
    })

    es.addEventListener('stage_error', (e) => {
      const data = JSON.parse(e.data)
      dispatch({ type: 'ERROR', error: data.error })
      es.close()
    })

    es.addEventListener('pipeline_done', (e) => {
      const data = JSON.parse(e.data)
      dispatch({ type: 'PIPELINE_DONE', result: data })
      es.close()
    })

    es.onerror = () => {
      dispatch({ type: 'ERROR', error: 'SSE 연결 오류' })
      es.close()
    }
  }, [])

  return { state, run }
}
