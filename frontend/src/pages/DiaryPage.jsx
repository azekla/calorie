import { useEffect, useState } from 'react'
import FoodEntryForm from '../components/FoodEntryForm'
import ProgressRing from '../components/ProgressRing'
import DatePicker from '../components/DatePicker'
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

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(timer)
  }, [notice])

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
        setNotice('Добавлено!')
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
      setNotice('Шаблон сохранён')
      await reloadMeals()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const removeEntry = async (id) => {
    try {
      setActionError('')
      await api.delete(`/entries/${id}`)
      setNotice('Удалено')
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
      setNotice('Добавлено!')
      await reloadDiary()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const addMealToDate = async (mealId) => {
    try {
      setActionError('')
      await api.post(`/meals/${mealId}/add-to-day`, { date: selectedDate, category: quickCategory })
      setNotice('Добавлено!')
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

  const dateLabel = selectedDate === todayString() ? 'сегодня' : formatDate(selectedDate)
  const hasEntries = entries && entries.length > 0
  const hasRecent = recentEntries && recentEntries.length > 0
  const hasMeals = meals && meals.length > 0
  const hasQuickRepeats = hasRecent || hasMeals

  return (
    <div className="page-stack">
      {/* === 1. PRIMARY ACTION: Add food === */}
      <section className="card card-primary">
        <div className="row-space">
          <h2>Добавить еду</h2>
          <div className="datepicker-inline">
            <DatePicker value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} name="selectedDate" />
          </div>
        </div>
        {notice && <div className="notice-banner" style={{ marginTop: 8 }}>{notice}</div>}
        {actionError && <div className="error-box" style={{ marginTop: 8 }}>{actionError}</div>}
        {editing && (
          <div className="notice-banner" style={{ marginTop: 8 }} onClick={() => setEditing(null)}>
            Редактируется: {editing.name}. Нажми, чтобы отменить.
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          <FoodEntryForm initialValue={editing} defaultDate={selectedDate} onSubmit={saveEntry} onSaveTemplate={!editing ? saveTemplate : undefined} submitLabel={editing ? 'Сохранить' : 'Добавить'} />
        </div>
      </section>

      {/* === 2. PROGRESS: Ring + metrics === */}
      <section className="card">
        <div className="row-space" style={{ marginBottom: 16 }}>
          <p className="eyebrow" style={{ margin: 0 }}>{formatDate(selectedDate)}</p>
        </div>
        {summaryLoading ? <p className="muted-text">Загрузка...</p> : (
          <div className="progress-section">
            <ProgressRing consumed={summary?.consumed || 0} goal={summary?.goal || 2000} remaining={summary?.remaining || 0} />
            <div className="progress-metrics">
              <div className="metric-item">
                <span>Цель</span>
                <strong>{summary?.goal || 0}</strong>
              </div>
              <div className="metric-item accent">
                <span>Съедено</span>
                <strong>{summary?.consumed || 0}</strong>
              </div>
              <div className="metric-item">
                <span>Осталось</span>
                <strong>{summary?.remaining || 0}</strong>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* === 3. TODAY'S ENTRIES (hidden when empty) === */}
      {(loading || hasEntries) && (
        <section className="card">
          <div className="row-space">
            <h3>Сегодня в дневнике</h3>
            {hasEntries && <span className="badge-count">{entries.length}</span>}
          </div>
          {loading && <p className="muted-text" style={{ marginTop: 8 }}>Загрузка...</p>}
          {error && <div className="error-box" style={{ marginTop: 8 }}>{error}</div>}
          <div className="list-stack" style={{ marginTop: 8 }}>
            {entries?.map((entry) => (
              <div key={entry.id} className="entry-card">
                <div>
                  <strong>{entry.name}</strong>
                  <span>{entry.mealCategory} · {entry.grams} г · {entry.calories} ккал</span>
                </div>
                <div className="inline-actions">
                  <button className="ghost-button" onClick={() => setEditing(entry)}>Изменить</button>
                  <button className="ghost-button danger" onClick={() => removeEntry(entry.id)}>Удалить</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* === 4. QUICK REPEATS (hidden when both empty) === */}
      {(recentLoading || mealsLoading || hasQuickRepeats) && (
        <section className="card">
          <div className="row-space">
            <h3>Быстро добавить</h3>
            <label className="field-label quick-category-field">
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

          <div className="quick-repeat-grid" style={{ marginTop: 12 }}>
            {hasRecent && (
              <div>
                <p className="eyebrow">Недавние</p>
                <div className="list-stack" style={{ marginTop: 6 }}>
                  {recentEntries.map((entry) => (
                    <div key={`recent-${entry.id}`} className="entry-card compact-card">
                      <div>
                        <strong>{entry.name}</strong>
                        <span>{entry.calories} ккал</span>
                      </div>
                      <button className="ghost-button accent-soft" onClick={() => addRecentToDate(entry)}>+ {dateLabel}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasMeals && (
              <div>
                <p className="eyebrow">Шаблоны</p>
                <div className="list-stack" style={{ marginTop: 6 }}>
                  {meals.map((meal) => (
                    <div key={meal.id} className="entry-card compact-card">
                      <div>
                        <strong>{meal.name}</strong>
                        <span>{meal.totalCalories?.toFixed(0)} ккал</span>
                      </div>
                      <div className="inline-actions">
                        <button className="ghost-button accent-soft" onClick={() => addMealToDate(meal.id)}>+ {dateLabel}</button>
                        <button className="ghost-button danger" onClick={() => removeMeal(meal.id)}>Удалить</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
