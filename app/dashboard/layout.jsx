'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/Sidebar'
import { supabase } from '@/lib/supabase'
import { MOCK_MODE, MOCK_CARETAKER } from '@/lib/mockHardware'

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()

  // Fetch real caretaker profile so sidebar shows correct name
  useEffect(() => {
    if (MOCK_MODE) {
      setUser(MOCK_CARETAKER)
      return
    }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', session.user.id)
        .single()
      if (profile) setUser({ ...profile, email: session.user.email })
    })
  }, [])

  return (
    <div className="dash-layout">
      <DashboardSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dash-main">
        {/* Mobile topbar — hamburger + logo */}
        <div className="mobile-topbar" style={{
          alignItems: 'center', gap: 12,
          background: 'var(--d-surface)',
          borderBottom: '1px solid var(--d-border)',
          padding: '0 16px', height: 56,
          position: 'sticky', top: 0,
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
            style={{
              background: 'var(--d-bg)',
              border: '1px solid var(--d-border)',
              borderRadius: 8, width: 38, height: 38,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer',
              flexShrink: 0,
            }}>
            <HamburgerIcon />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LogoSVG />
            <span style={{
              fontFamily: 'var(--font-libre)', fontWeight: 800,
              fontSize: '1rem', color: 'var(--d-text)',
            }}>INSEE</span>
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 12h18M3 6h18M3 18h18"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function LogoSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="url(#ml-g)"/>
      <circle cx="16" cy="20" r="2.5" fill="white"/>
      <circle cx="16" cy="20" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      <path d="M16 4 Q14 12 16 20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <defs>
        <linearGradient id="ml-g" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#2563EB"/>
          <stop offset="100%" stopColor="#06B6D4"/>
        </linearGradient>
      </defs>
    </svg>
  )
}
