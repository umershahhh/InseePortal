'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MOCK_MODE, SIGNAL_OPTIONS } from '@/lib/mockHardware'

export default function SignalModal({ alert, caretakerId, onClose }) {
  const [selected, setSelected] = useState(null)
  const [custom, setCustom] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSend() {
    if (!selected && !custom.trim()) return
    setSending(true)

    const option = SIGNAL_OPTIONS.find(o => o.id === selected)
    const message = custom.trim() || option?.label || ''

    if (!MOCK_MODE) {
      await supabase.from('caretaker_signals').insert({
        alert_id: alert.id,
        person_id: alert.person_id,
        caretaker_id: caretakerId,
        signal_type: selected || 'custom',
        message,
      })
    }

    // Simulate a short delay (in real mode Supabase Realtime pushes to Pi)
    await new Promise(r => setTimeout(r, 800))
    setSent(true)
    setSending(false)
    setTimeout(onClose, 1500)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(2,8,16,0.8)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{
        background: '#fff', borderRadius: 20, padding: '32px',
        width: '100%', maxWidth: 460,
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(5,150,105,0.1)', border: '2px solid #059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ fontFamily: 'var(--font-libre)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--d-text)', marginBottom: 8 }}>Signal sent</div>
            <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.875rem', color: 'var(--d-muted)' }}>Message will be spoken aloud to Ahmed</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-libre)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--d-text)', letterSpacing: '-0.01em' }}>Send a signal</h3>
                <p style={{ fontFamily: 'var(--font-dm)', fontSize: '0.82rem', color: 'var(--d-muted)', marginTop: 4 }}>This will be spoken aloud to the person</p>
              </div>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--d-muted)', padding: 4 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>

            {/* Quick options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {SIGNAL_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { setSelected(opt.id); setCustom('') }}
                  style={{
                    background: selected === opt.id ? 'rgba(37,99,235,0.08)' : '#F8FAFC',
                    border: `1.5px solid ${selected === opt.id ? '#2563EB' : 'var(--d-border)'}`,
                    borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-dm)', fontWeight: 600, fontSize: '0.82rem', color: selected === opt.id ? '#2563EB' : 'var(--d-text)', marginBottom: 3 }}>
                    {opt.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-dm)', fontSize: '0.72rem', color: 'var(--d-muted)' }}>
                    {opt.sub}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom message */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-dm)', fontSize: '0.78rem', fontWeight: 500, color: 'var(--d-muted)', marginBottom: 8 }}>
                Or type a custom message
              </label>
              <input
                type="text" value={custom}
                onChange={e => { setCustom(e.target.value); setSelected(null) }}
                placeholder="e.g. I'm 5 minutes away"
                style={{
                  width: '100%', border: '1.5px solid var(--d-border)', borderRadius: 10,
                  padding: '11px 14px', fontFamily: 'var(--font-dm)', fontSize: '0.875rem',
                  color: 'var(--d-text)', outline: 'none', transition: 'border-color 0.2s',
                  background: '#fff',
                }}
                onFocus={e => e.target.style.borderColor = '#2563EB'}
                onBlur={e => e.target.style.borderColor = 'var(--d-border)'}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{
                flex: 1, background: 'transparent', border: '1px solid var(--d-border)',
                borderRadius: 10, padding: '12px', fontFamily: 'var(--font-dm)',
                fontSize: '0.875rem', fontWeight: 500, color: 'var(--d-muted)', cursor: 'pointer',
              }}>
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || (!selected && !custom.trim())}
                style={{
                  flex: 2, background: '#2563EB', color: '#fff', border: 'none',
                  borderRadius: 10, padding: '12px', fontFamily: 'var(--font-dm)',
                  fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                  opacity: (!selected && !custom.trim()) ? 0.5 : 1,
                }}
              >
                {sending ? 'Sending...' : 'Send signal'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
