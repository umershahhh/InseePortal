'use client'
import dynamic from 'next/dynamic'

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div style={{ width:'100%', height:'100%', minHeight:360, background:'#0D1E38', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:'var(--font-dm)', color:'#64748B', fontSize:'0.875rem' }}>Loading map...</div>
    </div>
  ),
})

export default function LiveMap({ location, history }) {
  return (
    /*
      map-card-wrapper applies:
        position: relative;
        isolation: isolate;   ← contains Leaflet's z-index stack
        z-index: 0;
      This stops Leaflet panes from bleeding above the topbar or modal.
    */
    <div className="map-card-wrapper" style={{ width:'100%', height:'100%', minHeight:360 }}>
      <MapInner location={location} history={history} />
    </div>
  )
}
