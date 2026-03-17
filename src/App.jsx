import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import ObsDetail from './pages/ObsDetail'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#ffffff' }}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/obs/:id" element={<ObsDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
