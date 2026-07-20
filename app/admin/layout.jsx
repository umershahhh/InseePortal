'use client'
import { useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="dash-layout">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dash-main">
        <div style={{ display:'none', alignItems:'center', gap:12, background:'var(--d-surface)', borderBottom:'1px solid var(--d-border)', padding:'12px 16px', position:'sticky', top:0, zIndex:31 }} className="mobile-topbar">
          <button onClick={() => setSidebarOpen(true)} style={{ background:'var(--d-bg)', border:'1px solid var(--d-border)', borderRadius:8, padding:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <span style={{ fontFamily:'var(--font-libre)', fontWeight:800, fontSize:'1rem', color:'var(--d-text)' }}>INSEE Admin</span>
        </div>
        {children}
      </div>
      <style>{`@media(max-width:1024px){.mobile-topbar{display:flex !important;}}`}</style>
    </div>
  )
}
