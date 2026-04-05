import { useState } from 'react'
import FeatureSpecModal from './FeatureSpecModal'

const FIGMA_URL = '' // 추후 Figma 링크 채울 것
const MVP_URL = ''  // 추후 MVP 링크 채울 것

export default function PrototypeTab() {
  const [showSpec, setShowSpec] = useState(false)
  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1916', margin: '0 0 6px' }}>
          Prototype
        </h2>
        <p style={{ fontSize: '14px', color: '#6b6860', margin: 0 }}>
          Figma 디자인과 실제 동작하는 MVP 링크를 여기에 모읍니다.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* 기능 명세서 */}
        <div style={{
          border: '1px solid rgba(160,120,64,0.3)', borderRadius: '10px',
          padding: '20px', background: '#fffcf7',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1916', marginBottom: '4px' }}>
                기능 명세서
              </div>
              <div style={{ fontSize: '13px', color: '#6b6860' }}>
                자료 렌더링 · 텍스트 선택 · AI 학습 인터랙션
              </div>
            </div>
            <button
              onClick={() => setShowSpec(true)}
              style={{
                padding: '7px 16px', borderRadius: '6px',
                border: 'none', background: '#a07840', color: 'white',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              보기
            </button>
          </div>
        </div>

        {showSpec && <FeatureSpecModal onClose={() => setShowSpec(false)} />}

        {/* Figma */}
        <div style={{
          border: '1px solid rgba(0,0,0,0.08)', borderRadius: '10px',
          padding: '20px', background: '#fafaf9',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1916', marginBottom: '4px' }}>
                Figma 디자인
              </div>
              <div style={{ fontSize: '13px', color: '#6b6860' }}>
                UI/UX 플로우 및 와이어프레임
              </div>
            </div>
            {FIGMA_URL ? (
              <a
                href={FIGMA_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '7px 16px', borderRadius: '6px',
                  border: 'none', background: '#1a1916', color: 'white',
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                  textDecoration: 'none', display: 'inline-block',
                }}
              >
                열기
              </a>
            ) : (
              <span style={{
                fontSize: '12px', color: '#a8a49e',
                background: '#f0ede8', padding: '5px 12px', borderRadius: '20px',
              }}>
                준비 중
              </span>
            )}
          </div>
        </div>

        {/* MVP */}
        <div style={{
          border: '1px solid rgba(0,0,0,0.08)', borderRadius: '10px',
          padding: '20px', background: '#fafaf9',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1916', marginBottom: '4px' }}>
                MVP (Claude Code 구현)
              </div>
              <div style={{ fontSize: '13px', color: '#6b6860' }}>
                실제 동작하는 최소 기능 프로토타입
              </div>
            </div>
            {MVP_URL ? (
              <a
                href={MVP_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '7px 16px', borderRadius: '6px',
                  border: 'none', background: '#a07840', color: 'white',
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                  textDecoration: 'none', display: 'inline-block',
                }}
              >
                열기
              </a>
            ) : (
              <span style={{
                fontSize: '12px', color: '#a8a49e',
                background: '#f0ede8', padding: '5px 12px', borderRadius: '20px',
              }}>
                준비 중
              </span>
            )}
          </div>
        </div>
      </div>

      <p style={{ fontSize: '12px', color: '#c8c4be', marginTop: '24px' }}>
        링크가 생기면 이 파일의 FIGMA_URL / MVP_URL을 채워주세요.
      </p>
    </div>
  )
}
