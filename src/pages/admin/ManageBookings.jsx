import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search, CalendarClock, Zap, Check, X, Filter } from 'lucide-react'
import { getAdminBookings, updateBookingStatus } from '../../services/api'
import { formatTime } from '../../components/SlotPicker'

const TABS = [
  { key: 'all', label: 'All Reservations' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

export default function ManageBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')

  async function loadBookings() {
    setLoading(true)
    try {
      const data = await getAdminBookings(tab === 'all' ? null : tab)
      setBookings(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [tab])

  async function handleStatusUpdate(id, newStatus) {
    await updateBookingStatus(id, newStatus)
    loadBookings()
  }

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const q = search.toLowerCase()
      return (
        b.stationName.toLowerCase().includes(q) ||
        (b.vehicleRegNumber && b.vehicleRegNumber.toLowerCase().includes(q)) ||
        b.id.toLowerCase().includes(q)
      )
    })
  }, [bookings, search])

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      {/* Top breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Link to="/admin" className="flex items-center gap-1 hover:text-text-primary">
          <ArrowLeft size={16} />
          Back to Admin Dashboard
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Driver Reservations</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Monitor live charging slot bookings across all hubs in India.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
                tab === t.key ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 max-w-sm">
          <Search size={15} className="text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plate, station, ID..."
            className="w-full bg-transparent text-xs text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="border-b border-border bg-elevated/50 font-mono text-xs uppercase text-text-secondary">
              <tr>
                <th className="px-5 py-3.5">Booking ID & Date</th>
                <th className="px-5 py-3.5">Station & Port</th>
                <th className="px-5 py-3.5">Vehicle Reg</th>
                <th className="px-5 py-3.5">Tariff</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-secondary">
                    Loading network bookings...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-secondary">
                    No reservations found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-elevated/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-mono text-xs font-semibold text-text-primary">{b.id}</div>
                      <div className="mt-0.5 text-xs text-text-secondary">
                        {b.date} · {formatTime(b.startTime)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-text-primary">{b.stationName}</div>
                      <div className="flex items-center gap-1.5 font-mono text-xs text-text-secondary">
                        <Zap size={11} className="text-accent" />
                        {b.portId} ({b.portType} · {b.powerKw}kW)
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-lg border border-border bg-elevated px-2 py-1 font-mono text-xs font-medium text-text-primary">
                        {b.vehicleRegNumber || 'MH-01-EV-0001'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-text-primary">
                      ₹{b.pricePerKwh}/kWh
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          b.status === 'upcoming'
                            ? 'bg-accent/15 text-accent'
                            : b.status === 'completed'
                            ? 'bg-success/15 text-success'
                            : 'bg-danger/15 text-danger'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {b.status === 'upcoming' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStatusUpdate(b.id, 'completed')}
                            className="flex items-center gap-1 rounded-lg border border-border bg-elevated px-2.5 py-1 text-xs text-success hover:bg-success/10"
                            title="Mark as Completed"
                          >
                            <Check size={12} />
                            Complete
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(b.id, 'cancelled')}
                            className="flex items-center gap-1 rounded-lg border border-border bg-elevated px-2.5 py-1 text-xs text-danger hover:bg-danger/10"
                            title="Cancel Booking"
                          >
                            <X size={12} />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-text-secondary/60">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

