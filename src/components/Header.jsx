import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../lib/firebase'
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth'

const provider = new GoogleAuthProvider()

export default function Header() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    return onAuthStateChanged(auth, setUser)
  }, [])

  const handleLogin = () => signInWithPopup(auth, provider).catch(console.error)
  const handleLogout = () => signOut(auth).catch(console.error)

  return (
    <header style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      className="bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#a07840', fontWeight: 600, fontSize: '14px' }}>
            co-study-ux
          </span>
          <span style={{ color: '#6b6860', fontSize: '13px' }}>/ AI UX 아카이브</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span style={{ fontSize: '13px', color: '#6b6860', fontFamily: 'JetBrains Mono, monospace' }}>
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  fontSize: '13px',
                  color: '#6b6860',
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              style={{
                fontSize: '13px',
                color: '#a07840',
                border: '1px solid rgba(160,120,64,0.3)',
                borderRadius: '6px',
                padding: '4px 12px',
                background: 'rgba(160,120,64,0.05)',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Google 로그인
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
