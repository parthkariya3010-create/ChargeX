import { STATUS } from '../services/api'

const CONFIG = {
  [STATUS.AVAILABLE]: { label: 'Available now', dot: 'bg-success', text: 'text-success', bg: 'bg-success/10' },
  [STATUS.WAITING]: { label: 'Wait', dot: 'bg-warning', text: 'text-warning', bg: 'bg-warning/10' },
  [STATUS.FULL]: { label: 'Full', dot: 'bg-danger', text: 'text-danger', bg: 'bg-danger/10' },
}

export default function StatusBadge({ status, waitMins = 0, pulse = true }) {
  const cfg = CONFIG[status] ?? CONFIG[STATUS.FULL]
  const label = status === STATUS.WAITING && waitMins ? `~${waitMins} min wait` : cfg.label

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${pulse && status !== STATUS.FULL ? 'animate-pulse-dot' : ''}`} />
      {label}
    </span>
  )
}
