import DashboardCard from '../components/DashboardCard'
import ProgressBar from '../components/ProgressBar'
import { api } from '../api/client'
import { useAsyncData } from '../hooks/useAsyncData'

export default function ProgressPage() {
  const { data: weights, loading: weightLoading, reload } = useAsyncData(() => api.get('/weight'), [])
  const { data: today } = useAsyncData(() => api.get('/stats/today'), [])

  const addWeight = async () => {
    const weightKg = window.prompt('Новый вес (кг)')
    if (!weightKg) return
    await api.post('/weight', { weightKg: Number(weightKg) })
    reload()
  }

  const saveSteps = async () => {
    const steps = window.prompt('Шаги за сегодня')
    if (!steps) return
    await api.post('/steps', { steps: Number(steps) })
    window.location.reload()
  }

  const addWater = async (amountMl) => {
    await api.post('/water', { amountMl })
    window.location.reload()
  }

  const latest = weights?.[weights.length - 1]
  const previous = weights?.[weights.length - 2]
  const delta = latest && previous ? (latest.weightKg - previous.weightKg).toFixed(1) : '0.0'

  return (
    <div className="page-stack">
      <section className="page-hero card soft-glow">
        <p className="eyebrow">Прогресс</p>
        <h2>Вес, вода и шаги в одном месте</h2>
        <p className="muted-text">Здесь удобно следить за мягким прогрессом тела и привычек без строгого admin-подхода.</p>
      </section>
      <div className="dashboard-grid">
        <DashboardCard title="Вес" value={latest ? `${latest.weightKg} кг` : 'Нет данных'} subtitle={`Изменение: ${delta} кг`}>
          <button className="primary-button" onClick={addWeight}>Добавить вес</button>
        </DashboardCard>
        <DashboardCard title="Шаги" value={`${today?.steps || 0}`} subtitle="Прогресс к цели">
          <ProgressBar value={((today?.steps || 0) / (today?.user?.profile?.stepsGoal || 1)) * 100} />
          <button className="ghost-button accent-soft" onClick={saveSteps}>Ввести шаги</button>
        </DashboardCard>
        <DashboardCard title="Вода" value={`${today?.waterMl || 0} мл`} subtitle="Нажми одну из быстрых кнопок">
          <div className="inline-actions">
            <button className="ghost-button accent-soft" onClick={() => addWater(250)}>+250 мл</button>
            <button className="ghost-button accent-soft" onClick={() => addWater(500)}>+500 мл</button>
            <button className="ghost-button danger" onClick={() => api.post('/water', { reset: true }).then(() => window.location.reload())}>Сбросить</button>
          </div>
        </DashboardCard>
      </div>
      <section className="card">
        <p className="eyebrow">История веса</p>
        {weightLoading && <div className="muted-text">Загрузка...</div>}
        <div className="weight-chart">
          {weights?.map((item) => (
            <div key={`${item.id}-${item.logDate}`} className="weight-bar-wrap">
              <div className="weight-bar" style={{ height: `${item.weightKg * 2.2}px` }} />
              <span>{item.weightKg}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
