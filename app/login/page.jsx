'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { MOCK_MODE } from '@/lib/mockHardware'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [checkingSession, setCheckingSession] = useState(!MOCK_MODE)
  const [error, setError]       = useState('')
  const [from, setFrom]         = useState(null)

  // Read ?from= from URL client-side (avoids Suspense requirement)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setFrom(params.get('from'))
  }, [])

  // In real mode only: check if already logged in
  useEffect(() => {
    if (MOCK_MODE) return

    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (!session) return
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', session.user.id).single()
        router.replace(profile?.role === 'admin' ? '/admin' : '/dashboard')
      })
      .catch(() => {})           // never hang on error
      .finally(() => setCheckingSession(false))
  }, [router])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // ── MOCK LOGIN ──────────────────────────────────────────────
      if (MOCK_MODE) {
        await new Promise(r => setTimeout(r, 600)) // feels real

        const isAdmin = email.toLowerCase().includes('admin')
        const maxAge  = 60 * 60 * 24 // 1 day
        document.cookie = `insee_mock_role=${isAdmin ? 'admin' : 'caretaker'}; path=/; max-age=${maxAge}`

        router.replace(isAdmin ? '/admin' : (from || '/dashboard'))
        return
      }

      // ── REAL SUPABASE LOGIN ─────────────────────────────────────
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError

      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', data.user.id).single()

      if (profile?.role === 'admin') {
        router.replace(from?.startsWith('/admin') ? from : '/admin')
      } else {
        router.replace(from?.startsWith('/dashboard') ? from : '/dashboard')
      }

    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Only show spinner while actively checking an existing real session
  if (checkingSession) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--l-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-dm)', color: 'var(--l-muted)', fontSize: '0.875rem' }}>
          Checking session...
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--l-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative',
    }} className="grid-bg">

      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <LogoMark />
            <span style={{ fontFamily: 'var(--font-libre)', fontWeight: 800, fontSize: '1.4rem', color: '#F1F5F9', letterSpacing: '-0.02em' }}>INSEE</span>
          </Link>
          <p style={{ fontFamily: 'var(--font-dm)', color: 'var(--l-muted)', fontSize: '0.875rem', marginTop: 8 }}>
            Sign in to your dashboard
          </p>
          {from && (
            <p style={{ fontFamily: 'var(--font-dm)', fontSize: '0.78rem', color: '#D97706', marginTop: 8 }}>
              Please sign in to continue
            </p>
          )}
        </div>

        {/* Mock mode hint */}
        {MOCK_MODE && (
          <div style={{
            background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.25)',
            borderRadius: 10, padding: '10px 16px', marginBottom: 20,
            fontFamily: 'var(--font-dm)', fontSize: '0.8rem', color: '#D97706',
          }}>
            <strong>Mock mode:</strong> use any email/password.
            Include "admin" in email for admin access.
          </div>
        )}

        <div style={{ background: 'var(--l-surface)', border: '1px solid var(--l-border)', borderRadius: 16, padding: '36px 32px' }}>

          {error && (
            <div style={{
              background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              fontFamily: 'var(--font-dm)', fontSize: '0.85rem', color: '#FCA5A5',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-dm)', fontSize: '0.8rem', fontWeight: 500, color: 'var(--l-muted)', marginBottom: 8 }}>
                Email address
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder={MOCK_MODE ? 'any@email.com' : 'caretaker@example.com'} required
                style={{
                  width: '100%', background: 'var(--l-bg)', border: '1px solid var(--l-border)',
                  borderRadius: 10, padding: '12px 16px', color: '#F1F5F9',
                  fontFamily: 'var(--font-dm)', fontSize: '0.925rem', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.5)'}
                onBlur={e => e.target.style.borderColor = 'var(--l-border)'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-dm)', fontSize: '0.8rem', fontWeight: 500, color: 'var(--l-muted)', marginBottom: 8 }}>
                Password
              </label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{
                  width: '100%', background: 'var(--l-bg)', border: '1px solid var(--l-border)',
                  borderRadius: 10, padding: '12px 16px', color: '#F1F5F9',
                  fontFamily: 'var(--font-dm)', fontSize: '0.925rem', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(37,99,235,0.5)'}
                onBlur={e => e.target.style.borderColor = 'var(--l-border)'}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontFamily: 'var(--font-dm)', fontSize: '0.8rem', color: 'var(--l-muted)' }}>
            {MOCK_MODE ? 'Mock mode — no real account needed.' : 'Access is managed by your system administrator.'}
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontFamily: 'var(--font-dm)', fontSize: '0.8rem', color: 'var(--l-muted)' }}>
          <Link href="/" style={{ color: 'var(--l-muted)', textDecoration: 'none' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  )
}

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="url(#login-logo-grad)" />
      <circle cx="16" cy="20" r="2.5" fill="white" />
      <circle cx="16" cy="20" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <path d="M16 4 Q14 12 16 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="login-logo-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
    </svg>
  )
}
