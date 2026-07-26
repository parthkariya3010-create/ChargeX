import { Link } from 'react-router-dom'
import { MapPin, Star, ArrowUpRight } from 'lucide-react'
import ChargeRing from './ChargeRing'
import StatusBadge from './StatusBadge'

export default function StationCard({ station, userPosition }) {
  const types = [...new Set(station.ports.map((p) => p.type))]
  const detailLink = userPosition
    ? `/stations/${station.id}?lat=${userPosition.lat}&lng=${userPosition.lng}`
    : `/stations/${station.id}`

  return (
    <Link
      to={detailLink}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card transition-all hover:border-accent/40 hover:bg-elevated sm:flex-row sm:items-center"
    >
      <ChargeRing ports={station.ports} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-text-primary">{station.name}</h3>
          <ArrowUpRight size={16} className="mt-1 shrink-0 text-text-secondary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
        </div>

        <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
          <MapPin size={13} className="shrink-0" />
          <span className="truncate">{station.address}</span>
          {station.distanceKm ? <span className="shrink-0">· {station.distanceKm} km</span> : null}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={station.status} waitMins={station.waitMins} />
          <span className="flex items-center gap-1 rounded-full bg-elevated2 px-2.5 py-1 text-xs text-text-secondary">
            <Star size={12} className="fill-warning text-warning" />
            {station.rating}
          </span>
          {types.map((t) => (
            <span key={t} className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-text-secondary">
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
