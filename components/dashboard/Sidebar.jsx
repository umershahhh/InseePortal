'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MOCK_CARETAKER } from '@/lib/mockHardware'

const navItems = [
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/></svg>,
    label: 'Overview', href: '/dashboard',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>,
    label: 'Live Map', href: '/dashboard#map',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    label: 'Alerts', href: '/dashboard#alerts',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M23 7l-7 5 7 5V7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/></svg>,
    label: 'Camera', href: '/dashboard#camera',
  },
]

export default function DashboardSidebar({ user }) {
  const router = useRouter()
  const displayUser = user || MOCK_CARETAKER

  async function handleSignOut() {
    // Clear mock session cookie
    document.cookie = 'insee_mock_role=; path=/; max-age=0'
    // Clear real Supabase session
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--s-border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <LogoMark />
          <span style={{ fontFamily: 'var(--font-libre)', fontWeight: 800, fontSize: '1.1rem', color: '#F1F5F9', letterSpacing: '-0.02em' }}>INSEE</span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.68rem', fontWeight: 600, color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px', marginBottom: 10 }}>
          Monitoring
        </div>
        {navItems.map((item) => (
          <Link key={item.label} href={item.href} className="sidebar-nav-item" style={{ marginBottom: 2 }}>
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User + sign out */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--s-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-dm)', fontWeight: 700, fontSize: '0.8rem', color: '#fff' }}>
              {displayUser.full_name?.[0] || 'C'}
            </span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.85rem', fontWeight: 500, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayUser.full_name || 'Caretaker'}
            </div>
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.72rem', color: 'var(--s-text)' }}>Caretaker</div>
          </div>
        </div>
        <button onClick={handleSignOut} className="sidebar-nav-item" style={{ color: '#ef4444', width: '100%' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="url(#sb-logo-grad)" />
      <circle cx="16" cy="20" r="2.5" fill="white" />
      <circle cx="16" cy="20" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <path d="M16 4 Q14 12 16 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="sb-logo-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
    </svg>
  )
}
