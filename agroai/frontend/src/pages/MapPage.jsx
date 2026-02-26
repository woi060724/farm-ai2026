import { useContext, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { AuthContext } from '../App.jsx'

export default function MapPage() {
  const { token } = useContext(AuthContext)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  const { data: geoData } = useQuery({
    queryKey: ['mapData'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/farms/map', { headers: { Authorization: `Bearer ${token}` } })
      return res.data
    },
  })

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamic import Leaflet
    import('leaflet').then((L) => {
      const map = L.map(mapRef.current).setView([48.0196, 66.9237], 5)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map)

      mapInstanceRef.current = map

      // Add sample farm markers
      const farms = [
        { lat: 43.2220, lng: 76.8512, name: 'Жылыжай A — Алматы маңы', count: 324, color: '#4caf50' },
        { lat: 51.1801, lng: 71.4460, name: 'Ферма B — Астана маңы', count: 148, color: '#66bb6a' },
        { lat: 42.3417, lng: 69.5901, name: 'Ферма C — Шымкент', count: 210, color: '#ff8f00' },
      ]

      farms.forEach(farm => {
        const icon = L.divIcon({
          className: '',
          html: `<div style="background:${farm.color};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.4)">🏡</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })

        L.marker([farm.lat, farm.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>${farm.name}</b><br/>Мал саны: ${farm.count} бас`)
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  const stats = [
    { label: 'Жалпы ферма', value: '3', icon: '🏡' },
    { label: 'Жалпы мал', value: '682', icon: '🐄' },
    { label: 'Жайылым аймақ', value: '83 га', icon: '🌾' },
    { label: 'GPS белсенді', value: '682', icon: '📍' },
  ]

  return (
    <div className="space-y-4 slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Unbounded, sans-serif' }}>GPS Карта</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(165,214,167,0.6)' }}>Фермалар мен малдың орналасуы</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {stats.map(({ label, value, icon }) => (
          <div key={label} className="glass p-3 text-center stat-card">
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-lg font-bold text-white" style={{ fontFamily: 'Unbounded, sans-serif' }}>{value}</div>
            <div className="text-xs" style={{ color: 'rgba(165,214,167,0.5)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="glass overflow-hidden" style={{ height: '450px' }}>
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      </div>

      <div className="glass p-4">
        <h3 className="text-sm font-semibold text-white mb-3" style={{ fontFamily: 'Unbounded, sans-serif' }}>Белгілер</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { color: '#4caf50', label: 'Белсенді жылыжай', icon: '🏡' },
            { color: '#ff8f00', label: 'Ашық жайылым', icon: '🌾' },
            { color: '#d32f2f', label: 'Карантин аймағы', icon: '⚠️' },
            { color: '#7e57c2', label: 'GPS трекер', icon: '📍' },
          ].map(({ color, label, icon }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span>{icon}</span>
              <div className="w-3 h-3 rounded-full" style={{ background: color }} />
              <span style={{ color: 'rgba(165,214,167,0.7)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
