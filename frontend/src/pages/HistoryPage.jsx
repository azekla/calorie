import { api } from '../api/client'
import { useAsyncData } from '../hooks/useAsyncData'
import { formatDate } from '../utils/format'

export default function HistoryPage() {
  const { data, loading, error } = useAsyncData(() => api.get('/stats/history'), [])

  return (
    <div className="page-stack">
      <section className="page-hero card soft-glow">
        <p className="eyebrow">История</p>
        <h2>Прошлые дни и мини-статистика</h2>
        <p className="muted-text">Смотри динамику без перегруза: сколько было калорий и как выглядел баланс по БЖУ.</p>
      </section>
      {loading && <div className="card">Загрузка истории...</div>}
      {error && <div className="error-box">{error}</div>}
      <div className="list-stack">
        {data?.map((day) => (
          <div key={day.date} className="card history-row">
            <div>
              <strong>{formatDate(day.date)}</strong>
              <span>{day.entries.length} записей</span>
            </div>
            <div className="history-metrics">
              <span>{day.calories.toFixed(0)} ккал</span>
              <span>Б {day.protein.toFixed(1)}</span>
              <span>Ж {day.fat.toFixed(1)}</span>
              <span>У {day.carbs.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
