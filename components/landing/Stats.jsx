'use client'
import { useEffect, useRef, useState } from 'react'

const stats = [
  { value:30,  suffix:'ms', label:'Obstacle detection latency', color:'#2563EB' },
  { value:5,   suffix:'s',  label:'GPS update frequency',       color:'#06B6D4' },
  { value:3,   suffix:'s',  label:'Camera snapshot interval',   color:'#10B981' },
  { value:99,  suffix:'%',  label:'WiFi uptime in testing',     color:'#8B5CF6' },
]

function useCountUp(target, duration, started) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!started) return
    let t0 = null
    const step = ts => {
      if (!t0) t0 = ts
      const p = Math.min((ts - t0) / duration, 1)
      setVal(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, started])
  return val
}

function StatItem({ value, suffix, label, color, started }) {
  const n = useCountUp(value, 1200, started)
  return (
    <div style={{ textAlign:'center', padding:'0 20px' }}>
      <div style={{ fontFamily:'var(--font-libre)', fontWeight:900, fontSize:'clamp(2.2rem,4.5vw,3.8rem)', color, lineHeight:1, marginBottom:10 }}>
        {n}{suffix}
      </div>
      <div style={{ fontFamily:'var(--font-dm)', fontSize:'0.875rem', color:'var(--l-muted)', lineHeight:1.4 }}>{label}</div>
    </div>
  )
}

export default function Stats() {
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect() } },
      { threshold: 0.3 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} style={{ background:'var(--l-surface)', padding:'72px 24px', borderTop:'1px solid var(--l-border)', borderBottom:'1px solid var(--l-border)' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0 }} className="dash-stats">
        {stats.map((s,i) => (
          <div key={i} style={{ borderRight:i<stats.length-1?'1px solid var(--l-border)':'none' }}>
            <StatItem {...s} started={started} />
          </div>
        ))}
      </div>
    </section>
  )
}
