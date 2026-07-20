'use client'
import { useState } from 'react'
import { useCamera } from '@/hooks/useCamera'

export default function CameraFeed({ personId, alertActive = false }) {
  const [expanded, setExpanded] = useState(alertActive)
  const frameUrl = useCamera(personId, expanded)

  return (
    <div className="dash-card">
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 16,
      }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-libre)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--d-text)', letterSpacing: '-0.01em' }}>
            Camera Feed
          </h3>
          <p style={{ fontFamily: 'var(--font-dm)', fontSize: '0.75rem', color: 'var(--d-muted)', marginTop: 2 }}>
            {expanded ? 'Snapshot every 3 seconds' : 'Feed paused — activate during alerts'}
          </p>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            background: expanded ? 'rgba(220,38,38,0.08)' : 'rgba(37,99,235,0.08)',
            color: expanded ? '#DC2626' : '#2563EB',
            border: `1px solid ${expanded ? 'rgba(220,38,38,0.2)' : 'rgba(37,99,235,0.2)'}`,
            borderRadius: 8, padding: '7px 14px',
            fontFamily: 'var(--font-dm)', fontSize: '0.8rem',
            fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
          {expanded ? <><StopIcon /> Stop</> : <><PlayIcon /> Start</>}
        </button>
      </div>

      {/* Frame area */}
      <div style={{
        background: '#0D1E38',
        borderRadius: 10, overflow: 'hidden',
        aspectRatio: '16/9',
        border: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
      }}>
        {frameUrl ? (
          <>
            <img
              src={frameUrl} alt="Camera feed"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* LIVE badge */}
            <div style={{
              position: 'absolute', top: 10, left: 10,
              background: 'rgba(2,8,16,0.78)', backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
              padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626', animation: 'alertBlink 1s infinite' }} />
              <span style={{ fontFamily: 'var(--font-dm)', fontSize: '0.7rem', fontWeight: 600, color: '#F1F5F9' }}>LIVE</span>
            </div>
            {/* Timestamp */}
            <div style={{
              position: 'absolute', bottom: 10, right: 10,
              background: 'rgba(2,8,16,0.7)', backdropFilter: 'blur(6px)',
              borderRadius: 6, padding: '3px 9px',
              fontFamily: 'var(--font-dm)', fontSize: '0.68rem', color: '#94A3B8',
            }}>
              {new Date().toLocaleTimeString()}
            </div>
          </>
        ) : (
          /* ── Offline state — properly centred ── */
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 12,
          }}>
            <CameraOffIcon />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.875rem', color: '#64748B', fontWeight: 500 }}>
                {expanded ? 'Connecting to camera...' : 'Camera feed is off'}
              </div>
              <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.75rem', color: '#475569', marginTop: 5 }}>
                {!expanded && 'Press Start or trigger an SOS alert'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PlayIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> }
function StopIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor"/></svg> }
function CameraOffIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.3 }}>
      <path d="M23 7l-7 5 7 5V7z" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="1" y="5" width="15" height="14" rx="2" stroke="#94A3B8" strokeWidth="1.5"/>
      <line x1="1" y1="1" x2="23" y2="23" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
