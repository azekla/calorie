const SIZE = 160
const STROKE = 10
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function getColor(pct) {
  if (pct <= 80) return '#22c55e'
  if (pct <= 100) return '#eab308'
  return '#ef4444'
}

function getMessage(pct, remaining) {
  if (pct === 0) return 'Начни день с завтрака'
  if (pct <= 40) return 'Хорошее начало'
  if (pct <= 70) return 'Отличный темп'
  if (pct <= 90) return `Осталось ${remaining} ккал`
  if (pct <= 100) return 'Почти в норме!'
  if (pct <= 115) return 'Цель достигнута'
  return `Перебор на ${Math.abs(remaining)} ккал`
}

export default function ProgressRing({ consumed = 0, goal = 2000, remaining = 0 }) {
  const pct = goal > 0 ? Math.round((consumed / goal) * 100) : 0
  const displayPct = Math.min(pct, 100)
  const offset = CIRCUMFERENCE - (displayPct / 100) * CIRCUMFERENCE
  const color = getColor(pct)
  const message = getMessage(pct, remaining)

  return (
    <div className="progress-ring">
      <div className="progress-ring-circle">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--border-light)"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            className="progress-ring-value"
          />
        </svg>
        <div className="progress-ring-label">
          <strong className="progress-ring-number">{consumed}</strong>
          <span className="progress-ring-unit">/ {goal} ккал</span>
        </div>
      </div>
      <div className="progress-ring-footer">
        <span className="progress-ring-pct" style={{ color }}>{pct}%</span>
        <span className="progress-ring-msg">{message}</span>
      </div>
    </div>
  )
}
