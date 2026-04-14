import { api } from '../api/client'
import { useAsyncData } from '../hooks/useAsyncData'
import { formatDate } from '../utils/format'
import CalorieChart from '../components/CalorieChart'

export default function HistoryPage() {
  const { data, loading, error } = useAsyncData(() => api.get('/stats/history'), [])
  const { data: profile } = useAsyncData(() => api.get('/profile'), [])

  const goal = profile?.profile?.dailyCalorieGoal || 2000
  const chartDays = data ? [...data].reverse().slice(-14) : []

  const avg = data && data.length > 0
    ? Math.round(data.reduce((s, d) => s + d.calories, 0) / data.length)
    : 0

  const daysOverGoal = data ? data.filter((d) => d.calories > goal).length : 0
  const daysUnderGoal = data ? data.filter((d) => d.calories <= goal).length : 0

  return (
    <div className="page-stack">
      {/* === ANALYTICS HEADER === */}
      <section className="card">
        <p className="eyebrow">Аналитика</p>
        <h2>Последние дни</h2>
        {loading && <p className="muted-text" style={{ marginTop: 8 }}>Загрузка...</p>}
        {error && <div className="error-box" style={{ marginTop: 8 }}>{error}</div>}

        {!loading && data && data.length > 0 && (
          <>
            <div className="analytics-stats">
              <div className="metric-item">
                <span>Среднее</span>
                <strong>{avg} ккал</strong>
              </div>
              <div className="metric-item">
                <span>Цель</span>
                <strong>{goal} ккал</strong>
              </div>
              <div className="metric-item" style={avg > goal ? { borderColor: '#fecaca' } : {}}>
                <span>Отклонение</span>
                <strong style={{ color: avg > goal ? '#ef4444' : '#22c55e' }}>
                  {avg > goal ? '+' : ''}{avg - goal} ккал
                </strong>
              </div>
              <div className="metric-item">
                <span>В норме / Перебор</span>
                <strong>{daysUnderGoal} / {daysOverGoal}</strong>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <CalorieChart days={chartDays} goal={goal} />
            </div>
          </>
        )}
        {!loading && (!data || data.length === 0) && (
          <div className="empty-box" style={{ marginTop: 8 }}>Пока нет записей. Добавь что-нибудь в дневник.</div>
        )}
      </section>

      {/* === DAY LIST === */}
      {data && data.length > 0 && (
        <section className="card">
          <h3>По дням</h3>
          <div className="list-stack" style={{ marginTop: 8 }}>
            {data.map((day) => {
              const over = day.calories > goal
              return (
                <div key={day.date} className="entry-card">
                  <div>
                    <strong>{formatDate(day.date)}</strong>
                    <span>{day.entries.length} записей</span>
                  </div>
                  <div className="history-metrics">
                    <span style={over ? { color: '#ef4444', fontWeight: 600 } : {}}>{day.calories.toFixed(0)} ккал</span>
                    <span>Б {day.protein.toFixed(1)}</span>
                    <span>Ж {day.fat.toFixed(1)}</span>
                    <span>У {day.carbs.toFixed(1)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
