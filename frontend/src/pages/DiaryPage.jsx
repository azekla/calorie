import { useState } from 'react'
import FoodEntryForm from '../components/FoodEntryForm'
import { api } from '../api/client'
import { useAsyncData } from '../hooks/useAsyncData'
import { todayString } from '../utils/format'

export default function DiaryPage() {
  const [selectedDate, setSelectedDate] = useState(todayString())
  const [editing, setEditing] = useState(null)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const { data, loading, error, reload } = useAsyncData(() => api.get(`/entries?date=${selectedDate}`), [selectedDate])

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
      reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  const removeEntry = async (id) => {
    try {
      setActionError('')
      await api.delete(`/entries/${id}`)
      setNotice('Запись удалена')
      reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <div className="page-stack two-columns">
      <section className="card">
        <div className="row-space">
          <div>
            <p className="eyebrow">Дневник питания</p>
            <h2>Добавь продукт за 1-2 клика</h2>
          </div>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>
        {notice && <div className="notice-banner">{notice}</div>}
        {actionError && <div className="error-box">{actionError}</div>}
        <FoodEntryForm initialValue={editing} onSubmit={saveEntry} submitLabel={editing ? 'Сохранить изменения' : 'Добавить запись'} />
      </section>

      <section className="card">
        <p className="eyebrow">Записи дня</p>
        {loading && <div className="muted-text">Загружаем записи...</div>}
        {error && <div className="error-box">{error}</div>}
        {!loading && data?.length === 0 && <div className="empty-box">День пока пустой. Можно начать с завтрака, воды или десерта.</div>}
        <div className="list-stack">
          {data?.map((entry) => (
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
  )
}
