import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Navigation, X } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import 'leaflet-routing-machine'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const userIcon = L.divIcon({
  className: '',
  html: `<div style="background:#3b82f6;border:3px solid #fff;border-radius:50%;width:16px;height:16px;box-shadow:0 2px 6px rgba(0,0,0,.3)"/>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const stationIcon = (status) => {
  const colors = { available: '#22c55e', waiting: '#eab308', full: '#ef4444' }
  const color = colors[status] || '#6b7280'
  return L.divIcon({
    className: '',
    html: `<div style="display:flex;align-items:center;justify-content:center;background:${color};color:#fff;border:2px solid #fff;border-radius:50%;width:32px;height:32px;font-size:14px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.25)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

function LocateMeButton() {
  const map = useMap()
  return (
    <button
      onClick={() => map.locate({ setView: true, maxZoom: 14 })}
      className="absolute bottom-5 right-5 z-[1000] flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary shadow-lg transition-colors hover:bg-elevated"
    >
      <Navigation size={16} className="text-accent" />
      Use my location
    </button>
  )
}

function ClearButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute left-5 top-5 z-[1000] flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary shadow-lg transition-colors hover:bg-elevated"
    >
      <X size={16} />
      Clear route
    </button>
  )
}

function DirectionsPanel({ route }) {
  if (!route) return null
  const dist = (route.summary.totalDistance / 1000).toFixed(1)
  const time = Math.round(route.summary.totalTime / 60)
  return (
    <div className="absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-xl bg-surface/95 px-5 py-3 text-sm shadow-lg backdrop-blur">
      <span className="font-semibold text-text-primary">{dist} km</span>
      <span className="mx-2 text-text-secondary">·</span>
      <span className="text-text-secondary">{time} min</span>
    </div>
  )
}

function RoutingControl({ userPosition, destination }) {
  const map = useMap()
  const controlRef = useRef(null)

  useEffect(() => {
    if (!userPosition || !destination) return

    if (controlRef.current) {
      map.removeControl(controlRef.current)
    }

    const waypoints = [
      L.latLng(userPosition.lat, userPosition.lng),
      L.latLng(destination.lat, destination.lng),
    ]

    const control = L.Routing.control({
      waypoints,
      routeWhileDragging: false,
      showAlternatives: true,
      fitSelectedRoutes: true,
      show: false,
      lineOptions: {
        styles: [
          { color: '#3b82f6', opacity: 0.8, weight: 5 },
          { color: '#93c5fd', opacity: 0.4, weight: 9 },
        ],
      },
      plan: L.Routing.plan(waypoints, {
        createMarker: () => null,
        draggableWaypoints: false,
      }),
    })

    control.addTo(map)
    controlRef.current = control

    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current)
        controlRef.current = null
      }
    }
  }, [map, userPosition, destination])

  return null
}

export default function MapView({ stations }) {
  const [userPosition, setUserPosition] = useState(null)
  const [locating, setLocating] = useState(false)
  const [destination, setDestination] = useState(null)
  const [route, setRoute] = useState(null)

  useEffect(() => {
    if ('geolocation' in navigator) {
      setLocating(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setLocating(false)
        },
        () => setLocating(false),
        { timeout: 8000, enableHighAccuracy: false }
      )
    }
  }, [])

  const handleGetDirections = useCallback((station) => {
    if (!userPosition) return
    setDestination({ lat: station.latitude, lng: station.longitude })
    setRoute(null)

    const waypoints = [
      `${userPosition.lat},${userPosition.lng}`,
      `${station.latitude},${station.longitude}`,
    ]

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${waypoints[0]};${waypoints[1]}?overview=full&geometries=geojson`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.code === 'Ok' && data.routes.length > 0) {
          setRoute({
            summary: data.routes[0],
            geometry: data.routes[0].geometry,
          })
        }
      })
      .catch(() => {})
  }, [userPosition])

  const clearRoute = useCallback(() => {
    setDestination(null)
    setRoute(null)
  }, [])

  const center = userPosition || { lat: 19.076, lng: 72.877 }
  const zoom = userPosition ? 13 : 12
  const stationsWithCoords = stations.filter((s) => s.latitude && s.longitude)

  return (
    <div className="relative h-[75vh] w-full overflow-hidden rounded-2xl border border-border">
      <MapContainer center={center} zoom={zoom} className="h-full w-full" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userPosition && (
          <Marker position={userPosition} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {stationsWithCoords.map((s) => {
          const etaMin = s.distanceKm ? Math.round((s.distanceKm / 35) * 60) : null
          return (
            <Marker key={s.id} position={[s.latitude, s.longitude]} icon={stationIcon(s.status)}>
              <Popup>
                <div className="min-w-[200px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <p className="mb-0.5 text-sm font-semibold" style={{ color: '#EAF0F6' }}>{s.name}</p>
                  <p className="text-xs" style={{ color: '#8896A6' }}>{s.address}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-xs" style={{ color: '#8896A6' }}>
                    {s.distanceKm ? <span>{s.distanceKm} km</span> : null}
                    {etaMin ? <span>&#9200; ~{etaMin} min (35 km/h)</span> : null}
                  </div>
                  <div className="mt-2.5 flex gap-2">
                    <Link
                      to={`/stations/${s.id}`}
                      className="inline-block rounded-lg px-3 py-1.5 text-xs font-semibold"
                      style={{ background: '#35C6F4', color: '#0A0E14' }}
                    >
                      View details
                    </Link>
                    <button
                      onClick={() => handleGetDirections(s)}
                      className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                      style={{ borderColor: '#35C6F4', color: '#35C6F4', background: 'transparent' }}
                    >
                      <Navigation size={12} />
                      Directions
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        <RoutingControl userPosition={userPosition} destination={destination} />
        <LocateMeButton />
      </MapContainer>

      {route && <DirectionsPanel route={route} />}
      {destination && <ClearButton onClick={clearRoute} />}

      {locating && (
        <div className="absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-xl bg-surface/90 px-4 py-2 text-xs text-text-secondary shadow-lg backdrop-blur">
          Locating you…
        </div>
      )}
    </div>
  )
}
