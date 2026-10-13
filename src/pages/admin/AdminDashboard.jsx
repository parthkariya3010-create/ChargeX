import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Zap, CalendarClock, Users, TrendingUp, Plus, Shield, ArrowUpRight } from 'lucide-react'
import { getAdminStats, getAdminBookings, getStations, updateBookingStatus } from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import { formatTime } from '../../components/SlotPicker'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])
  const [stationsCount, setStationsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    try {
      const [statsData, bookingsData, stationsData] = await Promise.all([
        getAdminStats().catch(() => null),
        getAdminBookings().catch(() => []),
        getStations().catch(() => []),
      ])

      setStats(statsData)
      setRecentBookings(bookingsData.slice(0, 6))
      setStationsCount(stationsData.length)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleStatusChange(bookingId, newStatus) {
    await updateBookingStatus(bookingId, newStatus)
    loadData()
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 items-center gap-1.5 rounded-full bg-accent2/20 px-2.5 font-mono text-[11px] font-semibold text-accent2">
              <Shield size={12} />
              ADMIN / OPERATOR PORTAL
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold text-text-primary">
            Network Operations Center
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage infrastructure, charging hubs, port tariffs, and driver reservations across India.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/stations"
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-base transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            Manage Stations
          </Link>
          <Link
            to="/admin/bookings"
            className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-elevated"
          >
            <CalendarClock size={16} />
            All Bookings
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="font-mono text-xs uppercase tracking-wider">Charging Hubs</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <MapPin size={16} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-semibold text-text-primary">
            {stats?.totalStations ?? stationsCount}
          </p>
          <p className="mt-1 text-xs text-text-secondary">Active nationwide</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="font-mono text-xs uppercase tracking-wider">Total Ports</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/15 text-success">
              <Zap size={16} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-semibold text-text-primary">
            {stats?.totalPorts ?? (stationsCount * 3)}
          </p>
          <p className="mt-1 text-xs text-success">Fast & Ultra-fast DC/AC</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="font-mono text-xs uppercase tracking-wider">Active Bookings</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/15 text-warning">
              <CalendarClock size={16} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-semibold text-text-primary">
            {stats?.upcomingBookings ?? recentBookings.filter((b) => b.status === 'upcoming').length}
          </p>
          <p className="mt-1 text-xs text-text-secondary">Scheduled slots</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="font-mono text-xs uppercase tracking-wider">Registered Users</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent2/15 text-accent2">
              <Users size={16} />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-semibold text-text-primary">
            {stats?.totalUsers ?? 12}
          </p>
          <p className="mt-1 text-xs text-text-secondary">Drivers & Hosts</p>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Hubs & Quick Actions */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-lg font-semibold text-text-primary">Infrastructure</h2>
          <p className="mt-1 text-xs text-text-secondary">
            Configure charging hubs, GPS pins, port types, and per-kWh pricing.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              to="/admin/stations"
              className="flex items-center justify-between rounded-xl border border-border bg-elevated p-3.5 text-sm font-medium text-text-primary transition-colors hover:border-accent/40"
            >
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-accent" />
                <span>Manage Charging Stations</span>
              </div>
              <ArrowUpRight size={16} className="text-text-secondary" />
            </Link>

            <Link
              to="/admin/bookings"
              className="flex items-center justify-between rounded-xl border border-border bg-elevated p-3.5 text-sm font-medium text-text-primary transition-colors hover:border-accent/40"
            >
              <div className="flex items-center gap-3">
                <CalendarClock size={18} className="text-accent2" />
                <span>All Driver Reservations</span>
              </div>
              <ArrowUpRight size={16} className="text-text-secondary" />
            </Link>

            <div className="rounded-xl border border-border/60 bg-base/50 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">System Health</span>
                <span className="font-mono text-success">ONLINE (Port 8081)</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full w-full bg-success" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Driver Bookings */}
        <div className="rounded-2xl border border-border bg-surface p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-text-primary">Recent Reservations</h2>
              <p className="text-xs text-text-secondary">Real-time driver slot bookings</p>
            </div>
            <Link to="/admin/bookings" className="font-mono text-xs text-accent hover:underline">
              View all →
            </Link>
          </div>

          <div className="mt-4 space-y-2.5">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-elevated" />
                ))}
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="py-12 text-center text-sm text-text-secondary">
                No recent bookings recorded in the system.
              </div>
            ) : (
              recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-elevated p-3.5 text-xs sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary truncate">{b.stationName}</span>
                      <span className="rounded bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
                        {b.portType} · {b.powerKw}kW
                      </span>
                    </div>
                    <p className="mt-0.5 text-text-secondary">
                      {b.date} at {formatTime(b.startTime)} · Vehicle: {b.vehicleRegNumber || 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-medium capitalize text-[11px] ${
                        b.status === 'upcoming'
                          ? 'bg-accent/15 text-accent'
                          : b.status === 'completed'
                          ? 'bg-success/15 text-success'
                          : 'bg-danger/15 text-danger'
                      }`}
                    >
                      {b.status}
                    </span>

                    {b.status === 'upcoming' && (
                      <button
                        onClick={() => handleStatusChange(b.id, 'completed')}
                        className="rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-text-secondary hover:bg-elevated2 hover:text-success"
                        title="Mark Completed"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

