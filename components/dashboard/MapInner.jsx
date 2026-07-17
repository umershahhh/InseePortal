'use client'
import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon paths broken by webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom animated pulse marker
const pulseIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:24px;height:24px;">
      <div style="
        position:absolute;inset:0;border-radius:50%;
        background:rgba(37,99,235,0.25);
        animation:markerPulseRing 2s ease-out infinite;
      "></div>
      <div style="
        position:absolute;inset:4px;border-radius:50%;
        background:#2563EB;border:2px solid white;
        box-shadow:0 2px 8px rgba(37,99,235,0.5);
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

function RecenterMap({ location }) {
  const map = useMap()
  useEffect(() => {
    if (location) map.flyTo([location.lat, location.lng], map.getZoom(), { duration: 1.2 })
  }, [location, map])
  return null
}

export default function MapInner({ location, history }) {
  const defaultPos = [31.5204, 74.3587]
  const pos = location ? [location.lat, location.lng] : defaultPos
  const trail = history?.map(h => [h.lat, h.lng]) || []

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 380, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
      <MapContainer
        center={defaultPos} zoom={16}
        style={{ width: '100%', height: '100%', minHeight: 380 }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap contributors'
        />

        {/* Location trail */}
        {trail.length > 1 && (
          <Polyline
            positions={trail}
            pathOptions={{ color: '#2563EB', weight: 3, opacity: 0.5, dashArray: '6 4' }}
          />
        )}

        {/* Current position marker */}
        {location && (
          <Marker position={pos} icon={pulseIcon}>
            <Popup>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem' }}>
                <strong>Ahmed Khan</strong><br />
                {pos[0].toFixed(6)}° N, {pos[1].toFixed(6)}° E<br />
                <span style={{ color: '#64748B', fontSize: '0.78rem' }}>
                  Updated just now
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        <RecenterMap location={location} />
      </MapContainer>

      {/* Coordinates overlay */}
      {location && (
        <div style={{
          position: 'absolute', bottom: 12, left: 12, zIndex: 999,
          background: 'rgba(2,8,16,0.82)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
          padding: '7px 12px',
          fontFamily: 'var(--font-dm)', fontSize: '0.75rem', color: '#94A3B8',
        }}>
          {location.lat.toFixed(5)}° N &nbsp;·&nbsp; {location.lng.toFixed(5)}° E
        </div>
      )}

      <style>{`
        @keyframes markerPulseRing {
          0% { transform: scale(0.8); opacity: 0.9; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
