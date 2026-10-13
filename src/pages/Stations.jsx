import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, Map as MapIcon, List, Navigation, Loader2, Compass, Check } from 'lucide-react'
import { getStations, STATUS } from '../services/api'
import StationCard from '../components/StationCard'
import MapView from '../components/MapView'
import { _store as mockStore } from '../data/mockData'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: STATUS.AVAILABLE, label: 'Available now' },
  { key: STATUS.WAITING, label: 'Short wait' },
]

const CITIES = [
  { name: 'All India', lat: null, lng: null },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
]

// Haversine formula to calculate accurate great-circle distance between two GPS coordinates (in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10 // 1 decimal place e.g. 2.4 km
}

function decorateStation(station) {
  const availablePorts = (station.ports || []).filter((port) => port.status === STATUS.AVAILABLE)
  const waitingPorts = (station.ports || []).filter((port) => port.status === STATUS.WAITING)

  if (availablePorts.length > 0) {
    return { ...station, status: STATUS.AVAILABLE, waitMins: 0 }
  }

  if (waitingPorts.length > 0) {
    const waits = waitingPorts.map((port) => port.waitMins).filter((mins) => mins > 0)
    const shortestWait = waits.length > 0 ? Math.min(...waits) : 0
    return { ...station, status: STATUS.WAITING, waitMins: shortestWait }
  }

  return { ...station, status: STATUS.FULL, waitMins: 0 }
}

