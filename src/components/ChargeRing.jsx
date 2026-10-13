import { STATUS } from '../services/api'

const COLORS = {
  [STATUS.AVAILABLE]: 'hsl(var(--success))',
  [STATUS.WAITING]: 'hsl(var(--warning))',
  [STATUS.FULL]: 'hsl(var(--danger))',
}

// Draws an arc gauge: fraction of ports that are free right now.
export default function ChargeRing({ ports, size = 56 }) {
  const total = ports.length
  const free = ports.filter((p) => p.status === STATUS.AVAILABLE).length
  const fraction = total ? free / total : 0

  const overallStatus = free > 0 ? STATUS.AVAILABLE : ports.some((p) => p.status === STATUS.WAITING) ? STATUS.WAITING : STATUS.FULL
  const color = COLORS[overallStatus]

  const stroke = 5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = Math.max(fraction, total ? 0.06 : 0) * c

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-xs font-semibold text-text-primary leading-none">{free}/{total}</span>
      </div>
    </div>
  )
}
