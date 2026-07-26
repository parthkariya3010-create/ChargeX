import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, Map as MapIcon, List } from 'lucide-react'
import { getStations, STATUS } from '../services/api'
import StationCard from '../components/StationCard'
import MapView from '../components/MapView'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: STATUS.AVAILABLE, label: 'Available now' },
  { key: STATUS.WAITING, label: 'Short wait' },
]

export default function Stations() {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [mapView, setMapView] = useState(true)
  const [userPosition, setUserPosition] = useState(null)

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { timeout: 5000, enableHighAccuracy: false }
      )
    }
  }, [])

  useEffect(() => {
    let active = true
    const lat = userPosition?.lat
    const lng = userPosition?.lng
    getStations(lat, lng).then((data) => {
      if (active) {
        setStations(data)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [userPosition])

  const filtered = useMemo(() => {
    return stations
      .filter((s) => (filter === 'all' ? true : s.status === filter))
      .filter((s) => `${s.name} ${s.address}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }, [stations, query, filter])

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-7">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Find a station</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-text-primary">Charging stations near you</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Live port status, wait times, and instant slot booking across {stations.length || '…'} stations.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5">
          <Search size={16} className="text-text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by station or area…"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
          <SlidersHorizontal size={14} className="ml-2 text-text-secondary" />
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.key ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setMapView((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          {mapView ? <List size={15} /> : <MapIcon size={15} />}
          {mapView ? 'List' : 'Map'}
        </button>
      </div>

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-surface" />
          ))}
        </div>
      ) : mapView ? (
        <MapView stations={filtered} />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-text-secondary">
          No stations match your search. Try a different filter.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((station) => (
            <StationCard key={station.id} station={station} userPosition={userPosition} />
          ))}
        </div>
      )}
    </div>
  )
}
