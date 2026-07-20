'use client'
import { useState } from 'react'

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function AlertPanel({ alerts, onSignal, onViewCamera, onResolve }) {
  const [resolving, setResolving] = useState(false)

  const active = alerts.filter(a => a.status === 'active')
  const recent = alerts.filter(a => a.status !== 'active').slice(0, 8)

  async function resolveAll() {
    setResolving(true)
    for (const a of active) {
      await onResolve(a.id)
      await new Promise(r => setTimeout(r, 60))
    }
    setResolving(false)
  }

  return (
    <div className="dash-card" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',   // ← card itself never grows
      padding: 0,
    }}>

      {/* ── Header — fixed, never scrolls ── */}
      <div style={{
        padding: '16px 18px 14px',
        borderBottom: '1px solid var(--d-border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <h3 style={{ fontFamily: 'var(--font-libre)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--d-text)', letterSpacing: '-0.01em' }}>
            Alerts
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {active.length > 0 && (
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', animation: 'alertBlink 1s infinite', flexShrink: 0 }} />
            )}
            {active.length > 1 && (
              <button
                onClick={resolveAll}
                disabled={resolving}
                style={{
                  background: 'rgba(5,150,105,0.08)',
                  color: '#059669',
                  border: '1px solid rgba(5,150,105,0.2)',
                  borderRadius: 6, padding: '4px 10px',
                  fontFamily: 'var(--font-dm)', fontSize: '0.72rem', fontWeight: 500,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  opacity: resolving ? 0.6 : 1,
                }}>
                {resolving ? 'Resolving...' : 'Resolve all'}
              </button>
            )}
          </div>
        </div>
        <p style={{ fontFamily: 'var(--font-dm)', fontSize: '0.75rem', color: 'var(--d-muted)' }}>
          {active.length > 0 ? `${active.length} active` : 'No active alerts'}
        </p>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>

        {/* Active alerts */}
        {active.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.68rem', fontWeight: 600, color: 'var(--d-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Active
            </div>
            {active.map(alert => (
              <ActiveCard
                key={alert.id} alert={alert}
                onSignal={() => onSignal(alert)}
                onCamera={() => onViewCamera(alert)}
                onResolve={() => onResolve(alert.id)}
              />
            ))}
          </div>
        )}

        {/* Recent history */}
        {recent.length > 0 && (
          <div>
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.68rem', fontWeight: 600, color: 'var(--d-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Recent
            </div>
            {recent.map(alert => (
              <RecentRow key={alert.id} alert={alert} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {alerts.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', color: 'var(--d-muted)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 12, opacity: 0.4 }}>
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.875rem' }}>No alerts yet</div>
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.75rem', marginTop: 4, opacity: 0.7 }}>All clear</div>
          </div>
        )}
      </div>
    </div>
  )
}

function ActiveCard({ alert, onSignal, onCamera, onResolve }) {
  return (
    <div style={{
      background: 'rgba(220,38,38,0.05)',
      border: '1px solid rgba(220,38,38,0.2)',
      borderRadius: 10, padding: '13px 14px', marginBottom: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#DC2626', animation: 'alertBlink 1s infinite', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-dm)', fontWeight: 600, color: '#DC2626', fontSize: '0.82rem' }}>
            Emergency SOS
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-dm)', fontSize: '0.7rem', color: 'var(--d-muted)' }}>
          {timeAgo(alert.created_at)}
        </span>
      </div>

      {alert.severity && (
        <div style={{ marginBottom: 8 }}>
          <span className={`badge ${alert.severity === 'major' ? 'badge-danger' : 'badge-warning'}`}>
            {alert.severity === 'major' ? 'Major emergency' : 'Minor — person okay'}
          </span>
        </div>
      )}

      {!alert.severity && (
        <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.75rem', color: 'var(--d-muted)', marginBottom: 8 }}>
          Awaiting severity from person...
        </div>
      )}

      {(alert.lat && alert.lng) && (
        <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.72rem', color: 'var(--d-muted)', marginBottom: 10 }}>
          {Number(alert.lat).toFixed(5)}° N, {Number(alert.lng).toFixed(5)}° E
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 7 }}>
        <button onClick={onSignal} style={{
          background: '#2563EB', color: '#fff', border: 'none',
          borderRadius: 7, padding: '7px 0', fontFamily: 'var(--font-dm)',
          fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
        }}>
          Send signal
        </button>
        <button onClick={onCamera} style={{
          background: 'transparent', color: 'var(--d-text)',
          border: '1px solid var(--d-border)', borderRadius: 7, padding: '7px 0',
          fontFamily: 'var(--font-dm)', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
        }}>
          Camera
        </button>
        <button onClick={onResolve} style={{
          background: 'rgba(5,150,105,0.08)', color: '#059669',
          border: '1px solid rgba(5,150,105,0.2)', borderRadius: 7, padding: '7px 10px',
          fontFamily: 'var(--font-dm)', fontSize: '0.75rem', cursor: 'pointer',
        }} title="Mark resolved">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

function RecentRow({ alert }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '9px 0', borderBottom: '1px solid var(--d-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: alert.status === 'resolved' ? '#059669' : '#D97706', flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.8rem', fontWeight: 500, color: 'var(--d-text)' }}>SOS</div>
          {alert.severity && (
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.7rem', color: 'var(--d-muted)' }}>{alert.severity}</div>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span className={`badge ${alert.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>
          {alert.status}
        </span>
        <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.68rem', color: 'var(--d-muted)', marginTop: 3 }}>
          {timeAgo(alert.created_at)}
        </div>
      </div>
    </div>
  )
}
