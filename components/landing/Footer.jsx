'use client'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--l-surface)', borderTop: '1px solid var(--l-border)', padding: '56px 24px 40px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 56 }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <LogoMark />
              <span style={{ fontFamily: 'var(--font-libre)', fontWeight: 800, fontSize: '1.2rem', color: '#F1F5F9', letterSpacing: '-0.02em' }}>INSEE</span>
            </div>
            <p style={{ fontFamily: 'var(--font-dm)', fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--l-muted)', maxWidth: 300 }}>
              An intelligent assistive cane system combining AI obstacle detection, real-time GPS, and caretaker monitoring for visually impaired individuals.
            </p>
          </div>

          {/* System */}
          <div>
            <div style={{ fontFamily: 'var(--font-dm)', fontWeight: 600, fontSize: '0.8rem', color: '#F1F5F9', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>System</div>
            {['Dashboard', 'Admin Panel', 'Sign In', 'Documentation'].map(l => (
              <Link key={l} href="/login" style={{ display: 'block', fontFamily: 'var(--font-dm)', fontSize: '0.875rem', color: 'var(--l-muted)', textDecoration: 'none', marginBottom: 12, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#F1F5F9'}
                onMouseLeave={e => e.target.style.color = 'var(--l-muted)'}>
                {l}
              </Link>
            ))}
          </div>

          {/* Project */}
          <div>
            <div style={{ fontFamily: 'var(--font-dm)', fontWeight: 600, fontSize: '0.8rem', color: '#F1F5F9', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>Project</div>
            {['About INSEE', 'Hardware Spec', 'Research', 'Contact'].map(l => (
              <div key={l} style={{ fontFamily: 'var(--font-dm)', fontSize: '0.875rem', color: 'var(--l-muted)', marginBottom: 12 }}>{l}</div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 28, borderTop: '1px solid var(--l-border)' }}>
          <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.8rem', color: 'var(--l-muted)' }}>
            © 2025 INSEE. Final Year Project — Computer Science.
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div className="live-badge">
              <span className="live-dot" />
              All systems operational
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="url(#ft-logo-grad)" />
      <circle cx="16" cy="20" r="2.5" fill="white" />
      <circle cx="16" cy="20" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <path d="M16 4 Q14 12 16 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="ft-logo-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
    </svg>
  )
}
