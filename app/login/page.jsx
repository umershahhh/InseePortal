'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { MOCK_MODE } from '@/lib/mockHardware'

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [checking, setChecking] = useState(!MOCK_MODE)
  const [error,    setError]    = useState('')
  const [from,     setFrom]     = useState(null)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setFrom(params.get('from'))
  }, [])

  useEffect(() => {
    if (MOCK_MODE) return
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (!session) return
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', session.user.id).single()
        router.replace(profile?.role === 'admin' ? '/admin' : '/dashboard')
      })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [router])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (MOCK_MODE) {
        await new Promise(r => setTimeout(r, 600))
        const isAdmin = email.toLowerCase().includes('admin')
        document.cookie = `insee_mock_role=${isAdmin?'admin':'caretaker'}; path=/; max-age=${60*60*24}`
        router.replace(isAdmin ? '/admin' : (from || '/dashboard'))
        return
      }
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

  if (checking) {
    return (
      <div style={{ minHeight:'100vh', background:'var(--l-bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:32, height:32, border:'3px solid rgba(99,102,241,0.2)', borderTopColor:'#6366F1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--l-bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, position:'relative' }} className="grid-bg">

      {/* Ambient glow */}
      <div style={{ position:'absolute', top:'35%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:600, background:'radial-gradient(circle, rgba(99,102,241,.1) 0%, transparent 65%)', borderRadius:'50%', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Link href="/" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:10, justifyContent:'center' }}>
            <LogoSVG size={38} />
            <span style={{ fontFamily:'var(--font-libre)', fontWeight:800, fontSize:'1.5rem', color:'var(--l-text)', letterSpacing:'-0.02em' }}>INSEE</span>
          </Link>
          <p style={{ fontFamily:'var(--font-dm)', color:'var(--l-muted)', fontSize:'0.875rem', marginTop:10 }}>
            Sign in to your dashboard
          </p>
          {from && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:10, background:'rgba(217,119,6,0.1)', border:'1px solid rgba(217,119,6,0.2)', borderRadius:8, padding:'5px 12px', fontFamily:'var(--font-dm)', fontSize:'0.78rem', color:'#D97706' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Please sign in to continue
            </div>
          )}
        </div>

        {/* Mock hint */}
        {MOCK_MODE && (
          <div style={{ background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:12, padding:'10px 16px', marginBottom:18, fontFamily:'var(--font-dm)', fontSize:'0.8rem', color:'#818CF8', textAlign:'center' }}>
            Mock mode — any email/password.<br/>Include "admin" in email for admin access.
          </div>
        )}

        {/* Card */}
        <div style={{ background:'var(--l-surface)', border:'1px solid var(--l-border)', borderRadius:18, padding:'32px 28px' }}>

          {error && (
            <div style={{ background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.22)', borderRadius:10, padding:'11px 15px', marginBottom:20, fontFamily:'var(--font-dm)', fontSize:'0.84rem', color:'#FCA5A5' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontFamily:'var(--font-dm)', fontSize:'0.8rem', fontWeight:500, color:'var(--l-muted)', marginBottom:8 }}>
                Email address
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder={MOCK_MODE ? 'any@email.com' : 'caretaker@example.com'} required
                style={{ width:'100%', background:'var(--l-bg)', border:'1.5px solid var(--l-border)', borderRadius:10, padding:'12px 14px', color:'var(--l-text)', fontFamily:'var(--font-dm)', fontSize:'0.9rem', outline:'none', transition:'border-color .2s' }}
                onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.6)'}
                onBlur={e => e.target.style.borderColor='var(--l-border)'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom:26 }}>
              <label style={{ display:'block', fontFamily:'var(--font-dm)', fontSize:'0.8rem', fontWeight:500, color:'var(--l-muted)', marginBottom:8 }}>
                Password
              </label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  style={{ width:'100%', background:'var(--l-bg)', border:'1.5px solid var(--l-border)', borderRadius:10, padding:'12px 42px 12px 14px', color:'var(--l-text)', fontFamily:'var(--font-dm)', fontSize:'0.9rem', outline:'none', transition:'border-color .2s' }}
                  onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.6)'}
                  onBlur={e => e.target.style.borderColor='var(--l-border)'}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', cursor:'pointer', color:'var(--l-muted)', padding:4 }}>
                  {showPass
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary"
              style={{ width:'100%', justifyContent:'center', padding:'13px', opacity:loading?0.7:1 }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p style={{ marginTop:22, textAlign:'center', fontFamily:'var(--font-dm)', fontSize:'0.8rem', color:'var(--l-muted)' }}>
            {MOCK_MODE ? 'Mock mode — no real account needed.' : 'Access is managed by your system administrator.'}
          </p>
        </div>

        <p style={{ textAlign:'center', marginTop:20, fontFamily:'var(--font-dm)', fontSize:'0.8rem', color:'var(--l-muted)' }}>
          <Link href="/" style={{ color:'var(--l-muted)', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}

function LogoSVG({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="url(#login-g)" />
      <circle cx="16" cy="20" r="2.5" fill="white" />
      <circle cx="16" cy="20" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <path d="M16 4 Q14 12 16 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 6 Q10 9 14 11" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 6 Q22 9 18 11" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="login-g" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#22D3EE"/>
        </linearGradient>
      </defs>
    </svg>
  )
}
