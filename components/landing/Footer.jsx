'use client'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'

export default function Footer() {
  const { theme, toggle } = useTheme()

  return (
    <footer style={{ background:'var(--l-surface)', borderTop:'1px solid var(--l-border)', padding:'56px 24px 36px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>

        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:48, marginBottom:48 }} className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <LogoSVG />
              <span style={{ fontFamily:'var(--font-libre)', fontWeight:800, fontSize:'1.2rem', color:'var(--l-text)', letterSpacing:'-0.02em' }}>INSEE</span>
            </div>
            <p style={{ fontFamily:'var(--font-dm)', fontSize:'0.875rem', lineHeight:1.7, color:'var(--l-muted)', maxWidth:280, marginBottom:22 }}>
              An intelligent assistive cane system combining AI detection, real-time GPS, and caretaker monitoring for visually impaired individuals.
            </p>
            <button onClick={toggle} style={{ display:'flex', alignItems:'center', gap:8, background:'var(--l-bg)', border:'1px solid var(--l-border)', borderRadius:9, padding:'8px 14px', cursor:'pointer', fontFamily:'var(--font-dm)', fontSize:'0.8rem', color:'var(--l-muted)', transition:'border-color .2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(37,99,235,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--l-border)'}>
              {theme === 'dark' ? <><SunIcon /> Light Mode</> : <><MoonIcon /> Dark Mode</>}
            </button>
          </div>

          {[
            { title:'System',  links:['Dashboard','Admin Panel','Sign In'] },
            { title:'Project', links:['About INSEE','Hardware Spec','Research'] },
            { title:'Contact', links:['GitHub','University','Documentation'] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontFamily:'var(--font-dm)', fontWeight:600, fontSize:'0.78rem', color:'var(--l-text)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:18 }}>{col.title}</div>
              {col.links.map(l => (
                <Link key={l} href="/login"
                  style={{ display:'block', fontFamily:'var(--font-dm)', fontSize:'0.875rem', color:'var(--l-muted)', textDecoration:'none', marginBottom:12, transition:'color .2s' }}
                  onMouseEnter={e => e.target.style.color='var(--l-text)'}
                  onMouseLeave={e => e.target.style.color='var(--l-muted)'}>
                  {l}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:24, borderTop:'1px solid var(--l-border)', flexWrap:'wrap', gap:12 }}>
          <div style={{ fontFamily:'var(--font-dm)', fontSize:'0.8rem', color:'var(--l-muted)' }}>
            © 2025 INSEE. Final Year Project — Computer Science.
          </div>
          <div className="live-badge">
            <span className="live-dot" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  )
}

function LogoSVG() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="url(#ft-lg)" />
      <circle cx="16" cy="20" r="2.5" fill="white" />
      <circle cx="16" cy="20" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <path d="M16 4 Q14 12 16 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="ft-lg" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#06B6D4"/>
        </linearGradient>
      </defs>
    </svg>
  )
}
function SunIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="#F59E0B" strokeWidth="2"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/></svg> }
function MoonIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/></svg> }
