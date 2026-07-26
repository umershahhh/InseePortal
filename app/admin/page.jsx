'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MOCK_MODE, MOCK_ADMIN_STATS, MOCK_ADMIN_USERS, MOCK_ALERTS } from '@/lib/mockHardware'

// ─────────────────────────────────────────────────────
// CREATE USER MODAL
// ─────────────────────────────────────────────────────
function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    caretaker_name: '', caretaker_email: '', caretaker_password: '', caretaker_phone: '',
    person_name: '', person_phone: '', device_id: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit() {
    if (!form.caretaker_name || !form.caretaker_email || !form.caretaker_password || !form.person_name) {
      setError('Please fill in all required fields.'); return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setSuccess(data.message)
      setTimeout(() => { onCreated(); onClose() }, 1500)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', border: '1.5px solid var(--d-border)', borderRadius: 9,
    padding: '10px 13px', fontFamily: 'var(--font-dm)', fontSize: '0.875rem',
    color: 'var(--d-text)', outline: 'none', background: 'var(--d-bg)',
    transition: 'border-color .2s',
  }
  const labelStyle = { display: 'block', fontFamily: 'var(--font-dm)', fontSize: '0.78rem', fontWeight: 500, color: 'var(--d-muted)', marginBottom: 6 }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(7,12,24,0.75)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div className="modal-box" style={{ background:'var(--d-surface)', borderRadius:20, padding:'28px 24px', width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 32px 80px rgba(0,0,0,0.45)' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <div>
            <h3 style={{ fontFamily:'var(--font-libre)', fontWeight:700, fontSize:'1.05rem', color:'var(--d-text)' }}>Create Caretaker + Person</h3>
            <p style={{ fontFamily:'var(--font-dm)', fontSize:'0.78rem', color:'var(--d-muted)', marginTop:3 }}>Both will be created and linked automatically</p>
          </div>
          <button onClick={onClose} style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--d-muted)', padding:4, borderRadius:6 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        {success && (
          <div style={{ background:'rgba(5,150,105,0.08)', border:'1px solid rgba(5,150,105,0.2)', borderRadius:10, padding:'12px 16px', marginBottom:18, fontFamily:'var(--font-dm)', fontSize:'0.85rem', color:'#059669' }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{ background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.2)', borderRadius:10, padding:'12px 16px', marginBottom:18, fontFamily:'var(--font-dm)', fontSize:'0.85rem', color:'#DC2626' }}>
            {error}
          </div>
        )}

        {/* Caretaker section */}
        <div style={{ background:'rgba(99,102,241,0.05)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:12, padding:'18px 16px', marginBottom:16 }}>
          <div style={{ fontFamily:'var(--font-dm)', fontWeight:600, fontSize:'0.78rem', color:'#6366F1', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>
            Caretaker Account
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={labelStyle}>Full name *</label>
              <input style={inputStyle} value={form.caretaker_name} onChange={e => set('caretaker_name', e.target.value)} placeholder="Sara Khan"
                onFocus={e => e.target.style.borderColor='#6366F1'} onBlur={e => e.target.style.borderColor='var(--d-border)'} />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} value={form.caretaker_phone} onChange={e => set('caretaker_phone', e.target.value)} placeholder="+92-300-0000000"
                onFocus={e => e.target.style.borderColor='#6366F1'} onBlur={e => e.target.style.borderColor='var(--d-border)'} />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" style={inputStyle} value={form.caretaker_email} onChange={e => set('caretaker_email', e.target.value)} placeholder="sara@example.com"
                onFocus={e => e.target.style.borderColor='#6366F1'} onBlur={e => e.target.style.borderColor='var(--d-border)'} />
            </div>
            <div>
              <label style={labelStyle}>Password *</label>
              <input type="password" style={inputStyle} value={form.caretaker_password} onChange={e => set('caretaker_password', e.target.value)} placeholder="Min 6 characters"
                onFocus={e => e.target.style.borderColor='#6366F1'} onBlur={e => e.target.style.borderColor='var(--d-border)'} />
            </div>
          </div>
        </div>

        {/* Person section */}
        <div style={{ background:'rgba(5,150,105,0.04)', border:'1px solid rgba(5,150,105,0.15)', borderRadius:12, padding:'18px 16px', marginBottom:22 }}>
          <div style={{ fontFamily:'var(--font-dm)', fontWeight:600, fontSize:'0.78rem', color:'#059669', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>
            Visually Impaired Person
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={labelStyle}>Full name *</label>
              <input style={inputStyle} value={form.person_name} onChange={e => set('person_name', e.target.value)} placeholder="Ahmed Khan"
                onFocus={e => e.target.style.borderColor='#059669'} onBlur={e => e.target.style.borderColor='var(--d-border)'} />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} value={form.person_phone} onChange={e => set('person_phone', e.target.value)} placeholder="+92-300-0000000"
                onFocus={e => e.target.style.borderColor='#059669'} onBlur={e => e.target.style.borderColor='var(--d-border)'} />
            </div>
            <div style={{ gridColumn:'1 / -1' }}>
              <label style={labelStyle}>Cane device ID</label>
              <input style={inputStyle} value={form.device_id} onChange={e => set('device_id', e.target.value)} placeholder="CANE-001"
                onFocus={e => e.target.style.borderColor='#059669'} onBlur={e => e.target.style.borderColor='var(--d-border)'} />
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, background:'transparent', border:'1px solid var(--d-border)', borderRadius:9, padding:'11px', fontFamily:'var(--font-dm)', fontSize:'0.875rem', color:'var(--d-muted)', cursor:'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex:2, background:'#6366F1', color:'#fff', border:'none', borderRadius:9, padding:'11px', fontFamily:'var(--font-dm)', fontSize:'0.875rem', fontWeight:600, cursor:'pointer', opacity:loading?0.7:1 }}>
            {loading ? 'Creating...' : 'Create & Link'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────
// DELETE CONFIRM MODAL
// ─────────────────────────────────────────────────────
function DeleteModal({ user, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleDelete() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, role: user.role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onDeleted()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(7,12,24,0.75)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div className="modal-box" style={{ background:'var(--d-surface)', borderRadius:18, padding:'28px 24px', width:'100%', maxWidth:380, boxShadow:'0 32px 80px rgba(0,0,0,0.45)' }}>
        <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h3 style={{ fontFamily:'var(--font-libre)', fontWeight:700, fontSize:'1.05rem', color:'var(--d-text)', textAlign:'center', marginBottom:10 }}>Remove User</h3>
        <p style={{ fontFamily:'var(--font-dm)', fontSize:'0.875rem', color:'var(--d-muted)', textAlign:'center', lineHeight:1.6, marginBottom:22 }}>
          Are you sure you want to remove <strong style={{ color:'var(--d-text)' }}>{user.name}</strong>?<br/>
          {user.role === 'caretaker' && 'Linked persons will be unlinked but not deleted.'}
        </p>
        {error && <div style={{ color:'#DC2626', fontFamily:'var(--font-dm)', fontSize:'0.82rem', textAlign:'center', marginBottom:14 }}>{error}</div>}
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, background:'transparent', border:'1px solid var(--d-border)', borderRadius:9, padding:'10px', fontFamily:'var(--font-dm)', fontSize:'0.875rem', color:'var(--d-muted)', cursor:'pointer' }}>Cancel</button>
          <button onClick={handleDelete} disabled={loading} style={{ flex:1, background:'#DC2626', color:'#fff', border:'none', borderRadius:9, padding:'10px', fontFamily:'var(--font-dm)', fontSize:'0.875rem', fontWeight:600, cursor:'pointer', opacity:loading?0.7:1 }}>
            {loading ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────
// MAIN ADMIN PAGE
// ─────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats]     = useState(null)
  const [users, setUsers]     = useState([])
  const [alerts, setAlerts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  async function loadData() {
    if (MOCK_MODE) {
      setStats(MOCK_ADMIN_STATS); setUsers(MOCK_ADMIN_USERS); setAlerts(MOCK_ALERTS); setLoading(false); return
    }
    const [{ data: profiles }, { data: persons }, { data: alertData }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('persons').select('*').order('created_at', { ascending: false }),
      supabase.from('alerts').select('*, persons(name)').order('created_at', { ascending: false }).limit(20),
    ])
    const caretakers = (profiles || []).filter(p => p.role === 'caretaker')
    const todayStart = new Date(); todayStart.setHours(0,0,0,0)
    const personRows = (persons || []).map(p => ({
      id: p.id, name: p.name, role: 'user',
      caretaker: caretakers.find(c => c.id === p.caretaker_id)?.full_name || '—',
      device: p.device_id || '—', status: p.is_active ? 'online' : 'offline',
      created_at: p.created_at?.split('T')[0],
    }))
    const caretakerRows = caretakers.map(c => ({
      id: c.id, name: c.full_name, role: 'caretaker', caretaker: '—', device: '—',
      status: 'online', created_at: c.created_at?.split('T')[0],
    }))
    setUsers([...personRows, ...caretakerRows])
    setAlerts(alertData || [])
    setStats({
      total_devices: persons?.length || 0, active_devices: persons?.filter(p=>p.is_active).length || 0,
      total_caretakers: caretakers.length, total_persons: persons?.length || 0,
      alerts_today: (alertData||[]).filter(a=>new Date(a.created_at)>=todayStart).length,
      alerts_this_week: alertData?.length || 0,
    })
    setLoading(false)
  }

  useEffect(() => {
    if (!MOCK_MODE) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) { router.push('/login'); return }
        loadData()
      }).catch(() => router.push('/login'))
    } else {
      loadData()
    }
  }, [])

  const filteredUsers = users.filter(u => {
    const matchRole = filter === 'all' || u.role === filter
    const matchSearch = (u.name||'').toLowerCase().includes(search.toLowerCase()) ||
                        (u.device||'').toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--d-bg)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:36, height:36, border:'3px solid var(--d-border)', borderTopColor:'#6366F1', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 14px' }} />
        <p style={{ fontFamily:'var(--font-dm)', color:'var(--d-muted)', fontSize:'0.875rem' }}>Loading admin panel...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <>
      {MOCK_MODE && (
        <div className="mock-banner">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          Mock mode — simulated data. Set MOCK_MODE = false for live data.
        </div>
      )}

      {/* Topbar */}
      <div className="dash-topbar">
        <div>
          <h1 style={{ fontFamily:'var(--font-libre)', fontWeight:700, fontSize:'1rem', color:'var(--d-text)', letterSpacing:'-0.01em' }}>System Administration</h1>
          <p style={{ fontFamily:'var(--font-dm)', fontSize:'0.75rem', color:'var(--d-muted)', marginTop:1 }}>Super admin — full system access</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="dash-btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          Create user
        </button>
      </div>

      <div className="dash-content">

        {/* Stats */}
        {stats && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }} className="admin-stats">
            <StatCard label="Total devices"   value={stats.total_devices}    sub={`${stats.active_devices} online`}       accent="#6366F1" icon={<DevIcon />} />
            <StatCard label="Caretakers"       value={stats.total_caretakers} sub="Registered"                              accent="#22D3EE" icon={<UsersIcon />} />
            <StatCard label="Persons tracked" value={stats.total_persons}    sub="Active users"                            accent="#10B981" icon={<PersonIcon />} />
            <StatCard label="Alerts today"    value={stats.alerts_today}     sub={`${stats.alerts_this_week} this week`}   accent="#DC2626" icon={<BellIcon />} />
          </div>
        )}

        {/* System health */}
        <div className="dash-card" style={{ marginBottom:22, padding:'16px 22px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div style={{ fontFamily:'var(--font-dm)', fontWeight:600, fontSize:'0.875rem', color:'var(--d-text)' }}>System Health</div>
            <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
              {['API','Supabase DB','Realtime','Storage','Camera Feed'].map(s => (
                <div key={s} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:'#059669' }} />
                  <span style={{ fontFamily:'var(--font-dm)', fontSize:'0.78rem', color:'var(--d-muted)' }}>{s}</span>
                  <span style={{ fontFamily:'var(--font-dm)', fontSize:'0.7rem', color:'#059669' }}>operational</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Users table */}
        <div className="dash-card" style={{ marginBottom:22 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, flexWrap:'wrap', gap:12 }}>
            <div>
              <h3 style={{ fontFamily:'var(--font-libre)', fontWeight:700, fontSize:'0.95rem', color:'var(--d-text)' }}>Users & Devices</h3>
              <p style={{ fontFamily:'var(--font-dm)', fontSize:'0.75rem', color:'var(--d-muted)', marginTop:2 }}>{filteredUsers.length} of {users.length} records</p>
            </div>
            <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
              <div style={{ position:'relative' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--d-muted)' }}><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                  style={{ paddingLeft:32, paddingRight:12, paddingTop:8, paddingBottom:8, border:'1px solid var(--d-border)', borderRadius:8, fontFamily:'var(--font-dm)', fontSize:'0.82rem', color:'var(--d-text)', outline:'none', background:'var(--d-bg)', width:180 }} />
              </div>
              <div style={{ display:'flex', background:'var(--d-bg)', borderRadius:8, padding:3 }}>
                {['all','user','caretaker'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ background:filter===f?'var(--d-surface)':'transparent', border:'none', borderRadius:6, padding:'5px 11px', fontFamily:'var(--font-dm)', fontSize:'0.78rem', fontWeight:500, color:filter===f?'var(--d-text)':'var(--d-muted)', cursor:'pointer', textTransform:'capitalize', boxShadow:filter===f?'0 1px 3px rgba(0,0,0,0.08)':'none' }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:600 }}>
              <thead>
                <tr style={{ borderBottom:'2px solid var(--d-border)' }}>
                  {['Name','Role','Caretaker','Device','Status','Joined','Actions'].map(h => (
                    <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontFamily:'var(--font-dm)', fontSize:'0.7rem', fontWeight:600, color:'var(--d-muted)', textTransform:'uppercase', letterSpacing:'0.07em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding:'28px', textAlign:'center', fontFamily:'var(--font-dm)', color:'var(--d-muted)', fontSize:'0.875rem' }}>No users found</td></tr>
                ) : filteredUsers.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom:'1px solid var(--d-border)', background:i%2===0?'transparent':'rgba(99,102,241,0.02)' }}>
                    <td style={{ padding:'12px 12px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                        <div style={{ width:30, height:30, borderRadius:'50%', flexShrink:0, background:u.role==='user'?'linear-gradient(135deg,#6366F1,#22D3EE)':'linear-gradient(135deg,#059669,#22D3EE)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <span style={{ fontFamily:'var(--font-dm)', fontWeight:700, fontSize:'0.75rem', color:'#fff' }}>{u.name?.[0]||'?'}</span>
                        </div>
                        <span style={{ fontFamily:'var(--font-dm)', fontWeight:500, fontSize:'0.855rem', color:'var(--d-text)' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'12px 12px' }}><span className={`badge ${u.role==='caretaker'?'badge-info':'badge-success'}`}>{u.role}</span></td>
                    <td style={{ padding:'12px 12px', fontFamily:'var(--font-dm)', fontSize:'0.8rem', color:'var(--d-muted)' }}>{u.caretaker}</td>
                    <td style={{ padding:'12px 12px' }}><span style={{ fontFamily:'monospace', fontSize:'0.78rem', color:'var(--d-text)', background:'var(--d-bg)', padding:'2px 8px', borderRadius:5 }}>{u.device}</span></td>
                    <td style={{ padding:'12px 12px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ width:7, height:7, borderRadius:'50%', background:u.status==='online'?'#059669':'#94A3B8' }} />
                        <span style={{ fontFamily:'var(--font-dm)', fontSize:'0.8rem', color:u.status==='online'?'#059669':'var(--d-muted)' }}>{u.status}</span>
                      </div>
                    </td>
                    <td style={{ padding:'12px 12px', fontFamily:'var(--font-dm)', fontSize:'0.8rem', color:'var(--d-muted)', whiteSpace:'nowrap' }}>{u.created_at}</td>
                    <td style={{ padding:'12px 12px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          style={{ background:'rgba(220,38,38,0.07)', border:'1px solid rgba(220,38,38,0.18)', borderRadius:6, padding:'5px 10px', fontFamily:'var(--font-dm)', fontSize:'0.75rem', color:'#DC2626', cursor:'pointer', transition:'background .2s' }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(220,38,38,0.14)'}
                          onMouseLeave={e => e.currentTarget.style.background='rgba(220,38,38,0.07)'}>
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All alerts */}
        <div className="dash-card">
          <h3 style={{ fontFamily:'var(--font-libre)', fontWeight:700, fontSize:'0.95rem', color:'var(--d-text)', marginBottom:18 }}>Recent Alerts — System-wide</h3>
          <div className="admin-table-wrap">
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
              <thead>
                <tr style={{ borderBottom:'2px solid var(--d-border)' }}>
                  {['Time','Person','Type','Severity','Status','Location'].map(h => (
                    <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontFamily:'var(--font-dm)', fontSize:'0.7rem', fontWeight:600, color:'var(--d-muted)', textTransform:'uppercase', letterSpacing:'0.07em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alerts.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding:'28px', textAlign:'center', fontFamily:'var(--font-dm)', color:'var(--d-muted)', fontSize:'0.875rem' }}>No alerts yet</td></tr>
                ) : alerts.map(a => (
                  <tr key={a.id} style={{ borderBottom:'1px solid var(--d-border)' }}>
                    <td style={{ padding:'12px 12px', fontFamily:'var(--font-dm)', fontSize:'0.8rem', color:'var(--d-muted)', whiteSpace:'nowrap' }}>{new Date(a.created_at).toLocaleString()}</td>
                    <td style={{ padding:'12px 12px', fontFamily:'var(--font-dm)', fontWeight:500, fontSize:'0.855rem', color:'var(--d-text)' }}>{a.persons?.name || 'Unknown'}</td>
                    <td style={{ padding:'12px 12px' }}><span className="badge badge-danger">SOS</span></td>
                    <td style={{ padding:'12px 12px' }}>{a.severity ? <span className={`badge ${a.severity==='major'?'badge-danger':'badge-warning'}`}>{a.severity}</span> : <span className="badge" style={{ background:'var(--d-bg)', color:'var(--d-muted)', border:'1px solid var(--d-border)' }}>Pending</span>}</td>
                    <td style={{ padding:'12px 12px' }}><span className={`badge ${a.status==='resolved'?'badge-success':'badge-danger'}`}>{a.status}</span></td>
                    <td style={{ padding:'12px 12px', fontFamily:'monospace', fontSize:'0.75rem', color:'var(--d-muted)' }}>{a.lat ? `${Number(a.lat).toFixed(4)}, ${Number(a.lng).toFixed(4)}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={loadData} />}
      {deleteTarget && (
        MOCK_MODE
          ? <DeleteModal user={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={() => { setUsers(p => p.filter(u => u.id !== deleteTarget.id)); setDeleteTarget(null) }} />
          : <DeleteModal user={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={loadData} />
      )}
    </>
  )
}

function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div className="dash-card" style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 18px' }}>
      <div style={{ width:40, height:40, borderRadius:10, background:`${accent}14`, border:`1px solid ${accent}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:accent }}>{icon}</div>
      <div>
        <div style={{ fontFamily:'var(--font-dm)', fontSize:'0.68rem', fontWeight:600, color:'var(--d-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:2 }}>{label}</div>
        <div style={{ fontFamily:'var(--font-libre)', fontWeight:800, fontSize:'1.4rem', color:'var(--d-text)', lineHeight:1 }}>{value}</div>
        <div style={{ fontFamily:'var(--font-dm)', fontSize:'0.7rem', color:'var(--d-muted)', marginTop:3 }}>{sub}</div>
      </div>
    </div>
  )
}

function DevIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L8 6v12l4 4 4-4V6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="14" r="2" stroke="currentColor" strokeWidth="1.5"/></svg> }
function UsersIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> }
function PersonIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/></svg> }
function BellIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> }
