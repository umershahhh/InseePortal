'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LiveMap      from '@/components/dashboard/LiveMap'
import AlertPanel   from '@/components/dashboard/AlertPanel'
import CameraFeed   from '@/components/dashboard/CameraFeed'
import SignalModal  from '@/components/dashboard/SignalModal'
import { useLocation } from '@/hooks/useLocation'
import { useAlerts }   from '@/hooks/useAlerts'
import { supabase }    from '@/lib/supabase'
import { MOCK_MODE, MOCK_PERSON, createMockAlert } from '@/lib/mockHardware'

export default function DashboardPage() {
  const router = useRouter()
  const [person,       setPerson]       = useState(null)
  const [caretakerId,  setCaretakerId]  = useState(null)
  const [pageLoading,  setPageLoading]  = useState(true)
  const [signalTarget, setSignalTarget] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)

  useEffect(() => {
    if (MOCK_MODE) {
      setPerson(MOCK_PERSON)
      setCaretakerId('mock-caretaker-001')
      setPageLoading(false)
      return
    }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setCaretakerId(session.user.id)
      const { data: p } = await supabase.from('persons').select('*').eq('caretaker_id', session.user.id).eq('is_active', true).single()
      setPerson(p || null)
      setPageLoading(false)
    }).catch(() => router.push('/login'))
  }, [router])

  const { location, history } = useLocation(person?.id)
  const { alerts, addMockAlert, resolveAlert } = useAlerts(person?.id)
  const activeAlerts = alerts.filter(a => a.status === 'active')

  if (pageLoading) return <LoadingScreen />
  if (!person)     return <NoPersonScreen />

  return (
    <>
      {MOCK_MODE && <MockBanner />}

      {/* ── Topbar ─────────────────────────────────────────── */}
      <div className="dash-topbar">
        <div>
          <h1 style={{ fontFamily:'var(--font-libre)', fontWeight:700, fontSize:'1rem', color:'var(--d-text)', letterSpacing:'-0.01em' }}>
            Monitoring Dashboard
          </h1>
          <p style={{ fontFamily:'var(--font-dm)', fontSize:'0.75rem', color:'var(--d-muted)', marginTop:1 }}>
            Caretaker view — {person.name}
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {MOCK_MODE && (
            <button onClick={() => { const a = createMockAlert(); addMockAlert(a); setCameraActive(true) }}
              style={{ background:'rgba(220,38,38,0.08)', color:'#DC2626', border:'1px solid rgba(220,38,38,0.2)', borderRadius:8, padding:'7px 14px', fontFamily:'var(--font-dm)', fontSize:'0.78rem', fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              <RedDot /> Simulate SOS
            </button>
          )}
          <StatusChip active={activeAlerts.length > 0} count={activeAlerts.length} />
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="dash-content">

        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }} className="dash-stats">
          <StatCard label="Person"        value={person.name}                        sub="Linked user"    accent="#2563EB" icon={<UserIcon />} />
          <StatCard label="Device"        value={person.device_id || '—'}            sub="Smart cane"    accent="#06B6D4" icon={<DeviceIcon />} />
          <StatCard label="Battery"       value={`${person.battery_level ?? '--'}%`} sub="Cane power"   accent={(person.battery_level??100)>30?'#059669':'#DC2626'} icon={<BatteryIcon />} />
          <StatCard label="Active Alerts" value={activeAlerts.length}                sub={activeAlerts.length > 0 ? 'Needs attention':'All clear'} accent={activeAlerts.length>0?'#DC2626':'#059669'} icon={<BellIcon />} />
        </div>

        {/* ── Main grid: Map + Alerts side by side ─────────── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16, marginBottom:16, alignItems:'stretch' }} className="dash-main-grid">

          {/* MAP */}
          <div id="map" className="dash-card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px 14px', borderBottom:'1px solid var(--d-border)' }}>
              <div>
                <h3 style={{ fontFamily:'var(--font-libre)', fontWeight:700, fontSize:'0.95rem', color:'var(--d-text)' }}>Live Location</h3>
                {location
                  ? <p style={{ fontFamily:'var(--font-dm)', fontSize:'0.75rem', color:'var(--d-muted)', marginTop:2 }}>{location.lat?.toFixed(5)}° N, {location.lng?.toFixed(5)}° E</p>
                  : <p style={{ fontFamily:'var(--font-dm)', fontSize:'0.75rem', color:'var(--d-muted)', marginTop:2 }}>Waiting for GPS signal...</p>
                }
              </div>
              <div className="live-badge" style={{ background:location?'rgba(5,150,105,0.1)':'rgba(100,116,139,0.1)', border:`1px solid ${location?'rgba(5,150,105,0.22)':'rgba(100,116,139,0.18)'}`, color:location?'#10B981':'#64748B' }}>
                <span className="live-dot" style={{ background:location?'#10B981':'#64748B' }} />
                {location ? 'Tracking' : 'No signal'}
              </div>
            </div>
            <div style={{ height:400 }}>
              <LiveMap location={location} history={history} />
            </div>
          </div>

          {/* ALERTS */}
          <div id="alerts" style={{ height:462, minHeight:300 }}>
            <AlertPanel
              alerts={alerts}
              onSignal={alert => setSignalTarget(alert)}
              onViewCamera={() => { setCameraActive(true); document.getElementById('camera')?.scrollIntoView({ behavior:'smooth' }) }}
              onResolve={id => { resolveAlert(id); setCameraActive(false) }}
            />
          </div>
        </div>

        {/* ── Camera feed — full width below ───────────────── */}
        <div id="camera">
          <CameraFeed personId={person.id} alertActive={cameraActive} />
        </div>

      </div>

      {signalTarget && (
        <SignalModal
          alert={signalTarget}
          caretakerId={caretakerId}
          onClose={() => setSignalTarget(null)}
        />
      )}
    </>
  )
}

