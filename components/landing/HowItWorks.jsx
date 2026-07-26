'use client'
import { useReveal } from '@/hooks/useReveal'

const steps = [
  { num:'01', color:'#6366F1', title:'Cane senses the environment', body:'HC-SR04 ultrasonic measures real distances. Camera feeds YOLO for object classification. Both combine for accurate, contextual obstacle warnings spoken via Bluetooth earphones.' },
  { num:'02', color:'#22D3EE', title:'Location is tracked live',    body:'NEO-6M GPS sends coordinates to ESP32, which POSTs to the Next.js API every 5 seconds. Supabase Realtime broadcasts each update to the caretaker dashboard map instantly.' },
  { num:'03', color:'#EF4444', title:'Caretaker responds instantly', body:'Button press fires SOS to Supabase. Dashboard alert appears, push notification reaches caretaker phone, camera starts uploading snapshots. Caretaker reply is spoken aloud to the person.' },
]

export default function HowItWorks() {
  const ref = useReveal()

  return (
    <section id="how-it-works" ref={ref} style={{ background:'var(--l-bg)', padding:'96px 24px' }} className="grid-bg">
      <div style={{ maxWidth:1200, margin:'0 auto' }}>

        <div className="reveal" style={{ textAlign:'center', maxWidth:520, margin:'0 auto 68px' }}>
          <div style={{ fontFamily:'var(--font-dm)', fontSize:'0.73rem', fontWeight:600, color:'#22D3EE', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:16 }}>How it works</div>
          <h2 className="landing-h2">From detection to response<br />in seconds</h2>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2 }} className="steps-grid">
          {steps.map((s, i) => (
            <div key={i} className={`reveal reveal-delay-${i+1}`}
              style={{ background:'var(--l-surface)', border:'1px solid var(--l-border)', padding:'38px 34px', position:'relative', transition:'border-color 0.3s' }}>
              <div style={{ fontFamily:'var(--font-libre)', fontWeight:900, fontSize:'4rem', color:'rgba(255,255,255,0.025)', position:'absolute', top:16, right:22, lineHeight:1, userSelect:'none' }}>{s.num}</div>
              <div style={{ width:44, height:44, borderRadius:12, background:`${s.color}15`, border:`1px solid ${s.color}30`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:22 }}>
                <span style={{ fontFamily:'var(--font-libre)', fontWeight:800, fontSize:'0.88rem', color:s.color }}>{s.num}</span>
              </div>
              <div style={{ fontFamily:'var(--font-dm)', fontWeight:600, fontSize:'0.68rem', color:'var(--l-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Step {s.num}</div>
              <h3 style={{ fontFamily:'var(--font-libre)', fontWeight:700, fontSize:'1rem', color:'var(--l-text)', marginBottom:12, letterSpacing:'-0.01em' }}>{s.title}</h3>
              <p style={{ fontFamily:'var(--font-dm)', fontSize:'0.875rem', lineHeight:1.7, color:'var(--l-muted)' }}>{s.body}</p>
            </div>
          ))}
        </div>

        <div id="technology" className="reveal" style={{ marginTop:56, padding:'26px 34px', background:'var(--l-surface)', border:'1px solid var(--l-border)', display:'flex', flexWrap:'wrap', alignItems:'center', gap:0 }}>
          <div style={{ fontFamily:'var(--font-dm)', fontSize:'0.7rem', color:'var(--l-muted)', textTransform:'uppercase', letterSpacing:'0.1em', marginRight:28, flexShrink:0 }}>Built with</div>
          {['YOLOv8','ESP32 WiFi','Next.js 14','Supabase','Leaflet','OpenCV','Groq AI','edge-tts'].map((t,i) => (
            <div key={i} style={{ fontFamily:'var(--font-dm)', fontWeight:500, fontSize:'0.83rem', color:'var(--l-text)', padding:'5px 18px', borderLeft:i>0?'1px solid var(--l-border)':'none' }}>{t}</div>
          ))}
        </div>
      </div>
    </section>
  )
}
