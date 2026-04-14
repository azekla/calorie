import { formatDate } from '../utils/format'

const CHART_H = 140
const BAR_GAP = 4

export default function CalorieChart({ days, goal }) {
  if (!days || days.length === 0) return null

  const maxVal = Math.max(goal, ...days.map((d) => d.calories)) * 1.15
  const barWidth = Math.max(16, Math.min(40, (600 - days.length * BAR_GAP) / days.length))

  const goalY = CHART_H - (goal / maxVal) * CHART_H

  return (
    <div className="calorie-chart">
      <div className="calorie-chart-scroll">
        <svg
          width={days.length * (barWidth + BAR_GAP) + BAR_GAP}
          height={CHART_H + 28}
          className="calorie-chart-svg"
        >
          {/* goal line */}
          <line
            x1={0}
            y1={goalY}
            x2={days.length * (barWidth + BAR_GAP) + BAR_GAP}
            y2={goalY}
            stroke="var(--accent)"
            strokeWidth="1"
            strokeDasharray="4 3"
            opacity=".5"
          />
          <text
            x={days.length * (barWidth + BAR_GAP) - 2}
            y={goalY - 4}
            fill="var(--accent)"
            fontSize="10"
            textAnchor="end"
            opacity=".7"
          >
            цель
          </text>

          {days.map((day, i) => {
            const x = BAR_GAP + i * (barWidth + BAR_GAP)
            const h = (day.calories / maxVal) * CHART_H
            const y = CHART_H - h
            const over = day.calories > goal
            const color = over ? '#ef4444' : 'var(--accent)'

            return (
              <g key={day.date}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={h}
                  rx={4}
                  fill={color}
                  opacity={over ? .7 : .6}
                />
                <text
                  x={x + barWidth / 2}
                  y={CHART_H + 12}
                  fill="var(--text-tertiary)"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {new Date(day.date + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '')}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={y - 4}
                  fill="var(--text-secondary)"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {day.calories.toFixed(0)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
