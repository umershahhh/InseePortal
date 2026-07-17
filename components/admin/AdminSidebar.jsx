'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const navItems = [
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/></svg>,
    label: 'Overview', href: '/admin',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
    label: 'Users', href: '/admin#users',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L8 6v12l4 4 4-4V6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="14" r="2" stroke="currentColor" strokeWidth="1.5"/></svg>,
    label: 'Devices', href: '/admin#devices',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    label: 'All Alerts', href: '/admin#alerts',
  },
  {
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.07 4.93A10 10 0 004.93 19.07M4.93 4.93a10 10 0 0014.14 14.14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
    label: 'System', href: '/admin#system',
  },
]

export default function AdminSidebar() {
  const router = useRouter()

  async function handleSignOut() {
    document.cookie = 'insee_mock_role=; path=/; max-age=0'
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="sidebar">
      {/* Logo + admin badge */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--s-border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 12 }}>
          <LogoMark />
          <span style={{ fontFamily: 'var(--font-libre)', fontWeight: 800, fontSize: '1.1rem', color: '#F1F5F9', letterSpacing: '-0.02em' }}>INSEE</span>
        </Link>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)',
          borderRadius: 6, padding: '3px 10px',
          fontFamily: 'var(--font-dm)', fontSize: '0.7rem', fontWeight: 600,
          color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z"/></svg>
          Super Admin
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.68rem', fontWeight: 600, color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px', marginBottom: 10 }}>
          Administration
        </div>
        {navItems.map(item => (
          <Link key={item.label} href={item.href} className="sidebar-nav-item" style={{ marginBottom: 2 }}>
            {item.icon}
            {item.label}
          </Link>
        ))}

        <div style={{ height: 1, background: 'var(--s-border)', margin: '16px 8px' }} />

        <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.68rem', fontWeight: 600, color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px', marginBottom: 10 }}>
          Quick links
        </div>
        <Link href="/dashboard" className="sidebar-nav-item" style={{ marginBottom: 2 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>
          Caretaker View
        </Link>
      </nav>

      {/* Admin user */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--s-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z"/></svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.85rem', fontWeight: 500, color: '#F1F5F9' }}>Super Admin</div>
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.72rem', color: 'var(--s-text)' }}>admin@insee.app</div>
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
      <rect width="32" height="32" rx="8" fill="url(#admin-logo-g)" />
      <circle cx="16" cy="20" r="2.5" fill="white" />
      <circle cx="16" cy="20" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <path d="M16 4 Q14 12 16 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="admin-logo-g" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
    </svg>
  )
}
