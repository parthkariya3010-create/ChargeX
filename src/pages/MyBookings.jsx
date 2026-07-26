import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'
import { getMyBookings, cancelBooking } from '../services/api'
import BookingCard from '../components/BookingCard'

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('upcoming')

  function load() {
    setLoading(true)
    getMyBookings().then((data) => {
      setBookings(data)
      setLoading(false)
    })
  }

  useEffect(load, [])

  async function handleCancel(id) {
    await cancelBooking(id)
    load()
  }

  const filtered = useMemo(() => bookings.filter((b) => b.status === tab), [bookings, tab])

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Your reservations</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-text-primary">My bookings</h1>

      <div className="mt-6 flex items-center gap-1 rounded-xl border border-border bg-surface p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-surface" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border py-16 text-center">
            <CalendarClock size={28} className="text-text-secondary" />
            <p className="mt-3 text-text-secondary">No {tab} bookings.</p>
            {tab === 'upcoming' && (
              <Link to="/" className="mt-3 text-sm font-medium text-accent">
                Browse stations to book a slot →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((b) => (
              <BookingCard key={b.id} booking={b} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
