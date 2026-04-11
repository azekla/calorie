import MealBuilder from '../components/MealBuilder'
import { api } from '../api/client'
import { useAsyncData } from '../hooks/useAsyncData'

export default function MealsPage() {
  const { data, loading, error, reload } = useAsyncData(() => api.get('/meals'), [])

  const saveMeal = async (payload) => {
    await api.post('/meals', payload)
    reload()
  }

  const addToToday = async (id) => {
    await api.post(`/meals/${id}/add-to-day`, { category: 'обед' })
    alert('Шаблон добавлен в дневник')
  }

  const remove = async (id) => {
    await api.delete(`/meals/${id}`)
    reload()
  }

  return (
    <div className="page-stack">
      <MealBuilder onSave={saveMeal} />
      <section className="card">
        <p className="eyebrow">Сохранённые блюда</p>
        <h2>Шаблоны для быстрого добавления</h2>
        <p className="muted-text">Собери блюдо один раз и добавляй его в день без повторного ввода.</p>
        {loading && <div className="muted-text">Загружаем шаблоны...</div>}
        {error && <div className="error-box">{error}</div>}
        <div className="list-stack">
          {data?.map((meal) => (
            <div key={meal.id} className="entry-card">
              <div>
                <strong>{meal.name}</strong>
                <span>{meal.totalCalories.toFixed(0)} ккал • Б {meal.totalProtein.toFixed(1)} • Ж {meal.totalFat.toFixed(1)} • У {meal.totalCarbs.toFixed(1)}</span>
                <p className="muted-text">{meal.items.map((item) => item.name).join(', ')}</p>
              </div>
              <div className="inline-actions">
                <button className="primary-button" onClick={() => addToToday(meal.id)}>Добавить в день</button>
                <button className="ghost-button danger" onClick={() => remove(meal.id)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
