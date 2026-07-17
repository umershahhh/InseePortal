'use client'
import { useState } from 'react'
import { useCamera } from '@/hooks/useCamera'

export default function CameraFeed({ personId, alertActive = false }) {
  const [expanded, setExpanded] = useState(alertActive)
  const frameUrl = useCamera(personId, expanded)

  return (
    <div className="dash-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-libre)', fontWeight: 700, fontSize: '1rem', color: 'var(--d-text)', letterSpacing: '-0.01em' }}>
            Camera Feed
          </h3>
          <p style={{ fontFamily: 'var(--font-dm)', fontSize: '0.78rem', color: 'var(--d-muted)', marginTop: 2 }}>
            {expanded ? 'Snapshot every 3 seconds' : 'Feed paused'}
          </p>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            background: expanded ? 'rgba(220,38,38,0.1)' : 'rgba(37,99,235,0.1)',
            color: expanded ? '#DC2626' : '#2563EB',
            border: `1px solid ${expanded ? 'rgba(220,38,38,0.2)' : 'rgba(37,99,235,0.2)'}`,
            borderRadius: 8, padding: '7px 16px',
            fontFamily: 'var(--font-dm)', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 7,
          }}
        >
          {expanded ? (
            <><PauseIcon /> Stop feed</>
          ) : (
            <><PlayIcon /> Start feed</>
          )}
        </button>
      </div>

      {/* Frame area */}
      <div style={{
        background: '#0D1E38', borderRadius: 10, overflow: 'hidden',
        aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        {frameUrl ? (
          <>
            <img
              src={frameUrl} alt="Camera feed"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Live badge overlay */}
            <div style={{
              position: 'absolute', top: 10, left: 10,
              background: 'rgba(2,8,16,0.75)', backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6, padding: '4px 10px',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626', animation: 'alertBlink 1s infinite' }} />
              <span style={{ fontFamily: 'var(--font-dm)', fontSize: '0.7rem', fontWeight: 600, color: '#F1F5F9' }}>LIVE</span>
            </div>
            {/* Timestamp */}
            <div style={{
              position: 'absolute', bottom: 10, right: 10,
              background: 'rgba(2,8,16,0.75)', backdropFilter: 'blur(6px)',
              borderRadius: 6, padding: '4px 10px',
              fontFamily: 'var(--font-dm)', fontSize: '0.7rem', color: '#94A3B8',
            }}>
              {new Date().toLocaleTimeString()}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#64748B' }}>
            <CameraOffIcon />
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.82rem', marginTop: 10 }}>
              {expanded ? 'Connecting...' : 'Feed not active'}
            </div>
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.75rem', marginTop: 4, opacity: 0.7 }}>
              {!expanded && 'Start the feed to view camera'}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes alertBlink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      `}</style>
    </div>
  )
}

function PlayIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
}

function PauseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/></svg>
}

function CameraOffIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.4 }}>
      <path d="M23 7l-7 5 7 5V7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
