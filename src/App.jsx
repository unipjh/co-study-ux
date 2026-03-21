import { useState, useEffect, Component } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import ObsDetail from './pages/ObsDetail'
import { subscribeChecklist, toggleChecklistItem } from './lib/firestore'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Noto Sans KR, sans-serif' }}>
          <p style={{ color: '#6b6860', fontSize: '14px' }}>
            문제가 생겼습니다. 페이지를 새로고침해 주세요.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '12px', padding: '6px 16px', borderRadius: '6px',
              border: '1px solid rgba(0,0,0,0.12)', background: 'white',
              fontSize: '13px', color: '#6b6860', cursor: 'pointer',
            }}
          >
            다시 시도
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const TABS = [
  { key: 'introduction', label: 'Introduction' },
  { key: 'experience', label: 'Empathize: Experience' },
  { key: 'service-ux', label: 'Empathize: Service UX' },
  { key: 'vpc', label: 'VPC' },
  { key: 'prototype', label: 'Prototype' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('introduction')
  const [checked, setChecked] = useState({})

  useEffect(() => {
    return subscribeChecklist((data) => setChecked(data))
  }, [])

  function handleToggle(key, current) {
    const newVal = !current
    setChecked((prev) => ({ ...prev, [key]: newVal }))
    toggleChecklistItem(key, newVal)
  }

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#ffffff' }}>
        <Header tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home activeTab={activeTab} checked={checked} onToggle={handleToggle} />} />
            <Route path="/obs/:id" element={<ObsDetail />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  )
}
