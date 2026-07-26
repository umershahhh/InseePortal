'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTheme } from '@/components/ThemeProvider'

export default function Hero() {
  const { theme } = useTheme()
  const [coords, setCoords] = useState({ lat: '31.5204', lng: '74.3587' })

  useEffect(() => {
    const id = setInterval(() => {
      setCoords({
        lat: (31.5204 + (Math.random() - 0.5) * 0.0008).toFixed(4),
        lng: (74.3587 + (Math.random() - 0.5) * 0.0008).toFixed(4),
      })
    }, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <section style={{
      minHeight: '100vh', background: 'var(--l-bg)',
      display: 'flex', alignItems: 'center',
      position: 'relative', overflow: 'hidden', paddingTop: 64,
    }} className="grid-bg">

      {/* Ambient glows */}
      <div style={{ position:'absolute', top:'10%', left:'-8%', width:700, height:700, background:'radial-gradient(circle,rgba(99,102,241,.08) 0%,transparent 65%)', borderRadius:'50%', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'5%', right:'-5%', width:500, height:500, background:'radial-gradient(circle,rgba(34,211,238,.06) 0%,transparent 65%)', borderRadius:'50%', pointerEvents:'none' }} />

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'60px 24px', width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }} className="hero-grid">

        {/* Left — CSS animations, no GSAP dependency */}
        <div>
          <div className="anim-fade-up anim-d1">
            <div className="live-badge" style={{ marginBottom:28 }}>
              <span className="live-dot" />System Active — v2.0
            </div>
          </div>

          <div className="anim-fade-up anim-d2">
            <h1 className="landing-h1" style={{ marginBottom:24 }}>
              Intelligent<br />sensing.<br />
              <span className="text-gradient">Confident steps.</span>
            </h1>
          </div>

          <p className="landing-body anim-fade-up anim-d3" style={{ maxWidth:460, marginBottom:40 }}>
            INSEE is a smart assistive cane combining AI obstacle detection, real-time GPS tracking, and instant caretaker alerts — giving visually impaired individuals the freedom to navigate any environment safely.
          </p>

          <div className="anim-fade-up anim-d4" style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:52 }} id="hero-ctas">
            <Link href="/login" className="btn-primary">
              Open Dashboard
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </Link>
            <a href="#how-it-works" className="btn-ghost">See how it works</a>
          </div>

          <div className="anim-fade-up anim-d5" style={{ display:'flex', paddingTop:32, borderTop:'1px solid var(--l-border)' }} id="hero-stats">
            {[
              { val:'<30ms', label:'Detection latency' },
              { val:'Live',  label:'GPS tracking' },
              { val:'24/7',  label:'Alert monitoring' },
            ].map((s,i) => (
              <div key={i} style={{ flex:1, paddingRight:i<2?24:0, borderRight:i<2?'1px solid var(--l-border)':'none', marginRight:i<2?24:0 }}>
                <div style={{ fontFamily:'var(--font-libre)', fontWeight:800, fontSize:'1.35rem', color:'var(--l-text)', marginBottom:4 }}>{s.val}</div>
                <div style={{ fontFamily:'var(--font-dm)', fontSize:'0.78rem', color:'var(--l-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — visual */}
        <div className="hero-visual anim-slide-right anim-d2" style={{ position:'relative', display:'flex', justifyContent:'center' }}>
          <div style={{ animation:'floatY 4s ease-in-out infinite' }}>
            <CaneSVG />
          </div>

          <div className="floating-card" style={{ position:'absolute', top:40, right:0, minWidth:190 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
              <span className="live-dot" />
              <span style={{ fontFamily:'var(--font-dm)', fontSize:'0.68rem', fontWeight:600, color:'#10B981', textTransform:'uppercase', letterSpacing:'0.09em' }}>Live Location</span>
            </div>
            <div style={{ fontFamily:'var(--font-dm)', fontWeight:600, color:'var(--l-text)', fontSize:'0.88rem', lineHeight:1.5 }}>
              {coords.lat}° N<br />{coords.lng}° E
            </div>
            <div style={{ fontFamily:'var(--font-dm)', fontSize:'0.7rem', color:'var(--l-muted)', marginTop:6 }}>Updated just now</div>
          </div>

          <div className="floating-card" style={{ position:'absolute', bottom:100, left:-10, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:9, background:'rgba(239,68,68,0.14)', border:'1px solid rgba(239,68,68,0.28)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-dm)', fontWeight:600, color:'var(--l-text)', fontSize:'0.84rem' }}>Obstacle Detected</div>
              <div style={{ fontFamily:'var(--font-dm)', color:'#EF4444', fontSize:'0.75rem', fontWeight:500, marginTop:2 }}>1.2 m — Person ahead</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', textAlign:'center' }}>
        <div style={{ fontFamily:'var(--font-dm)', fontSize:'0.7rem', color:'var(--l-muted)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Explore</div>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation:'floatY 2s ease-in-out infinite' }}>
          <path d="M9 3.5v11M5.5 11 9 14.5 12.5 11" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <style>{`@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
    </section>
  )
}

function CaneSVG() {
  return (
    <svg viewBox="0 0 420 520" fill="none" style={{ width:'100%', maxWidth:380 }}>
      <circle cx="210" cy="350" r="150" fill="url(#hero-glow)" opacity="0.1" />
      <circle cx="210" cy="350" r="55" stroke="rgba(99,102,241,0.6)" strokeWidth="1.5" style={{ transformOrigin:'210px 350px', animation:'radarPing 3s ease-out infinite' }} />
      <circle cx="210" cy="350" r="55" stroke="rgba(34,211,238,0.4)" strokeWidth="1"   style={{ transformOrigin:'210px 350px', animation:'radarPing 3s ease-out 1s infinite' }} />
      <circle cx="210" cy="350" r="55" stroke="rgba(99,102,241,0.2)" strokeWidth="1"   style={{ transformOrigin:'210px 350px', animation:'radarPing 3s ease-out 2s infinite' }} />
      <circle cx="210" cy="350" r="90"  stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      <circle cx="210" cy="350" r="130" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      <path d="M152 90 Q152 60 186 64" stroke="url(#cane-g)" strokeWidth="8" strokeLinecap="round" />
      <path d="M152 90 L152 118"       stroke="url(#cane-g)" strokeWidth="8" strokeLinecap="round" />
      <path d="M186 64 L210 350"       stroke="url(#cane-g)" strokeWidth="7" strokeLinecap="round" />
      <circle cx="210" cy="350" r="12" fill="rgba(99,102,241,0.25)" />
      <circle cx="210" cy="350" r="8"  fill="#6366F1" />
      <circle cx="210" cy="350" r="4"  fill="#22D3EE" />
      <circle cx="210" cy="350" r="2"  fill="#fff" />
      <circle cx="295" cy="220" r="7" fill="#EF4444" opacity="0.9"><animate attributeName="opacity" values="0.9;0.4;0.9" dur="2.1s" repeatCount="indefinite" /></circle>
      <text x="306" y="224" fill="rgba(239,68,68,0.85)" fontSize="11" fontFamily="DM Sans,sans-serif" fontWeight="600">Person</text>
      <circle cx="128" cy="300" r="6" fill="#F59E0B" opacity="0.85"><animate attributeName="opacity" values="0.85;0.3;0.85" dur="2.8s" repeatCount="indefinite" /></circle>
      <text x="82" y="304" fill="rgba(245,158,11,0.85)" fontSize="11" fontFamily="DM Sans,sans-serif" fontWeight="600">Wall</text>
      <line x1="210" y1="350" x2="295" y2="220" stroke="rgba(239,68,68,0.3)" strokeWidth="1.5" strokeDasharray="6 4" />
      <line x1="210" y1="350" x2="128" y2="300" stroke="rgba(245,158,11,0.25)" strokeWidth="1.5" strokeDasharray="6 4" />
      <defs>
        <linearGradient id="cane-g" x1="152" y1="60" x2="210" y2="350" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6"/><stop offset="100%" stopColor="#22D3EE"/>
        </linearGradient>
        <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#22D3EE" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <style>{`@keyframes radarPing{0%{transform:scale(.5);opacity:.9}100%{transform:scale(2.6);opacity:0}}`}</style>
    </svg>
  )
}
