import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import ObsDetail from './pages/ObsDetail'

const TABS = [
  { key: 'introduction', label: 'Introduction' },
  { key: 'experience', label: 'Empathize: Experience' },
  { key: 'service-ux', label: 'Empathize: Service UX' },
  { key: 'vpc', label: 'VPC' },
  { key: 'prototype', label: 'Prototype' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('introduction')

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#ffffff' }}>
        <Header tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
        <Routes>
          <Route path="/" element={<Home activeTab={activeTab} />} />
          <Route path="/obs/:id" element={<ObsDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
