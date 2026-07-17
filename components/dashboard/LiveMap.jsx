'use client'
import dynamic from 'next/dynamic'

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%', height: '100%', minHeight: 380,
      background: '#0D1E38', borderRadius: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ fontFamily: 'var(--font-dm)', color: '#64748B', fontSize: '0.875rem' }}>
        Loading map...
      </div>
    </div>
  ),
})

export default function LiveMap({ location, history }) {
  return <MapInner location={location} history={history} />
}
