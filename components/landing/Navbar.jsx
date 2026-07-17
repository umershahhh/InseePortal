'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(2,8,16,0.85)', backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <LogoMark />
          <span style={{ fontFamily: 'var(--font-libre)', fontWeight: 800, fontSize: '1.25rem', color: '#F1F5F9', letterSpacing: '-0.02em' }}>
            INSEE
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="hidden-mobile">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how-it-works">How it works</NavLink>
          <NavLink href="#technology">Technology</NavLink>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/login" style={{
            fontFamily: 'var(--font-dm)', fontSize: '0.875rem', fontWeight: 500,
            color: '#94A3B8', textDecoration: 'none', padding: '8px 16px',
            transition: 'color 0.2s',
          }}>
            Sign in
          </Link>
          <Link href="/login" className="btn-primary" style={{ padding: '9px 20px', fontSize: '0.875rem' }}>
            Open Dashboard
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
      `}</style>
    </nav>
  )
}

function NavLink({ href, children }) {
  return (
    <Link href={href} style={{
      fontFamily: 'var(--font-dm)', fontSize: '0.875rem', fontWeight: 500,
      color: '#94A3B8', textDecoration: 'none', padding: '8px 14px', borderRadius: 8,
      transition: 'color 0.2s, background 0.2s',
    }}
      onMouseEnter={e => { e.target.style.color = '#F1F5F9'; e.target.style.background = 'rgba(255,255,255,0.05)' }}
      onMouseLeave={e => { e.target.style.color = '#94A3B8'; e.target.style.background = 'transparent' }}>
      {children}
    </Link>
  )
}

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
      <circle cx="16" cy="20" r="2.5" fill="white" />
      <circle cx="16" cy="20" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <path d="M16 4 Q14 12 16 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 6 Q10 9 14 11" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 6 Q22 9 18 11" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
    </svg>
  )
}
