const steps = [
  {
    num: '01',
    title: 'Cane detects the environment',
    body: 'The onboard camera feeds frames into a YOLOv8 model running on the laptop/Raspberry Pi. Detected obstacles are converted to spoken alerts delivered instantly to the user via Bluetooth earphones.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="url(#s1g)" strokeWidth="1.8"/>
        <path d="M12 8v4l3 3" stroke="url(#s1g)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M5 12H3M21 12h-2M12 3V1M12 23v-2" stroke="url(#s1g)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <defs>
          <linearGradient id="s1g" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB"/><stop offset="1" stopColor="#06B6D4"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Location is tracked continuously',
    body: 'The GPS module sends coordinates every few seconds to the Next.js API, which writes them to Supabase. Supabase Realtime broadcasts each update to the caretaker\'s dashboard map — no refresh needed.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="url(#s2g)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="9" r="2.5" stroke="url(#s2g)" strokeWidth="1.8"/>
        <defs>
          <linearGradient id="s2g" x1="5" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#06B6D4"/><stop offset="1" stopColor="#2563EB"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Emergency? Caretaker responds instantly',
    body: 'The person presses the SOS button. An alert fires to Supabase, push notifications reach the caretaker\'s phone, and the camera begins sending snapshots. The caretaker can send a signal back — spoken aloud to the person.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="url(#s3g)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="s3g" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EF4444"/><stop offset="1" stopColor="#F97316"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ background: 'var(--l-bg)', padding: '100px 24px' }} className="grid-bg">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto 72px' }}>
          <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.75rem', fontWeight: 600, color: '#06B6D4', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
            How it works
          </div>
          <h2 className="landing-h2">
            From detection to response<br />in seconds
          </h2>
        </div>

        {/* Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, position: 'relative' }}>
          {/* Connector line */}
          <div style={{ position: 'absolute', top: 60, left: '16%', right: '16%', height: 1, background: 'linear-gradient(90deg, #2563EB, #06B6D4, #EF4444)', opacity: 0.2, zIndex: 0 }} />

          {steps.map((step, i) => (
            <div key={i} style={{
              background: 'var(--l-surface)', border: '1px solid var(--l-border)',
              padding: '40px 36px', position: 'relative', zIndex: 1,
            }}>
              {/* Step number */}
              <div style={{
                fontFamily: 'var(--font-libre)', fontWeight: 900,
                fontSize: '3rem', color: 'rgba(255,255,255,0.04)',
                position: 'absolute', top: 16, right: 24, lineHeight: 1,
                userSelect: 'none',
              }}>{step.num}</div>

              {/* Icon */}
              <div style={{
                width: 60, height: 60, borderRadius: 14,
                background: 'var(--l-surface-2)',
                border: '1px solid var(--l-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 28,
              }}>
                {step.icon}
              </div>

              <div style={{
                fontFamily: 'var(--font-dm)', fontWeight: 600, fontSize: '0.7rem',
                color: 'var(--l-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12,
              }}>
                Step {step.num}
              </div>

              <h3 style={{
                fontFamily: 'var(--font-libre)', fontWeight: 700,
                fontSize: '1.1rem', color: '#F1F5F9', marginBottom: 14, letterSpacing: '-0.01em',
              }}>
                {step.title}
              </h3>

              <p style={{
                fontFamily: 'var(--font-dm)', fontSize: '0.9rem',
                lineHeight: 1.7, color: 'var(--l-muted)',
              }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>

        {/* Tech strip */}
        <div id="technology" style={{ marginTop: 80, padding: '36px 40px', background: 'var(--l-surface)', border: '1px solid var(--l-border)', borderRadius: 0, display: 'flex', gap: 0, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.75rem', color: 'var(--l-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 40, display: 'flex', alignItems: 'center' }}>
            Built with
          </div>
          {['YOLOv8', 'Raspberry Pi 4', 'Next.js 14', 'Supabase', 'Leaflet', 'OpenCV'].map((t, i) => (
            <div key={i} style={{
              fontFamily: 'var(--font-dm)', fontWeight: 500, fontSize: '0.875rem',
              color: 'var(--l-text)', padding: '6px 20px',
              borderLeft: i > 0 ? '1px solid var(--l-border)' : 'none',
              display: 'flex', alignItems: 'center',
            }}>
              {t}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
