'use client'

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function AlertPanel({ alerts, onSignal, onViewCamera, onResolve }) {
  const active = alerts.filter(a => a.status === 'active')
  const recent = alerts.filter(a => a.status !== 'active').slice(0, 5)

  return (
    <div className="dash-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-libre)', fontWeight: 700, fontSize: '1rem', color: 'var(--d-text)', letterSpacing: '-0.01em' }}>
            Alerts
          </h3>
          <p style={{ fontFamily: 'var(--font-dm)', fontSize: '0.78rem', color: 'var(--d-muted)', marginTop: 2 }}>
            {active.length > 0 ? `${active.length} active` : 'No active alerts'}
          </p>
        </div>
        {active.length > 0 && (
          <div style={{
            width: 10, height: 10, borderRadius: '50%', background: '#DC2626',
            animation: 'alertBlink 1s ease-in-out infinite',
          }} />
        )}
      </div>

      {/* Active alerts */}
      {active.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {active.map(alert => (
            <ActiveAlertCard
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
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--d-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Recent
          </div>
          {recent.map(alert => (
            <RecentAlertRow key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {alerts.length === 0 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--d-muted)', fontFamily: 'var(--font-dm)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 12, opacity: 0.4 }}>
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ fontSize: '0.875rem' }}>No alerts yet</div>
          <div style={{ fontSize: '0.78rem', marginTop: 4, opacity: 0.7 }}>All clear</div>
        </div>
      )}

      <style>{`
        @keyframes alertBlink {
          0%,100% { opacity: 1; } 50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}

function ActiveAlertCard({ alert, onSignal, onCamera, onResolve }) {
  return (
    <div style={{
      background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)',
      borderRadius: 12, padding: '16px', marginBottom: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', animation: 'alertBlink 1s ease-in-out infinite', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-dm)', fontWeight: 600, color: '#DC2626', fontSize: '0.85rem' }}>
            Emergency SOS
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-dm)', fontSize: '0.72rem', color: 'var(--d-muted)' }}>
          {timeAgo(alert.created_at)}
        </span>
      </div>

      {alert.severity && (
        <div style={{ marginBottom: 10 }}>
          <span className={`badge ${alert.severity === 'major' ? 'badge-danger' : 'badge-warning'}`}>
            {alert.severity === 'major' ? 'Major emergency' : 'Minor — person okay'}
          </span>
        </div>
      )}

      {!alert.severity && (
        <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.78rem', color: 'var(--d-muted)', marginBottom: 10 }}>
          Awaiting severity response from person...
        </div>
      )}

      <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.75rem', color: 'var(--d-muted)', marginBottom: 12 }}>
        {alert.lat?.toFixed(5)}° N, {alert.lng?.toFixed(5)}° E
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onSignal} style={{
          flex: 1, background: '#2563EB', color: '#fff',
          border: 'none', borderRadius: 8, padding: '8px 0',
          fontFamily: 'var(--font-dm)', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
        }}>
          Send signal
        </button>
        <button onClick={onCamera} style={{
          flex: 1, background: 'transparent', color: 'var(--d-text)',
          border: '1px solid var(--d-border)', borderRadius: 8, padding: '8px 0',
          fontFamily: 'var(--font-dm)', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
        }}>
          Camera
        </button>
        <button onClick={onResolve} style={{
          background: 'transparent', color: 'var(--d-muted)',
          border: '1px solid var(--d-border)', borderRadius: 8, padding: '8px 12px',
          fontFamily: 'var(--font-dm)', fontSize: '0.78rem', cursor: 'pointer',
        }}>
          Resolve
        </button>
      </div>
    </div>
  )
}

function RecentAlertRow({ alert }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 0', borderBottom: '1px solid var(--d-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: alert.status === 'resolved' ? '#059669' : '#D97706', flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.82rem', fontWeight: 500, color: 'var(--d-text)' }}>SOS</div>
          {alert.severity && (
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.72rem', color: 'var(--d-muted)' }}>
              {alert.severity}
            </div>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span className={`badge ${alert.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>
          {alert.status}
        </span>
        <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.7rem', color: 'var(--d-muted)', marginTop: 4 }}>
          {timeAgo(alert.created_at)}
        </div>
      </div>
    </div>
  )
}
