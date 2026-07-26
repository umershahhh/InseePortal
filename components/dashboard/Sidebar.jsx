'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MOCK_MODE, MOCK_CARETAKER } from '@/lib/mockHardware'
import { useTheme } from '@/components/ThemeProvider'

const navItems = [
  { icon: <DashIcon />,   label: 'Overview',    href: '/dashboard' },
  { icon: <MapIcon />,    label: 'Live Map',    href: '/dashboard#map' },
  { icon: <AlertIcon />,  label: 'Alerts',      href: '/dashboard#alerts' },
  { icon: <CameraIcon />, label: 'Camera Feed', href: '/dashboard#camera' },
]

export default function DashboardSidebar({ user, isOpen, onClose }) {
  const router   = useRouter()
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  // In real mode, show skeleton while loading; in mock mode use mock data
  const displayUser = user || (MOCK_MODE ? MOCK_CARETAKER : null)

  async function handleSignOut() {
    document.cookie = 'insee_mock_role=; path=/; max-age=0'
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo + close btn */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--s-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <LogoSVG />
            <span style={{ fontFamily: 'var(--font-libre)', fontWeight: 800, fontSize: '1.1rem', color: '#F1F5F9', letterSpacing: '-0.02em' }}>INSEE</span>
          </Link>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4, display: 'none' }} className="sidebar-close-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: '14px 10px', flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.66rem', fontWeight: 600, color: 'rgba(148,163,184,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px', marginBottom: 8 }}>
            Monitoring
          </div>
          {navItems.map(item => (
            <Link key={item.label} href={item.href} className="sidebar-nav-item" style={{ marginBottom: 2 }} onClick={onClose}>
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Theme toggle */}
        <div style={{ padding: '10px 10px 0', borderTop: '1px solid var(--s-border)' }}>
          <button onClick={toggle} className="sidebar-nav-item" style={{ width: '100%', marginBottom: 2 }}>
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* User + sign out */}
        <div style={{ padding: '8px 10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'var(--font-dm)', fontWeight: 700, fontSize: '0.8rem', color: '#fff' }}>
                {displayUser?.full_name?.[0]?.toUpperCase() || 'C'}
              </span>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.85rem', fontWeight: 500, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayUser?.full_name || (MOCK_MODE ? 'Caretaker' : 'Loading...')}
              </div>
              <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.7rem', color: '#64748B' }}>Caretaker</div>
            </div>
          </div>
          <button onClick={handleSignOut} className="sidebar-nav-item" style={{ color: '#ef4444', width: '100%' }}>
            <SignOutIcon />
            Sign out
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .sidebar-close-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}

function LogoSVG() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="url(#sb-logo-g)" />
      <circle cx="16" cy="20" r="2.5" fill="white" />
      <circle cx="16" cy="20" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <path d="M16 4 Q14 12 16 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="sb-logo-g" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#6366F1" /><stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
    </svg>
  )
}
function DashIcon()    { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/></svg> }
function MapIcon()     { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8"/></svg> }
function AlertIcon()   { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> }
function CameraIcon()  { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M23 7l-7 5 7 5V7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/></svg> }
function SignOutIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function SunIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="#F59E0B" strokeWidth="2"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/></svg> }
function MoonIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/></svg> }
