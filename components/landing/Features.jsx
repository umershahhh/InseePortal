'use client'
import { useReveal } from '@/hooks/useReveal'

const features = [
  { icon:<EyeIcon/>,    title:'AI Obstacle Detection',   accent:'#6366F1', stat:'<30ms', statLabel:'Response time',    description:'YOLOv8 processes live camera frames, classifying obstacles — people, stairs, vehicles — delivering instant audio guidance via Bluetooth earphones.' },
  { icon:<MapPinIcon/>, title:'Live GPS Tracking',       accent:'#22D3EE', stat:'5s',    statLabel:'Update interval',   description:'ESP32 WiFi transmits GPS coordinates every 5 seconds. Caretakers see a live moving map updated in real-time via Supabase Realtime — no refresh needed.' },
  { icon:<BellIcon/>,   title:'Emergency Alert System',  accent:'#EF4444', stat:'1-tap', statLabel:'SOS trigger',       description:'One button press fires an instant SOS to the caretaker dashboard — with location, timestamp, and automatic camera feed activation.' },
  { icon:<GridIcon/>,   title:'Caretaker Dashboard',     accent:'#10B981', stat:'3s',    statLabel:'Camera refresh',    description:'A real-time dashboard gives caretakers live map, alert history, camera snapshots every 3 seconds, and a signal sender to communicate back.' },
  { icon:<CaneIcon/>,   title:'Smart Cane Hardware',     accent:'#8B5CF6', stat:'ESP32', statLabel:'WiFi enabled',      description:'ESP32, NEO-6M GPS, HC-SR04 ultrasonic, and USB camera all work together in one compact cane — connected directly to the cloud over WiFi.' },
  { icon:<ChatIcon/>,   title:'Two-Way Communication',   accent:'#F59E0B', stat:'4s',    statLabel:'Signal latency',    description:'Caretakers send spoken signals — "Help is coming", "Are you okay?" — delivered as audio through the cane speaker via Microsoft edge-tts.' },
]

export default function Features() {
  const ref = useReveal()

  return (
    <section id="features" ref={ref} style={{ background:'var(--l-surface)', padding:'96px 24px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>

        <div className="reveal" style={{ maxWidth:560, marginBottom:60 }}>
          <div style={{ fontFamily:'var(--font-dm)', fontSize:'0.73rem', fontWeight:600, color:'#6366F1', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14 }}>
            Core capabilities
          </div>
          <h2 className="landing-h2" style={{ marginBottom:14 }}>Built for safety.<br />Designed for independence.</h2>
          <p className="landing-body">Every feature of INSEE is engineered around one goal: giving visually impaired individuals and their caretakers complete confidence in any environment.</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2 }} className="features-grid">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} delayClass={`reveal-delay-${(i%3)+1}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, accent, stat, statLabel, description, delayClass }) {
  return (
    <div className={`reveal ${delayClass}`}
      style={{ padding:'38px 34px', background:'var(--l-bg)', border:'1px solid var(--l-border)', transition:'border-color .25s, background .25s, transform .2s', cursor:'default' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor=`${accent}35`; e.currentTarget.style.background='var(--l-surface-2)'; e.currentTarget.style.transform='translateY(-3px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--l-border)'; e.currentTarget.style.background='var(--l-bg)'; e.currentTarget.style.transform='translateY(0)' }}>
      <div style={{ width:48, height:48, borderRadius:12, background:`${accent}14`, border:`1px solid ${accent}25`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
        {icon}
      </div>
      <h3 style={{ fontFamily:'var(--font-libre)', fontWeight:700, fontSize:'1rem', color:'var(--l-text)', marginBottom:10, letterSpacing:'-0.01em' }}>{title}</h3>
      <p style={{ fontFamily:'var(--font-dm)', fontSize:'0.875rem', lineHeight:1.7, color:'var(--l-muted)', marginBottom:20 }}>{description}</p>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ fontFamily:'var(--font-libre)', fontWeight:800, fontSize:'1.05rem', color:accent }}>{stat}</div>
        <div style={{ fontFamily:'var(--font-dm)', fontSize:'0.72rem', color:'var(--l-muted)' }}>{statLabel}</div>
      </div>
      <div style={{ marginTop:18, width:32, height:2, background:`linear-gradient(90deg,${accent},transparent)`, borderRadius:2 }} />
    </div>
  )
}

function EyeIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="3" stroke="#22D3EE" strokeWidth="2"/></svg> }
function MapPinIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="10" r="3" stroke="#22D3EE" strokeWidth="2"/></svg> }
function BellIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/></svg> }
function GridIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#10B981" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#10B981" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#10B981" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="#10B981" strokeWidth="2"/></svg> }
function CaneIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M10 3 Q10 1 12 2 L14 18" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/><circle cx="14" cy="20" r="2" stroke="#8B5CF6" strokeWidth="1.8"/></svg> }
function ChatIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/></svg> }
