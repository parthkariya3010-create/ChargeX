import { Zap, MapPin, Calendar, X } from 'lucide-react'
import { formatTime } from './SlotPicker'

const STATUS_STYLE = {
  upcoming: 'text-accent bg-accent/10',
  completed: 'text-text-secondary bg-elevated2',
  cancelled: 'text-danger bg-danger/10',
}

export default function BookingCard({ booking, onCancel }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-base font-semibold text-text-primary">{booking.stationName}</h3>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS_STYLE[booking.status]}`}>
            {booking.status}
          </span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
          <MapPin size={13} />
          {booking.stationAddress}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
          <span className="flex items-center gap-1.5 font-mono text-xs">
            <Calendar size={13} />
            {booking.date} · {formatTime(booking.startTime)}
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[11px]">
            <Zap size={12} className="text-accent" />
            {booking.portType} · {booking.powerKw}kW
          </span>
          <span className="font-mono text-[11px] text-text-secondary">₹{booking.pricePerKwh}/kWh</span>
        </div>
      </div>

      {booking.status === 'upcoming' && (
        <button
          onClick={() => onCancel(booking.id)}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
        >
          <X size={14} />
          Cancel
        </button>
      )}
    </div>
  )
}