/* ── Sub-components ─────────────────────────────────────────── */

function StatusChip({ active, count }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7, background:'var(--d-bg)', borderRadius:10, padding:'7px 13px', border:'1px solid var(--d-border)' }}>
      <span style={{ width:8, height:8, borderRadius:'50%', background:active?'#DC2626':'#059669', flexShrink:0, animation:active?'alertBlink 1s infinite':'none' }} />
      <span style={{ fontFamily:'var(--font-dm)', fontSize:'0.78rem', fontWeight:500, color:'var(--d-text)' }}>
        {active ? `${count} active alert${count>1?'s':''}` : 'All clear'}
      </span>
    </div>
  )
}

function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div className="dash-card" style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 18px' }}>
      <div style={{ width:40, height:40, borderRadius:10, background:`${accent}14`, border:`1px solid ${accent}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:accent }}>
        {icon}
      </div>
      <div style={{ overflow:'hidden', minWidth:0 }}>
        <div style={{ fontFamily:'var(--font-dm)', fontSize:'0.68rem', fontWeight:600, color:'var(--d-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:2 }}>{label}</div>
        <div className="stat-card-value" style={{ fontFamily:'var(--font-libre)', fontWeight:700, fontSize:'0.95rem', color:'var(--d-text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{value}</div>
        <div style={{ fontFamily:'var(--font-dm)', fontSize:'0.68rem', color:'var(--d-muted)' }}>{sub}</div>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--d-bg)', minHeight:'100vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:36, height:36, border:'3px solid var(--d-border)', borderTopColor:'#2563EB', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }} />
        <p style={{ fontFamily:'var(--font-dm)', color:'var(--d-muted)', fontSize:'0.875rem' }}>Loading dashboard...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function NoPersonScreen() {
  return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--d-bg)', minHeight:'100vh', padding:24 }}>
      <div style={{ textAlign:'center', maxWidth:360 }}>
        <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(217,119,6,0.1)', border:'1px solid rgba(217,119,6,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/></svg>
        </div>
        <h3 style={{ fontFamily:'var(--font-libre)', fontWeight:700, fontSize:'1.05rem', color:'var(--d-text)', marginBottom:10 }}>No person linked</h3>
        <p style={{ fontFamily:'var(--font-dm)', fontSize:'0.875rem', color:'var(--d-muted)', lineHeight:1.6 }}>Your account has no person linked yet. Ask the system administrator to link one.</p>
      </div>
    </div>
  )
}

function MockBanner() {
  return (
    <div className="mock-banner">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      Mock mode — simulated data. Set MOCK_MODE = false in lib/mockHardware.js for live hardware.
    </div>
  )
}

function RedDot()    { return <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="currentColor"/></svg> }
function UserIcon()   { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/></svg> }
function DeviceIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 2L8 6v12l4 4 4-4V6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="14" r="2" stroke="currentColor" strokeWidth="1.5"/></svg> }
function BatteryIcon(){ return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M22 11v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> }
function BellIcon()   { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> }
