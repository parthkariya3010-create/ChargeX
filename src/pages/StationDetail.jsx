import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Star, Zap, IndianRupee, CheckCircle2 } from 'lucide-react'
import { getStationById, getAvailableSlots, createBooking, getProfile, STATUS } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import SlotPicker, { formatTime } from '../components/SlotPicker'

function nextDays(count) {
  return Array.from({ length: count }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })
}
function toISODate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function StationDetail() {
  const { stationId } = useParams()
  const navigate = useNavigate()

  const [station, setStation] = useState(null)
  const [loadingStation, setLoadingStation] = useState(true)

  const days = useMemo(() => nextDays(5), [])
  const [selectedDate, setSelectedDate] = useState(toISODate(days[0]))
  const [selectedPortId, setSelectedPortId] = useState(null)
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedTime, setSelectedTime] = useState(null)

  const [vehicleRegNumber, setVehicleRegNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(null)

  useEffect(() => {
    let active = true
    const params = new URLSearchParams(window.location.search)
    const userLat = params.get('lat') ? parseFloat(params.get('lat')) : undefined
    const userLng = params.get('lng') ? parseFloat(params.get('lng')) : undefined
    getStationById(stationId, userLat, userLng).then((data) => {
      if (!active) return
      setStation(data)
      setLoadingStation(false)
      const firstAvailable = data?.ports.find((p) => p.status !== STATUS.FULL)
      if (firstAvailable) setSelectedPortId(firstAvailable.id)
    })
    getProfile().then((p) => setVehicleRegNumber(p.vehicle?.regNumber ?? ''))
    return () => {
      active = false
    }
  }, [stationId])

  useEffect(() => {
    if (!selectedPortId) return
    setLoadingSlots(true)
    setSelectedTime(null)
    getAvailableSlots(stationId, selectedPortId, selectedDate).then((data) => {
      setSlots(data)
      setLoadingSlots(false)
    })
  }, [stationId, selectedPortId, selectedDate])

  async function handleConfirm() {
    if (!selectedPortId || !selectedTime || !vehicleRegNumber.trim()) return
    setSubmitting(true)
    const booking = await createBooking({
      stationId,
      portId: selectedPortId,
      date: selectedDate,
      startTime: selectedTime,
      vehicleRegNumber: vehicleRegNumber.trim(),
    })
    setSubmitting(false)
    setConfirmed(booking)
  }

  if (loadingStation) {
    return <div className="mx-auto max-w-4xl px-5 py-10 text-text-secondary">Loading station…</div>
  }
  if (!station) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-10 text-text-secondary">
        Station not found. <Link to="/" className="text-accent">Go back</Link>
      </div>
    )
  }

  if (confirmed) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold text-text-primary">Slot booked</h1>
        <p className="mt-2 text-sm text-text-secondary">
          {station.name} · {confirmed.date} at {formatTime(confirmed.startTime)}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate('/bookings')}
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-base transition-opacity hover:opacity-90"
          >
            View my bookings
          </button>
          <Link
            to="/"
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            Browse more
          </Link>
        </div>
      </div>
    )
  }

  const selectedPort = station.ports.find((p) => p.id === selectedPortId)
  const canConfirm = selectedPortId && selectedTime && vehicleRegNumber.trim().length > 0

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <Link to="/" className="mb-5 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft size={15} />
        Back to stations
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">{station.name}</h1>
            <p className="mt-1.5 flex items-center gap-1 text-sm text-text-secondary">
              <MapPin size={13} />
              {station.address}{station.distanceKm ? ` · ${station.distanceKm} km away` : ''}
            </p>
        </div>
        <StatusBadge status={station.status} waitMins={station.waitMins} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 rounded-full bg-elevated2 px-2.5 py-1 text-xs text-text-secondary">
          <Star size={12} className="fill-warning text-warning" />
          {station.rating}
        </span>
        {station.amenities.map((a) => (
          <span key={a} className="rounded-full border border-border px-2.5 py-1 text-xs text-text-secondary">
            {a}
          </span>
        ))}
      </div>

      {/* Ports */}
      <section className="mt-8">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-text-secondary">Choose a charging port</h2>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {station.ports.map((port) => {
            const disabled = port.status === STATUS.FULL
            const isSelected = selectedPortId === port.id
            return (
              <button
                key={port.id}
                disabled={disabled}
                onClick={() => setSelectedPortId(port.id)}
                className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-accent bg-accent/10'
                    : disabled
                    ? 'cursor-not-allowed border-border/50 opacity-50'
                    : 'border-border bg-surface hover:border-accent/40 hover:bg-elevated'
                }`}
              >
                <div>
                  <p className="flex items-center gap-1.5 font-mono text-sm font-medium text-text-primary">
                    <Zap size={14} className="text-accent" />
                    {port.type} · {port.powerKw}kW
                  </p>
                  <p className="mt-1 flex items-center gap-0.5 text-xs text-text-secondary">
                    <IndianRupee size={11} />
                    {port.pricePerKwh}/kWh
                  </p>
                </div>
                <StatusBadge status={port.status} waitMins={port.waitMins} pulse={false} />
              </button>
            )
          })}
        </div>
      </section>

      {/* Date */}
      <section className="mt-8">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-text-secondary">Pick a date</h2>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => {
            const iso = toISODate(d)
            const isSelected = iso === selectedDate
            return (
              <button
                key={iso}
                onClick={() => setSelectedDate(iso)}
                className={`flex min-w-[64px] flex-col items-center rounded-xl border px-3 py-2.5 transition-colors ${
                  isSelected ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-surface text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className="text-[11px] font-medium uppercase">{d.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                <span className="font-display text-lg font-semibold">{d.getDate()}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Slots */}
      <section className="mt-8">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-text-secondary">Pick a time slot</h2>
        <div className="mt-3">
          <SlotPicker slots={slots} loading={loadingSlots} selected={selectedTime} onSelect={setSelectedTime} />
        </div>
      </section>

      {/* Vehicle + confirm */}
      <section className="mt-8 rounded-2xl border border-border bg-surface p-5">
        <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary">Vehicle registration number</label>
        <input
          value={vehicleRegNumber}
          onChange={(e) => setVehicleRegNumber(e.target.value)}
          placeholder="MH 02 AB 1234"
          className="mt-2 w-full rounded-lg border border-border bg-elevated px-3.5 py-2.5 font-mono text-sm text-text-primary placeholder:text-text-secondary/60 focus:border-accent focus:outline-none"
        />

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="text-sm text-text-secondary">
            {selectedPort && selectedTime ? (
              <>
                <span className="text-text-primary">{selectedPort.type}</span> · {selectedDate} at{' '}
                <span className="font-mono text-text-primary">{formatTime(selectedTime)}</span>
              </>
            ) : (
              'Select a port, date, and time to continue'
            )}
          </div>
          <button
            disabled={!canConfirm || submitting}
            onClick={handleConfirm}
            className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-base transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? 'Booking…' : 'Confirm booking'}
          </button>
        </div>
      </section>
    </div>
  )
}
