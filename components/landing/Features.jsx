'use client'

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="#06B6D4" strokeWidth="2"/>
        <path d="M12 5v2M12 17v2M5 12H3M21 12h-2" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'AI Obstacle Detection',
    description: 'YOLOv8 model processes the camera feed in real time, classifying obstacles — people, stairs, walls, vehicles — and delivers instant audio guidance to the user through Bluetooth earphones.',
    accent: '#2563EB',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="10" r="3" stroke="#06B6D4" strokeWidth="2"/>
        <path d="M12 2v2M12 18v2" stroke="#06B6D4" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    title: 'Live GPS Tracking',
    description: 'The cane continuously transmits location coordinates. Caretakers see a live map on their dashboard updated in real time via Supabase Realtime — no polling, no delay.',
    accent: '#06B6D4',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="18" cy="6" r="4" fill="rgba(239,68,68,0.15)" stroke="#EF4444" strokeWidth="1.5"/>
        <path d="M18 4v2M18 8v.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Emergency Alert System',
    description: 'A single button press on the cane fires an instant alert to the caretaker — with location, timestamp, and camera access. The person can signal severity with a short or long press.',
    accent: '#EF4444',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="4" stroke="#10B981" strokeWidth="2"/>
        <path d="M3 9h18" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9 3v6" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="7" y="13" width="4" height="3" rx="1" fill="rgba(16,185,129,0.2)" stroke="#10B981" strokeWidth="1.5"/>
        <rect x="13" y="13" width="4" height="3" rx="1" fill="rgba(16,185,129,0.1)" stroke="#10B981" strokeWidth="1" opacity="0.6"/>
      </svg>
    ),
    title: 'Caretaker Dashboard',
    description: 'A dedicated dashboard gives caretakers a complete view — live map, alert history, camera snapshots, and a signal sender to communicate back to the person in real time.',
    accent: '#10B981',
  },
]

export default function Features() {
  return (
    <section id="features" style={{ background: 'var(--l-surface)', padding: '100px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ maxWidth: 560, marginBottom: 64 }}>
          <div style={{
            display: 'inline-block',
            fontFamily: 'var(--font-dm)', fontSize: '0.75rem', fontWeight: 600,
            color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.12em',
            marginBottom: 16,
          }}>
            Core capabilities
          </div>
          <h2 className="landing-h2" style={{ marginBottom: 16 }}>
            Built for safety.<br />Designed for independence.
          </h2>
          <p className="landing-body">
            Every feature of INSEE is designed around one goal: giving visually impaired individuals and their caretakers full confidence in any situation.
          </p>
        </div>

        {/* 2×2 Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description, accent }) {
  return (
    <div style={{
      padding: '48px 40px',
      background: 'var(--l-bg)',
      border: '1px solid var(--l-border)',
      transition: 'border-color 0.25s, background 0.25s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}30`; e.currentTarget.style.background = 'var(--l-surface-2)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--l-border)'; e.currentTarget.style.background = 'var(--l-bg)' }}>

      {/* Icon box */}
      <div style={{
        width: 52, height: 52, borderRadius: 12,
        background: `${accent}14`, border: `1px solid ${accent}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
      }}>
        {icon}
      </div>

      <h3 style={{
        fontFamily: 'var(--font-libre)', fontWeight: 700,
        fontSize: '1.15rem', color: '#F1F5F9', marginBottom: 12, letterSpacing: '-0.01em',
      }}>
        {title}
      </h3>

      <p style={{
        fontFamily: 'var(--font-dm)', fontSize: '0.92rem', lineHeight: 1.7,
        color: 'var(--l-muted)',
      }}>
        {description}
      </p>

      {/* Bottom accent line */}
      <div style={{ marginTop: 28, width: 32, height: 2, background: `linear-gradient(90deg, ${accent}, transparent)`, borderRadius: 2 }} />
    </div>
  )
}
