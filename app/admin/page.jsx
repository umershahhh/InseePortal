'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MOCK_MODE, MOCK_ADMIN_STATS, MOCK_ADMIN_USERS, MOCK_ALERTS } from '@/lib/mockHardware'

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats]         = useState(null)
  const [users, setUsers]         = useState([])
  const [alerts, setAlerts]       = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [userFilter, setUserFilter]   = useState('all')
  const [search, setSearch]           = useState('')

  useEffect(() => {
    if (MOCK_MODE) {
      setStats(MOCK_ADMIN_STATS)
      setUsers(MOCK_ADMIN_USERS)
      setAlerts(MOCK_ALERTS)
      setPageLoading(false)
      return
    }

    // Real mode: verify admin session then load data
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }

      // Fetch all profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      // Fetch all persons
      const { data: persons } = await supabase
        .from('persons')
        .select('*')
        .order('created_at', { ascending: false })

      // Fetch recent alerts
      const { data: alertData } = await supabase
        .from('alerts')
        .select('*, persons(name)')
        .order('created_at', { ascending: false })
        .limit(20)

      // Build user rows by merging profiles and persons
      const caretakers = (profiles || []).filter(p => p.role === 'caretaker')
      const adminRows  = (profiles || []).filter(p => p.role === 'admin')

      const personRows = (persons || []).map(person => {
        const linkedCaretaker = caretakers.find(c => c.id === person.caretaker_id)
        return {
          id:         person.id,
          name:       person.name,
          role:       'user',
          caretaker:  linkedCaretaker?.full_name || '—',
          device:     person.device_id || '—',
          status:     person.is_active ? 'online' : 'offline',
          created_at: person.created_at?.split('T')[0],
        }
      })

      const caretakerRows = caretakers.map(c => ({
        id:         c.id,
        name:       c.full_name,
        role:       'caretaker',
        caretaker:  '—',
        device:     '—',
        status:     'online',
        created_at: c.created_at?.split('T')[0],
      }))

      const allUsers = [...personRows, ...caretakerRows]

      const onlineDevices = persons?.filter(p => p.is_active).length || 0
      const todayStart    = new Date(); todayStart.setHours(0,0,0,0)
      const alertsToday   = (alertData || []).filter(a => new Date(a.created_at) >= todayStart).length

      setStats({
        total_devices:    persons?.length   || 0,
        active_devices:   onlineDevices,
        total_caretakers: caretakers.length,
        total_persons:    persons?.length   || 0,
        alerts_today:     alertsToday,
        alerts_this_week: alertData?.length || 0,
      })
      setUsers(allUsers)
      setAlerts(alertData || [])
      setPageLoading(false)
    }).catch(() => router.push('/login'))
  }, [router])

  const filteredUsers = users.filter(u => {
    const matchRole   = userFilter === 'all' || u.role === userFilter
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
                        u.device?.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  if (pageLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--d-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid var(--d-border)', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontFamily: 'var(--font-dm)', color: 'var(--d-muted)', fontSize: '0.875rem' }}>Loading admin panel...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <>
      {MOCK_MODE && (
        <div className="mock-banner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Mock mode — all data is simulated. Set MOCK_MODE = false in lib/mockHardware.js for live data.
        </div>
      )}

      {/* Topbar */}
      <div className="dash-topbar">
        <div>
          <h1 style={{ fontFamily: 'var(--font-libre)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--d-text)', letterSpacing: '-0.01em' }}>System Administration</h1>
          <p style={{ fontFamily: 'var(--font-dm)', fontSize: '0.78rem', color: 'var(--d-muted)', marginTop: 1 }}>Super admin — full system access</p>
        </div>
      </div>

      <div className="dash-content">

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            <AdminStat label="Total devices"   value={stats.total_devices}    sub={`${stats.active_devices} online`}      accent="#2563EB" icon={<DeviceIcon />} />
            <AdminStat label="Caretakers"       value={stats.total_caretakers} sub="Registered"                             accent="#06B6D4" icon={<UsersIcon />}  />
            <AdminStat label="Persons tracked" value={stats.total_persons}    sub="Active users"                           accent="#10B981" icon={<PersonIcon />} />
            <AdminStat label="Alerts today"    value={stats.alerts_today}     sub={`${stats.alerts_this_week} this week`}  accent="#DC2626" icon={<AlertIcon />}  />
          </div>
        )}

        {/* System health */}
        <div id="system" className="dash-card" style={{ marginBottom: 24, padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ fontFamily: 'var(--font-dm)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--d-text)' }}>System Health</div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[
                { label: 'API',         status: 'operational' },
                { label: 'Supabase DB', status: 'operational' },
                { label: 'Realtime',    status: 'operational' },
                { label: 'Storage',     status: 'operational' },
                { label: 'Push Notifs', status: MOCK_MODE ? 'mock' : 'operational' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.status === 'operational' ? '#059669' : '#D97706' }} />
                  <span style={{ fontFamily: 'var(--font-dm)', fontSize: '0.8rem', color: 'var(--d-muted)' }}>{s.label}</span>
                  <span style={{ fontFamily: 'var(--font-dm)', fontSize: '0.72rem', color: s.status === 'operational' ? '#059669' : '#D97706' }}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Users table */}
        <div id="users" className="dash-card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-libre)', fontWeight: 700, fontSize: '1rem', color: 'var(--d-text)', letterSpacing: '-0.01em' }}>Users & Devices</h3>
              <p style={{ fontFamily: 'var(--font-dm)', fontSize: '0.78rem', color: 'var(--d-muted)', marginTop: 2 }}>{filteredUsers.length} of {users.length} records</p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-muted)' }}><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." style={{ paddingLeft: 32, paddingRight: 14, paddingTop: 8, paddingBottom: 8, border: '1px solid var(--d-border)', borderRadius: 8, fontFamily: 'var(--font-dm)', fontSize: '0.82rem', color: 'var(--d-text)', outline: 'none', width: 200 }} />
              </div>
              <div style={{ display: 'flex', background: 'var(--d-bg)', borderRadius: 8, padding: 3 }}>
                {['all', 'user', 'caretaker'].map(f => (
                  <button key={f} onClick={() => setUserFilter(f)} style={{ background: userFilter === f ? '#fff' : 'transparent', border: 'none', borderRadius: 6, padding: '5px 12px', fontFamily: 'var(--font-dm)', fontSize: '0.78rem', fontWeight: 500, color: userFilter === f ? 'var(--d-text)' : 'var(--d-muted)', cursor: 'pointer', textTransform: 'capitalize', boxShadow: userFilter === f ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--d-border)' }}>
                  {['Name', 'Role', 'Caretaker', 'Device', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'var(--font-dm)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--d-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', fontFamily: 'var(--font-dm)', color: 'var(--d-muted)', fontSize: '0.875rem' }}>No users found</td></tr>
                ) : filteredUsers.map((user, i) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--d-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                    <td style={{ padding: '14px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: user.role === 'user' ? 'linear-gradient(135deg,#2563EB,#06B6D4)' : 'linear-gradient(135deg,#7C3AED,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-dm)', fontWeight: 700, fontSize: '0.78rem', color: '#fff' }}>{user.name?.[0] || '?'}</span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-dm)', fontWeight: 500, fontSize: '0.875rem', color: 'var(--d-text)' }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 14px' }}><span className={`badge ${user.role === 'caretaker' ? 'badge-info' : 'badge-success'}`}>{user.role}</span></td>
                    <td style={{ padding: '14px 14px', fontFamily: 'var(--font-dm)', fontSize: '0.82rem', color: 'var(--d-muted)' }}>{user.caretaker}</td>
                    <td style={{ padding: '14px 14px' }}><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--d-text)', background: 'var(--d-bg)', padding: '3px 8px', borderRadius: 5 }}>{user.device}</span></td>
                    <td style={{ padding: '14px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: user.status === 'online' ? '#059669' : '#94A3B8' }} />
                        <span style={{ fontFamily: 'var(--font-dm)', fontSize: '0.82rem', color: user.status === 'online' ? '#059669' : 'var(--d-muted)' }}>{user.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 14px', fontFamily: 'var(--font-dm)', fontSize: '0.82rem', color: 'var(--d-muted)' }}>{user.created_at}</td>
                    <td style={{ padding: '14px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={{ background: 'var(--d-bg)', border: '1px solid var(--d-border)', borderRadius: 6, padding: '5px 10px', fontFamily: 'var(--font-dm)', fontSize: '0.75rem', color: 'var(--d-text)', cursor: 'pointer' }}>Edit</button>
                        <button style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 6, padding: '5px 10px', fontFamily: 'var(--font-dm)', fontSize: '0.75rem', color: '#DC2626', cursor: 'pointer' }}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All alerts */}
        <div id="alerts" className="dash-card">
          <h3 style={{ fontFamily: 'var(--font-libre)', fontWeight: 700, fontSize: '1rem', color: 'var(--d-text)', letterSpacing: '-0.01em', marginBottom: 20 }}>Recent Alerts — System-wide</h3>
          {alerts.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-dm)', color: 'var(--d-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '24px 0' }}>No alerts yet</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--d-border)' }}>
                    {['Time', 'Person', 'Type', 'Severity', 'Status', 'Location'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'var(--font-dm)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--d-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alerts.map(alert => (
                    <tr key={alert.id} style={{ borderBottom: '1px solid var(--d-border)' }}>
                      <td style={{ padding: '14px', fontFamily: 'var(--font-dm)', fontSize: '0.82rem', color: 'var(--d-muted)', whiteSpace: 'nowrap' }}>{new Date(alert.created_at).toLocaleString()}</td>
                      <td style={{ padding: '14px', fontFamily: 'var(--font-dm)', fontWeight: 500, fontSize: '0.875rem', color: 'var(--d-text)' }}>{alert.persons?.name || 'Unknown'}</td>
                      <td style={{ padding: '14px' }}><span className="badge badge-danger">Emergency SOS</span></td>
                      <td style={{ padding: '14px' }}>
                        {alert.severity
                          ? <span className={`badge ${alert.severity === 'major' ? 'badge-danger' : 'badge-warning'}`}>{alert.severity}</span>
                          : <span className="badge" style={{ background: 'var(--d-bg)', color: 'var(--d-muted)', border: '1px solid var(--d-border)' }}>Pending</span>
                        }
                      </td>
                      <td style={{ padding: '14px' }}><span className={`badge ${alert.status === 'resolved' ? 'badge-success' : 'badge-danger'}`}>{alert.status}</span></td>
                      <td style={{ padding: '14px', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--d-muted)' }}>{alert.lat ? `${Number(alert.lat).toFixed(4)}, ${Number(alert.lng).toFixed(4)}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </>
  )
}

function AdminStat({ label, value, sub, accent, icon }) {
  return (
    <div className="dash-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px' }}>
      <div style={{ width: 44, height: 44, borderRadius: 11, background: `${accent}14`, border: `1px solid ${accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: accent }}>{icon}</div>
      <div>
        <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--d-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-libre)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--d-text)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.72rem', color: 'var(--d-muted)', marginTop: 3 }}>{sub}</div>
      </div>
    </div>
  )
}

function DeviceIcon()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L8 6v12l4 4 4-4V6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="14" r="2" stroke="currentColor" strokeWidth="1.5"/></svg> }
function UsersIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> }
function PersonIcon()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/></svg> }
function AlertIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> }
