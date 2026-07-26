'use client'
import { useReveal } from '@/hooks/useReveal'

export default function About() {
  const ref = useReveal()

  return (
    <section id="about" ref={ref} style={{ background:'var(--l-bg)', padding:'96px 24px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }} className="hero-grid">

        <div className="reveal">
          <div style={{ fontFamily:'var(--font-dm)', fontSize:'0.73rem', fontWeight:600, color:'#6366F1', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:16 }}>About the project</div>
          <h2 className="landing-h2" style={{ marginBottom:20 }}>
            Final Year Project —<br />
            <span className="text-gradient">Computer Science</span>
          </h2>
          <p className="landing-body" style={{ marginBottom:18 }}>
            INSEE (Intelligent Navigation System for the Visually Impaired) is a Final Year Project built to make independent navigation safer and more accessible for visually impaired individuals.
          </p>
          <p className="landing-body" style={{ marginBottom:32 }}>
            The system combines computer vision, IoT hardware, and cloud infrastructure into a single wearable cane — giving both users and caretakers real-time awareness and control.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[
              { label:'Hardware', value:'ESP32, NEO-6M GPS, HC-SR04, USB Camera' },
              { label:'AI Model', value:'YOLOv8 custom trained for obstacle detection' },
              { label:'Backend',  value:'Next.js 14 API routes on Vercel' },
              { label:'Database', value:'Supabase PostgreSQL + Realtime' },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', gap:11, alignItems:'flex-start' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#6366F1', marginTop:7, flexShrink:0 }} />
                <div>
                  <span style={{ fontFamily:'var(--font-dm)', fontWeight:600, fontSize:'0.875rem', color:'var(--l-text)' }}>{r.label}: </span>
                  <span style={{ fontFamily:'var(--font-dm)', fontSize:'0.875rem', color:'var(--l-muted)' }}>{r.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="reveal reveal-delay-2 hero-visual">
          <ArchSVG />
        </div>
      </div>
    </section>
  )
}

function ArchSVG() {
  const boxes = [
    { label:'Smart Cane', sub:'ESP32 + GPS + Sensor + Camera', color:'#6366F1', y:0   },
    { label:'Next.js API', sub:'Vercel serverless functions',   color:'#22D3EE', y:128 },
    { label:'Supabase',   sub:'DB + Realtime + Storage',       color:'#10B981', y:256 },
    { label:'Dashboard',  sub:'Caretaker web app',             color:'#6366F1', y:384 },
  ]
  return (
    <svg viewBox="0 0 340 500" fill="none" style={{ width:'100%', maxWidth:340 }}>
      {boxes.map((b,i) => (
        <g key={i}>
          <rect x="40" y={b.y+8} width="260" height="68" rx="12" fill={`${b.color}12`} stroke={`${b.color}38`} strokeWidth="1.5" />
          <circle cx="74" cy={b.y+42} r="14" fill={`${b.color}20`} stroke={`${b.color}38`} strokeWidth="1" />
          <circle cx="74" cy={b.y+42} r="5" fill={b.color} />
          <text x="100" y={b.y+36} fill={b.color} fontSize="13" fontWeight="700" fontFamily="Libre Franklin,sans-serif">{b.label}</text>
          <text x="100" y={b.y+54} fill="#64748B" fontSize="10" fontFamily="DM Sans,sans-serif">{b.sub}</text>
          {i < boxes.length-1 && <>
            <line x1="170" y1={b.y+76} x2="170" y2={b.y+106} stroke={boxes[i+1].color} strokeWidth="1.5" strokeDasharray="4 3" />
            <polygon points={`165,${b.y+106} 175,${b.y+106} 170,${b.y+114}`} fill={boxes[i+1].color} />
          </>}
        </g>
      ))}
    </svg>
  )
}
