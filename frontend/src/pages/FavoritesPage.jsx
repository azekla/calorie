import { api } from '../api/client'
import { useAsyncData } from '../hooks/useAsyncData'

export default function FavoritesPage() {
  const { data, loading, error, reload } = useAsyncData(() => api.get('/favorites'), [])

  const addToToday = async (item) => {
    await api.post('/entries', {
      name: item.name,
      grams: item.defaultGrams,
      calories: item.calories,
      protein: item.protein,
      fat: item.fat,
      carbs: item.carbs,
      mealCategory: item.category,
      isSweet: item.isSweet,
    })
    alert('Добавлено в сегодняшний дневник')
  }

  const remove = async (id) => {
    await api.delete(`/favorites/${id}`)
    reload()
  }

  return (
    <div className="page-stack">
      <section className="page-hero card soft-glow">
        <p className="eyebrow">Избранные продукты</p>
        <h2>Быстрый повтор любимых позиций</h2>
        <p className="muted-text">Нажми одну кнопку и любимый продукт уже окажется в сегодняшнем дневнике.</p>
      </section>
      <div className="card-grid">
        {loading && <div className="card">Загрузка...</div>}
        {error && <div className="error-box">{error}</div>}
        {data?.map((item) => (
          <div key={item.id} className="card favorite-card">
            <strong>{item.name}</strong>
            <span>{item.defaultGrams} г • {item.calories} ккал</span>
            <p className="muted-text">Б {item.protein} • Ж {item.fat} • У {item.carbs}</p>
            <div className="inline-actions">
              <button className="primary-button" onClick={() => addToToday(item)}>Добавить сегодня</button>
              <button className="ghost-button danger" onClick={() => remove(item.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