export default function Stations() {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [mapView, setMapView] = useState(false)
  const [userPosition, setUserPosition] = useState(null)
  const [locating, setLocating] = useState(false)
  const [locationLabel, setLocationLabel] = useState(null)
  const [selectedCity, setSelectedCity] = useState('All India')
  const [maxRadius, setMaxRadius] = useState('all') // 'all', '10', '25', '50'

  // Request browser GPS location
  const detectLiveLocation = () => {
    if (!('geolocation' in navigator)) {
      setErrorMessage('Geolocation is not supported by your browser. Please select a city below.')
      return
    }

    setLocating(true)
    setErrorMessage('')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserPosition(coords)
        setLocationLabel('Your Current Location')
        setSelectedCity('Custom Location')
        setLocating(false)
      },
      (err) => {
        setLocating(false)
        let msg = 'Could not retrieve your location.'
        if (err.code === 1) {
          msg = 'Location permission was denied. Please allow location access in your browser or select a city below.'
        } else if (err.code === 2) {
          msg = 'Location position unavailable. Please select your city below.'
        }
        setErrorMessage(msg)
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 60000 }
    )
  }

  // Attempt auto-location once on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          setLocationLabel('Your Live Location')
        },
        () => {
          // If denied, fallback gracefully without showing an error banner
        },
        { timeout: 5000, enableHighAccuracy: false, maximumAge: 300000 }
      )
    }
  }, [])

  // Handle city selection
  const handleCitySelect = (city) => {
    setSelectedCity(city.name)
    if (city.lat && city.lng) {
      setUserPosition({ lat: city.lat, lng: city.lng })
      setLocationLabel(`${city.name} Center`)
    } else {
      setUserPosition(null)
      setLocationLabel(null)
    }
  }

  // Load stations
  useEffect(() => {
    let active = true
    async function loadStations() {
      setLoading(true)
      setErrorMessage('')
      const lat = userPosition?.lat
      const lng = userPosition?.lng

      try {
        const data = await getStations(lat, lng)
        if (!active) return
        setStations(data.map(decorateStation))
      } catch (error) {
        if (!active) return
        setStations(mockStore.getStations().map(decorateStation))
        setErrorMessage(
          error instanceof Error
            ? `${error.message} Showing demo stations for now.`
            : 'Could not load live stations. Showing demo stations for now.'
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadStations()

    return () => {
      active = false
    }
  }, [userPosition?.lat, userPosition?.lng])

  // Filter, compute live distances, and sort by proximity
  const filtered = useMemo(() => {
    return stations
      .map((station) => {
        // Calculate distance on the fly if coordinates exist
        let distance = station.distanceKm
        if (userPosition && station.latitude && station.longitude) {
          distance = calculateDistance(
            userPosition.lat,
            userPosition.lng,
            station.latitude,
            station.longitude
          )
        }
        return { ...station, distanceKm: distance }
      })
      .filter((s) => {
        // Availability filter
        if (filter !== 'all' && s.status !== filter) return false

        // Search text filter
        const matchText = `${s.name} ${s.address} ${s.city || ''}`.toLowerCase()
        if (query && !matchText.includes(query.toLowerCase())) return false

        // City filter (if city is selected and not All India)
        if (selectedCity !== 'All India' && selectedCity !== 'Custom Location') {
          const stationCity = (s.city || '').toLowerCase()
          if (!stationCity.includes(selectedCity.toLowerCase())) return false
        }

        // Radius filter
        if (maxRadius !== 'all' && s.distanceKm != null) {
          const maxKm = parseFloat(maxRadius)
          if (s.distanceKm > maxKm) return false
        }

        return true
      })
      // Sort nearest to farthest
      .sort((a, b) => {
        if (a.distanceKm != null && b.distanceKm != null) {
          return a.distanceKm - b.distanceKm
        }
        if (a.distanceKm != null) return -1
        if (b.distanceKm != null) return 1
        return (a.name || '').localeCompare(b.name || '')
      })
  }, [stations, query, filter, selectedCity, maxRadius, userPosition])

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      {/* Top Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">GPS & Proximity Discovery</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-text-primary">Nearest Charging Stations</h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            Live port availability, wait times, and instant slot booking across {stations.length || '…'} nationwide hubs.
          </p>
        </div>

        {/* Locate Me Action Button */}
        <button
          onClick={detectLiveLocation}
          disabled={locating}
          className="flex items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/15 px-4 py-2.5 text-sm font-semibold text-accent shadow-glow transition-all hover:bg-accent/25 active:scale-95 disabled:opacity-50"
        >
          {locating ? (
            <Loader2 size={16} className="animate-spin text-accent" />
          ) : (
            <Navigation size={16} className="text-accent" />
          )}
          <span>{locating ? 'Detecting GPS…' : 'Find Nearest to Me'}</span>
        </button>
      </div>

      {/* Active Location Info Banner */}
      {userPosition && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-text-primary">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
            <span className="font-medium">
              Sorted by distance from: <strong className="text-accent">{locationLabel || 'Your Location'}</strong>
            </span>
            {filtered.length > 0 && filtered[0].distanceKm != null && (
              <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent">
                Nearest: {filtered[0].distanceKm} km
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setUserPosition(null)
              setLocationLabel(null)
              setSelectedCity('All India')
            }}
            className="text-xs text-text-secondary underline hover:text-text-primary"
          >
            Reset Location
          </button>
        </div>
      )}

      {/* City Quick Pills */}
      <div className="mb-5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="mr-1 flex items-center gap-1 font-mono uppercase tracking-wider text-text-secondary">
          <Compass size={13} /> City:
        </span>
        {CITIES.map((c) => {
          const isSelected = selectedCity === c.name
          return (
            <button
              key={c.name}
              onClick={() => handleCitySelect(c)}
              className={`shrink-0 rounded-full px-3 py-1.5 font-medium transition-all ${
                isSelected
                  ? 'bg-accent text-base font-semibold shadow-sm'
                  : 'border border-border bg-surface text-text-secondary hover:border-accent/40 hover:text-text-primary'
              }`}
            >
              {c.name}
            </button>
          )
        })}
      </div>

      {/* Search, Filter & View Controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5 shadow-sm">
          <Search size={16} className="text-text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search station name, address, or city…"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 shadow-sm">
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

        {/* Radius Filter (when position active) */}
        {userPosition && (
          <select
            value={maxRadius}
            onChange={(e) => setMaxRadius(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-medium text-text-primary focus:outline-none"
          >
            <option value="all">Any distance</option>
            <option value="5">Within 5 km</option>
            <option value="15">Within 15 km</option>
            <option value="30">Within 30 km</option>
            <option value="50">Within 50 km</option>
          </select>
        )}

        {/* View Toggle (List vs Map) */}
        <button
          onClick={() => setMapView((v) => !v)}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-medium text-text-secondary shadow-sm transition-colors hover:text-text-primary"
        >
          {mapView ? <List size={15} /> : <MapIcon size={15} />}
          <span>{mapView ? 'List View' : 'Map View'}</span>
        </button>
      </div>

      {/* Error Message Banner */}
      {errorMessage ? (
        <div className="mb-4 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
          {errorMessage}
        </div>
      ) : null}

      {/* Content Area */}
      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-surface" />
          ))}
        </div>
      ) : mapView ? (
        <MapView stations={filtered} userPosition={userPosition} />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-text-secondary">
          <p className="text-base font-medium text-text-primary">No stations found nearby</p>
          <p className="mt-1 text-sm">
            {maxRadius !== 'all'
              ? `No hubs within ${maxRadius} km. Try increasing the distance radius or selecting another city.`
              : 'Try searching for a different area or removing filters.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((station, index) => (
            <StationCard
              key={station.id}
              station={station}
              userPosition={userPosition}
              isNearest={index === 0 && !!userPosition}
            />
          ))}
        </div>
      )}
    </div>
  )
}
