'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useTheme } from '@/components/ThemeProvider'

const NAV_LINKS = ['Features', 'How it works', 'Technology', 'About']

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled,  setScrolled]  = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // close menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 768) setMenuOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  function closeMenu() { setMenuOpen(false) }

  return (
    <>
      <nav className="landing-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: scrolled
          ? (theme === 'dark' ? 'rgba(2,8,16,0.92)' : 'rgba(255,255,255,0.94)')
          : (theme === 'dark' ? 'rgba(2,8,16,0.6)' : 'rgba(255,255,255,0.7)'),
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        borderBottom: scrolled ? '1px solid var(--l-border)' : '1px solid transparent',
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>

          {/* Logo */}
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
            <LogoSVG />
            <span style={{ fontFamily:'var(--font-libre)', fontWeight:800, fontSize:'1.25rem', color:'var(--l-text)', letterSpacing:'-0.02em' }}>INSEE</span>
          </Link>

          {/* Desktop links */}
          <div className="nav-desktop" style={{ display:'flex', alignItems:'center', gap:2 }}>
            {NAV_LINKS.map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
                style={{ fontFamily:'var(--font-dm)', fontSize:'0.875rem', fontWeight:500, color:'var(--l-muted)', textDecoration:'none', padding:'7px 13px', borderRadius:8, transition:'color .2s, background .2s' }}
                onMouseEnter={e => { e.target.style.color='var(--l-text)'; e.target.style.background='rgba(148,163,184,0.1)' }}
                onMouseLeave={e => { e.target.style.color='var(--l-muted)'; e.target.style.background='transparent' }}>
                {l}
              </a>
            ))}
          </div>

          {/* Right controls */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>

            {/* Theme toggle */}
            <button onClick={toggle} title={theme==='dark'?'Switch to light mode':'Switch to dark mode'}
              style={{ width:36, height:36, borderRadius:9, cursor:'pointer', background:'var(--l-surface)', border:'1px solid var(--l-border)', display:'flex', alignItems:'center', justifyContent:'center', transition:'background .2s, transform .15s' }}
              onMouseEnter={e => e.currentTarget.style.transform='scale(1.08)'}
              onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* CTA — hidden on mobile */}
            <Link href="/login" className="btn-primary nav-desktop" style={{ padding:'9px 18px', fontSize:'0.85rem' }}>
              Dashboard
            </Link>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              style={{
                display:'none', width:40, height:40, borderRadius:10,
                background: menuOpen ? 'rgba(37,99,235,0.12)' : 'var(--l-surface)',
                border:`1px solid ${menuOpen ? 'rgba(37,99,235,0.3)' : 'var(--l-border)'}`,
                alignItems:'center', justifyContent:'center', cursor:'pointer',
                flexDirection:'column', gap:5, padding:'10px',
                transition:'background .2s, border-color .2s',
              }}
              className="hamburger-btn">
              {/* Animated bars */}
              <span style={{
                display:'block', width:'100%', height:2, borderRadius:2,
                background: menuOpen ? '#2563EB' : 'var(--l-muted)',
                transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
                transition:'transform .25s ease, background .2s',
              }} />
              <span style={{
                display:'block', width:'70%', height:2, borderRadius:2, alignSelf:'flex-start',
                background: menuOpen ? 'transparent' : 'var(--l-muted)',
                opacity: menuOpen ? 0 : 1,
                transition:'opacity .2s, background .2s',
              }} />
              <span style={{
                display:'block', width:'100%', height:2, borderRadius:2,
                background: menuOpen ? '#2563EB' : 'var(--l-muted)',
                transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
                transition:'transform .25s ease, background .2s',
              }} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <div style={{
          maxHeight: menuOpen ? 400 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s cubic-bezier(.4,0,.2,1)',
          background: theme==='dark' ? 'rgba(4,13,28,0.98)' : 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(18px)',
          borderTop: menuOpen ? '1px solid var(--l-border)' : 'none',
        }}>
          <div style={{ padding:'12px 20px 20px' }}>
            {NAV_LINKS.map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
                onClick={closeMenu}
                style={{ display:'flex', alignItems:'center', gap:10, fontFamily:'var(--font-dm)', fontSize:'1rem', fontWeight:500, color:'var(--l-muted)', padding:'13px 4px', borderBottom:'1px solid var(--l-border)', textDecoration:'none', transition:'color .2s' }}
                onMouseEnter={e => e.currentTarget.style.color='var(--l-text)'}
                onMouseLeave={e => e.currentTarget.style.color='var(--l-muted)'}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#2563EB', flexShrink:0 }} />
                {l}
              </a>
            ))}
            <div style={{ marginTop:16, display:'flex', gap:10 }}>
              <Link href="/login" className="btn-primary" style={{ flex:1, justifyContent:'center', fontSize:'0.9rem' }} onClick={closeMenu}>
                Open Dashboard
              </Link>
              <button onClick={() => { toggle(); closeMenu() }} style={{ padding:'10px 16px', borderRadius:9, border:'1px solid var(--l-border)', background:'var(--l-surface)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .hamburger-btn  { display: flex !important; }
          .nav-desktop    { display: none !important; }
        }
      `}</style>
    </>
  )
}

function LogoSVG() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="url(#nav-lg)" />
      <circle cx="16" cy="20" r="2.5" fill="white" />
      <circle cx="16" cy="20" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <path d="M16 4 Q14 12 16 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 6 Q10 9 14 11" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 6 Q22 9 18 11" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="nav-lg" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#22D3EE"/>
        </linearGradient>
      </defs>
    </svg>
  )
}
function SunIcon()  { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="#F59E0B" strokeWidth="2"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/></svg> }
function MoonIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> }
