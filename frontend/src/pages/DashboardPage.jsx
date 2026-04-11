import DashboardCard from '../components/DashboardCard'
import ProgressBar from '../components/ProgressBar'
import { api } from '../api/client'
import { useAsyncData } from '../hooks/useAsyncData'

export default function DashboardPage() {
  const { data, loading, error, reload } = useAsyncData(() => api.get('/stats/today'), [])

  if (loading) return <div className="card">Собираем dashboard...</div>
  if (error) return <div className="error-box">{error}</div>

  return (
    <div className="page-stack">
      <section className="hero-card card soft-glow">
        <div>
          <p className="eyebrow">Главная</p>
          <h2>Сегодняшний баланс выглядит очень мило</h2>
          <p className="muted-text">Следи за калориями, БЖУ, водой, шагами и небольшими ежедневными вызовами без перегруза.</p>
        </div>
        <button className="primary-button" onClick={reload}>Обновить сводку</button>
      </section>

      <div className="dashboard-grid">
        <DashboardCard title="Дневная цель" value={`${data.goal} ккал`} subtitle={`Съедено ${data.consumed} • Осталось ${data.remaining}`}>
          <ProgressBar value={data.progress} label="Прогресс" />
        </DashboardCard>
        <DashboardCard title="Kitty mood" value={data.kittyMood.title} subtitle={data.kittyMood.message} className={`mood-${data.kittyMood.state}`} />
        <DashboardCard title="Вода" value={`${data.waterMl} мл`} subtitle={`Цель ${data.user.profile.waterGoalMl} мл`}>
          <ProgressBar value={(data.waterMl / data.user.profile.waterGoalMl) * 100} />
        </DashboardCard>
        <DashboardCard title="Шаги" value={`${data.steps}`} subtitle={`Цель ${data.user.profile.stepsGoal}`}>
          <ProgressBar value={(data.steps / data.user.profile.stepsGoal) * 100} accent="linear-gradient(90deg, #f7a6bd, #ffdfef)" />
        </DashboardCard>
      </div>

      <div className="dashboard-grid wide-grid dashboard-feature-grid">
        <DashboardCard title="БЖУ" subtitle="Нежный макро-баланс на сегодня">
          <div className="macro-row">
            <div className="macro-pill"><span>Белки</span><strong>{data.protein} г</strong></div>
            <div className="macro-pill"><span>Жиры</span><strong>{data.fat} г</strong></div>
            <div className="macro-pill"><span>Углеводы</span><strong>{data.carbs} г</strong></div>
          </div>
        </DashboardCard>
        <DashboardCard title="Sweet but balanced" value={`${data.sweetCalories} ккал`} subtitle="Подсчёт сладкого без токсичности" />
        <DashboardCard title="Daily streak" value={`${data.streak} дней`} subtitle={data.badges.join(' • ') || 'Начни серию мягких дней сегодня'} />
        <DashboardCard title="Daily challenge" value={data.challenge.title} subtitle={data.challenge.description} />
      </div>

      <div className="dashboard-grid wide-grid dashboard-feature-grid">
        <DashboardCard title="Balance summary">
          <div className="list-stack">
            {data.balanceSummary.map((item) => <div key={item} className="summary-line">{item}</div>)}
          </div>
        </DashboardCard>
        <DashboardCard title="Приёмы пищи за сегодня">
          <div className="list-stack">
            {data.entries.length === 0 && <div className="empty-box">Пока нет записей. Добавь первый приём пищи в дневник.</div>}
            {data.entries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="entry-row">
                <div>
                  <strong>{entry.name}</strong>
                  <span>{entry.mealCategory}</span>
                </div>
                <strong>{entry.calories} ккал</strong>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}
