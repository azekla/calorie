import { useState } from 'react'
import FoodEntryForm from '../components/FoodEntryForm'
import ProgressBar from '../components/ProgressBar'
import { api } from '../api/client'
import { useAsyncData } from '../hooks/useAsyncData'
import { formatDate, todayString } from '../utils/format'

export default function DiaryPage() {
  const [selectedDate, setSelectedDate] = useState(todayString())
  const [quickCategory, setQuickCategory] = useState('обед')
  const [editing, setEditing] = useState(null)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const { data: entries, loading, error, reload } = useAsyncData(() => api.get(`/entries?date=${selectedDate}`), [selectedDate])
  const { data: summary, loading: summaryLoading, reload: reloadSummary } = useAsyncData(() => api.get(`/stats/today?date=${selectedDate}`), [selectedDate])
  const { data: meals, loading: mealsLoading, error: mealsError, reload: reloadMeals } = useAsyncData(() => api.get('/meals'), [])
  const { data: recentEntries, loading: recentLoading, error: recentError, reload: reloadRecent } = useAsyncData(() => api.get('/entries/recent'), [])

  const reloadDiary = async () => {
    await Promise.all([reload(), reloadSummary(), reloadRecent()])
  }

  const saveEntry = async (payload) => {
    try {
      setActionError('')
      if (editing) {
        await api.put(`/entries/${editing.id}`, payload)
        setEditing(null)
        setNotice('Запись обновлена')
      } else {
        await api.post('/entries', payload)
        setNotice('Запись добавлена в дневник')
      }
      await reloadDiary()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const saveTemplate = async (payload) => {
    try {
      setActionError('')
      await api.post('/meals', {
        name: payload.name,
        description: payload.notes,
        items: [{
          name: payload.name,
          grams: payload.grams,
          calories: payload.calories,
          protein: payload.protein,
          fat: payload.fat,
          carbs: payload.carbs,
        }],
      })
      setNotice('Шаблон сохранён для быстрых повторов')
      await reloadMeals()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const removeEntry = async (id) => {
    try {
      setActionError('')
      await api.delete(`/entries/${id}`)
      setNotice('Запись удалена')
      await reloadDiary()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const addRecentToDate = async (entry) => {
    try {
      setActionError('')
      await api.post('/entries', {
        name: entry.name,
        grams: entry.grams,
        calories: entry.calories,
        protein: entry.protein,
        fat: entry.fat,
        carbs: entry.carbs,
        notes: entry.notes,
        isSweet: entry.isSweet,
        mealCategory: quickCategory || entry.mealCategory,
        entryDate: selectedDate,
      })
      setNotice('Прошлая запись добавлена на выбранный день')
      await reloadDiary()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const addMealToDate = async (mealId) => {
    try {
      setActionError('')
      await api.post(`/meals/${mealId}/add-to-day`, { date: selectedDate, category: quickCategory })
      setNotice('Шаблон блюда добавлен в дневник')
      await reloadDiary()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const removeMeal = async (mealId) => {
    try {
      setActionError('')
      await api.delete(`/meals/${mealId}`)
      setNotice('Шаблон удалён')
      await reloadMeals()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <div className="page-stack">
      <section className="card soft-glow">
        <div className="row-space diary-summary-head">
          <div>
            <p className="eyebrow">Дневник</p>
            <h2>{formatDate(selectedDate)}</h2>
            <p className="muted-text">Главный экран: добавление еды, дневная норма и быстрые повторы в одном месте.</p>
          </div>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>
        {summaryLoading ? <div className="muted-text">Считаем сводку дня...</div> : (
          <>
            <div className="dashboard-grid">
              <div className="macro-pill">
                <span>Цель</span>
                <strong>{summary?.goal || 0} ккал</strong>
              </div>
              <div className="macro-pill">
                <span>Съедено</span>
                <strong>{summary?.consumed || 0} ккал</strong>
              </div>
              <div className="macro-pill">
                <span>Осталось</span>
                <strong>{summary?.remaining || 0} ккал</strong>
              </div>
            </div>
            <div className="progress-wrap">
              <div className="progress-header">
                <strong>Прогресс за день</strong>
                <span className="muted-text">{summary?.progress || 0}%</span>
              </div>
              <ProgressBar value={summary?.progress || 0} label="Калории" />
            </div>
          </>
        )}
      </section>

      <div className="page-stack two-columns">
      <section className="card">
        <div className="row-space">
          <div>
            <p className="eyebrow">Новая запись</p>
            <h2>Добавь еду без лишних шагов</h2>
          </div>
        </div>
        {notice && <div className="notice-banner">{notice}</div>}
        {actionError && <div className="error-box">{actionError}</div>}
        <FoodEntryForm initialValue={editing} defaultDate={selectedDate} onSubmit={saveEntry} onSaveTemplate={saveTemplate} submitLabel={editing ? 'Сохранить изменения' : 'Добавить запись'} />
      </section>

      <section className="card">
        <p className="eyebrow">Записи дня</p>
        {loading && <div className="muted-text">Загружаем записи...</div>}
        {error && <div className="error-box">{error}</div>}
        {!loading && entries?.length === 0 && <div className="empty-box">День пока пустой. Можно начать с завтрака, воды или десерта.</div>}
        <div className="list-stack">
          {entries?.map((entry) => (
            <div key={entry.id} className="entry-card">
              <div>
                <strong>{entry.name}</strong>
                <span>{entry.mealCategory} • {entry.grams} г • {entry.calories} ккал</span>
              </div>
              <div className="inline-actions">
                <button className="ghost-button" onClick={() => setEditing(entry)}>Редактировать</button>
                <button className="ghost-button danger" onClick={() => removeEntry(entry.id)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      </div>

      <section className="card">
        <div className="row-space">
          <div>
            <p className="eyebrow">Быстрые повторы</p>
            <h3>Последние записи и сохранённые шаблоны</h3>
          </div>
          <label className="field-label quick-category-field">
            <span>Добавлять как</span>
            <select value={quickCategory} onChange={(e) => setQuickCategory(e.target.value)}>
              <option value="завтрак">Завтрак</option>
              <option value="обед">Обед</option>
              <option value="ужин">Ужин</option>
              <option value="перекус">Перекус</option>
              <option value="напитки">Напитки</option>
              <option value="сладкое">Сладкое</option>
            </select>
          </label>
        </div>

        <div className="dashboard-grid wide-grid">
          <div className="card inset-card">
            <p className="eyebrow">Последние записи</p>
            {recentLoading && <div className="muted-text">Загружаем быстрые повторы...</div>}
            {recentError && <div className="error-box">{recentError}</div>}
            {!recentLoading && recentEntries?.length === 0 && <div className="empty-box">Здесь появятся продукты, которые ты уже добавлял(а) раньше.</div>}
            <div className="list-stack">
              {recentEntries?.map((entry) => (
                <div key={`recent-${entry.id}`} className="entry-card compact-card">
                  <div>
                    <strong>{entry.name}</strong>
                    <span>{entry.grams} г • {entry.calories} ккал • {entry.mealCategory}</span>
                  </div>
                  <button className="primary-button" onClick={() => addRecentToDate(entry)}>Добавить на {selectedDate === todayString() ? 'сегодня' : formatDate(selectedDate)}</button>
                </div>
              ))}
            </div>
          </div>

          <div className="card inset-card">
            <p className="eyebrow">Мои шаблоны</p>
            {mealsLoading && <div className="muted-text">Загружаем шаблоны...</div>}
            {mealsError && <div className="error-box">{mealsError}</div>}
            {!mealsLoading && meals?.length === 0 && <div className="empty-box">Сохрани любую запись как шаблон, чтобы добавлять её потом в один клик.</div>}
            <div className="list-stack">
              {meals?.map((meal) => (
                <div key={meal.id} className="entry-card compact-card">
                  <div>
                    <strong>{meal.name}</strong>
                    <span>{meal.totalCalories?.toFixed(0)} ккал • Б {meal.totalProtein?.toFixed(1)} • Ж {meal.totalFat?.toFixed(1)} • У {meal.totalCarbs?.toFixed(1)}</span>
                    {meal.description && <p className="muted-text">{meal.description}</p>}
                  </div>
                  <div className="inline-actions">
                    <button className="primary-button" onClick={() => addMealToDate(meal.id)}>Добавить на {selectedDate === todayString() ? 'сегодня' : formatDate(selectedDate)}</button>
                    <button className="ghost-button danger" onClick={() => removeMeal(meal.id)}>Удалить</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
