import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../lib/firebase'
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth'
import { isTeamMember } from '../lib/teamEmails'

const provider = new GoogleAuthProvider()

export default function Header({ tabs = [], activeTab, setActiveTab }) {
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (u && !isTeamMember(u)) {
        setAuthError(true)
        signOut(auth)
        return
      }
      if (u) setAuthError(false)
      setUser(u)
    })
  }, [])

  const handleLogin = () => {
    setAuthError(false)
    signInWithPopup(auth, provider).catch(console.error)
  }
  const handleLogout = () => signOut(auth).catch(console.error)

  return (
    <>
    {authError && (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
      }}>
        <div style={{
          background: '#fff', borderRadius: '12px', padding: '32px 40px',
          maxWidth: '360px', width: '90%', textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚫</div>
          <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px', color: '#1a1a1a' }}>
            접근 불가
          </div>
          <div style={{ fontSize: '14px', color: '#6b6860', marginBottom: '24px', lineHeight: '1.6' }}>
            등록된 팀원 계정이 아닙니다.<br />팀원 구글 계정으로 다시 로그인해 주세요.
          </div>
          <button
            onClick={() => setAuthError(false)}
            style={{
              fontSize: '14px', fontWeight: 600, color: '#fff',
              background: '#a07840', border: 'none', borderRadius: '8px',
              padding: '8px 24px', cursor: 'pointer',
            }}
          >
            확인
          </button>
        </div>
      </div>
    )}
    <header className="bg-white sticky top-0 z-50"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'stretch', padding: '0 40px' }}>

        {/* 좌: 로고 */}
        <Link to="/" onClick={() => setActiveTab('introduction')} className="flex items-center gap-2 no-underline" style={{ justifySelf: 'start' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#a07840', fontWeight: 700, fontSize: '16px' }}>
            co-study-ux
          </span>
          <span style={{ color: '#b0a898', fontSize: '12px' }}>(Archive)</span>
        </Link>

        {/* 중: 탭 네비게이션 */}
        {tabs.length > 0 && (
          <div style={{ display: 'flex', gap: 0 }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '0 16px',
                    height: '48px',
                    background: 'none',
                    border: 'none',
                    borderBottom: `2px solid ${isActive ? '#a07840' : 'transparent'}`,
                    color: isActive ? '#a07840' : '#6b6860',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontFamily: 'inherit',
                    marginBottom: '-1px',
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        )}

        {/* 우: 인증 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifySelf: 'end' }}>
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
    </>
  )
}
