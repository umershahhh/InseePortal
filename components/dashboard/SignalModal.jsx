'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MOCK_MODE, SIGNAL_OPTIONS } from '@/lib/mockHardware'

export default function SignalModal({ alert, caretakerId, onClose }) {
  const [selected, setSelected] = useState(null)
  const [custom,   setCustom]   = useState('')
  const [sending,  setSending]  = useState(false)
  const [sent,     setSent]     = useState(false)

  async function handleSend() {
    if (!selected && !custom.trim()) return
    setSending(true)

    const option  = SIGNAL_OPTIONS.find(o => o.id === selected)
    const message = custom.trim() || option?.label || ''

    if (!MOCK_MODE) {
      await supabase.from('caretaker_signals').insert({
        alert_id:     alert.id,
        person_id:    alert.person_id,
        caretaker_id: caretakerId,
        signal_type:  selected || 'custom',
        message,
        delivered:    false,
      })
    }

    await new Promise(r => setTimeout(r, 700))
    setSent(true)
    setSending(false)
    setTimeout(onClose, 1600)
  }

  return (
    /* ── Backdrop — z-index from CSS class "modal-backdrop" ── */
    <div
      className="modal-backdrop"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:'fixed', inset:0,
        background:'rgba(2,8,16,0.75)',
        backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:20,
      }}>

      {/* ── Box — z-index from CSS class "modal-box" ── */}
      <div className="modal-box" style={{
        background:'#fff', borderRadius:20, padding:'32px 28px',
        width:'100%', maxWidth:440,
        boxShadow:'0 32px 80px rgba(0,0,0,0.45)',
        animation:'fadeUp .25s ease-out',
      }}>

        {sent ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(5,150,105,0.1)', border:'2px solid #059669', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ fontFamily:'var(--font-libre)', fontWeight:700, fontSize:'1.05rem', color:'#0F172A', marginBottom:8 }}>Signal sent</div>
            <div style={{ fontFamily:'var(--font-dm)', fontSize:'0.875rem', color:'#64748B' }}>It will be spoken aloud through the cane speaker.</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
              <div>
                <h3 style={{ fontFamily:'var(--font-libre)', fontWeight:700, fontSize:'1.05rem', color:'#0F172A' }}>Send a signal</h3>
                <p style={{ fontFamily:'var(--font-dm)', fontSize:'0.8rem', color:'#64748B', marginTop:4 }}>Spoken aloud to the person through the cane</p>
              </div>
              <button onClick={onClose} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#94A3B8', padding:4, borderRadius:6 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>

            {/* Quick options */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginBottom:18 }}>
              {SIGNAL_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => { setSelected(opt.id); setCustom('') }}
                  style={{ background:selected===opt.id?'rgba(37,99,235,0.07)':'#F8FAFC', border:`1.5px solid ${selected===opt.id?'#2563EB':'#E2E8F0'}`, borderRadius:10, padding:'11px 13px', cursor:'pointer', textAlign:'left', transition:'all .15s' }}>
                  <div style={{ fontFamily:'var(--font-dm)', fontWeight:600, fontSize:'0.8rem', color:selected===opt.id?'#2563EB':'#0F172A', marginBottom:2 }}>{opt.label}</div>
                  <div style={{ fontFamily:'var(--font-dm)', fontSize:'0.7rem', color:'#64748B' }}>{opt.sub}</div>
                </button>
              ))}
            </div>

            {/* Custom */}
            <div style={{ marginBottom:22 }}>
              <label style={{ display:'block', fontFamily:'var(--font-dm)', fontSize:'0.78rem', fontWeight:500, color:'#64748B', marginBottom:7 }}>Or type a custom message</label>
              <input type="text" value={custom} onChange={e => { setCustom(e.target.value); setSelected(null) }}
                placeholder='e.g. "I am 5 minutes away"'
                style={{ width:'100%', border:'1.5px solid #E2E8F0', borderRadius:9, padding:'10px 13px', fontFamily:'var(--font-dm)', fontSize:'0.875rem', color:'#0F172A', outline:'none', transition:'border-color .2s' }}
                onFocus={e => e.target.style.borderColor='#2563EB'}
                onBlur={e => e.target.style.borderColor='#E2E8F0'}
              />
            </div>

            {/* Actions */}
            <div style={{ display:'flex', gap:9 }}>
              <button onClick={onClose} style={{ flex:1, background:'transparent', border:'1px solid #E2E8F0', borderRadius:9, padding:'11px', fontFamily:'var(--font-dm)', fontSize:'0.875rem', fontWeight:500, color:'#64748B', cursor:'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSend} disabled={sending || (!selected && !custom.trim())}
                style={{ flex:2, background:'#2563EB', color:'#fff', border:'none', borderRadius:9, padding:'11px', fontFamily:'var(--font-dm)', fontSize:'0.875rem', fontWeight:600, cursor:'pointer', opacity:(!selected && !custom.trim())?0.45:1, transition:'opacity .2s' }}>
                {sending ? 'Sending...' : 'Send signal'}
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
