export function formatTime(t) {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

export default function SlotPicker({ slots, loading, selected, onSelect }) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-elevated2" />
        ))}
      </div>
    )
  }

  if (!slots.length) {
    return <p className="text-sm text-text-secondary">No slots to show for this date.</p>
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const isSelected = selected === slot.startTime
        return (
          <button
            key={slot.startTime}
            type="button"
            disabled={!slot.available}
            onClick={() => onSelect(slot.startTime)}
            className={`rounded-lg border px-2 py-2.5 font-mono text-xs font-medium transition-colors ${
              isSelected
                ? 'border-accent bg-accent/15 text-accent'
                : slot.available
                ? 'border-border bg-elevated text-text-primary hover:border-accent/40 hover:bg-elevated2'
                : 'cursor-not-allowed border-border/50 bg-transparent text-text-secondary/40 line-through'
            }`}
          >
            {formatTime(slot.startTime)}
          </button>
        )
      })}
    </div>
  )
}
